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
| `POST /campaigns/{id}/launch` | launch — 409 if not yet approved |
| `GET /campaigns/{id}/optimizations` | AI optimization suggestions (plain-language) |
| `GET /campaigns/{id}/impact-story` | indexed impact summary |

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
- [ ] Real Google/Meta OAuth — #19
- [ ] Ad-platform connectors + live performance — #24
- [ ] Server-side spend-cap enforcement — #25
- [ ] LLM-indexed impact story — #23
- [ ] Persist to a real DB (Supabase/Postgres) — #18
