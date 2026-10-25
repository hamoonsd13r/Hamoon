// Video 08 «مهمون‌پرون» — own palette + vector cast (guests, sofa, room props). Receipt-UI family, warm night look.
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_TEXT } from "../fonts";
import { rnd } from "../styles/receipt-ui/theme";

export const EMOJI = "'Noto Color Emoji', 'Segoe UI Emoji'";
export const FA_UI: React.CSSProperties = { fontFamily: FONT_TEXT, direction: "rtl" };

export type Mode = "night" | "day";
/** night = plum living room lit by an amber lamp · day = warm cream */
export const P = {
  night: { bg: "#17121f", bg2: "#241a33", grid: "rgba(255,214,150,.035)", card: "#251c33", line: "rgba(255,220,170,.10)", text: "#fbf1e4", sub: "#8f8399", shadow: "0 30px 70px rgba(0,0,0,.55), 0 6px 18px rgba(0,0,0,.35)" },
  day: { bg: "#f6eee2", bg2: "#efe2cf", grid: "rgba(90,50,10,.04)", card: "#fffaf3", line: "rgba(90,50,10,.10)", text: "#2a1d14", sub: "#a39282", shadow: "0 30px 70px rgba(90,50,10,.14), 0 6px 18px rgba(90,50,10,.08)" },
};
export const K = {
  amber: "#ffb547",
  amberSoft: "rgba(255,181,71,.18)",
  red: "#ff5a6a",
  redSoft: "rgba(255,90,106,.16)",
  mint: "#3fd3a0",
  ice: "#8fd8ff",
  plum: "#6b4a8f",
  wood: "#7a4a2c",
};

/** Night/day backdrop: soft radial lamp glow, faint grid, drifting dust motes / stars. */
export const Room: React.FC<{ mode: Mode; f: number; dim?: number; cold?: number }> = ({ mode, f, dim = 0, cold = 0 }) => {
  const p = P[mode];
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id={`lamp-${mode}`} cx="50%" cy="52%" r="70%">
            <stop offset="0" stopColor={mode === "night" ? "#3a2650" : "#fff6e6"} />
            <stop offset="1" stopColor={p.bg} />
          </radialGradient>
          <pattern id={`g8-${mode}`} width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0 L0 0 0 48" fill="none" stroke={p.grid} strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill={`url(#lamp-${mode})`} />
        <rect width={1080} height={1920} fill={`url(#g8-${mode})`} />
        {Array.from({ length: 30 }, (_, i) => {
          const d = 0.4 + rnd(i * 5) * 0.9;
          const x = rnd(i) * 1080 + Math.sin(f / 50 + i) * 20 * d;
          const y = ((rnd(i + 70) * 1920 - f * 0.6 * d) % 1920 + 1920) % 1920;
          const a = (0.08 + 0.14 * d) * (0.6 + 0.4 * Math.sin(f / 14 + i));
          return i % 4 === 0
            ? <path key={i} d={`M${x} ${y - 6} L${x + 2} ${y - 2} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 2} Z`} fill={mode === "night" ? `rgba(255,200,120,${a * 1.4})` : `rgba(160,110,60,${a})`} />
            : <circle key={i} cx={x} cy={y} r={2 + d * 2.5} fill={mode === "night" ? `rgba(255,214,160,${a})` : `rgba(140,100,60,${a})`} />;
        })}
      </svg>
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(6,4,12,${dim})` }} />}
      {cold > 0 && <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(143,216,255,${0.28 * cold}), rgba(220,245,255,${0.18 * cold}))` }} />}
    </AbsoluteFill>
  );
};

/* ───────── cast ───────── */
export type GuestLook = { body: string; skin: string; hair: "scarf" | "bald" | "spiky" | "bun" | "kid" | "curly"; hairCol: string; mustache?: boolean; glasses?: boolean };
export const CAST: GuestLook[] = [
  { body: "#c0504d", skin: "#e8c09a", hair: "scarf", hairCol: "#3b5b8c" }, // khaleh
  { body: "#4c6b8a", skin: "#d9a882", hair: "bald", hairCol: "#3a2a20", mustache: true, glasses: true }, // amoo
  { body: "#d79a3a", skin: "#f0caa5", hair: "bun", hairCol: "#e9e4dc", glasses: true }, // mamanbozorg
  { body: "#5b8a5b", skin: "#e2b48e", hair: "spiky", hairCol: "#2a1d14" }, // pesar khaleh
  { body: "#9a5fb5", skin: "#f0c8a0", hair: "kid", hairCol: "#4a2a18" }, // bacheh
  { body: "#3c8d9a", skin: "#d8a47c", hair: "curly", hairCol: "#2a1a10" }, // dokhtar amoo
];

