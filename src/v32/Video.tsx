// V32 · «یه هفته توی تخت‌جمشید» — قسمت کامران به‌عنوان کارگر تخت‌جمشید.
// زبان V04/V05: عکس واقع‌گرای کاربر (Gemini) + دوربین کلیدفریمی + ۳ کلیپ Veo، به‌اضافه‌ی روزشمار هفته،
// المان‌های کدی (تاج، مهر، کارت جیره، دیوار لوح، نمودار جیره، نقشه، فیش حقوقی، کارت آخر) و زیرنویس کلمه‌ای.
// نریشن: صدای خود کاربر (public/v32/voice.wav)، زمان کلمه‌ها از words.json (eleven-align).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Freeze, Html5Audio, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";
import land from "../lib/geo/land.json";

type Word = { si: number; wi: number; w: string; s: number; e: number };
const WORDS = wordsJson as Word[];

const FPS = 30;
const W = 1080;
const H = 1920;
const IMG_AR = 1438 / 2576;
const VID_AR = 720 / 1280;
const GOLD = "#F2C14E";
const INK = "#2B1D10";
const PAPER = "#EBDDBE";

const fontHandle = typeof document !== "undefined" ? delayRender("v32 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V32Black", "fonts/Vazirmatn-Black.ttf"], ["V32Bold", "fonts/Vazirmatn-Bold.ttf"], ["V32Num", "fonts/Lalezar-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lineWords = (n: number) => WORDS.filter((w) => w.si === n);
const wd = (line: number, word: string) => {
  const w = lineWords(line).find((x) => x.w.includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const wdEnd = (line: number, word: string) => lineWords(line).find((x) => x.w.includes(word))!.e;
const lineStart = (n: number) => lineWords(n)[0].s;
const cut = (n: number) => lineStart(n) - 0.12;
const LAST = WORDS[WORDS.length - 1].e;
export const TOTAL = Math.round((LAST + 1.9) * 100) / 100;
export const V32_FRAMES = Math.round(TOTAL * FPS);

// ───────── camera ─────────
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
const place = (fx: number, fy: number, s: number, T: number, ar: number, shake = 0): Place => {
  const dw = W * s;
  const dh = (W / ar) * s;
  const hx = Math.sin(T * 0.9) * 3 + Math.sin(T * 2.3) * 1.5 + Math.sin(T * 61) * shake;
  const hy = Math.cos(T * 0.7) * 3 + Math.sin(T * 1.9) * 1.5 + Math.cos(T * 53) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });

type ShotDef = {
  from: number; to: number;
  img?: string; vid?: { src: string; start: number; still?: string }; ar?: number;
  keys?: Key[];
  shake?: (T: number) => number;
  filter?: (T: number) => string | undefined;
  custom?: (T: number) => React.ReactNode;
  extra?: (T: number, p: Place) => React.ReactNode;
  day?: number;
};

const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number }> = ({ p, ix, iy, r, color, a }) => {
  const c = at(p, ix, iy);
  const rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: "screen",
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};

// floating dust motes in warm light (deterministic)
const Dust: React.FC<{ T: number; n?: number; a?: number }> = ({ T, n = 26, a = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const r1 = Math.sin(i * 12.9898) * 43758.5453; const f1 = r1 - Math.floor(r1);
      const r2 = Math.sin(i * 78.233) * 12543.123; const f2 = r2 - Math.floor(r2);
      const sp = 14 + f2 * 26;
      const x = ((f1 * W + T * sp * (f2 > 0.5 ? 1 : -0.6)) % W + W) % W;
      const y = ((f2 * H - T * (8 + f1 * 14)) % H + H) % H;
      const sz = 2 + f1 * 5;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%",
        background: `rgba(255,228,170,${a * (0.35 + 0.65 * Math.abs(Math.sin(T * (0.6 + f2) + i)))})`, filter: "blur(1px)" }} />;
    })}
  </AbsoluteFill>
);

