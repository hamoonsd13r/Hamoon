// Video 24 — «پمپ‌بنزین · شب ۷ از ۷ · فینال» · vertical 1080×1920 · same vector world as V09…V22 (pieces from ../v09, ../v20, ../v22).
// Recap → last night's fork (break the phone ✗ / keep it face down ✓) → her two morning rules (the clues) → 5:30 a fake rescue that knows your name
// (silent ✓ / open ✗) → sunrise, the reflection finally in sync → a real rescue with shadows (open ✓ / don't ✗) → a week later at home: the mirror lags.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Exterior, Figure, NASTA } from "../v09/Video";
import { Beam, Dead, GlassWall, Rew } from "../v20/Video";
import { Face, Fork, Grain, Mirror, Scare } from "../v22/Video";
import words from "./words.json";

type Wd = { si: number; wi: number; w: string; v: string; s: number; e: number };
const WORDS = words as Wd[];
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const W = (si: number, needle: string, nth = 0) => {
  const h = WORDS.filter((w) => w.si === si && w.w.includes(needle));
  const w = h[nth] ?? h[0];
  if (!w) throw new Error(`word ${si}:${needle}`);
  return w.s;
};
const S = (si: number) => WORDS.find((w) => w.si === si)!.s;
const E = (si: number) => WORDS.filter((w) => w.si === si).at(-1)!.e;
export const V24_END = E(21) + 3.0;
export const V24_FRAMES = fr(V24_END);

// ---- the game clock (all from the voice) ----
const REW = 0.8;
/** fork 0 = last night's phone: A (break) dies */
export const CRACK0 = W(2, "شکستی") + 0.3;
export const DEAD0 = E(3) + 0.2;
export const REW0 = S(4) - REW - 0.05;
/** fork 1: the fake rescue at 5:30 — B (open) dies */
export const T1 = E(9) + 0.15;
export const SCARE1 = E(11) + 0.02;
export const DEAD1 = E(11) + 0.32;
export const REW1 = S(12) - REW - 0.05;
/** fork 2: the real rescue at sunrise — B (don't open) dies */
export const T2 = E(16) + 0.15;
export const DEAD2 = E(18) + 0.2;
export const REW2 = S(19) - REW - 0.05;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};
const GREEN = "#1fae5c";
const PALE = "#b8d6f4";
const SUN = "#ffb347";

/* ===== 0 · recap ===== */
const RecapLabel: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 60, top: 80, display: "flex", alignItems: "center", gap: 16, direction: "rtl", fontFamily: BLACK, fontSize: 40, color: "#fff", background: "rgba(0,0,0,.6)", border: "3px solid rgba(255,255,255,.25)", borderRadius: 16, padding: "6px 22px" }}>
    <span style={{ fontFamily: FONT_NUM, opacity: 0.5 + 0.5 * (Math.floor(t * 2) % 2) }}>◀◀</span>قسمت‌های قبل
  </div>
);
const Recap: React.FC<{ t: number }> = ({ t }) => {
  const thing = W(0, "یه", 1) - 0.15;
  if (t < thing) {
    const n6 = rk(t, W(0, "شش") - 0.1, W(0, "شش") + 0.3, back);
    return (
      <AbsoluteFill>
        <Exterior t={t} push={0.08 * rk(t, 0, thing)} litShop={0.3} />
        <div style={{ position: "absolute", left: 0, top: 420, width: "100%", textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 120, color: C.sodium, textShadow: `0 0 40px ${C.sodiumGlow}, 0 6px 0 #000`, transform: `scale(${n6})` }}>۶ شب</div>
        <div style={{ position: "absolute", left: 0, top: 580, width: "100%", textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 46, color: "#fff", opacity: rk(t, W(0, "کویرم") - 0.2, W(0, "کویرم") + 0.2), textShadow: "0 3px 0 #000" }}>شیفت شب · وسط کویر · تنها</div>
      </AbsoluteFill>
    );
  }
  // «…and it wants to leave here with my face»: the reflection steps forward out of the glass
  const leave = rk(t, W(0, "می‌خواد") - 0.2, E(0) + 0.3);
  return (
    <AbsoluteFill>
      <GlassWall t={t} eyes={rk(t, W(0, "صورت") - 0.2, W(0, "صورت") + 0.2)} zoom={0.1 + 0.25 * leave} />
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: 0.85 * leave }}>
        <g transform={`translate(540 ${lerp(900, 1100, leave)}) scale(${lerp(1, 1.5, leave)})`}><Face s={0.42} tint="#a9bdd3" grin={leave} /></g>
      </svg>
    </AbsoluteFill>
  );
};

