import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";
import { PulsingDot } from "../components/PulsingDot";

/* ── Chat messages ── */
const chatMessages = [
  { sender: "student" as const, text: "What brings you in today?" },
  { sender: "patient" as const, text: "I've had trouble breathing for about 3 days, and my ankles are really swollen." },
  { sender: "student" as const, text: "Any chest pain or palpitations?" },
  { sender: "patient" as const, text: "No chest pain, but my heart feels like it's racing sometimes." },
];

/* ── Vitals ── */
const vitals = [
  { label: "HR", value: "112", unit: "bpm", color: colors.vitalsWarning },
  { label: "BP", value: "148/92", unit: "mmHg", color: colors.vitalsWarning },
  { label: "SpO\u2082", value: "94", unit: "%", color: colors.vitalsWarning },
  { label: "Temp", value: "37.8", unit: "\u00B0C", color: colors.vitalsNormal },
  { label: "RR", value: "24", unit: "/min", color: colors.vitalsWarning },
];

/* ── Exam instruments ── */
const instruments = [
  "Penlight", "Ophthalmoscope", "Otoscope",
  "Reflex Hammer", "Tuning Fork", "Stethoscope",
];

/* ── Examination categories ── */
const examCategories = [
  "Introduction", "Vital Signs", "Skin", "Head & Face",
  "Motor", "Facial Muscles", "Eyes", "Ears", "Hearing", "Nose",
];

/* ── Exam findings with real clinical media types ── */
const examFindings = [
  { tool: "Stethoscope", finding: "Bilateral crackles, S3 gallop", mediaType: "audio" as const },
  { tool: "Palpation", finding: "2+ pitting edema, bilateral", mediaType: "image" as const },
  { tool: "Percussion", finding: "Dull bases bilaterally", mediaType: "audio" as const },
];

/* ── Media library items shown in overlay ── */
const mediaLibraryItems = [
  { label: "Heart Sounds", type: "Audio", icon: "♫", color: colors.vitalsWarning },
  { label: "Lung Auscultation", type: "Audio", icon: "♫", color: colors.oasis },
  { label: "Fundoscopic Exam", type: "Image", icon: "◉", color: "#06b6d4" },
  { label: "Skin Lesion", type: "Image", icon: "◉", color: "#a855f7" },
];

/* ── Differential diagnoses ── */
const differentials = [
  { name: "Acute Decompensated Heart Failure", likelihood: "High", color: colors.vitalsCritical },
  { name: "Pneumonia with Fluid Overload", likelihood: "Moderate", color: colors.vitalsWarning },
  { name: "Pulmonary Embolism", likelihood: "Low", color: colors.oasis },
];

/* ── Diagnostic tests ── */
const diagnosticTests = [
  { name: "BNP / NT-proBNP", status: "Ordered", result: "1,840 pg/mL", severity: "Critical" },
  { name: "Chest X-Ray", status: "Ordered", result: "Cardiomegaly, bilateral effusions", severity: "Abnormal" },
  { name: "ECG 12-Lead", status: "Ordered", result: "LVH, sinus tachycardia", severity: "Abnormal" },
  { name: "BMP", status: "Ordered", result: "Cr 1.8, K+ 5.1", severity: "Abnormal" },
];

/* ── Assessment & Plan items ── */
const assessmentItems = [
  { label: "Primary Dx", value: "Acute Decompensated HF (NYHA III)" },
  { label: "Diuresis", value: "Furosemide 40mg IV now" },
  { label: "O\u2082 Therapy", value: "2L NC, target SpO\u2082 > 95%" },
  { label: "Consult", value: "Cardiology — urgent" },
];

/* ── Encounter form sections ── */
const encounterSections = [
  { label: "History of Present Illness", status: "Complete", items: 8 },
  { label: "Physical Examination", status: "Complete", items: 12 },
  { label: "Differential Diagnosis", status: "Complete", items: 3 },
  { label: "Diagnostic Workup", status: "Complete", items: 4 },
  { label: "Assessment & Plan", status: "Complete", items: 4 },
];

