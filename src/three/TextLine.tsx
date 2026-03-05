/**
 * TextLine — 3D floating text rendered as a billboard sprite.
 *
 * Uses a canvas texture instead of @react-three/drei's Text to avoid
 * async font loading which crashes ThreeCanvas in Remotion.
 */
import React, { useMemo } from "react";
import * as THREE from "three";

interface TextLineProps {
  text: string;
  position?: [number, number, number];
  fontSize?: number;
  color?: string;
  opacity?: number;
  anchorX?: "left" | "center" | "right";
  anchorY?: "top" | "middle" | "bottom";
  rotation?: [number, number, number];
}

export const TextLine: React.FC<TextLineProps> = ({
  text,
  position = [0, 0, 0],
  fontSize = 0.3,
  color = "#FFFFFF",
  opacity = 1,
  rotation = [0, 0, 0],
}) => {
  const { texture, aspect } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // High-res canvas for crisp text
    const scale = 4;
    const fontPx = 64 * scale;
    ctx.font = `600 ${fontPx}px "Inter", "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontPx * 1.3;

    canvas.width = Math.ceil(textWidth + fontPx * 0.5);
    canvas.height = Math.ceil(textHeight);

    // Re-set font after canvas resize
    ctx.font = `600 ${fontPx}px "Inter", "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    return {
      texture: tex,
      aspect: canvas.width / canvas.height,
    };
  }, [text, color]);

  // Scale sprite to match fontSize prop
  const spriteScaleY = fontSize * 1.3;
  const spriteScaleX = spriteScaleY * aspect;

  return (
    <group position={position} rotation={rotation}>
      <sprite scale={[spriteScaleX, spriteScaleY, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={opacity}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </sprite>
    </group>
  );
};
