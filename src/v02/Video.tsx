// V02 · Borhani Fit Club intro reel (Art Motion · kinetic type, vertical, ~22s). Direction: videos/02/direction.md
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { ClipCanvas } from "../styles/art-motion/ArtCanvas";
import { type ClipSpec } from "../styles/art-motion";
import { IconLayer, type IconPage } from "./Icons";
import vo from "./vo.json";
const Wd = (line: number, word: string) => vo.words.find((w) => w.line === line && w.w.includes(word))!.s;

const BG = "#0B0B0C", RED = "#FF3B1F", LIGHT = "#F2F1EE", WHITE = "#FFFFFF";
const NO = ""; // hide the auto page numeral: the icon layer takes that spot
export const SPEC: ClipSpec = {
  grammar: "y5_kinetic_type",
  duration: 22,
  fps: 30,
  width: 1080,
  height: 1920,
  safe: { top: 120, bottom: 330 },
  theme: { bg: BG, surface: "#1A1A1C", ink: LIGHT, sub: "#9A9A9A", accent: RED, accent2: WHITE },
  cues: [
    { at: 0.1, kind: "point", text: "برهانی فیت کلاب", sub: "یه باشگاه کامل در رشت", data: { key: "کامل", num: NO } },
    { at: Wd(1, "دو"), kind: "number", text: "تمرین در دو طبقه", data: { value: 2, suffix: " طبقه" } },
    { at: Wd(2, "طبقه"), kind: "point", text: "طبقه‌ی اول", sub: "کاردیو و دستگاه‌های پا", data: { label: "01", key: "کاردیو", num: NO } },
    { at: Wd(2, "کاردیو"), kind: "highlight", data: { word: "اول" } },
    { at: Wd(3, "طبقه"), kind: "point", text: "طبقه‌ی دوم", sub: "سالن بدنسازی", data: { label: "02", key: "بدنسازی", num: NO } },
    { at: Wd(3, "بهترین"), kind: "point", text: "جدیدترین دستگاه‌ها", sub: "بهترین تجهیزات بدنسازی", data: { key: "بهترین", num: NO } },
    { at: Wd(3, "جدیدترین"), kind: "highlight", data: { word: "جدیدترین" } },
    { at: Wd(4, "رشت"), kind: "point", text: "رشت، گلسار", sub: "بلوار دیلمان، خیابان میرابوالقاسمی", data: { label: "آدرس", key: "بلوار دیلمان", num: NO } },
    { at: Wd(4, "مجتمع"), kind: "point", text: "مجتمع پالادیوم", data: { label: "آدرس", num: NO } },
    { at: Wd(5, "همین"), kind: "point", text: "همین امروز شروع کن", data: { key: "امروز", num: NO } },
    { at: Wd(5, "پیجمون"), kind: "point", text: "borhani.fitclub", sub: "09119295696", data: { label: "اینستاگرام", num: NO } },
  ],
};

// one icon per page; page colours rotate bg → accent → ink → accent2 (the grammar's order)
const TEXT = [LIGHT, BG, BG, BG];
const ICON_OF = ["dumbbell", "floors", "cardio", "barbell", "kettlebell", "pin", "tower", "bolt", "insta"] as const;
const pageCues = SPEC.cues.filter((c) => c.kind !== "highlight");
const show = (c: (typeof pageCues)[number]) => +c.at - (c.kind === "number" ? 0.7 : 0); // a number page opens 0.7s before it lands
const PAGES: IconPage[] = pageCues.map((c, i) => ({
  at: show(c), end: i + 1 < pageCues.length ? show(pageCues[i + 1]) : SPEC.duration, icon: ICON_OF[i], color: TEXT[i % 4],
}));

const Video: React.FC<{ audio?: string; t?: number }> = ({ audio, t }) => {
  const f = useCurrentFrame();
  const time = t ?? f / 30;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {audio && t === undefined && <Html5Audio src={staticFile(audio)} />}
      <ClipCanvas spec={SPEC} t={t} />
      <IconLayer pages={PAGES} t={time} fps={30} />
    </AbsoluteFill>
  );
};
const Look: React.FC<{ times: number[] }> = ({ times }) => <Video t={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

const LOOK = [0.25, 2.0, 3.6, 5.5, 9.0, 10.8, 12.0, 14.0, 16.3, 17.8, 18.9, 21.8];
const FRAMES = Math.round(SPEC.duration * 30);
export const V02: React.FC = () => (
  <>
    <Composition id="V02" component={Video} durationInFrames={FRAMES} fps={30} width={1080} height={1920} defaultProps={{ audio: "v02/mix.wav" }} />
    <Composition id="V02-Silent" component={Video} durationInFrames={FRAMES} fps={30} width={1080} height={1920} defaultProps={{}} />
    <Composition id="V02-Look" component={Look} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
