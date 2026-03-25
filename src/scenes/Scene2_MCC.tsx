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
   ICONS
   ════════════════════════════════════════════════════════════════════ */
const IDoc: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={10} y={6} width={36} height={48} rx={4} stroke={c} strokeWidth={2.5} />
    <path d="M 36 6 L 46 16 L 36 16 Z" fill={c} fillOpacity={0.25} stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
    <rect x={16} y={24} width={22} height={3} rx={1.5} fill={c} opacity={0.45} />
    <rect x={16} y={31} width={17} height={3} rx={1.5} fill={c} opacity={0.35} />
    <rect x={16} y={38} width={20} height={3} rx={1.5} fill={c} opacity={0.35} />
    <rect x={16} y={45} width={14} height={3} rx={1.5} fill={c} opacity={0.25} />
  </svg>
);
const IFlask: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <path d="M 24 8 L 24 28 L 12 50 Q 10 56 20 56 L 44 56 Q 54 56 52 50 L 40 28 L 40 8 Z"
      stroke={c} strokeWidth={2.5} strokeLinejoin="round" />
    <line x1={20} y1={8} x2={44} y2={8} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={15} y1={44} x2={49} y2={44} stroke={c} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
    <circle cx={30} cy={49} r={3} fill={c} opacity={0.55} />
    <circle cx={39} cy={46} r={2} fill={c} opacity={0.35} />
  </svg>
);
const IPill: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={8} y={22} width={48} height={20} rx={10} stroke={c} strokeWidth={2.5} />
    <line x1={32} y1={22} x2={32} y2={42} stroke={c} strokeWidth={2} opacity={0.6} />
    <rect x={8} y={22} width={24} height={20} rx={10} fill={c} opacity={0.18} />
  </svg>
);
const IArrows: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={16} cy={32} r={10} stroke={c} strokeWidth={2} />
    <circle cx={48} cy={32} r={10} stroke={c} strokeWidth={2} />
    <path d="M 26 32 L 38 32 M 34 27 L 39 32 L 34 37"
      stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IClip: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={10} y={12} width={44} height={48} rx={4} stroke={c} strokeWidth={2.5} />
    <rect x={22} y={8} width={20} height={10} rx={5} stroke={c} strokeWidth={2} />
    <rect x={18} y={26} width={28} height={3} rx={1.5} fill={c} opacity={0.45} />
    <rect x={18} y={33} width={22} height={3} rx={1.5} fill={c} opacity={0.40} />
    <rect x={18} y={40} width={24} height={3} rx={1.5} fill={c} opacity={0.35} />
    <rect x={18} y={47} width={16} height={3} rx={1.5} fill={c} opacity={0.25} />
  </svg>
);
const ILungs: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <line x1={32} y1={10} x2={32} y2={22} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 32 22 Q 20 22 14 30 Q 8 38 10 48 Q 12 56 22 54 Q 28 52 28 46 L 28 26 Q 28 22 32 22"
      stroke={c} strokeWidth={2.2} strokeLinecap="round" fill={c} fillOpacity={0.08} />
    <path d="M 32 22 Q 44 22 50 30 Q 56 38 54 48 Q 52 56 42 54 Q 36 52 36 46 L 36 26 Q 36 22 32 22"
      stroke={c} strokeWidth={2.2} strokeLinecap="round" fill={c} fillOpacity={0.08} />
  </svg>
);
const IHeart: React.FC<{ c: string; s?: number; pulse?: number }> = ({ c, s = 64, pulse = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <path d="M 32 52 Q 8 36 8 22 Q 8 10 20 10 Q 28 10 32 20 Q 36 10 44 10 Q 56 10 56 22 Q 56 36 32 52 Z"
      stroke={c} strokeWidth={2.5} fill={c} fillOpacity={0.12} />
    <path d={`M 14 32 L 20 ${28 - pulse * 4} L 26 ${36 + pulse * 5} L 32 ${20 - pulse * 6} L 38 ${40 + pulse * 5} L 44 ${28 - pulse * 3} L 50 32`}
      stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />
  </svg>
);
const IMol: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={32} cy={32} r={7} stroke={c} strokeWidth={2.2} fill={c} fillOpacity={0.2} />
    <circle cx={14} cy={18} r={5} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} />
    <circle cx={50} cy={18} r={5} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} />
    <circle cx={14} cy={46} r={5} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} />
    <circle cx={50} cy={46} r={5} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} />
    <line x1={27} y1={27} x2={19} y2={23} stroke={c} strokeWidth={1.5} />
    <line x1={37} y1={27} x2={45} y2={23} stroke={c} strokeWidth={1.5} />
    <line x1={27} y1={37} x2={19} y2={41} stroke={c} strokeWidth={1.5} />
    <line x1={37} y1={37} x2={45} y2={41} stroke={c} strokeWidth={1.5} />
  </svg>
);
const IPerson: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={32} cy={18} r={10} stroke={c} strokeWidth={2.5} fill={c} fillOpacity={0.12} />
    <path d="M 12 56 Q 14 36 32 36 Q 50 36 52 56"
      stroke={c} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);
