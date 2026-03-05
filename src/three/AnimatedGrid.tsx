/**
 * AnimatedGrid — Wireframe grid plane with wave displacement.
 *
 * Positioned at Y=-2, lying flat.  Vertex Z values are displaced each frame
 * using sine/cosine waves driven by useCurrentFrame().
 */
import React, { useCallback } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface AnimatedGridProps {
  color?: string;
  opacity?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
}

export const SEGMENTS = 40;
export const SIZE = 30;

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  color = "#1E5288",
  opacity = 0.15,
  waveSpeed = 0.02,
  waveAmplitude = 0.3,
}) => {
  const frame = useCurrentFrame();

  // Callback ref: displaces vertices immediately when geometry is available.
  const geometryRef = useCallback(
    (geo: THREE.PlaneGeometry | null) => {
      if (!geo) return;

      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < posAttr.count; i++) {
        const x = arr[i * 3];
        const y = arr[i * 3 + 1];

        arr[i * 3 + 2] =
          Math.sin(x * 0.5 + frame * waveSpeed) * waveAmplitude +
          Math.cos(y * 0.4 + frame * waveSpeed * 0.75) * waveAmplitude * 0.6;
      }

      posAttr.needsUpdate = true;
    },
    [frame, waveSpeed, waveAmplitude],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry ref={geometryRef} args={[SIZE, SIZE, SEGMENTS, SEGMENTS]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
};
