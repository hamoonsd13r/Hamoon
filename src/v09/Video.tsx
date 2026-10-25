// Video 09 — «پمپ‌بنزین · شب ۱ از ۷» · vertical 1080×1920 · dark vector horror, Iranian desert road.
// Own look: sodium-orange road lamps, cold glass blue, alert red. Every cue comes from words.json (line-by-line voice, tools/v09-voice.mjs).
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
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
export const V09_END = E(16) + 2.4;
export const V09_FRAMES = fr(V09_END);

// handwriting (Nastaliq) + heavy sans for the alert
const NASTA = "V09Nasta";
const BLACK = "V09Black";
if (typeof document !== "undefined") {
  const h = delayRender("v09 fonts");
  Promise.all([
    new FontFace(NASTA, `url('${staticFile("fonts/NotoNastaliqUrdu.ttf")}')`).load().then((f) => document.fonts.add(f)),
    new FontFace(BLACK, `url('${staticFile("fonts/Vazirmatn-Black.ttf")}')`).load().then((f) => document.fonts.add(f)),
  ]).then(() => continueRender(h)).catch(() => continueRender(h));
}

// ---- palette ----------------------------------------------------------------
const C = {
  night: "#06080f", sky1: "#0b1324", sky2: "#18233b", sand: "#15110d", asphalt: "#15171c",
  sodium: "#ff9a3c", sodiumGlow: "rgba(255,154,60,.35)", red: "#e8323c", glass: "#7fa3c7", ice: "#bfe3ff", radio: "#8dff9a",
  paper: "#efe3c4", ink: "#1b1712", text: "#f3efe6", dim: "#7d8494",
};

// ---- utils -------------------------------------------------------------------
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const out3 = (t: number) => 1 - (1 - t) ** 3;
const back = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;
const rk = (t: number, a: number, b: number, e = ease) => e(clamp((t - a) / (b - a)));
const hn = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ---- shared pieces ---------------------------------------------------------------
const Stars: React.FC<{ t: number; n?: number; h?: number }> = ({ t, n = 70, h = 1000 }) => (
  <g>{Array.from({ length: n }, (_, i) => <circle key={i} cx={hn(i) * 1080} cy={hn(i, 2) * h} r={0.8 + hn(i, 3) * 1.8} fill="#fff" opacity={0.25 + 0.5 * hn(i, 4) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />)}</g>
);
const Moon: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g><circle cx={x} cy={y} r={70} fill="rgba(220,230,255,.06)" /><circle cx={x} cy={y} r={38} fill="#e9e6da" /><circle cx={x + 16} cy={y - 8} r={34} fill={C.sky1} /></g>
);
const Mountains: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M0 ${y} L120 ${y - 70} L230 ${y - 30} L380 ${y - 120} L520 ${y - 40} L660 ${y - 95} L800 ${y - 35} L930 ${y - 110} L1080 ${y - 50} L1080 ${y + 40} L0 ${y + 40} Z`} fill="#0d1220" />
    <path d={`M0 ${y + 10} L160 ${y - 30} L300 ${y + 5} L470 ${y - 50} L640 ${y} L820 ${y - 40} L1080 ${y + 5} L1080 ${y + 60} L0 ${y + 60} Z`} fill="#0a0e18" />
  </g>
);

/** Person silhouette (head + shoulders), origin = neck base. */
const Figure: React.FC<{ x: number; y: number; s?: number; fill?: string; turn?: number; eyes?: number; cap?: boolean; op?: number }> = ({ x, y, s = 1, fill = "#0a0c12", turn = 0, eyes = 0, cap, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M-150 260 Q-150 40 -70 20 L70 20 Q150 40 150 260 Z" fill={fill} />
    <rect x={-26} y={-10} width={52} height={40} fill={fill} />
    <g transform={`translate(${turn * 14} 0)`}>
      <ellipse cx={0} cy={-80} rx={62} ry={76} fill={fill} />
      {cap && <path d="M-74 -118 Q0 -190 74 -118 L96 -100 L-96 -100 Z M-58 -150 L58 -150 L50 -118 L-50 -118 Z" fill={fill} />}
      {eyes > 0 && <g opacity={eyes}><circle cx={-22 + turn * 18} cy={-82} r={6} fill="#f6f1df" /><circle cx={22 + turn * 18} cy={-82} r={6} fill="#f6f1df" /></g>}
    </g>
  </g>
);

const Chip: React.FC<{ x: number; y: number; a: number; bg: string; color?: string; children: React.ReactNode; size?: number }> = ({ x, y, a, bg, color = "#fff", children, size = 40 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${a})`, opacity: a > 0.01 ? 1 : 0, background: bg, color, borderRadius: 14, padding: "8px 26px 12px", fontFamily: BLACK, fontSize: size, direction: "rtl", whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>{children}</div>
);

