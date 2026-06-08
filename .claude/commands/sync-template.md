---
description: Pull template harness updates into an existing project without touching project-specific files.
disable-model-invocation: true
---

Help the user sync their project's Claude Code harness with the latest vibeTemplate upstream, without overwriting any project-specific files.

---

## Template-owned files (safe to update from upstream)

| File | What it controls |
|------|-----------------|
| `.claude/settings.json` | Model, permissions, hooks |
| `CLAUDE.md` | Claude's coding rules |
| `.claude/commands/*.md` | All slash commands |
| `.claude/skills/*/SKILL.md` | Skill definitions |
| `.mcp.json` | MCP server config |
| `docs/QUICKSTART.md` | Command reference |
| `docs/deploy.md` | Deployment guide |

## Project-owned files (never overwrite)

| File | Why |
|------|-----|
| `src/` | Your application code |
| `docs/outline.md` | Your scope lock |
| `docs/plan.md` | Your build plan |
| `docs/decisions.md` | Your decision log |
| `docs/visual-direction.md` | Your visual brief |
| `package.json` | Your dependencies and name |
| `README.md` | Your project README |
| `CLAUDE.local.md` | Your personal overrides |
| `.claude/rules/` | Your path-scoped rules |

---

## Step 1 — Check versions

Find the template version this project started from (check `docs/decisions.md` or the initial commit message). Then check the latest:

```bash
gh release list --repo kjarisk/vibeTemplate --limit 5
```

Or read: https://github.com/kjarisk/vibeTemplate/blob/main/docs/CHANGELOG.md

---

## Step 2 — Diff each template-owned file

For each file the user wants to update, fetch the upstream version and show the diff:

```bash
gh api repos/kjarisk/vibeTemplate/contents/.claude/settings.json \
  --jq '.content' | base64 -d > /tmp/upstream-settings.json
diff .claude/settings.json /tmp/upstream-settings.json
```

Ask: "Which files do you want to update? I'll diff each one and only apply what you approve."

---

## Step 3 — Apply approved updates

For each approved file:

```bash
gh api repos/kjarisk/vibeTemplate/contents/<path> \
  --jq '.content' | base64 -d > <path>
```

After applying, review the result and preserve any project-specific values — custom permissions, model choice, project-specific hook additions.

---

## Step 4 — Verify

```bash
npm run build
npm run lint
```

---

## Step 5 — Commit

```bash
git add .claude/ CLAUDE.md docs/QUICKSTART.md docs/deploy.md .mcp.json
git commit -m "chore: sync template harness to vibeTemplate vX.Y.Z"
```
