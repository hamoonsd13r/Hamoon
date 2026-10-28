// V21 · قوانین شیفت شب: پرستار بخش ۴ — قالب ریلز «قوانین هتل» (مرجع: videos/ref-study/dbgez) با عکس‌های واقع‌گرای کاربر.
// دوربین آرام Ken Burns + لرزش دستی، گرید سبز مهتابی، دانه‌ی فیلم، چشمک مهتابی، کارت سیاه «قانون …» با خط نوار قلب،
// زیرنویس ۲–۳ کلمه‌ای وسط قاب، و جزئیات با کد: تابلوی نئون، کارت اسم، شمارنده‌ی تخت، ۴۰۴، اسم روی پرونده، دکمه‌ی «−۲».
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v21 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V21Black", "fonts/Vazirmatn-Black.ttf"], ["V21Bold", "fonts/Vazirmatn-Bold.ttf"], ["V21Reg", "fonts/Vazirmatn-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,]/g, "");
const wd = (si: number, word: string) => {
  const w = words.find((x) => x.si === si && bare(x.w) === word) ?? words.find((x) => x.si === si && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const segStart = (si: number) => words.find((w) => w.si === si)!.s;
const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;

// ───── timeline (all from the voice) ─────
const S = segStart, E = segEnd;
const CARDS = [
  { si: 2, title: "قانون اول", from: E(1) + 0.3, to: S(3) - 0.15 },
  { si: 6, title: "قانون دوم", from: E(5) + 0.3, to: S(7) - 0.15 },
  { si: 10, title: "قانون سوم", from: E(9) + 0.3, to: S(11) - 0.15 },
  { si: 14, title: "قانون چهارم", from: E(13) + 0.3, to: S(15) - 0.15 },
];
const T12 = wd(4, "دوازده"); // the twelfth bed
const BELL = S(7); // nurse call
const LIGHTS_OFF = wd(8, "خاموش");
const NAME = wd(12, "خودت"); // name written on the file
const WHISPER = wd(13, "هرچی");
const BTN = wd(17, "دکمه");
const DOOR = E(17) + 0.5; // doors close (code)
const END = DOOR + 1.1; // black, «−۲»
const TOTAL = END + 3.2;
export const V21_FRAMES = Math.round(TOTAL * FPS);

// ───── camera ─────
type Key = { t: number; fx: number; fy: number; s: number; ease?: number };
const camAt = (keys: Key[], T: number) => {
  let cur = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (T < k.t) break;
    const p = easeInOut(prog(T, k.t, k.t + (k.ease ?? 0.6)));
    cur = { t: k.t, fx: cur.fx + (k.fx - cur.fx) * p, fy: cur.fy + (k.fy - cur.fy) * p, s: cur.s + (k.s - cur.s) * p };
  }
  return cur;
};
type Place = { x: number; y: number; dw: number; dh: number };
const place = (fx: number, fy: number, s: number, T: number, shake = 0): Place => {
  const dw = W * s, dh = (W / IMG_AR) * s;
  const hx = (noise(T * 0.6) - 0.5) * 14 + (noise(T * 2.1 + 9) - 0.5) * 4 + Math.sin(T * 63) * shake;
  const hy = (noise(T * 0.5 + 3) - 0.5) * 12 + Math.sin(T * 1.3) * 3 + Math.cos(T * 57) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });
// slow push-in over the whole shot (reference: steady creeping zoom)
const push = (from: number, to: number, fx: number, fy: number, s0: number, s1: number, fx1 = fx, fy1 = fy): Key[] =>
  [{ t: from, fx, fy, s: s0 }, { t: from, fx: fx1, fy: fy1, s: s1, ease: to - from + 0.4 }];

const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number; blend?: string }> = ({ p, ix, iy, r, color, a, blend = "screen" }) => {
  const c = at(p, ix, iy), rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};
