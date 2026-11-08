// V38 · «زیرزمینِ شهرِ فرش» — مستند ترسناکِ ۹:۱۶ درباره‌ی یک شایعه‌ی اینترنتی (متن و جدول ادیت از کاربر).
// تصویر واقعی: عکس‌ها و تیزر تبلیغاتی شهر فرش که کاربر داده (public/v38/img، public/v38/clips).
// با کد: راهروی زیرزمینِ «بازسازی‌شده» (پرسپکتیو واقعی با دوربین)، فید شبکه‌ی اجتماعی، «فایل‌های لو رفته»، لایو استریم،
// پرونده‌ی مدرک، صفحه‌ی جست‌وجو و پایان سیاه. صدا: George (ElevenLabs v4، tempo 0.95).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Freeze, Html5Audio, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capJson from "./captions.json";

type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const FPS = 30, W = 1080, H = 1920;
const RED = "#E0312B";

const fontHandle = typeof document !== "undefined" ? delayRender("v38 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V38Black", "fonts/Vazirmatn-Black.ttf"], ["V38Bold", "fonts/Vazirmatn-Bold.ttf"], ["V38Reg", "fonts/Vazirmatn-Regular.ttf"], ["V38Mono", "fonts/ChakraPetch-Medium.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise = (t: number) => { const i = Math.floor(t), f = t - i; const u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const bare = (x: string) => x.replace(/[،.؟!…«»,:ً-ْ]/g, "");
const wd = (line: number, word: string) => {
  const w = VO.words.find((x) => x.line === line && bare(x.w) === word) ?? VO.words.find((x) => x.line === line && bare(x.w).includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;
const lineEnd = (n: number) => VO.words.filter((w) => w.line === n).at(-1)!.e;
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const c = (t: number) => t - 0.06; // cut a hair before the word

// ───── timeline (all from the voice) ─────
export const TOTAL = VO.total + 0.3;
export const V38_FRAMES = Math.round(TOTAL * FPS);
const tCorr = c(wd(1, "که")), tName = wd(2, "زیرزمین");
const tL3 = c(S(3)), tJoke = c(wd(3, "شوخی")), tMyst = c(wd(3, "مرموزترین"));
const tL4 = c(S(4)), tLeak = wd(4, "فایل‌های"), tLeak2 = c(wd(4, "منتشر"));
const tL5 = c(S(5)), tDown = wd(5, "پایین") - 0.25;
const tL6 = c(S(6)), tPej = c(wd(6, "پژمان"));
const tL7 = c(S(7)), tLogo = c(wd(7, "شهر")), tFace = c(wd(7, "حضور"));
const tL8 = c(S(8)), tTag = c(wd(8, "داستان"));
const tL9 = c(S(9)), tL10 = S(10), tProof = wd(10, "مدرک"), tNone = wd(10, "نشده");
const tL11 = c(S(11)), tL12 = c(S(12)), tSecret = wd(12, "راز"), tL13 = c(S(13)), tRepeat = wd(13, "تکرار"), tScary = wd(13, "ترسناک");
const tL14 = c(S(14)), tL15 = S(15), tL16 = S(16), tBelieve = wd(15, "باور");
const CUTS = [tCorr, tL3, tMyst, tL4, tLeak2, tL5, tL6, tPej, tL7, tLogo, tFace, tL8, tL9, tL11, tL12, tScary, tL14];

// ───── media in a box: image or video clip, cover + camera (focus point fx,fy at the box centre, zoom s) ─────
type Cam = { fx: number; fy: number; s: number };
const Media: React.FC<{ src: string; sw: number; sh: number; box?: { x: number; y: number; w: number; h: number }; cam: Cam; filter?: string; clipT?: number; clipLen?: number; rate?: number }> =
  ({ src, sw, sh, box = { x: 0, y: 0, w: W, h: H }, cam, filter, clipT, clipLen = 99, rate = 1 }) => {
    const k = Math.max(box.w / sw, box.h / sh) * cam.s, dw = sw * k, dh = sh * k;
    const x = clamp(box.w / 2 - cam.fx * dw, box.w - dw, 0), y = clamp(box.h / 2 - cam.fy * dh, box.h - dh, 0);
    const st: React.CSSProperties = { position: "absolute", left: x, top: y, width: dw, height: dh, maxWidth: "none", maxHeight: "none", filter };
    return (
      <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, overflow: "hidden" }}>
        {clipT === undefined ? <Img src={staticFile(src)} style={st} /> : (
          <Freeze frame={Math.max(0, Math.min(Math.floor(clipLen * 30) - 2, Math.round(clipT * rate * 30)))}>
            <OffthreadVideo src={staticFile(src)} muted style={st} />
          </Freeze>
        )}
      </div>
    );
  };
const camMove = (T: number, a: number, b: number, A: Cam, B: Cam, entry?: { ds?: number; dx?: number; dy?: number; dur?: number }): Cam => {
  const u = easeInOut(prog(T, a, b)) * 0.4 + prog(T, a, b) * 0.6;
  const e = 1 - easeOut(prog(T, a, a + (entry?.dur ?? 0.35)));
  return { fx: lerp(A.fx, B.fx, u) + (entry?.dx ?? 0) * e, fy: lerp(A.fy, B.fy, u) + (entry?.dy ?? 0) * e, s: lerp(A.s, B.s, u) + (entry?.ds ?? 0) * e };
};
const shakeXY = (T: number, amp: number) => ({ x: (noise(T * 9) - 0.5) * amp + Math.sin(T * 61) * amp * 0.25, y: (noise(T * 8 + 5) - 0.5) * amp + Math.cos(T * 53) * amp * 0.25 });
const kick = (T: number, t0: number, amp: number, dur = 0.5) => (T > t0 && T < t0 + dur ? amp * (1 - prog(T, t0, t0 + dur)) : 0);

// band = the picture strip of the documentary layout (black above for the chapter title, fades into black)
const BAND = { x: 0, y: 300, w: W, h: 1340 };
const BandFades: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, top: BAND.y - 2, width: W, height: 260, background: "linear-gradient(#000 0%, rgba(0,0,0,0.75) 35%, rgba(0,0,0,0) 100%)" }} />
    <div style={{ position: "absolute", left: 0, top: BAND.y + BAND.h - 300, width: W, height: 302, background: "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 70%, #000 100%)" }} />
  </>
);

// ───── chapter title (top black area): words arrive one by one, a red rule sweeps in from the right ─────
const Chapter: React.FC<{ T: number; t0: number; text: string; tag?: string; size?: number; y?: number; red?: string[] }> = ({ T, t0, text, tag, size = 76, y = 120, red = [] }) => {
  if (T < t0) return null;
  const words = text.split(" ");
  const g = kick(T, t0, 1, 0.22);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, direction: "rtl", transform: `translateX(${g * (hash(Math.floor(T * 30)) - 0.5) * 30}px)` }}>
      {tag && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, fontFamily: "V38Bold", fontSize: 30, color: "#fff", background: RED, padding: "4px 18px 8px", borderRadius: 6, opacity: easeOut(prog(T, t0, t0 + 0.2)), marginBottom: 14 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: "#fff", opacity: 0.5 + 0.5 * Math.sin(T * 8) }} />{tag}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0 22px", fontFamily: "V38Black", fontSize: size, lineHeight: 1.3, color: "#F3F0EA", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
        {words.map((w, i) => {
          const a = easeOut(prog(T, t0 + 0.07 * i, t0 + 0.07 * i + 0.25));
          return <span key={i} style={{ opacity: a, transform: `translateY(${(1 - a) * 26}px)`, display: "inline-block", color: red.includes(w) ? RED : undefined }}>{w}</span>;
        })}
      </div>
      <div style={{ height: 6, marginTop: 10, width: `${60 * easeOut(prog(T, t0 + 0.15, t0 + 0.7))}%`, background: RED, marginRight: 0, borderRadius: 3 }} />
    </div>
  );
};

