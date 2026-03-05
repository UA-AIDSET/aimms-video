/**
 * FloatingPanel — Flat 3D panel that hovers with subtle float and rotation.
 *
 * Uses useCurrentFrame() for all animation.  Rendered as a double-sided
 * transparent plane.
 */
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface FloatingPanelProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  floatSpeed?: number;
  floatAmount?: number;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  position = [0, 0, 0],
  width = 2,
  height = 1.5,
  color = "#0C234B",
  opacity = 0.6,
  floatSpeed = 0.01,
  floatAmount = 0.1,
}) => {
  const frame = useCurrentFrame();

  const floatY = Math.sin(frame * floatSpeed) * floatAmount;
  const rotY = Math.sin(frame * floatSpeed * 0.7) * 0.05;

  return (
    <mesh
      position={[position[0], position[1] + floatY, position[2]]}
      rotation={[0, rotY, 0]}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

