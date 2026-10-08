from sanic import Blueprint, response
from pydantic import ValidationError
from schemas.auth_schemas import RegisterRequest, LoginRequest
from auth.jwt_utils import hash_password, verify_password, create_token
from database import get_pool

auth_bp = Blueprint("auth", url_prefix="/auth")


@auth_bp.post("/register")
async def register(request):
    try:
        data = RegisterRequest(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchval("SELECT id FROM users WHERE email = $1", data.email)
        if existing:
            return response.json({"error": "Email already registered"}, status=409)

        row = await conn.fetchrow(
            """
            INSERT INTO users (name, email, password_hash, role, unit_number)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, unit_number, created_at
            """,
            data.name, data.email, hash_password(data.password), data.role, data.unit_number,
        )

    token = create_token(row["id"], row["role"], row["email"])
    return response.json({
        "token": token,
        "user": {
            "id": row["id"], "name": row["name"], "email": row["email"],
            "role": row["role"], "unit_number": row["unit_number"],
        },
    }, status=201)


@auth_bp.post("/login")
async def login(request):
    try:
        data = LoginRequest(**request.json)
    except ValidationError as e:
        return response.json({"error": "Validation failed", "details": e.errors()}, status=422)
    except (TypeError, AttributeError):
        return response.json({"error": "Invalid JSON body"}, status=400)

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, email, password_hash, role, unit_number FROM users WHERE email = $1",
            data.email,
        )

    if not row or not verify_password(data.password, row["password_hash"]):
        return response.json({"error": "Invalid email or password"}, status=401)

    token = create_token(row["id"], row["role"], row["email"])
    return response.json({
        "token": token,
        "user": {
            "id": row["id"], "name": row["name"], "email": row["email"],
            "role": row["role"], "unit_number": row["unit_number"],
        },
    })
