import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

const tools = [
  { key: "steth", name: "Stethoscope", sub: "Auscultation" },
  { key: "palp", name: "Palpation", sub: "Examination" },
  { key: "perc", name: "Percussion", sub: "Resonance" },
] as const;

type Props = { shotFrame: number };

/** s4-05b: global frames 590–679 → shotFrame 0–89 */
export const ShotS405b: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 89);

  const accent = scene4Accent.interactive;

  const palpFocus = interpolate(t, [0, 20], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const palpLift = interpolate(t, [2, 22], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const palpGlow = 0.35 + palpFocus * 0.65;

  const inactiveToolOp =
    t < 25 ? 0.34 : interpolate(t, [25, 42], [0.34, 0.26], { easing: easeInOut, extrapolateRight: "clamp" });

  const contactT = interpolate(t, [26, 52], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const contactY = interpolate(contactT, [0, 1], [96, -6], { easing: easeInOut });
  const contactX = interpolate(contactT, [0, 1], [-14, 4], { easing: easeInOut });
  const contactOp = t < 24 ? 0 : interpolate(t, [24, 32], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });
  const contactScale = interpolate(contactT, [0, 1], [0.9, 1], { easing: easeInOut });
  const pressPulse = t >= 32 && t < 55 ? 0.55 + 0.45 * Math.sin((t - 32) * 0.35) : t >= 55 ? 0.75 : 0.6;

  const chromeDim =
    t < 25 ? 1 : t < 55 ? interpolate(t, [28, 48], [1, 0.78], { easing: easeInOut, extrapolateRight: "clamp" }) : 0.82;

  const findingOp = interpolate(t, [55, 72], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const examPanelHandoff = t < 50 ? 1 : interpolate(t, [50, 58], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });
  const examPanelOpacity = contactOp * examPanelHandoff;

  const toolRowDim = t >= 55 ? interpolate(t, [55, 68], [1, 0.72], { easing: easeInOut, extrapolateRight: "clamp" }) : 1;

  const inactiveBorder = `${scene4Accent.brand}20`;
  const inactiveBg = `${colors.white}05`;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.76 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 62% 88% at 50% 52%, ${colors.arizonaBlue}14 0%, transparent 56%)`,
          }}
        />
      </AbsoluteFill>

      <Scene4ShotLayer>
        <Scene4CenterColumn maxWidth={1020}>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: scene4Space.gapMd,
              paddingTop: "1.5%",
              paddingBottom: "3.5%",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 700,
                opacity: chromeDim,
              }}
            >
              <div
                style={{
                  borderRadius: scene4Radius.xl,
                  border: `1px solid ${scene4Accent.product}2e`,
                  padding: "3.2%",
                  background: `linear-gradient(165deg, rgba(8,18,38,0.76) 0%, rgba(4,10,24,0.48) 100%)`,
                  boxShadow: `0 26px 76px rgba(0,0,0,0.48), 0 0 64px ${scene4Accent.productSoft}`,
                }}
              >
                <Img
                  src={staticFile("patient-model.png")}
                  style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>

            {t >= 24 && (
              <div style={{ width: "100%", maxWidth: 900, opacity: examPanelOpacity }}>
                <Scene4FocusPanel accent={`${accent}44`} maxWidth={900} style={{ padding: "20px 24px 24px" }}>
                  <div style={{ ...scene4Type.label, color: `${accent}cc`, marginBottom: 12, textAlign: "center" }}>
                    PALPATION · CONTACT
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 200,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 200,
                        height: 160,
                        transform: `translate(${contactX}px, ${contactY}px) scale(${contactScale})`,
                        filter: `drop-shadow(0 0 ${10 + palpGlow * 12}px ${accent}66)`,
                      }}
                    >
                      <svg width="200" height="160" viewBox="0 0 200 160" style={{ display: "block" }}>
                        <ellipse
                          cx="100"
                          cy="118"
                          rx={44 + pressPulse * 4}
                          ry={18 + pressPulse * 3}
                          fill={`${accent}18`}
                          stroke={accent}
                          strokeWidth={1.8}
                          opacity={0.85}
                        />
                        <ellipse cx="100" cy="118" rx="28" ry="11" fill={`${accent}28`} opacity={0.6} />
                        <path
                          d="M78 42 C72 58 68 78 72 96 C76 108 88 112 100 108 C112 112 124 108 128 96 C132 78 128 58 122 42 C118 32 108 28 100 30 C92 28 82 32 78 42 Z"
                          fill="none"
                          stroke={accent}
                          strokeWidth={2.2}
                          strokeLinejoin="round"
                          opacity={0.88}
                        />
                        <path
                          d="M100 108 L100 118"
                          stroke={accent}
                          strokeWidth={2}
                          strokeLinecap="round"
                          opacity={0.5}
                        />
                      </svg>
                    </div>
                  </div>
                </Scene4FocusPanel>
              </div>
            )}

            {t >= 55 && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 960,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 900,
                    opacity: findingOp,
                  }}
                >
                  <Scene4FocusPanel accent={`${accent}66`} maxWidth={900} style={{ padding: "28px 36px 32px" }}>
                    <div style={{ ...scene4Type.label, color: accent, marginBottom: 8, textAlign: "center" }}>
                      PALPATION FINDING
                    </div>
                    <div style={{ ...scene4Type.hero, fontSize: 44, textAlign: "center", lineHeight: 1.18 }}>
                      2+ pitting edema, bilateral
                    </div>
                    <div style={{ ...scene4Type.subtitle, marginTop: 14, textAlign: "center", color: `${colors.white}6e` }}>
                      Lower extremity examination
                    </div>
                  </Scene4FocusPanel>
                </div>
              </div>
            )}

            <div style={{ width: "100%", opacity: toolRowDim, transform: `scale(${0.97 + 0.03 * toolRowDim})` }}>
              <Scene4FocusPanel accent={`${accent}30`} maxWidth={960} style={{ padding: "20px 28px 24px" }}>
                <div style={{ ...scene4Type.label, color: `${colors.white}42`, marginBottom: 16, textAlign: "center" }}>
                  EXAMINATION METHODS
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "stretch",
                    gap: scene4Space.gapMd,
                    flexWrap: "wrap",
                  }}
                >
                  {tools.map((tool) => {
                    const active = tool.key === "palp";
                    const op = active ? 1 : inactiveToolOp;
                    const lift = active ? 1 + palpLift * 0.045 : 1;
                    const border = active ? `${accent}55` : inactiveBorder;
                    const bg = active ? `${accent}12` : inactiveBg;
                    const shadow = active ? `0 12px 40px rgba(0,0,0,0.35), 0 0 ${28 + palpGlow * 24}px ${accent}44` : "none";
                    return (
                      <div
                        key={tool.key}
                        style={{
                          flex: "1 1 200px",
                          maxWidth: 300,
                          minWidth: 176,
                          opacity: op,
                          transform: `scale(${lift})`,
                          padding: "18px 20px",
                          borderRadius: scene4Radius.md,
                          border: `1px solid ${border}`,
                          background: bg,
                          boxShadow: shadow,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            ...scene4Type.title,
                            fontSize: 25,
                            lineHeight: 1.22,
                            color: active ? colors.white : `${colors.white}32`,
                          }}
                        >
                          {tool.name}
                        </div>
                        <div
                          style={{
                            ...scene4Type.label,
                            marginTop: 8,
                            fontSize: 10,
                            letterSpacing: 2.2,
                            color: active ? `${accent}cc` : `${colors.white}26`,
                          }}
                        >
                          {tool.sub}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Scene4FocusPanel>
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
