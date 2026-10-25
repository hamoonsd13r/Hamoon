// Video 06 — «توالت‌پرون» · vertical 1080×1920 · receipt-ui style · narration (ElevenLabs Brian v3, atempo 1.15) drives every cue.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Backdrop, Captions, fr, Smear } from "../styles/receipt-ui/kit";
import { C, clamp, FPS, Mode, T } from "../styles/receipt-ui/theme";
import { EMOJI } from "./art";
import { Sc0, Sc1, Sc2, Sc3, Sc4, Sc5, Sc6, Sc7, Sc8, Sc9, Sc10, Sc11, SP } from "./scenes";
import { S, TM, WORDS } from "./times";

const SCENES: { C: React.FC<SP>; mode: Mode; from: number; hits?: number[] }[] = [
  { C: Sc0, mode: "dark", from: 0, hits: [TM.nadari] },
  { C: Sc1, mode: "light", from: S(1), hits: [TM.karaj] },
  { C: Sc2, mode: "dark", from: S(2) },
  { C: Sc3, mode: "light", from: S(3) },
  { C: Sc4, mode: "dark", from: S(4), hits: [TM.land + 0.07] },
  { C: Sc5, mode: "light", from: S(5) },
  { C: Sc6, mode: "dark", from: S(6), hits: [TM.face] },
  { C: Sc7, mode: "light", from: S(7) },
  { C: Sc8, mode: "dark", from: S(8), hits: [TM.seal + 0.3, TM.minus] },
  { C: Sc9, mode: "light", from: S(9) },
  { C: Sc10, mode: "dark", from: S(10) },
  { C: Sc11, mode: "light", from: S(11), hits: [TM.star + 0.35] },
];
export const V06_END = TM.end + 1.5;
export const V06_FRAMES = fr(V06_END);
const until = (i: number) => (i + 1 < SCENES.length ? SCENES[i + 1].from : V06_END);

/* ───────── trip receipt (Persian) ───────── */
type Row = { at: number; label: string; amount: string; tone?: "red" | "blue" | "ink" };
const ROWS: Row[] = [
  { at: TM.chalus, label: "مسیر: جاده‌ی چالوس", amount: "۱۳ فروردین", tone: "ink" },
  { at: TM.nadari, label: "وضعیت مثانه", amount: "۹۸٪ پر", tone: "red" },
  { at: TM.karaj, label: "صف دستشویی", amount: "۹۲ کیلومتر", tone: "red" },
  { at: TM.request + 0.2, label: "درخواست توالت · اکونومی", amount: "۸۰٬۰۰۰", tone: "blue" },
  { at: TM.land + 0.1, label: "پرواز + فرود اضطراری", amount: "۱۸۰٬۰۰۰" },
  { at: TM.face, label: "شلنگ دفاعی × ۱", amount: "۲۵٬۰۰۰" },
  { at: TM.weigh + 0.5, label: "وزن خسارت · ۲٫۸ کیلو", amount: "۱۴۰٬۰۰۰" },
  { at: TM.fare, label: "کارواش (پیش‌پرداخت)", amount: "۵۵٬۰۰۰" },
];
const TOTAL = { at: TM.card, value: "۴۸۰٬۰۰۰ تومان" };

