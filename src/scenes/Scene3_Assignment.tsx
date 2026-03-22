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

const ROWS = 2, COLS = 5, ICON_S = 56, ICON_GAP = 10;
const SHOWN = ROWS * COLS; // 10 per class

/* ══════════════════════════════════════════════════════════════════════
   LAYOUT GEOMETRY (px, 1920×1080 canvas)
   ══════════════════════════════════════════════════════════════════════ */
const CASE_L = 110, CASE_W = 340, CASE_T = 310, CASE_H = 430;
const CLS_L  = 620, CLS_W  = 360, CLS_H  = 148, CLS_GAP = 52;
const CLS_TOPS = [-1, 0, 1].map(i => 535 - Math.floor(CLS_H / 2) + i * (CLS_H + CLS_GAP));
const GRP_L   = 1100;

const CASE_RIGHT = CASE_L + CASE_W;                           // 450
const CASE_MID_Y = CASE_T + Math.floor(CASE_H / 2);           // 525
const SPINE_X    = 530;
const CLS_MID_YS = CLS_TOPS.map(t => t + Math.floor(CLS_H / 2));
const CLS_RIGHT  = CLS_L + CLS_W;                             // 980

const L_MAIN   = SPINE_X - CASE_RIGHT;
const L_SPINE  = CLS_MID_YS[2] - CLS_MID_YS[0];
const L_BRANCH = CLS_L - SPINE_X;
const GRID_W   = COLS * ICON_S + (COLS - 1) * ICON_GAP;
const L_CG     = GRP_L - CLS_RIGHT;

/* ══════════════════════════════════════════════════════════════════════
   PHASE BOUNDARIES  (30fps · audio 21.7s starts f10 ends f662)

   P1   f 65–150   CASE FOCUS   — case spotlit, classes/students hidden
   P2   f142–268   CLASS FOCUS  — classes in, case dims, students hidden
   P3   f260–390   STUDENT FOCUS — students in, classes dim
   P4   f382–525   FULL VIEW    — all visible, assignment "completes"
   P5   f518–640   CONFIRMED    — hold with badge
   ══════════════════════════════════════════════════════════════════════ */
