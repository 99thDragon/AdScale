"""AdScale API — implements the shared contract from MVP-CHECKLIST.md.

    POST /campaigns/generate         { goal }  -> Campaign (status: draft)
    GET  /campaigns                            -> [Campaign]
    POST /campaigns/{id}/approve               -> { id, status }
    POST /campaigns/{id}/launch                -> { id, status }   (approve required)
    GET  /campaigns/{id}/impact-story          -> { id, summary }
"""

from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # read backend/.env if present (ANTHROPIC_API_KEY, etc.)

from . import store  # noqa: E402  (import after load_dotenv)
from .agent import generate_campaign_draft, suggest_optimizations  # noqa: E402
from .models import (  # noqa: E402
    Campaign,
    GenerateRequest,
    ImpactStory,
    OptimizationSuggestion,
    StatusResponse,
)

app = FastAPI(title="AdScale API", version="0.1.0")

# Allow the Vite dev frontend to call the API during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/campaigns/generate", response_model=Campaign)
def generate(req: GenerateRequest):
    """[P0] Plain-language goal -> AI-generated campaign structure (draft)."""
    if not req.goal.strip():
        raise HTTPException(status_code=400, detail="goal is required")
    draft = generate_campaign_draft(req.goal)
    return store.create_campaign(draft)


@app.get("/campaigns", response_model=list[Campaign])
def list_campaigns():
    """[P0] All campaigns with their current status and performance."""
    return store.list_campaigns()


@app.post("/campaigns/{cid}/approve", response_model=StatusResponse)
def approve(cid: str):
    """[P0] Explicit approval — required before anything can launch."""
    campaign = store.set_status(cid, "approved")
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return StatusResponse(id=campaign.id, status=campaign.status)


@app.post("/campaigns/{cid}/launch", response_model=StatusResponse)
def launch(cid: str):
    """[P0] Launch — enforces approve-before-spend at the API level."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if campaign.status != "approved":
        raise HTTPException(
            status_code=409, detail="campaign must be approved before launch"
        )
    campaign = store.set_status(cid, "active")
    return StatusResponse(id=campaign.id, status=campaign.status)


@app.get("/campaigns/{cid}/optimizations", response_model=list[OptimizationSuggestion])
def optimizations(cid: str):
    """[P0] AI optimization suggestions with plain-language explanations."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return suggest_optimizations(campaign)


@app.get("/campaigns/{cid}/impact-story", response_model=ImpactStory)
def impact_story(cid: str):
    """[P1] Indexed impact summary. TODO: make this LLM-generated + indexed."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")

    perf = campaign.performance
    if perf is None:
        return ImpactStory(
            id=campaign.id,
            summary=f"{campaign.draft.name} is staged but not yet live — no performance to index.",
        )
    summary = (
        f"{campaign.draft.name} drove {perf.conversions} conversions at a "
        f"{perf.ctr:.1f}% CTR on ${perf.spend:,.0f} of ${perf.budget_total:,.0f} budget."
    )
    return ImpactStory(
        id=campaign.id,
        summary=summary,
        headline_metric=f"{perf.conversions} conversions",
    )
