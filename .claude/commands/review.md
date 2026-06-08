---
description: Review recent changes for quality issues
---

Review the current uncommitted changes (or the last commit if working tree is clean).

Run:

```
!`git diff`
```

If the diff is empty, review the last commit:

```
!`git diff HEAD~1`
```

Check for these issues:

**Architecture:**

- Are files in the correct directories per CLAUDE.md rules?
- Are feature-specific components inside their feature slice, not in shared `src/components/`?
- Is server state using TanStack Query (not raw fetch/useEffect)?
- Is UI state using Zustand (not prop drilling or React context for complex state)?

**React 19:**

- Is `forwardRef` being used? (Should be replaced with `ref` as prop)
- Are there useEffect + useState patterns for async data? (Consider `use()` hook)

**Code quality:**

- Any unused imports or variables?
- Any `any` types or `as unknown as X` casts that should be properly typed?
- Are error/loading/empty states handled for data-driven UI?
- Are interactive elements keyboard accessible?

**Scope:**

- Do the changes correspond to a bullet in `docs/outline.md`?
- Are there any features added that are NOT in the outline?

**Tests:**

- Are there tests for critical logic?
- Do existing tests still pass?

Report findings as a checklist with pass/fail for each item. Suggest fixes for any failures.
