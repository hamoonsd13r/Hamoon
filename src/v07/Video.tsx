// V07 «موشک رو بگیر» — stick-toon on a running track, staged from the "catch a rocket" reel shot by shot.
// 720×1280 drawing space, 30 fps; limbs/faces animate on twos, positions + camera on ones.
// Every beat is keyed to narration word times (words.json, Brian v3 at atempo 1.08).
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Arm, BG, HeadMount, INK, Legs, solve, Torso, type Dims, type Pose } from "../styles/stick-toon/rig/body";
import { add, clamp, E, hn, lerp, rot, tr, type V } from "../styles/stick-toon/rig/geom";
import { GuyHead, type GuyFace } from "../styles/stick-toon/rig/heads";
import words from "./words.json";

type Word = { si: number; wi: number; w: string; s: number; e: number };
const WORDS = words as Word[];
const FPS = 30;
const W = (si: number, needle: string) => {
  const w = WORDS.find((x) => x.si === si && x.w.includes(needle));
  if (!w) throw new Error(`word ${si}:${needle}`);
  return w.s;
};

// ---- beats (seconds) ----------------------------------------------------------
export const T = {
  fire: W(0, "شلیک") + 0.08,
  run: W(0, "می‌تونی"),
  grabTry: W(0, "بگیریش"),
  wide: W(1, "خب"),
  speed0: W(1, "باید"),
  sisad: W(1, "سیصد"),
  front: W(1, "جلو") - 0.18,
  snatch: W(1, "بقاپیش"),
  but: W(2, "ولی"),
  kuchulu: W(2, "کوچولو"),
  insted: W(3, "به‌جاش"),
  ahead: W(3, "جلو"),
  behind: W(3, "از") , // «از پشت»
  hit: 0,
  end: 0,
};
T.behind = WORDS.filter((x) => x.si === 3 && x.w === "از").at(-1)!.s;
T.hit = WORDS.at(-1)!.e - 0.12;
T.end = T.hit + 1.75;
export const V07_FRAMES = Math.ceil(T.end * FPS);

// ---- palette (stick-toon family + one hot accent) ------------------------------
const PAPER = "#d9dbc8";
const TRACK = "#9b9e88";
const LANE = "#c9cbb6";
const HOT = "#e0622a";
const HOT2 = "#f2a53a";

const GUY: Dims = { Lt: 150, tw: 60, hip: 7, l1: 84, l2: 84, a1: 64, a2: 64, shY: 22, shoe: 34, hand: 8.5 };
const G = 760; // ground line (world)

// ---- poses ----------------------------------------------------------------------
type Guy = { pose: Pose; face: GuyFace; tilt: number };

const face = (o: Partial<GuyFace> = {}): GuyFace => ({ yaw: 0.9, look: [0.6, 0], lids: 0.1, brow: 2, mouth: "neutral", blush: 0, wet: 0, seed: 0, ...o });

/** Running cycle. dir = facing (+1 right). ph = cycle phase (radians). */
function runPose(x: number, ph: number, dir: 1 | -1, o: { lean?: number; stride?: number; lift?: number; y?: number } = {}): Pose {
  const lean = (o.lean ?? 17) * dir;
  const stride = o.stride ?? 74;
  const lift = o.lift ?? 58;
  const pelvis: V = [x, (o.y ?? G) - 152 + 9 * Math.abs(Math.sin(ph))];
  const foot = (p: number): V => [x + dir * stride * Math.sin(p) - dir * 14, (o.y ?? G) - lift * Math.max(0, Math.cos(p)) - 4];
  const sh = add(pelvis, rot([0, -128], lean));
  const hand = (p: number): V => add(sh, [dir * (-58 * Math.sin(p) + 14), 58 - 22 * Math.abs(Math.sin(p))]);
  return {
    pelvis, lean, sq: 1, fx: dir,
    footL: foot(ph), footR: foot(ph + Math.PI), kneeL: -dir, kneeR: -dir,
    handL: hand(ph + Math.PI), handR: hand(ph), elbL: dir, elbR: dir,
    toeL: dir * 22 * Math.cos(ph), toeR: dir * 22 * Math.cos(ph + Math.PI),
  };
}
function standPose(x: number, o: Partial<Pose> = {}): Pose {
  return {
    pelvis: [x, G - 160], lean: 0, sq: 1, fx: 1,
    footL: [x - 26, G - 4], footR: [x + 30, G - 4], kneeL: -1, kneeR: -1,
    handL: [x + 10, G - 260], handR: [x + 60, G - 270], elbL: 1, elbR: 1, toeL: 0, toeR: 0, ...o,
  };
}

