// V13 · سریال «پیام صوتی» · قسمت ۱: چهلم — وحشت با عکس واقع‌گرای کاربر.
// دوربین آرام و نفس‌دار + لرزش دستی، دانه‌ی فیلم زنده، شمع لرزان (و خاموش‌شدنش)، سایه‌ی پا زیر در، لامپ چشمک‌زن،
// فلش‌های ناخودآگاه چشم، UI پیام صوتی روی صفحه‌ی گوشی (هوموگرافی)، جامپ‌اسکر آخر و کارت «ادامه دارد».
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v13 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V13Black", "fonts/Vazirmatn-Black.ttf"], ["V13Bold", "fonts/Vazirmatn-Bold.ttf"], ["V13Reg", "fonts/Vazirmatn-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»]/g, "");
const wd = (si: number, word: string) => {
  const w = words.find((x) => x.si === si && bare(x.w) === word) ?? words.find((x) => x.si === si && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const segStart = (si: number) => words.find((w) => w.si === si)!.s;
const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;
const fa = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ───── timeline ─────
const HOOK = 1.6;
const C1 = segEnd(0) + 0.5; // bed
const C2 = wd(1, "لرزید") - 0.05; // phone glow on face
const C3 = segStart(2) - 0.25; // phone in hand
const TAP = segEnd(2) + 0.45; // thumb plays the message
const C4 = segStart(3) - 0.6; // mother's photo
const CANDLE_OUT = wd(3, "نکن") + 0.15;
const C5 = segEnd(3) + 0.6; // her face again
const K1 = segEnd(4) + 0.55, K2 = K1 + 0.55, K3 = K1 + 1.1; // three knocks
const C6 = K3 + 0.4; // hallway
const C7 = segStart(6) - 2.7; // face at the peephole
const C8 = segStart(6) - 0.15; // POV through the peephole
const JUMP = segEnd(6) + 0.75;
const C10 = JUMP + 1.25; // black
const TOTAL = C10 + 5.6;
export const V13_FRAMES = Math.round(TOTAL * FPS);
const SUBLIM = [C1 - 0.07, C6 + 3.1]; // two-frame flashes of the eye

// ───── camera ─────
type Key = { t: number; fx: number; fy: number; s: number; ease?: number };
const camAt = (keys: Key[], T: number) => {
  let cur = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (T < k.t) break;
    const p = easeInOut(prog(T, k.t, k.t + (k.ease ?? 0.6)));
    cur = { t: k.t, fx: cur.fx + (k.fx - cur.fx) * p, fy: cur.fy + (k.fy - cur.fy) * p, s: cur.s + (k.s - cur.s) * p };
  }
  return cur;
};
type Place = { x: number; y: number; dw: number; dh: number };
const place = (fx: number, fy: number, s: number, T: number, shake = 0): Place => {
  const dw = W * s, dh = (W / IMG_AR) * s;
  // handheld: slow drift + breathing, plus optional jolt
  const hx = (noise(T * 0.6) - 0.5) * 18 + (noise(T * 2.1 + 9) - 0.5) * 5 + Math.sin(T * 63) * shake;
  const hy = (noise(T * 0.5 + 3) - 0.5) * 16 + Math.sin(T * 1.3) * 4 + Math.cos(T * 57) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });

const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number; blend?: string }> = ({ p, ix, iy, r, color, a, blend = "screen" }) => {
  const c = at(p, ix, iy), rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};
const flick = (T: number, seed = 0) => 0.75 + 0.18 * noise(T * 9 + seed) + 0.07 * Math.sin(T * 31 + seed);

