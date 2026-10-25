// Video 08 scenes — one per sentence. Scene band y ≈ 860–1720 (guest meter above, captions at 600, clock bar at 1752).
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Burst, Rings } from "../styles/receipt-ui/fx";
import { Cursor, fr, Phone, Stamp } from "../styles/receipt-ui/kit";
import { clamp, easeBack, easeOut, fa, ramp, rnd } from "../styles/receipt-ui/theme";
import { Bubble, CAST, Chip, Emo, FA_UI, Guest, GuestLook, K, P, Sofa, Table } from "./art";
import { TM } from "./times";

export type SP = { from: number };
const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (sec: number) => fr(sec - from) };
};
const pop = (f: number, a: number, d = 9) => ramp(f, a, a + d, easeBack);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const COLORS = [K.amber, K.red, K.mint, "#fff2d6"];

const Band: React.FC<{ children: React.ReactNode; top?: number; h?: number }> = ({ children, top = 840, h = 890 }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height: h, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)" }}>
    <div style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }}>{children}</div>
  </div>
);
const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>;

/** The family on the sofa (4 seats). */
const SEATS = [-315, -105, 105, 315];
const Family: React.FC<{ f: number; y?: number; eyes?: (i: number) => React.ComponentProps<typeof Guest>["eyes"]; mouth?: (i: number) => React.ComponentProps<typeof Guest>["mouth"]; item?: (i: number) => React.ComponentProps<typeof Guest>["item"]; shiver?: number; blanket?: number; cast?: number[]; turn?: number }> = ({
  f, y = 1560, eyes = () => "open", mouth = (i) => (i % 2 ? "chew" : "smile"), item = (i) => (i % 2 ? "fruit" : "tea"), shiver = 0, blanket = 0, cast = [0, 1, 2, 3], turn = 0,
}) => (
  <Sofa x={540} y={y}>
    {SEATS.map((x, i) => (
      <Guest key={i} x={x} y={-24} look={CAST[cast[i]]} f={f} seed={i * 1.7} eyes={eyes(i)} mouth={mouth(i)} item={item(i)} shiver={shiver} blanket={clamp(blanket * 1.6 - i * 0.2)} turn={turn} />
    ))}
  </Sofa>
);

/** Wall clock with a ticking second hand. */
const WallClock: React.FC<{ x: number; y: number; f: number; h: number; m: number; r?: number }> = ({ x, y, f, h, m, r = 80 }) => {
  const sec = Math.floor(f / 6) * 6;
  const hand = (deg: number, len: number, w: number, c: string) => <path d={`M0 0 L${Math.sin((deg * Math.PI) / 180) * len} ${-Math.cos((deg * Math.PI) / 180) * len}`} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 10} fill={K.wood} /><circle r={r} fill="#fff7ea" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.sin((i * Math.PI) / 6) * r * 0.82} cy={-Math.cos((i * Math.PI) / 6) * r * 0.82} r={i % 3 ? 3 : 6} fill="#2a1d14" />)}
      {hand((h % 12) * 30 + m * 0.5, r * 0.5, 9, "#2a1d14")}
      {hand(m * 6, r * 0.75, 6, "#2a1d14")}
      {hand(sec, r * 0.8, 3, K.red)}
      <circle r={7} fill={K.red} />
    </g>
  );
};

/* 0 · night · midnight, work at 7, the second round of fruit arrives */
export const Sc0: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const refill = ramp(f, at(TM.mive), at(TM.dovom) + 4, easeBack);
  const bowl = f < at(TM.mive) ? 0.25 : lerp(0.25, 1, clamp(refill));
  return (
    <Band>
      <Svg>
        <WallClock x={540} y={1010} f={f} h={0} m={f / 60} r={90} />
        <Family f={f} />
        <Table x={540} y={1650} fill={bowl} teas={4} />
      </Svg>
      <Chip x={260} y={1010} a={pop(f, at(TM.twelve))} bg="#2b2140" color={P.night.text} size={36}><Emo size={32}>🌙</Emo> ۱۲ شب</Chip>
      <div style={{ position: "absolute", left: 820, top: 1010, transform: `translate(-50%,-50%) scale(${pop(f, at(TM.haft), 10)}) rotate(${Math.sin(f * 1.6) * (f > at(TM.haft) && f < at(TM.haft) + 30 ? 6 : 0)}deg)`, ...FA_UI }}>
        <div style={{ background: P.night.card, border: `2px solid ${K.red}`, borderRadius: 26, padding: "16px 24px", color: P.night.text, fontSize: 30, boxShadow: "0 0 36px rgba(255,90,106,.35)" }}>
          <Emo size={40}>⏰</Emo> <span style={{ fontFamily: FONT_NUM, fontSize: 44, color: K.red }}>۷:۰۰</span> صبح
          <div style={{ fontSize: 22, color: P.night.sub }}>جلسه با رئیس · دیر نکنی!</div>
        </div>
      </div>
      <Chip x={540} y={1250} a={pop(f, at(TM.dovom), 10)} bg={K.amber} color="#2a1d14" size={38} rot={-4}><Emo size={34}>🍎</Emo> دور دوم میوه!</Chip>
      <Burst x={480} y={1610} f={f} at={at(TM.dovom)} colors={COLORS} n={18} power={0.8} />
    </Band>
  );
};

