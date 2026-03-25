import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, fonts } from "../theme";

/**
 * Scene 0 — Cold Open: ASTEC Building Zoom
 * 240 frames @ 30fps = 8s
 *
 * f  0– 20   Fade in from black
 * f  0–240   Slow push-in Ken Burns on building
 * f 30–100   "ASTEC" large centered
 * f 80–180   "Where University of Arizona health professionals learn" lower third
 * f190–240   Fade to black into Scene 1
 */

const CE   = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const eOut = Easing.out(Easing.cubic);
const eIO  = Easing.inOut(Easing.cubic);

export const Scene0_ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn  = interpolate(frame, [0, 18], [0, 1], CE);
  const fadeOut = interpolate(frame, [200, 238], [1, 0], { ...CE, easing: eIO });
  const master  = Math.min(fadeIn, fadeOut);

  const kbScale = interpolate(frame, [0, 240], [1.0, 1.12], CE);
  const kbY     = interpolate(frame, [0, 240], [0, -24], CE);

  const baseOp = interpolate(frame, [0, 50, 140, 200], [0.52, 0.44, 0.52, 0.72], CE);

  /* "ASTEC" */
  const titleOp = interpolate(frame, [30, 58, 90, 115], [0, 1, 1, 0], CE);
  const titleY  = interpolate(frame, [30, 58], [20, 0], { ...CE, easing: eOut });

  /* lower-third line */
  const ltOp = interpolate(frame, [82, 112, 165, 190], [0, 1, 1, 0], CE);
  const ltX  = interpolate(frame, [82, 112], [-20, 0], { ...CE, easing: eOut });

  /* accent rule under ASTEC */
  const ruleW = interpolate(frame, [50, 88], [0, 1], { ...CE, easing: eOut });
  const ruleOp = interpolate(frame, [50, 88, 165, 190], [0, 1, 1, 0], CE);

  const lbH = 60;

  return (
    <AbsoluteFill style={{ opacity: master, overflow: "hidden", background: "#000" }}>

      {/* Building photo — Ken Burns push-in */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile("screenshots/astec_exterior.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            transform: `scale(${kbScale}) translateY(${kbY}px)`,
            transformOrigin: "50% 45%",
            filter: "saturate(0.8) brightness(0.9)",
          }}
        />
      </AbsoluteFill>

      {/* Dark cinematic overlay */}
      <AbsoluteFill style={{
        background: `linear-gradient(
          180deg,
          rgba(0,0,0,0.22) 0%,
          rgba(0,0,0,0.08) 30%,
          rgba(0,0,0,0.40) 65%,
          rgba(0,0,0,0.82) 100%
        )`,
        opacity: baseOp,
      }} />

      {/* Letterbox bars */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: lbH, background: "#000", zIndex: 20 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: lbH, background: "#000", zIndex: 20 }} />

      {/* ── "ASTEC" — large centered ── */}
      {titleOp > 0.01 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) translateY(${titleY}px)`,
          opacity: titleOp,
          zIndex: 30,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: fonts.heading,
            fontSize: 160,
            fontWeight: 900,
            color: colors.white,
            letterSpacing: -3,
            lineHeight: 1,
            textShadow: `0 0 100px rgba(255,255,255,0.18), 0 4px 48px rgba(0,0,0,0.65)`,
          }}>
            ASTEC
          </div>
        </div>
      )}

      {/* ── Accent rule — centered under title ── */}
      {ruleOp > 0.01 && (
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, 52px)",
          zIndex: 30,
          opacity: ruleOp,
        }}>
          <div style={{
            height: 3,
            width: `${ruleW * 320}px`,
            background: `linear-gradient(90deg, ${colors.arizonaRed}00, ${colors.arizonaRed}, ${colors.arizonaRed}00)`,
            borderRadius: 2,
            boxShadow: `0 0 20px ${colors.arizonaRed}66`,
          }} />
        </div>
      )}

      {/* ── Lower third — "Where UA health professionals learn" ── */}
      {ltOp > 0.01 && (
        <div style={{
          position: "absolute",
          bottom: lbH + 60,
          left: 80,
          transform: `translateX(${ltX}px)`,
          opacity: ltOp,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}>
          <div style={{
            width: 5, height: 44,
            background: colors.arizonaRed,
            borderRadius: 3,
            boxShadow: `0 0 16px ${colors.arizonaRed}80`,
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: fonts.heading,
            fontSize: 44,
            fontWeight: 700,
            color: colors.white,
            letterSpacing: 0,
            textShadow: `0 2px 32px rgba(0,0,0,0.7)`,
          }}>
            Where University of Arizona
            <br />
            Health Professionals Learn
          </span>
        </div>
      )}

    </AbsoluteFill>
  );
};
