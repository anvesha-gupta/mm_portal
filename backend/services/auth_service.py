from __future__ import annotations

import os
import json
import urllib.request
from typing import Any

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.user import User
from services.rbac_service import get_user_by_id
from core.security import create_access_token, decode_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # =========================================================
    # LOGIN ENTRY POINT
    # =========================================================
    def login(self, username: str, password: str) -> dict[str, Any]:

        app_env = (os.getenv("APP_ENV") or "local").lower()

        print("\n========== LOGIN DEBUG ==========")
        print("ENV:", app_env)
        print("USERNAME:", repr(username))
        print("PASSWORD:", repr(password))
        print("=================================\n")

        # =====================================================
        # LOCAL LOGIN (HARD CODED FOR TESTING)
        # =====================================================
        if app_env == "local":

            # force strip to avoid frontend whitespace issues
            username = (username or "").strip()
            password = (password or "").strip()

            if username == "admin" and password == "abc":

                user_id = "00000000-0000-0000-0000-000000000001"

                token = create_access_token(subject=user_id)

                return {
                    "access_token": token,
                    "token_type": "bearer",

                    # IMPORTANT: frontend-safe flat structure
                    "user": {
                        "id": user_id,
                        "email": "admin@local.dev",
                        "display_name": "Administrator",
                        "department": "IT",
                        "title": "System Admin",
                        "role_id": "ADMIN",
                        "role_label": "Admin",
                        "is_active": True,
                        "last_login_at": None,
                    }
                }

            # IMPORTANT: explicit error (frontend can read this cleanly)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        # =====================================================
        # PROD (AZURE AD PLACEHOLDER)
        # =====================================================
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Azure AD login not enabled in local build",
        )


# =========================================================
# AZURE HELPERS (KEEP FOR LATER)
# =========================================================
def _fetch_azure_openid_config(tenant_id: str) -> dict[str, Any]:
    url = f"https://login.microsoftonline.com/{tenant_id}/v2.0/.well-known/openid-configuration"
    with urllib.request.urlopen(url, timeout=10) as r:
        return json.loads(r.read().decode())


def _validate_azure_token(token: str, tenant_id: str, client_id: str) -> dict[str, Any]:
    config = _fetch_azure_openid_config(tenant_id)
    jwks = PyJWKClient(config["jwks_uri"])
    key = jwks.get_signing_key_from_jwt(token)

    return jwt.decode(
        token,
        key.key,
        algorithms=["RS256"],
        audience=client_id,
        issuer=config["issuer"],
    )


def _find_azure_user(db: Session, payload: dict[str, Any]):
    oid = payload.get("oid")

    if oid:
        return db.query(User).filter(User.azure_oid == oid).first()

    email = payload.get("preferred_username") or payload.get("email")

    if email:
        return db.query(User).filter(User.email.ilike(email)).first()

    return None


def get_current_user(db: Session, token: str):
    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")

        if sub == "00000000-0000-0000-0000-000000000001":

            class LocalUser:
                id = sub
                email = "admin@local.dev"
                display_name = "Administrator"
                department = "IT"
                title = "System Admin"
                role_id = "ADMIN"
                role = type("R", (), {"label": "Admin"})()
                is_active = True
                last_login_at = None

            return LocalUser()

        return get_user_by_id(db, sub)

    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token",
    )