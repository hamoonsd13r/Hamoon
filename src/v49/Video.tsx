// V49 · «شبِ آخرِ ستاد» — what-if political satire reel 9:16 (~77 s), the user's own voice (ElevenLabs "Mark").
// Format inspired by @parcham.cartoon with the creator's permission (headline band · 16:9 cartoon window · big
// word captions), but our own script, characters and scenes. Characters are fictional types (no real person
// speaks); the only real reference is a closing fact about Assad's flight (8 Dec 2024), shown as a map, no face.
// Voice: tools/v49-voice.py → public/v49/vo.wav + src/v49/vo.json · mix: tools/v49-mix.mjs
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import vo from "./vo.json";

const FPS = 30, W = 1080, H = 1920;
const INK = "#0E1116", SAFF = "#FFC23D", CREAM = "#F6EFE4", RED = "#E2463B", SKIN = "#E6B089", SKIN2 = "#D59A73";
const WIN = { y: 452, h: 608 }; // the 16:9 cartoon window (1920×1080 drawing scaled to 1080 wide)

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v49 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H49Black", "fonts/Vazirmatn-Black.ttf"], ["H49Bold", "fonts/Vazirmatn-Bold.ttf"], ["H49Num", "fonts/Lalezar-Regular.ttf"], ["H49Mono", "fonts/ChakraPetch-SemiBold.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── math */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const bo = (x: number) => { x = clamp(x); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/* ───────── timing */
type VW = { w: string; s: number; e: number; line: number };
const V = vo as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const bare = (x: string) => x.replace(/[،.؟!?:«»]/g, "");
const wd = (line: number, word: string, occ = 1) => {
  const ws = V.words.filter((x) => x.line === line);
  const w = ws.filter((x) => bare(x.w) === word)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(word))[occ - 1];
  if (!w) throw new Error(`v49: word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => V.segs.find((s) => s.n === n)!.start;
const END = +(V.total + 1.6).toFixed(2);
/** talking: mouth openness while the given span is spoken */
const talk = (t: number, a: number, b: number) => (t > a && t < b ? 0.3 + 0.7 * Math.abs(Math.sin(t * 19)) * (0.6 + 0.4 * Math.sin(t * 7)) : 0);
const blink = (t: number, seed = 0) => { const p = (t + seed * 1.37) % 3.4; return p < 0.12 ? 0.1 : 1; };

/* ───────── characters (feet at 0,0 · ~600 units tall) */
type Pose = { hl?: [number, number]; hr?: [number, number]; mouth?: number; look?: number; t: number; seed?: number; walk?: number; sad?: boolean; dark?: boolean };
const Arm: React.FC<{ from: [number, number]; to: [number, number]; c: string; w?: number }> = ({ from, to, c, w = 34 }) => (
  <g><line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={c} strokeWidth={w} strokeLinecap="round" /><circle cx={to[0]} cy={to[1]} r={19} fill={SKIN} /></g>
);
const Face: React.FC<Pose & { y?: number }> = ({ t, seed = 0, mouth = 0, look = 0, sad, y = -548 }) => {
  const b = blink(t, seed);
  return (
    <g>
      <ellipse cx={-24 + look * 6} cy={y} rx={7} ry={8 * b} fill="#2a1d18" />
      <ellipse cx={24 + look * 6} cy={y} rx={7} ry={8 * b} fill="#2a1d18" />
      <path d={sad ? `M-38 ${y - 22} L-12 ${y - 28} M12 ${y - 28} L38 ${y - 22}` : `M-38 ${y - 26} L-12 ${y - 24} M12 ${y - 24} L38 ${y - 26}`} stroke="#3a2a22" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={0} cy={y + 40} rx={13} ry={2 + 11 * mouth} fill="#5a2a22" />
    </g>
  );
};
const Legs: React.FC<{ c: string; shoe: string; walk?: number; t: number }> = ({ c, shoe, walk = 0, t }) => {
  const sw = walk ? Math.sin(t * 9) * 16 * walk : 0;
  return (
    <g>
      <g transform={`rotate(${sw} -30 -230)`}><rect x={-54} y={-232} width={46} height={222} rx={14} fill={c} /><ellipse cx={-34} cy={-8} rx={36} ry={14} fill={shoe} /></g>
      <g transform={`rotate(${-sw} 30 -230)`}><rect x={8} y={-232} width={46} height={222} rx={14} fill={c} /><ellipse cx={34} cy={-8} rx={36} ry={14} fill={shoe} /></g>
    </g>
  );
};
const HajAgha: React.FC<Pose> = (p) => {
  const hl = p.hl ?? [-112, -270], hr = p.hr ?? [112, -270];
  return (
    <g>
      <Legs c="#4b4f57" shoe="#1f1b18" walk={p.walk} t={p.t} />
      <path d="M-120 -470 Q0 -500 120 -470 L150 -150 L-150 -150 Z" fill="#5b3b2a" />
      <rect x={-48} y={-470} width={96} height={320} fill="#8c8f95" />
      <circle cx={0} cy={-380} r={6} fill="#5b3b2a" /><circle cx={0} cy={-330} r={6} fill="#5b3b2a" />
      <Arm from={[-100, -440]} to={hl} c="#5b3b2a" w={40} />
      <Arm from={[100, -440]} to={hr} c="#5b3b2a" w={40} />
      <rect x={-22} y={-500} width={44} height={40} fill={SKIN2} />
      <circle cx={0} cy={-548} r={72} fill={SKIN} />
      <path d="M-66 -545 Q-70 -440 0 -415 Q70 -440 66 -545 Q40 -500 0 -500 Q-40 -500 -66 -545 Z" fill="#a7a9ad" />
      <Face {...p} />
      <circle cx={-24} cy={-548} r={20} fill="none" stroke="#2a2a2a" strokeWidth={5} /><circle cx={24} cy={-548} r={20} fill="none" stroke="#2a2a2a" strokeWidth={5} /><line x1={-4} y1={-548} x2={4} y2={-548} stroke="#2a2a2a" strokeWidth={5} />
      <ellipse cx={0} cy={-612} rx={80} ry={36} fill="#f3f1ec" /><ellipse cx={0} cy={-640} rx={66} ry={32} fill="#ffffff" /><path d="M-70 -620 Q0 -600 70 -632" stroke="#d9d6cf" strokeWidth={5} fill="none" />
    </g>
  );
};
const Sajjad: React.FC<Pose & { jacket?: number }> = (p) => {
  const hl = p.hl ?? [-108, -270], hr = p.hr ?? [108, -270], jk = p.jacket ?? 1;
  const shirt = jk > 0.5 ? "#59683d" : "#e9e5dc";
  return (
    <g>
      <Legs c="#3b3f2e" shoe="#151515" walk={p.walk} t={p.t} />
      <rect x={-100} y={-470} width={200} height={250} rx={42} fill={shirt} />
      {jk > 0.5 && <><rect x={-70} y={-410} width={46} height={40} rx={6} fill="#4c5934" /><rect x={24} y={-410} width={46} height={40} rx={6} fill="#4c5934" /><line x1={0} y1={-460} x2={0} y2={-230} stroke="#4c5934" strokeWidth={5} /></>}
      <Arm from={[-92, -440]} to={hl} c={shirt} />
      <Arm from={[92, -440]} to={hr} c={shirt} />
      <rect x={-22} y={-500} width={44} height={40} fill={SKIN2} />
      {jk > 0.5 && <path d="M-80 -478 L80 -478 L0 -390 Z" fill="url(#chafiyeh)" />}
      <circle cx={0} cy={-548} r={70} fill={SKIN} />
      <path d="M-62 -540 Q-66 -470 0 -462 Q66 -470 62 -540 Q60 -505 0 -500 Q-60 -505 -62 -540 Z" fill="#231a16" />
      <Face {...p} />
      <path d="M-72 -560 Q-80 -640 0 -630 Q80 -640 72 -560 Q60 -600 0 -598 Q-60 -600 -72 -560 Z" fill="#1d1612" />
    </g>
  );
};
const Father: React.FC<Pose> = (p) => {
  const hl = p.hl ?? [-108, -270], hr = p.hr ?? [108, -270];
  return (
    <g>
      <Legs c="#4a4036" shoe="#2a201a" walk={p.walk} t={p.t} />
      <rect x={-104} y={-468} width={208} height={250} rx={40} fill="#6e5b45" />
      <path d="M-34 -468 L0 -380 L34 -468 Z" fill="#efe9de" />
      <Arm from={[-96, -440]} to={hl} c="#6e5b45" />
      <Arm from={[96, -440]} to={hr} c="#6e5b45" />
      <rect x={-22} y={-500} width={44} height={40} fill={SKIN2} />
      <circle cx={0} cy={-548} r={70} fill={SKIN} />
      <path d="M-70 -560 Q-74 -600 -50 -610 L-46 -560 Z M70 -560 Q74 -600 50 -610 L46 -560 Z" fill="#c9c6c0" />
      <Face {...p} sad />
      <path d="M-34 -505 Q0 -520 34 -505 Q20 -492 0 -498 Q-20 -492 -34 -505 Z" fill="#c9c6c0" />
      <path d="M-14 -470 Q0 -462 14 -470" stroke="#8a5a44" strokeWidth={0} />
    </g>
  );
};
const Person: React.FC<{ c: string; hair: string; fist?: number; t: number; seed: number; phone?: boolean }> = ({ c, hair, fist = 0, t, seed, phone }) => {
  const up = fist * (0.75 + 0.25 * Math.sin(t * 6 + seed));
  return (
    <g>
      <rect x={-46} y={-230} width={40} height={230} rx={12} fill="#2c2f3a" /><rect x={6} y={-230} width={40} height={230} rx={12} fill="#2c2f3a" />
      <rect x={-90} y={-460} width={180} height={250} rx={40} fill={c} />
      <line x1={80} y1={-430} x2={lerp(100, 120, up)} y2={lerp(-260, -640, up)} stroke={c} strokeWidth={32} strokeLinecap="round" />
      <circle cx={lerp(100, 120, up)} cy={lerp(-260, -640, up)} r={20} fill={SKIN} />
      {phone && <rect x={lerp(100, 110, up) - 14} y={lerp(-260, -660, up) - 50} width={28} height={50} rx={5} fill="#fff6c8" style={{ filter: "drop-shadow(0 0 10px #fff3a0)" }} />}
      <line x1={-80} y1={-430} x2={-100} y2={-260} stroke={c} strokeWidth={32} strokeLinecap="round" />
      <circle cx={0} cy={-540} r={64} fill={SKIN} />
      <path d={`M-64 -545 Q-60 -620 0 -616 Q60 -620 64 -545 Q${30 + seed * 3} -585 0 -585 Q-30 -585 -64 -545 Z`} fill={hair} />
    </g>
  );
};
const Rifle: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-10} width={300} height={20} rx={6} fill="#26241f" /><rect x={40} y={-10} width={90} height={34} rx={6} fill="#4a3a2a" /><rect x={-40} y={8} width={22} height={50} rx={5} fill="#26241f" /><rect x={-200} y={-5} width={60} height={10} fill="#26241f" />
  </g>
);

/* ───────── backgrounds */
const Defs = () => (
  <defs>
    <pattern id="chafiyeh" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#f1ede4" /><rect width="8" height="8" fill="#222" /><rect x="8" y="8" width="8" height="8" fill="#222" /></pattern>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1430" /><stop offset="1" stopColor="#24305a" /></linearGradient>
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4a7a" /><stop offset="0.6" stopColor="#d98a6a" /><stop offset="1" stopColor="#f2c48d" /></linearGradient>
    <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b8a7a" /><stop offset="1" stopColor="#5f6d5f" /></linearGradient>
    <linearGradient id="hotel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a2f35" /><stop offset="1" stopColor="#4d1d22" /></linearGradient>
  </defs>
);
const Skyline: React.FC<{ t: number; lit?: number; y?: number; seed?: number; milad?: boolean }> = ({ t, lit = 1, y = 1080, seed = 0, milad = true }) => (
  <g>
    {milad && <g fill="#121a33"><rect x={1380} y={250} width={34} height={y - 250} /><ellipse cx={1397} cy={360} rx={80} ry={46} /><rect x={1392} y={110} width={10} height={150} /><circle cx={1397} cy={104} r={8} fill={RED} opacity={Math.floor(t * 2) % 2 ? 1 : 0.3} /></g>}
    {Array.from({ length: 16 }, (_, i) => {
      const w = 90 + hash(i + seed) * 90, h = 180 + hash(i + 9 + seed) * 330, x = i * 125 - 20;
      return (<g key={i}><rect x={x} y={y - h} width={w} height={h} fill={i % 2 ? "#18213f" : "#1c2648"} />
        {Array.from({ length: 12 }, (_, k) => { const wx = x + 14 + (k % 3) * 26, wy = y - h + 20 + Math.floor(k / 3) * 44; return wy < y - 20 && hash(i * 31 + k + seed) < 0.55 * lit ? <rect key={k} x={wx} y={wy} width={14} height={20} fill="#ffd37a" opacity={0.8} /> : null; })}
      </g>);
    })}
  </g>
);
const Domes: React.FC<{ y: number; s?: number }> = ({ y, s = 1 }) => (
  <g transform={`translate(0 ${y}) scale(${s})`}>
    <rect x={300} y={-260} width={900} height={260} fill="#2b2433" />
    {[[380, "#c0392b"], [540, "#2e8b57"], [700, "#d4a017"], [860, "#2e6fb5"], [1020, "#c0392b"]].map(([x, c], i) => (
      <g key={i}><rect x={(x as number) - 40} y={-420 - (i % 2) * 60} width={80} height={180 + (i % 2) * 60} fill="#3a2f40" />
        <path d={`M${(x as number) - 60} ${-420 - (i % 2) * 60} Q${x} ${-560 - (i % 2) * 60} ${(x as number) + 60} ${-420 - (i % 2) * 60} Z`} fill={c as string} />
        <rect x={(x as number) - 3} y={-600 - (i % 2) * 60} width={6} height={60} fill="#d4a017" /></g>
    ))}
  </g>
);
const Snow: React.FC<{ t: number; n?: number; x0?: number; x1?: number; y0?: number; y1?: number }> = ({ t, n = 60, x0 = 0, x1 = 1920, y0 = 0, y1 = 1080 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = x0 + ((hash(i) * (x1 - x0) + Math.sin(t * 1.3 + i) * 20) % (x1 - x0)), y = y0 + ((hash(i + 50) * (y1 - y0) + t * (60 + hash(i + 3) * 60)) % (y1 - y0)); return <circle key={i} cx={x} cy={y} r={3 + hash(i + 7) * 4} fill="#fff" opacity={0.85} />; })}</g>
);
const Tag: React.FC<{ t: number; t0: number; text: string }> = ({ t, t0, text }) => {
  const k = bo(prog(t, t0, t0 + 0.3));
  return t < t0 ? null : (
    <g transform={`translate(1860 70) scale(${k})`}>
      <rect x={-24 - text.length * 33} y={-44} width={text.length * 33 + 48} height={88} rx={14} fill="#11151c" opacity={0.85} stroke={SAFF} strokeWidth={3} />
      <text x={-6} y={18} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={54} fill={SAFF}>{text}</text>
    </g>
  );
};
const Bubble: React.FC<{ t: number; t0: number; x: number; y: number; text: string; w?: number; dir?: 1 | -1; size?: number }> = ({ t, t0, x, y, text, w = 620, dir = 1, size = 44 }) => {
  if (t < t0) return null;
  const k = bo(prog(t, t0, t0 + 0.3));
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-w / 2} y={-60} width={w} height={120} rx={30} fill="#fff" />
      <path d={`M${dir * 40} 56 L${dir * 90} 110 L${dir * 100} 56 Z`} fill="#fff" />
      <text x={0} y={16} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={size} fill="#1a1a1a">{text}</text>
    </g>
  );
};
const Phone: React.FC<{ x: number; y: number; s?: number; children: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-230} y={-440} width={460} height={880} rx={56} fill="#15171c" />
    <rect x={-210} y={-410} width={420} height={820} rx={40} fill="#f4f1ea" />
    <rect x={-60} y={-430} width={120} height={22} rx={11} fill="#15171c" />
    {children}
  </g>
);

/* ───────── scenes (each draws a 1920×1080 picture at time t) */
type Sc = { a: number; b: number; tr?: "cut" | "wipe" | "pop" | "black"; r: (t: number) => React.ReactNode };
const T = {
  fall: 0, jet: S(2) - 0.05, guard: S(3) - 0.05, voice: S(4) - 0.05, office: wd(4, "تهران") - 0.05, moscow: S(6) - 0.05, street: S(9) - 0.05,
  trash: S(14) - 0.05, dawn: S(17) - 0.05, door: S(20) - 0.05, talk: S(23) - 0.05, down: wd(23, "سجاد") - 0.05, court: S(25) - 0.05,
  live: S(26) - 0.05, real: wd(26, "خیالیه") - 0.05, ask: S(29) - 0.05,
};
const SC: Sc[] = [
  /* regime falls: night Tehran, breaking-news bar */
  { a: T.fall, b: T.jet, tr: "pop", r: (t) => (<>
    <rect width={1920} height={1080} fill="url(#night)" />
    <circle cx={300} cy={180} r={60} fill="#f4ecd0" opacity={0.9} />
    <Skyline t={t} lit={1 - 0.5 * prog(t, 0.3, 1.2)} />
    <g transform={`translate(0 ${lerp(140, 0, eo(prog(t, 0.05, 0.35)))})`}>
      <rect x={0} y={930} width={1920} height={150} fill={RED} />
      <rect x={1560} y={930} width={360} height={150} fill="#8e1d16" />
      <text x={1740} y={1028} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={58} fill="#fff">خبر فوری</text>
      <text x={1500} y={1030} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={66} fill="#fff">رژیم سقوط کرد</text>
    </g>
  </>) },
  /* the jet: suitcases of dollars, take-off to Moscow */
  { a: T.jet, b: T.guard, tr: "cut", r: (t) => {
    const tk = wd(2, "پرواز"), up = eio(prog(t, tk, T.guard)), walk = prog(t, T.jet, wd(2, "سوارِ"));
    return (<>
      <rect width={1920} height={1080} fill="url(#night)" />
      <Skyline t={t} lit={0.5} y={820} seed={4} milad={false} />
      <rect x={0} y={820} width={1920} height={260} fill="#2a2f3a" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 260 + 40} y={940} width={140} height={14} fill="#f1d27a" opacity={0.7} />)}
      <g transform={`translate(${lerp(980, 2300, up)} ${lerp(800, 120, up)}) rotate(${-14 * up})`}>
        <path d="M-420 -40 Q-460 0 -420 40 L380 50 Q470 40 480 0 Q470 -40 380 -50 Z" fill="#e9ecf1" />
        <path d="M-60 0 L-260 210 L-180 210 L60 0 Z" fill="#cfd5de" /><path d="M300 -40 L420 -190 L460 -190 L400 -40 Z" fill="#cfd5de" />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-280 + i * 90} cy={-6} r={14} fill="#5c7aa6" />)}
        {up < 0.05 && <rect x={-380} y={36} width={60} height={160} fill="#b9bfc9" transform="skewX(-25)" />}
      </g>
      {t < tk + 0.1 && <g transform={`translate(${lerp(1500, 1180, walk)} 1030) scale(0.92)`}>
        <HajAgha t={t} walk={walk < 1 ? 1 : 0} hl={[-150, -250]} hr={[150, -250]} seed={1} />
        {t >= wd(2, "چمدونِ") && [-1, 1].map((d) => <g key={d} transform={`translate(${d * 200} -180) scale(${bo(prog(t, wd(2, "چمدونِ"), wd(2, "چمدونِ") + 0.3))})`}><rect x={-70} y={-60} width={140} height={160} rx={16} fill="#6b4226" /><rect x={-30} y={-90} width={60} height={34} rx={10} fill="none" stroke="#3a2414" strokeWidth={10} /><text x={0} y={60} textAnchor="middle" fontFamily="H49Num" fontSize={110} fill="#7ed47b">$</text></g>)}
      </g>}
      {t >= wd(2, "مسکو") && <Tag t={t} t0={wd(2, "مسکو")} text="مقصد: مسکو" />}
    </>);
  } },
  /* Sajjad on guard at the HQ door */
  { a: T.guard, b: T.voice, tr: "cut", r: (t) => (<>
    <rect width={1920} height={1080} fill="url(#night)" />
    <rect x={260} y={180} width={1400} height={900} fill="#3d4352" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={330 + (i % 5) * 260} y={240 + Math.floor(i / 5) * 210} width={150} height={130} fill="#1b2030" />)}
    <rect x={820} y={620} width={280} height={460} fill="#2a2016" /><circle cx={1070} cy={860} r={10} fill={SAFF} />
    <rect x={760} y={540} width={400} height={74} rx={8} fill="#1d5a3a" /><text x={960} y={593} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={50} fill="#fff">ستاد</text>
    <rect x={1500} y={380} width={14} height={700} fill="#2b2f3a" /><circle cx={1507} cy={380} r={30} fill="#ffe7a6" opacity={0.6 + 0.4 * (Math.floor(t * 7) % 5 ? 1 : 0)} />
    <g transform="translate(1320 1075) scale(1.12)"><Sajjad t={t} seed={2} hl={[-60, -330]} hr={[60, -330]} look={-1} /><Rifle x={0} y={-340} rot={-35} s={0.9} /></g>
    <Tag t={t} t0={T.guard} text="تهران" />
  </>) },
  /* the last voice message on Sajjad's phone */
  { a: T.voice, b: T.office, tr: "pop", r: (t) => {
    const play = prog(t, wd(4, "حاج‌آقا"), wd(4, "تهران") - 0.2);
    return (<>
      <rect width={1920} height={1080} fill="#2b3340" />
      <g transform="translate(1340 1080) scale(0.95)"><Sajjad t={t} seed={2} hl={[-40, -420]} hr={[60, -300]} look={1} /></g>
      <Phone x={760} y={560} s={1.05}>
        <rect x={-210} y={-410} width={420} height={110} rx={40} fill="#1d5a3a" /><text x={150} y={-340} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={40} fill="#fff">حاج‌آقا</text>
        <g transform="translate(20 -120)"><rect x={-170} y={-50} width={360} height={100} rx={36} fill="#dff3d7" />
          <circle cx={140} cy={0} r={28} fill="#1d5a3a" /><path d={play > 0 && play < 1 ? "M130 -12 h7 v24 h-7z M144 -12 h7 v24 h-7z" : "M132 -14 L154 0 L132 14 Z"} fill="#fff" />
          {Array.from({ length: 22 }, (_, i) => { const h = 10 + hash(i) * 50; return <rect key={i} x={90 - i * 12} y={-h / 2} width={6} height={h} rx={3} fill={i / 22 < play ? "#1d5a3a" : "#9ab59a"} />; })}</g>
        {t >= wd(4, "تا") && <g transform={`translate(0 60) scale(${bo(prog(t, wd(4, "تا"), wd(4, "تا") + 0.3))})`}><rect x={-190} y={-60} width={380} height={150} rx={30} fill="#fff" stroke="#d8d2c6" strokeWidth={3} /><text x={160} y={-6} textAnchor="start" direction="rtl" fontFamily="H49Bold" fontSize={34} fill="#222">تا من برمی‌گردم،</text><text x={160} y={52} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={40} fill={RED}>هیچ‌جا نمی‌ری.</text></g>}
      </Phone>
    </>);
  } },
  /* 11 pm: Sajjad turns the HQ lights off */
  { a: T.office, b: T.moscow, tr: "wipe", r: (t) => {
    const off = prog(t, wd(5, "خاموش"), wd(5, "خاموش") + 0.12);
    return (<>
      <rect width={1920} height={1080} fill="url(#room)" />
      <rect x={0} y={860} width={1920} height={220} fill="#4a4036" />
      <rect x={180} y={160} width={420} height={340} fill="#0b1430" stroke="#3a3328" strokeWidth={20} /><circle cx={480} cy={250} r={36} fill="#f4ecd0" />
      <rect x={1340} y={380} width={220} height={480} fill="#8b8f86" />{[0, 1, 2].map((i) => <rect key={i} x={1360} y={410 + i * 150} width={180} height={120} fill="#9fa39a" />)}
      <rect x={760} y={640} width={520} height={30} fill="#5a4330" /><rect x={790} y={670} width={30} height={190} fill="#5a4330" /><rect x={1220} y={670} width={30} height={190} fill="#5a4330" />
      <rect x={860} y={560} width={110} height={80} fill="#e9e1c9" /><rect x={990} y={590} width={140} height={50} fill="#c9b892" />
      <rect x={1650} y={480} width={60} height={90} rx={8} fill="#e9e6df" /><rect x={1672} y={500 + (off > 0 ? 36 : 0)} width={16} height={24} fill="#999" />
      <g transform="translate(1500 1080) scale(1.12)"><Sajjad t={t} seed={2} look={1} hr={[130 + 20 * eo(prog(t, wd(5, "خاموش") - 0.4, wd(5, "خاموش"))), -560]} /></g>
      <rect width={1920} height={1080} fill="#050812" opacity={0.86 * off} />
      {off > 0 && <path d="M180 500 L600 500 L1100 1080 L560 1080 Z" fill="#9fb4ff" opacity={0.12 * off} />}
      {off > 0 && <g opacity={off}><ellipse cx={1520} cy={622} rx={6} ry={7 * blink(t, 3)} fill="#fff" /><ellipse cx={1559} cy={622} rx={6} ry={7 * blink(t, 3)} fill="#fff" /></g>}
      <Tag t={t} t0={T.office + 0.05} text={`تهران · ${fa("23:00")}`} />
    </>);
  } },
  /* Moscow: snow, Red Square domes, coffee goes cold */
  { a: T.moscow, b: T.street, tr: "wipe", r: (t) => {
    const cold = prog(t, wd(8, "سرد"), wd(8, "سرد") + 0.8), sip = prog(t, wd(8, "قهوه‌ش") - 0.2, wd(8, "قهوه‌ش") + 0.3);
    return (<>
      <rect width={1920} height={1080} fill="url(#hotel)" />
      <rect x={120} y={120} width={1080} height={700} fill="#2d3550" stroke="#c9a96a" strokeWidth={22} />
      <svg x={130} y={130} width={1060} height={680} viewBox="0 0 1060 680"><rect width={1060} height={680} fill="#3a4466" /><Domes y={680} s={0.9} /><Snow t={t} n={70} x1={1060} y1={680} /></svg>
      <line x1={660} y1={120} x2={660} y2={820} stroke="#c9a96a" strokeWidth={14} />
      <rect x={0} y={900} width={1920} height={180} fill="#3a1418" />
      <g transform="translate(1480 1085) scale(1.15)"><HajAgha t={t} seed={1} look={-1} hl={[-150, -260]} hr={[lerp(110, 40, sip), lerp(-300, -470, sip)]} mouth={cold > 0.3 && cold < 0.8 ? 0.6 : 0} />
        <g transform={`translate(${lerp(110, 40, sip)} ${lerp(-330, -500, sip)})`}><rect x={-26} y={-30} width={52} height={56} rx={8} fill="#fff" /><path d="M26 -16 q22 4 0 26" stroke="#fff" strokeWidth={8} fill="none" />
          {cold < 1 && [0, 1, 2].map((i) => <path key={i} d={`M${-12 + i * 12} -40 q10 -${20 + 10 * Math.sin(t * 4 + i)} 0 -50`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7 * (1 - cold)} />)}
          {cold > 0.5 && <text x={44} y={-50} fontFamily="H49Num" fontSize={60} fill="#bfe6ff">❄</text>}</g></g>
      <Tag t={t} t0={T.moscow + 0.05} text="مسکو · همون ساعت" />
    </>);
  } },
  /* midnight: the crowd outside, Sajjad behind the blinds, the neighbour he reported */
  { a: T.street, b: T.trash, tr: "cut", r: (t) => {
    const tK = wd(11, "شناخت"), tR = wd(13, "گزارشش"), zoom = eio(prog(t, tK - 0.2, tK + 0.6));
    return (<>
      <g transform={`translate(${-640 * zoom} ${-160 * zoom}) scale(${1 + 0.5 * zoom})`}>
        <rect width={1920} height={1080} fill="url(#night)" />
        <Skyline t={t} lit={0.4} y={760} seed={8} />
        <rect x={0} y={760} width={1920} height={320} fill="#2b2e36" />
        {Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${420 + i * 165 + Math.sin(t * 2 + i) * 6} ${1060 + (i % 2) * 40}) scale(0.78)`}><Person c={["#a33", "#3a6b8c", "#c58a2a", "#5b7f4a", "#7a4a8c"][i % 5]} hair={i % 3 ? "#1b1410" : "#333"} fist={t > T.street + 0.3 ? 1 : 0} t={t} seed={i} phone={i % 3 === 1} /></g>)}
        {t >= tK && <circle cx={1130} cy={640} r={110} fill="none" stroke={SAFF} strokeWidth={10} opacity={eo(prog(t, tK, tK + 0.3))} />}
        {[0, 1, 2].map((i) => t > T.street + 0.4 + i * 0.3 && <text key={i} x={500 + i * 420} y={330 + (i % 2) * 40} fontFamily="H49Black" fontSize={70} fill="#fff" opacity={0.25 + 0.2 * Math.sin(t * 5 + i)}>!!!</text>)}
      </g>
      <rect x={0} y={0} width={420} height={1080} fill="#3d4352" />
      <rect x={60} y={260} width={300} height={400} fill="#0b1430" />
      <g transform="translate(210 1000) scale(0.62)"><Sajjad t={t} seed={2} look={1} sad hl={[-100, -560]} hr={[100, -560]} /></g>
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={60} y={270 + i * 50} width={300} height={22} fill="#c9c2b0" opacity={i === 5 ? 0 : 0.95} />)}
      {t >= tR && <g transform={`translate(1300 470) rotate(-4) scale(${bo(prog(t, tR, tR + 0.3))})`}>
        <rect x={-260} y={-200} width={520} height={400} rx={12} fill="#e8d9a8" /><rect x={-260} y={-240} width={220} height={60} rx={12} fill="#e8d9a8" />
        <rect x={60} y={-150} width={150} height={180} fill="#cfc6ae" /><g transform="translate(135 20) scale(0.28)"><Person c="#3a6b8c" hair="#1b1410" t={0} seed={1} /></g>
        <text x={20} y={-110} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={46} fill="#3a2a10">گزارش</text>
        <text x={20} y={-40} textAnchor="start" direction="rtl" fontFamily="H49Bold" fontSize={32} fill="#3a2a10">همسایه‌ی روبه‌رو</text>
        <text x={20} y={20} textAnchor="start" direction="rtl" fontFamily="H49Bold" fontSize={32} fill="#3a2a10">گزارش‌دهنده: سجاد</text>
        <g transform={`translate(-120 120) rotate(-12) scale(${lerp(2, 1, eo(prog(t, tR + 0.3, tR + 0.45)))})`} opacity={prog(t, tR + 0.3, tR + 0.4)}><rect x={-110} y={-40} width={220} height={80} rx={10} fill="none" stroke={RED} strokeWidth={8} /><text x={0} y={18} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={44} fill={RED}>محرمانه</text></g>
      </g>}
      <Tag t={t} t0={T.street + 0.05} text="تهران · نیمه‌شب" />
    </>);
  } },
  /* Moscow: the Iranian phone into the bin, a new SIM */
  { a: T.trash, b: T.dawn, tr: "wipe", r: (t) => {
    const th = wd(15, "انداخت"), u = prog(t, th - 0.1, th + 0.5), tSim = wd(16, "سیم‌کارتِ");
    const px = lerp(1240, 620, u), py = 560 - Math.sin(u * Math.PI) * 300 + u * 240;
    return (<>
      <rect width={1920} height={1080} fill="url(#hotel)" />
      <rect x={120} y={120} width={640} height={520} fill="#3a4466" stroke="#c9a96a" strokeWidth={18} />
      <svg x={130} y={130} width={620} height={500} viewBox="0 0 1060 680"><Domes y={680} s={0.9} /><Snow t={t} n={40} x1={1060} y1={680} /></svg>
      <rect x={0} y={900} width={1920} height={180} fill="#3a1418" />
      <g transform={`translate(600 980) rotate(${kickRot(t, th + 0.4)})`}><path d="M-90 -200 L90 -200 L70 0 L-70 0 Z" fill="#7d8590" /><rect x={-100} y={-220} width={200} height={26} rx={8} fill="#5d646e" /></g>
      <g transform="translate(1420 1085) scale(1.12)"><HajAgha t={t} seed={1} look={-1} hl={[-140, -260]} hr={u > 0 ? [-60, -520] : [130, -520]} /></g>
      {u < 1 && <g transform={`translate(${px} ${py}) rotate(${u * 540})`}><rect x={-30} y={-55} width={60} height={110} rx={10} fill="#15171c" /><rect x={-24} y={-46} width={48} height={88} rx={6} fill="#2f6b4a" /></g>}
      {t >= tSim && <g transform={`translate(1100 330) scale(${bo(prog(t, tSim, tSim + 0.3))})`}><path d="M-120 -80 L80 -80 L120 -40 L120 80 L-120 80 Z" fill="#e3e6ea" /><rect x={-60} y={-30} width={110} height={80} rx={10} fill="#d4a017" /><text x={0} y={-100} textAnchor="middle" fontFamily="H49Mono" fontSize={50} fill="#fff">+7 · NEW</text></g>}
      <Tag t={t} t0={T.trash + 0.05} text="مسکو" />
    </>);
  } },
  /* dawn: the radio crackles, nobody answers */
  { a: T.dawn, b: T.door, tr: "black", r: (t) => {
    const tS = wd(18, "خش‌خش"), tN = wd(19, "هیچ‌کس"), d = prog(t, T.dawn, T.door);
    return (<>
      <rect width={1920} height={1080} fill="url(#room)" />
      <rect x={180} y={160} width={420} height={340} fill="url(#dawn)" stroke="#3a3328" strokeWidth={20} />
      <rect width={1920} height={1080} fill="#050812" opacity={0.6 * (1 - d)} />
      <rect x={600} y={700} width={900} height={40} fill="#5a4330" />
      <g transform="translate(1050 690)"><rect x={-70} y={-260} width={140} height={260} rx={24} fill="#202327" /><rect x={30} y={-360} width={20} height={110} rx={8} fill="#202327" /><rect x={-46} y={-220} width={92} height={70} rx={8} fill="#7fae6f" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-40} y={-120 + i * 18} width={80} height={6} fill="#444" />)}
        {t >= tS && t < tS + 1.2 && Array.from({ length: 3 }, (_, i) => <path key={i} d={`M${90 + i * 40} -300 q20 ${-30 + 60 * hash(Math.floor(t * 20) + i)} 0 60 q-20 30 0 60`} stroke={SAFF} strokeWidth={8} fill="none" />)}
        {t >= tS && t < tS + 1.2 && <text x={-120} y={-300} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={64} fill={SAFF}>خش‌خش…</text>}</g>
      <g transform="translate(1560 1085) scale(1.12)"><Sajjad t={t} seed={2} look={-1} sad /></g>
      <Bubble t={t} t0={tN} x={1520} y={360} text="…؟" w={200} dir={1} size={64} />
      <Tag t={t} t0={T.dawn + 0.05} text="تهران · سپیده‌دم" />
    </>);
  } },
  /* knock — the rifle — the door opens: his father */
  { a: T.door, b: T.talk, tr: "cut", r: (t) => {
    const tk = wd(20, "در"), shake = t > tk && t < tk + 0.9 ? Math.sin(t * 70) * 6 : 0, grab = prog(t, wd(21, "اسلحه‌ش") - 0.1, wd(21, "برداشت") + 0.2), open = eio(prog(t, wd(22, "ولی"), wd(22, "پدرِ")));
    return (<>
      <rect width={1920} height={1080} fill="url(#room)" />
      <rect x={0} y={860} width={1920} height={220} fill="#4a4036" />
      <g transform={`translate(${shake} 0)`}>
        <rect x={720} y={300} width={420} height={580} fill="#fff4cf" opacity={open} />
        {open > 0.3 && <g transform="translate(930 880) scale(0.85)" opacity={eo(prog(open, 0.3, 0.8))}><Father t={t} seed={4} hl={[-110, -280]} hr={[110, -280]} /></g>}
        <g transform={`translate(720 300) scale(${1 - 0.92 * open} 1)`}><rect x={0} y={0} width={420} height={580} fill="#6b4a2c" /><rect x={30} y={30} width={360} height={240} fill="#5c3f25" /><rect x={30} y={300} width={360} height={250} fill="#5c3f25" /><circle cx={380} cy={300} r={14} fill={SAFF} /></g>
      </g>
      {t > tk && t < tk + 1 && ["تق", "تق!"].map((s, i) => <text key={i} x={1220 + i * 90} y={420 + i * 90} fontFamily="H49Black" fontSize={80} fill="#fff" opacity={1 - prog(t, tk + i * 0.3, tk + 1)}>{s}</text>)}
      {open > 0 && <path d="M720 880 L1140 880 L1700 1080 L300 1080 Z" fill="#fff4cf" opacity={0.25 * open} />}
      <g transform="translate(1520 1085) scale(1.12)"><Sajjad t={t} seed={2} look={-1} hl={[-60, lerp(-270, -360, grab)]} hr={[60, lerp(-270, -360, grab)]} mouth={open > 0.6 ? 0.5 : 0} />{grab > 0 && <Rifle x={0} y={lerp(-120, -370, grab)} rot={lerp(90, -20, grab)} s={0.9} />}</g>
      {grab === 0 && <Rifle x={1800} y={860} rot={80} s={0.7} />}
    </>);
  } },
  /* the father speaks */
  { a: T.talk, b: T.down, tr: "pop", r: (t) => (<>
    <rect width={1920} height={1080} fill="url(#room)" />
    <rect x={0} y={860} width={1920} height={220} fill="#4a4036" />
    <rect x={150} y={180} width={440} height={680} fill="#fff4cf" opacity={0.6} />
    <g transform={`translate(560 1330) scale(${1.4 + 0.02 * Math.sin(t)})`}><Father t={t} seed={4} look={1} hl={[-110, -280]} hr={[lerp(110, 170, prog(t, wd(23, "بیا"), wd(23, "بیا") + 0.3)), lerp(-280, -420, prog(t, wd(23, "بیا"), wd(23, "بیا") + 0.3))]} mouth={talk(t, wd(23, "پسرم"), wd(23, "نشده") + 0.4)} /></g>
    <g transform="translate(1400 1330) scale(1.4)"><Sajjad t={t} seed={2} look={-1} sad hl={[-60, -360]} hr={[60, -360]} /><Rifle x={0} y={-370} rot={-20} s={0.9} /></g>
    <Bubble t={t} t0={wd(23, "بیا")} x={760} y={110} text="بیا بیرون. هنوز دیر نشده." w={760} dir={-1} />
  </>) },
  /* rifle down, uniform off */
  { a: T.down, b: T.court, tr: "cut", r: (t) => {
    const dr = eo(prog(t, wd(23, "گذاشت") - 0.2, wd(23, "زمین") + 0.1)), jk = prog(t, wd(24, "درآورد") - 0.3, wd(24, "درآورد") + 0.3);
    return (<>
      <rect width={1920} height={1080} fill="url(#room)" />
      <rect x={0} y={860} width={1920} height={220} fill="#4a4036" />
      <g transform="translate(560 1330) scale(1.4)"><Father t={t} seed={4} look={1} hl={[-110, -280]} hr={[110, -280]} /></g>
      <g transform="translate(1400 1330) scale(1.4)"><Sajjad t={t} seed={2} look={-1} sad jacket={jk < 0.5 ? 1 : 0} hl={[-110, -270]} hr={[110, -270]} />
        <Rifle x={lerp(0, 160, dr)} y={lerp(-370, -20, dr)} rot={lerp(-20, 0, dr)} s={0.9} />
        {jk > 0.4 && <g transform={`translate(${-200 - 80 * jk} ${lerp(-380, -40, eo(prog(jk, 0.4, 1)))}) rotate(${-30 * jk})`}><rect x={-100} y={-60} width={200} height={110} rx={30} fill="#59683d" /><rect x={-70} y={-40} width={46} height={36} rx={6} fill="#4c5934" /></g>}
      </g>
    </>);
  } },
  /* to the courthouse together */
  { a: T.court, b: T.live, tr: "wipe", r: (t) => {
    const u = prog(t, T.court, T.live);
    return (<>
      <rect width={1920} height={1080} fill="url(#dawn)" />
      <g transform="translate(260 0)"><rect x={0} y={300} width={600} height={560} fill="#d8cfbd" />{[0, 1, 2, 3].map((i) => <rect key={i} x={50 + i * 140} y={420} width={60} height={440} fill="#c4b9a3" />)}<path d="M-40 300 L300 160 L640 300 Z" fill="#c4b9a3" />
        <text x={300} y={270} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={56} fill="#3a3226">دادگاه</text>
        <g transform="translate(300 210)" stroke="#3a3226" strokeWidth={5} fill="none"><line x1={0} y1={-30} x2={0} y2={30} /><line x1={-40} y1={-20} x2={40} y2={-20} /><path d="M-40 -20 l-14 26 h28 z M40 -20 l-14 26 h28 z" /></g></g>
      <rect x={0} y={860} width={1920} height={220} fill="#7b6a58" />
      <g transform={`translate(${lerp(1500, 1050, u)} 1040) scale(0.7)`}><Father t={t} seed={4} walk={1} look={-1} /></g>
      <g transform={`translate(${lerp(1720, 1270, u)} 1040) scale(0.7)`}><Sajjad t={t} seed={2} walk={1} look={-1} jacket={0} sad /></g>
      <Tag t={t} t0={T.court + 0.1} text="صبح" />
    </>);
  } },
  /* the same morning: Haj Agha's Instagram live from Moscow */
  { a: T.live, b: T.real, tr: "pop", r: (t) => {
    const cm = ["ترسو!", "پس سجاد چی؟", "چمدونا کو؟", "جابه‌جا؟؟", "برنگرد!"];
    return (<>
      <rect width={1920} height={1080} fill="#1a1d24" />
      <Phone x={960} y={540} s={1.15}>
        <svg x={-210} y={-410} width={420} height={820} viewBox="0 0 420 820"><rect width={420} height={820} fill="#3a4466" /><g transform="translate(-200 0)"><Domes y={520} s={0.55} /></g><Snow t={t} n={25} x1={420} y1={820} />
          <rect y={520} width={420} height={300} fill="#4d1d22" />
          <g transform="translate(210 860) scale(0.62)"><HajAgha t={t} seed={1} mouth={talk(t, wd(26, "ما"), wd(26, "شدیم") + 0.4)} hl={[-130, -260]} hr={[150, lerp(-300, -540, Math.abs(Math.sin(t * 2)))]} /></g></svg>
        <rect x={-190} y={-390} width={110} height={44} rx={8} fill={RED} /><text x={-135} y={-358} textAnchor="middle" fontFamily="H49Mono" fontSize={28} fill="#fff">LIVE</text>
        <text x={190} y={-358} textAnchor="end" fontFamily="H49Mono" fontSize={26} fill="#fff">👁 {fa(Math.floor(1200 + (t - T.live) * 900))}</text>
        {cm.map((c, i) => { const a0 = T.live + 0.6 + i * 0.9, y = 320 - (t - a0) * 90; return t > a0 && y > 40 ? <g key={i} opacity={clamp((y - 40) / 60)}><rect x={-190} y={y - 34} width={300} height={48} rx={20} fill="rgba(0,0,0,0.45)" /><text x={100} y={y} textAnchor="start" direction="rtl" fontFamily="H49Bold" fontSize={28} fill="#fff">{c}</text></g> : null; })}
      </Phone>
      <Bubble t={t} t0={wd(26, "ما")} x={1550} y={330} text="ما فقط جابه‌جا شدیم!" w={560} dir={-1} />
      <Tag t={t} t0={T.live + 0.05} text="مسکو · همون صبح" />
    </>);
  } },
  /* not fiction: Damascus → Moscow, 8 Dec 2024; soldiers find out on TV */
  { a: T.real, b: T.ask, tr: "black", r: (t) => {
    const fly = eio(prog(t, wd(27, "بی‌خبر") - 0.3, wd(27, "مسکو") + 0.4)), tv = wd(28, "سربازاش");
    const P = (u: number) => [lerp(1500, 460, u), lerp(820, 260, u) - Math.sin(u * Math.PI) * 220] as const;
    const pts = Array.from({ length: 40 }, (_, i) => P((i / 39) * fly)).map((p) => p.join(",")).join(" ");
    return (<>
      <rect width={1920} height={1080} fill="#10141d" />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 70} y1={0} x2={i * 70} y2={1080} stroke="#1a2130" strokeWidth={2} />)}
      {Array.from({ length: 16 }, (_, i) => <line key={"h" + i} x1={0} y1={i * 70} x2={1920} y2={i * 70} stroke="#1a2130" strokeWidth={2} />)}
      <circle cx={1500} cy={820} r={16} fill={SAFF} /><text x={1560} y={900} direction="rtl" fontFamily="H49Black" fontSize={52} fill={CREAM}>دمشق</text>
      <circle cx={460} cy={260} r={16} fill={RED} /><text x={500} y={240} direction="rtl" fontFamily="H49Black" fontSize={52} fill={CREAM}>مسکو</text>
      <polyline points={pts} fill="none" stroke={SAFF} strokeWidth={6} strokeDasharray="18 14" />
      {fly > 0 && fly < 1 && (() => { const [x, y] = P(fly), [x2, y2] = P(Math.min(1, fly + 0.01)); return <g transform={`translate(${x} ${y}) rotate(${(Math.atan2(y2 - y, x2 - x) * 180) / Math.PI})`}><path d="M40 0 L-30 -14 L-40 -40 L-50 -40 L-40 0 L-50 40 L-40 40 L-30 14 Z" fill="#fff" /></g>; })()}
      <g transform={`translate(1500 200) scale(${bo(prog(t, T.real + 0.2, T.real + 0.5))})`}><rect x={-230} y={-50} width={460} height={100} rx={20} fill={SAFF} /><text x={0} y={18} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={48} fill={INK}>۸ دسامبر ۲۰۲۴</text></g>
      {t >= tv && <g transform={`translate(960 640) scale(${bo(prog(t, tv, tv + 0.3))})`}>
        <rect x={-430} y={-300} width={860} height={560} rx={20} fill="#1b1e25" stroke="#333" strokeWidth={10} />
        <rect x={-400} y={-270} width={800} height={380} fill="#2a3446" /><rect x={-400} y={40} width={800} height={70} fill={RED} /><text x={360} y={90} textAnchor="start" direction="rtl" fontFamily="H49Black" fontSize={42} fill="#fff">خبر فوری: رئیس‌جمهور کشور را ترک کرد</text>
        {[-280, -100, 80, 260].map((x, i) => <g key={i} transform={`translate(${x} 330) scale(0.42)`}><Person c="#59683d" hair="#1b1410" t={t} seed={i + 3} /></g>)}
      </g>}
      <text x={1880} y={1050} textAnchor="start" direction="rtl" fontFamily="H49Bold" fontSize={30} fill="#8b93a5">ماجرای واقعی · سوریه</text>
    </>);
  } },
  /* the question */
  { a: T.ask, b: END, tr: "pop", r: (t) => (<>
    <rect width={1920} height={1080} fill="url(#night)" />
    <rect x={260} y={180} width={1400} height={900} fill="#3d4352" />
    <rect x={820} y={620} width={280} height={460} fill="#fff4cf" opacity={0.9} />
    <g transform="translate(820 620) scale(0.35 1)"><rect width={280} height={460} fill="#2a2016" /></g>
    <path d="M820 1080 L1100 1080 L1500 1080 L1100 620 Z" fill="#fff4cf" opacity={0.15} />
    <rect x={760} y={540} width={400} height={74} rx={8} fill="#1d5a3a" /><text x={960} y={593} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={50} fill="#fff">ستاد</text>
    <g transform="translate(1040 1060) scale(0.62)"><Sajjad t={t} seed={2} look={1} sad /></g>
    <g transform={`translate(1500 380) scale(${bo(prog(t, T.ask + 0.3, T.ask + 0.6))})`}><rect x={-260} y={-90} width={520} height={180} rx={30} fill={SAFF} /><text x={0} y={-10} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={52} fill={INK}>تو بودی، در رو</text><text x={0} y={60} textAnchor="middle" direction="rtl" fontFamily="H49Black" fontSize={52} fill={INK}>باز می‌کردی؟</text></g>
  </>) },
];
function kickRot(t: number, t0: number) { return t > t0 && t < t0 + 0.5 ? Math.sin((t - t0) * 40) * 8 * (1 - (t - t0) / 0.5) : 0; }

