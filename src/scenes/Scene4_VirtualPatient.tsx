import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { resolveScene4Shot, type Scene4ShotKey } from "./scene4/timings";
import { ShotS401 } from "./scene4/ShotS401";
import { ShotS402 } from "./scene4/ShotS402";
import { ShotS403 } from "./scene4/ShotS403";
import { ShotS404 } from "./scene4/ShotS404";
import { ShotS405a } from "./scene4/ShotS405a";
import { ShotS405b } from "./scene4/ShotS405b";
import { ShotS405c } from "./scene4/ShotS405c";
import { ShotS406 } from "./scene4/ShotS406";
import { ShotS407 } from "./scene4/ShotS407";
import { ShotS408 } from "./scene4/ShotS408";
import { ShotS409 } from "./scene4/ShotS409";
import { ShotS410 } from "./scene4/ShotS410";
import { ShotS411 } from "./scene4/ShotS411";

const SHOTS: Record<Scene4ShotKey, React.FC<{ shotFrame: number }>> = {
  "s4-01": ShotS401,
  "s4-02": ShotS402,
  "s4-03": ShotS403,
  "s4-04": ShotS404,
  "s4-05a": ShotS405a,
  "s4-05b": ShotS405b,
  "s4-05c": ShotS405c,
  "s4-06": ShotS406,
  "s4-07": ShotS407,
  "s4-08": ShotS408,
  "s4-09": ShotS409,
  "s4-10": ShotS410,
  "s4-11": ShotS411,
};

export const Scene4_VirtualPatient: React.FC = () => {
  const frame = useCurrentFrame();
  const { shotKey, shotFrame } = resolveScene4Shot(frame);
  const Comp = SHOTS[shotKey];

  return (
    <AbsoluteFill>
      <Comp shotFrame={shotFrame} />
    </AbsoluteFill>
  );
};
