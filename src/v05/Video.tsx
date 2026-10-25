// V05 · «۳۰ روز بدون اینترنت!» — قسمت ۲ کامران. همان زبان V04: عکس واقع‌گرای کاربر + دوربین + دیزالو + زیرنویس کادردار،
// به‌اضافه‌ی برچسب «روز N»، راوی مستندی (Brian) و کامران (Liam).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";

type Word = { w: string; s: number; e: number; line: number };
type VO = { total: number; segs: { n: number; sp: string; start: number; end: number }[]; words: Word[] };
const vo = voJson as VO;

const FPS = 30;
const W = 1080;
const H = 1920;
const TOTAL = 31.4;
export const V05_FRAMES = Math.round(TOTAL * FPS);
const IMG_AR = 1438 / 2576; // all eight stills are scaled to 1438×2576

const fontHandle = typeof document !== "undefined" ? delayRender("v05 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V05Black", "fonts/Vazirmatn-Black.ttf"], ["V05Bold", "fonts/Vazirmatn-Bold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const wd = (line: number, word: string) => {
  const w = vo.words.find((x) => x.line === line && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const seg = (n: number) => vo.segs.find((s) => s.n === n)!;

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

// where the image sits on screen for a camera state (so glows/blur stick to things in the picture)
type Place = { x: number; y: number; dw: number; dh: number };
const place = (fx: number, fy: number, s: number, T: number, shake = 0): Place => {
  const dw = W * s;
  const dh = (W / IMG_AR) * s;
  const hx = Math.sin(T * 0.9) * 4 + Math.sin(T * 2.3) * 2 + Math.sin(T * 61) * shake;
  const hy = Math.cos(T * 0.7) * 4 + Math.sin(T * 1.9) * 2 + Math.cos(T * 53) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });

type ShotDef = {
  img: string; from: number; to: number; keys: Key[];
  shake?: (T: number) => number;
  extra?: (T: number, p: Place) => React.ReactNode;
  day?: string;
};
const cut = (n: number) => seg(n).start - 0.12;

// glow stuck to a point of the picture
const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number }> = ({ p, ix, iy, r, color, a }) => {
  const c = at(p, ix, iy);
  const rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: "screen",
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};

// heartbeat: two thumps per beat, ~70 bpm
const beat = (T: number) => {
  const ph = (T % 0.86) / 0.86;
  return Math.exp(-ph * 30) + 0.6 * Math.exp(-Math.max(0, ph - 0.18) * 30) * (ph > 0.18 ? 1 : 0);
};

