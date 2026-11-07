// V35 · فرقِ مجلسِ نمایندگان و سنای آمریکا — vertical map + blueprint explainer (after @geoglobe_tales «House vs Senate»)
// Imagery: NASA GIBS Blue Marble (public domain) · USGS National Map orthoimagery (public domain) · shapes: Natural Earth,
// US Census cartographic boundaries (public domain) · film stills: public-domain trailer frames (Wikimedia Commons)
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Composition, Easing, Html5Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import G from "./geo.json";
import { Cam, FA, FPS, H, Key, P, TOTAL, W, Word, camAt, clamp, cut, d, lerp, nz, pop, ramp, rectOf, scr, toScr, win, wd, words } from "./map";

const fontHandle = typeof document !== "undefined" ? delayRender("v35 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V35Black", "fonts/Vazirmatn-Black.ttf"], ["V35Bold", "fonts/Vazirmatn-Bold.ttf"], ["V35Hero", "fonts/Lalezar-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}
const EMOJI = "'Noto Color Emoji'";
export const V35_FRAMES = Math.ceil(TOTAL * FPS);
const GEO = G as unknown as {
  states: Record<string, P[][]>; cent: Record<string, P>; NY: P[][]; WY: P[][];
  nyd: { n: number; r: P[][]; c: P }[]; dc: P[];
};

/* ===================== cues ===================== */
const T = {
  nov: wd(1, "سوم"), ray: wd(1, "رأی"), nam: wd(1, "نماینده"), sen: wd(1, "سناتور"), farm: wd(1, "فرماندار"),
  ehtemal: wd(2, "احتمال"), film: wd(2, "فیلم"), vali2: wd(2, "ولی"), har2: wd(2, "هر"),
  majles3: wd(3, "مجلس"), sena3: wd(3, "سنا"), bia: wd(3, "بیا"),
  bebin: wd(4, "ببین"), kakh: wd(4, "کاخ"), vash: wd(4, "واشنگتن"), rais4: wd(4, "رئیس"),
  hamin5: wd(5, "همین"), capitol: wd(5, "کاپیتول"), kong5: wd(5, "کنگره"),
  kong6: wd(6, "کنگره"), do6: wd(6, "دو"), majles6: wd(6, "مجلس", 1), chahar: wd(6, "چهارصد"), sena6: wd(6, "سنا"), sad6: wd(6, "صد"),
  hame7: wd(7, "همه"), vali7: wd(7, "ولی"), migan: wd(7, "می‌گن"), maamulan: wd(7, "معمولا"), aza: wd(7, "اعضای"),
  baraye8: wd(8, "برای"), ny8: wd(8, "نیویورک"), wy8: wd(8, "وایومینگ"),
  jam9: wd(9, "جمعیتش"), hoze9: wd(9, "حوزه"),
  ny10: wd(10, "نیویورک"), bist10: wd(10, "بیست"), vali10: wd(10, "ولی"), wy10: wd(10, "وایومینگ"), yeki10: wd(10, "یکی"),
  mardom11: wd(11, "مردم"), entekhab11: wd(11, "انتخاب"), hezb11: wd(11, "حزبی"),
  deha: wd(12, "ده‌ها"), reghabat: wd(12, "رقابت"), dem12: wd(12, "دموکرات"), jom12: wd(12, "جمهوری"),
  dar13: wd(13, "در"), barande: wd(13, "برنده"), mire: wd(13, "می‌ره"), kol13: wd(13, "کل"), chahar13: wd(13, "چهارصد"),
  pas14: wd(14, "پس"), har14: wd(14, "هر"),
  vali15: wd(15, "ولی"), bist15: wd(15, "بیست"), faghat15: wd(15, "فقط"),
  vase16: wd(16, "واسه"), bozorg: wd(16, "بزرگ"), zur: wd(16, "زور"), majles16: wd(16, "مجلس"), sena16: wd(16, "سنا"),
  inja17: wd(17, "اینجا"), panjah: wd(17, "پنجاه"), jam17: wd(17, "جمعیتشون"), do17: wd(17, "دو"), miran: wd(17, "می‌رن"),
  vase18: wd(18, "واسه"), sad18: wd(18, "صد"),
  senat19: wd(19, "سناتورها"), shesh: wd(19, "شش"), do19: wd(19, "دو"), yeksom: wd(19, "یک‌سوم"),
  tasvib: wd(20, "تصویب"), har20: wd(20, "هر"), majles20: wd(20, "مجلس"), emza: wd(20, "امضای"),
  farm21: wd(21, "فرماندار"), rais21: wd(21, "رئیس"),
  ozv22: wd(22, "عضو"), kong22: wd(22, "کنگره"), rais22: wd(22, "رئیس"),
  korsi23: wd(23, "کرسی"), dem23: wd(23, "دموکرات"), jom23: wd(23, "جمهوری"), tavazon: wd(23, "توازن"),
};
// scene boundaries
const S_BLUE1 = T.kong6 - 0.06, S_SPLIT = T.baraye8 - 0.1, S_NY = T.ny10 - 0.1, S_WY = T.vali10 - 0.05, S_MAP2 = T.mardom11 - 0.08;
const S_BLUE2 = T.pas14 - 0.08, S_MAP3 = T.inja17 - 0.08, S_BLUE3 = T.vase18 - 0.08;

/* ===================== satellite layers (one canvas, cropped to the screen) ===================== */
const LAYERS = {
  L0: { f: "v34/L0.jpg", b: [-172, -25, -58, 74], fe: false },
  US: { f: "v35/US.jpg", b: [-128, -64, 22, 52], fe: false },
  NY: { f: "v35/NY.jpg", b: [-81, -71, 39.5, 46], fe: false },
  WY: { f: "v35/WY.jpg", b: [-112.5, -102.5, 39.5, 46.5], fe: false },
  DC: { f: "v35/DC.jpg", b: [-77.13, -76.9, 38.78, 39.0], fe: true },
  DCmall: { f: "v35/DCmall.jpg", b: [-77.06, -76.995, 38.862, 38.925], fe: true },
  STATES: { f: "v35/states.png", b: [-128, -64, 22, 52], fe: false },
  DIST: { f: "v35/districts.png", b: [-128, -64, 22, 52], fe: false },
} as const;
type LK = keyof typeof LAYERS;
type Src = HTMLImageElement | HTMLCanvasElement;
const IMGS: Partial<Record<LK, Src>> = {};
let loading: Promise<void> | null = null;
const feather = (im: HTMLImageElement) => {
  const c = document.createElement("canvas");
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext("2d")!;
  g.drawImage(im, 0, 0);
  g.globalCompositeOperation = "destination-in";
  for (const [x1, y1] of [[c.width, 0], [0, c.height]]) {
    const gr = g.createLinearGradient(0, 0, x1, y1);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.06, "#000"); gr.addColorStop(0.94, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  }
  return c;
};
const loadAll = () => (loading ??= Promise.all((Object.keys(LAYERS) as LK[]).map((k) => new Promise<void>((res, rej) => {
  const im = new Image();
  im.onload = () => { IMGS[k] = LAYERS[k].fe ? feather(im) : im; res(); };
  im.onerror = () => rej(new Error("image " + k));
  im.src = staticFile(LAYERS[k].f);
}))).then(() => undefined));
const drawLayer = (g: CanvasRenderingContext2D, cam: Cam, k: LK, o: number) => {
  const im = IMGS[k];
  if (!im || o <= 0.001) return;
  const L = LAYERS[k];
  const r = rectOf(cam, L.b[0], L.b[1], L.b[2], L.b[3]);
  const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(W, r.left + r.width), y1 = Math.min(H, r.top + r.height);
  if (x1 <= x0 || y1 <= y0) return;
  const iw = im instanceof HTMLImageElement ? im.naturalWidth : im.width, ih = im instanceof HTMLImageElement ? im.naturalHeight : im.height;
  g.globalAlpha = o;
  g.drawImage(im, ((x0 - r.left) / r.width) * iw, ((y0 - r.top) / r.height) * ih, Math.max(0.5, ((x1 - x0) / r.width) * iw), Math.max(0.5, ((y1 - y0) / r.height) * ih), x0, y0, x1 - x0, y1 - y0);
  g.globalAlpha = 1;
};
const MapCanvas: React.FC<{ cam: Cam; o: Partial<Record<LK, number>>; clip?: string }> = ({ cam, o, clip }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("v35 map images"));
  const [ready, setReady] = useState(false);
  useEffect(() => { loadAll().then(() => { setReady(true); continueRender(handle); }).catch((e) => console.error(e)); }, [handle]);
  const key = JSON.stringify([cam, o]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !ready) return;
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.fillStyle = "#0b1d26"; g.fillRect(0, 0, W, H);
    (Object.keys(LAYERS) as LK[]).forEach((k) => drawLayer(g, cam, k, o[k] ?? 0));
  }, [ready, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, clipPath: clip }} />;
};
const satO = (s: number): Partial<Record<LK, number>> => ({
  L0: s > 3 ? 1 : 0, US: s > 1.2 ? 1 : 0, DC: clamp((1.4 - s) / 0.7), DCmall: clamp((0.3 - s) / 0.12),
});

