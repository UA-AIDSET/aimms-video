import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
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

/* ── Scoring categories ── */
const categories = [
  { label: "Information Gathering", score: 82 },
  { label: "Clinical Skills", score: 91 },
  { label: "Medical Terminology", score: 80 },
  { label: "Politeness & Rapport", score: 85 },
  { label: "Empathy & Compassion", score: 90 },
];

/* ── All rubric sections ── */
const rubricSections = [
  {
    title: "Chief Complaint",
    items: [
      { criterion: "Asked about onset of symptoms", output: "YES" },
      { criterion: "Explored symptom duration", output: "YES" },
      { criterion: "Asked about aggravating factors", output: "NO" },
    ],
  },
  {
    title: "History of Present Illness",
    items: [
      { criterion: "Inquired about associated symptoms", output: "YES" },
      { criterion: "Asked about prior episodes", output: "YES" },
      { criterion: "Explored medication history", output: "YES" },
      { criterion: "Asked about family history", output: "NO" },
    ],
  },
  {
    title: "Review of Systems",
    items: [
      { criterion: "Cardiovascular review", output: "YES" },
      { criterion: "Respiratory review", output: "YES" },
      { criterion: "Neurological review", output: "NO" },
    ],
  },
  {
    title: "Physical Examination",
    items: [
      { criterion: "Washed hands before exam", output: "YES" },
      { criterion: "Checked vital signs", output: "YES" },
      { criterion: "Auscultated lung fields", output: "YES" },
      { criterion: "Palpated abdomen", output: "NO" },
    ],
  },
  {
    title: "Assessment & Plan",
    items: [
      { criterion: "Provided differential diagnosis", output: "YES" },
      { criterion: "Ordered appropriate tests", output: "YES" },
      { criterion: "Discussed treatment options", output: "YES" },
    ],
  },
  {
    title: "Communication Skills",
    items: [
      { criterion: "Used open-ended questions", output: "YES" },
      { criterion: "Demonstrated active listening", output: "YES" },
      { criterion: "Summarized findings for patient", output: "NO" },
      { criterion: "Used appropriate medical terminology", output: "YES" },
    ],
  },
];

const feedback = {
  strengths: "Strong rapport building, thorough symptom exploration, appropriate use of open-ended questions, good eye contact throughout.",
  weaknesses: "Missed family history, incomplete review of systems, could improve transitions between topics.",
};

const comparisonMetrics = [
  { label: "Overall", student: 87, cohort: 79 },
  { label: "Info Gathering", student: 82, cohort: 75 },
  { label: "Clinical Skills", student: 91, cohort: 81 },
  { label: "Empathy", student: 90, cohort: 83 },
];

/**
 * Scene 5: AIMHEI Performance Reports — ~540 frames
 * Full-page layout with progressive reveal.
 *
 * Phase 1 (65–190):  Processing — transcript analysis animation
 * Phase 2 (190–530): Full-page AIMHEI Report Dashboard
 *   - 190-245: Header + score circle + competency bars
 *   - 245-330: Rubric checklist items reveal
 *   - 330-400: Feedback panels + student vs cohort
 *   - 400-470: Faculty edit mode (inline NO→YES, score update)
 *   - 470-530: "Review Finalized" badge in header, hold
 */