/* ===== 1–4 · last night's phone ===== */
/** The phone. face: 0 screen up … 1 face down on the floor. smile: the grin in the black screen. cracks: shattered screen. */
const Phone: React.FC<{ t: number; smile?: number; cracks?: number; many?: number; down?: number; buzz?: boolean; glow?: number }> = ({ t, smile = 0, cracks = 0, many = 0, down = 0, buzz = false, glow = 0 }) => {
  const wob = buzz ? Math.sin(t * 60) * 5 * (Math.floor(t * 1.6) % 2) : 0;
  const flip = Math.cos(down * Math.PI); // 1 → -1
  const showBack = flip < 0;
  return (
    <AbsoluteFill style={{ background: down > 0.5 ? "#0b0a09" : "#000" }}>
      {down > 0.5 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={0} y={i * 200 + 60} width={1080} height={5} fill="#141210" />)}
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200 + 40} y={0} width={5} height={1920} fill="#141210" />)}
          {glow > 0 && <ellipse cx={540} cy={900} rx={420} ry={640} fill={`rgba(140,180,255,${0.12 * glow})`} />}
        </svg>
      )}
      <div style={{ position: "absolute", left: 190, top: 330, width: 700, height: 1180, borderRadius: 90, transform: `translateX(${wob}px) rotate(${wob * 0.3 + down * 8}deg) scaleX(${Math.abs(flip) < 0.02 ? 0.02 : flip}) scale(${lerp(1, 0.85, down)})`, background: showBack ? "#1e2228" : "#030405", boxShadow: showBack ? "0 30px 60px rgba(0,0,0,.8)" : "0 0 0 6px #1a1d22", overflow: "hidden" }}>
        {showBack ? (
          <svg width={700} height={1180} style={{ position: "absolute", transform: "scaleX(-1)" }}>
            <rect x={40} y={40} width={230} height={230} rx={50} fill="#14171c" />
            {[[100, 100], [210, 100], [100, 210]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={42} fill="#06070a" stroke="#2a2f36" strokeWidth={8} />)}
            <circle cx={210} cy={210} r={14} fill="#c9c09a" />
          </svg>
        ) : (
          <svg width={700} height={1180} style={{ position: "absolute" }}>
            <path d="M40 60 L260 60 L60 520 Z" fill="rgba(255,255,255,.04)" />
            <g opacity={0.35}><Figure x={350} y={760} s={1.6} fill="#8aa0b8" /></g>
            <g opacity={smile}>
              <circle cx={314} cy={630} r={9} fill="#f6f1df" /><circle cx={386} cy={630} r={9} fill="#f6f1df" />
              <path d={`M280 690 Q350 ${690 + 70 * smile} 420 690`} stroke="#f6f1df" strokeWidth={8} fill="none" strokeLinecap="round" />
            </g>
            {cracks > 0 && Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2 + hn(i) * 0.3; const r = 900 * cracks * (0.6 + 0.4 * hn(i, 2)); return <path key={i} d={`M350 560 L${350 + Math.cos(a) * r * 0.5 + (hn(i, 3) - 0.5) * 40} ${560 + Math.sin(a) * r * 0.5} L${350 + Math.cos(a) * r} ${560 + Math.sin(a) * r}`} stroke="#dfe8f2" strokeWidth={4} fill="none" opacity={0.85} />; })}
            {many > 0 && Array.from({ length: 22 }, (_, i) => { const x = 60 + (i % 5) * 140 + hn(i) * 30, y = 120 + Math.floor(i / 5) * 230 + hn(i, 2) * 40; return <g key={i} opacity={rk(many, i / 30, i / 30 + 0.25)}><circle cx={x - 10} cy={y} r={5} fill="#f6f1df" /><circle cx={x + 10} cy={y} r={5} fill="#f6f1df" /><path d={`M${x - 14} ${y + 14} Q${x} ${y + 26} ${x + 14} ${y + 14}`} stroke="#f6f1df" strokeWidth={3} fill="none" /></g>; })}
          </svg>
        )}
      </div>
      {showBack && glow > 0 && <div style={{ position: "absolute", left: 230, top: 1450, width: 620, height: 20, borderRadius: 10, background: `rgba(160,200,255,${0.5 * glow})`, filter: "blur(10px)" }} />}
    </AbsoluteFill>
  );
};

