// V27 · «چرا بیشتر اسپرم‌ها به تخمک نمی‌رسن» — reference: a 3D explainer reel (flight through the body, glass pods
// with a pilot). Built as a three.js world (world.ts) directed per frame (direct.ts); captions, the survivors counter,
// the «افسانه» stamp and the slime splat are 2D on top. Every time comes from vo.json (Farid, edge-tts).
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import voJson from "./vo.json";
import { buildWorld } from "./world";
import { direct, Times } from "./direct";

type Word = { w: string; s: number; e: number; line: number };
type Seg = { n: number; start: number; end: number };
const VO = voJson as { total: number; segs: Seg[]; words: Word[] };
const FPS = 30, W = 1080, H = 1920;

const fontHandle = typeof document !== "undefined" ? delayRender("v27 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V27Black", "fonts/Vazirmatn-Black.ttf"], ["V27Bold", "fonts/Vazirmatn-Bold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const bare = (x: string) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && x.w.includes(word));
  if (!w) throw new Error(`v27: no word ${word} in line ${line}`);
  return w.s;
};
const seg = (n: number) => VO.segs.find((s) => s.n === n)!;
const cut = (x: number) => x - 0.06;

// shot and event times
const T: Times = {
  shot: wd(1, "شلیک"),
  l2: seg(2).start,
  l3: seg(3).start,
  C: cut(wd(3, "سریع‌ترین")),
  egg: wd(3, "تخمک"),
  D: cut(wd(3, "و")),
  div1: wd(3, "زندگی"),
  div2: wd(3, "تازه"),
  div3: wd(3, "شروع"),
  E: cut(seg(4).start),
  myth: wd(4, "افسانه‌ست"),
  F: cut(seg(5).start),
  acid: wd(5, "محیط"),
  atk: wd(5, "حمله"),
  F2: cut(wd(5, "و")),
  mil: wd(5, "میلیون‌ها"),
  die: wd(5, "می‌میرن"),
  G: cut(seg(6).start),
  fluid: wd(6, "همراهشونه"),
  neut: wd(6, "خنثی"),
  chance: wd(6, "فرصت"),
  H: cut(seg(7).start),
  mucus: wd(7, "مخاط"),
  sticky: wd(7, "چسبناک"),
  pass: wd(7, "رد"),
  I: cut(seg(8).start),
  imm: wd(8, "ایمنی"),
  cell: wd(8, "سلول"),
  kill: wd(8, "نابود"),
  J: cut(seg(9).start),
  few: wd(9, "فقط"),
  hundreds: wd(9, "صدتا"),
  eggJ: wd(9, "تخمک"),
  K: cut(seg(10).start),
  one: wd(10, "یکی‌شون"),
  enter: wd(10, "واردش"),
};
const TOTAL = VO.total + 1.4;
T.end = TOTAL;
export const V27_FRAMES = Math.round(TOTAL * FPS);

/* ───────── 3D */
const World3D: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const E = useMemo(() => {
    gl.toneMapping = THREE.NoToneMapping;
    return buildWorld(scene);
  }, [gl, scene]);
  useLayoutEffect(() => {
    direct(T, t, E, camera as THREE.PerspectiveCamera);
  }, [t, E, camera]);
  useFrame(() => gl.render(scene, camera), 1);
  return null;
};

/* ───────── captions: 1–3 words, word by word, like the reference */
type Cap = { words: Word[]; s: number; e: number };
const KEY = ["افسانه‌ست", "اسیدی", "میلیون‌ها", "می‌میرن", "خنثی", "مخاط", "نابود", "صدتا", "یکی‌شون", "تخمک", "شلیک"];
const CAPS: Cap[] = (() => {
  const out: Cap[] = [];
  for (const s of VO.segs) {
    const ws = VO.words.filter((w) => w.line === s.n);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 3 || len > 15 || i === ws.length - 1 || /[،,]$/.test(w.w)) {
        out.push({ words: cur, s: cur[0].s, e: 0 });
        cur = [];
      }
    });
  }
  out.forEach((c, i) => (c.e = i < out.length - 1 ? Math.min(out[i + 1].s, c.words[c.words.length - 1].e + 0.6) : TOTAL));
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.s - 0.03 && t < x.e);
  if (!c) return null;
  const k = eo(prog(t, c.s - 0.03, c.s + 0.1));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1300, display: "flex", justifyContent: "center", direction: "rtl", gap: 22, transform: `scale(${0.86 + 0.14 * k})`, opacity: k }}>
      {c.words.map((w, i) => {
        const on = t >= w.s - 0.03;
        const kw = KEY.includes(bare(w.w));
        const pop = eo(prog(t, w.s - 0.03, w.s + 0.08));
        return (
          <span key={i} style={{
            fontFamily: "V27Black", fontSize: 92, lineHeight: 1.25, color: kw ? "#C6FF3D" : "#FFFFFF", opacity: on ? 1 : 0,
            transform: `translateY(${(1 - pop) * 14}px)`, display: "inline-block",
            textShadow: "0 5px 0 rgba(0,0,0,0.85), 0 0 3px #000, 0 0 22px rgba(0,0,0,0.55)",
          }}>{bare(w.w)}</span>
        );
      })}
    </div>
  );
};

