// V56 · «۱۰۰ ساله هیچ‌کس از این مدرسه بیرون نرفته» — Persian version (with the creator's permission, credit in the
// caption) of Unlucky Guy's "Nobody Has Left This School In 100 Years", built from the user's 27 Google Flow stills
// (uploads/v56 → public/v56/img, 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v56-voice.py →
// public/v56/vo.wav + src/v56/vo.json). Scenes 01, 05 and 14 were not made: 01 = a push out of the classroom window
// (02), 05 = the dragging (09) + the dark closet (12), 14 = the paper plane on the desk (10). The sign «زنگِ مدرسه»
// over the red button is drawn in code. One- or two-word captions, key words in red (same look as V54/V56).
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
  if (!h) throw new Error("v56 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v56 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H56Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · sign: draw «زنگِ مدرسه» on the blank board (image 22) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; sign?: boolean; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(55) + 1.4).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "sign" | "red">>;
const RAW: [string, number, O?][] = [
  ["02", 0, { z: [2.6, 2.3], f: [0.13, 0.26] }],                                   // L1 the endless school, through the window
  ["02", cut(S(2)), { z: [1.18, 1.0], f: [0.5, 0.5] }],                            // L2 born in a classroom
  ["03", cut(S(3)), { z: [1.0, 1.15], f: [0.35, 0.4] }],                           // L3 the bell, 100 years
  ["04", cut(S(4)), { z: [1.0, 1.15], f: [0.5, 0.4] }],                            // L4 a monitor in every hallway
  ["17", cut(S(5)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                            // L5 they never talk
  ["09", cut(S(6)), { z: [1.5, 1.6], f: [0.75, 0.5] }],                            // L6 dragged into the closet…
  ["12", cut(wd(6, "دیگه")), { z: [1.8, 2.0], f: [0.78, 0.45] }],                  //    …never seen again
  ["02b", cut(S(7)), { z: [1.3, 1.4], f: [0.3, 0.55] }],                           // L7 classroom one
  ["06", cut(S(8)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                           // L8 asthma, empty inhaler
  ["07", cut(S(9)), { z: [1.0, 1.1], f: [0.5, 0.45], f2: [0.65, 0.45] }],          // L9 Mahyar sneaks out
  ["08", cut(S(10)), { z: [1.05, 1.15], f: [0.6, 0.4] }],                          // L10 three monitors waiting
  ["09", cut(S(11)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L11 the paper airplane
  ["10", cut(S(12)), { z: [1.15, 1.25], f: [0.4, 0.55] }],                         // L12 knock knock knock
  ["09", cut(S(13)), { z: [1.8, 1.9], f: [0.6, 0.38] }],                           // L13 «I'll come back for you»
  ["12", cut(S(14)), { z: [1.6, 1.8], f: [0.78, 0.45] }],                          // L14 the closet door shut
  ["11", cut(S(15)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L15 midnight shift
  ["11", cut(S(16)), { z: [1.5, 1.7], f: [0.78, 0.5] }],                           // L16 none came out
  ["12", cut(S(17)), { z: [1.15, 1.25], f: [0.25, 0.45] }],                        // L17 the teacher went pale
  ["13", cut(S(18)), { z: [1.0, 1.1], f: [0.6, 0.45] }],                           // L18 the new tall monitor
  ["10", cut(S(19)), { z: [2.0, 2.1], f: [0.78, 0.62] }],                          // L19 a paper plane on my desk
  ["13", cut(S(20)), { z: [1.5, 1.9], f: [0.62, 0.15] }],                          // L20 staring right at me
  ["15", cut(S(21)), { z: [1.3, 1.4], f: [0.4, 0.4] }],                            // L21 «Mahyar?»
  ["15", cut(S(22)), { z: [1.6, 1.7], f: [0.78, 0.2] }],                           // L22 three knocks on the wall
  ["15", cut(S(23)), { z: [1.6, 1.7], f: [0.3, 0.38] }],                           // L23 «it's me!»
  ["16", cut(S(24)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L24 he shoved me
  ["17", cut(S(25)), { z: [1.2, 1.5], f: [0.5, 0.15], red: true }],                // L25 the red light
  ["11", cut(S(26)), { z: [1.5, 1.6], f: [0.35, 0.3], red: true }],                // L26 watching through every mask
  ["12", cut(S(27)), { z: [1.6, 1.7], f: [0.78, 0.45] }],                          // L27 I had to get in there
  ["18", cut(S(28)), { z: [1.4, 1.3], f: [0.75, 0.45] }],                          // L28 the trash
  ["18", cut(S(29)), { z: [1.0, 1.08], f: [0.6, 0.5] }],                           // L29 I climbed in
  ["19", cut(S(30)), { z: [1.0, 1.12], f: [0.45, 0.5] }],                          // L30–31 the floor went down — CLUNK
  ["20", cut(S(32)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L32 a giant dark basement
  ["20", cut(S(33)), { z: [1.6, 1.7], f: [0.15, 0.5] }],                           // L33 thousands of masks
  ["20", cut(S(34)), { z: [1.4, 1.55], f: [0.5, 0.35] }],                          // L34 the wall of screens
  ["21", cut(S(35)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L35 a list of names
  ["21", cut(S(36)), { z: [1.4, 1.6], f: [0.65, 0.45] }],                          // L36 …and Mahyar
  ["21", cut(S(37)), { z: [1.9, 2.0], f: [0.4, 0.4] }],                            // L37 then I understood
  ["26", cut(S(38)), { z: [1.15, 1.25], f: [0.5, 0.4], red: true }],               // L38 the monitors are the caught kids
  ["22", cut(S(39)), { z: [1.0, 1.08], f: [0.5, 0.6] }],                           // L39 the red button
  ["22", cut(S(40)), { z: [1.15, 1.3], f: [0.5, 0.3], sign: true }],               // L40 «زنگِ مدرسه»
  ["23", cut(S(41)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L41 «catch him»
  ["23", cut(S(42)), { z: [1.4, 1.55], f: [0.3, 0.4] }],                           // L42 a hundred masks turned
  ["23", cut(S(43)), { z: [1.6, 1.7], f: [0.82, 0.6] }],                           // L43 nowhere to run
  ["23", cut(S(44)), { z: [1.9, 2.1], f: [0.86, 0.55] }],                          // L44 one, two, three
  ["24", cut(S(45)), { z: [1.0, 1.1], f: [0.5, 0.4] }],                            // L45 he ripped off the mask
  ["24", cut(S(46)), { z: [1.6, 1.75], f: [0.55, 0.3] }],                          // L46 it was Mahyar
  ["20", cut(S(47)), { z: [1.6, 1.7], f: [0.5, 0.4], red: true }],                 // L47 «put that mask back on»
  ["25", cut(S(48)), { z: [1.0, 1.1], f: [0.5, 0.55] }],                           // L48 crunch
  ["26", cut(S(49)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L49 and the next, and the next
  ["26", cut(S(50)), { z: [1.5, 1.6], f: [0.5, 0.8] }],                            // L50 nobody did
  ["27", cut(S(51)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                           // L51 together we pressed it
  ["28", cut(S(52)), { z: [1.0, 1.15], f: [0.45, 0.45] }],                         // L52 the bell rang
  ["29", cut(S(53)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                           // L53 a million doors
  ["17", cut(S(54)), { z: [1.0, 1.4], f: [0.5, 0.3], red: true }],                 // L54–55 the last announcement
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
const lw = (l: number, k: number) => V.words.filter((x) => x.line === l).slice(-k)[0].s; // k-th word from the end
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: lw(12, 3), amp: 5 }, { t: lw(12, 2), amp: 5 }, { t: lw(12, 1), amp: 6 },
  { t: wd(24, "هلم"), amp: 10 }, { t: S(31), amp: 16, flash: true },
  { t: lw(44, 3), amp: 6 }, { t: lw(44, 2), amp: 6 }, { t: lw(44, 1), amp: 8 },
  { t: wd(45, "کند"), amp: 8 }, { t: S(48) + (lw(48, 1) - S(48)), amp: 14, flash: true },
  { t: wd(51, "شکست"), amp: 10 }, { t: wd(51, "زدیم"), amp: 16, flash: true }, { t: wd(52, "زنگ"), amp: 12, flash: true },
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
        <Img src={staticFile(`v56/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
        {s.sign && (
          // the blank board in image 22 spans ≈ x 31–69 %, y 15–30 % of the 1920×1080 crop
          <div style={{ position: "absolute", left: "31.5%", width: "37%", top: "15.5%", height: "14%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "H56Black", fontSize: vh * 0.075, color: "#3a1d0e", direction: "rtl", opacity: 0.88, textShadow: "0 1px 0 rgba(255,220,160,0.45)", mixBlendMode: "multiply" }}>زنگِ مدرسه</div>
        )}
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["مدرسه‌ی", "زنگ", "زنگِ", "ناظم", "ناظمِ", "ناظم‌ها", "ماسکِ", "ماسک", "ماسکش", "ماسک‌ها", "انباری", "انباریِ", "مهیار", "مهیار؟", "تق", "تَق", "تَرَق", "قرمزِ", "قرمز", "سطلِ", "بگیریدش", "یک", "دو", "سه", "صد", "لایک"]);
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
    <div style={{ position: "absolute", left: 0, width: W, top: H * 0.72, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H56Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V56Compositions: React.FC = () => (
  <>
    <Composition id="V56" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v56/mix.wav" }} />
    <Composition id="V56-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
