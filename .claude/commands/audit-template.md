---
description: Audit this Claude Code template for health, best practices, and token efficiency. Run before starting a new project or after making changes to the template.
---

Run a full health audit of this vibecoding template. Check every category below, then produce a scored report with specific fixes.

---

## 1. CLAUDE.md health

Read `CLAUDE.md` and check:

- [ ] **Line count** — is it under 200 lines? (Current best practice limit)
- [ ] **No redundant content** — does it repeat things Claude already knows (standard React patterns, obvious rules)?
- [ ] **No commands table** — command lists belong in QUICKSTART.md, not CLAUDE.md (wastes context every session)
- [ ] **Lazy loading rule** — does it say NOT to pre-read all docs at session start?
- [ ] **New project detection** — does it detect blank outline.md and tell user to run `/setup`?
- [ ] **No absolute paths** — hooks or commands should not contain hardcoded machine paths

Run: `wc -l CLAUDE.md` to get line count.

---

## 2. Token efficiency

Check every file that gets loaded into context on a regular session:

- [ ] **`docs/visual-direction.md`** — is it a one-liner placeholder (good) or a verbose multi-paragraph placeholder (wastes tokens)?
- [ ] **`docs/outline.md`** — does it have concise placeholder text, not verbose examples?
- [ ] **`docs/plan.md`** — same — is it minimal until `/setup` fills it?
- [ ] **CLAUDE.md** — any sections that duplicate QUICKSTART.md or docs/?
- [ ] **No eager reads** — does CLAUDE.md instruct Claude to read multiple docs upfront before the user asks for anything?

Score: count the approximate wasted tokens from placeholder verbosity.

---

## 3. `.claude/` structure

Run: `find .claude -type f | sort`

Check:
- [ ] `settings.json` exists
- [ ] `settings.json` has `model` field
- [ ] `settings.json` has `permissions.allow` and `permissions.deny`
- [ ] `settings.json` has `hooks` with at least one `PostToolUse` hook
- [ ] All commands in `.claude/commands/` have `description` frontmatter
- [ ] All skills in `.claude/skills/` have `description` + `allowed-tools` frontmatter
- [ ] No commands or skills reference `opencode`, `AGENTS.md`, or `.opencode/`

---

## 4. MCP configuration

Run: `cat .mcp.json`

Check:
- [ ] `.mcp.json` exists (MCP does NOT go in settings.json)
- [ ] At least one MCP server configured (Context7 recommended)
- [ ] No `mcpServers` key inside `settings.json` (wrong location)
- [ ] Environment variables use `${VAR}` syntax, not hardcoded values

---

## 5. `.gitignore` hygiene

Run: `cat .gitignore`

Check:
- [ ] `.agents/` is ignored (third-party skills must not be committed)
- [ ] `dist/` is ignored
- [ ] `coverage/` is ignored
- [ ] `*.local` is ignored
- [ ] No `.claude/` entries (project skills SHOULD be committed)
- [ ] No `.mcp.json` entry (MCP config SHOULD be committed)

---

## 6. OpenCode artifacts

Run: `grep -r "opencode\|OpenCode\|AGENTS\.md" . --include="*.md" --include="*.json" --include="*.ts" -l 2>/dev/null | grep -v node_modules | grep -v ".git"`

- [ ] Zero results — no opencode references anywhere
- [ ] `opencode.json` does not exist
- [ ] `.opencode/` directory does not exist

---

## 7. Skills quality

Read each skill in `.claude/skills/*/SKILL.md`:

- [ ] `add-feature` has `description`, `allowed-tools`, `argument-hint`
- [ ] `add-component` has `description`, `allowed-tools`
- [ ] `add-route` has `description`, `allowed-tools`
- [ ] No skill references `AGENTS.md` (should reference `CLAUDE.md`)
- [ ] Skills use `$ARGUMENTS` for dynamic input where applicable
- [ ] Consider using `when_to_use` for skills that are hard to discover by description alone
- [ ] Consider `context: fork` for skills with long instructions or side-effect risk (e.g., `/deploy`)
- [ ] Consider `paths:` for skills that only apply to certain file types
- [ ] Consider `disallowed-tools` to block specific tools while a skill is active
- [ ] Consider `model` / `effort` overrides for skills that need Haiku for speed or `xhigh` for complex reasoning

---

## 8. Setup flow quality

Read `.claude/commands/setup.md`:

