// Video 23 scenes — «دنگ‌گیر», one per sentence. Scene area y ≈ 860–1720 (ledger above, captions at 600, status pill at 1752).
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Burst, FloatUp, floatStyle, Rings } from "../styles/receipt-ui/fx";
import { Cursor, fr, Phone, Stamp } from "../styles/receipt-ui/kit";
import { C, clamp, easeBack, easeOut, fa, ramp, rnd, T } from "../styles/receipt-ui/theme";
import { EMOJI, FA_UI, Person, Stars } from "../v06/art";
import { E, TM } from "./times";

export type SP = { from: number };
const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (sec: number) => fr(sec - from) };
};
const pop = (f: number, a: number, d = 9) => ramp(f, a, a + d, easeBack);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const wob = (f: number, a: number, amp = 10) => (f < a || f > a + 18 ? 0 : Math.sin((f - a) * 2.4) * amp * Math.exp(-(f - a) / 5));
const Emo: React.FC<{ children: string; size?: number; style?: React.CSSProperties }> = ({ children, size = 40, style }) => <span style={{ fontFamily: EMOJI, fontSize: size, ...style }}>{children}</span>;
const GREEN = "#1fae6a";

/** Round avatar: Reza (orange) / you (blue). */
const Avatar: React.FC<{ who?: "reza" | "you" | "mom"; size?: number; label?: string; ring?: string }> = ({ who = "reza", size = 64, label, ring }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: who === "reza" ? "linear-gradient(135deg,#ff9f43,#e8590c)" : who === "mom" ? "linear-gradient(135deg,#c77dff,#7b2cbf)" : `linear-gradient(135deg,#6ea0ff,${C.blue})`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: ring ? `0 0 0 ${size * 0.06}px ${ring}` : undefined, position: "relative", overflow: "hidden" }}>
    {label ? <span style={{ fontFamily: FONT_TEXT, color: "#fff", fontSize: size * 0.2, textAlign: "center", lineHeight: 1.2, direction: "rtl", padding: 4 }}>{label}</span>
      : <Emo size={size * 0.56}>{who === "reza" ? "😎" : who === "mom" ? "👩‍🦳" : "🙂"}</Emo>}
  </div>
);

/** Chat bubble; me = right side blue (RTL app → my messages on the left like Telegram fa? keep: me left/blue, them right/gray). */
const Bubble: React.FC<{ a: number; me?: boolean; children: React.ReactNode; time?: string; seen?: boolean; size?: number; mode?: "light" | "dark" }> = ({ a, me, children, time, seen, size = 26, mode = "light" }) => (
  <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", margin: "8px 0", opacity: a > 0 ? 1 : 0, transform: `scale(${0.6 + 0.4 * a}) translateY(${(1 - a) * 20}px)`, transformOrigin: me ? "100% 100%" : "0 100%" }}>
    <div style={{ maxWidth: "78%", background: me ? C.blue : mode === "dark" ? "#2a2a30" : "#ffffff", color: me || mode === "dark" ? "#fff" : "#111", borderRadius: 24, padding: "12px 20px 8px", fontSize: size, lineHeight: 1.5,
      boxShadow: "0 6px 16px rgba(0,0,0,.12)", direction: "rtl", fontFamily: FONT_TEXT }}>
      {children}
      {(time || seen !== undefined) && <div style={{ fontSize: size * 0.6, opacity: 0.65, textAlign: "left", direction: "ltr" }}>{time} {seen !== undefined && <span style={{ color: seen ? "#7fd0ff" : "inherit" }}>{seen ? "✓✓" : "✓"}</span>}</div>}
    </div>
  </div>
);

