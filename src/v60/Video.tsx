// V60 · «دردِ خواهر و برادرت رو حس می‌کنی» — Persian version (with the creator's permission, credit in the caption) of
// VoidCast's "You Feel Your Sibling's Pain", built from the user's 24 Google Flow stills (uploads/v60 → public/v60/img,
// 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v60-voice.py → public/v60/vo.wav +
// src/v60/vo.json). Captions sit low.
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
  if (!h) throw new Error("v60 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v60 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H60Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(60) + 1.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.06], f: [0.5, 0.5] }],                                     // L1 siblings share pain
  ["01", cut(S(2)), { z: [1.7, 1.8], f: [0.25, 0.5] }],                            // L2 the little one gets hurt…
  ["01", cut(S(3)), { z: [1.7, 1.8], f: [0.75, 0.5] }],                            // L3 …you feel it, same spot, same second
  ["06", cut(S(4)), { z: [1.6, 1.7], f: [0.7, 0.5] }],                             // L4 little ones never feel it back
  ["01", cut(S(5)), { z: [1.9, 2.0], f: [0.24, 0.45] }],                           // L5 a baby bumps her head
  ["01", cut(S(6)), { z: [1.9, 2.0], f: [0.78, 0.45] }],                           // L6 big brother flies off his bike
  ["02", cut(S(7)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                            // L7 the Heydaris, eleven kids
  ["02", cut(S(8)), { z: [1.4, 1.5], f: [0.6, 0.45] }],                            // L8 ten kids fall like dominoes
  ["02", cut(S(9)), { z: [1.6, 1.7], f: [0.85, 0.6] }],                            // L9 ow, ow, ow!
  ["06", cut(S(10)), { z: [1.5, 1.6], f: [0.7, 0.45] }],                           // L10 Nokhodi, six, falls over everything
  ["03", cut(S(11)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L11 three hundred things I never climbed
  ["03", cut(S(12)), { z: [1.3, 1.4], f: [0.5, 0.45] }],                           // L12 swings, fences…
  ["04", cut(wd(12, "گاو") - 0.5), { z: [1.0, 1.08], f: [0.6, 0.5] }],             //     …a cow
  ["05", cut(S(13)), { z: [1.0, 1.08], f: [0.55, 0.45] }],                         // L13 a helmet, even in math class
  ["05", cut(S(14)), { z: [1.6, 1.7], f: [0.58, 0.3] }],                           // L14 «you'll thank her one day»
  ["06", cut(S(15)), { z: [1.7, 1.8], f: [0.68, 0.4] }],                           // L15 Nokhodi never cries
  ["06", cut(S(16)), { z: [1.0, 1.08], f: [0.5, 0.55] }],                          // L16 «climb it again»
  ["07", cut(S(17)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L17 the plows pile the snow
  ["07", cut(S(18)), { z: [1.5, 1.4], f: [0.6, 0.3] }],                            // L18 Mount Paroui, twelve meters
  ["08", cut(S(19)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L19 tunnels; one rule
  ["09", cut(S(20)), { z: [1.0, 1.08], f: [0.6, 0.5] }],                           // L20 the deepest tunnel in history
  ["09", cut(S(21)), { z: [1.3, 1.4], f: [0.3, 0.5] }],                            // L21 one Saturday, I heard it
  ["10", cut(S(22)), { z: [1.2, 1.25], f: [0.4, 0.35] }],                          // L22 CRACK!
  ["09", cut(S(23)), { z: [1.8, 1.95], f: [0.78, 0.8] }],                          // L23 not even her boots
  ["10", cut(S(24)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L24 slid down like a giant wave
  ["10", cut(S(25)), { z: [1.3, 1.4], f: [0.4, 0.6] }],                            // L25 BOOM!
  ["10", cut(S(26)), { z: [1.15, 1.05], f: [0.3, 0.5] }],                          // L26 nobody knew where her tunnel was
  ["11", cut(S(27)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L27 cold, all over my body
  ["11", cut(S(28)), { z: [1.5, 1.6], f: [0.5, 0.65] }],                           // L28 heavy, like a car on my chest
  ["11", cut(S(29)), { z: [1.8, 1.95], f: [0.52, 0.3] }],                          // L29 if it hurts, she's alive
  ["12", cut(S(30)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L30 the fire trucks
  ["13", cut(S(31)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L31 twenty firefighters with poles
  ["13", cut(S(32)), { z: [1.5, 1.6], f: [0.45, 0.7] }],                           // L32 every pole hit ice
  ["16", cut(S(33)), { z: [1.5, 1.6], f: [0.82, 0.68] }],                          // L33 «two hours»
  ["14", cut(S(34)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L34 mom on her knees
  ["14", cut(S(35)), { z: [1.5, 1.6], f: [0.55, 0.35] }],                          // L35 thirty minutes of air
  ["15", cut(S(36)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L36 the cold in my fingers fading
  ["15", cut(S(37)), { z: [1.5, 1.6], f: [0.15, 0.6] }],                           // L37 when it stops hurting…
  ["17", cut(S(38)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L38 I looked at the poles
  ["17", cut(S(39)), { z: [1.6, 1.7], f: [0.85, 0.4] }],                           // L39 if one hit her, I'd feel it
  ["16", cut(S(40)), { z: [1.0, 1.08], f: [0.4, 0.45] }],                          // L40 «one at a time! poke hard!»
  ["17", cut(S(41)), { z: [1.3, 1.4], f: [0.35, 0.5] }],                           // L41 poke, nothing
  ["13", cut(S(42)), { z: [1.6, 1.7], f: [0.55, 0.75] }],                          // L42 ice, ice, ice!
  ["17", cut(S(43)), { z: [1.5, 1.6], f: [0.8, 0.4] }],                            // L43 fifteen minutes left
  ["17", cut(S(44)), { z: [1.2, 1.3], f: [0.5, 0.5] }],                            // L44 poke, nothing; ten minutes
  ["18", cut(S(45)), { z: [1.5, 1.6], f: [0.6, 0.6] }],                            // L45 pole number fourteen…
  ["18", cut(S(46)), { z: [1.0, 1.1], f: [0.4, 0.45] }],                           // L46 OW! my left shoulder!
  ["19", cut(S(47)), { z: [1.0, 1.08], f: [0.45, 0.55] }],                         // L47 digging with bare hands
  ["19", cut(S(48)), { z: [1.5, 1.6], f: [0.5, 0.35] }],                           // L48 a shovel hit my helmet — ding!
  ["19", cut(S(49)), { z: [1.3, 1.2], f: [0.35, 0.6] }],                           // L49 one meter, two meters
  ["20", cut(S(50)), { z: [1.0, 1.1], f: [0.45, 0.55] }],                          // L50 a red mitten
  ["20", cut(S(51)), { z: [1.6, 1.75], f: [0.37, 0.65] }],                         // L51 cold as ice, eyes shut
  ["21", cut(S(52)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L52 she coughed
  ["21", cut(S(53)), { z: [1.5, 1.6], f: [0.55, 0.65] }],                          // L53 «your hands…»
  ["21", cut(S(54)), { z: [1.6, 1.7], f: [0.68, 0.25] }],                          // L54 I froze
  ["22", cut(S(55)), { z: [1.0, 1.06], f: [0.5, 0.55] }],                          // L55 she felt every hurt I had
  ["22", cut(S(56)), { z: [1.5, 1.6], f: [0.47, 0.5] }],                           // L56 so I wouldn't stop climbing
  ["23", cut(S(57)), { z: [1.0, 1.1], f: [0.3, 0.55] }],                           // L57 I finally thanked her
  ["24", cut(S(58)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                          // L58 she stubbed her toe on the fire truck
  ["24", cut(S(59)), { z: [1.3, 1.4], f: [0.45, 0.55] }],                          // L59 for the first time ever, both of us…
  ["24", cut(S(60)), { z: [1.5, 1.6], f: [0.45, 0.45] }],                          // L60 OW!
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  ...V.words.filter((x) => x.line === 9).map((x) => ({ t: x.s, amp: 5 })),
  { t: S(22), amp: 14, flash: true }, { t: S(25), amp: 18 }, { t: S(24) + 0.3, amp: 8 },
  { t: S(46), amp: 14, flash: true }, { t: wd(48, "دینگ"), amp: 9 }, { t: S(60), amp: 10 },
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
        <Img src={staticFile(`v60/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["درد", "دردشون", "دردش", "نخودی", "آخ", "ترررق", "بووم", "سرما", "زنده‌ست", "دینگ", "قرمز", "دستکشِ", "شونه‌ی", "چپم", "یخ", "سی", "پونزده", "ده", "چهارده"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H60Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V60Compositions: React.FC = () => (
  <>
    <Composition id="V60" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v60/mix.wav" }} />
    <Composition id="V60-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
