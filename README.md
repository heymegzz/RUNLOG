<div align="center">

```
██████╗ ██╗   ██╗███╗   ██╗██╗      ██████╗  ██████╗
██╔══██╗██║   ██║████╗  ██║██║     ██╔═══██╗██╔════╝
██████╔╝██║   ██║██╔██╗ ██║██║     ██║   ██║██║  ███╗
██╔══██╗██║   ██║██║╚██╗██║██║     ██║   ██║██║   ██║
██║  ██║╚██████╔╝██║ ╚████║███████╗╚██████╔╝╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝
```

**Distributed cron orchestration with real-time execution streaming.**  
Register HTTP endpoints as scheduled jobs. Watch every run fire in under 200ms.

[![CI](https://github.com/your-org/runlog/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/runlog/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://runlog-eta.vercel.app)

[**Live App**](https://runlog-eta.vercel.app) · [**API**](https://runlog-1.onrender.com/api/health) · [**Try Demo**](https://runlog-eta.vercel.app) (`demo@runlog.dev` / `demo123`)

</div>

---

## What is RunLog?

RunLog is a **production-grade job scheduling platform** built for engineering teams who need reliable, observable HTTP callbacks on a cron schedule — without babysitting a cron daemon on a server somewhere.

You register an endpoint, define a cron expression, and RunLog handles the rest: retry logic, failure alerts, team access control, and a Socket.io-powered execution feed that streams results as they happen.

```
$ runlog jobs list

  ID        NAME                 CRON           STATUS
  j_194x    send-digest          0 8 * * *      OK
  j_821a    sync-inventory       */15 * * * *   OK
  j_448b    cleanup-sessions     0 0 * * *      OK

$ runlog trigger send-digest
  ✓ complete in 142ms · HTTP 200 OK
```

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Health Check](#health-check)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [WebSocket Events](#websocket-events)
- [Deployment](#deployment)
- [Scripts & Utilities](#scripts--utilities)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Platform
- **Cron Scheduler** — Standard 5-field cron expressions parsed via `cron-parser`. Jobs calculate `nextRunAt` on create/update and are picked up by a minute-tick scanner.
- **Bull Queue Execution** — Jobs are dispatched into a Redis-backed Bull queue. Workers handle HTTP execution, retries, timeout enforcement, and response capture.
- **Real-Time Feed** — Every execution result is broadcast via Socket.io to all workspace members within milliseconds of completion. No polling. No page refreshes.
- **Manual Triggers** — Trigger any job on-demand from the dashboard or API. Socket events signal `queued → started → done` in sequence.

### Observability
- **Execution History** — Full log of every run: status, HTTP status code, duration (ms), response payload snippet, error details, and timestamp.
- **Dashboard Analytics** — Workspace-level metrics: total jobs, total executions, success rate, failed count, and a live execution table.
- **Per-Job Analytics** — 30-day daily bucketed stats with success/failure counts and average duration.

### Alerting & Notifications
- **Email Alerts** — Nodemailer integration sends rich HTML failure emails when a job exhausts all retries.
- **Slack Webhooks** — Post structured failure notifications directly to a Slack channel per job.
- **In-App Notifications** — The notification bell collects live Socket.io events (queued, started, done) so teams always know what's running.

### Team & Access Control
- **Multi-Tenant Workspaces** — Every user gets a workspace on registration. Workspaces are the isolation boundary for jobs, executions, and API keys.
- **Role-Based Access** — Three roles: `owner`, `admin`, `developer`. Enforced server-side on every protected route via `requireRole` middleware.
- **Member Invitations** — Invite registered users to a workspace with a specified role.

### Security
- **JWT Auth** — Short-lived access tokens (15 min) + long-lived refresh tokens (7 days) with rotation on refresh.
- **API Keys** — Scoped workspace keys with bcrypt-hashed secrets. Only the raw key is shown once at creation — never stored in plaintext.
- **Helmet + CORS** — Strict CORS origin allowlist, HTTP security headers via Helmet.
- **Rate Limiting** — Auth endpoints: 100 req/15 min. General API: 1,000 req/15 min via `express-rate-limit`.

### Developer Experience
- **Interactive Landing Page** — Fully animated product landing with a live execution terminal, scroll-driven "How It Works" timeline, 3D tilt dashboard preview, pricing, and testimonials.
- **Cron Builder UI** — Preset buttons + free-text field with human-readable preview via `cronstrue`.
- **Demo Account** — Auto-seeded on startup: 5 sample jobs, 40 synthetic execution records.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Vercel)                     │
│  React 19 + Vite 8 · Zustand · TanStack Query          │
│  Socket.io Client · React Router · Recharts             │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────┐
│                    SERVER (Render)                      │
│                                                         │
│  Express API ──► Routes ──► Middleware ──► Controllers  │
│                                │                        │
│          ┌─────────────────────┤                        │
│          │                     │                        │
│    CronScanner           Socket.io                      │
│  (node-cron, 1/min)    (workspace rooms)                │
│          │                     ▲                        │
│     Bull Queue                 │ emit                   │
│   (job dispatch)         Worker Process                 │
│          │               (axios HTTP call)              │
│          └─────────────────────┘                        │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
    MongoDB            Redis               Email / Slack
   (Atlas)           (Upstash)            (Nodemailer)
```

### Execution Lifecycle

```
CronScanner (every minute)
  └─► find active jobs where nextRunAt ≤ now
       └─► Bull.add({ jobId })  +  update nextRunAt
            └─► Worker.process()
                 ├─► emitExecutionStarted (Socket.io)
                 ├─► axios(callbackUrl, method, headers, body, timeout)
                 ├─► save Execution record (MongoDB)
                 ├─► update Job metrics (successCount / failureCount)
                 ├─► emitExecutionUpdate (Socket.io)
                 └─► sendFailureAlert (email + Slack, if failed)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 6, Zustand 4 |
| **Data Fetching** | TanStack Query 5, Axios 1 |
| **Realtime** | Socket.io Client 4 |
| **UI / Charts** | Recharts 2, Framer Motion 12, Lucide React |
| **Forms** | React Hook Form 7, Zod 3, @hookform/resolvers |
| **Backend** | Node.js ≥ 20.19, Express 4 |
| **Database** | MongoDB (Mongoose 8), Redis (ioredis 5 / Bull 4) |
| **Auth** | JSON Web Tokens, bcryptjs |
| **Scheduling** | node-cron 3, cron-parser 4, Bull 4 |
| **Realtime (server)** | Socket.io 4 |
| **Email** | Nodemailer 6 |
| **Security** | Helmet 7, express-rate-limit 7, cors 2 |
| **Frontend Host** | Vercel |
| **Backend Host** | Render |
| **DB Host** | MongoDB Atlas |
| **Redis Host** | Upstash |

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | `>=20.19.0` (**required** by Vite 8 and ESLint 10) |
| MongoDB | Local or [Atlas](https://www.mongodb.com/atlas) |
| Redis | Local or [Upstash](https://upstash.com) |
| npm | Bundled with Node |

> **Note:** Vite 8, ESLint 10, and the `@rolldown` binding packages all enforce `node >=20.19.0`. Older Node versions will fail at `npm install`.

---

### Backend Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` — the three required variables are:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/runlog
JWT_SECRET=<openssl rand -hex 32>
REDIS_URL=redis://127.0.0.1:6379
```

Install and start:

```bash
npm install
npm run seed    # optional — creates demo@runlog.dev / demo123 with sample data
npm run dev     # nodemon, hot-reload
```

API listens on **http://localhost:5005**.

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies all `/api/*` requests to `http://localhost:5005` — leave `VITE_API_URL` unset locally.

---

### Health Check

```bash
curl http://localhost:5005/api/health
# {"status":"ok","service":"runlog-api","timestamp":"..."}
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Access token signing secret |
| `REDIS_URL` | ✅ | — | Redis URL (`redis://` or `rediss://`) |
| `REFRESH_TOKEN_SECRET` | — | Falls back to `JWT_SECRET` | Refresh token secret |
| `JWT_EXPIRES_IN` | — | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | — | `7d` | Refresh token lifetime |
| `CLIENT_URL` | ✅ (prod) | — | Frontend origin for CORS |
| `PORT` | — | `5005` | HTTP port (Render sets this automatically) |
| `NODE_ENV` | — | `development` | `production` disables verbose error messages |
| `ENSURE_DEMO_USER` | — | `true` | Set `false` to skip demo account bootstrap |
| `SMTP_HOST` | — | — | SMTP server for failure email alerts |
| `SMTP_PORT` | — | `587` | SMTP port |
| `SMTP_USER` | — | — | SMTP username |
| `SMTP_PASS` | — | — | SMTP password / app password |
| `SMTP_FROM` | — | `SMTP_USER` | From address for alert emails |

> **Upstash Redis:** Copy the **Redis URL** from the Upstash dashboard → Connect → Redis. It starts with `rediss://`. Do **not** paste the `redis-cli` command — the server normalises common mistakes but the URL form is safest.

### Client (build-time)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full API base URL, e.g. `https://runlog-1.onrender.com/api`. Leave unset for local dev (Vite proxy handles it). |

---

## Project Structure

```
RUNLOG/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: install + build
│
├── client/                         # React SPA (deployed to Vercel)
│   ├── public/                     # Static assets (SVGs, favicon)
│   ├── src/
│   │   ├── api/                    # Axios instance + per-resource API modules
│   │   │   ├── axios.js            # Interceptors, token refresh, 401 handling
│   │   │   ├── auth.api.js
│   │   │   ├── jobs.api.js
│   │   │   └── executions.api.js
│   │   ├── components/
│   │   │   ├── Auth/               # AuthShell layout + CSS
│   │   │   ├── Brand/              # Logo component + CSS
│   │   │   ├── CronBuilder/        # Cron preset picker + live preview
│   │   │   ├── ExecutionLog/       # Log row component
│   │   │   ├── JobCard/            # Grid card for job list
│   │   │   ├── Layout/             # App shell (sidebar, topbar, Outlet)
│   │   │   ├── NotificationBell/   # Socket-driven notification dropdown
│   │   │   └── Toast/              # Global toast via Zustand
│   │   ├── config/
│   │   │   └── api.js              # getApiBaseUrl(), getSocketOrigin()
│   │   ├── context/
│   │   │   └── SocketContext.jsx   # Socket.io connection, live feed state
│   │   ├── hooks/
│   │   │   ├── useSocket.js        # Re-export of context hook
│   │   │   └── useToast.js         # Zustand-based toast store
│   │   ├── pages/
│   │   │   ├── Landing/            # Marketing landing page
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Executions.jsx
│   │   │   ├── Jobs/
│   │   │   │   ├── JobList.jsx
│   │   │   │   ├── JobForm.jsx     # Create + Edit (same component)
│   │   │   │   └── JobDetail.jsx
│   │   │   ├── Settings/
│   │   │   │   ├── Team.jsx
│   │   │   │   └── ApiKeys.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── router/
│   │   │   ├── AppRouter.jsx       # Route tree
│   │   │   └── ProtectedRoute.jsx  # Auth guard
│   │   ├── store/
│   │   │   └── authStore.js        # Zustand auth state + localStorage sync
│   │   ├── styles/
│   │   │   └── app.css             # App shell CSS (sidebar, topbar, cards)
│   │   ├── utils/
│   │   │   └── time.js             # relativeTime() helper
│   │   ├── index.css               # Design tokens, global resets, utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json                 # SPA rewrite rule
│   ├── vite.config.js
│   └── package.json
│
└── server/                         # Node API + scheduler + worker (Render)
    ├── index.js                    # App entry: middleware, routes, server start
    ├── scripts/
    │   ├── seed.js                 # Full demo data seed
    │   ├── checkJobs.js            # Debug: print next run times
    │   └── updateDemoJobs.js       # Fix missing nextRunAt on active jobs
    └── src/
        ├── config/
        │   ├── cors.js             # Origin allowlist + corsOrigin function
        │   ├── db.js               # Mongoose connect
        │   └── redis.js            # Bull queue + ioredis factory, URL normaliser
        ├── controllers/            # Route handler logic (thin, delegates to models)
        │   ├── analytics.controller.js
        │   ├── apikey.controller.js
        │   ├── auth.controller.js
        │   ├── execution.controller.js
        │   ├── job.controller.js
        │   └── workspace.controller.js
        ├── middleware/
        │   ├── authenticate.js     # JWT Bearer → req.user
        │   ├── requireWorkspace.js # x-workspace-id header → req.workspace
        │   ├── requireRole.js      # RBAC role check against WorkspaceMember
        │   ├── rateLimiter.js      # Auth (100/15m) + API (1000/15m)
        │   └── errorHandler.js     # Central error handler
        ├── models/
        │   ├── User.js
        │   ├── Workspace.js
        │   ├── WorkspaceMember.js
        │   ├── Job.js
        │   ├── Execution.js
        │   └── ApiKey.js
        ├── queues/
        │   └── jobQueue.js         # Re-exports Bull queue from config/redis.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── workspace.routes.js
        │   ├── job.routes.js
        │   ├── execution.routes.js
        │   ├── analytics.routes.js
        │   └── apikey.routes.js
        ├── scheduler/
        │   ├── cronScanner.js      # node-cron tick: find due jobs → Bull queue
        │   └── worker.js           # Bull processor: HTTP call → Execution → Socket emit
        ├── services/
        │   ├── auth.service.js     # JWT generation + verification
        │   └── notification.service.js  # Email (Nodemailer) + Slack webhooks
        ├── sockets/
        │   └── socketHandler.js    # Socket.io server init + workspace room logic
        └── utils/
            ├── apiResponse.js      # success() / error() response helpers
            ├── cronParse.js        # Thin wrapper around cron-parser
            ├── cronValidator.js    # validateCron() → { valid, message }
            ├── ensureDemoUser.js   # Idempotent demo account bootstrap
            ├── hashApiKey.js       # bcrypt API key generation + comparison
            └── seedDemoData.js     # Demo jobs + execution history
```

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:
- `Authorization: Bearer <accessToken>` header
- `x-workspace-id: <workspaceId>` header

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create account + workspace |
| `POST` | `/auth/login` | — | Obtain access + refresh tokens |
| `POST` | `/auth/refresh` | — | Rotate access token using refresh token |
| `POST` | `/auth/logout` | ✅ | Invalidate refresh token |
| `GET` | `/auth/me` | ✅ | Current user details |

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "activeWorkspace": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Jobs

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/jobs` | developer+ | List jobs (paginated, searchable) |
| `POST` | `/jobs` | developer+ | Create a new job |
| `GET` | `/jobs/:id` | developer+ | Get job details |
| `PATCH` | `/jobs/:id` | developer+ | Update job configuration |
| `DELETE` | `/jobs/:id` | admin/owner | Delete job + executions |
| `POST` | `/jobs/:id/pause` | developer+ | Pause scheduling |
| `POST` | `/jobs/:id/resume` | developer+ | Resume scheduling |
| `POST` | `/jobs/:id/trigger` | developer+ | Trigger immediately |
| `GET` | `/jobs/:id/executions` | developer+ | Execution history for a job |

**Create job body:**
```json
{
  "name": "Sync Users",
  "callbackUrl": "https://api.example.com/sync",
  "callbackMethod": "POST",
  "schedule": "0 * * * *",
  "callbackHeaders": { "Authorization": "Bearer token" },
  "callbackBody": "{\"source\": \"runlog\"}",
  "timeout": 30000,
  "retryCount": 3,
  "alertEmail": "oncall@example.com",
  "alertSlack": "https://hooks.slack.com/services/..."
}
```

### Executions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/executions` | List all workspace executions (paginated) |
| `GET` | `/executions/:id` | Single execution details |

Query params: `limit`, `skip`, `jobId`

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/overview` | Dashboard summary (jobs, executions, success rate, recent) |
| `GET` | `/analytics/jobs/:id` | 30-day daily stats for a specific job |

### Workspaces & Team

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/workspaces` | any | List user's workspaces |
| `POST` | `/workspaces` | any | Create workspace |
| `GET` | `/workspaces/:id/members` | developer+ | List members |
| `POST` | `/workspaces/:id/invite` | admin/owner | Invite by email |
| `PATCH` | `/workspaces/:id/members/:userId` | owner | Change role |
| `DELETE` | `/workspaces/:id/members/:userId` | admin/owner | Remove member |

### API Keys

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api-keys` | any | List workspace keys (no secrets) |
| `POST` | `/api-keys` | admin/owner | Generate new key (raw shown once) |
| `DELETE` | `/api-keys/:id` | admin/owner | Revoke key |

---

## Authentication

RunLog uses a **dual-token** JWT strategy:

```
Login
  └─► accessToken  (15 min, signed with JWT_SECRET)
  └─► refreshToken (7 days, signed with REFRESH_TOKEN_SECRET)

Every request
  └─► Authorization: Bearer <accessToken>
  └─► x-workspace-id: <workspaceId>

On 401 (expired access token)
  └─► POST /auth/refresh { refreshToken }
  └─► New accessToken returned
  └─► Failed requests queued and replayed automatically (axios interceptor)
```

The Axios interceptor in `client/src/api/axios.js` handles token refresh transparently. Queued requests are replayed after the new token is obtained, preventing race conditions during concurrent calls.

---

## WebSocket Events

The server emits events into workspace-scoped rooms: `workspace:<workspaceId>`.

Clients join a room after authenticating:
```javascript
socket.emit('join:workspace', workspaceId);
```

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `execution:queued` | `{ jobId, jobName }` | Job added to Bull queue |
| `execution:started` | `{ jobId, jobName }` | Worker picked up the job |
| `execution:done` | `{ executionId, jobId, jobName, status, statusCode, durationMs, executedAt }` | Execution completed |
| `job:updated` | `{ jobId, status }` | Job status changed |

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join:workspace` | `workspaceId` | Subscribe to workspace events |
| `leave:workspace` | `workspaceId` | Unsubscribe |

Server-side authentication uses a JWT token passed in `socket.handshake.auth.token`. Membership is verified against `WorkspaceMember` before admitting to a room.

---

## Deployment

### Render (Backend)

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Node Version | `NODE_VERSION=20.19.0` |

Required environment variables on Render:

```
NODE_ENV=production
NODE_VERSION=20.19.0
MONGODB_URI=<Atlas connection string>
REDIS_URL=<Upstash rediss:// URL>
JWT_SECRET=<openssl rand -hex 32>
REFRESH_TOKEN_SECRET=<openssl rand -hex 32>
CLIENT_URL=https://runlog-eta.vercel.app
```

> Do **not** set `PORT` — Render injects it automatically.

### Vercel (Frontend)

Set one environment variable:

```
VITE_API_URL=https://runlog-1.onrender.com/api
```

Then set Root Directory to `client` and **redeploy** after adding the env var.

### Pre-Deploy Checklist

- [ ] `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are strong random values not committed to source control
- [ ] `CLIENT_URL` matches the exact production frontend origin
- [ ] MongoDB Atlas IP allowlist includes Render's egress IPs (or `0.0.0.0/0` for simplicity)
- [ ] `REDIS_URL` is the `rediss://` URL from Upstash (not the CLI command)
- [ ] `npm run build` succeeds in `client/` locally on Node 20.19+
- [ ] `GET /api/health` returns `{"status":"ok"}` after deploy
- [ ] `ENSURE_DEMO_USER=false` set in non-demo production environments

---

## Scripts & Utilities

All scripts run from the `server/` directory with `node scripts/<name>.js`.

```bash
# Seed demo account + 5 jobs + 40 synthetic execution records
npm run seed

# Print the next scheduled run time for the last 5 jobs
node scripts/checkJobs.js

# Backfill missing nextRunAt on active jobs (useful after data migrations)
node scripts/updateDemoJobs.js
```

The demo seed is **idempotent** — it deletes any existing `demo@runlog.dev` data before re-creating it. Safe to run repeatedly.

The `ensureDemoUser.js` utility is called on every server startup (controlled by `ENSURE_DEMO_USER` env). It creates the demo account if absent but skips seeding jobs if any already exist for the workspace.

---

## CI/CD

GitHub Actions runs on push and pull request to `main`:

```yaml
# .github/workflows/ci.yml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - actions/checkout@v4
      - actions/setup-node@v4 (node 20.19.0)
      - npm ci                    # server dependencies
      - npm install && npm run build  # client (VITE_API_URL set to production)
```

The workflow validates that both the server dependencies install cleanly and the client builds successfully against the production API URL — catching import errors, missing packages, and build-time env issues before they reach Render/Vercel.

---

## Database Models

### Relationships

```
User ─────────────────┐
  │                   │
  │ owns/belongs to   │ created by
  ▼                   ▼
Workspace ──► WorkspaceMember    ApiKey
  │
  ├──► Job ──────────────────► Execution
  │      │
  │      └── schedule (cron)
  │          nextRunAt (Date)
  │          successCount / failureCount
  │
  └── plan (free / pro)
      jobLimit
```

### Key Indexes

```javascript
// Fast workspace feed queries
ExecutionSchema.index({ workspace: 1, executedAt: -1 });

// Fast per-job history queries
ExecutionSchema.index({ job: 1, executedAt: -1 });

// Enforce one role per user per workspace
WorkspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
```

---

## Contributing

Contributions are welcome. Here's how to get started:

1. **Fork** the repository and create a branch: `git checkout -b feat/your-feature`
2. Follow the [Getting Started](#getting-started) guide to run the stack locally
3. Make your changes with clear, focused commits
4. Ensure the client builds without errors: `cd client && npm run build`
5. Open a pull request against `main` with a clear description

### Code Style

- ES Modules (`"type": "module"`) throughout — no `require()`
- Server controllers are thin: validate input, delegate to models/services, return `success()` / `error()`
- Frontend components follow the existing CSS variable system — no inline hex values
- Socket events are emitted via the wrapper functions in `socketHandler.js`, not by calling `getIO()` directly in controllers

### Reporting Issues

Please open a GitHub Issue with:
- Node version (`node --version`)
- Steps to reproduce
- Expected vs actual behaviour
- Relevant logs (redact secrets)

---

## License

[MIT](LICENSE) — use it, ship it, fork it.

---

<div align="center">

Built with care by one engineer who got tired of SSH-ing into servers to check if cron was still running.

**[runlog-eta.vercel.app](https://runlog-eta.vercel.app)**

</div>