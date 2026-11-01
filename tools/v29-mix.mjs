// v29 mix plan → out/v29-mix.json (times from src/v29/words.json, same cues as src/v29/Video.tsx), then: node tools/mix.mjs out/v29-mix.json --out public/v29/mix.wav (keeps mix-norm.wav)
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v29/words.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const W = (si, n) => (WD.find((x) => x.si === si && bare(x.w) === n) ?? WD.find((x) => x.si === si && x.w.includes(n))).s;
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const TOTAL = E(30) + 2.6, CARDS_IN = S(27) - 0.1;
const D = "videos/29-panj-nafar-2/sfx/takes/", D9 = "videos/09-pomp-benzin/sfx/", D13 = "videos/13/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.17).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const steps = [0, 0.5, 1.0, 1.5].map((d) => lib("sfx/footsteps/wood-03", S(3) + d, 0.35));
const sfx = [
  ...steps,
  lib("sfx/whoosh/soft-short", S(5) - 0.1, 0.3),
  own(D + "engine-1.mp3", S(6) + 0.1, 0.25, 0.8),
  lib("sfx/paper/slide", S(8) + 0.4, 0.35),
  lib("sfx/paper/page-flip", S(9), 0.3),
  lib("sfx/paper/slide", S(11) + 0.1, 0.4),
  own(D9 + "stinger-1.mp3", S(12), 0.1, 0.02),
  lib("sfx/body/heartbeat", E(13) + 0.1, 0.4),
  own(D9 + "vibrate-1.mp3", S(14), 0.45, 0.1),
  own(D + "taps-1.mp3", S(17), 0.45, 0.02),
  own(D + "lock-1.mp3", W(21, "قفل") + 0.2, 0.3, 0.27),
  own(D9 + "vibrate-1.mp3", S(22) + 0.1, 0.45, 0.1),
  lib("sfx/body/heartbeat-fast", S(24), 0.4),
  own(D9 + "stinger-1.mp3", W(25, "اعلامیه"), 0.13, 0.02),
  own(D + "lock-1.mp3", S(26) + 0.4, 0.25, 0.27),
  lib("sfx/impact/subdrop-short", CARDS_IN + 0.05, 0.4),
];
fs.writeFileSync("out/v29-mix.json", JSON.stringify({
  length: +TOTAL.toFixed(2), voice: "public/v29/narration.wav",
  music: [{ file: "public/audio/music/horror/carnival-of-souls.mp3", at: 0, from: 20, to: +(20 + TOTAL).toFixed(2), fadeIn: 0.5, fadeOut: 2.5, gain: 0.22 }],
  beds: [
    { id: "sfx/ambience/wind", from: +(S(3) - 0.1).toFixed(2), to: +(S(6)).toFixed(2), vol: 0.1 },
    { file: D9 + "drone-1.mp3", from: +(S(14) - 0.2).toFixed(2), to: +(E(26) + 0.5).toFixed(2), vol: 0.05 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", TOTAL.toFixed(2));