/** last night's two cards; A dies on the crack, B wins after the rewind */
const PhoneQ: React.FC<{ t: number }> = ({ t }) => {
  const late = t >= S(4) - 0.1;
  const q = rk(t, W(1, "می‌شکنیش") - 0.15, W(1, "می‌شکنیش") + 0.2, back);
  const isA = !late && t >= S(2) - 0.25;
  const isB = late;
  const bOk = late ? rk(t, S(4), S(4) + 0.3, back) : 0;
  const comments = ["A", "B", "B", "A", "B", "A", "B"];
  const cardOf = (l: string, ic: string, txt: string, col: string, on: boolean, off: boolean, hot: string, tag: string) => (
    <div key={l} style={{ position: "relative", width: 420, height: 360, borderRadius: 36, background: on ? hot : "rgba(12,14,20,.9)", border: `6px solid ${on ? "#fff" : col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${q * (on ? 1.08 : off ? 0.9 : 1)})`, opacity: off ? 0.35 : 1, boxShadow: on ? `0 0 80px ${hot}` : "0 20px 50px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px" }}>{l}</div>
      <div style={{ fontSize: 100 }}>{ic}</div>
      <div style={{ fontSize: 48, whiteSpace: "pre-line", lineHeight: 1.2 }}>{txt}</div>
      {on && <div style={{ position: "absolute", bottom: -46, fontSize: 44, background: "#000", border: `4px solid ${hot}`, borderRadius: 20, padding: "2px 24px", color: hot, transform: `scale(${l === "B" ? bOk : 1})` }}>{tag}</div>}
    </div>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${6 * q}px) brightness(${1 - 0.55 * q})` }}><Phone t={t} smile={1} /></AbsoluteFill>
      <AbsoluteFill style={{ direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 260, width: "100%", fontSize: 40, color: C.sodium, opacity: q }}>جوابِ انتخابِ دیشب</div>
        <div style={{ position: "absolute", top: 320, width: "100%", fontSize: 84, transform: `scale(${q})` }}>با گوشی چی کار کردی؟</div>
        <div style={{ position: "absolute", top: 600, width: "100%", display: "flex", justifyContent: "center", gap: 50 }}>
          {cardOf("A", "🔨", "می‌شکنمش", C.red, isA, isB, C.red, "💀 مرگ")}
          {cardOf("B", "📱", "نگهش\nمی‌دارم", "#3a6db0", isB, isA, GREEN, "✓ زنده")}
        </div>
        {!late && comments.map((c, i) => {
          const at = W(1, "می‌شکنیش") + i * 0.3;
          const k = (t - at) / 2.0;
          if (k < 0 || k > 1) return null;
          return <div key={i} style={{ position: "absolute", left: 120 + hn(i, 4) * 700, top: lerp(1650, 1080, k), opacity: Math.sin(k * Math.PI), display: "flex", alignItems: "center", gap: 12, background: "#fff", color: "#111", borderRadius: 26, padding: "8px 22px", fontSize: 40 }}><span style={{ fontSize: 30, color: "#666", fontFamily: FONT_TEXT }}>کامنت</span>{c}</div>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
/* 4 · why B: broken glass = a hundred reflections (night 6), so: keep it, face down */
const WhyB: React.FC<{ t: number }> = ({ t }) => {
  const mem = W(4, "شیشه") - 0.15, keep = W(4, "پس") - 0.15;
  if (t < mem) return <PhoneQ t={t} />;
  if (t < keep) {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: "sepia(.5) saturate(.6)" }}><Mirror t={t} smile={1} cracks={1} many={1} hands={0} /></AbsoluteFill>
        <div style={{ position: "absolute", left: 60, top: 120, fontFamily: FONT_NUM, fontSize: 52, color: "#fff", direction: "rtl" }}>◀◀ شب ۶</div>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 3px, transparent 3px 6px)" }} />
      </AbsoluteFill>
    );
  }
  return <Phone t={t} smile={1 - rk(t, keep, W(4, "برش"))} down={rk(t, W(4, "برش") - 0.2, W(4, "برش") + 0.5)} />;
};

/* ===== 5–6 · night 7, her call ===== */
const Night7: React.FC<{ t: number }> = ({ t }) => {
  const card = t < W(5, "گوشی") - 0.15;
  if (!card) return <Phone t={t} down={1} buzz glow={0.6 + 0.4 * Math.sin(t * 9)} />;
  const a = rk(t, S(5) - 0.1, S(5) + 0.3, back), b = rk(t, W(5, "آخرین") - 0.1, W(5, "آخرین") + 0.3, back);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a0608, #030304 70%)", direction: "rtl", fontFamily: BLACK, textAlign: "center", color: "#fff" }}>
      <div style={{ position: "absolute", top: 560, width: "100%", fontSize: 170, color: C.red, textShadow: "0 0 60px rgba(232,50,60,.5)", transform: `scale(${a})` }}>شب ۷ از ۷</div>
      <div style={{ position: "absolute", top: 820, width: "100%", fontSize: 70, transform: `scale(${b})` }}>آخرین شب</div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}><Figure x={540} y={1560} s={1.1} fill="rgba(170,205,240,.12)" eyes={Math.floor(t * 1.4) % 3 === 0 ? 0.9 : 0} /></svg>
    </AbsoluteFill>
  );
};
/** her two morning rules: the clues for both forks */
const MorningRules: React.FC<{ t: number }> = ({ t }) => {
  const r1 = rk(t, W(6, "تا") - 0.1, W(6, "تا") + 0.3, back);
  const r2 = rk(t, W(6, "وقتی") - 0.1, W(6, "وقتی") + 0.3, back);
  const hi = rk(t, W(6, "سایه") - 0.1, W(6, "سایه") + 0.3);
  const since = Math.max(0, t - S(6) + 2);
  const rule = (ic: string, head: string, body: string, k: number, col: string, h = 0) => (
    <div style={{ display: "flex", alignItems: "center", gap: 30, width: 900, padding: "34px 40px", borderRadius: 30, background: `rgba(${col === SUN ? "255,179,71" : "232,50,60"},${0.1 + 0.12 * h})`, border: `4px solid ${col}`, transform: `scale(${k * (1 + 0.04 * h)})`, opacity: k > 0.01 ? 1 : 0, marginTop: 40 }}>
      <div style={{ fontSize: 110 }}>{ic}</div>
      <div style={{ textAlign: "right" }}><div style={{ fontFamily: FONT_TEXT, fontSize: 36, color: col }}>{head}</div><div style={{ fontFamily: NASTA, fontSize: 60, color: "#fff", lineHeight: 1.7 }}>{body}</div></div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #101826, #030406 75%)", direction: "rtl", fontFamily: BLACK, color: "#fff", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 60, top: 90, display: "flex", alignItems: "center", gap: 14, background: "rgba(20,30,24,.9)", border: `3px solid ${GREEN}`, borderRadius: 40, padding: "8px 24px", fontFamily: FONT_TEXT, fontSize: 32 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: GREEN, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />ناشناس
        <span style={{ fontFamily: FONT_NUM, direction: "ltr" }}>{`۰:${fa(String(Math.floor(since)).padStart(2, "0"))}`}</span>
      </div>
      <div style={{ position: "absolute", top: 290, width: "100%", textAlign: "center", fontSize: 58, color: "#f6c6d8", opacity: rk(t, S(6) - 0.2, S(6) + 0.2) }}>دو تا قانونِ آخر</div>
      <div style={{ position: "absolute", top: 400, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {rule("🌑", "تا آفتاب نزده", "در رو برای هیچ‌کس باز نکن", r1, C.red)}
        {rule("☀️", "وقتی آفتاب زد", "فقط کسی که سایه داره، آدمه", r2, SUN, hi)}
      </div>
    </AbsoluteFill>
  );
};

/* ===== 7–19 · the shop front: night → dawn. lights: fake headlights; figs: who's outside; shadows: real ones cast shadows. ===== */
const ShopFront: React.FC<{ t: number; day?: number; lights?: number; vanish?: number; figs?: number; shadows?: boolean; vests?: boolean; open?: number; knocks?: number[]; zoom?: number; me?: number; lag?: number; mark?: number; faces?: number; mega?: number }> = ({ t, day = 0, lights = 0, vanish = 0, figs = 0, shadows = false, vests = false, open = 0, knocks = [], zoom = 0, me = 1, lag = 0, mark = 0, faces = 0, mega = 0 }) => {
  const kk = knocks.map((k) => t - k).filter((d) => d >= 0 && d < 0.5);
  const shake = kk.length ? Math.sin(kk[0] * 70) * 8 * (1 - kk[0] / 0.5) : 0;
  const skyTop = mix("#05070e", "#7fb2e0", day), skyLow = mix("#101a2e", "#ffc27a", day), ground = mix("#120f0c", "#b08a5c", day);
  const sunY = lerp(1060, 640, day);
  const cars = [260, 540, 820];
  // a turn of the head (for the sync / lag shots)
  const turn = (u: number) => { const k = ((u % 2.6) + 2.6) % 2.6; return rk(k, 0.4, 0.65) - rk(k, 1.6, 1.85); };
  const meTurn = lag >= 0 ? turn(t) : 0;
  const refTurn = lag >= 0 ? turn(t - lag) : 0;
  return (
    <AbsoluteFill style={{ background: "#04060b" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + zoom}) translateX(${shake}px)`, transformOrigin: "540px 900px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="v24sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="1" stopColor={skyLow} /></linearGradient>
            <radialGradient id="v24glare"><stop offset="0" stopColor="#ffffff" /><stop offset="0.25" stopColor="rgba(255,250,230,.8)" /><stop offset="1" stopColor="rgba(255,250,230,0)" /></radialGradient>
            <radialGradient id="v24sun"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.35" stopColor={SUN} /><stop offset="1" stopColor="rgba(255,179,71,0)" /></radialGradient>
          </defs>
          <rect width={1080} height={1000} fill="url(#v24sky)" />
          {day < 0.6 && Array.from({ length: 50 }, (_, i) => <circle key={i} cx={hn(i) * 1080} cy={hn(i, 2) * 800} r={1 + hn(i, 3) * 1.6} fill="#fff" opacity={(1 - day / 0.6) * (0.3 + 0.4 * hn(i, 4))} />)}
          {day > 0 && <circle cx={800} cy={sunY} r={260} fill="url(#v24sun)" opacity={clamp(day * 1.5)} />}
          <path d="M0 1000 L140 930 L260 970 L420 900 L560 960 L720 910 L880 965 L1080 920 L1080 1010 L0 1010 Z" fill={mix("#0d1220", "#8a6a50", day)} />
          <rect y={1000} width={1080} height={600} fill={ground} />
          {/* the fake rescue: blinding headlights, figures in front of them with NO shadows */}
          {lights > 0 && cars.map((x, i) => {
            const v = lights * (1 - rk(vanish, i / 3, i / 3 + 0.3));
            return v > 0.01 && (
              <g key={i} opacity={v}>
                <circle cx={x - 40} cy={1060} r={150} fill="url(#v24glare)" /><circle cx={x + 40} cy={1060} r={150} fill="url(#v24glare)" />
                <rect x={x - 90} y={1030} width={180} height={50} rx={10} fill="rgba(20,20,24,.6)" />
              </g>
            );
          })}
          {figs > 0 && [380, 700].map((x, i) => {
            const v = figs * (1 - rk(vanish, 0.2 + i * 0.3, 0.5 + i * 0.3));
            return v > 0.01 && (
              <g key={i} opacity={v}>
                {shadows && <path d={`M${x - 70} 1250 L${x + 70} 1250 L${x + 190} 1490 L${x - 110} 1490 Z`} fill="rgba(30,16,4,.8)" />}
                <Figure x={x} y={1040} s={0.75} fill={vests ? "#1a1f2a" : "#010203"} />
                <rect x={x - 70} y={1060} width={140} height={190} fill={vests ? "#1a1f2a" : "#010203"} />
                {vests && <><rect x={x - 70} y={1100} width={140} height={60} fill="#ff7a1a" /><rect x={x - 70} y={1130} width={140} height={10} fill="#e6e6d8" /></>}
                {!vests && i === 0 && mega > 0 && <path d={`M${x + 50} 960 l70 -30 l0 80 Z`} fill="#010203" />}
                {faces > 0 && <g opacity={faces}><circle cx={x - 14} cy={980} r={6} fill="#f6f1df" /><circle cx={x + 14} cy={980} r={6} fill="#f6f1df" /></g>}
              </g>
            );
          })}
          {/* shadow markers on the real rescuers */}
          {mark > 0 && [380, 700].map((x) => <ellipse key={x} cx={x + 40} cy={1370} rx={170 * mark} ry={100 * mark} fill="none" stroke={GREEN} strokeWidth={8} />)}
          {/* glass panels; the middle one is the door */}
          {[0, 2].map((i) => <rect key={i} x={40 + i * 340} y={160} width={320} height={1340} fill="rgba(127,163,199,.06)" stroke="#1e242e" strokeWidth={18} />)}
          <g transform={`translate(${open * 300} 0)`}>
            <rect x={380} y={160} width={320} height={1340} fill="rgba(127,163,199,.07)" stroke="#262d38" strokeWidth={18} />
            <rect x={660} y={760} width={16} height={150} rx={8} fill="#9aa1ad" />
          </g>
          {/* your reflection (sync / lag) */}
          {lag >= 0 && me > 0 && <g opacity={0.24}><Figure x={540} y={860} s={1.3} fill={PALE} turn={refTurn} /></g>}
          <rect x={0} y={1500} width={1080} height={420} fill={mix("#0d1015", "#3a3028", day)} />
          <rect x={0} y={1500} width={1080} height={16} fill="#232831" />
          {kk.map((d, i) => <circle key={i} cx={540} cy={1000} r={30 + d * 400} fill="none" stroke="rgba(220,235,255,.6)" strokeWidth={6 * (1 - d / 0.5)} />)}
        </svg>
      </AbsoluteFill>
      {me > 0 && <svg width={1080} height={1920} style={{ position: "absolute", opacity: me }}><Figure x={540} y={1560} s={2.2} fill="#010203" turn={meTurn} /></svg>}
      {lights > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, rgba(255,250,230,${0.12 * lights * (1 - vanish)}), transparent 60%)` }} />}
    </AbsoluteFill>
  );
};

const Headlights: React.FC<{ t: number }> = ({ t }) => {
  const arrive = rk(t, W(7, "نور") - 0.3, W(7, "ماشین") + 0.4);
  const figs = rk(t, W(7, "بلندگو") - 0.2, W(7, "بلندگو") + 0.4);
  const talk = t >= S(8) && t <= E(8) ? 1 : 0;
  return (
    <AbsoluteFill>
      <ShopFront t={t} lights={arrive} figs={figs} mega={1} zoom={0.05 + 0.12 * rk(t, S(8), E(8))} lag={-1} />
      {talk > 0 && <div style={{ position: "absolute", left: 140, top: 420, fontFamily: BLACK, fontSize: 50, color: "#111", background: "#fff6dc", borderRadius: "30px 30px 6px 30px", padding: "10px 28px", direction: "rtl", transform: `scale(${1 + 0.03 * Math.sin(t * 20)})` }}>📢 نیروی امداد!</div>}
    </AbsoluteFill>
  );
};
/* 10–11 · you open: they come in, every one of them has your face */
const FakeIn: React.FC<{ t: number }> = ({ t }) => {
  const open = rk(t, S(10) + 0.5, S(11), out3);
  const n = rk(t, S(11) - 0.2, E(11) - 0.2);
  return (
    <AbsoluteFill>
      <ShopFront t={t} lights={1} figs={1} faces={1} open={open} zoom={0.1 + 0.25 * n} lag={-1} me={1 - n} />
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: n }}>
        {[[540, 900, 0.5], [300, 1000, 0.35], [790, 1000, 0.35], [420, 1250, 0.28], [680, 1250, 0.28]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y + Math.sin(t * 3 + i) * 10})`}><Face s={s * lerp(0.6, 1, n)} tint="#b9cbe0" grin={n} /></g>
        ))}
      </svg>
      <Beam x={540} y={1000} r={700} dim={0.7} />
    </AbsoluteFill>
  );
};
/* 13 · sunrise: the reflection finally moves with you */
const Dawn: React.FC<{ t: number }> = ({ t }) => {
  const day = rk(t, S(13) - 0.2, W(13, "می‌زنه") + 0.8);
  const sync = rk(t, W(13, "انعکاسم") - 0.2, W(13, "انعکاسم") + 0.2);
  return (
    <AbsoluteFill>
      <ShopFront t={t} day={day} lag={sync > 0 ? 0 : -1} zoom={0.04 * rk(t, S(13), E(13))} />
      {sync > 0 && <div style={{ position: "absolute", left: 300, top: 470, fontFamily: BLACK, fontSize: 42, color: "#fff", direction: "rtl", background: "rgba(0,0,0,.6)", border: `3px solid ${GREEN}`, borderRadius: 16, padding: "4px 22px", transform: `scale(${rk(t, W(13, "همزمان") - 0.1, W(13, "همزمان") + 0.2, back)})` }}>✓ همزمان · بدون تأخیر</div>}
    </AbsoluteFill>
  );
};
/* 14–16 · the real rescue: daylight, orange vests, long shadows, no names */
const Rescue: React.FC<{ t: number }> = ({ t }) => {
  const figs = rk(t, S(14) - 0.2, S(14) + 0.3);
  return (
    <AbsoluteFill>
      <ShopFront t={t} day={1} figs={figs} shadows vests knocks={[W(14, "در") - 0.05, W(14, "در") + 0.25, W(14, "می‌زنه") + 0.1]} zoom={0.05 + 0.1 * rk(t, S(15), E(16))} mark={rk(t, W(16, "سایه") - 0.1, W(16, "سایه") + 0.3, back)} lag={0} />
      {t >= W(16, "سایه") - 0.1 && <div style={{ position: "absolute", left: 400, top: 1150, fontFamily: BLACK, fontSize: 48, color: GREEN, direction: "rtl", textShadow: "0 3px 0 #000" }}>سایه دارن ✓</div>}
    </AbsoluteFill>
  );
};
/* 17–18 · you don't open: the sun goes back down — night 8 */
const Sunset: React.FC<{ t: number }> = ({ t }) => {
  const k = rk(t, S(17) + 0.3, E(18) - 0.2, (u) => u);
  const card = rk(t, S(18) + 0.4, S(18) + 0.8, back);
  const g = Math.floor(t * 20) % 3 === 0 ? 8 : 0;
  return (
    <AbsoluteFill>
      <ShopFront t={t} day={1 - k} figs={1 - rk(k, 0.1, 0.5)} shadows vests lag={-1} />
      <div style={{ position: "absolute", left: g, top: 560, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 150, color: C.red, direction: "rtl", textShadow: "-6px 0 rgba(0,220,255,.5), 6px 0 rgba(255,0,60,.5)", transform: `scale(${card})`, opacity: card > 0.01 ? 1 : 0 }}>شب ۸ از ۷</div>
    </AbsoluteFill>
  );
};
/* 19 · you open: out into the sun */
const Out: React.FC<{ t: number }> = ({ t }) => {
  const s = W(19, "تموم");
  const open = rk(t, S(19) + 0.2, s);
  const walk = rk(t, s, E(19) + 0.6);
  const big = rk(t, W(19, "هفت") - 0.1, W(19, "هفت") + 0.3, back);
  return (
    <AbsoluteFill>
      <ShopFront t={t} day={1} figs={1} shadows vests open={open} me={0} lag={-1} zoom={0.1 * walk} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Figure x={lerp(540, 560, walk)} y={lerp(1560, 1080, walk)} s={lerp(2.2, 0.75, walk)} fill="#010203" />
      </svg>
      <AbsoluteFill style={{ background: `rgba(255,220,160,${0.25 * walk})` }} />
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", direction: "rtl", fontFamily: BLACK, color: "#fff", transform: `scale(${big})`, opacity: big > 0.01 ? 1 : 0, textShadow: "0 6px 0 #000, 0 0 40px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize: 140, color: GREEN }}>۷ از ۷ ✓</div>
        <div style={{ fontSize: 60 }}>دووم آوردی</div>
      </div>
    </AbsoluteFill>
  );
};

