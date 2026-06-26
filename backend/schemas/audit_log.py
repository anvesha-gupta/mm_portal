from pydantic import BaseModel
from typing import Any


class AuditLogBase(BaseModel):
    class Config:
        extra = "allow"


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogUpdate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: Any
