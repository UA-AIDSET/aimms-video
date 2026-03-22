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
  { name: "Penlight", image: "penlight (1).png" },
  { name: "Ophthalmoscope", image: "ophthalmoscope (1).png" },
  { name: "Otoscope", image: "otoscope (1).png" },
  { name: "Reflex Hammer", image: "reflex_hammer (1).png" },
  { name: "Tuning Fork", image: "tuning_fork (1).png" },
  { name: "Stethoscope", image: "stethicon (1).png" },
  { name: "BP Cuff", image: "bloodpressurecuff (1).png" },
  { name: "Dermatoscope", image: "dermatoscope (1).png" },
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
  { label: "Heart Sounds", type: "Audio", color: colors.vitalsWarning },
  { label: "Lung Auscultation", type: "Audio", color: colors.oasis },
  { label: "Fundoscopic Exam", type: "Image", color: "#06b6d4" },
  { label: "Skin Lesion", type: "Image", color: "#a855f7" },
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
 * Scene 4: Virtual Patient — 1875 frames (62.5s)
 * Audio starts at frame 45, ~59.4s duration (ends ~f1827)
 *
 * All frame timings scaled ×1.38 from original 43s-audio version
 * to match the new longer narration track.
 *
 * Narration sync (59.4s audio):
 *   f45-200:    "Students enter the Virtual Patient..."         → Phase 1: case selection
 *   f200-290:   "A 3D patient model with vital signs..."        → transition to main UI
 *   f290-560:   "interviews through natural conversation..."    → Phase 2: chat/interview
 *   f560-715:   "Then, the physical exam — stethoscope..."      → Phase 3a: instruments
 *   f715-1045:  "each revealing real clinical media..."         → Phase 3b: media overlay
 *   f1045-1265: "builds a differential diagnosis..."            → Phase 4: differential + tests
 *   f1265-1460: "assessment and planning..."                    → Phase 5: assessment
 *   f1460-1875: "full encounter... review. Submit."             → Phase 6: encounter + submit
 *
 * Phase 1 (70-200):    Case selection
 * Phase 2 (200-555):   Interview — Chat tab
 * Phase 3 (555-1045):  Physical Exam + Media — Examine tab
 * Phase 4 (1045-1265): Differential + Tests — Diagnosis tab
 * Phase 5 (1265-1460): Assessment & Plan — Assessment tab
 * Phase 6 (1460-1875): Encounter Review + Submit
 */