/* 0 · dark · café: the bill lands, friend "remembers" his wallet is in the car */
export const Sc0: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const bill = ramp(f, at(TM.bill) - 4, at(TM.bill) + 10, easeOut);
  const pat = f >= at(TM.remember) ? Math.sin(f * 1.6) * 8 * Math.exp(-(f - at(TM.remember)) / 30) : 0;
  const bubble = pop(f, at(TM.wallet) - 4, 10);
  const slide = ramp(f, at(TM.car), at(TM.car) + 14, easeOut);
  return (
    <>
      {/* warm café light */}
      <div style={{ position: "absolute", left: 140, top: 820, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,186,90,.22), transparent 65%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {/* hanging lamp */}
        <path d="M540 820 V900" stroke="#555" strokeWidth="4" />
        <path d={`M480 940 Q540 880 600 940 Z`} fill="#d9a14a" transform={`rotate(${Math.sin(f / 30) * 3} 540 900)`} />
        {/* friend */}
        <g transform={`translate(${pat} 0)`}><Person x={740} y={1290} s={2.3} f={f} color="#e8590c" skin="#e0b896" seed={2} /></g>
        {/* me (back view, blue) */}
        <Person x={300} y={1360} s={2.0} f={f} color={C.blue} skin="#c99c78" seed={5} />
        {/* table */}
        <rect x={60} y={1470} width={960} height={40} rx={14} fill="#7a4a2a" />
        <rect x={60} y={1505} width={960} height={210} fill="#5b351d" />
        <g><ellipse cx={420} cy={1468} rx={46} ry={10} fill="#eee" /><rect x={396} y={1420} width={48} height={46} rx={8} fill="#f5f5f5" /><path d="M444 1430 q22 4 0 26" stroke="#f5f5f5" strokeWidth="7" fill="none" /></g>
        <g><path d="M630 1468 l120 0 l-60 -40 Z" fill="#f2b84b" /><circle cx={672} cy={1452} r="6" fill="#c0392b" /><circle cx={700} cy={1458} r="5" fill="#c0392b" /></g>
      </svg>
      {/* the bill on a little tray slides from the friend to you */}
      <div style={{ position: "absolute", left: lerp(640, 330, slide), top: lerp(1340, 1380, slide) + (1 - bill) * -200, opacity: bill, transform: `rotate(${lerp(8, -6, slide)}deg)`, ...FA_UI }}>
        <div style={{ width: 170, background: "#f7f3ea", borderRadius: 6, padding: "10px 14px", boxShadow: "0 12px 24px rgba(0,0,0,.4)", fontSize: 20, color: "#222" }}>
          <div style={{ textAlign: "center" }}>کافه · صورت‌حساب</div>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 6, background: "#ccc", margin: "8px 0", width: `${90 - i * 15}%` }} />)}
          <div style={{ fontFamily: FONT_NUM, fontSize: 30, color: C.red, textAlign: "center" }}>۹۸۰٬۰۰۰</div>
        </div>
      </div>
      {/* "oh! my wallet's in the car" */}
      <div style={{ position: "absolute", left: 560, top: 860, width: 440, transform: `scale(${bubble}) rotate(${wob(f, at(TM.wallet), 4)}deg)`, transformOrigin: "60% 100%", ...FA_UI }}>
        <div style={{ background: "#fff", color: "#111", borderRadius: 30, padding: "16px 24px", fontSize: 32, lineHeight: 1.5, boxShadow: "0 16px 40px rgba(0,0,0,.4)" }}>
          وای! کیف پولم تو ماشین مونده <Emo size={34}>🙄</Emo>
        </div>
        <div style={{ width: 0, height: 0, marginLeft: 200, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "24px solid #fff" }} />
      </div>
      {f >= at(TM.remember) && <div style={{ position: "absolute", left: 820, top: 1010, transform: `scale(${pop(f, at(TM.remember))}) rotate(${Math.sin(f / 4) * 10}deg)` }}><Emo size={70}>💡</Emo></div>}
      <div style={{ position: "absolute", left: 650, top: 1640, background: "#e8590c", color: "#fff", borderRadius: 14, padding: "4px 16px", fontSize: 28, transform: `scale(${pop(f, at(TM.friend))})`, ...FA_UI }}>رفیقت · رضا</div>
    </>
  );
};

/* 1 · light · chat: "I'll card-to-card tonight" for 3 months */
const PROMISES: [string, string][] = [["۱۲ مرداد", "شب کارت به کارت می‌کنم 🙏"], ["۳ شهریور", "شب حتماً می‌زنم داداش"], ["۲۱ شهریور", "امشب دیگه قطعی ✌️"], ["۱۹ مهر", "شب کارت به کارت می‌کنم 🙏"]];
export const Sc1: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const days = Math.round(90 * ramp(f, at(TM.months) - 6, at(TM.c2c) + 10));
  const enter = ramp(f, 0, 14, easeOut);
  const tStarts = [at(TM.months) - 6, at(TM.says), at(TM.night), at(TM.c2c)];
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 880, width: 840, height: 760, borderRadius: 40, background: "#e7ebf0", boxShadow: T.light.shadow, overflow: "hidden", opacity: enter, transform: `translateY(${(1 - enter) * 60}px)` }}>
        <div style={{ height: 96, background: "#fff", display: "flex", alignItems: "center", gap: 18, padding: "0 28px", direction: "rtl", ...FA_UI }}>
          <Avatar size={62} />
          <div><div style={{ fontSize: 30 }}>رضا</div><div style={{ fontSize: 20, color: "#8d8d94" }}>آخرین بازدید: همین الان</div></div>
        </div>
        <div style={{ padding: "16px 26px" }}>
          {PROMISES.map(([d, t], i) => (
            <div key={i}>
              <div style={{ textAlign: "center", margin: "6px 0", opacity: ramp(f, tStarts[i], tStarts[i] + 6) }}><span style={{ background: "rgba(0,0,0,.12)", borderRadius: 14, padding: "2px 14px", fontSize: 20, fontFamily: FONT_TEXT, color: "#555" }}>{d}</span></div>
              <Bubble a={pop(f, tStarts[i] + 3)} time="23:58">{t}</Bubble>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 760, top: 830, width: 230, transform: `rotate(6deg) scale(${pop(f, at(TM.months) - 6, 12)})`, ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,.18)", textAlign: "center" }}>
          <div style={{ background: C.red, color: "#fff", fontSize: 24, padding: "6px 0" }}>در انتظار واریز</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 92, color: C.red, lineHeight: 1.2 }}>{fa(days)}</div>
          <div style={{ fontSize: 24, color: "#666", paddingBottom: 10 }}>روز</div>
        </div>
      </div>
    </>
  );
};

