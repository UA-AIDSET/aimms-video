import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface NarratorCaptionProps {
  text: string;
  delay?: number;
}

export const NarratorCaption: React.FC<NarratorCaptionProps> = ({
  text,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const opacity = interpolate(fadeIn, [0, 1], [0, 0.95]);
  const translateY = interpolate(fadeIn, [0, 1], [20, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.midnight}E6, ${colors.arizonaBlue}E6)`,
          backdropFilter: "blur(16px)",
          borderRadius: 12,
          padding: "10px 32px",
          maxWidth: 1500,
          textAlign: "center",
          border: `1px solid ${colors.azurite}40`,
          boxShadow: `0 8px 32px ${colors.midnight}80`,
        }}
      >
        <p
          style={{
            color: colors.white,
            fontSize: 20,
            fontFamily: fonts.body,
            fontWeight: 400,
            lineHeight: 1.4,
            margin: 0,
            letterSpacing: 0.3,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
};
