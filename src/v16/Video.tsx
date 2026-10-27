// Video 16 — «پمپ‌بنزین · شب ۳ از ۷» · vertical 1080×1920 · same vector world/characters as V09 and V14 (shared pieces from ../v09).
// New this night: the fogged glass message, the tanker and its driver, the Paykan's hands, the driver's smile, the tanker's dying lights.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { BLACK, C, Chip, Exterior, Figure, Film, Mountains, NASTA, Stars } from "../v09/Video";
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
export const V16_END = E(14) + 2.4;
export const V16_FRAMES = fr(V16_END);

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const NAVY = "#1d2a44";
const SKIN = "#c98f6b";

/* ───────── the fogged glass and the finger-written message ───────── */
const Fog: React.FC<{ t: number }> = ({ t }) => {
  const msg = ["فردا شب…", "تو میای", "بیرون."];
  const at = [S(1), W(1, "تو"), W(1, "بیرون")];
  const dawn = rk(t, 0, 3);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3a5c" /><stop offset="0.6" stopColor={`rgb(${150 + 60 * dawn},${120 + 50 * dawn},${110})`} /><stop offset="1" stopColor="#3a3328" /></linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#dawn)" />
        <Mountains y={1180} />
        <rect y={1220} width={1080} height={700} fill="#2a241c" />
        <rect y={1380} width={1080} height={120} fill="#1f2025" />
      </svg>
      {/* condensation layer with the wiped letters cut out of it */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(205,220,235,.86), rgba(185,200,215,.8))", WebkitMaskImage: "none" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={hn(i) * 1080} cy={hn(i, 2) * 1920} r={2 + hn(i, 3) * 5} fill="rgba(255,255,255,.55)" />)}
        {Array.from({ length: 9 }, (_, i) => {
          const x = 120 + hn(i, 5) * 840, y0 = 400 + hn(i, 6) * 900;
          const k = rk(t, 1 + i * 0.6, 6 + i * 0.8, (u) => u);
          return <path key={i} d={`M${x} ${y0} q ${hn(i, 7) * 8 - 4} ${120 * k} 0 ${260 * k}`} stroke="rgba(60,70,90,.35)" strokeWidth={6} fill="none" strokeLinecap="round" />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", direction: "rtl" }}>
        {msg.map((m, i) => {
          const a = rk(t, at[i] - 0.15, at[i] + 0.45, (u) => u);
          return (
            <div key={i} style={{ fontFamily: NASTA, fontSize: i === 1 ? 170 : 150, lineHeight: 1.7, color: "rgba(30,36,52,.92)", textShadow: "0 0 6px rgba(255,255,255,.4)", clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, transform: `rotate(${i % 2 ? 3 : -4}deg)` }}>{m}</div>
          );
        })}
      </div>
      {/* drips under the letters */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = rk(t, S(1) + 0.3 + i * 0.2, S(1) + 2.5 + i * 0.3, (u) => u);
          const x = 260 + i * 80 + hn(i, 9) * 30;
          return <path key={i} d={`M${x} ${700 + (i % 3) * 230} l0 ${220 * a}`} stroke="rgba(40,50,70,.4)" strokeWidth={5} strokeLinecap="round" />;
        })}
      </svg>
      {/* you, back to camera, reading it */}
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Figure x={540} y={1560} s={2.2} fill="#0d1018" turn={Math.sin(t * 0.4) * 0.15} />
        <path d="M245 1840 L835 1840 L835 1920 L245 1920 Z" fill="#0d1018" />
      </svg>
    </AbsoluteFill>
  );
};

