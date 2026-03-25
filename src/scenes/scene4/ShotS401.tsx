import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Type, scene4Z } from "./designSystem";
import { clampPatientScale } from "./patientAnchor";
import { Scene4Backdrop, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

type Props = { shotFrame: number };

const easeInOut = Easing.inOut(Easing.cubic);

/** s4-01: frames 0–119 only */
export const ShotS401: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 119);

  const p1Enter = interpolate(t, [0, 12], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacityEntrance = p1Enter;
  const cardY = 10 * (1 - p1Enter);
  const cardScaleAfterP1 = t <= 12 ? 0.96 + p1Enter * 0.04 : 1;

  const cardOpacityDissolve =
    t < 61
      ? 1
      : interpolate(t, [61, 88], [1, 0], {
          easing: easeInOut,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const cardOpacity = cardOpacityEntrance * cardOpacityDissolve;

  const cardScaleP3 =
    t < 61
      ? cardScaleAfterP1
      : interpolate(t, [61, 88], [1, 1.1], {
          easing: easeInOut,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const patientOpacity = interpolate(t, [63, 92], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const patientScale = clampPatientScale(
    t < 96
      ? 1
      : interpolate(t, [96, 119], [1, 1.03], {
          easing: easeInOut,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
  );

  const btnPressDepth =
    t >= 41 && t <= 60 ? Math.sin(((t - 41) / 19) * Math.PI) : 0;
  const btnScale = 1 - 0.04 * btnPressDepth;
  const btnGlow = btnPressDepth * 48;

  const showCard = cardOpacity > 0.004;
  const showPatient = patientOpacity > 0.004;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      {showPatient && (
        <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
          <AbsoluteFill
            style={{
              background: scene4.ambientWash,
              opacity: patientOpacity,
            }}
          />
          <AbsoluteFill
            style={{
              background: scene4.vignette,
              opacity: interpolate(t, [63, 119], [0, 0.85], {
                easing: easeInOut,
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        </AbsoluteFill>
      )}

      <Scene4ShotLayer>
        {showPatient && (
          <AbsoluteFill
            style={{
              zIndex: scene4Z.content,
              justifyContent: "center",
              alignItems: "center",
              opacity: patientOpacity,
            }}
          >
            <Img
              src={staticFile("patient-model.png")}
              style={{
                width: "88%",
                height: "88%",
                objectFit: "contain",
                transform: `scale(${patientScale})`,
              }}
            />
          </AbsoluteFill>
        )}

        {showCard && (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: scene4Z.focal,
              opacity: cardOpacity,
            }}
          >
            <div
              style={{
                width: "72%",
                maxWidth: 1200,
                transform: `translateY(${cardY}px) scale(${cardScaleP3})`,
              }}
            >
              <Scene4FocusPanel
                accent={`${scene4Accent.product}99`}
                maxWidth={1200}
                style={{
                  padding: "64px 72px",
                  borderRadius: scene4Radius.xl,
                  textAlign: "center",
                  background: `linear-gradient(160deg, ${colors.arizonaBlue}ee, #0a1428)`,
                  boxShadow: `0 0 80px ${scene4Accent.productSoft}`,
                }}
              >
                <div
                  style={{
                    ...scene4Type.label,
                    fontSize: 24,
                    color: `${colors.white}99`,
                    letterSpacing: 8,
                    marginBottom: 20,
                  }}
                >
                  AIMMS
                </div>
                <div style={{ ...scene4Type.hero, fontSize: 68 }}>Virtual Patient</div>
                <div
                  style={{
                    marginTop: 48,
                    display: "inline-block",
                    padding: "24px 72px",
                    borderRadius: scene4Radius.md,
                    fontFamily: scene4Type.title.fontFamily,
                    fontWeight: 800,
                    fontSize: 38,
                    color: colors.white,
                    background: `${scene4Accent.interactive}dd`,
                    border: `3px solid ${colors.white}44`,
                    transform: `scale(${btnScale})`,
                    boxShadow: `0 0 ${24 + btnGlow}px rgba(255,255,255,${0.12 + btnPressDepth * 0.22})`,
                  }}
                >
                  ENTER
                </div>
              </Scene4FocusPanel>
            </div>
          </AbsoluteFill>
        )}
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
