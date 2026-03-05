import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

interface PulsingDotProps {
  color?: string;
  size?: number;
  delay?: number;
}

export const PulsingDot: React.FC<PulsingDotProps> = ({
  color = colors.ecgGreen,
  size = 12,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const pulse = Math.sin((frame - delay) * 0.15) * 0.3 + 1;
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `scale(${pulse})`,
        opacity,
        boxShadow: `0 0 ${size}px ${color}60`,
      }}
    />
  );
};
