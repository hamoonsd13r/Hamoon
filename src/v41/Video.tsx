// V41 · «شبی که اینترنت خاموش شد» (۱۷ و ۱۸ دی ۱۴۰۴) · Cinematic documentary + breaking news, 9:16, all code.
// Real photos from the user (public/v41/img), Iran map from Natural Earth (tools/v41-map.mjs → map.json),
// connectivity chart is a schematic (labelled as such). All times come from vo.json words.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capJson from "./captions.json";
import mapJson from "./map.json";

type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const MAP = mapJson as unknown as { W: number; H: number; iran: string; len: number; others: { n: string; d: string }[]; cities: Record<string, [number, number]>; dots: [number, number, number][] };
const FPS = 30, W = 1080, H = 1920;
const RED = "#FF3B3B", INK = "#05080E", STEEL = "#8FA6C4";

const fontHandle = typeof document !== "undefined" ? delayRender("v41 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V41Black", "fonts/Vazirmatn-Black.ttf"], ["V41Bold", "fonts/Vazirmatn-Bold.ttf"], ["V41Reg", "fonts/Vazirmatn-Regular.ttf"], ["V41Mono", "fonts/ChakraPetch-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const bare = (x: string) => x.replace(/[،.؟!…«»,:ٌ-ْ]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && bare(x.w).includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;
const E = (n: number) => VO.segs.find((s) => s.n === n)!.end;
const c = (t: number) => t - 0.06;
const kick = (T: number, t0: number, amp: number, dur = 0.5) => (T > t0 && T < t0 + dur ? amp * (1 - prog(T, t0, t0 + dur)) : 0);

export const TOTAL = VO.total + 0.6;
export const V41_FRAMES = Math.round(TOTAL * FPS);

// ───── cues ─────
const tL2 = c(S(2)), tZero = wd(2, "صفر");
const tL3 = c(S(3)), tStreets = wd(3, "خیابون‌ها");
const tL4 = c(S(4)), tL5 = c(S(5)), tFall = wd(5, "سقوط"), tProt = c(wd(5, "اعتراض‌هایی")), tBazaar = wd(5, "بازار"), tCities = wd(5, "شهرهای");
const tL6 = c(S(6)), tL7 = c(S(7)), tGath = wd(7, "تجمعات"), tClash = c(wd(7, "درگیری‌ها")), tKilled = wd(7, "کشته‌شدن");
const tL8 = c(S(8)), t18 = wd(8, "هجده"), tL9 = c(S(9)), tTehran = wd(9, "تهران"), tOther = wd(9, "شهرهای");
const tL10 = c(S(10)), tL11 = c(S(11)), tCut = wd(11, "قطع");
const tL12 = c(S(12)), tL13 = c(S(13)), tUN = c(wd(13, "سازمان")), tCrack = wd(13, "سرکوب"), tMany = wd(13, "کشته‌شدن");
const tL14 = c(S(14)), tForces = wd(14, "نیروهای"), tProp = wd(14, "تخریب");
const tL15 = c(S(15)), tDisp = wd(15, "اختلاف");
const tL16 = c(S(16)), tL17 = c(S(17)), tL18 = c(S(18)), tWorld = wd(18, "جهان"), tOff = wd(18, "خاموش");
const tL19 = c(S(19));
// montage cuts on 18 Dey (every ~0.8–1 s, on the words)
const M9 = [tL9, c(wd(9, "بزرگی")), c(tTehran), c(tOther), c(wd(9, "به")), c(wd(9, "اومدن"))];
const CUTS = [tL3, tL3 + 0.55, tL3 + 1.15, tStreets - 0.06, tL4, tL5, tProt, tL6, tL7, tClash, tL8, ...M9.slice(1), tL10, tL12, tL13, tUN, tL14, tL15, tL16, tL17, tL18];

// ───── media ─────
type Cam = { fx: number; fy: number; s: number };
const Media: React.FC<{ src: string; sw: number; sh: number; w: number; h: number; cam: Cam; filter?: string }> = ({ src, sw, sh, w, h, cam, filter }) => {
  const k = Math.max(w / sw, h / sh) * cam.s, dw = sw * k, dh = sh * k;
  const x = clamp(w / 2 - cam.fx * dw, w - dw, 0), y = clamp(h / 2 - cam.fy * dh, h - dh, 0);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: x, top: y, width: dw, height: dh, maxWidth: "none", maxHeight: "none", filter }} />
    </div>
  );
};
const move = (T: number, a: number, b: number, A: Cam, B: Cam, entry?: { ds?: number; dx?: number; dy?: number; dur?: number }): Cam => {
  const u = easeInOut(prog(T, a, b)) * 0.4 + prog(T, a, b) * 0.6;
  const e = 1 - easeOut(prog(T, a, a + (entry?.dur ?? 0.35)));
  return { fx: lerp(A.fx, B.fx, u) + (entry?.dx ?? 0) * e, fy: lerp(A.fy, B.fy, u) + (entry?.dy ?? 0) * e, s: lerp(A.s, B.s, u) + (entry?.ds ?? 0) * e };
};
const IMG: Record<string, [number, number]> = { "crowd-a": [510, 973], "crowd-b": [505, 973], "street-fire": [1147, 860], highway: [800, 450], square: [1147, 860], junction: [1147, 860] };
const grade = (cold = 0) => `saturate(${0.75 - cold * 0.25}) contrast(1.12) brightness(${0.92 - cold * 0.08}) hue-rotate(${cold * -12}deg)`;

// full-bleed photo with a camera move
const Full: React.FC<{ T: number; img: string; a: number; b: number; A: Cam; B: Cam; entry?: { ds?: number; dx?: number; dy?: number; dur?: number }; cold?: number }> = ({ T, img, a, b, A, B, entry, cold = 0 }) => (
  <Media src={`v41/img/${img}.jpg`} sw={IMG[img][0]} sh={IMG[img][1]} w={W} h={H} cam={move(T, a, b, A, B, entry)} filter={grade(cold)} />
);
// documentary band: the whole photo across the frame, a blurred copy behind
const Band: React.FC<{ T: number; img: string; a: number; b: number; A: Cam; B: Cam; y?: number; h?: number; cold?: number; entry?: { ds?: number; dx?: number; dy?: number; dur?: number }; label?: string }> = ({ T, img, a, b, A, B, y = 360, h = 820, cold = 0, entry, label }) => {
  const [sw, sh] = IMG[img];
  return (
    <>
      <Media src={`v41/img/${img}.jpg`} sw={sw} sh={sh} w={W} h={H} cam={{ fx: 0.5, fy: 0.5, s: 1.15 + 0.04 * prog(T, a, b) }} filter={`blur(38px) brightness(0.35) saturate(0.6)`} />
      <div style={{ position: "absolute", left: 0, top: y, width: W, height: h, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}>
        <Media src={`v41/img/${img}.jpg`} sw={sw} sh={sh} w={W} h={h} cam={move(T, a, b, A, B, entry)} filter={grade(cold)} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: y - 3, width: W, height: 3, background: "rgba(255,255,255,0.18)" }} />
      <div style={{ position: "absolute", left: 0, top: y + h, width: W, height: 3, background: "rgba(255,255,255,0.18)" }} />
      {label && <Tag T={T} t0={a + 0.15} text={label} x={W - 60} y={y + h - 90} />}
    </>
  );
};
// small label on footage: red bar + text
const Tag: React.FC<{ T: number; t0: number; text: string; x: number; y: number; red?: boolean }> = ({ T, t0, text, x, y, red }) => {
  const u = easeOut(prog(T, t0, t0 + 0.3));
  if (u <= 0) return null;
  return (
    <div style={{ position: "absolute", right: W - x, top: y, display: "flex", alignItems: "center", direction: "rtl", opacity: u, transform: `translateX(${(1 - u) * 40}px)`,
      background: red ? RED : "rgba(5,8,14,0.82)", padding: "6px 22px 12px", borderRight: red ? "none" : `8px solid ${RED}`, fontFamily: "V41Bold", fontSize: 38, color: "#fff" }}>{text}</div>
  );
};

