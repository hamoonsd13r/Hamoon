// V27 · paper props + ink illustrations. Everything is drawn in code (no photos): thin ink lines, muted paper fills,
// one red accent for danger, a quiet green only for "safe" ticks. All positions in px on the 1080×1920 frame.
import React from "react";
import { clamp, ease, lerp, ramp, rnd } from "../styles/studio-desk/demo/lib";

type P = React.CSSProperties;
export const K = {
  paper: "#F3EEE3",
  paper2: "#E9E2D2",
  kraft: "#C9A97C",
  blue: "#1F4A8F",
  blue2: "#2B5BA6",
  ink: "#1E2430",
  ink2: "#5A6070",
  ink3: "#9AA0AC",
  red: "#E0452B",
  green: "#2E9B63",
  yellow: "#F6D768",
  sky: "#CFDCE4",
  white: "#FFFFFF",
};
export const FAF = "DeskFA";
export const NUMF = "Bask";
export const MONOF = "Chakra";
export const SHADOW = "0 1px 2px rgba(0,0,0,.08), 0 10px 26px rgba(40,30,10,.13), 0 28px 70px rgba(40,30,10,.10)";

/** element entrance: k 0→1 (with overshoot allowed) → scale + lift + fade */
export const enter = (k: number, dy = 40): P => ({ opacity: clamp(k * 2), transform: `translateY(${(1 - Math.min(1, k)) * dy}px) scale(${0.6 + 0.4 * k})` });

export const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, ...style }}>{children}</div>
);

export const Fa: React.FC<{ s?: number; w?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 36, w = 700, c = K.ink, style, children }) => (
  <div style={{ fontFamily: FAF, fontSize: s, fontWeight: w, color: c, direction: "rtl", lineHeight: 1.35, whiteSpace: "nowrap", ...style }}>{children}</div>
);
export const Num: React.FC<{ s?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 200, c = K.ink, style, children }) => (
  <div style={{ fontFamily: NUMF, fontWeight: 700, fontSize: s, color: c, lineHeight: 1, direction: "ltr", letterSpacing: -s * 0.03, ...style }}>{children}</div>
);
export const Mono: React.FC<{ s?: number; c?: string; style?: P; children?: React.ReactNode }> = ({ s = 20, c = K.ink2, style, children }) => (
  <div style={{ fontFamily: MONOF, fontWeight: 600, fontSize: s, color: c, letterSpacing: s * 0.18, direction: "ltr", whiteSpace: "nowrap", ...style }}>{children}</div>
);

/** a strip of semi-transparent tape */
const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 150, rot = -6 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 44, background: "rgba(236,228,205,.78)", boxShadow: "0 1px 3px rgba(0,0,0,.12)", transform: `rotate(${rot}deg)`, borderLeft: "2px dashed rgba(0,0,0,.05)", borderRight: "2px dashed rgba(0,0,0,.05)" }} />
);

/** instant-photo frame. children = an svg/illustration filling the picture area */
export const Polaroid: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; k?: number; label?: string; tape?: boolean; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, k = 1, label, tape = true, style, children }) => {
  const pad = Math.round(w * 0.04);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${0.7 + 0.3 * k}) translateY(${(1 - Math.min(1, k)) * -120}px)`, opacity: clamp(k * 2), ...style }}>
      <div style={{ position: "absolute", inset: 0, background: "#FBFAF6", boxShadow: SHADOW, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: pad, top: pad, right: pad, bottom: label ? pad * 3.2 : pad, overflow: "hidden", contain: "paint", background: K.sky }}>{children}</div>
      {label && <Fa s={Math.round(w * 0.055)} w={700} c={K.ink2} style={{ position: "absolute", right: pad * 1.4, bottom: pad * 0.75 }}>{label}</Fa>}
      {tape && <Tape x={w / 2 - 75} y={-22} />}
    </div>
  );
};

export const Sticky: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; k?: number; c?: string; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, k = 1, c = K.yellow, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg) scale(${0.5 + 0.5 * k})`, opacity: clamp(k * 2.5), background: c, boxShadow: "0 2px 4px rgba(0,0,0,.10), 0 14px 28px rgba(60,40,0,.16)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "rgba(0,0,0,.05)" }} />
    {children}
  </div>
);

