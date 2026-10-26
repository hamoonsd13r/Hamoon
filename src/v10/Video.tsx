// Video 10 — «پمپ‌بنزین · شب ۲ از ۷» · vertical 1080×1920 · same world as V09 (shared pieces imported from ../v09).
// New this night: CCTV monitor, the uniform double, rule #4, the dead phone, the scratch lap, the full Paykan, the blackout.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Chip, Figure, Film, NASTA } from "../v09/Video";
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
export const V10_END = E(17) + 2.4;
export const V10_FRAMES = fr(V10_END);

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const pad = (n: number) => fa(String(Math.floor(n)).padStart(2, "0"));

/* ───────── CCTV frame: grey, scanlines, REC, timestamp ───────── */
const Cctv: React.FC<{ t: number; cam: string; stamp: string; children: React.ReactNode; zoom?: number; zx?: number; zy?: number; glitch?: number }> = ({ t, cam, stamp, children, zoom = 1, zx = 540, zy = 900, glitch = 0 }) => {
  const g = glitch > 0 && hn(Math.floor(t * 20), 3) < glitch ? (hn(Math.floor(t * 20), 5) - 0.5) * 60 : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 40, top: 230, width: 1000, height: 1060, overflow: "hidden", borderRadius: 18, border: "6px solid #1d2026", background: "#111" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${g}px,0)`, filter: `grayscale(1) contrast(1.25) brightness(${0.95 + 0.05 * Math.sin(t * 13)})` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: 1060, transform: `scale(${zoom})`, transformOrigin: `${zx}px ${zy}px` }}>{children}</div>
        </div>
        {glitch > 0 && g !== 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(255,0,0,.18), transparent 30%, rgba(0,255,255,.15))`, mixBlendMode: "screen" }} />}
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 2px, transparent 2px 5px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.7))" }} />
        <div style={{ position: "absolute", left: 30, top: 24, fontFamily: "monospace", fontSize: 34, color: "#e9ecef", direction: "ltr" }}><span style={{ color: C.red, opacity: Math.floor(t * 2) % 2 ? 1 : 0.2 }}>●</span> REC</div>
        <div style={{ position: "absolute", right: 30, top: 24, fontFamily: FONT_TEXT, fontSize: 30, color: "#e9ecef", direction: "rtl" }}>{cam}</div>
        <div style={{ position: "absolute", left: 30, bottom: 22, fontFamily: FONT_NUM, fontSize: 40, color: "#e9ecef", direction: "ltr" }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Shop interior as seen from the ceiling camera (glass door on the right). doorOpen 0..1, who = x of the double (−1 = none). */
const ShopCam: React.FC<{ t: number; doorOpen: number; who: number; turn?: number; eyes?: number }> = ({ t, doorOpen, who, turn = 0, eyes = 0 }) => (
  <svg width={1000} height={1060} style={{ position: "absolute" }}>
    <rect width={1000} height={1060} fill="#2b2e33" />
    <path d="M0 640 L1000 640 L1000 1060 L0 1060 Z" fill="#3a3d43" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 125} 640 L${i * 125 - 120} 1060`} stroke="#33363b" strokeWidth={3} />)}
    {/* shelves left */}
    {[0, 1, 2].map((r) => <rect key={r} x={40} y={260 + r * 120} width={300} height={14} fill="#55595f" />)}
    {[0, 1, 2].map((r) => Array.from({ length: 7 }, (_, i) => <rect key={`${r}${i}`} x={50 + i * 42} y={200 + r * 120} width={30} height={60} fill="#6e7379" />))}
    {/* counter */}
    <rect x={60} y={700} width={420} height={200} fill="#4a4d52" />
    <rect x={60} y={690} width={420} height={20} fill="#5c6066" />
    {/* glass door frame */}
    <rect x={640} y={180} width={300} height={520} fill="#1a1c20" stroke="#6b6f75" strokeWidth={10} />
    <g transform={`translate(640 180) scale(${1 - doorOpen * 0.75} 1)`}><rect x={0} y={0} width={300} height={520} fill="rgba(160,180,200,.25)" stroke="#8a8f96" strokeWidth={8} /><rect x={30} y={240} width={12} height={70} fill="#9aa0a6" /></g>
    {doorOpen > 0.1 && <rect x={640 + 300 * (1 - doorOpen * 0.75)} y={180} width={300 * doorOpen * 0.75} height={520} fill="#050608" />}
    {who > -1 && (
      <g transform={`translate(${who} 600)`}>
        <path d="M-70 120 L-60 -40 Q0 -70 60 -40 L70 120 Z" fill="#c9cdd2" />
        <path d="M-60 -40 L-20 -40 L-30 120 L-70 120 Z M60 -40 L20 -40 L30 120 L70 120 Z" fill="#8a8f96" />
        <rect x={10} y={0} width={44} height={18} fill="#e9ecef" />
        <rect x={-50} y={120} width={36} height={130} fill="#26292e" /><rect x={14} y={120} width={36} height={130} fill="#26292e" />
        <g transform={`translate(${turn * 10} 0)`}>
          <ellipse cx={0} cy={-90} rx={40} ry={48} fill="#1d2025" />
          {eyes > 0 && <g opacity={eyes}><circle cx={-14 + turn * 10} cy={-92} r={6} fill="#fff" /><circle cx={14 + turn * 10} cy={-92} r={6} fill="#fff" /></g>}
        </g>
      </g>
    )}
    {Array.from({ length: 60 }, (_, i) => <rect key={i} x={hn(i, Math.floor(t * 12)) * 1000} y={hn(i + 9, Math.floor(t * 12)) * 1060} width={2} height={2} fill="#fff" opacity={0.25} />)}
  </svg>
);

/** Pump 4 camera: the Paykan, empty driver seat, back seat full of you. */
const PumpCam: React.FC<{ t: number; heads: number; look: number }> = ({ t, heads, look }) => (
  <svg width={1000} height={1060} style={{ position: "absolute" }}>
    <rect width={1000} height={1060} fill="#1c1f24" />
    <rect y={760} width={1000} height={300} fill="#2c2f34" />
    <rect x={720} y={420} width={120} height={340} rx={10} fill="#6e7379" />
    <rect x={740} y={450} width={80} height={60} fill="#1a1d20" />
    <text x={780} y={496} textAnchor="middle" fontFamily={FONT_NUM} fontSize={48} fill="#e9ecef">۴</text>
    <g transform="translate(70 760)">
      <ellipse cx={300} cy={20} rx={320} ry={20} fill="rgba(0,0,0,.5)" />
      <path d="M0 -40 L0 -150 Q0 -170 24 -172 L150 -182 L230 -290 L440 -290 L520 -182 L600 -176 Q626 -172 626 -150 L626 -40 Z" fill="#d9dbd8" />
      <path d="M250 -276 L330 -276 L330 -186 L180 -186 Z" fill="#0a0b0d" />
      <path d="M345 -276 L430 -276 L500 -186 L345 -186 Z" fill="#0a0b0d" />
      {/* back seat heads (left window = back seat, right = driver, empty) */}
      {Array.from({ length: 4 }, (_, i) => {
        const a = clamp(heads * 4 - i);
        const up = i === 1 ? look : 0;
        const x = 200 + i * 34;
        return a > 0 ? (
          <g key={i} opacity={a}>
            <ellipse cx={x} cy={-212 - up * 20} rx={26} ry={32} fill="#55585d" />
            {(i === 1 ? look > 0.5 : false) && <g><circle cx={x - 9} cy={-216 - up * 20} r={4} fill="#fff" /><circle cx={x + 9} cy={-216 - up * 20} r={4} fill="#fff" /></g>}
          </g>
        ) : null;
      })}
      <rect x={350} y={-240} width={10} height={54} fill="#26292e" />
      <rect x={-6} y={-70} width={638} height={16} fill="#9ea3a8" />
      {[120, 500].map((x) => <g key={x}><circle cx={x} cy={-24} r={58} fill="#0b0c10" /><circle cx={x} cy={-24} r={24} fill="#55595f" /></g>)}
    </g>
    {Array.from({ length: 60 }, (_, i) => <rect key={i} x={hn(i, Math.floor(t * 12)) * 1000} y={hn(i + 9, Math.floor(t * 12)) * 1060} width={2} height={2} fill="#fff" opacity={0.25} />)}
  </svg>
);

/** The twin's face on CCTV, mouth moving, glitching. */
const TwinFace: React.FC<{ t: number; talk: number }> = ({ t, talk }) => {
  const m = talk * (0.3 + 0.7 * Math.abs(Math.sin(t * 14)));
  return (
    <svg width={1000} height={1060} style={{ position: "absolute" }}>
      <rect width={1000} height={1060} fill="#141619" />
      <g transform="translate(500 560)">
        <path d="M-220 -380 L220 -380 L240 420 L-240 420 Z" fill="#0d0e10" />
        <ellipse cx={0} cy={-40} rx={210} ry={270} fill="#8d9096" />
        <ellipse cx={-80} cy={-80} rx={44} ry={30} fill="#0a0b0c" /><ellipse cx={80} cy={-80} rx={44} ry={30} fill="#0a0b0c" />
        <circle cx={-80} cy={-80} r={8} fill="#fff" /><circle cx={80} cy={-80} r={8} fill="#fff" />
        <ellipse cx={0} cy={110} rx={70} ry={10 + 40 * m} fill="#0a0b0c" />
        <path d="M-210 -170 Q0 -360 210 -170 L210 -230 Q0 -380 -210 -230 Z" fill="#1d2025" />
        <path d="M-200 240 L-260 420 L260 420 L200 240 Q0 300 -200 240 Z" fill="#c9cdd2" />
        <rect x={40} y={300} width={110} height={40} fill="#e9ecef" />
        <text x={95} y={330} textAnchor="middle" fontFamily={FONT_TEXT} fontSize={22} fill="#222" style={{ direction: "rtl" }}>متصدی</text>
      </g>
      {Array.from({ length: 80 }, (_, i) => <rect key={i} x={hn(i, Math.floor(t * 12)) * 1000} y={hn(i + 9, Math.floor(t * 12)) * 1060} width={3} height={3} fill="#fff" opacity={0.3} />)}
    </svg>
  );
};

/* ───────── night-2 props ───────── */
const Battery: React.FC<{ t: number }> = ({ t }) => {
  const s = S(2), b = W(2, "باتری");
  const a = rk(t, b - 0.1, b + 0.3, back);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #12182a, #030407 70%)" }}>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 150, color: C.sodium, textShadow: "0 0 50px rgba(255,154,60,.35)", transform: `scale(${rk(t, s - 0.1, s + 0.4, back)})` }}>شب ۲ از ۷</div>
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontFamily: FONT_NUM, fontSize: 120, color: "#fff", opacity: rk(t, W(2, "ساعت") - 0.1, W(2, "ساعت") + 0.3) }}>۱:۵۸</div>
      <div style={{ position: "absolute", left: 340, top: 820, width: 400, height: 170, border: `10px solid ${C.red}`, borderRadius: 26, transform: `scale(${a})`, opacity: a > 0 ? 1 : 0 }}>
        <div style={{ position: "absolute", right: -40, top: 45, width: 26, height: 60, background: C.red, borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 14, top: 14, bottom: 14, width: 26, background: C.red, opacity: Math.floor(t * 3) % 2 ? 1 : 0.2 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_NUM, fontSize: 90, color: C.red }}>۷٪</div>
      </div>
      <div style={{ position: "absolute", top: 1060, width: "100%", textAlign: "center", fontFamily: FONT_TEXT, fontSize: 44, color: C.dim, direction: "rtl", opacity: rk(t, W(2, "هنوز") - 0.1, W(2, "هنوز") + 0.3) }}>کمک: هنوز ۶ روز دیگه…</div>
    </AbsoluteFill>
  );
};

const Rule4: React.FC<{ t: number }> = ({ t }) => {
  const r4 = W(3, "چهارم");
  const L: [string, number, boolean?][] = [["قانون اول: چراغ نه.", -9], ["قانون دوم: در قفل.", -9], ["قانون سوم: اگه کسی اسمت رو صدا زد… جواب نده.", -9], ["قانون چهارم: اگه صدای خودت رو", r4, true], ["از بیرون شنیدی… گوشات رو بگیر.", W(3, "بیرون"), true]];
  const bx = 540 + Math.sin(t * 0.8) * 80, by = 1000 + Math.cos(t * 0.6) * 90;
  return (
    <AbsoluteFill style={{ background: "#0b0907" }}>
      <div style={{ position: "absolute", left: 110, top: 280, width: 860, height: 1000, transform: `rotate(-3deg)`, background: C.paper, boxShadow: "0 30px 70px rgba(0,0,0,.7)", padding: "60px 56px", direction: "rtl" }}>
        {L.map(([txt, at, hot], i) => {
          const a = at < 0 ? 1 : rk(t, at - 0.1, at + 0.6, (k) => k);
          return <div key={i} style={{ fontFamily: NASTA, fontSize: hot ? 60 : 46, lineHeight: 2.05, color: hot ? "#8a0e14" : "rgba(27,23,18,.55)", clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, textDecoration: hot ? "none" : "line-through rgba(27,23,18,.0)" }}>{txt}</div>;
        })}
        {/* wet ink drip under rule 4 */}
        <div style={{ position: "absolute", left: 420, top: 690, width: 10, height: 140 * rk(t, W(3, "بگیر"), W(3, "بگیر") + 1.2), background: "#8a0e14", borderRadius: 5, opacity: 0.85 }} />
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(circle 440px at ${bx}px ${by}px, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,.93) 100%)` }} />
      <Chip x={540} y={200} a={rk(t, S(3) - 0.1, S(3) + 0.3, back)} bg={C.red}>قانون تازه</Chip>
    </AbsoluteFill>
  );
};