// ───── the reconstructed basement corridor (true perspective, the camera dollies in) ─────
const Corridor: React.FC<{ T: number; camZ: number; tint?: [number, number, number]; sway?: number; door?: number }> = ({ T, camZ, tint = [1, 1, 1], sway = 1, door = 1 }) => {
  const F = 700, cx = 540 + Math.sin(T * 0.5) * 14 * sway, cy = 960 + Math.sin(T * 0.37 + 1) * 10 * sway;
  const XW = 430, CY = -560, FY = 640, L = 360, N = 24, END = N * L;
  const P = (x: number, y: number, d: number) => `${(cx + (x * F) / d).toFixed(1)},${(cy + (y * F) / d).toFixed(1)}`;
  // lamps every 3 slabs; lamp 2 dead, lamp 1 flickers
  const lampOn = (k: number) => (k % 5 === 2 ? 0.05 : k % 5 === 1 ? (noise(T * 7 + k) > 0.45 ? 1 : 0.15) : 0.85 + 0.15 * noise(T * 3 + k));
  const lamps = Array.from({ length: Math.floor(N / 3) }, (_, k) => ({ z: (k * 3 + 1.5) * L, on: lampOn(k) }));
  const lit = (z: number) => {
    const d = z - camZ;
    let l = 0.12;
    for (const lp of lamps) l += lp.on * 0.95 * Math.exp(-Math.abs(lp.z - z) / 520);
    return clamp(l, 0, 1) * Math.exp(-Math.max(0, d) / 3400);
  };
  const col = (base: [number, number, number], l: number) => `rgb(${base.map((v, i) => Math.round(v * l * tint[i])).join(",")})`;
  const slabs: React.ReactNode[] = [];
  for (let i = N - 1; i >= 0; i--) {
    const z1 = i * L, z2 = (i + 1) * L;
    const d1 = Math.max(z1 - camZ, 90), d2 = z2 - camZ;
    if (d2 <= 90) continue;
    const l = lit((z1 + z2) / 2);
    const seam = "rgba(0,0,0,0.55)";
    slabs.push(
      <g key={i}>
        <polygon points={`${P(-XW, FY, d1)} ${P(XW, FY, d1)} ${P(XW, FY, d2)} ${P(-XW, FY, d2)}`} fill={col([120, 112, 98], l)} stroke={seam} strokeWidth={1.5} />
        <polygon points={`${P(-XW, CY, d1)} ${P(XW, CY, d1)} ${P(XW, CY, d2)} ${P(-XW, CY, d2)}`} fill={col([70, 72, 70], l)} stroke={seam} strokeWidth={1.5} />
        <polygon points={`${P(-XW, CY, d1)} ${P(-XW, FY, d1)} ${P(-XW, FY, d2)} ${P(-XW, CY, d2)}`} fill={col([150, 148, 136], l * 0.85)} stroke={seam} strokeWidth={2} />
        <polygon points={`${P(XW, CY, d1)} ${P(XW, FY, d1)} ${P(XW, FY, d2)} ${P(XW, CY, d2)}`} fill={col([140, 140, 130], l * 0.8)} stroke={seam} strokeWidth={2} />
        {/* damp stain low on the walls */}
        <polygon points={`${P(-XW, 380, d1)} ${P(-XW, FY, d1)} ${P(-XW, FY, d2)} ${P(-XW, 420 + 60 * hash(i), d2)}`} fill={`rgba(20,16,8,${0.35 * l + 0.1})`} />
        <polygon points={`${P(XW, 400, d1)} ${P(XW, FY, d1)} ${P(XW, FY, d2)} ${P(XW, 380 + 70 * hash(i + 9), d2)}`} fill={`rgba(20,16,8,${0.35 * l + 0.1})`} />
        {/* pipe along the right ceiling corner */}
        <polygon points={`${P(XW - 40, CY + 40, d1)} ${P(XW - 40, CY + 75, d1)} ${P(XW - 40, CY + 75, d2)} ${P(XW - 40, CY + 40, d2)}`} fill={col([90, 80, 70], l * 1.1)} />
      </g>,
    );
    // rolled carpets standing against the walls (only a few slabs)
    if (i % 2 === 0 && i > 0 && i < N - 3) {
      const side = i % 4 === 0 ? -1 : 1;
      [0, 1, 2].forEach((r) => {
        const zr = z1 + 60 + r * 95, d = zr - camZ;
        if (d < 110) return;
        const k = F / d, x = cx + side * (XW - 50 - r * 6) * k, top = cy + (FY - 520 + r * 30) * k, bot = cy + FY * k, w = 62 * k;
        const ll = lit(zr), hue = [[128, 30, 28], [96, 54, 30], [60, 40, 70]][(i + r) % 3] as [number, number, number];
        slabs.push(
          <g key={`r${i}-${r}`} transform={`rotate(${side * (4 + r * 2)} ${x} ${bot})`}>
            <rect x={x - w / 2} y={top} width={w} height={bot - top} rx={w / 2.2} fill={col(hue, ll * 1.1)} />
            <rect x={x - w / 2} y={top} width={w * 0.3} height={bot - top} rx={w / 6} fill="rgba(0,0,0,0.35)" />
            {[0.2, 0.45, 0.7].map((v) => <rect key={v} x={x - w / 2} y={top + (bot - top) * v} width={w} height={Math.max(1, 6 * k)} fill={`rgba(230,200,140,${0.25 * ll})`} />)}
            <ellipse cx={x} cy={top + 3 * k} rx={w / 2} ry={w / 5} fill={col([200, 170, 120], ll * 0.8)} />
          </g>,
        );
      });
    }
  }
  // lamps (tubes + glow)
  const lampEls = lamps.map((lp, k) => {
    const d = lp.z - camZ;
    if (d < 120) return null;
    const k1 = F / d;
    const x = cx, y = cy + (CY + 12) * k1, w = 300 * k1, h = Math.max(2, 26 * k1);
    return (
      <g key={`l${k}`}>
        <ellipse cx={x} cy={y + 40 * k1} rx={w * 1.1} ry={w * 0.45} fill={`rgba(210,235,215,${0.22 * lp.on})`} filter="url(#v38glow)" />
        <rect x={x - w / 2} y={y} width={w} height={h} rx={h / 2} fill={`rgba(${lp.on > 0.3 ? "235,255,240" : "80,90,85"},${0.35 + 0.65 * lp.on})`} />
      </g>
    );
  });
  // the far end: a wall with a door and a thin red light under it
  const dE = END - camZ, kE = F / dE;
  const dl = 0.6 + 0.4 * noise(T * 2.3);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="v38glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
        <radialGradient id="v38haze" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="rgba(160,170,160,0.16)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#030303" />
      <polygon points={`${P(-XW, CY, dE)} ${P(XW, CY, dE)} ${P(XW, FY, dE)} ${P(-XW, FY, dE)}`} fill={col([60, 58, 52], lit(END))} />
      <rect x={cx - 120 * kE} y={cy + (FY - 470) * kE} width={240 * kE} height={470 * kE} fill="#050404" stroke="rgba(60,50,40,0.8)" strokeWidth={3 * kE} />
      <rect x={cx - 120 * kE} y={cy + (FY - 8) * kE} width={240 * kE} height={8 * kE} fill={`rgba(255,40,30,${0.9 * dl * door})`} />
      <ellipse cx={cx} cy={cy + FY * kE} rx={260 * kE} ry={60 * kE} fill={`rgba(255,30,20,${0.35 * dl * door})`} filter="url(#v38glow)" />
      {slabs}
      {lampEls}
      <rect width={W} height={H} fill="url(#v38haze)" />
      {/* dust in the air */}
      {Array.from({ length: 40 }, (_, i) => {
        const px = (hash(i) * W + T * (8 + hash(i + 3) * 14)) % W, py = (hash(i + 7) * H + Math.sin(T * 0.6 + i) * 30 - T * 6) % H;
        return <circle key={`d${i}`} cx={px} cy={(py + H) % H} r={1 + hash(i + 2) * 2.5} fill={`rgba(220,230,220,${0.08 + 0.12 * hash(i + 5)})`} />;
      })}
    </svg>
  );
};