export const Card: React.FC<{ x: number; y: number; w: number; h: number; k?: number; rot?: number; r?: number; style?: P; children?: React.ReactNode }> = ({ x, y, w, h, k = 1, rot = 0, r = 28, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: K.white, boxShadow: SHADOW, transform: `rotate(${rot}deg) translateY(${(1 - Math.min(1, k)) * 50}px) scale(${0.85 + 0.15 * k})`, opacity: clamp(k * 2), ...style }}>{children}</div>
);

/** round tick / ban badge */
export const Badge: React.FC<{ ok?: boolean; s?: number; k?: number; style?: P }> = ({ ok = true, s = 56, k = 1, style }) => (
  <div style={{ width: s, height: s, borderRadius: s, background: ok ? K.green : K.red, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, boxShadow: "0 4px 10px rgba(0,0,0,.15)", ...style }}>
    <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={24} strokeDashoffset={24 * (1 - clamp(k))} /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  </div>
);

/** hand-drawn marker ellipse that draws itself (k 0→1) */
export const Marker: React.FC<{ x: number; y: number; w: number; h: number; k: number; c?: string }> = ({ x, y, w, h, k, c = K.red }) => {
  const L = 2000;
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible" }} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={`M ${w * 0.62} ${h * 0.04} C ${w * 1.05} ${h * 0.02}, ${w * 1.04} ${h * 0.96}, ${w * 0.5} ${h * 0.98} C ${-w * 0.04} ${h * 1.0}, ${-w * 0.03} ${h * 0.05}, ${w * 0.48} ${h * 0.02} L ${w * 0.7} ${h * 0.06}`}
        fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - clamp(k))} opacity={0.9} />
    </svg>
  );
};

// ───────────────────────── icons (24×24 strokes) ─────────────────────────
const IP: Record<string, string> = {
  enter: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9",
  house: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6",
  radio: "M4 9h16v11H4zM7 9l10-5M8 14.5a2 2 0 104 0 2 2 0 00-4 0M15 13h2M15 16h2",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3.5 2",
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zm0-15v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  send: "M4 12l16-8-6 16-2.5-6.5z",
  user: "M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm-8 9c.6-4 4-6.5 8-6.5s7.4 2.5 8 6.5",
  heart: "M12 20s-7-4.4-9.3-8.6C1.1 8.3 3 4.5 6.6 4.5c2.1 0 3.4 1.2 4.1 2.3h.6c.7-1.1 2-2.3 4.1-2.3 3.6 0 5.5 3.8 3.9 6.9C19 15.6 12 20 12 20z",
  drop: "M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z",
  down: "M4 18h16M7 14l5 3 5-3M12 4v13",
};
export const Ico: React.FC<{ n: string; s?: number; c?: string; w?: number; style?: P }> = ({ n, s = 48, c = K.ink, w = 1.8, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={style}><path d={IP[n] ?? ""} /></svg>
);

// ───────────────────────── illustrations (svg, own viewBox, fill parent) ─────────────────────────
const SV: React.FC<{ vb: string; children?: React.ReactNode; style?: P }> = ({ vb, children, style }) => (
  <svg viewBox={vb} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", ...style }}>{children}</svg>
);

/** calm city day: sky, sun, mountains, skyline with lit windows, drifting birds */
export const City: React.FC<{ t: number; dim?: number }> = ({ t, dim = 0 }) => {
  const bl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <SV vb="0 0 500 380">
      <defs>
        <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9CEDC" /><stop offset="1" stopColor="#EFE6D4" /></linearGradient>
      </defs>
      <rect width="500" height="380" fill="url(#csky)" />
      <circle cx="380" cy="90" r="30" fill="#F7E7B8" opacity={0.95} />
      <path d="M0 250 L70 170 L120 210 L190 130 L260 205 L320 160 L400 220 L460 180 L500 210 L500 380 L0 380Z" fill="#A8A08E" opacity={0.75} />
      <path d="M0 270 L60 220 L130 255 L210 200 L290 250 L360 215 L440 255 L500 235 L500 380 L0 380Z" fill="#8E8775" opacity={0.6} />
      {bl.map((i) => {
        const w = 26 + rnd(i) * 22, h = 50 + rnd(i + 9) * 80, x = i * 42 - 6;
        return (
          <g key={i}>
            <rect x={x} y={330 - h} width={w} height={h + 60} fill={i % 2 ? "#5E6472" : "#6F7684"} />
            {Array.from({ length: Math.floor(h / 16) }).map((_, r) => (
              <rect key={r} x={x + 5} y={338 - h + r * 16} width={w - 10} height={4} fill="#E8D9A8" opacity={0.25 + 0.3 * rnd(i * 7 + r)} />
            ))}
          </g>
        );
      })}
      <rect y="330" width="500" height="50" fill="#4C5260" />
      {[0, 1, 2].map((i) => {
        const bx = ((t * 18 + i * 60) % 560) - 40, by = 70 + i * 14 + Math.sin(t * 3 + i) * 3;
        return <path key={i} d={`M${bx} ${by} q6 -6 12 0 q6 -6 12 0`} fill="none" stroke="#3E4452" strokeWidth={2} />;
      })}
      <rect width="500" height="380" fill="#000" opacity={dim} />
    </SV>
  );
};