// fluorescent tube: mostly steady, rare drop-outs
const tube = (T: number, seed = 0) => (noise(T * 7 + seed) > 0.86 ? 0.55 : 1) * (0.94 + 0.06 * Math.sin(T * 100 + seed));
// text placed on the photo, in image fractions; size follows the zoom
const OnImg: React.FC<{ p: Place; ix: number; iy: number; size: number; style?: React.CSSProperties; children: React.ReactNode; rot?: number }> = ({ p, ix, iy, size, style, children, rot = 0 }) => {
  const c = at(p, ix, iy), k = p.dw / W;
  return <div style={{ position: "absolute", left: c.x, top: c.y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, fontSize: size * k, direction: "rtl", whiteSpace: "nowrap", ...style }}>{children}</div>;
};

// ───── shots ─────
type Shot = { img: string; from: number; to: number; keys: Key[]; shake?: (T: number) => number; grade?: (T: number) => string; extra?: (T: number, p: Place) => React.ReactNode };
const GRADE = "contrast(1.1) saturate(0.8) brightness(0.95)";
const cut = (a: number) => a - 0.1;

const SHOTS: Shot[] = [
  { // hospital at night + neon sign
    img: "v21/s01.jpg", from: 0, to: cut(S(1)), keys: push(0, cut(S(1)), 0.5, 0.42, 1.06, 1.2, 0.5, 0.47),
    grade: () => "contrast(1.1) saturate(0.85) brightness(1.12)",
    extra: (T, p) => {
      const on = (i: number) => (noise(T * 5 + i * 13) > 0.9 ? 0.25 : 1);
      return <>
        <OnImg p={p} ix={0.5} iy={0.485} size={74} style={{ fontFamily: "V21Black", color: "#B8FFD9", letterSpacing: 2,
          textShadow: "0 0 10px #4DFFA6, 0 0 30px #1FD483, 0 0 60px rgba(31,212,131,0.6)" }}>
          <span style={{ opacity: on(1) }}>بیمارستان</span> <span style={{ opacity: on(2) * (T > 1.6 && T < 1.75 ? 0.15 : 1) }}>مهر</span>
        </OnImg>
        <Glow p={p} ix={0.5} iy={0.49} r={0.32} color="rgba(60,255,160,A)" a={0.16 * on(1)} />
        <Rain T={T} />
      </>;
    },
  },
  { // walking down the corridor
    img: "v21/s02.jpg", from: cut(S(1)), to: cut(wd(1, "شرطی")), keys: push(cut(S(1)), cut(wd(1, "شرطی")), 0.5, 0.5, 1.04, 1.16, 0.5, 0.46),
    extra: (T, p) => <Glow p={p} ix={0.51} iy={0.2} r={0.12} color="rgba(190,255,235,A)" a={0.25 * tube(T, 2)} />,
  },
  { // at the nurse station, name tag
    img: "v21/s03.jpg", from: cut(wd(1, "شرطی")), to: CARDS[0].from, keys: push(cut(wd(1, "شرطی")), CARDS[0].from, 0.5, 0.42, 1.05, 1.22, 0.53, 0.42),
    extra: (T, p) => <>
      <OnImg p={p} ix={0.574} iy={0.537} size={13} style={{ fontFamily: "V21Black", color: "#1D2B3A" }}>سارا رحیمی</OnImg>
      <OnImg p={p} ix={0.574} iy={0.551} size={9.5} style={{ fontFamily: "V21Bold", color: "#3B556E" }}>پرستار · بخش ۴</OnImg>
      <Glow p={p} ix={0.53} iy={0.06} r={0.1} color="rgba(190,255,235,A)" a={0.3 * tube(T, 5)} />
    </>,
  },
  { // dimmer + wall clock at twelve
    img: "v21/s04.jpg", from: CARDS[0].to, to: cut(S(4)), keys: push(CARDS[0].to, cut(S(4)), 0.45, 0.48, 1.05, 1.18, 0.4, 0.5),
    grade: (T) => `contrast(1.1) saturate(0.8) brightness(${0.98 - 0.25 * easeOut(prog(T, wd(3, "کم") - 0.2, wd(3, "کم") + 0.9))})`,
  },
  { // the ward, counting beds
    img: "v21/s05.jpg", from: cut(S(4)), to: T12 - 0.03, keys: push(cut(S(4)), T12, 0.5, 0.52, 1.0, 1.25, 0.5, 0.47),
    extra: (T, p) => <>
      <Glow p={p} ix={0.505} iy={0.07} r={0.1} color="rgba(150,255,220,A)" a={0.3 * tube(T, 7)} />
      <BedCount T={T} />
    </>,
  },
  { // the twelfth bed
    img: "v21/s06.jpg", from: T12 - 0.03, to: cut(S(5)), keys: push(T12 - 0.03, cut(S(5)), 0.5, 0.47, 1.08, 1.28, 0.49, 0.45), shake: (T) => 4 * (1 - prog(T, T12, T12 + 0.5)),
    extra: (T, p) => <>
      <Glow p={p} ix={0.5} iy={0.35} r={0.22} color="rgba(170,255,230,A)" a={0.22 * tube(T, 9)} />
      <BedCount T={T} />
    </>,
  },
  { // pulling the curtain
    img: "v21/s07.jpg", from: cut(S(5)), to: CARDS[1].from, keys: push(cut(S(5)), CARDS[1].from, 0.55, 0.45, 1.12, 1.0, 0.5, 0.48),
  },
  { // nurse call panel, one red bulb
    img: "v21/s08.jpg", from: CARDS[1].to, to: cut(wd(7, "اون")), keys: push(CARDS[1].to, cut(wd(7, "اون")), 0.55, 0.42, 1.08, 1.3, 0.6, 0.41),
    extra: (T, p) => {
      const ring = Math.floor((T - BELL) * 2.2) % 2 === 0 ? 1 : 0.35;
      return <>
        <Glow p={p} ix={0.609} iy={0.411} r={0.12} color="rgba(255,40,30,A)" a={0.55 * ring} />
        <RoomTag T={T} />
      </>;
    },
  },
  { // sealed room 404
    img: "v21/s09.jpg", from: cut(wd(7, "اون")), to: cut(S(8)), keys: push(cut(wd(7, "اون")), cut(S(8)), 0.5, 0.45, 1.04, 1.16, 0.5, 0.5),
    extra: (T, p) => <>
      <OnImg p={p} ix={0.497} iy={0.072} size={46} style={{ fontFamily: "V21Black", color: "rgba(30,40,38,0.85)", textShadow: "0 1px 0 rgba(255,255,255,0.15)" }}>۴۰۴</OnImg>
      <Glow p={p} ix={0.5} iy={0.86} r={0.3} color="rgba(255,30,20,A)" a={0.28 + 0.18 * noise(T * 3)} />
      <RoomTag T={T} />
    </>,
  },
  { // empty wheelchair in the corridor
    img: "v21/s10.jpg", from: cut(S(8)), to: cut(S(9)), keys: push(cut(S(8)), cut(S(9)), 0.5, 0.55, 1.02, 1.22, 0.5, 0.6),
    grade: (T) => `contrast(1.12) saturate(0.8) brightness(${0.95 * tube(T, 3) * (1 - 0.6 * easeOut(prog(T, LIGHTS_OFF, LIGHTS_OFF + 0.15)))})`,
  },
  { // under the counter, holding her breath
    img: "v21/s11.jpg", from: cut(S(9)), to: CARDS[2].from, keys: push(cut(S(9)), CARDS[2].from, 0.45, 0.42, 1.06, 1.3, 0.4, 0.4),
    grade: (T) => `contrast(1.15) saturate(0.75) brightness(${0.78 + 0.04 * Math.sin(T * 2)})`,
    shake: (T) => 1.5 + 2 * prog(T, wd(9, "نفس") - 0.3, wd(9, "نفس")),
  },
  { // elevator with the stretcher
    img: "v21/s12.jpg", from: CARDS[2].to, to: cut(S(12)), keys: push(CARDS[2].to, cut(S(12)), 0.5, 0.5, 1.02, 1.2, 0.5, 0.52),
    extra: (T, p) => <>
      <Glow p={p} ix={0.5} iy={0.255} r={0.18} color="rgba(190,255,240,A)" a={0.3 * tube(T, 11)} />
      <Clock T={T} from={CARDS[2].to} to={cut(S(12))} label="۰۳:۰۰" />
    </>,
  },
  { // the case file: her own name
    img: "v21/s13.jpg", from: cut(S(12)), to: cut(S(13)), keys: [{ t: cut(S(12)), fx: 0.5, fy: 0.45, s: 1.05 }, { t: wd(12, "اگه"), fx: 0.45, fy: 0.4, s: 1.6, ease: 1.4 }],
    extra: (T, p) => {
      const ink = easeOut(prog(T, NAME - 0.15, NAME + 0.6));
      return <>
        {/* cover the English header with paper, print a Persian one */}
        <PaperPatch p={p} x0={0.4} y0={0.333} x1={0.6} y1={0.35} />
        <OnImg p={p} ix={0.5} iy={0.342} size={15} style={{ fontFamily: "V21Black", color: "rgba(40,52,50,0.9)" }}>پرونده‌ی بیمار</OnImg>
        <OnImg p={p} ix={0.445} iy={0.357} size={22} rot={-1.5} style={{ fontFamily: "V21Bold", color: "rgba(25,45,120,0.9)", clipPath: `inset(0 0 0 ${(1 - ink) * 100}%)` }}>سارا رحیمی</OnImg>
      </>;
    },
  },
  { // she shuts the elevator; something stands behind the stretcher
    img: "v21/s15.jpg", from: cut(S(13)), to: cut(WHISPER), keys: push(cut(S(13)), cut(WHISPER), 0.45, 0.45, 1.05, 1.22, 0.35, 0.38),
    extra: (T, p) => <Glow p={p} ix={0.39} iy={0.2} r={0.1} color="rgba(190,255,240,A)" a={0.3 * tube(T, 13)} />,
  },
  { // a hand slips out — her watch
    img: "v21/s14.jpg", from: cut(WHISPER), to: CARDS[3].from, keys: push(cut(WHISPER), CARDS[3].from, 0.5, 0.48, 1.05, 1.4, 0.55, 0.5),
    extra: (T, p) => <Glow p={p} ix={0.535} iy={0.425} r={0.05} color="rgba(230,255,250,A)" a={0.35 * (0.5 + 0.5 * Math.sin(T * 3))} />,
  },
  { // morning nurse doesn't recognise you
    img: "v21/s16.jpg", from: CARDS[3].to, to: cut(S(16)), keys: push(CARDS[3].to, cut(S(16)), 0.5, 0.38, 1.04, 1.28, 0.5, 0.32),
    grade: () => "contrast(1.08) saturate(0.75) brightness(1.02)",
    extra: (T) => <Clock T={T} from={CARDS[3].to} to={cut(S(16))} label="۰۶:۵۵" />,
  },
  { // the ID card: eyes closed
    img: "v21/s17.jpg", from: cut(S(16)), to: cut(wd(17, "برو")), keys: [{ t: cut(S(16)), fx: 0.5, fy: 0.5, s: 1.04 }, { t: wd(16, "عکس") - 0.3, fx: 0.33, fy: 0.5, s: 1.55, ease: 1.6 }],
    extra: (T, p) => <>
      <OnImg p={p} ix={0.65} iy={0.452} size={26} style={{ fontFamily: "V21Black", color: "#1C2733" }}>بیمارستان مهر</OnImg>
      <OnImg p={p} ix={0.65} iy={0.505} size={34} style={{ fontFamily: "V21Black", color: "#16202B" }}>سارا رحیمی</OnImg>
      <OnImg p={p} ix={0.65} iy={0.535} size={22} style={{ fontFamily: "V21Bold", color: "#3E5266" }}>پرستار · بخش ۴</OnImg>
      <OnImg p={p} ix={0.65} iy={0.565} size={20} style={{ fontFamily: "V21Reg", color: "#5A6B7B" }}>شیفت شب</OnImg>
    </>,
  },
  { // inside the elevator, doors closing
    img: "v21/s19.jpg", from: cut(wd(17, "برو")), to: cut(BTN), keys: push(cut(wd(17, "برو")), cut(BTN), 0.55, 0.42, 1.04, 1.25, 0.55, 0.36),
  },
  { // −2
    img: "v21/s18.jpg", from: cut(BTN), to: DOOR, keys: push(cut(BTN), DOOR, 0.5, 0.52, 1.05, 1.3, 0.5, 0.53),
    extra: (T, p) => <>
      <OnImg p={p} ix={0.36} iy={0.531} size={96} style={{ fontFamily: "V21Black", color: "rgba(255,90,70,0.95)", textShadow: "0 0 18px rgba(255,40,20,0.9)", direction: "ltr", display: "flex", alignItems: "center", gap: 4 * p.dw / W }}><span style={{ fontSize: "0.7em", transform: "translateY(-0.08em)" }}>−</span><span>۲</span></OnImg>
      <Glow p={p} ix={0.5} iy={0.533} r={0.12} color="rgba(255,40,30,A)" a={0.3 + 0.2 * easeOut(prog(T, BTN, BTN + 0.2))} />
    </>,
  },
  { // last look at her as the doors shut
    img: "v21/s19.jpg", from: DOOR, to: END, keys: push(DOOR, END, 0.55, 0.36, 1.25, 1.45, 0.55, 0.3),
  },
];

