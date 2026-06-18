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
- [x] Add API routes: `GET /api/activities`, `POST /api/activities`, `PATCH /api/activities/:id`
- [x] Build activities list page in React (React Router route /activities)
- [x] Add activity form with validation (React Hook Form + Zod)
- [x] GolfBox checklist column: reservation required flag + completion checkbox + note
- [x] Loading, error, and empty states
- [x] API route tests
- [x] Commit stable slice

## Milestone 2 — Trainer allocation

- [x] Create `trainers` and `activity_trainers` tables + migrations
- [x] Trainer CRUD API
- [x] Trainer assignment UI on activity form
- [x] Show trainer coverage gaps on activities page
- [x] Tests + commit

## Milestone 3 — Knowledge base

- [x] Create `knowledge_documents` table + migration
- [x] Admin pages: list, create, edit, delete documents
- [x] Categories: prices, opening hours, VTG process, banespill rules, trainer details, club info, FAQ
- [x] Tests + commit

## Milestone 4 — Gmail draft approvals

- [x] Gmail OAuth setup
- [x] Email polling and classification service
- [x] Draft creation API
- [x] Approval inbox UI: view drafts, approve or discard
- [x] Tests + commit

## Milestone 5 — Basic reporting

- [x] Activity summary counts
- [x] Trainer hour totals
- [x] Participation trends (simple table or chart)
- [x] Tests + commit

## Milestone 6 — Polish and deploy

- [x] Accessibility audit (keyboard nav, aria labels, focus management)
- [x] Empty states for all data-driven UI
- [x] Visual polish against docs/visual-direction.md
- [x] docker compose production build passes clean
- [x] Cloudflare Tunnel live at golf.kjarisk.com
- [x] Cloudflare Access protecting the app (Kjartan's email only)
- [x] Commit and tag Release 1

## Milestone 7 — RAG (document chunking, embeddings, semantic search)

- [x] Add `document_chunks` table (pgvector `vector(768)`) + migration 0004, enable `vector` extension
- [x] Chunker: paragraph→sentence splitting with overlap (`lib/chunker.ts`)
- [x] Ollama client for embeddinggemma:300m embeddings (`lib/ollama.ts`)
- [x] Indexing service: `indexDocument` / `reindexAll` (`lib/embeddings.ts`)
- [x] Auto-index documents on create/update (async, non-blocking)
- [x] `GET /api/knowledge/search` (cosine similarity) + `POST /api/knowledge/reindex`
- [x] Frontend: debounced search box + ranked results UI on KnowledgePage
- [x] Lint + build + tests green, commit

## Milestone 8 — Acuity booking integration (operations core)

> Acuity is source of truth; mirror into our DB. One booking system: synced lessons become
> `activities` rows with `source='acuity'` (additive — manual rows unchanged). Charging = hours
> to invoice the club, not customer payments. Google Calendar via Acuity's native sync.

### Slice 0 — Foundation: Acuity client + sync

- [x] `lib/acuity.ts` — typed Acuity client (Basic Auth via `ACUITY_USER_ID`/`ACUITY_API_KEY`)
- [x] Migration 0005 — extend `activities`: `source`, `acuityId` (unique), client fields, `acuityTypeId`, `acuityCalendar`
- [x] `lib/bookingSync.ts` — `syncBookings()` upsert appointments by `acuityId`
- [x] `POST /api/bookings/sync` + ~5-min `setInterval` poll in `server.ts`
- [x] `.env.example` + `compose.yml` Acuity vars
- [x] Tests + commit

### Slice 1 — Unified schedule view

- [x] Extend `GET /api/activities` mapper with new fields (already returns all columns)
- [x] Source badge + client name + source/date-range filter on activities UI
- [x] "Sync now" button → `POST /api/bookings/sync`
- [x] Tests + commit

### Slice 2 — Availability + create booking

- [ ] `GET /api/acuity/appointment-types`, `/availability/dates`, `/availability/times`
- [ ] `POST /api/bookings` (create in Acuity → sync back)
- [ ] New-booking dialog flow (type → date → time → client)
- [ ] Tests + commit

### Slice 3 — Charging: hours-to-invoice report

- [ ] `GET /api/reports/hours?from=&to=` (sum durations, grouped by type, over `source='acuity'`)
- [ ] Hours/Charging section in ReportsPage + CSV export
- [ ] Tests + commit

### jgk-readiness

- [ ] Export booking/hours Zod schemas + types from `packages/shared`

## Future milestones (not in Release 1)

- Milestone 8.5 — Acuity webhooks for real-time sync (needs Cloudflare Access bypass for webhook path)
- Milestone 9 — jgk.kjarisk.com syncs bookings from golfops
- Milestone 10 — n8n: weekly reports, trainer emails, GolfBox reminders
- Milestone 11 — Ollama: wire native models to knowledge base and drafts
