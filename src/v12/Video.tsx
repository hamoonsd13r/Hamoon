// V12 · «اسنپ از کجا می‌دونه کجایی؟» — اکسپلینر علمی عمودی، سبک تازه‌ی «نقشه‌ی شب» (تماماً کد: SVG + React).
// هر جمله یک صحنه با انیمیشن خودش؛ ترنزیشن هر کات فرق دارد؛ چیپ فصل + نوار پیشرفت بالا؛ زیرنویس کلمه‌به‌کلمه.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { C, Defs, FONT, FPS, H, W, easeInOut, easeOut, fa, pop, prog, segEnd, segStart, wd, words } from "./kit";
import { S0, S1, S2, S3, S4, S5, S6 } from "./scenes1";
import { S7, S8, S9, S10, S11, S12, S13 } from "./scenes2";

const END0 = segEnd(13) + 0.35;
const TOTAL = END0 + 2.6;
export const V12_FRAMES = Math.round(TOTAL * FPS);

const fontHandle = typeof document !== "undefined" ? delayRender("v12 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V12Black", "fonts/Vazirmatn-Black.ttf"], ["V12Bold", "fonts/Vazirmatn-Bold.ttf"], ["V12Num", "fonts/ChakraPetch-Bold.ttf"], ["V12Latin", "fonts/ChakraPetch-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

type SceneC = React.FC<{ T: number; t0: number }>;
const SCENES: SceneC[] = [S0 as SceneC, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];
const CUT = SCENES.map((_, i) => (i === 0 ? 0 : segStart(i) - 0.15));
const endOf = (i: number) => (i < SCENES.length - 1 ? CUT[i + 1] : TOTAL);
const CHAPTER = ["", "ماهواره‌ها", "فقط گیرنده", "سرعت نور", "سه دایره", "ساعت دقیق", "نسبیت", "برج‌ها", "وای‌فای و دکل", "چسبیدن به خیابون", "انتخاب راننده", "مسیریابی", "قیمت", "جمع‌بندی"];

type Kind = "zoom" | "whip" | "slide" | "iris" | "glitch" | "flash" | "whipV";
const KIND: Kind[] = ["zoom", "zoom", "whip", "slide", "iris", "glitch", "flash", "whipV", "iris", "zoom", "whip", "glitch", "slide", "flash"];
const XLEN: Record<Kind, number> = { zoom: 0.45, whip: 0.3, slide: 0.45, iris: 0.5, glitch: 0.22, flash: 0.3, whipV: 0.3 };

const Layer: React.FC<{ i: number; T: number; style?: React.CSSProperties }> = ({ i, T, style }) => {
  const S = SCENES[i];
  return <AbsoluteFill style={{ overflow: "hidden", ...style }}><S T={T} t0={CUT[i]} /></AbsoluteFill>;
};

const Scenes: React.FC<{ T: number; only?: number }> = ({ T, only }) => {
  if (only !== undefined) return <Layer i={only} T={T} />;
  const out: React.ReactNode[] = [];
  SCENES.forEach((_, i) => {
    const xin = i ? XLEN[KIND[i]] : 0;
    const xout = i < SCENES.length - 1 ? XLEN[KIND[i + 1]] : 0;
    const a = CUT[i] - xin / 2, b = endOf(i) + xout / 2;
    if (T < a || T >= b) return;
    let st: React.CSSProperties = {};
    // incoming
    if (i && T < CUT[i] + xin / 2) {
      const q = easeOut(prog(T, a, CUT[i] + xin / 2));
      const k = KIND[i];
      if (k === "zoom") st = { transform: `scale(${1.6 - 0.6 * q})`, opacity: q, filter: `blur(${(1 - q) * 14}px)` };
      if (k === "whip") st = { transform: `translateX(${(1 - q) * -W}px)`, filter: `blur(${(1 - q) * 22}px)` };
      if (k === "whipV") st = { transform: `translateY(${(1 - q) * H}px)`, filter: `blur(${(1 - q) * 22}px)` };
      if (k === "slide") st = { transform: `translateY(${(1 - q) * 500}px)`, opacity: q };
      if (k === "iris") st = { clipPath: `circle(${q * 120}% at 50% 40%)` };
      if (k === "glitch") st = { opacity: T < CUT[i] ? 0 : 1, transform: `translateX(${Math.sin(T * 200) * 30 * (1 - q)}px)`, filter: `hue-rotate(${(1 - q) * 90}deg) contrast(${1 + (1 - q) * 0.8})` };
      if (k === "flash") st = { opacity: T < CUT[i] ? 0 : 1 };
    }
    // outgoing
    if (i < SCENES.length - 1 && T > endOf(i) - xout / 2) {
      const q = easeInOut(prog(T, endOf(i) - xout / 2, b));
      const k = KIND[i + 1];
      if (k === "zoom") st = { transform: `scale(${1 - 0.25 * q})`, opacity: 1 - q };
      if (k === "whip") st = { transform: `translateX(${q * W}px)`, filter: `blur(${q * 22}px)` };
      if (k === "whipV") st = { transform: `translateY(${-q * H}px)`, filter: `blur(${q * 22}px)` };
      if (k === "slide") st = { transform: `translateY(${-q * 300}px)`, opacity: 1 - q };
      if (k === "glitch") st = { opacity: T >= endOf(i) ? 0 : 1, transform: `translateX(${Math.sin(T * 230) * 30 * q}px)`, filter: `hue-rotate(${q * -90}deg) saturate(${1 + q * 2})` };
      if (k === "flash") st = { opacity: T >= endOf(i) ? 0 : 1 };
    }
    out.push(<Layer key={i} i={i} T={T} style={st} />);
  });
  // accents for glitch / flash cuts
  const acc: React.ReactNode[] = [];
  SCENES.forEach((_, i) => {
    if (!i) return;
    const k = KIND[i], c = CUT[i], d = XLEN[k];
    if (Math.abs(T - c) > d / 2) return;
    const q = 1 - Math.abs(T - c) / (d / 2);
    if (k === "flash") acc.push(<AbsoluteFill key={`f${i}`} style={{ background: `rgba(234,242,255,${0.75 * q})` }} />);
    if (k === "glitch") acc.push(<AbsoluteFill key={`g${i}`} style={{ background: `repeating-linear-gradient(0deg, rgba(0,0,0,${0.4 * q}) 0 4px, transparent 4px 9px)` }} />);
  });
  return <>{out}{acc}</>;
};

// headline over the hook (from frame 0)
const Headline: React.FC<{ T: number }> = ({ T }) => {
  const z0 = wd(0, "جوابش");
  if (T > z0 + 0.3) return null;
  const a = easeOut(prog(T, -0.15, 0.15));
  const out = prog(T, z0 - 0.1, z0 + 0.3);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 1 - out, direction: "rtl",
      transform: `translateY(${-out * 60}px)` }}>
      <div style={{ transform: `scale(${1.25 - 0.25 * a})`, fontFamily: FONT.black, fontSize: 92, color: C.ink, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
        اسنپ از کجا <span style={{ color: C.lime }}>می‌دونه</span>
      </div>
      <div style={{ fontFamily: FONT.black, fontSize: 92, color: C.ink, textShadow: "0 6px 30px rgba(0,0,0,0.8)", opacity: a }}>کجایی؟ 📍</div>
    </div>
  );
};

