// V54 · «ناقوس شب» — Persian version (with the creator's permission, credit in the caption) of VoidCast's
// "When the Night Bell Rings, Everyone Freezes", edited from the user's 24 Google Flow clips (4 s, 1280×720,
// uploads/v54 → public/v54/clips/kNNs.mp4 = 72 fps minterpolated copies, k09 with its burned-in name label removed)
// on the user's ElevenLabs narration (Mark, cut + 1.13x → public/v54/vo.wav, src/v54/vo.json via tools/v54-voice.py).
// 16:9 YouTube/Instagram cut, ≤ 3 min. One- or two-word captions like the reference, key words in red.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
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
  if (!h) throw new Error("v54 word " + l + " " + w);
  return h.s;
};

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v54 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H54Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots
   c: clip · src→srcEnd: source seconds played while the shot runs (rate is derived) · z: zoom [start, end] ·
   f: focus [x, y] · rot: slow rotation [deg start, deg end] · mood: grade */
type Mood = "night" | "day" | "warm" | "dawn" | "gold" | "grey";
type Sh = { c: string; at: number; src: number; srcEnd: number; z: [number, number]; f: [number, number]; rot?: [number, number]; mood: Mood };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(72) + 1.6).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "rot" | "mood">>;
const RAW: [string, number, number, number, O?][] = [
  // HOOK · L1 the bell, everyone freezes · L2 the watcher takes whoever moves
  ["k01", 0, 0.1, 2.6, { z: [1.0, 1.12], f: [0.5, 0.45] }],
  ["k02", cut(wd(1, "یخ")), 2.85, 3.85, { z: [1.05, 1.15], f: [0.5, 0.45] }],
  ["k02", cut(S(2)), 0.4, 1.4, { z: [1.0, 1.08] }],
  ["k02", cut(wd(2, "تکون")), 1.5, 2.75, { z: [1.0, 1.15], f: [0.5, 0.4] }],
  // L3–4 the best statue in town
  ["k03", cut(S(3)), 0.0, 3.9, { z: [1.0, 1.05], mood: "day" }],
  // L5 babies learn to freeze before they walk
  ["k04", cut(S(5)), 0.0, 0.88, { mood: "day" }],
  ["k04", cut(wd(5, "راه")), 0.95, 1.92, { mood: "day" }],
  ["k04", cut(wd(5, "یخ")), 1.98, 2.9, { z: [1.0, 1.1], mood: "day" }],
  // L6–7 the pie contest
  ["k06", cut(S(6)), 0.0, 1.7],
  ["k06", cut(S(7)), 1.7, 3.9, { z: [1.2, 1.3], f: [0.55, 0.5] }],
  // L8 nobody knows where it comes from · L9 you can't turn your head
  ["k14", cut(S(8)), 1.3, 3.9, { z: [1.0, 1.1], f: [0.6, 0.45] }],
  ["k02", cut(S(9)), 2.85, 3.9, { z: [1.15, 1.35], f: [0.5, 0.4] }],
  // L10–12 every morning, gravel under the big statue
  ["k08", cut(S(10)), 2.66, 3.9, { z: [1.0, 1.08], mood: "day" }],
  ["k08", cut(S(11)), 1.3, 2.6, { z: [1.0, 1.1], mood: "day" }],
  ["k08", cut(S(12)), 0.05, 1.2, { mood: "day" }],
  // L13–14 Mina, the worst statue · L15–17 practising every night
  ["k09", cut(S(13)), 0.0, 2.12, { mood: "warm" }],
  ["k09", cut(S(14)), 2.2, 3.9, { mood: "warm" }],
  ["k10", cut(S(15)), 0.0, 1.18, { mood: "warm" }],
  ["k10", cut(S(16)), 1.25, 2.6, { z: [1.0, 1.1], mood: "warm" }],
  ["k10", cut(S(17)), 2.65, 3.9, { mood: "warm" }],
  // L18–19 the fair under the statue, the bell · L20 dang ×3 (punch-ins on the bell)
  ["k11", cut(S(18)), 0.0, 1.75, { z: [1.28, 1.34] }],
  ["k11", cut(S(19)), 1.8, 3.9, { z: [1.3, 1.3], f: [0.5, 0.45] }],
  ["k01", cut(wd(20, "دنگ", 1)), 0.5, 1.3, { z: [1.15, 1.2], f: [0.5, 0.4] }],
  ["k01", cut(wd(20, "دنگ", 2)), 1.3, 2.1, { z: [1.38, 1.42], f: [0.5, 0.38] }],
  ["k01", cut(wd(20, "دنگ", 3)), 2.1, 2.9, { z: [1.65, 1.72], f: [0.5, 0.36] }],
  // L21 the whole town froze · L22–23 Mina next to me, cotton candy
  ["k02", cut(S(21)), 0.05, 1.4, { z: [1.1, 1.0] }],
  ["k11", cut(S(22)), 0.0, 0.9, { z: [1.6, 1.66], f: [0.5, 0.62] }],
  ["k15", cut(S(23)), 0.95, 1.95, { z: [1.0, 1.08] }],
  // L24–25 something heavy stepped down — THUMP · L26–28 taller than the houses, cracked stone, a kid's face
  ["k12", cut(S(24)), 0.0, 1.9, { z: [1.0, 1.05] }],
  ["k12", cut(S(25)), 1.9, 2.75, { z: [1.05, 1.1] }],
  ["k02", cut(S(26)), 1.5, 2.75, { z: [1.0, 1.12], f: [0.5, 0.4] }],
  ["k16", cut(S(27)), 0.0, 1.8, { z: [1.6, 1.7], f: [0.24, 0.5] }],
  ["k12", cut(S(28)), 2.95, 3.9, { z: [1.0, 1.12], f: [0.5, 0.4] }],
  // L29 it left the square · L30–31 the phone by the library
  ["k14", cut(S(29)), 1.3, 3.9, { z: [1.1, 1.0], f: [0.6, 0.45] }],
  ["k13", cut(S(30)), 0.0, 2.0, { z: [1.07, 1.12] }],
  ["k13", cut(S(31)), 2.0, 3.9, { z: [1.12, 1.3], f: [0.55, 0.45] }],
  // L32 midnight, thump thump · L33 back to the square · L34–37 right in front of Mina, breath, nose, sneeze
  ["k12", cut(S(32)), 0.3, 1.9, { z: [1.25, 1.3] }],
  ["k02", cut(S(33)), 1.6, 2.7, { z: [1.2, 1.3], f: [0.5, 0.35] }],
  ["k15", cut(S(34)), 0.0, 0.9, { z: [1.0, 1.08] }],
  ["k15", cut(S(35)), 1.98, 2.98, { z: [1.0, 1.1] }],
  ["k15", cut(S(36)), 1.0, 1.9, { z: [1.3, 1.45], f: [0.5, 0.55] }],
  ["k15", cut(S(37)), 3.0, 3.9, { z: [1.0, 1.08] }],
  // L38–39 «مثلِ سنگ، بی‌تکون» — she held it
  ["k16", cut(S(38)), 0.0, 1.8, { z: [1.6, 1.75], f: [0.76, 0.45] }],
  ["k15", cut(S(39)), 1.0, 1.9, { z: [1.0, 1.06] }],
  // L40–43 it turned to me, the eye an inch away, I didn't blink, it tilted its head
  ["k12", cut(S(40)), 2.95, 3.6, { z: [1.3, 1.4], f: [0.5, 0.4] }],
  ["k16", cut(S(41)), 0.0, 3.0, { z: [1.0, 1.08] }],
  ["k16", cut(S(42)), 3.0, 3.9, { z: [1.7, 1.8], f: [0.76, 0.45] }],
  ["k12", cut(S(43)), 2.95, 3.9, { z: [1.05, 1.18], f: [0.5, 0.4], rot: [0, 5] }],
  // L44–45 the mosquito · L46–47 the cotton candy falls, she doesn't look down
  ["k17", cut(S(44)), 0.0, 1.9],
  ["k17", cut(S(45)), 1.9, 3.0, { z: [1.15, 1.3], f: [0.5, 0.55] }],
  ["k18", cut(S(46)), 0.0, 3.9],
  ["k15", cut(S(47)), 1.0, 1.9, { z: [1.15, 1.2], f: [0.45, 0.5] }],
  // L48–50 three, four, circling the square, stopping at me longer · L51 five, the sky turns pink
  ["k19", cut(S(48)), 0.0, 2.0, { z: [1.06, 1.12], mood: "dawn" }],
  ["k19", cut(S(49)), 2.0, 3.9, { z: [1.06, 1.35], f: [0.5, 0.6], mood: "dawn" }],
  ["k19", cut(S(51)), 0.0, 1.2, { z: [1.2, 1.06], mood: "dawn" }],
  // L52–54 sunrise, the crash behind me, the town cheers
  ["k20", cut(S(52)), 0.0, 0.8, { mood: "gold" }],
  ["k20", cut(S(53)), 0.8, 2.2, { mood: "gold" }],
  ["k20", cut(S(54)), 2.2, 3.9, { mood: "gold" }],
  // L55–59 Mina runs to hug me, I can't move, she looks up — way up
  ["k21", cut(S(55)), 0.0, 0.8, { z: [1.06, 1.1], mood: "gold" }],
  ["k21", cut(S(56)), 0.8, 1.6, { z: [1.06, 1.1], mood: "gold" }],
  ["k21", cut(S(57)), 1.6, 2.7, { z: [1.06, 1.12], mood: "gold" }],
  ["k21", cut(S(58)), 2.78, 3.9, { z: [1.06, 1.12], mood: "gold" }],
  // L59–62 the reveal: stone legs, stone hands, my stone face, gravel under my feet
  ["k22", cut(S(59)), 1.0, 2.0, { mood: "gold" }],
  ["k22", cut(S(60)), 2.0, 2.6, { z: [1.2, 1.3], mood: "gold" }],
  ["k22", cut(S(61)), 2.6, 3.9, { mood: "gold" }],
  ["k22", cut(S(62)), 0.0, 1.0, { mood: "gold" }],
  // L63–66 then I understood: the stillest kid becomes the next watcher — this time, me
  ["k22", cut(S(63)), 3.3, 3.9, { z: [1.35, 1.45], f: [0.5, 0.4], mood: "gold" }],
  ["k12", cut(S(64)), 2.95, 3.9, { mood: "grey" }],
  ["k03", cut(S(65)), 0.0, 3.9, { z: [1.0, 1.05], mood: "grey" }],
  ["k22", cut(S(66)), 2.6, 3.9, { z: [1.2, 1.35], f: [0.5, 0.4], mood: "gold" }],
  // L67–72 now I stand in the square; every morning Mina practises in front of me
  ["k23", cut(S(67)), 2.55, 3.9, { z: [1.15, 1.2], mood: "day" }],
  ["k23", cut(S(68)), 0.0, 1.2, { z: [1.15, 1.22], mood: "day" }],
  ["k23", cut(S(69)), 1.28, 2.45, { z: [1.15, 1.25], f: [0.5, 0.45], mood: "day" }],
  ["k22", cut(S(72)), 2.0, 3.9, { z: [1.15, 1.0], f: [0.5, 0.4], mood: "gold" }],
];
export const SHOTS = RAW.map(([c, at, src, srcEnd, o], i) => {
  const to = i + 1 < RAW.length ? RAW[i + 1][1] : END;
  const s: Sh = { c, at, src, srcEnd, z: [1.0, 1.06], f: [0.5, 0.5], mood: "night", ...(o ?? {}) };
  return { ...s, to, rate: (srcEnd - src) / (to - at) };
});
const CLIP_DUR = 3.93;
export const shotTable = () => SHOTS.map((s, i) => `${i} ${s.c} t=${s.at.toFixed(2)}–${s.to.toFixed(2)} src=${s.src.toFixed(2)}→${s.srcEnd.toFixed(2)} rate=${s.rate.toFixed(2)}${s.srcEnd > CLIP_DUR - 0.02 || s.rate <= 0 ? "  ⚠" : ""}`);

