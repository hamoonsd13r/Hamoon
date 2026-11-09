// Reel cover for «شهردار یه‌روزه» قسمت ۵ (اهواز) — 1080×1920 still, same layout as src/v36/Covers.tsx.
// Key content stays inside the 3:4 profile-grid crop (y 240…1680).
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { C, FONT, H, W, fa } from "./kit";
import { River } from "./river";

const Coin: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 56 56">
    <circle cx={28} cy={30} r={25} fill={C.coinD} />
    <circle cx={28} cy={27} r={25} fill={C.coin} />
    <circle cx={28} cy={27} r={18} fill="none" stroke={C.coinL} strokeWidth={3} />
    <path d="M20 27 L28 17 L36 27 L28 37 Z" fill={C.coinL} />
  </svg>
);
const big: React.CSSProperties = { fontFamily: FONT.black, color: "#fff", lineHeight: 1.15, textAlign: "center", textShadow: "0 8px 0 #1C3A2A, 0 14px 36px rgba(15,35,25,0.55)" };

const Shell: React.FC<{ ep: number; bg: React.ReactNode; children: React.ReactNode }> = ({ ep, bg, children }) => (
  <AbsoluteFill style={{ background: C.ground }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{bg}</svg>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(28,58,42,0.82) 0%, rgba(28,58,42,0.55) 30%, rgba(28,58,42,0) 52%, rgba(28,58,42,0) 78%, rgba(28,58,42,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 34px 16px 18px", borderRadius: 999, background: C.lime, direction: "rtl" }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: C.deep, display: "flex", alignItems: "center", justifyContent: "center" }}><Coin s={46} /></div>
        <span style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep }}>شهردار یه‌روزه</span>
        <span style={{ fontFamily: FONT.black, fontSize: 40, color: "#fff", background: C.deep, borderRadius: 16, padding: "2px 18px 8px" }}>قسمت {fa(ep)}</span>
      </div>
    </div>
    {children}
  </AbsoluteFill>
);
const Chips: React.FC<{ items: string[] }> = ({ items }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1520, display: "flex", justifyContent: "center", gap: 16, direction: "rtl" }}>
    {items.map((t) => (
      <div key={t} style={{ padding: "8px 26px 14px", borderRadius: 999, background: "#fff", fontFamily: FONT.black, fontSize: 40, color: C.deep, boxShadow: "0 10px 26px rgba(20,45,30,0.3)" }}>{t}</div>
    ))}
  </div>
);

const Cover5: React.FC = () => (
  <Shell ep={5} bg={<River cam={{ x: 7.5, y: 16.5, z: 0.92, cy: 1230 }} st={{ T: 2, park: 1, metro: 1, trainX: 4, palms: 1, flow: 1.1 }} />}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl" }}>
      <div style={{ ...big, fontSize: 210, color: C.lime }}>اهواز</div>
      <div style={{ ...big, fontSize: 104, marginTop: -4 }}>پارکِ کنارِ کارون 🌊</div>
      <div style={{ marginTop: 14, padding: "8px 30px 14px", borderRadius: 999, background: C.deep, border: `4px solid ${C.lime}`, fontFamily: FONT.black, fontSize: 44, color: "#fff" }}>
        با رأیِ بیش از {fa(1000)} نفر
      </div>
    </div>
    <Chips items={["🌊 پارک", "🚇 مترو", "🌴 نخل"]} />
  </Shell>
);

export const Cover5Comp: React.FC = () => <Composition id="Cover-Shahrdar-5" component={Cover5} durationInFrames={1} fps={30} width={W} height={H} />;