/** Rotary phone with a cut cord; ringing = shaking handset + rings. pick 0..1 lifts the handset. */
const OldPhone: React.FC<{ t: number; ring: boolean; pick: number }> = ({ t, ring, pick }) => {
  const sh = ring ? Math.sin(t * 70) * 6 : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect width={1080} height={1920} fill="#07080a" />
      <ellipse cx={540} cy={1180} rx={420} ry={60} fill="rgba(0,0,0,.6)" />
      <rect x={0} y={1180} width={1080} height={740} fill="#14110e" />
      <g transform="translate(540 1000)">
        <path d="M-260 180 L-200 -60 Q0 -110 200 -60 L260 180 Z" fill="#3a1416" />
        <circle cx={0} cy={60} r={120} fill="#2a0e10" stroke="#5a2024" strokeWidth={8} />
        {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 1.6 + 2.2; return <circle key={i} cx={Math.cos(a) * 82} cy={60 + Math.sin(a) * 82} r={18} fill="#0d0506" />; })}
        <circle cx={0} cy={60} r={36} fill="#efe3c4" />
        <g transform={`translate(${sh} ${-130 - pick * 500}) rotate(${sh * 0.6 - pick * 25})`} opacity={1 - pick * 0.9}>
          <path d="M-240 0 Q-250 -50 -200 -60 L200 -60 Q250 -50 240 0 L200 10 Q150 -20 120 10 L-120 10 Q-150 -20 -200 10 Z" fill="#4a1a1d" />
        </g>
        {ring && [0, 1, 2].map((i) => { const k = ((t * 2.2 + i / 3) % 1); return <path key={i} d={`M${-300 - k * 120} ${-120 - k * 40} Q${-340 - k * 120} ${-40} ${-300 - k * 120} ${40 + k * 40}`} stroke={C.sodium} strokeWidth={8} fill="none" opacity={1 - k} />; })}
        {ring && [0, 1, 2].map((i) => { const k = ((t * 2.2 + i / 3) % 1); return <path key={`r${i}`} d={`M${300 + k * 120} ${-120 - k * 40} Q${340 + k * 120} ${-40} ${300 + k * 120} ${40 + k * 40}`} stroke={C.sodium} strokeWidth={8} fill="none" opacity={1 - k} />; })}
        {/* cut cord */}
        <path d="M240 140 C 330 160 300 260 380 280 C 430 290 420 330 440 340" stroke="#2a0e10" strokeWidth={14} fill="none" />
        <path d="M436 334 l18 -6 M440 344 l20 4 M432 344 l6 18" stroke="#c98a3a" strokeWidth={5} />
      </g>
    </svg>
  );
};

