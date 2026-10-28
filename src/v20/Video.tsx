// Video 20 — «پمپ‌بنزین · شب ۵ از ۷ · بازی» · vertical 1080×1920 · same vector world as V09/V14/V16/V19 (shared pieces from ../v09).
// Interactive: the viewer picks at every fork (3 s timer). Wrong pick → a short death + «مُردی» → VHS rewind → the right path goes on.
// Fork 1: hide (✗) / don't move (✓, the reflection lags). Fork 2: storeroom from your own number (✗) / toilet from the unknown number (✓).
// Fork 3: «me or him?» → comments, answered in night 6.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Exterior, Figure, Film, Stars } from "../v09/Video";
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
export const V20_END = E(18) + 2.6;
export const V20_FRAMES = fr(V20_END);

// ---- the game clock (all from the voice) ----
/** fork timers: 3 s countdown right after the question */
export const T1 = E(5) + 0.15;
export const T2 = E(12) + 0.15;
export const TIMER = 3.3;
/** deaths: the scare hits on the dead line, the «مُردی» card right after, then a VHS rewind into the right path */
export const SCARE1 = S(7) - 0.06;
export const SCARE2 = S(14) - 0.06;
export const DEAD1 = E(7) + 0.2;
export const DEAD2 = E(14) + 0.2;
export const REW = 0.8;
export const REW1 = S(8) - REW - 0.05;
export const REW2 = S(15) - REW - 0.05;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const GREEN = "#1fae5c";