/* 2 · dark · open «دنگ‌گیر», scan the café invoice */
export const Sc2: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 16, easeOut);
  const logo = pop(f, at(TM.name), 12);
  const cam = ramp(f, at(TM.invoice) - 6, at(TM.invoice) + 6, easeOut);
  const scanned = f >= at(TM.scan) + 10;
  return (
    <>
      <Rings x={540} y={1250} f={f} every={30} n={3} color={GREEN} r0={220} r1={480} />
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateY(${(1 - enter) * -30}deg) translateY(${(1 - enter) * 90}px)`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 2, 6) }}>
          <Phone x={338} y={870} s={0.92} screen="linear-gradient(170deg,#0d6b43 0%,#1fae6a 60%,#7be3ad 100%)">
            {/* splash */}
            <div style={{ position: "absolute", left: 0, top: 190, width: 412, textAlign: "center", opacity: 1 - cam, ...FA_UI }}>
              <div style={{ width: 160, height: 160, margin: "0 auto", borderRadius: 44, background: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,.3)", transform: `scale(${logo}) rotate(${(1 - logo) * -30}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Emo size={86}>💸</Emo>
              </div>
              <div style={{ color: "#fff", fontSize: 54, marginTop: 26, opacity: logo }}>دنگ‌گیر</div>
              <div style={{ color: "rgba(255,255,255,.85)", fontSize: 22, opacity: logo }}>دنگ رفیقت رو، با عشق، به زور بگیر</div>
            </div>
            {/* camera scanning the invoice */}
            {cam > 0 && (
              <div style={{ position: "absolute", inset: 0, background: "#111", opacity: cam }}>
                <div style={{ position: "absolute", left: 70, top: 170, width: 272, height: 440, background: "#f7f3ea", transform: `rotate(-3deg)`, padding: 20, boxSizing: "border-box", ...FA_UI, color: "#222" }}>
                  <div style={{ textAlign: "center", fontSize: 24 }}>کافه رفقا</div>
                  {[["اسپرسو × ۲", "۱۸۰"], ["پیتزا پپرونی", "۳۶۰"], ["کیک شکلاتی", "۱۴۰"], ["لاته × ۲", "۲۲۰"], ["آب معدنی", "۸۰"]].map(([a, b], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 19, margin: "12px 0", color: scanned ? "#222" : "#555" }}><span>{a}</span><span style={{ fontFamily: FONT_NUM }}>{b}</span></div>
                  ))}
                  <div style={{ borderTop: "2px dashed #999", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 22 }}><span>جمع</span><span style={{ fontFamily: FONT_NUM, color: C.red }}>۹۸۰٬۰۰۰</span></div>
                </div>
                {[[50, 150], [362, 150], [50, 630], [362, 630]].map(([x, y], i) => (
                  <div key={i} style={{ position: "absolute", left: x - (i % 2 ? 40 : 0), top: y - (i >= 2 ? 40 : 0), width: 40, height: 40, borderColor: scanned ? GREEN : "#fff", borderStyle: "solid", borderWidth: `${i < 2 ? 5 : 0}px ${i % 2 ? 5 : 0}px ${i >= 2 ? 5 : 0}px ${i % 2 ? 0 : 5}px` }} />
                ))}
                {!scanned && <div style={{ position: "absolute", left: 50, top: 150 + ((f * 12) % 480), width: 312, height: 5, background: GREEN, boxShadow: `0 0 18px ${GREEN}` }} />}
                {scanned && <div style={{ position: "absolute", left: 0, top: 680, width: 412, textAlign: "center", color: "#7be3ad", fontSize: 32, transform: `scale(${pop(f, at(TM.scan) + 10)})`, ...FA_UI }}>✓ فاکتور خونده شد · ۵ قلم</div>}
              </div>
            )}
          </Phone>
        </div>
      </div>
      <Burst x={540} y={1300} f={f} at={at(TM.scan) + 10} n={18} colors={[GREEN, "#fff", "#7be3ad"]} />
    </>
  );
};

