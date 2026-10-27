// V15 · سریال «پیام صوتی» · قسمت ۲: نشونه‌ها — همان زبان قسمت ۱ (src/v13).
// دوربین آرام و نفس‌دار + لرزش دستی، دانه‌ی فیلم زنده، شمع لرزان (و خاموش‌شدنش)، سایه‌ی پا زیر در، لامپ چشمک‌زن،
// فلش‌های ناخودآگاه چشم، UI پیام صوتی روی صفحه‌ی گوشی (هوموگرافی)، جامپ‌اسکر آخر و کارت «ادامه دارد».
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v15 fonts") : 0;
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
const C1 = segEnd(0) + 0.4; // phone: new voice message
const NOTIF = C1 + 0.35;
const TAP = segStart(1) - 0.45;
const BANG = segEnd(1) + 0.15; // the kitchen window flies open
const C3 = segEnd(2) + 0.35; // hand at the light switch
const LIGHT = segEnd(3) + 0.7; // the light turns on by itself: the woman in black
const POP = LIGHT + 1.15; // bulb bursts → dark
const C5 = POP + 0.45; // back against the wall, phone light only
const STEPS = segEnd(5) + 0.1; // footsteps on the ceiling
const C6 = STEPS - 0.2; // looking up
const C7 = wd(6, "ولی") - 0.12; // the empty flat upstairs
const C8 = segStart(7) - 0.5; // the hand
const SCARE = segEnd(7) + 0.45;
const C10 = SCARE + 0.9;
const TOTAL = C10 + 5.4;
export const V15_FRAMES = Math.round(TOTAL * FPS);
const SUBLIM = [C1 - 0.07, C7 + 2.6]; // two-frame flashes of the woman

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
const Rain: React.FC<{ p: Place; T: number; x0: number; y0: number; x1: number; y1: number; a?: number }> = ({ p, T, x0, y0, x1, y1, a = 0.5 }) => {
  const A = at(p, x0, y0), B = at(p, x1, y1);
  return (
    <div style={{ position: "absolute", left: A.x, top: A.y, width: B.x - A.x, height: B.y - A.y, overflow: "hidden", opacity: a }}>
      {Array.from({ length: 40 }, (_, i) => { const y = ((hash(i) + T * (1.6 + hash(i + 3))) % 1.2) - 0.1; return <div key={i} style={{ position: "absolute", left: `${hash(i + 7) * 100}%`, top: `${y * 100}%`, width: 2, height: 46, background: "rgba(200,220,255,0.7)", transform: "rotate(12deg)" }} />; })}
    </div>
  );
};
const Dust: React.FC<{ p: Place; T: number; ix: number; iy: number; spread: number; fall: number; n?: number }> = ({ p, T, ix, iy, spread, fall, n = 60 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const ph = (T * (0.18 + hash(i) * 0.2) + hash(i + 2)) % 1;
      const c = at(p, ix + (hash(i + 5) - 0.5) * spread + Math.sin(T + i) * 0.01, iy + ph * fall);
      return <div key={i} style={{ position: "absolute", left: c.x, top: c.y, width: 3 + hash(i) * 3, height: 3 + hash(i) * 3, borderRadius: "50%", background: "rgba(235,235,225,0.85)", opacity: Math.sin(ph * Math.PI) * 0.9 }} />;
    })}
  </>
);

