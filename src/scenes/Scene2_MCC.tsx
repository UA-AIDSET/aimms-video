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
   PAPER DOCUMENT COMPONENT
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

const libraryCategories = [
  { name: "Pulmonology",   items: [{ label: "Pneumonia", selected: true }, { label: "COPD Exacerbation", selected: false }, { label: "Pulmonary Embolism", selected: false }] },
  { name: "Cardiology",    items: [{ label: "Heart Failure", selected: false }, { label: "STEMI", selected: false }, { label: "Atrial Fibrillation", selected: false }] },
  { name: "Endocrinology", items: [{ label: "Diabetic Ketoacidosis", selected: false }, { label: "Hypoglycemia", selected: false }] },
];
const templateSections = ["Patient Information", "Vital Signs", "Chief Complaint", "Physical Examination", "Lab Results", "Assessment & Plan"];

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
   BEAT-BASED PHASE BOUNDARIES  (30fps · audio starts f10 · ends ~f778)

   Each beat follows: ENTER (12–18f) → HOLD (30–70f) → TRANSITION (12–16f)

   P1   f 65–192   Papers — manual documentation burden
                   Papers spring in staggered (f68–116), hold f116–184
   SCAN f184–228   Transformation sweep
   P2   f226–340   BEAT A — Interface overview (hold ~70f)
   P3   f334–480   BEAT B — Library browse only (hold ~28f after categories)
   P4   f472–578   BEAT C — Template selection, standalone focused beat
   P5   f570–775   BEAT D — AI generation, 4 sections at deliberate pace
   P6   f765–810   BEAT E — Finalized / case ready
   ────────────────────────────────────────────────────────────────────── */
const P1S = 65,  P1E = 192;
const P2S = 226, P2E = 340;
const P3S = 334, P3E = 480;
const P4S = 472, P4E = 578;
const P5S = 570, P5E = 775;
const P6S = 765, P6E = 810;

// ── AI generation: slower field pacing for readability ──
// FILL_DELAY: pause after section appears before AI starts filling (0.4s)
// FIELD_GAP:  frames between field starts — must allow reading each value
// FIELD_TIME: frames to type each field value
const FILL_DELAY = 12;  // 0.40s pause before first field
const FIELD_GAP  = 12;  // 0.40s between field starts (was 14 — was too fast)
const FIELD_TIME = 12;  // 0.40s typing duration per field

