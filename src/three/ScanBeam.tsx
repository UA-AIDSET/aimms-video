/**
 * ScanBeam — A sweeping light beam/plane for scanning effects.
 *
 * A thin glowing plane that continuously sweeps vertically between
 * two Y positions.  Uses AdditiveBlending for a soft neon look.
 * Driven entirely by useCurrentFrame().
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface ScanBeamProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  sweepRange?: [number, number];
  sweepSpeed?: number;
  active?: boolean;
}

export const ScanBeam: React.FC<ScanBeamProps> = ({
  position = [0, 0, 0],
  width = 3,
  height = 0.05,
  color = "#39FF14",
  opacity = 0.6,
  sweepRange = [-1.5, 2],
  sweepSpeed = 0.02,
  active = true,
}) => {
  const frame = useCurrentFrame();

  if (!active) return null;

  const y =
    sweepRange[0] +
    ((frame * sweepSpeed) % 1) * (sweepRange[1] - sweepRange[0]);

  return (
    <group position={position}>
      {/* Main beam */}
      <mesh position={[0, y, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Glow halo behind the beam */}
      <mesh position={[0, y, 0]}>
        <planeGeometry args={[width, height * 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
