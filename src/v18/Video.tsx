// Video 18 — «روستایی که نفس کشیدن در آن ممنوع بود» · vertical 1080×1920 · 60 s · dark horror, true story (erionite, Cappadocia).
// Own look: tuff stone + bone-white dust, cold night blue, one warm lamp amber; red only for death and the jump.
// The user's three photos (uploads/v18) are graded day-for-night; everything else is drawn here. Cues come from words.json (tools/v18-voice.mjs).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio as Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import words from "./words.json";

type Wd = { si: number; wi: number; w: string; v: string; s: number; e: number };
const WORDS = words as Wd[];
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const W = (si: number, needle: string, nth = 0) => {
  const h = WORDS.filter((w) => w.si === si && w.w.includes(needle));
  const w = h[nth] ?? h[0];
  if (!w) throw new Error(`word ${si}:${needle}`);
  return w.s;
};
const S = (si: number) => WORDS.find((w) => w.si === si)!.s;
const E = (si: number) => WORDS.filter((w) => w.si === si).at(-1)!.e;
export const V18_END = 60;
export const V18_FRAMES = fr(V18_END);

const NASTA = "V18Nasta";
const BLACK = "V18Black";
if (typeof document !== "undefined") {
  const h = delayRender("v18 fonts");
  Promise.all([
    new FontFace(NASTA, `url('${staticFile("fonts/NotoNastaliqUrdu.ttf")}')`).load().then((f) => document.fonts.add(f)),
    new FontFace(BLACK, `url('${staticFile("fonts/Vazirmatn-Black.ttf")}')`).load().then((f) => document.fonts.add(f)),
  ]).then(() => continueRender(h)).catch(() => continueRender(h));
}

// ---- palette ----------------------------------------------------------------
const C = {
  night: "#05070b", blue1: "#0b1220", blue2: "#18243a", tuff: "#6d6457", tuffD: "#2c2822", tuffL: "#a99d88",
  dust: "#ece6d8", amber: "#e9a74e", amberGlow: "rgba(233,167,78,.35)", red: "#d4252f", xray: "#cfe0ea", text: "#f3efe6", dim: "#8a8f99",
};

// ---- utils -------------------------------------------------------------------
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
/** decaying shake after a hit at time `at` */
const shakeAt = (t: number, at: number, amp = 18, dur = 0.5) => { const d = t - at; return d < 0 || d > dur ? 0 : Math.sin(d * 90) * amp * (1 - d / dur); };

/** Floating dust motes in a box. `rise` = upward drift px/s, `lit` = brightness 0..1. */
const Dust: React.FC<{ t: number; n?: number; seed?: number; x?: number; y?: number; w?: number; h?: number; lit?: number; rise?: number; size?: number; color?: string }> = ({ t, n = 90, seed = 1, x = 0, y = 0, w = 1080, h = 1920, lit = 0.8, rise = 14, size = 1, color = C.dust }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const sp = 0.5 + hn(i, seed + 1);
      const px = x + ((hn(i, seed) * w + Math.sin(t * 0.4 * sp + i) * 26 + t * 6 * (hn(i, seed + 5) - 0.5)) % w + w) % w;
      const py = y + ((hn(i, seed + 2) * h - t * rise * sp) % h + h) % h;
      const r = (0.8 + hn(i, seed + 3) * 2.6) * size;
      const tw = 0.45 + 0.55 * Math.sin(t * (1.5 + hn(i, seed + 4) * 3) + i * 1.7);
      return <circle key={i} cx={px} cy={py} r={r} fill={color} opacity={lit * tw * (0.35 + 0.65 * hn(i, seed + 6))} />;
    })}
  </g>
);

/** User photo, graded day-for-night, with a slow camera (x/y = focus point in the 1080×1920 frame after scale). */
const Photo: React.FC<{ src: string; w: number; h: number; t: number; t0: number; t1: number; from: [number, number, number]; to: [number, number, number]; night?: number; warm?: number }> = ({ src, w, h, t, t0, t1, from, to, night = 1, warm = 0 }) => {
  const k = rk(t, t0, t1, (q) => q);
  const s = lerp(from[2], to[2], k), cx = lerp(from[0], to[0], k), cy = lerp(from[1], to[1], k); // cx/cy = source pixel at frame centre
  const sc = (1920 / h) * s;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.night }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 540 - cx * sc, top: 960 - cy * sc, width: w * sc, height: h * sc, maxWidth: "none", maxHeight: "none", filter: `brightness(${lerp(1, 0.66, night)}) contrast(${lerp(1, 1.18, night)}) saturate(${lerp(1, 0.3, night)})` }} />
      {/* day-for-night: kill the bright sky, cold cast, warm only where asked */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(4,8,16,${0.7 * night}) 0%, rgba(8,14,26,${0.3 * night}) 35%, rgba(5,8,12,${0.05 * night}) 65%, rgba(0,0,0,${0.5 * night}) 100%)` }} />
      <AbsoluteFill style={{ background: `rgba(70,100,150,${0.45 * night})`, mixBlendMode: "multiply" }} />
      {warm > 0 && <AbsoluteFill style={{ background: `rgba(233,150,60,${0.22 * warm})`, mixBlendMode: "overlay" }} />}
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ x: number; y: number; a: number; bg: string; color?: string; children: React.ReactNode; size?: number; font?: string }> = ({ x, y, a, bg, color = "#fff", children, size = 40, font = BLACK }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${a})`, opacity: a > 0.01 ? 1 : 0, background: bg, color, borderRadius: 12, padding: "8px 26px 12px", fontFamily: font, fontSize: size, direction: "rtl", whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,.55)" }}>{children}</div>
);

/** Full-frame SVG layer. */
const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, ...style }}>{children}</svg>
);

/** Rough tuff-stone wall: irregular blocks lit from (lx, ly). */
const StoneWall: React.FC<{ lx: number; ly: number; lit: number; seed?: number; rows?: number }> = ({ lx, ly, lit, seed = 3, rows = 16 }) => {
  const rh = 1920 / rows, blocks: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    let x = -60 * hn(r, seed);
    let i = 0;
    while (x < 1080) {
      const bw = 150 + hn(r * 31 + i, seed) * 170;
      const y = r * rh, d = Math.hypot(x + bw / 2 - lx, y + rh / 2 - ly);
      const b = clamp(1 - d / 1300) * lit;
      const tone = 0.75 + hn(r * 17 + i, seed + 1) * 0.35;
      const col = `rgb(${Math.round(lerp(18, 168, b) * tone)},${Math.round(lerp(17, 154, b) * tone)},${Math.round(lerp(16, 132, b) * tone)})`;
      const j = (k: number) => (hn(r * 7 + i * 3 + k, seed + 2) - 0.5) * 10;
      blocks.push(<path key={`${r}-${i}`} d={`M${x + 4 + j(1)} ${y + 4 + j(2)} L${x + bw - 4 + j(3)} ${y + 3 + j(4)} L${x + bw - 3 + j(5)} ${y + rh - 4 + j(6)} L${x + 3 + j(7)} ${y + rh - 3 + j(8)} Z`} fill={col} stroke="rgba(0,0,0,.6)" strokeWidth={6} strokeLinejoin="round" />);
      x += bw; i++;
    }
  }
  return <g>{blocks}</g>;
};

