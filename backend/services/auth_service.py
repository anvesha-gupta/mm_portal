from __future__ import annotations

import os
from datetime import datetime
from typing import Any

import jwt
from fastapi import HTTPException, status
<<<<<<< HEAD
from jwt import PyJWKClient
=======
from sqlalchemy import text
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf
from sqlalchemy.orm import Session

from core.security import create_access_token, decode_access_token

# ============================================================
# Azure AD Configuration
# ============================================================

<<<<<<< HEAD
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
=======
# Maps frontend demo role → DB role_id
_DB_ROLE_MAP = {
    "employee": "employee",
    "finance":  "finance",
    "hr":       "hr",
    "admin":    "it_admin",
}


>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf
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

        role = role.lower().strip()

        if role not in _DB_ROLE_MAP:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role selected.",
            )

<<<<<<< HEAD
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
=======
        db_role = _DB_ROLE_MAP[role]
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf

        # Fetch the real DB user for this role so user_points FK is satisfied
        row = self.db.execute(
            text(
                "SELECT id, email, display_name "
                "FROM mm_portal.users "
                "WHERE role_id = :role_id AND is_active = true "
                "LIMIT 1"
            ),
            {"role_id": db_role},
        ).mappings().first()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active user found for role '{role}'. Seed the users table first.",
            )

        user_id     = str(row["id"])
        email       = row["email"]
        display_name = row["display_name"]

        # -------------------------------------------------
        # Create Portal JWT
        # -------------------------------------------------

        token = create_access_token(
            {
<<<<<<< HEAD
                "sub": user_id,
                "email": email,
                "display_name": display_name,
                "role": role,
=======
                "sub":          user_id,
                "role":         role,          # normalized role for frontend permission checks
                "email":        email,
                "display_name": display_name,
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf
            }
        )

        # -------------------------------------------------
        # Return Login Response
        # -------------------------------------------------

        return {
            "access_token": token,
            "token_type":   "bearer",
            "user": {
<<<<<<< HEAD
                "id": user_id,
                "email": email,
                "display_name": display_name,
                "department": role.upper(),
                "title": role_names[role],
                "role_id": role,
                "role_label": role_names[role],
                "is_active": True,
=======
                "id":           user_id,
                "email":        email,
                "display_name": display_name,
                "department":   role.upper(),
                "title":        display_name,
                "role_id":      role,
                "role_label":   display_name,
                "is_active":    True,
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf
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

<<<<<<< HEAD
        user.id = payload.get("sub")
        user.email = payload.get("email")
        user.display_name = payload.get("display_name")

        user.department = role.upper()
        user.title = role_labels.get(role, role)

        user.role_id = role
        user.role = DemoRole(
            role_labels.get(role, role)
        )
=======
        user.id           = payload["sub"]
        user.email        = payload["email"]
        user.display_name = payload["display_name"]

        user.department   = payload["role"].upper()
        user.title        = payload["display_name"]

        user.role_id      = payload["role"]
        user.role         = DemoRole(payload["display_name"])
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf

        user.is_active    = True
        user.last_login_at = datetime.utcnow()

        return user

    except Exception as ex:

        print("JWT ERROR:", ex)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
<<<<<<< HEAD
    
=======
>>>>>>> 79c14097037e99f2b4f2adb2f3bde93dcd0000cf