/* ───────── hits: camera shake + white flash on the visible impacts */
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  { t: wd(20, "دنگ", 1), amp: 5, flash: true }, { t: wd(20, "دنگ", 2), amp: 6, flash: true }, { t: wd(20, "دنگ", 3), amp: 8, flash: true },
  { t: S(25), amp: 16, flash: true },
  { t: wd(32, "تاپ", 1), amp: 9 }, { t: wd(32, "تاپ", 2), amp: 9 },
  { t: wd(49, "تاپ", 1), amp: 8 }, { t: wd(49, "تاپ", 2), amp: 8 },
  { t: wd(53, "ریخت"), amp: 12 },
];
const shakeAt = (t: number) => {
  let x = 0, y = 0;
  for (const h of HITS) {
    const d = t - h.t;
    if (d < 0 || d > 0.6) continue;
    const k = h.amp * Math.exp(-d * 7);
    x += k * Math.sin(d * 83); y += k * Math.cos(d * 61);
  }
  return [x, y];
};
const flashAt = (t: number) => Math.max(0, ...HITS.filter((h) => h.flash).map((h) => { const d = t - h.t; return d < 0 || d > 0.2 ? 0 : 0.32 * (1 - d / 0.2); }));

/* ───────── grades */
const MOOD: Record<Mood, { filter: string; wash: string; washOp: number }> = {
  night: { filter: "contrast(1.06) saturate(0.95)", wash: "rgba(16,24,60,1)", washOp: 0.12 },
  day: { filter: "contrast(1.04) saturate(1.0)", wash: "rgba(255,220,170,1)", washOp: 0.06 },
  warm: { filter: "contrast(1.04) saturate(1.02)", wash: "rgba(255,170,90,1)", washOp: 0.08 },
  dawn: { filter: "contrast(1.05) saturate(1.0)", wash: "rgba(255,120,160,1)", washOp: 0.08 },
  gold: { filter: "contrast(1.04) saturate(1.02) brightness(1.02)", wash: "rgba(255,190,90,1)", washOp: 0.08 },
  grey: { filter: "contrast(1.08) saturate(0.35)", wash: "rgba(30,34,44,1)", washOp: 0.1 },
};