const SHOTS: ShotDef[] = [
  { // ۱ · هوک: اتاق تاریک، ضربان قلب، فشار آرام به صورت وحشت‌زده
    img: "v05/shot1.jpg", from: 0, to: cut(2),
    keys: [
      { t: 0, fx: 0.5, fy: 0.45, s: 1.02 },
      { t: 0.02, fx: 0.5, fy: 0.36, s: 1.32, ease: 3.4 },
    ],
    shake: (T) => beat(T) * 3,
    extra: (T, p) => {
      // the clock shows readable digits in the AI still → blur them, keep the red glow
      const a = at(p, 0.5, 0.66);
      const b = at(p, 1.0, 0.85);
      return (
        <>
          <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, borderRadius: 40, overflow: "hidden" }}>
            <Img src={staticFile("v05/shot1.jpg")} style={{ position: "absolute", left: p.x - a.x, top: p.y - a.y, width: p.dw, height: p.dh,
              maxWidth: "none", maxHeight: "none", filter: "blur(22px) brightness(1.05)" }} />
          </div>
          <Glow p={p} ix={0.74} iy={0.85} r={0.28} color="rgba(255,40,30,A)" a={0.25 + 0.2 * beat(T)} />
        </>
      );
    },
  },
  { // ۲ · روز ۱: مودم در دست، بعد پایین به دستی که یواشکی سراغ گوشی می‌رود
    img: "v05/shot2.jpg", from: cut(2), to: cut(3), day: "روز ۱",
    keys: [
      { t: cut(2), fx: 0.5, fy: 0.3, s: 1.3 },
      { t: cut(2) + 0.02, fx: 0.48, fy: 0.33, s: 1.36, ease: 1.4 },
      { t: wd(2, "اصلاً") - 0.1, fx: 0.3, fy: 0.6, s: 1.6, ease: 0.7 },
    ],
  },
  { // ۳ · روز ۳: یخچال؛ نزدیک به دست و خیار، بعد صورت روی «لود»
    img: "v05/shot3.jpg", from: cut(3), to: cut(5), day: "روز ۳",
    keys: [
      { t: cut(3), fx: 0.5, fy: 0.5, s: 1.04 },
      { t: wd(3, "یخچال"), fx: 0.25, fy: 0.42, s: 1.55, ease: 0.8 },
      { t: wd(4, "این") - 0.1, fx: 0.6, fy: 0.33, s: 1.7, ease: 0.25 },
    ],
    extra: (T, p) => <Glow p={p} ix={0.1} iy={0.4} r={0.45} color="rgba(200,230,255,A)" a={0.12 + 0.04 * Math.sin(T * 9)} />,
  },
  { // ۴ · روز ۷: سؤال جدی از کبوتر، بعد سر پایین به صندل
    img: "v05/shot4.jpg", from: cut(5), to: cut(6), day: "روز ۷",
    keys: [
      { t: cut(5), fx: 0.5, fy: 0.25, s: 1.4 },
      { t: cut(5) + 0.02, fx: 0.42, fy: 0.3, s: 1.3, ease: 1.2 },
      { t: wd(5, "جدید") - 0.05, fx: 0.4, fy: 0.78, s: 1.55, ease: 0.35 },
    ],
  },
  { // ۵ · روز ۱۴: میز دانشمند، فشار آرام، ضربه روی «فکر»
    img: "v05/shot5.jpg", from: cut(6), to: cut(7), day: "روز ۱۴",
    keys: [
      { t: cut(6), fx: 0.5, fy: 0.5, s: 1.05 },
      { t: cut(6) + 0.02, fx: 0.45, fy: 0.33, s: 1.3, ease: 2.6 },
      { t: wd(6, "فکر") - 0.08, fx: 0.45, fy: 0.3, s: 1.45, ease: 0.2 },
    ],
    extra: (T, p) => <Glow p={p} ix={0.08} iy={0.33} r={0.3} color="rgba(255,200,120,A)" a={0.22 + 0.05 * Math.sin(T * 3)} />,
  },
  { // ۶ · روز ۲۱: از آسمان پایین به خنده‌ی جمع
    img: "v05/shot6.jpg", from: cut(7), to: cut(8), day: "روز ۲۱",
    keys: [
      { t: cut(7), fx: 0.6, fy: 0.12, s: 1.2 },
      { t: cut(7) + 0.02, fx: 0.48, fy: 0.38, s: 1.25, ease: 1.6 },
      { t: wd(7, "واقعی"), fx: 0.47, fy: 0.36, s: 1.4, ease: 1.2 },
    ],
    extra: (T, p) => <Glow p={p} ix={0.82} iy={0.05} r={0.5} color="rgba(255,205,130,A)" a={0.3 + 0.08 * Math.sin(T * 1.6)} />,
  },
  { // ۷ · روز ۳۰: از خورشید به لبخند آرام
    img: "v05/shot7.jpg", from: cut(8), to: cut(9), day: "روز ۳۰",
    keys: [
      { t: cut(8), fx: 0.25, fy: 0.22, s: 1.35 },
      { t: cut(8) + 0.02, fx: 0.72, fy: 0.3, s: 1.35, ease: 3.2 },
    ],
    extra: (T, p) => <Glow p={p} ix={0.21} iy={0.24} r={0.4} color="rgba(255,190,110,A)" a={0.35 + 0.08 * Math.sin(T * 1.3)} />,
  },
  { // ۸ · مودم روشن شد: شیرجه، بعد زوم سریع روی صورت روی «پنج ساعت»
    img: "v05/shot8.jpg", from: cut(9), to: TOTAL,
    keys: [
      { t: cut(9), fx: 0.75, fy: 0.22, s: 1.7 },
      { t: cut(9) + 0.35, fx: 0.55, fy: 0.42, s: 1.05, ease: 0.5 },
      { t: wd(10, "پنج") + 0.05, fx: 0.55, fy: 0.42, s: 1.15, ease: 0.6 },
      { t: wd(10, "ساعت") - 0.55, fx: 0.69, fy: 0.37, s: 1.95, ease: 0.22 },
    ],
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.81} iy={0.21} r={0.12} color="rgba(80,255,120,A)" a={0.55 + 0.3 * Math.abs(Math.sin(T * 11))} />
        <Glow p={p} ix={0.88} iy={0.57} r={0.22} color="rgba(170,210,255,A)" a={0.35 + 0.2 * Math.abs(Math.sin(T * 6))} />
      </>
    ),
  },
];

