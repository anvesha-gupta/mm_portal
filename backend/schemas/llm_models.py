from pydantic import BaseModel
from typing import Any


class LLMModelBase(BaseModel):
    class Config:
        extra = "allow"


class LLMModelCreate(LLMModelBase):
    pass


class LLMModelUpdate(LLMModelBase):
    pass


class LLMModelResponse(LLMModelBase):
    id: Any
