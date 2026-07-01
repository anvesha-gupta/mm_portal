from __future__ import annotations

import datetime
import uuid

from sqlalchemy import DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class UserAppOverride(Base):
    __tablename__ = "user_app_overrides"
    __table_args__ = {"schema": "mm_portal"}

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mm_portal.users.id", ondelete="CASCADE"),
        nullable=False,
    )

    app_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("mm_portal.apps.id", ondelete="CASCADE"),
        nullable=False,
    )

    override_type: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    granted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mm_portal.users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="user_overrides",
        foreign_keys=[user_id],
        lazy="joined",
    )

    app: Mapped["App"] = relationship(
        "App",
        back_populates="user_overrides",
        lazy="joined",
    )

    granted_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[granted_by],
        lazy="joined",
    )