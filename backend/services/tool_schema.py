from pydantic import BaseModel
from typing import Any, Dict, Optional, List


class ToolCall(BaseModel):
    name: str
    args: Dict[str, Any] = {}