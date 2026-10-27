// Video 19 — «پمپ‌بنزین · شب ۴ از ۷» · vertical 1080×1920 · same vector world as V09/V14/V16 (shared pieces from ../v09).
// Hook: breathing from under the counter. Jump scare: the empty shelf… you turn around.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Figure, Film, NASTA } from "../v09/Video";
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
export const V19_END = E(14) + 2.4;
export const V19_FRAMES = fr(V19_END);
/** the jump scare lands here (after «و برمی‌گردم.» + a beat of dead silence) */
export const SCARE = E(11) + 1.05;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

/** Phone-flashlight darkness: everything but the beam is black. */
const Beam: React.FC<{ x: number; y: number; r?: number; dim?: number }> = ({ x, y, r = 380, dim = 0.96 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,${dim}) 100%)` }} />
);
const Dust: React.FC<{ t: number; n?: number }> = ({ t, n = 40 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute" }}>
    {Array.from({ length: n }, (_, i) => <circle key={i} cx={(hn(i) * 1080 + Math.sin(t * 0.5 + i) * 30) % 1080} cy={((hn(i, 2) * 1920 + t * (8 + hn(i, 3) * 14)) % 1920)} r={1.5 + hn(i, 4) * 2.5} fill="rgba(255,240,210,.55)" />)}
  </svg>
);

/* 0 · hook: breathing under the counter */
const Breath: React.FC<{ t: number }> = ({ t }) => {
  const nafas = W(0, "نفس");
  const puffs = [0, 1, 2, 3, 4].map((i) => nafas - 0.4 + i * 1.3);
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={560} fill="#0b0a09" />
        <rect x={0} y={540} width={1080} height={40} fill="#16130f" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={640 + i * 200} width={1080} height={4} fill="#0c0b0a" />)}
        {puffs.map((p, i) => {
          const k = (t - p) / 1.6;
          if (k < 0 || k > 1) return null;
          return <ellipse key={i} cx={540 + k * 60} cy={1150 - k * 200} rx={60 + k * 240} ry={30 + k * 110} fill={`rgba(200,215,230,${0.42 * (1 - k)})`} />;
        })}
        <ellipse cx={540} cy={1900} rx={700} ry={420} fill="rgba(110,150,255,.10)" />
        {/* hook: two eyes flash in the dark on the very first frames, then once more */}
        {t < 0.35 && <g opacity={1 - t / 0.35}><circle cx={500} cy={1260} r={9} fill="#f6f1df" /><circle cx={560} cy={1262} r={9} fill="#f6f1df" /></g>}
        {/* two eyes, for one frame-pair only, deep in the dark */}
        {Math.abs(t - (nafas + 1.0)) < 0.09 && <g><circle cx={500} cy={1260} r={7} fill="#f6f1df" /><circle cx={560} cy={1262} r={7} fill="#f6f1df" /></g>}
      </svg>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * rk(t, 0, E(0))})` }} />
    </AbsoluteFill>
  );
};

const Night4Card: React.FC<{ t: number }> = ({ t }) => {
  const s = S(1);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #12182a, #030407 70%)", direction: "rtl" }}>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 150, color: C.sodium, textShadow: "0 0 50px rgba(255,154,60,.35)", transform: `scale(${rk(t, s - 0.1, s + 0.4, back)})` }}>شب ۴ از ۷</div>
      <div style={{ position: "absolute", top: 530, width: "100%", textAlign: "center", fontFamily: FONT_NUM, fontSize: 120, color: "#fff", direction: "ltr", opacity: rk(t, W(1, "ساعت") - 0.1, W(1, "ساعت") + 0.3) }}>۱:۱۱</div>
      <div style={{ position: "absolute", top: 820, width: "100%", display: "flex", justifyContent: "center", gap: 40, fontFamily: FONT_TEXT, fontSize: 44 }}>
        <div style={{ border: `4px solid ${C.red}`, color: C.red, borderRadius: 20, padding: "14px 30px", opacity: rk(t, W(1, "برق") - 0.1, W(1, "برق") + 0.3) }}>⚡ برق: قطع</div>
        <div style={{ border: `4px solid ${C.red}`, color: C.red, borderRadius: 20, padding: "14px 30px", opacity: rk(t, W(1, "آب") - 0.1, W(1, "آب") + 0.3) }}>💧 آب: ۰</div>
      </div>
    </AbsoluteFill>
  );
};

