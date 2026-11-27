// V66 · «سپرِ کم‌رنگ» — the channel's own Mother's Day sequel to V65 «مواظب باش», set in the real store Mobl Baharestan
// (home décor; facade reference videos/66-hedie/ref). Built from the user's 29 Google Flow stills (uploads/v66 → public/v66/img)
// on the user's ElevenLabs narration (Mark → tools/v66-voice.py → public/v66/vo.wav + src/v66/vo.json). The store name on the
// blank sofa sign (image 09) and the note «مواظبِ خودت باش» (image 27) are drawn in code (dec). Captions sit low.
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
  if (!h) throw new Error("v66 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v66 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H66Black", "fonts/Vazirmatn-Black.ttf"], ["Lale66", "fonts/Lalezar-Regular.ttf"], ["Naskh66", "fonts/NotoNaskhArabic.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 · sign: draw «زنگِ مدرسه» on the blank board (image 22) */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; red?: boolean; dec?: "logo" | "note" };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(36) + 2.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2" | "red" | "dec">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.12], f: [0.6, 0.5] }],                                     // L1 mom's shield is fading
  ["02", cut(S(2)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                            // L2 every morning «be careful»
  ["03", cut(S(3)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                            // L3 fainter every night
  ["04", cut(S(4)), { z: [1.0, 1.1], f: [0.4, 0.45] }],                            // L4 the dark kitchen
  ["04", cut(S(5)), { z: [1.5, 1.6], f: [0.35, 0.3] }],                            // L5 one a day wasn't enough
  ["05", cut(S(6)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                            // L6 grandma's old rule
  ["05", cut(S(7)), { z: [1.3, 1.45], f: [0.5, 0.4] }],                            // L7 the right gift glows
  ["06", cut(S(8)), { z: [1.0, 1.1], f: [0.65, 0.5] }],                            // L8 almost gone
  ["07", cut(S(9)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                            // L9 smashed the piggy bank
  ["08", cut(wd(9, "دویدم")), { z: [1.0, 1.08], f: [0.6, 0.45] }],               //    and ran
  ["09", cut(S(10)), { z: [1.15, 1.0], f: [0.5, 0.3], dec: "logo" }],             // L10 Mobl Baharestan, 8:50
  ["10", cut(S(11)), { z: [1.6, 1.7], f: [0.5, 0.72] }],                           // L11 full of light (framed below the ceiling lights)
  ["12", cut(S(13)), { z: [1.0, 1.1], f: [0.55, 0.45] }],                          // L13 a golden vase
  ["13", cut(S(14)), { z: [1.5, 1.6], f: [0.45, 0.72] }],                          // L14 a big soft sofa
  ["14", cut(S(15)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L15 the lights go off
  ["15", cut(S(16)), { z: [1.3, 1.38], f: [0.55, 0.66] }],                         // L16 the shopkeeper
  ["16", cut(S(17)), { z: [1.4, 1.46], f: [0.5, 0.68] }],                         // L17 nothing glows
  ["16", cut(S(18)), { z: [1.55, 1.65], f: [0.66, 0.64] }],                           // L18 what does she like?
  ["17", cut(S(19)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                          // L19 I froze
  ["18", cut(S(20)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L20 she knew everything about me
  ["19", cut(S(21)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                           // L21 the flickering bulb
  ["20", cut(S(22)), { z: [1.0, 1.08], f: [0.55, 0.5] }],                          // L22 she stopped at this window
  ["20", cut(wd(22, "یه", 2)), { z: [1.5, 1.6], f: [0.82, 0.6] }],                //    looking at a small lamp
  ["21", cut(S(23)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L23 ran to the window
  ["22", cut(S(24)), { z: [1.6, 1.7], f: [0.58, 0.66] }],                          // L24 ding! it glowed
  ["25", cut(S(25)), { z: [1.22, 1.3], f: [0.66, 0.55] }],                         // L25 the counter
  ["24", cut(S(26)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L26 not enough
  ["25", cut(S(27)), { z: [1.5, 1.6], f: [0.62, 0.3] }],                           // L27 the clock, a smile
  ["25", cut(S(28)), { z: [1.4, 1.5], f: [0.8, 0.45] }],                           // L28 ten percent off
  ["24", cut(S(29)), { z: [1.4, 1.55], f: [0.4, 0.4] }],                           // L29 exactly enough
  ["26", cut(S(30)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L30 she never bought it for herself
  ["27", cut(S(31)), { z: [1.0, 1.1], f: [0.4, 0.55], dec: "note" }],             // L31 the lamp and the note
  ["28", cut(S(32)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L32 her shield, brighter than ever
  ["29", cut(S(33)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L33 «I got you something too»
  ["29", cut(S(34)), { z: [1.5, 1.6], f: [0.45, 0.55] }],                          // L34 glowing blue
  ["30", cut(S(35)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L35 the kitchen isn't dark
  ["09", cut(S(36)), { z: [1.0, 1.1], f: [0.5, 0.35], dec: "logo" }],             // L36 Happy Mother's Day
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(9, "شکستم"), amp: 6 }, { t: wd(15, "تق"), amp: 3 }, { t: wd(15, "تق", 2), amp: 3 },
  { t: wd(24, "دینگ"), amp: 5, flash: true }, { t: wd(32, "روشن"), amp: 4, flash: true },
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
        <Img src={staticFile(`v66/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
        {s.dec === "logo" && (
          // the blank teal sofa sign on the facade (image 09) spans ≈ x 45–63 %, y 24–40 %
          <div style={{ position: "absolute", left: "43%", width: "22%", top: "24.5%", height: "12%", display: "flex", alignItems: "center", justifyContent: "center", gap: vw * 0.006, direction: "rtl" }}>
            <span style={{ fontFamily: "Lale66", fontSize: vh * 0.05, color: "#FFC83D", WebkitTextStroke: `${vh * 0.004}px #1d2b33`, paintOrder: "stroke fill" }}>مبل</span>
            <span style={{ fontFamily: "Lale66", fontSize: vh * 0.07, color: "#FFFFFF", WebkitTextStroke: `${vh * 0.005}px #1d2b33`, paintOrder: "stroke fill" }}>بهارستان</span>
          </div>
        )}
        {s.dec === "note" && (
          // the blank folded card next to the lamp (image 27) spans ≈ x 30–45 %, y 56–67 %
          <div style={{ position: "absolute", left: "31.5%", width: "12%", top: "56%", height: "10.5%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "Naskh66", fontWeight: 700, fontSize: vh * 0.03, lineHeight: 1.15, color: "#c0392b", direction: "rtl", textAlign: "center", transform: "rotate(-2deg)",
            clipPath: `inset(0 0 0 ${100 - 100 * clamp01((f / FPS - 0.4) / 1.2)}%)` }}><span>مواظبِ</span><span>خودت باش ♥</span></div>
        )}
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
      {s.red && <AbsoluteFill style={{ background: "#ff1a1a", opacity: 0.07 + 0.05 * Math.max(0, Math.sin(t * 6)), mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["سپرِ", "سپرش", "خاموش", "مواظب", "مواظبِ", "باش", "بهارستان", "هدیه", "دینگ", "تخفیف", "درصد", "چراغ", "چراغِ", "آبی", "طلایی", "هیچی", "تق", "مادر", "مادره،"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H66Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V66Compositions: React.FC = () => (
  <>
    <Composition id="V66" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v66/mix.wav" }} />
    <Composition id="V66-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
