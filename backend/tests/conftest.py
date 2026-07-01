"""Test setup — use a throwaway SQLite DB so tests never touch real data."""

import os
import pathlib

# Must be set before the app (and app.db) is imported.
os.environ["DATABASE_URL"] = "sqlite:///./test_adscale.db"

# Start each test session from a clean database.
_db = pathlib.Path("test_adscale.db")
if _db.exists():
    _db.unlink()
