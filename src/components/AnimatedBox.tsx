import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedBoxProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  style?: React.CSSProperties;
}

export const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  children,
  delay = 0,
  direction = "up",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  let transform = "";
  switch (direction) {
    case "up":
      transform = `translateY(${interpolate(progress, [0, 1], [60, 0])}px)`;
      break;
    case "down":
      transform = `translateY(${interpolate(progress, [0, 1], [-60, 0])}px)`;
      break;
    case "left":
      transform = `translateX(${interpolate(progress, [0, 1], [80, 0])}px)`;
      break;
    case "right":
      transform = `translateX(${interpolate(progress, [0, 1], [-80, 0])}px)`;
      break;
    case "scale":
      transform = `scale(${interpolate(progress, [0, 1], [0.5, 1])})`;
      break;
  }

  return (
    <div style={{ opacity, transform, ...style }}>
      {children}
    </div>
  );
};
