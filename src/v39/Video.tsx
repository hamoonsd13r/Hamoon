// V39 · «پرونده‌ی خانواده‌ی خرمدین» — مستند جنایی واقعی ۹:۱۶ (متن و جدول ادیت از کاربر).
// زبان تصویری: «دیوار پرونده» — عکس‌های واقعی به‌شکل چاپ مدرک با پونز و برچسب کاغذی، نخ قرمز، مهر لاستیکی،
// عکس‌های ساخته‌شده‌ی کاربر (AI) تمام‌قاب با برچسب «بازسازی تصویری»، کلیپ‌های خبری (دوربین آسانسور، پدر پس از بازداشت، بابک با دوربین).
// بدون هیچ تصویر دلخراش. صدا: George (ElevenLabs v4، tempo 1.12).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Freeze, Html5Audio, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capJson from "./captions.json";

type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const FPS = 30, W = 1080, H = 1920;
const RED = "#C8231B", CREAM = "#EFE3C8", AMBER = "#F2B544";

const fontHandle = typeof document !== "undefined" ? delayRender("v39 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V39Black", "fonts/Vazirmatn-Black.ttf"], ["V39Bold", "fonts/Vazirmatn-Bold.ttf"], ["V39Reg", "fonts/Vazirmatn-Regular.ttf"], ["V39Type", "fonts/VazirCode.ttf"], ["V39Mono", "fonts/ChakraPetch-Medium.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:ً-ْ]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && bare(x.w).includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;
const lineEnd = (n: number) => VO.words.filter((w) => w.line === n).at(-1)!.e;
const c = (t: number) => t - 0.06;
const kick = (T: number, t0: number, amp: number, dur = 0.5) => (T > t0 && T < t0 + dur ? amp * (1 - prog(T, t0, t0 + dur)) : 0);
const shakeXY = (T: number, amp: number) => ({ x: (noise(T * 9) - 0.5) * amp, y: (noise(T * 8 + 5) - 0.5) * amp });

export const TOTAL = VO.total + 0.3;
export const V39_FRAMES = Math.round(TOTAL * FPS);

// ───── media: image or clip covering a box, focus point + zoom ─────
type Cam = { fx: number; fy: number; s: number };
const Media: React.FC<{ src: string; sw: number; sh: number; w: number; h: number; cam: Cam; filter?: string; clipT?: number; clipLen?: number }> = ({ src, sw, sh, w, h, cam, filter, clipT, clipLen = 99 }) => {
  const k = Math.max(w / sw, h / sh) * cam.s, dw = sw * k, dh = sh * k;
  const x = clamp(w / 2 - cam.fx * dw, w - dw, 0), y = clamp(h / 2 - cam.fy * dh, h - dh, 0);
  const st: React.CSSProperties = { position: "absolute", left: x, top: y, width: dw, height: dh, maxWidth: "none", maxHeight: "none", filter };
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden" }}>
      {clipT === undefined ? <Img src={staticFile(src)} style={st} /> : (
        <Freeze frame={Math.max(0, Math.min(Math.floor(clipLen * 30) - 2, Math.round(clipT * 30)))}><OffthreadVideo src={staticFile(src)} muted style={st} /></Freeze>
      )}
    </div>
  );
};
const move = (T: number, a: number, b: number, A: Cam, B: Cam, entry?: { ds?: number; dx?: number; dy?: number; dur?: number }): Cam => {
  const u = easeInOut(prog(T, a, b)) * 0.4 + prog(T, a, b) * 0.6;
  const e = 1 - easeOut(prog(T, a, a + (entry?.dur ?? 0.35)));
  return { fx: lerp(A.fx, B.fx, u) + (entry?.dx ?? 0) * e, fy: lerp(A.fy, B.fy, u) + (entry?.dy ?? 0) * e, s: lerp(A.s, B.s, u) + (entry?.ds ?? 0) * e };
};

// ───── the evidence wall (dark, lit by one lamp from above) ─────
const Wall: React.FC<{ T: number }> = ({ T }) => (
  <AbsoluteFill style={{ background: "#0d0c0b", overflow: "hidden" }}>
    <Img src={staticFile("v39/img/board.jpg")} style={{ position: "absolute", left: -500, top: -100, height: H + 200, width: ((H + 200) * 1535) / 860, maxWidth: "none", filter: "blur(16px) brightness(0.28) saturate(0.5)", transform: `translateX(${Math.sin(T * 0.07) * 40}px)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 18%, rgba(255,200,130,${0.16 + 0.02 * noise(T * 3)}) 0%, rgba(0,0,0,0) 55%)` }} />
  </AbsoluteFill>
);

