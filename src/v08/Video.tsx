// Video 08 — «مهمون‌پرون» · vertical 1080×1920 · receipt-ui family, own look: plum night + amber lamp,
// a live «guest meter» on top, a midnight clock bar below. Narration (Brian v3, atempo 1.15) drives every cue.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { fr, Smear, Word } from "../styles/receipt-ui/kit";
import { clamp, easeBack, FPS, fa, ramp } from "../styles/receipt-ui/theme";
import { Emo, EMOJI, K, Mode, P, Room } from "./art";
import { Sc0, Sc1, Sc2, Sc3, Sc4, Sc5, Sc6, Sc7, Sc8, Sc9, SP } from "./scenes";
import { S, TM, WORDS } from "./times";

const SCENES: { C: React.FC<SP>; mode: Mode; from: number; hits?: number[] }[] = [
  { C: Sc0, mode: "night", from: 0, hits: [TM.dovom] },
  { C: Sc1, mode: "day", from: S(1), hits: [TM.chon] },
  { C: Sc2, mode: "night", from: S(2), hits: [TM.bezan + 0.1] },
  { C: Sc3, mode: "night", from: S(3) },
  { C: Sc4, mode: "day", from: S(4), hits: [TM.yakh] },
  { C: Sc5, mode: "night", from: S(5), hits: [TM.roshan] },
  { C: Sc6, mode: "day", from: S(6), hits: [TM.khob, TM.baad + 0.2] },
  { C: Sc7, mode: "night", from: S(7) },
  { C: Sc8, mode: "night", from: S(8), hits: [TM.notif] },
  { C: Sc9, mode: "day", from: S(9), hits: [TM.back, TM.hastan + 0.3] },
];
export const V08_END = TM.end + 1.6;
export const V08_FRAMES = fr(V08_END);
const until = (i: number) => (i + 1 < SCENES.length ? SCENES[i + 1].from : V08_END);