// ---- silhouettes ---------------------------------------------------------------
/** Standing farmer, origin = feet. `bend` 0..1 folds the upper body forward (cough). */
const Farmer: React.FC<{ x: number; y: number; s?: number; bend?: number; fill?: string }> = ({ x, y, s = 1, bend = 0, fill = "#07080b" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-44 -212 L-58 0 L-22 0 L0 -140 L22 0 L58 0 L44 -212 Z" fill={fill} />
    <line x1={120} y1={-330} x2={170} y2={6} stroke={fill} strokeWidth={10} />
    <path d="M150 -10 L196 -10 L188 22 L158 22 Z" fill={fill} />
    <g transform={`rotate(${bend * 34} 0 -212)`}>
      <path d="M-56 -420 Q-74 -300 -48 -212 L48 -212 Q74 -300 56 -420 Q0 -446 -56 -420 Z" fill={fill} />
      <path d="M50 -404 Q100 -360 122 -330 L112 -316 Q84 -344 42 -372 Z" fill={fill} />
      <path d={`M-50 -404 Q-30 -330 ${-4 - bend * 10} -300 L-14 -290 Q-60 -330 -66 -380 Z`} fill={fill} />
      <circle cx={6} cy={-470} r={40} fill={fill} />
      <path d="M-46 -486 Q6 -540 58 -486 L74 -478 L-62 -478 Z" fill={fill} />
    </g>
  </g>
);

/** Old woman profile with headscarf, facing right. Origin = chin level. */
const Grandma: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = "#050608" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-250 520 Q-260 260 -170 120 Q-200 -40 -140 -150 Q-60 -260 40 -230 Q110 -205 128 -120 Q132 -96 126 -78 L150 -36 Q156 -22 138 -16 L140 6 Q146 18 130 24 Q134 50 116 60 Q90 70 70 64 Q74 110 120 150 Q230 230 260 520 Z" fill={fill} />
    {/* scarf edge catching lamp light */}
    <path d="M40 -230 Q110 -205 128 -120 Q132 -96 126 -78" fill="none" stroke="rgba(233,167,78,.55)" strokeWidth={5} />
    <path d="M126 -78 L150 -36 Q156 -22 138 -16 L140 6 Q146 18 130 24 Q134 50 116 60" fill="none" stroke="rgba(233,167,78,.75)" strokeWidth={4} />
  </g>
);