const P1S = 65,  P1E = 150;
const P2S = 142, P2E = 268;
const P3S = 260, P3E = 390;
const P4S = 382, P4E = 525;
const P5S = 518, P5E = 640;

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export const Scene3_Assignment: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp  = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeIO = { easing: Easing.inOut(Easing.ease), ...clamp };

  /* ── Overall wrapper fade ── */
  const wrapOp = interpolate(frame, [P1S, P1S + 18, P5E, P5E + 18], [0, 1, 1, 0], clamp);

  /* ────────────────────────────────────────────────────────────────────
     SPOTLIGHT SYSTEM — column-level opacity
     Each column is fully lit when narration refers to it, dimmed otherwise.
     ──────────────────────────────────────────────────────────────────── */
  // CASE column: bright P1, dim P2+P3, restore P4+
  const caseColOp = interpolate(frame,
    [P1S,     P1S+20, P1E,    P1E+20, P4S,   P4S+22, P5E],
    [0,       1,      1,      0.32,   0.32,  1,      1],
    clamp
  );

  // CLASSES column: invisible P1, bright P2, dim P3, restore P4+
  const classColOp = interpolate(frame,
    [P2S,     P2S+22, P3S,    P3S+22, P4S,   P4S+22, P5E],
    [0,       1,      1,      0.34,   0.34,  1,      1],
    clamp
  );

  // STUDENTS column: invisible P1+P2, bright P3, stays bright P4+
  const studentColOp = interpolate(frame,
    [P3S, P3S+22, P5E],
    [0,   1,      1],
    clamp
  );

  /* ────────────────────────────────────────────────────────────────────
     VIEWPORT PAN — subtle translateX to keep active column visually
     central. Scale tightens slightly during single-column focus phases.
     ──────────────────────────────────────────────────────────────────── */
  const viewPanX = interpolate(frame,
    [P1S, P1S+28, P2S+22, P3S,   P3S+22, P4S,  P4S+22, P5E],
    [60,  60,     0,      -40,   -40,    0,    0,      0],
    easeIO
  );
  const viewScale = interpolate(frame,
    [P1S, P1S+28, P2S+22, P3S,   P3S+22, P4S,  P4S+22],
    [1,   1.05,   1.02,   1.04,  1.04,   1.0,  1.0],
    easeIO
  );

  /* ── Case node spring entrance ── */
  const caseSp    = spring({ frame: frame - P1S, fps, config: { damping: 20, stiffness: 90, mass: 1.0 } });
  const caseScale = interpolate(caseSp, [0, 1], [0.84, 1], { extrapolateRight: "clamp" as const });
  const caseGlow  = frame >= P1S ? 0.28 + 0.14 * Math.sin((frame - P1S) * 0.07) : 0;

  /* ── Class card springs ── */
  const classSprings = [0, 1, 2].map(i =>
    spring({ frame: frame - (P2S + i * 22), fps, config: { damping: 22, stiffness: 108, mass: 0.88 } })
  );

  /* ── Phase A lines: case → spine → class branches ── */
  const linesA  = interpolate(frame, [P1E - 30, P2S + 62], [0, 1], clamp);
  const pHoriz  = Math.min(1, linesA / 0.24);
  const pSpine  = Math.max(0, Math.min(1, (linesA - 0.20) / 0.40));
  const pBranch = Math.max(0, Math.min(1, (linesA - 0.55) / 0.45));

  // Line opacity: full when both case and classes are visible, dims with their columns
  const lineAOp = Math.min(caseColOp, classColOp) * 2; // brightens in full view

  /* ── Phase B lines: class → student grids (per class, staggered) ── */
  const linesB = [0, 1, 2].map(i =>
    interpolate(frame, [P3S - 14 + i * 14, P3S + 28 + i * 14], [0, 1], clamp)
  );
  const lineBOp = Math.min(classColOp, studentColOp) * 2;

  /* ── Student icon springs: [class][studentIndex] ── */
  const sSprings = [0, 1, 2].map(ci =>
    Array.from({ length: SHOWN }, (_, si) =>
      spring({
        frame: frame - (P3S + ci * 20 + si * 5),
        fps, config: { damping: 26, stiffness: 130, mass: 0.7 },
      })
    )
  );

  /* ── Column label opacities ── */
  const caseLabelOp    = caseColOp;
  const classLabelOp   = classColOp;
  const studentLabelOp = studentColOp;

  // Glow pulse — brief when each column first reaches full brightness
  const caseGlowPulse    = interpolate(frame, [P1S+20,  P1S+50,  P1E-20, P1E],   [0, 1, 1, 0], clamp);
  const classGlowPulse   = interpolate(frame, [P2S+22,  P2S+50,  P2E-20, P2E],   [0, 1, 1, 0], clamp);
  const studentGlowPulse = interpolate(frame, [P3S+22,  P3S+50,  P3E-20, P3E],   [0, 1, 1, 0], clamp);

  /* ── P4: Assignment action — each class gets "Assigned" badge ── */
  const assignedOps = [0, 1, 2].map(i =>
    interpolate(frame, [P4S + 15 + i * 18, P4S + 32 + i * 18], [0, 1], clamp)
  );

  /* ── P5: Confirmed caption ── */
  const captionOp   = interpolate(frame, [P4S + 20, P4S + 42, P5E - 18, P5E], [0, 1, 1, 0], clamp);
  const confirmedOp = interpolate(frame, [P5S, P5S + 22], [0, 1], clamp);

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
            COLUMN LABELS — top of each column, spotlit with column
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
              ? `0 0 20px ${col.color}${Math.round(col.glow * 75).toString(16).padStart(2, "0")}`
              : "none",
          }}>{col.label}</div>
        ))}

        {/* ══════════════════════════════════════════════════════════
            LEFT — Case Node
            Spotlit during P1. Dims to 32% opacity in P2+P3.
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
            border: `2px solid ${colors.arizonaRed}${Math.round(Math.max(caseColOp, 0.4) * 90).toString(16).padStart(2, "0")}`,
            boxShadow: `
              0 0 70px ${colors.arizonaRed}${Math.round(caseGlow * caseColOp * 80).toString(16).padStart(2, "0")},
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
            Spotlit during P2. Dims to 34% in P3. Restores P4+.
           ══════════════════════════════════════════════════════════ */}
        {CLASSES.map((cls, i) => {
          const sp    = classSprings[i];
          const spOp  = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
          const spSc  = interpolate(sp, [0, 1], [0.84, 1], { extrapolateRight: "clamp" as const });
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

                {/* Assigned badge — appears in P4 */}
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
            RIGHT — Student Icon Grids  (2 rows × 5 per class)
            Spotlit during P3. Stays visible P4+.
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
                  opacity: interpolate(frame, [P3S + 30 + ci * 20, P3S + 48 + ci * 20], [0, 1], clamp),
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
            P1 FOCUS LABEL — "One Case" callout below case node
           ══════════════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════════════════
            P2 FOCUS LABEL — "3 Classes" below classes column
           ══════════════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════════════════
            P3 FOCUS LABEL — "74 Students" below students column
           ══════════════════════════════════════════════════════════ */}
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
              Assignment Set · 74 Students · 3 Classes · Due in 7 Days
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
    </SceneShell>
  );
};
