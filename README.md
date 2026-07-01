# DevelopmentWala.org

India's platform for NGO, CSR, and social sector jobs, internships, fellowships, scholarships, grants, and events.

## Tech Stack

- TanStack Start (React 19 + Vite 7)
- Tailwind CSS v4
- Supabase (Postgres, Auth, Storage)
- Deployed on Node.js VPS (Docker + Nginx)

## Local Development

```bash
bun install
bun run dev
```

Environment variables live in `.env` (see `.env.example`).

## Production Build

```bash
DEPLOY_TARGET=node bun run build
node dist/server/index.mjs
```

## Docker

```bash
docker compose up -d
```

See `Dockerfile` and `docker-compose.yml` for details.
