import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

interface InterstitialCardProps {
  step: number;
  title: string;
  subtitle: string;
  icon?: string;
  accentColor?: string;
}

/**
 * Interstitial title card shown at the start of each scene.
 * Fades in over frames 0-10, holds until frame 50, then fades out by frame 65.
 * Includes expanding pulse rings behind the title.
 */
export const InterstitialCard: React.FC<InterstitialCardProps> = ({
  step,
  title,
  subtitle,
  icon,
  accentColor = colors.arizonaRed,
}) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const opacity = interpolate(
    frame,
    [0, 10, 50, 65],
    [0, 1, 1, 0],
    clamp,
  );

  if (opacity <= 0) return null;

  // Expanding pulse rings
  const ring1Scale = interpolate(frame, [5, 50], [0, 1], clamp);
  const ring1Opacity = interpolate(frame, [5, 20, 45, 60], [0, 0.3, 0.15, 0], clamp);
  const ring2Scale = interpolate(frame, [15, 55], [0, 1], clamp);
  const ring2Opacity = interpolate(frame, [15, 30, 50, 65], [0, 0.2, 0.1, 0], clamp);
  const ring3Scale = interpolate(frame, [25, 60], [0, 1], clamp);
  const ring3Opacity = interpolate(frame, [25, 38, 55, 65], [0, 0.15, 0.08, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        zIndex: 20,
      }}
    >
      {/* Expanding pulse rings behind text */}
      {[
        { scale: ring1Scale, op: ring1Opacity, size: 400, color: accentColor },
        { scale: ring2Scale, op: ring2Opacity, size: 600, color: colors.oasis },
        { scale: ring3Scale, op: ring3Opacity, size: 800, color: accentColor },
      ].map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: ring.size,
            height: ring.size,
            borderRadius: "50%",
            border: `1px solid ${ring.color}`,
            transform: `translate(-50%, -50%) scale(${ring.scale})`,
            opacity: ring.op,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Step pill badge */}
      <div
        style={{
          backgroundColor: `${accentColor}30`,
          border: `1px solid ${accentColor}60`,
          borderRadius: 20,
          padding: "6px 20px",
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            color: colors.white,
            fontSize: 17,
            fontFamily: fonts.body,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Step {step}
        </span>
      </div>

      {/* Optional icon */}
      {icon && (
        <span
          style={{
            fontSize: 48,
            marginBottom: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          {icon}
        </span>
      )}

      {/* Title */}
      <span
        style={{
          color: colors.white,
          fontSize: 72,
          fontFamily: fonts.heading,
          fontWeight: 800,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {title}
      </span>

      {/* Subtitle */}
      <span
        style={{
          color: `${colors.slate200}B8`,
          fontSize: 24,
          fontFamily: fonts.body,
          fontWeight: 400,
          marginTop: 10,
          textAlign: "center",
          maxWidth: 700,
          position: "relative",
          zIndex: 1,
        }}
      >
        {subtitle}
      </span>
    </div>
  );
};
