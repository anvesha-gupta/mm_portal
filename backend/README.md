# MotiveMinds Portal — Backend

FastAPI REST API for the MotiveMinds employee portal.

## Tech Stack

- **Python 3.13**
- **FastAPI 0.116** — API framework
- **Uvicorn** — ASGI server
- **SQLAlchemy 2.0** — ORM
- **Alembic** — database migrations
- **PostgreSQL** — database (psycopg v3 driver)
- **PyJWT** — JWT token handling
- **Azure AD JWKS** — Microsoft SSO token validation (production)

---

## Prerequisites

- Python 3.11+
- pip
- Access to the PostgreSQL database (connection string required)

---

## Setup

### 1. Create and activate a virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/mm_portal
AZURE_TENANT_ID=d50ce059-5bef-4057-a119-04564af61002
AZURE_CLIENT_ID=695cc361-aa53-4497-9475-494102ee515b
APP_ENV=local
JWT_SECRET_KEY=your-secret-key-here
```

> `DATABASE_URL` is required — the app will crash on startup without it.

### 4. Run database migrations

From the **repo root** (where `alembic.ini` lives):

```bash
alembic upgrade head
```

### 5. Start the server

```bash
cd backend
uvicorn main:app --reload
```

API is available at **http://127.0.0.1:8000**
Interactive API docs at **http://127.0.0.1:8000/docs**

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `AZURE_TENANT_ID` | Yes | — | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Yes | — | Azure AD app registration client ID |
| `APP_ENV` | No | `local` | `local` = role-based mock login; `production` = Azure SSO required |
| `JWT_SECRET_KEY` | No | `development-secret-key` | Secret for signing internal JWTs — **set a strong value in production** |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | JWT expiry duration |
| `CORS_ALLOWED_ORIGINS` | No | localhost defaults | Comma-separated list of allowed CORS origins |
| `OPENAI_API_KEY` | No | — | Required for GPT-4o in Playbench; mock response used if absent |
| `ANTHROPIC_API_KEY` | No | — | Required for Claude in Playbench; mock response used if absent |

---

## Login Modes

| `APP_ENV` | Behaviour |
|---|---|
| `local` | Accepts a `role` field in the login request and returns a token for the first DB user with that role — no Azure token needed |
| `production` | Requires a valid Azure AD ID token (`azure_token`), validates it against Microsoft's JWKS endpoint, and looks up the user by email |

---

## API Overview

| Prefix | Description |
|---|---|
| `/auth` | Login, logout, current user |
| `/api/apps` | App catalogue |
| `/api/users` | User management |
| `/api/roles` | Role management |
| `/api/role_app_permissions` | Role-level app access |
| `/api/user_app_overrides` | Per-user app access overrides |
| `/api/user_points` | Employee points balances |
| `/api/points_transactions` | Points transaction history |
| `/api/swag_items` | Swag store catalogue |
| `/api/swag_redemptions` | Swag redemption requests |
| `/playbench` | AI Playbench chat sessions |
| `/admin/llm` | LLM model and assignment management |
| `/api/employee_assignments` | LLM-to-employee assignments |
| `/api/audit_log` | Audit trail |

Full interactive documentation: **http://127.0.0.1:8000/docs**

---

## Database

- Engine: PostgreSQL
- Schema: `mm_portal`
- Migrations managed by Alembic — run `alembic upgrade head` after pulling new changes
