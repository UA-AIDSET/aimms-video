import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

interface MedicalSilhouetteProps {
  enterFrame?: number;
  exitFrame?: number;
  opacity?: number;
  color?: string;
  scale?: number;
}

/**
 * Realistic human silhouette — three separate closed paths (body, right arm, left arm)
 * so no stray lines appear. Cycling organ highlights, scan grid, joint markers.
 */
export const MedicalSilhouette: React.FC<MedicalSilhouetteProps> = ({
  enterFrame = 0,
  exitFrame = 9999,
  opacity: opacityProp = 1,
  color = colors.ecgGreen,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const fadeIn = interpolate(frame, [enterFrame, enterFrame + 30], [0, 1], clamp);
  const fadeOut = interpolate(frame, [exitFrame - 30, exitFrame], [1, 0], clamp);
  const baseOpacity = fadeIn * fadeOut * opacityProp;
  if (baseOpacity <= 0) return null;

  const drawProgress = interpolate(frame, [enterFrame, enterFrame + 60], [0, 1], clamp);
  const pulse = 0.85 + 0.15 * Math.sin((frame - enterFrame) * 0.08);

  const scanY = interpolate(
    (frame - enterFrame) % 100,
    [0, 100],
    [30, 670],
    clamp,
  );

  // Organ cycling: 240 frame cycle, 4 groups
  const cycleFrame = (frame - enterFrame) % 240;
  const organGroup = Math.floor(cycleFrame / 60);
  const groupPulse = 0.5 + 0.5 * Math.sin(((cycleFrame % 60) / 60) * Math.PI);

  // Main body — single continuous closed path: head → right torso → right leg → left leg → left torso → head
  const bodyPath = [
    // Top of head
    "M 200,30",
    // Head right
    "C 222,30 238,50 238,78",
    "C 238,104 224,120 212,126",
    // Neck right
    "L 212,148",
    // Right shoulder
    "C 230,154 256,166 274,182",
    "C 286,192 292,204 296,218",
    // Right torso
    "L 290,260",
    "L 286,300",
    "L 282,340",
    "L 276,380",
    "L 268,408",
    // Right hip
    "C 264,420 260,434 258,448",
    // Right thigh
    "C 256,470 252,496 250,520",
    "C 248,544 246,560 246,576",
    // Right knee
    "C 246,590 244,600 244,610",
    // Right shin — gentle taper
    "C 244,630 242,650 240,665",
    // Right ankle
    "C 240,675 238,682 234,688",
    // Right foot
    "L 222,694",
    "C 218,696 214,694 212,690",
    "L 210,682",
    // Crotch — cross over
    "L 200,670",
    // Left inner leg
    "L 190,682",
    "L 188,690",
    "C 186,694 182,696 178,694",
    "L 166,688",
    // Left ankle
    "C 162,682 160,675 160,665",
    // Left shin
    "C 158,650 156,630 156,610",
    // Left knee
    "C 156,600 154,590 154,576",
    // Left thigh
    "C 154,560 152,544 150,520",
    "C 148,496 144,470 142,448",
    // Left hip
    "C 140,434 136,420 132,408",
    // Left waist
    "L 124,380",
    "L 118,340",
    "L 114,300",
    "L 110,260",
    // Left shoulder
    "L 104,218",
    "C 108,204 114,192 126,182",
    "C 144,166 170,154 188,148",
    // Neck left
    "L 188,126",
    // Head left
    "C 176,120 162,104 162,78",
    "C 162,50 178,30 200,30",
    "Z",
  ].join(" ");

  // Right arm — separate closed path (outer edge down, inner edge up)
  const rightArm = [
    "M 296,218",
    // Outer edge going down
    "C 302,228 310,248 316,270",
    "C 320,288 324,308 326,320",
    "C 328,338 328,352 326,364",
    "C 324,380 320,398 316,416",
    "C 314,428 310,440 306,452",
    // Wrist
    "C 304,460 300,468 296,474",
    // Hand
    "C 292,482 286,486 282,482",
    "C 278,476 280,466 284,454",
    // Inner edge going up
    "C 286,442 288,430 290,416",
    "C 292,398 294,380 296,364",
    "C 298,348 298,332 296,318",
    "C 294,302 290,280 288,260",
    "L 290,240",
    "L 296,218",
    "Z",
  ].join(" ");

  // Left arm — separate closed path
  const leftArm = [
    "M 104,218",
    // Outer edge going down
    "L 110,240",
    "L 112,260",
    "C 110,280 106,302 104,318",
    "C 102,332 102,348 104,364",
    "C 106,380 108,398 110,416",
    "C 112,430 114,442 116,454",
    // Inner edge up — hand
    "C 120,466 122,476 118,482",
    "C 114,486 108,482 104,474",
    // Wrist
    "C 100,468 96,460 94,452",
    "C 90,440 86,428 84,416",
    "C 80,398 76,380 74,364",
    "C 72,352 72,338 74,320",
    "C 76,308 80,288 84,270",
    "C 90,248 98,228 104,218",
    "Z",
  ].join(" ");

  // Organ paths
  const leftLung = "M 136,200 C 130,210 126,240 128,270 C 130,295 136,310 148,310 L 176,310 L 184,290 L 188,260 L 184,230 L 176,210 C 164,200 150,196 136,200 Z";
  const rightLung = "M 264,200 C 270,210 274,240 272,270 C 270,295 264,310 252,310 L 224,310 L 216,290 L 212,260 L 216,230 L 224,210 C 236,200 250,196 264,200 Z";
  const heart = "M 192,240 C 192,226 200,218 208,218 C 216,218 224,226 224,240 C 224,260 208,280 208,280 C 208,280 192,260 192,240 Z";
  const brain = "M 178,50 C 178,40 185,34 195,34 C 198,32 202,32 205,34 C 215,34 222,40 222,50 C 224,52 225,56 224,60 C 225,68 222,74 216,78 C 214,82 208,86 200,86 C 192,86 186,82 184,78 C 178,74 175,68 176,60 C 175,56 176,52 178,50 Z";
  const stomach = "M 190,320 C 186,322 182,330 182,342 C 182,358 190,370 202,374 C 214,378 224,370 226,358 C 228,346 224,334 218,328 C 214,322 206,318 198,318 C 194,318 192,319 190,320 Z";
  const liver = "M 220,310 C 230,308 248,310 260,318 C 270,324 274,334 270,344 C 266,354 256,360 244,360 C 232,360 222,354 218,344 C 214,334 214,318 220,310 Z";
  const leftKidney = "M 148,360 C 144,356 140,360 140,370 C 140,382 146,390 152,390 C 158,390 162,382 162,370 C 162,360 156,354 152,356 L 148,360 Z";
  const rightKidney = "M 252,360 C 256,356 260,360 260,370 C 260,382 254,390 248,390 C 242,390 238,382 238,370 C 238,360 244,354 248,356 L 252,360 Z";
  const spineSegments = Array.from({ length: 12 }, (_, i) => {
    const y = 150 + i * 22;
    return `M 196,${y} L 204,${y} L 206,${y + 8} L 194,${y + 8} Z`;
  });

  const ribs = [
    "M 140,220 Q 200,212 260,220",
    "M 136,240 Q 200,232 264,240",
    "M 134,260 Q 200,252 266,260",
    "M 132,280 Q 200,272 268,280",
    "M 136,300 Q 200,294 264,300",
  ];

  const gridLines: string[] = [];
  for (let y = 50; y < 700; y += 50) gridLines.push(`M 60,${y} L 340,${y}`);
  for (let x = 80; x < 340; x += 50) gridLines.push(`M ${x},30 L ${x},700`);

  const joints = [
    [200, 30], [200, 78], [200, 148],
    [104, 218], [296, 218],
    [74, 320], [326, 320],
    [104, 474], [296, 474],
    [132, 408], [268, 408],
    [154, 576], [246, 576],
    [160, 665], [240, 665],
  ];

  // All body paths rendered together
  const allPaths = [bodyPath, rightArm, leftArm];

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: baseOpacity,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <svg width={400} height={720} viewBox="0 0 400 720" style={{ overflow: "visible" }}>
        <defs>
          <filter id="silGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /></feMerge>
          </filter>
          <filter id="organBright" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="35%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="65%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bodyFill" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </radialGradient>
        </defs>

        {/* Scan grid */}
        <g opacity={0.05 * drawProgress}>
          {gridLines.map((d, i) => (
            <path key={i} d={d} stroke={color} strokeWidth={0.5} fill="none" />
          ))}
        </g>

        {/* Scan line sweep */}
        <rect x={50} y={scanY - 40} width={300} height={80} fill="url(#scanLine)" opacity={0.5 * drawProgress} />

        {/* Body fills */}
        {allPaths.map((p, i) => (
          <path key={`fill-${i}`} d={p} fill="url(#bodyFill)" stroke="none" opacity={drawProgress} />
        ))}

        {/* Body outlines — glow */}
        {allPaths.map((p, i) => (
          <path key={`glow-${i}`} d={p} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.6 * pulse * drawProgress} filter="url(#silGlow)" />
        ))}
        {/* Body outlines — sharp */}
        {allPaths.map((p, i) => (
          <path key={`sharp-${i}`} d={p} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.9 * pulse * drawProgress} />
        ))}

        {/* Ribcage */}
        {ribs.map((d, i) => (
          <path key={`rib-${i}`} d={d} fill="none" stroke={color} strokeWidth={0.8} opacity={0.2 * drawProgress * pulse} />
        ))}

        {/* Organ Group 0: Lungs + Heart */}
        {(() => {
          const isActive = organGroup === 0;
          const lungOp = isActive ? 0.8 * groupPulse : 0.25;
          const heartPulse = 0.6 + 0.4 * Math.sin((frame - enterFrame) * 0.2);
          const heartOp = isActive ? 0.9 * groupPulse : 0.3;
          return (
            <>
              <path d={leftLung} fill={color} fillOpacity={0.15 * lungOp * drawProgress} stroke={color} strokeWidth={1.5} opacity={lungOp * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
              <path d={rightLung} fill={color} fillOpacity={0.15 * lungOp * drawProgress} stroke={color} strokeWidth={1.5} opacity={lungOp * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
              <path d={heart} fill={colors.vitalsCritical} fillOpacity={0.25 * heartOp * drawProgress} stroke={colors.vitalsCritical} strokeWidth={1.5} opacity={heartOp * heartPulse * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
            </>
          );
        })()}

        {/* Organ Group 1: Brain */}
        {(() => {
          const isActive = organGroup === 1;
          const op = isActive ? 0.85 * groupPulse : 0.15;
          return <path d={brain} fill={colors.oasis} fillOpacity={0.2 * op * drawProgress} stroke={colors.oasis} strokeWidth={1.5} opacity={op * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />;
        })()}

        {/* Organ Group 2: Stomach + Liver */}
        {(() => {
          const isActive = organGroup === 2;
          const op = isActive ? 0.8 * groupPulse : 0.15;
          return (
            <>
              <path d={stomach} fill={colors.vitalsWarning} fillOpacity={0.2 * op * drawProgress} stroke={colors.vitalsWarning} strokeWidth={1.2} opacity={op * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
              <path d={liver} fill={colors.vitalsWarning} fillOpacity={0.15 * op * drawProgress} stroke={colors.vitalsWarning} strokeWidth={1.2} opacity={op * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
            </>
          );
        })()}

        {/* Organ Group 3: Kidneys + Spine */}
        {(() => {
          const isActive = organGroup === 3;
          const op = isActive ? 0.8 * groupPulse : 0.15;
          return (
            <>
              <path d={leftKidney} fill={colors.oasis} fillOpacity={0.2 * op * drawProgress} stroke={colors.oasis} strokeWidth={1.2} opacity={op * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
              <path d={rightKidney} fill={colors.oasis} fillOpacity={0.2 * op * drawProgress} stroke={colors.oasis} strokeWidth={1.2} opacity={op * drawProgress} filter={isActive ? "url(#organBright)" : undefined} />
              {spineSegments.map((d, i) => (
                <path key={`spine-${i}`} d={d} fill={color} fillOpacity={0.12 * op * drawProgress} stroke={color} strokeWidth={0.8} opacity={op * drawProgress * 0.7} />
              ))}
            </>
          );
        })()}

        {/* Joint markers */}
        {joints.map(([cx, cy], i) => {
          const jOp = interpolate(frame, [enterFrame + 30 + i * 2, enterFrame + 45 + i * 2], [0, 1], clamp);
          return (
            <g key={`j-${i}`} opacity={jOp * pulse * drawProgress}>
              <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.9} />
              <circle cx={cx} cy={cy} r={7} fill="none" stroke={color} strokeWidth={0.5} opacity={0.4} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
