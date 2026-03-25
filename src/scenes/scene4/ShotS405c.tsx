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

/** s4-05c: global frames 680–769 → shotFrame 0–89 */
export const ShotS405c: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 89);

  const accent = scene4Accent.product;

  const percFocus = interpolate(t, [0, 20], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const percLift = interpolate(t, [2, 22], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const percGlow = 0.35 + percFocus * 0.65;

  const inactiveToolOp =
    t < 25 ? 0.34 : interpolate(t, [25, 42], [0.34, 0.26], { easing: easeInOut, extrapolateRight: "clamp" });

  const tapT = interpolate(t, [26, 52], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tapApproachY = interpolate(tapT, [0, 1], [72, 0], { easing: easeInOut });
  const tapOp = t < 24 ? 0 : interpolate(t, [24, 32], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });
  const tapScale = interpolate(tapT, [0, 1], [0.9, 1], { easing: easeInOut });
  const rippleA = t >= 32 && t < 55 ? 0.4 + 0.6 * (0.5 + 0.5 * Math.sin((t - 32) * 1.05)) : 0.55;

  const chromeDim =
    t < 25 ? 1 : t < 55 ? interpolate(t, [28, 48], [1, 0.78], { easing: easeInOut, extrapolateRight: "clamp" }) : 0.82;

  const findingOp = interpolate(t, [55, 72], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const examPanelHandoff = t < 50 ? 1 : interpolate(t, [50, 58], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });
  const examPanelOpacity = tapOp * examPanelHandoff;

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
            background: `radial-gradient(ellipse 62% 88% at 50% 44%, ${colors.arizonaBlue}14 0%, transparent 56%)`,
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
                    PERCUSSION · TAPPING
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 220,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 180,
                        height: 200,
                        transform: `translateY(${tapApproachY}px) scale(${tapScale})`,
                        filter: `drop-shadow(0 0 ${10 + percGlow * 14}px ${accent}55)`,
                      }}
                    >
                      <svg width="180" height="200" viewBox="0 0 180 200" style={{ display: "block" }}>
                        <circle
                          cx="90"
                          cy="118"
                          r={26 + rippleA * 6}
                          fill="none"
                          stroke={accent}
                          strokeWidth={1.4}
                          opacity={0.22 + rippleA * 0.2}
                        />
                        <circle
                          cx="90"
                          cy="118"
                          r={18 + rippleA * 4}
                          fill="none"
                          stroke={accent}
                          strokeWidth={1.6}
                          opacity={0.35 + rippleA * 0.25}
                        />
                        <ellipse cx="90" cy="118" rx="14" ry="10" fill={`${accent}14`} stroke={accent} strokeWidth={1.5} opacity={0.75} />
                        <rect
                          x="78"
                          y="48"
                          width="24"
                          height="52"
                          rx="6"
                          fill="none"
                          stroke={accent}
                          strokeWidth={2.2}
                          opacity={0.9}
                        />
                        <line x1="90" y1="100" x2="90" y2="108" stroke={accent} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
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
                      PERCUSSION FINDING
                    </div>
                    <div style={{ ...scene4Type.hero, fontSize: 44, textAlign: "center", lineHeight: 1.18 }}>
                      Dull bases bilaterally
                    </div>
                    <div style={{ ...scene4Type.subtitle, marginTop: 14, textAlign: "center", color: `${colors.white}6e` }}>
                      Chest wall · posterior examination
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
                    const active = tool.key === "perc";
                    const op = active ? 1 : inactiveToolOp;
                    const lift = active ? 1 + percLift * 0.045 : 1;
                    const border = active ? `${accent}55` : inactiveBorder;
                    const bg = active ? `${accent}12` : inactiveBg;
                    const shadow = active ? `0 12px 40px rgba(0,0,0,0.35), 0 0 ${28 + percGlow * 24}px ${accent}44` : "none";
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
