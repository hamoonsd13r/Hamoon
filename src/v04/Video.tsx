// V04 · «فقط رفتم نون بخرم!» — ۸ عکس واقع‌گرای کاربر، دوربین روی عکس + دیزالو + زیرنویس کادردار (مرجع: ریلز Amo farang)
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";

type Word = { w: string; s: number; e: number; line: number };
type VO = { total: number; segs: { n: number; sp: string; start: number; end: number }[]; words: Word[] };
const vo = voJson as VO;

const FPS = 30;
const W = 1080;
const H = 1920;
const TOTAL = 31.6; // ۰.۹ ثانیه بعد از آخرین کلمه: کات به ماموت گرسنه
export const V04_FRAMES = Math.round(TOTAL * FPS);
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v04 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V04Black", "fonts/Vazirmatn-Black.ttf"], ["V04Bold", "fonts/Vazirmatn-Bold.ttf"]].map(([f, u]) =>
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

// camera keyframe: focus point on the image (0..1) + zoom; ease = time to arrive (fast arrive, soft land)
type Key = { t: number; fx: number; fy: number; s: number; ease?: number };
const camAt = (keys: Key[], T: number) => {
  let cur = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (T < k.t) break;
    const d = k.ease ?? 0.6;
    const p = easeOut(prog(T, k.t, k.t + d));
    cur = { t: k.t, fx: cur.fx + (k.fx - cur.fx) * p, fy: cur.fy + (k.fy - cur.fy) * p, s: cur.s + (k.s - cur.s) * p };
  }
  return cur;
};

// one still on screen: cover-fit, focus clamped so the edges never show
const Still: React.FC<{ src: string; fx: number; fy: number; s: number; rot?: number; T: number }> = ({ src, fx, fy, s, rot = 0, T }) => {
  const dw = W * s;
  const dh = (W / IMG_AR) * s;
  // handheld drift: a few pixels, never still
  const hx = Math.sin(T * 0.9) * 4 + Math.sin(T * 2.3) * 2;
  const hy = Math.cos(T * 0.7) * 4 + Math.sin(T * 1.9) * 2;
  const x = clamp(W / 2 - fx * dw + hx, W - dw, 0);
  const y = clamp(H / 2 - fy * dh + hy, H - dh, 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: rot ? `rotate(${rot}deg) scale(${1 + Math.abs(rot) / 22})` : undefined }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: x, top: y, width: dw, height: dh, maxWidth: "none", maxHeight: "none" }} />
    </AbsoluteFill>
  );
};

// shot table: picture + camera path (times from vo.json)
type ShotDef = { img: string; from: number; to: number; keys: Key[]; extra?: (T: number) => React.ReactNode; rot?: (T: number) => number };
const cut = (n: number) => seg(n).start - 0.15; // shot n starts just before its line