/** ink mushroom cloud that grows with k (0→1), with horizon city */
export const Mushroom: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const g = ease.out(k);
  const stemTop = lerp(300, 150, g);
  const capR = lerp(10, 92, g);
  const puffs = Array.from({ length: 28 });
  return (
    <SV vb="0 0 500 380">
      <rect width="500" height="380" fill="#E9DFCB" />
      <circle cx="250" cy="300" r={lerp(0, 240, ease.out(ramp(k, 0, 0.6)))} fill="#F4C9A0" opacity={0.35 * (1 - ramp(k, 0.3, 1))} />
      {Array.from({ length: 12 }).map((_, i) => {
        const y = lerp(315, stemTop + 10, i / 11), r = lerp(26, 14, i / 11) * (0.85 + 0.3 * rnd(i + 70));
        return <circle key={`s${i}`} cx={250 + (rnd(i + 40) - 0.5) * 14} cy={y} r={r} fill={i % 2 ? "#B5A990" : "#C2B69D"} stroke={K.ink} strokeWidth={1.4} opacity={clamp(k * 4)} />;
      })}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 250 + (i - 6.5) * lerp(4, 22, g), r = 12 + rnd(i + 90) * 14;
        return <circle key={`b${i}`} cx={x} cy={318 - rnd(i) * 8} r={r * g} fill="#C9BEA8" stroke={K.ink} strokeWidth={1.2} opacity={clamp(k * 3)} />;
      })}
      {puffs.map((_, i) => {
        const a = (i / puffs.length) * Math.PI * 2;
        const back = Math.sin(a) < 0;
        const r = capR * (0.32 + 0.2 * rnd(i));
        const cx = 250 + Math.cos(a) * capR * 0.85 + Math.sin(t * 0.8 + i) * 2;
        const cy = stemTop - 12 + Math.sin(a) * capR * 0.32 - capR * (back ? 0.32 : 0.1);
        return <circle key={i} cx={cx} cy={cy} r={r} fill={back ? "#D9CEB8" : "#B3A78F"} stroke={K.ink} strokeWidth={1.5} opacity={clamp(k * 3)} />;
      })}
      {Array.from({ length: 7 }).map((_, i) => (
        <circle key={`c${i}`} cx={250 + (i - 3) * capR * 0.22} cy={stemTop - capR * 0.5 - rnd(i + 20) * capR * 0.15} r={capR * (0.28 + 0.12 * rnd(i + 30))} fill="#E2D8C3" stroke={K.ink} strokeWidth={1.5} opacity={clamp(k * 3)} />
      ))}
      <ellipse cx="250" cy={stemTop - 18} rx={capR * 0.7} ry={capR * 0.35} fill={K.red} opacity={0.18 * clamp(k * 3)} />
      {Array.from({ length: 16 }).map((_, i) => {
        const w = 14 + rnd(i + 3) * 18, h = 14 + rnd(i + 30) * 34, x = i * 32 - 4;
        return <rect key={i} x={x} y={330 - h} width={w} height={h + 20} fill="#7A7F8A" />;
      })}
      <rect y="328" width="500" height="60" fill="#6A6F7A" />
      <path d="M0 328 H500" stroke={K.ink} strokeWidth={2} />
    </SV>
  );
};

