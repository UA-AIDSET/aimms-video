import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";
import { OrbitRing } from "../three/OrbitRing";
import { WaveformLine } from "../three/WaveformLine";
import { ScanBeam } from "../three/ScanBeam";
import { NodeNetwork } from "../three/NodeNetwork";
import { DataStream } from "../three/DataStream";
import { MedicalSilhouette } from "../components/MedicalSilhouette";
import { GlassPanel } from "../components/GlassPanel";
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

/* ── Exam tools ── */
const examTools = [
  { name: "Stethoscope", finding: "Bilateral crackles, S3 gallop" },
  { name: "Palpation", finding: "2+ pitting edema, bilateral" },
  { name: "Percussion", finding: "Dull bases bilaterally" },
];

/* ── Test results ── */
const testResults = [
  { test: "CBC", result: "WBC 11.2 — mildly elevated", color: colors.vitalsWarning },
  { test: "BNP", result: "1,240 pg/mL — elevated", color: colors.vitalsCritical },
  { test: "Chest X-ray", result: "Bilateral pleural effusions", color: colors.vitalsWarning },
  { test: "ECG", result: "Sinus tachycardia, LVH", color: colors.vitalsWarning },
];

/**
 * Scene 4: Virtual Patient Exam — ~800 frames
 * Phase 1 (65-250):  Case selection HUDs
 * Phase 2 (250-420): Patient Interview — silhouette + vitals + chat
 * Phase 3 (420-775): Physical Exam + Diagnostics combined — scan + findings + test results
 */
