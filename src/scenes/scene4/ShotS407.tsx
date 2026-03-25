import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

type Props = { shotFrame: number };

const PhonoWave: React.FC<{ color: string; frame: number; variant: "heart" | "lung"; height: number }> = ({
  color,
  frame,
  variant,
  height,
}) => {
  const w = 920;
  const pts: string[] = [];
  const step = 5;
  for (let x = 0; x <= w; x += step) {
    const phase = (x + frame * 6) * 0.022;
    let y = height / 2;
    if (variant === "heart") {
      const beat = Math.sin(phase * 0.85) * (height * 0.14);
      const dub = Math.max(0, Math.sin(phase * 2.1)) * (height * 0.2);
      const dx = ((x * 0.35 + frame * 2) % 180) - 40;
      const spike = Math.exp(-(dx * dx) / 400) * (height * 0.18);
      y += beat + dub + spike;
    } else {
      y += Math.sin(phase) * (height * 0.2) + Math.sin(phase * 3.2) * (height * 0.09) + Math.sin(phase * 0.35) * (height * 0.06);
    }
    pts.push(`${x},${y}`);
  }
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: "block", maxWidth: "100%" }} preserveAspectRatio="xMidYMid meet">
      <polyline fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" points={pts.join(" ")} />
    </svg>
  );
};

