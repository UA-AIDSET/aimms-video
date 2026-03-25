import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { Scene0_ColdOpen } from "./scenes/Scene0_ColdOpen";
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
 * Scene durations (v7):
 * 0. Cold Open (ASTEC)   — 240 frames ( 8.0s)  no audio (narration optional)
 * 1. Intro/Title         — 540 frames (18.0s)  audio ~16s
 * 2. MCC Case Creator    — 810 frames (27.0s)  audio ~25s
 * 3. Faculty Assignment  — 660 frames (22.0s)  audio ~20s
 * 4. Virtual Patient     — 1875 frames (62.5s) audio ~59s
 * 5. AIMHEI Reports      — 720 frames (24.0s)  audio ~22s
 * 6. Flow Recap & Close  — 720 frames (24.0s)  audio ~22s
 *
 * Total: 5565 - 90 (6 fade transitions × 15 frames) = 5475 frames (~3:02)
 *
 * @see https://www.remotion.dev/docs/schemas — Zod schema for visual prop editing
 */

/**
 * Zod schema for AimmsFlow props.
 * Edit these values live in Remotion Studio via the Props panel.
 * @see https://www.remotion.dev/docs/schemas
 * @see https://www.remotion.dev/docs/visual-editing
 */
export const aimsFlowSchema = z.object({
  /** Master audio volume for all voiceover tracks (0 = silent, 1 = full). */
  audioVolume: z.number().min(0).max(1),

  /** Duration in frames of each scene-to-scene fade transition. */
  fadeDurationFrames: z.number().int().min(0).max(60),

  /** Background fill colour behind all scenes (Remotion colour picker). */
  backgroundColor: zColor(),

  /** Patient name shown in Scene 4 encounter summary. */
  patientName: z.string(),

  /** Institution name shown in Scene 1 title and Scene 6 recap. */
  institutionName: z.string(),
});

export type AimsFlowProps = z.infer<typeof aimsFlowSchema>;

export const AIMS_FLOW_DEFAULT_PROPS: AimsFlowProps = {
  audioVolume: 1,
  fadeDurationFrames: 15,
  backgroundColor: "#000000",
  patientName: "Maria Santos — 67F",
  institutionName: "University of Arizona",
};

export const AimmsFlow: React.FC<AimsFlowProps> = ({
  audioVolume,
  fadeDurationFrames,
  backgroundColor,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <TransitionSeries>
        {/* ── Scene 0: Cold Open (ASTEC Building) ── */}
        <TransitionSeries.Sequence durationInFrames={240} premountFor={30}>
          <Scene0_ColdOpen />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 1: Intro ── */}
        <TransitionSeries.Sequence durationInFrames={540} premountFor={30}>
          <Scene1_Intro />
          <Sequence from={15} durationInFrames={520} layout="none">
            <Audio src={staticFile("audio/scene1_intro.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 2: Medical Case Creator ── */}
        <TransitionSeries.Sequence durationInFrames={810} premountFor={30}>
          <Scene2_MCC />
          <Sequence from={10} durationInFrames={795} layout="none">
            <Audio src={staticFile("audio/scene2_mcc.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 3: Faculty Assignment ── */}
        <TransitionSeries.Sequence durationInFrames={660} premountFor={30}>
          <Scene3_Assignment />
          <Sequence from={10} durationInFrames={645} layout="none">
            <Audio src={staticFile("audio/scene3_assignment.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 4: Virtual Patient ── */}
        <TransitionSeries.Sequence durationInFrames={1875} premountFor={30}>
          <Scene4_VirtualPatient />
          <Sequence from={45} durationInFrames={1830} layout="none">
            <Audio src={staticFile("audio/scene4_vp.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 5: AIMHEI Reports ── */}
        <TransitionSeries.Sequence durationInFrames={720} premountFor={30}>
          <Scene5_AIMHEI />
          <Sequence from={10} durationInFrames={705} layout="none">
            <Audio src={staticFile("audio/scene5_aimhei.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: fadeDurationFrames })}
        />

        {/* ── Scene 6: Flow Recap & Close ── */}
        <TransitionSeries.Sequence durationInFrames={720} premountFor={30}>
          <Scene6_FlowRecap />
          <Sequence from={10} durationInFrames={705} layout="none">
            <Audio src={staticFile("audio/scene6_recap.mp3")} volume={audioVolume} />
          </Sequence>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
