from pydantic import BaseModel


class LaunchpadAppResponse(BaseModel):
    id: str
    display_name: str
    description: str
    category: str
    launch_url: str | None = None
    icon: str
    is_internal: bool
    display_order: int

    class Config:
        orm_mode = True


class LaunchpadAppCategoryResponse(BaseModel):
    category: str
    applications: list[LaunchpadAppResponse]

    class Config:
        orm_mode = True
