// V26 · «اگه ذهن همه رو می‌خوندی» — عکس‌های سینمایی ChatGPT کاربر (public/v26/img/NN = عکس NN پرامپت‌ها)
// زبان: Story Montage (دوربین همیشه در حرکت، ترنزیشن‌های متنوع، دانه و وینیت) + اسکن کهربایی Hologram HUD روی سر هر کس
// که ذهنش خوانده می‌شود، و فکرش کلمه‌به‌کلمه هم‌زمان با صدای خودش روی کارت HUD. زمان همه‌چیز از vo.json.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capsJson from "./captions.json";

type Word = { w: string; s: number; e: number; line: number };
type Seg = { n: number; sp: string; start: number; end: number };
type CapW = { w: string; kw: boolean; s: number; e: number };
type Cap = { words: CapW[]; s: number; e: number; line: number };
const VO = voJson as { total: number; segs: Seg[]; words: Word[] };
const CAPS = capsJson as Cap[];
const FPS = 30, W = 1080, H = 1920;
const IW = 941, IH = 1672, S0 = Math.max(W / IW, H / IH);

const fontHandle = typeof document !== "undefined" ? delayRender("v26 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V26Black", "fonts/Vazirmatn-Black.ttf"], ["V26Bold", "fonts/Vazirmatn-Bold.ttf"], ["V26Code", "fonts/VazirCode.ttf"],
    ["V26Num", "fonts/ChakraPetch-Bold.ttf"], ["V26NumM", "fonts/ChakraPetch-Medium.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && x.w.includes(word));
  if (!w) throw new Error(`v26: no word ${word} in line ${line}`);
  return w.s;
};
const seg = (n: number) => VO.segs.find((s) => s.n === n)!;
const cut = (t: number) => t - 0.08;

const AMBER = "#FFB347", HOT = "#FFF0C8", RED = "#FF4B3A";
const TOTAL = VO.total + 2.6;
export const V26_FRAMES = Math.round(TOTAL * FPS);
const END_AT = seg(18).end + 0.9; // end card

/* ───────── camera over a photo ───────── */
type Key = [number, number, number, number]; // [t, focus x, focus y (image fractions), zoom ≥ 1.04]
type Place = { left: number; top: number; dw: number; dh: number };
const camAt = (keys: Key[], T: number) => {
  if (T <= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (T <= b[0]) { const k = easeInOut(prog(T, a[0], b[0])); return [T, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k] as Key; }
  }
  return keys[keys.length - 1];
};
const place = (keys: Key[], T: number, shake = 0): Place => {
  const [, fx, fy, z] = camAt(keys, T);
  const dw = IW * S0 * z, dh = IH * S0 * z;
  const hx = (noise(T * 0.7) - 0.5) * 12 + Math.sin(T * 61) * shake, hy = (noise(T * 0.6 + 5) - 0.5) * 10 + Math.cos(T * 53) * shake;
  return { left: clamp(W / 2 - fx * dw + hx, W - dw, 0), top: clamp(H / 2 - fy * dh + hy, H - dh, 0), dw, dh };
};
const at = (p: Place, ix: number, iy: number) => ({ x: p.left + ix * p.dw, y: p.top + iy * p.dh });

/* ───────── shots ───────── */
type Tin = "cut" | "whip" | "whipL" | "zoom" | "flash" | "glitch" | "fade" | "black";
type Shot = { img: string; from: number; to: number; keys: Key[]; tin: Tin; grade?: string; shake?: (T: number) => number; over?: (T: number, p: Place) => React.ReactNode };
const TD: Record<Tin, number> = { cut: 0, whip: 0.32, whipL: 0.32, zoom: 0.4, flash: 0.35, glitch: 0.28, fade: 0.7, black: 0.9 };
const push = (a: number, b: number, fx: number, fy: number, z0: number, z1: number, fx1 = fx, fy1 = fy): Key[] => [[a, fx, fy, z0], [b, fx1, fy1, z1]];