// ---- scenes (absolute time t) -----------------------------------------------------
/** Exterior: desert gas station. car = Paykan progress (0 off-screen left → 1 parked at pump 4). */
const Exterior: React.FC<{ t: number; car?: number; carEyes?: number; push?: number; litShop?: number }> = ({ t, car = -1, carEyes = 0, push = 0, litShop = 1 }) => {
  const z = 1 + push;
  const buzz = 0.85 + 0.15 * (hn(Math.floor(t * 12)) > 0.93 ? 0 : 1);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.night} /><stop offset="1" stopColor={C.sky2} /></linearGradient>
        <radialGradient id="pool" cx="50%" cy="0%" r="80%"><stop offset="0" stopColor="rgba(255,236,200,.55)" /><stop offset="1" stopColor="rgba(255,236,200,0)" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={C.sand} />
      <g transform={`translate(540 800) scale(${z}) translate(-540 -1100)`}>
        <rect y={-400} width={1080} height={1550} fill="url(#sky)" />
        <Stars t={t} />
        <Moon x={860} y={300} />
        <Mountains y={1060} />
        <rect y={1090} width={1080} height={1200} fill={C.sand} />
        {/* road */}
        <rect y={1440} width={1080} height={170} fill={C.asphalt} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 140 - 40} y={1520} width={70} height={8} fill="#c9a43a" opacity={0.5} />)}
        {/* canopy */}
        <path d="M110 1180 L780 1180 L780 1430 L110 1430 Z" fill="url(#pool)" opacity={buzz} />
        <rect x={90} y={1120} width={710} height={60} fill="#e9e6df" />
        <rect x={90} y={1158} width={710} height={22} fill={C.red} />
        <text x={445} y={1150} textAnchor="middle" fontFamily={BLACK} fontSize={34} fill="#1b2a44" style={{ direction: "rtl" }}>جایگاه سوخت · ۲۴ ساعته</text>
        {[150, 740].map((x) => <rect key={x} x={x - 10} y={1180} width={20} height={250} fill="#9aa1ad" />)}
        {[["۲", 250], ["۳", 445], ["۴", 640]].map(([n, x]) => (
          <g key={n as string} transform={`translate(${x} 1330)`}>
            <rect x={-34} y={0} width={68} height={110} rx={8} fill="#c6cbd3" />
            <rect x={-26} y={10} width={52} height={34} rx={4} fill="#0e1a12" />
            <text x={0} y={36} textAnchor="middle" fontFamily={FONT_NUM} fontSize={28} fill={C.radio}>{n}</text>
            <rect x={-34} y={86} width={68} height={10} fill={C.red} />
          </g>
        ))}
        {/* shop */}
        <rect x={800} y={1170} width={260} height={270} fill="#1d222c" />
        <rect x={815} y={1210} width={230} height={200} fill={`rgba(255,226,170,${0.55 * litShop})`} />
        {[870, 930, 990].map((x) => <rect key={x} x={x} y={1210} width={4} height={200} fill="#1d222c" />)}
        <rect x={815} y={1340} width={230} height={70} fill="#2a2f3a" />
        <Figure x={930} y={1330} s={0.32} fill="#151822" />
        {/* tall sign */}
        <rect x={40} y={900} width={14} height={540} fill="#3a404c" />
        <rect x={-20} y={880} width={180} height={120} rx={10} fill="#11151e" stroke={C.red} strokeWidth={5} opacity={buzz} />
        <text x={70} y={940} textAnchor="middle" fontFamily={BLACK} fontSize={34} fill={C.red} opacity={buzz}>بنزین</text>
        <text x={70} y={982} textAnchor="middle" fontFamily={FONT_NUM} fontSize={30} fill={C.sodium}>۲۴ ساعته</text>
        {/* Paykan */}
        {car >= 0 && (
          <g transform={`translate(${lerp(-420, 520, out3(car))} 1440)`}>
            <ellipse cx={170} cy={10} rx={200} ry={14} fill="rgba(0,0,0,.6)" />
            <path d="M0 -20 L0 -80 Q0 -92 14 -94 L90 -100 L130 -160 L250 -160 L300 -100 L350 -96 Q366 -94 366 -80 L366 -20 Z" fill="#dcdcd4" />
            <path d="M140 -150 L240 -150 L282 -102 L104 -102 Z" fill="#05070c" />
            <rect x={188} y={-150} width={8} height={48} fill="#dcdcd4" />
            <rect x={-4} y={-40} width={374} height={10} fill="#9ea3a8" />
            <rect x={340} y={-78} width={24} height={14} fill="#5b5a50" />
            {[70, 290].map((x) => <g key={x}><circle cx={x} cy={-14} r={34} fill="#0b0c10" /><circle cx={x} cy={-14} r={14} fill="#55595f" /></g>)}
            {carEyes > 0 && <g opacity={carEyes}><circle cx={168} cy={-124} r={4} fill="#f6f1df" /><circle cx={182} cy={-124} r={4} fill="#f6f1df" /></g>}
          </g>
        )}
        {/* road sign */}
        <g transform="translate(975 1390)">
          <rect x={-6} y={0} width={12} height={240} fill="#3a404c" />
          <rect x={-120} y={-110} width={240} height={120} rx={10} fill="#0f5a3a" stroke="#e8efe6" strokeWidth={4} />
          <text x={100} y={-62} textAnchor="end" fontFamily={FONT_TEXT} fontSize={30} fill="#fff" style={{ direction: "rtl" }}>فیروزکوه</text>
          <text x={-100} y={-62} fontFamily={FONT_NUM} fontSize={32} fill="#fff">۹۵</text>
          <text x={100} y={-18} textAnchor="end" fontFamily={FONT_TEXT} fontSize={30} fill="#fff">سمنان</text>
          <text x={-100} y={-18} fontFamily={FONT_NUM} fontSize={32} fill="#fff">۱۲۰</text>
        </g>
      </g>
    </svg>
  );
};

