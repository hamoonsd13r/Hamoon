// Video 22 — «پمپ‌بنزین · شب ۶ از ۷ · بازی + قصه» · vertical 1080×1920 · same vector world as V09…V20 (pieces from ../v09 and ../v20).
// Story first, game inside it: recap for newcomers → last night's fork (A and B both die, C = rule 3) → the unknown caller (answer ✓ / reject ✗)
// → her story (30 years ago, her husband; the name in the logbook) → the mirror (break ✗ / cover ✓) → the phone screen smiles → comments.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Exterior, Figure, NASTA } from "../v09/Video";
import { Beam, Dead, GlassWall, Rew } from "../v20/Video";
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
export const V22_END = E(24) + 2.6;
export const V22_FRAMES = fr(V22_END);

// ---- the game clock (all from the voice) ----
export const TIMER = 3.3;
export const REW = 0.8;
/** fork 0 = last night: both answers die, then C */
export const DEAD0A = E(5) + 0.2;
export const DEAD0B = E(7) + 0.2;
export const REW0 = S(8) - REW - 0.05;
/** fork 1: the unknown caller — B (reject) dies */
export const T1 = E(10) + 0.15;
export const SCARE1 = E(12) + 0.02;
export const DEAD1 = E(12) + 0.32;
export const REW1 = S(13) - REW - 0.05;
/** fork 2: the mirror — A (break) dies */
export const T2 = E(19) + 0.15;
export const SHATTER = W(20, "شکستی") + 0.25;
export const DEAD2 = E(21) + 0.2;
export const REW2 = S(22) - REW - 0.05;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const GREEN = "#1fae5c";
const PALE = "#b8d6f4";
const SEPIA = "sepia(.85) saturate(.7) contrast(1.05) brightness(.9)";

/** The pale grinning face (the thing), centred at (0,0) — reused for every scare. */
export const Face: React.FC<{ s?: number; tint?: string; grin?: number }> = ({ s = 1, tint = "#b9cbe0", grin = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-260 -280 Q-310 30 -230 260 Q-120 430 0 440 Q120 430 230 260 Q310 30 260 -280 Q130 -420 0 -420 Q-130 -420 -260 -280 Z" fill={tint} />
    <path d="M-260 -280 Q0 -480 260 -280 L280 -220 L-280 -220 Z" fill="#0d1018" />
    <ellipse cx={-110} cy={-50} rx={80} ry={110} fill="#000" />
    <ellipse cx={115} cy={-40} rx={70} ry={130} fill="#000" />
    <circle cx={-104} cy={-40} r={8} fill="#fff" /><circle cx={120} cy={-26} r={7} fill="#fff" />
    <path d={`M-210 170 Q0 ${170 + 130 * grin} 210 160 Q120 ${170 + 190 * grin} 0 ${180 + 190 * grin} Q-120 ${170 + 190 * grin} -210 170 Z`} fill="#050303" />
    {Array.from({ length: 13 }, (_, i) => { const x = -180 + i * 28; const y = 196 + Math.sin(((i + 0.5) / 13) * Math.PI) * 60 * grin; return <path key={i} d={`M${x} ${y} l12 0 l-6 ${(26 + (i % 3) * 6) * grin} Z`} fill="#dfe6ee" />; })}
  </g>
);
/** a 0.35 s jump-scare layer: flash, the face lunging, red */
export const Scare: React.FC<{ t: number; at: number; len?: number }> = ({ t, at, len = 0.5 }) => {
  const k = t - at;
  if (k < 0 || k >= len) return null;
  const sz = lerp(0.6, 1.3, out3(clamp(k / 0.12)));
  const shake = (hn(Math.floor(k * 60)) - 0.5) * 60;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}><g transform="translate(540 940)"><Face s={sz} /></g></svg>
      {k < 0.06 && <AbsoluteFill style={{ background: "rgba(255,255,255,.85)" }} />}
      {k >= 0.06 && k < 0.18 && <AbsoluteFill style={{ background: "rgba(200,0,20,.7)", mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );
};

/* ===== 0–2 · recap ===== */
const RecapLabel: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 60, top: 80, display: "flex", alignItems: "center", gap: 16, direction: "rtl", fontFamily: BLACK, fontSize: 40, color: "#fff", background: "rgba(0,0,0,.6)", border: "3px solid rgba(255,255,255,.25)", borderRadius: 16, padding: "6px 22px" }}>
    <span style={{ fontFamily: FONT_NUM, opacity: 0.5 + 0.5 * (Math.floor(t * 2) % 2) }}>◀◀</span>قسمت‌های قبل
  </div>
);
const Recap0: React.FC<{ t: number }> = ({ t }) => {
  const thing = W(0, "یه", 1) - 0.15;
  if (t < thing) {
    const n5 = rk(t, W(0, "پنج") - 0.1, W(0, "پنج") + 0.3, back);
    return (
      <AbsoluteFill>
        <Exterior t={t} push={0.08 * rk(t, 0, thing)} litShop={0.3} />
        <div style={{ position: "absolute", left: 0, top: 420, width: "100%", textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 120, color: C.sodium, textShadow: `0 0 40px ${C.sodiumGlow}, 0 6px 0 #000`, transform: `scale(${n5})` }}>۵ شب</div>
        <div style={{ position: "absolute", left: 0, top: 580, width: "100%", textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 46, color: "#fff", opacity: rk(t, W(0, "کویرم") - 0.2, W(0, "کویرم") + 0.2), textShadow: "0 3px 0 #000" }}>شیفت شب · وسط کویر · تنها</div>
      </AbsoluteFill>
    );
  }
  return <GlassWall t={t} eyes={rk(t, W(0, "صورت") - 0.2, W(0, "صورت") + 0.2)} mouth={0} zoom={0.1 + 0.1 * rk(t, thing, E(0))} />;
};
const Rules: React.FC<{ t: number }> = ({ t }) => {
  const rows: [string, number][] = [["۱. چراغ نه.", W(1, "چراغ")], ["۲. در قفل.", W(1, "در")], ["۳. اگه کسی صدات زد…", W(1, "اگه")], ["جواب نده.", W(1, "جواب")]];
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <div style={{ position: "absolute", left: 120, top: 320, width: 840, height: 960, background: "#e6d8b6", transform: `rotate(-2deg) scale(${1 + 0.04 * rk(t, S(1), E(1))})`, boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "70px 60px", direction: "rtl" }}>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 34, color: "#7a6040", borderBottom: "3px solid #b9a27a", paddingBottom: 10 }}>چسبیده زیر پیشخون</div>
        {rows.map(([txt, at], i) => {
          const a = rk(t, at - 0.15, at + 0.4, (u) => u);
          return <div key={i} style={{ fontFamily: NASTA, fontSize: i === 3 ? 96 : 76, lineHeight: 1.9, color: i >= 2 ? "#8a0e14" : "#2a1d12", clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, marginRight: i === 3 ? 60 : 0 }}>{txt}</div>;
        })}
        <svg width={760} height={200} style={{ position: "absolute", left: 40, top: 700, opacity: rk(t, W(1, "نده") - 0.1, W(1, "نده") + 0.3) }}>
          <path d="M20 120 Q380 170 740 110" fill="none" stroke="#8a0e14" strokeWidth={8} strokeLinecap="round" />
        </svg>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle 600px at 540px 800px, rgba(0,0,0,0), rgba(0,0,0,.85))" }} />
    </AbsoluteFill>
  );
};