/** person glyph for the "most people" row */
export const Person: React.FC<{ c: string; s?: number }> = ({ c, s = 60 }) => (
  <svg width={s} height={s * 1.5} viewBox="0 0 40 60"><circle cx="20" cy="11" r="8.5" fill={c} /><path d="M6 58 V34 a14 14 0 0 1 28 0 V58 Z" fill={c} /></svg>
);

/** bright flash over trees: k = flash intensity */
export const Flash: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <SV vb="0 0 500 380">
    <defs>
      <radialGradient id="fl" cx="0.62" cy="0.38" r="0.6"><stop offset="0" stopColor="#fff" /><stop offset="0.25" stopColor="#FFF9E8" /><stop offset="0.6" stopColor="#C9D4DA" stopOpacity={0.6} /><stop offset="1" stopColor="#6E7C88" stopOpacity={0} /></radialGradient>
    </defs>
    <rect width="500" height="380" fill="#6E7C88" />
    <rect width="500" height="380" fill="url(#fl)" opacity={0.35 + 0.65 * k} />
    <circle cx="310" cy="145" r={18 + 50 * k} fill="#fff" opacity={0.9} />
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2 + t * 0.15;
      return <path key={i} d={`M310 145 L${310 + Math.cos(a) * (80 + 200 * k)} ${145 + Math.sin(a) * (80 + 200 * k)}`} stroke="#fff" strokeWidth={3 + 4 * k} opacity={0.35 * k} />;
    })}
    {Array.from({ length: 9 }).map((_, i) => {
      const x = i * 60 - 10, h = 90 + rnd(i) * 70;
      return <path key={i} d={`M${x} 380 L${x} ${380 - h * 0.4} C${x - 40} ${380 - h * 0.5}, ${x - 30} ${380 - h}, ${x + 6} ${380 - h} C${x + 46} ${380 - h}, ${x + 40} ${380 - h * 0.45}, ${x + 6} ${380 - h * 0.4} Z`} fill="#2F3A33" opacity={0.92 - 0.3 * k} />;
    })}
  </SV>
);