// ───── 1 · exterior: fast zoom on the real shop, slight shake, big title ─────
const SceneExterior: React.FC<{ T: number }> = ({ T }) => {
  const cam = camMove(T, 0, tCorr, { fx: 0.6, fy: 0.36, s: 1.08 }, { fx: 0.62, fy: 0.3, s: 1.42 }, { ds: 0.55, dur: 0.55 });
  const sk = shakeXY(T, 5 + kick(T, 0, 18, 0.6));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sk.x}px,${sk.y}px)` }}>
        <Media src="v38/img/exterior.jpg" sw={2228} sh={1416} box={BAND} cam={cam} filter="saturate(0.55) contrast(1.15) brightness(0.82) sepia(0.12)" />
      </div>
      <BandFades />
      <Chapter T={T} t0={0} tag="پرونده‌ی اینترنتی" text="زیرزمینِ شهرِ فرش؟" size={108} y={90} red={["فرش؟"]} />
    </AbsoluteFill>
  );
};

// ───── 2 · reconstructed corridor: slow dolly, flicker, title slam on «زیرزمینِ شهرِ فرش» ─────
const SceneCorridor: React.FC<{ T: number }> = ({ T }) => {
  const u = prog(T, tCorr, tL3);
  const camZ = 300 + 1500 * easeInOut(u) + kick(T, tName, -120, 0.5);
  const sk = shakeXY(T, 3 + kick(T, tName, 22, 0.6));
  const slam = easeOut(prog(T, tName - 0.05, tName + 0.25));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sk.x}px,${sk.y}px)` }}>
        <Corridor T={T} camZ={camZ} tint={[0.95, 1.02, 0.95]} />
      </div>
      <div style={{ position: "absolute", right: 50, top: 90, display: "flex", alignItems: "center", gap: 12, fontFamily: "V38Bold", fontSize: 30, color: "rgba(255,255,255,0.85)", direction: "rtl" }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: Math.sin(T * 6) > 0 ? 1 : 0.2 }} />بازسازیِ تصویری · واقعی نیست
      </div>
      <div style={{ position: "absolute", left: 50, top: 92, fontFamily: "V38Mono", fontSize: 30, color: "rgba(255,255,255,0.6)" }}>B2 · {fa(String(Math.floor(T * 30) % 1000).padStart(3, "0"))}</div>
      {T > tName - 0.05 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", direction: "rtl", opacity: slam, transform: `scale(${lerp(1.6, 1, slam)})` }}>
          <div style={{ fontFamily: "V38Black", fontSize: 128, color: "#fff", lineHeight: 1.15, textShadow: `0 0 40px rgba(255,40,30,0.5), 0 6px 30px #000` }}>زیرزمینِ</div>
          <div style={{ fontFamily: "V38Black", fontSize: 150, color: RED, lineHeight: 1.1, textShadow: "0 6px 30px #000" }}>شهرِ فرش</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ───── 3 · where it started: a joke post on a phone → a wall of posts + trending tag ─────
const Heart: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.3 1.1 3.9 2 .5-.9 1.9-2 3.9-2C17.6 5 19.6 8.4 18.2 11.8 16.1 16.4 12 21 12 21z" transform="translate(1.5 0)" fill={fill} /></svg>
);
const Post: React.FC<{ T: number; t0: number; img: string; caption: string; w: number; tint?: string; scale?: number }> = ({ T, t0, img, caption, w, tint, scale = 1 }) => {
  const likeP = prog(T, t0 + 0.4, t0 + 2.6);
  return (
    <div style={{ width: w, background: "#121316", borderRadius: 26 * scale, overflow: "hidden", direction: "rtl", boxShadow: "0 30px 60px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 * scale, padding: `${18 * scale}px ${22 * scale}px` }}>
        <div style={{ width: 54 * scale, height: 54 * scale, borderRadius: "50%", background: "linear-gradient(135deg,#444,#222)", border: `3px solid ${RED}` }} />
        <div style={{ fontFamily: "V38Bold", fontSize: 30 * scale, color: "#eee" }}>کاربرِ ناشناس</div>
        <div style={{ marginRight: "auto", fontFamily: "V38Reg", fontSize: 26 * scale, color: "#888" }}>·· ·</div>
      </div>
      <div style={{ position: "relative", width: w, height: w * 0.9, overflow: "hidden" }}>
        <Img src={staticFile(img)} style={{ position: "absolute", width: "auto", height: "100%", left: "50%", transform: `translateX(-50%) scale(${1.05 + 0.08 * prog(T, t0, t0 + 6)})`, filter: `saturate(0.6) brightness(0.8) ${tint ?? ""}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 26 * scale, textAlign: "center", fontFamily: "V38Black", fontSize: 50 * scale, color: "#fff", WebkitTextStroke: `${3 * scale}px #000`, paintOrder: "stroke fill", padding: `0 ${30 * scale}px`, lineHeight: 1.3 }}>{caption}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26 * scale, padding: `${18 * scale}px ${24 * scale}px` }}>
        <div style={{ transform: `scale(${1 + 0.35 * kick(T, t0 + 0.5, 1, 0.35)})` }}><Heart size={52 * scale} fill={T > t0 + 0.5 ? RED : "#666"} /></div>
        <div style={{ fontFamily: "V38Bold", fontSize: 30 * scale, color: "#ddd" }}>{fa(Math.round(lerp(12, 48700, easeInOut(likeP))).toLocaleString("en-US"))}</div>
        <div style={{ fontFamily: "V38Reg", fontSize: 28 * scale, color: "#999" }}>· {fa(Math.round(lerp(1, 3100, easeInOut(likeP))))} کامنت</div>
      </div>
    </div>
  );
};
const SceneOrigin: React.FC<{ T: number }> = ({ T }) => {
  const wall = prog(T, tMyst, tMyst + 0.6);
  const phoneIn = easeOut(prog(T, tL3, tL3 + 0.45));
  const postIn = easeOut(prog(T, tJoke, tJoke + 0.35));
  const z = lerp(1, 0.42, easeInOut(wall));
  const grid = Array.from({ length: 16 }, (_, i) => i);
  const caps = ["وقتی می‌ری زیرزمین 💀", "فایلِ لو رفته؟!", "اون پایین چیه؟", "قسمتِ ۲ 😨", "کسی رفته پایین؟", "باور نکنید!", "راسته؟؟", "صدای زیرزمین 🔊"];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #1a1416 0%, #050505 70%)", overflow: "hidden" }}>
      {/* the wall of posts behind */}
      {wall > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1000, transform: `translate(-50%,-50%) scale(${lerp(1.25, 1, easeOut(wall))}) rotate(-8deg)`, display: "grid", gridTemplateColumns: "repeat(4, 300px)", gap: 26, opacity: easeOut(wall) }}>
          {grid.map((i) => {
            const a = easeOut(prog(T, tMyst + 0.05 * i, tMyst + 0.05 * i + 0.3));
            return (
              <div key={i} style={{ opacity: a, transform: `scale(${0.6 + 0.4 * a}) translateY(${-((T * 40 + i * 37) % 60)}px)` }}>
                <Post T={T} t0={tMyst + 0.05 * i} img={i % 3 === 0 ? "v38/img/exterior.jpg" : i % 3 === 1 ? "v38/img/interior.jpg" : "v38/img/logo.jpg"} caption={caps[i % caps.length]} w={300} scale={0.3} tint={i % 2 ? "hue-rotate(-20deg) sepia(0.5)" : ""} />
              </div>
            );
          })}
        </div>
      )}
      {wall > 0 && <AbsoluteFill style={{ background: `rgba(120,0,0,${0.25 * wall})`, mixBlendMode: "multiply" }} />}
      {/* the phone */}
      <div style={{ position: "absolute", left: 540, top: 930, transform: `translate(-50%,-50%) translateY(${(1 - phoneIn) * 900}px) scale(${z * 0.86}) rotate(${lerp(-3, 4, easeInOut(wall))}deg)`, width: 700, height: 1260, borderRadius: 70, background: "#0a0a0b", border: "10px solid #26272b", boxShadow: "0 50px 120px rgba(0,0,0,0.8)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 170, height: 38, borderRadius: 20, background: "#000" }} />
        <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center", fontFamily: "V38Black", fontSize: 38, color: "#fff", direction: "rtl" }}>اکسپلور</div>
        <div style={{ position: "absolute", top: 150 + (1 - postIn) * 500, left: 20, opacity: postIn }}>
          <Post T={T} t0={tJoke} img="v38/img/exterior.jpg" caption="وقتی می‌ری زیرزمینِ شهر فرش 💀" w={640} />
        </div>
        {T < tJoke && (
          <div style={{ position: "absolute", top: 160, left: 20, right: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {[0, 1].map((i) => <div key={i} style={{ height: 420, borderRadius: 24, background: `linear-gradient(90deg,#16171a ${((T * 80) % 100) - 30}%,#222327 ${((T * 80) % 100)}%,#16171a ${((T * 80) % 100) + 30}%)` }} />)}
          </div>
        )}
      </div>
      {wall > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1610, display: "flex", justifyContent: "center", direction: "rtl", opacity: easeOut(prog(T, tMyst + 0.4, tMyst + 0.8)), transform: `scale(${backOut(prog(T, tMyst + 0.4, tMyst + 0.8))})` }}>
          <div style={{ fontFamily: "V38Black", fontSize: 52, color: "#fff", background: RED, padding: "10px 32px 18px", borderRadius: 14, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "V38Mono", fontSize: 40 }}>▲</span> #زیرزمین_شهر_فرش
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(#000 0%, rgba(0,0,0,0.85) 14%, rgba(0,0,0,0) 26%)" }} />
      <Chapter T={T} t0={tL3} text="ماجرا از کجا شروع شد؟" red={["شروع"]} />
    </AbsoluteFill>
  );
};

// ───── 4 · «leaked files»: fast cuts of corridor «recordings» with a camcorder HUD ─────
const LEAKS: { z0: number; tint: [number, number, number]; name: string }[] = [
  { z0: 2400, tint: [0.75, 1.15, 0.8], name: "leaked_01.mp4" },
  { z0: 5200, tint: [1.15, 0.8, 0.75], name: "leaked_02.mp4" },
  { z0: 1200, tint: [0.8, 0.9, 1.15], name: "leaked_03.mp4" },
];
const SceneLeaked: React.FC<{ T: number }> = ({ T }) => {
  const cuts = [tL4, tL4 + (tLeak2 - tL4) * 0.5, tLeak2];
  const i = cuts.filter((x) => T >= x).length - 1;
  const L0 = LEAKS[Math.max(0, i)], lt = T - cuts[Math.max(0, i)];
  const camZ = L0.z0 + lt * 260 + Math.sin(T * 3) * 30;
  const sk = shakeXY(T, 9);
  const stamp = easeOut(prog(T, tLeak + 0.1, tLeak + 0.35));
  const tc = 3 * 60 + 12 + lt * 1 + i * 47;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sk.x}px,${sk.y}px) rotate(${Math.sin(T * 2.1) * 1.2}deg) scale(1.06)`, filter: "contrast(1.25) saturate(0.7)" }}>
        <Corridor T={T} camZ={camZ} tint={L0.tint} sway={2.5} />
      </div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
      {/* camcorder HUD */}
      <div style={{ position: "absolute", left: 60, top: 330, right: 60, display: "flex", justifyContent: "space-between", fontFamily: "V38Mono", fontSize: 40, color: "#fff", textShadow: "0 2px 6px #000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}><span style={{ width: 24, height: 24, borderRadius: 12, background: RED, opacity: Math.sin(T * 7) > 0 ? 1 : 0.15 }} />REC</div>
        <div>{L0.name}</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 1240, fontFamily: "V38Mono", fontSize: 36, color: "rgba(255,255,255,0.85)" }}>
        00:{String(Math.floor(tc / 60)).padStart(2, "0")}:{String(Math.floor(tc % 60)).padStart(2, "0")}:{String(Math.floor(T * 30) % 30).padStart(2, "0")}
      </div>
      {[[60, 300], [960, 300], [60, 1290], [960, 1290]].map(([x, y], k) => (
        <div key={k} style={{ position: "absolute", left: x, top: y, width: 60, height: 60, borderColor: "rgba(255,255,255,0.8)", borderStyle: "solid", borderWidth: `${k < 2 ? 4 : 0}px ${k % 2 ? 4 : 0}px ${k >= 2 ? 4 : 0}px ${k % 2 ? 0 : 4}px` }} />
      ))}
      {T > tLeak + 0.1 && (
        <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%,-50%) rotate(-9deg) scale(${lerp(2.2, 1, stamp)})`, opacity: stamp, border: `10px solid ${RED}`, borderRadius: 18, padding: "6px 40px 20px", fontFamily: "V38Black", fontSize: 120, color: RED, direction: "rtl", background: "rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>
          لو رفته؟
        </div>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(#000 0%, rgba(0,0,0,0.85) 11%, rgba(0,0,0,0) 17%)" }} />
      <Chapter T={T} t0={tL4} text="«فایل‌های لو رفته»" red={["رفته»"]} />
    </AbsoluteFill>
  );
};

// ───── 5 · streamers react: a live-stream screen, a dark webcam silhouette, chat; push into the screen on «اون پایین» ─────
const CHAT: [string, string][] = [["user_۴۸۲", "این واقعیه؟؟ 😳"], ["sara.k", "من که باور نمی‌کنم 😂"], ["amir_77", "یکی بره ببینه"], ["mmd", "صدای چی بود؟!"], ["niloo", "قسمت بعد کِی میاد؟"], ["reza.tehran", "فیکه بابا"], ["user_۹۱", "اون پایین چه خبره؟"], ["ali", "من می‌ترسم 💀"], ["hasti", "منبع؟؟"], ["pouya", "برید پایین دیگه!"]];
const SceneLive: React.FC<{ T: number }> = ({ T }) => {
  const push = easeInOut(prog(T, tDown, tL6));
  const z = 1 + 0.75 * push;
  const n = Math.floor((T - tL5) / 0.55) + 1;
  const react = kick(T, tL5 + 2.2, 1, 0.6) + kick(T, tDown, 1.4, 0.6);
  return (
    <AbsoluteFill style={{ background: "#0d0e12" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "540px 640px" }}>
        {/* top bar */}
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, height: 66, display: "flex", alignItems: "center", gap: 18, direction: "ltr" }}>
          <div style={{ background: RED, color: "#fff", fontFamily: "V38Mono", fontSize: 34, padding: "2px 18px", borderRadius: 8 }}>LIVE</div>
          <div style={{ fontFamily: "V38Mono", fontSize: 32, color: "#ccc" }}>👁 {(12.4 + (T - tL5) * 0.7).toFixed(1)}K</div>
          <div style={{ marginLeft: "auto", fontFamily: "V38Bold", fontSize: 32, color: "#fff", direction: "rtl" }}>واکنش به فایل‌های زیرزمین 😱</div>
        </div>
        {/* the stream screen */}
        <div style={{ position: "absolute", left: 40, top: 380, width: 1000, height: 560, borderRadius: 18, overflow: "hidden", border: "2px solid rgba(255,255,255,0.12)" }}>
          <div style={{ position: "absolute", left: 0, top: -680, width: W, height: H, transform: "scale(0.93)", transformOrigin: "50% 50%" }}>
            <Corridor T={T} camZ={3600 + (T - tL5) * 220} tint={[0.75, 1.15, 0.8]} sway={2} />
          </div>
          {/* webcam */}
          <div style={{ position: "absolute", right: 18, bottom: 18, width: 300, height: 220, borderRadius: 14, overflow: "hidden", background: "radial-gradient(ellipse at 50% 30%, #2b3d5a 0%, #0b0f18 75%)", border: "3px solid rgba(255,255,255,0.3)" }}>
            <svg width={300} height={220} viewBox="0 0 300 220" style={{ transform: `translate(${(noise(T * 3) - 0.5) * 6}px, ${-react * 18}px) scale(${1 + react * 0.08})` }}>
              <ellipse cx={150} cy={250} rx={120} ry={90} fill="#05070c" />
              <ellipse cx={150} cy={110} rx={52} ry={62} fill="#070a10" />
              <path d="M92 104 Q150 30 208 104" stroke="#111722" strokeWidth={14} fill="none" />
              <rect x={82} y={96} width={22} height={40} rx={8} fill="#111722" /><rect x={196} y={96} width={22} height={40} rx={8} fill="#111722" />
              <ellipse cx={150} cy={110} rx={52} ry={62} fill="none" stroke={`rgba(120,200,255,${0.25 + 0.2 * noise(T * 5)})`} strokeWidth={3} />
            </svg>
          </div>
        </div>
        {/* chat */}
        <div style={{ position: "absolute", left: 40, top: 960, width: 1000, height: 380, overflow: "hidden", direction: "rtl", background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: "10px 24px", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {CHAT.slice(0, clamp(n, 0, CHAT.length)).slice(-5).map(([u, m], i, arr) => {
              const idx = CHAT.indexOf(CHAT.find((x) => x[1] === m)!);
              const a = easeOut(prog(T, tL5 + idx * 0.55, tL5 + idx * 0.55 + 0.25));
              return (
                <div key={u + m} style={{ fontFamily: "V38Bold", fontSize: 38, color: "#fff", opacity: a * (0.5 + 0.5 * ((i + 1) / arr.length)), transform: `translateX(${(1 - a) * -60}px)` }}>
                  <span style={{ color: ["#ff6b6b", "#ffd166", "#7bdff2", "#b8f2a6"][idx % 4], marginLeft: 14 }}>{u}:</span>{m}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(#000 0%, rgba(0,0,0,0.9) 12%, rgba(0,0,0,0) 15.5%)" }} />
      <Chapter T={T} t0={tL5} text="واکنشِ استریمرها" />
    </AbsoluteFill>
  );
};

// ───── 6 · «اما صبر کن…»: the stream freezes (pause, VHS) → sudden zoom on Pejman, silence ─────
const ScenePause: React.FC<{ T: number }> = ({ T }) => {
  const u = prog(T, tL6, tPej);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, filter: `grayscale(${0.6 + 0.4 * u}) brightness(${0.75 - 0.35 * u}) contrast(1.2)`, transform: `scale(${1.75 + 0.05 * u})`, transformOrigin: "540px 640px" }}>
        <SceneLive T={tL6 - 0.04} />
      </div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)" }} />
      <div style={{ position: "absolute", left: 0, top: 560 + ((T * 900) % 900), width: W, height: 26, background: "rgba(255,255,255,0.12)", filter: "blur(4px)" }} />
      <div style={{ position: "absolute", left: 540, top: 820, transform: "translate(-50%,-50%)", display: "flex", gap: 34, opacity: easeOut(prog(T, tL6 + 0.05, tL6 + 0.25)) }}>
        <div style={{ width: 54, height: 200, background: "#fff", borderRadius: 8 }} /><div style={{ width: 54, height: 200, background: "#fff", borderRadius: 8 }} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 330, fontFamily: "V38Mono", fontSize: 44, color: "#fff" }}>PAUSE ❚❚</div>
      <Chapter T={T} t0={tL6} text="اما صبر کن…" size={96} />
    </AbsoluteFill>
  );
};
const ScenePejman: React.FC<{ T: number }> = ({ T }) => {
  const z = easeOut(prog(T, tPej, tPej + 0.22));
  const cam = { fx: lerp(0.5, 0.53, z), fy: lerp(0.5, 0.36, z), s: lerp(1.0, 1.85, z) + 0.12 * prog(T, tPej + 0.22, tL7) };
  const sk = shakeXY(T, 2 + kick(T, tPej, 26, 0.4));
  const name = easeOut(prog(T, tPej + 0.35, tPej + 0.7));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sk.x}px,${sk.y}px)` }}>
        <Media src="v38/img/pejman.jpg" sw={1800} sh={1200} box={BAND} cam={cam} filter="saturate(0.5) contrast(1.15) brightness(0.85)" />
      </div>
      <BandFades />
      {/* focus brackets on the face */}
      {T > tPej + 0.25 && [[300, 520], [780, 520], [300, 1100], [780, 1100]].map(([x, y], k) => (
        <div key={k} style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, opacity: name * (0.6 + 0.4 * Math.sin(T * 10)), borderColor: RED, borderStyle: "solid", borderWidth: `${k < 2 ? 5 : 0}px ${k % 2 ? 5 : 0}px ${k >= 2 ? 5 : 0}px ${k % 2 ? 0 : 5}px` }} />
      ))}
      <div style={{ position: "absolute", right: 50, top: 110, direction: "rtl", opacity: name, transform: `translateX(${(1 - name) * -40}px)` }}>
        <div style={{ fontFamily: "V38Black", fontSize: 104, color: "#fff", lineHeight: 1.2 }}>پژمان جمشیدی</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          <div style={{ width: 120 * name, height: 6, background: RED, borderRadius: 3 }} />
          <div style={{ fontFamily: "V38Bold", fontSize: 38, color: "rgba(255,255,255,0.75)" }}>بازیگر</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───── 7 · the ad teaser: cuts between his face and the Shahr-e Farsh logo, then the two hashtags get tied together ─────
type Clip = { src: string; len: number };
const CL = (n: string, len: number): Clip => ({ src: `v38/clips/${n}.mp4`, len });
const SceneAd: React.FC<{ T: number }> = ({ T }) => {
  const parts: { from: number; to: number; clip?: Clip; still?: string; A: Cam; B: Cam; entry?: { ds?: number; dx?: number; dy?: number } }[] = [
    { from: tL7, to: tLogo, clip: CL("rec", 10), A: { fx: 0.5, fy: 0.45, s: 1.15 }, B: { fx: 0.5, fy: 0.4, s: 1.35 }, entry: { ds: 0.3 } },
    { from: tLogo, to: tFace, still: "v38/img/logo.jpg", A: { fx: 0.5, fy: 0.5, s: 1.0 }, B: { fx: 0.5, fy: 0.5, s: 1.12 }, entry: { ds: 0.5 } },
    { from: tFace, to: tL8, clip: CL("seat2", 6.1), A: { fx: 0.5, fy: 0.42, s: 1.2 }, B: { fx: 0.52, fy: 0.4, s: 1.4 }, entry: { dx: -0.1 } },
    { from: tL8, to: tL9, clip: CL("blue", 6.6), A: { fx: 0.5, fy: 0.45, s: 1.1 }, B: { fx: 0.5, fy: 0.38, s: 1.5 }, entry: { dx: 0.1, ds: 0.2 } },
  ];
  const p = parts.find((x) => T >= x.from && T < x.to) ?? parts[parts.length - 1];
  const tied = prog(T, tTag, tTag + 0.5);
  const cam = camMove(T, p.from, p.to, p.A, p.B, p.entry);
  const shrink = easeInOut(tied);
  const box = { x: lerp(0, 190, shrink), y: lerp(BAND.y, 760, shrink), w: lerp(W, 700, shrink), h: lerp(BAND.h, 520, shrink) };
  const isLogo = !!p.still;
  return (
    <AbsoluteFill style={{ background: isLogo ? "#8f0b0b" : "#000" }}>
      {tied > 0 && <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #1c1012 0%, #040404 75%)" }} />}
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${-4 * shrink}deg)`, transformOrigin: "540px 1020px" }}>
        {p.clip ? <Media src={p.clip.src} sw={1280} sh={704} box={box} cam={cam} clipT={T - p.from} clipLen={p.clip.len} filter="saturate(0.75) contrast(1.1) brightness(0.9)" /> :
          <Media src={p.still!} sw={1280} sh={704} box={box} cam={cam} />}
        {tied > 0 && <div style={{ position: "absolute", left: box.x - 6, top: box.y - 6, width: box.w + 12, height: box.h + 12, border: "6px solid #f2efe8", borderRadius: 6, boxShadow: "0 30px 70px rgba(0,0,0,0.7)" }} />}
      </div>
      {!isLogo && tied === 0 && <BandFades />}
      {/* source line */}
      {tied === 0 && !isLogo && <div style={{ position: "absolute", left: 50, top: 1560, fontFamily: "V38Reg", fontSize: 28, color: "rgba(255,255,255,0.6)", direction: "rtl" }}>تصویر: تیزرِ تبلیغاتیِ شهر فرش</div>}
      {/* the two tags and the red string */}
      {tied > 0 && (() => {
        const a1 = backOut(prog(T, tTag + 0.25, tTag + 0.6)), a2 = backOut(prog(T, tTag + 0.45, tTag + 0.8)), s = easeOut(prog(T, tTag + 0.7, tTag + 1.3));
        const P1 = { x: 330, y: 600 }, P2 = { x: 720, y: 1250 };
        return (
          <>
            <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
              <path d={`M${P1.x} ${P1.y} Q ${900} ${900} ${P2.x} ${P2.y}`} stroke={RED} strokeWidth={6} fill="none" strokeDasharray="1600" strokeDashoffset={1600 * (1 - s)} />
              <circle cx={P1.x} cy={P1.y} r={14 * a1} fill={RED} /><circle cx={P2.x} cy={P2.y} r={14 * a2} fill={RED} />
            </svg>
            <div style={{ position: "absolute", left: P1.x, top: P1.y, transform: `translate(-50%,-120%) scale(${a1})`, fontFamily: "V38Black", fontSize: 50, color: "#fff", background: "#1b1c20", border: "2px solid rgba(255,255,255,0.2)", padding: "8px 26px 14px", borderRadius: 14, whiteSpace: "nowrap", direction: "rtl" }}>#پژمان_جمشیدی</div>
            <div style={{ position: "absolute", left: P2.x, top: P2.y, transform: `translate(-50%,20%) scale(${a2})`, fontFamily: "V38Black", fontSize: 50, color: "#fff", background: RED, padding: "8px 26px 14px", borderRadius: 14, whiteSpace: "nowrap", direction: "rtl" }}>#زیرزمین_شهر_فرش</div>
          </>
        );
      })()}
      <AbsoluteFill style={{ background: "linear-gradient(#000 0%, rgba(0,0,0,0.8) 13%, rgba(0,0,0,0) 17%)", opacity: isLogo ? 0.85 : 1 }} />
      <Chapter T={T} t0={tL7} text="چهره‌ی تبلیغاتِ شهر فرش" size={70} />
    </AbsoluteFill>
  );
};