/** The toilet door from inside. bolt 0 open … 1 shut; feet: shadows under the door; open: door swings in. */
const Door: React.FC<{ t: number; bolt?: number; feet?: number; open?: number; knocks?: number[]; push?: number; children?: React.ReactNode }> = ({ t, bolt = 1, feet = 1, open = 0, knocks = [], push = 0, children }) => {
  const kk = knocks.map((k) => t - k).filter((d) => d >= 0 && d < 0.5);
  const shake = kk.length ? Math.sin(kk[0] * 70) * 10 * (1 - kk[0] / 0.5) : 0;
  return (
    <AbsoluteFill style={{ background: "#06080b" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + push})`, transformOrigin: "540px 1000px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect width={1080} height={1920} fill="#141a20" />
          {Array.from({ length: 12 }, (_, i) => <rect key={`h${i}`} x={0} y={i * 160} width={1080} height={4} fill="#0c1014" />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={`v${i}`} x={i * 160} y={0} width={4} height={1920} fill="#0c1014" />)}
          <rect x={250} y={340} width={580} height={1260} fill="#000" />
          <g transform={`translate(${shake} 0)`}>
            <g transform={`translate(250 340) scale(${1 - open * 0.75} 1)`}>
              <rect x={0} y={0} width={580} height={1260} fill="#2e3238" stroke="#1a1d21" strokeWidth={14} />
              <rect x={50} y={60} width={480} height={500} fill="none" stroke="#25282d" strokeWidth={10} />
              <rect x={50} y={640} width={480} height={540} fill="none" stroke="#25282d" strokeWidth={10} />
              <circle cx={510} cy={620} r={24} fill="#8a8e94" />
              <rect x={470} y={520} width={90} height={30} rx={6} fill="#6e7379" />
              <rect x={lerp(490, 550, bolt)} y={526} width={60} height={18} rx={5} fill="#c9a43a" />
            </g>
          </g>
          {open < 0.02 && <rect x={250} y={1600} width={580} height={14} fill="rgba(255,200,140,.45)" />}
          {open < 0.02 && <g opacity={feet}><rect x={410} y={1600} width={80} height={14} fill="#000" /><rect x={590} y={1600} width={80} height={14} fill="#000" /></g>}
          <rect x={0} y={1614} width={1080} height={306} fill="#0d1014" />
        </svg>
        {children}
      </AbsoluteFill>
      <Beam x={540} y={980} r={560} dim={0.8} />
    </AbsoluteFill>
  );
};
const LastQ: React.FC<{ t: number }> = ({ t }) => {
  const q = rk(t, W(2, "یکی") - 0.15, W(2, "یکی") + 0.25, back);
  return (
    <Door t={t} knocks={[W(2, "پرسید") - 0.1]} push={0.08 * rk(t, S(2), E(2))}>
      <div style={{ position: "absolute", left: 140, top: 560, width: 800, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 64, color: PALE, background: "rgba(0,0,0,.75)", border: `3px solid ${PALE}`, borderRadius: 30, padding: "20px 30px", transform: `scale(${q})`, opacity: q > 0.01 ? 1 : 0 }}>«یکی‌مون باید بمونه…<br />تو یا من؟»</div>
    </Door>
  );
};

/* ===== 3 + 8 · last night's fork: A, B … and the hidden C ===== */
const card = (l: string, ic: string, txt: string, col: string, k: number, dead: number, ok = 0) => (
  <div key={l} style={{ position: "relative", width: 300, height: 330, borderRadius: 32, background: ok > 0.5 ? GREEN : dead > 0.5 ? "rgba(70,0,6,.9)" : "rgba(12,14,20,.9)", border: `6px solid ${ok > 0.5 ? "#fff" : col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${k * (ok > 0.5 ? 1.08 : 1)})`, opacity: k > 0.01 ? 1 : 0, boxShadow: ok > 0.5 ? `0 0 80px ${GREEN}` : "0 20px 50px rgba(0,0,0,.6)" }}>
    <div style={{ position: "absolute", top: -40, right: 24, width: 76, height: 76, borderRadius: 38, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 48, lineHeight: "80px", color: "#fff" }}>{l}</div>
    <div style={{ fontSize: 90 }}>{ic}</div>
    <div style={{ fontSize: 42, lineHeight: 1.2, whiteSpace: "pre-line" }}>{txt}</div>
    {dead > 0 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 170, transform: `scale(${lerp(1.8, 1, out3(dead))}) rotate(-10deg)`, opacity: dead }}>💀</div>}
    {ok > 0 && <div style={{ position: "absolute", bottom: -44, fontSize: 42, background: "#000", border: `4px solid ${GREEN}`, borderRadius: 20, padding: "2px 24px", color: GREEN, transform: `scale(${ok})` }}>✓ زنده</div>}
  </div>
);
const Verdict: React.FC<{ t: number }> = ({ t }) => {
  const late = t >= S(8) - 0.1; // after the rewind: C appears
  const aK = rk(t, W(3, "A") - 0.15, W(3, "A") + 0.15, back), bK = rk(t, W(3, "B") - 0.15, W(3, "B") + 0.15, back);
  const dead = rk(t, W(3, "مرگ") - 0.1, W(3, "مرگ") + 0.3);
  const cK = late ? rk(t, W(8, "جواب", 0) - 0.1, W(8, "جواب", 0) + 0.3, back) : 0;
  const cOk = late ? rk(t, W(8, "ندادم") - 0.1, W(8, "ندادم") + 0.25, back) : 0;
  const comments = ["A", "B", "A", "A", "B", "A", "B", "B", "A"];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d0a0c, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 240, width: "100%", fontSize: 40, color: C.sodium }}>جوابِ انتخابِ دیشب</div>
      <div style={{ position: "absolute", top: 300, width: "100%", fontSize: 80 }}>«تو بمونی… یا من؟»</div>
      <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", gap: 36 }}>
        {card("A", "🙋", "من\nمی‌مونم", C.red, aK, dead)}
        {card("B", "👤", "اون\nبمونه", "#3a6db0", bK, dead)}
        {late && card("C", "🤐", "جواب\nنمی‌دم", GREEN, cK, 0, cOk)}
      </div>
      {/* your comments flying up */}
      {!late && comments.map((c, i) => {
        const at = W(3, "شما") + i * 0.28;
        const k = (t - at) / 2.2;
        if (k < 0 || k > 1) return null;
        return <div key={i} style={{ position: "absolute", left: 120 + hn(i) * 700, top: lerp(1600, 1000, k), opacity: Math.sin(k * Math.PI), display: "flex", alignItems: "center", gap: 12, background: "#fff", color: "#111", borderRadius: 26, padding: "8px 22px", fontSize: 40 }}><span style={{ fontSize: 30, color: "#666", fontFamily: FONT_TEXT }}>کامنت</span>{c}</div>;
      })}
      {late && <div style={{ position: "absolute", top: 1010, width: "100%", fontFamily: FONT_TEXT, fontSize: 44, color: "#f3e3c0", opacity: rk(t, W(8, "قانون") - 0.1, W(8, "قانون") + 0.3) }}>قانون ۳: <span style={{ fontFamily: NASTA, color: "#ff6a6a", fontSize: 54 }}>اگه کسی صدات زد… جواب نده</span></div>}
    </AbsoluteFill>
  );
};

/* 4–5 · «I stay» → it walks out with your face; you're left in the glass */
const WalksOut: React.FC<{ t: number }> = ({ t }) => {
  const go = rk(t, W(5, "صورت") - 0.3, E(5) + 0.4);
  const bang = Math.max(0, Math.sin(t * 9)) * rk(t, W(5, "میرم"), E(5));
  return (
    <AbsoluteFill style={{ background: "#04060b" }}>
      <GlassWall t={t} me={0} eyes={0} zoom={0.12} />
      {/* you, trapped in the glass: pale, palms on the pane */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform={`translate(0 ${-bang * 6})`} opacity={0.5}>
          <rect x={300} y={720} width={90} height={110} rx={30} fill={PALE} /><rect x={690} y={720} width={90} height={110} rx={30} fill={PALE} />
        </g>
      </svg>
      {/* it, with your shape, walking out of the shop */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Figure x={lerp(540, 980, go)} y={lerp(1560, 1420, go)} s={lerp(2.2, 1.1, go)} fill="#010203" turn={0.8} eyes={rk(t, W(5, "صورت"), W(5, "صورت") + 0.2)} op={1 - rk(t, E(5), E(5) + 0.3)} />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 300, fontFamily: BLACK, fontSize: 40, color: "#fff", direction: "rtl", background: C.red, borderRadius: 14, padding: "4px 20px", opacity: rk(t, S(4), S(4) + 0.2) }}>A · اگه می‌گفتم «من می‌مونم»</div>
    </AbsoluteFill>
  );
};
/* 6–7 · «he stays» → «then open the door» → the bolt slides itself, the door opens */
const OpensDoor: React.FC<{ t: number }> = ({ t }) => {
  const bolt = 1 - rk(t, W(7, "باز") - 0.1, W(7, "باز") + 0.3);
  const open = rk(t, W(7, "باز") + 0.25, E(7) + 0.35, out3);
  const eyes = rk(t, E(7) - 0.1, E(7) + 0.2);
  return (
    <AbsoluteFill>
      <Door t={t} bolt={bolt} open={open} knocks={[S(7) - 0.1]}>
        <svg width={1080} height={1920} style={{ position: "absolute", opacity: open }}>
          <g transform="translate(540 820) scale(.55)"><Face tint="#9fb3c9" grin={eyes} /></g>
        </svg>
      </Door>
      <div style={{ position: "absolute", left: 60, top: 300, fontFamily: BLACK, fontSize: 40, color: "#fff", direction: "rtl", background: "#3a6db0", borderRadius: 14, padding: "4px 20px" }}>B · اگه می‌گفتم «اون بمونه»</div>
    </AbsoluteFill>
  );
};
/* 8 (2nd half) · silence: an hour of your name behind the door, then nothing */
const NameCalls: React.FC<{ t: number }> = ({ t }) => {
  const s = W(8, "یه") - 0.15;
  const quiet = rk(t, W(8, "ساکت") - 0.2, W(8, "ساکت") + 0.3);
  const n = 7;
  return (
    <Door t={t} feet={1 - quiet}>
      {Array.from({ length: n }, (_, i) => {
        const at = s + 0.25 + i * 0.45;
        const k = (t - at) / 1.6;
        if (k < 0 || k > 1 || t > W(8, "ساکت")) return null;
        return <div key={i} style={{ position: "absolute", left: 160 + hn(i, 3) * 560, top: 1500 - k * 900, opacity: Math.sin(k * Math.PI) * 0.85, fontFamily: NASTA, fontSize: 60 + hn(i, 5) * 30, color: PALE, direction: "rtl" }}>…{["اسمت", "صدات می‌زنم", "جواب بده", "منم", "اسمت", "در رو باز کن", "اسمت"][i]}</div>;
      })}
      <div style={{ position: "absolute", left: 60, top: 300, fontFamily: FONT_NUM, fontSize: 64, color: "#fff", direction: "ltr", opacity: rk(t, s, s + 0.3) }}>{t < W(8, "ساکت") ? `۳:${fa(10 + Math.floor(rk(t, s, W(8, "ساکت"), (u) => u) * 48))}` : "۳:۵۹"}</div>
    </Door>
  );
};

/* ===== 9–13 · the call ===== */
const Call: React.FC<{ t: number; mode: "ring" | "declined" | "live" }> = ({ t, mode }) => {
  const ring = mode === "ring";
  const wob = ring ? Math.sin(t * 50) * 6 * (Math.floor(t * 1.5) % 2) : 0;
  const since = mode === "live" ? Math.max(0, t - W(13, "بالاخره")) : 0;
  const twinMsg = mode === "declined" ? rk(t, S(12) - 0.1, S(12) + 0.15, back) : 0;
  return (
    <AbsoluteFill style={{ background: "#04060b" }}>
      <div style={{ position: "absolute", left: 190, top: 260, width: 700, height: 1100, borderRadius: 90, background: "#0d0f14", boxShadow: `0 0 0 6px #2a2e36, 0 0 160px ${ring ? "rgba(120,200,140,.25)" : "rgba(120,160,255,.15)"}`, overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT, transform: `translateX(${wob}px) rotate(${wob * 0.2}deg)` }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 74, background: mode === "declined" ? "#160a0c" : "#0b111c", padding: "90px 34px", textAlign: "center", color: "#fff" }}>
          {mode !== "declined" ? (
            <>
              <div style={{ width: 200, height: 200, borderRadius: 100, background: "#22324a", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110, boxShadow: ring ? `0 0 0 ${10 + 20 * ((t * 1.5) % 1)}px rgba(120,200,140,${0.4 * (1 - ((t * 1.5) % 1))})` : undefined }}>❔</div>
              <div style={{ fontFamily: BLACK, fontSize: 64, marginTop: 40 }}>ناشناس</div>
              <div style={{ fontSize: 34, color: "#9aa6b8", marginTop: 6 }}>{ring ? "تماس ورودی…" : <span style={{ fontFamily: FONT_NUM, direction: "ltr", display: "inline-block" }}>{`۰۰:${fa(String(Math.floor(since)).padStart(2, "0"))}`}</span>}</div>
              <div style={{ fontSize: 28, color: "#c9a43a", marginTop: 14 }}>همون شماره‌ای که دیشب نجاتت داد</div>
              {ring ? (
                <div style={{ position: "absolute", left: 60, right: 60, bottom: 110, display: "flex", justifyContent: "space-between" }}>
                  <div style={{ width: 150, height: 150, borderRadius: 75, background: GREEN, fontSize: 70, lineHeight: "150px", transform: `scale(${1 + 0.06 * Math.sin(t * 8)})` }}>📞</div>
                  <div style={{ width: 150, height: 150, borderRadius: 75, background: C.red, fontSize: 70, lineHeight: "150px" }}>✖</div>
                </div>
              ) : (
                <svg width={560} height={200} style={{ position: "absolute", left: 70, bottom: 160 }}>
                  {Array.from({ length: 28 }, (_, i) => { const h = 20 + 140 * Math.abs(Math.sin(t * 9 + i * 0.7)) * hn(i + Math.floor(t * 12)); return <rect key={i} x={i * 20} y={100 - h / 2} width={10} height={h} rx={5} fill="#f2a7c3" opacity={0.85} />; })}
                </svg>
              )}
            </>
          ) : (
            <>
              <div style={{ fontFamily: BLACK, fontSize: 52, color: C.red, marginTop: 30 }}>تماس رد شد</div>
              <div style={{ marginTop: 120, textAlign: "right", transform: `scale(${twinMsg})`, transformOrigin: "100% 0", opacity: twinMsg > 0.01 ? 1 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}><div style={{ width: 70, height: 70, borderRadius: 35, background: "#5a2224", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>👤</div><div>خودم<div style={{ fontSize: 22, color: "#9aa6b8" }}>شماره‌ی خودت</div></div></div>
                <div style={{ marginTop: 20, background: "#3a1a1c", borderRadius: "34px 34px 8px 34px", padding: "22px 28px", fontSize: 42, lineHeight: 1.5 }}>ممنون. حالا فقط من باهات حرف می‌زنم.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
/** small «on call» pill while she tells the story */
const CallPill: React.FC<{ t: number }> = ({ t }) => {
  const since = Math.max(0, t - W(13, "بالاخره"));
  return (
    <div style={{ position: "absolute", left: 60, top: 90, display: "flex", alignItems: "center", gap: 14, direction: "rtl", background: "rgba(20,30,24,.9)", border: `3px solid ${GREEN}`, borderRadius: 40, padding: "8px 24px", fontFamily: FONT_TEXT, fontSize: 32, color: "#fff" }}>
      <span style={{ width: 16, height: 16, borderRadius: 8, background: GREEN, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />ناشناس
      <span style={{ fontFamily: FONT_NUM, direction: "ltr" }}>{`${fa(Math.floor(since / 60))}:${fa(String(Math.floor(since % 60)).padStart(2, "0"))}`}</span>
    </div>
  );
};

/** generic fork card: wrong side dies first, then the rewind and the right one. */
export const Fork: React.FC<{ t: number; n: number; of?: number; q: string; a: [string, string]; b: [string, string]; wrong: "a" | "b"; t0: number; pickWrong: number; pickRight: number; bg: React.ReactNode }> = ({ t, n, of = 3, q, a, b, wrong, t0, pickWrong, pickRight, bg }) => {
  const qIn = rk(t, t0 - 2.3, t0 - 1.9, back);
  const left = clamp(TIMER - (t - t0), 0, TIMER);
  const running = t >= t0 && t < t0 + TIMER;
  const up = t >= t0 + TIMER && t < pickWrong;
  const isW = t >= pickWrong && t < pickRight, isR = t >= pickRight;
  const sec = Math.ceil(left - 0.3);
  const tick = running ? 1 + 0.18 * (1 - ((t - t0) % 1)) ** 3 : 1;
  const one = (side: "a" | "b", [ic, txt]: [string, string], i: number) => {
    const bad = side === wrong;
    const on = bad ? isW : isR;
    const off = bad ? isR : isW;
    const col = side === "a" ? C.red : "#3a6db0";
    const hot = bad ? C.red : GREEN;
    const inK = rk(t, t0 - 1.7 + i * 0.1, t0 - 1.35 + i * 0.1, back);
    const pulse = running ? 1 + 0.03 * Math.sin(t * 9 + i * 3) : 1;
    const at = bad ? pickWrong : pickRight;
    return (
      <div style={{ width: 440, height: 380, borderRadius: 36, background: on ? hot : "rgba(12,14,20,.88)", border: `6px solid ${on ? "#fff" : col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transform: `scale(${inK * pulse * (on ? 1.08 : off ? 0.9 : 1)})`, opacity: off ? 0.35 : 1, boxShadow: on ? `0 0 80px ${hot}` : "0 20px 50px rgba(0,0,0,.6)", position: "relative" }}>
        <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px", color: "#fff" }}>{side === "a" ? "A" : "B"}</div>
        <div style={{ fontSize: 110 }}>{ic}</div>
        <div style={{ fontSize: 50, lineHeight: 1.25, color: "#fff", padding: "0 20px", whiteSpace: "pre-line" }}>{txt}</div>
        {on && <div style={{ position: "absolute", bottom: -46, fontSize: 46, background: "#000", border: `4px solid ${hot}`, borderRadius: 20, padding: "2px 26px", color: hot, transform: `scale(${rk(t, at, at + 0.25, back)})` }}>{bad ? "💀 مرگ" : "✓ زنده"}</div>}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${6 * qIn}px) brightness(${1 - 0.55 * qIn})` }}>{bg}</AbsoluteFill>
      <AbsoluteFill style={{ direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 260, width: "100%", fontSize: 40, color: C.sodium, opacity: qIn }}>انتخاب {fa(n)} از {fa(of)}</div>
        <div style={{ position: "absolute", top: 320, width: "100%", fontSize: 92, lineHeight: 1.25, transform: `scale(${qIn})`, textShadow: "0 6px 0 #000" }}>{q}</div>
        <div style={{ position: "absolute", top: 610, width: "100%", display: "flex", justifyContent: "center", gap: 50 }}>
          {one("a", a, 0)}
          {one("b", b, 1)}
        </div>
        {(running || up) && (
          <div style={{ position: "absolute", left: 390, top: 1110, width: 300, height: 300 }}>
            <svg width={300} height={300} style={{ position: "absolute" }}>
              <circle cx={150} cy={150} r={120} fill="rgba(0,0,0,.7)" stroke="rgba(255,255,255,.15)" strokeWidth={18} />
              <circle cx={150} cy={150} r={120} fill="none" stroke={left < 1.3 ? C.red : C.sodium} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${(left / TIMER) * 754} 754`} transform="rotate(-90 150 150)" />
            </svg>
            <div style={{ position: "absolute", width: 300, top: up ? 92 : 40, fontFamily: up ? BLACK : FONT_NUM, fontSize: up ? 64 : 170, color: up ? C.red : "#fff", transform: `scale(${tick})` }}>{up ? "تموم!" : fa(Math.max(1, sec))}</div>
          </div>
        )}
        {running && <div style={{ position: "absolute", top: 1440, width: "100%", fontSize: 46, color: "#cfd6e2", fontFamily: FONT_TEXT }}>⏸ نگه دار و انتخاب کن</div>}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ===== 14–17 · her story (sepia flashbacks) ===== */
const Flash: React.FC<{ t: number; year?: string; children: React.ReactNode }> = ({ t, year = "۱۳۷۵", children }) => (
  <AbsoluteFill style={{ background: "#0b0805" }}>
    <AbsoluteFill style={{ filter: SEPIA }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(20,10,0,.8) 100%)" }} />
    <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 3px, transparent 3px 6px)" }} />
    {Array.from({ length: 3 }, (_, i) => <div key={i} style={{ position: "absolute", left: (hn(i, Math.floor(t * 8)) * 1080) | 0, top: 0, width: 2, height: 1920, background: "rgba(255,240,200,.25)" }} />)}
    <div style={{ position: "absolute", right: 60, top: 1500, fontFamily: FONT_NUM, fontSize: 70, color: "#f3e3c0", opacity: 0.85 }}>{year}</div>
  </AbsoluteFill>
);
const Husband: React.FC<{ t: number }> = ({ t }) => {
  const nights = W(14, "هفت");
  const last = W(14, "شب", 2);
  const tally = Math.floor(clamp((t - nights) / 0.12, 0, 7));
  if (t < last - 0.1) {
    return (
      <Flash t={t}>
        <Exterior t={t} push={0.18 + 0.1 * rk(t, S(14), last)} litShop={1} />
        <div style={{ position: "absolute", left: 0, top: 380, width: "100%", textAlign: "center", fontFamily: NASTA, fontSize: 90, color: "#f3e3c0", direction: "rtl", opacity: rk(t, W(14, "سی") - 0.1, W(14, "سی") + 0.3) }}>سی سال پیش</div>
        {tally > 0 && <div style={{ position: "absolute", left: 0, top: 560, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 110, color: "#f3e3c0", letterSpacing: 18 }}>{"|".repeat(tally)}</div>}
      </Flash>
    );
  }
  // the last night: he answers at the glass
  const talk = t > W(14, "جواب") ? 0.5 + 0.5 * Math.abs(Math.sin(t * 20)) : 0;
  return (
    <Flash t={t}>
      <GlassWall t={t} eyes={1} zoom={0.15} mouth={talk} />
      <div style={{ position: "absolute", left: 610, top: 1060, fontFamily: BLACK, fontSize: 56, color: "#111", background: "#f3e3c0", borderRadius: "30px 30px 30px 6px", padding: "10px 28px", direction: "rtl", transform: `scale(${rk(t, W(14, "جواب") - 0.1, W(14, "جواب") + 0.2, back)})` }}>«بله؟»</div>
    </Flash>
  );
};
const CameHome: React.FC<{ t: number }> = ({ t }) => {
  const notHim = rk(t, W(15, "ولی") - 0.1, W(15, "ولی") + 0.3);
  const step = rk(t, S(15), W(15, "خونه") + 0.4);
  return (
    <Flash t={t}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#2a2620" />
        <rect y={0} width={1080} height={1200} fill="#bfae8e" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={160 + i * 180} width={1080} height={6} fill="#a8977a" />)}
        <rect x={300} y={360} width={480} height={1100} fill="#f6e9c8" />
        <rect x={290} y={350} width={500} height={20} fill="#5a4630" /><rect x={290} y={350} width={20} height={1120} fill="#5a4630" /><rect x={770} y={350} width={20} height={1120} fill="#5a4630" />
        <g transform={`translate(540 ${lerp(1000, 1060, step)}) scale(${lerp(1.0, 1.35, step)})`}>
          <Figure x={0} y={0} s={1.6} fill="#2a2018" />
        </g>
        {/* the smile only she could see */}
        <g opacity={notHim} transform={`translate(540 ${lerp(1000, 1060, step) - 120 * lerp(1.0, 1.35, step) * 1.6 / 1.6})`}>
          <circle cx={-30} cy={-14} r={9} fill="#f6f1df" /><circle cx={30} cy={-14} r={9} fill="#f6f1df" />
          <path d="M-46 30 Q0 70 46 30" stroke="#f6f1df" strokeWidth={6} fill="none" />
        </g>
        <rect y={1460} width={1080} height={460} fill="#3a3024" />
      </svg>
      <div style={{ position: "absolute", left: 0, top: 200, width: "100%", textAlign: "center", fontFamily: NASTA, fontSize: 76, color: "#3a2a18", direction: "rtl", opacity: rk(t, S(15) - 0.1, S(15) + 0.3) }}>صبحِ روزِ هشتم</div>
    </Flash>
  );
};
const NextName: React.FC<{ t: number }> = ({ t }) => {
  const rows: [string, string][] = [["۱۳۷۵/۰۸/۰۷", "شوهرم"], ["…", "…"], ["۱۴۰۵/۰۸/۰۷", "تو"]];
  const write = rk(t, W(16, "اسم", 1) - 0.1, W(16, "نوشته") + 0.4, (u) => u);
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <div style={{ position: "absolute", left: 90, top: 320, width: 900, height: 900, background: "#e6d8b6", transform: `rotate(-1.5deg) scale(${1 + 0.05 * rk(t, S(16), E(16))})`, boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "60px 50px", direction: "rtl", fontFamily: FONT_TEXT }}>
        <div style={{ fontFamily: BLACK, fontSize: 46, color: "#3a2a18", borderBottom: "4px double #8a6a40", paddingBottom: 14 }}>دفتر تحویل شیفت · نفرِ بعدی</div>
        {rows.map(([d, n], i) => {
          const last = i === 2;
          const show = i === 0 ? rk(t, S(16) - 0.1, S(16) + 0.4) : i === 1 ? rk(t, W(16, "از") - 0.1, W(16, "از") + 0.3) : 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", height: 170, borderBottom: "2px solid #c9b48c", opacity: show }}>
              <span style={{ width: 300, fontFamily: FONT_NUM, fontSize: 42, color: "#3a2a18" }}>{d}</span>
              <span style={{ fontFamily: NASTA, fontSize: 64, color: last ? "#8a0e14" : "#3a2a18", clipPath: last ? `inset(0 0 0 ${(1 - write) * 100}%)` : undefined }}>{n}</span>
            </div>
          );
        })}
        {/* the pen writes by itself */}
        {write > 0 && write < 1 && <div style={{ position: "absolute", left: lerp(650, 380, write), top: 520, width: 14, height: 140, background: "#1a1410", transform: "rotate(30deg)", borderRadius: 6 }} />}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle 620px at 540px 780px, rgba(0,0,0,0), rgba(0,0,0,.85))" }} />
    </AbsoluteFill>
  );
};
const Reflectors: React.FC<{ t: number }> = ({ t }) => {
  const items: [string, string][] = [["🪟", "شیشه"], ["🪞", "آینه"], ["📱", "صفحه‌ی گوشی"], ["⛽", "بنزینِ رو زمین"]];
  const mirror = rk(t, W(17, "آینه") - 0.1, W(17, "آینه") + 0.3);
  return (
    <AbsoluteFill style={{ background: "#05070c", direction: "rtl", fontFamily: BLACK, color: "#fff" }}>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontSize: 58, opacity: rk(t, S(17) - 0.1, S(17) + 0.3) }}>هر چیزی که <span style={{ color: PALE }}>انعکاس</span> داره</div>
      {items.map(([ic, txt], i) => {
        const k = rk(t, W(17, "انعکاس") - 0.2 + i * 0.18, W(17, "انعکاس") + 0.1 + i * 0.18, back);
        const hi = i === 1 ? mirror : 0;
        const x = 110 + (i % 2) * 460, y = 380 + Math.floor(i / 2) * 470;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 400, height: 420, borderRadius: 30, background: hi > 0.5 ? "rgba(232,50,60,.2)" : "rgba(255,255,255,.05)", border: `4px solid ${hi > 0.5 ? C.red : "rgba(184,214,244,.35)"}`, transform: `scale(${k * (1 + 0.06 * hi)})`, opacity: k > 0.01 ? (mirror > 0.5 && i !== 1 ? 0.4 : 1) : 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div style={{ fontSize: 150 }}>{ic}</div>
            <div style={{ fontSize: 44 }}>{txt}</div>
            <svg width={80} height={30} style={{ position: "absolute", top: 60, opacity: Math.floor(t * 1.7 + i) % 3 === 0 ? 1 : 0.15 }}><circle cx={22} cy={15} r={8} fill="#f6f1df" /><circle cx={58} cy={15} r={8} fill="#f6f1df" /></svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ===== 18–23 · the mirror ===== */
/** Bathroom mirror. smile 0..1 (the reflection grins, you don't), cracks 0..1, cover 0..1 (jacket over it). */
export const Mirror: React.FC<{ t: number; smile?: number; cracks?: number; cover?: number; many?: number; hands?: number; zoom?: number }> = ({ t, smile = 0, cracks = 0, cover = 0, many = 0, hands = 0, zoom = 0 }) => {
  const shards = Array.from({ length: 14 }, (_, i) => ({ x: 200 + (i % 4) * 170 + hn(i) * 40, y: 380 + Math.floor(i / 4) * 230 + hn(i, 2) * 40 }));
  return (
    <AbsoluteFill style={{ background: "#0a0d10" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + zoom})`, transformOrigin: "540px 820px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect width={1080} height={1920} fill="#141a20" />
          {Array.from({ length: 12 }, (_, i) => <rect key={`h${i}`} x={0} y={i * 160} width={1080} height={4} fill="#0c1014" />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={`v${i}`} x={i * 160} y={0} width={4} height={1920} fill="#0c1014" />)}
          {/* frame + glass */}
          <rect x={150} y={300} width={780} height={1000} rx={20} fill="#2a2f36" />
          <rect x={175} y={325} width={730} height={950} rx={10} fill="#1a2430" />
          <path d="M200 360 L400 360 L210 760 Z" fill="rgba(255,255,255,.05)" />
          {/* the reflection: you, facing out, grinning */}
          <g opacity={0.9 * (1 - cracks * 0.7)}>
            <Figure x={540} y={1000} s={1.9} fill="#4a5a6c" />
            <circle cx={540 - 22 * 1.9} cy={1000 - 82 * 1.9} r={10} fill="#f6f1df" opacity={0.3 + 0.7 * smile} />
            <circle cx={540 + 22 * 1.9} cy={1000 - 82 * 1.9} r={10} fill="#f6f1df" opacity={0.3 + 0.7 * smile} />
            <path d={`M${540 - 60 * smile} ${1000 - 40 * 1.9} Q540 ${1000 - 40 * 1.9 + 50 * smile} ${540 + 60 * smile} ${1000 - 40 * 1.9}`} stroke="#0a0d10" strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
          {/* cracks from the impact point */}
          {cracks > 0 && Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + hn(i) * 0.3; const r = 700 * cracks * (0.6 + 0.4 * hn(i, 2)); return <path key={i} d={`M540 800 L${540 + Math.cos(a) * r * 0.5 + (hn(i, 3) - 0.5) * 40} ${800 + Math.sin(a) * r * 0.5} L${540 + Math.cos(a) * r} ${800 + Math.sin(a) * r}`} stroke="#dfe8f2" strokeWidth={4} fill="none" opacity={0.85} />; })}
          {cracks > 0 && [120, 240, 380].map((r) => <circle key={r} cx={540} cy={800} r={r * cracks} fill="none" stroke="#dfe8f2" strokeWidth={3} opacity={0.5} />)}
          {/* a hundred of them: eyes in every shard */}
          {many > 0 && shards.map((p, i) => <g key={i} opacity={rk(many, i / 20, i / 20 + 0.3)}><circle cx={p.x - 12} cy={p.y} r={6} fill="#f6f1df" /><circle cx={p.x + 12} cy={p.y} r={6} fill="#f6f1df" /><path d={`M${p.x - 16} ${p.y + 18} Q${p.x} ${p.y + 30} ${p.x + 16} ${p.y + 18}`} stroke="#f6f1df" strokeWidth={3} fill="none" /></g>)}
          {/* hands out of the glass */}
          {hands > 0 && [[260, 700, -30], [820, 620, 30], [380, 1150, -10], [700, 1120, 15]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${rk(hands, i * 0.15, i * 0.15 + 0.4, back)})`}><rect x={-30} y={0} width={60} height={220} rx={26} fill={PALE} opacity={0.85} />{[-24, -8, 8, 24].map((fx) => <rect key={fx} x={fx - 7} y={-60} width={14} height={70} rx={7} fill={PALE} opacity={0.85} />)}</g>
          ))}
          {/* the jacket over it (and something breathing under it) */}
          {cover > 0 && (
            <g transform={`translate(0 ${(1 - out3(cover)) * -900})`}>
              <path d={`M140 290 L940 290 L960 ${1320 + 10 * Math.sin(t * 2.2)} Q540 ${1360 + 18 * Math.sin(t * 2.2)} 120 ${1320 + 10 * Math.sin(t * 2.2)} Z`} fill="#2a3a24" />
              <path d="M540 290 L540 1340" stroke="#1e2a1a" strokeWidth={10} />
              {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={560} cy={360 + i * 120} r={10} fill="#8a8e70" />)}
              <ellipse cx={540} cy={760} rx={150 + 14 * Math.sin(t * 2.2)} ry={180 + 10 * Math.sin(t * 2.2)} fill="rgba(0,0,0,.18)" />
            </g>
          )}
          {/* sink + you (back of head) */}
          <rect x={250} y={1320} width={580} height={80} rx={30} fill="#c9ced6" />
          <rect x={0} y={1400} width={1080} height={520} fill="#0d1014" />
        </svg>
        <svg width={1080} height={1920} style={{ position: "absolute" }}><Figure x={540} y={1640} s={2.1} fill="#010203" /></svg>
      </AbsoluteFill>
      <Beam x={540} y={800} r={680} dim={0.75} />
    </AbsoluteFill>
  );
};

/* 23 · lights off: the black phone screen is a mirror too */
const BlackScreen: React.FC<{ t: number }> = ({ t }) => {
  const off = rk(t, W(23, "خاموش") - 0.1, W(23, "خاموش") + 0.15);
  const smile = rk(t, W(23, "لبخند") - 0.2, W(23, "لبخند") + 0.4);
  const refl = rk(t, W(23, "مثل") - 0.2, W(23, "آینه") + 0.4);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {off < 1 && <AbsoluteFill style={{ opacity: 1 - off }}><Mirror t={t} cover={1} /></AbsoluteFill>}
      <div style={{ position: "absolute", left: 190, top: 300, width: 700, height: 1180, borderRadius: 90, background: "#030405", boxShadow: "0 0 0 6px #1a1d22", overflow: "hidden", opacity: off, transform: `scale(${1 + 0.06 * rk(t, W(23, "مثل"), E(23) + 1)})` }}>
        <svg width={700} height={1180} style={{ position: "absolute" }}>
          <path d="M40 60 L260 60 L60 520 Z" fill="rgba(255,255,255,.04)" />
          <g opacity={0.35 * refl}><Figure x={350} y={760} s={1.6} fill="#8aa0b8" /></g>
          <g opacity={smile}>
            <circle cx={350 - 36} cy={760 - 130} r={9} fill="#f6f1df" /><circle cx={350 + 36} cy={760 - 130} r={9} fill="#f6f1df" />
            <path d={`M${350 - 70} ${760 - 70} Q350 ${760 - 70 + 70 * smile} ${350 + 70} ${760 - 70}`} stroke="#f6f1df" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* 24 · fork 3, for the comments */
const Final: React.FC<{ t: number }> = ({ t }) => {
  const s = S(24);
  const q = rk(t, W(24, "می‌شکنیش") - 0.15, W(24, "می‌شکنیش") + 0.2, back);
  const c = rk(t, W(24, "کامنت") - 0.1, W(24, "کامنت") + 0.3, back);
  const n7 = rk(t, W(24, "شب") - 0.1, W(24, "شب") + 0.3, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d0a0c, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 210, width: "100%", fontSize: 40, color: C.sodium, opacity: rk(t, s - 0.1, s + 0.3) }}>انتخاب ۳ از ۳ · جوابش شب آخر</div>
      <div style={{ position: "absolute", top: 270, width: "100%", fontSize: 48, color: "#cfd6e2", fontFamily: FONT_TEXT, opacity: rk(t, s - 0.1, s + 0.3) }}>گوشی تنها راه ارتباطته… ولی آینه‌ست</div>
      <div style={{ position: "absolute", top: 370, width: "100%", fontSize: 96, transform: `scale(${q})` }}>با گوشی چی کار می‌کنی؟</div>
      <div style={{ position: "absolute", top: 580, width: "100%", display: "flex", justifyContent: "center", gap: 50, transform: `scale(${q})` }}>
        {[["A", "🔨", "می‌شکنمش", C.red], ["B", "📱", "تا صبح\nنگهش می‌دارم", "#3a6db0"]].map(([l, ic, txt, col], i) => (
          <div key={l} style={{ position: "relative", width: 420, height: 340, borderRadius: 36, background: "rgba(12,14,20,.9)", border: `6px solid ${col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${i ? 2 - pulse : pulse})` }}>
            <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px" }}>{l}</div>
            <div style={{ fontSize: 100 }}>{ic}</div>
            <div style={{ fontSize: 48, whiteSpace: "pre-line", lineHeight: 1.2 }}>{txt}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 1010, width: 800, borderRadius: 30, background: "#fff", color: "#111", padding: "20px 30px", fontFamily: FONT_TEXT, fontSize: 44, display: "flex", alignItems: "center", gap: 20, transform: `scale(${c})`, opacity: c > 0.01 ? 1 : 0, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
        <span style={{ fontSize: 56 }}>💬</span><span>کامنت کن: <b style={{ fontFamily: BLACK }}>A</b> یا <b style={{ fontFamily: BLACK }}>B</b></span>
        <span style={{ marginRight: "auto", width: 4, height: 50, background: "#111", opacity: Math.floor(t * 2) % 2 }} />
      </div>
      <div style={{ position: "absolute", top: 1440, width: "100%", opacity: n7, transform: `translateY(${(1 - n7) * 40}px)` }}>
        <div style={{ fontSize: 46, color: C.dim, fontFamily: FONT_TEXT }}>شب آخر… فردا</div>
        <div style={{ fontSize: 120, color: C.red, textShadow: "0 0 40px rgba(232,50,60,.4)" }}>شب ۷ از ۷</div>
        <div style={{ fontSize: 40, color: "#cfd6e2", fontFamily: FONT_TEXT }}>فالو کن که پایانش رو از دست ندی</div>
      </div>
    </AbsoluteFill>
  );
};

/** Grain + vignette + rare flicker — same look as v09's Film, but from 12 pre-made noise frames (the live feTurbulence tripled render time). */
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Img src={staticFile(`v22/grain-${String((f % 12) + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 0.07, imageRendering: "pixelated" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,.75) 100%)" }} />
    {hn(f, 9) > 0.985 && <AbsoluteFill style={{ background: "rgba(0,0,0,.35)" }} />}
  </>
);

// ---- scene list ------------------------------------------------------------------
const Fork1: React.FC<{ t: number }> = ({ t }) => <Fork t={t} n={1} q="جواب میدی؟" a={["📞", "جواب\nمیدم"]} b={["✖", "رد\nمی‌کنم"]} wrong="b" t0={T1} pickWrong={S(11) - 0.25} pickRight={S(13) - 0.05} bg={<Call t={t} mode="ring" />} />;
const Fork2: React.FC<{ t: number }> = ({ t }) => <Fork t={t} n={2} q="با آینه چی کار می‌کنی؟" a={["🔨", "می‌شکنمش"]} b={["🧥", "با کاپشن\nمی‌پوشونمش"]} wrong="a" t0={T2} pickWrong={S(20) - 0.25} pickRight={S(22) - 0.05} bg={<Mirror t={t} smile={1} />} />;

type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: Recap0 },
  { from: S(1) - 0.2, R: Rules },
  { from: S(2) - 0.2, R: LastQ },
  { from: S(3) - 0.2, R: Verdict },
  { from: S(4) - 0.15, R: WalksOut },
  { from: S(6) - 0.15, R: OpensDoor },
  { from: S(8) - 0.05, R: Verdict },
  { from: W(8, "یه") - 0.15, R: NameCalls },
  { from: S(9) - 0.2, R: ({ t }) => <Call t={t} mode="ring" /> },
  { from: S(10) - 0.15, R: Fork1 },
  { from: S(11) + 0.45, R: ({ t }) => <Call t={t} mode="declined" /> },
  { from: S(13) - 0.05, R: Fork1 },
  { from: W(13, "بالاخره") - 0.15, R: ({ t }) => <Call t={t} mode="live" /> },
  { from: S(14) - 0.15, R: Husband },
  { from: S(15) - 0.15, R: CameHome },
  { from: S(16) - 0.15, R: NextName },
  { from: S(17) - 0.15, R: Reflectors },
  { from: S(18) - 0.2, R: ({ t }) => <Mirror t={t} smile={rk(t, W(18, "لبخند") - 0.3, W(18, "لبخند") + 0.4)} zoom={0.12 * rk(t, S(18), E(18))} /> },
  { from: S(19) - 0.15, R: Fork2 },
  { from: S(20) + 0.45, R: ({ t }) => <Mirror t={t} smile={1} cracks={rk(t, SHATTER - 0.05, SHATTER + 0.15, out3)} many={rk(t, S(21) - 0.1, E(21) + 0.3, (u) => u)} hands={rk(t, W(21, "صد") - 0.1, E(21) + 0.4, (u) => u)} zoom={0.04 + 0.1 * rk(t, SHATTER, E(21))} /> },
  { from: S(22) - 0.05, R: Fork2 },
  { from: W(22, "شیشه") - 0.15, R: ({ t }) => <Mirror t={t} smile={1} cover={rk(t, W(22, "شیشه") - 0.15, W(22, "شیشه") + 0.35)} /> },
  { from: S(23) - 0.2, R: BlackScreen },
  { from: S(24) - 0.2, R: Final },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const quiet = (t: number) => t < S(9) - 0.2 || (t >= S(10) - 0.15 && t < W(13, "بالاخره") - 0.15) || (t >= S(19) - 0.15 && t < W(22, "شیشه") - 0.15) || t >= S(24) - 0.2 || (t >= S(14) - 0.15 && t < S(18) - 0.2);
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if (quiet(t)) return null;
  const clock = t < S(23) ? `۴:${fa(String(Math.floor(rk(t, S(9), S(23), (k) => k) * 52)).padStart(2, "0"))}` : `۵:${fa("0" + Math.floor(rk(t, S(23), S(24), (k) => k) * 3))}`;
  const lives = t >= S(22) ? 2 : t >= S(13) ? 1 : 0;
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۶ از ۷</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{clock}<span style={{ fontSize: 34, color: C.dim }}> بامداد</span></div>
      <div style={{ fontSize: 28, color: GREEN }}>{"✓".repeat(lives)}<span style={{ color: C.dim }}>{"○".repeat(3 - lives)}</span> انتخاب‌ها</div>
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(24) - 0.2) return null;
  if ([10, 12, 19].includes(cur.si)) return null; // fork questions are on the card; the twin's text is on the phone
  if ((t >= DEAD0A && t < S(6)) || (t >= DEAD0B && t < S(8)) || (t >= DEAD1 && t < S(13)) || (t >= DEAD2 && t < S(22))) return null;
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const twin = cur.v === "twin", her = cur.v === "lily";
  const base = twin ? C.ice : her ? "#f6c6d8" : "#fff";
  const hot = twin || her ? "#fff" : C.sodium;
  const top = [4, 6, 11, 20].includes(cur.si) ? 1500 : 1330;
  return (
    <div style={{ position: "absolute", left: 60, top, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: twin ? 80 : 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? hot : base, transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})`, fontStyle: twin || her ? "italic" : undefined }}>{w.w}</span>;
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
      {t < S(3) - 0.2 && <RecapLabel t={t} />}
      {t >= W(13, "بالاخره") && t < S(18) - 0.2 && <CallPill t={t} />}
      <Hud t={t} />
      <Captions t={t} />
      <Scare t={t} at={SCARE1} len={0.3} />
      <Dead t={t} at={DEAD0A} until={S(6) - 0.15} why="اون با صورتِ تو رفت خونه" />
      <Dead t={t} at={DEAD0B} until={REW0} why="در رو باز کردی" />
      <Dead t={t} at={DEAD1} until={REW1} why="تنها کسی که کمکت می‌کرد رو رد کردی" />
      <Dead t={t} at={DEAD2} until={REW2} why="هر تیکه‌ی آینه… یه انعکاس" />
      <Rew t={t} at={REW0} />
      <Rew t={t} at={REW1} />
      <Rew t={t} at={REW2} />
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V22_LOOK = [0.1, 3.0, 6.5, 11.5, 13.8, 18.0, 21.0, 24.5, 27.5, 30.5, 32.0, 35.6, 36.9, 37.8, 40.5, 44.0, 47.0, 51.0, 56.5, 59.5, 61.6, 64.0, 65.2, 65.8, 69.0, 74.5, 79.5, 83.0, 85.5, 89.0, 92.0, 95.5, 100.0, 103.2, 106.5, 109.5, 111.0, 112.5, 113.5, 116.5, 120.0, 124.0, 128.5, 130.5, 135.0, 141.5];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V22_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V22: React.FC = () => (
  <>
    <Composition id="V22" component={Video} durationInFrames={V22_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v22/mix.wav" }} />
    <Composition id="V22-Silent" component={Video} durationInFrames={V22_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V22-Look" component={Look} durationInFrames={V22_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