/* ───────── survivors counter */
const fa = (n: number) => Math.round(n).toLocaleString("en-US").replace(/,/g, "٬").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const KEYS: [number, number][] = [
  [T.F, 250e6], [T.atk + 0.1, 250e6], [T.die + 0.4, 62e6], [T.G, 60e6], [T.H, 41e6], [T.pass + 0.4, 3.1e6],
  [T.kill, 2.6e6], [T.kill + 0.6, 38000], [T.J, 31000], [T.hundreds + 0.2, 200], [T.K, 180], [T.one + 0.2, 6], [T.enter + 0.15, 1],
];
const countAt = (t: number) => {
  if (t <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const [a, va] = KEYS[i], [b, vb] = KEYS[i + 1];
    if (t <= b) { const k = eo(prog(t, a, b)); return Math.exp(Math.log(va) + (Math.log(vb) - Math.log(va)) * k); }
  }
  return 1;
};
const Counter: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.F) return null;
  const k = eo(prog(t, T.F + 0.05, T.F + 0.35));
  const n = countAt(t);
  const drop = KEYS.some(([a], i) => i > 0 && t > a - 0.6 && t < a + 0.05 && KEYS[i - 1][1] !== KEYS[i][1]);
  const last = t >= T.enter;
  const jit = drop ? Math.sin(t * 90) * 3 : 0;
  return (
    <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * -30}px)` }}>
      <div style={{ direction: "rtl", display: "flex", alignItems: "center", gap: 22, padding: "16px 34px", borderRadius: 26, background: "rgba(20,4,6,0.55)", border: `3px solid ${last ? "#FFE3A0" : "rgba(198,255,61,0.75)"}`, boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}>
        <svg width="54" height="54" viewBox="0 0 54 54">
          <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="3" />
          <path d="M6 20 H34 M20 6 V34" stroke="#fff" strokeWidth="2.5" />
          <path d="M30 30 C38 38, 44 34, 50 48" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: "V27Bold", fontSize: 40, color: "rgba(255,255,255,0.85)" }}>زنده‌مونده‌ها</div>
        <div style={{ fontFamily: "V27Black", fontSize: 64, color: last ? "#FFE3A0" : drop ? "#FF6B5A" : "#C6FF3D", minWidth: 330, textAlign: "center", transform: `translateX(${jit}px)` }}>{fa(n)}</div>
      </div>
    </div>
  );
};

/* ───────── «افسانه» rubber stamp */
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  const t0 = T.myth - 0.05;
  if (t < t0 || t >= T.F) return null;
  const k = prog(t, t0, t0 + 0.16);
  const s = 2.3 - 1.3 * eo(k);
  const ink = 0.92;
  return (
    <div style={{ position: "absolute", left: 540 - 330, top: 760 - 330, width: 660, height: 660, transform: `scale(${s}) rotate(-14deg)`, opacity: clamp(k * 3) }}>
      <svg width="660" height="660" viewBox="0 0 660 660">
        <defs>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.3" /><feComposite in="SourceGraphic" operator="in" /></filter>
        </defs>
        <g filter="url(#rough)" opacity={ink}>
          <circle cx="330" cy="330" r="300" fill="none" stroke="#E0201C" strokeWidth="26" />
          <circle cx="330" cy="330" r="255" fill="none" stroke="#E0201C" strokeWidth="9" />
          {[...Array(10)].map((_, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            if (i === 2 || i === 3 || i === 7 || i === 8) return null;
            return <text key={i} x={330 + Math.cos(a) * 222} y={330 + Math.sin(a) * 222 + 16} fontSize="44" fill="#E0201C" textAnchor="middle">★</text>;
          })}
          <rect x="70" y="250" width="520" height="160" fill="#E0201C" />
          <text x="330" y="372" fontFamily="V27Black" fontSize="150" fill="#fff" textAnchor="middle" style={{ direction: "rtl" }}>افسانه</text>
        </g>
      </svg>
    </div>
  );
};

/* ───────── slime splat on the lens */
const Splat: React.FC<{ t: number }> = ({ t }) => {
  const t0 = wd(5, "همون‌جا");
  if (t < t0 || t > T.G) return null;
  const k = eo(prog(t, t0, t0 + 0.1));
  const out = prog(t, T.G - 0.45, T.G);
  const drip = prog(t, t0 + 0.1, T.G) * 120;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: 0.92 * (1 - out) }}>
      <defs>
        <radialGradient id="sl" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#E4FF8A" /><stop offset="0.45" stopColor="#9BEA1E" /><stop offset="1" stopColor="#4F9A08" /></radialGradient>
      </defs>
      <g transform={`translate(860 420) scale(${k})`} fill="url(#sl)">
        <path d="M-260 -120 C-180 -260 40 -280 160 -170 C300 -60 320 120 200 220 C80 320 -120 300 -220 190 C-320 80 -330 -10 -260 -120 Z" />
        <circle cx="-300" cy="160" r="40" /><circle cx="250" cy="-230" r="34" /><circle cx="-120" cy="330" r="26" />
        <path d={`M-60 230 C-60 ${300 + drip}, -20 ${300 + drip}, -20 230 Z`} />
        <circle cx="-40" cy={300 + drip} r="22" />
        <path d={`M100 240 C100 ${290 + drip * 0.6}, 130 ${290 + drip * 0.6}, 130 240 Z`} />
        <ellipse cx="-80" cy="-120" rx="90" ry="40" fill="rgba(255,255,255,0.55)" transform="rotate(-25)" />
      </g>
    </svg>
  );
};

/* ───────── main */
const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t: tProp }) => {
  const frame = useCurrentFrame();
  const t = tProp ?? frame / FPS;
  // the myth stamp freezes the last frame of the «new life» shot
  const freeze = t >= T.E && t < T.F;
  const wt = freeze ? T.E - 0.01 : t;
  const fz = freeze ? prog(t, T.E, T.F) : 0;
  const gray = freeze ? 0.15 + 0.6 * eo(prog(t, T.myth - 0.05, T.myth + 0.4)) : 0;
  const shakeAmt = Math.max(
    t > T.myth - 0.05 && t < T.F ? 22 * Math.exp(-(t - T.myth + 0.05 - 0.16) * 10) * (t > T.myth + 0.11 ? 1 : 0) : 0,
    t > T.kill ? 10 * Math.exp(-(t - T.kill) * 5) * (t < T.J ? 1 : 0) : 0,
  );
  const sx = Math.sin(t * 83) * shakeAmt, sy = Math.cos(t * 71) * shakeAmt;
  const flashW = t > T.enter && t < T.enter + 0.6 ? 0.55 * Math.exp(-(t - T.enter) * 7) : 0;
  const flashR = t > T.kill && t < T.kill + 0.7 ? 0.35 * Math.exp(-(t - T.kill) * 6) : 0;
  const flashG = t > T.atk && t < T.atk + 0.5 ? 0.22 * Math.exp(-(t - T.atk) * 8) : 0;
  const cutFlash = [T.C, T.D, T.F, T.G, T.H, T.I, T.J, T.K].reduce((a, c) => a + (t >= c && t < c + 0.1 ? 0.18 * (1 - (t - c) / 0.1) : 0), 0);
  const endFade = prog(t, TOTAL - 0.35, TOTAL);
  return (
    <AbsoluteFill style={{ background: "#200406" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.07 * fz + (shakeAmt > 0 ? 0.03 : 0)})`, filter: gray ? `grayscale(${gray}) contrast(1.08)` : undefined }}>
        <ThreeCanvas width={W} height={H} gl={{ antialias: true, stencil: false, preserveDrawingBuffer: true }} camera={{ fov: 50, near: 0.05, far: 400, position: [0, 0, 0] }}>
          <World3D t={wt} />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(25,0,4,0.55) 100%)" }} />
      {freeze && <AbsoluteFill style={{ background: `rgba(120,10,10,${0.18 * gray})` }} />}
      <Splat t={t} />
      <AbsoluteFill style={{ background: `rgba(255,248,235,${flashW + cutFlash})` }} />
      <AbsoluteFill style={{ background: `rgba(255,40,40,${flashR})` }} />
      <AbsoluteFill style={{ background: `rgba(170,255,40,${flashG})` }} />
      <Stamp t={t} />
      <Counter t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${endFade})` }} />
      {audio && tProp === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

// review frames: start, launch, race, chase, division, stamp, acid, fluid, mucus, immune, field, entry, end
const LOOK = [0.1, 1.5, 4.0, 6.5, 8.9, 10.6, 14.2, 15.8, 18.6, 22.8, 27.9, 30.5, 34.3, TOTAL - 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;
export const V27: React.FC = () => (
  <>
    <Composition id="V27" component={Video} durationInFrames={V27_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v27/mix-norm.wav" }} />
    <Composition id="V27-Silent" component={Video} durationInFrames={V27_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V27-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
