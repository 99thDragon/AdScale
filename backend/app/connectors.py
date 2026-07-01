"""Ad-platform connectors (issue #24).

The execution arm that talks to Google Ads / Meta. Real API calls need OAuth
credentials (issues #19/#27), so for now this is a deterministic **mock**
connector that simulates launching a campaign and reporting performance — enough
for the dashboard to show "live" data end-to-end.

Crucially, simulated spend never exceeds the spend cap, which is how the
server-side guardrail (issue #25) is enforced in the execution path.
"""

from __future__ import annotations

import hashlib

from .models import Campaign, Performance


def _seed(cid: str) -> float:
    """Stable 0..1 value per campaign so simulated metrics are deterministic."""
    digest = hashlib.sha256(cid.encode()).hexdigest()
    return (int(digest, 16) % 1000) / 1000.0


def effective_ceiling(campaign: Campaign, spend_cap: float | None) -> float:
    """The most the agent is allowed to spend: min(budget, cap) (issue #25)."""
    budget = campaign.draft.budget.total
    return min(budget, spend_cap) if spend_cap is not None else budget


def launch(campaign: Campaign, spend_cap: float | None) -> Performance:
    """Simulate launching: a small initial spend and early metrics."""
    ceiling = effective_ceiling(campaign, spend_cap)
    r = _seed(campaign.id)
    spend = round(min(ceiling * 0.10, ceiling), 2)
    ctr = round(1.5 + r * 2.5, 1)  # 1.5%..4.0%
    cost_per_conv = 8 + r * 12  # $8..$20
    conversions = int(spend / cost_per_conv) if cost_per_conv else 0
    return Performance(
        spend=spend,
        budget_total=campaign.draft.budget.total,
        ctr=ctr,
        conversions=conversions,
    )


def refresh(campaign: Campaign, current: Performance, spend_cap: float | None) -> Performance:
    """Simulate time passing: spend advances toward the ceiling but never past it."""
    ceiling = effective_ceiling(campaign, spend_cap)
    r = _seed(campaign.id)
    spend = round(min(current.spend + (ceiling - current.spend) * 0.25, ceiling), 2)
    ctr = current.ctr or round(1.5 + r * 2.5, 1)
    cost_per_conv = 8 + r * 12
    conversions = int(spend / cost_per_conv) if cost_per_conv else 0
    return Performance(
        spend=spend,
        budget_total=campaign.draft.budget.total,
        ctr=ctr,
        conversions=conversions,
    )
