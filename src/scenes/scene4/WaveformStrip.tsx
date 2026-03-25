import React from "react";
import { colors } from "../../theme";

type Props = { color: string; seed?: number; height?: number };

export const WaveformStrip: React.FC<Props> = ({ color, seed = 0, height = 200 }) => {
  const w = 900;
  const pts: string[] = [];
  const step = 8;
  for (let x = 0; x <= w; x += step) {
    const t = (x + seed) * 0.08;
    const y = height / 2 + Math.sin(t) * (height * 0.22) + Math.sin(t * 2.3) * (height * 0.08);
    pts.push(`${x},${y}`);
  }
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
};
