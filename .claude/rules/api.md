---
paths:
  - "src/features/*/api/**"
---

# Data fetching conventions

Apply when working in `src/features/*/api/` or any file using `useQuery` / `useMutation`.

- Use TanStack Query for all server state — no `useEffect` + `useState` for fetching
- Query key format: `['resource', id?, filters?]` — keep keys stable and predictable
- One `useXQuery` hook per resource type, one `useYMutation` per action
- `useMutation` must call `queryClient.invalidateQueries` on success to keep the cache consistent
- Never put server state in Zustand — Zustand is for UI-only state (dialogs, selections, filters)
