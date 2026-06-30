"""In-memory campaign store.

Deliberately simple for the first slice — swap for a real DB (Supabase/Postgres)
later without changing the API surface. See the backend track in MVP-CHECKLIST.md.
"""

from __future__ import annotations

import itertools

from .models import Campaign, CampaignDraft, Performance

_counter = itertools.count(1)
_campaigns: dict[str, Campaign] = {}


def create_campaign(draft: CampaignDraft) -> Campaign:
    cid = str(next(_counter))
    campaign = Campaign(id=cid, status="draft", draft=draft, performance=None)
    _campaigns[cid] = campaign
    return campaign


def list_campaigns() -> list[Campaign]:
    return list(_campaigns.values())


def get_campaign(cid: str) -> Campaign | None:
    return _campaigns.get(cid)


def set_status(cid: str, status: str) -> Campaign | None:
    campaign = _campaigns.get(cid)
    if campaign is None:
        return None
    campaign.status = status
    # Seed an (empty) performance record once a campaign goes live so the
    # dashboard and impact story have something to read.
    if status == "active" and campaign.performance is None:
        campaign.performance = Performance(budget_total=campaign.draft.budget.total)
    return campaign
