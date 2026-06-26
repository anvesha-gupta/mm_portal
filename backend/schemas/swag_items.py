from pydantic import BaseModel
from typing import Any


class SwagItemBase(BaseModel):
    class Config:
        extra = "allow"


class SwagItemCreate(SwagItemBase):
    pass


class SwagItemUpdate(SwagItemBase):
    pass


class SwagItemResponse(SwagItemBase):
    id: Any