/* 3 · light · AI splits who ate what — even the slice he "just tasted" */
const ITEMS: { t: string; who: "you" | "reza"; amt: string }[] = [
  { t: "اسپرسو × ۲", who: "you", amt: "۱۸۰" }, { t: "پیتزا پپرونی", who: "reza", amt: "۳۶۰" }, { t: "لاته × ۲", who: "reza", amt: "۲۲۰" }, { t: "کیک شکلاتی", who: "you", amt: "۱۴۰" },
];
export const Sc3: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const pz = pop(f, at(TM.slice) - 4, 12);
  const test = pop(f, at(TM.test));
  const result = pop(f, at(TM.testEnd) - 2, 10);
  const assign = (i: number) => pop(f, at(TM.who) + i * 5);
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 880, width: 920, opacity: enter, transform: `translateY(${(1 - enter) * 50}px)`, ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 34, boxShadow: T.light.shadow, padding: "22px 30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28 }}>
            <span><Emo size={30}>🤖</Emo> تقسیم هوشمند</span>
            <span style={{ fontSize: 20, color: GREEN, background: "#e6f7ee", borderRadius: 12, padding: "2px 12px", opacity: pop(f, at(TM.ai)) }}>دقت ۹۹٫۸٪</span>
          </div>
          {ITEMS.map((it, i) => {
            const a = assign(i);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1.5px solid #eee", fontSize: 28 }}>
                <span>{it.t}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: FONT_NUM, color: "#666" }}>{it.amt}</span>
                  <span style={{ transform: `scale(${a})`, display: "inline-block" }}><Avatar who={it.who} size={52} /></span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* the slice he "only tasted" */}
      <div style={{ position: "absolute", left: 90, top: 1390, width: 520, transform: `scale(${pz}) rotate(${(1 - pz) * -15}deg)`, transformOrigin: "30% 50%", ...FA_UI }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff7e6", border: `4px dashed ${C.red}`, borderRadius: 30, padding: "14px 20px" }}>
          <svg width={130} height={130} viewBox="-65 -65 130 130">
            <path d="M-50 -40 L50 -40 L0 55 Z" fill="#f2b84b" stroke="#c98b2a" strokeWidth="6" strokeLinejoin="round" />
            <path d="M-50 -40 L50 -40" stroke="#b5651d" strokeWidth="14" strokeLinecap="round" />
            {[[-18, -18], [14, -12], [-2, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill="#c0392b" />)}
            {/* bite */}
            <circle cx={0} cy={56} r={18} fill="#fff7e6" />
          </svg>
          <div>
            <div style={{ fontSize: 30 }}>«فقط تست کردم» <Emo size={30}>🤏</Emo></div>
            <div style={{ fontSize: 26, color: C.red, opacity: test }}>= ⅛ پیتزا = <span style={{ fontFamily: FONT_NUM }}>۴۵٬۰۰۰</span></div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 640, top: 1420, width: 360, transform: `scale(${result})`, opacity: result > 0 ? 1 : 0, ...FA_UI }}>
        <div style={{ background: "#e8590c", color: "#fff", borderRadius: 30, padding: "16px 20px", textAlign: "center", boxShadow: "0 18px 40px rgba(232,89,12,.35)" }}>
          <div style={{ fontSize: 26 }}>سهم رضا</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 64, lineHeight: 1.2 }}>۳۸۷٬۰۰۰</div>
        </div>
      </div>
      <Burst x={820} y={1500} f={f} at={at(TM.testEnd) - 2} n={14} colors={["#e8590c", "#ffb800", "#fff"]} />
    </>
  );
};

