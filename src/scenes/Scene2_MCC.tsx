import React, { useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { NodeNetwork } from "../three/NodeNetwork";
import { CameraRig } from "../three/CameraRig";
import { colors, fonts } from "../theme";

/* ── PHASE TIMING (30fps) ──────────────────────────────────────────────
   P1   f 65–192   Manual burden — icon stacks pile up
   SCAN f182–228   Scan-line transformation
   P2   f226–340   Category icons overview
   P3   f334–480   Library browse — icon columns + card selection
   P4   f472–578   Template selection — 6 section icons check in
   P5   f570–775   AI generation — 4 sequential icon panels
   P6   f765–810   Case finalized — 2×2 grid + green check
   ─────────────────────────────────────────────────────────────────── */
const P1S = 65,  P1E = 192;
const P2S = 226, P2E = 340;
const P3S = 334, P3E = 480;
const P4S = 472, P4E = 578;
const P5S = 570, P5E = 775;
const P6S = 765, P6E = 810;

const CE   = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eIO  = Easing.inOut(Easing.cubic);
const eOut = Easing.out(Easing.cubic);

/* ════════════════════════════════════════════════════════════════════
   ICONS — thick strokes, strong fill opacity, readable at distance
   All primary outlines: strokeWidth 3.5+
   All secondary lines:  strokeWidth 2.5–3
   Fill opacities doubled vs. previous for contrast on dark backgrounds
   ════════════════════════════════════════════════════════════════════ */
const IDoc: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={10} y={6} width={36} height={48} rx={4} stroke={c} strokeWidth={3.5} />
    <path d="M 36 6 L 46 16 L 36 16 Z" fill={c} fillOpacity={0.50} stroke={c} strokeWidth={2.5} strokeLinejoin="round" />
    <rect x={16} y={24} width={22} height={5} rx={2.5} fill={c} opacity={0.72} />
    <rect x={16} y={32} width={17} height={5} rx={2.5} fill={c} opacity={0.58} />
    <rect x={16} y={40} width={20} height={5} rx={2.5} fill={c} opacity={0.52} />
    <rect x={16} y={48} width={14} height={5} rx={2.5} fill={c} opacity={0.42} />
  </svg>
);

const IFlask: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <path d="M 24 8 L 24 28 L 12 50 Q 10 56 20 56 L 44 56 Q 54 56 52 50 L 40 28 L 40 8 Z"
      stroke={c} strokeWidth={3.5} strokeLinejoin="round" fill={c} fillOpacity={0.18} />
    <line x1={20} y1={8} x2={44} y2={8} stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <line x1={15} y1={44} x2={49} y2={44} stroke={c} strokeWidth={2.5} strokeLinecap="round" opacity={0.65} />
    <circle cx={30} cy={49} r={4} fill={c} opacity={0.82} />
    <circle cx={39} cy={46} r={3} fill={c} opacity={0.58} />
  </svg>
);

const IPill: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={8} y={22} width={48} height={20} rx={10} stroke={c} strokeWidth={3.5} />
    <line x1={32} y1={22} x2={32} y2={42} stroke={c} strokeWidth={3} opacity={0.78} />
    <rect x={8} y={22} width={24} height={20} rx={10} fill={c} opacity={0.32} />
  </svg>
);

const IArrows: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={16} cy={32} r={10} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.20} />
    <circle cx={48} cy={32} r={10} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.20} />
    <path d="M 26 32 L 38 32 M 34 27 L 39 32 L 34 37"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IClip: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={10} y={12} width={44} height={48} rx={4} stroke={c} strokeWidth={3.5} />
    <rect x={22} y={8} width={20} height={10} rx={5} stroke={c} strokeWidth={3} />
    <rect x={18} y={26} width={28} height={5} rx={2.5} fill={c} opacity={0.68} />
    <rect x={18} y={34} width={22} height={5} rx={2.5} fill={c} opacity={0.58} />
    <rect x={18} y={42} width={24} height={5} rx={2.5} fill={c} opacity={0.52} />
    <rect x={18} y={50} width={16} height={5} rx={2.5} fill={c} opacity={0.42} />
  </svg>
);

