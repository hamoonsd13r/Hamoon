// Video 10 — «نامیرا» · vertical 1080×1920 · flat cinematic vector cartoon.
// Inspired by the reel «What if you could never die?» — own Persian script, crazier deaths, Shamsi year counter.
// Every cue comes from words.json (line-by-line voice, tools/v10-voice.mjs).
import React from "react";
import { AbsoluteFill, Composition, Html5Audio as Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM } from "../fonts";
import { Barrel, Crocs, Intro, Scrapbook, Skydive, Train, Volcano } from "./act1";
import { Alone, Field, Graves, Love, NewLife, Porch, Years } from "./act2";
import { Attacks, BlackHole, DyingStars, Evaporate, Forever, Future, Jungle, RedGiant, Spiky, Void } from "./act3";
import { BLACK, clamp, E, fa, FPS, fr, hn, lerp, rk, S, W, WORDS, Wd } from "./kit";

export const V10_END = E(23) + 3.2;
export const V10_FRAMES = fr(V10_END);
const CARD = E(23) + 0.35;

type Sc = { from: number; R: React.FC<{ t: number }> };
const SB = [
  { R: Skydive, at: W(1, "تو") + 0.3, cy: 1350 },
  { R: Train, at: W(2, "درمیاد") + 0.05, cy: 1150 },
  { R: Crocs, at: W(3, "می‌شکنه") + 0.3, cy: 1080 },
  { R: Volcano, at: W(5, "می‌گیری"), cy: 1180 },
];
const SCENES: Sc[] = [
  { from: 0, R: Intro },
  { from: S(1) - 0.25, R: Skydive },
  { from: S(2) - 0.2, R: Train },
  { from: S(3) - 0.2, R: Crocs },
  { from: S(4) - 0.2, R: Barrel },
  { from: S(5) - 0.2, R: Volcano },
  { from: S(6) - 0.25, R: ({ t }) => <Scrapbook t={t} scenes={SB} /> },
  { from: S(7) - 0.25, R: Love },
  { from: S(8) - 0.2, R: Years },
  { from: S(9) - 0.2, R: Porch },
  { from: S(10) - 0.2, R: Graves },
  { from: S(11) - 0.2, R: NewLife },
  { from: S(12) - 0.2, R: Field },
  { from: S(13) - 0.2, R: Alone },
  { from: S(14) - 0.2, R: Future },
  { from: S(15) - 0.2, R: Attacks },
  { from: S(16) - 0.2, R: Spiky },
  { from: S(17) - 0.2, R: Jungle },
  { from: S(18) - 0.2, R: RedGiant },
  { from: S(19) - 0.2, R: BlackHole },
  { from: S(20) - 0.2, R: DyingStars },
  { from: S(21) - 0.2, R: Evaporate },
  { from: S(22) - 0.2, R: Void },
  { from: S(23) - 0.3, R: ({ t }) => <Forever t={t} card={CARD} /> },
];

