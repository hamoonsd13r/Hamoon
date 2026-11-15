// V53 · «رواقی‌گری: تو نمی‌تونی توفان رو متوقف کنی» — Stoic psychology short, edited from the user's 16 Google Flow
// clips (6 s each, public/v53/clips) on the user's narration (ElevenLabs Grandpa). Same engine as V51/V52.
// Two cuts: V53 = full YouTube 16:9 · V53-Short = 30 s YouTube Short 9:16 (four passages of the same narration,
// tools/v53-short.py). Clips c01/c12/c14 open with letterbox bars and c03/c14 carry burned-in labels → those shots
// are zoomed past them. All clips slowed smoothly (96 fps minterpolate copies).
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import voFull from "./vo.json";
import voShort from "./vo-short.json";

const FPS = 30;
type VO = { total: number; segs: { n: number; start: number; end: number; text: string }[]; words: { w: string; s: number; e: number; line: number }[] };
const mk = (V: VO) => {
  const S = (n: number) => V.segs.find((s) => s.n === n)!.start;
  const E = (n: number) => V.segs.find((s) => s.n === n)!.end;
  const wd = (l: number, w: string, occ = 1) => {
    const ws = V.words.filter((x) => x.line === l);
    const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1];
    if (!h) throw new Error("v53 word " + l + " " + w);
    return h.s;
  };
  return { S, E, wd };
};
const bare = (x: string) => x.replace(/[،.؟!?:؛«»…]/g, "");
/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v53 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H53Bold", "fonts/Vazirmatn-Bold.ttf"], ["H53Black", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots
   c: clip · src: source second where the shot starts · rate: playback speed (computed from a landing point when
   `land` is given: [source second, video second]) · z: camera zoom [start, end] · f: focus [x, y] for the push and
   the 9:16 re-frame (fx can move: fx2) · x: cross-dissolve frames into this shot · mood: grade */