const ILungs: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <line x1={32} y1={10} x2={32} y2={22} stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 32 22 Q 20 22 14 30 Q 8 38 10 48 Q 12 56 22 54 Q 28 52 28 46 L 28 26 Q 28 22 32 22"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" fill={c} fillOpacity={0.22} />
    <path d="M 32 22 Q 44 22 50 30 Q 56 38 54 48 Q 52 56 42 54 Q 36 52 36 46 L 36 26 Q 36 22 32 22"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" fill={c} fillOpacity={0.22} />
  </svg>
);

const IHeart: React.FC<{ c: string; s?: number; pulse?: number }> = ({ c, s = 64, pulse = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <path d="M 32 52 Q 8 36 8 22 Q 8 10 20 10 Q 28 10 32 20 Q 36 10 44 10 Q 56 10 56 22 Q 56 36 32 52 Z"
      stroke={c} strokeWidth={3.5} fill={c} fillOpacity={0.24} />
    <path d={`M 14 32 L 20 ${28 - pulse * 4} L 26 ${36 + pulse * 5} L 32 ${20 - pulse * 6} L 38 ${40 + pulse * 5} L 44 ${28 - pulse * 3} L 50 32`}
      stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.88} />
  </svg>
);

const IMol: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={32} cy={32} r={7} stroke={c} strokeWidth={3.5} fill={c} fillOpacity={0.38} />
    <circle cx={14} cy={18} r={5} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.30} />
    <circle cx={50} cy={18} r={5} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.30} />
    <circle cx={14} cy={46} r={5} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.30} />
    <circle cx={50} cy={46} r={5} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.30} />
    <line x1={27} y1={27} x2={19} y2={23} stroke={c} strokeWidth={2.5} />
    <line x1={37} y1={27} x2={45} y2={23} stroke={c} strokeWidth={2.5} />
    <line x1={27} y1={37} x2={19} y2={41} stroke={c} strokeWidth={2.5} />
    <line x1={37} y1={37} x2={45} y2={41} stroke={c} strokeWidth={2.5} />
  </svg>
);

const IPerson: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={32} cy={18} r={10} stroke={c} strokeWidth={3.5} fill={c} fillOpacity={0.28} />
    <path d="M 12 56 Q 14 36 32 36 Q 50 36 52 56"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" />
  </svg>
);

const IScope: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={44} cy={44} r={10} stroke={c} strokeWidth={3.5} fill={c} fillOpacity={0.22} />
    <line x1={16} y1={12} x2={28} y2={12} stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 16 12 L 16 32 Q 16 46 32 46 L 34 46"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 28 12 L 28 32 Q 28 46 32 46"
      stroke={c} strokeWidth={3.5} strokeLinecap="round" />
  </svg>
);

