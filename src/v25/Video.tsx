// V25 · «پنج نفر سر شام» — کپی ریلز مرجع plot_404 (uploads/ref-Dephqy.mp4) با عکس‌های ChatGPT کاربر (public/v25/img/rNN = فریم refNN).
// کات سخت سر هر جمله، دوربین آرام جلو می‌رود، وینیت سنگین و دانه‌ی فیلم، لرزش نور لامپ.
// زیرنویس خلاصه‌ی جمله با یک کلمه‌ی قرمز؛ متن گوشی، یادداشت، حباب حرف و کارت‌های A/B با کد.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1200 / 2150;

const fontHandle = typeof document !== "undefined" ? delayRender("v25 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V25Black", "fonts/Vazirmatn-Black.ttf"], ["V25Bold", "fonts/Vazirmatn-Bold.ttf"], ["V25Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["V25Hand", "fonts/NotoNastaliqUrdu.ttf"], ["V25Latin", "fonts/Oswald.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (si: number, word: string) => {
  const w = words.find((x) => x.si === si && bare(x.w) === word) ?? words.find((x) => x.si === si && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
const S = (si: number) => words.find((w) => w.si === si)!.s;
const E = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;

// ───── timeline (all from the voice) ─────
const RED = "#D8382F";
const CARDS_IN = S(24) - 0.1; // A/B cards
const TOTAL = E(25) + 3.4;
export const V25_FRAMES = Math.round(TOTAL * FPS);
const cut = (a: number) => a - 0.08;

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
  const hx = (noise(T * 0.6) - 0.5) * 10 + Math.sin(T * 63) * shake;
  const hy = (noise(T * 0.5 + 3) - 0.5) * 8 + Math.cos(T * 57) * shake;
  return { x: clamp(W / 2 - fx * dw + hx, W - dw, 0), y: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.x + ix * p.dw, y: p.y + iy * p.dh });
// steady creeping push-in over the whole shot (reference)
const push = (from: number, to: number, fx: number, fy: number, s0: number, s1: number, fx1 = fx, fy1 = fy): Key[] =>
  [{ t: from, fx, fy, s: s0 }, { t: from, fx: fx1, fy: fy1, s: s1, ease: to - from + 0.4 }];

const Glow: React.FC<{ p: Place; ix: number; iy: number; r: number; color: string; a: number }> = ({ p, ix, iy, r, color, a }) => {
  const c = at(p, ix, iy), rr = r * p.dw;
  return <div style={{ position: "absolute", left: c.x - rr, top: c.y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", mixBlendMode: "screen",
    background: `radial-gradient(circle, ${color.replace("A", String(a))} 0%, ${color.replace("A", String(a * 0.35))} 35%, rgba(0,0,0,0) 70%)` }} />;
};
// tungsten lamp: steady with rare dips
const lamp = (T: number) => (noise(T * 6) > 0.9 ? 0.6 : 1) * (0.95 + 0.05 * Math.sin(T * 37));
// element placed on the image, in image fractions; size follows the zoom
const OnImg: React.FC<{ p: Place; ix: number; iy: number; size: number; style?: React.CSSProperties; children: React.ReactNode; rot?: number }> = ({ p, ix, iy, size, style, children, rot = 0 }) => {
  const c = at(p, ix, iy), k = p.dw / W;
  return <div style={{ position: "absolute", left: c.x, top: c.y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, fontSize: size * k, direction: "rtl", whiteSpace: "nowrap", ...style }}>{children}</div>;
};

// ───── code overlays ─────
// handwritten note text, revealed right→left like a pen
const NoteText: React.FC<{ p: Place; ix: number; iy: number; size: number; rot?: number; from: number; T: number; lines: string[] }> = ({ p, ix, iy, size, rot = 0, from, T, lines }) => {
  const r = easeOut(prog(T, from, from + 0.9));
  return (
    <OnImg p={p} ix={ix} iy={iy} size={size} rot={rot} style={{ fontFamily: "V25Hand", color: "rgba(38,30,24,0.9)", lineHeight: 2.05, textAlign: "center", clipPath: `inset(0 0 0 ${(1 - r) * 100}%)` }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </OnImg>
  );
};
// speech bubble (reference: small white rounded box with a tail)
const Bubble: React.FC<{ x: number; y: number; from: number; T: number; text: string; tail?: "down" | "down-left" }> = ({ x, y, from, T, text, tail = "down" }) => {
  if (T < from) return null;
  const a = easeOut(prog(T, from, from + 0.22));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${0.7 + 0.3 * a})`, transformOrigin: "50% 100%", opacity: a }}>
      <div style={{ background: "#F4F1EC", color: "#1B1A1D", borderRadius: 22, padding: "16px 30px 20px", fontFamily: "V25Bold", fontSize: 44, direction: "rtl", whiteSpace: "nowrap",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>{text}</div>
      <div style={{ position: "absolute", left: tail === "down" ? "50%" : "28%", bottom: -22, width: 0, height: 0, transform: "translateX(-50%)",
        borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "24px solid #F4F1EC" }} />
    </div>
  );
};
// phone lock screen + emergency alert, drawn inside the blank screen of r04 (screen spans x 0.21–0.795, y 0.15–0.87)
const LockScreen: React.FC<{ p: Place; T: number; alertAt: number }> = ({ p, T, alertAt }) => {
  const tl = at(p, 0.215, 0.155), br = at(p, 0.79, 0.86), k = p.dw / W;
  const a = easeOut(prog(T, alertAt, alertAt + 0.35));
  const buzz = T > alertAt && T < alertAt + 0.5 ? Math.sin((T - alertAt) * 140) * 5 * (1 - prog(T, alertAt, alertAt + 0.5)) : 0;
  return (
    <div style={{ position: "absolute", left: tl.x, top: tl.y, width: br.x - tl.x, height: br.y - tl.y, borderRadius: 60 * k, overflow: "hidden", direction: "rtl",
      background: "linear-gradient(180deg, rgba(40,52,78,0.55) 0%, rgba(14,18,30,0.75) 60%, rgba(8,10,18,0.85) 100%)", transform: `translateX(${buzz}px)` }}>
      <div style={{ position: "absolute", top: 130 * k, left: 0, right: 0, textAlign: "center", fontFamily: "V25Bold", fontSize: 34 * k, color: "rgba(235,238,245,0.85)" }}>جمعه، ۱۶ آبان</div>
      <div style={{ position: "absolute", top: 170 * k, left: 0, right: 0, textAlign: "center", fontFamily: "V25Black", fontSize: 150 * k, lineHeight: 1.2, color: "rgba(240,243,250,0.95)" }}>۹:۴۷</div>
      <div style={{ position: "absolute", top: (400 - 40 * (1 - a)) * k, left: 26 * k, right: 26 * k, opacity: a, transform: `scale(${0.94 + 0.06 * a})`,
        background: "rgba(246,244,240,0.94)", borderRadius: 30 * k, padding: `${22 * k}px ${26 * k}px ${26 * k}px`, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 * k, fontFamily: "V25Black", fontSize: 26 * k, color: "#C42A22" }}>
          <svg width={34 * k} height={30 * k} viewBox="0 0 34 30"><path d="M17 1 L33 29 L1 29 Z" fill="#C42A22" /><rect x="15.5" y="10" width="3" height="10" fill="#fff" /><rect x="15.5" y="22.5" width="3" height="3" fill="#fff" /></svg>
          <span>هشدار اضطراری</span>
          <span style={{ marginRight: "auto", fontFamily: "V25Reg", fontSize: 22 * k, color: "#8A8680" }}>الان</span>
        </div>
        <div style={{ fontFamily: "V25Black", fontSize: 44 * k, color: "#16151A", marginTop: 12 * k }}>همه رو بشمار.</div>
        <div style={{ fontFamily: "V25Bold", fontSize: 32 * k, color: "#2A2930", marginTop: 4 * k, lineHeight: 1.5, whiteSpace: "normal" }}>اگه کسی اضافه‌ست، واکنش نشون نده.</div>
      </div>
    </div>
  );
};

// ───── shots ─────
type Shot = { img: string; from: number; to: number; keys: Key[]; capTop?: boolean; shake?: (T: number) => number; grade?: (T: number) => string; extra?: (T: number, p: Place) => React.ReactNode };
const GRADE = (T: number) => `brightness(${0.97 * lamp(T)}) contrast(1.06) saturate(0.92)`;
const sh = (img: string, from: number, to: number, keys: (a: number, b: number) => Key[], more: Partial<Shot> = {}): Shot =>
  ({ img: `v25/img/${img}.jpg`, from, to, keys: keys(from, to), ...more });

const t1 = cut(wd(1, "پنج")), t7 = cut(wd(6, "تک‌تکشون")), t8 = cut(wd(6, "بزرگ"));
const t17 = cut(wd(14, "اسمت")), t19 = cut(wd(15, "برمی‌گردونه")), t23 = cut(wd(19, "لکه‌ی"));
const SHOTS: Shot[] = [
  sh("r01", 0, t1, (a, b) => push(a, b, 0.5, 0.48, 1.0, 1.1)),
  sh("r02", t1, cut(S(2)), (a, b) => push(a, b, 0.5, 0.42, 1.02, 1.1, 0.5, 0.46), {
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.075} r={0.28} color="rgba(255,190,110,A)" a={0.22 * lamp(T)} /> }),
  sh("r03", cut(S(2)), cut(S(3)), (a, b) => push(a, b, 0.45, 0.6, 1.04, 1.22, 0.42, 0.66), {
    extra: (T, p) => <Glow p={p} ix={0.33} iy={0.71} r={0.18} color="rgba(220,235,255,A)" a={0.5 * easeOut(prog(T, wd(2, "هشدار"), wd(2, "هشدار") + 0.3))} /> }),
  sh("r04", cut(S(3)), cut(S(4)), (a, b) => push(a, b, 0.5, 0.5, 1.0, 1.06, 0.5, 0.46), {
    extra: (T, p) => <LockScreen p={p} T={T} alertAt={S(3) - 0.05} /> }),
  sh("r05", cut(S(4)), cut(S(5)), (a, b) => push(a, b, 0.5, 0.4, 1.04, 1.12)),
  sh("r06", cut(S(5)), cut(S(6)), (a, b) => push(a, b, 0.5, 0.36, 1.08, 1.16)),
  sh("r07", cut(S(6)), t7, (a, b) => push(a, b, 0.5, 0.38, 1.04, 1.12)),
  sh("r08", t7, t8, (a, b) => push(a, b, 0.5, 0.38, 1.04, 1.12)),
  sh("r09", t8, cut(S(7)), (a, b) => push(a, b, 0.5, 0.42, 1.02, 1.1), { capTop: true }),
  sh("r10", cut(S(7)), cut(S(8)), (a, b) => push(a, b, 0.42, 0.46, 1.1, 1.2, 0.56, 0.48)),
  sh("r11", cut(S(8)), cut(S(9)), (a, b) => push(a, b, 0.5, 0.48, 1.06, 1.16, 0.5, 0.47), {
    extra: (T, p) => <NoteText p={p} ix={0.5} iy={0.468} size={62} from={wd(8, "من") - 0.05} T={T} lines={["من", "مادرت نیستم."]} /> }),
  // you pull away: the camera jerks back
  sh("r16", cut(S(9)), cut(S(10)), (a) => [{ t: a, fx: 0.45, fy: 0.32, s: 1.35 }, { t: a + 0.12, fx: 0.47, fy: 0.38, s: 1.08, ease: 0.35 }],
    { shake: (T) => 6 * (1 - prog(T, S(9), S(9) + 0.6)) }),
  // she grips your wrist: «نترس. به روت نیار.»
  sh("r05", cut(S(10)), cut(S(11)), (a, b) => push(a, b, 0.5, 0.33, 1.3, 1.38), {
    extra: (T) => <Bubble x={420} y={560} from={S(10) + 0.15} T={T} text="نترس. به روت نیار." /> }),
  sh("r13", cut(S(11)), cut(S(12)), (a, b) => push(a, b, 0.55, 0.5, 1.04, 1.12, 0.58, 0.52)),
  // three heads turn together: punch-in
  sh("r14", cut(S(12)), cut(S(13)), (a) => [{ t: a, fx: 0.5, fy: 0.42, s: 1.04 }, { t: S(12) + 0.25, fx: 0.5, fy: 0.36, s: 1.22, ease: 0.25 }, { t: S(12) + 0.5, fx: 0.5, fy: 0.36, s: 1.28, ease: 2.5 }], {
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.07} r={0.24} color="rgba(255,190,110,A)" a={0.2 * lamp(T)} /> }),
  sh("r15", cut(S(13)), cut(S(14)), (a, b) => push(a, b, 0.5, 0.48, 1.04, 1.12), {
    extra: (T) => <Bubble x={560} y={640} from={wd(13, "زیرزمین")} T={T} text="آرمان؟" /> }),
  sh("r09", cut(S(14)), t17, (a, b) => push(a, b, 0.5, 0.45, 1.1, 1.18), { capTop: true }),
  sh("r15", t17, cut(S(15)), (a, b) => push(a, b, 0.55, 0.45, 1.18, 1.26), {
    extra: (T) => <Bubble x={470} y={700} from={t17 + 0.2} T={T} text="تو رو خدا… درو باز کن." /> }),
  sh("r17", cut(S(15)), t19, (a, b) => push(a, b, 0.5, 0.45, 1.04, 1.12)),
  sh("r18", t19, cut(S(16)), (a, b) => push(a, b, 0.5, 0.5, 1.02, 1.12)),
  sh("r19", cut(S(16)), cut(S(17)), (a, b) => push(a, b, 0.5, 0.42, 1.06, 1.14), {
    extra: (T, p) => <NoteText p={p} ix={0.50} iy={0.37} size={54} rot={-14.5} from={S(16) - 0.05} T={T} lines={["صدا رو", "تقلید می‌کنه."]} /> }),
  sh("r20", cut(S(17)), cut(S(18)), (a, b) => push(a, b, 0.55, 0.42, 1.04, 1.12), {
    extra: (T, p) => <Glow p={p} ix={0.71} iy={0.25} r={0.12} color="rgba(200,220,255,A)" a={0.3} /> }),
  sh("r21", cut(S(18)), cut(S(19)), (a, b) => push(a, b, 0.5, 0.55, 1.04, 1.2, 0.48, 0.6)),
  sh("r22", cut(S(19)), t23, (a, b) => push(a, b, 0.45, 0.62, 1.06, 1.18, 0.4, 0.64)),
  sh("r09", t23, cut(S(20)), (a, b) => push(a, b, 0.5, 0.5, 1.18, 1.26)),
  sh("r24", cut(S(20)), cut(S(21)), (a, b) => push(a, b, 0.5, 0.45, 1.02, 1.1), {
    shake: (T) => 4 * (1 - prog(T, S(20) + 0.5, S(20) + 1.4)),
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.1} r={0.22} color="rgba(255,190,110,A)" a={0.2 * lamp(T)} /> }),
  sh("r25", cut(S(21)), cut(S(22)), (a, b) => push(a, b, 0.5, 0.55, 1.08, 1.2)),
  sh("r23", cut(S(22)), cut(S(23)), (a, b) => push(a, b, 0.5, 0.45, 1.04, 1.12, 0.5, 0.5)),
  sh("r26", cut(S(23)), CARDS_IN, (a, b) => push(a, b, 0.5, 0.45, 1.04, 1.14)),
  sh("r25", CARDS_IN, TOTAL + 1, (a, b) => push(a, b, 0.5, 0.5, 1.0, 1.06)),
];

const ShotView: React.FC<{ d: Shot; T: number }> = ({ d, T }) => {
  const c = camAt(d.keys, T);
  const p = place(c.fx, c.fy, c.s, T, d.shake?.(T) ?? 0);
  return (
    <AbsoluteFill style={{ overflow: "hidden", filter: (d.grade ?? GRADE)(T) }}>
      <Img src={staticFile(d.img)} style={{ position: "absolute", left: p.x, top: p.y, width: p.dw, height: p.dh, maxWidth: "none", maxHeight: "none" }} />
      {d.extra?.(T, p)}
    </AbsoluteFill>
  );
};

// ───── captions: a short summary of the line, one red word (*…*) ─────
type Cap = { at: number; txt: string; top?: boolean };
const CAPS: Cap[] = [
  { at: S(0), txt: "خانواده‌ت *چهار* نفرن." },
  { at: wd(1, "پنج"), txt: "*پنج* نفر سر شام." },
  { at: S(4), txt: "دوباره می‌شمری." },
  { at: S(5), txt: "*پنج.*" },
  { at: S(6), txt: "همه‌شون رو *می‌شناسی.*" },
  { at: S(7), txt: "مادرت یه *یادداشت* می‌ده." },
  { at: S(9), txt: "خودت رو *عقب* می‌کشی." },
  { at: S(11), txt: "بقیه از خوردن *دست می‌کشن.*", top: true },
  { at: S(12), txt: "سه تا سر *با هم* برمی‌گردن." },
  { at: S(14), txt: "صدای *مادرت.*" },
  { at: S(15), txt: "یادداشت رو *برمی‌گردونه.*", top: true },
  { at: S(17), txt: "به *بیرون* اشاره می‌کنه." },
  { at: S(18), txt: "یه چیزی از زیر در *میاد بیرون.*", top: true },
  { at: S(19), txt: "دستبند *مادرت.*", top: true },
  { at: wd(19, "پاره"), txt: "*پاره شده.*", top: true },
  { at: wd(19, "لکه‌ی"), txt: "یه لکه‌ی *خون* تازه.", top: true },
  { at: S(20), txt: "سه تا صندلی *عقب* کشیده می‌شن." },
  { at: S(21), txt: "فقط *چند ثانیه* وقت داری.", top: true },
  { at: S(22), txt: "با اون زن بری *بیرون…*" },
  { at: S(23), txt: "…یا درِ *زیرزمین* رو باز کنی؟" },
];
const capEnd = (i: number) => {
  const c = CAPS[i], n = CAPS[i + 1];
  const si = words.filter((w) => w.s <= c.at + 0.01).at(-1)!.si;
  return Math.min(n ? n.at - 0.04 : Infinity, E(si) + 0.45);
};
const Rich: React.FC<{ txt: string }> = ({ txt }) => <>{txt.split("*").map((x, i) => <span key={i} style={i % 2 ? { color: RED } : undefined}>{x}</span>)}</>;
const Captions: React.FC<{ T: number; shotTop?: boolean }> = ({ T, shotTop }) => {
  const i = CAPS.findIndex((c, k) => T >= c.at - 0.06 && T < capEnd(k));
  if (i < 0) return null;
  const c = CAPS[i];
  const a = easeOut(prog(T, c.at - 0.06, c.at + 0.08));
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: c.top || shotTop ? 330 : 1300, textAlign: "center", direction: "rtl", fontFamily: "V25Black", fontSize: 68, lineHeight: 1.45,
      color: "#F3F1EE", textShadow: "0 0 20px rgba(0,0,0,0.9), 0 3px 8px #000", opacity: a, transform: `scale(${1.06 - 0.06 * a})` }}>
      <Rich txt={c.txt} />
    </div>
  );
};

// ───── ending: A/B choice cards over the hallway ─────
const ChoiceCard: React.FC<{ letter: string; label: string; T: number; delay: number }> = ({ letter, label, T, delay }) => {
  const a = easeOut(prog(T, CARDS_IN + delay, CARDS_IN + delay + 0.3));
  return (
    <div style={{ width: 400, height: 290, borderRadius: 18, background: "rgba(8,9,14,0.88)", border: "4px solid rgba(240,238,234,0.9)", textAlign: "center",
      opacity: a, transform: `translateY(${(1 - a) * 30}px)`, boxShadow: "0 12px 40px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "V25Latin", fontWeight: 700, fontSize: 130, lineHeight: 1, color: "#F3F1EE" }}>{letter}</div>
      <div style={{ fontFamily: "V25Black", fontSize: 40, lineHeight: 1.4, color: "#F3F1EE", direction: "rtl", marginTop: 14, padding: "0 20px" }}>{label}</div>
    </div>
  );
};
const EndCards: React.FC<{ T: number }> = ({ T }) => {
  if (T < CARDS_IN) return null;
  const c2 = S(25) - 0.06;
  const h = T < c2 ? "تو بودی چی کار می‌کردی؟" : "";
  const ha = easeOut(prog(T, CARDS_IN, CARDS_IN + 0.25));
  const h2 = easeOut(prog(T, c2, c2 + 0.25));
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", direction: "rtl", fontFamily: "V25Black", fontSize: 64, color: "#F3F1EE",
        textShadow: "0 0 20px rgba(0,0,0,0.9)" }}>
        {h ? <span style={{ opacity: ha }}>{h}</span> : <span style={{ opacity: h2 }}>
          <span style={{ fontFamily: "V25Latin", fontWeight: 700, color: RED }}>A</span> یا <span style={{ fontFamily: "V25Latin", fontWeight: 700, color: RED }}>B</span> رو کامنت کن
          <div style={{ fontFamily: "V25Bold", fontSize: 38, color: "rgba(243,241,238,0.85)" }}>برای قسمت ۲ فالو کن</div>
        </span>}
      </div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        <ChoiceCard letter="A" label="با اون بری بیرون" T={T} delay={0} />
        <ChoiceCard letter="B" label="درِ زیرزمین رو باز کنی" T={T} delay={0.1} />
      </div>
    </>
  );
};

// film grain from 8 pre-made noise tiles (shared with V21)
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <Img src={staticFile(`v21/grain${f % 8}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, mixBlendMode: "overlay", opacity: 0.14 }} />
);

const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const shot = SHOTS.find((d) => T >= d.from && T < d.to);
  const breathe = 0.55 + 0.05 * Math.sin(T * 1.4);
  const fadeOut = prog(T, TOTAL - 0.6, TOTAL);
  return (
    <AbsoluteFill style={{ background: "#05060A" }}>
      {shot && <ShotView d={shot} T={T} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 42%, rgba(2,3,8,${breathe}) 86%, rgba(0,0,0,0.85) 100%)` }} />
      <Grain f={f} />
      <Captions T={T} shotTop={shot?.capTop} />
      <EndCards T={T} />
      {fadeOut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${fadeOut})` }} />}
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

const LOOK = [0.05, ...SHOTS.map((d) => Math.min(d.to - 0.05, d.from + Math.min(1.2, (d.to - d.from) * 0.7))), S(25) + 0.8];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V25: React.FC = () => (
  <>
    <Composition id="V25" component={Video} durationInFrames={V25_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v25/mix-norm.wav" }} />
    <Composition id="V25-Silent" component={Video} durationInFrames={V25_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V25-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
