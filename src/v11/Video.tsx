// V11 · «۳۰ روز معروف‌ترین خواننده‌ی دنیا!» — قسمت ۳ کامران. همان زبان V05 (عکس واقع‌گرای کاربر + دوربین + برچسب روز)،
// به‌اضافه‌ی هوک از وسط ماجرا، عقب‌زدن نوار VHS، شمارنده‌ی بازدید، فلش خاطره‌ی حموم، کانفتی و کارت «کامنت کن».
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];

const FPS = 30;
const W = 1080;
const H = 1920;
const TOTAL = 46.0;
export const V11_FRAMES = Math.round(TOTAL * FPS);
const IMG_AR = 1438 / 2576; // all eight stills are scaled to 1438×2576

const fontHandle = typeof document !== "undefined" ? delayRender("v11 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V11Black", "fonts/Vazirmatn-Black.ttf"], ["V11Bold", "fonts/Vazirmatn-Bold.ttf"], ["V11Lalezar", "fonts/Lalezar-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const wd = (si: number, word: string) => {
  const bare = (x: string) => x.replace(/[،.؟!…«»]/g, "");
  const w = words.find((x) => x.si === si && bare(x.w) === word) ?? words.find((x) => x.si === si && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const segStart = (si: number) => words.find((w) => w.si === si)!.s;
const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;
const cut = (si: number) => segStart(si) - 0.14;

type Key = { t: number; fx: number; fy: number; s: number; ease?: number };
const camAt = (keys: Key[], T: number) => {
  let cur = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (T < k.t) break;
    const p = easeOut(prog(T, k.t, k.t + (k.ease ?? 0.6)));
    cur = { t: k.t, fx: cur.fx + (k.fx - cur.fx) * p, fy: cur.fy + (k.fy - cur.fy) * p, s: cur.s + (k.s - cur.s) * p };
  }
  return cur;
};

type Place = { x: number; y: number; dw: number; dh: number };
const place = (fx: number, fy: number, s: number, T: number, shake = 0): Place => {
  const dw = W * s;
  const dh = (W / IMG_AR) * s;
  const hx = Math.sin(T * 0.9) * 4 + Math.sin(T * 2.3) * 2 + Math.sin(T * 61) * shake;
  const hy = Math.cos(T * 0.7) * 4 + Math.sin(T * 1.9) * 2 + Math.cos(T * 53) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });

const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number }> = ({ p, ix, iy, r, color, a }) => {
  const c = at(p, ix, iy);
  const rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: "screen",
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};

// blurred copy of a patch of the still (hides AI pseudo-text), stuck to the picture
const BlurPatch: React.FC<{ p: Place; img: string; x0: number; y0: number; x1: number; y1: number; px: number }> = ({ p, img, x0, y0, x1, y1, px }) => {
  const a = at(p, x0, y0);
  const b = at(p, x1, y1);
  return (
    <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, borderRadius: 24, overflow: "hidden" }}>
      <Img src={staticFile(img)} style={{ position: "absolute", left: p.x - a.x, top: p.y - a.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none", filter: `blur(${px}px)` }} />
    </div>
  );
};

// camera flashes popping at random points of a region of the picture
const Flashes: React.FC<{ p: Place; T: number; x0: number; y0: number; x1: number; y1: number; rate: number; seed: number; size?: number }> = ({ p, T, x0, y0, x1, y1, rate, seed, size = 0.05 }) => {
  const out: React.ReactNode[] = [];
  const slot = Math.floor(T * rate);
  for (let k = slot - 2; k <= slot; k++) {
    const t0 = k / rate;
    const life = prog(T, t0, t0 + 0.22);
    if (life <= 0 || life >= 1) continue;
    const a = (1 - life) * (hash(k + seed) > 0.25 ? 1 : 0);
    out.push(<Glow key={k} p={p} ix={x0 + (x1 - x0) * hash(k * 3.1 + seed)} iy={y0 + (y1 - y0) * hash(k * 7.7 + seed)} r={size * (0.7 + hash(k + 9) * 0.6)} color="rgba(255,255,255,A)" a={a * 0.95} />);
  }
  return <>{out}</>;
};

