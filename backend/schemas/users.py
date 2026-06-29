from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, constr


class UserBase(BaseModel):
    email: EmailStr
    display_name: constr(min_length=1)
    department: str | None = None
    title: str | None = None
    azure_oid: str | None = None
    role_id: str | None = None
    is_active: bool | None = None

    class Config:
        extra = "forbid"


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    display_name: str | None = None
    department: str | None = None
    title: str | None = None
    azure_oid: str | None = None
    role_id: str | None = None
    is_active: bool | None = None

    class Config:
        extra = "forbid"


class UserResponse(UserBase):
    id: UUID
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True