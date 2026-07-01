from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies.auth import get_current_user as get_current_user_dependency
from schemas.auth import CurrentUserResponse, LoginRequest, LoginResponse, TokenResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse, summary="Authenticate a user", description="Authenticate a user against the local database-backed auth provider.")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    """Authenticate a local user and return an access token."""
    service = AuthService(db)
    result = service.login(payload.username, payload.password)
    return LoginResponse(**result)


@router.post("/logout", response_model=TokenResponse, summary="Log out a user", description="Clear client-side session data for the current user. Server-side token revocation is planned for a future iteration.")
def logout() -> TokenResponse:
    """Return an empty success response for client-side logout handling."""
    return TokenResponse(access_token="", token_type="bearer")


@router.get("/me", response_model=CurrentUserResponse, summary="Get the current user", description="Return the authenticated user's profile details.")
def get_me(current_user=Depends(get_current_user_dependency)) -> CurrentUserResponse:
    """Return the authenticated user's profile."""
    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        department=current_user.department,
        title=current_user.title,
        role_id=current_user.role_id,
        role_label=getattr(current_user.role, "label", None),
        is_active=current_user.is_active,
        last_login_at=current_user.last_login_at,
    )


@router.get("/health", summary="Auth health check", description="Report whether the authentication module is ready for requests.")
def auth_health() -> dict[str, str]:
    """Return a lightweight health signal for the auth subsystem."""
    return {"status": "ok", "mode": "local" if (str(__import__("os").getenv("APP_ENV", "local")).strip().lower() == "local") else "production"}
