# golfops — agent context
## Shared platform (Kjarni)

Reusable patterns, prior implementations, and workflows across my apps are catalogued in
`../kjarni` (the registry repo). **Do not read it automatically.**

The rule: **this repo is the workspace. Kjarni is a library. Other apps are reference sources.**
Never scan other apps automatically.

When the user references another app or asks "have I built this before / reuse X from app Y":
1. Read `../kjarni/registry/capabilities.yaml` (or `workflows.yaml`) and match the request.
2. Open only that entry's doc in `../kjarni/capabilities/<id>/`.
3. Respect its `reuse_mode` (reference-only | pattern | copy-template | package-candidate | package).
4. Inspect only the listed source files in the reference app; adapt the pattern HERE.
5. Do not modify another app unless explicitly asked. Record adoption in `../kjarni/registry/apps.yaml`.

See `../kjarni/USAGE.md` for prompt patterns and `../kjarni/skills/reuse-existing-capability/`.
