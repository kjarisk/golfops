# GolfOps

Single-user administration system for Kjartan's golf business and golf-club training activities, self-hosted on Mac Mini with Docker Compose.

## Development

```bash
npm install
npm run dev:web    # apps/web dev server
npm run dev:api    # apps/api dev server
npm run build      # production build (all workspaces)
npm test           # run tests (all workspaces)
```

## Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 · Vite 8 · TypeScript 6 · Tailwind CSS v4 · shadcn/ui · TanStack Query · Zustand |
| Backend | Node.js · TypeScript · Fastify · Zod · Drizzle ORM |
| Database | PostgreSQL 17 with pgvector |
| Infrastructure | Docker Compose · Cloudflare Tunnel · Cloudflare Access |

## Docs

- `docs/outline.md` — scope lock
- `docs/plan.md` — build milestones
- `docs/decisions.md` — decision log
- `infra/cloudflare/` — Cloudflare Tunnel and Access setup