const TripReceipt: React.FC<{ t: number }> = ({ t }) => {
  const vis = ROWS.filter((r) => r.at <= t);
  const RH = 58;
  const printing = ROWS.some((r) => t - r.at >= 0 && t - r.at < 0.35);
  const bodyH = 120 + vis.length * RH + (t >= TOTAL.at ? 64 : 0) + 30;
  const offset = Math.min(0, 540 - bodyH);
  const w = 620;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2 + (printing ? Math.sin(t * 95) * 2.5 : 0), top: -12 + offset + (printing ? Math.sin(t * 70) * 3 : 0), width: w, fontFamily: FONT_TEXT, color: C.ink, direction: "rtl",
      filter: "drop-shadow(0 22px 30px rgba(0,0,0,.28))", transform: `rotate(${Math.sin(t * 0.9) * 0.6}deg)`, transformOrigin: "50% 0" }}>
      <div style={{ background: C.paper, padding: "34px 34px 26px", clipPath: "polygon(0 0,100% 0,100% calc(100% - 14px),96% 100%,92% calc(100% - 14px),88% 100%,84% calc(100% - 14px),80% 100%,76% calc(100% - 14px),72% 100%,68% calc(100% - 14px),64% 100%,60% calc(100% - 14px),56% 100%,52% calc(100% - 14px),48% 100%,44% calc(100% - 14px),40% 100%,36% calc(100% - 14px),32% 100%,28% calc(100% - 14px),24% 100%,20% calc(100% - 14px),16% 100%,12% calc(100% - 14px),8% 100%,4% calc(100% - 14px),0 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 34 }}><span style={{ fontFamily: EMOJI, fontSize: 30 }}>🚽</span> توالت‌پرون</span>
          <span style={{ fontSize: 20, opacity: 0.55 }}>رسید سفر · {printing ? "در حال چاپ…" : "شماره‌ی ۰۰۱۳"}</span>
        </div>
        <div style={{ borderTop: "2px dashed rgba(0,0,0,.3)", margin: "12px 0 6px" }} />
        {vis.map((r, i) => {
          const p = clamp((t - r.at) / 0.3);
          const col = r.tone === "blue" ? C.blue : r.tone === "ink" ? C.ink : C.red;
          return (
            <div key={i} style={{ height: RH * p, overflow: "hidden", opacity: p, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26 }}>
              <span>{r.label}</span>
              <span style={{ color: col, fontFamily: FONT_NUM, fontSize: 30 }}>{r.amount}</span>
            </div>
          );
        })}
        {t >= TOTAL.at && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, borderTop: "2px dashed rgba(0,0,0,.35)", paddingTop: 10, marginTop: 6, background: `rgba(229,72,77,${0.15 * Math.max(0, 1 - (t - TOTAL.at) * 1.5)})` }}>
            <span>جمع کل</span>
            <span style={{ color: C.red, fontFamily: FONT_NUM, fontSize: 38 }}>{TOTAL.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────── trip status pill ───────── */
const STATUS: [number, string, string, string?][] = [
  [0, "🚗", "ترافیک سنگین · ۰ کیلومتر بر ساعت", C.red],
  [TM.request + 0.2, "🔎", "دنبال نزدیک‌ترین پهپاد…"],
  [TM.find, "🚁", "توالت در راهه"],
  [TM.land + 0.1, "📍", "توالت رسید!", C.green],
  [TM.kar + 0.1, "🚽", "اشغال · ماموریت در جریان", C.red],
  [TM.seal, "🔒", "پلمب شد · سفر تموم شد"],
  [TM.fly, "🧽", "در راه کارواش"],
  [TM.rate, "⭐", "منتظر امتیاز تو"],
  [TM.toiletR, "😬", "امتیاز تو: ۲ از ۵", C.red],
];
const StatusPill: React.FC<{ t: number; mode: Mode }> = ({ t, mode }) => {
  const i = STATUS.findLastIndex((s) => s[0] <= t);
  const [at, icon, text, col = C.blue] = STATUS[i];
  const k = clamp((t - at) / 0.25);
  const th = T[mode];
  return (
    <div style={{ position: "absolute", left: 540 - 300, top: 1752, width: 600, height: 64, borderRadius: 32, background: th.card, boxShadow: th.shadow, overflow: "hidden", direction: "rtl", fontFamily: FONT_TEXT }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${clamp(t / TM.end) * 100}%`, background: `${col}22` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 27, color: th.text, transform: `translateY(${(1 - k) * 20}px)`, opacity: k }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: col, display: "inline-block", opacity: 0.5 + 0.5 * Math.sin(t * 8) }} />
        <span style={{ fontFamily: EMOJI, fontSize: 28 }}>{icon}</span>
        {text}
      </div>
    </div>
  );
};

const KEYS: Record<number, { keys?: string[]; reds?: string[]; icons?: Record<string, string> }> = {
  0: { keys: ["چالوس"], reds: ["طاقت"], icons: { سیزده: "🌱", ترافیک: "🚗", طاقت: "😖" } },
  1: { reds: ["کرج"], icons: { دستشویی: "🚻", کرج: "📍" } },
  2: { keys: ["«توالت‌پرون»"], icons: { "«توالت‌پرون»": "🚽", درخواست: "👆" } },
  3: { keys: ["پهپاد"], icons: { پهپاد: "🚁", بلندگو: "📢" } },
  4: { keys: ["هوش", "مصنوعی"], reds: ["برق"], icons: { مصنوعی: "🤖", برق: "⚡", فرود: "🛬" } },
  5: { keys: ["QR"], icons: { QR: "📲" } },
  6: { reds: ["سرک", "صورتش"], icons: { سرک: "👀", شلنگش: "🚿", صورتش: "💦" } },
  7: { keys: ["گوشیشونه"], icons: { گوشیشونه: "📱" } },
  8: { keys: ["پلمب"], reds: ["کارتت"], icons: { پلمب: "🔒", وزن: "⚖️", کارتت: "💳" } },
  9: { keys: ["کارواش"], icons: { کارواش: "🧽" } },
  10: { keys: ["امتیاز"], icons: { امتیاز: "⭐" } },
  11: { reds: ["دو", "ستاره"], icons: { توالت: "🚽", ستاره: "⭐" } },
};

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = SCENES.findLastIndex((s) => s.from <= t + 1e-6);
  const mode = SCENES[Math.max(0, idx)].mode;
  return (
    <AbsoluteFill>
      <TripReceipt t={t} />
      <Captions words={WORDS} t={t} mode={mode} keyMap={KEYS} y={600} size={64} />
      <StatusPill t={t} mode={mode} />
    </AbsoluteFill>
  );
};

const SceneBody: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const s = SCENES[i];
  const dur = fr(until(i)) - fr(s.from);
  return (
    <>
      <Backdrop mode={s.mode} f={f} />
      <Smear f={f} dur={dur} id={`sm${i}`} inF={i === 0 ? 0 : 7} hits={(s.hits ?? []).map((h) => fr(h - s.from))}>
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
export const V06_LOOK = [0.15, 3.2, 4.6, 7.4, 9.0, 11.2, 14.4, 16.2, 19.2, 22.4, 24.2, 25.7, 28.8, 32.4, 34.9, 38.4, 40.4, 41.9, 43.9, 47.4, 50.4, 52.6];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V06_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V06: React.FC = () => (
  <>
    <Composition id="V06" component={Video} durationInFrames={V06_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v06/mix.wav" }} />
    <Composition id="V06-Silent" component={Video} durationInFrames={V06_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V06-Look" component={Look} durationInFrames={V06_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
