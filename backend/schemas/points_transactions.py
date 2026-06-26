from pydantic import BaseModel
from typing import Any


class PointsTransactionBase(BaseModel):
    class Config:
        extra = "allow"


class PointsTransactionCreate(PointsTransactionBase):
    pass


class PointsTransactionUpdate(PointsTransactionBase):
    pass


class PointsTransactionResponse(PointsTransactionBase):
    id: Any
