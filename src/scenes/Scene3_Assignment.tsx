import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { DataStream } from "../three/DataStream";
import { CameraRig } from "../three/CameraRig";
import { colors, fonts } from "../theme";

/* ══════════════════════════════════════════════════════════════════════
   SVG ICON PRIMITIVES
   ══════════════════════════════════════════════════════════════════════ */

const PersonIcon: React.FC<{ color: string; size: number; opacity?: number }> = ({
  color, size, opacity = 1,
}) => {
  const r = size * 0.28, cx = size * 0.5, headY = r;
  const bodyTop = headY + r + size * 0.05;
  const bodyW = size * 0.72, bodyH = size * 0.52, bodyR = bodyW / 2;
  return (
    <svg width={size} height={Math.round(size * 1.22)}
      viewBox={`0 0 ${size} ${Math.round(size * 1.22)}`}
      style={{ display: "block", flexShrink: 0, opacity }}>
      <circle cx={cx} cy={headY} r={r} fill={color} />
      <path
        d={`M ${cx},${bodyTop} C ${cx - bodyR * 1.1},${bodyTop} ${cx - bodyR * 1.2},${bodyTop + bodyH * 0.5} ${cx - bodyR},${bodyTop + bodyH} L ${cx + bodyR},${bodyTop + bodyH} C ${cx + bodyR * 1.2},${bodyTop + bodyH * 0.5} ${cx + bodyR * 1.1},${bodyTop} ${cx},${bodyTop} Z`}
        fill={color}
      />
    </svg>
  );
};

const DocumentIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const w = size * 0.76, h = size, fold = size * 0.22;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display: "block" }}>
      <path d={`M 0,0 L ${w - fold},0 L ${w},${fold} L ${w},${h} L 0,${h} Z`}
        fill={`${color}18`} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M ${w - fold},0 L ${w - fold},${fold} L ${w},${fold}`}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity={0.6} />
      {[0, 1, 2].map(i => (
        <rect key={i} x={w * 0.15} y={h * 0.35 + i * h * 0.14}
          width={w * (0.68 - i * 0.14)} height={h * 0.06} rx={h * 0.03}
          fill={color} opacity={1 - i * 0.2} />
      ))}
    </svg>
  );
};

const GroupIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: Math.round(size * 0.06), height: size * 1.22 }}>
    <PersonIcon color={`${color}50`} size={Math.round(size * 0.72)} />
    <PersonIcon color={color}        size={size} />
    <PersonIcon color={`${color}50`} size={Math.round(size * 0.72)} />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════════════ */
const CLASSES = [
  { name: "MED 501", label: "Clinical Skills",  students: 24, color: colors.azurite },
  { name: "MED 602", label: "Diagnostics Lab",  students: 18, color: colors.oasis   },
  { name: "MED 410", label: "Foundations",      students: 32, color: "#a855f7"       },
];

const ROWS = 2, COLS = 5, ICON_S = 50, ICON_GAP = 10;
const SHOWN = ROWS * COLS; // 10 per class

/* ══════════════════════════════════════════════════════════════════════
   LAYOUT GEOMETRY — balanced 3-column grid  (1920×1080)
   ══════════════════════════════════════════════════════════════════════ */
const CASE_L = 245, CASE_W = 340, CASE_T = 340, CASE_H = 400;
const CLS_L  = 805, CLS_W  = 360, CLS_H  = 140, CLS_GAP = 65;
const CLS_TOPS = [-1, 0, 1].map(i => 540 - Math.floor(CLS_H / 2) + i * (CLS_H + CLS_GAP));
const GRP_L   = 1385;

const CASE_RIGHT = CASE_L + CASE_W;
const CASE_MID_Y = CASE_T + Math.floor(CASE_H / 2);
const SPINE_X    = Math.round((CASE_RIGHT + CLS_L) / 2);
const CLS_MID_YS = CLS_TOPS.map(t => t + Math.floor(CLS_H / 2));
const CLS_RIGHT  = CLS_L + CLS_W;

const L_MAIN   = SPINE_X - CASE_RIGHT;
const L_SPINE  = CLS_MID_YS[2] - CLS_MID_YS[0];
const L_BRANCH = CLS_L - SPINE_X;
const GRID_W   = COLS * ICON_S + (COLS - 1) * ICON_GAP;
const L_CG     = GRP_L - CLS_RIGHT;

/* ══════════════════════════════════════════════════════════════════════
   NARRATION-DRIVEN PHASE TIMING  (30fps · audio ~21.7s → ~661 frames)

   Narration sequence:
   INTRO    f 65– 98   "assign cases through the dashboard" — brief overview
   P1_CLS   f 95–188   "select a class"         — class column spotlight
   P2_STU   f182–278   "choose students"         — student column spotlight
   P3_CASE  f272–372   "pick a case"             — case column spotlight
   P4_DUE   f368–492   "set a due date"          — calendar overlay
   P5_ASGN  f488–558   "assign"                  — connections draw + badges
   P6_PORT  f553–625   "assignments reach students instantly" — portal overlay
   P7_SW    f615–655   "in less than a minute"   — stopwatch overlay
   ══════════════════════════════════════════════════════════════════════ */
const INTRO_S = 65;
const P1S = 95,  P1E = 188;   // class focus
const P2S = 182, P2E = 278;   // student focus
const P3S = 272, P3E = 372;   // case focus
const P4S = 368, P4E = 492;   // due date + calendar overlay
const P5S = 488, P5E = 558;   // assign action
const P6S = 553, P6E = 625;   // student portal overlay
const P7S = 615, P7E = 655;   // stopwatch overlay

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export const Scene3_Assignment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp  = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeIO = { easing: Easing.inOut(Easing.ease), ...clamp };
  const easeOut = Easing.out(Easing.ease);

  /* ── Overall wrapper fade ── */
  const wrapOp = interpolate(frame, [INTRO_S, INTRO_S + 18, P7E, P7E + 18], [0, 1, 1, 0], clamp);

  /* ────────────────────────────────────────────────────────────────────
     SPOTLIGHT SYSTEM — one column lit at a time, driven by narration

     Order: overview → CLASSES → STUDENTS → CASE → calendar → ASSIGN → portal → SW
     ──────────────────────────────────────────────────────────────────── */

  // CASE: dim during overview/class/student beats, spotlight at P3_CASE
  const caseColOp = interpolate(frame,
    [INTRO_S, INTRO_S + 20,  P1S + 20,   P3S, P3S + 22,  P4S + 16,  P5S, P5S + 22,  P6S + 10, P7E],
    [0,       0.36,           0.18,      0.18, 1.0,        0.38,     0.38, 1.0,        0.22,    0.18],
    easeIO
  );

  // CLASSES: spotlight at P1_CLS, dim otherwise
  const classColOp = interpolate(frame,
    [INTRO_S, INTRO_S + 20,  P1S, P1S + 22,  P2S + 16,  P3S + 16,  P4S + 16,  P5S, P5S + 22,  P6S + 10, P7E],
    [0,       0.36,          0.36, 1.0,        0.28,      0.18,      0.38,     0.38, 1.0,        0.22,    0.18],
    easeIO
  );

  // STUDENTS: invisible until P2_STU where it spotlights
  const studentColOp = interpolate(frame,
    [P2S, P2S + 22,  P3S + 16,  P4S + 16,  P5S, P5S + 22,  P6S + 10, P7E],
    [0,   1.0,        0.28,      0.38,     0.38, 1.0,        0.22,    0.18],
    easeIO
  );

  /* ────────────────────────────────────────────────────────────────────
     VIEWPORT PAN — nudge viewport toward the active column
     Students (right side) → pan left  |  Case (left side) → pan right
     ──────────────────────────────────────────────────────────────────── */
  const viewPanX = interpolate(frame,
    [INTRO_S + 20,  P2S, P2S + 22,  P3S, P3S + 22,  P4S + 16, P5E],
    [0,              0,   -20,       -20,  22,          0,       0],
    easeIO
  );
  const viewScale = interpolate(frame,
    [INTRO_S, INTRO_S + 20,  P5S, P5S + 22],
    [0.97,    1.02,           1.02, 1.0],
    easeIO
  );

  /* ── Case node spring entrance — visible from INTRO ── */
  const caseSp    = spring({ frame: frame - INTRO_S, fps, config: { damping: 20, stiffness: 90, mass: 1.0 } });
  const caseScale = interpolate(caseSp, [0, 1], [0.84, 1], { extrapolateRight: "clamp" as const });
  const caseGlow  = frame >= P3S ? 0.28 + 0.14 * Math.sin((frame - P3S) * 0.07) : 0;

  /* ── Class card springs — enter at P1S (narration: "select a class") ── */
  const classSprings = [0, 1, 2].map(i =>
    spring({ frame: frame - (P1S + i * 18), fps, config: { damping: 22, stiffness: 108, mass: 0.88 } })
  );

  /* ── Connection lines — ALL draw together during P5_ASGN ("assign") ── */
  const linesDraw = interpolate(frame, [P5S, P5S + 55], [0, 1], clamp);
  const pHoriz  = Math.min(1, linesDraw / 0.28);
  const pSpine  = Math.max(0, Math.min(1, (linesDraw - 0.24) / 0.38));
  const pBranch = Math.max(0, Math.min(1, (linesDraw - 0.58) / 0.42));

  // Class → student grid lines (draw after branches)
  const linesB = [0, 1, 2].map(i =>
    interpolate(frame, [P5S + 28 + i * 10, P5S + 58 + i * 10], [0, 1], clamp)
  );

  // Line opacity: appear at P5S, dim with overlays
  const lineAOp = interpolate(frame, [P5S, P5S + 22,  P6S + 10, P7E], [0, 1, 0.26, 0.18], clamp);
  const lineBOp = lineAOp;

  /* ── Student icon springs — enter at P2S (narration: "choose students") ── */
  const sSprings = [0, 1, 2].map(ci =>
    Array.from({ length: SHOWN }, (_, si) =>
      spring({
        frame: frame - (P2S + ci * 16 + si * 4),
        fps, config: { damping: 26, stiffness: 130, mass: 0.7 },
      })
    )
  );

  /* ── Column label opacities (match their column spotlight) ── */
  const caseLabelOp    = caseColOp;
  const classLabelOp   = classColOp;
  const studentLabelOp = studentColOp;

  // Glow pulse — brief accent when each column first reaches full brightness
  const caseGlowPulse    = interpolate(frame, [P3S + 22, P3S + 50,  P3E - 20, P3E],  [0, 1, 1, 0], clamp);
  const classGlowPulse   = interpolate(frame, [P1S + 22, P1S + 50,  P1E - 20, P1E],  [0, 1, 1, 0], clamp);
  const studentGlowPulse = interpolate(frame, [P2S + 22, P2S + 50,  P2E - 20, P2E],  [0, 1, 1, 0], clamp);

  /* ── Assigned badges — staggered during P5_ASGN ── */
  const assignedOps = [0, 1, 2].map(i =>
    interpolate(frame, [P5S + 20 + i * 18, P5S + 36 + i * 18], [0, 1], clamp)
  );

  /* ── Bottom caption ── */
  const captionOp   = interpolate(frame, [P5S + 22, P5S + 42,  P7E - 14, P7E], [0, 1, 1, 0], clamp);
  const confirmedOp = interpolate(frame, [P5S + 40, P5S + 60], [0, 1], clamp);

  /* ════════════════════════════════════════════════════════════════════
     OVERLAY TIMINGS — each tied directly to a narration phrase
     ════════════════════════════════════════════════════════════════════ */

  // OVERLAY 1: Calendar — "set a due date" (P4_DUE)
  const calOp      = interpolate(frame, [P4S + 20, P4S + 38,  P4E - 16, P4E + 8],  [0, 1, 1, 0], clamp);
  const calSlideY  = interpolate(frame, [P4S + 20, P4S + 38],  [18, 0], { ...clamp, easing: easeOut });
  const calDatePop = interpolate(frame, [P4S + 42, P4S + 58],  [0.72, 1.0], { ...clamp, easing: easeOut });
  const calScale   = interpolate(frame, [P4S + 20, P4S + 38],  [0.96, 1.0], { ...clamp, easing: easeOut });

  // OVERLAY 2: Student portal — "assignments reach students instantly" (P6_PORT)
  const studentCardOp    = interpolate(frame, [P6S + 10, P6S + 26,  P6E - 12, P6E + 8], [0, 1, 1, 0], clamp);
  const studentCardY     = interpolate(frame, [P6S + 10, P6S + 26],  [14, 0], { ...clamp, easing: easeOut });
  const studentCardScale = interpolate(frame, [P6S + 10, P6S + 26],  [0.96, 1.0], { ...clamp, easing: easeOut });

  // OVERLAY 3: Stopwatch — "in less than a minute" (P7_SW)
  const swOp      = interpolate(frame, [P7S + 8,  P7S + 22,  P7E - 10, P7E],  [0, 1, 1, 0], clamp);
  const sweepProg = interpolate(frame, [P7S + 22, P7E - 12],  [0, 0.82], clamp);
  const swScale   = interpolate(frame, [P7S + 8,  P7S + 22],  [0.96, 1.0], { ...clamp, easing: easeOut });

  // Stopwatch geometry — 400×400 SVG, ring r=158, hand length=140
  const SW_R      = 158;
  const SW_CIRCUM = 2 * Math.PI * SW_R;
  const swDashOff = SW_CIRCUM * (1 - sweepProg);
  const swHandAngle = (sweepProg * 360 - 90) * (Math.PI / 180);
  const swHX = 200 + 140 * Math.cos(swHandAngle);
  const swHY = 200 + 140 * Math.sin(swHandAngle);

  // Base dim — overlays provide their own radial gradient; this deepens depth
  const overlayDim = Math.max(calOp, studentCardOp, swOp) * 0.45;

  /* ── 3D Background ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.05} />
      <ParticleField count={32} color={colors.oasis} speed={0.0015} opacity={0.08} />
      <GlowOrb position={[0, 0, -3]} color={colors.azurite} radius={3} baseOpacity={0.06} />
      <DataStream direction="right" position={[-5, 0, -2]} color={colors.oasis} opacity={0.07} length={10} speed={0.03} />
      <CameraRig positions={[
        { frame: 0,   position: [0, 0, 10] },
        { frame: 200, position: [0, 0, 9]  },
        { frame: 660, position: [0, 0, 9]  },
      ]} />
    </>
  );

  return (
    <SceneShell
      interstitial={{ step: 2, title: "Assign", subtitle: "Faculty to Student" }}
      sectionLabel="Assignment Pipeline"
      threeContent={threeContent}
    >
      {/* Viewport pan + scale wrapper */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: wrapOp, pointerEvents: "none",
        transform: `translateX(${viewPanX}px) scale(${viewScale})`,
        transformOrigin: "960px 540px",
      }}>

        {/* ══════════════════════════════════════════════════════════
            SVG CONNECTION LINES
            Lines are INVISIBLE until P5_ASGN ("assign") — they draw
            all at once to confirm the assignment action visually.
           ══════════════════════════════════════════════════════════ */}
        <svg width={1920} height={1080} viewBox="0 0 1920 1080"
          style={{ position: "absolute", inset: 0, zIndex: 5 }}>
          {/* Case → spine horizontal */}
          <path d={`M ${CASE_RIGHT},${CASE_MID_Y} H ${SPINE_X}`}
            fill="none" stroke={`${colors.oasis}80`} strokeWidth={3}
            strokeDasharray={L_MAIN} strokeDashoffset={L_MAIN * (1 - pHoriz)}
            strokeLinecap="round" opacity={Math.min(lineAOp, 1)} />
          {/* Vertical spine */}
          <path d={`M ${SPINE_X},${CLS_MID_YS[0]} V ${CLS_MID_YS[2]}`}
            fill="none" stroke={`${colors.oasis}35`} strokeWidth={2}
            strokeDasharray={L_SPINE} strokeDashoffset={L_SPINE * (1 - pSpine)}
            strokeLinecap="round" opacity={Math.min(lineAOp, 1)} />
          {/* Branch lines: spine → classes */}
          {[0, 1, 2].map(i => (
            <path key={`ba-${i}`}
              d={`M ${SPINE_X},${CLS_MID_YS[i]} H ${CLS_L}`}
              fill="none" stroke={`${CLASSES[i].color}80`} strokeWidth={3}
              strokeDasharray={L_BRANCH} strokeDashoffset={L_BRANCH * (1 - pBranch)}
              strokeLinecap="round" opacity={Math.min(lineAOp, 1)} />
          ))}
          {/* Junction dots on spine */}
          {[0, 1, 2].map(i => (
            <circle key={`jd-${i}`}
              cx={SPINE_X} cy={CLS_MID_YS[i]} r={6}
              fill={CLASSES[i].color} opacity={pBranch * Math.min(lineAOp, 0.9)} />
          ))}
          {/* Class → student grid lines */}
          {[0, 1, 2].map(i => (
            <path key={`cg-${i}`}
              d={`M ${CLS_RIGHT},${CLS_MID_YS[i]} H ${GRP_L}`}
              fill="none" stroke={`${CLASSES[i].color}70`} strokeWidth={3}
              strokeDasharray={L_CG} strokeDashoffset={L_CG * (1 - linesB[i])}
              strokeLinecap="round" opacity={Math.min(lineBOp, 1)} />
          ))}
          {/* Entry dots at student grids */}
          {[0, 1, 2].map(i => (
            <circle key={`gd-${i}`}
              cx={GRP_L} cy={CLS_MID_YS[i]} r={6}
              fill={CLASSES[i].color} opacity={linesB[i] * Math.min(lineBOp, 0.9)} />
          ))}
        </svg>

        {/* ══════════════════════════════════════════════════════════
            COLUMN LABELS — spotlit with their respective column
           ══════════════════════════════════════════════════════════ */}
        {[
          { label: "CASE",     cx: CASE_L + CASE_W / 2,   color: colors.arizonaRed, op: caseLabelOp,    glow: caseGlowPulse    },
          { label: "CLASSES",  cx: CLS_L  + CLS_W  / 2,   color: colors.azurite,    op: classLabelOp,   glow: classGlowPulse   },
          { label: "STUDENTS", cx: GRP_L  + GRID_W  / 2,  color: colors.oasis,      op: studentLabelOp, glow: studentGlowPulse },
        ].map(col => (
          <div key={col.label} style={{
            position: "absolute",
            left: col.cx - 90, top: 218,
            width: 180, textAlign: "center" as const,
            fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
            color: col.color, letterSpacing: 4,
            opacity: col.op, zIndex: 12,
            textShadow: col.glow > 0
              ? `0 0 20px ${col.color}${Math.round(col.glow * 75).toString(16).padStart(2, "00")}`
              : "none",
          }}>{col.label}</div>
        ))}

        {/* ══════════════════════════════════════════════════════════
            LEFT — Case Node
            Visible at low opacity from INTRO; spotlit at P3_CASE.
           ══════════════════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", left: CASE_L, top: CASE_T,
          width: CASE_W, height: CASE_H,
          opacity: caseColOp,
          transform: `scale(${caseScale})`,
          transformOrigin: "center center", zIndex: 10,
        }}>
          <div style={{
            height: "100%",
            background: "rgba(8, 16, 42, 0.92)",
            backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
            borderRadius: 22,
            border: `2px solid ${colors.arizonaRed}${Math.round(Math.max(caseColOp, 0.4) * 90).toString(16).padStart(2, "00")}`,
            boxShadow: `
              0 0 70px ${colors.arizonaRed}${Math.round(caseGlow * caseColOp * 80).toString(16).padStart(2, "00")},
              0 12px 48px rgba(0,0,0,0.55)
            `,
            padding: "30px 26px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
          }}>
            <DocumentIcon color={colors.arizonaRed} size={120} />
            <div style={{
              fontFamily: fonts.heading, fontSize: 28, fontWeight: 800,
              color: colors.white, textAlign: "center" as const, lineHeight: 1.25,
            }}>
              Pneumonia<br />Case — Adult
            </div>
            <div style={{ height: 1, width: "80%", background: `${colors.white}10` }} />
            <div style={{ display: "flex", gap: 22 }}>
              {[{ v: "8", k: "Sections" }, { v: "3", k: "Classes" }, { v: "74", k: "Students" }].map(s => (
                <div key={s.k} style={{ textAlign: "center" as const }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 28, fontWeight: 800, color: colors.arizonaRed, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}50`, marginTop: 3 }}>{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MIDDLE — Three Class Cards
            Enter at P1S ("select a class"), dim/restore around focus.
           ══════════════════════════════════════════════════════════ */}
        {CLASSES.map((cls, i) => {
          const sp         = classSprings[i];
          const spOp       = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
          const spSc       = interpolate(sp, [0, 1], [0.84, 1], { extrapolateRight: "clamp" as const });
          const assignedOp = assignedOps[i];

          return (
            <div key={cls.name} style={{
              position: "absolute", left: CLS_L, top: CLS_TOPS[i],
              width: CLS_W, height: CLS_H,
              opacity: spOp * classColOp,
              transform: `scale(${spSc})`,
              transformOrigin: "left center", zIndex: 10,
            }}>
              <div style={{
                height: "100%",
                background: "rgba(8, 16, 42, 0.88)",
                backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                borderRadius: 18,
                border: `2px solid ${cls.color}${classColOp > 0.7 ? "45" : "20"}`,
                boxShadow: classColOp > 0.7 ? `0 6px 28px rgba(0,0,0,0.38), 0 0 24px ${cls.color}12` : "none",
                padding: "14px 22px",
                display: "flex", alignItems: "center", gap: 20,
                position: "relative",
              }}>
                <GroupIcon color={cls.color} size={50} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 800, color: colors.white, lineHeight: 1 }}>
                    {cls.name}
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 14, color: cls.color, marginTop: 3 }}>
                    {cls.label}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 22, fontWeight: 800, color: cls.color, marginTop: 6 }}>
                    {cls.students} students
                  </div>
                </div>

                {/* Assigned badge — appears staggered during P5_ASGN */}
                {assignedOp > 0 && (
                  <div style={{
                    position: "absolute", top: 10, right: 14,
                    fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                    color: colors.vitalsNormal, background: `${colors.vitalsNormal}18`,
                    border: `1px solid ${colors.vitalsNormal}40`,
                    padding: "3px 10px", borderRadius: 20,
                    opacity: assignedOp, letterSpacing: 1,
                  }}>
                    ✓ Assigned
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ══════════════════════════════════════════════════════════
            RIGHT — Student Icon Grids
            Enter at P2S ("choose students"), stay through P5+.
           ══════════════════════════════════════════════════════════ */}
        {CLASSES.map((cls, ci) => {
          const gridH  = ROWS * Math.round(ICON_S * 1.22) + (ROWS - 1) * ICON_GAP;
          const pillH  = 36;
          const totalH = gridH + 12 + pillH;
          const topY   = CLS_MID_YS[ci] - Math.floor(totalH / 2);
          const overflow = cls.students - SHOWN;

          return (
            <div key={`grp-${ci}`} style={{
              position: "absolute", left: GRP_L, top: topY, width: GRID_W,
              opacity: studentColOp, zIndex: 10,
            }}>
              {/* 2 rows × 5 icons */}
              <div style={{ display: "flex", flexDirection: "column", gap: ICON_GAP }}>
                {[0, 1].map(row => (
                  <div key={row} style={{ display: "flex", gap: ICON_GAP }}>
                    {[0, 1, 2, 3, 4].map(col => {
                      const si = row * COLS + col;
                      const sp = sSprings[ci][si];
                      const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
                      const sc = interpolate(sp, [0, 1], [0.35, 1], { extrapolateRight: "clamp" as const });
                      return (
                        <div key={si} style={{ opacity: op, transform: `scale(${sc})`, transformOrigin: "bottom center" }}>
                          <PersonIcon color={cls.color} size={ICON_S} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Overflow badge */}
              {overflow > 0 && (
                <div style={{
                  marginTop: 12,
                  opacity: interpolate(frame, [P2S + 28 + ci * 18, P2S + 46 + ci * 18], [0, 1], clamp),
                }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    fontFamily: fonts.mono, fontSize: 14, fontWeight: 700,
                    color: cls.color, background: `${cls.color}14`,
                    border: `1.5px solid ${cls.color}38`,
                    padding: "6px 18px", borderRadius: 20,
                  }}>
                    + {overflow} more
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ══════════════════════════════════════════════════════════
            FOCUS LABELS — appear only when their column is spotlit
           ══════════════════════════════════════════════════════════ */}

        {/* "Origin Case" — during P3_CASE */}
        {caseGlowPulse > 0 && (
          <div style={{
            position: "absolute",
            left: CASE_L + CASE_W / 2 - 120, top: CASE_T + CASE_H + 16,
            width: 240, textAlign: "center" as const,
            opacity: caseGlowPulse, zIndex: 12,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 12, color: `${colors.arizonaRed}80`,
              letterSpacing: 2.2, textTransform: "uppercase" as const,
            }}>
              Origin Case
            </div>
          </div>
        )}

        {/* "Assigned to 3 Classes" — during P1_CLS */}
        {classGlowPulse > 0 && (
          <div style={{
            position: "absolute",
            left: CLS_L + CLS_W / 2 - 100, top: CLS_TOPS[2] + CLS_H + 16,
            width: 200, textAlign: "center" as const,
            opacity: classGlowPulse, zIndex: 12,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 12, color: `${colors.azurite}80`,
              letterSpacing: 2.2, textTransform: "uppercase" as const,
            }}>
              Assigned to 3 Classes
            </div>
          </div>
        )}

        {/* "74 Students Reached" — during P2_STU */}
        {studentGlowPulse > 0 && (
          <div style={{
            position: "absolute",
            left: GRP_L + GRID_W / 2 - 110, top: CLS_TOPS[2] + CLS_H + 60,
            width: 220, textAlign: "center" as const,
            opacity: studentGlowPulse, zIndex: 12,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 12, color: `${colors.oasis}80`,
              letterSpacing: 2.2, textTransform: "uppercase" as const,
            }}>
              74 Students Reached
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            BOTTOM CAPTION
           ══════════════════════════════════════════════════════════ */}
        <div style={{
          position: "absolute", left: "50%", bottom: 40,
          transform: "translateX(-50%)",
          textAlign: "center" as const,
          opacity: captionOp, zIndex: 12,
        }}>
          {confirmedOp > 0 ? (
            <div style={{
              fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
              color: colors.vitalsNormal, letterSpacing: 2,
              textTransform: "uppercase" as const,
              opacity: confirmedOp,
              textShadow: `0 0 18px ${colors.vitalsNormal}55`,
            }}>
              Distributed · 74 Students · 3 Classes · Access Granted
            </div>
          ) : (
            <div style={{
              fontFamily: fonts.body, fontSize: 14,
              color: `${colors.white}38`,
              letterSpacing: 2, textTransform: "uppercase" as const,
            }}>
              Scales case distribution across learners
            </div>
          )}
        </div>

      </div>

      {/* ── Base dim layer — smooth depth ramp under each overlay ── */}
      {overlayDim > 0.005 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(2,6,22,1)",
          opacity: overlayDim,
          pointerEvents: "none",
          zIndex: 19,
        }} />
      )}

      {/* ════════════════════════════════════════════════════════════════
          OVERLAY 1 — LARGE CALENDAR  "Set a due date"  (P4_DUE)
          Triggered by narration: appears immediately when "due date" is spoken.
         ════════════════════════════════════════════════════════════════ */}
      {calOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 25, pointerEvents: "none",
          opacity: calOp,
        }}>
          {/* Radial gradient background — dark center, transparent edges */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 78% 72% at 50% 50%, rgba(2,6,22,0.88) 0%, rgba(2,6,22,0.52) 62%, transparent 100%)`,
          }} />

          {/* Calendar content — 960px wide, centered */}
          <div style={{
            position: "relative",
            width: 960,
            transform: `scale(${calScale}) translateY(${calSlideY}px)`,
            transformOrigin: "center center",
          }}>
            {/* Month header row */}
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", marginBottom: 28,
            }}>
              <div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3.5,
                  color: `${colors.oasis}70`, textTransform: "uppercase" as const,
                  marginBottom: 10,
                }}>
                  Due Date Configuration
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 52, fontWeight: 800,
                  color: colors.white, lineHeight: 1,
                }}>
                  November 2025
                </div>
              </div>

              {/* Selected-date callout */}
              <div style={{
                background: `${colors.oasis}18`,
                border: `1.5px solid ${colors.oasis}55`,
                borderRadius: 14, padding: "18px 28px",
                textAlign: "center" as const,
                boxShadow: `0 0 40px ${colors.oasis}20`,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, color: `${colors.oasis}70`,
                  letterSpacing: 3, marginBottom: 6,
                  textTransform: "uppercase" as const,
                }}>
                  Selected
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 48, fontWeight: 900,
                  color: colors.oasis, lineHeight: 1,
                }}>
                  21
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 12,
                  color: `${colors.white}45`, marginTop: 6,
                }}>
                  Friday
                </div>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
              gap: 10, marginBottom: 12,
              paddingBottom: 14, borderBottom: `1px solid ${colors.white}08`,
            }}>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} style={{
                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 600,
                  color: `${colors.white}32`, textAlign: "center" as const,
                  letterSpacing: 1,
                }}>{d}</div>
              ))}
            </div>

            {/* Date grid — Nov 2025: starts Saturday → 5 null pads */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {[
                null,null,null,null,null,1,2,
                3,4,5,6,7,8,9,
                10,11,12,13,14,15,16,
                17,18,19,20,21,22,23,
                24,25,26,27,28,29,30,
              ].map((d, i) => {
                const isSelected = d === 21;
                const isToday    = d === 14;
                const isPast     = d !== null && d < 14;
                return (
                  <div key={i} style={{
                    height: 72,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: isSelected ? fonts.heading : fonts.mono,
                    fontSize: isSelected ? 30 : 19,
                    fontWeight: isSelected ? 900 : isPast ? 300 : 500,
                    color: isSelected
                      ? colors.midnight
                      : isPast
                        ? `${colors.white}14`
                        : isToday
                          ? `${colors.white}85`
                          : `${colors.white}52`,
                    background: isSelected
                      ? colors.oasis
                      : isToday
                        ? `${colors.white}07`
                        : "transparent",
                    borderRadius: 12,
                    transform: isSelected ? `scale(${calDatePop})` : "scale(1)",
                    boxShadow: isSelected
                      ? `0 0 40px ${colors.oasis}70, 0 6px 20px rgba(0,0,0,0.4)`
                      : "none",
                    border: isToday && !isSelected
                      ? `1px solid ${colors.white}14`
                      : "none",
                  }}>
                    {d ?? ""}
                  </div>
                );
              })}
            </div>

            {/* Footer: assignment confirmation */}
            <div style={{
              marginTop: 28, paddingTop: 22,
              borderTop: `1px solid ${colors.oasis}16`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}32`,
                  letterSpacing: 2.5, marginBottom: 5,
                  textTransform: "uppercase" as const,
                }}>
                  Assignment
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white,
                }}>
                  Pneumonia — Adult · 3 Classes · 74 Students
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: `${colors.vitalsNormal}14`,
                border: `1px solid ${colors.vitalsNormal}42`,
                borderRadius: 10, padding: "14px 22px",
              }}>
                <div style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: colors.vitalsNormal,
                  boxShadow: `0 0 14px ${colors.vitalsNormal}90`,
                }} />
                <div style={{
                  fontFamily: fonts.heading, fontSize: 20, fontWeight: 700,
                  color: colors.vitalsNormal,
                }}>
                  Due Nov 21, 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          OVERLAY 2 — LARGE STUDENT PORTAL  "Students receive access"  (P6_PORT)
          Triggered by narration: "assignments reach students instantly"
         ════════════════════════════════════════════════════════════════ */}
      {studentCardOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 25, pointerEvents: "none",
          opacity: studentCardOp,
        }}>
          {/* Radial gradient background */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 85% 78% at 50% 52%, rgba(2,6,22,0.92) 0%, rgba(2,6,22,0.58) 65%, transparent 100%)`,
          }} />

          {/* Main portal panel — 1200px wide */}
          <div style={{
            position: "relative",
            width: 1200,
            display: "flex",
            transform: `scale(${studentCardScale}) translateY(${studentCardY}px)`,
            transformOrigin: "center center",
            border: `1px solid ${colors.oasis}22`,
            borderRadius: 18,
            overflow: "hidden",
            background: "rgba(4, 10, 34, 0.78)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            boxShadow: `0 50px 140px rgba(0,0,0,0.65), 0 0 80px ${colors.oasis}06`,
          }}>
            {/* ── Left sidebar ── */}
            <div style={{
              width: 310,
              borderRight: `1px solid ${colors.oasis}15`,
              padding: "36px 30px",
              display: "flex", flexDirection: "column" as const, gap: 22,
              background: "rgba(0,0,0,0.18)",
            }}>
              {/* Status badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: `${colors.vitalsNormal}14`,
                border: `1px solid ${colors.vitalsNormal}38`,
                borderRadius: 8, padding: "11px 16px",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: colors.vitalsNormal,
                  boxShadow: `0 0 12px ${colors.vitalsNormal}90`,
                }} />
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10,
                  color: colors.vitalsNormal, letterSpacing: 2.5,
                  textTransform: "uppercase" as const,
                }}>
                  New Assignment
                </div>
              </div>

              {/* Case document icon + title */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "center", gap: 16 }}>
                <svg width={72} height={88} viewBox="0 0 72 88" fill="none">
                  <path d={`M 0,0 L 52,0 L 72,20 L 72,88 L 0,88 Z`}
                    fill={`${colors.azurite}20`} stroke={`${colors.azurite}75`}
                    strokeWidth="2" strokeLinejoin="round" />
                  <path d={`M 52,0 L 52,20 L 72,20`}
                    fill="none" stroke={`${colors.azurite}45`}
                    strokeWidth="1.5" strokeLinejoin="round" />
                  {[0,1,2,3].map(i => (
                    <rect key={i} x={10} y={30+i*13} width={38-i*8} height={6}
                      rx={3} fill={colors.azurite}
                      opacity={0.75 - i * 0.15} />
                  ))}
                </svg>

                <div style={{
                  fontFamily: fonts.heading, fontSize: 30, fontWeight: 800,
                  color: colors.white, lineHeight: 1.15,
                }}>
                  Pneumonia<br />— Adult
                </div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 13,
                  color: `${colors.white}45`,
                }}>
                  Clinical Reasoning Case
                </div>
              </div>

              {/* Meta fields */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {[
                  { k: "Course",  v: "MED 501" },
                  { k: "Section", v: "Clinical Skills" },
                  { k: "Due",     v: "Nov 21, 2025" },
                  { k: "Status",  v: "Available" },
                ].map(m => (
                  <div key={m.k} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 8, borderBottom: `1px solid ${colors.white}07`,
                  }}>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 10,
                      color: `${colors.white}32`, letterSpacing: 1.5,
                    }}>
                      {m.k.toUpperCase()}
                    </div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 12,
                      color: m.k === "Status" ? colors.vitalsNormal : `${colors.white}65`,
                      fontWeight: m.k === "Status" ? 700 : 400,
                    }}>
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right main area ── */}
            <div style={{
              flex: 1,
              padding: "36px 40px",
              display: "flex", flexDirection: "column" as const,
            }}>
              {/* Portal header */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28, paddingBottom: 20,
                borderBottom: `1px solid ${colors.oasis}12`,
              }}>
                <div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 10,
                    color: `${colors.oasis}58`, letterSpacing: 3,
                    marginBottom: 7, textTransform: "uppercase" as const,
                  }}>
                    AIMMS Student Portal · MED 501
                  </div>
                  <div style={{
                    fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: colors.white,
                  }}>
                    Case Overview
                  </div>
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}28`,
                }}>
                  Just now
                </div>
              </div>

              {/* Case sections */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {[
                  { label: "Patient Interview",      note: "History & Chief Complaint" },
                  { label: "Physical Examination",   note: "Vitals · Auscultation · Findings" },
                  { label: "Differential Diagnosis", note: "Clinical Reasoning" },
                  { label: "Assessment & Plan",      note: "Management Strategy" },
                ].map((sec, si) => (
                  <div key={si} style={{
                    display: "flex", alignItems: "center", gap: 18,
                    padding: "16px 20px",
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${colors.oasis}10`,
                    borderRadius: 12,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${colors.oasis}32`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: fonts.mono, fontSize: 13,
                      color: `${colors.oasis}65`,
                    }}>
                      {si + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: fonts.body, fontSize: 17, fontWeight: 600,
                        color: colors.white, marginBottom: 3,
                      }}>
                        {sec.label}
                      </div>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 11,
                        color: `${colors.white}35`,
                      }}>
                        {sec.note}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 10,
                      color: `${colors.white}25`, letterSpacing: 1.5,
                    }}>
                      NOT STARTED
                    </div>
                  </div>
                ))}
              </div>

              {/* Begin CTA */}
              <div style={{
                marginTop: 20,
                background: `linear-gradient(135deg, ${colors.oasis}24 0%, ${colors.azurite}18 100%)`,
                border: `1.5px solid ${colors.oasis}48`,
                borderRadius: 14, padding: "20px 32px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: `0 0 40px ${colors.oasis}12`,
              }}>
                <span style={{
                  fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.oasis,
                }}>
                  Begin Patient Encounter
                </span>
                <span style={{
                  fontFamily: fonts.mono, fontSize: 20, color: `${colors.oasis}78`,
                }}>
                  →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          OVERLAY 3 — LARGE STOPWATCH  "In less than a minute"  (P7_SW)
          Triggered by narration: final beat confirming speed.
         ════════════════════════════════════════════════════════════════ */}
      {swOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 25, pointerEvents: "none",
          opacity: swOp,
        }}>
          {/* Radial gradient background */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 72% 68% at 50% 50%, rgba(2,6,22,0.90) 0%, rgba(2,6,22,0.52) 62%, transparent 100%)`,
          }} />

          {/* Centered timer content */}
          <div style={{
            position: "relative",
            display: "flex", flexDirection: "column" as const, alignItems: "center",
            transform: `scale(${swScale})`,
            transformOrigin: "center center",
          }}>
            {/* Label above ring */}
            <div style={{
              fontFamily: fonts.mono, fontSize: 12, letterSpacing: 4.5,
              color: `${colors.oasis}60`, textTransform: "uppercase" as const,
              marginBottom: 28,
            }}>
              Assignment Process
            </div>

            {/* Large SVG ring — 400×400 */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <svg width={400} height={400} viewBox="0 0 400 400">
                {/* Outer decorative ring */}
                <circle cx={200} cy={200} r={192}
                  fill="none" stroke={`${colors.oasis}07`} strokeWidth={1} />

                {/* 60 tick marks — major every 5 */}
                {Array.from({ length: 60 }).map((_, ti) => {
                  const isMajor = ti % 5 === 0;
                  const a = (ti * 6 - 90) * (Math.PI / 180);
                  const oR = 186, iR = isMajor ? 172 : 179;
                  return (
                    <line key={ti}
                      x1={200 + oR * Math.cos(a)} y1={200 + oR * Math.sin(a)}
                      x2={200 + iR * Math.cos(a)} y2={200 + iR * Math.sin(a)}
                      stroke={isMajor ? `${colors.oasis}55` : `${colors.oasis}20`}
                      strokeWidth={isMajor ? 3 : 1.5}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Background track */}
                <circle cx={200} cy={200} r={SW_R}
                  fill="none" stroke={`${colors.oasis}10`} strokeWidth={14} />

                {/* Sweep arc */}
                <circle cx={200} cy={200} r={SW_R}
                  fill="none" stroke={colors.oasis} strokeWidth={14}
                  strokeLinecap="round"
                  strokeDasharray={SW_CIRCUM}
                  strokeDashoffset={swDashOff}
                  transform="rotate(-90 200 200)"
                  style={{ filter: `drop-shadow(0 0 16px ${colors.oasis}65)` }}
                />

                {/* Center pivot */}
                <circle cx={200} cy={200} r={12}
                  fill={colors.oasis} opacity={0.95}
                  style={{ filter: `drop-shadow(0 0 10px ${colors.oasis}80)` }}
                />

                {/* Sweep hand */}
                <line
                  x1={200} y1={200} x2={swHX} y2={swHY}
                  stroke={colors.oasis} strokeWidth={3.5}
                  strokeLinecap="round" opacity={0.88}
                />
              </svg>

              {/* Center text inside ring */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center" as const,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 13,
                  color: `${colors.white}32`, letterSpacing: 3.5,
                  marginBottom: 8, textTransform: "uppercase" as const,
                }}>
                  Elapsed
                </div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 80, fontWeight: 900,
                  color: colors.white, lineHeight: 1,
                }}>
                  {"< 1"}
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 18,
                  color: `${colors.oasis}82`, letterSpacing: 5,
                  marginTop: 10, textTransform: "uppercase" as const,
                }}>
                  Minute
                </div>
              </div>
            </div>

            {/* Pipeline steps below ring */}
            <div style={{
              marginTop: 36,
              display: "flex", alignItems: "center",
            }}>
              {[
                { label: "Case Created", done: true },
                { label: "Assigned",     done: true },
                { label: "Accessible",   done: true },
                { label: "Complete",     done: sweepProg > 0.68 },
              ].map((step, si) => (
                <React.Fragment key={si}>
                  <div style={{
                    display: "flex", flexDirection: "column" as const,
                    alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: step.done ? colors.oasis : `${colors.oasis}18`,
                      border: `2px solid ${step.done ? colors.oasis : `${colors.oasis}32`}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: step.done ? `0 0 20px ${colors.oasis}65` : "none",
                    }}>
                      {step.done && (
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 14,
                          color: colors.midnight, fontWeight: 900,
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 11,
                      color: step.done ? `${colors.white}68` : `${colors.white}25`,
                      letterSpacing: 1.5, textTransform: "uppercase" as const,
                      whiteSpace: "nowrap" as const,
                    }}>
                      {step.label}
                    </div>
                  </div>
                  {si < 3 && (
                    <div style={{
                      width: 72, height: 2, flexShrink: 0,
                      background: step.done
                        ? `linear-gradient(90deg, ${colors.oasis}70, ${colors.oasis}28)`
                        : `${colors.oasis}12`,
                      marginBottom: 26,
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

    </SceneShell>
  );
};