type Mood = "night" | "red" | "deep" | "gold";
type Sh = { c: string; at: number; src: number; rate?: number; land?: [number, number]; z?: [number, number]; f?: [number, number]; fx2?: number; x?: number; mood?: Mood; flash?: boolean };
const cut = (t: number) => +(t - 0.07).toFixed(3);
type Cut = "full" | "short";
const VOS: Record<Cut, VO> = { full: voFull as VO, short: voShort as VO };
const TAIL: Record<Cut, number> = { full: 2.8, short: 1.25 };
export const ENDS: Record<Cut, number> = { full: +(mk(VOS.full).E(47) + TAIL.full).toFixed(2), short: +(mk(VOS.short).E(7) + TAIL.short).toFixed(2) };
const rawFull = (): Sh[] => {
  const { S, wd } = mk(VOS.full), END = ENDS.full;
  return [
    // HOOK · L1 «تا حالا شده احساس کنی همه‌چیز داره از کنترلت خارج می‌شه؟» — alone in the dark, turning red
    { c: "c01", at: 0, src: 2.0, land: [5.85, S(2)], z: [1.12, 1.3], f: [0.5, 0.5], mood: "red" },
    // L2–3 heart racing, thoughts tangling around the head
    { c: "c02", at: cut(S(2)), src: 1.7, land: [5.85, S(4)], z: [1.0, 1.1], f: [0.5, 0.45], mood: "red" },
    // L4–5 trying to hold everything in the air
    { c: "c03", at: cut(S(4)), src: 0.0, land: [4.6, S(6)], z: [1.14, 1.2], f: [0.5, 0.52], mood: "night" },
    // L6–7 weather, people, past, future — the crowd and the clocks around him
    { c: "c04", at: cut(S(6)), src: 0.0, land: [5.85, S(8)], z: [1.0, 1.08], f: [0.5, 0.5], mood: "night" },
    // L8 «نمی‌تونی… کنترل کنی» pushing the giant sphere · L9–10 a whole life spent on it
    { c: "c05", at: cut(S(8)), src: 0.0, land: [2.85, S(9)], z: [1.0, 1.08], f: [0.45, 0.5], mood: "red" },
    { c: "c05", at: cut(S(9)), src: 4.15, land: [5.75, S(11)], z: [1.0, 1.08], f: [0.5, 0.5], mood: "night" },
    // L11–13 an old philosophy: the pillars of the Stoa rise in the light
    { c: "c06", at: cut(S(11)), src: 0.0, land: [5.0, S(13)], z: [1.0, 1.1], f: [0.5, 0.5], x: 10, mood: "night" },
    // L14–15 «تو نمی‌تونی توفان رو متوقف کنی…» the storm hits on «توفان», he walks on through it
    { c: "c07", at: cut(S(13)), src: 0.3, land: [3.3, wd(14, "توفان")], z: [1.0, 1.06], f: [0.5, 0.5], mood: "night" },
    { c: "c07", at: cut(wd(14, "توفان")), src: 3.3, land: [5.7, S(16)], z: [1.06, 1.14], f: [0.5, 0.55], mood: "deep" },
    // L16–19 two people, the same life: rain over both on «مشکلات»
    { c: "c08", at: cut(S(16)), src: 0.0, land: [3.2, S(17)], z: [1.0, 1.06], f: [0.5, 0.5], x: 10, mood: "night" },
    { c: "c08", at: cut(S(17)), src: 3.2, land: [5.85, S(20)], z: [1.06, 1.12], f: [0.5, 0.5], mood: "night" },
    // L20 the first one · L21 disrespected → angry · L22 the missed bus → the whole day ruined · L23 failure
    { c: "c09", at: cut(S(20)), src: 0.0, land: [2.0, S(21)], z: [1.0, 1.06], f: [0.4, 0.5], mood: "night" },
    { c: "c12", at: cut(S(21)), src: 3.05, land: [4.3, S(22)], z: [1.0, 1.08], f: [0.5, 0.45], mood: "red" },
    { c: "c09", at: cut(S(22)), src: 2.0, land: [5.85, S(23)], z: [1.0, 1.1], f: [0.5, 0.5], mood: "red" },
    { c: "c03", at: cut(S(23)), src: 4.65, land: [5.85, S(24)], z: [1.14, 1.24], f: [0.5, 0.52], mood: "red" },
    // L24 the second one · L25 scared too · L26 the pause before reacting · L27 not everything is his
    { c: "c12", at: cut(S(24)), src: 1.3, land: [2.95, S(25)], z: [1.3, 1.3], f: [0.42, 0.5], mood: "night" },
    { c: "c05", at: cut(S(25)), src: 2.95, land: [4.05, S(26)], z: [1.0, 1.06], f: [0.55, 0.45], mood: "night" },
    { c: "c12", at: cut(S(26)), src: 4.35, land: [5.85, S(27)], z: [1.0, 1.06], f: [0.5, 0.45], mood: "night" },
    { c: "c06", at: cut(S(27)), src: 5.15, land: [5.85, S(28)], z: [1.0, 1.08], f: [0.5, 0.45], mood: "night" },
    // L28–30 outside our control: past, opinions, people — the world runs around him, he stays still
    { c: "c13", at: cut(S(28)), src: 0.5, land: [3.0, S(29)], z: [1.0, 1.06], f: [0.35, 0.5], fx2: 0.5, mood: "night" },
    { c: "c13", at: cut(S(29)), src: 3.0, land: [5.75, S(31)], z: [1.06, 1.0], f: [0.5, 0.5], mood: "night" },
    // L31–32 one thing is always ours: how we react — the calm ring forms
    { c: "c10", at: cut(S(31)), src: 0.0, land: [5.85, S(33)], z: [1.0, 1.1], f: [0.5, 0.5], x: 10, mood: "night" },
    // L33 the insult: the shadow points, the wall falls, he stays calm
    { c: "c11", at: cut(S(33)), src: 0.0, land: [5.85, S(34)], z: [1.0, 1.06], f: [0.6, 0.5], mood: "night" },
    // L34–35 not giving up, not fighting the whole world — his profile over the mountains
    { c: "c15", at: cut(S(34)), src: 0.0, land: [5.85, S(36)], z: [1.0, 1.08], f: [0.3, 0.45], fx2: 0.36, mood: "night" },
    // L36 the mind provokes: the red shadow beside him · L37 «عصبانی شو…» the anger burst
    { c: "c14", at: cut(S(36)), src: 0.1, land: [2.3, S(37)], z: [1.2, 1.28], f: [0.55, 0.5], mood: "red" },
    { c: "c09", at: cut(S(37)), src: 4.4, land: [5.85, S(38)], z: [1.2, 1.35], f: [0.6, 0.45], mood: "red" },
    // L38–39 every thoughtless reaction hands your peace away — the tangled head again, closer
    { c: "c02", at: cut(S(38)), src: 2.6, land: [5.85, S(40)], z: [1.3, 1.45], f: [0.5, 0.42], mood: "red" },
    // L40 «قدرت واقعی…» standing still · L41 «…خودت رو کنترل کنی» eyes closed, the calm ring
    { c: "c13", at: cut(S(40)), src: 0.3, land: [2.9, S(41)], z: [1.3, 1.36], f: [0.35, 0.5], mood: "night" },
    { c: "c14", at: cut(S(41)), src: 2.75, land: [5.85, S(42)], z: [1.16, 1.24], f: [0.5, 0.5], x: 8, mood: "night" },
    // L42–43 maybe tomorrow you fail again — walking on through the storm
    { c: "c07", at: cut(S(42)), src: 3.4, land: [5.72, S(44)], z: [1.35, 1.45], f: [0.55, 0.55], mood: "deep" },
    // L44–45 change how you look · L46–47 + ending: dawn over the mountains, hold, fade
    { c: "c16", at: cut(S(44)), src: 0.0, land: [3.6, S(46)], z: [1.0, 1.08], f: [0.4, 0.5], x: 10, mood: "night" },
    { c: "c16", at: cut(S(46)), src: 3.6, land: [5.85, END], z: [1.08, 1.0], f: [0.45, 0.5], mood: "gold" },
  ];
};
const rawShort = (): Sh[] => {
  const { S, wd } = mk(VOS.short), END = ENDS.short;
  return [
    { c: "c02", at: 0, src: 1.8, land: [5.85, S(2)], z: [1.0, 1.12], f: [0.5, 0.45], mood: "red" },
    { c: "c07", at: cut(S(2)), src: 2.5, land: [3.3, wd(2, "توفان")], z: [1.0, 1.06], f: [0.5, 0.5], mood: "night" },
    { c: "c07", at: cut(wd(2, "توفان")), src: 3.3, land: [5.85, S(4)], z: [1.06, 1.16], f: [0.5, 0.55], mood: "deep" },
    { c: "c14", at: cut(S(4)), src: 0.1, land: [2.3, S(5)], z: [1.2, 1.24], f: [0.4, 0.5], fx2: 0.5, mood: "red" },
    { c: "c14", at: cut(S(5)), src: 2.75, land: [5.7, S(6)], z: [1.16, 1.24], f: [0.5, 0.5], x: 8, mood: "night" },
    { c: "c16", at: cut(S(6)), src: 1.2, land: [5.85, END], z: [1.0, 1.1], f: [0.45, 0.5], x: 8, mood: "gold" },
  ];
};
const finish = (RAW: Sh[], END: number) => RAW.map((s, i) => {
  const to = i + 1 < RAW.length ? RAW[i + 1].at : END;
  const rate = s.land ? (s.land[0] - s.src) / (s.land[1] - s.at) : s.rate ?? 1;
  return { ...s, to, rate };
});
export const SHOTSX: Record<Cut, ReturnType<typeof finish>> = { full: finish(rawFull(), ENDS.full), short: finish(rawShort(), ENDS.short) };
export const SHOTS = SHOTSX.full;
// every clip is slowed: motion-interpolated 96 fps copies (ffmpeg minterpolate) → smooth slow motion
const SMOOTH = new Set(Array.from({ length: 16 }, (_, i) => "c" + String(i + 1).padStart(2, "0")));
const CLIP_DUR: Record<string, number> = Object.fromEntries([...SMOOTH].map((c) => [c, 5.93]));
export const shotTable = (cut: Cut = "full") => SHOTSX[cut].map((s, i, SH) => {
  const end = s.src + ((s.to - s.at) + (SH[i + 1]?.x ?? 0) / FPS) * s.rate;
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

const Shot: React.FC<{ s: (typeof SHOTS)[number]; ver: Ver; i: number; SH: typeof SHOTS }> = ({ s, ver, i, SH }) => {
  const f = useCurrentFrame(); // frame inside the sequence
  const L = LAY[ver];
  const nextX = SH[i + 1]?.x ?? 0;
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
        <OffthreadVideo src={staticFile(`v53/clips/${s.c}${SMOOTH.has(s.c) ? "s" : ""}.mp4`)} muted trimBefore={Math.round(s.src * FPS)} playbackRate={s.rate}
          style={{ width: "100%", height: "100%" }} />
      </div>
      <AbsoluteFill style={{ background: m.wash, opacity: m.washOp, mixBlendMode: "soft-light" }} />
      {flashOp > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flashOp }} />}
    </AbsoluteFill>
  );
};