/* ===================== shared pieces ===================== */
const FAST = Easing.bezier(0.72, 0, 0.18, 1);
const LIN = Easing.linear;
const polys = (cam: Cam, rings: P[][]) => rings.map((r) => d(toScr(cam, r), true)).join(" ");

const Hand: React.FC<{ txt: string; x: number; y: number; s: number; size?: number; rot?: number; color?: string }> = ({ txt, x, y, s, size = 70, rot = -6, color = "#fff" }) =>
  s <= 0.01 ? null : (
    <div dir="rtl" style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: "nowrap",
      fontFamily: "V35Hero", fontSize: size, color, opacity: clamp(s * 1.6), textShadow: "0 4px 12px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.8)",
    }}>{txt}</div>
  );
const Label: React.FC<{ x: number; y: number; text: string; s: number; size?: number; color?: string; bg?: string }> = ({ x, y, text, s, size = 52, color = "#fff", bg }) =>
  s <= 0.01 ? null : (
    <div dir="rtl" style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, whiteSpace: "nowrap", fontFamily: "V35Black", fontSize: size, color,
      opacity: clamp(s * 1.6), padding: bg ? "4px 22px 10px" : 0, background: bg, borderRadius: 10,
      textShadow: bg ? "none" : "0 3px 10px rgba(0,0,0,.85), 0 0 2px rgba(0,0,0,.9)", boxShadow: bg ? "0 8px 18px rgba(0,0,0,.35)" : undefined,
    }}>{text}</div>
  );