/* ───────── captions: 2–3 words */
const KEY = ["رژیم", "سقوط", "مسکو", "دلار", "سجاد", "حاج‌آقا", "خاموش", "سرد", "گزارشش", "زباله", "خش‌خش", "پدرِ", "دیر", "دادگاه", "فرار", "جابه‌جا", "بشار", "اسد", "باز"];
type Ch = { ws: VW[]; s: number; e: number };
const CH: Ch[] = (() => {
  const out: Ch[] = [];
  for (const n of V.segs.map((s) => s.n)) {
    const ws = V.words.filter((w) => w.line === n);
    let i = 0;
    while (i < ws.length) { let k = Math.min(3, ws.length - i); if (ws.length - i === 4) k = 2; out.push({ ws: ws.slice(i, i + k), s: ws[i].s, e: 0 }); i += k; }
  }
  out.forEach((c, i) => (c.e = out[i + 1] ? Math.min(out[i + 1].s, c.ws[c.ws.length - 1].e + 0.7) : c.ws[c.ws.length - 1].e + 1));
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CH.find((x) => t >= x.s - 0.03 && t < x.e);
  if (!c) return null;
  const k = eo(prog(t, c.s - 0.03, c.s + 0.1));
  return (
    <div style={{ position: "absolute", left: 40, width: 1000, top: 1215, display: "flex", justifyContent: "center", direction: "rtl", gap: 22, transform: `scale(${0.9 + 0.1 * k})`, opacity: k }}>
      {c.ws.map((w, i) => {
        const kw = KEY.some((x) => bare(w.w).includes(x));
        return <span key={i} style={{ fontFamily: "H49Black", fontSize: 84, lineHeight: 1.2, color: kw ? SAFF : CREAM, textShadow: "0 6px 24px rgba(0,0,0,0.75)", whiteSpace: "nowrap", opacity: t >= w.s - 0.05 ? 1 : 0.55 }}>{w.w.replace(/[«»]/g, "")}</span>;
      })}
    </div>
  );
};

/* ───────── frame */
const enter = (tr: Sc["tr"], u: number): React.CSSProperties => {
  switch (tr) {
    case "pop": return { transform: `scale(${lerp(1.08, 1, eo(u / 0.2))})` };
    case "wipe": return { clipPath: `inset(0 0 0 ${(1 - eio(u / 0.3)) * 100}%)` };
    case "black": return { opacity: clamp(u / 0.25) };
    default: return {};
  }
};
const Scene: React.FC<{ t: number }> = ({ t }) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", left: 0, top: 0 }}>
    <Defs />
    <rect width={1920} height={1080} fill="#000" />
    {SC.map((s, i) => {
      if (t < s.a || t >= s.b + (SC[i + 1]?.tr === "wipe" ? 0.3 : 0.02)) return null;
      const st = enter(s.tr, t - s.a);
      return <g key={i} style={st}>{s.r(t)}</g>;
    })}
  </svg>
);
const Window: React.FC<{ t: number }> = ({ t }) => {
  const z = 1.03 + 0.03 * Math.sin(t * 0.25);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${W / 1920})`, transformOrigin: "0 0" }}><div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "50% 60%" }}>
      {SC.map((s, i) => (t >= s.a && t < s.b + 0.3 ? <div key={i} style={{ position: "absolute", inset: 0, ...enter(s.tr, t - s.a), zIndex: i }}><svg width={1920} height={1080} viewBox="0 0 1920 1080"><Defs />{s.r(t)}</svg></div> : null))}
    </div></div>
  );
};

export const Video: React.FC<{ at?: number; audio?: string }> = ({ at, audio }) => {
  const f = useCurrentFrame();
  const t = at ?? f / FPS;
  const hk = eo(prog(t, 0, 0.3));
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {/* blurred copy of the scene behind everything */}
      <div style={{ position: "absolute", left: -420, top: 0, width: 1920, height: 1080, transform: "scale(1.78)", transformOrigin: "50% 0", filter: "blur(28px) brightness(0.45)" }}><Scene t={t} /></div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,17,22,0.9) 0%, rgba(14,17,22,0.75) 22%, rgba(14,17,22,0.25) 60%, rgba(14,17,22,0.85) 100%)" }} />
      {/* headline band */}
      <div style={{ position: "absolute", left: 0, width: W, top: 150, textAlign: "center", direction: "rtl", transform: `translateY(${(1 - hk) * -30}px)`, opacity: hk }}>
        <div style={{ fontFamily: "H49Black", fontSize: 82, color: CREAM, lineHeight: 1.15 }}>رژیم سقوط کرد…</div>
        <div style={{ fontFamily: "H49Black", fontSize: 70, color: SAFF, lineHeight: 1.25 }}>حاج‌آقا پرید، سجاد جا موند</div>
        <div style={{ display: "inline-block", marginTop: 14, fontFamily: "H49Bold", fontSize: 34, color: CREAM, border: `3px solid ${SAFF}`, borderRadius: 30, padding: "2px 28px" }}>فردای سقوط · شبِ آخرِ ستاد</div>
      </div>
      {/* the cartoon window */}
      <div style={{ position: "absolute", left: 0, top: WIN.y, width: W, height: WIN.h, overflow: "hidden", boxShadow: `0 -3px 0 ${SAFF}, 0 3px 0 ${SAFF}, 0 30px 80px rgba(0,0,0,0.6)` }}>
        <Window t={t} />
      </div>
      <Captions t={t} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const LOOK = [0.2, ...SC.map((s) => +(s.a + Math.min(1.6, (s.b - s.a) * 0.6)).toFixed(2)), wd(13, "گزارشش") + 0.6, wd(22, "پدرِ") + 0.4, wd(24, "درآورد") + 0.4, wd(28, "سربازاش") + 0.5, END - 0.4].sort((a, b) => a - b);
const Look: React.FC = () => { const f = useCurrentFrame(); return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />; };
const frames = Math.round(END * FPS);
export const V49Compositions: React.FC = () => (
  <>
    <Composition id="V49" component={Video} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{ audio: "v49/mix.wav" }} />
    <Composition id="V49-Silent" component={Video} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V49-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
