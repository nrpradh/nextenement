"""
Seed the database with demo users and a few sample requests.

Run from backend/ with:
    python -m models.seed
"""
import asyncio
import bcrypt
import asyncpg
from config import DATABASE_URL


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


async def seed():
    conn = await asyncpg.connect(dsn=DATABASE_URL)
    try:
        with open("models/schema.sql", "r") as f:
            await conn.execute(f.read())

        manager_id = await conn.fetchval(
            """
            INSERT INTO users (name, email, password_hash, role, unit_number)
            VALUES ($1, $2, $3, 'manager', NULL)
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            """,
            "Morgan Manager", "manager@example.com", hash_pw("password123"),
        )

        tenant_id = await conn.fetchval(
            """
            INSERT INTO users (name, email, password_hash, role, unit_number)
            VALUES ($1, $2, $3, 'tenant', $4)
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            """,
            "Taylor Tenant", "tenant@example.com", hash_pw("password123"), "203",
        )

        existing = await conn.fetchval("SELECT COUNT(*) FROM maintenance_requests")
        if existing == 0:
            await conn.execute(
                """
                INSERT INTO maintenance_requests
                    (title, description, category, priority, unit_number, status, submitted_by, assigned_to)
                VALUES
                    ('Leaking kitchen faucet', 'Faucet drips constantly, wasting water.', 'Plumbing', 'Medium', '203', 'Pending', $1, NULL),
                    ('AC not cooling', 'AC unit runs but blows warm air.', 'AC', 'High', '203', 'In Progress', $1, $2),
                    ('Flickering hallway light', 'Light outside unit flickers at night.', 'Electrical', 'Low', '203', 'Resolved', $1, $2)
                """,
                tenant_id, manager_id,
            )

        print("Seed complete.")
        print("Manager login: manager@example.com / password123")
        print("Tenant login:  tenant@example.com / password123")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