// ---- world pieces ---------------------------------------------------------------
const Rocket: React.FC<{ at: V; ang?: number; s?: number; flame?: number; f: number }> = ({ at, ang = 0, s = 1, flame = 1, f }) => {
  const fl = 34 + 22 * Math.abs(hn(f, 3)) * flame;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang}) scale(${s})`} strokeLinejoin="round">
      {flame > 0 && (
        <>
          <path d={`M-138 -9 Q${-138 - fl} ${-12 + hn(f, 5) * 4} ${-138 - fl * 1.7} 0 Q${-138 - fl} ${12 + hn(f, 6) * 4} -138 9 Z`} fill={HOT} />
          <path d={`M-138 -5 Q${-138 - fl * 0.5} -5 ${-138 - fl * 0.9} 0 Q${-138 - fl * 0.5} 5 -138 5 Z`} fill={HOT2} />
        </>
      )}
      {/* fins */}
      <path d="M-128 -8 L-150 -26 L-112 -8 Z M-128 8 L-150 26 L-112 8 Z" fill={PAPER} stroke={INK} strokeWidth={4} />
      {/* tail tube */}
      <rect x={-140} y={-9} width={140} height={18} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
      <path d="M-104 -9 L-104 9 M-70 -9 L-70 9" stroke={INK} strokeWidth={2.5} />
      {/* warhead */}
      <path d="M-6 -12 C14 -34 54 -36 86 -18 L126 -5 Q134 0 126 5 L86 18 C54 36 14 34 -6 12 Z" fill={PAPER} stroke={INK} strokeWidth={4.4} />
      <path d="M22 -26 C40 -14 40 14 22 26" fill="none" stroke={INK} strokeWidth={2.6} />
      <path d="M30 -22 C60 -26 74 -20 88 -14" fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const Bazooka: React.FC<{ at: V; ang: number }> = ({ at, ang }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang})`} strokeLinejoin="round">
    <rect x={-120} y={-13} width={240} height={26} rx={6} fill={TRACK} stroke={INK} strokeWidth={4.4} />
    <rect x={-128} y={-17} width={22} height={34} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={110} y={-17} width={20} height={34} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    <path d="M-10 13 L-18 44 L0 44 L6 13 M40 13 L36 34" fill={TRACK} stroke={INK} strokeWidth={4} />
  </g>
);

const Puff: React.FC<{ at: V; r: number; o: number; k: number }> = ({ at, r, o, k }) => (
  <g opacity={o}>
    <circle cx={at[0]} cy={at[1]} r={r} fill={PAPER} stroke={INK} strokeWidth={3} />
    <circle cx={at[0] + r * 0.45 * (hn(k, 1) > 0 ? 1 : -1)} cy={at[1] - r * 0.4} r={r * 0.62} fill={PAPER} stroke={INK} strokeWidth={2.6} />
  </g>
);

/** Burst star (impact / muzzle). */
const Burst: React.FC<{ at: V; r: number; o: number; n?: number; seed?: number }> = ({ at, r, o, n = 11, seed = 0 }) => {
  const pts: V[] = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.48 : r * (0.85 + 0.3 * Math.abs(hn(i, seed)));
    return [at[0] + Math.cos(a) * rr, at[1] + Math.sin(a) * rr];
  });
  const d = "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
  const inner = pts.map((p) => [lerp(at[0], p[0], 0.55), lerp(at[1], p[1], 0.55)] as V);
  return (
    <g opacity={o} strokeLinejoin="round">
      <path d={d} fill={HOT2} stroke={INK} strokeWidth={4.4} />
      <path d={"M" + inner.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z"} fill={HOT} />
      <circle cx={at[0]} cy={at[1]} r={r * 0.16} fill="#fff6e0" />
    </g>
  );
};

const GuyFig: React.FC<{ g: Guy }> = ({ g }) => {
  const r = solve(g.pose, GUY);
  return (
    <g>
      <Arm r={r} side="L" />
      <Legs r={r} />
      <Torso r={r} />
      <HeadMount r={r} tilt={g.tilt}>
        <GuyHead f={g.face} id="v07guy" />
      </HeadMount>
      <Arm r={r} side="R" />
    </g>
  );
};

