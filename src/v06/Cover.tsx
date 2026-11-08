// Reel cover for V06 «توالت‌پرون» — 1080×1920 still. Key content stays inside the 3:4 profile-grid crop (y 240…1680).
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { C, rnd } from "../styles/receipt-ui/theme";
import { CarTop, EMOJI, FA_UI, Pod } from "./art";

const CARS = ["#6b7080", "#8a8e99", "#b5b8bf", "#4f5562", "#9a3d3d", "#d9d9dc"];

const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#0e0e10" }}>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      {/* forest + jammed road, top-down */}
      {Array.from({ length: 40 }, (_, i) => {
        const x = i % 2 ? 40 + rnd(i) * 230 : 810 + rnd(i) * 240, y = rnd(i + 40) * 1920, r = 40 + rnd(i + 9) * 46;
        return <g key={i} transform={`translate(${x} ${y})`}><circle r={r} fill="#0f3a24" /><circle r={r * 0.7} cx={-r * 0.2} cy={-r * 0.2} fill="#17543a" /></g>;
      })}
      <g transform="rotate(-6 540 960)">
        <rect x={300} y={-200} width={480} height={2400} fill="#2a2c31" />
        <rect x={300} y={-200} width={10} height={2400} fill="#d8d8d8" /><rect x={770} y={-200} width={10} height={2400} fill="#d8d8d8" />
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={536} y={-200 + i * 110} width={8} height={54} fill="#e8e3c8" opacity={0.8} />)}
        {Array.from({ length: 22 }, (_, i) => {
          const lane = i % 2, y = -120 + Math.floor(i / 2) * 190 + lane * 80;
          const me = i === 16;
          return <CarTop key={i} x={lane ? 660 : 420} y={y} s={1.05} color={me ? C.blue : CARS[i % 6]} brake={0.9} hi={me} />;
        })}
      </g>
    </svg>
    {/* darken top for the title, bottom for the tagline */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,8,12,.92) 0%, rgba(8,8,12,.75) 28%, rgba(8,8,12,.15) 45%, rgba(8,8,12,.1) 70%, rgba(8,8,12,.8) 90%)" }} />
    {/* beam + landing ring on "your" car */}
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fa6ff" stopOpacity="0.45" /><stop offset="1" stopColor="#7fa6ff" stopOpacity="0" /></linearGradient></defs>
      <path d="M480 1290 L370 1440 L580 1440 L560 1290 Z" fill="url(#beam)" />
      {[0, 1, 2].map((k) => <ellipse key={k} cx={467} cy={1415} rx={110 + k * 55} ry={(110 + k * 55) * 0.4} fill="none" stroke={C.blue} strokeWidth={5 - k} strokeDasharray="16 12" opacity={0.9 - k * 0.25} />)}
      <Pod x={545} y={1050} s={1.0} f={7} rot={-8} rotors={1} />
      {/* speed lines */}
      {[[250, 820, 120], [830, 900, 150], [210, 1020, 90], [880, 1120, 110]].map(([x, y, l], i) => <path key={i} d={`M${x} ${y} l0 -${l}`} stroke="rgba(255,255,255,.35)" strokeWidth="6" strokeLinecap="round" />)}
    </svg>
    {/* title */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 255, display: "flex", flexDirection: "column", alignItems: "center", ...FA_UI }}>
      <div style={{ background: C.red, color: "#fff", borderRadius: 999, padding: "8px 34px 14px", fontSize: 44, boxShadow: "0 12px 30px rgba(229,72,77,.45)" }}>
        دستشویی داری؟ <span style={{ fontFamily: EMOJI, fontSize: 42 }}>😖</span>
      </div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 196, color: "#fff", lineHeight: 1.25, marginTop: 6, textShadow: `0 10px 0 ${C.blue}, 0 22px 50px rgba(0,0,0,.7)` }}>توالت‌پرون</div>
      <div style={{ fontFamily: FONT_TEXT, fontSize: 50, color: "#dfe6ff", marginTop: 4, textShadow: "0 6px 20px rgba(0,0,0,.8)" }}>وسط ترافیک چالوس، توالت میاد پیشت</div>
    </div>
    {/* tagline */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1578, display: "flex", justifyContent: "center", ...FA_UI }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", color: "#111", borderRadius: 999, padding: "10px 36px 16px", fontSize: 44, boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
        <span style={{ fontFamily: EMOJI, fontSize: 44 }}>⭐</span> ولی آخرش توالت به تو امتیاز می‌ده
      </div>
    </div>
  </AbsoluteFill>
);

export const V06Cover: React.FC = () => <Composition id="V06-Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />;