const SHOTS: Shot[] = [
  { // hook: the woman in black, glimpsed
    img: "v15/shot4.jpg", from: 0, to: HOOK,
    keys: [{ t: 0, fx: 0.72, fy: 0.5, s: 2.0 }, { t: 0.02, fx: 0.72, fy: 0.48, s: 1.6, ease: 1.5 }],
    grade: (T) => `${BASE_GRADE} brightness(${(Math.floor(T * 14) + 1) % 3 === 0 ? 0.25 : 0.7})`,
  },
  { // 1 · against the wall
    img: "v15/shot1.jpg", from: HOOK, to: C1, dip: 0.35,
    keys: [{ t: HOOK, fx: 0.5, fy: 0.55, s: 1.02 }, { t: HOOK + 0.02, fx: 0.55, fy: 0.42, s: 1.35, ease: C1 - HOOK }],
    extra: (T, p) => <Glow p={p} ix={0.635} iy={0.367} r={0.08} color="rgba(255,230,120,A)" a={0.5 * flick(T, 2)} />,
  },
  { // 2 · the phone: a new voice message (ep1 still)
    img: "v13/shot4.jpg", from: C1, to: BANG,
    keys: [{ t: C1, fx: 0.62, fy: 0.44, s: 1.6 }, { t: C1 + 0.02, fx: 0.63, fy: 0.42, s: 2.25, ease: BANG - C1 }],
    shake: (T) => (T < NOTIF + 0.6 && T > NOTIF ? 6 : 0),
    extra: (T, p) => <PhoneUI T={T} p={p} />,
  },
  { // 3 · the kitchen window flies open
    img: "v15/shot2.jpg", from: BANG, to: C3,
    keys: [{ t: BANG, fx: 0.4, fy: 0.42, s: 1.5 }, { t: BANG + 0.01, fx: 0.42, fy: 0.45, s: 1.12, ease: 0.25 }, { t: BANG + 0.3, fx: 0.45, fy: 0.45, s: 1.3, ease: C3 - BANG }],
    shake: (T) => 22 * (1 - prog(T, BANG, BANG + 0.7)),
    extra: (T, p) => (
      <>
        <Rain p={p} T={T} x0={0.12} y0={0.22} x1={0.52} y1={0.56} />
        <Moving p={p} img="v15/shot2.jpg" x0={0.15} y0={0.12} x1={0.8} y1={0.62} tf={`skewX(${Math.sin(T * 3.1) * 4 + Math.sin(T * 7.3) * 1.5}deg) translateX(${Math.sin(T * 2.3) * 14}px)`} />
        <Glow p={p} ix={0.33} iy={0.4} r={0.3} color="rgba(150,190,255,A)" a={0.18 + 0.1 * noise(T * 4)} />
      </>
    ),
  },
  { // 4 · hand at the switch
    img: "v15/shot3.jpg", from: C3, to: LIGHT,
    keys: [{ t: C3, fx: 0.4, fy: 0.45, s: 1.12 }, { t: C3 + 0.02, fx: 0.3, fy: 0.42, s: 1.6, ease: LIGHT - C3 }],
    extra: (T, p) => <Glow p={p} ix={0.53} iy={0.67} r={0.12} color="rgba(180,205,255,A)" a={0.3 * flick(T, 4)} />,
  },
  { // 5 · the light turns on by itself — she is there; three jump cuts closer, then the bulb bursts
    img: "v15/shot4.jpg", from: LIGHT, to: POP,
    keys: [{ t: LIGHT, fx: 0.55, fy: 0.5, s: 1.0 }, { t: LIGHT + 0.4, fx: 0.68, fy: 0.5, s: 1.35, ease: 0.04 }, { t: LIGHT + 0.8, fx: 0.71, fy: 0.47, s: 1.8, ease: 0.04 }],
    grade: (T) => `contrast(1.15) saturate(0.85) brightness(${noise(T * 18) > 0.75 ? 0.4 : 1.0})`,
    extra: (T, p) => (
      <>
        <Glow p={p} ix={0.592} iy={0.165} r={0.18} color="rgba(255,240,150,A)" a={noise(T * 18) > 0.75 ? 0.05 : 0.5} />
        <Rain p={p} T={T} x0={0.02} y0={0.18} x1={0.3} y1={0.53} a={0.35} />
      </>
    ),
  },
  { // 6 · darkness, phone light only; then her voice again
    img: "v15/shot1.jpg", from: C5, to: C6, dip: 0.6,
    keys: [{ t: C5, fx: 0.4, fy: 0.42, s: 1.5 }, { t: C5 + 0.02, fx: 0.38, fy: 0.4, s: 1.85, ease: C6 - C5 }],
    grade: () => "contrast(1.25) saturate(0.6) brightness(0.62)",
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.6} r={0.25} color="rgba(180,205,255,A)" a={0.28} />,
  },
  { // 7 · footsteps on the ceiling: dust falls
    img: "v15/shot5.jpg", from: C6, to: C7,
    keys: [{ t: C6, fx: 0.5, fy: 0.4, s: 1.05 }, { t: C6 + 0.02, fx: 0.52, fy: 0.3, s: 1.4, ease: C7 - C6 }],
    shake: (T) => [0, 0.55, 1.1, 1.65, 2.2].reduce((a, k) => a + (T > STEPS + k && T < STEPS + k + 0.15 ? 5 : 0), 0),
    extra: (T, p) => (
      <>
        <Dust p={p} T={T} ix={0.56} iy={0.2} spread={0.2} fall={0.25} />
        <Glow p={p} ix={0.49} iy={0.61} r={0.1} color="rgba(220,235,255,A)" a={0.45 * flick(T, 6)} />
      </>
    ),
  },
  { // 8 · the flat upstairs: empty for six months, fresh footprints
    img: "v15/shot6.jpg", from: C7, to: C8, dip: 0.25,
    keys: [{ t: C7, fx: 0.5, fy: 0.6, s: 1.02 }, { t: C7 + 0.02, fx: 0.62, fy: 0.5, s: 1.45, ease: C8 - C7 }],
    extra: (T, p) => (
      <>
        <Dust p={p} T={T * 0.4} ix={0.4} iy={0.35} spread={0.4} fall={0.3} n={45} />
        <Glow p={p} ix={0.33} iy={0.42} r={0.25} color="rgba(170,200,255,A)" a={0.22 + 0.06 * Math.sin(T * 1.5)} />
      </>
    ),
  },
  { // 9 · «پشتِ سرت…» the hand creeps onto her shoulder
    img: "v15/shot7.jpg", from: C8, to: C10,
    keys: [{ t: C8, fx: 0.5, fy: 0.45, s: 1.05 }, { t: C8 + 0.02, fx: 0.55, fy: 0.45, s: 1.3, ease: SCARE - C8 }, { t: SCARE, fx: 0.72, fy: 0.5, s: 2.1, ease: 0.12 }],
    shake: (T) => (T > SCARE ? 20 * (1 - prog(T, SCARE, SCARE + 0.8)) + 3 : 0),
    grade: (T) => (T > SCARE ? `contrast(1.3) brightness(${1.5 - 0.5 * prog(T, SCARE, SCARE + 0.15)})` : BASE_GRADE),
    extra: (T, p) => <Moving p={p} img="v15/shot7.jpg" x0={0.66} y0={0.5} x1={1.0} y1={0.75} origin="100% 50%" tf={`translate(${(1 - easeInOut(prog(T, C8, SCARE))) * 40}px, ${(1 - easeInOut(prog(T, C8, SCARE))) * -18}px)`} />,
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
  const notif = easeOut(prog(T, NOTIF, NOTIF + 0.35));
  const playing = T > TAP;
  const pr = prog(T, TAP, TAP + 4);
  const bars = Array.from({ length: 22 }, (_, i) => 0.25 + 0.75 * hash(i * 3.7));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 300, transformOrigin: "0 0", transform: quad(400, 300, q), opacity: 0.96 }}>
      <div style={{ width: 400, height: 300, background: "linear-gradient(rgba(22,29,42,0.97) 0%, rgba(22,29,42,0.93) 72%, rgba(22,29,42,0) 100%)", borderRadius: "34px 34px 0 0", boxShadow: "0 0 40px rgba(170,200,255,0.25)", padding: "22px 20px", boxSizing: "border-box", direction: "rtl" }}>
        <div style={{ fontFamily: "V13Bold", fontSize: 30, color: "#C9D3E6", textAlign: "center", marginBottom: 14 }}>{fa("03:12")}</div>
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


