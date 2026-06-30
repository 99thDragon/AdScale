"""Pydantic models — the shared API contract between frontend and backend.

These shapes are what `/src` (Adedoyin) builds against. Keep changes here in
sync with MVP-CHECKLIST.md and the frontend.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class Audience(BaseModel):
    description: str
    age_range: str | None = None
    locations: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)


class Budget(BaseModel):
    total: float
    daily: float | None = None
    currency: str = "USD"


class AdCreative(BaseModel):
    headline: str
    body: str
    cta: str


class CampaignDraft(BaseModel):
    """The AI-generated structure the manager reviews before launch."""

    name: str
    objective: str
    channels: list[str]
    audience: Audience
    budget: Budget
    ad_copy: list[AdCreative]


class Performance(BaseModel):
    spend: float = 0
    budget_total: float = 0
    ctr: float = 0
    conversions: int = 0


class Campaign(BaseModel):
    id: str
    status: str  # draft | approved | active | paused
    draft: CampaignDraft
    performance: Performance | None = None


# --- Request / response payloads -------------------------------------------


class GenerateRequest(BaseModel):
    goal: str


class StatusResponse(BaseModel):
    id: str
    status: str


class ImpactStory(BaseModel):
    id: str
    summary: str
    headline_metric: str | None = None


class OptimizationSuggestion(BaseModel):
    """A single AI optimization suggestion with a plain-language explanation."""

    title: str  # short action, e.g. "Shift budget toward Meta"
    rationale: str  # why, in plain language
    impact: str = "medium"  # high | medium | low
