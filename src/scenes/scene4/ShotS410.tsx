import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

const sections = [
  { key: "vitals", title: "Vital signs", line: "Continuous monitoring snapshot", accent: scene4Accent.caution },
  { key: "hx", title: "Interview", line: "Symptoms · history · context captured", accent: scene4Accent.product },
  { key: "exam", title: "Physical exam", line: "Auscultation · palpation · percussion", accent: scene4Accent.clinical },
  { key: "media", title: "Clinical media", line: "Case-linked audio · imaging · tags", accent: scene4Accent.interactive },
  { key: "ddx", title: "Differential", line: "Ranked working diagnoses", accent: scene4Accent.product },
  { key: "ap", title: "Assessment & plan", line: "Documentation · treatment · escalation", accent: scene4Accent.success },
] as const;

type Props = { shotFrame: number };

/** s4-10: global frames 1510–1689 → shotFrame 0–179 */
export const ShotS410: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 179);

  const ghostOp = interpolate(t, [0, 24], [1, 0], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghostX = interpolate(t, [0, 24], [0, 92], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const shellOp = interpolate(t, [6, 32], [0, 1], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pullScale = interpolate(t, [0, 42], [1.07, 1], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pullY = interpolate(t, [0, 38], [22, 0], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headerOp = interpolate(t, [10, 36], [0, 1], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerDim =
    t < 45
      ? 1
      : t < 115
        ? interpolate(t, [45, 58], [1, 0.88], { easing: easeInOut, extrapolateRight: "clamp" })
        : interpolate(t, [115, 128], [0.88, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  const rowOp = (i: number) =>
    interpolate(t, [46 + i * 10, 64 + i * 10], [0, 1], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const rowY = (i: number) =>
    interpolate(t, [46 + i * 10, 64 + i * 10], [12, 0], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const completeGlow = t < 115 ? 0.25 : 0.45 + 0.25 * Math.sin((t - 115) * 0.14);

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.82 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 76% 74% at 50% 44%, ${colors.arizonaBlue}16 0%, transparent 58%)`,
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
          <Scene4FocusPanel accent={`${scene4Accent.interactive}40`} maxWidth={400} style={{ padding: "16px 20px" }}>
            <div style={{ ...scene4Type.label, fontSize: 9, color: `${colors.white}48`, marginBottom: 6 }}>PRIOR · DOCUMENTATION</div>
            <div style={{ ...scene4Type.body, fontSize: 16, color: `${colors.white}6e` }}>Assessment & plan · consult pathway</div>
          </Scene4FocusPanel>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={980}>
          <div
            style={{
              width: "100%",
              padding: "3% 3% 4%",
              opacity: shellOp,
              transform: `translateY(${pullY}px) scale(${pullScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                borderRadius: scene4Radius.xl,
                padding: t >= 115 ? 3 : 2,
                background:
                  t >= 115
                    ? `linear-gradient(145deg, ${scene4Accent.success}22, ${scene4Accent.brand}12)`
                    : `linear-gradient(145deg, ${scene4Accent.brand}18, ${colors.white}06)`,
                boxShadow: `0 32px 88px rgba(0,0,0,0.52), 0 0 ${52 + completeGlow * 36}px ${scene4Accent.success}28`,
              }}
            >
              <Scene4FocusPanel accent={`${scene4Accent.brand}48`} maxWidth={976} style={{ padding: "32px 36px 36px" }}>
                <div style={{ opacity: headerOp * headerDim, marginBottom: scene4Space.gapMd, textAlign: "center" }}>
                  <div
                    style={{
                      ...scene4Type.hero,
                      fontSize: 40,
                      letterSpacing: 2.4,
                      lineHeight: 1.25,
                      color: t >= 115 ? `${colors.white}f8` : colors.white,
                      textShadow: t >= 115 ? `0 0 ${28 + completeGlow * 20}px ${scene4Accent.success}35` : "none",
                    }}
                  >
                    FULL RECORD · READY FOR REVIEW
                  </div>
                </div>

                <div
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${colors.white}18, transparent)`,
                    marginBottom: scene4Space.gapMd,
                    opacity: interpolate(t, [40, 55], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" }),
                  }}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sections.map((s, i) => (
                    <div
                      key={s.key}
                      style={{
                        opacity: rowOp(i),
                        transform: `translateY(${rowY(i)}px)`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "stretch",
                          gap: 0,
                          borderRadius: scene4Radius.md,
                          border: `1px solid ${colors.white}12`,
                          background: `linear-gradient(90deg, ${s.accent}10 0%, rgba(6,12,28,0.55) 42%)`,
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ width: 5, background: `${s.accent}88`, flexShrink: 0 }} />
                        <div style={{ flex: 1, padding: "18px 22px 20px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                          <div style={{ ...scene4Type.title, fontSize: 28, fontWeight: 800, minWidth: 200 }}>{s.title}</div>
                          <div style={{ ...scene4Type.body, fontSize: 21, color: `${colors.white}82`, textAlign: "right", flex: "1 1 280px" }}>{s.line}</div>
                        </div>
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
