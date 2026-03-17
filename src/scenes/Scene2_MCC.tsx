import React, { useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { NodeNetwork } from "../three/NodeNetwork";
import { CameraRig } from "../three/CameraRig";
import { GlassPanel } from "../components/GlassPanel";
import { PulsingDot } from "../components/PulsingDot";
import { colors, fonts } from "../theme";

/* ── Neural network for AI visualization ── */
function buildNetworkNodes(): Array<{ x: number; y: number; z: number }> {
  const nodes: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < 8; i++) nodes.push({ x: -2, y: -1.75 + i * 0.5, z: -1 });
  for (let i = 0; i < 14; i++) nodes.push({ x: 0, y: -1.75 + i * (3.5 / 13), z: -1 });
  for (let i = 0; i < 8; i++) nodes.push({ x: 2, y: -1.75 + i * 0.5, z: -1 });
  return nodes;
}
function buildNetworkEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  const ie = 8; const he = 22;
  for (let i = 0; i < ie; i++) for (let j = ie; j < he; j += 2) edges.push([i, j]);
  for (let i = ie; i < he; i++) for (let j = he; j < n; j += 2) edges.push([i, j]);
  return edges;
}

/* ── Paper styling constants ── */
const PAPER_BG  = "rgba(252, 249, 240, 0.97)";
const INK_DARK  = "#1a2035";
const INK_BAR   = "rgba(26, 32, 53, 0.13)";
const INK_MED   = "#7080a0";

