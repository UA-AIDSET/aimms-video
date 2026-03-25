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

/* ═══════════════════════════════════════════════════════════════════════
   SCENE 0 — ASTEC BUILDING REVEAL  (330 frames · 11s @ 30fps)

   BEAT A  f  0– 55   Wide establishing shot — building fades in, vignette settles
   BEAT B  f 50–165   "ASTEC" label + full name type on, slow Ken Burns zoom begins
   BEAT C  f155–255   Three stat pills appear staggered (students / specialties / years)
   BEAT D  f240–330   Narration close — fade to black
   ═══════════════════════════════════════════════════════════════════════ */

const CE = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eIO  = Easing.inOut(Easing.cubic);
const eOut = Easing.out(Easing.cubic);

const STATS = [
  { value: "1,200+", label: "Health Professionals Trained Annually" },
  { value: "50+",    label: "Medical Specialties Covered"           },
  { value: "20+",    label: "Years of Simulation Excellence"        },
] as const;

export const Scene0_ASTEC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ── Global fade-in / fade-out ───────────────────────────── */
  const fadeIn  = interpolate(frame, [0, 28], [0, 1], { ...CE, easing: eOut });
  const fadeOut = interpolate(frame, [288, 330], [1, 0], { ...CE, easing: Easing.in(Easing.cubic) });
  const masterOp = Math.min(fadeIn, fadeOut);

  /* ── Ken Burns zoom: 1.0 → 1.14 across full scene ───────── */
  const zoom = interpolate(frame, [0, 330], [1.0, 1.14], { ...CE, easing: eIO });

  /* ── Subtle drift: slightly pan up as we zoom ────────────── */
  const panY = interpolate(frame, [0, 330], [0, -2.2], { ...CE, easing: eIO });

  /* ── Warm cinematic grade overlay ────────────────────────── */
  const gradeOp = interpolate(frame, [0, 40], [0, 1], CE);

  /* ── "ASTEC" badge ───────────────────────────────────────── */
  const badgeSp = spring({ frame: frame - 50, fps, config: { damping: 24, stiffness: 80, mass: 1.0 } });
  const badgeOp  = interpolate(badgeSp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
  const badgeY   = interpolate(badgeSp, [0, 1], [20, 0], { extrapolateRight: "clamp" as const });

  /* ── Full name slides up ─────────────────────────────────── */
  const nameSp = spring({ frame: frame - 80, fps, config: { damping: 26, stiffness: 72, mass: 1.1 } });
  const nameOp  = interpolate(nameSp, [0, 1], [0, 1], { extrapolateRight: "clamp" as const });
  const nameY   = interpolate(nameSp, [0, 1], [18, 0], { extrapolateRight: "clamp" as const });

  /* ── Divider rule draws out ──────────────────────────────── */
  const ruleW = interpolate(frame, [95, 145], [0, 320], { ...CE, easing: eOut });

  /* ── UA badge fades in ───────────────────────────────────── */
  const uaOp = interpolate(frame, [110, 140], [0, 1], { ...CE, easing: eOut });

  /* ── Stat pills ─────────────────────────────────────────── */
  const statOps = STATS.map((_, i) =>
    interpolate(frame, [155 + i * 28, 185 + i * 28], [0, 1], { ...CE, easing: eOut })
  );
  const statScales = STATS.map((_, i) =>
    interpolate(frame, [155 + i * 28, 185 + i * 28], [0.82, 1.0], { ...CE, easing: eOut })
  );

  /* ── Bottom accent line ──────────────────────────────────── */
  const accentOp = interpolate(frame, [130, 160], [0, 1], CE);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>

      {/* ── Building photo — Ken Burns ── */}
      <AbsoluteFill style={{ opacity: masterOp }}>
        <div style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom}) translateY(${panY}%)`,
          transformOrigin: "60% 50%",
        }}>
          <Img
            src={staticFile("screenshots/astec_building.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "60% 50%",
            }}
          />
        </div>
      </AbsoluteFill>

      {/* ── Cinematic color grade & vignette layers ── */}
      <AbsoluteFill style={{ opacity: masterOp * gradeOp, pointerEvents: "none" }}>
        {/* Deep navy-to-transparent gradient from left */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(100deg,
            rgba(0,8,24,0.88) 0%,
            rgba(0,12,32,0.65) 35%,
            rgba(0,8,20,0.20) 62%,
            transparent 100%)`,
        }} />
        {/* Bottom fade for text legibility */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(0deg,
            rgba(0,6,18,0.82) 0%,
            rgba(0,6,18,0.38) 22%,
            transparent 48%)`,
        }} />
        {/* Edge vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 110% 100% at 55% 50%,
            transparent 35%,
            rgba(0,4,14,0.55) 100%)`,
        }} />
        {/* Subtle warm→cool color tone overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg,
            rgba(8,18,48,0.18) 0%,
            transparent 50%,
            rgba(4,10,28,0.28) 100%)`,
          mixBlendMode: "multiply" as const,
        }} />
      </AbsoluteFill>

      {/* ── Left panel — ASTEC branding ── */}
      <AbsoluteFill style={{ opacity: masterOp, pointerEvents: "none" }}>
        <div style={{
          position: "absolute",
          left: 100,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          maxWidth: 680,
        }}>

          {/* UA badge */}
          {uaOp > 0.01 && (
            <div style={{
              opacity: uaOp,
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 24,
            }}>
              <div style={{
                width: 6, height: 36, borderRadius: 3,
                background: colors.arizonaRed,
                boxShadow: `0 0 16px ${colors.arizonaRed}80`,
              }} />
              <span style={{
                fontFamily: fonts.mono,
                fontSize: 18,
                fontWeight: 700,
                color: `${colors.white}90`,
                letterSpacing: 4,
                textTransform: "uppercase" as const,
              }}>
                University of Arizona
              </span>
            </div>
          )}

          {/* "ASTEC" large acronym */}
          {badgeOp > 0.01 && (
            <div style={{
              opacity: badgeOp,
              transform: `translateY(${badgeY}px)`,
              marginBottom: 10,
            }}>
              <div style={{
                fontFamily: fonts.heading,
                fontSize: 108,
                fontWeight: 800,
                color: colors.white,
                letterSpacing: -2,
                lineHeight: 1.0,
                textShadow: `0 0 80px ${colors.arizonaRed}40, 0 4px 40px rgba(0,0,0,0.8)`,
              }}>
                ASTEC
              </div>
            </div>
          )}

          {/* Full name */}
          {nameOp > 0.01 && (
            <div style={{
              opacity: nameOp,
              transform: `translateY(${nameY}px)`,
              marginBottom: 28,
            }}>
              <div style={{
                fontFamily: fonts.heading,
                fontSize: 28,
                fontWeight: 600,
                color: `${colors.white}CC`,
                lineHeight: 1.35,
                letterSpacing: 0.5,
              }}>
                Arizona Simulation Technology<br />and Education Center
              </div>
            </div>
          )}

          {/* Animated rule */}
          {ruleW > 0 && (
            <div style={{
              width: ruleW,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${colors.arizonaRed}, ${colors.oasis}80, transparent)`,
              boxShadow: `0 0 18px ${colors.arizonaRed}55`,
              marginBottom: 36,
            }} />
          )}

          {/* Stat pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STATS.map((stat, i) => (
              <div key={i} style={{
                opacity: statOps[i],
                transform: `scale(${statScales[i]}) translateX(${interpolate(statOps[i], [0, 1], [-12, 0])}px)`,
                transformOrigin: "left center",
                display: "flex", alignItems: "center", gap: 18,
              }}>
                <div style={{
                  background: `${colors.arizonaRed}18`,
                  border: `2px solid ${colors.arizonaRed}45`,
                  borderRadius: 10,
                  padding: "10px 22px",
                  boxShadow: `0 0 24px ${colors.arizonaRed}18`,
                }}>
                  <span style={{
                    fontFamily: fonts.heading,
                    fontSize: 36,
                    fontWeight: 800,
                    color: colors.white,
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </span>
                </div>
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 500,
                  color: `${colors.white}80`,
                  maxWidth: 280,
                  lineHeight: 1.3,
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </AbsoluteFill>

      {/* ── Bottom accent bar ── */}
      {accentOp > 0.01 && (
        <AbsoluteFill style={{ opacity: masterOp * accentOp, pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 4,
            background: `linear-gradient(90deg,
              ${colors.arizonaRed}00,
              ${colors.arizonaRed}BB 20%,
              ${colors.oasis}88 50%,
              ${colors.arizonaRed}BB 80%,
              ${colors.arizonaRed}00)`,
            boxShadow: `0 -1px 20px ${colors.arizonaRed}40`,
          }} />
        </AbsoluteFill>
      )}

      {/* ── Scan-line texture (cinematic) ── */}
      <AbsoluteFill style={{
        opacity: masterOp * 0.025,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0,0,0,0.4) 4px
        )`,
        pointerEvents: "none",
      }} />

    </AbsoluteFill>
  );
};