const Night3Card: React.FC<{ t: number }> = ({ t }) => {
  const s = S(2), aW = W(2, "آب");
  const bottles = t < aW ? 12 : Math.max(3, Math.round(lerp(12, 3, rk(t, aW, aW + 1.2, out3))));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #12182a, #030407 70%)" }}>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: BLACK, fontSize: 150, color: C.sodium, textShadow: "0 0 50px rgba(255,154,60,.35)", transform: `scale(${rk(t, s - 0.1, s + 0.4, back)})` }}>شب ۳ از ۷</div>
      <div style={{ position: "absolute", top: 530, width: "100%", textAlign: "center", fontFamily: FONT_NUM, fontSize: 120, color: "#fff", direction: "ltr", opacity: rk(t, W(2, "ساعت") - 0.1, W(2, "ساعت") + 0.3) }}>۰۰:۴۰</div>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={140} y={1080} width={800} height={18} fill="#3a404c" />
        {Array.from({ length: 12 }, (_, i) => {
          const on = i < bottles;
          return (
            <g key={i} transform={`translate(${160 + i * 64} 1080)`} opacity={on ? 1 : 0.12}>
              <path d="M8 0 L8 -150 Q8 -175 22 -185 L22 -205 L38 -205 L38 -185 Q52 -175 52 -150 L52 0 Z" fill="rgba(140,200,255,.35)" stroke="rgba(190,230,255,.6)" strokeWidth={2} />
              <rect x={8} y={-110} width={44} height={40} fill="#2f6bd0" opacity={0.8} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 1130, width: "100%", textAlign: "center", fontFamily: FONT_TEXT, fontSize: 46, color: t >= aW ? C.red : C.dim, direction: "rtl" }}>آب: {fa(bottles)} بطری</div>
    </AbsoluteFill>
  );
};

/** Old Iranian tanker truck (side view, facing left), origin = front bumper bottom. lights 0..8 marker lights still on. */
const Tanker: React.FC<{ x: number; y: number; s?: number; head?: number; lights?: number; t: number; dark?: boolean }> = ({ x, y, s = 1, head = 1, lights = 8, t, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {head > 0 && <path d="M0 -70 L-900 -260 L-900 140 L0 -20 Z" fill={`rgba(255,240,200,${0.18 * head})`} />}
    <ellipse cx={420} cy={8} rx={460} ry={18} fill="rgba(0,0,0,.6)" />
    {/* cab */}
    <path d="M0 -20 L0 -150 Q0 -230 60 -240 L190 -240 L190 -20 Z" fill={dark ? "#2a1512" : "#a83a2e"} />
    <path d="M20 -150 L20 -210 Q24 -224 60 -226 L130 -226 L130 -150 Z" fill="#0b0c10" />
    <rect x={-8} y={-60} width={30} height={36} fill="#ddd" />
    {head > 0 && <circle cx={6} cy={-80} r={16} fill={`rgba(255,246,220,${head})`} />}
    {/* tank */}
    <rect x={200} y={-250} width={640} height={190} rx={95} fill={dark ? "#1c1f25" : "#b9bec6"} />
    <rect x={200} y={-170} width={640} height={10} fill="#8e949c" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={250 + i * 80} cy={-62} r={dark ? 15 : 9} fill={i < lights ? C.sodium : "#3a2a1a"} opacity={i < lights ? 0.8 + 0.2 * Math.sin(t * 6 + i) : 1} />)}
    {Array.from({ length: 8 }, (_, i) => i < lights && <circle key={`g${i}`} cx={250 + i * 80} cy={-62} r={dark ? 46 : 26} fill={`rgba(255,154,60,${dark ? 0.3 : 0.22})`} />)}
    <rect x={190} y={-60} width={660} height={26} fill="#2a2d33" />
    {[80, 520, 640, 760].map((cx) => <g key={cx}><circle cx={cx} cy={-14} r={40} fill="#0b0c10" /><circle cx={cx} cy={-14} r={16} fill="#55595f" /></g>)}
  </g>
);

const TankerIn: React.FC<{ t: number }> = ({ t }) => {
  const k = rk(t, S(3) - 0.2, W(3, "جایگاه") + 0.6, out3);
  return (
    <AbsoluteFill>
      <Exterior t={t} car={1} push={0.06} litShop={0.15} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="rgba(0,0,0,.35)" />
        <Tanker x={lerp(1200, 180, k)} y={1300} s={0.75} t={t} />
      </svg>
    </AbsoluteFill>
  );
};

