/**
 * ParticleField — Drifting point-cloud particles for ambient background detail.
 *
 * Uses useCurrentFrame() from Remotion (never useFrame from R3F) to drive
 * per-particle Y drift with sine wobble.  Particles that leave the top of
 * the spread volume wrap to the bottom.
 */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";

interface ParticleFieldProps {
  count?: number;
  spread?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  size?: number;
}

/** Simple deterministic pseudo-random based on index. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 200,
  spread = 15,
  speed = 0.002,
  color = "#378DBD",
  opacity = 0.6,
  size = 0.08,
}) => {
  const frame = useCurrentFrame();

  // Pre-compute base positions once.
  const basePositions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (seededRandom(i * 3) - 0.5) * spread;
      arr[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * spread;
      arr[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * spread;
    }
    return arr;
  }, [count, spread]);

  // Compute animated positions each render (driven by frame).
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const halfSpread = spread / 2;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Per-particle sine wobble on X and Z
      const wobbleX = Math.sin(frame * speed * 10 + i * 0.5) * 0.05;
      const wobbleZ = Math.cos(frame * speed * 8 + i * 0.7) * 0.05;

      arr[i * 3] = bx + wobbleX;

      // Drift upward; wrap when exceeding top
      let newY = by + frame * speed;
      // Wrap into [-halfSpread, halfSpread]
      newY = ((((newY + halfSpread) % spread) + spread) % spread) - halfSpread;
      arr[i * 3 + 1] = newY;

      arr[i * 3 + 2] = bz + wobbleZ;
    }
    return arr;
  }, [frame, count, spread, speed, basePositions]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

