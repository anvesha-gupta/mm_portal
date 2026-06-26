from pydantic import BaseModel
from typing import Any


class PlaybenchSessionBase(BaseModel):
    class Config:
        extra = "allow"


class PlaybenchSessionCreate(PlaybenchSessionBase):
    pass


class PlaybenchSessionUpdate(PlaybenchSessionBase):
    pass


class PlaybenchSessionResponse(PlaybenchSessionBase):
    id: Any
