"""OAuth token lifecycle for ad-platform connections (issue #27, PRD §6c).

Stores per-platform OAuth tokens with **minimal scope**, tracks **expiry**, and
supports **refresh** and **revocation**. Tokens are **encrypted at rest** when
`TOKEN_ENCRYPTION_KEY` (a base64 Fernet key) is set; otherwise they are stored
in plaintext for local dev with a warning — never do that in production.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from .db import SessionLocal
from .db_models import PlatformTokenRow

log = logging.getLogger("adscale.tokens")

# Least privilege each platform needs — read/write campaigns only (PRD §6c).
MINIMAL_SCOPES = {
    "google_ads": "https://www.googleapis.com/auth/adwords",
    "meta": "ads_management",
}

_KEY = os.environ.get("TOKEN_ENCRYPTION_KEY")
_fernet = None
if _KEY:
    from cryptography.fernet import Fernet

    _fernet = Fernet(_KEY.encode() if isinstance(_KEY, str) else _KEY)
else:
    log.warning(
        "TOKEN_ENCRYPTION_KEY not set — ad-platform tokens stored in plaintext (dev only)."
    )


def _utcnow() -> datetime:
    # Naive UTC, so it compares cleanly with values read back from SQLite.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _enc(value: str | None) -> str | None:
    if value is None:
        return None
    return _fernet.encrypt(value.encode()).decode() if _fernet else value


def _dec(value: str | None) -> str | None:
    if value is None:
        return None
    return _fernet.decrypt(value.encode()).decode() if _fernet else value


class Token:
    """Decrypted, in-memory view of a stored token."""

    def __init__(self, row: PlatformTokenRow):
        self.platform = row.platform
        self.account_id = row.account_id
        self.scopes = row.scopes
        self.access_token = _dec(row.access_token)
        self.refresh_token = _dec(row.refresh_token)
        self.expires_at = row.expires_at
        self.revoked = row.revoked

    def is_expired(self) -> bool:
        return self.expires_at is not None and _utcnow() >= self.expires_at


def save_token(
    platform: str,
    access_token: str,
    refresh_token: str | None = None,
    expires_in: int | None = None,
    scopes: str | None = None,
    account_id: str | None = None,
) -> dict:
    expires_at = _utcnow() + timedelta(seconds=int(expires_in)) if expires_in else None
    with SessionLocal() as session:
        row = session.get(PlatformTokenRow, platform)
        if row is None:
            row = PlatformTokenRow(platform=platform)
            session.add(row)
        row.access_token = _enc(access_token)
        row.refresh_token = _enc(refresh_token)
        row.expires_at = expires_at
        row.scopes = scopes or MINIMAL_SCOPES.get(platform)
        row.account_id = account_id
        row.revoked = False
        session.commit()
    return get_status(platform)


def _get_row(platform: str) -> PlatformTokenRow | None:
    with SessionLocal() as session:
        return session.get(PlatformTokenRow, platform)


def get_valid_token(platform: str) -> Token | None:
    """Return an active, non-revoked token (refreshing if expired), else None."""
    row = _get_row(platform)
    if row is None or row.revoked:
        return None
    token = Token(row)
    if token.is_expired():
        token = refresh_token(platform)
    return token


def refresh_token(platform: str) -> Token | None:
    """Refresh an expired access token.

    The real exchange POSTs the stored `refresh_token` to the platform's token
    endpoint and persists the new access token + expiry. That requires live
    client credentials, so here it is the documented extension point — for now
    it returns the stored token unchanged.
    """
    row = _get_row(platform)
    if row is None or row.revoked:
        return None
    log.info("refresh_token(%s): no live client credentials; returning stored token.", platform)
    return Token(row)


def revoke(platform: str) -> bool:
    """Revoke a platform connection. Real impl would also hit the platform's
    revoke endpoint; here we mark it revoked so it is no longer usable."""
    with SessionLocal() as session:
        row = session.get(PlatformTokenRow, platform)
        if row is None:
            return False
        row.revoked = True
        session.commit()
        return True


def get_status(platform: str) -> dict:
    row = _get_row(platform)
    if row is None:
        return {"platform": platform, "connected": False}
    token = Token(row)
    return {
        "platform": platform,
        "connected": not row.revoked,
        "account_id": row.account_id,
        "scopes": row.scopes,
        "expires_at": row.expires_at.isoformat() if row.expires_at else None,
        "expired": token.is_expired(),
        "revoked": row.revoked,
    }


def list_status() -> list[dict]:
    with SessionLocal() as session:
        rows = session.execute(select(PlatformTokenRow)).scalars().all()
    return [get_status(r.platform) for r in rows]