/** Handset at the ear: frost creeps in from the edges («سردمونه»). */
const Handset: React.FC<{ t: number }> = ({ t }) => {
  const talk = t >= S(6) && t <= E(6) + 0.1;
  const frost = rk(t, W(6, "سردمونه") - 0.3, W(6, "سردمونه") + 1.4);
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Figure x={360} y={1060} s={2.4} fill="#0b0d12" turn={-0.6} />
        <g transform="translate(560 720) rotate(-60)">
          <path d="M-260 0 Q-270 -60 -210 -70 L210 -70 Q270 -60 260 0 L210 14 Q160 -24 128 14 L-128 14 Q-160 -24 -210 14 Z" fill="#4a1a1d" />
        </g>
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={600 + i * 16} y={1300 - (talk ? 10 + 90 * hn(Math.floor(t * 18), i) : 4) / 2} width={9} height={talk ? 10 + 90 * hn(Math.floor(t * 18), i) : 4} rx={4} fill={C.ice} opacity={0.85} />)}
      </svg>
      <AbsoluteFill style={{ boxShadow: `inset 0 0 ${80 + 260 * frost}px ${30 + 120 * frost}px rgba(200,230,255,${0.65 * frost})` }} />
      <div style={{ position: "absolute", left: 600, top: 1180, fontFamily: FONT_TEXT, fontSize: 34, color: C.ice, direction: "rtl" }}>خط تلفن: <span style={{ color: C.red }}>قطع</span></div>
    </AbsoluteFill>
  );
};

