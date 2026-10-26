// V10 «نامیرا» — shared kit: timing from words.json, easing, cartoon person rig, sky / clouds / stars.
// Look: flat cinematic vector (soft gradients, no outlines), one hero in a mustard hoodie through every era.
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import words from "./words.json";

export type Wd = { si: number; wi: number; w: string; v: string; s: number; e: number };
export const WORDS = words as Wd[];
export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);
/** start time of the first word in line `si` containing `needle` */
export const W = (si: number, needle: string, nth = 0) => {
  const h = WORDS.filter((w) => w.si === si && w.w.includes(needle));
  const w = h[nth] ?? h[0];
  if (!w) throw new Error(`word ${si}:${needle}`);
  return w.s;
};
export const WE = (si: number, needle: string, nth = 0) => {
  const h = WORDS.filter((w) => w.si === si && w.w.includes(needle));
  return (h[nth] ?? h[0]).e;
};
export const S = (si: number) => WORDS.find((w) => w.si === si)!.s;
export const E = (si: number) => WORDS.filter((w) => w.si === si).at(-1)!.e;

export const BLACK = "V10Black";
export const BOLD = "V10Bold";
if (typeof document !== "undefined") {
  const h = delayRender("v10 fonts");
  Promise.all([
    new FontFace(BLACK, `url('${staticFile("fonts/Vazirmatn-Black.ttf")}')`).load().then((f) => document.fonts.add(f)),
    new FontFace(BOLD, `url('${staticFile("fonts/Vazirmatn-Bold.ttf")}')`).load().then((f) => document.fonts.add(f)),
  ]).then(() => continueRender(h)).catch(() => continueRender(h));
}

// ---- math ----------------------------------------------------------------------
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const out3 = (t: number) => 1 - (1 - t) ** 3;
export const in2 = (t: number) => t * t;
export const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
export const lin = (t: number) => t;
/** 0→1 between a and b with easing */
export const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
export const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
/** damped shake */
export const shake = (t: number, at: number, amp = 30, dur = 0.5) => {
  const k = t - at;
  if (k < 0 || k > dur) return [0, 0];
  const d = (1 - k / dur) ** 2 * amp;
  return [Math.sin(k * 90) * d, Math.cos(k * 77) * d];
};
const mix = (a: string, b: string, k: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, "0")).join("");
};
export { mix as mixColor };

