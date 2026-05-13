# OUTDRAW Deployment Guide (Render + Vercel)

This guide deploys:
- Backend: Render (Node web service)
- Frontend: Vercel (Vite static app)

## 1. Prerequisites

- GitHub repo connected to both Render and Vercel
- PostgreSQL database URL for Prisma (`DATABASE_URL`)
- MongoDB connection string (`MONGODB_URI`)
- A strong JWT secret (`JWT_SECRET`)
- Optional: Google OAuth client ID (`GOOGLE_CLIENT_ID`)
- Optional: Gemini key (`GEMINI_API_KEY`)

## 2. Deploy Backend on Render

You can use [render.yaml](render.yaml) for Blueprint deploy or configure manually in the Render dashboard.

### Option A: Blueprint (recommended)

1. In Render, create new Blueprint and select this repository.
2. Render will read [render.yaml](render.yaml).
3. Fill the `sync: false` secrets when prompted:
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID` (if using Google login)
   - `GEMINI_API_KEY` (if using AI)
   - `SELF_PING_URL` (set after first deploy)

### Option B: Manual Render service config

- Runtime: Node
- Root directory: repository root
- Build command:

```bash
pnpm install --frozen-lockfile && pnpm --filter @outdraw/shared build && pnpm --filter @outdraw/server build && pnpm --filter @outdraw/server db:generate
```

- Start command:

```bash
pnpm --filter @outdraw/server start
```

- Health check path: `/health`

### Required environment variables (Render)

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `JWT_SECRET=<your-secret>`
- `DATABASE_URL=<postgres-url>`
- `MONGODB_URI=<mongodb-url>`

### Optional environment variables (Render)

- `GOOGLE_CLIENT_ID=<google-oauth-web-client-id>`
- `GEMINI_API_KEY=<gemini-api-key>`
- `SELF_PING_INTERVAL_MS=300000` (5 minutes)
- `SELF_PING_URL=https://<your-render-service>.onrender.com/health`

After first successful deploy, copy your Render URL and set `SELF_PING_URL`.

## 3. Deploy Frontend on Vercel

Use the same repository in Vercel and configure this project as a Vite app from `apps/web`.

### Vercel project settings

- Framework preset: Vite
- Root directory: `apps/web`
- Install command:

```bash
corepack enable && pnpm install --frozen-lockfile
```

- Build command:

```bash
corepack pnpm --filter @outdraw/web build
```

- Output directory:

```txt
apps/web/dist
```

### Frontend environment variables (Vercel)

- `VITE_GOOGLE_CLIENT_ID=<google-oauth-web-client-id>` (if using Google login)

## 4. Wire Frontend to Backend

This project uses relative paths (`/api`, `/socket.io`) in the frontend. To route those to Render in production:

1. Open [vercel.json](vercel.json)
2. Replace `YOUR-RENDER-SERVICE` with your real Render service hostname.

Example:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://outdraw-backend.onrender.com/api/:path*"
    },
    {
      "source": "/socket.io/:path*",
      "destination": "https://outdraw-backend.onrender.com/socket.io/:path*"
    }
  ]
}
```

Commit after updating `vercel.json`, then redeploy Vercel.

## 5. Post-Deploy Checklist

- Render `/health` returns status ok
- Vercel app loads login page
- Register/login works
- Dashboard loads documents/workspaces
- Canvas realtime sync works
- AI route works (only if `GEMINI_API_KEY` is set)
- Self ping logs appear in Render logs every 5 minutes

## 6. Troubleshooting

### `Cannot find module '@outdraw/shared'`

Workspace dependencies were not linked during build.

Use root install and filtered build commands exactly as shown above.

### API calls fail on Vercel

- Verify [vercel.json](vercel.json) has your real Render domain
- Confirm Render service is healthy and public

### Google sign-in button does not appear

- Set `VITE_GOOGLE_CLIENT_ID` in Vercel
- Also set `GOOGLE_CLIENT_ID` on Render
- Ensure authorized origins/redirects include your Vercel domain
