// V62 · «هر فحشی بدی، واقعی می‌شه» — Persian version (with the creator's permission, credit in the caption) of
// VoidCast's "Every Insult Comes True", built from the user's Google Flow stills (uploads/v62 → public/v62/img,
// 1920×1080 cover crops; NNb/NNc = alternate takes) on the user's ElevenLabs narration
// (Mark → tools/v62-voice.py → public/v62/vo.wav + src/v62/vo.json). Captions sit low.
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
  if (!h) throw new Error("v62 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v62 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H62Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · sign: draw «زنگِ مدرسه» on the blank board (image 22) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; red?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(51) + 1.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "red">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.08], f: [0.5, 0.5] }],                                     // L1 in this town every name comes true
  ["01", cut(S(2)), { z: [1.5, 1.6], f: [0.36, 0.38] }],                           // L2 call your brother «pig»
  ["01", cut(wd(2, "پاپ")), { z: [1.6, 1.75], f: [0.74, 0.42] }],                 // pop! a pig
  ["02", cut(S(3)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                           // L3 ordinary swears do nothing
  ["02b", cut(wd(3, "پس")), { z: [1.3, 1.4], f: [0.22, 0.4] }],                    // so nothing happens (yawning)
  ["02c", cut(S(4)), { z: [1.25, 1.35], f: [0.5, 0.35] }],                         // L4 dangerous ones are animal names
  ["03", cut(S(5)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                            // L5 «نی‌نی»
  ["03", cut(wd(5, "حالا")), { z: [1.5, 1.6], f: [0.66, 0.38] }],                 // the mayor in the stroller
  ["04", cut(S(6)), { z: [1.0, 1.08], f: [0.45, 0.45] }],                          // L6 worst big brother
  ["04c", cut(S(7)), { z: [1.05, 1.15], f: [0.4, 0.45] }],                         // L7 eleven times a pig
  ["04b", cut(wd(7, "هیچ")), { z: [1.2, 1.3], f: [0.55, 0.5] }],                  // never said sorry first
  ["05", cut(S(8)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                           // L8 got it from grandpa
  ["06", cut(S(9)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                             // L9 the muddy bike
  ["07", cut(S(10)), { z: [1.0, 1.06], f: [0.45, 0.5] }],                          // L10 «little worm!»
  ["07", cut(wd(10, "پاپ")), { z: [1.6, 1.85], f: [0.66, 0.74] }],                 // pop!
  ["08", cut(S(12)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L12 beep beep, the garbage truck
  ["08", cut(wd(12, "دنده")), { z: [1.4, 1.5], f: [0.45, 0.65] }],                // backing up toward her
  ["09", cut(wd(13, "ووش")), { z: [1.05, 1.15], f: [0.55, 0.5] }],                // L13 whoosh — the crow
  ["09", cut(wd(13, "قاپیدش")), { z: [1.6, 1.7], f: [0.66, 0.6] }],               // snatched her
  ["10", cut(S(14)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                          // L14 grandpa's crow, toast
  ["11", cut(S(15)), { z: [1.0, 1.1], f: [0.45, 0.4] }],                           // L15 to the tallest pine
  ["09b", cut(S(16)), { z: [1.5, 1.6], f: [0.26, 0.45] }],                         // L16 grandpa ran out, stared
  ["12", cut(S(17)), { z: [1.0, 1.08], f: [0.45, 0.45] }],                         // L17 «Niloo! bird! bat!»
  ["12", cut(wd(17, "باد")), { z: [1.4, 1.5], f: [0.32, 0.3] }],                  // the wind took it all
  ["13", cut(S(18)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                          // L18 «پفیوز!»
  ["13b", cut(wd(18, "هیچی")), { z: [1.6, 1.7], f: [0.7, 0.3] }],                 // nothing — unimpressed crow
  ["14", cut(S(19)), { z: [1.0, 1.08], f: [0.45, 0.5] }],                          // L19 if only a sorry reached her
  ["11b", cut(S(20)), { z: [1.15, 1.25], f: [0.4, 0.35] }],                        // L20 thirty metres up
  ["13", cut(wd(20, "برای")), { z: [1.7, 1.8], f: [0.3, 0.33] }],                 // I wanted to say sorry
  ["14", cut(S(21)), { z: [1.4, 1.5], f: [0.5, 0.45] }],                           // L21 the crow leaned over
  ["14", cut(wd(21, "کلاغ‌ها")), { z: [1.8, 1.9], f: [0.3, 0.6] }],              // crows eat worms
  ["15b", cut(S(22)), { z: [1.0, 1.06], f: [0.5, 0.45] }],                         // L22 ran to someone meaner
  ["15", cut(S(23)), { z: [1.2, 1.3], f: [0.42, 0.35] }],                          // L23 «tell me a bird name!»
  ["15", cut(S(24)), { z: [1.7, 1.8], f: [0.62, 0.22] }],                          // L24 grandpa grumbles
  ["14", cut(S(25)), { z: [1.7, 1.8], f: [0.38, 0.5] }],                           // L25 «it's going to eat her!»
  ["16", cut(S(26)), { z: [1.0, 1.08], f: [0.45, 0.45] }],                         // L26 face turning red
  ["16", cut(S(27)), { z: [1.5, 1.65], f: [0.3, 0.3] }],                           // L27 «you... big eagle!»
  ["17", cut(wd(27, "پاپ")), { z: [1.0, 1.1], f: [0.48, 0.4] }],                  // pop!
  ["17", cut(S(28)), { z: [1.3, 1.4], f: [0.42, 0.65] }],                          // L28 wings, claws
  ["24", cut(S(29)), { z: [1.5, 1.0], f: [0.62, 0.3] }],                           // L29 one flap, the street shrank
  ["18", cut(S(30)), { z: [1.0, 1.08], f: [0.45, 0.45] }],                         // L30 flying is hard
  ["18", cut(wd(30, "دینگ")), { z: [1.5, 1.6], f: [0.6, 0.4] }],                  // ding! chimney
  ["19", cut(S(31)), { z: [1.0, 1.1], f: [0.55, 0.45] }],                          // L31 the nest tipped, she slid
  ["20", cut(S(32)), { z: [1.0, 1.1], f: [0.55, 0.5] }],                           // L32 dive — fifteen, ten, three
  ["20", cut(wd(32, "قاپ")), { z: [1.6, 1.7], f: [0.68, 0.55] }],                 // snap!
  ["21", cut(S(33)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L33 in my beak, wiggling
  ["21", cut(S(34)), { z: [1.5, 1.6], f: [0.5, 0.65] }],                           // L34 rule one: don't swallow her
  ["14", cut(S(35)), { z: [1.6, 1.7], f: [0.52, 0.38] }],                          // L35 caw! caw!
  ["22", cut(S(36)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                          // L36 the crow chased us
  ["22", cut(wd(37, "شرق")), { z: [1.5, 1.6], f: [0.45, 0.4] }],                  // L37 rip!
  ["23", cut(S(38)), { z: [1.0, 1.12], f: [0.5, 0.45] }],                          // L38 spinning like a seed
  ["21", cut(S(39)), { z: [1.25, 1.35], f: [0.5, 0.4] }],                          // L39 eagles don't talk
  ["24", cut(S(40)), { z: [1.0, 1.06], f: [0.5, 0.45] }],                          // L40 grandpa down in the yard
  ["24", cut(wd(40, "بگم")), { z: [1.6, 1.7], f: [0.25, 0.55] }],                 // «want me to say sorry?»
  ["24", cut(S(41)), { z: [1.6, 1.7], f: [0.66, 0.25] }],                          // L41 shook my head
  ["25", cut(S(42)), { z: [1.0, 1.08], f: [0.6, 0.45] }],                          // L42 crack! the rose bush
  ["25", cut(S(43)), { z: [1.7, 1.8], f: [0.16, 0.75] }],                          // L43 Niloo on the grass
  ["26", cut(S(44)), { z: [1.5, 1.6], f: [0.26, 0.35] }],                          // L44 grandpa: «sorry»
  ["26", cut(wd(44, "پاپ")), { z: [1.0, 1.08], f: [0.5, 0.5] }],                  // pop!
  ["26", cut(S(45)), { z: [1.4, 1.5], f: [0.62, 0.45] }],                          // L45 first sorry of his life
  ["13b", cut(S(46)), { z: [1.5, 1.6], f: [0.7, 0.35] }],                          // L46 the crow watched
  ["27", cut(S(47)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                          // L47 «sorry, Niloo»
  ["28", cut(wd(47, "پاپ")), { z: [1.0, 1.1], f: [0.5, 0.45] }],                  // pop! Niloo!
  ["10", cut(S(48)), { z: [1.3, 1.4], f: [0.55, 0.4] }],                           // L48 «sorry, Mahin»
  ["29", cut(wd(48, "پاپ")), { z: [1.0, 1.08], f: [0.5, 0.45] }],                 // pop!
  ["29", cut(S(49)), { z: [1.2, 1.3], f: [0.45, 0.4] }],                           // L49 grandma — «old crow»
  ["29", cut(S(50)), { z: [1.6, 1.7], f: [0.42, 0.32] }],                          // L50 «old goat!»
  ["30", cut(wd(50, "پاپ")), { z: [1.0, 1.08], f: [0.55, 0.45] }],                // pop!
  ["30", cut(S(51)), { z: [1.15, 1.25], f: [0.5, 0.4] }],                          // L51 the whole town says sorry first
  ["30", cut(wd(51, "به‌جز")), { z: [1.5, 1.6], f: [0.47, 0.3] }],               // except grandma
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  ...[2, 10, 44, 47, 48, 50].map((l) => ({ t: wd(l, "پاپ"), amp: 6 })),
  { t: wd(27, "پاپ"), amp: 12, flash: true },
  { t: wd(12, "بیپ"), amp: 3 }, { t: wd(12, "بیپ", 2), amp: 3 }, { t: wd(13, "ووش"), amp: 6 },
  { t: wd(30, "دینگ"), amp: 9 }, { t: wd(32, "قاپ"), amp: 7 },
  { t: wd(35, "قار"), amp: 4 }, { t: wd(35, "قار", 2), amp: 4 },
  { t: wd(37, "شرق"), amp: 8 }, { t: wd(42, "ترق"), amp: 13, flash: true },
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
        <Img src={staticFile(`v62/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["خوک", "پاپ", "کصخل", "کص‌مشنگ", "نی‌نی", "کرم", "کلاغ", "کلاغه", "پفیوز", "ببخشید", "عقاب", "دینگ", "قاپ", "قار", "شرق", "ترق", "نیلو", "مهین", "بز", "پیر", "خفاش", "پرنده", "بیپ", "ووش"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H62Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V62Compositions: React.FC = () => (
  <>
    <Composition id="V62" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v62/mix.wav" }} />
    <Composition id="V62-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