// ───── 8 · the real shop floor: the lights go down, slow drift; the evidence file says «not found» ─────
const SceneEvidence: React.FC<{ T: number }> = ({ T }) => {
  const u = prog(T, tL9, tL11);
  const cam = camMove(T, tL9, tL11, { fx: 0.62, fy: 0.5, s: 1.1 }, { fx: 0.38, fy: 0.47, s: 1.28 }, { ds: 0.15 });
  const dim = lerp(0.95, 0.32, easeInOut(prog(T, tL9, tL10 + 2))) * (noise(T * 6) > 0.82 && T < tL10 + 2 ? 0.55 : 1);
  const card = easeOut(prog(T, tProof - 0.6, tProof - 0.1));
  const rows: [string, number][] = [["ویدیوی تأییدشده", wd(10, "مستقل")], ["شاهدِ مستقل", wd(10, "معتبری")], ["گزارشِ رسمی", wd(10, "پیدا")]];
  const stamp = easeOut(prog(T, tNone, tNone + 0.22));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Media src="v38/img/interior.jpg" sw={1660} sh={960} box={BAND} cam={cam} filter={`saturate(${0.7 - 0.4 * u}) brightness(${dim}) contrast(1.1)`} />
      <BandFades />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 20%, rgba(0,0,0,${0.3 + 0.5 * u}) 85%)` }} />
      {card > 0 && (
        <div style={{ position: "absolute", left: 120, top: 470, width: 840, transform: `translateY(${(1 - card) * 700}px) rotate(${lerp(8, -3, card)}deg)`, background: "radial-gradient(ellipse at 40% 30%, #efe6d2 0%, #d8caa9 100%)", borderRadius: 10, padding: "50px 60px 60px", direction: "rtl", boxShadow: "0 40px 90px rgba(0,0,0,0.8)" }}>
          <div style={{ fontFamily: "V38Black", fontSize: 54, color: "#231d15" }}>پرونده‌ی مدرک</div>
          <div style={{ fontFamily: "V38Reg", fontSize: 30, color: "#5d5241", marginTop: 4 }}>موضوع: زیرزمینِ شهر فرش</div>
          <div style={{ height: 3, background: "rgba(60,45,30,0.4)", margin: "24px 0 18px" }} />
          {rows.map(([label, t], i) => {
            const a = easeOut(prog(T, t, t + 0.25));
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "V38Bold", fontSize: 44, color: "#231d15", padding: "14px 0", borderBottom: "2px dashed rgba(60,45,30,0.3)", opacity: 0.35 + 0.65 * a }}>
                <span>{label}</span>
                <span style={{ fontFamily: "V38Black", fontSize: 58, color: RED, transform: `scale(${lerp(2, 1, a)})`, opacity: a }}>✗</span>
              </div>
            );
          })}
          {T > tNone && (
            <div style={{ position: "absolute", left: 60, bottom: -40, transform: `rotate(-12deg) scale(${lerp(2.4, 1, stamp)})`, opacity: stamp, border: `9px solid ${RED}`, borderRadius: 14, padding: "0 30px 12px", fontFamily: "V38Black", fontSize: 92, color: RED, background: "rgba(239,230,210,0.6)" }}>پیدا نشد</div>
          )}
        </div>
      )}
      <Chapter T={T} t0={tL9} text="ولی قسمتِ عجیبش اینجاست…" size={66} />
    </AbsoluteFill>
  );
};

// ───── 9 · the search page: typing word by word, results, «؟», endless repeats, red glitch ─────
const RESULTS = [
  ["زیرزمینِ شهر فرش؛ ماجرا چیه؟", "شایعه‌ای که این روزها در شبکه‌های اجتماعی دست‌به‌دست می‌شود…"],
  ["«فایل‌های لو رفته» واقعی‌اند یا ساختگی؟", "هنوز هیچ منبعِ مستقلی این ویدیوها را تأیید نکرده…"],
  ["واکنشِ استریمرها به زیرزمینِ شهر فرش", "ویدیوهای واکنش، میلیون‌ها بازدید گرفته‌اند…"],
];
const SceneSearch: React.FC<{ T: number }> = ({ T }) => {
  const q = ["زیرزمین", "شهر", "فرش", "واقعیه؟"];
  const typed = q.filter((_, i) => T >= tL11 + 0.35 + i * 0.45).join(" ");
  const load = prog(T, tL12, tL12 + 0.5);
  const rep = prog(T, tL13 + 1.2, tScary);
  const scroll = easeInOut(rep) * 2600;
  const red = prog(T, tScary - 0.05, tScary + 0.3);
  const q2 = easeOut(prog(T, tSecret - 0.1, tSecret + 0.25));
  const list = rep > 0 ? Array.from({ length: 24 }, (_, i) => RESULTS[i % 3]) : RESULTS;
  return (
    <AbsoluteFill style={{ background: "#0f1013" }}>
      <div style={{ position: "absolute", inset: 0, filter: red > 0 ? `sepia(1) hue-rotate(-50deg) saturate(${1 + 4 * red}) contrast(${1 + 0.4 * red})` : undefined, transform: `translate(${kick(T, tScary, 30, 0.3) * (hash(Math.floor(T * 30)) - 0.5)}px,0)` }}>
        {/* search box */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 330, height: 120, borderRadius: 60, background: "#1d1f24", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", padding: "0 44px", direction: "rtl", gap: 24 }}>
          <svg width={50} height={50} viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" stroke="#aaa" strokeWidth="2.5" fill="none" /><path d="M15 15 L21 21" stroke="#aaa" strokeWidth="2.5" /></svg>
          <div style={{ fontFamily: "V38Bold", fontSize: 50, color: "#fff" }}>{typed}<span style={{ opacity: Math.sin(T * 9) > 0 ? 1 : 0, color: RED }}>|</span></div>
        </div>
        {/* results */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 500 - scroll, direction: "rtl", display: "flex", flexDirection: "column", gap: 34, opacity: load > 0 ? 1 : 0 }}>
          {list.map(([t, s], i) => {
            const a = easeOut(prog(load, i * 0.25, i * 0.25 + 0.5));
            return (
              <div key={i} style={{ opacity: i < 3 ? a : 1, transform: `translateY(${(1 - (i < 3 ? a : 1)) * 40}px)`, background: "#16181c", borderRadius: 22, padding: "30px 36px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: "V38Reg", fontSize: 26, color: "#7a8", direction: "ltr", textAlign: "right" }}>www.example-news.ir › {fa(i + 1)}</div>
                <div style={{ fontFamily: "V38Black", fontSize: 46, color: "#8ab4ff", marginTop: 8, lineHeight: 1.35 }}>{t}</div>
                <div style={{ fontFamily: "V38Reg", fontSize: 32, color: "#aaa", marginTop: 8, lineHeight: 1.5 }}>{s}</div>
              </div>
            );
          })}
        </div>
        {/* the big question mark */}
        {T > tSecret - 0.1 && (
          <div style={{ position: "absolute", left: 540, top: 980, transform: `translate(-50%,-50%) scale(${lerp(2.5, 1, q2) * (1 + 0.6 * red)}) rotate(${Math.sin(T * 2) * 4}deg)`, opacity: q2 * (0.95 - 0.25 * prog(T, tL13, tL13 + 1) + 0.3 * red), fontFamily: "V38Black", fontSize: 720, lineHeight: 1, color: RED, textShadow: "0 0 80px rgba(255,30,20,0.6), 0 20px 60px #000" }}>؟</div>
        )}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(#000 0%, rgba(0,0,0,0.9) 13%, rgba(0,0,0,0) 16.5%)" }} />
      <Chapter T={T} t0={tL11} text="شایعه یا واقعیت؟" red={["واقعیت؟"]} />
    </AbsoluteFill>
  );
};

// ───── 10 · black: the last sentences, then the question to the viewer ─────
const EndWords: React.FC<{ T: number; line: number; size: number; red?: string[] }> = ({ T, line, size, red = [] }) => {
  const ws = VO.words.filter((w) => w.line === line);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 20px", direction: "rtl", fontFamily: "V38Black", fontSize: size, lineHeight: 1.45 }}>
      {ws.map((w, i) => {
        const a = easeOut(prog(T, w.s - 0.05, w.s + 0.25));
        const b = bare(w.w);
        return <span key={i} style={{ opacity: 0.08 + 0.92 * a, color: red.includes(b) ? RED : "#F3F0EA", filter: `blur(${(1 - a) * 6}px)`, display: "inline-block" }}>{w.w.replace(/[ً-ْ]/g, "")}</span>;
      })}
    </div>
  );
};
const SceneEnd: React.FC<{ T: number }> = ({ T }) => {
  const out14 = 1 - easeOut(prog(T, tL15 - 0.25, tL15));
  const cta = easeOut(prog(T, tL16, tL16 + 0.4));
  const pills = (t: number) => backOut(prog(T, t, t + 0.35));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 95%, rgba(150,10,5,${0.22 + 0.08 * Math.sin(T * 1.5)}) 0%, rgba(0,0,0,0) 45%)` }} />
      {T < tL15 && <div style={{ position: "absolute", left: 80, right: 80, top: 640, opacity: out14 }}><EndWords T={T} line={14} size={76} /></div>}
      {T >= tL15 - 0.05 && T < tL16 && <div style={{ position: "absolute", left: 80, right: 80, top: 640, opacity: 1 - easeOut(prog(T, tL16 - 0.2, tL16)) }}><EndWords T={T} line={15} size={80} red={["باور", "مدرکی"]} /></div>}
      {T >= tL16 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 46, direction: "rtl", opacity: cta }}>
          <div style={{ fontFamily: "V38Black", fontSize: 96, color: "#fff" }}>تو چی فکر می‌کنی؟</div>
          <div style={{ display: "flex", gap: 30 }}>
            <div style={{ transform: `scale(${pills(wd(16, "واقعیه"))})`, fontFamily: "V38Black", fontSize: 60, color: "#fff", background: RED, borderRadius: 24, padding: "14px 44px 24px" }}>واقعیه 😨</div>
            <div style={{ transform: `scale(${pills(wd(16, "شوخی"))})`, fontFamily: "V38Black", fontSize: 60, color: "#111", background: "#F3F0EA", borderRadius: 24, padding: "14px 44px 24px" }}>شوخیه 😂</div>
          </div>
          <div style={{ fontFamily: "V38Bold", fontSize: 46, color: "rgba(255,255,255,0.8)", opacity: easeOut(prog(T, wd(16, "جدی"), wd(16, "جدی") + 0.4)), transform: `translateY(${Math.sin(T * 4) * 8}px)` }}>👇 توی کامنت‌ها بنویس</div>
        </div>
      )}
      {T < tL16 && <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "V38Reg", fontSize: 30, color: `rgba(255,255,255,${0.35 * easeOut(prog(T, tL15 + 1, tL15 + 1.6))})`, direction: "rtl" }}>این ویدیو یک شایعه را بررسی می‌کند، نه یک ادعای اثبات‌شده.</div>}
    </AbsoluteFill>
  );
};