// a hand-drawn yellow loop (draws itself)
const Loop: React.FC<{ cx: number; cy: number; rx: number; ry: number; k: number; o?: number; rot?: number }> = ({ cx, cy, rx, ry, k, o = 1, rot = -4 }) => {
  if (k <= 0.001 || o <= 0.001) return null;
  const pts: string[] = [];
  const N = 90;
  for (let i = 0; i <= N * k * 1.08; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI * 0.6;
    const wob = 1 + 0.04 * Math.sin(i * 0.37) + (i / N) * 0.05;
    pts.push(`${(cx + Math.cos(a) * rx * wob).toFixed(1)},${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
  }
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: o }}>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        <path d={"M" + pts.join("L")} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
        <path d={"M" + pts.join("L")} fill="none" stroke="#ffe23b" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};
const Arrow: React.FC<{ x: number; y: number; s: number; from?: "top" | "bottom" }> = ({ x, y, s, from = "top" }) =>
  s <= 0.01 ? null : (
    <svg width={90} height={150} viewBox="0 0 90 150" style={{ position: "absolute", left: x - 45, top: from === "top" ? y - 160 : y + 10, transform: `scale(${s}) rotate(${from === "top" ? 0 : 180}deg)`, transformOrigin: "50% 100%", overflow: "visible", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.6))" }}>
      <path d="M33 0 H57 V96 H86 L45 148 L4 96 H33 Z" fill="#fff" />
    </svg>
  );
// person glyph
const Person: React.FC<{ c?: string; size?: number }> = ({ c = "#fff", size = 30 }) => (
  <svg width={size * 0.62} height={size} viewBox="0 0 31 50" style={{ display: "block" }}>
    <circle cx={15.5} cy={7} r={6.5} fill={c} />
    <path d="M5 16 Q15.5 13 26 16 Q29 17 29 21 V33 Q29 35 27 35 H25 V48 Q25 50 23 50 H19 Q17 50 17 48 V36 H14 V48 Q14 50 12 50 H8 Q6 50 6 48 V35 H4 Q2 35 2 33 V21 Q2 17 5 16 Z" fill={c} />
  </svg>
);
const People: React.FC<{ n: number; cols: number; size?: number; k?: number; color?: (i: number) => string; gap?: number }> = ({ n, cols, size = 30, k = 1, color, gap = 3 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${size * 0.62}px)`, gap, direction: "ltr" }}>
    {Array.from({ length: n }, (_, i) => {
      const a = clamp(k * n * 1.2 - i * 1.0);
      return <div key={i} style={{ opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}><Person c={color ? color(i) : "#fff"} size={size} /></div>;
    })}
  </div>
);
const Card: React.FC<{ src: string; x: number; y: number; w: number; h: number; rot: number; s: number; o?: number }> = ({ src, x, y, w, h, rot, s, o = 1 }) =>
  s <= 0.01 || o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${s})`, opacity: o, background: "#f4f1ea", padding: 14, boxShadow: "0 18px 40px rgba(0,0,0,.55)", borderRadius: 6 }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.15) contrast(1.05)" }} />
    </div>
  );

// semicircle parliament: seats sorted by angle (left → right)
const hemi = (n: number, rows: number, r0: number, r1: number) => {
  const totalLen = Array.from({ length: rows }, (_, i) => lerp(r0, r1, i / (rows - 1))).reduce((a, b) => a + b, 0);
  const seats: { x: number; y: number; a: number }[] = [];
  let left = n;
  for (let i = 0; i < rows; i++) {
    const r = lerp(r0, r1, i / (rows - 1));
    const m = i === rows - 1 ? left : Math.round((n * r) / totalLen);
    left -= m;
    for (let j = 0; j < m; j++) {
      const a = Math.PI - (Math.PI * (j + 0.5)) / m;
      seats.push({ x: Math.cos(a) * r, y: -Math.sin(a) * r, a });
    }
  }
  return seats.sort((p, q) => q.a - p.a);
};
const SEN = hemi(100, 5, 70, 150), HOU = hemi(435, 11, 120, 330);
const Hemi: React.FC<{ seats: typeof SEN; x: number; y: number; dot: number; red: number; blue: number; o: number; label: string; up?: boolean }> = ({ seats, x, y, dot, red, blue, o, label, up = true }) =>
  o <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <svg width={1} height={1} style={{ overflow: "visible", position: "absolute" }}>
        <g transform={up ? undefined : "scale(1,-1)"}>
          {seats.map((p, i) => {
            const c = i < red ? "#e3283c" : i >= seats.length - blue ? "#2e8cf0" : "#ffffff";
            return <circle key={i} cx={p.x} cy={p.y} r={dot} fill={c} />;
          })}
        </g>
      </svg>
      <div dir="rtl" style={{ position: "absolute", left: 0, top: up ? 26 : -96, transform: "translateX(-50%)", fontFamily: "V35Black", fontSize: 46, color: "#fff", whiteSpace: "nowrap", textShadow: "0 3px 10px rgba(0,0,0,.5)" }}>{label}</div>
    </div>
  );

/* ===================== MAP 1: voters → films → question → DC → Capitol ===================== */
const K1: Key[] = [
  { t: 0, lon: -99, lat: 46, span: 64 },
  { t: T.dar13, lon: -97, lat: 44, span: 52, ease: LIN },
];
const KDC: Key[] = [
  { t: T.bebin - 0.05, lon: -97, lat: 43, span: 50 },
  { t: T.bebin + 0.85, lon: -77.0365, lat: 38.8965, span: 0.05, ease: FAST },
  { t: T.vash - 0.25, lon: -77.0365, lat: 38.897, span: 0.043, ease: LIN },
  { t: T.vash + 0.45, lon: -77.025, lat: 38.895, span: 0.15, ease: FAST },
  { t: T.rais4 - 0.15, lon: -77.025, lat: 38.894, span: 0.14, ease: LIN },
  { t: T.rais4 + 0.5, lon: -77.0365, lat: 38.8975, span: 0.045, ease: FAST },
  { t: T.hamin5, lon: -77.035, lat: 38.897, span: 0.043, ease: LIN },
  { t: T.capitol - 0.05, lon: -77.0091, lat: 38.8895, span: 0.042, ease: FAST },
  { t: S_BLUE1, lon: -77.0091, lat: 38.8897, span: 0.034, ease: LIN },
];
// voters' hands rising across the US
const HANDS: P[] = [[-120.5, 46.8], [-117, 43.5], [-121.5, 38.5], [-116.5, 35.5], [-111.8, 40.6], [-112, 33.8], [-106.5, 35.5], [-105.5, 39.6], [-108, 43], [-100.5, 47], [-99.5, 41.5], [-97.5, 35.5], [-98.5, 30.5], [-93.5, 45], [-92.5, 38.5], [-92, 31.5], [-89.2, 42.5], [-86.5, 40], [-86.5, 35.5], [-84.5, 32.8], [-82.5, 28.5], [-83.5, 42.6], [-80.5, 37.5], [-81, 34], [-77.5, 40.8], [-75.2, 42.8], [-72.4, 44], [-78.5, 35.6], [-95.5, 39], [-101, 44.5]];
const VoteHand: React.FC<{ x: number; y: number; k: number; i: number; t: number }> = ({ x, y, k, i, t }) => {
  if (k <= 0.01) return null;
  const sway = Math.sin(t * 2.2 + i) * 3;
  return (
    <svg width={40} height={110} viewBox="0 0 40 110" style={{ position: "absolute", left: x - 20, top: y - 100 + (1 - k) * 60, opacity: clamp(k * 2), transform: `rotate(${sway}deg)`, transformOrigin: "50% 100%", filter: "drop-shadow(0 4px 5px rgba(0,0,0,.45))" }}>
      <rect x={12} y={30} width={14} height={80} rx={6} fill="#efb894" />
      <rect x={10} y={22} width={20} height={16} rx={7} fill="#f2c2a0" />
      <rect x={5} y={2} width={30} height={24} rx={2} fill="#fff" transform="rotate(-8 20 14)" />
      <path d="M11 9 H28 M11 14 H25" stroke="#9aa" strokeWidth={2} transform="rotate(-8 20 14)" />
    </svg>
  );
};

const Map1: React.FC<{ t: number }> = ({ t }) => {
  const dc = t >= T.bebin - 0.05;
  const cam = dc ? camAt(KDC, t) : camAt(K1, t);
  const c = { ...cam, lon: cam.lon + nz("m1x", t * 0.1) * cam.span * 0.002, lat: cam.lat + nz("m1y", t * 0.1) * cam.span * 0.002 };
  const prev = dc ? camAt(KDC, t - 1 / FPS) : camAt(K1, t - 1 / FPS);
  const blur = clamp((Math.abs(Math.log(prev.span / cam.span)) * 900 + Math.hypot(scr(cam, prev.lon, prev.lat).x - W / 2, scr(cam, prev.lon, prev.lat).y - H / 2) - 14) / 10, 0, 9);
  const S = (p: P) => scr(c, p[0], p[1]);
  const novS = pop(t, T.nov) * (1 - ramp(t, T.ray - 0.3, T.ray));
  const handsO = 1 - ramp(t, T.majles3 - 0.3, T.majles3);
  const lbl = (at: number) => pop(t, at - 0.05) * (1 - ramp(t, T.majles3 - 0.3, T.majles3));
  const cards = win(t, T.ehtemal + 0.6, T.vali2 + 0.15, 0.01, 0.35);
  const loopK = ramp(t, T.vali2 + 0.1, T.vali2 + 0.8);
  const q = (i: number) => pop(t, T.har2 + i * 0.12);
  const hemO = win(t, T.majles3 - 0.2, T.bebin + 0.05, 0.35, 0.3);
  const fillK = ramp(t, T.majles3 + 0.2, T.bia + 0.2);
  // DC overlays
  const wh = S([-77.0365, 38.8977]), cap = S([-77.0091, 38.8899]);
  const whArrow = pop(t, T.kakh - 0.05) * (1 - ramp(t, T.vash - 0.2, T.vash)) + pop(t, T.rais4 + 0.5) * (1 - ramp(t, T.hamin5 + 0.2, T.hamin5 + 0.5));
  const dcO = win(t, T.vash - 0.05, T.rais4 + 0.4, 0.4, 0.3);
  const pres = pop(t, T.rais4 + 0.35) * (1 - ramp(t, T.hamin5 + 0.3, T.hamin5 + 0.6));
  const capArrow = pop(t, T.capitol);
  const congress = pop(t, T.kong5 - 0.05);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <MapCanvas cam={c} o={{ ...satO(c.span), STATES: dc ? 0 : 0.35 * (1 - ramp(t, T.majles3, T.majles3 + 0.5)) }} />
        {dcO > 0.01 && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <path d={d(toScr(c, GEO.dc), true)} fill={`rgba(70,120,230,${0.2 * dcO})`} stroke={`rgba(200,220,255,${dcO})`} strokeWidth={6} strokeLinejoin="round" />
          </svg>
        )}
        {!dc && HANDS.map((p, i) => { const q2 = S(p); return <VoteHand key={i} x={q2.x} y={q2.y} i={i} t={t} k={ramp(t, T.ray - 0.2 + (i % 10) * 0.05, T.ray + 0.25 + (i % 10) * 0.05) * handsO} />; })}
        <Hand txt="۳ نوامبر" x={540} y={760} s={novS} size={180} color="#ffd21f" rot={-3} />
        <Hand txt="نماینده‌های کنگره" x={540} y={560} s={lbl(T.nam)} size={74} rot={-4} />
        <Hand txt="سناتورها" x={250} y={420} s={lbl(T.sen)} size={68} rot={-9} />
        <Hand txt="فرماندارها" x={830} y={380} s={lbl(T.farm)} size={68} rot={5} />
        <Loop cx={540} cy={460} rx={430} ry={150} k={loopK} o={1 - ramp(t, T.majles3 - 0.3, T.majles3)} />
        {["؟", "؟", "؟"].map((m, i) => <Hand key={i} txt={m} x={[300, 560, 800][i]} y={[250, 200, 260][i]} s={q(i) * (1 - ramp(t, T.majles3 - 0.3, T.majles3))} size={150} rot={[-12, 4, 14][i]} />)}
        <Card src="v35/mov_smith.jpg" x={360} y={1000} w={470} h={360} rot={-8} s={1} o={cards} />
        <Card src="v35/mov_stewart.jpg" x={700} y={1070} w={380} h={420} rot={7} s={1} o={cards * ramp(t, T.ehtemal + 0.85, T.ehtemal + 1.0)} />
        <Card src="v35/mov_third.jpg" x={500} y={1180} w={430} h={330} rot={-2} s={1} o={cards * ramp(t, T.ehtemal + 1.1, T.ehtemal + 1.25)} />
        {hemO > 0.01 && <AbsoluteFill style={{ background: `rgba(5,20,40,${0.45 * hemO})` }} />}
        <Hemi seats={SEN} x={540} y={560} dot={8} red={Math.round(46 * fillK)} blue={Math.round(54 * fillK)} o={hemO * pop(t, T.sena3 - 0.1)} label="سنا" />
        <Hemi seats={HOU} x={540} y={1260} dot={7.5} red={Math.round(176 * fillK)} blue={Math.round(259 * fillK)} o={hemO * pop(t, T.majles3 - 0.05)} label="مجلسِ نمایندگان" up={true} />
        {/* DC */}
        <Arrow x={wh.x} y={wh.y - 40} s={whArrow} />
        <Label x={wh.x} y={wh.y + 130} text="کاخِ سفید" s={whArrow} size={58} />
        <Label x={540} y={360} text="واشنگتن دی‌سی" s={pop(t, T.vash) * dcO} size={80} />
        {pres > 0.01 && (
          <div style={{ position: "absolute", left: wh.x - 130, top: wh.y - 560, width: 260, transform: `scale(${pres})`, transformOrigin: "50% 100%" }}>
            <div style={{ height: 320, background: "#fff", padding: 10, borderRadius: 12, boxShadow: "0 16px 30px rgba(0,0,0,.5)" }}>
              <Img src={staticFile("v35/pres_trump.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
            </div>
            <div dir="rtl" style={{ marginTop: 10, textAlign: "center", fontFamily: "V35Black", fontSize: 44, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,.8)" }}>رئیس‌جمهور</div>
          </div>
        )}
        <Arrow x={cap.x} y={cap.y - 40} s={capArrow} />
        <Label x={cap.x} y={cap.y + 130} text="ساختمونِ کاپیتول" s={capArrow} size={58} />
        <Label x={cap.x} y={cap.y + 225} text="کنگره" s={congress} size={54} bg="#e07a12" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== BLUEPRINT (the org chart) ===================== */
const Grid: React.FC = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse at 50% 40%, #1f7ad6 0%, #1564b8 55%, #0d4b91 100%)",
  }}>
    <AbsoluteFill style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,.07) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.07) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
      backgroundSize: "120px 120px, 120px 120px, 30px 30px, 30px 30px",
    }} />
  </AbsoluteFill>
);
const Building: React.FC<{ kind: "wh" | "cap"; x: number; y: number; s: number; label: string; w?: number }> = ({ kind, x, y, s, label, w = 300 }) =>
  s <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w * 0.36, width: w, transform: `scale(${s})`, transformOrigin: "50% 60%" }}>
      <Img src={staticFile(kind === "wh" ? "v35/wh_cut.png" : "v35/cap_cut.png")} style={{ width: "100%", filter: "drop-shadow(0 14px 16px rgba(0,0,0,.45))" }} />
      <div dir="rtl" style={{ textAlign: "center", fontFamily: "V35Black", fontSize: w * 0.15, color: "#fff", marginTop: -4, textShadow: "0 3px 8px rgba(0,0,0,.45)" }}>{label}</div>
    </div>
  );
const Box: React.FC<{ x: number; y: number; s: number; text: string; w?: number }> = ({ x, y, s, text, w = 330 }) =>
  s <= 0.01 ? null : (
    <div dir="rtl" style={{ position: "absolute", left: x - w / 2, top: y - 38, width: w, height: 76, transform: `scale(${s})`, background: "linear-gradient(#f39a2c,#df7a0f)", borderRadius: 8, border: "3px solid #ffd39b", boxShadow: "0 10px 20px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V35Black", fontSize: 40, color: "#fff" }}>{text}</div>
  );
const Num: React.FC<{ x: number; y: number; v: number; s: number; size?: number; color?: string }> = ({ x, y, v, s, size = 96, color = "#ffd21f" }) =>
  s <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, fontFamily: "V35Hero", fontSize: size, color, textShadow: "0 5px 0 rgba(0,0,0,.25), 0 8px 18px rgba(0,0,0,.35)" }}>{FA(Math.round(v))}</div>
  );
const Lines: React.FC<{ segs: [number, number, number, number, number][] }> = ({ segs }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    {segs.map(([x0, y0, x1, y1, k], i) => k > 0.01 ? <line key={i} x1={x0} y1={y0} x2={lerp(x0, x1, k)} y2={lerp(y0, y1, k)} stroke="#fff" strokeWidth={5} strokeLinecap="round" /> : null)}
  </svg>
);
const StateShape: React.FC<{ rings: P[][]; x: number; y: number; w: number; s: number; color: string }> = ({ rings, x, y, w, s, color }) => {
  if (s <= 0.01) return null;
  const all = rings.flat();
  const lo0 = Math.min(...all.map((p) => p[0])), lo1 = Math.max(...all.map((p) => p[0])), la0 = Math.min(...all.map((p) => p[1])), la1 = Math.max(...all.map((p) => p[1]));
  const k = w / (lo1 - lo0), hh = (la1 - la0) * k * 1.3;
  const pd = rings.map((r) => "M" + r.map(([a, b]) => `${((a - lo0) * k).toFixed(1)},${((la1 - b) * k * 1.3).toFixed(1)}`).join("L") + "Z").join(" ");
  return <svg width={w} height={hh} style={{ position: "absolute", left: x - w / 2, top: y - hh / 2, transform: `scale(${s})`, overflow: "visible" }}><path d={pd} fill={color} stroke="#fff" strokeWidth={3} /></svg>;
};
const Check: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x - 48, top: y - 48, width: 96, height: 96, transform: `scale(${s})`, borderRadius: 18, background: "#1fbf4a", border: "5px solid #c9ffd6", boxShadow: "0 0 26px #34ff6c, 0 0 60px rgba(52,255,108,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={60} height={60} viewBox="0 0 60 60"><path d="M10 31 L25 45 L50 15" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
const XMark: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0.01 ? null : (
    <svg width={80} height={80} viewBox="0 0 80 80" style={{ position: "absolute", left: x - 40, top: y - 40, transform: `scale(${s})`, filter: "drop-shadow(0 0 10px rgba(255,40,60,.8))" }}>
      <path d="M14 14 L66 66 M66 14 L14 66" stroke="#ff2b3f" strokeWidth={13} strokeLinecap="round" />
    </svg>
  );
const LawDoc: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = -8 }) =>
  s <= 0.01 ? null : (
    <div style={{ position: "absolute", left: x - 90, top: y - 115, width: 180, height: 230, transform: `rotate(${rot}deg) scale(${s})`, background: "linear-gradient(#fbf7ec,#efe6cf)", borderRadius: 6, boxShadow: "0 14px 26px rgba(0,0,0,.45)", padding: "18px 16px" }}>
      <div style={{ width: 50, height: 50, margin: "0 auto 8px", borderRadius: "50%", border: "4px double #8a6a2a", background: "radial-gradient(#e9cf7a,#b8912d)" }} />
      <div dir="rtl" style={{ fontFamily: "V35Black", fontSize: 30, color: "#5a3d10", textAlign: "center", lineHeight: 1.1 }}>قانونِ<br />فدرال</div>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 5, background: "rgba(90,61,16,.35)", margin: "9px 4px 0", borderRadius: 3, width: `${88 - i * 9}%` }} />)}
    </div>
  );

const Blueprint: React.FC<{ t: number }> = ({ t }) => {
  // which part of the story
  const p1 = t < S_SPLIT, p2 = t >= S_BLUE2 && t < S_MAP3, p3 = t >= S_BLUE3;
  const t0 = p1 ? S_BLUE1 : p2 ? S_BLUE2 : S_BLUE3;
  const enter = ramp(t, t0, t0 + 0.35); // whole board slides in
  // layout (moves as the story needs room)
  const govK = p3 ? ramp(t, T.farm21 - 0.3, T.farm21 + 0.4) : 0;
  const hemK = p3 ? ramp(t, T.korsi23 - 0.25, T.korsi23 + 0.5) : 0;
  const base = p1 ? 0 : 1;
  const sc = lerp(lerp(lerp(1, 0.86, base), 0.78, govK), 0.55, hemK);
  const ox = lerp(0, 190, govK) * (1 - hemK), oy = lerp(lerp(lerp(0, -160, base), -120, govK), -420, hemK);
  const tf = (x: number, y: number) => ({ x: (x - 540) * sc + 540 + ox, y: (y - 672) * sc + 672 + oy });
  // nodes
  const whY = 290, capY = 600, boxY = 860, gridY = 940;
  const houseX = p2 && t < T.sena16 - 0.3 ? 540 : 330, senX = 760;
  const sHouseX = p2 ? lerp(540, 330, ramp(t, T.majles16 - 0.2, T.majles16 + 0.4)) : 330;
  const hx = p1 || p3 ? houseX : sHouseX;
  const whS = p1 ? pop(t, S_BLUE1 + 0.1) : 1;
  const capS = p1 ? pop(t, S_BLUE1 + 0.2) : 1;
  const branchK = p1 ? ramp(t, T.do6 - 0.1, T.do6 + 0.5) : 1;
  const houseS = p1 ? pop(t, T.majles6 - 0.05) : 1;
  const senS = p1 ? pop(t, T.sena6 - 0.05) : p2 ? pop(t, T.sena16 - 0.1) : 1;
  const houseN = p1 ? ramp(t, T.chahar - 0.05, T.chahar + 1.1, LIN) * 435 : 435;
  const senN = p1 ? ramp(t, T.sad6 - 0.1, T.sad6 + 0.5, LIN) * 100 : p2 ? ramp(t, T.sena16, T.sena16 + 0.5, LIN) * 100 : 100;
  const peopleH = p1 ? ramp(t, T.chahar - 0.2, T.chahar + 1.1) : 1;
  const peopleS = p1 ? ramp(t, T.sad6 - 0.2, T.sad6 + 0.4) : p2 ? ramp(t, T.sena16 - 0.1, T.sena16 + 0.4) : 1;
  // congressmen loop
  const loopAll = p1 ? ramp(t, T.hame7 - 0.1, T.hame7 + 0.6) * (1 - ramp(t, T.migan - 0.1, T.migan + 0.1)) : 0;
  const loopHouse = p1 ? ramp(t, T.migan, T.migan + 0.6) : 0;
  const yellow = p1 ? ramp(t, T.maamulan, T.aza + 0.4) : 0;
  // part 2: every 2 years, 26 vs 1, senate
  const twoY = p2 ? pop(t, T.har14 - 0.05) * (1 - ramp(t, T.vali15 - 0.2, T.vali15 + 0.1)) : 0;
  const nyS = p2 ? pop(t, T.bist15 - 0.05) * (1 - ramp(t, T.majles16 - 0.3, T.majles16)) : 0;
  const wyS = p2 ? pop(t, T.faghat15) * (1 - ramp(t, T.majles16 - 0.3, T.majles16)) : 0;
  const bully = p2 ? win(t, T.bozorg - 0.1, T.majles16 - 0.3, 0.3, 0.2) : 0;
  const circ = p2 ? ramp(t, T.vase16, T.vase16 + 0.7) * (1 - ramp(t, T.majles16 - 0.3, T.majles16)) : 0;
  // part 3: 6 years, 1/3, law, governors, balance
  const six = p3 ? pop(t, T.shesh - 0.05) * (1 - ramp(t, T.tasvib - 0.3, T.tasvib)) : 0;
  const two = p3 ? pop(t, T.do19 - 0.05) * (1 - ramp(t, T.tasvib - 0.3, T.tasvib)) : 0;
  const third = p3 ? ramp(t, T.yeksom - 0.1, T.yeksom + 0.4) * (1 - ramp(t, T.tasvib - 0.3, T.tasvib)) : 0;
  const law = p3 ? pop(t, T.tasvib - 0.05) * (1 - ramp(t, T.farm21 - 0.3, T.farm21)) : 0;
  const lawMove = p3 ? ramp(t, T.emza - 0.5, T.emza + 0.2) : 0;
  const ckH = p3 ? pop(t, T.har20 - 0.05) * (1 - ramp(t, T.farm21 - 0.3, T.farm21)) : 0;
  const ckS = p3 ? pop(t, T.majles20) * (1 - ramp(t, T.farm21 - 0.3, T.farm21)) : 0;
  const ckP = p3 ? pop(t, T.emza + 0.3) * (1 - ramp(t, T.farm21 - 0.3, T.farm21)) : 0;
  const gov = p3 ? pop(t, T.farm21 - 0.05) * (1 - ramp(t, T.korsi23 - 0.3, T.korsi23)) : 0;
  const govHand = p3 ? pop(t, T.rais21 - 0.05) * (1 - ramp(t, T.ozv22 - 0.2, T.ozv22 + 0.1)) : 0;
  const x1 = p3 ? pop(t, T.kong22) * (1 - ramp(t, T.korsi23 - 0.3, T.korsi23)) : 0;
  const x2 = p3 ? pop(t, T.rais22 + 0.1) * (1 - ramp(t, T.korsi23 - 0.3, T.korsi23)) : 0;
  const govLines = p3 ? ramp(t, T.ozv22 - 0.4, T.ozv22) * (1 - ramp(t, T.korsi23 - 0.3, T.korsi23)) : 0;
  const fill = p3 ? ramp(t, T.dem23 - 0.2, T.tavazon + 0.3, Easing.inOut(Easing.quad)) : 0;
  const redK = p3 ? ramp(t, T.jom23 - 0.2, T.tavazon + 0.6, Easing.inOut(Easing.quad)) : 0;

  const lawPos = { x: lerp(540, 540, lawMove), y: lerp(boxY - 150, whY + 40, lawMove) };
  const houseColor = (i: number) => (i < 45 * yellow ? "#ffd21f" : "#fff");
  const senColor = (i: number) => (i < Math.round(16 * third / 3 * 3) && third > 0 ? "#ffd21f" : "#fff");
  const lx = (x: number) => x; // board-space helper
  return (
    <AbsoluteFill style={{ transform: `translateX(${(1 - enter) * 1080}px)` }}>
      <Grid />
      <AbsoluteFill style={{ transform: `translate(${ox}px, ${oy}px) scale(${sc})`, transformOrigin: "50% 35%" }}>
        <Lines segs={[
          [540, whY + 70, 540, capY - 110, p1 ? ramp(t, S_BLUE1 + 0.3, S_BLUE1 + 0.7) : 1],
          [540, capY + 80, 540, boxY - 80, branchK],
          [lx(hx), boxY - 80, 540, boxY - 80, branchK],
          ...((senS > 0.01 ? [[540, boxY - 80, senX, boxY - 80, p2 ? ramp(t, T.majles16 - 0.1, T.majles16 + 0.4) : branchK], [senX, boxY - 80, senX, boxY - 40, senS]] : []) as [number, number, number, number, number][]),
          [lx(hx), boxY - 80, lx(hx), boxY - 40, houseS],
        ]} />
        <Building kind="wh" x={540} y={whY} s={whS} label="کاخِ سفید" w={360} />
        <Building kind="cap" x={540} y={capY} s={capS} label="کنگره" w={430} />
        <Box x={hx} y={boxY} s={houseS} text="مجلسِ نمایندگان" w={360} />
        <Box x={senX} y={boxY} s={senS} text="سنا" w={220} />
        <div style={{ position: "absolute", left: hx - 165, top: gridY, opacity: peopleH }}>
          <People n={45} cols={15} size={30} k={peopleH} color={houseColor} />
        </div>
        <Num x={hx} y={gridY + 200} v={houseN} s={houseS * peopleH} />
        {senS > 0.01 && <div style={{ position: "absolute", left: senX - 99, top: gridY + 20, opacity: peopleS }}>
          <People n={16} cols={8} size={34} k={peopleS} color={senColor} />
        </div>}
        <Num x={senX} y={gridY + 200} v={senN} s={senS * peopleS} />
        {/* congressmen */}
        <Loop cx={lerp(545, hx, loopHouse)} cy={gridY + 110} rx={lerp(420, 230, loopHouse)} ry={lerp(170, 160, loopHouse)} k={Math.max(loopAll, loopHouse)} />
        <Hand txt="نماینده‌های کنگره" x={215} y={700} s={p1 ? pop(t, T.hame7 + 0.2) * (1 - ramp(t, S_SPLIT - 0.3, S_SPLIT)) : 0} size={54} rot={-14} color="#ffe23b" />
        {/* every 2 years · 26 vs 1 */}
        <Hand txt="هر ۲ سال" x={hx - 230} y={gridY + 270} s={twoY} size={60} color="#ffe23b" rot={-8} />
        <div style={{ position: "absolute", left: 160, top: gridY + 300, transform: `scale(${nyS * (1 + 0.12 * bully)})`, transformOrigin: "50% 50%" }}>
          <People n={26} cols={13} size={26} />
        </div>
        <Num x={390} y={gridY + 290} v={26} s={nyS} size={80} />
        <StateShape rings={GEO.NY} x={270} y={gridY + 470} w={230} s={nyS} color="rgba(230,140,40,.85)" />
        <div style={{ position: "absolute", left: 740 + Math.sin(t * 40) * 4 * bully, top: gridY + 330, transform: `scale(${wyS * (1 - 0.15 * bully)})` }}><Person size={46} /></div>
        <Num x={760} y={gridY + 290} v={1} s={wyS} size={80} />
        <StateShape rings={GEO.WY} x={755} y={gridY + 470} w={150} s={wyS} color="rgba(205,70,55,.85)" />
        <Loop cx={540} cy={gridY + 390} rx={430} ry={190} k={circ} rot={2} />
        {/* senate: 6 years, a third every 2 years */}
        <Hand txt="۶ سال" x={senX + 30} y={capY + 40} s={six} size={70} color="#ffe23b" rot={6} />
        <Hand txt="هر ۲ سال" x={senX} y={gridY + 300} s={two} size={56} color="#ffe23b" rot={-6} />
        {third > 0.01 && <Num x={senX - 10} y={gridY + 390} v={33} s={third} size={64} color="#fff" />}
        <Hand txt="≈ ۱۰۰ ÷ ۳" x={senX + 10} y={gridY + 470} s={third} size={46} color="#fff" rot={0} />
        {/* federal law */}
        <LawDoc x={lawPos.x} y={lawPos.y} s={law} rot={lerp(-8, 4, lawMove)} />
        <Check x={hx - 150} y={boxY - 2} s={ckH} />
        <Check x={senX + 140} y={boxY - 2} s={ckS} />
        <Check x={540 + 170} y={whY} s={ckP} />
      </AbsoluteFill>
      {/* governors (screen space, beside the shifted board) */}
      {gov > 0.01 && (() => {
        const cp = tf(540, capY), wp = tf(540, whY);
        return <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: govLines }}>
            <path d={`M245 ${cp.y - 10} L${cp.x - 150} ${cp.y}`} stroke="#fff" strokeWidth={5} strokeDasharray="14 10" />
            <path d={`M245 ${cp.y - 60} L${wp.x - 130} ${wp.y + 20}`} stroke="#fff" strokeWidth={5} strokeDasharray="14 10" />
          </svg>
          <div style={{ position: "absolute", left: 40, top: cp.y - 200, transform: `scale(${gov})` }}><People n={12} cols={6} size={34} /></div>
          <Box x={140} y={cp.y - 30} s={gov} text="فرماندارها" w={230} />
          <Hand txt="رئیسِ ایالتِ خودشون" x={190} y={cp.y - 270} s={govHand} size={46} color="#ffe23b" rot={-6} />
          <XMark x={(245 + cp.x - 150) / 2} y={cp.y - 5} s={x1} />
          <XMark x={(245 + wp.x - 130) / 2} y={(cp.y - 60 + wp.y + 20) / 2} s={x2} />
        </>;
      })()}
      {/* the balance of power */}
      {hemK > 0.01 && <>
        <Hemi seats={SEN} x={540} y={830} dot={8} red={Math.round(46 * redK)} blue={Math.round(54 * fill)} o={hemK} label="سنا" />
        <Hemi seats={HOU} x={540} y={1300} dot={6.8} red={Math.round(176 * redK)} blue={Math.round(259 * fill)} o={hemK} label="مجلسِ نمایندگان" />
        <Label x={175} y={1010} text="جمهوری‌خواه‌ها" s={pop(t, T.jom23 - 0.05)} size={36} bg="#d8263a" />
        <Label x={915} y={1010} text="دموکرات‌ها" s={pop(t, T.dem23 - 0.05)} size={36} bg="#2a7fe0" />
      </>}
    </AbsoluteFill>
  );
};

/* ===================== NY vs WYOMING ===================== */
const DIV = [900, 180]; // divider x at top / bottom
const camNY0: Cam = { lon: -75.6, lat: 42.7, span: 12.5, ax: 330, ay: 1150 };
const camWY0: Cam = { lon: -107.55, lat: 43.0, span: 12.5, ax: 760, ay: 560 };
const Split: React.FC<{ t: number }> = ({ t }) => {
  const k = ramp(t, S_SPLIT, S_NY, LIN);
  const cNY = { ...camNY0, span: lerp(12.5, 11.2, k) }, cWY = { ...camWY0, span: lerp(12.5, 11.2, k) };
  const nyO = ramp(t, T.ny8 - 0.05, T.ny8 + 0.3), wyO = ramp(t, T.wy8 - 0.05, T.wy8 + 0.3);
  const popS = pop(t, T.jam9 - 0.05);
  const distK = ramp(t, T.hoze9 - 0.1, T.hoze9 + 0.9);
  const a = scr(cNY, -75.9, 42.9), b = scr(cWY, -107.55, 43.0);
  const div = ramp(t, S_SPLIT, S_SPLIT + 0.45);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <MapCanvas cam={cNY} o={{ L0: 1, US: 1, NY: 1 }} clip={`polygon(0 0, ${DIV[0]}px 0, ${DIV[1]}px ${H}px, 0 ${H}px)`} />
      <MapCanvas cam={cWY} o={{ L0: 1, US: 1, WY: 1 }} clip={`polygon(${DIV[0]}px 0, ${W}px 0, ${W}px ${H}px, ${DIV[1]}px ${H}px)`} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="cpNY" clipPathUnits="userSpaceOnUse"><path d={`M0 0 L${DIV[0]} 0 L${DIV[1]} ${H} L0 ${H} Z`} /></clipPath>
          <clipPath id="cpWY" clipPathUnits="userSpaceOnUse"><path d={`M${DIV[0]} 0 L${W} 0 L${W} ${H} L${DIV[1]} ${H} Z`} /></clipPath>
        </defs>
        <g clipPath="url(#cpNY)">
          <path d={polys(cNY, GEO.NY)} fill={`rgba(232,140,35,${0.5 * nyO})`} stroke={`rgba(255,230,190,${nyO})`} strokeWidth={4} />
          {GEO.nyd.map((x) => <path key={x.n} d={polys(cNY, x.r)} fill="none" stroke={`rgba(255,255,255,${0.75 * distK})`} strokeWidth={1.6} />)}
        </g>
        <g clipPath="url(#cpWY)">
          <path d={polys(cWY, GEO.WY)} fill={`rgba(210,70,55,${0.5 * wyO})`} stroke={`rgba(255,215,205,${wyO})`} strokeWidth={4} />
        </g>
        <line x1={DIV[0]} y1={0} x2={lerp(DIV[0], DIV[1], div)} y2={H * div} stroke="#fff" strokeWidth={9} />
      </svg>
      <Label x={a.x} y={a.y - 250} text="نیویورک" s={pop(t, T.ny8)} size={64} />
      <Label x={b.x} y={b.y - 230} text="وایومینگ" s={pop(t, T.wy8)} size={64} />
      <Label x={a.x} y={a.y + 40} text="۲۰٫۲ میلیون نفر" s={popS} size={40} bg="#d97a16" />
      <Label x={b.x} y={b.y + 40} text="۵۷۷ هزار نفر" s={pop(t, T.jam9 + 0.15)} size={40} bg="#c43c2f" />
    </AbsoluteFill>
  );
};
const NYFull: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { lon: -75.75, lat: 42.6, span: lerp(9.6, 8.6, ramp(t, S_NY, S_WY, LIN)) };
  const big = pop(t, T.bist10 - 0.05);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <MapCanvas cam={cam} o={{ L0: 1, US: 1, NY: 1 }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={polys(cam, GEO.NY)} fill="rgba(232,140,35,.42)" stroke="#ffe6c4" strokeWidth={4} />
        {GEO.nyd.map((x) => <path key={x.n} d={polys(cam, x.r)} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={2} />)}
      </svg>
      {GEO.nyd.map((x, i) => {
        const q = scr(cam, x.c[0], x.c[1]);
        const small = x.n <= 16;
        const off = small ? { x: (x.n % 4) * 34 - 50, y: Math.floor((x.n - 1) / 4) * 34 - 60 } : { x: 0, y: 0 };
        return <div key={x.n} style={{ position: "absolute", left: q.x + off.x, top: q.y + off.y, transform: `translate(-50%,-50%) scale(${pop(t, S_NY + 0.25 + i * 0.05)})`, fontFamily: "V35Black", fontSize: small ? 26 : 40, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,.9)" }}>{FA(x.n)}</div>;
      })}
      <Num x={540} y={520} v={26} s={big} size={220} />
      <Label x={540} y={700} text="حوزه‌ی انتخابیه" s={big} size={52} bg="#d97a16" />
    </AbsoluteFill>
  );
};
const WYFull: React.FC<{ t: number }> = ({ t }) => {
  const cam: Cam = { lon: -107.55, lat: 43.0, span: lerp(10.5, 9.2, ramp(t, S_WY, S_MAP2, LIN)) };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <MapCanvas cam={cam} o={{ L0: 1, US: 1, WY: 1 }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={polys(cam, GEO.WY)} fill="rgba(210,70,55,.45)" stroke="#ffd7cd" strokeWidth={5} />
      </svg>
      <Label x={540} y={560} text="وایومینگ" s={pop(t, T.wy10 - 0.05)} size={70} />
      <Num x={540} y={830} v={1} s={pop(t, T.yeki10 - 0.1)} size={260} />
      <Label x={540} y={1060} text="۵۷۷ هزار نفر" s={pop(t, T.yeki10 + 0.05)} size={42} bg="#c43c2f" />
    </AbsoluteFill>
  );
};

/* ===================== MAP 2: one district → parties → the winner → 435 ===================== */
const D21 = GEO.nyd.find((x) => x.n === 21)!;
const K2: Key[] = [
  { t: S_MAP2, lon: -74.65, lat: 43.75, span: 4.6 },
  { t: T.kol13 - 0.2, lon: -74.6, lat: 43.7, span: 3.9, ease: LIN },
  { t: T.kol13 + 0.8, lon: -96, lat: 38.5, span: 60, ease: FAST },
  { t: S_BLUE2, lon: -96, lat: 38.3, span: 56, ease: LIN },
];
const PARTIES = ["#2e8cf0", "#e3283c", "#2fb24a", "#f2c21b", "#8e44ad", "#ff7f27", "#16a3a3", "#ff4fa0", "#7a5230", "#5b6cff", "#9bd12e", "#c0392b"];
const Map2: React.FC<{ t: number }> = ({ t }) => {
  const c = camAt(K2, t);
  const prev = camAt(K2, t - 1 / FPS);
  const blur = clamp((Math.abs(Math.log(prev.span / c.span)) * 900 - 14) / 10, 0, 8);
  const S = (p: P) => scr(c, p[0], p[1]);
  const distO = 1 - ramp(t, T.kol13 - 0.2, T.kol13 + 0.3);
  const crowd = ramp(t, S_MAP2, S_MAP2 + 0.8);
  const cands = pop(t, T.entekhab11 - 0.1);
  const many = win(t, T.deha - 0.1, T.reghabat + 0.1, 0.4, 0.3);
  const two = ramp(t, T.reghabat - 0.1, T.reghabat + 0.3);
  const winner = ramp(t, T.barande - 0.1, T.barande + 0.3);
  const fly = ramp(t, T.mire - 0.1, T.mire + 0.7, Easing.in(Easing.cubic));
  const sideO = 1 - ramp(t, T.kol13 - 0.3, T.kol13);
  const usK = ramp(t, T.kol13 + 0.2, T.kol13 + 0.9);
  const cc = S(D21.c);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <MapCanvas cam={c} o={{ L0: 1, US: 1, NY: c.span < 20 ? 1 : 0, DIST: 0.9 * usK, STATES: 0.6 * usK }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: distO }}>
          {GEO.nyd.map((x) => <path key={x.n} d={polys(c, x.r)} fill="none" stroke="rgba(255,255,255,.6)" strokeWidth={2} />)}
          <path d={polys(c, D21.r)} fill="rgba(232,140,35,.35)" stroke="#fff" strokeWidth={5} />
        </svg>
      </AbsoluteFill>
      {/* the residents of the district */}
      {sideO > 0.01 && Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + 0.3, r = 120 + (i % 3) * 70;
        const x = cc.x + Math.cos(a) * r * 1.1, y = cc.y + 120 + Math.sin(a) * r * 0.8;
        const k = clamp(crowd * 18 - i * 0.7);
        return <div key={i} style={{ position: "absolute", left: x - 12, top: y - 20 + (1 - k) * 20, opacity: k * sideO }}><Person size={40} /></div>;
      })}
      {/* candidates with party flags */}
      {sideO > 0.01 && [0, 1, 2].map((i) => {
        const x = 540 + (i - 1) * 260, y = 560;
        const isWin = i === 1;
        const flyY = isWin ? lerp(0, -900, fly) : 0;
        const flagC = two > 0.5 ? (i === 0 ? "#2e8cf0" : i === 1 ? "#e3283c" : "#888") : PARTIES[i * 3];
        const o = (i === 2 ? 1 - two : 1) * sideO * (isWin ? 1 : 1 - winner * 0.6);
        const emb = two > 0.5 ? (i === 0 ? "🫏" : i === 1 ? "🐘" : "") : "";
        return (
          <div key={i} style={{ position: "absolute", left: x - 50, top: y + flyY, opacity: o * cands, transform: `scale(${cands * (isWin ? 1 + 0.2 * winner : 1)})` }}>
            <div style={{ position: "absolute", left: 46, top: -150, width: 6, height: 150, background: "#ddd" }} />
            <div style={{ position: "absolute", left: 52, top: -150, width: 110, height: 72, background: flagC, borderRadius: "0 8px 8px 0", boxShadow: "0 6px 12px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EMOJI, fontSize: 46 }}>{emb}</div>
            <Person size={100} />
            <div style={{ width: 100, height: 40, background: "#fff", borderRadius: 6, marginTop: 4 }} />
            {isWin && winner > 0.01 && <div style={{ position: "absolute", left: 18, top: -58, fontFamily: EMOJI, fontSize: 60, opacity: winner }}>👑</div>}
          </div>
        );
      })}
      {/* dozens of parties */}
      {many > 0.01 && <div style={{ position: "absolute", left: 90, right: 90, top: 280, display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", opacity: many }}>
        {PARTIES.map((col, i) => <div key={i} style={{ width: 120, height: 76, background: col, borderRadius: 8, border: "3px solid #fff", transform: `scale(${pop(t, T.deha - 0.1 + i * 0.05)})`, boxShadow: "0 6px 12px rgba(0,0,0,.3)" }} />)}
      </div>}
      <Label x={250} y={750} text="دموکرات‌ها" s={pop(t, T.dem12 - 0.05) * sideO} size={44} bg="#2a7fe0" />
      <Label x={575} y={750} text="جمهوری‌خواه‌ها" s={pop(t, T.jom12 - 0.05) * sideO} size={44} bg="#d8263a" />
      {/* the House badge the winner flies to */}
      <Label x={540} y={190} text="مجلسِ نمایندگان" s={pop(t, T.mire - 0.05) * sideO} size={50} bg="#e07a12" />
      <Num x={540} y={520} v={ramp(t, T.chahar13 - 0.1, T.chahar13 + 0.9, LIN) * 435} s={pop(t, T.chahar13 - 0.15)} size={200} />
    </AbsoluteFill>
  );
};

/* ===================== MAP 3: fifty states × two senators ===================== */
const STATE_KEYS = Object.keys(GEO.states).sort((a, b) => GEO.cent[b][0] - GEO.cent[a][0]);
const Map3: React.FC<{ t: number }> = ({ t }) => {
  const c: Cam = { lon: -96, lat: 38.3, span: lerp(56, 52, ramp(t, S_MAP3, S_BLUE3, LIN)) };
  const fly = ramp(t, T.miran - 0.2, T.miran + 0.6, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <MapCanvas cam={c} o={{ L0: 1, US: 1, STATES: 0.85 }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {STATE_KEYS.map((k, i) => {
          const o = ramp(t, T.panjah - 0.2 + i * 0.025, T.panjah + 0.1 + i * 0.025);
          return o > 0.01 ? <path key={k} d={polys(c, GEO.states[k])} fill={`rgba(255,255,255,${0.32 * o})`} stroke={`rgba(255,255,255,${0.9 * o})`} strokeWidth={2} /> : null;
        })}
      </svg>
      {STATE_KEYS.map((k, i) => {
        const q = scr(c, GEO.cent[k][0], GEO.cent[k][1]);
        const s = pop(t, T.do17 - 0.1 + (i % 10) * 0.03);
        if (s <= 0.01) return null;
        const x = lerp(q.x, 540, fly), y = lerp(q.y, 120, fly);
        return <div key={k} style={{ position: "absolute", left: x - 16, top: y - 22, display: "flex", gap: 2, transform: `scale(${s * lerp(1, 0.6, fly)})`, opacity: 1 - ramp(t, T.miran + 0.4, T.miran + 0.6) }}><Person size={30} c="#ffd21f" /><Person size={30} c="#ffd21f" /></div>;
      })}
      <Num x={540} y={330} v={50} s={pop(t, T.panjah - 0.1) * (1 - ramp(t, T.do17 - 0.2, T.do17))} size={170} color="#fff" />
      <Label x={540} y={480} text="ایالت" s={pop(t, T.panjah) * (1 - ramp(t, T.do17 - 0.2, T.do17))} size={52} />
      <Label x={540} y={360} text="۲ سناتور از هر ایالت" s={pop(t, T.do17 + 0.1) * (1 - ramp(t, T.miran, T.miran + 0.3))} size={50} bg="#e07a12" />
    </AbsoluteFill>
  );
};

/* ===================== captions ===================== */
const MERGE: [string[], string][] = [
  [["چهارصد", "و", "سی", "و", "پنج"], "۴۳۵"], [["بیست", "و", "شش"], "۲۶"], [["صد", "عضو."], "۱۰۰ عضو."], [["صد", "تا"], "۱۰۰ تا"], [["پنجاه"], "۵۰"],
];
const capWords: Word[] = (() => {
  const out: Word[] = [];
  const norm = (s: string) => s.replace(/[ً-ْ.,،؛؟:]/g, "");
  for (let i = 0; i < words.length; i++) {
    const m = MERGE.find(([seq]) => seq.every((s, j) => words[i + j] && norm(words[i + j].w) === norm(s)));
    if (m) { const n = m[0].length; out.push({ ...words[i], w: m[1] + (/[.،؛:]$/.test(words[i + n - 1].w) ? words[i + n - 1].w.slice(-1) : ""), e: words[i + n - 1].e }); i += n - 1; continue; }
    out.push(words[i]);
  }
  return out;
})();
const groups: Word[][] = (() => {
  const gs: Word[][] = [];
  let g: Word[] = [];
  capWords.forEach((w, i) => {
    g.push(w);
    const nx = capWords[i + 1];
    const len = g.reduce((a, x) => a + x.w.length, 0);
    if (g.length >= 3 || len > 16 || /[.،؛؟!:]$/.test(w.w) || (nx ? nx.s - w.e : 9) > 0.3 || (nx && nx.line !== w.line)) { gs.push(g); g = []; }
  });
  if (g.length) gs.push(g);
  return gs;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = groups.findIndex((g, j) => t >= g[0].s - 0.06 && t < (groups[j + 1] ? groups[j + 1][0].s - 0.06 : g[g.length - 1].e + 0.8));
  if (i < 0) return null;
  const g = groups[i];
  const k = clamp((t - g[0].s + 0.06) / 0.12);
  return (
    <div dir="rtl" style={{
      position: "absolute", left: 50, right: 50, top: 1400, textAlign: "center", fontFamily: "V35Black", fontSize: 68, lineHeight: 1.3, color: "#fff",
      opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${0.94 + 0.06 * k})`,
      textShadow: "0 4px 14px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.45)",
    }}>{g.map((w) => w.w.replace(/[ً-ْ«»]/g, "").replace(/[.،؛:]$/, "")).join(" ")}</div>
  );
};