// ---- track background (screen space) -------------------------------------------
const Track: React.FC<{ camX: number; s: number; gy: number; frame: number; speed: number }> = ({ camX, s, gy, frame, speed }) => {
  const hz = gy - 210 * s;
  const scroll = camX * s;
  const mod = (v: number, m: number) => ((v % m) + m) % m;
  const lanes = [14, 40, 78, 130, 205, 310, 460, 680].map((v) => hz + v * Math.max(s, 0.55));
  const stands: React.ReactNode[] = [];
  const SW = 300 * Math.max(s, 0.6);
  const off = mod(-scroll * 0.22, SW);
  for (let i = -1; i < 720 / SW + 2; i++) {
    const x = off + i * SW - SW;
    const top = hz - 170 * Math.max(s, 0.6);
    stands.push(
      <g key={`st${i}`}>
        <path d={`M${x} ${hz} L${x} ${top + 40} L${x + SW * 0.82} ${top} L${x + SW * 0.82} ${hz} Z`} fill={PAPER} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        {[0.25, 0.5, 0.75].map((k) => (
          <path key={k} d={`M${x} ${lerp(top + 40, hz, k)} L${x + SW * 0.82} ${lerp(top, hz, k)}`} stroke={INK} strokeWidth={1.8} />
        ))}
        {Array.from({ length: 9 }, (_, j) => {
          const cx = x + 14 + j * SW * 0.088;
          const cy = lerp(top + 40, top, j / 9) + 18 + (j % 3) * 22;
          return <circle key={j} cx={cx} cy={cy + (hn(j + i * 9 + Math.floor(frame / 4), 2) > 0.6 ? -3 : 0)} r={5} fill={INK} />;
        })}
        <path d={`M${x + SW * 0.9} ${hz} L${x + SW * 0.9} ${top - 30}`} stroke={INK} strokeWidth={3} />
        <rect x={x + SW * 0.9 - 14} y={top - 44} width={28} height={14} rx={3} fill={PAPER} stroke={INK} strokeWidth={2.4} />
      </g>,
    );
  }
  const posts = [];
  const PS = 46 * Math.max(s, 0.6);
  const poff = mod(-scroll * 0.5, PS);
  for (let x = poff - PS; x < 740; x += PS) posts.push(<path key={`p${x}`} d={`M${x} ${hz} l0 -22`} />);
  const ticks: React.ReactNode[] = [];
  lanes.forEach((y, k) => {
    const para = 0.45 + (k / 7) * 1.1;
    const sp = 170 * Math.max(s, 0.55);
    const o = mod(-scroll * para, sp);
    for (let x = o - sp; x < 760; x += sp) ticks.push(<path key={`t${k}${x}`} d={`M${x} ${y} l${10 + k * 4} 0`} />);
  });
  const streaks: React.ReactNode[] = [];
  if (speed > 0.2)
    for (let i = 0; i < 9; i++) {
      const y = 200 + ((i * 131) % 900);
      const len = 60 + (i % 4) * 40;
      const x = mod(-scroll * (1.5 + (i % 3) * 0.3) + i * 211, 900) - 100;
      streaks.push(<path key={`s${i}`} d={`M${x} ${y} l${len} 0`} opacity={0.45 * speed} />);
    }
  return (
    <g>
      <rect width={720} height={1280} fill={BG} />
      {stands}
      <rect x={0} y={hz} width={720} height={1280 - hz} fill={TRACK} />
      <g stroke={INK} strokeWidth={2.6} strokeLinecap="round">{posts}</g>
      <path d={`M0 ${hz} L720 ${hz}`} stroke={INK} strokeWidth={3.4} />
      <g stroke={LANE} strokeWidth={3.4}>
        {lanes.map((y) => <path key={y} d={`M0 ${y} L720 ${y}`} />)}
      </g>
      <g stroke={PAPER} strokeWidth={6} strokeLinecap="round">{ticks}</g>
      <g stroke={INK} strokeWidth={2.4} strokeLinecap="round">{streaks}</g>
    </g>
  );
};

// ---- the film: one function per shot --------------------------------------------
type Shot = {
  cam: { x: number; s: number; gy: number; shake?: number };
  speed: number; // background streak strength 0..1
  back?: React.ReactNode; // world space, behind guy
  guy?: Guy | null;
  front?: React.ReactNode; // world space, in front of guy
  fx?: React.ReactNode; // world space, on top
};

