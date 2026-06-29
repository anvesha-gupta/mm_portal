from __future__ import annotations

import datetime
import uuid
from sqlalchemy import DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class RoleAppPermission(Base):
    __tablename__ = "role_app_permissions"
    __table_args__ = {"schema": "mm_portal"}

    role_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("mm_portal.roles.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    app_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("mm_portal.apps.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    granted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mm_portal.users.id", ondelete="SET NULL"),
        nullable=True,
    )
    granted_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )

    role: Mapped["Role"] = relationship(back_populates="role_permissions", lazy="joined")
    app: Mapped["App"] = relationship(back_populates="role_permissions", lazy="joined")
    granted_by_user: Mapped["User | None"] = relationship(
        lazy="joined",
        foreign_keys=[granted_by],
    )