/** prone figure: lie = 0 standing → 1 lying face down; cover = arms over head */
export const Prone: React.FC<{ lie: number; cover: number }> = ({ lie, cover }) => {
  const l = ease.io(clamp(lie));
  const a = 90 * l;
  const arm = lerp(10, -150, ease.io(clamp(cover)));
  return (
    <svg viewBox="0 0 800 420" style={{ width: "100%", height: "100%" }}>
      <defs><radialGradient id="pfl" cx="0.85" cy="0.2" r="0.7"><stop offset="0" stopColor="#FFFDF4" /><stop offset="0.35" stopColor="#F5E6C4" /><stop offset="1" stopColor="#E3DACA" /></radialGradient></defs>
      <rect width="800" height="420" fill="url(#pfl)" />
      <path d="M0 300 L120 260 L230 290 L360 250 L480 285 L600 255 L800 290 L800 340 L0 340Z" fill="#CFC4AE" />
      {Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M${i * 21} 340 l10 12`} stroke="#B9AE98" strokeWidth={2} />)}
      <rect y="338" width="800" height="82" fill="#D9CDB4" />
      <path d="M0 338 H800" stroke={K.ink} strokeWidth={3} />
      <g transform={`translate(${lerp(400, 230, l)} ${338 - 30 * l}) rotate(${a}) scale(1.05)`}>
        <path d="M-14 0 L-12 -110 M14 0 L12 -110" stroke={K.ink} strokeWidth={22} strokeLinecap="round" />
        <rect x="-30" y="-215" width="60" height="115" rx="26" fill="#5A6578" stroke={K.ink} strokeWidth={3} />
        <g transform={`translate(0 -200) rotate(${arm})`}>
          <path d="M0 0 L8 80" stroke={K.ink} strokeWidth={18} strokeLinecap="round" />
        </g>
        <circle cx="0" cy="-248" r="28" fill="#D8B79A" stroke={K.ink} strokeWidth={3} />
      </g>
    </svg>
  );
};

/** window with glass that cracks (k 0→1) */
export const WindowCrack: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const shake = k > 0 && k < 0.4 ? Math.sin(t * 90) * 4 * (1 - k / 0.4) : 0;
  const cracks = [[0, -150], [120, -90], [160, 30], [90, 140], [-40, 160], [-150, 80], [-160, -60], [-70, -150]];
  return (
    <SV vb="0 0 400 400">
      <rect width="400" height="400" fill="#E7E1D3" />
      <g transform={`translate(${shake} 0)`}>
        <rect x="40" y="40" width="320" height="320" fill="#BFD2DC" stroke={K.ink} strokeWidth={10} />
        <path d="M200 40 V360 M40 200 H360" stroke={K.ink} strokeWidth={8} />
        <path d="M70 80 l60 -0 M70 95 l30 0" stroke="#fff" strokeWidth={5} opacity={0.7} />
        {cracks.map(([dx, dy], i) => {
          // grow the two-segment crack by moving its end points (no stroke dashes: they broke the layer in Chrome)
          const p = ease.out(clamp(k * 1.6 - i * 0.06));
          if (p <= 0) return null;
          const p1 = Math.min(1, p * 2), p2 = clamp(p * 2 - 1);
          const x1 = 250 + dx * 0.45 * p1, y1 = 150 + (dy * 0.45 + 8) * p1;
          const x2 = x1 + dx * 0.55 * p2, y2 = y1 + (dy * 0.55 - 6) * p2;
          return <path key={i} d={`M250 150 L${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} stroke={K.ink} strokeWidth={2.5} fill="none" />;
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const fall = clamp(k * 1.4 - 0.3) * 0.6;
          return <path key={i} d={`M${230 + rnd(i) * 60} ${150 + rnd(i + 4) * 40 + fall * (120 + rnd(i + 8) * 160)} l10 -14 l8 18z`} fill="#DDE8EE" stroke={K.ink} strokeWidth={1.5} opacity={fall > 0 ? 1 : 0} transform={`rotate(${fall * 200 * (rnd(i) - 0.5)} 250 200)`} />;
        })}
      </g>
    </SV>
  );
};

/** landscape with radioactive dust falling (k = density) */
export const Fallout: React.FC<{ t: number; k: number }> = ({ t, k }) => (
  <SV vb="0 0 900 420">
    <rect width="900" height="420" fill="#D9D3C4" />
    <rect width="900" height="420" fill="#8D8270" opacity={0.25 * k} />
    {Array.from({ length: 260 }).map((_, i) => {
      const sp = 30 + rnd(i) * 40;
      const y = ((t * sp + rnd(i + 50) * 420) % 440) - 20;
      const x = rnd(i + 99) * 900 + Math.sin(t + i) * 8;
      return <circle key={i} cx={x} cy={y} r={0.9 + rnd(i + 7) * 1.8} fill="#6B5F50" opacity={i / 260 < k ? 0.35 + 0.4 * rnd(i + 3) : 0} />;
    })}
    {Array.from({ length: 12 }).map((_, i) => {
      const x = 30 + i * 74 + rnd(i) * 10, h = 30 + rnd(i + 2) * 90;
      return <g key={i}><rect x={x} y={360 - h} width={50} height={h} fill="#8A8F99" stroke={K.ink} strokeWidth={2} /><path d={`M${x - 6} ${360 - h} L${x + 25} ${360 - h - 26} L${x + 56} ${360 - h} Z`} fill="#6A6F7A" stroke={K.ink} strokeWidth={2} /></g>;
    })}
    <rect y="360" width="900" height="60" fill="#B7AC96" />
    <path d="M0 360 H900" stroke={K.ink} strokeWidth={3} />
  </SV>
);

