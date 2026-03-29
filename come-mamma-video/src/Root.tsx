import React from "react";
import { Composition } from "remotion";
import {
  PicantinoStory,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
} from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PicantinoStory"
        component={PicantinoStory}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
    </>
  );
};