const V = 30; // run speed (world units / frame)
const ph = (t: number, hz = 3.4) => t * hz * Math.PI * 2;

/** Rocket trail: world-fixed puffs spawned every 2 frames behind the tail. */
function trail(f: number, from: number, at: (f: number) => V | null, life = 26, k0 = 0): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  for (let b = f - (f % 2); b >= Math.max(from, f - life); b -= 2) {
    const p = at(b);
    if (!p) continue;
    const age = f - b;
    const r = 7 + age * 1.6;
    out.push(<Puff key={`pf${b}`} at={[p[0] - 150 - age * 1.5 + hn(b, 4) * 6, p[1] + hn(b, 7) * 8 - age * 0.6]} r={r} o={clamp(1 - age / life, 0, 1)} k={b + k0} />);
  }
  return out.reverse();
}

function shotFire(t: number, f: number, t2: number): Shot {
  const fF = Math.round(T.fire * FPS);
  const x = 200;
  const fired = t >= T.fire;
  const kick = fired ? tr(t, [[T.fire, 0], [T.fire + 0.07, 1, E.out], [T.fire + 0.5, 0.15]]) : 0;
  const drop = clamp((t2 - (T.run - 0.42)) / 0.2, 0, 1); // tosses the tube, crouches to sprint
  const sh: V = [x + 4 - kick * 16, G - 292 + kick * 6];
  const tubeAt: V = drop > 0 ? [lerp(sh[0] + 40, x - 60, drop), lerp(sh[1], G - 16, E.in2(drop))] : [sh[0] + 40, sh[1]];
  const tubeAng = drop > 0 ? lerp(0, -14, drop) : -kick * 6;
  const crouch = clamp((t2 - (T.run - 0.3)) / 0.3, 0, 1);
  const pose = standPose(x - kick * 10 + crouch * 10, {
    lean: -kick * 12 + crouch * 22,
    pelvis: [x - kick * 12 + crouch * 14, G - 160 + crouch * 30],
    handL: drop > 0 ? add([x - 40, G - 250], [crouch * 30, crouch * 60]) : add(tubeAt, [-50, 10]),
    handR: drop > 0 ? add([x + 60, G - 230], [crouch * 30, crouch * 40]) : add(tubeAt, [40, 12]),
    elbL: 1, elbR: -1,
  });
  const rocketX = (b: number) => (b < fF ? null : ([tubeAt[0] + 150 + 34 * (b - fF) ** 1.35, G - 292 + 0.0 * b] as V));
  const rp = rocketX(f);
  const ff = f - fF;
  const blink = Math.floor(f / 2) % 47 === 3;
  return {
    cam: { x: 300 + tr(t, [[0, 0], [T.fire, 18]]), s: tr(t, [[0, 1.22], [T.fire, 1.32, E.io], [T.run, 1.28]]), gy: 860, shake: fired ? Math.max(0, 1 - ff / 10) * 12 : 0 },
    speed: 0,
    back: (
      <>
        {fired && ff < 26 && Array.from({ length: 4 }, (_, i) => <Puff key={`bb${i}`} at={[x - 130 - ff * (3 + i * 2) - i * 30, G - 300 + i * 14 - ff * 0.6]} r={14 + ff * (1.6 + i * 0.3)} o={1 - ff / 26} k={i} />)}
        {trail(f, fF, rocketX)}
      </>
    ),
    guy: {
      pose,
      tilt: -kick * 8,
      face: face({ yaw: 0.75, look: [0.9, 0.05], lids: blink ? 1 : fired && ff < 8 ? 0.8 : 0.15, brow: fired ? 12 : -2, mouth: fired && ff >= 3 ? "o" : "smug", seed: Math.floor(f / 4) }),
    },
    front: (
      <>
        <Bazooka at={tubeAt} ang={tubeAng} />
        {rp && rp[0] < 1200 && <Rocket at={rp} f={f} />}
      </>
    ),
    fx: fired && ff < 7 ? <Burst at={[tubeAt[0] + 140, tubeAt[1]]} r={30 + ff * 12} o={1 - ff / 7} n={9} seed={2} /> : null,
  };
}

