# AdScale Backend (API + AI Agent)

FastAPI service that implements the shared API contract and the campaign-planning
agent. This is the **backend track** from [`../MVP-CHECKLIST.md`](../MVP-CHECKLIST.md).

## Run it

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows  (use: source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### AI vs. mock mode
- **No API key** → the agent returns a deterministic mock campaign (good enough
  for frontend dev). Just run it.
- **Real AI** → copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. The
  agent then uses Claude (`ANTHROPIC_MODEL`, default `claude-sonnet-5`) with tool
  use to generate the campaign structure.

## API contract

| Method & path | Purpose |
|---|---|
| `POST /campaigns/generate` | `{ goal }` → AI-generated `Campaign` (status `draft`) |
| `GET /campaigns` | list all campaigns + performance |
| `POST /campaigns/{id}/approve` | explicit approval (required before launch) |
| `POST /campaigns/{id}/launch` | launch — 409 if not approved / over threshold |
| `POST /campaigns/{id}/sync` | pull latest performance from the connector |
| `PUT /campaigns/{id}/spend-cap` | `{ cap }` — guardrail the agent can't exceed |
| `PUT /campaigns/{id}/approval-threshold` | `{ amount }` — spend above this needs confirmation |
| `GET /campaigns/{id}/optimizations` | AI optimization suggestions (plain-language) |
| `POST /campaigns/{id}/auto-optimize` | apply top optimizations within the guardrail |
| `GET /campaigns/{id}/impact-story` | indexed impact summary |
| `GET /platforms` | connected ad platforms + token status |
| `PUT /platforms/{platform}/token` | deposit an OAuth token (`meta` / `google_ads`) |
| `POST /platforms/{platform}/revoke` | revoke a platform connection |

### Ad-platform connectors + token lifecycle (#24 / #27)

`launch`/`sync` dispatch through `connectors.select_connector(campaign)`: the
**real** connector runs when its platform has a valid token **and** is enabled,
otherwise the **mock** (current default). OAuth tokens are managed by
`tokens.py` — minimal scope, expiry, refresh, revocation, and **encrypted at
rest** when `TOKEN_ENCRYPTION_KEY` is set (PRD §6c). Going live per platform is a
bounded change: implement the real `launch`/`refresh` in `connectors.py` and set
`enabled = True`.

### `Campaign` shape (what the frontend consumes)

```json
{
  "id": "1",
  "status": "draft",
  "draft": {
    "name": "Summer Sale",
    "objective": "conversions",
    "channels": ["Meta", "Google Ads"],
    "audience": { "description": "...", "age_range": "25-45", "locations": [], "interests": [] },
    "budget": { "total": 2000, "daily": 100, "currency": "USD" },
    "ad_copy": [{ "headline": "...", "body": "...", "cta": "Shop now" }]
  },
  "performance": null
}
```

**Frontend mapping** (for the existing `CampaignCard`): `draft.name` → name,
`draft.channels[0]` → platform, `status` → status, `performance.spend/budget_total`
→ budget bar, `performance.ctr` / `performance.conversions` → stats.

## Status / TODO (backend issues)

- [x] `POST /campaigns/generate` (LLM goal → structured draft) — #20
- [x] Approve-before-spend enforced on launch, API side (supports #9)
- [x] AI optimization suggestions + explanations — #21
- [x] Persist to a real DB — SQLite now, Postgres/Supabase via `DATABASE_URL` — #18
- [x] Ad-platform connector + live performance (mock) — #24
- [x] Server-side spend-cap enforcement — #25
- [x] Auto-optimization within guardrails — #22
- [x] LLM-indexed impact story — #23
- [x] Approval thresholds for high spend — #26
- [x] Real Google login via Supabase Auth — #19
- [x] OAuth token lifecycle — minimal scope, expiry, refresh, revoke, encrypted at rest — #27
- [x] Connector seam (real-when-token, else mock) + `/platforms` endpoints — #24
- [ ] Implement + enable the real Google Ads / Meta API calls — #24 (needs platform dev credentials + test ad account)
