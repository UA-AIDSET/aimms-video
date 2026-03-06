import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { NodeNetwork } from "../three/NodeNetwork";
import { CameraRig } from "../three/CameraRig";
import { GlassPanel } from "../components/GlassPanel";
import { PulsingDot } from "../components/PulsingDot";
import { colors, fonts } from "../theme";

/* ── Node network layout (3 layers: input → hidden → output) ── */
function buildNetworkNodes(): Array<{ x: number; y: number; z: number }> {
  const nodes: Array<{ x: number; y: number; z: number }> = [];
  for (let i = 0; i < 8; i++) {
    nodes.push({ x: -2, y: -1.75 + i * 0.5, z: -1 });
  }
  for (let i = 0; i < 14; i++) {
    nodes.push({ x: 0, y: -1.75 + i * (3.5 / 13), z: -1 });
  }
  for (let i = 0; i < 8; i++) {
    nodes.push({ x: 2, y: -1.75 + i * 0.5, z: -1 });
  }
  return nodes;
}

function buildNetworkEdges(nodeCount: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  const inputEnd = 8;
  const hiddenEnd = 8 + 14;
  for (let i = 0; i < inputEnd; i++) {
    for (let j = inputEnd; j < hiddenEnd; j += 2) {
      edges.push([i, j]);
    }
  }
  for (let i = inputEnd; i < hiddenEnd; i++) {
    for (let j = hiddenEnd; j < nodeCount; j += 2) {
      edges.push([i, j]);
    }
  }
  return edges;
}

/* ── ASTEC library cases (12 visible) ── */
const libraryCases = [
  { title: "Pneumonia — Adult", sections: 8, tag: "Respiratory", author: "KT", uses: 47, completion: 0.85 },
  { title: "Heart Failure — Elderly", sections: 8, tag: "Cardiology", author: "ML", uses: 32, completion: 0.92 },
  { title: "Appendicitis — Pediatric", sections: 8, tag: "Surgery", author: "PD", uses: 28, completion: 0.78 },
  { title: "Diabetic Ketoacidosis", sections: 8, tag: "Endocrine", author: "LW", uses: 19, completion: 1.0 },
  { title: "Asthma Exacerbation", sections: 8, tag: "Respiratory", author: "KT", uses: 0, completion: 0.6 },
  { title: "Stroke — Acute Ischemic", sections: 8, tag: "Neurology", author: "RH", uses: 41, completion: 0.95 },
  { title: "Sepsis — Early Recognition", sections: 8, tag: "Critical Care", author: "SJ", uses: 36, completion: 0.88 },
  { title: "Chest Pain — ACS Workup", sections: 8, tag: "Cardiology", author: "ML", uses: 22, completion: 1.0 },
];

/* ── ASTEC template sections ── */
const astecSections = [
  "Patient Demographics",
  "Chief Complaint",
  "History of Present Illness",
  "Physical Exam",
  "Assessment",
  "Diagnostic Tests",
  "Treatment Plan",
  "Follow-Up",
];

/* ── Table rows: field → variable → filled value ── */
const tableRows = [
  { field: "Patient Name", variable: "{patient_name}", filled: "Michael Chen" },
  { field: "Age / Sex", variable: "{age_sex}", filled: "58 / Male" },
  { field: "Chief Complaint", variable: "{chief_complaint}", filled: "Productive cough, fever x3 days" },
  { field: "Temperature", variable: "{temperature}", filled: "38.9 °C" },
  { field: "Heart Rate", variable: "{heart_rate}", filled: "96 bpm" },
  { field: "Blood Pressure", variable: "{blood_pressure}", filled: "138/88 mmHg" },
  { field: "Respiratory Rate", variable: "{resp_rate}", filled: "22 breaths/min" },
  { field: "O₂ Saturation", variable: "{spo2}", filled: "95% on room air" },
  { field: "Lung Sounds", variable: "{lung_sounds}", filled: "Crackles bilateral bases" },
  { field: "Imaging", variable: "{imaging}", filled: "CXR: RLL consolidation" },
  { field: "WBC Count", variable: "{wbc}", filled: "14,200 /μL (elevated)" },
];