/* ── Patient cases ── */
const patientCases = [
  { name: "Maria Santos", age: "67F", cc: "Dyspnea, edema", acuity: "Urgent" },
  { name: "James Chen", age: "45M", cc: "Chest pain", acuity: "Emergent" },
  { name: "Sarah Williams", age: "28F", cc: "Headache, fever", acuity: "Standard" },
  { name: "Robert Johnson", age: "72M", cc: "Confusion, falls", acuity: "Urgent" },
];

/* ── Nav tabs — updated to match full VP workflow ── */
const navTabs = ["Chat", "Poses", "Examine", "Diagnosis", "Tests", "Medication", "Assessment"];

/**
 * Scene 4: Virtual Patient — ~1400 frames
 * Audio starts at frame 45, ~43s duration (ends ~f1335)
 *
 * Narration sync (new longer script):
 *   f45-165:    "Students enter the Virtual Patient..."                       → Phase 1: case selection
 *   f165-255:   "A 3D patient model with vital signs..."                      → transition to main UI
 *   f255-405:   "interviews through natural conversation..."                  → Phase 2: chat/interview
 *   f405-525:   "Then, the physical exam — stethoscope, palpation..."         → Phase 3a: instruments
 *   f525-765:   "each revealing real clinical media... mapped to the case."   → Phase 3b: media overlay
 *   f765-915:   "builds a differential diagnosis... support it."              → Phase 4: differential + tests
 *   f915-1035:  "assessment and planning... consult if needed."               → Phase 5: assessment
 *   f1035-1215: "full encounter... review. Submit."                           → Phase 6: encounter + submit
 *
 * Phase 1 (65-155):    Case selection
 * Phase 2 (155-420):   Interview — Chat tab (patient appears ~f160)
 * Phase 3 (420-780):   Physical Exam + Media — Examine tab
 * Phase 4 (780-930):   Differential + Tests — Diagnosis tab
 * Phase 5 (930-1100):  Assessment & Plan — Assessment tab
 * Phase 6 (1100-1370): Encounter Review + Submit
 */