const W = 1920, H = 1080;
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const Shot: React.FC<{ s: (typeof SHOTS)[number] }> = ({ s }) => {
  const f = useCurrentFrame();
  const len = (s.to - s.at) * FPS;
  const p = clamp01(f / Math.max(1, len));
  const z = s.z[0] + (s.z[1] - s.z[0]) * ease(p);
  const rot = s.rot ? s.rot[0] + (s.rot[1] - s.rot[0]) * ease(p) : 0;
  const m = MOOD[s.mood];
  const sc = (W / 1280) * z, vw = 1280 * sc, vh = 720 * sc;
  let left = W / 2 - s.f[0] * vw, top = H / 2 - s.f[1] * vh;
  left = Math.min(0, Math.max(W - vw, left)); top = Math.min(0, Math.max(H - vh, top));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05060a" }}>
      <div style={{ position: "absolute", left, top, width: vw, height: vh, filter: m.filter, transform: rot ? `rotate(${rot}deg) scale(${1 + Math.abs(rot) * 0.012})` : undefined }}>
        <OffthreadVideo src={staticFile(`v54/clips/${s.c}s.mp4`)} muted trimBefore={Math.round(s.src * FPS)} playbackRate={s.rate} style={{ width: "100%", height: "100%" }} />
      </div>
      <AbsoluteFill style={{ background: m.wash, opacity: m.washOp, mixBlendMode: "soft-light" }} />
      {s.mood === "grey" && <AbsoluteFill style={{ background: "#7a7a7a", opacity: 0.7, mixBlendMode: "saturation" }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions: one or two words at a time, centred low, white with a heavy black outline, key words red */
const RED = new Set(["نگهبان", "ناقوس", "ناقوسِ", "یخ", "تکون", "بی‌تکون", "بی‌تکون‌ترین", "سنگ", "سنگی", "سنگین", "تاپ", "دنگ", "می‌برتت", "مجسمه", "نیمه‌شب", "عطسه‌ش", "پلک", "هیولا", "خاکستری", "خاکستریِ", "تونستیم", "من"]);
type Chunk = { a: number; b: number; ws: VO["words"] };
export const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n);
    let cur: VO["words"] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const punct = /[،.؟!?:؛»…]$/.test(w.w);
      const long = bare(w.w).length >= 7;
      if (cur.length >= 2 || punct || long || i === ws.length - 1 || /^«/.test(ws[i + 1]?.w ?? "")) { out.push({ a: cur[0].s - 0.04, b: 0, ws: cur }); cur = []; }
    });
  }
  for (let i = 0; i < out.length; i++) {
    const last = out[i].ws[out[i].ws.length - 1];
    out[i].b = Math.min(i + 1 < out.length ? out[i + 1].a : 1e9, last.e + 0.45);
  }
  return out;
})();

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.12);
  const s = 1.18 - 0.18 * ease(k);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: H * 0.7, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H54Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF",
        WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textShadow: "0 6px 14px rgba(0,0,0,0.55)", transform: `translateY(-50%) scale(${s})`, opacity: Math.min(1, k * 2) }}>
        {c.ws.map((w, i) => {
          const b = bare(w.w);
          return <span key={i} style={{ color: RED.has(b) ? "#FF3B30" : undefined }}>{b}{i < c.ws.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

export const Video: React.FC<{ audio?: string; captions?: boolean }> = ({ audio, captions = true }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [sx, sy] = shakeAt(t);
  const fadeOut = clamp01((END - t) / 1.3);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${sx || sy ? 1.02 : 1})` }}>
        {SHOTS.map((s, i) => {
          const from = Math.round(s.at * FPS);
          const dur = Math.round(s.to * FPS) - from;
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, dur)} layout="none">
              <Shot s={s} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flashAt(t) }} />
      {captions && <Captions t={t} />}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeOut }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = () => [0.5, ...SHOTS.map((s) => +(s.at + Math.min(0.9, (s.to - s.at) * 0.5)).toFixed(2))];
const DUR = Math.round(END * FPS);


export const V54Compositions: React.FC = () => (
  <>
    <Composition id="V54" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v54/mix.wav" }} />
    <Composition id="V54-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