function shotChase(t: number, f: number, t2: number): Shot {
  const f0 = Math.round(T.run * FPS);
  const gx = (b: number) => (b - f0) * V;
  const rel = (b: number) => 140 + 26 * Math.sin((b - f0) / 9) + (b / FPS > T.grabTry ? ((b / FPS - T.grabTry) * 60) : 0);
  const rAt = (b: number): V => [gx(b) + rel(b) + 40, G - 128];
  const pose = runPose(gx(f), ph(t2), 1, { lean: 20 });
  // reach for it on «بگیریش»
  if (t >= T.grabTry - 0.15) {
    const k = clamp((t2 - T.grabTry + 0.15) / 0.2, 0, 1);
    pose.handR = add(pose.handR, [(rAt(f)[0] + 60 - pose.handR[0]) * k, (rAt(f)[1] - 16 - pose.handR[1]) * k]);
  }
  return {
    cam: { x: gx(f) + 80, s: tr(t, [[T.run, 1.25], [T.wide, 1.42]]), gy: 860, shake: 3 },
    speed: 1,
    back: trail(f, f0 - 20, rAt),
    guy: { pose, tilt: 6, face: face({ yaw: 0.85, look: [0.6, 0.5], lids: 0, brow: 10, mouth: t >= T.grabTry ? "grr" : "o", angry: t >= T.grabTry ? 0.6 : 0, seed: Math.floor(f / 4) }) },
    front: <Rocket at={rAt(f)} f={f} />,
  };
}

function shotWide(t: number, f: number, t2: number): Shot {
  const f0 = Math.round(T.wide * FPS);
  const gx = (b: number) => (b - f0) * V * 1.2;
  const rAt = (b: number): V => [gx(b) + 120 + 20 * Math.sin(b / 7), G - 128];
  return {
    cam: { x: gx(f) + 60, s: tr(t, [[T.wide, 0.56], [T.front, 0.68]]), gy: 840, shake: 1.5 },
    speed: 1,
    back: trail(f, f0 - 40, rAt, 40),
    guy: { pose: runPose(gx(f), ph(t2, 3.8), 1, { lean: 24, stride: 84 }), tilt: 4, face: face({ yaw: 0.85, lids: 0, brow: 8, mouth: "grr", angry: 0.4, seed: Math.floor(f / 4) }) },
    front: <Rocket at={rAt(f)} f={f} />,
  };
}

function shotSnatch(t: number, f: number, t2: number): Shot {
  const f0 = Math.round(T.front * FPS);
  const gx = (b: number) => (b - f0) * V + 400;
  const rAt = (b: number): V => [gx(b) - 250, G - 196];
  const pose = runPose(gx(f), -ph(t2, 3.2), -1, { lean: -4, stride: 60 });
  const nose = add(rAt(f), [128, 0]);
  const k = clamp((t2 - T.front) / 0.25, 0, 1);
  pose.handL = add(pose.handL, [(nose[0] - 6 - pose.handL[0]) * k, (nose[1] - 14 - pose.handL[1]) * k]);
  pose.handR = add(pose.handR, [(nose[0] + 4 - pose.handR[0]) * k, (nose[1] + 16 - pose.handR[1]) * k]);
  pose.elbL = 1; pose.elbR = -1;
  const got = t >= T.snatch;
  return {
    cam: { x: gx(f) - 120, s: tr(t, [[T.front, 1.45], [T.snatch, 1.7, E.out], [T.but, 1.8]]), gy: 1060, shake: got ? 5 : 2 },
    speed: 1,
    back: trail(f, f0 - 20, rAt),
    guy: { pose, tilt: -4, face: face({ yaw: -0.8, look: [-0.7, 0.4], lids: 0, brow: got ? 14 : 6, mouth: got ? "bigGrin" : "grin", seed: Math.floor(f / 4) }) },
    front: <Rocket at={rAt(f)} f={f} />,
    fx: got && f - Math.round(T.snatch * FPS) < 6 ? <Burst at={add(nose, [6, 0])} r={22 + (f - Math.round(T.snatch * FPS)) * 7} o={0.9} n={7} seed={5} /> : null,
  };
}

