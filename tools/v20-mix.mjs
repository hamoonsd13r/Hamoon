// v20 mix plan → out/v20-mix.json (beats from src/v20/words.json, same constants as src/v20/Video.tsx), then: node tools/mix.mjs out/v20-mix.json --out public/v20/mix.wav
// Forks: 3 ticks under the timer. Deaths: the music drops out ~0.7 s before the scare, scare hit, «مُردی» sting, VHS rewind, the right path with a chime.
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v20/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(18) + 2.6;
const T1 = E(5) + 0.15, T2 = E(12) + 0.15, TIMER = 3.3;
const SCARE1 = S(7) - 0.06, SCARE2 = S(14) - 0.06, DEAD1 = E(7) + 0.2, DEAD2 = E(14) + 0.2;
const REW = 0.8, REW1 = S(8) - REW - 0.05, REW2 = S(15) - REW - 0.05;
const D = "videos/20-shab-5/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D14 = "videos/14-shab-2/sfx/", D19 = "videos/19-shab-4/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const fork = (t0, pickA, pickB) => [
  own(D9 + "stinger-1.mp3", t0 - 2.3, 0.3, 0.02),
  ...[0, 1, 2].map((i) => own(D + "tick-1.mp3", t0 + i * 1.0 + 0.05, 1.1, 0.002)),
  own(D + "tick-1.mp3", t0 + TIMER - 0.25, 1.4, 0.002),
  lib("sfx/whoosh/swish-13", pickA, 0.3),
  lib("sfx/notification/success-soft", pickB + 0.05, 0.35),
];
const death = (scare, dead, rew) => [
  lib("sfx/whoosh/fast-bright", scare - 0.08, 0.45),
  own(D19 + "scream-1.mp3", scare, 1.8, 0.05),
  own(D9 + "stinger-1.mp3", scare, 1.3, 0.02),
  own(D + "dead-1.mp3", dead + 0.05, 1.2, 0.327),
  own(D + "rewind-1.mp3", rew, 1.0, 0),
];
const sfx = [
  own(D9 + "stinger-1.mp3", 0.05, 0.35, 0.02),
  own(D14 + "whisper-1.mp3", S(4) - 0.1, 0.45, 0.3),
  ...fork(T1, S(6) - 0.25, S(8) - 0.05),
  lib("sfx/body/heartbeat", S(6) + 0.5, 0.35),
  ...death(SCARE1, DEAD1, REW1),
  lib("sfx/body/heartbeat", W(8, "دقت"), 0.3),
  own(D9 + "vibrate-1.mp3", W(9, "دو") - 0.1, 0.8), own(D9 + "vibrate-1.mp3", W(9, "پیام") - 0.1, 0.8),
  ...fork(T2, S(13) - 0.25, S(15) - 0.05),
  own(D + "slam-1.mp3", SCARE2 - 0.35, 1.3, 0.003),
  ...death(SCARE2, DEAD2, REW2),
  lib("sfx/transition/power-down", W(15, "یادته") - 0.15, 0.25),
  own(D + "bolt-1.mp3", W(16, "قفل"), 0.9, 0.159),
  ...[W(17, "بمونه") - 0.1, W(17, "تو") - 0.05, W(17, "من") - 0.05].map((k) => own(D9 + "knock-1.mp3", k, 0.7, 0.05)),
  lib("sfx/body/heartbeat-fast", S(18) - 0.1, 0.35),
  ...[1, 2, 3, 9, 16].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
const M = "public/audio/music/horror/tension-in-the-air.mp3";
const r = (x) => +x.toFixed(2);
fs.writeFileSync("out/v20-mix.json", JSON.stringify({
  length: r(END), voice: "public/v20/narration.wav",
  music: [
    { file: M, at: 0, from: 0, to: r(SCARE1 - 0.7), fadeIn: 0.8, fadeOut: 0.4, gain: 0.26 },
    { file: M, at: r(S(8) - 0.05), from: 40, to: r(SCARE2 - 0.7), fadeIn: 0.3, fadeOut: 0.4, gain: 0.24 },
    { file: M, at: r(S(15) - 0.05), from: 80, to: r(END), fadeIn: 0.3, fadeOut: 1.5, gain: 0.24 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: r(SCARE1 - 0.7), vol: 0.12 },
    { file: D9 + "drone-1.mp3", from: r(S(9)), to: r(SCARE2 - 0.7), vol: 0.06 },
    { id: "sfx/ambience/wind", from: r(S(15)), to: r(END), vol: 0.1 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