// rect (w×h) → quad (TL, TR, BR, BL in px) as a CSS matrix3d
const quad = (w: number, h: number, q: { x: number; y: number }[]) => {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + hh * p3.x, c = p0.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + hh * p3.y, f = p0.y;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${c},${f},0,1)`;
};

// ───── shots ─────
type Shot = { img: string; from: number; to: number; keys: Key[]; shake?: (T: number) => number; grade?: (T: number) => string; extra?: (T: number, p: Place) => React.ReactNode; dip?: number };
const BASE_GRADE = "contrast(1.12) saturate(0.72) brightness(0.92)";

const SHOTS: Shot[] = [
  { // hook: the eye, glimpsed
    img: "v13/shot9.jpg", from: 0, to: HOOK,
    keys: [{ t: 0, fx: 0.5, fy: 0.46, s: 1.6 }, { t: 0.02, fx: 0.5, fy: 0.46, s: 1.25, ease: 1.5 }],
    grade: (T) => `${BASE_GRADE} brightness(${Math.floor(T * 14) % 3 === 0 ? 0.35 : 0.85})`,
  },
  { // 1 · after the ceremony
    img: "v13/shot1.jpg", from: HOOK, to: C1, dip: 0.35,
    keys: [{ t: HOOK, fx: 0.48, fy: 0.55, s: 1.02 }, { t: HOOK + 0.02, fx: 0.62, fy: 0.42, s: 1.32, ease: C1 - HOOK }],
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.927} iy={0.784} r={0.22} color="rgba(255,170,80,A)" a={0.45 * flick(T)} />
        <Glow p={p} ix={0.83} iy={0.36} r={0.16} color="rgba(0,0,0,A)" a={0.5 + 0.2 * Math.sin(T * 0.8)} blend="multiply" />
      </>
    ),
  },
  { // 2 · awake in bed
    img: "v13/shot2.jpg", from: C1, to: C2, dip: 0.2,
    keys: [{ t: C1, fx: 0.5, fy: 0.52, s: 1.04 }, { t: C1 + 0.02, fx: 0.4, fy: 0.6, s: 1.38, ease: C2 - C1 }],
  },
  { // 3 · the phone lights her face
    img: "v13/shot3.jpg", from: C2, to: C3,
    keys: [{ t: C2, fx: 0.5, fy: 0.4, s: 1.32 }, { t: C2 + 0.02, fx: 0.5, fy: 0.38, s: 1.18, ease: 0.25 }, { t: C2 + 0.3, fx: 0.5, fy: 0.37, s: 1.28, ease: C3 - C2 }],
    shake: (T) => (T < C2 + 0.9 ? 7 * (1 - prog(T, C2, C2 + 0.9)) : 0),
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.6} r={0.35} color="rgba(190,215,255,A)" a={0.22 + 0.2 * Math.max(0, Math.sin((T - C2) * 22)) * (T < C2 + 0.9 ? 1 : 0)} />,
  },
  { // 4 · the voice message
    img: "v13/shot4.jpg", from: C3, to: C4,
    keys: [{ t: C3, fx: 0.6, fy: 0.47, s: 1.25 }, { t: C3 + 0.02, fx: 0.62, fy: 0.43, s: 2.0, ease: 1.6 }, { t: C3 + 1.7, fx: 0.63, fy: 0.42, s: 2.25, ease: C4 - C3 - 1.7 }],
    extra: (T, p) => <PhoneUI T={T} p={p} />,
  },
  { // 5 · mother's photo; the candle dies on «نکن»
    img: "v13/shot5.jpg", from: C4, to: C5, dip: 0.3,
    keys: [{ t: C4, fx: 0.5, fy: 0.52, s: 1.02 }, { t: C4 + 0.02, fx: 0.5, fy: 0.42, s: 1.5, ease: C5 - C4 }],
    grade: (T) => `${BASE_GRADE} brightness(${T > CANDLE_OUT ? 0.92 - 0.45 * easeOut(prog(T, CANDLE_OUT, CANDLE_OUT + 0.35)) : 0.92})`,
    extra: (T, p) => {
      const out = T > CANDLE_OUT;
      const f = at(p, 0.833, 0.555);
      return (
        <>
          {!out && <Glow p={p} ix={0.833} iy={0.56} r={0.3} color="rgba(255,165,70,A)" a={0.5 * flick(T, 3)} />}
          {out && <div style={{ position: "absolute", left: f.x - 0.05 * p.dw, top: f.y - 0.06 * p.dw, width: 0.1 * p.dw, height: 0.12 * p.dw, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(10,8,6,0.97) 30%, rgba(10,8,6,0) 70%)" }} />}
          {out && T < CANDLE_OUT + 2.5 && <div style={{ position: "absolute", left: f.x - 30, top: f.y - 40 - (T - CANDLE_OUT) * 140, width: 60, height: 180, borderRadius: "50%", opacity: 0.25 * (1 - prog(T, CANDLE_OUT, CANDLE_OUT + 2.5)),
            background: "radial-gradient(ellipse, rgba(200,200,200,0.6), rgba(0,0,0,0) 70%)", filter: "blur(8px)" }} />}
        </>
      );
    },
  },
  { // 6 · her face; three knocks
    img: "v13/shot3.jpg", from: C5, to: C6, dip: 0.25,
    keys: [{ t: C5, fx: 0.5, fy: 0.36, s: 1.3 }, { t: C5 + 0.02, fx: 0.5, fy: 0.34, s: 1.75, ease: K1 - C5 }],
    shake: (T) => [K1, K2, K3].reduce((a, k) => a + (T > k && T < k + 0.25 ? 16 * (1 - prog(T, k, k + 0.25)) : 0), 0),
  },
  { // 7 · the hallway; feet in the light under the door
    img: "v13/shot6.jpg", from: C6, to: C7,
    keys: [{ t: C6, fx: 0.5, fy: 0.56, s: 1.0 }, { t: C6 + 0.02, fx: 0.5, fy: 0.46, s: 1.55, ease: C7 - C6 }],
    extra: (T, p) => {
      const sway = Math.sin((T - C6) * 1.3) * 0.006;
      return (
        <>
          <Glow p={p} ix={0.5} iy={0.665} r={0.16} color="rgba(255,190,110,A)" a={0.28 * flick(T, 7)} />
          {[0.475, 0.535].map((x, i) => { const c = at(p, x + sway, 0.664); return <div key={i} style={{ position: "absolute", left: c.x - 0.022 * p.dw, top: c.y - 0.006 * p.dw, width: 0.044 * p.dw, height: 0.012 * p.dw, borderRadius: "50%", background: "rgba(0,0,0,0.85)", filter: "blur(2px)" }} />; })}
        </>
      );
    },
  },
  { // 8 · face to the peephole
    img: "v13/shot7.jpg", from: C7, to: C8,
    keys: [{ t: C7, fx: 0.6, fy: 0.42, s: 1.12 }, { t: C7 + 0.02, fx: 0.68, fy: 0.34, s: 1.62, ease: C8 - C7 }],
    extra: (T, p) => <Glow p={p} ix={0.726} iy={0.365} r={0.14} color="rgba(255,210,120,A)" a={0.35 * flick(T, 11)} />,
  },
  { // 9 · through the peephole: empty landing, flickering bulb
    img: "v13/shot8.jpg", from: C8, to: JUMP,
    keys: [{ t: C8, fx: 0.5, fy: 0.5, s: 1.0 }, { t: C8 + 0.02, fx: 0.5, fy: 0.46, s: 1.22, ease: JUMP - C8 }],
    grade: (T) => `${BASE_GRADE} brightness(${noise(T * 7) > 0.78 ? 0.45 : 0.95})`,
    extra: (T, p) => <Glow p={p} ix={0.473} iy={0.323} r={0.12} color="rgba(255,240,150,A)" a={noise(T * 7) > 0.78 ? 0.05 : 0.45} />,
  },
  { // 10 · JUMP: the eye
    img: "v13/shot9.jpg", from: JUMP, to: C10,
    keys: [{ t: JUMP, fx: 0.5, fy: 0.47, s: 2.1 }, { t: JUMP + 0.01, fx: 0.5, fy: 0.47, s: 1.18, ease: 0.14 }, { t: JUMP + 0.2, fx: 0.5, fy: 0.47, s: 1.3, ease: 1.0 }],
    shake: (T) => 26 * (1 - prog(T, JUMP, JUMP + 0.9)) + 3,
    grade: (T) => `contrast(1.3) saturate(1.1) brightness(${1.6 - 0.6 * prog(T, JUMP, JUMP + 0.15)})`,
  },
];

const ShotView: React.FC<{ d: Shot; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  const p = place(c.fx, c.fy, c.s, T, d.shake?.(T) ?? 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: d.grade?.(T) ?? BASE_GRADE }}>
      <Img src={staticFile(d.img)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

// ───── phone UI mapped onto the screen of shot 4 (upper part only, the thumb stays visible) ─────
const SCREEN = [{ x: 0.566, y: 0.358 }, { x: 0.735, y: 0.371 }, { x: 0.701, y: 0.47 }, { x: 0.513, y: 0.462 }]; // TL TR BR BL (top half of the screen)
const PhoneUI: React.FC<{ T: number; p: Place }> = ({ T, p }) => {
  const q = SCREEN.map((s) => at(p, s.x, s.y));
  const notif = easeOut(prog(T, wd(2, "پیام") - 0.1, wd(2, "پیام") + 0.25));
  const playing = T > TAP;
  const pr = prog(T, TAP, TAP + 4);
  const bars = Array.from({ length: 22 }, (_, i) => 0.25 + 0.75 * hash(i * 3.7));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 300, transformOrigin: "0 0", transform: quad(400, 300, q), opacity: 0.96 }}>
      <div style={{ width: 400, height: 300, background: "linear-gradient(rgba(22,29,42,0.97) 0%, rgba(22,29,42,0.93) 72%, rgba(22,29,42,0) 100%)", borderRadius: "34px 34px 0 0", boxShadow: "0 0 40px rgba(170,200,255,0.25)", padding: "22px 20px", boxSizing: "border-box", direction: "rtl" }}>
        <div style={{ fontFamily: "V13Bold", fontSize: 30, color: "#C9D3E6", textAlign: "center", marginBottom: 14 }}>{fa("03:07")}</div>
        <div style={{ opacity: notif, transform: `translateY(${(1 - notif) * -30}px)`, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 22, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
            <Img src={staticFile("v13/shot5.jpg")} style={{ position: "absolute", width: 300, left: -100, top: -105, filter: "grayscale(0.4)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "V13Black", fontSize: 28, color: "#fff" }}>مامان 🖤</div>
            {!playing ? (
              <div style={{ fontFamily: "V13Reg", fontSize: 24, color: "#AEB9CF" }}>🎤 پیام صوتی · {fa("0:04")}</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 3, height: 34, direction: "ltr" }}>
                {bars.map((b, i) => <div key={i} style={{ width: 6, height: 30 * b * (0.7 + 0.3 * Math.sin(T * 12 + i)), borderRadius: 3, background: i / bars.length < pr ? "#E8574F" : "#5D6A85" }} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ───── voice-message bubble for mother's lines (shot 5 and shot 9) ─────
const MomBubble: React.FC<{ T: number }> = ({ T }) => {
  const segs = [3, 6].filter((si) => T > segStart(si) - 0.5 && T < segEnd(si) + 0.6);
  if (!segs.length) return null;
  const si = segs[0];
  const a = easeOut(prog(T, segStart(si) - 0.5, segStart(si) - 0.2)) * (1 - prog(T, segEnd(si) + 0.3, segEnd(si) + 0.6));
  const pr = prog(T, segStart(si), segEnd(si));
  const ws = words.filter((w) => w.si === si);
  const bars = Array.from({ length: 30 }, (_, i) => 0.2 + 0.8 * hash(i * 5.3 + si));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, opacity: a }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 30, background: "rgba(18,22,30,0.82)", border: "1px solid rgba(232,87,79,0.4)", direction: "ltr" }}>
        <div style={{ width: 0, height: 0, borderLeft: "22px solid #E8574F", borderTop: "14px solid transparent", borderBottom: "14px solid transparent" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, height: 44 }}>
          {bars.map((b, i) => <div key={i} style={{ width: 7, height: 40 * b * (i / bars.length < pr ? 0.75 + 0.25 * Math.sin(T * 14 + i) : 1), borderRadius: 4, background: i / bars.length < pr ? "#E8574F" : "#56607A" }} />)}
        </div>
        <div style={{ fontFamily: "V13Bold", fontSize: 30, color: "#AEB9CF" }}>{fa(`0:0${Math.min(4, Math.floor(pr * 4))}`)}</div>
      </div>
      <div style={{ direction: "rtl", fontFamily: "V13Bold", fontSize: 58, color: "#F2B8B3", textShadow: "0 0 18px rgba(232,87,79,0.55), 0 4px 18px #000", textAlign: "center", maxWidth: 940 }}>
        {ws.map((w, j) => <span key={j} style={{ opacity: T >= w.s - 0.05 ? 1 : 0 }}>{w.w}{j < ws.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

// Mahak's whispered lines: word-by-word reveal, slight flicker
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const si = [0, 1, 2, 4, 5].find((k) => T > segStart(k) - 0.1 && T < segEnd(k) + 0.7);
  if (si === undefined) return null;
  const ws = words.filter((w) => w.si === si);
  // split long lines in two halves
  const half = ws.length > 6 ? Math.ceil(ws.length / 2) : ws.length;
  const part = ws.length > 6 && T >= ws[half].s - 0.05 ? ws.slice(half) : ws.slice(0, half);
  const fade = 1 - prog(T, segEnd(si) + 0.35, segEnd(si) + 0.7);
  const fl = 0.85 + 0.15 * noise(T * 11);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, textAlign: "center", direction: "rtl", fontFamily: "V13Bold", fontSize: 60, lineHeight: 1.5,
      color: "#EDEFF4", textShadow: "0 0 20px rgba(0,0,0,0.95), 0 3px 12px #000", opacity: fade * fl }}>
      {part.map((w, j) => {
        const a = easeOut(prog(T, w.s - 0.08, w.s + 0.12));
        return <span key={j} style={{ opacity: a, filter: `blur(${(1 - a) * 6}px)` }}>{w.w}{j < part.length - 1 ? " " : ""}</span>;
      })}
    </div>
  );
};

const Clock: React.FC<{ T: number }> = ({ T }) => {
  const a = wd(1, "ساعت") - 0.1;
  if (T < a || T > C3) return null;
  const o = easeOut(prog(T, a, a + 0.3)) * (1 - prog(T, C3 - 0.3, C3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: "V13Black", fontSize: 150, color: `rgba(255,60,50,${0.9 * o})`,
      textShadow: `0 0 40px rgba(255,40,30,${0.7 * o})`, letterSpacing: 6, opacity: Math.floor(T * 1.5) % 2 ? 1 : 0.85 }}>
      {fa("03:07")}
    </div>
  );
};

const Hook: React.FC<{ T: number }> = ({ T }) => {
  if (T > HOOK + 0.2) return null;
  const a = prog(T, 0.35, 0.6) * (1 - prog(T, HOOK - 0.1, HOOK + 0.2));
  const gl = Math.floor(T * 20) % 4 === 0 ? 8 : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: a, direction: "rtl" }}>
      <div style={{ fontFamily: "V13Black", fontSize: 130, color: "#F4F1EC", textShadow: `${gl}px 0 rgba(232,30,40,0.8), ${-gl}px 0 rgba(40,160,255,0.6), 0 0 40px #000` }}>پیام صوتی</div>
      <div style={{ fontFamily: "V13Bold", fontSize: 48, color: "#E8574F", textShadow: "0 0 20px #000" }}>قسمت ۱ · چهلم</div>
    </div>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < C10) return null;
  const n = easeOut(prog(T, C10 + 1.0, C10 + 1.4));
  const t2 = prog(T, C10 + 2.6, C10 + 3.2);
  const buzz = T > C10 + 0.9 && T < C10 + 2.0 ? Math.sin(T * 120) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 640, left: 90, right: 90, opacity: n, transform: `translate(${buzz}px, ${(1 - n) * -40}px)`, display: "flex", alignItems: "center", gap: 22, padding: "24px 28px",
        borderRadius: 32, background: "rgba(40,44,54,0.92)", direction: "rtl", boxShadow: "0 0 60px rgba(232,87,79,0.25)" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <Img src={staticFile("v13/shot5.jpg")} style={{ position: "absolute", width: 470, left: -158, top: -165, filter: "grayscale(0.5)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "V13Black", fontSize: 44, color: "#fff" }}>مامان 🖤</div>
          <div style={{ fontFamily: "V13Reg", fontSize: 36, color: "#C7CEDD" }}>🎤 پیام صوتی · {fa("0:01")}</div>
        </div>
        <div style={{ marginRight: "auto", fontFamily: "V13Reg", fontSize: 32, color: "#8D96AA" }}>الان</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", direction: "rtl", opacity: t2 * (0.85 + 0.15 * noise(T * 10)) }}>
        <div style={{ fontFamily: "V13Black", fontSize: 84, color: "#F4F1EC" }}>ادامه دارد…</div>
        <div style={{ fontFamily: "V13Bold", fontSize: 46, color: "#E8574F", marginTop: 14 }}>قسمت ۲</div>
      </div>
    </AbsoluteFill>
  );
};

