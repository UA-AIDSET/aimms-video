import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { DataStream } from "../three/DataStream";
import { OrbitRing } from "../three/OrbitRing";
import { CameraRig } from "../three/CameraRig";

/* ── PHASE TIMING (30fps · ~23.8s) ────────────────────────────────
   P1  f 65–185  Transcript analysis
   P2  f185–305  Score reveal
   P3  f305–420  Competency bars
   P4  f420–530  Rubric review
   P5  f530–620  Faculty edit
   P6  f620–715  Finalized
   ─────────────────────────────────────────────────────────────── */
const P1S = 65,  P1E = 185;
const P2S = 185, P2E = 305;
const P3S = 305, P3E = 420;
const P4S = 420, P4E = 530;
const P5S = 530, P5E = 620;
const P6S = 620, P6E = 715;

const CE   = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eIO  = Easing.inOut(Easing.cubic);
const eOut = Easing.out(Easing.cubic);

/* ════════════════════════════════════════════════════════════════
   ICONS
   ════════════════════════════════════════════════════════════════ */
const ICheck: React.FC<{ c: string; s?: number }> = ({ c, s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
    <circle cx={16} cy={16} r={14} stroke={c} strokeWidth={1.8} fill={c} fillOpacity={0.12} />
    <path d="M 8 16 L 13 21 L 24 10" stroke={c} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ICross: React.FC<{ c: string; s?: number }> = ({ c, s = 32 }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
    <circle cx={16} cy={16} r={14} stroke={c} strokeWidth={1.8} fill={c} fillOpacity={0.10} />
    <line x1={10} y1={10} x2={22} y2={22} stroke={c} strokeWidth={2.8} strokeLinecap="round" />
    <line x1={22} y1={10} x2={10} y2={22} stroke={c} strokeWidth={2.8} strokeLinecap="round" />
  </svg>
);
const IClipboard: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <rect x={5} y={7} width={26} height={27} rx={3} stroke={c} strokeWidth={2} />
    <rect x={12} y={3} width={12} height={7} rx={3.5} stroke={c} strokeWidth={2} />
    <rect x={9} y={16} width={16} height={2.5} rx={1.25} fill={c} opacity={0.5} />
    <rect x={9} y={21} width={12} height={2.5} rx={1.25} fill={c} opacity={0.4} />
    <rect x={9} y={26} width={14} height={2.5} rx={1.25} fill={c} opacity={0.35} />
  </svg>
);
const IScope: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <circle cx={24} cy={24} r={7} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.1} />
    <line x1={8} y1={8} x2={16} y2={8} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M 8 8 L 8 18 Q 8 24 17 24 L 17 24" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M 16 8 L 16 18 Q 16 24 17 24" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);
const ISpeech: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <rect x={3} y={4} width={26} height={19} rx={5} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.08} />
    <path d="M 6 23 L 3 30 L 12 25" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={8} y={11} width={12} height={2.5} rx={1.25} fill={c} opacity={0.5} />
    <rect x={8} y={16} width={8} height={2.5} rx={1.25} fill={c} opacity={0.4} />
  </svg>
);
const IHands: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <path d="M 3 22 Q 10 14 18 17 Q 26 14 33 22" stroke={c} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    <path d="M 10 22 Q 14 18 18 20 Q 22 18 26 22" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
    <circle cx={18} cy={12} r={4} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.1} />
    <path d="M 3 22 L 3 30 Q 3 33 6 33 L 12 33" stroke={c} strokeWidth={2} strokeLinecap="round" />
    <path d="M 33 22 L 33 30 Q 33 33 30 33 L 24 33" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const IHeart: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <path d="M 18 30 Q 4 20 4 12 Q 4 4 11 4 Q 15 4 18 11 Q 21 4 25 4 Q 32 4 32 12 Q 32 20 18 30 Z"
      stroke={c} strokeWidth={2.2} fill={c} fillOpacity={0.15} />
  </svg>
);
const ITrophy: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <path d="M 9 4 L 27 4 L 25 18 Q 22 26 18 26 Q 14 26 11 18 Z"
      stroke={c} strokeWidth={2} strokeLinejoin="round" fill={c} fillOpacity={0.1} />
    <line x1={18} y1={26} x2={18} y2={30} stroke={c} strokeWidth={2} strokeLinecap="round" />
    <line x1={11} y1={32} x2={25} y2={32} stroke={c} strokeWidth={2} strokeLinecap="round" />
    <path d="M 9 4 L 4 4 L 4 12 Q 4 18 9 16" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    <path d="M 27 4 L 32 4 L 32 12 Q 32 18 27 16" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);
