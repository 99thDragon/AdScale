# AdScale AI — MVP Build Checklist

Divides the remaining PRD features between the two of us so we can build in
parallel and merge cleanly (same approach that worked for the login system).

**Current state — MVP complete, all merged to `main`:**
- ✅ Frontend cockpit complete **and wired to the live backend** via `src/api/campaigns.js` (set `VITE_API_BASE_URL`, else it falls back to mock data).
- ✅ Backend complete — FastAPI + SQLite (Postgres/Supabase-swappable), LLM campaign agent, guardrails, indexed impact story (15 pytest tests pass).
- ✅ Real Google login via Supabase Auth.
- **Only remaining:** swap the mock ad-platform connector for real Google Ads / Meta API calls (#24) and the ad-platform token lifecycle that depends on it (#27).

### Owners
- 🧠 **Erasmo** — AI agent, backend, integrations → new dirs `/backend`, `/agent`
- 🎛️ **Adedoyin** — frontend screens & flows → `/src`

### Legend
`[P0]` MVP must-have · `[P1]` next · `[P2]` later — current status: ✅ done · 🟡 mock/UI-only · ⬜ not started

---

## 🎛️ Adedoyin — Frontend (the Cockpit)

Everything in `/src`. Build against a **mock JSON** of the API contract (below)
until the backend is live, then just swap the fetch URL.

### Core loop: brief → launch
- [x] `[P0]` Wire the **"Run Agent"** button in `GoalInput.jsx` to call `POST /campaigns/generate` ✅ 🟡
- [x] `[P0]` Build the campaign **review screen** — show the AI-generated structure before anything launches ✅ 🟡 (`CampaignPreview.jsx` — pre-launch review)
- [x] `[P1]` Make AI fields **editable** (copy, targeting, budget) before approval ✅ 🟡 (`CampaignPreview.jsx`)
- [x] `[P0]` **Preview** screen: full campaign + estimated spend ✅ 🟡
- [x] `[P0]` **Approve-before-spend** confirm (nothing launches without an explicit click) ✅ 🟡 (`ApproveConfirmModal.jsx`)
- [x] `[P1]` Multi-channel launch UI (pick connected channels) ✅ 🟡 (`ChannelSelector.jsx`)
- [x] `[P2]` Save briefs as reusable templates ✅ 🟡 (`briefTemplates.js` + `GoalInput.jsx`)

### Performance & reporting
- [x] `[P0]` Replace `mockCampaigns.js` with live data from `GET /campaigns` ✅ 🟡 (Dashboard loads via API; mock plugin still serves data)
- [x] `[P0]` Optimization-suggestions UI — render the agent's plain-language suggestions ✅ 🟡 (`OptimizationSuggestions.jsx`)
- [x] `[P1]` Impact-story display — render the indexed summary the backend generates ✅ 🟡 (`ImpactStoryPanel.jsx`)

### Marketing-lead view + guardrails (PRD Journey 2)
- [x] `[P0]` Marketing-lead dashboard view — results + spend in one place (role toggle) ✅ 🟡 (`RoleToggle.jsx`, `MarketingLeadDashboard.jsx`)
- [x] `[P0]` Spend-cap input UI ✅ 🟡 (`GuardrailsPanel.jsx`, `guardrails.js`)
- [x] `[P1]` Approval-threshold settings UI ✅ 🟡 (`GuardrailsPanel.jsx`)
- [x] `[P1]` Show the impact summary to the lead ✅ 🟡 (portfolio impact story on lead view)

---

## 🧠 Erasmo — Backend / AI Agent (the Brain)

New dirs (`/backend`, `/agent`) — no overlap with `/src`.

### Foundation
- [x] `[P0]` Stand up backend (FastAPI) + DB — SQLite, `DATABASE_URL`-swappable to Postgres/Supabase ✅ #18
- [x] `[P0]` Real Google **OAuth** via Supabase Auth (`AuthContext.jsx` + `src/lib/supabaseClient.js`) ✅ #19

### AI agent
- [x] `[P0]` `POST /campaigns/generate` — LLM (Claude tool use) → structured campaign JSON ✅ #20
- [x] `[P0]` AI optimization suggestions with plain-language explanations ✅ #21
- [x] `[P1]` Auto-optimization within budget guardrails ✅ #22
- [x] `[P1]` Indexed **"impact story"** generation ✅ #23

### Integration + safety
- [~] `[P0]` Ad-platform connectors (Google Ads / Meta API): launch + pull live performance — 🟡 **mock done; real API pending** #24
- [x] `[P0]` Server-side **spend-cap enforcement** (agent cannot exceed the cap) ✅ #25
- [x] `[P1]` Approval thresholds for spend above a set amount ✅ #26
- [~] `[P0]` Token lifecycle: minimal scope + expiry/revocation (PRD §6c) — 🟡 **login handled by Supabase; ad-platform pending** #27 (needs #24)

---

## 🤝 Shared contract — agree on this FIRST

This is our one coordination point (the equivalent of `App.jsx` in the login
work). Lock these JSON shapes so we can build in parallel without blocking:

```
POST /campaigns/generate    { goal }   → { campaign }
GET  /campaigns                         → [ campaign + live performance ]
POST /campaigns/:id/launch              → { status }
POST /campaigns/:id/approve             → { status }
GET  /campaigns/:id/impact-story        → { indexed summary }
```

## 🏁 First slice — do this before anything else

The **brief → review → approve** vertical is the product's core reason to exist
(PRD §3, the P0 critical path):

1. **Erasmo:** `POST /campaigns/generate` returns a campaign structure. ✅
2. **Adedoyin:** review + approve screen, built against the contract. ✅
3. Ship that, then add live data + optimization. ✅ (backend live + wired end-to-end)

---

*Source: [`PRD.md`](PRD.md) §3. Check the boxes as we go.*