// rising steam wisps (screen space)
const Steam: React.FC<{ T: number; a: number }> = ({ T, a }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const sp = 0.06 + hash(i) * 0.05;
      const ph = (T * sp + hash(i + 4)) % 1;
      const x = W * (0.1 + 0.8 * hash(i + 11)) + Math.sin(T * 0.8 + i) * 40;
      const y = H * (1.05 - ph * 1.1);
      const r = 260 + hash(i + 2) * 220;
      return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,240,225,${a * 0.16 * Math.sin(ph * Math.PI)}) 0%, rgba(255,240,225,0) 70%)` }} />;
    })}
  </>
);

// falling gold confetti (screen space)
const Confetti: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  if (T < t0 || T > cut(10) + 0.12) return null;
  const el = T - t0;
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => {
        const delay = hash(i) * 1.2;
        const tt = el - delay;
        if (tt < 0) return null;
        const vx = (hash(i + 3) - 0.5) * 220;
        const x = W * hash(i + 7) + vx * tt + Math.sin(tt * 3 + i) * 30;
        const y = -60 + tt * (380 + hash(i + 5) * 260);
        if (y > H + 40) return null;
        const rot = tt * (200 + hash(i + 1) * 500) + i * 40;
        const flip = Math.abs(Math.cos(tt * (5 + hash(i) * 6)));
        const gold = hash(i + 13) > 0.3;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 22, height: 13, borderRadius: 2,
          background: gold ? `rgb(${230 + 25 * flip},${185 + 40 * flip},${70 + 50 * flip})` : `rgb(${180 + 60 * flip},${120 + 50 * flip},255)`,
          transform: `rotate(${rot}deg) scaleY(${0.2 + 0.8 * flip})`, boxShadow: "0 0 8px rgba(255,210,120,0.6)" }} />;
      })}
    </>
  );
};

// heartbeat: two thumps per beat, ~70 bpm
const beat = (T: number) => {
  const ph = (T % 0.86) / 0.86;
  return Math.exp(-ph * 30) + 0.6 * Math.exp(-Math.max(0, ph - 0.18) * 30) * (ph > 0.18 ? 1 : 0);
};

type ShotDef = {
  img: string; from: number; to: number; keys: Key[];
  shake?: (T: number) => number;
  grade?: (T: number) => string;
  extra?: (T: number, p: Place) => React.ReactNode;
  day?: string;
};

const REW0 = segEnd(0) + 0.08; // VHS rewind: shot 1 → «۳۰ روز قبل»
const REW1 = cut(1);
const MEM0 = cut(9); // memory flash of the shower, then the stadium explodes
const BOOM = wd(9, "و") - 0.12;
const END0 = segEnd(11) + 0.35; // «comment» card

const SHOTS: ShotDef[] = [
  { // ۱ · هوک: صحنه‌ی کنسرت، قفل کرده؛ فشار آرام و زوم ضربه‌ای روی «یادش»
    img: "v11/shot1.jpg", from: 0, to: REW1,
    keys: [
      { t: 0, fx: 0.5, fy: 0.42, s: 1.12 },
      { t: 0.02, fx: 0.5, fy: 0.38, s: 1.3, ease: 3.2 },
      { t: wd(0, "یادش") - 0.1, fx: 0.5, fy: 0.34, s: 1.75, ease: 0.22 },
    ],
    shake: (T) => beat(T) * 2.5,
    extra: (T, p) => (
      <>
        <Flashes p={p} T={T} x0={0.02} y0={0.82} x1={0.98} y1={0.98} rate={9} seed={1} size={0.03} />
        <Glow p={p} ix={0.33} iy={0.43} r={0.12} color="rgba(255,170,70,A)" a={0.3 + 0.15 * Math.sin(T * 13)} />
        <Glow p={p} ix={0.69} iy={0.43} r={0.12} color="rgba(255,170,70,A)" a={0.3 + 0.15 * Math.sin(T * 11 + 1)} />
      </>
    ),
  },
  { // ۲ · ۳۰ روز قبل: زیر دوش؛ بعد روی «همسایه» بالا به پنجره و گوشی‌اش
    img: "v11/shot2.jpg", from: REW1, to: cut(2), day: "۳۰ روز قبل",
    keys: [
      { t: REW1, fx: 0.4, fy: 0.55, s: 1.5 },
      { t: REW1 + 0.02, fx: 0.42, fy: 0.55, s: 1.35, ease: 2.0 },
      { t: wd(1, "همسایه") - 0.15, fx: 0.66, fy: 0.45, s: 1.85, ease: 0.45 },
      { t: wd(1, "فیلم") - 0.1, fx: 0.62, fy: 0.46, s: 2.1, ease: 0.3 },
    ],
    extra: (T, p) => {
      const rec = T > wd(1, "همسایه") ? 1 : 0;
      const ph = at(p, 0.6, 0.47);
      return (
        <>
          <BlurPatch p={p} img="v11/shot2.jpg" x0={0.58} y0={0.44} x1={0.86} y1={0.55} px={9} />
          <Glow p={p} ix={0.5} iy={0.12} r={0.25} color="rgba(255,225,170,A)" a={0.25 + 0.05 * Math.sin(T * 2)} />
          {rec > 0 && <div style={{ position: "absolute", left: ph.x - 14, top: ph.y - 14, width: 28, height: 28, borderRadius: "50%",
            background: "#ff2a2a", opacity: Math.floor(T * 2.4) % 2 ? 1 : 0.25, boxShadow: "0 0 26px 8px rgba(255,40,40,0.75)" }} />}
        </>
      );
    },
  },
  { // ۳ · روز ۱: پنجره و جمعیت؛ شمارنده‌ی بازدید، بعد صورت کامران روی «این‌همه»
    img: "v11/shot3.jpg", from: cut(2), to: cut(4), day: "روز ۱",
    keys: [
      { t: cut(2), fx: 0.27, fy: 0.42, s: 1.55 },
      { t: cut(2) + 0.02, fx: 0.3, fy: 0.45, s: 1.4, ease: 2.4 },
      { t: wd(3, "این‌همه") - 0.12, fx: 0.68, fy: 0.33, s: 1.7, ease: 0.3 },
    ],
    extra: (T, p) => (
      <>
        <Flashes p={p} T={T} x0={0.08} y0={0.3} x1={0.48} y1={0.75} rate={11} seed={4} size={0.05} />
        <Glow p={p} ix={0.47} iy={0.69} r={0.1} color="rgba(170,210,255,A)" a={0.5 + 0.3 * Math.abs(Math.sin(T * 7))} />
      </>
    ),
  },
  { // ۴ · روز ۱۰: فرار با سنگک؛ لرزش دویدن، بعد زوم روی سنگک و صورت
    img: "v11/shot4.jpg", from: cut(4), to: cut(6), day: "روز ۱۰",
    keys: [
      { t: cut(4), fx: 0.45, fy: 0.5, s: 1.08 },
      { t: cut(4) + 0.02, fx: 0.52, fy: 0.42, s: 1.3, ease: 2.4 },
      { t: wd(5, "سنگک") - 0.12, fx: 0.62, fy: 0.36, s: 1.75, ease: 0.25 },
    ],
    shake: (T) => 4 + 3 * Math.abs(Math.sin(T * 9)),
    extra: (T, p) => <Flashes p={p} T={T} x0={0.02} y0={0.12} x1={0.35} y1={0.35} rate={8} seed={7} size={0.06} />,
  },
  { // ۵ · روز ۲۰: اول فقط صورت و مسواک، روی «بادیگاردا» عقب می‌کشد و دو غول پیدا می‌شوند
    img: "v11/shot5.jpg", from: cut(6), to: cut(7), day: "روز ۲۰",
    keys: [
      { t: cut(6), fx: 0.5, fy: 0.27, s: 1.8 },
      { t: cut(6) + 0.02, fx: 0.5, fy: 0.28, s: 1.9, ease: 0.8 },
      { t: wd(6, "بادیگاردا") - 0.1, fx: 0.5, fy: 0.33, s: 1.08, ease: 0.35 },
      { t: wd(6, "ولش"), fx: 0.5, fy: 0.3, s: 1.2, ease: 1.2 },
    ],
  },
  { // ۶ · روز ۲۵: میز شام بی‌پایان؛ فشار آرام به سمت او، سرد و کم‌رنگ
    img: "v11/shot6.jpg", from: cut(7), to: cut(8), day: "روز ۲۵",
    keys: [
      { t: cut(7), fx: 0.5, fy: 0.6, s: 1.02 },
      { t: cut(7) + 0.02, fx: 0.5, fy: 0.45, s: 1.7, ease: 2.8 },
    ],
    grade: (T) => `saturate(${1 - 0.35 * prog(T, cut(7), cut(7) + 1.5)}) brightness(0.95)`,
    extra: (T, p) => (
      <>
        {[[0.36, 0.69], [0.44, 0.6], [0.62, 0.81], [0.38, 0.64]].map(([x, y], i) => (
          <Glow key={i} p={p} ix={x} iy={y} r={0.05} color="rgba(255,190,110,A)" a={0.35 + 0.12 * Math.sin(T * (9 + i * 2.3) + i)} />
        ))}
      </>
    ),
  },
  { // ۷ · روز ۳۰: برگشت به صحنه؛ ضربان، فشار خیلی آرام، روی «ذهنش» دنیا رنگ می‌بازد
    img: "v11/shot1.jpg", from: cut(8), to: MEM0, day: "روز ۳۰",
    keys: [
      { t: cut(8), fx: 0.5, fy: 0.5, s: 1.0 },
      { t: cut(8) + 0.02, fx: 0.5, fy: 0.42, s: 1.25, ease: 2.6 },
      { t: wd(8, "ذهنش") - 0.1, fx: 0.5, fy: 0.34, s: 1.9, ease: 1.4 },
    ],
    shake: (T) => beat(T) * 3,
    grade: (T) => { const q = prog(T, wd(8, "ذهنش"), wd(8, "شد") + 0.2); return `saturate(${1 - 0.85 * q}) brightness(${1 + 0.12 * q}) blur(${q * 1.2}px)`; },
    extra: (T, p) => <Flashes p={p} T={T} x0={0.02} y0={0.82} x1={0.98} y1={0.98} rate={6} seed={11} size={0.03} />,
  },
  { // ۸ · چشماشو بست… خاطره‌ی حموم (گرم و نرم)
    img: "v11/shot2.jpg", from: MEM0, to: BOOM,
    keys: [
      { t: MEM0, fx: 0.4, fy: 0.52, s: 1.9 },
      { t: MEM0 + 0.02, fx: 0.4, fy: 0.53, s: 1.6, ease: 1.8 },
    ],
    grade: () => "sepia(0.35) saturate(1.2) brightness(1.08) blur(1px)",
    extra: (T, p) => <BlurPatch p={p} img="v11/shot2.jpg" x0={0.58} y0={0.44} x1={0.86} y1={0.55} px={9} />,
  },
  { // ۹ · «فکر کرد زیر دوشه!» صحنه منفجر می‌شود: کانفتی، آتش، لرزش
    img: "v11/shot7.jpg", from: BOOM, to: cut(10),
    keys: [
      { t: BOOM, fx: 0.48, fy: 0.24, s: 1.9 },
      { t: BOOM + 0.02, fx: 0.5, fy: 0.4, s: 1.08, ease: 0.45 },
      { t: BOOM + 0.6, fx: 0.5, fy: 0.36, s: 1.22, ease: 2.0 },
    ],
    shake: (T) => (1 - prog(T, BOOM, BOOM + 0.9)) * 12 + 2,
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.12} iy={0.5} r={0.2} color="rgba(255,160,60,A)" a={0.35 + 0.2 * Math.sin(T * 14)} />
        <Glow p={p} ix={0.66} iy={0.48} r={0.2} color="rgba(255,160,60,A)" a={0.35 + 0.2 * Math.sin(T * 12 + 2)} />
        <Flashes p={p} T={T} x0={0.05} y0={0.3} x1={0.95} y1={0.75} rate={10} seed={21} size={0.04} />
      </>
    ),
  },
  { // ۱۰ · مامان: از کامرانِ پولک‌دار به انگشت مامان، بعد زوم ضربه‌ای روی صورتش
    img: "v11/shot8.jpg", from: cut(10), to: TOTAL,
    keys: [
      { t: cut(10), fx: 0.3, fy: 0.3, s: 1.55 },
      { t: cut(10) + 0.02, fx: 0.33, fy: 0.28, s: 1.45, ease: 1.2 },
      { t: wd(10, "تأثیر") - 0.2, fx: 0.62, fy: 0.3, s: 1.45, ease: 0.6 },
      { t: wd(11, "آقای") - 0.12, fx: 0.69, fy: 0.27, s: 2.0, ease: 0.2 },
      { t: wd(11, "آشغالا") - 0.1, fx: 0.5, fy: 0.42, s: 1.06, ease: 0.3 },
    ],
    shake: (T) => (T > wd(11, "آقای") - 0.05 && T < wd(11, "آقای") + 0.3 ? 9 : 0),
  },
];

type Kind = "rewind" | "dissolve" | "whip" | "flash" | "dark" | "warm" | "boom" | "cut";
const KIND: Record<number, Kind> = { 1: "rewind", 2: "flash", 3: "whip", 4: "cut", 5: "dissolve", 6: "dark", 7: "warm", 8: "boom", 9: "whip" };
const XLEN: Record<Kind, number> = { rewind: 0, dissolve: 0.4, whip: 0.24, flash: 0.14, dark: 0.5, warm: 0.4, boom: 0.06, cut: 0 };

const ShotView: React.FC<{ d: ShotDef; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  const p = place(c.fx, c.fy, c.s, T, d.shake?.(T) ?? 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: d.grade?.(T) }}>
      <Img src={staticFile(d.img)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

// reel-style captions: Kamran's lines in «», Mom's tagged, current word lit
const SPK: Record<string, { tag?: string; color: string }> = { brian: { color: "#fff" }, liam: { color: "#7FD6C8" }, matilda: { tag: "مامان:", color: "#FF9FB2" } };
type Chunk = { ws: Word[]; v: string };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (let si = 0; si <= 11; si++) {
    const ws = words.filter((w) => w.si === si);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 6 || len > 28 || /[؟!…]$/.test(w.w) || (/،$/.test(w.w) && cur.length >= 3) || i === ws.length - 1) { out.push({ ws: cur, v: w.v }); cur = []; }
    });
  }
  return out;
})();

const Captions: React.FC<{ T: number }> = ({ T }) => {
  const i = CHUNKS.findIndex((c, k) => T >= c.ws[0].s - 0.06 && (k === CHUNKS.length - 1 || T < CHUNKS[k + 1].ws[0].s - 0.06));
  const c = CHUNKS[i];
  if (!c || T > c.ws[c.ws.length - 1].e + 0.45) return null;
  const pop = easeOut(prog(T, c.ws[0].s - 0.06, c.ws[0].s + 0.1));
  const sp = SPK[c.v];
  const quote = c.v === "liam";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1320, display: "flex", justifyContent: "center", opacity: pop,
      transform: `translateY(${(1 - pop) * 14}px) scale(${0.96 + 0.04 * pop})` }}>
      <div style={{ maxWidth: 940, padding: "14px 32px 18px", borderRadius: 20, background: "rgba(10,10,10,0.6)", direction: "rtl", textAlign: "center",
        fontFamily: "V11Bold", fontSize: 60, lineHeight: 1.45, color: "#fff", border: c.v === "brian" ? "none" : `3px solid ${sp.color}` }}>
        {sp.tag && <span style={{ color: sp.color, fontFamily: "V11Black" }}>{sp.tag} </span>}
        {quote && <span style={{ color: sp.color }}>« </span>}
        {c.ws.map((w, j) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return <span key={j} style={{ color: on ? "#FFD34D" : "rgba(255,255,255,0.94)" }}>{w.w}{j < c.ws.length - 1 ? " " : ""}</span>;
        })}
        {quote && <span style={{ color: sp.color }}> »</span>}
      </div>
    </div>
  );
};

// hook title, from frame 0: «۳۰ روز» + «معروف‌ترین خواننده‌ی دنیا!»
const HookTitle: React.FC<{ T: number }> = ({ T }) => {
  if (T > REW0 + 0.1) return null;
  const a = easeOut(prog(T, -0.12, 0.14));
  const b = easeOut(prog(T, -0.05, 0.25));
  const out = prog(T, REW0 - 0.15, REW0 + 0.1);
  const pulse = 1 + 0.03 * Math.sin(T * 6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 1 - out, direction: "rtl" }}>
      <div style={{ transform: `scale(${(1.5 - 0.5 * a) * pulse}) rotate(-3deg)`, opacity: a, fontFamily: "V11Lalezar", fontSize: 150, lineHeight: 1.1, color: "#1a1a1a",
        background: "#FFD34D", padding: "4px 44px 0", borderRadius: 22, boxShadow: "0 14px 50px rgba(0,0,0,0.5)" }}>
        ۳۰ روز
      </div>
      <div style={{ transform: `translateY(${(1 - b) * 40}px)`, opacity: b, fontFamily: "V11Black", fontSize: 70, color: "#fff", textAlign: "center",
        padding: "6px 30px 14px", borderRadius: 18, background: "rgba(10,10,10,0.62)" }}>
        معروف‌ترین خواننده‌ی دنیا! 🎤
      </div>
    </div>
  );
};

// day badge: drops in at the top of each day, then sits small
const DayBadge: React.FC<{ T: number }> = ({ T }) => {
  const d = SHOTS.find((s) => s.day && T >= s.from && T < s.to);
  if (!d) return null;
  const p = easeOut(prog(T, d.from, d.from + 0.3));
  const settle = easeInOut(prog(T, d.from + 1.1, d.from + 1.5));
  const s = 1.25 - 0.25 * p - 0.25 * settle;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 210 - 40 * settle, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ transform: `translateY(${(1 - p) * -40}px) scale(${s})`, direction: "rtl", fontFamily: "V11Black", fontSize: 76, color: "#fff",
        padding: "8px 36px 14px", borderRadius: 18, background: "rgba(10,10,10,0.6)", borderBottom: "6px solid #FFD34D" }}>
        {d.day}
      </div>
    </div>
  );
};

// views counter while «صد میلیون بازدید»
const fa = (n: number) => Math.round(n).toLocaleString("en-US").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]).replace(/,/g, "٬");
const Views: React.FC<{ T: number }> = ({ T }) => {
  const a = wd(2, "اون") - 0.1;
  const end = segEnd(3) + 0.3;
  if (T < a || T > end) return null;
  const p = easeOut(prog(T, a, a + 0.25));
  const out = prog(T, end - 0.25, end);
  const n = 100_000_000 * easeInOut(prog(T, a, wd(2, "خورد")));
  const hit = T > wd(2, "خورد") ? 1 + 0.12 * Math.exp(-(T - wd(2, "خورد")) * 8) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", opacity: p * (1 - out) }}>
      <div style={{ transform: `scale(${(0.8 + 0.2 * p) * hit})`, display: "flex", alignItems: "center", gap: 22, direction: "rtl", padding: "14px 36px 18px",
        borderRadius: 999, background: "rgba(255,255,255,0.95)", boxShadow: "0 16px 50px rgba(0,0,0,0.45)" }}>
        <svg width="70" height="70" viewBox="0 0 24 24"><path d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5z" fill="#E1306C" /><circle cx="12" cy="12" r="4.2" fill="#fff" /><circle cx="12" cy="12" r="2.3" fill="#1a1a1a" /></svg>
        <span style={{ fontFamily: "V11Black", fontSize: 72, color: "#1a1a1a", minWidth: 470, textAlign: "center" }}>{fa(n)}</span>
        <span style={{ fontFamily: "V11Bold", fontSize: 44, color: "#555" }}>بازدید</span>
      </div>
    </div>
  );
};

// VHS rewind between the hook and «۳۰ روز قبل»
const Rewind: React.FC<{ T: number }> = ({ T }) => {
  if (T < REW0 - 0.05 || T > REW1 + 0.25) return null;
  const q = prog(T, REW0 - 0.05, REW1);
  const tail = 1 - prog(T, REW1, REW1 + 0.25);
  const k = T < REW1 ? 1 : tail;
  const band = (T * 3.3) % 1;
  return (
    <>
      <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,${0.35 * k}) 0 3px, transparent 3px 7px)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H * band - 60, height: 120, background: `rgba(255,255,255,${0.22 * k})`, filter: "blur(6px)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H * ((band + 0.47) % 1) - 20, height: 40, background: `rgba(255,255,255,${0.15 * k})`, filter: "blur(3px)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(255,0,60,${0.16 * k}), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,200,255,${0.16 * k}))`, mixBlendMode: "screen" }} />
      {T < REW1 + 0.1 && (
        <div style={{ position: "absolute", left: 70, top: 120, display: "flex", alignItems: "center", gap: 18, opacity: Math.floor(T * 8) % 2 ? 1 : 0.55 }}>
          <svg width="120" height="70" viewBox="0 0 120 70"><path d="M60 5 L60 65 L10 35 Z M115 5 L115 65 L65 35 Z" fill="#fff" /></svg>
          <span style={{ fontFamily: "V11Black", fontSize: 54, color: "#fff", letterSpacing: 2 }}>REW</span>
        </div>
      )}
      <div style={{ position: "absolute", right: 70, top: 132, fontFamily: "V11Black", fontSize: 50, color: "#fff", opacity: 0.85 * k, direction: "ltr" }}>
        {`-${String(Math.round(30 * (1 - q))).padStart(2, "0")}d`}
      </div>
    </>
  );
};

