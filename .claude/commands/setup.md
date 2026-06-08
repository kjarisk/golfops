---
description: Interactive project bootstrap — run this first on every new project. Asks all questions at once, fills outline/plan/decisions, and installs domain-appropriate skills.
disable-model-invocation: true
---

This is a new project. I need to understand what you're building before writing any code.

**Answer all questions in one reply — I'll configure everything from your answers.**

---

**1. Project name**
What should we call this project? (used in docs and decisions log)

**2. App type**
What kind of app is this?
- `frontend` — React SPA, landing page, portfolio, dashboard
- `backend` — API, CLI tool, server, data pipeline
- `fullstack` — frontend + backend together
- `game` — browser game, interactive experience
- `mobile` — React Native or mobile-first web
- `other` — describe briefly

**3. One-sentence goal**
What does this app do for the user?
_e.g. "Helps freelancers track invoices and see which clients owe money"_

**4. Core features (3–7)**
What must v1 have? These become the scope lock.
_e.g. add invoice, list invoices, mark paid, export CSV_

**5. Non-goals (2–3)**
What will v1 explicitly NOT do?
_e.g. no team accounts, no payment processing, no mobile app_

**6. Target user**
Who uses this and in what context? One sentence.
_e.g. "Freelance designers who need quick invoice tracking without complex accounting software"_

**7. Deployment target**
- `github-pages` — free, open-source, static
- `vercel` — zero-config, preview deployments
- `linode` — full control, VPS, SSH + Nginx
- `later` — decide later

**8. Optional features** (list any that apply, or "none")
- routing — multiple pages (React Router)
- forms — validation (React Hook Form + Zod)
- toasts — notifications (Sonner)
- supabase — auth + database (Supabase)
- auth — other authentication (describe what kind)
- none

---

## After the user answers — do all of this in one pass

### Step A — Install domain skills

Based on the **app type** answer, run the appropriate skill installs:

**All types — always install first:**
```bash
npx ctx7 skills install /anthropics/skills frontend-design --universal -y
```

**`frontend` or `mobile` — also install (verified):**
```bash
npx ctx7 skills install /anthropics/skills canvas-design --universal -y
npx ctx7 skills install /wshobson/agents interaction-design --universal -y
```

**`backend` or `fullstack` — search live before installing:**

Do NOT hardcode backend skill paths — the registry changes. Instead:
1. Run the searches below and show the user the results:
```bash
npx ctx7 skills search backend
npx ctx7 skills search api
```
2. Present the top results to the user (name, registry path, star rating, description).
3. Ask: "Which of these would you like to install? I'll install them one at a time."
4. Install only what the user confirms, one at a time:
```bash
npx ctx7 skills install /org/repo <skill-name> --universal -y
```

**`game` — search live before installing:**

Do NOT hardcode game skill paths — the registry changes. Instead:
1. Run the search below and show the user the results:
```bash
npx ctx7 skills search game
```
2. Also install the verified interaction skill:
```bash
npx ctx7 skills install /wshobson/agents interaction-design --universal -y
```
3. Present the game skill search results to the user.
4. Ask: "Which of these would you like to install? I'll install them one at a time."
5. Install only what the user confirms, one at a time:
```bash
npx ctx7 skills install /org/repo <skill-name> --universal -y
```

**If `supabase` was chosen as an optional feature:**

Do NOT generate any Supabase code here — the `/supabase:supabase` skill handles implementation and stays current. Just tell the user:

> "Supabase setup will happen in Phase 0. When you reach that task, run `/supabase:supabase` and it will wire up the client, auth, and `.env.local` for you."

After installing, tell the user which skills were installed and what they do.

---

### Step B — Write `docs/outline.md`

Replace the entire file:

```markdown
# Outline (Scope Lock)

> **If it is not in this document, we do not build it.**

## Goal

[one-sentence goal]

## Non-goals (v1)

[non-goals as bullet list]

## Target user

[target user description]

## Core flows

[numbered list of core features]

## Data model (minimal)

> Fill in as you implement — start with the nouns from your core flows.

## UI references

> Add images to `docs/moodboard/` and `docs/screenshots/`, then run `/generate-visual-direction`.

## Definition of Done (v1)

- [ ] All core flows work end-to-end
- [ ] Loading, error, and empty states exist everywhere
- [ ] Keyboard accessible throughout
- [ ] Passes `npm run build` with no errors
- [ ] Deployed and live
```

---

### Step C — Write `docs/plan.md`

Replace the entire file. Tailor phases to the app type and chosen optional features. Phase 0 must NOT include things already done (React/Vite is already scaffolded):

