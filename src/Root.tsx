import React from "react";
import { Composition } from "remotion";
import { AimmsFlow, aimsFlowSchema, AIMS_FLOW_DEFAULT_PROPS } from "./AimmsFlow";
import { SCENE4_COMPOSITION_ENTRIES } from "./scenes/scene4/Scene4ShotRoots";

/**
 * Remotion Root — registers all compositions.
 * Schema enables visual prop editing in Remotion Studio.
 * @see https://www.remotion.dev/docs/schemas
 * @see https://www.remotion.dev/docs/visual-editing
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AimmsFlow"
        component={AimmsFlow}
        durationInFrames={5895}
        fps={30}
        width={1920}
        height={1080}
        schema={aimsFlowSchema}
        defaultProps={AIMS_FLOW_DEFAULT_PROPS}
      />
      {SCENE4_COMPOSITION_ENTRIES.map((entry) => (
        <Composition
          key={entry.id}
          id={entry.id}
          component={entry.component}
          durationInFrames={entry.durationInFrames}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </>
  );
};
