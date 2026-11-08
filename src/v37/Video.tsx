// V37 · «دختری که برای زنده موندن سرباز نیروی دریایی شد» — نریشن و ریتم از ریلز Zack D. Films (DfX8rd4FLMB، با اجازه‌ی سازنده)،
// عکس‌های سه‌بعدی ChatGPT کاربر (public/v37/img/NN = پرامپت NN).
// زبان مرجع: دوربین هیچ‌وقت ثابت نیست، ورود هر نما با حرکت تند + موشن‌بلر جهت‌دار، زیرنویس ۲–۳ کلمه‌ای پایین وسط.
// با کد: تابلوی «۴ ساعت» در افق، صفحه‌ی مقررات با «ممنوع است» قرمز، اسم دختر در دفتر با خط نستعلیق.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capJson from "./captions.json";

type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v37 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V37Black", "fonts/Vazirmatn-Black.ttf"], ["V37Bold", "fonts/Vazirmatn-Bold.ttf"], ["V37Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["V37Hand", "fonts/NotoNastaliqUrdu.ttf"], ["V37Naskh", "fonts/NotoNaskhArabic.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:ً-ْ]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && bare(x.w).includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;

// ───── timeline (from the voice) ─────
export const TOTAL = VO.total + 1.0;
export const V37_FRAMES = Math.round(TOTAL * FPS);
const c = (t: number) => t - 0.06; // cut a hair before the word

// ───── camera ─────
// each shot: a steady drift (fx,fy = image point at screen centre, s = zoom) + an entry move that lands fast and settles softly
type Cam = { fx: number; fy: number; s: number; rot?: number };
type Shot = {
  img?: string; from: number; to: number; a: Cam; b: Cam; in?: { dx?: number; dy?: number; ds?: number; rot?: number; dur?: number };
  shake?: (T: number) => number; bob?: number; extra?: (T: number, p: Place) => React.ReactNode; scene?: (T: number) => React.ReactNode;
};
type Place = { x: number; y: number; dw: number; dh: number; rot: number };
const camAt = (d: Shot, T: number): Cam => {
  const u = easeInOut(prog(T, d.from, d.to + 0.3)) * 0.35 + prog(T, d.from, d.to) * 0.65;
  const e = 1 - easeOut(prog(T, d.from, d.from + (d.in?.dur ?? 0.32)));
  const bob = d.bob ?? 0;
  return {
    fx: lerp(d.a.fx, d.b.fx, u) + (d.in?.dx ?? 0) * e,
    fy: lerp(d.a.fy, d.b.fy, u) + (d.in?.dy ?? 0) * e + Math.sin(T * 2.2) * 0.006 * bob,
    s: lerp(d.a.s, d.b.s, u) + (d.in?.ds ?? 0) * e,
    rot: lerp(d.a.rot ?? 0, d.b.rot ?? 0, u) + (d.in?.rot ?? 0) * e + Math.sin(T * 1.7 + 1) * 0.9 * bob,
  };
};
const place = (k: Cam, T: number, shake = 0): Place => {
  const dw = W * k.s, dh = (W / IMG_AR) * k.s;
  const hx = (noise(T * 0.9) - 0.5) * 12 + Math.sin(T * 63) * shake;
  const hy = (noise(T * 0.8 + 3) - 0.5) * 10 + Math.cos(T * 57) * shake;
  // a rotated frame needs a little more cover
  return { x: clamp(W / 2 - k.fx * dw, W - dw, 0) + hx, y: clamp(H / 2 - k.fy * dh, H - dh, 0) + hy, dw, dh, rot: k.rot ?? 0 };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });

const sh = (n: string, from: number, to: number, a: Cam, b: Cam, more: Partial<Shot> = {}): Shot => ({ img: `v37/img/${n}.jpg`, from, to, a, b, ...more });
const kick = (T: number, t0: number, amp: number, dur = 0.5) => (T > t0 && T < t0 + dur ? amp * (1 - prog(T, t0, t0 + dur)) : 0);