/* 4 · dark · a VERY polite reminder lands on Reza's lock screen */
export const Sc4: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 16, easeOut);
  const n = pop(f, at(TM.reminder) - 2, 12);
  const flowers = f >= at(TM.polite);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateX(${(1 - enter) * 20}deg) translateY(${(1 - enter) * 80}px)`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 3, 6) }}>
          <Phone x={338} y={870} s={0.92} screen="radial-gradient(ellipse at 50% 0%, #4a2d1a 0%, #120b08 75%)">
            <div style={{ position: "absolute", left: 0, top: 80, width: 412, textAlign: "center", color: "#fff", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 21, opacity: 0.8, ...FA_UI }}>گوشی رضا</div>
              <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 1.05 }}>23:58</div>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, top: 300, padding: "18px 20px", borderRadius: 26, background: "rgba(255,255,255,.88)", color: "#111", opacity: n > 0 ? 1 : 0, transform: `translateY(${(1 - n) * -60}px) scale(${0.9 + 0.1 * n})`, ...FA_UI }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#666" }}><span><Emo size={20}>💸</Emo> دنگ‌گیر</span><span>همین الان</span></div>
              <div style={{ fontSize: 24, lineHeight: 1.6, marginTop: 6 }}>رضا جان سلام <Emo size={22}>🌸</Emo> امیدوارم حالت عالی باشه. لطفاً <b style={{ color: C.red }}>۳۸۷٬۰۰۰ تومان</b> دنگ کافه رو هر وقت راحت بودی (امشب) واریز کن. مرسی که هستی <Emo size={22}>🙏</Emo></div>
            </div>
          </Phone>
        </div>
      </div>
      {flowers && Array.from({ length: 12 }, (_, i) => {
        const k = ((f - at(TM.polite)) / 60 + rnd(i)) % 1;
        return <div key={i} style={{ position: "absolute", left: 120 + rnd(i + 3) * 840, top: 1700 - k * 800, opacity: Math.sin(k * Math.PI), transform: `rotate(${f * 2 + i * 40}deg)` }}><Emo size={34 + rnd(i) * 20}>{["🌸", "🙏", "💐", "🌷"][i % 4]}</Emo></div>;
      })}
      <Rings x={540} y={1330} f={f} at={at(TM.reminder) - 2} color="#ffb3c7" r0={120} r1={420} n={2} />
    </>
  );
};

/* 5 · light · seen, no reply → profile photo becomes «من بدهکارم» */
export const Sc5: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const seen = f >= at(TM.seen) + 2;
  const swap = ramp(f, at(TM.change), at(TM.change) + 10, easeOut);
  const typing = f >= at(TM.seen) + 8 && f < at(TM.noAnswer) + 6;
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 880, width: 900, opacity: enter, transform: `translateY(${(1 - enter) * 50}px)`, ...FA_UI }}>
        <div style={{ background: "#e7ebf0", borderRadius: 34, padding: "18px 24px", boxShadow: T.light.shadow }}>
          <Bubble a={1} me time="23:58" seen={seen}>رضا جان سلام 🌸 لطفاً دنگ کافه رو…</Bubble>
          <div style={{ height: 40, fontSize: 22, color: "#8d8d94", padding: "0 10px" }}>
            {typing ? <>رضا در حال نوشتن{".".repeat(1 + (Math.floor(f / 6) % 3))}</> : f >= at(TM.noAnswer) + 6 ? <span style={{ color: C.red }}>رضا آفلاین شد</span> : ""}
          </div>
        </div>
      </div>
      {/* profile card */}
      <div style={{ position: "absolute", left: 190, top: 1130, width: 700, ...FA_UI, opacity: pop(f, at(TM.photo) - 6, 12), transform: `scale(${0.9 + 0.1 * pop(f, at(TM.photo) - 6, 12)})` }}>
        <div style={{ background: "#fff", borderRadius: 34, boxShadow: T.light.shadow, padding: 28, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", width: 200, height: 200 }}>
            <div style={{ position: "absolute", inset: 0, transform: `rotateY(${swap * 180}deg)`, backfaceVisibility: "hidden" }}><Avatar size={200} /></div>
            <div style={{ position: "absolute", inset: 0, transform: `rotateY(${180 - swap * 180}deg)`, backfaceVisibility: "hidden" }}>
              <div style={{ width: 200, height: 200, borderRadius: 100, background: C.red, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 10px ${C.redSoft}` }}>
                <Emo size={64}>💸</Emo><div style={{ fontSize: 34, lineHeight: 1.2 }}>من بدهکارم</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 40 }}>رضا</div>
            <div style={{ fontSize: 22, color: "#8d8d94", direction: "ltr", textAlign: "right" }}>@reza.cool</div>
            <div style={{ fontSize: 24, marginTop: 10, color: swap > 0.5 ? C.red : "#555" }}>{swap > 0.5 ? "بیو: به سامان ۳۸۷ تومن بدهکارم 🙃" : "بیو: زندگی کوتاهه ✌️"}</div>
          </div>
        </div>
      </div>
      <Burst x={290} y={1230} f={f} at={at(TM.change) + 10} n={18} colors={[C.red, "#fff", "#ffb3b5"]} />
      {swap > 0.5 && <FloatUp x={300} y={1100} f={f} at={at(TM.debtor)} text="👀 ۴۷ نفر دیدن" color={C.red} size={34} dur={40} />}
    </>
  );
};

