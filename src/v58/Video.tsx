// V58 · «نامه‌رسون روز آخرت رو میاره» — Persian version (with the creator's permission, credit in the caption) of
// Unlucky Guy's "The Mailman Delivers Your Last Day", built from the user's 33 Google Flow stills (uploads/v58 →
// public/v58/img, 1920×1080 cover crops; 29b = a second take of the tearing scene, 26 left out because the mailman
// there posts the letter into a wall, not his own mouth — 24 is used instead) on the user's ElevenLabs narration
// (Mark → tools/v58-voice.py → public/v58/vo.wav + src/v58/vo.json). Captions sit low.
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
  if (!h) throw new Error("v58 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v58 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H58Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · sign: draw «زنگِ مدرسه» on the blank board (image 22) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; sign?: boolean; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(59) + 1.4).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "sign" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.15], f: [0.62, 0.65] }],                                   // L1 the mail comes at night
  ["02", cut(S(2)), { z: [1.05, 1.12], f: [0.5, 0.5] }],                           // L2 one black envelope
  ["02", cut(S(3)), { z: [1.5, 1.7], f: [0.5, 0.35] }],                            // L3 the last day of your life
  ["03", cut(S(4)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                            // L4 only into a mailbox
  ["03", cut(S(5)), { z: [1.5, 1.6], f: [0.35, 0.45] }],                           // L5 no mailbox, no letter
  ["13", cut(S(6)), { z: [1.6, 1.75], f: [0.3, 0.7] }],                            // L6 every letter in his bag
  ["04", cut(S(7)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L7 nobody has a mailbox
  ["05", cut(S(8)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L8 pizza over the fence
  ["06", cut(S(9)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                            // L9 Mr. Habibi welded it shut
  ["07", cut(S(10)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L10 I'm Arian
  ["07", cut(S(11)), { z: [1.5, 1.6], f: [0.45, 0.35] }],                          // L11 any handwriting
  ["07", cut(S(12)), { z: [1.7, 1.85], f: [0.33, 0.68] }],                         // L12 mom's signature
  ["07", cut(S(13)), { z: [1.2, 1.05], f: [0.5, 0.5] }],                           // L13 never caught… until one night
  ["08", cut(S(14)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L14 Nika turned six
  ["08", cut(S(15)), { z: [1.5, 1.6], f: [0.37, 0.6] }],                           // L15 a cardboard mailbox
  ["08", cut(S(16)), { z: [1.8, 1.95], f: [0.4, 0.62] }],                          // L16 red flag, glitter
  ["09", cut(S(17)), { z: [1.0, 1.1], f: [0.55, 0.6] }],                           // L17 in the morning, a black envelope
  ["10", cut(S(18)), { z: [1.05, 1.15], f: [0.5, 0.4] }],                          // L18 perfect curly handwriting
  ["10", cut(S(19)), { z: [1.5, 1.7], f: [0.5, 0.3] }],                            // L19 «Nika. 6 Aban.»
  ["09", cut(S(20)), { z: [1.8, 1.95], f: [0.8, 0.62] }],                          // L20 tomorrow
  ["09", cut(S(21)), { z: [1.3, 1.15], f: [0.4, 0.45] }],                          // L21 already delivered
  ["11", cut(S(22)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L22 grandpa went white
  ["11", cut(S(23)), { z: [1.5, 1.65], f: [0.52, 0.4] }],                          // L23 «every letter in his bag…»
  ["12", cut(S(24)), { z: [1.0, 1.1], f: [0.6, 0.5] }],                            // L24 10:30, on the roof
  ["13", cut(S(25)), { z: [1.3, 1.4], f: [0.35, 0.7] }],                           // L25 squeak… squeak… thump
  ["13", cut(S(26)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L26 the cart and the night mailman
  ["13", cut(S(27)), { z: [1.6, 1.75], f: [0.62, 0.25] }],                         // L27 two meters tall
  ["14", cut(S(28)), { z: [1.06, 1.15], f: [0.5, 0.5] }],                          // L28 a mail slot for a mouth
  ["14", cut(S(29)), { z: [1.6, 1.75], f: [0.52, 0.65] }],                         // L29 clack, clack
  ["15", cut(S(30)), { z: [1.06, 1.12], f: [0.4, 0.5] }],                          // L30 I followed him on my bike…
  ["16", cut(wd(30, "اداره")), { z: [1.06, 1.15], f: [0.45, 0.45] }],              //     …to the old post office
  ["16", cut(S(31)), { z: [1.5, 1.7], f: [0.38, 0.45] }],                          // L31 inside and down
  ["17", cut(S(32)), { z: [1.0, 1.1], f: [0.55, 0.5] }],                           // L32 the wall of tiny slots
  ["18", cut(S(33)), { z: [1.05, 1.12], f: [0.5, 0.45] }],                         // L33 a name on every one — me
  ["19", cut(S(34)), { z: [1.06, 1.15], f: [0.55, 0.5] }],                         // L34 the stamp machine
  ["20", cut(S(35)), { z: [1.0, 1.1], f: [0.4, 0.45] }],                           // L35 the feather pen
  ["20", cut(S(36)), { z: [1.7, 1.8], f: [0.53, 0.35] }],                          // L36 11:40
  ["21", cut(S(37)), { z: [1.1, 1.16], f: [0.55, 0.5] }],                         // L37 the best fake of my life
  ["21", cut(S(38)), { z: [1.6, 1.75], f: [0.4, 0.68] }],                          // L38 «the night mailman. today.»
  ["22", cut(S(39)), { z: [1.06, 1.15], f: [0.6, 0.5] }],                          // L39 11:55, coming back
  ["23", cut(S(40)), { z: [1.0, 1.08], f: [0.4, 0.55] }],                          // L40 into his bag, I hid
  ["24", cut(S(41)), { z: [1.0, 1.08], f: [0.6, 0.45] }],                          // L41 he pulled out my letter
  ["14", cut(S(42)), { z: [1.9, 2.05], f: [0.52, 0.66] }],                         // L42 clack clack clack
  ["25", cut(S(43)), { z: [1.12, 1.18], f: [0.35, 0.45] }],                        // L43 he looked right at me
  ["25", cut(S(44)), { z: [1.6, 1.75], f: [0.78, 0.55] }],                         // L44 he has to deliver every letter
  ["24", cut(S(45)), { z: [1.4, 1.5], f: [0.68, 0.4] }],                           // L45 11:59
  ["24", cut(S(46)), { z: [1.6, 1.9], f: [0.8, 0.48] }],                           // L46 into his own mail slot
  ["14", cut(S(47)), { z: [2.2, 2.3], f: [0.52, 0.66] }],                          // L47 clack.
  ["27", cut(S(48)), { z: [1.0, 1.12], f: [0.45, 0.5] }],                          // L48 he folded like paper
  ["28", cut(S(49)), { z: [1.0, 1.15], f: [0.55, 0.6] }],                          // L49 one black envelope left
  ["29", cut(S(50)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L50 I tore up Nika's letter
  ["29b", cut(S(51)), { z: [1.0, 1.1], f: [0.55, 0.5] }],                          // L51 and 3,412 more
  ["28", cut(S(52)), { z: [1.5, 1.6], f: [0.25, 0.45] }],                          // L52 his bag, his cap
  ["01", cut(S(53)), { z: [1.2, 1.0], f: [0.4, 0.4] }],                            // L53 a town that still needed its mail
  ["30", cut(S(54)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L54 now I deliver it
  ["30", cut(S(55)), { z: [1.6, 1.75], f: [0.22, 0.4] }],                          // L55 «not today»
  ["31", cut(S(56)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L56 Nika's metal mailbox
  ["30", cut(S(57)), { z: [1.5, 1.6], f: [0.55, 0.45] }],                          // L57 one letter a night
  ["32", cut(S(58)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L58 tonight's goes to everyone who didn't like
  ["32", cut(S(59)), { z: [1.5, 1.8], f: [0.68, 0.72] }],                          // L59 check your mailbox
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(25, "تاپ"), amp: 8 },
  ...V.words.filter((x) => x.line === 29).map((x) => ({ t: x.s, amp: 6 })),
  ...V.words.filter((x) => x.line === 42 && bare(x.w) === "تق").map((x) => ({ t: x.s, amp: 6 })),
  { t: S(47), amp: 14, flash: true }, { t: wd(50, "پاره"), amp: 8 },
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
        <Img src={staticFile(`v58/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["نامه‌رسونِ", "نامه‌رسون", "پاکتِ", "سیاه", "تاریخ", "آخرین", "صندوقِ", "صندوق", "نیکا", "آبان", "فردا", "شکافِ", "تق", "تاپ", "جعلِ", "امروز", "لایک", "صندوقِ"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H58Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V58Compositions: React.FC = () => (
  <>
    <Composition id="V58" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v58/mix.wav" }} />
    <Composition id="V58-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
