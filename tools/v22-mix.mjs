// v22 mix plan → out/v22-mix.json (beats from src/v22/words.json, same constants as src/v22/Video.tsx), then: node tools/mix.mjs out/v22-mix.json --out public/v22/mix.wav
// Story beds under her call (sepia flashbacks): softer music. Forks: ticks; deaths: music drops, hit, «مُردی» sting, VHS rewind.
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v22/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(24) + 2.6;
const TIMER = 3.3, REW = 0.8;
const DEAD0A = E(5) + 0.2, DEAD0B = E(7) + 0.2, REW0 = S(8) - REW - 0.05;
const T1 = E(10) + 0.15, SCARE1 = E(12) + 0.02, DEAD1 = E(12) + 0.32, REW1 = S(13) - REW - 0.05;
const T2 = E(19) + 0.15, SHATTER = W(20, "شکستی") + 0.25, DEAD2 = E(21) + 0.2, REW2 = S(22) - REW - 0.05;
const D = "videos/22-shab-6/sfx/", D20 = "videos/20-shab-5/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D14 = "videos/14-shab-2/sfx/", D19 = "videos/19-shab-4/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const fork = (t0, pickW, pickR) => [
  own(D9 + "stinger-1.mp3", t0 - 2.3, 0.3, 0.02),
  ...[0, 1, 2].map((i) => own(D20 + "tick-1.mp3", t0 + i * 1.0 + 0.05, 1.1, 0.002)),
  own(D20 + "tick-1.mp3", t0 + TIMER - 0.25, 1.4, 0.002),
  lib("sfx/whoosh/swish-13", pickW, 0.3),
  lib("sfx/notification/success-soft", pickR + 0.05, 0.35),
];
const dead = (at, rew) => [own(D20 + "dead-1.mp3", at + 0.05, 1.2, 0.327), ...(rew ? [own(D20 + "rewind-1.mp3", rew, 1.0, 0)] : [])];
const sfx = [
  own(D9 + "stinger-1.mp3", 0.05, 0.3, 0.02),
  own(D20 + "rewind-1.mp3", 0.0, 0.5, 0),
  own(D14 + "whisper-1.mp3", W(0, "صورت") - 0.1, 0.35, 0.3),
  own(D9 + "stinger-1.mp3", W(1, "نده"), 0.35, 0.02),
  own(D9 + "knock-1.mp3", W(2, "پرسید") - 0.1, 0.6),
  lib("sfx/notification/success-soft", W(3, "A"), 0.15), lib("sfx/notification/success-soft", W(3, "B"), 0.15),
  own(D9 + "stinger-1.mp3", W(3, "مرگ"), 0.6, 0.02),
  // fork 0: two deaths, then C
  ...dead(DEAD0A, 0),
  own(D9 + "knock-1.mp3", S(7) - 0.1, 0.6), own(D20 + "bolt-1.mp3", W(7, "باز") + 0.1, 0.8, 0.159), own(D19 + "creak-1.mp3", W(7, "باز") + 0.3, 0.6, 1.0),
  ...dead(DEAD0B, REW0),
  lib("sfx/notification/success-soft", W(8, "ندادم"), 0.35),
  own(D14 + "whisper-1.mp3", W(8, "یه") + 0.2, 0.4, 0.3),
  // the call
  own(D14 + "ring-1.mp3", W(9, "زنگ") - 0.1, 0.7, 0.05), own(D9 + "vibrate-1.mp3", W(9, "زنگ"), 0.6),
  ...fork(T1, S(11) - 0.25, S(13) - 0.05),
  lib("sfx/ui/click-crisp", S(11) + 0.5, 0.4),
  own(D9 + "vibrate-1.mp3", S(12) - 0.1, 0.8),
  lib("sfx/whoosh/fast-bright", SCARE1 - 0.08, 0.45), own(D19 + "scream-1.mp3", SCARE1, 1.6, 0.05),
  ...dead(DEAD1, REW1),
  own(D14 + "pickup-1.mp3", W(13, "بالاخره") - 0.1, 0.6, 0.05),
  own(D9 + "stinger-1.mp3", W(15, "ولی") - 0.05, 0.4, 0.02),
  own(D9 + "drawer-1.mp3", W(16, "نوشته") - 0.6, 0.2, 0.3),
  own(D9 + "stinger-1.mp3", W(16, "تو", 1), 0.45, 0.02),
  // the mirror
  lib("sfx/body/heartbeat", W(18, "لبخند"), 0.35), lib("sfx/body/heartbeat", W(18, "نمی‌خندم"), 0.4),
  ...fork(T2, S(20) - 0.25, S(22) - 0.05),
  own(D + "shatter-1.mp3", SHATTER, 1.3, 0.085), own(D9 + "stinger-1.mp3", SHATTER, 0.8, 0.02),
  own(D14 + "whisper-1.mp3", S(21) - 0.1, 0.5, 0.3),
  ...dead(DEAD2, REW2),
  lib("sfx/foley/cloth-1", W(22, "شیشه") - 0.05, 0.6),
  own(D9 + "lampoff-1.mp3", W(23, "خاموش"), 0.6, 0.05),
  own(D9 + "stinger-1.mp3", W(23, "لبخند"), 0.5, 0.02),
  lib("sfx/body/heartbeat-fast", S(24) - 0.1, 0.35),
  ...[1, 2, 9, 14, 16, 17, 18, 23].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
const M = "public/audio/music/horror/floor-6.mp3", M2 = "public/audio/music/horror/between-life-and-death.mp3";
const r = (x) => +x.toFixed(2);
fs.writeFileSync("out/v22-mix.json", JSON.stringify({
  length: r(END), voice: "public/v22/narration.wav",
  music: [
    { file: M, at: 0, from: 0, to: r(DEAD0A - 0.2), fadeIn: 0.6, fadeOut: 0.3, gain: 0.24 },
    { file: M, at: r(S(8) - 0.05), from: 30, to: r(SCARE1 - 0.6), fadeIn: 0.3, fadeOut: 0.3, gain: 0.24 },
    { file: M2, at: r(S(13) - 0.05), from: 0, to: r(S(18) - 0.2), fadeIn: 1.0, fadeOut: 0.8, gain: 0.2 },
    { file: M, at: r(S(18) - 0.2), from: 70, to: r(SHATTER - 0.5), fadeIn: 0.5, fadeOut: 0.3, gain: 0.24 },
    { file: M, at: r(S(22) - 0.05), from: 110, to: r(END), fadeIn: 0.3, fadeOut: 1.5, gain: 0.24 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: r(S(13)), vol: 0.1 },
    { file: D9 + "drone-1.mp3", from: r(S(18)), to: r(SHATTER), vol: 0.06 },
    { id: "sfx/ambience/wind", from: r(S(22)), to: r(END), vol: 0.1 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
