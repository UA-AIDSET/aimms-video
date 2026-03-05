import React from "react";
import { Composition } from "remotion";
import { AimmsFlow } from "./AimmsFlow";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AimmsFlow"
        component={AimmsFlow}
        durationInFrames={3265}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
