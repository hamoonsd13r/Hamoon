// V42 · shared pieces: timing, fonts, photo / phone / map / counter / icons, grain and HUD.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import clipsJson from "./clips.json";
import mapJson from "./map.json";

export const FPS = 30;
export type Clip = { file: string; shot: string; label: string; kind: "video" | "image"; w: number; h: number; dur: number | null; credit?: string };
export const CLIPS = clipsJson as unknown as Record<string, Clip>;
export const MAP = mapJson as unknown as { W: number; H: number; iran: string; len: number; others: { n: string; d: string }[]; cities: Record<string, [number, number]>; named: string[] };

export const INK = "#0A0B0D", PAPER = "#EFE9DD", MUTED = "#9A958C";
export const CH = { c88: "#4FC873", c96: "#E9A93B", c98: "#FF6B2C", c01: "#F3EEE6", c04: "#FF3B3B" } as const;

const fontHandle = typeof document !== "undefined" ? delayRender("v42 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all(
    [["V42Black", "fonts/Vazirmatn-Black.ttf"], ["V42Bold", "fonts/Vazirmatn-Bold.ttf"], ["V42Semi", "fonts/Vazirmatn-SemiBold.ttf"], ["V42Reg", "fonts/Vazirmatn-Regular.ttf"],
      ["V42Slogan", "fonts/Lalezar-Regular.ttf"], ["V42Mono", "fonts/ChakraPetch-SemiBold.ttf"]].map(([f, u]) =>
      new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x))),
  ).then(() => continueRender(fontHandle));
}

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInOut = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const backOut = (x: number) => { x = clamp(x); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const faNum = (n: number) => fa(Math.round(n).toLocaleString("en-US").replace(/,/g, "٬"));
export const kick = (t: number, t0: number, amp: number, dur = 0.45) => (t > t0 && t < t0 + dur ? amp * (1 - prog(t, t0, t0 + dur)) : 0);
/** local time in seconds inside the current <Sequence> */
export const useT = () => useCurrentFrame() / FPS;

// ───── timing from vo.json ─────
type VW = { w: string; s: number; e: number; line: number };
export type VO = { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const bare = (x: string) => x.replace(/[ً-ْ،.؟!…«»,:؛]/g, "");
export const timing = (vo: VO) => {
  const S = (n: number) => vo.segs.find((s) => s.n === n)!.start;
  const E = (n: number) => vo.segs.find((s) => s.n === n)!.end;
  const wd = (line: number, word: string, occ = 1) => {
    const ws = vo.words.filter((x) => x.line === line);
    const hit = ws.filter((x) => bare(x.w) === word);
    const w = hit[occ - 1] ?? ws.filter((x) => bare(x.w).includes(word))[occ - 1];
    if (!w) throw new Error(`v42: word not found: ${line} ${word}`);
    return w.s;
  };
  return { S, E, wd };
};

// ───── layers ─────
export const Grain: React.FC<{ o?: number }> = ({ o = 1 }) => {
  const f = useCurrentFrame();
  return <Img src={staticFile(`v42/grain${Math.floor(f / 2) % 4}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: o, mixBlendMode: "overlay", imageRendering: "pixelated" }} />;
};
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`, pointerEvents: "none" }} />
);

/** a scene window: fades in/out around [from, to] (seconds, absolute) */
export const Scene: React.FC<{ from: number; to: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode; z?: number }> = ({ from, to, fadeIn = 0.18, fadeOut = 0.22, children, z }) => {
  const a = Math.round(from * FPS), b = Math.round((to + fadeOut) * FPS);
  return (
    <Sequence from={a} durationInFrames={Math.max(1, b - a)} layout="none">
      <Fade dur={to - from} fadeIn={fadeIn} fadeOut={fadeOut} z={z}>{children}</Fade>
    </Sequence>
  );
};
const Fade: React.FC<{ dur: number; fadeIn: number; fadeOut: number; children: React.ReactNode; z?: number }> = ({ dur, fadeIn, fadeOut, children, z }) => {
  const t = useT();
  const o = Math.min(fadeIn > 0 ? prog(t, 0, fadeIn) : 1, fadeOut > 0 ? 1 - prog(t, dur, dur + fadeOut) : 1);
  return <AbsoluteFill style={{ opacity: o, zIndex: z }}>{children}</AbsoluteFill>;
};

// ───── media ─────
export const credit = (id: string) => CLIPS[id]?.credit ?? "";
/** photo with a slow camera move; faces in the file are already blurred */
export const Photo: React.FC<{ id: string; t: number; dur: number; x0?: number; y0?: number; x1?: number; y1?: number; z0?: number; z1?: number; style?: React.CSSProperties; grade?: number; tag?: boolean; tint?: string }> = ({ id, t, dur, x0 = 0, y0 = 0, x1 = 0, y1 = 0, z0 = 1.06, z1 = 1.16, style, grade = 0.8, tag = true, tint }) => {
  const u = easeInOut(prog(t, 0, dur + 0.4));
  const c = CLIPS[id];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img src={staticFile(c.file)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `translate(${lerp(x0, x1, u)}%, ${lerp(y0, y1, u)}%) scale(${lerp(z0, z1, u)})`, filter: `saturate(${grade}) contrast(1.06) brightness(0.92)` }} />
      {tint && <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "color", opacity: 0.55 }} />}
      {tag && <SourceTag id={id} />}
    </div>
  );
};
export const SourceTag: React.FC<{ id: string; side?: "left" | "right" }> = ({ id, side = "left" }) => {
  const c = CLIPS[id];
  return (
    <div style={{ position: "absolute", [side]: 28, bottom: 26, display: "flex", gap: 10, alignItems: "center", direction: "rtl", fontFamily: "V42Reg", fontSize: 21, color: "rgba(239,233,221,0.85)", textShadow: "0 1px 6px #000" }}>
      <span style={{ fontFamily: "V42Semi" }}>{c.label}</span>
      {c.credit && <span style={{ fontFamily: "V42Mono", fontSize: 16, opacity: 0.75, direction: "ltr" }}>{c.credit}</span>}
    </div>
  );
};
/** a clip from public/v42/footage, playing from `start` seconds of the file at the scene start */
export const Clip: React.FC<{ id: string; start?: number; style?: React.CSSProperties; fit?: "cover" | "contain"; grade?: number }> = ({ id, start = 0, style, fit = "cover", grade = 0.85 }) => (
  <OffthreadVideo src={staticFile(CLIPS[id].file)} muted startFrom={Math.round(start * FPS)} style={{ width: "100%", height: "100%", objectFit: fit, filter: `saturate(${grade}) contrast(1.05)`, ...style }} />
);
/** a vertical phone frame around a clip or photo */
export const Phone: React.FC<{ id: string; x: number; y: number; w?: number; rot?: number; start?: number; o?: number; s?: number; dim?: number; rec?: boolean; off?: number }> = ({ id, x, y, w = 330, rot = 0, start = 0, o = 1, s = 1, dim = 0, rec = true, off = 0 }) => {
  const h = w * 2.05, c = CLIPS[id], f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${s})`, opacity: o, borderRadius: w * 0.13, background: "#111", boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 0 0 2px #2a2a2a", padding: w * 0.035 }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.1, overflow: "hidden", background: "#000" }}>
        {c.kind === "video" ? <Clip id={id} start={start} /> : <Img src={staticFile(c.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "#000", opacity: Math.max(dim, off) }} />
        {rec && off < 0.5 && (
          <div style={{ position: "absolute", top: w * 0.07, left: w * 0.08, display: "flex", alignItems: "center", gap: 6, fontFamily: "V42Mono", fontSize: w * 0.055, color: "#fff", textShadow: "0 1px 4px #000" }}>
            <div style={{ width: w * 0.035, height: w * 0.035, borderRadius: "50%", background: "#ff3b3b", opacity: Math.floor(f / 15) % 2 ? 1 : 0.35 }} />REC
          </div>
        )}
        {off >= 0.5 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V42Bold", color: "#777", fontSize: w * 0.075, direction: "rtl" }}>بدون اتصال</div>}
        <div style={{ position: "absolute", top: 8, left: "50%", width: w * 0.28, height: w * 0.06, marginLeft: -w * 0.14, borderRadius: 99, background: "#000" }} />
      </div>
    </div>
  );
};

// ───── text ─────
export const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = PAPER, font = "V42Black", style }) => (
  <div style={{ direction: "rtl", fontFamily: font, fontSize: size, color, lineHeight: 1.15, textShadow: "0 6px 40px rgba(0,0,0,0.7)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
/** text that rises in word by word, starting at t0 (seconds, local) */
export const Rise: React.FC<{ text: string; t: number; t0: number; step?: number; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({ text, t, t0, step = 0.07, size = 90, color = PAPER, font = "V42Black", style }) => (
  <div style={{ direction: "rtl", display: "flex", gap: size * 0.28, flexWrap: "nowrap", justifyContent: "center", fontFamily: font, fontSize: size, color, lineHeight: 1.2, textShadow: "0 6px 34px rgba(0,0,0,0.75)", ...style }}>
    {text.split(" ").map((w, i) => {
      const u = easeOut(prog(t, t0 + i * step, t0 + i * step + 0.35));
      return <span key={i} style={{ display: "inline-block", opacity: u, transform: `translateY(${(1 - u) * 40}px)`, filter: `blur(${(1 - u) * 8}px)` }}>{w}</span>;
    })}
  </div>
);
export const Chip: React.FC<{ children: React.ReactNode; color?: string; t?: number; t0?: number; size?: number; style?: React.CSSProperties }> = ({ children, color = PAPER, t = 9, t0 = 0, size = 30, style }) => {
  const u = backOut(prog(t, t0, t0 + 0.4));
  return (
    <div style={{ direction: "rtl", display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.32}px ${size * 0.7}px`, borderRadius: 10, background: "rgba(10,11,13,0.82)", border: `2px solid ${color}`, color, fontFamily: "V42Bold", fontSize: size, opacity: clamp(u * 2), transform: `scale(${0.7 + 0.3 * u})`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", whiteSpace: "nowrap", ...style }}>{children}</div>
  );
};
export const Src: React.FC<{ children: React.ReactNode; t: number; t0: number; style?: React.CSSProperties }> = ({ children, t, t0, style }) => (
  <div style={{ direction: "rtl", fontFamily: "V42Reg", fontSize: 24, color: MUTED, opacity: prog(t, t0, t0 + 0.4), ...style }}>منبع: {children}</div>
);

