/**
 * Scene 4 — Shared layout & chrome primitives.
 * Use inside shots only; keeps one design system. No shot logic here.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene4Atmosphere } from "./Scene4Atmosphere";
import { scene4, scene4Panel, scene4Space, scene4Z } from "./designSystem";

type BackdropProps = { children?: React.ReactNode };

/** Full-frame cinematic background: navy/blue gradient + animated atmosphere + vignette. */
export const Scene4Backdrop: React.FC<BackdropProps> = ({ children }) => (
  <AbsoluteFill style={{ zIndex: scene4Z.bg, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: scene4.backgroundGradient }} />
    <AbsoluteFill style={{ background: scene4.ambientWash, pointerEvents: "none" }} />
    <Scene4Atmosphere />
    <AbsoluteFill style={{ background: scene4.vignette, pointerEvents: "none" }} />
    {children}
  </AbsoluteFill>
);

type FocusPanelProps = {
  children: React.ReactNode;
  /** Optional semantic accent (border glow) */
  accent?: string;
  maxWidth?: number;
  style?: React.CSSProperties;
};

/** Premium glass panel — default container for the single focal per shot. */
export const Scene4FocusPanel: React.FC<FocusPanelProps> = ({
  children,
  accent = scene4Panel.defaultAccent,
  maxWidth = scene4Space.contentMax,
  style,
}) => (
  <div
    style={{
      position: "relative",
      zIndex: scene4Z.focal,
      width: "100%",
      maxWidth,
      margin: "0 auto",
      padding: `${scene4Space.gapLg}px ${scene4Space.inset}px`,
      borderRadius: 24,
      background: scene4Panel.glass.background,
      border: `2px solid ${accent}`,
      boxShadow: scene4Panel.glass.boxShadow,
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 24,
        right: 24,
        top: 0,
        height: 1,
        background: scene4Panel.highlightTop,
        borderRadius: 24,
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

type CenterColumnProps = {
  children: React.ReactNode;
  maxWidth?: number;
};

/** Centers the focal column; use one primary stack per shot. */
export const Scene4CenterColumn: React.FC<CenterColumnProps> = ({
  children,
  maxWidth = scene4Space.contentMax,
}) => (
  <AbsoluteFill
    style={{
      zIndex: scene4Z.content,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: `0 ${scene4Space.gapMd}px`,
    }}
  >
    <div style={{ width: "100%", maxWidth, position: "relative" }}>{children}</div>
  </AbsoluteFill>
);

type ShotLayerProps = { children: React.ReactNode; style?: React.CSSProperties };

/** Full-frame layer above backdrop for shot content (patient, overlays, split layouts). */
export const Scene4ShotLayer: React.FC<ShotLayerProps> = ({ children, style }) => (
  <AbsoluteFill style={{ zIndex: scene4Z.content, ...style }}>{children}</AbsoluteFill>
);
