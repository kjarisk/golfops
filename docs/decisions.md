# Decisions Log

Keep this short: what we decided, and why.

> This is the **template-level** decisions log. When you run `/setup` on a new project, your project-specific decisions get prepended here automatically.

---

## Template decisions

- 2026-04-14: Migrated from OpenCode (AGENTS.md) to Claude Code (CLAUDE.md) — OpenCode is a different tool, silently ignored by Claude Code
- 2026-04-14: MCP config lives in `.mcp.json`, NOT `settings.json` — Claude Code reads MCP from `.mcp.json` only
- 2026-04-14: Lazy loading strategy for docs — Claude reads on demand, not upfront, saves ~300 tokens/session
- 2026-04-14: Removed `baseUrl` from tsconfig — deprecated in TS 6, `paths` alone works in bundler mode
- 2026-04-14: ctx7 installs one skill at a time — multi-arg syntax fails with "too many arguments"
- 2026-04-14: Skills registry = `/anthropics/skills` — `/agentskills-community/agentskills` doesn't exist
- 2026-04-14: `frontend-ui-ux` and `web-design-guidelines` removed — not in registry, replaced with `canvas-design` and `interaction-design`
- 2026-04-14: Gradient uses `--accent-glow: oklch(0.65 0.18 265)` — primary was pure black (zero chroma), animation was invisible
- 2026-04-14: `/setup` asks all questions in one message — sequential back-and-forth wasted too many round-trips
- 2026-04-14: Updated all packages to latest majors: vite 8, TypeScript 6, eslint 10, lucide-react 1.x
- 2026-04-14: Added `/audit-template` command with package currency check (npm outdated + npm audit)

## Stack decisions

- 2026-02-07: Chose shadcn/ui as default UI layer — speed + consistency, composable primitives
- 2026-02-07: State strategy = TanStack Query (server state) + Zustand (UI/client state only)
- 2026-02-07: Package manager = npm only — no bun/pnpm/yarn to keep CI simple
- 2026-02-07: Tailwind CSS v4 — no config file, CSS variables, `@theme inline` block in index.css

## Template: adding a decision

Format: `YYYY-MM-DD: <decision> — <why>`

Examples:
- `2026-04-14: Added React Router — app needs 3+ distinct pages`
- `2026-04-14: Deployment target = GitHub Pages — free, open-source project`
- `2026-04-14: Added Zod + React Hook Form — contact form requires validation`