// living film grain (seed changes every frame)
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "overlay", opacity: 0.22 }}>
    <filter id={`g13_${f % 24}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter={`url(#g13_${f % 24})`} />
  </svg>
);

const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((d, i) => {
    if (T < d.from || T >= d.to) return;
    layers.push(<AbsoluteFill key={i}><ShotView d={d} T={T} /></AbsoluteFill>);
  });
  // dip to black at the start of shots that ask for it
  const cur = SHOTS.find((d) => T >= d.from && T < d.to);
  const dip = cur?.dip ? 1 - easeOut(prog(T, cur.from, cur.from + cur.dip)) : 0;
  const sub = SUBLIM.some((s) => T >= s && T < s + 2 / FPS);
  const knockFlash = [K1, K2, K3].some((k) => T >= k && T < k + 2 / FPS);
  const jump = T >= JUMP && T < JUMP + 0.12 ? 1 - prog(T, JUMP, JUMP + 0.12) : 0;
  const breathe = 0.5 + 0.06 * Math.sin(T * 1.7);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {layers}
      {sub && <AbsoluteFill><ShotView d={SHOTS[10]} T={JUMP + 0.3} /></AbsoluteFill>}
      {jump > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.85 * jump})` }} />}
      {T >= JUMP && T < C10 && <AbsoluteFill style={{ background: "rgba(200,0,10,0.12)", mixBlendMode: "screen", transform: `translateX(${Math.sin(T * 90) * 14}px)` }} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,${breathe}) 82%, rgba(0,0,0,0.85) 100%)` }} />
      {dip > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dip})` }} />}
      {knockFlash && <AbsoluteFill style={{ background: "rgba(0,0,0,0.75)" }} />}
      <Grain f={f} />
      <Hook T={T} />
      <Clock T={T} />
      <Captions T={T} />
      <MomBubble T={T} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} f={t !== undefined ? Math.round(t * FPS) : f} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const LOOK = [0.05, 0.9, 3.5, 7.2, 10.2, C2 + 0.2, 12.8, 14.5, TAP + 0.8, 19.5, CANDLE_OUT + 0.5, 26, K1 + 0.03, C6 + 1.5, C6 + 4.5, C7 + 1.5, 41, JUMP + 0.05, JUMP + 0.6, C10 + 1.6, C10 + 4.2];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V13: React.FC = () => (
  <>
    <Composition id="V13" component={Video} durationInFrames={V13_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v13/mix.wav" }} />
    <Composition id="V13-Silent" component={Video} durationInFrames={V13_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V13-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
