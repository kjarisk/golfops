# Quickstart

## 1. Clone the template

```bash
degit YOUR_USER/vibecoding-template my-app
cd my-app
npm i
```

## 2. Open in Claude Code

```bash
claude
```

Claude Code will automatically load `CLAUDE.md` for project context.

## 3. Configure your project

Run the interactive setup:

```
/setup
```

This will ask you about your app type, core features, non-goals, target user, and deployment target, then fill in `docs/outline.md`, `docs/plan.md`, and `docs/decisions.md`.

## 4. Add visual references (optional but recommended)

Drop screenshots or moodboard images into:
- `docs/moodboard/` — color palettes, typography samples, aesthetic references
- `docs/screenshots/` — UI inspiration, competitor designs

Then run:

```
/generate-visual-direction
```

This writes `docs/visual-direction.md` — a reusable summary Claude reads every session instead of re-analyzing images.

## 5. Install design skills (optional)

```
/setup-skills
```

Installs recommended Context7 design skills (`frontend-design`, `canvas-design`, etc.) into `.agents/skills/`.

## 6. Start building

Ask Claude:

```
Read docs/outline.md and docs/plan.md. Summarize the goal and propose the next single smallest task.
```

---

## npm scripts

```bash
npm run dev            # Start dev server at localhost:5173
npm run build          # TypeScript check + production build
npm run test           # Vitest watch mode
npm run test:coverage  # Vitest with coverage report
npm run lint           # ESLint check
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier format all files
npm run format:check   # Prettier check (no write)
npm run preview        # Preview production build locally
```

---

## Claude Code commands

### Built-in (always available)

| Command | What it does |
|---------|-------------|
| `/compact` | Summarize conversation + free up context — **use this often in long sessions** |
| `/rewind` | Roll back conversation and code to an earlier checkpoint |
| `/branch` | Explore an alternative approach without losing current state |
| `/plan` | Enter plan mode before a large change |
| `/model haiku` | Switch to faster/cheaper model for simple tasks |
| `/model sonnet` | Switch back to default model |
| `/effort [level]` | Set reasoning depth: `low`, `medium`, `high`, `xhigh`, `max`. `ultracode` (session-only) adds automatic workflow orchestration on top of `xhigh`. `auto` resets to model default. |
| `/config` | Picker for model, output style, and other settings |
| `/memory` | View or edit Claude's persistent memory |
| `/permissions` | Manage allow/deny/ask rules interactively |
| `/install-github-app` | Connect Claude to GitHub for PR reviews |
| `/mcp` | Manage MCP server connections |
| `/agents` | Open subagent manager |
| `/skills` | Browse skills, toggle visibility with `Space` (saved to `settings.local.json`) |
| `/hooks` | Inspect all configured hooks and their sources |
| `/run` | Launch and drive the app to confirm a change works in the real app |
| `/verify` | Confirm a change works by observing behavior (without falling back to tests) |
| `/tasks` | List background tasks running in this session |
| `/batch` | Decompose a large change into parallel worktree units |
| `/background` | Detach session to run as a background agent |
| `/schedule` | Create a cloud routine that runs on a schedule or GitHub event |
| `/context` | Show context window breakdown |
| `/btw` | Quick aside that doesn't bloat history |
| `/doctor` | Diagnose skill listing budget overflows and config issues |
| `/fork <directive>` | Spawn a background subagent with full conversation context; result returns to your session |
| `/autofix-pr [prompt]` | Watch the current branch's PR; auto-push fixes for CI failures and review comments |
| `/goal` | Set a completion condition; session works autonomously until it's met |
| `/reload-skills` | Re-scan skill directories without restarting the session |
| `/workflows` | View dynamic background workflow runs |
| `/ultraplan` | Plan-only mode for complex tasks (no execution until you approve) |
| `/code-review ultra` | Multi-agent cloud code review of current diff or a PR number (`/ultrareview` is an alias) |
| `/simplify` | Cleanup-only review pass — reuse, simplification, efficiency; auto-applies findings |
| `/team-onboarding` | Generate a teammate onboarding guide from session history |
| `/usage` | Show session cost and stats |

