// Reel cover for V38 — 1080×1920 still; key content inside the 3:4 profile-grid crop (y 240…1680).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Img, staticFile } from "remotion";
import { Corridor } from "./Video";

const W = 1080, H = 1920, RED = "#E0312B";
const fh = typeof document !== "undefined" ? delayRender("v38 cover fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V38CBlack", "fonts/Vazirmatn-Black.ttf"], ["V38CBold", "fonts/Vazirmatn-Bold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}
const big: React.CSSProperties = { fontFamily: "V38CBlack", lineHeight: 1.08, textAlign: "center", direction: "rtl", WebkitTextStroke: "7px #050505", paintOrder: "stroke fill",
  textShadow: "0 10px 0 rgba(0,0,0,0.85), 0 20px 50px rgba(0,0,0,0.8)" };

const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    {/* the basement below */}
    <div style={{ position: "absolute", left: 0, top: 380, width: W, height: H }}>
      <div style={{ position: "absolute", inset: 0, filter: "brightness(0.72) contrast(1.15)" }}><Corridor T={3.2} camZ={1900} tint={[0.95, 1.0, 0.95]} sway={0} /></div>
    </div>
    {/* the real shop on top, fading down into the basement */}
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 1180, overflow: "hidden",
      WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 62%, rgba(0,0,0,0) 100%)", maskImage: "linear-gradient(180deg, #000 0%, #000 62%, rgba(0,0,0,0) 100%)" }}>
      <Img src={staticFile("v38/img/exterior.jpg")} style={{ position: "absolute", left: -760, top: -250, height: 1260, width: 1260 * 2228 / 1416, maxWidth: "none", filter: "saturate(0.5) brightness(0.62) contrast(1.15)" }} />
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.65) 100%)" }} />
    <Img src={staticFile("v22/grain-03.jpg")} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.12, mixBlendMode: "screen" }} />
    {/* tag */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "V38CBold", fontSize: 44, color: "#fff", background: RED, borderRadius: 12, padding: "6px 32px 14px", direction: "rtl" }}>
        <span style={{ width: 18, height: 18, borderRadius: 9, background: "#fff" }} />پرونده‌ی اینترنتی
      </div>
    </div>
    {/* title */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ ...big, fontSize: 176, color: "#F3F0EA" }}>زیرزمینِ</div>
      <div style={{ ...big, fontSize: 200, color: RED, marginTop: 4 }}>شهرِ فرش</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "V38CBlack", fontSize: 76, color: "#fff", background: "rgba(0,0,0,0.78)", border: "3px solid rgba(255,255,255,0.25)", borderRadius: 20, padding: "6px 40px 20px", direction: "rtl" }}>
        واقعیه یا شوخی؟
      </div>
    </div>
    {/* Pejman, as the second hook */}
    <div style={{ position: "absolute", left: 44, top: 1250, width: 320, height: 320, borderRadius: "50%", overflow: "hidden", border: `10px solid ${RED}`, boxShadow: "0 16px 50px rgba(0,0,0,0.8)" }}>
      <Img src={staticFile("v38/img/pejman.jpg")} style={{ position: "absolute", left: -790, top: -20, height: 1000, width: 1500, maxWidth: "none", filter: "saturate(0.6) contrast(1.1)" }} />
    </div>
    <div style={{ position: "absolute", left: 44, top: 1560, width: 320, display: "flex", justifyContent: "center" }}>
      <div style={{ fontFamily: "V38CBlack", fontSize: 40, color: "#fff", background: RED, borderRadius: 14, padding: "4px 22px 12px", direction: "rtl", whiteSpace: "nowrap" }}>پژمان جمشیدی</div>
    </div>
  </AbsoluteFill>
);

export const V38Cover: React.FC = () => <Composition id="V38-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H} />;
