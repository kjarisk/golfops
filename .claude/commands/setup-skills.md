---
description: Check and install recommended skills for this project
disable-model-invocation: true
---

Check whether recommended skills are installed and offer to install them.

## Steps

1. Run `npx ctx7 skills list` to see what is currently installed in `.agents/skills/`.

2. Compare the output against the recommended skills from the [Skills wiki](https://github.com/kjarisk/vibeTemplate/wiki/Skills):
   - `frontend-design` (from `/anthropics/skills`)
   - `canvas-design` (from `/anthropics/skills`)
   - `interaction-design` (from `/wshobson/agents`)

3. If `.agents/skills/` is **empty or missing** all recommended skills:
   - Tell the user which skills are not installed.
   - Ask: "Install all recommended skills now? (Yes / No / Let me pick)"
   - If Yes: run each install command (ctx7 installs one at a time):
     ```bash
     npx ctx7 skills install /anthropics/skills frontend-design --universal -y
     npx ctx7 skills install /anthropics/skills canvas-design --universal -y
     npx ctx7 skills install /wshobson/agents interaction-design --universal -y
     ```
   - If "Let me pick": list each skill with a one-line description and ask which to install.
   - If No: skip and continue.

4. If some skills are already installed, only offer to install the missing ones.

5. After install (or skip), confirm the final list of installed skills to the user.

6. Remind the user that project-specific skills (`add-feature`, `add-component`, `add-route`) in `.claude/skills/` are always available and require no installation.

## Notes

- `.agents/skills/` is gitignored — each developer installs skills locally.
- Skills follow the [Agent Skills](https://agentskills.io) open standard.
- Full reference: https://github.com/kjarisk/vibeTemplate/wiki/Skills
