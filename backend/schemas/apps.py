from pydantic import BaseModel
from typing import Any


class AppBase(BaseModel):
    class Config:
        extra = "allow"


class AppCreate(AppBase):
    pass


class AppUpdate(AppBase):
    pass


class AppResponse(AppBase):
    id: Any
