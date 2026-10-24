// V03 · silhouette cast. Every figure: origin at the feet (0,0), up = −y, drawn facing +x (flip with sx=-1).
// All parts share one fill, so they read as a single cut-out; a RimDefs filter on the group adds the lit edge.
import React from "react";
import { C } from "./lib";

type G = { x?: number; y?: number; s?: number; sx?: number; fill?: string; filter?: string; rot?: number };
const wrap = ({ x = 0, y = 0, s = 1, sx = 1, rot = 0 }: G) => `translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s})`;

// a tapered limb from a pivot, pointing down at angle a (deg, +=clockwise)
const Limb: React.FC<{ x: number; y: number; a: number; len: number; w0: number; w1: number; children?: React.ReactNode }> = ({ x, y, a, len, w0, w1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d={`M${-w0 / 2},0 C${-w0 / 2 - 2},${len * 0.4} ${-w1 / 2 - 1},${len * 0.8} ${-w1 / 2},${len} L${w1 / 2},${len} C${w1 / 2 + 1},${len * 0.8} ${w0 / 2 + 2},${len * 0.4} ${w0 / 2},0 Z`} />
    <circle cx={0} cy={0} r={w0 / 2} />
    <g transform={`translate(0 ${len})`}>{children}</g>
  </g>
);

// ── Raha: girl, profile, oversized hoodie, ponytail ─────────────────────────────────────────────
export type GirlPose = {
  legs?: [number, number, number, number]; // back hip, back knee, front hip, front knee
  armB?: [number, number]; armF?: [number, number]; // shoulder, elbow
  head?: number; lean?: number; tail?: number; // ponytail swing
  phone?: number; // >0 draws a glowing phone in the front hand
  crouch?: number; // 0..1 lowers hips (knees bend)
};
export const Girl: React.FC<G & GirlPose> = ({ legs = [3, 0, -3, 0], armB = [8, -6], armF = [-6, -8], head = 0, lean = 0, tail = 0, phone = 0, crouch = 0, fill = C.ink, filter, ...g }) => {
  const hipY = -300 + crouch * 110;
  return (
    <g transform={wrap(g)} fill={fill} filter={filter}>
      <g transform={`translate(0 ${hipY}) rotate(${lean}) translate(0 ${-hipY})`}>
        {/* back limbs */}
        <Limb x={-4} y={hipY} a={legs[0]} len={150} w0={50} w1={36}>
          <Limb x={0} y={0} a={legs[1]} len={140} w0={36} w1={30}>
            <path d="M-16,-6 L30,-4 C42,-2 44,12 34,14 L-16,14 Z" />
          </Limb>
        </Limb>
        <Limb x={-10} y={-462 + crouch * 110} a={armB[0]} len={122} w0={36} w1={30}>
          <Limb x={0} y={0} a={armB[1]} len={112} w0={30} w1={24}><ellipse cx={0} cy={6} rx={12} ry={15} /></Limb>
        </Limb>
        {/* hoodie torso */}
        <g transform={`translate(0 ${crouch * 110})`}>
          <path d="M-50,-298 C-64,-360 -64,-432 -44,-474 C-28,-496 12,-500 32,-480 C48,-440 54,-378 48,-298 C40,-282 -42,-282 -50,-298 Z" />
          <ellipse cx={-30} cy={-488} rx={32} ry={20} />
          <rect x={-12} y={-512} width={26} height={34} rx={8} />
          {/* head */}
          <g transform={`translate(8 -548) rotate(${head}) scale(0.82)`}>
            <path d="M-30,48 C-60,30 -64,-30 -40,-54 C-20,-74 30,-70 46,-40 C52,-26 52,-16 50,-8 L66,10 L52,16 C57,22 57,26 52,30 C55,36 51,44 40,48 C30,52 20,56 12,62 L-12,64 Z" />
            {/* ponytail */}
            <g transform={`translate(-44 -34) rotate(${tail})`}>
              <ellipse cx={-2} cy={0} rx={10} ry={9} />
              <path d="M-6,-4 C-34,4 -46,40 -40,86 C-38,98 -30,104 -26,96 C-22,60 -10,26 6,6 Z" />
            </g>
            <path d="M-36,-50 C-10,-82 36,-70 50,-34 C30,-52 0,-58 -36,-50 Z" />
          </g>
        </g>
        {/* front limbs */}
        <Limb x={4} y={hipY} a={legs[2]} len={150} w0={52} w1={36}>
          <Limb x={0} y={0} a={legs[3]} len={140} w0={36} w1={30}>
            <path d="M-16,-6 L30,-4 C42,-2 44,12 34,14 L-16,14 Z" />
          </Limb>
        </Limb>
        <Limb x={0} y={-460 + crouch * 110} a={armF[0]} len={122} w0={38} w1={30}>
          <Limb x={0} y={0} a={armF[1]} len={112} w0={30} w1={24}>
            <ellipse cx={0} cy={6} rx={12} ry={15} />
            {phone > 0 && <g transform="translate(-4 4) rotate(-20)">
              <rect x={-14} y={-26} width={28} height={50} rx={5} fill="#111" />
              <rect x={-11} y={-22} width={22} height={42} rx={3} fill={C.phone} opacity={phone} />
            </g>}
          </Limb>
        </Limb>
      </g>
    </g>
  );
};

// ── Zorat: German Shepherd, profile (outline traced from a GSD side view; legs are separate limbs) ──────
export type DogPose = {
  pose?: "stand" | "lie";
  legs?: [number, number, number, number]; // front-near, front-far, back-near, back-far (deg)
  head?: number; jaw?: number; ears?: number; // ears 0 = up, 1 = flat back
  tail?: number; bristle?: number; breath?: number; eye?: number;
};
const DOG_BODY = "M302,-298 C284,-316 252,-326 230,-328 C220,-330 212,-338 200,-342 C185,-346 172,-344 162,-336 C140,-318 110,-288 60,-264 C10,-256 -60,-252 -110,-244 C-150,-238 -185,-226 -205,-205 C-228,-180 -232,-140 -222,-112 L-160,-104 C-146,-130 -120,-148 -90,-150 C-40,-148 20,-138 70,-124 L122,-124 C150,-140 165,-190 180,-240 C200,-268 228,-276 250,-278 C270,-280 292,-282 302,-298 Z";
const DOG_LIE = "M-210,0 C-225,-40 -200,-95 -130,-110 C-60,-122 40,-118 100,-100 C150,-86 178,-62 186,-30 L186,0 Z";
const Paw = () => <ellipse cx={10} cy={2} rx={17} ry={8} />;
export const Dog: React.FC<G & DogPose> = ({ pose = "stand", legs = [0, 0, 0, 0], head = 0, jaw = 0, ears = 0, tail = 0, bristle = 0, breath = 0, eye = 0, fill = C.ink, filter, ...g }) => {
  if (pose === "lie") {
    return (
      <g transform={wrap(g)} fill={fill} filter={filter}>
        <g transform="translate(-40 0)">
          <g transform={`rotate(${tail} -200 -10)`}><path d="M-196,-24 C-250,-24 -294,-12 -306,0 L-196,0 Z" /></g>
          <g transform={`translate(0 0) scale(1 ${1 + breath * 0.035})`}><path d={DOG_LIE} /></g>
          <path d="M120,-30 L300,-26 C314,-24 314,0 300,0 L120,0 Z" />
          <g transform={`translate(214 -66) rotate(${8 + head})`}>
            <ellipse cx={0} cy={0} rx={48} ry={40} />
            <path d="M18,-14 C56,-12 82,0 96,14 C99,23 90,28 78,26 L16,30 Z" />
            <g transform={`rotate(${-6 - ears * 40} -10 -30)`}><path d="M-26,-22 L-14,-84 L8,-30 Z" /></g>
            <g transform={`rotate(${4 - ears * 40} 12 -32)`}><path d="M-2,-30 L16,-90 L32,-24 Z" /></g>
            {eye > 0 && <ellipse cx={30} cy={-8} rx={6} ry={3.5} fill={C.bone} opacity={eye} />}
          </g>
        </g>
      </g>
    );
  }
  const bris = bristle > 0 ? Array.from({ length: 22 }, (_, i) => {
    const k = i / 21; const x = 150 - k * 170, y = -330 + k * 80 + (k > 0.85 ? (k - 0.85) * 40 : 0);
    const h = (4 + 12 * Math.sin(k * Math.PI) * (0.7 + 0.3 * Math.sin(i * 2.7))) * bristle;
    return `M${x + 6},${y + 6} L${x - 3},${y - h} L${x - 6},${y + 8} Z`;
  }).join(" ") : "";
  return (
    <g transform={wrap(g)} fill={fill} filter={filter}>
      <g transform="translate(-35 0)">
        <Limb x={128} y={-132} a={legs[1]} len={128} w0={32} w1={20}><Paw /></Limb>
        <Limb x={-170} y={-122} a={30 + legs[3]} len={62} w0={34} w1={22}><Limb x={0} y={0} a={-30 - legs[3] * 0.5} len={64} w0={22} w1={18}><Paw /></Limb></Limb>
        <g transform={`translate(-206 -206) rotate(${tail})`}><path d="M10,-8 C-34,4 -60,62 -66,132 C-68,154 -40,158 -36,134 C-30,82 -10,40 16,18 Z" /></g>
        <g transform={`translate(0 -190) scale(1 ${1 + breath * 0.02}) translate(0 190)`}><path d={DOG_BODY} /></g>
        {bris && <path d={bris} />}
        <g transform={`rotate(${head} 170 -300)`}>
          <g transform={`rotate(${jaw * 26} 236 -292)`}><path d="M226,-290 L288,-288 C292,-282 286,-272 276,-272 L232,-268 Z" /></g>
          <g transform={`rotate(${ears * -50} 168 -338)`}><path d="M150,-334 L172,-412 L194,-342 Z" /></g>
          <g transform={`rotate(${ears * -50} 190 -342)`}><path d="M174,-344 L202,-424 L220,-336 Z" /></g>
          {eye > 0 && <ellipse cx={214} cy={-320} rx={6} ry={4} fill={C.bone} opacity={eye} />}
        </g>
        <Limb x={100} y={-132} a={legs[0]} len={128} w0={36} w1={22}><Paw /></Limb>
        <Limb x={-196} y={-122} a={26 + legs[2]} len={64} w0={40} w1={24}><Limb x={0} y={0} a={-30 - legs[2] * 0.5} len={64} w0={24} w1={18}><Paw /></Limb></Limb>
      </g>
    </g>
  );
};

// ── front / back-facing people (neighbour, Saman, the mother, crowds) ────────────────────────────
export type Person = {
  h?: number; // height in px at s=1 (default 600)
  build?: number; // 1 = average, >1 wider
  hair?: "bald" | "short" | "long" | "curly" | "old" | "pony";
  arms?: number; // 0 = hanging, 1 = slightly open (creepy invitation)
  hunch?: number; headTilt?: number; headUp?: number; // headUp: looks at the sky
  eyes?: number; // >0 two pale glints
  eyeColor?: string;
  coat?: boolean;
  step?: number; // walking phase (radians); 0 = still
};
export const Figure: React.FC<G & Person> = ({ h = 600, build = 1, hair = "short", arms = 0, hunch = 0, headTilt = 0, headUp = 0, eyes = 0, eyeColor = C.bone, coat = false, step, fill = C.ink, filter, ...g }) => {
  const k = h / 600, b = build;
  const sh = 82 * b; // half shoulder width
  const hy = -540 + hunch * 20 + headUp * 6;
  return (
    <g transform={wrap(g)} fill={fill} filter={filter}>
      <g transform={`scale(${k})`}>
        {/* legs */}
        {[-1, 1].map((d) => (
          <g key={d} transform={step === undefined ? "" : `translate(0 ${-Math.max(0, Math.sin(step + (d > 0 ? Math.PI : 0))) * 22})`}>
            <path d={`M${d * 2},-300 L${d * 58 * b},-300 C${d * 56 * b},-200 ${d * 48},-80 ${d * 46},-10 L${d * 10},-10 C${d * 9},-80 ${d * 6},-200 ${d * 2},-260 Z`} />
            <ellipse cx={d * 28} cy={-6} rx={27} ry={11} />
          </g>
        ))}
        {coat && <path d={`M${-56 * b},-330 L${-70 * b},-130 L${70 * b},-130 L${56 * b},-330 Z`} />}
        {/* torso */}
        <path d={`M${-52 * b},-286 C${-58 * b},-360 ${-sh - 4},-420 ${-sh},-462 C${-sh + 4},-484 ${-sh + 24},${-496 + hunch * 14} -40,-500 L40,-500 C${sh - 24},${-496 + hunch * 14} ${sh - 4},-484 ${sh},-462 C${sh + 4},-420 ${58 * b},-360 ${52 * b},-286 Z`} />
        {/* arms */}
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * (sh - 8)} -464) rotate(${d * (7 + arms * 26)})`}>
            <path d="M-19,0 C-21,90 -16,180 -13,232 L13,232 C16,180 21,90 19,0 Z" />
            <ellipse cx={0} cy={244} rx={14} ry={19} />
          </g>
        ))}
        {/* neck + head */}
        <rect x={-14} y={-520} width={28} height={40} rx={8} />
        <g transform={`translate(0 ${hy}) rotate(${headTilt})`}>
          <g transform={`translate(0 ${-headUp * 10}) scale(1 ${1 - headUp * 0.18})`}>
            <ellipse cx={0} cy={0} rx={43} ry={53} />
            {hair === "long" && <path d="M-46,-10 C-50,-60 50,-60 46,-10 C54,40 54,90 48,120 L-48,120 C-54,90 -54,40 -46,-10 Z" />}
            {hair === "curly" && Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.05 + (i / 8) * 0.9); return <circle key={i} cx={Math.cos(a) * 40} cy={Math.sin(a) * 46 - 4} r={16} />; })}
            {hair === "short" && <path d="M-42,-6 C-46,-56 46,-56 42,-6 C30,-34 -30,-34 -42,-6 Z" />}
            {hair === "pony" && <><path d="M-44,-4 C-48,-58 48,-58 44,-4 C30,-36 -30,-36 -44,-4 Z" /><path d="M-14,-40 C-26,10 -22,70 -8,110 L10,110 C22,70 26,10 14,-40 Z" /></>}
            {hair === "old" && <><ellipse cx={-38} cy={4} rx={10} ry={16} /><ellipse cx={38} cy={4} rx={10} ry={16} /></>}
            {eyes > 0 && <g fill={eyeColor} opacity={eyes}>
              <ellipse cx={-14} cy={-2} rx={6} ry={3.5} />
              <ellipse cx={14} cy={-2} rx={6} ry={3.5} />
            </g>}
          </g>
        </g>
      </g>
    </g>
  );
};
