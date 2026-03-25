/**
 * Scene 4 — shared animated atmosphere (grid, wave surface, particles).
 * Frame-driven only — safe for Remotion renders.
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../../theme";
import { scene4, scene4Accent } from "./designSystem";

const PARTICLE_COUNT = 34;
const COL_COUNT = 3;

function particleStyle(i: number, frame: number): React.CSSProperties {
  const baseX = ((i * 97.3) % 94) + 3;
  const baseY = ((i * 61.7) % 88) + 6;
  const w = 2 + (i % 3);
  const drift = 0.011 + (i % 5) * 0.0018;
  const ox = Math.sin(frame * drift + i * 0.7) * 10;
  const oy = Math.cos(frame * (drift * 0.85) + i * 0.5) * 8;
  const op = 0.06 + 0.05 * Math.sin(frame * 0.018 + i * 0.4);
  const isSquare = i % 4 === 0;
  return {
    position: "absolute",
    left: `${baseX}%`,
    top: `${baseY}%`,
    width: w,
    height: isSquare ? w : w + 1,
    opacity: Math.min(0.22, Math.max(0.04, op)),
    borderRadius: isSquare ? 2 : "50%",
    background: i % 7 === 0 ? `${colors.white}35` : `${scene4Accent.clinical}55`,
    transform: `translate(${ox}px, ${oy}px)`,
    pointerEvents: "none",
  };
}

function wavePath(frame: number, width: number, height: number): string {
  const amp = 5 + Math.sin(frame * 0.015) * 2;
  const phase = frame * 0.014;
  const step = 32;
  let d = "";
  for (let x = 0; x <= width; x += step) {
    const y = height * 0.35 + Math.sin(x * 0.006 + phase) * amp + Math.sin(x * 0.003 + phase * 0.7) * amp * 0.35;
    d += x === 0 ? `M 0 ${y}` : ` L ${x} ${y}`;
  }
  d += ` L ${width} ${height} L 0 ${height} Z`;
  return d;
}

export const Scene4Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const gridShift = Math.sin(frame * 0.009) * 5;
  const meshShift = Math.sin(frame * 0.006) * 3;

  const w = 1920;
  const h = 520;

  return (
    <AbsoluteFill style={{ zIndex: 0, pointerEvents: "none" }}>
      {/* Animated perspective grid — data landscape */}
      <AbsoluteFill
        style={{
          opacity: 0.22,
          background: scene4.gridOverlay,
          transform: `perspective(900px) rotateX(58deg) scale(1.15) translateY(${18 + gridShift}px)`,
          transformOrigin: "50% 85%",
        }}
      />

      {/* Secondary fine grid (slower drift) */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          background: scene4.gridFine,
          transform: `translateY(${meshShift}px)`,
        }}
      />

      {/* Soft green wave / mesh floor */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
        <svg
          width="100%"
          height="48%"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ display: "block", opacity: 0.55 }}
        >
          <defs>
            <linearGradient id="s4waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={scene4Accent.clinical} stopOpacity="0.14" />
              <stop offset="55%" stopColor={colors.arizonaBlue} stopOpacity="0.06" />
              <stop offset="100%" stopColor="#02060c" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="s4waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={scene4Accent.clinical} stopOpacity="0" />
              <stop offset="50%" stopColor={scene4Accent.clinical} stopOpacity="0.35" />
              <stop offset="100%" stopColor={scene4Accent.clinical} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={wavePath(frame, w, h)} fill="url(#s4waveFill)" />
          <path
            d={wavePath(frame, w, h)}
            fill="none"
            stroke="url(#s4waveStroke)"
            strokeWidth={1.2}
            opacity={0.45}
          />
        </svg>
      </AbsoluteFill>

      {/* Minimal vertical data columns */}
      <AbsoluteFill style={{ display: "flex", justifyContent: "space-around", padding: "8% 18% 0", opacity: 0.14 }}>
        {Array.from({ length: COL_COUNT }).map((_, c) => (
          <div
            key={c}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transform: `translateY(${Math.sin(frame * 0.01 + c) * 4}px)`,
            }}
          >
            {Array.from({ length: 12 }).map((__, r) => (
              <div
                key={r}
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: scene4Accent.clinical,
                  opacity: 0.35 + 0.25 * Math.sin(frame * 0.025 + r * 0.5 + c),
                }}
              />
            ))}
          </div>
        ))}
      </AbsoluteFill>

      {/* Floating particles */}
      <AbsoluteFill>
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
          <div key={i} style={particleStyle(i, frame)} />
        ))}
      </AbsoluteFill>

      {/* Orbital focus ring — very subtle */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: "72%",
            height: "58%",
            borderRadius: "50%",
            border: `1px solid ${scene4Accent.clinical}12`,
            opacity: 0.35 + 0.1 * Math.sin(frame * 0.008),
            transform: `scale(${1 + Math.sin(frame * 0.006) * 0.008})`,
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
