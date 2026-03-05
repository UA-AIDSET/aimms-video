/**
 * WaveformLine — An animated 3D line resembling an ECG / vital-sign trace.
 *
 * Generates a heartbeat-like waveform by combining a base sine wave with
 * sharp Gaussian spikes at regular intervals.  The buffer geometry is
 * recomputed every frame via useCurrentFrame().
 */
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface WaveformLineProps {
  position?: [number, number, number];
  pointCount?: number;
  width?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  color?: string;
  opacity?: number;
  lineWidth?: number;
  spikeFrequency?: number;
  rotation?: [number, number, number];
}

export const WaveformLine: React.FC<WaveformLineProps> = ({
  position = [0, 0, 0],
  pointCount = 100,
  width = 4,
  amplitude = 0.3,
  frequency = 2,
  speed = 0.1,
  color = "#39FF14",
  opacity = 0.6,
  lineWidth = 2,
  spikeFrequency = 0.15,
  rotation = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();

  // Compute vertex positions for the current frame as a fresh array each time.
  const positions = useMemo(() => {
    const pos = new Float32Array(pointCount * 3);
    const halfW = width / 2;
    const s = width / (pointCount - 1);
    const spikeSpacing = spikeFrequency > 0 ? 1 / spikeFrequency : width * 10;
    const timeOff = frame * speed;

    for (let i = 0; i < pointCount; i++) {
      const x = -halfW + i * s;
      const base =
        Math.sin(x * frequency * Math.PI * 2 + timeOff) * amplitude * 0.5;
      const nearestCenter =
        Math.round((x + timeOff) / spikeSpacing) * spikeSpacing - timeOff;
      const dist = x - nearestCenter;
      const spike = Math.exp(-(dist * dist) / 0.02) * amplitude * 2;
      pos[i * 3] = x;
      pos[i * 3 + 1] = base + spike;
      pos[i * 3 + 2] = 0;
    }
    return pos;
  }, [pointCount, width, frame, speed, frequency, amplitude, spikeFrequency]);

  return (
    <group position={position} rotation={rotation}>
      <line key={frame}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={pointCount}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          linewidth={lineWidth}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>
    </group>
  );
};
