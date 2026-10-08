import jwt
from functools import wraps
from sanic.exceptions import Unauthorized, Forbidden
from auth.jwt_utils import decode_token


def get_current_user(request) -> dict:
    """
    Extract and validate the JWT from the Authorization header.
    Returns {"id": int, "role": str, "email": str} or raises Unauthorized.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise Unauthorized("Missing or malformed Authorization header")

    token = auth_header.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token expired")
    except jwt.InvalidTokenError:
        raise Unauthorized("Invalid token")

    return {"id": int(payload["sub"]), "role": payload["role"], "email": payload["email"]}


def require_authentication(handler):
    """Decorator: attaches request.ctx.user, or raises 401."""
    @wraps(handler)
    async def wrapper(request, *args, **kwargs):
        request.ctx.user = get_current_user(request)
        return await handler(request, *args, **kwargs)
    return wrapper


def require_manager(handler):
    """Decorator: requires an authenticated manager, or raises 401/403."""
    @wraps(handler)
    async def wrapper(request, *args, **kwargs):
        user = get_current_user(request)
        if user["role"] != "manager":
            raise Forbidden("Manager role required")
        request.ctx.user = user
        return await handler(request, *args, **kwargs)
    return wrapper
