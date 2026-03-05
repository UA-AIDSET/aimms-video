/**
 * AbstractBody — An abstract human silhouette made of ~100 glowing nodes
 * connected by edges, forming a constellation-like body outline.
 *
 * Uses useCurrentFrame() from Remotion (never useFrame from R3F) to drive
 * highlight pulsing.  Nodes are rendered via instancedMesh and edges via
 * lineSegments for efficient rendering.
 */
import React, { useMemo, useCallback } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";

type BodyRegion = "head" | "chest" | "abdomen" | "extremities" | null;

interface AbstractBodyProps {
  rotation?: [number, number, number];
  color?: string;
  highlightRegion?: BodyRegion;
  highlightColor?: string;
  opacity?: number;
  scale?: number;
  position?: [number, number, number];
}

/** Simple deterministic pseudo-random based on seed. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/** Region index ranges for each body cluster. */
const REGIONS: Record<string, [number, number]> = {
  head: [0, 14],
  neck: [15, 18],
  chest: [19, 31],
  abdomen: [32, 44],
  leftArm: [45, 56],
  rightArm: [57, 68],
  leftLeg: [69, 83],
  rightLeg: [84, 98],
};

/** Map highlight regions to the node index ranges they cover. */
function getHighlightRanges(region: BodyRegion): Array<[number, number]> {
  switch (region) {
    case "head":
      return [REGIONS.head, REGIONS.neck];
    case "chest":
      return [REGIONS.chest];
    case "abdomen":
      return [REGIONS.abdomen];
    case "extremities":
      return [
        REGIONS.leftArm,
        REGIONS.rightArm,
        REGIONS.leftLeg,
        REGIONS.rightLeg,
      ];
    default:
      return [];
  }
}

function isHighlighted(nodeIndex: number, region: BodyRegion): boolean {
  if (!region) return false;
  const ranges = getHighlightRanges(region);
  return ranges.some(([lo, hi]) => nodeIndex >= lo && nodeIndex <= hi);
}

/** Generate body node positions. */
function generateBodyNodes(): Array<{ x: number; y: number; z: number }> {
  const nodes: Array<{ x: number; y: number; z: number }> = [];

  // Head (0-14): ~15 nodes in a rough circle at y=1.5-1.9
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const r = 0.25 + seededRandom(i * 7) * 0.08;
    nodes.push({
      x: Math.cos(angle) * r,
      y: 1.7 + Math.sin(angle) * 0.18,
      z: (seededRandom(i * 13) - 0.5) * 0.15,
    });
  }

  // Neck (15-18): 4 nodes
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    nodes.push({
      x: (seededRandom(100 + i) - 0.5) * 0.12,
      y: 1.3 + t * 0.2,
      z: (seededRandom(200 + i) - 0.5) * 0.08,
    });
  }

  // Torso upper / chest (19-31): 13 nodes, y=0.8-1.3
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const side = i % 2 === 0 ? 1 : -1;
    const width = 0.35 + Math.sin(t * Math.PI) * 0.15;
    nodes.push({
      x: side * width * (0.5 + seededRandom(300 + i) * 0.5),
      y: 1.3 - t * 0.5,
      z: (seededRandom(400 + i) - 0.5) * 0.15,
    });
  }

  // Torso lower / abdomen (32-44): 13 nodes, y=0.3-0.8
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const side = i % 2 === 0 ? 1 : -1;
    const width = 0.4 - t * 0.1;
    nodes.push({
      x: side * width * (0.5 + seededRandom(500 + i) * 0.5),
      y: 0.8 - t * 0.5,
      z: (seededRandom(600 + i) - 0.5) * 0.12,
    });
  }

  // Left arm (45-56): 12 nodes from shoulder to hand
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    nodes.push({
      x: -0.55 - t * 0.45,
      y: 1.2 - t * 0.8,
      z: (seededRandom(700 + i) - 0.5) * 0.1,
    });
  }

  // Right arm (57-68): 12 nodes mirrored
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    nodes.push({
      x: 0.55 + t * 0.45,
      y: 1.2 - t * 0.8,
      z: (seededRandom(800 + i) - 0.5) * 0.1,
    });
  }

  // Left leg (69-83): 15 nodes from hip to foot
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    nodes.push({
      x: -0.22 - t * 0.08 + Math.sin(t * Math.PI * 0.5) * 0.05,
      y: 0.3 - t * 1.5,
      z: (seededRandom(900 + i) - 0.5) * 0.1,
    });
  }

  // Right leg (84-98): 15 nodes mirrored
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    nodes.push({
      x: 0.22 + t * 0.08 - Math.sin(t * Math.PI * 0.5) * 0.05,
      y: 0.3 - t * 1.5,
      z: (seededRandom(1000 + i) - 0.5) * 0.1,
    });
  }

  return nodes;
}

/** Generate edges connecting nodes within and between clusters. */
function generateEdges(): Array<[number, number]> {
  const edges: Array<[number, number]> = [];

  // Connect sequential nodes within each cluster.
  const clusters: Array<[number, number]> = [
    [0, 14],   // head
    [15, 18],  // neck
    [19, 31],  // chest
    [32, 44],  // abdomen
    [45, 56],  // left arm
    [57, 68],  // right arm
    [69, 83],  // left leg
    [84, 98],  // right leg
  ];

  for (const [start, end] of clusters) {
    for (let i = start; i < end; i++) {
      edges.push([i, i + 1]);
    }
    // Close loop for head
    if (start === 0) {
      edges.push([end, start]);
    }
  }

  // Cross-connections for organic feel.
  // Head to neck
  edges.push([7, 15], [0, 16]);
  // Neck to chest
  edges.push([15, 19], [18, 20]);
  // Chest to abdomen
  edges.push([30, 32], [31, 33]);
  // Chest to arms (shoulders)
  edges.push([19, 45], [20, 57]);
  // Abdomen to legs (hips)
  edges.push([43, 69], [44, 84]);
  // Extra cross-connections within torso
  edges.push([21, 24], [25, 28], [34, 37], [38, 41]);
  // Extra within head
  edges.push([0, 7], [3, 11], [5, 13]);

  return edges;
}