/* thought card + scan brackets ------------------------------------------------ */
type Box = [number, number, number, number]; // image fractions x, y, w, h
const Brackets: React.FC<{ p: Place; box: Box; from: number; T: number; color?: string; label?: string; pct?: number | null; flat?: boolean }> = ({ p, box, from, T, color = AMBER, label = "ذهن‌خوانی", pct, flat }) => {
  if (T < from) return null;
  const a = at(p, box[0], box[1]), b = at(p, box[0] + box[2], box[1] + box[3]);
  const k = easeOut(prog(T, from, from + 0.28));
  const grow = (1 - k) * 60;
  const x0 = a.x - grow, y0 = a.y - grow, x1 = b.x + grow, y1 = b.y + grow;
  const L = Math.min(46, (x1 - x0) * 0.22);
  const flick = T - from < 0.35 ? (hash(Math.floor(T * 30)) > 0.4 ? 1 : 0.3) : 0.92 + 0.08 * Math.sin(T * 9);
  const sp = prog(T, from + 0.1, from + 1.0); // scan line pass
  const scanY = y0 + (y1 - y0) * easeInOut(sp);
  const P = pct === undefined ? Math.round(easeOut(prog(T, from, from + 0.9)) * 100) : pct;
  const corner = (cx: number, cy: number, dx: number, dy: number) => `M${cx + dx * L},${cy} L${cx},${cy} L${cx},${cy + dy * L}`;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: k * flick, overflow: "visible" }}>
      <defs>
        <linearGradient id="v26scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0" /><stop offset="1" stopColor={color} stopOpacity="0.45" /></linearGradient>
      </defs>
      <g stroke={color} strokeWidth={5} fill="none" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>
        <path d={corner(x0, y0, 1, 1)} /><path d={corner(x1, y0, -1, 1)} /><path d={corner(x0, y1, 1, -1)} /><path d={corner(x1, y1, -1, -1)} />
      </g>
      {sp > 0 && sp < 1 && <>
        <rect x={x0} y={Math.max(y0, scanY - 90)} width={x1 - x0} height={Math.min(90, scanY - y0)} fill="url(#v26scan)" />
        <line x1={x0} x2={x1} y1={scanY} y2={scanY} stroke={HOT} strokeWidth={3} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      </>}
      {flat && <path d={Array.from({ length: 40 }, (_, i) => `${i ? "L" : "M"}${x0 + ((x1 - x0) * i) / 39},${(y0 + y1) / 2 + (hash(i + Math.floor(T * 12)) - 0.5) * 3}`).join(" ")}
        stroke={color} strokeWidth={3} fill="none" opacity={0.85} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />}
      <g transform={`translate(${x0}, ${y0 - 20})`}>
        <rect x={0} y={-44} width={Math.max(250, x1 - x0)} height={44} fill="rgba(8,5,2,0.62)" />
        <rect x={0} y={-44} width={6} height={44} fill={color} />
        {P !== null && <text x={18} y={-12} fontFamily="V26Num" fontSize={28} fill={color} letterSpacing={1}>{`${P}%`}</text>}
        <text x={Math.max(250, x1 - x0) - 14} y={-12} fontFamily="V26Code" fontSize={26} fill={HOT} textAnchor="end" direction="rtl">{label}</text>
      </g>
    </svg>
  );
};

