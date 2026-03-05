/**
 * NodeNetwork — A connected node graph that morphs between configurations.
 *
 * Uses useCurrentFrame() from Remotion (never useFrame from R3F) to drive
 * per-node pulsing animations.  Renders nodes via instancedMesh and edges
 * via lineSegments for efficient rendering of large graphs.
 */
import React, { useMemo, useCallback } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

interface NodeNetworkProps {
  nodes: Array<{ x: number; y: number; z: number }>;
  targetNodes?: Array<{ x: number; y: number; z: number }>;
  morphProgress?: number;
  edges?: Array<[number, number]>;
  color?: string;
  nodeSize?: number;
  edgeOpacity?: number;
  pulseSpeed?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const _dummy = new THREE.Object3D();

export const NodeNetwork: React.FC<NodeNetworkProps> = ({
  nodes,
  targetNodes,
  morphProgress = 0,
  edges = [],
  color = "#378DBD",
  nodeSize = 0.06,
  edgeOpacity = 0.3,
  pulseSpeed = 0.03,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const frame = useCurrentFrame();

  // Compute interpolated node positions (lerp if morphing).
  const currentPositions = useMemo(() => {
    return nodes.map((node, i) => {
      if (targetNodes && targetNodes[i] && morphProgress > 0) {
        return {
          x: node.x + (targetNodes[i].x - node.x) * morphProgress,
          y: node.y + (targetNodes[i].y - node.y) * morphProgress,
          z: node.z + (targetNodes[i].z - node.z) * morphProgress,
        };
      }
      return node;
    });
  }, [nodes, targetNodes, morphProgress]);

  // Callback ref: sets instance matrices immediately when mesh is available.
  const instancedRef = useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      for (let i = 0; i < currentPositions.length; i++) {
        const p = currentPositions[i];
        const pulseFactor =
          Math.sin(frame * pulseSpeed + i * 0.5) * 0.2 + 1;
        _dummy.position.set(p.x, p.y, p.z);
        _dummy.scale.setScalar(pulseFactor);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [currentPositions, frame, pulseSpeed],
  );

  // Build edge vertex positions for lineSegments.
  const edgePositions = useMemo(() => {
    if (edges.length === 0) return new Float32Array(0);
    const arr = new Float32Array(edges.length * 6);
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      const pa = currentPositions[a];
      const pb = currentPositions[b];
      if (!pa || !pb) continue;
      arr[i * 6] = pa.x;
      arr[i * 6 + 1] = pa.y;
      arr[i * 6 + 2] = pa.z;
      arr[i * 6 + 3] = pb.x;
      arr[i * 6 + 4] = pb.y;
      arr[i * 6 + 5] = pb.z;
    }
    return arr;
  }, [edges, currentPositions]);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Nodes rendered as instanced spheres */}
      <instancedMesh
        ref={instancedRef}
        args={[undefined, undefined, currentPositions.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[nodeSize, 12, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Edges rendered as line segments */}
      {edgePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[edgePositions, 3]}
              count={edgePositions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={edgeOpacity}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
};
