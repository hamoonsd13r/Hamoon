// Video 23 — «دُنگ‌گیر» · vertical 1080×1920 · same language as V06 (receipt-ui) · narration (ElevenLabs Brian v3, atempo 1.17) drives every cue.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Backdrop, Captions, fr, Smear } from "../styles/receipt-ui/kit";
import { C, clamp, FPS, Mode, T } from "../styles/receipt-ui/theme";
import { EMOJI } from "../v06/art";
import { Sc0, Sc1, Sc2, Sc3, Sc4, Sc5, Sc6, Sc7, Sc8, Sc9, Sc10, SP } from "./scenes";
import { S, TM, WORDS } from "./times";

const SCENES: { C: React.FC<SP>; mode: Mode; from: number; hits?: number[] }[] = [
  { C: Sc0, mode: "dark", from: 0, hits: [TM.wallet] },
  { C: Sc1, mode: "light", from: S(1) },
  { C: Sc2, mode: "dark", from: S(2) },
  { C: Sc3, mode: "light", from: S(3), hits: [TM.test] },
  { C: Sc4, mode: "dark", from: S(4) },
  { C: Sc5, mode: "light", from: S(5), hits: [TM.change + 0.33] },
  { C: Sc6, mode: "dark", from: S(6) },
  { C: Sc7, mode: "light", from: S(7), hits: [TM.take] },
  { C: Sc8, mode: "dark", from: S(8) },
  { C: Sc9, mode: "light", from: S(9), hits: [TM.removed] },
  { C: Sc10, mode: "dark", from: S(10), hits: [TM.punch, TM.curse - 0.07] },
];
export const V23_END = TM.end + 1.5;
export const V23_FRAMES = fr(V23_END);
const until = (i: number) => (i + 1 < SCENES.length ? SCENES[i + 1].from : V23_END);

/* ───────── trip receipt (Persian) ───────── */
type Row = { at: number; label: string; amount: string; tone?: "red" | "blue" | "ink" };
const ROWS: Row[] = [
  { at: TM.bill + 0.3, label: "صورت‌حساب کافه", amount: "۹۸۰٬۰۰۰", tone: "ink" },
  { at: TM.car + 0.3, label: "کیف پول رضا", amount: "تو ماشین 🙄", tone: "red" },
  { at: TM.c2c, label: "قول «شب کارت به کارت»", amount: "۹۰ روز", tone: "red" },
  { at: TM.testEnd, label: "سهم رضا (با تیکه پیتزا)", amount: "۳۸۷٬۰۰۰", tone: "blue" },
  { at: TM.send, label: "یادآوری مؤدبانه", amount: "سین شد", tone: "ink" },
  { at: TM.debtor, label: "عکس پروفایل رضا", amount: "«بدهکارم»", tone: "red" },
  { at: TM.call + 0.2, label: "تماس با مامانِ رضا", amount: "۱ بار", tone: "red" },
  { at: TM.late, label: "جریمه‌ی دیرکرد", amount: "۹۰٬۰۰۰", tone: "red" },
];
const TOTAL = { at: TM.late + 0.6, value: "۴۷۷٬۰۰۰ ✓" };

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
          <span style={{ fontSize: 34 }}><span style={{ fontFamily: EMOJI, fontSize: 30 }}>💸</span> دُنگ‌گیر</span>
          <span style={{ fontSize: 20, opacity: 0.55 }}>پرونده‌ی بدهی رضا · {printing ? "در حال چاپ…" : "باز"}</span>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, borderTop: "2px dashed rgba(0,0,0,.35)", paddingTop: 10, marginTop: 6, background: `rgba(31,174,106,${0.18 * Math.max(0, 1 - (t - TOTAL.at) * 1.5)})` }}>
            <span>دریافت شد</span>
            <span style={{ color: "#1fae6a", fontFamily: FONT_NUM, fontSize: 38 }}>{TOTAL.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ───────── trip status pill ───────── */
const STATUS: [number, string, string, string?][] = [
  [0, "😐", "رضا · بدهکار", C.red],
  [TM.months, "⏳", "در انتظار «کارت به کارت»…", C.red],
  [TM.name, "💸", "دُنگ‌گیر فعال شد", "#1fae6a"],
  [TM.send, "📩", "یادآوری ارسال شد"],
  [TM.seen + 0.1, "👀", "سین شد · بدون جواب", C.red],
  [TM.call, "📞", "در حال تماس با مامانِ رضا", "#7b2cbf"],
  [TM.late + 0.2, "✅", "دُنگ دریافت شد", "#1fae6a"],
  [TM.removed, "🚪", "از گروه «رفقا» حذف شدی", C.red],
  [TM.sent, "💬", "پیام آخر ارسال شد", C.red],
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
  0: { keys: ["حساب"], reds: ["کیف"], icons: { رفیقت: "😎", کیف: "👛", ماشین: "🚗" } },
  1: { reds: ["ماهه"], icons: { ماهه: "📅", "«شب": "🌙" } },
  2: { keys: ["«دُنگ‌گیر»"], icons: { "«دُنگ‌گیر»": "💸", فاکتور: "🧾" } },
  3: { keys: ["هوش", "مصنوعی"], reds: ["«تست"], icons: { مصنوعی: "🤖", پیتزایی: "🍕" } },
  4: { keys: ["مؤدبانه"], icons: { مؤدبانه: "🌸" } },
  5: { keys: ["سین"], reds: ["بدهکارم"], icons: { سین: "👀", بدهکارم: "💸" } },
  6: { reds: ["مامانش"], icons: { مامانش: "👩‍🦳", زنگ: "📞" } },
  7: { keys: ["قرون"], reds: ["جریمه‌ی"], icons: { شارژ: "🥲", قرون: "🪙", دیرکرد: "⏰" } },
  8: { keys: ["ستاره"], icons: { ستاره: "⭐" } },
  9: { reds: ["ریمو"], icons: { "«رفقا»": "👬", ریمو: "🚪" } },
  10: { reds: ["«دُنگ", "بده", "مادرجنده"], icons: { "دُنگ‌گیر": "💸", مادرجنده: "😤" } },
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
export const V23_LOOK = [0.2, 4.4, 7.8, 10.9, 12.9, 18.1, 20.9, 23.6, 28.0, 29.6, 31.4, 33.0, 36.7, 38.7, 40.8, 42.3, 45.4, 47.4, 49.2, 51.2, 52.6, 54.1];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V23_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V23: React.FC = () => (
  <>
    <Composition id="V23" component={Video} durationInFrames={V23_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v23/mix.wav" }} />
    <Composition id="V23-Silent" component={Video} durationInFrames={V23_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V23-Look" component={Look} durationInFrames={V23_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
