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
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";

/* ═══════════════════════════════════════════════════════════════════════════
   BEAT TIMING  (30fps · 540 frames = 18 s)

   BEAT 0  f  0–130   INTRO — ASTEC logo · AIMMS · subtitle
   BEAT 1  f128–255   BUILDING CASES — documents assemble → case panel
   BEAT 2  f245–368   RUNNING SIMULATIONS — patient scope + live vitals
   BEAT 3  f358–460   EVALUATING STUDENTS — score arc + competency bars
   BEAT 4  f450–535   UNIFIED — three pillars together
   FADE    f512–535   scene fade out
   ════════════════════════════════════════════════════════════════════════ */
const B0E = 130;
const B1S = 128, B1E = 255;
const B2S = 245, B2E = 368;
const B3S = 358, B3E = 460;
const B4S = 450, B4E = 535;

const CE = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eIO  = Easing.inOut(Easing.cubic);
const eOut = Easing.out(Easing.cubic);

function ph(frame: number, s: number, e: number, fi = 16, fo = 16): number {
  return interpolate(frame, [s, s + fi, e - fo, e], [0, 1, 1, 0], { ...CE, easing: eIO });
}

/* ─── document card ─────────────────────────────────────────────── */
const DocCard: React.FC<{
  title: string; rows: number; accent: string;
  x: number; y: number; rot: number; scale: number; opacity: number;
}> = ({ title, rows, accent, x, y, rot, scale, opacity }) => (
  <div style={{
    position: "absolute",
    left: x, top: y,
    transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
    opacity,
    width: 210, borderRadius: 10, overflow: "hidden",
    background: "rgba(249,247,242,0.97)",
    boxShadow: "0 14px 44px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.25)",
    pointerEvents: "none",
  }}>
    <div style={{ height: 8, background: accent }} />
    <div style={{ padding: "11px 14px 14px" }}>
      <div style={{
        fontFamily: fonts.heading, fontSize: 15, fontWeight: 700,
        color: "#1a2035", marginBottom: 9,
      }}>{title}</div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 7, borderRadius: 3,
          background: "rgba(26,32,53,0.11)",
          marginBottom: 5,
          width: `${52 + ((i * 23 + rows * 9) % 38)}%`,
        }} />
      ))}
    </div>
  </div>
);

/* ─── competency bar ─────────────────────────────────────────────── */
const CompBar: React.FC<{ label: string; fill: number; color: string; opacity: number }> = ({
  label, fill, color, opacity,
}) => (
  <div style={{ marginBottom: 18, opacity }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontFamily: fonts.body, fontSize: 20, color: "rgba(255,255,255,0.75)" }}>{label}</span>
      <span style={{ fontFamily: fonts.mono, fontSize: 22, fontWeight: 700, color }}>
        {Math.round(fill)}%
      </span>
    </div>
    <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.10)" }}>
      <div style={{
        height: "100%", borderRadius: 8,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        width: `${fill}%`,
        boxShadow: `0 0 12px ${color}66`,
      }} />
    </div>
  </div>
);

