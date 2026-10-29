// v25 mix plan → out/v25-mix.json (times from src/v25/words.json, same cues as src/v25/Video.tsx), then: node tools/mix.mjs out/v25-mix.json --out public/v25/mix.wav (keeps mix-norm.wav)
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v25/words.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const W = (si, n) => (WD.find((x) => x.si === si && bare(x.w) === n) ?? WD.find((x) => x.si === si && x.w.includes(n))).s;
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const TOTAL = E(25) + 3.4, CARDS_IN = S(24) - 0.1;
const D = "videos/25-panj-nafar/sfx/takes/", D9 = "videos/09-pomp-benzin/sfx/", D13 = "videos/13/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const sfx = [
  own(D + "cutlery-1.mp3", 0.9, 0.18, 0.95),
  own(D9 + "vibrate-1.mp3", W(2, "هشدار"), 0.4, 0.1),
  own(D9 + "alert-1.mp3", S(3) - 0.05, 0.12, 0.05),
  own(D9 + "stinger-1.mp3", S(5), 0.1, 0.02),
  lib("sfx/paper/slide", S(7) + 0.5, 0.4),
  lib("sfx/paper/page-flip", W(8, "من") - 0.1, 0.35),
  lib("sfx/body/heartbeat", E(8) + 0.1, 0.4),
  lib("sfx/whoosh/soft-short", S(9), 0.4),
  lib("sfx/impact/subdrop-short", S(10) + 0.1, 0.3),
  own(D9 + "stinger-1.mp3", S(12) + 0.25, 0.12, 0.02),
  own(D13 + "whisper-1.mp3", W(13, "زیرزمین"), 0.3, 0.3),
  own(D13 + "knock-1.mp3", W(14, "اسمت"), 0.25, 0.05),
  lib("sfx/paper/page-flip", S(15) + 0.6, 0.35),
  lib("sfx/impact/subdrop-short", S(16), 0.35),
  lib("sfx/paper/slide", S(18) + 0.5, 0.35),
  own(D9 + "stinger-1.mp3", W(19, "خون"), 0.13, 0.02),
  own(D + "chairs-1.mp3", S(20) + 0.6, 0.35, 0.72),
  lib("sfx/body/heartbeat-fast", S(21), 0.45),
  lib("sfx/impact/subdrop-short", CARDS_IN + 0.05, 0.4),
];
fs.writeFileSync("out/v25-mix.json", JSON.stringify({
  length: +TOTAL.toFixed(2), voice: "public/v25/narration.wav",
  music: [{ file: "public/audio/music/horror/carnival-of-souls.mp3", at: 0, from: 0, to: +TOTAL.toFixed(2), fadeIn: 0.05, fadeOut: 2.5, gain: 0.22 }],
  beds: [
    { file: D9 + "drone-1.mp3", from: +(S(11) - 0.2).toFixed(2), to: +(E(23) + 0.5).toFixed(2), vol: 0.05 },
    { id: "sfx/ambience/wind", from: +(S(17) - 0.1).toFixed(2), to: +(S(19)).toFixed(2), vol: 0.12 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", TOTAL.toFixed(2));