const IScope: React.FC<{ c: string; s?: number }> = ({ c, s = 64 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <circle cx={44} cy={44} r={10} stroke={c} strokeWidth={2.5} fill={c} fillOpacity={0.1} />
    <line x1={16} y1={12} x2={28} y2={12} stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 16 12 L 16 32 Q 16 46 32 46 L 34 46"
      stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 28 12 L 28 32 Q 28 46 32 46"
      stroke={c} strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);
const IScan: React.FC<{ c: string; s?: number; prog?: number }> = ({ c, s = 64, prog = 0.5 }) => (
  <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
    <rect x={8} y={8} width={48} height={48} rx={6} stroke={c} strokeWidth={1.5} opacity={0.4} />
    <path d="M 8 20 L 8 8 L 20 8"  stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 44 8 L 56 8 L 56 20" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 8 44 L 8 56 L 20 56" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 44 56 L 56 56 L 56 44" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    <line x1={8} y1={8 + prog * 48} x2={56} y2={8 + prog * 48}
      stroke={c} strokeWidth={2} opacity={0.9} />
    <rect x={16} y={20} width={32} height={4} rx={2} fill={c} opacity={0.18} />
    <rect x={16} y={28} width={24} height={3} rx={1.5} fill={c} opacity={0.14} />
    <rect x={16} y={35} width={28} height={3} rx={1.5} fill={c} opacity={0.14} />
  </svg>
);
const ICheck: React.FC<{ c: string; s?: number }> = ({ c, s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
    <circle cx={16} cy={16} r={14} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.15} />
    <path d="M 8 16 L 13 21 L 24 10"
      stroke={c} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
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
const STACKS = [
  { icon: "doc",    color: colors.azurite,      left: 200,  top: 140, w: 190, h: 190, rot: -2.5, si: 0 },
  { icon: "flask",  color: "#16a34a",             left: 1530, top: 130, w: 190, h: 190, rot:  3.0, si: 2 },
  { icon: "pill",   color: colors.vitalsWarning,  left: 210,  top: 680, w: 170, h: 170, rot:  1.5, si: 3 },
  { icon: "arrows", color: "#06b6d4",              left: 1540, top: 690, w: 170, h: 170, rot: -2.0, si: 4 },
  { icon: "clip",   color: colors.arizonaRed,     left: 760,  top: 310, w: 400, h: 400, rot: -0.5, si: 1 },
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

  const glass: React.CSSProperties = {
    background: "rgba(10, 28, 64, 0.84)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${colors.oasis}28`,
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
          Max text on screen: "Manual" — 1 word
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
            transform: `rotate(${s.rot}deg) scale(${spScale * exitScale}) translateY(${spY}px)`,
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
            {/* Top face */}
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
              <div style={{ transform: `scale(${pi === 4 ? 1.8 : 1.4})` }}>
                {renderIcon(s.icon, s.color, 56)}
              </div>
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 22, height: 22, borderRadius: "50%",
                background: s.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 8px ${s.color}80`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "white" }} />
              </div>
            </div>
          </div>
        );
      })}

      {/* 1 word */}
      {frame >= 104 && frame < 212 && (
        <div style={{
          position: "absolute", left: "50%", bottom: 38, transform: "translateX(-50%)",
          opacity: interpolate(frame, [104, 124, 188, 212], [0, 1, 1, 0], CE),
          pointerEvents: "none", zIndex: 5, textAlign: "center",
        }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 40, fontWeight: 700,
            color: `${colors.white}55`, letterSpacing: 5, textTransform: "uppercase",
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
          BEAT 2 — INTERFACE OVERVIEW  (f226–340)
          Three large category icons reveal.
          Max text: "Case Library" — 2 words
         ════════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p2Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p2Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6,
              color: `${colors.oasis}75`, textTransform: "uppercase",
              opacity: interpolate(frame, [P2S + 8, P2S + 24], [0, 1], CE),
            }}>
              Case Library
            </div>
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {CAT_ICONS.map((cat, i) => (
                <div key={i} style={{
                  opacity: catOps[i],
                  transform: `scale(${interpolate(catOps[i], [0, 1], [0.65, 1])}) translateY(${interpolate(catOps[i], [0, 1], [24, 0])}px)`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
                }}>
                  <div style={{
                    width: 200, height: 200, borderRadius: 30,
                    background: `${cat.color}12`,
                    border: `3px solid ${cat.color}42`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 60px ${cat.color}22, 0 20px 50px rgba(0,0,0,0.35)`,
                  }}>
                    {renderIcon(cat.icon, cat.color, 104)}
                  </div>
                  <div style={{ display: "flex", gap: 7 }}>
                    {[0, 1, 2].map(d => (
                      <div key={d} style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: cat.color, opacity: 0.28 + d * 0.14,
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
          3 icon columns. Cards are line-stubs only.
          Selection: glow + checkmark. No text.
         ════════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p3Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p3Zoom})`, display: "flex", gap: 20, alignItems: "flex-start" }}>
            {CAT_ICONS.map((cat, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 14, width: 210 }}>
                <div style={{
                  height: 100, borderRadius: 18,
                  background: `${cat.color}12`,
                  border: `2.5px solid ${cat.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 24px ${cat.color}14`,
                  opacity: interpolate(frame, [P3S + 8 + ci * 28, P3S + 24 + ci * 28], [0, 1], CE),
                }}>
                  {renderIcon(cat.icon, cat.color, 56)}
                </div>
                {Array.from({ length: B3_CARDS[ci] }, (_, ri) => {
                  const isSelected = ci === 0 && ri === 0;
                  const op   = cardOps[ci]?.[ri] ?? 0;
                  const glow = isSelected ? selGlow : 0;
                  return (
                    <div key={ri} style={{
                      height: 80, borderRadius: 14, opacity: op,
                      background: isSelected
                        ? `${cat.color}${Math.round(14 + glow * 16).toString(16).padStart(2, "0")}`
                        : `${colors.white}07`,
                      border: isSelected
                        ? `2.5px solid ${cat.color}${Math.round(48 + glow * 40).toString(16).padStart(2, "0")}`
                        : `1.5px solid ${colors.white}14`,
                      boxShadow: isSelected ? `0 0 ${24 + glow * 28}px ${cat.color}30` : "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0 22px",
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ width: 100, height: 10, borderRadius: 5, background: isSelected ? cat.color : `${colors.white}20`, opacity: 0.75 }} />
                        <div style={{ width: 70, height: 10, borderRadius: 5, background: isSelected ? cat.color : `${colors.white}14`, opacity: 0.55 }} />
                      </div>
                      {isSelected && checkOp > 0.02 && (
                        <div style={{ opacity: checkOp }}>
                          <ICheck c={cat.color} s={34} />
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
          6 section icons check in. Max text: "Template Selected"
          then "AI Generating" — never more than 2 words at once
         ════════════════════════════════════════════════════════════ */}
      {p4Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: p4Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p4Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 700,
              ...glass,
              border: `2.5px solid ${colors.oasis}55`,
              padding: "20px 32px",
              boxShadow: `0 0 80px ${colors.oasis}18, 0 28px 72px rgba(0,0,0,0.48)`,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 16,
                marginBottom: 14, paddingBottom: 12,
                borderBottom: `1px solid ${colors.oasis}20`,
              }}>
                <div style={{ width: 10, height: 38, borderRadius: 5, background: colors.oasis, opacity: 0.8 }} />
                <div style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 700, color: colors.white }}>
                  Template Selected
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <ILungs c={colors.oasis} s={28} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
                {SECT_ICONS.map((s, i) => (
                  <div key={i} style={{
                    opacity: sectOps[i],
                    transform: `translateY(${interpolate(sectOps[i], [0, 1], [14, 0])}px)`,
                    padding: "18px 14px",
                    borderRadius: 12,
                    background: `${s.color}0e`,
                    border: `2px solid ${s.color}${sectChk[i] > 0.5 ? "55" : "28"}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    boxShadow: sectChk[i] > 0.5 ? `0 0 16px ${s.color}16` : "none",
                  }}>
                    {renderIcon(s.icon, s.color, 44)}
                    <div style={{ opacity: sectChk[i] }}>
                      <ICheck c={s.color} s={26} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {aiDotOp > 0.01 && (
              <div style={{
                opacity: aiDotOp,
                display: "flex", alignItems: "center", gap: 14,
                background: `${colors.oasis}12`,
                border: `1px solid ${colors.oasis}40`,
                borderRadius: 12, padding: "14px 28px",
                boxShadow: `0 0 32px ${colors.oasis}20`,
              }}>
                <div style={{
                  width: 11, height: 11, borderRadius: "50%",
                  background: colors.oasis,
                  boxShadow: `0 0 12px ${colors.oasis}`,
                  opacity: 0.68 + 0.32 * pulse,
                }} />
                <span style={{
                  fontFamily: fonts.mono, fontSize: 22, fontWeight: 700,
                  color: colors.oasis, letterSpacing: 3, textTransform: "uppercase",
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
          4 sequential icon + data-bar panels. Progress dots only.
          Max text per panel: "AI Generating" or "Complete" — 2 words
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
            <div style={{ width: "100%", maxWidth: 820, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Progress dots — no text */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                {AI_PANELS.map((_, di) => (
                  <div key={di} style={{
                    width: di === si ? 44 : 22, height: 16, borderRadius: 8,
                    background: secDone[di]
                      ? colors.vitalsNormal
                      : di === si ? panel.color : `${colors.white}18`,
                    boxShadow: di === si ? `0 0 14px ${panel.color}65` : "none",
                  }} />
                ))}
              </div>

              {/* Panel */}
              <div style={{
                background: "rgba(6, 18, 48, 0.92)",
                backdropFilter: "blur(20px)",
                borderRadius: 22,
                border: `2.5px solid ${panel.color}${done ? "70" : "50"}`,
                padding: "28px 40px",
                display: "flex", alignItems: "center", gap: 36,
                minHeight: 200,
                boxShadow: `0 0 ${done ? 60 : 28 + pulse * 14}px ${panel.color}${done ? "22" : "12"}, 0 24px 64px rgba(0,0,0,0.44)`,
              }}>
                {/* Icon */}
                <div style={{
                  width: 200, height: 200, flexShrink: 0, borderRadius: 30,
                  background: `${panel.color}12`,
                  border: `3px solid ${panel.color}${done ? "72" : "42"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: done
                    ? `0 0 48px ${panel.color}35`
                    : `0 0 ${16 + pulse * 16}px ${panel.color}18`,
                }}>
                  {panel.icon === "heart"
                    ? <IHeart c={panel.color} s={88} pulse={done ? 0 : pulse * 0.6} />
                    : panel.icon === "scan"
                      ? <IScan c={panel.color} s={88} prog={prog} />
                      : renderIcon(panel.icon, panel.color, 88)}
                </div>

                {/* Data bars */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    {done
                      ? <ICheck c={colors.vitalsNormal} s={28} />
                      : <div style={{
                          width: 12, height: 12, borderRadius: "50%",
                          background: panel.color,
                          boxShadow: `0 0 ${8 + pulse * 10}px ${panel.color}`,
                          opacity: 0.68 + 0.32 * pulse,
                        }} />}
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 20, fontWeight: 700,
                      color: done ? colors.vitalsNormal : panel.color,
                      letterSpacing: 2.5, textTransform: "uppercase",
                    }}>
                      {done ? "Complete" : "AI Generating"}
                    </span>
                  </div>
                  {[0, 1, 2].map(ni => {
                    const barP = interpolate(prog, [ni * 0.26, ni * 0.26 + 0.38], [0, 1], { ...CE, easing: eOut });
                    return (
                      <div key={ni} style={{ display: "flex", alignItems: "center", gap: 14, opacity: barP }}>
                        <div style={{
                          width: 13, height: 13, borderRadius: "50%", flexShrink: 0,
                          background: panel.color, opacity: 0.65,
                          boxShadow: `0 0 8px ${panel.color}60`,
                        }} />
                        <div style={{ flex: 1, height: 14, borderRadius: 7, background: `${panel.color}16` }}>
                          <div style={{
                            height: "100%", borderRadius: 7,
                            background: `linear-gradient(90deg, ${panel.color}, ${panel.color}55)`,
                            width: `${(40 + ni * 22) * barP}%`,
                            boxShadow: `0 0 10px ${panel.color}60`,
                          }} />
                        </div>
                        {barP > 0.88 && (
                          <div style={{ opacity: (barP - 0.88) / 0.12 }}>
                            <ICheck c={panel.color} s={20} />
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
          2×2 icon grid + "Case Ready" badge — 2 words total
         ════════════════════════════════════════════════════════════ */}
      {p6Op > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 40px 16px",
          opacity: p6Op, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{ transform: `scale(${p6Zoom})`, width: "100%", maxWidth: 920, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, height: 360 }}>
              {AI_PANELS.map((panel, ci) => {
                const cOp = interpolate(frame, [P6S + 8 + ci * 9, P6S + 24 + ci * 9], [0, 1], CE);
                return (
                  <div key={ci} style={{
                    ...glass,
                    border: `1px solid ${panel.color}38`,
                    opacity: cOp,
                    transform: `translateY(${interpolate(cOp, [0, 1], [12, 0])}px)`,
                    display: "flex", alignItems: "center", gap: 24, padding: "24px 28px",
                    boxShadow: `0 0 28px ${panel.color}12`,
                  }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: 16, flexShrink: 0,
                      background: `${panel.color}10`,
                      border: `1.5px solid ${panel.color}38`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {renderIcon(panel.icon, panel.color, 42)}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                      {[0.65, 0.42, 0.26].map((op, li) => (
                        <div key={li} style={{
                          height: 8, borderRadius: 4,
                          background: panel.color,
                          width: `${70 - li * 20}%`,
                          opacity: op,
                        }} />
                      ))}
                    </div>
                    <div style={{ opacity: bigChkOp * 0.9 }}>
                      <ICheck c={colors.vitalsNormal} s={30} />
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
                display: "flex", alignItems: "center", gap: 16,
                background: `${colors.vitalsNormal}10`,
                    border: `2.5px solid ${colors.vitalsNormal}65`,
                    borderRadius: 18, padding: "22px 44px",
                    boxShadow: `0 0 72px ${colors.vitalsNormal}30`,
              }}>
                <ICheck c={colors.vitalsNormal} s={38} />
                <div style={{
                  fontFamily: fonts.heading, fontSize: 38, fontWeight: 800,
                  color: colors.vitalsNormal, letterSpacing: 2,
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