/** Smartphone voice message from Mom. */
const VoiceMsg: React.FC<{ t: number }> = ({ t }) => {
  const vib = W(7, "می‌لرزه");
  const shake = t >= vib - 0.05 && t < vib + 0.8 ? Math.sin(t * 90) * 8 : 0;
  const msg = rk(t, W(7, "پیام") - 0.2, W(7, "پیام") + 0.2, back);
  const play = clamp((t - S(8)) / (E(8) - S(8)));
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      <div style={{ position: "absolute", left: 190 + shake, top: 260, width: 700, height: 1000, borderRadius: 90, background: "#0d0f14", boxShadow: "0 0 0 6px #2a2e36, 0 50px 120px rgba(0,0,0,.8)", overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT }}>
        <div style={{ position: "absolute", inset: 18, borderRadius: 74, background: "#0e1420", padding: "90px 34px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#fff", fontSize: 38 }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: "#3b4a63", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>👩</div>
            <div><div>مامان</div><div style={{ fontSize: 24, color: C.radio }}>آنلاین · ساعت ۲:۱۱</div></div>
            <div style={{ marginRight: "auto", fontFamily: FONT_NUM, fontSize: 30, color: C.red }}>۶٪</div>
          </div>
          <div style={{ borderTop: "2px solid rgba(255,255,255,.1)", margin: "30px 0" }} />
          <div style={{ marginTop: 40, transform: `scale(${msg})`, transformOrigin: "100% 50%", opacity: msg > 0.01 ? 1 : 0, background: "#1f2b40", borderRadius: 34, padding: "26px 28px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: C.radio, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#0e1420" }}>{play > 0 && play < 1 ? "❚❚" : "▶"}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", direction: "ltr" }}>
              {Array.from({ length: 24 }, (_, i) => <div key={i} style={{ width: 8, height: 14 + 50 * hn(i, 4), borderRadius: 4, background: i / 24 < play ? C.radio : "#5b6a85" }} />)}
            </div>
            <div style={{ fontFamily: FONT_NUM, fontSize: 30, color: "#cfd6e2" }}>۰:۰۴</div>
          </div>
          <div style={{ marginTop: 26, fontSize: 30, color: "#cfd6e2", opacity: rk(t, S(8), S(8) + 0.4) }}>«پسرم، من خونه‌م. به هیچ‌کس در رو باز نکن.»</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Floor plan: something circles the three glass walls, scratching. */
const ScratchLap: React.FC<{ t: number }> = ({ t }) => {
  const a = W(9, "اول") - 0.3, b = W(9, "سوم") + 0.6;
  const p = rk(t, a, b, (k) => k);
  // path around the shop: wall 1 (left) → 2 (top) → 3 (right)
  const pts: [number, number][] = [[240, 1180], [240, 520], [840, 520], [840, 1180]];
  const at = (k: number): [number, number] => {
    const seg = Math.min(2, Math.floor(k * 3)), u = k * 3 - seg;
    return [lerp(pts[seg][0], pts[seg + 1][0], u), lerp(pts[seg][1], pts[seg + 1][1], u)];
  };
  const head = at(p);
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={300} y={580} width={480} height={580} fill="#0f141d" stroke="#2a313d" strokeWidth={4} />
        {[[300, 580, 300, 1160, "۱"], [300, 580, 780, 580, "۲"], [780, 580, 780, 1160, "۳"]].map(([x1, y1, x2, y2, n], i) => (
          <g key={i}>
            <line x1={x1 as number} y1={y1 as number} x2={x2 as number} y2={y2 as number} stroke={C.glass} strokeWidth={16} opacity={0.5} />
            <text x={i === 0 ? 350 : i === 1 ? 540 : 730} y={i === 1 ? 640 : 880} textAnchor="middle" fontFamily={FONT_NUM} fontSize={44} fill={C.glass}>{`دیوار ${n}`}</text>
          </g>
        ))}
        <rect x={300} y={1150} width={480} height={20} fill="#2a313d" />
        <text x={540} y={1220} textAnchor="middle" fontFamily={FONT_TEXT} fontSize={30} fill={C.dim}>در (قفل)</text>
        <circle cx={540} cy={900} r={22} fill={C.sodium} />
        <text x={540} y={960} textAnchor="middle" fontFamily={FONT_TEXT} fontSize={30} fill={C.sodium}>تو</text>
        {/* trail */}
        <polyline points={Array.from({ length: 60 }, (_, i) => at((i / 59) * p)).map((q) => q.join(",")).join(" ")} fill="none" stroke={C.red} strokeWidth={8} strokeDasharray="4 14" strokeLinecap="round" opacity={0.85} />
        {t >= a && <><circle cx={head[0]} cy={head[1]} r={26 + 4 * Math.sin(t * 12)} fill={C.red} /><circle cx={head[0]} cy={head[1]} r={60} fill="rgba(232,50,60,.2)" /></>}
      </svg>
      {/* scratch marks overlay */}
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: rk(t, S(9), S(9) + 0.4) }}>
        {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${120 + i * 40} 300 Q${150 + i * 40} 360 ${130 + i * 40} ${300 + 160 * rk(t, S(9) + i * 0.05, S(9) + 0.5 + i * 0.05)}`} stroke="rgba(230,240,255,.55)" strokeWidth={6} fill="none" strokeLinecap="round" />)}
      </svg>
    </AbsoluteFill>
  );
};

/** Darkness: power cut, then something behind you. */
const Dark: React.FC<{ t: number; behind: number }> = ({ t, behind }) => {
  const cut = S(14) + 0.55;
  const after = clamp((t - cut) / 0.6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {t < cut && <AbsoluteFill style={{ background: hn(Math.floor(t * 25)) > 0.5 ? "#2a2f3a" : "#0c0e12" }} />}
      {t >= cut && <AbsoluteFill style={{ background: `rgba(255,200,140,${0.12 * (1 - after)})` }} />}
      {behind > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <Figure x={540} y={1280} s={2.6} fill="#0d0f15" />
          <g opacity={behind}>
            <Figure x={720} y={900} s={2.0} fill="#1c1f2a" />
            <circle cx={690} cy={736} r={5} fill="#f6f1df" opacity={0.95} /><circle cx={740} cy={736} r={5} fill="#f6f1df" opacity={0.95} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

const Choice: React.FC<{ t: number }> = ({ t }) => {
  const q = rk(t, S(16) - 0.1, S(16) + 0.3, back);
  const n3 = rk(t, S(17) - 0.1, S(17) + 0.4, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a0607, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 330, width: "100%", fontSize: 82, transform: `scale(${q})`, lineHeight: 1.35 }}>قانون <span style={{ color: C.red }}>چهارم</span> یادته؟</div>
      <div style={{ position: "absolute", top: 560, width: "100%", display: "flex", justifyContent: "center", gap: 40, transform: `scale(${rk(t, W(16, "گوشات") - 0.1, W(16, "گوشات") + 0.3, back)})` }}>
        <div style={{ background: "#1f8a4c", borderRadius: 26, padding: "18px 40px", fontSize: 46, transform: `scale(${pulse})` }}>🙉 گوشات رو بگیر</div>
        <div style={{ background: C.red, borderRadius: 26, padding: "18px 40px", fontSize: 46, transform: `scale(${2 - pulse})`, opacity: rk(t, W(16, "برمی‌گردی") - 0.1, W(16, "برمی‌گردی") + 0.2) }}>👀 برگرد ببین</div>
      </div>
      <div style={{ position: "absolute", top: 900, width: "100%", opacity: n3, transform: `translateY(${(1 - n3) * 40}px)` }}>
        <div style={{ fontSize: 52, color: C.dim, fontFamily: FONT_TEXT }}>شب سوم… فردا</div>
        <div style={{ fontSize: 120, color: C.sodium }}>شب ۳ از ۷</div>
        <div style={{ fontSize: 42, color: "#cfd6e2", fontFamily: FONT_TEXT, marginTop: 10 }}>فالو کن که جا نمونی</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
const stampAt = (t: number, base: number, from: number) => { const s = base + Math.max(0, t - from); return `۱۴۰۵/۰۸/۰۴  ${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}`; };
type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: ({ t }) => {
    const walk = rk(t, W(0, "یکی") - 0.6, W(0, "باز", 1) - 0.1);
    return <Cctv t={t} cam="دوربین ۲ · مغازه" stamp={stampAt(t, 3 * 3600 + 26 * 60 + 2, 0)} zoom={1 + 0.06 * rk(t, 0, E(0))}><ShopCam t={t} doorOpen={rk(t, W(0, "باز", 1) - 0.1, W(0, "کرده") + 0.2)} who={t >= W(0, "یکی") - 0.6 ? lerp(300, 700, walk) : -1} /></Cctv>;
  } },
  { from: S(1) - 0.2, R: ({ t }) => <Cctv t={t} cam="دوربین ۲ · بزرگ‌نمایی ×۴" stamp={stampAt(t, 3 * 3600 + 26 * 60 + 9, S(1))} zoom={lerp(1.8, 2.6, rk(t, S(1), E(1)))} zx={700} zy={560} glitch={0.15}><ShopCam t={t} doorOpen={1} who={700} turn={rk(t, W(1, "تو") - 0.2, W(1, "تو") + 0.3)} eyes={rk(t, W(1, "پوشیده"), W(1, "پوشیده") + 0.4)} /></Cctv> },
  { from: S(2) - 0.25, R: Battery },
  { from: S(3) - 0.2, R: Rule4 },
  { from: S(4) - 0.2, R: ({ t }) => <OldPhone t={t} ring={t >= W(4, "زنگ") - 0.1} pick={0} /> },
  { from: S(5) - 0.15, R: ({ t }) => <OldPhone t={t} ring={t < S(5) + 0.3} pick={rk(t, S(5), S(5) + 0.6)} /> },
  { from: S(6) - 0.1, R: Handset },
  { from: S(7) - 0.2, R: VoiceMsg },
  { from: S(9) - 0.2, R: ScratchLap },
  { from: S(10) - 0.2, R: ({ t }) => <Cctv t={t} cam="دوربین ۴ · پمپ‌ها" stamp={stampAt(t, 2 * 3600 + 14 * 60, S(10))} zoom={lerp(1, 1.15, rk(t, S(10), E(10)))}><PumpCam t={t} heads={0} look={0} /></Cctv> },
  { from: S(11) - 0.2, R: ({ t }) => <Cctv t={t} cam="دوربین ۴ · بزرگ‌نمایی" stamp={stampAt(t, 2 * 3600 + 14 * 60 + 9, S(11))} zoom={lerp(1.6, 2.4, rk(t, S(11), E(12)))} zx={330} zy={560} glitch={0.08}><PumpCam t={t} heads={rk(t, W(11, "پر") - 0.1, W(11, "آدمه") + 0.4)} look={rk(t, W(12, "بالا") - 0.2, W(12, "بالا") + 0.4)} /></Cctv> },
  { from: S(13) - 0.15, R: ({ t }) => <Cctv t={t} cam="دوربین ۴ · ؟" stamp="۱۴۰۵/۰۸/۰۴  ۰۰:۰۰:۰۰" glitch={0.45}><TwinFace t={t} talk={t >= S(13) && t <= E(13) ? 1 : 0} /></Cctv> },
  { from: S(14) - 0.1, R: ({ t }) => <Dark t={t} behind={0} /> },
  { from: S(15) - 0.2, R: ({ t }) => <Dark t={t + 99} behind={rk(t, W(15, "آروم") - 0.2, W(15, "خودت") + 0.3)} /> },
  { from: S(16) - 0.25, R: Choice },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const clockAt = (t: number) => {
  if (t < S(2)) return null; // flashback (CCTV has its own stamp)
  const m = t < S(4) ? lerp(118, 122, rk(t, S(2), S(4), (k) => k)) : t < S(9) ? lerp(130, 131, rk(t, S(4), S(9), (k) => k)) : lerp(132, 137, rk(t, S(9), S(16), (k) => k));
  return `${fa(Math.floor(m / 60))}:${pad(m % 60)}`;
};
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const c = clockAt(t);
  if (!c || t >= S(16) - 0.25 || (t >= S(14) + 0.55 && t < S(16))) return null;
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۲ از ۷</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{c}<span style={{ fontSize: 34, color: C.dim }}> بامداد</span></div>
      <div style={{ fontSize: 26, color: C.red }}>باتری: {t < S(7) ? "۷٪" : "۶٪"}</div>
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(16) - 0.25) return null;
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const v = cur.v;
  const color = v === "lilyphone" ? C.ice : v === "lily" ? C.radio : v === "twin" ? "#ff8a8a" : "#ffffff";
  const quote = v !== "brian";
  const jit = v === "twin" ? (hn(Math.floor(t * 20)) - 0.5) * 10 : 0;
  return (
    <div style={{ position: "absolute", left: 60, top: 1330, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)", transform: `translateX(${jit}px)` }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? (quote ? color : C.sodium) : color, transform: `scale(${isCur ? 1 + 0.08 * (1 - clamp((t - w.s) / 0.18)) : 1})`, fontStyle: quote ? "italic" : undefined }}>{w.w}</span>;
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
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(0,0,0,${cut})` }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V10_LOOK = [0.5, 6.5, 8.6, 11.5, 13.2, 16.0, 19.5, 25.0, 31.0, 36.5, 42.5, 46.5, 51.5, 55.5, 60.0, 63.5, 69.0, 74.5, 78.0, 83.0, 86.3, 89.0, 92.0, 97.5, 102.5, 108.0];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V10_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V10: React.FC = () => (
  <>
    <Composition id="V10" component={Video} durationInFrames={V10_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v10/mix.wav" }} />
    <Composition id="V10-Silent" component={Video} durationInFrames={V10_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V10-Look" component={Look} durationInFrames={V10_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