const CHIP_Y = 1250;
const Thought: React.FC<{ line: number; T: number; who: string; tone?: "amber" | "warm" | "red"; y?: number; size?: number; from?: { x: number; y: number } }> = ({ line, T, who, tone = "amber", y = CHIP_Y, size = 60, from }) => {
  const s = seg(line);
  if (T < s.start - 0.15) return null;
  const color = tone === "red" ? RED : AMBER;
  const k = easeOut(prog(T, s.start - 0.15, s.start + 0.15));
  const words = VO.words.filter((w) => w.line === line);
  const glow = tone === "warm" ? 0.35 : 0.6;
  return (
    <>
      {from && <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={from.x} y1={from.y} x2={from.x + (W / 2 - from.x) * k} y2={from.y + (y - 40 - from.y) * k} stroke={color} strokeWidth={3}
          strokeDasharray={tone === "warm" ? undefined : "10 8"} opacity={0.75} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        <circle cx={from.x} cy={from.y} r={8} fill={color} opacity={k} />
      </svg>}
      <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${0.94 + 0.06 * k})` }}>
        <div style={{ position: "relative", padding: "26px 40px 30px", background: tone === "warm" ? "rgba(20,10,2,0.55)" : "rgba(8,5,2,0.68)", border: `2px solid ${color}`,
          boxShadow: `0 0 34px rgba(255,${tone === "red" ? 60 : 160},60,${glow}), inset 0 0 24px rgba(255,160,60,0.12)`, borderRadius: tone === "warm" ? 26 : 6, direction: "rtl", textAlign: "center", maxWidth: 940 }}>
          <div style={{ position: "absolute", top: -22, right: 28, padding: "2px 16px", background: color, color: "#120A02", fontFamily: "V26Bold", fontSize: 26 }}>{who}</div>
          <div style={{ fontFamily: "V26Black", fontSize: size, lineHeight: 1.45, color: HOT }}>
            {words.map((w, i) => {
              const a = easeOut(prog(T, w.s - 0.06, w.s + 0.16));
              return <span key={i} style={{ opacity: 0.12 + 0.88 * a, filter: `blur(${(1 - a) * 6}px)`, textShadow: a > 0.5 ? `0 0 18px rgba(255,170,80,${0.55 * a})` : undefined }}>{w.w}{" "}</span>;
            })}
          </div>
          <Wave T={T} on={T >= s.start && T <= s.end + 0.1} color={color} />
        </div>
      </div>
    </>
  );
};
const Wave: React.FC<{ T: number; on: boolean; color: string }> = ({ T, on, color }) => (
  <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 10, height: 26, alignItems: "center" }}>
    {Array.from({ length: 22 }, (_, i) => {
      const h = on ? 5 + 20 * Math.abs(Math.sin(T * 14 + i * 1.7) * noise(T * 9 + i)) : 3;
      return <div key={i} style={{ width: 5, height: h, background: color, opacity: 0.8, borderRadius: 2 }} />;
    })}
  </div>
);

/* special overlays -------------------------------------------------------------- */
const Crowd: React.FC<{ p: Place; T: number; from: number }> = ({ p, T, from }) => {
  const heads: [number, number][] = [[0.19, 0.46], [0.83, 0.425]];
  const chips = ["دیرم شد", "قسط این ماه…"];
  return <>{heads.map(([x, y], i) => {
    const t0 = from + i * 0.18;
    if (T < t0) return null;
    const c = at(p, x, y), a = easeOut(prog(T, t0, t0 + 0.2)) * (0.75 + 0.25 * Math.sin(T * 7 + i));
    return <div key={i} style={{ position: "absolute", left: c.x - 65, top: c.y - 75, width: 130, height: 130, opacity: a }}>
      <div style={{ position: "absolute", inset: 0, border: `3px solid ${AMBER}`, borderRadius: 4, clipPath: "polygon(0 0,30% 0,30% 6%,6% 6%,6% 30%,0 30%,0 70%,6% 70%,6% 94%,30% 94%,30% 100%,70% 100%,70% 94%,94% 94%,94% 70%,100% 70%,100% 30%,94% 30%,94% 6%,70% 6%,70% 0,100% 0,100% 100%,0 100%)", boxShadow: `0 0 10px ${AMBER}` }} />
      <div style={{ position: "absolute", top: -54, left: clamp(c.x - 110, 30, W - 250) - (c.x - 65), width: 220, textAlign: "center", whiteSpace: "nowrap", background: "rgba(8,5,2,0.75)", borderRight: `5px solid ${AMBER}`, color: HOT, fontFamily: "V26Code", fontSize: 30, padding: "4px 10px", direction: "rtl" }}>{chips[i]}</div>
    </div>;
  })}</>;
};
const Num: React.FC<{ T: number }> = ({ T }) => {
  const t30 = wd(6, "شصت") - 0.25, t60 = wd(6, "شصت");
  if (T < t30) return null;
  const a = easeOut(prog(T, t30, t30 + 0.2)), strike = easeOut(prog(T, t60 - 0.05, t60 + 0.12)), s = easeOut(prog(T, t60, t60 + 0.18));
  const shake = T > t60 && T < t60 + 0.3 ? Math.sin(T * 90) * 10 * (1 - prog(T, t60, t60 + 0.3)) : 0;
  return (
    <div style={{ position: "absolute", left: 300, right: 0, top: 300, textAlign: "center", transform: `translateX(${shake}px)` }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: "V26Num", fontSize: 100, color: HOT, opacity: a, direction: "rtl", textShadow: "0 0 6px rgba(0,0,0,0.9), 0 4px 22px rgba(0,0,0,0.9)" }}>
        <span>30</span> <span style={{ fontFamily: "V26Black", fontSize: 54 }}>میلیون</span>
        <div style={{ position: "absolute", left: -10, top: "52%", height: 8, width: `${strike * 110}%`, background: RED, boxShadow: `0 0 12px ${RED}`, transform: "rotate(-6deg)" }} />
      </div>
      <div style={{ fontFamily: "V26Num", fontSize: 210, lineHeight: 1, whiteSpace: "nowrap", color: AMBER, opacity: s, transform: `scale(${1.6 - 0.6 * s})`, textShadow: `0 0 40px rgba(255,170,60,0.8), 0 8px 30px rgba(0,0,0,0.8)`, direction: "rtl" }}>
        60 <span style={{ fontFamily: "V26Black", fontSize: 92, color: HOT }}>میلیون</span>
      </div>
    </div>
  );
};
const Dent: React.FC<{ p: Place; T: number }> = ({ p, T }) => {
  const t0 = seg(8).start - 0.1;
  if (T < t0) return null;
  const c = at(p, 0.47, 0.565), r = 0.13 * p.dw, k = easeOut(prog(T, t0, t0 + 0.5));
  return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
    <circle cx={c.x} cy={c.y} r={r} fill="none" stroke={RED} strokeWidth={7} strokeDasharray={`${2 * Math.PI * r * k} 9999`} transform={`rotate(-90 ${c.x} ${c.y})`} style={{ filter: `drop-shadow(0 0 10px ${RED})` }} />
    <circle cx={c.x} cy={c.y} r={r + 16 + 6 * Math.sin(T * 6)} fill="none" stroke={RED} strokeWidth={2} opacity={0.5 * k} />
  </svg>;
};
const Ticker: React.FC<{ T: number }> = ({ T }) => {
  const t0 = wd(11, "بورس") - 0.2, t1 = wd(11, "میلیاردر");
  if (T < t0) return null;
  const a = easeOut(prog(T, t0, t0 + 0.3)), d = easeOut(prog(T, t0, t1 + 0.6));
  const pts = Array.from({ length: 30 }, (_, i) => { const x = i / 29; return [60 + x * 960, 520 - (x * x * 300 + (hash(i * 3) - 0.5) * 60 * (1 - x * 0.5))]; });
  const n = Math.max(2, Math.round(pts.length * d));
  const path = pts.slice(0, n).map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const money = Math.round(easeInOut(prog(T, t0 + 0.2, t1 + 0.5)) * 1e9).toLocaleString("en-US");
  const last = pts[n - 1];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs><linearGradient id="v26fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={AMBER} stopOpacity="0.35" /><stop offset="1" stopColor={AMBER} stopOpacity="0" /></linearGradient></defs>
        <path d={`${path} L${last[0]},560 L60,560 Z`} fill="url(#v26fill)" />
        <path d={path} stroke={AMBER} strokeWidth={5} fill="none" style={{ filter: `drop-shadow(0 0 10px ${AMBER})` }} />
        <circle cx={last[0]} cy={last[1]} r={10 + 3 * Math.sin(T * 10)} fill={HOT} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "V26Num", fontSize: 104, color: HOT, textShadow: `0 0 30px rgba(255,170,60,0.85), 0 6px 20px rgba(0,0,0,0.9)` }}>
        {money}
        <div style={{ fontFamily: "V26Bold", fontSize: 40, color: AMBER, direction: "rtl" }}>تومن</div>
      </div>
    </div>
  );
};

/* ───────── shot list (cuts sit 0.08 s before the word) ───────── */
const c2 = cut(wd(1, "ذهن")), c3 = cut(seg(2).start), c4 = cut(seg(3).start), c5 = cut(seg(4).start), c6 = cut(seg(6).start), c7 = cut(seg(7).start);
const c8 = cut(seg(8).start), c9 = cut(seg(9).start), c10 = cut(seg(11).start), c11 = cut(seg(12).start), c12 = cut(seg(14).start), c13 = cut(seg(15).start);
const c14 = cut(seg(16).start), c15 = cut(seg(17).start), c16 = cut(seg(18).start);
const NIGHT = "brightness(0.95) contrast(1.1) saturate(0.9)";
const SHOTS: Shot[] = [
  { img: "01", from: 0, to: c2, tin: "cut", keys: push(0, c2, 0.5, 0.42, 1.08, 1.22) },
  { img: "02", from: c2, to: c3, tin: "zoom", keys: push(c2, c3, 0.5, 0.4, 1.3, 1.06),
    over: (T, p) => <Crowd p={p} T={T} from={c2 + 0.35} /> },
  { img: "03", from: c3, to: c4, tin: "whip", keys: push(c3, c4, 0.6, 0.4, 1.06, 1.38, 0.7, 0.36),
    over: (T, p) => <Brackets p={p} box={[0.6, 0.25, 0.25, 0.2]} from={wd(2, "دلش") - 0.1} T={T} /> },
  { img: "04", from: c4, to: c5, tin: "flash", keys: push(c4, c5, 0.56, 0.36, 1.14, 1.28),
    over: (T, p) => <><Brackets p={p} box={[0.36, 0.25, 0.33, 0.24]} from={c4} T={T} pct={100} label="ذهنِ کراش" /><Thought line={3} T={T} who="فکرِ کراش" from={at(p, 0.52, 0.5)} /></> },
  { img: "05", from: c5, to: c6, tin: "glitch", keys: push(c5, c6, 0.5, 0.36, 1.06, 1.32, 0.5, 0.3),
    over: (T, p) => <><Brackets p={p} box={[0.36, 0.25, 0.28, 0.21]} from={wd(4, "ذهنش") - 0.1} T={T} label="ذهنِ رئیس" /><Thought line={5} T={T} who="فکرِ رئیس" from={at(p, 0.5, 0.47)} /></> },
  { img: "06", from: c6, to: c7, tin: "flash", keys: push(c6, c7, 0.42, 0.56, 1.12, 1.3), shake: (T) => (T > wd(6, "شصت") && T < wd(6, "شصت") + 0.3 ? 6 : 0),
    over: (T) => <Num T={T} /> },
  { img: "07", from: c7, to: c8, tin: "whipL", keys: [[c7, 0.4, 0.5, 1.1], [wd(7, "فروشنده"), 0.55, 0.42, 1.2], [c8, 0.56, 0.36, 1.34]],
    over: (T, p) => <Brackets p={p} box={[0.46, 0.2, 0.17, 0.13]} from={wd(7, "ذهنش") - 0.3} T={T} label="ذهنِ فروشنده" /> },
  { img: "08", from: c8, to: c9, tin: "zoom", keys: push(c8, c9, 0.5, 0.55, 1.08, 1.32, 0.48, 0.57),
    over: (T, p) => <><Dent p={p} T={T} /><Thought line={8} T={T} who="فکرِ فروشنده" y={1330} /></> },
  { img: "09", from: c9, to: c10, tin: "fade", keys: [[c9, 0.45, 0.5, 1.06], [wd(9, "هنوز"), 0.6, 0.36, 1.3], [c10, 0.62, 0.33, 1.5]],
    over: (T, p) => <><Brackets p={p} box={[0.56, 0.2, 0.17, 0.14]} from={wd(9, "هنوز") + 0.2} T={T} label="ذهنِ عشق سابق" /><Thought line={10} T={T} who="فکرِ عشق سابق" from={at(p, 0.645, 0.35)} /></> },
  { img: "10", from: c10, to: c11, tin: "whip", keys: push(c10, c11, 0.3, 0.5, 1.12, 1.24, 0.5, 0.45),
    over: (T) => <Ticker T={T} /> },
  { img: "11", from: c11, to: c12, tin: "fade", keys: [[c11, 0.4, 0.5, 1.04], [wd(12, "ذهنش"), 0.55, 0.45, 1.22], [c12, 0.6, 0.44, 1.34]],
    over: (T, p) => <><Brackets p={p} box={[0.53, 0.3, 0.22, 0.16]} from={wd(12, "ذهنش") - 0.15} T={T} label="ذهنِ بابا" color="#FFC98A" /><Thought line={13} T={T} who="فکرِ بابا" tone="warm" from={at(p, 0.64, 0.46)} /></> },
  { img: "12", from: c12, to: c13, tin: "black", keys: push(c12, c13, 0.5, 0.45, 1.04, 1.2, 0.55, 0.5), grade: NIGHT },
  { img: "13", from: c13, to: c14, tin: "glitch", keys: push(c13, c14, 0.5, 0.42, 1.06, 1.14), grade: NIGHT,
    over: (T, p) => <>
      <Brackets p={p} box={[0.11, 0.27, 0.15, 0.1]} from={wd(15, "ذهن") - 0.1} T={T} color={RED} label="ترس" pct={88 + Math.round(noise(T * 8) * 9)} />
      <Brackets p={p} box={[0.78, 0.36, 0.16, 0.1]} from={wd(15, "دو") - 0.05} T={T} color={RED} label="ترس" pct={91 + Math.round(noise(T * 7 + 3) * 8)} />
    </> },
  { img: "14", from: c14, to: c15, tin: "cut", keys: push(c14, c15, 0.5, 0.42, 1.06, 1.22), grade: NIGHT,
    over: (T, p) => <Brackets p={p} box={[0.2, 0.12, 0.62, 0.5]} from={wd(16, "ذهنش") - 0.1} T={T} label="سیگنال ذهن" pct={T > wd(16, "ذهنش") + 0.6 ? 0 : Math.round(hash(Math.floor(T * 20)) * 40)} flat /> },
  { img: "15", from: c15, to: c16, tin: "black", keys: push(c15, c16, 0.5, 0.33, 1.08, 1.5, 0.5, 0.27), grade: NIGHT },
  { img: "16", from: c16, to: TOTAL, tin: "glitch", keys: push(c16, END_AT, 0.45, 0.4, 1.06, 1.22), grade: NIGHT, shake: (T) => (T < c16 + 0.4 ? 4 : 0),
    over: (T, p) => <><Brackets p={p} box={[0.16, 0.12, 0.58, 0.5]} from={c16} T={T} color={RED} label="ذهنِ تو" /><Thought line={18} T={T} who="صدای ناشناس" tone="red" size={74} y={1180} /></> },
];

/* glitch: horizontal strips of the same frame, displaced */
const GLITCH = [[c5, 0.28], [c13, 0.28], [c16, 0.3], [wd(17, "صدا"), 0.22], [wd(17, "سرت"), 0.16], [wd(16, "ساکته") + 0.1, 0.14]] as const;
const glitchK = (T: number) => { for (const [t0, d] of GLITCH) if (T >= t0 && T < t0 + d) return 1 - (T - t0) / d; return 0; };

const ShotImg: React.FC<{ d: Shot; T: number; style?: React.CSSProperties; dx?: number }> = ({ d, T, style, dx = 0 }) => {
  const p = place(d.keys, T, d.shake?.(T) ?? 0);
  return <Img src={staticFile(`v26/img/${d.img}.jpg`)} style={{ position: "absolute", left: p.left + dx, top: p.top, width: p.dw, height: p.dh, maxWidth: "none",
    filter: d.grade ?? "contrast(1.05) saturate(0.95)", ...style }} />;
};
const ShotView: React.FC<{ i: number; T: number }> = ({ i, T }) => {
  const d = SHOTS[i], prev = SHOTS[i - 1];
  const td = TD[d.tin], k = td ? prog(T, d.from, d.from + td) : 1;
  const p = place(d.keys, T, d.shake?.(T) ?? 0);
  const g = glitchK(T);
  let layers: React.ReactNode;
  if (k < 1 && prev) {
    const e = easeOut(k);
    if (d.tin === "whip" || d.tin === "whipL") {
      const dir = d.tin === "whip" ? 1 : -1, b = Math.round(Math.sin(Math.PI * k) * 40);
      layers = <>
        <AbsoluteFill style={{ transform: `translateX(${-dir * e * W}px)`, filter: `url(#v26mb${b > 25 ? 40 : b > 8 ? 16 : 0})` }}><ShotImg d={prev} T={T} /></AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${dir * (1 - e) * W}px)`, filter: `url(#v26mb${b > 25 ? 40 : b > 8 ? 16 : 0})` }}><ShotImg d={d} T={T} /></AbsoluteFill>
      </>;
    } else if (d.tin === "zoom") {
      layers = <>
        <AbsoluteFill style={{ transform: `scale(${1 + e * 0.6})`, opacity: 1 - prog(k, 0, 0.45), filter: `blur(${e * 10}px)` }}><ShotImg d={prev} T={T} /></AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${1.35 - 0.35 * e})`, opacity: prog(k, 0.1, 0.5), filter: `blur(${(1 - e) * 8}px)` }}><ShotImg d={d} T={T} /></AbsoluteFill>
      </>;
    } else if (d.tin === "fade") {
      layers = <><ShotImg d={prev} T={T} style={{ opacity: 1 - k }} /><ShotImg d={d} T={T} style={{ opacity: easeInOut(k) }} /></>;
    } else if (d.tin === "black") {
      layers = k < 0.45 ? <ShotImg d={prev} T={T} style={{ opacity: 1 - prog(k, 0, 0.45) }} /> : <ShotImg d={d} T={T} style={{ opacity: prog(k, 0.45, 1) }} />;
    } else layers = <ShotImg d={d} T={T} />;
  } else layers = <ShotImg d={d} T={T} />;
  return (
    <AbsoluteFill>
      {layers}
      {g > 0 && [0, 1, 2, 3].map((s) => {
        const y0 = hash(s + Math.floor(T * 30) * 7) * 0.85, h = 0.04 + hash(s * 3 + Math.floor(T * 30)) * 0.12;
        return <AbsoluteFill key={s} style={{ clipPath: `inset(${y0 * 100}% 0 ${Math.max(0, 100 - (y0 + h) * 100)}% 0)`, mixBlendMode: s % 2 ? "screen" : "normal" }}>
          <ShotImg d={d} T={T} dx={(hash(s * 11 + Math.floor(T * 30)) - 0.5) * 140 * g} style={s % 2 ? { filter: "sepia(1) saturate(6) hue-rotate(-40deg)", opacity: 0.6 } : undefined} />
        </AbsoluteFill>;
      })}
      {d.tin === "flash" && k < 1 && <AbsoluteFill style={{ mixBlendMode: "screen", background: `radial-gradient(circle at 70% 25%, rgba(255,180,90,${0.85 * (1 - k)}), rgba(255,150,70,${0.3 * (1 - k)}) 40%, transparent 70%)` }} />}
      {d.over && k > 0.6 && d.over(T, p)}
    </AbsoluteFill>
  );
};

/* ───────── captions (narrator only; thoughts live on their cards) ───────── */
const NARR = new Set(VO.segs.filter((s) => s.sp === "N").map((s) => s.n));
const NCAPS = CAPS.filter((c) => NARR.has(c.line));
const capEnd = (i: number) => (NCAPS[i + 1] ? Math.min(NCAPS[i + 1].s - 0.06, NCAPS[i].e + 0.5) : NCAPS[i].e + 0.5);
const Captions: React.FC<{ T: number; top: number }> = ({ T, top }) => {
  const i = NCAPS.findIndex((c, k) => T >= c.s - 0.08 && T < capEnd(k));
  if (i < 0) return null;
  const c = NCAPS[i];
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, textAlign: "center", direction: "rtl", fontFamily: "V26Black", fontSize: 66, lineHeight: 1.35 }}>
      {c.words.map((w, j) => {
        const a = easeOut(prog(T, w.s - 0.05, w.s + 0.12));
        return <span key={j} style={{ display: "inline-block", margin: "0 9px", opacity: a, transform: `translateY(${(1 - a) * 18}px) scale(${w.kw ? 1 + 0.12 * (1 - a) : 1})`,
          color: w.kw ? AMBER : "#FFFFFF", textShadow: `0 0 4px rgba(0,0,0,0.9), 0 4px 18px rgba(0,0,0,0.85)${w.kw ? `, 0 0 26px rgba(255,170,60,0.55)` : ""}` }}>{w.w}</span>;
      })}
    </div>
  );
};

/* HUD status line: clock + day counter */
const HudTop: React.FC<{ T: number }> = ({ T }) => {
  if (T > END_AT) return null;
  const day = T < c10 ? 1 : 31;
  const ms = 6 * 3600 * 1000 + 42 * 60000 + T * 1000 + (day - 1) * 86400000;
  const hh = Math.floor(ms / 3600000) % 24, mm = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60, mmm = Math.floor(ms) % 1000;
  const p2 = (n: number, l = 2) => String(n).padStart(l, "0");
  const red = T > c13;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 150, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.8 }}>
      <div style={{ fontFamily: "V26NumM", fontSize: 28, color: red ? RED : AMBER, letterSpacing: 2 }}>
        <span style={{ opacity: Math.sin(T * 6) > 0 ? 1 : 0.25 }}>● </span>{`${p2(hh)}:${p2(mm)}:${p2(ss)}.${p2(mmm, 3)}`}
      </div>
      <div style={{ fontFamily: "V26Code", fontSize: 28, color: HOT, direction: "rtl" }}>ذهن‌خوان · روز <span style={{ fontFamily: "V26NumM", color: red ? RED : AMBER }}>{day}</span></div>
    </div>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < END_AT - 0.5) return null;
  const bk = prog(T, END_AT - 0.5, END_AT), a = easeOut(prog(T, END_AT + 0.1, END_AT + 0.5)), b = easeOut(prog(T, END_AT + 0.6, END_AT + 1.0));
  return (
    <AbsoluteFill style={{ background: `rgba(4,2,1,${bk})`, alignItems: "center", justifyContent: "center", direction: "rtl" }}>
      <div style={{ fontFamily: "V26Black", fontSize: 96, color: HOT, opacity: a, transform: `scale(${1.08 - 0.08 * a})`, textShadow: `0 0 30px rgba(255,170,60,0.6)` }}>ادامه دارد…</div>
      <div style={{ fontFamily: "V26Bold", fontSize: 46, color: AMBER, opacity: b, marginTop: 30 }}>قسمت <span style={{ fontFamily: "V26Num" }}>2</span> رو می‌خوای؟ کامنت کن</div>
    </AbsoluteFill>
  );
};

const Grain: React.FC<{ f: number }> = ({ f }) => (
  <Img src={staticFile(`v21/grain${f % 8}.png`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, mixBlendMode: "overlay", opacity: 0.13 }} />
);
const MBDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="v26mb16" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation="16 0" /></filter>
    <filter id="v26mb40" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation="40 0" /></filter>
    <filter id="v26mb0"><feOffset dx="0" dy="0" /></filter>
  </svg>
);

const Frame: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const i = Math.max(0, SHOTS.findIndex((d) => T >= d.from && T < d.to));
  const d = SHOTS[i];
  const chipShot = [3, 4, 7, 8, 10, 15].includes(i);
  return (
    <AbsoluteFill style={{ background: "#050302" }}>
      <MBDefs />
      <ShotView i={i} T={T} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 46%, rgba(3,2,1,${d.grade ? 0.62 : 0.5}) 88%, rgba(0,0,0,0.85) 100%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 14%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 82%, rgba(0,0,0,0.6) 100%)" }} />
      <Grain f={f} />
      <HudTop T={T} />
      <Captions T={T} top={chipShot ? 1520 : 1300} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} f={t !== undefined ? Math.round(t * FPS) : f} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
const LOOK = [0.3, 2.9, 7.9, 10.3, 15.2, 16.9, 22.4, 25.6, 30.6, 35.2, 41.6, 46.0, 49.8, 53.6, 57.0, 59.6, END_AT + 1.2];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;
export const V26: React.FC = () => (
  <>
    <Composition id="V26" component={Video} durationInFrames={V26_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v26/mix-norm.wav" }} />
    <Composition id="V26-Silent" component={Video} durationInFrames={V26_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V26-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
