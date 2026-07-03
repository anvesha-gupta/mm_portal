from __future__ import annotations

import datetime
import json
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

    # Hybrid/JSON-serialized properties for extra launch details
    @property
    def application_type(self) -> str | None:
        try:
            return json.loads(self.long_description or "{}").get("application_type")
        except Exception:
            return None

    @application_type.setter
    def application_type(self, value: str | None) -> None:
        try:
            data = json.loads(self.long_description or "{}")
        except Exception:
            data = {}
        data["application_type"] = value
        self.long_description = json.dumps(data)

    @property
    def launch_type(self) -> str | None:
        try:
            return json.loads(self.long_description or "{}").get("launch_type")
        except Exception:
            # Fallback if long_description doesn't contain it
            if self.launch_url and self.launch_url.startswith('/'):
                return "internal"
            return "external"

    @launch_type.setter
    def launch_type(self, value: str | None) -> None:
        try:
            data = json.loads(self.long_description or "{}")
        except Exception:
            data = {}
        data["launch_type"] = value
        self.long_description = json.dumps(data)

    @property
    def internal_route(self) -> str | None:
        try:
            return json.loads(self.long_description or "{}").get("internal_route")
        except Exception:
            if self.launch_url and self.launch_url.startswith('/'):
                return self.launch_url
            return None

    @internal_route.setter
    def internal_route(self, value: str | None) -> None:
        try:
            data = json.loads(self.long_description or "{}")
        except Exception:
            data = {}
        data["internal_route"] = value
        self.long_description = json.dumps(data)

    @property
    def external_url(self) -> str | None:
        try:
            return json.loads(self.long_description or "{}").get("external_url")
        except Exception:
            if self.launch_url and not self.launch_url.startswith('/'):
                return self.launch_url
            return None

    @external_url.setter
    def external_url(self, value: str | None) -> None:
        try:
            data = json.loads(self.long_description or "{}")
        except Exception:
            data = {}
        data["external_url"] = value
        self.long_description = json.dumps(data)

    @property
    def sso_enabled(self) -> bool:
        try:
            return json.loads(self.long_description or "{}").get("sso_enabled", False)
        except Exception:
            return False

    @sso_enabled.setter
    def sso_enabled(self, value: bool) -> None:
        try:
            data = json.loads(self.long_description or "{}")
        except Exception:
            data = {}
        data["sso_enabled"] = value
        self.long_description = json.dumps(data)

    # Aliases
    @property
    def application_name(self) -> str:
        return self.name

    @application_name.setter
    def application_name(self, value: str) -> None:
        self.name = value

    @property
    def active(self) -> bool:
        return self.is_active

    @active.setter
    def active(self, value: bool) -> None:
        self.is_active = value

    @property
    def display_order(self) -> int:
        return self.sort_order

    @display_order.setter
    def display_order(self, value: int) -> None:
        self.sort_order = value
