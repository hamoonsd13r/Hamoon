// Video 06 drawings — all SVG/CSS: cars, the flying toilet pod, people, road sign, stars.
import React from "react";
import { FONT_TEXT } from "../fonts";
import { C, clamp, rnd } from "../styles/receipt-ui/theme";

export const EMOJI = "'Noto Color Emoji', 'Segoe UI Emoji'";
export const FA_UI: React.CSSProperties = { fontFamily: FONT_TEXT, direction: "rtl" };

/** Top-down car centred on (x,y), pointing up. brake = 0..1 tail-light glow. */
export const CarTop: React.FC<{ x: number; y: number; color?: string; s?: number; rot?: number; brake?: number; hi?: boolean }> = ({ x, y, color = "#5b5f6b", s = 1, rot = 0, brake = 0, hi }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx="0" cy="6" rx="40" ry="74" fill="rgba(0,0,0,.35)" />
    {brake > 0 && <ellipse cx="0" cy="74" rx={46} ry={26} fill={`rgba(255,40,40,${0.35 * brake})`} />}
    <rect x="-34" y="-68" width="68" height="136" rx="22" fill={color} stroke={hi ? "#fff" : "rgba(0,0,0,.35)"} strokeWidth={hi ? 5 : 2} />
    <rect x="-27" y="-40" width="54" height="30" rx="8" fill="rgba(10,14,24,.85)" />
    <rect x="-25" y="28" width="50" height="20" rx="6" fill="rgba(10,14,24,.8)" />
    <rect x="-27" y="-8" width="54" height="34" rx="6" fill="rgba(255,255,255,.12)" />
    <rect x="-28" y="-66" width="14" height="6" rx="3" fill="#fff6c8" />
    <rect x="14" y="-66" width="14" height="6" rx="3" fill="#fff6c8" />
    <rect x="-29" y="60" width="15" height="6" rx="3" fill={brake > 0 ? "#ff3b3b" : "#7a1f1f"} />
    <rect x="14" y="60" width="15" height="6" rx="3" fill={brake > 0 ? "#ff3b3b" : "#7a1f1f"} />
  </g>
);

/** Side-view car (facing left) with an open window at (wx,wy) relative; children drawn inside window area. */
export const CarSide: React.FC<{ x: number; y: number; color?: string; s?: number; children?: React.ReactNode; f?: number }> = ({ x, y, color = "#3f4a5c", s = 1, children, f = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="118" rx="270" ry="18" fill="rgba(0,0,0,.35)" />
    <path d="M-250 70 Q-255 20 -200 10 L-120 0 Q-80 -80 0 -86 L110 -86 Q170 -80 205 0 L245 14 Q265 30 260 78 L-250 78 Z" fill={color} />
    <path d="M-95 -4 Q-62 -68 0 -72 L40 -72 L40 -4 Z" fill="#141a24" />
    <path d="M56 -72 L105 -72 Q150 -66 180 -4 L56 -4 Z" fill="#141a24" />
    {children}
    <rect x="-240" y="30" width="30" height="12" rx="6" fill="#fff6c8" />
    <path d="M-250 60 L260 60" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
    {[-150, 150].map((wx) => (
      <g key={wx} transform={`translate(${wx} 80)`}>
        <circle r="44" fill="#151515" />
        <circle r="22" fill="#9aa0aa" />
        <g transform={`rotate(${f * 3})`}><rect x="-3" y="-20" width="6" height="40" fill="#5c6068" /><rect x="-20" y="-3" width="40" height="6" fill="#5c6068" /></g>
      </g>
    ))}
  </g>
);

/** Rotor blur (side view) spinning. */
const Rotor: React.FC<{ x: number; y: number; f: number; on: number; w?: number }> = ({ x, y, f, on, w = 120 }) => {
  const k = Math.abs(Math.sin(f * 1.7 + x));
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="0" width="10" height="26" fill="#8d939e" />
      <ellipse cx="0" cy="0" rx={w / 2} ry="9" fill={`rgba(200,210,230,${0.25 + 0.25 * on})`} />
      <rect x={-(w / 2) * (0.3 + 0.7 * k)} y="-4" width={w * (0.3 + 0.7 * k)} height="8" rx="4" fill="#2b2f36" opacity={0.5 + 0.5 * (1 - on)} />
      <circle r="8" fill="#2b2f36" />
    </g>
  );
};

/**
 * The flying toilet pod (side view), centred at (x,y) = middle of the pod body.
 * door 0..1 open · sealed 0..1 tape · occupied → red light · hose 0..1 arm length (to the right).
 */
