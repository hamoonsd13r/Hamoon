// V51 · «وسوسه چطور زندگیت رو کنترل می‌کنه؟» — psychological animated documentary, edited from the user's
// 11 Google Flow clips (public/v51/clips/c01–c11) on the user's own narration (ElevenLabs Grandpa).
// Two cuts from one file: V51 YouTube 16:9 1920×1080 · V51-Reel Instagram 9:16 1080×1920 (re-framed on the character).
// Timing: local faster-whisper aligned to videos/51/script.txt (tools/v51-voice.py). Picture = the user's clips only
// (cut on the meaning of each sentence, slow motion / slow push where the narration is longer than a clip);
// code adds only a uniform grade, mood light (red = temptation, gold = hope), captions and the fade to black.
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
  if (!h) throw new Error("v51 word " + l + " " + w);
  return h.s;
};
export const END = +(E(39) + 2.7).toFixed(2); // hold ~1.3 s after the last word, then 1.4 s fade to black

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v51 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H51Bold", "fonts/Vazirmatn-Bold.ttf"], ["H51Black", "fonts/Vazirmatn-Black.ttf"]]
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
  // HOOK · L1 «شهوت، همیشه با یک فاجعه شروع نمی‌شه.» — bed + the huge red shadow, slow push
  { c: "c01", at: 0, src: 0.0, land: [0.9, S(2)], z: [1.0, 1.16], f: [0.52, 0.42], mood: "red" },
  // L2 «گاهی فقط با یک نگاه…» — the glance at the phone, horned shadow behind
  { c: "c02", at: cut(S(2)), src: 0.0, rate: 1, z: [1.02, 1.08], f: [0.5, 0.45], mood: "night" },
  // L3–4 «کنجکاوی کوتاه، یه لحظه ضعف… یه تصمیم کوچیک» — scrolling (orange screen)
  { c: "c03", at: cut(S(3)), src: 0.0, rate: 1, z: [1.06, 1.0], f: [0.45, 0.45], mood: "night" },
  // L5 «همون تصمیم کوچیک… کنترل زندگیت رو ازت بگیره» — slow push on the lit face
  { c: "c02", at: cut(S(5)), src: 2.7, rate: 1, z: [1.04, 1.2], f: [0.5, 0.4], mood: "red" },
  // L6–8 habit: night after night in the bedroom, the shadow arrives on «ذهنت مدام بهش فکر می‌کنه»
  { c: "c04", at: cut(S(6)), src: 0.0, land: [9.3, S(9)], z: [1.0, 1.08], f: [0.55, 0.45], fx2: 0.42, x: 10, mood: "night" },
  // L9–11 «حتی وقتی توی مدرسه‌ای… کنار خانواده… آینده‌ت» — classroom, the phone-thought cloud
  { c: "c05", at: cut(S(9)), src: 0.0, rate: 1, z: [1.0, 1.1], f: [0.5, 0.45], mood: "night" },
  // L12 three beats: «یه تصویر، یه فکر، یه خواسته‌ی ناگهانی»
  { c: "c01", at: cut(S(12)), src: 2.5, land: [3.33, wd(12, "فکر")], z: [1.04, 1.1], f: [0.55, 0.45], mood: "red" },
  { c: "c01", at: cut(wd(12, "فکر")), src: 3.42, land: [4.25, wd(12, "خواسته‌ی")], z: [1.1, 1.04], f: [0.5, 0.5], mood: "red" },
  // L12–14 the mind world: red eyes → void → red streaks → the shadow
  { c: "c06", at: cut(wd(12, "خواسته‌ی")), src: 0.0, land: [9.95, S(15)], z: [1.0, 1.07], f: [0.5, 0.5], mood: "deep" },
  // L15 «کم‌کم احساس می‌کنی دیگه نمی‌تونی جلوش رو بگیری» — walking, chains bloom, then chained with the red phone
  { c: "c01", at: cut(S(15)), src: 4.33, land: [5.95, wd(15, "نمی‌تونی")], z: [1.02, 1.1], f: [0.55, 0.5], mood: "deep" },
  { c: "c01", at: cut(wd(15, "نمی‌تونی")), src: 6.02, land: [6.6, S(16)], z: [1.08, 1.16], f: [0.5, 0.5], mood: "deep" },
  // L16–18 lost hours at the desk: clock, dusk, asleep under the lamp
  { c: "c07", at: cut(S(16)), src: 0.0, land: [9.7, S(19)], z: [1.0, 1.06], f: [0.58, 0.4], x: 8, mood: "night" },
  // L19–20 the invisible chain: chains land on «زنجیر», then «وقتت… انرژیت… اعتماد به نفست»
  { c: "c08", at: cut(S(19)), src: 10.2, land: [12.75, wd(19, "زنجیر")], z: [1.0, 1.06], f: [0.45, 0.45], mood: "deep" },
  { c: "c08", at: cut(wd(19, "زنجیر")), src: 12.75, land: [17.95, S(21)], z: [1.06, 1.0], f: [0.45, 0.5], mood: "deep" },
  // L21 «آروم‌آروم تو رو از زندگی واقعی دور می‌کنه» — alone with the screen in the dark
  { c: "c03", at: cut(S(21)), src: 7.2, land: [9.95, S(22)], z: [1.12, 1.02], f: [0.4, 0.4], mood: "night" },
  // L22 «از دوستات…» the friend's message left unanswered · «…از آینده‌ای» the thought cloud in class
  { c: "c01", at: cut(S(22)), src: 1.0, land: [2.42, wd(22, "آینده‌ای")], z: [1.0, 1.1], f: [0.45, 0.45], mood: "night" },
  { c: "c05", at: cut(wd(22, "آینده‌ای")), src: 7.1, land: [10.0, S(23)], z: [1.1, 1.18], f: [0.5, 0.35], mood: "night" },
  // L23 «هر بار که دوباره تسلیم می‌شی… این آخرین باره» — the face again, closer
  { c: "c02", at: cut(S(23)), src: 5.6, land: [9.95, S(24)], z: [1.3, 1.42], f: [0.5, 0.36], mood: "red" },
  // L24 «چند روز بعد، دوباره همه‌چیز تکرار می‌شه» — the same night again; on «تکرار» quick flashes of the loop
  { c: "c04", at: cut(S(24)), src: 0.3, rate: 1, z: [1.0, 1.05], f: [0.55, 0.45], mood: "night" },
  { c: "c03", at: cut(wd(24, "تکرار")), src: 1.2, rate: 1, z: [1.1, 1.1], f: [0.45, 0.45], mood: "night", flash: true },
  { c: "c02", at: cut(wd(24, "تکرار")) + 0.33, src: 6.0, rate: 1, z: [1.2, 1.2], f: [0.5, 0.4], mood: "red", flash: true },
  { c: "c04", at: cut(wd(24, "تکرار")) + 0.66, src: 3.0, rate: 1, z: [1.1, 1.1], f: [0.55, 0.45], mood: "night", flash: true },
  // L25–28 the mirror: the reflection turns into the shadow on «و همون سؤالی…», hand on the glass on «چرا…»
  { c: "c09", at: cut(S(25)), src: 0.0, land: [2.55, S(27)], z: [1.0, 1.04], f: [0.4, 0.45], x: 12, mood: "deep" },
  { c: "c09", at: cut(S(27)), src: 2.55, land: [7.8, S(29)], z: [1.04, 1.16], f: [0.42, 0.45], fx2: 0.48, mood: "deep" },
  // L29 «اما یه حقیقت مهم وجود داره» — close: the shadow's hands around him
  { c: "c01", at: cut(S(29)), src: 7.45, land: [8.3, S(30)], z: [1.0, 1.08], f: [0.5, 0.45], mood: "red" },
  // L30 «داشتن میل و خواسته به معنی ضعیف بودن تو نیست» — he turns away from the mirror
  { c: "c10", at: cut(S(30)), src: 0.0, land: [2.4, S(31)], z: [1.0, 1.06], f: [0.48, 0.45], fx2: 0.6, mood: "night" },
  // L31 «…اجازه می‌دی یه عادت به جای تو تصمیم بگیره» — the giant shadow; he lifts the glowing phone
  { c: "c01", at: cut(S(31)), src: 6.66, land: [7.38, wd(31, "عادت")], z: [1.0, 1.08], f: [0.5, 0.45], mood: "red" },
  { c: "c10", at: cut(wd(31, "عادت")), src: 2.55, land: [3.95, S(32)], z: [1.04, 1.12], f: [0.6, 0.45], fx2: 0.55, mood: "red" },
  // L32 «تغییر… تصمیم می‌گیری کنترل زندگیت رو پس بگیری» — the phone goes down on «تصمیم», the shadow fades
  { c: "c10", at: cut(S(32)), src: 3.95, land: [6.2, S(33)], z: [1.12, 1.04], f: [0.55, 0.45], fx2: 0.62, mood: "night" },
  // L33 «نه فردا، نه هفته‌ی بعد» — the held breath (near-still) · L34 «همین امروز» — light floods the room
  { c: "c10", at: cut(S(33)), src: 6.2, land: [6.48, S(34)], z: [1.04, 1.0], f: [0.62, 0.45], mood: "night" },
  { c: "c10", at: cut(S(34)), src: 6.48, land: [7.68, S(35)], z: [1.0, 1.05], f: [0.6, 0.45], mood: "gold" },
  // L35–36 freedom: to the door, the dark peels away on «آزادی واقعی اینه…», out into the field
  { c: "c11", at: cut(S(35)), src: 0.0, land: [3.0, S(36)], z: [1.0, 1.06], f: [0.42, 0.45], x: 8, mood: "gold" },
  { c: "c11", at: cut(S(36)), src: 3.0, land: [7.2, S(37) - 0.4], z: [1.06, 1.0], f: [0.45, 0.45], fx2: 0.5, mood: "gold" },
  // L37–39 + ending: toward the sun, slow push, hold, fade to black
  { c: "c11", at: cut(S(37) - 0.4), src: 7.45, land: [7.98, END], z: [1.0, 1.12], f: [0.5, 0.55], x: 10, mood: "gold" },
];
// c01, c09, c10 carry the slowest shots: motion-interpolated 96 fps copies (ffmpeg minterpolate) → smooth slow motion
const SMOOTH = new Set(["c01", "c09", "c10"]);
const CLIP_DUR: Record<string, number> = { c01: 9.92, c02: 10.02, c03: 10.02, c04: 10.02, c05: 10.02, c06: 10.02, c07: 10.02, c08: 18.02, c09: 7.92, c10: 7.92, c11: 8.04 };
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
        <OffthreadVideo src={staticFile(`v51/clips/${s.c}${SMOOTH.has(s.c) ? "s" : ""}.mp4`)} muted trimBefore={Math.round(s.src * FPS)} playbackRate={s.rate}
          style={{ width: "100%", height: "100%" }} />
      </div>
      <AbsoluteFill style={{ background: m.wash, opacity: m.washOp, mixBlendMode: "soft-light" }} />
      {flashOp > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flashOp }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions: each script line split into ≤ 2-line chunks at punctuation; red = temptation, gold = freedom */
const RED = new Set(["شهوت", "عادت", "خواسته‌ی", "زنجیر", "زنجیری", "تسلیم", "نامرئی"]);
const GOLD = new Set(["آزادی", "تغییر", "امروز", "تصمیم", "کنترل"]);
const goldOk = (line: number) => line >= 32;
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
      <div style={{ maxWidth: L.capMax, direction: "rtl", textAlign: "center", fontFamily: "H51Bold", fontSize: L.capSize, lineHeight: 1.5, color: "#F4F1EA",
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

export const V51Compositions: React.FC = () => (
  <>
    <Composition id="V51" component={Video} durationInFrames={frames} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver, audio: "v51/mix.wav" }} />
    <Composition id="V51-Silent" component={Video} durationInFrames={frames} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver }} />
    <Composition id="V51-Look" component={LookYT} durationInFrames={LOOK.length} fps={FPS} width={1920} height={1080} />
    <Composition id="V51-Reel" component={Video} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver, audio: "v51/mix.wav" }} />
    <Composition id="V51-Reel-Silent" component={Video} durationInFrames={frames} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver }} />
    <Composition id="V51-Reel-Look" component={LookReel} durationInFrames={LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
