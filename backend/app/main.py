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

from fastapi import Body  # noqa: E402

from . import connectors, store, tokens  # noqa: E402  (import after load_dotenv)
from .agent import (  # noqa: E402
    generate_campaign_draft,
    generate_impact_story,
    suggest_optimizations,
)
from .db import init_db  # noqa: E402
from .models import (  # noqa: E402
    ApprovalThresholdRequest,
    AutoOptimizeResult,
    Campaign,
    ConnectTokenRequest,
    GenerateRequest,
    ImpactStory,
    LaunchRequest,
    OptimizationSuggestion,
    Performance,
    PlatformStatus,
    SpendCapRequest,
    StatusResponse,
)

init_db()  # ensure tables exist before any request

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
def launch(cid: str, req: LaunchRequest = Body(default=LaunchRequest())):
    """[P0] Launch — enforces approve-before-spend, then dispatches to the connector."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if campaign.status != "approved":
        raise HTTPException(
            status_code=409, detail="campaign must be approved before launch"
        )
    # Approval threshold: budgets above it need explicit high-spend confirmation (#26).
    if (
        campaign.approval_threshold is not None
        and campaign.draft.budget.total > campaign.approval_threshold
        and not req.confirm_high_spend
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                f"budget ${campaign.draft.budget.total:,.0f} exceeds approval "
                f"threshold ${campaign.approval_threshold:,.0f}; resend with "
                "confirm_high_spend=true"
            ),
        )
    campaign = store.set_status(cid, "active")
    # Dispatch to the selected connector (real if a token is connected, else mock);
    # spend is capped by the guardrail (#24/#25).
    performance = connectors.select_connector(campaign).launch(campaign, campaign.spend_cap)
    store.update_performance(cid, performance)
    return StatusResponse(id=campaign.id, status=campaign.status)


@app.put("/campaigns/{cid}/spend-cap", response_model=Campaign)
def set_spend_cap(cid: str, req: SpendCapRequest):
    """[P0] Set the spend cap the agent may never exceed (issue #25)."""
    if req.cap is not None and req.cap < 0:
        raise HTTPException(status_code=400, detail="cap must be >= 0")
    campaign = store.set_spend_cap(cid, req.cap)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return campaign


@app.post("/campaigns/{cid}/sync", response_model=Campaign)
def sync_performance(cid: str):
    """[P0] Pull the latest performance from the connector (issue #24)."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if campaign.status != "active" or campaign.performance is None:
        raise HTTPException(status_code=409, detail="campaign is not live")
    connector = connectors.select_connector(campaign)
    performance = connector.refresh(campaign, campaign.performance, campaign.spend_cap)
    return store.update_performance(cid, performance)


@app.get("/campaigns/{cid}/optimizations", response_model=list[OptimizationSuggestion])
def optimizations(cid: str):
    """[P0] AI optimization suggestions with plain-language explanations."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return suggest_optimizations(campaign)


@app.put("/campaigns/{cid}/approval-threshold", response_model=Campaign)
def set_approval_threshold(cid: str, req: ApprovalThresholdRequest):
    """[P1] Set the spend level above which launch needs confirmation (issue #26)."""
    if req.amount is not None and req.amount < 0:
        raise HTTPException(status_code=400, detail="amount must be >= 0")
    campaign = store.set_approval_threshold(cid, req.amount)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return campaign


@app.post("/campaigns/{cid}/auto-optimize", response_model=AutoOptimizeResult)
def auto_optimize(cid: str):
    """[P1] Apply top optimizations automatically, within the spend guardrail (#22)."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    if campaign.performance is None or campaign.status not in {"active", "optimizing"}:
        raise HTTPException(status_code=409, detail="campaign is not live")

    applied = [s.title for s in suggest_optimizations(campaign)[:2]]

    # Simulate the effect of the optimizations — improve efficiency, never exceed
    # the spend ceiling (guardrail).
    perf = campaign.performance
    ceiling = connectors.effective_ceiling(campaign, campaign.spend_cap)
    improved = Performance(
        spend=round(min(perf.spend, ceiling), 2),
        budget_total=perf.budget_total,
        ctr=round(min(perf.ctr * 1.15, 10.0), 1),
        conversions=int(perf.conversions * 1.2),
    )
    store.update_performance(cid, improved)
    store.set_status(cid, "optimizing")
    return AutoOptimizeResult(id=cid, applied=applied, performance=improved)


@app.get("/campaigns/{cid}/impact-story", response_model=ImpactStory)
def impact_story(cid: str):
    """[P1] Indexed impact summary — LLM-written, indexed against a 100 baseline (#23)."""
    campaign = store.get_campaign(cid)
    if campaign is None:
        raise HTTPException(status_code=404, detail="campaign not found")
    return generate_impact_story(campaign)


# --- Ad-platform connections / OAuth token lifecycle (issue #27) -------------


@app.get("/platforms", response_model=list[PlatformStatus])
def list_platforms():
    """Connected ad platforms and their token status."""
    return tokens.list_status()


@app.put("/platforms/{platform}/token", response_model=PlatformStatus)
def connect_platform(platform: str, req: ConnectTokenRequest):
    """Deposit an OAuth token for a platform (this is where an OAuth callback
    would land it). Scope defaults to the platform's minimal scope."""
    if platform not in tokens.MINIMAL_SCOPES:
        raise HTTPException(
            status_code=400,
            detail=f"unknown platform; expected one of {sorted(tokens.MINIMAL_SCOPES)}",
        )
    return tokens.save_token(
        platform,
        access_token=req.access_token,
        refresh_token=req.refresh_token,
        expires_in=req.expires_in,
        scopes=req.scopes,
        account_id=req.account_id,
    )


@app.post("/platforms/{platform}/revoke", response_model=PlatformStatus)
def revoke_platform(platform: str):
    """Revoke a platform connection (token can no longer be used)."""
    if not tokens.revoke(platform):
        raise HTTPException(status_code=404, detail="no token for platform")
    return tokens.get_status(platform)