/* ───────── guest meter (top) ───────── */
const LEAVE: [number, number, string][] = [
  [0, 3, "صفر به این ور"], [TM.dovom, 1, "میوه‌ی دوم اومد"], [TM.bezan + 0.2, 6, "عملیات شروع شد"], [TM.dir, 9, "تاریکی؟ عادیه"],
  [TM.serv + 0.3, 15, "پتو پیدا کردن"], [TM.pakhsh, 4, "عاشق اخبارن!"], [TM.baad + 0.1, 92, "صدای مامان!"], [TM.pa, 99, "دم در…"],
  [TM.bye2 + 0.6, 100, "رفتن! ✓"], [TM.back, 0, "برگشتن!!"],
];
const GuestMeter: React.FC<{ t: number; mode: Mode }> = ({ t, mode }) => {
  const p = P[mode];
  const i = LEAVE.findLastIndex((r) => r[0] <= t);
  const [at, val, note] = LEAVE[i];
  const prev = i > 0 ? LEAVE[i - 1][1] : val;
  const k = ramp((t - at) * FPS, 0, 14, easeBack);
  const v = clamp(prev + (val - prev) * k, 0, 100);
  const col = v >= 90 ? K.mint : v >= 40 ? K.amber : K.red;
  const fruit = Math.round(14 + clamp((t - TM.dovom) / 30) * 24 + (t > TM.dovom ? 6 : 0));
  const teas = Math.round(9 + t / 4.5);
  const away = t >= TM.bye2 + 0.6 && t < TM.back;
  const guests = away ? 0 : 6;
  const modeOn = t >= TM.bezan;
  const jolt = (t - at) * FPS < 12 ? Math.sin((t - at) * FPS * 2.2) * 6 * (1 - (t - at) * FPS / 12) : 0;
  const tile = (e: string, label: string, value: string, red?: boolean) => (
    <div style={{ flex: 1, background: mode === "night" ? "#30243f" : "#f6ecdd", borderRadius: 22, padding: "14px 10px", textAlign: "center" }}>
      <div><Emo size={34}>{e}</Emo></div>
      <div style={{ fontFamily: FONT_NUM, fontSize: 44, color: red ? K.red : p.text, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 20, color: p.sub }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 90, top: 60 + jolt, width: 900, fontFamily: FONT_TEXT, direction: "rtl" }}>
      <div style={{ background: p.card, borderRadius: 36, boxShadow: p.shadow, padding: "24px 28px", border: `2px solid ${p.line}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 34, color: p.text }}><Emo size={32}>🚪</Emo> مهمون‌سنج</span>
          <span style={{ fontSize: 20, color: modeOn ? K.amber : p.sub, background: modeOn ? K.amberSoft : "transparent", borderRadius: 14, padding: "4px 14px" }}>
            {modeOn ? "حالت: خداحافظی محترمانه 🙏" : "حالت: عادی"}
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: K.red, marginRight: 10, opacity: 0.5 + 0.5 * Math.sin(t * 7) }} />
          </span>
        </div>
        <div style={{ display: "flex", gap: 14, margin: "18px 0" }}>
          {tile("👥", "مهمون", fa(guests), guests > 0)}
          {tile("🍎", "میوه‌ی خورده‌شده", fa(fruit))}
          {tile("☕", "چایی", fa(teas))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 28, color: p.text }}>احتمال رفتن</span>
          <span style={{ fontSize: 22, color: col }}>{note}</span>
          <span style={{ fontFamily: FONT_NUM, fontSize: 50, color: col }}>{fa(Math.round(v))}٪</span>
        </div>
        <div style={{ height: 22, borderRadius: 11, background: mode === "night" ? "#30243f" : "#efe2cf", overflow: "hidden", marginTop: 6 }}>
          <div style={{ width: `${Math.max(2, v)}%`, height: "100%", borderRadius: 11, background: col, boxShadow: `0 0 20px ${col}` }} />
        </div>
      </div>
    </div>
  );
};

/* ───────── captions (amber selection, red alarm) ───────── */
const KEYS: Record<number, { keys?: string[]; reds?: string[]; icons?: Record<string, string> }> = {
  0: { keys: ["دوازده‌ی"], reds: ["هفت", "دوم"], icons: { شبه: "🌙", میوه‌ی: "🍎" } },
  1: { reds: ["برن"], keys: ["آبروت"], icons: { آبروت: "😇" } },
  2: { keys: ["«مهمون‌پرون»", "«خداحافظی", "محترمانه»"], icons: { "«مهمون‌پرون»": "🚪" } },
  3: { keys: ["چراغای"], icons: { چراغای: "💡", دیروقته: "🌚" } },
  4: { keys: ["قطب", "شمال"], reds: ["یخ‌زده"], icons: { کولر: "❄️", چایی: "🧊" } },
  5: { keys: ["تلویزیون"], reds: ["ترافیک"], icons: { تلویزیون: "📺", ترافیک: "🚗" } },
  6: { keys: ["مامانت"], icons: { بلندگوی: "🔊", مامانت: "👩‍🦳" } },
  7: { reds: ["چهل", "دقیقه"], icons: { در: "🚪" } },
  8: { keys: ["دو", "نیم،"], reds: ["نوتیف"], icons: { خوابت: "😴", نوتیف: "🔔" } },
  9: { reds: ["برگشتن،", "صبحونه"], icons: { کلید: "🔑", صبحونه: "🍳" } },
};
const Sel: React.FC<{ a: number; red: boolean; children: React.ReactNode }> = ({ a, red, children }) => {
  const c = red ? K.red : K.amber;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 14px" }}>
      <span style={{ position: "absolute", inset: "6px 0 2px", background: red ? K.redSoft : K.amberSoft, borderBottom: `6px solid ${c}`, borderRadius: 14, opacity: a, transform: `scaleX(${0.6 + 0.4 * a}) rotate(${red ? -1.5 : 1}deg)` }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};
const Captions: React.FC<{ t: number; mode: Mode }> = ({ t, mode }) => {
  const words = WORDS as Word[];
  const cur = [...words].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > TM.end + 0.6) return null;
  const km = KEYS[cur.si] ?? {};
  const sent = words.filter((w) => w.si === cur.si);
  const chunks: Word[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…»]$/.test(w.w) || c.length >= 5) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 3 && chunks[i - 1].length + chunks[i].length <= 7) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  const p = P[mode];
  return (
    <div style={{ position: "absolute", left: 60, top: 610, width: 960, textAlign: "center", direction: "rtl", fontFamily: FONT_TEXT, fontSize: 66, lineHeight: 1.45 }}>
      {chunk.map((w) => {
        if (w.s > t + 0.02) return <span key={w.wi} style={{ opacity: 0, margin: "0 9px" }}>{w.w}</span>;
        const age = t - w.s;
        const inA = clamp(age / 0.12);
        const bare = w.w.replace(/[،:.!؟…]$/, "");
        const red = (km.reds ?? []).some((k) => bare.includes(k));
        const key = red || (km.keys ?? []).some((k) => bare.includes(k));
        const isCur = w === cur || age < 0.25;
        const icon = Object.keys(km.icons ?? {}).find((k) => bare.includes(k));
        const ip = ramp(age * FPS, 0, 9, easeBack);
        const inner = <span style={{ color: isCur || key ? p.text : p.sub }}>{w.w}</span>;
        return (
          <span key={w.wi} style={{ display: "inline-block", opacity: inA, transform: `translateY(${(1 - inA) * 16}px) scale(${w === cur ? 1 + 0.06 * (1 - clamp(age / 0.2)) : 1})`, margin: "0 9px" }}>
            {icon && <span style={{ display: "inline-block", fontFamily: EMOJI, fontSize: 52, margin: "0 6px", transform: `scale(${ip}) rotate(${(1 - ip) * -40 + Math.sin(age * 5) * 6}deg)` }}>{km.icons![icon]}</span>}
            {key ? <Sel a={ramp(age * FPS, 0, 6, easeBack)} red={red}>{inner}</Sel> : inner}
          </span>
        );
      })}
    </div>
  );
};

/* ───────── midnight clock bar (bottom) ───────── */
const clockAt = (t: number) => {
  // minutes after midnight: 00:00 → 01:55 by the end of the door goodbye, then 02:30, then 02:31…
  if (t < TM.saat) return clamp(t / TM.saat) * 115;
  return 150 + (t - TM.saat) * 0.15;
};
const ClockBar: React.FC<{ t: number; mode: Mode }> = ({ t, mode }) => {
  const p = P[mode];
  const m = clockAt(t);
  const hh = Math.floor(m / 60), mm = Math.floor(m % 60);
  const left = 7 * 60 - m;
  const lh = Math.floor(left / 60), lm = Math.floor(left % 60);
  return (
    <div style={{ position: "absolute", left: 140, top: 1756, width: 800, height: 76, borderRadius: 38, background: p.card, boxShadow: p.shadow, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", direction: "rtl", fontFamily: FONT_TEXT, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(m / 420) * 100}%`, background: `${K.amber}22` }} />
      <span style={{ position: "relative", fontSize: 26, color: p.text }}><Emo size={28}>🌙</Emo> <span style={{ fontFamily: FONT_NUM, fontSize: 38, direction: "ltr", display: "inline-block" }}>{fa(String(hh).padStart(2, "0"))}:{fa(String(mm).padStart(2, "0"))}</span></span>
      <span style={{ position: "relative", fontSize: 24, color: left < 300 ? K.red : p.sub }}>تا زنگ ساعت: {fa(lh)} ساعت و {fa(lm)} دقیقه <Emo size={24}>⏰</Emo></span>
    </div>
  );
};

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = SCENES.findLastIndex((s) => s.from <= t + 1e-6);
  const mode = SCENES[Math.max(0, idx)].mode;
  return (
    <AbsoluteFill>
      <GuestMeter t={t} mode={mode} />
      <Captions t={t} mode={mode} />
      <ClockBar t={t} mode={mode} />
    </AbsoluteFill>
  );
};

