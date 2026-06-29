from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, constr


class RoleBase(BaseModel):
    label: constr(min_length=1)
    description: str | None = None

    class Config:
        extra = "forbid"


class RoleCreate(RoleBase):
    id: constr(min_length=1)


class RoleUpdate(BaseModel):
    label: str | None = None
    description: str | None = None

    class Config:
        extra = "forbid"


class RoleResponse(RoleBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