// an evidence print: white border, pin, paper tag, drops onto the wall
const Print: React.FC<{ T: number; t0: number; x: number; y: number; w: number; h: number; rot: number; children: React.ReactNode; tag?: string; tagT?: number; pin?: string; drop?: number }> =
  ({ T, t0, x, y, w, h, rot, children, tag, tagT, pin = RED, drop = 1 }) => {
    const a = easeOut(prog(T, t0, t0 + 0.32));
    const dy = (1 - a) * -160 * drop, dr = (1 - a) * 7 * drop, sc = 1 + (1 - a) * 0.12 * drop;
    const ta = tag ? easeOut(prog(T, tagT ?? t0 + 0.3, (tagT ?? t0 + 0.3) + 0.3)) : 0;
    return (
      <div style={{ position: "absolute", left: x, top: y + dy, width: w + 28, transform: `rotate(${rot + dr}deg) scale(${sc})`, opacity: drop ? Math.min(1, 0.2 + a) : 1 }}>
        <div style={{ position: "relative", width: w, height: h, padding: 14, background: "#f1ece2", boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>{children}</div>
          <div style={{ position: "absolute", left: "50%", top: -12, width: 34, height: 34, borderRadius: 17, background: `radial-gradient(circle at 35% 35%, #ff7a6e, ${pin} 60%, #5a0c08)`, transform: "translateX(-50%)", boxShadow: "0 6px 8px rgba(0,0,0,0.5)" }} />
        </div>
        {tag && (
          <div style={{ position: "absolute", right: 20, bottom: -38, transform: `rotate(${-rot * 0.6 - 2}deg) translateY(${(1 - ta) * 20}px)`, opacity: ta, background: CREAM, padding: "6px 24px 12px", fontFamily: "V39Type", fontSize: 34, color: "#2a2218", direction: "rtl", boxShadow: "0 8px 18px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>{tag}</div>
        )}
      </div>
    );
  };

const Stamp: React.FC<{ T: number; t0: number; text: string; x: number; y: number; rot?: number; size?: number }> = ({ T, t0, text, x, y, rot = -10, size = 92 }) => {
  if (T < t0) return null;
  const a = easeOut(prog(T, t0, t0 + 0.18));
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(2.3, 1, a)})`, opacity: a * 0.92, border: `8px solid ${RED}`, borderRadius: 14, padding: "0 28px 10px", fontFamily: "V39Black", fontSize: size, color: RED, whiteSpace: "nowrap", direction: "rtl", mixBlendMode: "normal", textShadow: "0 0 1px rgba(0,0,0,0.3)" }}>{text}</div>
  );
};

// a typed paper tag (word by word)
const Typed: React.FC<{ T: number; t0: number; text: string; size?: number; color?: string; per?: number }> = ({ T, t0, text, size = 40, color = "#fff", per = 0.09 }) => {
  const ws = text.split(" ");
  return (
    <span style={{ fontFamily: "V39Type", fontSize: size, color, direction: "rtl" }}>
      {ws.map((w, i) => <span key={i} style={{ opacity: T >= t0 + i * per ? 1 : 0 }}>{w}{i < ws.length - 1 ? " " : ""}</span>)}
      <span style={{ opacity: Math.sin(T * 10) > 0 && T < t0 + ws.length * per + 1.2 ? 1 : 0 }}>▌</span>
    </span>
  );
};

const Recon: React.FC<{ T: number }> = ({ T }) => (
  <div style={{ position: "absolute", right: 46, top: 250, display: "flex", alignItems: "center", gap: 10, fontFamily: "V39Bold", fontSize: 28, color: "rgba(255,255,255,0.8)", direction: "rtl", background: "rgba(0,0,0,0.45)", padding: "4px 16px 8px", borderRadius: 8 }}>
    <span style={{ width: 12, height: 12, borderRadius: 6, background: AMBER, opacity: 0.6 + 0.4 * Math.sin(T * 5) }} />بازسازیِ تصویری
  </div>
);
const Fades: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.85, bottom = 0.85 }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 420, background: `linear-gradient(rgba(0,0,0,${top}), rgba(0,0,0,0))` }} />
    <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: 700, background: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,${bottom}))` }} />
  </>
);
const Full: React.FC<{ src: string; cam: Cam; filter?: string; sw?: number; sh?: number }> = ({ src, cam, filter, sw = 1188, sh = 2110 }) => <Media src={src} sw={sw} sh={sh} w={W} h={H} cam={cam} filter={filter} />;

