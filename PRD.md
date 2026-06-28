# Product Requirements Document — Net New Build

**Build name:** AdScale AI  
**Owner:** Erasmo Concepcion, Adedoyin Ahoton  
**Date:** May 2026

---

## 1. PROBLEM

Advertising managers are experiencing a slow, largely invisible displacement. The executional work that defines their role — building, versioning, launching, and reporting on campaigns — is increasingly automated by self-serve ad platforms and absorbed into larger marketing teams. As a result, they are stuck doing high-volume, low-leverage busywork on shrinking teams, with no time for the strategic work that would keep them relevant, and no easy way to prove their impact in the data-fluent language marketing teams now speak. From an identical 2020 baseline, marketing-management jobs grew about 46% while advertising-management jobs fell about 4.5% over five years — a divergence raw headcounts hide because advertising is roughly 18× the smaller field.

### Supporting Context

- **BLS OEWS (2020–2025):** marketing managers grew 270,200 → 395,240 (+46%); advertising & promotions managers slipped 22,490 → 21,470 (−4.5%).
- **Self-serve automation** (Google Performance Max, Meta Advantage+) now handles campaign setup and optimization that advertising managers used to own.
- The divergence is only visible after indexing both roles to a 2020 = 100 baseline; in raw headcount the decline looks like noise.

### 1a. Opportunity

If advertising managers had an AI tool that absorbed their executional workload, a single manager could produce the output of a full marketing team — turning a shrinking, at-risk role into a high-leverage one. AdScale can serve the tens of thousands of U.S. advertising managers (and a far larger global pool) operating inside a digital-advertising market exceeding $600B, where no neutral tool yet puts the advertising manager in command of cross-platform automation.

#### Market Opportunity

- U.S. digital ad spend exceeds $300B; global digital ad spend exceeds $600B and is still growing.
- Platforms automate only inside their own walls — there is no cross-platform agent built for the advertising manager.

### 1b. Users & Needs

**Primary user(s):** In-house and agency advertising / paid-media managers who run multi-channel campaigns on lean teams, value speed, and want to move up the value chain from execution to strategy.

**Secondary users:** Marketing leads / CMOs who approve budgets and need confidence in results; small-business owners who run their own ads.

#### Key User Needs

- As an advertising manager, I need to launch campaigns across channels without rebuilding them platform by platform, because manual setup consumes the time I need for strategy.
- As an advertising manager, I need optimization to run automatically but transparently, because I must stay in control of how budget is spent.
- As an advertising manager, I need to turn performance data into a clear, indexed story, because I have to defend my budget against data-fluent marketing teams.

---

## 2. PROPOSED SOLUTION

AdScale AI is a cross-platform AI agent for advertising managers that turns plain-language goals into live, optimized ad campaigns. A manager describes what they want — the offer, the audience, the channels, and the budget — and the system builds, versions, and stages the campaigns across platforms, then runs continuous optimization once the manager approves. As a result, one person can do the executional work that used to require a whole team, freeing them to focus on creative judgment and paid-conversion strategy.

### 2a. Value Proposition

Advertising managers who struggle with executional busywork and the automation eroding their role use AdScale AI, a cross-platform campaign agent, to launch and optimize campaigns from a single plain-language command. Unlike the platforms' walled-garden tools, it works across channels and keeps the human in command, helping managers reclaim hours and compound their value instead of being automated away.

### 2b. Top 3 MVP Value Props

| Tier | Label | Description |
|------|-------|-------------|
| **The Vitamin** (must-have baseline) | Build and launch a campaign on a connected ad platform from a single plain-language brief. |
| **The Painkiller** (solves the core pain) | Eliminate the repetitive cross-channel setup, versioning, and reporting busywork that eats the manager's day. |
| **The Steroid** (the magic moment) | An auto-generated, indexed "impact story" that proves the manager's results in seconds — in the same data language marketing teams use. |

### 2c. Goals & Non-Goals

#### Goals

- Let one advertising manager run the multi-channel campaign workload that previously required a team.
- Keep humans in control through an approve-before-spend workflow that earns trust from day one.
- Cut the time from campaign brief to launch from days to minutes.
- Give managers a data-fluent way to prove and defend their impact.

#### Non-Goals

- Fully autonomous spending without human approval (deferred — trust and liability risk).
- Replacing the broader marketing stack (CRM, content, brand) — we stay focused on paid advertising.
- Career, reskilling, or educational features — this is an operational tool, not training.

### 2d. Success Metrics

| Goal | Signal | Metric | Target |
|------|--------|--------|--------|
| Time-to-launch | Managers launch campaigns faster | Median minutes from brief to staged campaign | under 15 minutes |
| Adoption | Managers run real campaigns | Weekly active managers | over 100 WAM by day 90 |
| Leverage | More output per person | Campaigns managed per user per week | 3× the pre-tool baseline |
| Trust | Managers approve AI drafts | % of AI-built campaigns approved and launched | over 60% |

---

## 3. REQUIREMENTS

### User Journey 1: Advertising manager launching a multi-channel campaign

**Context:** This is the core loop — turning a brief into live campaigns is the product's reason to exist, so it must be fast and trustworthy.

#### Sub-journey: Briefing the campaign

