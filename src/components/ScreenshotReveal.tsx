import React from "react";
import {
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface ZoomKeyframe {
  frame: number;
  scale: number;
  originX: number; // 0-100 percentage
  originY: number; // 0-100 percentage
}

interface ScreenshotRevealProps {
  src: string;
  delay?: number;
  style?: React.CSSProperties;
  /** Entrance animation style */
  animation?: "zoom" | "slide" | "fade" | "tilt";
  /** Continuous subtle 3D perspective drift */
  float3D?: boolean;
  /** Moving light reflection across the screenshot */
  glare?: boolean;
  /** Frame (local) at which glare sweep begins */
  glareDelay?: number;
  /** Zoom-to-feature keyframes — smoothly pans and zooms to areas of interest */
  zoomKeyframes?: ZoomKeyframe[];
  /** Dramatic 3D entrance tilt (SuperMotion-style) — strong rotateY/X that settles */
  dramaticEntrance?: boolean;
}

/** Smooth per-segment interpolation with easeInOut between each keyframe pair */
function interpolateSmooth(
  frame: number,
  keyframes: Array<{ frame: number; value: number }>,
): number {
  if (keyframes.length === 0) return 1;
  if (keyframes.length === 1) return keyframes[0].value;
  if (frame <= keyframes[0].frame) return keyframes[0].value;
  if (frame >= keyframes[keyframes.length - 1].frame)
    return keyframes[keyframes.length - 1].value;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame <= keyframes[i + 1].frame) {
      return interpolate(
        frame,
        [keyframes[i].frame, keyframes[i + 1].frame],
        [keyframes[i].value, keyframes[i + 1].value],
        { easing: Easing.inOut(Easing.quad) },
      );
    }
  }
  return keyframes[keyframes.length - 1].value;
}

/**
 * Displays a real app screenshot with:
 * - Browser chrome frame
 * - Polished reveal animation
 * - Optional 3D floating effect
 * - Optional zoom-to-feature keyframes
 * - Optional glare sweep
 */
export const ScreenshotReveal: React.FC<ScreenshotRevealProps> = ({
  src,
  delay = 0,
  style = {},
  animation = "zoom",
  float3D = false,
  glare = false,
  glareDelay = 30,
  zoomKeyframes,
  dramaticEntrance = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Entrance animation ──
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  // Entrance transform components
  let entranceScale = 1;
  let entranceTranslateY = 0;
  let entranceRotateY = 0;

  switch (animation) {
    case "zoom":
      entranceScale = interpolate(enter, [0, 1], [1.08, 1]);
      break;
    case "slide":
      entranceTranslateY = interpolate(enter, [0, 1], [40, 0]);
      break;
    case "tilt":
      entranceRotateY = interpolate(enter, [0, 1], [8, 0]);
      entranceScale = interpolate(enter, [0, 1], [0.95, 1]);
      break;
  }

  // ── 3D float ──
  const floatAmount = float3D ? Math.min(enter, 1) : 0;
  const floatRx = Math.sin(frame * 0.015) * 1.5 * floatAmount;
  const floatRy = Math.cos(frame * 0.012) * 2 * floatAmount;

  // ── Dramatic entrance tilt ──
  let dramaticRx = 0;
  let dramaticRy = 0;
  let dramaticScale = 1;
  if (dramaticEntrance) {
    const dramaticSpring = spring({
      frame: frame - delay,
      fps,
      config: { damping: 14, stiffness: 50, mass: 1.4 },
    });
    dramaticRx = interpolate(dramaticSpring, [0, 1], [6, 0]);
    dramaticRy = interpolate(dramaticSpring, [0, 1], [12, 0]);
    dramaticScale = interpolate(dramaticSpring, [0, 1], [0.92, 1]);
  }

  const needsPerspective = float3D || animation === "tilt" || dramaticEntrance;

  // Build combined outer transform
  const totalRx = floatRx + dramaticRx;
  const totalRy = entranceRotateY + floatRy + dramaticRy;
  const totalScale = entranceScale * dramaticScale;

  const parts: string[] = [];
  if (needsPerspective) parts.push("perspective(1200px)");
  if (totalRx !== 0) parts.push(`rotateX(${totalRx}deg)`);
  if (totalRy !== 0) parts.push(`rotateY(${totalRy}deg)`);
  if (entranceTranslateY !== 0)
    parts.push(`translateY(${entranceTranslateY}px)`);
  if (totalScale !== 1) parts.push(`scale(${totalScale})`);

  const outerTransform = parts.length > 0 ? parts.join(" ") : "none";

  // Dynamic shadow with parallax for 3D float
  const shadowX = float3D ? Math.cos(frame * 0.012) * -3 : 0;
  const shadowY = float3D ? 16 + Math.sin(frame * 0.015) * -3 : 16;
  const boxShadow = `${shadowX}px ${shadowY}px 48px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)`;

  // ── Zoom-to-feature keyframes ──
  let zoomScale = 1;
  let zoomOriginX = 50;
  let zoomOriginY = 50;

  if (zoomKeyframes && zoomKeyframes.length >= 2) {
    zoomScale = interpolateSmooth(
      frame,
      zoomKeyframes.map((k) => ({ frame: k.frame, value: k.scale })),
    );
    zoomOriginX = interpolateSmooth(
      frame,
      zoomKeyframes.map((k) => ({ frame: k.frame, value: k.originX })),
    );
    zoomOriginY = interpolateSmooth(
      frame,
      zoomKeyframes.map((k) => ({ frame: k.frame, value: k.originY })),
    );
  }

  // ── Glare sweep ──
  const glareX = glare
    ? interpolate(frame, [glareDelay, glareDelay + 60], [-200, 2000], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : -200;
  const glareOp = glare
    ? interpolate(
        frame,
        [glareDelay, glareDelay + 10, glareDelay + 50, glareDelay + 60],
        [0, 0.18, 0.18, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;

  return (
    <div
      style={{
        opacity,
        transform: outerTransform,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow,
        ...style,
      }}
    >
      {/* Inner zoom container — scales content within the frame */}
      <div
        style={{
          transformOrigin: `${zoomOriginX}% ${zoomOriginY}%`,
          transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
        }}
      >
        {/* Browser chrome bar */}
        <div
          style={{
            height: 32,
            background: "linear-gradient(180deg, #e8e8e8, #d4d4d4)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            gap: 7,
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#FF5F57",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#FEBC2E",
            }}
          />
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: "50%",
              backgroundColor: "#28C840",
            }}
          />
        </div>

        {/* Screenshot image + glare overlay */}
        <div style={{ position: "relative" }}>
          <Img
            src={staticFile(`screenshots/${src}`)}
            style={{ width: "100%", display: "block" }}
          />
          {glareOp > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: glareX,
                width: 300,
                height: "100%",
                background: `linear-gradient(105deg, transparent, rgba(255,255,255,${glareOp}), transparent)`,
                transform: "skewX(-15deg)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
