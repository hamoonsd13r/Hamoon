// V28 · «۱۴ روز زیرِ شهر» — بقا بعد از انفجار اتمی وقتی توی ترافیکی.
// قالب از روی ویدیوی مرجعِ یوتیوب (روایتِ دوم‌شخص، شمارش روز، کارت‌های اطلاعاتِ کرمی، آدمک روی پس‌زمینه‌ی نقاشی)،
// ولی قصه، متن و کاراکترها مال خودمان است. پس‌زمینه‌ها و ژست‌های آدمک = عکس‌های کاربر (public/v28)،
// آدمک‌ها با کد متحرک می‌شوند؛ کارت‌ها، نمودارها، غبار، باران، نور و متن همه با کد.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";
import charsJson from "./chars.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const CH = charsJson as Record<string, { w: number; h: number }>;
const FPS = 30, W = 1920, H = 1080;

const fontHandle = typeof document !== "undefined" ? delayRender("v28 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V28Black", "fonts/Vazirmatn-Black.ttf"], ["V28Bold", "fonts/Vazirmatn-Bold.ttf"], ["V28Reg", "fonts/Vazirmatn-Regular.ttf"], ["V28Num", "fonts/Lalezar-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

// ───── utils ─────
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:؛]/g, "");
/** start time of the n-th (1-based) occurrence of `word` inside scene si */
const wd = (si: number, word: string, n = 1) => {
  const hits = words.filter((x) => x.si === si && bare(x.w) === word);
  const w = hits[n - 1] ?? words.find((x) => x.si === si && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const S = (si: number) => words.find((w) => w.si === si)!.s;
const E = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;
/** is voice v speaking at T (word-level, for mouth/body wiggle) */
const speaking = (v: string, T: number) => words.some((w) => w.v === v && T >= w.s - 0.02 && T <= w.e + 0.02);

// ───── palette ─────
export const CREAM = "#EEE8DC", INK = "#26272B", RED = "#C9452F", BLUE = "#3C78C4", GREEN = "#3E9A5B", AMBER = "#E7A43A";
const FT = "V28Bold", FB = "V28Black", FN = "V28Num";

// ───── scene timing (from the voice) ─────
const START = (si: number) => (si === 0 ? 0 : S(si) - 0.35);
const TOTAL = E(24) + 2.6;
export const V28_FRAMES = Math.round(TOTAL * FPS);
const DAY_LEN = 1.05; // black "روز N" card before day scenes

// ───── building blocks ─────
const Bg: React.FC<{ n: string; filter?: string; style?: React.CSSProperties }> = ({ n, filter, style }) => (
  <Img src={staticFile(`v28/bg/${n}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, filter, ...style }} />
);

/** camera: slow drift/zoom around a focus point, optional shake */
const punchK = (T: number, ps?: number[]) => (ps ?? []).reduce((a, q) => { const x = T - q; return a + (x < 0 ? 0 : x < 0.08 ? x / 0.08 : Math.exp(-(x - 0.08) * 4.5)) * 0.075; }, 0);
const Cam: React.FC<{ t: number; dur: number; z0?: number; z1?: number; fx?: number; fy?: number; dx?: number; dy?: number; shake?: number; T?: number; punch?: number[]; children: React.ReactNode }> =
  ({ t, dur, z0 = 1.02, z1 = 1.08, fx = 0.5, fy = 0.5, dx = 0, dy = 0, shake = 0, T = 0, punch, children }) => {
    const p = easeInOut(clamp(t / Math.max(dur, 0.1)));
    const z = (z0 + (z1 - z0) * p) * (1 + punchK(T, punch));
    const sx = (noise(t * 9) - 0.5) * 2 * shake + Math.sin(t * 71) * shake * 0.6;
    const sy = (noise(t * 8 + 5) - 0.5) * 2 * shake + Math.cos(t * 63) * shake * 0.6;
    const hx = (noise(t * 0.35) - 0.5) * 8, hy = (noise(t * 0.3 + 9) - 0.5) * 6; // hand-held float
    return (
      <AbsoluteFill style={{ transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `translate(${dx * p + sx + hx}px, ${dy * p + sy + hy}px) scale(${z})` }}>
        {children}
      </AbsoluteFill>
    );
  };

type CharP = {
  n: string; x: number; y: number; h: number; t: number; // t = scene-local time
  flip?: boolean; inAt?: number; outAt?: number; from?: "left" | "right" | "pop" | "fade" | "up";
  walk?: boolean; talk?: string; T?: number; shade?: number; shadow?: boolean; z?: number; tilt?: number; clip?: string; hop?: number;
};
/** a keyed stick-figure pose; (x,y) = feet centre on stage */
const Char: React.FC<CharP> = ({ n, x, y, h, t, flip, inAt = -9, outAt = 1e9, from = "pop", walk, talk, T = 0, shade = 1, shadow = true, tilt = 0, clip, hop }) => {
  const m = CH[n];
  if (!m) throw new Error("no char " + n);
  const w = (m.w / m.h) * h;
  const pi = easeOut(prog(t, inAt, inAt + 0.45));
  const po = prog(t, outAt, outAt + 0.3);
  if (t < inAt || po >= 1) return null;
  let ox = 0, oy = 0, sc = 1, op = 1 - po;
  if (from === "left") ox = -(1 - pi) * 700;
  if (from === "right") ox = (1 - pi) * 700;
  if (from === "up") oy = (1 - pi) * 120;
  if (from === "pop") sc = 0.6 + 0.4 * backOut(prog(t, inAt, inAt + 0.4));
  if (from === "fade" || from === "up") op *= pi;
  if (from === "pop") op *= prog(t, inAt, inAt + 0.12);
  const breathe = 1 + Math.sin(t * 2.4 + x) * 0.008;
  const step = walk ? Math.abs(Math.sin(t * 7)) * h * 0.035 : 0;
  const speak = talk && speaking(talk, T);
  const rot = tilt + (speak ? Math.sin(T * 17) * 1.6 : 0) + (walk ? Math.sin(t * 7) * 1.5 : 0) + Math.sin(t * 1.3 + x * 0.01) * 0.9;
  // hop: anticipation squash → jump arc → landing squash
  const hp = hop === undefined ? -1 : (t - hop) / 0.55;
  const jump = hp > 0.15 && hp < 0.85 ? Math.sin(((hp - 0.15) / 0.7) * Math.PI) * h * 0.16 : 0;
  const sq = hp >= 0 && hp <= 0.15 ? 1 - 0.1 * Math.sin((hp / 0.15) * Math.PI) : hp >= 0.85 && hp <= 1.1 ? 1 - 0.08 * Math.sin(((hp - 0.85) / 0.25) * Math.PI) : 1;
  oy -= jump;
  return (
    <>
      {shadow && (
        <div style={{ position: "absolute", left: x + ox - w * 0.36, top: y - h * 0.035, width: w * 0.72, height: h * 0.07, borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.5), rgba(0,0,0,0))", opacity: op * (1 - step / h * 6) * (1 - jump / h * 3) }} />
      )}
      <Img src={staticFile(`v28/chars/${n}.png`)} style={{
        position: "absolute", left: x + ox - w / 2, top: y - h - step + oy, width: w, height: h, opacity: op,
        transformOrigin: "50% 100%", transform: `scale(${(flip ? -1 : 1) * sc * (2 - sq) * (speak ? 1 + Math.sin(T * 23) * 0.006 : 1)}, ${sc * breathe * sq}) rotate(${rot}deg)`,
        filter: shade !== 1 ? `brightness(${shade}) saturate(${0.8 + 0.2 * shade})` : undefined, clipPath: clip,
      }} />
    </>
  );
};

/** small floating label chip (RTL) */
export const Chip: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; size?: number; icon?: React.ReactNode; out?: number }> =
  ({ t, at, x, y, text, color = INK, size = 46, icon, out = 1e9 }) => {
    if (t < at || t > out + 0.3) return null;
    const p = backOut(prog(t, at, at + 0.35)), q = 1 - prog(t, out, out + 0.3);
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * p}) rotate(${(1 - prog(t, at, at + 0.5)) * -6 + Math.sin(t * 1.7 + x) * 0.6}deg) translateY(${Math.sin(t * 1.4 + y) * 4}px)`, opacity: prog(t, at, at + 0.15) * q,
        background: CREAM, color, borderRadius: 18, padding: "14px 30px", fontFamily: FB, fontSize: size, direction: "rtl", whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)", border: `4px solid ${INK}`, display: "flex", alignItems: "center", gap: 18 }}>
        {icon}{text}
      </div>
    );
  };

/** black "روز N" card */
const DayCard: React.FC<{ t: number; text: string }> = ({ t, text }) => {
  if (t > DAY_LEN + 0.25) return null;
  const op = 1 - prog(t, DAY_LEN, DAY_LEN + 0.25);
  const s = 1 + t * 0.04;
  return (
    <AbsoluteFill style={{ background: "#141519", opacity: op, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FN, fontSize: 190, color: "#F2EEE6", direction: "rtl", transform: `scale(${s})`, opacity: prog(t, 0, 0.15) }}>{text}</div>
      <div style={{ position: "absolute", bottom: 300, width: 520 * prog(t, 0.05, 0.6), height: 6, background: RED, borderRadius: 3 }} />
    </AbsoluteFill>
  );
};

/** cream info card frame with gentle zoom */
const Card: React.FC<{ t: number; dur: number; children: React.ReactNode }> = ({ t, dur, children }) => (
  <AbsoluteFill style={{ background: CREAM }}>
    <AbsoluteFill style={{ opacity: 0.35, background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.9), rgba(0,0,0,0) 60%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(80,60,30,0.25))" }} />
    <AbsoluteFill style={{ transform: `scale(${1 + 0.035 * (t / Math.max(dur, 1))})` }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
const Title: React.FC<{ t: number; at?: number; y: number; text: string; size?: number; color?: string }> = ({ t, at = 0, y, text, size = 78, color = INK }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: FB, fontSize: size, color, direction: "rtl",
    opacity: prog(t, at, at + 0.25), transform: `translateY(${(1 - easeOut(prog(t, at, at + 0.4))) * 30}px)` }}>{text}</div>
);
const Sub: React.FC<{ t: number; at?: number; y: number; text: string; size?: number; color?: string }> = ({ t, at = 0, y, text, size = 44, color = "#5a5752" }) => (
  <div style={{ position: "absolute", left: 160, right: 160, top: y, textAlign: "center", fontFamily: FT, fontSize: size, color, direction: "rtl", lineHeight: 1.5,
    opacity: prog(t, at, at + 0.3) }}>{text}</div>
);

// ───── particles ─────
/** gray fallout dust drifting down */
export const Dust: React.FC<{ t: number; n?: number; op?: number; size?: number; speed?: number; area?: [number, number, number, number] }> =
  ({ t, n = 140, op = 0.8, size = 5, speed = 70, area = [0, 0, W, H] }) => {
    const [ax, ay, aw, ah] = area;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {Array.from({ length: n }, (_, i) => {
          const d = 0.4 + hash(i * 3.1) * 0.9; // depth
          const y = ay + (((hash(i) * ah + t * speed * d) % ah) + ah) % ah;
          const x = ax + hash(i * 7.7) * aw + Math.sin(t * 0.8 + i) * 18 * d;
          const s = size * d;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: i % 3 ? "#b9b6ae" : "#8f8c86", opacity: op * (0.4 + 0.6 * d) }} />;
        })}
      </AbsoluteFill>
    );
  };
