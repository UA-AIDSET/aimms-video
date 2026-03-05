/**
 * OrbitRing — A glowing torus that rotates around a point.
 *
 * Used for holographic scanner effects.  Opacity pulses gently
 * while the ring spins on its Y axis.  Driven by useCurrentFrame().
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface OrbitRingProps {
  position?: [number, number, number];
  radius?: number;
  tubeRadius?: number;
  color?: string;
  opacity?: number;
  rotationSpeed?: number;
  tilt?: [number, number, number];
  pulseSpeed?: number;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({
  position = [0, 0, 0],
  radius = 2,
  tubeRadius = 0.015,
  color = "#378DBD",
  opacity = 0.4,
  rotationSpeed = 0.02,
  tilt = [0, 0, 0],
  pulseSpeed = 0.03,
}) => {
  const frame = useCurrentFrame();

  const currentOpacity =
    opacity * (0.8 + 0.2 * Math.sin(frame * pulseSpeed));

  const rotation: [number, number, number] = [
    tilt[0],
    tilt[1] + frame * rotationSpeed,
    tilt[2],
  ];

  return (
    <group position={position}>
      <mesh rotation={rotation}>
        <torusGeometry args={[radius, tubeRadius, 16, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={currentOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
