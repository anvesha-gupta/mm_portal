from pydantic import BaseModel
from typing import Any


class RoleAppPermissionBase(BaseModel):
    class Config:
        extra = "allow"


class RoleAppPermissionCreate(RoleAppPermissionBase):
    pass


class RoleAppPermissionUpdate(RoleAppPermissionBase):
    pass


class RoleAppPermissionResponse(RoleAppPermissionBase):
    id: Any
