// V03 · reusable set pieces: skyline, moon, window, couch, clock, door, perspective corridor, building facade.
import React from "react";
import { C, Glow, noise, rng, W } from "./lib";

export const Sky: React.FC<{ id: string; top?: string; bot?: string; x?: number; y?: number; w?: number; h?: number }> = ({ id, top = "#0b1530", bot = "#2a3d62", x = 0, y = 0, w = W, h = 1920 }) => (
  <>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </>
);

export const Moon: React.FC<{ id: string; x: number; y: number; r: number; t: number }> = ({ id, x, y, r, t }) => (
  <g>
    <Glow id={`${id}g`} cx={x} cy={y} r={r * 4} color={C.moon} o={0.45} />
    <circle cx={x} cy={y} r={r} fill="#dfe8f5" />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#c3cfe0" />
    <circle cx={x + r * 0.35} cy={y + r * 0.3} r={r * 0.12} fill="#c8d3e3" />
    {/* drifting cloud band across the moon */}
    <g opacity={0.75} transform={`translate(${(t * 14) % 600 - 300} 0)`}>
      <ellipse cx={x} cy={y + r * 0.4} rx={r * 2.6} ry={r * 0.28} fill="#1d2b49" />
      <ellipse cx={x + r * 1.2} cy={y + r * 0.15} rx={r * 1.4} ry={r * 0.2} fill="#22304f" />
    </g>
  </g>
);

// city skyline strip with a few lit windows that blink off one by one
export const Skyline: React.FC<{ x: number; y: number; w: number; h: number; t: number; seed?: number; fill?: string; lit?: string; dark?: number }> = ({ x, y, w, h, t, seed = 3, fill = "#060a14", lit = "#ffd79a", dark = 0 }) => {
  const r = rng(seed);
  const bs: { bx: number; bw: number; bh: number }[] = [];
  for (let cx = x - 20; cx < x + w; ) { const bw = 40 + r() * 90; bs.push({ bx: cx, bw, bh: h * (0.35 + r() * 0.65) }); cx += bw + 4 + r() * 10; }
  return (
    <g>
      {bs.map((b, i) => (
        <g key={i}>
          <rect x={b.bx} y={y + h - b.bh} width={b.bw} height={b.bh + 2} fill={fill} />
          {i % 3 === 0 && <rect x={b.bx + b.bw / 2 - 1} y={y + h - b.bh - 30} width={2} height={30} fill={fill} />}
          {Array.from({ length: Math.floor(b.bh / 26) * Math.floor(b.bw / 22) }, (_, k) => {
            const cols = Math.floor(b.bw / 22), cx = b.bx + 8 + (k % cols) * 22, cy = y + h - b.bh + 12 + Math.floor(k / cols) * 26;
            const on = r() < 0.16 && r() > dark;
            return on ? <rect key={k} x={cx} y={cy} width={9} height={12} fill={lit} opacity={0.55 + 0.4 * Math.abs(noise(t * 0.4 + k, i))} /> : null;
          })}
        </g>
      ))}
    </g>
  );
};

export const Couch: React.FC<{ x: number; y: number; w: number; fill?: string; rim?: string }> = ({ x, y, w, fill = "#0a1120", rim = "#3b5584" }) => (
  <g>
    {/* back */}
    <rect x={x + 40} y={y - 200} width={w - 80} height={230} rx={40} fill={fill} />
    <path d={`M${x + 70},${y - 196} L${x + w - 70},${y - 196}`} stroke={rim} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
    {/* seat */}
    <rect x={x + 30} y={y} width={w - 60} height={120} rx={22} fill={fill} />
    <path d={`M${x + 60},${y + 4} L${x + w - 60},${y + 4}`} stroke={rim} strokeWidth={3} opacity={0.45} />
    {/* arms */}
    <rect x={x} y={y - 80} width={90} height={210} rx={40} fill={fill} />
    <rect x={x + w - 90} y={y - 80} width={90} height={210} rx={40} fill={fill} />
    <path d={`M${x + 20},${y - 76} Q${x + 45},${y - 84} ${x + 70},${y - 76}`} stroke={rim} strokeWidth={4} fill="none" opacity={0.7} />
    <path d={`M${x + w - 70},${y - 76} Q${x + w - 45},${y - 84} ${x + w - 20},${y - 76}`} stroke={rim} strokeWidth={4} fill="none" opacity={0.7} />
    {/* legs */}
    {[x + 40, x + w - 56].map((lx) => <rect key={lx} x={lx} y={y + 118} width={16} height={34} fill={fill} />)}
  </g>
);