/* 6 · dark · still no money → app calls his mom */
export const Sc6: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const connected = f >= at(TM.call) + 10;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - enter) * 100}px)`, opacity: enter }}>
        <Phone x={338} y={870} s={0.92} screen="linear-gradient(180deg,#2c1840,#120a1c)">
          <div style={{ position: "absolute", left: 0, top: 120, width: 412, textAlign: "center", color: "#fff", ...FA_UI }}>
            <div style={{ fontSize: 22, opacity: 0.7 }}>دنگ‌گیر · تماس خودکار</div>
            <div style={{ margin: "30px auto 20px", width: 170, transform: `scale(${1 + 0.04 * Math.sin(f / 4)})` }}><Avatar who="mom" size={170} /></div>
            <div style={{ fontSize: 44 }}>مامانِ رضا</div>
            <div style={{ fontSize: 24, opacity: 0.8, marginTop: 6, color: connected ? "#7be3ad" : "#fff" }}>{connected ? "وصل شد · ۰۰:۰۴" : `در حال تماس${".".repeat(1 + (Math.floor(f / 8) % 3))}`}</div>
          </div>
          <div style={{ position: "absolute", left: 0, top: 680, width: 412, display: "flex", justifyContent: "space-around" }}>
            {["🔇", "🔊", "📞"].map((e, i) => <div key={i} style={{ width: 84, height: 84, borderRadius: 42, background: i === 2 ? C.red : "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Emo size={36}>{e}</Emo></div>)}
          </div>
        </Phone>
      </div>
      {!connected && <Rings x={540} y={1170} f={f} every={18} n={3} color="#c77dff" r0={90} r1={330} />}
      {connected && (
        <div style={{ position: "absolute", left: 40, top: 900, width: 330, transform: `scale(${pop(f, at(TM.call) + 12)}) rotate(-4deg)`, transformOrigin: "100% 100%", ...FA_UI }}>
          <div style={{ background: "#fff", color: "#111", borderRadius: 26, padding: "14px 20px", fontSize: 26, lineHeight: 1.5 }}>سلام حاج‌خانوم، رضا دنگش رو نداده <Emo size={26}>😔</Emo></div>
        </div>
      )}
      {connected && (
        <div style={{ position: "absolute", left: 720, top: 1380, width: 320, transform: `scale(${pop(f, at(TM.call) + 26)}) rotate(4deg)`, transformOrigin: "0 0", ...FA_UI }}>
          <div style={{ background: "#7b2cbf", color: "#fff", borderRadius: 26, padding: "14px 20px", fontSize: 28, lineHeight: 1.5 }}>رضااا! بیا اینجا ببینم <Emo size={28}>🩴</Emo></div>
        </div>
      )}
    </>
  );
};

/* 7 · light · "my card has no balance" → the app takes it anyway (+ late fee) */
export const Sc7: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const excuse = pop(f, at(TM.noCharge) - 4);
  const drain = ramp(f, at(TM.take) - 6, at(TM.take) + 20, easeOut);
  const bal = Math.round(387 * (1 - drain));
  const fee = pop(f, at(TM.fine), 10);
  const done = f >= at(TM.late) + 6;
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 890, transform: `scale(${excuse}) rotate(-3deg)`, transformOrigin: "0 100%", ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 26, padding: "12px 22px", fontSize: 30, boxShadow: T.light.shadow, display: "flex", alignItems: "center", gap: 14 }}><Avatar size={48} /> <span>«کارتم شارژ نداره» <Emo size={28}>🥲</Emo></span></div>
      </div>
      {/* Reza's card */}
      <div style={{ position: "absolute", left: 80, top: 1050, width: 430, ...FA_UI, transform: `rotate(${-4 + wob(f, at(TM.take), 5)}deg)` }}>
        <div style={{ height: 270, borderRadius: 26, background: "linear-gradient(135deg,#ff9f43,#a0410a)", padding: 24, boxSizing: "border-box", color: "#fff", position: "relative", boxShadow: "0 24px 50px rgba(0,0,0,.25)" }}>
          <div style={{ fontSize: 24, opacity: 0.9 }}>کارت رضا</div>
          <div style={{ width: 64, height: 48, borderRadius: 10, background: "linear-gradient(135deg,#f5d77a,#c9a43e)", marginTop: 14 }} />
          <div style={{ fontSize: 22, marginTop: 20, opacity: 0.85 }}>موجودی «پنهان»</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 52 }}>{fa(bal)}٬۰۰۰</div>
        </div>
      </div>
      {/* your wallet */}
      <div style={{ position: "absolute", left: 580, top: 1120, width: 420, ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 30, padding: 24, boxShadow: T.light.shadow, border: done ? `3px solid ${GREEN}` : "3px solid transparent" }}>
          <div style={{ fontSize: 26 }}><Emo size={28}>👛</Emo> کیف پول تو</div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 58, color: GREEN }}>+{fa(Math.round(387 * drain + (fee > 0.5 ? 90 : 0)))}٬۰۰۰</div>
          <div style={{ fontSize: 24, color: C.red, opacity: fee, transform: `scale(${fee})`, transformOrigin: "100% 50%" }}>+ جریمه‌ی دیرکرد ۹۰٬۰۰۰ <Emo size={22}>⏰</Emo></div>
        </div>
      </div>
      {/* coins flying across */}
      {drain > 0 && drain < 1 && Array.from({ length: 10 }, (_, i) => {
        const k = clamp(drain * 1.6 - i * 0.06);
        if (k <= 0 || k >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: lerp(330, 760, k), top: lerp(1180, 1200, k) - Math.sin(k * Math.PI) * 180, transform: `rotate(${k * 360}deg)` }}><Emo size={46}>🪙</Emo></div>;
      })}
      <Stamp text="تا قِرون آخر" a={clamp((f - at(TM.last) - 4) / 10)} x={300} y={1460} size={52} rot={-8} />
      {done && <Stamp text="پرداخت شد ✓" a={clamp((f - at(TM.late) - 6) / 10)} x={790} y={1500} size={50} rot={6} color={GREEN} />}
      <Burst x={790} y={1220} f={f} at={at(TM.late) + 6} n={16} colors={[GREEN, "#ffd84d", "#fff"]} />
    </>
  );
};

/* 8 · dark · rate your friend */
export const Sc8: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const stars = ramp(f, at(TM.rate) - 6, at(TM.rate) + 4);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateX(${(1 - enter) * 25}deg) translateY(${(1 - enter) * 100}px)`, opacity: enter }}>
      <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 4, 6) }}>
        <Phone x={338} y={870} s={0.92} screen="#f6f7fb">
          <div style={{ position: "absolute", left: 0, top: 130, width: 412, textAlign: "center", ...FA_UI }}>
            <div style={{ width: 130, margin: "0 auto" }}><Avatar size={130} label={stars > 0.5 ? undefined : undefined} /></div>
            <div style={{ fontSize: 34, marginTop: 24, color: "#111" }}>به رضا چند ستاره می‌دی؟</div>
            <div style={{ fontSize: 21, color: "#888", marginTop: 6 }}>رفیق از ۱۳۹۲ · ۱۴ دنگ پرداخت‌نشده</div>
            <div style={{ marginTop: 40 }}><Stars filled={stars} size={58} /></div>
            <div style={{ fontSize: 24, color: C.red, marginTop: 20, opacity: stars }}>«رفیق خوبیه… ولی نه با پول» <Emo size={22}>😐</Emo></div>
          </div>
        </Phone>
        <Cursor x={432} y={1330} a={ramp(f, at(TM.rate) - 14, at(TM.rate) - 6)} click={clamp((f - at(TM.rate) + 6) / 14)} />
      </div>
    </div>
  );
};

