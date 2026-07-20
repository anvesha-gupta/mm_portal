# MotiveMinds Portal — Frontend

React + TypeScript single-page application for the MotiveMinds employee portal.

## Tech Stack

- **React 18** with TypeScript 5
- **Vite 5** (SWC) — dev server and build tool
- **MUI v5** (Material UI) — component library
- **React Router v6** — client-side routing
- **Axios** — HTTP client
- **Azure MSAL** (`@azure/msal-browser`) — Microsoft SSO

---

## Prerequisites

- Node.js v20+
- npm v9+
- Local HTTPS certificates (required — the dev server runs on HTTPS)

---

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Generate local HTTPS certificates

The dev server requires HTTPS (needed for MSAL redirect). Use [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# Install mkcert (once per machine)
choco install mkcert        # Windows
brew install mkcert         # macOS

mkcert -install
mkdir certs
cd certs
mkcert localhost
```

This creates `localhost.pem` and `localhost-key.pem` inside `frontend/certs/`.

### 3. Configure environment variables

The file `frontend/.env.local` already exists with local dev values. Verify it contains:

```env
VITE_APP_ENV=local
VITE_AZURE_CLIENT_ID=695cc361-aa53-4497-9475-494102ee515b
VITE_AZURE_TENANT_ID=d50ce059-5bef-4057-a119-04564af61002
VITE_AZURE_REDIRECT_URI=https://localhost:5173
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> All five variables are required. The app will throw an error at startup if `VITE_AZURE_CLIENT_ID` or `VITE_AZURE_TENANT_ID` are missing.

### 4. Start the dev server

```bash
npm run dev
```

Opens automatically at **https://localhost:5173**

---

## Login Modes

| `VITE_APP_ENV` | Behaviour |
|---|---|
| `local` | Role dropdown shown — select Employee / Finance / HR / IT Admin |
| `production` | Role dropdown hidden — Microsoft SSO only |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at https://localhost:5173 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_APP_ENV` | `local` or `production` — controls login mode |
| `VITE_AZURE_CLIENT_ID` | Azure AD app registration client ID |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID |
| `VITE_AZURE_REDIRECT_URI` | OAuth redirect URI (must match Azure app registration) |
| `VITE_API_BASE_URL` | Base URL of the backend API |

---

## Production Build

```bash
npm run build
```

Output goes to `frontend/dist/`. Serve the contents of `dist/` with any static hosting provider. Make sure `VITE_APP_ENV=production` is set at build time via `frontend/.env.production`.
