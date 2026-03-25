import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SCENE4_SHOTS, type Scene4ShotKey } from "./timings";
import { ShotS401 } from "./ShotS401";
import { ShotS402 } from "./ShotS402";
import { ShotS403 } from "./ShotS403";
import { ShotS404 } from "./ShotS404";
import { ShotS405a } from "./ShotS405a";
import { ShotS405b } from "./ShotS405b";
import { ShotS405c } from "./ShotS405c";
import { ShotS406 } from "./ShotS406";
import { ShotS407 } from "./ShotS407";
import { ShotS408 } from "./ShotS408";
import { ShotS409 } from "./ShotS409";
import { ShotS410 } from "./ShotS410";
import { ShotS411 } from "./ShotS411";

function makeShotRoot(
  Shot: React.ComponentType<{ shotFrame: number }>,
  displayName: string,
): React.FC {
  const Comp: React.FC = () => {
    const frame = useCurrentFrame();
    return (
      <AbsoluteFill>
        <Shot shotFrame={frame} />
      </AbsoluteFill>
    );
  };
  Comp.displayName = displayName;
  return Comp;
}

/** One Remotion root component per Scene 4 shot (Studio / isolated render). */
export const Scene4Shot_s4_01 = makeShotRoot(ShotS401, "Scene4Shot_s4_01");
export const Scene4Shot_s4_02 = makeShotRoot(ShotS402, "Scene4Shot_s4_02");
export const Scene4Shot_s4_03 = makeShotRoot(ShotS403, "Scene4Shot_s4_03");
export const Scene4Shot_s4_04 = makeShotRoot(ShotS404, "Scene4Shot_s4_04");
export const Scene4Shot_s4_05a = makeShotRoot(ShotS405a, "Scene4Shot_s4_05a");
export const Scene4Shot_s4_05b = makeShotRoot(ShotS405b, "Scene4Shot_s4_05b");
export const Scene4Shot_s4_05c = makeShotRoot(ShotS405c, "Scene4Shot_s4_05c");
export const Scene4Shot_s4_06 = makeShotRoot(ShotS406, "Scene4Shot_s4_06");
export const Scene4Shot_s4_07 = makeShotRoot(ShotS407, "Scene4Shot_s4_07");
export const Scene4Shot_s4_08 = makeShotRoot(ShotS408, "Scene4Shot_s4_08");
export const Scene4Shot_s4_09 = makeShotRoot(ShotS409, "Scene4Shot_s4_09");
export const Scene4Shot_s4_10 = makeShotRoot(ShotS410, "Scene4Shot_s4_10");
export const Scene4Shot_s4_11 = makeShotRoot(ShotS411, "Scene4Shot_s4_11");

const ROOT_BY_KEY: Record<Scene4ShotKey, React.FC> = {
  "s4-01": Scene4Shot_s4_01,
  "s4-02": Scene4Shot_s4_02,
  "s4-03": Scene4Shot_s4_03,
  "s4-04": Scene4Shot_s4_04,
  "s4-05a": Scene4Shot_s4_05a,
  "s4-05b": Scene4Shot_s4_05b,
  "s4-05c": Scene4Shot_s4_05c,
  "s4-06": Scene4Shot_s4_06,
  "s4-07": Scene4Shot_s4_07,
  "s4-08": Scene4Shot_s4_08,
  "s4-09": Scene4Shot_s4_09,
  "s4-10": Scene4Shot_s4_10,
  "s4-11": Scene4Shot_s4_11,
};

export type Scene4CompositionEntry = {
  id: string;
  component: React.FC;
  durationInFrames: number;
  shotKey: Scene4ShotKey;
};

/** Register each entry as its own `<Composition />` in Root. */
export const SCENE4_COMPOSITION_ENTRIES: Scene4CompositionEntry[] = SCENE4_SHOTS.map((s) => ({
  id: `Scene4-${s.key}`,
  component: ROOT_BY_KEY[s.key],
  durationInFrames: s.durationInFrames,
  shotKey: s.key,
}));