// ───── counter ─────
export const Counter: React.FC<{ value: number; t: number; t0: number; dur?: number; size?: number; color?: string; plus?: boolean }> = ({ value, t, t0, dur = 1.2, size = 220, color = PAPER, plus }) => {
  const u = easeOut(prog(t, t0, t0 + dur));
  return <div style={{ fontFamily: "V42Black", fontSize: size, color, direction: "rtl", lineHeight: 1, textShadow: "0 10px 60px rgba(0,0,0,0.8)", transform: `scale(${1 + kick(t, t0 + dur, 0.06)})` }}>{faNum(value * u)}{plus && u > 0.99 ? "+" : ""}</div>;
};
/** n dots filling a grid; the first `mark` dots are highlighted */
export const DotField: React.FC<{ n: number; mark: number; t: number; t0: number; dur: number; w: number; cols: number; color: string; markColor: string }> = ({ n, mark, t, t0, dur, w, cols, color, markColor }) => {
  const r = w / cols;
  const rows = Math.ceil(n / cols);
  return (
    <svg width={w} height={rows * r} style={{ overflow: "visible" }}>
      {Array.from({ length: n }, (_, i) => {
        const on = prog(t, t0 + (i / n) * dur, t0 + (i / n) * dur + 0.15);
        const x = (cols - 1 - (i % cols)) * r + r / 2, y = Math.floor(i / cols) * r + r / 2;
        const m = i >= n - mark;
        return <circle key={i} cx={x} cy={y} r={r * 0.32 * (0.4 + 0.6 * on)} fill={m ? markColor : color} opacity={on * (m ? 1 : 0.8)} />;
      })}
    </svg>
  );
};