// ───── voice-message bubble for mother's lines  ─────
const MomBubble: React.FC<{ T: number }> = ({ T }) => {
  const segs = [1, 3, 5, 7].filter((si) => T > segStart(si) - 0.5 && T < segEnd(si) + 0.6);
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
  const si = [0, 2, 4, 6].find((k) => T > segStart(k) - 0.1 && T < segEnd(k) + 0.7);
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


const Hook: React.FC<{ T: number }> = ({ T }) => {
  if (T > HOOK + 0.2) return null;
  const a = prog(T, 0.35, 0.6) * (1 - prog(T, HOOK - 0.1, HOOK + 0.2));
  const gl = Math.floor(T * 20) % 4 === 0 ? 8 : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: a, direction: "rtl" }}>
      <div style={{ fontFamily: "V13Black", fontSize: 130, color: "#F4F1EC", textShadow: `${gl}px 0 rgba(232,30,40,0.8), ${-gl}px 0 rgba(40,160,255,0.6), 0 0 40px #000` }}>پیام صوتی</div>
      <div style={{ fontFamily: "V13Bold", fontSize: 48, color: "#E8574F", textShadow: "0 0 20px #000" }}>قسمت ۲ · نشونه‌ها</div>
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
          <div style={{ fontFamily: "V13Reg", fontSize: 36, color: "#C7CEDD" }}>🎤 پیام صوتی · {fa("0:03")}</div>
        </div>
        <div style={{ marginRight: "auto", fontFamily: "V13Reg", fontSize: 32, color: "#8D96AA" }}>الان</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", direction: "rtl", opacity: t2 * (0.85 + 0.15 * noise(T * 10)) }}>
        <div style={{ fontFamily: "V13Black", fontSize: 84, color: "#F4F1EC" }}>ادامه دارد…</div>
        <div style={{ fontFamily: "V13Bold", fontSize: 46, color: "#E8574F", marginTop: 14 }}>قسمت ۳</div>
      </div>
    </AbsoluteFill>
  );
};