/* 1 · day · you type "go home" … delete … "have some fruit 🙂" — the honour meter says it all */
const RUDE = "پاشید برید دیگه!";
const NICE = "بفرمایید میوه 🙂";
export const Sc1: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const p = P.day;
  const t1 = at(TM.rok), t2 = at(TM.chon), t3 = at(TM.aberoo) - 6;
  let text = "";
  let rude = false;
  if (f >= t1 && f < t2) { text = RUDE.slice(0, Math.floor((f - t1) * 1.1)); rude = true; }
  else if (f >= t2 && f < t3) { const k = Math.max(0, RUDE.length - Math.floor((f - t2) * 1.6)); text = RUDE.slice(0, k); rude = k > 0; }
  else if (f >= t3) text = [...NICE].slice(0, Math.floor((f - t3) * 1.2)).join("");
  const honour = f < t1 ? 100 : f < t2 ? lerp(100, 8, clamp((f - t1) / (t2 - t1))) : f < t3 ? lerp(8, 60, clamp((f - t2) / (t3 - t2))) : lerp(60, 100, clamp((f - t3) / 12));
  const danger = honour < 40;
  return (
    <Band>
      <Svg>
        <Guest x={250} y={1700} s={1.75} look={{ body: "#5a6b7d", skin: "#e2b48e", hair: "spiky", hairCol: "#2a1d14" }} f={f} eyes={danger ? "wide" : f >= t3 ? "happy" : "sleepy"} mouth={danger ? "o" : f >= t3 ? "smile" : "flat"} />
      </Svg>
      {/* composer */}
      <div style={{ position: "absolute", left: 120, top: 920, width: 840, transform: `translateY(${(1 - ramp(f, 0, 10, easeOut)) * 60}px)`, ...FA_UI }}>
        <div style={{ background: p.card, borderRadius: 34, boxShadow: p.shadow, padding: "22px 26px", border: `3px solid ${rude ? K.red : "transparent"}` }}>
          <div style={{ fontSize: 22, color: p.sub, marginBottom: 10 }}><Emo size={22}>💬</Emo> گروه خانوادگی · ۶ نفر آنلاین</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1, minHeight: 64, background: "#f3eadc", borderRadius: 22, padding: "10px 20px", fontSize: 40, color: rude ? K.red : p.text }}>
              {text}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: K.amber }}>|</span>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: rude ? "#ccc" : K.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff" }}>➤</div>
          </div>
        </div>
      </div>
      {/* honour meter */}
      <div style={{ position: "absolute", left: 640, top: 1240, width: 330, transform: `scale(${pop(f, 6, 10)}) rotate(${danger ? Math.sin(f * 1.7) * 3 : 0}deg)`, ...FA_UI }}>
        <div style={{ background: p.card, borderRadius: 30, boxShadow: danger ? "0 0 50px rgba(255,90,106,.45)" : p.shadow, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 30, color: p.text }}>آبرو‌سنج <Emo size={30}>{danger ? "😱" : "😇"}</Emo></div>
          <div style={{ height: 34, borderRadius: 17, background: "#efe4d4", margin: "14px 0", overflow: "hidden", direction: "ltr" }}>
            <div style={{ width: `${honour}%`, height: "100%", borderRadius: 17, background: danger ? K.red : `linear-gradient(90deg, ${K.amber}, ${K.mint})` }} />
          </div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 56, color: danger ? K.red : p.text }}>{fa(Math.round(honour))}٪</div>
          {danger && <div style={{ fontSize: 22, color: K.red }}>خطر: خاله ناراحت می‌شه!</div>}
        </div>
      </div>
      <Chip x={540} y={1150} a={f >= t2 && f < t2 + 22 ? pop(f, t2, 6) : 0} bg={K.red} color="#fff" size={34} rot={-3}>⌫ پاک کن! پاک کن!</Chip>
      <Burst x={800} y={1300} f={f} at={at(TM.aberoo) + 4} colors={COLORS} n={16} power={0.7} />
    </Band>
  );
};

