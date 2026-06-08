---
description: Bump the template version — updates CHANGELOG.md, App.tsx, package.json, commits, tags, and pushes to GitHub in one pass.
disable-model-invocation: true
---

Bump the template version. Walk through each step below in order.

---

## Step 1 — Determine the new version

Ask the user (in one message):

```
What version are we bumping to? (current: [read version from package.json])
And summarize what changed — I'll use this to write the changelog entry.

Optionally give me:
- Added: [new features/commands/docs]
- Changed: [updates to existing things]
- Fixed: [bugs or broken things]
- Removed: [things deleted]

Or just describe it in plain text and I'll categorize it.
```

Wait for their answer before continuing.

---

## Step 2 — Update `docs/CHANGELOG.md`

Prepend a new release block at the top (below the header, above the previous release):

```markdown
## [X.Y.Z] YYYY-MM-DD — [one-line summary]

### Added
- [item]

### Changed
- [item]

### Fixed
- [item]

### Removed
- [item]
```

Only include sections that have entries. Use today's actual date.

---

## Step 3 — Update `src/App.tsx`

Add a new entry to the top of the `changelog` array with a compressed summary (4–6 bullets max per section, only the highlights — not every line item from CHANGELOG.md):

```tsx
{
  version: 'X.Y.Z',
  date: 'YYYY-MM-DD',
  added: ['...', '...'],
  changed: ['...'],
  fixed: ['...'],
  removed: ['...'],
},
```

Only include keys that have entries. Keep descriptions short — one line each.

---

## Step 4 — Update `package.json`

Change the `version` field to the new version:

```json
"version": "X.Y.Z"
```

---

## Step 5 — Verify build

Run:

```bash
npm run build
```

If it fails, fix the issue before continuing. Do not tag a broken build.

---

## Step 6 — Commit

Stage and commit:

```bash
git add docs/CHANGELOG.md src/App.tsx package.json
git commit -m "chore: bump version to X.Y.Z — [one-line summary]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Step 7 — Tag

Create an annotated tag with the changelog entry as the message:

```bash
git tag -a vX.Y.Z -m "[paste the full changelog entry for this version]"
```

---

## Step 8 — Push

```bash
git push origin main
git push origin vX.Y.Z
```

---

## Step 9 — Confirm

Tell the user:

```
✅ v[X.Y.Z] pushed to GitHub

Tag: vX.Y.Z
Commit: [short sha]

View release: https://github.com/[owner]/[repo]/releases/tag/vX.Y.Z
To create a GitHub Release from this tag, visit the URL above and click "Create release from tag".
```

Get the repo URL from `git remote get-url origin`.