/**
 * Scene 2: Medical Case Creator (MCC) — ~590 frames
 * UI-first design showcasing the real MCC workflow.
 *
 * Phase 1 (65–195):  ASTEC Library — browse templates + create your own
 * Phase 2 (195–370): Case Editor — name case + sections + table with {variables}
 * Phase 3 (370–500): AI Generation — cells fill one-by-one
 * Phase 4 (490–580): Complete & Publish
 */
export const Scene2_MCC: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const networkNodes = useMemo(() => buildNetworkNodes(), []);
  const networkEdges = useMemo(
    () => buildNetworkEdges(networkNodes.length),
    [networkNodes.length],
  );

  /* ── Phase opacities ── */
  const phase1Opacity = interpolate(frame, [65, 80, 175, 195], [0, 1, 1, 0], clamp);
  // Editor container stays visible across phases 2+3 (no crossfade dip)
  const editorOpacity = interpolate(frame, [195, 215, 480, 500], [0, 1, 1, 0], clamp);
  const phase2Opacity = interpolate(frame, [195, 215, 350, 370], [0, 1, 1, 0], clamp);
  const phase3Opacity = interpolate(frame, [350, 370, 480, 500], [0, 1, 1, 0], clamp);
  const phase4Opacity = interpolate(frame, [490, 505, 560, 580], [0, 1, 1, 0], clamp);

  // ASTEC template highlight
  const astecHighlight = interpolate(frame, [110, 135], [0, 1], clamp);
  // "Create Your Own" button glow
  const createOwnGlow = interpolate(frame, [145, 165], [0, 1], clamp);

  // AI generation: all cells fill simultaneously in a rapid burst (futuristic)
  const cellFillProgress = tableRows.map((_, i) =>
    interpolate(frame, [375 + i * 5, 388 + i * 5], [0, 1], clamp),
  );

  // Scrolling text effect — characters reveal left-to-right within each cell
  const cellCharReveal = tableRows.map((row, i) => {
    const fillStart = 375 + i * 5;
    return Math.floor(interpolate(frame, [fillStart, fillStart + 18], [0, row.filled.length], clamp));
  });

  // Neural net ambient — fade in with editor, fade out with phase 3
  const networkOpacity = interpolate(frame, [195, 250, 480, 500], [0, 0.4, 0.4, 0], clamp);
  const networkEdgeOpacity = interpolate(frame, [195, 250, 480, 500], [0, 0.15, 0.15, 0], clamp);

  // Published badge animation
  const publishFlip = interpolate(frame, [510, 525], [0, 1], clamp);

  // VP button glow
  const vpGlow = frame >= 525 ? 0.5 + 0.3 * Math.sin((frame - 525) * 0.12) : 0;

  /* ── 3D content (ambient background) ── */
  const threeContent = (
    <>
      <AnimatedGrid color={colors.azurite} opacity={0.08} />
      <ParticleField count={60} color={colors.oasis} speed={0.002} opacity={0.2} />

      {networkOpacity > 0 && (
        <NodeNetwork
          nodes={networkNodes}
          edges={networkEdges}
          color={colors.oasis}
          nodeSize={0.04}
          edgeOpacity={networkEdgeOpacity}
          pulseSpeed={0.015}
          position={[0, 0, -2]}
          scale={0.9}
        />
      )}

      <GlowOrb position={[0, 0, -3]} color={colors.azurite} radius={3} baseOpacity={0.1} />

      <CameraRig
        positions={[
          { frame: 0, position: [0, 0, 10] },
          { frame: 175, position: [0, 0, 9] },
          { frame: 350, position: [0, 0, 8] },
          { frame: 590, position: [0, 0, 8] },
        ]}
      />
    </>
  );

  return (
    <SceneShell
      interstitial={{ step: 1, title: "Author", subtitle: "Medical Case Creator" }}
      sectionLabel="Case Authoring — MCC"
      threeContent={threeContent}
    >

      {/* ════════════════════════════════════════════════════════
          Phase 1: ASTEC Library + Template Selection (65–195)
         ════════════════════════════════════════════════════════ */}
      {phase1Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "80px 40px 30px",
            opacity: phase1Opacity,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Header bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: colors.white }}>
                ASTEC Case Library
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 15, color: `${colors.white}60`, background: `${colors.white}08`, padding: "4px 12px", borderRadius: 6 }}>
                {libraryCases.length} cases
              </div>
            </div>
            <div
              style={{
                fontFamily: fonts.body, fontSize: 17, fontWeight: 600,
                color: colors.oasis, background: `${colors.oasis}20`,
                padding: "8px 20px", borderRadius: 8,
                border: `1px solid ${colors.oasis}${Math.round(interpolate(createOwnGlow, [0, 1], [20, 80])).toString(16).padStart(2, "0")}`,
                boxShadow: createOwnGlow > 0.5 ? `0 0 16px ${colors.oasis}25` : "none",
              }}
            >
              + Create Your Own Case
            </div>
          </div>

          {/* Case grid — 3 columns, compact cards (opacity-only fade, no scale) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, flex: 1, overflow: "hidden" }}>
            {libraryCases.map((c, i) => {
              const cardEnter = 75 + i * 3;
              const cardOpacity = interpolate(frame, [cardEnter, cardEnter + 18], [0, 1], clamp);
              const exitOp = interpolate(frame, [180, 195], [1, 0], clamp);
              const isSelected = i === 0;
              const highlightBorder = isSelected
                ? `2px solid rgba(55,141,189,${interpolate(astecHighlight, [0, 1], [0.2, 0.9])})`
                : `1px solid ${colors.oasis}15`;
              const opacity = cardOpacity * exitOp;
              const isDraft = c.uses === 0;
              return (
                <div
                  key={c.title}
                  style={{
                    background: "rgba(12, 35, 75, 0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderRadius: 12,
                    padding: 0,
                    border: highlightBorder,
                    boxShadow: isSelected && astecHighlight > 0.5 ? `0 0 16px ${colors.oasis}20` : "none",
                    opacity,
                    visibility: opacity <= 0 ? "hidden" as const : "visible" as const,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column" as const,
                  }}
                >
                  {/* Top accent bar — oasis for published, dimmer for draft */}
                  <div style={{ height: 3, background: isDraft ? `${colors.oasis}40` : `linear-gradient(90deg, ${colors.oasis}, ${colors.azurite})` }} />

                  <div style={{ padding: "8px 12px 9px", display: "flex", flexDirection: "column" as const, gap: 5, flex: 1 }}>
                    {/* Title + status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white, lineHeight: 1.3, flex: 1 }}>
                        {c.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        {isSelected && <PulsingDot color={colors.ecgGreen} size={8} delay={110} />}
                        <span style={{
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700,
                          color: isDraft ? colors.vitalsWarning : colors.vitalsNormal,
                          background: isDraft ? `${colors.vitalsWarning}15` : `${colors.vitalsNormal}15`,
                          padding: "2px 7px", borderRadius: 3,
                        }}>
                          {isDraft ? "Draft" : "Published"}
                        </span>
                      </div>
                    </div>

                    {/* Tag + section count */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
                        color: colors.oasis, background: `${colors.oasis}15`,
                        padding: "2px 7px", borderRadius: 4,
                      }}>
                        {c.tag}
                      </span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}45` }}>
                        {c.sections} sections
                      </span>
                    </div>

                    {/* Completion progress bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${colors.white}10` }}>
                        <div style={{
                          height: "100%", borderRadius: 2, width: `${c.completion * 100}%`,
                          background: c.completion >= 1 ? colors.vitalsNormal : colors.oasis,
                        }} />
                      </div>
                      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: `${colors.white}50`, flexShrink: 0 }}>
                        {Math.round(c.completion * 100)}%
                      </span>
                    </div>

                    {/* Bottom: author + usage stats */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          background: `${colors.oasis}25`, border: `1px solid ${colors.oasis}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: fonts.mono, fontSize: 10, fontWeight: 700, color: colors.oasis,
                        }}>
                          {c.author}
                        </div>
                      </div>
                      {c.uses > 0 && (
                        <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}45` }}>
                          {c.uses} uses
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Phase 2+3: Case Editor (195–500)
         ════════════════════════════════════════════════════════ */}
      {editorOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: "80px 40px 30px",
            opacity: editorOpacity,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* ── Top bar ── */}
          <GlassPanel
            enterFrame={200}
            exitFrame={phase3Opacity > 0 ? 500 : 370}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 24px",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.white }}>
                Pneumonia Case — Adult
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 15,
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: publishFlip > 0 ? `${colors.vitalsNormal}25` : `${colors.vitalsWarning}20`,
                  color: publishFlip > 0 ? colors.vitalsNormal : colors.vitalsWarning,
                }}
              >
                {publishFlip > 0.5 ? "Published" : "Draft"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {["Add Section", "Publish", "Test in VP"].map((btn) => (
                <div
                  key={btn}
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 15,
                    fontWeight: 600,
                    color: btn === "Test in VP" ? colors.oasis : `${colors.white}80`,
                    background: btn === "Test in VP" ? `${colors.oasis}20` : `${colors.white}10`,
                    padding: "6px 16px",
                    borderRadius: 8,
                    boxShadow: btn === "Test in VP" && vpGlow > 0 ? `0 0 12px ${colors.oasis}${Math.round(vpGlow * 60).toString(16).padStart(2, "0")}` : "none",
                  }}
                >
                  {btn}
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* ── Editor body: sections nav + table ── */}
          <div style={{ display: "flex", gap: 16, flex: 1 }}>
            {/* Section nav */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 260 }}>
              {astecSections.map((sec, i) => {
                const secEnter = 205 + i * 10;
                const secOpacity = interpolate(frame, [secEnter, secEnter + 18], [0, 1], clamp);
                const isActive = i === 0;
                return (
                  <div
                    key={sec}
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 17,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? colors.oasis : `${colors.white}70`,
                      background: isActive ? `${colors.oasis}15` : "transparent",
                      padding: "10px 14px",
                      borderRadius: 6,
                      borderLeft: isActive ? `3px solid ${colors.oasis}` : "3px solid transparent",
                      opacity: secOpacity,
                    }}
                  >
                    {sec}
                  </div>
                );
              })}

              {/* Temperature slider */}
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  opacity: interpolate(frame, [245, 260], [0, 1], clamp),
                }}
              >
                <div style={{ fontFamily: fonts.mono, fontSize: 14, color: `${colors.white}60`, marginBottom: 8 }}>
                  AI Temperature
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: `${colors.white}15` }}>
                    <div style={{ width: "70%", height: "100%", borderRadius: 3, background: colors.oasis }} />
                  </div>
                  <span style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.oasis }}>0.7</span>
                </div>
              </div>

              {/* Case stats panel */}
              <GlassPanel enterFrame={260} exitFrame={phase3Opacity > 0 ? 500 : 370} style={{ padding: "12px 14px", marginTop: 10 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Case Stats
                </div>
                {[
                  { label: "Sections", value: "8 / 8" },
                  { label: "Variables", value: `${tableRows.length}` },
                  { label: "AI Fields", value: phase3Opacity > 0 ? `${tableRows.filter((_, i) => cellFillProgress[i] >= 1).length}/${tableRows.length}` : "0/" + tableRows.length },
                ].map((stat, i) => (
                  <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", opacity: interpolate(frame, [265 + i * 7, 273 + i * 7], [0, 1], clamp) }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 14, color: `${colors.white}70` }}>{stat.label}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.oasis }}>{stat.value}</span>
                  </div>
                ))}
              </GlassPanel>

              {/* AI Model info */}
              <GlassPanel enterFrame={275} exitFrame={phase3Opacity > 0 ? 500 : 370} style={{ padding: "12px 14px", marginTop: 8 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  AI Model
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.azurite }}>GPT-4o</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.vitalsNormal}90`, background: `${colors.vitalsNormal}15`, padding: "2px 8px", borderRadius: 4 }}>
                    Connected
                  </div>
                  {phase3Opacity > 0 && (
                    <div style={{
                      fontFamily: fonts.mono, fontSize: 12, color: `${colors.oasis}90`, background: `${colors.oasis}15`, padding: "2px 8px", borderRadius: 4,
                      opacity: interpolate(frame, [375, 383, 425, 435], [0, 1, 1, 0.6], clamp),
                    }}>
                      Generating...
                    </div>
                  )}
                </div>
              </GlassPanel>
            </div>

            {/* Table + Media — two-column layout */}
            <div style={{ display: "flex", gap: 16, flex: 1 }}>
              {/* Left: Table area */}
              <GlassPanel
                enterFrame={215}
                exitFrame={phase3Opacity > 0 ? 500 : 370}
                style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column" }}
              >
                {/* Section tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {["Patient Demographics", "Chief Complaint", "HPI"].map((tab, i) => (
                    <div key={tab} style={{
                      fontFamily: fonts.mono, fontSize: 12, fontWeight: i === 0 ? 700 : 400,
                      color: i === 0 ? colors.oasis : `${colors.white}40`,
                      background: i === 0 ? `${colors.oasis}15` : `${colors.white}06`,
                      padding: "4px 10px", borderRadius: 4,
                      opacity: interpolate(frame, [218 + i * 5, 228 + i * 5], [0, 1], clamp),
                    }}>{tab}</div>
                  ))}
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}35`,
                    padding: "4px 8px",
                    opacity: interpolate(frame, [233, 243], [0, 1], clamp),
                  }}>+5 more</div>
                </div>

                {/* Table header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "155px 1fr 24px",
                    gap: 8,
                    borderBottom: `1px solid ${colors.oasis}25`,
                    paddingBottom: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.oasis, letterSpacing: 1, textTransform: "uppercase" as const }}>
                    Field
                  </span>
                  <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.oasis, letterSpacing: 1, textTransform: "uppercase" as const }}>
                    Value
                  </span>
                  <span />
                </div>

                {/* Table rows */}
                {tableRows.map((row, i) => {
                  const rowEnter = 222 + i * 12;
                  const rowOpacity = interpolate(frame, [rowEnter, rowEnter + 16], [0, 1], clamp);
                  const filled = cellFillProgress[i];
                  const showValue = filled > 0;
                  const showAiDot = filled >= 1;

                  return (
                    <div
                      key={row.field}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "155px 1fr 24px",
                        gap: 8,
                        padding: "5px 0",
                        opacity: rowOpacity,
                        borderBottom: i < tableRows.length - 1 ? `1px solid ${colors.white}08` : "none",
                      }}
                    >
                      <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 500, color: colors.white }}>
                        {row.field}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 14,
                          color: showValue ? colors.white : colors.oasis,
                          opacity: showValue ? interpolate(filled, [0, 1], [0.5, 1]) : 0.7,
                          position: "relative",
                        }}
                      >
                        {showValue ? (
                          <>
                            {row.filled.slice(0, cellCharReveal[i])}
                            {cellCharReveal[i] < row.filled.length && (
                              <span style={{ color: colors.oasis, opacity: 0.6 }}>
                                {row.filled.slice(cellCharReveal[i], cellCharReveal[i] + 3).replace(/./g, "█")}
                              </span>
                            )}
                          </>
                        ) : row.variable}
                      </span>
                      {/* AI indicator dot */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {showAiDot && (
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: colors.azurite,
                              opacity: interpolate(frame, [388 + i * 5, 396 + i * 5], [0, 1], clamp),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* AI Generating label + progress during Phase 3 */}
                {phase3Opacity > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      opacity: interpolate(frame, [370, 383, 430, 445], [0, 1, 1, 0], clamp),
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PulsingDot color={colors.oasis} size={10} delay={370} />
                      <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.oasis }}>
                        AI Generating — {tableRows.filter((_, i) => cellFillProgress[i] >= 1).length}/{tableRows.length} fields
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: `${colors.white}10`, width: "100%" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        background: `linear-gradient(90deg, ${colors.oasis}, ${colors.azurite})`,
                        width: `${(tableRows.filter((_, i) => cellFillProgress[i] >= 1).length / tableRows.length) * 100}%`,
                        transition: "none",
                      }} />
                    </div>
                  </div>
                )}

                {/* All fields complete flash */}
                {phase3Opacity > 0 && tableRows.every((_, i) => cellFillProgress[i] >= 1) && (
                  <div style={{
                    marginTop: 6,
                    display: "flex", alignItems: "center", gap: 8,
                    opacity: interpolate(frame, [430, 440, 480, 495], [0, 1, 1, 0], clamp),
                  }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.vitalsNormal }}>✓ All fields generated</span>
                  </div>
                )}
              </GlassPanel>

              {/* Right: Media & Attachments panel */}
              <GlassPanel
                enterFrame={225}
                exitFrame={phase3Opacity > 0 ? 500 : 370}
                style={{ width: 340, padding: "16px 18px", display: "flex", flexDirection: "column" }}
              >
                <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.white, marginBottom: 12 }}>
                  Case Media
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 12, color: `${colors.white}50`, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" as const }}>
                  Attachments for Virtual Patient
                </div>

                {/* Media items stagger in */}
                {[
                  { type: "image", icon: "🖼", label: "Chest X-Ray — PA View", size: "2.4 MB", color: colors.azurite },
                  { type: "image", icon: "🖼", label: "CT Scan — Thorax", size: "8.1 MB", color: colors.azurite },
                  { type: "audio", icon: "🔊", label: "Lung Sounds — Crackles", size: "340 KB", color: colors.oasis },
                  { type: "video", icon: "🎬", label: "Patient Interview Demo", size: "24 MB", color: colors.chili },
                  { type: "file", icon: "📄", label: "Lab Results — CBC Panel", size: "18 KB", color: colors.vitalsNormal },
                  { type: "image", icon: "🖼", label: "EKG Strip — 12 Lead", size: "1.1 MB", color: colors.azurite },
                ].map((media, i) => {
                  const mediaEnter = 240 + i * 15;
                  const mediaOp = interpolate(frame, [mediaEnter, mediaEnter + 18], [0, 1], clamp);
                  return (
                    <div
                      key={media.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        marginBottom: 4,
                        borderRadius: 8,
                        background: `${colors.white}05`,
                        border: `1px solid ${colors.white}08`,
                        opacity: mediaOp,
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: `${media.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16,
                      }}>
                        {media.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 500, color: colors.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {media.label}
                        </div>
                        <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}50` }}>
                          {media.size}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 10, fontWeight: 600,
                        color: `${media.color}CC`,
                        background: `${media.color}15`,
                        padding: "2px 6px", borderRadius: 4,
                        textTransform: "uppercase" as const, letterSpacing: 0.5,
                      }}>
                        {media.type}
                      </div>
                    </div>
                  );
                })}

                {/* Upload zone */}
                <div
                  style={{
                    marginTop: "auto",
                    padding: "14px",
                    borderRadius: 8,
                    border: `1px dashed ${colors.oasis}30`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    opacity: interpolate(frame, [325, 340], [0, 0.7], clamp),
                  }}
                >
                  <span style={{ fontFamily: fonts.body, fontSize: 13, color: `${colors.white}50` }}>
                    Drop files to upload
                  </span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}30` }}>
                    Images, Audio, Video, Documents
                  </span>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          Phase 4: Complete & Publish flash (490–580)
         ════════════════════════════════════════════════════════ */}
      {phase4Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase4Opacity,
            pointerEvents: "none",
            zIndex: 15,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: fonts.heading,
                fontSize: 52,
                fontWeight: 700,
                color: colors.white,
                textShadow: `0 0 32px ${colors.azurite}80`,
                letterSpacing: 2,
              }}
            >
              Case Complete
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.vitalsNormal,
                  background: `${colors.vitalsNormal}20`,
                  padding: "6px 16px",
                  borderRadius: 6,
                }}
              >
                Published
              </div>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.oasis,
                  background: `${colors.oasis}20`,
                  padding: "6px 16px",
                  borderRadius: 6,
                  boxShadow: `0 0 12px ${colors.oasis}25`,
                }}
              >
                Ready for VP Testing
              </div>
            </div>
          </div>
        </div>
      )}
    </SceneShell>
  );
};