// ───────── small UI pieces ─────────
const Chip: React.FC<{ x: number; y: number; p: number; children: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number; anchor?: "c" | "r" | "l" }> =
  ({ x, y, p, children, bg = "rgba(20,14,8,0.82)", color = "#fff", size = 50, rot = 0, anchor = "c" }) => {
    if (p <= 0) return null;
    const s = backOut(clamp(p));
    const tx = anchor === "c" ? "-50%" : anchor === "r" ? "-100%" : "0%";
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(${tx}, -50%) rotate(${rot}deg) scale(${0.4 + 0.6 * s})`, opacity: clamp(p * 3),
        direction: "rtl", whiteSpace: "nowrap", fontFamily: "V32Black", fontSize: size, color, background: bg, padding: `${size * 0.12}px ${size * 0.5}px ${size * 0.22}px`,
        borderRadius: size * 0.36, boxShadow: "0 10px 30px rgba(0,0,0,0.45)", border: `3px solid ${GOLD}` }}>
        {children}
      </div>
    );
  };

const Stamp: React.FC<{ x: number; y: number; t0: number; T: number; text: string; color?: string; size?: number; rot?: number }> = ({ x, y, t0, T, text, color = "#B3261E", size = 92, rot = -9 }) => {
  if (T < t0) return null;
  const q = prog(T, t0, t0 + 0.14);
  const s = 1.9 - 0.9 * easeOut(q);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: clamp(q * 2.5),
      direction: "rtl", whiteSpace: "nowrap", fontFamily: "V32Black", fontSize: size, color, padding: `${size * 0.05}px ${size * 0.35}px ${size * 0.14}px`,
      border: `${size * 0.075}px solid ${color}`, borderRadius: size * 0.18, background: "rgba(245,235,215,0.16)",
      textShadow: "0 0 1px rgba(0,0,0,0.2)", mixBlendMode: "normal", boxShadow: "0 0 0 2px rgba(0,0,0,0.05)" }}>
      {text}
    </div>
  );
};

// SVG icons (line style, warm ink)
const Icon: React.FC<{ k: "wheat" | "wine" | "beer" | "sheep" | "crown"; s?: number; c?: string }> = ({ k, s = 64, c = INK }) => {
  const st = { fill: "none", stroke: c, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      {k === "wheat" && <g {...st}><path d="M32 60V14" />{[18, 27, 36, 45].map((y) => <g key={y}><path d={`M32 ${y + 6}c-9-2-13-8-13-14 7 1 12 6 13 14z`} /><path d={`M32 ${y + 6}c9-2 13-8 13-14-7 1-12 6-13 14z`} /></g>)}</g>}
      {k === "wine" && <g {...st}><path d="M24 6h16M26 6v8c-8 5-12 13-12 22 0 12 8 22 18 22s18-10 18-22c0-9-4-17-12-22V6" /><path d="M16 34h32" /></g>}
      {k === "beer" && <g {...st}><path d="M14 18h30v38H14z" /><path d="M44 26h8v20h-8" /><path d="M14 18c0-6 6-9 10-7 2-4 10-5 13 0 5-2 9 2 7 7" /><path d="M23 28v20M33 28v20" /></g>}
      {k === "sheep" && <g {...st}><path d="M18 34c-6 0-8-8-2-11 0-7 9-9 12-4 4-5 13-4 14 2 7-1 10 7 5 11 2 6-4 10-9 8-3 4-11 4-14 0-5 2-10-1-6-6z" /><path d="M46 30c4-3 10-1 10 4s-5 6-9 4" /><path d="M24 44v12M38 44v12" /></g>}
      {k === "crown" && <g {...st} strokeWidth={4}><path d="M8 50h48l4-30-14 12-14-20-14 20L4 20z" fill="rgba(242,193,78,0.9)" stroke={INK} /><path d="M10 56h44" /></g>}
    </svg>
  );
};

// ───────── custom scenes ─────────
// real Persepolis Fortification tablets → a growing wall of them («هزاران‌تا»)
const TabletWall: React.FC<{ T: number }> = ({ T }) => {
  const t0 = cut(9);
  const many = wd(9, "هزاران") - 0.1;
  const pIn = easeOut(prog(T, t0, t0 + 0.5));
  const grow = prog(T, many, many + 1.6);
  const cols = 6, rows = 11, tw = W / cols, th = H / rows;
  const spots = [[0.19, 0.18], [0.29, 0.2], [0.42, 0.18], [0.46, 0.33], [0.2, 0.43], [0.45, 0.52], [0.14, 0.66], [0.46, 0.66], [0.1, 0.86], [0.17, 0.85], [0.29, 0.85], [0.44, 0.82], [0.64, 0.33], [0.67, 0.73]];
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const h = Math.sin(i * 91.7) * 1000; const f = h - Math.floor(h);
    const d = Math.hypot(c - cols / 2 + 0.5, r - rows / 2 + 0.5) / 7;
    const q = easeOut(prog(grow, d * 0.55, d * 0.55 + 0.35));
    if (q <= 0) continue;
    const sp = spots[Math.floor(f * spots.length)];
    const z = 5.2;
    tiles.push(
      <div key={i} style={{ position: "absolute", left: c * tw + 4, top: r * th + 4, width: tw - 8, height: th - 8, borderRadius: 10, overflow: "hidden",
        opacity: q, transform: `scale(${0.6 + 0.4 * q}) rotate(${(f - 0.5) * 6}deg)`, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile("v32/tablets.jpg")} style={{ position: "absolute", width: (tw - 8) * z, height: ((tw - 8) * z * 960) / 1280, maxWidth: "none",
          left: -(sp[0] * (tw - 8) * z) + (tw - 8) / 2, top: -(sp[1] * ((tw - 8) * z * 960) / 1280) + (th - 8) / 2, filter: "sepia(0.25) contrast(1.08)" }} />
      </div>,
    );
  }
  const photoS = 1 - 0.18 * easeInOut(grow);
  return (
    <AbsoluteFill style={{ background: "#120c07" }}>
      <AbsoluteFill style={{ transform: `scale(${1.15 + T * 0.004})` }}>
        <Img src={staticFile("v32/img3.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(26px) brightness(0.45) saturate(0.8)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.92 }}>{tiles}</AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(10,7,4,${0.45 * grow})` }} />
      <div style={{ position: "absolute", left: W / 2, top: 760, transform: `translate(-50%,-50%) rotate(${-3 + 2 * pIn}deg) scale(${(0.7 + 0.3 * backOut(pIn)) * photoS})`, opacity: clamp(pIn * 2),
        background: "#f4eee2", padding: "18px 18px 70px", borderRadius: 8, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", width: 916, boxSizing: "border-box" }}>
        <Img src={staticFile("v32/tablets.jpg")} style={{ width: 880, height: 660, maxWidth: "none", objectFit: "cover", display: "block", transform: `scale(${1 + 0.06 * prog(T, t0, t0 + 6)})` }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", direction: "rtl", fontFamily: "V32Black", fontSize: 40, color: INK }}>
          لوح‌های واقعیِ باروی تخت‌جمشید
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1255, textAlign: "center", fontFamily: "V32Bold", fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
        Photo: Pfa16 · CC BY-SA 4.0 · Wikimedia Commons
      </div>
    </AbsoluteFill>
  );
};

// map: workers came from half the world
const LON0 = 18, LON1 = 78, LAT0 = 47, LAT1 = 11, KX = 0.86;
const MK = W / ((LON1 - LON0) * KX);
const MAP_Y0 = 470;
const proj = (lon: number, lat: number) => ({ x: (lon - LON0) * KX * MK, y: MAP_Y0 + (LAT0 - lat) * MK });
const LAND_PATH = (() => {
  const polys: number[][][] = [];
  const g = land as unknown as { type: string; coordinates: number[][][][] | number[][][] };
  const all = (g.type === "MultiPolygon" ? (g.coordinates as number[][][][]).flat() : (g.coordinates as number[][][]));
  for (const ring of all) {
    if (!ring.some(([lo, la]) => lo > LON0 - 15 && lo < LON1 + 15 && la > LAT1 - 15 && la < LAT0 + 15)) continue;
    polys.push(ring);
  }
  return polys.map((r) => r.map(([lo, la], i) => { const p = proj(lo, la); return `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join("") + "Z").join("");
})();
const PERS = proj(52.89, 29.93);
const ORIGINS = [
  { n: "مصر", lon: 31.2, lat: 29.9, dx: -10, dy: 54 },
  { n: "یونان", lon: 27.3, lat: 37.9, dx: 0, dy: -52 },
  { n: "بابل", lon: 44.4, lat: 32.5, dx: -6, dy: 56 },
  { n: "باختر", lon: 66.9, lat: 36.8, dx: 0, dy: -52 },
  { n: "هند", lon: 72.0, lat: 31.0, dx: 0, dy: 56 },
];
const MapScene: React.FC<{ T: number }> = ({ T }) => {
  const t0 = cut(14);
  const z = 1.06 + 0.08 * easeInOut(prog(T, t0, t0 + 2.4));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #2a1d11 0%, #120c07 75%)" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${PERS.x}px ${PERS.y}px` }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <filter id="v32glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
          </defs>
          <path d={LAND_PATH} fill="#5a4329" stroke="#c9a46a" strokeWidth={2} strokeOpacity={0.7} />
          {ORIGINS.map((o, i) => {
            const a = proj(o.lon, o.lat);
            const st = t0 + 0.15 + i * 0.16;
            const q = easeInOut(prog(T, st, st + 0.75));
            const mx = (a.x + PERS.x) / 2, my = Math.min(a.y, PERS.y) - 90 - Math.abs(a.x - PERS.x) * 0.12;
            const d = `M${a.x},${a.y} Q${mx},${my} ${PERS.x},${PERS.y}`;
            const len = Math.hypot(PERS.x - a.x, PERS.y - a.y) * 1.25;
            return (
              <g key={i} opacity={clamp(prog(T, st - 0.05, st + 0.1))}>
                <path d={d} fill="none" stroke={GOLD} strokeWidth={10} strokeOpacity={0.35} filter="url(#v32glow)" strokeDasharray={len} strokeDashoffset={len * (1 - q)} />
                <path d={d} fill="none" stroke={GOLD} strokeWidth={4.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - q)} />
                <circle cx={a.x} cy={a.y} r={9} fill="#fff" stroke={GOLD} strokeWidth={4} />
              </g>
            );
          })}
          <circle cx={PERS.x} cy={PERS.y} r={18 + 6 * Math.sin(T * 6)} fill={GOLD} opacity={0.35} />
          <circle cx={PERS.x} cy={PERS.y} r={12} fill={GOLD} stroke="#fff" strokeWidth={4} />
        </svg>
        {ORIGINS.map((o, i) => {
          const a = proj(o.lon, o.lat);
          const st = t0 + 0.15 + i * 0.16;
          return <Chip key={i} x={a.x + o.dx} y={a.y + o.dy} p={prog(T, st, st + 0.3)} size={38} bg="rgba(20,14,8,0.85)">{o.n}</Chip>;
        })}
        <Chip x={PERS.x} y={PERS.y + 64} p={prog(T, t0 + 0.9, t0 + 1.2)} size={44} bg={GOLD} color={INK}>تخت‌جمشید</Chip>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// payslip (present day)
const Payslip: React.FC<{ T: number }> = ({ T }) => {
  const t0 = wd(18, "فیشِ") - 0.05;
  const t1 = cut(19) + 0.1;
  if (T < t0 || T > t1 + 0.4) return null;
  const p = easeOut(prog(T, t0, t0 + 0.45));
  const out = easeInOut(prog(T, t1, t1 + 0.35));
  const rows: [string, string][] = [["جیره‌ی جو و شراب", "صفر"], ["گوشت روزای خاص", "صفر"], ["هدیه‌ی تولد بچه", "صفر"], ["مونده تا آخر ماه", "صفر"]];
  return (
    <div style={{ position: "absolute", left: W / 2, top: 820 + (1 - p) * 900 + out * 900, transform: `translate(-50%,-50%) rotate(${-2 + 2 * p}deg)`, width: 780,
      background: "#fbfaf6", borderRadius: 18, boxShadow: "0 40px 90px rgba(0,0,0,0.6)", direction: "rtl", fontFamily: "V32Bold", color: "#1d1d1d", overflow: "hidden" }}>
      <div style={{ background: "#2f3b47", color: "#fff", padding: "22px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "V32Black", fontSize: 50 }}>فیش حقوقی</span>
        <span style={{ fontSize: 34, opacity: 0.85 }}>مهرِ <span style={{ fontFamily: "V32Num" }}>۱۴۰۵</span></span>
      </div>
      <div style={{ padding: "18px 36px 26px" }}>
        {rows.map(([a, b], i) => {
          const q = prog(T, t0 + 0.35 + i * 0.22, t0 + 0.55 + i * 0.22);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 42, padding: "14px 0", borderBottom: "2px dashed #d5d2c8", opacity: q,
              transform: `translateX(${(1 - q) * -30}px)` }}>
              <span>{a}</span><span style={{ fontFamily: "V32Black", fontSize: 44, color: "#B3261E" }}>{b}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// last card: which day would you live?
const DAY_TILES = [
  { img: "v32/img1.jpg", fx: 0.5, fy: 0.55 }, { img: "v32/img4.jpg", fx: 0.5, fy: 0.42 }, { img: "v32/img5.jpg", fx: 0.45, fy: 0.42 },
  { img: "v32/img6.jpg", fx: 0.45, fy: 0.45 }, { img: "v32/img7.jpg", fx: 0.5, fy: 0.5 }, { img: "v32/vid3-f0.jpg", fx: 0.6, fy: 0.45 }, { img: "v32/img9.jpg", fx: 0.6, fy: 0.45 },
];
const FA = ["۱", "۲", "۳", "۴", "۵", "۶", "۷"];
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t0 = cut(20);
  const tw = 236, th = 400, gap = 16;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #3a2814 0%, #140d07 80%)" }}>
      <Dust T={T} n={20} a={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", direction: "rtl", fontFamily: "V32Black", fontSize: 92, color: "#fff",
        opacity: easeOut(prog(T, t0, t0 + 0.3)), transform: `translateY(${(1 - easeOut(prog(T, t0, t0 + 0.3))) * -30}px)` }}>
        کدوم روز<span style={{ color: GOLD }}>؟</span>
      </div>
      {DAY_TILES.map((d, i) => {
        const row = i < 4 ? 0 : 1;
        const n = row ? 3 : 4;
        const k = row ? i - 4 : i;
        const rowW = n * tw + (n - 1) * gap;
        // RTL: day 1 on the right
        const x = W / 2 + rowW / 2 - tw - k * (tw + gap);
        const y = 360 + row * (th + gap);
        const st = t0 + 0.1 + i * 0.09;
        const q = easeOut(prog(T, st, st + 0.35));
        const hl = T > t0 + 1.0 ? Math.max(0, 1 - Math.abs(((T - t0 - 1.0) * 3.2) % 7 - i) * 1.4) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: tw, height: th, borderRadius: 18, overflow: "hidden", opacity: q,
            transform: `translateY(${(1 - q) * 60}px) scale(${1 + 0.06 * hl})`, border: `4px solid ${hl > 0.3 ? GOLD : "rgba(242,193,78,0.35)"}`, boxShadow: "0 16px 30px rgba(0,0,0,0.5)" }}>
            <Img src={staticFile(d.img)} style={{ position: "absolute", width: tw * 1.5, height: (tw * 1.5) / IMG_AR, maxWidth: "none",
              left: tw / 2 - d.fx * tw * 1.5, top: th / 2 - d.fy * ((tw * 1.5) / IMG_AR), filter: `brightness(${0.75 + 0.25 * hl})` }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", direction: "rtl", fontFamily: "V32Black", fontSize: 44, color: hl > 0.3 ? GOLD : "#fff" }}>
              روز <span style={{ fontFamily: "V32Num", fontSize: 54 }}>{FA[i]}</span>
            </div>
          </div>
        );
      })}
      <Chip x={W / 2} y={1225} p={prog(T, t0 + 0.9, t0 + 1.2)} size={50} bg={GOLD} color={INK}>توی کامنت بگو</Chip>
    </AbsoluteFill>
  );
};

// ───────── shots ─────────
const C = {
  s2: cut(1), s3: cut(2), s4: cut(3) - 0.1, s5: cut(4), s6: cut(5), s7: cut(7), s8: cut(9), s9: cut(10), s10: cut(11), s11: cut(13), s12: cut(14), s13: cut(15),
  s14: cut(17), s15: cut(18), s16: cut(20),
};
const V3PLAY = wd(16, "داری") - 0.55; // vid3 starts so the chisel hits land on «صورتِ … سنگ»

const SHOTS: ShotDef[] = [
  { // ۱ · هوک: کلیپ دروازه (Veo)، کامران جلو میاد
    from: 0, to: C.s2, vid: { src: "v32/vid1.mp4", start: 0 }, ar: VID_AR,
    keys: [{ t: 0, fx: 0.5, fy: 0.5, s: 1.0 }, { t: 0.01, fx: 0.5, fy: 0.42, s: 1.12, ease: 3.8 }],
    extra: (T) => <Dust T={T} />,
  },
  { // ۲ · «نه به‌عنوان شاه… کارگرِ ساده»: پرتره با طناب و پتک
    from: C.s2, to: C.s3, img: "v32/img2.jpg",
    keys: [{ t: C.s2, fx: 0.5, fy: 0.42, s: 1.08 }, { t: C.s2 + 0.01, fx: 0.5, fy: 0.36, s: 1.22, ease: 1.8 }, { t: wd(1, "کارگرِ") - 0.08, fx: 0.52, fy: 0.33, s: 1.42, ease: 0.25 }],
    shake: (T) => (T > wd(1, "کارگرِ") && T < wd(1, "کارگرِ") + 0.25 ? 9 * (1 - prog(T, wd(1, "کارگرِ"), wd(1, "کارگرِ") + 0.25)) : 0),
    extra: (T) => {
      const k0 = wd(1, "شاه") - 0.1;
      const cIn = easeOut(prog(T, k0, k0 + 0.25));
      const strike = easeOut(prog(T, wdEnd(1, "شاه") + 0.05, wdEnd(1, "شاه") + 0.25));
      const gone = prog(T, wd(1, "کارگرِ") - 0.2, wd(1, "کارگرِ"));
      return (
        <>
          {cIn > 0 && gone < 1 && (
            <div style={{ position: "absolute", left: 540, top: 330, transform: `translate(-50%,-50%) scale(${0.5 + 0.5 * backOut(cIn)}) rotate(${-6 + 6 * cIn}deg)`, opacity: (1 - gone) * cIn }}>
              <div style={{ filter: `drop-shadow(0 0 30px rgba(242,193,78,0.8)) grayscale(${strike * 0.8})` }}><Icon k="crown" s={230} /></div>
              <svg width={300} height={300} style={{ position: "absolute", left: -35, top: -35 }}>
                <line x1={40} y1={260} x2={40 + 220 * strike} y2={260 - 220 * strike} stroke="#D7262B" strokeWidth={22} strokeLinecap="round" />
              </svg>
            </div>
          )}
          <Stamp x={540} y={340} t0={wd(1, "کارگرِ") - 0.02} T={T} text="کارگر" size={120} rot={-8} color="#E4572E" />
          <Dust T={T} n={18} />
        </>
      );
    },
  },
  { // ۳ · روز ۱: دروازه‌ی نیمه‌کاره، از بالا به پایین
    from: C.s3, to: C.s4, img: "v32/img1.jpg", day: 1,
    keys: [{ t: C.s3, fx: 0.5, fy: 0.22, s: 1.18 }, { t: C.s3 + 0.01, fx: 0.5, fy: 0.62, s: 1.12, ease: 2.6 }, { t: wd(2, "کوهِ") - 0.2, fx: 0.5, fy: 0.6, s: 1.28, ease: 1.2 }],
    extra: (T, p) => <><Glow p={p} ix={0.5} iy={0.18} r={0.5} color="rgba(255,214,150,A)" a={0.22 + 0.05 * Math.sin(T * 1.4)} /><Dust T={T} /></>,
  },
  { // ۴ · کشیدن سنگ (Veo)
    from: C.s4, to: C.s5, vid: { src: "v32/vid2.mp4", start: C.s4 }, ar: VID_AR,
    keys: [{ t: C.s4, fx: 0.42, fy: 0.55, s: 1.12 }, { t: C.s4 + 0.01, fx: 0.5, fy: 0.5, s: 1.0, ease: 3.8 }],
    extra: (T) => <Dust T={T} n={30} a={0.6} />,
  },
  { // ۵ · «منتظری یکی با شلاق بیاد سراغت»: صورت نزدیک، تاریک، سایه‌ی شلاق
    from: C.s5, to: C.s6, img: "v32/img2.jpg",
    keys: [{ t: C.s5, fx: 0.52, fy: 0.3, s: 1.65 }, { t: C.s5 + 0.01, fx: 0.52, fy: 0.29, s: 1.9, ease: 2.0 }],
    filter: (T) => `brightness(${1 - 0.38 * prog(T, C.s5, C.s5 + 1.0)}) saturate(${1 - 0.4 * prog(T, C.s5, C.s5 + 1.0)})`,
    shake: (T) => { const w = wd(4, "شلاق"); return T > w && T < w + 0.3 ? 14 * (1 - prog(T, w, w + 0.3)) : 0; },
    extra: (T) => {
      const w = wd(4, "شلاق") - 0.22;
      const q = prog(T, w, w + 0.28);
      if (q <= 0) return null;
      // whip shadow sweeping across, then gone
      const a = q < 1 ? 0.65 : Math.max(0, 0.65 - (T - w - 0.28) * 2.5);
      const sweep = easeOut(q);
      return (
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: a, filter: "blur(6px)" }}>
          <path d={`M${1180 - 900 * sweep},${-60} C ${900 - 500 * sweep},${400 + 200 * sweep} ${700 - 300 * sweep},${700} ${200 + 300 * (1 - sweep)},${1100 + 200 * sweep}`}
            fill="none" stroke="rgba(0,0,0,0.9)" strokeWidth={26} strokeLinecap="round" />
        </svg>
      );
    },
  },
  { // ۶ · کاتب و لوح گلی + «مزد دارد»
    from: C.s6, to: C.s7, img: "v32/img3.jpg",
    keys: [{ t: C.s6, fx: 0.5, fy: 0.42, s: 1.06 }, { t: C.s6 + 0.01, fx: 0.62, fy: 0.3, s: 1.3, ease: 1.6 }, { t: wd(5, "اسمتو") - 0.15, fx: 0.55, fy: 0.72, s: 1.4, ease: 0.6 },
      { t: lineStart(6) - 0.05, fx: 0.55, fy: 0.55, s: 1.15, ease: 0.6 }],
    extra: (T, p) => {
      const tab = at(p, 0.58, 0.8);
      const lp = prog(T, wd(5, "لوحِ") - 0.05, wd(5, "لوحِ") + 0.25);
      return (
        <>
          <Glow p={p} ix={0.58} iy={0.8} r={0.25} color="rgba(255,200,120,A)" a={0.25 * lp} />
          <Chip x={tab.x} y={tab.y - 300} p={lp} size={50}>لوحِ گِلی</Chip>
          <Stamp x={560} y={560} t0={wd(6, "مجانی") - 0.02} T={T} text="مُزد داره" size={110} rot={-10} color="#C0392B" />
        </>
      );
    },
  },
  { // ۷ · روز ۲: روز جیره؛ کارت جیره با آیکون روی هر کلمه
    from: C.s7, to: C.s8, img: "v32/img4.jpg", day: 2,
    keys: [{ t: C.s7, fx: 0.5, fy: 0.45, s: 1.05 }, { t: C.s7 + 0.01, fx: 0.48, fy: 0.42, s: 1.18, ease: 1.8 }, { t: wd(8, "شراب") - 0.15, fx: 0.4, fy: 0.45, s: 1.35, ease: 0.7 },
      { t: wd(8, "گوشتِ") - 0.2, fx: 0.72, fy: 0.6, s: 1.4, ease: 0.6 }],
    extra: (T) => {
      const items: [string, "wheat" | "wine" | "beer" | "sheep", number][] = [["جو", "wheat", wd(8, "جو")], ["شراب", "wine", wd(8, "شراب")], ["آبجو", "beer", wd(8, "آبجو")], ["گوشت", "sheep", wd(8, "گوشتِ")]];
      const cin = easeOut(prog(T, wd(8, "جو") - 0.3, wd(8, "جو")));
      if (cin <= 0) return <Dust T={T} />;
      return (
        <>
          <Dust T={T} />
          <div style={{ position: "absolute", right: 40, top: 300, width: 400, padding: "18px 24px 10px", borderRadius: 26, background: PAPER, opacity: cin,
            transform: `translateX(${(1 - cin) * 120}px) rotate(1.5deg)`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", direction: "rtl", border: `3px solid #b8955b` }}>
            <div style={{ fontFamily: "V32Black", fontSize: 46, color: INK, borderBottom: "3px solid #b8955b", paddingBottom: 6, marginBottom: 6 }}>جیره‌ی این ماه</div>
            {items.map(([t, k, s], i) => {
              const q = easeOut(prog(T, s - 0.08, s + 0.2));
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0", opacity: 0.25 + 0.75 * q, transform: `scale(${0.92 + 0.08 * backOut(q)})` }}>
                  <Icon k={k} s={62} />
                  <span style={{ fontFamily: "V32Black", fontSize: 50, color: INK, flex: 1 }}>{t}</span>
                  <span style={{ fontFamily: "V32Black", fontSize: 46, color: q > 0.5 ? "#2E7D32" : "transparent" }}>✓</span>
                </div>
              );
            })}
          </div>
        </>
      );
    },
  },
  { // ۸ · لوح‌های واقعی + دیوار هزاران لوح
    from: C.s8, to: C.s9, custom: (T) => <TabletWall T={T} />,
  },
  { // ۹ · روز ۳: سرپرست زن + نمودار جیره
    from: C.s9, to: C.s10, img: "v32/img5.jpg", day: 3,
    keys: [{ t: C.s9, fx: 0.5, fy: 0.45, s: 1.05 }, { t: C.s9 + 0.01, fx: 0.62, fy: 0.38, s: 1.2, ease: 1.4 }, { t: wd(10, "زنه") - 0.25, fx: 0.3, fy: 0.36, s: 1.5, ease: 0.6 },
      { t: wd(10, "جیره‌ش") - 0.15, fx: 0.42, fy: 0.42, s: 1.12, ease: 0.7 }],
    extra: (T) => {
      const t0 = wd(10, "جیره‌ش") - 0.1;
      const q0 = prog(T, t0, t0 + 0.3);
      if (q0 <= 0) return <Dust T={T} n={16} />;
      const bars = [{ n: "سرپرست", v: 1, c: GOLD }, { n: "کارگر", v: 0.55, c: "#d9c7a4" }, { n: "کارگر", v: 0.55, c: "#d9c7a4" }, { n: "کارگر", v: 0.5, c: "#d9c7a4" }];
      const big = wd(10, "بیشتره");
      return (
        <>
          <Dust T={T} n={16} />
          <div style={{ position: "absolute", left: 90, right: 90, top: 760, height: 480, borderRadius: 30, background: "rgba(20,14,8,0.78)", opacity: easeOut(q0),
            transform: `translateY(${(1 - easeOut(q0)) * 60}px)`, border: `3px solid rgba(242,193,78,0.5)`, direction: "rtl" }}>
            <div style={{ position: "absolute", top: 18, right: 34, fontFamily: "V32Black", fontSize: 44, color: "#fff" }}>جیره‌ی ماهانه</div>
            {bars.map((b, i) => {
              const g = easeOut(prog(T, t0 + 0.15 + i * 0.12, t0 + 0.75 + i * 0.12));
              const pulse = i === 0 && T > big ? 1 + 0.05 * Math.sin((T - big) * 12) * Math.exp(-(T - big) * 2) : 1;
              const h = 270 * b.v * g * pulse;
              const x = 900 - 34 - 70 - i * 205;
              return (
                <div key={i}>
                  <div style={{ position: "absolute", left: x - 70, top: 400 - h, width: 140, height: h, borderRadius: "14px 14px 4px 4px", background: b.c,
                    boxShadow: i === 0 ? "0 0 40px rgba(242,193,78,0.6)" : undefined }} />
                  <div style={{ position: "absolute", left: x - 100, width: 200, top: 410, textAlign: "center", fontFamily: "V32Bold", fontSize: 34, color: i === 0 ? GOLD : "#eee" }}>{b.n}</div>
                  {i === 0 && g > 0.6 && <div style={{ position: "absolute", left: x - 40, top: 400 - h - 84 }}><Icon k="crown" s={80} /></div>}
                </div>
              );
            })}
          </div>
        </>
      );
    },
  },
  { // ۱۰ · روز ۴: بچه، جیره‌ی مادر، «دوبرابر!»، صورت کامران
    from: C.s10, to: C.s11, img: "v32/img6.jpg", day: 4,
    keys: [{ t: C.s10, fx: 0.5, fy: 0.45, s: 1.05 }, { t: C.s10 + 0.01, fx: 0.5, fy: 0.42, s: 1.15, ease: 1.2 }, { t: wd(11, "بچه‌دار") - 0.2, fx: 0.38, fy: 0.5, s: 1.55, ease: 0.7 },
      { t: wd(11, "جیره‌ی") - 0.25, fx: 0.25, fy: 0.55, s: 1.3, ease: 0.6 }, { t: wd(12, "دوبرابر") - 0.15, fx: 0.38, fy: 0.5, s: 1.2, ease: 0.3 },
      { t: wd(12, "خب") - 0.1, fx: 0.69, fy: 0.33, s: 1.9, ease: 0.45 }],
    shake: (T) => { const w = wd(12, "دوبرابر"); return T > w && T < w + 0.3 ? 10 * (1 - prog(T, w, w + 0.3)) : 0; },
    extra: (T, p) => {
      const sack = at(p, 0.2, 0.62);
      const mq = prog(T, wd(11, "اضافه") - 0.05, wd(11, "اضافه") + 0.25);
      const gone = prog(T, wd(12, "خب") - 0.2, wd(12, "خب"));
      return (
        <>
          {gone < 1 && <div style={{ opacity: 1 - gone }}><Chip x={Math.max(250, sack.x)} y={sack.y - 200} p={mq} size={48} bg={GOLD} color={INK}>+ جیره‌ی مادر</Chip></div>}
          {gone < 1 && <div style={{ opacity: 1 - gone }}>
            <Stamp x={330} y={420} t0={wd(12, "پسر") - 0.05} T={T} text="پسر" size={74} rot={6} color="#1F5FA8" />
            <Stamp x={700} y={420} t0={wd(12, "دوبرابر") - 0.02} T={T} text="دو برابر" size={92} rot={-7} color="#1F5FA8" />
          </div>}
        </>
      );
    },
  },
  { // ۱۱ · روز ۵: ناهار با ملیت‌ها
    from: C.s11, to: C.s12, img: "v32/img7.jpg", day: 5,
    keys: [{ t: C.s11, fx: 0.5, fy: 0.45, s: 1.06 }, { t: C.s11 + 0.01, fx: 0.55, fy: 0.45, s: 1.2, ease: 1.2 }, { t: wd(13, "مصریه") - 0.2, fx: 0.25, fy: 0.48, s: 1.45, ease: 0.5 },
      { t: wd(13, "یونانی") - 0.25, fx: 0.75, fy: 0.48, s: 1.45, ease: 0.5 }, { t: wd(13, "بابلی") - 0.25, fx: 0.85, fy: 0.55, s: 1.5, ease: 0.45 }],
    extra: (T, p) => {
      const L = [{ n: "مصری", w: "مصریه", ix: 0.14, iy: 0.4 }, { n: "یونانی", w: "یونانی", ix: 0.8, iy: 0.4 }, { n: "بابلی", w: "بابلی", ix: 0.92, iy: 0.53 }];
      return (
        <>
          {L.map((l, i) => {
            const c = at(p, l.ix, l.iy);
            const t = wd(13, l.w) - 0.05;
            return <Chip key={i} x={clamp(c.x, 150, W - 150)} y={c.y - 170} p={prog(T, t, t + 0.25)} size={52}>{l.n}</Chip>;
          })}
          <Dust T={T} n={14} />
        </>
      );
    },
  },
  { // ۱۲ · «از نصفِ دنیا»: نقشه
    from: C.s12, to: C.s13, custom: (T) => <MapScene T={T} />,
  },
  { // ۱۳ · روز ۶: تراشیدن (اول فریم ثابت، بعد کلیپ Veo)
    from: C.s13, to: C.s14, vid: { src: "v32/vid3.mp4", start: V3PLAY }, ar: VID_AR, day: 6,
    keys: [{ t: C.s13, fx: 0.4, fy: 0.3, s: 1.18 }, { t: C.s13 + 0.01, fx: 0.45, fy: 0.36, s: 1.08, ease: 2.6 }, { t: V3PLAY, fx: 0.62, fy: 0.42, s: 1.12, ease: 3.0 }],
    extra: (T, p) => <><Glow p={p} ix={0.6} iy={0.12} r={0.4} color="rgba(255,220,160,A)" a={0.2} /><Dust T={T} n={30} a={0.7} /></>,
  },
  { // ۱۴ · ۲۵۰۰ سال بعد: همان صورت، گوشی‌ها
    from: C.s14, to: C.s15, img: "v32/img8.jpg",
    keys: [{ t: C.s14, fx: 0.68, fy: 0.42, s: 1.7 }, { t: C.s14 + 0.35, fx: 0.62, fy: 0.45, s: 1.3, ease: 1.2 }, { t: wd(17, "عکس") - 0.2, fx: 0.5, fy: 0.55, s: 1.05, ease: 0.8 }],
    extra: (T, p) => {
      const t0 = wd(17, "عکس");
      const phones = [[0.24, 0.59, 0], [0.5, 0.63, 0.12], [0.82, 0.63, 0.2], [0.13, 0.6, 0.3], [0.24, 0.59, 0.55], [0.82, 0.63, 0.7]];
      return (
        <>
          {phones.map(([ix, iy, d], i) => {
            const tt = T - t0 - d;
            if (tt < 0 || tt > 0.25) return null;
            const a = 1 - tt / 0.25;
            return <Glow key={i} p={p} ix={ix} iy={iy} r={0.16} color="rgba(255,255,255,A)" a={0.9 * a} />;
          })}
        </>
      );
    },
  },
  { // ۱۵ · روز ۷: آپارتمان، فیش حقوقی، دلتنگی
    from: C.s15, to: C.s16, img: "v32/img9.jpg", day: 7,
    keys: [{ t: C.s15, fx: 0.5, fy: 0.5, s: 1.04 }, { t: C.s15 + 0.01, fx: 0.55, fy: 0.45, s: 1.15, ease: 1.6 }, { t: cut(19) + 0.1, fx: 0.66, fy: 0.42, s: 1.75, ease: 2.2 }],
    filter: (T) => `saturate(${1 - 0.5 * prog(T, cut(19), cut(19) + 1.5)})`,
    extra: (T, p) => {
      const t0 = wd(19, "تخت‌جمشید") - 0.35;
      const g = easeOut(prog(T, t0, t0 + 0.5));
      if (g <= 0 || p.dw < 0) return null;
      return (
        <div style={{ position: "absolute", left: 70, top: 470 - 20 * g, width: 400, height: 520, transform: `rotate(${-8 + 3 * g}deg) scale(${0.85 + 0.15 * g})`, opacity: g,
          background: "#f4eee2", padding: "14px 14px 54px", boxSizing: "border-box", borderRadius: 6, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 2 }}>
            <Img src={staticFile("v32/img1.jpg")} style={{ width: "100%", height: "100%", maxWidth: "none", objectFit: "cover", objectPosition: "50% 45%", filter: "sepia(0.55) contrast(1.05)",
              transform: `scale(${1.05 + 0.05 * prog(T, t0, t0 + 3)})` }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", direction: "rtl", fontFamily: "V32Black", fontSize: 30, color: INK }}>روزِ اول</div>
        </div>
      );
    },
  },
  { // ۱۶ · کارت آخر: کدوم روز؟
    from: C.s16, to: TOTAL, custom: (T) => <EndCard T={T} />,
  },
];

type Kind = "dissolve" | "whip" | "flash" | "zoom" | "dark" | "warp";
// transition INTO shot i
const KIND: Record<number, Kind> = { 1: "zoom", 2: "whip", 3: "flash", 4: "dark", 5: "whip", 6: "zoom", 7: "dissolve", 8: "whip", 9: "whip", 10: "whip", 11: "zoom", 12: "flash", 13: "warp", 14: "whip", 15: "dissolve" };
const XLEN: Record<Kind, number> = { dissolve: 0.4, whip: 0.26, flash: 0.3, zoom: 0.3, dark: 0.3, warp: 0.5 };

const ShotView: React.FC<{ d: ShotDef; T: number }> = ({ d, T }) => {
  if (d.custom) return <AbsoluteFill style={{ overflow: "hidden" }}>{d.custom(T)}</AbsoluteFill>;
  const ar = d.ar ?? IMG_AR;
  const c = camAt(d.keys!, T);
  const p = place(c.fx, c.fy, c.s, T, ar, d.shake?.(T) ?? 0);
  const filt = d.filter?.(T);
  let media: React.ReactNode;
  if (d.vid) {
    const f = Math.round(clamp((T - d.vid.start) * FPS, 0, 4 * FPS - 2));
    media = (
      <Freeze frame={f}>
        <OffthreadVideo src={staticFile(d.vid.src)} muted style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none", filter: filt }} />
      </Freeze>
    );
  } else {
    media = <Img src={staticFile(d.img!)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none", filter: filt }} />;
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {media}
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

// ───────── overlays ─────────
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const chunks: Word[][] = [];
  for (let n = 0; n <= WORDS[WORDS.length - 1].si; n++) {
    const ws = lineWords(n);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 6 || len > 28 || /[؟!:…]$/.test(w.w) || (/[،.]$/.test(w.w) && cur.length >= 2) || i === ws.length - 1) { chunks.push(cur); cur = []; }
    });
  }
  const i = chunks.findIndex((c, k) => T >= c[0].s - 0.06 && (k === chunks.length - 1 || T < chunks[k + 1][0].s - 0.06));
  const c = chunks[i];
  if (!c || T > c[c.length - 1].e + 0.45) return null;
  const pop = easeOut(prog(T, c[0].s - 0.06, c[0].s + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center", opacity: pop,
      transform: `translateY(${(1 - pop) * 14}px) scale(${0.96 + 0.04 * pop})` }}>
      <div style={{ maxWidth: 940, padding: "12px 30px 18px", borderRadius: 18, background: "rgba(12,8,4,0.66)", direction: "rtl", textAlign: "center",
        fontFamily: "V32Bold", fontSize: 60, lineHeight: 1.45, color: "#fff" }}>
        {c.map((w, j) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return <span key={j} style={{ color: on ? GOLD : "rgba(255,255,255,0.94)" }}>{w.w}{j < c.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

// hook title
const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T > C.s2 + 0.2) return null;
  const p = 0.55 + 0.45 * easeOut(prog(T, 0, 0.35));
  const out = prog(T, C.s2 - 0.25, C.s2 + 0.1);
  return (
    <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,6,2,0.72) 0%, rgba(10,6,2,0.45) 20%, rgba(0,0,0,0) 34%)", opacity: 1 - out }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", direction: "rtl", opacity: p * (1 - out),
      transform: `scale(${1.15 - 0.15 * p + 0.2 * out})` }}>
      <div style={{ fontFamily: "V32Black", fontSize: 96, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.7)", lineHeight: 1.15 }}>یه هفته</div>
      <div style={{ fontFamily: "V32Black", fontSize: 128, color: GOLD, textShadow: "0 4px 0 rgba(60,30,0,0.8), 0 8px 34px rgba(0,0,0,0.85)", lineHeight: 1.15 }}>توی تخت‌جمشید</div>
    </div>
    </>
  );
};

// day badge + week tracker (7 clay tablets)
const DAY_NAME = ["", "روزِ اول", "روزِ دوم", "روزِ سوم", "روزِ چهارم", "روزِ پنجم", "روزِ ششم", "روزِ هفتم"];
const DayBadge: React.FC<{ T: number }> = ({ T }) => {
  let cur = 0, from = 0;
  for (const s of SHOTS) if (s.day && T >= s.from - 0.05) { cur = s.day; from = s.from; }
  if (!cur || T < C.s3 - 0.05 || T >= C.s16) return null;
  const sameShot = SHOTS.find((s) => s.day === cur)!;
  const fresh = T < sameShot.to;
  const p = easeOut(prog(T, from, from + 0.3));
  const settle = easeInOut(prog(T, from + 1.1, from + 1.5));
  const s = fresh ? 1.25 - 0.25 * p - 0.3 * settle : 0.7;
  const showBadge = fresh;
  return (
    <>
      {showBadge && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 210 - 30 * settle, display: "flex", justifyContent: "center", opacity: p }}>
          <div style={{ transform: `translateY(${(1 - p) * -40}px) scale(${s})`, direction: "rtl", fontFamily: "V32Black", fontSize: 78, color: "#fff",
            padding: "6px 40px 14px", borderRadius: 18, background: "rgba(12,8,4,0.66)", borderBottom: `6px solid ${GOLD}` }}>
            {DAY_NAME[cur]}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: showBadge ? 300 - 30 * settle : 210, display: "flex", justifyContent: "center", gap: 12, direction: "rtl" }}>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const done = d < cur, now = d === cur;
          const pulse = now ? 0.5 + 0.5 * Math.sin(T * 6) : 0;
          return <div key={d} style={{ width: 54, height: 18, borderRadius: 6, background: done ? GOLD : now ? `rgba(242,193,78,${0.65 + 0.35 * pulse})` : "rgba(255,255,255,0.28)",
            boxShadow: now ? `0 0 ${10 + 12 * pulse}px rgba(242,193,78,0.9)` : "0 2px 6px rgba(0,0,0,0.4)", border: "2px solid rgba(0,0,0,0.25)" }} />;
        })}
      </div>
    </>
  );
};

