# RunLog

Distributed job scheduling platform: cron-driven HTTP callbacks, Bull queue execution, real-time execution feed (Socket.io), and workspace-based multi-tenancy.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, Zustand, Socket.io client |
| Backend | Node 20.19+, Express, MongoDB, Redis, Bull |
| Infra | Docker Compose (Mongo, Redis, API, static client) |

## Prerequisites

- **Node.js** `>=20.19.0` (required by Vite 8)
- **MongoDB** and **Redis** (local or managed)
- For Docker: Docker Engine + Compose v2

## Local development

### 1. Backend

```bash
cd server
cp .env.example .env
# Edit MONGODB_URI, JWT_SECRET, REDIS_URL, REFRESH_TOKEN_SECRET, CLIENT_URL=http://localhost:5173
npm install
npm run seed    # optional: demo@runlog.dev / demo123
npm run dev
```

API listens on **http://localhost:5005**.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` and does not require `VITE_API_URL` for local dev.

### 3. Health check

```bash
curl http://localhost:5005/api/health
```

## Docker Compose (recommended for demos / VPS)

### 1. Configure secrets

```bash
cp .env.example .env
# Set JWT_SECRET and REFRESH_TOKEN_SECRET to long random strings
```

### 2. Build and run

```bash
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| App (UI + proxied API) | http://localhost:8080 |
| API direct (debug) | http://localhost:5005 |

### 3. Seed demo data (first time)

```bash
docker compose exec server node scripts/seed.js
```

Login: `demo@runlog.dev` / `demo123`

### 4. Logs & teardown

```bash
docker compose logs -f server
docker compose down          # keep volumes
docker compose down -v       # wipe Mongo/Redis data
```

## Production deployment

### Option A — Single VPS (Docker Compose)

Same as above on a VM (DigitalOcean, Hetzner, EC2):

1. Point DNS `app.yourdomain.com` → server IP.
2. Put **Caddy** or **Nginx** in front of port `8080` with TLS (Let’s Encrypt).
3. Set in root `.env`:
   - `CLIENT_URL=https://app.yourdomain.com`
   - Strong `JWT_SECRET` / `REFRESH_TOKEN_SECRET`
4. Use managed MongoDB/Redis URLs in `docker-compose.yml` instead of bundled containers for reliability.
5. Run `docker compose up -d --build` after each deploy.

### Option B — Split hosting (common)

| Component | Suggested hosts |
|-----------|-----------------|
| Static React | Vercel, Netlify, Cloudflare Pages, S3 + CloudFront |
| API + worker + cron | Railway, Render, Fly.io, ECS, a VPS |
| MongoDB | Atlas |
| Redis | Upstash, ElastiCache, Redis Cloud |

**Frontend build**

```bash
cd client
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

Upload `client/dist` or connect the repo to your static host.

**Backend**

- Set env: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `CLIENT_URL=https://app.yourdomain.com`, `PORT=5005`, `NODE_ENV=production`
- Run **one** process that executes `node index.js` (includes HTTP API, cron scanner, and Bull worker).
- Ensure Redis and MongoDB are reachable from the API region.
- Open outbound HTTPS for job callbacks.

**CORS**

`CLIENT_URL` must exactly match the browser origin of your React app (scheme + host + port).

**WebSockets**

If the UI and API share a domain via a reverse proxy, use relative `VITE_API_URL=/api` and proxy `/socket.io` to the API (see `client/nginx.conf`). If they are on different domains, set `VITE_API_URL` to the full API URL and allow WebSocket connections on the API load balancer.

### Option C — CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:

- Server install (Node 20.19.0)
- Client `npm ci` + `npm run build`
- Docker image build on `main` only

Wire your registry (GHCR/Docker Hub) and deploy hooks as needed.

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | Mongo connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `REDIS_URL` | Yes | Redis URL for Bull queue |
| `REFRESH_TOKEN_SECRET` | No* | Refresh tokens (*falls back to `JWT_SECRET`) |
| `CLIENT_URL` | Yes (prod) | Frontend origin for CORS |
| `PORT` | No | Default `5005` |
| `SMTP_*` | No | Email alerts on job failure |

### Client (build-time)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base path. Use `/api` when nginx proxies to the server; use full URL when API is on another domain |

## Ops scripts

```bash
cd server
node scripts/seed.js           # demo user + sample jobs
node scripts/checkJobs.js      # print next run times
node scripts/updateDemoJobs.js # force missing nextRunAt for active jobs
```

## Pre-deploy checklist

- [ ] `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are strong and not committed
- [ ] `CLIENT_URL` matches production frontend URL
- [ ] MongoDB and Redis are backed up / managed
- [ ] `npm run build` succeeds in `client/` on Node 20.19+
- [ ] `curl /api/health` returns `ok` after deploy
- [ ] Demo seed only in non-production environments
- [ ] TLS terminated at reverse proxy for public traffic

## Project layout

```
RUNLOG/
├── client/          React SPA
├── server/          Express API + scheduler + worker
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## License

MIT (adjust as needed for your portfolio).