/** Highway perspective: lamps die one by one from the horizon towards you. */
const Highway: React.FC<{ t: number }> = ({ t }) => {
  const N = 9;
  const a = W(1, "یکی"), b = W(1, "تو") + 0.15;
  const vp: [number, number] = [540, 860];
  const offAt = (k: number) => lerp(a, b, k / (N - 1)); // k=0 far
  const near = clamp((t - a) / (b - a));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect width={1080} height={900} fill={C.night} />
      <Stars t={t} h={820} />
      <Mountains y={860} />
      <rect y={880} width={1080} height={1040} fill={C.sand} />
      <path d={`M${vp[0] - 10} ${vp[1] + 20} L${vp[0] + 10} ${vp[1] + 20} L1300 1920 L-220 1920 Z`} fill={C.asphalt} />
      {Array.from({ length: 14 }, (_, i) => {
        const p = ((i / 14 + t * 0.02) % 1) ** 2.2;
        const y = vp[1] + 20 + p * 1050, w = 4 + p * 26, h = 6 + p * 90;
        return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill="#c9a43a" opacity={0.55} />;
      })}
      {Array.from({ length: N }, (_, k) => {
        const p = ((k + 1) / N) ** 1.9;
        const off = t >= offAt(k);
        const flick = !off && t > offAt(k) - 0.25 && hn(Math.floor(t * 30), k) > 0.5;
        return [-1, 1].map((side) => {
          const x = vp[0] + side * (40 + 640 * p), y = vp[1] + 20 + 1050 * p, H = 40 + 520 * p;
          const lit = !off && !flick;
          return (
            <g key={`${k}${side}`}>
              {lit && <ellipse cx={x - side * 60 * p} cy={y + 10} rx={30 + 300 * p} ry={8 + 70 * p} fill={C.sodiumGlow} />}
              <rect x={x - 2 - 4 * p} y={y - H} width={4 + 8 * p} height={H} fill="#262b35" />
              <rect x={side > 0 ? x - 60 * p - 6 : x} y={y - H} width={6 + 60 * p} height={4 + 6 * p} fill="#262b35" />
              <circle cx={x - side * 56 * p} cy={y - H + 8 * p} r={4 + 14 * p} fill={lit ? "#ffd9a8" : "#1b1f27"} />
              {lit && <circle cx={x - side * 56 * p} cy={y - H + 8 * p} r={14 + 50 * p} fill="rgba(255,170,80,.22)" />}
            </g>
          );
        });
      })}
      <rect width={1080} height={1920} fill={`rgba(3,4,8,${0.15 + 0.45 * near})`} />
    </svg>
  );
};

