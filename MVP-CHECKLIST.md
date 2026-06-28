# AdScale AI — MVP Build Checklist

Divides the remaining PRD features between the two of us so we can build in
parallel and merge cleanly (same approach that worked for the login system).

**Current state of `main`:** the dashboard + login are **mock UI only** — there
is no backend, no AI agent, and no real OAuth yet. Everything below is that
missing work, pulled from [`PRD.md`](PRD.md) §3.

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
- [ ] `[P0]` Wire the **"Run Agent"** button in `GoalInput.jsx` to call `POST /campaigns/generate` (it currently does nothing — 🟡)
- [ ] `[P0]` Build the campaign **review screen** — show the AI-generated structure before anything launches
- [ ] `[P1]` Make AI fields **editable** (copy, targeting, budget) before approval
- [ ] `[P0]` **Preview** screen: full campaign + estimated spend
- [ ] `[P0]` **Approve-before-spend** confirm (nothing launches without an explicit click)
- [ ] `[P1]` Multi-channel launch UI (pick connected channels)
- [ ] `[P2]` Save briefs as reusable templates

### Performance & reporting
- [ ] `[P0]` Replace `mockCampaigns.js` with live data from `GET /campaigns` (🟡 currently 6 hardcoded cards)
- [ ] `[P0]` Optimization-suggestions UI — render the agent's plain-language suggestions
- [ ] `[P1]` Impact-story display — render the indexed summary the backend generates

### Marketing-lead view + guardrails (PRD Journey 2)
- [ ] `[P0]` Marketing-lead dashboard view — results + spend in one place (role toggle)
- [ ] `[P0]` Spend-cap input UI
- [ ] `[P1]` Approval-threshold settings UI
- [ ] `[P1]` Show the impact summary to the lead

---

## 🧠 Erasmo — Backend / AI Agent (the Brain)

New dirs (`/backend`, `/agent`) — no overlap with `/src`.

### Foundation
- [ ] `[P0]` Stand up backend (FastAPI or Supabase) + DB (goals, campaigns, tokens)
- [ ] `[P0]` Real Google/Meta **OAuth** — drop into the seam already in `src/auth/AuthContext.jsx` (`signInWithGoogle` / `signInWithMeta`)

### AI agent
- [ ] `[P0]` `POST /campaigns/generate` — LLM parses a plain-language goal → structured campaign JSON (offer, audience, channels, budget)
- [ ] `[P0]` AI optimization suggestions with plain-language explanations
- [ ] `[P1]` Auto-optimization within budget guardrails
- [ ] `[P1]` Indexed **"impact story"** generation

### Integration + safety
- [ ] `[P0]` Ad-platform connectors (Google Ads / Meta API): launch + pull live performance
- [ ] `[P0]` Server-side **spend-cap enforcement** (agent cannot exceed the cap)
- [ ] `[P1]` Approval thresholds for spend above a set amount
- [ ] `[P0]` Token lifecycle: minimal scope + expiry/revocation (PRD §6c)

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

1. **Erasmo:** `POST /campaigns/generate` returns a campaign structure.
2. **Adedoyin:** review + approve screen, built against the mock contract.
3. Ship that, then add live data + optimization.

---

*Source: [`PRD.md`](PRD.md) §3. Check the boxes as we go.*
