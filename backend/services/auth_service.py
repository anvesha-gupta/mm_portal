from __future__ import annotations

import os
from datetime import datetime
from typing import Any
from uuid import uuid4

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from core.security import create_access_token, decode_access_token

# ============================================================
# Azure AD Configuration
# ============================================================

AZURE_TENANT_ID = os.environ["AZURE_TENANT_ID"]
AZURE_CLIENT_ID = os.environ["AZURE_CLIENT_ID"]

AZURE_ISSUER = (
    f"https://login.microsoftonline.com/"
    f"{AZURE_TENANT_ID}/v2.0"
)

JWKS_URL = (
    f"https://login.microsoftonline.com/"
    f"{AZURE_TENANT_ID}/discovery/v2.0/keys"
)

jwks_client = PyJWKClient(JWKS_URL)

# ============================================================
# Verify Azure Access Token
# ============================================================

def verify_azure_token(token: str) -> dict[str, Any]:

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(
            token
        ).key

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience=AZURE_CLIENT_ID,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": True,
            }
        )

        return payload

    except Exception as ex:
        print("AZURE TOKEN ERROR:", ex)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Microsoft authentication token.",
        )


# ============================================================
# Read Microsoft Graph Profile
# ============================================================
class AuthService:

    def __init__(self, db: Session):
        self.db = db
    # =====================================================
    # MICROSOFT LOGIN
    # =====================================================

    def login(
        self,
        role: str,
        azure_token: str,
    ) -> dict[str, Any]:

        # -------------------------------------------------
        # Validate selected demo role
        # -------------------------------------------------

        allowed_roles = {
            "employee",
            "finance",
            "hr",
            "admin",
        }

        role = role.lower().strip()

        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected.",
            )

        # -------------------------------------------------
        # Verify Azure Token
        # -------------------------------------------------

        payload = verify_azure_token(azure_token)

        # -------------------------------------------------
        # Read Microsoft Profile (from verified token claims)
        # -------------------------------------------------

        user_id = (
            payload.get("oid")
            or payload.get("sub")
            or str(uuid4())
         )

        email = (
            payload.get("preferred_username")
            or payload.get("email")
            or ""
        )

        display_name = (
            payload.get("name")
            or email
            or "Microsoft User"
        )

        role_names = {
            "employee": "Standard Employee",
            "finance": "Finance",
            "hr": "Human Resources",
            "admin": "IT Administrator",
        }

        # -------------------------------------------------
        # Create Portal JWT
        # -------------------------------------------------

        token = create_access_token(
            {
                "sub": user_id,
                "email": email,
                "display_name": display_name,
                "role": role,
            }
        )

        # -------------------------------------------------
        # Return Login Response
        # -------------------------------------------------

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": email,
                "display_name": display_name,
                "department": role.upper(),
                "title": role_names[role],
                "role_id": role,
                "role_label": role_names[role],
                "is_active": True,
                "last_login_at": None,
            },
        }
# =========================================================
# CURRENT USER FROM PORTAL JWT
# =========================================================

def get_current_user(db: Session, token: str):

    try:
        payload = decode_access_token(token)

        class DemoRole:
            def __init__(self, label: str):
                self.label = label

        class DemoUser:
            pass

        role_labels = {
            "employee": "Standard Employee",
            "finance": "Finance",
            "hr": "Human Resources",
            "admin": "IT Administrator",
        }

        role = payload.get("role", "employee")

        user = DemoUser()

        user.id = payload.get("sub")
        user.email = payload.get("email")
        user.display_name = payload.get("display_name")

        user.department = role.upper()
        user.title = role_labels.get(role, role)

        user.role_id = role
        user.role = DemoRole(
            role_labels.get(role, role)
        )

        user.is_active = True
        user.last_login_at = datetime.utcnow()

        return user

    except Exception as ex:

        print("JWT ERROR:", ex)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
    