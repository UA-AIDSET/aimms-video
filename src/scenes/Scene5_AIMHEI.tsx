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
import { GlassPanel } from "../components/GlassPanel";
import { PulsingDot } from "../components/PulsingDot";

/* ────────────────────────────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────────────────────────────── */
const categories = [
  { label: "Information Gathering", score: 82, cohort: 75 },
  { label: "Clinical Skills",       score: 91, cohort: 81 },
  { label: "Medical Terminology",   score: 80, cohort: 75 },
  { label: "Politeness & Rapport",  score: 85, cohort: 83 },
  { label: "Empathy & Compassion",  score: 90, cohort: 83 },
];

/* 4 high-value sections shown in the rubric focus phase */
const rubricFocus = [
  {
    title: "Chief Complaint",
    color: colors.oasis,
    items: [
      { criterion: "Asked about onset of symptoms",  output: "YES" },
      { criterion: "Explored symptom duration",       output: "YES" },
      { criterion: "Asked about aggravating factors", output: "NO"  },
    ],
  },
  {
    title: "History of Present Illness",
    color: "#06b6d4",
    items: [
      { criterion: "Inquired about associated symptoms", output: "YES" },
      { criterion: "Asked about prior episodes",          output: "YES" },
      { criterion: "Explored medication history",         output: "YES" },
      { criterion: "Asked about family history",          output: "NO"  },
    ],
  },
  {
    title: "Assessment & Plan",
    color: colors.vitalsWarning,
    items: [
      { criterion: "Provided differential diagnosis", output: "YES" },
      { criterion: "Ordered appropriate tests",       output: "YES" },
      { criterion: "Discussed treatment options",     output: "YES" },
    ],
  },
  {
    title: "Communication Skills",
    color: colors.azurite,
    items: [
      { criterion: "Used open-ended questions",            output: "YES" },
      { criterion: "Demonstrated active listening",        output: "YES" },
      { criterion: "Summarized findings for patient",      output: "NO"  },
      { criterion: "Used appropriate medical terminology", output: "YES" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────
   SCENE

   Phase boundaries (30fps; audio starts f10, duration 23.5s → ends ~f715):
     P1  f 65–185  Transcript analysis
     P2  f185–305  Overall score reveal
     P3  f305–420  Competency breakdown (5 bars, one spotlit at a time)
     P4  f420–530  Rubric review        (4 sections, one spotlit at a time)
     P5  f530–620  Faculty edit + finalize
     P6  f620–715  Finalized state
   ──────────────────────────────────────────────────────────────────────── */
export const Scene5_AIMHEI: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const easeIO = Easing.inOut(Easing.ease);

  /* ── Phase helpers ── */
  const phOp = (s: number, e: number) =>
    interpolate(frame, [s, s + 18, e - 16, e], [0, 1, 1, 0], clamp);

  const phZoom = (s: number) =>
    interpolate(frame, [s, s + 28], [0.93, 1.0], { ...clamp, easing: easeIO });

  const P1S = 65,  P1E = 185;
  const P2S = 185, P2E = 305;
  const P3S = 305, P3E = 420;
  const P4S = 420, P4E = 530;
  const P5S = 530, P5E = 620;
  const P6S = 620, P6E = 715;

  const p1Op = phOp(P1S, P1E);
  const p2Op = phOp(P2S, P2E); const p2Zoom = phZoom(P2S);
  const p3Op = phOp(P3S, P3E); const p3Zoom = phZoom(P3S);
  const p4Op = phOp(P4S, P4E); const p4Zoom = phZoom(P4S);
  const p5Op = phOp(P5S, P5E); const p5Zoom = phZoom(P5S);
  const p6Op = interpolate(frame, [P6S, P6S + 18, P6E], [0, 1, 1], clamp);
  const p6Zoom = phZoom(P6S);

  /* ── Score animation ── */
  const scoreRaw     = Math.floor(interpolate(frame, [P2S + 12, P2S + 52], [0, 87], clamp));
  const scoreAdjust  = Math.floor(interpolate(frame, [P5S + 42, P5S + 60], [0, 2], clamp));
  const scoreDisplay = scoreRaw + scoreAdjust;
  const strokeLen    = 2 * Math.PI * 90; // r=90 circle
  const strokeOffset = strokeLen - strokeLen * (scoreDisplay / 100);

  /* ── P2: stat card reveal ── */
  const statOps = [0, 1, 2, 3].map(i =>
    interpolate(frame, [P2S + 28 + i * 14, P2S + 44 + i * 14], [0, 1], clamp)
  );

  /* ── P3: competency bars + spotlight ── */
  const skillBars = categories.map((cat, i) =>
    interpolate(frame, [P3S + 20 + i * 13, P3S + 42 + i * 13], [0, cat.score], clamp)
  );
  // Spotlight: each bar is emphasized for ~20 frames, sequentially
  const catSpot = categories.map((_, i) => {
    const hi = P3S + 22 + i * 19;
    return interpolate(frame, [hi, hi + 6, hi + 13, hi + 19], [0, 1, 1, 0], clamp);
  });
  const anySpot = catSpot.reduce((a, v) => Math.max(a, v), 0);

  /* ── P4: rubric sections — each spotlit for ~27 frames sequentially ── */
  const rubricSpots = rubricFocus.map((_, i) => {
    const start = P4S + i * 27;
    return interpolate(frame, [start, start + 10, start + 21, start + 27], [0, 1, 1, 0], clamp);
  });
  // Item-level reveals within each spotlit section
  const rubricItemOps = rubricFocus.map((sec, si) => {
    const sectionStart = P4S + si * 27;
    return sec.items.map((_, ii) =>
      interpolate(frame, [sectionStart + 8 + ii * 7, sectionStart + 16 + ii * 7], [0, 1], clamp)
    );
  });

  /* ── P5: Faculty edit ── */
  const editModeOp  = interpolate(frame, [P5S + 8,  P5S + 22], [0, 1], clamp);
  const edit1Op     = interpolate(frame, [P5S + 24, P5S + 38], [0, 1], clamp);
  const edit2Op     = interpolate(frame, [P5S + 40, P5S + 54], [0, 1], clamp);
  const scoreUpOp   = interpolate(frame, [P5S + 56, P5S + 70], [0, 1], clamp);
  const finBtnOp    = interpolate(frame, [P5S + 66, P5S + 78], [0, 1], clamp);
  const finalizingP = interpolate(frame, [P5S + 78, P5S + 88], [0, 1], clamp);

  /* ── P6: Finalized ── */
  const finalBadgeOp = interpolate(frame, [P6S + 14, P6S + 28], [0, 1], clamp);
  const finalRows    = [0, 1, 2, 3].map(i =>
    interpolate(frame, [P6S + 28 + i * 10, P6S + 40 + i * 10], [0, 1], clamp)
  );

  /* ── P1: processing ── */
  const processingProgress = interpolate(frame, [P1S + 8, P1E - 14], [0, 100], clamp);

  /* ── 3D background ── */
  const orbScale3d = interpolate(frame, [P1S, P1E], [1, 2.4], clamp);
  const threeFade  = interpolate(frame, [P1E, P1E + 40], [1, 0.14], clamp);

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
          <DataStream direction="down" position={[-4, 3, -1]} color="#4CAF50" opacity={0.28} speed={0.07} />
          <DataStream direction="down" position={[4, 3, -1]}  color="#4CAF50" opacity={0.28} speed={0.07} />
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
        { frame: 0,    position: [0, 0, 10] },
        { frame: P1E,  position: [0, 0, 7.5] },
        { frame: P6E,  position: [0, 0, 7.5] },
      ]} />
    </>
  );

  /* ── Shared content-column style ── */
  const phaseWrap = (op: number): React.CSSProperties => ({
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "80px 80px 28px",
    opacity: op, pointerEvents: "none", zIndex: 10,
  });

  return (
    <SceneShell
      interstitial={{ step: 4, title: "Evaluate", subtitle: "AIMS Performance Reports" }}
      sectionLabel="Performance Reports"
      bgGradient={`linear-gradient(160deg, ${colors.midnight} 0%, ${colors.arizonaBlue} 50%, #1a3a2a 100%)`}
      threeContent={threeContent}
    >

      {/* ══════════════════════════════════════════════════════════
          PHASE 1 — Transcript Analysis  (f65–185)
         ══════════════════════════════════════════════════════════ */}
      {p1Op > 0 && (
        <div style={phaseWrap(p1Op)}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, width: "100%", maxWidth: 680 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PulsingDot color={colors.vitalsNormal} size={12} delay={P1S} />
              <span style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 700, color: colors.white }}>
                Analyzing Interview Transcript
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", height: 8, borderRadius: 4, background: `${colors.white}12` }}>
              <div style={{
                width: `${processingProgress}%`, height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${colors.vitalsNormal}, ${colors.ecgGreen})`,
              }} />
            </div>
            <span style={{ fontFamily: fonts.mono, fontSize: 16, color: `${colors.white}55` }}>
              {Math.floor(processingProgress)}% complete
            </span>

            {/* Transcript lines */}
            <GlassPanel enterFrame={P1S + 18} exitFrame={P1E} style={{ width: "100%", padding: "18px 24px" }}>
              {[
                "Student: What brings you in today?",
                "Patient: I've had trouble breathing for a few days now.",
                "Student: How long exactly? Any changes in severity?",
                "Patient: About three days. Getting worse at night.",
                "Student: Any swelling in your legs or feet?",
              ].map((line, i) => (
                <div key={i} style={{
                  fontFamily: fonts.mono, fontSize: 15, color: `${colors.white}70`,
                  marginBottom: 7, lineHeight: 1.5,
                  opacity: interpolate(frame, [P1S + 22 + i * 14, P1S + 34 + i * 14], [0, 1], clamp),
                }}>
                  {line}
                </div>
              ))}
            </GlassPanel>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 2 — Overall Score Reveal  (f185–305)
          Large score circle left · 4 key stats right
         ══════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={phaseWrap(p2Op)}>
          <div style={{
            transform: `scale(${p2Zoom})`,
            width: "100%", maxWidth: 860,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            {/* Section label */}
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.5, color: `${colors.white}38`, textTransform: "uppercase" as const }}>
              AIMS Performance Report  ·  A. Johnson  ·  Pneumonia Case  ·  Mar 4, 2026
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
              {/* Score circle */}
              <GlassPanel enterFrame={P2S} exitFrame={P2E + 20} style={{
                width: 260, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 14, padding: "28px 20px", flexShrink: 0,
                boxShadow: `0 0 36px ${colors.vitalsNormal}22`,
                border: `1px solid ${colors.vitalsNormal}30`,
              }}>
                <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={200} height={200} style={{ position: "absolute", top: 0, left: 0 }}>
                    <circle cx={100} cy={100} r={90} fill="none" stroke={`${colors.white}08`} strokeWidth={8} />
                    <circle
                      cx={100} cy={100} r={90} fill="none"
                      stroke={colors.vitalsNormal} strokeWidth={8}
                      strokeDasharray={strokeLen}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 62, fontWeight: 800, color: colors.white, lineHeight: 1 }}>
                      {scoreDisplay}
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 14, color: `${colors.vitalsNormal}90`, marginTop: 4 }}>
                      / 100
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 17, color: colors.oasis, fontWeight: 600 }}>
                  Overall Score
                </div>
              </GlassPanel>

              {/* Key stats column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Cohort Standing",   value: "Top 15%",        color: colors.vitalsNormal },
                  { label: "Transcript Length", value: "1,847 words",    color: colors.oasis },
                  { label: "Questions Asked",   value: "23 total",       color: colors.oasis },
                  { label: "Exam Duration",     value: "14 min 32 sec",  color: colors.oasis },
                ].map((stat, i) => (
                  <GlassPanel key={stat.label} enterFrame={P2S + 20 + i * 16} exitFrame={P2E + 20} style={{
                    padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    opacity: statOps[i],
                  }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 16, color: `${colors.white}70` }}>
                      {stat.label}
                    </span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </span>
                  </GlassPanel>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 3 — Competency Breakdown  (f305–420)
          5 horizontal bars; one spotlit at a time per narration
         ══════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={phaseWrap(p3Op)}>
          <div style={{
            transform: `scale(${p3Zoom})`,
            width: "100%", maxWidth: 900,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white }}>
                Competency Breakdown
              </div>
              <div style={{ display: "flex", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 3, borderRadius: 2, background: colors.vitalsNormal }} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}45` }}>Student</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 3, borderRadius: 2, background: `${colors.white}25` }} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}45` }}>Cohort Avg</span>
                </div>
              </div>
            </div>

            {/* Bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map((cat, i) => {
                const isSpot   = catSpot[i] > 0.08;
                const dimmed   = anySpot > 0.1 && !isSpot;
                const delta    = cat.score - cat.cohort;
                return (
                  <div key={cat.label} style={{
                    padding: "12px 16px", borderRadius: 8,
                    background: isSpot ? `${colors.vitalsNormal}0A` : `${colors.white}03`,
                    border: isSpot
                      ? `1px solid ${colors.vitalsNormal}${Math.round(catSpot[i] * 55).toString(16).padStart(2, "0")}`
                      : `1px solid ${colors.white}07`,
                    opacity: dimmed ? 0.38 : 1,
                    transform: isSpot ? `scale(1.018)` : "scale(1)",
                    transformOrigin: "50% 50%",
                    boxShadow: isSpot ? `0 4px 24px ${colors.vitalsNormal}14` : "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 16, fontWeight: isSpot ? 700 : 500,
                        color: isSpot ? colors.white : `${colors.white}80`,
                      }}>
                        {cat.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{
                          fontFamily: fonts.mono, fontSize: 11,
                          color: delta > 0 ? colors.vitalsNormal : colors.vitalsCritical,
                          opacity: isSpot ? 1 : 0.6,
                        }}>
                          {delta > 0 ? "+" : ""}{delta} vs cohort
                        </span>
                        <span style={{
                          fontFamily: fonts.mono, fontSize: 20, fontWeight: 800,
                          color: cat.score >= 87 ? colors.vitalsNormal : colors.oasis,
                        }}>
                          {Math.floor(skillBars[i])}%
                        </span>
                      </div>
                    </div>
                    {/* Stacked bars: cohort (dim) + student (bright) */}
                    <div style={{ position: "relative", height: 10, borderRadius: 5, background: `${colors.white}08` }}>
                      <div style={{
                        position: "absolute", height: "100%", borderRadius: 5,
                        background: `${colors.white}18`, width: `${cat.cohort}%`,
                      }} />
                      <div style={{
                        position: "absolute", height: "100%", borderRadius: 5,
                        background: cat.score >= 87 ? colors.vitalsNormal : colors.oasis,
                        width: `${skillBars[i]}%`,
                        boxShadow: isSpot ? `0 0 8px ${colors.vitalsNormal}55` : "none",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 4 — Rubric Review  (f420–530)
          4 sections in 2-col grid; spotlight cycles through each
         ══════════════════════════════════════════════════════════ */}
      {p4Op > 0 && (
        <div style={phaseWrap(p4Op)}>
          <div style={{
            transform: `scale(${p4Zoom})`,
            width: "100%", maxWidth: 940,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white }}>
              Rubric Checklist
            </div>

            {/* 2-col grid: [0,2] left | [1,3] right */}
            <div style={{ display: "flex", gap: 14 }}>
              {[
                [0, 2],
                [1, 3],
              ].map((colIdxs, colN) => (
                <div key={colN} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  {colIdxs.map(si => {
                    const sec   = rubricFocus[si];
                    const spot  = rubricSpots[si];
                    const isHi  = spot > 0.08;
                    const dimP4 = rubricSpots.some((v, ii) => ii !== si && v > 0.08);
                    return (
                      <div key={sec.title} style={{
                        padding: "14px 16px", borderRadius: 8,
                        background: isHi ? `${sec.color}0C` : `rgba(12,35,75,0.55)`,
                        border: isHi
                          ? `1.5px solid ${sec.color}${Math.round(spot * 65).toString(16).padStart(2, "0")}`
                          : `1px solid ${colors.white}09`,
                        opacity: (dimP4 && !isHi) ? 0.32 : 1,
                        transform: isHi ? "scale(1.022)" : "scale(1)",
                        transformOrigin: "50% 50%",
                        boxShadow: isHi ? `0 6px 28px ${sec.color}18` : "none",
                      }}>
                        <div style={{
                          fontFamily: fonts.heading, fontSize: 15, fontWeight: 700,
                          color: isHi ? sec.color : `${colors.white}55`,
                          marginBottom: 10,
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          {sec.title}
                          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}35`, fontWeight: 400 }}>
                            {sec.items.filter(it => it.output === "YES").length}/{sec.items.length} met
                          </span>
                        </div>
                        {sec.items.map((item, ii) => (
                          <div key={item.criterion} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "6px 0",
                            borderBottom: ii < sec.items.length - 1 ? `1px solid ${colors.white}07` : "none",
                            opacity: rubricItemOps[si][ii],
                          }}>
                            <span style={{ fontFamily: fonts.body, fontSize: 14, color: isHi ? `${colors.white}90` : `${colors.white}60`, flex: 1 }}>
                              {item.criterion}
                            </span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 14, fontWeight: 700,
                              color: item.output === "YES" ? colors.vitalsNormal : colors.vitalsCritical,
                              background: item.output === "YES" ? `${colors.vitalsNormal}18` : `${colors.vitalsCritical}18`,
                              padding: "2px 10px", borderRadius: 4, marginLeft: 10, flexShrink: 0,
                            }}>
                              {item.output}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 5 — Faculty Edit + Finalize  (f530–620)
         ══════════════════════════════════════════════════════════ */}
      {p5Op > 0 && (
        <div style={phaseWrap(p5Op)}>
          <div style={{
            transform: `scale(${p5Zoom})`,
            width: "100%", maxWidth: 680,
            display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white }}>
              Faculty Review
            </div>

            {/* Edit mode indicator */}
            <GlassPanel enterFrame={P5S} exitFrame={P5E + 20} style={{
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 10,
              opacity: editModeOp, border: `1px solid ${colors.azurite}35`,
            }}>
              <PulsingDot color={colors.azurite} size={9} delay={P5S} />
              <span style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.azurite }}>
                Faculty Edit Mode — reviewing rubric items
              </span>
            </GlassPanel>

            {/* Change 1 */}
            <GlassPanel enterFrame={P5S + 20} exitFrame={P5E + 20} style={{
              padding: "16px 20px", opacity: edit1Op,
            }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40`, letterSpacing: 1.8, marginBottom: 8, textTransform: "uppercase" as const }}>
                Rubric Change
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 15, color: `${colors.white}80`, flex: 1 }}>
                  Asked about aggravating factors
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.vitalsCritical, textDecoration: "line-through", opacity: 0.55 }}>
                  NO
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}30` }}>→</span>
                <span style={{
                  fontFamily: fonts.mono, fontSize: 15, fontWeight: 700,
                  color: colors.vitalsNormal, background: `${colors.vitalsNormal}18`,
                  padding: "2px 10px", borderRadius: 4,
                }}>
                  YES
                </span>
              </div>
            </GlassPanel>

            {/* Change 2 */}
            <GlassPanel enterFrame={P5S + 36} exitFrame={P5E + 20} style={{
              padding: "16px 20px", opacity: edit2Op,
            }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40`, letterSpacing: 1.8, marginBottom: 8, textTransform: "uppercase" as const }}>
                Faculty Note
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 15, color: `${colors.white}80`, flex: 1 }}>
                  Asked about family history
                </span>
                <span style={{
                  fontFamily: fonts.mono, fontSize: 15, fontWeight: 700,
                  color: colors.vitalsCritical, background: `${colors.vitalsCritical}18`,
                  padding: "2px 10px", borderRadius: 4,
                }}>
                  NO — confirmed
                </span>
              </div>
            </GlassPanel>

            {/* Score update */}
            {scoreUpOp > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12, opacity: scoreUpOp,
                padding: "10px 18px", borderRadius: 8,
                background: `${colors.vitalsNormal}0C`,
                border: `1px solid ${colors.vitalsNormal}28`,
              }}>
                <span style={{ fontFamily: fonts.body, fontSize: 16, color: `${colors.white}70` }}>Score updated</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 16, color: `${colors.white}45`, textDecoration: "line-through" }}>87%</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}30` }}>→</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 800, color: colors.vitalsNormal }}>
                  {scoreDisplay}%
                </span>
              </div>
            )}

            {/* Finalize button */}
            {finBtnOp > 0 && (
              <div style={{
                marginTop: 4, padding: "14px 0", borderRadius: 8,
                textAlign: "center" as const,
                fontFamily: fonts.heading, fontSize: 16, fontWeight: 700,
                color: finalizingP > 0.5 ? colors.vitalsNormal : colors.white,
                background: finalizingP > 0.5
                  ? `${colors.vitalsNormal}18`
                  : `linear-gradient(135deg, ${colors.arizonaBlue}, ${colors.azurite})`,
                border: finalizingP > 0.5
                  ? `1px solid ${colors.vitalsNormal}40`
                  : `1px solid ${colors.oasis}30`,
                boxShadow: finalizingP > 0.5
                  ? `0 0 24px ${colors.vitalsNormal}28`
                  : `0 0 ${Math.round(finBtnOp * 18)}px ${colors.oasis}22`,
                opacity: finBtnOp,
              }}>
                {finalizingP > 0.5 ? "✓ Evaluation Finalized" : "Finalize Evaluation"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 6 — Finalized State  (f620–715)
         ══════════════════════════════════════════════════════════ */}
      {p6Op > 0 && (
        <div style={phaseWrap(p6Op)}>
          <div style={{
            transform: `scale(${p6Zoom})`,
            width: "100%", maxWidth: 620,
            display: "flex", flexDirection: "column", gap: 20, alignItems: "center",
          }}>
            {/* Finalized badge */}
            <div style={{
              opacity: finalBadgeOp,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <div style={{
                fontFamily: fonts.heading, fontSize: 36, fontWeight: 800,
                color: colors.vitalsNormal,
                textShadow: `0 0 40px ${colors.vitalsNormal}50`,
              }}>
                ✓ Evaluation Finalized
              </div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 13, letterSpacing: 2, color: `${colors.white}40`,
                textTransform: "uppercase" as const,
              }}>
                Released to student
              </div>
            </div>

            {/* Summary card */}
            <GlassPanel enterFrame={P6S + 18} exitFrame={P6E + 5} style={{
              width: "100%", padding: "22px 28px",
              border: `1px solid ${colors.vitalsNormal}30`,
              boxShadow: `0 0 32px ${colors.vitalsNormal}14`,
            }}>
              {[
                { label: "Student",    value: "A. Johnson"          },
                { label: "Case",       value: "Pneumonia — Adult"   },
                { label: "Final Score",value: `${scoreDisplay}%`,    },
                { label: "Date",       value: "Mar 4, 2026"         },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 3 ? `1px solid ${colors.white}08` : "none",
                  opacity: finalRows[i],
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 16, color: `${colors.white}55` }}>
                    {row.label}
                  </span>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 18, fontWeight: 700,
                    color: row.label === "Final Score" ? colors.vitalsNormal : colors.white,
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </GlassPanel>
          </div>
        </div>
      )}

    </SceneShell>
  );
};
