"""Tests for the ad-platform token lifecycle + connector selection (#27 / #24)."""

from fastapi.testclient import TestClient

from app import connectors, tokens
from app.main import app
from app.models import Budget, Campaign, CampaignDraft

client = TestClient(app)


def _campaign(channel="Meta"):
    return Campaign(
        id="tkn-test",
        status="active",
        draft=CampaignDraft(
            name="t",
            objective="conversions",
            channels=[channel],
            audience={"description": "x"},
            budget=Budget(total=1000),
            ad_copy=[{"headline": "h", "body": "b", "cta": "c"}],
        ),
    )


def test_connect_sets_status_and_minimal_scope():
    r = client.put(
        "/platforms/meta/token",
        json={"access_token": "tok-abc", "expires_in": 3600, "account_id": "act_123"},
    )
    assert r.status_code == 200
    s = r.json()
    assert s["connected"] is True
    assert s["account_id"] == "act_123"
    assert s["expired"] is False
    assert s["scopes"] == "ads_management"  # minimal scope defaulted


def test_unknown_platform_rejected():
    assert client.put("/platforms/tiktok/token", json={"access_token": "x"}).status_code == 400


def test_expired_token_is_flagged():
    client.put("/platforms/google_ads/token", json={"access_token": "old", "expires_in": -10})
    ga = next(p for p in client.get("/platforms").json() if p["platform"] == "google_ads")
    assert ga["expired"] is True


def test_revoke_makes_token_unusable():
    client.put("/platforms/meta/token", json={"access_token": "tok"})
    assert client.post("/platforms/meta/revoke").json()["revoked"] is True
    assert tokens.get_valid_token("meta") is None


def test_stored_token_round_trips():
    client.put("/platforms/meta/token", json={"access_token": "secret-xyz"})
    tok = tokens.get_valid_token("meta")
    assert tok is not None and tok.access_token == "secret-xyz"


def test_connector_is_mock_without_enabled_real_connector():
    # A token exists for meta, but the real connector ships disabled -> mock.
    client.put("/platforms/meta/token", json={"access_token": "tok"})
    assert connectors.select_connector(_campaign("Meta")).name == "mock"


def test_connector_selects_real_when_enabled(monkeypatch):
    client.put("/platforms/meta/token", json={"access_token": "tok"})
    monkeypatch.setattr(connectors._REAL["meta"], "enabled", True)
    assert connectors.select_connector(_campaign("Meta")).name == "meta"