// ---- scenes (absolute time t) -----------------------------------------------------
/** 0 · «این داستان… واقعیه.» black, one shaft of light full of dust, red stamp. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const stamp = W(0, "واقعیه");
  const a = rk(t, stamp - 0.08, stamp + 0.12, back);
  const sh = shakeAt(t, stamp, 14, 0.4);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Svg>
        <defs>
          <linearGradient id="v18beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(236,230,216,.30)" /><stop offset="1" stopColor="rgba(236,230,216,0)" /></linearGradient>
          <clipPath id="v18beamc"><path d="M470 -20 L610 -20 L900 1920 L180 1920 Z" /></clipPath>
        </defs>
        <path d="M470 -20 L610 -20 L900 1920 L180 1920 Z" fill="url(#v18beam)" opacity={0.6 + 0.4 * rk(t, 0, 0.6)} />
        <g clipPath="url(#v18beamc)"><Dust t={t + 3} n={160} seed={2} lit={1} rise={10} size={1.2} /></g>
        <Dust t={t} n={40} seed={5} lit={0.25} />
      </Svg>
      <div style={{ position: "absolute", left: 540 + sh, top: 760, transform: `translate(-50%,-50%) rotate(-4deg) scale(${lerp(1.6, 1, a)})`, opacity: a, border: `8px solid ${C.red}`, borderRadius: 10, padding: "10px 34px 22px", color: C.red, fontFamily: BLACK, fontSize: 66, direction: "rtl", whiteSpace: "nowrap", textShadow: "0 0 30px rgba(212,37,47,.4)" }}>
        بر اساس یک فاجعه‌ی واقعی
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 880, textAlign: "center", fontFamily: FONT_TEXT, fontSize: 34, color: C.dim, direction: "rtl", opacity: rk(t, stamp + 0.3, stamp + 0.8), letterSpacing: 2 }}>کاپادوکیا · ترکیه</div>
    </AbsoluteFill>
  );
};

/** 1 · village photo (fairy chimneys) at night; on «نفس» dust breathes out of every hole, on «می‌کشت» a red pulse. */
const Village: React.FC<{ t: number }> = ({ t }) => {
  const s0 = S(1) - 0.2, breath = W(1, "نفس"), kill = W(1, "می‌کشت");
  const fog = rk(t, breath - 0.1, breath + 1.2, out3);
  const red = rk(t, kill - 0.05, kill + 0.1) * (1 - rk(t, kill + 0.25, kill + 1.1));
  return (
    <>
      <Photo src="v18/chimneys.jpg" w={2400} h={1350} t={t} t0={s0} t1={E(1) + 0.4} from={[1500, 640, 1.12]} to={[1220, 560, 1.32]} />
      <Svg>
        <defs><radialGradient id="v18fog"><stop offset="0" stopColor="rgba(236,230,216,.55)" /><stop offset="1" stopColor="rgba(236,230,216,0)" /></radialGradient></defs>
        {/* breath plumes rising from the dark doorways */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = 120 + i * 110 + hn(i, 4) * 40, y = 820 + hn(i, 5) * 260 - fog * (120 + 80 * hn(i, 6)) - (t - breath) * 20;
          return <ellipse key={i} cx={x + Math.sin(t + i) * 20} cy={y} rx={90 + fog * 120} ry={60 + fog * 90} fill="url(#v18fog)" opacity={fog * (0.5 + 0.3 * Math.sin(t * 1.3 + i))} />;
        })}
        <Dust t={t} n={120} seed={7} lit={0.5 + 0.4 * fog} rise={22} />
      </Svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(160,10,18,${0.7 * red}) 100%)` }} />
      <Chip x={540} y={240} a={rk(t, S(1), S(1) + 0.4, back)} bg="rgba(0,0,0,.6)" color={C.dust} size={34}>توزکوی · نوشهیر · ترکیه</Chip>
    </>
  );
};

/** 2 · inside: hands pull the wooden shutters closed on «می‌بست»; «حتی تابستون» → thermometer. */
const Shutters: React.FC<{ t: number }> = ({ t }) => {
  const close = rk(t, W(2, "می‌بست") - 0.5, W(2, "می‌بست") + 0.25, out3);
  const thud = shakeAt(t, W(2, "می‌بست") + 0.25, 10, 0.35);
  const summer = rk(t, W(2, "حتی") - 0.1, W(2, "حتی") + 0.3, back);
  const deg = Math.round(lerp(28, 41, rk(t, W(2, "حتی"), W(2, "تابستون") + 0.4, out3)));
  const wx = 290, wy = 560, ww = 500, wh = 640;
  return (
    <AbsoluteFill style={{ background: C.night, transform: `translateX(${thud}px) scale(${1.04 + 0.05 * rk(t, S(2) - 0.2, E(2) + 0.3, (k) => k)})` }}>
      <Svg>
        <defs>
          <linearGradient id="v18sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1830" /><stop offset="1" stopColor="#2a3550" /></linearGradient>
          <radialGradient id="v18lamp2" cx="0.2" cy="0.85" r="0.9"><stop offset="0" stopColor="rgba(233,167,78,.28)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
        </defs>
        <StoneWall lx={160} ly={1650} lit={0.55 + 0.05 * Math.sin(t * 13)} seed={4} />
        {/* window: night outside with chimney rocks */}
        <rect x={wx} y={wy} width={ww} height={wh} fill="url(#v18sky2)" />
        <circle cx={wx + 360} cy={wy + 150} r={40} fill="#e8e3d2" opacity={0.85} />
        <path d={`M${wx} ${wy + wh} L${wx} ${wy + 430} L${wx + 60} ${wy + 300} L${wx + 110} ${wy + 430} L${wx + 190} ${wy + 250} L${wx + 260} ${wy + 450} L${wx + 340} ${wy + 360} L${wx + 400} ${wy + 470} L${wx + 460} ${wy + 330} L${wx + ww} ${wy + 440} L${wx + ww} ${wy + wh} Z`} fill="#0a0d14" />
        <Dust t={t} n={40} seed={9} x={wx} y={wy} w={ww} h={wh} lit={0.6} rise={18} />
        {/* shutters (hinged on the sides) */}
        {[0, 1].map((side) => {
          const sw = ww / 2, open = 1 - close;
          const k = Math.cos(open * 1.35); // projected width
          const x0 = side === 0 ? wx : wx + ww;
          const w = sw * k, xs = side === 0 ? x0 : x0 - w;
          return (
            <g key={side}>
              <rect x={xs} y={wy - 6} width={w} height={wh + 12} fill="#2a1d12" stroke="#120c07" strokeWidth={6} />
              {Array.from({ length: 9 }, (_, j) => <line key={j} x1={xs + 8} x2={xs + w - 8} y1={wy + 40 + j * 66} y2={wy + 40 + j * 66} stroke="#140d07" strokeWidth={8} opacity={k} />)}
            </g>
          );
        })}
        <rect x={wx - 30} y={wy - 40} width={ww + 60} height={40} fill="#1a140e" />
        <rect x={wx - 40} y={wy + wh} width={ww + 80} height={36} fill="#1a140e" />
        {/* her two hands on the shutter edges */}
        {[0, 1].map((side) => {
          const w = (ww / 2) * Math.cos((1 - close) * 1.35);
          const hx = side === 0 ? wx + w : wx + ww - w;
          return <ellipse key={side} cx={hx} cy={wy + 330} rx={34} ry={56} fill="#07080a" opacity={1 - rk(t, W(2, "می‌بست") + 0.4, W(2, "می‌بست") + 0.9)} />;
        })}
        <rect width={1080} height={1920} fill="url(#v18lamp2)" />
        {/* dust knocked off by the slam */}
        <Dust t={t} n={50} seed={11} x={wx - 60} y={wy + 200} w={ww + 120} h={500} lit={rk(t, W(2, "می‌بست") + 0.2, W(2, "می‌بست") + 0.5) * (1 - rk(t, W(2, "حتی") + 1, E(2) + 1))} rise={-30} />
      </Svg>
      <div style={{ position: "absolute", left: 830, top: 360, transform: `translate(-50%,-50%) scale(${summer})`, opacity: summer > 0.01 ? 1 : 0, display: "flex", alignItems: "center", gap: 14, background: "rgba(0,0,0,.65)", borderRadius: 16, padding: "12px 24px", direction: "rtl" }}>
        <svg width={34} height={90} viewBox="0 0 34 90"><rect x={11} y={4} width={12} height={64} rx={6} fill="none" stroke={C.dust} strokeWidth={3} /><rect x={14} y={lerp(60, 14, (deg - 28) / 13)} width={6} height={lerp(10, 56, (deg - 28) / 13)} fill={C.red} /><circle cx={17} cy={74} r={12} fill={C.red} /></svg>
        <span style={{ fontFamily: FONT_NUM, fontSize: 70, color: C.dust }}>{fa(deg)}°</span>
      </div>
    </AbsoluteFill>
  );
};

/** 3 · grandma in profile by the oil lamp, her words written in Nastaliq. */
const GrandmaSays: React.FC<{ t: number }> = ({ t }) => {
  const s = S(3);
  const fl = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 7.3);
  const parts: [string, number][] = [["بعضی چیزا", W(3, "بعضی")], ["نباید بیان", W(3, "نباید")], ["تو خونه…", W(3, "تو")]];
  return (
    <AbsoluteFill style={{ background: "#040405", transform: `scale(${1.02 + 0.06 * rk(t, s - 0.3, E(3) + 0.4, (k) => k)})` }}>
      <Svg>
        <defs><radialGradient id="v18lamp3"><stop offset="0" stopColor="rgba(233,167,78,.75)" /><stop offset="0.35" stopColor="rgba(233,140,60,.22)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <circle cx={820} cy={1120} r={700 * fl} fill="url(#v18lamp3)" />
        <StoneWall lx={820} ly={1120} lit={0.25 * fl} seed={8} rows={14} />
        <circle cx={820} cy={1120} r={520 * fl} fill="url(#v18lamp3)" opacity={0.6} />
        {/* oil lamp */}
        <path d="M770 1240 Q820 1200 870 1240 L860 1270 L780 1270 Z" fill="#1a120a" />
        <path d={`M820 1236 Q${808 + Math.sin(t * 21) * 4} 1200 ${820 + Math.sin(t * 13) * 5} ${1168 - fl * 10} Q${832 + Math.sin(t * 17) * 3} 1205 820 1236 Z`} fill="#ffd28a" />
        <Grandma x={430} y={1000} s={1.25} />
        <Dust t={t} n={70} seed={13} lit={0.5} rise={8} color="#f3d6a8" />
      </Svg>
      <div style={{ position: "absolute", left: 60, width: 960, top: 300, direction: "rtl", textAlign: "center", fontFamily: NASTA, fontSize: 92, lineHeight: 1.9, color: "#f1dcb4", textShadow: "0 0 30px rgba(233,167,78,.35), 0 4px 0 #000" }}>
        {parts.map(([w, at], i) => {
          const a = rk(t, at - 0.1, at + 0.3);
          return <span key={i} style={{ display: "inline-block", margin: "0 14px", opacity: a, transform: `translateY(${(1 - a) * 20}px)`, filter: `blur(${(1 - a) * 6}px)` }}>{w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** 4 · neighbour in the field at dusk coughs dust; on «مُرد» → a fresh grave. */
const Field: React.FC<{ t: number }> = ({ t }) => {
  const cough = W(4, "سرفه");
  const died = W(4, "مرد");
  const coughs = [cough - 0.05, cough + 0.35, cough + 0.75, W(4, "چند") + 0.2, W(4, "ماه") + 0.1];
  const bend = Math.max(0, ...coughs.map((c) => { const d = t - c; return d < 0 || d > 0.45 ? 0 : Math.sin((d / 0.45) * Math.PI); }));
  const weak = rk(t, W(4, "چند"), died, (k) => k); // he sinks lower over the months
  const sky = rk(t, S(4), died, (k) => k);
  if (t >= died - 0.05) return <Grave t={t} at={died} />;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `scale(${1.05 + 0.06 * sky})` }}>
      <Svg>
        <defs>
          <linearGradient id="v18dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={`rgb(${Math.round(lerp(60, 20, sky))},${Math.round(lerp(30, 18, sky))},${Math.round(lerp(28, 34, sky))})`} /><stop offset="0.62" stopColor={`rgb(${Math.round(lerp(190, 70, sky))},${Math.round(lerp(96, 40, sky))},${Math.round(lerp(50, 40, sky))})`} /><stop offset="1" stopColor="#120c08" /></linearGradient>
          <radialGradient id="v18cough"><stop offset="0" stopColor="rgba(236,230,216,.85)" /><stop offset="1" stopColor="rgba(236,230,216,0)" /></radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#v18dusk)" />
        <circle cx={300} cy={lerp(1050, 1200, sky)} r={90} fill="#f2b06a" opacity={lerp(0.85, 0.15, sky)} />
        {/* chimney rocks on the horizon */}
        <path d="M0 1200 L60 1120 L100 1180 L170 1040 L230 1180 L320 1130 L380 1200 L470 1080 L540 1190 L640 1150 L720 1200 L800 1060 L870 1190 L960 1120 L1080 1180 L1080 1300 L0 1300 Z" fill="#160f0b" />
        <rect y={1260} width={1080} height={660} fill="#0c0806" />
        {/* wheat */}
        {Array.from({ length: 70 }, (_, i) => { const x = hn(i, 21) * 1080, h = 80 + hn(i, 22) * 140, sw = Math.sin(t * 1.4 + i * 0.7) * 10; return <path key={i} d={`M${x} 1920 Q${x + sw / 2} ${1920 - h * 2} ${x + sw} ${1300 + hn(i, 23) * 300}`} stroke="#1a110b" strokeWidth={5} fill="none" />; })}
        <Farmer x={620} y={1560 + weak * 30} s={1.35} bend={Math.min(1, bend * 0.9 + weak * 0.35)} />
        {/* cough clouds of white dust */}
        {coughs.map((c, i) => { const d = t - c; if (d < 0 || d > 1.6) return null; const k = d / 1.6; const hx = 620 + Math.sin((bend * 34 * Math.PI) / 180) * 260 * 1.35 + 60; return <ellipse key={i} cx={hx + k * 120} cy={1560 - 470 * 1.35 + 60 + k * 40 - k * 60} rx={30 + k * 150} ry={20 + k * 90} fill="url(#v18cough)" opacity={(1 - k) * 0.8} />; })}
        <Dust t={t} n={60} seed={17} lit={0.5} rise={6} color="#f2c89a" />
      </Svg>
    </AbsoluteFill>
  );
};

/** grave: a lone headstone with fresh dirt, a crow. */
const Grave: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const a = rk(t, at - 0.05, at + 0.15);
  return (
    <AbsoluteFill style={{ background: "#06080c", transform: `scale(${1.15 - 0.08 * rk(t, at, at + 1.3, out3)})` }}>
      <Svg>
        <defs><radialGradient id="v18moon4" cx="0.5" cy="0.35"><stop offset="0" stopColor="rgba(160,180,210,.35)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <rect width={1080} height={1920} fill="url(#v18moon4)" />
        <path d="M0 1240 Q540 1120 1080 1240 L1080 1920 L0 1920 Z" fill="#0b0c0f" />
        <path d="M330 1250 Q540 1150 750 1250 Z" fill="#2a2119" />
        <path d="M440 1220 L440 900 Q540 820 640 900 L640 1220 Z" fill="#4b463e" stroke="#16130f" strokeWidth={8} />
        <path d="M470 1000 L610 1000 M470 1060 L590 1060" stroke="#1d1a16" strokeWidth={8} opacity={0.8} />
        <g transform={`translate(600 ${880 + Math.sin(t * 3) * 2})`}><path d="M0 0 Q30 -30 60 -10 L90 -20 L70 0 Q50 20 20 16 Z" fill="#050506" /><circle cx={58} cy={-12} r={3} fill={C.red} /></g>
        <Dust t={t} n={40} seed={19} lit={0.4} />
      </Svg>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${0.35 * (1 - a)})` }} />
    </AbsoluteFill>
  );
};

