// Reel covers (1080×1920) for V54 «ناقوس شب», V55 «بستنی‌فروشی»، V56 «مدرسه»، V57 «مترسک»، V58 «نامه‌رسون»، V59 «دوست غلط‌املایی» and V60 «دردِ مشترک».
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
    <Composition id="V56-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v56/img/17.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.42, big: "۱۰۰", top: "ساله زنگ نخورده…", hook: "توی راهرو نرو!", title: "مدرسه‌ی بی‌انتها", tint: "rgba(30,4,8,0.85)" }} />
    <Composition id="V57-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v57/img/17.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.45, big: "۲۱", top: "اگه بشمره…", hook: "یکی رو می‌بره!", title: "مترسکِ روستا", tint: "rgba(4,10,28,0.85)" }} />
    <Composition id="V58-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v58/img/14.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.5, top: "اگه پاکتِ سیاه اومد…", hook: "صندوق نذار!", title: "نامه‌رسونِ شب", tint: "rgba(4,6,20,0.85)" }} />
    <Composition id="V59-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v59/img/01.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.42, big: "حافز؟", top: "اگه غلط بنویسی…", hook: "غیبش می‌زنه!", title: "دوست غلط‌املایی", tint: "rgba(30,14,4,0.8)" }} />
    <Composition id="V60-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v60/img/20.jpg", ar: 16 / 9, h: 1250, fx: 0.5, fy: 0.25, big: "آخ!", top: "اگه خواهرت زمین بخوره…", hook: "تو حسش می‌کنی!", title: "دردِ مشترک", tint: "rgba(4,14,30,0.8)" }} />
    <Composition id="V61-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v61/img/15.jpg", ar: 16 / 9, h: 1250, fx: 0.42, fy: -0.2, big: "۱۰", top: "فقط ۱۰ بار می‌تونی بگی…", hook: "ببخشید!", title: "ببخشیدِ آخر", tint: "rgba(4,10,24,0.85)" }} />
    <Composition id="V62-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v62/img/04c.jpg", ar: 16 / 9, h: 1250, fx: 0.42, fy: 0.45, big: "پاپ!", top: "هر اسمی بهش بدی…", hook: "همون می‌شه!", title: "فحشِ واقعی", tint: "rgba(30,6,24,0.8)" }} />
    <Composition id="V63-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v63/img/10.jpg", ar: 16 / 9, h: 1250, fx: 0.52, fy: 0.45, big: "نه!", top: "سی ساله به همه می‌گه…", hook: "تا امروز!", title: "قانونِ سلطانی", tint: "rgba(30,10,4,0.82)" }} />
    <Composition id="V65-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v65/img/27.jpg", ar: 16 / 9, h: 1250, fx: 0.62, fy: 0.45, top: "هیچ‌کس هیچ‌وقت بهش نگفته بود…", hook: "«مواظب باش»", title: "روزت مبارک مامان 💛", tint: "rgba(30,18,4,0.8)" }} />
    <Composition id="V64-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v64/img/01.jpg", ar: 16 / 9, h: 1250, fx: 0.72, fy: 0.45, top: "از هر چیزی رد می‌شد…", hook: "ولی چرا؟ 👻", title: "پسری که رد می‌شد", tint: "rgba(4,14,26,0.82)" }} />
    <Composition id="V66-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v66/img/28.jpg", ar: 16 / 9, h: 1250, fx: 0.55, fy: -0.25, top: "سپرِ مامانم داشت خاموش می‌شد…", hook: "۱۰ دقیقه وقت داشتم!", title: "مواظب باش ۲ 💛", tint: "rgba(30,18,4,0.8)" }} />
    <Composition id="V67-Cover" component={Cover} durationInFrames={1} fps={30} width={W} height={H}
      defaultProps={{ img: "v67/img/22.jpg", ar: 16 / 9, h: 1250, fx: 0.45, fy: 0.45, big: "هاپچه!", top: "هر عطسه = یه کم اژدها…", hook: "من الان نُه تا زدم!", title: "۱۰ تا عطسه 🐉", tint: "rgba(6,24,10,0.82)" }} />
  </>
);
