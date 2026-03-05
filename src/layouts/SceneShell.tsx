import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { colors, fonts } from "../theme";
import { InterstitialCard } from "./InterstitialCard";

interface SceneShellProps {
  children: React.ReactNode;
  threeContent?: React.ReactNode;
  interstitial?: {
    step: number;
    title: string;
    subtitle: string;
    icon?: string;
  };
  sectionLabel?: string;
  bgGradient?: string;
}

/**
 * SceneShell wraps every scene with two layers:
 *  - Layer 1 (background): ThreeCanvas with standard lighting and optional 3D content
 *  - Layer 2 (foreground): HTML overlay with optional interstitial card, section badge, and children
 */
export const SceneShell: React.FC<SceneShellProps> = ({
  children,
  threeContent,
  interstitial,
  sectionLabel,
  bgGradient = `linear-gradient(160deg, ${colors.midnight} 0%, ${colors.arizonaBlue} 50%, ${colors.azurite} 100%)`,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: bgGradient,
        overflow: "hidden",
      }}
    >
      {/* Layer 1: Three.js background */}
      <AbsoluteFill>
        <ThreeCanvas
          width={width}
          height={height}
          gl={{ alpha: true }}
        >
          {/* Standard lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />

          {/* Three.js scene content */}
          {threeContent && (
            <Sequence layout="none">
              {threeContent}
            </Sequence>
          )}
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Layer 2: HTML overlay */}
      <AbsoluteFill style={{ zIndex: 2 }}>
        {/* Interstitial title card */}
        {interstitial && (
          <InterstitialCard
            step={interstitial.step}
            title={interstitial.title}
            subtitle={interstitial.subtitle}
            icon={interstitial.icon}
          />
        )}

        {/* Section badge (top-left) */}
        {sectionLabel && (
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 32,
              zIndex: 10,
            }}
          >
            <div
              style={{
                backgroundColor: `${colors.arizonaRed}20`,
                borderRadius: 24,
                padding: "8px 24px",
                border: `1px solid ${colors.arizonaRed}40`,
              }}
            >
              <span
                style={{
                  color: colors.white,
                  fontSize: 15,
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                }}
              >
                {sectionLabel}
              </span>
            </div>
          </div>
        )}

        {/* Scene-specific HTML content */}
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
