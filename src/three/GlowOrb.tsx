/**
 * GlowOrb — Transparent glowing sphere with a subtle pulse.
 *
 * Uses AdditiveBlending for a soft glow effect.  Opacity is modulated
 * by a sine wave driven by useCurrentFrame().
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface GlowOrbProps {
  position?: [number, number, number];
  color?: string;
  radius?: number;
  pulseSpeed?: number;
  baseOpacity?: number;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({
  position = [0, 0, 0],
  color = "#378DBD",
  radius = 1.5,
  pulseSpeed = 0.03,
  baseOpacity = 0.15,
}) => {
  const frame = useCurrentFrame();

  const opacity = baseOpacity + Math.sin(frame * pulseSpeed) * 0.05;

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

