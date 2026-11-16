// Reel covers (1080×1920) for V54 «ناقوس شب» and V55 «هیچ‌وقت شب سمت بستنی‌فروشی ندو».
// The key art and text sit inside the centre 1080×1440 so the profile grid's 3:4 crop keeps them.
// Render: npx remotion still V54-Cover videos/54-naghus/cover.jpg · npx remotion still V55-Cover videos/55-bastani/cover.jpg
import React from "react";
import { AbsoluteFill, Composition, Img, continueRender, delayRender, staticFile } from "remotion";

const fh = typeof document !== "undefined" ? delayRender("cover fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["CovBlack", "fonts/Vazirmatn-Black.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

const W = 1080, H = 1920;
type P = { img: string; ar: number; h: number; fx: number; fy: number; top: string; hook: string; title: string; big?: string; tint: string };

const T: React.FC<{ size: number; color?: string; stroke?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = "#fff", stroke = 14, children, style }) => (
  <div style={{ fontFamily: "CovBlack", fontSize: size, lineHeight: 1.15, color, direction: "rtl", textAlign: "center", WebkitTextStroke: `${stroke}px #000`, paintOrder: "stroke fill",
    textShadow: "0 8px 22px rgba(0,0,0,0.7)", ...style }}>{children}</div>
);

const Cover: React.FC<P> = ({ img, ar, h, fx, fy, top, hook, title, big, tint }) => {
  const w = h * ar;
  const left = Math.min(0, Math.max(W - w, W / 2 - fx * w));
  const topPx = (H - h) / 2 + (0.5 - fy) * h * 0.3;
  return (
    <AbsoluteFill style={{ background: "#05060a", overflow: "hidden" }}>
      {/* blurred fill for the top / bottom bands */}
      <Img src={staticFile(img)} style={{ position: "absolute", left: -W * 0.6, top: -60, width: W * 2.2, height: H + 120, objectFit: "cover", filter: "blur(38px) brightness(0.45) saturate(1.1)", maxWidth: "none" }} />
      <Img src={staticFile(img)} style={{ position: "absolute", left, top: topPx, width: w, height: h, maxWidth: "none",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 12%, #000 86%, transparent 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, ${tint} 100%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.8) 92%)" }} />
      {big && <div style={{ position: "absolute", left: 0, width: W, top: 300, display: "flex", justifyContent: "center" }}><T size={300} color="#FF3B30" stroke={22}>{big}</T></div>}
      <div style={{ position: "absolute", left: 40, width: W - 80, top: big ? 640 : 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <T size={64}>{top}</T>
        <T size={118} color="#FF3B30" stroke={18}>{hook}</T>
      </div>
      <div style={{ position: "absolute", left: 40, width: W - 80, bottom: 300, display: "flex", justifyContent: "center" }}>
        <T size={112} stroke={18}>{title}</T>
      </div>
    </AbsoluteFill>
  );
};

export const CoversCompositions: React.FC = () => (
  <>
    <Composition id="V54-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "covers/v54-watcher.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.45, top: "اگه نگهبان ببینه…", hook: "تکون نخور!", title: "ناقوسِ شب", tint: "rgba(4,8,24,0.85)" }} />
    <Composition id="V55-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "covers/v55-truck.jpg", ar: 2576 / 1438, h: 1250, fx: 0.47, fy: 0.5, big: "۶۰", top: "ثانیه وقت داری…", hook: "سمتش ندو!", title: "بستنی‌فروشیِ شب", tint: "rgba(20,4,18,0.85)" }} />
  </>
);
