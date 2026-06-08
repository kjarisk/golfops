# Getting Started

Step-by-step guide for your first day with this template.

---

## Step 1 — Clone and install

```bash
# Replace with your GitHub username and desired project name
degit YOUR_USER/vibecoding-template my-app
cd my-app
npm install
```

Verify it works:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the startup page with two tabs: **Get started** and **How it works**.

---

## Step 2 — Open Claude Code

In the project directory:

```bash
claude
```

Claude Code auto-loads `CLAUDE.md`. You'll see a `>` prompt — you're ready.

If this is your first time: Claude Code is a terminal-based AI coding assistant. Everything happens in conversation. You ask, Claude codes. You review, approve, or reject each action.

---

## Step 3 — Run `/setup`

This is the most important first step. It defines the scope of your project.

```
/setup
```

Claude will ask you 8 questions in one message. Answer them all at once:

1. **Project name** — used in docs and the decisions log
2. **App type** — `frontend`, `backend`, `fullstack`, `game`, `mobile`, or `other`
3. **One-sentence goal** — what does this app do for the user?
4. **Core features (3–7)** — what must v1 have? These become the scope lock.
5. **Non-goals (2–3)** — what will v1 explicitly NOT do?
6. **Target user** — who uses this, in one sentence
7. **Deployment target** — `github-pages`, `vercel`, `linode`, or `later`
8. **Optional features** — `routing`, `forms`, `toasts`, `auth`, or `none`

After you answer, Claude will:
- Install domain-appropriate design/dev skills
- Write `docs/outline.md` (your scope lock)
- Write `docs/plan.md` (your build phases)
- Write `docs/decisions.md` (your decision log)

> The scope lock is real. If it's not in `docs/outline.md`, we don't build it. To add a feature, update the outline first.

---

## Step 4 — Add visual references (optional, but powerful)

If you have design inspiration, drop it in:
- `docs/moodboard/` — color palettes, typography, aesthetic references
- `docs/screenshots/` — competitor UIs, inspiration, layouts

Then generate a visual direction summary:

```
/generate-visual-direction
```

This writes `docs/visual-direction.md` — a compact summary Claude reads every session instead of re-analyzing your images each time.

Skip this step if you have no references yet. You can always add them later.

---

## Step 5 — Install design skills

Skills are reusable prompt templates that extend Claude's capabilities.

```
/setup-skills
```

This checks what's installed and offers to install the recommended ones for your app type. Skills install into `.agents/skills/` (gitignored — each developer installs locally).

Or install manually:

```bash
npx ctx7 skills install /anthropics/skills frontend-design --universal -y
npx ctx7 skills install /anthropics/skills canvas-design --universal -y
npx ctx7 skills install /wshobson/agents interaction-design --universal -y
```

See the [Skills wiki](https://github.com/kjarisk/vibeTemplate/wiki/Skills) for the full reference.

---

## Step 6 — Audit the template health (optional)

Run a health check to verify everything is configured correctly:

```
/audit-template
```

This checks CLAUDE.md, settings, MCP config, gitignore, skills quality, build health, and docs currency. Outputs a scored report with specific fixes.

Useful to run: before starting a new project, after cloning, or after making template changes.

---

## Step 7 — Start building

With setup done, ask Claude:

```
Read docs/outline.md and docs/plan.md. Summarize the goal and propose the next single smallest task.
```

Claude will identify the first unchecked task in Phase 1 and propose exactly one thing to build. Review, approve, and iterate.

> Keep tasks small. One feature per session. Commit after each working slice.

---

## Daily workflow

Once you're past setup, every session looks like this:

1. Open Claude Code: `claude`
2. Give Claude context: _"Read docs/outline.md. What's next?"_
3. Approve one task at a time
4. Run `npm run build` to verify nothing broke
5. Commit: `/commit` or `git commit`
6. Use `/compact` when conversations get long

---

## Key commands reference

| Command | When to use |
|---------|------------|
| `/setup` | First thing on any new project |
| `/setup-skills` | After setup, or when switching to a new domain |
| `/audit-template` | Before starting a project, or to check template health |
| `/generate-visual-direction` | After adding images to moodboard/screenshots |
| `/new-feature <name>` | Scaffold a new feature slice |
| `/add-component <name>` | Add a shadcn/ui or custom component |
| `/add-route <name>` | Add a new page/route |
| `/deploy` | When ready to ship |
| `/compact` | When conversation gets long — use often |

---

## Common first-day mistakes

**Skipping `/setup`** — Claude has no project context. It will build the wrong thing.

**Scoping too broadly** — "social network with payments and real-time chat" is not a v1. Use non-goals aggressively.

**Not committing** — commit after every working slice. It takes 30 seconds and saves hours.

**Long conversations without `/compact`** — after ~20 messages, use `/compact` to summarize and reset context. Claude gets better, not worse.

**Installing everything upfront** — only install optional packages when you need them. Keep the dependency list lean until you have a reason to grow it.

---

## Where things live

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude's instructions for this project |
| `docs/outline.md` | Scope lock — the source of truth for what we're building |
| `docs/plan.md` | Build phases with checkboxes |
| `docs/decisions.md` | Log of architectural and setup decisions |
| `docs/visual-direction.md` | Generated visual brief for the project |
| `docs/deploy.md` | Deployment instructions for all 3 targets |
| [Wiki: Learning](https://github.com/kjarisk/vibeTemplate/wiki/Learning) | Claude Code features reference |
| [Wiki: Skills](https://github.com/kjarisk/vibeTemplate/wiki/Skills) | Skills reference and install commands |
| `docs/QUICKSTART.md` | npm scripts and commands reference |
| `.claude/commands/` | Custom slash commands for this template |
| `.claude/skills/` | Project-specific skills (committed) |
| `.agents/skills/` | Third-party skills from Context7 (gitignored) |
| `.claude/settings.json` | Claude Code config: model, permissions, hooks |
| `.mcp.json` | MCP server config (Context7, GitHub) |

---

## Next steps

- Read the [Learning wiki](https://github.com/kjarisk/vibeTemplate/wiki/Learning) for a comprehensive guide to Claude Code features
- Read `docs/QUICKSTART.md` for all npm scripts and command shortcuts
- Read the [Skills wiki](https://github.com/kjarisk/vibeTemplate/wiki/Skills) to understand the skills system
