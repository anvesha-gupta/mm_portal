from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, constr


class AppBase(BaseModel):
    name: constr(min_length=1)
    description: constr(min_length=1)
    long_description: str | None = None
    category_tag: constr(min_length=1)
    icon_name: constr(min_length=1)
    gradient_class: str | None = None
    icon_bg_class: str | None = None
    launch_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None

    class Config:
        extra = "forbid"


class AppCreate(AppBase):
    id: constr(min_length=1)


class AppUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    long_description: str | None = None
    category_tag: str | None = None
    icon_name: str | None = None
    gradient_class: str | None = None
    icon_bg_class: str | None = None
    launch_url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None

    class Config:
        extra = "forbid"


class AppResponse(AppBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