// ───── cue times ─────
const tArezou = c(wd(1, "آرزو"));
const tL2 = c(S(2)), tDead = wd(2, "زنده");
const tL3 = c(S(3)), tTown = wd(4, "شهرک"), tBody = c(wd(4, "بقایای"));
const tL5 = c(S(5)), tName = wd(5, "بابک"), tAge = wd(5, "چهل‌وهفت‌ساله‌ی"), tJob = wd(5, "سینما");
const tL6 = c(S(6)), tCheck = wd(6, "بررسی"), tL7 = c(S(7)), tHome = wd(7, "خونه‌ی");
const tL8 = c(S(8)), tDad = wd(8, "پدر"), tMom = wd(8, "مادرش");
const tL9 = c(S(9)), tL10 = c(S(10)), tL11 = c(S(11)), tL12 = c(S(12)), tThree = wd(12, "سه");
const tL13 = c(S(13)), tFara = wd(13, "فرامرز"), tL14 = c(S(14)), tArez2 = wd(14, "آرزو");
const tL15 = c(S(15)), tL16 = c(S(16)), tL17 = c(S(17)), tProud = c(wd(17, "افتخار"));
const tL18 = c(S(18)), tL19 = c(S(19)), tL20 = c(S(20)), tDied = wd(20, "فوت"), tL21 = c(S(21)), tYears = wd(21, "چهل‌وپنج");
const tL22 = c(S(22)), tL23 = c(S(23));
const CUTS = [tArezou, tL2, tL3, tBody, tL5, tL6, tL8, tL9, tL10, tL11, tL12, tL13, tL14, tL15, tL16, tL17, tProud, tL18, tL19, tL20, tL21, tL22];

// ───── scenes ─────
const babakPrint = (T: number, t0: number, gray: number, drop = 1) => (
  <Print T={T} t0={t0} x={80} y={560} w={890} h={660} rot={-2.5} tag="بابک خرمدین · کارگردان" tagT={t0 + 0.5} drop={drop}>
    <Media src="v39/img/babak.jpg" sw={1860} sh={1020} w={890} h={660} cam={move(T, t0, t0 + 6, { fx: 0.45, fy: 0.42, s: 1.0 }, { fx: 0.43, fy: 0.4, s: 1.18 })} filter={`grayscale(${gray}) contrast(1.08) brightness(0.95)`} />
  </Print>
);

