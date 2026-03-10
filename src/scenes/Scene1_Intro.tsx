import React from "react";
import {
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../theme";
import { AnimatedBox } from "../components/AnimatedBox";
import { SceneShell } from "../layouts/SceneShell";
import { ParticleField } from "../three/ParticleField";
import { AnimatedGrid } from "../three/AnimatedGrid";
import { GlowOrb } from "../three/GlowOrb";
import { CameraRig } from "../three/CameraRig";

/**
 * Scene 1: Intro — Digital Awakening
 * Tech-frame border animations activate around centered text.
 * Corner brackets draw in, edge scan lines sweep, bottom data ticker scrolls.
 * ~400 frames.
 */
export const Scene1_Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  // Logo entrance
  const logoEnter = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80, mass: 1 },
  });

  // Horizontal rule wipe
  const ruleWidth = spring({
    frame: frame - 30,
    fps,
    config: { damping: 25, stiffness: 70 },
  });

  // Shimmer sweep across the title
  const shimmerX = interpolate(frame, [40, 100], [-400, 2400], clamp);

  // --- Edge animation timings ---
  // Corner brackets draw in (0-60)
  const bracketDraw = interpolate(frame, [5, 60], [0, 1], clamp);
  const bracketGlow = 0.6 + 0.4 * Math.sin(frame * 0.06);

  // Horizontal scan lines sweep from edges toward center (20-80)
  const topScanX = interpolate(frame, [20, 80], [-1920, 0], clamp);
  const botScanX = interpolate(frame, [30, 90], [1920, 0], clamp);

  // Side accent lines pulse in (40-90)
  const sideLineOpacity = interpolate(frame, [40, 70], [0, 1], clamp);
  const sideLinePulse = 0.5 + 0.5 * Math.sin(frame * 0.08);

  // Bottom data ticker (starts at 60, scrolls continuously)
  const tickerOpacity = interpolate(frame, [60, 90], [0, 0.7], clamp);
  const tickerScroll = interpolate(frame, [60, 540], [0, -2400], clamp);

  // Expanding ring behind text (frame 10-80)
  const ringScale = interpolate(frame, [10, 100], [0, 1], clamp);
  const ringOpacity = interpolate(frame, [10, 50, 90, 130], [0, 0.25, 0.15, 0], clamp);
  const ring2Scale = interpolate(frame, [30, 120], [0, 1], clamp);
  const ring2Opacity = interpolate(frame, [30, 70, 110, 150], [0, 0.2, 0.1, 0], clamp);

  // Fade out everything at end
  const fadeOut = interpolate(frame, [500, 535], [1, 0], clamp);

  const cornerSize = 60;
  const cornerThickness = 2;
  const cornerInset = 40;

  // Data ticker text items
  const tickerItems = [
    "AIMMS v3.2 INITIALIZED",
    "//",
    "NEURAL PIPELINE ACTIVE",
    "//",
    "LLM ENGINE: READY",
    "//",
    "MEDICAL CASE CREATOR",
    "//",
    "VIRTUAL PATIENT SIM",
    "//",
    "AIMHEI PERFORMANCE REPORTS",
    "//",
    "FACULTY DASHBOARD",
    "//",
    "AI-POWERED CASE AUTHORING",
    "//",
  ];
  const tickerText = tickerItems.join("   ");

  const threeContent = (
    <>
      <AnimatedGrid color="#1E5288" opacity={0.04} />
      <ParticleField count={25} color="#378DBD" speed={0.002} opacity={0.08} />
      <GlowOrb position={[0, 0, -6]} color={colors.oasis} radius={3} baseOpacity={0.06} />
      <CameraRig
        positions={[
          { frame: 0, position: [0, 0, 10] },
          { frame: 400, position: [0, 0, 8] },
        ]}
      />
    </>
  );

  return (
    <SceneShell threeContent={threeContent}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: fadeOut,
        }}
      >
        {/* === CORNER BRACKETS === */}
        {/* Top-left */}
        <svg
          style={{ position: "absolute", top: cornerInset, left: cornerInset }}
          width={cornerSize}
          height={cornerSize}
          viewBox={`0 0 ${cornerSize} ${cornerSize}`}
        >
          <path
            d={`M 0,${cornerSize} L 0,0 L ${cornerSize},0`}
            fill="none"
            stroke={colors.oasis}
            strokeWidth={cornerThickness}
            strokeLinecap="round"
            opacity={bracketGlow}
            strokeDasharray={cornerSize * 2}
            strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)}
          />
        </svg>
        {/* Top-right */}
        <svg
          style={{ position: "absolute", top: cornerInset, right: cornerInset }}
          width={cornerSize}
          height={cornerSize}
          viewBox={`0 0 ${cornerSize} ${cornerSize}`}
        >
          <path
            d={`M 0,0 L ${cornerSize},0 L ${cornerSize},${cornerSize}`}
            fill="none"
            stroke={colors.oasis}
            strokeWidth={cornerThickness}
            strokeLinecap="round"
            opacity={bracketGlow}
            strokeDasharray={cornerSize * 2}
            strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)}
          />
        </svg>
        {/* Bottom-left */}
        <svg
          style={{ position: "absolute", bottom: cornerInset + 40, left: cornerInset }}
          width={cornerSize}
          height={cornerSize}
          viewBox={`0 0 ${cornerSize} ${cornerSize}`}
        >
          <path
            d={`M 0,0 L 0,${cornerSize} L ${cornerSize},${cornerSize}`}
            fill="none"
            stroke={colors.oasis}
            strokeWidth={cornerThickness}
            strokeLinecap="round"
            opacity={bracketGlow}
            strokeDasharray={cornerSize * 2}
            strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)}
          />
        </svg>
        {/* Bottom-right */}
        <svg
          style={{ position: "absolute", bottom: cornerInset + 40, right: cornerInset }}
          width={cornerSize}
          height={cornerSize}
          viewBox={`0 0 ${cornerSize} ${cornerSize}`}
        >
          <path
            d={`M ${cornerSize},0 L ${cornerSize},${cornerSize} L 0,${cornerSize}`}
            fill="none"
            stroke={colors.oasis}
            strokeWidth={cornerThickness}
            strokeLinecap="round"
            opacity={bracketGlow}
            strokeDasharray={cornerSize * 2}
            strokeDashoffset={cornerSize * 2 * (1 - bracketDraw)}
          />
        </svg>

        {/* === HORIZONTAL SCAN LINES === */}
        {/* Top scan line */}
        <div
          style={{
            position: "absolute",
            top: cornerInset + 10,
            left: cornerInset + cornerSize + 20,
            right: cornerInset + cornerSize + 20,
            height: 1,
            background: `linear-gradient(90deg, ${colors.oasis}60, ${colors.oasis}20, transparent)`,
            transform: `translateX(${topScanX}px)`,
          }}
        />
        {/* Bottom scan line */}
        <div
          style={{
            position: "absolute",
            bottom: cornerInset + 40 + cornerSize - 10,
            left: cornerInset + cornerSize + 20,
            right: cornerInset + cornerSize + 20,
            height: 1,
            background: `linear-gradient(270deg, ${colors.oasis}60, ${colors.oasis}20, transparent)`,
            transform: `translateX(${botScanX}px)`,
          }}
        />

        {/* === SIDE ACCENT LINES === */}
        {/* Left side */}
        <div
          style={{
            position: "absolute",
            top: cornerInset + cornerSize + 30,
            bottom: cornerInset + 40 + cornerSize + 30,
            left: cornerInset + 10,
            width: 1,
            background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}80, ${colors.oasis}00)`,
            opacity: sideLineOpacity * sideLinePulse,
          }}
        />
        {/* Right side */}
        <div
          style={{
            position: "absolute",
            top: cornerInset + cornerSize + 30,
            bottom: cornerInset + 40 + cornerSize + 30,
            right: cornerInset + 10,
            width: 1,
            background: `linear-gradient(180deg, ${colors.oasis}00, ${colors.azurite}80, ${colors.oasis}00)`,
            opacity: sideLineOpacity * sideLinePulse,
          }}
        />

        {/* Small accent tick marks along left edge */}
        {[0, 1, 2, 3, 4].map((i) => {
          const tickDelay = 50 + i * 12;
          const tickOp = interpolate(frame, [tickDelay, tickDelay + 15], [0, 0.5], clamp);
          const yPos = 200 + i * 120;
          return (
            <div
              key={`tick-l-${i}`}
              style={{
                position: "absolute",
                top: yPos,
                left: cornerInset,
                width: 20,
                height: 1,
                background: colors.azurite,
                opacity: tickOp * sideLinePulse,
              }}
            />
          );
        })}
        {/* Right edge tick marks */}
        {[0, 1, 2, 3, 4].map((i) => {
          const tickDelay = 55 + i * 12;
          const tickOp = interpolate(frame, [tickDelay, tickDelay + 15], [0, 0.5], clamp);
          const yPos = 200 + i * 120;
          return (
            <div
              key={`tick-r-${i}`}
              style={{
                position: "absolute",
                top: yPos,
                right: cornerInset,
                width: 20,
                height: 1,
                background: colors.azurite,
                opacity: tickOp * sideLinePulse,
              }}
            />
          );
        })}

        {/* === EXPANDING RINGS (behind text) === */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${ringScale})`,
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: `1px solid ${colors.oasis}`,
            opacity: ringOpacity,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${ring2Scale})`,
            width: 700,
            height: 700,
            borderRadius: "50%",
            border: `1px solid ${colors.azurite}`,
            opacity: ring2Opacity,
            pointerEvents: "none",
          }}
        />

        {/* === MAIN TEXT CONTENT (centered, above rings) === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 60,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* ASTEC Logo */}
          <AnimatedBox delay={0} direction="scale">
            <div
              style={{
                opacity: interpolate(logoEnter, [0, 1], [0, 1]),
                transform: `scale(${interpolate(logoEnter, [0, 1], [0.9, 1])})`,
                background: `linear-gradient(135deg, ${colors.white}90, ${colors.white}60)`,
                backdropFilter: "blur(16px)",
                borderRadius: 16,
                padding: "18px 36px",
                border: `1px solid ${colors.white}40`,
                boxShadow: `0 8px 32px ${colors.midnight}60, 0 0 40px ${colors.oasis}15, inset 0 1px 0 ${colors.white}40`,
              }}
            >
              <Img
                src={staticFile("screenshots/astec_logo.png")}
                style={{
                  height: 70,
                  objectFit: "contain",
                }}
              />
            </div>
          </AnimatedBox>

          {/* Horizontal rule */}
          <div
            style={{
              width: interpolate(ruleWidth, [0, 1], [0, 200]),
              height: 2,
              background: `linear-gradient(90deg, transparent, ${colors.arizonaRed}, transparent)`,
              borderRadius: 1,
              marginTop: 28,
              marginBottom: 28,
            }}
          />

          {/* Title with shimmer */}
          <AnimatedBox delay={20} direction="up">
            <div style={{ position: "relative", overflow: "hidden" }}>
              <h1
                style={{
                  color: colors.white,
                  fontSize: 76,
                  fontFamily: fonts.heading,
                  fontWeight: 800,
                  letterSpacing: -2,
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.1,
                  textShadow: `0 0 40px ${colors.oasis}40`,
                }}
              >
                AIMMS
              </h1>
              {/* Shimmer sweep */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: shimmerX,
                  width: 200,
                  height: "100%",
                  background: `linear-gradient(90deg, transparent, ${colors.white}30, transparent)`,
                  transform: "skewX(-20deg)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </AnimatedBox>

          {/* Subtitle */}
          <AnimatedBox delay={35} direction="up">
            <p
              style={{
                color: colors.oasis,
                fontSize: 26,
                fontFamily: fonts.body,
                fontWeight: 400,
                letterSpacing: 6,
                textTransform: "uppercase",
                margin: "14px 0 0",
                textAlign: "center",
              }}
            >
              AI Medical Mentoring System
            </p>
          </AnimatedBox>

          {/* Technical tagline */}
          <AnimatedBox delay={55} direction="up">
            <p
              style={{
                color: `${colors.slate200}D0`,
                fontSize: 20,
                fontFamily: fonts.body,
                fontWeight: 400,
                margin: "20px 0 0",
                textAlign: "center",
                maxWidth: 700,
                lineHeight: 1.5,
              }}
            >
              An end-to-end pipeline for case authoring, immersive 3D patient
              simulation, and LLM-driven performance evaluation.
            </p>
          </AnimatedBox>
        </div>

        {/* === BOTTOM DATA TICKER === */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            height: 24,
            overflow: "hidden",
            opacity: tickerOpacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              whiteSpace: "nowrap",
              transform: `translateX(${tickerScroll}px)`,
              fontFamily: fonts.mono,
              fontSize: 12,
              color: colors.oasis,
              letterSpacing: 2,
              lineHeight: "24px",
            }}
          >
            {tickerText}
            {tickerText}
          </div>
          {/* Gradient fade edges */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${colors.midnight}, transparent 15%, transparent 85%, ${colors.midnight})`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </SceneShell>
  );
};
