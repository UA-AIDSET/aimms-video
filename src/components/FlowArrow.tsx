import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

interface FlowArrowProps {
  delay?: number;
  direction?: "right" | "down";
  color?: string;
  length?: number;
}

export const FlowArrow: React.FC<FlowArrowProps> = ({
  delay = 0,
  direction = "right",
  color = colors.arizonaRed,
  length = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.5 },
  });

  const scaleX = interpolate(progress, [0, 1], [0, 1]);
  const opacity = interpolate(progress, [0, 0.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  const isHorizontal = direction === "right";
  const w = isHorizontal ? length : 20;
  const h = isHorizontal ? 20 : length;

  // Tapered arrow: wide base tapering to a pointed tip
  const shape = isHorizontal
    ? `M 0 6 L ${length - 10} 6 L ${length - 10} 2 L ${length} 10 L ${length - 10} 18 L ${length - 10} 14 L 0 14 Z`
    : `M 6 0 L 6 ${length - 10} L 2 ${length - 10} L 10 ${length} L 18 ${length - 10} L 14 ${length - 10} L 14 0 Z`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: isHorizontal
          ? `scaleX(${scaleX})`
          : `scaleY(${scaleX})`,
        transformOrigin: isHorizontal ? "left center" : "center top",
        ...(isHorizontal
          ? { width: length, height: h }
          : { width: w, height: length }),
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path
          d={shape}
          fill={color}
          opacity={0.85}
        />
      </svg>
    </div>
  );
};