const CxrPlate: React.FC<{ accent: string; compact?: boolean }> = ({ accent, compact }) => (
  <div
    style={{
      width: "100%",
      aspectRatio: compact ? "4 / 3" : "1 / 1.05",
      borderRadius: scene4Radius.md,
      background: `radial-gradient(ellipse 70% 65% at 50% 38%, ${colors.arizonaBlue}42 0%, #060d16 48%, #03060c 100%)`,
      border: `1px solid ${accent}44`,
      boxShadow: `inset 0 0 ${compact ? 48 : 100}px rgba(0,0,0,0.65), 0 0 40px ${accent}18`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.12,
        background: `repeating-linear-gradient(-12deg, transparent, transparent 14px, ${colors.white}07 14px, ${colors.white}07 15px)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "48%",
        width: "62%",
        height: "58%",
        transform: "translate(-50%, -50%)",
        border: `1px solid ${colors.white}10`,
        borderRadius: "42% 42% 38% 38% / 48% 48% 42% 42%",
        opacity: 0.35,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "18%",
        width: "22%",
        height: "28%",
        transform: "translateX(-50%)",
        border: `1px solid ${colors.white}08`,
        borderRadius: 8,
        opacity: 0.25,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: compact ? 10 : 18,
        top: compact ? 8 : 14,
        ...scene4Type.label,
        fontSize: compact ? 7 : 8,
        color: `${colors.white}4a`,
      }}
    >
      P.A.
    </div>
  </div>
);

/** s4-07: global frames 890–1189 → shotFrame 0–299 */
export const ShotS407: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 299);

  const heartOp =
    t <= 14
      ? interpolate(t, [0, 14], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" })
      : t < 78
        ? 1
        : interpolate(t, [72, 82], [1, 0], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const heartScale =
    t <= 14 ? interpolate(t, [0, 14], [0.96, 1], { easing: easeInOut, extrapolateRight: "clamp" }) : t < 78 ? 1 : interpolate(t, [72, 82], [1, 0.97], { easing: easeInOut, extrapolateRight: "clamp" });

  const lungOp =
    t < 72
      ? 0
      : t < 84
        ? interpolate(t, [72, 84], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" })
        : t < 144
          ? 1
          : interpolate(t, [138, 152], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  const lungScale =
    t < 72
      ? 0.96
      : t < 84
        ? interpolate(t, [72, 84], [0.96, 1], { easing: easeInOut, extrapolateRight: "clamp" })
        : t < 144
          ? 1
          : interpolate(t, [138, 152], [1, 0.97], { easing: easeInOut, extrapolateRight: "clamp" });

  const cxrOp =
    t < 146
      ? 0
      : t < 162
        ? interpolate(t, [146, 162], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" })
        : t < 226
          ? 1
          : interpolate(t, [222, 238], [1, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  const cxrScale =
    t < 146
      ? 0.97
      : t < 162
        ? interpolate(t, [146, 162], [0.97, 1], { easing: easeInOut, extrapolateRight: "clamp" })
        : t < 226
          ? 1
          : interpolate(t, [222, 238], [1, 0.94], { easing: easeInOut, extrapolateRight: "clamp" });

  const groupOp =
    t < 222 ? 0 : interpolate(t, [222, 252], [0, 1], { easing: easeInOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const groupY = t < 222 ? 18 : interpolate(t, [222, 252], [18, 0], { easing: easeInOut, extrapolateRight: "clamp" });

  const groupScale = t < 222 ? 0.96 : interpolate(t, [222, 252], [0.96, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  const caseOp = t < 232 ? 0 : interpolate(t, [232, 268], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  const thumbStagger = (i: number) =>
    t < 225 ? 0 : interpolate(t, [225 + i * 10, 248 + i * 8], [0, 1], { easing: easeInOut, extrapolateRight: "clamp" });

  const h = scene4Accent.clinical;
  const u = scene4Accent.interactive;
  const p = scene4Accent.product;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.82 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 78% 70% at 50% 45%, ${colors.arizonaBlue}16 0%, transparent 58%)`,
          }}
        />
      </AbsoluteFill>

      <Scene4ShotLayer>
        <Scene4CenterColumn maxWidth={1040}>
          <div style={{ width: "100%", padding: "3% 3% 4%", position: "relative", minHeight: "88%" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: heartOp,
                transform: `scale(${heartScale})`,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel accent={`${h}70`} maxWidth={980} style={{ padding: "44px 48px 48px", width: "100%" }}>
                <div style={{ ...scene4Type.hero, fontSize: 52, textAlign: "center", marginBottom: 28, letterSpacing: -0.3 }}>HEART SOUNDS</div>
                <PhonoWave color={h} frame={t} variant="heart" height={280} />
                <div style={{ ...scene4Type.data, fontSize: 26, color: `${h}ee`, marginTop: 28, textAlign: "center" }}>
                  PHONOCARDIOGRAM · CASE-LINKED
                </div>
              </Scene4FocusPanel>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: lungOp,
                transform: `scale(${lungScale})`,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel accent={`${u}70`} maxWidth={980} style={{ padding: "44px 48px 48px", width: "100%" }}>
                <div style={{ ...scene4Type.hero, fontSize: 52, textAlign: "center", marginBottom: 28, letterSpacing: -0.3 }}>LUNG AUDIO</div>
                <PhonoWave color={u} frame={t + 40} variant="lung" height={280} />
                <div style={{ ...scene4Type.data, fontSize: 26, color: `${u}ee`, marginTop: 28, textAlign: "center" }}>
                  BREATH SOUNDS · CASE-LINKED
                </div>
              </Scene4FocusPanel>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: cxrOp,
                transform: `scale(${cxrScale})`,
                pointerEvents: "none",
              }}
            >
              <Scene4FocusPanel accent={`${p}72`} maxWidth={1000} style={{ padding: "40px 44px 44px", width: "100%" }}>
                <div style={{ ...scene4Type.hero, fontSize: 52, textAlign: "center", marginBottom: 24, letterSpacing: -0.2 }}>EXAMINATION IMAGE</div>
                <CxrPlate accent={p} />
                <div style={{ ...scene4Type.data, fontSize: 26, color: `${p}ee`, marginTop: 28, textAlign: "center" }}>
                  CHEST X-RAY · CASE ASSET
                </div>
              </Scene4FocusPanel>
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: groupOp,
                transform: `translateY(${groupY}px) scale(${groupScale})`,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: scene4Space.gapMd,
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", maxWidth: 920, opacity: caseOp, transform: `scale(${0.98 + 0.02 * caseOp})` }}>
                <Scene4FocusPanel accent={`${scene4Accent.success}66`} maxWidth={920} style={{ padding: "28px 36px 32px" }}>
                  <div style={{ ...scene4Type.label, color: scene4Accent.success, marginBottom: 12, textAlign: "center" }}>CASE PANEL</div>
                  <div style={{ ...scene4Type.hero, fontSize: 40, textAlign: "center", lineHeight: 1.2 }}>
                    Maria Santos · ADHF · VP-MS-07
                  </div>
                </Scene4FocusPanel>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: scene4Space.gapMd,
                  width: "100%",
                  maxWidth: 1000,
                }}
              >
                <div style={{ opacity: thumbStagger(0), transform: `translateY(${interpolate(thumbStagger(0), [0, 1], [10, 0])}px)` }}>
                  <Scene4FocusPanel accent={`${h}55`} maxWidth={360} style={{ padding: "22px 20px 24px" }}>
                    <div style={{ ...scene4Type.label, color: h, marginBottom: 10, fontSize: 10 }}>HEART SOUNDS</div>
                    <PhonoWave color={h} frame={t * 2} variant="heart" height={112} />
                  </Scene4FocusPanel>
                </div>
                <div style={{ opacity: thumbStagger(1), transform: `translateY(${interpolate(thumbStagger(1), [0, 1], [10, 0])}px)` }}>
                  <Scene4FocusPanel accent={`${u}55`} maxWidth={360} style={{ padding: "22px 20px 24px" }}>
                    <div style={{ ...scene4Type.label, color: u, marginBottom: 10, fontSize: 10 }}>LUNG AUDIO</div>
                    <PhonoWave color={u} frame={t * 2 + 30} variant="lung" height={112} />
                  </Scene4FocusPanel>
                </div>
                <div style={{ opacity: thumbStagger(2), transform: `translateY(${interpolate(thumbStagger(2), [0, 1], [10, 0])}px)` }}>
                  <Scene4FocusPanel accent={`${p}55`} maxWidth={360} style={{ padding: "16px 16px 18px" }}>
                    <div style={{ ...scene4Type.label, color: p, marginBottom: 10, fontSize: 10 }}>EXAMINATION IMAGE</div>
                    <CxrPlate accent={p} compact />
                  </Scene4FocusPanel>
                </div>
              </div>

              <div
                style={{
                  marginTop: 4,
                  width: "100%",
                  maxWidth: 1000,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${scene4Accent.success}55, transparent)`,
                  opacity: groupOp * 0.85,
                }}
              />
            </div>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