- [ ] Asks ALL questions in a single message (not sequential back-and-forth)
- [ ] Asks about project domain/type (frontend / backend / fullstack / game / etc.)
- [ ] Installs domain-appropriate skills based on the answer
- [ ] Writes `docs/outline.md`, `docs/plan.md`, `docs/decisions.md` in one pass
- [ ] `docs/plan.md` Phase 0 does NOT list things already scaffolded (e.g. "scaffold React")
- [ ] `docs/outline.md` template matches the format `/setup` writes

---

## 9. Build health

Run these and check output:

```bash
npm run build
npm run lint
npm test -- --run
```

- [ ] Build passes with zero errors
- [ ] Lint passes (or only warnings, no errors)
- [ ] All tests pass
- [ ] **Changelog sync** — check whether `docs/CHANGELOG.md` has real release entries beyond the initial scaffold (any `## [` heading other than `## [Unreleased]`) and whether the `changelog` array in `src/App.tsx` is non-empty. If one side has entries and the other does not, flag as a warning. Fix: either populate `changelog` in `src/App.tsx` to mirror the CHANGELOG.md releases, or add a `## [Unreleased]`-only scaffold entry to CHANGELOG.md if no releases exist yet.

---

## 10. Package currency

Run: `npm outdated`

Check:
- [ ] No packages with a `Latest` version significantly newer than `Current` (major version bump = flag it)
- [ ] No packages with known vulnerabilities (`npm audit` — flag any high/critical)
- [ ] `package.json` does not pin exact versions with `=` prefix (prefer `^` for flexibility)

For any outdated packages, categorize them:
- **Patch/minor** (`Wanted` = `Latest`): safe to `npm update`
- **Major bump** (e.g. vite 7→8, eslint 9→10): note it as a warning with the command to upgrade
- **Security** (from `npm audit`): flag as failure

---

## 11. Post-setup cleanliness

Check whether `/setup` ran completely and left no template fingerprints behind.

Read the following and check:

- [ ] `src/App.tsx` — does NOT contain "Vibecoding Template", "setupSteps", "How it works", or `changelog` array with template entries. If it does, `/setup` Step E was not completed.
- [ ] `src/App.test.tsx` — does NOT test for `'ready to build'` heading. If it does, `/setup` Step E was not completed.
- [ ] `README.md` — does NOT contain "Vibecoding Template" or "degit YOUR_USER/vibecoding-template". If it does, `/setup` Step E was not completed.
- [ ] `docs/getting-started.md` — does NOT exist. If it does, `/setup` Step E was not completed.
- [ ] `index.html` `<title>` — is NOT "Vibecoding Template". If it is, `/setup` Step E was not completed.
- [ ] `package.json` `name` — is NOT "vibecodetemp". If it is, `/setup` Step E was not completed.
- [ ] `docs/outline.md` — does NOT contain "_Run `/setup` to define this._". If it does, `/setup` was never run at all.
- [ ] `docs/decisions.md` — does NOT contain template stack decisions (shadcn/ui choice, TanStack Query strategy). If it does, `/setup` Step D was not completed.

If any of these fail: list which steps were missed and tell the user to re-run `/setup` or manually complete the flagged steps.

---

## 12. Documentation currency

Check these files exist and are up to date:

- [ ] `docs/deploy.md` covers all 3 options: GitHub Pages, Linode, Vercel
- [ ] `docs/QUICKSTART.md` lists both custom and built-in commands and links to the wiki
- [ ] Wiki pages exist: https://github.com/kjarisk/vibeTemplate/wiki/Learning and /wiki/Skills
- [ ] `README.md` references `CLAUDE.md` not `AGENTS.md`

---

## Report format

After running all checks, output a report in this format:

```
## Template Audit Report

### Score: XX/12

### ✅ Passing
- [list items that pass]

### ⚠️ Warnings (non-critical)
- [list minor issues with suggested fix]

### ❌ Failures (must fix)
- [list critical issues with exact fix]

### Token efficiency estimate
- CLAUDE.md: ~XXX tokens (target: <400)
- Docs loaded per session: ~XXX tokens
- Wasted on placeholders: ~XXX tokens
- Recommendation: [specific changes]

### Package currency
- Outdated (minor): [list or "none"]
- Outdated (major): [list with upgrade command]
- Security issues: [list or "none"]

### Recommended next actions (in order)
1. [highest priority fix]
2. ...
```

Be specific — reference file names, line numbers, and exact changes needed.
