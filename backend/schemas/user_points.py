from pydantic import BaseModel
from typing import Any


class UserPointsBase(BaseModel):
    class Config:
        extra = "allow"


class UserPointsCreate(UserPointsBase):
    pass


class UserPointsUpdate(UserPointsBase):
    pass


class UserPointsResponse(UserPointsBase):
    id: Any