/* 2 · night · the app: pick «polite goodbye» */
const MODES: [string, string, boolean?][] = [["😊", "مهمون‌نوازی کامل"], ["🙏", "خداحافظی محترمانه"], ["🔥", "حالت تهاجمی · نسخه‌ی پرو", true]];
export const Sc2: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const listOn = ramp(f, at(TM.baz), at(TM.baz) + 10, easeOut);
  const pick = f >= at(TM.bye);
  const tap = at(TM.bezan);
  const done = f >= tap + 4;
  const s = 0.92;
  return (
    <Band>
      <Rings x={540} y={1290} f={f} every={50} color={K.amber} r0={300} r1={520} n={2} />
      <Phone x={540 - 220 * s} y={880 + (1 - ramp(f, 0, 12, easeOut)) * 200} s={s} screen="#1b1426">
        {/* splash */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${K.plum}, #2a1c3d 55%, #3b2416)`, opacity: 1 - listOn, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...FA_UI }}>
          <div style={{ width: 170, height: 170, borderRadius: 44, background: K.amber, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, at(TM.name) - 2, 12)})`, boxShadow: "0 20px 50px rgba(255,181,71,.4)" }}>
            <Emo size={100}>🚪</Emo>
          </div>
          <div style={{ color: "#fff", fontSize: 50, marginTop: 26 }}>مهمون‌پرون</div>
          <div style={{ color: "#d9c8e8", fontSize: 22, marginTop: 6 }}>با احترام، ولی قاطع</div>
        </div>
        {/* modes */}
        <div style={{ position: "absolute", inset: 0, opacity: listOn, padding: "90px 26px 0", ...FA_UI }}>
          <div style={{ color: "#fff", fontSize: 34, marginBottom: 6 }}>حالت رو انتخاب کن</div>
          <div style={{ color: "#9d8fae", fontSize: 20, marginBottom: 24 }}>مهمونای فعلی: <span style={{ color: K.amber }}>۶ نفر · ۴ ساعت</span></div>
          {MODES.map(([e, label, locked], i) => {
            const on = i === 1 && pick;
            const a = ramp(f, at(TM.baz) + i * 3, at(TM.baz) + i * 3 + 9, easeBack);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 18px", marginBottom: 14, borderRadius: 22, background: on ? K.amberSoft : "#2a2038", border: `3px solid ${on ? K.amber : "transparent"}`, opacity: locked ? 0.5 : 1, transform: `translateX(${(1 - a) * -60}px) scale(${on ? 1.03 : 1})` }}>
                <Emo size={34}>{e}</Emo>
                <span style={{ color: "#fff", fontSize: 25, flex: 1 }}>{label}</span>
                {locked ? <Emo size={24}>🔒</Emo> : <span style={{ width: 26, height: 26, borderRadius: 13, border: `3px solid ${on ? K.amber : "#6a5d7a"}`, background: on ? K.amber : "transparent" }} />}
              </div>
            );
          })}
          <div style={{ marginTop: 30, padding: "22px 0", borderRadius: 26, textAlign: "center", fontSize: 30, color: done ? "#10241c" : "#2a1d14", background: done ? K.mint : K.amber, transform: `scale(${f >= tap && f < tap + 5 ? 0.94 : 1})` }}>
            {done ? "فعال شد ✓" : "شروع عملیات"}
          </div>
        </div>
      </Phone>
      <Cursor x={540} y={f < tap ? lerp(1700, 1560, ramp(f, tap - 14, tap - 2, easeOut)) : 1560} click={f >= tap && f < tap + 6 ? 1 : 0} a={ramp(f, tap - 16, tap - 10)} />
      <Burst x={540} y={1560} f={f} at={tap + 3} colors={COLORS} n={20} />
    </Band>
  );
};

/* 3 · night · the lights fade… their eyes keep shining */
export const Sc3: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const dim = ramp(f, at(TM.yavash), at(TM.dir), (t) => t);
  const pct = Math.round(lerp(100, 12, dim));
  const sway = Math.sin(f / 18) * 4;
  return (
    <Band>
      <Svg>
        {/* ceiling lamp */}
        <g transform={`rotate(${sway} 540 840)`}>
          <path d="M540 840 L540 960" stroke="#c9b9a0" strokeWidth={4} />
          <path d="M470 1010 Q540 930 610 1010 Z" fill={K.amber} />
          <ellipse cx={540} cy={1010} rx={70} ry={12} fill="#ffd690" opacity={1 - dim * 0.9} />
          <path d={`M480 1012 L330 1700 L750 1700 L600 1012 Z`} fill={`rgba(255,200,110,${0.16 * (1 - dim)})`} />
        </g>
        <Family f={f} eyes={() => (dim > 0.55 ? "glow" : "open")} />
        <rect x={0} y={840} width={1080} height={900} fill={`rgba(8,5,16,${dim * 0.78})`} />
        {dim > 0.55 && SEATS.map((x, i) => {
          const gx = 540 + x, gy = 1560 - 24 - 150 + Math.sin(f / 9 + i * 1.7) * 3 - 2;
          return <g key={i} opacity={clamp((dim - 0.55) * 4)}>
            <circle cx={gx - 14} cy={gy} r={10} fill={K.amber} opacity={0.4} /><circle cx={gx + 14} cy={gy} r={10} fill={K.amber} opacity={0.4} />
            <circle cx={gx - 14} cy={gy} r={5} fill="#fff6d8" /><circle cx={gx + 14} cy={gy} r={5} fill="#fff6d8" />
          </g>;
        })}
      </Svg>
      {/* brightness control */}
      <div style={{ position: "absolute", left: 640, top: 1100, width: 360, transform: `scale(${pop(f, 4, 10)})`, ...FA_UI }}>
        <div style={{ background: "rgba(37,28,51,.92)", borderRadius: 28, padding: "18px 22px", boxShadow: P.night.shadow }}>
          <div style={{ color: P.night.text, fontSize: 26 }}><Emo size={26}>💡</Emo> نور خونه</div>
          <div style={{ position: "relative", height: 16, borderRadius: 8, background: "#3a2d4a", margin: "18px 0 10px", direction: "ltr" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 8, background: K.amber }} />
            <div style={{ position: "absolute", left: `calc(${pct}% - 16px)`, top: -8, width: 32, height: 32, borderRadius: 16, background: "#fff" }} />
          </div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 40, color: K.amber }}>{fa(pct)}٪</div>
        </div>
      </div>
      <Chip x={300} y={1150} a={pop(f, at(TM.dir) + 6, 10)} bg="#2b2140" color={P.night.text} size={32}>مهمونا: هنوز نشستن <Emo size={30}>😐</Emo></Chip>
    </Band>
  );
};

/* 4 · day+ice · AC to North Pole, frozen tea — they just grab blankets */
export const Sc4: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const cold = ramp(f, at(TM.cooler), at(TM.shomal) + 6);
  const temp = Math.round(lerp(24, -12, cold));
  const blanket = ramp(f, at(TM.shomal) + 10, at(TM.chai) + 6, easeOut);
  const iced = f >= at(TM.yakh);
  const peng = ramp(f, at(TM.ghotb), at(TM.ghotb) + 70, (t) => t);
  return (
    <Band>
      <Svg>
        <rect x={0} y={840} width={1080} height={900} fill={`rgba(120,200,255,${0.32 * cold})`} />
        {/* AC unit */}
        <g transform="translate(540 930)">
          <rect x={-250} y={-50} width={500} height={110} rx={24} fill="#fbfbfb" stroke="#9fb3c2" strokeWidth={5} />
          <text x={-220} y={0} fontSize={26} fill="#7a8a98" fontFamily="Vazirmatn">کولر هوشمند</text>
          <rect x={-220} y={30} width={440} height={14} rx={7} fill="#cfd8de" />
          <circle cx={200} cy={-14} r={7} fill={cold > 0.1 ? "#3fb4ff" : "#ccc"} />
          {cold > 0.05 && Array.from({ length: 7 }, (_, i) => {
            const k = ((f * 0.05 + i / 7) % 1);
            return <path key={i} d={`M${-200 + i * 66} ${60 + k * 140} q 14 30 0 60`} stroke={K.ice} strokeWidth={5} fill="none" opacity={(1 - k) * cold} strokeLinecap="round" />;
          })}
        </g>
        {/* snow */}
        {Array.from({ length: 40 }, (_, i) => {
          const y = 860 + ((rnd(i) * 900 + f * (3 + rnd(i + 3) * 3)) % 900);
          const x = rnd(i + 9) * 1080 + Math.sin(f / 10 + i) * 12;
          return <text key={i} x={x} y={y} fontSize={22 + rnd(i + 1) * 22} fill="#ffffff" stroke="#6fb8e6" strokeWidth={1.5} opacity={cold}>❄</text>;
        })}
        <Family f={f} shiver={cold} blanket={blanket} eyes={(i) => (blanket > 0.5 ? (i === 2 ? "happy" : "open") : "wide")} mouth={(i) => (blanket > 0.5 ? "smile" : "o")} item={(i) => (i === 1 ? (iced ? "icetea" : "tea") : "none")} />
        <Table x={540} y={1660} fill={0.6} teas={4} ice={iced} />
      </Svg>
      <div style={{ position: "absolute", left: 540, top: 1080, transform: `translate(-50%,-50%) scale(${pop(f, at(TM.cooler), 10)})`, ...FA_UI }}>
        <div style={{ background: "#ffffff", borderRadius: 30, padding: "12px 30px", boxShadow: P.day.shadow, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 26, color: P.day.sub }}>دمای خونه</span>
          <span style={{ fontFamily: FONT_NUM, fontSize: 54, color: temp < 0 ? "#2a9be0" : P.day.text, direction: "ltr" }}>{temp < 0 ? "−" : ""}{fa(Math.abs(temp))}°</span>
          {temp < 0 && <span style={{ fontSize: 24, color: "#2a9be0" }}>حالت قطب شمال</span>}
        </div>
      </div>
      <div style={{ position: "absolute", left: lerp(-120, 1180, peng), top: 1690, fontFamily: "'Noto Color Emoji'", fontSize: 72, transform: `rotate(${Math.sin(f / 2.5) * 10}deg)`, opacity: f >= at(TM.ghotb) ? 1 : 0 }}>🐧</div>
      <Chip x={790} y={1460} a={pop(f, at(TM.yakh), 10)} bg="#e6f8ff" color="#185a85" size={32} rot={4}><Emo size={30}>🧊</Emo> چایی یخ‌زده</Chip>
      <Chip x={290} y={1300} a={pop(f, at(TM.serv) + 10, 10)} bg="#fff" color={P.day.text} size={30} rot={-3}>خاله: «پتو هست؟ مرسی!» <Emo size={28}>🥰</Emo></Chip>
    </Band>
  );
};

/* 5 · night · TV turns itself on: tomorrow's traffic news — they love it */
const TICKER = "همت: قفل کامل  ·  مدرس: پارکینگ  ·  نیایش: بیا پیاده برو  ·  چمران: فراموشش کن  ·  ";
export const Sc5: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const on = f >= at(TM.roshan);
  const news = f >= at(TM.akhbar);
  const flick = on && f < at(TM.roshan) + 6;
  const W = 720, H = 405, X = 540 - W / 2, Y = 900;
  return (
    <Band>
      <div style={{ position: "absolute", left: X - 22, top: Y - 22, width: W + 44, height: H + 44, borderRadius: 26, background: "#0c0a10", boxShadow: on ? "0 0 90px rgba(255,90,106,.25)" : "0 20px 50px rgba(0,0,0,.5)", transform: `scale(${pop(f, at(TM.tv) - 4, 10)})` }}>
        <div style={{ position: "absolute", left: 22, top: 22, width: W, height: H, borderRadius: 10, overflow: "hidden", background: on ? "#142033" : "#111" }}>
          {flick && <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(0deg, #fff2 0 3px, #0004 3px 6px)`, opacity: 0.9 }} />}
          {news && (
            <div style={{ position: "absolute", inset: 0, ...FA_UI }}>
              <svg width={W} height={H} style={{ position: "absolute" }}>
                {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-20 + i * 30} ${60 + i * 50} Q ${W / 2} ${40 + i * 70 + Math.sin(i) * 40} ${W + 20} ${80 + i * 45}`} stroke={i % 2 ? K.red : "#ff9a3a"} strokeWidth={12} fill="none" opacity={0.85} strokeDasharray={`${ramp(f, at(TM.akhbar) + i * 2, at(TM.traffic) + 10 + i * 2) * 900} 900`} />)}
                {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={120 + i * 120} cy={130 + (i % 2) * 90} r={10 + 4 * Math.sin(f / 4 + i)} fill={K.red} />)}
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, background: K.red, color: "#fff", fontSize: 30, padding: "8px 18px" }}>🔴 زنده · ترافیک فردا صبح</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 52, background: "#0c0a10", color: "#ffd8a0", fontSize: 26, overflow: "hidden", whiteSpace: "nowrap" }}>
                <div style={{ position: "absolute", right: -900 + ((f - at(TM.akhbar)) * 7) % 1800, top: 8 }}>{TICKER + TICKER}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Svg>
        {[0, 1, 2, 3].map((i) => (
          <Guest key={i} x={540 + SEATS[i] * 0.95} y={1740} s={0.95} look={CAST[[0, 4, 1, 5][i]]} f={f} seed={i} eyes={news ? "happy" : "open"} mouth={news ? (i === 1 ? "talk" : "smile") : "flat"} item={i === 2 ? "fruit" : "none"} />
        ))}
      </Svg>
      <Bubble x={430} y={1480} a={pop(f, at(TM.pakhsh), 10)} tail="right" bg={K.amber} size={34}>آخ جون، اخبار! <Emo size={30}>🍿</Emo></Bubble>
      <Bubble x={860} y={1430} a={pop(f, at(TM.pakhsh) + 14, 10)} tail="left" size={30}>عمو: «نیایش رو ببین!»</Bubble>
    </Band>
  );
};

/* 6 · day · the house speaker, in Mom's voice */
export const Sc6: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const talking = f >= at(TM.khob);
  const wave = (i: number) => (talking ? 18 + 50 * Math.abs(Math.sin(f / 2.6 + i * 0.8)) * (0.5 + rnd(i + Math.floor(f / 3)) * 0.5) : 6);
  const shock = f >= at(TM.baad) + 6;
  return (
    <Band>
      <Rings x={540} y={1290} f={f} every={30} color={K.amber} r0={140} r1={430} n={3} at={at(TM.khob)} />
      <Svg>
        <g transform={`translate(540 1300) scale(${pop(f, at(TM.speaker) - 4, 12)})`}>
          <ellipse cx={0} cy={190} rx={150} ry={20} fill="rgba(90,50,10,.16)" />
          <rect x={-120} y={-170} width={240} height={360} rx={110} fill="#3a2d4a" />
          <rect x={-104} y={-150} width={208} height={320} rx={96} fill="url(#mesh)" />
          <defs><pattern id="mesh" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#2a2038" /></pattern></defs>
          <ellipse cx={0} cy={-150} rx={80} ry={14} fill={talking ? K.amber : "#6a5d7a"} opacity={0.9} />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-90 + i * 22} y={-wave(i) / 2 + 10} width={12} height={wave(i)} rx={6} fill={K.amber} opacity={talking ? 1 : 0.4} />)}
        </g>
      </Svg>
      <Chip x={540} y={940} a={pop(f, at(TM.seda), 10)} bg={P.day.card} color={P.day.text} size={30}><Emo size={28}>🔊</Emo> صدا: مامان <Emo size={28}>👩‍🦳</Emo> · نسخه‌ی اصل</Chip>
      <Bubble x={540} y={1110} a={pop(f, at(TM.khob), 10)} w={720} bg={K.amber} size={46}>«خب دیگه، ایشالا دفعه‌ی بعد!»</Bubble>
      {[[170, 1560, 0], [910, 1560, 1]].map(([x, y, i]) => (
        <React.Fragment key={i}>
          <Svg><Guest x={x} y={y + 120} s={0.9} look={CAST[i === 0 ? 2 : 1]} f={f} seed={i} eyes={shock ? "wide" : "open"} mouth={shock ? "o" : "smile"} turn={i === 0 ? 1 : -1} /></Svg>
          <div style={{ position: "absolute", left: x - 20, top: y - 230 - pop(f, at(TM.baad) + 6 + i * 3, 8) * 20, fontFamily: FONT_NUM, fontSize: 90, color: K.red, opacity: shock ? 1 : 0, transform: `rotate(${i ? 12 : -12}deg)` }}>!</div>
        </React.Fragment>
      ))}
    </Band>
  );
};

/* 7 · night · at the door: a 40-minute goodbye */
const BYES = ["خب دیگه…", "قربونت برم", "حتماً بیاید!", "نه، شما بیاید!", "سلام برسون", "پس کی میاید؟", "زحمت دادیم", "خب دیگه…"];
export const Sc7: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const t0 = at(TM.faghat), t1 = at(TM.bye2) + 18;
  const mins = f < t0 ? 0 : lerp(0, 40, clamp((f - t0) / (t1 - t0)));
  const stand = ramp(f, at(TM.pa) - 4, at(TM.pa) + 8, easeBack);
  const bi = Math.floor(f / 9) % BYES.length;
  const bx = [250, 500, 760][Math.floor(f / 9) % 3];
  return (
    <Band>
      <Svg>
        {/* doorway */}
        <rect x={720} y={980} width={300} height={720} rx={8} fill="#0c0912" stroke={K.wood} strokeWidth={22} />
        <rect x={720} y={980} width={300} height={720} fill="rgba(255,190,110,.10)" />
        <path d={`M1020 980 L${1020 + 90} 1010 L${1020 + 90} 1700 L1020 1700 Z`} fill={K.wood} />
        <circle cx={1090} cy={1360} r={10} fill={K.amber} />
        {/* shoes */}
        {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={760 + (i % 5) * 50} cy={1700 - Math.floor(i / 5) * 18} rx={24} ry={10} fill={["#2a1d14", "#7a3f52", "#3c5a7a", "#d79a3a"][i % 4]} />)}
        {[0, 1, 2, 3].map((i) => (
          <Guest key={i} x={180 + i * 165} y={lerp(1640, 1700, stand)} s={0.95} look={CAST[[2, 0, 1, 3][i]]} f={f} seed={i} eyes={f > t0 + 40 ? (i % 2 ? "sleepy" : "happy") : "happy"} mouth={(Math.floor(f / 9) + i) % 3 === 0 ? "talk" : "smile"} bob={2} />
        ))}
      </Svg>
      <Bubble x={bx} y={1340} a={f >= at(TM.pa) ? clamp(((f % 9) + 1) / 3) : 0} bg={bi % 2 ? "#fff" : K.amber} size={32}>{BYES[bi]}</Bubble>
      <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%,-50%) scale(${pop(f, t0 - 4, 10)})`, ...FA_UI }}>
        <div style={{ background: P.night.card, borderRadius: 30, padding: "14px 30px", boxShadow: P.night.shadow, textAlign: "center", border: `2px solid ${mins > 30 ? K.red : "transparent"}` }}>
          <div style={{ fontSize: 24, color: P.night.sub }}><Emo size={24}>⏱</Emo> خداحافظی دم در</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 70, color: mins > 30 ? K.red : K.amber, direction: "ltr" }}>{fa(String(Math.floor(mins)).padStart(2, "0"))}:{fa(String(Math.floor((mins % 1) * 60)).padStart(2, "0"))}</div>
        </div>
      </div>
    </Band>
  );
};