export const Pod: React.FC<{ x: number; y: number; s?: number; f: number; rot?: number; rotors?: number; door?: number; sealed?: number; occupied?: boolean; qr?: boolean; children?: React.ReactNode }> = ({
  x, y, s = 1, f, rot = 0, rotors = 1, door = 0, sealed = 0, occupied, qr = true, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs>
      <linearGradient id="podBody" x1="0" x2="1">
        <stop offset="0" stopColor="#c9ced8" /><stop offset="0.35" stopColor="#ffffff" /><stop offset="1" stopColor="#aeb4c0" />
      </linearGradient>
      <linearGradient id="podDoor" x1="0" x2="1">
        <stop offset="0" stopColor="#e9ecf2" /><stop offset="1" stopColor="#b9bfcb" />
      </linearGradient>
    </defs>
    {/* arms + rotors */}
    <path d="M-40 -205 L-175 -250 M40 -205 L175 -250 M-30 -205 L-95 -262 M30 -205 L95 -262" stroke="#737a86" strokeWidth="12" strokeLinecap="round" />
    <rect x="-60" y="-222" width="120" height="30" rx="14" fill="#5d6470" />
    <circle cx="0" cy="-207" r="7" fill={occupied ? C.red : C.green} />
    <Rotor x={-175} y={-262} f={f} on={rotors} />
    <Rotor x={175} y={-262} f={f + 3} on={rotors} />
    <Rotor x={-95} y={-274} f={f + 5} on={rotors} w={90} />
    <Rotor x={95} y={-274} f={f + 7} on={rotors} w={90} />
    {/* body */}
    <path d="M-120 -190 Q-120 -205 -100 -205 L100 -205 Q120 -205 120 -190 L130 190 L-130 190 Z" fill="url(#podBody)" stroke="#8e95a2" strokeWidth="3" />
    <rect x="-128" y="182" width="256" height="22" rx="8" fill="#6c7380" />
    <path d="M-110 204 L-130 238 M110 204 L130 238 M-150 238 L-90 238 M90 238 L150 238" stroke="#5a606b" strokeWidth="9" strokeLinecap="round" />
    {/* logo strip */}
    <rect x="-100" y="-182" width="200" height="40" rx="10" fill={C.blue} />
    <text x="0" y="-152" textAnchor="middle" fontFamily={FONT_TEXT} fontSize="26" fill="#fff" style={{ direction: "rtl" }}>توالت‌پرون</text>
    {/* inside (seen when door open) */}
    <rect x="-92" y="-130" width="184" height="300" rx="10" fill="#2a2f39" />
    <g transform="translate(0 95)">
      <rect x="-40" y="-70" width="80" height="44" rx="8" fill="#f2f3f6" />
      <path d="M-55 -20 L55 -20 Q50 30 0 36 Q-50 30 -55 -20 Z" fill="#f2f3f6" />
      <rect x="-22" y="34" width="44" height="40" fill="#e3e5ea" />
    </g>
    {children}
    {/* door: hinge on the left, swings by scaleX */}
    <g transform={`translate(-92 0) scale(${1 - 0.92 * door} 1) translate(92 0)`}>
      <rect x="-92" y="-130" width="184" height="300" rx="10" fill="url(#podDoor)" stroke="#8e95a2" strokeWidth="3" />
      <rect x="-60" y="-110" width="120" height="34" rx="8" fill="rgba(30,36,48,.75)" />
      <circle cx="-62" cy="-93" r="9" fill={occupied ? C.red : C.green} />
      <text x="10" y="-85" textAnchor="middle" fontFamily={FONT_TEXT} fontSize="22" fill="#fff" style={{ direction: "rtl" }}>{occupied ? "اشغال" : "خالی"}</text>
      {qr && <QR x={-48} y={-50} size={96} />}
      <rect x="62" y="20" width="12" height="54" rx="6" fill="#59606c" />
    </g>
    {/* seal tape */}
    {sealed > 0 && (
      <g opacity={clamp(sealed * 3)}>
        {[[-30, -20], [25, 60]].map(([deg, dy], i) => {
          const k = clamp(sealed * 2 - i * 0.5);
          return (
            <g key={i} transform={`translate(0 ${dy}) rotate(${deg})`}>
              <rect x={-150} y={-20} width={300 * k} height="40" fill="#f5c400" />
              {Array.from({ length: 10 }, (_, j) => j * 30 < 300 * k && <path key={j} d={`M${-150 + j * 30} -20 l18 0 l-14 40 l-18 0 Z`} fill="#1b1b1b" />)}
            </g>
          );
        })}
      </g>
    )}
  </g>
);

/** Deterministic QR-looking code. */
export const QR: React.FC<{ x: number; y: number; size: number; seed?: number }> = ({ x, y, size, seed = 3 }) => {
  const n = 13, c = size / n;
  const finder = (i: number, j: number) => (i < 4 && j < 4) || (i < 4 && j > n - 5) || (i > n - 5 && j < 4);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-6} y={-6} width={size + 12} height={size + 12} rx="6" fill="#fff" />
      {Array.from({ length: n * n }, (_, k) => {
        const i = Math.floor(k / n), j = k % n;
        if (finder(i, j)) return null;
        return rnd(k * 7 + seed) > 0.5 ? <rect key={k} x={j * c} y={i * c} width={c} height={c} fill="#111" /> : null;
      })}
      {[[0, 0], [0, n - 4], [n - 4, 0]].map(([i, j], k) => (
        <g key={k} transform={`translate(${j * c} ${i * c})`}>
          <rect width={c * 4} height={c * 4} fill="#111" /><rect x={c * 0.6} y={c * 0.6} width={c * 2.8} height={c * 2.8} fill="#fff" /><rect x={c * 1.2} y={c * 1.2} width={c * 1.6} height={c * 1.6} fill="#111" />
        </g>
      ))}
    </g>
  );
};

