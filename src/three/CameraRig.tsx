/**
 * CameraRig — Keyframe-driven camera positioning for Remotion + R3F scenes.
 *
 * Reads useCurrentFrame() and smoothly interpolates the camera between
 * keyframe positions using Remotion's interpolate().
 */
import { useCurrentFrame } from "remotion";
import { interpolate } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface CameraKeyframe {
  frame: number;
  position: [number, number, number];
}

interface CameraRigProps {
  positions: CameraKeyframe[];
  lookAt?: [number, number, number];
}

export const CameraRig: React.FC<CameraRigProps> = ({
  positions,
  lookAt = [0, 0, 0],
}) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();

  // Sort keyframes by frame number
  const sorted = [...positions].sort((a, b) => a.frame - b.frame);

  if (sorted.length === 0) return null;

  // If only one keyframe or before the first keyframe, snap to the first
  if (sorted.length === 1 || frame <= sorted[0].frame) {
    camera.position.set(...sorted[0].position);
  } else if (frame >= sorted[sorted.length - 1].frame) {
    // After the last keyframe, snap to the last
    camera.position.set(...sorted[sorted.length - 1].position);
  } else {
    // Find the two surrounding keyframes
    let startIdx = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
        startIdx = i;
        break;
      }
    }

    const from = sorted[startIdx];
    const to = sorted[startIdx + 1];

    const x = interpolate(frame, [from.frame, to.frame], [from.position[0], to.position[0]], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [from.frame, to.frame], [from.position[1], to.position[1]], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const z = interpolate(frame, [from.frame, to.frame], [from.position[2], to.position[2]], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    camera.position.set(x, y, z);
  }

  camera.lookAt(new THREE.Vector3(...lookAt));
  camera.updateProjectionMatrix();

  return null;
};

