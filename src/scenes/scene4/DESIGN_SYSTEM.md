# Scene 4 — Visual System (Virtual Patient)

This document defines the **global design system** for Scene 4 only. Individual shots must consume `designSystem.ts` and `Scene4Primitives.tsx` — not invent ad-hoc colors or layouts.

## Alignment with the rest of the video

- **Colors:** `src/theme.ts` (`colors`, `fonts`) plus Scene 4 tokens in `designSystem.ts`. Scene 4 uses a **deep navy → deep blue** canvas with **soft medical green** (`scene4Accent.active`) for active / emphasis UI.
- **Feel:** Premium clinical product — futuristic, calm, readable; one focal per shot.

## Visual aesthetic

| Rule | Implementation |
|------|----------------|
| Background | `Scene4Backdrop` — navy/blue gradients + ambient wash + **`Scene4Atmosphere`** (animated grid, wave surface, particles, orbital ring) + vignette. Never flat. |
| Panels | `Scene4FocusPanel` — translucent dark blue glass, soft green edge glow (`scene4Panel.defaultAccent`), multi-layer shadow, top highlight. |
| Depth | Shadows, inset highlights; Remotion `interpolate` for motion — slow, smooth (“breathes”). |
| Corners | `scene4Radius` (sm → xl). |
| Focus | Center-weighted composition; vignette + atmosphere keep peripheral UI subdued. |

## 3D & motion language

- **Backdrop motion:** Frame-driven only (`useCurrentFrame` inside `Scene4Atmosphere`) — slow drift on grid, wave phase, particles. No jitter.
- **Shot motion:** `scene4Motion.easeInOut` / `easeOut` with `interpolate` or `spring`. One dominant emphasis per beat.
- **Cuts:** Continuity inside shots; hard cuts only between shots.

## Narration support (mandatory)

Each shot must:

1. **Map script → visible state:** If the line names an action, the UI shows that action or a clear metaphor.
2. **Map concept → metaphor:** Abstract ideas use structured UI — not decoration.
3. **Hierarchy:** The line’s **main idea** is the largest / brightest element.

## Consistency checklist (every shot)

- [ ] Uses `Scene4Backdrop` (includes shared atmosphere).
- [ ] Single primary focal (`Scene4CenterColumn` + one main panel or one main visual).
- [ ] Typography from `scene4Type`.
- [ ] Accent color tied to meaning (`scene4Accent`; default active = soft green family).
- [ ] Motion uses `scene4Motion` easing + explicit frame ranges.

## Files

| File | Role |
|------|------|
| `designSystem.ts` | Tokens: background, glass, type, space, motion, z-index. |
| `Scene4Atmosphere.tsx` | Animated grid, wave mesh, particles, subtle ring (shared by all shots). |
| `Scene4Primitives.tsx` | `Scene4Backdrop`, `Scene4FocusPanel`, `Scene4CenterColumn`, `Scene4ShotLayer`. |
| `DESIGN_SYSTEM.md` | This spec. |