// ---- person rig ------------------------------------------------------------------
// Origin = hip centre. Limb angles in degrees: 0 = straight down, +90 = screen right, 180 = up.
export type Pose = {
  armL: [number, number]; armR: [number, number]; legL: [number, number]; legR: [number, number];
  lean?: number; // torso tilt (deg, + leans right)
  head?: number; // head tilt (deg)
};
export const P = {
  stand: { armL: [-10, -6], armR: [10, 6], legL: [-5, 0], legR: [5, 0] } as Pose,
  spread: { armL: [-115, -135], armR: [115, 135], legL: [-35, -25], legR: [35, 25] } as Pose, // skydive
  hips: { armL: [-40, 30], armR: [40, -30], legL: [-9, 0], legR: [9, 0] } as Pose, // hands on hips
  thumbs: { armL: [-10, -6], armR: [35, 150], legL: [-6, 0], legR: [6, 0] } as Pose,
  cross: { armL: [-20, 60], armR: [20, -60], legL: [-8, 0], legR: [8, 0] } as Pose, // arms crossed
  sit: { armL: [-15, 20], armR: [15, -20], legL: [-80, 0], legR: [-70, 5] } as Pose, // sitting, facing left-ish
  sitFront: { armL: [-20, 10], armR: [20, -10], legL: [-62, 58], legR: [62, -58] } as Pose,
  dive: { armL: [170, 175], armR: [-170, -175], legL: [-4, 0], legR: [4, 0] } as Pose,
  lie: { armL: [-150, -160], armR: [150, 160], legL: [-4, 0], legR: [6, 0] } as Pose,
  wave: { armL: [-10, -6], armR: [130, 165], legL: [-5, 0], legR: [5, 0] } as Pose,
  float: { armL: [-70, -40], armR: [75, 110], legL: [-20, 10], legR: [15, -25] } as Pose,
  shrug: { armL: [-50, 40], armR: [50, -40], legL: [-6, 0], legR: [6, 0] } as Pose,
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => ({
  armL: [lerp(a.armL[0], b.armL[0], k), lerp(a.armL[1], b.armL[1], k)],
  armR: [lerp(a.armR[0], b.armR[0], k), lerp(a.armR[1], b.armR[1], k)],
  legL: [lerp(a.legL[0], b.legL[0], k), lerp(a.legL[1], b.legL[1], k)],
  legR: [lerp(a.legR[0], b.legR[0], k), lerp(a.legR[1], b.legR[1], k)],
  lean: lerp(a.lean ?? 0, b.lean ?? 0, k),
  head: lerp(a.head ?? 0, b.head ?? 0, k),
});

export type Eye = "open" | "closed" | "wide" | "happy" | "sad" | "squint";
export type Mouth = "smile" | "grin" | "o" | "flat" | "sad" | "smirk" | "open";
export type Look = {
  top: string; bottom: string; skin: string; hair: string; shoe?: string;
  hairStyle?: "hero" | "long" | "bun" | "spiky" | "bald" | "kid";
  dress?: boolean; kid?: boolean; age?: number; // 0 young → 1 old (grey hair, wrinkles)
};
export const HERO: Look = { top: "#f2a92e", bottom: "#27324a", skin: "#f1c39d", hair: "#3a2418", shoe: "#1c1c22", hairStyle: "hero" };
export const WIFE: Look = { top: "#2f8f83", bottom: "#2f8f83", skin: "#f3c9a8", hair: "#5a2a1a", shoe: "#5b2b2b", hairStyle: "long", dress: true };

const dir = (a: number) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
const limb = (x: number, y: number, a1: number, l1: number, a2: number, l2: number) => {
  const [dx1, dy1] = dir(a1), [dx2, dy2] = dir(a1 + a2);
  const kx = x + dx1 * l1, ky = y + dy1 * l1;
  return { kx, ky, ex: kx + dx2 * l2, ey: ky + dy2 * l2 };
};
const shade = (c: string, k: number) => mix(c, "#000000", k);
const tint = (c: string, k: number) => mix(c, "#ffffff", k);

export type Face = { eye?: Eye; mouth?: Mouth; brows?: number; facing?: number; blink?: boolean; soot?: number; glasses?: boolean; shades?: boolean; tear?: number };

export const Person: React.FC<{
  x: number; y: number; s?: number; pose?: Pose; look?: Look; face?: Face;
  rot?: number; sx?: number; sy?: number; op?: number; spiky?: number; id?: string;
}> = ({ x, y, s = 1, pose = P.stand, look = HERO, face = {}, rot = 0, sx = 1, sy = 1, op = 1, spiky = 0 }) => {
  const kid = look.kid, age = look.age ?? 0;
  const hs = kid ? 1.18 : 1; // head size
  const L = kid ? 0.62 : 1; // limb scale
  const th = 125 * L; // torso height
  const lean = pose.lean ?? 0;
  const top = look.top, bot = look.bottom;
  const hair = age > 0 ? mix(look.hair, "#d9d6d0", clamp(age * 1.4)) : look.hair;
  const shoulder = (sgn: number) => ({ x: sgn * 48 * L, y: -th + 10 * L });
  const hipP = (sgn: number) => ({ x: sgn * 22 * L, y: -4 });
  const legs = ([["L", -1], ["R", 1]] as const).map(([k, sg]) => {
    const [a1, a2] = k === "L" ? pose.legL : pose.legR;
    const h = hipP(sg);
    return { ...limb(h.x, h.y, a1, 70 * L, a2, 66 * L), hx: h.x, hy: h.y, sg, a: a1 + a2 };
  });
  const arms = ([["L", -1], ["R", 1]] as const).map(([k, sg]) => {
    const [a1, a2] = k === "L" ? pose.armL : pose.armR;
    const sh = shoulder(sg);
    return { ...limb(sh.x, sh.y, a1, 56 * L, a2, 52 * L), sx: sh.x, sy: sh.y, sg };
  });
  const fx = (face.facing ?? 0) * 14;
  const eye = face.blink ? "closed" : face.eye ?? "open";
  const mouth = face.mouth ?? "smile";
  const hy = -th - 62 * hs; // head centre
  const R = 54 * hs;
  const soot = face.soot ?? 0;
  const skin = look.skin;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s * sy})`} opacity={op}>
      {/* soft contact shadow */}
      {/* legs */}
      {legs.map((l, i) => (
        <g key={"l" + i}>
          {!look.dress && <path d={`M${l.hx} ${l.hy} L${l.kx} ${l.ky} L${l.ex} ${l.ey}`} stroke={i ? bot : shade(bot, 0.12)} strokeWidth={30 * L} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          {look.dress && <path d={`M${l.kx} ${l.ky} L${l.ex} ${l.ey}`} stroke={skin} strokeWidth={18 * L} strokeLinecap="round" fill="none" />}
          <ellipse cx={l.ex + l.sg * 10 * L} cy={l.ey + 4} rx={24 * L} ry={12 * L} fill={look.shoe ?? "#222"} transform={`rotate(${-l.a * 0.6} ${l.ex} ${l.ey})`} />
        </g>
      ))}
      <g transform={`rotate(${lean} 0 0)`}>
        {/* torso */}
        {look.dress ? (
          <path d={`M${-40 * L} ${-th} Q${-58 * L} ${-th + 8} ${-54 * L} ${-th + 40 * L} L${-78 * L} ${46 * L} Q0 ${60 * L} ${78 * L} ${46 * L} L${54 * L} ${-th + 40 * L} Q${58 * L} ${-th + 8} ${40 * L} ${-th} Z`} fill={top} />
        ) : (
          <path d={`M${-46 * L} ${-th} Q${-64 * L} ${-th + 6} ${-60 * L} ${-th + 34 * L} L${-50 * L} ${6} Q0 ${14 * L} ${50 * L} ${6} L${60 * L} ${-th + 34 * L} Q${64 * L} ${-th + 6} ${46 * L} ${-th} Z`} fill={top} />
        )}
        {/* side shading + hoodie pocket / dress waist */}
        <path d={`M${20 * L} ${-th + 4} Q${60 * L} ${-th + 6} ${58 * L} ${-th + 40 * L} L${look.dress ? 76 * L : 50 * L} ${look.dress ? 46 * L : 6} Q${30 * L} ${look.dress ? 54 * L : 10 * L} ${24 * L} ${look.dress ? 52 * L : 10 * L} Z`} fill="rgba(0,0,0,.13)" />
        {!look.dress && !kid && <path d={`M${-32} ${-38} L${32} ${-38} L${38} ${-6} L${-38} ${-6} Z`} fill={shade(top, 0.1)} />}
        {!look.dress && !kid && <path d={`M-14 ${-th + 6} L-16 ${-th + 52} M14 ${-th + 6} L16 ${-th + 52}`} stroke={tint(top, 0.55)} strokeWidth={4} strokeLinecap="round" />}
        {/* hood ring */}
        {!look.dress && !kid && <ellipse cx={0} cy={-th + 2} rx={40} ry={14} fill={shade(top, 0.18)} />}
        {/* arms */}
        {arms.map((a, i) => (
          <g key={"a" + i}>
            <path d={`M${a.sx} ${a.sy} L${a.kx} ${a.ky} L${a.ex} ${a.ey}`} stroke={i ? top : shade(top, 0.08)} strokeWidth={26 * L} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={a.ex} cy={a.ey} r={14 * L} fill={skin} />
          </g>
        ))}
        {/* neck + head */}
        <rect x={-14 * L} y={-th - 20 * hs} width={28 * L} height={26 * hs} rx={8} fill={shade(skin, 0.12)} />
        <g transform={`rotate(${pose.head ?? 0} 0 ${-th})`}>
          {look.hairStyle === "long" && <path d={`M${-R - 6} ${hy - 10} Q${-R - 16} ${hy + 90} ${-R + 8} ${hy + 110} L${R - 8} ${hy + 110} Q${R + 16} ${hy + 90} ${R + 6} ${hy - 10} Z`} fill={shade(hair, 0.08)} />}
          <circle cx={-R + 2} cy={hy + 6} r={12 * hs} fill={shade(skin, 0.06)} />
          <circle cx={R - 2} cy={hy + 6} r={12 * hs} fill={shade(skin, 0.06)} />
          <circle cx={0} cy={hy} r={R} fill={skin} />
          <path d={`M${R * 0.25} ${hy - R * 0.96} A${R} ${R} 0 0 1 ${R * 0.25} ${hy + R * 0.96} A${R * 0.9} ${R} 0 0 0 ${R * 0.25} ${hy - R * 0.96} Z`} fill="rgba(0,0,0,.07)" />
          {/* wrinkles */}
          {age > 0.5 && <path d={`M${fx - 30} ${hy - 30} q15 -5 30 0 M${fx} ${hy - 30} q15 -5 30 0 M${fx - 38} ${hy + 18} q6 10 2 18 M${fx + 38} ${hy + 18} q-6 10 -2 18`} stroke={shade(skin, 0.25)} strokeWidth={2.5} fill="none" opacity={clamp((age - 0.5) * 2)} />}
          <Hair style={spiky > 0.5 ? "spiky" : look.hairStyle ?? "hero"} hy={hy} R={R} c={hair} k={spiky} fx={fx} />
          {/* face */}
          <FaceG fx={fx} hy={hy} hs={hs} eye={eye} mouth={mouth} brows={face.brows ?? 1} skin={skin} glasses={face.glasses} shades={face.shades} tear={face.tear ?? 0} />
          {soot > 0 && <g opacity={soot}>{[[-24, -14, 26, 15], [22, 8, 30, 14], [-6, 30, 22, 10], [30, -26, 16, 10], [-34, 22, 14, 9]].map(([px, py, rx, ry], i) => <ellipse key={"s" + i} cx={fx + px} cy={hy + py} rx={rx} ry={ry} fill="#4a403c" opacity={0.55} />)}</g>}
          {soot > 0 && <g opacity={soot}>{[0, 1, 2].map((i) => <path key={i} d={`M${-20 + i * 20} ${hy - R - 6} q${6 - i * 3} -26 ${-4 + i * 4} -${46 + i * 8}`} stroke="#777" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.5} />)}</g>}
        </g>
      </g>
    </g>
  );
};

const Hair: React.FC<{ style: string; hy: number; R: number; c: string; k: number; fx: number }> = ({ style, hy, R, c, k, fx }) => {
  if (style === "bald") return null;
  if (style === "spiky") {
    // straight-up burnt spikes (after the A-bomb)
    const n = 11;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = -80 + (160 * i) / (n - 1);
      const r = (a * Math.PI) / 180;
      const len = R * (0.75 + 0.35 * hn(i, 3)) * k;
      const bx = Math.sin(r) * R * 0.95, by = hy - Math.cos(r) * R * 0.95;
      return `L${bx - 9} ${by + 4} L${Math.sin(r) * (R + len) * 0.7} ${hy - R - len} L${bx + 9} ${by + 4}`;
    });
    return <path d={`M${-R} ${hy - 6} ${pts.join(" ")} L${R} ${hy - 6} Q0 ${hy - R * 0.5} ${-R} ${hy - 6} Z`} fill={c} />;
  }
  if (style === "long") return <path d={`M${-R - 6} ${hy + 30} Q${-R - 8} ${hy - R - 12} 0 ${hy - R - 10} Q${R + 8} ${hy - R - 12} ${R + 6} ${hy + 30} L${R - 6} ${hy + 30} Q${R - 4} ${hy - R * 0.3} ${R * 0.45} ${hy - R * 0.62} Q${fx + 4} ${hy - R * 0.42} ${-R * 0.5} ${hy - R * 0.58} Q${-R + 4} ${hy - R * 0.3} ${-R + 6} ${hy + 30} Z`} fill={c} />;
  if (style === "bun") return <g><circle cx={0} cy={hy - R - 8} r={R * 0.38} fill={c} /><path d={`M${-R - 2} ${hy} Q${-R} ${hy - R - 8} 0 ${hy - R - 6} Q${R} ${hy - R - 8} ${R + 2} ${hy} Q${R * 0.4} ${hy - R * 0.6} ${-R - 2} ${hy} Z`} fill={c} /></g>;
  if (style === "kid") return <path d={`M${-R - 2} ${hy - 2} Q${-R} ${hy - R - 10} 0 ${hy - R - 8} Q${R} ${hy - R - 10} ${R + 2} ${hy - 2} Q${R * 0.5} ${hy - R * 0.5} ${fx} ${hy - R * 0.55} Q${-R * 0.5} ${hy - R * 0.5} ${-R - 2} ${hy - 2} Z`} fill={c} />;
  // hero: messy quiff
  return (
    <path d={`M${-R - 3} ${hy + 4} Q${-R - 8} ${hy - R - 6} ${-R * 0.2} ${hy - R - 18} Q${R * 0.4} ${hy - R - 30} ${R * 0.75} ${hy - R - 8} Q${R + 8} ${hy - R * 0.5} ${R + 3} ${hy + 4} Q${R * 0.8} ${hy - R * 0.45} ${R * 0.3} ${hy - R * 0.55} Q${fx - 10} ${hy - R * 0.35} ${-R * 0.45} ${hy - R * 0.62} Q${-R * 0.8} ${hy - R * 0.4} ${-R - 3} ${hy + 4} Z`} fill={c} />
  );
};

const FaceG: React.FC<{ fx: number; hy: number; hs: number; eye: Eye; mouth: Mouth; brows: number; skin: string; glasses?: boolean; shades?: boolean; tear: number }> = ({ fx, hy, hs, eye, mouth, brows, skin, glasses, shades, tear }) => {
  const ex = 20 * hs, ey = hy - 4;
  const ink = "#2a1d18";
  const eyeG = (sx: number) => {
    const cx = fx + sx * ex;
    switch (eye) {
      case "closed": return <path d={`M${cx - 9} ${ey + 1} Q${cx} ${ey + 7} ${cx + 9} ${ey + 1}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
      case "happy": return <path d={`M${cx - 9} ${ey + 3} Q${cx} ${ey - 8} ${cx + 9} ${ey + 3}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      case "wide": return <g><circle cx={cx} cy={ey} r={12} fill="#fff" /><circle cx={cx + (fx > 0 ? 2 : 0)} cy={ey} r={5.5} fill={ink} /></g>;
      case "squint": return <path d={`M${cx - 9} ${ey} L${cx + 9} ${ey}`} stroke={ink} strokeWidth={4.5} strokeLinecap="round" />;
      case "sad": return <g><ellipse cx={cx} cy={ey + 2} rx={5.5} ry={7} fill={ink} /><circle cx={cx + 1.8} cy={ey - 1} r={1.8} fill="#fff" /></g>;
      default: return <g><ellipse cx={cx} cy={ey} rx={6} ry={8.5} fill={ink} /><circle cx={cx + 2} cy={ey - 3} r={2} fill="#fff" /></g>;
    }
  };
  const browG = (sx: number) => {
    if (brows <= 0) return null;
    const cx = fx + sx * ex;
    const tilt = eye === "sad" ? -sx * 5 : mouth === "flat" ? sx * 2 : 0;
    const lift = eye === "wide" ? -6 : 0;
    return <path d={`M${cx - 11} ${ey - 17 + lift - tilt} Q${cx} ${ey - 22 + lift} ${cx + 11} ${ey - 17 + lift + tilt}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={brows} />;
  };
  const my = hy + 26 * hs, mx = fx * 1.15;
  const mouthG = () => {
    switch (mouth) {
      case "grin": return <path d={`M${mx - 20} ${my - 4} Q${mx} ${my + 22} ${mx + 20} ${my - 4} Z`} fill="#5c1f1f" />;
      case "o": return <ellipse cx={mx} cy={my + 2} rx={8} ry={10} fill="#5c1f1f" />;
      case "open": return <path d={`M${mx - 14} ${my - 3} Q${mx} ${my + 16} ${mx + 14} ${my - 3} Z`} fill="#5c1f1f" />;
      case "flat": return <path d={`M${mx - 12} ${my + 2} L${mx + 12} ${my + 2}`} stroke={ink} strokeWidth={4} strokeLinecap="round" />;
      case "sad": return <path d={`M${mx - 13} ${my + 6} Q${mx} ${my - 4} ${mx + 13} ${my + 6}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
      case "smirk": return <path d={`M${mx - 12} ${my + 3} Q${mx + 4} ${my + 6} ${mx + 14} ${my - 4}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
      default: return <path d={`M${mx - 14} ${my} Q${mx} ${my + 12} ${mx + 14} ${my}`} stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
    }
  };
  return (
    <g>
      {eyeG(-1)}{eyeG(1)}{browG(-1)}{browG(1)}
      <ellipse cx={fx * 1.3} cy={hy + 10} rx={6} ry={4.5} fill={shade(skin, 0.14)} />
      <ellipse cx={fx - 30 * hs} cy={hy + 16} rx={9} ry={5} fill="#ff8a7a" opacity={0.28} />
      <ellipse cx={fx + 30 * hs} cy={hy + 16} rx={9} ry={5} fill="#ff8a7a" opacity={0.28} />
      {mouthG()}
      {glasses && <g stroke="#6b5a4a" strokeWidth={3} fill="rgba(255,255,255,.18)"><circle cx={fx - ex} cy={ey} r={13} /><circle cx={fx + ex} cy={ey} r={13} /><path d={`M${fx - ex + 13} ${ey} L${fx + ex - 13} ${ey}`} /></g>}
      {shades && <g><path d={`M${fx - ex - 17} ${ey - 9} L${fx - 4} ${ey - 9} L${fx - 8} ${ey + 9} Q${fx - ex} ${ey + 14} ${fx - ex - 15} ${ey + 6} Z M${fx + 4} ${ey - 9} L${fx + ex + 17} ${ey - 9} L${fx + ex + 15} ${ey + 6} Q${fx + ex} ${ey + 14} ${fx + 8} ${ey + 9} Z`} fill="#141418" /><path d={`M${fx - ex - 8} ${ey - 5} l8 0`} stroke="#fff" strokeWidth={3} opacity={0.6} /></g>}
      {tear > 0 && <path d={`M${fx - ex + 2} ${ey + 10 + tear * 30} q-5 8 0 12 q5 -4 0 -12`} fill="#9fd4ff" opacity={clamp(tear * 3) * (1 - clamp((tear - 0.8) * 5))} />}
    </g>
  );
};