const SHOTS: ShotDef[] = [
  { // ۱ · ماموت: هجوم به صورت، بعد سر بالا به ماموت
    img: "v04/shot1.jpg", from: 0, to: cut(2),
    keys: [
      { t: 0, fx: 0.5, fy: 0.5, s: 1.0 },
      { t: 0.05, fx: 0.5, fy: 0.5, s: 1.55, ease: 0.55 },
      { t: wd(1, "ماموته") - 0.1, fx: 0.5, fy: 0.3, s: 1.18, ease: 0.7 },
      { t: wd(1, "چیکار"), fx: 0.5, fy: 0.36, s: 1.28, ease: 1.2 },
    ],
  },
  { // ۲ · کوچه: تعقیب از پشت، بعد شکاف می‌کشدش
    img: "v04/shot2.jpg", from: cut(2), to: cut(3),
    keys: [
      { t: cut(2), fx: 0.45, fy: 0.55, s: 1.08 },
      { t: cut(2) + 0.1, fx: 0.55, fy: 0.5, s: 1.25, ease: 2.0 },
      { t: wd(2, "شروع"), fx: 0.68, fy: 0.42, s: 1.9, ease: 0.9 },
    ],
    rot: (T) => -14 * easeInOut(prog(T, wd(2, "شروع") + 0.2, cut(3))),
    extra: (T) => <RiftGlow T={T} />,
  },
  { // ۳ · فرود در دره: باز، بعد نزدیک به واکنش انسان‌های اولیه
    img: "v04/shot3.jpg", from: cut(3), to: cut(4),
    keys: [
      { t: cut(3), fx: 0.5, fy: 0.55, s: 1.0 },
      { t: wd(3, "سنگکی") - 0.15, fx: 0.5, fy: 0.42, s: 1.4, ease: 0.7 },
    ],
  },
  { // ۴ · رئیس قبیله: از پایین به بالا، بعد کات سریع به صورت کامران
    img: "v04/shot4.jpg", from: cut(4), to: cut(5),
    keys: [
      { t: cut(4), fx: 0.42, fy: 0.7, s: 1.35 },
      { t: cut(4) + 0.05, fx: 0.4, fy: 0.3, s: 1.3, ease: 1.1 },
      { t: wd(4, "نون") - 0.12, fx: 0.67, fy: 0.5, s: 1.85, ease: 0.18 },
    ],
  },
  { // ۵ · نان سوخته: از نان به قیافه‌ی کامران
    img: "v04/shot5.jpg", from: cut(5), to: cut(6),
    keys: [
      { t: cut(5), fx: 0.6, fy: 0.66, s: 1.6 },
      { t: wd(5, "داداش") - 0.1, fx: 0.74, fy: 0.27, s: 1.65, ease: 0.45 },
      { t: wd(5, "افتضاحه") - 0.05, fx: 0.74, fy: 0.25, s: 1.9, ease: 0.15 },
    ],
  },
  { // ۶ · استادکار: نمای متوسط، ضربه روی «ایرانی»
    img: "v04/shot6.jpg", from: cut(6), to: cut(7),
    keys: [
      { t: cut(6), fx: 0.5, fy: 0.5, s: 1.08 },
      { t: cut(6) + 0.05, fx: 0.5, fy: 0.45, s: 1.2, ease: 1.2 },
      { t: wd(6, "ایرانی") - 0.08, fx: 0.52, fy: 0.42, s: 1.42, ease: 0.2 },
    ],
  },
  { // ۷ · اولین سنگک تاریخ: نمای نزدیک نان، بعد باز شدن قهرمانانه
    img: "v04/shot7.jpg", from: cut(7), to: cut(8),
    keys: [
      { t: cut(7), fx: 0.53, fy: 0.42, s: 1.75 },
      { t: wd(7, "اولین") - 0.1, fx: 0.52, fy: 0.45, s: 1.12, ease: 1.4 },
    ],
    extra: (T) => <SunFlare T={T} />,
  },
  { // ۸ · گاز زدن: جلو رفتن آرام به لبخند
    img: "v04/shot8.jpg", from: cut(8), to: seg(8).end + 0.25,
    keys: [
      { t: cut(8), fx: 0.45, fy: 0.55, s: 1.05 },
      { t: cut(8) + 0.05, fx: 0.3, fy: 0.47, s: 1.5, ease: 3.2 },
    ],
  },
  { // پایان · کات سریع به ماموت گرسنه
    img: "v04/shot8.jpg", from: seg(8).end + 0.25, to: TOTAL,
    keys: [
      { t: seg(8).end + 0.25, fx: 0.68, fy: 0.43, s: 2.3 },
      { t: seg(8).end + 0.3, fx: 0.68, fy: 0.44, s: 2.05, ease: 0.9 },
    ],
  },
];

// transitions: index of the incoming shot → kind
const XF = 0.4; // dissolve length (like the reference)
const KIND: Record<number, "dissolve" | "rewind" | "rift" | "cut" | "warm"> = { 1: "rewind", 2: "rift", 3: "dissolve", 4: "dissolve", 5: "dissolve", 6: "warm", 7: "dissolve", 8: "cut" };

const RiftGlow: React.FC<{ T: number }> = ({ T }) => {
  const pulse = 0.55 + 0.25 * Math.sin(T * 7) + 0.6 * easeInOut(prog(T, wd(2, "شروع"), cut(3)));
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none",
      background: `radial-gradient(circle at 68% 42%, rgba(90,170,255,${0.45 * pulse}) 0%, rgba(40,110,255,${0.18 * pulse}) 22%, rgba(0,0,0,0) 48%)` }} />
  );
};

const SunFlare: React.FC<{ T: number }> = ({ T }) => {
  const a = 0.35 + 0.12 * Math.sin(T * 1.7) + 0.25 * easeOut(prog(T, wd(7, "اولین"), wd(7, "اولین") + 0.8));
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none",
      background: `radial-gradient(ellipse at 92% 4%, rgba(255,214,140,${a}) 0%, rgba(255,170,80,${a * 0.35}) 25%, rgba(0,0,0,0) 55%)` }} />
  );
};

const ShotView: React.FC<{ d: ShotDef; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  return (
    <AbsoluteFill>
      <Still src={d.img} fx={c.fx} fy={c.fy} s={c.s} rot={d.rot?.(T)} T={T} />
      {d.extra?.(T)}
    </AbsoluteFill>
  );
};

