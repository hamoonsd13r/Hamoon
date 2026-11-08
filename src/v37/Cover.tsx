// Reel cover for V37 — 1080×1920 still; key content inside the 3:4 profile-grid crop (y 240…1680).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Img, staticFile } from "remotion";

const W = 1080, H = 1920, AR = 1438 / 2576;
const fh = typeof document !== "undefined" ? delayRender("v37 cover fonts") : 0;
if (typeof document !== "undefined") {
  new FontFace("V37CBlack", `url('${staticFile("fonts/Vazirmatn-Black.ttf")}')`).load().then((f) => { document.fonts.add(f); continueRender(fh); });
}
const big: React.CSSProperties = { fontFamily: "V37CBlack", lineHeight: 1.12, textAlign: "center", direction: "rtl", WebkitTextStroke: "6px rgba(8,18,34,0.95)", paintOrder: "stroke fill",
  textShadow: "0 10px 0 rgba(8,18,34,0.9), 0 18px 40px rgba(0,0,0,0.55)" };

const Cover: React.FC = () => {
  const s = 1.22, dw = W * s, dh = (W / AR) * s;
  return (
    <AbsoluteFill style={{ background: "#0B1626", overflow: "hidden" }}>
      <Img src={staticFile("v37/img/15.jpg")} style={{ position: "absolute", left: W / 2 - 0.55 * dw, top: -10, width: dw, height: dh, maxWidth: "none" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,18,34,0.85) 0%, rgba(8,18,34,0.6) 26%, rgba(8,18,34,0) 46%, rgba(8,18,34,0) 80%, rgba(8,18,34,0.5) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 285, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: "V37CBlack", fontSize: 44, color: "#0B1626", background: "#FFD84D", borderRadius: 999, padding: "8px 34px 14px", direction: "rtl" }}>ماجرای واقعی · ۱۹۲۰</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...big, fontSize: 150, color: "#fff" }}>۶ ساله بود</div>
        <div style={{ ...big, fontSize: 150, color: "#FFD84D", marginTop: 6 }}>سرباز شد!</div>
      </div>
      {/* the bite, as a hook */}
      <div style={{ position: "absolute", left: 34, top: 1290, width: 300, height: 300, borderRadius: "50%", overflow: "hidden", border: "10px solid #E0262B", boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}>
        <Img src={staticFile("v37/img/03.jpg")} style={{ position: "absolute", left: -200, top: -560, width: 700, height: 720 / AR, maxWidth: "none" }} />
      </div>
      <div style={{ position: "absolute", left: 34, top: 1575, width: 300, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: "V37CBlack", fontSize: 40, color: "#fff", background: "#E0262B", borderRadius: 14, padding: "4px 22px 10px", direction: "rtl" }}>نیش مار 🐍</div>
      </div>
    </AbsoluteFill>
  );
};

export const V37Cover: React.FC = () => <Composition id="V37-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H} />;
