import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { clampPatientScale } from "./patientAnchor";
import { Scene4Backdrop, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

type Props = { shotFrame: number };

/** s4-03: global frames 260–399 → shotFrame 0–139 */
export const ShotS403: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 139);

  const vitalsGhostOp = interpolate(t, [0, 26], [1, 0.22], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vitalsGhostScale = interpolate(t, [0, 26], [1, 0.86], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const interviewShellOp = interpolate(t, [4, 24], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const interviewShellY = interpolate(t, [4, 24], [18, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const interviewShellScale = interpolate(t, [4, 24], [0.97, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const studentOp = interpolate(t, [30, 52], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const studentY = interpolate(t, [30, 52], [14, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const studentEmphasis =
    t >= 30 && t <= 69 ? interpolate(t, [30, 48, 69], [1.01, 1.02, 1], { easing: easeInOut }) : 1;

  const patientMsgOp = interpolate(t, [70, 92], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const patientMsgY = interpolate(t, [70, 92], [12, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const patientMsgEmphasis =
    t >= 70 && t <= 99 ? interpolate(t, [70, 85, 99], [1.02, 1.03, 1], { easing: easeInOut }) : 1;

  const capturedOp = interpolate(t, [100, 122], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const capturedY = interpolate(t, [100, 122], [10, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const studentReadback =
    t < 70 ? 1 : interpolate(t, [70, 88], [1, 0.62], { easing: easeInOut, extrapolateRight: "clamp" });
  const patientReadback =
    t < 100 ? 1 : interpolate(t, [100, 115], [1, 0.88], { easing: easeInOut, extrapolateRight: "clamp" });

  const anchorOpacity = interpolate(t, [0, 35], [0.92, 0.88], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const patientScale = clampPatientScale(interpolate(t, [0, 35], [1, 1.02], { easing: easeInOut, extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.75 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 55% 80% at 22% 48%, ${colors.arizonaBlue}14 0%, transparent 50%)`,
          }}
        />
      </AbsoluteFill>

      <Scene4ShotLayer style={{ display: "flex", flexDirection: "row", alignItems: "stretch", padding: "4% 4% 5%" }}>
        <div
          style={{
            width: "26%",
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: interviewShellOp,
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: scene4Radius.lg,
              border: `1px solid ${scene4Accent.product}28`,
              padding: "3%",
              background: `linear-gradient(160deg, rgba(8,16,36,0.72) 0%, rgba(4,8,20,0.45) 100%)`,
              boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 60px ${scene4Accent.productSoft}`,
            }}
          >
            <div style={{ ...scene4Type.label, marginBottom: 12, textAlign: "center", color: `${colors.white}48`, fontSize: 10 }}>
              ENCOUNTER CONTEXT
            </div>
            <div style={{ opacity: anchorOpacity, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Img
                src={staticFile("patient-model.png")}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  transform: `scale(${patientScale})`,
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "3%",
            minWidth: 0,
            gap: scene4Space.gapMd,
            opacity: interviewShellOp,
            transform: `translateY(${interviewShellY}px) scale(${interviewShellScale})`,
          }}
        >
          <div style={{ position: "relative", width: "100%", maxWidth: scene4Space.contentNarrow, alignSelf: "center" }}>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -8,
                width: "38%",
                minWidth: 200,
                opacity: vitalsGhostOp,
                transform: `scale(${vitalsGhostScale})`,
                transformOrigin: "top right",
                zIndex: 1,
              }}
            >
              <Scene4FocusPanel accent={`${scene4Accent.caution}55`} maxWidth={260} style={{ padding: "14px 16px" }}>
                <div style={{ ...scene4Type.label, fontSize: 9, color: scene4Accent.caution, marginBottom: 8 }}>VITALS</div>
                <div style={{ ...scene4Type.data, fontSize: 13 }}>HR 112 · BP 148/92 · SpO₂ 94%</div>
              </Scene4FocusPanel>
            </div>

            <Scene4FocusPanel
              accent={`${scene4Accent.product}55`}
              maxWidth={scene4Space.contentNarrow}
              style={{
                padding: "32px 36px 36px",
                width: "100%",
              }}
            >
              <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 18, letterSpacing: 4 }}>
                CLINICAL INTERVIEW
              </div>

              {t >= 30 && (
                <div
                  style={{
                    opacity: studentOp * studentReadback,
                    transform: `translateY(${studentY}px) scale(${studentEmphasis})`,
                    marginBottom: 22,
                  }}
                >
                  <div
                    style={{
                      ...scene4Type.label,
                      color: scene4Accent.product,
                      marginBottom: 12,
                      letterSpacing: 3,
                    }}
                  >
                    STUDENT
                  </div>
                  <div style={{ ...scene4Type.title, fontSize: 36, lineHeight: 1.38, color: colors.white }}>
                    What brings you in today?
                  </div>
                </div>
              )}

              {t >= 70 && (
                <div
                  style={{
                    opacity: patientMsgOp * patientReadback,
                    transform: `translateY(${patientMsgY}px) scale(${patientMsgEmphasis})`,
                    paddingTop: 8,
                    borderTop: `1px solid ${colors.white}10`,
                  }}
                >
                  <div
                    style={{
                      ...scene4Type.label,
                      color: scene4Accent.interactive,
                      marginBottom: 12,
                      letterSpacing: 3,
                    }}
                  >
                    PATIENT
                  </div>
                  <div style={{ ...scene4Type.subtitle, fontSize: 30, color: `${colors.white}f0`, lineHeight: 1.42 }}>
                    I&apos;ve had worsening shortness of breath over several days — with bilateral lower-extremity edema.
                  </div>
                </div>
              )}
            </Scene4FocusPanel>
          </div>

          {t >= 100 && (
            <div
              style={{
                width: "100%",
                maxWidth: scene4Space.contentNarrow,
                alignSelf: "center",
                opacity: capturedOp,
                transform: `translateY(${capturedY}px)`,
              }}
            >
              <Scene4FocusPanel accent={`${scene4Accent.success}66`} maxWidth={scene4Space.contentNarrow} style={{ padding: "22px 28px" }}>
                <div style={{ ...scene4Type.label, color: scene4Accent.success, marginBottom: 14 }}>CAPTURED FROM CONVERSATION</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {["Chief complaint", "HPI", "Associated symptoms"].map((label) => (
                    <div
                      key={label}
                      style={{
                        padding: "10px 18px",
                        borderRadius: scene4Radius.sm,
                        border: `1px solid ${scene4Accent.success}40`,
                        background: `${scene4Accent.success}10`,
                        ...scene4Type.body,
                        fontSize: 17,
                        fontWeight: 600,
                        color: colors.white,
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </Scene4FocusPanel>
            </div>
          )}
        </div>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
