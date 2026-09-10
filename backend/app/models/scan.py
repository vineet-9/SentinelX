import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base
from sqlalchemy import Integer
from sqlalchemy import BigInteger


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    sha256: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
    )

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    is_malicious: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    matched_rule: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    scan_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False,
    )

    vt_found: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    vt_malicious: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    vt_suspicious: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    vt_harmless: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    vt_undetected: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    vt_reputation: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    vt_last_analysis_date: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )