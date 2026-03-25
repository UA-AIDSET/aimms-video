import React from "react";
import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, fonts } from "../theme";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";
import { AnimatedBox } from "../components/AnimatedBox";

/* ── Step metadata ── */
const steps = [
  { title: "Author", subtitle: "Medical Case Creator", color: colors.arizonaRed },
  { title: "Assign", subtitle: "Faculty Dashboard", color: colors.azurite },
  { title: "Simulate", subtitle: "Virtual Patient", color: colors.oasis },
  { title: "Evaluate", subtitle: "AIMS Reports", color: colors.vitalsNormal },
  { title: "Report", subtitle: "Performance", color: colors.arizonaRed },
];

/**
 * Scene 6: Full Flow Recap & Closing — ~510 frames
 * Phase 1 (0-290): Pipeline diagram with rich mini-app previews
 * Phase 2 (290-510): UA branding close
 */
export const Scene6_FlowRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const flowOpacity = interpolate(frame, [0, 10, 250, 290], [0, 1, 1, 0], clamp);
  const brandingOpacity = interpolate(frame, [270, 310], [0, 1], clamp);

  // Phase 2 title-slide-style animations
  const closeBracketDraw = interpolate(frame, [285, 340], [0, 1], clamp);
  const closeBracketGlow = 0.6 + 0.4 * Math.sin(frame * 0.06);
  const closeRing1Scale = interpolate(frame, [290, 380], [0, 1], clamp);
  const closeRing1Opacity = interpolate(frame, [290, 340, 460, 720], [0, 0.25, 0.15, 0.1], clamp);
  const closeRing2Scale = interpolate(frame, [310, 400], [0, 1], clamp);
  const closeRing2Opacity = interpolate(frame, [310, 360, 470, 720], [0, 0.2, 0.1, 0.08], clamp);
  const closeTickerOpacity = interpolate(frame, [340, 365], [0, 0.7], clamp);
  const closeTickerScroll = interpolate(frame, [340, 720], [0, -2400], clamp);
  const closeSideOpacity = interpolate(frame, [320, 345], [0, 1], clamp);
  const closeSidePulse = 0.5 + 0.5 * Math.sin(frame * 0.08);

  const threeContent = (
    <>
      <AnimatedGrid color="#1E5288" opacity={0.06} />
      <ParticleField count={30} color="#378DBD" speed={0.002} opacity={0.1} />
      <GlowOrb position={[0, 0, -3]} color={colors.oasis} radius={3} baseOpacity={0.06} />
      <CameraRig positions={[
        { frame: 0, position: [0, 0, 12] }, { frame: 180, position: [0, 0, 9] },
        { frame: 340, position: [0, 0, 9] }, { frame: 720, position: [0, 0.5, 7] },
      ]} />
    </>
  );

  return (
    <SceneShell threeContent={threeContent}>
      {/* Phase 1: Pipeline Diagram (0-290) */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "18px 40px",
        opacity: flowOpacity,
      }}>
        {/* Header */}
        <AnimatedBox delay={0} direction="down">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 14 }}>
            <span style={{ color: colors.white, fontSize: 48, fontFamily: fonts.heading, fontWeight: 800, letterSpacing: 0 }}>
              The AIMMS Pipeline
            </span>
            <span style={{ color: colors.oasis, fontSize: 22, fontFamily: fonts.body, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase" }}>
              End-to-End Medical Education
            </span>
          </div>
        </AnimatedBox>

        {/* Pipeline: cards with connecting arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 14 }}>
          {steps.map((step, i) => {
            // Stagger each card ~40 frames apart so narration can introduce each step
            const cardDelay = 30 + i * 40;
            const cardOp = interpolate(frame, [cardDelay, cardDelay + 22], [0, 1], clamp);
            const arrowOp = i < steps.length - 1 ? interpolate(frame, [cardDelay + 20, cardDelay + 38], [0, 1], clamp) : 0;
            return (
              <React.Fragment key={step.title}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
                  width: 230, opacity: cardOp,
                }}>
                  {/* Step number circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: `${step.color}30`, border: `3px solid ${step.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: fonts.mono, fontSize: 22, fontWeight: 800, color: step.color,
                    marginBottom: 12,
                    boxShadow: `0 0 20px ${step.color}30`,
                  }}>
                    {i + 1}
                  </div>

                  {/* Card — no emoji, typography-only identity */}
                  <div style={{
                    width: "100%", padding: "16px 14px",
                    background: "rgba(12, 35, 75, 0.75)", backdropFilter: "blur(20px)",
                    border: `2px solid ${step.color}50`, borderRadius: 16,
                    borderTop: `5px solid ${step.color}`,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 800, color: colors.white, textAlign: "center" }}>
                      {step.title}
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 17, color: step.color, textAlign: "center", fontWeight: 600 }}>
                      {step.subtitle}
                    </div>

                    {/* Mini wireframe preview */}
                    <div style={{
                      width: "100%", height: 50, marginTop: 4,
                      background: `${colors.white}04`, borderRadius: 6,
                      padding: "6px 8px", display: "flex", flexDirection: "column", gap: 3,
                      overflow: "hidden",
                    }}>
                      {i === 0 && [0.85, 0.7, 0.55].map((w, j) => (
                        <div key={j} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <div style={{ height: 3, width: 25, borderRadius: 1, background: `${colors.white}12` }} />
                          <div style={{ height: 3, flex: 1, borderRadius: 1, background: `${step.color}25`, maxWidth: `${w * 100}%` }} />
                        </div>
                      ))}
                      {i === 1 && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, height: "100%" }}>
                          {[1, 1, 0, 1, 0, 1].map((on, j) => (
                            <div key={j} style={{ borderRadius: 3, background: on ? `${step.color}20` : `${colors.white}06`, border: `1px solid ${on ? `${step.color}30` : `${colors.white}08`}` }} />
                          ))}
                        </div>
                      )}
                      {i === 2 && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${colors.ecgGreen}40` }} />
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {[0.8, 0.6].map((w, j) => (
                              <div key={j} style={{ height: 3, width: 40 * w, borderRadius: 1, background: `${colors.white}15` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {i === 3 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, height: "100%" }}>
                          <svg width={24} height={24}><circle cx={12} cy={12} r={10} fill="none" stroke={`${step.color}40`} strokeWidth={2} /><circle cx={12} cy={12} r={10} fill="none" stroke={step.color} strokeWidth={2} strokeDasharray={63} strokeDashoffset={63 * 0.13} strokeLinecap="round" transform="rotate(-90 12 12)" /></svg>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                            {[0.82, 0.91].map((w, j) => (
                              <div key={j} style={{ height: 3, borderRadius: 1, background: `${colors.white}08` }}><div style={{ height: "100%", width: `${w * 100}%`, borderRadius: 1, background: `${step.color}35` }} /></div>
                            ))}
                          </div>
                        </div>
                      )}
                      {i === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center", height: "100%" }}>
                          {[0.9, 0.7, 0.5].map((w, j) => (
                            <div key={j} style={{ height: 3, borderRadius: 1, background: `${colors.white}10`, width: `${w * 100}%` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow between cards */}
                {i < steps.length - 1 && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, opacity: arrowOp, marginTop: 30,
                  }}>
                    <svg width={36} height={24} viewBox="0 0 36 24">
                      <path d="M 0,12 L 26,12 M 19,5 L 29,12 L 19,19" fill="none" stroke={colors.oasis} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* Data-driven / scale row — "Each step connects seamlessly — data-driven, built to scale" */}
        {(() => {
          const rowHeaderOp = interpolate(frame, [215, 235], [0, 1], clamp);
          const pillars = [
            { label: "AI Case Authoring",    color: colors.arizonaRed  },
            { label: "Automated Scoring",    color: colors.azurite     },
            { label: "Competency Tracking",  color: colors.oasis       },
            { label: "Faculty Analytics",    color: colors.vitalsNormal },
            { label: "Instant Assignment",   color: colors.oasis       },
            { label: "Scalable Platform",    color: colors.arizonaRed  },
          ];
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 16, letterSpacing: 3.5,
                color: `${colors.white}50`, textTransform: "uppercase",
                opacity: rowHeaderOp,
              }}>
                Data-Driven · Built to Scale
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, justifyContent: "center" }}>
                {pillars.map((p, i) => {
                  const delay = 226 + i * 18;
                  const pOp = interpolate(frame, [delay, delay + 14], [0, 1], clamp);
                  return (
                    <div key={p.label} style={{
                      padding: "10px 24px", borderRadius: 10,
                      background: `${p.color}10`,
                      border: `2px solid ${p.color}45`,
                      opacity: pOp,
                    }}>
                      <span style={{
                        fontFamily: fonts.mono, fontSize: 16, fontWeight: 700,
                        color: `${colors.white}90`, letterSpacing: 0.8,
                      }}>{p.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Phase 2: Branding Close with title-slide-style animations (290-510) */}
      {brandingOpacity > 0 && (
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", opacity: brandingOpacity,
        }}>
          {/* Corner brackets — matching title slide */}
          {(() => {
            const sz = 60;
            const th = 2;
            const ins = 40;
            const corners = [
              { style: { top: ins, left: ins }, d: `M 0,${sz} L 0,0 L ${sz},0` },
              { style: { top: ins, right: ins }, d: `M 0,0 L ${sz},0 L ${sz},${sz}` },
              { style: { bottom: ins, left: ins }, d: `M 0,0 L 0,${sz} L ${sz},${sz}` },
              { style: { bottom: ins, right: ins }, d: `M ${sz},0 L ${sz},${sz} L 0,${sz}` },
            ];
            return corners.map((c, i) => (
              <svg key={i} style={{ position: "absolute", ...c.style }} width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
                <path d={c.d} fill="none" stroke={colors.oasis} strokeWidth={th} strokeLinecap="round" opacity={closeBracketGlow} strokeDasharray={sz * 2} strokeDashoffset={sz * 2 * (1 - closeBracketDraw)} />
              </svg>
            ));
          })()}

          {/* Side accent lines */}
          <div style={{ position: "absolute", top: 80, bottom: 80, left: 44, width: 3, background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}90, ${colors.oasis}00)`, opacity: closeSideOpacity * closeSidePulse }} />
          <div style={{ position: "absolute", top: 80, bottom: 80, right: 44, width: 3, background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}90, ${colors.oasis}00)`, opacity: closeSideOpacity * closeSidePulse }} />

          {/* Expanding rings */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${closeRing1Scale})`, width: 500, height: 500, borderRadius: "50%", border: `3px solid ${colors.oasis}`, opacity: closeRing1Opacity, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${closeRing2Scale})`, width: 700, height: 700, borderRadius: "50%", border: `3px solid ${colors.azurite}`, opacity: closeRing2Opacity, pointerEvents: "none" }} />

          {/* Centered content */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12, zIndex: 2,
          }}>
            <AnimatedBox delay={280} direction="scale">
              <div style={{
                background: `linear-gradient(135deg, ${colors.white}90, ${colors.white}60)`,
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                padding: "18px 36px",
                border: `1px solid ${colors.white}40`,
                boxShadow: `0 8px 32px ${colors.midnight}60, 0 0 40px ${colors.oasis}15, inset 0 1px 0 ${colors.white}40`,
              }}>
                <Img src={staticFile("screenshots/astec_logo.png")} style={{ height: 70, objectFit: "contain" }} />
              </div>
            </AnimatedBox>

            {/* Horizontal rule — matching title slide */}
            <div style={{
              width: interpolate(frame, [310, 335], [0, 200], clamp),
              height: 2,
              background: `linear-gradient(90deg, transparent, ${colors.arizonaRed}, transparent)`,
              borderRadius: 1,
            }} />

            <AnimatedBox delay={300} direction="up">
              <div style={{ color: colors.white, fontSize: 56, fontFamily: fonts.heading, fontWeight: 800, textAlign: "center", textShadow: `0 0 60px ${colors.oasis}30` }}>
                AI Medical Mentoring System
              </div>
            </AnimatedBox>
            <AnimatedBox delay={320} direction="up">
              <div style={{ color: colors.oasis, fontSize: 28, fontFamily: fonts.body, fontWeight: 600, textAlign: "center", letterSpacing: 2, maxWidth: 800, lineHeight: 1.5 }}>
                Case Creator &middot; Virtual Patient &middot; AIMS Reports
              </div>
            </AnimatedBox>
          </div>

          {/* Bottom data ticker */}
          <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, height: 24, overflow: "hidden", opacity: closeTickerOpacity }}>
            <div style={{
              position: "absolute", top: 0, left: 0, whiteSpace: "nowrap",
              transform: `translateX(${closeTickerScroll}px)`,
              fontFamily: fonts.mono, fontSize: 14, color: colors.oasis,
              letterSpacing: 2, lineHeight: "24px",
            }}>
              {"AIMMS v3.2   //   MEDICAL CASE CREATOR   //   VIRTUAL PATIENT   //   AIMS REPORTS   //   FACULTY DASHBOARD   //   AI-POWERED CASE AUTHORING   //   PROCEDURAL TRAINING   //   TEAM SIMULATION   //   IPE   //   ".repeat(3)}
            </div>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${colors.midnight}, transparent 15%, transparent 85%, ${colors.midnight})`, pointerEvents: "none" }} />
          </div>
        </div>
      )}
    </SceneShell>
  );
};