// living film grain (seed changes every frame)

// living film grain (seed changes every frame)
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "overlay", opacity: 0.22 }}>
    <filter id={`g15_${f % 24}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter={`url(#g15_${f % 24})`} />
  </svg>
);


const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const cur = SHOTS.find((d) => T >= d.from && T < d.to);
  const dip = cur?.dip ? 1 - easeOut(prog(T, cur.from, cur.from + cur.dip)) : 0;
  const sub = SUBLIM.some((s) => T >= s && T < s + 2 / FPS);
  const bang = T >= BANG && T < BANG + 0.1 ? 1 - prog(T, BANG, BANG + 0.1) : 0;
  const popF = T >= POP - 0.05 && T < POP + 0.08 ? 1 : 0;
  const scare = T >= SCARE && T < SCARE + 0.12 ? 1 - prog(T, SCARE, SCARE + 0.12) : 0;
  const breathe = 0.5 + 0.06 * Math.sin(T * 1.7);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {cur && <AbsoluteFill><ShotView d={cur} T={T} /></AbsoluteFill>}
      {sub && <AbsoluteFill><ShotView d={SHOTS[5]} T={LIGHT + 0.9} /></AbsoluteFill>}
      {bang > 0 && <AbsoluteFill style={{ background: `rgba(210,225,255,${0.6 * bang})` }} />}
      {popF > 0 && <AbsoluteFill style={{ background: "rgba(255,250,220,0.9)" }} />}
      {scare > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.85 * scare})` }} />}
      {T >= SCARE && T < C10 && <AbsoluteFill style={{ background: "rgba(200,0,10,0.12)", mixBlendMode: "screen", transform: `translateX(${Math.sin(T * 90) * 14}px)` }} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 38%, rgba(0,0,0,${breathe}) 82%, rgba(0,0,0,0.85) 100%)` }} />
      {dip > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dip})` }} />}
      <Grain f={f} />
      <Hook T={T} />
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


const LOOK = [0.05, 1.0, 4.0, 8.0, NOTIF + 0.5, TAP + 0.8, BANG + 0.05, BANG + 1.2, 16.5, C3 + 1.5, 21.0, LIGHT + 0.2, LIGHT + 0.9, C5 + 1.5, 33.0, C6 + 1.2, C6 + 3.0, C7 + 1.5, C7 + 4.0, C8 + 1.5, SCARE + 0.05, C10 + 1.6, C10 + 4.0];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V15: React.FC = () => (
  <>
    <Composition id="V15" component={Video} durationInFrames={V15_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v15/mix.wav" }} />
    <Composition id="V15-Silent" component={Video} durationInFrames={V15_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V15-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