type Kind = "dissolve" | "glitch" | "whip" | "warm" | "green";
const KIND: Record<number, Kind> = { 1: "glitch", 2: "dissolve", 3: "whip", 4: "dissolve", 5: "warm", 6: "dissolve", 7: "green" };
const XLEN: Record<Kind, number> = { dissolve: 0.4, glitch: 0.2, whip: 0.24, warm: 0.4, green: 0.16 };

const ShotView: React.FC<{ d: ShotDef; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  const p = place(c.fx, c.fy, c.s, T, d.shake?.(T) ?? 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile(d.img)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

// reel-style captions; Kamran's lines in «», current word lit
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const chunks: { ws: Word[]; sp: string }[] = [];
  for (const sg of vo.segs) {
    const ws = vo.words.filter((w) => w.line === sg.n);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 7 || len > 32 || /([؟!]|\.\.\.)$/.test(w.w) || (/،$/.test(w.w) && cur.length >= 4) || i === ws.length - 1) { chunks.push({ ws: cur, sp: sg.sp }); cur = []; }
    });
  }
  const i = chunks.findIndex((c, k) => T >= c.ws[0].s - 0.06 && (k === chunks.length - 1 || T < chunks[k + 1].ws[0].s - 0.06));
  const c = chunks[i];
  if (!c || T > c.ws[c.ws.length - 1].e + 0.5) return null;
  const pop = easeOut(prog(T, c.ws[0].s - 0.06, c.ws[0].s + 0.1));
  const k = c.sp === "K";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: pop,
      transform: `translateY(${(1 - pop) * 14}px) scale(${0.96 + 0.04 * pop})` }}>
      <div style={{ maxWidth: 920, padding: "14px 30px 18px", borderRadius: 18, background: "rgba(10,10,10,0.58)", direction: "rtl", textAlign: "center",
        fontFamily: "V05Bold", fontSize: 58, lineHeight: 1.45, color: "#fff" }}>
        {k && <span style={{ color: "#7FD6C8" }}>« </span>}
        {c.ws.map((w, j) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return <span key={j} style={{ color: on ? "#FFD34D" : "rgba(255,255,255,0.93)" }}>{w.w.replace(/\.\.\./g, "…")}{j < c.ws.length - 1 ? " " : ""}</span>;
        })}
        {k && <span style={{ color: "#7FD6C8" }}> »</span>}
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
    <div style={{ position: "absolute", left: 0, right: 0, top: 230 - 40 * settle, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ transform: `translateY(${(1 - p) * -40}px) scale(${s})`, direction: "rtl", fontFamily: "V05Black", fontSize: 76, color: "#fff",
        padding: "8px 36px 14px", borderRadius: 18, background: "rgba(10,10,10,0.58)", borderBottom: "6px solid #FFD34D" }}>
        {d.day}
      </div>
    </div>
  );
};