/** trefoil radiation mark */
export const Trefoil: React.FC<{ s?: number; c?: string; bg?: string }> = ({ s = 80, c = K.ink, bg = K.yellow }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100">
    <circle r="48" fill={bg} stroke={c} strokeWidth={3} />
    {[0, 120, 240].map((a) => <path key={a} d="M0 0 L-16 -34 A37 37 0 0 1 16 -34 Z" transform={`rotate(${a})`} fill={c} />)}
    <circle r="8" fill={bg} /><circle r="5.5" fill={c} />
  </svg>
);

/** jammed road seen from above-ish (cars crawl then stop, k = stop) */
export const Traffic: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const cols = ["#C8C2B4", "#8E95A3", "#E6E0D2", "#6E7584", "#B3A68C", "#D9D4C7"];
  return (
    <SV vb="0 0 600 400">
      <rect width="600" height="400" fill="#A7A396" />
      <path d="M180 0 L420 0 L600 400 L0 400Z" fill="#6C6F76" />
      {[0, 1, 2].map((l) => <path key={l} d={`M${260 + l * 40} 0 L${150 + l * 150} 400`} stroke="#E8E2CF" strokeWidth={3} strokeDasharray="18 22" opacity={0.6} />)}
      {Array.from({ length: 4 }).map((_, l) =>
        Array.from({ length: 7 }).map((_, r) => {
          const crawl = (1 - k) * ((t * 14) % 60);
          const y = r * 62 - 30 + crawl;
          const sc = 0.45 + (y / 400) * 0.75;
          const x = 300 + (l - 1.5) * (60 + y * 0.32);
          return <g key={`${l}-${r}`} transform={`translate(${x} ${y}) scale(${sc})`}>
            <rect x="-30" y="-22" width="60" height="44" rx="10" fill={cols[(l * 7 + r) % cols.length]} stroke={K.ink} strokeWidth={2.5} />
            <rect x="-22" y="-14" width="44" height="14" rx="4" fill="#3E4452" opacity={0.75} />
            <rect x="-26" y="14" width="10" height="5" fill={K.red} opacity={0.4 + 0.6 * k} /><rect x="16" y="14" width="10" height="5" fill={K.red} opacity={0.4 + 0.6 * k} />
          </g>;
        }))}
    </SV>
  );
};

/** red "no" stamp */
export const Ban: React.FC<{ s?: number; k?: number }> = ({ s = 140, k = 1 }) => (
  <svg width={s} height={s} viewBox="-50 -50 100 100" style={{ transform: `scale(${k}) rotate(${(1 - k) * 30}deg)`, opacity: clamp(k * 2) }}>
    <circle r="42" fill="rgba(255,255,255,.85)" stroke={K.red} strokeWidth={10} /><path d="M-29 -29 L29 29" stroke={K.red} strokeWidth={10} />
  </svg>
);

