import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

type Props = { shotFrame: number };

/** s4-11: global frames 1690–1874 → shotFrame 0–184 */
export const ShotS411: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 184);

  const ghostOp = interpolate(t, [0, 20], [1, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghostX = interpolate(t, [0, 20], [0, 80], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const press = interpolate(t, [12, 28], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnScale = interpolate(press, [0, 1], [1, 0.96], { easing: easeInOut });
  const btnGlow = interpolate(press, [0, 1], [0.35, 1], { easing: easeInOut });

  const submitOp = t <= 38 ? 1 : interpolate(t, [36, 50], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  const capturedOp =
    t < 40 ? 0 : t < 98 ? interpolate(t, [40, 58], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" }) : interpolate(t, [98, 110], [1, 0.22], { easing: easeInOut, extrapolateRight: "clamp" });

  const capturedScale =
    t < 40 ? 0.97 : t < 58 ? interpolate(t, [40, 58], [0.97, 1], { easing: easeInOut, extrapolateRight: "clamp" }) : 1;

  const evalOp = t < 100 ? 0 : interpolate(t, [100, 120], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });
  const evalY = t < 100 ? 14 : interpolate(t, [100, 120], [14, 0], { easing: easeInOut, extrapolateRight: "clamp" });
  const evalScale = t < 100 ? 0.98 : interpolate(t, [100, 120], [0.98, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  const readyPulse = t >= 105 ? 0.5 + 0.5 * Math.sin((t - 105) * 0.11) : 0.65;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.82 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 78% 76% at 50% 48%, ${colors.arizonaBlue}15 0%, transparent 58%)`,
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
            padding: "6% 6% 9%",
            opacity: ghostOp,
            transform: `translateX(${ghostX}px)`,
            transformOrigin: "center right",
          }}
        >
          <Scene4FocusPanel accent={`${scene4Accent.brand}38`} maxWidth={360} style={{ padding: "14px 18px" }}>
            <div style={{ ...scene4Type.label, fontSize: 9, color: `${colors.white}45` }}>ENCOUNTER RECORD</div>
            <div style={{ ...scene4Type.body, fontSize: 15, color: `${colors.white}62` }}>Consolidated · ready to finalize</div>
          </Scene4FocusPanel>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={820}>
          <div
            style={{
              width: "100%",
              minHeight: "78%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "5% 4%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: submitOp,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel
                accent={`${scene4Accent.product}70`}
                maxWidth={720}
                style={{
                  padding: "48px 56px",
                  textAlign: "center",
                  transform: `scale(${btnScale})`,
                  boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 ${40 + btnGlow * 48}px ${scene4Accent.productSoft}`,
                }}
              >
                <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 14, letterSpacing: 3 }}>FINALIZE</div>
                <div style={{ ...scene4Type.hero, fontSize: 52, letterSpacing: -0.2 }}>Submit encounter</div>
              </Scene4FocusPanel>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: capturedOp,
                transform: `scale(${capturedScale})`,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel
                accent={`${scene4Accent.success}66`}
                maxWidth={780}
                style={{
                  padding: "46px 52px",
                  textAlign: "center",
                  boxShadow: `0 28px 80px rgba(0,0,0,0.48), 0 0 56px ${scene4Accent.success}28`,
                }}
              >
                <div style={{ ...scene4Type.hero, fontSize: 48, lineHeight: 1.15, marginBottom: 14 }}>SESSION CAPTURED</div>
                <div style={{ ...scene4Type.data, fontSize: 28, color: `${colors.white}cc` }}>Saved · locked</div>
              </Scene4FocusPanel>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: evalOp,
                transform: `translateY(${evalY}px) scale(${evalScale})`,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel
                accent={`${scene4Accent.product}55`}
                maxWidth={800}
                style={{
                  padding: "44px 48px",
                  textAlign: "center",
                  boxShadow: `0 28px 80px rgba(0,0,0,0.45), 0 0 ${36 + readyPulse * 28}px ${scene4Accent.product}33`,
                }}
              >
                <div style={{ ...scene4Type.hero, fontSize: 44, lineHeight: 1.2, marginBottom: 18, letterSpacing: 1.8 }}>READY FOR EVALUATION</div>
                <div style={{ ...scene4Type.subtitle, fontSize: 26, color: `${colors.white}88` }}>Faculty review and scoring are next</div>
              </Scene4FocusPanel>
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