// ───── captions: 2–3 words, white, keywords red, the spoken word pops ─────
const Captions: React.FC<{ T: number }> = ({ T }) => {
  if (T >= tL14 - 0.1) return null;
  const ch = [...CAPS].reverse().find((x) => T >= x.s - 0.03);
  if (!ch || T > ch.e + 0.25) return null;
  const a = easeOut(prog(T, ch.s - 0.03, ch.s + 0.12));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1400, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 22px", direction: "rtl", transform: `scale(${0.88 + 0.12 * a})`, opacity: a }}>
      {ch.words.map((w, i) => {
        const on = T >= w.s - 0.04;
        const pop = on ? 1 + 0.12 * (1 - easeOut(prog(T, w.s - 0.04, w.s + 0.16))) : 1;
        return (
          <span key={i} style={{ fontFamily: "V38Black", fontSize: 80, lineHeight: 1.35, color: w.kw && !(T > tScary - 0.1 && T < tL14) ? "#FF4A3D" : "#FFFFFF", opacity: on ? 1 : 0.5, display: "inline-block", transform: `scale(${pop})`,
            WebkitTextStroke: "3px rgba(0,0,0,0.9)", paintOrder: "stroke fill", textShadow: "0 5px 18px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)" }}>
            {bare(w.w)}
          </span>
        );
      })}
    </div>
  );
};

