"""Ad-platform connectors (issue #24).

`select_connector(campaign)` returns the **real** connector for the campaign's
platform when a valid OAuth token is stored for it (see tokens.py, issue #27)
**and** that connector is enabled; otherwise it returns the deterministic
**mock** that simulates launch + performance.

Real Google Ads / Meta API calls need live credentials + a test ad account, so
the real connectors ship as guarded scaffolds (`enabled = False`). Enabling one
is a bounded change: implement its `launch`/`refresh` against the platform API
(using `self._token()`) and flip `enabled = True`.

Either path, spend is bounded by the spend cap — the guardrail (issue #25).
"""

from __future__ import annotations

import hashlib
from typing import Protocol

from . import tokens
from .models import Campaign, Performance


class ConnectorError(RuntimeError):
    """Raised when a real connector can't run (missing token / not enabled)."""


def _seed(cid: str) -> float:
    """Stable 0..1 value per campaign so simulated metrics are deterministic."""
    digest = hashlib.sha256(cid.encode()).hexdigest()
    return (int(digest, 16) % 1000) / 1000.0


def effective_ceiling(campaign: Campaign, spend_cap: float | None) -> float:
    """The most the agent is allowed to spend: min(budget, cap) (issue #25)."""
    budget = campaign.draft.budget.total
    return min(budget, spend_cap) if spend_cap is not None else budget


def platform_key(campaign: Campaign) -> str:
    """Map the campaign's lead channel to a platform key."""
    channel = (campaign.draft.channels or ["Meta"])[0].lower()
    return "google_ads" if "google" in channel else "meta"


class Connector(Protocol):
    name: str

    def launch(self, campaign: Campaign, spend_cap: float | None) -> Performance: ...

    def refresh(
        self, campaign: Campaign, current: Performance, spend_cap: float | None
    ) -> Performance: ...


class MockConnector:
    """Deterministic simulation used until a real platform connector is enabled."""

    name = "mock"

    def launch(self, campaign: Campaign, spend_cap: float | None) -> Performance:
        ceiling = effective_ceiling(campaign, spend_cap)
        r = _seed(campaign.id)
        spend = round(min(ceiling * 0.10, ceiling), 2)
        cost_per_conv = 8 + r * 12  # $8..$20
        return Performance(
            spend=spend,
            budget_total=campaign.draft.budget.total,
            ctr=round(1.5 + r * 2.5, 1),  # 1.5%..4.0%
            conversions=int(spend / cost_per_conv) if cost_per_conv else 0,
        )

    def refresh(
        self, campaign: Campaign, current: Performance, spend_cap: float | None
    ) -> Performance:
        ceiling = effective_ceiling(campaign, spend_cap)
        r = _seed(campaign.id)
        spend = round(min(current.spend + (ceiling - current.spend) * 0.25, ceiling), 2)
        cost_per_conv = 8 + r * 12
        return Performance(
            spend=spend,
            budget_total=campaign.draft.budget.total,
            ctr=current.ctr or round(1.5 + r * 2.5, 1),
            conversions=int(spend / cost_per_conv) if cost_per_conv else 0,
        )


class RealConnector:
    """Base for live platform connectors. Reads its OAuth token via tokens.py."""

    name = "real"
    platform = ""
    enabled = False  # flip to True once the API calls below are implemented + tested

    def _token(self):
        tok = tokens.get_valid_token(self.platform)
        if tok is None:
            raise ConnectorError(f"No valid {self.platform} token; connect the account first")
        return tok

    def launch(self, campaign: Campaign, spend_cap: float | None) -> Performance:
        raise ConnectorError(f"{self.platform} connector is not enabled yet")

    def refresh(
        self, campaign: Campaign, current: Performance, spend_cap: float | None
    ) -> Performance:
        raise ConnectorError(f"{self.platform} connector is not enabled yet")


class MetaAdsConnector(RealConnector):
    """Meta Marketing API (REST). Reference extension point.

    When enabled, `launch` would POST a campaign + ad set to
    `https://graph.facebook.com/v21.0/act_{account_id}/campaigns` with a
    daily budget capped at `effective_ceiling(...)`, using `self._token()`, and
    `refresh` would read `/insights`. Requires a live token + ad account.
    """

    name = "meta"
    platform = "meta"


class GoogleAdsConnector(RealConnector):
    """Google Ads API. Reference extension point.

    When enabled, uses the `google-ads` SDK with a developer token + the stored
    OAuth token to create/mutate campaigns and pull metrics.
    """

    name = "google_ads"
    platform = "google_ads"


_MOCK = MockConnector()
_REAL: dict[str, RealConnector] = {"meta": MetaAdsConnector(), "google_ads": GoogleAdsConnector()}


def select_connector(campaign: Campaign) -> Connector:
    """Real connector when its platform has a valid token AND it's enabled; else mock."""
    platform = platform_key(campaign)
    real = _REAL.get(platform)
    if real is not None and real.enabled and tokens.get_valid_token(platform) is not None:
        return real
    return _MOCK
