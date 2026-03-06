import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

interface GlassPanelProps {
  enterFrame?: number;
  exitFrame?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Glass-morphism panel with spring entrance and interpolate exit fade.
 * Background: rgba(12,35,75,0.65), blur(16px), subtle oasis border.
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  enterFrame = 0,
  exitFrame = 9999,
  children,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance
  const springProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const entranceScale = interpolate(springProgress, [0, 1], [0.94, 1]);
  const entranceOpacity = interpolate(springProgress, [0, 1], [0, 1]);

  // Exit fade
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const exitOpacity = interpolate(frame, [exitFrame - 15, exitFrame], [1, 0], clamp);

  const opacity = entranceOpacity * exitOpacity;

  if (frame < enterFrame || opacity <= 0) return null;

  return (
    <div
      style={{
        background: "rgba(12, 35, 75, 0.78)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${colors.oasis}30`,
        borderRadius: 12,
        padding: "16px 20px",
        transform: `scale(${entranceScale})`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
