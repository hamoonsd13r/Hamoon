// V52 · «بزرگ‌ترین دروغ: از فردا شروع می‌کنم» — motivational animated short, edited from the user's 10 Google Flow
// clips (4 s each, public/v52/clips) on the user's narration (ElevenLabs Grandpa). Same engine as V51.
// 40 s of picture for ~110 s of voice: every clip runs as smooth slow motion (96 fps motion-interpolated copies,
// ffmpeg minterpolate) with a slow camera push, each shot cut on the meaning of its sentence.
// Two cuts: V52 YouTube 16:9 · V52-Reel Instagram 9:16 (re-framed on the character).
import React from "react";
import { AbsoluteFill, Composition, Freeze, Html5Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import vo from "./vo.json";

const FPS = 30;
type VO = { total: number; segs: { n: number; start: number; end: number; text: string }[]; words: { w: string; s: number; e: number; line: number }[] };
const V = vo as VO;
const bare = (x: string) => x.replace(/[،.؟!?:؛«»…]/g, "");
const S = (n: number) => V.segs.find((s) => s.n === n)!.start;
const E = (n: number) => V.segs.find((s) => s.n === n)!.end;
const wd = (l: number, w: string, occ = 1) => {
  const ws = V.words.filter((x) => x.line === l);
  const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1];
  if (!h) throw new Error("v52 word " + l + " " + w);
  return h.s;
};
export const END = +(E(33) + 2.7).toFixed(2); // hold ~1.3 s after the last word, then 1.4 s fade to black

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v52 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H52Bold", "fonts/Vazirmatn-Bold.ttf"], ["H52Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots
   c: clip · src: source second where the shot starts · rate: playback speed (computed from a landing point when
   `land` is given: [source second, video second]) · z: camera zoom [start, end] · f: focus [x, y] for the push and
   the 9:16 re-frame (fx can move: fx2) · x: cross-dissolve frames into this shot · mood: grade */
