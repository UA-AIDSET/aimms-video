import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

const planLines = ["Furosemide", "O₂ / I-O", "BMP"] as const;

type Props = { shotFrame: number };

/** s4-09: global frames 1350–1509 → shotFrame 0–159 */
export const ShotS409: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 159);

  const ghostOp = interpolate(t, [0, 22], [1, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghostX = interpolate(t, [0, 22], [0, 88], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shellOp = interpolate(t, [4, 22], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellY = interpolate(t, [4, 22], [18, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellScale = interpolate(t, [4, 22], [0.96, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerOp = interpolate(t, [8, 26], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const assessLabelOp = interpolate(t, [36, 48], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dxOp = interpolate(t, [42, 58], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reasonOp = interpolate(t, [52, 68], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const planHeadOp = interpolate(t, [76, 90], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const planLine = (i: number) =>
    interpolate(t, [82 + i * 14, 98 + i * 14], [0, 1], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const planY = (i: number) =>
    interpolate(t, [82 + i * 14, 98 + i * 14], [10, 0], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const consultOp = interpolate(t, [126, 144], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const consultY = interpolate(t, [126, 144], [12, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introDim = t < 35 ? 1 : interpolate(t, [35, 48], [1, 0.55], { easing: easeInOut, extrapolateRight: "clamp" });
  const assessDim = t < 35 ? 0.45 : t < 75 ? 1 : interpolate(t, [75, 88], [1, 0.62], { easing: easeInOut, extrapolateRight: "clamp" });
  const planDim = t < 75 ? 0.5 : t < 125 ? 1 : interpolate(t, [125, 138], [1, 0.58], { easing: easeInOut, extrapolateRight: "clamp" });
  const escDim = t < 125 ? 0.42 : 1;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.8 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 74% 76% at 50% 42%, ${colors.arizonaBlue}14 0%, transparent 58%)`,
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
            opacity: ghostOp,
            transform: `translateX(${ghostX}px)`,
            transformOrigin: "center right",
          }}
        >
          <Scene4FocusPanel accent={`${scene4Accent.brand}40`} maxWidth={420} style={{ padding: "16px 20px" }}>
            <div style={{ ...scene4Type.label, fontSize: 9, color: `${colors.white}45`, marginBottom: 6 }}>PRIOR · CLINICAL REASONING</div>
            <div style={{ ...scene4Type.body, fontSize: 16, color: `${colors.white}6e` }}>Differential · workup alignment</div>
          </Scene4FocusPanel>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={1000}>
          <div
            style={{
              width: "100%",
              padding: "3.5% 3% 4%",
              opacity: shellOp,
              transform: `translateY(${shellY}px) scale(${shellScale})`,
            }}
          >
            <div
              style={{
                borderRadius: scene4Radius.xl,
                padding: 2,
                background: `linear-gradient(145deg, ${scene4Accent.brand}22, ${colors.white}08)`,
                boxShadow: `0 28px 80px rgba(0,0,0,0.5), 0 0 60px ${scene4Accent.productSoft}`,
              }}
            >
              <Scene4FocusPanel accent={`${colors.white}14`} maxWidth={996} style={{ padding: "36px 40px 40px", background: "rgba(6,12,26,0.94)" }}>
                <div style={{ ...scene4Type.label, color: `${colors.white}4a`, marginBottom: 14, letterSpacing: 3 }}>CLINICAL DOCUMENTATION</div>

                <div style={{ opacity: headerOp * introDim, marginBottom: scene4Space.gapMd, textAlign: "center" }}>
                  <div style={{ ...scene4Type.hero, fontSize: 46, letterSpacing: -0.3 }}>Assessment & plan</div>
                </div>

                <div
                  style={{
                    marginBottom: scene4Space.gapMd,
                    padding: "22px 26px",
                    borderRadius: scene4Radius.md,
                    border: `1px solid ${scene4Accent.product}35`,
                    background: `${scene4Accent.product}08`,
                    opacity: assessDim,
                  }}
                >
                  <div style={{ opacity: assessLabelOp, marginBottom: 14 }}>
                    <div style={{ ...scene4Type.label, color: scene4Accent.product, letterSpacing: 3.2 }}>ASSESSMENT</div>
                  </div>
                  <div style={{ opacity: dxOp }}>
                    <div style={{ ...scene4Type.title, fontSize: 34, fontWeight: 800, lineHeight: 1.25 }}>
                      Acute decompensated heart failure (ADHF)
                    </div>
                  </div>
                  <div style={{ opacity: reasonOp, marginTop: 14 }}>
                    <div style={{ ...scene4Type.body, fontSize: 22, lineHeight: 1.45, color: `${colors.white}88` }}>
                      Volume overload; examination and targeted workup are consistent with ADHF as the working diagnosis.
                    </div>
                  </div>
                </div>

                <div style={{ opacity: planDim }}>
                  <div style={{ opacity: planHeadOp, marginBottom: 14 }}>
                    <div style={{ ...scene4Type.label, color: scene4Accent.interactive, letterSpacing: 3.2 }}>PLAN</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {planLines.map((line, idx) => (
                      <div
                        key={line}
                        style={{
                          opacity: planLine(idx),
                          transform: `translateY(${planY(idx)}px)`,
                        }}
                      >
                        <div
                          style={{
                            padding: "18px 22px",
                            borderRadius: scene4Radius.md,
                            border: `1px solid ${scene4Accent.interactive}38`,
                            background: `${scene4Accent.interactive}0a`,
                            borderLeft: `4px solid ${scene4Accent.interactive}66`,
                          }}
                        >
                          <div style={{ ...scene4Type.title, fontSize: 30, fontWeight: 700 }}>{line}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: scene4Space.gapMd,
                    opacity: consultOp * escDim,
                    transform: `translateY(${consultY}px)`,
                  }}
                >
                  <div
                    style={{
                      padding: "22px 26px",
                      borderRadius: scene4Radius.md,
                      border: `1px solid ${scene4Accent.caution}55`,
                      background: `linear-gradient(90deg, ${scene4Accent.caution}14 0%, ${scene4Accent.critical}0c 100%)`,
                      boxShadow: `0 0 ${28 + consultOp * 24}px ${scene4Accent.caution}28`,
                    }}
                  >
                    <div style={{ ...scene4Type.label, color: scene4Accent.caution, marginBottom: 8, letterSpacing: 2.8 }}>
                      CONSULT / REFERRAL · ESCALATION
                    </div>
                    <div style={{ ...scene4Type.title, fontSize: 34, fontWeight: 800, color: colors.white }}>Cardiology · urgent</div>
                  </div>
                </div>
              </Scene4FocusPanel>
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
