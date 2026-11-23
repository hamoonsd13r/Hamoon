// V61 · «فقط ۱۰ بار می‌تونی بگی ببخشید» — Persian version (with the creator's permission, credit in the caption) of
// VoidCast's "You Can Only Say Sorry 10 Times", built from the user's 27 Google Flow stills (uploads/v61 →
// public/v61/img, 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v61-voice.py →
// public/v61/vo.wav + src/v61/vo.json). The sorry counter on the back of the hand is drawn in code (COUNTERS).
// Captions sit low.
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
  if (!h) throw new Error("v61 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v61 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H61Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(53) + 1.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.08], f: [0.5, 0.5] }],                                     // L1 only ten sorries
  ["01", cut(S(2)), { z: [1.5, 1.65], f: [0.6, 0.6] }],                            // L2 snap — back together
  ["02", cut(S(3)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L3 every sorry costs one — ding
  ["02", cut(S(4)), { z: [1.4, 1.5], f: [0.55, 0.42] }],                           // L4 the number on your hand
  ["12", cut(S(5)), { z: [1.0, 1.06], f: [0.55, 0.5] }],                           // L5 everyone born with ten
  ["03", cut(S(6)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                            // L6 nobody says it for small stuff
  ["03", cut(S(7)), { z: [1.5, 1.6], f: [0.82, 0.55] }],                           // L7 «حواسم نبود»
  ["03", cut(S(8)), { z: [1.3, 1.4], f: [0.4, 0.5] }],                             // L8 it does nothing, but it's free
  ["04", cut(S(9)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                           // L9 the bus into the bakery
  ["04", cut(S(10)), { z: [1.5, 1.6], f: [0.68, 0.4] }],                           // L10 300 donuts fly back
  ["05", cut(S(11)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L11 the cat, the vase, dad's hammer
  ["05", cut(S(12)), { z: [1.5, 1.6], f: [0.35, 0.3] }],                           // L12 smash!
  ["06", cut(S(13)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L13 sorry — snap!
  ["06", cut(S(14)), { z: [1.6, 1.7], f: [0.82, 0.45] }],                          // L14 his last sorry; mom
  ["07", cut(S(15)), { z: [1.0, 1.06], f: [0.4, 0.5] }],                           // L15 I'm down to one
  ["07", cut(S(16)), { z: [1.6, 1.7], f: [0.25, 0.35] }],                          // L16 where did nine go?
  ["07", cut(S(17)), { z: [1.5, 1.6], f: [0.72, 0.4] }],                           // L17 dad just laughs
  ["08", cut(S(18)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L18 Morvarid, seven, all ten
  ["08", cut(S(19)), { z: [1.6, 1.7], f: [0.5, 0.25] }],                           // L19 never said sorry
  ["08", cut(S(20)), { z: [1.6, 1.7], f: [0.6, 0.45] }],                           // L20 she'd rather eat a worm
  ["09", cut(S(21)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L21 the old rope bridge
  ["09", cut(S(22)), { z: [1.5, 1.6], f: [0.45, 0.35] }],                          // L22 boing, boing, boing
  ["09", cut(S(23)), { z: [1.6, 1.7], f: [0.82, 0.6] }],                           // L23 grandpa: «the bouncy bridge»
  ["10", cut(S(24)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L24 the storm
  ["11", cut(S(25)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L25 hanging by one rope
  ["12", cut(S(26)), { z: [1.15, 1.05], f: [0.5, 0.5] }],                          // L26 the town meeting
  ["13", cut(S(27)), { z: [1.0, 1.08], f: [0.45, 0.45] }],                         // L27 the wind takes the kite
  ["13", cut(S(28)), { z: [1.5, 1.6], f: [0.15, 0.6] }],                           // L28 she ran after it
  ["14", cut(S(29)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L29 «no!» — crack!
  ["14", cut(S(30)), { z: [1.5, 1.6], f: [0.7, 0.7] }],                            // L30 planks snapped
  ["15", cut(S(31)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L31 hanging from the last plank
  ["16", cut(S(32)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L32 dad tries, the rope creaks
  ["17", cut(S(33)), { z: [1.0, 1.1], f: [0.6, 0.5] }],                            // L33 her fingers slipping
  ["05", cut(S(34)), { z: [1.7, 1.8], f: [0.42, 0.25] }],                          // L34 dad's hammer
  ["18", cut(S(35)), { z: [1.0, 1.06], f: [0.4, 0.5] }],                           // L35 break it yourself
  ["18", cut(S(36)), { z: [1.5, 1.6], f: [0.7, 0.75] }],                           // L36 cut the last rope
  ["18", cut(S(37)), { z: [1.7, 1.8], f: [0.33, 0.3] }],                           // L37 I had exactly one
  ["19", cut(S(38)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L38 ran straight into dad
  ["19", cut(S(39)), { z: [1.5, 1.6], f: [0.35, 0.7] }],                           // L39 «sorry!» — ding
  ["20", cut(S(40)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L40 zero
  ["20", cut(S(41)), { z: [1.4, 1.5], f: [0.42, 0.4] }],                           // L41 wasted it on dad
  ["15", cut(S(42)), { z: [1.6, 1.7], f: [0.5, 0.4] }],                            // L42 she had ten
  ["21", cut(S(43)), { z: [1.0, 1.08], f: [0.4, 0.45] }],                          // L43 «bounce! fall, then say it!»
  ["22", cut(S(44)), { z: [1.0, 1.08], f: [0.6, 0.5] }],                           // L44 she bounced — snap
  ["22", cut(S(45)), { z: [1.5, 1.6], f: [0.65, 0.55] }],                          // L45 the bridge dropped
  ["23", cut(S(46)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L46 «sorry!» — snap
  ["23", cut(S(47)), { z: [1.5, 1.6], f: [0.65, 0.35] }],                          // L47 the planks fly up
  ["23", cut(S(48)), { z: [1.2, 1.0], f: [0.55, 0.45] }],                          // L48 the bridge caught her
  ["24", cut(S(49)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L49 good as new, holding her kite
  ["25", cut(S(50)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L50 «just like you»
  ["25", cut(S(51)), { z: [1.5, 1.6], f: [0.65, 0.35] }],                          // L51 where my nine went
  ["26", cut(S(52)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L52 at three, nine times
  ["27", cut(S(53)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                          // L53 grandpa: two — guess which bridge
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(2, "شتق"), amp: 6, flash: true }, { t: wd(3, "دینگ"), amp: 4 }, { t: S(12), amp: 12 }, { t: wd(13, "شتق"), amp: 6, flash: true },
  { t: wd(29, "ترررق"), amp: 12 }, { t: wd(39, "دینگ"), amp: 8, flash: true }, { t: wd(44, "تق"), amp: 14 },
  { t: wd(46, "شتق"), amp: 10, flash: true }, ...V.words.filter((x) => x.line === 47 && bare(x.w).startsWith("شتق")).map((x) => ({ t: x.s, amp: 6 })),
];

/* ───────── the sorry counter (big glowing number, drawn in code) */
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const COUNTERS: { a: number; b: number; n: number; red?: boolean }[] = [
  { a: S(4), b: E(5), n: 10 },
  { a: wd(15, "یکی") - 0.1, b: E(15) + 0.5, n: 1 },
  { a: wd(39, "دینگ"), b: E(40) + 0.4, n: 0, red: true },
];
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const c = COUNTERS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.2), out = clamp01((c.b - t) / 0.2);
  return (
    <div style={{ position: "absolute", right: 120, top: 90, width: 300, height: 300, borderRadius: 150, display: "flex", alignItems: "center", justifyContent: "center",
      background: c.red ? "radial-gradient(circle, rgba(60,0,0,0.85), rgba(20,0,0,0.6))" : "radial-gradient(circle, rgba(255,226,120,0.35), rgba(80,50,0,0.55))",
      boxShadow: c.red ? "0 0 60px rgba(255,40,40,0.6)" : "0 0 70px rgba(255,200,60,0.9)", opacity: Math.min(k, out), transform: `scale(${1.3 - 0.3 * ease(k)})` }}>
      <div style={{ fontFamily: "H61Black", fontSize: 220, lineHeight: 1, color: c.red ? "#FF4B3E" : "#FFF3C4", WebkitTextStroke: "10px #1a1000", paintOrder: "stroke fill" }}>{fa(c.n)}</div>
    </div>
  );
};
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
        <Img src={staticFile(`v61/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["ببخشید", "ده", "یکی", "صفر", "شتق", "دینگ", "شترق", "ترررق", "مروارید", "پل", "پلِ", "بوینگ", "نه"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H61Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
      <Counter t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - fadeOut, 1 - clamp01(t / 0.2)) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = () => SHOTS.map((s) => +(s.at + Math.min(0.9, (s.to - s.at) * 0.5)).toFixed(2));
const DUR = Math.round(END * FPS);
export const V61Compositions: React.FC = () => (
  <>
    <Composition id="V61" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v61/mix.wav" }} />
    <Composition id="V61-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
