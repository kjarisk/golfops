# Claude Code Instructions

This is a vibecoding template for AI-assisted React development with Claude Code.

## New project? Run `/setup` first

If `docs/outline.md` still contains "_Run `/setup` to define this._", the project is unconfigured. **Stop and tell the user to run `/setup` before doing anything else.**

## Session start (read on demand, not upfront)

Do NOT pre-read all docs at the start of every session. Read lazily:

- **When about to implement anything:** read `docs/outline.md` to verify it's in scope
- **When planning next task:** read `docs/plan.md` to find the next unchecked item
- **When making UI decisions:** read `docs/visual-direction.md` only if it has content (check file size first — skip if it contains "No visual direction generated")
- **Skills:** project skills in `.claude/skills/` load natively. Third-party design skills in `.agents/skills/` are not auto-discovered — query them via the Context7 MCP server (`ctx7`/`query-docs`), don't read the files directly

---

## Rules

### 1. Scope (NON-NEGOTIABLE)

- Only build what is in `docs/outline.md`. If not there, STOP and ask.
- Propose the single smallest next task only. No multi-feature PRs.
- Before coding: cite which section + bullet in `docs/outline.md` this supports.
- No new libraries without asking first.

### 2. Tech Stack

**Default:** React + Vite + TypeScript · Tailwind CSS (v4) · TanStack Query · Zustand · shadcn/ui

**Optional (ask first):** React Router · Zod · React Hook Form · Sonner

**Discuss before choosing:** Next.js (if SSR is genuinely needed) · Redux (Zustand covers most cases) · alternative UI libraries — update this file if the project type warrants a different choice

### 3. Architecture

```
src/
  components/ui/        # shadcn/ui (do not modify without reason)
  components/           # shared reusable UI
  features/<name>/      # feature slices
    components/
    api/                # useXQuery, useYMutation hooks
    state/              # Zustand store (UI state only)
    types.ts
    index.ts
  hooks/                # shared custom hooks
  lib/                  # utilities
```

- **TanStack Query** for server state (fetch, cache, mutations)
- **Zustand** for UI state only (dialogs, filters, selections)
- Every data-driven UI must handle: loading · error · empty states
- No prop drilling for shared state — use Zustand

### 4. React 19 Patterns

- Pass `ref` as prop directly — no `forwardRef` needed
- Use `use()` hook for async resources instead of useEffect + useState
- Use `useOptimistic()` for optimistic UI updates
- Use `useTransition()` for non-urgent state updates

### 5. TypeScript

- `strict: true` is enabled — fix TypeScript errors by correcting types, NOT by casting with `as`
- No `any` types without justification
- No `as unknown as X` workarounds

### 6. Quality

- **Package manager:** `npm` only — no bun, pnpm, or yarn
- Tests: Vitest + Testing Library, behavior-based, critical flows covered
- Keyboard accessibility required: focusable elements, labels, focus management in dialogs
- Run `npm run lint:fix` before checkpoint commits

### 7. Commits & Checkpoints

- Commit after each small, working improvement
- Message style: `feat:` `fix:` `chore:` `refactor:` `test:`
- Do not leave main in a failing state

### 8. Plan & Outline Tracking (NON-NEGOTIABLE)

- After every completed task: update `docs/plan.md` (check off completed item)
- After every completed task: update `docs/outline.md` (check off DoD items)
- If a mid-session task is added that's not in the plan, add it to `docs/plan.md` first

### 9. Parallel Execution

Use sub-agents for tasks with no shared state:
- Independent feature slices
- Parallel lint + test + build verification
- Test generation for multiple components

**SDK:** use the `Agent` tool · **CLI:** define custom agents in `.claude/agents/<name>.md` · **In-session:** use `/fork <directive>` to delegate a parallel sub-task without leaving the main conversation

Do NOT parallelize: shared state, overlapping files, sequential dependencies

### 10. Deployment

Guide lives in `docs/deploy.md` — options: GitHub Pages (free), Linode VPS (rsync+SSH+Nginx), Vercel (optional). Run `/deploy` for AI-guided setup.

### 11. Skills

- Project skills: `.claude/skills/` — committed, loaded natively by Claude Code at session start
- Third-party skills: `.agents/skills/` — gitignored, installed locally; surfaced via the Context7 MCP server (not auto-discovered by Claude Code itself)
- Path-scoped rules: `.claude/rules/` — starter files `api.md` and `components.md` included; add more per domain, they load only when Claude works with matching files
- Personal overrides: `CLAUDE.local.md` (gitignored) — per-machine notes, sandbox URLs, personal preferences
- Run `/setup-skills` for interactive install · full reference at https://github.com/kjarisk/vibeTemplate/wiki/Skills

To control which skills appear in context (saves token budget), use `skillOverrides` in `settings.json`:

```json
{
  "skillOverrides": {
    "deploy": "off",
    "generate-visual-direction": "name-only"
  }
}
```

Values: `"on"` (default) · `"name-only"` (shows name, hides description) · `"user-invocable-only"` · `"off"`

---

## Workflow

1. **When user asks for next task:** read `docs/outline.md` + `docs/plan.md`, propose the next unchecked item
2. **Before coding:** cite the exact outline bullet this supports
3. **Implement** — no unrelated changes, no unlisted features
4. **Verify:** run `/lint` and `/build`
5. **Update:** check off `docs/plan.md` and `docs/outline.md` items
6. **Commit:** suggest a checkpoint message

Do NOT read all docs speculatively — only read what the current task requires.

## Commands

See `docs/QUICKSTART.md` for the full command list.