/* 8 · night · 2:30, finally asleep… ping */
export const Sc8: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const ping = at(TM.notif);
  const lit = f >= ping - 4;
  const shake = f >= ping && f < ping + 18 ? Math.sin((f - ping) * 2.4) * 8 : 0;
  return (
    <Band>
      <Svg>
        <rect x={0} y={840} width={1080} height={900} fill="rgba(5,3,10,.55)" />
        {/* window + moon */}
        <rect x={110} y={900} width={260} height={220} rx={10} fill="#1d2440" stroke="#3a2d4a" strokeWidth={12} />
        <circle cx={300} cy={960} r={34} fill="#f3e6c4" /><circle cx={286} cy={952} r={30} fill="#1d2440" />
        {/* bed */}
        <rect x={120} y={1460} width={760} height={150} rx={30} fill="#4a3a66" />
        <rect x={140} y={1400} width={190} height={90} rx={40} fill="#efe6f5" />
        <path d="M300 1440 Q560 1360 860 1450 L860 1520 L300 1520 Z" fill="#7a3f52" />
        <g transform="translate(240 1430)">
          <circle r={46} fill="#e2b48e" />
          <path d="M-46 -6 L-40 -38 L-22 -30 L-10 -48 L4 -32 L18 -50 L28 -32 L44 -40 L46 -6 Q20 -22 -46 -6 Z" fill="#2a1d14" />
          <path d={lit ? "M-24 -4 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M8 -4 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" : "M-24 -2 h14 M10 -2 h14"} stroke="#2a1d14" strokeWidth={4} fill={lit ? "#fff" : "none"} />
          {lit && <><circle cx={-16} cy={-4} r={3.5} fill="#2a1d14" /><circle cx={16} cy={-4} r={3.5} fill="#2a1d14" /><ellipse cx={0} cy={22} rx={8} ry={10} fill="#5a1e1e" /></>}
        </g>
        {!lit && [0, 1, 2].map((i) => { const k = ((f / 40 + i / 3) % 1); return <text key={i} x={300 + k * 120 + i * 10} y={1360 - k * 160} fontSize={40 + k * 30} fill="#d9c8e8" opacity={1 - k} fontWeight={800}>Z</text>; })}
        {/* nightstand + phone */}
        <rect x={900} y={1480} width={140} height={130} rx={12} fill={K.wood} />
        <g transform={`translate(${970 + shake} 1460)`}>
          <rect x={-30} y={-16} width={60} height={22} rx={6} fill="#111" />
          {lit && <ellipse cx={0} cy={-30} rx={90} ry={60} fill="rgba(255,181,71,.25)" />}
          {lit && <rect x={-26} y={-13} width={52} height={16} rx={4} fill={K.amber} />}
        </g>
      </Svg>
      <Chip x={760} y={960} a={pop(f, at(TM.saat), 10)} bg="#1d1630" color={P.night.text} size={36}><Emo size={32}>🕑</Emo> <span style={{ fontFamily: FONT_NUM, fontSize: 46, color: K.amber }}>۲:۳۰</span></Chip>
      <div style={{ position: "absolute", left: 150, top: 1120, width: 780, transform: `translateY(${(1 - ramp(f, ping, ping + 8, easeBack)) * -120}px)`, opacity: f >= ping ? 1 : 0, ...FA_UI }}>
        <div style={{ background: "rgba(40,30,56,.95)", borderRadius: 30, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", border: `3px solid ${K.red}`, boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: K.amber, display: "flex", alignItems: "center", justifyContent: "center" }}><Emo size={44}>🚪</Emo></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, color: "#a99bb8" }}>مهمون‌پرون · همین الان</div>
            <div style={{ fontSize: 32, color: "#fff" }}><Emo size={28}>🚨</Emo> هشدار سطح قرمز</div>
          </div>
        </div>
      </div>
    </Band>
  );
};

/* 9 · day · they're back for the key… and breakfast */
const MENU: [string, string][] = [["نون سنگک", "× ۶"], ["پنیر، گردو، سبزی", "کامل"], ["املت مخصوص", "× ۶"], ["چایی تازه‌دم", "∞"], ["ناهار؟", "شاید…"]];
export const Sc9: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const p = P.day;
  const keyUp = pop(f, at(TM.key), 10);
  const menuAt = at(TM.sobhoone);
  return (
    <Band>
      <Svg>
        <rect x={60} y={980} width={320} height={720} rx={8} fill="#fff4e0" stroke={K.wood} strokeWidth={22} />
        <path d={`M60 980 L${60 - 60} 1010 L${60 - 60} 1700 L60 1700 Z`} fill={K.wood} />
        {[0, 1, 2].map((i) => (
          <Guest key={i} x={140 + i * 120} y={1700} s={0.85 - i * 0.04} look={CAST[[1, 0, 4][i]]} f={f} seed={i} eyes="happy" mouth={i === 0 && f < menuAt ? "talk" : "smile"} item={i === 0 ? "key" : "none"} bob={2} />
        ))}
      </Svg>
      <Chip x={220} y={1060} a={keyUp} bg={K.amber} color="#2a1d14" size={32} rot={-5}><Emo size={30}>🔑</Emo> کلید ماشین!</Chip>
      {/* breakfast order card */}
      <div style={{ position: "absolute", left: 470, top: 960, width: 560, transform: `translateX(${(1 - ramp(f, menuAt - 8, menuAt + 4, easeOut)) * 700}px) rotate(2deg)`, ...FA_UI }}>
        <div style={{ background: p.card, borderRadius: 30, boxShadow: p.shadow, padding: "24px 28px" }}>
          <div style={{ fontSize: 32, color: p.text }}><Emo size={30}>🍳</Emo> سفارش صبحونه · ۶ نفر</div>
          <div style={{ borderTop: `2px dashed ${p.line}`, margin: "12px 0" }} />
          {MENU.map(([a, b], i) => {
            const k = ramp(f, menuAt + 4 + i * 5, menuAt + 10 + i * 5, easeBack);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 28, padding: "8px 0", opacity: clamp(k), transform: `translateX(${(1 - k) * -40}px)`, color: i === 4 ? K.red : p.text }}>
                <span>{a}</span><span style={{ fontFamily: FONT_NUM, fontSize: 32, color: i === 4 ? K.red : "#c27b16" }}>{b}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Stamp text="صبحونه هم هستن 😵" a={ramp(f, at(TM.hastan) + 4, at(TM.hastan) + 14)} x={720} y={1600} rot={-7} size={50} color={K.red} />
      <Burst x={720} y={1600} f={f} at={at(TM.hastan) + 8} colors={COLORS} n={26} />
    </Band>
  );
};

export type { GuestLook };
export { FONT_TEXT };