/** Under the counter, phone light: empty… a dusty logbook. */
const UnderCounter: React.FC<{ t: number }> = ({ t }) => {
  const bx = lerp(250, 560, rk(t, S(2), W(2, "دفترچه") + 0.2));
  const by = lerp(900, 1080, rk(t, S(2), W(2, "دفترچه") + 0.2));
  return (
    <AbsoluteFill style={{ background: "#0a0806" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={520} width={1080} height={30} fill="#2a2018" />
        <rect x={0} y={1240} width={1080} height={680} fill="#120f0b" />
        {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 160} 560 L${i * 160 - 40} 1240`} stroke="#15110c" strokeWidth={6} />)}
        <g transform="translate(560 1170) rotate(-6)">
          <rect x={-170} y={-50} width={340} height={110} rx={8} fill="#4a2a20" />
          <rect x={-160} y={-58} width={330} height={20} fill="#e8dcc0" />
          <rect x={-150} y={-30} width={300} height={70} fill="rgba(160,150,130,.35)" />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT_TEXT} fontSize={32} fill="#d8c8a8" style={{ direction: "rtl" }}>دفتر تحویل شیفت</text>
        </g>
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={420 + hn(i) * 300} cy={1100 + hn(i, 2) * 120} r={2} fill="rgba(200,190,170,.5)" />)}
      </svg>
      <Dust t={t} />
      <Beam x={bx} y={by} r={360} />
    </AbsoluteFill>
  );
};

/** The logbook: 30-year-old shifts, the last name is yours. */
const Ledger: React.FC<{ t: number }> = ({ t }) => {
  const rows: [string, string][] = [["۱۳۷۵/۰۸/۰۱", "شب"], ["۱۳۷۵/۰۸/۰۲", "شب"], ["۱۳۷۵/۰۸/۰۳", "شب"], ["۱۳۷۵/۰۸/۰۴", "شب"]];
  const mine = rk(t, W(3, "اسم") - 0.1, W(3, "منه") + 0.2, back);
  const sig = rk(t, W(3, "امضا") - 0.1, W(3, "سی") + 0.4);
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 1000, background: "#e6d8b6", transform: "rotate(-1.5deg)", boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "60px 50px", direction: "rtl", fontFamily: FONT_TEXT }}>
        <div style={{ fontFamily: BLACK, fontSize: 46, color: "#3a2a18", borderBottom: "4px double #8a6a40", paddingBottom: 14 }}>دفتر تحویل شیفت · جایگاه ۲۴ ساعته</div>
        <div style={{ display: "flex", fontSize: 28, color: "#6a5030", padding: "14px 0", borderBottom: "2px solid #b9a27a" }}><span style={{ width: 260 }}>تاریخ</span><span style={{ width: 120 }}>شیفت</span><span>متصدی / امضا</span></div>
        {rows.map(([d, s], i) => {
          const last = i === rows.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", height: 130, borderBottom: "2px solid #c9b48c", background: last ? `rgba(160,20,20,${0.12 * mine})` : undefined }}>
              <span style={{ width: 260, fontFamily: FONT_NUM, fontSize: 40, color: "#3a2a18" }}>{d}</span>
              <span style={{ width: 120, fontSize: 32, color: "#3a2a18" }}>{s}</span>
              <span style={{ fontFamily: NASTA, fontSize: 44, color: last ? "#8a0e14" : "#3a2a18", clipPath: last ? `inset(0 0 0 ${(1 - sig) * 100}%)` : undefined }}>{last ? "خودت ~~~" : ["حسینی", "رضایی", "کریمی"][i] + " ~"}</span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 40, bottom: 120, fontFamily: BLACK, fontSize: 40, color: "#8a0e14", border: "5px solid #8a0e14", borderRadius: 14, padding: "6px 22px", transform: `rotate(-8deg) scale(${mine})`, opacity: mine > 0.01 ? 0.9 : 0 }}>اسم متصدی = اسم تو</div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle 620px at 540px 800px, rgba(0,0,0,0), rgba(0,0,0,.85))" }} />
    </AbsoluteFill>
  );
};

/** The last page: the handwriting gets shakier with every word. */
const LastPage: React.FC<{ t: number }> = ({ t }) => {
  const parts: [string, number][] = [["شب چهارم،", S(5)], ["اونا دیگه", W(5, "اونا")], ["در نمی‌زنن…", W(5, "در")], ["از تو میان.", W(5, "از")]];
  return (
    <AbsoluteFill style={{ background: "#050403" }}>
      <div style={{ position: "absolute", left: 110, top: 330, width: 860, height: 960, background: "#e6d8b6", transform: "rotate(1.5deg)", boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "90px 60px", direction: "rtl" }}>
        <div style={{ fontFamily: FONT_TEXT, fontSize: 28, color: "#8a7050", marginBottom: 20 }}>صفحه‌ی آخر</div>
        {parts.map(([p, at], i) => {
          const a = rk(t, at - 0.1, at + 0.5, (u) => u);
          const shake = (i + 1) * 1.6;
          return <div key={i} style={{ fontFamily: NASTA, fontSize: 70 + i * 14, lineHeight: 1.9, color: i === 3 ? "#8a0e14" : "#2a1d12", clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, transform: `translate(${Math.sin(t * 37 + i) * shake}px, ${Math.cos(t * 29 + i) * shake}px) rotate(${(i % 2 ? 2 : -2) * (i + 1)}deg)` }}>{p}</div>;
        })}
        <div style={{ position: "absolute", left: 120, bottom: 80, width: 10, height: 160 * rk(t, W(5, "میان"), W(5, "میان") + 1.5), background: "#8a0e14", borderRadius: 5 }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle 560px at 540px 820px, rgba(0,0,0,0), rgba(0,0,0,.88))" }} />
    </AbsoluteFill>
  );
};

/** The storeroom door opens by itself; the padlock hangs open. */
const StoreDoor: React.FC<{ t: number }> = ({ t }) => {
  const open = rk(t, W(6, "باز") - 0.4, W(6, "باز") + 1.6, out3);
  const lock = rk(t, W(6, "قفلش") - 0.2, W(6, "قفلش") + 0.4, back);
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={0} width={1080} height={1920} fill="#0e0f12" />
        <rect x={290} y={420} width={500} height={1100} fill="#000" />
        <rect x={290} y={420} width={500 * open * 0.12} height={1100} fill="rgba(255,190,120,.05)" />
        <g transform={`translate(290 420) scale(${1 - open * 0.7} 1)`}>
          <rect x={0} y={0} width={500} height={1100} fill="#3a3d43" stroke="#26282c" strokeWidth={10} />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={30} y={60 + i * 170} width={440} height={10} fill="#2c2f34" />)}
          <rect x={420} y={520} width={40} height={90} rx={6} fill="#6e7379" />
        </g>
        <rect x={270} y={400} width={540} height={20} fill="#1d1f23" /><rect x={270} y={400} width={20} height={1120} fill="#1d1f23" /><rect x={790} y={400} width={20} height={1120} fill="#1d1f23" />
        <g transform={`translate(840 980) rotate(${18 + Math.sin(t * 2.4) * 10 * (1 - open)})`} opacity={lock}>
          <path d="M-26 -20 L-26 -60 Q0 -96 26 -60 L26 -48" fill="none" stroke="#a8a8a0" strokeWidth={12} />
          <rect x={-40} y={-20} width={80} height={80} rx={12} fill="#b8963a" />
        </g>
        <rect x={0} y={1520} width={1080} height={400} fill="#0a0b0d" />
      </svg>
      <Beam x={540} y={980} r={520} dim={0.9} />
    </AbsoluteFill>
  );
};

/** Into the storeroom: shelves, fuel cans, dust in the phone light. pan → shelf 3 (0..1), empty. */
const Store: React.FC<{ t: number; pan: number; step?: number }> = ({ t, pan, step = 0 }) => {
  const bx = lerp(300, 820, pan), by = lerp(1000, 900, pan);
  return (
    <AbsoluteFill style={{ background: "#060607" }}>
      <AbsoluteFill style={{ transform: `scale(${1 + 0.08 * step}) translateY(${Math.sin(t * 6) * 4 * step}px)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <rect width={1080} height={1920} fill="#111214" />
          {[0, 1, 2].map((s) => (
            <g key={s} transform={`translate(${60 + s * 340} 420)`}>
              <rect x={0} y={0} width={14} height={1100} fill="#3a3d43" /><rect x={286} y={0} width={14} height={1100} fill="#3a3d43" />
              {[0, 1, 2, 3].map((r) => (
                <g key={r} transform={`translate(0 ${200 + r * 260})`}>
                  <rect x={0} y={0} width={300} height={16} fill="#4a4d52" />
                  {s < 2 ? Array.from({ length: 3 }, (_, i) => <g key={i} transform={`translate(${24 + i * 90} -120)`}><rect x={0} y={0} width={70} height={120} rx={6} fill={i % 2 ? "#8a2a20" : "#6a6e2a"} /><rect x={20} y={-16} width={30} height={18} fill="#2a2d32" /></g>) : null}
                </g>
              ))}
              <text x={150} y={-30} textAnchor="middle" fontFamily={FONT_NUM} fontSize={70} fill="#c9a43a">{["۱", "۲", "۳"][s]}</text>
            </g>
          ))}
          <rect y={1520} width={1080} height={400} fill="#0b0c0e" />
        </svg>
        <Dust t={t} n={60} />
      </AbsoluteFill>
      <Beam x={bx} y={by} r={320} />
    </AbsoluteFill>
  );
};

/** Phone message from your own number. */
const Msg: React.FC<{ t: number; lines: [string, number][]; dark?: boolean }> = ({ t, lines, dark }) => (
  <AbsoluteFill style={{ background: dark ? "#000" : "#05070c" }}>
    <div style={{ position: "absolute", left: 190, top: 300, width: 700, height: 960, borderRadius: 90, background: "#0d0f14", boxShadow: "0 0 0 6px #2a2e36, 0 0 120px rgba(120,160,255,.15)", overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT }}>
      <div style={{ position: "absolute", inset: 18, borderRadius: 74, background: "#0e1420", padding: "90px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#fff", fontSize: 36 }}>
          <div style={{ width: 84, height: 84, borderRadius: 42, background: "#3b2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>👤</div>
          <div><div>خودم</div><div style={{ fontSize: 24, color: "#9aa6b8", direction: "ltr", textAlign: "right" }}>شماره‌ی خودت</div></div>
          <div style={{ marginRight: "auto", fontFamily: FONT_NUM, fontSize: 30, color: C.red }}>۳٪</div>
        </div>
        <div style={{ borderTop: "2px solid rgba(255,255,255,.1)", margin: "30px 0" }} />
        {lines.map(([txt, at], i) => {
          const a = rk(t, at - 0.15, at + 0.15, back);
          return <div key={i} style={{ marginTop: 26, marginLeft: 80, transform: `scale(${a})`, transformOrigin: "100% 0", opacity: a > 0.01 ? 1 : 0, background: "#3a1a1c", color: "#fff", borderRadius: "34px 34px 8px 34px", padding: "22px 28px", fontSize: 40, lineHeight: 1.5 }}>{txt}</div>;
        })}
      </div>
    </div>
  </AbsoluteFill>
);

/** The turn + the jump scare. */
const Scare: React.FC<{ t: number }> = ({ t }) => {
  const k = t - SCARE;
  if (k < 0) {
    // the slow turn in silence: the light swings across the dark storeroom
    const turn = rk(t, E(11) - 0.4, SCARE, (u) => u * u);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ transform: `translateX(${-turn * 900}px)` }}><Store t={t} pan={1} /></AbsoluteFill>
        <AbsoluteFill style={{ background: `rgba(0,0,0,${0.3 + 0.6 * turn})` }} />
      </AbsoluteFill>
    );
  }
  const lunge = clamp(k / 0.12);
  const sz = lerp(0.55, 1.28, out3(lunge)) + Math.max(0, k - 0.12) * 0.08;
  const shake = k < 1.2 ? (hn(Math.floor(k * 60)) - 0.5) * 70 * (1 - k / 1.2) : 0;
  const red = k < 0.1 ? 0.85 : k < 0.2 ? 0 : k < 0.27 ? 0.6 : 0;
  const white = k < 0.04 ? 0.9 : 0;
  return (
    <AbsoluteFill style={{ background: "#000", transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      {[[-14, "rgba(255,0,40,.55)"], [14, "rgba(0,220,255,.45)"], [0, null]].map(([dx, tint], j) => (
        <svg key={j} width={1080} height={1920} style={{ position: "absolute", left: (dx as number) * (k < 0.6 ? 1 : 0), mixBlendMode: tint ? "screen" : undefined, opacity: tint ? 0.8 : 1 }}>
          <g transform={`translate(540 900) scale(${sz}) rotate(${-6 + Math.sin(k * 40) * 2})`}>
            <path d="M-300 -320 Q-360 40 -270 300 Q-140 520 0 540 Q140 520 270 300 Q360 40 300 -320 Q150 -480 0 -480 Q-150 -480 -300 -320 Z" fill={tint ? (tint as string) : "#cdc7b8"} />
            {!tint && <>
              <path d="M-300 -320 Q-360 40 -270 300 Q-140 520 0 540 Q140 520 270 300 Q360 40 300 -320" fill="none" stroke="#6a6458" strokeWidth={20} opacity={0.6} />
              <path d="M-80 -420 L-60 -300 L-110 -200 M120 -440 L90 -330 L140 -260" stroke="#3a3530" strokeWidth={6} fill="none" />
              <ellipse cx={-120} cy={-70} rx={92} ry={128} fill="#000" />
              <ellipse cx={130} cy={-50} rx={80} ry={150} fill="#000" />
              <circle cx={-112} cy={-60} r={9} fill="#fff" /><circle cx={136} cy={-36} r={8} fill="#fff" />
              <path d="M-120 60 Q-140 160 -160 190 M120 70 Q150 170 170 200" stroke="#1a1714" strokeWidth={10} fill="none" />
              <ellipse cx={0} cy={300} rx={170} ry={210} fill="#050303" />
              {Array.from({ length: 12 }, (_, i) => { const x = -150 + i * 27; return <path key={i} d={`M${x} ${110 + Math.abs(i - 5.5) * 8} l12 0 l-6 44 Z`} fill="#d8d0bd" />; })}
              {Array.from({ length: 12 }, (_, i) => { const x = -150 + i * 27; return <path key={`b${i}`} d={`M${x} ${490 - Math.abs(i - 5.5) * 8} l12 0 l-6 -40 Z`} fill="#d8d0bd" />; })}
              <path d="M-300 -320 Q0 -560 300 -320 L330 -260 L-330 -260 Z" fill="#0d0f15" />
              <rect x={-360} y={540} width={720} height={500} fill="#1d2a44" />
              <rect x={-360} y={700} width={720} height={36} fill={C.sodium} opacity={0.85} />
            </>}
          </g>
        </svg>
      ))}
      {red > 0 && <AbsoluteFill style={{ background: `rgba(200,0,20,${red})`, mixBlendMode: "multiply" }} />}
      {white > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${white})` }} />}
      {k > 0.9 && <AbsoluteFill style={{ background: `rgba(0,0,0,${clamp((k - 0.9) / 0.5)})` }} />}
    </AbsoluteFill>
  );
};

const Night5: React.FC<{ t: number }> = ({ t }) => {
  const a = rk(t, S(14) - 0.1, S(14) + 0.4, back);
  const b = rk(t, W(14, "شب", 1) - 0.1, W(14, "شب", 1) + 0.4, out3);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a0607, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 420, width: "100%", fontSize: 100, transform: `scale(${a})` }}>سه شب <span style={{ color: C.red }}>مونده</span></div>
      <div style={{ position: "absolute", top: 700, width: "100%", opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <div style={{ fontSize: 52, color: C.dim, fontFamily: FONT_TEXT }}>شب پنجم… فردا</div>
        <div style={{ fontSize: 130, color: C.sodium }}>شب ۵ از ۷</div>
        <div style={{ fontSize: 42, color: "#cfd6e2", fontFamily: FONT_TEXT, marginTop: 10 }}>فالو کن که جا نمونی</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <Figure x={540} y={1500} s={1.3} fill="#0a0b10" eyes={Math.floor(t * 1.5) % 4 === 0 ? 0.9 : 0} />
      </svg>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: Breath },
  { from: S(1) - 0.25, R: Night4Card },
  { from: S(2) - 0.2, R: UnderCounter },
  { from: S(3) - 0.2, R: Ledger },
  { from: S(4) - 0.2, R: LastPage },
  { from: S(6) - 0.2, R: StoreDoor },
  { from: S(7) - 0.2, R: ({ t }) => <Store t={t} pan={0.15} step={rk(t, S(7), E(7))} /> },
  { from: S(8) - 0.2, R: ({ t }) => <Msg t={t} lines={[["پشتِ قفسه‌ی سوم وایسادم.", S(9)], ["جلوتر نیا.", W(9, "جلوتر")]]} /> },
  { from: S(10) - 0.2, R: ({ t }) => <Store t={t} pan={rk(t, S(10), W(10, "سوم") + 0.4)} /> },
  { from: S(11) - 0.1, R: Scare },
  { from: SCARE + 1.6, R: ({ t }) => <Msg t={t} dark lines={[["گفتم جلوتر نیا…", S(13)], ["من پشتِ سرت بودم.", W(13, "من")]]} /> },
  { from: S(14) - 0.25, R: Night5 },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if ((t >= S(1) - 0.25 && t < S(2) - 0.2) || (t >= SCARE - 0.6 && t < SCARE + 1.6) || t >= S(14) - 0.25) return null;
  const m = 11 + Math.floor(rk(t, S(1), S(14), (u) => u) * 22);
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۴ از ۷</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>۱:{fa(String(m).padStart(2, "0"))}<span style={{ fontSize: 34, color: C.dim }}> بامداد</span></div>
      <div style={{ fontSize: 26, color: C.red }}>برق: قطع · آب: ۰</div>
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(14) - 0.25 || (t >= SCARE - 0.3 && t < SCARE + 1.6)) return null;
  if (cur.si === 5 || cur.si === 9 || cur.si === 13) return null; // written lines are shown on paper / phone
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  return (
    <div style={{ position: "absolute", left: 60, top: 1330, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? C.sodium : "#fff", transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})` }}>{w.w}</span>;
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
  const cut = i > 0 && since < 0.12 && Math.abs(sc.from - SCARE) > 0.01 ? 1 - since / 0.12 : 0;
  const scaring = t >= SCARE && t < SCARE + 1.6;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: scaring ? undefined : `scale(${1 + 0.012 * Math.sin(t * 0.6)})` }}>
        <sc.R t={t} />
      </AbsoluteFill>
      <Film f={f} />
      <Hud t={t} />
      <Captions t={t} />
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V19_LOOK = [0.1, 3.0, 4.2, 9.5, 16.0, 19.5, 25.0, 28.0, 31.0, 36.0, 39.0, 43.0, 49.0, 53.0, 57.5, 60.5, 64.0, 69.0, 71.3, 71.65, 71.9, 72.3, 74.2, 77.0, 80.5, 83.5];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V19_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V19: React.FC = () => (
  <>
    <Composition id="V19" component={Video} durationInFrames={V19_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v19/mix.wav" }} />
    <Composition id="V19-Silent" component={Video} durationInFrames={V19_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V19-Look" component={Look} durationInFrames={V19_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
