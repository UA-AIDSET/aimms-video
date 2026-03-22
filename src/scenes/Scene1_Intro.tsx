import React from "react";
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";
import { AnimatedBox } from "../components/AnimatedBox";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";

/**
 * Scene 1: Intro — Digital Awakening
 * Layer stack (back to front):
 *   0. Three.js: AnimatedGrid + ParticleField + GlowOrb (3D depth)
 *   1. Dot grid texture — fills empty space with subtle structure
 *   2. Side structural panels — fills the wide empty left/right zones
 *   3. Horizontal data traces — fills empty upper/lower zones
 *   4. Corner UI fragment panels — corner / edge accents
 *   5. Frame border: corner brackets, scan lines, side accent lines
 *   6. Expanding rings (transient)
 *   7. Main text (three-beat progression: AIMMS → subtitle → tagline)
 *   8. Bottom data ticker
 *
 * Total: ~540 frames (15.1s audio + fade)
 */

// Side panel data bars — different widths for left vs right
const LEFT_BARS  = [0.82, 0.65, 0.92, 0.55, 0.78, 0.48, 0.70, 0.60, 0.86, 0.52];
const RIGHT_BARS = [0.75, 0.90, 0.58, 0.83, 0.68, 0.95, 0.52, 0.77, 0.63, 0.88];

// Horizontal ambient traces — fills upper (y<280) and lower (y>800) empty zones
const H_TRACES = [
  { y: 148, w: 1080, delay: 26, op: 0.100 },
  { y: 205, w:  800, delay: 36, op: 0.082 },
  { y: 260, w:  540, delay: 46, op: 0.064 },
  { y: 820, w: 1080, delay: 31, op: 0.100 },
  { y: 877, w:  800, delay: 41, op: 0.082 },
  { y: 934, w:  540, delay: 51, op: 0.064 },
];

// Corner/edge UI fragment panels
const BG_FRAGMENTS: Array<{
  x: number; y: number; w: number; h: number;
  sx: number; sy: number; delay: number; bars: number[];
}> = [
  { x: 108,  y: 148,  w: 212, h: 108, sx: -38, sy: -28, delay: 5,  bars: [0.72, 0.90, 0.52] },
  { x: 1600, y: 132,  w: 196, h: 92,  sx:  40, sy: -26, delay: 12, bars: [0.85, 0.60] },
  { x: 85,   y: 724,  w: 230, h: 112, sx: -36, sy:  32, delay: 18, bars: [0.62, 0.80, 0.46] },
  { x: 1640, y: 744,  w: 190, h: 96,  sx:  42, sy:  30, delay: 9,  bars: [0.75, 0.55] },
  { x: 140,  y: 442,  w: 168, h: 74,  sx: -26, sy:  10, delay: 26, bars: [0.80, 0.50] },
  { x: 1712, y: 458,  w: 156, h: 70,  sx:  28, sy:   8, delay: 21, bars: [0.65, 0.84] },
  { x: 338,  y: 186,  w: 136, h: 62,  sx: -16, sy: -20, delay: 34, bars: [0.72, 0.50] },
  { x: 1446, y: 178,  w: 146, h: 66,  sx:  18, sy: -18, delay: 29, bars: [0.60, 0.78] },
];

