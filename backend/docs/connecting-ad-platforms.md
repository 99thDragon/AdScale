# Connecting Ad Platforms (free sandbox/test setup) — for #24

Goal: get a **free** token from Meta or Google Ads so the real connector in
`backend/app/connectors.py` can be enabled. Nothing here costs money — you only
pay if you later run *real* campaigns with real budget.

**Do Meta first** — its sandbox is immediate, free, and its token fits our API
directly. Google Ads works too but needs a couple of extra credentials.

---

## Part A — Meta (Facebook) Marketing API — sandbox ✅ recommended first

### 1. Developer account + app
1. Go to **developers.facebook.com** → log in with a Facebook account → **Get Started** (free; may ask you to verify).
2. **My Apps → Create App** → app type **Business** → give it a name (e.g. "AdScale Dev") → create.

### 2. Add the Marketing API
3. In the app dashboard → **Add Product** → find **Marketing API** → **Set up**.

### 3. Create a sandbox ad account (no spend, no real ads)
4. App dashboard → **Marketing API → Tools** (or **Settings**) → create a **Sandbox Ad Account**.
   - A sandbox account lets you create campaigns/ad sets/ads through the API without spending or serving real ads.
5. Copy the sandbox **ad account ID** — it looks like `act_1234567890`.

### 4. Generate an access token (with `ads_management`)
6. In **Marketing API → Tools**, use the **Get Access Token** button (or the **Graph API Explorer**), and grant the **`ads_management`** and **`ads_read`** permissions.
7. Copy the **access token** (a long string).
   - For a longer-lived token later, create a **System User** in Meta Business Settings and generate a token there — but the short token is fine to start.

### 5. What you'll have
- `access_token` — the token string
- `account_id` — `act_...` (the sandbox account)
- scope is `ads_management` (our default)

➡️ **Jump to Part C** to plug these into AdScale.

---

## Part B — Google Ads API — test access

Free, but has a couple more moving parts (a developer token + an OAuth client).

### 1. Google Ads + Manager account
1. Create a Google Ads account at **ads.google.com** (choose **Expert mode** and you can skip creating a campaign).
2. Create a **Manager account (MCC)**: ads.google.com/home/tools/manager-accounts.

### 2. Developer token (starts as free Test access)
3. In the **Manager account → Admin → API Center**, request a **developer token**.
   - It's issued with **Test Account access immediately** — enough to build against test accounts for free. (Live access needs a short application later.)

### 3. OAuth client
4. **Google Cloud Console** → new project → **enable "Google Ads API"**.
5. **Credentials → Create OAuth client ID** (Desktop app is easiest) → copy the **Client ID** + **Client Secret**.
6. Generate a **refresh token** for your account (via the OAuth2 flow — e.g. Google's OAuth Playground, authorizing the scope `https://www.googleapis.com/auth/adwords`).

### 4. Test account
7. In the Manager account, create a **test client account** and copy its **customer ID** (`123-456-7890`).

### 5. What you'll have
- `developer_token`, `client_id`, `client_secret`, `refresh_token`, `customer_id`
- Note: Google Ads needs more than a single token, so the connector reads
  `developer_token` / `client_id` / `client_secret` from **env vars**
  (`GOOGLE_ADS_*`) and the `refresh_token` + `customer_id` from the token store.

---

## Part C — Plug it into AdScale

### 1. (Recommended) Set an encryption key so tokens aren't stored in plaintext
Generate one and add it to `backend/.env`:
```bash
cd backend
.venv\Scripts\python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
```
# backend/.env
TOKEN_ENCRYPTION_KEY=<paste the generated key>
```

### 2. Start the backend
```bash
cd backend
.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```

### 3. Deposit the token (Meta example)
Use the `/docs` page (http://localhost:8000/docs → `PUT /platforms/meta/token`) or curl:
```bash
curl -X PUT http://localhost:8000/platforms/meta/token \
  -H "Content-Type: application/json" \
  -d '{"access_token":"YOUR_TOKEN","account_id":"act_1234567890"}'
```
Check it landed: `GET /platforms` → should show `meta` connected, not expired.

### 4. Enable the real connector
This is the code step (a dev can do it, or ask me):
1. In `backend/app/connectors.py`, implement `MetaAdsConnector.launch` / `refresh`
   against the Graph API using `self._token()`, capping spend at
   `effective_ceiling(...)`.
2. Set `enabled = True` on that connector.
3. `select_connector()` will then route launches to Meta whenever a valid token
   exists — otherwise it stays on the mock.

---

## Notes
- Sandbox/test = **no real spend, no real ad delivery**. Safe to experiment.
- Signup/approval UIs on both platforms **change often** — treat the exact button
  names above as a guide and follow the current developer docs.
- Keep tokens out of git — they go in `backend/.env` (gitignored) or via the
  `/platforms` endpoint, never committed.