const SceneBody: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const s = SCENES[i];
  const dur = fr(until(i)) - fr(s.from);
  return (
    <>
      <Room mode={s.mode} f={f} />
      <Smear f={f} dur={dur} id={`sm8-${i}`} inF={i === 0 ? 0 : 7} hits={(s.hits ?? []).map((h) => fr(h - s.from))}>
        <s.C from={s.from} />
      </Smear>
    </>
  );
};

const Video: React.FC<{ audio?: string }> = ({ audio }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((s, i) => (
      <Sequence key={i} from={fr(s.from)} durationInFrames={fr(until(i)) - fr(s.from)}>
        <SceneBody i={i} />
      </Sequence>
    ))}
    <Overlay />
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

// key stills for review (seconds)
export const V08_LOOK = [0.2, 2.6, 6.4, 7.9, 9.4, 10.8, 12.4, 14.6, 16.0, 18.4, 20.9, 23.0, 25.9, 27.6, 30.0, 32.6, 35.4, 38.4, 40.0, 42.0, 44.6, 47.0, 50.0, 51.6, 54.0, 56.4];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V08_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V08: React.FC = () => (
  <>
    <Composition id="V08" component={Video} durationInFrames={V08_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v08/mix.wav" }} />
    <Composition id="V08-Silent" component={Video} durationInFrames={V08_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V08-Look" component={Look} durationInFrames={V08_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