```markdown
# Plan (Vertical Slices)

> Build end-to-end slices. Tasks ~15–60 min each. Run tests + commit after each.

## Phase 0 — Project setup

- [ ] `npm run dev` — confirm template starts at localhost:5173
- [ ] Add images to `docs/moodboard/` or `docs/screenshots/`, run `/generate-visual-direction`
[if routing: - [ ] `npm install react-router` and run `/add-route` to scaffold router]
[if forms: - [ ] `npm install react-hook-form zod @hookform/resolvers`]
[if toasts: - [ ] `npm install sonner`]
[if supabase: - [ ] Run `/supabase:supabase` to initialize client, auth, and `.env.local`]
[if auth (other): - [ ] Set up auth: [describe approach based on auth type they specified]]

## Phase 1 — First happy path

[Break down the first core flow into 3–5 concrete tasks]
- [ ] [task 1]
- [ ] [task 2]
- [ ] Add loading + error states
- [ ] Add tests for this flow
- [ ] Commit stable slice

## Phase 2 — Remaining core flows

[One section per additional core flow]
- [ ] [flow 2] + tests
- [ ] [flow 3] + tests

## Phase 3 — Polish

- [ ] Accessibility audit (keyboard nav, aria labels, focus management)
- [ ] Empty states for all data-driven UI
- [ ] Visual polish against `docs/visual-direction.md`
- [ ] `npm run build` passes clean
```

---

### Step D — Replace `docs/decisions.md` and `docs/CHANGELOG.md`

Both files carry template history that does not belong in a new project. **Replace them entirely** with project-specific content.

Replace `docs/decisions.md` with:

```markdown
# Decisions Log

Keep this short: what we decided, and why.
Format: `YYYY-MM-DD: <decision> — <why>`

## Project decisions

- YYYY-MM-DD: Project: [project name]
- YYYY-MM-DD: App type: [answer]
- YYYY-MM-DD: Deployment target: [answer]
- YYYY-MM-DD: Skills installed: [list of installed skills]
[if routing: - YYYY-MM-DD: Added React Router — app needs multiple pages]
[if forms: - YYYY-MM-DD: Added React Hook Form + Zod — forms require validation]
[if toasts: - YYYY-MM-DD: Added Sonner — UX requires toast notifications]
[if supabase: - YYYY-MM-DD: Added Supabase — auth + database via @supabase/supabase-js]
[if auth (other): - YYYY-MM-DD: Auth: [describe the approach]]
- YYYY-MM-DD: Initialized from vibeTemplate v[read version from package.json]
```

Replace `docs/CHANGELOG.md` with:

```markdown
# Changelog

All notable changes to [project name] are recorded here.
Format: `[version] YYYY-MM-DD — summary`
Types: `Added` · `Changed` · `Fixed` · `Removed` · `Decision`

---

## [0.1.0] YYYY-MM-DD — Project initialized

### Added
- Project scaffolded from vibecoding template
- App type: [answer]
- Deployment target: [answer]
[if routing: - React Router configured]
[if forms: - React Hook Form + Zod installed]
[if toasts: - Sonner installed]
[if auth: - Auth: [describe approach]]
```

---

### Step E — Clean template noise from the project

These files still contain template identity that has no place in a real project. Replace them now.

**`index.html`** — update the `<title>` tag:
```html
<title>[project name]</title>
```

**`package.json`** — update the `name` field to a slugified version of the project name (lowercase, hyphens, no spaces):
```json
"name": "[project-name-slug]"
```

**`src/App.tsx`** — replace the entire file with a minimal project shell. The template startup page (setup steps, "How it works" tab, "What's new" tab) is template documentation — it is noise in a real project:

```tsx
function App() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm">[project name]</p>
    </div>
  )
}

export default App
```

The developer will replace this shell as they build their first feature.

**`src/App.test.tsx`** — replace the entire file. The existing test checks for a heading that no longer exists after App.tsx is replaced:

```tsx
/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })
})
```

**`README.md`** — replace the entire file with a project-specific README:

```markdown
# [project name]

[one-sentence goal from the user's answer]

## Development

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build
npm test          # run tests
```

## Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind CSS v4 · shadcn/ui · TanStack Query · Zustand

## Docs

- `docs/outline.md` — scope lock
- `docs/plan.md` — build phases
- `docs/decisions.md` — decision log
```

**`docs/getting-started.md`** — delete this file entirely. It is a guide for setting up this template, which has already been done. It has no purpose in a real project.

---

### Step F — Final message to user

```
✅ Project configured: [project name]

Skills installed: [list]

Next steps:
1. Drop reference images into docs/moodboard/ or docs/screenshots/
   Then run: /generate-visual-direction
2. When ready: "Read docs/outline.md and propose the next single smallest task"

Scope is locked in docs/outline.md.
To add a feature — update the outline first, then we build it.
```

[If deployment was chosen (not "later"): "When ready to deploy, run /deploy — it will walk you through [GitHub Pages / Linode / Vercel] step by step."]
