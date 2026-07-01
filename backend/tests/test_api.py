"""Contract tests for the AdScale API (run in mock mode — no API key needed)."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_generate_returns_draft():
    r = client.post(
        "/campaigns/generate",
        json={"goal": "Sell summer sneakers to runners in NYC, $2k budget"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "draft"
    assert data["draft"]["name"]
    assert data["draft"]["channels"]
    assert data["draft"]["budget"]["total"] > 0


def test_generate_requires_goal():
    r = client.post("/campaigns/generate", json={"goal": "   "})
    assert r.status_code == 400


def test_launch_requires_approval():
    cid = client.post(
        "/campaigns/generate", json={"goal": "Drive leads for a SaaS demo"}
    ).json()["id"]

    # Approve-before-spend: launching first must fail.
    assert client.post(f"/campaigns/{cid}/launch").status_code == 409

    assert client.post(f"/campaigns/{cid}/approve").json()["status"] == "approved"
    launched = client.post(f"/campaigns/{cid}/launch")
    assert launched.status_code == 200
    assert launched.json()["status"] == "active"


def test_impact_story_after_launch():
    cid = client.post("/campaigns/generate", json={"goal": "Holiday promo"}).json()["id"]
    client.post(f"/campaigns/{cid}/approve")
    client.post(f"/campaigns/{cid}/launch")

    story = client.get(f"/campaigns/{cid}/impact-story")
    assert story.status_code == 200
    assert story.json()["summary"]


def test_optimizations_returns_suggestions():
    cid = client.post(
        "/campaigns/generate", json={"goal": "Boost online course signups"}
    ).json()["id"]

    r = client.get(f"/campaigns/{cid}/optimizations")
    assert r.status_code == 200
    suggestions = r.json()
    assert len(suggestions) >= 1
    for s in suggestions:
        assert s["title"]
        assert s["rationale"]
        assert s["impact"] in {"high", "medium", "low"}


def test_optimizations_unknown_campaign_404():
    assert client.get("/campaigns/does-not-exist/optimizations").status_code == 404


def _launch(goal: str) -> str:
    cid = client.post("/campaigns/generate", json={"goal": goal}).json()["id"]
    client.post(f"/campaigns/{cid}/approve")
    client.post(f"/campaigns/{cid}/launch")
    return cid


def test_launch_seeds_live_performance():
    cid = _launch("Sell running shoes")
    campaign = client.get("/campaigns").json()
    perf = next(c["performance"] for c in campaign if c["id"] == cid)
    assert perf is not None
    assert perf["spend"] > 0
    assert perf["ctr"] > 0


def test_sync_advances_spend_but_respects_cap():
    cid = client.post(
        "/campaigns/generate", json={"goal": "Lead gen for a $5000 budget"}
    ).json()["id"]
    # Cap spend at $300, well under the campaign budget.
    capped = client.put(f"/campaigns/{cid}/spend-cap", json={"cap": 300}).json()
    assert capped["spend_cap"] == 300

    client.post(f"/campaigns/{cid}/approve")
    client.post(f"/campaigns/{cid}/launch")

    # Sync several times; spend must never exceed the cap.
    for _ in range(10):
        campaign = client.post(f"/campaigns/{cid}/sync").json()
        assert campaign["performance"]["spend"] <= 300


def test_spend_cap_rejects_negative():
    cid = client.post("/campaigns/generate", json={"goal": "x"}).json()["id"]
    assert client.put(f"/campaigns/{cid}/spend-cap", json={"cap": -5}).status_code == 400


def test_sync_requires_live_campaign():
    cid = client.post("/campaigns/generate", json={"goal": "not launched"}).json()["id"]
    assert client.post(f"/campaigns/{cid}/sync").status_code == 409


def test_impact_story_is_indexed_after_launch():
    cid = _launch("Drive ecommerce sales")
    story = client.get(f"/campaigns/{cid}/impact-story").json()
    assert story["summary"]
    assert story["indexed_metrics"] is not None
    assert "ctr" in story["indexed_metrics"]


def test_auto_optimize_improves_within_guardrail():
    cid = client.post(
        "/campaigns/generate", json={"goal": "Improve ROAS on a $4000 budget"}
    ).json()["id"]
    client.put(f"/campaigns/{cid}/spend-cap", json={"cap": 500})
    client.post(f"/campaigns/{cid}/approve")
    client.post(f"/campaigns/{cid}/launch")

    before = next(c for c in client.get("/campaigns").json() if c["id"] == cid)
    result = client.post(f"/campaigns/{cid}/auto-optimize").json()

    assert result["applied"]  # some suggestions were applied
    assert result["performance"]["ctr"] >= before["performance"]["ctr"]
    assert result["performance"]["spend"] <= 500  # guardrail still holds


def test_approval_threshold_blocks_high_spend_launch():
    # Budget from the mock draft is $2000; set the threshold below it.
    cid = client.post("/campaigns/generate", json={"goal": "Big brand push"}).json()["id"]
    client.put(f"/campaigns/{cid}/approval-threshold", json={"amount": 500})
    client.post(f"/campaigns/{cid}/approve")

    blocked = client.post(f"/campaigns/{cid}/launch")
    assert blocked.status_code == 409

    confirmed = client.post(f"/campaigns/{cid}/launch", json={"confirm_high_spend": True})
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "active"


def test_list_includes_created_campaigns():
    before = len(client.get("/campaigns").json())
    client.post("/campaigns/generate", json={"goal": "Promote a new podcast"})
    after = client.get("/campaigns").json()
    assert len(after) == before + 1