const ShotView: React.FC<{ d: Shot; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  const p = place(c.fx, c.fy, c.s, T, d.shake?.(T) ?? 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: d.grade?.(T) ?? GRADE }}>
      <Img src={staticFile(d.img)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

const PaperPatch: React.FC<{ p: Place; x0: number; y0: number; x1: number; y1: number }> = ({ p, x0, y0, x1, y1 }) => {
  const a = at(p, x0, y0), b = at(p, x1, y1);
  return <div style={{ position: "absolute", left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, background: "rgb(181,208,202)", filter: "blur(2px)" }} />;
};

const Rain: React.FC<{ T: number }> = ({ T }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: 0.35 }}>
    {Array.from({ length: 70 }, (_, i) => {
      const x = hash(i) * W, sp = 1400 + hash(i + 50) * 900, y = ((hash(i + 99) * H + T * sp) % (H + 200)) - 100;
      return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 46} stroke="rgba(200,255,235,0.55)" strokeWidth={1.4} />;
    })}
  </svg>
);

// bed counter while she counts (rule 1)
const BedCount: React.FC<{ T: number }> = ({ T }) => {
  const a = wd(4, "یازده") - 0.1;
  if (T < a || T > S(5) - 0.1) return null;
  const twelve = T >= T12 - 0.03;
  const pop = twelve ? 1 + 0.25 * (1 - easeOut(prog(T, T12, T12 + 0.3))) : 1;
  const o = easeOut(prog(T, a, a + 0.3));
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", direction: "rtl", opacity: o }}>
      <div style={{ fontFamily: "V21Bold", fontSize: 40, color: "rgba(220,240,235,0.8)", textShadow: "0 0 16px #000" }}>بیمارهای بخش</div>
      <div style={{ fontFamily: "V21Black", fontSize: 150, lineHeight: 1.1, color: twelve ? "#FF4A3D" : "#E6F2EE", transform: `scale(${pop})`,
        textShadow: twelve ? "0 0 40px rgba(255,40,30,0.8), 0 0 12px #000" : "0 0 30px #000" }}>{twelve ? "۱۲" : "۱۱"}</div>
    </div>
  );
};