const Rain: React.FC<{ t: number; op?: number }> = ({ t, op = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 160 }, (_, i) => {
      const d = 0.4 + hash(i * 1.7) * 0.8;
      const y = ((hash(i * 2.3) * (H + 200) + t * 1700 * d) % (H + 200)) - 200;
      const x = hash(i * 5.1) * (W + 200) - 100 - y * 0.12;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 2.4 * d, height: 70 * d, background: "rgba(220,230,245,0.9)", opacity: op * d, transform: "rotate(7deg)" }} />;
    })}
  </AbsoluteFill>
);
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${k}))` }} />
);
const Glow: React.FC<{ x: number; y: number; r: number; color: string; op: number }> = ({ x, y, r, color, op }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", opacity: op, mixBlendMode: "screen",
    background: `radial-gradient(closest-side, ${color}, rgba(0,0,0,0))` }} />
);

/** horizontal speed lines (moving left) */
const SpeedLines: React.FC<{ t: number; op: number; area?: [number, number, number, number] }> = ({ t, op, area = [0, 0, W, H] }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: op }}>
    {Array.from({ length: 26 }, (_, i) => {
      const [ax, ay, aw, ah] = area; const len = 120 + hash(i * 3) * 260;
      const x = ax + aw - (((hash(i) * aw + t * 2600) % (aw + len)));
      return <div key={i} style={{ position: "absolute", left: x, top: ay + hash(i * 5.3) * ah, width: len, height: 3 + hash(i) * 3, borderRadius: 3, background: "rgba(255,255,255,0.75)" }} />;
    })}
  </AbsoluteFill>
);
/** screen cracks spreading from a point */
const Cracks: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  const p = easeOut(prog(t, 0, 0.35));
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + hash(i) * 0.4; const L = (250 + hash(i * 2) * 700) * p;
        const mx = x + Math.cos(a) * L * 0.5 + (hash(i * 4) - 0.5) * 60, my = y + Math.sin(a) * L * 0.5 + (hash(i * 6) - 0.5) * 60;
        return <path key={i} d={`M${x} ${y} L${mx} ${my} L${x + Math.cos(a + 0.1) * L} ${y + Math.sin(a + 0.1) * L}`} stroke="rgba(255,255,255,0.85)" strokeWidth={3} fill="none" />;
      })}
      {[0, 1, 2].map((k) => <circle key={k} cx={x} cy={y} r={(40 + k * 90) * p} stroke="rgba(255,255,255,0.6)" strokeWidth={2} fill="none" />)}
    </svg>
  );
};
/** debris chunks flung by the blast */
const Debris: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 28 }, (_, i) => {
      const vx = -(600 + hash(i) * 1600), vy = -200 + hash(i * 3) * 300;
      const x = 1700 + hash(i * 7) * 400 + vx * t, y = 300 + hash(i * 9) * 600 + vy * t + 900 * t * t;
      const s = 8 + hash(i * 11) * 22;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.6, background: i % 2 ? "#5d554c" : "#8a8279", transform: `rotate(${t * 900 * (hash(i) - 0.5)}deg)`, opacity: clamp(1.4 - t) }} />;
    })}
  </AbsoluteFill>
);
const ShockRing: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  if (t < 0 || t > 2.2) return null;
  const r = 40 + t * 900;
  return <div style={{ position: "absolute", left: x - r, top: y - r * 0.45, width: 2 * r, height: r * 0.9, borderRadius: "50%", border: `${10 * (1 - t / 2.2) + 2}px solid rgba(255,220,170,${0.7 * (1 - t / 2.2)})`, filter: "blur(2px)" }} />;
};
const LightRays: React.FC<{ t: number; x: number; y: number; op: number }> = ({ t, x, y, op }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity: op, mixBlendMode: "screen" }}>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: x - 60, top: y, width: 120 + hash(i) * 120, height: 1500, transformOrigin: "50% 0%",
        transform: `rotate(${-50 + i * 16 + Math.sin(t * 0.4 + i) * 3}deg)`, background: "linear-gradient(rgba(255,245,215,0.45), rgba(255,245,215,0))", filter: "blur(18px)" }} />
    ))}
  </AbsoluteFill>
);
const Birds: React.FC<{ t: number }> = ({ t }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
    {Array.from({ length: 6 }, (_, i) => {
      const x = 500 + i * 70 + t * (90 + i * 8), y = 200 + hash(i) * 120 - t * 10 + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 12 + i * 1.7) * 9;
      return <path key={i} d={`M${x - 16} ${y - f} Q${x - 6} ${y - 4} ${x} ${y} Q${x + 6} ${y - 4} ${x + 16} ${y - f}`} stroke="#3a3f48" strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    })}
  </svg>
);
const Glints: React.FC<{ t: number; area: [number, number, number, number] }> = ({ t, area }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 9 }, (_, i) => {
      const ph = (t * 0.9 + hash(i)) % 1; const a = Math.sin(ph * Math.PI);
      return <div key={i} style={{ position: "absolute", left: area[0] + hash(i * 3.3) * area[2], top: area[1] + hash(i * 5.1) * area[3], width: 36, height: 36, opacity: a * 0.9,
        transform: `translate(-50%,-50%) rotate(45deg) scale(${a})`, background: "radial-gradient(closest-side, #fff, rgba(255,255,255,0))", boxShadow: "0 0 18px #fff" }} />;
    })}
  </AbsoluteFill>
);
const Bob: React.FC<{ t: number; amp?: number; children: React.ReactNode }> = ({ t, amp = 10, children }) => (
  <div style={{ transform: `translateY(${Math.sin(t * 2.2) * amp}px) rotate(${Math.sin(t * 1.6) * 2}deg)` }}>{children}</div>
);

// ───── icons (SVG, ink style) ─────
export const DustPile: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => (
  <svg width={360 * s} height={260 * s} viewBox="0 0 360 260">
    {Array.from({ length: 26 }, (_, i) => {
      const y = ((hash(i) * 200 + t * 60) % 200) - 20; const x = 70 + hash(i * 4.4) * 220;
      return <circle key={i} cx={x} cy={y} r={2.5 + hash(i * 9) * 3} fill="#8c8a85" opacity={0.85} />;
    })}
    <path d="M20 245 Q100 150 180 140 Q260 150 340 245 Z" fill="#a9a59d" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={60 + hash(i * 2.2) * 240} cy={200 + hash(i * 3.3) * 38} r={3} fill="#7b7872" />)}
    <circle cx={180} cy={196} r={30} fill={AMBER} stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((k) => <path key={k} d={`M180 196 L${180 + 24 * Math.cos((k * 120 - 90) * Math.PI / 180 - 0.5)} ${196 + 24 * Math.sin((k * 120 - 90) * Math.PI / 180 - 0.5)} A24 24 0 0 1 ${180 + 24 * Math.cos((k * 120 - 90) * Math.PI / 180 + 0.5)} ${196 + 24 * Math.sin((k * 120 - 90) * Math.PI / 180 + 0.5)} Z`} fill={INK} />)}
    <circle cx={180} cy={196} r={6} fill={AMBER} stroke={INK} strokeWidth={3} />
  </svg>
);
const Clock: React.FC<{ t: number; s?: number }> = ({ t, s = 1 }) => {
  const ring = Math.sin(t * 40) * (t % 2 < 0.5 ? 5 : 0);
  return (
    <svg width={260 * s} height={260 * s} viewBox="0 0 260 260" style={{ transform: `rotate(${ring}deg)` }}>
      <circle cx={70} cy={58} r={30} fill={RED} stroke={INK} strokeWidth={6} />
      <circle cx={190} cy={58} r={30} fill={RED} stroke={INK} strokeWidth={6} />
      <circle cx={130} cy={140} r={92} fill="#fffaf0" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return <line key={i} x1={130 + 72 * Math.sin(a)} y1={140 - 72 * Math.cos(a)} x2={130 + 82 * Math.sin(a)} y2={140 - 82 * Math.cos(a)} stroke={INK} strokeWidth={5} />; })}
      <line x1={130} y1={140} x2={130 + 50 * Math.sin(t * 0.5)} y2={140 - 50 * Math.cos(t * 0.5)} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={130} y1={140} x2={130 + 70 * Math.sin(t * 6)} y2={140 - 70 * Math.cos(t * 6)} stroke={RED} strokeWidth={5} strokeLinecap="round" />
      <circle cx={130} cy={140} r={9} fill={INK} />
    </svg>
  );
};

// ───── scenes ─────
type SceneP = { t: number; T: number; dur: number };
const scenes: { si: number; day?: string; cut?: boolean; C: React.FC<SceneP> }[] = [];
const add = (si: number, C: React.FC<SceneP>, o: { day?: string; cut?: boolean } = {}) => scenes.push({ si, C, ...o });

// 0 · morning, stuck in traffic, looking at the phone
add(0, ({ t, dur }) => (
  <Cam t={t} dur={dur + 8} z0={1.0} z1={1.07} fx={0.5} fy={0.35}>
    <Bg n="01-car" />
    <Glow x={510} y={520} r={140} color="rgba(170,210,255,0.8)" op={0.35 + 0.1 * Math.sin(t * 3)} />
    <Char n="21-hero-back-phone" x={560} y={1120} h={660} t={t} shadow={false} inAt={-1} />
    <Chip t={t} at={0.15} x={1700} y={110} text="۷:۴۰ صبح" size={42} />
  </Cam>
));
// 1 · white flash, no sound → calm highway burnt white
add(1, ({ t, T }) => {
  const flash = prog(T, wd(1, "سفید") - 0.15, wd(1, "سفید") + 0.12);
  const reveal = prog(T, wd(1, "نور") - 0.1, wd(1, "خورشید") + 0.3);
  return (
    <AbsoluteFill>
      {T < wd(1, "نور") ? (
        <Cam t={t + 5} dur={14} z0={1.0} z1={1.07} fx={0.5} fy={0.35} shake={flash * 2}>
          <Bg n="01-car" />
          <Char n="21-hero-back-phone" x={560} y={1120} h={660} t={t} shadow={false} inAt={-1} />
        </Cam>
      ) : (
        <Cam t={t} dur={9} z0={1.12} z1={1.03} fx={0.55} fy={0.3}>
          <Bg n="02-highway" filter={`brightness(${2.2 - 1.15 * reveal}) contrast(${0.6 + 0.4 * reveal}) saturate(${0.3 + 0.6 * reveal})`} />
          <Glow x={1080} y={250} r={700} color="rgba(255,250,235,1)" op={0.9 - 0.55 * reveal} />
        </Cam>
      )}
      <AbsoluteFill style={{ background: "#fffdf6", opacity: flash * (1 - prog(T, wd(1, "نور") - 0.05, wd(1, "نور") + 0.9)) }} />
    </AbsoluteFill>
  );
});
// 2 · the bomb, the city centre
add(2, ({ t, T, dur }) => {
  const x = easeInOut(prog(T, wd(2, "بمب") - 0.2, wd(2, "اتمی") + 0.4));
  return (
    <Cam t={t} dur={dur} z0={1.03} z1={1.16} fx={0.53} fy={0.22} T={T} punch={[wd(2, "بمب"), wd(2, "منفجر")]}>
      <Bg n="02-highway" filter="brightness(1.05) saturate(0.85)" />
      <Bg n="03-highway-cloud" style={{ opacity: x }} />
      <Glow x={1020} y={190} r={420} color="rgba(255,170,80,1)" op={x * (0.35 + 0.15 * Math.sin(t * 2.2))} />
      <ShockRing t={T - wd(2, "بمب")} x={1020} y={230} />
      <Dust t={t} n={40} size={3} speed={-25} op={0.25 * x} area={[600, 0, 900, 500]} />
    </Cam>
  );
});
// 3 · the blast wave a minute later
add(3, ({ t, T, dur }) => {
  const hit = wd(3, "شیشه‌ها") - 0.25;
  const pre = T < hit;
  const k = Math.max(0, 1 - (T - hit) / 2.2);
  const alarm = Math.floor(T * 3) % 2 === 0;
  return pre ? (
    <Cam t={t + 5} dur={dur + 6} z0={1.12} z1={1.2} fx={0.53} fy={0.22}>
      <Bg n="03-highway-cloud" />
      <Glow x={1020} y={190} r={420} color="rgba(255,170,80,1)" op={0.35 + 0.15 * Math.sin(T * 2.2)} />
      <Chip t={T} at={wd(3, "دقیقه")} x={W / 2} y={150} text={`موج انفجار: ${String(Math.max(0, 60 - Math.floor((T - wd(3, "دقیقه")) * 22))).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])} ثانیه`} color={RED} size={46} />
    </Cam>
  ) : (
    <AbsoluteFill>
      <Cam t={T - hit} dur={dur} z0={1.1} z1={1.04} fx={0.5} fy={0.55} shake={26 * k + 2} T={T} punch={[hit, wd(3, "جیغ")]}>
        <Bg n="04-lane" />
        {alarm && <><Glow x={1745} y={650} r={90} color="rgba(255,170,40,1)" op={0.9} /><Glow x={250} y={760} r={90} color="rgba(255,170,40,1)" op={0.7} /></>}
        <Char n="22-hero-crouch" x={930} y={1010} h={470} t={T - hit} inAt={0.05} from="pop" />
        <Dust t={T * 3} n={90} size={4} speed={-900} op={0.6 * k} />
        <Debris t={T - hit} />
      </Cam>
      <Cracks t={T - hit} x={1380} y={380} />
      <AbsoluteFill style={{ background: "#fff2dc", opacity: 0.85 * (1 - prog(T, hit, hit + 0.35)) }} />
    </AbsoluteFill>
  );
});
// 4 · you're alive. the real danger hasn't arrived
add(4, ({ t, dur }) => (
  <Cam t={t} dur={dur} z0={1.0} z1={1.1} fx={0.47} fy={0.6} T={t + START(4)} punch={[wd(4, "خطر")]}>
    <Bg n="04-lane" />
    <Char n="23-hero-shocked" x={900} y={1010} h={560} t={t} inAt={0} from="up" hop={0.5} />
    <Dust t={t} n={30} size={3} speed={12} op={0.3} area={[0, 0, W, 600]} />
  </Cam>
));
// 5 · card: the real danger = fallout dust
add(5, ({ t, T, dur }) => (
  <Card t={t} dur={dur}>
    <div style={{ position: "absolute", left: W / 2 - 230, top: 150, transform: `scale(${0.6 + 0.4 * backOut(prog(t, 0, 0.5))})` }}><Bob t={t}><DustPile t={t} s={1.28} /></Bob></div>
    <Title t={t} at={0.25} y={530} text="خطرِ اصلی: غبار" size={96} />
    <Sub t={t} at={wd(5, "این") - START(5)} y={680} text="خاکی که انفجار برد بالا، رادیواکتیو شده و برمی‌گرده پایین." />
    <Chip t={T} at={wd(5, "هزاران")} x={1500} y={300} text="هزاران تُن خاک" size={40} out={wd(5, "این") - 0.2} />
  </Card>
));
// 6 · card: the clock — at least 10 minutes
add(6, ({ t, T, dur }) => {
  const left = Math.max(0, 600 - Math.floor(t * 1));
  const mm = Math.floor(left / 60), ss = left % 60;
  const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return (
    <Card t={t} dur={dur}>
      <div style={{ position: "absolute", left: W / 2 - 170, top: 130, transform: `scale(${0.6 + 0.4 * backOut(prog(t, 0, 0.5))})` }}><Bob t={t} amp={6}><Clock t={T} s={1.3} /></Bob></div>
      <Title t={t} at={0.2} y={520} text="ساعت داره کار می‌کنه" size={90} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", fontFamily: FN, fontSize: 150, color: RED, opacity: prog(t, 0.4, 0.7), direction: "ltr" }}>
        {fa(mm).padStart(2, "۰")}:{fa(ss).padStart(2, "۰")}
      </div>
      <Sub t={t} at={0.8} y={850} text="حداقل ده دقیقه تا رسیدنِ غبار" size={40} />
    </Card>
  );
});
// 7 · card: what stops it — mass (cross-section)
add(7, ({ t, T, dur }) => {
  const carAt = wd(7, "ماشین") - START(7), massAt = wd(7, "جرمه") - START(7), moreAt = wd(7, "بیشتر") - START(7);
  const gy = 470; // ground
  return (
    <Card t={t} dur={dur}>
      <Title t={t} at={0} y={60} text="چی جلوش رو می‌گیره؟" size={80} />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* earth layers */}
        <rect x={180} y={gy} width={1560} height={470} fill="#b59d7b" opacity={prog(t, 0.2, 0.6)} />
        {[0, 1, 2].map((k) => <rect key={k} x={180} y={gy + 120 + k * 110} width={1560} height={6} fill="#8d7656" opacity={0.6 * prog(t, 0.2, 0.6)} />)}
        <rect x={180} y={gy - 10} width={1560} height={22} fill="#7c7a76" stroke={INK} strokeWidth={5} opacity={prog(t, 0.2, 0.6)} />
        {/* concrete metro tube */}
        <g opacity={prog(t, massAt - 0.4, massAt)}>
          <rect x={1060} y={gy + 280} width={560} height={150} rx={70} fill="#9aa1a8" stroke={INK} strokeWidth={7} />
          <rect x={1100} y={gy + 315} width={480} height={80} rx={40} fill="#3d4148" />
          <text x={1340} y={gy + 368} textAnchor="middle" fontFamily={FB} fontSize={38} fill="#fff" direction="rtl">مترو</text>
        </g>
        {/* car on the road */}
        <g opacity={prog(t, carAt - 0.3, carAt)} transform={`translate(380 ${gy - 120})`}>
          <path d="M20 95 L40 45 Q60 15 120 15 L210 15 Q250 15 270 50 L300 70 Q320 75 320 95 Z" fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M70 50 L95 25 L150 25 L150 55 Z M165 25 L210 25 L240 55 L165 55 Z" fill="#cfe3f2" stroke={INK} strokeWidth={4} />
          <circle cx={80} cy={100} r={24} fill={INK} /><circle cx={260} cy={100} r={24} fill={INK} />
        </g>
        {/* falling dust + rays */}
        {Array.from({ length: 34 }, (_, i) => { const y = ((hash(i) * 330 + t * 90) % 330) + 110; return <circle key={i} cx={240 + hash(i * 3.7) * 1440} cy={Math.min(y, gy - 14)} r={5} fill="#8c8a85" />; })}
        {[0, 1, 2, 3, 4].map((k) => {
          const x = 420 + k * 55, p = prog(t, carAt + 0.2 + k * 0.08, carAt + 0.9 + k * 0.08);
          return <line key={k} x1={x} y1={200} x2={x} y2={200 + (gy + 40 - 200) * p} stroke={RED} strokeWidth={6} strokeDasharray="16 12" opacity={0.85} />;
        })}
        {[0, 1, 2, 3, 4].map((k) => {
          const x = 1180 + k * 80, p = prog(t, massAt + k * 0.07, massAt + 0.8 + k * 0.07);
          return <line key={k} x1={x} y1={200} x2={x} y2={200 + (gy + 110 - 200) * p} stroke={RED} strokeWidth={6} strokeDasharray="16 12" opacity={0.85} />;
        })}
      </svg>
      <Chip t={t} at={carAt + 0.9} x={540} y={gy + 120} text="ماشین: تقریباً هیچی ✗" color={RED} size={42} />
      <Chip t={t} at={massAt + 0.6} x={1340} y={gy + 70} text="بتن و خاک ✓" color={GREEN} size={42} />
      <Chip t={t} at={moreAt - 0.1} x={720} y={gy + 290} text="هرچی جرم بیشتر، بهتر" color={BLUE} size={50} />
    </Card>
  );
});
// 8 · a courier on a motorbike weaves through the cars
add(8, ({ t, T, dur }) => {
  const arr = wd(8, "پیک") - START(8), go = wd(8, "پایینه") - START(8) + 0.35;
  const mx = 1900 - 620 * easeOut(prog(t, arr, arr + 1.6)) - 1700 * Math.pow(prog(t, go, go + 1.0), 2);
  return (
    <Cam t={t} dur={dur} z0={1.04} z1={1.1} fx={0.5} fy={0.6} T={T} punch={[wd(8, "بپر")]}>
      <Bg n="04-lane" />
      <SpeedLines t={t} op={(t > arr && t < arr + 1.5 ? 1 - prog(t, arr + 0.9, arr + 1.5) : 0) + prog(t, go, go + 0.3)} area={[0, 700, W, 330]} />
      <Char n="23-hero-shocked" x={640} y={1010} h={540} t={t} inAt={-1} outAt={go - 0.15} />
      <Char n="30-moto" x={mx} y={1040} h={560} t={t} inAt={arr} from="fade" talk="liam" T={T} walk={t > go || t < arr + 1.6}
        clip={t < go - 0.15 ? "polygon(0% 0%, 61.3% 0%, 61.3% 23.2%, 71.5% 23.2%, 71.5% 51.4%, 100% 51.4%, 100% 100%, 0% 100%)" : undefined} />
      {(t < arr + 1.6 || t > go) && <Dust t={t * 4} n={30} size={6} speed={-60} op={0.35} area={[mx + 100, 900, 600, 160]} />}
    </Cam>
  );
});
// 9 · the metro entrance → down the stairs, deeper, until no daylight
add(9, ({ t, T, dur }) => {
  const down = wd(9, "نه") - START(9) - 0.1;
  if (t < down) {
    const r = easeInOut(prog(t, 0.1, down - 0.3));
    return (
      <Cam t={t} dur={down} z0={1.0} z1={1.12} fx={0.8} fy={0.55} dx={-60}>
        <Bg n="05-entrance" filter="sepia(0.35) hue-rotate(-12deg) saturate(1.1) brightness(0.92)" />
        <AbsoluteFill style={{ background: "linear-gradient(rgba(190,90,40,0.35), rgba(0,0,0,0) 45%)" }} />
        <Char n="24-hero-run" flip x={300 + 1280 * r} y={1060 - 380 * r} h={470 - 260 * r} t={t} inAt={0} from="left" walk outAt={down - 0.45} />
        <Char n="34-courier-walk" flip x={60 + 1300 * easeInOut(prog(t, 0.5, down - 0.1))} y={1080 - 400 * easeInOut(prog(t, 0.5, down - 0.1))} h={480 - 270 * easeInOut(prog(t, 0.5, down - 0.1))} t={t} inAt={0.4} from="left" walk outAt={down - 0.25} />
        <Dust t={t} n={50} size={3} speed={20} op={0.25} area={[0, 0, W, 500]} />
        <SpeedLines t={-t} op={0.35 * (1 - prog(t, down - 0.8, down - 0.3))} area={[0, 650, 1300, 400]} />
      </Cam>
    );
  }
  const u = t - down;
  const dark = prog(T, wd(9, "نور") - 0.5, E(9));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam t={u} dur={dur - down} z0={1.0} z1={1.55} fx={0.5} fy={0.42}>
        <Bg n="06-stairs" filter={`brightness(${1 - 0.6 * dark})`} />
      </Cam>
      <Vignette k={0.4 + 0.5 * dark} />
    </AbsoluteFill>
  );
});
// 10 · the platform — an old pharmacist: "30 metres of earth above us"
add(10, ({ t, T, dur }) => (
  <Cam t={t} dur={dur} z0={1.02} z1={1.09} fx={0.55} fy={0.6} T={T} punch={[wd(10, "سی")]}>
    <Bg n="07-platform" />
    <Char n="35-pharm-bag" x={1280} y={990} h={520} t={t} inAt={0.3} from="fade" talk="bill" T={T} shade={0.93} />
    <Char n="27-hero-explain" x={700} y={1000} h={540} t={t} inAt={wd(10, "آفرین") - START(10) - 0.9} from="left" walk={t < wd(10, "آفرین") - START(10) - 0.4} shade={0.93} />
    <Chip t={T} at={wd(10, "سی")} x={980} y={150} text="۳۰ متر خاک بالای سر" size={44} icon={<span style={{ fontSize: 44 }}>⬆</span>} />
  </Cam>
));
// 11 · up on the street, the dust starts falling
add(11, ({ t, dur }) => (
  <AbsoluteFill>
    <Cam t={t} dur={dur} z0={1.12} z1={1.02} fx={0.5} fy={0.5} dx={-40} T={t + START(11)} punch={[wd(11, "غبار")]}>
      <Bg n="10-dust-street" />
      <LightRays t={t} x={1150} y={-80} op={0.5} />
      <Dust t={t} n={220} size={5} speed={55} op={0.85} />
    </Cam>
    <Chip t={t} at={0.4} x={1640} y={110} text="۱۵ دقیقه بعد" size={40} />
  </AbsoluteFill>
));
// 12 · card: the 7 / 10 rule
add(12, ({ t, T, dur }) => {
  const cols = [
    { at: wd(12, "هر") - START(12), lab: "۱ ساعت", val: "۱۰۰٪", h: 470 },
    { at: wd(12, "هفت", 2) - START(12), lab: "۷ ساعت", val: "۱۰٪", h: 300 },
    { at: wd(12, "دو", 1) - START(12), lab: "۲ روز", val: "۱٪", h: 150 },
    { at: wd(12, "دو", 2) - START(12), lab: "۲ هفته", val: "۰٫۱٪", h: 40 },
  ];
  const ruleAt = wd(12, "زمان") - START(12);
  return (
    <Card t={t} dur={dur}>
      <Title t={t} at={0} y={50} text="نقطه‌ضعفِ غبار: زمان" size={76} />
      <Chip t={t} at={ruleAt} x={W / 2} y={205} text="زمان ×۷   ←   تشعشع ÷۱۰" color={RED} size={46} />
      {cols.map((c, i) => {
        const x = 1500 - i * 370; // RTL: first column on the right
        const p = easeOut(prog(t, c.at, c.at + 0.6));
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 110, top: 820 - c.h * p, width: 220, height: c.h * p, background: i === 0 ? RED : i === 1 ? AMBER : i === 2 ? "#7fa7d6" : BLUE,
              border: `6px solid ${INK}`, borderRadius: "14px 14px 0 0", opacity: prog(t, c.at, c.at + 0.1) }} />
            <div style={{ position: "absolute", left: x - 150, width: 300, top: 820 - c.h * p - 90, textAlign: "center", fontFamily: FN, fontSize: 70, color: INK, opacity: prog(t, c.at + 0.3, c.at + 0.6) }}>{c.val}</div>
            <div style={{ position: "absolute", left: x - 150, width: 300, top: 840, textAlign: "center", fontFamily: FB, fontSize: 46, color: INK, direction: "rtl", opacity: prog(t, c.at, c.at + 0.3) }}>{c.lab}</div>
            {i > 0 && <div style={{ position: "absolute", left: x + 115, width: 140, top: 590, textAlign: "center", fontFamily: FB, fontSize: 40, color: RED, opacity: prog(t, c.at + 0.2, c.at + 0.5) }}>÷۱۰ ←</div>}
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 230, right: 230, top: 820, height: 8, background: INK, borderRadius: 4 }} />
    </Card>
  );
});
// 13 · stay under concrete, let time do the work
add(13, ({ t, dur }) => {
  const hrs = 1 + Math.floor(prog(t, 0.5, dur - 0.5) * 6.99);
  const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.06} z1={1.14} fx={0.6} fy={0.6}>
        <Bg n="08-platform-end" />
        <Glow x={1222} y={490} r={170} color="rgba(255,190,90,1)" op={0.45 + 0.12 * noise(t * 6)} />
        <AbsoluteFill style={{ background: "#000", opacity: noise(t * 3) > 0.82 ? 0.25 : 0 }} />
        <Char n="25-hero-sit-knees" x={1010} y={860} h={400} t={t} inAt={0} from="fade" shade={0.9} />
        <Char n="38-pharm-radio" x={1500} y={930} h={430} t={t} inAt={0} from="fade" shade={0.9} />
      </Cam>
      <div style={{ position: "absolute", left: 70, top: 60, opacity: prog(t, 0.3, 0.6) }}><Clock t={t * 8} s={0.6} /></div>
      <Chip t={t} at={0.3} x={420} y={140} text={`ساعتِ ${fa(hrs)}`} size={46} />
    </AbsoluteFill>
  );
});
// 14 · the courier goes up for his bike… and comes back grey
add(14, ({ t, T, dur }) => {
  const up = wd(14, "می‌ره") - START(14), back = wd(14, "بیست") - START(14);
  const w = easeInOut(prog(t, up - 0.6, up + 1.6));
  const c = easeOut(prog(t, back + 0.3, back + 2.4));
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.02} z1={1.07} fx={0.47} fy={0.55} T={T} punch={[wd(14, "خاکستری")]}>
        <Bg n="08-platform-end" />
        <Glow x={1222} y={490} r={170} color="rgba(255,190,90,1)" op={0.45 + 0.12 * noise(t * 6)} />
        <Char n="34-courier-walk" x={1400 - 520 * w} y={1000 - 430 * w} h={500 - 300 * w} t={t} inAt={-1} walk={w > 0 && w < 1} outAt={up + 1.4} shade={0.92} />
        <Char n="31-courier-dusty" x={880 + 200 * c} y={575 + 420 * c} h={200 + 300 * c} t={t} inAt={back + 0.2} from="fade" walk={c > 0 && c < 1} shade={0.92} />
        {t > back + 0.2 && <Dust t={t} n={26} size={4} speed={60} op={0.7} area={[880 + 200 * c - 120 - 150 * c, 575 + 420 * c - (200 + 300 * c), 240 + 300 * c, 200 + 300 * c]} />}
      </Cam>
      <Chip t={t} at={back} x={1660} y={110} text="۲۰ دقیقه بعد" size={40} />
    </AbsoluteFill>
  );
});
// 15 · "radiation sickness isn't contagious — the dust is the danger"
add(15, ({ t, T, dur }) => (
  <AbsoluteFill>
    <Cam t={t} dur={dur} z0={1.03} z1={1.09} fx={0.5} fy={0.62} T={T} punch={[wd(15, "واگیر")]}>
      <Bg n="07-platform" />
      <Char n="31-courier-dusty" x={720} y={1000} h={520} t={t} inAt={-1} shade={0.93} />
      <Dust t={t} n={18} size={4} speed={50} op={0.7} area={[600, 520, 240, 460]} />
      <Char n="36-pharm-finger" x={1300} y={1000} h={540} t={t} inAt={0} from="right" walk={t < 0.45} talk="bill" T={T} shade={0.93} />
    </Cam>
    <Chip t={T} at={wd(15, "واگیر")} x={W / 2} y={120} text="بیماریِ تشعشع واگیر نداره" color={GREEN} size={48} out={wd(15, "خطر") - 0.15} />
    <Chip t={T} at={wd(15, "خطر")} x={W / 2} y={120} text="خطر = غبارِ روی لباس" color={RED} size={48} />
  </AbsoluteFill>
));
// 16 · decontamination: outer clothes off (−90%), then gentle soap & water, no conditioner
add(16, ({ t, T, dur }) => {
  const wash = wd(16, "بعد") - START(16) - 0.3;
  if (t < wash) {
    return (
      <AbsoluteFill>
        <Cam t={t} dur={wash} z0={1.04} z1={1.1} fx={0.45} fy={0.6} T={T} punch={[wd(16, "نود")]}>
          <Bg n="07-platform" />
          <Char n="32-courier-jacket" x={820} y={1000} h={560} t={t} inAt={0} from="fade" shade={0.93} />
          <Dust t={t} n={30} size={4} speed={140} op={0.8} area={[620, 560, 420, 440]} />
          <Char n="36-pharm-finger" x={1420} y={1000} h={500} t={t} inAt={-1} shade={0.9} />
        </Cam>
        <div style={{ position: "absolute", left: 1500, top: 160, transform: `translate(-50%,-50%) scale(${backOut(prog(T, wd(16, "نود") - 0.1, wd(16, "نود") + 0.3))})`, opacity: prog(T, wd(16, "نود") - 0.1, wd(16, "نود")),
          fontFamily: FN, fontSize: 150, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.6)", direction: "ltr" }}>−۹۰٪</div>
        <Chip t={T} at={wd(16, "کیسه")} x={560} y={130} text="لباسِ رویی ← کیسه، دور از بقیه" size={42} />
      </AbsoluteFill>
    );
  }
  const u = t - wash;
  const row = (y: number, at: number, icon: string, text: string, ok: boolean) => (
    <div style={{ position: "absolute", left: 360, right: 360, top: y, display: "flex", alignItems: "center", gap: 40, direction: "rtl", opacity: prog(u, at, at + 0.3),
      transform: `translateX(${(1 - easeOut(prog(u, at, at + 0.4))) * -60}px)` }}>
      <div style={{ width: 150, height: 150, borderRadius: 30, background: "#fff", border: `6px solid ${INK}`, fontSize: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ flex: 1, fontFamily: FB, fontSize: 64, color: INK }}>{text}</div>
      <div style={{ fontFamily: FB, fontSize: 100, color: ok ? GREEN : RED }}>{ok ? "✓" : "✗"}</div>
    </div>
  );
  return (
    <Card t={u} dur={dur - wash}>
      <Title t={u} at={0} y={70} text="تمیز شدن" size={84} />
      {row(250, 0.1, "🧥", "لباسِ رویی، توی کیسه", true)}
      {row(470, wd(16, "صابون") - START(16) - wash - 0.2, "🧼", "آب و صابون، آروم", true)}
      {row(690, wd(16, "نرم‌کننده", 1) - START(16) - wash - 0.1, "🧴", "نرم‌کننده", false)}
      <Sub t={u} at={wd(16, "نرم‌کننده", 2) - START(16) - wash} y={860} text="نرم‌کننده غبار رو به مو می‌چسبونه" size={40} color={RED} />
    </Card>
  );
});
// 17 · hours later he's sick; the later it starts, the smaller the dose
add(17, ({ t, T, dur }) => (
  <AbsoluteFill>
    <Cam t={t} dur={dur} z0={1.05} z1={1.12} fx={0.55} fy={0.62}>
      <Bg n="08-platform-end" filter="brightness(0.9)" />
      <Glow x={1222} y={490} r={170} color="rgba(255,190,90,1)" op={0.45 + 0.12 * noise(t * 6)} />
      <Char n="33-courier-sick" x={880} y={940} h={400} t={t} inAt={0} from="fade" shade={0.9} tilt={Math.sin(t * 1.3) * 2 + Math.sin(t * 31) * 0.8} />
      <Char n="36-pharm-finger" x={1440} y={990} h={520} t={t} inAt={wd(17, "داروساز") - START(17) - 0.3} from="right" talk="bill" T={T} shade={0.9} />
    </Cam>
    <Chip t={t} at={0.3} x={1660} y={110} text="۴ ساعت بعد" size={40} />
    <Chip t={T} at={wd(17, "دیرتر")} x={560} y={130} text="دیرتر = تشعشعِ کمتر" color={GREEN} size={46} />
  </AbsoluteFill>
));
// 18 · water: sealed is safe
add(18, ({ t, T, dur }) => (
  <AbsoluteFill>
    <Cam t={t} dur={dur} z0={1.02} z1={1.1} fx={0.5} fy={0.5}>
      <Bg n="09-kiosk" />
      <Glow x={960} y={330} r={420} color="rgba(255,200,120,1)" op={0.18} />
      <Glints t={t} area={[520, 230, 900, 220]} />
      <Char n="26-hero-water-snack" x={960} y={1040} h={560} t={t} inAt={wd(18, "کیوسک") - START(18)} from="pop" shade={0.95} hop={wd(18, "سالم") - START(18) - 0.2} />
    </Cam>
    <Chip t={T} at={wd(18, "دربسته")} x={480} y={170} text="دربسته = سالم ✓" color={GREEN} size={52} />
    <Chip t={T} at={wd(18, "هرچی")} x={1440} y={170} text="هرچی باز بوده ✗" color={RED} size={52} />
  </AbsoluteFill>
));
// 19 · day 3: iodine tablets — thyroid only, only when told
add(19, ({ t, T, dur }) => {
  const u = t - DAY_LEN;
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.03} z1={1.1} fx={0.5} fy={0.6} T={T} punch={[wd(19, "تیروئید"), wd(19, "مسئولین")]}>
        <Bg n="07-platform" />
        <Char n="37-pharm-pills" x={1200} y={1000} h={540} t={u} inAt={0} from="fade" talk="bill" T={T} shade={0.93} />
        <Char n="27-hero-explain" x={620} y={1000} h={520} t={u} inAt={0.2} from="fade" shade={0.93} />
        <Char n="34-courier-walk" flip x={300} y={1010} h={480} t={u} inAt={0.3} from="fade" shade={0.9} />
      </Cam>
      <Chip t={T} at={wd(19, "تیروئید")} x={W / 2} y={110} text="قرصِ یُد: فقط برای تیروئید" size={46} />
      <Chip t={T} at={wd(19, "مسئولین")} x={W / 2} y={215} text="فقط با دستورِ مسئولین" color={RED} size={46} />
      <DayCard t={t} text="روزِ ۳" />
    </AbsoluteFill>
  );
});
// 20 · day 5: rain washes the dust down the stairs → move everything to the far end
add(20, ({ t, T, dur }) => {
  const mv = wd(20, "همه‌چیز") - START(20) - 0.2;
  return (
    <AbsoluteFill>
      {t < mv ? (
        <Cam t={t} dur={mv} z0={1.0} z1={1.1} fx={0.5} fy={0.45}>
          <Bg n="11-rain-stairs" />
          <Rain t={t} op={0.35} />
          <Dust t={t} n={60} size={4} speed={160} op={0.5} area={[560, 120, 800, 420]} />
        </Cam>
      ) : (
        <Cam t={t - mv} dur={dur - mv} z0={1.04} z1={1.1} fx={0.6} fy={0.6}>
          <Bg n="08-platform-end" />
          <Glow x={1222} y={490} r={170} color="rgba(255,190,90,1)" op={0.45 + 0.12 * noise(t * 6)} />
          <Char n="26-hero-water-snack" x={500 + 700 * easeInOut(prog(t - mv, 0, 2.6))} y={1010} h={500} t={t - mv} inAt={0} from="fade" walk={t - mv < 2.6} shade={0.9} />
          <Char n="34-courier-walk" flip x={160 + 760 * easeInOut(prog(t - mv, 0.3, 3))} y={1030} h={500} t={t - mv} inAt={0.2} from="fade" walk={t - mv < 3} shade={0.9} />
        </Cam>
      )}
      <DayCard t={t} text="روزِ ۵" />
    </AbsoluteFill>
  );
});
// 21 · day 12: the radio — evacuation buses from the end of the line
add(21, ({ t, T, dur }) => {
  const u = t - DAY_LEN;
  const msg = wd(21, "اتوبوس‌های");
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.05} z1={1.12} fx={0.5} fy={0.6}>
        <Bg n="07-platform" />
        <Char n="38-pharm-radio" x={960} y={1010} h={520} t={u} inAt={0} from="fade" shade={0.95} />
        {[0, 1, 2].map((k) => { const r = ((T * 0.9 + k / 3) % 1); return T > msg - 0.3 && (
          <div key={k} style={{ position: "absolute", left: 1050 - 60 - r * 120, top: 600 - 60 - r * 120, width: 120 + r * 240, height: 120 + r * 240, borderRadius: "50%", border: `5px solid ${AMBER}`, opacity: (1 - r) * 0.8 }} />); })}
        <Char n="27-hero-explain" x={480} y={1010} h={500} t={u} inAt={0.2} from="fade" shade={0.93} />
        <Char n="34-courier-walk" x={1480} y={1010} h={500} t={u} inAt={0.3} from="fade" shade={0.93} />
      </Cam>
      {T > msg - 0.2 && (
        <div style={{ position: "absolute", left: W / 2, top: 140, transform: `translate(-50%,-50%) scale(${0.8 + 0.2 * backOut(prog(T, msg - 0.2, msg + 0.2))})`, opacity: prog(T, msg - 0.2, msg),
          background: "#1c1d21", color: "#ffd27a", fontFamily: FB, fontSize: 46, padding: "18px 40px", borderRadius: 16, direction: "rtl", border: `4px solid ${AMBER}`, whiteSpace: "nowrap" }}>
          📻 «اتوبوس‌های تخلیه، از ایستگاهِ آخرِ خط»
        </div>
      )}
      <DayCard t={t} text="روزِ ۱۲" />
    </AbsoluteFill>
  );
});
// 22 · walking the tunnel, under the earth, to the end of the line
add(22, ({ t, T, dur }) => {
  const p = prog(t, 0, dur);
  const lead = 1500 - 900 * p;
  const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.0} z1={1.18} fx={0.6} fy={0.45}>
        <Bg n="12-tunnel" filter="brightness(0.95)" />
        <Glow x={lead - 260 + Math.sin(t * 1.8) * 70} y={800 + Math.sin(t * 2.6) * 25} r={330} color="rgba(255,240,200,1)" op={0.55} />
        <Char n="28-hero-flashlight" x={lead} y={1010} h={500} t={t} inAt={0} from="fade" walk shade={0.75} />
        <Char n="34-courier-walk" x={lead + 330} y={1020} h={490} t={t} inAt={0.2} from="fade" walk shade={0.65} />
        <Char n="39-pharm-walk" x={lead + 650} y={1030} h={500} t={t} inAt={0.4} from="fade" walk shade={0.6} />
      </Cam>
      {/* route map */}
      <div style={{ position: "absolute", left: 560, top: 60, width: 800, height: 120, opacity: prog(T, wd(22, "هشت") - 0.3, wd(22, "هشت")) }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 56, height: 10, background: "#d9d4c8", borderRadius: 5 }} />
        <div style={{ position: "absolute", right: 40, top: 56, height: 10, width: 720 * p, background: AMBER, borderRadius: 5 }} />
        <div style={{ position: "absolute", right: 22, top: 40, width: 40, height: 40, borderRadius: "50%", background: CREAM, border: `6px solid ${INK}` }} />
        <div style={{ position: "absolute", left: 22, top: 40, width: 40, height: 40, borderRadius: "50%", background: GREEN, border: `6px solid ${INK}` }} />
        <div style={{ position: "absolute", right: 40 + 720 * p - 16, top: 45, width: 32, height: 32, borderRadius: "50%", background: RED }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: -6, textAlign: "center", fontFamily: FB, fontSize: 38, color: "#f2eee6", direction: "rtl" }}>{`${fa(Math.round(8 * (1 - p) * 10) / 10).replace(".", "٫")} کیلومتر تا ایستگاهِ آخر`}</div>
      </div>
    </AbsoluteFill>
  );
});
// 23 · day 14: up the stairs, the sky again
add(23, ({ t, T, dur }) => {
  const u = t - DAY_LEN;
  const c = easeInOut(prog(u, 0.6, dur - DAY_LEN - 0.2));
  return (
    <AbsoluteFill>
      <Cam t={t} dur={dur} z0={1.0} z1={1.12} fx={0.5} fy={0.32}>
        <Bg n="13-exit" filter={`brightness(${0.8 + 0.3 * c})`} />
        <Glow x={960} y={260} r={700} color="rgba(255,248,225,1)" op={0.15 + 0.4 * c} />
        <LightRays t={t} x={960} y={150} op={0.25 + 0.5 * c} />
        <Birds t={u} />
        <Char n="29-hero-back-hope" x={960} y={1130 - 470 * c} h={560 - 380 * c} t={u} inAt={0} from="fade" walk={c > 0.02 && c < 0.98} />
      </Cam>
      <Chip t={T} at={wd(23, "هزارم")} x={1580} y={120} text="تشعشع: ۰٫۱٪" color={GREEN} size={46} />
      <DayCard t={t} text="روزِ ۱۴" />
    </AbsoluteFill>
  );
});
// 24 · summary
add(24, ({ t, T, dur }) => {
  const items = [
    { at: wd(24, "داخل"), icon: "🚪", text: "برو داخل" },
    { at: wd(24, "پایین"), icon: "⬇", text: "برو پایین" },
    { at: wd(24, "بمون"), icon: "⏸", text: "بمون" },
    { at: wd(24, "زمان"), icon: "⏳", text: "بذار زمان کار کنه" },
  ];
  return (
    <Card t={t} dur={dur}>
      <Title t={t} at={0} y={110} text="۱۴ روز زیرِ شهر" size={110} />
      {items.map((it, i) => {
        const x = 1530 - i * 380;
        const p = backOut(prog(T, it.at - 0.1, it.at + 0.3));
        return (
          <div key={i} style={{ position: "absolute", left: x - 170, top: 420, width: 340, textAlign: "center", opacity: prog(T, it.at - 0.1, it.at + 0.05), transform: `scale(${0.6 + 0.4 * p})` }}>
            <div style={{ transform: `translateY(${Math.sin(T * 3 + i) * 8 * prog(T, it.at + 0.3, it.at + 0.6)}px)`, width: 210, height: 210, margin: "0 auto", borderRadius: 44, background: "#fff", border: `7px solid ${INK}`, fontSize: 120, display: "flex", alignItems: "center", justifyContent: "center", color: INK }}>{it.icon}</div>
            <div style={{ marginTop: 30, fontFamily: FB, fontSize: 52, color: i === 3 ? RED : INK, direction: "rtl" }}>{it.text}</div>
          </div>
        );
      })}
    </Card>
  );
});

// ───── transitions ─────
type Tr = "fade" | "cut" | "whip" | "zoom" | "slideUp" | "slideDown" | "push" | "glitch";
const TR: Record<number, Tr> = { 1: "cut", 2: "fade", 3: "cut", 4: "whip", 5: "slideUp", 6: "push", 7: "push", 8: "zoom", 9: "whip", 10: "zoom", 11: "slideDown", 12: "slideUp",
  13: "zoom", 14: "whip", 15: "whip", 16: "push", 17: "glitch", 18: "whip", 19: "cut", 20: "cut", 21: "cut", 22: "zoom", 23: "cut", 24: "slideUp" };
const TLEN: Record<Tr, number> = { fade: 0.28, cut: 0, whip: 0.32, zoom: 0.38, slideUp: 0.42, slideDown: 0.42, push: 0.4, glitch: 0.3 };
const inStyle = (ty: Tr, p: number): React.CSSProperties => {
  const e = easeInOut(p);
  switch (ty) {
    case "fade": return { opacity: p };
    case "whip": return { transform: `translateX(${(1 - e) * W}px)`, filter: p < 1 ? `blur(${(1 - e) * 22}px)` : undefined };
    case "zoom": return { transform: `scale(${1.5 - 0.5 * easeOut(p)})`, opacity: easeOut(p) };
    case "slideUp": return { transform: `translateY(${(1 - easeOut(p)) * H}px)` };
    case "slideDown": return { transform: `translateY(${-(1 - easeOut(p)) * H}px)` };
    case "push": return { transform: `translateX(${-(1 - e) * W}px)` };
    case "glitch": { const k = 1 - p; return { opacity: p < 0.5 ? (Math.floor(p * 20) % 2 ? 1 : 0.2) : 1, transform: `translateX(${Math.sin(p * 90) * 40 * k}px)`, filter: k > 0 ? `hue-rotate(${k * 90}deg) saturate(${1 + k * 2})` : undefined }; }
    default: return {};
  }
};
const outStyle = (ty: Tr, p: number): React.CSSProperties => {
  const e = easeInOut(p);
  switch (ty) {
    case "whip": return { transform: `translateX(${-e * W}px)`, filter: `blur(${e * 22}px)` };
    case "zoom": return { transform: `scale(${1 + 0.6 * easeOut(p)})`, opacity: 1 - p };
    case "slideUp": return { transform: `translateY(${-e * H * 0.3}px)`, filter: `brightness(${1 - 0.5 * e})` };
    case "slideDown": return { transform: `translateY(${e * H * 0.3}px)`, filter: `brightness(${1 - 0.5 * e})` };
    case "push": return { transform: `translateX(${e * W}px)` };
    default: return {};
  }
};

// ───── captions (word by word, current word highlighted) ─────
type Chunk = { ws: Word[]; a: number; b: number; v: string };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: Word[] = [];
  const push = () => { if (cur.length) out.push({ ws: cur, a: cur[0].s - 0.08, b: cur.at(-1)!.e + 0.35, v: cur[0].v }); cur = []; };
  words.forEach((w, i) => {
    if (w.wi === 0 && cur.length) push();
    cur.push(w);
    const nx = words[i + 1];
    if (/[،.؟!:؛]$/.test(w.w) && cur.length >= 2) push();
    else if (cur.length >= 5 && !(nx && nx.wi === 0)) push();
  });
  push();
  for (let i = 0; i + 1 < out.length; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
})();
const WHO: Record<string, [string, string]> = { liam: ["پیک", "#7fb6ff"], bill: ["داروساز", "#9fe0a8"], george: ["رادیو", AMBER] };
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const c = CHUNKS.find((x) => T >= x.a && T < x.b);
  if (!c) return null;
  const p = prog(T, c.a, c.a + 0.18);
  const who = WHO[c.v];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", gap: 16, direction: "rtl", alignItems: "baseline", background: "rgba(12,12,16,0.66)", borderRadius: 22, padding: "12px 34px 18px",
        transform: `translateY(${(1 - easeOut(p)) * 18}px) scale(${0.94 + 0.06 * easeOut(p)})`, opacity: p, boxShadow: "0 8px 26px rgba(0,0,0,0.35)" }}>
        {who && <span style={{ fontFamily: FB, fontSize: 40, color: who[1] }}>{who[0]}:</span>}
        {c.ws.map((w, i) => {
          const on = T >= w.s - 0.03 && T < (c.ws[i + 1]?.s ?? c.b);
          const past = T >= w.s - 0.03;
          return <span key={i} style={{ fontFamily: FB, fontSize: 54, color: on ? "#FFC24A" : "#fff", opacity: past ? 1 : 0.5,
            display: "inline-block", transform: `scale(${on ? 1.08 : 1}) translateY(${on ? -3 : 0}px)`, textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

// ───── assembly ─────
/** all scenes (with transitions) at video time T, on the 1920×1080 stage — also used by the vertical teaser */
export const SceneStack: React.FC<{ T: number }> = ({ T }) => {
  const list = scenes.map((s, i) => ({ ...s, a: START(s.si), b: i + 1 < scenes.length ? START(scenes[i + 1].si) : TOTAL }));
  return (
    <>
      {list.map((s, i) => {
        const tyIn: Tr = i === 0 ? "cut" : TR[s.si] ?? "fade";
        const nxt = list[i + 1];
        const tyOut: Tr = nxt ? TR[nxt.si] ?? "fade" : "cut";
        const outLen = TLEN[tyOut] || 0;
        if (T < s.a || T > s.b + Math.max(outLen, 0.02)) return null;
        let st: React.CSSProperties = {};
        if (TLEN[tyIn] > 0 && T < s.a + TLEN[tyIn]) st = inStyle(tyIn, prog(T, s.a, s.a + TLEN[tyIn]));
        else if (T >= s.b) st = tyOut === "fade" || tyOut === "glitch" ? {} : outStyle(tyOut, prog(T, s.b, s.b + outLen));
        const C = s.C;
        return (
          <AbsoluteFill key={i} style={st}>
            <C t={T - s.a} T={T} dur={s.b - s.a} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};
const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const T = f / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SceneStack T={T} />
      <Vignette k={0.32} />
      <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.06, backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`, backgroundSize: "3px 3px", transform: `translate(${(f * 37) % 3}px, ${(f * 53) % 3}px)` }} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(T, TOTAL - 0.9, TOTAL - 0.1) }} />
      <Captions T={T} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

// look frames: one or two per scene
const LOOK = [2, 7, 11, 16, 23.5, 25, 30, 36, 41, 48, 50.5, 54, 58, 60.5, 65, 72, 79, 89, 96, 101, 107, 111, 116, 126, 132, 138, 143, 152, 155, 158, 164, 171, 177, 185, 190, 196, 204, 207, 215];
const Look: React.FC<{ times: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const T = times[Math.min(f, times.length - 1)];
  const list = scenes.map((s, i) => ({ ...s, a: START(s.si), b: i + 1 < scenes.length ? START(scenes[i + 1].si) : TOTAL }));
  const s = list.filter((x) => T >= x.a).at(-1)!;
  const C = s.C;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <C t={T - s.a} T={T} dur={s.b - s.a} />
      <Vignette k={0.32} />
      <Captions T={T} />
    </AbsoluteFill>
  );
};

export const V28: React.FC = () => (
  <>
    <Composition id="V28" component={Video} durationInFrames={V28_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v28/mix-norm.wav" }} />
    <Composition id="V28-Silent" component={Video} durationInFrames={V28_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V28-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