// chapter chip + progress bar
const Chapter: React.FC<{ T: number; num?: number; p01?: number }> = ({ T, num, p01 }) => {
  const i = SCENES.findIndex((_, k) => T >= CUT[k] && T < endOf(k));
  if (i <= 0 || T > END0) return null;
  const p = pop(T, CUT[i] + 0.1, 0.4);
  const prog01 = p01 ?? (T - CUT[1]) / (END0 - CUT[1]);
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 64, height: 8, borderRadius: 4, background: "rgba(94,168,255,0.2)" }}>
        <div style={{ width: `${Math.min(100, prog01 * 100)}%`, height: "100%", borderRadius: 4, background: C.lime, marginRight: 0, marginLeft: "auto" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 100, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${p})`, direction: "rtl", display: "flex", alignItems: "center", gap: 14, padding: "8px 28px 12px", borderRadius: 999,
          background: "rgba(10,18,45,0.85)", border: `2px solid ${C.streetHi}` }}>
          <span style={{ fontFamily: FONT.black, fontSize: 40, color: C.lime }}>{fa(num ?? i)}</span>
          <span style={{ fontFamily: FONT.bold, fontSize: 38, color: C.ink }}>{CHAPTER[i]}</span>
        </div>
      </div>
    </>
  );
};

// word-by-word captions
type Chunk = { ws: typeof words };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (let si = 0; si < SCENES.length; si++) {
    const ws = words.filter((w) => w.si === si);
    let cur: typeof words = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 6 || len > 27 || /[؟!…؛:.]$/.test(w.w) || (/،$/.test(w.w) && cur.length >= 3) || i === ws.length - 1) { out.push({ ws: cur }); cur = []; }
    });
  }
  return out;
})();
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const i = CHUNKS.findIndex((c, k) => T >= c.ws[0].s - 0.06 && (k === CHUNKS.length - 1 || T < CHUNKS[k + 1].ws[0].s - 0.06));
  const c = CHUNKS[i];
  if (!c || T > c.ws[c.ws.length - 1].e + 0.4) return null;
  const a = easeOut(prog(T, c.ws[0].s - 0.06, c.ws[0].s + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
      <div style={{ maxWidth: 960, padding: "12px 32px 18px", borderRadius: 22, background: "rgba(6,10,23,0.78)", border: "2px solid rgba(94,168,255,0.35)", direction: "rtl",
        textAlign: "center", fontFamily: FONT.bold, fontSize: 60, lineHeight: 1.45, color: C.ink }}>
        {c.ws.map((w, j) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return <span key={j} style={{ color: on ? C.lime : "rgba(234,242,255,0.94)" }}>{w.w}{j < c.ws.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < END0) return null;
  const p = easeOut(prog(T, END0, END0 + 0.3));
  const q = easeOut(prog(T, END0 + 0.25, END0 + 0.55));
  const bob = Math.sin((T - END0) * 7) * 10;
  return (
    <>
      <AbsoluteFill style={{ background: `rgba(6,10,23,${0.7 * p})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 34, direction: "rtl" }}>
        <div style={{ opacity: p, transform: `scale(${1.3 - 0.3 * p})`, fontFamily: FONT.black, fontSize: 74, color: C.ink, textAlign: "center", lineHeight: 1.5 }}>
          قسمت بعد<br />کدوم اپ رو <span style={{ color: C.lime }}>باز کنیم؟</span>
        </div>
        <div style={{ opacity: q, transform: `translateY(${(1 - q) * 30}px)`, display: "flex", alignItems: "center", gap: 18, padding: "14px 44px 20px", borderRadius: 999, background: C.lime }}>
          <span style={{ fontFamily: FONT.black, fontSize: 66, color: C.bg }}>کامنت کن</span>
        </div>
        <div style={{ opacity: q, transform: `translateY(${bob}px)`, fontSize: 96 }}>👇</div>
      </div>
    </>
  );
};

