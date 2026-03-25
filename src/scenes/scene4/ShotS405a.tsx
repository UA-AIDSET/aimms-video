import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";
import { WaveformStrip } from "./WaveformStrip";

const easeInOut = Easing.inOut(Easing.cubic);

const tools = [
  { key: "steth", name: "Stethoscope", sub: "Auscultation" },
  { key: "palp", name: "Palpation", sub: "Examination" },
  { key: "perc", name: "Percussion", sub: "Resonance" },
] as const;

type Props = { shotFrame: number };

/** s4-05a: global frames 500–589 → shotFrame 0–89 */
export const ShotS405a: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 89);

  const stethFocus = interpolate(t, [0, 20], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stethLift = interpolate(t, [2, 22], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stethGlow = 0.35 + stethFocus * 0.65;

  const inactiveToolOp =
    t < 25 ? 0.34 : interpolate(t, [25, 42], [0.34, 0.26], { easing: easeInOut, extrapolateRight: "clamp" });

  const probeT = interpolate(t, [26, 52], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const probeY = interpolate(probeT, [0, 1], [118, -12], { easing: easeInOut });
  const probeX = interpolate(probeT, [0, 1], [8, 0], { easing: easeInOut });
  const probeOp = t < 24 ? 0 : interpolate(t, [24, 32], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });
  const probeScale = interpolate(probeT, [0, 1], [0.88, 1], { easing: easeInOut });

  const chromeDim =
    t < 25 ? 1 : t < 55 ? interpolate(t, [28, 48], [1, 0.78], { easing: easeInOut, extrapolateRight: "clamp" }) : 0.82;

  const findingOp = interpolate(t, [55, 72], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const examPanelHandoff = t < 50 ? 1 : interpolate(t, [50, 58], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });
  const examPanelOpacity = probeOp * examPanelHandoff;

  const toolRowDim = t >= 55 ? interpolate(t, [55, 68], [1, 0.72], { easing: easeInOut, extrapolateRight: "clamp" }) : 1;

  const clinical = scene4Accent.clinical;
  const inactiveBorder = `${scene4Accent.brand}20`;
  const inactiveBg = `${colors.white}05`;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.76 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 62% 88% at 50% 46%, ${colors.arizonaBlue}14 0%, transparent 56%)`,
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
                <Scene4FocusPanel accent={`${clinical}44`} maxWidth={900} style={{ padding: "20px 24px 24px" }}>
                  <div style={{ ...scene4Type.label, color: `${clinical}cc`, marginBottom: 12, textAlign: "center" }}>
                    AUSCULTATION · CHEST
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
                        width: 140,
                        height: 160,
                        transform: `translate(${probeX}px, ${probeY}px) scale(${probeScale})`,
                        filter: `drop-shadow(0 0 ${12 + stethGlow * 18}px ${clinical}88)`,
                      }}
                    >
                      <svg width="140" height="160" viewBox="0 0 140 160" style={{ display: "block" }}>
                        <path
                          d="M70 28 L52 48 L52 88 L70 108 L88 88 L88 48 Z"
                          fill="none"
                          stroke={clinical}
                          strokeWidth={2.2}
                          opacity={0.45}
                        />
                        <line x1="70" y1="108" x2="70" y2="132" stroke={clinical} strokeWidth={2.2} strokeLinecap="round" />
                        <circle cx="70" cy="144" r="16" fill="none" stroke={clinical} strokeWidth={2.8} />
                        <circle cx="70" cy="144" r="6" fill={`${clinical}35`} stroke="none" />
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
                  <Scene4FocusPanel accent={`${clinical}66`} maxWidth={900} style={{ padding: "26px 32px 30px" }}>
                    <div style={{ ...scene4Type.label, color: clinical, marginBottom: 14, textAlign: "center" }}>
                      HEART SOUND · LIVE TRACE
                    </div>
                    <div style={{ width: "100%", overflow: "hidden", display: "flex", justifyContent: "center" }}>
                      <WaveformStrip color={clinical} seed={shotFrame * 3} height={200} />
                    </div>
                    <div style={{ ...scene4Type.data, fontSize: 22, color: `${colors.white}7a`, marginTop: 12, textAlign: "center" }}>
                      Auscultation · real-time capture
                    </div>
                  </Scene4FocusPanel>
                </div>
              </div>
            )}

            <div style={{ width: "100%", opacity: toolRowDim, transform: `scale(${0.97 + 0.03 * toolRowDim})` }}>
              <Scene4FocusPanel accent={`${clinical}30`} maxWidth={960} style={{ padding: "20px 28px 24px" }}>
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
                    const active = tool.key === "steth";
                    const op = active ? 1 : inactiveToolOp;
                    const lift = active ? 1 + stethLift * 0.045 : 1;
                    const border = active ? `${clinical}55` : inactiveBorder;
                    const bg = active ? `${clinical}12` : inactiveBg;
                    const shadow = active ? `0 12px 40px rgba(0,0,0,0.35), 0 0 ${28 + stethGlow * 24}px ${clinical}44` : "none";
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
                            color: active ? `${clinical}cc` : `${colors.white}26`,
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
