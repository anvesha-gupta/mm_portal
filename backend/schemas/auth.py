from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: UUID
    email: str
    display_name: str
    department: str | None = None
    title: str | None = None
    role_id: str
    role_label: str | None = None
    is_active: bool
    last_login_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(TokenResponse):
    user: CurrentUserResponse

    model_config = ConfigDict(from_attributes=True)