- **[P0]** User can connect at least one ad-platform account (e.g., Google Ads or Meta) via OAuth.
- **[P0]** User can describe a campaign goal in plain language (offer, audience, channels, budget).
- **[P0]** User can review an AI-generated campaign structure before anything launches.
- **[P1]** User can edit any AI-generated field (copy, targeting, budget) before approval.
- **[P2]** User can save briefs as reusable templates.

#### Sub-journey: Approving & launching

- **[P0]** User can preview the full campaign and estimated spend before launch.
- **[P0]** User must explicitly approve before any budget is committed.
- **[P1]** User can launch the same campaign to multiple connected channels at once.

#### Sub-journey: Optimizing & reporting

- **[P0]** User can see live performance for active campaigns.
- **[P0]** User can view AI optimization suggestions with plain-language explanations.
- **[P1]** User can enable auto-optimization within set budget guardrails.
- **[P1]** User can generate an indexed "impact story" summary on demand.

### User Journey 2: Marketing lead approving budget and impact

**Context:** The approver needs confidence that the AI is safe to run and that the reported results are real.

#### Sub-journey: Reviewing performance

- **[P0]** User can view a manager's campaign results and spend in one dashboard.
- **[P1]** User can see the indexed impact summary the manager generated.

#### Sub-journey: Setting guardrails

- **[P0]** User can set spend caps the agent cannot exceed.
- **[P1]** User can require approval thresholds for spend above a set amount.

---

## 4. ARCHITECTURE

### 4a. Core Components

| Component | Description |
|-----------|-------------|
| **Frontend / User Interface** | A minimalist dashboard where the user inputs their high-level marketing goal (e.g., via a simple text prompt) and views real-time campaign performance metrics. |
| **Orchestration Layer (The AI Agent)** | The brain of the application (built with Python). It uses an LLM to parse the user's natural language intent, translate it into structured marketing parameters (budgets, target demographics, ad copy), and make autonomous decisions. |
| **Backend API & Database** | A robust backend (like FastAPI or Supabase) to manage user authentication, store stateful data (active campaigns, performance logs, agent history), and handle incoming webhook data from ad networks. |
| **Integration Layer (Ad Platform Connectors)** | The execution arm that securely communicates with external advertising APIs (like Meta Graph API or Google Ads API) to deploy, monitor, and adjust campaigns. |

### 4b. Data Flow

1. **Intent Capture:** The user inputs a goal into the Frontend, which sends a payload to the Backend API.
2. **Agent Reasoning:** The Backend passes the goal to the Orchestration Layer. The AI agent processes the prompt, queries the Database for historical performance data, and generates a structured execution plan.
3. **Execution:** The agent dispatches the finalized campaign parameters through the Integration Layer directly to the external Ad Platform APIs to launch or tweak the ads.
4. **Feedback Loop:** The Ad Platforms send performance metrics back via webhooks or cron-job polling to the Backend, updating the Database so the agent can optimize the campaign 24/7 and display live updates on the Frontend.

---

## 5. TECH STACK & CURRENT BUILD FOCUS

### 5a. Frontend Stack

- **Framework:** React (built with Vite)
- **Styling:** Tailwind CSS
- **Status:** Repo initialized, dependencies installed, boilerplate cleared for a clean dashboard interface.

### 5b. Current Build Session Focus

**UI/UX and core feature:** The Autonomous Ad Manager Dashboard UI.

**First specific deliverable:** Build the frontend text-input component where the user enters their marketing goals, along with a hardcoded mockup layout of the campaign tracking cards. This nails the user experience, prompt styling, and layout before connecting any backend logic.

**Immediate priority:** Static UI layout of the main dashboard — render the text-input box for goals and hardcoded campaign tracking cards using Tailwind CSS. Lock in the design layout before adding frontend state or interactivity.

---

## 6. DATA MINIMIZATION (MVP)

For a true MVP, minimize data storage by separating what is strictly functional from what is "nice to have."

### 6a. What We Store (Minimal)

| Data | Rationale |
|------|-----------|
| **Temporary OAuth access token** | Required to pass commands from the frontend to ad platform APIs. External platforms handle heavy security. |
| **Raw text of the user's high-level goal** | So the agent remembers its current objective. |

### 6b. What We Remove / Do Not Collect

- **Custom user credentials** (usernames/passwords) — not needed; OAuth from Meta or Google is sufficient for an enterprise/business tool.
- **Comprehensive campaign performance logs** — ad platforms already keep an immutable history of every metric, budget change, and creative tweak. Query platform APIs in real-time instead of duplicating that dataset.

### 6c. Secure Build Checklist

- [ ] **OAuth Token Lifecycle & Minimal Scope:** Ensure external ad platform API scopes are strictly limited to "read/write campaigns" (no access to unrelated billing or personal account PII), and implement a strict token expiration/revocation workflow so access tokens are never permanently stored in plain text.

---

## 7. APPENDIX

- **Data source:** U.S. Bureau of Labor Statistics, OEWS, 2020–2025 (marketing vs. advertising manager headcount).
- **Feasibility:** Campaign and optimization APIs already exist (Google Ads API, Meta Marketing API); the MVP is one platform with a human-in-the-loop approval step.
- **Open questions:** Which ad platform to integrate first, how to price, and how to stay differentiated from the platforms' own native automation.
