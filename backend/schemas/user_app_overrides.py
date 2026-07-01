from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, constr


class UserAppOverrideBase(BaseModel):
    user_id: UUID
    app_id: constr(min_length=1)
    override_type: constr(pattern="^(grant|revoke)$")
    granted_by: UUID | None = None

    class Config:
        extra = "forbid"


class UserAppOverrideCreate(UserAppOverrideBase):
    pass


class UserAppOverrideUpdate(BaseModel):
    user_id: UUID | None = None
    app_id: str | None = None
    override_type: str | None = None
    granted_by: UUID | None = None

    class Config:
        extra = "forbid"


class UserAppOverrideResponse(UserAppOverrideBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
