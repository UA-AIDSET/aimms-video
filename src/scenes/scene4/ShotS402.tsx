import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Panel, scene4Radius, scene4Type, scene4Z } from "./designSystem";
import { clampPatientScale } from "./patientAnchor";
import { Scene4Backdrop, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const vitals = [
  { l: "HR", v: "112", u: "bpm" },
  { l: "BP", v: "148/92", u: "mmHg" },
  { l: "SpO₂", v: "94", u: "%" },
] as const;

const easeInOut = Easing.inOut(Easing.cubic);

type Props = { shotFrame: number };

/** s4-02: global frames 120–259 → shotFrame 0–139 */
export const ShotS402: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 139);

  const patientPush = clampPatientScale(
    interpolate(t, [0, 49], [1, 1.03], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const patientAnchorDim =
    t < 50
      ? 1
      : interpolate(t, [65, 100], [1, 0.9], {
          easing: easeInOut,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const vitalsReveal = interpolate(t, [50, 78], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vitalsScale = interpolate(t, [50, 78], [0.96, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vitalsSlide = interpolate(t, [50, 78], [44, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vitalsOpacity = interpolate(t, [50, 72], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const livePulse = t >= 90 ? 0.5 + 0.5 * Math.sin((t - 90) * 0.22) : 0;
  const panelGlow = 52 + livePulse * 28;
  const vitalsGlowAlpha = Math.round(40 + livePulse * 35).toString(16).padStart(2, "0");
  const liftShadow = scene4Panel.glassLift.boxShadow.replace(/\s+/g, " ").trim();

  const showVitalsChrome = vitalsOpacity > 0.008;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.85 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 70% 85% at 45% 50%, ${colors.arizonaBlue}12 0%, transparent 55%)`,
            opacity: 0.9,
          }}
        />
      </AbsoluteFill>

      <Scene4ShotLayer>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: interpolate(t, [0, 20], [0.35, 1], {
              easing: easeInOut,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div
            style={{
              position: "relative",
              width: "78%",
              maxWidth: 1100,
              aspectRatio: "3 / 4",
              borderRadius: scene4Radius.xl,
              border: `1px solid ${scene4Accent.product}22`,
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.04) inset,
                0 40px 100px rgba(0,0,0,0.35),
                0 0 80px ${scene4Accent.productSoft}
              `,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2%",
              background: `linear-gradient(165deg, rgba(8,16,32,0.5) 0%, rgba(4,8,18,0.25) 100%)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 10,
                borderRadius: scene4Radius.lg,
                border: `1px solid ${scene4Accent.product}14`,
                pointerEvents: "none",
              }}
            />
            <Img
              src={staticFile("patient-model.png")}
              style={{
                width: "92%",
                height: "92%",
                objectFit: "contain",
                transform: `scale(${patientPush})`,
                opacity: patientAnchorDim,
              }}
            />
          </div>
        </AbsoluteFill>

        {t >= 40 && (
          <AbsoluteFill
            style={{
              pointerEvents: "none",
              background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,${(vitalsReveal * 0.22).toFixed(3)}) 100%)`,
              opacity: interpolate(t, [40, 85], [0, 1], {
                easing: easeInOut,
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        )}

        {showVitalsChrome && (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "flex-end",
              paddingRight: "6%",
              paddingBottom: "8%",
              pointerEvents: "none",
              zIndex: scene4Z.focal,
            }}
          >
            <div
              style={{
                opacity: vitalsOpacity,
                transform: `translateX(${vitalsSlide}px) scale(${vitalsScale})`,
              }}
            >
              <Scene4FocusPanel
                accent={`${scene4Accent.caution}99`}
                maxWidth={580}
                style={{
                  padding: "40px 44px",
                  borderRadius: scene4Radius.lg,
                  boxShadow: `0 0 ${panelGlow}px ${scene4Accent.caution}${vitalsGlowAlpha}, ${liftShadow}`,
                }}
              >
                <div
                  style={{
                    ...scene4Type.label,
                    fontSize: 20,
                    color: scene4Accent.caution,
                    letterSpacing: 4,
                    marginBottom: 22,
                  }}
                >
                  REAL-TIME VITAL SIGNS
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 3,
                    borderRadius: 2,
                    marginBottom: 18,
                    background: `linear-gradient(90deg, ${scene4Accent.caution}55, transparent)`,
                    opacity: 0.45 + livePulse * 0.35,
                  }}
                />
                {vitals.map((row) => (
                  <div
                    key={row.l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 18,
                      borderBottom: `2px solid ${colors.white}18`,
                      paddingBottom: 16,
                    }}
                  >
                    <span style={{ ...scene4Type.body, fontSize: 32, color: `${colors.white}aa` }}>{row.l}</span>
                    <span
                      style={{
                        fontFamily: scene4Type.hero.fontFamily,
                        fontSize: 44,
                        fontWeight: 800,
                        color: colors.white,
                      }}
                    >
                      {row.v}
                      <span
                        style={{
                          fontSize: 22,
                          fontWeight: 600,
                          color: `${colors.white}88`,
                          marginLeft: 8,
                        }}
                      >
                        {row.u}
                      </span>
                    </span>
                  </div>
                ))}
              </Scene4FocusPanel>
            </div>
          </AbsoluteFill>
        )}
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
