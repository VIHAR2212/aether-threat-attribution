from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    evidence_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    actor_name: Mapped[str] = mapped_column(String(128))
    aliases: Mapped[list] = mapped_column(JSON, default=list)
    origin_ip: Mapped[str] = mapped_column(String(45), default="")
    geo: Mapped[str] = mapped_column(String(128), default="")
    asn: Mapped[str] = mapped_column(String(128), default="")
    pgp_fingerprint: Mapped[str] = mapped_column(String(64), default="")
    btc_root: Mapped[str] = mapped_column(String(64), default="")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    onion_url: Mapped[str] = mapped_column(String(256), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    custody: Mapped[list["CustodyRow"]] = relationship(
        back_populates="case", cascade="all, delete-orphan", order_by="CustodyRow.seq"
    )


class CustodyRow(Base):
    __tablename__ = "custody_entries"
    __table_args__ = (UniqueConstraint("case_id", "seq", name="uq_case_seq"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"), index=True)
    seq: Mapped[int] = mapped_column(Integer)
    timestamp: Mapped[str] = mapped_column(String(40))
    actor: Mapped[str] = mapped_column(String(128))
    action: Mapped[str] = mapped_column(Text)
    prev_hash: Mapped[str] = mapped_column(String(64))
    entry_hash: Mapped[str] = mapped_column(String(64))

    case: Mapped[Case] = relationship(back_populates="custody")