export const Scene4_VirtualPatient: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // ── Phase 1: Case Selection (65-250) ──
  const hudPositions: Array<[number, number, number]> = [[-3, 0, -1], [-1, 0, -1], [1, 0, -1], [3, 0, -1]];
  const selectedIndex = 0;
  const selectionProgress = interpolate(frame, [180, 230], [0, 1], clamp);
  const phase1Visible = frame >= 65 && frame < 250;

  // ── Phase 2: Hero HUD (250-420) ──
  const hudCenterX = interpolate(frame, [250, 300], [hudPositions[selectedIndex][0], 0], clamp);
  const ring1Scale = interpolate(frame, [260, 300], [0, 2.0], clamp);
  const ring2Scale = interpolate(frame, [275, 320], [0, 2.8], clamp);
  const ring3Scale = interpolate(frame, [290, 340], [0, 3.6], clamp);
  const ring4Scale = interpolate(frame, [305, 355], [0, 4.2], clamp);
  const ringOpacity = interpolate(frame, [260, 300], [0, 1], clamp);
  const waveOpacity = interpolate(frame, [285, 330], [0, 1], clamp);
  const centralGlow = interpolate(frame, [250, 300, 410, 420], [0, 0.15, 0.15, 0.05], clamp);
  const chatOpacity = interpolate(frame, [300, 320], [0, 1], clamp);

  // ── Phase 3: Physical Exam + Diagnostics combined (420-775) ──
  const isPhase3 = frame >= 420 && frame < 775;
  const scanActive = frame >= 420 && frame < 580;
  const sectorPulse = isPhase3 ? 0.15 * Math.sin(frame * 0.06) + 0.15 : 0;

  // Rings persist but recede during phase 3
  const phase3Rings = interpolate(frame, [420, 470], [1, 0.5], clamp);
  const phase3RingOp = interpolate(frame, [420, 470], [1, 0.3], clamp);

  // Diagnostic results fade in during second half of phase 3
  const diagFadeIn = interpolate(frame, [580, 610], [0, 1], clamp);

  const { networkNodes, networkTargetNodes, networkEdges } = useMemo(() => {
    const nodes: Array<{ x: number; y: number; z: number }> = [];
    const targets: Array<{ x: number; y: number; z: number }> = [];
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < 25; i++) {
      nodes.push({ x: Math.sin(i * 2.4) * 0.3, y: Math.cos(i * 1.7) * 0.3, z: Math.sin(i * 3.1) * 0.2 });
      const angle = (i / 25) * Math.PI * 2;
      const radius = 2 + (i % 3) * 0.8;
      targets.push({ x: Math.cos(angle) * radius, y: (i % 5 - 2) * 0.6, z: Math.sin(angle) * radius * 0.3 - 1 });
      if (i > 0) { edges.push([0, i]); if (i > 1 && i % 3 === 0) edges.push([i - 1, i]); }
    }
    return { networkNodes: nodes, networkTargetNodes: targets, networkEdges: edges };
  }, []);

  const uiFadeOut = interpolate(frame, [755, 780], [1, 0], clamp);
  const networkMorphProgress = interpolate(frame, [600, 650], [0, 1], clamp);

  const threeContent = (
    <>
      <AnimatedGrid color="#39FF14" opacity={0.06} waveSpeed={0.015} />
      <ParticleField count={100} color="#39FF14" speed={0.002} opacity={0.2} />

      {phase1Visible && hudPositions.map((pos, i) => {
        const isSelected = i === selectedIndex;
        const opacity = isSelected ? interpolate(selectionProgress, [0, 1], [0.3, 0.8]) : interpolate(selectionProgress, [0, 1], [0.3, 0.05]);
        const ringSize = isSelected ? interpolate(selectionProgress, [0, 1], [0.6, 0.9]) : 0.6;
        return (
          <group key={i}>
            <OrbitRing position={pos} radius={ringSize} color={isSelected ? colors.ecgGreen : colors.oasis} opacity={opacity} rotationSpeed={0.02} tilt={[0, 0, 0]} />
            <OrbitRing position={pos} radius={ringSize * 0.6} color={isSelected ? colors.ecgGreen : colors.azurite} opacity={opacity * 0.7} rotationSpeed={-0.015} tilt={[Math.PI / 4, 0, 0]} />
            <GlowOrb position={pos} color={isSelected ? colors.ecgGreen : colors.oasis} radius={0.15} baseOpacity={opacity * 0.5} />
          </group>
        );
      })}

      {/* Phase 2: Radial HUD */}
      {frame >= 250 && frame < 420 && (
        <group position={[hudCenterX, 0, 0]}>
          <GlowOrb position={[0, 0, -1]} color={colors.ecgGreen} radius={2} baseOpacity={centralGlow} />
          <OrbitRing radius={ring1Scale} color={colors.ecgGreen} opacity={0.4 * ringOpacity + sectorPulse} rotationSpeed={0.02} tilt={[0, 0, 0]} />
          <OrbitRing radius={ring2Scale} color={colors.oasis} opacity={0.3 * ringOpacity} rotationSpeed={-0.015} tilt={[Math.PI / 8, 0, 0]} />
          <OrbitRing radius={ring3Scale} color={colors.azurite} opacity={0.25 * ringOpacity + sectorPulse * 0.5} rotationSpeed={0.01} tilt={[0, 0, Math.PI / 6]} />
          <OrbitRing radius={ring4Scale} color={colors.ecgGreen} opacity={0.15 * ringOpacity} rotationSpeed={-0.008} tilt={[Math.PI / 5, Math.PI / 10, 0]} />
          <WaveformLine position={[-3.5, 1.2, 0]} color={colors.ecgGreen} amplitude={0.4} opacity={0.6 * waveOpacity} width={3} frequency={2} />
          <WaveformLine position={[3.5, -0.8, 0]} color={colors.oasis} amplitude={0.2} frequency={1} opacity={0.5 * waveOpacity} width={3} speed={0.06} />
          <WaveformLine position={[0, -2.5, 0]} color={colors.ecgGreen} amplitude={0.15} frequency={3} opacity={0.4 * waveOpacity} width={5} speed={0.08} />
        </group>
      )}

      {/* Phase 3: Rings persist but recede, scan beam active first half */}
      {isPhase3 && (
        <>
          <OrbitRing radius={2.0 * phase3Rings} color={colors.ecgGreen} opacity={0.3 * phase3RingOp + sectorPulse} rotationSpeed={0.02} tilt={[0, 0, 0]} />
          <OrbitRing radius={2.8 * phase3Rings} color={colors.oasis} opacity={0.2 * phase3RingOp} rotationSpeed={-0.015} tilt={[Math.PI / 8, 0, 0]} />
          {scanActive && <ScanBeam active={true} sweepSpeed={0.012} color={colors.ecgGreen} opacity={0.5} />}
          {diagFadeIn > 0 && (
            <>
              <NodeNetwork nodes={networkNodes} targetNodes={networkTargetNodes} morphProgress={networkMorphProgress} edges={networkEdges} color={colors.oasis} nodeSize={0.05} edgeOpacity={0.2 * networkMorphProgress} />
              <DataStream direction="left" position={[-1.5, 0.5, -0.5]} color={colors.oasis} opacity={0.15 * diagFadeIn} length={3} speed={0.06} />
              <DataStream direction="right" position={[1.5, 0.5, -0.5]} color={colors.oasis} opacity={0.15 * diagFadeIn} length={3} speed={0.06} />
            </>
          )}
        </>
      )}

      <CameraRig positions={[
        { frame: 0, position: [0, 0, 10] }, { frame: 250, position: [0, 0, 10] },
        { frame: 310, position: [1.5, 0.5, 6] }, { frame: 420, position: [-0.5, 0, 7] },
        { frame: 580, position: [0, 0, 8] }, { frame: 800, position: [0, 0, 10] },
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

      {/* ── Medical Silhouette (Phases 2-3) ── */}
      <MedicalSilhouette enterFrame={270} exitFrame={755} color={colors.ecgGreen} scale={0.95} />

      {/* ── Vitals Strip (Phase 2+) ── */}
      {frame >= 270 && frame < 775 && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 40,
            right: 40,
            display: "flex",
            justifyContent: "center",
            gap: 28,
            opacity: interpolate(frame, [270, 290, 755, 780], [0, 1, 1, 0], clamp),
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {vitals.map((v, i) => {
            const vOpacity = interpolate(frame, [275 + i * 8, 290 + i * 8], [0, 1], clamp);
            return (
              <div key={v.label} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: vOpacity,
                background: "rgba(12,35,75,0.5)", borderRadius: 10, padding: "8px 18px",
                border: `1px solid ${v.color}30`,
              }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: `${colors.white}60`, letterSpacing: 1 }}>{v.label}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 26, fontWeight: 700, color: v.color }}>{v.value}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40` }}>{v.unit}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Chat Panel (Phase 2: 300-420) ── */}
      {chatOpacity > 0 && frame < 420 && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 40,
            width: 440,
            opacity: chatOpacity * interpolate(frame, [400, 420], [1, 0], clamp),
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <GlassPanel enterFrame={300} exitFrame={420} style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 700, color: colors.white }}>
                Patient Interview
              </div>
              <PulsingDot color={colors.ecgGreen} size={8} delay={305} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chatMessages.map((msg, i) => {
                const msgOpacity = interpolate(frame, [310 + i * 22, 325 + i * 22], [0, 1], clamp);
                const isStudent = msg.sender === "student";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isStudent ? "flex-end" : "flex-start", opacity: msgOpacity }}>
                    <div style={{
                      maxWidth: "85%", padding: "8px 14px", borderRadius: 10,
                      background: isStudent ? `${colors.arizonaRed}30` : `${colors.white}10`,
                      fontFamily: fonts.body, fontSize: 15, color: colors.white, lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* ── Phase 3: Mode Tabs + Content (420-775) ── */}
      {isPhase3 && (
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 40,
            right: 40,
            bottom: 50,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: interpolate(frame, [430, 450, 750, 775], [0, 1, 1, 0], clamp) * uiFadeOut,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Patient info bar */}
          <GlassPanel enterFrame={430} exitFrame={775} style={{ padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.white }}>
                Maria Santos, 67F
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.oasis }}>
                CC: Dyspnea, lower extremity edema
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <PulsingDot color={colors.ecgGreen} size={8} delay={435} />
              <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.ecgGreen }}>Session Active</span>
            </div>
          </GlassPanel>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {["Interview", "Examine", "Tests"].map((mode, i) => {
              const isExamine = mode === "Examine";
              const isTests = mode === "Tests";
              const isInterview = mode === "Interview";
              const examineActive = frame >= 420 && frame < 580;
              const testsActive = frame >= 580;
              const isActive = (isInterview && false) || (isExamine && examineActive) || (isTests && testsActive);
              const tabColor = isInterview ? colors.oasis : isExamine ? colors.ecgGreen : colors.azurite;
              return (
                <div key={mode} style={{
                  fontFamily: fonts.heading, fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? tabColor : `${colors.white}50`,
                  background: isActive ? `${tabColor}20` : `${colors.white}06`,
                  padding: "8px 20px", borderRadius: "8px 8px 0 0",
                  borderBottom: isActive ? `2px solid ${tabColor}` : `2px solid transparent`,
                  opacity: interpolate(frame, [440 + i * 8, 450 + i * 8], [0, 1], clamp),
                }}>{mode}</div>
              );
            })}
          </div>

          {/* Examine mode content (420-580) */}
          {frame < 580 && (
            <div style={{
              display: "flex", gap: 14, flex: 1,
              opacity: interpolate(frame, [450, 465, 560, 580], [0, 1, 1, 0], clamp),
            }}>
              {/* Exam findings */}
              <GlassPanel enterFrame={450} exitFrame={580} style={{ flex: 1, padding: "16px 20px" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.ecgGreen, marginBottom: 12 }}>
                  Physical Examination
                </div>
                {examTools.map((tool, i) => {
                  const toolOpacity = interpolate(frame, [460 + i * 25, 478 + i * 25], [0, 1], clamp);
                  return (
                    <div key={tool.name} style={{ display: "flex", gap: 12, marginBottom: 12, opacity: toolOpacity }}>
                      <div style={{
                        fontFamily: fonts.mono, fontSize: 13, fontWeight: 600, color: colors.ecgGreen,
                        background: `${colors.ecgGreen}15`, padding: "5px 12px", borderRadius: 6,
                        whiteSpace: "nowrap" as const, flexShrink: 0,
                      }}>
                        {tool.name}
                      </div>
                      <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.white, lineHeight: 1.5 }}>
                        {tool.finding}
                      </span>
                    </div>
                  );
                })}

                {/* Exam body region indicators */}
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {["Cardiac", "Pulmonary", "Extremities", "Abdomen"].map((region, i) => {
                    const checked = i < 3;
                    const regionOp = interpolate(frame, [520 + i * 10, 533 + i * 10], [0, 1], clamp);
                    return (
                      <div key={region} style={{
                        fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
                        color: checked ? colors.ecgGreen : `${colors.white}40`,
                        background: checked ? `${colors.ecgGreen}12` : `${colors.white}06`,
                        padding: "4px 10px", borderRadius: 4,
                        border: `1px solid ${checked ? `${colors.ecgGreen}30` : `${colors.white}10`}`,
                        opacity: regionOp,
                      }}>
                        {checked ? "✓ " : ""}{region}
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>

              {/* Exam tools sidebar */}
              <GlassPanel enterFrame={455} exitFrame={580} style={{ width: 260, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40`, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 4 }}>
                  Available Tools
                </div>
                {["Stethoscope", "Palpation", "Percussion", "Otoscope", "Ophthalmoscope", "Reflex Hammer"].map((tool, i) => {
                  const used = i < 3;
                  const tOp = interpolate(frame, [460 + i * 8, 473 + i * 8], [0, 1], clamp);
                  return (
                    <div key={tool} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", borderRadius: 6,
                      background: used ? `${colors.ecgGreen}10` : `${colors.white}05`,
                      border: `1px solid ${used ? `${colors.ecgGreen}25` : `${colors.white}08`}`,
                      opacity: tOp,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: used ? colors.ecgGreen : `${colors.white}20`,
                      }} />
                      <span style={{ fontFamily: fonts.body, fontSize: 13, color: used ? colors.white : `${colors.white}50` }}>
                        {tool}
                      </span>
                      {used && <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.ecgGreen, marginLeft: "auto" }}>Used</span>}
                    </div>
                  );
                })}
              </GlassPanel>
            </div>
          )}

          {/* Tests mode content (580-775) */}
          {frame >= 570 && frame < 775 && (
            <div style={{
              display: "flex", gap: 14, flex: 1,
              opacity: interpolate(frame, [580, 600, 750, 770], [0, 1, 1, 0], clamp),
            }}>
              {/* Test results */}
              <GlassPanel enterFrame={585} exitFrame={770} style={{ flex: 1, padding: "16px 20px" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.azurite, marginBottom: 12 }}>
                  Diagnostic Results
                </div>
                {testResults.map((t, i) => {
                  const tOp = interpolate(frame, [600 + i * 15, 618 + i * 15], [0, 1], clamp);
                  return (
                    <div key={t.test} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", marginBottom: 8, borderRadius: 8,
                      background: `${colors.white}05`, border: `1px solid ${colors.white}08`,
                      opacity: tOp,
                    }}>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>{t.test}</div>
                        <div style={{ fontFamily: fonts.mono, fontSize: 13, color: t.color, marginTop: 3 }}>{t.result}</div>
                      </div>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                    </div>
                  );
                })}
              </GlassPanel>

              {/* Test ordering sidebar */}
              <GlassPanel enterFrame={590} exitFrame={770} style={{ width: 280, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40`, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 4 }}>
                  Tests Ordered
                </div>
                {[
                  { name: "Complete Blood Count", status: "Resulted" },
                  { name: "BNP Level", status: "Resulted" },
                  { name: "Chest X-Ray", status: "Resulted" },
                  { name: "12-Lead ECG", status: "Resulted" },
                  { name: "Basic Metabolic Panel", status: "Pending" },
                  { name: "Urinalysis", status: "Not Ordered" },
                ].map((test, i) => {
                  const isResulted = test.status === "Resulted";
                  const isPending = test.status === "Pending";
                  const tOp = interpolate(frame, [600 + i * 8, 613 + i * 8], [0, 1], clamp);
                  return (
                    <div key={test.name} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "6px 10px", borderRadius: 6,
                      background: isResulted ? `${colors.vitalsNormal}08` : `${colors.white}04`,
                      opacity: tOp,
                    }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: isResulted ? colors.white : `${colors.white}50` }}>
                        {test.name}
                      </span>
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 10, fontWeight: 600,
                        color: isResulted ? colors.vitalsNormal : isPending ? colors.vitalsWarning : `${colors.white}30`,
                      }}>
                        {test.status}
                      </span>
                    </div>
                  );
                })}

                {/* Session stats at bottom */}
                <div style={{
                  marginTop: "auto", padding: "10px 0", borderTop: `1px solid ${colors.white}10`,
                  display: "flex", flexDirection: "column", gap: 6,
                  opacity: interpolate(frame, [660, 680], [0, 1], clamp),
                }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 11, color: `${colors.white}40`, letterSpacing: 1, textTransform: "uppercase" as const }}>Session Summary</div>
                  {[
                    { label: "Questions", value: "14" },
                    { label: "Exam Points", value: "8" },
                    { label: "Tests Ordered", value: "4" },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 12, color: `${colors.white}50` }}>{s.label}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.oasis }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      )}
    </SceneShell>
  );
};