function shotSkid(t: number, f: number, t2: number): Shot {
  const f0 = Math.round(T.but * FPS);
  const gx = (b: number) => (b - f0) * V * 1.1 + 300;
  const rAt = (b: number): V => [gx(b) - 210, G - 176];
  const x = gx(f);
  const j = hn(Math.floor(f / 2), 9);
  const nose = add(rAt(f), [128, 0]);
  const pose: Pose = {
    pelvis: [x - 4 + j * 2, G - 128], lean: -34, sq: 0.97, fx: -1,
    footL: [x + 70 + j * 6, G - 6], footR: [x + 22 - j * 4, G - 4], kneeL: 1, kneeR: 1,
    handL: add(nose, [-4, -14]), handR: add(nose, [6, 14]), elbL: 1, elbR: -1, toeL: -28, toeR: -18,
  };
  const ku = t >= T.kuchulu - 0.05;
  const sparks: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const age = (f + i * 3) % 10;
    const base: V = [x + (i % 2 ? 90 : 46), G - 2];
    const a = -0.5 - 0.6 * Math.abs(hn(Math.floor((f + i * 3) / 10), i));
    sparks.push(<path key={`sp${i}`} d={`M${base[0] + age * 9 * Math.cos(a) * -1} ${base[1] + age * 9 * Math.sin(a)} l${-14 * Math.cos(a)} ${14 * Math.sin(a)}`} stroke={i % 2 ? HOT : HOT2} strokeWidth={4} strokeLinecap="round" opacity={1 - age / 10} />);
  }
  const dust = Array.from({ length: 5 }, (_, i) => {
    const age = (f + i * 5) % 22;
    return <Puff key={`du${i}`} at={[x + 100 + age * 2 + i * 6, G - 14 - age * 1.4]} r={8 + age * 1.3} o={1 - age / 22} k={i + 40} />;
  });
  const sweat = [0, 1].map((i) => {
    const age = (f + i * 9) % 18;
    const head = add(solve(pose, GUY).neck, rot([60, -150], -34));
    return <path key={`sw${i}`} transform={`translate(${head[0] + age * 4 + i * 10} ${head[1] - 30 + age * age * 0.35 - age * 4})`} d="M0 -7 C2 -3 4.5 0 4.5 2.6 C4.5 5.2 2.4 7 0 7 C-2.4 7 -4.5 5.2 -4.5 2.6 C-4.5 0 -2 -3 0 -7 Z" fill={PAPER} stroke={INK} strokeWidth={2} opacity={1 - age / 18} />;
  });
  return {
    cam: { x: x - 30 + (ku ? -40 : 0), s: ku ? tr(t, [[T.kuchulu - 0.05, 1.3], [T.kuchulu + 0.12, 1.8, E.out]]) : tr(t, [[T.but, 1.15], [T.kuchulu, 1.3]]), gy: ku ? 1180 : 900, shake: 7 },
    speed: 1,
    back: (
      <>
        {trail(f, f0 - 20, rAt)}
        {dust}
      </>
    ),
    guy: { pose, tilt: 14, face: face({ yaw: -0.75, look: [-0.5, 0.6], lids: 0, brow: 16, mouth: ku ? "o" : "grr", angry: ku ? 0 : 1, seed: Math.floor(f / 2) }) },
    front: (
      <>
        <Rocket at={rAt(f)} f={f} />
        {sparks}
      </>
    ),
    fx: <g>{sweat}</g>,
  };
}

function shotOvertake(t: number, f: number, t2: number): Shot {
  const f0 = Math.round(T.insted * FPS);
  const fB = Math.round(T.behind * FPS);
  const fH = Math.round(T.hit * FPS);
  const rX = (b: number) => (b - f0) * V + (b > fB ? ((b - fB) ** 2) * 0.9 : 0);
  // the guy: lets go, turns, sprints ahead and gains a lead, then the rocket closes in
  const lead = (b: number) => 150 + 260 * E.out(clamp((b - f0) / (fB - f0), 0, 1));
  const gx = (b: number) => (b - f0) * V + lead(b);
  const rAt = (b: number): V => [rX(b), G - 118];
  const turned = t2 >= T.insted + 0.25;
  const pose = turned ? runPose(gx(f), ph(t2, 3.8), 1, { lean: 22, stride: 84 }) : runPose(gx(f), -ph(t2, 3.2), -1, { lean: -6 });
  const smug = t >= T.ahead && t < T.behind;
  const scared = t >= T.behind;
  const hitIn = clamp((fH - f) / (fH - fB), 0, 1);
  return {
    cam: { x: lerp(gx(f) - 90, (gx(f) + rX(f)) / 2, 1 - hitIn) + 0, s: tr(t, [[T.insted, 1.12], [T.ahead, 1.22], [T.behind, 1.28], [T.hit, 1.4, E.in2]]), gy: 880, shake: scared ? 5 : 3 },
    speed: 1,
    back: trail(f, f0 - 20, rAt),
    guy: {
      pose,
      tilt: smug ? -8 : scared ? 10 : 4,
      face: face({
        yaw: !turned ? -0.8 : smug ? 0.05 : scared ? -0.45 : 0.85,
        look: smug ? [0, 0.1] : scared ? [-1, 0.2] : [0.6, 0],
        lids: smug ? 0.5 : 0, brow: smug ? 4 : scared ? 18 : 6,
        mouth: smug ? "smug" : scared ? "o" : "grin", seed: Math.floor(f / 4),
      }),
    },
    front: <Rocket at={rAt(f)} f={f} />,
  };
}