/** jacket glyph */
export const Jacket: React.FC<{ s?: number; c?: string }> = ({ s = 200, c = K.ink }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round">
    <path d="M36 14 L50 24 L64 14 L82 22 L92 58 L80 62 L76 46 L76 90 L24 90 L24 46 L20 62 L8 58 L18 22 Z" fill="#E7DDCB" />
    <path d="M50 24 V90 M36 14 L42 34 L50 24 L58 34 L64 14" /><path d="M32 66 h10 M58 66 h10" />
  </svg>
);
/** plastic bag that ties closed (k) */
export const Bag: React.FC<{ s?: number; k?: number }> = ({ s = 260, k = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={K.ink} strokeWidth={2.5} strokeLinejoin="round">
    <path d={`M18 ${lerp(22, 30, k)} C14 60, 16 92, 50 94 C84 92, 86 60, 82 ${lerp(22, 30, k)}`} fill="rgba(214,224,230,.65)" />
    <path d={`M18 ${lerp(22, 30, k)} C${lerp(30, 44, k)} ${lerp(26, 16, k)}, ${lerp(70, 56, k)} ${lerp(26, 16, k)}, 82 ${lerp(22, 30, k)}`} />
    {k > 0.5 && <path d="M44 16 q6 -10 12 0 q-6 6 -12 0z" fill={K.red} stroke={K.red} />}
    <path d="M30 50 q20 -8 40 0" stroke="#fff" strokeWidth={3} opacity={0.6} />
  </svg>
);

/** shower head + falling water */
export const Shower: React.FC<{ t: number }> = ({ t }) => (
  <SV vb="0 0 600 300">
    <rect width="600" height="300" fill="#E4ECEF" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${i * 70} 0 V300`} stroke="#CBD7DC" strokeWidth={3} />)}
    <path d="M110 20 H300 Q330 20 330 50 V70" stroke={K.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M280 70 H380 L360 100 H300 Z" fill="#9AA3AE" stroke={K.ink} strokeWidth={4} />
    {Array.from({ length: 40 }).map((_, i) => {
      const x = 300 + rnd(i) * 60 + (rnd(i) - 0.5) * ((t * 120 + i * 40) % 200) * 0.35;
      const y = 104 + ((t * 260 + rnd(i + 5) * 200) % 200);
      return <path key={i} d={`M${x} ${y} l-2 14`} stroke="#5C8FB0" strokeWidth={3} strokeLinecap="round" opacity={0.8} />;
    })}
  </SV>
);

export const Bottle: React.FC = () => (
  <SV vb="0 0 300 300">
    <rect width="300" height="300" fill="#E6EDF0" />
    <rect x="125" y="40" width="50" height="26" rx="5" fill="#3A6EA5" stroke={K.ink} strokeWidth={3} />
    <path d="M128 66 L172 66 L178 96 C200 106 204 120 204 140 L204 262 Q204 276 190 276 L110 276 Q96 276 96 262 L96 140 C96 120 100 106 122 96 Z" fill="#CFE3EE" stroke={K.ink} strokeWidth={3.5} />
    <rect x="96" y="160" width="108" height="56" fill="#F4F0E6" stroke={K.ink} strokeWidth={2.5} />
    <path d="M150 172 c8 10 12 16 12 22 a12 12 0 0 1 -24 0 c0 -6 4 -12 12 -22z" fill="#3A6EA5" />
    <path d="M112 120 V250" stroke="#fff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />
  </SV>
);
export const Fridge: React.FC<{ k: number }> = ({ k }) => (
  <SV vb="0 0 300 300">
    <rect width="300" height="300" fill="#ECE6DA" />
    <rect x="70" y="30" width="160" height="250" rx="12" fill="#F7F5F0" stroke={K.ink} strokeWidth={3.5} />
    <rect x="82" y="44" width="136" height="222" fill="#FFF8E2" />
    {[110, 170, 225].map((y) => <path key={y} d={`M82 ${y} H218`} stroke="#C9C2B2" strokeWidth={3} />)}
    <circle cx="110" cy="96" r="12" fill={K.red} /><circle cx="135" cy="98" r="10" fill="#E9A23B" /><rect x="160" y="70" width="22" height="38" rx="4" fill="#F4F0E6" stroke={K.ink} strokeWidth={2} />
    <rect x="96" y="140" width="50" height="28" rx="6" fill="#9CC28A" /><rect x="156" y="146" width="44" height="22" rx="6" fill="#E3C27F" />
    <rect x="100" y="196" width="34" height="27" fill="#D9CDB4" /><rect x="146" y="190" width="54" height="33" rx="8" fill="#C9D9E3" />
    <g transform={`translate(70 30) scale(${Math.cos(k * 1.35)} 1)`}>
      <rect x="0" y="0" width="160" height="250" rx="12" fill="#F2F0EA" stroke={K.ink} strokeWidth={3.5} />
      <rect x="140" y="90" width="8" height="70" rx="4" fill={K.ink2} />
    </g>
  </SV>
);

/** decay chart; draw = 0→1 of the curve; mark = 7h marker */
export const Decay: React.FC<{ draw: number; mark: number }> = ({ draw, mark }) => {
  const X = (h: number) => 90 + Math.sqrt(h / 48) * 700, Y = (v: number) => 360 - v * 300;
  const pts = Array.from({ length: 97 }).map((_, i) => { const h = 1 + i * 0.49; return [X(h), Y(Math.pow(h, -1.2))]; });
  const n = Math.max(2, Math.round(pts.length * clamp(draw)));
  const d = pts.slice(0, n).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const m7 = [X(7), Y(Math.pow(7, -1.2))];
  return (
    <svg viewBox="0 0 860 420" style={{ width: "100%", height: "100%" }}>
      {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M90 ${60 + i * 50} H800`} stroke="#ECE7DC" strokeWidth={2} />)}
      <path d="M90 50 V360 H810" stroke={K.ink} strokeWidth={3} fill="none" />
      <path d={`${d} L${pts[n - 1][0]} 360 L90 360 Z`} fill={K.red} opacity={0.08} />
      <path d={d} stroke={K.red} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={9} fill={K.red} />
      <g opacity={clamp(mark * 3)}>
        <path d={`M${m7[0]} ${m7[1]} V360`} stroke={K.ink2} strokeWidth={2.5} strokeDasharray="8 8" />
        <circle cx={m7[0]} cy={m7[1]} r={12 * Math.min(1, mark * 1.5)} fill="#fff" stroke={K.ink} strokeWidth={4} />
        <text x={m7[0]} y={398} textAnchor="middle" fontFamily={MONOF} fontWeight={600} fontSize={26} fill={K.ink}>7h</text>
      </g>
      <text x={X(1)} y={398} textAnchor="middle" fontFamily={MONOF} fontWeight={600} fontSize={22} fill={K.ink3}>1h</text>
      <text x={X(24)} y={398} textAnchor="middle" fontFamily={MONOF} fontWeight={600} fontSize={22} fill={K.ink3}>24h</text>
      <text x={X(48)} y={398} textAnchor="middle" fontFamily={MONOF} fontWeight={600} fontSize={22} fill={K.ink3}>48h</text>
    </svg>
  );
};