// ---- overlay: year counter + captions ------------------------------------------------------------
const roll = (t: number, a: number, b: number, y0: number, y1: number) => fa(Math.round(lerp(y0, y1, rk(t, a, b))));
const yearAt = (t: number): string => {
  if (t < S(7) - 0.25) return "۱۴۰۵";
  if (t < W(7, "دو") - 0.15) return "۱۴۰۷";
  if (t < S(8) - 0.2) return "۱۴۱۰";
  if (t < S(9) - 0.2) return roll(t, S(8) - 0.2, S(9) - 0.4, 1410, 1466);
  if (t < S(10) - 0.2) return "۱۴۶۷";
  if (t < S(11) - 0.2) return roll(t, S(10), E(10), 1467, 1521);
  if (t < S(12) - 0.2) return roll(t, S(11), E(11), 1522, 1530);
  if (t < S(13) - 0.2) return "۱۶۰۸";
  if (t < S(14) - 0.2) return roll(t, S(13), E(13) + 0.3, 1750, 2399);
  if (t < S(17) - 0.2) return "۲۴۰۰";
  if (t < S(18) - 0.2) return "۱۲٬۰۰۰";
  if (t < S(20) - 0.2) return "۵ میلیارد";
  if (t < S(21) - 0.2) return "۱۰۰ تریلیون";
  if (t < S(22) - 0.2) return "POW";
  if (t < S(23) - 0.3) return fa(Math.floor(hn(Math.floor(t * 12), 5) * 9000 + 1000)).replace(/./g, (c, i) => (hn(Math.floor(t * 12), i) > 0.6 ? "؟" : c));
  return "∞";
};
const Year: React.FC<{ t: number }> = ({ t }) => {
  if (t >= CARD) return null;
  const y = yearAt(t);
  const prev = yearAt(t - 0.12);
  const pop = y !== prev && t < S(22) - 0.2 ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: 0, top: 96, width: 1080, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, direction: "rtl", padding: "6px 34px 12px", borderRadius: 999, background: "rgba(10,12,20,.42)", backdropFilter: "blur(6px)", transform: `scale(${1 + 0.08 * pop})` }}>
        <span style={{ fontFamily: BLACK, fontSize: 34, color: "rgba(255,255,255,.75)" }}>سال</span>
        <span style={{ fontFamily: FONT_NUM, fontSize: 78, color: "#ffc23a", lineHeight: 1.05, textShadow: "0 3px 0 rgba(0,0,0,.35)", direction: y === "POW" ? "ltr" : "rtl" }}>{y === "POW" ? <>۱۰<sup style={{ fontSize: 44 }}>۱۰۰</sup></> : y}</span>
      </div>
    </div>
  );
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cur = [...WORDS].reverse().find((w) => w.s <= t + 0.02);
  if (!cur || t > cur.e + 0.6) return null;
  const sent = WORDS.filter((w) => w.si === cur.si);
  const chunks: Wd[][] = [[]];
  sent.forEach((w) => { const c = chunks[chunks.length - 1]; c.push(w); if (/[،:.!؟…]$/.test(w.w) || c.length >= 4) chunks.push([]); });
  for (let i = chunks.length - 1; i > 0; i--) if (chunks[i].length > 0 && chunks[i].length < 2 && chunks[i - 1].length < 5) { chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  const chunk = chunks.find((c) => c.includes(cur)) ?? [];
  return (
    <div style={{ position: "absolute", left: 50, top: 1300, width: 980, textAlign: "center", direction: "rtl", fontFamily: BLACK, fontSize: 74, lineHeight: 1.35, color: "#fff", textShadow: "0 5px 0 rgba(0,0,0,.55), 0 0 26px rgba(0,0,0,.7)" }}>
      {chunk.map((w) => {
        const vis = w.s <= t + 0.02;
        const isCur = w === cur;
        const a = clamp((t - w.s) / 0.1);
        return <span key={w.wi} style={{ display: "inline-block", margin: "0 10px", opacity: vis ? a : 0, color: isCur ? "#ffc23a" : "#fff", transform: `translateY(${(1 - a) * 14}px) scale(${isCur ? 1 + 0.1 * (1 - clamp((t - w.s) / 0.2)) : 1})` }}>{w.w.replace(/[.،]$/, "")}</span>;
      })}
    </div>
  );
};

/** paper grain + soft vignette */
const Grain: React.FC<{ f: number }> = ({ f }) => (
  <>
    <svg width={360} height={640} viewBox="0 0 360 640" style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: "overlay", opacity: 0.22 }}>
      <filter id="v10g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={f % 8} /></filter>
      <rect width={360} height={640} filter="url(#v10g)" />
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.35) 100%)" }} />
  </>
);

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const i = SCENES.findLastIndex((s) => s.from <= t);
  const sc = SCENES[Math.max(0, i)];
  const since = t - sc.from;
  // whip-in on every cut: the new scene slides in with a short blur
  const k = i > 0 ? rk(since, 0, 0.18) : 1;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${(1 - k) * -120}px) scale(${1 + (1 - k) * 0.06})`, filter: k < 1 ? `blur(${(1 - k) * 8}px)` : undefined }}>
        <sc.R t={t} />
      </AbsoluteFill>
      <Grain f={f} />
      <Year t={t} />
      <Captions t={t} />
      {i > 0 && since < 0.08 && <AbsoluteFill style={{ background: "#fff", opacity: (1 - since / 0.08) * 0.35 }} />}
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V10_LOOK = [2.6, 6.6, 10.3, 13.6, 18.9, 22.8, 24.6, 28.8, 31.4, 32.9, 36.9, 39.6, 44.6, 48.6, 51.8, 53.8, 56.4, 61.9, 70.9, 72.6, 75.6, 77.9, 79.8, 84.0, 90.6, 93.8, 98.0, 101.4, 106.6, 113.9, 118.8, 124.6];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Sequence from={f - fr(V10_LOOK[f])}>
      <Video />
    </Sequence>
  );
};

export const V10: React.FC = () => (
  <>
    <Composition id="V10" component={Video} durationInFrames={V10_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ audio: "v10/mix.wav" }} />
    <Composition id="V10-Silent" component={Video} durationInFrames={V10_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V10-Look" component={Look} durationInFrames={V10_LOOK.length} fps={FPS} width={1080} height={1920} />
  </>
);
