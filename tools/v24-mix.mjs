// v24 mix plan → out/v24-mix.json (beats from src/v24/words.json, same constants as src/v24/Video.tsx), then: node tools/mix.mjs out/v24-mix.json --out public/v24/mix.wav
// Night: horror bed + wind; the fake rescue: engines + megaphone; dawn: the music drops away, birds; the epilogue: just the toothbrush, then one sting.
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v24/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(21) + 3.0;
const TIMER = 3.3, REW = 0.8;
const CRACK0 = W(2, "شکستی") + 0.3, DEAD0 = E(3) + 0.2, REW0 = S(4) - REW - 0.05;
const T1 = E(9) + 0.15, SCARE1 = E(11) + 0.02, DEAD1 = E(11) + 0.32, REW1 = S(12) - REW - 0.05;
const T2 = E(16) + 0.15, DEAD2 = E(18) + 0.2, REW2 = S(19) - REW - 0.05;
const D = "videos/24-shab-7/sfx/", D22 = "videos/22-shab-6/sfx/", D20 = "videos/20-shab-5/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D14 = "videos/14-shab-2/sfx/", D19 = "videos/19-shab-4/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const fork = (t0, pickW, pickR) => [
  own(D9 + "stinger-1.mp3", t0 - 2.3, 0.3, 0.02),
  ...[0, 1, 2].map((i) => own(D20 + "tick-1.mp3", t0 + i * 1.0 + 0.05, 1.1, 0.002)),
  own(D20 + "tick-1.mp3", t0 + TIMER - 0.25, 1.4, 0.002),
  lib("sfx/whoosh/swish-13", pickW, 0.3),
  lib("sfx/notification/success-soft", pickR + 0.05, 0.35),
];
const dead = (at, rew) => [own(D20 + "dead-1.mp3", at + 0.05, 1.2, 0.327), own(D20 + "rewind-1.mp3", rew, 1.0, 0)];
const sfx = [
  own(D9 + "stinger-1.mp3", 0.05, 0.3, 0.02), own(D20 + "rewind-1.mp3", 0.0, 0.5, 0),
  own(D14 + "whisper-1.mp3", W(0, "صورت") - 0.1, 0.35, 0.3),
  own(D9 + "stinger-1.mp3", W(0, "می‌خواد"), 0.4, 0.02),
  own(D9 + "stinger-1.mp3", W(1, "لبخند"), 0.35, 0.02),
  lib("sfx/whoosh/swish-13", W(2, "اگه") - 0.1, 0.3),
  own(D22 + "shatter-1.mp3", CRACK0, 1.2, 0.085), own(D14 + "whisper-1.mp3", S(3) - 0.1, 0.5, 0.3),
  ...dead(DEAD0, REW0),
  lib("sfx/notification/success-soft", S(4) + 0.05, 0.35),
  lib("sfx/transition/power-down", W(4, "شیشه") - 0.15, 0.25),
  lib("sfx/foley/cloth-1", W(4, "برش"), 0.5),
  own(D9 + "stinger-1.mp3", S(5), 0.55, 0.02),
  own(D9 + "vibrate-1.mp3", W(5, "می‌لرزه") - 0.1, 0.9), own(D9 + "vibrate-1.mp3", W(5, "می‌لرزه") + 1.0, 0.7),
  own(D14 + "pickup-1.mp3", S(6) - 0.3, 0.5, 0.05),
  own(D + "cars-1.mp3", W(7, "نور") - 0.6, 1.0, 0),
  ...fork(T1, S(10) - 0.25, S(12) - 0.05),
  own(D19 + "creak-1.mp3", S(10) + 0.5, 0.6, 1.0),
  lib("sfx/whoosh/fast-bright", SCARE1 - 0.08, 0.45), own(D19 + "scream-1.mp3", SCARE1, 1.6, 0.05),
  ...dead(DEAD1, REW1),
  lib("sfx/transition/power-down", W(12, "ماشین‌ها"), 0.35),
  own(D9 + "knock-1.mp3", W(14, "در") - 0.05, 0.7), own(D9 + "knock-1.mp3", W(14, "می‌زنه") + 0.1, 0.7),
  lib("sfx/notification/success-soft", W(16, "سایه"), 0.25),
  ...fork(T2, S(17) - 0.25, S(19) - 0.05),
  own(D14 + "powerdown-1.mp3", S(17) + 0.6, 0.6, 0.05), own(D14 + "whisper-1.mp3", S(18) - 0.1, 0.5, 0.3),
  own(D9 + "stinger-1.mp3", S(18) + 0.5, 0.8, 0.02),
  ...dead(DEAD2, REW2),
  own(D + "door-1.mp3", W(19, "تموم") - 0.2, 0.9, 0.636),
  lib("sfx/notification/success-arpeggio", W(19, "هفت"), 0.35),
  own(D + "brush-1.mp3", S(20) - 0.1, 0.6, 0),
  own(D9 + "stinger-1.mp3", W(20, "دیرتر"), 1.0, 0.02),
  lib("sfx/body/heartbeat", S(21), 0.3),
  ...[1, 5, 6, 7, 13, 20].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
const M = "public/audio/music/horror/floor-1.mp3", M2 = "public/audio/music/horror/tension-in-the-air.mp3";
const r = (x) => +x.toFixed(2);
fs.writeFileSync("out/v24-mix.json", JSON.stringify({
  length: r(END), voice: "public/v24/narration.wav",
  music: [
    { file: M, at: 0, from: 0, to: r(DEAD0 - 0.2), fadeIn: 0.6, fadeOut: 0.3, gain: 0.24 },
    { file: M, at: r(S(4) - 0.05), from: 30, to: r(SCARE1 - 0.6), fadeIn: 0.3, fadeOut: 0.3, gain: 0.24 },
    { file: M2, at: r(S(12) - 0.05), from: 60, to: r(S(13) + 1.5), fadeIn: 0.3, fadeOut: 1.5, gain: 0.2 },
    { file: M2, at: r(W(16, "در") - 0.2), from: 120, to: r(DEAD2), fadeIn: 0.3, fadeOut: 0.3, gain: 0.22 },
    { file: M, at: r(S(20) + 2.0), from: 90, to: r(END), fadeIn: 2.0, fadeOut: 1.5, gain: 0.24 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: r(S(13)), vol: 0.1 },
    { file: D + "birds-1.mp3", from: r(S(13) + 0.8), to: r(S(17) + 0.4), vol: 0.35 },
    { file: D + "birds-1.mp3", from: r(W(19, "تموم")), to: r(S(20) - 0.2), vol: 0.35 },
    { id: "sfx/ambience/wind", from: r(S(17) + 0.4), to: r(S(19)), vol: 0.12 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