// ───── code overlays ─────
// «۴ ساعت» sign floating over the far end of the road (img 04: vanishing point ≈ 0.47, horizon ≈ 0.40)
const FourHours: React.FC<{ p: Place; T: number; t0: number }> = ({ p, T, t0 }) => {
  if (T < t0) return null;
  const a = easeOut(prog(T, t0, t0 + 0.35)), k = p.dw / W;
  const o = at(p, 0.47, 0.355);
  const pulse = 0.5 + 0.5 * Math.sin((T - t0) * 6);
  return (
    <div style={{ position: "absolute", left: o.x, top: o.y, transform: `translate(-50%,-50%) scale(${(0.5 + 0.5 * a) * k})`, opacity: a, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", top: -60, background: `radial-gradient(circle, rgba(255,255,255,${0.45 + 0.2 * pulse}) 0%, rgba(255,255,255,0) 65%)` }} />
      <div style={{ width: 92, height: 92, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(0,0,0,0.35)", position: "relative" }}>
        <div style={{ position: "absolute", width: 22, height: 64, background: "#E0262B", borderRadius: 3 }} />
        <div style={{ position: "absolute", width: 64, height: 22, background: "#E0262B", borderRadius: 3 }} />
      </div>
      <div style={{ marginTop: 10, fontFamily: "V37Black", fontSize: 54, color: "#fff", direction: "rtl", textShadow: "0 3px 12px rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>۴ ساعت</div>
    </div>
  );
};

// the regulations page (full-screen insert): «ورودِ زنانِ غیرنظامی … ممنوع است.» — «ممنوع است» turns red, underline sweeps
const Rules: React.FC<{ T: number; t0: number; t1: number; red: number }> = ({ T, t0, t1, red }) => {
  const u = prog(T, t0, t1);
  const e = 1 - easeOut(prog(T, t0, t0 + 0.35));
  const s = 1.04 + 0.1 * u + 0.25 * e, r = -4 + 2 * u - 6 * e;
  const ink = "#2A2118";
  const rr = easeOut(prog(T, red, red + 0.3));
  const redCol = `rgb(${Math.round(lerp(42, 205, rr))},${Math.round(lerp(33, 38, rr))},${Math.round(lerp(24, 36, rr))})`;
  const gl = (w: number, i: number) => <div key={i} style={{ height: 14, width: `${w}%`, background: "rgba(60,45,30,0.22)", borderRadius: 7, margin: "18px 0 0 auto" }} />;
  return (
    <AbsoluteFill style={{ background: "#0E1418", overflow: "hidden" }}>
      <Img src={staticFile("v37/img/10.jpg")} style={{ position: "absolute", left: -60, top: -110, width: W + 120, height: (W + 120) / IMG_AR, filter: "blur(22px) brightness(0.55)" }} />
      <div style={{ position: "absolute", left: 110, top: 190, width: 860, height: 1060, transform: `translateY(${e * 380}px) scale(${s}) rotate(${r}deg) perspective(1600px) rotateX(10deg)`, transformOrigin: "50% 45%",
        background: "radial-gradient(ellipse at 45% 40%, #EADBB8 0%, #DCC79B 60%, #C2A672 100%)", borderRadius: 10, boxShadow: "0 40px 90px rgba(0,0,0,0.6), inset 0 0 120px rgba(110,70,20,0.35)",
        padding: "80px 86px", direction: "rtl", color: ink }}>
        <div style={{ fontFamily: "V37Bold", fontSize: 30, textAlign: "center", letterSpacing: 2, opacity: 0.75 }}>مقرراتِ نیروی دریایی · ۱۹۲۰</div>
        <div style={{ height: 3, background: "rgba(60,45,30,0.45)", margin: "22px 0 36px" }} />
        <div style={{ fontFamily: "V37Bold", fontSize: 34, opacity: 0.7 }}>ماده‌ی ۱۰</div>
        {[96, 88, 70].map(gl)}
        <div style={{ fontFamily: "V37Black", fontSize: 40, marginTop: 64, opacity: 0.85 }}>ماده‌ی ۱۱</div>
        <div style={{ fontFamily: "V37Naskh", fontWeight: 700, fontSize: 76, lineHeight: 1.45, marginTop: 18 }}>
          ورودِ زنانِ غیرنظامی به کشتی‌های نیروی دریایی{" "}
          <span style={{ color: redCol, position: "relative", display: "inline-block" }}>
            ممنوع است.
            <span style={{ position: "absolute", right: 0, bottom: 8, height: 7, width: `${100 * easeOut(prog(T, red + 0.15, red + 0.55))}%`, background: "#CD2624", borderRadius: 4 }} />
          </span>
        </div>
        <div style={{ fontFamily: "V37Reg", fontSize: 34, lineHeight: 1.6, marginTop: 26, opacity: 0.65 }}>مگر با مجوزِ ویژه‌ی فرمانده، برای امورِ رسمی.</div>
        <div style={{ fontFamily: "V37Bold", fontSize: 34, opacity: 0.7, marginTop: 60 }}>ماده‌ی ۱۲</div>
        {[94, 80].map(gl)}
      </div>
    </AbsoluteFill>
  );
};

// ledger close-up (full-screen insert, like the reference's «LIST OF OFFICERS»): older entries, then «نانسی بنتلی» is written in
const LedgerPage: React.FC<{ T: number; t0: number; t1: number; w0: number; w1: number }> = ({ T, t0, t1, w0, w1 }) => {
  const u = prog(T, t0, t1);
  const e = 1 - easeOut(prog(T, t0, t0 + 0.3));
  const done = easeInOut(prog(T, w0, w1));
  const ink = "rgba(30,26,52,0.9)";
  const rows: [string, string, string][] = [["جان اسمیت", "ملوان", "۱۹۱۹"], ["تام وایت", "ملوان", "۱۹۱۹"], ["بیل هیوز", "آتش‌کار", "۱۹۲۰"], ["آرتور کالینز", "ملوان", "۱۹۲۰"]];
  const cell = (txt: string, w: number, clip = 1, size = 64, dy = 0) => (
    <div style={{ width: w, transform: `translateY(${dy}px)`, fontFamily: "V37Hand", fontSize: size, lineHeight: 1.1, color: ink, whiteSpace: "nowrap", clipPath: `inset(-30% 0 -30% ${(1 - clip) * 100}%)` }}>{txt}</div>
  );
  const line = (k: number, kids: React.ReactNode) => (
    <div key={k} style={{ display: "flex", alignItems: "baseline", height: 118, paddingTop: 22, boxSizing: "border-box", borderBottom: "2px solid rgba(90,70,50,0.35)", gap: 20, paddingRight: 10 }}>{kids}</div>
  );
  return (
    <AbsoluteFill style={{ background: "#121316", overflow: "hidden" }}>
      <Img src={staticFile("v37/img/12.jpg")} style={{ position: "absolute", left: -60, top: -110, width: W + 120, height: (W + 120) / IMG_AR, filter: "blur(24px) brightness(0.5)" }} />
      <div style={{ position: "absolute", left: 40, top: 230, width: 1000, height: 1080, transform: `translate(${e * -260}px, ${e * 120}px) scale(${1.06 + 0.1 * u + 0.2 * e}) rotate(${-7 + 2 * u}deg)`, transformOrigin: "40% 60%",
        background: "radial-gradient(ellipse at 50% 40%, #EFE2C2 0%, #DECB9F 62%, #C4A878 100%)", borderRadius: 8, boxShadow: "0 40px 90px rgba(0,0,0,0.6), inset 0 0 110px rgba(110,70,20,0.3)", padding: "70px 70px", direction: "rtl" }}>
        <div style={{ fontFamily: "V37Black", fontSize: 54, textAlign: "center", color: "#2A2118", letterSpacing: 1 }}>فهرستِ افرادِ کشتی</div>
        <div style={{ display: "flex", gap: 20, marginTop: 34, paddingRight: 10, fontFamily: "V37Bold", fontSize: 32, color: "rgba(42,33,24,0.7)", borderBottom: "3px solid rgba(60,45,30,0.5)", paddingBottom: 10 }}>
          <div style={{ width: 430 }}>نام</div><div style={{ width: 230 }}>درجه</div><div style={{ width: 160 }}>سال</div>
        </div>
        {rows.map((r, i) => line(i, <>{cell(r[0], 430, 1, 64, 40)}{cell(r[1], 230, 1, 54)}{cell(r[2], 160, 1, 50)}</>))}
        {line(9, <>{cell("نانسی بنتلی", 430, done, 70, 40)}{cell("ملوان", 230, prog(done, 0.75, 1), 54)}{cell("۱۹۲۰", 160, prog(done, 0.9, 1), 50)}</>)}
        {line(10, null)}
      </div>
    </AbsoluteFill>
  );
};

// ───── shots ─────
const tLie = c(wd(1, "افتاد")), tBite = c(wd(1, "که")), tBiteHit = wd(1, "نیشش");
const tRoad = c(S(2)), tHours = wd(2, "ساعت") - 0.15, tFace = c(wd(2, "باباش"));
const tBoat = c(S(3)), tRow = c(wd(3, "پارو")), tShip = c(wd(3, "کشتی"));
const tProb = c(S(4)), tOff = c(S(5)), tRules = c(wd(5, "حق")), tRed = wd(5, "حق");
const tCapt = c(S(6)), tPen = c(wd(6, "و")), tList = c(wd(6, "دختر") + 0.3);
const tCap = c(S(7)), tCap2 = c(wd(7, "رسما")), tBed = c(wd(7, "تا")), tEnd = VO.words.filter((w) => w.line === 7).at(-1)!.e + 0.15;

const SHOTS: Shot[] = [
  // she trips — the camera drops in from above with her
  sh("01", 0, tLie, { fx: 0.5, fy: 0.5, s: 1.16 }, { fx: 0.5, fy: 0.56, s: 1.3 }, { in: { dy: -0.08, ds: 0.15, dur: 0.4 }, shake: (T) => kick(T, 0.55, 9) }),
  sh("02", tLie, tBite, { fx: 0.5, fy: 0.62, s: 1.35 }, { fx: 0.5, fy: 0.64, s: 1.55 }, { in: { dy: -0.06, ds: 0.25 }, shake: (T) => kick(T, tLie, 12, 0.4) }),
  sh("03", tBite, tRoad, { fx: 0.5, fy: 0.52, s: 1.1 }, { fx: 0.53, fy: 0.5, s: 1.22 }, { in: { dx: 0.1, ds: 0.1 },
    shake: (T) => kick(T, tBiteHit, 14, 0.45) }),
  // the road: four hours away
  sh("04", tRoad, tFace, { fx: 0.5, fy: 0.5, s: 1.12 }, { fx: 0.48, fy: 0.45, s: 1.4 }, { in: { dx: -0.12, ds: 0.08 }, bob: 0.6,
    extra: (T, p) => <FourHours p={p} T={T} t0={tHours} /> }),
  sh("05", tFace, tBoat, { fx: 0.5, fy: 0.4, s: 1.12 }, { fx: 0.52, fy: 0.36, s: 1.3 }, { in: { dy: 0.08, ds: 0.12 }, bob: 1, shake: () => 2.5 }),
  // the boat and the ship
  sh("06", tBoat, tRow, { fx: 0.52, fy: 0.62, s: 1.4 }, { fx: 0.5, fy: 0.58, s: 1.15 }, { in: { dy: -0.1, ds: 0.2 } }),
  sh("07", tRow, tShip, { fx: 0.5, fy: 0.55, s: 1.08 }, { fx: 0.5, fy: 0.42, s: 1.28 }, { in: { dx: 0.1, ds: 0.06 }, bob: 1.2 }),
  sh("08", tShip, tProb, { fx: 0.5, fy: 0.72, s: 1.25 }, { fx: 0.48, fy: 0.38, s: 1.12 }, { in: { dy: 0.08, ds: 0.1 }, bob: 0.6 }),
  // but there was a problem
  sh("09", tProb, tOff, { fx: 0.5, fy: 0.5, s: 1.05, rot: -2 }, { fx: 0.48, fy: 0.42, s: 1.28, rot: 0 }, { in: { dy: 0.1, ds: 0.15, rot: -3 } }),
  sh("10", tOff, tRules, { fx: 0.45, fy: 0.42, s: 1.12 }, { fx: 0.6, fy: 0.5, s: 1.42 }, { in: { dx: -0.1, ds: 0.08 } }),
  { from: tRules, to: tCapt, a: { fx: 0.5, fy: 0.5, s: 1 }, b: { fx: 0.5, fy: 0.5, s: 1 }, scene: (T) => <Rules T={T} t0={tRules} t1={tCapt} red={tRed + 0.25} /> },
  // so the captain…
  sh("11", tCapt, tPen, { fx: 0.5, fy: 0.42, s: 1.08 }, { fx: 0.62, fy: 0.5, s: 1.38 }, { in: { dx: 0.12, ds: 0.1 } }),
  sh("12", tPen, tList, { fx: 0.5, fy: 0.5, s: 1.12 }, { fx: 0.47, fy: 0.53, s: 1.3 }, { in: { dy: -0.08, ds: 0.18 } }),
  { from: tList, to: tCap, a: { fx: 0.5, fy: 0.5, s: 1 }, b: { fx: 0.5, fy: 0.5, s: 1 }, scene: (T) => <LedgerPage T={T} t0={tList} t1={tCap} w0={tList + 0.12} w1={tCap - 0.05} /> },
  // …officially enlisting the six-year-old
  sh("13", tCap, tCap2, { fx: 0.5, fy: 0.5, s: 1.08 }, { fx: 0.48, fy: 0.42, s: 1.2 }, { in: { dx: -0.1, ds: 0.12 } }),
  sh("13", tCap2, tBed, { fx: 0.4, fy: 0.42, s: 1.75 }, { fx: 0.42, fy: 0.45, s: 1.95 }, { in: { ds: 0.35, dur: 0.3 } }),
  sh("14", tBed, tEnd, { fx: 0.4, fy: 0.55, s: 1.3 }, { fx: 0.45, fy: 0.5, s: 1.12 }, { in: { dx: 0.1, ds: 0.1 } }),
  sh("15", tEnd, TOTAL + 1, { fx: 0.5, fy: 0.55, s: 1.25 }, { fx: 0.5, fy: 0.5, s: 1.08 }, { in: { dy: -0.06, ds: 0.15 } }),
];

const MB = ({ id, bx, by }: { id: string; bx: number; by: number }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} edgeMode="duplicate" /></filter>
  </svg>
);

const ShotView: React.FC<{ d: Shot; T: number; i: number }> = ({ d, T, i }) => {
  if (d.scene) return <>{d.scene(T)}</>;
  const k = camAt(d, T), k0 = camAt(d, Math.max(d.from, T - 1 / FPS));
  const p = place(k, T, d.shake?.(T) ?? 0), p0 = place(k0, T - 1 / FPS, 0);
  // motion blur from the camera speed (screen px per frame), only during real moves
  const vx = Math.abs(p.x - p0.x + (p.dw - p0.dw) / 2), vy = Math.abs(p.y - p0.y + (p.dh - p0.dh) / 2), vz = Math.abs(p.dw - p0.dw) / 8;
  const bx = clamp((vx - 6) * 0.55 + vz, 0, 40), by = clamp((vy - 6) * 0.55 + vz, 0, 40);
  const id = `v37mb${i}`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {(bx > 0.3 || by > 0.3) && <MB id={id} bx={bx} by={by} />}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `rotate(${p.rot}deg) scale(${1 + Math.abs(p.rot) * 0.012})`, filter: bx > 0.3 || by > 0.3 ? `url(#${id})` : undefined }}>
        <Img src={staticFile(d.img!)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
        {d.extra?.(T, p)}
      </div>
    </AbsoluteFill>
  );
};

// ───── captions: 2–3 words, bottom centre, white, keywords warm yellow, the spoken word pops ─────
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const ch = [...CAPS].reverse().find((x) => T >= x.s - 0.03);
  if (!ch || T > ch.e + 0.25 || T > tEnd) return null;
  const a = easeOut(prog(T, ch.s - 0.03, ch.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1390, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 22px", direction: "rtl",
      transform: `scale(${0.85 + 0.15 * a})`, opacity: a }}>
      {ch.words.map((w, i) => {
        const on = T >= w.s - 0.04;
        const pop = on ? 1 + 0.12 * (1 - easeOut(prog(T, w.s - 0.04, w.s + 0.16))) : 1;
        return (
          <span key={i} style={{ fontFamily: "V37Black", fontSize: 84, lineHeight: 1.35, color: w.kw ? "#FFD84D" : "#FFFFFF", opacity: on ? 1 : 0.55, display: "inline-block", transform: `scale(${pop})`,
            WebkitTextStroke: "3px rgba(0,0,0,0.85)", paintOrder: "stroke fill", textShadow: "0 5px 18px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.9)" }}>
            {bare(w.w) + (/[،.]$/.test(w.w) ? "" : "")}
          </span>
        );
      })}
    </div>
  );
};

const EndTag: React.FC<{ T: number }> = ({ T }) => {
  const a = easeOut(prog(T, tEnd + 0.2, tEnd + 0.6));
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1450, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <div style={{ fontFamily: "V37Black", fontSize: 54, color: "#fff", direction: "rtl", background: "rgba(10,22,40,0.72)", borderRadius: 18, padding: "14px 34px 20px", border: "2px solid rgba(255,216,77,0.8)" }}>
        ماجرای واقعی · استرالیا، ۱۹۲۰
      </div>
    </div>
  );
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const i = SHOTS.findIndex((d) => T >= d.from && T < d.to);
  const shot = SHOTS[i];
  // red pulse of pain on the bite
  const pain = kick(T, tBiteHit, 0.55, 0.7);
  return (
    <AbsoluteFill style={{ background: "#0A0D12" }}>
      {shot && <ShotView d={shot} T={T} i={i} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }} />
      {pain > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(200,0,0,0) 35%, rgba(190,10,10,${pain}) 100%)` }} />}
      <Captions T={T} />
      <EndTag T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const LOOK = [0.3, ...SHOTS.map((d) => Math.min(d.to - 0.05, d.from + Math.min(1.0, (d.to - d.from) * 0.6))), tHours + 0.8, tRed + 0.9, tCap - 0.1, tEnd + 1];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V37: React.FC = () => (
  <>
    <Composition id="V37" component={Video} durationInFrames={V37_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v37/mix-norm.wav" }} />
    <Composition id="V37-Silent" component={Video} durationInFrames={V37_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V37-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
