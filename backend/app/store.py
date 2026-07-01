"""Campaign persistence (SQLite via SQLAlchemy).

Same function surface as the original in-memory store, so the API layer is
unchanged — data now survives restarts (issue #18).
"""

from __future__ import annotations

import uuid

from sqlalchemy import select

from .db import SessionLocal
from .db_models import CampaignRow
from .models import Campaign, CampaignDraft, Performance


def _to_campaign(row: CampaignRow) -> Campaign:
    return Campaign(
        id=row.id,
        status=row.status,
        draft=CampaignDraft.model_validate_json(row.draft_json),
        performance=(
            Performance.model_validate_json(row.performance_json)
            if row.performance_json
            else None
        ),
        spend_cap=row.spend_cap,
        approval_threshold=row.approval_threshold,
    )


def create_campaign(draft: CampaignDraft) -> Campaign:
    cid = uuid.uuid4().hex[:8]
    with SessionLocal() as session:
        session.add(
            CampaignRow(id=cid, status="draft", draft_json=draft.model_dump_json())
        )
        session.commit()
    return Campaign(id=cid, status="draft", draft=draft, performance=None)


def list_campaigns() -> list[Campaign]:
    with SessionLocal() as session:
        rows = session.execute(select(CampaignRow)).scalars().all()
        return [_to_campaign(row) for row in rows]


def get_campaign(cid: str) -> Campaign | None:
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        return _to_campaign(row) if row else None


def get_spend_cap(cid: str) -> float | None:
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        return row.spend_cap if row else None


def set_spend_cap(cid: str, cap: float | None) -> Campaign | None:
    """Set the guardrail the agent may never exceed (issue #25)."""
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        if row is None:
            return None
        row.spend_cap = cap
        session.commit()
        return _to_campaign(row)


def set_approval_threshold(cid: str, amount: float | None) -> Campaign | None:
    """Set the spend level above which launch needs confirmation (issue #26)."""
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        if row is None:
            return None
        row.approval_threshold = amount
        session.commit()
        return _to_campaign(row)


def set_status(cid: str, status: str) -> Campaign | None:
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        if row is None:
            return None
        row.status = status
        # Seed an empty performance record when a campaign goes live.
        if status == "active" and not row.performance_json:
            draft = CampaignDraft.model_validate_json(row.draft_json)
            row.performance_json = Performance(
                budget_total=draft.budget.total
            ).model_dump_json()
        session.commit()
        return _to_campaign(row)


def update_performance(cid: str, performance: Performance) -> Campaign | None:
    """Persist a performance snapshot (used by the platform connectors, #24)."""
    with SessionLocal() as session:
        row = session.get(CampaignRow, cid)
        if row is None:
            return None
        row.performance_json = performance.model_dump_json()
        session.commit()
        return _to_campaign(row)