type Mood = "night" | "red" | "deep" | "gold";
type Sh = { c: string; at: number; src: number; rate?: number; land?: [number, number]; z?: [number, number]; f?: [number, number]; fx2?: number; x?: number; mood?: Mood; flash?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
const RAW: Sh[] = [
  // HOOK · L1 «بزرگ‌ترین دروغی که هر روز به خودت می‌گی چیه؟» — the giant shadow over the small figure, slow push
  { c: "c08", at: 0, src: 0.0, land: [1.12, S(2)], z: [1.0, 1.18], f: [0.5, 0.5], mood: "red" },
  // L2–4 «از فردا شروع می‌کنم… فردا…» — in bed with the phone, the scroll, the guilty face
  { c: "c02", at: cut(S(2)), src: 0.0, land: [1.1, S(3)], z: [1.0, 1.08], f: [0.5, 0.45], mood: "night" },
  { c: "c02", at: cut(S(3)), src: 1.16, land: [2.25, S(4)], z: [1.04, 1.12], f: [0.45, 0.5], mood: "night" },
  { c: "c02", at: cut(S(4)), src: 2.3, land: [3.3, S(5)], z: [1.0, 1.08], f: [0.6, 0.45], mood: "night" },
  // L5 «اما فردا می‌رسه…» — 06:00 · L6 alarm glows, the hand switches it off on «خاموشش» · L7–8 back to sleep
  { c: "c01", at: cut(S(5)), src: 0.0, land: [1.05, S(6)], z: [1.0, 1.06], f: [0.55, 0.45], mood: "night" },
  { c: "c01", at: cut(S(6)), src: 1.05, land: [2.6, wd(6, "خاموشش") + 0.1], z: [1.06, 1.14], f: [0.6, 0.45], mood: "red" },
  { c: "c01", at: cut(wd(6, "خاموشش") + 0.1), src: 2.6, land: [3.4, S(9)], z: [1.3, 1.18], f: [0.45, 0.4], mood: "night" },
  // L9–10 «روزها می‌گذرن…» — a whole day on the couch with the phone
  { c: "c03", at: cut(S(9)), src: 0.0, land: [2.85, S(11)], z: [1.0, 1.06], f: [0.5, 0.5], x: 10, mood: "night" },
  // L11 «یه حقیقت تلخ» — the monster over the bed · L12 «انگیزه همیشه همراهت نمی‌مونه» — eyes closing
  { c: "c02", at: cut(S(11)), src: 3.4, land: [3.86, S(12)], z: [1.0, 1.1], f: [0.5, 0.35], mood: "red" },
  { c: "c03", at: cut(S(12)), src: 2.9, land: [3.86, S(13)], z: [1.0, 1.06], f: [0.5, 0.4], mood: "night" },
  // L13 «خسته‌ای… حوصله نداری» — close on him at dusk · L14 «…از تخت بلند بشی» — the shadow over the bed
  { c: "c03", at: cut(S(13)), src: 1.3, land: [2.6, S(14)], z: [1.6, 1.7], f: [0.52, 0.55], mood: "night" },
  { c: "c01", at: cut(S(14)), src: 3.42, land: [3.8, S(15)], z: [1.0, 1.08], f: [0.5, 0.45], mood: "red" },
  // L15 «همون روزهاست که شخصیت واقعی تو ساخته می‌شه» — he walks to the mirror
  { c: "c04", at: cut(S(15)), src: 0.0, land: [2.95, S(16)], z: [1.0, 1.08], f: [0.2, 0.5], fx2: 0.4, x: 10, mood: "night" },
  // L16 «جلوی آینه می‌ایستی…» close, red light · L17 the reflection, the red shadow · L18–19 fists: the decision
  { c: "c04", at: cut(S(16)), src: 3.02, land: [3.86, S(17)], z: [1.0, 1.06], f: [0.45, 0.45], mood: "red" },
  { c: "c05", at: cut(S(17)), src: 0.0, land: [2.25, S(18)], z: [1.0, 1.1], f: [0.45, 0.5], mood: "red" },
  { c: "c05", at: cut(S(18)), src: 2.25, land: [3.78, S(20)], z: [1.1, 1.2], f: [0.5, 0.5], mood: "night" },
  // L20–21 the next morning: the alarm, he gets up on «بلند می‌شی», sunlight
  { c: "c06", at: cut(S(20)), src: 0.0, land: [2.3, wd(20, "بلند")], z: [1.0, 1.06], f: [0.3, 0.5], fx2: 0.42, x: 8, mood: "night" },
  { c: "c06", at: cut(wd(20, "بلند")), src: 2.3, land: [3.86, S(22)], z: [1.06, 1.0], f: [0.55, 0.5], mood: "gold" },
  // L22–25 training outside · «قدم کوچیک» on the mountain slope · «یه روز دیگه» tired but going on
  { c: "c07", at: cut(S(22)), src: 0.0, land: [1.2, S(23)], z: [1.0, 1.06], f: [0.45, 0.5], mood: "gold" },
  { c: "c09", at: cut(S(23)), src: 1.16, land: [2.08, S(24)], z: [1.0, 1.08], f: [0.45, 0.5], mood: "gold" },
  { c: "c07", at: cut(S(24)), src: 1.2, land: [2.9, S(25)], z: [1.04, 1.1], f: [0.5, 0.5], mood: "gold" },
  { c: "c07", at: cut(S(25)), src: 2.9, land: [3.8, S(26)], z: [1.1, 1.04], f: [0.5, 0.5], mood: "gold" },
  // L26–28 the shadow reaches for him · he stands his ground · it bursts into light on «انضباط»
  { c: "c08", at: cut(S(26)), src: 1.12, land: [2.0, S(27)], z: [1.0, 1.08], f: [0.5, 0.5], x: 8, mood: "red" },
  { c: "c08", at: cut(S(27)), src: 2.02, land: [2.82, wd(28, "انضباط")], z: [1.0, 1.1], f: [0.5, 0.5], mood: "night" },
  { c: "c08", at: cut(wd(28, "انضباط")), src: 2.82, land: [3.86, S(29)], z: [1.1, 1.0], f: [0.5, 0.5], mood: "gold" },
  // L29–30 looking back: the long climb, through the clouds
  { c: "c09", at: cut(S(29)), src: 0.0, land: [1.1, S(30)], z: [1.0, 1.06], f: [0.35, 0.6], mood: "gold" },
  { c: "c09", at: cut(S(30)), src: 2.12, land: [3.76, S(31)], z: [1.0, 1.06], f: [0.5, 0.5], mood: "gold" },
  // L31 the summit at sunrise · L32–33 on the peak, zoom out, hold, fade
  { c: "c10", at: cut(S(31)), src: 0.0, land: [1.1, wd(31, "منتظر")], z: [1.0, 1.08], f: [0.5, 0.5], x: 10, mood: "gold" },
  { c: "c10", at: cut(wd(31, "منتظر")), src: 1.16, land: [2.6, S(32)], z: [1.0, 1.05], f: [0.45, 0.5], mood: "gold" },
  { c: "c10", at: cut(S(32)), src: 2.6, land: [3.86, END], z: [1.0, 1.1], f: [0.5, 0.6], mood: "gold" },
];
// every clip is slowed: motion-interpolated 96 fps copies (ffmpeg minterpolate) → smooth slow motion
const SMOOTH = new Set(["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10"]);
const CLIP_DUR: Record<string, number> = Object.fromEntries([...SMOOTH].map((c) => [c, 3.927]));
export const SHOTS = RAW.map((s, i) => {
  const to = i + 1 < RAW.length ? RAW[i + 1].at : END;
  const rate = s.land ? (s.land[0] - s.src) / (s.land[1] - s.at) : s.rate ?? 1;
  return { ...s, to, rate };
});
export const shotTable = () => SHOTS.map((s, i) => {
  const end = s.src + ((s.to - s.at) + (SHOTS[i + 1]?.x ?? 0) / FPS) * s.rate;
  return `${i} ${s.c} t=${s.at.toFixed(2)}–${s.to.toFixed(2)} src=${s.src.toFixed(2)}→${end.toFixed(2)} rate=${s.rate.toFixed(2)}${end > CLIP_DUR[s.c] - 0.04 ? "  ⚠ PAST END" : ""}`;
});

/* ───────── moods: one grade for all clips + a soft colour wash per section */
const MOOD: Record<Mood, { filter: string; wash: string; washOp: number }> = {
  night: { filter: "contrast(1.05) saturate(0.92) brightness(1.02)", wash: "rgba(20,28,58,1)", washOp: 0.1 },
  red: { filter: "contrast(1.07) saturate(0.98) brightness(1.0)", wash: "rgba(120,16,22,1)", washOp: 0.1 },
  deep: { filter: "contrast(1.08) saturate(0.95) brightness(0.98)", wash: "rgba(70,8,20,1)", washOp: 0.12 },
  gold: { filter: "contrast(1.03) saturate(1.02) brightness(1.03)", wash: "rgba(255,190,90,1)", washOp: 0.08 },
};

type Ver = "yt" | "reel";
const LAY = { yt: { W: 1920, H: 1080, capBottom: 78, capSize: 56, capMax: 1500 }, reel: { W: 1080, H: 1920, capBottom: 430, capSize: 58, capMax: 940 } };

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

const Shot: React.FC<{ s: (typeof SHOTS)[number]; ver: Ver; i: number }> = ({ s, ver, i }) => {
  const f = useCurrentFrame(); // frame inside the sequence
  const L = LAY[ver];
  const nextX = SHOTS[i + 1]?.x ?? 0;
  const len = (s.to - s.at) * FPS + nextX;
  const p = clamp01(f / Math.max(1, len));
  const z = s.z![0] + (s.z![1] - s.z![0]) * ease(p);
  const fx = s.fx2 !== undefined ? s.f![0] + (s.fx2 - s.f![0]) * ease(p) : s.f![0];
  const fy = s.f![1];
  const op = s.x ? clamp01(f / s.x) : 1;
  const m = MOOD[s.mood ?? "night"];
  // source 1280×720 → cover the frame
  const base = Math.max(L.W / 1280, L.H / 720);
  const sc = base * z, vw = 1280 * sc, vh = 720 * sc;
  let left = L.W / 2 - fx * vw, top = L.H / 2 - fy * vh;
  left = Math.min(0, Math.max(L.W - vw, left)); top = Math.min(0, Math.max(L.H - vh, top));
  const flashOp = s.flash ? 0.35 * (1 - clamp01(f / 4)) : 0;
  return (
    <AbsoluteFill style={{ opacity: op, overflow: "hidden", background: "#05060a" }}>
      <div style={{ position: "absolute", left, top, width: vw, height: vh, filter: m.filter }}>
        <OffthreadVideo src={staticFile(`v52/clips/${s.c}${SMOOTH.has(s.c) ? "s" : ""}.mp4`)} muted trimBefore={Math.round(s.src * FPS)} playbackRate={s.rate}
          style={{ width: "100%", height: "100%" }} />
      </div>
      <AbsoluteFill style={{ background: m.wash, opacity: m.washOp, mixBlendMode: "soft-light" }} />
      {flashOp > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flashOp }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions: each script line split into ≤ 2-line chunks at punctuation; red = temptation, gold = freedom */
const RED = new Set(["دروغی", "فردا", "تسلیم", "بهونه"]);
const GOLD = new Set(["انضباط", "امروز", "تصمیم", "قدم", "شروع"]);
const goldOk = (line: number) => line >= 18;
type Chunk = { a: number; b: number; ws: { w: string; line: number }[] };
const chunkLine = (ws: VO["words"], max: number): VO["words"][] => {
  if (ws.length <= max) return [ws];
  const mid = ws.length / 2;
  let best = -1, bd = 1e9;
  ws.forEach((w, i) => { if (i < ws.length - 2 && i >= 1 && /[،؛:]$/.test(w.w)) { const d = Math.abs(i + 1 - mid); if (d < bd) { bd = d; best = i; } } });
  if (best < 0 || bd > ws.length * 0.3) best = Math.ceil(mid) - 1;
  return [...chunkLine(ws.slice(0, best + 1), max), ...chunkLine(ws.slice(best + 1), max)];
};
export const chunks = (max: number): Chunk[] => {
  const out: Chunk[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n);
    for (const c of chunkLine(ws, max)) out.push({ a: c[0].s - 0.08, b: c[c.length - 1].e + 0.35, ws: c });
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
};
const CH = { yt: chunks(9), reel: chunks(6) };

const Captions: React.FC<{ t: number; ver: Ver }> = ({ t, ver }) => {
  const L = LAY[ver];
  const c = CH[ver].find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.18), out = clamp01((c.b - t) / 0.15);
  return (
    <div style={{ position: "absolute", left: 0, width: L.W, bottom: L.capBottom, display: "flex", justifyContent: "center", opacity: Math.min(k, out) }}>
      <div style={{ maxWidth: L.capMax, direction: "rtl", textAlign: "center", fontFamily: "H52Bold", fontSize: L.capSize, lineHeight: 1.5, color: "#F4F1EA",
        background: "rgba(6,8,14,0.42)", borderRadius: 18, padding: ver === "yt" ? "4px 26px 8px" : "6px 24px 10px", boxShadow: "0 0 40px 14px rgba(6,8,14,0.28)",
        textShadow: "0 2px 3px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.65)", transform: `translateY(${(1 - ease(k)) * 10}px)` }}>
        {c.ws.map((w, i) => {
          const b = bare(w.w);
          const col = RED.has(b) ? "#FF5A52" : GOLD.has(b) && goldOk(w.line) ? "#F2C46B" : undefined;
          return <span key={i} style={{ color: col }}>{w.w}{i < c.ws.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

export const Video: React.FC<{ ver?: Ver; audio?: string }> = ({ ver = "yt", audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const L = LAY[ver];
  const fadeOut = clamp01((END - t) / 1.4);
  const fadeIn = clamp01(t / 0.25);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SHOTS.map((s, i) => {
        const from = Math.round(s.at * FPS);
        const dur = Math.round(s.to * FPS) - from + (SHOTS[i + 1]?.x ?? 0);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, dur)} layout="none">
            <Shot s={s} ver={ver} i={i} />
          </Sequence>
        );
      })}
      {/* vignette */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${ver === "yt" ? 0.42 : 0.35}) 100%)` }} />
      {/* bottom shade for captions */}
      <AbsoluteFill style={{ background: ver === "yt" ? "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,0.38) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 72%, rgba(0,0,0,0) 85%)" }} />
      <Captions t={t} ver={ver} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - Math.min(fadeOut, fadeIn) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
      {L && null}
    </AbsoluteFill>
  );
};

/* ───────── look frames (one still per shot + key moments) */
export const LOOK = [0.3, 2.9, ...SHOTS.map((s) => +(s.at + Math.min(1.2, (s.to - s.at) * 0.5)).toFixed(2)), END - 2.2].sort((a, b) => a - b);
const LookYT: React.FC = () => { const f = useCurrentFrame(); return <Freeze frame={Math.round(LOOK[Math.min(f, LOOK.length - 1)] * FPS)}><Video ver="yt" /></Freeze>; };
const LookReel: React.FC = () => { const f = useCurrentFrame(); return <Freeze frame={Math.round(LOOK[Math.min(f, LOOK.length - 1)] * FPS)}><Video ver="reel" /></Freeze>; };
const frames = Math.round(END * FPS);

export const V52Compositions: React.FC = () => (
  <>
    <Composition id="V52" component={Video} durationInFrames={frames} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver, audio: "v52/mix.wav" }} />
    <Composition id="V52-Silent" component={Video} durationInFrames={frames} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver }} />
    <Composition id="V52-Look" component={LookYT} durationInFrames={LOOK.length} fps={FPS} width={1920} height={1080} />
    <Composition id="V52-Reel" component={Video} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver, audio: "v52/mix.wav" }} />
    <Composition id="V52-Reel-Silent" component={Video} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver }} />
    <Composition id="V52-Reel-Look" component={LookReel} durationInFrames={LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