/* ===== 20 · a week later, at home: the mirror lags ===== */
const Home: React.FC<{ t: number }> = ({ t }) => {
  const s = S(20);
  const brush = (u: number) => Math.sin(u * 9) * 30;
  const lagK = rk(t, W(20, "انعکاسم") - 0.3, W(20, "انعکاسم"));
  const LAG = 0.35 * lagK;
  const meY = brush(t), refY = brush(t - LAG);
  const label = rk(t, W(20, "دیرتر") - 0.1, W(20, "دیرتر") + 0.25, back);
  const evil = rk(t, W(20, "دیرتر") + 0.3, E(20) + 0.5);
  return (
    <AbsoluteFill style={{ background: "#d9dde2" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.15 * rk(t, s, E(20) + 0.5)})`, transformOrigin: "540px 760px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect width={1080} height={1920} fill="#e8ebee" />
          {Array.from({ length: 12 }, (_, i) => <rect key={`h${i}`} x={0} y={i * 160} width={1080} height={4} fill="#cfd4da" />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={`v${i}`} x={i * 160} y={0} width={4} height={1920} fill="#cfd4da" />)}
          <rect x={150} y={260} width={780} height={1000} rx={20} fill="#9aa3ad" />
          <rect x={175} y={285} width={730} height={950} rx={10} fill="#b9c6d2" />
          <path d="M200 320 L420 320 L210 760 Z" fill="rgba(255,255,255,.35)" />
          {/* the reflection, brushing — late */}
          <g>
            <Figure x={540} y={960} s={1.9} fill="#56606c" />
            <g transform={`translate(${540 - 120} ${960 - 60 + refY})`}><rect x={-26} y={-40} width={52} height={150} rx={24} fill="#56606c" /><rect x={-6} y={-110} width={12} height={90} fill="#3a8ad8" /></g>
            {evil > 0 && <g opacity={evil}><circle cx={540 - 42} cy={960 - 156} r={9} fill="#fff" /><circle cx={540 + 42} cy={960 - 156} r={9} fill="#fff" /><path d={`M${540 - 60} ${960 - 90} Q540 ${960 - 90 + 50 * evil} ${540 + 60} ${960 - 90}`} stroke="#1a1d22" strokeWidth={9} fill="none" strokeLinecap="round" /></g>}
          </g>
          <rect x={250} y={1280} width={580} height={80} rx={30} fill="#f4f6f8" stroke="#c9ced6" strokeWidth={4} />
          <rect x={0} y={1360} width={1080} height={560} fill="#c9ced6" />
        </svg>
        {/* you, from behind, brushing */}
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Figure x={540} y={1640} s={2.1} fill="#1a1d22" />
          <g transform={`translate(${540 + 150} ${1640 - 40 + meY})`}><rect x={-34} y={-60} width={68} height={200} rx={30} fill="#1a1d22" /></g>
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 120, fontFamily: BLACK, fontSize: 46, color: "#1a1d22", direction: "rtl", background: "rgba(255,255,255,.8)", borderRadius: 16, padding: "4px 22px", opacity: rk(t, s - 0.1, s + 0.3) }}>یه هفته بعد · خونه</div>
      <div style={{ position: "absolute", left: 300, top: 300, fontFamily: BLACK, fontSize: 42, color: "#fff", direction: "rtl", background: C.red, borderRadius: 16, padding: "4px 22px", transform: `scale(${label})`, opacity: label > 0.01 ? 1 : 0 }}>⏱ یه لحظه دیرتر…</div>
    </AbsoluteFill>
  );
};

/* ===== 21 · the end of season 1 ===== */
const Final: React.FC<{ t: number }> = ({ t }) => {
  const s = S(21);
  const q = rk(t, W(21, "کدوممون") - 0.15, W(21, "کدوممون") + 0.2, back);
  const c = rk(t, W(21, "کامنت") - 0.1, W(21, "کامنت") + 0.3, back);
  const end = rk(t, E(21) + 0.1, E(21) + 0.5, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d0a0c, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 220, width: "100%", fontSize: 44, color: C.sodium, opacity: rk(t, s - 0.1, s + 0.3) }}>هفت شب دووم آوردی… ولی</div>
      <div style={{ position: "absolute", top: 300, width: "100%", fontSize: 92, transform: `scale(${q})` }}>کدوممون اومد خونه؟</div>
      <div style={{ position: "absolute", top: 520, width: "100%", display: "flex", justifyContent: "center", gap: 50, transform: `scale(${q})` }}>
        {[["A", "🙋", "خودم", C.red], ["B", "👤", "اون", "#3a6db0"]].map(([l, ic, txt, col], i) => (
          <div key={l} style={{ position: "relative", width: 420, height: 320, borderRadius: 36, background: "rgba(12,14,20,.9)", border: `6px solid ${col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${i ? 2 - pulse : pulse})` }}>
            <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px" }}>{l}</div>
            <div style={{ fontSize: 100 }}>{ic}</div>
            <div style={{ fontSize: 56 }}>{txt}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 930, width: 800, borderRadius: 30, background: "#fff", color: "#111", padding: "20px 30px", fontFamily: FONT_TEXT, fontSize: 44, display: "flex", alignItems: "center", gap: 20, transform: `scale(${c})`, opacity: c > 0.01 ? 1 : 0, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
        <span style={{ fontSize: 56 }}>💬</span><span>کامنت کن: <b style={{ fontFamily: BLACK }}>A</b> یا <b style={{ fontFamily: BLACK }}>B</b></span>
        <span style={{ marginRight: "auto", width: 4, height: 50, background: "#111", opacity: Math.floor(t * 2) % 2 }} />
      </div>
      <div style={{ position: "absolute", top: 1080, width: "100%", fontSize: 38, color: "#cfd6e2", fontFamily: FONT_TEXT, opacity: c }}>انتخاب‌های فصل رو چندتاش درست زدی؟ بنویس</div>
      <div style={{ position: "absolute", top: 1380, width: "100%", opacity: end, transform: `translateY(${(1 - end) * 40}px)` }}>
        <div style={{ fontSize: 110, color: C.sodium, textShadow: `0 0 40px ${C.sodiumGlow}` }}>پایانِ فصل ۱</div>
        <div style={{ fontSize: 42, color: "#cfd6e2", fontFamily: FONT_TEXT, marginTop: 10 }}>فصل ۲ بسازیم؟ فالو کن 🔔</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <Figure x={900} y={1820} s={0.7} fill="rgba(170,205,240,.12)" eyes={Math.floor(t * 1.3) % 3 === 0 ? 0.9 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
const Fork1: React.FC<{ t: number }> = ({ t }) => <Fork t={t} n={1} of={2} q="ساکت می‌مونی؟" a={["🤐", "ساکت\nمی‌مونم"]} b={["🔓", "در رو\nباز می‌کنم"]} wrong="b" t0={T1} pickWrong={S(10) - 0.25} pickRight={S(12) - 0.05} bg={<ShopFront t={t} lights={1} figs={1} mega={1} lag={-1} />} />;
const Fork2: React.FC<{ t: number }> = ({ t }) => <Fork t={t} n={2} of={2} q="در رو باز می‌کنی؟" a={["🔓", "باز\nمی‌کنم"]} b={["🔒", "باز\nنمی‌کنم"]} wrong="b" t0={T2} pickWrong={S(17) - 0.25} pickRight={S(19) - 0.05} bg={<ShopFront t={t} day={1} figs={1} shadows vests lag={0} />} />;

type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: Recap },
  { from: S(1) - 0.2, R: ({ t }) => (t < W(1, "می‌شکنیش") - 0.6 ? <Phone t={t} smile={rk(t, W(1, "لبخند") - 0.2, W(1, "لبخند") + 0.4)} /> : <PhoneQ t={t} />) },
  { from: S(2) + 0.4, R: ({ t }) => <Phone t={t} smile={1} cracks={rk(t, CRACK0 - 0.05, CRACK0 + 0.15, out3)} many={rk(t, S(3) - 0.1, E(3) + 0.2, (u) => u)} /> },
  { from: S(4) - 0.05, R: WhyB },
  { from: S(5) - 0.2, R: Night7 },
  { from: S(6) - 0.2, R: MorningRules },
  { from: S(7) - 0.2, R: Headlights },
  { from: S(9) - 0.15, R: Fork1 },
  { from: S(10) + 0.45, R: FakeIn },
  { from: S(12) - 0.05, R: Fork1 },
  { from: W(12, "آفتاب") - 0.15, R: ({ t }) => <ShopFront t={t} lights={1} figs={1} vanish={rk(t, W(12, "ماشین‌ها") - 0.1, E(12) + 0.3, (u) => u)} lag={-1} /> },
  { from: S(13) - 0.2, R: Dawn },
  { from: S(14) - 0.2, R: Rescue },
  { from: W(16, "در") - 0.15, R: Fork2 },
  { from: S(17) + 0.45, R: Sunset },
  { from: S(19) - 0.05, R: ({ t }) => (t < W(19, "تموم") - 0.15 ? <Fork2 t={t} /> : <Out t={t} />) },
  { from: S(20) - 0.2, R: Home },
  { from: S(21) - 0.2, R: Final },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const quiet = (t: number) => t < S(5) - 0.2 || (t >= S(9) - 0.15 && t < W(12, "آفتاب") - 0.15) || (t >= W(16, "در") - 0.15 && t < W(19, "تموم") - 0.15) || t >= S(20) - 0.2 || (t >= S(5) - 0.2 && t < W(5, "گوشی") - 0.15) || (t >= S(6) - 0.2 && t < S(7) - 0.2);
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if (quiet(t)) return null;
  const clock = t < S(7) ? `۵:${fa(String(10 + Math.floor(rk(t, S(5), S(7), (k) => k) * 18)).padStart(2, "0"))}` : t < S(13) ? `۵:${fa(30 + Math.floor(rk(t, S(7), S(13), (k) => k) * 25))}` : `۶:${fa(20 + Math.floor(rk(t, S(13), S(20), (k) => k) * 6))}`;
  const lives = t >= S(19) ? 2 : t >= S(12) ? 1 : 0;
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۷ از ۷ · آخر</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{clock}<span style={{ fontSize: 34, color: C.dim }}> صبح</span></div>
      <div style={{ fontSize: 28, color: GREEN }}>{"✓".repeat(lives)}<span style={{ color: C.dim }}>{"○".repeat(2 - lives)}</span> انتخاب‌ها</div>
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(21) - 0.2) return null;
  if ([9, 16].includes(cur.si)) { if (cur.si === 9 || t >= W(16, "در") - 0.15) return null; } // fork questions are on the card
  if (cur.si === 1 && t >= W(1, "می‌شکنیش") - 0.6) return null;
  if ((t >= DEAD0 && t < S(4)) || (t >= DEAD1 && t < S(12)) || (t >= DEAD2 && t < S(19))) return null;
  if (cur.si === 6 && t >= W(6, "تا") - 0.1) return null; // her rules are on the cards
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const v = cur.v;
  const base = v === "twin" ? C.ice : v === "lily" ? "#f6c6d8" : v === "george" ? "#ffd27a" : v === "bill" ? "#c8f0d2" : "#fff";
  const quote = v !== "brian";
  const top = [2, 10, 17].includes(cur.si) ? 1500 : 1330;
  return (
    <div style={{ position: "absolute", left: 60, top, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: v === "twin" ? 80 : 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? (quote ? "#fff" : C.sodium) : base, transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})`, fontStyle: quote ? "italic" : undefined }}>{w.w}</span>;
      })}
    </div>
  );
};

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = SCENES.findLastIndex((s) => s.from <= t);
  const sc = SCENES[Math.max(0, i)];
  const since = t - sc.from;
  const cut = i > 0 && since < 0.12 ? 1 - since / 0.12 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.012 * Math.sin(t * 0.6)})` }}>
        <sc.R t={t} />
      </AbsoluteFill>
      <Grain f={f} />
      {t < S(1) - 0.2 && <RecapLabel t={t} />}
      <Hud t={t} />
      <Captions t={t} />
      <Scare t={t} at={SCARE1} len={0.3} />
      <Dead t={t} at={DEAD0} until={REW0} why="هزار تیکه شیشه… هزار تا انعکاس" />
      <Dead t={t} at={DEAD1} until={REW1} why="آفتاب نزده بود… و اسمت رو می‌دونستن" />
      <Dead t={t} at={DEAD2} until={REW2} why="سایه داشتن… آدم بودن" />
      <Rew t={t} at={REW0} />
      <Rew t={t} at={REW1} />
      <Rew t={t} at={REW2} />
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V24_LOOK = [0.1, 3.0, 7.0, 9.5, 12.5, 15.5, 17.2, 18.5, 20.0, 22.0, 24.5, 27.5, 30.5, 33.5, 36.5, 40.0, 45.0, 49.5, 53.0, 56.0, 59.5, 62.0, 64.5, 66.0, 67.5, 69.3, 72.5, 77.0, 81.0, 85.0, 87.6, 90.0, 95.0, 98.5, 100.5, 103.0, 105.0, 107.0, 110.0, 112.5, 116.0, 120.0, 123.5, 126.5, 129.0];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V24_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V24: React.FC = () => (
  <>
    <Composition id="V24" component={Video} durationInFrames={V24_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v24/mix.wav" }} />
    <Composition id="V24-Silent" component={Video} durationInFrames={V24_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V24-Look" component={Look} durationInFrames={V24_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