/* ── Paper document visual component (no animation transforms — handled by wrapper) ── */
interface PaperSection { heading: string; lines: number }
interface PaperDocProps {
  title: string;
  subtitle: string;
  accent: string;
  sections: PaperSection[];
  badge?: string;
}
const PaperDoc: React.FC<PaperDocProps> = ({ title, subtitle, accent, sections, badge }) => (
  <div style={{
    background: PAPER_BG,
    borderRadius: 3,
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.42), 0 2px 8px rgba(0,0,0,0.2)",
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column",
  }}>
    {/* Colour accent bar */}
    <div style={{ height: 10, background: accent, flexShrink: 0 }} />

    {/* Header */}
    <div style={{
      padding: "16px 22px 12px",
      borderBottom: `1px solid rgba(26,32,53,0.10)`,
      flexShrink: 0,
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 800, color: INK_DARK, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 12, color: INK_MED, marginTop: 5 }}>
          {subtitle}
        </div>
      </div>
      {badge && (
        <div style={{
          fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: "#c0392b",
          background: "rgba(192,57,43,0.10)", border: "1px solid rgba(192,57,43,0.25)",
          padding: "4px 10px", borderRadius: 4, marginTop: 4, flexShrink: 0,
        }}>
          {badge}
        </div>
      )}
    </div>

    {/* Sections with bar placeholders */}
    <div style={{ padding: "14px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
      {sections.map((sec, si) => (
        <div key={si}>
          <div style={{
            fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: "#8090b8",
            letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 8,
          }}>
            {sec.heading}
          </div>
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

/* ── Digital section card data ── */
interface CardField { label: string; value: string; wide: boolean; flag: string | null }
interface SectionCard { title: string; color: string; grid: string; fields: CardField[] }

const SECTION_CARDS: SectionCard[] = [
  {
    title: "PATIENT INFO",
    color: colors.oasis,
    grid: "1fr",
    fields: [
      { label: "PATIENT",         value: "Michael Chen",              wide: true,  flag: null },
      { label: "AGE / SEX",       value: "58 — Male",                 wide: false, flag: null },
      { label: "CHIEF COMPLAINT", value: "Fever & cough × 3 days",   wide: true,  flag: null },
    ],
  },
  {
    title: "VITAL SIGNS",
    color: "#F59E0B",
    grid: "1fr 1fr",
    fields: [
      { label: "TEMPERATURE",    value: "38.9 °C",        wide: false, flag: "H" },
      { label: "HEART RATE",     value: "96 bpm",          wide: false, flag: null },
      { label: "BLOOD PRESSURE", value: "138/88 mmHg",    wide: false, flag: "H" },
      { label: "O₂ SATURATION",  value: "95%",             wide: false, flag: null },
    ],
  },
  {
    title: "EXAM FINDINGS",
    color: colors.azurite,
    grid: "1fr",
    fields: [
      { label: "RESPIRATORY",    value: "Bilateral crackles",         wide: true, flag: null },
      { label: "BREATH SOUNDS",  value: "Decreased at bases",         wide: true, flag: null },
      { label: "PERCUSSION",     value: "Dull — right lower lobe",   wide: true, flag: null },
    ],
  },
  {
    title: "DIAGNOSTICS",
    color: "#06b6d4",
    grid: "1fr",
    fields: [
      { label: "CHEST X-RAY",  value: "RLL Consolidation",             wide: true,  flag: "!" },
      { label: "WBC COUNT",    value: "14,200 /μL",                    wide: false, flag: "H" },
      { label: "ASSESSMENT",   value: "Community-Acquired Pneumonia",  wide: true,  flag: null },
    ],
  },
];

/* Card content reveal timing constants */
const CARD_STARTS    = [270, 312, 354, 396] as const; // spring enter frame for each card
const CONTENT_STARTS = [290, 332, 374, 416] as const; // AI fill start frame for each card
const FIELD_STAGGER  = 15;                             // frames between each field reveal
const FIELD_REVEAL   = 20;                             // frames to type-reveal one field

/**
 * Scene 2: Medical Case Creator — 810 frames (27s)
 *
 * Phase 1  f65–220   Five large paper documents fill the screen
 * Scan     f178–226  Glowing sweep signals transformation
 * Exit     f190–265  Papers converge-dissolve
 * Phase 2  f234–526  AIMMS Case Creator: 2×2 card grid, AI fills fields
 * Phase 4  f490–805  Case complete + published
 */
export const Scene2_MCC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const easeIO = { easing: Easing.bezier(0.4, 0, 0.2, 1), ...clamp };
  const easeIn = { easing: Easing.in(Easing.ease), ...clamp };

  const networkNodes = useMemo(() => buildNetworkNodes(), []);
  const networkEdges = useMemo(() => buildNetworkEdges(networkNodes.length), [networkNodes.length]);

  /* ── Paper springs (5 papers, staggered entrance) ── */
  const PAPER_DELAYS = [68, 74, 82, 94, 106] as const;
  const paperSprings = PAPER_DELAYS.map(d =>
    spring({ frame: frame - d, fps, config: { damping: 22, stiffness: 88, mass: 1.0 } })
  );

  /* Papers exit — fade + slight scale-down (converging inward) */
  const papersExitOp    = interpolate(frame, [190, 265], [1, 0], easeIn);
  const papersExitScale = interpolate(frame, [190, 265], [1, 0.90], easeIn);
  const papersExitY     = interpolate(frame, [190, 265], [0, 18], easeIn);

  /* ── Scan line sweep ── */
  const scanProgress = interpolate(frame, [180, 228], [0, 1], clamp);
  const scanOpacity  = interpolate(frame, [178, 184, 223, 230], [0, 1, 1, 0], clamp);

  /* ── Digital interface ── */
  const editorOpacity = interpolate(frame, [234, 260], [0, 1], easeIO);
  const editorExit    = interpolate(frame, [510, 526], [1, 0], easeIn);

  /* Card-level spring entrance */
  const cardSprings = CARD_STARTS.map(f0 =>
    spring({ frame: frame - f0, fps, config: { damping: 20, stiffness: 110, mass: 0.85 } })
  );

  /* Per-card, per-field: character reveal count */
  const getReveal = (ci: number, fi: number): number => {
    const start = CONTENT_STARTS[ci] + fi * FIELD_STAGGER;
    return Math.floor(
      interpolate(frame, [start, start + FIELD_REVEAL], [0, SECTION_CARDS[ci].fields[fi].value.length], clamp)
    );
  };
  const isDone = (ci: number, fi: number): boolean =>
    frame >= CONTENT_STARTS[ci] + fi * FIELD_STAGGER + FIELD_REVEAL;

  /* Global "all done" check */
  const allDone = SECTION_CARDS.every((card, ci) => card.fields.every((_, fi) => isDone(ci, fi)));

  /* AI activity indicators */
  const lastFieldStart = CONTENT_STARTS[3] + (SECTION_CARDS[3].fields.length - 1) * FIELD_STAGGER;
  const generatingOp = interpolate(frame, [288, 302, lastFieldStart + FIELD_REVEAL - 4, lastFieldStart + FIELD_REVEAL + 10], [0, 1, 1, 0], clamp);
  const allDoneOp    = allDone ? interpolate(frame, [lastFieldStart + FIELD_REVEAL, lastFieldStart + FIELD_REVEAL + 16], [0, 1], clamp) : 0;

  /* Subtle zoom-in on card grid as AI finishes */
  const gridScale = interpolate(frame, [440, 560], [1, 1.045], easeIO);

  /* ── Phase 4: Published ── */
  const publishFlip   = interpolate(frame, [480, 494], [0, 1], clamp);
  const phase4Opacity = interpolate(frame, [490, 506, 775, 805], [0, 1, 1, 0], clamp);
  const vpGlow = frame >= 506 ? 0.5 + 0.3 * Math.sin((frame - 506) * 0.12) : 0;

  /* Neural network visible during AI generation */
  const networkOp     = interpolate(frame, [270, 308, lastFieldStart + 30, lastFieldStart + 50], [0, 0.35, 0.35, 0], clamp);
  const networkEdgeOp = interpolate(frame, [270, 308, lastFieldStart + 30, lastFieldStart + 50], [0, 0.12, 0.12, 0], clamp);

  /* ── 3D Background ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.06} />
      <ParticleField count={50} color={colors.oasis} speed={0.002} opacity={0.18} />
      {networkOp > 0 && (
        <NodeNetwork
          nodes={networkNodes} edges={networkEdges}
          color={colors.oasis} nodeSize={0.04}
          edgeOpacity={networkEdgeOp} pulseSpeed={0.015}
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

  /* ── Paper layout: 5 large documents, positioned at corners + center ── */
  // Each entry: [left, top, width, height, rotation, spring index, z-index]
  const paperLayout = [
    // top-left
    { left: 60,   top: 88,  w: 520, h: 385, rot: -2.5, si: 0, z: 2,
      title: "PATIENT HISTORY",  subtitle: "12 pages · Last updated 09/14",  accent: colors.arizonaBlue,
      badge: "12 pg",
      sections: [
        { heading: "HISTORY OF PRESENT ILLNESS", lines: 5 },
        { heading: "PAST MEDICAL HISTORY",        lines: 4 },
        { heading: "MEDICATIONS",                 lines: 3 },
      ] },
    // top-right
    { left: 1340, top: 90,  w: 520, h: 385, rot:  3.0, si: 2, z: 2,
      title: "LAB RESULTS",      subtitle: "CBC / BMP · 8 pages",           accent: "#16a34a",
      badge: "8 pg",
      sections: [
        { heading: "COMPLETE BLOOD COUNT",        lines: 5 },
        { heading: "METABOLIC PANEL",             lines: 4 },
        { heading: "URINALYSIS",                  lines: 3 },
      ] },
    // bottom-left
    { left: 55,   top: 618, w: 500, h: 355, rot:  1.5, si: 3, z: 2,
      title: "MEDICATION LOG",   subtitle: "Active orders · 6 pages",        accent: colors.vitalsWarning,
      badge: "6 pg",
      sections: [
        { heading: "ACTIVE MEDICATIONS",          lines: 5 },
        { heading: "RECENT ORDERS",               lines: 4 },
      ] },
    // bottom-right
    { left: 1365, top: 622, w: 490, h: 350, rot: -2.0, si: 4, z: 2,
      title: "REFERRAL NOTES",   subtitle: "Consultation request · 4 pages", accent: "#06b6d4",
      badge: "4 pg",
      sections: [
        { heading: "REASON FOR REFERRAL",         lines: 4 },
        { heading: "CLINICAL SUMMARY",            lines: 4 },
      ] },
    // center (largest, on top of all others)
    { left: 528,  top: 242, w: 864, h: 536, rot: -0.5, si: 1, z: 4,
      title: "CLINICAL NOTES",   subtitle: "3 days of documentation · 17 pages", accent: colors.arizonaRed,
      badge: "17 pg",
      sections: [
        { heading: "HISTORY OF PRESENT ILLNESS",  lines: 5 },
        { heading: "PHYSICAL EXAMINATION",        lines: 4 },
        { heading: "ASSESSMENT & PLAN",           lines: 4 },
        { heading: "FOLLOW-UP ORDERS",            lines: 3 },
      ] },
  ];

  return (
    <SceneShell
      interstitial={{ step: 1, title: "Author", subtitle: "Medical Case Creator" }}
      sectionLabel="Case Authoring — MCC"
      threeContent={threeContent}
    >

      {/* ══════════════════════════════════════════════════════════
          PHASE 1: Five large paper documents (f65–265)
         ══════════════════════════════════════════════════════════ */}
      {frame >= 65 && frame < 268 && paperLayout.map((p, pi) => {
        const sp = paperSprings[p.si];
        const spOp    = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
        const spScale = interpolate(sp, [0, 1], [0.88, 1], { extrapolateRight: "clamp" as const });
        const spY     = interpolate(sp, [0, 1], [22, 0], { extrapolateRight: "clamp" as const });

        const finalOp    = spOp * papersExitOp;
        const finalScale = spScale * papersExitScale;
        const finalY     = spY + papersExitY;

        return (
          <div
            key={pi}
            style={{
              position: "absolute",
              left: p.left, top: p.top,
              width: p.w, height: p.h,
              zIndex: p.z,
              pointerEvents: "none",
              transform: `rotate(${p.rot}deg) scale(${finalScale}) translateY(${finalY}px)`,
              opacity: finalOp,
              transformOrigin: "center center",
            }}
          >
            <PaperDoc
              title={p.title}
              subtitle={p.subtitle}
              accent={p.accent}
              sections={p.sections}
              badge={p.badge}
            />
          </div>
        );
      })}

      {/* ── "Manual Documentation" caption ── */}
      {frame >= 94 && frame < 205 && (
        <div style={{
          position: "absolute",
          left: "50%", bottom: 36,
          transform: "translateX(-50%)",
          opacity: interpolate(frame, [94, 120, 182, 205], [0, 1, 1, 0], clamp),
          textAlign: "center" as const,
          pointerEvents: "none",
          zIndex: 5,
        }}>
          <div style={{
            fontFamily: fonts.body, fontSize: 15,
            color: `${colors.white}45`,
            letterSpacing: 2, textTransform: "uppercase" as const,
          }}>
            Traditional Manual Documentation
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SCAN LINE — transformation sweep (f178–230)
         ══════════════════════════════════════════════════════════ */}
      {scanOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0, right: 0,
            top: scanProgress * 1080,
            height: 4,
            background: `linear-gradient(90deg,
              transparent 0%,
              ${colors.oasis}40 8%,
              ${colors.oasis} 50%,
              ${colors.oasis}40 92%,
              transparent 100%
            )`,
            boxShadow: `
              0 0 12px 2px ${colors.oasis}AA,
              0 0 32px 6px ${colors.oasis}55,
              0 0 60px 12px ${colors.oasis}22
            `,
            opacity: scanOpacity,
            zIndex: 30,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 2+3: AIMMS Case Creator — 2×2 card grid (f234–526)
         ══════════════════════════════════════════════════════════ */}
      {(editorOpacity * editorExit) > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "80px 40px 28px",
          opacity: editorOpacity * editorExit,
          pointerEvents: "none",
          zIndex: 10,
        }}>

          {/* ── Top action bar ── */}
          <GlassPanel
            enterFrame={245}
            exitFrame={526}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", marginBottom: 14, flexShrink: 0 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.white }}>
                Pneumonia Case — Adult
              </span>
              <div style={{
                fontFamily: fonts.mono, fontSize: 13, padding: "3px 10px", borderRadius: 6,
                background: publishFlip > 0.5 ? `${colors.vitalsNormal}25` : `${colors.vitalsWarning}20`,
                color:      publishFlip > 0.5 ? colors.vitalsNormal : colors.vitalsWarning,
              }}>
                {publishFlip > 0.5 ? "Published" : "Draft"}
              </div>

              {/* AI activity indicator */}
              {generatingOp > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: generatingOp }}>
                  <PulsingDot color={colors.oasis} size={8} delay={290} />
                  <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.oasis }}>
                    AI Generating
                  </span>
                </div>
              )}
              {allDoneOp > 0 && (
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.vitalsNormal, opacity: allDoneOp }}>
                  ✓ Case Generated
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {["Generate Case", "Publish", "Test in VP"].map((btn) => (
                <div key={btn} style={{
                  fontFamily: fonts.body, fontSize: 14, fontWeight: 600,
                  color:      btn === "Test in VP" ? colors.oasis : `${colors.white}80`,
                  background: btn === "Test in VP" ? `${colors.oasis}20` : `${colors.white}10`,
                  padding: "6px 16px", borderRadius: 8,
                  boxShadow: btn === "Test in VP" && vpGlow > 0
                    ? `0 0 14px ${colors.oasis}${Math.round(vpGlow * 60).toString(16).padStart(2, "0")}`
                    : "none",
                }}>
                  {btn}
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* ── 2×2 Section card grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 16,
              flex: 1,
              transform: `scale(${gridScale})`,
              transformOrigin: "50% 50%",
            }}
          >
            {SECTION_CARDS.map((card, ci) => {
              const sp = cardSprings[ci];
              const cardOp    = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
              const cardScale = interpolate(sp, [0, 1], [0.93, 1], { extrapolateRight: "clamp" as const });
              const cardY     = interpolate(sp, [0, 1], [14, 0], { extrapolateRight: "clamp" as const });

              if (frame < CARD_STARTS[ci]) return <div key={ci} />;

              /* Is this card currently generating? */
              const lastFieldDoneFrame = CONTENT_STARTS[ci] + (card.fields.length - 1) * FIELD_STAGGER + FIELD_REVEAL;
              const cardGenerating = frame >= CONTENT_STARTS[ci] && frame < lastFieldDoneFrame;

              return (
                <div
                  key={ci}
                  style={{
                    opacity: cardOp,
                    transform: `scale(${cardScale}) translateY(${cardY}px)`,
                    transformOrigin: "center center",
                  }}
                >
                  <div style={{
                    height: "100%",
                    background: "rgba(12, 35, 75, 0.82)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: `1px solid ${card.color}35`,
                    borderRadius: 14,
                    padding: "22px 28px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 0 0 1px ${card.color}15`,
                  }}>
                    {/* Card header */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      paddingBottom: 16, marginBottom: 16,
                      borderBottom: `1px solid ${card.color}28`,
                      flexShrink: 0,
                    }}>
                      <div style={{ width: 5, height: 26, background: card.color, borderRadius: 3 }} />
                      <span style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 800, color: colors.white }}>
                        {card.title}
                      </span>
                      {cardGenerating && (
                        <PulsingDot color={card.color} size={8} delay={CARD_STARTS[ci]} />
                      )}
                    </div>

                    {/* Fields */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: card.grid,
                      gap: "16px 28px",
                      flex: 1,
                      alignContent: "start",
                    }}>
                      {card.fields.map((field, fi) => {
                        const revealCount = getReveal(ci, fi);
                        const fieldDone   = isDone(ci, fi);
                        const isTyping    = revealCount > 0 && !fieldDone;
                        const hasContent  = revealCount > 0;

                        return (
                          <div
                            key={fi}
                            style={{ gridColumn: field.wide ? "1 / -1" : "auto" }}
                          >
                            <div style={{
                              fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
                              color: `${colors.white}42`,
                              letterSpacing: 1.2, textTransform: "uppercase" as const,
                              marginBottom: 5,
                            }}>
                              {field.label}
                            </div>
                            <div style={{
                              fontFamily: fonts.heading,
                              fontSize: 26,
                              fontWeight: 700,
                              color: fieldDone ? colors.white : isTyping ? `${colors.white}90` : `${colors.white}18`,
                              lineHeight: 1.2,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              minHeight: 34,
                            }}>
                              {hasContent ? (
                                <>
                                  {field.value.slice(0, revealCount)}
                                  {isTyping && (
                                    <span style={{ color: card.color, opacity: 0.85, fontWeight: 400 }}>▌</span>
                                  )}
                                  {fieldDone && field.flag && (
                                    <span style={{
                                      fontFamily: fonts.mono, fontSize: 16, fontWeight: 700,
                                      color: colors.vitalsWarning, marginLeft: 4,
                                    }}>
                                      ↑
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span style={{ color: `${colors.white}14`, fontSize: 22 }}>————</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PHASE 4: Case Complete & Published (f490–805)
         ══════════════════════════════════════════════════════════ */}
      {phase4Opacity > 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: phase4Opacity, pointerEvents: "none", zIndex: 15,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <span style={{
              fontFamily: fonts.heading, fontSize: 54, fontWeight: 800,
              color: colors.white,
              textShadow: `0 0 36px ${colors.azurite}90`,
              letterSpacing: 2,
            }}>
              Case Complete
            </span>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 16, fontWeight: 600,
                color: colors.oasis, background: `${colors.oasis}20`,
                padding: "7px 20px", borderRadius: 7,
                boxShadow: `0 0 16px ${colors.oasis}${Math.round(vpGlow * 55).toString(16).padStart(2, "0")}`,
              }}>
                Ready for VP Testing
              </div>
            </div>
          </div>
        </div>
      )}
    </SceneShell>
  );
};
