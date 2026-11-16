// V55 · «هیچ‌وقت شب سمت بستنی‌فروشی ندو» — Persian version (with the creator's permission, credit in the caption) of
// Unlucky Guy's "Never Run To The Ice Cream Truck At Night", built from the user's 20 Google Flow stills
// (uploads/v55 → public/v55/img, 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v55-voice.py →
// public/v55/vo.wav + src/v55/vo.json). Every still gets its own camera move; the countdown (۶۰ … ۵ and the final
// ۱۰ → ۱) is drawn in code. One- or two-word captions, key words in red (same look as V54).
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import vo from "./vo.json";

const FPS = 30;
type VO = { total: number; segs: { n: number; start: number; end: number; text: string }[]; words: { w: string; s: number; e: number; line: number }[] };
const V = vo as VO;
export const bare = (x: string) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
export const S = (n: number) => V.segs.find((s) => s.n === n)!.start;
export const E = (n: number) => V.segs.find((s) => s.n === n)!.end;
export const wd = (l: number, w: string, occ = 1) => {
  const ws = V.words.filter((x) => x.line === l);
  const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1];
  if (!h) throw new Error("v55 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v55 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H55Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · camera zoom [a,b] · focus from [x,y] to [x,y] · flicker (streetlights dying) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; flicker?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const CD_START = wd(37, "ده");           // the final countdown ۱۰ → ۱ starts on «ده ثانیه»
export const END = +(CD_START + 10.3).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "flicker">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.18], f: [0.5, 0.55], f2: [0.58, 0.6] }],                      // L1 the music at night
  ["02", cut(S(2)), { z: [1.04, 1.12], f: [0.5, 0.55] }],                               // L2 sixty seconds to get inside
  ["03", cut(S(3)), { z: [1.0, 1.14], f: [0.42, 0.42] }],                               // L3 who drives it
  ["04", cut(S(4)), { z: [1.08, 1.18], f: [0.6, 0.35], f2: [0.6, 0.65] }],               // L4 the missing kids
  ["01", cut(S(5)), { z: [1.35, 1.5], f: [0.6, 0.6] }],                                 // L5 tonight the music started
  ["05", cut(S(6)), { z: [1.15, 1.22], f: [0.32, 0.5] }],                               // L6 little Tiam still outside
  ["05", cut(S(7)), { z: [1.2, 1.3], f: [0.45, 0.5], f2: [0.8, 0.5] }],                 // L7 ran straight to it
  ["06", cut(S(8)), { z: [1.0, 1.12], f: [0.38, 0.45] }],                               // L8 only Elena saw
  ["07", cut(S(9)), { z: [1.05, 1.0], f: [0.5, 0.5] }],                                 // L9 every door slammed
  ["08", cut(S(10)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                                // L10 Elena runs outside
  ["09", cut(S(11)), { z: [1.12, 1.22], f: [0.5, 0.55], flicker: true }],               // L11–12 ۵۰ streetlights die
  ["10", cut(S(13)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                               // L13–14 ۴۰ backyards
  ["11", cut(S(15)), { z: [1.15, 1.22], f: [0.3, 0.55] }],                              // L15–16 ۳۰ the corner
  ["11", cut(S(17)), { z: [1.22, 1.3], f: [0.45, 0.5], f2: [0.75, 0.45] }],             // L17 the truck turns in
  ["12", cut(S(18)), { z: [1.0, 1.15], f: [0.35, 0.55] }],                              // L18 nobody driving
  ["13", cut(S(19)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                                // L19–20 ۲۰ they run
  ["13", cut(S(21)), { z: [1.3, 1.45], f: [0.72, 0.45] }],                              // L21 the music louder behind
  ["14", cut(S(22)), { z: [1.06, 1.14], f: [0.5, 0.5] }],                               // L22–23 ۱۱ the window opens
  ["14", cut(S(24)), { z: [1.5, 1.7], f: [0.47, 0.68] }],                               // L24 the long grey hand
  ["15", cut(S(25)), { z: [1.18, 1.26], f: [0.6, 0.55] }],                              // L25 it grabs the hood
  ["16", cut(S(26)), { z: [1.08, 1.14], f: [0.4, 0.45], f2: [0.6, 0.55] }],             // L26–27 the hoodie slips off
  ["17", cut(S(28)), { z: [1.06, 1.12], f: [0.45, 0.5] }],                              // L28–29 ۵ they dive inside
  ["17", cut(wd(30, "بست")), { z: [1.35, 1.4], f: [0.62, 0.45] }],                      // L30 mom slams the door
  ["18", cut(S(31)), { z: [1.0, 1.12], f: [0.6, 0.55] }],                               // L31–32 the music stops outside
  ["19", cut(S(33)), { z: [1.0, 1.1], f: [0.62, 0.5] }],                                // L33–34 silence
  ["20", cut(S(35)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                                // L35–36 the music again
  ["20", cut(S(37)), { z: [1.08, 1.45], f: [0.5, 0.5], f2: [0.55, 0.45] }],             // L37–38 + countdown ۱۰ → ۱
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── countdown numbers (Persian digits): one pop per beat in the story, then ۱۰ → ۱ */
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const COUNT: { t: number; n: number; d: number }[] = [
  { t: wd(2, "شصت"), n: 60, d: 1.6 }, { t: S(11), n: 50, d: 1.2 }, { t: S(13), n: 40, d: 1.2 }, { t: S(15), n: 30, d: 1.2 },
  { t: S(19), n: 20, d: 1.2 }, { t: S(22), n: 11, d: 1.2 }, { t: S(28), n: 5, d: 1.2 },
  ...Array.from({ length: 10 }, (_, k) => ({ t: CD_START + k, n: 10 - k, d: 0.95 })),
];

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: S(9) + 0.25, amp: 6 }, { t: wd(25, "گرفت"), amp: 12 }, { t: wd(30, "بست"), amp: 16, flash: true },
  { t: wd(32, "قطع"), amp: 5 }, { t: END - 0.55, amp: 18, flash: true },
];
const shakeAt = (t: number) => {
  let x = 0, y = 0;
  for (const h of HITS) { const d = t - h.t; if (d < 0 || d > 0.6) continue; const k = h.amp * Math.exp(-d * 7); x += k * Math.sin(d * 83); y += k * Math.cos(d * 61); }
  return [x, y];
};
const flashAt = (t: number) => Math.max(0, ...HITS.filter((h) => h.flash).map((h) => { const d = t - h.t; return d < 0 || d > 0.25 ? 0 : 0.5 * (1 - d / 0.25); }));

const W = 1920, H = 1080;
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const Shot: React.FC<{ s: (typeof SHOTS)[number] }> = ({ s }) => {
  const f = useCurrentFrame();
  const p = clamp01(f / Math.max(1, (s.to - s.at) * FPS));
  const e = ease(p);
  const z = s.z[0] + (s.z[1] - s.z[0]) * e;
  const fx = s.f2 ? s.f[0] + (s.f2[0] - s.f[0]) * e : s.f[0], fy = s.f2 ? s.f[1] + (s.f2[1] - s.f[1]) * e : s.f[1];
  const vw = W * z, vh = H * z;
  let left = W / 2 - fx * vw, top = H / 2 - fy * vh;
  left = Math.min(0, Math.max(W - vw, left)); top = Math.min(0, Math.max(H - vh, top));
  const t = f / FPS;
  const dark = s.flicker ? clamp01(p * 1.3) * 0.45 + (Math.sin(t * 37) > 0.55 ? 0.18 : 0) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05060a" }}>
      <Img src={staticFile(`v55/img/${s.img}.jpg`)} style={{ position: "absolute", left, top, width: vw, height: vh, maxWidth: "none", maxHeight: "none" }} />
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {dark > 0 && <AbsoluteFill style={{ background: "#000", opacity: dark }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["ماشینِ", "ماشین", "بستنی‌فروشی", "شصت", "ثانیه", "هیچ‌وقت", "پیدا", "تیامِ", "تیام", "النا", "خاموش", "پنجاه", "چهل", "سی", "بیست", "یازده", "پنج", "ده", "خاکستری", "دستِ", "درازِ", "خاکستریِ", "کلاهِ", "محکم", "قطع", "ساکت", "دوباره", "لایک", "تو"]);
type Chunk = { a: number; b: number; ws: VO["words"] };
export const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n);
    let cur: VO["words"] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      if (cur.length >= 2 || /[،.؟!?:؛»…]$/.test(w.w) || bare(w.w).length >= 7 || i === ws.length - 1) { out.push({ a: cur[0].s - 0.04, b: 0, ws: cur }); cur = []; }
    });
  }
  for (let i = 0; i < out.length; i++) { const last = out[i].ws[out[i].ws.length - 1]; out[i].b = Math.min(i + 1 < out.length ? out[i + 1].a : 1e9, last.e + 0.45); }
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.12);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: H * 0.72, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H55Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
        textShadow: "0 6px 14px rgba(0,0,0,0.55)", transform: `translateY(-50%) scale(${1.18 - 0.18 * ease(k)})`, opacity: Math.min(1, k * 2) }}>
        {c.ws.map((w, i) => { const b = bare(w.w); return <span key={i} style={{ color: RED.has(b) ? "#FF3B30" : undefined }}>{b}{i < c.ws.length - 1 ? " " : ""}</span>; })}
      </div>
    </div>
  );
};

