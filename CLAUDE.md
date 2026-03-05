# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIMMS LMS Flow Demo Video v3 — a ~2:01 professional demo video built with **Remotion** + **Three.js** (React Three Fiber). It showcases the AIMMS (AI Medical Mentoring System) platform workflow at the University of Arizona through **conceptual motion graphics** — abstract visual metaphors, not UI recreations. Output: 1920×1080 @ 30fps MP4.

Every scene uses a hybrid architecture: Three.js 3D environments as the primary visual layer, with minimal HTML overlays for titles and badges.

## Commands

```bash
npm run dev      # Launch Remotion Studio (interactive preview/editor)
npm run build    # Render final video to out/aimms-lms-flow.mp4
npm run preview  # Quick preview in studio
```

No test suite or linter is configured.

## Architecture

**Entry flow:** `src/index.ts` → `Root.tsx` (Composition config, 3625 frames) → `AimmsFlow.tsx` (scene orchestration)

**AimmsFlow.tsx** uses `TransitionSeries` with 15-frame fade transitions to sequence 6 scenes, each with a synchronized voiceover audio track via `staticFile()`.

### Scene Layout System

Every scene wraps in **`SceneShell`** (`src/layouts/SceneShell.tsx`) which provides:
- **Layer 1:** `<ThreeCanvas>` from `@remotion/three` with ambient + directional lighting
- **Layer 2:** HTML overlay (z-index 2) with optional `InterstitialCard` and section badge

**`InterstitialCard`** (`src/layouts/InterstitialCard.tsx`) — shared "Step N" title card, fades on frames [0,10,50,65].

### Scene Structure (src/scenes/)

Each scene represents its concept through visual metaphor, not UI simulation.

| Scene | File | Frames | Concept | Visual Metaphor |
|-------|------|--------|---------|-----------------|
| 1 | Scene1_Intro.tsx | 400 | Emergence | NodeNetwork morphs from chaos → hexagonal order |
| 2 | Scene2_MCC.tsx | 700 | Knowledge Assembly | Text fragments converge into a document, AI neural net pulses |
| 3 | Scene3_Assignment.tsx | 500 | Connection | Faculty node → DataStreams → student nodes light up |
| 4 | Scene4_VirtualPatient.tsx | 900 | Holographic Exam | AbstractBody with OrbitRings, ScanBeam, WaveformLines |
| 5 | Scene5_AIMHEI.tsx | 600 | Analysis | Particles converge → crystallize into score arc + radar axes |
| 6 | Scene6_FlowRecap.tsx | 600 | Complete Pipeline | 5 NodeNetwork clusters with distinct shapes, connected by DataStreams |

Total: 3625 frames (~2:01) after fade overlaps.

### 3D Components (src/three/)

All driven by `useCurrentFrame()` from Remotion. **Never** use `useFrame()` from R3F.

**Atmospheric base:**
- **ParticleField** — Drifting `<points>` cloud with sine wobble
- **AnimatedGrid** — Wireframe plane at Y=-2 with wave vertex displacement
- **GlowOrb** — Additive-blending sphere with pulsing opacity
- **CameraRig** — Keyframe-driven camera via `useThree()` + `interpolate()`

**Structural elements:**
- **NodeNetwork** — Connected node graph with morph support (core component, used in 4+ scenes)
- **AbstractBody** — Human silhouette as ~100 glowing nodes in body-region clusters, with highlight support
- **FloatingPanel** — Hovering 3D plane with subtle float
- **DataStream** — Instanced flowing dots (up/down/left/right)

**Effects:**
- **OrbitRing** — Glowing torus rotating around a point (holographic scanner)
- **ScanBeam** — Sweeping light plane for scanning effects
- **WaveformLine** — Animated ECG-style 3D line with sine + spike displacement
- **TextLine** — 3D floating text via `@react-three/drei` `<Text>`

### Supporting Components (src/components/)

- **AnimatedBox** — Spring-based entrance animations
- **FeatureBadge** — Bold pill badge (used in every scene for phase labels)
- **FlowArrow** — Animated arrow primitives
- **AnimatedCursor, ClickRipple, PulsingDot, NarratorCaption** — Available but not currently used
- **ScreenshotReveal** — DEPRECATED (kept for reference)

### Theme (src/theme.ts)

Always use `colors` and `fonts` exports — never hardcode color values.

- **Colors:** `arizonaRed` (#AB0520), `arizonaBlue` (#0C234B), `midnight`, `azurite`, `oasis`, `chili`, slate scale, `ecgGreen` (#39FF14), vitals palette
- **Fonts:** `heading` (Plus Jakarta Sans), `body` (Inter), `mono` (JetBrains Mono)

### Static Assets (public/)

- `public/audio/` — 6 scene voiceover MP3s (ElevenLabs, voice ID tM6ZW48ZoSKdJKuhjatr, speed 0.92)
- `public/screenshots/` — Reference screenshots (not displayed, kept for design reference)

## Key Patterns

- **Frame-based animation:** All animation driven by `useCurrentFrame()` + `interpolate()` + `spring()` from "remotion"
- **No R3F useFrame():** Forbidden — causes flickering during Remotion rendering
- **No CSS transitions:** Forbidden — won't render correctly in Remotion
- **No DOM lifecycle:** Components are pure functions of frame number — no useState, no useEffect
- **ThreeCanvas rules:** Must have `width`/`height` props. `<Sequence>` inside must have `layout="none"`.
- **Phase transitions:** Opacity-based crossfades using `interpolate()` on frame ranges
- **Color coding:** arizonaRed = authoring, azurite = assignment, oasis = simulation, ecgGreen = active/medical, vitalsNormal = reporting
- **Audio sync:** Each scene's `<Audio>` in `<Sequence>` with `from` offset (10–15 frames)
- **Visual metaphor over UI:** Represent concepts through abstract motion graphics (node networks, particle convergence, scanning beams), not mock application interfaces
