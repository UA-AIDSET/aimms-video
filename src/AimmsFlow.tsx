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
 * Scene durations (v3 — matched to audio):
 * 1. Intro/Title         — 400 frames (13.3s)  audio ~11.3s
 * 2. MCC Case Creator    — 590 frames (19.7s)  audio ~17.8s
 * 3. Faculty Assignment  — 500 frames (16.7s)  audio ~15.8s
 * 4. Virtual Patient     — 800 frames (26.7s)  audio ~23.5s
 * 5. AIMHEI Reports      — 540 frames (18.0s)  audio ~16.0s
 * 6. Flow Recap & Close  — 510 frames (17.0s)  audio ~15.1s
 *
 * Total: 3340 - 75 (5 fade transitions × 15 frames) = 3265 frames (~1:49)
 */

const FADE_FRAMES = 15;

export const AimmsFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* ── Scene 1: Intro ── */}
        <TransitionSeries.Sequence durationInFrames={400} premountFor={30}>
          <Scene1_Intro />
          <Sequence from={15} durationInFrames={375} layout="none">
            <Audio src={staticFile("audio/scene1_intro.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 2: Medical Case Creator ── */}
        <TransitionSeries.Sequence durationInFrames={590} premountFor={30}>
          <Scene2_MCC />
          <Sequence from={10} durationInFrames={570} layout="none">
            <Audio src={staticFile("audio/scene2_mcc.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 3: Faculty Assignment ── */}
        <TransitionSeries.Sequence durationInFrames={500} premountFor={30}>
          <Scene3_Assignment />
          <Sequence from={10} durationInFrames={480} layout="none">
            <Audio src={staticFile("audio/scene3_assignment.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 4: Virtual Patient ── */}
        <TransitionSeries.Sequence durationInFrames={800} premountFor={30}>
          <Scene4_VirtualPatient />
          <Sequence from={45} durationInFrames={745} layout="none">
            <Audio src={staticFile("audio/scene4_vp.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 5: AIMHEI Reports ── */}
        <TransitionSeries.Sequence durationInFrames={540} premountFor={30}>
          <Scene5_AIMHEI />
          <Sequence from={10} durationInFrames={520} layout="none">
            <Audio src={staticFile("audio/scene5_aimhei.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_FRAMES })}
        />

        {/* ── Scene 6: Flow Recap & Close ── */}
        <TransitionSeries.Sequence durationInFrames={510} premountFor={30}>
          <Scene6_FlowRecap />
          <Sequence from={10} durationInFrames={490} layout="none">
            <Audio src={staticFile("audio/scene6_recap.mp3")} />
          </Sequence>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
