// V48 · «GTA 6: انقلاب یا هایپ؟» — Instagram reel 9:16, ~69 s, the user's own voice (ElevenLabs "Mark").
// Legal picture only: no trailer or Rockstar art. Real free stock (Mixkit / Coverr) of Miami, beaches, wildlife,
// police lights, bikers, gamers + motion graphics made in code (counters, comparison, player UI, globe, wireframe,
// character silhouettes, wanted stars, film strip, freeze frames, calendar, poll).
// Voice: tools/v48-voice.mjs → public/v48/vo.wav + src/v48/vo.json · mix: tools/v48-mix.mjs
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FootageTime, Media, type FootageClip, type Grade } from "../footage/footage";
import vo from "./vo.json";
import footJson from "./footage.json";

const FPS = 30, W = 1080, H = 1920;
const INK = "#0C0714", PINK = "#FF2E88", ORANGE = "#FF8A3D", SUN = "#FFC857", CREAM = "#FFF4EA", PLUM = "#2A0F33";
const CLIPS = (footJson as any).clips as Record<string, FootageClip>;
const STILL = (n: string, w = 1920, h = 1080): FootageClip => ({ file: `v48/stills/${n}.jpg`, kind: "image", w, h });

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v48 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H48Black", "fonts/Vazirmatn-Black.ttf"], ["H48Bold", "fonts/Vazirmatn-Bold.ttf"], ["H48Num", "fonts/Lalezar-Regular.ttf"],
    ["H48Bebas", "fonts/BebasNeue-Regular.ttf"], ["H48Mono", "fonts/ChakraPetch-SemiBold.ttf"]]
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
const kick = (t: number, t0: number, amp: number, dur = 0.4) => (t > t0 && t < t0 + dur ? amp * Math.pow(1 - (t - t0) / dur, 2) : 0);
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const faNum = (n: number) => fa(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬"));

/* ───────── timing from the voice */
type VW = { w: string; s: number; e: number; line: number };
const V = vo as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const bare = (x: string) => x.replace(/[،.؟!?]/g, "");
const wd = (line: number, word: string, occ = 1) => {
  const ws = V.words.filter((x) => x.line === line);
  const w = ws.filter((x) => bare(x.w) === word)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(word))[occ - 1];
  if (!w) throw new Error(`v48: word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => V.segs.find((s) => s.n === n)!.start;
const END = +(V.total + 1.5).toFixed(2);

/* ───────── shared pieces */
const Foot: React.FC<{ n: string; t0: number; len: number; from?: number; rate?: number; focus?: [number, number]; push?: number; zoom?: number; grade?: Grade; w?: number; h?: number; pan?: [number, number]; clip?: FootageClip }> = ({ n, t0, len, from = 0, rate = 1, focus, push = 0.07, zoom = 1, grade = "vivid", w = W, h = H, pan, clip }) => {
  const c = clip ?? CLIPS[n];
  return <Media clip={c} name={n} t0={t0} len={len} w={w} h={h} from={from} rate={rate} focus={focus ?? c.focus ?? [0.5, 0.5]} push={push} zoom={zoom} grade={grade} pan={pan} />;
};
const Shade: React.FC<{ top?: number; mid?: number; bot?: number }> = ({ top = 0.55, mid = 0.1, bot = 0.75 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(12,7,20,${top}) 0%, rgba(12,7,20,${mid}) 26%, rgba(12,7,20,${mid}) 55%, rgba(12,7,20,${bot}) 100%)` }} />
);
const txt = (size: number, font = "H48Black", color = CREAM): React.CSSProperties => ({ fontFamily: font, fontSize: size, color, direction: "rtl", lineHeight: 1.15, whiteSpace: "nowrap" });
const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <div style={{ position: "absolute", left: 0, width: W, top: y, display: "flex", justifyContent: "center", alignItems: "center", ...style }}>{children}</div>
);
/** a pill label that pops in at t0 */
const Chip: React.FC<{ t: number; t0: number; children: React.ReactNode; color?: string; x?: number; y: number; size?: number; rot?: number; dark?: boolean }> = ({ t, t0, children, color = PINK, x, y, size = 46, rot = 0, dark }) => {
  const k = bo(prog(t, t0, t0 + 0.28));
  if (t < t0) return null;
  const pos: React.CSSProperties = x === undefined ? { left: 0, width: W, display: "flex", justifyContent: "center" } : { left: x };
  return (
    <div style={{ position: "absolute", top: y, ...pos }}>
      <div style={{ ...txt(size, "H48Black", dark ? INK : CREAM), background: color, padding: `${size * 0.16}px ${size * 0.5}px`, borderRadius: size * 0.4, transform: `scale(${k}) rotate(${rot}deg)`, boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 30px ${color}66` }}>{children}</div>
    </div>
  );
};
/** a stamp: big border, rotated, slams from 2× */
const Stamp: React.FC<{ t: number; t0: number; children: React.ReactNode; y: number; color?: string; size?: number; rot?: number }> = ({ t, t0, children, y, color = PINK, size = 70, rot = -7 }) => {
  if (t < t0) return null;
  const u = prog(t, t0, t0 + 0.16);
  return (
    <Center y={y}>
      <div style={{ ...txt(size, "H48Black", color), border: `${size * 0.09}px solid ${color}`, borderRadius: 18, padding: `${size * 0.08}px ${size * 0.4}px`, transform: `rotate(${rot}deg) scale(${lerp(2.2, 1, eo(u))})`, opacity: u, background: "rgba(12,7,20,0.55)", textShadow: `0 0 24px ${color}88`, display: "flex", alignItems: "center", gap: 18 }}>{children}</div>
    </Center>
  );
};
const Star: React.FC<{ on: number; s?: number }> = ({ on, s = 90 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ filter: on > 0.5 ? `drop-shadow(0 0 14px ${SUN})` : "none" }}>
    <path d="M50 6 L62 38 L96 39 L69 60 L79 93 L50 73 L21 93 L31 60 L4 39 L38 38 Z" fill={on > 0.5 ? SUN : "rgba(255,244,234,0.12)"} stroke={on > 0.5 ? "#fff3c4" : "rgba(255,244,234,0.5)"} strokeWidth={3} />
  </svg>
);
const Stars: React.FC<{ t: number; t0: number; step?: number; n?: number; y: number; s?: number; blink?: boolean }> = ({ t, t0, step = 0.2, n = 5, y, s = 96, blink }) => (
  <Center y={y} style={{ gap: 14 }}>
    {Array.from({ length: n }, (_, i) => {
      const a = t0 + i * step, k = bo(prog(t, a, a + 0.22));
      const on = t >= a ? (blink ? (Math.floor(t * 6) % 2 === 0 ? 1 : 0.4) : 1) : 0;
      return <div key={i} style={{ transform: `scale(${t >= a ? k : 0.8})` }}><Star on={on} s={s} /></div>;
    })}
  </Center>
);
const PlayIcon: React.FC<{ s: number; c?: string }> = ({ s, c = "#fff" }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><rect x="2" y="16" width="96" height="68" rx="20" fill={PINK} /><path d="M40 33 L68 50 L40 67 Z" fill={c} /></svg>
);
const Eye: React.FC<{ s: number; c?: string; slash?: boolean }> = ({ s, c = CREAM, slash }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={7} strokeLinecap="round">
    <path d="M6 50 C26 18 74 18 94 50 C74 82 26 82 6 50 Z" /><circle cx="50" cy="50" r="13" fill={c} />{slash && <path d="M14 86 L86 14" stroke={PINK} strokeWidth={9} />}
  </svg>
);
const Lock: React.FC<{ s: number; c?: string }> = ({ s, c = PINK }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round"><rect x="20" y="44" width="60" height="44" rx="8" fill={c} /><path d="M32 44 V32 a18 18 0 0 1 36 0 V44" /></svg>
);
const Pin: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s * 1.3} viewBox="0 0 100 130"><path d="M50 126 C50 126 8 74 8 46 a42 42 0 0 1 84 0 C92 74 50 126 50 126 Z" fill={PINK} /><circle cx="50" cy="46" r="17" fill={CREAM} /></svg>
);
const Flame: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M52 6 C58 30 82 40 80 66 C78 86 62 96 50 96 C34 96 20 84 20 66 C20 50 32 42 34 28 C42 36 44 44 44 52 C52 40 54 24 52 6 Z" fill={ORANGE} /><path d="M50 56 C56 66 64 70 62 82 C60 90 54 94 50 94 C42 94 38 88 38 80 C38 70 46 66 50 56 Z" fill={SUN} /></svg>
);
const Balloon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><ellipse cx="50" cy="40" rx="30" ry="34" fill={PINK} /><path d="M46 74 L54 74 L50 80 Z" fill={PINK} /><path d="M50 80 C44 88 56 92 50 99" stroke={CREAM} strokeWidth={3} fill="none" /><ellipse cx="40" cy="28" rx="7" ry="11" fill="rgba(255,255,255,0.5)" /></svg>
);
const Comment: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={CREAM} strokeWidth={8} strokeLinejoin="round"><path d="M50 10 C76 10 92 26 92 46 C92 66 76 82 50 82 C44 82 38 81 33 79 L12 90 L18 70 C11 63 8 55 8 46 C8 26 24 10 50 10 Z" /></svg>
);
const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.07 }) => (
  <AbsoluteFill style={{ opacity: o, mixBlendMode: "overlay", backgroundImage: `repeating-radial-gradient(circle at ${(hash(Math.floor(t * 24)) * 100).toFixed(1)}% ${(hash(Math.floor(t * 24) + 9) * 100).toFixed(1)}%, #fff 0 1px, transparent 1px 3px)` }} />
);
/** a frosted backdrop for a code scene: the clip far behind, blurred and dark */
const Backdrop: React.FC<{ n: string; t0: number; len: number; dim?: number; blur?: number; from?: number; clip?: FootageClip }> = ({ n, t0, len, dim = 0.62, blur = 14, from, clip }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: -60, filter: `blur(${blur}px)` }}><Foot n={n} clip={clip} t0={t0} len={len} from={from} w={W + 120} h={H + 120} push={0.1} /></div>
    <AbsoluteFill style={{ background: `rgba(12,7,20,${dim})` }} />
  </AbsoluteFill>
);
const Sunset: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${110 + 4 * Math.sin(t * 0.7)}%, ${ORANGE}55 0%, ${PINK}33 30%, ${PLUM} 58%, ${INK} 85%)` }} />
);
/** circle that draws itself around a point + an arrow + a label */
const Marker: React.FC<{ t: number; t0: number; x: number; y: number; r: number; label: string; side?: 1 | -1 }> = ({ t, t0, x, y, r, label, side = 1 }) => {
  if (t < t0) return null;
  const d = eo(prog(t, t0, t0 + 0.35)), a = eo(prog(t, t0 + 0.25, t0 + 0.5)), l = bo(prog(t, t0 + 0.4, t0 + 0.65));
  const C = 2 * Math.PI * r, ax = x + side * (r + 210), ay = y + r + 170;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <circle cx={x} cy={y} r={r * (1 + 0.04 * Math.sin(t * 9))} fill="none" stroke={PINK} strokeWidth={10} strokeDasharray={C} strokeDashoffset={C * (1 - d)} transform={`rotate(-90 ${x} ${y})`} style={{ filter: `drop-shadow(0 0 12px ${PINK})` }} />
        <line x1={ax} y1={ay} x2={lerp(ax, x + side * r * 0.75, a)} y2={lerp(ay, y + r * 0.75, a)} stroke={SUN} strokeWidth={10} strokeLinecap="round" />
        {a > 0.95 && <path d={`M ${x + side * r * 0.75} ${y + r * 0.75} l ${side * 46} 8 M ${x + side * r * 0.75} ${y + r * 0.75} l ${side * 6} 46`} stroke={SUN} strokeWidth={10} strokeLinecap="round" />}
      </svg>
      <div style={{ position: "absolute", left: clamp(ax - 220, 20, W - 460), width: 440, top: ay + 10, display: "flex", justifyContent: "center" }}>
        <div style={{ ...txt(64, "H48Black", INK), background: SUN, padding: "6px 30px", borderRadius: 22, transform: `scale(${l})` }}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── scenes */
type Sc = { a: number; b: number; tr?: "zoom" | "whip" | "drop" | "glitch" | "cut" | "rise"; r: (t: number) => React.ReactNode };
const L = {
  hook: 0, cnt: wd(1, "اما"), cmp: S(3) - 0.08, wait: wd(3, "میلیون‌ها") - 0.05, globe: S(4) - 0.1, crazy: wd(4, "اینقدر") - 0.1,
  trailer: S(5) - 0.08, record: S(6) - 0.06, street: S(7) - 0.06, vice: wd(7, "وایس‌سیتی") - 0.1, beach: wd(7, "ساحل‌های") - 0.06, odd: wd(7, "جزئیات") - 0.06,
  wire: S(8) - 0.06, gfx: S(9) - 0.06, duo: S(10) - 0.06, heist: S(11) - 0.06, chase: wd(11, "تعقیب") - 0.06, betray: wd(11, "خیانت") - 0.06,
  secret: wd(11, "دنیایی") - 0.06, fans: S(12) - 0.06, ig: wd(12, "کردن") - 0.4, bike: wd(12, "جزئیاتی") - 0.06, q: S(13) - 0.06,
  rev: S(14) - 0.06, hype: wd(14, "یا") - 0.06, date: S(15) - 0.06, poll: S(16) - 0.06,
};
const tiles = ["miami-night", "palm-sunset", "traffic-lapse", "beach-pier", "alligator", "flamingo", "car-rain", "iguana", "bikers", "city-aerial", "miami-bay", "crowd-pink", "palm-twilight", "robber"];

const SCENES: Sc[] = [
  /* 1 · hook: GTA 6 slams over Miami at night, «not released yet» stamp */
  { a: L.hook, b: L.cnt, tr: "cut", r: (t) => {
    const k = clamp(t / 0.3), s = lerp(1.45, 1, bo(k)), sh = kick(t, 0, 26, 0.5);
    return (<>
      <Foot n="miami-night" t0={0} len={2.5} push={0.16} focus={[0.62, 0.5]} />
      <Shade top={0.5} mid={0.25} bot={0.8} />
      <Center y={430}><div style={{ ...txt(64, "H48Mono", SUN), letterSpacing: 10, direction: "ltr", opacity: eo(prog(t, 0.15, 0.4)) }}>COMING · 2026</div></Center>
      <Center y={520} style={{ transform: `scale(${s}) translateX(${sh * Math.sin(t * 90)}px)` }}>
        <div style={{ position: "relative", ...txt(330, "H48Bebas", CREAM), direction: "ltr", letterSpacing: 6 }}>
          <span style={{ position: "absolute", left: kick(t, 0, 18, 0.5) + 6, top: 0, color: PINK, opacity: 0.85, mixBlendMode: "screen" }}>GTA 6</span>
          <span style={{ position: "absolute", left: -kick(t, 0, 18, 0.5) - 6, top: 0, color: ORANGE, opacity: 0.7, mixBlendMode: "screen" }}>GTA 6</span>
          <span style={{ position: "relative", textShadow: `0 0 60px ${PINK}aa` }}>GTA 6</span>
        </div>
      </Center>
      <Stamp t={t} t0={wd(1, "منتشر")} y={930} size={76}><Lock s={70} />هنوز منتشر نشده</Stamp>
    </>);
  } },
  /* 2 · 40 billion views + «yes, you heard right»: a wall of video tiles, rolling counter, slam */
  { a: L.cnt, b: L.cmp, tr: "zoom", r: (t) => {
    const t40 = wd(1, "چهل"), tB = wd(1, "میلیارد"), tYes = S(2), push = 1 + 0.12 * eio(prog(t, tYes, tYes + 1));
    const roll = t < t40 ? Math.pow(prog(t, L.cnt + 0.1, t40), 2.2) * 4e10 : 4e10;
    const sh = kick(t, t40, 30) + kick(t, tYes + 0.4, 16);
    return (<>
      <AbsoluteFill style={{ background: INK }} />
      <AbsoluteFill style={{ opacity: 0.42, transform: `rotate(-8deg) scale(1.25)` }}>
        {Array.from({ length: 4 }, (_, c) => Array.from({ length: 9 }, (_, r) => {
          const id = tiles[(c * 5 + r * 3) % tiles.length], y = ((r * 260 - (t - L.cnt) * (110 + c * 40)) % 2340 + 2340) % 2340 - 300;
          return (<div key={c + "-" + r} style={{ position: "absolute", left: 20 + c * 270, top: y, width: 250, height: 141, borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
            <Img src={staticFile(`v48/stills/${id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 95, top: 40 }}><PlayIcon s={60} /></div>
          </div>);
        }))}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, rgba(12,7,20,0.35) 0%, rgba(12,7,20,0.92) 60%)` }} />
      <AbsoluteFill style={{ transform: `scale(${push}) translate(${sh * Math.sin(t * 80)}px, ${sh * Math.cos(t * 70)}px)` }}>
        <Center y={330}><div style={{ ...txt(88, "H48Num", CREAM), direction: "ltr", opacity: t < t40 ? 1 : 0.5 }}>{faNum(roll)}</div></Center>
        {t >= t40 && <Center y={420} style={{ transform: `scale(${lerp(2.4, 1, eo(prog(t, t40, t40 + 0.18)))})` }}>
          <div style={{ ...txt(560, "H48Num"), lineHeight: 1, background: `linear-gradient(180deg, ${SUN} 10%, ${ORANGE} 50%, ${PINK} 95%)`, WebkitBackgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 50px ${PINK}88)` }}>{fa(40)}</div>
        </Center>}
        {t >= tB && <Center y={990} style={{ transform: `scale(${bo(prog(t, tB, tB + 0.25))})` }}><div style={{ ...txt(150, "H48Black") }}>میلیارد</div></Center>}
        {t >= wd(1, "بار") && <Center y={1180} style={{ gap: 18, opacity: eo(prog(t, wd(1, "بار"), wd(1, "بار") + 0.2)) }}><Eye s={76} c={SUN} /><div style={{ ...txt(64, "H48Bold", SUN) }}>بار دیده شده</div></Center>}
      </AbsoluteFill>
      <Chip t={t} t0={wd(2, "درست")} y={220} size={44} color={ORANGE} dark>یعنی حدود ۵ بازدید برای هر آدمِ روی زمین</Chip>
    </>);
  } },
  /* 3 · GTA V (2013) vs GTA 6 (2026): 13 years */
  { a: L.cmp, b: L.wait, tr: "whip", r: (t) => {
    const c1 = eo(prog(t, L.cmp, L.cmp + 0.35)), c2 = eo(prog(t, L.cmp + 0.25, L.cmp + 0.6)), t13 = wd(3, "سیزده");
    const yrs = Math.round(13 * eo(prog(t, t13 - 0.1, t13 + 0.5))), bar = eo(prog(t, t13 - 0.1, t13 + 0.5));
    const card = (y: number, k: number, from: number, name: string, year: string, clip: string, grade: Grade, glow: boolean) => (
      <div style={{ position: "absolute", left: 70, top: y, width: 940, height: 380, borderRadius: 34, overflow: "hidden", transform: `translateX(${from * (1 - k)}px)`, opacity: k, boxShadow: glow ? `0 0 0 4px ${PINK}, 0 0 ${60 + 20 * Math.sin(t * 6)}px ${PINK}99` : "0 0 0 3px rgba(255,244,234,0.25)" }}>
        <Foot n={clip} t0={L.cmp} len={3} w={940} h={380} grade={grade} push={0.12} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(12,7,20,0.15), rgba(12,7,20,0.85))" }} />
        <div style={{ position: "absolute", right: 44, top: 70, ...txt(170, "H48Bebas", glow ? CREAM : "#cfc6c0"), direction: "ltr" }}>{name}</div>
        <div style={{ position: "absolute", right: 48, top: 250, ...txt(76, "H48Num", glow ? SUN : "#a99f99") }}>{year}</div>
        {glow && <div style={{ position: "absolute", left: 36, top: 30, ...txt(40, "H48Black", INK), background: SUN, padding: "4px 20px", borderRadius: 14 }}>منتشر نشده</div>}
      </div>
    );
    return (<>
      <Sunset t={t} />
      {card(250, c1, 1200, "GTA V", fa(2013), "controller", "mono", false)}
      {card(870, c2, -1200, "GTA 6", fa(2026), "miami-bay", "vivid", true)}
      <div style={{ position: "absolute", left: 120, top: 700, width: 840, height: 12, borderRadius: 6, background: "rgba(255,244,234,0.15)" }}>
        <div style={{ position: "absolute", right: 0, width: `${bar * 100}%`, height: "100%", borderRadius: 6, background: `linear-gradient(270deg, ${SUN}, ${PINK})` }} />
      </div>
      {t >= t13 - 0.1 && <Center y={730} style={{ transform: `scale(${bo(prog(t, t13 - 0.1, t13 + 0.2))})` }}>
        <div style={{ ...txt(92, "H48Black", INK), background: SUN, padding: "0 40px", borderRadius: 30, boxShadow: `0 0 40px ${SUN}88` }}>{fa(yrs)} سال انتظار</div>
      </Center>}
    </>);
  } },
  /* 4 · millions waiting: crowd + a loading bar stuck at 99% */
  { a: L.wait, b: L.globe, tr: "zoom", r: (t) => {
    const p = Math.min(99, Math.floor(99 * eo(prog(t, L.wait + 0.1, L.wait + 1.0))));
    return (<>
      <Foot n="crowd-blue" t0={L.wait} len={2} grade="warm" push={0.1} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(42,15,51,0.35), rgba(12,7,20,0.75))`, mixBlendMode: "multiply" }} />
      <Center y={560}><div style={{ ...txt(104, "H48Black"), textShadow: "0 6px 30px rgba(0,0,0,0.7)" }}>میلیون‌ها نفر</div></Center>
      <div style={{ position: "absolute", left: 120, top: 720, width: 840, height: 54, borderRadius: 27, background: "rgba(12,7,20,0.65)", border: `3px solid ${CREAM}55`, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${p}%`, background: `repeating-linear-gradient(-45deg, ${PINK} 0 26px, ${ORANGE} 26px 52px)`, backgroundPosition: `${t * 120}px 0` }} />
      </div>
      <Center y={800}><div style={{ ...txt(60, "H48Bold", SUN), opacity: p >= 99 ? (Math.floor(t * 4) % 2 ? 1 : 0.35) : 1 }}>در انتظار انتشار… {fa(p)}٪</div></Center>
    </>);
  } },
  /* 5 · the whole world: a turning globe, pins popping */
  { a: L.globe, b: L.crazy, tr: "drop", r: (t) => {
    const R = 330, cx = 540, cy = 760, rot = t * 0.9, tAll = wd(4, "کل");
    const pins = Array.from({ length: 14 }, (_, i) => ({ lon: hash(i + 3) * Math.PI * 2, lat: (hash(i + 40) - 0.5) * 2.2, at: tAll - 0.1 + i * 0.07 }));
    return (<>
      <Sunset t={t} />
      <Center y={250}><div style={{ ...txt(700, "H48Num", "rgba(255,244,234,0.06)"), lineHeight: 1 }}>؟</div></Center>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs><radialGradient id="g48" cx="40%" cy="35%"><stop offset="0%" stopColor="#5a2a63" /><stop offset="70%" stopColor={PLUM} /><stop offset="100%" stopColor="#120818" /></radialGradient></defs>
        <circle cx={cx} cy={cy} r={R + 30} fill={`${PINK}22`} />
        <circle cx={cx} cy={cy} r={R} fill="url(#g48)" stroke={`${PINK}aa`} strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => { const ph = rot + (i * Math.PI) / 8, rx = Math.abs(Math.cos(ph)) * R; return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={R} fill="none" stroke={`${CREAM}33`} strokeWidth={2} />; })}
        {[-60, -30, 0, 30, 60].map((la) => { const y = cy - Math.sin((la * Math.PI) / 180) * R, rx = Math.cos((la * Math.PI) / 180) * R; return <ellipse key={la} cx={cx} cy={y} rx={rx} ry={rx * 0.12} fill="none" stroke={`${CREAM}33`} strokeWidth={2} />; })}
        {pins.map((p, i) => {
          const x3 = Math.cos(p.lat) * Math.sin(p.lon + rot), z = Math.cos(p.lat) * Math.cos(p.lon + rot);
          if (z < 0 || t < p.at) return null;
          const x = cx + x3 * R, y = cy - Math.sin(p.lat) * R, k = bo(prog(t, p.at, p.at + 0.25)), ring = ((t - p.at) * 1.3) % 1;
          return (<g key={i}><circle cx={x} cy={y} r={10 + ring * 40} fill="none" stroke={SUN} strokeOpacity={1 - ring} strokeWidth={3} /><circle cx={x} cy={y} r={11 * k} fill={i % 3 ? PINK : SUN} /></g>);
        })}
      </svg>
      <Chip t={t} t0={tAll} y={1150} size={52} color={PINK}>کل دنیا</Chip>
    </>);
  } },
  /* 6 · «go crazy»: screaming gamer, punch zoom, heartbeat line */
  { a: L.crazy, b: L.trailer, tr: "glitch", r: (t) => {
    const tc = wd(4, "دیوونه"), z = 1 + 0.25 * eo(prog(t, tc, tc + 0.15)) - 0.1 * eo(prog(t, tc + 0.15, tc + 0.8)), sh = kick(t, tc, 22, 0.6);
    const amp = t < tc ? 30 : 150;
    const pts = Array.from({ length: 60 }, (_, i) => { const x = i * 18.3; const v = Math.sin(i * 1.7 + t * 30) * Math.sin(i * 0.37 + t * 9); return `${x},${1130 + v * amp * (i % 6 === 0 ? 1.4 : 0.6)}`; }).join(" ");
    return (<>
      <AbsoluteFill style={{ transform: `scale(${z}) translate(${sh * Math.sin(t * 70)}px, ${sh * Math.cos(t * 60)}px)` }}>
        <Foot n="gamer-scream" t0={L.crazy} len={2.5} from={1.5} focus={[0.5, 0.4]} push={0.08} />
      </AbsoluteFill>
      <Shade top={0.45} mid={0.05} bot={0.7} />
      <svg width={W} height={H} style={{ position: "absolute" }}><polyline points={pts} fill="none" stroke={PINK} strokeWidth={6} style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} /></svg>
      {t >= tc && ["!", "؟", "!", "؟"].map((m, i) => (
        <div key={i} style={{ position: "absolute", left: [140, 820, 230, 760][i], top: [380, 420, 760, 800][i], ...txt(150, "H48Num", i % 2 ? SUN : PINK), transform: `scale(${bo(prog(t, tc + i * 0.06, tc + i * 0.06 + 0.25))}) rotate(${(i % 2 ? 1 : -1) * 14}deg)` }}>{m}</div>
      ))}
    </>);
  } },
  /* 7 · first trailer: player card, 24-hour dial, 93 million counter + rising chart */
  { a: L.trailer, b: L.record, tr: "rise", r: (t) => {
    const tPub = wd(5, "منتشر"), t24 = wd(5, "بیست"), tH = wd(5, "ساعت"), t93 = wd(5, "بیشتر"), tV = wd(5, "بازدید");
    const play = bo(prog(t, tPub, tPub + 0.3)) * (1 - eo(prog(t, tPub + 0.6, tPub + 0.9)));
    const prg = prog(t, tPub + 0.6, L.record);
    const hand = 360 * eio(prog(t, t24 - 0.1, tH + 0.4)), views = 93e6 * eo(prog(t, t93, tV + 0.15));
    const chart = eo(prog(t, t93, tV + 0.2));
    const cpts = Array.from({ length: 30 }, (_, i) => { const x = i / 29; return [100 + x * 880, 1250 - Math.pow(x, 2.3) * 170 - Math.sin(x * 20) * 6 * x] as const; });
    const nP = Math.max(2, Math.round(chart * 30));
    return (<>
      <Backdrop n="miami-calm" t0={L.trailer} len={6} />
      <div style={{ position: "absolute", left: 70, top: 250, width: 940, height: 600, borderRadius: 30, overflow: "hidden", background: "#000", boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 3px ${CREAM}22` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 70, background: "#16101c", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", boxSizing: "border-box" }}>
          <div style={{ ...txt(34, "H48Mono", CREAM), direction: "ltr" }}>TRAILER 1</div>
          <div style={{ ...txt(34, "H48Bold", SUN) }}>دسامبر {fa(2023)}</div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 70, width: 940, height: 500, overflow: "hidden" }}>
          <Foot n="miami-night" t0={L.trailer} len={6} w={940} h={500} from={4} push={0.1} focus={[0.6, 0.5]} />
          <AbsoluteFill style={{ background: `rgba(12,7,20,${0.5 * (1 - prog(t, tPub, tPub + 0.5))})` }} />
          {play > 0.01 && <div style={{ position: "absolute", left: 470 - 110, top: 250 - 110, transform: `scale(${play})` }}><PlayIcon s={220} /></div>}
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 940, height: 30, background: "#16101c" }}>
          <div style={{ position: "absolute", left: 24, right: 24, top: 12, height: 6, background: "#3a2d40", borderRadius: 3 }}>
            <div style={{ width: `${prg * 100}%`, height: "100%", background: PINK, borderRadius: 3 }} />
          </div>
        </div>
      </div>
      {t >= t24 - 0.15 && <div style={{ position: "absolute", left: 90, top: 880, width: 300, height: 300, transform: `scale(${bo(prog(t, t24 - 0.15, t24 + 0.15))})` }}>
        <svg width={300} height={300} viewBox="0 0 300 300">
          <circle cx={150} cy={150} r={130} fill="rgba(12,7,20,0.7)" stroke={CREAM} strokeOpacity={0.3} strokeWidth={6} />
          <path d={`M150 150 L150 20 A130 130 0 ${hand > 180 ? 1 : 0} 1 ${150 + 130 * Math.sin((hand * Math.PI) / 180)} ${150 - 130 * Math.cos((hand * Math.PI) / 180)} Z`} fill={`${PINK}66`} />
          {Array.from({ length: 24 }, (_, i) => <line key={i} x1={150} y1={30} x2={150} y2={i % 6 ? 42 : 52} stroke={CREAM} strokeWidth={i % 6 ? 3 : 6} transform={`rotate(${i * 15} 150 150)`} />)}
          <line x1={150} y1={150} x2={150} y2={40} stroke={SUN} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hand} 150 150)`} />
          <circle cx={150} cy={150} r={12} fill={SUN} />
        </svg>
        <div style={{ position: "absolute", top: 120, width: 300, textAlign: "center", ...txt(54, "H48Num", CREAM), textShadow: "0 0 10px #000" }}>{fa(Math.round(24 * hand / 360))} ساعت</div>
      </div>}
      {t >= t93 - 0.1 && <div style={{ position: "absolute", left: 420, top: 900, width: 600, textAlign: "center", opacity: eo(prog(t, t93 - 0.1, t93 + 0.1)) }}>
        <div style={{ ...txt(130, "H48Num", t >= tV ? SUN : CREAM), direction: "ltr", lineHeight: 1, transform: `scale(${1 + kick(t, tV, 0.18)})` }}>{faNum(views)}</div>
        <div style={{ ...txt(52, "H48Bold", CREAM), marginTop: 6, display: "flex", justifyContent: "center", gap: 14, alignItems: "center" }}><Eye s={52} c={CREAM} />بازدید</div>
      </div>}
      {t >= t93 && <svg width={W} height={H} style={{ position: "absolute" }}>
        <polyline points={cpts.slice(0, nP).map((p) => p.join(",")).join(" ")} fill="none" stroke={PINK} strokeWidth={8} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} />
        <circle cx={cpts[nP - 1][0]} cy={cpts[nP - 1][1]} r={12} fill={SUN} />
      </svg>}
    </>);
  } },
  /* 8 · record: crowd + gold medal + confetti */
  { a: L.record, b: L.street, tr: "zoom", r: (t) => {
    const tr = wd(6, "رکورد"), k = bo(prog(t, tr, tr + 0.35));
    return (<>
      <Foot n="crowd-horns" t0={L.record} len={2.2} grade="warm" push={0.12} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(12,7,20,0.15) 0%, rgba(12,7,20,0.75) 70%)` }} />
      {t >= tr && <Center y={330} style={{ transform: `scale(${k}) rotate(${4 * Math.sin(t * 3)}deg)` }}>
        <svg width={520} height={640} viewBox="0 0 520 640">
          <path d="M150 0 L230 250 L190 260 L110 0 Z" fill={PINK} /><path d="M370 0 L290 250 L330 260 L410 0 Z" fill={ORANGE} />
          <circle cx={260} cy={390} r={220} fill={SUN} stroke="#fff1c2" strokeWidth={10} />
          <circle cx={260} cy={390} r={180} fill="none" stroke="#d9952b" strokeWidth={6} strokeDasharray="12 10" transform={`rotate(${t * 40} 260 390)`} />
          <text x={260} y={440} textAnchor="middle" fontFamily="H48Bebas" fontSize={170} fill={INK}>93M</text>
        </svg>
      </Center>}
      <Chip t={t} t0={tr + 0.15} y={990} size={70} color={PINK}>رکورد بازدید در ۲۴ ساعت</Chip>
      {t >= tr && Array.from({ length: 70 }, (_, i) => {
        const u = t - tr, ang = hash(i) * Math.PI * 2, sp = 500 + hash(i + 7) * 900;
        const x = 540 + Math.cos(ang) * sp * u, y = 640 + Math.sin(ang) * sp * u * 0.8 + 900 * u * u;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 30, background: [PINK, SUN, ORANGE, CREAM][i % 4], transform: `rotate(${u * 600 * (hash(i + 3) - 0.5)}deg)`, borderRadius: 3 }} />;
      })}
    </>);
  } },
  /* 9 · busy streets */
  { a: L.street, b: L.vice, tr: "whip", r: (t) => (<>
    <Foot n="traffic-lapse" t0={L.street} len={1.4} rate={1.4} grade="warm" push={0.1} />
    <Shade />
    <Chip t={t} t0={L.street + 0.15} y={300} size={50} color={ORANGE} dark>خیابون‌های شلوغ</Chip>
  </>) },
  /* 10 · Vice City = Miami (real Miami footage) with a pin */
  { a: L.vice, b: L.beach, tr: "zoom", r: (t) => {
    const k = bo(prog(t, L.vice + 0.05, L.vice + 0.35)), coord = "25.76°N  80.19°W", n = Math.round(coord.length * prog(t, L.vice + 0.4, L.vice + 1.1));
    return (<>
      <Foot n="miami-bay" t0={L.vice} len={1.5} push={0.12} focus={[0.4, 0.5]} />
      <Shade top={0.6} />
      <div style={{ position: "absolute", left: 470, top: 300 - 160 * (1 - k), opacity: k }}><Pin s={140} /></div>
      <Center y={500}><div style={{ ...txt(130, "H48Black"), transform: `scale(${k})`, textShadow: `0 6px 40px rgba(0,0,0,0.7)` }}>وایس‌سیتی</div></Center>
      <Center y={670}><div style={{ ...txt(52, "H48Bold", SUN), opacity: eo(prog(t, L.vice + 0.3, L.vice + 0.6)) }}>الهام گرفته از میامیِ واقعی</div></Center>
      <Center y={760}><div style={{ ...txt(40, "H48Mono", CREAM), direction: "ltr", opacity: 0.85 }}>{coord.slice(0, n)}</div></Center>
      <Chip t={t} t0={L.vice} x={48} y={236} size={30} color="rgba(12,7,20,0.7)">تصویر واقعی · میامی</Chip>
    </>);
  } },
  /* 11 · living beaches */
  { a: L.beach, b: L.odd, tr: "drop", r: (t) => (<>
    <Foot n="beach-pier" t0={L.beach} len={1.4} push={0.14} focus={[0.45, 0.6]} />
    <Shade top={0.45} mid={0} bot={0.6} />
    <Chip t={t} t0={L.beach + 0.1} y={300} size={56} color={SUN} dark>ساحل‌های زنده</Chip>
  </>) },
  /* 12 · strange details: crocodile + flamingos, split */
  { a: L.odd, b: L.wire, tr: "whip", r: (t) => {
    const k2 = eo(prog(t, wd(7, "عجیب") - 0.05, wd(7, "عجیب") + 0.25));
    return (<>
      <AbsoluteFill style={{ background: INK }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: 955, overflow: "hidden" }}><Foot n="alligator" t0={L.odd} len={1.6} w={W} h={955} from={3} push={0.1} focus={[0.4, 0.5]} /></div>
      <div style={{ position: "absolute", left: 0, top: 965, width: W, height: 955, overflow: "hidden", transform: `translateX(${(1 - k2) * -1100}px)` }}><Foot n="flamingo" t0={L.odd} len={1.6} w={W} h={955} from={2} push={0.1} focus={[0.45, 0.5]} /></div>
      <div style={{ position: "absolute", left: 0, top: 952, width: W, height: 16, background: PINK, boxShadow: `0 0 30px ${PINK}` }} />
      <Chip t={t} t0={L.odd + 0.1} x={60} y={250} size={50} color={PINK}>تمساح</Chip>
      <Chip t={t} t0={wd(7, "عجیب")} x={60} y={1010} size={50} color={SUN} dark>فلامینگو</Chip>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 60%, rgba(12,7,20,0.7) 100%)" }} />
    </>);
  } },
  /* 13 · «designed» wireframe → «real world» reveal */
  { a: L.wire, b: L.gfx, tr: "zoom", r: (t) => {
    const tD = wd(8, "طراحی"), tR = wd(8, "واقعی"), tW = wd(8, "تماشا");
    const draw = eo(prog(t, tD - 0.2, tD + 0.9)), rev = eio(prog(t, tR - 0.1, tR + 0.45));
    const lines: string[] = [];
    for (let i = -10; i <= 10; i++) lines.push(`M540 860 L${540 + i * 260} 1920`);
    for (let j = 1; j < 9; j++) { const y = 860 + Math.pow(j / 8, 2) * 1060; lines.push(`M0 ${y} L1080 ${y}`); }
    const tris = Array.from({ length: 26 }, (_, i) => { const x = hash(i) * 1080, y = 300 + hash(i + 50) * 600; return `M${x} ${y} L${x + 120 + hash(i + 9) * 120} ${y + 60 + hash(i + 4) * 80} L${x + 40} ${y + 160} Z`; });
    return (<>
      <Foot n="palm-sunset" t0={L.wire} len={4.2} push={0.08} focus={[0.6, 0.5]} />
      <AbsoluteFill style={{ clipPath: `inset(${rev * 100}% 0 0 0)` }}>
        <AbsoluteFill style={{ background: "rgba(12,7,20,0.72)" }} />
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {lines.map((d, i) => <path key={i} d={d} stroke={PINK} strokeWidth={3} strokeOpacity={0.8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" />)}
          {tris.map((d, i) => <path key={"t" + i} d={d} stroke={SUN} strokeWidth={2} strokeOpacity={0.55} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(draw * 1.4 - i * 0.02)} />)}
        </svg>
        <Center y={300}><div style={{ ...txt(60, "H48Mono", PINK), direction: "ltr", letterSpacing: 12 }}>WIREFRAME</div></Center>
      </AbsoluteFill>
      {rev > 0 && rev < 1 && <div style={{ position: "absolute", left: 0, top: rev * H - 6, width: W, height: 12, background: CREAM, boxShadow: `0 0 40px 10px ${SUN}` }} />}
      {t >= tR && <Center y={300}><div style={{ ...txt(60, "H48Mono", SUN), direction: "ltr", letterSpacing: 12, opacity: eo(prog(t, tR + 0.3, tR + 0.5)) }}>REAL WORLD</div></Center>}
      {t >= tW && <AbsoluteFill style={{ opacity: eo(prog(t, tW, tW + 0.2)) }}>
        {[[60, 220, 1, 1], [1020, 220, -1, 1], [60, 1240, 1, -1], [1020, 1240, -1, -1]].map(([x, y, sx, sy], i) => <div key={i} style={{ position: "absolute", left: sx > 0 ? x : x - 90, top: sy > 0 ? y : y - 90, width: 90, height: 90, borderTop: sy > 0 ? `8px solid ${CREAM}` : undefined, borderBottom: sy < 0 ? `8px solid ${CREAM}` : undefined, borderLeft: sx > 0 ? `8px solid ${CREAM}` : undefined, borderRight: sx < 0 ? `8px solid ${CREAM}` : undefined }} />)}
        <div style={{ position: "absolute", left: 110, top: 270, ...txt(40, "H48Mono", CREAM), direction: "ltr", display: "flex", gap: 12, alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 13, background: Math.floor(t * 3) % 2 ? PINK : "transparent", display: "inline-block" }} />REC</div>
      </AbsoluteFill>}
    </>);
  } },
  /* 14 · «not just graphics»: the word gets struck through */
  { a: L.gfx, b: L.duo, tr: "glitch", r: (t) => {
    const tN = wd(9, "نیست"), st = eo(prog(t, tN - 0.05, tN + 0.2)), g = kick(t, tN, 30, 0.35);
    return (<>
      <Foot n="palm-sunset" clip={STILL("palm-sunset", 480, 270)} t0={L.gfx} len={2} grade="mono" push={0.04} />
      <AbsoluteFill style={{ background: "rgba(12,7,20,0.72)" }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 6px)" }} />
      <Center y={430}><div style={{ ...txt(80, "H48Bold", SUN) }}>فقط</div></Center>
      <Center y={540}>
        <div style={{ position: "relative", ...txt(230, "H48Black") }}>
          <span style={{ position: "absolute", left: g, color: PINK, opacity: 0.7 }}>گرافیک</span>
          <span style={{ position: "absolute", left: -g, color: ORANGE, opacity: 0.6 }}>گرافیک</span>
          <span style={{ position: "relative", opacity: 1 - 0.45 * st }}>گرافیک</span>
          <div style={{ position: "absolute", right: -30, top: 150, width: `${st * 112}%`, height: 26, background: PINK, transform: "rotate(-8deg)", transformOrigin: "right", boxShadow: `0 0 30px ${PINK}` }} />
        </div>
      </Center>
      <Stamp t={t} t0={tN + 0.1} y={900} size={80} color={SUN} rot={6}>نیست!</Stamp>
    </>);
  } },
  /* 15 · Jason & Lucia: silhouette cards + wanted stars */
  { a: L.duo, b: L.heist, tr: "rise", r: (t) => {
    const tJ = wd(10, "جیسون"), tL = wd(10, "لوسیا"), tD = wd(10, "داستان");
    const card = (x: number, t0: number, en: string, fa_: string, woman: boolean) => {
      const k = bo(prog(t, t0 - 0.15, t0 + 0.2));
      return (
        <div style={{ position: "absolute", left: x, top: 320, width: 460, height: 760, borderRadius: 30, overflow: "hidden", transform: `translateY(${(1 - k) * 900}px) rotate(${(woman ? -2 : 2) * (1 - k)}deg)`, boxShadow: `0 0 0 4px ${woman ? PINK : SUN}, 0 30px 70px rgba(0,0,0,0.6)` }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${woman ? "#3b0f3d" : "#3d1a0f"} 0%, ${woman ? PINK : ORANGE} 120%)` }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 7px)`, backgroundPosition: `0 ${t * 40}px` }} />
          <svg width={460} height={760} viewBox="0 0 460 760" style={{ position: "absolute", transform: `translateY(${6 * Math.sin(t * 1.6)}px)` }}>
            {woman
              ? <path d="M230 170 C176 170 150 214 152 262 C150 300 140 340 122 380 C150 392 172 392 186 380 L188 404 C120 420 70 460 54 560 L40 760 L420 760 L406 560 C390 460 340 420 272 404 L274 380 C288 392 310 392 338 380 C320 340 310 300 308 262 C310 214 284 170 230 170 Z" fill="#0b0610" stroke={PINK} strokeWidth={5} />
              : <path d="M230 176 C186 176 164 210 166 250 C166 296 186 332 204 346 L204 392 C140 404 90 436 66 520 L50 760 L410 760 L394 520 C370 436 320 404 256 392 L256 346 C274 332 294 296 294 250 C296 210 274 176 230 176 Z M164 236 C170 186 210 162 236 166 C272 168 298 194 296 236 C280 214 260 206 230 206 C200 206 180 214 164 236 Z" fill="#0b0610" stroke={SUN} strokeWidth={5} />}
          </svg>
          <div style={{ position: "absolute", left: 0, width: 460, top: 520, textAlign: "center", ...txt(150, "H48Bebas", CREAM), direction: "ltr", letterSpacing: 4, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{en}</div>
          <div style={{ position: "absolute", left: 0, width: 460, top: 670, textAlign: "center", ...txt(56, "H48Black", woman ? PINK : SUN) }}>{fa_}</div>
        </div>
      );
    };
    return (<>
      <Backdrop n="palm-twilight" t0={L.duo} len={5} dim={0.55} />
      <Center y={236}><div style={{ ...txt(48, "H48Bold", CREAM), opacity: eo(prog(t, L.duo, L.duo + 0.3)) }}>دو شخصیت اصلی</div></Center>
      {card(560, tJ, "JASON", "جیسون", false)}
      {card(60, tL, "LUCIA", "لوسیا", true)}
      {t >= tD - 0.1 && <Stars t={t} t0={tD - 0.1} step={0.18} y={1110} s={92} />}
      <div style={{ position: "absolute", left: 0, width: W, top: 1100, textAlign: "center", ...txt(26, "H48Bold", "rgba(255,244,234,0.6)") }}>{t < tD - 0.1 ? "طرح نمادین · تصویر رسمی بازی نیست" : ""}</div>
    </>);
  } },
  /* 16 · heist */
  { a: L.heist, b: L.chase, tr: "cut", r: (t) => {
    const sh = kick(t, L.heist + 0.1, 24, 0.5);
    return (<>
      <AbsoluteFill style={{ transform: `translate(${sh * Math.sin(t * 80)}px, ${sh * Math.cos(t * 75)}px) scale(1.05)` }}><Foot n="robber" t0={L.heist} len={0.9} push={0.12} focus={[0.6, 0.5]} /></AbsoluteFill>
      <Shade top={0.4} mid={0} bot={0.6} />
      <Stamp t={t} t0={L.heist + 0.05} y={420} size={110} color={PINK} rot={-6}>سرقت</Stamp>
    </>);
  } },
  /* 17 · chase: speeding traffic + police strobes + flashing stars */
  { a: L.chase, b: L.betray, tr: "whip", r: (t) => {
    const ph = Math.floor(t * 8) % 2;
    return (<>
      <Foot n="traffic-fast" t0={L.chase} len={1.2} rate={1.8} from={2} push={0.15} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${ph ? "rgba(255,30,60,0.55)" : "rgba(60,80,255,0.45)"} 0%, transparent 30%, transparent 70%, ${ph ? "rgba(60,80,255,0.45)" : "rgba(255,30,60,0.55)"} 100%)`, mixBlendMode: "screen" }} />
      <Shade top={0.4} mid={0} bot={0.6} />
      <Stars t={t} t0={L.chase} step={0.06} y={260} s={80} blink />
      <Stamp t={t} t0={L.chase + 0.08} y={480} size={96} color={SUN} rot={5}>تعقیب و گریز</Stamp>
    </>);
  } },
  /* 18 · betrayal: neon car, the glass cracks */
  { a: L.betray, b: L.secret, tr: "cut", r: (t) => {
    const tb = L.betray + 0.1, c = eo(prog(t, tb, tb + 0.25)), cx = 560, cy = 780;
    const cracks = Array.from({ length: 13 }, (_, i) => { const a = (i / 13) * Math.PI * 2 + hash(i) * 0.4; let x = cx, y = cy, d = `M${cx} ${cy}`; for (let k = 1; k <= 5; k++) { x += Math.cos(a + (hash(i * 7 + k) - 0.5) * 0.8) * 130; y += Math.sin(a + (hash(i * 5 + k) - 0.5) * 0.8) * 130; d += ` L${x} ${y}`; } return d; });
    return (<>
      <Foot n="car-rain" t0={L.betray} len={1} from={3} push={0.12} focus={[0.45, 0.5]} />
      <AbsoluteFill style={{ background: "rgba(12,7,20,0.35)" }} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {cracks.map((d, i) => <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={3} strokeOpacity={0.9} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - c} />)}
        {[60, 130, 210].map((r) => <circle key={r} cx={cx} cy={cy} r={r * c} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />)}
      </svg>
      <Stamp t={t} t0={tb} y={300} size={100} color={PINK} rot={-4}>خیانت</Stamp>
    </>);
  } },
  /* 19 · a secret in every corner: night city, a searching spotlight */
  { a: L.secret, b: L.fans, tr: "zoom", r: (t) => {
    const u = t - L.secret, sx = 540 + 300 * Math.sin(u * 1.6), sy = 820 + 260 * Math.sin(u * 2.3 + 1), tc = wd(11, "گوشه‌ش"), tr = wd(11, "راز");
    return (<>
      <Foot n="city-aerial" t0={L.secret} len={3.4} push={0.15} focus={[0.6, 0.5]} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${sx}px ${sy}px, transparent 0, transparent 170px, rgba(12,7,20,0.78) 230px)` }} />
      <div style={{ position: "absolute", left: sx - 200, top: sy - 200, width: 400, height: 400, borderRadius: 200, border: `6px solid ${SUN}`, boxShadow: `0 0 40px ${SUN}88` }} />
      <div style={{ position: "absolute", left: sx + 130, top: sy + 130, width: 150, height: 24, borderRadius: 12, background: SUN, transform: "rotate(45deg)", transformOrigin: "left" }} />
      {t >= tc && [[120, 330], [880, 360], [150, 1140], [870, 1110]].map(([x, y], i) => <div key={i} style={{ position: "absolute", left: x - 40, top: y - 70, ...txt(130, "H48Num", PINK), transform: `scale(${bo(prog(t, tc + i * 0.1, tc + i * 0.1 + 0.25))})` }}>؟</div>)}
      {t >= tr && <div style={{ position: "absolute", left: sx - 60, top: sy - 60, transform: `scale(${bo(prog(t, tr, tr + 0.3))})` }}><Lock s={120} c={SUN} /></div>}
      <Chip t={t} t0={tr} y={260} size={56} color={PINK}>راز مخفی</Chip>
    </>);
  } },
  /* 20 · fans study the trailer frame by frame: gamer window + running film strip */
  { a: L.fans, b: L.ig, tr: "rise", r: (t) => {
    const tF = wd(12, "فریم"), steps = [tF, wd(12, "فریم", 2), wd(12, "بررسی"), wd(12, "کردن")];
    const fast = (Math.min(t, tF) - L.fans) * 900;
    const slow = steps.filter((s) => t >= s).length * 300 + (t >= tF ? 0 : 0);
    const off = fast + slow, cellW = 300, frameNo = Math.floor(off / 3) + 142;
    return (<>
      <Sunset t={t} />
      <div style={{ position: "absolute", left: 70, top: 220, width: 940, height: 560, borderRadius: 30, overflow: "hidden", boxShadow: `0 0 0 3px ${CREAM}33, 0 30px 70px rgba(0,0,0,0.6)` }}>
        <Foot n="gamer-glow" t0={L.fans} len={4} w={940} h={560} from={3} push={0.1} focus={[0.6, 0.45]} />
      </div>
      <Chip t={t} t0={wd(12, "طرفدارا")} x={100} y={250} size={40} color={PINK}>طرفدارها</Chip>
      <div style={{ position: "absolute", left: 0, top: 830, width: W, height: 300, background: "#0a0a0a", boxShadow: "0 0 0 2px #222" }}>
        {Array.from({ length: 30 }, (_, i) => <div key={"h" + i} style={{ position: "absolute", left: ((i * 64 - off) % 1920 + 1920) % 1920 - 40, top: 12, width: 34, height: 22, borderRadius: 5, background: "#2a2a2a" }} />)}
        {Array.from({ length: 30 }, (_, i) => <div key={"b" + i} style={{ position: "absolute", left: ((i * 64 - off) % 1920 + 1920) % 1920 - 40, top: 266, width: 34, height: 22, borderRadius: 5, background: "#2a2a2a" }} />)}
        {Array.from({ length: 7 }, (_, i) => {
          const x = ((i * cellW - off) % (cellW * 7) + cellW * 7) % (cellW * 7) - cellW;
          const id = tiles[(i + Math.floor(off / (cellW * 7)) * 7) % tiles.length];
          return <div key={i} style={{ position: "absolute", left: x + 10, top: 48, width: cellW - 20, height: 204, overflow: "hidden", borderRadius: 6 }}><Img src={staticFile(`v48/stills/${id}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: t < tF ? "blur(3px)" : "none" }} /></div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 380, top: 860, width: 320, height: 240, border: `8px solid ${PINK}`, borderRadius: 10, boxShadow: `0 0 30px ${PINK}` }} />
      <Center y={1150}><div style={{ ...txt(50, "H48Mono", SUN), direction: "ltr" }}>FRAME {String(frameNo).padStart(5, "0")}</div></Center>
    </>);
  } },
  /* 21 · freeze frame: the iguana */
  { a: L.ig, b: L.bike, tr: "cut", r: (t) => {
    const tz = wd(12, "کردن"), frz = t >= tz, z = 1 + 0.3 * eio(prog(t, tz + 0.05, tz + 0.7));
    return (<>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 45%", filter: frz ? "saturate(0.8) contrast(1.1)" : "none" }}>
        {frz ? <Foot n="iguana" clip={STILL("iguana-freeze")} t0={tz} len={2} push={0} focus={[0.46, 0.5]} /> : <Foot n="iguana" t0={L.ig} len={0.6} from={2.44 - 0.4} push={0} focus={[0.46, 0.5]} />}
      </AbsoluteFill>
      {frz && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.8 * (1 - prog(t, tz, tz + 0.18))})`, mixBlendMode: "screen", maskImage: "radial-gradient(circle at 50% 45%, #000 0, transparent 70%)" }} />}
      <Shade top={0.5} mid={0} bot={0.5} />
      {frz && <div style={{ position: "absolute", left: 60, top: 236, ...txt(44, "H48Mono", CREAM), direction: "ltr", background: "rgba(12,7,20,0.7)", padding: "6px 22px", borderRadius: 14, display: "flex", gap: 14, alignItems: "center" }}><span style={{ display: "inline-block", width: 12, height: 34, background: CREAM, boxShadow: `20px 0 0 ${CREAM}` }} /><span style={{ marginLeft: 22 }}>FREEZE</span></div>}
      <Marker t={t} t0={tz + 0.35} x={690} y={730} r={170} label="ایگوانا" side={-1} />
    </>);
  } },
  /* 22 · freeze frame: the tiny biker, zoom in */
  { a: L.bike, b: L.q, tr: "whip", r: (t) => {
    const tz = wd(12, "پیدا") - 0.05, frz = t >= tz, z = 1 + 1.3 * eio(prog(t, tz + 0.05, tz + 0.7)), tN = wd(12, "ندیدن");
    return (<>
      <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "540px 942px" }}>
        {frz ? <Foot n="bikers" clip={STILL("bikers-freeze")} t0={tz} len={2} push={0} focus={[0.57, 0.5]} /> : <Foot n="bikers" t0={L.bike} len={0.8} from={6.55 - (tz - L.bike)} push={0} focus={[0.57, 0.5]} />}
      </AbsoluteFill>
      {frz && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.7 * (1 - prog(t, tz, tz + 0.18))})` }} />}
      <Shade top={0.45} mid={0} bot={0.55} />
      <Marker t={t} t0={tz + 0.55} x={540} y={942} r={190} label="موتورسوار" side={-1} />
      {t >= tN && <div style={{ position: "absolute", left: 800, top: 300, transform: `scale(${bo(prog(t, tN, tN + 0.25))})` }}><Eye s={150} c={CREAM} slash /></div>}
    </>);
  } },
  /* 23 · the big question */
  { a: L.q, b: L.rev, tr: "drop", r: (t) => {
    const tb = wd(13, "بی‌جواب"), sh = kick(t, tb, 18, 0.5);
    return (<>
      <Backdrop n="palm-twilight" t0={L.q} len={3} dim={0.78} from={4} />
      {Array.from({ length: 10 }, (_, i) => { const a = t * 0.8 + (i / 10) * Math.PI * 2; return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 420 - 30, top: 700 + Math.sin(a) * 420 * 0.55 - 50, ...txt(90, "H48Num", i % 2 ? PINK : SUN), opacity: 0.35 + 0.3 * Math.sin(a) }}>؟</div>; })}
      <Center y={180} style={{ transform: `scale(${bo(prog(t, L.q, L.q + 0.35))}) rotate(${8 * Math.sin(t * 2.2) + sh * Math.sin(t * 60)}deg)` }}>
        <div style={{ ...txt(900, "H48Num"), lineHeight: 1, background: `linear-gradient(180deg, ${SUN}, ${ORANGE} 45%, ${PINK})`, WebkitBackgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 50px ${PINK}88)` }}>؟</div>
      </Center>
      <Chip t={t} t0={wd(13, "بزرگ")} y={1140} size={56} color={PINK}>سؤال بزرگ</Chip>
    </>);
  } },
  /* 24 · will it revolutionise the industry? controller + shockwave */
  { a: L.rev, b: L.hype, tr: "zoom", r: (t) => {
    const tm = wd(14, "متحول");
    return (<>
      <Foot n="controller" t0={L.rev} len={4} push={0.12} grade="warm" focus={[0.4, 0.5]} />
      <AbsoluteFill style={{ background: "rgba(12,7,20,0.45)" }} />
      <Chip t={t} t0={wd(14, "GTA 6")} y={250} size={50} color="rgba(12,7,20,0.75)"><span style={{ fontFamily: "H48Bebas", fontSize: 64, direction: "ltr" }}>GTA 6</span></Chip>
      <Center y={540}><div style={{ ...txt(84, "H48Bold"), opacity: eo(prog(t, wd(14, "صنعت"), wd(14, "صنعت") + 0.25)), textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>صنعت بازی</div></Center>
      {t >= tm && [0, 0.12, 0.24].map((d, i) => { const u = prog(t, tm + d, tm + d + 0.8); return <div key={i} style={{ position: "absolute", left: 540 - 600 * u, top: 760 - 600 * u, width: 1200 * u, height: 1200 * u, borderRadius: "50%", border: `${10 * (1 - u)}px solid ${i ? SUN : PINK}`, opacity: 1 - u }} />; })}
      {t >= tm && <Center y={680} style={{ gap: 20, transform: `scale(${bo(prog(t, tm, tm + 0.3))})` }}><Flame s={140} /><div style={{ ...txt(160, "H48Black"), textShadow: `0 0 40px ${ORANGE}` }}>انقلاب؟</div></Center>}
    </>);
  } },
  /* 25 · or just hype: hype meter overflows, real quality unknown */
  { a: L.hype, b: L.date, tr: "glitch", r: (t) => {
    const th = wd(14, "هیجان"), hp = eo(prog(t, L.hype + 0.2, th)) * 100 + 30 * eo(prog(t, th, th + 0.4)), sh = kick(t, th, 20, 0.6);
    const bar = (y: number, label: string, icon: React.ReactNode, fill: number, color: string, unknown: boolean) => (
      <div style={{ position: "absolute", left: 90, top: y, width: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ ...txt(60, "H48Black"), display: "flex", gap: 16, alignItems: "center" }}>{icon}{label}</div>
          <div style={{ ...txt(64, "H48Num", color), direction: "ltr" }}>{unknown ? "؟" : fa(Math.round(fill)) + "٪"}</div>
        </div>
        <div style={{ position: "relative", height: 90, borderRadius: 45, background: "rgba(255,244,234,0.1)", border: `3px solid ${CREAM}44` }}>
          {unknown
            ? <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${50 + 10 * Math.sin(t * 3)}%`, borderRadius: 45, background: `repeating-linear-gradient(-45deg, ${SUN}99 0 20px, transparent 20px 40px)`, backgroundPosition: `${t * 60}px 0` }} />
            : <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${Math.min(fill, 100) * (fill > 100 ? 1.1 : 1)}%`, borderRadius: 45, background: `linear-gradient(270deg, ${ORANGE}, ${color})`, boxShadow: fill > 100 ? `0 0 60px ${color}` : "none" }} />}
        </div>
      </div>
    );
    return (<>
      <Backdrop n="crowd-pink" t0={L.hype} len={3.5} dim={0.68} />
      <Center y={230}><div style={{ ...txt(76, "H48Black", SUN) }}>هایپ در برابر کیفیت</div></Center>
      <AbsoluteFill style={{ transform: `translate(${sh * Math.sin(t * 80)}px, ${sh * Math.cos(t * 70)}px)` }}>
        {bar(420, "هایپ", <Balloon s={80} />, hp, PINK, false)}
      </AbsoluteFill>
      {bar(760, "کیفیت واقعی", <Flame s={80} />, 0, SUN, true)}
      <Center y={1040}><div style={{ ...txt(46, "H48Bold", CREAM), opacity: eo(prog(t, wd(14, "فقط") , wd(14, "فقط") + 0.3)) }}>جوابش فقط بعد از انتشار معلوم می‌شه</div></Center>
      {hp > 100 && <Stamp t={t} t0={th + 0.05} y={580} size={64} color={PINK} rot={-8}>بزرگ‌ترین هیجان تاریخ گیمینگ</Stamp>}
    </>);
  } },
  /* 26 · release date: calendar, 19 November circled */
  { a: L.date, b: L.poll, tr: "drop", r: (t) => {
    const t19 = wd(15, "نوزدهم"), tq = wd(15, "قضاوت"), flip = eo(prog(t, L.date, L.date + 0.35));
    const days = ["ی", "د", "س", "چ", "پ", "ج", "ش"];
    return (<>
      <Sunset t={t} />
      <div style={{ position: "absolute", left: 140, top: 230, width: 800, height: 820, borderRadius: 34, overflow: "hidden", background: CREAM, transform: `perspective(1400px) rotateX(${(1 - flip) * 80}deg)`, transformOrigin: "50% 0%", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
        <div style={{ height: 170, background: PINK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...txt(80, "H48Black") }}>نوامبر {fa(2026)}</div>
        </div>
        <div style={{ position: "relative", direction: "rtl", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "20px 24px", rowGap: 14 }}>
          {days.map((d) => <div key={d} style={{ textAlign: "center", ...txt(36, "H48Bold", "#9a8c99") }}>{d}</div>)}
          {Array.from({ length: 30 }, (_, i) => {
            const d = i + 1, hit = d === 19, on = hit && t >= t19;
            return <div key={d} style={{ position: "relative", textAlign: "center", ...txt(48, "H48Num", on ? CREAM : INK), height: 86, display: "flex", alignItems: "center", justifyContent: "center", zIndex: on ? 2 : 1 }}>
              {on && <div style={{ position: "absolute", width: 96, height: 96, borderRadius: 48, background: PINK, transform: `scale(${bo(prog(t, t19, t19 + 0.3))})`, boxShadow: `0 0 0 ${8 + 6 * Math.sin(t * 8)}px ${PINK}44` }} />}
              <span style={{ position: "relative" }}>{fa(d)}</span>
            </div>;
          })}
        </div>
      </div>
      <Chip t={t} t0={wd(15, "نوامبر")} y={1080} size={48} color={SUN} dark>پنج‌شنبه ۲۸ آبان ۱۴۰۵</Chip>
      <Stamp t={t} t0={tq} y={560} size={88} color={INK} rot={-10}>روز قضاوت</Stamp>
    </>);
  } },
  /* 27 · what do you think? revolution or hype — poll card + comment CTA */
  { a: L.poll, b: END, tr: "zoom", r: (t) => {
    const tR = wd(17, "انقلابه"), tH = wd(17, "هایپ"), k = bo(prog(t, L.poll, L.poll + 0.35)), cta = wd(17, "بزرگ");
    const opt = (y: number, icon: React.ReactNode, label: string, act: boolean, p: number) => (
      <div style={{ position: "absolute", left: 50, top: y, width: 720, height: 130, borderRadius: 30, background: act ? `${PINK}22` : "#f3ebe4", border: `5px solid ${act ? PINK : "#e2d6cc"}`, overflow: "hidden", transform: `scale(${act ? 1.04 : 1})` }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${p}%`, background: act ? `${PINK}44` : "transparent" }} />
        <div style={{ position: "absolute", right: 30, top: 18, display: "flex", gap: 20, alignItems: "center", ...txt(66, "H48Black", INK) }}>{icon}{label}</div>
      </div>
    );
    return (<>
      <Backdrop n="palm-twilight" t0={L.poll} len={6} dim={0.45} blur={6} from={10} />
      <div style={{ position: "absolute", left: 140, top: 300, width: 820, height: 640, borderRadius: 44, background: CREAM, transform: `scale(${k})`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)" }}>
        <div style={{ position: "absolute", left: 0, width: 820, top: 50, textAlign: "center", ...txt(70, "H48Black", INK) }}>تو چی فکر می‌کنی؟</div>
        <div style={{ position: "absolute", left: 0, width: 820, top: 150, textAlign: "center", ...txt(56, "H48Bebas", PINK), direction: "ltr", letterSpacing: 3 }}>GTA 6</div>
        {opt(240, <Flame s={80} />, "انقلابه", t >= tR && t < tH, 100 * eo(prog(t, tR, tR + 0.5)))}
        {opt(410, <Balloon s={80} />, "فقط هایپه", t >= tH, 100 * eo(prog(t, tH, tH + 0.5)))}
      </div>
      {t >= cta && <Center y={1000} style={{ gap: 18, transform: `scale(${bo(prog(t, cta, cta + 0.3))}) translateY(${10 * Math.sin(t * 6)}px)` }}>
        <Comment s={86} /><div style={{ ...txt(64, "H48Black"), textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>جوابت رو کامنت کن</div>
      </Center>}
    </>);
  } },
];