// ───── breaking-news top bar ─────
const TopBar: React.FC<{ T: number; label: string; t0: number }> = ({ T, label, t0 }) => {
  const u = easeOut(prog(T, t0, t0 + 0.35));
  return (
    <div style={{ position: "absolute", right: 50, top: 120, display: "flex", alignItems: "stretch", direction: "rtl", height: 70, opacity: 0.4 + 0.6 * u }}>
      <div style={{ background: RED, color: "#fff", fontFamily: "V41Black", fontSize: 34, padding: "8px 22px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: "#fff", opacity: 0.35 + 0.65 * (Math.sin(T * 6) > 0 ? 1 : 0) }} />گزارش ویژه
      </div>
      <div style={{ background: "rgba(5,8,14,0.85)", color: "#fff", fontFamily: "V41Bold", fontSize: 34, padding: "8px 24px 0", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span style={{ display: "inline-block", transform: `translateY(${(1 - u) * 50}px)` }}>{label}</span>
      </div>
    </div>
  );
};

// ───── digital clock ─────
const Clock: React.FC<{ T: number; t0: number; sec: number; size?: number; y: number; red?: boolean }> = ({ T, t0, sec, size = 200, y, red }) => {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0"), mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  const u = easeOut(prog(T, t0, t0 + 0.4));
  const blink = Math.sin(T * Math.PI * 2) > -0.2 ? 1 : 0.25;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: y, textAlign: "center", fontFamily: "V41Mono", fontSize: size, letterSpacing: 6, color: red ? RED : "#fff", opacity: u,
      textShadow: `0 0 40px ${red ? "rgba(255,59,59,0.55)" : "rgba(160,200,255,0.35)"}`, transform: `scale(${0.92 + 0.08 * u})` }}>
      {hh}<span style={{ opacity: blink }}>:</span>{mm}<span style={{ fontSize: size * 0.42, opacity: 0.7 }}>{" "}{ss}</span>
    </div>
  );
};

// ───── connectivity chart (schematic) ─────
// x: 16:00 → 23:00, y: % of normal traffic. The drop sits at 20:00.
const conn = (h: number) => {
  const base = 96 + 3 * Math.sin(h * 5.1) + 2 * (noise(h * 7) - 0.5);
  if (h < 19.6) return base;
  if (h < 20.15) return lerp(base, 3, easeInOut(prog(h, 19.6, 20.15)));
  return 3 + 1.5 * noise(h * 9);
};
const Chart: React.FC<{ T: number; t0: number; head: number; y: number; red: number; flash?: number }> = ({ T, t0, head, y, red, flash = 0 }) => {
  const cw = 940, ch = 520, x0 = 70, H0 = 16, H1 = 23;
  const X = (h: number) => x0 + ((h - H0) / (H1 - H0)) * cw, Y = (v: number) => 40 + (1 - v / 100) * (ch - 80);
  const pts: string[] = [];
  for (let h = H0; h <= Math.min(head, H1); h += 0.02) pts.push(`${X(h).toFixed(1)},${Y(conn(h)).toFixed(1)}`);
  const hv = conn(Math.min(head, H1));
  const col = `rgb(${Math.round(lerp(120, 255, red))},${Math.round(lerp(200, 59, red))},${Math.round(lerp(255, 59, red))})`;
  const u = easeOut(prog(T, t0, t0 + 0.4));
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, height: ch + 120, opacity: u }}>
      <svg width={W} height={ch + 40} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 25, 50, 75, 100].map((v) => <line key={v} x1={x0} x2={x0 + cw} y1={Y(v)} y2={Y(v)} stroke="rgba(143,166,196,0.16)" strokeWidth={2} strokeDasharray="6 10" />)}
        {[16, 18, 20, 22].map((h) => <line key={h} x1={X(h)} x2={X(h)} y1={Y(100) - 10} y2={Y(0)} stroke="rgba(143,166,196,0.12)" strokeWidth={2} />)}
        <line x1={X(20)} x2={X(20)} y1={Y(100) - 20} y2={Y(0) + 8} stroke={RED} strokeOpacity={0.25 + 0.5 * red} strokeWidth={3} />
        <polygon points={`${X(H0)},${Y(0)} ${pts.join(" ")} ${X(Math.min(head, H1))},${Y(0)}`} fill={col} fillOpacity={0.12} />
        <polyline points={pts.join(" ")} fill="none" stroke={col} strokeWidth={7} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 ${10 + 20 * flash}px ${col})` }} />
        <circle cx={X(Math.min(head, H1))} cy={Y(hv)} r={13 + 5 * Math.sin(T * 8)} fill={col} />
        {[16, 18, 20, 22].map((h) => <text key={h} x={X(h)} y={Y(0) + 40} fill={h === 20 ? RED : STEEL} fontFamily="V41Mono" fontSize={30} textAnchor="middle">{`${h}:00`}</text>)}
      </svg>
      <div style={{ position: "absolute", right: 70, top: -112, direction: "rtl", fontFamily: "V41Bold", fontSize: 34, color: STEEL }}>اتصال اینترنت ایران</div>
      <div style={{ position: "absolute", left: 70, top: -140, fontFamily: "V41Mono", fontSize: 96, color: col, textShadow: `0 0 30px ${col}` }}>{Math.round(hv)}%</div>
      <div style={{ position: "absolute", right: 70, top: ch + 70, direction: "rtl", fontFamily: "V41Reg", fontSize: 25, color: "rgba(143,166,196,0.75)" }}>
        نمودار نمادین، بر پایه‌ی گزارش‌های <span style={{ fontFamily: "V41Mono" }}>Cloudflare Radar</span> و <span style={{ fontFamily: "V41Mono" }}>IODA</span>
      </div>
    </div>
  );
};

// ───── Iran map ─────
const CITY: Record<string, { fa: string; dx: number; dy: number; anchor: "start" | "end" | "middle" }> = {
  tehran: { fa: "تهران", dx: 24, dy: 12, anchor: "start" }, mashhad: { fa: "مشهد", dx: -24, dy: 12, anchor: "end" }, rasht: { fa: "رشت", dx: -22, dy: -14, anchor: "end" },
  qazvin: { fa: "قزوین", dx: -24, dy: 24, anchor: "end" }, kerman: { fa: "کرمان", dx: 24, dy: 12, anchor: "start" }, shirvan: { fa: "شیروان", dx: 0, dy: -26, anchor: "middle" },
  tabriz: { fa: "تبریز", dx: 24, dy: 12, anchor: "start" }, isfahan: { fa: "اصفهان", dx: 24, dy: 12, anchor: "start" }, gorgan: { fa: "گرگان", dx: 0, dy: -26, anchor: "middle" },
  ahvaz: { fa: "اهواز", dx: -24, dy: 12, anchor: "end" }, kermanshah: { fa: "کرمانشاه", dx: -24, dy: 24, anchor: "end" }, sanandaj: { fa: "سنندج", dx: -24, dy: 0, anchor: "end" },
};
const D17 = ["tehran", "mashhad", "rasht", "qazvin", "kerman", "shirvan"];
const D18 = ["tehran", "mashhad", "tabriz", "isfahan", "gorgan", "ahvaz", "kermanshah", "sanandaj"];
const ALL = [...new Set([...D17, ...D18])];
type Pin = { k: string; t: number };
const MapView: React.FC<{ T: number; t0: number; pins?: Pin[]; spread?: number; lights?: number; links?: number; cam?: { x: number; y: number; s: number }; draw?: number; top?: number; labels?: boolean }> =
  ({ T, t0, pins = [], spread = -1, lights = 0, links = -1, cam = { x: 0, y: 0, s: 1 }, draw = 1, top = 330, labels = true }) => {
  const [tx, ty] = MAP.cities.tehran;
  return (
    <div style={{ position: "absolute", left: 0, top, width: MAP.W, height: MAP.H, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`, transformOrigin: "50% 50%" }}>
      <svg width={MAP.W} height={MAP.H} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="v41glow"><stop offset="0" stopColor="#FFD9A0" stopOpacity="1" /><stop offset="1" stopColor="#FFB060" stopOpacity="0" /></radialGradient>
        </defs>
        {MAP.others.map((o) => <path key={o.n} d={o.d} fill="#0E1726" stroke="#24344B" strokeWidth={1.6} />)}
        <path d={MAP.iran} fill="#152238" fillOpacity={draw} stroke="#7F9CC4" strokeWidth={3} strokeDasharray={MAP.len} strokeDashoffset={MAP.len * (1 - draw)} style={{ filter: "drop-shadow(0 0 10px rgba(127,156,196,0.45))" }} />
        {lights > 0 && MAP.dots.map(([x, y, r], i) => {
          const on = lights * (0.55 + 0.45 * noise(T * 3 + r));
          return <circle key={i} cx={x} cy={y} r={2.2 + (r % 3) * 0.6} fill="#FFCF8A" opacity={on * 0.85} />;
        })}
        {links >= 0 && [[-120, -80], [-140, 300], [80, -160], [600, -180], [1200, -60], [1220, 420], [1150, 900], [300, 1080], [-120, 760]].map(([ex, ey], i) => {
          const cut = links > 0 ? clamp(links * 1.4 - i * 0.05) : 0;
          const len = Math.hypot(ex - tx, ey - ty);
          const mx = (tx + ex) / 2 + (ey - ty) * 0.15, my = (ty + ey) / 2 - (ex - tx) * 0.15;
          return <path key={i} d={`M${tx},${ty} Q${mx},${my} ${ex},${ey}`} fill="none" stroke={cut > 0 ? RED : "#8FC4FF"} strokeOpacity={(1 - cut) * 0.75} strokeWidth={3}
            strokeDasharray={`${len * 0.5} ${len * 2}`} strokeDashoffset={-((T * 380) % (len * 2.5))} />;
        })}
        {spread >= 0 && ALL.filter((k) => k !== "tehran").map((k, i) => {
          const [x, y] = MAP.cities[k];
          const u = easeOut(prog(spread, i * 0.06, i * 0.06 + 0.5));
          return <line key={k} x1={tx} y1={ty} x2={lerp(tx, x, u)} y2={lerp(ty, y, u)} stroke={RED} strokeOpacity={0.7} strokeWidth={3} strokeDasharray="4 8" />;
        })}
        {pins.map(({ k, t }) => {
          const [x, y] = MAP.cities[k];
          const u = backOut(prog(T, t, t + 0.35)), on = T >= t;
          if (!on) return null;
          const ring = ((T - t) % 1.6) / 1.6;
          const L = CITY[k];
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={14 + 46 * ring} fill="none" stroke={RED} strokeWidth={3} opacity={(1 - ring) * 0.8} />
              <circle cx={x} cy={y} r={30} fill={RED} opacity={0.18 * u} />
              <circle cx={x} cy={y} r={13 * u} fill={RED} stroke="#fff" strokeWidth={3.5} />
              {labels && <text x={x + L.dx} y={y + L.dy} textAnchor={L.anchor} fontFamily="V41Bold" fontSize={32} fill="#fff" opacity={clamp(prog(T, t + 0.1, t + 0.35))}
                style={{ paintOrder: "stroke", stroke: "rgba(5,8,14,0.9)", strokeWidth: 8 } as React.CSSProperties}>{L.fa}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// big date slam
const DateSlam: React.FC<{ T: number; t0: number; day: string; y?: number; sub?: string; size?: number }> = ({ T, t0, day, y = 700, sub = "دی ۱۴۰۴", size = 330 }) => {
  const u = prog(T, t0, t0 + 0.22), s = lerp(1.6, 1, easeOut(u));
  const sh = kick(T, t0 + 0.22, 14, 0.35);
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, textAlign: "center", direction: "rtl", opacity: u, transform: `scale(${s}) translate(${(noise(T * 40) - 0.5) * sh}px, ${(noise(T * 37 + 3) - 0.5) * sh}px)` }}>
      <div style={{ fontFamily: "V41Black", fontSize: size, lineHeight: 1, color: "#fff", textShadow: "0 10px 60px rgba(0,0,0,0.8)" }}>{fa(day)}</div>
      <div style={{ fontFamily: "V41Bold", fontSize: size * 0.27, color: RED, marginTop: 10 }}>{sub}</div>
    </div>
  );
};

// a scrolling archive document (UN / official statement)
const DocCard: React.FC<{ T: number; t0: number; x: number; y: number; w: number; rot: number; head: string; src: string; lines: { text: string; t: number }[]; icon: "globe" | "seal"; scale?: number; dim?: number }> =
  ({ T, t0, x, y, w, rot, head, src, lines, icon, scale = 1, dim = 0 }) => {
  const u = easeOut(prog(T, t0, t0 + 0.5));
  if (u <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - u) * 220, width: w, opacity: u * (1 - dim * 0.55), transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: "50% 0%", background: "#E9E6DE", borderRadius: 6,
      boxShadow: "0 40px 90px rgba(0,0,0,0.75)", padding: "34px 40px 30px", direction: "rtl", color: "#1B1F27" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, borderBottom: "3px solid #1B1F27", paddingBottom: 16 }}>
        <svg width={64} height={64} viewBox="-32 -32 64 64">
          {icon === "globe" ? (<g fill="none" stroke="#2E5C9A" strokeWidth={3}><circle r={27} /><ellipse rx={12} ry={27} /><line x1={-27} x2={27} /><path d="M-24,-12 H24 M-24,12 H24" /></g>)
            : (<g fill="none" stroke="#7A1E1E" strokeWidth={3}><circle r={27} /><circle r={19} strokeDasharray="3 4" /><path d="M-9,4 L0,-12 L9,4 Z" /></g>)}
        </svg>
        <div style={{ fontFamily: "V41Black", fontSize: 40, lineHeight: 1.25 }}>{head}</div>
      </div>
      {lines.map((l, i) => {
        const v = prog(T, l.t, l.t + 0.45);
        return (
          <div key={i} style={{ position: "relative", marginTop: 22, fontFamily: "V41Bold", fontSize: 38, lineHeight: 1.4 }}>
            {[0, 1].map((j) => <div key={j} style={{ height: 12, background: "#C9C4B8", borderRadius: 3, margin: "10px 0", width: `${88 - ((i * 2 + j) * 17) % 30}%` }} />)}
            <span style={{ background: `linear-gradient(to left, rgba(255,59,59,0.35) ${v * 100}%, transparent ${v * 100}%)`, padding: "0 6px", opacity: v > 0 ? 1 : 0.0 }}>{l.text}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 26, fontFamily: "V41Reg", fontSize: 27, color: "#5A6070" }}>{src}</div>
    </div>
  );
};

