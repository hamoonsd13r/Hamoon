import React from "react";
import { AbsoluteFill } from "remotion";
import { Dog, Figure, Girl } from "./figures";
import { RimDefs, W, H } from "./lib";
export const Cast: React.FC = () => (
  <AbsoluteFill style={{ background: "#6d84a8" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <RimDefs id="rim" color="#ffd9a0" dx={-5} dy={-2} />
      <Girl x={170} y={760} filter="url(#rim)" />
      <Girl x={470} y={760} phone={1} armF={[-35, -110]} head={14} />
      <Dog x={800} y={760} s={1} bristle={1} />
      <Dog x={300} y={1180} pose="lie" breath={0.5} />
      <Figure x={750} y={1180} hair="old" build={1.05} hunch={1} s={0.62} />
      <Figure x={150} y={1700} hair="curly" s={0.58} />
      <Figure x={400} y={1700} hair="long" arms={1} s={0.62} />
      <Figure x={650} y={1700} hair="short" headUp={1} s={0.6} />
      <Girl x={880} y={1700} crouch={0.8} legs={[-50, 100, -70, 110]} s={0.9} />
      <Dog x={760} y={1180} s={0.9} head={-25} jaw={1} legs={[20, -10, -15, 10]} tail={-30} />
    </svg>
  </AbsoluteFill>
);