/** The driver, full figure (wool hat, leather jacket, flashlight). */
const Driver: React.FC<{ t: number; x: number; y: number; s?: number; shout?: number; beam?: number; beamAng?: number }> = ({ t, x, y, s = 1, shout = 0, beam = 1, beamAng = 30 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {beam > 0 && <path d={`M60 -10 L${60 + Math.cos((beamAng * Math.PI) / 180) * 900} ${-10 + Math.sin((beamAng * Math.PI) / 180) * 900 - 160} L${60 + Math.cos((beamAng * Math.PI) / 180) * 900} ${-10 + Math.sin((beamAng * Math.PI) / 180) * 900 + 160} Z`} fill={`rgba(255,248,220,${0.16 * beam})`} />}
    <path d="M-110 300 L-100 60 Q-90 0 0 -6 Q90 0 100 60 L110 300 Z" fill="#5a3a24" />
    <path d="M-12 0 L12 0 L8 120 L-8 120 Z" fill="#7a3f2a" />
    <ellipse cx={0} cy={-80} rx={58} ry={70} fill={SKIN} />
    <circle cx={-34} cy={-58} r={14} fill="rgba(220,60,60,.4)" /><circle cx={34} cy={-58} r={14} fill="rgba(220,60,60,.4)" />
    <path d="M-60 -110 Q0 -190 60 -110 L62 -96 L-62 -96 Z" fill="#2c2f38" />
    <rect x={-64} y={-104} width={128} height={18} rx={8} fill="#3a3e48" />
    <circle cx={-20} cy={-82} r={6} fill="#1a1410" /><circle cx={20} cy={-82} r={6} fill="#1a1410" />
    <path d="M-34 -48 Q0 -64 34 -48 Q20 -36 0 -40 Q-20 -36 -34 -48 Z" fill="#2a2420" />
    <ellipse cx={0} cy={-28} rx={12} ry={4 + 14 * shout * Math.abs(Math.sin(t * 9))} fill="#3a1010" />
    <rect x={70} y={-30} width={22} height={70} rx={6} fill="#9aa0a6" transform="rotate(-50 80 0)" />
    <circle cx={92} cy={-14} r={22} fill={SKIN} />
    {shout > 0 && <circle cx={-80} cy={-40} r={22} fill={SKIN} />}
    {shout > 0 && [0, 1, 2].map((i) => { const k = (t * 1.2 + i / 3) % 1; return <ellipse key={i} cx={-60 - k * 120} cy={-30 - k * 60} rx={20 + k * 50} ry={14 + k * 30} fill={`rgba(220,230,240,${0.3 * (1 - k)})`} />; })}
  </g>
);

const DriverShout: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Exterior t={t} car={1} push={0.25} litShop={0.15} />
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect width={1080} height={1920} fill="rgba(0,0,0,.45)" />
      <ellipse cx={540} cy={1230} rx={420} ry={60} fill="rgba(255,240,200,.08)" />
      <Driver t={t} x={520} y={900} s={1.35} shout={t >= S(4) - 0.05 && t <= E(4) + 0.2 ? 1 : 0} beamAng={20} />
    </svg>
  </AbsoluteFill>
);