// analogue wall clock; time in hours (e.g. 23.97)
export const Clock: React.FC<{ x: number; y: number; r: number; hours: number; sec: number; face?: string; ink?: string }> = ({ x, y, r, hours, sec, face = "#c9d3e2", ink = "#05070c" }) => {
  const hA = (hours % 12) * 30, mA = (hours * 60) % 60 * 6, sA = sec * 6;
  const Hand = ({ a, l, w, back = 0.15 }: { a: number; l: number; w: number; back?: number }) => (
    <g transform={`rotate(${a} ${x} ${y})`}>
      <path d={`M${x - w / 2},${y + r * back} L${x - w / 4},${y - l} L${x + w / 4},${y - l} L${x + w / 2},${y + r * back} Z`} fill={ink} />
    </g>
  );
  return (
    <g>
      <circle cx={x + r * 0.06} cy={y + r * 0.08} r={r * 1.08} fill="#000" opacity={0.45} />
      <circle cx={x} cy={y} r={r * 1.08} fill={ink} />
      <circle cx={x} cy={y} r={r} fill={face} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0, a = (i * 6 * Math.PI) / 180, r0 = r * (big ? 0.8 : 0.88), r1 = r * 0.94;
        return <line key={i} x1={x + Math.sin(a) * r0} y1={y - Math.cos(a) * r0} x2={x + Math.sin(a) * r1} y2={y - Math.cos(a) * r1} stroke={ink} strokeWidth={big ? r * 0.035 : r * 0.012} />;
      })}
      {/* hand shadows */}
      <g opacity={0.25} transform={`translate(${r * 0.03} ${r * 0.04})`}><Hand a={hA} l={r * 0.5} w={r * 0.07} /><Hand a={mA} l={r * 0.74} w={r * 0.05} /></g>
      <Hand a={hA} l={r * 0.5} w={r * 0.07} />
      <Hand a={mA} l={r * 0.74} w={r * 0.05} />
      <g transform={`rotate(${sA} ${x} ${y})`}>
        <line x1={x} y1={y + r * 0.2} x2={x} y2={y - r * 0.84} stroke={C.red} strokeWidth={r * 0.014} />
      </g>
      <circle cx={x} cy={y} r={r * 0.04} fill={ink} />
    </g>
  );
};

// a flat front door (panels, knob, deadbolt, chain, peephole)
export const Door: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; line?: string; peep?: number }> = ({ x, y, w, h, fill = "#121c30", line = "#0a1120", peep = 0.4 }) => (
  <g>
    <rect x={x - 18} y={y - 18} width={w + 36} height={h + 18} fill="#070b14" />
    <rect x={x} y={y} width={w} height={h} fill={fill} />
    {[[0.12, 0.08, 0.76, 0.36], [0.12, 0.52, 0.76, 0.4]].map(([a, b, c, d], i) => (
      <rect key={i} x={x + w * a} y={y + h * b} width={w * c} height={h * d} fill="none" stroke={line} strokeWidth={8} />
    ))}
    <circle cx={x + w / 2} cy={y + h * 0.26} r={9} fill="#05070c" />
    <circle cx={x + w / 2} cy={y + h * 0.26} r={5} fill={C.moon} opacity={peep} />
    <circle cx={x + w * 0.86} cy={y + h * 0.5} r={16} fill="#05070c" />
    <rect x={x + w * 0.83} y={y + h * 0.43} width={30} height={16} rx={4} fill="#05070c" />
    <path d={`M${x + w * 0.86},${y + h * 0.39} q-40,30 -6,62`} stroke="#05070c" strokeWidth={5} fill="none" strokeDasharray="7 4" />
  </g>
);

