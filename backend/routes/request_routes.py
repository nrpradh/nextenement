from sanic import Blueprint, response
from sanic.exceptions import NotFound, Forbidden
from pydantic import ValidationError
from schemas.request_schemas import (
    CreateRequestSchema, UpdateRequestSchema, StatusUpdateSchema, PriorityUpdateSchema,
)
from auth.deps import require_authentication
from database import get_pool

requests_bp = Blueprint("requests", url_prefix="/requests")


def serialize(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "priority": row["priority"],
        "unit_number": row["unit_number"],
        "status": row["status"],
        "submitted_by": row["submitted_by"],
        "assigned_to": row["assigned_to"],
        "created_at": row["created_at"].isoformat(),
        "updated_at": row["updated_at"].isoformat(),
    }


async def fetch_request_or_404(conn, request_id: int):
    row = await conn.fetchrow("SELECT * FROM maintenance_requests WHERE id = $1", request_id)
    if not row:
        raise NotFound("Request not found")
    return row


@requests_bp.get("/")
@require_authentication
async def list_requests(request):
    user = request.ctx.user
    pool = get_pool()

    conditions = []
    params = []

    def add_param(value):
        params.append(value)
        return f"${len(params)}"

    if user["role"] == "tenant":
        conditions.append(f"submitted_by = {add_param(user['id'])}")
    else:
        status = request.args.get("status")
        priority = request.args.get("priority")
        category = request.args.get("category")
        search = request.args.get("search")

        if status:
            conditions.append(f"status = {add_param(status)}")
        if priority:
            conditions.append(f"priority = {add_param(priority)}")
        if category:
            conditions.append(f"category = {add_param(category)}")
        if search:
            idx = add_param(f"%{search}%")
            conditions.append(f"(unit_number ILIKE {idx} OR title ILIKE {idx})")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"SELECT * FROM maintenance_requests {where_clause} ORDER BY created_at DESC"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)

    return response.json([serialize(r) for r in rows])


@requests_bp.post("/")
@require_authentication
async def create_request(request):
    user = request.ctx.user
    try:
        data = CreateRequestSchema(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO maintenance_requests
                (title, description, category, priority, unit_number, status, submitted_by)
            VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
            RETURNING *
            """,
            data.title, data.description, data.category, data.priority,
            data.unit_number, user["id"],
        )

    return response.json(serialize(row), status=201)


@requests_bp.get("/<request_id:int>")
@require_authentication
async def get_request(request, request_id: int):
    user = request.ctx.user
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await fetch_request_or_404(conn, request_id)

    if user["role"] == "tenant" and row["submitted_by"] != user["id"]:
        raise Forbidden("You may only view your own requests")

    return response.json(serialize(row))


@requests_bp.put("/<request_id:int>")
@require_authentication
async def update_request(request, request_id: int):
    user = request.ctx.user
    try:
        data = UpdateRequestSchema(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        existing = await fetch_request_or_404(conn, request_id)

        if user["role"] != "manager":
            if existing["submitted_by"] != user["id"]:
                raise Forbidden("You may only edit your own requests")
            if existing["status"] != "Pending":
                raise Forbidden("Only pending requests can be edited")

        row = await conn.fetchrow(
            """
            UPDATE maintenance_requests
            SET title = $1, description = $2, category = $3, priority = $4,
                unit_number = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *
            """,
            data.title, data.description, data.category, data.priority,
            data.unit_number, request_id,
        )

    return response.json(serialize(row))


@requests_bp.delete("/<request_id:int>")
@require_authentication
async def delete_request(request, request_id: int):
    user = request.ctx.user
    pool = get_pool()
    async with pool.acquire() as conn:
        existing = await fetch_request_or_404(conn, request_id)

        if user["role"] != "manager":
            if existing["submitted_by"] != user["id"]:
                raise Forbidden("You may only delete your own requests")
            if existing["status"] != "Pending":
                raise Forbidden("Only pending requests can be cancelled")

        await conn.execute("DELETE FROM maintenance_requests WHERE id = $1", request_id)

    return response.json({"message": "Request deleted"})


@requests_bp.patch("/<request_id:int>/status")
@require_authentication
async def update_status(request, request_id: int):
    user = request.ctx.user
    if user["role"] != "manager":
        raise Forbidden("Only managers can change status")

    try:
        data = StatusUpdateSchema(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        await fetch_request_or_404(conn, request_id)
        row = await conn.fetchrow(
            "UPDATE maintenance_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            data.status, request_id,
        )

    return response.json(serialize(row))


@requests_bp.patch("/<request_id:int>/priority")
@require_authentication
async def update_priority(request, request_id: int):
    user = request.ctx.user
    if user["role"] != "manager":
        raise Forbidden("Only managers can change priority")

    try:
        data = PriorityUpdateSchema(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        await fetch_request_or_404(conn, request_id)
        row = await conn.fetchrow(
            "UPDATE maintenance_requests SET priority = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            data.priority, request_id,
        )

    return response.json(serialize(row))


@requests_bp.patch("/<request_id:int>/assign")
@require_authentication
async def assign_to_self(request, request_id: int):
    """Manager assigns the request to themselves. assigned_to always derives from the JWT."""
    user = request.ctx.user
    if user["role"] != "manager":
        raise Forbidden("Only managers can assign requests")

    pool = get_pool()
    async with pool.acquire() as conn:
        await fetch_request_or_404(conn, request_id)
        row = await conn.fetchrow(
            "UPDATE maintenance_requests SET assigned_to = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            user["id"], request_id,
        )

    return response.json(serialize(row))
