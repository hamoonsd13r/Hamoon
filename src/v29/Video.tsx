// V29 · «پنج نفر سر شام» قسمت ۲ — کپی ریلز مرجع plot_404 (uploads/ref-Derl3h.mp4) با عکس‌های ChatGPT کاربر (public/v29/img/pNN = پرامپت NN).
// همان زبان V25: کات سخت سر هر جمله، دوربین آرام جلو می‌رود، وینیت و دانه، زیرنویس خلاصه با یک کلمه‌ی قرمز.
// با کد: اسم‌های زیر عکس قدیمی، اعلامیه‌ی ترحیم، چت «مامان» روی گوشی، حباب‌های حرف، کارت‌های A/B.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";

type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
const words = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const IMG_AR = 1438 / 2576;

const fontHandle = typeof document !== "undefined" ? delayRender("v29 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V29Black", "fonts/Vazirmatn-Black.ttf"], ["V29Bold", "fonts/Vazirmatn-Bold.ttf"], ["V29Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["V29Hand", "fonts/NotoNastaliqUrdu.ttf"], ["V29Latin", "fonts/Oswald.ttf"]].map(([f, u]) =>
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
const CARDS_IN = S(27) - 0.1; // A/B cards
const TOTAL = E(30) + 2.6;
export const V29_FRAMES = Math.round(TOTAL * FPS);
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
const lamp = (T: number) => (noise(T * 6) > 0.9 ? 0.6 : 1) * (0.95 + 0.05 * Math.sin(T * 37));
// element placed on the image, in image fractions; size follows the zoom
const OnImg: React.FC<{ p: Place; ix: number; iy: number; size: number; style?: React.CSSProperties; children: React.ReactNode; rot?: number }> = ({ p, ix, iy, size, style, children, rot = 0 }) => {
  const c = at(p, ix, iy), k = p.dw / W;
  return <div style={{ position: "absolute", left: c.x, top: c.y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, fontSize: size * k, direction: "rtl", whiteSpace: "nowrap", ...style }}>{children}</div>;
};

// ───── code overlays ─────
const Bubble: React.FC<{ x: number; y: number; from: number; T: number; text: string }> = ({ x, y, from, T, text }) => {
  if (T < from) return null;
  const a = easeOut(prog(T, from, from + 0.22));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${0.7 + 0.3 * a})`, transformOrigin: "50% 100%", opacity: a }}>
      <div style={{ background: "#F4F1EC", color: "#1B1A1D", borderRadius: 22, padding: "16px 30px 20px", fontFamily: "V29Bold", fontSize: 42, lineHeight: 1.45, direction: "rtl", textAlign: "center",
        whiteSpace: "nowrap", boxShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>{text.split("\n").map((l, i) => <div key={i}>{l}</div>)}</div>
      <div style={{ position: "absolute", left: "50%", bottom: -22, width: 0, height: 0, transform: "translateX(-50%)",
        borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "24px solid #F4F1EC" }} />
    </div>
  );
};
// names under the old photograph (p09: white border y≈0.675–0.775)
const PhotoNames: React.FC<{ p: Place }> = ({ p }) => (
  <OnImg p={p} ix={0.55} iy={0.722} size={64} style={{ fontFamily: "V29Hand", color: "rgba(32,38,70,0.85)", wordSpacing: 30 }}>هلن ـ آرمان ـ مارا</OnImg>
);
// funeral notice text (p11: card x 0.34–0.66, y 0.36–0.64, portrait in the middle)
const NoticeText: React.FC<{ p: Place }> = ({ p }) => (
  <>
    <OnImg p={p} ix={0.5} iy={0.398} size={30} style={{ fontFamily: "V29Bold", color: "#3B342C", letterSpacing: 1 }}>به یاد عزیزمان</OnImg>
    <OnImg p={p} ix={0.5} iy={0.585} size={46} style={{ fontFamily: "V29Black", color: "#26211C" }}>اِولین رید</OnImg>
    <OnImg p={p} ix={0.5} iy={0.613} size={26} style={{ fontFamily: "V29Bold", color: "#4A4238" }}>درگذشت ۲۰۰۳</OnImg>
  </>
);
// chat with «مامان» drawn on the blank phone screen of p13 (centre 0.505,0.517; 276×569 px of 1438×2576; tilted)
type Msg = { at: number; text: string; red?: boolean };
const Chat: React.FC<{ p: Place; T: number; msgs: Msg[]; buzzAt: number }> = ({ p, T, msgs, buzzAt }) => {
  const c = at(p, 0.505, 0.517), w = (276 / 1438) * p.dw, h = (569 / 2576) * p.dh, k = w / 276;
  const buzz = T > buzzAt && T < buzzAt + 0.6 ? Math.sin((T - buzzAt) * 150) * 6 * (1 - prog(T, buzzAt, buzzAt + 0.6)) : 0;
  return (
    <div style={{ position: "absolute", left: c.x - w / 2 + buzz, top: c.y - h / 2, width: w, height: h, transform: "rotate(7.5deg) skewX(-3deg)", borderRadius: 26 * k, overflow: "hidden",
      background: "linear-gradient(180deg,#EEF4F7,#DDE8EE)", direction: "rtl" }}>
      <div style={{ height: 64 * k, borderBottom: `${1.5 * k}px solid rgba(0,0,0,0.08)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 * k }}>
        <div style={{ width: 26 * k, height: 26 * k, borderRadius: "50%", background: "#9AA6B2", color: "#fff", fontFamily: "V29Bold", fontSize: 14 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>م</div>
        <div style={{ fontFamily: "V29Bold", fontSize: 13 * k, color: "#222", marginTop: 2 * k }}>مامان</div>
      </div>
      <div style={{ padding: `${12 * k}px ${10 * k}px`, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 * k }}>
        {msgs.filter((m) => T >= m.at).map((m, i) => {
          const a = easeOut(prog(T, m.at, m.at + 0.25));
          return <div key={i} style={{ maxWidth: "94%", background: m.red ? "#2B2E33" : "#C9D3DA", color: m.red ? "#fff" : "#16181B", borderRadius: 16 * k, padding: `${7 * k}px ${12 * k}px ${9 * k}px`,
            fontFamily: m.red ? "V29Black" : "V29Bold", fontSize: 22 * k, lineHeight: 1.45, opacity: a, transform: `translateY(${(1 - a) * 10 * k}px)` }}>{m.text}</div>;
        })}
      </div>
    </div>
  );
};

