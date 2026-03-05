import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

interface ClickRippleProps {
  x: number;
  y: number;
  triggerFrame: number;
  color?: string;
}

/**
 * Expanding circle ripple effect at a click point.
 * Animates over ~18 frames then disappears.
 */
export const ClickRipple: React.FC<ClickRippleProps> = ({
  x,
  y,
  triggerFrame,
  color = colors.oasis,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;

  if (elapsed < 0 || elapsed > 22) return null;

  const size = interpolate(elapsed, [0, 18], [0, 50], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(elapsed, [0, 4, 18], [0.6, 0.5, 0], {
    extrapolateRight: "clamp",
  });
  const ringSize = interpolate(elapsed, [0, 18], [0, 64], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(elapsed, [0, 6, 20], [0.4, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Inner fill */}
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Outer ring */}
      <div
        style={{
          position: "absolute",
          left: x - ringSize / 2,
          top: y - ringSize / 2,
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `2px solid ${color}`,
          opacity: ringOpacity,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