/** 5 · graves rise on the hill: +3 «اون سال»، +5 «سال بعد». */
const Graves: React.FC<{ t: number }> = ({ t }) => {
  const g3 = W(5, "سه"), g5 = W(5, "پنج");
  const spots = [[540, 1180, 1], [300, 1150, 0.8], [780, 1160, 0.85], [420, 1080, 0.65], [170, 1090, 0.6], [650, 1060, 0.62], [900, 1090, 0.6], [250, 1020, 0.5], [820, 1010, 0.5]] as const;
  const at = (i: number) => (i === 0 ? -9 : i <= 3 ? g3 + (i - 1) * 0.12 : g5 + (i - 4) * 0.09);
  const year = t >= W(5, "سال", 1) - 0.1 ? "سال بعد" : "همون سال";
  return (
    <AbsoluteFill style={{ background: "#06080c", transform: `scale(${1.02 + 0.05 * rk(t, S(5) - 0.2, E(5) + 0.3, (k) => k)})` }}>
      <Svg>
        <defs><linearGradient id="v18fog5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(150,160,180,0)" /><stop offset="1" stopColor="rgba(150,160,180,.25)" /></linearGradient></defs>
        <rect width={1080} height={1000} fill="#0a0f1a" />
        <path d="M0 1000 L80 900 L140 960 L230 820 L300 950 L420 880 L520 960 L620 860 L700 950 L820 840 L900 950 L1080 900 L1080 1100 L0 1100 Z" fill="#0d1018" />
        <path d="M0 1120 Q540 960 1080 1120 L1080 1920 L0 1920 Z" fill="#0b0c0f" />
        {spots.map(([x, y, s], i) => {
          const k = i === 0 ? 1 : rk(t, at(i), at(i) + 0.3, back);
          if (k <= 0) return null;
          return <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><path d={`M-55 0 L-55 ${-170 * k} Q0 ${-230 * k} 55 ${-170 * k} L55 0 Z`} fill={i === 0 ? "#4b463e" : "#3a362f"} stroke="#141210" strokeWidth={6} /><path d="M-110 4 Q0 -40 110 4 Z" fill="#2a2119" opacity={k} /></g>;
        })}
        <rect y={900} width={1080} height={500} fill="url(#v18fog5)" transform={`translate(${Math.sin(t * 0.5) * 40} 0)`} />
        <Dust t={t} n={50} seed={23} lit={0.35} rise={5} />
      </Svg>
      <Chip x={540} y={420} a={rk(t, S(5) - 0.1, S(5) + 0.3, back)} bg="rgba(0,0,0,.6)" color={C.dust} size={40}>{year}</Chip>
    </AbsoluteFill>
  );
};