/**
 * Seated/standing guest, origin = seat (bottom-centre of the body). Drawn ~ 230px tall at s=1.
 * eyes: "open" | "glow" (lights off) | "shiver" | "wide" | "sleepy" · item: fruit / tea / phone / key / none.
 */
export const Guest: React.FC<{
  x: number; y: number; s?: number; look: GuestLook; f: number; seed?: number;
  eyes?: "open" | "glow" | "wide" | "sleepy" | "happy"; mouth?: "chew" | "smile" | "o" | "talk" | "flat"; item?: "fruit" | "tea" | "icetea" | "key" | "none";
  shiver?: number; blanket?: number; turn?: number; bob?: number;
}> = ({ x, y, s = 1, look, f, seed = 0, eyes = "open", mouth = "smile", item = "none", shiver = 0, blanket = 0, turn = 0, bob = 1 }) => {
  const kid = look.hair === "kid";
  const sc = kid ? 0.78 : 1;
  const b = Math.sin(f / 9 + seed) * 3 * bob;
  const sh = shiver > 0 ? Math.sin(f * 2.3 + seed) * 3 * shiver : 0;
  const hy = -150;
  const chew = mouth === "chew" ? Math.abs(Math.sin(f / 3 + seed)) : 0;
  const talk = mouth === "talk" ? Math.abs(Math.sin(f / 2.2 + seed)) : 0;
  const ex = turn * 9;
  const blink = (Math.floor(f / 3) + seed * 7) % 41 === 0;
  return (
    <g transform={`translate(${x + sh} ${y + b}) scale(${s * sc})`}>
      <ellipse cx={0} cy={4} rx={66} ry={10} fill="rgba(0,0,0,.22)" />
      {/* body */}
      <path d="M-58 0 L-52 -78 Q-46 -112 0 -114 Q46 -112 52 -78 L58 0 Z" fill={look.body} />
      <path d="M-20 -112 Q0 -98 20 -112" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={5} />
      {/* head */}
      <g transform={`translate(0 ${hy}) rotate(${turn * 6})`}>
        {look.hair === "scarf" && <path d="M-50 10 Q-56 -50 0 -54 Q56 -50 50 10 L40 34 Q0 48 -40 34 Z" fill={look.hairCol} />}
        <circle r={40} fill={look.skin} />
        {look.hair === "bald" && <path d="M-40 -2 Q-42 -20 -34 -24 L-34 -6 Z M40 -2 Q42 -20 34 -24 L34 -6 Z" fill={look.hairCol} />}
        {look.hair === "spiky" && <path d="M-40 -8 L-36 -40 L-22 -30 L-14 -50 L0 -34 L12 -52 L22 -32 L36 -44 L40 -8 Q20 -22 -40 -8 Z" fill={look.hairCol} />}
        {look.hair === "bun" && <><circle cy={-44} r={18} fill={look.hairCol} /><path d="M-41 -2 Q-40 -42 0 -42 Q40 -42 41 -2 Q20 -24 -41 -2 Z" fill={look.hairCol} /></>}
        {look.hair === "kid" && <path d="M-41 -4 Q-38 -44 0 -42 Q38 -44 41 -4 Q30 -18 10 -14 Q-6 -26 -41 -4 Z" fill={look.hairCol} />}
        {look.hair === "curly" && Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return <circle key={i} cx={Math.cos(a) * 38} cy={Math.sin(a) * 36 - 2} r={13} fill={look.hairCol} />; })}
        {look.hair === "scarf" && <path d="M-40 -12 Q0 -58 40 -12 Q30 -40 0 -42 Q-30 -40 -40 -12 Z" fill={look.hairCol} />}
        {/* eyes */}
        {eyes === "glow" ? (
          <g>
            <circle cx={-14 + ex} cy={-2} r={9} fill={K.amber} opacity={0.35} /><circle cx={14 + ex} cy={-2} r={9} fill={K.amber} opacity={0.35} />
            <circle cx={-14 + ex} cy={-2} r={4.5} fill="#fff6d8" /><circle cx={14 + ex} cy={-2} r={4.5} fill="#fff6d8" />
          </g>
        ) : eyes === "sleepy" || blink ? (
          <path d={`M${-20 + ex} -2 h12 M${8 + ex} -2 h12`} stroke="#2a1d14" strokeWidth={4} strokeLinecap="round" />
        ) : eyes === "happy" ? (
          <path d={`M${-21 + ex} 0 q7 -9 14 0 M${7 + ex} 0 q7 -9 14 0`} stroke="#2a1d14" strokeWidth={4} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <circle cx={-14 + ex} cy={-2} r={eyes === "wide" ? 8 : 5} fill={eyes === "wide" ? "#fff" : "#2a1d14"} />
            <circle cx={14 + ex} cy={-2} r={eyes === "wide" ? 8 : 5} fill={eyes === "wide" ? "#fff" : "#2a1d14"} />
            {eyes === "wide" && <><circle cx={-14 + ex} cy={-2} r={3.5} fill="#2a1d14" /><circle cx={14 + ex} cy={-2} r={3.5} fill="#2a1d14" /></>}
          </g>
        )}
        {look.glasses && eyes !== "glow" && <g fill="none" stroke="#2a1d14" strokeWidth={3}><circle cx={-14 + ex} cy={-2} r={12} /><circle cx={14 + ex} cy={-2} r={12} /><path d={`M${-2 + ex} -2 h4`} /></g>}
        {look.mustache && <path d={`M${-18 + ex} 14 Q${ex} 6 ${18 + ex} 14 Q${ex} 22 ${-18 + ex} 14 Z`} fill={look.hairCol} />}
        {/* mouth */}
        {mouth === "o" ? <ellipse cx={ex} cy={22} rx={7} ry={9} fill="#5a1e1e" />
          : mouth === "talk" || mouth === "chew" ? <ellipse cx={ex} cy={21} rx={9} ry={2 + 7 * (talk + chew)} fill="#5a1e1e" />
          : mouth === "flat" ? <path d={`M${-9 + ex} 22 h18`} stroke="#5a1e1e" strokeWidth={4} strokeLinecap="round" />
          : <path d={`M${-12 + ex} 18 Q${ex} 30 ${12 + ex} 18`} stroke="#5a1e1e" strokeWidth={4} fill="none" strokeLinecap="round" />}
        {chew > 0.6 && <circle cx={22 + ex} cy={14} r={6} fill="rgba(255,120,120,.4)" />}
      </g>
      {/* hands + item */}
      <circle cx={-34} cy={-46} r={13} fill={look.skin} />
      <g transform="translate(34 -54)">
        <circle r={13} fill={look.skin} />
        {item === "fruit" && <g transform="translate(0 -18)"><circle r={16} fill="#e0443a" /><path d="M0 -14 q4 -10 12 -10" stroke="#2f7a34" strokeWidth={4} fill="none" /><circle cx={-5} cy={-4} r={4} fill="rgba(255,255,255,.5)" /></g>}
        {(item === "tea" || item === "icetea") && (
          <g transform="translate(0 -26)">
            <path d="M-12 -18 L12 -18 L9 16 L-9 16 Z" fill={item === "icetea" ? "#c9a46b" : "#b5521f"} stroke="rgba(255,255,255,.7)" strokeWidth={2.5} />
            {item === "icetea" && <><rect x={-8} y={-16} width={9} height={9} rx={2} fill="#e6f8ff" transform="rotate(14)" /><rect x={0} y={-8} width={8} height={8} rx={2} fill="#e6f8ff" transform="rotate(-10)" /></>}
            <ellipse cx={0} cy={18} rx={16} ry={4} fill="#d9d2c4" />
          </g>
        )}
        {item === "key" && <g transform="translate(-6 -22) rotate(-30)"><circle r={10} fill="none" stroke={K.amber} strokeWidth={5} /><path d="M10 0 h24 M28 0 v8 M22 0 v6" stroke={K.amber} strokeWidth={5} /></g>}
      </g>
      {blanket > 0 && <path d={`M-66 ${8} L-60 ${-120 * blanket} Q0 ${-140 * blanket} 60 ${-120 * blanket} L66 8 Z`} fill="#c94f6d" stroke="#8c2f49" strokeWidth={4} opacity={Math.min(1, blanket * 3)} />}
      {blanket > 0.5 && <path d="M-50 -60 l100 0 M-52 -30 l104 0" stroke="#f0b0c0" strokeWidth={5} strokeDasharray="12 10" opacity={blanket} />}
    </g>
  );
};

