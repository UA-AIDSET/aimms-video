import React from "react";
import { Composition } from "remotion";
import { AimmsFlow, aimsFlowSchema, AIMS_FLOW_DEFAULT_PROPS } from "./AimmsFlow";

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
        durationInFrames={5250}
        fps={30}
        width={1920}
        height={1080}
        schema={aimsFlowSchema}
        defaultProps={AIMS_FLOW_DEFAULT_PROPS}
      />
    </>
  );
};