const RoomTag: React.FC<{ T: number }> = ({ T }) => {
  const a = BELL - 0.1, b = cut(S(8));
  if (T < a || T > b) return null;
  const blink = Math.floor((T - BELL) * 2.2) % 2 === 0 ? 1 : 0.4;
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", direction: "rtl", opacity: easeOut(prog(T, a, a + 0.25)) }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 34px", borderRadius: 18, background: "rgba(10,14,13,0.72)", border: "2px solid rgba(255,70,55,0.6)" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: `rgba(255,50,40,${blink})`, boxShadow: `0 0 ${24 * blink}px rgba(255,40,30,0.9)` }} />
        <div style={{ fontFamily: "V21Black", fontSize: 56, color: "#F2F5F4" }}>زنگ پرستار · اتاق ۴۰۴</div>
      </div>
    </div>
  );
};

const Clock: React.FC<{ T: number; from: number; to: number; label: string }> = ({ T, from, to, label }) => {
  const o = easeOut(prog(T, from + 0.15, from + 0.5)) * (1 - prog(T, to - 0.3, to));
  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: "V21Black", fontSize: 120, letterSpacing: 4,
      color: `rgba(255,70,55,${0.92 * o})`, textShadow: `0 0 36px rgba(255,40,30,${0.6 * o}), 0 0 10px rgba(0,0,0,${o})`, opacity: Math.floor(T * 1.5) % 2 ? 1 : 0.82 }}>
      {label}
    </div>
  );
};

