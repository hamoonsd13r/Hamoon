// V43 · Instagram cover: the user's AI image (public/v43/cover-art.jpg) + Persian title set in code.
// Title sits inside the 4:5 grid crop (y 285–1635).
import React from "react";
import { AbsoluteFill, Composition, Img, continueRender, delayRender, staticFile } from "remotion";

const W = 1080, H = 1920, RED = "#FF3B30", BONE = "#F2ECE0";
const fh = typeof document !== "undefined" ? delayRender("v43 cover fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["C43Black", "fonts/Vazirmatn-Black.ttf"], ["C43Bold", "fonts/Vazirmatn-Bold.ttf"], ["C43Num", "fonts/Lalezar-Regular.ttf"], ["C43Bebas", "fonts/BebasNeue-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}
const sh = "0 6px 30px rgba(0,0,0,0.85), 0 2px 6px rgba(0,0,0,0.9)";
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#07090d" }}>
    <Img src={staticFile("v43/cover-art.jpg")} style={{ width: W, height: H, objectFit: "cover" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,9,0.94) 0%, rgba(5,6,9,0.72) 26%, rgba(5,6,9,0) 40%, rgba(5,6,9,0) 66%, rgba(5,6,9,0.75) 86%, rgba(5,6,9,0.9) 100%)" }} />
    <div style={{ position: "absolute", top: 110, left: 0, width: W, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: "C43Bebas", fontSize: 44, letterSpacing: 6, color: BONE, opacity: 0.9 }}>
      <span style={{ width: 18, height: 18, borderRadius: 9, background: RED }} />SCENE ZERO
    </div>
    <div style={{ position: "absolute", top: 190, width: W, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl" }}>
      <div style={{ fontFamily: "C43Bold", fontSize: 38, color: "#d8d2c6", padding: "6px 22px", border: "2px solid rgba(242,236,224,0.45)", borderRadius: 10, background: "rgba(5,6,9,0.55)", textShadow: sh }}>پرونده‌ی بانک ملی · خرداد ۱۴۰۱</div>
      <div style={{ fontFamily: "C43Black", fontSize: 150, lineHeight: 1.12, marginTop: 34, color: BONE, textShadow: sh, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "C43Num", color: RED, fontSize: 180 }}>۱۶۸</span> صندوق
      </div>
      <div style={{ fontFamily: "C43Black", fontSize: 104, lineHeight: 1.05, color: BONE, textShadow: sh, whiteSpace: "nowrap" }}>
        در <span style={{ fontFamily: "C43Num", color: RED, fontSize: 124 }}>۱۲</span> ساعت
      </div>
    </div>
    <div style={{ position: "absolute", top: 1470, width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>
      <div style={{ fontFamily: "C43Black", fontSize: 64, color: "#fff", background: RED, padding: "10px 38px", borderRadius: 14, boxShadow: "0 12px 40px rgba(255,59,48,0.35)", whiteSpace: "nowrap" }}>و ۳ روز هیچ‌کس نفهمید</div>
    </div>
  </AbsoluteFill>
);
export const V43CoverComposition: React.FC = () => <Composition id="V43-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H} />;