// ───── shots ─────
type Shot = { img: string; from: number; to: number; keys: Key[]; capTop?: boolean; shake?: (T: number) => number; grade?: (T: number) => string; extra?: (T: number, p: Place) => React.ReactNode };
const GRADE = (T: number) => `brightness(${0.97 * lamp(T)}) contrast(1.06) saturate(0.92)`;
const sh = (img: string, from: number, to: number, keys: (a: number, b: number) => Key[], more: Partial<Shot> = {}): Shot =>
  ({ img: `v29/img/${img}.jpg`, from, to, keys: keys(from, to), ...more });

const MSG1: Msg[] = [{ at: S(15) + 0.2, text: "هنوز توی زیرزمینم." }, { at: S(16) + 0.3, text: "تو رو خدا برگرد." }];
const MSG2: Msg[] = [...MSG1.map((m) => ({ ...m, at: 0 })), { at: S(23), text: "درِ ماشین رو باز نکن.", red: true }, { at: wd(23, "خواهرت"), text: "خواهرت این پایین پیشِ منه.", red: true }];
const t2 = cut(S(1)), t8 = cut(wd(7, "خواهر")), tDinner = E(13) + 0.1, tMara = cut(wd(26, "یا"));
const SHOTS: Shot[] = [
  sh("p01", 0, t2, (a, b) => push(a, b, 0.5, 0.45, 1.02, 1.1)),
  sh("p01", t2, cut(S(3)), (a, b) => push(a, b, 0.5, 0.63, 1.35, 1.45), {
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.12} r={0.25} color="rgba(255,190,110,A)" a={0.15 * lamp(T)} /> }),
  sh("p02", cut(S(3)), cut(S(4)), (a, b) => push(a, b, 0.5, 0.5, 1.02, 1.12, 0.5, 0.46), { capTop: true }),
  sh("p03", cut(S(4)), cut(S(5)), (a, b) => push(a, b, 0.5, 0.42, 1.04, 1.14)),
  sh("p04", cut(S(5)), cut(S(6)), (a, b) => push(a, b, 0.5, 0.5, 1.08, 1.2), {
    extra: (T, p) => <Glow p={p} ix={0.5} iy={0.485} r={0.1} color="rgba(120,220,255,A)" a={0.35 + 0.25 * Math.sin(T * 5)} /> }),
  sh("p05", cut(S(6)), cut(S(7)), (a, b) => push(a, b, 0.55, 0.5, 1.04, 1.12), { capTop: true }),
  sh("p06", cut(S(7)), t8, (a, b) => push(a, b, 0.5, 0.36, 1.1, 1.18), {
    extra: (T) => <Bubble x={560} y={470} from={S(7) + 0.1} T={T} text={"من مارام.\nخواهرِ دوقلوی مادرت."} /> }),
  sh("p07", t8, cut(S(8)), (a, b) => push(a, b, 0.48, 0.4, 1.08, 1.16)),
  sh("p08", cut(S(8)), cut(S(9)), (a, b) => push(a, b, 0.4, 0.42, 1.04, 1.12)),
  sh("p09", cut(S(9)), cut(S(10)), (a, b) => push(a, b, 0.5, 0.48, 1.02, 1.1), { extra: (_T, p) => <PhotoNames p={p} /> }),
  sh("p06", cut(S(10)), cut(S(11)), (a, b) => push(a, b, 0.5, 0.32, 1.35, 1.42)),
  // the notice falls out: camera drops onto the card
  sh("p11", cut(S(11)), cut(S(12)), (a) => [{ t: a, fx: 0.5, fy: 0.3, s: 1.5 }, { t: a + 0.05, fx: 0.5, fy: 0.5, s: 1.35, ease: 0.5 }, { t: a + 0.6, fx: 0.5, fy: 0.5, s: 1.45, ease: 2.5 }], {
    capTop: true, shake: (T) => 5 * (1 - prog(T, S(11), S(11) + 0.7)), extra: (_T, p) => <NoticeText p={p} /> }),
  sh("p11", cut(S(12)), cut(S(13)), (a, b) => push(a, b, 0.5, 0.48, 1.78, 1.9), { capTop: true, extra: (_T, p) => <NoticeText p={p} /> }),
  sh("p12", cut(S(13)), tDinner, (a, b) => push(a, b, 0.6, 0.55, 1.04, 1.16, 0.66, 0.56), {
    extra: (T, p) => <Glow p={p} ix={0.51} iy={0.31} r={0.22} color="rgba(255,190,110,A)" a={0.2 * lamp(T)} /> }),
  sh("p07", tDinner, cut(S(14)), (a, b) => push(a, b, 0.48, 0.4, 1.2, 1.26)),
  sh("p13", cut(S(14)), cut(E(16) + 0.3), (a, b) => push(a, b, 0.5, 0.5, 2.55, 2.7), {
    shake: (T) => 3 * (1 - prog(T, S(14), S(14) + 0.8)), extra: (T, p) => <Chat p={p} T={T} msgs={MSG1} buzzAt={S(14)} /> }),
  sh("p14", cut(E(16) + 0.3), cut(S(17)), (a, b) => push(a, b, 0.5, 0.5, 1.04, 1.12)),
  sh("p15", cut(S(17)), cut(S(18)), (a, b) => push(a, b, 0.5, 0.42, 1.04, 1.12), {
    capTop: true, shake: (T) => [0, 0.45, 0.9].some((d) => T > S(17) + d && T < S(17) + d + 0.18) ? 6 : 0 }),
  sh("p07", cut(S(18)), cut(wd(18, "داره")), (a, b) => push(a, b, 0.48, 0.4, 1.12, 1.18)),
  sh("p16", cut(wd(18, "داره")), cut(S(19)), (a, b) => push(a, b, 0.5, 0.42, 1.04, 1.12), { capTop: true }),
  sh("p16", cut(S(19)), cut(S(20)), (a, b) => push(a, b, 0.66, 0.42, 1.5, 1.62), { capTop: true }),
  sh("p16", cut(S(20)), cut(S(21)), (a, b) => push(a, b, 0.5, 0.4, 1.12, 1.2), {
    extra: (T) => <Bubble x={420} y={540} from={S(20) + 0.3} T={T} text={"قول دادی هیچ‌وقت\nولم نکنی."} /> }),
  sh("p18", cut(S(21)), cut(S(22)), (a, b) => push(a, b, 0.45, 0.48, 1.04, 1.14), { capTop: true }),
  sh("p06", cut(S(22)), cut(S(23)), (a, b) => push(a, b, 0.5, 0.36, 1.12, 1.2), { capTop: true }),
  sh("p13", cut(S(23)), cut(S(24)), (a, b) => push(a, b, 0.5, 0.5, 2.7, 2.85), {
    shake: (T) => 3 * (1 - prog(T, S(23) - 0.1, S(23) + 0.6)), extra: (T, p) => <Chat p={p} T={T} msgs={MSG2} buzzAt={S(23) - 0.1} /> }),
  sh("p17", cut(S(24)), cut(S(25)), (a, b) => push(a, b, 0.5, 0.42, 1.06, 1.16), {
    capTop: true, extra: (T) => <Bubble x={420} y={600} from={wd(24, "می‌بینه") + 0.5} T={T} text={"تو رو خدا.\nداره میاد."} /> }),
  sh("p19", cut(S(25)), cut(S(26)), (a, b) => push(a, b, 0.5, 0.42, 1.1, 1.45, 0.5, 0.43), { capTop: true }),
  sh("p18", cut(S(26)), tMara, (a, b) => push(a, b, 0.5, 0.5, 1.12, 1.2), { capTop: true }),
  sh("p20", tMara, CARDS_IN, (a, b) => push(a, b, 0.45, 0.45, 1.04, 1.14), { capTop: true }),
  sh("p16", CARDS_IN, TOTAL + 1, (a, b) => push(a, b, 0.5, 0.5, 1.0, 1.06), { grade: () => "brightness(0.7) contrast(1.05) saturate(0.85)" }),
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
type Cap = { at: number; to?: number; txt: string };
const CAPS: Cap[] = [
  { at: S(0), txt: "دیروز بیشترتون *A* رو انتخاب کردین." },
  { at: S(1), txt: "انتخاب شما: *A*" },
  { at: S(2), txt: "*A* · باهاش بری بیرون." },
  { at: S(3), txt: "دنبالش می‌ری *بیرون.*" },
  { at: S(4), txt: "پشت سرت، صدای *قدم‌ها* قطع می‌شه." },
  { at: S(5), txt: "هیچ‌کس *دنبالت* نمیاد." },
  { at: S(6), txt: "توی ماشین، بالاخره *توضیح* می‌ده." },
  { at: S(8), txt: "یه *عکس قدیمی* نشونت می‌ده." },
  { at: S(10), txt: "چرا اون رو *یادت* نمیاد؟" },
  { at: S(11), txt: "یه *اعلامیه‌ی ترحیم* می‌افته بیرون." },
  { at: S(12), txt: "صورتِ *مادربزرگت.*" },
  { at: S(13), txt: "قبل از اینکه به دنیا بیای، *مرده.*" },
  { at: tDinner, to: S(14) - 0.1, txt: "پس کی سرِ *شام* بود؟" },
  { at: S(17), txt: "سه تا ضربه به *شیشه.*" },
  { at: wd(18, "داره"), txt: "می‌لرزه و *گریه* می‌کنه." },
  { at: S(19), txt: "کفِ دستاش *زخمی* شده." },
  { at: S(21), txt: "دستت می‌ره سمتِ *قفل.*" },
  { at: S(22), txt: "بعد یه *پیام* دیگه." },
  { at: S(24), txt: "یکی *پشت سرشه.*" },
  { at: S(25), txt: "اون زنِ توی *اعلامیه* داره نزدیک می‌شه." },
  { at: S(26), txt: "راهش می‌دی *تو*…" },
  { at: wd(26, "یا"), txt: "…یا *گاز* می‌دی و جاش می‌ذاری؟" },
];
const capEnd = (i: number) => {
  const c = CAPS[i], n = CAPS[i + 1];
  if (c.to) return c.to;
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
    <div style={{ position: "absolute", left: 70, right: 70, top: shotTop ? 300 : 1300, textAlign: "center", direction: "rtl", fontFamily: "V29Black", fontSize: 68, lineHeight: 1.45,
      color: "#F3F1EE", textShadow: "0 0 20px rgba(0,0,0,0.9), 0 3px 8px #000", opacity: a, transform: `scale(${1.06 - 0.06 * a})` }}>
      <Rich txt={c.txt} />
    </div>
  );
};