function shotLaunch(t: number, f: number, t2: number): Shot {
  const fH = Math.round(T.hit * FPS);
  const a = f - fH;
  const a2 = Math.floor(t2 * FPS) - fH;
  const x0 = 900;
  // body + rocket fly up-right together: he rides it butt-first
  const posAt = (b: number): V => { const fl = Math.max(0, b - fH - 3); return [x0 + fl * 5, G - 152 - fl * 30 + fl * fl * 0.1]; };
  const spinAt = (b: number) => -34 + Math.sin((b - fH) / 3) * 12;
  const pos = posAt(f);
  const spin = spinAt(f);
  const flail = (k: number) => Math.sin(a2 * 0.9 + k) * 40;
  const pose: Pose = {
    pelvis: [0, 0], lean: -20, sq: 1, fx: 1,
    footL: [-40 + flail(0), 130 + flail(1) * 0.5], footR: [40 + flail(2), 140 - flail(3) * 0.5], kneeL: -1, kneeR: 1,
    handL: [-60 + flail(4), -220 + flail(5)], handR: [70 - flail(6), -230 - flail(1)], elbL: 1, elbR: -1, toeL: 20, toeR: -30,
  };
  const r0 = solve(pose, GUY);
  const g: Guy = { pose, tilt: -12, face: face({ yaw: 0.2, look: [0, -0.3], lids: 0, brow: 22, mouth: "o", seed: Math.floor(f / 2) }) };
  const rocketAt = (b: number): V => add(add(posAt(b), rot([-290, 6], spinAt(b) - 8)), [150, 0]);
  return {
    cam: { x: 900 + Math.min(a, 40) * 1.5, s: tr(t, [[T.hit, 1.4], [T.hit + 0.12, 1.2, E.out], [T.end, 0.95]]), gy: tr(t, [[T.hit, 900], [T.hit + 0.3, 960], [T.end, 1240]]), shake: Math.max(0, 1 - a / 18) * 22 },
    speed: 0,
    back: (
      <>
        {trail(f, fH, (b) => (b - fH > 3 ? add(rocketAt(b), [0, 0]) : null), 34)}
      </>
    ),
    guy: null,
    front: (
      <g transform={`translate(${pos[0]} ${pos[1]}) rotate(${spin})`}>
        <Rocket at={[-150, 6]} f={f} ang={-8} />
        <GuyFig g={g} />
        {/* «پ» marks: flailing lines */}
        <path d={`M${r0.neck[0] - 70} ${r0.neck[1] - 120} q-20 -10 -34 4 M${r0.neck[0] + 70} ${r0.neck[1] - 130} q20 -12 34 2`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    ),
    fx: a < 16 ? <Burst at={[x0 - 40, G - 150]} r={40 + a * 14} o={1 - Math.max(0, a - 6) / 10} n={13} seed={9} /> : null,
  };
}

function shotAt(t: number, f: number, t2: number): Shot {
  if (t < T.run) return shotFire(t, f, t2);
  if (t < T.wide) return shotChase(t, f, t2);
  if (t < T.front) return shotWide(t, f, t2);
  if (t < T.but) return shotSnatch(t, f, t2);
  if (t < T.insted) return shotSkid(t, f, t2);
  if (t < T.hit) return shotOvertake(t, f, t2);
  return shotLaunch(t, f, t2);
}

// ---- overlays ---------------------------------------------------------------------
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const Speedo: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.speed0 - 0.1 || t >= T.front) return null;
  const v = Math.round(300 * E.out(clamp((t - T.speed0) / (T.sisad + 0.2 - T.speed0), 0, 1)));
  const punch = t >= T.sisad + 0.2 ? Math.max(0, 1 - (t - T.sisad - 0.2) / 0.25) : 0;
  const pop = clamp((t - T.speed0 + 0.1) / 0.12, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 360, width: "100%", textAlign: "center", transform: `scale(${(0.6 + 0.4 * E.back(pop)) * (1 + punch * 0.18)})`, transformOrigin: "50% 60%" }}>
      <div style={{ fontFamily: FONT_NUM, fontSize: 300, lineHeight: 1, color: HOT, textShadow: `6px 6px 0 ${INK}`, WebkitTextStroke: `5px ${INK}` }}>{fa(v)}</div>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 64, color: INK, direction: "rtl", marginTop: 6 }}>کیلومتر بر ساعت</div>
    </div>
  );
};

