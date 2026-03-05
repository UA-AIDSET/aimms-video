import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClickRipple } from "./ClickRipple";

export interface CursorAction {
  /** Frame when cursor arrives at this position */
  frame: number;
  /** Target X coordinate (in 1920x1080 space) */
  x: number;
  /** Target Y coordinate (in 1920x1080 space) */
  y: number;
  /** Trigger a click animation at this position */
  click?: boolean;
}

interface AnimatedCursorProps {
  actions: CursorAction[];
  /** Frame at which cursor first appears */
  enterFrame?: number;
  /** Frame at which cursor disappears */
  exitFrame?: number;
  /** Ripple color */
  rippleColor?: string;
}

/**
 * Animated cursor overlay that moves between positions and clicks.
 * Renders an SVG macOS-style pointer arrow.
 */
export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  actions,
  enterFrame = 0,
  exitFrame,
  rippleColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (actions.length === 0) return null;

  // Fade in/out
  const fadeIn = interpolate(frame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = exitFrame
    ? interpolate(frame, [exitFrame - 10, exitFrame], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacity = fadeIn * fadeOut;

  if (opacity <= 0) return null;

  // Calculate current position by interpolating between actions
  let curX = actions[0].x;
  let curY = actions[0].y;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const prev = actions[i - 1];

    if (i === 0) {
      if (frame >= action.frame) {
        curX = action.x;
        curY = action.y;
      }
    } else if (prev) {
      // Transition window: start moving 20 frames before arrival
      const moveStart = Math.max(prev.frame, action.frame - 20);
      const moveEnd = action.frame;

      if (frame >= moveEnd) {
        curX = action.x;
        curY = action.y;
      } else if (frame > moveStart) {
        const progress = spring({
          frame: frame - moveStart,
          fps,
          config: { damping: 22, stiffness: 100, mass: 0.8 },
          durationInFrames: moveEnd - moveStart,
        });
        curX = interpolate(progress, [0, 1], [prev.x, action.x]);
        curY = interpolate(progress, [0, 1], [prev.y, action.y]);
      } else if (frame >= prev.frame) {
        curX = prev.x;
        curY = prev.y;
      }
    }
  }

  // Click animation: slight scale down on click frames
  let cursorScale = 1;
  for (const action of actions) {
    if (action.click && frame >= action.frame && frame < action.frame + 6) {
      const clickProgress = (frame - action.frame) / 6;
      cursorScale = clickProgress < 0.4 ? 0.82 : 1;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        opacity,
      }}
    >
      {/* Click ripples */}
      {actions
        .filter((a) => a.click)
        .map((action, i) => (
          <ClickRipple
            key={i}
            x={action.x}
            y={action.y}
            triggerFrame={action.frame}
            color={rippleColor}
          />
        ))}

      {/* Cursor arrow */}
      <div
        style={{
          position: "absolute",
          left: curX,
          top: curY,
          transform: `scale(${cursorScale})`,
          transformOrigin: "top left",
          filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.4))",
        }}
      >
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
          <path
            d="M2 2L2 24L8 18L14 28L18 26L12 16L20 16L2 2Z"
            fill="white"
            stroke="black"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
