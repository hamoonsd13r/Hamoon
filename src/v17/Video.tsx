// V17 · سریال «پیام صوتی» · قسمت ۳: صدای مامان — همان زبان قسمت ۱ و ۲ (src/v13، src/v15).
// دوربین آرام و نفس‌دار + لرزش دستی، دانه‌ی فیلم زنده، شمع لرزان (و خاموش‌شدنش)، سایه‌ی پا زیر در، لامپ چشمک‌زن،
// فلش‌های ناخودآگاه چشم، UI پیام صوتی روی صفحه‌ی گوشی (هوموگرافی)، جامپ‌اسکر آخر و کارت «ادامه دارد».
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v17 fonts") : 0;
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
const wd = (si: number, word: string, occ = 0) => {
  const w = words.filter((x) => x.si === si && bare(x.w) === word)[occ] ?? words.filter((x) => x.si === si && x.w.includes(word))[occ];
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const segStart = (si: number) => words.find((w) => w.si === si)!.s;
const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;
const fa = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ───── timeline ─────
const HOOK = 1.6;
const C2 = wd(0, "وقتی") - 0.15; // she opens her eyes: the empty hallway
const C3 = segEnd(0) + 0.5; // the front door; mother's voice behind it
const C4 = segEnd(1) + 0.3; // ear against the door
const C5 = segStart(3) - 1.0; // phone: «اونی که پشتِ دره… من نیستم»
const NOTIF = C5 + 0.25;
const TAP = segStart(3) - 0.35;
const C6 = segEnd(3) + 0.6; // fingers under the door
const C7 = segEnd(4) + 0.9; // the knob turns
const C8 = segEnd(5) + 0.6; // her lit face; «این پیام‌ها رو من نمی‌فرستم»
const C9 = segEnd(6) + 0.55; // sender number
const C10 = wd(7, "شماره‌ی", 1) - 0.2; // the reflection
const STING = segEnd(7) + 0.6;
const C11 = STING + 0.9;
const TOTAL = C11 + 5.4;
export const V17_FRAMES = Math.round(TOTAL * FPS);
const SUBLIM = [C4 - 0.07, C8 + 2.4]; // two-frame flashes of the smiling reflection

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

// a masked copy of part of the still, moved by a transform (curtain in the wind, the creeping hand)
const Moving: React.FC<{ p: Place; img: string; x0: number; y0: number; x1: number; y1: number; tf: string; origin?: string }> = ({ p, img, x0, y0, x1, y1, tf, origin = "50% 0%" }) => {
  const a = at(p, x0, y0), b = at(p, x1, y1);
  return (
    <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, overflow: "hidden",
      WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)", maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 55%, transparent 100%)" }}>
      <div style={{ position: "absolute", inset: 0, transform: tf, transformOrigin: origin }}>
        <Img src={staticFile(img)} style={{ position: "absolute", left: p.x - a.x, top: p.y - a.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      </div>
    </div>
  );
};
const SHOTS: Shot[] = [
  { // hook: fingers under the door, glimpsed
    img: "v17/shot6.jpg", from: 0, to: HOOK,
    keys: [{ t: 0, fx: 0.5, fy: 0.42, s: 1.9 }, { t: 0.02, fx: 0.5, fy: 0.44, s: 1.45, ease: 1.5 }],
    grade: (T) => `${BASE_GRADE} brightness(${(Math.floor(T * 14) + 1) % 3 === 0 ? 0.25 : 0.75})`,
  },
  { // 1 · eyes shut, counting
    img: "v17/shot1.jpg", from: HOOK, to: C2, dip: 0.35,
    keys: [{ t: HOOK, fx: 0.5, fy: 0.42, s: 1.05 }, { t: HOOK + 0.02, fx: 0.5, fy: 0.36, s: 1.45, ease: C2 - HOOK }],
    shake: (T) => 1.5 + Math.sin(T * 3) * 0.5,
  },
  { // 2 · she looks back: nobody
    img: "v17/shot2.jpg", from: C2, to: C3,
    keys: [{ t: C2, fx: 0.4, fy: 0.42, s: 1.35 }, { t: C2 + 0.02, fx: 0.55, fy: 0.42, s: 1.15, ease: C3 - C2 }],
  },
  { // 3 · the front door; her voice behind it; feet shift in the light
    img: "v17/shot3.jpg", from: C3, to: C4, dip: 0.3,
    keys: [{ t: C3, fx: 0.5, fy: 0.55, s: 1.02 }, { t: C3 + 0.02, fx: 0.52, fy: 0.62, s: 1.4, ease: C4 - C3 }],
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.66} iy={0.68} r={0.2} color="rgba(255,190,110,A)" a={0.3 * flick(T, 5)} />
        <Moving p={p} img="v17/shot3.jpg" x0={0.3} y0={0.66} x1={0.75} y1={0.95} origin="50% 0%" tf={`skewX(${Math.sin(T * 0.9) * 3}deg) translateX(${Math.sin(T * 0.9) * 8}px)`} />
      </>
    ),
  },
  { // 4 · ear against the door
    img: "v17/shot4.jpg", from: C4, to: C5,
    keys: [{ t: C4, fx: 0.45, fy: 0.4, s: 1.1 }, { t: C4 + 0.02, fx: 0.55, fy: 0.36, s: 1.5, ease: C5 - C4 }],
    extra: (T, p) => <Glow p={p} ix={0.62} iy={0.8} r={0.15} color="rgba(255,190,110,A)" a={0.3 * flick(T, 9)} />,
  },
  { // 5 · the phone: «اونی که پشتِ دره… من نیستم»
    img: "v13/shot4.jpg", from: C5, to: C6,
    keys: [{ t: C5, fx: 0.62, fy: 0.44, s: 1.6 }, { t: C5 + 0.02, fx: 0.63, fy: 0.42, s: 2.25, ease: C6 - C5 }],
    shake: (T) => (T < NOTIF + 0.6 && T > NOTIF ? 6 : 0),
    extra: (T, p) => <PhoneUI T={T} p={p} mode="msg" />,
  },
  { // 6 · fingers slide in under the door
    img: "v17/shot6.jpg", from: C6, to: C7, dip: 0.3,
    keys: [{ t: C6, fx: 0.5, fy: 0.45, s: 1.15 }, { t: C6 + 0.02, fx: 0.55, fy: 0.42, s: 1.55, ease: C7 - C6 }],
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.55} iy={0.39} r={0.25} color="rgba(255,190,110,A)" a={0.3 * flick(T, 13)} />
        <Moving p={p} img="v17/shot6.jpg" x0={0.15} y0={0.33} x1={0.95} y1={0.62} origin="50% 0%" tf={`translateY(${easeInOut(prog(T, C6, C7)) * 26 + Math.sin(T * 17) * 1.5}px) scale(${1 + 0.04 * prog(T, C6, C7)})`} />
      </>
    ),
  },
  { // 7 · the knob turns from the other side
    img: "v17/shot5.jpg", from: C7, to: C8,
    keys: [{ t: C7, fx: 0.55, fy: 0.5, s: 1.15 }, { t: C7 + 0.02, fx: 0.55, fy: 0.52, s: 1.55, ease: C8 - C7 }],
    extra: (T, p) => {
      const turn = easeInOut(prog(T, wd(5, "چرخید") - 0.9, wd(5, "چرخید") + 0.4));
      return (
        <>
          <Moving p={p} img="v17/shot5.jpg" x0={0.46} y0={0.52} x1={0.76} y1={0.69} origin="50% 50%" tf={`rotate(${-38 * turn + Math.sin(T * 30) * 0.6 * turn}deg)`} />
          <Glow p={p} ix={0.6} iy={0.8} r={0.12} color="rgba(255,190,110,A)" a={0.35 * flick(T, 3)} />
        </>
      );
    },
  },
  { // 8 · her face lit by the phone (ep1 still): «این پیام‌ها رو من نمی‌فرستم»
    img: "v13/shot3.jpg", from: C8, to: C9, dip: 0.25,
    keys: [{ t: C8, fx: 0.5, fy: 0.38, s: 1.2 }, { t: C8 + 0.02, fx: 0.5, fy: 0.35, s: 1.6, ease: C9 - C8 }],
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.6} r={0.35} color="rgba(190,215,255,A)" a={0.22} />,
  },
  { // 9 · the sender's number — her own
    img: "v13/shot4.jpg", from: C9, to: C10,
    keys: [{ t: C9, fx: 0.63, fy: 0.42, s: 2.0 }, { t: C9 + 0.02, fx: 0.63, fy: 0.42, s: 2.5, ease: C10 - C9 }],
    extra: (T, p) => <PhoneUI T={T} p={p} mode="sender" />,
  },
  { // 10 · the reflection smiles at us; sting
    img: "v17/shot7.jpg", from: C10, to: C11,
    keys: [{ t: C10, fx: 0.4, fy: 0.42, s: 1.1 }, { t: C10 + 0.02, fx: 0.62, fy: 0.42, s: 1.45, ease: STING - C10 }, { t: STING, fx: 0.74, fy: 0.42, s: 2.3, ease: 0.12 }],
    shake: (T) => (T > STING ? 20 * (1 - prog(T, STING, STING + 0.8)) + 3 : 0),
    grade: (T) => (T > STING ? `contrast(1.3) brightness(${1.5 - 0.5 * prog(T, STING, STING + 0.15)})` : BASE_GRADE),
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



// ───── phone UI mapped onto the screen of the ep1 phone still (upper part only, the thumb stays visible) ─────
const SCREEN = [{ x: 0.566, y: 0.358 }, { x: 0.735, y: 0.371 }, { x: 0.701, y: 0.47 }, { x: 0.513, y: 0.462 }]; // TL TR BR BL (top half of the screen)
const PhoneUI: React.FC<{ T: number; p: Place; mode: "msg" | "sender" }> = ({ T, p, mode }) => {
  const q = SCREEN.map((s) => at(p, s.x, s.y));
  const notif = easeOut(prog(T, NOTIF, NOTIF + 0.35));
  const playing = T > TAP;
  const pr = prog(T, TAP, TAP + 3);
  const bars = Array.from({ length: 22 }, (_, i) => 0.25 + 0.75 * hash(i * 3.7));
  const reveal = easeOut(prog(T, C9 + 0.3, C9 + 0.8));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 300, transformOrigin: "0 0", transform: quad(400, 300, q), opacity: 0.96 }}>
      <div style={{ width: 400, height: 300, background: "linear-gradient(rgba(22,29,42,0.97) 0%, rgba(22,29,42,0.93) 72%, rgba(22,29,42,0) 100%)", borderRadius: "34px 34px 0 0", boxShadow: "0 0 40px rgba(170,200,255,0.25)", padding: "22px 20px", boxSizing: "border-box", direction: "rtl" }}>
        <div style={{ fontFamily: "V13Bold", fontSize: 30, color: "#C9D3E6", textAlign: "center", marginBottom: 14 }}>{fa("03:19")}</div>
        {mode === "msg" ? (
          <div style={{ opacity: notif, transform: `translateY(${(1 - notif) * -30}px)`, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 22, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
              <Img src={staticFile("v13/shot5.jpg")} style={{ position: "absolute", width: 300, left: -100, top: -105, filter: "grayscale(0.4)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "V13Black", fontSize: 28, color: "#fff" }}>مامان 🖤</div>
              {!playing ? (
                <div style={{ fontFamily: "V13Reg", fontSize: 24, color: "#AEB9CF" }}>🎤 پیام صوتی · {fa("0:03")}</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 3, height: 34, direction: "ltr" }}>
                  {bars.map((b, i) => <div key={i} style={{ width: 6, height: 30 * b * (0.7 + 0.3 * Math.sin(T * 12 + i)), borderRadius: 3, background: i / bars.length < pr ? "#E8574F" : "#5D6A85" }} />)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: "12px 16px", borderRadius: 22, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ fontFamily: "V13Reg", fontSize: 24, color: "#AEB9CF" }}>اطلاعات فرستنده</div>
            <div style={{ fontFamily: "V13Black", fontSize: 40, color: "#fff", direction: "ltr", textAlign: "right", marginTop: 6 }}>{fa("0912 487 3052")}</div>
            <div style={{ opacity: reveal, fontFamily: "V13Black", fontSize: 30, color: "#E8574F", marginTop: 4 }}>ماهک (من)</div>
          </div>
        )}
      </div>
    </div>
  );
};


// ───── voice-message bubble for mother's lines  ─────
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
  const si = [0, 2, 5, 7].find((k) => T > segStart(k) - 0.1 && T < segEnd(k) + 0.7);
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



// mother's voice from behind the door (lines 2 and 5): warm, then wrong
const DoorVoice: React.FC<{ T: number }> = ({ T }) => {
  const si = [1, 4].find((k) => T > segStart(k) - 0.1 && T < segEnd(k) + 0.6);
  if (si === undefined) return null;
  const ws = words.filter((w) => w.si === si);
  const fade = 1 - prog(T, segEnd(si) + 0.3, segEnd(si) + 0.6);
  const wrong = si === 4;
  const jit = wrong ? Math.sin(T * 47) * 3 : 0;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1400, textAlign: "center", direction: "rtl", opacity: fade }}>
      <div style={{ fontFamily: "V13Reg", fontSize: 34, color: wrong ? "#B84040" : "#D9B98A", marginBottom: 8, letterSpacing: 1 }}>{wrong ? "پشتِ در…" : "از پشتِ در:"}</div>
      <div style={{ fontFamily: "V13Bold", fontSize: 60, lineHeight: 1.5, color: wrong ? "#E36B6B" : "#F3DDB8", transform: `translateX(${jit}px)`,
        textShadow: wrong ? "0 0 22px rgba(200,0,0,0.6), 0 3px 12px #000" : "0 0 18px rgba(255,190,110,0.45), 0 3px 12px #000" }}>
        {ws.map((w, j) => { const a = easeOut(prog(T, w.s - 0.08, w.s + 0.15)); return <span key={j} style={{ opacity: a, filter: `blur(${(1 - a) * 6}px)` }}>{w.w}{j < ws.length - 1 ? " " : ""}</span>; })}
      </div>
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
      <div style={{ fontFamily: "V13Bold", fontSize: 48, color: "#E8574F", textShadow: "0 0 20px #000" }}>قسمت ۳ · صدای مامان</div>
    </div>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < C11) return null;
  const n = easeOut(prog(T, C11 + 1.0, C11 + 1.4));
  const t2 = prog(T, C11 + 2.6, C11 + 3.2);
  const buzz = T > C11 + 0.9 && T < C11 + 2.0 ? Math.sin(T * 120) * 6 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 640, left: 90, right: 90, opacity: n, transform: `translate(${buzz}px, ${(1 - n) * -40}px)`, display: "flex", alignItems: "center", gap: 22, padding: "24px 28px",
        borderRadius: 32, background: "rgba(40,44,54,0.92)", direction: "rtl", boxShadow: "0 0 60px rgba(232,87,79,0.25)" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <Img src={staticFile("v13/shot5.jpg")} style={{ position: "absolute", width: 470, left: -158, top: -165, filter: "grayscale(0.5)" }} />
        </div>
        <div>
          <div style={{ fontFamily: "V13Black", fontSize: 44, color: "#fff" }}>مامان 🖤</div>
          <div style={{ fontFamily: "V13Reg", fontSize: 36, color: "#C7CEDD" }}>🎤 پیام صوتی · {fa("0:03")}</div>
        </div>
        <div style={{ marginRight: "auto", fontFamily: "V13Reg", fontSize: 32, color: "#8D96AA" }}>الان</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", direction: "rtl", opacity: t2 * (0.85 + 0.15 * noise(T * 10)) }}>
        <div style={{ fontFamily: "V13Black", fontSize: 84, color: "#F4F1EC" }}>ادامه دارد…</div>
        <div style={{ fontFamily: "V13Bold", fontSize: 46, color: "#E8574F", marginTop: 14 }}>قسمت آخر</div>
      </div>
    </AbsoluteFill>
  );
};


