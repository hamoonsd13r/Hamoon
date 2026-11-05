// V34 · شکافِ داریِن — vertical satellite-map explainer (after the @geoglobe_tales reel «The Darien Gap»)
// Maps: NASA GIBS Blue Marble shaded relief (public domain) · close-ups: Sentinel-2 cloudless 2020 by EOX (CC BY 4.0,
// contains modified Copernicus Sentinel data 2020) · shapes: Natural Earth (public domain)
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Composition, Easing, Html5Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ARROW, BAD, GAP_C, GEO, MIG_GAP, MIG_IN, MIG_OUT, ROAD_N, ROAD_S, TURBO, WALK, YAVIZA } from "./data";
import {
  Cam, FA, FPS, H, Key, P, TOTAL, W, Word, along, camAt, clamp, cut, d, lerp, nz, plen, pop, ramp, rectOf, scr, smooth, toScr, win, wd, words,
} from "./map";

const fontHandle = typeof document !== "undefined" ? delayRender("v34 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V34Black", "fonts/Vazirmatn-Black.ttf"], ["V34Bold", "fonts/Vazirmatn-Bold.ttf"], ["V34Hero", "fonts/Lalezar-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}
const EMOJI = "'Noto Color Emoji'";
export const V34_FRAMES = Math.ceil(TOTAL * FPS);

/* ===================== cues (all from the narration's word times) ===================== */
const T = {
  shomali: wd(1, "شمالی"), jonubi: wd(1, "جنوبی"), jade: wd(1, "جاده"), gheyr: wd(1, "غیرممکنه"),
  hame: wd(2, "همه‌ش"), tike: wd(2, "تیکه"), shekaf: wd(2, "شکاف"), darien: wd(2, "داری"), khatar: wd(2, "خطرناک"),
  ke: wd(2, "که"), tul: wd(2, "طولانی"), nesfe: wd(2, "نصفه"),
  va: wd(4, "و"), jun: wd(4, "جونت"), vali: wd(5, "ولی"),
  majara: wd(6, "ماجرا"), sad: wd(6, "صد"), km: wd(6, "کیلومتر"), jangal: wd(6, "جنگل"), batlagh: wd(6, "باتلاق"), kuh: wd(6, "کوه"),
  dorost: wd(6, "درست"), marz: wd(6, "مرز"), panama: wd(6, "پاناما"), colombia: wd(6, "کلمبیا"),
  zamin7: wd(7, "زمین"), hava: wd(7, "هوای"), baroon: wd(7, "بارون"), sakhtan: wd(7, "ساختن"), gheyr7: wd(7, "غیرممکن"), geroon: wd(7, "گرون"),
  vase: wd(8, "واسه"), pan: wd(8, "پان"), shekast: wd(8, "شکست"),
  shekaf9: wd(9, "شکاف"), mohajer: wd(9, "مهاجر"), omid: wd(9, "امید"), jangalha: wd(9, "جنگل"),
  nemi: wd(10, "نمی"), khatarsh: wd(11, "خطرش"), zamin11: wd(11, "زمین"), heyvun: wd(11, "حیوون"),
  nabud: wd(12, "نبود"), inja: wd(12, "اینجا"), khalaf: wd(12, "خلافکار"), ghachagh: wd(12, "قاچاقچی"), goruh: wd(12, "گروه"),
  ke13: wd(13, "که"), adam: wd(13, "آدم"), bala: wd(13, "بالا"),
};
const PAPER0 = T.sakhtan - 0.05, PAPER1 = T.shekaf9 - 0.05, END0 = T.ke13 - 0.05;

/* ===================== camera ===================== */
const FAST = Easing.bezier(0.72, 0, 0.18, 1);
const WHIP = Easing.bezier(0.8, 0, 0.2, 1);
const KEYS: Key[] = [
  { t: 0, lon: -117, lat: 52, span: 66 },
  { t: 1.45, lon: -111, lat: 47, span: 60 },
  { t: 2.9, lon: -88, lat: 10, span: 100 },
  { t: T.hame - 0.05, lon: -85, lat: 8.5, span: 93, ease: Easing.linear },
  { t: T.hame + 0.85, lon: -77.55, lat: 8.05, span: 5.4, ease: FAST },
  { t: T.ke, lon: -77.5, lat: 8.0, span: 4.4, ease: Easing.linear },
  { t: T.ke + 0.95, lon: -93, lat: 14, span: 92, rot: -6, ease: FAST },
  { t: T.va - 0.05, lon: -90, lat: 12, span: 85, rot: -7, ease: Easing.linear },
  { t: T.va + 1.0, lon: -78.4, lat: 8.3, span: 15, rot: 0, ease: FAST },
  { t: T.majara - 0.1, lon: -77.9, lat: 8.1, span: 10.5, ease: Easing.linear },
  { t: T.majara + 0.7, lon: -77.65, lat: 8.0, span: 3.9, ease: FAST },
  { t: T.jangal - 0.1, lon: -77.62, lat: 8.0, span: 3.5, ease: Easing.linear },
  { t: T.jangal + 0.8, lon: -77.725, lat: 7.675, span: 0.135, ease: FAST },
  { t: T.batlagh - 0.2, lon: -77.72, lat: 7.68, span: 0.115, ease: Easing.linear },
  { t: T.batlagh + 0.18, lon: -77.075, lat: 7.975, span: 0.135, ease: WHIP },
  { t: T.kuh - 0.12, lon: -77.08, lat: 7.97, span: 0.125, ease: Easing.linear },
  { t: T.kuh + 0.18, lon: -77.325, lat: 8.175, span: 0.135, ease: WHIP },
  { t: T.dorost - 0.05, lon: -77.33, lat: 8.17, span: 0.118, ease: Easing.linear },
  { t: T.dorost + 0.8, lon: -77.75, lat: 8.1, span: 8.5, ease: FAST },
  { t: T.zamin7 - 0.1, lon: -77.7, lat: 8.05, span: 7.6, ease: Easing.linear },
  { t: T.zamin7 + 0.7, lon: -77.6, lat: 8.0, span: 4.2, ease: FAST },
  { t: PAPER0, lon: -77.55, lat: 8.0, span: 3.3, ease: Easing.linear },
  { t: PAPER1, lon: -77.0, lat: 6.0, span: 36 },
  { t: T.mohajer - 0.2, lon: -78.0, lat: 5.5, span: 40, ease: Easing.linear },
  { t: T.jangalha - 0.1, lon: -80.0, lat: 8.5, span: 42, ease: Easing.linear },
  { t: T.jangalha + 0.85, lon: -77.58, lat: 8.0, span: 3.4, ease: FAST },
  { t: T.khatarsh - 0.1, lon: -77.56, lat: 7.98, span: 3.05, ease: Easing.linear },
  { t: T.nabud - 0.1, lon: -77.56, lat: 7.98, span: 2.85, ease: Easing.linear },
  { t: END0 - 0.02, lon: -77.58, lat: 7.98, span: 2.5, ease: Easing.linear },
  { t: END0, lon: -77.33, lat: 8.17, span: 0.14 },
  { t: TOTAL, lon: -77.325, lat: 8.172, span: 0.1, ease: Easing.linear },
];
// paper map camera (its own world, tilted in 3D)
const PKEYS: Key[] = [
  { t: PAPER0, lon: -77.45, lat: 8.0, span: 3.9 },
  { t: T.vase, lon: -77.55, lat: 8.08, span: 3.3, ease: Easing.linear },
  { t: T.shekast - 0.35, lon: -77.55, lat: 8.0, span: 2.9, ease: Easing.linear },
  { t: PAPER1, lon: -77.55, lat: 7.98, span: 2.75, ease: Easing.linear },
];

const camFull = (t: number): Cam => {
  const c = camAt(KEYS, t);
  // never frozen: hand-held drift scaled to the view
  const amp = c.span * 0.0016;
  return { ...c, lon: c.lon + nz("cx", t * 0.12) * amp, lat: c.lat + nz("cy", t * 0.12) * amp };
};
const blurOf = (t: number) => {
  const a = camFull(t - 1 / FPS), b = camFull(t);
  const p = scr(b, a.lon, a.lat);
  const v = Math.hypot(p.x - W / 2, p.y - H / 2) + Math.abs(Math.log(a.span / b.span)) * 900;
  return clamp((v - 14) / 10, 0, 9);
};

/* ===================== small pieces ===================== */
type Pt = { x: number; y: number };
const Glow: React.FC<{ p: string; c: string; w: number; o?: number; dash?: string; core?: string }> = ({ p, c, w, o = 1, dash, core }) =>
  o <= 0.001 ? null : (
    <g opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={p} stroke={c} strokeWidth={w * 4.2} opacity={0.12} />
      <path d={p} stroke={c} strokeWidth={w * 2.2} opacity={0.28} />
      <path d={p} stroke="rgba(0,0,0,.45)" strokeWidth={w + 4} strokeDasharray={dash} />
      <path d={p} stroke={core ?? c} strokeWidth={w} strokeDasharray={dash} />
    </g>
  );

const Skull: React.FC<{ size: number; glow?: string; fill?: string }> = ({ size, glow = "#ff2846", fill = "#ffe8ea" }) => (
  <svg width={size} height={size * 1.05} viewBox="0 0 200 210" style={{ overflow: "visible", filter: `drop-shadow(0 0 ${size * 0.06}px ${glow}) drop-shadow(0 0 ${size * 0.16}px ${glow})` }}>
    <g fill={fill}>
      {[40, -40].map((a) => (
        <g key={a} transform={`rotate(${a} 100 120)`}>
          <rect x={20} y={110} width={160} height={20} rx={10} />
          <circle cx={18} cy={106} r={13} /><circle cx={18} cy={134} r={13} /><circle cx={182} cy={106} r={13} /><circle cx={182} cy={134} r={13} />
        </g>
      ))}
      <circle cx={100} cy={78} r={58} />
      <rect x={64} y={96} width={72} height={52} rx={14} />
    </g>
    <g fill="#5a0612">
      <ellipse cx={77} cy={86} rx={17} ry={19} /><ellipse cx={123} cy={86} rx={17} ry={19} />
      <path d="M100 104 L92 120 L108 120 Z" />
      {[80, 93, 107, 120].map((x) => <rect key={x} x={x - 2.5} y={130} width={5} height={16} rx={2} />)}
    </g>
  </svg>
);

const Badge: React.FC<{ x: number; y: number; s: number; e: string; size?: number; ban?: boolean }> = ({ x, y, s, e, size = 150, ban }) =>
  s <= 0.001 ? null : (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#fff", border: `${size * 0.07}px solid #e8172e`, boxShadow: "0 0 24px rgba(255,30,50,.75), 0 8px 18px rgba(0,0,0,.45)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EMOJI, fontSize: size * 0.55 }}>{e}</div>
      {ban && <div style={{ position: "absolute", left: size * 0.08, right: size * 0.08, top: size / 2 - size * 0.045, height: size * 0.09, background: "#e8172e", transform: "rotate(-45deg)", borderRadius: 4 }} />}
    </div>
  );

const MapLabel: React.FC<{ x: number; y: number; text: string; s: number; color?: string; glow?: string; size?: number; rot?: number }> = ({
  x, y, text, s, color = "#fff", glow = "rgba(0,0,0,.8)", size = 64, rot = 0,
}) =>
  s <= 0.001 ? null : (
    <div dir="rtl" style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, whiteSpace: "nowrap",
      fontFamily: "V34Black", fontSize: size, color, opacity: clamp(s * 1.5),
      textShadow: `0 0 10px ${glow}, 0 0 26px ${glow}, 0 4px 10px rgba(0,0,0,.7)`,
    }}>{text}</div>
  );