const Beam: React.FC<{ x: number; y: number; r?: number; dim?: number }> = ({ x, y, r = 380, dim = 0.96 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,${dim}) 100%)` }} />
);
const Dust: React.FC<{ t: number; n?: number }> = ({ t, n = 40 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, i) => <circle key={i} cx={(hn(i) * 1080 + Math.sin(t * 0.5 + i) * 30) % 1080} cy={((hn(i, 2) * 1920 + t * (8 + hn(i, 3) * 14)) % 1920)} r={1.5 + hn(i, 4) * 2.5} fill="rgba(255,240,210,.5)" />)}
  </svg>
);

/** A pointing arm for a Figure at (x,y,s): shoulder → elbow → hand. k: 0 down by the side … 1 pointing down-left at the counter. */
const Arm: React.FC<{ x: number; y: number; s: number; k: number; fill: string }> = ({ x, y, s, k, fill }) => {
  const sx = -120, sy = 70;
  const ex = lerp(-150, -250, k), ey = lerp(240, 180, k);
  const hx = lerp(-150, -330, k), hy = lerp(400, 330, k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M${sx} ${sy} L${ex} ${ey} L${hx} ${hy}`} stroke={fill} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${hx} ${hy} l${lerp(0, -40, k)} ${lerp(50, 30, k)}`} stroke={fill} strokeWidth={22} strokeLinecap="round" />
    </g>
  );
};

/** Inside the dark shop, facing the glass wall: night outside, your reflection in the glass, you in the foreground (back of head).
 *  meTurn / refTurn: head turn; point: reflection's arm; eyes: its eyes; zoom: push into the glass. */
const GlassWall: React.FC<{ t: number; meTurn?: number; refTurn?: number; point?: number; eyes?: number; zoom?: number; mouth?: number; me?: number }> = ({ t, meTurn = 0, refTurn = 0, point = 0, eyes = 0, zoom = 0, mouth = 0, me = 1 }) => {
  const z = 1 + zoom;
  return (
    <AbsoluteFill style={{ background: "#04060b" }}>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 820px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="v20out" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070e" /><stop offset="0.75" stopColor="#101a2e" /><stop offset="1" stopColor="#1a1410" /></linearGradient>
            <linearGradient id="v20fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120f0c" stopOpacity={0} /><stop offset="0.5" stopColor="#0d0b09" stopOpacity={0.95} /><stop offset="1" stopColor="#0d0b09" stopOpacity={0.95} /></linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#v20out)" />
          <Stars t={t} n={50} h={900} />
          {/* outside: the canopy and pump 4 under a dying sodium lamp */}
          <rect x={0} y={1080} width={1080} height={500} fill="#120f0c" />
          <rect x={520} y={930} width={420} height={26} fill="#2a2a2a" />
          <ellipse cx={730} cy={1160} rx={260} ry={60} fill={`rgba(255,154,60,${0.12 + 0.05 * Math.sin(t * 13) * (hn(Math.floor(t * 8)) > 0.8 ? 1 : 0)})`} />
          <g transform="translate(730 1040)"><rect x={-30} y={0} width={60} height={110} rx={8} fill="#3a3f48" /><rect x={-22} y={12} width={44} height={30} rx={4} fill="#0e1a12" /><text x={0} y={36} textAnchor="middle" fontFamily={FONT_NUM} fontSize={24} fill={C.radio} opacity={0.7}>۴</text></g>
          {/* the glass panels */}
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={40 + i * 340} y={160} width={320} height={1340} fill="rgba(127,163,199,.06)" stroke="#1e242e" strokeWidth={18} />
              <path d={`M${70 + i * 340} 220 L${190 + i * 340} 220 L${80 + i * 340} 620 Z`} fill="rgba(255,255,255,.035)" />
            </g>
          ))}
          {/* the reflection */}
          <g opacity={0.24}>
            <Arm x={540} y={860} s={1.3} k={point} fill="#b8d6f4" />
            <Figure x={540} y={860} s={1.3} fill="#b8d6f4" turn={refTurn} />
          </g>
          <rect x={0} y={880} width={1080} height={620} fill="url(#v20fade)" />
          {eyes > 0 && <g opacity={eyes}>{[-22, 22].map((ex) => <circle key={ex} cx={540 + (ex + refTurn * 32) * 1.3} cy={860 - 82 * 1.3} r={8} fill="#f6f1df" />)}</g>}
          {mouth > 0 && <ellipse cx={540 + refTurn * 32 * 1.3} cy={860 - 40 * 1.3} rx={16} ry={4 + 12 * mouth} fill="rgba(0,0,0,.6)" />}
          {/* the counter edge, inside */}
          <rect x={0} y={1500} width={1080} height={420} fill="#0d1015" />
          <rect x={0} y={1500} width={1080} height={16} fill="#232831" />
        </svg>
      </AbsoluteFill>
      {me > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", opacity: me }}>
          <Figure x={540} y={1560} s={2.2} fill="#010203" turn={meTurn} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

/* 0 · hook: the reflection points down at the counter; you don't. */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const p = rk(t, 0, 0.5, out3) * (0.85 + 0.15 * Math.sin(t * 5));
  return <GlassWall t={t} point={p} eyes={rk(t, W(0, "قایم") - 0.2, W(0, "قایم") + 0.2)} zoom={0.06 * rk(t, 0, E(0))} />;
};

/* 1 · the game card */
const GameCard: React.FC<{ t: number }> = ({ t }) => {
  const s = S(1);
  const rules: [string, string, number][] = [["🎮", "۳ تا انتخاب", W(1, "تصمیم")], ["⏱", "هر بار ۳ ثانیه", W(1, "یه")], ["💀", "اشتباه = مرگ", W(1, "می‌میری")]];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d0a0c, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 250, width: "100%", fontSize: 150, color: C.sodium, textShadow: `0 0 50px ${C.sodiumGlow}`, transform: `scale(${rk(t, s - 0.15, s + 0.3, back)})` }}>شب ۵ از ۷</div>
      <div style={{ position: "absolute", top: 470, width: "100%", fontSize: 64, transform: `scale(${rk(t, W(1, "تو") - 0.1, W(1, "تو") + 0.3, back)})` }}>این بار <span style={{ color: C.red }}>تو</span> بازی می‌کنی</div>
      {rules.map(([ic, txt, at], i) => {
        const a = rk(t, at - 0.15, at + 0.2, back);
        return (
          <div key={i} style={{ position: "absolute", left: 170, top: 660 + i * 170, width: 740, height: 130, borderRadius: 28, background: i === 2 ? "rgba(232,50,60,.18)" : "rgba(255,255,255,.06)", border: `3px solid ${i === 2 ? C.red : "rgba(255,255,255,.18)"}`, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", fontSize: 56, transform: `translateX(${(1 - a) * -120}px) scale(${a})`, opacity: a > 0.01 ? 1 : 0 }}>
            <span style={{ fontSize: 70 }}>{ic}</span><span style={{ color: i === 2 ? C.red : "#fff" }}>{txt}</span>
          </div>
        );
      })}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <Figure x={540} y={1560} s={1.0} fill="rgba(170,205,240,.12)" eyes={Math.floor(t * 1.4) % 3 === 0 ? 0.9 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

/* 3 · the reflection moves a beat late (the clue), then points under the counter */
const LAG = 0.7;
const meMove = (t: number, a: number) => rk(t, a, a + 0.25) - rk(t, a + 1.3, a + 1.55);
const Pointing: React.FC<{ t: number }> = ({ t }) => {
  const a = S(3) + 0.25;
  return <GlassWall t={t} meTurn={meMove(t, a)} refTurn={meMove(t, a + LAG)} point={rk(t, W(3, "پیشخون") - 0.4, W(3, "پیشخون") + 0.2, back)} eyes={0.4 + 0.5 * rk(t, W(3, "لب") - 0.2, W(3, "لب"))} zoom={0.04 + 0.1 * rk(t, S(3), E(3))} />;
};

/* 4 · close on the reflection: «hide! quick!» */
const Whisper: React.FC<{ t: number }> = ({ t }) => {
  const talk = WORDS.filter((w) => w.si === 4).some((w) => t >= w.s && t <= w.e) ? 0.5 + 0.5 * Math.abs(Math.sin(t * 22)) : 0;
  return <GlassWall t={t} point={1} eyes={1} mouth={talk} me={0} zoom={0.55 + 0.1 * rk(t, S(4) - 0.2, E(4) + 0.5)} />;
};

/** The fork card. phase: ask (timer runs) → A (wrong, highlighted red) → B (right, green ✓). */
const Fork: React.FC<{ t: number; n: number; q: string; a: [string, string]; b: [string, string]; t0: number; pickA: number; pickB: number; bg: React.ReactNode }> = ({ t, n, q, a, b, t0, pickA, pickB, bg }) => {
  const qIn = rk(t, t0 - 2.3, t0 - 1.9, back);
  const left = clamp(TIMER - (t - t0), 0, TIMER);
  const running = t >= t0 && t < t0 + TIMER;
  const up = t >= t0 + TIMER && t < pickA;
  const isA = t >= pickA && t < pickB, isB = t >= pickB;
  const sec = Math.ceil(left - 0.3);
  const tick = running ? 1 + 0.18 * (1 - ((t - t0) % 1)) ** 3 : 1;
  const card = (side: "a" | "b", [ic, txt]: [string, string], i: number) => {
    const on = side === "a" ? isA : isB;
    const off = side === "a" ? isB : isA;
    const col = side === "a" ? C.red : GREEN;
    const inK = rk(t, t0 - 1.7 + i * 0.1, t0 - 1.35 + i * 0.1, back);
    const pulse = running ? 1 + 0.03 * Math.sin(t * 9 + i * 3) : 1;
    return (
      <div style={{ width: 440, height: 380, borderRadius: 36, background: on ? col : "rgba(12,14,20,.88)", border: `6px solid ${on ? "#fff" : col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transform: `scale(${inK * pulse * (on ? 1.08 : off ? 0.9 : 1)})`, opacity: off ? 0.35 : 1, boxShadow: on ? `0 0 80px ${col}` : "0 20px 50px rgba(0,0,0,.6)", position: "relative" }}>
        <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px", color: "#fff" }}>{side === "a" ? "A" : "B"}</div>
        <div style={{ fontSize: 110 }}>{ic}</div>
        <div style={{ fontSize: 50, lineHeight: 1.25, color: "#fff", padding: "0 20px", whiteSpace: "pre-line" }}>{txt}</div>
        {on && <div style={{ position: "absolute", bottom: -46, fontSize: 46, background: "#000", border: `4px solid ${col}`, borderRadius: 20, padding: "2px 26px", color: col, transform: `scale(${rk(t, side === "a" ? pickA : pickB, (side === "a" ? pickA : pickB) + 0.25, back)})` }}>{side === "a" ? "💀 مرگ" : "✓ زنده"}</div>}
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${6 * qIn}px) brightness(${1 - 0.55 * qIn})` }}>{bg}</AbsoluteFill>
      <AbsoluteFill style={{ direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 260, width: "100%", fontSize: 40, color: C.sodium, opacity: qIn }}>انتخاب {fa(n)} از ۳</div>
        <div style={{ position: "absolute", top: 320, width: "100%", fontSize: 92, lineHeight: 1.25, transform: `scale(${qIn})`, textShadow: "0 6px 0 #000" }}>{q}</div>
        <div style={{ position: "absolute", top: 610, width: "100%", display: "flex", justifyContent: "center", gap: 50 }}>
          {card("a", a, 0)}
          {card("b", b, 1)}
        </div>
        {/* timer */}
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

/* 6–7 · wrong pick 1: you hide under the counter… it was waiting there */
const UnderDesk: React.FC<{ t: number }> = ({ t }) => {
  const k = t - SCARE1;
  const bx = lerp(260, 560, rk(t, S(6), S(6) + 1.0));
  const face = k >= 0 ? clamp(k / 0.1) : 0;
  const shake = k >= 0 && k < 0.9 ? (hn(Math.floor(k * 60)) - 0.5) * 60 * (1 - k / 0.9) : 0;
  return (
    <AbsoluteFill style={{ background: "#070605", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={480} width={1080} height={40} fill="#2a2018" />
        <rect x={0} y={1260} width={1080} height={660} fill="#120f0b" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 160} 520 L${i * 160 - 40} 1260`} stroke="#15110c" strokeWidth={6} />)}
        {/* your knees, foreground */}
        <ellipse cx={180} cy={1800} rx={260} ry={200} fill="#020203" />
        <ellipse cx={900} cy={1820} rx={260} ry={200} fill="#020203" />
      </svg>
      <Dust t={t} n={30} />
      {face > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <g transform={`translate(560 960) scale(${lerp(0.6, 1.25, out3(face)) + Math.max(0, k) * 0.06})`}>
            <path d="M-260 -280 Q-310 30 -230 260 Q-120 430 0 440 Q120 430 230 260 Q310 30 260 -280 Q130 -420 0 -420 Q-130 -420 -260 -280 Z" fill="#b9cbe0" />
            <path d="M-260 -280 Q0 -480 260 -280 L280 -220 L-280 -220 Z" fill="#0d1018" />
            <ellipse cx={-110} cy={-50} rx={80} ry={110} fill="#000" />
            <ellipse cx={115} cy={-40} rx={70} ry={130} fill="#000" />
            <circle cx={-104} cy={-40} r={8} fill="#fff" /><circle cx={120} cy={-26} r={7} fill="#fff" />
            <path d="M-210 170 Q0 300 210 160 Q120 360 0 370 Q-120 360 -210 170 Z" fill="#050303" />
            {Array.from({ length: 13 }, (_, i) => { const x = -180 + i * 28; const y = 196 + Math.sin(((i + 0.5) / 13) * Math.PI) * 60; return <path key={i} d={`M${x} ${y} l12 0 l-6 ${26 + (i % 3) * 6} Z`} fill="#dfe6ee" />; })}
          </g>
          <rect width={1080} height={1920} fill="rgba(120,170,230,.12)" />
        </svg>
      )}
      <Beam x={bx} y={960} r={face > 0 ? 620 : 380} dim={0.94} />
      {k >= 0 && k < 0.08 && <AbsoluteFill style={{ background: "rgba(255,255,255,.85)" }} />}
      {k >= 0.08 && k < 0.2 && <AbsoluteFill style={{ background: "rgba(200,0,20,.75)", mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );
};

/* 8 · the replay: you vs the reflection, frame by frame — it moves 0.7 s late */
const Replay: React.FC<{ t: number }> = ({ t }) => {
  const s = W(8, "دقت");
  const loopT = ((t - s) % 2.4 + 2.4) % 2.4; // a 2.4 s loop of the head turn, slowed
  const a = 0.2;
  const me = meMove(loopT, a), ref = meMove(loopT, a + LAG);
  const evil = rk(t, W(8, "اون") - 0.1, W(8, "اون") + 0.3);
  const inK = rk(t, s - 0.2, s + 0.2);
  return (
    <AbsoluteFill>
      {t < s ? (
        <GlassWall t={t} point={0} eyes={0.3} zoom={0.04} />
      ) : (
        <>
          <AbsoluteFill style={{ filter: "saturate(.3) contrast(1.1)" }}>
            <GlassWall t={t} meTurn={me} refTurn={ref} eyes={0.5 + 0.5 * evil} zoom={0.06} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 60, top: 300, fontFamily: FONT_NUM, fontSize: 44, color: "#fff", background: C.red, borderRadius: 12, padding: "2px 22px", opacity: inK * (Math.floor(t * 2) % 2 ? 1 : 0.6) }}>◀ REPLAY · ۰.۵x</div>
          {/* two markers: you / it, with the lag */}
          <svg width={1080} height={1920} style={{ position: "absolute", opacity: inK }}>
            <circle cx={540 + ref * 18 * 1.3} cy={860 - 80 * 1.3} r={110} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="20 14" />
            <circle cx={540 + me * 14 * 2.2} cy={1560 - 80 * 2.2} r={150} fill="none" stroke={GREEN} strokeWidth={8} />
          </svg>
          <div style={{ position: "absolute", left: 640, top: 600, fontFamily: BLACK, fontSize: 46, color: C.red, direction: "rtl", opacity: inK }}>اون</div>
          <div style={{ position: "absolute", left: 730, top: 1250, fontFamily: BLACK, fontSize: 46, color: GREEN, direction: "rtl", opacity: inK }}>تو</div>
          <div style={{ position: "absolute", left: 330, top: 470, fontFamily: BLACK, fontSize: 40, color: "#fff", direction: "rtl", background: "rgba(0,0,0,.75)", border: `3px solid ${C.red}`, borderRadius: 16, padding: "4px 20px", transform: `scale(${rk(t, W(8, "دیرتر") - 0.1, W(8, "دیرتر") + 0.2, back)})` }}>⏱ ۰.۷ ثانیه دیرتر</div>
        </>
      )}
    </AbsoluteFill>
  );
};

