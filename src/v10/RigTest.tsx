import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { P, Person, WIFE, Sky } from "./kit";
const RigTest: React.FC = () => (
  <AbsoluteFill>
    <svg width={1080} height={1920}>
      <Sky id="rt" c={["#8fd3ff", "#ffe7c2"]} />
      <Person x={200} y={600} pose={P.stand} face={{ mouth: "smile" }} />
      <Person x={540} y={600} pose={P.thumbs} face={{ eye: "happy", mouth: "grin", facing: 0.5 }} />
      <Person x={880} y={600} pose={P.spread} face={{ eye: "wide", mouth: "o" }} />
      <Person x={200} y={1150} pose={P.cross} face={{ mouth: "smirk", shades: true }} />
      <Person x={540} y={1150} pose={P.stand} look={{ ...WIFE, age: 1, hairStyle: "bun" }} face={{ glasses: true, eye: "happy" }} />
      <Person x={880} y={1150} pose={P.hips} spiky={1} face={{ soot: 1, eye: "wide", mouth: "flat", brows: 0 }} />
      <Person x={200} y={1700} pose={P.stand} look={{ ...WIFE }} face={{ eye: "sad", mouth: "sad", tear: 0.4 }} />
      <Person x={540} y={1700} pose={P.wave} look={{ top: "#e2574c", bottom: "#3b4a6b", skin: "#f1c39d", hair: "#3a2418", hairStyle: "kid", kid: true }} />
      <Person x={880} y={1700} pose={P.sitFront} face={{ eye: "closed" }} />
    </svg>
  </AbsoluteFill>
);
export const V10Rig: React.FC = () => <Composition id="V10-Rig" component={RigTest} durationInFrames={1} fps={30} width={1080} height={1920} />;
