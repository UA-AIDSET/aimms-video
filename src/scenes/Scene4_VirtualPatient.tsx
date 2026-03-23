import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";
import { PulsingDot } from "../components/PulsingDot";

/* ════════════════════════════════════════════════════════════════════
   CLINICAL DATA
   ════════════════════════════════════════════════════════════════════ */

const vitals = [
  { label: "HR",   value: "112",    unit: "bpm",  flag: "HIGH", color: colors.vitalsWarning },
  { label: "BP",   value: "148/92", unit: "mmHg", flag: "HIGH", color: colors.vitalsWarning },
  { label: "SpO₂", value: "94",     unit: "%",    flag: "LOW",  color: colors.vitalsWarning },
  { label: "Temp", value: "37.8",   unit: "°C",   flag: null,   color: colors.vitalsNormal  },
  { label: "RR",   value: "24",     unit: "/min", flag: "HIGH", color: colors.vitalsWarning },
];

const chatMessages = [
  { from: "student", text: "What brings you in today?" },
  { from: "patient", text: "I've had trouble breathing for about 3 days, and my ankles are really swollen." },
  { from: "student", text: "Any chest pain or palpitations?" },
  { from: "patient", text: "No chest pain, but my heart feels like it's racing sometimes." },
];

const examTools = [
  { name: "Stethoscope", finding: "Bilateral crackles, S3 gallop",   type: "AUDIO", color: colors.oasis         },
  { name: "Palpation",   finding: "2+ pitting edema, bilateral",      type: "IMAGE", color: "#06b6d4"            },
  { name: "Percussion",  finding: "Dull bases bilaterally",           type: "AUDIO", color: colors.vitalsWarning },
];

const differentials = [
  { name: "Acute Decompensated Heart Failure", likelihood: "High",     color: colors.vitalsCritical },
  { name: "Pneumonia with Fluid Overload",     likelihood: "Moderate", color: colors.vitalsWarning  },
  { name: "Pulmonary Embolism",                likelihood: "Low",      color: colors.oasis          },
];

const diagnosticResults = [
  { name: "BNP / NT-proBNP", result: "1,840 pg/mL",                       severity: "Critical" },
  { name: "Chest X-Ray",     result: "Cardiomegaly, bilateral effusions",  severity: "Abnormal" },
  { name: "ECG 12-Lead",     result: "LVH, sinus tachycardia",             severity: "Abnormal" },
  { name: "BMP",             result: "Cr 1.8, K+ 5.1",                     severity: "Abnormal" },
];

const assessmentItems = [
  { label: "Primary Dx",  value: "Acute Decompensated HF (NYHA III)" },
  { label: "Diuresis",    value: "Furosemide 40 mg IV now"            },
  { label: "O₂ Therapy",  value: "2L NC, target SpO₂ > 95%"          },
  { label: "Consult",     value: "Cardiology — urgent"                },
];

const encounterSections = [
  { label: "History of Present Illness", items: 8  },
  { label: "Physical Examination",       items: 12 },
  { label: "Differential Diagnosis",     items: 3  },
  { label: "Diagnostic Workup",          items: 4  },
  { label: "Assessment & Plan",          items: 4  },
];

const encRowColors = [
  colors.oasis, colors.azurite, colors.vitalsCritical, "#06b6d4", colors.vitalsWarning,
];

/* ════════════════════════════════════════════════════════════════════
   NARRATION-DRIVEN PHASE TIMING  (30fps · audio 59.4s · f45→f1827)

   INTRO   f  45–  90   "students open the virtual patient encounter"
   VF      f  90– 285   "real-time vital signs" — large vitals panel
   IN      f 280– 560   "patient interview" — chat panel
   EX      f 558– 718   "physical exam" — 3D tool depth
   MD      f 715–1052   "clinical media" — waveform + image
   DX      f1048–1270   "differential diagnosis" — KEY MOMENT (hold longer)
   AP      f1265–1460   "assessment & plan"
   EC      f1455–1827   "encounter summary"
   ════════════════════════════════════════════════════════════════════ */
const INTRO_S = 45;
const VF_S = 90,   VF_E = 285;
const IN_S  = 280, IN_E  = 560;
const EX_S  = 558, EX_E  = 718;
const MD_S  = 715, MD_E  = 1052;
const DX_S  = 1048,DX_E  = 1270;
const AP_S  = 1265,AP_E  = 1460;
const EC_S  = 1455,EC_E  = 1827;

/* Tool activation frames within the EX phase */
const TOOL_ACTIVATES = [EX_S, EX_S + 52, EX_S + 104] as const;

/* Encounter section callout starts (2s each, non-overlapping) */
const ENC_CALLOUT_STARTS = [
  EC_S + 55, EC_S + 115, EC_S + 175, EC_S + 230, EC_S + 285,
] as const;

