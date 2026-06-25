# FoundrAI — Full Stack

A real backend powers this app: **Node.js + Express API** backed by a **SQLite database** (file: `backend/foundrai.sqlite`, auto-created and seeded on first run). The React frontend talks to it over REST instead of using hardcoded mock arrays.

## What was actually broken (and how it was found)

I unzipped the project, ran the *unmodified* backend against the *unmodified* frontend in a real headless browser (not just a code read) and watched registration happen step by step. The backend correctly created the account, hashed the password, and returned a valid JWT (confirmed in `localStorage`) — but the screen just snapped back to the landing page, exactly like a failed registration.

**The bug:** in `App.jsx`, the top-level component passed `LandingPage` a `navigate` function that re-checked `if (!user) return to landing`. `handleRegister`/`handleLogin` call `setUser(user)` and then immediately call `navigate("dashboard")` in the same synchronous function — but React state updates aren't applied synchronously, so that `navigate` closure was still reading the *old* `user` value (`null`) from before the update. The gate saw "nobody's logged in" and bounced straight back to the landing page, even though the account was created successfully and the token was stored. Login had the identical bug.

**The fix:** `LandingPage` only ever calls `navigate()` right after it has just obtained a fresh user, so the gate was both wrong and unnecessary there — unauthenticated nav clicks are already safely routed to the login modal by `goOrLogin()` elsewhere in the component. The fix passes a plain `setPage` instead of the stale-closure-gated wrapper. Verified with an automated browser test: register → lands on dashboard with real data; logout → log back in → same; create startup, apply, connect, book a mentor, evaluate an idea, generate a pitch, edit profile — all confirmed writing to and reading back from the SQLite database with no console errors.

## Also hardened: zero native dependencies in the backend

The original backend used `better-sqlite3`, a native addon that needs either a prebuilt binary for your exact OS/CPU/Node version or a local C++ compile during `npm install`. That step fails silently on a lot of machines (missing build tools, an unusual Node version, certain Windows/Apple Silicon setups) — `npm install` can look fine while the backend never actually starts, and every API call (including register) just fails with no obvious cause.

`backend/lib/sqlite-driver.js` now wraps Node's own built-in `node:sqlite` (shipped since Node v22.5.0, no install step, no compiler) behind the same small slice of the better-sqlite3 API the route code uses. `better-sqlite3` has been removed from `package.json` entirely — `npm install` now only ever fetches four small pure-JS packages (express, cors, bcryptjs, jsonwebtoken), and `node server.js` works immediately afterward with no extra flags.

## Project structure
```
foundrai/
├── backend/                Express API + SQLite database
│   ├── lib/sqlite-driver.js  zero-dependency DB driver (wraps node:sqlite)
│   ├── db.js                 schema + seed data
│   ├── server.js             all REST routes
│   └── package.json
└── frontend/                Vite + React app
    ├── src/App.jsx           full UI (register/login navigation bug fixed)
    ├── src/main.jsx
    └── package.json
```

## Run it

### 1. Backend (API + database)
Requires **Node.js v22.5.0 or newer** (for the built-in `node:sqlite` module). Check with `node -v`; upgrade at https://nodejs.org if needed.
```bash
cd backend
npm install
npm start          # http://localhost:4000
```
This creates `foundrai.sqlite` and seeds it with founders, startups, mentors, investors, and a demo login:
- **Email:** `demo@foundrai.com`
- **Password:** `password123`

### 2. Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```
The frontend points at `http://localhost:4000/api` by default. Both servers need to be running at the same time, in two separate terminals — if the backend isn't running, every API call (including register/login) will fail. To change the API URL, set `window.FOUNDRAI_API_URL` before the app loads, or edit `API_URL` in `App.jsx`.

## Database
SQLite via Node's built-in `node:sqlite`, tables: `users`, `founders`, `startups`, `mentors`, `investors`, `connections`, `applications`. Browse it with any SQLite client (e.g. `sqlite3 backend/foundrai.sqlite` or DB Browser for SQLite) — the file format is standard SQLite, so `better-sqlite3`-based tools work too. Swap in Postgres/MySQL later by replacing `db.js` and `lib/sqlite-driver.js` — the route code in `server.js` only relies on the small query API, so the migration surface is small.

## API reference
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | – | Create account, returns JWT |
| POST | /api/auth/login | – | Returns JWT |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/founders | – | List/filter founders (`role`, `location`, `skills`, `domain`) |
| POST | /api/founders/:id/connect | ✓ | Send connection request |
| GET | /api/startups | – | List/filter startups (`search`, `domain`) |
| POST | /api/startups | ✓ | Create a startup |
| POST | /api/startups/:id/apply | ✓ | Apply to a startup |
| GET | /api/mentors | – | List/filter mentors (`domain`) |
| GET | /api/investors | – | List investors |
| POST | /api/match | – | Rule-based co-founder match scoring |
| GET | /api/health | – | Health check |

## Note on the AI Evaluator / Pitch Generator pages
These call the backend's template-based `/api/ai/*` endpoints, so they work with zero API keys configured. Swap the handlers in `server.js` for real Anthropic calls server-side (never from the browser) if you want live model output instead.

