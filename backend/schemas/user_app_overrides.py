from pydantic import BaseModel
from typing import Any


class UserAppOverrideBase(BaseModel):
    class Config:
        extra = "allow"


class UserAppOverrideCreate(UserAppOverrideBase):
    pass


class UserAppOverrideUpdate(UserAppOverrideBase):
    pass


class UserAppOverrideResponse(UserAppOverrideBase):
    id: Any