const Scene: React.FC<{ T: number }> = ({ T }) => {
  // 1 · Babak, then «where is Arezou?»
  if (T < tArezou) return (<><Wall T={T} />{babakPrint(T, -0.3, 0.2, 1)}</>);
  if (T < tL2) {
    const sk = shakeXY(T, kick(T, tArezou, 24, 0.5));
    return (
      <AbsoluteFill style={{ transform: `translate(${sk.x}px,${sk.y}px)` }}>
        <Full src="v39/img/caseboard.jpg" cam={move(T, tArezou, tL2, { fx: 0.515, fy: 0.5, s: 2.25 }, { fx: 0.515, fy: 0.49, s: 2.45 }, { ds: 0.9, dur: 0.3 })} filter="contrast(1.1) brightness(0.9)" />
        <Fades />
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: "V39Black", fontSize: 120, color: CREAM, direction: "rtl", textShadow: "0 8px 30px #000", opacity: easeOut(prog(T, tArezou + 0.1, tArezou + 0.4)) }}>
          آرزو <span style={{ color: RED }}>کجاست؟</span>
        </div>
      </AbsoluteFill>
    );
  }
  // 2 · Babak turns grey — 1353–1400
  if (T < tL3) {
    const g = easeInOut(prog(T, tL2, tDead + 0.3));
    const y = easeOut(prog(T, tDead, tDead + 0.4));
    return (
      <>
        <Wall T={T} />
        {babakPrint(T, tL2 - 10, g, 0)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: y, transform: `translateY(${(1 - y) * 30}px)` }}>
          <div style={{ fontFamily: "V39Mono", fontSize: 84, color: CREAM, letterSpacing: 4, direction: "ltr" }}>1353 <span style={{ color: RED }}>—</span> 1400</div>
        </div>
      </>
    );
  }
  // 3 · Ekbatan, 03:30 — then the bag
  if (T < tL5) {
    const onBag = T >= tBody;
    const cam = onBag ? move(T, tBody, tL5, { fx: 0.5, fy: 0.6, s: 2.0 }, { fx: 0.5, fy: 0.6, s: 2.25 }, { ds: 0.5, dur: 0.3 }) : move(T, tL3, tBody, { fx: 0.55, fy: 0.5, s: 1.0 }, { fx: 0.62, fy: 0.48, s: 1.3 }, { ds: 0.15 });
    const ring = easeOut(prog(T, tBody + 0.3, tBody + 0.9));
    return (
      <>
        <Full src="v39/img/ekbatan-hall.jpg" cam={cam} filter="saturate(0.6) brightness(0.9) hue-rotate(-8deg)" />
        <Fades />
        <Recon T={T} />
        <div style={{ position: "absolute", left: 50, top: 250, fontFamily: "V39Mono", fontSize: 40, color: "#fff", direction: "ltr", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9, background: RED, opacity: Math.sin(T * 6) > 0 ? 1 : 0.2 }} />
          <Typed T={T} t0={tL3 + 0.2} text="1400/02/26 · 03:30" size={40} per={0.12} />
        </div>
        {T > tTown && (
          <div style={{ position: "absolute", right: 50, top: 330, background: CREAM, padding: "6px 24px 12px", fontFamily: "V39Type", fontSize: 38, color: "#2a2218", direction: "rtl", transform: `rotate(-2deg) scale(${backOut(prog(T, tTown, tTown + 0.35))})` }}>📍 شهرکِ اکباتان · تهران</div>
        )}
        {onBag && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
            <ellipse cx={540} cy={1000} rx={250} ry={180} fill="none" stroke={RED} strokeWidth={9} strokeDasharray={1400} strokeDashoffset={1400 * (1 - ring)} transform="rotate(-8 540 1000)" />
          </svg>
        )}
      </>
    );
  }
  // 4 · identity card
  if (T < tL6) {
    const a = easeOut(prog(T, tL5, tL5 + 0.35));
    const row = (label: string, val: string, t: number) => {
      const r = easeOut(prog(T, t, t + 0.25));
      return (
        <div style={{ display: "flex", gap: 18, alignItems: "baseline", borderBottom: "2px dashed rgba(60,45,30,0.35)", padding: "16px 0", opacity: 0.25 + 0.75 * r }}>
          <span style={{ fontFamily: "V39Bold", fontSize: 36, color: "#6b5b45", width: 120 }}>{label}</span>
          <span style={{ fontFamily: "V39Type", fontSize: 50, color: "#211a12", clipPath: `inset(0 0 0 ${(1 - r) * 100}%)` }}>{val}</span>
        </div>
      );
    };
    return (
      <>
        <Wall T={T} />
        <div style={{ position: "absolute", left: 90, top: 380, width: 900, transform: `translateY(${(1 - a) * 900}px) rotate(${lerp(6, -2, a)}deg)`, background: "radial-gradient(ellipse at 40% 30%, #f3ead6 0%, #dccca9 100%)", padding: "50px 56px 60px", direction: "rtl", boxShadow: "0 40px 90px rgba(0,0,0,0.8)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "V39Black", fontSize: 56, color: "#211a12" }}>هویتِ مقتول</div>
            <div style={{ fontFamily: "V39Type", fontSize: 30, color: "#6b5b45" }}>پرونده‌ی ۱۴۰۰</div>
          </div>
          <div style={{ height: 4, background: "#211a12", margin: "18px 0 10px" }} />
          <div style={{ display: "flex", gap: 34 }}>
            <div style={{ width: 300, height: 380, flexShrink: 0, overflow: "hidden", position: "relative", border: "8px solid #fff", boxShadow: "0 6px 14px rgba(0,0,0,0.35)", marginTop: 16 }}>
              <Media src="v39/img/babak.jpg" sw={1860} sh={1020} w={300} h={380} cam={{ fx: 0.43, fy: 0.42, s: 1.15 }} filter="grayscale(1) contrast(1.15)" />
            </div>
            <div style={{ flex: 1 }}>
              {row("نام", "بابک خرمدین", tName)}
              {row("سن", "۴۷ ساله", tAge)}
              {row("شغل", "کارگردانِ سینما", tJob)}
            </div>
          </div>
        </div>
        <Stamp T={T} t0={tJob + 0.45} text="شناسایی شد" x={700} y={1080} size={80} />
      </>
    );
  }
  // 5 · CCTV in the elevator → the clue → the way leads home
  if (T < tL8) {
    const zoom = easeInOut(prog(T, tCheck, tCheck + 0.6));
    const cam = { fx: lerp(0.45, 0.6, zoom), fy: lerp(0.5, 0.62, zoom), s: lerp(1.08, 2.2, zoom) + 0.1 * prog(T, tL7, tL8) };
    const sk = shakeXY(T, 2);
    const home = easeOut(prog(T, tHome, tHome + 0.4));
    return (
      <AbsoluteFill style={{ background: "#050607" }}>
        <div style={{ position: "absolute", left: 30, top: 470, width: 1020, height: 760, background: "#111", borderRadius: 22, padding: 18, boxShadow: "0 40px 80px rgba(0,0,0,0.8)", transform: `translate(${sk.x}px,${sk.y}px)` }}>
          <div style={{ position: "relative", width: 984, height: 724, overflow: "hidden", borderRadius: 8 }}>
            <Media src="v39/clips/cctv.mp4" sw={1280} sh={720} w={984} h={724} cam={cam} clipT={T - tL6} clipLen={13.1} filter="grayscale(1) contrast(1.25) brightness(0.9)" />
            <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
            <div style={{ position: "absolute", left: 20, top: 16, fontFamily: "V39Mono", fontSize: 32, color: "#fff", textShadow: "0 2px 4px #000" }}>CAM 01 · ELEVATOR</div>
            <div style={{ position: "absolute", right: 20, top: 16, fontFamily: "V39Mono", fontSize: 32, color: RED }}>● REC</div>
            {zoom > 0.5 && (
              <div style={{ position: "absolute", left: 292, top: 212, width: 400, height: 300, border: `5px solid ${AMBER}`, opacity: (zoom - 0.5) * 2 * (0.7 + 0.3 * Math.sin(T * 8)) }}>
                <div style={{ position: "absolute", right: -5, top: -58, background: AMBER, color: "#111", fontFamily: "V39Black", fontSize: 34, padding: "0 16px 6px" }}>سرنخ</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "absolute", left: 50, top: 300, fontFamily: "V39Type", fontSize: 40, color: CREAM, direction: "rtl" }}>
          <Typed T={T} t0={tL6 + 0.2} text="فیلمِ منتسب به دوربینِ آسانسور" size={42} color={CREAM} />
        </div>
        {T > tHome && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1265, display: "flex", justifyContent: "center", opacity: home, transform: `translateY(${(1 - home) * 30}px)` }}>
            <div style={{ background: CREAM, padding: "8px 30px 14px", fontFamily: "V39Black", fontSize: 46, color: "#211a12", direction: "rtl", transform: "rotate(-1.5deg)" }}>← ردّ ماجرا: خانه‌ی خودِ بابک</div>
          </div>
        )}
        <div style={{ position: "absolute", left: 50, top: 1240, fontFamily: "V39Reg", fontSize: 24, color: "rgba(255,255,255,0.45)", direction: "rtl" }}>منبع: شبکه‌های اجتماعی</div>
      </AbsoluteFill>
    );
  }
  // 6 · the two suspects: his parents (real photo)
  if (T < tL9) {
    const thread = easeOut(prog(T, tMom + 0.3, tMom + 0.9));
    return (
      <>
        <Wall T={T} />
        <Print T={T} t0={tDad - 0.1} x={560} y={430} w={400} h={600} rot={4} tag="متهمِ ۱ · پدر">
          <Media src="v39/img/screening-real.jpg" sw={2000} sh={2000} w={400} h={600} cam={move(T, tDad, tL9, { fx: 0.79, fy: 0.22, s: 1.75 }, { fx: 0.79, fy: 0.2, s: 1.95 })} filter="grayscale(0.7) contrast(1.1)" />
        </Print>
        {T > tMom - 0.1 && (
          <Print T={T} t0={tMom - 0.1} x={90} y={500} w={400} h={600} rot={-4} tag="متهمِ ۲ · مادر">
            <Media src="v39/img/screening-real.jpg" sw={2000} sh={2000} w={400} h={600} cam={move(T, tMom, tL9, { fx: 0.585, fy: 0.24, s: 1.75 }, { fx: 0.585, fy: 0.22, s: 1.95 })} filter="grayscale(0.7) contrast(1.1)" />
          </Print>
        )}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M 300 500 Q 540 640 770 430" stroke={RED} strokeWidth={6} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - thread)} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: "V39Black", fontSize: 84, color: CREAM, direction: "rtl", opacity: easeOut(prog(T, tL8, tL8 + 0.3)) }}>دو مُتّهمِ اصلی</div>
      </>
    );
  }
  // 7 · confessions (interrogation recon → the father after arrest → dark hallway), with a running confession sheet
  if (T < tL12) {
    let bg: React.ReactNode;
    if (T < tL10) bg = (<><Full src="v39/img/interrogation.jpg" cam={move(T, tL9, tL10, { fx: 0.5, fy: 0.45, s: 1.05 }, { fx: 0.45, fy: 0.5, s: 1.25 }, { ds: 0.12 })} filter="saturate(0.7) brightness(0.9)" /><Fades /><Recon T={T} /></>);
    else if (T < tL11) bg = (
      <>
        <Wall T={T} />
        <Print T={T} t0={tL10} x={40} y={700} w={972} h={560} rot={-1.5} tag="اکبر خرمدین · پس از بازداشت" tagT={tL10 + 0.6}>
          <Media src="v39/clips/fatherbow.mp4" sw={1280} sh={720} w={972} h={560} cam={move(T, tL10, tL11, { fx: 0.48, fy: 0.55, s: 1.05 }, { fx: 0.46, fy: 0.55, s: 1.2 })} clipT={T - tL10} clipLen={17.5} filter="saturate(0.6) contrast(1.1)" />
        </Print>
      </>
    );
    else bg = (<><Full src="v39/img/corridor.jpg" sw={1290} sh={860} cam={move(T, tL11, tL12, { fx: 0.5, fy: 0.42, s: 1.0 }, { fx: 0.5, fy: 0.4, s: 1.25 })} filter="brightness(0.85) contrast(1.1)" /><Fades /></>);
    const items: [string, number][] = [["داروی خواب‌آور در غذا", wd(9, "داروی")], ["ضرباتِ چاقو", wd(10, "چاقو")], ["رها کردن در زباله", wd(11, "زباله‌ها")]];
    const sheet = easeOut(prog(T, tL9 + 0.2, tL9 + 0.6));
    return (
      <>
        {bg}
        <div style={{ position: "absolute", right: 40, top: 300, width: 600, transform: `translateX(${(1 - sheet) * 700}px) rotate(1.5deg)`, background: CREAM, padding: "26px 34px 30px", direction: "rtl", boxShadow: "0 20px 50px rgba(0,0,0,0.7)" }}>
          <div style={{ fontFamily: "V39Black", fontSize: 44, color: "#211a12" }}>اعترافات</div>
          <div style={{ height: 3, background: "#211a12", margin: "8px 0 12px" }} />
          {items.map(([t, t0], i) => (
            <div key={i} style={{ fontFamily: "V39Type", fontSize: 36, color: "#211a12", padding: "6px 0", opacity: T >= t0 - 0.1 ? 1 : 0.15 }}>{["۱", "۲", "۳"][i]}. {T >= t0 - 0.1 ? t : "……"}</div>
          ))}
        </div>
      </>
    );
  }
  // 8 · one of three murders: the case board (user's image), then Faramarz 1390, Arezou 1397
  if (T < tL15) {
    let cam: Cam;
    if (T < tL13) cam = move(T, tL12, tL13, { fx: 0.5, fy: 0.5, s: 1.0 }, { fx: 0.5, fy: 0.5, s: 1.08 }, { ds: 0.2 });
    else if (T < tL14) cam = move(T, tL13, tL14, { fx: 0.16, fy: 0.56, s: 2.1 }, { fx: 0.16, fy: 0.58, s: 2.3 }, { ds: 0.4, dx: 0.2 });
    else cam = move(T, tL14, tL15, { fx: 0.515, fy: 0.56, s: 2.1 }, { fx: 0.515, fy: 0.58, s: 2.3 }, { ds: 0.4, dx: -0.2 });
    const sk = shakeXY(T, kick(T, tThree, 16, 0.4));
    const ring = easeOut(prog(T, tArez2, tArez2 + 0.5));
    return (
      <AbsoluteFill style={{ transform: `translate(${sk.x}px,${sk.y}px)` }}>
        <Full src="v39/img/caseboard.jpg" cam={cam} filter="contrast(1.08) brightness(0.92)" />
        <Fades top={0.6} />
        {T < tL13 && T > tThree && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center" }}>
            <div style={{ fontFamily: "V39Black", fontSize: 120, color: "#fff", background: RED, padding: "0 40px 20px", transform: `rotate(-3deg) scale(${backOut(prog(T, tThree, tThree + 0.3))})`, direction: "rtl" }}>۳ قتل</div>
          </div>
        )}
        {T >= tL14 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
            <ellipse cx={540} cy={820} rx={330} ry={430} fill="none" stroke={RED} strokeWidth={9} strokeDasharray={2500} strokeDashoffset={2500 * (1 - ring)} transform="rotate(-6 540 820)" />
          </svg>
        )}
      </AbsoluteFill>
    );
  }
  // 9 · the Arezou Babak was looking for: Babak filming (real clip)
  if (T < tL16) {
    const a = easeOut(prog(T, tL15 + 0.6, tL15 + 1.4));
    return (
      <>
        <Wall T={T} />
        <Print T={T} t0={tL15} x={40} y={520} w={972} h={640} rot={1.5} tag="بابک خرمدین · آرشیو" tagT={tL15 + 0.8}>
          <Media src="v39/clips/camera.mp4" sw={1280} sh={720} w={972} h={640} cam={move(T, tL15, tL16, { fx: 0.48, fy: 0.42, s: 1.05 }, { fx: 0.46, fy: 0.4, s: 1.25 })} clipT={T - tL15} clipLen={18.6} filter="sepia(0.35) saturate(0.6) contrast(1.05)" />
        </Print>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "V39Black", fontSize: 88, color: `rgba(239,227,200,${0.85 * a})`, direction: "rtl", filter: `blur(${(1 - a) * 8}px)` }}>«آرزو کجاست؟»</div>
      </>
    );
  }
  // 10 · the screening: recon of the moment, then the real photos on a film strip
  if (T < tL18) {
    const strip = (
      <>
        {[0, 1].map((side) => (
          <div key={side} style={{ position: "absolute", top: 0, [side ? "right" : "left"]: 0, width: 70, height: H, background: "#0a0908", display: "flex", flexDirection: "column", gap: 34, paddingTop: ((T * 120) % 64), alignItems: "center" } as React.CSSProperties}>
            {Array.from({ length: 32 }, (_, i) => <div key={i} style={{ width: 34, height: 30, borderRadius: 5, background: "#d9cfbf", opacity: 0.85 }} />)}
          </div>
        ))}
      </>
    );
    if (T < tL17) return (<><Full src="v39/img/screening-ai.jpg" cam={move(T, tL16, tL17, { fx: 0.5, fy: 0.35, s: 1.05 }, { fx: 0.5, fy: 0.3, s: 1.25 }, { ds: 0.15 })} filter="sepia(0.45) saturate(0.7) contrast(1.05)" /><Fades />{strip}<Recon T={T} /></>);
    const top = T < tProud;
    return (
      <AbsoluteFill style={{ background: "#16120e" }}>
        <div style={{ position: "absolute", left: 70, top: 600, width: W - 140, height: 470, overflow: "hidden" }}>
          <Media src="v39/img/screening-real.jpg" sw={2000} sh={2000} w={W - 140} h={470}
            cam={top ? move(T, tL17, tProud, { fx: 0.5, fy: 0.25, s: 1.0 }, { fx: 0.48, fy: 0.25, s: 1.08 }, { ds: 0.15 }) : move(T, tProud, tL18, { fx: 0.5, fy: 0.75, s: 1.0 }, { fx: 0.46, fy: 0.74, s: 1.12 }, { ds: 0.2 })}
            filter="sepia(0.3) saturate(0.75) contrast(1.05)" />
        </div>
        <Fades top={0.7} bottom={0.75} />
        {strip}
        <div style={{ position: "absolute", left: 110, top: 300, background: CREAM, padding: "6px 22px 10px", fontFamily: "V39Type", fontSize: 34, color: "#211a12", direction: "rtl", transform: "rotate(-2deg)" }}>عکسِ واقعی · مراسمِ اکران</div>
      </AbsoluteFill>
    );
  }
  // 11 · years later, the father on camera → the quote
  if (T < tL19) {
    const dim = easeInOut(prog(T, lineEnd(18), tL19));
    return (<><Full src="v39/img/interrogation.jpg" cam={move(T, tL18, tL19, { fx: 0.28, fy: 0.43, s: 2.0 }, { fx: 0.28, fy: 0.43, s: 2.4 }, { ds: 0.3 })} filter={`saturate(0.5) brightness(${0.9 - 0.7 * dim})`} /><Fades /><Recon T={T} /></>);
  }
  if (T < tL20) {
    const ws = VO.words.filter((w) => w.line === 19);
    return (
      <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ display: "flex", gap: 24, direction: "rtl", fontFamily: "V39Black", fontSize: 104, color: CREAM }}>
          {ws.map((w, i) => { const a = easeOut(prog(T, w.s - 0.05, w.s + 0.2)); return <span key={i} style={{ opacity: a, filter: `blur(${(1 - a) * 6}px)` }}>{bare(w.w).replace(/^/, i === 0 ? "«" : "").replace(/$/, i === ws.length - 1 ? "»" : "")}</span>; })}
        </div>
        <div style={{ fontFamily: "V39Type", fontSize: 40, color: "rgba(239,227,200,0.6)", direction: "rtl", opacity: easeOut(prog(T, lineEnd(19), lineEnd(19) + 0.4)) }}>— اکبر خرمدین</div>
      </AbsoluteFill>
    );
  }
  // 12 · the father died in prison; the mother: 45 months
  if (T < tL21) return (
    <>
      <Wall T={T} />
      <Print T={T} t0={tL20} x={250} y={420} w={560} h={760} rot={-2} tag="اکبر خرمدین" tagT={tL20 + 0.4}>
        <Media src="v39/img/screening-real.jpg" sw={2000} sh={2000} w={560} h={760} cam={move(T, tL20, tL21, { fx: 0.79, fy: 0.2, s: 1.7 }, { fx: 0.79, fy: 0.19, s: 1.85 })} filter="grayscale(1) contrast(1.15)" />
      </Print>
      <Stamp T={T} t0={tDied} text="درگذشت در زندان" x={540} y={1050} size={70} />
    </>
  );
  if (T < tL22) return (
    <>
      <Wall T={T} />
      <Print T={T} t0={tL21} x={90} y={470} w={880} h={660} rot={2} tag="مادرِ بابک · دادگاه" tagT={tL21 + 0.4}>
        <Media src="v39/img/mother.jpg" sw={1290} sh={968} w={880} h={660} cam={move(T, tL21, tL22, { fx: 0.6, fy: 0.35, s: 1.0 }, { fx: 0.65, fy: 0.3, s: 1.15 })} filter="saturate(0.6) contrast(1.05)" />
      </Print>
      <Stamp T={T} t0={tYears} text="۴۵ ماه حبس" x={560} y={1090} size={90} />
    </>
  );
  // 13 · the last question: Babak fades into black
  const f = easeInOut(prog(T, tL22, tL23 + 0.6));
  const q = VO.words.filter((w) => w.line === 23);
  return (
    <>
      <AbsoluteFill style={{ opacity: 1 - f }}><Wall T={T} />{babakPrint(T, tL22 - 10, 1, 0)}</AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${f})` }} />
      {T >= tL23 - 0.1 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 760, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px", direction: "rtl", fontFamily: "V39Black", fontSize: 76, lineHeight: 1.5 }}>
          {q.map((w, i) => { const a = easeOut(prog(T, w.s - 0.05, w.s + 0.25)); const b = bare(w.w); return <span key={i} style={{ opacity: 0.08 + 0.92 * a, color: ["راز", "قتل", "پنهون"].includes(b) ? RED : CREAM }}>{w.w.replace(/[ً-ْ]/g, "")}</span>; })}
        </div>
      )}
    </>
  );
};

// ───── captions: 2–3 words, white, keywords amber, the spoken word pops ─────
const Captions: React.FC<{ T: number }> = ({ T }) => {
  if ((T >= tL19 && T < tL20) || T >= tL23 - 0.1) return null;
  const ch = [...CAPS].reverse().find((x) => T >= x.s - 0.03);
  if (!ch || T > ch.e + 0.25) return null;
  const a = easeOut(prog(T, ch.s - 0.03, ch.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1400, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 22px", direction: "rtl", transform: `scale(${0.88 + 0.12 * a})`, opacity: a }}>
      {ch.words.map((w, i) => {
        const on = T >= w.s - 0.04;
        const pop = on ? 1 + 0.12 * (1 - easeOut(prog(T, w.s - 0.04, w.s + 0.16))) : 1;
        return (
          <span key={i} style={{ fontFamily: "V39Black", fontSize: 80, lineHeight: 1.35, color: w.kw ? AMBER : "#FFFFFF", opacity: on ? 1 : 0.5, display: "inline-block", transform: `scale(${pop})`,
            WebkitTextStroke: "3px rgba(0,0,0,0.9)", paintOrder: "stroke fill", textShadow: "0 5px 18px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)" }}>{bare(w.w)}</span>
        );
      })}
    </div>
  );
};

// cut flash: a camera-flash pop (evidence photo) on each cut
const Flash: React.FC<{ T: number }> = ({ T }) => {
  const c0 = CUTS.find((x) => T >= x && T < x + 0.14);
  if (c0 === undefined) return null;
  return <AbsoluteFill style={{ background: `rgba(255,248,235,${0.32 * (1 - prog(T, c0, c0 + 0.14))})` }} />;
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const f = Math.floor(T * 30);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Scene T={T} />
      <Img src={staticFile(`v22/grain-${String((f % 12) + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.09, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <Flash T={T} />
      <Captions T={T} />
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

export const V39_LOOK = [0.05, 1.5, tArezou + 0.6, tDead + 0.8, tL3 + 2, tTown + 1, tBody + 1.2, tJob + 0.8, tL6 + 1, tCheck + 1.2, tHome + 0.8, tMom + 1, tL9 + 1.5, tL10 + 1.5, tL11 + 2.5, tThree + 0.5, tFara + 1, tArez2 + 0.8, tL15 + 2, tL16 + 1.5, tL17 + 1, tProud + 1, tL18 + 1.5, lineEnd(19) + 0.5, tDied + 0.6, tYears + 0.6, tL22 + 1.5, lineEnd(23) + 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V39: React.FC = () => (
  <>
    <Composition id="V39" component={Video} durationInFrames={V39_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v39/mix-norm.wav" }} />
    <Composition id="V39-Silent" component={Video} durationInFrames={V39_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V39-Look" component={Look} durationInFrames={V39_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: V39_LOOK }} />
  </>
);
