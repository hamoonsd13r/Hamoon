// V46 · «پابلو اسکوبار؛ از تولد تا سقوط» — horizontal documentary 16:9 for YouTube (~4:08; the user switched from 9:16), Scene Zero: Avianca 203 (1989) first,
// then 1949 → 1993 step by step. User's own narration (ElevenLabs "Mark"; pauses shortened + tempo 1.10: tools/v46-voice.mjs).
// Picture: ~80 shots, a new one every ~3 s, rotating between real photos (Wikimedia Commons, credited on screen), archive
// film (DEA records, US National Archives), symbolic stock (Coverr/Mixkit, tagged «تصویر نمادین») and code graphics
// (chapter years, maps from Natural Earth, the cartel board, the phone trace, the 1993 calendar).
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FootageTime, Media, type FootageClip, type Grade } from "../footage/footage";
import { prog, lerp, easeOut, easeInOut, backOut, fa, hash, timing, type VO } from "../v42/kit";
import voJson from "./vo.json";
import footJson from "./footage.json";
import photoJson from "./photos.json";
import mapJson from "./map.json";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const FPS = 30, W = 1920, H = 1080;
export const TOTAL = V.total + 2.4;
const FRAMES = Math.round(TOTAL * FPS);
const INK = "#07080A", BONE = "#F1ECE2", MUTED = "#A39C90", RED = "#E5322B", GOLD = "#E2B04A";
const CLIPS: Record<string, FootageClip & { page?: string }> = { ...(footJson as any).clips, ...(photoJson as any).clips };
const MAP = mapJson as unknown as { countries: { name: string; d: string }[]; cities: Record<string, [number, number]> };

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v46 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["E46Black", "fonts/Vazirmatn-Black.ttf"], ["E46Bold", "fonts/Vazirmatn-Bold.ttf"], ["E46Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["E46Num", "fonts/Lalezar-Regular.ttf"], ["E46Bebas", "fonts/BebasNeue-Regular.ttf"], ["E46Oswald", "fonts/Oswald.ttf"], ["E46Mono", "fonts/ChakraPetch-SemiBold.ttf"],
    ["E46Serif", "fonts/LibreBaskerville.ttf"]].map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── shots: the picture track. `at` is when the cut lands (a hair before the word). */
type Kind = "photo" | "archive" | "stock" | "graphic";
type Sh = { n: string; at: number; fit?: "cover" | "contain" | "print"; focus?: [number, number]; pan?: [number, number]; zoom?: number; push?: number; from?: number; rate?: number; grade?: Grade; g?: string; label?: string; cap?: string };
const c = (x: number) => x - 0.06;
const SHOTS: Sh[] = [
  { n: "s01a", at: 0, focus: [0.55, 0.5], push: 0.06 },
  { n: "s01b", at: c(wd(1, "27")), focus: [0.5, 0.5] },
  { n: "s02a", at: c(S(2)), focus: [0.6, 0.5], push: 0.1 },
  { n: "s02b", at: c(wd(2, "منفجر")), zoom: 1.1, push: 0.15 },
  { n: "s03", at: c(S(3)), focus: [0.5, 0.5] },
  { n: "s04a", at: c(S(4)), grade: "film", zoom: 1.05 },
  { n: "s04b", at: c(wd(4, "یکی")), focus: [0.72, 0.5] },
  { n: "mugface", at: c(S(5)), fit: "cover", focus: [0.5, 0.42], zoom: 1.0, push: 0.12 },
  { n: "heli1", at: c(wd(6, "چطور")), focus: [0.45, 0.5], pan: [0.06, 0] },
  { n: "heli2", at: c(wd(6, "دولت")), focus: [0.45, 0.45] },
  { n: "MAP_BIRTH", at: c(S(7)), g: "map" },
  { n: "rionegro", at: c(wd(7, "پابلو")), focus: [0.5, 0.55], pan: [-0.08, 0] },
  { n: "s08", at: c(S(8)), focus: [0.5, 0.5] },
  { n: "envigado", at: c(S(9)), focus: [0.5, 0.5], pan: [0.1, 0] },
  { n: "prado1940", at: c(S(10)), fit: "print", label: "مدلین · ۱۹۴۰" },
  { n: "cisneros", at: c(wd(10, "قراره")), focus: [0.5, 0.5], pan: [0.12, 0], label: "مدلین · ۱۹۳۲" },
  { n: "s11", at: c(S(11)), focus: [0.5, 0.5] },
  { n: "s12a", at: c(S(12)), focus: [0.5, 0.5] },
  { n: "s12b", at: c(wd(12, "معامله‌های")), focus: [0.5, 0.5] },
  { n: "s13", at: c(S(13)), grade: "film", zoom: 1.05 },
  { n: "s14a", at: c(S(14)), focus: [0.42, 0.55] },
  { n: "MAP_ROUTE", at: c(wd(14, "آمریکا")), g: "map" },
  { n: "mugfull", at: c(S(15)), fit: "print", label: "عکس بازداشت · ۱۹۷۶" },
  { n: "s16", at: c(S(16)), grade: "film", zoom: 1.08 },
  { n: "BOARD", at: c(S(17)), g: "board" },
  { n: "s18a", at: c(S(18)), focus: [0.5, 0.5] },
  { n: "gate", at: c(wd(18, "رسید")), focus: [0.5, 0.45], label: "ورودی هاسیندا ناپولس" },
  { n: "RICH", at: c(wd(18, "فهرست")), g: "rich" },
  { n: "hippo", at: c(S(19)), focus: [0.55, 0.5], label: "اسب‌آبی‌های باغ‌وحش خصوصی‌اش" },
  { n: "capnight", at: c(wd(19, "قدرت")), focus: [0.5, 0.5], pan: [0.1, 0] },
  { n: "caprain", at: c(S(20)), focus: [0.5, 0.5], pan: [-0.1, 0], label: "کنگره‌ی کلمبیا، بوگوتا" },
  { n: "parliament", at: c(wd(20, "نماینده")), focus: [0.45, 0.5], pan: [0.08, 0] },
  { n: "barrio", at: c(S(21)), focus: [0.62, 0.5], pan: [-0.1, 0], label: "محله‌ی «پابلو اسکوبار»، مدلین" },
  { n: "s21b", at: c(wd(21, "تلاش")), focus: [0.5, 0.6] },
  { n: "s22a", at: c(S(22)), focus: [0.45, 0.5] },
  { n: "cars", at: c(wd(22, "خشونت")), focus: [0.5, 0.5], pan: [0.1, 0], label: "ماشین‌های سوخته در ملک ناپولس" },
  { n: "lara", at: c(S(23)), fit: "print", label: "رودریگو لارا بونیا" },
  { n: "NEWS84", at: c(wd(23, "وزیر")), g: "news" },
  { n: "laragalan", at: c(S(24)), fit: "print", label: "لارا بونیا (وسط) و لوئیس کارلوس گالان (چپ)" },
  { n: "mac10", at: c(S(25)), focus: [0.45, 0.4], label: "مسلسلی که با آن وزیر ترور شد" },
  { n: "s25a", at: c(wd(25, "جنگ")), grade: "film", zoom: 1.06 },
  { n: "s25b", at: c(wd(25, "مرحله")), focus: [0.35, 0.5] },
  { n: "s26a", at: c(S(26)), focus: [0.5, 0.55], push: 0.1 },
  { n: "s26b", at: c(wd(26, "یکی")), focus: [0.5, 0.5] },
  { n: "galan79", at: c(S(27)), fit: "print", label: "گالان پشت تریبون · ۱۹۷۹" },
  { n: "galanstatue", at: c(wd(27, "نامزد")), focus: [0.5, 0.35], label: "مجسمه‌ی گالان، بوگوتا" },
  { n: "s28", at: c(S(28)), focus: [0.5, 0.5], push: 0.08 },
  { n: "s29a", at: c(S(29)), focus: [0.5, 0.5] },
  { n: "s29b", at: c(wd(29, "یک")), zoom: 1.1, push: 0.12 },
  { n: "s29c", at: c(wd(29, "سازمان")), focus: [0.5, 0.5] },
  { n: "s30a", at: c(S(30)), focus: [0.5, 0.5], push: 0.08 },
  { n: "s30b", at: c(wd(30, "بمب‌گذاری")), focus: [0.5, 0.5] },
  { n: "mansion", at: c(S(31)), fit: "print", label: "خانه‌ی ویران هاسیندا ناپولس" },
  { n: "s32a", at: c(S(32)), focus: [0.5, 0.5] },
  { n: "s32b", at: c(wd(32, "ولی")), focus: [0.5, 0.5] },
  { n: "catedral", at: c(S(33)), focus: [0.5, 0.5], pan: [0.12, 0], label: "لا کاتدرال، بالای انویگادو" },
  { n: "kalesi", at: c(S(34)), focus: [0.5, 0.5], pan: [-0.1, 0], label: "ویرانه‌ی زندان لا کاتدرال" },
  { n: "guard", at: c(wd(34, "زندان")), focus: [0.4, 0.5], pan: [0.1, 0], label: "برجک نگهبانی لا کاتدرال" },
  { n: "helipad", at: c(S(35)), focus: [0.5, 0.5], pan: [0.12, 0], label: "هلی‌پد زندان، رو به مدلین" },
  { n: "s35b", at: c(wd(35, "فعالیت‌های")), focus: [0.4, 0.5] },
  { n: "narino", at: c(S(36)), focus: [0.5, 0.5], pan: [0.1, 0], label: "کاخ ریاست‌جمهوری کلمبیا" },
  { n: "s37a", at: c(S(37)), focus: [0.5, 0.5], push: 0.1 },
  { n: "s37b", at: c(wd(37, "بزرگ‌ترین")), focus: [0.5, 0.5] },
  { n: "CAL92", at: c(S(38)), g: "months" },
  { n: "PEOPLE", at: c(S(39)), g: "people" },
  { n: "s40", at: c(S(40)), focus: [0.5, 0.5] },
  { n: "heli3", at: c(S(41)), focus: [0.5, 0.45], pan: [0.1, 0] },
  { n: "s42", at: c(S(42)), focus: [0.35, 0.5] },
  { n: "CAL93", at: c(S(43)), g: "cal93" },
  { n: "s43b", at: c(wd(43, "تولد")), focus: [0.5, 0.5], push: 0.08 },
  { n: "casa", at: c(S(44)), fit: "print", label: "خانه‌ای در مدلین" },
  { n: "s44b", at: c(wd(44, "پسرش")), focus: [0.5, 0.45] },
  { n: "TRACE", at: c(S(45)), g: "trace" },
  { n: "s46a", at: c(S(46)), focus: [0.5, 0.5] },
  { n: "RADAR", at: c(wd(46, "محل")), g: "radar" },
  { n: "police", at: c(S(47)), focus: [0.5, 0.5], pan: [0.1, 0], label: "پلیس ملی کلمبیا" },
  { n: "s48", at: c(S(48)), focus: [0.5, 0.5] },
  { n: "tejado", at: c(S(49)), focus: [0.5, 0.45], push: 0.1, label: "پشت‌بام، مدلین · ۲ دسامبر ۱۹۹۳" },
  { n: "death", at: c(wd(49, "پابلو")), focus: [0.5, 0.4], push: 0.08, label: "پلیس روی پشت‌بام · ۲ دسامبر ۱۹۹۳" },
  { n: "ACCOUNTS", at: c(S(50)), g: "accounts" },
  { n: "tomb", at: c(S(51)), focus: [0.5, 0.5], push: 0.1, label: "آرامگاه اسکوبار، ایتاگوئی" },
  { n: "s52a", at: c(S(52)), grade: "film", zoom: 1.06 },
  { n: "s52b", at: c(wd(52, "خشونت")), focus: [0.5, 0.5] },
  { n: "ftomb", at: c(wd(52, "44")), focus: [0.5, 0.5], pan: [0.1, 0] },
  { n: "s53a", at: c(S(53)), focus: [0.5, 0.5], push: 0.08 },
  { n: "s53b", at: c(wd(53, "زخم‌هایی")), focus: [0.5, 0.5], push: 0.06 },
];
SHOTS.forEach((s, i) => { if (i && s.at <= SHOTS[i - 1].at) throw new Error("v46 shots out of order at " + s.n); });
const shotIndex = (t: number) => { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].at) i++; return i; };
const kindOf = (s: Sh): Kind => {
  if (s.g) return "graphic";
  const cl = CLIPS[s.n];
  if (!cl) return "stock";
  if (cl.source === "archive") return "archive";
  if (cl.source === "commons" && cl.kind === "image") return "photo";
  if (cl.source === "commons") return "archive";
  return "stock";
};

