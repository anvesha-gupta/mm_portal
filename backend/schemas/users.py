from pydantic import BaseModel
from uuid import UUID


class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: str
    department: str | None = None
    title: str | None = None
    azure_oid: str | None = None