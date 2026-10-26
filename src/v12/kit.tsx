// V12 «نقشه‌ی شب» — kit: palette, timing helpers, and SVG props (satellite, phone, car, pin, wifi, tower, earth, clock).
import React from "react";
import wordsJson from "./words.json";

export type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const FIX: Record<string, string> = { "دقیقا": "دقیقاً", "احتمالا": "احتمالاً" };
export const words = (wordsJson as Word[]).map((w) => ({ ...w, w: w.w.replace(/^(دقیقا|احتمالا)/, (m) => FIX[m]) }));

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// one family: night navy + electric blue, white text, lime accent for «you» and key facts, red only for errors
export const C = {
  bg: "#060A17", bg2: "#0B1330", block: "#0F1A3D", street: "#1D3270", streetHi: "#3D7BFF", glow: "#5EA8FF",
  ink: "#EAF2FF", dim: "#8EA3CF", lime: "#C6FF3D", red: "#FF4D6A", water: "#123A7A", park: "#0E2A3A",
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const backOut = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** pop-in 0→1 with overshoot starting at t0 */
export const pop = (T: number, t0: number, d = 0.35) => backOut(prog(T, t0, t0 + d));
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const faNum = (n: number, dec = 0) => fa((dec ? n.toFixed(dec) : Math.round(n).toLocaleString("en-US")).replace(/,/g, "٬").replace(".", "٫"));

const bare = (x: string) => x.replace(/[،؛.؟!…«»:]/g, "");
/** onset of a word in line si (occ = 0-based occurrence) */
export const wd = (si: number, word: string, occ = 0) => {
  const ws = words.filter((x) => x.si === si);
  const hits = ws.filter((x) => bare(x.w) === word);
  const w = hits[occ] ?? ws.filter((x) => x.w.includes(word))[occ];
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
export const segStart = (si: number) => words.find((w) => w.si === si)!.s;
export const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;

export const FONT = { black: "V12Black", bold: "V12Bold", num: "V12Num" };

// ───────── props ─────────
export const Satellite: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: number; color?: string }> = ({ x, y, s = 1, rot = 0, glow = 0.6, color = C.glow }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={60} fill={color} opacity={0.12 * glow} />
    <rect x={-74} y={-16} width={48} height={32} rx={3} fill="#1B3D8F" stroke={color} strokeWidth={2.5} />
    <rect x={26} y={-16} width={48} height={32} rx={3} fill="#1B3D8F" stroke={color} strokeWidth={2.5} />
    {[-62, -50, -38, 38, 50, 62].map((lx) => <line key={lx} x1={lx} y1={-16} x2={lx} y2={16} stroke={color} strokeWidth={1.2} opacity={0.7} />)}
    <line x1={-26} y1={0} x2={-16} y2={0} stroke={C.ink} strokeWidth={3} />
    <line x1={16} y1={0} x2={26} y2={0} stroke={C.ink} strokeWidth={3} />
    <rect x={-16} y={-20} width={32} height={40} rx={6} fill="#D9E4FF" />
    <rect x={-10} y={-12} width={20} height={6} rx={2} fill={C.streetHi} />
    <path d="M0 20 L0 32 M-9 38 Q0 28 9 38" stroke={C.ink} strokeWidth={3} fill="none" />
  </g>
);

export const Phone: React.FC<{ x: number; y: number; w?: number; h?: number; children?: React.ReactNode; rot?: number }> = ({ x, y, w = 420, h = 860, children, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={70} fill="#11182E" stroke="#4A5C8C" strokeWidth={3} />
    <clipPath id={`ph${w}${h}${Math.round(x)}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={56} /></clipPath>
    <g clipPath={`url(#ph${w}${h}${Math.round(x)})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={C.bg2} />
      {children}
    </g>
    <rect x={-60} y={-h / 2 + 14} width={120} height={30} rx={15} fill="#05070F" />
  </g>
);

export const Car: React.FC<{ x: number; y: number; rot?: number; s?: number; color?: string; lights?: number }> = ({ x, y, rot = 0, s = 1, color = C.ink, lights = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {lights > 0 && <path d="M28 -10 L120 -40 L120 40 L28 10 Z" fill={`rgba(255,240,190,${0.18 * lights})`} />}
    <rect x={-34} y={-19} width={68} height={38} rx={12} fill={color} />
    <rect x={-8} y={-15} width={24} height={30} rx={5} fill="#2A3B66" />
    <rect x={-28} y={-14} width={12} height={28} rx={4} fill="#2A3B66" />
    <rect x={26} y={-15} width={6} height={8} rx={2} fill="#FFF3B0" />
    <rect x={26} y={7} width={6} height={8} rx={2} fill="#FFF3B0" />
  </g>
);

export const Pin: React.FC<{ x: number; y: number; s?: number; color?: string; pulse?: number; label?: string }> = ({ x, y, s = 1, color = C.lime, pulse = 0, label }) => (
  <g transform={`translate(${x} ${y})`}>
    {pulse > 0 && <circle r={30 + pulse * 70} fill="none" stroke={color} strokeWidth={4} opacity={1 - pulse} />}
    <ellipse cx={0} cy={4} rx={16 * s} ry={6 * s} fill="rgba(0,0,0,0.45)" />
    <g transform={`scale(${s})`}>
      <path d="M0 0 C-10 -18 -34 -36 -34 -62 A34 34 0 1 1 34 -62 C34 -36 10 -18 0 0 Z" fill={color} />
      <circle cx={0} cy={-62} r={13} fill={C.bg} />
    </g>
    {label && <text x={0} y={-118 * s} textAnchor="middle" fontFamily={FONT.black} fontSize={44} fill={color} style={{ direction: "rtl" }}>{label}</text>}
  </g>
);

export const WifiIcon: React.FC<{ x: number; y: number; s?: number; color?: string; a?: number; lock?: boolean }> = ({ x, y, s = 1, color = C.glow, a = 1, lock }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
    {[46, 32, 18].map((r, i) => <path key={r} d={`M${-r} ${-r * 0.2} A${r} ${r} 0 0 1 ${r} ${-r * 0.2}`} transform={`translate(0 ${-4 + i * 2})`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />)}
    <circle cx={0} cy={10} r={7} fill={color} />
    {lock && (
      <g transform="translate(34 18)">
        <rect x={-14} y={-4} width={28} height={22} rx={5} fill={C.ink} />
        <path d="M-8 -4 V-11 A8 8 0 0 1 8 -11 V-4" stroke={C.ink} strokeWidth={5} fill="none" />
      </g>
    )}
  </g>
);

export const Tower: React.FC<{ x: number; y: number; s?: number; ring?: number }> = ({ x, y, s = 1, ring = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 0.33, 0.66].map((o, i) => { const q = (ring + o) % 1; return <circle key={i} cy={-110} r={20 + q * 120} fill="none" stroke={C.glow} strokeWidth={3} opacity={(1 - q) * 0.7} />; })}
    <path d="M-34 0 L0 -110 L34 0 M-22 -40 L22 -40 M-12 -75 L12 -75 M-26 -40 L12 -75 M26 -40 L-12 -75" stroke={C.ink} strokeWidth={5} fill="none" strokeLinejoin="round" />
    <circle cy={-114} r={9} fill={C.lime} />
  </g>
);

// rough continent blobs [lon, lat, half-width°, half-height°] — enough to read as Earth at a glance
const LAND: [number, number, number, number][] = [
  [20, 5, 22, 32], [15, 50, 22, 11], [85, 48, 55, 20], [78, 20, 10, 12], [105, 12, 12, 10], [135, -25, 19, 11], [-100, 48, 33, 20],
  [-88, 18, 9, 9], [-60, -15, 16, 28], [-42, 72, 14, 8], [45, 23, 10, 10], [120, 62, 30, 10], [-75, 60, 20, 10], [0, -82, 180, 6],
];
const isLand = (lon: number, lat: number) => LAND.some(([x, y, w, h]) => { const dx = ((lon - x + 540) % 360) - 180; return (dx / w) ** 2 + ((lat - y) / h) ** 2 < 1; });
/** stylised dotted globe: land dots bright, sea dots faint, a soft shade */
export const Earth: React.FC<{ x: number; y: number; r: number; spin?: number }> = ({ x, y, r, spin = 0 }) => {
  const dots: React.ReactNode[] = [];
  const step = 4.5;
  for (let lat = -86; lat <= 86; lat += step) {
    const n = Math.max(4, Math.round((360 / step) * Math.cos((lat * Math.PI) / 180)));
    for (let k = 0; k < n; k++) {
      const lon0 = (k / n) * 360;
      const L = (((lon0 + spin) % 360) * Math.PI) / 180, P = (lat * Math.PI) / 180;
      const z = Math.cos(P) * Math.cos(L);
      if (z < 0.02) continue;
      const land = isLand(lon0 - 180, lat);
      if (!land && (k + Math.round(lat)) % 2) continue;
      dots.push(<circle key={`${lat}_${k}`} cx={x + r * Math.cos(P) * Math.sin(L)} cy={y - r * Math.sin(P)} r={r * (land ? 0.0115 : 0.006) * (0.55 + 0.45 * z)} fill={land ? C.glow : "#2B4A9C"} opacity={(land ? 0.45 : 0.3) + 0.55 * z} />);
    }
  }
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.12} fill={C.glow} opacity={0.08} />
      <circle cx={x} cy={y} r={r} fill="#0A1840" stroke={C.glow} strokeWidth={3} opacity={0.95} />
      {dots}
      <circle cx={x} cy={y} r={r} fill="url(#v12shade)" />
    </g>
  );
};

export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="v12shade" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
      <stop offset="60%" stopColor="rgba(0,0,0,0)" />
      <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
    </radialGradient>
    <filter id="v12glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

export const Clock: React.FC<{ x: number; y: number; r: number; t: number; color?: string; label?: string }> = ({ x, y, r, t, color = C.ink, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={C.bg2} stroke={color} strokeWidth={6} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.sin(a) * r * 0.82} y1={-Math.cos(a) * r * 0.82} x2={Math.sin(a) * r * 0.93} y2={-Math.cos(a) * r * 0.93} stroke={color} strokeWidth={i % 3 ? 3 : 6} />; })}
    <line x1={0} y1={0} x2={Math.sin(t * 0.1) * r * 0.5} y2={-Math.cos(t * 0.1) * r * 0.5} stroke={color} strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(t) * r * 0.78} y2={-Math.cos(t) * r * 0.78} stroke={C.lime} strokeWidth={4} strokeLinecap="round" />
    <circle r={8} fill={C.lime} />
    {label && <text y={r + 70} textAnchor="middle" fontFamily={FONT.black} fontSize={46} fill={color} style={{ direction: "rtl" }}>{label}</text>}
  </g>
);

/** RTL label box in SVG space */
export const Tag: React.FC<{ x: number; y: number; text: string; a?: number; s?: number; bg?: string; fg?: string; size?: number }> = ({ x, y, text, a = 1, s = 1, bg = "rgba(10,18,45,0.9)", fg = C.ink, size = 44 }) => {
  const w = text.length * size * 0.56 + 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.75} rx={size * 0.5} fill={bg} stroke={fg === C.ink ? C.streetHi : fg} strokeWidth={3} />
      <text x={0} y={size * 0.28} textAnchor="middle" fontFamily={FONT.black} fontSize={size} fill={fg} style={{ direction: "rtl" }}>{text}</text>
    </g>
  );
};