const Countdown: React.FC<{ t: number }> = ({ t }) => {
  const c = COUNT.find((x) => t >= x.t && t < x.t + x.d);
  if (!c) return null;
  const k = clamp01((t - c.t) / 0.15), out = clamp01((c.t + c.d - t) / 0.2);
  const final = c.t >= CD_START - 0.01;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 70, display: "flex", justifyContent: "center", opacity: Math.min(k * 2, out) }}>
      <div style={{ fontFamily: "H55Black", fontSize: final ? 210 : 190, lineHeight: 1, color: final && c.n <= 3 ? "#FF3B30" : "#FFFFFF", WebkitTextStroke: "18px #000", paintOrder: "stroke fill",
        textShadow: "0 10px 24px rgba(0,0,0,0.6)", transform: `scale(${1.35 - 0.35 * ease(k)})` }}>{fa(c.n)}</div>
    </div>
  );
};

export const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [sx, sy] = shakeAt(t);
  const black = t > END - 0.3 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${sx || sy ? 1.02 : 1})` }}>
        {SHOTS.map((s, i) => {
          const from = Math.round(s.at * FPS);
          return <Sequence key={i} from={from} durationInFrames={Math.max(1, Math.round(s.to * FPS) - from)} layout="none"><Shot s={s} /></Sequence>;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.4) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flashAt(t) }} />
      <Countdown t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(black, 1 - clamp01(t / 0.2)) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = () => [...SHOTS.map((s) => +(s.at + Math.min(0.9, (s.to - s.at) * 0.5)).toFixed(2)), CD_START + 0.3, CD_START + 8.3];
const DUR = Math.round(END * FPS);
export const V55Compositions: React.FC = () => (
  <>
    <Composition id="V55" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v55/mix.wav" }} />
    <Composition id="V55-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