export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeIO = { easing: Easing.inOut(Easing.ease) };

  // ── LOGO ENTRANCE ──────────────────────────────────────────────────────────
  const logoEnter = spring({ frame, fps, config: { damping: 22, stiffness: 80, mass: 1 } });

  // ── HORIZONTAL RULE ────────────────────────────────────────────────────────
  const ruleWidth = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 70 } });

  // ── SHIMMER across AIMMS ───────────────────────────────────────────────────
  const shimmerX = interpolate(frame, [50, 120], [-400, 2400], clamp);

  // ── FRAME BORDER ELEMENTS ──────────────────────────────────────────────────
  const bracketDraw     = interpolate(frame, [5, 60], [0, 1], clamp);
  const bracketGlow     = 0.6 + 0.4 * Math.sin(frame * 0.06);
  const topScanX        = interpolate(frame, [20, 80], [-1920, 0], clamp);
  const botScanX        = interpolate(frame, [30, 90], [1920, 0], clamp);
  const sideLineOpacity = interpolate(frame, [40, 70], [0, 1], clamp);
  const sideLinePulse   = 0.5 + 0.5 * Math.sin(frame * 0.08);

  // ── EXPANDING RINGS ────────────────────────────────────────────────────────
  const ringScale    = interpolate(frame, [10, 100], [0, 1], clamp);
  const ringOpacity  = interpolate(frame, [10, 50, 90, 130], [0, 0.25, 0.15, 0], clamp);
  const ring2Scale   = interpolate(frame, [30, 120], [0, 1], clamp);
  const ring2Opacity = interpolate(frame, [30, 70, 110, 150], [0, 0.20, 0.10, 0], clamp);

  // ── TICKER ─────────────────────────────────────────────────────────────────
  const tickerOpacity = interpolate(frame, [80, 110], [0, 0.65], clamp);
  const tickerScroll  = interpolate(frame, [80, 580], [0, -2400], clamp);

  // ── GLOBAL FADE OUT ────────────────────────────────────────────────────────
  const fadeOut = interpolate(frame, [500, 535], [1, 0], clamp);

  // ── BACKGROUND ORGANISE ANIMATION ─────────────────────────────────────────
  // bg elements: start slightly scattered, settle into final positions
  const organizeProgress = interpolate(frame, [15, 80], [0, 1], { ...clamp, ...easeIO });
  const bgSwayX = Math.sin(frame * 0.011) * 7;
  const bgSwayY = Math.cos(frame * 0.009 + 0.8) * 4;

  // ── DOT GRID TEXTURE ───────────────────────────────────────────────────────
  const dotGridOp = interpolate(frame, [0, 35], [0, 1], { ...clamp, ...easeIO });

  // ── SIDE STRUCTURAL PANELS ─────────────────────────────────────────────────
  // Panels appear early (f12-58) to establish spatial structure before text
  const sidePanelOp = interpolate(frame, [12, 58], [0, 1], { ...clamp, ...easeIO });
  // Each bar inside a panel reveals staggered top → bottom (suggests system initialising)
  const leftBarOp  = (i: number) => interpolate(frame, [20 + i * 7, 20 + i * 7 + 22], [0, 1], clamp);
  const rightBarOp = (i: number) => interpolate(frame, [24 + i * 7, 24 + i * 7 + 22], [0, 1], clamp);

  // ── HORIZONTAL DATA TRACES ─────────────────────────────────────────────────
  // Draw from center outward (scaleX 0→1) to fill upper/lower empty zones
  const traceProgress = (delay: number) =>
    interpolate(frame, [delay, delay + 28], [0, 1], { ...clamp, ...easeIO });

  // ── AIMMS TITLE: subtle breathing after settling ───────────────────────────
  const aimmsSettled   = frame >= 90;
  const aimmsBreath    = aimmsSettled ? 1 + 0.008 * Math.sin((frame - 90) * 0.038) : 1;
  const aimmsGlowF     = aimmsSettled ? 0.52 + 0.18 * Math.sin((frame - 90) * 0.038) : 0.40;

  // ── SUBTITLE DATA LINES ────────────────────────────────────────────────────
  const dataLine1 = interpolate(frame, [105, 133], [0, 1], { ...clamp, ...easeIO });
  const dataLine2 = interpolate(frame, [118, 146], [0, 1], { ...clamp, ...easeIO });
  const dataLine3 = interpolate(frame, [131, 159], [0, 1], { ...clamp, ...easeIO });

  const cornerSize      = 60;
  const cornerThickness = 2;
  const cornerInset     = 40;

  const tickerItems = [
    "AIMMS v3.2 INITIALIZED", "//", "NEURAL PIPELINE ACTIVE", "//",
    "LLM ENGINE: READY", "//", "MEDICAL CASE CREATOR", "//",
    "VIRTUAL PATIENT SIM", "//", "AIMS PERFORMANCE REPORTS", "//",
    "FACULTY DASHBOARD", "//", "AI-POWERED CASE AUTHORING", "//",
  ];
  const tickerText = tickerItems.join("   ");

  // Panel shared styling helpers
  const panelBorderColor = `${colors.oasis}28`;       // ~16% opacity
  const panelFill = `linear-gradient(180deg, ${colors.azurite}0D 0%, ${colors.midnight}07 60%, transparent 100%)`;

  const threeContent = (
    <>
      <AnimatedGrid color="#1E5288" opacity={0.06} />
      <ParticleField count={32} color="#378DBD" speed={0.002} opacity={0.11} />
      <GlowOrb position={[0, 0, -6]} color={colors.oasis} radius={3} baseOpacity={0.07} />
      <CameraRig
        positions={[
          { frame: 0,   position: [0, 0, 10.5] },
          { frame: 400, position: [0, 0,  8.5] },
        ]}
      />
    </>
  );

  return (
    <SceneShell threeContent={threeContent}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: fadeOut }}>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 1 — DOT GRID TEXTURE
            Subtle repeating dot pattern fills the dark background with
            micro-structure so the frame never reads as pure empty. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${colors.oasis}38 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            opacity: dotGridOp * 0.055,
            transform: `translate(${bgSwayX * 0.3}px, ${bgSwayY * 0.3}px)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 2 — SIDE STRUCTURAL PANELS
            Two large faint panels on left and right fill the wide empty
            zones flanking the center text column. They appear before the
            text to establish spatial presence first, then the text arrives.

            Left panel: x 68–318  (inside corner bracket, outside fragments)
            Right panel: x 1602–1852  (mirror) */}

        {/* Left panel */}
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 162,
            width: 258,
            height: 756,
            opacity: sidePanelOp,
            border: `1px solid ${panelBorderColor}`,
            borderRadius: 6,
            background: panelFill,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 1,
            transform: `translate(${bgSwayX * 0.55}px, ${bgSwayY * 0.45}px)`,
          }}
        >
          {/* Header accent bar */}
          <div style={{ height: 2, width: "100%", background: `${colors.arizonaRed}55`, flexShrink: 0 }} />
          {/* Mono label */}
          <div style={{
            fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.5,
            color: `${colors.oasis}70`, textTransform: "uppercase",
            padding: "8px 14px 12px",
          }}>
            SYS STATUS
          </div>
          {/* Data bar rows — top section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 14px" }}>
            {LEFT_BARS.slice(0, 6).map((bw, i) => (
              <div key={i} style={{ opacity: leftBarOp(i) }}>
                <div style={{ fontSize: 8, fontFamily: fonts.mono, color: `${colors.oasis}50`,
                  letterSpacing: 1.5, marginBottom: 3 }}>
                  {["PATIENT DB", "CASE LIB", "AI ENGINE", "FACULTY", "STUDENTS", "REPORTS"][i]}
                </div>
                <div style={{
                  height: 3, width: `${bw * 100}%`,
                  background: i % 2 === 0
                    ? `linear-gradient(90deg, ${colors.oasis}C0, ${colors.oasis}50)`
                    : `linear-gradient(90deg, ${colors.azurite}C0, ${colors.azurite}50)`,
                  borderRadius: 2,
                }} />
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{ height: 1, background: `${colors.oasis}20`, margin: "18px 14px" }} />
          {/* Secondary bar rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "0 14px" }}>
            {LEFT_BARS.slice(6).map((bw, i) => (
              <div key={i} style={{ opacity: leftBarOp(i + 7) }}>
                <div style={{
                  height: 2, width: `${bw * 100}%`,
                  background: `${colors.oasis}80`,
                  borderRadius: 1,
                }} />
              </div>
            ))}
          </div>
          {/* Bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: `linear-gradient(0deg, ${colors.midnight} 0%, transparent 100%)`,
          }} />
        </div>

        {/* Right panel */}
        <div
          style={{
            position: "absolute",
            right: 68,
            top: 195,
            width: 250,
            height: 690,
            opacity: sidePanelOp,
            border: `1px solid ${panelBorderColor}`,
            borderRadius: 6,
            background: panelFill,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 1,
            transform: `translate(${-bgSwayX * 0.55}px, ${bgSwayY * 0.45}px)`,
          }}
        >
          {/* Header accent bar */}
          <div style={{ height: 2, width: "100%", background: `${colors.arizonaRed}55` }} />
          <div style={{
            fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.5,
            color: `${colors.oasis}70`, textTransform: "uppercase",
            padding: "8px 14px 12px",
          }}>
            DATA FLOW
          </div>
          {/* Top data group */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 14px" }}>
            {RIGHT_BARS.slice(0, 4).map((bw, i) => (
              <div key={i} style={{ opacity: rightBarOp(i) }}>
                <div style={{ fontSize: 8, fontFamily: fonts.mono, color: `${colors.azurite}55`,
                  letterSpacing: 1.5, marginBottom: 3 }}>
                  {["INPUT", "PROCESS", "VALIDATE", "OUTPUT"][i]}
                </div>
                <div style={{
                  height: 3, width: `${bw * 100}%`,
                  background: i % 2 === 0
                    ? `linear-gradient(90deg, ${colors.azurite}C0, ${colors.azurite}50)`
                    : `linear-gradient(90deg, ${colors.oasis}C0, ${colors.oasis}50)`,
                  borderRadius: 2,
                }} />
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{ height: 1, background: `${colors.oasis}20`, margin: "18px 14px" }} />
          {/* Secondary mini-panel group */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 14px" }}>
            {RIGHT_BARS.slice(4, 8).map((bw, i) => (
              <div key={i} style={{
                padding: "6px 10px",
                border: `1px solid ${colors.azurite}22`,
                borderRadius: 4,
                opacity: rightBarOp(i + 5),
              }}>
                <div style={{
                  height: 2, width: `${bw * 100}%`,
                  background: `${colors.oasis}70`, borderRadius: 1,
                }} />
                <div style={{
                  height: 1.5, width: `${RIGHT_BARS[i + 4 + 1] ?? 0.6 * 100}%`,
                  background: `${colors.azurite}60`, borderRadius: 1, marginTop: 5,
                }} />
              </div>
            ))}
          </div>
          {/* Bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
            background: `linear-gradient(0deg, ${colors.midnight} 0%, transparent 100%)`,
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 3 — HORIZONTAL DATA TRACES
            Fills the empty upper zone (y 148–260) and lower zone (y 820–934)
            with faint horizontal lines that draw from center outward.
            Three traces per zone at decreasing widths and opacity. */}
        {H_TRACES.map((t, i) => {
          const tp = traceProgress(t.delay);
          return (
            <div
              key={`trace-${i}`}
              style={{
                position: "absolute",
                top: t.y,
                left: "50%",
                width: t.w,
                height: 1,
                transform: `translateX(-50%) scaleX(${tp})`,
                transformOrigin: "center",
                background: i % 2 === 0
                  ? `linear-gradient(90deg, transparent, ${colors.oasis}70, transparent)`
                  : `linear-gradient(90deg, transparent, ${colors.azurite}80, transparent)`,
                opacity: tp * t.op,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          );
        })}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 4 — CORNER / EDGE FRAGMENT PANELS
            Small faint UI panels anchored to corners and edge midpoints. */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          {BG_FRAGMENTS.map((frag, i) => {
            // Corrected opacity: simple fade-in to a visible base
            const fragOp = interpolate(frame, [frag.delay, frag.delay + 28], [0, 1], clamp);
            const baseVis = i >= 6 ? 0.13 : 0.17;  // inner panels slightly dimmer
            const curX = frag.x + frag.sx * (1 - organizeProgress) + bgSwayX * 0.75;
            const curY = frag.y + frag.sy * (1 - organizeProgress) + bgSwayY * 0.60;

            return (
              <div
                key={`frag-${i}`}
                style={{
                  position: "absolute",
                  left: curX,
                  top: curY,
                  width: frag.w,
                  height: frag.h,
                  opacity: fragOp * baseVis,
                  border: `1px solid ${colors.oasis}55`,
                  borderRadius: 5,
                  padding: "10px 14px",
                  background: `linear-gradient(135deg, ${colors.azurite}0E, ${colors.oasis}08)`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  gap: 7,
                }}
              >
                <div style={{ height: 1, width: "35%", background: `${colors.arizonaRed}90`, borderRadius: 1 }} />
                {frag.bars.map((bw, bi) => (
                  <div
                    key={bi}
                    style={{
                      height: bi === 0 ? 2 : 1.5,
                      width: `${bw * 100}%`,
                      background: bi === 0 ? `${colors.oasis}CC` : `${colors.azurite}A0`,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 5 — FRAME BORDER: CORNER BRACKETS, SCAN LINES, SIDE ACCENTS */}

        {/* Corner brackets */}
        <svg style={{ position: "absolute", top: cornerInset, left: cornerInset }}
          width={cornerSize} height={cornerSize} viewBox={`0 0 ${cornerSize} ${cornerSize}`}>
          <path d={`M 0,${cornerSize} L 0,0 L ${cornerSize},0`} fill="none" stroke={colors.oasis}
            strokeWidth={cornerThickness} strokeLinecap="round" opacity={bracketGlow}
            strokeDasharray={cornerSize * 2} strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)} />
        </svg>
        <svg style={{ position: "absolute", top: cornerInset, right: cornerInset }}
          width={cornerSize} height={cornerSize} viewBox={`0 0 ${cornerSize} ${cornerSize}`}>
          <path d={`M 0,0 L ${cornerSize},0 L ${cornerSize},${cornerSize}`} fill="none" stroke={colors.oasis}
            strokeWidth={cornerThickness} strokeLinecap="round" opacity={bracketGlow}
            strokeDasharray={cornerSize * 2} strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)} />
        </svg>
        <svg style={{ position: "absolute", bottom: cornerInset + 40, left: cornerInset }}
          width={cornerSize} height={cornerSize} viewBox={`0 0 ${cornerSize} ${cornerSize}`}>
          <path d={`M 0,0 L 0,${cornerSize} L ${cornerSize},${cornerSize}`} fill="none" stroke={colors.oasis}
            strokeWidth={cornerThickness} strokeLinecap="round" opacity={bracketGlow}
            strokeDasharray={cornerSize * 2} strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)} />
        </svg>
        <svg style={{ position: "absolute", bottom: cornerInset + 40, right: cornerInset }}
          width={cornerSize} height={cornerSize} viewBox={`0 0 ${cornerSize} ${cornerSize}`}>
          <path d={`M ${cornerSize},0 L ${cornerSize},${cornerSize} L 0,${cornerSize}`} fill="none" stroke={colors.oasis}
            strokeWidth={cornerThickness} strokeLinecap="round" opacity={bracketGlow}
            strokeDasharray={cornerSize * 2} strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)} />
        </svg>

        {/* Horizontal scan lines — sweep in from edges */}
        <div style={{
          position: "absolute", top: cornerInset + 10,
          left: cornerInset + cornerSize + 20, right: cornerInset + cornerSize + 20,
          height: 1,
          background: `linear-gradient(90deg, ${colors.oasis}60, ${colors.oasis}20, transparent)`,
          transform: `translateX(${topScanX}px)`,
        }} />
        <div style={{
          position: "absolute", bottom: cornerInset + 40 + cornerSize - 10,
          left: cornerInset + cornerSize + 20, right: cornerInset + cornerSize + 20,
          height: 1,
          background: `linear-gradient(270deg, ${colors.oasis}60, ${colors.oasis}20, transparent)`,
          transform: `translateX(${botScanX}px)`,
        }} />

        {/* Side accent lines */}
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            style={{
              position: "absolute",
              top: cornerInset + cornerSize + 30,
              bottom: cornerInset + 40 + cornerSize + 30,
              [side]: cornerInset + 10,
              width: 1,
              background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}80, ${colors.oasis}00)`,
              opacity: sideLineOpacity * sideLinePulse,
            }}
          />
        ))}

        {/* Edge tick marks — left */}
        {[0, 1, 2, 3, 4].map((i) => {
          const td = 50 + i * 12;
          const tickOp = interpolate(frame, [td, td + 15], [0, 0.5], clamp);
          return (
            <div key={`tl-${i}`} style={{
              position: "absolute", top: 200 + i * 120, left: cornerInset,
              width: 20, height: 1, background: colors.azurite,
              opacity: tickOp * sideLinePulse,
            }} />
          );
        })}
        {/* Edge tick marks — right */}
        {[0, 1, 2, 3, 4].map((i) => {
          const td = 55 + i * 12;
          const tickOp = interpolate(frame, [td, td + 15], [0, 0.5], clamp);
          return (
            <div key={`tr-${i}`} style={{
              position: "absolute", top: 200 + i * 120, right: cornerInset,
              width: 20, height: 1, background: colors.azurite,
              opacity: tickOp * sideLinePulse,
            }} />
          );
        })}

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 6 — EXPANDING RINGS (transient, behind text) */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 500, height: 500, borderRadius: "50%",
          border: `1px solid ${colors.oasis}`, opacity: ringOpacity, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${ring2Scale})`,
          width: 700, height: 700, borderRadius: "50%",
          border: `1px solid ${colors.azurite}`, opacity: ring2Opacity, pointerEvents: "none",
        }} />

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 7 — MAIN TEXT: THREE-BEAT PROGRESSION
            Beat A f35  → "AIMMS"                (arrives alone, owns the frame)
            Beat B f90  → "AI Medical Mentoring System"  (1.8s gap after A)
            Beat C f145 → Supporting tagline               (1.8s gap after B) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 60,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* ASTEC Logo — immediate anchor */}
          <AnimatedBox delay={0} direction="scale">
            <div
              style={{
                opacity: interpolate(logoEnter, [0, 1], [0, 1]),
                transform: `scale(${interpolate(logoEnter, [0, 1], [0.9, 1])})`,
                background: `linear-gradient(135deg, ${colors.white}90, ${colors.white}60)`,
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                padding: "18px 36px",
                border: `1px solid ${colors.white}40`,
                boxShadow: `0 8px 32px ${colors.midnight}60, 0 0 40px ${colors.oasis}15, inset 0 1px 0 ${colors.white}40`,
              }}
            >
              <Img src={staticFile("screenshots/astec_logo.png")}
                style={{ height: 70, objectFit: "contain" }} />
            </div>
          </AnimatedBox>

          {/* Dividing rule */}
          <div style={{
            width: interpolate(ruleWidth, [0, 1], [0, 200]),
            height: 2,
            background: `linear-gradient(90deg, transparent, ${colors.arizonaRed}, transparent)`,
            borderRadius: 1,
            marginTop: 28,
            marginBottom: 28,
          }} />

          {/* ── BEAT A: "AIMMS" ─────────────────────────────────────────── */}
          <AnimatedBox delay={35} direction="up">
            <div style={{ position: "relative", overflow: "hidden" }}>
              <h1
                style={{
                  color: colors.white,
                  fontSize: 90,
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  letterSpacing: -2,
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.1,
                  textShadow: `0 0 ${48 + aimmsGlowF * 28}px ${colors.oasis}60, 0 0 90px ${colors.oasis}18`,
                  transform: `scale(${aimmsBreath})`,
                  display: "block",
                }}
              >
                AIMMS
              </h1>
              {/* Shimmer sweep */}
              <div style={{
                position: "absolute", top: 0, left: shimmerX, width: 200, height: "100%",
                background: `linear-gradient(90deg, transparent, ${colors.white}30, transparent)`,
                transform: "skewX(-20deg)", pointerEvents: "none",
              }} />
            </div>
          </AnimatedBox>

          {/* ── BEAT B: subtitle ─────────────────────────────────────────── */}
          <AnimatedBox delay={90} direction="up">
            <div>
              <p style={{
                color: colors.oasis,
                fontSize: 27,
                fontFamily: fonts.body,
                fontWeight: 400,
                letterSpacing: 6,
                textTransform: "uppercase",
                margin: "18px 0 0",
                textAlign: "center",
              }}>
                AI Medical Mentoring System
              </p>
              {/* Three tapering data lines beneath subtitle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 14, alignItems: "center" }}>
                {[
                  { op: dataLine1, w: "62%", color: `${colors.oasis}52` },
                  { op: dataLine2, w: "44%", color: `${colors.azurite}62` },
                  { op: dataLine3, w: "28%", color: `${colors.oasis}38` },
                ].map((l, i) => (
                  <div key={i} style={{
                    height: 1, width: l.w, background: l.color, borderRadius: 1,
                    opacity: l.op, transform: `scaleX(${l.op})`, transformOrigin: "center",
                  }} />
                ))}
              </div>
            </div>
          </AnimatedBox>

          {/* ── BEAT C: tagline ──────────────────────────────────────────── */}
          <AnimatedBox delay={145} direction="up">
            <p style={{
              color: `${colors.slate200}C8`,
              fontSize: 20,
              fontFamily: fonts.body,
              fontWeight: 400,
              margin: "26px 0 0",
              textAlign: "center",
              maxWidth: 720,
              lineHeight: 1.6,
            }}>
              An end-to-end pipeline for case authoring, immersive virtual patient
              simulation, and AI-driven performance evaluation.
            </p>
          </AnimatedBox>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 8 — BOTTOM DATA TICKER */}
        <div style={{
          position: "absolute", bottom: 20, left: 0, right: 0,
          height: 24, overflow: "hidden", opacity: tickerOpacity,
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, whiteSpace: "nowrap",
            transform: `translateX(${tickerScroll}px)`,
            fontFamily: fonts.mono, fontSize: 12, color: colors.oasis,
            letterSpacing: 2, lineHeight: "24px",
          }}>
            {tickerText}{tickerText}
          </div>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, ${colors.midnight}, transparent 15%, transparent 85%, ${colors.midnight})`,
            pointerEvents: "none",
          }} />
        </div>

      </div>
    </SceneShell>
  );
};