/* ════════════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════════════ */
export const Scene4_VirtualPatient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps: _fps } = useVideoConfig();
  const clamp  = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeOut = { ...clamp, easing: Easing.out(Easing.ease) };

  /* ── Phase flags ── */
  const isVF  = frame >= VF_S  && frame < VF_E;
  const isIN  = frame >= IN_S  && frame < IN_E;
  const isEX  = frame >= EX_S  && frame < EX_E;
  const isMD  = frame >= MD_S  && frame < MD_E;
  const isDX  = frame >= DX_S  && frame < DX_E;
  const isAP  = frame >= AP_S  && frame < AP_E;
  const isEC  = frame >= EC_S;
  const isUI  = frame >= INTRO_S;

  /* ── Global UI opacity ── */
  const uiOp = interpolate(frame, [INTRO_S, INTRO_S + 28, EC_E - 20, EC_E], [0, 1, 1, 0], clamp);

  /* ── Per-phase panel opacities ── */
  const vfOp = interpolate(frame, [VF_S, VF_S+16, VF_E-14, VF_E+6], [0, 1, 1, 0], clamp);
  const inOp = interpolate(frame, [IN_S, IN_S+16, IN_E-14, IN_E+6], [0, 1, 1, 0], clamp);
  const exOp = interpolate(frame, [EX_S, EX_S+16, EX_E-14, EX_E+6], [0, 1, 1, 0], clamp);
  const mdOp = interpolate(frame, [MD_S, MD_S+16, MD_E-14, MD_E+6], [0, 1, 1, 0], clamp);
  const dxOp = interpolate(frame, [DX_S, DX_S+16, DX_E-14, DX_E+6], [0, 1, 1, 0], clamp);
  const apOp = interpolate(frame, [AP_S, AP_S+16, AP_E-14, AP_E+6], [0, 1, 1, 0], clamp);
  const ecOp = interpolate(frame, [EC_S, EC_S+22, EC_E-20, EC_E  ], [0, 1, 1, 0], clamp);

  /* ── Per-phase entrance zoom ── */
  const vfScale = interpolate(frame, [VF_S, VF_S+22], [0.94, 1.06], easeOut);
  const inScale = interpolate(frame, [IN_S, IN_S+22], [0.95, 1.04], easeOut);
  const exScale = interpolate(frame, [EX_S, EX_S+22], [0.95, 1.05], easeOut);
  const mdScale = interpolate(frame, [MD_S, MD_S+22], [0.94, 1.06], easeOut);
  const dxScale = interpolate(frame, [DX_S, DX_S+22], [0.93, 1.09], easeOut); // KEY MOMENT — largest zoom
  const apScale = interpolate(frame, [AP_S, AP_S+22], [0.95, 1.05], easeOut);
  const ecScale = interpolate(frame, [EC_S, EC_S+22], [0.95, 1.03], easeOut);

  /* ── Background dim — scales with phase criticality ── */
  const bgDimOp = (() => {
    if (isDX) return Math.min(dxOp * 0.74, 0.74);
    if (isMD) return Math.min(mdOp * 0.62, 0.62);
    if (isEX) return Math.min(exOp * 0.56, 0.56);
    if (isVF) return Math.min(vfOp * 0.52, 0.52);
    if (isIN) return Math.min(inOp * 0.46, 0.46);
    if (isAP) return Math.min(apOp * 0.52, 0.52);
    if (isEC) return Math.min(ecOp * 0.40, 0.40);
    return 0;
  })();

  /* ── Nav tab ── */
  const activeTab = (isEX || isMD) ? "Examine" : isDX ? "Diagnosis" : isAP ? "Assessment" : "Chat";

  /* ── Timer ── */
  const timerSec    = Math.floor(interpolate(frame, [INTRO_S, EC_E], [0, 420], clamp));
  const timerMin    = String(Math.floor(timerSec / 60)).padStart(2, "0");
  const timerSecStr = String(timerSec % 60).padStart(2, "0");

  /* ── Step label ── */
  const stepLabel = (() => {
    if (!isUI)  return "";
    if (isVF)   return "VITAL SIGNS";
    if (isIN)   return "PATIENT INTERVIEW";
    if (isEX)   return "PHYSICAL EXAM";
    if (isMD)   return "CLINICAL MEDIA";
    if (isDX)   return "DIFFERENTIAL DIAGNOSIS";
    if (isAP)   return "ASSESSMENT & PLAN";
    if (isEC)   return "PATIENT ENCOUNTER";
    return "";
  })();
  const stepColor = (() => {
    if (isVF) return colors.vitalsWarning;
    if (isIN) return colors.oasis;
    if (isEX) return colors.azurite;
    if (isMD) return colors.vitalsWarning;
    if (isDX) return colors.vitalsCritical;
    if (isAP) return colors.oasis;
    return colors.vitalsNormal;
  })();
  const stepBadgeOp = isUI ? interpolate(frame, [INTRO_S, INTRO_S + 28], [0, 1], clamp) : 0;

  /* ── Vitals strip accent (glows during VF phase) ── */
  const vitalsHighlightOp = interpolate(frame, [VF_S, VF_S + 26, VF_E - 14, VF_E], [0, 1, 1, 0], clamp);
  const vitalsPulse       = 0.5 + 0.5 * Math.sin(frame * 0.18);

  /* ── EX: active tool index (cycles through 3 tools) ── */
  const toolActiveIdx = TOOL_ACTIVATES.reduce<number>((acc, f, i) => (frame >= f ? i : acc), -1);

  /* ── DX: top differential glow + critical banner ── */
  const dxTopGlow      = isDX ? 0.4 + 0.3 * Math.sin((frame - DX_S) * 0.10) : 0;
  const dxCriticalOp   = interpolate(frame, [DX_S + 16, DX_S + 36, DX_E - 18, DX_E], [0, 1, 1, 0], clamp);
  const dxCriticalPulse = isDX ? 0.6 + 0.4 * Math.sin((frame - DX_S) * 0.08) : 0;
  const aiPanelOp      = interpolate(frame, [DX_S + 80, DX_S + 100, DX_E - 18, DX_E], [0, 1, 1, 0], clamp);

  /* ── EC: section entrance + callout sequence ── */
  const encSectionOps = encounterSections.map((_, i) =>
    interpolate(frame, [EC_S + 22 + i * 14, EC_S + 36 + i * 14], [0, 1], clamp)
  );
  const encCalloutOps = ENC_CALLOUT_STARTS.map(s =>
    interpolate(frame, [s, s + 12, s + 48, s + 62], [0, 1, 1, 0], clamp)
  );
  const encCalloutIdx = encCalloutOps.findIndex(op => op > 0.05);
  const submitProgress = interpolate(frame, [EC_S + 330, EC_S + 370], [0, 1], clamp);

  /* ── INTRO: patient model overview panel ── */
  const introOp    = interpolate(frame, [INTRO_S, INTRO_S + 18, VF_S - 10, VF_S + 6], [0, 1, 1, 0], clamp);
  const introScale = interpolate(frame, [INTRO_S, INTRO_S + 22], [0.95, 1.07], easeOut);

  /* ── Faculty guidance: slides in mid-IN phase when narration references support ── */
  const FACULTY_S     = IN_S + 150;
  const facultyOp     = interpolate(frame, [FACULTY_S, FACULTY_S + 18, IN_E - 14, IN_E], [0, 1, 1, 0], clamp);
  const facultySlideY = interpolate(frame, [FACULTY_S, FACULTY_S + 22], [18, 0], easeOut);

  /* ── Waveform animation phase ── */
  const wavePhase = frame * 0.09;

  /* ── 3D Background ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.04} waveSpeed={0.01} />
      <ParticleField count={28} color={colors.oasis} speed={0.001} opacity={0.07} />
      <GlowOrb position={[0, 0, -3]} color={colors.oasis} radius={2} baseOpacity={0.05} />
      <CameraRig positions={[
        { frame: 0,    position: [0, 0, 10]  },
        { frame: 200,  position: [0, 0, 9.2] },
        { frame: 1052, position: [0, 0, 9]   },
        { frame: 1875, position: [0, 0, 9.5] },
      ]} />
    </>
  );

  /* ── Center Y of content area (below 100px header) ── */
  const PANEL_TOP = 592;

  return (
    <SceneShell
      interstitial={{ step: 3, title: "Simulate", subtitle: "Virtual Patient Encounter" }}
      sectionLabel="3D Simulation — Virtual Patient"
      bgGradient={`linear-gradient(160deg, ${colors.midnight} 0%, #0a1628 50%, ${colors.arizonaBlue} 100%)`}
      threeContent={threeContent}
    >

      {/* ══════════════════════════════════════════════════════════════
          PERSISTENT SHELL — top nav bar + vitals strip
          Visible through entire scene after INTRO_S.
         ══════════════════════════════════════════════════════════════ */}
      {isUI && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          opacity: uiOp, pointerEvents: "none", zIndex: 10,
        }}>
          {/* Top nav bar */}
          <div style={{
            height: 52, display: "flex", alignItems: "center",
            background: `linear-gradient(90deg, ${colors.arizonaBlue}, ${colors.midnight})`,
            borderBottom: `1px solid ${colors.white}12`,
            padding: "0 24px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white }}>
                Virtual Patient
              </span>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: `${colors.white}10`, borderRadius: 16, padding: "4px 12px",
              }}>
                <PulsingDot color={colors.vitalsCritical} size={6} delay={INTRO_S} />
                <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.white }}>
                  {timerMin}:{timerSecStr}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {(["Chat", "Examine", "Diagnosis", "Assessment"] as const).map((tab, i) => {
                const isActive = tab === activeTab;
                const tabEnter = interpolate(frame, [INTRO_S + 8 + i * 5, INTRO_S + 22 + i * 5], [0, 1], clamp);
                return (
                  <div key={tab} style={{
                    fontFamily: fonts.heading, fontSize: 14, fontWeight: isActive ? 700 : 500,
                    color: isActive ? colors.white : `${colors.white}50`,
                    background: isActive ? `${colors.oasis}25` : "transparent",
                    padding: "8px 16px", borderRadius: 8, opacity: tabEnter,
                    border: isActive ? `1px solid ${colors.oasis}42` : "1px solid transparent",
                  }}>{tab}</div>
                );
              })}
            </div>
          </div>

          {/* Vitals strip */}
          <div style={{
            height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 36,
            background: "rgba(12,35,75,0.6)",
            borderBottom: `1px solid ${colors.white}06`,
            opacity: interpolate(frame, [VF_S, VF_S + 20], [0, 1], clamp),
            boxShadow: vitalsHighlightOp > 0
              ? `inset 0 0 0 1.5px ${colors.vitalsWarning}${Math.round(vitalsHighlightOp * vitalsPulse * 90).toString(16).padStart(2, "00")}`
              : "none",
            flexShrink: 0,
          }}>
            {vitals.map((v, i) => {
              const vOp = interpolate(frame, [INTRO_S + 12 + i * 5, INTRO_S + 26 + i * 5], [0, 1], clamp);
              return (
                <div key={v.label} style={{ display: "flex", alignItems: "baseline", gap: 5, opacity: vOp }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}55` }}>{v.label}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: v.color }}>{v.value}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40` }}>{v.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step badge — bottom left ── */}
      {stepBadgeOp > 0 && stepLabel && (
        <div style={{
          position: "absolute", bottom: 22, left: 24, zIndex: 50, pointerEvents: "none",
          opacity: stepBadgeOp,
        }}>
          <div style={{
            fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
            color: stepColor, background: `${stepColor}18`,
            border: `1px solid ${stepColor}48`,
            padding: "5px 18px", borderRadius: 20,
            letterSpacing: 2, textTransform: "uppercase" as const,
          }}>
            {stepLabel}
          </div>
        </div>
      )}

      {/* ══ BACKGROUND DIM — deepens with each focused phase ══ */}
      {bgDimOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(2, 6, 22, 1)",
          opacity: bgDimOp, pointerEvents: "none", zIndex: 12,
        }} />
      )}

      {/* ════════════════════════════════════════════════════════════════
          INTRO PHASE — VIRTUAL PATIENT MODEL
          Centered overview: abstract patient figure + identity card.
          Holds until VF phase fires, then fades out cleanly.
          Vitals strip deliberately hidden here — nothing competes.
         ════════════════════════════════════════════════════════════════ */}
      {introOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${introScale})`,
          width: 860, pointerEvents: "none", zIndex: 20,
          opacity: introOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.96)",
            border: `1.5px solid ${colors.azurite}38`,
            borderRadius: 20, padding: "36px 44px",
            boxShadow: `0 0 90px ${colors.azurite}14, 0 28px 80px rgba(0,0,0,0.70)`,
          }}>
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>

              {/* Abstract 3D patient figure */}
              <div style={{
                width: 130, height: 168, flexShrink: 0,
                background: `linear-gradient(160deg, rgba(12,56,82,0.45), rgba(6,12,36,0.85))`,
                border: `1px solid ${colors.azurite}32`,
                borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <svg width={72} height={114} viewBox="0 0 72 114" style={{ overflow: "visible" }}>
                  {/* Scan ring */}
                  <circle cx={36} cy={20} r={22}
                    fill="none" stroke={`${colors.oasis}20`} strokeWidth={1}
                    strokeDasharray="5 4" />
                  {/* Head */}
                  <circle cx={36} cy={20} r={13}
                    fill={`${colors.oasis}08`} stroke={`${colors.oasis}70`} strokeWidth={1.5} />
                  {/* Torso */}
                  <path d="M 22 34 Q 36 30 50 34 L 48 76 Q 36 80 24 76 Z"
                    fill={`${colors.oasis}06`} stroke={`${colors.oasis}45`} strokeWidth={1.3} />
                  {/* Arms */}
                  <line x1={22} y1={36} x2={11} y2={64} stroke={`${colors.oasis}38`} strokeWidth={1.3} />
                  <line x1={50} y1={36} x2={61} y2={64} stroke={`${colors.oasis}38`} strokeWidth={1.3} />
                  {/* Legs */}
                  <line x1={28} y1={76} x2={24} y2={112} stroke={`${colors.oasis}38`} strokeWidth={1.3} />
                  <line x1={44} y1={76} x2={48} y2={112} stroke={`${colors.oasis}38`} strokeWidth={1.3} />
                  {/* Heart-region highlight */}
                  <circle cx={32} cy={48} r={4}
                    fill="none" stroke={`${colors.vitalsCritical}60`} strokeWidth={1}
                    strokeDasharray="3 3" />
                </svg>
                <div style={{
                  position: "absolute", bottom: 10, left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: fonts.mono, fontSize: 7, color: `${colors.oasis}55`,
                  letterSpacing: 1.5, whiteSpace: "nowrap",
                }}>
                  3D PATIENT MODEL
                </div>
              </div>

              {/* Patient identity + case info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
                  color: `${colors.oasis}65`, textTransform: "uppercase" as const,
                  marginBottom: 10,
                }}>Virtual Patient Encounter</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 34, fontWeight: 800,
                  color: colors.white, lineHeight: 1.1, marginBottom: 6,
                }}>Maria Santos</div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 14, color: `${colors.white}55`,
                  marginBottom: 20, lineHeight: 1.5,
                }}>67F · Chief Complaint: Dyspnea × 3 days, bilateral leg edema</div>

                {/* Encounter capability tags */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
                  {[
                    { label: "Interview", color: colors.oasis        },
                    { label: "Exam",      color: colors.azurite       },
                    { label: "Media",     color: colors.vitalsWarning },
                    { label: "Diagnosis", color: colors.vitalsCritical},
                  ].map(({ label, color }) => (
                    <div key={label} style={{
                      fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                      color: `${color}80`, background: `${color}0E`,
                      border: `1px solid ${color}28`,
                      padding: "4px 12px", borderRadius: 4, letterSpacing: 1.5,
                    }}>{label}</div>
                  ))}
                </div>

                {/* Simulation active indicator */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  paddingTop: 14, borderTop: `1px solid ${colors.white}08`,
                }}>
                  <PulsingDot color={colors.vitalsCritical} size={7} delay={INTRO_S} />
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                    color: colors.vitalsCritical, letterSpacing: 2,
                  }}>SIMULATION ACTIVE</span>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 10,
                    color: `${colors.white}35`, marginLeft: 8,
                  }}>Clinical reasoning required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VF PHASE — REAL-TIME VITAL SIGNS
          Large centered panel. Vitals rendered at 68px — unmissable.
         ════════════════════════════════════════════════════════════════ */}
      {vfOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${vfScale})`,
          width: 1340, pointerEvents: "none", zIndex: 20,
          opacity: vfOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.95)",
            border: `1.5px solid ${colors.vitalsWarning}38`,
            borderRadius: 20, padding: "36px 52px",
            boxShadow: `0 0 90px ${colors.vitalsWarning}14, 0 28px 80px rgba(0,0,0,0.65)`,
          }}>
            {/* Header row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 30,
            }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                color: `${colors.vitalsWarning}80`, letterSpacing: 3.5,
                textTransform: "uppercase" as const,
              }}>Real-Time Vital Signs</div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                color: colors.vitalsWarning,
                background: `${colors.vitalsWarning}14`,
                border: `1px solid ${colors.vitalsWarning}42`,
                padding: "4px 14px", borderRadius: 3, letterSpacing: 2,
              }}>ABNORMAL VALUES DETECTED</div>
            </div>

            {/* Vitals — large readable numbers */}
            <div style={{ display: "flex", justifyContent: "space-around", gap: 16 }}>
              {vitals.map((v, i) => {
                const vOp = interpolate(frame, [VF_S + 8 + i * 8, VF_S + 24 + i * 8], [0, 1], clamp);
                return (
                  <div key={v.label} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    flex: 1, padding: "22px 14px",
                    background: v.flag ? `${v.color}08` : "transparent",
                    border: v.flag ? `1px solid ${v.color}22` : `1px solid ${colors.white}05`,
                    borderRadius: 16, opacity: vOp,
                  }}>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 13, fontWeight: 600,
                      color: `${colors.white}55`, letterSpacing: 2,
                    }}>{v.label}</span>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 68, fontWeight: 900,
                      color: v.color, lineHeight: 1,
                    }}>{v.value}</span>
                    <span style={{
                      fontFamily: fonts.mono, fontSize: 15, color: `${colors.white}45`,
                    }}>{v.unit}</span>
                    {v.flag && (
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 10, fontWeight: 800,
                        color: v.color, background: `${v.color}18`,
                        border: `1px solid ${v.color}38`,
                        padding: "3px 10px", borderRadius: 4, letterSpacing: 1.5,
                      }}>{v.flag}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          IN PHASE — PATIENT INTERVIEW
          Chat panel. Messages appear sequentially, narration-timed.
         ════════════════════════════════════════════════════════════════ */}
      {inOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${inScale})`,
          width: 880, pointerEvents: "none", zIndex: 20,
          opacity: inOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.94)",
            border: `1.5px solid ${colors.oasis}28`,
            borderRadius: 20, padding: "30px 38px",
            boxShadow: `0 0 70px ${colors.oasis}10, 0 24px 68px rgba(0,0,0,0.60)`,
          }}>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 26,
            }}>
              <div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
                  color: `${colors.oasis}70`, textTransform: "uppercase" as const,
                  marginBottom: 6,
                }}>Patient Interview</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white,
                }}>Maria Santos — 67F</div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: `${colors.vitalsNormal}12`,
                border: `1px solid ${colors.vitalsNormal}32`,
                borderRadius: 8, padding: "8px 16px",
              }}>
                <PulsingDot color={colors.vitalsNormal} size={7} delay={IN_S} />
                <span style={{
                  fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                  color: colors.vitalsNormal, letterSpacing: 1.5,
                }}>INTERVIEW ACTIVE</span>
              </div>
            </div>

            {/* Chat messages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {chatMessages.map((msg, i) => {
                const msgDelay = IN_S + 18 + i * 50;
                const msgOp = interpolate(frame, [msgDelay, msgDelay + 20], [0, 1], clamp);
                const isStudent = msg.from === "student";
                return (
                  <div key={i} style={{
                    display: "flex", justifyContent: isStudent ? "flex-end" : "flex-start",
                    opacity: msgOp,
                  }}>
                    <div style={{
                      maxWidth: "80%", padding: "14px 20px", borderRadius: 14,
                      background: isStudent
                        ? `linear-gradient(135deg, ${colors.arizonaBlue}, ${colors.azurite})`
                        : `${colors.white}10`,
                      border: `1px solid ${isStudent ? `${colors.oasis}22` : `${colors.white}08`}`,
                    }}>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 10,
                        color: isStudent ? colors.oasis : `${colors.white}50`,
                        letterSpacing: 1.5, marginBottom: 6,
                        textTransform: "uppercase" as const,
                      }}>{isStudent ? "Student" : "Patient"}</div>
                      <div style={{
                        fontFamily: fonts.body, fontSize: 16,
                        color: colors.white, lineHeight: 1.5,
                      }}>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input placeholder */}
            <div style={{
              marginTop: 20, padding: "12px 18px", borderRadius: 10,
              background: `${colors.white}06`, border: `1px solid ${colors.white}10`,
              fontFamily: fonts.body, fontSize: 14, color: `${colors.white}28`,
              opacity: interpolate(frame, [IN_S + 170, IN_S + 190], [0, 1], clamp),
            }}>
              Type your response...
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          FACULTY GUIDANCE — appears mid-IN phase
          Represents the faculty support layer: structured guidance
          notes that faculty can push to students during the encounter.
          Positioned below the chat panel so both are visible; the
          guidance area has higher zIndex so it reads as "on top".
         ════════════════════════════════════════════════════════════════ */}
      {facultyOp > 0.01 && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: 858,
          transform: `translateX(-50%) translateY(${facultySlideY}px)`,
          width: 880,
          opacity: facultyOp,
          pointerEvents: "none",
          zIndex: 22,
        }}>
          <div style={{
            background: "rgba(4, 10, 28, 0.96)",
            border: `1px solid ${colors.azurite}35`,
            borderRadius: 14, padding: "16px 24px",
            boxShadow: `0 0 40px ${colors.azurite}10, 0 12px 40px rgba(0,0,0,0.55)`,
            display: "flex", alignItems: "flex-start", gap: 20,
          }}>
            {/* Faculty badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
              background: `${colors.azurite}10`,
              border: `1px solid ${colors.azurite}40`,
              borderRadius: 8, padding: "8px 14px", alignSelf: "flex-start",
            }}>
              <PulsingDot color={colors.azurite} size={6} delay={FACULTY_S} />
              <span style={{
                fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                color: colors.azurite, letterSpacing: 2,
              }}>FACULTY GUIDANCE</span>
            </div>

            {/* Guidance notes — structured, clinical */}
            <div style={{ flex: 1 }}>
              {[
                { note: "Ask about orthopnea: sleeping upright, pillows used at night." },
                { note: "Inquire about prior cardiac history or previous hospitalizations." },
              ].map((g, gi) => {
                const noteOp = interpolate(frame,
                  [FACULTY_S + gi * 22, FACULTY_S + gi * 22 + 18], [0, 1], clamp);
                return (
                  <div key={gi} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    marginBottom: gi === 0 ? 6 : 0,
                    opacity: noteOp,
                  }}>
                    <div style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: `${colors.azurite}80`,
                      marginTop: 7, flexShrink: 0,
                    }} />
                    <div style={{
                      fontFamily: fonts.body, fontSize: 14,
                      color: `${colors.white}70`, lineHeight: 1.5,
                    }}>{g.note}</div>
                  </div>
                );
              })}
            </div>

            {/* Control note */}
            <div style={{
              fontFamily: fonts.mono, fontSize: 9,
              color: `${colors.white}28`, flexShrink: 0, alignSelf: "center",
              letterSpacing: 1, lineHeight: 1.6, textAlign: "right" as const,
            }}>
              Faculty-controlled<br />Visible to student
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          EX PHASE — PHYSICAL EXAM
          3 tool cards with 3D depth. Active tool lifts forward; others
          recede. Finding appears below the active tool.
         ════════════════════════════════════════════════════════════════ */}
      {exOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${exScale})`,
          width: 980, pointerEvents: "none", zIndex: 20,
          opacity: exOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.94)",
            border: `1.5px solid ${colors.azurite}28`,
            borderRadius: 20, padding: "30px 38px",
            boxShadow: `0 0 70px ${colors.azurite}10, 0 24px 68px rgba(0,0,0,0.60)`,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
              color: `${colors.azurite}70`, textTransform: "uppercase" as const,
              marginBottom: 6,
            }}>Physical Examination</div>
            <div style={{
              fontFamily: fonts.heading, fontSize: 22, fontWeight: 700,
              color: colors.white, marginBottom: 30,
            }}>Maria Santos — 67F</div>

            {/* Tool cards — 3D lift system */}
            <div style={{ display: "flex", gap: 22, marginBottom: 28 }}>
              {examTools.map((tool, i) => {
                const isActive  = toolActiveIdx === i;
                const wasActive = toolActiveIdx > i;
                const toolOp    = interpolate(frame, [TOOL_ACTIVATES[i], TOOL_ACTIVATES[i] + 18], [0, 1], clamp);
                const cardScale = isActive ? 1.10 : wasActive ? 0.93 : 0.88;
                const cardOp    = isActive ? 1.0 : wasActive ? 0.55 : 0.35;
                return (
                  <div key={tool.name} style={{
                    flex: 1, textAlign: "center" as const,
                    padding: "26px 16px",
                    background: isActive ? `${tool.color}14` : `${colors.white}04`,
                    border: `1.5px solid ${isActive ? `${tool.color}62` : `${colors.white}10`}`,
                    borderRadius: 14,
                    opacity: toolOp * cardOp,
                    transform: `scale(${cardScale})`,
                    boxShadow: isActive
                      ? `0 0 45px ${tool.color}25, 0 10px 36px rgba(0,0,0,0.50)`
                      : "none",
                    transformOrigin: "center center",
                  }}>
                    <div style={{
                      fontFamily: fonts.heading, fontSize: 19, fontWeight: 700,
                      color: isActive ? colors.white : `${colors.white}45`,
                      marginBottom: 10,
                    }}>{tool.name}</div>
                    {isActive && (
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                        color: tool.color, letterSpacing: 2,
                        background: `${tool.color}16`,
                        border: `1px solid ${tool.color}35`,
                        padding: "3px 12px", borderRadius: 3, display: "inline-block",
                      }}>ACTIVE</div>
                    )}
                    {wasActive && (
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                        color: colors.vitalsNormal, letterSpacing: 1,
                      }}>✓ Complete</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active finding — appears below active tool */}
            {toolActiveIdx >= 0 && (
              <div style={{
                padding: "22px 26px",
                background: `${examTools[toolActiveIdx].color}0C`,
                border: `1px solid ${examTools[toolActiveIdx].color}32`,
                borderRadius: 12,
                opacity: interpolate(
                  frame,
                  [TOOL_ACTIVATES[toolActiveIdx] + 14, TOOL_ACTIVATES[toolActiveIdx] + 30],
                  [0, 1], clamp
                ),
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}45`,
                      letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" as const,
                    }}>Finding</div>
                    <div style={{
                      fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white,
                    }}>
                      {examTools[toolActiveIdx].finding}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                    color: examTools[toolActiveIdx].color,
                    background: `${examTools[toolActiveIdx].color}18`,
                    border: `1px solid ${examTools[toolActiveIdx].color}42`,
                    padding: "5px 16px", borderRadius: 4,
                    letterSpacing: 1.5, flexShrink: 0,
                  }}>
                    {examTools[toolActiveIdx].type}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MD PHASE — CLINICAL MEDIA
          Two animated waveforms + image panel. All large, instantly
          readable. Waveform bars are frame-driven (no CSS transitions).
         ════════════════════════════════════════════════════════════════ */}
      {mdOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${mdScale})`,
          width: 1120, pointerEvents: "none", zIndex: 20,
          opacity: mdOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.95)",
            border: `1.5px solid ${colors.vitalsWarning}28`,
            borderRadius: 20, padding: "32px 44px",
            boxShadow: `0 0 90px ${colors.vitalsWarning}10, 0 28px 80px rgba(0,0,0,0.65)`,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3.5,
              color: `${colors.vitalsWarning}70`, textTransform: "uppercase" as const,
              marginBottom: 30,
            }}>Clinical Examination Media</div>

            {/* Heart sounds */}
            <div style={{
              marginBottom: 22,
              opacity: interpolate(frame, [MD_S + 12, MD_S + 28], [0, 1], clamp),
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
              }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 19, fontWeight: 700, color: colors.white }}>
                  Heart Sounds
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                  color: colors.vitalsWarning,
                  background: `${colors.vitalsWarning}14`,
                  border: `1px solid ${colors.vitalsWarning}38`,
                  padding: "4px 14px", borderRadius: 3, letterSpacing: 2,
                }}>S3 GALLOP DETECTED</div>
              </div>
              <div style={{
                height: 104, borderRadius: 12,
                background: `linear-gradient(135deg, rgba(30,60,110,0.5), rgba(12,35,75,0.7))`,
                border: `1px solid ${colors.vitalsWarning}22`,
                display: "flex", alignItems: "center", padding: "0 22px", gap: 14,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                  color: `${colors.vitalsWarning}80`, letterSpacing: 1.5, flexShrink: 0,
                }}>PLAYING</div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, height: "100%", padding: "12px 0" }}>
                  {Array.from({ length: 48 }).map((_, wi) => {
                    const h = 10 + Math.abs(Math.sin(wi * 0.6 + wavePhase) * 38);
                    return (
                      <div key={wi} style={{
                        flex: 1, maxWidth: 16, height: h, borderRadius: 2,
                        background: wi < 30
                          ? `${colors.vitalsWarning}${Math.round(80 + h * 1.5).toString(16).padStart(2, "00")}`
                          : `${colors.vitalsWarning}25`,
                      }} />
                    );
                  })}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}50`, flexShrink: 0 }}>
                  0:42
                </div>
              </div>
            </div>

            {/* Lung auscultation */}
            <div style={{
              marginBottom: 22,
              opacity: interpolate(frame, [MD_S + 80, MD_S + 98], [0, 1], clamp),
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
              }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 19, fontWeight: 700, color: colors.white }}>
                  Lung Auscultation
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                  color: colors.oasis,
                  background: `${colors.oasis}14`,
                  border: `1px solid ${colors.oasis}38`,
                  padding: "4px 14px", borderRadius: 3, letterSpacing: 2,
                }}>BILATERAL CRACKLES</div>
              </div>
              <div style={{
                height: 80, borderRadius: 12,
                background: `linear-gradient(135deg, rgba(12,56,82,0.5), rgba(12,35,75,0.7))`,
                border: `1px solid ${colors.oasis}20`,
                display: "flex", alignItems: "center", padding: "0 22px", gap: 14,
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                  color: `${colors.oasis}80`, letterSpacing: 1.5, flexShrink: 0,
                }}>PLAYING</div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, height: "100%", padding: "10px 0" }}>
                  {Array.from({ length: 48 }).map((_, wi) => {
                    const h = 6 + Math.abs(Math.sin(wi * 0.9 + wavePhase + 1.2) * 26);
                    return (
                      <div key={wi} style={{
                        flex: 1, maxWidth: 16, height: h, borderRadius: 2,
                        background: wi < 32
                          ? `${colors.oasis}${Math.round(72 + h * 2.5).toString(16).padStart(2, "00")}`
                          : `${colors.oasis}22`,
                      }} />
                    );
                  })}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}50`, flexShrink: 0 }}>
                  1:15
                </div>
              </div>
            </div>

            {/* Chest X-ray image panel */}
            <div style={{
              padding: "20px 24px",
              background: "rgba(0,0,0,0.30)",
              border: `1px solid ${colors.azurite}22`,
              borderRadius: 12,
              display: "flex", alignItems: "center", gap: 26,
              opacity: interpolate(frame, [MD_S + 148, MD_S + 168], [0, 1], clamp),
            }}>
              <div style={{
                width: 128, height: 96, borderRadius: 8, flexShrink: 0,
                background: "rgba(20, 35, 65, 0.85)",
                border: `1px solid ${colors.azurite}32`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 8, fontWeight: 700,
                  color: `${colors.azurite}65`, letterSpacing: 2, textAlign: "center" as const,
                }}>CHEST X-RAY</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 20, fontWeight: 700,
                  color: colors.white, marginBottom: 6,
                }}>Cardiomegaly — Bilateral Effusions</div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}55`,
                }}>Chest X-Ray · Radiological Imaging</div>
              </div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                color: colors.vitalsWarning,
                background: `${colors.vitalsWarning}14`,
                border: `1px solid ${colors.vitalsWarning}32`,
                padding: "5px 14px", borderRadius: 4, letterSpacing: 1.5, flexShrink: 0,
              }}>ABNORMAL</div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          DX PHASE — DIFFERENTIAL DIAGNOSIS  (KEY MOMENT)
          Strongest dim (74%), largest zoom (1.09), longest hold.
          "Decision Required" banner. Top DX lifts forward with glow.
          AI guidance appears after 2.7s hold.
         ════════════════════════════════════════════════════════════════ */}
      {dxOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${dxScale})`,
          width: 1060, pointerEvents: "none", zIndex: 20,
          opacity: dxOp, transformOrigin: "center center",
        }}>
          {/* "Decision required" banner */}
          {dxCriticalOp > 0 && (
            <div style={{ textAlign: "center" as const, marginBottom: 16, opacity: dxCriticalOp }}>
              <div style={{
                display: "inline-block",
                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                color: colors.vitalsCritical,
                background: `${colors.vitalsCritical}10`,
                border: `1px solid ${colors.vitalsCritical}${Math.round(dxCriticalPulse * 72).toString(16).padStart(2, "00")}`,
                padding: "5px 26px", borderRadius: 3, letterSpacing: 2.5,
                boxShadow: `0 0 18px ${colors.vitalsCritical}${Math.round(dxCriticalPulse * 30).toString(16).padStart(2, "00")}`,
              }}>
                DIFFERENTIAL DIAGNOSIS — DECISION REQUIRED
              </div>
            </div>
          )}

          <div style={{
            background: "rgba(5, 10, 30, 0.96)",
            border: `1.5px solid ${colors.vitalsCritical}${Math.round(dxOp * 32).toString(16).padStart(2, "00")}`,
            borderRadius: 20, padding: "32px 42px",
            boxShadow: `0 0 110px ${colors.vitalsCritical}12, 0 28px 80px rgba(0,0,0,0.72)`,
          }}>
            <div style={{ display: "flex", gap: 30 }}>

              {/* Left: Differentials */}
              <div style={{ flex: 1.2 }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
                  color: `${colors.vitalsCritical}80`, textTransform: "uppercase" as const,
                  marginBottom: 6,
                }}>Ranked by Likelihood</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 22, fontWeight: 700,
                  color: colors.white, marginBottom: 22,
                }}>Differential Diagnosis</div>

                {differentials.map((dx, i) => {
                  const dxItemOp = interpolate(frame, [DX_S + 16 + i * 22, DX_S + 32 + i * 22], [0, 1], clamp);
                  const isTop = i === 0;
                  return (
                    <div key={dx.name} style={{
                      display: "flex", alignItems: "center",
                      padding: isTop ? "18px 20px" : "12px 16px",
                      borderRadius: 10, marginBottom: 10,
                      background: isTop ? `${dx.color}14` : `${dx.color}06`,
                      borderLeft: `4px solid ${dx.color}`,
                      border: isTop
                        ? `1.5px solid ${dx.color}${Math.round(dxTopGlow * 92).toString(16).padStart(2, "00")}`
                        : `1px solid ${dx.color}16`,
                      borderLeftWidth: 4,
                      opacity: dxItemOp * (isTop ? 1.0 : 0.60),
                      transform: isTop ? `scale(${1 + dxTopGlow * 0.012})` : "none",
                      transformOrigin: "left center",
                      boxShadow: isTop
                        ? `0 0 22px ${dx.color}${Math.round(dxTopGlow * 58).toString(16).padStart(2, "00")}`
                        : "none",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: fonts.body, fontSize: isTop ? 18 : 15,
                          color: isTop ? colors.white : `${colors.white}65`,
                          fontWeight: isTop ? 700 : 400,
                        }}>{dx.name}</div>
                      </div>
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 12, fontWeight: 700,
                        color: dx.color, background: `${dx.color}18`,
                        padding: "4px 12px", borderRadius: 4, flexShrink: 0,
                      }}>{dx.likelihood}</span>
                    </div>
                  );
                })}
              </div>

              {/* Right: Diagnostic results */}
              <div style={{ flex: 0.85 }}>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
                  color: `${colors.azurite}70`, textTransform: "uppercase" as const,
                  marginBottom: 6,
                }}>Supporting Tests</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 22, fontWeight: 700,
                  color: colors.white, marginBottom: 22,
                }}>Diagnostic Results</div>

                {diagnosticResults.map((t, i) => {
                  const tOp = interpolate(frame, [DX_S + 28 + i * 18, DX_S + 44 + i * 18], [0, 1], clamp);
                  const sevColor = t.severity === "Critical" ? colors.vitalsCritical : colors.vitalsWarning;
                  return (
                    <div key={t.name} style={{
                      padding: "10px 16px", borderRadius: 8,
                      background: `${colors.white}04`,
                      border: `1px solid ${colors.white}08`,
                      marginBottom: 8, opacity: tOp,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.white }}>
                          {t.name}
                        </span>
                        <span style={{
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: sevColor,
                          background: `${sevColor}14`, padding: "2px 8px", borderRadius: 3,
                        }}>{t.severity}</span>
                      </div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}58` }}>{t.result}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI guidance strip */}
            {aiPanelOp > 0 && (
              <div style={{
                marginTop: 24, paddingTop: 20,
                borderTop: `1px solid ${colors.white}08`,
                display: "flex", alignItems: "flex-start", gap: 16,
                opacity: aiPanelOp,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 7, flexShrink: 0,
                  background: `${colors.azurite}10`,
                  border: `1px solid ${colors.azurite}38`,
                  borderRadius: 6, padding: "6px 12px",
                }}>
                  <PulsingDot color={colors.azurite} size={6} delay={DX_S + 80} />
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 9, fontWeight: 700,
                    color: colors.azurite, letterSpacing: 2,
                  }}>AI GUIDANCE</span>
                </div>
                <div>
                  <div style={{
                    fontFamily: fonts.body, fontSize: 15, color: `${colors.white}72`, lineHeight: 1.5,
                  }}>
                    BNP 1,840 pg/mL strongly supports decompensated heart failure.
                    Consider adding Echocardiogram to workup.
                  </div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}30`, marginTop: 5,
                  }}>Faculty-controlled · Students see guidance only when enabled</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          AP PHASE — ASSESSMENT & PLAN
          Clean structured documentation panel. Items appear sequentially.
         ════════════════════════════════════════════════════════════════ */}
      {apOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${apScale})`,
          width: 860, pointerEvents: "none", zIndex: 20,
          opacity: apOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(6, 12, 36, 0.95)",
            border: `1.5px solid ${colors.oasis}28`,
            borderRadius: 20, padding: "32px 42px",
            boxShadow: `0 0 70px ${colors.oasis}10, 0 24px 68px rgba(0,0,0,0.60)`,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
              color: `${colors.oasis}70`, textTransform: "uppercase" as const,
              marginBottom: 6,
            }}>Clinical Documentation</div>
            <div style={{
              fontFamily: fonts.heading, fontSize: 24, fontWeight: 700,
              color: colors.white, marginBottom: 28,
            }}>Assessment & Plan</div>

            {assessmentItems.map((item, i) => {
              const apItemOp = interpolate(frame, [AP_S + 16 + i * 20, AP_S + 32 + i * 20], [0, 1], clamp);
              const isConsult = item.label === "Consult";
              return (
                <div key={item.label} style={{
                  display: "flex", gap: 18, padding: "16px 20px",
                  borderRadius: 10, marginBottom: 10,
                  background: isConsult ? `${colors.vitalsWarning}08` : `${colors.white}04`,
                  border: `1px solid ${isConsult ? `${colors.vitalsWarning}28` : `${colors.white}08`}`,
                  opacity: apItemOp,
                }}>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 13, fontWeight: 800,
                    color: isConsult ? colors.vitalsWarning : colors.oasis,
                    minWidth: 92, flexShrink: 0, lineHeight: 1.4,
                  }}>{item.label}</span>
                  <span style={{
                    fontFamily: fonts.body, fontSize: 18,
                    color: colors.white, lineHeight: 1.4,
                  }}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          EC PHASE — PATIENT ENCOUNTER SUMMARY
          All 5 sections, each highlighted in sequence as narration
          describes them. Submit button appears at the end.
         ════════════════════════════════════════════════════════════════ */}
      {ecOp > 0.01 && (
        <div style={{
          position: "absolute", left: "50%", top: PANEL_TOP,
          transform: `translate(-50%, -50%) scale(${ecScale})`,
          width: 720, pointerEvents: "none", zIndex: 20,
          opacity: ecOp, transformOrigin: "center center",
        }}>
          <div style={{
            background: "rgba(5, 10, 30, 0.96)",
            border: `1.5px solid ${colors.vitalsNormal}28`,
            borderRadius: 20, padding: "32px 42px",
            boxShadow: `0 0 80px ${colors.vitalsNormal}10, 0 28px 80px rgba(0,0,0,0.65)`,
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3.5,
              color: `${colors.vitalsNormal}70`, textTransform: "uppercase" as const,
              marginBottom: 6,
            }}>Case Complete</div>
            <div style={{
              fontFamily: fonts.heading, fontSize: 24, fontWeight: 700,
              color: colors.white, marginBottom: 6,
            }}>Patient Encounter Summary</div>
            <div style={{
              fontFamily: fonts.body, fontSize: 14, color: `${colors.white}45`,
              marginBottom: 26,
            }}>Maria Santos · 67F · All sections complete</div>

            {encounterSections.map((sec, i) => {
              const isLift = encCalloutIdx === i;
              const isDim  = encCalloutIdx >= 0 && encCalloutIdx !== i;
              const callOp = encCalloutOps[i];
              const rowColor = encRowColors[i];
              return (
                <div key={sec.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 18px", borderRadius: 8, marginBottom: 6,
                  background: isLift ? `${rowColor}16` : `${colors.white}04`,
                  border: isLift
                    ? `1px solid ${rowColor}${Math.round(callOp * 88).toString(16).padStart(2, "00")}`
                    : `1px solid ${colors.white}06`,
                  opacity: encSectionOps[i] * (isDim ? 0.38 : 1.0),
                  transform: isLift ? "translateY(-2px) scale(1.018)" : "none",
                  transformOrigin: "50% 50%",
                  boxShadow: isLift ? `0 4px 22px ${rowColor}22` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.vitalsNormal }}>✓</span>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 17,
                      color: isLift ? colors.white : `${colors.white}80`,
                      fontWeight: isLift ? 600 : 400,
                    }}>{sec.label}</span>
                  </div>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 13,
                    color: isLift ? `${rowColor}CC` : `${colors.white}38`,
                  }}>{sec.items} items</span>
                </div>
              );
            })}

            {/* Submit button */}
            <div style={{
              marginTop: 24, padding: "15px 0", borderRadius: 10,
              textAlign: "center" as const,
              background: submitProgress > 0
                ? `linear-gradient(135deg, ${colors.vitalsNormal}, #059669)`
                : `linear-gradient(135deg, ${colors.arizonaBlue}, ${colors.azurite})`,
              border: `1px solid ${submitProgress > 0 ? `${colors.vitalsNormal}55` : `${colors.oasis}32`}`,
              fontFamily: fonts.heading, fontSize: 17, fontWeight: 700,
              color: colors.white,
              opacity: interpolate(frame, [EC_S + 300, EC_S + 320], [0, 1], clamp),
              transform: submitProgress > 0 ? `scale(${1 + submitProgress * 0.025})` : "scale(1)",
              boxShadow: submitProgress > 0 ? `0 0 32px ${colors.vitalsNormal}38` : "none",
            }}>
              {submitProgress > 0.5 ? "✓ Session Submitted" : "Submit Encounter"}
            </div>
          </div>
        </div>
      )}

    </SceneShell>
  );
};