// ───── map ─────
export const IranMap: React.FC<{ w: number; draw?: number; fill?: string; stroke?: string; children?: React.ReactNode; others?: number }> = ({ w, draw = 1, fill = "rgba(239,233,221,0.06)", stroke = PAPER, children, others = 0.5 }) => {
  const k = w / MAP.W;
  return (
    <svg width={w} height={MAP.H * k} viewBox={`0 0 ${MAP.W} ${MAP.H}`} style={{ overflow: "visible" }}>
      {MAP.others.map((o) => <path key={o.n} d={o.d} fill="rgba(239,233,221,0.025)" stroke="rgba(239,233,221,0.14)" strokeWidth={1.2} opacity={others} />)}
      <path d={MAP.iran} fill={fill} opacity={clamp(draw * 1.5 - 0.5)} />
      <path d={MAP.iran} fill="none" stroke={stroke} strokeWidth={2.6} strokeDasharray={MAP.len} strokeDashoffset={MAP.len * (1 - draw)} strokeLinejoin="round" />
      {children}
    </svg>
  );
};
export const Pin: React.FC<{ city: string; t: number; t0: number; color: string; label?: string; r?: number; dx?: number; dy?: number; anchor?: "start" | "end" | "middle" }> = ({ city, t, t0, color, label, r = 9, dx = 18, dy = 8, anchor = "start" }) => {
  const [x, y] = MAP.cities[city];
  const u = backOut(prog(t, t0, t0 + 0.4)), ring = (t - t0) % 1.6;
  if (t < t0) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={r + ring * 26} fill="none" stroke={color} strokeWidth={2} opacity={(1 - ring / 1.6) * 0.8} />
      <circle cx={x} cy={y} r={r * u} fill={color} />
      {label && <text x={x + dx} y={y + dy} fill={PAPER} fontFamily="V42Bold" fontSize={30} textAnchor={anchor} style={{ direction: "rtl" }} opacity={clamp(u)} stroke="#000" strokeWidth={5} paintOrder="stroke">{label}</text>}
    </g>
  );
};