/* ===================== frame ===================== */
const Frame: React.FC<{ t: number }> = ({ t }) => {
  let scene: React.ReactNode;
  if (t < S_BLUE1) scene = <Map1 t={t} />;
  else if (t < S_SPLIT) scene = <Blueprint t={t} />;
  else if (t < S_NY) scene = <Split t={t} />;
  else if (t < S_WY) scene = <NYFull t={t} />;
  else if (t < S_MAP2) scene = <WYFull t={t} />;
  else if (t < S_BLUE2) scene = <Map2 t={t} />;
  else if (t < S_MAP3) scene = <Blueprint t={t} />;
  else if (t < S_BLUE3) scene = <Map3 t={t} />;
  else scene = <Blueprint t={t} />;
  // white whip flash on every scene change
  const cuts = [S_BLUE1, S_SPLIT, S_NY, S_WY, S_MAP2, S_BLUE2, S_MAP3, S_BLUE3];
  const fl = Math.max(0, ...cuts.map((c) => (t >= c && t < c + 0.18 ? 1 - (t - c) / 0.18 : 0)));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scene}
      {fl > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.55 * fl})` }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,.32) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 66%, rgba(0,0,0,.26) 78%, rgba(0,0,0,0) 92%)" }} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};
const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  return (<><Frame t={f / FPS} />{audio && <Html5Audio src={staticFile(audio)} />}</>);
};
export const LOOK = [
  0.8, T.ray + 0.6, T.farm + 0.5, T.film + 0.4, T.har2 + 0.4, T.sena3 + 0.6, T.kakh + 0.5, T.vash + 0.6, T.rais4 + 0.7, T.capitol + 0.4, T.kong5 + 0.3,
  T.majles6 + 0.4, T.sad6 + 0.6, T.hame7 + 0.8, T.aza + 0.3, T.wy8 + 0.4, T.jam9 + 0.4, T.hoze9 + 0.8, T.bist10 + 0.6, T.yeki10 + 0.4,
  T.mardom11 + 0.6, T.hezb11 + 0.2, T.deha + 0.4, T.jom12 + 0.4, T.mire + 0.4, T.chahar13 + 0.8, T.har14 + 0.4, T.faghat15 + 0.5, T.majles16 + 0.4,
  T.sena16 + 0.4, T.panjah + 0.6, T.do17 + 0.5, T.sad18 + 0.4, T.shesh + 0.3, T.yeksom + 0.5, T.majles20 + 0.4, T.emza + 0.5, T.rais21 + 0.4, T.rais22 + 0.5, T.dem23 + 0.4, T.tavazon + 1.2,
];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;
export const V35: React.FC = () => (
  <>
    <Composition id="V35" component={Video} durationInFrames={V35_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v35/mix.wav" }} />
    <Composition id="V35-Silent" component={Video} durationInFrames={V35_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V35-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
export const _unused = cut;