/** Persian-style sofa (three-seater), origin = seat centre. */
export const Sofa: React.FC<{ x: number; y: number; w?: number; color?: string; children?: React.ReactNode }> = ({ x, y, w = 880, color = "#7a3f52", children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-190} width={w} height={200} rx={40} fill={color} />
    <rect x={-w / 2 + 20} y={-176} width={w - 40} height={60} rx={26} fill="rgba(255,255,255,.08)" />
    {children}
    <rect x={-w / 2 - 20} y={-20} width={w + 40} height={110} rx={30} fill={color} />
    <rect x={-w / 2 - 20} y={-20} width={w + 40} height={30} rx={14} fill="rgba(255,255,255,.12)" />
    <rect x={-w / 2 - 50} y={-120} width={70} height={210} rx={30} fill={color} />
    <rect x={w / 2 - 20} y={-120} width={70} height={210} rx={30} fill={color} />
    <rect x={-w / 2 + 10} y={90} width={20} height={30} fill="#3a2418" /><rect x={w / 2 - 30} y={90} width={20} height={30} fill="#3a2418" />
  </g>
);

/** Coffee table with a fruit bowl that empties and refills (fill 0..1) and tea glasses. */
export const Table: React.FC<{ x: number; y: number; fill?: number; teas?: number; ice?: boolean }> = ({ x, y, fill = 1, teas = 4, ice }) => {
  const fruits = [[-46, -8, "#e0443a"], [0, -16, "#f2a33a"], [46, -8, "#e0443a"], [-24, -34, "#8fbf3a"], [24, -34, "#f2a33a"], [0, -52, "#7a3f9a"]] as const;
  const n = Math.round(fill * fruits.length);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={86} rx={300} ry={18} fill="rgba(0,0,0,.25)" />
      <rect x={-280} y={0} width={560} height={30} rx={12} fill={K.wood} />
      <rect x={-250} y={30} width={22} height={56} fill="#5a3420" /><rect x={228} y={30} width={22} height={56} fill="#5a3420" />
      <g transform="translate(-60 -4)">
        {fruits.slice(0, n).map(([fx, fy, c], i) => <circle key={i} cx={fx} cy={fy} r={24} fill={c} />)}
        <path d="M-90 -6 Q0 40 90 -6 Z" fill="#e8dcc6" stroke="#bfae8f" strokeWidth={3} />
      </g>
      {Array.from({ length: teas }, (_, i) => (
        <g key={i} transform={`translate(${110 + i * 44} -4)`}>
          <ellipse cx={0} cy={2} rx={20} ry={5} fill="#d9d2c4" />
          <path d="M-12 -40 L12 -40 L9 0 L-9 0 Z" fill={ice ? "#c9a46b" : "#b5521f"} stroke="rgba(255,255,255,.7)" strokeWidth={2.5} />
          {ice && <rect x={-7} y={-38} width={10} height={10} rx={2} fill="#e6f8ff" />}
        </g>
      ))}
    </g>
  );
};