const Pulse: React.FC<{ x: number; y: number; t: number; o: number; r?: number; c?: string }> = ({ x, y, t, o, r = 22, c = "255,40,60" }) => {
  if (o <= 0.001) return null;
  const k = (t * 1.3) % 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div style={{ position: "absolute", left: -r * (1 + 2.2 * k), top: -r * (1 + 2.2 * k), width: 2 * r * (1 + 2.2 * k), height: 2 * r * (1 + 2.2 * k), borderRadius: "50%", border: `5px solid rgba(${c},${0.9 * (1 - k)})` }} />
      <div style={{ position: "absolute", left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `rgb(${c})`, boxShadow: `0 0 20px rgb(${c}), 0 0 50px rgba(${c},.8)`, border: "4px solid #fff" }} />
    </div>
  );
};

/* ===================== satellite world ===================== */
const LAYERS = {
  L0: { f: "v34/L0.jpg", b: [-172, -25, -58, 74] },
  L1: { f: "v34/L1.jpg", b: [-84, -70, 1, 13.5] },
  big: { f: "v34/F_big.jpg", b: [-78.2, -76.6, 7.0, 8.9] },
  forest: { f: "v34/F_forest.jpg", b: [-77.85, -77.6, 7.55, 7.8] },
  swamp: { f: "v34/F_swamp.jpg", b: [-77.2, -76.95, 7.85, 8.1] },
  mount: { f: "v34/F_mount.jpg", b: [-77.45, -77.2, 8.05, 8.3] },
} as const;
// all map imagery is drawn on ONE canvas, cropped to what is on screen (huge <img> layers were only half rasterised)
type Src = HTMLImageElement | HTMLCanvasElement;
const IMGS: Partial<Record<keyof typeof LAYERS, Src>> = {};
let loading: Promise<void> | null = null;
const feather = (im: HTMLImageElement) => {
  const c = document.createElement("canvas");
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext("2d")!;
  g.drawImage(im, 0, 0);
  g.globalCompositeOperation = "destination-in";
  const fx = g.createLinearGradient(0, 0, c.width, 0);
  fx.addColorStop(0, "rgba(0,0,0,0)"); fx.addColorStop(0.08, "#000"); fx.addColorStop(0.92, "#000"); fx.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fx; g.fillRect(0, 0, c.width, c.height);
  const fy = g.createLinearGradient(0, 0, 0, c.height);
  fy.addColorStop(0, "rgba(0,0,0,0)"); fy.addColorStop(0.05, "#000"); fy.addColorStop(0.95, "#000"); fy.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fy; g.fillRect(0, 0, c.width, c.height);
  return c;
};
const loadAll = () => (loading ??= Promise.all((Object.keys(LAYERS) as (keyof typeof LAYERS)[]).map((k) => new Promise<void>((res, rej) => {
  const im = new Image();
  im.onload = () => { IMGS[k] = k.startsWith("L") ? im : feather(im); res(); };
  im.onerror = () => rej(new Error("image " + k));
  im.src = staticFile(LAYERS[k].f);
}))).then(() => undefined));
const drawLayer = (g: CanvasRenderingContext2D, cam: Cam, k: keyof typeof LAYERS, o: number) => {
  const im = IMGS[k];
  if (!im || o <= 0.001) return;
  const L = LAYERS[k];
  const r = rectOf(cam, L.b[0], L.b[1], L.b[2], L.b[3]);
  const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top), x1 = Math.min(W, r.left + r.width), y1 = Math.min(H, r.top + r.height);
  if (x1 <= x0 || y1 <= y0) return;
  const iw = im instanceof HTMLImageElement ? im.naturalWidth : im.width, ih = im instanceof HTMLImageElement ? im.naturalHeight : im.height;
  const sx = ((x0 - r.left) / r.width) * iw, sy = ((y0 - r.top) / r.height) * ih;
  const sw = ((x1 - x0) / r.width) * iw, sh = ((y1 - y0) / r.height) * ih;
  g.globalAlpha = o;
  g.drawImage(im, sx, sy, Math.max(0.5, sw), Math.max(0.5, sh), x0, y0, x1 - x0, y1 - y0);
  g.globalAlpha = 1;
};
const MapCanvas: React.FC<{ cam: Cam; o: Partial<Record<keyof typeof LAYERS, number>> }> = ({ cam, o }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("v34 map images"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadAll().then(() => { setReady(true); continueRender(handle); }).catch((e) => { console.error(e); });
  }, [handle]);
  const key = JSON.stringify([cam, o]);
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c || !ready) return;
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    g.fillStyle = "#0b1d26"; g.fillRect(0, 0, W, H);
    (Object.keys(LAYERS) as (keyof typeof LAYERS)[]).forEach((k) => drawLayer(g, cam, k, o[k] ?? 0));
  }, [ready, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />;
};