const Phone: React.FC<{ t: number; mode: "lock" | "alert" }> = ({ t, mode }) => {
  const s3 = S(2), vib = W(2, "می‌لرزه"), sms = W(2, "پیامک");
  const shake = mode === "lock" && t >= vib - 0.1 ? Math.sin(t * 95) * 7 * (0.6 + 0.4 * Math.sin(t * 9)) : 0;
  const bannerA = mode === "lock" ? rk(t, sms - 0.1, sms + 0.25, back) : 1;
  const lines: [string, number, boolean?][] = [
    ["داخل بمانید.", W(3, "داخل")], ["همه‌ی چراغ‌ها را خاموش کنید.", W(3, "همه")], ["در را به روی هیچ‌کس باز نکنید.", W(3, "در")], ["نیروی امدادی: ۷ روز دیگر", W(3, "نیروی"), true],
  ];
  const x = 190, y = 280 + (mode === "lock" ? (1 - rk(t, s3 - 0.3, s3 + 0.3, out3)) * 400 : 0);
  return (
    <div style={{ position: "absolute", left: x + shake, top: y, width: 700, height: 1000, borderRadius: 90, background: "#0d0f14", boxShadow: "0 0 0 6px #2a2e36, 0 50px 120px rgba(0,0,0,.8)", overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT }}>
      <div style={{ position: "absolute", inset: 18, borderRadius: 74, overflow: "hidden", background: mode === "alert" ? "#2a0507" : "linear-gradient(180deg,#101a2e,#05070c)" }}>
        {mode === "lock" && (
          <>
            <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", color: "#e6ecf5", fontFamily: FONT_NUM, fontSize: 170, direction: "ltr" }}>۲:۴۸</div>
            <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", color: "#9aa6b8", fontSize: 30 }}>سه‌شنبه</div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 470, transform: `translateY(${(1 - bannerA) * -80}px) scale(${0.9 + 0.1 * bannerA})`, opacity: bannerA, background: "rgba(232,50,60,.92)", borderRadius: 36, padding: "26px 30px", color: "#fff" }}>
              <div style={{ fontSize: 26, opacity: 0.85 }}>⚠ پیامک اضطراری · همین الان</div>
              <div style={{ fontFamily: BLACK, fontSize: 40, marginTop: 6 }}>هشدار سطح قرمز برای محور شما</div>
            </div>
          </>
        )}
        {mode === "alert" && (
          <div style={{ position: "absolute", inset: 0, padding: "110px 46px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) }}>
              <div style={{ width: 70, height: 70, borderRadius: 18, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>⚠</div>
              <div><div style={{ fontFamily: BLACK, fontSize: 40 }}>هشدار اضطراری</div><div style={{ fontSize: 24, color: "#ffb0b4" }}>ستاد مدیریت بحران · خطر شدید</div></div>
            </div>
            <div style={{ borderTop: "2px solid rgba(255,255,255,.2)", margin: "34px 0" }} />
            {lines.map(([txt, at, hot], i) => {
              const a = rk(t, at - 0.08, at + 0.2, out3);
              return <div key={i} style={{ fontFamily: BLACK, fontSize: hot ? 56 : 50, lineHeight: 1.35, marginBottom: 26, color: hot ? "#ffd23f" : "#fff", opacity: a, transform: `translateX(${(1 - a) * -40}px)`, textShadow: hot ? "0 0 30px rgba(255,210,63,.5)" : "none" }}>{txt}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/** Under the counter: flashlight finds a note with someone else's rules. */
const Rules: React.FC<{ t: number }> = ({ t }) => {
  const s = S(4);
  const L: [string, number, boolean?][] = [["قانون اول: چراغ نه.", W(4, "اول")], ["قانون دوم: در قفل.", W(4, "دوم")], ["قانون سوم: اگه کسی", W(4, "سوم")], ["اسمت رو صدا زد…", W(4, "اسمت")], ["جواب نده.", W(4, "جواب"), true]];
  const bx = 540 + Math.sin(t * 0.9) * 90, by = 980 + Math.cos(t * 0.7) * 70;
  const paperIn = rk(t, s, s + 0.8, out3);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#0b0907" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={0} y={i * 170 + 40} width={1080} height={6} fill="#14100c" />)}
        <path d="M0 0 L1080 0 L1080 230 L0 300 Z" fill="#1a130d" />
      </svg>
      <div style={{ position: "absolute", left: 150, top: 300, width: 780, height: 960, transform: `rotate(${-3 + Math.sin(t * 1.3) * 0.4}deg) scale(${0.9 + 0.1 * paperIn})`, opacity: paperIn, background: C.paper, boxShadow: "0 30px 70px rgba(0,0,0,.7)", padding: "70px 60px", direction: "rtl" }}>
        {[[-30, 20, -12], [700, 10, 14]].map(([x, y, r], i) => <div key={i} style={{ position: "absolute", left: x, top: y, width: 140, height: 46, background: "rgba(230,220,180,.75)", transform: `rotate(${r}deg)` }} />)}
        {L.map(([txt, at, hot], i) => {
          const a = rk(t, at - 0.1, at + 0.35);
          return <div key={i} style={{ fontFamily: NASTA, fontSize: hot ? 82 : 62, lineHeight: 2.0, color: hot ? "#9e1118" : C.ink, clipPath: `inset(0 0 0 ${(1 - a) * 100}%)`, transform: hot ? `translate(${Math.sin(t * 40) * 2}px, 0)` : undefined }}>{txt}</div>;
        })}
        <div style={{ position: "absolute", right: 60, left: 260, top: 830, height: 8, background: "#9e1118", transform: `scaleX(${rk(t, W(4, "نده"), W(4, "نده") + 0.3)})`, transformOrigin: "100% 50%", borderRadius: 4 }} />
      </div>
      {/* flashlight: everything outside the beam stays dark */}
      <AbsoluteFill style={{ background: `radial-gradient(circle 420px at ${bx}px ${by}px, rgba(0,0,0,0) 0%, rgba(0,0,0,.2) 55%, rgba(0,0,0,.93) 100%)` }} />
    </AbsoluteFill>
  );
};

/** Shelves: good news (water + puffs). */
const Shelves: React.FC<{ t: number }> = ({ t }) => {
  const s = S(5), nW = Math.round(100 * rk(t, W(5, "صد") - 0.1, W(5, "صد") + 0.5, out3));
  const tube = hn(Math.floor(t * 10)) > 0.92 ? 0.55 : 1;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#0c1016" />
        <rect x={140} y={250} width={800} height={14} rx={7} fill={`rgba(220,240,255,${0.9 * tube})`} />
        <rect x={0} y={260} width={1080} height={900} fill={`rgba(200,230,255,${0.05 * tube})`} />
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(0 ${520 + r * 330})`}>
            <rect x={60} y={0} width={960} height={20} fill="#3a404c" />
            {r < 2
              ? Array.from({ length: 12 }, (_, i) => (
                  <g key={i} transform={`translate(${90 + i * 78} 0)`}>
                    <path d="M8 0 L8 -150 Q8 -175 22 -185 L22 -205 L38 -205 L38 -185 Q52 -175 52 -150 L52 0 Z" fill="rgba(140,200,255,.35)" stroke="rgba(190,230,255,.6)" strokeWidth={2} />
                    <rect x={8} y={-110} width={44} height={40} fill="#2f6bd0" opacity={0.8} />
                  </g>
                ))
              : Array.from({ length: 8 }, (_, i) => (
                  <g key={i} transform={`translate(${100 + i * 116} 0) rotate(${(i % 2 ? 3 : -3)})`}>
                    <path d="M0 0 L4 -170 Q50 -186 96 -170 L100 0 Z" fill="#f08a1c" />
                    <circle cx={50} cy={-80} r={26} fill="#ffd23f" />
                    <text x={50} y={-120} textAnchor="middle" fontFamily={BLACK} fontSize={26} fill="#fff">پفک</text>
                  </g>
                ))}
          </g>
        ))}
      </svg>
      <Chip x={540} y={330} a={rk(t, s - 0.05, s + 0.25, back)} bg="#1f8a4c">خبر خوب</Chip>
      <div style={{ position: "absolute", left: 640, top: 360, transform: `scale(${rk(t, W(5, "صد") - 0.1, W(5, "صد") + 0.2, back)})`, fontFamily: FONT_TEXT, direction: "rtl", background: "rgba(10,20,30,.85)", border: "3px solid #8cc8ff", borderRadius: 18, padding: "6px 22px", color: "#cfe8ff", fontSize: 34 }}>
        <span style={{ fontFamily: FONT_NUM, fontSize: 46 }}>{fa(nW)}</span> بطری آب
      </div>
    </AbsoluteFill>
  );
};

/** The glass wall: your reflection moves a beat late. */
const Reflection: React.FC<{ t: number }> = ({ t }) => {
  const s = S(6);
  const turnAt = W(6, "تکون") - 0.35;
  const me = rk(t, turnAt, turnAt + 0.3) - rk(t, turnAt + 1.2, turnAt + 1.5);
  const lag = 0.75;
  const ref = rk(t, turnAt + lag, turnAt + lag + 0.3); // reflection turns late… and stays turned
  const glassAt = W(6, "شیشه");
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#05070c" />
        <Stars t={t} n={40} h={900} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={60 + i * 330} y={180} width={300} height={1260} fill="rgba(127,163,199,.07)" stroke="#2a313d" strokeWidth={16} />
            <path d={`M${90 + i * 330} 240 L${200 + i * 330} 240 L${100 + i * 330} 600 Z`} fill="rgba(255,255,255,.04)" />
          </g>
        ))}
        {/* reflection */}
        <Figure x={540} y={900} s={1.25} fill="rgba(170,200,230,.16)" turn={ref * 1.0} eyes={ref * 0.9} />
        {/* you (foreground, back of head) */}
        <Figure x={540} y={1500} s={2.1} fill="#020305" turn={me} />
        <rect x={0} y={1640} width={1080} height={280} fill="#0f1218" />
      </svg>
      <Chip x={540} y={150} a={rk(t, s - 0.05, s + 0.25, back)} bg={C.red}>خبر بد</Chip>
      <Chip x={540} y={260} a={rk(t, glassAt, glassAt + 0.3, back) * (t < W(6, "توی") ? 1 : 0)} bg="rgba(20,30,45,.9)" color={C.ice} size={34}>همه‌ی دیوارها شیشه‌ای</Chip>
    </AbsoluteFill>
  );
};

/** Knocks / the officer / the drawer / the note / the radio / the face. */
const Glass: React.FC<{ t: number; who: number; knocks?: number[]; beam?: number; close?: number; face?: number }> = ({ t, who, knocks = [], beam = 0, close = 0, face = 0 }) => {
  const kk = knocks.map((k) => t - k).filter((d) => d >= 0 && d < 0.6);
  const shake = kk.length ? Math.sin(kk[0] * 80) * 12 * (1 - kk[0] / 0.6) : 0;
  const s = lerp(1.1, 2.0, close);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect width={1080} height={1920} fill="#04060a" />
        <rect x={40} y={140} width={1000} height={1420} fill="rgba(60,80,110,.10)" stroke="#262c37" strokeWidth={24} />
        {who > 0 && <Figure x={540} y={860 - close * 120} s={s} fill="#010203" cap eyes={face > 0 ? 0 : 0.0} op={who} />}
        {beam > 0 && (
          <g opacity={beam}>
            <circle cx={720} cy={1000} r={46} fill="#fffbe8" />
            <circle cx={720} cy={1000} r={140} fill="rgba(255,250,220,.25)" />
            <circle cx={720} cy={1000} r={340} fill="rgba(255,250,220,.08)" />
            <circle cx={460} cy={940} r={9} fill="#ffd23f" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
          </g>
        )}
        {kk.map((d, i) => <circle key={i} cx={560} cy={1060} r={30 + d * 400} fill="none" stroke="rgba(200,230,255,.6)" strokeWidth={6 * (1 - d / 0.6)} />)}
        {/* breath fog */}
        {who > 0 && <ellipse cx={540} cy={820 - close * 60} rx={150 + 30 * Math.sin(t * 1.7)} ry={70} fill={`rgba(200,220,240,${0.06 + 0.05 * Math.sin(t * 1.7)})`} />}
        <rect x={40} y={1500} width={1000} height={420} fill="#121519" />
        <rect x={40} y={1500} width={1000} height={18} fill="#2a2f39" />
      </svg>
      {face > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", opacity: face }}>
          <defs>
            <radialGradient id="v09face" cx="50%" cy="35%" r="70%"><stop offset="0" stopColor="#e4e0d2" /><stop offset="0.7" stopColor="#9c988c" /><stop offset="1" stopColor="#3a3833" /></radialGradient>
          </defs>
          <g transform={`translate(540 820) rotate(${-7 + Math.sin(t * 9) * 0.6}) scale(${1 + face * 0.1}, ${1.08 + face * 0.1})`}>
            <path d="M-250 -260 Q-300 0 -230 230 Q-120 420 0 430 Q120 420 230 230 Q300 0 250 -260 Q120 -400 0 -400 Q-120 -400 -250 -260 Z" fill="url(#v09face)" />
            <ellipse cx={-105} cy={-40} rx={70} ry={96} fill="#000" />
            <ellipse cx={118} cy={-30} rx={58} ry={110} fill="#000" />
            <circle cx={-100} cy={-30} r={5} fill="#fff" opacity={0.9} />
            <circle cx={120} cy={-14} r={4} fill="#fff" opacity={0.9} />
            <path d="M-230 170 Q-120 250 0 262 Q120 250 230 160 Q120 300 0 312 Q-120 300 -230 170 Z" fill="#050303" />
            {Array.from({ length: 15 }, (_, i) => { const x = -200 + i * 28.5; const y = 186 + Math.sin(((i + 0.5) / 15) * Math.PI) * 74; return <path key={i} d={`M${x} ${y} l12 0 l-6 ${22 + (i % 3) * 6} Z`} fill="#cfcabb" />; })}
            <path d="M-40 60 L0 120 L40 60" fill="none" stroke="#5a564c" strokeWidth={6} />
            <path d="M-250 -260 Q0 -470 250 -260 L270 -200 L-270 -200 Z" fill="#050608" />
            <rect x={-330} y={-230} width={660} height={34} rx={10} fill="#050608" />
          </g>
          <rect x={40} y={140} width={1000} height={1420} fill="rgba(120,0,0,.10)" />
          <rect x={40} y={140} width={1000} height={1420} fill="rgba(140,180,220,.08)" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

const Drawer: React.FC<{ t: number }> = ({ t }) => {
  const open = rk(t, W(10, "باز") - 0.1, W(10, "باز") + 0.5, out3);
  const glow = rk(t, W(10, "کاغذه") - 0.2, W(10, "کاغذه") + 0.4);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute" }}>
      <rect width={1080} height={1920} fill="#07090d" />
      <rect x={140} y={500} width={800} height={520} rx={30} fill="#2a2f39" />
      <rect x={200} y={560} width={420} height={140} rx={10} fill="#0d1a12" />
      <text x={580} y={650} textAnchor="end" fontFamily={FONT_NUM} fontSize={70} fill={C.radio} opacity={0.8 + 0.2 * Math.sin(t * 20)} style={{ direction: "ltr" }}>۰۰۰٬۰۰۰</text>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={680 + (i % 3) * 80} y={570 + Math.floor(i / 3) * 100} width={64} height={70} rx={10} fill="#3c4250" />)}
      <g transform={`translate(0 ${open * 380})`}>
        <rect x={160} y={980} width={760} height={240} rx={14} fill="#1c2027" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={200 + i * 175} y={1000} width={150} height={120} rx={6} fill="#121418" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={210 + i * 175} y={1030} width={130} height={80} fill={["#7aa66a", "#c9a46b", "#8a7ab5"][i]} opacity={0.6} />)}
        <g transform="translate(760 1060) rotate(-8)">
          <rect x={-70} y={-46} width={140} height={92} fill={C.paper} />
          <path d="M-70 0 L70 0" stroke="#c9b892" strokeWidth={3} />
          <rect x={-100} y={-80} width={200} height={160} fill={`rgba(255,240,200,${0.25 * glow})`} />
        </g>
        <rect x={160} y={1180} width={760} height={40} rx={10} fill="#3a404c" />
      </g>
      <rect x={100} y={1020} width={880} height={30} fill="#3a404c" />
    </svg>
  );
};

const Note: React.FC<{ t: number }> = ({ t }) => {
  const a1 = rk(t, W(11, "باز") - 0.1, W(11, "نکن") + 0.3);
  const a2 = rk(t, W(11, "دیشب") - 0.1, W(11, "کردم") + 0.3);
  const tremble = Math.sin(t * 31) * 2 + Math.sin(t * 17) * 1.5;
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,230,180,.18), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 120, top: 380, width: 840, height: 960, background: C.paper, transform: `rotate(${2 + tremble * 0.15}deg) translate(${tremble}px, 0)`, boxShadow: "0 40px 90px rgba(0,0,0,.8)", padding: "120px 70px", direction: "rtl" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 480, height: 3, background: "rgba(0,0,0,.12)" }} />
        <div style={{ fontFamily: NASTA, fontSize: 110, lineHeight: 2.1, color: C.ink, clipPath: `inset(0 0 0 ${(1 - a1) * 100}%)` }}>باز نکن.</div>
        <div style={{ fontFamily: NASTA, fontSize: 84, lineHeight: 2.1, color: "#7a0c12", clipPath: `inset(0 0 0 ${(1 - a2) * 100}%)` }}>دیشب منم باز کردم.</div>
        <div style={{ position: "absolute", left: 70, bottom: 60, fontFamily: NASTA, fontSize: 40, color: "rgba(27,23,18,.55)", opacity: a2 }}>— خودت</div>
        <div style={{ position: "absolute", left: 300, top: 120 + 480 * a2, width: 10, height: 10 + 120 * a2, background: "#7a0c12", borderRadius: 5, opacity: a2 > 0.5 ? 0.85 : 0 }} />
      </div>
    </AbsoluteFill>
  );
};

const Radio: React.FC<{ t: number }> = ({ t }) => {
  const on = t >= S(12) - 0.1;
  const talk = t >= S(13);
  const units = ["گشت ۱۱", "گشت ۲۴", "گشت ۳۷", "گشت ۴۲", "گشت ۵۸"];
  const uAt = (i: number) => lerp(S(13) + 0.2, E(13) - 1.5, i / (units.length - 1));
  return (
    <AbsoluteFill style={{ background: "#06080b" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <g transform="translate(540 980) rotate(-6)">
          <rect x={150} y={-470} width={22} height={260} rx={10} fill="#1b1e24" />
          <rect x={-190} y={-260} width={380} height={640} rx={60} fill="#22262e" />
          <rect x={-150} y={-210} width={300} height={130} rx={14} fill="#0b1a10" />
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-136 + i * 12} y={-145 - (talk ? 40 * hn(Math.floor(t * 20), i) : on ? 12 * hn(Math.floor(t * 30), i) : 2) / 2} width={7} height={(talk ? 40 * hn(Math.floor(t * 20), i) : on ? 12 * hn(Math.floor(t * 30), i) : 2) + 2} fill={C.radio} />)}
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => <circle key={`${r}${c}`} cx={-100 + c * 50} cy={10 + r * 50} r={12} fill="#14171c" />))}
          <circle cx={130} cy={-230} r={12} fill={on ? (Math.floor(t * 4) % 2 ? C.red : "#4a1214") : "#2a1214"} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 180, width: 840, direction: "rtl", fontFamily: FONT_TEXT }}>
        {units.map((u, i) => {
          const a = rk(t, uAt(i), uAt(i) + 0.25, out3);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 36, color: "#d6dde8", padding: "8px 24px", marginBottom: 10, background: "rgba(232,50,60,.12)", borderRight: `6px solid ${C.red}`, opacity: a, transform: `translateX(${(1 - a) * 60}px)` }}>
              <span>{u} · پلیس راه</span><span style={{ color: C.red, fontFamily: BLACK }}>بی‌پاسخ ✗</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Choice: React.FC<{ t: number }> = ({ t }) => {
  const q = rk(t, S(16) - 0.1, S(16) + 0.3, back);
  const n2 = rk(t, W(16, "شب") - 0.1, W(16, "شب") + 0.4, out3);
  const pulse = 1 + 0.04 * Math.sin(t * 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1a0607, #030304 70%)", direction: "rtl", fontFamily: BLACK, color: "#fff", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 380, width: "100%", fontSize: 96, transform: `scale(${q})`, lineHeight: 1.3 }}>در رو <span style={{ color: C.red }}>باز</span> می‌کنی؟</div>
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", gap: 50, transform: `scale(${q})` }}>
        <div style={{ background: "#1f8a4c", borderRadius: 26, padding: "18px 50px", fontSize: 52, transform: `scale(${pulse})` }}>🔓 باز کن</div>
        <div style={{ background: C.red, borderRadius: 26, padding: "18px 50px", fontSize: 52, transform: `scale(${2 - pulse})` }}>🔒 قفل کن</div>
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", opacity: n2, transform: `translateY(${(1 - n2) * 40}px)` }}>
        <div style={{ fontSize: 52, color: C.dim, fontFamily: FONT_TEXT }}>شب دوم… فردا</div>
        <div style={{ fontSize: 120, color: C.sodium, textShadow: `0 0 40px ${C.sodiumGlow}` }}>شب ۲ از ۷</div>
        <div style={{ fontSize: 42, color: "#cfd6e2", fontFamily: FONT_TEXT, marginTop: 10 }}>فالو کن که جا نمونی</div>
      </div>
    </AbsoluteFill>
  );
};

// ---- scene list ------------------------------------------------------------------
type Sc = { from: number; R: React.FC<{ t: number }> };
const SCENES: Sc[] = [
  { from: 0, R: ({ t }) => <Exterior t={t} push={0.1 * rk(t, 0, S(1))} /> },
  { from: S(1) - 0.2, R: ({ t }) => <Highway t={t} /> },
  { from: S(2) - 0.2, R: ({ t }) => <><AbsoluteFill style={{ background: "#05070c" }} /><Phone t={t} mode="lock" /></> },
  { from: S(3) - 0.15, R: ({ t }) => <><AbsoluteFill style={{ background: "#120203" }} /><Phone t={t} mode="alert" /></> },
  { from: S(4) - 0.2, R: Rules },
  { from: S(5) - 0.2, R: Shelves },
  { from: S(6) - 0.2, R: Reflection },
  { from: S(7) - 0.2, R: ({ t }) => <Exterior t={t} car={rk(t, S(7), W(7, "پارک") + 0.3, (k) => k)} carEyes={rk(t, W(7, "یازده"), W(7, "یازده") + 0.6)} push={0.05 + 0.15 * rk(t, S(7), E(7))} litShop={0.35} /> },
  { from: S(8) - 0.2, R: ({ t }) => <Glass t={t} who={0.35} knocks={[E(8) + 0.05, E(8) + 0.3, E(8) + 0.62]} /> },
  { from: S(9) - 0.1, R: ({ t }) => <Glass t={t} who={1} beam={rk(t, S(9) - 0.1, S(9) + 0.3)} knocks={[W(9, "باز") - 0.05]} close={0.15 * rk(t, S(9), E(9))} /> },
  { from: S(10) - 0.2, R: Drawer },
  { from: S(11) - 0.2, R: Note },
  { from: S(12) - 0.2, R: Radio },
  { from: S(14) - 0.2, R: ({ t }) => <Glass t={t} who={1} close={0.25 + 0.6 * rk(t, S(14), E(14))} /> },
  { from: S(15) - 0.02, R: ({ t }) => <Glass t={t} who={1} close={0.9} face={rk(t, S(15) - 0.02, S(15) + 0.06, (k) => k)} /> },
  { from: S(16) - 0.25, R: Choice },
];

// ---- overlay: HUD + captions ----------------------------------------------------------
const clockAt = (t: number): string => {
  if (t < S(4)) return `۲:${fa(47 + Math.floor(rk(t, 0, S(4), (k) => k) * 1.9))}`;
  if (t < S(7)) return `۲:${fa(49 + Math.floor(rk(t, S(4), S(7), (k) => k) * 3))}`;
  if (t < W(7, "یازده")) return "۳:۱۴";
  if (t < S(8)) return `۳:${fa(14 + Math.floor(rk(t, W(7, "یازده"), S(8), (k) => k) * 11))}`;
  return `۳:${fa(25 + Math.floor(rk(t, S(8), S(16), (k) => k) * 2))}`;
};
const Hud: React.FC<{ t: number }> = ({ t }) => {
  if (t >= S(16) - 0.25) return null;
  const help = t >= W(3, "هفت");
  return (
    <div style={{ position: "absolute", right: 60, top: 70, direction: "rtl", fontFamily: FONT_TEXT, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>
      <div style={{ fontSize: 30, color: C.red }}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: C.red, marginLeft: 10, opacity: 0.4 + 0.6 * (Math.floor(t * 2) % 2) }} />شب ۱ از ۷</div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 84, color: "#fff", direction: "ltr", textAlign: "right", lineHeight: 1.1 }}>{clockAt(t)}<span style={{ fontSize: 34, color: C.dim }}> بامداد</span></div>
      {help && <div style={{ fontSize: 26, color: "#ffd23f" }}>کمک: ۷ روز دیگه</div>}
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
  const voice = cur.v;
  const color = voice === "bill" ? C.ice : voice === "george" ? C.radio : "#ffffff";
  const quote = voice !== "brian";
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

/** Grain + vignette + rare flicker over everything. */
const Film: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={360} height={640} viewBox="0 0 360 640" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: "overlay", opacity: 0.35, imageRendering: "pixelated" }}>
      <filter id="v09g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={f % 12} /></filter>
      <rect width={360} height={640} filter="url(#v09g)" />
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,.75) 100%)" }} />
    {hn(f, 9) > 0.985 && <AbsoluteFill style={{ background: "rgba(0,0,0,.35)" }} />}
  </>
);

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = SCENES.findLastIndex((s) => s.from <= t);
  const sc = SCENES[Math.max(0, i)];
  const since = t - sc.from;
  const cut = i > 0 && since < 0.12 ? 1 - since / 0.12 : 0; // quick dip from black on every cut
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

export const V09_LOOK = [0.3, 5.0, 9.0, 12.5, 16.5, 22.0, 26.5, 33.0, 41.5, 44.0, 51.0, 55.5, 60.0, 65.5, 68.2, 69.0, 72.0, 78.0, 83.0, 86.0, 90.0, 95.0, 98.3, 99.2, 102.5, 105.5];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V09_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V09: React.FC = () => (
  <>
    <Composition id="V09" component={Video} durationInFrames={V09_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v09/mix.wav" }} />
    <Composition id="V09-Silent" component={Video} durationInFrames={V09_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V09-Look" component={Look} durationInFrames={V09_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