/** The phone: two messages at once — your own number vs an unknown one. Clue: yours is stamped 3:01, a minute in the future. */
const TwoMsgs: React.FC<{ t: number }> = ({ t }) => {
  const m1 = rk(t, W(9, "دو") - 0.1, W(9, "دو") + 0.15, back);
  const m2 = rk(t, W(9, "پیام") - 0.1, W(9, "پیام") + 0.15, back);
  const hi1 = rk(t, S(10) - 0.2, S(10)) - rk(t, S(11) - 0.2, S(11));
  const hi2 = rk(t, S(11) - 0.2, S(11));
  const clue = rk(t, S(10) + 0.4, S(10) + 0.8);
  const bub = (who: string, sub: string, stamp: string, txt: string, a: number, hi: number, mine: boolean) => (
    <div style={{ marginTop: 34, transform: `scale(${a * (1 + 0.05 * hi)})`, transformOrigin: "50% 0", opacity: a > 0.01 ? 1 - 0.5 * (hi === 0 && (hi1 > 0.5 || hi2 > 0.5) ? 1 : 0) : 0, background: mine ? "#2a1416" : "#141c2a", border: `3px solid ${hi > 0.5 ? (mine ? C.red : C.ice) : "rgba(255,255,255,.08)"}`, borderRadius: 34, padding: "22px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#fff", fontSize: 32 }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: mine ? "#5a2224" : "#22324a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>{mine ? "👤" : "❔"}</div>
        <div><div>{who}</div><div style={{ fontSize: 22, color: "#9aa6b8" }}>{sub}</div></div>
        <div style={{ marginRight: "auto", fontFamily: FONT_NUM, fontSize: 32, color: mine && clue > 0 ? C.red : "#9aa6b8", position: "relative" }}>
          {stamp}
          {mine && <svg width={110} height={70} style={{ position: "absolute", left: -24, top: -14, opacity: clue }}><ellipse cx={55} cy={35} rx={50} ry={30} fill="none" stroke={C.red} strokeWidth={4} /></svg>}
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 42, lineHeight: 1.5, color: "#fff" }}>{txt}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#04060b" }}>
      <div style={{ position: "absolute", left: 150, top: 230, width: 780, height: 1060, borderRadius: 90, background: "#0d0f14", boxShadow: "0 0 0 6px #2a2e36, 0 0 140px rgba(120,160,255,.18)", overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT, transform: `rotate(${Math.sin(t * 1.3) * 0.6}deg)` }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 74, background: "#0b111c", padding: "70px 34px" }}>
          <div style={{ textAlign: "center", fontFamily: FONT_NUM, fontSize: 110, color: "#fff", direction: "ltr" }}>۳:۰۰</div>
          <div style={{ textAlign: "center", fontSize: 28, color: "#9aa6b8", marginTop: -10 }}>جمعه · شب ۵</div>
          {bub("خودم", "شماره‌ی خودت", "۳:۰۱", "برو تو انباری. اونجا امنه.", m1, hi1, true)}
          {bub("ناشناس", "شماره‌ی ناشناس", "۳:۰۰", "برو تو دستشویی. در رو قفل کن.", m2, hi2, false)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Top-down plan of the shop for fork 2: storeroom left, toilet right, you in the middle. */
const Plan: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#070a10" }}>
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <g stroke="#2b3240" strokeWidth={14} fill="#0c1018">
        <rect x={90} y={300} width={900} height={1300} />
      </g>
      <rect x={110} y={320} width={300} height={420} fill="#141210" />
      <rect x={670} y={320} width={300} height={420} fill="#0f1418" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={140 + (i % 3) * 90} y={360 + Math.floor(i / 3) * 170} width={60} height={110} fill="#3a2a20" />)}
      {Array.from({ length: 5 }, (_, i) => Array.from({ length: 7 }, (_, j) => <rect key={`${i}${j}`} x={690 + i * 56} y={340 + j * 56} width={50} height={50} fill="#16202a" />))}
      <circle cx={820} cy={520} r={50} fill="#d8dee6" opacity={0.25} />
      <rect x={410} y={500} width={14} height={140} fill="#6a5a40" />
      <rect x={656} y={500} width={14} height={140} fill="#5a7080" />
      <rect x={130} y={1300} width={820} height={70} fill="#232831" />
      <circle cx={540} cy={1000} r={40} fill="#fff" opacity={0.85 + 0.15 * Math.sin(t * 6)} />
      <circle cx={540} cy={1000} r={70 + 20 * Math.sin(t * 3)} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={4} />
    </svg>
  </AbsoluteFill>
);

