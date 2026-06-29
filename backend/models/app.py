from __future__ import annotations

import datetime
from sqlalchemy import Boolean, DateTime, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class App(Base):
    __tablename__ = "apps"
    __table_args__ = {"schema": "mm_portal"}

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    long_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_tag: Mapped[str] = mapped_column(String(100), nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    gradient_class: Mapped[str | None] = mapped_column(String(255), nullable=True)
    icon_bg_class: Mapped[str | None] = mapped_column(String(255), nullable=True)
    launch_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    role_permissions: Mapped[list["RoleAppPermission"]] = relationship(
        back_populates="app",
        lazy="select",
    )
    user_overrides: Mapped[list["UserAppOverride"]] = relationship(
        back_populates="app",
        lazy="select",
    )
