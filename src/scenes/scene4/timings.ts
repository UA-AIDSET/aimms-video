/**
 * Scene 4 — deterministic shot timeline (1875 frames @ 30fps).
 * Exactly one focal visual per shot; no overlap.
 */
export const SCENE4_TOTAL_FRAMES = 1875;

export const SCENE4_SHOTS = [
  { key: "s4-01", durationInFrames: 120 },
  { key: "s4-02", durationInFrames: 140 },
  { key: "s4-03", durationInFrames: 140 },
  { key: "s4-04", durationInFrames: 100 },
  { key: "s4-05a", durationInFrames: 90 },
  { key: "s4-05b", durationInFrames: 90 },
  { key: "s4-05c", durationInFrames: 90 },
  { key: "s4-06", durationInFrames: 120 },
  { key: "s4-07", durationInFrames: 300 },
  { key: "s4-08", durationInFrames: 160 },
  { key: "s4-09", durationInFrames: 160 },
  { key: "s4-10", durationInFrames: 180 },
  { key: "s4-11", durationInFrames: 185 },
] as const;

export type Scene4ShotKey = (typeof SCENE4_SHOTS)[number]["key"];

const starts: number[] = [];
let acc = 0;
for (const s of SCENE4_SHOTS) {
  starts.push(acc);
  acc += s.durationInFrames;
}

export function resolveScene4Shot(frame: number): {
  shotIndex: number;
  shotKey: Scene4ShotKey;
  shotFrame: number;
  shotStart: number;
} {
  const f = Math.max(0, Math.min(SCENE4_TOTAL_FRAMES - 1, Math.floor(frame)));
  let idx = SCENE4_SHOTS.length - 1;
  for (let i = 0; i < SCENE4_SHOTS.length; i++) {
    const end = starts[i] + SCENE4_SHOTS[i].durationInFrames;
    if (f < end) {
      idx = i;
      break;
    }
  }
  const shotStart = starts[idx];
  const shotFrame = f - shotStart;
  return {
    shotIndex: idx,
    shotKey: SCENE4_SHOTS[idx].key,
    shotFrame,
    shotStart,
  };
}
