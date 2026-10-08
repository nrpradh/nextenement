import asyncpg
from config import DATABASE_URL

_pool: asyncpg.Pool | None = None


async def init_db_pool(app, loop):
    global _pool
    _pool = await asyncpg.create_pool(dsn=DATABASE_URL, min_size=1, max_size=10)
    app.ctx.db = _pool


async def close_db_pool(app, loop):
    global _pool
    if _pool:
        await _pool.close()


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool not initialized")
    return _pool
