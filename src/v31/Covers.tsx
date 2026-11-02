// Reel covers for «شهردار یه‌روزه» قسمت ۱ و ۲ — 1080×1920 stills. Key content stays inside the 3:4 profile-grid crop (y 240…1680).
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { C, Cam, FONT, H, W, fa } from "./kit";
import { City, CityState } from "./iso";

const base: CityState = { T: 3, carFade: 1, flow: 1.1, laneDraw: 0, busX: null, stops: 0, park: 0, civic: "none", civicS: 0, people: 1 };

const Coin: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 56 56">
    <circle cx={28} cy={30} r={25} fill={C.coinD} />
    <circle cx={28} cy={27} r={25} fill={C.coin} />
    <circle cx={28} cy={27} r={18} fill="none" stroke={C.coinL} strokeWidth={3} />
    <path d="M20 27 L28 17 L36 27 L28 37 Z" fill={C.coinL} />
  </svg>
);
const Handle: React.FC<{ h: string; size?: number }> = ({ h, size = 30 }) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: FONT.bold, fontSize: size }}>@{h}</span>;

const big: React.CSSProperties = { fontFamily: FONT.black, color: "#fff", lineHeight: 1.15, textAlign: "center", textShadow: "0 8px 0 #1C3A2A, 0 14px 36px rgba(15,35,25,0.55)" };

const Frame: React.FC<{ cam: Cam; st: Partial<CityState>; ep: number; children: React.ReactNode }> = ({ cam, st, ep, children }) => (
  <AbsoluteFill style={{ background: C.ground }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><City cam={cam} st={{ ...base, ...st }} /></svg>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(28,58,42,0.82) 0%, rgba(28,58,42,0.55) 30%, rgba(28,58,42,0) 52%, rgba(28,58,42,0) 78%, rgba(28,58,42,0.55) 100%)" }} />
    {/* series badge */}
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

const Cover1: React.FC = () => (
  <Frame cam={{ x: 11.5, y: 6.2, z: 1.0, cy: 1180 }} st={{ park: 1, laneDraw: 1, busX: 8.5, stops: 1 }} ep={1}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Coin s={150} />
        <div style={{ ...big, fontSize: 190 }}>{fa(100)} سکه</div>
      </div>
      <div style={{ ...big, fontSize: 132, marginTop: 6 }}>چی می‌سازی؟</div>
    </div>
    {/* floating coins */}
    {[[120, 980, 90, -14], [930, 1040, 74, 18], [190, 1420, 64, 10], [880, 1500, 96, -8]].map(([x, y, s, r], i) => (
      <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, transform: `rotate(${r}deg)`, filter: "drop-shadow(0 10px 16px rgba(20,45,30,0.35))" }}><Coin s={s} /></div>
    ))}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1520, display: "flex", justifyContent: "center", gap: 16, direction: "rtl" }}>
      {["🚌 اتوبوس برقی", "🌳 پارک", "🏥 درمانگاه؟"].map((t) => (
        <div key={t} style={{ padding: "8px 26px 14px", borderRadius: 999, background: "#fff", fontFamily: FONT.black, fontSize: 40, color: C.deep, boxShadow: "0 10px 26px rgba(20,45,30,0.3)" }}>{t}</div>
      ))}
    </div>
  </Frame>
);

const VOTERS = ["a.noroozi306", "amirali._lu", "behnamimahya", "nirvan.mehrabi", "hanighasemi85", "mehdi_klath"];
const Cover2: React.FC = () => (
  <Frame cam={{ x: 4.7, y: 14.1, z: 1.25, cy: 1300 }} st={{ civic: "clinic", civicS: 1 }} ep={2}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl" }}>
      <div style={{ ...big, fontSize: 210, color: C.lime }}>سبزوار</div>
      <div style={{ ...big, fontSize: 104, marginTop: -6 }}>برنده شد! 🥇</div>
      <div style={{ marginTop: 14, padding: "8px 30px 14px", borderRadius: 999, background: C.deep, border: `4px solid ${C.lime}`, fontFamily: FONT.black, fontSize: 44, color: "#fff" }}>
        +{fa(70)} نفر از {fa(50)} شهر رأی دادن
      </div>
    </div>
    {/* voters' names around the clinic */}
    {VOTERS.map((h, i) => {
      const pos = [[70, 1180], [690, 1150], [40, 1420], [720, 1400], [120, 1600], [640, 1620]][i];
      return (
        <div key={h} style={{ position: "absolute", left: pos[0], top: pos[1], padding: "6px 18px 10px", borderRadius: 16, background: "#fff", color: C.deep, boxShadow: "0 8px 20px rgba(20,45,30,0.3)", whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 24 }}>💚 </span><Handle h={h} size={28} />
        </div>
      );
    })}
  </Frame>
);

export const Covers: React.FC = () => (
  <>
    <Composition id="Cover-Shahrdar-1" component={Cover1} durationInFrames={1} fps={30} width={W} height={H} />
    <Composition id="Cover-Shahrdar-2" component={Cover2} durationInFrames={1} fps={30} width={W} height={H} />
  </>
);