/* 9 · light · twist: Reza removes YOU from «رفقا» */
const MEMBERS = ["علی", "سامان (تو)", "رضا", "مهدی", "امیر", "پویا"];
export const Sc9: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const rm = ramp(f, at(TM.removed), at(TM.removed) + 12, easeOut);
  return (
    <>
      <div style={{ position: "absolute", left: 110, top: 880, width: 860, opacity: enter, transform: `translateY(${(1 - enter) * 50}px)`, ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 34, boxShadow: T.light.shadow, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg,#6ea0ff,#2f6bff)", color: "#fff", padding: "20px 28px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}><Emo size={40}>👬</Emo></div>
            <div><div style={{ fontSize: 34 }}>گروه «رفقا»</div><div style={{ fontSize: 22, opacity: 0.85 }}>{fa(rm > 0.5 ? 5 : 6)} عضو</div></div>
          </div>
          <div style={{ padding: "6px 28px 12px" }}>
            {MEMBERS.map((m, i) => {
              const me = i === 1;
              const k = me ? rm : 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: me ? 78 * (1 - k) : 78, overflow: "hidden", opacity: 1 - k, transform: `scale(${1 - 0.3 * k})`, borderBottom: "1.5px solid #f0f0f0", background: me && f >= at(TM.moment) ? `rgba(229,72,77,${0.08 + 0.05 * Math.sin(f / 3)})` : "transparent" }}>
                  <Avatar who={i === 2 ? "reza" : me ? "you" : "you"} size={52} />
                  <span style={{ fontSize: 28 }}>{m}</span>
                  {i === 2 && <span style={{ marginRight: "auto", fontSize: 20, color: "#8d8d94" }}>ادمین</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 1620, transform: `translate(-50%,-50%) scale(${pop(f, at(TM.removed) + 4)})`, background: "rgba(0,0,0,.75)", color: "#fff", borderRadius: 24, padding: "10px 26px", fontSize: 30, whiteSpace: "nowrap", ...FA_UI }}>
        <Emo size={28}>🚪</Emo> رضا، سامان رو از گروه حذف کرد
      </div>
      <Burst x={300} y={1180} f={f} at={at(TM.removed) + 2} n={20} power={1.2} colors={["#bbb", "#fff", C.red]} />
    </>
  );
};

/* 10 · dark · the app's final message, slammed */
export const Sc10: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const type = f >= at(TM.sent) - 4;
  const slam = ramp(f, at(TM.punch) - 3, at(TM.punch) + 6, easeOut);
  const curse = pop(f, at(TM.curse) - 2, 8);
  const sent = f >= at(TM.curse) + 14;
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 880, width: 900, height: 820, borderRadius: 40, background: "#17171b", border: "2px solid rgba(255,255,255,.08)", overflow: "hidden", opacity: enter, ...FA_UI }}>
        <div style={{ height: 96, background: "#1f1f24", display: "flex", alignItems: "center", gap: 18, padding: "0 28px" }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><Emo size={34}>💸</Emo></div>
          <div><div style={{ fontSize: 30, color: "#fff" }}>دنگ‌گیر ← رضا</div><div style={{ fontSize: 20, color: "#8d8d94" }}>پیام خودکار · آخرین اخطار</div></div>
        </div>
        <div style={{ padding: "26px 30px" }}>
          <Bubble a={1} mode="dark">رضا جان سلام 🌸 لطفاً دنگ کافه رو…</Bubble>
          <Bubble a={1} mode="dark">رضا جان، یادآوری دوم 🙏</Bubble>
          <Bubble a={1} mode="dark">به مامانت گفتیم 😔</Bubble>
          {type && !(slam > 0) && <div style={{ color: "#8d8d94", fontSize: 24, margin: "16px 0" }}>دنگ‌گیر در حال نوشتن{".".repeat(1 + (Math.floor(f / 5) % 3))}</div>}
        </div>
      </div>
      {slam > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1420, transform: `translate(-50%,-50%) scale(${lerp(1.7, 1, slam)}) rotate(${lerp(-12, -3, slam)}deg)`, opacity: clamp(slam * 2), ...FA_UI }}>
          <div style={{ background: C.red, color: "#fff", borderRadius: 34, padding: "26px 44px", fontSize: 62, whiteSpace: "nowrap", boxShadow: slam > 0.95 ? "0 0 60px rgba(229,72,77,.6), 0 30px 60px rgba(0,0,0,.6)" : "none", textAlign: "center", lineHeight: 1.4 }}>
            دنگ رو بده،
            <div style={{ fontFamily: FONT_NUM, fontSize: 96, transform: `scale(${curse})`, opacity: curse > 0 ? 1 : 0 }}>مادرجنده! <Emo size={80}>💸</Emo></div>
          </div>
          <div style={{ textAlign: "left", color: "#7fd0ff", fontSize: 30, marginTop: 10, direction: "ltr", opacity: sent ? 1 : 0 }}>✓✓ seen</div>
        </div>
      )}
      <Burst x={540} y={1420} f={f} at={at(TM.curse) - 2} n={34} power={1.5} colors={[C.red, "#ffd84d", "#fff"]} />
      {sent && <Rings x={540} y={1420} f={f} at={at(TM.curse) + 14} color={C.red} r0={200} r1={520} n={2} />}
      <div style={{ position: "absolute", left: 540, top: 1640, transform: `translate(-50%,-50%) scale(${pop(f, fr(E(10) - from) + 6)})`, color: "#fff", fontSize: 34, whiteSpace: "nowrap", ...FA_UI }}>
        <Emo size={34}>💸</Emo> دنگ‌گیر · <span style={{ color: GREEN }}>رفاقت سر جاش، دنگ سر جاش</span>
      </div>
    </>
  );
};