/* ───────── captions: each script line split into ≤ 2-line chunks at punctuation; red = temptation, gold = freedom */
const RED = new Set(["عصبانی", "عصبانیت", "توفان", "تحریکت", "خراب", "کنترلت"]);
const GOLD = new Set(["رواقی‌گری", "انتخاب", "آرامش", "آرامشت", "قدرت", "مکث"]);
const goldOk = (line: number) => line >= 11;
type Chunk = { a: number; b: number; ws: { w: string; line: number }[] };
const chunkLine = (ws: VO["words"], max: number): VO["words"][] => {
  if (ws.length <= max) return [ws];
  const mid = ws.length / 2;
  let best = -1, bd = 1e9;
  ws.forEach((w, i) => { if (i < ws.length - 2 && i >= 1 && /[،؛:]$/.test(w.w)) { const d = Math.abs(i + 1 - mid); if (d < bd) { bd = d; best = i; } } });
  if (best < 0 || bd > ws.length * 0.3) best = Math.ceil(mid) - 1;
  return [...chunkLine(ws.slice(0, best + 1), max), ...chunkLine(ws.slice(best + 1), max)];
};
export const chunks = (max: number, cut: Cut = "full"): Chunk[] => {
  const V = VOS[cut];
  const out: Chunk[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n);
    for (const c of chunkLine(ws, max)) out.push({ a: c[0].s - 0.08, b: c[c.length - 1].e + 0.35, ws: c });
  }
  for (let i = 0; i < out.length - 1; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
};
const CH: Record<Cut, Record<Ver, Chunk[]>> = { full: { yt: chunks(9), reel: chunks(6) }, short: { yt: chunks(9, "short"), reel: chunks(6, "short") } };