// ───── «قانون …» card: black frame, title, a heart-monitor trace that beeps once ─────
const Card: React.FC<{ T: number; c: (typeof CARDS)[number] }> = ({ T, c }) => {
  const k = T - c.from, dur = c.to - c.from;
  const a = easeOut(prog(k, 0.05, 0.3));
  const pts: string[] = [];
  const sweep = clamp(k / (dur * 0.9));
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    if (u > sweep) break;
    const x = 90 + u * 900;
    const b = u - 0.5;
    const y = Math.abs(b) < 0.06 ? (b < -0.03 ? -90 * Math.sin((b + 0.06) / 0.03 * Math.PI) : 140 * Math.sin((b + 0.03) / 0.09 * Math.PI) * (b < 0.02 ? -1 : 0.4)) : 0;
    pts.push(`${x},${1120 + y}`);
  }
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "V21Black", fontSize: 108, color: "#F1F4F3", direction: "rtl", opacity: a, transform: `scale(${1.08 - 0.08 * a})`, textShadow: "0 0 30px rgba(120,255,200,0.15)" }}>{c.title}</div>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline points={pts.join(" ")} fill="none" stroke="#FF4A3D" strokeWidth={5} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 10px rgba(255,60,40,0.8))" }} />
        {pts.length > 0 && <circle cx={+pts.at(-1)!.split(",")[0]} cy={+pts.at(-1)!.split(",")[1]} r={9} fill="#FFB0A8" />}
      </svg>
    </AbsoluteFill>
  );
};

