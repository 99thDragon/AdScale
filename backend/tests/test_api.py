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


def test_list_includes_created_campaigns():
    before = len(client.get("/campaigns").json())
    client.post("/campaigns/generate", json={"goal": "Promote a new podcast"})
    after = client.get("/campaigns").json()
    assert len(after) == before + 1