export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── global ───────────────────────────────────────────────────── */
  const fadeOut = interpolate(frame, [510, 535], [1, 0], CE);

  /* ── corner brackets ─────────────────────────────────────────── */
  const bkDraw = interpolate(frame, [5, 60], [0, 1], CE);
  const bkGlow = 0.6 + 0.4 * Math.sin(frame * 0.06);
  const CS = 72, CT = 3.5, CI = 40;
  const sideOp = interpolate(frame, [40, 70], [0, 1], CE) * (0.5 + 0.5 * Math.sin(frame * 0.08));

  /* ── ticker ───────────────────────────────────────────────────── */
  const tickOp  = interpolate(frame, [80, 110], [0, 0.65], CE);
  const tickX   = interpolate(frame, [80, 580], [0, -2400], CE);
  const tickStr = "AIMMS v3.2 INITIALIZED   //   NEURAL PIPELINE ACTIVE   //   MEDICAL CASE CREATOR   //   VIRTUAL PATIENT SIM   //   AIMS PERFORMANCE REPORTS   //   FACULTY DASHBOARD   //   AI-POWERED AUTHORING   //   ";

  /* ── BEAT 0 — intro ──────────────────────────────────────────── */
  const b0Op      = interpolate(frame, [0, 18, B0E - 18, B0E], [0, 1, 1, 0], { ...CE, easing: eIO });
  const logoSp    = spring({ frame, fps, config: { damping: 22, stiffness: 80, mass: 1 } });
  const ruleW     = spring({ frame: frame - 30, fps, config: { damping: 25, stiffness: 70 } });
  const shimX     = interpolate(frame, [50, 120], [-400, 2400], CE);
  const settled   = frame >= 90;
  const breath    = settled ? 1 + 0.007 * Math.sin((frame - 90) * 0.038) : 1;
  const glowF     = settled ? 0.52 + 0.18 * Math.sin((frame - 90) * 0.038) : 0.40;
  const subOp     = interpolate(frame, [88, 112], [0, 1], CE);

  /* ── system expansion ring (intro → pillar transition) ──────── */
  const expandOp    = interpolate(frame, [110, 122, 144, 162], [0, 1, 1, 0], CE);
  const expandScale = interpolate(frame, [110, 162], [0.3, 2.4], { ...CE, easing: eOut });

  /* ── BEAT 1 — building cases ─────────────────────────────────── */
  const b1Op    = ph(frame, B1S, B1E, 18, 18);
  const b1Prog  = interpolate(frame, [B1S, B1E], [0, 1], CE);

  const DOCS = [
    { title: "Patient History",  rows: 4, color: colors.azurite,       fromX: -340, fromY: -200, tx: 718,  ty: 380 },
    { title: "Vital Signs",      rows: 3, color: colors.vitalsWarning,  fromX:  340, fromY: -200, tx: 1202, ty: 380 },
    { title: "Exam Findings",    rows: 3, color: colors.arizonaRed,     fromX: -340, fromY:  200, tx: 718,  ty: 600 },
    { title: "Lab Results",      rows: 5, color: "#16a34a",              fromX:  340, fromY:  200, tx: 1202, ty: 600 },
  ];
  const docFlies  = DOCS.map((_, i) =>
    interpolate(b1Prog, [0.06 + i * 0.09, 0.28 + i * 0.09], [0, 1], { ...CE, easing: eOut })
  );
  const assembleP = interpolate(b1Prog, [0.65, 0.88], [0, 1], { ...CE, easing: eIO });
  const readyOp   = interpolate(b1Prog, [0.85, 0.96], [0, 1], { ...CE, easing: eIO });

  /* ── BEAT 2 — running simulations ──────────────────────────── */
  const b2Op    = ph(frame, B2S, B2E, 18, 18);
  const b2Prog  = interpolate(frame, [B2S, B2E], [0, 1], CE);
  const simPulse   = 0.5 + 0.5 * Math.sin(frame * 0.19);
  const simBodyOp  = interpolate(b2Prog, [0.04, 0.24], [0, 1], { ...CE, easing: eOut });
  const simRingP   = interpolate(b2Prog, [0.08, 0.52], [0, 1], { ...CE, easing: eOut });
  const VITALS = [
    { label: "HR",   value: "74",     unit: "bpm",  color: colors.vitalsNormal, style: { left: "2%",  top: "40%" } as React.CSSProperties },
    { label: "SpO₂", value: "98",     unit: "%",    color: colors.oasis,        style: { right: "2%", top: "40%" } as React.CSSProperties },
    { label: "BP",   value: "122/78", unit: "mmHg", color: colors.azurite,      style: { left: "2%",  top: "60%" } as React.CSSProperties },
  ];
  const vitalOps = VITALS.map((_, i) =>
    interpolate(b2Prog, [0.30 + i * 0.13, 0.50 + i * 0.13], [0, 1], { ...CE, easing: eOut })
  );
  const simBadgeOp = interpolate(b2Prog, [0.62, 0.80], [0, 1], { ...CE, easing: eIO });

  /* ── BEAT 3 — evaluating students ─────────────────────────── */
  const b3Op    = ph(frame, B3S, B3E, 18, 16);
  const b3Prog  = interpolate(frame, [B3S, B3E], [0, 1], CE);

  const scoreVal  = Math.floor(interpolate(b3Prog, [0.10, 0.54], [0, 87], CE));
  const SL        = 2 * Math.PI * 120;
  const scoreOff  = SL - SL * (scoreVal / 100);

  const COMPS = [
    { label: "Clinical Skills",     score: 91, color: colors.vitalsNormal },
    { label: "Information Gathering", score: 82, color: colors.oasis },
    { label: "Medical Terminology",   score: 80, color: colors.azurite },
    { label: "Empathy & Rapport",     score: 88, color: colors.oasis },
  ];
  const barFills = COMPS.map((c, i) =>
    interpolate(b3Prog, [0.22 + i * 0.08, 0.52 + i * 0.08], [0, c.score], CE)
  );
  const barOps = COMPS.map((_, i) =>
    interpolate(b3Prog, [0.18 + i * 0.08, 0.36 + i * 0.08], [0, 1], { ...CE, easing: eOut })
  );
  const rubricOp   = interpolate(b3Prog, [0.60, 0.76], [0, 1], { ...CE, easing: eIO });
  const CHECKS = ["Onset & duration asked", "Medication history reviewed", "Assessment documented"];
  const checkOps   = CHECKS.map((_, i) =>
    interpolate(b3Prog, [0.62 + i * 0.09, 0.76 + i * 0.09], [0, 1], { ...CE, easing: eOut })
  );
  const evalBadgeOp = interpolate(b3Prog, [0.83, 0.95], [0, 1], { ...CE, easing: eIO });

  /* ── BEAT 4 — unified ──────────────────────────────────────── */
  const b4Op       = interpolate(frame, [B4S, B4S + 22, B4E - 12, B4E], [0, 1, 1, 0], { ...CE, easing: eIO });
  const b4Scale    = interpolate(frame, [B4S, B4S + 30], [0.92, 1], { ...CE, easing: eIO });
  const cardEnters = [0, 1, 2].map(i =>
    interpolate(frame, [B4S + 8 + i * 14, B4S + 26 + i * 14], [0, 1], { ...CE, easing: eOut })
  );
  const arrowOp  = interpolate(frame, [B4S + 48, B4S + 64], [0, 1], CE);

  /* ── 3D background ─────────────────────────────────────────── */
  const threeContent = (
    <>
      <AnimatedGrid color="#1E5288" opacity={0.06} />
      <ParticleField count={36} color="#378DBD" speed={0.002} opacity={0.12} />
      <GlowOrb position={[0, 0, -6]} color={colors.oasis} radius={3} baseOpacity={0.07} />
      <CameraRig positions={[
        { frame: 0,   position: [0, 0, 10.5] },
        { frame: 400, position: [0, 0, 8.5]  },
      ]} />
    </>
  );

  return (
    <SceneShell threeContent={threeContent}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: fadeOut }}>

        {/* ── corner brackets ── */}
        {[
          { style: { top: CI, left: CI } as React.CSSProperties,         d: `M 0,${CS} L 0,0 L ${CS},0` },
          { style: { top: CI, right: CI } as React.CSSProperties,        d: `M 0,0 L ${CS},0 L ${CS},${CS}` },
          { style: { bottom: CI + 40, left: CI } as React.CSSProperties, d: `M 0,0 L 0,${CS} L ${CS},${CS}` },
          { style: { bottom: CI + 40, right: CI } as React.CSSProperties,d: `M ${CS},0 L ${CS},${CS} L 0,${CS}` },
        ].map((c, i) => (
          <svg key={i} style={{ position: "absolute", ...c.style }} width={CS} height={CS} viewBox={`0 0 ${CS} ${CS}`}>
            <path d={c.d} fill="none" stroke={colors.oasis} strokeWidth={CT} strokeLinecap="round"
              opacity={bkGlow} strokeDasharray={CS * 2} strokeDashoffset={CS * 2 * (1 - bkDraw)} />
          </svg>
        ))}

        {/* side accent lines */}
        {(["left", "right"] as const).map(side => (
          <div key={side} style={{
            position: "absolute",
            top: CI + CS + 30, bottom: CI + 40 + CS + 30,
            [side]: CI + 10, width: 3,
            background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}90, ${colors.oasis}00)`,
            opacity: sideOp,
          }} />
        ))}

        {/* ═══════════════════════════════════════════════════════════
            BEAT 0 — INTRO  (f0–130)
           ═══════════════════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: b0Op,
        }}>
          {/* ASTEC logo */}
          <div style={{
            opacity: interpolate(logoSp, [0, 1], [0, 1]),
            transform: `scale(${interpolate(logoSp, [0, 1], [0.9, 1])})`,
            background: `linear-gradient(135deg, ${colors.white}90, ${colors.white}60)`,
            backdropFilter: "blur(16px)",
            borderRadius: 16, padding: "18px 36px",
            border: `1px solid ${colors.white}40`,
            boxShadow: `0 8px 32px ${colors.midnight}60, 0 0 40px ${colors.oasis}15, inset 0 1px 0 ${colors.white}40`,
            marginBottom: 28,
          }}>
            <Img src={staticFile("screenshots/astec_logo.png")} style={{ height: 70, objectFit: "contain" }} />
          </div>

          {/* Dividing rule */}
          <div style={{
            width: interpolate(ruleW, [0, 1], [0, 240]), height: 4,
            background: `linear-gradient(90deg, transparent, ${colors.arizonaRed}, transparent)`,
            borderRadius: 2, marginBottom: 30,
            boxShadow: `0 0 16px ${colors.arizonaRed}50`,
          }} />

          {/* AIMMS — large, with shimmer */}
          <div style={{ position: "relative", overflow: "hidden", marginBottom: 22 }}>
            <h1 style={{
              color: colors.white, fontSize: 100, fontFamily: fonts.heading, fontWeight: 800,
              letterSpacing: -2, margin: 0, textAlign: "center", lineHeight: 1.05,
              textShadow: `0 0 ${48 + glowF * 28}px ${colors.oasis}60, 0 0 90px ${colors.oasis}18`,
              transform: `scale(${breath})`,
            }}>
              AIMMS
            </h1>
            <div style={{
              position: "absolute", top: 0, left: shimX, width: 200, height: "100%",
              background: `linear-gradient(90deg, transparent, ${colors.white}28, transparent)`,
              transform: "skewX(-20deg)", pointerEvents: "none",
            }} />
          </div>

          {/* Subtitle — screen-dominant product name */}
          <div style={{ opacity: subOp }}>
            <p style={{
              color: colors.oasis,
              fontSize: 90,
              fontFamily: fonts.heading,
              fontWeight: 700,
              letterSpacing: 1,
              margin: 0,
              textAlign: "center",
              lineHeight: 1.1,
              textShadow: `0 0 60px ${colors.oasis}55, 0 0 120px ${colors.oasis}20`,
            }}>
              AI Medical Mentoring System
            </p>
          </div>
        </div>

        {/* ── System expansion ring (bridge between intro and first pillar) ── */}
        {expandOp > 0.01 && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: `translate(-50%, -50%) scale(${expandScale})`,
            width: 560, height: 560, borderRadius: "50%",
            border: `1.5px solid ${colors.oasis}40`,
            boxShadow: `0 0 60px ${colors.oasis}28, inset 0 0 60px ${colors.oasis}08`,
            opacity: expandOp, pointerEvents: "none", zIndex: 9,
          }} />
        )}

        {/* ═══════════════════════════════════════════════════════════
            BEAT 1 — BUILDING CASES  (f128–255)
            Documents fly from corners → converge → assembled case panel
           ═══════════════════════════════════════════════════════════ */}
        {b1Op > 0.01 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, opacity: b1Op }}>

            {/* Beat label */}
            <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{
                fontFamily: fonts.heading,
                fontSize: 96,
                fontWeight: 800,
                color: colors.white,
                lineHeight: 1,
                textShadow: `0 0 60px ${colors.arizonaRed}40, 0 0 120px ${colors.arizonaRed}15`,
              }}>
                Building Cases
              </div>
            </div>

            {/* Floating document cards */}
            {DOCS.map((doc, i) => {
              const p    = docFlies[i];
              const srcX = 960 + doc.fromX;
              const srcY = 560 + doc.fromY;
              // As assembly progresses, docs drift toward center
              const destX = doc.tx + assembleP * (870 - doc.tx);
              const destY = doc.ty + assembleP * (560 + i * 28 - doc.ty);
              const curX  = srcX + (destX - srcX) * p;
              const curY  = srcY + (destY - srcY) * p;
              const rot   = (1 - p) * (i % 2 === 0 ? -9 : 9);
              const sc    = 0.72 + p * 0.28 - assembleP * 0.08;
              const op    = p * (1 - assembleP * 0.75);
              return (
                <DocCard
                  key={i}
                  title={doc.title} rows={doc.rows} accent={doc.color}
                  x={curX} y={curY} rot={rot} scale={sc} opacity={op}
                />
              );
            })}

            {/* Assembled case panel — emerges as docs converge */}
            {assembleP > 0.05 && (
              <div style={{
                position: "absolute", left: "50%", top: "58%",
                transform: `translate(-50%, -50%) scale(${0.86 + assembleP * 0.14})`,
                opacity: assembleP,
                width: 580, borderRadius: 18,
                background: "linear-gradient(160deg, rgba(8,18,44,0.97) 0%, rgba(4,10,26,0.92) 100%)",
        border: `2.5px solid ${colors.arizonaRed}55`,
        boxShadow: `0 0 80px ${colors.arizonaRed}28, 0 40px 88px rgba(0,0,0,0.60)`,
        padding: "36px 44px",
                zIndex: 8,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 13, letterSpacing: 3,
                  color: `${colors.arizonaRed}80`, textTransform: "uppercase", marginBottom: 18,
                }}>
                  Clinical Case · Assembled
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 34, fontWeight: 800,
                  color: colors.white, marginBottom: 24, lineHeight: 1.2,
                }}>
                  Michael Chen — Community-Acquired Pneumonia
                </div>
                {[
                  { label: "Patient History",  color: colors.azurite,       w: "88%" },
                  { label: "Vital Signs",       color: colors.vitalsWarning, w: "72%" },
                  { label: "Exam Findings",     color: colors.arizonaRed,    w: "80%" },
                  { label: "Lab Results",       color: "#16a34a",             w: "94%" },
                ].map((row, ri) => (
                  <div key={ri} style={{ marginBottom: 16, opacity: Math.min(1, assembleP * 2.8 - ri * 0.55) }}>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 16, color: `${colors.white}65`,
                      letterSpacing: 2, marginBottom: 8, textTransform: "uppercase",
                    }}>
                      {row.label}
                    </div>
                    <div style={{ height: 14, borderRadius: 7, background: `${colors.white}10` }}>
                      <div style={{
                        height: "100%", borderRadius: 7,
                        background: `linear-gradient(90deg, ${row.color}DD, ${row.color}66)`,
                        width: row.w,
                        boxShadow: `0 0 10px ${row.color}50`,
                      }} />
                    </div>
                  </div>
                ))}

                {readyOp > 0.01 && (
                  <div style={{
                    marginTop: 20, opacity: readyOp,
                    display: "inline-flex", alignItems: "center", gap: 14,
                    background: `${colors.vitalsNormal}18`,
                    border: `2.5px solid ${colors.vitalsNormal}60`,
                    borderRadius: 12, padding: "14px 26px",
                    boxShadow: `0 0 36px ${colors.vitalsNormal}28`,
                  }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: "50%",
                      background: colors.vitalsNormal,
                      boxShadow: `0 0 10px ${colors.vitalsNormal}`,
                    }} />
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 24, fontWeight: 700,
                      color: colors.vitalsNormal, letterSpacing: 3, textTransform: "uppercase",
                    }}>
                      Case Ready
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BEAT 2 — RUNNING SIMULATIONS  (f245–368)
            Patient silhouette + scan ring + live vital panels
           ═══════════════════════════════════════════════════════════ */}
        {b2Op > 0.01 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, opacity: b2Op }}>

            {/* Beat label */}
            <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{
                fontFamily: fonts.heading,
                fontSize: 96,
                fontWeight: 800,
                color: colors.white,
                lineHeight: 1,
                textShadow: `0 0 60px ${colors.oasis}40, 0 0 120px ${colors.oasis}15`,
              }}>
                Running Simulations
              </div>
            </div>

            {/* Patient scope — centered below large headline */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%) translateY(36px)",
              opacity: simBodyOp,
            }}>
              <svg width={440} height={500} viewBox="0 0 440 500" style={{ display: "block", overflow: "visible" }}>
                {/* Outer atmosphere */}
                <circle cx={220} cy={248} r={210} fill="none" stroke={`${colors.oasis}14`} strokeWidth={2} />

                {/* Active scan ring — draws in and pulses */}
                <circle cx={220} cy={248} r={196}
                  fill="none" stroke={colors.oasis} strokeWidth={5}
                  strokeDasharray={`${simRingP * 2 * Math.PI * 196} ${2 * Math.PI * 196}`}
                  strokeLinecap="round" transform="rotate(-90 220 248)"
                  opacity={0.55 + 0.40 * simPulse}
                  style={{ filter: `drop-shadow(0 0 18px ${colors.oasis}99)` }}
                />

                {/* Inner reference ring */}
                <circle cx={220} cy={248} r={170}
                  fill="none" stroke={`${colors.oasis}20`} strokeWidth={2}
                  strokeDasharray="6 10" />

                {/* Crosshairs */}
                <line x1={220} y1={50}  x2={220} y2={445} stroke={`${colors.oasis}22`} strokeWidth={1.5} />
                <line x1={22}  y1={248} x2={418} y2={248} stroke={`${colors.oasis}22`} strokeWidth={1.5} />

                {/* Patient head */}
                <circle cx={220} cy={112} r={48}
                  fill={`${colors.arizonaBlue}22`} stroke={`${colors.oasis}66`} strokeWidth={4} />
                <circle cx={220} cy={112} r={29}
                  fill={`${colors.oasis}10`} stroke={`${colors.oasis}36`} strokeWidth={2} />

                {/* Patient torso */}
                <path d="M 158 166 Q 220 154 282 166 L 270 320 Q 220 334 170 320 Z"
                  fill={`${colors.oasis}0d`} stroke={`${colors.oasis}55`} strokeWidth={3.5} />

                {/* Arms */}
                <path d="M 160 178 Q 122 222 126 274 Q 130 304 146 316"
                  fill="none" stroke={`${colors.oasis}44`} strokeWidth={16} strokeLinecap="round" />
                <path d="M 280 178 Q 318 222 314 274 Q 310 304 294 316"
                  fill="none" stroke={`${colors.oasis}44`} strokeWidth={16} strokeLinecap="round" />

                {/* Legs */}
                <path d="M 176 320 Q 165 378 162 438" fill="none" stroke={`${colors.oasis}38`} strokeWidth={18} strokeLinecap="round" />
                <path d="M 264 320 Q 275 378 278 438" fill="none" stroke={`${colors.oasis}38`} strokeWidth={18} strokeLinecap="round" />

                {/* Monitor corner brackets */}
                {["M 30,90 L 30,30 L 90,30", "M 350,30 L 410,30 L 410,90",
                  "M 30,408 L 30,468 L 90,468", "M 350,468 L 410,468 L 410,408"].map((d, ci) => (
                  <path key={ci} d={d} fill="none"
                    stroke={`${colors.oasis}${Math.round(44 + simRingP * 40).toString(16).padStart(2, "0")}`}
                    strokeWidth={4} strokeLinecap="round" />
                ))}

                {/* Live center dot */}
                <circle cx={220} cy={248} r={9}
                  fill={colors.oasis} opacity={0.60 + 0.40 * simPulse}
                  style={{ filter: `drop-shadow(0 0 14px ${colors.oasis})` }} />
              </svg>
            </div>

            {/* Vital sign panels */}
            {VITALS.map((v, i) => (
              <div key={i} style={{
                position: "absolute", ...v.style,
                opacity: vitalOps[i],
                padding: "20px 28px",
                borderRadius: 16,
                background: `${v.color}12`,
                border: `2px solid ${v.color}45`,
                backdropFilter: "blur(12px)",
                minWidth: 210,
                boxShadow: `0 0 28px ${v.color}16`,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 18, letterSpacing: 2.5,
                  color: `${v.color}80`, textTransform: "uppercase", marginBottom: 10,
                }}>
                  {v.label}
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 52, fontWeight: 800, color: colors.white, lineHeight: 1,
                }}>
                  {v.value}
                  <span style={{ fontFamily: fonts.mono, fontSize: 20, color: `${v.color}70`, marginLeft: 10 }}>
                    {v.unit}
                  </span>
                </div>
              </div>
            ))}

            {/* Simulation active badge */}
            {simBadgeOp > 0.01 && (
              <div style={{
                position: "absolute", bottom: 78, left: "50%", transform: "translateX(-50%)",
                opacity: simBadgeOp,
                display: "flex", alignItems: "center", gap: 14,
                background: `${colors.oasis}12`,
                border: `1px solid ${colors.oasis}40`,
                borderRadius: 10, padding: "13px 26px",
                boxShadow: `0 0 28px ${colors.oasis}20`,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: colors.oasis,
                  boxShadow: `0 0 10px ${colors.oasis}`,
                  opacity: 0.68 + 0.32 * simPulse,
                }} />
                <span style={{
                  fontFamily: fonts.mono, fontSize: 24, fontWeight: 700,
                  color: colors.oasis, letterSpacing: 3, textTransform: "uppercase",
                }}>
                  Simulation Active
                </span>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BEAT 3 — EVALUATING STUDENTS  (f358–460)
            Score arc fills · competency bars animate · rubric checks
           ═══════════════════════════════════════════════════════════ */}
        {b3Op > 0.01 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, opacity: b3Op }}>

            {/* Beat label */}
            <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap" }}>
              <div style={{
                fontFamily: fonts.heading,
                fontSize: 96,
                fontWeight: 800,
                color: colors.white,
                lineHeight: 1,
                textShadow: `0 0 60px ${colors.vitalsNormal}40, 0 0 120px ${colors.vitalsNormal}15`,
              }}>
                Evaluating Students
              </div>
            </div>

            {/* Two-column layout */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "90px 5% 30px",
              gap: "3%",
            }}>
              {/* LEFT — Score arc */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, flexShrink: 0 }}>
                <div style={{ position: "relative", width: 280, height: 280 }}>
                  <svg width={280} height={280} style={{ position: "absolute", top: 0, left: 0 }}>
                    <circle cx={140} cy={140} r={120} fill="none" stroke={`${colors.white}10`} strokeWidth={20} />
                    <circle cx={140} cy={140} r={120}
                      fill="none" stroke={colors.vitalsNormal} strokeWidth={20}
                      strokeDasharray={SL} strokeDashoffset={scoreOff}
                      strokeLinecap="round" transform="rotate(-90 140 140)"
                      style={{ filter: `drop-shadow(0 0 16px ${colors.vitalsNormal}65)` }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 78, fontWeight: 800, color: colors.white, lineHeight: 1 }}>
                      {scoreVal}
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 16, color: `${colors.vitalsNormal}80`, marginTop: 6 }}>
                      / 100
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 20, color: colors.oasis, fontWeight: 600, letterSpacing: 1 }}>
                  Overall Score
                </div>
                {evalBadgeOp > 0.01 && (
                  <div style={{
                    opacity: evalBadgeOp,
                    display: "inline-flex", alignItems: "center", gap: 12,
                    background: `${colors.vitalsNormal}18`,
                    border: `2.5px solid ${colors.vitalsNormal}60`,
                    borderRadius: 12, padding: "14px 26px",
                    boxShadow: `0 0 32px ${colors.vitalsNormal}22`,
                  }}>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 24, fontWeight: 700,
                      color: colors.vitalsNormal, letterSpacing: 2.5, textTransform: "uppercase",
                    }}>
                      ✓ Evaluation Complete
                    </span>
                  </div>
                )}
              </div>

              {/* RIGHT — Competency bars + rubric */}
              <div style={{ flex: 1, maxWidth: 540 }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 20, letterSpacing: 3,
                  color: `${colors.white}60`, textTransform: "uppercase", marginBottom: 24,
                }}>
                  Competency Breakdown
                </div>
                {COMPS.map((c, i) => (
                  <CompBar key={i} label={c.label} fill={barFills[i]} color={c.color} opacity={barOps[i]} />
                ))}

                {rubricOp > 0.01 && (
                  <div style={{
                    marginTop: 22, opacity: rubricOp,
                    padding: "18px 22px", borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${colors.oasis}18`,
                  }}>
                    {CHECKS.map((row, ri) => (
                      <div key={ri} style={{
                        display: "flex", alignItems: "center", gap: 18,
                        marginBottom: ri < CHECKS.length - 1 ? 16 : 0,
                        opacity: checkOps[ri],
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                          background: `${colors.vitalsNormal}20`,
                          border: `2.5px solid ${colors.vitalsNormal}65`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: fonts.mono, fontSize: 15, fontWeight: 700, color: colors.vitalsNormal,
                        }}>✓</div>
                        <span style={{ fontFamily: fonts.body, fontSize: 20, color: "rgba(255,255,255,0.72)" }}>
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BEAT 4 — UNIFIED PLATFORM VIEW  (f450–535)
           ═══════════════════════════════════════════════════════════ */}
        {b4Op > 0.01 && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10, opacity: b4Op,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 18,
            transform: `scale(${b4Scale})`,
          }}>
            <div style={{
              fontFamily: fonts.heading,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: 2,
              color: `${colors.white}70`,
            }}>
              One Connected Platform
            </div>

            {/* Three pillar cards with connecting arrows */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 0, width: "100%", maxWidth: 1300,
            }}>
              {[
                {
                  label: "Building Cases", sub: "Case Creator",
                  color: colors.arizonaRed,
                  icon: (
                    <svg width={80} height={64} viewBox="0 0 80 64">
                      {[0, 1, 2].map(i => (
                        <rect key={i} x={6 + i * 4} y={4 + i * 4} width={52} height={38} rx={4}
                          fill={`${colors.arizonaRed}${i === 2 ? "2a" : i === 1 ? "14" : "08"}`}
                          stroke={`${colors.arizonaRed}${i === 2 ? "60" : "30"}`} strokeWidth={1.5} />
                      ))}
                      <rect x={18} y={50} width={40} height={3} rx={1.5} fill={`${colors.arizonaRed}55`} />
                      <rect x={18} y={56} width={28} height={2.5} rx={1} fill={`${colors.arizonaRed}35`} />
                    </svg>
                  ),
                },
                {
                  label: "Running Simulations", sub: "Virtual Patient",
                  color: colors.oasis,
                  icon: (
                    <svg width={80} height={64} viewBox="0 0 80 64">
                      <circle cx={40} cy={24} r={20} fill="none" stroke={`${colors.oasis}38`} strokeWidth={1.5} />
                      <circle cx={40} cy={24} r={20} fill="none" stroke={colors.oasis} strokeWidth={1.5}
                        strokeDasharray="28 98" strokeLinecap="round" />
                      <circle cx={40} cy={13} r={7} fill={`${colors.oasis}18`} stroke={`${colors.oasis}60`} strokeWidth={1.5} />
                      <path d="M 32 21 Q 40 18 48 21 L 46 44 Q 40 47 34 44 Z"
                        fill={`${colors.oasis}0e`} stroke={`${colors.oasis}42`} strokeWidth={1.2} />
                      <line x1={22} y1={52} x2={58} y2={52} stroke={`${colors.oasis}28`} strokeWidth={1} />
                      <line x1={18} y1={58} x2={62} y2={58} stroke={`${colors.oasis}18`} strokeWidth={1} />
                    </svg>
                  ),
                },
                {
                  label: "Evaluating Students", sub: "AIMS Reports",
                  color: colors.vitalsNormal,
                  icon: (
                    <svg width={80} height={64} viewBox="0 0 80 64">
                      <circle cx={40} cy={30} r={24} fill="none" stroke={`${colors.vitalsNormal}18`} strokeWidth={7} />
                      <circle cx={40} cy={30} r={24} fill="none" stroke={colors.vitalsNormal} strokeWidth={7}
                        strokeDasharray={`${0.87 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                        strokeLinecap="round" transform="rotate(-90 40 30)"
                        style={{ filter: `drop-shadow(0 0 5px ${colors.vitalsNormal}65)` }} />
                      <text x={40} y={35} textAnchor="middle"
                        fontFamily={fonts.heading} fontSize={15} fontWeight={800} fill={colors.vitalsNormal}>
                        87
                      </text>
                      <line x1={14} y1={58} x2={66} y2={58} stroke={`${colors.vitalsNormal}22`} strokeWidth={1} />
                    </svg>
                  ),
                },
              ].map((p, i) => (
                <React.Fragment key={p.label}>
                  {i > 0 && (
                    <div style={{
                      width: 64, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: arrowOp, marginBottom: 16,
                    }}>
                      <svg width={40} height={20} viewBox="0 0 40 20">
                        <path d="M 2,10 L 32,10 M 26,4 L 34,10 L 26,16"
                          fill="none" stroke={`${colors.oasis}70`} strokeWidth={3.5}
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div style={{
                    opacity: cardEnters[i],
                    transform: `translateY(${interpolate(cardEnters[i], [0, 1], [22, 0])}px)`,
                    width: 290, flexShrink: 0,
                  }}>
                    <div style={{
                      padding: "30px 26px",
                      background: "rgba(5,10,34,0.92)",
                      backdropFilter: "blur(20px)",
                      borderRadius: 18,
                      border: `1.5px solid ${p.color}38`,
                      borderTop: `3px solid ${p.color}`,
                      boxShadow: `0 0 44px ${p.color}16, 0 18px 52px rgba(0,0,0,0.48)`,
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 16, textAlign: "center",
                    }}>
                      {p.icon}
                      <div>
                        <div style={{
                          fontFamily: fonts.heading, fontSize: 30, fontWeight: 800,
                          color: colors.white, marginBottom: 10,
                        }}>
                          {p.label}
                        </div>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 16, color: p.color,
                          letterSpacing: 2.5, textTransform: "uppercase",
                        }}>
                          {p.sub}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div style={{
              fontFamily: fonts.mono, fontSize: 22, letterSpacing: 5,
              color: `${colors.oasis}65`, textTransform: "uppercase",
            }}>
              AI Medical Mentoring System
            </div>
          </div>
        )}

        {/* ── bottom ticker ── */}
        <div style={{
          position: "absolute", bottom: 20, left: 0, right: 0,
          height: 24, overflow: "hidden", opacity: tickOp,
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, whiteSpace: "nowrap",
            transform: `translateX(${tickX}px)`,
            fontFamily: fonts.mono, fontSize: 12, color: colors.oasis,
            letterSpacing: 2, lineHeight: "24px",
          }}>
            {tickStr}{tickStr}
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