// reel-style captions: centred, dark translucent box, 2 lines max, current word lit
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const chunks: Word[][] = [];
  for (const sg of vo.segs) {
    const ws = vo.words.filter((w) => w.line === sg.n);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 7 || len > 32 || /([؟!]|\.\.\.)$/.test(w.w) || i === ws.length - 1) { chunks.push(cur); cur = []; }
    });
  }
  const i = chunks.findIndex((c, k) => T >= c[0].s - 0.06 && (k === chunks.length - 1 || T < chunks[k + 1][0].s - 0.06));
  const c = chunks[i];
  if (!c || T > c[c.length - 1].e + 0.5) return null;
  const pop = easeOut(prog(T, c[0].s - 0.06, c[0].s + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: pop,
      transform: `translateY(${(1 - pop) * 14}px) scale(${0.96 + 0.04 * pop})` }}>
      <div style={{ maxWidth: 920, padding: "14px 30px 18px", borderRadius: 18, background: "rgba(10,10,10,0.58)", direction: "rtl", textAlign: "center",
        fontFamily: "V04Bold", fontSize: 58, lineHeight: 1.45, color: "#fff" }}>
        {c.map((w, k) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return <span key={k} style={{ color: on ? "#FFD34D" : "rgba(255,255,255,0.93)" }}>{w.w.replace(/\.\.\./g, "…")}{k < c.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

// «سه دقیقه قبل» stamp over the rewind into shot 2
const Rewind: React.FC<{ T: number }> = ({ T }) => {
  const a = cut(2);
  const p = prog(T, a - 0.05, a + 0.25);
  const out = prog(T, a + 1.6, a + 1.9);
  if (T < a - 0.05 || T > a + 1.9) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", direction: "rtl", opacity: easeOut(p) * (1 - out) }}>
      <span style={{ fontFamily: "V04Black", fontSize: 76, color: "#fff", padding: "10px 34px", borderRadius: 16, background: "rgba(10,10,10,0.55)",
        display: "inline-block", transform: `scale(${1.25 - 0.25 * easeOut(p)})`, letterSpacing: 0 }}>
        ⏪ سه دقیقه قبل
      </span>
    </div>
  );
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const layers: React.ReactNode[] = [];
  const xlen = (i: number) => (i === 0 || i >= SHOTS.length || KIND[i] === "cut" ? 0 : KIND[i] === "rewind" ? 0.25 : KIND[i] === "rift" ? 0.3 : XF);
  SHOTS.forEach((d, i) => {
    const xin = xlen(i);
    if (T < d.from - xin / 2 || T >= d.to + xlen(i + 1) / 2) return;
    const op = xin ? easeInOut(prog(T, d.from - xin / 2, d.from + xin / 2)) : 1;
    if (op <= 0) return;
    layers.push(<AbsoluteFill key={i} style={{ opacity: op }}><ShotView d={d} T={T} /></AbsoluteFill>);
  });
  // transition accents
  const r = cut(2);
  const rw = T > r - 0.2 && T < r + 0.25 ? 1 - Math.abs(T - r) / 0.25 : 0; // rewind: RGB split + white tick
  const rf = cut(3);
  const blue = T > rf - 0.25 && T < rf + 0.35 ? (T < rf ? prog(T, rf - 0.25, rf) : 1 - prog(T, rf, rf + 0.35)) : 0;
  const shake = T > rf && T < rf + 0.45 ? (1 - prog(T, rf, rf + 0.45)) * 14 : 0;
  const w6 = cut(7);
  const warm = T > w6 - 0.3 && T < w6 + 0.4 ? (T < w6 ? prog(T, w6 - 0.3, w6) : 1 - prog(T, w6, w6 + 0.4)) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: shake ? `translate(${Math.sin(T * 90) * shake}px, ${Math.cos(T * 77) * shake}px)` : undefined,
        filter: rw ? `contrast(${1 + rw * 0.25}) saturate(${1 - rw * 0.6})` : undefined }}>
        {layers}
      </AbsoluteFill>
      {rw > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${rw * 0.35})`, mixBlendMode: "screen" }} />}
      {rw > 0 && <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,${0.25 * rw}) 0 3px, transparent 3px 7px)` }} />}
      {blue > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 60% 45%, rgba(170,215,255,${blue * 0.95}) 0%, rgba(60,130,255,${blue * 0.6}) 40%, rgba(10,30,90,${blue * 0.4}) 100%)` }} />}
      {warm > 0 && <AbsoluteFill style={{ background: `rgba(255,200,120,${warm * 0.45})`, mixBlendMode: "screen" }} />}
      {/* vignette + light grade, the same over every shot */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      <Rewind T={T} />
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

const LOOK = [0.02, 0.6, 3.9, cut(2) + 0.02, 6.6, cut(3) - 0.05, 9.5, 11.6, 13.1, 15.2, 17.0, 19.9, 22.3, 24.0, 26.5, 29.4, 30.9, 31.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V04: React.FC = () => (
  <>
    <Composition id="V04" component={Video} durationInFrames={V04_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v04/mix.wav" }} />
    <Composition id="V04-Silent" component={Video} durationInFrames={V04_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V04-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