export const Scene4_VirtualPatient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // ── Phase flags ──
  const isPhase1 = frame >= 65 && frame < 155;
  const isPhase2 = frame >= 155 && frame < 420;
  const isPhase3 = frame >= 420 && frame < 780;
  const isPhase4 = frame >= 780 && frame < 930;
  const isPhase5 = frame >= 930 && frame < 1100;
  const isPhase6 = frame >= 1100 && frame < 1370;
  const isMainUI = frame >= 155 && frame < 1370;

  // ── Phase 1 ──
  const phase1Opacity = interpolate(frame, [65, 80, 130, 155], [0, 1, 1, 0], clamp);
  const selectionProgress = interpolate(frame, [110, 135], [0, 1], clamp);

  // ── Phase transitions ──
  const mainUIOpacity = interpolate(frame, [155, 175, 1340, 1370], [0, 1, 1, 0], clamp);
  const phase2Opacity = interpolate(frame, [155, 175, 400, 420], [0, 1, 1, 0], clamp);
  const phase3Opacity = interpolate(frame, [420, 445, 755, 780], [0, 1, 1, 0], clamp);
  const phase4Opacity = interpolate(frame, [780, 800, 905, 930], [0, 1, 1, 0], clamp);
  const phase5Opacity = interpolate(frame, [930, 948, 1075, 1100], [0, 1, 1, 0], clamp);
  const phase6Opacity = interpolate(frame, [1100, 1120, 1340, 1370], [0, 1, 1, 0], clamp);

  // ── Active tab ──
  const activeTab = isPhase3 ? "Examine" : isPhase4 ? "Diagnosis" : isPhase5 ? "Assessment" : "Chat";

  // ── Timer ──
  const timerSeconds = Math.floor(interpolate(frame, [155, 1370], [0, 420], clamp));
  const timerMin = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const timerSec = String(timerSeconds % 60).padStart(2, "0");

  // ── Instrument selection (Phase 3) ──
  const selectedInstrument = frame < 530 ? -1 : 5; // Stethoscope

  // ── Category checks (Phase 3) ──
  const categoriesChecked = Math.floor(interpolate(frame, [500, 680], [0, 4], clamp));

  // ── Media overlay (Phase 3) ──
  const showMediaOverlay = frame >= 620 && frame < 770;
  const mediaOverlayOpacity = interpolate(frame, [620, 640, 745, 770], [0, 1, 1, 0], clamp);

  // ── Submit animation (Phase 6) ──
  const submitProgress = interpolate(frame, [1300, 1330], [0, 1], clamp);

  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.04} waveSpeed={0.01} />
      <ParticleField count={60} color={colors.oasis} speed={0.001} opacity={0.12} />
      <GlowOrb position={[0, 0, -3]} color={colors.oasis} radius={2} baseOpacity={0.06} />
      <CameraRig positions={[
        { frame: 0, position: [0, 0, 10] },
        { frame: 155, position: [0, 0, 9] },
        { frame: 420, position: [0, 0, 8.5] },
        { frame: 780, position: [0, 0, 9] },
        { frame: 1400, position: [0, 0, 9.5] },
      ]} />
    </>
  );

  return (
    <SceneShell
      interstitial={{ step: 3, title: "Simulate", subtitle: "Virtual Patient Encounter" }}
      sectionLabel="3D Simulation — Virtual Patient"
      bgGradient={`linear-gradient(160deg, ${colors.midnight} 0%, #0a1628 50%, ${colors.arizonaBlue} 100%)`}
      threeContent={threeContent}
    >
      {/* ══════════════════════════════════════════
          Phase 1: Case Selection
         ══════════════════════════════════════════ */}
      {isPhase1 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: phase1Opacity, pointerEvents: "none", zIndex: 10,
        }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 28, fontWeight: 700,
            color: colors.white, marginBottom: 8,
            opacity: interpolate(frame, [70, 95], [0, 1], clamp),
          }}>Select a Patient Case</div>
          <div style={{
            fontFamily: fonts.body, fontSize: 15, color: `${colors.white}70`, marginBottom: 36,
            opacity: interpolate(frame, [80, 100], [0, 1], clamp),
          }}>Choose a virtual patient to begin the encounter</div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, justifyContent: "center", maxWidth: 900 }}>
            {patientCases.map((pc, i) => {
              const cardDelay = 75 + i * 10;
              const cardSpring = spring({ frame: frame - cardDelay, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } });
              const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
              const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
              const isSelected = i === 0;
              const selectedGlow = isSelected ? interpolate(selectionProgress, [0, 1], [0, 1]) : 0;
              const unselectedFade = !isSelected ? interpolate(selectionProgress, [0, 1], [1, 0.3]) : 1;
              const acuityColor = pc.acuity === "Emergent" ? colors.vitalsCritical : pc.acuity === "Urgent" ? colors.vitalsWarning : colors.oasis;

              return (
                <div key={i} style={{
                  width: 195, padding: "20px 18px",
                  background: isSelected && selectedGlow > 0
                    ? `linear-gradient(135deg, rgba(12,35,75,0.85), rgba(30,82,136,${0.4 + selectedGlow * 0.3}))`
                    : "rgba(12,35,75,0.7)",
                  border: `1px solid ${isSelected && selectedGlow > 0 ? colors.oasis : `${colors.white}15`}`,
                  borderRadius: 14,
                  transform: `scale(${cardScale * (isSelected ? 1 + selectedGlow * 0.04 : 1)})`,
                  opacity: cardOpacity * unselectedFade,
                  boxShadow: isSelected && selectedGlow > 0
                    ? `0 0 30px ${colors.oasis}30, inset 0 0 20px ${colors.oasis}08`
                    : "none",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", margin: "0 auto 12px",
                    background: `linear-gradient(135deg, ${colors.azurite}, ${colors.oasis})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white,
                  }}>{pc.name.split(" ").map(n => n[0]).join("")}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white, textAlign: "center" as const }}>{pc.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}60`, textAlign: "center" as const, marginTop: 4 }}>{pc.age}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}50`, textAlign: "center" as const, marginTop: 8 }}>{pc.cc}</div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 10, fontWeight: 600,
                    color: acuityColor, textAlign: "center" as const, marginTop: 10,
                    background: `${acuityColor}15`, padding: "3px 10px", borderRadius: 4,
                    display: "inline-block", width: "auto",
                    marginLeft: "auto", marginRight: "auto",
                    left: "50%", position: "relative" as const, transform: "translateX(-50%)",
                  }}>{pc.acuity}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          Main VP Interface (Phases 2–6)
         ══════════════════════════════════════════ */}
      {isMainUI && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          opacity: mainUIOpacity, pointerEvents: "none", zIndex: 10,
        }}>
          {/* ── Top Nav Bar ── */}
          <div style={{
            height: 52, display: "flex", alignItems: "center",
            background: `linear-gradient(90deg, ${colors.arizonaBlue}, ${colors.midnight})`,
            borderBottom: `1px solid ${colors.white}12`,
            padding: "0 24px", flexShrink: 0,
            opacity: interpolate(frame, [158, 175], [0, 1], clamp),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white }}>
                Virtual Patient
              </span>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: `${colors.white}10`, borderRadius: 16, padding: "4px 12px",
              }}>
                <PulsingDot color={colors.vitalsCritical} size={6} delay={165} />
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.white }}>
                  {timerMin}:{timerSec}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 2 }}>
              {navTabs.map((tab, i) => {
                const isActive = tab === activeTab;
                const tabEnter = interpolate(frame, [163 + i * 4, 175 + i * 4], [0, 1], clamp);
                return (
                  <div key={tab} style={{
                    fontFamily: fonts.heading, fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? colors.white : `${colors.white}50`,
                    background: isActive ? `${colors.oasis}25` : "transparent",
                    padding: "8px 14px", borderRadius: 8,
                    opacity: tabEnter,
                    border: isActive ? `1px solid ${colors.oasis}40` : "1px solid transparent",
                    transition: "all 0.3s ease",
                  }}>{tab}</div>
                );
              })}
            </div>
          </div>

          {/* ── Vitals Strip ── */}
          {frame >= 170 && frame < 1370 && (
            <div style={{
              height: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
              background: "rgba(12,35,75,0.6)",
              borderBottom: `1px solid ${colors.white}06`,
              opacity: interpolate(frame, [170, 190, 1340, 1365], [0, 1, 1, 0], clamp),
            }}>
              {vitals.map((v, i) => {
                const vOpacity = interpolate(frame, [175 + i * 6, 190 + i * 6], [0, 1], clamp);
                return (
                  <div key={v.label} style={{
                    display: "flex", alignItems: "baseline", gap: 6, opacity: vOpacity,
                  }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}45`, letterSpacing: 0.8 }}>{v.label}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 700, color: v.color }}>{v.value}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 9, color: `${colors.white}30` }}>{v.unit}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Main Content Area ── */}
          <div style={{ flex: 1, display: "flex", position: "relative" as const, overflow: "hidden" }}>

            {/* ══ Left Sidebar: Instruments (Phase 3 only) ══ */}
            {isPhase3 && (
              <div style={{
                width: 210, padding: "14px 12px",
                background: "rgba(12,35,75,0.5)",
                borderRight: `1px solid ${colors.white}08`,
                display: "flex", flexDirection: "column", gap: 8,
                opacity: interpolate(frame, [425, 450], [0, 1], clamp),
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {["Front", "Back"].map((side, i) => (
                    <div key={side} style={{
                      flex: 1, textAlign: "center" as const,
                      fontFamily: fonts.heading, fontSize: 12, fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? colors.white : `${colors.white}50`,
                      background: i === 0 ? colors.arizonaBlue : `${colors.white}06`,
                      padding: "6px 0", borderRadius: 6,
                      border: `1px solid ${i === 0 ? `${colors.oasis}30` : `${colors.white}08`}`,
                    }}>{side}</div>
                  ))}
                </div>

                <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.white }}>Instruments</div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: `${colors.white}40`, marginBottom: 4 }}>
                  Select an instrument to examine
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {instruments.map((inst, i) => {
                    const instDelay = 450 + i * 10;
                    const instOpacity = interpolate(frame, [instDelay, instDelay + 14], [0, 1], clamp);
                    const isInstSelected = i === selectedInstrument;
                    const selectGlow = isInstSelected ? interpolate(frame, [530, 555], [0, 1], clamp) : 0;
                    return (
                      <div key={inst} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "10px 6px", borderRadius: 8,
                        background: isInstSelected && selectGlow > 0 ? `${colors.oasis}15` : `${colors.white}05`,
                        border: `1px solid ${isInstSelected && selectGlow > 0 ? `${colors.oasis}50` : `${colors.white}10`}`,
                        opacity: instOpacity, gap: 4,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 6,
                          background: `${colors.white}06`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16,
                        }}>
                          {["🔦", "👁", "🔍", "🔨", "🎵", "🩺"][i]}
                        </div>
                        <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.white, textAlign: "center" as const }}>{inst}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ Center: Patient Area ══ */}
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative" as const,
            }}>
              {/* Patient model — visible during Phases 2 & 3 */}
              {frame >= 160 && frame < 790 && (
                <Img
                  src={staticFile("screenshots/patientvector.png")}
                  style={{
                    height: "72%",
                    objectFit: "contain" as const,
                    opacity: interpolate(frame, [160, 185, 760, 790], [0, 1, 1, 0], clamp),
                    filter: `drop-shadow(0 4px 20px rgba(0,0,0,0.3))`,
                  }}
                />
              )}

              {/* Interview Active badge (Phase 2) */}
              {isPhase2 && (
                <div style={{
                  position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: interpolate(frame, [185, 205], [0, 1], clamp),
                }}>
                  <PulsingDot color={colors.vitalsNormal} size={8} delay={190} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.vitalsNormal }}>
                    Patient Interview Active
                  </span>
                </div>
              )}

              {/* ── Media Findings Overlay (Phase 3, mid-section) ── */}
              {showMediaOverlay && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.82)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  opacity: mediaOverlayOpacity, zIndex: 20,
                  borderRadius: 0,
                }}>
                  <div style={{
                    width: 520, background: "rgba(12,35,75,0.95)",
                    border: `1px solid ${colors.white}15`, borderRadius: 14,
                    padding: "24px 28px", boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white }}>
                          Examination Findings
                        </div>
                        <div style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}50`, marginTop: 2 }}>
                          Real clinical media from patient library
                        </div>
                      </div>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 20, color: `${colors.white}30`, cursor: "pointer",
                      }}>✕</div>
                    </div>

                    {/* Audio waveform placeholder */}
                    <div style={{
                      height: 80, borderRadius: 10,
                      background: `linear-gradient(135deg, rgba(30,82,136,0.4), rgba(12,35,75,0.6))`,
                      border: `1px solid ${colors.oasis}20`,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                      marginBottom: 16,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: colors.oasis, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 16, color: colors.white }}>▶</span>
                      </div>
                      {/* Waveform bars */}
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const barHeight = 8 + Math.sin(i * 0.8 + frame * 0.1) * 18;
                          return (
                            <div key={i} style={{
                              width: 3, height: barHeight, borderRadius: 2,
                              background: `${colors.oasis}${i < 12 ? "90" : "40"}`,
                            }} />
                          );
                        })}
                      </div>
                      <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}50` }}>
                        Heart Sounds — S3 Gallop
                      </span>
                    </div>

                    {/* Media library tags */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {mediaLibraryItems.map((item, i) => {
                        const tagDelay = 640 + i * 10;
                        const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 10], [0, 1], clamp);
                        return (
                          <div key={item.label} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: `${item.color}12`, border: `1px solid ${item.color}30`,
                            borderRadius: 6, padding: "5px 10px",
                            opacity: tagOpacity,
                          }}>
                            <span style={{ fontSize: 12 }}>{item.icon}</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.white }}>{item.label}</span>
                            <span style={{ fontFamily: fonts.mono, fontSize: 9, color: `${item.color}` }}>{item.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Phase 4: Differential Diagnosis + Tests ── */}
              {isPhase4 && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", gap: 16, padding: 20,
                  opacity: phase4Opacity,
                }}>
                  {/* Differential panel */}
                  <div style={{
                    flex: 1, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "18px 20px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Differential Diagnosis
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}40`, marginBottom: 14 }}>
                      Ranked by clinical likelihood
                    </div>
                    {differentials.map((dx, i) => {
                      const dxDelay = 795 + i * 15;
                      const dxOpacity = interpolate(frame, [dxDelay, dxDelay + 10], [0, 1], clamp);
                      return (
                        <div key={dx.name} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 8,
                          background: `${dx.color}08`, borderLeft: `3px solid ${dx.color}`,
                          marginBottom: 8, opacity: dxOpacity,
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.white, fontWeight: 600 }}>{dx.name}</div>
                          </div>
                          <span style={{
                            fontFamily: fonts.mono, fontSize: 10, fontWeight: 600, color: dx.color,
                            background: `${dx.color}15`, padding: "3px 8px", borderRadius: 4,
                          }}>{dx.likelihood}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tests panel */}
                  <div style={{
                    flex: 1, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "18px 20px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Diagnostic Tests
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}40`, marginBottom: 14 }}>
                      Ordered to support diagnosis
                    </div>
                    {diagnosticTests.map((test, i) => {
                      const testDelay = 810 + i * 12;
                      const testOpacity = interpolate(frame, [testDelay, testDelay + 10], [0, 1], clamp);
                      const sevColor = test.severity === "Critical" ? colors.vitalsCritical : colors.vitalsWarning;
                      return (
                        <div key={test.name} style={{
                          padding: "8px 12px", borderRadius: 8,
                          background: `${colors.white}04`, border: `1px solid ${colors.white}08`,
                          marginBottom: 6, opacity: testOpacity,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.white }}>{test.name}</span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 9, fontWeight: 600, color: sevColor,
                              background: `${sevColor}15`, padding: "2px 6px", borderRadius: 3,
                            }}>{test.severity}</span>
                          </div>
                          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}60`, marginTop: 3 }}>{test.result}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Phase 5: Assessment & Plan ── */}
              {isPhase5 && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 20, opacity: phase5Opacity,
                }}>
                  <div style={{
                    width: 560, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "22px 26px",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Assessment & Plan
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}40`, marginBottom: 16 }}>
                      Document approach and consult orders
                    </div>
                    {assessmentItems.map((item, i) => {
                      const apDelay = 945 + i * 12;
                      const apOpacity = interpolate(frame, [apDelay, apDelay + 10], [0, 1], clamp);
                      const isConsult = item.label === "Consult";
                      return (
                        <div key={item.label} style={{
                          display: "flex", gap: 12, marginBottom: 10,
                          padding: "10px 14px", borderRadius: 8,
                          background: isConsult ? `${colors.vitalsWarning}08` : `${colors.white}04`,
                          border: `1px solid ${isConsult ? `${colors.vitalsWarning}25` : `${colors.white}08`}`,
                          opacity: apOpacity,
                        }}>
                          <span style={{
                            fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                            color: isConsult ? colors.vitalsWarning : colors.oasis,
                            minWidth: 80, flexShrink: 0,
                          }}>{item.label}</span>
                          <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.white }}>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Phase 6: Encounter Review + Submit ── */}
              {isPhase6 && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 20, opacity: phase6Opacity,
                }}>
                  <div style={{
                    width: 480, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "22px 26px",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Patient Encounter
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}40`, marginBottom: 16 }}>
                      Full encounter summary — ready for submission
                    </div>

                    {encounterSections.map((sec, i) => {
                      const secDelay = 1120 + i * 12;
                      const secOpacity = interpolate(frame, [secDelay, secDelay + 10], [0, 1], clamp);
                      return (
                        <div key={sec.label} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "9px 14px", borderRadius: 6,
                          background: `${colors.white}04`, borderBottom: `1px solid ${colors.white}06`,
                          marginBottom: 4, opacity: secOpacity,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.vitalsNormal }}>✓</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.white }}>{sec.label}</span>
                          </div>
                          <span style={{ fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}40` }}>
                            {sec.items} items
                          </span>
                        </div>
                      );
                    })}

                    {/* Submit button */}
                    <div style={{
                      marginTop: 18, padding: "12px 0", borderRadius: 8, textAlign: "center" as const,
                      background: submitProgress > 0
                        ? `linear-gradient(135deg, ${colors.vitalsNormal}, #059669)`
                        : `linear-gradient(135deg, ${colors.arizonaBlue}, ${colors.azurite})`,
                      border: `1px solid ${submitProgress > 0 ? `${colors.vitalsNormal}50` : `${colors.oasis}30`}`,
                      fontFamily: fonts.heading, fontSize: 15, fontWeight: 700,
                      color: colors.white,
                      opacity: interpolate(frame, [1280, 1300], [0, 1], clamp),
                      transform: `scale(${submitProgress > 0 ? 1 + submitProgress * 0.03 : 1})`,
                      boxShadow: submitProgress > 0 ? `0 0 24px ${colors.vitalsNormal}30` : "none",
                    }}>
                      {submitProgress > 0.5 ? "✓ Session Submitted" : "Submit Encounter"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ══ Right Sidebar ══ */}
            {(isPhase2 || isPhase3) && (
              <div style={{
                width: isPhase3 ? 260 : 360,
                padding: "14px",
                background: "rgba(12,35,75,0.5)",
                borderLeft: `1px solid ${colors.white}08`,
                display: "flex", flexDirection: "column", gap: 10,
                flexShrink: 0,
                opacity: interpolate(frame, [180, 205], [0, 1], clamp),
              }}>
                {/* ── Phase 2: Chat Panel ── */}
                {isPhase2 && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 10, flex: 1,
                    opacity: phase2Opacity,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                      <span style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>
                        Patient Interview
                      </span>
                      <PulsingDot color={colors.oasis} size={7} delay={195} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      {chatMessages.map((msg, i) => {
                        const msgDelay = 220 + i * 35;
                        const msgOpacity = interpolate(frame, [msgDelay, msgDelay + 16], [0, 1], clamp);
                        const isStudent = msg.sender === "student";
                        return (
                          <div key={i} style={{
                            display: "flex", justifyContent: isStudent ? "flex-end" : "flex-start",
                            opacity: msgOpacity,
                          }}>
                            <div style={{
                              maxWidth: "88%", padding: "9px 13px", borderRadius: 10,
                              background: isStudent
                                ? `linear-gradient(135deg, ${colors.arizonaBlue}, ${colors.azurite})`
                                : `${colors.white}10`,
                              border: `1px solid ${isStudent ? `${colors.oasis}20` : `${colors.white}08`}`,
                              fontFamily: fonts.body, fontSize: 13, color: colors.white, lineHeight: 1.45,
                            }}>
                              <div style={{
                                fontFamily: fonts.mono, fontSize: 9, color: isStudent ? colors.oasis : `${colors.white}40`,
                                marginBottom: 3,
                              }}>{isStudent ? "Student" : "Patient"}</div>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{
                      padding: "9px 13px", borderRadius: 8,
                      background: `${colors.white}06`, border: `1px solid ${colors.white}10`,
                      fontFamily: fonts.body, fontSize: 12, color: `${colors.white}25`,
                      opacity: interpolate(frame, [370, 395], [0, 1], clamp),
                    }}>Type your response...</div>
                  </div>
                )}

                {/* ── Phase 3: Examination Categories + Findings ── */}
                {isPhase3 && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 8, flex: 1,
                    opacity: phase3Opacity,
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>
                      Examination Categories
                    </div>

                    <div style={{
                      padding: "7px 10px", borderRadius: 8,
                      background: `${colors.white}05`, border: `1px solid ${colors.white}12`,
                      fontFamily: fonts.body, fontSize: 11, color: `${colors.white}25`,
                      opacity: interpolate(frame, [435, 455], [0, 1], clamp),
                    }}>Search categories...</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflow: "hidden" }}>
                      {examCategories.map((cat, i) => {
                        const catDelay = 445 + i * 8;
                        const catOpacity = interpolate(frame, [catDelay, catDelay + 12], [0, 1], clamp);
                        const isChecked = i < categoriesChecked;
                        const checkAnim = isChecked ? interpolate(frame, [510 + i * 40, 530 + i * 40], [0, 1], clamp) : 0;
                        return (
                          <div key={cat} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "7px 12px", borderRadius: 5,
                            background: isChecked && checkAnim > 0 ? `${colors.oasis}08` : `${colors.white}03`,
                            borderBottom: `1px solid ${colors.white}05`,
                            opacity: catOpacity,
                          }}>
                            <span style={{
                              fontFamily: fonts.body, fontSize: 13,
                              color: isChecked && checkAnim > 0 ? colors.oasis : colors.white,
                              fontWeight: isChecked ? 600 : 400,
                            }}>{cat}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              {isChecked && checkAnim > 0 && (
                                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.vitalsNormal, opacity: checkAnim }}>✓</span>
                              )}
                              <span style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}20` }}>›</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Findings */}
                    <div style={{
                      borderTop: `1px solid ${colors.white}10`, paddingTop: 8, marginTop: "auto",
                      opacity: interpolate(frame, [560, 585], [0, 1], clamp),
                    }}>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 9, color: `${colors.white}40`,
                        letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6,
                      }}>Findings</div>
                      {examFindings.map((ef, i) => {
                        const fOpacity = interpolate(frame, [575 + i * 16, 591 + i * 16], [0, 1], clamp);
                        return (
                          <div key={ef.tool} style={{
                            display: "flex", gap: 6, marginBottom: 6, opacity: fOpacity, alignItems: "center",
                          }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 10, fontWeight: 600, color: colors.oasis,
                              background: `${colors.oasis}12`, padding: "2px 6px", borderRadius: 3,
                              whiteSpace: "nowrap" as const, flexShrink: 0,
                            }}>{ef.tool}</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}70`, lineHeight: 1.3 }}>{ef.finding}</span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 8, color: ef.mediaType === "audio" ? colors.vitalsWarning : "#06b6d4",
                              background: `${ef.mediaType === "audio" ? colors.vitalsWarning : "#06b6d4"}15`,
                              padding: "1px 5px", borderRadius: 3, flexShrink: 0,
                            }}>{ef.mediaType === "audio" ? "♫" : "◉"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </SceneShell>
  );
};
