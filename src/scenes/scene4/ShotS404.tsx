import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { clampPatientScale } from "./patientAnchor";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

const tools = [
  { name: "Stethoscope", sub: "Auscultation" },
  { name: "Palpation", sub: "Examination" },
  { name: "Percussion", sub: "Resonance" },
] as const;

type Props = { shotFrame: number };

/** s4-04: global frames 400–499 → shotFrame 0–99 */
export const ShotS404: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 99);

  const interviewGhostOp = interpolate(t, [0, 26], [1, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const interviewGhostX = interpolate(t, [0, 26], [0, 110], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const interviewGhostScale = interpolate(t, [0, 26], [1, 0.94], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const patientOpacity = interpolate(t, [0, 28], [0.92, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const patientScale = clampPatientScale(
    t < 28 ? interpolate(t, [0, 28], [1, 1.03], { easing: easeInOut, extrapolateRight: "clamp" }) : interpolate(t, [28, 48], [1.03, 1], { easing: easeInOut, extrapolateRight: "clamp" }),
  );

  const examHeaderOp = interpolate(t, [32, 50], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const examHeaderY = interpolate(t, [32, 50], [16, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const toolsShellOp = interpolate(t, [38, 56], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const toolsShellY = interpolate(t, [38, 56], [22, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const toolTile = (i: number) =>
    interpolate(t, [40 + i * 4, 54 + i * 4], [0, 1], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const inactiveBorder = `${scene4Accent.brand}22`;
  const inactiveBg = `${colors.white}06`;
  const inactiveText = `${colors.white}34`;
  const inactiveSub = `${colors.white}28`;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.78 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 65% 90% at 50% 48%, ${colors.arizonaBlue}16 0%, transparent 58%)`,
          }}
        />
      </AbsoluteFill>

      <Scene4ShotLayer>
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            zIndex: scene4Z.focal + 1,
            justifyContent: "center",
            alignItems: "flex-end",
            padding: "5% 5% 8%",
            opacity: interviewGhostOp,
            transform: `translateX(${interviewGhostX}px) scale(${interviewGhostScale})`,
            transformOrigin: "center right",
          }}
        >
          <div style={{ width: "min(38%, 420px)", display: "flex", flexDirection: "column", gap: scene4Space.gapSm }}>
            <Scene4FocusPanel accent={`${scene4Accent.product}44`} maxWidth={420} style={{ padding: "20px 22px" }}>
              <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 10, fontSize: 10 }}>CLINICAL INTERVIEW</div>
              <div style={{ ...scene4Type.body, fontSize: 18, color: `${colors.white}55`, lineHeight: 1.4 }}>
                What brings you in today?
              </div>
            </Scene4FocusPanel>
            <Scene4FocusPanel accent={`${scene4Accent.success}44`} maxWidth={420} style={{ padding: "16px 20px" }}>
              <div style={{ ...scene4Type.label, color: scene4Accent.success, marginBottom: 8, fontSize: 9 }}>CAPTURED</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Chief complaint", "HPI", "Associated symptoms"].map((x) => (
                  <span
                    key={x}
                    style={{
                      ...scene4Type.label,
                      fontSize: 8,
                      letterSpacing: 2,
                      padding: "6px 10px",
                      borderRadius: scene4Radius.sm,
                      border: `1px solid ${scene4Accent.success}35`,
                      color: `${colors.white}40`,
                    }}
                  >
                    {x}
                  </span>
                ))}
              </div>
            </Scene4FocusPanel>
          </div>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={1040}>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: scene4Space.gapMd,
              paddingTop: "2%",
              paddingBottom: "4%",
            }}
          >
            <div
              style={{
                width: "100%",
                textAlign: "center",
                opacity: examHeaderOp,
                transform: `translateY(${examHeaderY}px)`,
              }}
            >
              <div style={{ ...scene4Type.label, color: scene4Accent.clinical, marginBottom: 10 }}>EXAM MODE</div>
              <div style={{ ...scene4Type.hero, fontSize: 48, letterSpacing: -0.3 }}>Physical exam</div>
              <div style={{ ...scene4Type.subtitle, marginTop: 8, color: `${colors.white}62` }}>
                Hands-on examination workflow
              </div>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: 720,
                opacity: patientOpacity,
                transform: `scale(${patientScale})`,
                transformOrigin: "center center",
              }}
            >
              <div
                style={{
                  borderRadius: scene4Radius.xl,
                  border: `1px solid ${scene4Accent.product}30`,
                  padding: "3.5%",
                  background: `linear-gradient(165deg, rgba(8,18,38,0.75) 0%, rgba(4,10,24,0.5) 100%)`,
                  boxShadow: `0 28px 80px rgba(0,0,0,0.5), 0 0 72px ${scene4Accent.productSoft}`,
                }}
              >
                <Img
                  src={staticFile("patient-model.png")}
                  style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>

            <div
              style={{
                width: "100%",
                opacity: toolsShellOp,
                transform: `translateY(${toolsShellY}px)`,
              }}
            >
              <Scene4FocusPanel accent={`${scene4Accent.clinical}38`} maxWidth={980} style={{ padding: "24px 32px 28px" }}>
                <div style={{ ...scene4Type.label, color: `${colors.white}45`, marginBottom: 18, textAlign: "center" }}>
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
                  {tools.map((tool, i) => (
                    <div
                      key={tool.name}
                      style={{
                        flex: "1 1 200px",
                        maxWidth: 300,
                        minWidth: 180,
                        opacity: toolTile(i),
                        padding: "20px 22px",
                        borderRadius: scene4Radius.md,
                        border: `1px solid ${inactiveBorder}`,
                        background: inactiveBg,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ ...scene4Type.title, fontSize: 26, color: inactiveText, lineHeight: 1.25 }}>{tool.name}</div>
                      <div style={{ ...scene4Type.label, marginTop: 10, fontSize: 10, letterSpacing: 2.4, color: inactiveSub }}>
                        {tool.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </Scene4FocusPanel>
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
