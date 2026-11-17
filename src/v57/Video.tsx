// V57 · «مترسک بچه‌ها رو می‌شمره» — Persian version (with the creator's permission, credit in the caption) of
// Unlucky Guy's "The Scarecrow Counts The Kids", built from the user's 30 Google Flow stills (uploads/v57 →
// public/v57/img, 1920×1080 cover crops; 01's "MR. GUNI" thought bubble removed by inpainting) on the user's
// ElevenLabs narration (Mark → tools/v57-voice.py → public/v57/vo.wav + src/v57/vo.json). Captions sit low (V57 fix).
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
  if (!h) throw new Error("v57 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v57 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H57Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; sign?: boolean; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(69) + 1.4).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "sign" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.12], f: [0.55, 0.5] }],                                    // L1 the scarecrow counts the kids
  ["02", cut(S(2)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L2 always exactly twenty
  ["03", cut(S(3)), { z: [1.0, 1.15], f: [0.35, 0.65] }],                          // L3 takes one into the corn
  ["01", cut(S(4)), { z: [1.8, 1.95], f: [0.69, 0.3] }],                           // L4 Mr. Guni
  ["02", cut(S(5)), { z: [1.6, 1.7], f: [0.78, 0.5] }],                            // L5 nobody has a baby until 18
  ["04", cut(S(6)), { z: [1.0, 1.1], f: [0.6, 0.5] }],                             // L6 twenty worksheets
  ["05", cut(S(7)), { z: [1.0, 1.15], f: [0.5, 0.5] }],                            // L7 twenty candles
  ["01", cut(S(8)), { z: [1.35, 1.45], f: [0.7, 0.45] }],                          // L8 one more rule
  ["03", cut(S(9)), { z: [1.6, 1.8], f: [0.35, 0.75] }],                           // L9 fewer than twenty → bring one back
  ["02", cut(S(10)), { z: [1.5, 1.4], f: [0.62, 0.3] }],                           // L10 never happened
  ["06", cut(S(11)), { z: [1.0, 1.08], f: [0.6, 0.5] }],                           // L11 grandpa
  ["06", cut(S(12)), { z: [2.2, 2.4], f: [0.1, 0.48] }],                           // L12 …except scarecrows
  ["07", cut(S(13)), { z: [1.06, 1.18], f: [0.6, 0.5] }],                          // L13 the tiny suspenders
  ["08", cut(S(14)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L14 I'm Kian, I count everything
  ["08", cut(S(15)), { z: [1.5, 1.6], f: [0.75, 0.25] }],                          // L15 stairs, stars
  ["02", cut(S(16)), { z: [1.7, 1.8], f: [0.12, 0.8] }],                           // L16 kid number twenty
  ["09", cut(S(17)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L17 mom came home
  ["09", cut(S(18)), { z: [1.5, 1.65], f: [0.25, 0.4] }],                          // L18 Raha — twenty-one
  ["10", cut(S(19)), { z: [1.06, 1.14], f: [0.45, 0.55] }],                        // L19 dad drives for the sign
  ["10", cut(S(20)), { z: [1.5, 1.6], f: [0.8, 0.35] }],                           // L20 not in the village → not counted
  ["10", cut(S(21)), { z: [1.1, 1.2], f: [0.6, 0.5] }],                            // L21 the truck reached the sign
  ["11", cut(S(22)), { z: [1.0, 1.06], f: [0.4, 0.5] }],                           // L22 lights died, engine died
  ["11", cut(S(23)), { z: [1.4, 1.6], f: [0.78, 0.35] }],                          // L23 Mr. Guni under the sign
  ["11", cut(S(24)), { z: [1.3, 1.2], f: [0.25, 0.6] }],                           // L24 dad drove back
  ["12", cut(S(25)), { z: [1.6, 1.7], f: [0.18, 0.45] }],                          // L25 mom cried
  ["12", cut(S(26)), { z: [1.5, 1.6], f: [0.82, 0.45] }],                          // L26 and I counted
  ["12", cut(S(27)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L27 20 kids, a sister, a scarecrow
  ["13", cut(S(28)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L28 grandma's attic
  ["13", cut(S(29)), { z: [1.5, 1.6], f: [0.35, 0.65] }],                          // L29 sacks and straw hats
  ["14", cut(S(30)), { z: [1.06, 1.12], f: [0.5, 0.5] }],                          // L30 every door
  ["14", cut(S(31)), { z: [1.5, 1.6], f: [0.25, 0.35] }],                          // L31 «put this on…»
  ["15", cut(S(32)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                           // L32 twenty-one little scarecrows
  ["16", cut(S(33)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L33 Raha in my arms
  ["01", cut(S(34)), { z: [1.5, 1.6], f: [0.35, 0.8] }],                           // L34 midnight, crunch crunch
  ["17", cut(S(35)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L35 out of the corn
  ["17", cut(S(36)), { z: [1.15, 1.0], f: [0.5, 0.5] }],                           // L36 three meters tall
  ["17", cut(S(37)), { z: [2.0, 2.15], f: [0.47, 0.17] }],                         // L37 a sack for a face
  ["17", cut(S(38)), { z: [1.7, 1.8], f: [0.22, 0.45] }],                          // L38 stick fingers
  ["18", cut(S(39)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L39 first yard — tap
  ["18", cut(S(40)), { z: [1.5, 1.6], f: [0.68, 0.4] }],                           // L40 second — tap
  ["19", cut(S(41)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L41 Omid giggled
  ["19", cut(S(42)), { z: [1.6, 1.7], f: [0.33, 0.35] }],                          // L42 just once
  ["20", cut(S(43)), { z: [1.0, 1.04], f: [0.5, 0.5] }],                           // L43 Mr. Guni froze
  ["20", cut(S(44)), { z: [1.04, 1.25], f: [0.48, 0.45] }],                        // L44 an inch from Omid's hat
  ["20", cut(S(45)), { z: [1.3, 1.45], f: [0.5, 0.55] }],                          // L45 seven, eight, nine
  ["18", cut(S(46)), { z: [1.1, 1.0], f: [0.4, 0.5] }],                            // L46 moved on
  ["15", cut(S(47)), { z: [1.3, 1.45], f: [0.5, 0.5] }],                           // L47 tap tap tap → our yard
  ["21", cut(S(48)), { z: [1.0, 1.08], f: [0.5, 0.4] }],                           // L48 a stick finger scratched my hat
  ["21", cut(S(49)), { z: [1.5, 1.6], f: [0.6, 0.72] }],                          // L49 Raha's nose
  ["21", cut(S(50)), { z: [1.6, 1.75], f: [0.48, 0.38] }],                         // L50 don't sneeze
  ["22", cut(S(51)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L51 he stood up straight
  ["22", cut(S(52)), { z: [1.5, 1.9], f: [0.5, 0.2] }],                            // L52 «zero.»
  ["23", cut(S(53)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L53 raised his arms
  ["23", cut(S(54)), { z: [1.3, 1.4], f: [0.5, 0.35] }],                           // L54 the rule works on him too
  ["24", cut(S(55)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L55 the 80s girl
  ["24", cut(S(56)), { z: [1.6, 1.7], f: [0.42, 0.3] }],                           // L56 one
  ["25", cut(S(57)), { z: [1.4, 1.5], f: [0.2, 0.5] }],                            // L57 the yo-yo boy — two
  ["25", cut(S(58)), { z: [1.15, 1.0], f: [0.6, 0.5] }],                           // L58 all night
  ["26", cut(S(59)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L59 the twentieth
  ["26", cut(S(60)), { z: [1.6, 1.75], f: [0.33, 0.45] }],                         // L60 suspenders
  ["27", cut(S(61)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                          // L61 grandpa's cane fell
  ["27", cut(S(62)), { z: [1.7, 1.8], f: [0.3, 0.3] }],                            // L62 Taghi, his little brother
  ["07", cut(S(63)), { z: [1.2, 1.35], f: [0.6, 0.55] }],                          // L63 the suspenders were his
  ["28", cut(S(64)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L64 sunrise, he slumped
  ["28", cut(S(65)), { z: [1.6, 1.7], f: [0.25, 0.45] }],                          // L65 just straw again
  ["29", cut(S(66)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L66 everyone sleeps in costume
  ["29", cut(S(67)), { z: [1.4, 1.55], f: [0.72, 0.4] }],                          // L67 the girl from 1313
  ["30", cut(S(68)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L68 tonight he counts likes
  ["30", cut(S(69)), { z: [1.5, 1.8], f: [0.43, 0.6] }],                           // L69 and yours is missing
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  ...V.words.filter((x) => x.line === 34 && bare(x.w).startsWith("خرچ")).map((x) => ({ t: x.s, amp: 5 })),
  { t: wd(39, "تق"), amp: 7 }, { t: wd(40, "تق"), amp: 7 },
  ...V.words.filter((x) => x.line === 47).slice(0, 3).map((x) => ({ t: x.s, amp: 7 })),
  { t: wd(22, "خاموش"), amp: 6 }, { t: wd(52, "صفر"), amp: 14, flash: true }, { t: wd(61, "افتاد"), amp: 6 },
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
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05060a" }}>
      <div style={{ position: "absolute", left, top, width: vw, height: vh }}>
        <Img src={staticFile(`v57/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["مترسک", "مترسکِ", "مترسک‌ها", "بیست", "صفر", "گونی", "رها", "ذرت‌ها", "تق", "خرچ", "عطسه", "هجده", "لایک‌ها", "لایکِ", "تقی", "شلوار", "شلوارِ"]);
type Chunk = { a: number; b: number; ws: VO["words"] };
export const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n);
    let cur: VO["words"] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      if (cur.length >= 2 || /[،.؟!?:؛»…]$/.test(w.w) || bare(w.w).length >= 7 || i === ws.length - 1 || /^«/.test(ws[i + 1]?.w ?? "")) { out.push({ a: cur[0].s - 0.04, b: 0, ws: cur }); cur = []; }
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
    <div style={{ position: "absolute", left: 0, width: W, top: H * 0.865, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H57Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
        textShadow: "0 6px 14px rgba(0,0,0,0.55)", transform: `translateY(-50%) scale(${1.18 - 0.18 * ease(k)})`, opacity: Math.min(1, k * 2) }}>
        {c.ws.map((w, i) => { const b = bare(w.w); return <span key={i} style={{ color: RED.has(b) ? "#FF3B30" : undefined }}>{b}{i < c.ws.length - 1 ? " " : ""}</span>; })}
      </div>
    </div>
  );
};

export const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [sx, sy] = shakeAt(t);
  const fadeOut = clamp01((END - t) / 1.0);
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
      <Captions t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - fadeOut, 1 - clamp01(t / 0.2)) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = () => SHOTS.map((s) => +(s.at + Math.min(0.9, (s.to - s.at) * 0.5)).toFixed(2));
const DUR = Math.round(END * FPS);
export const V57Compositions: React.FC = () => (
  <>
    <Composition id="V57" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v57/mix.wav" }} />
    <Composition id="V57-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
