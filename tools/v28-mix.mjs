// V28 mix plan (times from src/v28/words.json, same anchors as the video) → videos/28-metro/mix.json
import fs from "node:fs";
const words = JSON.parse(fs.readFileSync("src/v28/words.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:؛]/g, "");
const wd = (si, w, n = 1) => words.filter((x) => x.si === si && bare(x.w) === w)[n - 1].s;
const S = (si) => words.find((w) => w.si === si).s;
const E = (si) => words.filter((w) => w.si === si).at(-1).e;
const START = (si) => (si === 0 ? 0 : S(si) - 0.35);
const TOTAL = E(24) + 2.6, DAY = 1.05;
const K = 0.4;
const fx = (file, at, vol, peak) => ({ file, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const id = (i, at, vol) => ({ id: i, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const L = "public/sfx-lib/", X = "public/v28/sfx/";
const hit = wd(3, "شیشه‌ها") - 0.25;
const sfx = [
  fx(L + "pop.wav", 0.6, 0.25, 0.01),                               // phone glow
  id("sfx/impact/distant-boom", wd(2, "بمب") + 0.1, 0.55),               // cloud reveal
  fx(X + "blast-1.mp3", hit, 0.7, 0.04),                             // shock wave
  id("sfx/impact/cinematic-heavy", hit, 0.5),
  fx(X + "alarms-1.mp3", hit + 2.4, 0.3, 2.89),
  id("sfx/whoosh/soft-medium", START(5), 0.35),                          // cards
  fx(L + "ticks.wav", START(6) + 0.4, 0.35, 0.05),
  id("sfx/whoosh/soft-medium", START(7), 0.3),
  id("sfx/ui/click-tonal", wd(7, "ماشین") + 0.9, 0.4),
  id("sfx/ui/click-tonal", wd(7, "جرمه") + 0.6, 0.4),
  fx(X + "moto-1.mp3", wd(8, "پیک") + 1.5, 0.45, 1.9),               // moto arrives/brakes
  id("sfx/whoosh/deep", wd(8, "پایینه") + 0.8, 0.4),                     // rides off
  fx(L + "steps.wav", START(9) + 0.6, 0.35, 0.02),
  id("sfx/whoosh/deep", wd(9, "نه") - 0.1, 0.35),                        // down the stairs
  id("sfx/ui/click-tonal", wd(10, "سی"), 0.35),
  id("sfx/whoosh/soft-medium", START(12), 0.3),
  fx(L + "pop.wav", wd(12, "زمان"), 0.3, 0.01),
  fx(L + "blip.wav", wd(12, "هفت", 2) + 0.1, 0.3, 0.01),
  fx(L + "blip.wav", wd(12, "دو", 1) + 0.1, 0.3, 0.01),
  fx(L + "blip.wav", wd(12, "دو", 2) + 0.1, 0.3, 0.01),
  fx(L + "steps.wav", wd(14, "می‌ره"), 0.3, 0.02),
  fx(L + "steps.wav", wd(14, "بیست") + 0.6, 0.3, 0.02),
  fx(L + "pop.wav", wd(15, "واگیر"), 0.3, 0.01),
  fx(L + "pop.wav", wd(15, "خطر"), 0.3, 0.01),
  fx(L + "paper.wav", wd(16, "کیسه"), 0.35, 0.05),
  fx(L + "stamp.wav", wd(16, "نود"), 0.4, 0.02),
  id("sfx/whoosh/soft-medium", wd(16, "بعد") - 0.3, 0.3),
  id("sfx/ui/click-tonal", wd(16, "صابون") - 0.2, 0.35),
  fx(L + "error.wav", wd(16, "نرم‌کننده", 1) - 0.1, 0.25, 0.02),
  id("sfx/ui/click-tonal", wd(17, "دیرتر"), 0.35),
  fx(L + "match.wav", wd(18, "دربسته"), 0.3, 0.02),
  fx(L + "error.wav", wd(18, "هرچی"), 0.25, 0.02),
  fx(L + "thud.wav", START(19) + 0.05, 0.45, 0.02),                  // day cards
  fx(L + "pop.wav", wd(19, "تیروئید"), 0.3, 0.01),
  fx(L + "pop.wav", wd(19, "مسئولین"), 0.3, 0.01),
  fx(L + "thud.wav", START(20) + 0.05, 0.45, 0.02),
  fx(X + "rain-1.mp3", START(20) + DAY + 1.6, 0.45, 2.61),
  fx(L + "thud.wav", START(21) + 0.05, 0.45, 0.02),
  fx(X + "radio-1.mp3", wd(21, "اتوبوس‌های") - 0.6, 0.35, 1.41),
  fx(L + "steps.wav", START(22) + 0.5, 0.3, 0.02),
  fx(L + "thud.wav", START(23) + 0.05, 0.45, 0.02),
  fx(L + "chime.wav", wd(23, "آسمون"), 0.3, 0.02),
  fx(L + "pop.wav", wd(24, "داخل"), 0.3, 0.01),
  fx(L + "blip.wav", wd(24, "پایین"), 0.3, 0.01),
  fx(L + "blip.wav", wd(24, "بمون"), 0.3, 0.01),
  fx(L + "chime.wav", wd(24, "زمان"), 0.3, 0.02),
];
const mix = {
  length: +TOTAL.toFixed(2),
  voice: "public/v28/narration.wav",
  music: [
    { file: "public/audio/music/ambient/cave-4.mp3", at: 0, from: 0, to: wd(1, "سفید") - 0.1, fadeIn: 0.5, fadeOut: 0.15, gain: 0.24 },
    { file: "public/audio/music/ambient/cave-4.mp3", at: S(2) - 0.3, from: 60, to: START(23) + 0.6, fadeIn: 1.5, fadeOut: 1.2, gain: 0.24 },
    { file: "public/audio/music/intro/beginning-6.mp3", at: START(23) + 0.3, from: 0, to: TOTAL - START(23) - 0.3, fadeIn: 1.5, fadeOut: 2.6, gain: 0.24 },
  ],
  sfx,
  beds: [
    { id: "sfx/ambience/wind", from: START(11), to: START(12), vol: 0.3 },
    { id: "sfx/ambience/wind", from: START(23) + DAY, to: START(24), vol: 0.18 },
  ],
};
fs.writeFileSync("videos/28-metro/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx", sfx.length, "len", mix.length);