// ───── icons (line drawings) ─────
type IP = { s?: number; c?: string; sw?: number };
const I: React.FC<IP & { children: React.ReactNode }> = ({ s = 120, c = PAPER, sw = 4, children }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
export const IcBallot: React.FC<IP & { drop?: number }> = ({ drop = 1, ...p }) => (
  <I {...p}><rect x="18" y="48" width="64" height="40" rx="4" /><line x1="36" y1="48" x2="64" y2="48" strokeWidth={7} /><g transform={`translate(0 ${-30 * (1 - drop)})`} opacity={clamp(2 - drop * 1.6)}><rect x="38" y="14" width="24" height="30" rx="2" /><path d="M43 26 l5 5 l9 -10" /></g></I>
);
export const IcBread: React.FC<IP> = (p) => (<I {...p}><path d="M16 56 C16 34 84 34 84 56 L80 74 C79 80 21 80 20 74 Z" /><path d="M32 46 l6 10 M48 44 l6 10 M64 46 l6 10" /></I>);
export const IcFuel: React.FC<IP> = (p) => (<I {...p}><rect x="20" y="22" width="38" height="64" rx="4" /><rect x="27" y="30" width="24" height="16" rx="2" /><path d="M58 40 h8 l10 10 v26 a5 5 0 0 1 -10 0 v-14 h-8" /><path d="M14 86 h52" /></I>);
export const IcWoman: React.FC<IP> = (p) => (<I {...p}><circle cx="50" cy="34" r="16" /><path d="M34 34 C30 60 26 70 18 82 M66 34 C70 60 76 70 84 82" /><path d="M30 88 C34 66 66 66 70 88" /></I>);
export const IcCash: React.FC<IP> = (p) => (<I {...p}><rect x="12" y="30" width="76" height="42" rx="4" /><circle cx="50" cy="51" r="10" /><path d="M22 40 v22 M78 40 v22" /><path d="M30 82 L70 18" stroke="#FF3B3B" /></I>);
export const IcMsg: React.FC<IP> = (p) => (<I {...p}><path d="M14 22 h72 v46 h-40 l-16 14 v-14 h-16 z" /><path d="M30 40 h40 M30 52 h26" /></I>);
export const IcPlane: React.FC<IP> = (p) => (<I {...p}><path d="M12 48 L88 18 L74 84 L50 62 L40 80 L38 58 Z" /><path d="M38 58 L88 18" /></I>);
export const IcCam: React.FC<IP> = (p) => (<I {...p}><rect x="16" y="16" width="68" height="68" rx="20" /><circle cx="50" cy="50" r="16" /><circle cx="70" cy="30" r="3" fill={p.c ?? PAPER} /></I>);
export const IcChat: React.FC<IP> = (p) => (<I {...p}><path d="M50 14 a36 36 0 1 1 -30 56 l-6 16 l16 -6 a36 36 0 0 0 20 -66" /><path d="M38 40 c0 10 12 22 22 22 l4 -6 l-8 -4 l-4 4 c-4 -2 -8 -6 -10 -10 l4 -4 l-4 -8 z" /></I>);
export const IcLock: React.FC<IP> = (p) => (<I {...p}><rect x="22" y="44" width="56" height="42" rx="6" /><path d="M34 44 v-12 a16 16 0 0 1 32 0 v12" /><circle cx="50" cy="64" r="5" /></I>);
export const IcMoon: React.FC<IP> = (p) => (<I {...p}><path d="M64 14 a36 36 0 1 0 22 48 a28 28 0 0 1 -22 -48 z" /></I>);
export const IcCross: React.FC<IP> = (p) => (<I {...p}><path d="M40 16 h20 v24 h24 v20 h-24 v24 h-20 v-24 h-24 v-20 h24 z" /></I>);

// ───── HUD: connection + timeline ─────
export const Signal: React.FC<{ level: number; color?: string; s?: number; label?: boolean }> = ({ level, color = PAPER, s = 1, label = true }) => {
  const f = useCurrentFrame();
  const flick = level < 0.08 ? (Math.floor(f / 9) % 3 === 0 ? 0.25 : 0.6) : 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 * s, direction: "ltr" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5 * s }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = clamp(level * 5 - i);
          return <div key={i} style={{ width: 9 * s, height: (12 + i * 8) * s, borderRadius: 2, background: on > 0.02 ? color : "rgba(239,233,221,0.18)", opacity: on > 0.02 ? 0.35 + 0.65 * on : flick }} />;
        })}
      </div>
      {label && <div style={{ fontFamily: "V42Mono", fontSize: 26 * s, color: level < 0.08 ? "#FF3B3B" : color, minWidth: 80 * s, opacity: level < 0.08 ? flick + 0.3 : 1 }}>{fa(Math.round(level * 100))}٪</div>}
      {label && <div style={{ fontFamily: "V42Reg", fontSize: 22 * s, color: MUTED, direction: "rtl" }}>اتصال</div>}
    </div>
  );
};
export const YEARS = [
  { y: "۱۳۸۸", c: CH.c88, k: "رأی" }, { y: "۱۳۹۶", c: CH.c96, k: "نان" }, { y: "۱۳۹۸", c: CH.c98, k: "بنزین" }, { y: "۱۴۰۱", c: CH.c01, k: "زن، زندگی، آزادی" }, { y: "۱۴۰۴", c: CH.c04, k: "خاموشی" },
];
/** five-node ribbon; `pos` = 0…4 (fractional while moving), `lit` = how many nodes have been reached */
export const Ribbon: React.FC<{ w: number; pos: number; s?: number; labels?: boolean }> = ({ w, pos, s = 1, labels = true }) => {
  const step = w / 4;
  const xOf = (i: number) => w - i * step; // RTL: 1388 on the right
  const head = xOf(clamp(pos, 0, 4));
  return (
    <div style={{ position: "relative", width: w, height: 70 * s }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 20 * s, height: 2 * s, background: "rgba(239,233,221,0.2)" }} />
      <div style={{ position: "absolute", left: head, right: 0, top: 20 * s, height: 2 * s, background: PAPER, opacity: 0.8 }} />
      {YEARS.map((Y, i) => {
        const reached = pos >= i - 0.02, cur = Math.abs(pos - i) < 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: xOf(i), top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: (cur ? 20 : 12) * s, height: (cur ? 20 : 12) * s, marginTop: (cur ? 11 : 15) * s, borderRadius: "50%", background: reached ? Y.c : INK, border: `${2 * s}px solid ${reached ? Y.c : "rgba(239,233,221,0.35)"}`, boxShadow: cur ? `0 0 ${18 * s}px ${Y.c}` : "none" }} />
            {labels && <div style={{ marginTop: 8 * s, fontFamily: cur ? "V42Black" : "V42Semi", fontSize: (cur ? 26 : 21) * s, color: reached ? (cur ? Y.c : PAPER) : MUTED }}>{Y.y}</div>}
          </div>
        );
      })}
    </div>
  );
};
