from pydantic import BaseModel
from typing import Any


class RoleBase(BaseModel):
    class Config:
        extra = "allow"


class RoleCreate(RoleBase):
    pass


class RoleUpdate(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: Any
