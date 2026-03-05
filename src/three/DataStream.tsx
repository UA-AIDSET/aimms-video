/**
 * DataStream — Flowing dots along a line representing data flow.
 *
 * Uses instancedMesh with small spheres that continuously move in the
 * specified direction.  Driven entirely by useCurrentFrame().
 */
import React, { useMemo, useCallback } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

interface DataStreamProps {
  direction?: "up" | "down" | "left" | "right";
  position?: [number, number, number];
  count?: number;
  length?: number;
  speed?: number;
  color?: string;
  opacity?: number;
}

export const SPHERE_RADIUS = 0.04;
export const SPHERE_DETAIL = 8;

const directionVectors: Record<string, THREE.Vector3> = {
  up: new THREE.Vector3(0, 1, 0),
  down: new THREE.Vector3(0, -1, 0),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
};

const _tempMatrix = new THREE.Matrix4();

export const DataStream: React.FC<DataStreamProps> = ({
  direction = "up",
  position = [0, 0, 0],
  count = 30,
  length = 8,
  speed = 0.05,
  color = "#378DBD",
  opacity = 0.4,
}) => {
  const frame = useCurrentFrame();

  const dirVec = directionVectors[direction] ?? directionVectors.up;
  const spacing = length / count;

  // Callback ref: sets instance matrices immediately when mesh mounts.
  const meshRef = useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      for (let i = 0; i < count; i++) {
        const baseOffset = i * spacing;
        const animatedOffset = (baseOffset + frame * speed) % length;
        const pos = dirVec
          .clone()
          .multiplyScalar(animatedOffset - length / 2);

        _tempMatrix.setPosition(pos.x, pos.y, pos.z);
        mesh.setMatrixAt(i, _tempMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [count, spacing, frame, speed, length, dirVec],
  );

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[SPHERE_RADIUS, SPHERE_DETAIL, SPHERE_DETAIL]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
};
