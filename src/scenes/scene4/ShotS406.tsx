import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent, scene4Radius, scene4Space, scene4Type, scene4Z } from "./designSystem";
import { Scene4Backdrop, Scene4CenterColumn, Scene4FocusPanel, Scene4ShotLayer } from "./Scene4Primitives";

const easeInOut = Easing.inOut(Easing.cubic);

type Props = { shotFrame: number };

const tiles = [
  {
    key: "heart",
    label: "Heart audio",
    kind: "audio" as const,
    accent: scene4Accent.caution,
    mono: "AUSC · S1/S2",
  },
  {
    key: "lung",
    label: "Lung audio",
    kind: "audio" as const,
    accent: scene4Accent.clinical,
    mono: "BREATH SOUNDS",
  },
  {
    key: "cxr",
    label: "CXR",
    kind: "imaging" as const,
    accent: scene4Accent.product,
    mono: "RADIOGRAPH",
  },
  {
    key: "tags",
    label: "Case library · tags",
    kind: "tags" as const,
    accent: scene4Accent.success,
    mono: "CONTROLLED VOCABULARY",
  },
] as const;

/** s4-06: global frames 770–889 → shotFrame 0–119 */
export const ShotS406: React.FC<Props> = ({ shotFrame }) => {
  const t = Math.min(Math.max(shotFrame, 0), 119);

  const ghostOp = interpolate(t, [0, 24], [1, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ghostX = interpolate(t, [0, 24], [0, 96], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const shellOp = interpolate(t, [6, 28], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellY = interpolate(t, [6, 28], [18, 0], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shellScale = interpolate(t, [6, 28], [0.97, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleOp = interpolate(t, [8, 30], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tileOp = (i: number) =>
    interpolate(t, [35 + i * 9, 52 + i * 9], [0, 1], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const tileY = (i: number) =>
    interpolate(t, [35 + i * 9, 52 + i * 9], [12, 0], {
      easing: easeInOut,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const mapOp = interpolate(t, [85, 102], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapGlow = interpolate(t, [85, 102], [0, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapScale = interpolate(t, [85, 102], [0.98, 1], {
    easing: easeInOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const gridDim = t >= 85 ? interpolate(t, [85, 98], [1, 0.88], { easing: easeInOut, extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill>
      <Scene4Backdrop />
      <AbsoluteFill style={{ zIndex: scene4Z.ambient, pointerEvents: "none" }}>
        <AbsoluteFill style={{ background: scene4.ambientWash, opacity: 0.8 }} />
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 70% 75% at 50% 42%, ${colors.arizonaBlue}18 0%, transparent 58%)`,
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
            padding: "6% 6% 10%",
            opacity: ghostOp,
            transform: `translateX(${ghostX}px)`,
            transformOrigin: "center right",
          }}
        >
          <Scene4FocusPanel accent={`${scene4Accent.product}55`} maxWidth={380} style={{ padding: "22px 26px" }}>
            <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 8, fontSize: 10 }}>PERCUSSION FINDING</div>
            <div style={{ ...scene4Type.title, fontSize: 28, color: `${colors.white}88` }}>Dull bases bilaterally</div>
          </Scene4FocusPanel>
        </AbsoluteFill>

        <Scene4CenterColumn maxWidth={1000}>
          <div
            style={{
              width: "100%",
              padding: `${scene4Space.gapSm}px 0 ${scene4Space.gapLg}px`,
              opacity: shellOp,
              transform: `translateY(${shellY}px) scale(${shellScale})`,
            }}
          >
            <Scene4FocusPanel accent={`${scene4Accent.brand}44`} maxWidth={1000} style={{ padding: "32px 40px 40px" }}>
              <div style={{ opacity: titleOp, marginBottom: scene4Space.gapMd, textAlign: "center" }}>
                <div style={{ ...scene4Type.label, color: scene4Accent.product, marginBottom: 12 }}>CURATED PATIENT LIBRARY</div>
                <div style={{ ...scene4Type.hero, fontSize: 46, letterSpacing: -0.4 }}>Curated patient library</div>
                <div style={{ ...scene4Type.subtitle, marginTop: 10, color: `${colors.white}6a` }}>
                  Audio, imaging, and tags — organized for this case
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: scene4Space.gapMd,
                  width: "100%",
                  opacity: gridDim,
                }}
              >
                {tiles.map((it, i) => {
                  const op = tileOp(i);
                  const ty = tileY(i);
                  return (
                    <div
                      key={it.key}
                      style={{
                        opacity: op,
                        transform: `translateY(${ty}px)`,
                      }}
                    >
                      <Scene4FocusPanel accent={`${it.accent}55`} maxWidth={520} style={{ padding: "28px 26px 30px", minHeight: 168 }}>
                        <div style={{ ...scene4Type.label, color: it.accent, marginBottom: 10, fontSize: 10 }}>{it.mono}</div>
                        <div style={{ ...scene4Type.title, fontSize: 30, lineHeight: 1.2, marginBottom: 14 }}>{it.label}</div>
                        {it.kind === "audio" && (
                          <svg width="100%" height="56" viewBox="0 0 400 56" style={{ display: "block" }}>
                            <polyline
                              fill="none"
                              stroke={it.accent}
                              strokeWidth={2.2}
                              strokeLinecap="round"
                              points={
                                it.key === "heart"
                                  ? "0,28 40,22 80,32 120,18 160,30 200,24 240,34 280,20 320,28 360,26 400,30"
                                  : "0,32 50,18 100,36 150,14 200,38 250,22 300,34 350,20 400,28"
                              }
                            />
                          </svg>
                        )}
                        {it.kind === "imaging" && (
                          <div
                            style={{
                              position: "relative",
                              height: 56,
                              borderRadius: scene4Radius.sm,
                              border: `1px solid ${it.accent}40`,
                              background: `linear-gradient(135deg, ${colors.arizonaBlue}35 0%, rgba(4,10,22,0.85) 100%)`,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 10,
                                border: `1px solid ${colors.white}18`,
                                borderRadius: 4,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                right: 12,
                                top: 10,
                                ...scene4Type.label,
                                fontSize: 9,
                                color: `${colors.white}55`,
                              }}
                            >
                              PA VIEW
                            </div>
                          </div>
                        )}
                        {it.kind === "tags" && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {["CHF", "SOB", "EDEMA"].map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  ...scene4Type.label,
                                  fontSize: 9,
                                  letterSpacing: 2,
                                  padding: "8px 12px",
                                  borderRadius: scene4Radius.pill,
                                  border: `1px solid ${it.accent}45`,
                                  background: `${it.accent}12`,
                                  color: `${colors.white}cc`,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Scene4FocusPanel>
                    </div>
                  );
                })}
              </div>

              {t >= 85 && (
                <div
                  style={{
                    marginTop: scene4Space.gapMd,
                    paddingTop: scene4Space.gapMd,
                    borderTop: `1px solid ${mapGlow > 0.2 ? `${scene4Accent.success}55` : `${colors.white}12`}`,
                    opacity: mapOp,
                    transform: `scale(${mapScale})`,
                    boxShadow:
                      mapGlow > 0.05
                        ? `0 0 ${24 + mapGlow * 40}px ${scene4Accent.success}22, inset 0 1px 0 ${scene4Accent.success}18`
                        : "none",
                    borderRadius: scene4Radius.md,
                    padding: "16px 20px",
                    background: `${scene4Accent.success}08`,
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <div style={{ ...scene4Type.label, color: scene4Accent.success, letterSpacing: 3 }}>CASE-LINKED LIBRARY</div>
                    <div
                      style={{
                        ...scene4Type.body,
                        fontSize: 19,
                        fontWeight: 600,
                        color: colors.white,
                        textAlign: "center",
                      }}
                    >
                      Assets mapped to this encounter — not generic stock
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                      {["AUDIO", "IMAGING", "TAGS"].map((x) => (
                        <span
                          key={x}
                          style={{
                            ...scene4Type.label,
                            fontSize: 9,
                            color: `${scene4Accent.success}dd`,
                            padding: "6px 12px",
                            borderRadius: scene4Radius.pill,
                            border: `1px solid ${scene4Accent.success}40`,
                          }}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Scene4FocusPanel>
          </div>
        </Scene4CenterColumn>
      </Scene4ShotLayer>
    </AbsoluteFill>
  );
};