/** Per-node size variation. */
function nodeBaseSize(index: number): number {
  return 0.04 + seededRandom(index * 37 + 5) * 0.03;
}

export const AbstractBody: React.FC<AbstractBodyProps> = ({
  rotation = [0, 0, 0],
  color = "#378DBD",
  highlightRegion = null,
  highlightColor = "#39FF14",
  opacity = 1,
  scale = 1,
  position = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();
  const _dummy = useMemo(() => new THREE.Object3D(), []);

  const bodyNodes = useMemo(() => generateBodyNodes(), []);
  const bodyEdges = useMemo(() => generateEdges(), []);

  // Separate nodes into base and highlighted groups.
  const { baseIndices, highlightIndices } = useMemo(() => {
    const base: number[] = [];
    const highlight: number[] = [];
    for (let i = 0; i < bodyNodes.length; i++) {
      if (isHighlighted(i, highlightRegion)) {
        highlight.push(i);
      } else {
        base.push(i);
      }
    }
    return { baseIndices: base, highlightIndices: highlight };
  }, [bodyNodes.length, highlightRegion]);

  // Callback ref: sets base node matrices immediately when mesh is available.
  const instancedRef = useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      for (let j = 0; j < baseIndices.length; j++) {
        const i = baseIndices[j];
        const p = bodyNodes[i];
        const s = nodeBaseSize(i);
        _dummy.position.set(p.x, p.y, p.z);
        _dummy.scale.setScalar(s / 0.06);
        _dummy.updateMatrix();
        mesh.setMatrixAt(j, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [baseIndices, bodyNodes, _dummy],
  );

  // Callback ref: sets highlighted node matrices with pulsing.
  const highlightedInstancedRef = useCallback(
    (mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return;
      for (let j = 0; j < highlightIndices.length; j++) {
        const i = highlightIndices[j];
        const p = bodyNodes[i];
        const baseSize = nodeBaseSize(i);
        const pulse = Math.sin(frame * 0.05 + i * 0.3) * 0.4 + 1.3;
        const s = (baseSize / 0.06) * pulse;
        _dummy.position.set(p.x, p.y, p.z);
        _dummy.scale.setScalar(s);
        _dummy.updateMatrix();
        mesh.setMatrixAt(j, _dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    [highlightIndices, bodyNodes, frame, _dummy],
  );

  // Build base edge vertex positions.
  const baseEdgePositions = useMemo(() => {
    const baseEdges = bodyEdges.filter(
      ([a, b]) =>
        !isHighlighted(a, highlightRegion) ||
        !isHighlighted(b, highlightRegion)
    );
    const arr = new Float32Array(baseEdges.length * 6);
    for (let i = 0; i < baseEdges.length; i++) {
      const [a, b] = baseEdges[i];
      const pa = bodyNodes[a];
      const pb = bodyNodes[b];
      arr[i * 6] = pa.x;
      arr[i * 6 + 1] = pa.y;
      arr[i * 6 + 2] = pa.z;
      arr[i * 6 + 3] = pb.x;
      arr[i * 6 + 4] = pb.y;
      arr[i * 6 + 5] = pb.z;
    }
    return arr;
  }, [bodyEdges, bodyNodes, highlightRegion]);

  // Build highlighted edge vertex positions.
  const highlightEdgePositions = useMemo(() => {
    if (!highlightRegion) return new Float32Array(0);
    const hlEdges = bodyEdges.filter(
      ([a, b]) =>
        isHighlighted(a, highlightRegion) &&
        isHighlighted(b, highlightRegion)
    );
    const arr = new Float32Array(hlEdges.length * 6);
    for (let i = 0; i < hlEdges.length; i++) {
      const [a, b] = hlEdges[i];
      const pa = bodyNodes[a];
      const pb = bodyNodes[b];
      arr[i * 6] = pa.x;
      arr[i * 6 + 1] = pa.y;
      arr[i * 6 + 2] = pa.z;
      arr[i * 6 + 3] = pb.x;
      arr[i * 6 + 4] = pb.y;
      arr[i * 6 + 5] = pb.z;
    }
    return arr;
  }, [bodyEdges, bodyNodes, highlightRegion]);

  // Pulsing opacity for highlighted edges.
  const hlEdgeOpacity = highlightRegion
    ? 0.4 + Math.sin(frame * 0.05) * 0.2
    : 0;

  return (
    <group
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      {/* Base (non-highlighted) nodes */}
      {baseIndices.length > 0 && (
        <instancedMesh
          ref={instancedRef}
          args={[undefined, undefined, baseIndices.length]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.06, 10, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}

      {/* Highlighted nodes */}
      {highlightIndices.length > 0 && (
        <instancedMesh
          ref={highlightedInstancedRef}
          args={[undefined, undefined, highlightIndices.length]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.06, 10, 6]} />
          <meshBasicMaterial
            color={highlightColor}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}

      {/* Base edges */}
      {baseEdgePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[baseEdgePositions, 3]}
              count={baseEdgePositions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.25 * opacity}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {/* Highlighted edges */}
      {highlightEdgePositions.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[highlightEdgePositions, 3]}
              count={highlightEdgePositions.length / 3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={highlightColor}
            transparent
            opacity={hlEdgeOpacity * opacity}
            depthWrite={false}
          />
        </lineSegments>
      )}
    </group>
  );
};
