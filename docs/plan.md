# Plan (Vertical Slices)

> Build end-to-end slices. Tasks ~15–60 min each. Run tests + commit after each.

## Milestone 1 — Full-stack shell

### Phase 0 — Infrastructure setup

- [x] Propose monorepo restructuring (apps/web, apps/api, packages/shared, infra) — wait for approval
- [x] Convert to npm-workspace monorepo, move React app into apps/web
- [x] Add apps/api: Fastify + TypeScript skeleton, `GET /api/health` → `{ status: "ok", service: "golfops-api" }`
- [x] Add packages/shared: shared Zod schemas and TypeScript types
- [x] Install frontend extras in apps/web: `react-router-dom`, `sonner`, `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Create compose.yml: golfops-web, golfops-api, golfops-db (pgvector/pgvector:pg17), golfops-cloudflared
- [x] Create apps/web/Dockerfile and apps/api/Dockerfile
- [x] Create Nginx config: serve React dist, proxy /api/* to golfops-api
- [x] Create .env.example with POSTGRES_USER, POSTGRES_PASSWORD, CLOUDFLARE_TUNNEL_TOKEN
- [x] `docker compose up -d --build` — all containers green
- [x] `curl localhost:8080/api/health` returns 200
- [x] Document Cloudflare Tunnel setup in infra/cloudflare/README.md
- [x] Commit: "feat: add GolfOps full-stack Docker foundation"

### Phase 1 — Activities core (first vertical slice)

- [x] Create `activities` table with Drizzle schema + migration
- [ ] Add API routes: `GET /api/activities`, `POST /api/activities`, `PATCH /api/activities/:id`
- [ ] Build activities list page in React (React Router route /activities)
- [ ] Add activity form with validation (React Hook Form + Zod)
- [ ] GolfBox checklist column: reservation required flag + completion checkbox + note
- [ ] Loading, error, and empty states
- [ ] API route tests
- [ ] Commit stable slice

## Milestone 2 — Trainer allocation

- [ ] Create `trainers` and `activity_trainers` tables + migrations
- [ ] Trainer CRUD API
- [ ] Trainer assignment UI on activity form
- [ ] Show trainer coverage gaps on activities page
- [ ] Tests + commit

## Milestone 3 — Knowledge base

- [ ] Create `knowledge_documents` table + migration
- [ ] Admin pages: list, create, edit, delete documents
- [ ] Categories: prices, opening hours, VTG process, banespill rules, trainer details, club info, FAQ
- [ ] Tests + commit

## Milestone 4 — Gmail draft approvals

- [ ] Gmail OAuth setup
- [ ] Email polling and classification service
- [ ] Draft creation API
- [ ] Approval inbox UI: view drafts, approve or discard
- [ ] Tests + commit

## Milestone 5 — Basic reporting

- [ ] Activity summary counts
- [ ] Trainer hour totals
- [ ] Participation trends (simple table or chart)
- [ ] Tests + commit

## Milestone 6 — Polish and deploy

- [ ] Accessibility audit (keyboard nav, aria labels, focus management)
- [ ] Empty states for all data-driven UI
- [ ] Visual polish against docs/visual-direction.md
- [ ] docker compose production build passes clean
- [ ] Cloudflare Tunnel live at golf.kjarisk.com
- [ ] Cloudflare Access protecting the app (Kjartan's email only)
- [ ] Commit and tag Release 1

## Future milestones (not in Release 1)

- Milestone 7 — RAG: document chunking, embeddinggemma embeddings, pgvector semantic search
- Milestone 8 — Acuity: appointment sync, availability lookup, webhooks
- Milestone 9 — n8n: weekly reports, trainer emails, GolfBox reminders
- Milestone 10 — Ollama: wire native models to knowledge base and drafts
