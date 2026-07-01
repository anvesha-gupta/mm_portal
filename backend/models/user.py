from __future__ import annotations

import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .role import Role


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "mm_portal"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    display_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    department: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    azure_oid: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    role_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("mm_portal.roles.id"),
        nullable=False,
        server_default=text("'employee'::character varying"),
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean(),
        nullable=False,
        server_default=text("true"),
    )

    last_login_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    role: Mapped["Role"] = relationship(
        back_populates="users",
        lazy="joined",
    )

    user_overrides: Mapped[list["UserAppOverride"]] = relationship(
        "UserAppOverride",
        back_populates="user",
        foreign_keys="UserAppOverride.user_id",
        lazy="select",
    )