const Captions: React.FC<{ t: number; ver: Ver; cut: Cut }> = ({ t, ver, cut }) => {
  const L = LAY[ver];
  const c = CH[cut][ver].find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const k = clamp01((t - c.a) / 0.18), out = clamp01((c.b - t) / 0.15);
  return (
    <div style={{ position: "absolute", left: 0, width: L.W, bottom: L.capBottom, display: "flex", justifyContent: "center", opacity: Math.min(k, out) }}>
      <div style={{ maxWidth: L.capMax, direction: "rtl", textAlign: "center", fontFamily: "H53Bold", fontSize: L.capSize, lineHeight: 1.5, color: "#F4F1EA",
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

export const Video: React.FC<{ ver?: Ver; cut?: Cut; audio?: string }> = ({ ver = "yt", cut = "full", audio }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const END = ENDS[cut], SH = SHOTSX[cut];
  const fadeOut = clamp01((END - t) / 1.4);
  const fadeIn = clamp01(t / 0.25);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {SH.map((s, i) => {
        const from = Math.round(s.at * FPS);
        const dur = Math.round(s.to * FPS) - from + (SH[i + 1]?.x ?? 0);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, dur)} layout="none">
            <Shot s={s} ver={ver} i={i} SH={SH} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${ver === "yt" ? 0.42 : 0.35}) 100%)` }} />
      <AbsoluteFill style={{ background: ver === "yt" ? "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(0,0,0,0.38) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 72%, rgba(0,0,0,0) 85%)" }} />
      <Captions t={t} ver={ver} cut={cut} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - Math.min(fadeOut, fadeIn) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = (cut: Cut) => [0.3, 2.0, ...SHOTSX[cut].map((s) => +(s.at + Math.min(1.2, (s.to - s.at) * 0.5)).toFixed(2)), ENDS[cut] - 2.2].sort((a, b) => a - b);
const fr = (c: Cut) => Math.round(ENDS[c] * FPS);

export const V53Compositions: React.FC = () => (
  <>
    <Composition id="V53" component={Video} durationInFrames={fr("full")} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver, cut: "full" as Cut, audio: "v53/mix.wav" }} />
    <Composition id="V53-Silent" component={Video} durationInFrames={fr("full")} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver, cut: "full" as Cut }} />
    <Composition id="V53-Short" component={Video} durationInFrames={fr("short")} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver, cut: "short" as Cut, audio: "v53/mix-short.wav" }} />
    <Composition id="V53-Short-Silent" component={Video} durationInFrames={fr("short")} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver, cut: "short" as Cut }} />
  </>
);
