import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

const diagnoses = [
  { rank: 1, name: "ADHF", note: "Leading hypothesis", lead: true },
  { rank: 2, name: "Pneumonia", note: "Alternative", lead: false },
  { rank: 3, name: "PE", note: "Rule-out", lead: false },
] as const;

const tests = ["BNP / NT-proBNP", "Chest X-ray", "ECG 12-lead"] as const;

type Props = { shotFrame: number };

/** s4-08: global frames 1190–1349 → shotFrame 0–159 */
export const ShotS408: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 159);

  const ghostOp = interpolate(t, [0, 22], [1, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghostX = interpolate(t, [0, 22], [0, 90], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shellOp = interpolate(t, [4, 24], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellY = interpolate(t, [4, 24], [20, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellScale = interpolate(t, [4, 24], [0.96, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introTitleOp = interpolate(t, [8, 28], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dxLine = (i: number) =>
    interpolate(t, [36 + i * 18, 52 + i * 18], [0, 1], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const dxY = (i: number) =>
    interpolate(t, [36 + i * 18, 52 + i * 18], [14, 0], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const testsShellOp =
    t < 95 ? 0 : interpolate(t, [95, 112], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });
  const testsShellY = t < 95 ? 16 : interpolate(t, [95, 112], [16, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  const testLine = (i: number) =>
    t < 95
      ? 0
      : interpolate(t, [98 + i * 12, 114 + i * 12], [0, 1], {
          easing: easeInOut,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const linkOp = interpolate(t, [135, 152], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leadPulse = t >= 35 && t < 135 ? 0.5 + 0.5 * Math.sin((t - 35) * 0.12) : 0.75;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.8 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 72% 78% at 48% 44%, ${colors.arizonaBlue}15 0%, transparent 56%)`,
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
          <Scene4FocusPanel accent={`${scene4Accent.success}44`} maxWidth={400} style={{ padding: "18px 22px" }}>
            <div style={{ ...scene4Type.label, color: scene4Accent.success, fontSize: 9, marginBottom: 6 }}>CASE-LINKED SUMMARY</div>
            <div style={{ ...scene4Type.body, fontSize: 17, color: `${colors.white}7a` }}>Maria Santos · ADHF · VP-MS-07</div>
          </Scene4FocusPanel>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={980}>
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
                padding: linkOp > 0.15 ? 3 : 0,
                background: linkOp > 0.15 ? `${scene4Accent.success}06` : "transparent",
                boxShadow:
                  linkOp > 0.2
                    ? `0 0 ${20 + linkOp * 48}px ${scene4Accent.success}24, inset 0 0 0 1px ${scene4Accent.success}35`
                    : "none",
              }}
            >
              <Scene4FocusPanel accent={`${scene4Accent.brand}46`} maxWidth={980} style={{ padding: "36px 40px 40px" }}>
                <div style={{ opacity: introTitleOp, marginBottom: scene4Space.gapMd, textAlign: "center" }}>
                  <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 10 }}>CLINICAL REASONING</div>
                  <div style={{ ...scene4Type.hero, fontSize: 48, letterSpacing: -0.35 }}>Differential diagnosis</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: scene4Space.gapSm }}>
                  {diagnoses.map((d, i) => {
                    const op = dxLine(i);
                    const ty = dxY(i);
                    const glow = d.lead ? 32 + leadPulse * 22 : 0;
                    return (
                      <div
                        key={d.rank}
                        style={{
                          opacity: op,
                          transform: `translateY(${ty}px)`,
                        }}
                      >
                        <Scene4FocusPanel
                          accent={d.lead ? `${scene4Accent.product}70` : `${colors.white}18`}
                          maxWidth={980}
                          style={{
                            padding: d.lead ? "26px 28px 28px" : "20px 26px 22px",
                            background: d.lead ? `${scene4Accent.product}10` : undefined,
                            boxShadow: d.lead ? `0 0 ${glow}px ${scene4Accent.productSoft}` : undefined,
                          }}
                        >
                          <div
                            style={{
                              ...scene4Type.label,
                              fontSize: 11,
                              color: d.lead ? scene4Accent.product : `${colors.white}45`,
                              marginBottom: 8,
                              letterSpacing: 2.8,
                            }}
                          >
                            {d.lead ? `RANK ${d.rank} · LEADING` : `RANK ${d.rank}`}
                          </div>
                          <div
                            style={{
                              ...scene4Type.title,
                              fontSize: d.lead ? 40 : 32,
                              fontWeight: d.lead ? 800 : 700,
                              color: colors.white,
                            }}
                          >
                            {d.name}
                          </div>
                          <div style={{ ...scene4Type.body, fontSize: 18, marginTop: 6, color: `${colors.white}6a` }}>{d.note}</div>
                        </Scene4FocusPanel>
                      </div>
                    );
                  })}
                </div>

                {t >= 95 && (
                  <div
                    style={{
                      marginTop: scene4Space.gapMd,
                      paddingTop: scene4Space.gapMd,
                      borderTop: `1px solid ${linkOp > 0.25 ? `${scene4Accent.success}44` : `${colors.white}12`}`,
                      opacity: testsShellOp,
                      transform: `translateY(${testsShellY}px)`,
                    }}
                  >
                    <div style={{ ...scene4Type.label, color: scene4Accent.interactive, marginBottom: 16, textAlign: "center" }}>
                      TESTS ORDERED
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {tests.map((name, i) => (
                        <div key={name} style={{ opacity: testLine(i) }}>
                          <Scene4FocusPanel
                            accent={`${scene4Accent.interactive}50`}
                            maxWidth={980}
                            style={{
                              padding: "20px 26px",
                              borderColor: linkOp > 0.4 ? `${scene4Accent.success}38` : undefined,
                            }}
                          >
                            <div style={{ ...scene4Type.title, fontSize: 30, fontWeight: 700 }}>{name}</div>
                          </Scene4FocusPanel>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {t >= 135 && (
                  <div
                    style={{
                      marginTop: scene4Space.gapMd,
                      opacity: linkOp,
                      textAlign: "center",
                      padding: "14px 18px",
                      borderRadius: scene4Radius.md,
                      background: `${scene4Accent.success}0c`,
                      border: `1px solid ${scene4Accent.success}40`,
                    }}
                  >
                    <div style={{ ...scene4Type.label, color: scene4Accent.success, letterSpacing: 2.4 }}>
                      WORKUP ALIGNED WITH DIFFERENTIAL
                    </div>
                  </div>
                )}
              </Scene4FocusPanel>
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
