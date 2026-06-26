from pydantic import BaseModel
from typing import Any


class PlaybenchMessageBase(BaseModel):
    class Config:
        extra = "allow"


class PlaybenchMessageCreate(PlaybenchMessageBase):
    pass


class PlaybenchMessageUpdate(PlaybenchMessageBase):
    pass


class PlaybenchMessageResponse(PlaybenchMessageBase):
    id: Any