/* ───────── chapters: the year in the top timeline + a full-screen year card */
const CH = [
  { at: 0, y: 1989, card: false, title: "" },
  { at: c(S(7)), y: 1949, card: true, title: "تولد" },
  { at: c(S(11)), y: 1965, card: true, title: "دهه‌ی ۱۹۶۰", label: "دهه‌ی ۶۰" },
  { at: c(S(13)), y: 1972, card: true, title: "دهه‌ی ۱۹۷۰", label: "دهه‌ی ۷۰" },
  { at: c(S(15)), y: 1976, card: true, title: "بازداشت" },
  { at: c(S(20)), y: 1982, card: true, title: "کنگره" },
  { at: c(S(23)), y: 1984, card: true, title: "جنگ با دولت" },
  { at: c(S(26)), y: 1989, card: true, title: "خونین‌ترین سال" },
  { at: c(S(32)), y: 1991, card: true, title: "تسلیم" },
  { at: c(S(37)), y: 1992, card: true, title: "فرار" },
  { at: c(S(43)), y: 1993, card: true, title: "سقوط" },
];
const chAt = (t: number) => [...CH].reverse().find((x) => t >= x.at) ?? CH[0];

/* ───────── small pieces */
const shadow = "0 6px 30px rgba(0,0,0,0.85)";
const Chip: React.FC<{ t: number; t0: number; t1?: number; top: number; children: React.ReactNode; color?: string; size?: number; right?: number; solid?: boolean }> = ({ t, t0, t1 = 999, top, children, color = BONE, size = 44, right = 60, solid }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const u = backOut(prog(t, t0, t0 + 0.35)), o = 1 - prog(t, t1, t1 + 0.25);
  return (
    <div style={{ position: "absolute", top, right, direction: "rtl", transform: `translateX(${(1 - u) * -60}px)`, opacity: Math.min(1, u * 1.4) * o, padding: "10px 24px", borderRadius: 10, background: solid ? color : "rgba(7,8,10,0.78)", borderRight: `8px solid ${solid ? "#000" : color}`, fontFamily: "E46Black", fontSize: size, color: solid ? INK : color, whiteSpace: "nowrap" }}>{children}</div>
  );
};
const Stamp: React.FC<{ t: number; t0: number; text: string; top: number; rot?: number; size?: number; color?: string }> = ({ t, t0, text, top, rot = -8, size = 120, color = RED }) => {
  if (t < t0 || t > t0 + 2.2) return null;
  const u = prog(t, t0, t0 + 0.18), s = lerp(2.2, 1, easeOut(u)), o = 1 - prog(t, t0 + 1.8, t0 + 2.2);
  return (
    <div style={{ position: "absolute", top, left: 0, width: W, display: "flex", justifyContent: "center", opacity: u * o }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${s})`, border: `10px solid ${color}`, borderRadius: 18, padding: "4px 44px 14px", fontFamily: "E46Black", fontSize: size, color, direction: "rtl", textShadow: "0 0 30px rgba(0,0,0,0.5)", background: "rgba(7,8,10,0.35)", mixBlendMode: "normal" }}>{text}</div>
    </div>
  );
};

/* a blurred, darkened copy of a picture filling the frame (blurred small, then scaled up: much cheaper to render) */
const Soft: React.FC<{ src: string; k: number; gray?: boolean }> = ({ src, k, gray }) => (
  <div style={{ position: "absolute", left: -40, top: -40, width: (W + 80) / 8, height: (H + 80) / 8, transform: "scale(8)", transformOrigin: "0 0", overflow: "hidden" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `blur(4px) brightness(${k}) saturate(${gray ? 0 : 0.6})` }} />
  </div>
);

/* a photo printed on paper, lying on a dark desk, drifting (portraits, small or old pictures) */
const Print: React.FC<{ n: string; t: number; t0: number; t1: number; label?: string }> = ({ n, t, t0, t1, label }) => {
  const cl = CLIPS[n];
  if (!cl) return null;
  const u = prog(t, t0, t1), k = easeOut(prog(t, t0, t0 + 0.45));
  const ar = cl.w / cl.h, maxW = 1300, maxH = 700;
  let pw = maxW, ph = pw / ar;
  if (ph > maxH) { ph = maxH; pw = ph * ar; }
  const rot = (hash(t0) - 0.5) * 5 + u * 1.2;
  return (
    <AbsoluteFill>
      <Soft src={cl.file} k={0.32} />
      <div style={{ position: "absolute", left: (W - pw) / 2 - 22, top: 120 + (maxH - ph) / 2 - 22, width: pw + 44, height: ph + 44 + (label ? 0 : 0), background: "#EDE6D8", boxShadow: "0 40px 90px rgba(0,0,0,0.75)", transform: `translateY(${(1 - k) * 80}px) rotate(${rot}deg) scale(${1.02 + 0.05 * u})`, opacity: k }}>
        <Img src={staticFile(cl.file)} style={{ position: "absolute", left: 22, top: 22, width: pw, height: ph, objectFit: "cover", filter: "contrast(1.05) sepia(0.12)" }} />
        <div style={{ position: "absolute", inset: 22, boxShadow: "inset 0 0 60px rgba(60,40,10,0.35)" }} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────── graphics shots */
const MapView: React.FC<{ cx: number; cy: number; span: number; children?: React.ReactNode; hl?: string }> = ({ cx, cy, span, children, hl = "Colombia" }) => {
  const h = span * (H / W);
  return (
    <svg width={W} height={H} viewBox={`${cx - span / 2} ${cy - h / 2} ${span} ${h}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="grid46" width={span / 18} height={span / 18} patternUnits="userSpaceOnUse"><path d={`M ${span / 18} 0 L 0 0 0 ${span / 18}`} fill="none" stroke="rgba(241,236,226,0.05)" strokeWidth={span / 1400} /></pattern>
      </defs>
      <rect x={cx - span} y={cy - h} width={span * 2} height={h * 2} fill="#0B0D10" />
      <rect x={cx - span} y={cy - h} width={span * 2} height={h * 2} fill="url(#grid46)" />
      {MAP.countries.map((k) => (
        <path key={k.name} d={k.d} fill={k.name === hl ? "rgba(229,50,43,0.20)" : "rgba(241,236,226,0.07)"} stroke={k.name === hl ? RED : "rgba(241,236,226,0.35)"} strokeWidth={(k.name === hl ? 2.4 : 1) * span / 1920} />
      ))}
      {children}
    </svg>
  );
};
const MapBirth: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const u = easeInOut(prog(t, t0, t1));
  const [mx, my] = MAP.cities.Rionegro;
  const cx = lerp(-1300, mx, u), cy = lerp(-80, my, u), span = lerp(640, 60, u);
  const k = span / 1920, p = prog(t, t0 + 0.9, t0 + 1.3);
  return (
    <AbsoluteFill>
      <MapView cx={cx} cy={cy} span={span}>
        {[MAP.cities.Bogota, MAP.cities.Medellin].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5 * k} fill={BONE} opacity={0.7} />)}
        <text x={MAP.cities.Bogota[0] + 10 * k} y={MAP.cities.Bogota[1] + 6 * k} fontSize={30 * k} fill={MUTED} fontFamily="E46Bold">بوگوتا</text>
        <circle cx={mx} cy={my} r={(14 + 40 * (1 - p)) * k} fill="none" stroke={RED} strokeWidth={4 * k} opacity={p} />
        <circle cx={mx} cy={my} r={9 * k} fill={RED} opacity={p} />
        <text x={mx + 22 * k} y={my - 18 * k} fontSize={46 * k} fill={BONE} fontFamily="E46Black" opacity={p} textAnchor="start">ریونگرو</text>
      </MapView>
      <Chip t={t} t0={t0 + 0.2} top={190} color={RED}>کلمبیا</Chip>
    </AbsoluteFill>
  );
};
const MapRoute: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const u = easeInOut(prog(t, t0, t1));
  const a = MAP.cities.Medellin, b = MAP.cities.Miami;
  const cx = lerp(-1345, -1360, u), cy = lerp(-270, -290, u), span = lerp(860, 900, u);
  const k = span / 1920;
  const ctrl: [number, number] = [-1420, -330];
  const d = `M ${a[0]} ${a[1]} Q ${ctrl[0]} ${ctrl[1]} ${b[0]} ${b[1]}`;
  const draw = prog(t, t0 + 0.15, t0 + 1.4);
  const dots = Array.from({ length: 7 }, (_, i) => (i / 7 + (t - t0) * 0.5) % 1);
  return (
    <AbsoluteFill>
      <MapView cx={cx} cy={cy} span={span} hl="Colombia">
        <path d={d} fill="none" stroke={RED} strokeWidth={6 * k} strokeDasharray={`${900 * draw} 2000`} strokeLinecap="round" />
        {draw > 0.98 && dots.map((q, i) => { const x = (1 - q) * (1 - q) * a[0] + 2 * (1 - q) * q * ctrl[0] + q * q * b[0], y = (1 - q) * (1 - q) * a[1] + 2 * (1 - q) * q * ctrl[1] + q * q * b[1]; return <rect key={i} x={x - 6 * k} y={y - 6 * k} width={12 * k} height={12 * k} fill={BONE} />; })}
        <circle cx={a[0]} cy={a[1]} r={10 * k} fill={RED} />
        <circle cx={b[0]} cy={b[1]} r={10 * k * (0.5 + 0.5 * draw)} fill={BONE} />
        <text x={a[0] + 18 * k} y={a[1] + 12 * k} fontSize={40 * k} fill={BONE} fontFamily="E46Black">مدلین</text>
        <text x={b[0] + 18 * k} y={b[1] + 12 * k} fontSize={40 * k} fill={BONE} fontFamily="E46Black" opacity={draw}>میامی، آمریکا</text>
      </MapView>
      <Chip t={t} t0={t0 + 0.3} top={190} color={RED}>مسیر کوکائین به آمریکا</Chip>
    </AbsoluteFill>
  );
};
const Board: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const P = [
    { n: "mugface", name: "پابلو اسکوبار", x: 1600, y: 470, r: -3 },
    { n: "lehder", name: "کارلوس لدر", x: 1170, y: 440, r: 4 },
    { n: "gacha", name: "رودریگس گاچا", x: 750, y: 480, r: 3 },
    { n: "ochoa", name: "فابیو اچوآ", x: 320, y: 450, r: -4 },
  ];
  const lines: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 2], [1, 3]];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #2a2219 0%, #0c0a08 75%)" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {lines.map(([i, j], q) => { const p = prog(t, t0 + 0.9 + q * 0.18, t0 + 1.3 + q * 0.18); const A = P[i], B = P[j]; return <line key={q} x1={A.x} y1={A.y} x2={lerp(A.x, B.x, p)} y2={lerp(A.y, B.y, p)} stroke={RED} strokeWidth={5} opacity={0.9} />; })}
      </svg>
      {P.map((p, i) => {
        const cl = CLIPS[p.n]; const k = backOut(prog(t, t0 + i * 0.16, t0 + 0.4 + i * 0.16));
        return (
          <div key={p.n} style={{ position: "absolute", left: p.x - 190, top: p.y - 220, width: 380, transform: `rotate(${p.r}deg) scale(${k})`, background: "#EDE6D8", padding: "16px 16px 70px", boxShadow: "0 30px 60px rgba(0,0,0,0.7)" }}>
            {cl && <Img src={staticFile(cl.file)} style={{ width: 348, height: 380, objectFit: "cover", objectPosition: "50% 25%", filter: "grayscale(1) contrast(1.1)" }} />}
            <div style={{ position: "absolute", bottom: 14, width: 348, textAlign: "center", fontFamily: "E46Black", fontSize: 38, color: INK, direction: "rtl" }}>{p.name}</div>
            <div style={{ position: "absolute", top: -14, left: 170, width: 28, height: 28, borderRadius: 14, background: RED, boxShadow: "0 4px 8px rgba(0,0,0,0.6)" }} />
          </div>
        );
      })}
      <Stamp t={t} t0={wd(17, "کارتل") - 0.05} text="کارتل مدلین" top={800} rot={-6} size={104} />
    </AbsoluteFill>
  );
};
const Rich: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const rows = ["سلطان برونئی", "خانواده‌ی سلطنتی سعودی", "پابلو اسکوبار · کلمبیا", "ساموئل والتون · آمریکا", "خانواده‌ی مارس · آمریکا"];
  const sc = lerp(0, -40, easeInOut(prog(t, t0, t1)));
  return (
    <AbsoluteFill>
      <Media clip={CLIPS.s18c} t0={t0} len={t1 - t0} w={W} h={H} focus={[0.5, 0.5]} grade="clean" />
      <AbsoluteFill style={{ background: "rgba(7,8,10,0.55)" }} />
      <div style={{ position: "absolute", left: 510, top: 70, width: 900, background: "#F3EEE4", boxShadow: "0 40px 90px rgba(0,0,0,0.7)", transform: `rotate(-2deg) translateY(${sc}px)`, padding: "40px 46px", direction: "rtl" }}>
        <div style={{ fontFamily: "E46Black", fontSize: 52, color: INK }}>ثروتمندترین آدم‌های جهان</div>
        <div style={{ fontFamily: "E46Bold", fontSize: 28, color: "#6b6357", marginTop: 4 }}>فهرست سالانه‌ی مجله‌های اقتصادی · اواخر دهه‌ی ۱۹۸۰</div>
        <div style={{ height: 4, background: INK, margin: "22px 0 10px" }} />
        {rows.map((r, i) => {
          const me = i === 2, k = prog(t, t0 + 0.3 + i * 0.12, t0 + 0.6 + i * 0.12);
          return (
            <div key={i} style={{ position: "relative", display: "flex", gap: 24, alignItems: "center", padding: "10px 0", borderBottom: "2px solid rgba(0,0,0,0.15)", opacity: k, fontFamily: me ? "E46Black" : "E46Bold", fontSize: me ? 48 : 40, color: me ? RED : "#2b2722" }}>
              <span style={{ fontFamily: "E46Num", width: 50, color: "#6b6357" }}>{fa(i + 1)}</span>{r}
              {me && <div style={{ position: "absolute", right: -18, left: -18, top: 6, bottom: 6, border: `5px solid ${RED}`, borderRadius: 60, transform: `scaleX(${easeOut(prog(t, t0 + 1.2, t0 + 1.6))})`, transformOrigin: "right" }} />}
            </div>
          );
        })}
        <div style={{ fontFamily: "E46Reg", fontSize: 24, color: "#6b6357", marginTop: 16 }}>ترتیب ردیف‌ها نمادین است</div>
      </div>
    </AbsoluteFill>
  );
};
const News: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const k = easeOut(prog(t, t0, t0 + 0.4)), z = 1.04 + 0.05 * prog(t, t0, t0 + 4);
  return (
    <AbsoluteFill style={{ background: "#16130f" }}>
      <div style={{ position: "absolute", left: 460, top: 50, width: 1000, height: 780, background: "#EAE3D3", transform: `rotate(1.5deg) scale(${z}) translateY(${(1 - k) * 120}px)`, boxShadow: "0 40px 100px rgba(0,0,0,0.8)", padding: "34px 44px", direction: "rtl", overflow: "hidden" }}>
        <div style={{ fontFamily: "E46Black", fontSize: 70, color: INK, textAlign: "center", borderBottom: "6px double #1a1712", paddingBottom: 6 }}>خبر فوری</div>
        <div style={{ fontFamily: "E46Bold", fontSize: 26, color: "#4d463b", textAlign: "center", padding: "8px 0", borderBottom: "2px solid #1a1712" }}>بوگوتا · {fa(30)} آوریل {fa(1984)}</div>
        <div style={{ fontFamily: "E46Black", fontSize: 92, lineHeight: 1.15, color: INK, marginTop: 18 }}>ترور وزیر<br /><span style={{ color: RED }}>دادگستری</span> کلمبیا</div>
        <div style={{ display: "flex", gap: 26, marginTop: 26 }}>
          {CLIPS.lara && <Img src={staticFile(CLIPS.lara.file)} style={{ width: 260, height: 300, objectFit: "cover", objectPosition: "50% 20%", filter: "grayscale(1) contrast(1.2)" }} />}
          <div style={{ flex: 1 }}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ height: 14, margin: "14px 0", background: "rgba(26,23,18,0.32)", width: `${70 + 30 * hash(i + 3)}%` }} />)}
          </div>
        </div>
      </div>
      <Chip t={t} t0={t0 + 0.5} top={190} color={GOLD} size={30}>بازسازی گرافیکی</Chip>
    </AbsoluteFill>
  );
};
const Months: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  const M = ["ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر", "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر"];
  const u = prog(t, t0, t1 + 0.2), i = Math.min(M.length - 1, Math.floor(u * M.length)), f = (u * M.length) % 1;
  const y = i < 6 ? 1992 : 1993;
  return (
    <AbsoluteFill>
      <Media clip={CLIPS.s37a} t0={t0} len={t1 - t0} w={W} h={H} focus={[0.5, 0.5]} from={4} grade="cool" />
      <AbsoluteFill style={{ background: "rgba(7,8,10,0.6)" }} />
      <div style={{ position: "absolute", left: 710, top: 150, width: 500, height: 560, background: BONE, borderRadius: 16, boxShadow: "0 40px 90px rgba(0,0,0,0.7)", overflow: "hidden", direction: "rtl" }}>
        <div style={{ height: 130, background: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "E46Oswald", fontSize: 90, color: BONE }}>{y}</div>
        <div style={{ position: "absolute", top: 130, width: 500, height: 430, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "E46Black", fontSize: 110, color: INK, transform: `rotateX(${f < 0.25 ? (1 - f / 0.25) * 70 : 0}deg)` }}>{M[i]}</div>
      </div>
    </AbsoluteFill>
  );
};
const People: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const P = [{ n: "popeye", name: "جان جایرو ولاسکز", sub: "از نزدیک‌ترین آدم‌هایش · تسلیم شد", x: 1030 }, { n: "roberto", name: "روبرتو اسکوبار", sub: "برادرش · تسلیم شد", x: 430 }];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1d1a16 0%, #08080a 75%)" }}>
      {P.map((p, i) => {
        const cl = CLIPS[p.n], k = easeOut(prog(t, t0 + i * 0.35, t0 + 0.4 + i * 0.35)), x = prog(t, t0 + 0.6 + i * 0.5, t0 + 0.8 + i * 0.5);
        return (
          <div key={p.n} style={{ position: "absolute", left: p.x, top: 90, width: 460, opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
            {cl && <Img src={staticFile(cl.file)} style={{ width: 460, height: 560, objectFit: "cover", objectPosition: "50% 22%", filter: `grayscale(${0.5 + 0.5 * x}) contrast(1.1) brightness(${1 - 0.35 * x})` }} />}
            <svg width={460} height={560} style={{ position: "absolute", left: 0, top: 0 }}><path d="M40 40 L420 520 M420 40 L40 520" stroke={RED} strokeWidth={16} strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - x)} /></svg>
            <div style={{ direction: "rtl", fontFamily: "E46Black", fontSize: 40, color: BONE, marginTop: 18, textAlign: "center" }}>{p.name}</div>
            <div style={{ direction: "rtl", fontFamily: "E46Bold", fontSize: 28, color: MUTED, textAlign: "center" }}>{p.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const Cal93: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const flip = prog(t, wd(43, "دوم") - 0.15, wd(43, "دوم") + 0.2);
  const day = flip < 0.5 ? 1 : 2;
  return (
    <AbsoluteFill>
      {CLIPS.casa && <Soft src={CLIPS.casa.file} k={0.3} />}
      <div style={{ position: "absolute", left: 640, top: 80, width: 640, height: 690, background: BONE, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.75)", direction: "rtl" }}>
        <div style={{ height: 130, background: INK, color: BONE, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "E46Black", fontSize: 70 }}>دسامبر {fa(1993)}</div>
        <div style={{ textAlign: "center", fontFamily: "E46Num", fontSize: 330, lineHeight: 1.2, color: day === 2 ? RED : INK, transform: `scaleY(${Math.abs(Math.cos(flip * Math.PI))})` }}>{fa(day)}</div>
        <div style={{ textAlign: "center", fontFamily: "E46Black", fontSize: 54, color: INK, marginTop: -30 }}>{day === 1 ? "چهارشنبه · تولد ۴۴ سالگی" : "پنجشنبه"}</div>
      </div>
    </AbsoluteFill>
  );
};
const Trace: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const el = (t - t0) * 37 + 11; // the timer runs fast: the call is too long
  const mm = Math.floor(el / 60), ss = Math.floor(el % 60);
  const warn = el > 120;
  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      <Media clip={CLIPS.s44b} t0={t0 - 2} len={6} w={W} h={H} focus={[0.5, 0.45]} from={4} grade="cool" />
      <AbsoluteFill style={{ background: "rgba(5,6,7,0.72)" }} />
      <div style={{ position: "absolute", left: 510, top: 110, width: 900, padding: "30px 46px", border: `3px solid ${warn ? RED : "rgba(241,236,226,0.4)"}`, borderRadius: 22, background: "rgba(10,11,13,0.85)", direction: "rtl" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "E46Bold", fontSize: 34, color: MUTED }}><span>تماس در جریان</span><span style={{ color: RED, opacity: 0.5 + 0.5 * Math.sin(t * 10) }}>● ضبط</span></div>
        <div style={{ fontFamily: "E46Oswald", fontSize: 170, color: warn ? RED : BONE, textAlign: "center", direction: "ltr", marginTop: 10 }}>{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</div>
        <svg width={808} height={150} style={{ display: "block" }}>
          {Array.from({ length: 64 }, (_, i) => { const a = 10 + 60 * Math.abs(Math.sin(i * 0.7 + t * 9) * Math.sin(i * 0.23 + t * 3)); return <rect key={i} x={i * 12.6} y={75 - a} width={7} height={a * 2} rx={3} fill={warn ? RED : BONE} opacity={0.85} />; })}
        </svg>
        <div style={{ fontFamily: "E46Black", fontSize: 44, color: warn ? RED : BONE, textAlign: "center", marginTop: 18 }}>{warn ? "ردیابی سیگنال…" : "مخفیگاه ← پسرش"}</div>
      </div>
    </AbsoluteFill>
  );
};
const Radar: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const k = prog(t, t0, t0 + 1.4), sw = (t - t0) * 2.2;
  const tgt = [1000, 470];
  const ants = [[330, 230], [1640, 300], [1260, 900]];
  return (
    <AbsoluteFill>
      <Media clip={CLIPS.helipad} t0={t0} len={3} w={W} h={H} focus={[0.62, 0.5]} zoom={1.05} grade="cool" />
      <AbsoluteFill style={{ background: "rgba(4,10,8,0.62)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[120, 240, 360, 480].map((r) => <circle key={r} cx={tgt[0]} cy={tgt[1]} r={r} fill="none" stroke="rgba(120,255,170,0.25)" strokeWidth={2} />)}
        <path d={`M ${tgt[0]} ${tgt[1]} L ${tgt[0] + 520 * Math.cos(sw)} ${tgt[1] + 520 * Math.sin(sw)}`} stroke="rgba(120,255,170,0.7)" strokeWidth={4} />
        {ants.map(([x, y], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={lerp(x, tgt[0], k)} y2={lerp(y, tgt[1], k)} stroke={GOLD} strokeWidth={4} strokeDasharray="14 10" />
            <path d={`M ${x - 18} ${y + 30} L ${x} ${y - 30} L ${x + 18} ${y + 30} Z`} fill="none" stroke={GOLD} strokeWidth={4} />
          </g>
        ))}
        <circle cx={tgt[0]} cy={tgt[1]} r={lerp(200, 26, k)} fill="none" stroke={RED} strokeWidth={6} opacity={k} />
        {k >= 1 && <circle cx={tgt[0]} cy={tgt[1]} r={10} fill={RED} />}
      </svg>
      <Chip t={t} t0={t0 + 1.3} top={600} right={420} color={RED}>محل مخفیگاه پیدا شد</Chip>
    </AbsoluteFill>
  );
};
const Accounts: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const A = [{ h: "روایت پلیس", b: "گلوله‌ی نیروهای ویژه" }, { h: "روایت خانواده", b: "خودش شلیک کرد" }, { h: "و روایت‌های دیگر", b: "؟" }];
  return (
    <AbsoluteFill>
      {CLIPS.tejado && <Soft src={CLIPS.tejado.file} k={0.28} gray />}
      {A.map((a, i) => {
        const k = backOut(prog(t, t0 + 0.2 + i * 0.5, t0 + 0.55 + i * 0.5));
        return (
          <div key={i} style={{ position: "absolute", right: 110 + i * 580, width: 520, top: 260, height: 300, transform: `scale(${k})`, opacity: Math.min(1, k), background: "rgba(15,15,17,0.9)", border: `3px solid ${i === 2 ? RED : "rgba(241,236,226,0.35)"}`, borderRadius: 20, direction: "rtl", padding: "26px 40px" }}>
            <div style={{ fontFamily: "E46Bold", fontSize: 36, color: MUTED }}>{a.h}</div>
            <div style={{ fontFamily: "E46Black", fontSize: i === 2 ? 90 : 62, color: i === 2 ? RED : BONE, marginTop: 4 }}>{a.b}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────── overlays on top of shots (time windows) */
const Clock: React.FC<{ t: number }> = ({ t }) => {
  const k = easeOut(prog(t, 0.05, 0.4)), o = 1 - prog(t, E(1) + 0.2, E(1) + 0.5);
  const sec = 7 * 3600 + 16 * 60 + Math.floor(t * 1.0);
  return (
    <div style={{ position: "absolute", top: 270, width: W, textAlign: "center", opacity: k * o }}>
      <div style={{ fontFamily: "E46Oswald", fontSize: 230, color: BONE, textShadow: shadow, letterSpacing: 4 }}>0{Math.floor(sec / 3600)}:{String(Math.floor((sec % 3600) / 60)).padStart(2, "0")}<span style={{ fontSize: 110, color: RED }}>:{String(sec % 60).padStart(2, "0")}</span></div>
      <div style={{ fontFamily: "E46Black", fontSize: 64, color: BONE, textShadow: shadow, direction: "rtl", opacity: prog(t, wd(1, "27") - 0.1, wd(1, "27") + 0.2) }}>{fa(27)} نوامبر {fa(1989)} · بوگوتا</div>
    </div>
  );
};
const Counter: React.FC<{ t: number; t0: number; n: number; label: string; top?: number }> = ({ t, t0, n, label, top = 230 }) => {
  if (t < t0) return null;
  const v = Math.round(n * easeOut(prog(t, t0, t0 + 0.9)));
  return (
    <div style={{ position: "absolute", top, width: W, textAlign: "center", direction: "rtl" }}>
      <div style={{ fontFamily: "E46Oswald", fontSize: 300, lineHeight: 1, color: RED, textShadow: shadow }}>{v}</div>
      <div style={{ fontFamily: "E46Black", fontSize: 70, color: BONE, textShadow: shadow }}>{label}</div>
    </div>
  );
};
const NameTitle: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = easeOut(prog(t, t0, t0 + 0.3)), o = 1 - prog(t, t1, t1 + 0.3);
  return (
    <div style={{ position: "absolute", top: 560, width: W, textAlign: "center", opacity: o }}>
      <div style={{ fontFamily: "E46Black", fontSize: 150, color: BONE, textShadow: shadow, transform: `scale(${lerp(1.3, 1, k)})`, opacity: k, direction: "rtl" }}>پابلو اسکوبار</div>
      <div style={{ margin: "0 auto", width: 560 * k, height: 12, background: RED }} />
      <div style={{ fontFamily: "E46Bebas", fontSize: 54, letterSpacing: 10, color: MUTED, marginTop: 14, opacity: prog(t, t0 + 0.3, t0 + 0.6) }}>1949 — 1993</div>
    </div>
  );
};
const Flight: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = easeOut(prog(t, t0, t0 + 0.35)), o = 1 - prog(t, t1, t1 + 0.3), p = prog(t, t0 + 0.3, t1);
  return (
    <div style={{ position: "absolute", left: 460, right: 460, top: 250, opacity: k * o, transform: `translateY(${(1 - k) * 40}px)`, background: "rgba(7,8,10,0.82)", borderRadius: 20, border: "2px solid rgba(241,236,226,0.3)", padding: "28px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", direction: "ltr", fontFamily: "E46Oswald", fontSize: 92, color: BONE }}><span>BOG</span><span style={{ color: RED, fontSize: 60, alignSelf: "center" }}>AV 203</span><span>CLO</span></div>
      <div style={{ position: "relative", height: 8, background: "rgba(241,236,226,0.2)", margin: "12px 0 18px", direction: "ltr" }}><div style={{ width: `${Math.min(14, p * 30)}%`, height: 8, background: RED }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", direction: "rtl", fontFamily: "E46Black", fontSize: 40, color: BONE }}><span>بوگوتا</span><span style={{ color: RED }}>پرواز ۲۰۳ آویانکا</span><span>کالی</span></div>
    </div>
  );
};
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const t0 = V.total + 0.1;
  if (t < t0 - 0.2) return null;
  const k = easeOut(prog(t, t0 - 0.2, t0 + 0.6));
  return (
    <AbsoluteFill style={{ background: `rgba(7,8,10,${0.75 * k})`, alignItems: "center", justifyContent: "center", opacity: k }}>
      <div style={{ fontFamily: "E46Black", fontSize: 128, color: BONE, direction: "rtl" }}>پابلو اسکوبار</div>
      <div style={{ width: 620, height: 10, background: RED, margin: "14px 0 24px" }} />
      <div style={{ fontFamily: "E46Oswald", fontSize: 96, color: MUTED, letterSpacing: 8 }}>1949 — 1993</div>
    </AbsoluteFill>
  );
};

const OVERS: { from: number; to: number; r: (t: number) => React.ReactNode }[] = [
  { from: 0, to: E(1) + 0.5, r: (t) => <Clock t={t} /> },
  { from: S(2), to: E(2) + 0.3, r: (t) => <Chip t={t} t0={wd(2, "بوگوتا") - 0.1} top={190} color={GOLD}>فرودگاه بین‌المللی بوگوتا</Chip> },
  { from: S(3), to: E(3) + 0.4, r: (t) => <Counter t={t} t0={S(3) - 0.05} n={107} label="کشته" /> },
  { from: S(4), to: E(4), r: (t) => <Chip t={t} t0={wd(4, "پرونده‌های") - 0.05} t1={wd(4, "یکی") - 0.15} top={190}>پرونده‌های قضایی</Chip> },
  { from: S(5) - 0.1, to: E(6), r: (t) => <NameTitle t={t} t0={S(5) - 0.05} t1={wd(6, "چطور") - 0.15} /> },
  { from: S(7), to: E(7) + 0.3, r: (t) => <Chip t={t} t0={wd(7, "پابلو") - 0.05} top={190} size={40}>پابلو امیلیو اسکوبار گاویریا</Chip> },
  { from: S(8), to: E(8) + 0.3, r: (t) => <><Chip t={t} t0={wd(8, "معلم") - 0.1} top={190}>مادر: معلم</Chip><Chip t={t} t0={wd(8, "کشاورز") - 0.1} top={270} color={GOLD}>پدر: کشاورز</Chip></> },
  { from: S(9), to: E(9) + 0.3, r: (t) => <Chip t={t} t0={wd(9, "انویگادو") - 0.1} top={190} color={GOLD}>انویگادو · کنار مدلین</Chip> },
  { from: S(12), to: E(12) + 0.3, r: (t) => <><Chip t={t} t0={S(12) - 0.05} top={190}>سرقت خودرو</Chip><Chip t={t} t0={wd(12, "قاچاق") - 0.05} top={270}>قاچاق کالا</Chip><Chip t={t} t0={wd(12, "معامله‌های") - 0.05} top={350} color={RED}>معامله‌های خلاف</Chip></> },
  { from: S(15), to: E(15) + 0.4, r: (t) => <Stamp t={t} t0={wd(15, "بازداشت") - 0.05} text="بازداشت" top={560} /> },
  { from: S(20), to: E(20) + 0.3, r: (t) => <Chip t={t} t0={wd(20, "نماینده") - 0.1} top={190} color={GOLD}>نماینده‌ی علی‌البدل کنگره</Chip> },
  { from: S(25), to: E(25), r: (t) => <Chip t={t} t0={wd(25, "جنگ") - 0.1} top={190} color={RED}>جنگ با حکومت</Chip> },
  { from: S(27), to: E(27) + 0.3, r: (t) => <Chip t={t} t0={wd(27, "لوئیس") - 0.1} top={190} size={40}>لوئیس کارلوس گالان · نامزد ریاست‌جمهوری</Chip> },
  { from: S(28), to: E(28) + 0.3, r: (t) => <Flight t={t} t0={S(28) - 0.05} t1={E(28)} /> },
  { from: S(29), to: E(29) + 0.3, r: (t) => <><Chip t={t} t0={S(29) - 0.05} t1={wd(29, "یک") - 0.2} top={190} color={RED}>۱۰۷ کشته</Chip><Chip t={t} t0={wd(29, "ساختمان") - 0.1} top={190} color={GOLD} size={40}>۶ دسامبر ۱۹۸۹ · ساختمان سازمان امنیت (DAS)</Chip></> },
  { from: S(30), to: E(30) + 0.3, r: (t) => <><Chip t={t} t0={wd(30, "بمب‌گذاری") - 0.05} top={190} color={RED}>بمب‌گذاری</Chip><Chip t={t} t0={wd(30, "ترور") - 0.05} top={270} color={RED}>ترور</Chip><Chip t={t} t0={wd(30, "ترس") - 0.05} top={350} color={RED}>ترس</Chip></> },
  { from: S(32), to: E(32) + 0.3, r: (t) => <Chip t={t} t0={wd(32, "تسلیم") - 0.1} top={190} color={GOLD}>۱۹ ژوئن ۱۹۹۱ · تسلیم</Chip> },
  { from: S(34), to: E(34) + 0.3, r: (t) => <Stamp t={t} t0={wd(34, "لا") - 0.05} text="لا کاتدرال" top={560} rot={-4} size={110} color={BONE} /> },
  { from: S(37), to: E(37) + 0.3, r: (t) => <Stamp t={t} t0={wd(37, "فرار") - 0.05} text="فرار" top={520} rot={-7} size={160} /> },
  { from: S(40), to: E(40) + 0.2, r: (t) => <Chip t={t} t0={S(40) - 0.05} top={190} color={RED}>رقیب‌ها</Chip> },
  { from: S(42), to: E(42) + 0.3, r: (t) => <Chip t={t} t0={wd(42, "کلمبیا") - 0.2} top={190} color={GOLD}>خانواده: تلاش برای خروج از کلمبیا</Chip> },
  { from: S(44), to: E(44) + 0.3, r: (t) => <Chip t={t} t0={wd(44, "مدلین") - 0.1} top={190} color={GOLD}>مخفیگاه · مدلین</Chip> },
  { from: S(48), to: E(48) + 0.3, r: (t) => <Chip t={t} t0={wd(48, "پشت") - 0.1} top={190} color={RED}>فرار از پشت‌بام</Chip> },
  { from: S(51), to: E(51) + 0.3, r: (t) => <Chip t={t} t0={S(51) - 0.05} top={190} size={40}>۱ دسامبر ۱۹۴۹ — ۲ دسامبر ۱۹۹۳</Chip> },
];

/* ───────── the top bar: file label + 1949–1993 timeline with the current year */
const TopBar: React.FC<{ t: number }> = ({ t }) => {
  const ch = chAt(t), x0 = 560, x1 = 1360;
  const px = (y: number) => x1 - ((y - 1949) / (1993 - 1949)) * (x1 - x0); // right to left
  const prev = CH[Math.max(0, CH.indexOf(ch) - 1)];
  const yr = lerp(prev.y, ch.y, easeInOut(prog(t, ch.at, ch.at + 0.6)));
  const X = px(yr);
  return (
    <div style={{ position: "absolute", top: 34, left: 0, width: W, height: 110 }}>
      <div style={{ position: "absolute", top: 20, right: 60, direction: "rtl", display: "flex", alignItems: "center", gap: 12, fontFamily: "E46Black", fontSize: 30, color: BONE, opacity: 0.92 }}>
        <span style={{ width: 14, height: 14, borderRadius: 7, background: RED, opacity: 0.6 + 0.4 * Math.sin(t * 5) }} />پرونده‌ی اسکوبار
      </div>
      <div style={{ position: "absolute", top: 18, left: 60, fontFamily: "E46Bebas", fontSize: 44, color: RED, letterSpacing: 3 }}>{Math.round(yr)}</div>
      <div style={{ position: "absolute", top: 36, left: x0, width: x1 - x0, height: 4, background: "rgba(241,236,226,0.25)" }} />
      <div style={{ position: "absolute", top: 36, left: X, width: x1 - X, height: 4, background: RED }} />
      {[1949, 1960, 1970, 1980, 1990, 1993].map((y) => <div key={y} style={{ position: "absolute", top: 30, left: px(y) - 1, width: 2, height: 16, background: "rgba(241,236,226,0.5)" }} />)}
      <div style={{ position: "absolute", top: 28, left: X - 10, width: 20, height: 20, borderRadius: 10, background: RED, boxShadow: "0 0 16px rgba(229,50,43,0.9)" }} />
      <div style={{ position: "absolute", top: 50, left: x1 - 30, fontFamily: "E46Bebas", fontSize: 26, color: MUTED }}>1949</div>
      <div style={{ position: "absolute", top: 50, left: x0 - 30, fontFamily: "E46Bebas", fontSize: 26, color: MUTED }}>1993</div>
    </div>
  );
};

/* the source line under the bar (two seconds at the start of each shot) */
const SourceLine: React.FC<{ t: number; s: Sh }> = ({ t, s }) => {
  const k = kindOf(s);
  if (k === "graphic") return null;
  const cl = CLIPS[s.n];
  const o = prog(t, s.at + 0.1, s.at + 0.35) * (1 - prog(t, s.at + 2.6, s.at + 3));
  const txt = k === "photo" ? "عکس واقعی" : k === "archive" ? "فیلم آرشیوی" : "تصویر نمادین";
  const dot = k === "photo" ? "#5BE08A" : k === "archive" ? GOLD : MUTED;
  let who = "";
  if (cl && k === "photo") who = (cl.author || "").replace(/\s+/g, " ").slice(0, 34);
  if (cl && k === "archive") who = cl.source === "archive" ? "DEA · آرشیو ملی آمریکا" : "گارد ساحلی آمریکا";
  return (
    <div style={{ position: "absolute", top: 110, right: 60, direction: "rtl", display: "flex", alignItems: "center", gap: 12, padding: "7px 16px", borderRadius: 8, background: "rgba(7,8,10,0.66)", fontFamily: "E46Bold", fontSize: 25, color: BONE, opacity: o }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: dot }} />{txt}
      {who && <span style={{ direction: "ltr", fontFamily: "E46Mono", fontSize: 21, color: MUTED }}>{who}</span>}
    </div>
  );
};
const PhotoLabel: React.FC<{ t: number; s: Sh; until: number }> = ({ t, s, until }) => {
  if (!s.label) return null;
  const k = easeOut(prog(t, s.at + 0.2, s.at + 0.5)), o = 1 - prog(t, until - 0.25, until);
  return (
    <div style={{ position: "absolute", top: 740, right: 60, direction: "rtl", opacity: k * o, transform: `translateY(${(1 - k) * 20}px)`, fontFamily: "E46Bold", fontSize: 34, color: BONE, padding: "8px 18px", background: "rgba(7,8,10,0.7)", borderRight: `6px solid ${GOLD}` }}>{s.label}</div>
  );
};

/* the year card at each chapter */
const ChapterCard: React.FC<{ t: number }> = ({ t }) => {
  const ch = CH.find((x) => x.card && t >= x.at && t < x.at + 1.35);
  if (!ch) return null;
  const u = t - ch.at;
  const inn = easeOut(prog(u, 0, 0.25)), out = easeInOut(prog(u, 1.0, 1.35));
  const label = (ch as { label?: string }).label;
  return (
    <AbsoluteFill style={{ background: INK, clipPath: `inset(0 ${out * 100}% 0 0)` }}>
      <div style={{ position: "absolute", top: 230, width: W, textAlign: "center", fontFamily: label ? "E46Black" : "E46Oswald", fontSize: label ? 200 : 330, lineHeight: 1.2, color: BONE, opacity: inn, transform: `translateY(${(1 - inn) * 60}px) scale(${1 + 0.04 * u})`, letterSpacing: 6 }}>{label ? fa(label) : ch.y}</div>
      <div style={{ position: "absolute", top: 640, left: (W - 520) / 2, width: 520 * inn, height: 12, background: RED }} />
      <div style={{ position: "absolute", top: 680, width: W, textAlign: "center", fontFamily: "E46Black", fontSize: 76, color: RED, direction: "rtl", opacity: prog(u, 0.15, 0.4) }}>{ch.title}</div>
    </AbsoluteFill>
  );
};

/* ───────── captions: 2–4 words, the said word lights up, keywords red */
const KEY = new Set(["پابلو", "اسکوبار", "کوکائین", "کارتل", "ترور", "انفجار", "منفجر", "فرار", "کشته", "تسلیم", "کاتدرال", "قدرت", "خشونت", "بازداشت", "107", "1989", "1949", "1976", "1982", "1984", "1991", "1992", "1993", "44"]);
type Cap = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const CAPS: Cap[] = (() => {
  const out: Cap[] = [];
  const lines = [...new Set(V.words.map((w) => w.line))];
  for (const n of lines) {
    const ws = V.words.filter((w) => w.line === n);
    let cur: Cap["words"] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const nx = ws[i + 1];
      const len = cur.reduce((a, x) => a + x.w.length, 0);
      if (!nx || /[،؟]$/.test(w.w) || cur.length >= 5 || len > 28 || (cur.length >= 2 && nx.s - w.e > 0.25)) { out.push({ words: cur, s: cur[0].s, e: w.e }); cur = []; }
    });
  }
  out.forEach((c, i) => { const n = out[i + 1]; c.e = n ? Math.min(n.s, c.e + 0.5) : c.e + 0.6; });
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c || (t >= S(5) - 0.1 && t < E(5) + 0.3)) return null;
  const u = easeOut(prog(t, c.s - 0.05, c.s + 0.1));
  return (
    <div style={{ position: "absolute", top: 870, width: W, display: "flex", justifyContent: "center", transform: `translateY(${(1 - u) * 16}px)`, opacity: u }}>
      <div style={{ direction: "rtl", display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, columnGap: 20, padding: "8px 28px 14px", borderRadius: 14, background: "rgba(7,8,10,0.74)" }}>
        {c.words.map((w, i) => {
          const bare = w.w.replace(/[،.؟]$/, ""), on = t >= w.s - 0.03, key = KEY.has(bare);
          return <span key={i} style={{ fontFamily: "E46Black", fontSize: 64, lineHeight: 1.35, color: on ? (key ? RED : "#fff") : "rgba(255,255,255,0.38)", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{fa(bare)}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── one shot */
const ShotView: React.FC<{ s: Sh; t: number; until: number }> = ({ s, t, until }) => {
  const len = until - s.at;
  switch (s.g) {
    case "map": return s.n === "MAP_BIRTH" ? <MapBirth t={t} t0={s.at} t1={until} /> : <MapRoute t={t} t0={s.at} t1={until} />;
    case "board": return <Board t={t} t0={s.at} />;
    case "rich": return <Rich t={t} t0={s.at} t1={until} />;
    case "news": return <News t={t} t0={s.at} />;
    case "months": return <Months t={t} t0={s.at} t1={until} />;
    case "people": return <People t={t} t0={s.at} />;
    case "cal93": return <Cal93 t={t} t0={s.at} />;
    case "trace": return <Trace t={t} t0={s.at} />;
    case "radar": return <Radar t={t} t0={s.at} />;
    case "accounts": return <Accounts t={t} t0={s.at} />;
  }
  if (s.fit === "print") return <Print n={s.n} t={t} t0={s.at} t1={until} />;
  const cl = CLIPS[s.n];
  const old = cl && cl.source === "archive";
  return <Media clip={cl} name={s.n} t0={s.at} len={len + 0.1} w={W} h={H} from={s.from ?? 0} rate={s.rate} fit={s.fit ?? "cover"} focus={s.focus ?? cl?.focus} pan={s.pan} zoom={s.zoom} push={s.push} grade={s.grade === "film" || s.grade === "mono" || (!s.grade && old) ? "warm" : s.grade ?? "clean"} />;
};

/* ───────── main */
const Video: React.FC<{ audio?: string; at?: number }> = ({ audio, at: tAt }) => {
  const frame = useCurrentFrame();
  const t = tAt ?? frame / FPS;
  const i = shotIndex(t), s = SHOTS[i], until = SHOTS[i + 1]?.at ?? TOTAL;
  const sinceCut = t - s.at;
  const punch = i > 0 ? 1 + 0.05 * (1 - easeOut(prog(sinceCut, 0, 0.3))) : 1;
  const flash = i > 0 && sinceCut < 0.1 ? 0.22 * (1 - sinceCut / 0.1) : 0;
  const violent = [wd(2, "منفجر"), wd(29, "انفجار"), wd(49, "تیراندازی"), wd(23, "ترور"), wd(27, "ترور")];
  const shake = violent.reduce((a, x) => a + (t > x && t < x + 0.4 ? 12 * (1 - (t - x) / 0.4) : 0), 0);
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: INK }}>
        <AbsoluteFill style={{ transform: `scale(${punch}) translate(${Math.sin(t * 83) * shake}px, ${Math.cos(t * 71) * shake}px)` }}>
          <ShotView s={s} t={t} until={until} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
        {OVERS.filter((o) => t >= o.from - 0.1 && t <= o.to + 0.3).map((o, k) => <React.Fragment key={k}>{o.r(t)}</React.Fragment>)}
        <PhotoLabel t={t} s={s} until={until} />
        <SourceLine t={t} s={s} />
        <ChapterCard t={t} />
        <TopBar t={t} />
        <Captions t={t} />
        <EndCard t={t} />
        <AbsoluteFill style={{ background: `rgba(255,240,230,${flash})` }} />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${prog(t, TOTAL - 0.5, TOTAL)})` }} />
        {audio && <Html5Audio src={staticFile(audio)} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

// review stills: the middle of every shot + the chapter cards + the end
const LOOK = [...CH.filter((x) => x.card).map((x) => +(x.at + 0.6).toFixed(2)), ...SHOTS.map((s, i) => { const b = SHOTS[i + 1]?.at ?? TOTAL; return +(s.at + (b - s.at) * 0.6).toFixed(2); }), TOTAL - 1.2];
const Look: React.FC = () => { const f = useCurrentFrame(); return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />; };
export const SHOT_TIMES = SHOTS.map((s, i) => [s.n, +s.at.toFixed(2), +((SHOTS[i + 1]?.at ?? TOTAL) - s.at).toFixed(2)] as const);
export const V46Compositions: React.FC = () => (
  <>
    <Composition id="V46" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v46/mix-norm.wav" }} />
    <Composition id="V46-Silent" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V46-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