/* 13–14 · wrong pick 2: the storeroom… the door slams behind you */
const StoreDeath: React.FC<{ t: number }> = ({ t }) => {
  const k = t - SCARE2;
  const step = rk(t, S(13), SCARE2 - 0.3);
  const slam = rk(t, SCARE2 - 0.35, SCARE2 - 0.2, (u) => u);
  const fig = k >= 0 ? clamp(k / 0.12) : 0;
  const shake = k >= -0.2 && k < 0.8 ? (hn(Math.floor((k + 1) * 60)) - 0.5) * 50 * (1 - clamp((k + 0.2) / 1.0)) : 0;
  return (
    <AbsoluteFill style={{ background: "#060607", transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.15 * step})` }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect width={1080} height={1920} fill="#101114" />
          {[0, 1, 2].map((s) => (
            <g key={s} transform={`translate(${60 + s * 340} 420)`}>
              <rect x={0} y={0} width={14} height={1100} fill="#3a3d43" /><rect x={286} y={0} width={14} height={1100} fill="#3a3d43" />
              {[0, 1, 2, 3].map((r) => (
                <g key={r} transform={`translate(0 ${200 + r * 260})`}>
                  <rect x={0} y={0} width={300} height={16} fill="#4a4d52" />
                  {Array.from({ length: 3 }, (_, i) => <g key={i} transform={`translate(${24 + i * 90} -120)`}><rect x={0} y={0} width={70} height={120} rx={6} fill={i % 2 ? "#8a2a20" : "#6a6e2a"} /><rect x={20} y={-16} width={30} height={18} fill="#2a2d32" /></g>)}
                </g>
              ))}
            </g>
          ))}
          <rect y={1520} width={1080} height={400} fill="#0b0c0e" />
          {fig > 0 && (
            <g opacity={fig}>
              <g opacity={0.5}><Figure x={540} y={lerp(1100, 1000, fig)} s={lerp(1.6, 2.6, out3(fig))} fill="#b8d6f4" /></g>
              <Figure x={540} y={lerp(1100, 1000, fig)} s={lerp(1.6, 2.6, out3(fig))} fill="rgba(0,0,0,0)" eyes={1} />
            </g>
          )}
        </svg>
        <Dust t={t} n={50} />
      </AbsoluteFill>
      <Beam x={540} y={950} r={fig > 0 ? 640 : lerp(360, 260, slam)} dim={fig > 0 ? 0.85 : lerp(0.9, 0.985, slam)} />
      {slam > 0 && slam < 1 && <AbsoluteFill style={{ background: `rgba(0,0,0,${slam * 0.5})` }} />}
      {k >= 0 && k < 0.07 && <AbsoluteFill style={{ background: "rgba(255,255,255,.8)" }} />}
      {k >= 0.07 && k < 0.2 && <AbsoluteFill style={{ background: "rgba(200,0,20,.7)", mixBlendMode: "multiply" }} />}
    </AbsoluteFill>
  );
};

/* 15 · «remember night 4?» — the old message flashes back, then «خودم» turns into it */
const Memory: React.FC<{ t: number }> = ({ t }) => {
  const s = W(15, "یادته");
  const mem = t >= s - 0.15;
  const turn = rk(t, W(15, "مال") - 0.2, W(15, "مال") + 0.2);
  if (!mem) return <Plan t={t} />;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: `sepia(.6) saturate(.6) contrast(1.15)` }}>
        <div style={{ position: "absolute", left: 190, top: 300, width: 700, height: 900, borderRadius: 90, background: "#0d0f14", boxShadow: "0 0 0 6px #2a2e36", overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT }}>
          <div style={{ position: "absolute", inset: 18, borderRadius: 74, background: "#0e1420", padding: "90px 34px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#fff", fontSize: 36 }}>
              <div style={{ width: 84, height: 84, borderRadius: 42, background: turn > 0.5 ? "#000" : "#3b2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
                {turn > 0.5 ? <svg width={84} height={84}><circle cx={30} cy={40} r={8} fill="#f6f1df" /><circle cx={54} cy={40} r={8} fill="#f6f1df" /></svg> : "👤"}
              </div>
              <div><div>{turn > 0.5 ? "اون" : "خودم"}</div><div style={{ fontSize: 24, color: "#9aa6b8" }}>شماره‌ی خودت</div></div>
            </div>
            <div style={{ borderTop: "2px solid rgba(255,255,255,.1)", margin: "30px 0" }} />
            {["پشتِ قفسه‌ی سوم وایسادم. جلوتر نیا.", "گفتم جلوتر نیا… من پشتِ سرت بودم."].map((x, i) => (
              <div key={i} style={{ marginTop: 26, marginLeft: 80, background: "#3a1a1c", color: "#fff", borderRadius: "34px 34px 8px 34px", padding: "22px 28px", fontSize: 40, lineHeight: 1.5, opacity: rk(t, s + i * 0.4, s + i * 0.4 + 0.2) }}>{x.replace(/ِ/g, "")}</div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
      {/* VHS memory label + scanlines */}
      <div style={{ position: "absolute", left: 70, top: 120, fontFamily: FONT_NUM, fontSize: 52, color: "#fff", direction: "rtl" }}>◀◀ شب ۴</div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 3px, transparent 3px 6px)" }} />
      {turn > 0 && turn < 1 && <AbsoluteFill style={{ background: `rgba(232,50,60,${0.3 * Math.sin(turn * Math.PI)})` }} />}
    </AbsoluteFill>
  );
};

/* 16–17 · the toilet: you lock it. A voice like yours behind the door. */
const Toilet: React.FC<{ t: number }> = ({ t }) => {
  const lock = rk(t, W(16, "قفل") - 0.1, W(16, "قفل") + 0.3, back);
  const feet = rk(t, W(16, "پشت") - 0.2, W(16, "پشت") + 0.6);
  const knocks = [W(17, "بمونه") - 0.1, W(17, "تو") - 0.05, W(17, "من") - 0.05].map((k) => t - k).filter((d) => d >= 0 && d < 0.5);
  const shake = knocks.length ? Math.sin(knocks[0] * 70) * 10 * (1 - knocks[0] / 0.5) : 0;
  const push = 0.12 * rk(t, S(17), E(17) + 1);
  return (
    <AbsoluteFill style={{ background: "#06080b" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + push})`, transformOrigin: "540px 1000px" }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {/* tiles */}
          <rect width={1080} height={1920} fill="#141a20" />
          {Array.from({ length: 12 }, (_, i) => <rect key={`h${i}`} x={0} y={i * 160} width={1080} height={4} fill="#0c1014" />)}
          {Array.from({ length: 8 }, (_, i) => <rect key={`v${i}`} x={i * 160} y={0} width={4} height={1920} fill="#0c1014" />)}
          {/* the door */}
          <g transform={`translate(${shake} 0)`}>
            <rect x={250} y={340} width={580} height={1260} fill="#2e3238" stroke="#1a1d21" strokeWidth={14} />
            <rect x={300} y={400} width={480} height={500} fill="none" stroke="#25282d" strokeWidth={10} />
            <rect x={300} y={980} width={480} height={540} fill="none" stroke="#25282d" strokeWidth={10} />
            <circle cx={760} cy={960} r={24} fill="#8a8e94" />
            {/* the bolt */}
            <rect x={720} y={860} width={90} height={30} rx={6} fill="#6e7379" />
            <rect x={lerp(740, 800, lock)} y={866} width={60} height={18} rx={5} fill="#c9a43a" />
          </g>
          {/* light under the door + two feet shadows */}
          <rect x={250} y={1600} width={580} height={14} fill="rgba(255,200,140,.45)" />
          <g opacity={feet}><rect x={410} y={1600} width={80} height={14} fill="#000" /><rect x={590} y={1600} width={80} height={14} fill="#000" /></g>
          <rect x={0} y={1614} width={1080} height={306} fill="#0d1014" />
        </svg>
      </AbsoluteFill>
      <Beam x={540} y={980} r={560} dim={0.8} />
    </AbsoluteFill>
  );
};