const polys = (cam: Cam, rings: P[][]) => rings.map((r) => d(toScr(cam, r), true)).join(" ");

const Satellite: React.FC<{ t: number }> = ({ t }) => {
  const cam = camFull(t);
  const s = cam.span;
  const blur = blurOf(t);
  const S = (p: P) => scr(cam, p[0], p[1]);

  // ---- layer visibility by zoom ----
  const oL1 = clamp((40 - s) / 14);
  const oBig = clamp((1.3 - s) / 0.4); // Sentinel-2 over the whole region: L1 → big (same scene, wider) → sharp close-ups
  const oPatch = clamp((0.42 - s) / 0.15);

  // ---- overlays: timing ----
  const naO = ramp(t, T.shomali - 0.1, T.shomali + 0.35) * (1 - ramp(t, T.hame, T.hame + 0.35));
  const introRoad = t < T.ke;
  const kN = introRoad ? ramp(t, 0.1, 2.85, Easing.inOut(Easing.quad)) : 1;
  const kS = introRoad ? ramp(t, T.jonubi, T.gheyr + 0.2, Easing.inOut(Easing.quad)) : 1;
  const roadO = (introRoad ? 1 - ramp(t, T.hame + 0.2, T.hame + 0.6) : 1) * (t < PAPER1 ? 1 : 0) * (1 - ramp(t, T.majara - 0.3, T.majara + 0.2));
  const xS = pop(t, T.jade + 0.08) * (1 - ramp(t, T.hame, T.hame + 0.3));
  const xShake = win(t, T.gheyr, T.gheyr + 0.45, 0.05, 0.2) * Math.sin(t * 70) * 10;

  // gap region: green / red
  const gapGreen =
    ramp(t, T.tike - 0.1, T.tike + 0.4) * (1 - ramp(t, T.ke + 0.1, T.ke + 0.5)) +
    win(t, T.majara - 0.1, T.jangal + 0.25, 0.4, 0.3) +
    win(t, T.dorost + 0.3, PAPER0 + 0.1, 0.4, 0.05) +
    ramp(t, PAPER1, PAPER1 + 0.4) * (t < END0 ? 1 : 0);
  const red = ramp(t, T.khatar - 0.05, T.khatar + 0.3);
  const redK = red * (1 - ramp(t, T.ke + 0.1, T.ke + 0.5));
  const gapO = clamp(gapGreen + redK);
  const glowPulse = 0.75 + 0.25 * Math.sin(t * 5);
  const gapCol = redK > 0.01 ? `rgb(${Math.round(lerp(60, 255, redK))},${Math.round(lerp(235, 30, redK))},${Math.round(lerp(80, 60, redK))})` : "rgb(60,235,80)";
  const gapFill = redK > 0.01 ? `rgba(${Math.round(lerp(40, 225, redK))},${Math.round(lerp(200, 10, redK))},${Math.round(lerp(50, 40, redK))},${lerp(0.5, 0.62, redK)})` : "rgba(40,200,50,.5)";
  const gapD = polys(cam, GEO.gap);

  // borders
  const borderK = ramp(t, T.marz - 0.1, T.marz + 0.6);
  const borderO = win(t, T.marz - 0.1, PAPER0, 0.2, 0.2) + win(t, PAPER1, END0, 0.3, 0.2) * 0.55;
  const tintO = win(t, T.panama - 0.15, T.zamin7 + 0.5, 0.3, 0.4);

  // red danger dot over the gap when zoomed out
  const dangerO = win(t, T.ke + 0.4, T.majara - 0.1, 0.3, 0.3);
  const nesfeFlash = win(t, T.nesfe - 0.05, T.nesfe + 0.6, 0.05, 0.4);

  // migrants
  const migIn = MIG_IN.map((r, i) => ramp(t, T.mohajer - 0.1 + i * 0.22, T.mohajer + 1.6 + i * 0.22, Easing.inOut(Easing.quad)));
  const migGap = ramp(t, T.omid - 0.3, T.omid + 0.9);
  const migOut = ramp(t, T.omid + 0.5, T.jangalha);
  const migO = win(t, T.mohajer - 0.2, T.jangalha + 0.7, 0.2, 0.5);

  const labelGap1 = pop(t, T.darien - 0.05) * (1 - ramp(t, T.khatar - 0.1, T.khatar + 0.15));
  const labelGap2 = pop(t, PAPER1 + 0.15) * (1 - ramp(t, T.mohajer + 0.6, T.mohajer + 1.0));
  const skullS = pop(t, T.khatar + 0.05, 0.45) * (1 - ramp(t, T.ke + 0.05, T.ke + 0.3));
  const skull2 = pop(t, T.jun - 0.05) * (1 - ramp(t, T.majara - 0.25, T.majara + 0.05));
  const panLabel = pop(t, T.tul - 0.05) * (1 - ramp(t, T.va + 0.1, T.va + 0.4));
  const arrowK = ramp(t, T.sad - 0.15, T.sad + 0.5);
  const arrowO = win(t, T.sad - 0.15, T.jangal + 0.15, 0.1, 0.25);
  const kmS = pop(t, T.km - 0.2) * (1 - ramp(t, T.jangal - 0.05, T.jangal + 0.15));
  const paS = pop(t, T.panama - 0.05) * (1 - ramp(t, T.zamin7, T.zamin7 + 0.3));
  const coS = pop(t, T.colombia - 0.05) * (1 - ramp(t, T.zamin7, T.zamin7 + 0.3));

  const pr = (p: P) => S(p);
  const roadNs = cut(toScr(cam, ROAD_N), kN), roadSs = cut(toScr(cam, ROAD_S), kS);
  const dashed = introRoad ? "26 18" : undefined;
  const roadW = introRoad ? 8 : 9;

  // arrow
  const a0 = pr(ARROW[0]), a1 = pr(ARROW[1]);
  const ak = { x: lerp(a0.x, a1.x, arrowK), y: lerp(a0.y, a1.y, arrowK) };
  const ang = Math.atan2(a1.y - a0.y, a1.x - a0.x);
  const head = (p: Pt, a: number) => `M${p.x + Math.cos(a + 2.6) * 34},${p.y + Math.sin(a + 2.6) * 34}L${p.x},${p.y}L${p.x + Math.cos(a - 2.6) * 34},${p.y + Math.sin(a - 2.6) * 34}`;

  // migrant dots inside the region
  const dotsO = win(t, T.jangalha + 0.45, T.khatarsh + 0.5, 0.3, 0.35);
  const N_DOTS = 16;
  const dots = Array.from({ length: N_DOTS }, (_, i) => {
    const start = T.jangalha + 0.35 + ((i * 7) % 16) * 0.19;
    const die = [2, 6, 9, 13, 15].includes(i);
    const dieT = T.nemi - 0.05 + (i % 3) * 0.12;
    const tt = die ? Math.min(t, dieT) : t;
    const k = clamp((tt - start) / 5.2) * 0.98;
    const { p } = along(WALK, k);
    const off = [nz("mx" + i, 0.3 + t * 0.05) * 0.11, nz("my" + i, 0.3 + t * 0.05) * 0.11] as const;
    const q = pr([p[0] + off[0], p[1] + off[1]]);
    const dead = die ? ramp(t, dieT, dieT + 0.25) : 0;
    return { q, o: t >= start ? 1 : 0, dead, die, dieT };
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0b1d26" }}>
      <AbsoluteFill style={{ transform: `rotate(${cam.rot ?? 0}deg) scale(${1 + Math.abs(cam.rot ?? 0) * 0.012})`, filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <MapCanvas cam={cam} o={{ L0: s > 5.5 ? 1 : 0, L1: oL1, big: oBig, forest: oPatch, swamp: oPatch, mount: oPatch }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* North America fill (intro) */}
          {naO > 0.01 && <path d={polys(cam, GEO.na)} fill="rgba(120,215,255,.55)" stroke="rgba(230,250,255,.95)" strokeWidth={3} opacity={naO} />}
          {/* country tints + border */}
          {tintO > 0.01 && <g opacity={tintO}>
            <path d={polys(cam, GEO.pa)} fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.55)" strokeWidth={2.5} />
            <path d={polys(cam, GEO.co)} fill="rgba(255,190,90,.16)" stroke="rgba(255,230,190,.5)" strokeWidth={2.5} />
          </g>}
          {/* the gap */}
          {gapO > 0.01 && redK <= 0.01 && <g opacity={gapO}>
            <path d={gapD} fill={gapFill} />
            <path d={gapD} fill="none" stroke={gapCol} strokeWidth={26} opacity={0.18 * glowPulse} strokeLinejoin="round" />
            <path d={gapD} fill="none" stroke={gapCol} strokeWidth={11} opacity={0.4 * glowPulse} strokeLinejoin="round" />
            <path d={gapD} fill="none" stroke="rgba(235,255,230,.95)" strokeWidth={3} strokeLinejoin="round" />
          </g>}
          {/* green → red as a crossfade (a colour lerp went through brown) */}
          {gapO > 0.01 && redK > 0.01 && [["rgba(40,200,50,.5)", "rgb(60,235,80)", clamp(gapGreen) * (1 - redK)], ["rgba(225,10,40,.62)", "rgb(255,30,60)", redK]].map(([fill, col, o], i) => (o as number) > 0.005 ? (
            <g key={i} opacity={(o as number) * gapO}>
              <path d={gapD} fill={fill as string} />
              <path d={gapD} fill="none" stroke={col as string} strokeWidth={26} opacity={0.18 * glowPulse} strokeLinejoin="round" />
              <path d={gapD} fill="none" stroke={col as string} strokeWidth={11} opacity={0.4 * glowPulse} strokeLinejoin="round" />
              <path d={gapD} fill="none" stroke="rgba(235,255,230,.95)" strokeWidth={3} strokeLinejoin="round" />
            </g>) : null)}
          {borderO > 0.01 && GEO.border.map((b, i) => <Glow key={i} p={d(cut(toScr(cam, b), borderK))} c="#ffffff" w={5} o={clamp(borderO)} dash="16 10" />)}
          {/* Pan-American Highway */}
          {roadO > 0.01 && <>
            <Glow p={d(roadNs)} c="#ffd400" w={roadW} o={roadO} dash={dashed} core="#ffe23d" />
            {kS > 0.001 && <Glow p={d(roadSs)} c="#ffd400" w={roadW} o={roadO} dash={dashed} core="#ffe23d" />}
          </>}
          {/* migrant routes */}
          {migO > 0.01 && <g opacity={migO}>
            {MIG_IN.map((r, i) => <Glow key={i} p={d(cut(toScr(cam, r), migIn[i]))} c="#ffffff" w={4.5} o={0.95} />)}
            <Glow p={d(cut(toScr(cam, MIG_GAP), migGap))} c="#ffffff" w={5.5} />
            <Glow p={d(cut(toScr(cam, MIG_OUT), migOut))} c="#ffffff" w={4.5} o={0.95} />
          </g>}
          {/* 160 km arrow */}
          {arrowO > 0.01 && <g opacity={arrowO} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 3px 6px rgba(0,0,0,.6))" }}>
            <path d={`M${a0.x},${a0.y}L${ak.x},${ak.y}`} />
            <path d={head(a0, ang + Math.PI)} />
            {arrowK > 0.98 && <path d={head(a1, ang)} />}
          </g>}
        </svg>

        {/* map-space HTML pieces */}
        {xS > 0.01 && (() => { const p = pr(GAP_C); return (
          <div style={{ position: "absolute", left: p.x - 70 + xShake, top: p.y - 70, width: 140, height: 140, transform: `scale(${xS})` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,40,60,.75), rgba(255,40,60,0) 70%)" }} />
            {[45, -45].map((a) => <div key={a} style={{ position: "absolute", left: 10, right: 10, top: 58, height: 24, background: "#ff2d44", border: "5px solid #fff", borderRadius: 8, transform: `rotate(${a}deg)`, boxShadow: "0 0 18px rgba(255,40,60,.9)" }} />)}
          </div>); })()}
        {skullS > 0.01 && (() => { const p = pr(GAP_C); return (
          <div style={{ position: "absolute", left: p.x - 190, top: p.y - 220, transform: `scale(${skullS})` }}><Skull size={380} /></div>); })()}
        {skull2 > 0.01 && (() => { const p = pr(GAP_C); return (
          <div style={{ position: "absolute", left: p.x - 60, top: p.y - 70, transform: `scale(${skull2})` }}><Skull size={120} /></div>); })()}
        <Pulse x={pr(GAP_C).x} y={pr(GAP_C).y} t={t} o={dangerO * (1 - skull2)} r={16 + 14 * nesfeFlash} />
        <MapLabel x={pr(GAP_C).x} y={pr(GAP_C).y - 30} text="شکافِ داریِن" s={labelGap1} color="#d9ffc9" glow="rgba(10,90,20,.95)" size={78} />
        <MapLabel x={pr(GAP_C).x + 10} y={pr(GAP_C).y - 40} text="شکافِ داریِن" s={labelGap2} color="#d9ffc9" glow="rgba(10,90,20,.95)" size={58} />
        <MapLabel x={pr([-105, 39]).x} y={pr([-105, 39]).y} text="بزرگراهِ پان‌آمریکن" s={panLabel} color="#fff" glow="rgba(20,80,30,.95)" size={80} rot={-42} />
        <MapLabel x={lerp(a0.x, a1.x, 0.5) + Math.cos(ang - Math.PI / 2) * 64} y={lerp(a0.y, a1.y, 0.5) + Math.sin(ang - Math.PI / 2) * 64} text={`${FA(160)} کیلومتر`} s={kmS} size={66} rot={(() => { let r = (ang * 180) / Math.PI; while (r > 90) r -= 180; while (r < -90) r += 180; return r; })()} />
        <MapLabel x={pr([-79.7, 8.75]).x} y={pr([-79.7, 8.75]).y} text="پاناما" s={paS} size={66} />
        <MapLabel x={pr([-75.8, 6.6]).x} y={pr([-75.8, 6.6]).y} text="کلمبیا" s={coS} size={66} color="#ffe7c2" />

        {/* migrants walking through the jungle */}
        {dotsO > 0.01 && dots.map((m, i) => m.o ? (
          <div key={i} style={{
            position: "absolute", left: m.q.x - 17, top: m.q.y - 17, width: 34, height: 34, transform: `rotate(45deg) scale(${1 + 0.6 * win(t, m.dieT, m.dieT + 0.6, 0.08, 0.4) * (m.die ? 1 : 0)})`,
            background: m.dead > 0 ? `rgb(${lerp(80, 255, m.dead)},${lerp(190, 40, m.dead)},${lerp(255, 50, m.dead)})` : "#5cc8ff",
            border: "3px solid #fff", borderRadius: 4, opacity: dotsO * (m.die ? 1 - 0.55 * ramp(t, m.dieT + 0.6, m.dieT + 1.6) : 1),
            boxShadow: m.dead > 0 ? "0 0 18px rgba(255,40,60,.9)" : "0 0 14px rgba(90,200,255,.85)",
          }} />) : null)}

        {/* wildlife */}
        {(() => {
          const o = 1 - ramp(t, T.nabud - 0.25, T.nabud + 0.05);
          const icons: [P, string][] = [[[-77.95, 8.35], "🐍"], [[-77.25, 8.3], "🐊"], [[-77.75, 7.6], "🦟"], [[-77.3, 7.65], "🐆"]];
          return icons.map(([p, e], i) => { const q = pr(p); return <Badge key={i} x={q.x} y={q.y} e={e} s={pop(t, T.heyvun - 0.1 + i * 0.13) * o} size={170} />; });
        })()}
        {/* no government control */}
        {(() => { const q = pr([-77.55, 8.05]); return <Badge x={q.x} y={q.y} e="👮" ban s={pop(t, T.nabud + 0.02, 0.5) * (1 - ramp(t, T.khalaf - 0.35, T.khalaf - 0.05))} size={330} />; })()}
        {/* criminals, smugglers, armed gangs */}
        {BAD.map((b, i) => {
          const at = b.kind === 0 ? T.khalaf - 0.05 + i * 0.08 : b.kind === 1 ? T.ghachagh - 0.05 + (i - 4) * 0.08 : T.goruh + (i - 7) * 0.12;
          const sc = pop(t, at) * (1 - ramp(t, END0 - 0.15, END0));
          if (sc <= 0.01) return null;
          const q = pr(b.p);
          const k = ((t - at) * 1.1) % 1;
          return (
            <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: `scale(${sc})` }}>
              {b.kind === 2 && <>
                <div style={{ position: "absolute", left: -62, top: -62, width: 124, height: 124, borderRadius: "50%", border: "6px solid #ff2a3d", boxShadow: "0 0 16px rgba(255,40,60,.8)" }} />
                <div style={{ position: "absolute", left: -36, top: -36, width: 72, height: 72, borderRadius: "50%", border: "5px solid #ff2a3d" }} />
                {[0, 90, 180, 270].map((a) => <div key={a} style={{ position: "absolute", left: -4, top: -82, width: 8, height: 30, background: "#ff2a3d", transformOrigin: "4px 82px", transform: `rotate(${a}deg)` }} />)}
              </>}
              <div style={{ position: "absolute", left: -60 * k - 16, top: -60 * k - 16, width: 32 + 120 * k, height: 32 + 120 * k, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,30,50,${0.55 * (1 - k)}), rgba(255,30,50,0) 70%)` }} />
              <div style={{ position: "absolute", left: -16, top: -16, width: 32, height: 32, borderRadius: b.kind === 1 ? 4 : "50%", transform: b.kind === 1 ? "rotate(45deg)" : undefined, background: "#ff1f36", boxShadow: "0 0 14px #ff1f36, 0 0 36px rgba(255,30,50,.8)", border: "3px solid #ffd0d5" }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===================== weather: haze, rain, lightning ===================== */
const Weather: React.FC<{ t: number }> = ({ t }) => {
  const fog = win(t, T.hava - 0.1, PAPER0 + 0.1, 0.6, 0.1) * 0.75;
  const rain = win(t, T.baroon - 0.15, PAPER0 + 0.1, 0.3, 0.1);
  const bolts = [T.baroon + 0.25, T.baroon + 0.95];
  const flash = Math.max(...bolts.map((b) => (t >= b && t < b + 0.18 ? (t - b < 0.06 ? 0.55 : 0.25) : 0)));
  const bolt = bolts.findIndex((b) => t >= b && t < b + 0.12);
  return (
    <>
      {fog > 0.01 && <AbsoluteFill style={{ opacity: fog }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: "absolute", left: -300 + i * 330 + nz("fx" + i, t * 0.1) * 140 + t * 12, top: 300 + i * 340 + nz("fy" + i, t * 0.1) * 90, width: 1100, height: 600,
            background: "radial-gradient(ellipse, rgba(225,240,235,.42), rgba(225,240,235,0) 68%)",
          }} />
        ))}
      </AbsoluteFill>}
      {rain > 0.01 && <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: rain }}>
        {Array.from({ length: 90 }, (_, i) => {
          const sp = 2600 + (i % 7) * 260;
          const x0 = ((i * 137.5) % (W + 400)) - 200;
          const y = ((t * sp + i * 311) % (H + 300)) - 150;
          const x = x0 - y * 0.22;
          return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 80} stroke="rgba(210,235,255,.55)" strokeWidth={i % 3 ? 2.5 : 4} strokeLinecap="round" />;
        })}
      </svg>}
      {bolt >= 0 && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {(() => {
          const pts: string[] = [];
          let x = bolt ? 760 : 300, y = -20;
          for (let i = 0; i < 14; i++) { pts.push(`${x},${y}`); x += ((i * 53 + bolt * 31) % 9 - 4.2) * 22; y += 70 + ((i * 17) % 5) * 12; }
          const p = "M" + pts.join("L");
          return <g fill="none" strokeLinejoin="round"><path d={p} stroke="rgba(190,220,255,.4)" strokeWidth={34} /><path d={p} stroke="rgba(220,235,255,.8)" strokeWidth={14} /><path d={p} stroke="#fff" strokeWidth={5} /></g>;
        })()}
      </svg>}
      {flash > 0 && <AbsoluteFill style={{ background: `rgba(235,245,255,${flash})` }} />}
    </>
  );
};

/* ===================== the paper map ===================== */
const RED_ROAD: P[] = (() => {
  const a = YAVIZA, b: P = [-77.32, 7.72];
  const out: P[] = [];
  for (let i = 0; i <= 60; i++) {
    const k = i / 60;
    const wig = Math.sin(k * 23) * 0.05 + Math.sin(k * 9.7 + 1) * 0.035;
    const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny);
    out.push([lerp(a[0], b[0], k) + (nx / nl) * wig, lerp(a[1], b[1], k) + (ny / nl) * wig]);
  }
  return out;
})();
const PLAN: P[] = smooth([YAVIZA, [-77.45, 8.0], [-77.15, 7.95], [-76.92, 8.02], TURBO], 8);

const Paper: React.FC<{ t: number }> = ({ t }) => {
  const cam = camAt(PKEYS, t);
  const k = ramp(t, PAPER0, PAPER1);
  const rx = lerp(30, 24, k), rz = lerp(-16, -10, k);
  const redK = ramp(t, T.sakhtan + 0.1, T.gheyr7 + 0.9, Easing.inOut(Easing.quad));
  const planO = ramp(t, T.pan - 0.3, T.pan + 0.3);
  const planK = ramp(t, T.pan - 0.3, T.pan + 0.8);
  const panL = pop(t, T.pan - 0.1);
  const st = clamp((t - (T.shekast - 0.06)) / 0.2);
  const stampS = st <= 0 ? 0 : lerp(2.6, 1, Easing.in(Easing.quad)(st));
  const shake = win(t, T.shekast + 0.12, T.shekast + 0.5, 0.02, 0.3) * 14;
  const sh = { x: Math.sin(t * 83) * shake, y: Math.cos(t * 71) * shake };
  const gapD = polys(cam, GEO.gap);
  const roadS = cut(toScr(cam, RED_ROAD), redK);
  const end = roadS[roadS.length - 1];
  const money = [0, 1, 2].map((i) => ({ s: pop(t, T.geroon - 0.1 + i * 0.12), y: -ramp(t, T.geroon + i * 0.12, T.geroon + 1.6 + i * 0.12) * 120, o: 1 - ramp(t, T.vase - 0.2, T.vase + 0.2) }));
  const sea = "rgba(170,198,205,1)";
  const pl = toScr(cam, PLAN);
  const mid = pl[Math.floor(pl.length * 0.45)];
  return (
    <AbsoluteFill style={{ background: "#c9ccc6", overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1700, transform: `translate(${sh.x}px,${sh.y}px)` }}>
        <div style={{ position: "absolute", left: -400, top: -500, width: W + 800, height: H + 1000, transform: `rotateX(${rx}deg) rotateZ(${rz}deg)`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "absolute", inset: 0, background: sea }} />
          <svg width={W + 800} height={H + 1000} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(400,500)">
              <path d={polys(cam, GEO.co)} fill="#dfe4d9" stroke="#8f9a8c" strokeWidth={3} />
              <path d={polys(cam, GEO.pa)} fill="#e6e9e1" stroke="#8f9a8c" strokeWidth={3} />
              {/* grid */}
              {Array.from({ length: 14 }, (_, i) => { const lon = -81 + i * 0.5; const a = scr(cam, lon, 12), b = scr(cam, lon, 4); return <line key={"g" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(90,110,100,.18)" strokeWidth={2} />; })}
              {Array.from({ length: 14 }, (_, i) => { const lat = 4.5 + i * 0.5; const a = scr(cam, -82, lat), b = scr(cam, -73, lat); return <line key={"h" + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(90,110,100,.18)" strokeWidth={2} />; })}
              <path d={gapD} fill="rgba(120,225,120,.42)" />
              <path d={gapD} fill="none" stroke="#3fe05a" strokeWidth={16} opacity={0.35} strokeLinejoin="round" />
              <path d={gapD} fill="none" stroke="#22b83a" strokeWidth={5} strokeLinejoin="round" />
              {GEO.rivers.map((r, i) => <path key={i} d={d(toScr(cam, r.p))} fill="none" stroke="rgba(40,140,90,.85)" strokeWidth={5} strokeLinecap="round" />)}
              {GEO.border.map((b, i) => <path key={i} d={d(toScr(cam, b))} fill="none" stroke="#7d6a8a" strokeWidth={4} strokeDasharray="18 8 4 8" />)}
              {/* planned highway (never built) */}
              {planO > 0.01 && <path d={d(cut(pl, planK))} fill="none" stroke="#e0a800" strokeWidth={9} strokeDasharray="22 14" opacity={planO} strokeLinecap="round" />}
              {/* the road that tries to get through */}
              <path d={d(roadS)} fill="none" stroke="rgba(120,0,10,.35)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
              <path d={d(roadS)} fill="none" stroke="#c4101f" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
              {/* existing roads up to the gap on both sides */}
              <path d={d(toScr(cam, ROAD_N.slice(-14)))} fill="none" stroke="#c4101f" strokeWidth={12} strokeLinecap="round" />
              <path d={d(toScr(cam, ROAD_S.slice(0, 14)))} fill="none" stroke="#c4101f" strokeWidth={12} strokeLinecap="round" />
            </g>
          </svg>
          <Img src={staticFile("v34/paper.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", mixBlendMode: "multiply", opacity: 0.9 }} />
          {/* labels on the paper */}
          <div style={{ position: "absolute", left: 400, top: 500 }}>
            {[["پاناما", [-78.9, 8.9]], ["کلمبیا", [-76.2, 7.2]]].map(([n, p]) => { const q = scr(cam, (p as P)[0], (p as P)[1]); return (
              <div key={n as string} dir="rtl" style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%,-50%)", fontFamily: "V34Bold", fontSize: 58, color: "#5d6a5e", letterSpacing: 2 }}>{n as string}</div>); })}
            {panL > 0.01 && <div dir="rtl" style={{ position: "absolute", left: mid.x, top: mid.y - 70, transform: `translate(-50%,-50%) scale(${panL})`, fontFamily: "V34Black", fontSize: 54, color: "#8a5a00", whiteSpace: "nowrap", textShadow: "0 0 10px rgba(255,245,210,.9)" }}>بزرگراهِ پان‌آمریکن</div>}
            {money.map((m, i) => m.s > 0.01 && m.o > 0.01 ? <div key={i} style={{ position: "absolute", left: end.x - 40 + (i - 1) * 90, top: end.y - 120 + m.y, fontFamily: EMOJI, fontSize: 90, transform: `scale(${m.s})`, opacity: m.o }}>💸</div> : null)}
          </div>
        </div>
      </AbsoluteFill>
      {/* stamp */}
      {stampS > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: clamp(st * 3) }}>
          <div dir="rtl" style={{
            transform: `rotate(-13deg) scale(${stampS})`, padding: "6px 46px 18px", border: "14px solid rgba(206,22,36,.92)", borderRadius: 26,
            fontFamily: "V34Hero", fontSize: 170, color: "rgba(206,22,36,.92)", lineHeight: 1.2, whiteSpace: "nowrap",
            boxShadow: st >= 1 ? "0 0 0 6px rgba(206,22,36,.15)" : undefined, mixBlendMode: "multiply",
          }}>شکست خورد</div>
        </div>
      )}
      {/* white flash in and out */}
      <AbsoluteFill style={{ background: "#fff", opacity: 1 - ramp(t, PAPER0, PAPER0 + 0.35) }} />
      <AbsoluteFill style={{ background: "#fff", opacity: ramp(t, PAPER1 - 0.2, PAPER1) }} />
    </AbsoluteFill>
  );
};

/* ===================== kidnapping (last shot) ===================== */
const Kidnap: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T.adam - 0.12, 0.5);
  const danger = win(t, T.bala - 0.1, TOTAL, 0.2, 0.01);
  const beat = 1 + 0.05 * Math.max(0, Math.sin((t - T.bala) * 9)) * danger;
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,.72) 100%)" }} />
      <AbsoluteFill style={{ background: `rgba(150,0,15,${0.28 * danger * (0.6 + 0.4 * Math.sin(t * 9))})` }} />
      {s > 0.01 && (
        <div style={{ position: "absolute", left: W / 2 - 190, top: 560, width: 380, height: 380, transform: `scale(${s * beat})` }}>
          <div style={{ position: "absolute", inset: 0, fontFamily: EMOJI, fontSize: 330, lineHeight: "380px", textAlign: "center", filter: "drop-shadow(0 12px 22px rgba(0,0,0,.6))" }}>😶</div>
          <div style={{ position: "absolute", left: 80, top: 236, width: 225, height: 64, background: "linear-gradient(180deg,#d7d7d2,#b5b5ae)", transform: "rotate(-9deg)", borderRadius: 4,
            clipPath: "polygon(0 6%, 4% 0, 8% 10%, 12% 0, 88% 0, 92% 12%, 96% 0, 100% 8%, 100% 92%, 96% 100%, 92% 88%, 88% 100%, 12% 100%, 8% 90%, 4% 100%, 0 94%)",
            boxShadow: "0 4px 10px rgba(0,0,0,.35)" }} />
          <div style={{ position: "absolute", left: 115, top: 236, width: 150, height: 64, transform: "rotate(-9deg)", background: "repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 6px, rgba(0,0,0,0) 6px 14px)" }} />
        </div>
      )}
    </>
  );
};

/* ===================== captions ===================== */
// show numbers as digits on screen (TTS reads them as words)
const capWords: Word[] = (() => {
  const out: Word[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.w === "صد" && words[i + 1]?.w === "و" && words[i + 2]?.w === "شصت") {
      out.push({ ...w, w: "۱۶۰", e: words[i + 2].e });
      i += 2;
      continue;
    }
    out.push(w);
  }
  return out;
})();
const groups: Word[][] = (() => {
  const gs: Word[][] = [];
  let g: Word[] = [];
  capWords.forEach((w, i) => {
    g.push(w);
    const nx = capWords[i + 1];
    const gap = nx ? nx.s - w.e : 9;
    const len = g.reduce((a, x) => a + x.w.length, 0);
    if (g.length >= 3 || len > 16 || /[.،؛؟!:]$/.test(w.w) || gap > 0.3 || (nx && nx.line !== w.line)) { gs.push(g); g = []; }
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
      position: "absolute", left: 50, right: 50, top: 1360, textAlign: "center", fontFamily: "V34Black", fontSize: 70, lineHeight: 1.3,
      color: "#fff", opacity: k, transform: `translateY(${(1 - k) * 14}px) scale(${0.94 + 0.06 * k})`,
      textShadow: "0 4px 14px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.95), 0 0 30px rgba(0,0,0,.45)",
    }}>
      {g.map((w) => (w.w.startsWith("داری") ? w.w.replace(/[^آ-یِ]/g, "") : w.w.replace(/[ً-ْ«»]/g, "")).replace(/[.،؛:]$/, "")).join(" ")}
    </div>
  );
};

/* ===================== frame ===================== */
const Frame: React.FC<{ t: number }> = ({ t }) => {
  const paper = t >= PAPER0 && t < PAPER1;
  const dark = win(t, T.jun - 0.1, T.majara - 0.05, 0.5, 0.35) * 0.62;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!paper && <Satellite t={t} />}
      {!paper && t < PAPER0 && <Weather t={t} />}
      {paper && <Paper t={t} />}
      {!paper && t >= END0 && <Kidnap t={t} />}
      {/* white flash leaving the paper map */}
      {t >= PAPER1 && t < PAPER1 + 0.4 && <AbsoluteFill style={{ background: "#fff", opacity: 1 - ramp(t, PAPER1, PAPER1 + 0.35) }} />}
      {/* white flash into the paper map */}
      {t >= T.sakhtan - 0.3 && t < PAPER0 && <AbsoluteFill style={{ background: "#fff", opacity: ramp(t, T.sakhtan - 0.3, PAPER0) }} />}
      {/* darkness: «can cost you your life» · «so what's the reason?» */}
      {dark > 0.01 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,${dark * 0.35}) 20%, rgba(0,0,0,${dark}) 75%)` }} />}
      {/* constant vignette + top/bottom shade for the captions */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,.28) 76%, rgba(0,0,0,0) 90%)" }} />
      <Captions t={t} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Frame t={f / FPS} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </>
  );
};
export const LOOK = [
  1.0, T.shomali + 0.5, T.jade + 0.6, T.tike + 0.6, T.darien + 0.5, T.khatar + 0.6, T.tul + 0.6, T.nesfe + 0.3, T.jun + 0.5, T.vali + 0.5,
  T.km + 0.4, T.jangal + 1.0, T.batlagh + 0.4, T.kuh + 0.4, T.panama + 0.2, T.colombia + 0.4, T.hava + 0.5, T.baroon + 0.5,
  T.gheyr7, T.geroon + 0.4, T.pan + 0.5, T.shekast + 0.6, T.shekaf9 + 0.4, T.mohajer + 1.5, T.omid + 1.0, T.jangalha + 1.3,
  T.nemi + 0.3, T.heyvun + 0.7, T.nabud + 0.6, T.khalaf + 0.4, T.goruh + 0.5, T.adam + 0.4, T.bala + 0.5,
];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V34: React.FC = () => (
  <>
    <Composition id="V34" component={Video} durationInFrames={V34_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v34/mix.wav" }} />
    <Composition id="V34-Silent" component={Video} durationInFrames={V34_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V34-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
// unused helper kept for path debugging
export const _len = plen;