/** soft oval ground shadow */
export const Shadow: React.FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 110, o = 0.22 }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill={`rgba(0,0,0,${o})`} />;

// ---- environment ---------------------------------------------------------------------
export const Sky: React.FC<{ c: string[]; id: string }> = ({ c, id }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{c.map((cc, i) => <stop key={i} offset={i / (c.length - 1)} stopColor={cc} />)}</linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#${id})`} />
  </>
);
/** one puffy cloud built from circles (flat bottom), w ≈ width */
export const Cloud: React.FC<{ x: number; y: number; w: number; c?: string; o?: number; shadow?: string }> = ({ x, y, w, c = "#ffffff", o = 1, shadow }) => {
  const k = w / 300;
  const blobs = [[-100, 0, 60], [-40, -40, 80], [40, -30, 70], [100, 0, 55], [0, 5, 70]];
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={o}>
      {shadow && blobs.map(([bx, by, r], i) => <circle key={"s" + i} cx={bx + 6} cy={by + 14} r={r} fill={shadow} />)}
      {blobs.map(([bx, by, r], i) => <circle key={i} cx={bx} cy={by} r={r} fill={c} />)}
      <rect x={-150} y={0} width={300} height={60} fill={c} rx={30} />
    </g>
  );
};
export const Stars: React.FC<{ t: number; n?: number; seed?: number; o?: number; h?: number; alive?: (i: number) => number }> = ({ t, n = 120, seed = 0, o = 1, h = 1920, alive }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const a = alive ? alive(i) : 1;
      if (a <= 0) return null;
      const r = 0.8 + hn(i, 3 + seed) * 2.6;
      return <circle key={i} cx={hn(i, 1 + seed) * 1080} cy={hn(i, 2 + seed) * h} r={r} fill={hn(i, 7) > 0.8 ? "#ffd9a8" : hn(i, 8) > 0.8 ? "#bcd4ff" : "#fff"} opacity={a * (0.35 + 0.55 * hn(i, 4 + seed) * (0.7 + 0.3 * Math.sin(t * 2.5 + i)))} />;
    })}
  </g>
);
/** speed / wind streaks (vertical, moving up) */
export const Streaks: React.FC<{ t: number; n?: number; speed?: number; o?: number; c?: string; horiz?: boolean }> = ({ t, n = 26, speed = 2600, o = 0.5, c = "#ffffff", horiz }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const len = 80 + hn(i, 5) * 260;
      const p = ((hn(i, 6) * 3000 + t * speed * (0.7 + 0.6 * hn(i, 9))) % 2400) - 300;
      const q = hn(i, 2) * 1080;
      return horiz
        ? <rect key={i} x={1080 - p} y={q * 1.78} width={len} height={3 + hn(i) * 3} rx={2} fill={c} opacity={0.3 + 0.5 * hn(i, 3)} />
        : <rect key={i} x={q} y={1920 - p} width={3 + hn(i) * 3} height={len} rx={2} fill={c} opacity={0.3 + 0.5 * hn(i, 3)} />;
    })}
  </g>
);
/** puff of smoke / dust particles from (x,y) starting at time at */
export const Puff: React.FC<{ t: number; at: number; x: number; y: number; n?: number; c?: string; spread?: number; dur?: number; up?: number; size?: number }> = ({ t, at, x, y, n = 14, c = "#d9cbb8", spread = 260, dur = 1.6, up = 120, size = 60 }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + hn(i, 1);
        const d = out3(k) * spread * (0.5 + 0.6 * hn(i, 2));
        const r = size * (0.5 + 0.6 * hn(i, 3)) * (0.6 + 0.8 * out3(k));
        return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.45 - out3(k) * up * hn(i, 4)} r={r} fill={c} opacity={(1 - k) * 0.9} />;
      })}
    </g>
  );
};
/** comic burst star (explosion / impact) */
export const Burst: React.FC<{ x: number; y: number; r: number; c?: string; c2?: string; n?: number; rot?: number }> = ({ x, y, r, c = "#ffcf3a", c2 = "#ff6a2a", n = 12, rot = 0 }) => {
  const pts = (rr: number) => Array.from({ length: n * 2 }, (_, i) => { const a = (i / (n * 2)) * Math.PI * 2 + rot; const q = i % 2 ? rr * 0.55 : rr * (0.9 + 0.2 * hn(i)); return `${x + Math.cos(a) * q},${y + Math.sin(a) * q}`; }).join(" ");
  return <g><polygon points={pts(r)} fill={c2} /><polygon points={pts(r * 0.68)} fill={c} /><circle cx={x} cy={y} r={r * 0.22} fill="#fffbe8" /></g>;
};