/** progress ring */
export const Ring: React.FC<{ s: number; k: number; c?: string; w?: number; track?: string }> = ({ s, k, c = K.red, w = 22, track = "#ECE7DC" }) => {
  const r = s / 2 - w / 2, L = 2 * Math.PI * r;
  return (
    <svg width={s} height={s} style={{ position: "absolute", left: 0, top: 0, transform: "rotate(-90deg)" }}>
      <circle cx={s / 2} cy={s / 2} r={r} stroke={track} strokeWidth={w} fill="none" />
      <circle cx={s / 2} cy={s / 2} r={r} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - clamp(k))} />
    </svg>
  );
};

/** stopwatch with a running hand */
export const Stopwatch: React.FC<{ t: number; s?: number }> = ({ t, s = 220 }) => (
  <svg width={s} height={s} viewBox="-60 -66 120 126">
    <rect x="-8" y="-64" width="16" height="10" rx="2" fill={K.ink} /><path d="M38 -44 l8 -8" stroke={K.ink} strokeWidth={5} strokeLinecap="round" />
    <circle r="50" fill="#FBFAF6" stroke={K.ink} strokeWidth={5} />
    {Array.from({ length: 60 }).map((_, i) => <path key={i} d={`M0 -46 V${i % 5 ? -42 : -38}`} stroke={i % 5 ? K.ink3 : K.ink} strokeWidth={i % 5 ? 1 : 2} transform={`rotate(${i * 6})`} />)}
    <path d="M0 6 V-40" stroke={K.red} strokeWidth={3} strokeLinecap="round" transform={`rotate(${t * 72})`} />
    <circle r="4" fill={K.red} />
  </svg>
);