/** Driver close-up. mode: worried | frozen (says your name) | smile (the monitor smile). */
const DriverFace: React.FC<{ t: number; mode: "worried" | "frozen" | "smile"; zoom?: number; glass?: boolean }> = ({ t, mode, zoom = 1, glass }) => {
  const smile = mode === "smile";
  const frozen = mode === "frozen";
  return (
    <AbsoluteFill style={{ background: "#04060a" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><radialGradient id="under" cx="50%" cy="80%" r="70%"><stop offset="0" stopColor="rgba(255,240,200,.25)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient></defs>
        <g transform={`translate(540 860) scale(${zoom}) rotate(${smile ? -5 : 0})`}>
          <path d="M-330 900 L-300 420 Q-200 330 0 320 Q200 330 300 420 L330 900 Z" fill="#4a3020" />
          <ellipse cx={0} cy={0} rx={260} ry={320} fill={smile ? "#bfae9c" : SKIN} />
          {!smile && <><circle cx={-130} cy={70} r={60} fill="rgba(220,60,60,.35)" /><circle cx={130} cy={70} r={60} fill="rgba(220,60,60,.35)" /></>}
          <path d="M-270 -120 Q0 -440 270 -120 L276 -70 L-276 -70 Z" fill="#2c2f38" />
          <rect x={-282} y={-110} width={564} height={70} rx={30} fill="#3a3e48" />
          {smile ? (
            <><ellipse cx={-95} cy={-10} rx={48} ry={60} fill="#000" /><ellipse cx={95} cy={-10} rx={48} ry={60} fill="#000" /></>
          ) : (
            <>
              <ellipse cx={-95} cy={-10} rx={40} ry={frozen ? 40 : 30} fill="#fff" /><ellipse cx={95} cy={-10} rx={40} ry={frozen ? 40 : 30} fill="#fff" />
              <circle cx={frozen ? -95 : -90 + Math.sin(t * 3) * 8} cy={-8} r={frozen ? 12 : 16} fill="#1a1410" /><circle cx={frozen ? 95 : 100 + Math.sin(t * 3) * 8} cy={-8} r={frozen ? 12 : 16} fill="#1a1410" />
              <path d={`M-140 ${-70 - (frozen ? 0 : 10)} L-50 ${-60}`} stroke="#2a2420" strokeWidth={14} strokeLinecap="round" /><path d={`M140 ${-70 - (frozen ? 0 : 10)} L50 -60`} stroke="#2a2420" strokeWidth={14} strokeLinecap="round" />
            </>
          )}
          <path d="M-20 30 Q0 90 24 110 Q0 120 -24 112" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={8} />
          <path d="M-120 150 Q0 110 120 150 Q80 190 0 178 Q-80 190 -120 150 Z" fill="#2a2420" />
          {smile ? (
            <g>
              <path d="M-230 180 Q0 330 230 170 Q0 290 -230 180 Z" fill="#050303" />
              {Array.from({ length: 16 }, (_, i) => { const x = -205 + i * 27; const yy = 192 + Math.sin(((i + 0.5) / 16) * Math.PI) * 70; return <path key={i} d={`M${x} ${yy} l12 0 l-6 22 Z`} fill="#d8d0bd" />; })}
            </g>
          ) : (
            <ellipse cx={0} cy={220} rx={50} ry={frozen ? 34 : 14 + 22 * Math.abs(Math.sin(t * 8))} fill="#3a1010" />
          )}
        </g>
        <rect width={1080} height={1920} fill="url(#under)" />
        {glass && <rect x={30} y={120} width={1020} height={1460} fill="rgba(120,150,180,.07)" stroke="#262c37" strokeWidth={24} />}
        {glass && <path d="M120 200 L300 200 L140 700 Z" fill="rgba(255,255,255,.04)" />}
      </svg>
    </AbsoluteFill>
  );
};

/** Your blank name tag (the name nobody could know). */
const NameTag: React.FC<{ t: number }> = ({ t }) => {
  const a = rk(t, W(6, "هیچ") - 0.25, W(6, "هیچ") + 0.2, back);
  return (
    <AbsoluteFill style={{ background: "#05070c" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={300} width={1080} height={1400} fill={NAVY} />
        <rect x={0} y={760} width={1080} height={40} fill={C.sodium} opacity={0.85} />
        <path d="M540 300 L540 1700" stroke="#141d30" strokeWidth={10} />
        <g transform={`translate(700 980) rotate(-3) scale(${a})`}>
          <rect x={-170} y={-70} width={340} height={140} rx={14} fill="#f2f2ee" stroke="#c9c9c2" strokeWidth={6} />
          <rect x={-140} y={-46} width={80} height={92} rx={8} fill="#d9d9d2" />
          <path d="M-30 -10 L130 -10 M-30 26 L90 26" stroke="#e2e2db" strokeWidth={10} strokeLinecap="round" />
        </g>
      </svg>
      <Chip x={700} y={1180} a={rk(t, W(6, "هیچ") + 0.1, W(6, "هیچ") + 0.4, back)} bg="rgba(20,24,34,.92)" color={C.ice} size={36}>اسم: ـــ (خالی)</Chip>
    </AbsoluteFill>
  );
};

/** The flashlight finds the Paykan at pump 4. */
const BeamOnPaykan: React.FC<{ t: number }> = ({ t }) => {
  const k = rk(t, W(7, "چراغ") - 0.2, W(7, "چهار") + 0.3);
  const bx = lerp(250, 690, k), by = lerp(1300, 1050, k);
  return (
    <AbsoluteFill>
      <Exterior t={t} car={1} push={0.06} litShop={0} />
      <AbsoluteFill style={{ background: `radial-gradient(circle 230px at ${bx}px ${by}px, rgba(0,0,0,0) 0%, rgba(0,0,0,.2) 60%, rgba(0,0,0,.94) 100%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <path d={`M120 1900 L${bx - 120} ${by - 60} L${bx + 120} ${by + 60} Z`} fill="rgba(255,248,220,.08)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Close: the Paykan's rear door opens, hands in your sleeves reach out. */
const Hands: React.FC<{ t: number }> = ({ t }) => {
  const door = rk(t, S(8) - 0.1, W(8, "باز") + 0.5, out3);
  const out = rk(t, W(8, "دست") - 0.3, W(8, "دست", 1) + 0.4, out3);
  const hand = (i: number) => {
    const y = 760 + i * 170, len = lerp(0, 260 + hn(i) * 120, clamp(out * 1.4 - i * 0.15));
    const wob = Math.sin(t * 5 + i) * 8;
    return (
      <g key={i} transform={`translate(${520} ${y + wob})`}>
        <rect x={0} y={-34} width={len} height={68} rx={20} fill={NAVY} />
        <rect x={len * 0.35} y={-34} width={18} height={68} fill={C.sodium} opacity={len > 60 ? 0.85 : 0} />
        {len > 30 && <g transform={`translate(${len} 0)`}>
          <ellipse cx={34} cy={0} rx={44} ry={36} fill="#d8cfc4" />
          {[-26, -9, 9, 26].map((dy, j) => <rect key={j} x={56} y={dy - 7} width={58 - Math.abs(dy) * 0.5} height={14} rx={7} fill="#d8cfc4" />)}
        </g>}
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ background: "#020305" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={-40} y={520} width={1160} height={1000} rx={60} fill="#cfd1cc" />
        <rect x={470} y={600} width={60} height={860} fill="#000" />
        <rect x={60} y={620} width={400} height={360} rx={20} fill="#05070a" />
        {/* the rear door swings toward the camera */}
        <g transform={`translate(1020 600) scale(${1 - door * 0.55} 1)`}><rect x={-490} y={0} width={490} height={860} rx={20} fill="#dcddd8" stroke="#a9aba6" strokeWidth={6} /><rect x={-460} y={30} width={420} height={330} rx={18} fill="#05070a" /><rect x={-430} y={430} width={70} height={20} rx={10} fill="#8e9196" /></g>
        <rect x={530} y={600} width={490 * door * 0.55} height={860} fill="#000" />
        {[0, 1, 2, 3].map(hand)}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(circle 520px at 640px 1000px, rgba(0,0,0,0), rgba(0,0,0,.9))" }} />
    </AbsoluteFill>
  );
};

/** From inside: the driver pounds on the glass; pale figures approach behind him. */
const Pound: React.FC<{ t: number }> = ({ t }) => {
  const hits = [W(9, "مشت") + 0.05, W(9, "شیشه") + 0.1, S(10) + 0.1, W(10, "باز") + 0.05, E(10) + 0.3, E(10) + 0.65];
  const kk = hits.map((h) => t - h).filter((d) => d >= 0 && d < 0.35);
  const shake = kk.length ? Math.sin(kk[0] * 90) * 14 * (1 - kk[0] / 0.35) : 0;
  const near = rk(t, S(9), E(10) + 0.8, (u) => u);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.3}px)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#04060a" />
        {[0, 1, 2, 3].map((i) => <Figure key={i} x={140 + i * 260} y={980 - near * 60} s={0.7 + near * 0.3} fill="rgba(200,210,225,.10)" eyes={0.25 * near} />)}
        <Driver t={t} x={540} y={980} s={1.7} shout={1} beam={0} />
        {[0, 1].map((i) => <g key={i} transform={`translate(${i ? 760 : 320} ${760 + (kk.length && i === (hits.findIndex((h) => t - h >= 0 && t - h < 0.35) % 2) ? -20 : 0)})`}><circle r={46} fill={SKIN} /><rect x={-30} y={-50} width={60} height={22} rx={10} fill="#b07a58" /></g>)}
        {kk.map((d, i) => <circle key={i} cx={540} cy={760} r={40 + d * 600} fill="none" stroke="rgba(200,230,255,.5)" strokeWidth={6 * (1 - d / 0.35)} />)}
        <ellipse cx={540} cy={700} rx={220} ry={90} fill="rgba(210,225,240,.12)" />
        <rect x={30} y={120} width={1020} height={1460} fill="rgba(120,150,180,.07)" stroke="#262c37" strokeWidth={24} />
        <rect x={30} y={1500} width={1020} height={420} fill="#121519" />
      </svg>
    </AbsoluteFill>
  );
};

const NewNote: React.FC<{ t: number }> = ({ t }) => {
  const a1 = rk(t, W(11, "اگه") - 0.1, W(11, "مونه") + 0.3);
  const a2 = rk(t, W(11, "تو", 1) - 0.1, E(11) + 0.2);
  const tremble = Math.sin(t * 31) * 2 + Math.sin(t * 17) * 1.5;
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,230,180,.18), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 120, top: 330, width: 840, height: 880, background: C.paper, transform: `rotate(${-2 + tremble * 0.15}deg) translate(${tremble}px,0)`, boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "110px 70px", direction: "rtl" }}>
        <div style={{ fontFamily: NASTA, fontSize: 92, lineHeight: 2.1, color: C.ink, clipPath: `inset(0 0 0 ${(1 - a1) * 100}%)` }}>اگه بازش کنی، اون می‌مونه…</div>
        <div style={{ fontFamily: NASTA, fontSize: 110, lineHeight: 2.1, color: "#7a0c12", clipPath: `inset(0 0 0 ${(1 - a2) * 100}%)` }}>تو می‌ری.</div>
        <div style={{ position: "absolute", left: 70, bottom: 50, fontFamily: NASTA, fontSize: 40, color: "rgba(27,23,18,.55)", opacity: a2 }}>— خودت</div>
      </div>
    </AbsoluteFill>
  );
};

/** Tanker on the dark road behind the driver: its marker lights die one by one. */
const TankerDark: React.FC<{ t: number }> = ({ t }) => {
  const a = W(13, "چراغ") - 0.1, b = W(13, "خاموش") + 0.3;
  const lights = Math.round(lerp(8, 0, rk(t, a, b, (u) => u)));
  return (
    <AbsoluteFill style={{ background: "#020306" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Stars t={t} n={50} h={900} />
        <Mountains y={1000} />
        <rect y={1040} width={1080} height={880} fill="#0d0b08" />
        <rect y={1200} width={1080} height={160} fill="#111317" />
        <Tanker x={60} y={1320} s={1.05} head={0} lights={lights} t={t} dark />
        <Figure x={540} y={1700} s={1.6} fill="#05060a" />
      </svg>
    </AbsoluteFill>
  );
};

const Choice: React.FC<{ t: number }> = ({ t }) => {
  const q = rk(t, S(14) - 0.1, S(14) + 0.3, back);
  const n4 = rk(t, W(14, "شب") - 0.1, W(14, "شب") + 0.4, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a0607, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 380, width: "100%", fontSize: 96, transform: `scale(${q})` }}>در رو <span style={{ color: C.red }}>باز</span> می‌کنی؟</div>
      <div style={{ position: "absolute", top: 600, width: "100%", display: "flex", justifyContent: "center", gap: 50, transform: `scale(${q})` }}>
        <div style={{ background: "#1f8a4c", borderRadius: 26, padding: "18px 50px", fontSize: 50, transform: `scale(${pulse})` }}>🔓 نجاتش بده</div>
        <div style={{ background: C.red, borderRadius: 26, padding: "18px 50px", fontSize: 50, transform: `scale(${2 - pulse})` }}>🔒 قفل بمونه</div>
      </div>
      <div style={{ position: "absolute", top: 900, width: "100%", opacity: n4, transform: `translateY(${(1 - n4) * 40}px)` }}>
        <div style={{ fontSize: 52, color: C.dim, fontFamily: FONT_TEXT }}>شب چهارم… فردا</div>
        <div style={{ fontSize: 120, color: C.sodium }}>شب ۴ از ۷</div>
        <div style={{ fontSize: 42, color: "#cfd6e2", fontFamily: FONT_TEXT, marginTop: 10 }}>فالو کن که جا نمونی</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: Fog },
  { from: S(2) - 0.25, R: Night3Card },
  { from: S(3) - 0.2, R: TankerIn },
  { from: S(4) - 0.15, R: DriverShout },
  { from: S(5) - 0.2, R: ({ t }) => <DriverFace t={t} mode="worried" zoom={lerp(0.95, 1.05, rk(t, S(5), E(5)))} /> },
  { from: S(6) - 0.2, R: ({ t }) => (t < W(6, "هیچ") - 0.3 ? <DriverFace t={t} mode="frozen" zoom={lerp(1.05, 1.3, rk(t, S(6), W(6, "هیچ")))} /> : <NameTag t={t} />) },
  { from: S(7) - 0.2, R: BeamOnPaykan },
  { from: S(8) - 0.2, R: Hands },
  { from: S(9) - 0.2, R: Pound },
  { from: S(11) - 0.2, R: NewNote },
  { from: S(12) - 0.2, R: ({ t }) => (t < W(12, "لبخند") - 0.2 ? <Pound t={t} /> : <DriverFace t={t} mode="smile" zoom={lerp(1.0, 1.18, rk(t, W(12, "لبخند"), E(12)))} glass />) },
  { from: S(13) - 0.2, R: TankerDark },
  { from: S(14) - 0.25, R: Choice },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const clockAt = (t: number) => {
  if (t < S(2)) return "۰۶:۱۲";
  const m = lerp(40, 58, rk(t, S(2), S(14), (u) => u));
  return `۰۰:${fa(Math.floor(m))}`;
};
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if (t >= S(14) - 0.25 || (t >= S(2) - 0.25 && t < S(3) - 0.2)) return null;
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />{t < S(2) ? "صبح بعد از شب ۲" : "شب ۳ از ۷"}</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{clockAt(t)}<span style={{ fontSize: 34, color: C.dim }}>{t < S(2) ? " صبح" : " بامداد"}</span></div>
      {t >= S(2) && <div style={{ fontSize: 26, color: C.red }}>آب: ۳ بطری</div>}
    </div>
  );
};
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6 || t >= S(14) - 0.25 || cur.si === 1) return null; // the fog message is the caption of line 2
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const v = cur.v;
  const color = v === "bill" ? "#ffd8a0" : v === "twin" ? "#ff8a8a" : "#ffffff";
  const quote = v !== "brian";
  return (
    <div style={{ position: "absolute", left: 60, top: 1330, width: 960, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 72, lineHeight: 1.35, textShadow: "0 4px 0 #000, 0 0 24px rgba(0,0,0,.9)" }}>
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

export const V16_LOOK = [0.2, 5.0, 10.6, 11.6, 14.5, 17.5, 21.0, 25.0, 28.5, 33.0, 36.5, 41.0, 46.0, 50.0, 54.0, 57.5, 60.5, 64.0, 69.0, 74.0, 79.0, 82.5, 86.5, 90.5];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V16_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V16: React.FC = () => (
  <>
    <Composition id="V16" component={Video} durationInFrames={V16_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v16/mix.wav" }} />
    <Composition id="V16-Silent" component={Video} durationInFrames={V16_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V16-Look" component={Look} durationInFrames={V16_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
