// V65 · «مواظب باش» — the channel's own Mother's Day story (not an adaptation): every «be careful» from mom makes an
// invisible shield; nobody ever said it to her. Built from the user's 30 Google Flow stills (uploads/v65 → public/v65/img,
// 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v65-voice.py → public/v65/vo.wav + src/v65/vo.json).
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
  if (!h) throw new Error("v65 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v65 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H65Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · sign: draw «زنگِ مدرسه» on the blank board (image 22) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(36) + 2.4).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.1], f: [0.5, 0.5] }],                                      // L1 «be careful» makes a shield
  ["02", cut(S(2)), { z: [1.1, 1.25], f: [0.5, 0.45] }],                           // L2 a tiny shiny bubble
  ["03", cut(S(3)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                             // L3 it's always there
  ["04", cut(S(4)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                            // L4 mom said it a hundred times a day
  ["01", cut(S(5)), { z: [1.5, 1.6], f: [0.32, 0.4] }],                            // L5 at the door
  ["04", cut(wd(5, "سر")), { z: [1.5, 1.6], f: [0.7, 0.55] }],                   //    at the corner
  ["04", cut(wd(5, "پشت")), { z: [1.6, 1.7], f: [0.22, 0.35] }],                 //    on the phone
  ["05", cut(S(6)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L6 even to the bathroom
  ["06", cut(S(7)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                            // L7 I'm Kian, I hated it
  ["07", cut(S(8)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L8 «bubble baby»
  ["07", cut(wd(8, "بهم")), { z: [1.5, 1.6], f: [0.78, 0.45] }],                  //    red-faced
  ["08", cut(S(9)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                           // L9 at the school gate
  ["09", cut(S(10)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L10 I shouted
  ["09", cut(wd(10, "دیگه", 2)), { z: [1.5, 1.6], f: [0.35, 0.4] }],              //    never say it again
  ["10", cut(S(11)), { z: [1.0, 1.1], f: [0.5, 0.4] }],                            // L11 she bit her lip and nodded
  ["10", cut(S(12)), { z: [1.3, 1.45], f: [0.5, 0.35] }],                          // L12 and she stopped
  ["11", cut(S(13)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L13 free
  ["12", cut(S(14)), { z: [1.0, 1.08], f: [0.6, 0.5] }],                           // L14 gym class
  ["12", cut(wd(14, "بوم")), { z: [1.5, 1.6], f: [0.65, 0.45] }],                 //    boom!
  ["13", cut(S(15)), { z: [1.0, 1.1], f: [0.4, 0.45] }],                           // L15 the soup
  ["14", cut(S(16)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L16 the bike
  ["14", cut(wd(16, "شتق")), { z: [1.4, 1.5], f: [0.7, 0.45] }],                  //    splash!
  ["15", cut(S(17)), { z: [1.0, 1.1], f: [0.62, 0.5] }],                           // L17 no shield
  ["15", cut(S(18)), { z: [1.4, 1.55], f: [0.62, 0.35] }],                         // L18 then I understood
  ["16", cut(S(19)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L19 the old albums
  ["17", cut(S(20)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                           // L20 a little glow in every photo
  ["18", cut(S(21)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L21 first steps
  ["03", cut(wd(21, "اولین", 2)), { z: [1.3, 1.4], f: [0.5, 0.45] }],             //    first day of school
  ["19", cut(wd(21, "اون")), { z: [1.0, 1.08], f: [0.45, 0.5] }],                 //    the tree
  ["20", cut(S(22)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                          // L22 thousands of shields
  ["24", cut(S(23)), { z: [1.2, 1.3], f: [0.5, 0.5] }],                            // L23 then mom's photos
  ["21", cut(S(24)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                           // L24 hospital at midnight
  ["22", cut(wd(24, "مامان", 2)), { z: [1.0, 1.08], f: [0.45, 0.5] }],            //    awake till morning
  ["23", cut(wd(24, "مامان", 3)), { z: [1.0, 1.1], f: [0.55, 0.45] }],            //    burned hand
  ["23", cut(S(25)), { z: [1.4, 1.5], f: [0.6, 0.4] }],                            // L25 no glow around her
  ["24", cut(S(26)), { z: [1.0, 1.1], f: [0.5, 0.4] }],                            // L26 nobody ever told her
  ["25", cut(S(27)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                          // L27 Mother's Day
  ["25", cut(S(28)), { z: [1.3, 1.45], f: [0.4, 0.4] }],                           // L28 she looked at me, said nothing
  ["26", cut(S(29)), { z: [1.0, 1.1], f: [0.62, 0.5] }],                           // L29 I hugged her
  ["26", cut(S(30)), { z: [1.5, 1.65], f: [0.62, 0.38] }],                         // L30 «mom... be careful»
  ["27", cut(S(31)), { z: [1.0, 1.1], f: [0.6, 0.5] }],                            // L31 ding! golden shield
  ["28", cut(S(33)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                          // L33 she cried
  ["29", cut(S(34)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L34 every morning, both of us
  ["29", cut(S(35)), { z: [1.3, 1.4], f: [0.5, 0.45] }],                           // L35 the two lines
  ["30", cut(S(36)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                          // L36 tell your mom today
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(10, "بسه"), amp: 5 }, { t: wd(14, "بوم"), amp: 12, flash: true }, { t: wd(15, "لیز"), amp: 6 },
  { t: wd(16, "شتق"), amp: 12 }, { t: wd(31, "دینگ"), amp: 6, flash: true },
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
        <Img src={staticFile(`v65/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["مواظب", "باش", "سپرِ", "سپر", "مامانم", "مامان", "مامانت", "بسه", "بوم", "شتق", "دینگ", "طلایی", "حبابی", "نگو", "خودت", "مادر"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H65Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V65Compositions: React.FC = () => (
  <>
    <Composition id="V65" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v65/mix.wav" }} />
    <Composition id="V65-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
