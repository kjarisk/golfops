# Changelog

All notable changes to GolfOps are recorded here.
Format: `[version] YYYY-MM-DD — summary`
Types: `Added` · `Changed` · `Fixed` · `Removed` · `Decision`

---

## [0.1.0] 2026-06-08 — Project initialized

### Added
- Project scaffolded from vibecoding template v0.9.0
- App type: fullstack (React 19 + Fastify + PostgreSQL)
- Deployment target: Mac Mini via Docker Compose + Cloudflare Tunnel
- React Router configured for multi-page navigation
- React Hook Form + Zod installed for form validation
- Sonner installed for toast notifications

### Decision
- Deployment via Docker Compose on Mac Mini, not GitHub Pages or Vercel
- Authentication via Cloudflare Access (single-user internal tool)
- PostgreSQL with pgvector for future RAG capability
- Monorepo structure: apps/web, apps/api, packages/shared
- GolfBox integration is manual checklist only in Release 1