// ───── captions: 2–3 word chunks in the middle of the frame (reference) ─────
type Chunk = { si: number; ws: Word[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  const cardSi = new Set(CARDS.map((c) => c.si));
  const segs = [...new Set(words.map((w) => w.si))].filter((si) => !cardSi.has(si));
  for (const si of segs) {
    const ws = words.filter((w) => w.si === si);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const brk = /[،.…,]$/.test(w.w) || cur.length === 3 || i === ws.length - 1;
      if (brk) { out.push({ si, ws: cur, s: cur[0].s, e: 0 }); cur = []; }
    });
  }
  out.forEach((c, i) => { const n = out[i + 1]; const last = c.ws.at(-1)!.e; c.e = n && n.si === c.si ? n.s : last + 0.35; });
  return out;
})();
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const c = CHUNKS.find((x) => T >= x.s - 0.06 && T < x.e);
  if (!c || T >= DOOR) return null;
  const a = easeOut(prog(T, c.s - 0.06, c.s + 0.1));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1150, textAlign: "center", direction: "rtl", fontFamily: "V21Bold", fontSize: 70, lineHeight: 1.4,
      color: "#FFFFFF", textShadow: "0 0 18px rgba(0,0,0,0.95), 0 3px 10px #000, 0 0 3px #000", opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
      {c.ws.map((w) => bare(w.w)).join(" ")}
    </div>
  );
};

