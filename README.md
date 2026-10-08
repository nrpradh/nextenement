# Apartment Maintenance MVP

A small full-stack app for tenants to submit maintenance requests and managers to triage them.
Built as a 1-week learning MVP — kept intentionally simple.

## 1. Overview

Two roles:

- **Tenant** — submit and track their own requests; edit/cancel while `Pending`.
- **Manager** — see all requests, filter/search, change status & priority, assign to self, resolve.

## 2. Tech stack

**Frontend:** React, React Router, TanStack Query, React Hook Form + Zod, Chakra UI, Tailwind CSS, Recharts.
**Backend:** Python, Sanic, Pydantic, PostgreSQL (via `asyncpg`), JWT auth (`PyJWT` + `bcrypt`).

## 3. Architecture

React SPA → REST JSON API (Sanic) → PostgreSQL.
JWT issued on login/register, sent as `Authorization: Bearer <token>` on every authenticated request.
**All authorization is enforced server-side** in route handlers (`require_authentication`, `require_manager`,
and per-row ownership checks) — the frontend only hides buttons for UX, it is never the source of truth.

## 4. Folder structure

```
backend/
├── app.py            # Sanic app + route registration + error handlers
├── config.py          # env var loading
├── database.py         # asyncpg pool lifecycle
├── models/              # schema.sql, seed.py
├── schemas/               # Pydantic request/response models
├── routes/                  # auth_routes.py, request_routes.py
├── auth/                      # jwt_utils.py, deps.py
└── requirements.txt

frontend/
├── src/
│   ├── api/            # axios client + endpoint functions
│   ├── auth/             # AuthContext, ProtectedRoute
│   ├── components/         # Navbar, RequestsTable, badges, charts, filters
│   ├── hooks/                # useRequests.js (TanStack Query hooks)
│   ├── pages/                  # Login, Register, Dashboard, Requests, NewRequest, RequestDetail
│   ├── App.jsx, main.jsx
├── package.json
```

## 5. Database setup

Requires a running PostgreSQL instance.

```bash
createdb apartment_maintenance
```

Tables (see `backend/models/schema.sql`):

- **users**: `id, name, email (unique), password_hash, role (tenant|manager), unit_number, created_at`
- **maintenance_requests**: `id, title, description, category, priority, unit_number, status, submitted_by (FK→users), assigned_to (FK→users), created_at, updated_at`

Schema is applied automatically by the seed script (see below), or manually with:

```bash
psql apartment_maintenance -f backend/models/schema.sql
```

## 6. Environment variables

Copy the example files and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/apartment_maintenance
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_HOURS=24
PORT=8000
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

Never commit real `.env` files — only `.env.example` is tracked.

## 7. Installation

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## 8. Running

**Backend** (applies schema + demo data, then starts the API on port 8000):
```bash
cd backend
python -m models.seed      # creates tables + demo users/requests
python app.py               # dev server with auto-reload
```

**Frontend** (starts Vite dev server on port 5173):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`.

## 9. API endpoints

```
POST   /auth/register
POST   /auth/login

GET    /requests                 (tenant: own only; manager: all, filterable)
POST   /requests
GET    /requests/:id
PUT    /requests/:id
DELETE /requests/:id

PATCH  /requests/:id/status       (manager only)
PATCH  /requests/:id/priority     (manager only)
PATCH  /requests/:id/assign       (manager only — assigns to self)
```

Manager list filters (combinable): `?status=&priority=&category=&search=`
(`search` matches unit number or title). Default sort: `created_at DESC`.

All authenticated routes require `Authorization: Bearer <jwt>`.

## 10. Demo credentials

| Role    | Email                | Password    |
|---------|-----------------------|-------------|
| Manager | manager@example.com  | password123 |
| Tenant  | tenant@example.com   | password123 |

Created by `python -m models.seed`, along with three sample requests.

## 11. MVP limitations

This is a learning MVP, not a production system. Deliberately **not** included:
payments, email/notification systems, chat, image uploads, multiple properties/companies,
technician accounts, real-time updates/WebSockets, a mobile app, complex analytics/reporting,
file storage, or a full admin panel. Passwords are hashed with bcrypt and JWTs are used for
auth, but this has not had a security audit and should not be used as-is in production
(e.g. no rate limiting, no refresh tokens, no password reset flow).
