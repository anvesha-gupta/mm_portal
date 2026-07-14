from __future__ import annotations

import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user as get_current_user_dependency
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    TokenResponse,
    UserResponse,
)
from services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==========================================================
# LOGIN
# ==========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login",
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:

    service = AuthService(db)
    app_env = os.getenv("APP_ENV", "local").lower()

    if app_env == "local":
        if not payload.role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is required in local mode.",
            )
        result = service.login(role=payload.role)
    else:
        if not payload.azure_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Azure token is required.",
            )
        result = service.login_with_sso(azure_token=payload.azure_token)

    return LoginResponse(**result)


# ==========================================================
# LOGOUT
# ==========================================================

@router.post(
    "/logout",
    response_model=TokenResponse,
)
def logout() -> TokenResponse:

    return TokenResponse(
        access_token="",
        token_type="bearer",
    )


# ==========================================================
# CURRENT USER
# ==========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user=Depends(get_current_user_dependency),
) -> UserResponse:

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        display_name=current_user.display_name,
        department=current_user.department,
        title=current_user.title,
        role_id=current_user.role_id,
        role_label=getattr(current_user.role, "label", None),
        is_active=current_user.is_active,
        last_login_at=(
            current_user.last_login_at.isoformat()
            if current_user.last_login_at
            else None
        ),
    )


# ==========================================================
# HEALTH
# ==========================================================

@router.get("/health")
def auth_health():

    return {
        "status": "ok",     
        "mode": (
            "local"
            if os.getenv("APP_ENV", "local").lower() == "local"
            else "production"
        ),
    }