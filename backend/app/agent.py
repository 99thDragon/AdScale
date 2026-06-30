"""The campaign-planning agent.

Turns a manager's plain-language goal into a structured `CampaignDraft` using
Claude with tool use (so the model returns validated, structured JSON rather
than free text).

If `ANTHROPIC_API_KEY` is not set, a deterministic mock draft is returned so the
backend (and the frontend that calls it) runs without any credentials — the same
mock-first approach the dashboard and login were built with.
"""

from __future__ import annotations

import os

from .models import (
    AdCreative,
    Audience,
    Budget,
    Campaign,
    CampaignDraft,
    OptimizationSuggestion,
)

# Default to the latest cost-effective Claude model; override via env if needed.
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")

SYSTEM_PROMPT = (
    "You are AdScale's campaign-planning agent for advertising managers. "
    "Turn the manager's plain-language goal into a single, well-structured ad "
    "campaign draft. Infer sensible defaults (channels, audience, budget split, "
    "1-3 ad variations) when details are missing, and keep ad copy concise and "
    "platform-appropriate. Always call the draft_campaign tool."
)

# Tool schema forces Claude to return structured output matching CampaignDraft.
CAMPAIGN_TOOL = {
    "name": "draft_campaign",
    "description": "Produce a structured ad campaign draft from the manager's goal.",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Short campaign name"},
            "objective": {
                "type": "string",
                "description": "Primary objective, e.g. conversions, awareness, traffic, leads",
            },
            "channels": {
                "type": "array",
                "items": {"type": "string", "enum": ["Google Ads", "Meta"]},
            },
            "audience": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "age_range": {"type": "string"},
                    "locations": {"type": "array", "items": {"type": "string"}},
                    "interests": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["description"],
            },
            "budget": {
                "type": "object",
                "properties": {
                    "total": {"type": "number"},
                    "daily": {"type": "number"},
                    "currency": {"type": "string"},
                },
                "required": ["total"],
            },
            "ad_copy": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "headline": {"type": "string"},
                        "body": {"type": "string"},
                        "cta": {"type": "string"},
                    },
                    "required": ["headline", "body", "cta"],
                },
            },
        },
        "required": ["name", "objective", "channels", "audience", "budget", "ad_copy"],
    },
}


def generate_campaign_draft(goal: str) -> CampaignDraft:
    """Return a structured campaign draft for the given goal."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _mock_draft(goal)

    # Imported lazily so the service runs in mock mode without the SDK installed.
    from anthropic import Anthropic

    client = Anthropic(api_key=api_key)
    resp = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        tools=[CAMPAIGN_TOOL],
        tool_choice={"type": "tool", "name": "draft_campaign"},
        messages=[{"role": "user", "content": goal}],
    )
    return CampaignDraft.model_validate(_extract_tool_input(resp, "draft_campaign"))


def _extract_tool_input(resp, tool_name: str) -> dict:
    for block in resp.content:
        if getattr(block, "type", None) == "tool_use" and block.name == tool_name:
            return block.input
    raise ValueError(f"Model did not return a {tool_name} tool call")


def _mock_draft(goal: str) -> CampaignDraft:
    """Deterministic stand-in used when no API key is configured."""
    cleaned = goal.strip()
    return CampaignDraft(
        name=(cleaned[:40] or "New Campaign"),
        objective="conversions",
        channels=["Meta", "Google Ads"],
        audience=Audience(
            description=f"Audience inferred from goal: {cleaned[:120]}",
            age_range="25-45",
            locations=["United States"],
            interests=["online shopping"],
        ),
        budget=Budget(total=2000, daily=100, currency="USD"),
        ad_copy=[
            AdCreative(
                headline="Discover what everyone's talking about",
                body=(cleaned[:140] or "Tell your story in one click."),
                cta="Shop now",
            )
        ],
    )


# --- Optimization suggestions ----------------------------------------------

OPTIMIZE_SYSTEM_PROMPT = (
    "You are AdScale's optimization agent. Given a campaign (its draft and any "
    "live performance), suggest 2-4 concrete, prioritized optimizations an "
    "advertising manager can act on. Each suggestion needs a short action title "
    "and a plain-language rationale (1-2 sentences). Always call the "
    "suggest_optimizations tool."
)

OPTIMIZE_TOOL = {
    "name": "suggest_optimizations",
    "description": "Return prioritized optimization suggestions with plain-language explanations.",
    "input_schema": {
        "type": "object",
        "properties": {
            "suggestions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Short action, e.g. 'Shift budget toward Meta'",
                        },
                        "rationale": {
                            "type": "string",
                            "description": "Plain-language explanation, 1-2 sentences",
                        },
                        "impact": {"type": "string", "enum": ["high", "medium", "low"]},
                    },
                    "required": ["title", "rationale", "impact"],
                },
            }
        },
        "required": ["suggestions"],
    },
}


def suggest_optimizations(campaign: Campaign) -> list[OptimizationSuggestion]:
    """Return AI optimization suggestions for a campaign."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _mock_optimizations(campaign)

    from anthropic import Anthropic

    client = Anthropic(api_key=api_key)
    resp = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=OPTIMIZE_SYSTEM_PROMPT,
        tools=[OPTIMIZE_TOOL],
        tool_choice={"type": "tool", "name": "suggest_optimizations"},
        messages=[{"role": "user", "content": f"Campaign:\n{campaign.model_dump_json(indent=2)}"}],
    )
    data = _extract_tool_input(resp, "suggest_optimizations")
    return [OptimizationSuggestion.model_validate(s) for s in data["suggestions"]]


def _mock_optimizations(campaign: Campaign) -> list[OptimizationSuggestion]:
    """Deterministic, campaign-aware suggestions used when no API key is set."""
    draft = campaign.draft
    lead_channel = draft.channels[0] if draft.channels else "Meta"
    top_interest = draft.audience.interests[0] if draft.audience.interests else "your core interest"
    return [
        OptimizationSuggestion(
            title=f"Shift ~20% of budget toward {lead_channel}",
            rationale=(
                f"{lead_channel} tends to deliver the strongest early results for "
                f"{draft.objective} goals; concentrating spend there should lower "
                "cost per result while you gather data."
            ),
            impact="high",
        ),
        OptimizationSuggestion(
            title="Add a second ad variation",
            rationale=(
                "You currently have a single creative. A second headline/body "
                "variation lets the platform optimize between them and avoids early "
                "creative fatigue."
            ),
            impact="medium",
        ),
        OptimizationSuggestion(
            title=f"Tighten targeting to '{top_interest}'",
            rationale=(
                "Narrowing from broad targeting focuses spend on the users most "
                "likely to convert, improving efficiency."
            ),
            impact="medium",
        ),
    ]