/* 18 · fork 3, for the comments */
const Final: React.FC<{ t: number }> = ({ t }) => {
  const s = S(18);
  const q = rk(t, W(18, "من") - 0.15, W(18, "من") + 0.2, back);
  const c = rk(t, s - 0.1, s + 0.3, back);
  const n6 = rk(t, W(18, "جوابش") - 0.1, W(18, "جوابش") + 0.3, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, #1d0a0c, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 210, width: "100%", fontSize: 40, color: C.sodium, opacity: c }}>انتخاب ۳ از ۳ · آخرین</div>
      <div style={{ position: "absolute", top: 270, width: "100%", fontSize: 50, color: "#cfd6e2", fontFamily: FONT_TEXT, opacity: c }}>«یکی‌مون باید اینجا بمونه»</div>
      <div style={{ position: "absolute", top: 370, width: "100%", fontSize: 96, transform: `scale(${q})` }}>کی بمونه؟</div>
      <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", gap: 50, transform: `scale(${q})` }}>
        {[["A", "🙋", "من می‌مونم", C.red], ["B", "👤", "اون بمونه", "#3a6db0"]].map(([l, ic, txt, col], i) => (
          <div key={l} style={{ position: "relative", width: 420, height: 340, borderRadius: 36, background: "rgba(12,14,20,.9)", border: `6px solid ${col}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${i ? 2 - pulse : pulse})` }}>
            <div style={{ position: "absolute", top: -40, right: 30, width: 80, height: 80, borderRadius: 40, background: col, border: "5px solid #fff", fontFamily: FONT_NUM, fontSize: 52, lineHeight: "84px" }}>{l}</div>
            <div style={{ fontSize: 100 }}>{ic}</div>
            <div style={{ fontSize: 52 }}>{txt}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, top: 990, width: 800, borderRadius: 30, background: "#fff", color: "#111", padding: "20px 30px", fontFamily: FONT_TEXT, fontSize: 44, display: "flex", alignItems: "center", gap: 20, transform: `scale(${c})`, boxShadow: "0 20px 60px rgba(0,0,0,.6)" }}>
        <span style={{ fontSize: 56 }}>💬</span><span>کامنت کن: <b style={{ fontFamily: BLACK }}>A</b> یا <b style={{ fontFamily: BLACK }}>B</b></span>
        <span style={{ marginRight: "auto", width: 4, height: 50, background: "#111", opacity: Math.floor(t * 2) % 2 }} />
      </div>
      <div style={{ position: "absolute", top: 1140, width: "100%", fontSize: 38, color: "#cfd6e2", fontFamily: FONT_TEXT, opacity: c }}>دو تا انتخاب قبلی رو درست زدی؟ بنویس <span style={{ color: GREEN, fontFamily: BLACK }}>۲ از ۲</span></div>
      <div style={{ position: "absolute", top: 1440, width: "100%", opacity: n6, transform: `translateY(${(1 - n6) * 40}px)` }}>
        <div style={{ fontSize: 46, color: C.dim, fontFamily: FONT_TEXT }}>جوابش… شب ششم</div>
        <div style={{ fontSize: 120, color: C.sodium, textShadow: `0 0 40px ${C.sodiumGlow}` }}>شب ۶ از ۷</div>
        <div style={{ fontSize: 40, color: "#cfd6e2", fontFamily: FONT_TEXT }}>فالو کن که جا نمونی</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- overlays: death card + VHS rewind ---------------------------------------------
const Dead: React.FC<{ t: number; at: number; until: number; why: string }> = ({ t, at, until, why }) => {
  if (t < at || t >= until) return null;
  const k = t - at;
  const a = rk(k, 0, 0.25, back);
  return (
    <AbsoluteFill style={{ background: `rgba(30,0,2,${0.86 * clamp(k / 0.12)})`, direction: "rtl", fontFamily: BLACK, textAlign: "center", color: "#fff" }}>
      <div style={{ position: "absolute", top: 520, width: "100%", fontSize: 220, transform: `scale(${a}) rotate(${(1 - a) * -12}deg)` }}>💀</div>
      <div style={{ position: "absolute", top: 820, width: "100%", fontSize: 170, color: C.red, textShadow: "0 0 60px rgba(232,50,60,.6), 0 8px 0 #000", transform: `scale(${a})`, letterSpacing: 4 }}>مُردی</div>
      <div style={{ position: "absolute", top: 1070, width: "100%", fontSize: 44, color: "#f0c8c8", fontFamily: FONT_TEXT, opacity: rk(k, 0.3, 0.6) }}>{why}</div>
    </AbsoluteFill>
  );
};
const Rew: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const k = t - at;
  if (k < 0 || k >= REW) return null;
  const bands = Array.from({ length: 5 }, (_, i) => ({ y: (hn(i, Math.floor(k * 30)) * 1920) | 0, h: 20 + hn(i, 7) * 90 }));
  return (
    <AbsoluteFill style={{ background: "rgba(10,12,20,.55)" }}>
      {bands.map((b, i) => <div key={i} style={{ position: "absolute", left: 0, top: b.y, width: 1080, height: b.h, background: "rgba(255,255,255,.14)", transform: `translateX(${(hn(i, k * 99) - 0.5) * 80}px)` }} />)}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.3) 0 3px, transparent 3px 6px)" }} />
      <div style={{ position: "absolute", left: 70, top: 130, fontFamily: FONT_NUM, fontSize: 80, color: "#fff", textShadow: "0 0 20px rgba(255,255,255,.5)" }}>◀◀ REW</div>
      <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 64, color: "#fff", direction: "rtl" }}>برگرد… یه بار دیگه</div>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
