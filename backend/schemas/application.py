# schemas/application.py
from pydantic import BaseModel

class Application(BaseModel):
    id: str
    name: str
    icon: str | None = None
    category: str | None = None
    description: str | None = None
    display_order: int | None = None
    is_internal: bool
    route: str | None = None
    external_url: str | None = None
    supports_sso: bool
    is_enabled: bool

    class Config:
        orm_mode = True

class LaunchResponse(BaseModel):
    launchUrl: str
