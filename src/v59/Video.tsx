// V59 · «دوست غلط‌املایی» — Persian adaptation (with the creator's permission, credit in the caption) of VoidCast's
// "Misspelled Friend": the friend is «حافظ», misspelled «حافز» (ظ/ز). Built from the user's 28 Google Flow stills
// (uploads/v59 → public/v59/img, 1920×1080 cover crops) on the user's ElevenLabs narration (Mark → tools/v59-voice.py →
// public/v59/vo.wav + src/v59/vo.json). Every written word is drawn in code (OVERLAYS): «پیطزا» on the chalkboard,
// the cards, and the letters traced on his back. Captions sit low.
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
  if (!h) throw new Error("v59 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v59 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H59Black", "fonts/Vazirmatn-Black.ttf"], ["Naskh59", "fonts/NotoNaskhArabic.ttf"], ["Lale59", "fonts/Lalezar-Regular.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · board: write «پیطزا» on the blank chalkboard (image 03) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; board?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(56) + 1.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "board">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.1], f: [0.5, 0.45] }],                                     // L1 spell it wrong, it disappears
  ["13", cut(S(2)), { z: [1.06, 1.15], f: [0.45, 0.5] }],                          // L2 I spelled my best friend wrong
  ["01", cut(S(3)), { z: [1.6, 1.75], f: [0.5, 0.35] }],                           // L3 poof!
  ["13", cut(S(4)), { z: [1.5, 1.6], f: [0.55, 0.65] }],                           // L4 only the writer can fix it
  ["02", cut(S(5)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L5 five inspectors with magnifiers
  ["03", cut(S(6)), { z: [1.0, 1.04], f: [0.4, 0.4], board: true }],              // L6 pizza with «ط»
  ["03", cut(S(7)), { z: [1.4, 1.55], f: [0.72, 0.6] }],                           // L7 vanished mid-bite
  ["04", cut(S(8)), { z: [1.0, 1.12], f: [0.5, 0.55] }],                           // L8 spelling bees > World Cup
  ["05", cut(S(9)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                            // L9 saying it wrong doesn't count
  ["05", cut(S(10)), { z: [1.5, 1.6], f: [0.47, 0.35] }],                          // L10 grandpa's «بسنی»
  ["13", cut(S(11)), { z: [1.3, 1.4], f: [0.55, 0.3] }],                           // L11 worst speller in town
  ["06", cut(S(12)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L12 «دوچرقه»
  ["07", cut(S(13)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L13 goldfish, trampoline
  ["08", cut(S(14)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L14 my best friend Hafez
  ["08", cut(S(15)), { z: [1.5, 1.6], f: [0.35, 0.35] }],                          // L15 letters are just shapes
  ["09", cut(S(16)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L16 lunch line, drawing on my back
  ["10", cut(S(17)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L17 «you smell»
  ["11", cut(S(18)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L18 Hafez's birthday
  ["11", cut(S(19)), { z: [1.6, 1.7], f: [0.68, 0.72] }],                          // L19 everyone signed the card
  ["12", cut(S(20)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L20 «copy it off his hat»
  ["13", cut(S(21)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L21 «happy birthday, Hafez» (misspelled)
  ["14", cut(S(22)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                          // L22 blowing the candles, the hat falls
  ["15", cut(S(23)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L23 gone
  ["15", cut(S(24)), { z: [1.6, 1.75], f: [0.58, 0.45] }],                         // L24 candles still lit
  ["15", cut(S(25)), { z: [1.5, 1.6], f: [0.6, 0.85] }],                           // L25 «ظ» not «ز»
  ["16", cut(S(26)), { z: [1.0, 1.1], f: [0.62, 0.4] }],                           // L26 his mom screamed
  ["17", cut(S(27)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L27 only I could bring him back
  ["17", cut(S(28)), { z: [1.5, 1.6], f: [0.35, 0.6] }],                           // L28 my «ظ» came out «ز»
  ["17", cut(S(29)), { z: [1.15, 1.05], f: [0.55, 0.5] }],                         // L29 a hundred times
  ["18", cut(S(30)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L30 then it got worse
  ["18", cut(S(31)), { z: [1.5, 1.65], f: [0.42, 0.5] }],                          // L31 a gap in every photo
  ["19", cut(S(32)), { z: [1.0, 1.08], f: [0.55, 0.45] }],                         // L32 his mom humming
  ["19", cut(S(33)), { z: [1.5, 1.6], f: [0.62, 0.35] }],                          // L33 everyone forgetting
  ["19", cut(S(34)), { z: [1.6, 1.75], f: [0.12, 0.55] }],                         // L34 if I forget too…
  ["20", cut(S(35)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L35 that night, the pencil
  ["20", cut(S(36)), { z: [1.6, 1.75], f: [0.33, 0.35] }],                         // L36 can't remember his laugh
  ["21", cut(S(37)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L37 my back itched
  ["21", cut(S(38)), { z: [1.4, 1.5], f: [0.45, 0.45] }],                          // L38 I can feel letters
  ["21", cut(S(39)), { z: [1.6, 1.7], f: [0.68, 0.3] }],                           // L39 «Mom, draw on my back»
  ["21", cut(S(40)), { z: [1.15, 1.25], f: [0.55, 0.5] }],                         // L40 she traced the name
  ["22", cut(S(41)), { z: [1.0, 1.06], f: [0.5, 0.45] }],                          // L41 ح
  ["21", cut(S(42)), { z: [1.5, 1.6], f: [0.62, 0.5] }],                           // L42 ا
  ["22", cut(S(43)), { z: [1.15, 1.25], f: [0.5, 0.45] }],                         // L43 a loop and a dot… almost «ق»
  ["21", cut(S(44)), { z: [1.6, 1.7], f: [0.4, 0.7] }],                            // L44 «again» — ف
  ["20", cut(S(45)), { z: [1.8, 1.95], f: [0.33, 0.35] }],                         // L45 my head going foggy
  ["22", cut(S(46)), { z: [1.3, 1.45], f: [0.5, 0.45] }],                          // L46 one letter left
  ["21", cut(S(47)), { z: [1.3, 1.6], f: [0.58, 0.5] }],                           // L47 the shape of «ظ»
  ["22", cut(S(48)), { z: [1.5, 1.7], f: [0.5, 0.45] }],                           // L48 ظ — I wrote it
  ["23", cut(S(49)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L49 he fell into the cake
  ["24", cut(S(50)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L50 covered in frosting
  ["24", cut(S(51)), { z: [1.5, 1.6], f: [0.42, 0.35] }],                          // L51 «where was I?»
  ["25", cut(S(52)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L52 a big white room
  ["25", cut(S(53)), { z: [1.4, 1.5], f: [0.7, 0.45] }],                           // L53 nothing really disappears
  ["26", cut(S(54)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                          // L54 every lunch line, one word
  ["26", cut(S(55)), { z: [1.5, 1.6], f: [0.78, 0.45] }],                          // L55 my bike came back
  ["27", cut(S(56)), { z: [1.0, 1.12], f: [0.6, 0.45] }],                          // L56 the trampoline, the principal's car
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(3, "پوف"), amp: 10, flash: true }, { t: S(23), amp: 10, flash: true },
  { t: S(26), amp: 6 }, { t: wd(48, "نوشتمش"), amp: 8, flash: true }, { t: wd(49, "افتاد"), amp: 16 }, { t: wd(56, "افتاد"), amp: 12 },
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
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05060a" }}>
      <div style={{ position: "absolute", left, top, width: vw, height: vh }}>
        <Img src={staticFile(`v59/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
        {s.board && (
          // the blank chalkboard in image 03 spans ≈ x 9–41 %, y 2–33 % of the 1920×1080 crop
          <div style={{ position: "absolute", left: "10%", width: "30%", top: "6%", height: "24%", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Naskh59", fontSize: vh * 0.11, color: "rgba(245,245,235,0.92)", direction: "rtl", textShadow: "0 0 6px rgba(255,255,255,0.35)",
            clipPath: `inset(0 0 0 ${100 - 100 * clamp01((f / FPS - 0.3) / 1.0)}%)` }}>پیطزا</div>
        )}
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};


/* ───────── written words, drawn in code: a paper card that pops up, or big glowing letters (traced on his back) */
type Ov = { a: number; b: number; kind: "card" | "glow"; text: string; sub?: string; red?: string };
const lastW = (l: number) => { const ws = V.words.filter((x) => x.line === l); return ws[ws.length - 1]; };
export const OVERLAYS: Ov[] = [
  { a: wd(12, "دوچرقه") - 0.1, b: E(12) + 0.2, kind: "card", text: "دوچرقه", sub: "لیستِ تولد" },
  { a: wd(17, "کشید"), b: E(17) + 0.3, kind: "glow", text: "تو بو می‌دی" },
  { a: wd(21, "تولدت") - 0.1, b: S(22) + 0.4, kind: "card", text: "تولدت مبارک، حافز", red: "ز" },
  { a: wd(25, "ظ") - 0.05, b: E(25) + 0.4, kind: "glow", text: "ظ ≠ ز" },
  { a: wd(28, "ح") - 0.05, b: E(28) + 0.3, kind: "glow", text: "ح ا ف ز", red: "ز" },
  { a: S(41), b: S(42) - 0.05, kind: "glow", text: "ح" },
  { a: S(42), b: E(42) + 0.25, kind: "glow", text: "ا" },
  { a: wd(43, "نزدیک"), b: E(43) + 0.2, kind: "glow", text: "ق؟", red: "ق" },
  { a: lastW(44).s - 0.05, b: E(44) + 0.4, kind: "glow", text: "ف" },
  { a: S(48) - 0.05, b: wd(48, "نوشتمش") + 0.1, kind: "glow", text: "ظ" },
  { a: wd(48, "نوشتمش") + 0.1, b: S(49) + 0.3, kind: "card", text: "تولدت مبارک، حافظ" },
];
const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const o = OVERLAYS.find((x) => t >= x.a && t < x.b);
  if (!o) return null;
  const k = clamp01((t - o.a) / 0.22), out = clamp01((o.b - t) / 0.2), op = Math.min(k, out);
  const parts = o.red ? o.text.split(o.red) : [o.text];
  const body = parts.flatMap((p, i) => (i < parts.length - 1 ? [<span key={i}>{p}</span>, <span key={"r" + i} style={{ color: "#E53935" }}>{o.red}</span>] : [<span key={i}>{p}</span>]));
  if (o.kind === "card") {
    const rev = clamp01((t - o.a - 0.15) / 0.9);  // handwriting appears right-to-left
    return (
      <div style={{ position: "absolute", left: 0, width: W, top: H * 0.12, display: "flex", justifyContent: "center", opacity: op }}>
        <div style={{ transform: `rotate(-3deg) scale(${0.85 + 0.15 * ease(k)})`, background: "#FFFDF6", border: "6px solid #1a1a1a", borderRadius: 22, padding: "30px 80px 40px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)", minWidth: 820, textAlign: "center", direction: "rtl",
          backgroundImage: "repeating-linear-gradient(180deg, transparent 0 58px, rgba(90,140,220,0.25) 58px 61px)" }}>
          {o.sub && <div style={{ fontFamily: "H59Black", fontSize: 52, color: "#555", marginBottom: 6 }}>{o.sub}</div>}
          <div style={{ fontFamily: "Naskh59", fontSize: 140, lineHeight: 1.35, color: "#1f3fa8", clipPath: `inset(0 0 0 ${100 - 100 * rev}%)` }}>{body}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: H * 0.06, display: "flex", justifyContent: "center", opacity: op }}>
      <div style={{ fontFamily: "Lale59", fontSize: o.text.length <= 2 ? 520 : 340, lineHeight: 1.0, color: "#FFE27A", direction: "rtl",
        WebkitTextStroke: "16px #2b1600", paintOrder: "stroke fill",
        textShadow: "0 0 30px rgba(255,214,90,0.95), 0 0 80px rgba(255,170,40,0.8)", transform: `scale(${1.25 - 0.25 * ease(k)})` }}>{body}</div>
    </div>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["غلط", "غیبش", "پوف", "حافظ", "حافز", "ظ", "ز", "ط", "دوچرقه", "بسنی", "دیکته", "غیب", "دیکته‌ی"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H59Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
      <Overlays t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - fadeOut, 1 - clamp01(t / 0.2)) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = () => SHOTS.map((s) => +(s.at + Math.min(0.9, (s.to - s.at) * 0.5)).toFixed(2));
const DUR = Math.round(END * FPS);
export const V59Compositions: React.FC = () => (
  <>
    <Composition id="V59" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v59/mix.wav" }} />
    <Composition id="V59-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