const IClock: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <circle cx={18} cy={18} r={14} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.08} />
    <line x1={18} y1={8} x2={18} y2={18} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <line x1={18} y1={18} x2={24} y2={22} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
  </svg>
);
const IQuestion: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <circle cx={18} cy={18} r={14} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.08} />
    <path d="M 13 14 Q 13 8 18 8 Q 23 8 23 13 Q 23 18 18 19 L 18 22"
      stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <circle cx={18} cy={26} r={2} fill={c} />
  </svg>
);
const IPerson: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <circle cx={18} cy={11} r={7} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.12} />
    <path d="M 4 32 Q 5 22 18 22 Q 31 22 32 32" stroke={c} strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const IDoc: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <rect x={6} y={3} width={20} height={28} rx={3} stroke={c} strokeWidth={2} />
    <path d="M 20 3 L 26 9 L 20 9 Z" fill={c} fillOpacity={0.2} stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
    <rect x={10} y={15} width={10} height={2.5} rx={1.25} fill={c} opacity={0.5} />
    <rect x={10} y={20} width={8}  height={2.5} rx={1.25} fill={c} opacity={0.4} />
    <rect x={10} y={25} width={9}  height={2.5} rx={1.25} fill={c} opacity={0.35} />
  </svg>
);
const ICalendar: React.FC<{ c: string; s?: number }> = ({ c, s = 36 }) => (
  <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
    <rect x={3} y={7} width={30} height={25} rx={4} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.08} />
    <line x1={3} y1={15} x2={33} y2={15} stroke={c} strokeWidth={1.5} />
    <line x1={11} y1={3} x2={11} y2={11} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <line x1={25} y1={3} x2={25} y2={11} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    <circle cx={11} cy={22} r={2} fill={c} opacity={0.55} />
    <circle cx={18} cy={22} r={2} fill={c} opacity={0.55} />
    <circle cx={25} cy={22} r={2} fill={c} opacity={0.55} />
    <circle cx={11} cy={29} r={2} fill={c} opacity={0.45} />
    <circle cx={18} cy={29} r={2} fill={c} opacity={0.45} />
  </svg>
);
const IPencil: React.FC<{ c: string; s?: number }> = ({ c, s = 28 }) => (
  <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
    <path d="M 3 20 L 7 24 L 22 9 L 18 5 Z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill={c} fillOpacity={0.1} />
    <line x1={18} y1={5} x2={22} y2={9} stroke={c} strokeWidth={2} strokeLinecap="round" />
    <line x1={3} y1={24} x2={7} y2={24} stroke={c} strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

/* ── STATIC DATA ────────────────────────────────────────────────── */
const COMPS = [
  { color: colors.oasis,        score: 82, cohort: 75, icon: "clipboard" },
  { color: colors.vitalsNormal, score: 91, cohort: 81, icon: "scope"     },
  { color: "#06b6d4",            score: 80, cohort: 75, icon: "speech"    },
  { color: colors.vitalsWarning, score: 85, cohort: 83, icon: "hands"     },
  { color: colors.arizonaRed,   score: 90, cohort: 83, icon: "heart"     },
] as const;

// true = YES (check), false = NO (cross)
const RUBRIC = [
  { color: colors.oasis,        items: [true, true, false]        },
  { color: "#06b6d4",            items: [true, true, true, false]  },
  { color: colors.vitalsWarning, items: [true, true, true]         },
  { color: colors.azurite,       items: [true, true, false, true]  },
] as const;

function renderCompIcon(name: string, color: string, size: number): React.ReactNode {
  switch (name) {
    case "clipboard": return <IClipboard c={color} s={size} />;
    case "scope":     return <IScope     c={color} s={size} />;
    case "speech":    return <ISpeech    c={color} s={size} />;
    case "hands":     return <IHands     c={color} s={size} />;
    case "heart":     return <IHeart     c={color} s={size} />;
    default:          return null;
  }
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════ */
export const Scene5_AIMHEI: React.FC = () => {
  const frame = useCurrentFrame();

  /* ── Phase helpers ── */
  const phOp   = (s: number, e: number) => interpolate(frame, [s, s + 18, e - 16, e], [0, 1, 1, 0], CE);
  const phZoom = (s: number) => interpolate(frame, [s, s + 28], [0.93, 1.0], { ...CE, easing: eIO });

  const p1Op   = phOp(P1S, P1E);
  const p2Op   = phOp(P2S, P2E);   const p2Zoom = phZoom(P2S);
  const p3Op   = phOp(P3S, P3E);   const p3Zoom = phZoom(P3S);
  const p4Op   = phOp(P4S, P4E);   const p4Zoom = phZoom(P4S);
  const p5Op   = phOp(P5S, P5E);   const p5Zoom = phZoom(P5S);
  const p6Op   = interpolate(frame, [P6S, P6S + 18, P6E], [0, 1, 1], CE);
  const p6Zoom = phZoom(P6S);

  /* ── P1: chat bubbles + progress ── */
  const progP  = interpolate(frame, [P1S + 8, P1E - 14], [0, 1], CE);
  const pulse  = 0.5 + 0.5 * Math.sin(frame * 0.24);
  const bubbleOps = [0, 1, 2, 3, 4, 5, 6].map(i =>
    interpolate(frame, [P1S + 20 + i * 13, P1S + 34 + i * 13], [0, 1], CE)
  );

  /* ── P2: score arc ── */
  const scoreRaw    = Math.floor(interpolate(frame, [P2S + 12, P2S + 52], [0, 87], CE));
  const SL          = 2 * Math.PI * 138;
  const scoreOffset = SL - SL * (scoreRaw / 100);
  const nodeOps     = [0, 1, 2, 3].map(i =>
    interpolate(frame, [P2S + 50 + i * 14, P2S + 66 + i * 14], [0, 1], CE)
  );
  const labelOp     = interpolate(frame, [P2S + 18, P2S + 32], [0, 1], CE);

  /* ── P3: competency bars + spotlight ── */
  const barFills = COMPS.map((c, i) =>
    interpolate(frame, [P3S + 18 + i * 14, P3S + 40 + i * 14], [0, c.score], CE)
  );
  const catSpot = COMPS.map((_, i) => {
    const hi = P3S + 22 + i * 19;
    return interpolate(frame, [hi, hi + 6, hi + 13, hi + 19], [0, 1, 1, 0], CE);
  });
  const anySpot = catSpot.reduce((a, v) => Math.max(a, v), 0);

  /* ── P4: rubric panels + spotlight ── */
  const rubricSpots = RUBRIC.map((_, i) => {
    const st = P4S + i * 27;
    return interpolate(frame, [st, st + 10, st + 21, st + 27], [0, 1, 1, 0], CE);
  });
  const rubricItemOps = RUBRIC.map((sec, si) => {
    const ss = P4S + si * 27;
    return sec.items.map((_, ii) =>
      interpolate(frame, [ss + 8 + ii * 7, ss + 16 + ii * 7], [0, 1], CE)
    );
  });
  const p4LabelOp = interpolate(frame, [P4S + 8, P4S + 22], [0, 1], CE);

  /* ── P5: faculty edit ── */
  const editDotOp  = interpolate(frame, [P5S + 8,  P5S + 22],  [0, 1], CE);
  const flipProg   = interpolate(frame, [P5S + 28, P5S + 48],  [0, 1], { ...CE, easing: eOut });
  const row2Op     = interpolate(frame, [P5S + 44, P5S + 58],  [0, 1], CE);
  const scoreUpP   = interpolate(frame, [P5S + 52, P5S + 68],  [0, 1], CE);
  const adjLabelOp = interpolate(frame, [P5S + 60, P5S + 74],  [0, 1], CE);
  const scoreAdj   = Math.floor(interpolate(frame, [P5S + 48, P5S + 64], [87, 89], CE));
  const SL5        = 2 * Math.PI * 52;
  const arc5Offset = SL5 - SL5 * (scoreAdj / 100);

  /* ── P6: finalized ── */
  const bigCheckP  = interpolate(frame, [P6S + 8,  P6S + 42],  [0, 1], { ...CE, easing: eOut });
  const glowPulse  = P6S <= frame ? 0.5 + 0.5 * Math.sin((frame - P6S) * 0.16) : 0;
  const finalLabel = interpolate(frame, [P6S + 18, P6S + 32],  [0, 1], CE);
  const iconOps    = [0, 1, 2, 3].map(i =>
    interpolate(frame, [P6S + 32 + i * 10, P6S + 46 + i * 10], [0, 1], CE)
  );
  const bigCheckCirc  = 2 * Math.PI * 88;
  const bigCheckPath  = 220;

  /* ── 3D background ── */
  const orbScale3d = interpolate(frame, [P1S, P1E], [1, 2.4], CE);
  const threeFade  = interpolate(frame, [P1E, P1E + 40], [1, 0.14], CE);

  const threeContent = (
    <>
      <AnimatedGrid color="#4CAF50" opacity={0.055 * threeFade} />
      {frame < P1E + 20 && (
        <ParticleField count={110} color={colors.ecgGreen} speed={0.004} opacity={0.16} />
      )}
      {frame >= P1E + 20 && (
        <ParticleField count={28} color={colors.vitalsNormal} speed={0.001} opacity={0.05} />
      )}
      {frame < P1E && (
        <>
          <DataStream direction="down" position={[-4, 3, -1]}  color="#4CAF50" opacity={0.28} speed={0.07} />
          <DataStream direction="down" position={[4, 3, -1]}   color="#4CAF50" opacity={0.28} speed={0.07} />
          <DataStream direction="up"   position={[-3, -3, -1]} color="#4CAF50" opacity={0.22} speed={0.06} />
          <DataStream direction="up"   position={[3, -3, -1]}  color="#4CAF50" opacity={0.22} speed={0.06} />
        </>
      )}
      <GlowOrb
        position={[0, 0, -1]} color="#4CAF50"
        radius={frame < P1E ? orbScale3d : 2}
        baseOpacity={0.055 * threeFade}
      />
      <OrbitRing
        position={[0, 0, 0]} radius={2} color={colors.vitalsNormal}
        opacity={0.16 * threeFade}
        rotationSpeed={frame < P1E ? 0.05 : 0.014}
        tilt={[Math.PI / 8, 0, 0]}
      />
      <CameraRig positions={[
        { frame: 0,   position: [0, 0, 10]  },
        { frame: P1E, position: [0, 0, 7.5] },
        { frame: P6E, position: [0, 0, 7.5] },
      ]} />
    </>
  );

  const wrap = (op: number): React.CSSProperties => ({
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "22px 40px 16px",
    opacity: op, pointerEvents: "none", zIndex: 10,
  });

  const glass: React.CSSProperties = {
    background: "rgba(10, 28, 64, 0.82)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${colors.vitalsNormal}22`,
    borderRadius: 16,
  };

  return (
    <SceneShell
      interstitial={{ step: 4, title: "Evaluate", subtitle: "AIMS Performance Reports" }}
      sectionLabel="Performance Reports"
      bgGradient={`linear-gradient(160deg, ${colors.midnight} 0%, ${colors.arizonaBlue} 50%, #1a3a2a 100%)`}
      threeContent={threeContent}
    >

      {/* ════════════════════════════════════════════════════════════
          PHASE 1 — TRANSCRIPT ANALYSIS  (f65–185)
          Pulsing dot + progress bar + abstract chat bubbles.
          Max text: "Analyzing" — 1 word
         ════════════════════════════════════════════════════════════ */}
      {p1Op > 0 && (
        <div style={wrap(p1Op)}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", maxWidth: 640 }}>

            {/* Status dot + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: colors.vitalsNormal,
                boxShadow: `0 0 ${14 + pulse * 14}px ${colors.vitalsNormal}`,
                opacity: 0.72 + 0.28 * pulse,
              }} />
              <span style={{
                fontFamily: fonts.heading, fontSize: 32, fontWeight: 700,
                color: colors.white,
              }}>
                Analyzing
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", height: 16, borderRadius: 8, background: `${colors.white}14` }}>
              <div style={{
                width: `${progP * 100}%`, height: "100%", borderRadius: 8,
                background: `linear-gradient(90deg, ${colors.vitalsNormal}, ${colors.ecgGreen})`,
                boxShadow: `0 0 18px ${colors.vitalsNormal}66`,
              }} />
            </div>

            {/* Chat bubbles — abstract, no text */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { align: "flex-start", w: "58%", color: `${colors.azurite}55`,       h: 36 },
                { align: "flex-end",   w: "44%", color: `${colors.vitalsNormal}30`,   h: 32 },
                { align: "flex-start", w: "66%", color: `${colors.azurite}55`,        h: 36 },
                { align: "flex-end",   w: "38%", color: `${colors.vitalsNormal}30`,   h: 32 },
                { align: "flex-start", w: "50%", color: `${colors.azurite}55`,        h: 36 },
                { align: "flex-end",   w: "55%", color: `${colors.vitalsNormal}30`,   h: 40 },
                { align: "flex-start", w: "42%", color: `${colors.azurite}55`,        h: 32 },
              ].map((b, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: b.align as "flex-start" | "flex-end",
                  opacity: bubbleOps[i],
                  transform: `translateY(${interpolate(bubbleOps[i], [0, 1], [10, 0])}px)`,
                }}>
                  <div style={{
                    width: b.w, height: b.h, borderRadius: 18,
                    background: b.color,
                    border: `1px solid ${colors.white}12`,
                    backdropFilter: "blur(4px)",
                    position: "relative",
                  }}>
                    {/* Scanning line inside bubble */}
                    <div style={{
                      position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                      width: `${40 + (i % 3) * 18}%`, height: 4, borderRadius: 2,
                      background: `${colors.white}${i % 2 === 0 ? "28" : "18"}`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 2 — SCORE REVEAL  (f185–305)
          Dominant score arc + 4 icon nodes. Max text: "Score" — 1 word
         ════════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={wrap(p2Op)}>
          <div style={{ transform: `scale(${p2Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 460, height: 460 }}>

              {/* Score arc */}
              <svg width={460} height={460} style={{ position: "absolute", top: 0, left: 0 }}>
                {/* Outer glow ring */}
                <circle cx={230} cy={230} r={160} fill="none" stroke={`${colors.vitalsNormal}08`} strokeWidth={2} />
              {/* Track */}
              <circle cx={230} cy={230} r={138} fill="none" stroke={`${colors.white}10`} strokeWidth={22} />
              {/* Filled arc */}
              <circle cx={230} cy={230} r={138}
                fill="none" stroke={colors.vitalsNormal} strokeWidth={22}
                  strokeDasharray={SL} strokeDashoffset={scoreOffset}
                  strokeLinecap="round" transform="rotate(-90 230 230)"
                  style={{ filter: `drop-shadow(0 0 18px ${colors.vitalsNormal}70)` }}
                />
              </svg>

              {/* Score number + label */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6,
              }}>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 96, fontWeight: 800,
                  color: colors.white, lineHeight: 1,
                }}>
                  {scoreRaw}
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4,
                  color: `${colors.vitalsNormal}90`, textTransform: "uppercase",
                  opacity: labelOp,
                }}>
                  Score
                </div>
              </div>

              {/* 4 icon nodes overlapping the arc ring */}
              {[
                { icon: "trophy",   color: colors.vitalsNormal, x: -8,  y: 50  },
                { icon: "question", color: colors.oasis,         x: 396, y: 50  },
                { icon: "clock",    color: colors.oasis,         x: -8,  y: 338 },
                { icon: "doc",      color: "#06b6d4",             x: 396, y: 338 },
              ].map((node, i) => (
                <div key={i} style={{
                  position: "absolute", left: node.x, top: node.y,
                  width: 72, height: 72, borderRadius: 18,
                  background: `${node.color}16`,
                  border: `2.5px solid ${node.color}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 28px ${node.color}20`,
                  opacity: nodeOps[i],
                  transform: `scale(${interpolate(nodeOps[i], [0, 1], [0.6, 1])})`,
                }}>
                  {node.icon === "trophy"   && <ITrophy   c={node.color} s={40} />}
                  {node.icon === "question" && <IQuestion c={node.color} s={40} />}
                  {node.icon === "clock"    && <IClock    c={node.color} s={40} />}
                  {node.icon === "doc"      && <IDoc      c={node.color} s={40} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 3 — COMPETENCY BREAKDOWN  (f305–420)
          5 icon bars. One spotlit at a time. No text.
         ════════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={wrap(p3Op)}>
          <div style={{ transform: `scale(${p3Zoom})`, width: "100%", maxWidth: 860, display: "flex", flexDirection: "column", gap: 12 }}>
            {COMPS.map((cat, i) => {
              const isSpot = catSpot[i] > 0.08;
              const dimmed = anySpot > 0.1 && !isSpot;
              const delta  = cat.score - cat.cohort;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "16px 20px", borderRadius: 12,
                  background: isSpot ? `${cat.color}0e` : `${colors.white}03`,
                  border: isSpot
                    ? `1.5px solid ${cat.color}${Math.round(catSpot[i] * 60).toString(16).padStart(2, "0")}`
                    : `1px solid ${colors.white}08`,
                  opacity: dimmed ? 0.32 : 1,
                  transform: isSpot ? "scale(1.018)" : "scale(1)",
                  transformOrigin: "50% 50%",
                  boxShadow: isSpot ? `0 0 32px ${cat.color}16` : "none",
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                    background: `${cat.color}14`,
                    border: `2.5px solid ${cat.color}${isSpot ? "55" : "28"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {renderCompIcon(cat.icon, cat.color, 38)}
                  </div>

                  {/* Bar track */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    {/* Cohort bar (dim) */}
                    <div style={{ position: "relative", height: 18, borderRadius: 9, background: `${colors.white}10` }}>
                      <div style={{
                        position: "absolute", height: "100%", borderRadius: 9,
                        background: `${colors.white}22`, width: `${cat.cohort}%`,
                      }} />
                      {/* Student bar (bright) */}
                      <div style={{
                        position: "absolute", height: "100%", borderRadius: 9,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
                        width: `${barFills[i]}%`,
                        boxShadow: isSpot ? `0 0 10px ${cat.color}60` : "none",
                      }} />
                    </div>
                  </div>

                  {/* Delta arrow — no text, just direction */}
                  <div style={{
                    width: 36, height: 36, flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                      {delta >= 0 ? (
                        <path d="M 12 18 L 12 6 M 6 12 L 12 6 L 18 12"
                          stroke={colors.vitalsNormal} strokeWidth={2.5}
                          strokeLinecap="round" strokeLinejoin="round"
                          opacity={isSpot ? 1 : 0.5} />
                      ) : (
                        <path d="M 12 6 L 12 18 M 6 12 L 12 18 L 18 12"
                          stroke={colors.vitalsCritical} strokeWidth={2.5}
                          strokeLinecap="round" strokeLinejoin="round"
                          opacity={isSpot ? 1 : 0.5} />
                      )}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 4 — RUBRIC REVIEW  (f420–530)
          2×2 icon grid. Check/cross rows. Spotlight cycles.
          Max text: "Review" — 1 word
         ════════════════════════════════════════════════════════════ */}
      {p4Op > 0 && (
        <div style={wrap(p4Op)}>
          <div style={{ transform: `scale(${p4Zoom})`, width: "100%", maxWidth: 900, display: "flex", flexDirection: "column", gap: 18 }}>

            <div style={{
              fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5,
              color: `${colors.vitalsNormal}70`, textTransform: "uppercase",
              opacity: p4LabelOp, textAlign: "center",
            }}>
              Review
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {RUBRIC.map((sec, si) => {
                const spot  = rubricSpots[si];
                const isHi  = spot > 0.08;
                const dimP4 = rubricSpots.some((v, ii) => ii !== si && v > 0.08);
                return (
                  <div key={si} style={{
                    ...glass,
                    border: isHi
                      ? `1.5px solid ${sec.color}${Math.round(spot * 65).toString(16).padStart(2, "0")}`
                      : `1px solid ${colors.white}09`,
                    padding: "20px 24px",
                    opacity: (dimP4 && !isHi) ? 0.28 : 1,
                    transform: isHi ? "scale(1.022)" : "scale(1)",
                    transformOrigin: "50% 50%",
                    boxShadow: isHi ? `0 0 40px ${sec.color}18` : "none",
                  }}>
                    {/* Color accent bar */}
                    <div style={{
                      height: 6, borderRadius: 3, marginBottom: 18,
                      background: sec.color, opacity: isHi ? 0.9 : 0.4,
                      boxShadow: isHi ? `0 0 10px ${sec.color}80` : "none",
                    }} />
                    {/* Check/cross rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {sec.items.map((pass, ii) => (
                        <div key={ii} style={{
                          display: "flex", alignItems: "center", gap: 14,
                          opacity: rubricItemOps[si]?.[ii] ?? 0,
                        }}>
                          {pass
                            ? <ICheck c={colors.vitalsNormal} s={36} />
                            : <ICross c={colors.vitalsCritical} s={36} />}
                          {/* Line stub instead of text */}
                          <div style={{
                            flex: 1, height: 8, borderRadius: 4,
                            background: pass
                              ? `${colors.vitalsNormal}${isHi ? "30" : "18"}`
                              : `${colors.vitalsCritical}${isHi ? "28" : "14"}`,
                            width: `${55 + ((ii * 17 + si * 9) % 35)}%`,
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 5 — FACULTY EDIT  (f530–620)
          Edit indicator + cross→check flip + arc update.
          Max text: "Adjusted" — 1 word
         ════════════════════════════════════════════════════════════ */}
      {p5Op > 0 && (
        <div style={wrap(p5Op)}>
          <div style={{ transform: `scale(${p5Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, maxWidth: 600 }}>

            {/* Edit mode indicator */}
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              opacity: editDotOp,
              background: `${colors.azurite}12`,
              border: `1px solid ${colors.azurite}30`,
              borderRadius: 12, padding: "12px 24px",
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: colors.azurite,
                boxShadow: `0 0 ${10 + pulse * 10}px ${colors.azurite}`,
                opacity: 0.7 + 0.3 * pulse,
              }} />
              <IPencil c={colors.azurite} s={26} />
            </div>

            {/* Two change rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 520 }}>

              {/* Row 1: cross → check (animated flip) */}
              <div style={{
                ...glass, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 20,
                border: `1.5px solid ${colors.vitalsNormal}${flipProg > 0.5 ? "50" : "15"}`,
                boxShadow: flipProg > 0.5 ? `0 0 28px ${colors.vitalsNormal}18` : "none",
              }}>
                {/* Before: cross (fades out) */}
                <div style={{
                  position: "relative", width: 36, height: 36, flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    opacity: Math.max(0, 1 - flipProg * 2.5),
                    transform: `scale(${1 - flipProg * 0.4})`,
                  }}>
                    <ICross c={colors.vitalsCritical} s={36} />
                  </div>
                  <div style={{
                    position: "absolute", inset: 0,
                    opacity: Math.max(0, flipProg * 2 - 0.8),
                    transform: `scale(${0.5 + flipProg * 0.5})`,
                  }}>
                    <ICheck c={colors.vitalsNormal} s={36} />
                  </div>
                </div>
                {/* Line stub */}
                <div style={{
                  flex: 1, height: 10, borderRadius: 5,
                  background: flipProg > 0.5
                    ? `${colors.vitalsNormal}35`
                    : `${colors.white}14`,
                  width: "75%",
                  boxShadow: flipProg > 0.5 ? `0 0 8px ${colors.vitalsNormal}35` : "none",
                }} />
                {/* Arrow indicating change */}
                <svg width={20} height={20} viewBox="0 0 20 20" fill="none" style={{ opacity: 0.5 + flipProg * 0.5 }}>
                  <path d="M 2 10 L 14 10 M 10 6 L 14 10 L 10 14"
                    stroke={flipProg > 0.5 ? colors.vitalsNormal : `${colors.white}40`}
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Row 2: cross stays cross */}
              <div style={{
                ...glass, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 20,
                opacity: row2Op,
              }}>
                <ICross c={colors.vitalsCritical} s={36} />
                <div style={{
                  flex: 1, height: 10, borderRadius: 5,
                  background: `${colors.vitalsCritical}20`, width: "68%",
                }} />
                <svg width={20} height={20} viewBox="0 0 20 20" fill="none" style={{ opacity: 0.5 }}>
                  <circle cx={10} cy={10} r={8} stroke={`${colors.white}25`} strokeWidth={1.5} />
                  <line x1={7} y1={10} x2={13} y2={10} stroke={`${colors.white}30`} strokeWidth={2} strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Score arc update */}
            {scoreUpP > 0.01 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                opacity: scoreUpP,
              }}>
                <div style={{ position: "relative", width: 128, height: 128 }}>
                  <svg width={128} height={128}>
                    <circle cx={64} cy={64} r={52} fill="none" stroke={`${colors.white}10`} strokeWidth={12} />
                    <circle cx={64} cy={64} r={52}
                      fill="none" stroke={colors.vitalsNormal} strokeWidth={12}
                      strokeDasharray={SL5} strokeDashoffset={arc5Offset}
                      strokeLinecap="round" transform="rotate(-90 64 64)"
                      style={{ filter: `drop-shadow(0 0 8px ${colors.vitalsNormal}60)` }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      fontFamily: fonts.heading, fontSize: 28, fontWeight: 800,
                      color: colors.vitalsNormal, lineHeight: 1,
                    }}>
                      {scoreAdj}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 18, fontWeight: 700,
                  color: colors.vitalsNormal, letterSpacing: 4,
                  textTransform: "uppercase", opacity: adjLabelOp,
                }}>
                  Adjusted
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          PHASE 6 — FINALIZED  (f620–715)
          Large animated check + glow + 4 icon nodes.
          Max text: "Finalized" — 1 word
         ════════════════════════════════════════════════════════════ */}
      {p6Op > 0 && (
        <div style={{
          ...wrap(p6Op), flexDirection: "column", gap: 14,
        }}>
          <div style={{ transform: `scale(${p6Zoom})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

            {/* Big animated check */}
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {/* Glow pulse rings */}
              {[1.4, 1.8, 2.2].map((scale, ri) => (
                <div key={ri} style={{
                  position: "absolute",
                  left: "50%", top: "50%",
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  width: 220, height: 220, borderRadius: "50%",
                  border: `3px solid ${colors.vitalsNormal}`,
                  opacity: Math.max(0, (bigCheckP - 0.3) * glowPulse * (0.25 - ri * 0.06)),
                }} />
              ))}
              <svg width={220} height={220} style={{ position: "absolute", top: 0, left: 0 }}>
                {/* Track */}
                <circle cx={110} cy={110} r={88} fill="none" stroke={`${colors.vitalsNormal}20`} strokeWidth={10} />
                {/* Arc fills as check appears */}
                <circle cx={110} cy={110} r={88}
                  fill="none" stroke={colors.vitalsNormal} strokeWidth={10}
                  strokeDasharray={bigCheckCirc}
                  strokeDashoffset={bigCheckCirc * (1 - bigCheckP)}
                  strokeLinecap="round" transform="rotate(-90 110 110)"
                  style={{ filter: `drop-shadow(0 0 20px ${colors.vitalsNormal}80)` }}
                />
                {/* Check path draws in */}
                <path d={`M 55 110 L 88 143 L 165 76`}
                  fill="none" stroke={colors.vitalsNormal} strokeWidth={14}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray={bigCheckPath}
                  strokeDashoffset={bigCheckPath * (1 - bigCheckP)}
                  style={{ filter: `drop-shadow(0 0 12px ${colors.vitalsNormal}90)` }}
                />
              </svg>
            </div>

            {/* "Finalized" label */}
            <div style={{
              fontFamily: fonts.heading, fontSize: 52, fontWeight: 800,
              color: colors.vitalsNormal, letterSpacing: 2,
              textShadow: `0 0 48px ${colors.vitalsNormal}50`,
              opacity: finalLabel,
            }}>
              Finalized
            </div>

            {/* 4 icon nodes */}
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { Icon: IPerson,   c: colors.oasis        },
                { Icon: IDoc,      c: "#06b6d4"            },
                { Icon: IClock,    c: colors.vitalsNormal  },
                { Icon: ICalendar, c: colors.vitalsWarning },
              ].map(({ Icon, c }, i) => (
                <div key={i} style={{
                  width: 88, height: 88, borderRadius: 22,
                  background: `${c}14`,
                  border: `2.5px solid ${c}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 32px ${c}20`,
                  opacity: iconOps[i],
                  transform: `scale(${interpolate(iconOps[i], [0, 1], [0.6, 1])}) translateY(${interpolate(iconOps[i], [0, 1], [14, 0])}px)`,
                }}>
                  <Icon c={c} s={44} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </SceneShell>
  );
};