export const Emo: React.FC<{ children: string; size?: number; style?: React.CSSProperties }> = ({ children, size = 40, style }) => <span style={{ fontFamily: EMOJI, fontSize: size, ...style }}>{children}</span>;

export const Chip: React.FC<{ x: number; y: number; a: number; children: React.ReactNode; bg?: string; color?: string; size?: number; rot?: number }> = ({ x, y, a, children, bg = "#fff", color = "#2a1d14", size = 34, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${a}) rotate(${rot}deg)`, opacity: a > 0 ? 1 : 0, background: bg, color, borderRadius: 40, padding: "10px 28px", fontSize: size, whiteSpace: "nowrap", boxShadow: "0 14px 30px rgba(0,0,0,.25)", ...FA_UI }}>
    {children}
  </div>
);

/** Speech bubble (Persian). tail: which side the tail points to. */
export const Bubble: React.FC<{ x: number; y: number; a: number; children: React.ReactNode; w?: number; tail?: "left" | "right" | "down"; bg?: string; color?: string; size?: number; rot?: number }> = ({ x, y, a, children, w, tail = "down", bg = "#fff", color = "#2a1d14", size = 36, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${a}) rotate(${rot}deg)`, transformOrigin: tail === "left" ? "0% 100%" : tail === "right" ? "100% 100%" : "50% 100%", opacity: a > 0 ? 1 : 0, width: w, ...FA_UI }}>
    <div style={{ background: bg, color, borderRadius: 30, padding: "16px 26px", fontSize: size, textAlign: "center", whiteSpace: w ? "normal" : "nowrap", boxShadow: "0 16px 34px rgba(0,0,0,.28)" }}>{children}</div>
    <div style={{ position: "absolute", bottom: -16, left: tail === "left" ? 30 : tail === "right" ? undefined : "calc(50% - 14px)", right: tail === "right" ? 30 : undefined, width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: `18px solid ${bg}` }} />
  </div>
);