// one-point perspective corridor. Returns the shell; children are drawn inside (in front of the far wall).
export const Corridor: React.FC<{ id: string; vx: number; vy: number; fw: number; fh: number; wall?: string; floor?: string; ceil?: string; doors?: number; light?: string; lightK?: number; children?: React.ReactNode }> = ({ id, vx, vy, fw, fh, wall = "#0d1526", floor = "#070b14", ceil = "#060912", doors = 3, light = C.red, lightK = 1, children }) => {
  const L = vx - fw / 2, R = vx + fw / 2, T = vy - fh / 2, B = vy + fh / 2;
  const lerpX = (edge: number, k: number) => edge + ((edge < vx ? 0 : W) - edge) * k; // toward the frame edge
  const doorsL = Array.from({ length: doors }, (_, i) => i);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}fl`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor={floor} /></linearGradient>
        <linearGradient id={`${id}wl`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor={wall} /></linearGradient>
        <linearGradient id={`${id}wr`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor={wall} /></linearGradient>
      </defs>
      <polygon points={`0,0 ${L},${T} ${L},${B} 0,1920`} fill={`url(#${id}wl)`} />
      <polygon points={`${W},0 ${R},${T} ${R},${B} ${W},1920`} fill={`url(#${id}wr)`} />
      <polygon points={`0,0 ${W},0 ${R},${T} ${L},${T}`} fill={ceil} />
      <polygon points={`0,1920 ${W},1920 ${R},${B} ${L},${B}`} fill={`url(#${id}fl)`} />
      <rect x={L} y={T} width={fw} height={fh} fill={wall} />
      {/* doors along both walls (perspective trapezoids) */}
      {doorsL.map((i) => {
        const k0 = 0.12 + i * 0.26, k1 = k0 + 0.12;
        const side = (edge: number, sgn: number) => {
          const x0 = lerpX(edge, k0), x1 = lerpX(edge, k1);
          const yT = (k: number) => T + (0 - T) * k * 0.62 + (1 - k) * fh * 0.08, yB = (k: number) => B + (1920 - B) * k;
          return <polygon key={sgn} points={`${x0},${yT(k0)} ${x1},${yT(k1)} ${x1},${yB(k1)} ${x0},${yB(k0)}`} fill="#04070d" opacity={0.85} />;
        };
        return <g key={i}>{side(L, -1)}{side(R, 1)}</g>;
      })}
      {/* exit light at the far end */}
      <rect x={vx - 40} y={T + 26} width={80} height={30} rx={4} fill={light} opacity={0.9 * lightK} />
      <Glow id={`${id}ex`} cx={vx} cy={T + 40} r={260} color={light} o={0.55 * lightK} />
      <Glow id={`${id}exf`} cx={vx} cy={B + 60} r={300} color={light} o={0.25 * lightK} sy={0.25} />
      {children}
    </g>
  );
};

// apartment building facade, 4 floors × 3 windows. win(i) returns {lit, color} for each window index (0 = top-left).
export const Building: React.FC<{ x: number; y: number; w: number; h: number; t: number; win?: (i: number) => { lit: number; color?: string; who?: boolean } }> = ({ x, y, w, h, t, win = () => ({ lit: 0 } as { lit: number; color?: string; who?: boolean }) }) => {
  const floors = 4, cols = 3, fh = h / (floors + 0.4), ww = w * 0.18, wh = fh * 0.5;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0b1222" />
      <rect x={x - 14} y={y - 16} width={w + 28} height={24} fill="#070b16" />
      {Array.from({ length: floors * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const wx = x + w * (0.13 + c * 0.29), wy = y + fh * 0.3 + r * fh;
        const s = win(i);
        return (
          <g key={i}>
            <rect x={wx - 8} y={wy - 8} width={ww + 16} height={wh + 22} fill="#060a14" />
            <rect x={wx} y={wy} width={ww} height={wh} fill={s.lit > 0 ? s.color ?? "#9cc7ff" : "#0f1830"} opacity={s.lit > 0 ? 0.25 + 0.75 * s.lit : 1} />
            {s.who && <g transform={`translate(${wx + ww / 2} ${wy + wh + 4}) scale(0.16)`} fill="#05070c"><ellipse cx={0} cy={-560} rx={44} ry={54} /><path d="M-80,-470 C-80,-500 80,-500 80,-470 L90,0 L-90,0 Z" /></g>}
            <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#060a14" strokeWidth={6} />
            <line x1={wx} y1={wy + wh * 0.45} x2={wx + ww} y2={wy + wh * 0.45} stroke="#060a14" strokeWidth={6} />
            <rect x={wx - 14} y={wy + wh + 8} width={ww + 28} height={10} fill="#070b16" />
            {s.lit > 0 && <Glow id={`bw${i}`} cx={wx + ww / 2} cy={wy + wh / 2} r={ww * 1.2} color={s.color ?? "#9cc7ff"} o={0.35 * s.lit} />}
          </g>
        );
      })}
      <rect x={x + w * 0.42} y={y + h - fh * 0.62} width={w * 0.16} height={fh * 0.62} fill="#04070d" />
    </g>
  );
};
