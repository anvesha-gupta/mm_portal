from __future__ import annotations

import datetime
from sqlalchemy import DateTime, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"schema": "mm_portal"}

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    users: Mapped[list[User]] = relationship(back_populates="role", lazy="select")
    role_permissions: Mapped[list["RoleAppPermission"]] = relationship(
        back_populates="role",
        lazy="select",
    )