const bg1 = (t: number) => <GlassWall t={t} point={1} eyes={0.8} zoom={0.2} />;
const ask1 = { n: 1, q: "قایم می‌شی؟", a: ["🫣", "قایم می‌شم\nزیر پیشخون"] as [string, string], b: ["🧍", "تکون\nنمی‌خورم"] as [string, string] };
const ask2 = { n: 2, q: "کدوم پیام راست می‌گه؟", a: ["📦", "انباری\n(شماره‌ی خودم)"] as [string, string], b: ["🚻", "دستشویی\n(ناشناس)"] as [string, string] };
const Fork1: React.FC<{ t: number }> = ({ t }) => <Fork t={t} {...ask1} t0={T1} pickA={S(6) - 0.25} pickB={S(8) - 0.05} bg={bg1(t)} />;
const Fork2: React.FC<{ t: number }> = ({ t }) => <Fork t={t} {...ask2} t0={T2} pickA={S(13) - 0.25} pickB={S(15) - 0.05} bg={<Plan t={t} />} />;

type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: Hook },
  { from: S(1) - 0.2, R: GameCard },
  { from: S(2) - 0.2, R: ({ t }) => <Exterior t={t} push={0.05 + 0.25 * rk(t, S(2), E(2) + 0.5)} litShop={0.12} /> },
  { from: S(3) - 0.2, R: Pointing },
  { from: S(4) - 0.15, R: Whisper },
  { from: S(5) - 0.15, R: Fork1 },
  { from: S(6) + 0.45, R: UnderDesk },
  { from: S(8) - 0.05, R: Fork1 },
  { from: W(8, "دقت") - 0.2, R: Replay },
  { from: S(9) - 0.2, R: TwoMsgs },
  { from: S(12) - 0.15, R: Fork2 },
  { from: S(13) + 0.5, R: StoreDeath },
  { from: S(15) - 0.05, R: Fork2 },
  { from: W(15, "یادته") - 0.15, R: Memory },
  { from: S(16) - 0.2, R: Toilet },
  { from: S(18) - 0.2, R: Final },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const inForkOrDeath = (t: number) => (t >= S(5) - 0.15 && t < W(8, "دقت") - 0.2) || (t >= S(12) - 0.15 && t < W(15, "یادته") - 0.15);
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if (t < S(2) - 0.2 || t >= S(18) - 0.2 || inForkOrDeath(t)) return null;
  const clock = t < S(9) ? `۲:${fa(40 + Math.floor(rk(t, S(2), S(9), (k) => k) * 19))}` : `۳:${fa("0" + Math.floor(rk(t, S(9), S(18), (k) => k) * 6))}`;
  const lives = t >= S(15) ? 2 : t >= S(8) ? 1 : 0;
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۵ از ۷</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{clock}<span style={{ fontSize: 34, color: C.dim }}> بامداد</span></div>
      <div style={{ fontSize: 28, color: GREEN }}>{"✓".repeat(lives)}<span style={{ color: C.dim }}>{"○".repeat(3 - lives)}</span> انتخاب‌ها</div>
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(18) - 0.2) return null;
  if ([5, 10, 11, 12].includes(cur.si)) return null; // the fork question is on the card; the messages are on the phone
  if ((t >= DEAD1 && t < S(8)) || (t >= DEAD2 && t < S(15))) return null;
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const twin = cur.v === "twin";
  const top = cur.si === 6 || cur.si === 13 ? 1500 : 1330;
  return (
    <div style={{ position: "absolute", left: 60, top, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: twin ? 80 : 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: twin ? (isCur ? "#fff" : C.ice) : isCur ? C.sodium : "#fff", transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})`, fontStyle: twin ? "italic" : undefined }}>{w.w}</span>;
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
      <Film f={f} />
      <Hud t={t} />
      <Captions t={t} />
      <Dead t={t} at={DEAD1} until={REW1} why="انعکاس… منتظرت بود" />
      <Dead t={t} at={DEAD2} until={REW2} why="پیامِ «خودم»… مالِ اون بود" />
      <Rew t={t} at={REW1} />
      <Rew t={t} at={REW2} />
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V20_LOOK = [0.1, 2.5, 6.0, 10.5, 14.5, 20.0, 23.0, 24.5, 27.0, 29.0, 30.5, 31.8, 32.5, 33.8, 35.5, 36.8, 38.0, 41.0, 44.5, 48.0, 51.0, 53.5, 57.0, 59.0, 61.5, 62.5, 63.4, 65.5, 67.5, 70.5, 73.5, 76.5, 80.0, 84.0, 88.0, 92.0];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V20_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V20: React.FC = () => (
  <>
    <Composition id="V20" component={Video} durationInFrames={V20_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v20/mix.wav" }} />
    <Composition id="V20-Silent" component={Video} durationInFrames={V20_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V20-Look" component={Look} durationInFrames={V20_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