// Section windows with deliberate gaps between sections (~8f crossfade)
// Each section has enough frames to complete all field typing before fading:
//   3-field section needs: FILL_DELAY + 2×FIELD_GAP + FIELD_TIME = 12+24+12 = 48f
//   4-field section needs: FILL_DELAY + 3×FIELD_GAP + FIELD_TIME = 12+36+12 = 60f
const SEC_WINDOWS = [
  [574, 630],  // Patient Info  (56f > 48f needed) ✓
  [622, 690],  // Vital Signs   (68f > 60f needed) ✓
  [682, 736],  // Exam Findings (54f > 48f needed) ✓
  [728, 775],  // Diagnostics   (47f ≈ 48f needed) ✓
] as const;

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

  /* ── Paper springs — more spread stagger for readability ── */
  // Each paper arrives 12 frames apart so the viewer watches them build up
  const PAPER_DELAYS = [68, 80, 92, 104, 116] as const;
  const paperSprings = PAPER_DELAYS.map(d =>
    spring({ frame: frame - d, fps, config: { damping: 22, stiffness: 88, mass: 1.0 } })
  );
  // Papers exit cleanly after hold period (f184–240)
  const papersExitOp    = interpolate(frame, [184, 240], [1, 0], easeIn);
  const papersExitScale = interpolate(frame, [184, 240], [1, 0.90], easeIn);
  const papersExitY     = interpolate(frame, [184, 240], [0, 20], easeIn);

  /* ── Scan transformation line ── */
  const scanProgress = interpolate(frame, [182, 226], [0, 1], clamp);
  const scanOpacity  = interpolate(frame, [180, 186, 221, 228], [0, 1, 1, 0], clamp);

  /* ── Phase opacity helpers ── */
  // Standard phase: 18-frame enter, 16-frame exit — leaves long hold in the middle
  const phOp   = (s: number, e: number) => interpolate(frame, [s, s + 18, e - 16, e], [0, 1, 1, 0], clamp);
  const phZoom = (s: number)            => interpolate(frame, [s, s + 28], [0.95, 1.0], easeIO);

  // ── P2 OVERVIEW ──
  const p2Op   = phOp(P2S, P2E);
  const p2Zoom = phZoom(P2S);

  // ── P3 LIBRARY ──
  const p3Op   = phOp(P3S, P3E);
  const p3Zoom = phZoom(P3S);

  // Library items stagger — SLOWER: 26-frame gap between categories, 16-frame gap between items
  // This gives the viewer time to read each category before the next appears.
  const libItemOps = libraryCategories.flatMap((cat, ci) =>
    cat.items.map((_, ii) => {
      const start = P3S + 20 + ci * 26 + ii * 16;
      return interpolate(frame, [start, start + 16], [0, 1], clamp);
    })
  );

  // ── P4 TEMPLATE — standalone beat ──
  const p4Op   = phOp(P4S, P4E);
  const p4Zoom = phZoom(P4S);

  // Template sections reveal one-by-one with deliberate spacing (12-frame stagger, 12-frame fade)
  // Viewer can read each section name before the next appears
  const templateSectOps = templateSections.map((_, i) => {
    const start = P4S + 14 + i * 12;
    return interpolate(frame, [start, start + 12], [0, 1], clamp);
  });
  // "Initiating AI generation..." — holds for ~12 frames before scene transitions
  const generateBtnOp = interpolate(frame, [P4S + 76, P4S + 90], [0, 1], clamp);

  // ── P5 AI GENERATION ──
  const secOps = SEC_WINDOWS.map(([s, e]) =>
    interpolate(frame, [s, s + 16, e - 14, e], [0, 1, 1, 0], clamp)
  );

  // Field reveal ops — how many characters of each field's value are shown
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

  const activeSec = SEC_WINDOWS.findIndex(([s, e]) => frame >= s && frame < e);

  const secDone = aiSections.map((sec, si) => {
    const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
    const lastField = sec.fields.length - 1;
    return frame >= fillStart + lastField * FIELD_GAP + FIELD_TIME;
  });

  // ── P6 FINALIZED ──
  const p6Op   = interpolate(frame, [P6S, P6S + 20, P6E], [0, 1, 1], clamp);
  const p6Zoom = phZoom(P6S);

  /* ── Neural network (AI thinking, only during P5) ── */
  const networkOp = interpolate(frame, [P5S, P5S + 30, P5E - 20, P5E], [0, 0.28, 0.28, 0], clamp);

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

      {/* ════════════════════════════════════════════════════════════════
          PHASE 1 — PAPERS  (f65–240)
          Five clinical documents spring in with a 12-frame stagger,
          so the viewer watches the paperwork accumulate one sheet at a time.
          All papers are held visible for ~70 frames before the
          transformation begins — enough time to read "this is a lot."
         ════════════════════════════════════════════════════════════════ */}
      {frame >= P1S && frame < 245 && paperLayout.map((p, pi) => {
        const sp = paperSprings[p.si];
        const spOp    = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
        const spScale = interpolate(sp, [0, 1], [0.88, 1], { extrapolateRight: "clamp" as const });
        const spY     = interpolate(sp, [0, 1], [24, 0], { extrapolateRight: "clamp" as const });
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

      {/* HOLD label — appears after papers settle, held through end of P1 */}
      {frame >= 100 && frame < 210 && (
        <div style={{
          position: "absolute", left: "50%", bottom: 36, transform: "translateX(-50%)",
          opacity: interpolate(frame, [100, 122, 186, 210], [0, 1, 1, 0], clamp),
          pointerEvents: "none", zIndex: 5, textAlign: "center" as const,
        }}>
          <div style={{
            fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}65`,
            letterSpacing: 2.5, textTransform: "uppercase" as const,
          }}>
            Traditional Manual Documentation
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SCAN LINE — transformation sweep  (f182–228)
         ════════════════════════════════════════════════════════════════ */}
      {scanOpacity > 0 && (
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: scanProgress * 1080, height: 4,
          background: `linear-gradient(90deg, transparent 0%, ${colors.oasis}40 8%, ${colors.oasis} 50%, ${colors.oasis}40 92%, transparent 100%)`,
          boxShadow: `0 0 12px 2px ${colors.oasis}AA, 0 0 32px 6px ${colors.oasis}55, 0 0 60px 12px ${colors.oasis}22`,
          opacity: scanOpacity, zIndex: 30, pointerEvents: "none",
        }} />
      )}

      {/* ════════════════════════════════════════════════════════════════
          BEAT A — INTERFACE OVERVIEW  (f226–340)
          Full interface establishing shot. Nav items reveal with an
          8-frame stagger. HOLD: ~70 frames after last item appears,
          giving the viewer time to recognize the layout before
          moving to the library.
         ════════════════════════════════════════════════════════════════ */}
      {p2Op > 0 && (
        <div style={phWrap(p2Op)}>
          <div style={{ transform: `scale(${p2Zoom})`, width: "100%", maxWidth: 960, display: "flex", flexDirection: "column", gap: 12 }}>
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

            <div style={{ display: "flex", gap: 12, height: 380 }}>
              <div style={{ ...glass, width: 220, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.white}35`, textTransform: "uppercase" as const, marginBottom: 8 }}>
                  Case Library
                </div>
                {/* Nav categories stagger at 10-frame intervals — readable pace */}
                {["Pulmonology", "Cardiology", "Endocrinology", "Nephrology", "Neurology"].map((cat, i) => (
                  <div key={cat} style={{
                    fontFamily: fonts.body, fontSize: 15, fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? colors.oasis : `${colors.white}50`,
                    padding: "6px 10px", borderRadius: 6,
                    background: i === 0 ? `${colors.oasis}14` : "transparent",
                    opacity: interpolate(frame, [P2S + 26 + i * 10, P2S + 40 + i * 10], [0, 1], clamp),
                  }}>{cat}</div>
                ))}
              </div>

              <div style={{ ...glass, flex: 1, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: `${colors.white}40`,
                  opacity: interpolate(frame, [P2S + 34, P2S + 50], [0, 1], clamp),
                }}>
                  Browse the case library
                </div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 16, color: `${colors.white}28`,
                  opacity: interpolate(frame, [P2S + 48, P2S + 64], [0, 1], clamp),
                }}>
                  Select a category to find clinical cases and templates
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BEAT B — LIBRARY BROWSE  (f334–480)
          Library panel only — no template yet. Categories reveal with
          a deliberate 26-frame category gap and 16-frame item gap.
          After all items are visible there is a ~28-frame HOLD
          so the viewer can see "Pneumonia" is selected.
         ════════════════════════════════════════════════════════════════ */}
      {p3Op > 0 && (
        <div style={phWrap(p3Op)}>
          <div style={{ transform: `scale(${p3Zoom})`, width: "100%", maxWidth: 960, display: "flex", gap: 16, height: 500 }}>

            {/* Case Library — full width in this beat */}
            <div style={{ ...glass, width: 380, flexShrink: 0, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.white}40`, textTransform: "uppercase" as const, marginBottom: 12 }}>
                Case Library
              </div>
              {(() => {
                let globalIdx = 0;
                return libraryCategories.map((cat, ci) => (
                  <div key={cat.name}>
                    {/* Category header fades in before its items */}
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                      color: `${colors.white}50`, letterSpacing: 1.5, textTransform: "uppercase" as const,
                      padding: "10px 0 5px",
                      opacity: interpolate(frame, [P3S + 16 + ci * 26, P3S + 30 + ci * 26], [0, 1], clamp),
                    }}>{cat.name}</div>
                    {cat.items.map(item => {
                      const itemOp = libItemOps[globalIdx++];
                      return (
                        <div key={item.label} style={{
                          fontFamily: fonts.body, fontSize: 16, fontWeight: item.selected ? 700 : 400,
                          color: item.selected ? colors.oasis : `${colors.white}65`,
                          padding: "8px 14px", borderRadius: 7, marginBottom: 3,
                          background: item.selected ? `${colors.oasis}16` : "transparent",
                          border: item.selected ? `1px solid ${colors.oasis}35` : "1px solid transparent",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          opacity: itemOp,
                        }}>
                          {item.label}
                          {item.selected && (
                            <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.oasis }}>
                              Selected ›
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>

            {/* Right side — empty / dark placeholder while library is the focus */}
            <div style={{
              ...glass,
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0.35,
            }}>
              <div style={{ fontFamily: fonts.body, fontSize: 16, color: `${colors.white}25`, textAlign: "center" as const }}>
                Select a case to preview template
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BEAT C — TEMPLATE SELECTION  (f472–578)
          Template panel is now its own focused beat. The six template
          sections check in one-by-one (12-frame stagger), then the
          "Initiating AI generation…" prompt appears and holds briefly
          before transitioning to the AI generation phase.
         ════════════════════════════════════════════════════════════════ */}
      {p4Op > 0 && (
        <div style={phWrap(p4Op)}>
          <div style={{ transform: `scale(${p4Zoom})`, width: "100%", maxWidth: 960, display: "flex", gap: 16, height: 500 }}>

            {/* Library — dimmed background context */}
            <div style={{ ...glass, width: 280, flexShrink: 0, padding: "20px 16px", opacity: 0.4, overflow: "hidden" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.white}35`, textTransform: "uppercase" as const, marginBottom: 12 }}>Case Library</div>
              <div style={{ fontFamily: fonts.body, fontSize: 15, fontWeight: 700, color: colors.oasis, padding: "8px 12px", borderRadius: 6, background: `${colors.oasis}14`, border: `1px solid ${colors.oasis}30` }}>
                Pneumonia — Adult
              </div>
            </div>

            {/* Template — prominent, bordered, alive */}
            <div style={{
              ...glass,
              flex: 1, padding: "24px 32px",
              border: `1.5px solid ${colors.oasis}45`,
              boxShadow: `0 0 48px ${colors.oasis}12`,
              display: "flex", flexDirection: "column", gap: 18,
            }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: `${colors.oasis}75`, textTransform: "uppercase" as const, marginBottom: 6 }}>
                  Template Selected
                </div>
                <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: colors.white }}>
                  Pneumonia — Adult
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}55`, marginTop: 4 }}>
                  Community-Acquired Pneumonia · Intermediate difficulty
                </div>
              </div>

              <div style={{ height: 1, background: `${colors.white}10` }} />

              {/* Template sections — one appears every 12 frames */}
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}45`, letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" as const }}>
                  Sections Included
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                  {templateSections.map((sec, i) => (
                    <div key={sec} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      opacity: templateSectOps[i],
                      transform: `translateY(${interpolate(templateSectOps[i], [0, 1], [8, 0])}px)`,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: `${colors.vitalsNormal}25`,
                        border: `1.5px solid ${colors.vitalsNormal}60`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: colors.vitalsNormal }} />
                      </div>
                      <span style={{ fontFamily: fonts.body, fontSize: 15, color: `${colors.white}85` }}>
                        {sec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate trigger — appears and holds before AI gen starts */}
              <div style={{ marginTop: "auto", opacity: generateBtnOp }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PulsingDot color={colors.oasis} size={9} delay={P4S + 76} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis, letterSpacing: 1 }}>
                    Initiating AI generation…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          BEAT D — AI GENERATION  (f570–775)
          Four sequential focused panels. Each section:
            → appears with 16-frame fade-in
            → FILL_DELAY (12f) pause before AI begins typing
            → fields type in one at a time (FIELD_GAP=12, FIELD_TIME=12)
            → section held complete ~8 frames before cross-fading to next
          This pacing gives the viewer time to read each value as it
          appears, then follow to the next section.
         ════════════════════════════════════════════════════════════════ */}
      {frame >= P5S && frame < P5E + 10 && aiSections.map((sec, si) => {
        const op = secOps[si];
        if (op < 0.02) return null;

        const fillStart = SEC_WINDOWS[si][0] + FILL_DELAY;
        const lastFieldDone = fillStart + (sec.fields.length - 1) * FIELD_GAP + FIELD_TIME;
        const cardGenerating = frame >= fillStart && frame < lastFieldDone;

        return (
          <div key={si} style={{ ...phWrap(op), zIndex: 12 + si }}>
            <div style={{ width: "100%", maxWidth: 860 }}>

              {/* Section progress indicator — larger dots for legibility */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
                {aiSections.map((_, di) => (
                  <div key={di} style={{
                    width:  di === si ? 32 : 16,
                    height: 16,
                    borderRadius: 8,
                    background: secDone[di]
                      ? colors.vitalsNormal
                      : di === si
                        ? aiSections[si].color
                        : `${colors.white}20`,
                    transition: "width 0.25s",
                    boxShadow: di === si ? `0 0 10px ${aiSections[si].color}60` : "none",
                  }} />
                ))}
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginLeft: 8, letterSpacing: 1 }}>
                  {si + 1} / {aiSections.length}
                </div>
              </div>

              {/* Section panel */}
              <div style={{
                background: "rgba(10, 28, 64, 0.88)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderRadius: 16,
                border: `1.5px solid ${sec.color}45`,
                padding: "32px 40px",
                boxShadow: `0 8px 40px rgba(0,0,0,0.4), 0 0 48px ${sec.color}12`,
              }}>
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30, paddingBottom: 20, borderBottom: `1px solid ${sec.color}22` }}>
                  <div style={{ width: 6, height: 32, background: sec.color, borderRadius: 3, flexShrink: 0 }} />
                  <div style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 800, color: colors.white }}>
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
                    <div style={{ marginLeft: "auto", fontFamily: fonts.mono, fontSize: 14, color: colors.vitalsNormal, letterSpacing: 1 }}>
                      ✓ Complete
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: sec.fields.length === 4 ? "1fr 1fr" : "1fr",
                  gap: sec.fields.length === 4 ? "26px 48px" : "28px",
                }}>
                  {sec.fields.map((field, fi) => {
                    const revealed = secFieldOps[si][fi];
                    const done     = isDone(si, fi);
                    const typing   = isTyping(si, fi);
                    const has      = revealed > 0;

                    // Each field fades in 4 frames before it starts typing
                    const fieldFadeOp = interpolate(frame,
                      [SEC_WINDOWS[si][0] + FILL_DELAY + fi * FIELD_GAP - 4,
                       SEC_WINDOWS[si][0] + FILL_DELAY + fi * FIELD_GAP + 4],
                      [0, 1], clamp
                    );

                    return (
                      <div key={fi} style={{ opacity: fieldFadeOp }}>
                        <div style={{
                          fontFamily: fonts.mono, fontSize: 12, fontWeight: 600,
                          color: `${colors.white}45`, letterSpacing: 1.8,
                          textTransform: "uppercase" as const, marginBottom: 8,
                        }}>{field.label}</div>

                        <div style={{
                          fontFamily: fonts.heading, fontSize: 32, fontWeight: 700,
                          color: done ? colors.white : typing ? `${colors.white}90` : `${colors.white}18`,
                          lineHeight: 1.2, display: "flex", alignItems: "center", gap: 10, minHeight: 44,
                        }}>
                          {has ? (
                            <>
                              {field.value.slice(0, revealed)}
                              {typing && <span style={{ color: sec.color, opacity: 0.85, fontWeight: 300 }}>▌</span>}
                              {done && field.flag && (
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 800,
                                  color: field.flag === "H" ? colors.vitalsWarning : colors.vitalsCritical,
                                  background: field.flag === "H" ? `${colors.vitalsWarning}20` : `${colors.vitalsCritical}20`,
                                  padding: "2px 8px", borderRadius: 4,
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

              {/* Section name below — readable opacity */}
              <div style={{
                textAlign: "center" as const, marginTop: 16,
                fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2,
                color: `${colors.white}45`, textTransform: "uppercase" as const,
              }}>
                {sec.title} — {si + 1} of {aiSections.length}
              </div>
            </div>
          </div>
        );
      })}

      {/* ════════════════════════════════════════════════════════════════
          BEAT E — CASE FINALIZED  (f765–810)
          Four completed section cards appear in a 2×2 grid with an
          8-frame stagger. The header shows "✓ Finalized" and
          "Ready for Virtual Patient" — a clear completion signal.
          This beat holds to the end of the scene.
         ════════════════════════════════════════════════════════════════ */}
      {p6Op > 0 && (
        <div style={phWrap(p6Op)}>
          <div style={{ transform: `scale(${p6Zoom})`, width: "100%", maxWidth: 960, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Finalized header */}
            <div style={{
              ...glass, padding: "16px 26px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              border: `1px solid ${colors.vitalsNormal}40`,
              boxShadow: `0 0 32px ${colors.vitalsNormal}18`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white }}>
                  Pneumonia — Adult
                </span>
                <span style={{
                  fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
                  color: colors.vitalsNormal, background: `${colors.vitalsNormal}18`,
                  padding: "4px 14px", borderRadius: 5, border: `1px solid ${colors.vitalsNormal}45`,
                  letterSpacing: 1,
                }}>
                  ✓ Finalized
                </span>
              </div>
              <span style={{
                fontFamily: fonts.mono, fontSize: 14, color: `${colors.oasis}95`,
                background: `${colors.oasis}18`, padding: "6px 20px", borderRadius: 7,
                border: `1px solid ${colors.oasis}35`, letterSpacing: 0.5,
              }}>
                Ready for Virtual Patient
              </span>
            </div>

            {/* 2×2 completed case cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, flex: 1, height: 400 }}>
              {aiSections.map((card, ci) => {
                const cardOp = interpolate(frame, [P6S + 14 + ci * 8, P6S + 26 + ci * 8], [0, 1], clamp);
                return (
                  <div key={ci} style={{
                    background: "rgba(12, 35, 75, 0.80)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: `1px solid ${card.color}30`,
                    borderRadius: 12, padding: "18px 22px",
                    opacity: cardOp,
                    transform: `translateY(${interpolate(cardOp, [0, 1], [10, 0])}px)`,
                    display: "flex", flexDirection: "column",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${card.color}22` }}>
                      <div style={{ width: 4, height: 22, background: card.color, borderRadius: 2 }} />
                      <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white }}>{card.title}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.vitalsNormal, marginLeft: "auto" }}>✓</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      {card.fields.map((field, fi) => (
                        <div key={fi}>
                          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}38`, letterSpacing: 1.5, marginBottom: 3, textTransform: "uppercase" as const }}>
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

      {/* Bottom completion label — appears with finalized beat */}
      {frame >= P6S && frame < P6E && (
        <div style={{
          position: "absolute", left: "50%", bottom: 32, transform: "translateX(-50%)",
          opacity: interpolate(frame, [P6S, P6S + 20, P6E - 14, P6E], [0, 1, 1, 0], clamp),
          pointerEvents: "none", zIndex: 20, textAlign: "center" as const,
        }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.vitalsNormal}75`, letterSpacing: 2.5, textTransform: "uppercase" as const }}>
            Case Finalized — Ready for Virtual Patient
          </div>
        </div>
      )}

    </SceneShell>
  );
};