export const Scene4_VirtualPatient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // ── Phase flags ──
  const isPhase1 = frame >= 70 && frame < 200;
  const isPhase2 = frame >= 200 && frame < 555;
  const isPhase3 = frame >= 555 && frame < 1045;
  const isPhase4 = frame >= 1045 && frame < 1265;
  const isPhase5 = frame >= 1265 && frame < 1460;
  const isPhase6 = frame >= 1460 && frame < 1875;
  const isMainUI = frame >= 200 && frame < 1875;

  // ── Phase 1 ──
  const phase1Opacity = interpolate(frame, [70, 93, 162, 197], [0, 1, 1, 0], clamp);
  const selectionProgress = interpolate(frame, [135, 170], [0, 1], clamp);

  // ── Phase transitions ──
  const mainUIOpacity = interpolate(frame, [200, 224, 1845, 1875], [0, 1, 1, 0], clamp);
  const phase2Opacity = interpolate(frame, [200, 224, 535, 563], [0, 1, 1, 0], clamp);
  const phase3Opacity = interpolate(frame, [563, 597, 1025, 1059], [0, 1, 1, 0], clamp);
  const phase4Opacity = interpolate(frame, [1059, 1087, 1235, 1265], [0, 1, 1, 0], clamp);
  const phase5Opacity = interpolate(frame, [1265, 1291, 1432, 1460], [0, 1, 1, 0], clamp);
  const phase6Opacity = interpolate(frame, [1460, 1490, 1845, 1875], [0, 1, 1, 0], clamp);

  // ── Active tab ──
  const activeTab = isPhase3 ? "Examine" : isPhase4 ? "Diagnosis" : isPhase5 ? "Assessment" : "Chat";

  // ── Timer ──
  const timerSeconds = Math.floor(interpolate(frame, [200, 1870], [0, 420], clamp));
  const timerMin = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const timerSec = String(timerSeconds % 60).padStart(2, "0");

  // ── Instrument selection (Phase 3) ──
  const selectedInstrument = frame < 715 ? -1 : 5; // Stethoscope

  // ── Category checks (Phase 3) ──
  const categoriesChecked = Math.floor(interpolate(frame, [673, 922], [0, 4], clamp));

  // ── Media overlay (Phase 3) ──
  const showMediaOverlay = frame >= 840 && frame < 1045;
  const mediaOverlayOpacity = interpolate(frame, [840, 867, 1011, 1046], [0, 1, 1, 0], clamp);

  // ── Submit animation (Phase 6) ──
  const submitProgress = interpolate(frame, [1778, 1818], [0, 1], clamp);

  // ── Vitals highlight — brief glow when strip first appears ──
  const vitalsHighlightOp = interpolate(frame, [218, 245, 310, 350], [0, 1, 1, 0], clamp);
  const vitalsHighlightPulse = 0.5 + 0.5 * Math.sin(frame * 0.18);

  // ── AI Guidance panel — appears during Differential phase ──
  const aiPanelOp = interpolate(frame, [1087, 1110, 1235, 1265], [0, 1, 1, 0], clamp);

  // ── Top-ranked differential glow ──
  const dxTopGlow = frame >= 1081 ? 0.4 + 0.3 * Math.sin((frame - 1081) * 0.1) : 0;

  /* ─────────────────────────────────────────────────────────────
     GUIDED FOCUS SYSTEM
     ───────────────────────────────────────────────────────────── */

  // ── Per-phase content zoom (applied individually to each content panel) ──
  const vitalsZoom   = interpolate(frame, [218, 250, 310, 360], [1.0, 1.06, 1.06, 1.0], clamp);
  const interviewZoom= interpolate(frame, [360, 420], [1.0, 1.03], clamp);
  const examZoom     = interpolate(frame, [563, 610], [1.0, 1.04], clamp);
  const mediaZoom    = interpolate(frame, [840, 875], [1.03, 1.07], clamp);
  const dxZoom       = interpolate(frame, [1059, 1110], [1.0, 1.07], clamp);
  const apZoom       = interpolate(frame, [1265, 1310], [1.0, 1.05], clamp);

  // ── Step badge — persistent label showing current phase ──
  const stepLabel = (() => {
    if (!isMainUI) return "";
    if (isPhase2 && frame < 370)       return "VITAL SIGNS";
    if (isPhase2)                       return "PATIENT INTERVIEW";
    if (isPhase3 && !showMediaOverlay)  return "PHYSICAL EXAM";
    if (showMediaOverlay)               return "MEDIA PLAYBACK";
    if (isPhase4)                       return "DIFFERENTIAL DIAGNOSIS";
    if (isPhase5)                       return "ASSESSMENT & PLAN";
    if (isPhase6)                       return "PATIENT ENCOUNTER";
    return "";
  })();

  const stepColor = (() => {
    if (isPhase2 && frame < 370)  return colors.vitalsWarning;
    if (isPhase2)                  return colors.oasis;
    if (showMediaOverlay)          return colors.vitalsWarning;
    if (isPhase4)                  return colors.vitalsCritical;
    if (isPhase5)                  return colors.oasis;
    if (isPhase6)                  return colors.vitalsNormal;
    return colors.azurite;
  })();

  const stepBadgeOp = isMainUI ? interpolate(frame, [200, 224], [0, 1], clamp) : 0;

  // ── Phase sweep accent — thin glowing line that signals a focus change ──
  // Appears briefly at each phase transition, then fades — no decorative icons.
  const phaseAccentOp = (() => {
    if (isPhase2 && frame >= 352 && frame < 430)  return interpolate(frame, [352, 368, 408, 432], [0, 1, 1, 0], clamp);
    if (isPhase3 && frame < 660 && !showMediaOverlay)
                                                   return interpolate(frame, [563, 580, 630, 665], [0, 1, 1, 0], clamp);
    if (showMediaOverlay && frame < 930)           return interpolate(frame, [840, 856, 900, 935], [0, 1, 1, 0], clamp);
    if (isPhase4 && frame < 1150)                  return interpolate(frame, [1059, 1076, 1120, 1160], [0, 1, 1, 0], clamp);
    if (isPhase5 && frame < 1370)                  return interpolate(frame, [1265, 1282, 1335, 1372], [0, 1, 1, 0], clamp);
    return 0;
  })();

  // Width of the sweep line grows from 0 → 100% within the first second of each phase
  const phaseAccentWidth = (() => {
    if (isPhase2 && frame >= 352)   return interpolate(frame, [352, 400], [0, 1], clamp);
    if (isPhase3 && frame >= 563)   return interpolate(frame, [563, 618], [0, 1], clamp);
    if (showMediaOverlay)           return interpolate(frame, [840, 895], [0, 1], clamp);
    if (isPhase4)                   return interpolate(frame, [1059, 1118], [0, 1], clamp);
    if (isPhase5)                   return interpolate(frame, [1265, 1322], [0, 1], clamp);
    return 0;
  })();

  // ── Vitals focus panel — enlarged centered display for vitals phase ──
  const vitalsZoomPanelOp = interpolate(frame, [218, 242, 310, 350], [0, 1, 1, 0], clamp);

  // ── DX critical moment badge ──
  const dxCriticalOp    = interpolate(frame, [1087, 1108, 1235, 1265], [0, 1, 1, 0], clamp);
  const dxCriticalPulse = frame >= 1087 ? 0.65 + 0.35 * Math.sin((frame - 1087) * 0.10) : 0;

  /* ─────────────────────────────────────────────────────────────────────
     PHASE 6 — ENCOUNTER REVIEW OVERLAY SYSTEM
     Three sequential, non-overlapping UI cards appear beside the form,
     each tied to a specific narration moment.

     Overlay 1 — Physical Exam Findings   f1550–1642
     Overlay 2 — Differential & A&P       f1650–1726
     Overlay 3 — Session Summary          f1758–1875
     ───────────────────────────────────────────────────────────────────── */
  const overlay1Op  = interpolate(frame, [1550, 1574, 1618, 1644], [0, 1, 1, 0], clamp);
  const overlay2Op  = interpolate(frame, [1650, 1672, 1702, 1728], [0, 1, 1, 0], clamp);
  const overlay3Op  = interpolate(frame, [1758, 1780, 1848, 1875], [0, 1, 1, 0], clamp);
  // Dim the main encounter form slightly when any overlay is active
  const enc6DimOp   = Math.max(overlay1Op, overlay2Op, overlay3Op) * 0.24;
  // Waveform bars driven by frame so they animate
  const wavePhase   = frame * 0.09;

  /* ─────────────────────────────────────────────────────────────────────
     PHASE 6 — 3D CALLOUT SYSTEM
     Sequential section labels appear left of the form card, each locked
     to one narration cue. Active section lifts forward; others dim.
     No two callouts are active simultaneously.

     callout 0 — History of Present Illness   f1533–1565
     callout 1 — Physical Examination         f1568–1600
     callout 2 — Differential Diagnosis       f1603–1648  ← critical
     callout 3 — Diagnostic Workup            f1650–1685
     callout 4 — Assessment & Plan            f1688–1735  ← critical
     callout 5 — Complete Patient Encounter   f1738–1800  ← pull-back
     ───────────────────────────────────────────────────────────────────── */
  const calloutOps = [
    interpolate(frame, [1533, 1548, 1555, 1568], [0, 1, 1, 0], clamp),  // 0 History
    interpolate(frame, [1568, 1580, 1590, 1603], [0, 1, 1, 0], clamp),  // 1 Physical Exam
    interpolate(frame, [1603, 1616, 1635, 1648], [0, 1, 1, 0], clamp),  // 2 Differential
    interpolate(frame, [1650, 1662, 1674, 1685], [0, 1, 1, 0], clamp),  // 3 Workup
    interpolate(frame, [1688, 1700, 1722, 1735], [0, 1, 1, 0], clamp),  // 4 A&P
  ];
  const calloutFullOp = interpolate(frame, [1738, 1752, 1788, 1800], [0, 1, 1, 0], clamp);

  // Which section is currently active (-1 = none / full-view)
  const activeCalloutIdx = calloutOps.findIndex(op => op > 0.05);
  const hasActiveCallout = activeCalloutIdx >= 0;
  const activeCalloutOp  = hasActiveCallout ? calloutOps[activeCalloutIdx] : 0;

  // Perspective tilt (in degrees): tilts in slightly while a callout is active
  const formTiltDeg = activeCalloutOp * 1.2;

  // Callout label metadata (one per section row, matches encounterSections order)
  const calloutLabels = [
    { text: "Patient History",        color: colors.oasis },
    { text: "Physical Exam",          color: colors.azurite },
    { text: "Differential Diagnosis", color: colors.vitalsCritical },
    { text: "Diagnostic Workup",      color: "#06b6d4" },
    { text: "Assessment & Plan",      color: colors.vitalsWarning },
  ] as const;

  // Estimated Y position of each section row within the Phase 6 container
  // Form card top ≈ 300px (centered in ~980px area); header block ≈ 85px; row height ≈ 40px
  const ROW_TOP_BASE = 385;
  const ROW_HEIGHT   = 42;
  const calloutRowYs = calloutLabels.map((_, i) => ROW_TOP_BASE + i * ROW_HEIGHT);

  /* ─────────────────────────────────────────────────────────────────────
     PHASE 6 — CORNER PANEL SYSTEM
     Four ambient UI-fragment panels in screen corners communicate system
     accomplishment without cluttering the center. They are the mid-depth
     layer (z: 5), held at 80–82% opacity for de-emphasis.

     TL — Manual Documentation     f1470 → persist
     TR — Structured Case Creation f1475 → persist
     BL — Clinical Reasoning       f1480 → persist
     BR — Assessment & Plan        f1485 → persist

     Narration emphasis lift:
       BL scales up slightly when DX callout is active (calloutOps[2])
       BR scales up slightly when A&P callout is active (calloutOps[4])
     ───────────────────────────────────────────────────────────────────── */
  const cornerInStarts = [1470, 1475, 1480, 1485] as const;
  const cornerOps = cornerInStarts.map(start =>
    interpolate(frame, [start, start + 28], [0, 1], clamp)
  );
  const cornerFadeOut = interpolate(frame, [1855, 1875], [1, 0], clamp);
  const cornerOpFinals = cornerOps.map(op => op * cornerFadeOut);

  // Each corner floats on a unique sine phase for organic parallax (±2.5 px Y)
  const cornerDrifts = [0, 1.88, 3.77, 5.65].map(
    phase => Math.sin(frame * 0.024 + phase) * 2.5
  );

  // Narration-emphasis scale: matching corner lifts when its callout is spoken
  const cornerBLScale = 1.0 + calloutOps[2] * 0.05;  // Clinical Reasoning ← DX callout
  const cornerBRScale = 1.0 + calloutOps[4] * 0.05;  // Assessment & Plan  ← A&P callout

  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.04} waveSpeed={0.01} />
      <ParticleField count={30} color={colors.oasis} speed={0.001} opacity={0.08} />
      <GlowOrb position={[0, 0, -3]} color={colors.oasis} radius={2} baseOpacity={0.06} />
      <CameraRig positions={[
        { frame: 0, position: [0, 0, 10] },
        { frame: 200, position: [0, 0, 9] },
        { frame: 555, position: [0, 0, 8.5] },
        { frame: 1045, position: [0, 0, 9] },
        { frame: 1875, position: [0, 0, 9.5] },
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
            fontFamily: fonts.heading, fontSize: 32, fontWeight: 700,
            color: colors.white, marginBottom: 8,
            opacity: interpolate(frame, [80, 114], [0, 1], clamp),
          }}>Select a Patient Case</div>
          <div style={{
            fontFamily: fonts.body, fontSize: 17, color: `${colors.white}70`, marginBottom: 36,
            opacity: interpolate(frame, [93, 121], [0, 1], clamp),
          }}>Select a case to engage the clinical simulation</div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, justifyContent: "center", maxWidth: 900 }}>
            {patientCases.map((pc, i) => {
              const cardDelay = 86 + i * 14;
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
                  <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white, textAlign: "center" as const }}>{pc.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, textAlign: "center" as const, marginTop: 4 }}>{pc.age}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}60`, textAlign: "center" as const, marginTop: 8 }}>{pc.cc}</div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
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
            opacity: interpolate(frame, [201, 224], [0, 1], clamp),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white }}>
                Virtual Patient
              </span>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: `${colors.white}10`, borderRadius: 16, padding: "4px 12px",
              }}>
                <PulsingDot color={colors.vitalsCritical} size={6} delay={211} />
                <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.white }}>
                  {timerMin}:{timerSec}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 2 }}>
              {navTabs.map((tab, i) => {
                const isActive = tab === activeTab;
                const tabEnter = interpolate(frame, [208 + i * 6, 224 + i * 6], [0, 1], clamp);
                return (
                  <div key={tab} style={{
                    fontFamily: fonts.heading, fontSize: 14, fontWeight: isActive ? 700 : 500,
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
          {frame >= 218 && frame < 1850 && (
            <div style={{
              height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
              background: "rgba(12,35,75,0.6)",
              borderBottom: `1px solid ${colors.white}06`,
              opacity: interpolate(frame, [218, 245, 1810, 1840], [0, 1, 1, 0], clamp),
              transform: `scale(${vitalsZoom})`,
              transformOrigin: "50% 50%",
              boxShadow: vitalsHighlightOp > 0
                ? `inset 0 0 0 2px ${colors.vitalsWarning}${Math.round(vitalsHighlightOp * vitalsHighlightPulse * 120).toString(16).padStart(2, "0")}, 0 0 16px ${colors.vitalsWarning}${Math.round(vitalsHighlightOp * 40).toString(16).padStart(2, "0")}`
                : "none",
            }}>
              {vitalsHighlightOp > 0 && (
                <div style={{
                  position: "absolute", left: 16,
                  display: "flex", alignItems: "center", gap: 6,
                  opacity: vitalsHighlightOp,
                }}>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                    color: colors.vitalsWarning, background: `${colors.vitalsWarning}15`,
                    padding: "2px 10px", borderRadius: 2, letterSpacing: 2,
                    border: `1px solid ${colors.vitalsWarning}30`,
                  }}>ABNORMAL VITALS</div>
                </div>
              )}
              {vitals.map((v, i) => {
                const vOpacity = interpolate(frame, [224 + i * 8, 245 + i * 8], [0, 1], clamp);
                return (
                  <div key={v.label} style={{
                    display: "flex", alignItems: "baseline", gap: 6, opacity: vOpacity,
                  }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}55`, letterSpacing: 0.8 }}>{v.label}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: v.color }}>{v.value}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40` }}>{v.unit}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Step Badge — persistent chapter label, bottom-left ── */}
          {stepBadgeOp > 0 && stepLabel && (
            <div style={{
              position: "absolute", bottom: 20, left: 24,
              display: "flex", alignItems: "center", gap: 8,
              opacity: stepBadgeOp, zIndex: 50, pointerEvents: "none",
            }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                color: stepColor, background: `${stepColor}18`,
                border: `1px solid ${stepColor}40`,
                padding: "5px 14px", borderRadius: 20,
                letterSpacing: 2, textTransform: "uppercase" as const,
              }}>
                {stepLabel}
              </div>
            </div>
          )}

          {/* ── Phase Sweep Accent — thin glowing horizontal line at phase transitions ── */}
          {phaseAccentOp > 0 && (
            <div style={{
              position: "absolute", left: 0, right: 0,
              bottom: 100,
              height: 1, zIndex: 48, pointerEvents: "none",
              opacity: phaseAccentOp,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${phaseAccentWidth * 100}%`,
                background: `linear-gradient(90deg, transparent, ${stepColor}90, ${stepColor}, ${stepColor}60, transparent)`,
                boxShadow: `0 0 12px 2px ${stepColor}50`,
              }} />
            </div>
          )}

          {/* ── Vitals Focus Panel — enlarged vitals centered for 2s ── */}
          {vitalsZoomPanelOp > 0 && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 45, pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: vitalsZoomPanelOp,
            }}>
              <div style={{
                display: "flex", gap: 36, padding: "28px 48px",
                background: "rgba(6, 12, 35, 0.94)",
                border: `1.5px solid ${colors.vitalsWarning}35`,
                borderRadius: 22,
                boxShadow: `0 0 60px ${colors.vitalsWarning}18, 0 16px 60px rgba(0,0,0,0.6)`,
              }}>
                {vitals.map((v, i) => (
                  <div key={v.label} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    opacity: interpolate(frame, [224 + i * 6, 240 + i * 6], [0, 1], clamp),
                  }}>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 13, fontWeight: 600,
                      color: `${colors.white}55`, letterSpacing: 1.5,
                    }}>{v.label}</span>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 56, fontWeight: 800,
                      color: v.color, lineHeight: 1,
                    }}>{v.value}</span>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 14, color: `${colors.white}45`,
                    }}>{v.unit}</span>
                    {v.color === colors.vitalsWarning && (
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                        color: colors.vitalsWarning, background: `${colors.vitalsWarning}20`,
                        padding: "2px 7px", borderRadius: 4, marginTop: 2, letterSpacing: 1,
                      }}>HIGH</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DX Critical Moment Banner — typographic only, no decorative icons ── */}
          {dxCriticalOp > 0 && (
            <div style={{
              position: "absolute", top: 62, left: "50%", transform: "translateX(-50%)",
              zIndex: 50, pointerEvents: "none", opacity: dxCriticalOp,
            }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                color: colors.vitalsCritical,
                background: `${colors.vitalsCritical}10`,
                border: `1px solid ${colors.vitalsCritical}${Math.round(dxCriticalPulse * 65).toString(16).padStart(2, "0")}`,
                padding: "4px 20px", borderRadius: 3,
                letterSpacing: 2.5,
                boxShadow: `0 0 14px ${colors.vitalsCritical}${Math.round(dxCriticalPulse * 25).toString(16).padStart(2, "0")}`,
              }}>
                DIFFERENTIAL DIAGNOSIS — DECISION REQUIRED
              </div>
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
                opacity: interpolate(frame, [570, 604], [0, 1], clamp),
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {["Front", "Back"].map((side, i) => (
                    <div key={side} style={{
                      flex: 1, textAlign: "center" as const,
                      fontFamily: fonts.heading, fontSize: 13, fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? colors.white : `${colors.white}50`,
                      background: i === 0 ? colors.arizonaBlue : `${colors.white}06`,
                      padding: "6px 0", borderRadius: 6,
                      border: `1px solid ${i === 0 ? `${colors.oasis}30` : `${colors.white}08`}`,
                    }}>{side}</div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>Instruments</div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 10, color: colors.oasis,
                    background: `${colors.oasis}15`, padding: "2px 7px", borderRadius: 3,
                    opacity: interpolate(frame, [560, 580], [0, 1], clamp),
                  }}>SELECT</div>
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: `${colors.white}50`, marginBottom: 4 }}>
                  Stethoscope · Palpation · Percussion
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {instruments.map((inst, i) => {
                    const instDelay = 604 + i * 11;
                    const instOpacity = interpolate(frame, [instDelay, instDelay + 14], [0, 1], clamp);
                    const isInstSelected = i === selectedInstrument;
                    const selectGlow = isInstSelected ? interpolate(frame, [714, 748], [0, 1], clamp) : 0;
                    return (
                      <div key={inst.name} style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "18px 4px", borderRadius: 8,
                        background: isInstSelected && selectGlow > 0 ? `${colors.oasis}15` : `${colors.white}05`,
                        border: `1px solid ${isInstSelected && selectGlow > 0 ? `${colors.oasis}50` : `${colors.white}10`}`,
                        opacity: instOpacity, gap: 4,
                      }}>
                        <Img
                          src={staticFile(`screenshots/${inst.image}`)}
                          style={{
                            width: 32, height: 32, objectFit: "contain" as const,
                          }}
                        />
                        <span style={{ fontFamily: fonts.body, fontSize: 9, color: colors.white, textAlign: "center" as const }}>{inst.name}</span>
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
              overflow: "hidden",
            }}>
              {/* Exam room with patient — visible during Phases 2 & 3 */}
              {frame >= 205 && frame < 1073 && (
                <Img
                  src={staticFile("screenshots/examroompatient.png")}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover" as const,
                    opacity: interpolate(frame, [205, 238, 1032, 1073], [0, 1, 1, 0], clamp),
                  }}
                />
              )}

              {/* Interview Active badge (Phase 2) */}
              {isPhase2 && (
                <div style={{
                  position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: interpolate(frame, [238, 266], [0, 1], clamp),
                }}>
                  <PulsingDot color={colors.vitalsNormal} size={8} delay={245} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.vitalsNormal }}>
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
                  transform: `scale(${mediaZoom})`,
                  transformOrigin: "50% 50%",
                }}>
                  <div style={{
                    width: 520, background: "rgba(12,35,75,0.95)",
                    border: `1px solid ${colors.white}15`, borderRadius: 14,
                    padding: "24px 28px", boxShadow: `0 8px 40px rgba(0,0,0,0.5)`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white }}>
                          Examination Findings
                        </div>
                        <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}60`, marginTop: 2 }}>
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
                        width: 42, height: 36, borderRadius: 4,
                        background: `${colors.oasis}20`,
                        border: `1px solid ${colors.oasis}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{
                          fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                          color: colors.oasis, letterSpacing: 1.5,
                        }}>PLAY</span>
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
                      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}60` }}>
                        Heart Sounds — S3 Gallop
                      </span>
                    </div>

                    {/* Media library tags */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {mediaLibraryItems.map((item, i) => {
                        const tagDelay = 867 + i * 14;
                        const tagOpacity = interpolate(frame, [tagDelay, tagDelay + 14], [0, 1], clamp);
                        return (
                          <div key={item.label} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: `${item.color}10`, border: `1px solid ${item.color}28`,
                            borderRadius: 4, padding: "5px 12px",
                            opacity: tagOpacity,
                          }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                              color: item.color, letterSpacing: 1.5,
                              background: `${item.color}18`, padding: "1px 6px", borderRadius: 2,
                            }}>{item.type.toUpperCase()}</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}85` }}>{item.label}</span>
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
                  transform: `scale(${dxZoom})`,
                  transformOrigin: "50% 40%",
                }}>
                  {/* Differential panel */}
                  <div style={{
                    flex: 1, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "18px 20px",
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Differential Diagnosis
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50`, marginBottom: 14 }}>
                      Ranked by clinical likelihood
                    </div>
                    {differentials.map((dx, i) => {
                      const dxDelay = 1081 + i * 21;
                      const dxOpacity = interpolate(frame, [dxDelay, dxDelay + 14], [0, 1], clamp);
                      const isTopDx = i === 0;
                      return (
                        <div key={dx.name} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 8,
                          background: isTopDx ? `${dx.color}14` : `${dx.color}08`,
                          borderLeft: `3px solid ${dx.color}`,
                          border: isTopDx ? `1px solid ${dx.color}${Math.round(dxTopGlow * 90).toString(16).padStart(2, "0")}` : undefined,
                          borderLeftWidth: 3,
                          marginBottom: 8, opacity: dxOpacity,
                          boxShadow: isTopDx ? `0 0 12px ${dx.color}${Math.round(dxTopGlow * 50).toString(16).padStart(2, "0")}` : "none",
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: fonts.body, fontSize: 15, color: colors.white, fontWeight: 600 }}>{dx.name}</div>
                          </div>
                          <span style={{
                            fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: dx.color,
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
                    <div style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Diagnostic Tests
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50`, marginBottom: 14 }}>
                      Ordered to support diagnosis
                    </div>
                    {diagnosticTests.map((test, i) => {
                      const testDelay = 1101 + i * 17;
                      const testOpacity = interpolate(frame, [testDelay, testDelay + 14], [0, 1], clamp);
                      const sevColor = test.severity === "Critical" ? colors.vitalsCritical : colors.vitalsWarning;
                      return (
                        <div key={test.name} style={{
                          padding: "8px 12px", borderRadius: 8,
                          background: `${colors.white}04`, border: `1px solid ${colors.white}08`,
                          marginBottom: 6, opacity: testOpacity,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.white }}>{test.name}</span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 11, fontWeight: 600, color: sevColor,
                              background: `${sevColor}15`, padding: "2px 6px", borderRadius: 3,
                            }}>{test.severity}</span>
                          </div>
                          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}70`, marginTop: 3 }}>{test.result}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── AI Guidance Panel (Phase 4, floats over corner) ── */}
              {aiPanelOp > 0 && (
                <div style={{
                  position: "absolute", bottom: 20, right: 20,
                  width: 270,
                  background: "rgba(10, 22, 48, 0.92)",
                  border: `1px solid ${colors.azurite}50`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  opacity: aiPanelOp,
                  zIndex: 25,
                  boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${colors.azurite}20`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <PulsingDot color={colors.azurite} size={7} delay={1087} />
                    <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color: colors.azurite, letterSpacing: 1 }}>
                      AI GUIDANCE
                    </span>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}40`,
                      background: `${colors.white}08`, padding: "1px 7px", borderRadius: 3, marginLeft: "auto",
                    }}>Faculty-Enabled</span>
                  </div>
                  {[
                    { label: "Primary Dx", text: "Decompensated Heart Failure consistent with BNP elevation" },
                    { label: "Suggested", text: "Add Echocardiogram to workup" },
                    { label: "Missed", text: "Consider renal function (Cr 1.8) in diuresis dosing" },
                  ].map((tip, i) => {
                    const tipOp = interpolate(frame, [1097 + i * 18, 1115 + i * 18], [0, 1], clamp);
                    return (
                      <div key={tip.label} style={{
                        marginBottom: 8, opacity: tipOp,
                        paddingLeft: 8, borderLeft: `2px solid ${colors.azurite}40`,
                      }}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.azurite, marginBottom: 2 }}>{tip.label}</div>
                        <div style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}75`, lineHeight: 1.4 }}>{tip.text}</div>
                      </div>
                    );
                  })}
                  <div style={{
                    marginTop: 6, paddingTop: 8, borderTop: `1px solid ${colors.white}08`,
                    fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}30`,
                  }}>Faculty controls when AI is visible to students</div>
                </div>
              )}

              {/* ── Phase 5: Assessment & Plan ── */}
              {isPhase5 && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 20, opacity: phase5Opacity,
                  transform: `scale(${apZoom})`,
                  transformOrigin: "50% 45%",
                }}>
                  <div style={{
                    width: 560, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                    border: `1px solid ${colors.white}10`, padding: "22px 26px",
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                      Assessment & Plan
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50`, marginBottom: 16 }}>
                      Document approach and consult orders
                    </div>
                    {assessmentItems.map((item, i) => {
                      const apDelay = 1287 + i * 17;
                      const apOpacity = interpolate(frame, [apDelay, apDelay + 14], [0, 1], clamp);
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
                            fontFamily: fonts.mono, fontSize: 12, fontWeight: 700,
                            color: isConsult ? colors.vitalsWarning : colors.oasis,
                            minWidth: 80, flexShrink: 0,
                          }}>{item.label}</span>
                          <span style={{ fontFamily: fonts.body, fontSize: 15, color: colors.white }}>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Phase 6: Encounter Review + Submit ── */}
              {isPhase6 && (
                <div style={{ position: "absolute", inset: 0, opacity: phase6Opacity }}>

                  {/* ── Dim layer — appears when an overlay card is active ── */}
                  {enc6DimOp > 0 && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: `rgba(0,0,0,${enc6DimOp})`,
                      zIndex: 1, pointerEvents: "none",
                    }} />
                  )}

                  {/* ── Encounter form — centered, with perspective tilt during callouts ── */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20, zIndex: 2,
                    // Perspective container: subtle depth during active callout
                    perspective: hasActiveCallout ? "900px" : "none",
                  }}>
                    <div style={{
                      width: 480, background: "rgba(12,35,75,0.6)", borderRadius: 12,
                      border: `1px solid ${colors.white}10`, padding: "22px 26px",
                      // Subtle 3D tilt — max 1.2° rotateX, fades with callout
                      transform: hasActiveCallout
                        ? `rotateX(${formTiltDeg}deg) scale(${1 - formTiltDeg * 0.003})`
                        : "none",
                      transformOrigin: "50% 50%",
                    }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white, marginBottom: 4 }}>
                        Patient Encounter
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50`, marginBottom: 16 }}>
                        Full encounter summary — ready for submission
                      </div>

                      {encounterSections.map((sec, i) => {
                        const secDelay = 1529 + i * 17;
                        const secOpacity = interpolate(frame, [secDelay, secDelay + 14], [0, 1], clamp);

                        // 3D callout state for this row
                        const isLiftedRow   = hasActiveCallout && activeCalloutIdx === i;
                        const isDimmedRow   = hasActiveCallout && activeCalloutIdx !== i;
                        const rowCalloutOp  = isLiftedRow ? calloutOps[i] : 0;

                        // Legacy overlay highlights (from side overlay cards)
                        const isLegacyHighlight =
                          (i === 1 && overlay1Op > 0) ||
                          ((i === 2 || i === 3) && overlay2Op > 0) ||
                          (i === 4 && overlay2Op > 0);

                        const rowColor = calloutLabels[i].color;

                        return (
                          <div key={sec.label} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "9px 14px", borderRadius: 6, marginBottom: 4,
                            // Lift active row; dim others; legacy overlay highlight
                            background: isLiftedRow
                              ? `${rowColor}16`
                              : isLegacyHighlight
                                ? `${colors.oasis}12`
                                : `${colors.white}04`,
                            border: isLiftedRow
                              ? `1px solid ${rowColor}${Math.round(rowCalloutOp * 80).toString(16).padStart(2, "0")}`
                              : isLegacyHighlight
                                ? `1px solid ${colors.oasis}30`
                                : `1px solid transparent`,
                            borderBottom: (!isLiftedRow && !isLegacyHighlight)
                              ? `1px solid ${colors.white}06`
                              : undefined,
                            // Lift: slight upward shift + scale; others dimmed
                            opacity: secOpacity * (isDimmedRow ? 0.45 : 1.0),
                            transform: isLiftedRow
                              ? `translateY(-2px) scale(1.022) translateZ(0)`
                              : "none",
                            transformOrigin: "50% 50%",
                            boxShadow: isLiftedRow
                              ? `0 4px 18px ${rowColor}25`
                              : "none",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.vitalsNormal }}>✓</span>
                              <span style={{
                                fontFamily: fonts.body, fontSize: 15,
                                color: isLiftedRow ? colors.white : `${colors.white}${isDimmedRow ? "70" : ""}`,
                                fontWeight: isLiftedRow ? 600 : 400,
                              }}>{sec.label}</span>
                            </div>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 12,
                              color: isLiftedRow ? `${rowColor}CC` : `${colors.white}50`,
                            }}>
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
                        fontFamily: fonts.heading, fontSize: 16, fontWeight: 700,
                        color: colors.white,
                        opacity: interpolate(frame, [1749, 1778], [0, 1], clamp),
                        transform: `scale(${submitProgress > 0 ? 1 + submitProgress * 0.03 : 1})`,
                        boxShadow: submitProgress > 0 ? `0 0 24px ${colors.vitalsNormal}30` : "none",
                      }}>
                        {submitProgress > 0.5 ? "✓ Session Submitted" : "Submit Encounter"}
                      </div>
                    </div>
                  </div>

                  {/* ── Callout labels + connectors — left of form card ── */}
                  {calloutOps.map((op, i) => {
                    if (op < 0.02) return null;
                    const meta  = calloutLabels[i];
                    const rowY  = calloutRowYs[i];
                    return (
                      <React.Fragment key={`callout-${i}`}>
                        {/* Thin horizontal connector line: label right → form left edge */}
                        <div style={{
                          position: "absolute",
                          left: 474, top: rowY + 18,
                          width: 242, height: 1,
                          background: `linear-gradient(90deg, transparent, ${meta.color}${Math.round(op * 55).toString(16).padStart(2, "0")}, ${meta.color}${Math.round(op * 70).toString(16).padStart(2, "0")})`,
                          zIndex: 40, pointerEvents: "none",
                          opacity: op,
                        }} />
                        {/* Endpoint dot on the form row */}
                        <div style={{
                          position: "absolute",
                          left: 716, top: rowY + 15,
                          width: 6, height: 6, borderRadius: "50%",
                          background: meta.color,
                          opacity: op * 0.85,
                          zIndex: 41, pointerEvents: "none",
                        }} />
                        {/* Label card */}
                        <div style={{
                          position: "absolute",
                          left: 250, top: rowY + 6,
                          zIndex: 42, pointerEvents: "none",
                          opacity: op,
                        }}>
                          <div style={{
                            fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                            color: meta.color,
                            background: `rgba(5, 10, 30, 0.90)`,
                            border: `1px solid ${meta.color}${Math.round(op * 55).toString(16).padStart(2, "0")}`,
                            padding: "5px 14px", borderRadius: 3,
                            letterSpacing: 1.8,
                            whiteSpace: "nowrap" as const,
                            textTransform: "uppercase" as const,
                          }}>
                            {meta.text}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* ── "Complete Patient Encounter" pull-back label ── */}
                  {calloutFullOp > 0 && (
                    <div style={{
                      position: "absolute", left: "50%", top: 210,
                      transform: "translateX(-50%)",
                      zIndex: 42, pointerEvents: "none", opacity: calloutFullOp,
                    }}>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                        color: colors.vitalsNormal,
                        background: "rgba(5, 10, 30, 0.90)",
                        border: `1px solid ${colors.vitalsNormal}40`,
                        padding: "5px 20px", borderRadius: 3,
                        letterSpacing: 2, textTransform: "uppercase" as const,
                        whiteSpace: "nowrap" as const,
                      }}>
                        Complete Patient Encounter
                      </div>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════════
                      OVERLAY 1 — Physical Examination Findings
                      Appears right of form while Physical Exam row is highlighted.
                      f1550–1642
                     ════════════════════════════════════════════════ */}
                  {overlay1Op > 0 && (
                    <div style={{
                      position: "absolute", right: 56, top: "50%",
                      transform: "translateY(-52%)",
                      width: 380, zIndex: 30, pointerEvents: "none",
                      opacity: overlay1Op,
                    }}>
                      <div style={{
                        background: "rgba(5, 10, 30, 0.95)",
                        border: `1px solid ${colors.azurite}35`,
                        borderRadius: 10,
                        padding: "18px 22px",
                        boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px ${colors.azurite}12`,
                      }}>
                        {/* Header */}
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                          color: colors.azurite, letterSpacing: 2.5,
                          textTransform: "uppercase" as const, marginBottom: 14,
                        }}>Physical Examination</div>

                        {/* Heart sounds waveform */}
                        <div style={{
                          height: 54, display: "flex", alignItems: "center", gap: 10,
                          background: "rgba(20, 50, 100, 0.35)",
                          border: `1px solid ${colors.oasis}18`,
                          borderRadius: 6, padding: "0 12px",
                          marginBottom: 14,
                        }}>
                          <div style={{
                            fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                            color: `${colors.oasis}70`, letterSpacing: 1.5, flexShrink: 0,
                          }}>HEART SOUNDS</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                            {Array.from({ length: 34 }).map((_, wi) => {
                              const h = 5 + Math.abs(Math.sin(wi * 0.72 + wavePhase) * 20);
                              return (
                                <div key={wi} style={{
                                  width: 2, height: h, borderRadius: 1,
                                  background: wi < 17
                                    ? `${colors.oasis}${Math.round(80 + h * 3).toString(16).padStart(2, "0")}`
                                    : `${colors.oasis}30`,
                                }} />
                              );
                            })}
                          </div>
                          <div style={{
                            fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                            color: colors.vitalsWarning, letterSpacing: 1, flexShrink: 0,
                          }}>S3 GALLOP</div>
                        </div>

                        {/* Exam findings */}
                        {examFindings.map((ef, fi) => {
                          const findOp = interpolate(frame, [1556 + fi * 10, 1570 + fi * 10], [0, 1], clamp);
                          const typeColor = ef.mediaType === "audio" ? colors.vitalsWarning : "#06b6d4";
                          return (
                            <div key={ef.tool} style={{
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "7px 0",
                              borderBottom: fi < examFindings.length - 1 ? `1px solid ${colors.white}07` : "none",
                              opacity: findOp,
                            }}>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                                color: colors.azurite, background: `${colors.azurite}15`,
                                padding: "1px 7px", borderRadius: 2, flexShrink: 0,
                              }}>{ef.tool}</span>
                              <span style={{
                                fontFamily: fonts.body, fontSize: 13, color: `${colors.white}80`, flex: 1,
                              }}>{ef.finding}</span>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                                color: typeColor, letterSpacing: 1, flexShrink: 0,
                              }}>{ef.mediaType === "audio" ? "AUDIO" : "IMAGE"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════════
                      OVERLAY 2 — Differential Diagnosis & Assessment
                      Appears right of form while DX + A&P rows are highlighted.
                      f1650–1726
                     ════════════════════════════════════════════════ */}
                  {overlay2Op > 0 && (
                    <div style={{
                      position: "absolute", right: 56, top: "50%",
                      transform: "translateY(-50%)",
                      width: 380, zIndex: 30, pointerEvents: "none",
                      opacity: overlay2Op,
                    }}>
                      <div style={{
                        background: "rgba(5, 10, 30, 0.95)",
                        border: `1px solid ${colors.vitalsCritical}22`,
                        borderRadius: 10,
                        padding: "18px 22px",
                        boxShadow: `0 12px 40px rgba(0,0,0,0.55)`,
                      }}>
                        {/* Header */}
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                          color: colors.vitalsCritical, letterSpacing: 2.5,
                          textTransform: "uppercase" as const, marginBottom: 12,
                        }}>Differential Diagnosis</div>

                        {/* Differential list */}
                        {differentials.map((dx, di) => {
                          const dxOp = interpolate(frame, [1656 + di * 10, 1670 + di * 10], [0, 1], clamp);
                          return (
                            <div key={dx.name} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "6px 10px", borderRadius: 5, marginBottom: 5,
                              background: di === 0 ? `${dx.color}12` : `${colors.white}03`,
                              borderLeft: `3px solid ${dx.color}`,
                              opacity: dxOp,
                            }}>
                              <span style={{
                                fontFamily: fonts.body, fontSize: 13,
                                color: colors.white, fontWeight: di === 0 ? 600 : 400,
                              }}>{dx.name}</span>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 11, color: dx.color, marginLeft: 8, flexShrink: 0,
                              }}>{dx.likelihood}</span>
                            </div>
                          );
                        })}

                        {/* Separator */}
                        <div style={{ height: 1, background: `${colors.white}08`, margin: "12px 0" }} />

                        {/* Assessment & Plan */}
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}40`,
                          letterSpacing: 2, marginBottom: 8,
                          textTransform: "uppercase" as const,
                        }}>Assessment & Plan</div>
                        {assessmentItems.map((item, ai) => {
                          const apOp = interpolate(frame, [1688 + ai * 8, 1700 + ai * 8], [0, 1], clamp);
                          return (
                            <div key={item.label} style={{
                              display: "flex", gap: 10, padding: "4px 0",
                              borderBottom: ai < assessmentItems.length - 1 ? `1px solid ${colors.white}06` : "none",
                              opacity: apOp,
                            }}>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                                color: colors.oasis, minWidth: 72, flexShrink: 0,
                              }}>{item.label}</span>
                              <span style={{
                                fontFamily: fonts.body, fontSize: 12, color: `${colors.white}75`, lineHeight: 1.4,
                              }}>{item.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ════════════════════════════════════════════════
                      OVERLAY 3 — Session Summary
                      Appears left of form with submit button, signals completion.
                      f1758–1875
                     ════════════════════════════════════════════════ */}
                  {overlay3Op > 0 && (
                    <div style={{
                      position: "absolute", left: 56, top: "50%",
                      transform: "translateY(-50%)",
                      width: 340, zIndex: 30, pointerEvents: "none",
                      opacity: overlay3Op,
                    }}>
                      <div style={{
                        background: "rgba(5, 10, 30, 0.95)",
                        border: `1px solid ${colors.vitalsNormal}28`,
                        borderRadius: 10,
                        padding: "18px 22px",
                        boxShadow: `0 12px 40px rgba(0,0,0,0.55), 0 0 24px ${colors.vitalsNormal}10`,
                      }}>
                        {/* Header */}
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                          color: colors.vitalsNormal, letterSpacing: 2.5,
                          textTransform: "uppercase" as const, marginBottom: 14,
                        }}>Session Summary</div>

                        {/* Metrics */}
                        {[
                          { label: "Patient",   value: "Maria Santos — 67F" },
                          { label: "Duration",  value: "13:47" },
                          { label: "Sections",  value: "5 / 5 Completed" },
                          { label: "Next Step", value: "AIMS Evaluation" },
                        ].map((m, mi) => {
                          const mOp = interpolate(frame, [1764 + mi * 10, 1778 + mi * 10], [0, 1], clamp);
                          const isAccent = mi === 3;
                          return (
                            <div key={m.label} style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "7px 0",
                              borderBottom: mi < 3 ? `1px solid ${colors.white}07` : "none",
                              opacity: mOp,
                            }}>
                              <span style={{
                                fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50`,
                              }}>{m.label}</span>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 13,
                                color: isAccent ? colors.vitalsNormal : colors.white,
                                fontWeight: isAccent ? 700 : 400,
                              }}>{m.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ═══════════════════════════════════════════════════════════
                      CORNER PANELS — Ambient depth context
                      Mid-depth layer: z=5, 80–82% opacity.
                      Each corner communicates one solved clinical problem.
                      Appear as Phase 6 opens; subtle float drift throughout.
                      ═══════════════════════════════════════════════════════════ */}

                  {/* TOP LEFT — Manual Documentation (the "before" state) */}
                  {cornerOpFinals[0] > 0.02 && (
                    <div style={{
                      position: "absolute", top: 28, left: 28,
                      width: 222, zIndex: 5, pointerEvents: "none",
                      opacity: cornerOpFinals[0] * 0.80,
                      transform: `translateY(${(1 - cornerOps[0]) * 8 + cornerDrifts[0]}px) rotate(1.1deg)`,
                    }}>
                      <div style={{
                        background: "rgba(8, 8, 20, 0.84)", borderRadius: 8,
                        border: `1px solid ${colors.white}0A`, padding: "13px 15px",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2,
                          color: `${colors.white}28`, textTransform: "uppercase" as const,
                          marginBottom: 11,
                        }}>Manual Documentation</div>
                        {/* Simulated unstructured note lines — irregular widths imply disorder */}
                        {[88, 62, 80, 47, 72, 55].map((w, li) => (
                          <div key={li} style={{
                            height: 2, borderRadius: 1, marginBottom: 7,
                            width: `${w}%`,
                            background: `${colors.white}${li % 3 === 0 ? "10" : "08"}`,
                            opacity: 1 - li * 0.08,
                          }} />
                        ))}
                        {/* Fade-out gradient — signals this is being replaced */}
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                          background: "linear-gradient(transparent, rgba(5,5,16,0.88))",
                          borderRadius: "0 0 8px 8px",
                        }} />
                      </div>
                    </div>
                  )}

                  {/* TOP RIGHT — Structured Case Creation (the "after" state) */}
                  {cornerOpFinals[1] > 0.02 && (
                    <div style={{
                      position: "absolute", top: 28, right: 28,
                      width: 222, zIndex: 5, pointerEvents: "none",
                      opacity: cornerOpFinals[1] * 0.82,
                      transform: `translateY(${(1 - cornerOps[1]) * 8 + cornerDrifts[1]}px)`,
                    }}>
                      <div style={{
                        background: "rgba(6, 14, 32, 0.86)", borderRadius: 8,
                        border: `1px solid ${colors.oasis}18`, padding: "13px 15px",
                      }}>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2,
                          color: `${colors.oasis}58`, textTransform: "uppercase" as const,
                          marginBottom: 10,
                        }}>Structured Case</div>
                        {[
                          { label: "History",  barW: "75%" },
                          { label: "Vitals",   barW: "90%" },
                          { label: "Findings", barW: "60%" },
                        ].map((row, ri) => (
                          <div key={row.label} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "5px 0",
                            borderBottom: ri < 2 ? `1px solid ${colors.white}06` : "none",
                          }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 10,
                              color: colors.vitalsNormal, opacity: 0.75,
                            }}>✓</span>
                            <span style={{
                              fontFamily: fonts.body, fontSize: 12,
                              color: `${colors.white}70`,
                            }}>{row.label}</span>
                            <div style={{
                              marginLeft: "auto", height: 2, width: row.barW,
                              maxWidth: 44, borderRadius: 1,
                              background: `${colors.oasis}28`,
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM LEFT — Clinical Reasoning (lifts on DX narration cue) */}
                  {cornerOpFinals[2] > 0.02 && (
                    <div style={{
                      position: "absolute", bottom: 28, left: 28,
                      width: 222, zIndex: 5, pointerEvents: "none",
                      opacity: cornerOpFinals[2] * 0.80,
                      transform: `translateY(${-(1 - cornerOps[2]) * 8 + cornerDrifts[2]}px) scale(${cornerBLScale})`,
                      transformOrigin: "0% 100%",
                    }}>
                      <div style={{
                        background: "rgba(8, 6, 22, 0.86)", borderRadius: 8,
                        border: `1px solid ${colors.vitalsCritical}14`, padding: "13px 15px",
                      }}>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2,
                          color: `${colors.vitalsCritical}50`, textTransform: "uppercase" as const,
                          marginBottom: 10,
                        }}>Clinical Reasoning</div>
                        {[
                          { dx: "Heart Failure",        pct: "72%", hi: true  },
                          { dx: "Viral Cardiomyopathy", pct: "18%", hi: false },
                          { dx: "Pulmonary Edema",       pct: "10%", hi: false },
                        ].map(item => (
                          <div key={item.dx} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "5px 8px", marginBottom: 3, borderRadius: 4,
                            background: item.hi ? `${colors.vitalsCritical}0E` : "transparent",
                            border: item.hi ? `1px solid ${colors.vitalsCritical}22` : "1px solid transparent",
                          }}>
                            <span style={{
                              fontFamily: fonts.body, fontSize: 11,
                              color: item.hi ? colors.white : `${colors.white}48`,
                              fontWeight: item.hi ? 600 : 400,
                            }}>{item.dx}</span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 10,
                              color: item.hi ? colors.vitalsCritical : `${colors.white}30`,
                            }}>{item.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM RIGHT — Assessment & Plan (lifts on A&P narration cue) */}
                  {cornerOpFinals[3] > 0.02 && (
                    <div style={{
                      position: "absolute", bottom: 28, right: 28,
                      width: 222, zIndex: 5, pointerEvents: "none",
                      opacity: cornerOpFinals[3] * 0.82,
                      transform: `translateY(${-(1 - cornerOps[3]) * 8 + cornerDrifts[3]}px) scale(${cornerBRScale})`,
                      transformOrigin: "100% 100%",
                    }}>
                      <div style={{
                        background: "rgba(10, 9, 24, 0.86)", borderRadius: 8,
                        border: `1px solid ${colors.vitalsWarning}16`, padding: "13px 15px",
                      }}>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2.2,
                          color: `${colors.vitalsWarning}55`, textTransform: "uppercase" as const,
                          marginBottom: 10,
                        }}>Assessment & Plan</div>
                        {[
                          { k: "Diagnosis", v: "CHF — NYHA II"    },
                          { k: "Treatment", v: "Diuretics / ACEi"  },
                          { k: "Follow-up", v: "7 days"            },
                        ].map((row, ri) => (
                          <div key={row.k} style={{
                            display: "flex", gap: 8, padding: "5px 0",
                            borderBottom: ri < 2 ? `1px solid ${colors.white}06` : "none",
                          }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                              color: `${colors.vitalsWarning}70`, minWidth: 68, flexShrink: 0,
                            }}>{row.k}</span>
                            <span style={{
                              fontFamily: fonts.body, fontSize: 11, color: `${colors.white}58`,
                            }}>{row.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                opacity: interpolate(frame, [231, 266], [0, 1], clamp),
                transform: isPhase3
                  ? `scale(${examZoom})`
                  : `scale(${interviewZoom})`,
                transformOrigin: "right center",
              }}>
                {/* ── Phase 2: Chat Panel ── */}
                {isPhase2 && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 10, flex: 1,
                    opacity: phase2Opacity,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                      <span style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>
                        Patient Interview
                      </span>
                      <PulsingDot color={colors.oasis} size={7} delay={252} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      {chatMessages.map((msg, i) => {
                        const msgDelay = 287 + i * 48;
                        const msgOpacity = interpolate(frame, [msgDelay, msgDelay + 22], [0, 1], clamp);
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
                              fontFamily: fonts.body, fontSize: 14, color: colors.white, lineHeight: 1.45,
                            }}>
                              <div style={{
                                fontFamily: fonts.mono, fontSize: 10, color: isStudent ? colors.oasis : `${colors.white}50`,
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
                      fontFamily: fonts.body, fontSize: 13, color: `${colors.white}30`,
                      opacity: interpolate(frame, [494, 528], [0, 1], clamp),
                    }}>Type your response...</div>
                  </div>
                )}

                {/* ── Phase 3: Examination Categories + Findings ── */}
                {isPhase3 && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 8, flex: 1,
                    opacity: phase3Opacity,
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white }}>
                      Examination Categories
                    </div>

                    <div style={{
                      padding: "7px 10px", borderRadius: 8,
                      background: `${colors.white}05`, border: `1px solid ${colors.white}12`,
                      fontFamily: fonts.body, fontSize: 12, color: `${colors.white}30`,
                      opacity: interpolate(frame, [584, 611], [0, 1], clamp),
                    }}>Search categories...</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, overflow: "hidden" }}>
                      {examCategories.map((cat, i) => {
                        const catDelay = 597 + i * 11;
                        const catOpacity = interpolate(frame, [catDelay, catDelay + 12], [0, 1], clamp);
                        const isChecked = i < categoriesChecked;
                        const checkAnim = isChecked ? interpolate(frame, [687 + i * 55, 715 + i * 55], [0, 1], clamp) : 0;
                        return (
                          <div key={cat} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "7px 12px", borderRadius: 5,
                            background: isChecked && checkAnim > 0 ? `${colors.oasis}08` : `${colors.white}03`,
                            borderBottom: `1px solid ${colors.white}05`,
                            opacity: catOpacity,
                          }}>
                            <span style={{
                              fontFamily: fonts.body, fontSize: 14,
                              color: isChecked && checkAnim > 0 ? colors.oasis : colors.white,
                              fontWeight: isChecked ? 600 : 400,
                            }}>{cat}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              {isChecked && checkAnim > 0 && (
                                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.vitalsNormal, opacity: checkAnim }}>✓</span>
                              )}
                              <span style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}25` }}>›</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Findings */}
                    <div style={{
                      borderTop: `1px solid ${colors.white}10`, paddingTop: 8, marginTop: "auto",
                      opacity: interpolate(frame, [755, 790], [0, 1], clamp),
                    }}>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}50`,
                        letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6,
                      }}>Findings</div>
                      {examFindings.map((ef, i) => {
                        const fOpacity = interpolate(frame, [776 + i * 22, 800 + i * 22], [0, 1], clamp);
                        return (
                          <div key={ef.tool} style={{
                            display: "flex", gap: 6, marginBottom: 6, opacity: fOpacity, alignItems: "center",
                          }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 11, fontWeight: 600, color: colors.oasis,
                              background: `${colors.oasis}12`, padding: "2px 6px", borderRadius: 3,
                              whiteSpace: "nowrap" as const, flexShrink: 0,
                            }}>{ef.tool}</span>
                            <span style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}70`, lineHeight: 1.3 }}>{ef.finding}</span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                              color: ef.mediaType === "audio" ? colors.vitalsWarning : "#06b6d4",
                              background: `${ef.mediaType === "audio" ? colors.vitalsWarning : "#06b6d4"}15`,
                              padding: "1px 6px", borderRadius: 2, flexShrink: 0, letterSpacing: 1,
                            }}>{ef.mediaType === "audio" ? "AUDIO" : "IMAGE"}</span>
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