// «پنج ساعت بعد…» stamp on the final punch
const Later: React.FC<{ T: number }> = ({ T }) => {
  const a = wd(10, "ساعت") - 0.5;
  if (T < a) return null;
  const p = easeOut(prog(T, a, a + 0.18));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `rotate(-4deg) scale(${1.6 - 0.6 * p})`, opacity: p, direction: "rtl", fontFamily: "V05Black", fontSize: 84, color: "#1a1a1a",
        padding: "6px 34px 14px", borderRadius: 14, background: "#FFD34D", boxShadow: "0 10px 40px rgba(0,0,0,0.45)" }}>
        ۵ ساعت بعد…
      </div>
    </div>
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
    // whip: outgoing flies left, incoming comes in from the right, blurred along the move
    if (KIND[i] === "whip" && T < d.from + xin / 2) {
      const q = prog(T, d.from - xin / 2, d.from + xin / 2);
      style = { transform: `translateX(${(1 - easeOut(q)) * 700}px)`, filter: `blur(${(1 - q) * 18}px)` };
      op = 1;
    }
    if (KIND[i + 1] === "whip" && T > d.to - xout / 2) {
      const q = prog(T, d.to - xout / 2, d.to + xout / 2);
      style = { transform: `translateX(${-easeOut(q) * 700}px)`, filter: `blur(${q * 18}px)` };
    }
    if (op <= 0) return;
    layers.push(<AbsoluteFill key={i} style={{ opacity: op, ...style }}><ShotView d={d} T={T} /></AbsoluteFill>);
  });
  // accents
  const g = cut(2); // internet cut: RGB split + scanlines + dark blink
  const gl = T > g - 0.18 && T < g + 0.22 ? 1 - Math.abs(T - g) / 0.22 : 0;
  const w5 = cut(7);
  const warm = T > w5 - 0.3 && T < w5 + 0.4 ? (T < w5 ? prog(T, w5 - 0.3, w5) : 1 - prog(T, w5, w5 + 0.4)) : 0;
  const g8 = cut(9); // router back on: green flash
  const green = T > g8 - 0.1 && T < g8 + 0.35 ? (T < g8 ? prog(T, g8 - 0.1, g8) : 1 - prog(T, g8, g8 + 0.35)) : 0;
  const punch = wd(10, "ساعت") - 0.55; // final zoom: a short shake
  const sh = T > punch + 0.18 && T < punch + 0.5 ? (1 - prog(T, punch + 0.18, punch + 0.5)) * 10 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: sh ? `translate(${Math.sin(T * 90) * sh}px, ${Math.cos(T * 77) * sh}px)` : undefined,
        filter: gl ? `contrast(${1 + gl * 0.4}) saturate(${1 - gl * 0.7}) hue-rotate(${gl * 40}deg)` : undefined }}>
        {layers}
      </AbsoluteFill>
      {gl > 0 && <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,${0.35 * gl}) 0 3px, transparent 3px 7px)` }} />}
      {gl > 0 && <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(255,0,60,${0.18 * gl}), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,200,255,${0.18 * gl}))`, mixBlendMode: "screen" }} />}
      {warm > 0 && <AbsoluteFill style={{ background: `rgba(255,200,120,${warm * 0.45})`, mixBlendMode: "screen" }} />}
      {green > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 25%, rgba(120,255,150,${green * 0.7}) 0%, rgba(40,200,90,${green * 0.3}) 45%, rgba(0,0,0,0) 85%)`, mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <DayBadge T={T} />
      <Later T={T} />
      <Captions T={T} />
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

const LOOK = [0.03, 2.5, cut(2) + 0.02, 4.6, 6.3, 7.4, 9.0, 11.0, cut(5), 12.6, 14.2, 15.5, 18.0, 19.5, 22.0, 24.5, 25.6, 28.5, 29.8, 31.2];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V05: React.FC = () => (
  <>
    <Composition id="V05" component={Video} durationInFrames={V05_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v05/mix.wav" }} />
    <Composition id="V05-Silent" component={Video} durationInFrames={V05_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V05-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
