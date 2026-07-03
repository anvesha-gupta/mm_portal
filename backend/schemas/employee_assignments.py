from pydantic import BaseModel
from typing import Any
from uuid import UUID


class EmployeeAssignmentBase(BaseModel):
    class Config:
        extra = "allow"


class EmployeeAssignmentCreate(EmployeeAssignmentBase):
    employee_id: UUID
    llm_id: str
    assigned_tokens: int
    used_tokens: int = 0
    remaining_tokens: int = 0
    active: bool = True


class EmployeeAssignmentUpdate(EmployeeAssignmentBase):
    assigned_tokens: int | None = None
    used_tokens: int | None = None
    remaining_tokens: int | None = None
    active: bool | None = None


class EmployeeAssignmentResponse(EmployeeAssignmentBase):
    employee_id: UUID
    llm_id: str
    assigned_tokens: int
    used_tokens: int
    remaining_tokens: int
    active: bool