const Frame: React.FC<{ T: number; only?: number; num?: number; p01?: number }> = ({ T, only, num, p01 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${C.bg2} 0%, ${C.bg} 70%)` }}>
    <svg width={0} height={0} style={{ position: "absolute" }}><Defs /></svg>
    <Scenes T={T} only={only} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.45) 100%)" }} />
    <Headline T={T} />
    <Chapter T={T} num={num} p01={p01} />
    <Captions T={T} />
    <EndCard T={T} />
  </AbsoluteFill>
);

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

// one or two frames per scene + every cut
const LOOK = [0.03, 2.4, 4.6, 6.2, ...SCENES.slice(1).flatMap((_, k) => { const i = k + 1; return [CUT[i] + 0.9, (CUT[i] + endOf(i)) / 2 + 1.2, endOf(i) - 0.4]; }), END0 + 1];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

// ───── 60-second cut: the same scenes, played back to back with fresh cuts between them ─────
const SHORT_SEL = [0, 1, 4, 6, 8, 9, 13];
const SHORT_WIN = SHORT_SEL.map((i) => ({ i, a: i ? segStart(i) - 0.1 : 0, b: i === 13 ? TOTAL : segEnd(i) + 0.3 }));
const SHORT_AT = SHORT_WIN.reduce<number[]>((acc, w, k) => [...acc, (acc[k] ?? 0) + (w.b - w.a)], [0]);
export const V12S_TOTAL = SHORT_AT.at(-1)!;
export const V12S_WINDOWS = SHORT_WIN.map((w, k) => ({ ...w, at: SHORT_AT[k] }));
const SKIND: Kind[] = ["zoom", "whip", "iris", "flash", "glitch", "whipV", "zoom"];
const ShortVideo: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const ts = t ?? f / FPS;
  let k = SHORT_AT.findIndex((x, j) => j < SHORT_WIN.length && ts >= x && ts < SHORT_AT[j + 1]);
  if (k < 0) k = SHORT_WIN.length - 1;
  const w = SHORT_WIN[k];
  const T = w.a + (ts - SHORT_AT[k]);
  const local = ts - SHORT_AT[k];
  const kind = SKIND[k];
  const q = k ? easeOut(prog(local, 0, 0.32)) : 1;
  let st: React.CSSProperties = {};
  if (k && q < 1) {
    if (kind === "zoom") st = { transform: `scale(${1.5 - 0.5 * q})`, filter: `blur(${(1 - q) * 14}px)` };
    if (kind === "whip") st = { transform: `translateX(${(1 - q) * -W}px)`, filter: `blur(${(1 - q) * 22}px)` };
    if (kind === "whipV") st = { transform: `translateY(${(1 - q) * H}px)`, filter: `blur(${(1 - q) * 22}px)` };
    if (kind === "iris") st = { clipPath: `circle(${q * 120}% at 50% 40%)` };
    if (kind === "glitch") st = { transform: `translateX(${Math.sin(local * 200) * 30 * (1 - q)}px)`, filter: `hue-rotate(${(1 - q) * 90}deg) contrast(${1 + (1 - q) * 0.8})` };
  }
  const flash = k && kind === "flash" ? Math.max(0, 1 - local / 0.25) : 0;
  const num = w.i ? SHORT_SEL.indexOf(w.i) : 0;
  const p01 = clamp01((ts - SHORT_AT[1]) / (SHORT_AT.at(-1)! - 2.95 - SHORT_AT[1]));
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={st}><Frame T={T} only={w.i} num={num} p01={p01} /></AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{ background: `rgba(234,242,255,${0.75 * flash})` }} />}
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const SLOOK = [0.03, 3.5, ...SHORT_AT.slice(1, -1).flatMap((x) => [x + 0.15, x + 3.5]), V12S_TOTAL - 1];
const ShortLook: React.FC<{ times: number[] }> = ({ times }) => <ShortVideo t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V12: React.FC = () => (
  <>
    <Composition id="V12" component={Video} durationInFrames={V12_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v12/mix.wav" }} />
    <Composition id="V12-Silent" component={Video} durationInFrames={V12_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V12-60" component={ShortVideo} durationInFrames={Math.round(V12S_TOTAL * FPS)} fps={FPS} width={W} height={H} defaultProps={{ audio: "v12/mix60.wav" }} />
    <Composition id="V12-60-Silent" component={ShortVideo} durationInFrames={Math.round(V12S_TOTAL * FPS)} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V12-60-Look" component={ShortLook} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: SLOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
    <Composition id="V12-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
