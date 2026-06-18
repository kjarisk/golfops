# Outline (Scope Lock)

> **If it is not in this document, we do not build it.**

## Goal

Single-user administration system for Kjartan's golf business and golf-club training activities, self-hosted on Mac Mini with Docker Compose.

## Non-goals (Release 1)

- No Facebook, Loopify, Squarespace, or YouTube publishing
- No GolfBox API integration (checklist is manual only)
- No MCP integrations
- No Redis
- No multiple users or multi-tenant support
- No mobile app
- No fully autonomous email sending (all drafts require human approval)
- No complex multi-agent framework

## Target user

One internal user: Kjartan. Not a public application. Access protected by Cloudflare Access.

## Architecture

| Layer | Choice |
|-------|--------|
| Frontend | React 19 · Vite · TypeScript · Tailwind v4 · shadcn/ui · TanStack Query · Zustand |
| Backend API | Node.js · TypeScript · Fastify · Zod · Drizzle ORM |
| Shared types | packages/shared — TypeScript types and Zod schemas |
| Database | PostgreSQL 17 with pgvector |
| Infrastructure | Docker Compose on Mac Mini |
| External access | Cloudflare Tunnel → golf.kjarisk.com |
| Authentication | Cloudflare Access (email allowlist) |
| AI (future) | Ollama native on macOS · Claude API |

## Core flows (Release 1)

1. **Activities overview** — list upcoming training sessions with date, type, location, and participant count
2. **Trainer allocation** — assign trainers to sessions, view unallocated sessions
3. **GolfBox checklist** — per-activity manual checklist: reservation required flag, completion checkbox, optional note
4. **Knowledge base** — admin pages for documents grouped by category (prices, opening hours, VTG process, banespill rules, trainer details, club info, FAQ)
5. **Gmail draft approvals** — view generated email drafts, approve or discard before sending
6. **Basic reporting** — activity counts, trainer hours, participation summary

## Core flows (Release 2 — Milestone 8: Acuity bookings)

7. **Bookings** — Acuity Scheduling is the source of truth for client lesson bookings. Since Acuity's
   direct API requires the paid Powerhouse plan, golfops reads bookings from a **dedicated Google
   Calendar** that Acuity syncs into (Acuity → Sync with other Calendars). Lessons are mirrored into the
   `activities` table (`source='acuity'`, keyed by calendar event id) so there is **one booking system**.
   - See all bookings alongside manual activities (unified schedule, source badge + filter)
   - **Charging:** date-range report of Kjartan's lesson hours (to invoice the club), with CSV export.
     Clients pay the club directly — golfops never tracks customer payments.
   - Out of scope (need the paid Acuity API): booking from golfops, availability lookup.

## Data model (minimal)

> Fill in as you implement — start with the nouns from your core flows.

- `activities` — id, title, activity_type, start_time, end_time, location, capacity, participant_count, requires_golfbox_reservation, golfbox_reservation_completed, golfbox_reservation_note, created_at, updated_at
  - M8 additions: `source` ('manual' | 'acuity', default 'manual'), `acuity_id` (unique, nullable), `client_name`, `client_email`, `client_phone`, `acuity_type_id`, `acuity_calendar`
- `trainers` — id, name, email, active, created_at
- `activity_trainers` — activity_id, trainer_id (junction)
- `knowledge_documents` — id, title, category, content, created_at, updated_at
- `email_drafts` — id, subject, to, body, status (pending/approved/discarded), source_thread_id, created_at

## UI references

> Add images to `docs/moodboard/` and `docs/screenshots/`, then run `/generate-visual-direction`.

## Definition of Done (Release 1)

- [x] All six core flows work end-to-end
- [x] Loading, error, and empty states exist everywhere
- [x] Keyboard accessible throughout
- [x] Docker Compose stack starts cleanly with `docker compose up`
- [x] Live at golf.kjarisk.com via Cloudflare Tunnel
- [x] Protected by Cloudflare Access (Kjartan's email only)