// ───── ending: elevator doors close, black, red «−۲» ─────
const Doors: React.FC<{ T: number }> = ({ T }) => {
  if (T < DOOR + 0.2) return null;
  const k = easeInOut(prog(T, DOOR + 0.2, END));
  const half = (W / 2) * k;
  // left steel door of s19 spans x 0.05–0.47 of the image
  const iw = (W / 2) / 0.42, ih = iw / IMG_AR;
  const panel = (right: boolean) => (
    <div style={{ position: "absolute", top: 0, width: W / 2, height: H, overflow: "hidden", left: right ? W - half : half - W / 2, transform: right ? "scaleX(-1)" : undefined,
      boxShadow: right ? "none" : "10px 0 24px rgba(0,0,0,0.85)", filter: "contrast(1.1) saturate(0.7) brightness(0.8)" }}>
      <Img src={staticFile("v21/s19.jpg")} style={{ position: "absolute", width: iw, height: ih, left: -0.05 * iw, top: -(ih - H) * 0.55, maxWidth: "none", maxHeight: "none" }} />
    </div>
  );
  return <>{panel(false)}{panel(true)}</>;
};
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < END) return null;
  const a = easeOut(prog(T, END + 0.35, END + 0.8));
  const fl = noise(T * 6) > 0.85 ? 0.5 : 1;
  const down = ((T - END) * 1.4) % 1;
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ width: 380, padding: "30px 0", borderRadius: 26, background: "#0A0606", border: "3px solid rgba(255,60,45,0.35)", textAlign: "center", opacity: a * fl,
        boxShadow: "0 0 80px rgba(255,40,30,0.25)" }}>
        <div style={{ fontSize: 64, color: "#FF4A3D", opacity: 0.35 + 0.65 * (1 - down), transform: `translateY(${down * 26}px)` }}>▼</div>
        <div style={{ fontFamily: "V21Black", fontSize: 200, lineHeight: 1.05, color: "#FF4A3D", textShadow: "0 0 40px rgba(255,40,30,0.9)", direction: "ltr", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 20 }}>
          <span style={{ fontSize: 140, transform: "translateY(-12px)" }}>−</span><span>۲</span></div>
        <div style={{ fontFamily: "V21Bold", fontSize: 44, color: "rgba(255,120,105,0.85)", direction: "rtl" }}>سردخانه</div>
      </div>
    </AbsoluteFill>
  );
};

// film grain from 8 pre-made noise tiles (feTurbulence per frame was the render bottleneck)
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <Img src={staticFile(`v21/grain${f % 8}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, mixBlendMode: "overlay", opacity: 0.16 }} />
);

const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const shot = SHOTS.find((d) => T >= d.from && T < d.to);
  const card = CARDS.find((c) => T >= c.from && T < c.to);
  // short flash-cut into each new shot (reference cuts are hard; keep a 2-frame lift)
  const lift = shot && !card ? 1 - prog(T, shot.from, shot.from + 2 / FPS) : 0;
  const breathe = 0.5 + 0.05 * Math.sin(T * 1.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot && !card && <ShotView d={shot} T={T} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,${breathe}) 84%, rgba(0,0,0,0.8) 100%)` }} />
      {lift > 0 && <AbsoluteFill style={{ background: `rgba(200,255,235,${0.08 * lift})` }} />}
      <Doors T={T} />
      {card && <Card T={T} c={card} />}
      <EndCard T={T} />
      <Grain f={f} />
      {!card && <Captions T={T} />}
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} f={t !== undefined ? Math.round(t * FPS) : f} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const mid = (d: Shot) => (d.from + d.to) / 2;
const LOOK = [0.05, ...SHOTS.map(mid), CARDS[0].from + 0.6, T12 + 0.4, NAME + 0.8, DOOR + 0.7, END + 1.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V21: React.FC = () => (
  <>
    <Composition id="V21" component={Video} durationInFrames={V21_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v21/mix.wav" }} />
    <Composition id="V21-Silent" component={Video} durationInFrames={V21_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V21-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