// ───── glitch on cuts: slices shift, RGB split bars, static ─────
const Glitch: React.FC<{ T: number }> = ({ T }) => {
  const c0 = CUTS.find((x) => T >= x - 0.03 && T < x + 0.2);
  if (c0 === undefined) return null;
  const f = Math.floor(T * 30);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 7 }, (_, i) => {
        const y = hash(f * 7 + i) * H, h = 10 + hash(f * 3 + i) * 90;
        return <div key={i} style={{ position: "absolute", left: (hash(f + i * 5) - 0.5) * 120, top: y, width: W, height: h, background: i % 3 === 0 ? "rgba(255,30,30,0.35)" : i % 3 === 1 ? "rgba(0,255,255,0.22)" : "rgba(255,255,255,0.15)", mixBlendMode: "screen" }} />;
      })}
      <Img src={staticFile(`v22/grain-${String((f % 12) + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.35, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Frame: React.FC<{ T: number }> = ({ T }) => {
  let scene: React.ReactNode;
  if (T < tCorr) scene = <SceneExterior T={T} />;
  else if (T < tL3) scene = <SceneCorridor T={T} />;
  else if (T < tL4) scene = <SceneOrigin T={T} />;
  else if (T < tL5) scene = <SceneLeaked T={T} />;
  else if (T < tL6) scene = <SceneLive T={T} />;
  else if (T < tPej) scene = <ScenePause T={T} />;
  else if (T < tL7) scene = <ScenePejman T={T} />;
  else if (T < tL9) scene = <SceneAd T={T} />;
  else if (T < tL11) scene = <SceneEvidence T={T} />;
  else if (T < tL14) scene = <SceneSearch T={T} />;
  else scene = <SceneEnd T={T} />;
  const g = CUTS.some((x) => T >= x - 0.03 && T < x + 0.12) ? (hash(Math.floor(T * 30)) - 0.5) * 40 : 0;
  const f = Math.floor(T * 30);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${g}px)` }}>{scene}</AbsoluteFill>
      {/* film grain + vignette everywhere */}
      <Img src={staticFile(`v22/grain-${String((f % 12) + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: 0.1, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <Glitch T={T} />
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

export const V38_LOOK = [0.05, 0.4, 2.5, tCorr + 1.5, tName + 0.8, tL3 + 1.2, tJoke + 1.5, tMyst + 1.5, tL4 + 0.8, tLeak + 0.6, tL5 + 2.5, tDown + 0.8, tL6 + 0.8, tPej + 0.8, tL7 + 1, tLogo + 0.5, tFace + 0.8, tTag + 1.5, tL9 + 1.5, tNone + 0.8, tL11 + 2, tSecret + 0.6, tRepeat + 1, tScary + 0.4, tL14 + 3, tBelieve + 0.5, lineEnd(16) + 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V38: React.FC = () => (
  <>
    <Composition id="V38" component={Video} durationInFrames={V38_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v38/mix-norm.wav" }} />
    <Composition id="V38-Silent" component={Video} durationInFrames={V38_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V38-Look" component={Look} durationInFrames={V38_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: V38_LOOK }} />
  </>
);
