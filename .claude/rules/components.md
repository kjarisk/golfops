---
paths:
  - "src/components/**"
  - "src/features/*/components/**"
---

# Component conventions

Apply when working in `src/components/` or `src/features/*/components/`.

- Use shadcn/ui primitives from `src/components/ui/` as the base — don't rewrite what's already there
- Props interface above the component, never inline
- Every interactive component must be keyboard-accessible: focusable, labeled, correct ARIA role
- Loading, error, and empty states are required for any component that depends on async data
- No direct Zustand reads in pure UI components — pass state as props or use a feature-level hook