// last card: «قسمت بعد کامران چی‌کار کنه؟ کامنت کن 👇»
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < END0) return null;
  const p = easeOut(prog(T, END0, END0 + 0.3));
  const q = easeOut(prog(T, END0 + 0.25, END0 + 0.55));
  const bob = Math.sin((T - END0) * 7) * 10;
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${0.55 * p})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, direction: "rtl" }}>
        <div style={{ opacity: p, transform: `scale(${1.3 - 0.3 * p})`, fontFamily: "V11Black", fontSize: 74, color: "#fff", textAlign: "center", lineHeight: 1.5 }}>
          قسمت بعد<br /><span style={{ color: "#FFD34D" }}>کامران</span> چی‌کار کنه؟
        </div>
        <div style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px)`, display: "flex", alignItems: "center", gap: 18, padding: "14px 40px 20px",
          borderRadius: 999, background: "#FFD34D", boxShadow: "0 14px 50px rgba(0,0,0,0.5)" }}>
          <svg width="64" height="64" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#1a1a1a" /><circle cx="8" cy="11" r="1.4" fill="#FFD34D" /><circle cx="12" cy="11" r="1.4" fill="#FFD34D" /><circle cx="16" cy="11" r="1.4" fill="#FFD34D" /></svg>
          <span style={{ fontFamily: "V11Black", fontSize: 66, color: "#1a1a1a" }}>کامنت کن</span>
        </div>
        <div style={{ opacity: q, transform: `translateY(${bob}px)`, fontSize: 96 }}>👇</div>
      </div>
    </>
  );
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const xlen = (i: number) => (i <= 0 || i >= SHOTS.length ? 0 : XLEN[KIND[i]]);
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((d, i) => {
    const xin = xlen(i);
    const xout = xlen(i + 1);
    if (T < d.from - xin / 2 || T >= d.to + xout / 2) return;
    let op = xin ? easeInOut(prog(T, d.from - xin / 2, d.from + xin / 2)) : 1;
    let style: React.CSSProperties = {};
    if (KIND[i] === "whip" && T < d.from + xin / 2) {
      const q = prog(T, d.from - xin / 2, d.from + xin / 2);
      style = { transform: `translateX(${(1 - easeOut(q)) * 700}px)`, filter: `blur(${(1 - q) * 18}px)` };
      op = 1;
    }
    if (KIND[i + 1] === "whip" && T > d.to - xout / 2) {
      const q = prog(T, d.to - xout / 2, d.to + xout / 2);
      style = { transform: `translateX(${-easeOut(q) * 700}px)`, filter: `blur(${q * 18}px)` };
    }
    // rewind: the hook shot shudders and slides back while the tape runs
    if (i === 0 && T > REW0 - 0.05) {
      const q = prog(T, REW0 - 0.05, REW1);
      style = { transform: `translateY(${Math.sin(T * 70) * 18 * q}px) scale(${1 + 0.06 * q})`, filter: `contrast(${1 + 0.4 * q}) saturate(${1 - 0.6 * q}) hue-rotate(${q * 30}deg)` };
    }
    if (op <= 0) return;
    layers.push(<AbsoluteFill key={i} style={{ opacity: op, ...style }}><ShotView d={d} T={T} /></AbsoluteFill>);
  });
  // accents
  const f2 = cut(2); // «فرداش»: white pop
  const flash = T > f2 - 0.07 && T < f2 + 0.25 ? (T < f2 ? prog(T, f2 - 0.07, f2) : 1 - prog(T, f2, f2 + 0.25)) : 0;
  const w7 = MEM0;
  const warm = T > w7 - 0.25 && T < w7 + 0.45 ? (T < w7 ? prog(T, w7 - 0.25, w7) : 1 - prog(T, w7, w7 + 0.45)) : 0;
  const boom = T > BOOM - 0.04 && T < BOOM + 0.35 ? (T < BOOM ? prog(T, BOOM - 0.04, BOOM) : 1 - prog(T, BOOM, BOOM + 0.35)) : 0;
  const steam = (T > REW1 && T < cut(2)) || (T > MEM0 && T < BOOM) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill>{layers}</AbsoluteFill>
      {steam > 0 && <Steam T={T} a={1} />}
      {flash > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${flash * 0.55})` }} />}
      {warm > 0 && <AbsoluteFill style={{ background: `rgba(255,200,120,${warm * 0.5})`, mixBlendMode: "screen" }} />}
      {boom > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, rgba(255,230,160,${boom * 0.85}) 0%, rgba(255,160,60,${boom * 0.35}) 45%, rgba(0,0,0,0) 85%)`, mixBlendMode: "screen" }} />}
      <Confetti T={T} t0={BOOM} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <Rewind T={T} />
      <HookTitle T={T} />
      <DayBadge T={T} />
      <Views T={T} />
      <Captions T={T} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const LOOK = [0.03, 0.4, 2.5, 4.5, REW0 + 0.25, 6.2, 9.0, 10.6, 12.6, 13.6, 15.5, 18.3, 20.8, 22.4, 23.6, 25.0, 27.4, 30.0, 32.9, 34.6, BOOM + 0.05, BOOM + 0.6, 38.4, 40.6, 42.2, 44.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V11: React.FC = () => (
  <>
    <Composition id="V11" component={Video} durationInFrames={V11_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v11/mix.wav" }} />
    <Composition id="V11-Silent" component={Video} durationInFrames={V11_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V11-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
