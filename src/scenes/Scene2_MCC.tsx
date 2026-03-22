import React, { useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { NodeNetwork } from "../three/NodeNetwork";
import { CameraRig } from "../three/CameraRig";
import { PulsingDot } from "../components/PulsingDot";
import { colors, fonts } from "../theme";

/* ──────────────────────────────────────────────────────────────────────
   PAPER DOCUMENT COMPONENT (manual documentation visual)
   ────────────────────────────────────────────────────────────────────── */
const PAPER_BG = "rgba(252, 249, 240, 0.97)";
const INK_DARK = "#1a2035";
const INK_BAR  = "rgba(26, 32, 53, 0.13)";
const INK_MED  = "#7080a0";

interface PaperSection { heading: string; lines: number }
interface PaperDocProps {
  title: string; subtitle: string; accent: string;
  sections: PaperSection[]; badge?: string;
}
const PaperDoc: React.FC<PaperDocProps> = ({ title, subtitle, accent, sections, badge }) => (
  <div style={{
    background: PAPER_BG, borderRadius: 3, overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.42), 0 2px 8px rgba(0,0,0,0.2)",
    width: "100%", height: "100%", display: "flex", flexDirection: "column",
  }}>
    <div style={{ height: 10, background: accent, flexShrink: 0 }} />
    <div style={{
      padding: "16px 22px 12px",
      borderBottom: "1px solid rgba(26,32,53,0.10)",
      flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 800, color: INK_DARK, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 12, color: INK_MED, marginTop: 5 }}>{subtitle}</div>
      </div>
      {badge && (
        <div style={{
          fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: "#c0392b",
          background: "rgba(192,57,43,0.10)", border: "1px solid rgba(192,57,43,0.25)",
          padding: "4px 10px", borderRadius: 4, marginTop: 4, flexShrink: 0,
        }}>{badge}</div>
      )}
    </div>
    <div style={{ padding: "14px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
      {sections.map((sec, si) => (
        <div key={si}>
          <div style={{
            fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: "#8090b8",
            letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8,
          }}>{sec.heading}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Array.from({ length: sec.lines }).map((_, li) => (
              <div key={li} style={{
                height: 12, borderRadius: 6, background: INK_BAR,
                width: `${56 + ((li * 41 + si * 17 + 9) % 36)}%`,
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────
   NEURAL NETWORK (AI visualization during generation)
   ────────────────────────────────────────────────────────────────────── */
function buildNetworkNodes() {
  const nodes: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < 8;  i++) nodes.push({ x: -2, y: -1.75 + i * 0.5, z: -1 });
  for (let i = 0; i < 14; i++) nodes.push({ x:  0, y: -1.75 + i * (3.5 / 13), z: -1 });
  for (let i = 0; i < 8;  i++) nodes.push({ x:  2, y: -1.75 + i * 0.5, z: -1 });
  return nodes;
}
function buildNetworkEdges(n: number): [number, number][] {
  const edges: [number, number][] = [];
  const ie = 8, he = 22;
  for (let i = 0; i < ie; i++) for (let j = ie; j < he; j += 2) edges.push([i, j]);
  for (let i = ie; i < he; i++) for (let j = he; j < n;  j += 2) edges.push([i, j]);
  return edges;
}

/* ──────────────────────────────────────────────────────────────────────
   SCENE DATA
   ────────────────────────────────────────────────────────────────────── */
const paperLayout = [
  { left: 60,   top: 88,  w: 520, h: 385, rot: -2.5, si: 0, z: 2,
    title: "PATIENT HISTORY",    subtitle: "12 pages · Last updated 09/14", accent: colors.arizonaBlue, badge: "12 pg",
    sections: [{ heading: "HISTORY OF PRESENT ILLNESS", lines: 5 }, { heading: "PAST MEDICAL HISTORY", lines: 4 }, { heading: "MEDICATIONS", lines: 3 }] },
  { left: 1340, top: 90,  w: 520, h: 385, rot:  3.0, si: 2, z: 2,
    title: "LAB RESULTS",        subtitle: "CBC / BMP · 8 pages",           accent: "#16a34a",          badge: "8 pg",
    sections: [{ heading: "COMPLETE BLOOD COUNT", lines: 5 }, { heading: "METABOLIC PANEL", lines: 4 }, { heading: "URINALYSIS", lines: 3 }] },
  { left: 55,   top: 618, w: 500, h: 355, rot:  1.5, si: 3, z: 2,
    title: "MEDICATION LOG",     subtitle: "Active orders · 6 pages",        accent: colors.vitalsWarning, badge: "6 pg",
    sections: [{ heading: "ACTIVE MEDICATIONS", lines: 5 }, { heading: "RECENT ORDERS", lines: 4 }] },
  { left: 1365, top: 622, w: 490, h: 350, rot: -2.0, si: 4, z: 2,
    title: "REFERRAL NOTES",     subtitle: "Consultation request · 4 pages", accent: "#06b6d4",          badge: "4 pg",
    sections: [{ heading: "REASON FOR REFERRAL", lines: 4 }, { heading: "CLINICAL SUMMARY", lines: 4 }] },
  { left: 528,  top: 242, w: 864, h: 536, rot: -0.5, si: 1, z: 4,
    title: "CLINICAL NOTES",     subtitle: "3 days of documentation · 17 pages", accent: colors.arizonaRed, badge: "17 pg",
    sections: [{ heading: "HISTORY OF PRESENT ILLNESS", lines: 5 }, { heading: "PHYSICAL EXAMINATION", lines: 4 }, { heading: "ASSESSMENT & PLAN", lines: 4 }, { heading: "FOLLOW-UP ORDERS", lines: 3 }] },
];

/* P3: Case Library */
const libraryCategories = [
  { name: "Pulmonology",   items: [{ label: "Pneumonia", selected: true }, { label: "COPD Exacerbation", selected: false }, { label: "Pulmonary Embolism", selected: false }] },
  { name: "Cardiology",    items: [{ label: "Heart Failure", selected: false }, { label: "STEMI", selected: false }, { label: "Atrial Fibrillation", selected: false }] },
  { name: "Endocrinology", items: [{ label: "Diabetic Ketoacidosis", selected: false }, { label: "Hypoglycemia", selected: false }] },
];
const templateSections = ["Patient Information", "Vital Signs", "Chief Complaint", "Physical Examination", "Lab Results", "Assessment & Plan"];

/* P4: AI-generated section data */
const aiSections = [
  {
    title: "Patient Information", color: colors.oasis,
    fields: [
      { label: "PATIENT",          value: "Michael Chen",            flag: null },
      { label: "AGE / SEX",        value: "58 — Male",               flag: null },
      { label: "CHIEF COMPLAINT",  value: "Fever & cough × 3 days",  flag: null },
    ],
  },
  {
    title: "Vital Signs", color: "#F59E0B",
    fields: [
      { label: "TEMPERATURE",    value: "38.9 °C",      flag: "H" },
      { label: "HEART RATE",     value: "96 bpm",        flag: null },
      { label: "BLOOD PRESSURE", value: "138/88 mmHg",  flag: "H" },
      { label: "O₂ SATURATION",  value: "95%",           flag: null },
    ],
  },
  {
    title: "Exam Findings", color: colors.azurite,
    fields: [
      { label: "RESPIRATORY",   value: "Bilateral crackles",       flag: null },
      { label: "BREATH SOUNDS", value: "Decreased at bases",       flag: null },
      { label: "PERCUSSION",    value: "Dull — right lower lobe",  flag: null },
    ],
  },
  {
    title: "Diagnostics", color: "#06b6d4",
    fields: [
      { label: "CHEST X-RAY", value: "RLL Consolidation",            flag: "!" },
      { label: "WBC COUNT",   value: "14,200 /μL",                   flag: "H" },
      { label: "ASSESSMENT",  value: "Community-Acquired Pneumonia", flag: null },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────
   PHASE BOUNDARIES  (30fps · audio starts f10 · ends ~f767)

   P1   f 65–185   Papers — manual documentation
   SCAN f178–232   Transformation sweep
   P2   f232–340   AIMMS interface overview
   P3   f340–460   Browse library + template select
   P4   f460–700   AI generation — 4 sequential focused panels
        Sec 0 f460–525   Patient Information
        Sec 1 f518–592   Vital Signs
        Sec 2 f583–650   Exam Findings
        Sec 3 f642–700   Diagnostics
   P5   f692–795   Case Complete — finalized
   ────────────────────────────────────────────────────────────────────── */
const P1S = 65,  P1E = 185;
const P2S = 232, P2E = 340;
const P3S = 340, P3E = 462;
const P4S = 460, P4E = 700;
const P5S = 692, P5E = 795;

// P4 section windows (slight overlap for crossfade)
const SEC_WINDOWS = [
  [460, 525],
  [518, 592],
  [583, 650],
  [642, 700],
] as const;

const FILL_DELAY  = 10; // frames after section appears before AI starts filling
const FIELD_GAP   = 14; // stagger between field reveals
const FIELD_TIME  = 13; // frames to type each field value

/* ──────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────── */
export const Scene2_MCC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp  = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeIO = { easing: Easing.inOut(Easing.ease), ...clamp };
  const easeIn = { easing: Easing.in(Easing.ease),    ...clamp };

  const networkNodes = useMemo(() => buildNetworkNodes(), []);
  const networkEdges = useMemo(() => buildNetworkEdges(networkNodes.length), [networkNodes.length]);

  /* ── Paper springs ── */
  const PAPER_DELAYS = [68, 74, 82, 94, 106] as const;
  const paperSprings = PAPER_DELAYS.map(d =>
    spring({ frame: frame - d, fps, config: { damping: 22, stiffness: 88, mass: 1.0 } })
  );
  const papersExitOp    = interpolate(frame, [190, 265], [1, 0], easeIn);
  const papersExitScale = interpolate(frame, [190, 265], [1, 0.90], easeIn);
  const papersExitY     = interpolate(frame, [190, 265], [0, 18], easeIn);

  /* ── Scan line ── */
  const scanProgress = interpolate(frame, [180, 228], [0, 1], clamp);
  const scanOpacity  = interpolate(frame, [178, 184, 223, 230], [0, 1, 1, 0], clamp);

  /* ── Phase helpers ── */
  const phOp   = (s: number, e: number) => interpolate(frame, [s, s + 18, e - 16, e], [0, 1, 1, 0], clamp);
  const phZoom = (s: number)            => interpolate(frame, [s, s + 30], [0.93, 1.0], easeIO);

  const p2Op = phOp(P2S, P2E); const p2Zoom = phZoom(P2S);
  const p3Op = phOp(P3S, P3E); const p3Zoom = phZoom(P3S);
  const p5Op = interpolate(frame, [P5S, P5S + 20, P5E], [0, 1, 1], clamp);
  const p5Zoom = phZoom(P5S);

  /* ── P3 sub-animations ── */
  // Library items stagger in
  const libItemOps = libraryCategories.flatMap((cat, ci) =>
    cat.items.map((_, ii) =>
      interpolate(frame, [P3S + 22 + ci * 22 + ii * 10, P3S + 38 + ci * 22 + ii * 10], [0, 1], clamp)
    )
  );
  // Template preview appears after selection
  const templateOp    = interpolate(frame, [P3S + 68, P3S + 88], [0, 1], clamp);
  const templateZoom  = interpolate(frame, [P3S + 68, P3S + 98], [0.93, 1.0], easeIO);
  const templateSectOps = templateSections.map((_, i) =>
    interpolate(frame, [P3S + 92 + i * 10, P3S + 106 + i * 10], [0, 1], clamp)
  );
  const generateBtnOp = interpolate(frame, [P3S + 110, P3S + 125], [0, 1], clamp);

  /* ── P4: section opacities & field reveals ── */
  const secOps = SEC_WINDOWS.map(([s, e]) =>
    interpolate(frame, [s, s + 14, e - 12, e], [0, 1, 1, 0], clamp)
  );

  // For each section: which fields have been revealed
  const secFieldOps = aiSections.map((sec, si) => {
    const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
    return sec.fields.map((field, fi) => {
      const start = fillStart + fi * FIELD_GAP;
      return Math.floor(interpolate(frame, [start, start + FIELD_TIME], [0, field.value.length], clamp));
    });
  });

  const isDone = (si: number, fi: number) => {
    const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
    return frame >= fillStart + fi * FIELD_GAP + FIELD_TIME;
  };

  const isTyping = (si: number, fi: number) => {
    const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
    const start = fillStart + fi * FIELD_GAP;
    return frame > start && !isDone(si, fi);
  };

  // Which section is currently active
  const activeSec = SEC_WINDOWS.findIndex(([s, e]) => frame >= s && frame < e);

  // Section completion dots (for breadcrumb)
  const secDone = aiSections.map((sec, si) => {
    const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
    const lastField = sec.fields.length - 1;
    return frame >= fillStart + lastField * FIELD_GAP + FIELD_TIME;
  });

  /* ── Neural network (AI thinking) ── */
  const networkOp = interpolate(frame, [P4S, P4S + 30, P4E - 20, P4E], [0, 0.32, 0.32, 0], clamp);

  /* ── 3D background ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.06} />
      <ParticleField count={48} color={colors.oasis} speed={0.002} opacity={0.16} />
      {networkOp > 0 && (
        <NodeNetwork
          nodes={networkNodes} edges={networkEdges}
          color={colors.oasis} nodeSize={0.04}
          edgeOpacity={networkOp * 0.38} pulseSpeed={0.018}
          position={[0, 0, -2]} scale={0.9}
        />
      )}
      <GlowOrb position={[0, 0, -3]} color={colors.azurite} radius={3} baseOpacity={0.10} />
      <CameraRig positions={[
        { frame: 0,   position: [0, 0, 10] },
        { frame: 180, position: [0, 0, 9] },
        { frame: 360, position: [0, 0, 8] },
        { frame: 810, position: [0, 0, 8] },
      ]} />
    </>
  );

  /* ── Shared wrapper style ── */
  const phWrap = (op: number): React.CSSProperties => ({
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "80px 64px 28px",
    opacity: op, pointerEvents: "none", zIndex: 10,
  });

  const glass: React.CSSProperties = {
    background: "rgba(12, 35, 75, 0.82)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid ${colors.oasis}28`,
    borderRadius: 14,
  };

  return (
    <SceneShell
      interstitial={{ step: 1, title: "Author", subtitle: "Medical Case Creator" }}
      sectionLabel="Case Authoring — MCC"
      threeContent={threeContent}
    >

      {/* ══════════════════════════════════════════════════════════
          PHASE 1 — Five large paper documents  (f65–265)
         ══════════════════════════════════════════════════════════ */}
      {frame >= P1S && frame < 268 && paperLayout.map((p, pi) => {
        const sp = paperSprings[p.si];
        const spOp    = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
        const spScale = interpolate(sp, [0, 1], [0.88, 1], { extrapolateRight: "clamp" as const });
        const spY     = interpolate(sp, [0, 1], [22, 0], { extrapolateRight: "clamp" as const });
        return (
          <div key={pi} style={{
            position: "absolute", left: p.left, top: p.top, width: p.w, height: p.h,
            zIndex: p.z, pointerEvents: "none",
            transform: `rotate(${p.rot}deg) scale(${spScale * papersExitScale}) translateY(${spY + papersExitY}px)`,
            opacity: spOp * papersExitOp, transformOrigin: "center center",
          }}>
            <PaperDoc title={p.title} subtitle={p.subtitle} accent={p.accent} sections={p.sections} badge={p.badge} />
          </div>
        );
      })}

      {/* Phase label — "Manual Documentation" */}
      {frame >= 94 && frame < 205 && (
        <div style={{
          position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)",
          opacity: interpolate(frame, [94, 120, 182, 205], [0, 1, 1, 0], clamp),
          pointerEvents: "none", zIndex: 5, textAlign: "center" as const,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}45`, letterSpacing: 2.5, textTransform: "uppercase" as const }}>
            Traditional Manual Documentation
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SCAN LINE — transformation sweep  (f178–232)
         ══════════════════════════════════════════════════════════ */}
      {scanOpacity > 0 && (
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: scanProgress * 1080, height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${colors.oasis}40 8%, ${colors.oasis} 50%, ${colors.oasis}40 92%, transparent 100%)`,
          boxShadow: `0 0 12px 2px ${colors.oasis}AA, 0 0 32px 6px ${colors.oasis}55, 0 0 60px 12px ${colors.oasis}22`,
          opacity: scanOpacity, zIndex: 30, pointerEvents: "none",
        }} />
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 2 — Interface Overview  (f232–340)
          A brief establishing shot of the Case Creator tool.
         ══════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={phWrap(p2Op)}>
          <div style={{ transform: `scale(${p2Zoom})`, width: "100%", maxWidth: 960, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Header bar */}
            <div style={{ ...glass, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white }}>
                  Medical Case Creator
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}40` }}>
                  Pneumonia — Adult
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Case Library", "Templates", "My Cases"].map(btn => (
                  <div key={btn} style={{
                    fontFamily: fonts.body, fontSize: 14, fontWeight: 600,
                    color: btn === "Case Library" ? colors.oasis : `${colors.white}55`,
                    background: btn === "Case Library" ? `${colors.oasis}18` : "transparent",
                    padding: "5px 14px", borderRadius: 6,
                    border: `1px solid ${btn === "Case Library" ? `${colors.oasis}35` : "transparent"}`,
                  }}>{btn}</div>
                ))}
              </div>
            </div>

            {/* Body — left nav + main placeholder */}
            <div style={{ display: "flex", gap: 12, height: 380 }}>
              {/* Left nav */}
              <div style={{ ...glass, width: 220, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.white}35`, textTransform: "uppercase" as const, marginBottom: 8 }}>
                  Case Library
                </div>
                {["Pulmonology", "Cardiology", "Endocrinology", "Nephrology", "Neurology"].map((cat, i) => (
                  <div key={cat} style={{
                    fontFamily: fonts.body, fontSize: 15, fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? colors.oasis : `${colors.white}50`,
                    padding: "6px 10px", borderRadius: 6,
                    background: i === 0 ? `${colors.oasis}14` : "transparent",
                    opacity: interpolate(frame, [P2S + 20 + i * 8, P2S + 35 + i * 8], [0, 1], clamp),
                  }}>{cat}</div>
                ))}
              </div>

              {/* Main content area */}
              <div style={{ ...glass, flex: 1, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: `${colors.white}35`,
                  opacity: interpolate(frame, [P2S + 28, P2S + 46], [0, 1], clamp),
                }}>
                  Browse the case library
                </div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 16, color: `${colors.white}25`,
                  opacity: interpolate(frame, [P2S + 40, P2S + 58], [0, 1], clamp),
                }}>
                  Select a category to find clinical cases and templates
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 3 — Browse Library + Template Select  (f340–462)
          Left: case library with Pneumonia highlighted
          Right: template preview card
         ══════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={phWrap(p3Op)}>
          <div style={{ transform: `scale(${p3Zoom})`, width: "100%", maxWidth: 960, display: "flex", gap: 16, height: 500 }}>

            {/* Left: Case Library */}
            <div style={{ ...glass, width: 340, flexShrink: 0, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.white}35`, textTransform: "uppercase" as const, marginBottom: 10 }}>
                Case Library
              </div>
              {(() => {
                let globalIdx = 0;
                return libraryCategories.map((cat, ci) => (
                  <div key={cat.name}>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 12, fontWeight: 700,
                      color: `${colors.white}45`, letterSpacing: 1.5, textTransform: "uppercase" as const,
                      padding: "8px 0 4px",
                      opacity: interpolate(frame, [P3S + 14 + ci * 20, P3S + 26 + ci * 20], [0, 1], clamp),
                    }}>{cat.name}</div>
                    {cat.items.map(item => {
                      const itemOp = libItemOps[globalIdx++];
                      return (
                        <div key={item.label} style={{
                          fontFamily: fonts.body, fontSize: 15, fontWeight: item.selected ? 700 : 400,
                          color: item.selected ? colors.oasis : `${colors.white}60`,
                          padding: "7px 12px", borderRadius: 6, marginBottom: 2,
                          background: item.selected ? `${colors.oasis}16` : "transparent",
                          border: item.selected ? `1px solid ${colors.oasis}30` : "1px solid transparent",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          opacity: itemOp,
                        }}>
                          {item.label}
                          {item.selected && (
                            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.oasis, marginLeft: 8 }}>
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>

            {/* Right: Template Preview */}
            <div style={{
              ...glass,
              flex: 1, padding: "22px 28px",
              opacity: templateOp,
              transform: `scale(${templateZoom})`,
              transformOrigin: "50% 50%",
              border: `1px solid ${colors.oasis}35`,
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              {/* Template header */}
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.oasis}70`, textTransform: "uppercase" as const, marginBottom: 6 }}>
                  Template
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: colors.white }}>
                  Pneumonia — Adult
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}50`, marginTop: 4 }}>
                  Community-Acquired Pneumonia · Intermediate difficulty
                </div>
              </div>

              <div style={{ height: 1, background: `${colors.white}10` }} />

              {/* Template sections checklist */}
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}40`, letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" as const }}>
                  Sections included
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                  {templateSections.map((sec, i) => (
                    <div key={sec} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      opacity: templateSectOps[i],
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: `${colors.vitalsNormal}25`,
                        border: `1.5px solid ${colors.vitalsNormal}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.vitalsNormal }} />
                      </div>
                      <span style={{ fontFamily: fonts.body, fontSize: 15, color: `${colors.white}80` }}>
                        {sec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <div style={{ marginTop: "auto", opacity: generateBtnOp }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PulsingDot color={colors.oasis} size={9} delay={P3S + 110} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis }}>
                    Initiating AI generation…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 4 — AI Generation  (f460–700)
          4 sequential focused panels — one section at a time.
          Each panel fills with typewriter effect before cross-fading
          to the next.
         ══════════════════════════════════════════════════════════ */}
      {frame >= P4S && frame < P4E + 10 && aiSections.map((sec, si) => {
        const op = secOps[si];
        if (op < 0.02) return null;

        const isActive = si === activeSec;
        const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
        const lastFieldDone = fillStart + (sec.fields.length - 1) * FIELD_GAP + FIELD_TIME;
        const cardGenerating = frame >= fillStart && frame < lastFieldDone;

        return (
          <div key={si} style={{ ...phWrap(op), zIndex: 12 + si }}>
            <div style={{ width: "100%", maxWidth: 860 }}>

              {/* Section breadcrumb / progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, justifyContent: "center" }}>
                {aiSections.map((_, di) => (
                  <React.Fragment key={di}>
                    <div style={{
                      width: di <= si ? (di < si ? 28 : 10) : 10,
                      height: 10,
                      borderRadius: 5,
                      background: secDone[di]
                        ? colors.vitalsNormal
                        : di === si
                          ? aiSections[si].color
                          : `${colors.white}18`,
                      transition: "width 0.2s",
                    }} />
                  </React.Fragment>
                ))}
              </div>

              {/* Section panel */}
              <div style={{
                background: "rgba(10, 28, 64, 0.88)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderRadius: 16,
                border: `1.5px solid ${sec.color}45`,
                padding: "30px 36px",
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 48px ${sec.color}12`,
              }}>

                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 18, borderBottom: `1px solid ${sec.color}22` }}>
                  <div style={{ width: 6, height: 30, background: sec.color, borderRadius: 3, flexShrink: 0 }} />
                  <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 800, color: colors.white }}>
                    {sec.title}
                  </div>
                  {cardGenerating && (
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <PulsingDot color={sec.color} size={9} delay={SEC_WINDOWS[si][0]} />
                      <span style={{ fontFamily: fonts.mono, fontSize: 13, color: sec.color }}>
                        AI Generating
                      </span>
                    </div>
                  )}
                  {!cardGenerating && secDone[si] && (
                    <div style={{ marginLeft: "auto", fontFamily: fonts.mono, fontSize: 13, color: colors.vitalsNormal }}>
                      ✓ Complete
                    </div>
                  )}
                </div>

                {/* Fields — 2 column for Vitals, single column otherwise */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: sec.fields.length === 4 ? "1fr 1fr" : "1fr",
                  gap: sec.fields.length === 4 ? "22px 40px" : "24px",
                }}>
                  {sec.fields.map((field, fi) => {
                    const revealed = secFieldOps[si][fi];
                    const done     = isDone(si, fi);
                    const typing   = isTyping(si, fi);
                    const has      = revealed > 0;

                    return (
                      <div key={fi} style={{
                        opacity: interpolate(frame,
                          [SEC_WINDOWS[si][0] + FILL_DELAY + fi * FIELD_GAP - 4,
                           SEC_WINDOWS[si][0] + FILL_DELAY + fi * FIELD_GAP + 4],
                          [0, 1], clamp
                        ),
                      }}>
                        {/* Label */}
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 12, fontWeight: 600,
                          color: `${colors.white}40`, letterSpacing: 1.8,
                          textTransform: "uppercase" as const, marginBottom: 7,
                        }}>{field.label}</div>

                        {/* Value */}
                        <div style={{
                          fontFamily: fonts.heading, fontSize: 30, fontWeight: 700,
                          color: done ? colors.white : typing ? `${colors.white}90` : `${colors.white}15`,
                          lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8, minHeight: 40,
                        }}>
                          {has ? (
                            <>
                              {field.value.slice(0, revealed)}
                              {typing && <span style={{ color: sec.color, opacity: 0.9, fontWeight: 300 }}>▌</span>}
                              {done && field.flag && (
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 16, fontWeight: 800,
                                  color: field.flag === "H" ? colors.vitalsWarning : colors.vitalsCritical,
                                  background: field.flag === "H" ? `${colors.vitalsWarning}20` : `${colors.vitalsCritical}20`,
                                  padding: "2px 8px", borderRadius: 4, fontSize: 13,
                                }}>{field.flag}</span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: `${colors.white}12`, fontSize: 22 }}>—————</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subtle label below */}
              <div style={{
                textAlign: "center" as const, marginTop: 18,
                fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2,
                color: `${colors.white}28`, textTransform: "uppercase" as const,
              }}>
                {si + 1} of {aiSections.length} — {sec.title}
              </div>
            </div>
          </div>
        );
      })}

      {/* ══════════════════════════════════════════════════════════
          PHASE 5 — Case Complete / Finalized  (f692–795)
         ══════════════════════════════════════════════════════════ */}
      {p5Op > 0 && (
        <div style={phWrap(p5Op)}>
          <div style={{ transform: `scale(${p5Zoom})`, width: "100%", maxWidth: 960, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Finalized header */}
            <div style={{ ...glass, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
              border: `1px solid ${colors.vitalsNormal}35`,
              boxShadow: `0 0 32px ${colors.vitalsNormal}14`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white }}>
                  Pneumonia — Adult
                </span>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                  color: colors.vitalsNormal, background: `${colors.vitalsNormal}18`,
                  padding: "3px 12px", borderRadius: 5, border: `1px solid ${colors.vitalsNormal}40`,
                }}>
                  ✓ Finalized
                </span>
              </div>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, color: `${colors.oasis}90`,
                background: `${colors.oasis}18`, padding: "5px 18px", borderRadius: 7,
                border: `1px solid ${colors.oasis}30`,
              }}>
                Ready for Virtual Patient
              </span>
            </div>

            {/* 2×2 completed case cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, flex: 1, height: 400 }}>
              {aiSections.map((card, ci) => {
                const cardOp = interpolate(frame, [P5S + 14 + ci * 10, P5S + 28 + ci * 10], [0, 1], clamp);
                return (
                  <div key={ci} style={{
                    background: "rgba(12, 35, 75, 0.80)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: `1px solid ${card.color}28`,
                    borderRadius: 12, padding: "18px 22px",
                    opacity: cardOp,
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${card.color}22` }}>
                      <div style={{ width: 4, height: 22, background: card.color, borderRadius: 2 }} />
                      <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white }}>{card.title}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.vitalsNormal, marginLeft: "auto" }}>✓</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      {card.fields.map((field, fi) => (
                        <div key={fi}>
                          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}35`, letterSpacing: 1.5, marginBottom: 3, textTransform: "uppercase" as const }}>
                            {field.label}
                          </div>
                          <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.white, display: "flex", alignItems: "center", gap: 6 }}>
                            {field.value}
                            {field.flag && (
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 11, fontWeight: 700,
                                color: field.flag === "H" ? colors.vitalsWarning : colors.vitalsCritical,
                                background: field.flag === "H" ? `${colors.vitalsWarning}18` : `${colors.vitalsCritical}18`,
                                padding: "1px 7px", borderRadius: 3,
                              }}>{field.flag}</span>
                            )}
                          </div>
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

      {/* Bottom narration label */}
      {frame >= P5S && frame < P5E && (
        <div style={{
          position: "absolute", left: "50%", bottom: 32, transform: "translateX(-50%)",
          opacity: interpolate(frame, [P5S, P5S + 22, P5E - 18, P5E], [0, 1, 1, 0], clamp),
          pointerEvents: "none", zIndex: 20, textAlign: "center" as const,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.vitalsNormal}70`, letterSpacing: 2.5, textTransform: "uppercase" as const }}>
            Case Finalized — Ready for Virtual Patient
          </div>
        </div>
      )}

    </SceneShell>
  );
};
