// V27 · «اگه یه روز…» — ریلز آمادگی در برابر انفجار هسته‌ای، با زبان ویدیوی مرجع (uploads/ref-telegram.mp4):
// دفتر کاغذی (شطرنجی، خط‌دار، کرافت) + بلوپرینت سرمه‌ای برای ساختمان، از خانواده‌ی Studio Desk. همه‌ی تصویرها کد است.
// زمان هر رویداد از words.json (tools/v27-voice.mjs) می‌آید: w(جمله، "کلمه").
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import wordsJson from "./words.json";
import { clamp, ease, hit, lerp, pop, ramp, rnd, spring, useV23Fonts } from "../styles/studio-desk/demo/lib";
import {
  Abs, Badge, Bag, Ban, Bottle, Card, City, Decay, Fa, Fallout, Flash, Fridge, Ico, Jacket, K, Marker, Mono, Mushroom, Num, Person,
  Polaroid, Prone, Ring, Shower, Stopwatch, Sticky, Traffic, Trefoil, WindowCrack, enter, FAF, SHADOW,
} from "./art";

type Word = { si: number; wi: number; w: string; s: number; e: number };
const WORDS = wordsJson as Word[];
const FPS = 30, W = 1080, H = 1920;
const bare = (x: string) => x.replace(/[،.؟!…«»,:؛]/g, "");
const w = (si: number, word: string) => {
  const x = WORDS.find((q) => q.si === si && bare(q.w) === word) ?? WORDS.find((q) => q.si === si && q.w.includes(word));
  if (!x) throw new Error(`word not found: ${si} ${word}`);
  return x.s;
};
const S = (si: number) => WORDS.find((q) => q.si === si)!.s;
const E = (si: number) => WORDS.filter((q) => q.si === si).at(-1)!.e;
const TOTAL = E(17) + 1.8;
export const V27_FRAMES = Math.round(TOTAL * FPS);

// ───────────────────────── backgrounds ─────────────────────────
type Bg = "grid" | "lined" | "kraft" | "blue";
const BG: Record<Bg, React.CSSProperties> = {
  grid: {
    background: K.paper,
    backgroundImage: "linear-gradient(rgba(70,90,120,.10) 2px, transparent 2px), linear-gradient(90deg, rgba(70,90,120,.10) 2px, transparent 2px)",
    backgroundSize: "60px 60px",
  },
  lined: {
    background: "#F6F3EC",
    backgroundImage: "linear-gradient(transparent 62px, rgba(80,110,160,.22) 62px, rgba(80,110,160,.22) 64px)",
    backgroundSize: "100% 64px",
  },
  kraft: { background: K.kraft, backgroundImage: "radial-gradient(rgba(90,60,20,.10) 1px, transparent 1.5px)", backgroundSize: "7px 7px" },
  blue: {
    background: K.blue,
    backgroundImage: "linear-gradient(rgba(255,255,255,.10) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.10) 2px, transparent 2px), linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
    backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
  },
};
const jag = (k: number, fromRight = true) => {
  // torn-paper edge sweeping across the frame
  const pts: string[] = [];
  const x0 = lerp(-120, W + 120, k);
  for (let i = 0; i <= 32; i++) { const y = (i / 32) * H; pts.push(`${(fromRight ? W - x0 : x0) + (rnd(i * 3.1) - 0.5) * 70}px ${y}px`); }
  return fromRight ? `polygon(${W + 200}px 0, ${pts.join(",")}, ${W + 200}px ${H}px)` : `polygon(-200px 0, ${pts.join(",")}, -200px ${H}px)`;
};

// ───────────────────────── scenes ─────────────────────────
type Tr = "cut" | "zoom" | "slide" | "whip" | "drop" | "tear" | "iris";
type Scene = { from: number; bg: Bg; tr: Tr; draw: (t: number) => React.ReactNode };
const at = (si: number) => S(si) - 0.22;

const Head: React.FC<{ fa: string; en: string; k: number; y?: number; dark?: boolean }> = ({ fa, en, k, y = 210, dark }) => (
  <Abs x={0} y={y} w={W} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: clamp(k * 2), transform: `translateY(${(1 - Math.min(1, k)) * 24}px)` }}>
    <Mono s={20} c={dark ? "#9FC0F0" : K.red}>{en}</Mono>
    <Fa s={64} w={900} c={dark ? "#fff" : K.ink}>{fa}</Fa>
  </Abs>
);

