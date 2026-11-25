// V63 · «هر کسی فقط یه قانون» — Persian version (with the creator's permission, credit in the caption) of
// cannonanimates' "In This Town, Everyone Gets One Rule" (Victor Crane → بهرام سلطانی). Built from the user's 30 Google
// Flow stills (uploads/v63 → public/v63/img, 1920×1080 cover crops) on the user's ElevenLabs narration (Mark →
// tools/v63-voice.py → public/v63/vo.wav + src/v63/vo.json). The rules written in the Golden Book and the red «نه!» /
// green «آره!» stamps are drawn in code (OVERLAYS). Captions sit low.
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
  if (!h) throw new Error("v63 word " + l + " " + w);
  return h.s;
};

const fh = typeof document !== "undefined" ? delayRender("v63 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H63Black", "fonts/Vazirmatn-Black.ttf"], ["Naskh63", "fonts/NotoNaskhArabic.ttf"], ["Lale63", "fonts/Lalezar-Regular.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: img · at · zoom [a,b] · focus from f to f2 */
type Sh = { img: string; at: number; z: [number, number]; f: [number, number]; f2?: [number, number]; };
const cut = (t: number) => +(t - 0.07).toFixed(3);
export const END = +(E(41) + 2.2).toFixed(2);
type O = Partial<Pick<Sh, "z" | "f" | "f2">>;
const RAW: [string, number, O?][] = [
  ["01", 0, { z: [1.0, 1.1], f: [0.5, 0.55] }],                                     // L1 twelfth birthday, one rule
  ["02", cut(S(2)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                            // L2 the Hall of Rules
  ["03", cut(wd(2, "یه")), { z: [1.15, 1.3], f: [0.5, 0.4] }],                    // one sentence in the Golden Book
  ["03", cut(S(3)), { z: [1.3, 1.15], f: [0.5, 0.75] }],                           // L3 a world made by twelve-year-olds
  ["04", cut(S(4)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                            // L4 dogs live as long as people
  ["05", cut(S(5)), { z: [1.0, 1.08], f: [0.4, 0.5] }],                            // L5 never rains on Fridays
  ["06", cut(S(6)), { z: [1.0, 1.1], f: [0.35, 0.5] }],                            // L6 grandma's cookies
  ["07", cut(S(7)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                            // L7 broccoli tastes like candy
  ["08", cut(S(8)), { z: [1.0, 1.12], f: [0.5, 0.5] }],                            // L8 you can never erase one
  ["09", cut(S(9)), { z: [1.0, 1.08], f: [0.5, 0.45] }],                           // L9 thirty years ago, Bahram Soltani
  ["09", cut(S(10)), { z: [1.4, 1.5], f: [0.5, 0.6] }],                            // L10 his rule (card)
  ["10", cut(S(11)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                          // L11 running the world, says no
  ["11", cut(S(12)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L12 no to noon school, no to puppies
  ["12", cut(S(13)), { z: [1.0, 1.1], f: [0.4, 0.5] }],                            // L13 no to the hungry girl
  ["10", cut(S(14)), { z: [1.6, 1.7], f: [0.45, 0.3] }],                           // L14 yes only to himself
  ["13", cut(S(15)), { z: [1.0, 1.06], f: [0.5, 0.5] }],                           // L15 Soltani Day
  ["13", cut(wd(15, "عکس")), { z: [1.6, 1.7], f: [0.4, 0.55] }],                 // his face on every coin
  ["01", cut(S(16)), { z: [1.5, 1.6], f: [0.5, 0.6] }],                            // L16 every birthday song
  ["14", cut(S(17)), { z: [1.0, 1.1], f: [0.48, 0.4] }],                           // L17 a statue in every town
  ["10", cut(S(18)), { z: [1.25, 1.35], f: [0.4, 0.5] }],                          // L18 kids tried everything
  ["15", cut(S(19)), { z: [1.0, 1.1], f: [0.5, 0.45] }],                           // L19 tiny letters — no!
  ["16", cut(S(20)), { z: [1.0, 1.1], f: [0.5, 0.35] }],                           // L20 through the roof — no!
  ["17", cut(S(21)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L21 invisible ink — no!
  ["10", cut(S(22)), { z: [1.7, 1.8], f: [0.45, 0.3] }],                           // L22 nobody beats Bahram Soltani
  ["18", cut(S(23)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L23 today I turned twelve
  ["19", cut(S(24)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L24 I walked into the Hall
  ["19", cut(wd(24, "کنار")), { z: [1.6, 1.7], f: [0.72, 0.4] }],                // there he was, smiling
  ["20", cut(S(25)), { z: [1.0, 1.08], f: [0.5, 0.5] }],                           // L25 the guards searched me
  ["21", cut(S(26)), { z: [1.2, 1.3], f: [0.45, 0.4] }],                           // L26 «don't try anything clever»
  ["22", cut(S(27)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L27 one short line, slid it across
  ["22", cut(S(28)), { z: [1.5, 1.6], f: [0.5, 0.65] }],                           // L28 the rule (card)
  ["23", cut(S(29)), { z: [1.0, 1.1], f: [0.4, 0.45] }],                           // L29 he laughed
  ["24", cut(S(30)), { z: [1.0, 1.1], f: [0.45, 0.5] }],                           // L30 the stamp — yes!
  ["25", cut(S(31)), { z: [1.0, 1.1], f: [0.45, 0.45] }],                          // L31 the world groaned
  ["26", cut(S(32)), { z: [1.0, 1.06], f: [0.55, 0.45] }],                         // L32 then it hit him
  ["26", cut(S(33)), { z: [1.6, 1.7], f: [0.75, 0.35] }],                          // L33 every new rule auto-approved
  ["03", cut(S(34)), { z: [1.4, 1.55], f: [0.55, 0.35] }],                         // L34 every rule he said no to, waiting
  ["27", cut(S(35)), { z: [1.15, 1.0], f: [0.5, 0.5] }],                           // L35 the building shook
  ["27", cut(S(36)), { z: [1.0, 1.15], f: [0.5, 0.5] }],                           // L36 thirty years of rules at once
  ["28", cut(S(37)), { z: [1.0, 1.1], f: [0.4, 0.55] }],                           // L37 puppies, noon school
  ["29", cut(S(38)), { z: [1.0, 1.1], f: [0.5, 0.5] }],                            // L38 nobody hungry
  ["03", cut(S(39)), { z: [1.6, 1.75], f: [0.5, 0.4] }],                           // L39 one more rule in that book
  ["30", cut(S(40)), { z: [1.0, 1.06], f: [0.5, 0.55] }],                          // L40 the bathroom rule (card)
  ["30", cut(S(41)), { z: [1.3, 1.4], f: [0.5, 0.55] }],                           // L41 approved
];
export const SHOTS = RAW.map(([img, at, o], i) => ({ img, at, to: i + 1 < RAW.length ? RAW[i + 1][1] : END, z: [1, 1.06] as [number, number], f: [0.5, 0.5] as [number, number], ...(o ?? {}) } as Sh & { to: number }));

/* ───────── hits: shake + flash */
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
        <Img src={staticFile(`v63/img/${s.img}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
      </div>
      <AbsoluteFill style={{ background: "rgba(14,20,52,1)", opacity: 0.1, mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};


/* ───────── written words, drawn in code: a page of the Golden Book with the rule, and rubber stamps */
type Ov = { a: number; b: number; text: string };
export const OVERLAYS: Ov[] = [
  { a: wd(10, "از") - 0.1, b: E(10) + 0.4, text: "هر قانونِ جدید باید اجازه‌ی بهرام سلطانی رو داشته باشه." },
  { a: S(28) - 0.1, b: E(28) + 0.5, text: "بهرام سلطانی همه‌ی قانون‌های جدید رو تأیید می‌کنه." },
  { a: S(40) - 0.1, b: S(41) + 0.05, text: "بهرام سلطانی باید همه‌ی دستشویی‌های دنیا رو بشوره." },
];
export const STAMPS: { t: number; b: number; ok?: boolean; text: string; x: number; y: number; r: number }[] = [
  { t: wd(12, "نه"), b: wd(12, "نه", 2) - 0.05, text: "نه!", x: 0.3, y: 0.42, r: -12 },
  { t: wd(12, "نه", 2), b: E(12) + 0.2, text: "نه!", x: 0.68, y: 0.4, r: 10 },
  { t: wd(13, "نه"), b: E(13) + 0.2, text: "نه!", x: 0.32, y: 0.4, r: -8 },
  { t: wd(19, "نه"), b: E(19) + 0.3, text: "نه!", x: 0.5, y: 0.4, r: -10 },
  { t: wd(20, "نه"), b: E(20) + 0.3, text: "نه!", x: 0.5, y: 0.4, r: 8 },
  { t: wd(21, "نه"), b: E(21) + 0.3, text: "نه!", x: 0.5, y: 0.4, r: -6 },
  { t: wd(30, "آره"), b: E(30) + 0.5, ok: true, text: "آره!", x: 0.62, y: 0.4, r: -8 },
  { t: S(41), b: E(41) + 2.2, ok: true, text: "تأیید شد", x: 0.5, y: 0.38, r: -7 },
];
export const HITS: { t: number; amp: number; flash?: boolean }[] = [
  ...STAMPS.map((x) => ({ t: x.t, amp: x.ok ? 10 : 6, flash: x.ok })),
  { t: wd(30, "تق"), amp: 9 }, { t: S(35), amp: 12 }, { t: S(35) + 0.5, amp: 10 }, { t: S(36), amp: 8, flash: true },
];
const Overlays: React.FC<{ t: number }> = ({ t }) => {
  const o = OVERLAYS.find((x) => t >= x.a && t < x.b);
  const st = STAMPS.filter((x) => t >= x.t - 0.08 && t < x.b);
  return (
    <>
      {o && (() => {
        const k = clamp01((t - o.a) / 0.25), op = Math.min(k, clamp01((o.b - t) / 0.2));
        const rev = clamp01((t - o.a - 0.2) / Math.min(2.2, (o.b - o.a) * 0.6));  // ink appears right-to-left
        return (
          <div style={{ position: "absolute", left: 0, width: W, top: H * 0.07, display: "flex", justifyContent: "center", opacity: op }}>
            <div style={{ transform: `rotate(-2deg) scale(${0.85 + 0.15 * ease(k)})`, width: 1240, padding: "34px 70px 40px", borderRadius: 18, direction: "rtl", textAlign: "center",
              background: "radial-gradient(ellipse at 50% 40%, #FFF8E1 0%, #F6E3B0 100%)", border: "10px solid #C9952B", outline: "4px solid #7a5310",
              boxShadow: "0 0 50px rgba(255,200,80,0.7), 0 20px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ fontFamily: "Lale63", fontSize: 44, color: "#9a6a12", marginBottom: 8 }}>✦ کتابِ طلایی ✦</div>
              <div style={{ fontFamily: "Naskh63", fontSize: 86, lineHeight: 1.45, color: "#2a1b06", clipPath: `inset(0 0 0 ${100 - 100 * rev}%)` }}>{o.text}</div>
            </div>
          </div>
        );
      })()}
      {st.map((x, i) => {
        const d = t - x.t, land = clamp01((d + 0.08) / 0.12), sc = 2.4 - 1.4 * ease(land), op = Math.min(land * 1.5, clamp01((x.b - t) / 0.2));
        const c = x.ok ? "#1FB24A" : "#E02A2A";
        return (
          <div key={i} style={{ position: "absolute", left: x.x * W - 360, top: x.y * H - 170, width: 720, height: 340, display: "flex", alignItems: "center", justifyContent: "center", opacity: op,
            transform: `rotate(${x.r}deg) scale(${sc})` }}>
            <div style={{ fontFamily: "Lale63", fontSize: x.text.length > 4 ? 170 : 230, lineHeight: 1, color: c, direction: "rtl", padding: "10px 60px 30px",
              border: `16px solid ${c}`, borderRadius: 30, background: "rgba(255,255,255,0.12)", textShadow: "0 6px 0 rgba(0,0,0,0.25)",
              boxShadow: "0 0 0 6px rgba(255,255,255,0.65), 0 18px 30px rgba(0,0,0,0.35)" }}>{x.text}</div>
          </div>
        );
      })}
    </>
  );
};

/* ───────── captions (V54 look) */
const RED = new Set(["نه", "آره", "سلطانی", "بهرام", "قانون", "تق", "کتاب", "طلایی", "دوازده‌ساله", "گرسنه", "دستشویی‌های", "تأیید", "آبنبات", "توله‌سگ", "مجسمه‌ی", "نامرئی", "ظهر"]);
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
      <div style={{ direction: "rtl", textAlign: "center", fontFamily: "H63Black", fontSize: 92, lineHeight: 1.25, color: "#FFFFFF", WebkitTextStroke: "14px #000", paintOrder: "stroke fill",
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
export const V63Compositions: React.FC = () => (
  <>
    <Composition id="V63" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{ audio: "v63/mix.wav" }} />
    <Composition id="V63-Silent" component={Video} durationInFrames={DUR} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