/** X-ray chest. mass = dark weight growing in the left lung, squeeze = a hand inside crushing both lungs. */
const XRay: React.FC<{ t: number; mass: number; squeeze: number; breath?: number }> = ({ t, mass, squeeze, breath = 1 }) => {
  const b = 1 + 0.035 * Math.sin(t * lerp(3.2, 7, squeeze)) * breath - 0.12 * squeeze;
  const lung = "M-28 -300 Q-110 -310 -170 -170 Q-232 -10 -222 170 Q-212 250 -130 240 Q-58 230 -36 160 Z";
  const ribs = Array.from({ length: 8 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ background: "#020406" }}>
      <Svg>
        <defs>
          <radialGradient id="v18lung" cx="0.5" cy="0.45"><stop offset="0" stopColor="rgba(207,224,234,.08)" /><stop offset="0.8" stopColor="rgba(207,224,234,.32)" /><stop offset="1" stopColor="rgba(207,224,234,.55)" /></radialGradient>
          <radialGradient id="v18mass"><stop offset="0" stopColor="rgba(0,0,0,.95)" /><stop offset="0.6" stopColor="rgba(10,10,12,.7)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
          <clipPath id="v18lungL"><path d={lung} /></clipPath>
          <filter id="v18glow"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <g transform={`translate(540 940) scale(1.55)`}>
          {/* ribs + spine */}
          {ribs.map((i) => <g key={i} opacity={0.5}><path d={`M-12 ${-250 + i * 58} Q-200 ${-270 + i * 62} -250 ${-120 + i * 62}`} stroke={C.xray} strokeWidth={9} fill="none" filter="url(#v18glow)" /><path d={`M12 ${-250 + i * 58} Q200 ${-270 + i * 62} 250 ${-120 + i * 62}`} stroke={C.xray} strokeWidth={9} fill="none" filter="url(#v18glow)" /></g>)}
          <rect x={-14} y={-340} width={28} height={640} rx={10} fill={C.xray} opacity={0.35} filter="url(#v18glow)" />
          {[-1, 1].map((side) => (
            <g key={side} transform={`scale(${side * b} ${b})`}>
              <path d={lung} fill="url(#v18lung)" stroke="rgba(207,224,234,.6)" strokeWidth={3} />
              {/* bronchi */}
              <path d="M-14 -260 Q-60 -150 -110 -60 M-60 -150 Q-120 -120 -160 -40 M-80 -100 Q-90 20 -140 100" stroke="rgba(207,224,234,.35)" strokeWidth={4} fill="none" />
              {side === -1 && mass > 0 && <g clipPath="url(#v18lungL)"><circle cx={-130} cy={40} r={40 + 170 * mass} fill="url(#v18mass)" /><circle cx={-100} cy={-120} r={20 + 70 * mass} fill="url(#v18mass)" opacity={mass} /></g>}
            </g>
          ))}
          {/* the hand inside: fingers wrapping both lungs */}
          {squeeze > 0 && [-1, 1].map((side) => (
            <g key={side} transform={`scale(${side} 1)`} opacity={squeeze}>
              {[0, 1, 2, 3].map((k) => <path key={k} d={`M-10 ${-120 + k * 70} Q${-150 + 40 * squeeze} ${-150 + k * 70} ${-200 + 50 * squeeze} ${-60 + k * 75}`} stroke="#000" strokeWidth={34 - k * 3} strokeLinecap="round" fill="none" />)}
            </g>
          ))}
        </g>
        <text x={90} y={300} fill="rgba(207,224,234,.6)" fontFamily="Chakra Petch, monospace" fontSize={30}>PA · CHEST</text>
        <text x={990} y={300} fill="rgba(207,224,234,.6)" fontFamily="Chakra Petch, monospace" fontSize={30} textAnchor="end">L</text>
      </Svg>
      {/* scan line */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent ${((t * 40) % 120) - 10}%, rgba(207,224,234,.08) ${((t * 40) % 120) - 5}%, transparent ${(t * 40) % 120}%)` }} />
    </AbsoluteFill>
  );
};

/** 7 · night, father bolts upright in bed, hand on chest; mother at the door with a lamp and a glass. */
const Bedroom: React.FC<{ t: number }> = ({ t }) => {
  const up = rk(t, W(7, "بیدار") - 0.25, W(7, "بیدار") + 0.2, out3);
  const pain = Math.sin(t * 9) * 3 * up;
  const mom = rk(t, W(7, "شد") - 0.1, E(7) + 0.4, out3);
  return (
    <AbsoluteFill style={{ background: "#040508", transform: `translateY(${shakeAt(t, W(7, "بیدار"), 8, 0.3)}px) scale(${1.04 + 0.04 * up})` }}>
      <Svg>
        <defs><radialGradient id="v18door" cx="0.85" cy="0.5"><stop offset="0" stopColor="rgba(233,167,78,.5)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <StoneWall lx={600} ly={900} lit={0.3 + 0.25 * mom} seed={12} rows={15} />
        <rect width={1080} height={1920} fill="url(#v18door)" opacity={mom} />
        <rect x={60} y={640} width={360} height={460} fill="#26344d" stroke="#0d0a07" strokeWidth={24} />
        <line x1={240} y1={640} x2={240} y2={1100} stroke="#0d0a07" strokeWidth={14} />
        <circle cx={330} cy={740} r={34} fill="#e8e3d2" opacity={0.8} />
        {/* door opening on the right with mother */}
        <rect x={860} y={560} width={220} height={900} fill={`rgba(233,167,78,${0.25 * mom})`} />
        <g opacity={mom} transform={`translate(${lerp(1130, 960, mom)} 1460)`}>
          <path d="M-90 0 Q-100 -400 -60 -560 Q-30 -660 20 -640 Q70 -620 72 -540 Q110 -380 100 0 Z" fill="#050506" />
          <circle cx={-100} cy={-330} r={18} fill="#ffcf85" /><circle cx={-100} cy={-330} r={60} fill="rgba(255,200,120,.25)" />
        </g>
        {/* bed */}
        <rect x={60} y={1300} width={720} height={160} rx={10} fill="#16110c" />
        <rect x={80} y={1250} width={680} height={90} rx={30} fill="#3a342c" />
        <rect x={60} y={1150} width={40} height={340} fill="#16110c" />
        {/* father: lying (−80°) → sitting, hand clutching chest */}
        <g transform={`translate(230 1290) rotate(${lerp(-78, 0, up) + pain * 0.3})`}>
          <path d="M-60 0 Q-80 -200 -40 -300 L50 -300 Q90 -200 70 0 Z" fill="#07080a" />
          <circle cx={6} cy={-350} r={52} fill="#07080a" />
          <path d="M60 -260 Q120 -200 30 -170 L10 -190 Q70 -205 40 -240 Z" fill="#07080a" />
          <ellipse cx={30} cy={-180} rx={34} ry={24} fill="#0d0e11" stroke={`rgba(233,167,78,${0.5 * mom})`} strokeWidth={3} />
        </g>
        <Dust t={t} n={50} seed={29} lit={0.35 + 0.3 * mom} color="#f3d6a8" />
      </Svg>
      <div style={{ position: "absolute", left: 210, top: 300, fontFamily: FONT_NUM, fontSize: 70, color: C.red, opacity: 0.85 }}>۰۲:۴۰</div>
    </AbsoluteFill>
  );
};

/** 9 · hospital corridor: the gurney rolls away, doors close on «برنگشت», lights die one by one. */
const Corridor: React.FC<{ t: number }> = ({ t }) => {
  const gone = W(9, "برنگشت");
  const roll = rk(t, S(9) - 0.2, gone, (k) => k);
  const doors = rk(t, gone - 0.25, gone + 0.15, out3);
  const vp = [540, 900];
  const N = 6;
  const lightOn = (i: number) => (t < gone + 0.2 + (N - 1 - i) * 0.18 ? (hn(Math.floor(t * 14), i) > 0.9 ? 0.4 : 1) : 0);
  const at = (z: number) => ({ x: (p: number) => vp[0] + (p - vp[0]) * z, y: (p: number) => vp[1] + (p - vp[1]) * z });
  const gz = lerp(0.95, 0.22, roll);
  const G = at(gz);
  return (
    <AbsoluteFill style={{ background: "#020304" }}>
      <Svg>
        {/* walls/floor/ceiling */}
        <path d={`M0 0 L${vp[0] - 120} ${vp[1] - 180} L${vp[0] - 120} ${vp[1] + 180} L0 1920 Z`} fill="#11151a" />
        <path d={`M1080 0 L${vp[0] + 120} ${vp[1] - 180} L${vp[0] + 120} ${vp[1] + 180} L1080 1920 Z`} fill="#0e1216" />
        <path d={`M0 1920 L${vp[0] - 120} ${vp[1] + 180} L${vp[0] + 120} ${vp[1] + 180} L1080 1920 Z`} fill="#181c20" />
        <path d={`M0 0 L${vp[0] - 120} ${vp[1] - 180} L${vp[0] + 120} ${vp[1] - 180} L1080 0 Z`} fill="#0a0c0f" />
        {/* end doors */}
        <rect x={vp[0] - 120} y={vp[1] - 180} width={240} height={360} fill="#c9d6d2" opacity={0.25} />
        <rect x={vp[0] - 120} y={vp[1] - 180} width={120 * doors} height={360} fill="#2c3438" stroke="#0c0f11" strokeWidth={4} />
        <rect x={vp[0] + 120 - 120 * doors} y={vp[1] - 180} width={120 * doors} height={360} fill="#2c3438" stroke="#0c0f11" strokeWidth={4} />
        {/* ceiling tubes */}
        {Array.from({ length: N }, (_, i) => {
          const z = 1 - i / N * 0.85, A = at(z);
          const on = lightOn(i);
          return <g key={i}><rect x={A.x(380)} y={A.y(120)} width={(A.x(700) - A.x(380))} height={Math.max(4, 22 * z)} fill={`rgba(220,240,235,${0.15 + 0.85 * on})`} /><ellipse cx={540} cy={A.y(1700)} rx={300 * z} ry={60 * z} fill={`rgba(200,230,225,${0.08 * on})`} /></g>;
        })}
        {/* gurney with sheet */}
        <g opacity={1 - doors * 0.9}>
          <path d={`M${G.x(260)} ${G.y(1500)} L${G.x(820)} ${G.y(1500)} L${G.x(780)} ${G.y(1380)} L${G.x(300)} ${G.y(1380)} Z`} fill="#d7dbd6" opacity={0.85} />
          <path d={`M${G.x(340)} ${G.y(1390)} Q${G.x(420)} ${G.y(1310)} ${G.x(520)} ${G.y(1350)} Q${G.x(640)} ${G.y(1330)} ${G.x(760)} ${G.y(1390)} Z`} fill="#e9ece6" />
          <line x1={G.x(300)} y1={G.y(1500)} x2={G.x(300)} y2={G.y(1640)} stroke="#222" strokeWidth={8 * gz} />
          <line x1={G.x(780)} y1={G.y(1500)} x2={G.x(780)} y2={G.y(1640)} stroke="#222" strokeWidth={8 * gz} />
        </g>
      </Svg>
      <AbsoluteFill style={{ background: "rgba(40,70,60,.18)", mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** 10 · child in bed, eyes snap open; red clock. */
const Awake: React.FC<{ t: number }> = ({ t }) => {
  const open = rk(t, W(10, "بیدارم") - 0.1, W(10, "بیدارم") + 0.12);
  const look = Math.sin(t * 2.2) * 6 * open;
  return (
    <AbsoluteFill style={{ background: "#030407", transform: `scale(${1.08 + 0.1 * rk(t, S(10) - 0.2, E(10) + 0.4, (k) => k)})` }}>
      <Svg>
        <defs><linearGradient id="v18moonbeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(150,170,210,.25)" /><stop offset="1" stopColor="rgba(150,170,210,0)" /></linearGradient></defs>
        <StoneWall lx={1000} ly={300} lit={0.22} seed={31} rows={14} />
        <path d="M1080 120 L1080 520 L300 1500 L100 1500 Z" fill="url(#v18moonbeam)" />
        <rect x={0} y={1080} width={1080} height={840} fill="#0b0c10" />
        <ellipse cx={420} cy={1110} rx={250} ry={90} fill="#2c2a28" />
        {/* head on pillow, blanket to the chin */}
        <ellipse cx={460} cy={1070} rx={110} ry={120} fill="#08090c" />
        <path d="M0 1130 Q540 1060 1080 1150 L1080 1920 L0 1920 Z" fill="#1d1a17" />
        <path d="M0 1170 Q540 1110 1080 1190" stroke="#2b2722" strokeWidth={10} fill="none" />
        <g opacity={open}>
          <ellipse cx={420 + look} cy={1060} rx={16} ry={11 * open} fill="#e8e3d6" /><circle cx={420 + look} cy={1060} r={6} fill="#000" />
          <ellipse cx={500 + look} cy={1060} rx={16} ry={11 * open} fill="#e8e3d6" /><circle cx={500 + look} cy={1060} r={6} fill="#000" />
        </g>
        <Dust t={t} n={60} seed={37} lit={0.45} rise={6} />
      </Svg>
      <div style={{ position: "absolute", left: 210, top: 300, fontFamily: FONT_NUM, fontSize: 70, color: C.red, opacity: 0.6 + 0.4 * (Math.floor(t * 2) % 2) }}>۰۳:۱۲</div>
    </AbsoluteFill>
  );
};

/** 11 · the wall: nail scratches carve themselves from behind, dust trickles; jump on the last word. */
const Scratch: React.FC<{ t: number }> = ({ t }) => {
  const s = W(11, "ناخن") - 0.2, e = W(11, "می‌کشید") + 0.35;
  const jump = E(11) + 0.05;
  const j = rk(t, jump - 0.04, jump + 0.06) * (1 - rk(t, jump + 0.5, jump + 0.9));
  const sh = shakeAt(t, jump, 26, 0.6) + Math.sin(t * 40) * 2 * rk(t, s, e);
  const lines = [0, 1, 2, 3].map((i) => ({ x: 380 + i * 90, k: rk(t, s + i * 0.07, e + i * 0.07, (q) => q) }));
  return (
    <AbsoluteFill style={{ background: "#020203", transform: `translate(${sh}px, ${sh * 0.4}px) scale(${1.12 + 0.12 * rk(t, S(11) - 0.2, jump, (k) => k) + 0.12 * j})` }}>
      <Svg>
        <defs><radialGradient id="v18bulge"><stop offset="0" stopColor="rgba(220,210,190,.75)" /><stop offset="0.6" stopColor="rgba(120,110,95,.25)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <StoneWall lx={200} ly={1700} lit={0.38} seed={41} rows={12} />
        {lines.map(({ x, k }, i) => (
          <g key={i}>
            <path d={`M${x} 620 Q${x + 30} 900 ${x + 10} 1220`} stroke="#0a0806" strokeWidth={22} fill="none" strokeDasharray="700" strokeDashoffset={700 * (1 - k)} strokeLinecap="round" />
            <path d={`M${x + 6} 620 Q${x + 36} 900 ${x + 16} 1220`} stroke="#d7cdb8" strokeWidth={4} fill="none" strokeDasharray="700" strokeDashoffset={700 * (1 - k)} opacity={0.7} />
            {k > 0.05 && k < 1 && <Dust t={t * 3} n={14} seed={50 + i} x={x - 20} y={620 + 600 * k} w={60} h={300} lit={0.9} rise={-90} size={1.3} />}
          </g>
        ))}
        {/* fingertips pushing out of the stone */}
        <g opacity={j}>{[0, 1, 2, 3].map((i) => <ellipse key={i} cx={410 + i * 90} cy={560 + Math.abs(i - 1.5) * 30} rx={44} ry={70} fill="url(#v18bulge)" />)}</g>
      </Svg>
      <AbsoluteFill style={{ background: `rgba(212,37,47,${0.35 * j})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** 12 · bulb flickers on; a small hand touches the wall; fingertips come away white. */
const Fingers: React.FC<{ t: number }> = ({ t }) => {
  const on = t < S(12) + 0.15 ? 0 : t < S(12) + 0.35 ? (Math.floor(t * 30) % 2) : 1;
  const touch = rk(t, W(12, "دست") - 0.1, W(12, "دیوار") + 0.2, out3);
  const close = rk(t, W(12, "گرد") - 0.25, W(12, "گرد") + 0.2, out3);
  const white = rk(t, W(12, "سفید") - 0.2, W(12, "نشست") + 0.2);
  if (close > 0) {
    // close-up: fingertips covered in fine white dust
    return (
      <AbsoluteFill style={{ background: "#0b0a09", transform: `scale(${lerp(1.25, 1, close) + 0.04 * rk(t, W(12, "گرد"), E(12) + 0.4, (k) => k)})` }}>
        <Svg>
          <defs><radialGradient id="v18bulb12" cx="0.5" cy="0.1"><stop offset="0" stopColor="rgba(255,210,140,.45)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#v18bulb12)" />
          <g transform="translate(540 1500)">
            {[-1.5, -0.5, 0.5, 1.5].map((k, i) => (
              <g key={i} transform={`rotate(${k * 9}) translate(${k * 120} ${-Math.abs(k) * 40})`}>
                <rect x={-52} y={-700} width={104} height={760} rx={52} fill="#1f1611" />
                <rect x={-52} y={-700} width={104} height={300} rx={52} fill="#2b1e16" />
                {Array.from({ length: 70 }, (_, p) => <circle key={p} cx={(hn(p, i + 60) - 0.5) * 92} cy={-690 + hn(p, i + 61) * 210} r={1.5 + hn(p, i + 62) * 3.5} fill={C.dust} opacity={white * (0.5 + 0.5 * Math.sin(t * 6 + p))} />)}
              </g>
            ))}
            <rect x={-330} y={-80} width={660} height={500} rx={120} fill="#1f1611" />
          </g>
          <Dust t={t} n={90} seed={71} lit={0.8 * white} rise={10} size={1.1} />
        </Svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <Svg>
        <defs><radialGradient id="v18bulb" cx="0.5" cy="0.12" r="0.8"><stop offset="0" stopColor="rgba(255,210,140,.6)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <StoneWall lx={540} ly={200} lit={0.15 + 0.5 * on} seed={41} rows={12} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${380 + i * 90} 620 Q${410 + i * 90} 900 ${390 + i * 90} 1220`} stroke="#0a0806" strokeWidth={22} fill="none" opacity={on} />)}
        <rect width={1080} height={1920} fill="url(#v18bulb)" opacity={on} />
        <line x1={540} y1={0} x2={540} y2={170} stroke="#111" strokeWidth={4} />
        <circle cx={540} cy={200} r={34} fill={on ? "#ffe2a8" : "#2a2620"} />
        {/* small hand from the bottom */}
        <g transform={`translate(${lerp(700, 520, touch)} ${lerp(2300, 1350, touch)}) rotate(-12)`}>
          <rect x={-90} y={-60} width={180} height={700} rx={60} fill="#07070a" />
          {[-1.5, -0.5, 0.5, 1.5].map((k, i) => <rect key={i} x={k * 42 - 18} y={-180 - (1.5 - Math.abs(k)) * 30} width={36} height={190} rx={18} fill="#07070a" />)}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** 14 · «نه جن بود… نه نفرین.» the shapes we feared dissolve into dust. */
const NotJinn: React.FC<{ t: number }> = ({ t }) => {
  const j = W(14, "جن"), n = W(14, "نفرین");
  const d1 = rk(t, j + 0.15, j + 0.9), d2 = rk(t, n + 0.15, n + 0.8);
  const Word: React.FC<{ txt: string; at: number; y: number }> = ({ txt, at, y }) => {
    const a = rk(t, at - 0.1, at + 0.15, back), strike = rk(t, at + 0.2, at + 0.45, out3);
    return (
      <div style={{ position: "absolute", left: 540, top: y, transform: `translate(-50%,-50%) scale(${a})`, opacity: a > 0.01 ? 1 : 0, fontFamily: BLACK, fontSize: 120, color: C.dust, direction: "rtl", whiteSpace: "nowrap" }}>
        {txt}
        <div style={{ position: "absolute", left: -20, top: "52%", height: 14, width: `calc(${strike * 100}% + 40px)`, background: C.red, transform: "rotate(-6deg)" }} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      <Svg>
        {/* jinn: tall thin shape with eyes, breaks into dust */}
        <g opacity={1 - d1} transform={`translate(${300 + d1 * 40} 1180)`}>
          <path d="M-70 400 Q-90 0 -50 -200 Q-30 -300 0 -310 Q30 -300 50 -200 Q90 0 70 400 Z" fill="#000" stroke="rgba(236,230,216,.15)" strokeWidth={3} />
          <ellipse cx={-16} cy={-240} rx={9} ry={5} fill="#f6f1df" /><ellipse cx={16} cy={-240} rx={9} ry={5} fill="#f6f1df" />
        </g>
        {d1 > 0 && <Dust t={t * 2} n={120} seed={81} x={180} y={850} w={260} h={800} lit={(1 - d1) * 1.2 + 0.2} rise={160 * d1} size={1.4} />}
        {/* curse: an evil-eye talisman, breaks into dust */}
        <g opacity={1 - d2} transform={`translate(780 ${1200 + Math.sin(t * 2) * 10}) rotate(${Math.sin(t * 1.5) * 8})`}>
          <line x1={0} y1={-260} x2={0} y2={-110} stroke="#3a342c" strokeWidth={4} />
          <circle r={110} fill="#11161f" stroke="#5a6070" strokeWidth={6} /><ellipse rx={80} ry={46} fill="#cfd5dc" /><circle r={30} fill="#0b1830" /><circle r={12} fill="#000" />
        </g>
        {d2 > 0 && <Dust t={t * 2} n={120} seed={83} x={640} y={1050} w={280} h={400} lit={(1 - d2) * 1.2 + 0.2} rise={160 * d2} size={1.4} />}
      </Svg>
      <Word txt="جن" at={j} y={520} />
      <Word txt="نفرین" at={n} y={720} />
    </AbsoluteFill>
  );
};

/** 15 · microscope: erionite fibres — needles — drift and stab into lung tissue. */
const Micro: React.FC<{ t: number }> = ({ t }) => {
  const s = S(15) - 0.2;
  const name = rk(t, W(15, "اریونیت") - 0.1, W(15, "اریونیت") + 0.3, back);
  const tiny = rk(t, W(15, "الیافی") - 0.1, W(15, "ریز") + 0.3);
  const cancer = rk(t, W(15, "سرطان") - 0.1, W(15, "سرطان") + 0.2, back);
  const focus = 1 - rk(t, s, s + 0.6);
  const cx = 540, cy = 860, R = 420;
  const fibres = Array.from({ length: 34 }, (_, i) => {
    const a = hn(i, 91) * Math.PI, L = 120 + hn(i, 92) * 260;
    const x = cx + (hn(i, 93) - 0.5) * 700, y = cy + (hn(i, 94) - 0.5) * 600 + tiny * (t - W(15, "الیافی")) * 60 * hn(i, 95);
    return { x, y, a: a + Math.sin(t * 0.3 + i) * 0.1, L };
  });
  return (
    <AbsoluteFill style={{ background: "#030405" }}>
      <Svg>
        <defs>
          <radialGradient id="v18field"><stop offset="0" stopColor="#cfc8b8" /><stop offset="0.85" stopColor="#8e8678" /><stop offset="1" stopColor="#1a1814" /></radialGradient>
          <clipPath id="v18scope"><circle cx={cx} cy={cy} r={R} /></clipPath>
          <filter id="v18focus"><feGaussianBlur stdDeviation={focus * 8 + 0.01} /></filter>
        </defs>
        <circle cx={cx} cy={cy} r={R + 30} fill="#0e0f11" />
        <g clipPath="url(#v18scope)">
          <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill="url(#v18field)" />
          {/* lung cells at the bottom */}
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={cx - R + 30 + i * 62} cy={cy + R - 40 + Math.sin(i) * 20} r={42 + hn(i, 97) * 12} fill="rgba(170,90,80,.35)" stroke={`rgba(${lerp(140, 212, cancer)},${lerp(70, 37, cancer)},60,.8)`} strokeWidth={4} />)}
          <g filter="url(#v18focus)">
            {fibres.map((f, i) => (
              <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${(f.a * 180) / Math.PI})`}>
                <line x1={-f.L / 2} y1={0} x2={f.L / 2} y2={0} stroke="#2a251d" strokeWidth={3 + hn(i, 96) * 3} strokeLinecap="round" />
                <line x1={-f.L / 2} y1={4} x2={f.L / 2 - 20} y2={3} stroke="#3b3428" strokeWidth={2} />
              </g>
            ))}
          </g>
          <rect x={cx - R} y={cy + R - 120} width={2 * R} height={120} fill={`rgba(212,37,47,${0.35 * cancer * (0.7 + 0.3 * Math.sin(t * 8))})`} />
        </g>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#000" strokeWidth={18} />
        {/* scale bar */}
        <line x1={cx + 120} y1={cy - R + 120} x2={cx + 220} y2={cy - R + 120} stroke="#111" strokeWidth={6} />
      </Svg>
      <div style={{ position: "absolute", left: cx + 170, top: cy - R + 70, transform: "translateX(-50%)", fontFamily: FONT_TEXT, fontSize: 26, color: "#111", direction: "rtl" }}>۱۰ میکرون</div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 250, textAlign: "center", transform: `scale(${name})`, opacity: name > 0.01 ? 1 : 0 }}>
        <div style={{ fontFamily: BLACK, fontSize: 104, color: C.dust, direction: "rtl" }}>اریونیت</div>
        <div style={{ fontFamily: "Chakra Petch, monospace", fontSize: 40, letterSpacing: 10, color: C.dim }}>ERIONITE</div>
      </div>
      <Chip x={540} y={cy + R - 170} a={cancer} bg={C.red} size={48}>سرطان‌زا</Chip>
    </AbsoluteFill>
  );
};

/** 16 · back to grandma's window, from outside (user photo), a lamp glows then dies. */
const Window: React.FC<{ t: number }> = ({ t }) => {
  const glow = rk(t, S(16), S(16) + 0.5) * (1 - rk(t, W(16, "پنجره") + 0.3, E(16) + 0.4));
  return (
    <>
      <Photo src="v18/house.jpg" w={1600} h={900} t={t} t0={S(16) - 0.2} t1={E(16) + 0.4} from={[440, 330, 1.25]} to={[460, 300, 1.55]} />
      <Svg>
        <defs><radialGradient id="v18win"><stop offset="0" stopColor="rgba(233,167,78,.75)" /><stop offset="1" stopColor="rgba(233,167,78,0)" /></radialGradient></defs>
        <circle cx={325} cy={800} r={220} fill="url(#v18win)" opacity={glow * (0.8 + 0.2 * Math.sin(t * 15))} />
        <Dust t={t} n={70} seed={101} lit={0.5} rise={12} />
      </Svg>
    </>
  );
};

/** 17 · «توی دیوارهای خونه‌مون بود»: push into the stone wall (user photo); fibres glow inside the stones and the wall exhales dust. */
const InTheWalls: React.FC<{ t: number }> = ({ t }) => {
  const walls = W(17, "دیوارهای");
  const reveal = rk(t, walls - 0.2, walls + 0.8, out3);
  const fade = rk(t, V18_END - 0.6, V18_END - 0.05);
  return (
    <>
      <Photo src="v18/street.jpg" w={2560} h={1504} t={t} t0={S(17) - 0.2} t1={V18_END} from={[2120, 760, 1.05]} to={[2200, 820, 1.5]} />
      <Svg>
        <defs><filter id="v18fglow"><feGaussianBlur stdDeviation="3" /></filter></defs>
        <g opacity={reveal * 0.85} filter="url(#v18fglow)">
          {Array.from({ length: 70 }, (_, i) => {
            const x = 300 + hn(i, 111) * 780, y = 300 + hn(i, 112) * 1300, a = hn(i, 113) * 180, L = 20 + hn(i, 114) * 50;
            return <line key={i} x1={x} y1={y} x2={x + Math.cos((a * Math.PI) / 180) * L} y2={y + Math.sin((a * Math.PI) / 180) * L} stroke={C.dust} strokeWidth={2.5} opacity={0.4 + 0.6 * Math.sin(t * 3 + i)} />;
          })}
        </g>
        <Dust t={t} n={160} seed={117} lit={0.3 + 0.7 * reveal} rise={30} size={1.2} />
      </Svg>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${fade})` }} />
    </>
  );
};

type Scene = { from: number; R: React.FC<{ t: number }> };
const SCENES: Scene[] = [
  { from: 0, R: Hook },
  { from: S(1) - 0.25, R: Village },
  { from: S(2) - 0.2, R: Shutters },
  { from: S(3) - 0.2, R: GrandmaSays },
  { from: S(4) - 0.25, R: Field },
  { from: S(5) - 0.2, R: Graves },
  { from: S(6) - 0.2, R: ({ t }) => <XRay t={t} mass={rk(t, W(6, "سنگینی") - 0.3, E(6) + 0.3, out3)} squeeze={0} /> },
  { from: S(7) - 0.25, R: Bedroom },
  { from: S(8) - 0.15, R: ({ t }) => <div style={{ position: "absolute", inset: 0, transform: `translate(${shakeAt(t, W(8, "فشار"), 14, 0.7)}px,0)` }}><XRay t={t} mass={1} squeeze={rk(t, W(8, "داخل") - 0.2, W(8, "فشار") + 0.3, out3)} /></div> },
  { from: S(9) - 0.2, R: Corridor },
  { from: S(10) - 0.3, R: Awake },
  { from: S(11) - 0.2, R: Scratch },
  { from: S(12) - 0.25, R: Fingers },
  { from: S(14) - 0.3, R: NotJinn },
  { from: S(15) - 0.2, R: Micro },
  { from: S(16) - 0.2, R: Window },
  { from: S(17) - 0.2, R: InTheWalls },
];

// ---- overlay: death counter + captions + end title ------------------------------------
const deaths = (t: number) => {
  if (t < W(4, "مرد")) return 0;
  if (t < W(5, "سه")) return 1;
  if (t < W(5, "پنج")) return 1 + Math.min(3, Math.floor((t - W(5, "سه")) / 0.12) + 1);
  if (t < W(9, "برنگشت")) return 4 + Math.min(5, Math.floor((t - W(5, "پنج")) / 0.09) + 1);
  return 10;
};
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const n = deaths(t);
  if (n === 0 || t > S(10) - 0.3) return null;
  const last = [W(4, "مرد"), W(5, "سه"), W(5, "پنج"), W(9, "برنگشت")].filter((x) => x <= t).at(-1)!;
  const pop = 1 + 0.25 * (1 - rk(t, last, last + 0.4));
  return (
    <div style={{ position: "absolute", right: 60, top: 80, direction: "rtl", display: "flex", alignItems: "center", gap: 14, fontFamily: FONT_TEXT, textShadow: "0 2px 12px rgba(0,0,0,.9)" }}>
      <svg width={40} height={50} viewBox="0 0 40 50"><path d="M4 50 L4 18 Q20 -2 36 18 L36 50 Z" fill={C.red} /></svg>
      <span style={{ fontSize: 32, color: C.dust }}>مرگ‌ها</span>
      <span style={{ fontFamily: FONT_NUM, fontSize: 76, color: C.red, display: "inline-block", transform: `scale(${pop})` }}>{fa(n)}</span>
    </div>
  );
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.5) return null;
  if (cur.si === 0 || cur.si === 3 || cur.si === 14) return null; // these lines are already big on screen
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const quote = cur.si === 8;
  return (
    <div style={{ position: "absolute", left: 60, top: 1330, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.95)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        const hot = /مرد|می‌کشت|برنگشت|سرطان|اریونیت|دیوار/.test(w.w);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? (hot ? C.red : C.amber) : quote ? "#f1dcb4" : C.text, transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})` }}>{w.w}</span>;
      })}
    </div>
  );
};

const EndTitle: React.FC<{ t: number }> = ({ t }) => {
  const a = rk(t, E(17) + 0.05, E(17) + 0.45);
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1330, textAlign: "center", direction: "rtl", opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
      <div style={{ fontFamily: BLACK, fontSize: 52, color: C.dust, textShadow: "0 3px 0 #000" }}>توزکوی و کارائین · نوشهیر، ترکیه</div>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 36, color: C.dim, marginTop: 14, textShadow: "0 3px 0 #000" }}>شخصیت‌ها خیالی‌اند؛ فاجعه واقعی است.</div>
    </div>
  );
};

/** Grain + breathing vignette + rare flicker over everything. */
const Film: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={360} height={640} viewBox="0 0 360 640" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: "overlay", opacity: 0.4, imageRendering: "pixelated" }}>
      <filter id="v18g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 12} /></filter>
      <rect width={360} height={640} filter="url(#v18g)" />
    </svg>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent ${42 + 4 * Math.sin(f / 22)}%, rgba(0,0,0,.8) 100%)` }} />
    {hn(f, 9) > 0.985 && <AbsoluteFill style={{ background: "rgba(0,0,0,.35)" }} />}
  </>
);

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = SCENES.findLastIndex((s) => s.from <= t);
  const sc = SCENES[Math.max(0, i)];
  const since = t - sc.from;
  const cut = i > 0 && since < 0.12 ? 1 - since / 0.12 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.012 * Math.sin(t * 0.6)}) translate(${Math.sin(t * 1.3) * 3}px, ${Math.cos(t * 1.1) * 3}px)` }}>
        <sc.R t={t} />
      </AbsoluteFill>
      <Film f={f} />
      <Counter t={t} />
      <Captions t={t} />
      <EndTitle t={t} />
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V18_LOOK = [0.3, 1.5, 4.0, 5.6, 8.6, 11.5, 15.3, 17.6, 20.9, 24.8, 27.4, 30.2, 32.0, 33.6, 36.0, 39.5, 40.8, 42.0, 43.9, 46.4, 47.4, 49.8, 51.6, 53.5, 57.6, 59.2];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V18_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V18: React.FC = () => (
  <>
    <Composition id="V18" component={Video} durationInFrames={V18_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v18/mix.wav" }} />
    <Composition id="V18-Silent" component={Video} durationInFrames={V18_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V18-Look" component={Look} durationInFrames={V18_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