/* ───────── captions: 2–4 words, current word lights up */
const KEY = ["چهل", "میلیارد", "سیزده", "دیوونه", "نود", "سه", "میلیون", "رکورد", "وایس‌سیتی", "واقعی", "گرافیک", "جیسون", "لوسیا", "خطرناک", "سرقت", "تعقیب", "خیانت", "راز", "فریم", "سؤال", "متحول", "هیجان", "نوزدهم", "نوامبر", "قضاوت", "انقلابه", "هایپ", "GTA 6"];
type Ch = { ws: VW[]; s: number; e: number };
const CHUNKS: Ch[] = (() => {
  const out: Ch[] = [];
  for (const n of V.segs.map((s) => s.n)) {
    const ws = V.words.filter((w) => w.line === n);
    const k = Math.ceil(ws.length / 4), size = Math.ceil(ws.length / k);
    for (let i = 0; i < ws.length; i += size) out.push({ ws: ws.slice(i, i + size), s: ws[i].s, e: 0 });
  }
  out.forEach((c, i) => (c.e = out[i + 1] ? Math.min(out[i + 1].s, c.ws[c.ws.length - 1].e + 0.6) : c.ws[c.ws.length - 1].e + 0.8));
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CHUNKS.find((x) => t >= x.s - 0.04 && t < x.e);
  if (!c) return null;
  const k = eo(prog(t, c.s - 0.04, c.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 60, width: 960, top: 1300, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", padding: "10px 30px", borderRadius: 28, background: "rgba(12,7,20,0.62)", transform: `translateY(${(1 - k) * 24}px) scale(${0.94 + 0.06 * k})`, opacity: k }}>
        {c.ws.map((w, i) => {
          const on = t >= w.s - 0.03, cur = on && t < w.e + 0.05, kw = KEY.some((x) => bare(w.w).includes(x));
          const latin = /[A-Za-z]/.test(w.w);
          return <span key={i} style={{ ...txt(latin ? 74 : 66, latin ? "H48Bebas" : "H48Black", kw ? (on ? PINK : "#ff9cc6") : on ? CREAM : "rgba(255,244,234,0.55)"), direction: latin ? "ltr" : "rtl", transform: `scale(${cur ? 1.08 : 1})`, display: "inline-block", textShadow: cur ? `0 0 18px ${kw ? PINK : SUN}88` : "none" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── top bar: 5 chapters fill up */
const CHAP = [0, L.globe, L.street, L.fans, L.q, END];
const TopBar: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: 60, width: 960, top: 196, display: "flex", gap: 10, direction: "rtl" }}>
    {CHAP.slice(0, 5).map((a, i) => <div key={i} style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,244,234,0.22)", overflow: "hidden" }}><div style={{ width: `${prog(t, a, CHAP[i + 1]) * 100}%`, height: "100%", background: i === 4 ? PINK : SUN, marginRight: 0, marginLeft: "auto" }} /></div>)}
  </div>
);

/* ───────── scene transitions */
const enter = (tr: Sc["tr"], u: number): React.CSSProperties => {
  const k = eo(clamp(u / 0.22));
  switch (tr) {
    case "zoom": return { transform: `scale(${lerp(1.3, 1, k)})`, opacity: clamp(u / 0.1) };
    case "whip": return { transform: `translateX(${(1 - k) * 1100}px)`, filter: k < 1 ? `blur(${(1 - k) * 30}px)` : undefined };
    case "drop": return { transform: `translateY(${(1 - bo(clamp(u / 0.3))) * -1920}px)` };
    case "rise": return { transform: `translateY(${(1 - k) * 1920}px)` };
    case "glitch": return u < 0.16 ? { transform: `translateX(${(hash(Math.floor(u * 60)) - 0.5) * 80}px) skewX(${(hash(Math.floor(u * 60) + 3) - 0.5) * 20}deg)`, filter: `hue-rotate(${Math.floor(u * 60) * 50}deg) saturate(2)` } : {};
    default: return {};
  }
};

export const Video: React.FC<{ at?: number; audio?: string }> = ({ at, audio }) => {
  const f = useCurrentFrame();
  const t = at ?? f / FPS;
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
        {SCENES.map((s, i) => {
          if (t < s.a || t >= s.b + 0.35) return null;
          return <AbsoluteFill key={i} style={{ ...enter(s.tr, t - s.a), zIndex: i }}>{s.r(t)}</AbsoluteFill>;
        })}
        <AbsoluteFill style={{ zIndex: 100, pointerEvents: "none" }}>
          <Grain t={t} />
          <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(0,0,0,0.55)" }} />
          <TopBar t={t} />
          <Captions t={t} />
        </AbsoluteFill>
        {audio && <Html5Audio src={staticFile(audio)} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

export const LOOK = [0.1, 0.6, 1.3, ...SCENES.slice(1).map((s) => +(s.a + Math.min(1.1, (s.b - s.a) * 0.7)).toFixed(2)), wd(1, "میلیارد") + 0.4, wd(8, "واقعی") + 0.25, wd(12, "کردن") + 0.9, wd(12, "ندیدن") + 0.2, END - 0.3].sort((a, b) => a - b);
const Look: React.FC = () => { const f = useCurrentFrame(); return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />; };
const frames = Math.round(END * FPS);
export const V48Compositions: React.FC = () => (
  <>
    <Composition id="V48" component={Video} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{ audio: "v48/mix.wav" }} />
    <Composition id="V48-Silent" component={Video} durationInFrames={frames} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V48-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
