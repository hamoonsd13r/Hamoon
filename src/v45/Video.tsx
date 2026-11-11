// V45 · «پودر آبی»: حادثه‌ی سزیوم ۱۳۷ در گویانیا، برزیل (۱۹۸۷) — Scene Zero, Instagram reel 9:16 (~82 s).
// User's own narration (ElevenLabs; pauses shortened + tempo 1.12: tools/v45-voice.mjs → vo.json).
// The user asked for constant change: ~42 shots, a new picture about every 2 s, rotating between
//   3D (world.ts) · real photos (IAEA Imagebank / Wikimedia Commons, credited on screen) · stock clips · code cards.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import voJson from "./vo.json";
import { buildWorld, ll, GOIANIA, GLOBE_R, type State, type SetName } from "./world";
import { clamp, prog, lerp, easeOut, easeInOut, backOut, fa, timing, type VO } from "../v42/kit";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const FPS = 30, W = 1080, H = 1920;
export const TOTAL = V.total + 1.6;
export const FRAMES = Math.round(TOTAL * FPS);
const INK = "#04060A", BONE = "#EEF2F6", MUTED = "#8E9AA8", RED = "#FF3B30", BLUE = "#4FB8FF", AMBER = "#FFB547";

/* ───────── fonts + images the 3D world needs (ready before the first frame) */
const fh = typeof document !== "undefined" ? delayRender("v45 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["Q45Black", "fonts/Vazirmatn-Black.ttf"], ["Q45Bold", "fonts/Vazirmatn-Bold.ttf"], ["Q45Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["Q45Num", "fonts/Lalezar-Regular.ttf"], ["Q45Mono", "fonts/ChakraPetch-SemiBold.ttf"], ["Q45Bebas", "fonts/BebasNeue-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}
const TEX_URLS = ["styles/cosmic-web/earth_day.jpg", "styles/cosmic-web/earth_night.jpg"];
const IMGS: Record<string, HTMLImageElement> = {};
if (typeof document !== "undefined") {
  TEX_URLS.forEach((u) => {
    const h = delayRender("v45 image " + u), im = new Image();
    im.onload = () => { IMGS[u] = im; continueRender(h); };
    im.onerror = () => continueRender(h);
    im.src = staticFile(u);
  });
}

/* ───────── small helpers */
type Cam = State["cam"];
const cut = (x: number) => x - 0.07;
const v3 = (v: THREE.Vector3) => [v.x, v.y, v.z] as [number, number, number];
const mix = (a: Cam, b: Cam, u: number): Cam => ({ pos: a.pos.map((v, i) => lerp(v, b.pos[i], u)) as Cam["pos"], look: a.look.map((v, i) => lerp(v, b.look[i], u)) as Cam["look"], fov: lerp(a.fov, b.fov, u) });
const cam = (pos: Cam["pos"], look: Cam["look"], fov = 45): Cam => ({ pos, look, fov });
const globeCam = (lat: number, lon: number, d: number, fov = 40): Cam => ({ pos: v3(ll(lat, lon, GLOBE_R * d)), look: [0, 0, 0], fov });
const pop = (t: number, t0: number, d = 0.35) => backOut(prog(t, t0, t0 + d));
const BASE: Omit<State, "t" | "set" | "cam"> = { mode: "", glow: 0, lights: 0, open: 0, spread: 0, burn: 0, prog: 0, dead: 0, spin: 0 };

/* ───────── on-screen pieces */
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = BONE, font = "Q45Black", style }) => (
  <div style={{ direction: "rtl", fontFamily: font, fontSize: size, color, lineHeight: 1.12, textShadow: "0 8px 40px rgba(0,0,0,0.9)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Tag: React.FC<{ children: React.ReactNode; color?: string; dot?: string }> = ({ children, color = MUTED, dot = BLUE }) => (
  <div style={{ position: "absolute", top: 196, right: 44, direction: "rtl", display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 8, background: "rgba(4,6,10,0.72)", border: "1.5px solid rgba(238,242,246,0.25)", fontFamily: "Q45Bold", fontSize: 26, color }}>
    <span style={{ width: 10, height: 10, borderRadius: 5, background: dot }} />{children}
  </div>
);
const Chip: React.FC<{ t: number; t0: number; children: React.ReactNode; color?: string; top: number; size?: number; solid?: boolean }> = ({ t, t0, children, color = BLUE, top, size = 46, solid }) => {
  if (t < t0) return null;
  return (
    <div style={{ position: "absolute", top, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, t0)})` }}>
      <div style={{ direction: "rtl", fontFamily: "Q45Black", fontSize: size, color: solid ? "#fff" : color, background: solid ? color : "rgba(4,6,10,0.84)", border: `2.5px solid ${color}`, padding: "10px 30px", borderRadius: 14, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{children}</div>
    </div>
  );
};
const Stamp: React.FC<{ t: number; t0: number; text: string; top: number; size?: number; color?: string }> = ({ t, t0, text, top, size = 110, color = RED }) => {
  if (t < t0) return null;
  const u = prog(t, t0, t0 + 0.16);
  return (
    <div style={{ position: "absolute", top, width: W, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", transform: `rotate(-6deg) scale(${lerp(2.2, 1, easeOut(u))})`, opacity: clamp(u * 3), border: `8px solid ${color}`, borderRadius: 18, padding: "6px 40px", color, fontFamily: "Q45Black", fontSize: size, background: "rgba(4,6,10,0.6)", boxShadow: `0 0 50px ${color}55`, whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
};
const Count: React.FC<{ value: number; label: string; color?: string; top?: number; size?: number; t: number; t0: number }> = ({ value, label, color = BONE, top = 280, size = 190, t, t0 }) => (
  <div style={{ position: "absolute", top, width: W, textAlign: "center", transform: `scale(${pop(t, t0)})`, opacity: prog(t, t0, t0 + 0.08) }}>
    <div style={{ fontFamily: "Q45Num", fontSize: size, color, lineHeight: 1, textShadow: `0 0 40px ${color}66, 0 8px 30px #000` }}>{fa(Math.round(value).toLocaleString("en-US").replace(/,/g, "٬"))}</div>
    <div style={{ direction: "rtl", fontFamily: "Q45Black", fontSize: 54, color: MUTED, marginTop: 4, textShadow: "0 4px 20px #000" }}>{label}</div>
  </div>
);
const Credit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 30, bottom: 300, fontFamily: "Q45Mono", fontSize: 20, color: "rgba(238,242,246,0.8)", textShadow: "0 1px 6px #000", background: "rgba(4,6,10,0.45)", padding: "2px 10px", borderRadius: 4 }}>{children}</div>
);
/** real photo, full frame, Ken Burns */
const Full: React.FC<{ src: string; u: number; fx?: number; fy?: number; z0?: number; z1?: number; dx?: number; grade?: string }> = ({ src, u, fx = 0.5, fy = 0.5, z0 = 1.06, z1 = 1.2, dx = 0, grade = "saturate(0.8) contrast(1.1) brightness(0.92)" }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <Img src={staticFile(`v45/photos/${src}.jpg`)} style={{ position: "absolute", inset: 0, width: W, height: H, maxWidth: "none", objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%`, transform: `scale(${lerp(z0, z1, u)}) translateX(${dx * u}px)`, filter: grade }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,6,10,0.7) 0%, rgba(4,6,10,0) 30%, rgba(4,6,10,0) 62%, rgba(4,6,10,0.85) 100%)" }} />
  </AbsoluteFill>
);
/** real photo as a print on a dark desk (whole picture visible) */
const Print: React.FC<{ src: string; u: number; w?: number; ratio: number; top?: number; rot?: number; caption?: string; t: number; t0: number }> = ({ src, u, w = 900, ratio, top = 330, rot = -2.5, caption, t, t0 }) => {
  const k = backOut(prog(t, t0, t0 + 0.3));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img src={staticFile(`v45/photos/${src}.jpg`)} style={{ position: "absolute", inset: -80, width: W + 160, height: H + 160, maxWidth: "none", objectFit: "cover", filter: "blur(40px) brightness(0.35) saturate(0.7)" }} />
      <div style={{ position: "absolute", left: (W - w) / 2, top, width: w, background: "#f1ede4", padding: 16, paddingBottom: caption ? 78 : 16, boxShadow: "0 30px 80px rgba(0,0,0,0.75)", transform: `rotate(${rot + 1.2 * u}deg) scale(${(0.82 + 0.18 * k) * (1 + 0.04 * u)})`, opacity: clamp(k * 2) }}>
        <div style={{ width: w - 32, height: (w - 32) / ratio, overflow: "hidden" }}>
          <Img src={staticFile(`v45/photos/${src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.02 + 0.07 * u})` }} />
        </div>
        {caption && <div style={{ position: "absolute", bottom: 16, right: 24, left: 24, direction: "rtl", fontFamily: "Q45Black", fontSize: 38, color: INK, textAlign: "center" }}>{caption}</div>}
        <div style={{ position: "absolute", top: -22, left: w / 2 - 70, width: 140, height: 44, background: "rgba(232,214,150,0.85)", transform: "rotate(-3deg)" }} />
      </div>
    </AbsoluteFill>
  );
};
const Clip: React.FC<{ src: string; t0: number; u: number; focus?: number; z0?: number; z1?: number; portrait?: boolean; grade?: string }> = ({ src, t0, u, focus = 0.5, z0 = 1.05, z1 = 1.18, portrait, grade = "saturate(0.75) contrast(1.12) brightness(0.9)" }) => {
  const vw = portrait ? W : H * (16 / 9);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Sequence from={Math.round(t0 * FPS)} layout="none">
        <OffthreadVideo muted src={staticFile(`v45/footage/${src}.mp4`)} style={{ position: "absolute", height: H, width: vw, maxWidth: "none", objectFit: "cover", left: portrait ? 0 : W / 2 - vw * focus, top: 0, transform: `scale(${lerp(z0, z1, u)})`, transformOrigin: `${focus * 100}% 50%`, filter: grade }} />
      </Sequence>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,6,10,0.65) 0%, rgba(4,6,10,0) 30%, rgba(4,6,10,0) 62%, rgba(4,6,10,0.8) 100%)" }} />
    </AbsoluteFill>
  );
};
const IAEA = "IAEA Imagebank · CC BY 2.0";

/* ───────── the shot list */
type Ctx = { t: number; a: number; b: number; u: number };
type Shot = { id: string; at: number; d3?: (c: Ctx) => Partial<State> & { set: SetName; cam: Cam }; over?: (c: Ctx) => React.ReactNode; tag?: string };
const tDark = wd(6, "تاریکی") - 0.15;
const SHOTS: Shot[] = [
  { id: "h1", at: 0, d3: ({ u }) => ({ set: "room", mode: "girl", lights: 0.5, glow: 0.55, cam: mix(cam([1.7, 1.0, 2.7], [0, 0.35, 0.3], 44), cam([1.3, 0.9, 2.4], [0, 0.35, 0.3], 44), u) }),
    over: ({ t }) => <Chip t={t} t0={0.05} top={300} size={44} color={BONE}>پرونده‌ی واقعی · برزیل، ۱۹۸۷</Chip> },
  { id: "h2", at: cut(wd(1, "با")), d3: ({ u }) => ({ set: "room", mode: "girl", lights: 0.5, glow: 0.7, cam: mix(cam([0.85, 0.75, 1.35], [0, 0.36, 0.36], 40), cam([0.6, 0.66, 1.2], [0, 0.34, 0.38], 40), u) }) },
  { id: "h3", at: cut(wd(1, "توی")), d3: ({ t, a, u }) => ({ set: "room", mode: "girl", lights: 0.5 * (1 - prog(t, a + 0.25, a + 0.5)), glow: 0.7 + 0.3 * prog(t, a + 0.25, a + 0.6), cam: mix(cam([-1.9, 1.2, 2.3], [0, 0.3, 0.3], 44), cam([-1.2, 0.9, 2.6], [0, 0.3, 0.3], 44), u) }),
    over: ({ t }) => <Chip t={t} t0={wd(1, "آبی") - 0.1} top={300} size={64} color={BLUE}>آبی می‌درخشید</Chip> },
  { id: "p1", at: cut(S(2)), tag: "عکس واقعی", over: ({ t, a, u }) => <><Print src="source" u={u} ratio={1.195} t={t} t0={a} caption="منبعِ واقعیِ همین حادثه" /><Credit>{IAEA}</Credit></> },
  { id: "t1", at: cut(wd(2, "قراره")), d3: ({ t, a, u }) => ({ set: "atom", mode: "trefoil", spin: (t - a) * 0.3, cam: mix(cam([0, 0.2, 15], [0, -0.6, 0], 44), cam([0, 0.2, 11.5], [0, -0.6, 0], 44), easeOut(u)) }),
    over: ({ t }) => <Chip t={t} t0={wd(2, "فاجعه‌بارترین") - 0.1} top={300} size={44} color={AMBER}>یکی از بدترین حادثه‌های رادیواکتیو</Chip> },
  { id: "g1", at: cut(wd(2, "حوادث")), d3: ({ u }) => ({ set: "globe", cam: globeCam(lerp(14, -10, easeInOut(u)), lerp(-12, -44, easeInOut(u)), lerp(3.6, 2.5, easeInOut(u)), 40) }) },
  { id: "g2", at: cut(S(3)), d3: ({ u }) => ({ set: "globe", cam: globeCam(lerp(-13, -16, u), lerp(-47, -49, u), lerp(1.9, 1.5, easeOut(u)), 38) }),
    over: ({ t }) => (
      <div style={{ position: "absolute", top: 300, width: W, display: "flex", direction: "rtl", justifyContent: "center", gap: 24 }}>
        {([["۱۳", wd(3, "13")], ["سپتامبر", wd(3, "سپتامبر")], ["۱۹۸۷", wd(3, "1987")]] as [string, number][]).map(([w, t0]) => (
          <Big key={w} size={110} style={{ opacity: prog(t, t0 - 0.06, t0 + 0.04), transform: `translateY(${(1 - easeOut(prog(t, t0 - 0.06, t0 + 0.25))) * 40}px)` }}>{w}</Big>
        ))}
      </div>
    ) },
  { id: "p2", at: cut(wd(3, "شهر")), tag: "عکس واقعی", over: ({ t, u }) => <><Full src="rua26" u={u} fx={0.62} z0={1.05} z1={1.18} /><div style={{ position: "absolute", top: 300, width: W, textAlign: "center" }}><Big size={130} style={{ transform: `scale(${pop(t, wd(3, "گویانیا") - 0.1)})` }}>گویانیا</Big><div style={{ fontFamily: "Q45Bold", fontSize: 48, color: BLUE, direction: "rtl", opacity: prog(t, wd(3, "برزیل") - 0.1, wd(3, "برزیل") + 0.1) }}>برزیل</div></div><Credit>Adelano Lázaro · Public domain</Credit></> },
  { id: "c1", at: cut(S(4)), tag: "تصویر نمادین", over: ({ a, u }) => <Clip src="abandoned" t0={a} u={u} focus={0.5} grade="saturate(0.6) contrast(1.2) brightness(1.35)" /> },
  { id: "c2", at: cut(wd(4, "متروکه")), tag: "تصویر نمادین", over: ({ t, a, u }) => <><Clip src="ruin" t0={a} u={u} focus={0.55} /><Chip t={t} t0={a + 0.05} top={300} size={54} color={BONE}>کلینیکِ متروکه</Chip></> },
  { id: "k1", at: cut(wd(4, "و")), d3: ({ u }) => ({ set: "clinic", prog: u * 1.4, glow: 0, cam: mix(cam([-3.0, 1.7, 4.6], [0.7, 1.35, -0.9], 46), cam([-2.4, 1.6, 3.9], [0.7, 1.4, -0.9], 46), u) }) },
  { id: "k2", at: cut(wd(4, "پرتودرمانی")), d3: ({ u }) => ({ set: "clinic", prog: 1, glow: 0, cam: mix(cam([0.75, 1.75, 3.9], [0.45, 1.55, -0.6], 40), cam([0.65, 1.7, 3.3], [0.45, 1.6, -0.6], 40), u) }),
    over: ({ t, a }) => <Chip t={t} t0={a + 0.05} top={300} size={46} color={AMBER}>دستگاهِ پرتودرمانیِ رهاشده</Chip> },
  { id: "k3", at: cut(S(5)), d3: ({ u }) => ({ set: "clinic", prog: 1, open: u * 1.1, glow: 0.7, cam: mix(cam([1.5, 1.95, 1.0], [0.4, 1.72, -0.05], 36), cam([1.15, 1.9, 0.85], [0.4, 1.73, 0.05], 36), u) }) },
  { id: "p4", at: cut(wd(5, "تا")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="yard23" u={u} fx={0.45} z0={1.08} z1={1.25} /><Chip t={t} t0={a + 0.1} top={300} size={54} color={AMBER}>برای فروشِ فلز</Chip><Credit>{IAEA}</Credit></> },
  { id: "d1", at: cut(S(6)), over: ({ t, a, b }) => {
    const k = easeInOut(prog(t, a + 0.15, wd(6, "18") + 0.1));
    return (
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #142233 0%, #04060a 70%)" }}>
        <div style={{ position: "absolute", top: 300, width: W, textAlign: "center", fontFamily: "Q45Black", fontSize: 58, color: MUTED, direction: "rtl" }}>سپتامبر ۱۹۸۷</div>
        <div style={{ position: "absolute", top: 470, left: 0, width: W, display: "flex", direction: "rtl", justifyContent: "center", gap: 14 }}>
          {[13, 14, 15, 16, 17, 18].map((d, i) => {
            const on = k * 5 >= i - 0.05, hot = i === 0 || (i === 5 && k > 0.98);
            return <div key={d} style={{ width: 150, height: 190, borderRadius: 16, background: hot ? "#0f2a44" : "#10151c", border: `3px solid ${hot ? BLUE : on ? "rgba(238,242,246,0.45)" : "rgba(238,242,246,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Q45Num", fontSize: 96, color: on ? BONE : "#3a424c", transform: `scale(${hot ? 1.08 : 1})`, boxShadow: hot ? `0 0 36px ${BLUE}66` : undefined }}>{fa(d)}</div>;
          })}
        </div>
        <div style={{ position: "absolute", top: 730, width: W, textAlign: "center", transform: `scale(${pop(t, a + 0.1)})` }}><Big size={130} color={BLUE}>۵ روز بعد</Big></div>
        <div style={{ position: "absolute", top: 920, width: W, textAlign: "center", fontFamily: "Q45Bold", fontSize: 44, color: MUTED, direction: "rtl", opacity: prog(t, b - 0.9, b - 0.6) }}>تکه‌های دستگاه فروخته شد</div>
      </AbsoluteFill>
    );
  } },
  { id: "p5", at: cut(wd(6, "صاحب")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="yard24" u={u} fx={0.4} z0={1.05} z1={1.2} dx={-30} /><Chip t={t} t0={a + 0.1} top={300} size={50} color={BONE}>یک آهن‌قراضه‌فروشی در گویانیا</Chip><Credit>{IAEA}</Credit></> },
  { id: "y1", at: cut(wd(6, "متوجه")), d3: ({ u }) => ({ set: "yard", lights: 1, glow: 0.3, prog: u * 1.3, cam: mix(cam([3.4, 1.9, 4.8], [0, 0.6, -1.4], 46), cam([2.6, 1.6, 4.0], [0, 0.5, -1.0], 46), u) }) },
  { id: "y2", at: cut(wd(6, "توی")), d3: ({ t, u }) => ({ set: "yard", lights: 1 - prog(t, tDark, tDark + 0.3), glow: 0.3 + 0.7 * prog(t, tDark, tDark + 0.5), prog: 1, cam: mix(cam([1.1, 0.5, 1.7], [0.1, 0.2, 0], 40), cam([0.8, 0.42, 1.35], [0.12, 0.18, 0], 40), u) }),
    over: ({ t }) => <Chip t={t} t0={wd(6, "نور") - 0.1} top={300} size={60} color={BLUE}>نورِ آبی در تاریکی</Chip> },
  { id: "f1", at: cut(S(7)), d3: ({ u }) => ({ set: "room", mode: "family", lights: 0.1, glow: 1, cam: mix(cam([2.6, 1.9, 3.0], [0, 0.95, 0], 44), cam([1.9, 1.7, 2.6], [0, 0.95, 0], 44), u) }) },
  { id: "f2", at: cut(wd(7, "به")), d3: ({ u }) => ({ set: "room", mode: "family", lights: 0.1, glow: 1, cam: mix(cam([0.4, 3.3, 0.9], [0, 0.8, 0], 46), cam([0.3, 2.9, 0.7], [0, 0.8, 0], 46), u) }),
    over: ({ t, a }) => <Chip t={t} t0={a + 0.1} top={300} size={52} color={BONE}>خانواده و دوستان</Chip> },
  { id: "w1", at: cut(S(8)), d3: ({ t, a, u }) => ({ set: "town", spread: prog(t, a + 0.1, a + 1.75), cam: mix(cam([-12, 30, 30], [0, 0, 1], 44), cam([-5, 34, 25], [0, 0, 1], 44), u) }),
    over: ({ t, a }) => <Chip t={t} t0={a + 0.3} top={300} size={52}>خانه به خانه</Chip> },
  { id: "p7", at: cut(wd(8, "خونه‌های")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="maphouse" u={u} fx={0.7} fy={0.6} z0={1.05} z1={1.2} /><Chip t={t} t0={a + 0.1} top={300} size={44} color={BONE}>محلِ یکی از خانه‌ها · امروز</Chip><Credit>marciosampaio / Mapillary · CC BY-SA 4.0</Credit></> },
  { id: "c3", at: cut(S(9)), tag: "تصویر نمادین", over: ({ t, a, u }) => <><Clip src="hospital" t0={a} u={u} focus={0.62} /><Chip t={t} t0={wd(9, "مریض") - 0.1} top={300} size={62} color={RED}>آدما مریض شدن</Chip></> },
  { id: "b1", at: cut(S(10)), d3: ({ t, a, u }) => ({ set: "body", spin: -0.5 + (t - a) * 0.5, burn: 0.15 + 0.5 * u, cam: mix(cam([0, 1.3, 3.9], [0, 1.0, 0], 42), cam([0, 1.25, 3.3], [0, 1.02, 0], 42), u) }),
    over: ({ t }) => (
      <div style={{ position: "absolute", top: 290, right: 60, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
        {([["حالتِ تهوع", wd(10, "حالت")], ["استفراغ", wd(10, "استفراغ")]] as [string, number][]).map(([w, t0]) => t > t0 - 0.1 && (
          <div key={w} style={{ direction: "rtl", fontFamily: "Q45Black", fontSize: 54, color: BONE, background: "rgba(4,6,10,0.84)", border: `2.5px solid ${RED}`, borderRadius: 12, padding: "8px 26px", transform: `scale(${pop(t, t0 - 0.1)})`, transformOrigin: "right center" }}>{w}</div>
        ))}
      </div>
    ) },
  { id: "b2", at: cut(wd(10, "سوختگی‌های")), d3: ({ u }) => ({ set: "body", spin: 0.3, burn: 0.7 + 0.3 * u, cam: mix(cam([1.25, 1.55, 2.0], [0.2, 1.22, 0.25], 34), cam([1.05, 1.5, 1.7], [0.2, 1.22, 0.25], 34), u) }),
    over: ({ t, a }) => <Chip t={t} t0={a + 0.05} top={300} size={58} color={RED} solid>سوختگی‌های عجیب</Chip> },
  { id: "u1", at: cut(S(11)), d3: ({ u }) => { const p = 0.15 + 0.22 * u, bx = -22 + p * 40; return { set: "bus", mode: "bus", prog: p, cam: cam([bx + 21 - 5 * u, 2.6, 9.5], [bx + 2, 2.0, 0.6], 38) }; },
    over: ({ t, a }) => <><Chip t={t} t0={a + 0.05} top={290} size={70} color={BONE}>۲۸ سپتامبر</Chip><Chip t={t} t0={wd(11, "همسر") - 0.1} top={440} size={40} color={BLUE}>۱۵ روز بعد از شروع ماجرا</Chip></> },
  { id: "u2", at: cut(wd(11, "بقایای")), d3: ({ u }) => { const p = 0.5 + 0.1 * u, bx = -22 + p * 40; return { set: "bus", mode: "bus", prog: p, cam: cam([bx + 3.6, 2.7, 8.6], [bx - 0.1, 2.0, 1.3], 46) }; },
    over: ({ t, a }) => <Chip t={t} t0={a + 0.1} top={300} size={48}>با اتوبوس · یک کیسه در دست</Chip> },
  { id: "u3", at: cut(wd(11, "مرکز")), d3: ({ u }) => ({ set: "bus", mode: "desk", glow: 0.85, prog: 0.45 * u, cam: mix(cam([2.1, 1.7, 62.6], [0, 0.95, 60], 44), cam([1.6, 1.55, 62.1], [0, 0.95, 60], 44), u) }),
    over: ({ t, a }) => <Chip t={t} t0={a + 0.05} top={300} size={54} color={BONE}>مرکزِ بهداشت</Chip> },
  { id: "c4", at: cut(wd(11, "و")), tag: "تصویر نمادین", over: ({ t, a, u }) => <><Clip src="hazmat" t0={a} u={u} portrait z0={1.02} z1={1.12} /><Chip t={t} t0={a + 0.05} top={300} size={54} color={AMBER}>یک روز بعد · ۲۹ سپتامبر</Chip></> },
  { id: "u4", at: cut(wd(11, "حقیقت")), d3: ({ u }) => ({ set: "bus", mode: "desk", glow: 1, prog: 0.45 + 0.55 * easeOut(u), cam: mix(cam([1.15, 1.35, 61.0], [0.38, 0.92, 60.05], 36), cam([0.95, 1.25, 60.8], [0.4, 0.92, 60.05], 36), u) }),
    over: ({ t }) => <Stamp t={t} t0={wd(11, "فاش") - 0.05} text="حقیقت فاش شد" top={300} size={92} /> },
  { id: "a1", at: cut(S(12)), d3: ({ u }) => ({ set: "room", mode: "beauty", lights: 0, glow: 1, cam: mix(cam([0.6, 0.4, 1.0], [0, 0.2, 0], 40), cam([0.4, 0.3, 0.75], [0, 0.2, 0], 40), u) }) },
  { id: "a2", at: cut(wd(12, "سزیوم")), d3: ({ u }) => ({ set: "atom", mode: "atom", glow: prog(u, 0.35, 0.7), cam: mix(cam([0, 0.8, 8.2], [0, -0.5, 0], 44), cam([0, 0.6, 6.6], [0, -0.5, 0], 44), easeOut(u)) }),
    over: ({ t, a }) => (
      <div style={{ position: "absolute", top: 250, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, a + 0.05)})` }}>
        <div style={{ width: 300, height: 320, borderRadius: 18, border: `4px solid ${BLUE}`, background: "rgba(4,6,10,0.86)", boxShadow: `0 0 50px ${BLUE}55`, position: "relative", color: BONE }}>
          <div style={{ position: "absolute", top: 14, left: 20, fontFamily: "Q45Mono", fontSize: 40, color: MUTED }}>55</div>
          <div style={{ position: "absolute", top: 14, right: 20, fontFamily: "Q45Mono", fontSize: 40, color: BLUE, opacity: prog(t, wd(12, "137") - 0.1, wd(12, "137") + 0.1) }}>137</div>
          <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: "Q45Mono", fontSize: 150, lineHeight: 1.1 }}>Cs</div>
          <div style={{ position: "absolute", bottom: 18, width: "100%", textAlign: "center", fontFamily: "Q45Black", fontSize: 44, direction: "rtl" }}>سزیوم</div>
        </div>
      </div>
    ) },
  { id: "c5", at: cut(wd(12, "یه")), tag: "تصویر نمادین", over: ({ t, a, u }) => <><Clip src="hazmat2" t0={a} u={u} focus={0.38} /><Stamp t={t} t0={wd(12, "شدت") - 0.1} text="به‌شدت رادیواکتیو" top={310} size={84} color={AMBER} /></> },
  { id: "p8", at: cut(S(13)), tag: "عکس واقعی", over: ({ t, a, u }) => <><Print src="stadium" u={u} w={960} ratio={1.5} top={470} rot={-1.5} t={t} t0={a} caption="محلِ بررسیِ مردم · امروز" /><Chip t={t} t0={a + 0.05} top={300} size={50} color={BONE}>استادیومِ المپیکِ گویانیا</Chip><Credit>Adelano Lázaro · Public domain</Credit></> },
  { id: "n1", at: cut(wd(13, "هزار")), d3: ({ u }) => ({ set: "field", mode: "crowd", prog: 0.25 + 0.75 * easeOut(u), cam: mix(cam([-30, 9, 24], [-4, 0, -4], 50), cam([-20, 14, 28], [-2, 0, -4], 50), u) }),
    over: ({ t, a, b }) => <Count value={112000 * (0.4 + 0.6 * easeOut(prog(t, a, b - 0.3)))} label="نفر بررسی شدن" t={t} t0={a} size={170} /> },
  { id: "n2", at: cut(S(14)), d3: ({ u }) => ({ set: "field", mode: "squad", prog: easeInOut(prog(u, 0.05, 0.8)), cam: mix(cam([0, 12, 177], [0, 0, 160], 44), cam([0, 15, 179], [0, 0, 160], 44), u) }),
    over: ({ t, a, b }) => <Count value={249 * easeInOut(prog(t, a + 0.1, b - 0.5))} label="نفر آلوده" color={BLUE} t={t} t0={a} /> },
  { id: "n3", at: cut(wd(14, "و")), d3: ({ t, u }) => ({ set: "field", mode: "squad", prog: 1, dead: easeInOut(prog(t, wd(14, "چهار") - 0.3, wd(14, "چهار") + 0.5)), cam: mix(cam([7, 5.5, 173], [0, 0.8, 160.5], 46), cam([5, 4.2, 171], [0, 0.9, 160.5], 46), u) }),
    over: ({ t }) => <Count value={4} label="نفر جان باختن" color={BONE} t={t} t0={wd(14, "چهار") - 0.1} size={230} /> },
  { id: "p9", at: cut(wd(14, "جونشون")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="cemetery" u={u} fx={0.55} fy={0.7} z0={1.06} z1={1.2} grade="saturate(0.45) contrast(1.12) brightness(0.8)" /><Chip t={t} t0={a + 0.1} top={300} size={44} color={BONE}>گورستانِ گویانیا · قبرهای بتنی</Chip><Credit>{IAEA}</Credit></> },
  { id: "p10", at: cut(S(15)), tag: "عکس واقعی", over: ({ t, a, u }) => <><Print src="victim" u={u} w={700} ratio={0.658} top={280} rot={1.5} t={t} t0={a} /><Credit>{IAEA}</Credit></> },
  { id: "r1", at: cut(S(16)), d3: ({ u }) => ({ set: "room", mode: "beauty", lights: 0, glow: 1, cam: mix(cam([1.0, 0.45, 1.5], [0, 0.35, 0], 42), cam([0.7, 0.8, 1.9], [0, 0.5, 0], 42), u) }) },
  { id: "p11", at: cut(wd(16, "یه")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="graffiti" u={u} fx={0.62} z0={1.04} z1={1.16} grade="saturate(0.9) contrast(1.08) brightness(0.9)" /><Chip t={t} t0={a + 0.1} top={300} size={40} color={BONE}>دیوارِ یادبود: «در باغچه‌ام گل‌های آبی می‌روید»</Chip><Credit>{IAEA}</Credit></> },
  { id: "p12", at: cut(S(17)), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="local" u={u} fx={0.5} fy={0.6} z0={1.05} z1={1.2} grade="saturate(0.6) contrast(1.1) brightness(0.85)" /><Chip t={t} t0={a + 0.1} top={300} size={50} color={BONE}>محلِ حادثه، امروز: زیرِ بتن</Chip><Credit>Ycaro Gouveia Ribeiro · Public domain</Credit></> },
  { id: "p13", at: cut(wd(17, "داره")), tag: "عکس واقعی", over: ({ t, a, u }) => <><Full src="waste" u={u} fx={0.5} fy={0.55} z0={1.05} z1={1.18} grade="saturate(0.7) contrast(1.1) brightness(0.85)" /><Chip t={t} t0={a + 0.1} top={300} size={44} color={AMBER}>زباله‌های رادیواکتیو، دفن‌شده بیرونِ شهر</Chip><Credit>{IAEA}</Credit></> },
  { id: "e1", at: E(17) + 0.2, d3: ({ u }) => ({ set: "room", mode: "beauty", lights: 0, glow: 1 - 0.6 * u, cam: mix(cam([0.7, 0.8, 1.9], [0, 0.5, 0], 42), cam([0.9, 1.0, 2.3], [0, 0.5, 0], 42), u) }),
    over: ({ t, a }) => (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(3,4,6,${0.45 * prog(t, a, a + 0.4)})` }}>
        <div style={{ transform: `scale(${pop(t, a + 0.05, 0.5)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          <div style={{ fontFamily: "Q45Bebas", fontSize: 150, letterSpacing: 10, color: BONE, display: "flex", alignItems: "center", gap: 22 }}><span style={{ width: 44, height: 44, borderRadius: 22, background: RED }} />SCENE ZERO</div>
          <div style={{ direction: "rtl", fontFamily: "Q45Black", fontSize: 56, color: INK, background: BONE, padding: "12px 40px", borderRadius: 14 }}>تو بودی بهش دست می‌زدی؟</div>
        </div>
      </AbsoluteFill>
    ) },
];
const idxAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].at) k = i; return k; };
const ctxAt = (t: number) => { const i = idxAt(t), a = SHOTS[i].at, b = SHOTS[i + 1]?.at ?? TOTAL; return { sh: SHOTS[i], c: { t, a, b, u: prog(t, a, b) } as Ctx }; };
const stateAt = (t: number): State | null => { const { sh, c } = ctxAt(t); return sh.d3 ? { ...BASE, t, ...sh.d3(c) } : null; };

const World3D: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const world = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.15;
    const tex = (u: string) => { const x = new THREE.Texture(IMGS[u]); x.needsUpdate = true; return x; };
    return buildWorld(scene, gl, tex);
  }, [gl, scene]);
  const s = stateAt(t);
  useLayoutEffect(() => { if (s) world.update(s, camera as THREE.PerspectiveCamera); });
  useFrame(() => { if (s) gl.render(scene, camera); }, 1);
  return null;
};

/* ───────── captions */
type Wd = { w: string; s: number; e: number; line: number };
const KEY = new Set(["پودری", "پودر", "آبی", "می‌درخشید", "رادیواکتیو", "فاجعه‌بارترین", "سزیوم", "137", "112", "هزار", "249", "چهار", "مریض", "سوختگی‌های", "گویانیا", "حقیقت", "وحشتناک", "تاریکی", "شش", "ساله", "نابود"]);
const CAPS: { words: Wd[]; s: number; e: number }[] = (() => {
  const out: { words: Wd[]; s: number; e: number }[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n) as Wd[];
    let cur: Wd[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const nx = ws[i + 1];
      if (!nx || /[،.؟]$/.test(w.w) || cur.length >= 3 || (cur.length >= 2 && nx.s - w.e > 0.2)) { out.push({ words: cur, s: cur[0].s, e: w.e }); cur = []; }
    });
  }
  out.forEach((c, i) => { const n = out[i + 1]; c.e = n ? Math.min(n.s, c.e + 0.5) : c.e + 0.5; });
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const u = easeOut(prog(t, c.s - 0.05, c.s + 0.1));
  return (
    <div style={{ position: "absolute", top: 1330, width: W, display: "flex", justifyContent: "center", transform: `translateY(${(1 - u) * 18}px) scale(${0.94 + 0.06 * u})`, opacity: u }}>
      <div style={{ direction: "rtl", display: "flex", gap: 22, padding: "10px 30px", borderRadius: 16, background: "rgba(4,6,10,0.76)" }}>
        {c.words.map((w, i) => {
          const bare = w.w.replace(/[،.]$/, ""), on = t >= w.s - 0.03, key = KEY.has(bare);
          return <span key={i} style={{ fontFamily: "Q45Black", fontSize: 76, lineHeight: 1.3, color: on ? (key ? BLUE : "#fff") : "rgba(255,255,255,0.4)", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{fa(bare)}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── main */
const Video: React.FC<{ audio?: string; at?: number }> = ({ audio, at: tAt }) => {
  const frame = useCurrentFrame();
  const t = tAt ?? frame / FPS;
  const { sh, c } = ctxAt(t);
  const three = !!sh.d3;
  const flash = SHOTS.reduce((acc, s) => acc + (s.at > 0 && t >= s.at && t < s.at + 0.1 ? 0.2 * (1 - (t - s.at) / 0.1) : 0), 0);
  const shake = [wd(11, "فاش"), wd(14, "چهار")].reduce((acc, x) => acc + (t > x && t < x + 0.35 ? 10 * (1 - (t - x) / 0.35) : 0), 0);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * shake}px, ${Math.cos(t * 77) * shake}px)` }}>
        <AbsoluteFill style={{ opacity: three ? 1 : 0 }}>
          <ThreeCanvas width={W} height={H} gl={{ antialias: true, stencil: false, preserveDrawingBuffer: true }} camera={{ fov: 45, near: 0.05, far: 900, position: [0, 2, 5] }}>
            <World3D t={t} />
          </ThreeCanvas>
        </AbsoluteFill>
        {sh.over?.(c)}
        {three ? sh.id !== "e1" && <Tag>بازسازی سه‌بعدی</Tag> : sh.tag && <Tag dot={sh.tag === "عکس واقعی" ? "#4CFF8A" : AMBER}>{sh.tag}</Tag>}
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 120, left: 44, display: "flex", alignItems: "center", gap: 12, fontFamily: "Q45Bebas", fontSize: 40, letterSpacing: 4, color: BONE, opacity: 0.88 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />SCENE ZERO
      </div>
      <Captions t={t} />
      <AbsoluteFill style={{ background: `rgba(200,232,255,${flash})` }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${prog(t, TOTAL - 0.35, TOTAL)})` }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

// review: the middle of every shot
const LOOK = SHOTS.map((s, i) => { const b = SHOTS[i + 1]?.at ?? TOTAL; return s.at + (b - s.at) * 0.62; });
const Look: React.FC = () => { const f = useCurrentFrame(); return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />; };
export const SHOT_TIMES = SHOTS.map((s) => [s.id, +s.at.toFixed(2)] as const);
export const V45Compositions: React.FC = () => (
  <>
    <Composition id="V45" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v45/mix-norm.wav" }} />
    <Composition id="V45-Silent" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V45-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
void GOIANIA;