const Step: React.FC<{ y: number; n: number; title: string; icon: string; k: number; tick: number; active: number }> = ({ y, n, title, icon, k, tick, active }) => (
  <Card x={130} y={y} w={820} h={180} k={k} style={{ transform: `translateY(${(1 - Math.min(1, k)) * 60}px) scale(${(0.85 + 0.15 * k) * (1 + 0.035 * active)})` }}>
    <div style={{ position: "absolute", right: 36, top: 45, width: 90, height: 90, borderRadius: 90, background: active > 0.5 ? K.ink : "#EFEAE0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Num s={52} c={active > 0.5 ? "#fff" : K.ink}>{n}</Num>
    </div>
    <Fa s={64} w={900} style={{ position: "absolute", right: 156, top: 46 }}>{title}</Fa>
    <div style={{ position: "absolute", left: 40, top: 46, width: 88, height: 88, borderRadius: 22, background: "#F3EEE3", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n={icon} s={58} w={1.9} /></div>
    <Badge s={50} k={spring(tick, 0, 0.35) * (tick > 0 ? 1 : 0)} style={{ position: "absolute", left: 150, top: 65 }} />
  </Card>
);

/** blueprint building section */
const Building: React.FC<{ t: number }> = ({ t }) => {
  const draw = ease.io(ramp(t, w(9, "ساختمون") - 0.4, w(9, "ساختمون") + 0.9));
  const brick = ramp(t, w(9, "آجری"), w(9, "آجری") + 0.5);
  const thick = ease.out(ramp(t, w(9, "دیوار"), w(9, "دیوار") + 0.5));
  const soil = ease.out(ramp(t, w(9, "خاک"), w(9, "خاک") + 0.5));
  const base = ease.out(ramp(t, w(10, "زیرزمین"), w(10, "زیرزمین") + 0.5));
  const mid = ease.out(ramp(t, w(10, "وسط"), w(10, "وسط") + 0.5));
  const shut = ease.io(ramp(t, w(10, "ببند") - 0.2, w(10, "ببند") + 0.5));
  const L = 3000;
  const st = { stroke: "#fff", strokeWidth: 4 + thick * 6, fill: "none", strokeDasharray: L, strokeDashoffset: L * (1 - draw) } as const;
  const floors = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 900 900" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <defs>
        <pattern id="brk" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 0 H40 M0 10 H40 M20 0 V10 M0 10 V20 M40 10 V20" stroke="rgba(255,255,255,.35)" strokeWidth={2} /></pattern>
        <pattern id="soil" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V22" stroke="rgba(255,255,255,.35)" strokeWidth={3} /></pattern>
      </defs>
      {/* ground + soil */}
      <rect x="0" y="640" width="900" height="260" fill="url(#soil)" opacity={0.35 + 0.65 * soil} />
      <path d="M0 640 H900" stroke="#fff" strokeWidth={3} strokeDasharray="14 10" />
      {/* walls with brick fill */}
      <rect x="250" y="140" width="400" height="500" fill="url(#brk)" opacity={brick} />
      {/* middle core highlight */}
      <rect x="370" y="240" width="160" height="300" fill={K.yellow} opacity={0.32 * mid} />
      {/* basement highlight */}
      <rect x="250" y="640" width="400" height="140" fill={K.yellow} opacity={0.45 * base} />
      <rect x="250" y="140" width="400" height="500" {...st} />
      <rect x="250" y="640" width="400" height="140" {...st} strokeDasharray="16 10" strokeDashoffset={0} opacity={draw} />
      {floors.map((f) => <path key={f} d={`M250 ${240 + f * 100} H650`} {...st} strokeWidth={3} />)}
      {/* windows + shutters */}
      {floors.map((f) => [0, 1].map((c) => {
        const x = c ? 580 : 272, y = 170 + f * 100;
        return (
          <g key={`${f}${c}`} opacity={draw}>
            <rect x={x} y={y} width="48" height="46" fill="rgba(160,200,255,.25)" stroke="#fff" strokeWidth={3} />
            <rect x={x} y={y} width="48" height={46 * shut} fill="#fff" opacity={0.85} />
          </g>
        );
      }))}
      {/* roof */}
      <path d="M230 140 H670" stroke="#fff" strokeWidth={8} opacity={draw} />
      {/* people dots */}
      {base > 0 && [0, 1, 2].map((i) => <g key={i} transform={`translate(${380 + i * 70} 742)`} opacity={base}><circle r="12" cy="-34" fill="#fff" /><rect x="-12" y="-20" width="24" height="34" rx="10" fill="#fff" /></g>)}
      {mid > 0 && [0, 1].map((i) => <g key={i} transform={`translate(${420 + i * 60} 430)`} opacity={mid}><circle r="11" cy="-30" fill="#fff" /><rect x="-11" y="-18" width="22" height="30" rx="9" fill="#fff" /></g>)}
      {/* labels */}
      <g fontFamily="Chakra" fontWeight={600} fontSize={22} fill="#CFE0FA" letterSpacing={3} opacity={draw}>
        <text x="40" y="380">BRICK /</text><text x="40" y="410">CONCRETE</text>
        <text x="40" y="720" opacity={0.5 + 0.5 * base}>BASEMENT</text>
        <text x="670" y="625">GROUND</text>
      </g>
    </svg>
  );
};

const SCENES: Scene[] = [
  // 0 · hook — a normal day; this video could save your life
  { from: 0, bg: "grid", tr: "cut", draw: (t) => {
    const p = spring(t, 0.05, 0.6, 0.25);
    const sw = pop(t, w(1, "ویدیو") - 0.1, 0.45);
    const note = pop(t, w(1, "می‌تونه"), 0.45);
    const mk = ease.out(ramp(t, w(1, "نجات") - 0.1, w(1, "نجات") + 0.5));
    return <>
      <Polaroid x={120} y={250 + Math.sin(t * 1.3) * 4} w={620} h={560} rot={-4 + Math.sin(t * 0.9) * 0.6} k={p} label="یه روز معمولی"><City t={t} /></Polaroid>
      <Card x={600} y={720} w={330} h={330} k={sw} rot={5} r={36} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Stopwatch t={t} s={250} /></Card>
      <Sticky x={130} y={900} w={440} h={250} rot={-3} k={note}>
        <Fa s={46} w={900}>این ویدیو</Fa>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Ico n="heart" s={46} c={K.red} w={2.4} /><Fa s={36} w={700} c={K.ink2}>شاید جونت رو نجات بده</Fa></div>
      </Sticky>
      {mk > 0 && <Marker x={95} y={875} w={520} h={300} k={mk} />}
    </>;
  } },
  // 1 · if a nuclear blast happens — most people survive with 3 actions
  { from: at(2), bg: "grid", tr: "zoom", draw: (t) => {
    const grow = ramp(t, w(2, "انفجار") - 0.1, w(2, "انفجار") + 1.6);
    const shrink = ease.io(ramp(t, w(2, "بیشتر") - 0.3, w(2, "بیشتر") + 0.3));
    const row = (i: number) => pop(t, w(2, "آدما") - 0.2 + i * 0.05, 0.35);
    const safe = (i: number) => ramp(t, w(2, "سالم") - 0.1 + i * 0.04, w(2, "سالم") + 0.1 + i * 0.04);
    const three = pop(t, w(2, "سه") - 0.06, 0.4);
    return <>
      <Polaroid x={lerp(170, 140, shrink)} y={lerp(300, 230, shrink)} w={lerp(740, 560, shrink)} h={lerp(640, 480, shrink)} rot={lerp(2, -3, shrink)} k={spring(t, at(2), 0.5, 0.2)} label="انفجار هسته‌ای">
        <Mushroom t={t} k={grow} />
      </Polaroid>
      <Sticky x={720} y={330} w={250} h={250} rot={6} k={three}>
        <Num s={150} c={K.red} style={{ transform: `scale(${1 + 0.2 * hit(t, w(2, "سه"), 0.3)})` }}>3</Num>
        <Fa s={40} w={900}>تا کار</Fa>
      </Sticky>
      <Card x={80} y={820} w={920} h={240} k={row(0)}>
        <div style={{ position: "absolute", inset: "30px 36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", direction: "rtl" }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const ok = i < 9 ? safe(i) : 0;
            return <div key={i} style={{ position: "relative", ...enter(row(i), 20) }}>
              <Person c={ok > 0.5 ? K.green : "#B8B2A6"} s={64} />
              {ok > 0.5 && <Badge s={34} k={spring(t, w(2, "سالم") + i * 0.04, 0.3)} style={{ position: "absolute", top: -12, right: -14 }} />}
            </div>;
          })}
        </div>
      </Card>
    </>;
  } },
  // 2 · go in, stay in, stay tuned
  { from: at(3), bg: "lined", tr: "slide", draw: (t) => {
    const a = [w(3, "برو"), WORDS.filter((q) => q.si === 3)[2].s, w(3, "گوش")];
    const act = (i: number) => ramp(t, a[i] - 0.1, a[i] + 0.2) * (i < 2 ? 1 - ramp(t, a[i + 1] - 0.1, a[i + 1] + 0.2) : 1);
    return <>
      <Head fa="سه کار ساده" en="3 STEPS · KEEP SAFE" k={spring(t, at(3), 0.5, 0.2)} />
      <Step y={420} n={1} title="برو داخل" icon="enter" k={pop(t, a[0] - 0.15, 0.4)} tick={t - (a[0] + 0.45)} active={act(0)} />
      <Step y={640} n={2} title="داخل بمون" icon="house" k={pop(t, a[1] - 0.15, 0.4)} tick={t - (a[1] + 0.45)} active={act(1)} />
      <Step y={860} n={3} title="گوش به خبر باش" icon="radio" k={pop(t, a[2] - 0.15, 0.4)} tick={t - (a[2] + 0.55)} active={act(2)} />
    </>;
  } },
  // 3 · a flash brighter than the sun — don't look
  { from: at(4), bg: "grid", tr: "whip", draw: (t) => {
    const fl = ease.out(ramp(t, w(4, "نوری") - 0.1, w(4, "خورشید") + 0.3)) * (1 - 0.25 * ramp(t, w(4, "نگاش"), w(4, "نکن") + 0.5));
    const eye = pop(t, w(4, "نگاش") - 0.1, 0.4);
    const slash = ease.out(ramp(t, w(4, "نکن") - 0.05, w(4, "نکن") + 0.3));
    return <>
      <Polaroid x={110} y={230} w={860} h={680} rot={-2} k={spring(t, at(4), 0.5, 0.2)} label="نوری تندتر از خورشید"><Flash t={t} k={fl} /></Polaroid>
      <div style={{ position: "absolute", left: 640, top: 330, width: 260, height: 260, borderRadius: 260, background: "radial-gradient(#fff 0%, rgba(255,250,230,.6) 35%, rgba(255,255,255,0) 70%)", opacity: fl * 0.9, mixBlendMode: "screen" }} />
      <Card x={150} y={830} w={300} h={300} r={300} k={eye} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ico n="eye" s={170} w={1.6} />
        <svg width={300} height={300} style={{ position: "absolute", left: 0, top: 0 }}><path d="M60 60 L240 240" stroke={K.red} strokeWidth={22} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={260 * (1 - slash)} /></svg>
      </Card>
    </>;
  } },
  // 4 · lie down, face to the ground, cover your head
  { from: at(5), bg: "grid", tr: "drop", draw: (t) => {
    const lie = ramp(t, w(5, "دراز") - 0.1, w(5, "بکش") + 0.2);
    const cover = ramp(t, w(5, "سرت"), w(5, "بپوشون") + 0.3);
    const chips: [string, number][] = [["دراز بکش", w(5, "دراز")], ["صورت به زمین", w(5, "صورتت")], ["سر رو بپوشون", w(5, "سرت")]];
    return <>
      <Card x={80} y={260} w={920} h={560} k={spring(t, at(5), 0.5, 0.2)} style={{ overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><Prone lie={lie} cover={cover} /></div>
        <Mono s={18} c={K.ink3} style={{ position: "absolute", left: 30, top: 26 }}>FIG. 02 · DROP & COVER</Mono>
      </Card>
      <div style={{ position: "absolute", left: 80, top: 870, width: 920, display: "flex", flexDirection: "row-reverse", justifyContent: "space-between" }}>
        {chips.map(([s, tt], i) => {
          const k = pop(t, tt - 0.1, 0.4);
          return <div key={i} style={{ ...enter(k), display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 60, padding: "14px 24px 14px 18px", boxShadow: SHADOW, flexDirection: "row-reverse" }}>
            <Fa s={34} w={800}>{s}</Fa><Badge s={42} k={spring(t, tt + 0.3, 0.3)} />
          </div>;
        })}
      </div>
    </>;
  } },
  // 5 · the blast wave arrives seconds later — keep away from windows
  { from: at(6), bg: "grid", tr: "zoom", draw: (t) => {
    const wave = ramp(t, w(6, "موج") - 0.2, w(6, "موج") + 1.6);
    const crack = ramp(t, w(6, "می‌رسه") - 0.05, w(6, "می‌رسه") + 0.9);
    const note = pop(t, w(6, "فاصله") - 0.1, 0.4);
    const away = ease.out(ramp(t, w(6, "فاصله"), w(6, "بگیر") + 0.4));
    return <>
      <Abs x={110} y={250} w={140} h={880}>
        <div style={{ position: "absolute", right: 20, top: 0, bottom: 0, width: 4, background: K.ink }} />
        {Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ position: "absolute", right: 20, top: i * 108, display: "flex", alignItems: "center", gap: 10 }}>
          <Mono s={20} c={K.ink2}>{`${i * 2} km`}</Mono><div style={{ width: 26, height: 4, background: K.ink }} />
        </div>)}
        <div style={{ position: "absolute", right: 6, top: lerp(-10, 860, ease.io(wave)), width: 32, height: 32, borderRadius: 32, background: K.red, boxShadow: `0 0 0 ${10 + 8 * Math.sin(t * 8)}px rgba(224,69,43,.18)` }} />
      </Abs>
      <Mono s={22} c={K.red} style={{ position: "absolute", left: 300, top: 250 }}>≈ 3 s / km</Mono>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => { const r = lerp(0, 1500, clamp(wave * 1.2 - i * 0.12)); return <circle key={i} cx={126} cy={250} r={r} fill="none" stroke={K.red} strokeWidth={6 - i * 1.5} opacity={0.5 * (1 - clamp(wave * 1.2 - i * 0.12))} />; })}
      </svg>
      <Polaroid x={400 + away * 80} y={360} w={560} h={600} rot={4} k={spring(t, at(6) + 0.1, 0.5, 0.2)} label="پنجره"><WindowCrack t={t} k={crack} /></Polaroid>
      <Sticky x={330 - away * 40} y={930} w={330} h={190} rot={-5} k={note} c="#F7C9C0">
        <Fa s={46} w={900} c={K.red}>فاصله بگیر</Fa>
        <svg width={160} height={30}><path d={`M150 15 H${150 - 130 * away}`} stroke={K.red} strokeWidth={6} strokeLinecap="round" /><path d={`M${30 + 130 * (1 - away)} 4 L${18 + 130 * (1 - away)} 15 L${30 + 130 * (1 - away)} 26`} stroke={K.red} strokeWidth={6} fill="none" strokeLinecap="round" opacity={away} /></svg>
      </Sticky>
    </>;
  } },
  // 6 · radioactive dust falls — if you're close, ~15 minutes
  { from: at(7), bg: "grid", tr: "slide", draw: (t) => {
    const dust = ramp(t, w(7, "غبار") - 0.3, w(7, "می‌ریزه") + 0.6);
    const tm = pop(t, w(7, "پونزده") - 0.12, 0.45);
    const ring = 1 - ease.io(ramp(t, w(7, "پونزده"), w(7, "داری") + 1.2)) * 0.95;
    return <>
      <Card x={70} y={240} w={940} h={520} k={spring(t, at(7), 0.5, 0.2)} style={{ overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}><Fallout t={t} k={dust} /></div>
        <div style={{ position: "absolute", left: 28, top: 26, display: "flex", alignItems: "center", gap: 14 }}><Trefoil s={64} /><Mono s={18} c={K.ink}>FALLOUT</Mono></div>
      </Card>
      <Card x={300} y={800} w={480} h={380} k={tm} r={36}>
        <div style={{ position: "absolute", left: 30, top: 40, width: 300, height: 300 }}>
          <Ring s={300} k={ring} w={20} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Num s={130} c={K.ink} style={{ transform: `scale(${1 + 0.15 * hit(t, w(7, "پونزده"), 0.3)})` }}>15</Num>
            <Fa s={34} w={800} c={K.ink2}>دقیقه</Fa>
          </div>
        </div>
        <div style={{ position: "absolute", right: 30, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><Ico n="clock" s={64} c={K.red} w={2} /><Mono s={16} c={K.red}>NEAR</Mono></div>
      </Card>
    </>;
  } },
  // 7 · don't flee by car — a car is not a shelter
  { from: at(8), bg: "kraft", tr: "slide", draw: (t) => {
    const stop = ramp(t, w(8, "فرار"), w(8, "نکن") + 0.4);
    const ban = pop(t, w(8, "نکن") - 0.08, 0.35);
    const sh = pop(t, w(8, "پناهگاه") - 0.15, 0.4);
    return <>
      <Polaroid x={110} y={280} w={860} h={620} rot={-2} k={spring(t, at(8), 0.5, 0.2)} label="ماشین"><Traffic t={t} k={stop} /></Polaroid>
      <div style={{ position: "absolute", left: 790, top: 220 }}><Ban s={200} k={ban} /></div>
      <Card x={140} y={930} w={400} h={200} rot={-3} k={sh} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexDirection: "row-reverse" }}>
        <div style={{ position: "relative" }}><Ico n="shield" s={96} w={1.8} /><svg width={96} height={96} style={{ position: "absolute", left: 0, top: 0 }}><path d="M30 30 L66 66 M66 30 L30 66" stroke={K.red} strokeWidth={8} strokeLinecap="round" /></svg></div>
        <Fa s={40} w={900}>پناهگاه نیست</Fa>
      </Card>
    </>;
  } },
  // 8+9 · blueprint: brick/concrete, more walls & soil; best = basement or middle; close windows, AC off
  { from: at(9), bg: "blue", tr: "tear", draw: (t) => {
    const ac = pop(t, w(10, "کولر") - 0.15, 0.4);
    const off = ramp(t, w(10, "خاموش") - 0.1, w(10, "خاموش") + 0.2);
    const meter = ease.out(ramp(t, w(9, "دیوار"), w(9, "امن‌تر") + 0.3));
    return <>
      <Head fa="پناهگاه کجاست؟" en="SHELTER · SECTION A-A" k={spring(t, at(9) + 0.2, 0.5, 0.2)} y={150} dark />
      <Abs x={70} y={330} w={900} h={900}><Building t={t} /></Abs>
      <Abs x={950} y={420} w={40} h={480}>
        <div style={{ position: "absolute", inset: 0, border: "3px solid rgba(255,255,255,.7)", borderRadius: 8 }} />
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, height: `${lerp(14, 96, meter)}%`, background: K.yellow, borderRadius: 4 }} />
        <Mono s={14} c="#CFE0FA" style={{ position: "absolute", top: -34, left: -30 }}>SAFE</Mono>
      </Abs>
      <Card x={110} y={1040} w={320} h={150} k={ac} r={24} style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexDirection: "row-reverse" }}>
        <Fa s={38} w={900}>کولر</Fa>
        <svg width={70} height={70} viewBox="-35 -35 70 70"><circle r="32" fill="none" stroke={K.ink} strokeWidth={3} />{[0, 120, 240].map((a) => <path key={a} d="M0 0 C10 -8 10 -22 0 -28 C-6 -18 -6 -8 0 0" fill={K.ink2} transform={`rotate(${a + t * 600 * (1 - off)})`} />)}</svg>
        <div style={{ width: 90, height: 48, borderRadius: 48, background: off > 0.5 ? "#CFC8BA" : K.green, position: "relative" }}><div style={{ position: "absolute", top: 5, left: lerp(47, 5, off), width: 38, height: 38, borderRadius: 38, background: "#fff" }} /></div>
      </Card>
    </>;
  } },
  // 10 · outside? take off outer clothes, bag them — up to 90%
  { from: at(11), bg: "grid", tr: "tear", draw: (t) => {
    const mv = ease.io(ramp(t, w(11, "دربیار") - 0.1, w(11, "کیسه") - 0.1));
    const tie = ramp(t, w(11, "کیسه"), w(11, "کیسه") + 0.4);
    const pct = ease.out(ramp(t, w(11, "نود") - 0.2, w(11, "درصد") + 0.5));
    const rk = pop(t, w(11, "تا") - 0.2, 0.45);
    return <>
      <Head fa="بیرون بودی؟" en="DECONTAMINATION · 01" k={spring(t, at(11), 0.5, 0.2)} />
      <Card x={90} y={380} w={900} h={420} k={spring(t, at(11) + 0.15, 0.5, 0.2)}>
        <div style={{ position: "absolute", right: lerp(80, 520, mv), top: lerp(90, 150, mv) - Math.sin(mv * Math.PI) * 90, transform: `scale(${1 - 0.45 * mv}) rotate(${-25 * mv}deg)`, opacity: 1 - ramp(mv, 0.85, 1) }}><Jacket s={240} /></div>
        <div style={{ position: "absolute", left: 80, top: 80 }}><Bag s={270} k={tie} /></div>
        <svg width={900} height={420} style={{ position: "absolute", left: 0, top: 0 }}><path d="M560 120 C470 40, 420 60, 380 110" stroke={K.ink3} strokeWidth={4} fill="none" strokeDasharray="12 12" /><path d="M392 92 L378 112 L402 116" stroke={K.ink3} strokeWidth={4} fill="none" /></svg>
      </Card>
      <Card x={290} y={850} w={500} h={300} k={rk} r={36}>
        <div style={{ position: "absolute", right: 40, top: 40, width: 220, height: 220 }}>
          <Ring s={220} k={pct * 0.9} c={K.green} w={18} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Num s={70} c={K.ink}>{`${Math.round(pct * 90)}%`}</Num></div>
        </div>
        <Fa s={34} w={800} c={K.ink2} style={{ position: "absolute", left: 40, top: 92, whiteSpace: "normal", width: 180, textAlign: "right" }}>آلودگی کمتر</Fa>
      </Card>
    </>;
  } },
  // 11 · shower with water and soap — no conditioner
  { from: at(12), bg: "lined", tr: "slide", draw: (t) => {
    const rows: [string, boolean, number][] = [["آب", true, w(12, "آب")], ["صابون", true, w(12, "صابون")], ["نرم‌کننده", false, w(12, "نرم‌کننده")]];
    return <>
      <Card x={150} y={220} w={780} h={960} k={spring(t, at(12), 0.5, 0.2)}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 30, height: 390, borderRadius: 18, overflow: "hidden" }}><Shower t={t} /></div>
        {rows.map(([s, ok, tt], i) => {
          const k = pop(t, tt - 0.12, 0.4);
          return <div key={i} style={{ position: "absolute", left: 50, right: 50, top: 470 + i * 150, height: 120, display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row-reverse", borderBottom: i < 2 ? "2px solid #EFEAE0" : undefined, ...enter(k, 20) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, flexDirection: "row-reverse" }}>
              <div style={{ width: 84, height: 84, borderRadius: 18, background: ok ? "#E6F1EA" : "#FBE3DE", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="drop" s={50} c={ok ? K.green : K.red} w={2} /></div>
              <Fa s={54} w={900} style={{ textDecoration: ok ? undefined : "line-through", textDecorationColor: K.red, textDecorationThickness: 5 }}>{s}</Fa>
            </div>
            <Badge ok={ok} s={64} k={spring(t, tt + 0.15, 0.3)} />
          </div>;
        })}
      </Card>
    </>;
  } },
  // 12 · sealed bottled water and food in the fridge are safe
  { from: at(13), bg: "grid", tr: "drop", draw: (t) => {
    const b = spring(t, w(13, "بطری") - 0.2, 0.5, 0.25), f = spring(t, w(13, "یخچال") - 0.2, 0.5, 0.25);
    const ok = pop(t, w(13, "سالمه") - 0.1, 0.4);
    const chip = (k: number) => <div style={{ position: "absolute", left: "50%", bottom: 22, transform: `translateX(-50%) scale(${k})`, background: K.green, color: "#fff", fontFamily: FAF, fontWeight: 900, fontSize: 34, padding: "4px 26px", borderRadius: 40, direction: "rtl" }}>سالم</div>;
    return <>
      <Polaroid x={560} y={330} w={440} h={560} rot={4} k={b} label="آب بطری دربسته"><Bottle />{chip(ok)}</Polaroid>
      <Polaroid x={90} y={420} w={440} h={560} rot={-4} k={f} label="غذای یخچال"><Fridge k={ease.io(ramp(t, w(13, "یخچال") - 0.2, w(13, "یخچال") + 0.5))} />{chip(pop(t, w(13, "سالمه") + 0.1, 0.4))}</Polaroid>
    </>;
  } },
  // 13 · good news — radiation fades fast: 7 h later, 10× less
  { from: at(14), bg: "grid", tr: "whip", draw: (t) => {
    const chip = pop(t, w(14, "خوب") - 0.1, 0.4);
    const draw = ease.io(ramp(t, w(14, "تابش") - 0.2, w(14, "ساعت") + 0.3));
    const mark = ramp(t, w(14, "هفت") - 0.05, w(14, "هفت") + 0.4);
    const ten = pop(t, w(14, "ده") - 0.1, 0.4);
    return <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${chip})`, background: K.green, color: "#fff", fontFamily: FAF, fontWeight: 900, fontSize: 44, padding: "10px 40px", borderRadius: 60, direction: "rtl", boxShadow: SHADOW }}>زمان به نفع توئه</div>
      </div>
      <Card x={70} y={360} w={940} h={620} k={spring(t, at(14) + 0.1, 0.5, 0.2)}>
        <Fa s={34} w={800} c={K.ink2} style={{ position: "absolute", right: 40, top: 26 }}>شدت تابش</Fa>
        <div style={{ position: "absolute", left: 20, right: 20, top: 90, bottom: 20 }}><Decay draw={draw} mark={mark} /></div>
      </Card>
      <Sticky x={640} y={880} w={320} h={250} rot={5} k={ten} c="#F7C9C0">
        <Num s={110} c={K.red}>÷10</Num>
        <Fa s={34} w={800}>ده برابر کمتر</Fa>
      </Sticky>
    </>;
  } },
  // 14 · stay inside at least 24 h, until official news
  { from: at(15), bg: "lined", tr: "zoom", draw: (t) => {
    const fill = ease.io(ramp(t, w(15, "بیست") - 0.1, w(15, "بمون") + 0.4));
    const pill = pop(t, w(15, "رسمی") - 0.25, 0.4);
    return <>
      <Card x={190} y={260} w={700} h={760} k={spring(t, at(15), 0.5, 0.2)} r={40}>
        <div style={{ position: "absolute", left: 130, top: 70, width: 440, height: 440 }}>
          <Ring s={440} k={fill} c={K.blue} w={30} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Num s={190} c={K.blue} style={{ transform: `scale(${1 + 0.12 * hit(t, w(15, "بیست"), 0.3)})` }}>24</Num>
            <Fa s={46} w={800} c={K.ink2}>ساعت داخل</Fa>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 580, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${pill})`, display: "flex", alignItems: "center", gap: 16, background: K.blue, color: "#fff", borderRadius: 60, padding: "14px 34px", flexDirection: "row-reverse" }}>
            <Fa s={40} w={900} c="#fff">تا خبر رسمی</Fa><Ico n="radio" s={48} c="#fff" w={2} />
          </div>
        </div>
      </Card>
    </>;
  } },
  // 15 · recap: flash → drop · 15 min → inside · 24 h → stay
  { from: at(16), bg: "grid", tr: "slide", draw: (t) => {
    const items: [React.ReactNode, string, number][] = [
      [<Ico n="sun" s={110} c={K.red} w={2} />, "نور دیدی؟ دراز بکش", w(16, "نور")],
      [<Num s={110} c={K.red}>15</Num>, "دقیقه وقت داری بری داخل", w(16, "پونزده")],
      [<Num s={110} c={K.blue}>24</Num>, "ساعت داخل بمون", WORDS.filter((q) => q.si === 16).find((q) => q.w.startsWith("بیست"))!.s],
    ];
    return <>
      <Head fa="فقط همین یادت بمونه" en="REMEMBER · 3 NUMBERS" k={spring(t, at(16), 0.5, 0.2)} />
      {items.map(([ic, s, tt], i) => {
        const k = pop(t, tt - 0.15, 0.42);
        const live = ramp(t, tt - 0.1, tt + 0.2) * (i < 2 ? 1 - ramp(t, items[i + 1][2] - 0.1, items[i + 1][2] + 0.2) : 1);
        return <Card key={i} x={110} y={400 + i * 250} w={860} h={210} k={k} rot={[-1.5, 1, -0.5][i]} style={{ outline: live > 0.5 ? `4px solid ${K.ink}` : undefined }}>
          <div style={{ position: "absolute", right: 30, top: 0, bottom: 0, width: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</div>
          <Fa s={46} w={900} style={{ position: "absolute", right: 240, top: 70 }}>{s}</Fa>
        </Card>;
      })}
    </>;
  } },
  // 16 · send this to someone you love
  { from: at(17), bg: "grid", tr: "iris", draw: (t) => {
    const ph = spring(t, at(17), 0.5, 0.2);
    const go = ramp(t, w(17, "بفرست") - 0.1, w(17, "بفرست") + 0.8);
    const N = 8;
    return <>
      <div style={{ position: "absolute", left: 390, top: 430, width: 300, height: 560, borderRadius: 54, border: `10px solid ${K.ink}`, background: "#fff", boxShadow: SHADOW, transform: `scale(${0.7 + 0.3 * ph})`, opacity: clamp(ph * 2), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 18, width: 90, height: 22, borderRadius: 20, background: K.ink }} />
        <div style={{ transform: `translate(${go * 40}px, ${-go * 40}px) rotate(${go * 10}deg)` }}><Ico n="send" s={140} w={1.6} /></div>
      </div>
      {Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const k = pop(t, w(17, "کسی") + i * 0.12, 0.35);
        const ok = t > w(17, "بفرست") + 0.15 + i * 0.08;
        const x = 540 + Math.cos(a) * 400, y = 710 + Math.sin(a) * 430;
        return <div key={i} style={{ position: "absolute", left: x - 55, top: y - 55, width: 110, height: 110, borderRadius: 110, background: "#fff", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})` }}>
          <Ico n={i % 3 === 1 ? "heart" : "user"} s={56} c={i % 3 === 1 ? K.red : K.ink2} w={1.8} />
          {ok && <Badge s={38} k={spring(t, w(17, "بفرست") + 0.15 + i * 0.08, 0.3)} style={{ position: "absolute", right: -6, top: -6 }} />}
        </div>;
      })}
    </>;
  } },
];
SCENES.forEach((s, i) => { if (i && s.from <= SCENES[i - 1].from) throw new Error(`scene ${i} starts too early`); });
const sceneAt = (t: number) => { let i = 0; while (i + 1 < SCENES.length && t >= SCENES[i + 1].from) i++; return i; };

// ───────────────────────── transitions ─────────────────────────
const IN = 0.42, OUT = 0.2;
const inStyle = (tr: Tr, k: number): React.CSSProperties => {
  const e = ease.out(k);
  switch (tr) {
    case "zoom": return { transform: `scale(${lerp(0.82, 1, e)})`, opacity: clamp(k * 2.5) };
    case "slide": return { transform: `translateX(${lerp(-W, 0, e)}px) rotate(${lerp(-4, 0, e)}deg)` };
    case "whip": return { transform: `translateX(${lerp(W, 0, e)}px)`, filter: k < 1 ? `blur(${(1 - e) * 24}px)` : undefined };
    case "drop": return { transform: `translateY(${lerp(-H * 0.8, 0, ease.back(k, 1.2))}px) rotate(${lerp(6, 0, e)}deg)` };
    case "iris": return { transform: `scale(${lerp(1.15, 1, e)})`, opacity: clamp(k * 2) };
    case "tear": return { transform: `translateX(${lerp(-80, 0, e)}px)`, opacity: clamp(k * 2) };
    default: return {};
  }
};
const outStyle = (tr: Tr, q: number): React.CSSProperties => {
  const e = ease.in(q);
  switch (tr) {
    case "zoom": return { transform: `scale(${1 + 0.35 * e})`, opacity: 1 - e };
    case "slide": return { transform: `translateX(${W * e}px) rotate(${4 * e}deg)` };
    case "whip": return { transform: `translateX(${-W * e}px)`, filter: q > 0 ? `blur(${e * 24}px)` : undefined };
    case "drop": return { transform: `translateY(${H * 0.6 * e}px)`, opacity: 1 - e };
    case "iris": return { transform: `scale(${1 - 0.2 * e})`, opacity: 1 - e };
    case "tear": return { transform: `translateX(${W * 0.6 * e}px)`, opacity: 1 - e };
    default: return {};
  }
};

const Background: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const cur = SCENES[i], prev = SCENES[i - 1];
  const k = ramp(t, cur.from, cur.from + 0.5);
  const same = !prev || prev.bg === cur.bg;
  const clip = same || k >= 1 ? undefined : cur.tr === "tear" ? jag(ease.io(k), cur.bg === "blue") : cur.tr === "iris" ? `circle(${ease.io(k) * 120}% at 50% 40%)` : `inset(0 ${(1 - ease.io(k)) * 100}% 0 0)`;
  // slow drift so the paper is never static
  const drift = { backgroundPosition: `${Math.sin(t * 0.2) * 20}px ${-t * 6}px` };
  return <>
    {!same && k < 1 && <AbsoluteFill style={{ ...BG[prev.bg], ...drift }} />}
    <AbsoluteFill style={{ ...BG[cur.bg], ...drift, clipPath: clip }} />
  </>;
};

// ───────────────────────── captions ─────────────────────────
const SHOW: Record<string, string> = { "پونزده": "۱۵", "نود": "۹۰", "درصد": "٪", "هفت": "۷", "ده": "۱۰", "بیست": "۲۴" };
const HIDE = new Set(["15:چهار", "16:چهار", "15:و", "16:و"]);
const KEYS = new Set(["نجات", "هسته‌ای", "سه", "داخل", "خبر", "نگاش", "نکن", "دراز", "بپوشون", "پنجره‌ها", "پونزده", "غبار", "فرار", "پناهگاه", "آجری", "بتنی", "زیرزمین", "وسط", "کولر", "نود", "درصد", "نرم‌کننده", "سالمه", "ضعیف", "ده", "بیست", "بفرست"]);
type Chunk = { a: number; b: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let a = 0;
  WORDS.forEach((q, i) => {
    const n = WORDS[i + 1];
    const brk = !n || n.si !== q.si || /[،.؟!؛:]$/.test(q.w) || i - a >= 5;
    if (brk) { out.push({ a, b: i }); a = i + 1; }
  });
  return out;
})();
const Captions: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => {
  const ci = CHUNKS.findIndex((c, i) => {
    const nx = CHUNKS[i + 1];
    const end = nx ? Math.min(WORDS[c.b].e + 0.7, WORDS[nx.a].s - 0.06) : WORDS[c.b].e + 1.2;
    return t >= WORDS[c.a].s - 0.08 && t < end;
  });
  if (ci < 0) return null;
  const { a, b } = CHUNKS[ci];
  const items: { i: number; txt: string; key: boolean }[] = [];
  for (let i = a; i <= b; i++) {
    const q = WORDS[i], bw = bare(q.w);
    if (HIDE.has(`${q.si}:${bw}`) && WORDS.slice(Math.max(0, i - 2), i).some((x) => bare(x.w) === "بیست")) continue;
    let txt = SHOW[bw] ? q.w.replace(bw, SHOW[bw]) : q.w;
    if (bw === "نود" && bare(WORDS[i + 1]?.w ?? "") === "درصد") { txt = "۹۰٪"; items.push({ i, txt, key: true }); i++; continue; }
    items.push({ i, txt, key: KEYS.has(bw) });
  }
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1330, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 2, maxWidth: 960, direction: "rtl", padding: "14px 34px", borderRadius: 26, background: dark ? "rgba(12,28,60,.72)" : "rgba(255,255,255,.88)", boxShadow: "0 8px 30px rgba(0,0,0,.10)" }}>
        {items.map(({ i, txt, key }) => {
          const k = ease.out(ramp(t, WORDS[i].s - 0.06, WORDS[i].s + 0.14));
          return <span key={i} style={{ fontFamily: FAF, fontWeight: key ? 900 : 700, fontSize: 56, color: key ? (dark ? K.yellow : K.red) : dark ? "#fff" : K.ink, opacity: 0.15 + 0.85 * k, transform: `translateY(${(1 - k) * 10}px)`, display: "inline-block", whiteSpace: "nowrap" }}>{txt}</span>;
        })}
      </div>
    </div>
  );
};

// ───────────────────────── frame ─────────────────────────
const TopBar: React.FC<{ t: number; i: number; dark: boolean }> = ({ t, i, dark }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 90, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <Mono s={18} c={dark ? "#9FC0F0" : K.ink3}>{`CIVIL DEFENSE · ${String(i + 1).padStart(2, "0")}/${SCENES.length}`}</Mono>
    <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
      <Trefoil s={36} c={dark ? "#fff" : K.ink} bg={dark ? K.blue2 : K.yellow} />
      <span style={{ fontFamily: FAF, fontWeight: 800, fontSize: 28, color: dark ? "#fff" : K.ink }}>راهنمای اضطراری</span>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 50, height: 4, borderRadius: 4, background: dark ? "rgba(255,255,255,.15)" : "rgba(30,36,48,.08)" }}>
      <div style={{ width: `${(t / TOTAL) * 100}%`, height: "100%", borderRadius: 4, background: dark ? K.yellow : K.red }} />
    </div>
  </div>
);

const Frame: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const i = sceneAt(t);
  const sc = SCENES[i], next = SCENES[i + 1];
  const to = next ? next.from : TOTAL + 1;
  const kin = ramp(t, sc.from, sc.from + IN);
  const qout = next ? ramp(t, to - OUT, to) : 0;
  const st = kin < 1 && sc.tr !== "cut" ? inStyle(sc.tr, kin) : qout > 0 ? outStyle(next!.tr, qout) : {};
  const push = 1 + 0.035 * ramp(t, sc.from, to);
  const dark = sc.bg === "blue";
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: K.paper }}>
      <Background t={t} i={i} />
      <AbsoluteFill style={{ transform: `scale(${push}) translateY(${Math.sin(t * 0.7) * 5}px)`, transformOrigin: "50% 40%" }}>
        <AbsoluteFill style={st}>{sc.draw(t)}</AbsoluteFill>
      </AbsoluteFill>
      <TopBar t={t} i={i} dark={dark} />
      <Captions t={t} dark={dark} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,25,0,.16) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile("v27/grain.png")})`, backgroundPosition: `${(frame * 137) % 512}px ${(frame * 211) % 512}px`, opacity: 0.07, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  useV23Fonts();
  const frame = useCurrentFrame();
  return <>
    <Frame t={frame / FPS} frame={frame} />
    {audio && <Html5Audio src={staticFile(audio)} />}
  </>;
};
const Look: React.FC<{ times: number[] }> = ({ times }) => {
  useV23Fonts();
  const frame = useCurrentFrame();
  const t = times[Math.min(frame, times.length - 1)];
  return <Frame t={t} frame={Math.round(t * FPS)} />;
};
// one still per scene (its busiest moment) + a few transitions
const LOOK = [0.6, 5.6, w(2, "سالم") + 0.6, w(3, "گوش") + 0.8, w(4, "نکن") + 0.4, w(5, "بپوشون") + 0.5, w(6, "بگیر") + 0.3, w(7, "داری") + 0.4, w(8, "نیست") + 0.3,
  w(9, "امن‌تر") + 0.3, w(10, "خاموش") + 0.5, at(11) + 0.2, w(11, "آلودگی") + 0.5, w(12, "نزن") + 0.2, w(13, "سالمه") + 0.5, w(14, "کمتر") + 0.3, w(15, "بیاد"), E(16) + 0.2, TOTAL - 0.3,
  at(9) + 0.25, at(4) + 0.15];

export const V27: React.FC = () => (
  <>
    <Composition id="V27" component={Video} durationInFrames={V27_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v27/mix-norm.wav" }} />
    <Composition id="V27-Silent" component={Video} durationInFrames={V27_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V27-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
