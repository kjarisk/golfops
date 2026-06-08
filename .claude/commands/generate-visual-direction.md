---
description: Read moodboard and screenshot images and write docs/visual-direction.md
---

Read the moodboard and screenshot images once, then write a `docs/visual-direction.md` summary that the agent can reference going forward — without re-reading images every session.

**The two folders serve different purposes:**
- `docs/moodboard/` — *feeling and direction*: color palettes, typography, abstract references, brand mood. Answers "what should this feel like?"
- `docs/screenshots/` — *concrete UI reference*: app screenshots, competitor UIs, specific component patterns. Answers "what should this look like and how should it work?"

Treat them accordingly during analysis — moodboard informs tone and aesthetic, screenshots inform layout and component decisions.

## Steps

1. **Check for images**
   - List files in `docs/moodboard/` and `docs/screenshots/` (excluding `README.md`).
   - If both directories contain only `README.md` (no images): tell the user "No images found. Add images to `docs/moodboard/` and/or `docs/screenshots/` then re-run this command." Stop here.

2. **Read all images**
   - Read every image file found (use the Read tool — it supports image attachments).
   - If there are many images, read them all in parallel.

3. **Analyse and synthesise**
   - Extract the following from the images:

   **Color palette**
   - Background color(s) (light, dark, or both)
   - Primary / accent / highlight colors
   - Text colors
   - Border/surface colors
   - Any glow, gradient, or special effects

   **Typography**
   - Font families visible (display, body, mono)
   - Heading weight and size feel (heavy/light, compact/airy)
   - Overall text hierarchy approach

   **Tone & personality**
   - Adjectives that describe the visual mood (e.g., energetic, calm, playful, professional, editorial)
   - What the design is NOT (e.g., "not clinical", "not corporate")

   **Layout patterns**
   - Page structure (hero, sidebar, cards, grid, list)
   - Spacing feel (dense, generous, breathing room)
   - Card style (rounded, flat, bordered, elevated, glassmorphism)
   - Any repeated visual motifs (blobs, gradients, icons, illustrations)

   **Light vs dark themes** (if both are visible)
   - How the palette shifts between modes
   - Which is default / primary

   **Key UI patterns to replicate**
   - Specific component styles worth noting (buttons, badges, modals, nav)

   **Patterns to avoid**
   - Anything that clashes with the observed aesthetic

4. **Write `docs/visual-direction.md`**
   - Use the structure above as sections.
   - Keep it scannable: use short bullet lists, not long paragraphs.
   - Include approximate hex or oklch values where you can identify them from the images.
   - End with a "Quick reference" table: token name → description → example value.
   - Note the source images this summary was derived from (filenames only).

5. **Confirm**
   - Tell the user: "`docs/visual-direction.md` written. Claude Code will now use this file instead of re-reading images each session."

## Notes

- Run once at project start (after dropping images in) and re-run whenever the visual direction changes significantly.
- `docs/visual-direction.md` is listed in CLAUDE.md — it will be checked every session.
- Do NOT modify existing source images. Only write `docs/visual-direction.md`.
