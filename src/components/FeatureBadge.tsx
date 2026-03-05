import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface FeatureBadgeProps {
  text: string;
  /** Frame at which badge appears */
  enterFrame: number;
  /** Frame at which badge starts fading out */
  exitFrame?: number;
  color?: string;
}

/**
 * Bold pill badge (SuperMotion-style) that announces a feature.
 * Positioned above the NarratorCaption bar.
 */
export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  text,
  enterFrame,
  exitFrame,
  color = colors.arizonaRed,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const exit =
    exitFrame != null
      ? interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [24, 0]);

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 155,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        zIndex: 15,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${color}F0, ${color}D0)`,
          borderRadius: 28,
          padding: "10px 30px",
          boxShadow: `0 6px 24px ${color}50`,
          border: `1px solid ${color}80`,
        }}
      >
        <span
          style={{
            color: colors.white,
            fontSize: 19,
            fontFamily: fonts.heading,
            fontWeight: 700,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
