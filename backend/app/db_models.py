"""SQLAlchemy ORM models (storage layer).

Campaign sub-structures (draft, performance) are stored as JSON columns — simple
and flexible for the MVP, and trivial to migrate to typed columns later.
"""

from __future__ import annotations

from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class CampaignRow(Base):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    draft_json: Mapped[str] = mapped_column(Text, nullable=False)
    performance_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Guardrail: the agent may never spend beyond this (issue #25). None = no cap.
    spend_cap: Mapped[float | None] = mapped_column(Float, nullable=True)
    # Spend above this needs explicit high-spend confirmation to launch (issue #26).
    approval_threshold: Mapped[float | None] = mapped_column(Float, nullable=True)