// living film grain (seed changes every frame)

// living film grain (seed changes every frame)
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "overlay", opacity: 0.22 }}>
    <filter id={`g17_${f % 24}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter={`url(#g17_${f % 24})`} />
  </svg>
);



const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const cur = SHOTS.find((d) => T >= d.from && T < d.to);
  const dip = cur?.dip ? 1 - easeOut(prog(T, cur.from, cur.from + cur.dip)) : 0;
  const sub = SUBLIM.some((s) => T >= s && T < s + 2 / FPS);
  const sting = T >= STING && T < STING + 0.12 ? 1 - prog(T, STING, STING + 0.12) : 0;
  const breathe = 0.5 + 0.06 * Math.sin(T * 1.7);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cur && <AbsoluteFill><ShotView d={cur} T={T} /></AbsoluteFill>}
      {sub && <AbsoluteFill><ShotView d={SHOTS[10]} T={STING + 0.5} /></AbsoluteFill>}
      {sting > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.85 * sting})` }} />}
      {T >= STING && T < C11 && <AbsoluteFill style={{ background: "rgba(200,0,10,0.12)", mixBlendMode: "screen", transform: `translateX(${Math.sin(T * 90) * 14}px)` }} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,${breathe}) 82%, rgba(0,0,0,0.85) 100%)` }} />
      {dip > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dip})` }} />}
      <Grain f={f} />
      <Hook T={T} />
      <Captions T={T} />
      <DoorVoice T={T} />
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



const LOOK = [0.05, 1.0, 4.5, C2 + 1.2, C3 + 1.5, C3 + 3.5, C4 + 2.5, NOTIF + 0.5, TAP + 1.0, C6 + 1.5, C6 + 4.0, C7 + 1.5, C7 + 4.0, C8 + 2.0, C9 + 1.0, C9 + 2.0, C10 + 0.8, STING + 0.05, C11 + 1.6, C11 + 4.0];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V17: React.FC = () => (
  <>
    <Composition id="V17" component={Video} durationInFrames={V17_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v17/mix.wav" }} />
    <Composition id="V17-Silent" component={Video} durationInFrames={V17_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V17-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