// ───── ending: A/B choice cards over the sister at the window ─────
const ChoiceCard: React.FC<{ letter: string; label: string; T: number; delay: number }> = ({ letter, label, T, delay }) => {
  const a = easeOut(prog(T, CARDS_IN + delay, CARDS_IN + delay + 0.3));
  return (
    <div style={{ width: 400, height: 300, borderRadius: 18, background: "rgba(8,9,14,0.88)", border: "4px solid rgba(240,238,234,0.9)", textAlign: "center",
      opacity: a, transform: `translateY(${(1 - a) * 30}px)`, boxShadow: "0 12px 40px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontFamily: "V29Latin", fontWeight: 700, fontSize: 130, lineHeight: 1, color: RED }}>{letter}</div>
      <div style={{ fontFamily: "V29Black", fontSize: 40, lineHeight: 1.4, color: "#F3F1EE", direction: "rtl", marginTop: 14, padding: "0 20px" }}>{label}</div>
    </div>
  );
};
const EndCards: React.FC<{ T: number }> = ({ T }) => {
  if (T < CARDS_IN) return null;
  const steps = [
    { at: CARDS_IN, el: <>تو بودی کدوم رو انتخاب می‌کردی؟</> },
    { at: S(28) - 0.06, el: <><span style={{ fontFamily: "V29Latin", fontWeight: 700, color: RED }}>A</span> یا <span style={{ fontFamily: "V29Latin", fontWeight: 700, color: RED }}>B</span> رو کامنت کن</> },
    { at: S(29) - 0.06, el: <>داستان فردا ادامه داره<div style={{ fontFamily: "V29Bold", fontSize: 38, color: "rgba(243,241,238,0.85)" }}>فالو کن که از دستت نره</div></> },
  ];
  const cur = [...steps].reverse().find((s) => T >= s.at)!;
  const a = easeOut(prog(T, cur.at, cur.at + 0.25));
  return (
    <>
      <div style={{ position: "absolute", left: 40, right: 40, top: 230, textAlign: "center", direction: "rtl", fontFamily: "V29Black", fontSize: 62, lineHeight: 1.4, color: "#F3F1EE",
        textShadow: "0 0 20px rgba(0,0,0,0.9)", opacity: a }}>{cur.el}</div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
        <ChoiceCard letter="A" label="راهش بدی تو" T={T} delay={0} />
        <ChoiceCard letter="B" label="درها قفل، گاز بدی بری" T={T} delay={0.1} />
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
      {T < CARDS_IN && <Captions T={T} shotTop={shot?.capTop} />}
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

const LOOK = [0.05, ...SHOTS.map((d) => Math.min(d.to - 0.05, d.from + Math.min(1.2, (d.to - d.from) * 0.7))), S(16) + 0.8, wd(23, "خواهرت") + 0.6, S(28) + 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V29: React.FC = () => (
  <>
    <Composition id="V29" component={Video} durationInFrames={V29_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v29/mix-norm.wav" }} />
    <Composition id="V29-Silent" component={Video} durationInFrames={V29_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V29-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