/** Top-down drone (4 rotors) with a white pod. */
export const DroneTop: React.FC<{ x: number; y: number; s?: number; f: number; rot?: number }> = ({ x, y, s = 1, f, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx="18" cy="26" rx="70" ry="62" fill="rgba(0,0,0,.18)" />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
      <g key={i}>
        <path d={`M0 0 L${a * 62} ${b * 62}`} stroke="#5d6470" strokeWidth="10" />
        <circle cx={a * 62} cy={b * 62} r="36" fill="rgba(170,185,210,.35)" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
        <g transform={`translate(${a * 62} ${b * 62}) rotate(${f * 47 + i * 30})`}><rect x="-32" y="-4" width="64" height="8" rx="4" fill="#2b2f36" /></g>
      </g>
    ))}
    <rect x="-38" y="-38" width="76" height="76" rx="18" fill="#fff" stroke="#9aa1ad" strokeWidth="3" />
    <rect x="-38" y="-12" width="76" height="24" fill={C.blue} />
    <text x="0" y="8" textAnchor="middle" fontSize="20" fontFamily={EMOJI}>🚽</text>
  </g>
);

/** Simple person (side/front), head bob, optional phone glow (head down). */
export const Person: React.FC<{ x: number; y: number; s?: number; color?: string; skin?: string; down?: number; f?: number; seed?: number }> = ({ x, y, s = 1, color = "#4b5567", skin = "#e0b896", down = 0, f = 0, seed = 0 }) => {
  const bob = Math.sin(f / 7 + seed) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      <ellipse cx="0" cy="92" rx="34" ry="8" fill="rgba(0,0,0,.18)" />
      <path d="M-30 90 L-30 20 Q-30 -6 0 -6 Q30 -6 30 20 L30 90 Z" fill={color} />
      <g transform={`translate(0 ${-30 + down * 10}) rotate(${down * 18})`}>
        <circle r="26" fill={skin} />
        <path d="M-26 -4 Q-24 -30 0 -30 Q24 -30 26 -4 Q12 -16 -26 -4 Z" fill="#2d241e" />
        <circle cx="-9" cy={2 + down * 6} r="3.2" fill="#222" /><circle cx="9" cy={2 + down * 6} r="3.2" fill="#222" />
      </g>
      {down > 0 && (
        <g opacity={down}>
          <rect x="-16" y="16" width="32" height="46" rx="6" fill="#111" stroke="#666" strokeWidth="2" />
          <rect x="-12" y="20" width="24" height="38" rx="3" fill="#7fb2ff" />
          <ellipse cx="0" cy="-6" rx="34" ry="24" fill="rgba(127,178,255,.22)" />
        </g>
      )}
    </g>
  );
};

/** Iranian green road sign. */
export const RoadSign: React.FC<{ x: number; y: number; a: number; lines: [string, string][]; s?: number }> = ({ x, y, a, lines, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s * (0.6 + 0.4 * a)}) rotate(${(1 - a) * -12}deg)`, transformOrigin: "50% 100%", opacity: a, ...FA_UI }}>
    <div style={{ background: "#0d7a3e", border: "6px solid #fff", borderRadius: 18, padding: "14px 30px", boxShadow: "0 18px 40px rgba(0,0,0,.45)", color: "#fff", minWidth: 280 }}>
      {lines.map(([name, km], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 40, fontSize: 40, lineHeight: 1.4 }}><span>{name}</span><span>{km}</span></div>
      ))}
    </div>
    <div style={{ margin: "0 auto", width: 18, height: 120, background: "linear-gradient(90deg,#9aa0aa,#e3e6ea,#8a9099)" }} />
  </div>
);

/** Row of 5 stars; filled = 0..5 (fractional pop on the newest). */
export const Stars: React.FC<{ filled: number; size?: number; color?: string; empty?: string }> = ({ filled, size = 70, color = "#ffb800", empty = "rgba(140,140,150,.35)" }) => (
  <div style={{ display: "flex", gap: size * 0.18, direction: "ltr", justifyContent: "center" }}>
    {Array.from({ length: 5 }, (_, i) => {
      const k = clamp(filled - i);
      return (
        <svg key={i} width={size} height={size} viewBox="-50 -50 100 100" style={{ transform: `scale(${k > 0 && k < 1 ? 1 + 0.4 * Math.sin(Math.PI * k) : 1})` }}>
          <path d="M0 -46 L13 -15 L46 -14 L20 7 L29 40 L0 21 L-29 40 L-20 7 L-46 -14 L-13 -15 Z" fill={k >= 0.5 ? color : empty} stroke={k >= 0.5 ? "#e09a00" : "none"} strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );
    })}
  </div>
);
