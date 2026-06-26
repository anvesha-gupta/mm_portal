from pydantic import BaseModel
from typing import Any


class SwagRedemptionBase(BaseModel):
    class Config:
        extra = "allow"


class SwagRedemptionCreate(SwagRedemptionBase):
    pass


class SwagRedemptionUpdate(SwagRedemptionBase):
    pass


class SwagRedemptionResponse(SwagRedemptionBase):
    id: Any