const IScan: React.FC<{ c: string; s?: number; prog?: number }> = ({ c, s = 64, prog = 0.5 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={8} y={8} width={48} height={48} rx={6} stroke={c} strokeWidth={2.5} opacity={0.58} />
    <path d="M 8 20 L 8 8 L 20 8"  stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 44 8 L 56 8 L 56 20" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 8 44 L 8 56 L 20 56" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <path d="M 44 56 L 56 56 L 56 44" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
    <line x1={8} y1={8 + prog * 48} x2={56} y2={8 + prog * 48}
      stroke={c} strokeWidth={2.5} opacity={0.95} />
    <rect x={16} y={20} width={32} height={5} rx={2.5} fill={c} opacity={0.30} />
    <rect x={16} y={29} width={24} height={4} rx={2} fill={c} opacity={0.22} />
    <rect x={16} y={37} width={28} height={4} rx={2} fill={c} opacity={0.22} />
  </svg>
);

/* ICheck — viewBox 40×40 for larger geometry at any render size */
const ICheck: React.FC<{ c: string; s?: number }> = ({ c, s = 40 }) => (
  <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
    <circle cx={20} cy={20} r={18} stroke={c} strokeWidth={3} fill={c} fillOpacity={0.24} />
    <path d="M 10 20 L 16 26 L 30 12"
      stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function renderIcon(name: string, color: string, size = 64): React.ReactNode {
  switch (name) {
    case "doc":    return <IDoc    c={color} s={size} />;
    case "flask":  return <IFlask  c={color} s={size} />;
    case "pill":   return <IPill   c={color} s={size} />;
    case "arrows": return <IArrows c={color} s={size} />;
    case "clip":   return <IClip   c={color} s={size} />;
    case "lungs":  return <ILungs  c={color} s={size} />;
    case "heart":  return <IHeart  c={color} s={size} />;
    case "mol":    return <IMol    c={color} s={size} />;
    case "person": return <IPerson c={color} s={size} />;
    case "scope":  return <IScope  c={color} s={size} />;
    case "scan":   return <IScan   c={color} s={size} />;
    default:       return null;
  }
}

/* ── STATIC DATA ────────────────────────────────────────────────── */
/*
 * Beat 1 card grid — verified non-overlapping for 1920×1080:
 *   TL/TR face:   x 80–260 / 1640–1820,  y 100–280
 *   Center face:  x 760–1140,             y 300–680
 *   BL/BR face:   x 80–260 / 1640–1820,  y 700–880
 *   "Manual" text: y ≈ 948–1020  (below all cards, above bottom edge)
 *   x-separation between corners and center: 500px — zero chance of overlap
 *   No card rotation — all elements axis-aligned for professional readability
 */
const STACKS = [
  { icon: "doc",    color: colors.azurite,      left:   80, top: 100, w: 200, h: 200, si: 0 },
  { icon: "flask",  color: "#16a34a",             left: 1640, top: 100, w: 200, h: 200, si: 2 },
  { icon: "pill",   color: colors.vitalsWarning,  left:   80, top: 700, w: 200, h: 200, si: 3 },
  { icon: "arrows", color: "#06b6d4",              left: 1640, top: 700, w: 200, h: 200, si: 4 },
  { icon: "clip",   color: colors.arizonaRed,     left:  760, top: 300, w: 400, h: 400, si: 1 },
] as const;

const CAT_ICONS = [
  { icon: "lungs", color: colors.oasis },
  { icon: "heart", color: colors.arizonaRed },
  { icon: "mol",   color: "#16a34a" },
] as const;

const SECT_ICONS = [
  { icon: "person", color: colors.oasis },
  { icon: "heart",  color: colors.vitalsWarning },
  { icon: "scope",  color: "#06b6d4" },
  { icon: "scope",  color: colors.azurite },
  { icon: "flask",  color: "#16a34a" },
  { icon: "clip",   color: colors.arizonaRed },
] as const;

const AI_PANELS = [
  { icon: "person", color: colors.oasis },
  { icon: "heart",  color: colors.vitalsWarning },
  { icon: "lungs",  color: colors.azurite },
  { icon: "scan",   color: "#06b6d4" },
] as const;

const SEC_WINDOWS = [
  [574, 638],
  [630, 698],
  [690, 742],
  [735, 775],
] as const;

const B3_CARDS = [3, 3, 2] as const;

/* ── NEURAL NETWORK ─────────────────────────────────────────────── */
function buildNodes() {
  const n: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < 8;  i++) n.push({ x: -2, y: -1.75 + i * 0.5, z: -1 });
  for (let i = 0; i < 14; i++) n.push({ x:  0, y: -1.75 + i * (3.5 / 13), z: -1 });
  for (let i = 0; i < 8;  i++) n.push({ x:  2, y: -1.75 + i * 0.5, z: -1 });
  return n;
}
function buildEdges(n: number): [number, number][] {
  const e: [number, number][] = [];
  const ie = 8, he = 22;
  for (let i = 0; i < ie; i++) for (let j = ie; j < he; j += 2) e.push([i, j]);
  for (let i = ie; i < he; i++) for (let j = he; j < n;  j += 2) e.push([i, j]);
  return e;
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export const Scene2_MCC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const netNodes = useMemo(() => buildNodes(), []);
  const netEdges = useMemo(() => buildEdges(netNodes.length), [netNodes.length]);

  /* ── Beat 1 springs ── */
  const DELAYS = [68, 80, 92, 104, 116] as const;
  const springs = DELAYS.map(d =>
    spring({ frame: frame - d, fps, config: { damping: 22, stiffness: 88, mass: 1.0 } })
  );
  const exitOp    = interpolate(frame, [184, 244], [1, 0], { ...CE, easing: Easing.in(Easing.ease) });
  const exitScale = interpolate(frame, [184, 244], [1, 0.88], CE);

  /* ── Scan line ── */
  const scanProg = interpolate(frame, [182, 226], [0, 1], CE);
  const scanOp   = interpolate(frame, [180, 186, 221, 228], [0, 1, 1, 0], CE);

  /* ── Phase helpers ── */
  const phOp   = (s: number, e: number) => interpolate(frame, [s, s + 18, e - 16, e], [0, 1, 1, 0], CE);
  const phZoom = (s: number) => interpolate(frame, [s, s + 28], [0.95, 1.0], { ...CE, easing: eIO });

  /* ── Beat 2 ── */
  const p2Op   = phOp(P2S, P2E);
  const p2Zoom = phZoom(P2S);
  const catOps = [0, 1, 2].map(i =>
    interpolate(frame, [P2S + 18 + i * 20, P2S + 36 + i * 20], [0, 1], CE)
  );

  /* ── Beat 3 ── */
  const p3Op   = phOp(P3S, P3E);
  const p3Zoom = phZoom(P3S);
  const cardOps = (B3_CARDS as readonly number[]).map((count, ci) =>
    Array.from({ length: count }, (_, ri) => {
      const st = P3S + 18 + ci * 28 + ri * 16;
      return interpolate(frame, [st, st + 16], [0, 1], CE);
    })
  );
  const selGlow = interpolate(frame, [P3S + 80, P3S + 105], [0, 1], CE);
  const checkOp = interpolate(frame, [P3S + 112, P3S + 130], [0, 1], CE);

  /* ── Beat 4 ── */
  const p4Op   = phOp(P4S, P4E);
  const p4Zoom = phZoom(P4S);
  const sectOps = Array.from({ length: 6 }, (_, i) => {
    const st = P4S + 14 + i * 13;
    return interpolate(frame, [st, st + 13], [0, 1], CE);
  });
  const sectChk = Array.from({ length: 6 }, (_, i) => {
    const st = P4S + 40 + i * 10;
    return interpolate(frame, [st, st + 10], [0, 1], CE);
  });
  const aiDotOp = interpolate(frame, [P4S + 80, P4S + 94], [0, 1], CE);

  /* ── Beat 5 ── */
  const secOps  = SEC_WINDOWS.map(([s, e]) =>
    interpolate(frame, [s, s + 16, e - 14, e], [0, 1, 1, 0], CE)
  );
  const secProg = SEC_WINDOWS.map(([s, e]) =>
    interpolate(frame, [s + 16, e - 10], [0, 1], CE)
  );
  const secDone = SEC_WINDOWS.map(([, e]) => frame >= e - 10);
  const netOp   = interpolate(frame, [P5S, P5S + 30, P5E - 20, P5E], [0, 0.28, 0.28, 0], CE);
  const pulse   = 0.5 + 0.5 * Math.sin(frame * 0.22);

  /* ── Beat 6 ── */
  const p6Op     = interpolate(frame, [P6S, P6S + 20, P6E], [0, 1, 1], CE);
  const p6Zoom   = phZoom(P6S);
  const bigChkOp = interpolate(frame, [P6S + 16, P6S + 36], [0, 1], { ...CE, easing: eOut });
  const bigChkSc = interpolate(frame, [P6S + 16, P6S + 36], [0.4, 1.0], { ...CE, easing: eOut });

  /* ── 3D background ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.06} />
      <ParticleField count={48} color={colors.oasis} speed={0.002} opacity={0.16} />
      {netOp > 0 && (
        <NodeNetwork
          nodes={netNodes} edges={netEdges}
          color={colors.oasis} nodeSize={0.04}
          edgeOpacity={netOp * 0.38} pulseSpeed={0.018}
          position={[0, 0, -2]} scale={0.9}
        />
      )}
      <GlowOrb position={[0, 0, -3]} color={colors.azurite} radius={3} baseOpacity={0.10} />
      <CameraRig positions={[
        { frame: 0,   position: [0, 0, 10] },
        { frame: 180, position: [0, 0, 9]  },
        { frame: 360, position: [0, 0, 8]  },
        { frame: 810, position: [0, 0, 8]  },
      ]} />
    </>
  );

  /* Reduced blur — heavy blur obscures contrast at presentation scale */
  const glass: React.CSSProperties = {
    background: "rgba(10, 28, 64, 0.90)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `2px solid ${colors.oasis}55`,
    borderRadius: 16,
  };

  return (
    <SceneShell
      interstitial={{ step: 1, title: "Author", subtitle: "Medical Case Creator" }}
      sectionLabel="Case Authoring — MCC"
      threeContent={threeContent}
    >

      {/* ════════════════════════════════════════════════════════════
          BEAT 1 — MANUAL BURDEN  (f65–192)
          5 icon stacks spring onto screen with depth layers.
          Icons scaled 2.2× (center) and 1.8× (corners) for dominance.
          "Manual" label: 60px, full-brightness white — legible far away.
         ════════════════════════════════════════════════════════════ */}
      {frame >= P1S && frame < 248 && STACKS.map((s, pi) => {
        const sp      = springs[s.si] ?? 0;
        const spOp    = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
        const spScale = interpolate(sp, [0, 1], [0.72, 1], { extrapolateRight: "clamp" as const });
        const spY     = interpolate(sp, [0, 1], [44, 0], { extrapolateRight: "clamp" as const });
        return (
          <div key={pi} style={{
            position: "absolute",
            left: s.left, top: s.top, width: s.w, height: s.h,
            zIndex: pi === 4 ? 8 : 4,
            pointerEvents: "none",
            transform: `scale(${spScale * exitScale}) translateY(${spY}px)`,
            opacity: spOp * exitOp,
            transformOrigin: "center center",
          }}>
            {/* Depth layers */}
            {([2, 1] as const).map(d => (
              <div key={d} style={{
                position: "absolute",
                transform: `translate(${d * 5}px, ${d * 5}px)`,
                width: s.w - 20, height: s.h - 20,
                borderRadius: 10,
                background: "rgba(249,247,242,0.95)",
                boxShadow: "0 8px 28px rgba(0,0,0,0.36)",
                border: `3px solid ${s.color}`,
                opacity: 0.55 - (d - 1) * 0.14,
              }} />
            ))}
            {/* Top face — icon scaled 2.2× center, 1.8× corners */}
            <div style={{
              position: "absolute",
              width: s.w - 20, height: s.h - 20,
              borderRadius: 10,
              background: "rgba(249,247,242,0.98)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.40)",
              border: `3px solid ${s.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 3,
            }}>
              <div style={{ transform: `scale(${pi === 4 ? 2.2 : 1.8})` }}>
                {renderIcon(s.icon, s.color, 64)}
              </div>
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 26, height: 26, borderRadius: "50%",
                background: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 10px ${s.color}AA`,
              }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "white" }} />
              </div>
            </div>
          </div>
        );
      })}

      {/* "Manual" label — 52px, bottom safe zone (y≈948+), clear of all cards */}
      {frame >= 104 && frame < 212 && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 48,
          opacity: interpolate(frame, [104, 124, 188, 212], [0, 1, 1, 0], CE),
          pointerEvents: "none", zIndex: 5,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 52, fontWeight: 800,
            color: `${colors.white}BB`, letterSpacing: 8, textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            Manual
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SCAN LINE  (f182–228)  — no text
         ════════════════════════════════════════════════════════════ */}
      {scanOp > 0 && (
        <>
          <div style={{
            position: "absolute", left: 0, right: 0,
            top: scanProg * 1080, height: 8,
            background: `linear-gradient(90deg, transparent, ${colors.oasis}55 8%, ${colors.oasis} 50%, ${colors.oasis}55 92%, transparent)`,
            boxShadow: `0 0 18px 4px ${colors.oasis}CC, 0 0 48px 10px ${colors.oasis}66`,
            opacity: scanOp, zIndex: 30, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", left: 0, right: 0, top: 0,
            height: scanProg * 1080,
            background: `
              repeating-linear-gradient(0deg,  transparent, transparent 39px, ${colors.oasis}09 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, ${colors.oasis}09 40px)`,
            opacity: scanOp * 0.7, zIndex: 20, pointerEvents: "none",
          }} />
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          BEAT 2 — CASE LIBRARY OVERVIEW  (f226–340)
          Three large category icons.
          Containers: 260×260. Icons: 148px. Label: 34px bold.
          Max text: "Case Library" — 2 words
         ════════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p2Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p2Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 34, letterSpacing: 8,
              color: colors.oasis, textTransform: "uppercase", fontWeight: 700,
              opacity: interpolate(frame, [P2S + 8, P2S + 24], [0, 1], CE),
            }}>
              Case Library
            </div>
            <div style={{ display: "flex", gap: 52, alignItems: "center" }}>
              {CAT_ICONS.map((cat, i) => (
                <div key={i} style={{
                  opacity: catOps[i],
                  transform: `scale(${interpolate(catOps[i], [0, 1], [0.65, 1])}) translateY(${interpolate(catOps[i], [0, 1], [24, 0])}px)`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
                }}>
                  <div style={{
                    width: 260, height: 260, borderRadius: 32,
                    background: `${cat.color}20`,
                    border: `3px solid ${cat.color}68`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 90px ${cat.color}32, 0 28px 64px rgba(0,0,0,0.44)`,
                  }}>
                    {renderIcon(cat.icon, cat.color, 148)}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[0, 1, 2].map(d => (
                      <div key={d} style={{
                        width: 12, height: 12, borderRadius: "50%",
                        background: cat.color, opacity: 0.42 + d * 0.22,
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          BEAT 3 — LIBRARY BROWSE  (f334–480)
          3 icon columns. Column headers: 260×140 containers, 88px icons.
          Cards: 110px tall. Line-stubs: 14px height — clearly visible.
          Selected card: strong glow + 48px checkmark.
         ════════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p3Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p3Zoom})`, display: "flex", gap: 26, alignItems: "flex-start" }}>
            {CAT_ICONS.map((cat, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 16, width: 260 }}>
                <div style={{
                  height: 140, borderRadius: 22,
                  background: `${cat.color}20`,
                  border: `3px solid ${cat.color}58`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 40px ${cat.color}22`,
                  opacity: interpolate(frame, [P3S + 8 + ci * 28, P3S + 24 + ci * 28], [0, 1], CE),
                }}>
                  {renderIcon(cat.icon, cat.color, 88)}
                </div>
                {Array.from({ length: B3_CARDS[ci] }, (_, ri) => {
                  const isSelected = ci === 0 && ri === 0;
                  const op   = cardOps[ci]?.[ri] ?? 0;
                  const glow = isSelected ? selGlow : 0;
                  return (
                    <div key={ri} style={{
                      height: 110, borderRadius: 16, opacity: op,
                      background: isSelected
                        ? `${cat.color}${Math.round(22 + glow * 22).toString(16).padStart(2, "0")}`
                        : `${colors.white}09`,
                      border: isSelected
                        ? `3px solid ${cat.color}${Math.round(70 + glow * 50).toString(16).padStart(2, "0")}`
                        : `2px solid ${colors.white}1A`,
                      boxShadow: isSelected ? `0 0 ${30 + glow * 40}px ${cat.color}38` : "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0 28px",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ width: 130, height: 14, borderRadius: 7, background: isSelected ? cat.color : `${colors.white}28`, opacity: 0.82 }} />
                        <div style={{ width: 90,  height: 14, borderRadius: 7, background: isSelected ? cat.color : `${colors.white}1A`, opacity: 0.62 }} />
                      </div>
                      {isSelected && checkOp > 0.02 && (
                        <div style={{ opacity: checkOp }}>
                          <ICheck c={cat.color} s={48} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          BEAT 4 — TEMPLATE SELECTION  (f472–578)
          Panel: 880px wide. Title: 40px. Header icon: 52px.
          Section cells: 68px icons + 40px checks in 3×2 grid.
          "AI Generating" badge: 30px mono text.
         ════════════════════════════════════════════════════════════ */}
      {p4Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p4Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p4Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 880,
              ...glass,
              border: `3px solid ${colors.oasis}68`,
              padding: "26px 36px",
              boxShadow: `0 0 110px ${colors.oasis}22, 0 36px 88px rgba(0,0,0,0.54)`,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 20,
                marginBottom: 22, paddingBottom: 16,
                borderBottom: `1.5px solid ${colors.oasis}30`,
              }}>
                <div style={{ width: 14, height: 54, borderRadius: 7, background: colors.oasis, opacity: 0.92 }} />
                <div style={{ fontFamily: fonts.heading, fontSize: 40, fontWeight: 800, color: colors.white }}>
                  Template Selected
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <ILungs c={colors.oasis} s={52} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
                {SECT_ICONS.map((s, i) => (
                  <div key={i} style={{
                    opacity: sectOps[i],
                    transform: `translateY(${interpolate(sectOps[i], [0, 1], [14, 0])}px)`,
                    padding: "22px 20px",
                    borderRadius: 14,
                    background: `${s.color}16`,
                    border: `2.5px solid ${s.color}${sectChk[i] > 0.5 ? "68" : "38"}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxShadow: sectChk[i] > 0.5 ? `0 0 28px ${s.color}22` : "none",
                  }}>
                    {renderIcon(s.icon, s.color, 68)}
                    <div style={{ opacity: sectChk[i] }}>
                      <ICheck c={s.color} s={40} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {aiDotOp > 0.01 && (
              <div style={{
                opacity: aiDotOp,
                display: "flex", alignItems: "center", gap: 18,
                background: `${colors.oasis}18`,
                border: `2px solid ${colors.oasis}58`,
                borderRadius: 14, padding: "18px 40px",
                boxShadow: `0 0 56px ${colors.oasis}30`,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: colors.oasis,
                  boxShadow: `0 0 18px ${colors.oasis}`,
                  opacity: 0.68 + 0.32 * pulse,
                }} />
                <span style={{
                  fontFamily: fonts.mono, fontSize: 30, fontWeight: 700,
                  color: colors.oasis, letterSpacing: 4, textTransform: "uppercase",
                }}>
                  AI Generating
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          BEAT 5 — AI GENERATION  (f570–775)
          4 sequential panels. Icon containers: 260×260, icons: 128px.
          Progress dots: 60px wide (active), 32px (inactive), 20px tall.
          Status text: 28px mono. Data bars: 20px tall. 
         ════════════════════════════════════════════════════════════ */}
      {frame >= P5S && frame < P5E + 10 && AI_PANELS.map((panel, si) => {
        const op   = secOps[si];
        if (op < 0.02) return null;
        const prog = secProg[si];
        const done = secDone[si];
        return (
          <div key={si} style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px 40px 16px",
            opacity: op, pointerEvents: "none", zIndex: 12 + si,
          }}>
            <div style={{ width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Progress dots — no text */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                {AI_PANELS.map((_, di) => (
                  <div key={di} style={{
                    width: di === si ? 60 : 32, height: 20, borderRadius: 10,
                    background: secDone[di]
                      ? colors.vitalsNormal
                      : di === si ? panel.color : `${colors.white}20`,
                    boxShadow: di === si ? `0 0 20px ${panel.color}80` : "none",
                  }} />
                ))}
              </div>

              {/* Panel */}
              <div style={{
                background: "rgba(6, 18, 48, 0.94)",
                backdropFilter: "blur(14px)",
                borderRadius: 26,
                border: `3px solid ${panel.color}${done ? "85" : "60"}`,
                padding: "36px 48px",
                display: "flex", alignItems: "center", gap: 48,
                minHeight: 270,
                boxShadow: `0 0 ${done ? 80 : 36 + pulse * 20}px ${panel.color}${done ? "2A" : "18"}, 0 32px 80px rgba(0,0,0,0.50)`,
              }}>
                {/* Icon — 260×260 container, 128px render size */}
                <div style={{
                  width: 260, height: 260, flexShrink: 0, borderRadius: 32,
                  background: `${panel.color}1A`,
                  border: `3px solid ${panel.color}${done ? "85" : "55"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: done
                    ? `0 0 70px ${panel.color}45`
                    : `0 0 ${22 + pulse * 24}px ${panel.color}28`,
                }}>
                  {panel.icon === "heart"
                    ? <IHeart c={panel.color} s={128} pulse={done ? 0 : pulse * 0.6} />
                    : panel.icon === "scan"
                      ? <IScan c={panel.color} s={128} prog={prog} />
                      : renderIcon(panel.icon, panel.color, 128)}
                </div>

                {/* Data bars */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                    {done
                      ? <ICheck c={colors.vitalsNormal} s={36} />
                      : <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: panel.color,
                          boxShadow: `0 0 ${10 + pulse * 14}px ${panel.color}`,
                          opacity: 0.68 + 0.32 * pulse,
                        }} />}
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 28, fontWeight: 700,
                      color: done ? colors.vitalsNormal : panel.color,
                      letterSpacing: 3, textTransform: "uppercase",
                    }}>
                      {done ? "Complete" : "AI Generating"}
                    </span>
                  </div>
                  {[0, 1, 2].map(ni => {
                    const barP = interpolate(prog, [ni * 0.26, ni * 0.26 + 0.38], [0, 1], { ...CE, easing: eOut });
                    return (
                      <div key={ni} style={{ display: "flex", alignItems: "center", gap: 16, opacity: barP }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                          background: panel.color, opacity: 0.78,
                          boxShadow: `0 0 12px ${panel.color}72`,
                        }} />
                        <div style={{ flex: 1, height: 20, borderRadius: 10, background: `${panel.color}22` }}>
                          <div style={{
                            height: "100%", borderRadius: 10,
                            background: `linear-gradient(90deg, ${panel.color}, ${panel.color}66)`,
                            width: `${(40 + ni * 22) * barP}%`,
                            boxShadow: `0 0 14px ${panel.color}72`,
                          }} />
                        </div>
                        {barP > 0.88 && (
                          <div style={{ opacity: (barP - 0.88) / 0.12 }}>
                            <ICheck c={panel.color} s={30} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ════════════════════════════════════════════════════════════
          BEAT 6 — CASE FINALIZED  (f765–810)
          maxWidth 1000px. 2×2 grid: 130×130 icon containers, 80px icons.
          Line stubs: 14px height. Card checks: 48px. 
          "Case Ready" badge: 56px heading + 60px check.
         ════════════════════════════════════════════════════════════ */}
      {p6Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 40px 16px",
          opacity: p6Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p6Zoom})`, width: "100%", maxWidth: 1000, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, height: 420 }}>
              {AI_PANELS.map((panel, ci) => {
                const cOp = interpolate(frame, [P6S + 8 + ci * 9, P6S + 24 + ci * 9], [0, 1], CE);
                return (
                  <div key={ci} style={{
                    ...glass,
                    border: `2.5px solid ${panel.color}55`,
                    opacity: cOp,
                    transform: `translateY(${interpolate(cOp, [0, 1], [12, 0])}px)`,
                    display: "flex", alignItems: "center", gap: 28, padding: "28px 32px",
                    boxShadow: `0 0 48px ${panel.color}1A`,
                  }}>
                    <div style={{
                      width: 130, height: 130, borderRadius: 22, flexShrink: 0,
                      background: `${panel.color}18`,
                      border: `2.5px solid ${panel.color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {renderIcon(panel.icon, panel.color, 80)}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                      {[0.72, 0.50, 0.32].map((op, li) => (
                        <div key={li} style={{
                          height: 14, borderRadius: 7,
                          background: panel.color,
                          width: `${70 - li * 20}%`,
                          opacity: op,
                        }} />
                      ))}
                    </div>
                    <div style={{ opacity: bigChkOp * 0.92 }}>
                      <ICheck c={colors.vitalsNormal} s={48} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: bigChkOp,
              transform: `scale(${bigChkSc})`,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 22,
                background: `${colors.vitalsNormal}16`,
                border: `3px solid ${colors.vitalsNormal}78`,
                borderRadius: 22, padding: "28px 64px",
                boxShadow: `0 0 100px ${colors.vitalsNormal}38`,
              }}>
                <ICheck c={colors.vitalsNormal} s={60} />
                <div style={{
                  fontFamily: fonts.heading, fontSize: 56, fontWeight: 800,
                  color: colors.vitalsNormal, letterSpacing: 3,
                }}>
                  Case Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </SceneShell>
  );
};
