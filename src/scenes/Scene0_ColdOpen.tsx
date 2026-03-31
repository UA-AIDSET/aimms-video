import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";

/**
 * Scene 0 — Cinematic ASTEC Opening
 * 660 frames @ 30fps = 22.0s
 *
 * BEAT 1  f  0–165   HSIB Establishing Shot (5.5s)
 *   f  0– 22  Fade in from black
 *   f 22– 58  Eyebrow: "University of Arizona Health Sciences"
 *   f 50– 86  Heading:  "Health Sciences Innovation Building"
 *   f 96–126  Tag:      "Home of ASTEC" pill
 *
 * BEAT 2  f148–360   ASTEC Identity Reveal (7.1s)
 *   f148–182  Building photo crossfades out, dark background rises (no text yet)
 *   f184–206  b2Op fades in; UA eyebrow slides in (f184–216)
 *   f194+     "ASTEC" spring entrance (on clean dark background)
 *   f234–268  Subtitle fades in
 *   f272–304  Tagline fades in
 *
 * BEAT 3  f344–640   Why ASTEC Matters (9.9s)
 *   f354–396  Card 1 enters: "State-of-the-art simulation"
 *   f372–414  Card 2 enters: "Interprofessional healthcare training"
 *   f390–432  Card 3 enters: "AI-driven educational innovation"
 *   f514–548  Closing tagline appears
 *
 * AUDIO   Starts f12 (0.4s)
 *   s0-01 ~3.4s → ends ~f114, covers Beat 1
 *   s0-02 ~9.3s → ends ~f393, covers Beat 2 into Beat 3
 *   s0-03 ~7.5s → ends ~f618, carries through Beat 3
 *
 * FADE    f640–660   Out to black
 *
 * LAYOUT (Beat 2):
 *   Clean vertical stack — no divider lines near the title.
 *   UA eyebrow → ASTEC (800w, 184px) → full-name subtitle → tagline.
 *   All centered, generous margins, no element overlaps.
 */

const CE = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eOut = Easing.out(Easing.cubic);
const eIO = Easing.inOut(Easing.cubic);

const B2S = 148;
const B2E = 360;
const B3S = 344;
const B3E = 640;

function ph(
  frame: number,
  inStart: number, inEnd: number,
  outStart: number, outEnd: number,
): number {
  const i = interpolate(frame, [inStart, inEnd], [0, 1], { ...CE, easing: eOut });
  const o = interpolate(frame, [outStart, outEnd], [1, 0], { ...CE, easing: eIO });
  return Math.min(i, o);
}

// ── SVG icons ────────────────────────────────────────────────────────────────

const SimIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={48} height={48} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={22} fill="none" stroke={`${color}38`} strokeWidth={2} />
    <circle cx={28} cy={28} r={22} fill="none" stroke={color} strokeWidth={2.5}
      strokeDasharray="18 52" strokeLinecap="round" />
    <circle cx={28} cy={15} r={6} fill={`${color}18`} stroke={`${color}75`} strokeWidth={2} />
    <path d="M 22 22 Q 28 20 34 22 L 32 41 Q 28 43 24 41 Z"
      fill={`${color}10`} stroke={`${color}50`} strokeWidth={1.5} />
    <circle cx={28} cy={28} r={3.5} fill={color} opacity={0.65} />
  </svg>
);

const EduIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={48} height={48} viewBox="0 0 56 56">
    <circle cx={28} cy={14} r={6} fill={`${color}18`} stroke={`${color}75`} strokeWidth={2} />
    <path d="M 22 22 Q 28 20 34 22 L 32 38 Q 28 40 24 38 Z"
      fill={`${color}12`} stroke={`${color}50`} strokeWidth={1.5} />
    <circle cx={10} cy={20} r={4.5} fill={`${color}12`} stroke={`${color}48`} strokeWidth={1.5} />
    <line x1={10} y1={24.5} x2={10} y2={36} stroke={`${color}38`} strokeWidth={3.5} strokeLinecap="round" />
    <circle cx={46} cy={20} r={4.5} fill={`${color}12`} stroke={`${color}48`} strokeWidth={1.5} />
    <line x1={46} y1={24.5} x2={46} y2={36} stroke={`${color}38`} strokeWidth={3.5} strokeLinecap="round" />
    <line x1={14} y1={22} x2={22} y2={22} stroke={`${color}28`} strokeWidth={1.5} strokeDasharray="3 3" />
    <line x1={34} y1={22} x2={42} y2={22} stroke={`${color}28`} strokeWidth={1.5} strokeDasharray="3 3" />
  </svg>
);

const AIIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width={48} height={48} viewBox="0 0 56 56">
    <circle cx={28} cy={28} r={7} fill={`${color}22`} stroke={color} strokeWidth={2} />
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const nx = 28 + 18 * Math.cos(rad);
      const ny = 28 + 18 * Math.sin(rad);
      return (
        <g key={i}>
          <line x1={28} y1={28} x2={nx} y2={ny} stroke={`${color}32`} strokeWidth={1.5} />
          <circle cx={nx} cy={ny} r={3.5} fill={`${color}18`} stroke={`${color}58`} strokeWidth={1.5} />
        </g>
      );
    })}
  </svg>
);

// ── Pillar data ──────────────────────────────────────────────────────────────

const PILLARS = [
  {
    headline: "State-of-the-art simulation",
    caption: "Full-spectrum clinical environments",
    color: colors.oasis,
    Icon: SimIcon,
  },
  {
    headline: "Interprofessional healthcare training",
    caption: "All UA Health Sciences colleges",
    color: colors.vitalsNormal,
    Icon: EduIcon,
  },
  {
    headline: "AI-driven educational innovation",
    caption: "The AIDSET division of ASTEC",
    color: "#48CAE4",
    Icon: AIIcon,
  },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export const Scene0_ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global fade in / out
  const masterFadeIn = interpolate(frame, [0, 22], [0, 1], CE);
  const masterFadeOut = interpolate(frame, [640, 660], [1, 0], { ...CE, easing: eIO });
  const master = Math.min(masterFadeIn, masterFadeOut);

  // ── Beat 1 — HSIB establishing ────────────────────────────────────────────
  const kbScale = interpolate(frame, [0, 165], [1.0, 1.12], CE);
  const kbY = interpolate(frame, [0, 165], [0, -28], CE);
  const overlayBase = interpolate(frame, [0, 60, 140, 165], [0.52, 0.44, 0.50, 0.78], CE);

  // Photo fades out as Beat 2 rises
  const buildingOp = interpolate(frame, [B2S, B2S + 34], [1, 0], { ...CE, easing: eIO });

  // Beat 1 text
  const eyebrowOp = ph(frame, 22, 58, 125, 150);
  const eyebrowY = interpolate(frame, [22, 58], [14, 0], { ...CE, easing: eOut });

  const headingOp = ph(frame, 50, 86, 125, 150);
  const headingY = interpolate(frame, [50, 86], [18, 0], { ...CE, easing: eOut });

  const tagOp = ph(frame, 96, 126, 125, 150);
  const tagX = interpolate(frame, [96, 126], [-16, 0], { ...CE, easing: eOut });

  // ── Beat 2 — ASTEC identity ───────────────────────────────────────────────
  // All Beat 2 content is offset +36 frames so it only appears AFTER the
  // building photo is fully gone (buildingOp reaches 0 at B2S+34 = f182).
  // This prevents any photo element (e.g. UA red branding) from bleeding
  // through the ASTEC text during the crossfade.
  const b2Op = ph(frame, B2S + 36, B2S + 58, B2E - 22, B2E);

  // UA eyebrow — fades in with the container
  const uaEyebrowOp = interpolate(frame, [B2S + 36, B2S + 68, B2E - 22, B2E], [0, 1, 1, 0], CE);
  const uaEyebrowY = interpolate(frame, [B2S + 36, B2S + 68], [14, 0], { ...CE, easing: eOut });

  // ASTEC title spring — starts after eyebrow, on the clean dark background
  const astecSp = spring({ frame: frame - B2S - 46, fps, config: { damping: 22, stiffness: 75, mass: 1 } });
  const astecOp = interpolate(astecSp, [0, 1], [0, 1]);
  const astecScale = interpolate(astecSp, [0, 1], [0.92, 1]);

  // Subtitle — enters after ASTEC is fully visible
  const subtitleOp = interpolate(frame, [B2S + 86, B2S + 120, B2E - 22, B2E], [0, 1, 1, 0], CE);
  const subtitleY = interpolate(frame, [B2S + 86, B2S + 120], [16, 0], { ...CE, easing: eOut });

  // Tagline — enters last
  const taglineOp = interpolate(frame, [B2S + 124, B2S + 156, B2E - 22, B2E], [0, 1, 1, 0], CE);
  const taglineY = interpolate(frame, [B2S + 96, B2S + 128], [12, 0], { ...CE, easing: eOut });

  // ── Beat 3 — Why ASTEC matters ────────────────────────────────────────────
  const b3Op = ph(frame, B3S, B3S + 24, B3E - 18, B3E);

  const cardOps = ([0, 18, 36] as const).map(offset =>
    interpolate(frame, [B3S + 10 + offset, B3S + 52 + offset], [0, 1], { ...CE, easing: eOut })
  );
  const cardYs = ([0, 18, 36] as const).map(offset =>
    interpolate(frame, [B3S + 10 + offset, B3S + 52 + offset], [22, 0], { ...CE, easing: eOut })
  );

  const closingOp = interpolate(frame, [B3S + 170, B3S + 204, B3E - 18, B3E], [0, 1, 1, 0], CE);
  const closingY = interpolate(frame, [B3S + 170, B3S + 204], [12, 0], { ...CE, easing: eOut });

  const LB = 58;

  return (
    <AbsoluteFill style={{ opacity: master, overflow: "hidden", background: "#000" }}>

      {/* ── Building photo (Beat 1 + crossfade into Beat 2) ── */}
      <AbsoluteFill style={{ opacity: Math.max(0, buildingOp), overflow: "hidden" }}>
        <Img
          src={staticFile("screenshots/astec_exterior.png")}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 40%",
            transform: `scale(${kbScale}) translateY(${kbY}px)`,
            transformOrigin: "50% 45%",
            filter: "saturate(0.78) brightness(0.88)",
          }}
        />
      </AbsoluteFill>

      {/* Cinematic gradient overlay (Beat 1) */}
      <AbsoluteFill style={{
        background: `
          linear-gradient(
            180deg,
            rgba(0,0,0,0.20) 0%,
            rgba(0,0,0,0.04) 28%,
            rgba(0,0,0,0.38) 62%,
            rgba(0,0,0,0.86) 100%
          )
        `,
        opacity: overlayBase * buildingOp,
      }} />

      {/* Dark background (Beat 2 & 3) */}
      <AbsoluteFill style={{
        background: `
          radial-gradient(ellipse at 50% 48%, ${colors.azurite}1A, transparent 64%),
          linear-gradient(160deg, ${colors.midnight} 0%, ${colors.arizonaBlue} 55%, ${colors.azurite}44 100%)
        `,
        opacity: Math.max(0, 1 - buildingOp),
      }} />

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: LB, background: "#000", zIndex: 20 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: LB, background: "#000", zIndex: 20 }} />

      {/* ═══════════════════════════════════════════════════════════
          BEAT 1 — HSIB Establishing Shot (f0–165)
         ═══════════════════════════════════════════════════════════ */}
      {buildingOp > 0.01 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, opacity: buildingOp }}>

          {/* Eyebrow */}
          {eyebrowOp > 0.01 && (
            <div style={{
              position: "absolute", bottom: LB + 152, left: 88,
              opacity: eyebrowOp,
              transform: `translateY(${eyebrowY}px)`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 4, height: 26,
                background: colors.oasis,
                borderRadius: 2, flexShrink: 0,
                boxShadow: `0 0 12px ${colors.oasis}70`,
              }} />
              <span style={{
                fontFamily: fonts.mono,
                fontSize: 22,
                fontWeight: 500,
                color: colors.oasis,
                letterSpacing: 3.5,
                textTransform: "uppercase",
                textShadow: "0 1px 22px rgba(0,0,0,0.8)",
              }}>
                University of Arizona Health Sciences
              </span>
            </div>
          )}

          {/* Main heading */}
          {headingOp > 0.01 && (
            <div style={{
              position: "absolute", bottom: LB + 66, left: 88,
              opacity: headingOp,
              transform: `translateY(${headingY}px)`,
            }}>
              <span style={{
                fontFamily: fonts.heading,
                fontSize: 74,
                fontWeight: 800,
                color: colors.white,
                letterSpacing: -1.5,
                lineHeight: 1.05,
                textShadow: "0 2px 40px rgba(0,0,0,0.75)",
                display: "block",
              }}>
                Health Sciences<br />Innovation Building
              </span>
            </div>
          )}

          {/* "Home of ASTEC" pill */}
          {tagOp > 0.01 && (
            <div style={{
              position: "absolute", bottom: LB + 20, left: 88,
              opacity: tagOp,
              transform: `translateX(${tagX}px)`,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(55,141,189,0.14)",
                border: `2px solid ${colors.oasis}50`,
                borderRadius: 7,
                padding: "8px 22px",
                backdropFilter: "blur(8px)",
              }}>
                <span style={{
                  fontFamily: fonts.heading,
                  fontSize: 26,
                  fontWeight: 600,
                  color: colors.oasis,
                  letterSpacing: 0.8,
                  textShadow: "0 1px 14px rgba(0,0,0,0.6)",
                }}>
                  Home of ASTEC
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          BEAT 2 — ASTEC Identity Reveal (f148–360)
          Clean vertical stack: UA eyebrow → ASTEC → subtitle → tagline.
          No decorative lines near the title.
         ═══════════════════════════════════════════════════════════ */}
      {b2Op > 0.01 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 15,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: `${LB + 20}px 120px`,
          opacity: b2Op,
        }}>

          {/* UA Health Sciences eyebrow */}
          <div style={{
            opacity: uaEyebrowOp,
            transform: `translateY(${uaEyebrowY}px)`,
            marginBottom: 40,
          }}>
            <span style={{
              fontFamily: fonts.mono,
              fontSize: 20,
              fontWeight: 500,
              color: "rgba(255,255,255,0.48)",
              letterSpacing: 4.5,
              textTransform: "uppercase",
              textAlign: "center",
              display: "block",
              textShadow: "0 1px 16px rgba(0,0,0,0.60)",
            }}>
              University of Arizona Health Sciences
            </span>
          </div>

          {/* ASTEC hero title */}
          <div style={{
            opacity: astecOp,
            transform: `scale(${astecScale})`,
            marginBottom: 48,
          }}>
            <h1 style={{
              fontFamily: fonts.heading,
              fontSize: 184,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: -6,
              lineHeight: 1,
              margin: 0,
              padding: 0,
              textAlign: "center",
              textShadow: `
                0 0 140px ${colors.oasis}18,
                0 4px 72px rgba(0,0,0,0.70)
              `,
            }}>
              ASTEC
            </h1>
          </div>

          {/* Full name subtitle */}
          {subtitleOp > 0.01 && (
            <div style={{
              opacity: subtitleOp,
              transform: `translateY(${subtitleY}px)`,
              marginBottom: 30,
            }}>
              <p style={{
                fontFamily: fonts.heading,
                fontSize: 36,
                fontWeight: 600,
                color: colors.oasis,
                letterSpacing: 0.5,
                margin: 0,
                textAlign: "center",
                lineHeight: 1.25,
                textShadow: "0 2px 28px rgba(0,0,0,0.65)",
              }}>
                Arizona Simulation Technology &amp; Education Center
              </p>
            </div>
          )}

          {/* Tagline */}
          {taglineOp > 0.01 && (
            <div style={{
              opacity: taglineOp,
              transform: `translateY(${taglineY}px)`,
            }}>
              <p style={{
                fontFamily: fonts.body,
                fontSize: 24,
                fontWeight: 400,
                color: "rgba(255,255,255,0.50)",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.55,
                maxWidth: 780,
                textShadow: "0 1px 14px rgba(0,0,0,0.55)",
              }}>
                Advancing healthcare education through simulation, innovation, and applied technology.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          BEAT 3 — Why ASTEC Matters (f344–640)
         ═══════════════════════════════════════════════════════════ */}
      {b3Op > 0.01 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 15,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: `${LB + 24}px 80px`,
          opacity: b3Op,
        }}>

          {/* Three pillar cards */}
          <div style={{
            display: "flex", gap: 28,
            width: "100%", maxWidth: 1520,
            marginBottom: 52,
          }}>
            {PILLARS.map((p, i) => (
              <div key={i} style={{
                flex: 1,
                opacity: cardOps[i],
                transform: `translateY(${cardYs[i]}px)`,
              }}>
                <div style={{
                  padding: "38px 36px 42px",
                  background: "rgba(4,10,40,0.84)",
                  backdropFilter: "blur(28px)",
                  borderRadius: 18,
                  border: `2px solid ${p.color}25`,
                  borderTop: `4px solid ${p.color}`,
                  boxShadow: `0 0 56px ${p.color}10, 0 22px 64px rgba(0,0,0,0.52)`,
                  display: "flex", flexDirection: "column", gap: 22,
                  minHeight: 230,
                }}>
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: 14,
                    background: `${p.color}0E`,
                    border: `2px solid ${p.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <p.Icon color={p.color} />
                  </div>

                  <div style={{
                    fontFamily: fonts.heading,
                    fontSize: 34,
                    fontWeight: 800,
                    color: colors.white,
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                  }}>
                    {p.headline}
                  </div>

                  <div style={{
                    fontFamily: fonts.body,
                    fontSize: 20,
                    color: p.color,
                    opacity: 0.82,
                    letterSpacing: 0.2,
                  }}>
                    {p.caption}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing tagline */}
          {closingOp > 0.01 && (
            <div style={{
              opacity: closingOp,
              transform: `translateY(${closingY}px)`,
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: fonts.heading,
                fontSize: 38,
                fontWeight: 700,
                color: colors.white,
                margin: 0,
                letterSpacing: -0.4,
                lineHeight: 1.2,
              }}>
                Preparing safer, smarter, more capable healthcare professionals.
              </p>
            </div>
          )}
        </div>
      )}

    </AbsoluteFill>
  );
};
