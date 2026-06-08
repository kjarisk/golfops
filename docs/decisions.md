# Decisions Log

Keep this short: what we decided, and why.
Format: `YYYY-MM-DD: <decision> — <why>`

## Project decisions

- 2026-06-08: Project: GolfOps
- 2026-06-08: App type: fullstack (React frontend + Fastify API)
- 2026-06-08: Deployment target: Mac Mini via Docker Compose + Cloudflare Tunnel — self-hosted, not Vercel/Netlify/GitHub Pages
- 2026-06-08: Authentication: Cloudflare Access (email allowlist) — single-user internal tool, no app-level auth needed
- 2026-06-08: Database: PostgreSQL 17 with pgvector — pgvector needed for future RAG milestone
- 2026-06-08: Backend framework: Fastify + Drizzle ORM — lightweight, TypeScript-native, Zod schema integration
- 2026-06-08: Monorepo: npm workspaces (apps/web, apps/api, packages/shared) — shared types without a separate package registry
- 2026-06-08: Skills installed: frontend-design
- 2026-06-08: Added React Router — multi-page app, each feature has its own route
- 2026-06-08: Added React Hook Form + Zod — activity and document forms require validation
- 2026-06-08: Added Sonner — toast notifications for CRUD feedback
- 2026-06-08: GolfBox stays manual — no GolfBox API in Release 1, checklist approach only
- 2026-06-08: No Redis — overkill for a single-user app, PostgreSQL is sufficient
- 2026-06-08: Ollama native on macOS (not in Docker) — simpler GPU access and model management; API accessible to containers at host.docker.internal:11434
- 2026-06-08: Initialized from vibeTemplate v0.9.0