// «۲۵۰۰ سال بعد» on the time jump
const YearsLater: React.FC<{ T: number }> = ({ T }) => {
  const t0 = C.s14 - 0.25;
  const t1 = wd(17, "بعد") + 0.5;
  if (T < t0 || T > t1 + 0.3) return null;
  const p = easeOut(prog(T, t0, t0 + 0.4));
  const out = prog(T, t1, t1 + 0.3);
  const n = Math.round(2500 * easeOut(prog(T, t0, wd(17, "پونصد") + 0.2)));
  const fa = String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", direction: "rtl", opacity: p * (1 - out), transform: `scale(${1.3 - 0.3 * p})` }}>
      <span style={{ fontFamily: "V32Num", fontSize: 150, color: GOLD, textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}>{fa}</span>
      <span style={{ fontFamily: "V32Black", fontSize: 76, color: "#fff", textShadow: "0 8px 40px rgba(0,0,0,0.8)" }}> سال بعد</span>
    </div>
  );
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const xlen = (i: number) => (i <= 0 || i >= SHOTS.length ? 0 : XLEN[KIND[i]]);
  const layers: React.ReactNode[] = [];
  SHOTS.forEach((d, i) => {
    const xin = xlen(i);
    const xout = xlen(i + 1);
    if (T < d.from - xin / 2 || T >= d.to + xout / 2) return;
    let op = xin ? easeInOut(prog(T, d.from - xin / 2, d.from + xin / 2)) : 1;
    let style: React.CSSProperties = {};
    const kin = KIND[i], kout = KIND[i + 1];
    if (kin === "whip" && T < d.from + xin / 2) {
      const q = prog(T, d.from - xin / 2, d.from + xin / 2);
      style = { transform: `translateX(${(1 - easeOut(q)) * 760}px)`, filter: `blur(${(1 - q) * 20}px)` };
      op = 1;
    }
    if (kout === "whip" && T > d.to - xout / 2) {
      const q = prog(T, d.to - xout / 2, d.to + xout / 2);
      style = { transform: `translateX(${-easeOut(q) * 760}px)`, filter: `blur(${q * 20}px)` };
    }
    if (kin === "zoom" && T < d.from + xin / 2) {
      const q = prog(T, d.from - xin / 2, d.from + xin / 2);
      style = { transform: `scale(${1.25 - 0.25 * easeOut(q)})`, filter: `blur(${(1 - q) * 10}px)` };
    }
    if (kout === "zoom" && T > d.to - xout / 2) {
      const q = prog(T, d.to - xout / 2, d.to + xout / 2);
      style = { transform: `scale(${1 + 0.35 * q})`, filter: `blur(${q * 12}px)` };
    }
    if (kin === "warp" && T < d.from + xin / 2) {
      const q = prog(T, d.from - xin / 2, d.from + xin / 2);
      style = { transform: `scale(${1.6 - 0.6 * easeOut(q)}) rotate(${(1 - q) * 6}deg)`, filter: `blur(${(1 - q) * 16}px) brightness(${1 + (1 - q) * 0.8})` };
    }
    if (kout === "warp" && T > d.to - xout / 2) {
      const q = prog(T, d.to - xout / 2, d.to + xout / 2);
      style = { transform: `scale(${1 + 0.5 * q}) rotate(${-q * 5}deg)`, filter: `blur(${q * 16}px) sepia(${q}) brightness(${1 + q * 0.6})` };
    }
    if (op <= 0) return;
    layers.push(<AbsoluteFill key={i} style={{ opacity: op, ...style }}><ShotView d={d} T={T} /></AbsoluteFill>);
  });
  // accent flashes for «flash», «dark», «warp»
  let flash = 0, dark = 0;
  SHOTS.forEach((d, i) => {
    const k = KIND[i];
    if (!k) return;
    const x = XLEN[k];
    const a = 1 - Math.abs(T - d.from) / (x / 2 + 0.12);
    if (a <= 0) return;
    if (k === "flash" || k === "warp") flash = Math.max(flash, a * (k === "warp" ? 0.8 : 0.6));
    if (k === "dark") dark = Math.max(dark, a * 0.8);
  });
  const whipFlash = (() => { const w = wd(4, "شلاق"); return T > w - 0.02 && T < w + 0.12 ? 0.35 * (1 - prog(T, w - 0.02, w + 0.12)) : 0; })();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill>{layers}</AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(255,240,205,${flash}) 0%, rgba(255,205,130,${flash * 0.6}) 45%, rgba(0,0,0,0) 85%)`, mixBlendMode: "screen" }} />}
      {dark > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${dark})` }} />}
      {whipFlash > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${whipFlash})` }} />}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,190,110,0.06), rgba(0,0,0,0) 40%, rgba(80,40,10,0.08))", mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.36) 100%)" }} />
      <Title T={T} />
      <DayBadge T={T} />
      <YearsLater T={T} />
      <Payslip T={T} />
      <Captions T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V32_LOOK = [0.05, 1.8, C.s2 + 0.6, wd(1, "شاه") + 0.4, wd(1, "کارگرِ") + 0.3, C.s3 + 1.2, C.s4 + 1.5, wd(4, "شلاق") + 0.05, wd(5, "لوحِ") + 0.4, wd(6, "مجانی") + 0.4,
  C.s7 + 1.2, wd(8, "گوشتِ") + 0.4, C.s8 + 1.0, wd(9, "هزاران") + 1.4, wd(10, "زنه") + 0.2, wd(10, "بیشتره") + 0.3, wd(11, "اضافه") + 0.4, wd(12, "دوبرابر") + 0.3,
  wd(12, "باستانه") + 0.2, wd(13, "مصریه") + 0.3, wd(13, "بابلی") + 0.3, C.s12 + 1.4, C.s13 + 1.0, wd(16, "سرباز"), C.s14 + 0.15, wd(17, "عکس") + 0.05, wd(18, "فیشِ") + 1.2,
  wd(19, "تخت‌جمشید") + 0.4, C.s16 + 1.5, TOTAL - 0.1];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V32: React.FC = () => (
  <>
    <Composition id="V32" component={Video} durationInFrames={V32_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v32/mix.wav" }} />
    <Composition id="V32-Silent" component={Video} durationInFrames={V32_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V32-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: V32_LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