### Custom (this template)

| Command | What it does |
|---------|-------------|
| `/setup` | Interactive project bootstrap |
| `/audit-template` | 12-category health check with scored report |
| `/bump-version` | Changelog + App.tsx + package.json + tag + push |
| `/lint` | Run ESLint + auto-fix |
| `/test` | Run tests with coverage |
| `/build` | Type-check and production build |
| `/new-feature <name>` | Scaffold feature slice |
| `/review` | Review recent changes |
| `/deploy` | AI-guided deployment setup |
| `/setup-skills` | Check and install recommended skills |
| `/generate-visual-direction` | Generate visual direction from images |
| `/sync-template` | Pull harness updates from upstream without touching project files |

---

## Optional features

Install when your project needs them:

```bash
# Multi-page routing
npm install react-router

# Forms with validation
npm install react-hook-form zod @hookform/resolvers

# Toast notifications
npm install sonner

# shadcn/ui components (install individually as needed)
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
# ... etc
```

---

## Deploy

Run `/deploy` in Claude Code for guided setup, or see `docs/deploy.md` for full reference.

**Options:**
- **GitHub Pages** — free, great for open-source (run `/deploy` → choose option 1)
- **Vercel** — zero-config, preview deployments (run `/deploy` → choose option 3)
- **Linode VPS** — full control, rsync + Nginx (run `/deploy` → choose option 2)

---

## Path aliases

Use `@/` to import from `src/`:

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

---

## MCP servers

This template includes `.mcp.json` with:
- **Context7** — skills registry and documentation lookup
- **GitHub** — PR management, issue tracking (requires `GITHUB_PERSONAL_ACCESS_TOKEN` env var)

To add more MCP servers:

```bash
claude mcp add <name> -- npx -y <package>
```

Or edit `.mcp.json` directly.

---

## Tips for effective Claude Code sessions

- **Keep tasks small** — one feature, one fix, one refactor at a time
- **Use `/compact` often** — when the conversation gets long, compact it to keep Claude focused
- **Cite the outline** — before coding, always confirm which bullet in `docs/outline.md` this supports
- **Commit often** — after every working slice, not just at the end
- **Update the docs** — check off `docs/plan.md` and `docs/outline.md` after each completed task
- **Output styles** — run `/config` → Output style to switch between Default, Proactive (auto-executes steps), Explanatory (teaches as it works), or Learning (inserts `TODO(human)` markers for you to implement)
- **Auto memory** — Claude builds memory across sessions automatically; run `/memory` to see what it saved, edit it, or disable with `autoMemoryEnabled: false` in `~/.claude/settings.json`
- **Path-scoped rules** — put file-type-specific instructions in `.claude/rules/` (e.g. `api.md`, `components.md`) so they only load when Claude works with matching files, keeping CLAUDE.md lean
- **Personal overrides** — use `CLAUDE.local.md` (gitignored) for per-machine notes: sandbox URLs, personal API keys, local dev preferences — without polluting the shared `CLAUDE.md`
- **Scheduled routines** — use `/schedule` to create a cloud routine that runs on a cron schedule or GitHub event, even when your machine is off (Pro/Max/Team plans)
- **Running in auto mode?** Add `autoMode.hard_deny` to `~/.claude/settings.json` (user-level only — not read from project settings) to unconditionally block dangerous operations regardless of instructions:
  ```json
  { "autoMode": { "hard_deny": ["$defaults", "Never delete migration files"] } }
  ```

**Reference docs (GitHub wiki):**
- [Claude Code features guide](https://github.com/kjarisk/vibeTemplate/wiki/Learning)
- [Skills reference + install commands](https://github.com/kjarisk/vibeTemplate/wiki/Skills)

See `docs/getting-started.md` for the step-by-step first-day walkthrough (deleted by `/setup` on new projects).