// ───── scenes ─────
const Scene: React.FC<{ T: number }> = ({ T }) => {
  // A · black, clock 20:00, the chart falls to zero (L1–L2)
  if (T < tL3) {
    const head = T < tZero - 0.5 ? lerp(16, 19.55, easeInOut(prog(T, 0.2, tZero - 0.5))) : lerp(19.55, 22.4, easeOut(prog(T, tZero - 0.5, tZero + 1.0)));
    const red = prog(T, tZero - 0.3, tZero + 0.3);
    return (
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #0F1A2C 0%, ${INK} 70%)` }}>
        <Clock T={T} t0={-0.3} sec={20 * 3600} y={260} size={210} red={T > tZero} />
        <div style={{ position: "absolute", left: 0, width: W, top: 520, textAlign: "center", direction: "rtl", fontFamily: "V41Bold", fontSize: 50, color: STEEL, opacity: prog(T, wd(1, "هجده") - 0.05, wd(1, "هجده") + 0.3) }}>
          {fa("۱۸ دی ۱۴۰۴")}
        </div>
        <div style={{ transform: `translate(${(noise(T * 50) - 0.5) * kick(T, tZero, 26, 0.6)}px, 0)` }}>
          <Chart T={T} t0={0.15} head={head} y={820} red={red} flash={kick(T, tZero, 1, 0.8)} />
        </div>
        {T > tZero && <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, background: `rgba(255,40,40,${kick(T, tZero, 0.18, 0.4)})` }} />}
      </AbsoluteFill>
    );
  }
  // B · rewind + three fast cuts: «قبل از خاموشی چه گذشت؟»
  if (T < tL4) {
    const rew = 1 - prog(T, tL3, tL3 + 0.5);
    const shots: [string, Cam, Cam][] = [["junction", { fx: 0.5, fy: 0.55, s: 1.05 }, { fx: 0.45, fy: 0.5, s: 1.15 }], ["street-fire", { fx: 0.5, fy: 0.55, s: 1.1 }, { fx: 0.52, fy: 0.6, s: 1.2 }],
      ["crowd-a", { fx: 0.5, fy: 0.3, s: 1.0 }, { fx: 0.5, fy: 0.4, s: 1.08 }], ["square", { fx: 0.5, fy: 0.5, s: 1.0 }, { fx: 0.5, fy: 0.45, s: 1.12 }]];
    const cuts = [tL3, tL3 + 0.55, tL3 + 1.15, tStreets - 0.06];
    const i = cuts.filter((x) => T >= x).length - 1;
    const [img, A, B] = shots[i];
    return (
      <AbsoluteFill style={{ background: INK }}>
        {i < 3 ? <Full T={T} img={img} a={cuts[i]} b={cuts[i] + 1} A={A} B={B} entry={{ ds: 0.08, dur: 0.3 }} cold={0.3} />
          : <Band T={T} img={img} a={cuts[i]} b={tL4 + 0.5} A={A} B={B} entry={{ ds: 0.06 }} cold={0.2} label="تهران · ۱۸ دی" />}
        {rew > 0 && (<>
          <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(255,255,255,${0.08 * rew}) 0 3px, transparent 3px 14px)`, transform: `translateY(${(T * 2000) % 14}px)` }} />
          <div style={{ position: "absolute", left: 70, top: 260, fontFamily: "V41Mono", fontSize: 70, color: "#fff", opacity: rew }}>◀◀ REW</div>
        </>)}
        <div style={{ position: "absolute", left: 60, right: 60, top: 1180, textAlign: "center", direction: "rtl", fontFamily: "V41Black", fontSize: 78, lineHeight: 1.25, color: "#fff",
          opacity: prog(T, wd(3, "قبل") - 0.05, wd(3, "قبل") + 0.25), textShadow: "0 6px 30px rgba(0,0,0,0.9)" }}>
          قبل از <span style={{ color: RED }}>خاموشی</span><br />چه گذشت؟
        </div>
      </AbsoluteFill>
    );
  }
  // C · 7 Dey: calendar + bazaar shutters → the currency falls → it spreads from the bazaar to other cities
  if (T < tL6) {
    if (T < tL5) {
      const sh = (k: number) => easeOut(prog(T, tL4 + 0.5 + k * 0.12, tL4 + 1.1 + k * 0.12));
      return (
        <AbsoluteFill style={{ background: `linear-gradient(#0A1220, ${INK})` }}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
            {[0, 1, 2, 3].map((k) => {
              const x = 60 + k * 245, y0 = 980, hh = 520;
              return (
                <g key={k} transform={`translate(${(noise(T * 0.6 + k) - 0.5) * 10},0)`}>
                  <rect x={x} y={y0 - 40} width={225} height={hh + 40} fill="#0E1828" stroke="#2A3B55" strokeWidth={3} />
                  <path d={`M${x - 8},${y0 - 40} L${x + 112},${y0 - 120} L${x + 233},${y0 - 40}`} fill="none" stroke="#3A4F70" strokeWidth={6} />
                  <rect x={x + 12} y={y0} width={201} height={hh * sh(k)} fill="url(#v41shut)" />
                  <rect x={x + 12} y={y0 + hh * sh(k) - 10} width={201} height={10} fill="#5B6E8C" />
                </g>
              );
            })}
            <defs><pattern id="v41shut" width="10" height="22" patternUnits="userSpaceOnUse"><rect width="10" height="22" fill="#33445E" /><rect y="17" width="10" height="5" fill="#1F2B3F" /></pattern></defs>
          </svg>
          <Tag T={T} t0={tL4 + 0.8} text="بازار تهران" x={W - 60} y={1540} />
          <div style={{ transform: `translateY(${-30 * prog(T, tL4, tL5)}px)` }}><DateSlam T={T} t0={tL4 + 0.02} day="۷" y={300} size={300} /></div>
          <TopBar T={T} t0={tL4} label="شروع ماجرا" />
        </AbsoluteFill>
      );
    }
    if (T < tProt) {
      // the rial falls (schematic line + note)
      const u = prog(T, tL5 + 0.1, tProt - 0.1);
      const pts: string[] = [];
      for (let i = 0; i <= 60; i++) { const x = i / 60; if (x > u) break; pts.push(`${90 + x * 900},${520 + (x * x * 520 + 30 * Math.sin(x * 18) * x)}`); }
      const last = pts[pts.length - 1]?.split(",").map(Number) ?? [90, 520];
      return (
        <AbsoluteFill style={{ background: `linear-gradient(#0A1220, ${INK})` }}>
          <svg width={W} height={H} style={{ position: "absolute" }}>
            {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={90} x2={990} y1={480 + k * 150} y2={480 + k * 150} stroke="rgba(143,166,196,0.15)" strokeWidth={2} strokeDasharray="6 10" />)}
            <polyline points={pts.join(" ")} fill="none" stroke={RED} strokeWidth={9} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${RED})` }} />
            <circle cx={last[0]} cy={last[1]} r={14} fill={RED} />
          </svg>
          {/* banknote */}
          <div style={{ position: "absolute", left: 90, top: 1560, width: 300, height: 150, borderRadius: 14, background: "linear-gradient(135deg,#3C5A4A,#24382E)", border: "4px solid #6F8F7A",
            transform: `rotate(${-8 + 14 * u}deg) translateY(${u * 40}px)`, opacity: 0.9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V41Black", fontSize: 54, color: "#CFE3D4", direction: "rtl" }}>ریال</div>
          <div style={{ position: "absolute", right: 90, top: 330, direction: "rtl", fontFamily: "V41Black", fontSize: 64, color: "#fff", opacity: prog(T, tL5, tL5 + 0.3) }}>بحران اقتصادی</div>
          <div style={{ position: "absolute", right: 90, top: 410, direction: "rtl", fontFamily: "V41Bold", fontSize: 40, color: RED, opacity: prog(T, tFall - 0.05, tFall + 0.25) }}>سقوط ارزش پول ↓</div>
          <div style={{ position: "absolute", right: 90, top: 1120, direction: "rtl", fontFamily: "V41Reg", fontSize: 24, color: "rgba(143,166,196,0.7)" }}>نمودار نمادین</div>
          <TopBar T={T} t0={tL4} label="۷ دی ۱۴۰۴" />
        </AbsoluteFill>
      );
    }
    const s0 = prog(T, tBazaar - 0.1, tBazaar + 0.6);
    return (
      <AbsoluteFill style={{ background: INK }}>
        <MapView T={T} t0={tProt} draw={easeOut(prog(T, tProt, tProt + 0.8))} spread={T > tCities - 0.2 ? (T - (tCities - 0.2)) * 1.4 : -1}
          pins={[{ k: "tehran", t: tBazaar - 0.15 }]} cam={{ x: lerp(-60, 0, s0), y: lerp(-40, 0, s0), s: lerp(1.25, 1, easeInOut(s0)) }} />
        <Tag T={T} t0={tBazaar} text="از بازار تهران" x={W - 60} y={1180} red />
        <TopBar T={T} t0={tL4} label="۷ دی ۱۴۰۴" />
      </AbsoluteFill>
    );
  }
  // D · 17 Dey: slam → map pins → clashes (street photo, dark) → killings reported
  if (T < tL8) {
    if (T < tL7) {
      return (
        <AbsoluteFill style={{ background: INK }}>
          <MapView T={T} t0={tL6} draw={1} cam={{ x: 0, y: 0, s: 1.04 }} />
          <AbsoluteFill style={{ background: "rgba(5,8,14,0.72)" }} />
          <DateSlam T={T} t0={tL6} day="۱۷" y={560} />
        </AbsoluteFill>
      );
    }
    if (T < tClash) {
      const cam = 1 + 0.04 * prog(T, tL7, tClash);
      return (
        <AbsoluteFill style={{ background: INK }}>
          <MapView T={T} t0={tL7} cam={{ x: 0, y: 0, s: cam }} pins={D17.map((k, i) => ({ k, t: tGath - 0.5 + i * 0.13 }))} />
          <TopBar T={T} t0={tL7} label="۱۷ دی ۱۴۰۴" />
        </AbsoluteFill>
      );
    }
    const dark = prog(T, tKilled - 0.1, tKilled + 0.8);
    return (
      <AbsoluteFill style={{ background: INK }}>
        <Band T={T} img="street-fire" a={tClash} b={tL8 + 0.4} A={{ fx: 0.5, fy: 0.55, s: 1.05 }} B={{ fx: 0.5, fy: 0.6, s: 1.2 }} entry={{ dx: 0.05 }} label="درگیری‌ها" cold={0.2} />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${0.45 * dark})` }} />
        <div style={{ position: "absolute", left: 60, top: 470, opacity: dark, direction: "rtl", display: "flex", flexDirection: "column", gap: 14 }}>
          {["گزارش کشته‌شدن معترضان", "در چند شهر"].map((t, i) => (
            <div key={i} style={{ alignSelf: "flex-start", background: i ? "rgba(5,8,14,0.85)" : RED, color: "#fff", fontFamily: i ? "V41Bold" : "V41Black", fontSize: i ? 36 : 46, padding: "6px 22px 12px",
              transform: `translateX(${-(1 - easeOut(prog(T, tKilled + i * 0.12, tKilled + 0.4 + i * 0.12))) * 60}px)` }}>{t}</div>
          ))}
        </div>
        <TopBar T={T} t0={tL7} label="۱۷ دی ۱۴۰۴" />
      </AbsoluteFill>
    );
  }
  // E · 18 Dey: date flip (music peaks), then a cut every ~0.8 s
  if (T < tL10) {
    if (T < tL9) {
      const flip = prog(T, t18 - 0.15, t18 + 0.15);
      return (
        <AbsoluteFill style={{ background: INK }}>
          <Full T={T} img="crowd-b" a={tL8} b={tL9 + 0.3} A={{ fx: 0.5, fy: 0.5, s: 1.1 }} B={{ fx: 0.5, fy: 0.45, s: 1.2 }} cold={0.3} />
          <AbsoluteFill style={{ background: "rgba(5,8,14,0.7)" }} />
          <div style={{ position: "absolute", left: 0, top: 620, width: W, height: 500, overflow: "hidden" }}>
            <div style={{ transform: `translateY(${-flip * 500}px)` }}>
              <DateSlam T={T} t0={tL8} day="۱۷" y={0} />
              <div style={{ position: "absolute", top: 500, width: W }}><DateSlam T={T} t0={t18 - 0.15} day="۱۸" y={0} /></div>
            </div>
          </div>
          {T > t18 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(255,59,59,${kick(T, t18 + 0.1, 0.35, 0.5)}), transparent 60%)` }} />}
          <div style={{ position: "absolute", left: 0, width: W, top: 1180, textAlign: "center", direction: "rtl", fontFamily: "V41Bold", fontSize: 44, color: STEEL, opacity: prog(T, tL8, tL8 + 0.3) }}>یک روز بعد…</div>
        </AbsoluteFill>
      );
    }
    const shots: [string, Cam, Cam, string?][] = [
      ["crowd-a", { fx: 0.5, fy: 0.2, s: 1.0 }, { fx: 0.5, fy: 0.4, s: 1.12 }],
      ["square", { fx: 0.45, fy: 0.5, s: 1.0 }, { fx: 0.55, fy: 0.45, s: 1.15 }],
      ["highway", { fx: 0.5, fy: 0.5, s: 1.0 }, { fx: 0.6, fy: 0.5, s: 1.12 }, "تهران"],
      ["junction", { fx: 0.4, fy: 0.5, s: 1.0 }, { fx: 0.5, fy: 0.5, s: 1.15 }],
      ["street-fire", { fx: 0.5, fy: 0.55, s: 1.0 }, { fx: 0.5, fy: 0.6, s: 1.12 }],
      ["crowd-b", { fx: 0.5, fy: 0.6, s: 1.0 }, { fx: 0.5, fy: 0.4, s: 1.15 }],
    ];
    const i = M9.filter((x) => T >= x).length - 1;
    const [img, A, B, lab] = shots[i];
    const z = kick(T, M9[i], 0.1, 0.35);
    return (
      <AbsoluteFill style={{ background: INK }}>
        <Full T={T} img={img} a={M9[i]} b={(M9[i + 1] ?? tL10) + 0.3} A={A} B={B} entry={{ ds: z + 0.06, dur: 0.3 }} />
        {lab && <Tag T={T} t0={tTehran} text={lab} x={W - 60} y={380} red />}
        {T >= tOther && <MiniMap T={T} t0={tOther} />}
        <TopBar T={T} t0={tL9} label="۱۸ دی ۱۴۰۴" />
      </AbsoluteFill>
    );
  }
  // F · ~20:00 → the chart falls, everything cuts (L10–L11)
  if (T < tL12) {
    if (T < tL11) {
      const sec = 19 * 3600 + 59 * 60 + 52 + Math.floor((T - tL10) / (E(10) - tL10) * 8);
      return (
        <AbsoluteFill style={{ background: INK }}>
          <Full T={T} img="square" a={tL10} b={tL11} A={{ fx: 0.5, fy: 0.5, s: 1.05 }} B={{ fx: 0.5, fy: 0.5, s: 1.14 }} cold={0.5} />
          <AbsoluteFill style={{ background: "rgba(5,8,14,0.72)" }} />
          <Clock T={T} t0={tL10} sec={Math.min(sec, 20 * 3600)} y={720} size={210} red={sec >= 20 * 3600} />
          <TopBar T={T} t0={tL9} label="۱۸ دی ۱۴۰۴" />
        </AbsoluteFill>
      );
    }
    const head = T < tCut ? lerp(18.6, 19.62, prog(T, tL11, tCut)) : lerp(19.62, 22.6, easeOut(prog(T, tCut, tCut + 0.6)));
    const g = kick(T, tCut, 1, 0.45);
    const after = T > tCut + 0.45;
    return (
      <AbsoluteFill style={{ background: INK }}>
        <div style={{ transform: `translate(${(noise(T * 60) - 0.5) * 50 * g}px, 0)`, filter: g > 0.05 ? `hue-rotate(${g * 60}deg)` : undefined }}>
          <Chart T={T} t0={tL11 - 0.2} head={head} y={640} red={prog(T, tCut - 0.1, tCut + 0.2)} flash={g} />
        </div>
        {g > 0 && [0, 1, 2, 3, 4].map((k) => (
          <div key={k} style={{ position: "absolute", left: 0, top: 300 + hash(k + Math.floor(T * 30)) * 1300, width: W, height: 14 + 40 * hash(k * 3 + Math.floor(T * 30)), background: k % 2 ? "rgba(255,59,59,0.5)" : "rgba(143,196,255,0.35)",
            transform: `translateX(${(hash(k * 7 + Math.floor(T * 30)) - 0.5) * 200}px)`, opacity: g }} />
        ))}
        {after && (
          <div style={{ position: "absolute", left: 0, width: W, top: 330, textAlign: "center", direction: "rtl" }}>
            <svg width={120} height={100} viewBox="0 0 120 100" style={{ opacity: Math.sin(T * 9) > 0 ? 1 : 0.4 }}>
              {[0, 1, 2, 3].map((k) => <rect key={k} x={10 + k * 28} y={80 - k * 22} width={20} height={20 + k * 22} rx={3} fill={k === 0 ? RED : "#2A3B55"} />)}
              <line x1={8} y1={92} x2={112} y2={8} stroke={RED} strokeWidth={8} />
            </svg>
          </div>
        )}
        <TopBar T={T} t0={tL9} label="۱۸ دی · ساعت ۲۰:۰۰" />
      </AbsoluteFill>
    );
  }
  // G · «قطع ارتباطات، پایان اتفاقات نبود» — a dead phone over the dark street
  if (T < tL13) {
    const u = easeOut(prog(T, tL12, tL12 + 0.6));
    return (
      <AbsoluteFill style={{ background: INK }}>
        <Full T={T} img="street-fire" a={tL12} b={tL13 + 0.5} A={{ fx: 0.5, fy: 0.5, s: 1.05 }} B={{ fx: 0.48, fy: 0.55, s: 1.18 }} cold={0.6} />
        <AbsoluteFill style={{ background: `rgba(5,8,14,${0.5 + 0.1 * u})` }} />
        <div style={{ position: "absolute", left: 300, top: 360 + (1 - u) * 300, width: 480, height: 900, borderRadius: 64, background: "#05070B", border: "10px solid #1E2735",
          boxShadow: "0 40px 120px rgba(0,0,0,0.9)", opacity: u, transform: `rotate(${-3 + 2 * Math.sin(T * 0.8)}deg)` }}>
          <div style={{ position: "absolute", left: 160, top: 22, width: 140, height: 30, borderRadius: 15, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, top: 260, width: 460, textAlign: "center", direction: "rtl" }}>
            <svg width={150} height={150} viewBox="-75 -75 150 150">
              {[60, 42, 24].map((r, k) => <path key={k} d={`M${-r * 0.8},${-r * 0.35} A${r},${r} 0 0 1 ${r * 0.8},${-r * 0.35}`} fill="none" stroke="#3A4A62" strokeWidth={10} strokeLinecap="round" transform="translate(0,20)" />)}
              <circle cx={0} cy={30} r={9} fill="#3A4A62" />
              <line x1={-55} y1={-45} x2={55} y2={55} stroke={RED} strokeWidth={9} strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: "V41Black", fontSize: 40, color: "#fff", marginTop: 20 }}>اتصال برقرار نیست</div>
            <div style={{ fontFamily: "V41Reg", fontSize: 28, color: STEEL, marginTop: 10 }}>در حال تلاش برای اتصال…</div>
            <svg width={80} height={80} viewBox="-40 -40 80 80" style={{ marginTop: 40 }}>
              <circle r={28} fill="none" stroke="#1E2A3B" strokeWidth={8} />
              <circle r={28} fill="none" stroke={STEEL} strokeWidth={8} strokeDasharray="40 200" transform={`rotate(${T * 360})`} strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <TopBar T={T} t0={tL12} label="پس از خاموشی" />
      </AbsoluteFill>
    );
  }
  // H · archive: blurred film frames (nothing graphic shown) → the UN report card
  if (T < tL15) {
    const strip = easeOut(prog(T, tL13, tL13 + 0.6));
    const drift = (T - tL13) * 60;
    const docIn = T >= tUN;
    const second = T >= tL14;
    return (
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #121D30, ${INK} 75%)` }}>
        {/* film strip of blurred frames */}
        <div style={{ position: "absolute", left: 0, top: docIn ? lerp(380, 200, easeOut(prog(T, tUN, tUN + 0.6))) : 380, width: W, height: 330, opacity: strip * (docIn ? lerp(1, 0.35, prog(T, tUN, tUN + 0.6)) : 1),
          background: "#0A0A0A", borderTop: "4px solid #222", borderBottom: "4px solid #222" }}>
          {Array.from({ length: 7 }).map((_, k) => {
            const img = ["junction", "street-fire", "square", "highway", "crowd-a", "crowd-b", "junction"][k];
            return (
              <div key={k} style={{ position: "absolute", left: k * 330 - 260 + drift, top: 35, width: 300, height: 260, overflow: "hidden", borderRadius: 6, background: "#000" }}>
                <Media src={`v41/img/${img}.jpg`} sw={IMG[img][0]} sh={IMG[img][1]} w={300} h={260} cam={{ fx: 0.5, fy: 0.5, s: 1 }} filter="blur(9px) grayscale(0.8) brightness(0.55)" />
                <svg width={300} height={260} style={{ position: "absolute", left: 0, top: 0 }}><circle cx={150} cy={130} r={36} fill="rgba(0,0,0,0.5)" stroke="#fff" strokeWidth={3} /><path d="M140,112 L166,130 L140,148 Z" fill="#fff" /></svg>
              </div>
            );
          })}
          {Array.from({ length: 16 }).map((_, k) => <div key={"h" + k} style={{ position: "absolute", left: ((k * 70 + drift) % 1120) - 40, top: 8, width: 30, height: 18, borderRadius: 3, background: "#2A2A2A" }} />)}
          {Array.from({ length: 16 }).map((_, k) => <div key={"g" + k} style={{ position: "absolute", left: ((k * 70 + drift) % 1120) - 40, bottom: 8, width: 30, height: 18, borderRadius: 3, background: "#2A2A2A" }} />)}
        </div>
        {!docIn && <Tag T={T} t0={tL13 + 0.4} text="ویدیوهای منتشرشده پس از قطعی" x={W - 60} y={760} />}
        {!docIn && <div style={{ position: "absolute", right: 60, top: 840, direction: "rtl", fontFamily: "V41Reg", fontSize: 28, color: STEEL, opacity: prog(T, tL13 + 0.6, tL13 + 1) }}>تصاویر دلخراش نمایش داده نمی‌شود</div>}
        <DocCard T={T} t0={tUN} x={second ? 330 : 120} y={second ? 470 : 560} w={840} rot={second ? 3 : -1.5} scale={second ? 0.82 : 1} dim={second ? 1 : 0} icon="globe" head="سازمان ملل متحد · گزارش"
          src="منبع: بررسی‌های سازمان ملل از ویدیوهای منتشرشده" lines={[{ text: "سرکوب مرگبار معترضان", t: tCrack - 0.1 }, { text: "کشته‌شدن شمار زیادی از مردم", t: tMany - 0.1 }]} />
        <DocCard T={T} t0={tL14} x={70} y={760} w={800} rot={-2.5} scale={1} icon="seal" head="روایت رسمی"
          src="منبع: اظهارات مقام‌های حکومتی ایران" lines={[{ text: "کشته‌شدن نیروهای امنیتی", t: tForces - 0.15 }, { text: "تخریب اموال", t: tProp - 0.1 }]} />
        <TopBar T={T} t0={tL13} label={second ? "روایت حکومت" : "بعدها"} />
      </AbsoluteFill>
    );
  }
  // J · the exact toll: scrambling digits that never settle → «؟»
  if (T < tL16) {
    const settle = T > tDisp - 0.1;
    const digits = Array.from({ length: 5 }).map((_, k) => (settle ? "" : fa(Math.floor(hash(k * 13 + Math.floor(T * 18)) * 10))));
    const q = easeOut(prog(T, tDisp - 0.1, tDisp + 0.3));
    return (
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #141E31, ${INK} 75%)` }}>
        <DocCard T={T} t0={tL15 - 1} x={560} y={300} w={600} rot={6} scale={0.62} dim={1} icon="globe" head="سازمان ملل متحد" src="" lines={[]} />
        <DocCard T={T} t0={tL15 - 1} x={-80} y={360} w={600} rot={-6} scale={0.62} dim={1} icon="seal" head="روایت رسمی" src="" lines={[]} />
        <div style={{ position: "absolute", left: 0, width: W, top: 700, textAlign: "center", direction: "ltr", fontFamily: "V41Black", fontSize: 220, color: "#fff", letterSpacing: 10, opacity: settle ? 1 - q : 0.85 }}>{digits.join("")}</div>
        <div style={{ position: "absolute", left: 0, width: W, top: 560, textAlign: "center", fontFamily: "V41Black", fontSize: 460, lineHeight: 1, color: RED, opacity: q, transform: `scale(${lerp(1.5, 1, q)})`, textShadow: "0 0 60px rgba(255,59,59,0.5)" }}>؟</div>
        <div style={{ position: "absolute", left: 0, width: W, top: 1100, textAlign: "center", direction: "rtl", fontFamily: "V41Bold", fontSize: 46, color: STEEL, opacity: prog(T, wd(15, "قربانی‌ها") - 0.1, wd(15, "قربانی‌ها") + 0.3) }}>شمار دقیق قربانی‌ها</div>
        <TopBar T={T} t0={tL15} label="محل اختلاف" />
      </AbsoluteFill>
    );
  }
  // K · «۱۷ و ۱۸ دی…» whisper over the night crowd → map with every city
  if (T < tL18) {
    if (T < tL17) {
      return (
        <AbsoluteFill style={{ background: INK }}>
          <Band T={T} img="crowd-b" a={tL16} b={tL17 + 0.3} A={{ fx: 0.5, fy: 0.35, s: 1.0 }} B={{ fx: 0.5, fy: 0.45, s: 1.1 }} y={430} h={760} cold={0.3} />
          <div style={{ position: "absolute", left: 0, width: W, top: 200, textAlign: "center", direction: "rtl", fontFamily: "V41Black", fontSize: 120, color: "#fff", opacity: easeOut(prog(T, tL16, tL16 + 0.5)) }}>
            {fa("۱۷")} <span style={{ color: RED, fontSize: 80 }}>و</span> {fa("۱۸")} <span style={{ fontSize: 80, color: STEEL }}>دی</span>
          </div>
        </AbsoluteFill>
      );
    }
    return (
      <AbsoluteFill style={{ background: INK }}>
        <MapView T={T} t0={tL17} cam={{ x: 0, y: 0, s: 1 + 0.05 * prog(T, tL17, tL18) }} lights={easeOut(prog(T, tL17, tL17 + 1))}
          pins={ALL.map((k, i) => ({ k, t: tL17 + 0.2 + i * 0.12 }))} labels={false} />
        <div style={{ position: "absolute", left: 0, width: W, top: 1210, textAlign: "center", direction: "rtl", fontFamily: "V41Bold", fontSize: 32, color: STEEL, opacity: prog(T, tL17 + 1, tL17 + 1.5) }}>
          شهرهای نمونه در گزارش‌های منتشرشده
        </div>
        <TopBar T={T} t0={tL17} label="۱۷ و ۱۸ دی ۱۴۰۴" />
      </AbsoluteFill>
    );
  }
  // L · the country goes dark: links to the world snap, the lights go out
  if (T < tL19) {
    const off = prog(T, tOff - 0.1, tOff + 0.8);
    const links = T < tWorld ? 0 : prog(T, tWorld, tOff + 0.3);
    return (
      <AbsoluteFill style={{ background: INK }}>
        <MapView T={T} t0={tL18} cam={{ x: 0, y: 0, s: lerp(1.05, 0.9, easeInOut(prog(T, tL18, tL19))) }} lights={1 - off} links={links} draw={1} />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${0.5 * off})` }} />
        <TopBar T={T} t0={tL17} label="۱۷ و ۱۸ دی ۱۴۰۴" />
      </AbsoluteFill>
    );
  }
  // M · black, the final words, fade
  const a = easeOut(prog(T, tL19 + 0.1, tL19 + 0.9)), out = prog(T, TOTAL - 1.0, TOTAL - 0.2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 0, width: W, top: 760, textAlign: "center", direction: "rtl", opacity: a * (1 - out), transform: `scale(${1 + 0.03 * prog(T, tL19, TOTAL)})` }}>
        <div style={{ fontFamily: "V41Black", fontSize: 104, color: "#fff", lineHeight: 1.3 }}>فرزند ایران</div>
        <div style={{ width: 120 * a, height: 5, background: RED, margin: "22px auto" }} />
        <div style={{ fontFamily: "V41Black", fontSize: 104, color: "#fff", lineHeight: 1.3, opacity: prog(T, wd(19, "جان‌فدای") - 0.1, wd(19, "جان‌فدای") + 0.4) }}>و جان‌فدای میهن</div>
      </div>
    </AbsoluteFill>
  );
};

// small inset map in the 18 Dey montage: the cities light up on «شهرهای دیگه»
const MiniMap: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const u = easeOut(prog(T, t0, t0 + 0.3));
  return (
    <div style={{ position: "absolute", left: 40, top: 300, width: 432, height: 376, overflow: "hidden", borderRadius: 14, background: "rgba(5,8,14,0.85)", border: "3px solid rgba(255,255,255,0.18)", opacity: u, transform: `scale(${0.9 + 0.1 * u})`, transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: MAP.W, height: MAP.H, transform: "scale(0.4)", transformOrigin: "0 0" }}>
        <MapView T={T} t0={t0} top={0} labels={false} pins={D18.map((k, i) => ({ k, t: t0 + 0.05 + i * 0.08 }))} />
      </div>
    </div>
  );
};

// ───── captions: 2–3 words, keyword red, spoken word pops ─────
const HIDE: [number, number][] = [[0, tL2], [wd(3, "قبل") - 0.05, tL4], [tL6, tL7], [tL8, tL9], [tL16, tL17], [tL19 - 0.1, 999]];
const Captions: React.FC<{ T: number }> = ({ T }) => {
  if (HIDE.some(([a, b]) => T >= a && T < b)) return null;
  const ch = [...CAPS].reverse().find((x) => T >= x.s - 0.03);
  if (!ch || T > ch.e + 0.25) return null;
  const a = easeOut(prog(T, ch.s - 0.03, ch.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1330, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 22px", direction: "rtl", transform: `scale(${0.9 + 0.1 * a})`, opacity: a }}>
      {ch.words.map((w, i) => {
        const on = T >= w.s - 0.04;
        const pop = on ? 1 + 0.1 * (1 - easeOut(prog(T, w.s - 0.04, w.s + 0.16))) : 1;
        return (
          <span key={i} style={{ fontFamily: "V41Black", fontSize: 76, lineHeight: 1.35, color: w.kw ? "#FF5A52" : "#FFFFFF", opacity: on ? 1 : 0.5, display: "inline-block", transform: `scale(${pop})`,
            WebkitTextStroke: "3px rgba(0,0,0,0.9)", paintOrder: "stroke fill", textShadow: "0 5px 18px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)" }}>{bare(w.w)}</span>
        );
      })}
    </div>
  );
};

const Flash: React.FC<{ T: number }> = ({ T }) => {
  const c0 = CUTS.find((x) => T >= x && T < x + 0.12);
  if (c0 === undefined) return null;
  return <AbsoluteFill style={{ background: `rgba(230,240,255,${0.18 * (1 - prog(T, c0, c0 + 0.12))})` }} />;
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  const f = Math.floor(T * 30);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Scene T={T} />
      <Img src={staticFile(`v22/grain-${String((f % 12) + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.08, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <Flash T={T} />
      <Captions T={T} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const T = t ?? f / FPS;
  return (
    <AbsoluteFill>
      <Frame T={T} />
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

// ───── cover: Iran map on black, «۱۸ دی ۱۴۰۴», «شبی که اینترنت خاموش شد» ─────
const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
      <MapView T={3} t0={0} top={490} lights={0.35} cam={{ x: 0, y: 0, s: 1.05 }} />
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.85) 75%)" }} />
    <div style={{ position: "absolute", left: 0, top: 380, width: W, height: 220, background: "linear-gradient(#000, rgba(0,0,0,0))" }} />
    <div style={{ position: "absolute", left: 0, top: 1240, width: W, height: 300, background: "linear-gradient(rgba(0,0,0,0), #000 85%)" }} />
    <div style={{ position: "absolute", right: 60, top: 140, display: "flex", direction: "rtl", height: 72 }}>
      <div style={{ background: RED, color: "#fff", fontFamily: "V41Black", fontSize: 36, padding: "8px 24px 0" }}>گزارش ویژه</div>
    </div>
    <div style={{ position: "absolute", left: 0, width: W, top: 690, textAlign: "center", direction: "rtl" }}>
      <div style={{ fontFamily: "V41Black", fontSize: 250, lineHeight: 1.05, color: "#fff", textShadow: "0 10px 60px rgba(0,0,0,0.9)" }}>{fa("۱۸ دی")}</div>
      <div style={{ fontFamily: "V41Black", fontSize: 130, color: RED, lineHeight: 1.1 }}>{fa("۱۴۰۴")}</div>
      <div style={{ fontFamily: "V41Bold", fontSize: 66, color: "#fff", marginTop: 50, display: "inline-block", background: "rgba(0,0,0,0.6)", padding: "8px 30px 18px", borderBottom: `6px solid ${RED}` }}>شبی که اینترنت خاموش شد</div>
    </div>
  </AbsoluteFill>
);

export const V41_LOOK = [0.05, 1.5, tZero + 0.6, tL3 + 0.3, tStreets + 0.4, tL4 + 1.2, tFall + 0.4, tCities + 0.6, tL6 + 0.4, tGath + 0.8, tKilled + 0.6, tL8 + 0.3, t18 + 0.4, tL9 + 0.4, tTehran + 0.3, tOther + 0.5, wd(9, "اومدن") + 0.3,
  tL10 + 1.2, tCut - 0.3, tCut + 0.6, tL12 + 2, tL13 + 1.2, tCrack + 0.6, tProp + 0.6, tL15 + 1, tDisp + 0.6, tL16 + 1, tL17 + 2, tWorld + 0.3, tOff + 0.6, tL19 + 2, TOTAL - 0.4];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V41: React.FC = () => (
  <>
    <Composition id="V41" component={Video} durationInFrames={V41_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v41/mix.wav" }} />
    <Composition id="V41-Silent" component={Video} durationInFrames={V41_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V41-Look" component={Look} durationInFrames={V41_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: V41_LOOK }} />
    <Composition id="V41-Cover" component={Cover} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
