import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1_Intro } from "./scenes/Scene1_Intro";
import { Scene2_MCC } from "./scenes/Scene2_MCC";
import { Scene3_Assignment } from "./scenes/Scene3_Assignment";
import { Scene4_VirtualPatient } from "./scenes/Scene4_VirtualPatient";
import { Scene5_AIMHEI } from "./scenes/Scene5_AIMHEI";
import { Scene6_FlowRecap } from "./scenes/Scene6_FlowRecap";

/**
 * AIMMS LMS Flow Demo Video v3
 *
 * Voice: ElevenLabs voice tM6ZW48ZoSKdJKuhjatr
 * Model: eleven_monolingual_v1, stability 0.85, similarity_boost 0.75, style 0.0
 *
 * Scene durations (v5 — slower narration pacing):
 * 1. Intro/Title         — 540 frames (18.0s)  audio ~16s
 * 2. MCC Case Creator    — 810 frames (27.0s)  audio ~25s
 * 3. Faculty Assignment  — 660 frames (22.0s)  audio ~20s
 * 4. Virtual Patient     — 1740 frames (58.0s) audio ~55s
 * 5. AIMHEI Reports      — 720 frames (24.0s)  audio ~22s
 * 6. Flow Recap & Close  — 720 frames (24.0s)  audio ~22s
 *
 * Total: 5190 - 75 (5 fade transitions × 15 frames) = 5115 frames (~2:50)
 */

const FADE_FRAMES = 15;

export const AimmsFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* ── Scene 1: Intro ── */}
        <TransitionSeries.Sequence durationInFrames={540} premountFor={30}>
          <Scene1_Intro />
          <Sequence from={15} durationInFrames={520} layout="none">
            <Audio src={staticFile("audio/scene1_intro.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 2: Medical Case Creator ── */}
        <TransitionSeries.Sequence durationInFrames={810} premountFor={30}>
          <Scene2_MCC />
          <Sequence from={10} durationInFrames={795} layout="none">
            <Audio src={staticFile("audio/scene2_mcc.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 3: Faculty Assignment ── */}
        <TransitionSeries.Sequence durationInFrames={660} premountFor={30}>
          <Scene3_Assignment />
          <Sequence from={10} durationInFrames={645} layout="none">
            <Audio src={staticFile("audio/scene3_assignment.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 4: Virtual Patient ── */}
        <TransitionSeries.Sequence durationInFrames={1740} premountFor={30}>
          <Scene4_VirtualPatient />
          <Sequence from={45} durationInFrames={1690} layout="none">
            <Audio src={staticFile("audio/scene4_vp.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 5: AIMHEI Reports ── */}
        <TransitionSeries.Sequence durationInFrames={720} premountFor={30}>
          <Scene5_AIMHEI />
          <Sequence from={10} durationInFrames={705} layout="none">
            <Audio src={staticFile("audio/scene5_aimhei.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 6: Flow Recap & Close ── */}
        <TransitionSeries.Sequence durationInFrames={720} premountFor={30}>
          <Scene6_FlowRecap />
          <Sequence from={10} durationInFrames={705} layout="none">
            <Audio src={staticFile("audio/scene6_recap.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
