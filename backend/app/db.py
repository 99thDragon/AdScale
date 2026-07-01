"""Database setup (SQLAlchemy).

Defaults to a local SQLite file so the backend persists across restarts with no
external setup. Point `DATABASE_URL` at Postgres/Supabase later — nothing else
in the app changes (issue #18).
"""

from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./adscale.db")

# check_same_thread is a SQLite-only quirk needed under a threaded server.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def init_db() -> None:
    """Create tables if they don't exist."""
    from . import db_models  # noqa: F401  (register models on Base)

    Base.metadata.create_all(bind=engine)