const Sub: React.FC<{ t: number }> = ({ t }) => {
  const i = WORDS.findIndex((w, k) => t >= w.s && (k + 1 >= WORDS.length ? t < w.e + 0.15 : t < WORDS[k + 1].s));
  if (i < 0 || t >= T.hit) return null;
  const w = WORDS[i];
  const k = clamp((t - w.s) / 0.1, 0, 1);
  const txt = w.w.replace(/[،]/g, "");
  return (
    <div style={{ position: "absolute", left: 0, top: 1345, width: "100%", textAlign: "center", direction: "rtl" }}>
      <span style={{ display: "inline-block", fontFamily: FONT_TEXT, fontSize: 96, color: "#fbfbf3", transform: `scale(${0.8 + 0.2 * E.back(k)})`, textShadow: `0 0 2px ${INK}, 0 4px 0 ${INK}, 3px 0 0 ${INK}, -3px 0 0 ${INK}, 0 -3px 0 ${INK}, 0 0 18px rgba(20,21,17,.5)` }}>{txt}</span>
    </div>
  );
};

const Boom: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.hit) return null;
  const k = clamp((t - T.hit) / 0.18, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 120, width: "100%", textAlign: "center", direction: "rtl", transform: `rotate(-8deg) scale(${0.3 + 0.7 * E.back(k)})` }}>
      <span style={{ fontFamily: FONT_NUM, fontSize: 210, color: HOT2, WebkitTextStroke: `6px ${INK}`, textShadow: `8px 8px 0 ${INK}` }}>بوووم!</span>
    </div>
  );
};

// ---- composition --------------------------------------------------------------------
const Grain: React.FC = () => (
  <>
    <filter id="v07grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.18" />
    </filter>
    <rect width={720} height={1280} filter="url(#v07grain)" opacity={0.3} />
  </>
);

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const f2 = frame - (frame % 2);
  const t2 = f2 / FPS;
  const S = shotAt(t, frame, t2);
  const { cam } = S;
  const sx = (cam.shake ?? 0) * hn(Math.floor(frame / 2), 11);
  const sy = (cam.shake ?? 0) * hn(Math.floor(frame / 2), 13);
  const world = `translate(${360 + sx} ${cam.gy + sy}) scale(${cam.s}) translate(${-cam.x} ${-G})`;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg viewBox="0 0 720 1280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="v07boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves={1} seed={Math.floor(frame / 4)} />
            <feDisplacementMap in="SourceGraphic" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g transform={`translate(${sx} ${sy})`}>
          <Track camX={cam.x} s={cam.s} gy={cam.gy} frame={frame} speed={S.speed} />
        </g>
        <g transform={world} filter="url(#v07boil)">
          {/* contact shadow */}
          {S.guy && <ellipse cx={S.guy.pose.pelvis[0]} cy={G + 2} rx={70} ry={9} fill={INK} opacity={0.18} />}
          {S.back}
          {S.guy && <GuyFig g={S.guy} />}
          {S.front}
          {S.fx}
        </g>
        <Grain />
      </svg>
      <Speedo t={t} />
      <Boom t={t} />
      <Sub t={t} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V07_LOOK = [0.1, 0.8, 1.2, 2.4, 3.95, 5.6, 6.9, 8.5, 9.2, 10.3, 11.5, 12.9, 14.0, 14.8, 15.1, 15.35, 15.8, 16.6];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - Math.round(V07_LOOK[f] * FPS)}>
      <Video />
    </Sequence>
  );
};

export const V07: React.FC = () => (
  <>
    <Composition id="V07" component={Video} durationInFrames={V07_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v07/mix.wav" }} />
    <Composition id="V07-Silent" component={Video} durationInFrames={V07_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V07-Look" component={Look} durationInFrames={V07_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