export const Scene5_AIMHEI: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  /* ── Phase opacities ── */
  const phase1Opacity = interpolate(frame, [65, 80, 175, 190], [0, 1, 1, 0], clamp);
  const reportOpacity = interpolate(frame, [185, 205, 695, 715], [0, 1, 1, 0], clamp);

  const scoreBase = Math.floor(interpolate(frame, [210, 245], [0, 87], clamp));
  const scoreAdjust = Math.floor(interpolate(frame, [435, 455], [0, 2], clamp));
  const scoreDisplay = scoreBase + scoreAdjust;

  const processingProgress = interpolate(frame, [80, 175], [0, 100], clamp);

  const skillBars = categories.map((cat, i) =>
    interpolate(frame, [220 + i * 8, 255 + i * 8], [0, cat.score], clamp),
  );

  const allItems = rubricSections.flatMap((s) => s.items);
  const rubricReveals = allItems.map((_, i) =>
    interpolate(frame, [250 + i * 4, 257 + i * 4], [0, 1], clamp),
  );

  // Faculty edit: "Asked about aggravating factors" NO→YES at ~415
  const editFlip = interpolate(frame, [415, 430], [0, 1], clamp);
  // "Asked about family history" stays NO (faculty confirms)
  const editConfirm = interpolate(frame, [440, 455], [0, 1], clamp);

  // Edit mode indicator
  const editModeOn = interpolate(frame, [395, 410], [0, 1], clamp);

  // Finalized badge
  const finalizedOn = interpolate(frame, [475, 488], [0, 1], clamp);

  const orbScale = interpolate(frame, [65, 190], [1, 2.5], clamp);
  const orbitSpeed = interpolate(frame, [65, 190], [0.02, 0.08], clamp);
  const threeFade = interpolate(frame, [190, 240], [1, 0.15], clamp);

  const threeContent = (
    <>
      <AnimatedGrid color="#4CAF50" opacity={0.06 * threeFade} />
      {frame < 210 && <ParticleField count={150} color={colors.ecgGreen} speed={0.005} opacity={0.2} />}
      {frame >= 210 && <ParticleField count={40} color={colors.vitalsNormal} speed={0.001} opacity={0.06} />}
      {frame < 240 && (
        <>
          <DataStream direction="down" position={[-4, 3, -1]} color="#4CAF50" opacity={0.35} speed={0.07} />
          <DataStream direction="down" position={[4, 3, -1]} color="#4CAF50" opacity={0.35} speed={0.07} />
          <DataStream direction="up" position={[-3, -3, -1]} color="#4CAF50" opacity={0.3} speed={0.06} />
          <DataStream direction="up" position={[3, -3, -1]} color="#4CAF50" opacity={0.3} speed={0.06} />
        </>
      )}
      <GlowOrb position={[0, 0, -1]} color="#4CAF50" radius={frame < 190 ? orbScale : 2.5} baseOpacity={0.06 * threeFade} />
      <OrbitRing position={[0, 0, 0]} radius={2} color={colors.vitalsNormal} opacity={0.2 * threeFade} rotationSpeed={frame < 190 ? orbitSpeed : 0.02} tilt={[Math.PI / 8, 0, 0]} />
      <CameraRig positions={[
        { frame: 0, position: [0, 0, 10] },
        { frame: 190, position: [0, 0, 7] },
        { frame: 720, position: [0, 0, 7] },
      ]} />
    </>
  );

  return (
    <SceneShell
      interstitial={{ step: 4, title: "Evaluate", subtitle: "AIMHEI Performance Reports" }}
      sectionLabel="Performance Reports"
      bgGradient={`linear-gradient(160deg, ${colors.midnight} 0%, ${colors.arizonaBlue} 50%, #1a3a2a 100%)`}
      threeContent={threeContent}
    >

      {/* ════════════════════════════════════════════
          Phase 1: Processing (65–190)
         ════════════════════════════════════════════ */}
      {phase1Opacity > 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 40px 30px",
          opacity: phase1Opacity, pointerEvents: "none", zIndex: 10,
        }}>
          {/* Fixed-height content block to prevent layout shifts */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PulsingDot color={colors.vitalsNormal} size={12} delay={70} />
              <span style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 700, color: colors.white }}>
                Analyzing Interview Transcript
              </span>
            </div>
            <div style={{ width: 550, height: 8, borderRadius: 4, background: `${colors.white}12` }}>
              <div style={{
                width: `${processingProgress}%`, height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${colors.vitalsNormal}, ${colors.ecgGreen})`,
              }} />
            </div>
            <span style={{ fontFamily: fonts.mono, fontSize: 18, color: `${colors.white}60` }}>
              {Math.floor(processingProgress)}% complete
            </span>

            {/* Transcript panel — always occupies space, fades in via opacity */}
            <div style={{
              width: 650, height: 160,
              opacity: interpolate(frame, [90, 105], [0, 1], clamp),
            }}>
              <GlassPanel enterFrame={0} exitFrame={185} style={{ width: "100%", padding: "16px 22px", maxHeight: 160, overflow: "hidden" }}>
                {[
                  "Student: What brings you in today?",
                  "Patient: I've had trouble breathing...",
                  "Student: How long has this been going on?",
                  "Patient: About 3 days now, getting worse.",
                  "Student: Any swelling in your legs?",
                ].map((line, i) => {
                  const lineOp = interpolate(frame, [95 + i * 14, 105 + i * 14], [0, 1], clamp);
                  return (
                    <div key={i} style={{ fontFamily: fonts.mono, fontSize: 15, color: `${colors.white}70`, marginBottom: 6, opacity: lineOp }}>
                      {line}
                    </div>
                  );
                })}
              </GlassPanel>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          Phase 2: Full-Page AIMHEI Report (190–530)
         ════════════════════════════════════════════ */}
      {reportOpacity > 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          padding: "76px 30px 20px",
          opacity: reportOpacity, pointerEvents: "none", zIndex: 10,
        }}>
          {/* ── Report Header Bar ── */}
          <GlassPanel enterFrame={190} exitFrame={715} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 20px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white }}>
                AIMHEI Report
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, color: `${colors.white}60` }}>
                A. Johnson — Pneumonia Case
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}40` }}>
                Mar 4, 2026
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {editModeOn > 0 && finalizedOn < 0.5 && (
                <div style={{
                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 600,
                  color: colors.azurite, background: `${colors.azurite}20`,
                  padding: "3px 12px", borderRadius: 4,
                  opacity: editModeOn,
                }}>
                  Faculty Edit Mode
                </div>
              )}
              {finalizedOn > 0 && (
                <div style={{
                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                  color: colors.vitalsNormal, background: `${colors.vitalsNormal}20`,
                  padding: "3px 12px", borderRadius: 4,
                  opacity: finalizedOn,
                }}>
                  ✓ Review Finalized
                </div>
              )}
              <div style={{
                  fontFamily: fonts.mono, fontSize: 14, fontWeight: 600,
                  color: colors.oasis, background: `${colors.oasis}15`,
                padding: "3px 12px", borderRadius: 4,
              }}>
                Score: {scoreDisplay}%
              </div>
            </div>
          </GlassPanel>

          {/* ── Main Content: 3-column layout ── */}
          <div style={{ display: "flex", gap: 10, flex: 1, minHeight: 0 }}>

            {/* ═══ LEFT COLUMN: Score + Competencies + Comparison ═══ */}
            <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Score circle */}
              <GlassPanel enterFrame={195} exitFrame={715} style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={140} height={140} style={{ position: "absolute", top: 0, left: 0 }}>
                    <circle cx={70} cy={70} r={60} fill="none" stroke={`${colors.white}10`} strokeWidth={6} />
                    <circle
                      cx={70} cy={70} r={60} fill="none"
                      stroke={colors.vitalsNormal} strokeWidth={6}
                      strokeDasharray={377} strokeDashoffset={377 - (377 * scoreDisplay / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                  </svg>
                  <span style={{ fontFamily: fonts.heading, fontSize: 50, fontWeight: 800, color: colors.white }}>
                    {scoreDisplay}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 15, color: colors.oasis }}>Overall Score</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.vitalsNormal, background: `${colors.vitalsNormal}20`, padding: "2px 8px", borderRadius: 4 }}>
                    Top 15%
                  </span>
                </div>
              </GlassPanel>

              {/* Competency bars */}
              <GlassPanel enterFrame={205} exitFrame={715} style={{ padding: "12px 14px", flex: 1 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Competency Scores
                </div>
                {categories.map((cat, i) => (
                  <div key={cat.label} style={{ marginBottom: 10, opacity: interpolate(frame, [220 + i * 8, 233 + i * 8], [0, 1], clamp) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.white }}>{cat.label}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: skillBars[i] >= 85 ? colors.vitalsNormal : colors.oasis }}>
                        {Math.floor(skillBars[i])}%
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: `${colors.white}10` }}>
                      <div style={{
                        width: `${skillBars[i]}%`, height: "100%", borderRadius: 3,
                        background: skillBars[i] >= 85 ? colors.vitalsNormal : colors.oasis,
                      }} />
                    </div>
                  </div>
                ))}
              </GlassPanel>

              {/* Student vs Cohort */}
              <GlassPanel enterFrame={330} exitFrame={715} style={{ padding: "12px 14px" }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Student vs Cohort
                </div>
                {comparisonMetrics.map((m, i) => {
                  const mOp = interpolate(frame, [335 + i * 7, 348 + i * 7], [0, 1], clamp);
                  return (
                    <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", opacity: mOp }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}60`, width: 80 }}>{m.label}</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${colors.white}08`, position: "relative" }}>
                        <div style={{ position: "absolute", height: "100%", borderRadius: 2, background: `${colors.white}20`, width: `${m.cohort}%` }} />
                        <div style={{ position: "absolute", height: "100%", borderRadius: 2, background: colors.vitalsNormal, width: `${m.student}%`, opacity: 0.8 }} />
                      </div>
                      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.vitalsNormal, width: 24, textAlign: "right" as const }}>{m.student}</span>
                    </div>
                  );
                })}
              </GlassPanel>
            </div>

            {/* ═══ CENTER COLUMN: Rubric Checklist ═══ */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {(() => {
                let itemIdx = 0;
                return rubricSections.map((section, sIdx) => {
                  const sectionEnter = 235 + sIdx * 15;
                  return (
                    <GlassPanel key={section.title} enterFrame={sectionEnter} exitFrame={715} style={{ padding: "8px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.oasis }}>
                          {section.title}
                        </span>
                        <span style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50` }}>
                          {section.items.filter((it) => it.output === "YES").length}/{section.items.length}
                        </span>
                      </div>
                      {section.items.map((item) => {
                        const idx = itemIdx++;
                        const isYes = item.output === "YES";

                        // Faculty edit overrides for specific items
                        const isAggravatingFactors = item.criterion === "Asked about aggravating factors";
                        const isFamilyHistory = item.criterion === "Asked about family history";
                        const displayOutput = isAggravatingFactors && editFlip > 0.5 ? "YES" : item.output;
                        const displayIsYes = displayOutput === "YES";
                        const showEditIndicator = (isAggravatingFactors && editFlip > 0) || (isFamilyHistory && editConfirm > 0);

                        return (
                          <div
                            key={item.criterion}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "3px 0", opacity: rubricReveals[idx],
                              borderBottom: `1px solid ${colors.white}06`,
                              background: showEditIndicator ? `${colors.azurite}08` : "transparent",
                              marginLeft: -8, marginRight: -8, paddingLeft: 8, paddingRight: 8,
                              borderRadius: showEditIndicator ? 4 : 0,
                            }}
                          >
                            <span style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}85`, flex: 1 }}>
                              {item.criterion}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {isAggravatingFactors && editFlip > 0 && editFlip <= 0.5 && (
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 13, color: colors.vitalsCritical,
                                  textDecoration: "line-through", opacity: 0.5,
                                }}>NO</span>
                              )}
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                                color: displayIsYes ? colors.vitalsNormal : colors.vitalsCritical,
                                background: displayIsYes ? `${colors.vitalsNormal}20` : `${colors.vitalsCritical}20`,
                                padding: "2px 8px", borderRadius: 4,
                              }}>
                                {displayOutput}
                              </span>
                              {showEditIndicator && (
                                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.azurite, opacity: 0.7 }}>edited</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </GlassPanel>
                  );
                });
              })()}
            </div>

            {/* ═══ RIGHT COLUMN: Feedback + Session Info + Faculty Actions ═══ */}
            <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Strengths */}
              <GlassPanel enterFrame={330} exitFrame={715} style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.vitalsNormal, marginBottom: 6 }}>
                  Strengths
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}75`, lineHeight: 1.6 }}>
                  {feedback.strengths}
                </div>
              </GlassPanel>

              {/* Areas for Improvement */}
              <GlassPanel enterFrame={345} exitFrame={715} style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.vitalsWarning, marginBottom: 6 }}>
                  Areas for Improvement
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}75`, lineHeight: 1.6 }}>
                  {feedback.weaknesses}
                </div>
              </GlassPanel>

              {/* Session Details */}
              <GlassPanel enterFrame={365} exitFrame={715} style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Session Details
                </div>
                {[
                  { label: "Case", value: "Pneumonia — Adult" },
                  { label: "Duration", value: "14:32" },
                  { label: "Questions Asked", value: "23" },
                  { label: "Exam Steps", value: "8 / 12" },
                  { label: "Transcript Words", value: "1,847" },
                ].map((d, i) => (
                  <div key={d.label} style={{
                    display: "flex", justifyContent: "space-between", padding: "3px 0",
                    borderBottom: `1px solid ${colors.white}06`,
                    opacity: interpolate(frame, [370 + i * 5, 378 + i * 5], [0, 1], clamp),
                  }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}60` }}>{d.label}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis }}>{d.value}</span>
                  </div>
                ))}
              </GlassPanel>

              {/* Faculty Actions */}
              <GlassPanel enterFrame={395} exitFrame={715} style={{ padding: "12px 16px" }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Faculty Actions
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                  opacity: editModeOn,
                }}>
                  <PulsingDot color={colors.azurite} size={8} delay={400} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.azurite }}>
                    Reviewing rubric items...
                  </span>
                </div>
                {/* Edit log */}
                {editFlip > 0.5 && (
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}70`,
                    padding: "6px 8px", background: `${colors.white}06`, borderRadius: 4,
                    marginBottom: 6,
                    opacity: interpolate(frame, [430, 440], [0, 1], clamp),
                  }}>
                    Changed "Aggravating factors" NO → YES
                  </div>
                )}
                {editConfirm > 0.5 && (
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}70`,
                    padding: "6px 8px", background: `${colors.white}06`, borderRadius: 4,
                    marginBottom: 6,
                    opacity: interpolate(frame, [455, 465], [0, 1], clamp),
                  }}>
                    Confirmed "Family history" as NO
                  </div>
                )}
                {/* Score update */}
                {scoreAdjust > 0 && (
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 13, color: colors.vitalsNormal,
                    marginTop: 4,
                    opacity: interpolate(frame, [455, 465], [0, 1], clamp),
                  }}>
                    Score updated: 87% → {scoreDisplay}%
                  </div>
                )}
                {/* Finalize button */}
                <div style={{
                  marginTop: 10,
                  fontFamily: fonts.heading, fontSize: 14, fontWeight: 700,
                  textAlign: "center" as const, padding: "8px 14px", borderRadius: 6,
                  color: finalizedOn > 0.5 ? colors.vitalsNormal : colors.white,
                  background: finalizedOn > 0.5 ? `${colors.vitalsNormal}20` : colors.oasis,
                  opacity: interpolate(frame, [465, 475], [0, 1], clamp),
                }}>
                  {finalizedOn > 0.5 ? "✓ Review Finalized" : "Finalize Review"}
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}
    </SceneShell>
  );
};
