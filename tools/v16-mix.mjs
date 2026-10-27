// v16 mix plan → out/v16-mix.json (beats from src/v16/words.json, same needles as src/v16/Video.tsx), then: node tools/mix.mjs out/v16-mix.json --out public/v16/mix.wav
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v16/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(14) + 2.4;
const D = "videos/16-shab-3/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D14 = "videos/14-shab-2/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const lampA = W(13, "چراغ") - 0.1, lampB = W(13, "خاموش") + 0.3;
const sfx = [
  own(D14 + "scratch-1.mp3", S(1) - 0.1, 0.5, 0.3), own(D9 + "stinger-1.mp3", W(1, "بیرون"), 0.45, 0.02),
  own(D9 + "alert-1.mp3", W(2, "آب"), 0.2, 0.1),
  own(D + "truck-1.mp3", S(3) - 0.1, 0.9, 0.5),
  own(D14 + "whisper-1.mp3", W(6, "اسمت") - 0.1, 0.6, 0.3), own(D9 + "stinger-1.mp3", W(6, "هیچ") - 0.2, 0.4, 0.02),
  lib("sfx/ui/toggle-on", W(7, "چراغ") - 0.1, 0.4),
  own(D9 + "drawer-1.mp3", W(8, "باز"), 0.3, 0.3),
  own(D + "pound-1.mp3", W(9, "مشت"), 0.9, 0.05), own(D + "pound-1.mp3", S(10) + 0.05, 0.8, 0.05), own(D9 + "knock-1.mp3", E(10) + 0.25, 0.7, 0.05),
  own(D9 + "drawer-1.mp3", S(11) - 0.1, 0.5, 0.3),
  own(D9 + "stinger-1.mp3", W(12, "لبخند"), 0.6, 0.02),
  ...[0, 2, 4, 6].map((k, i) => own(D9 + "lampoff-1.mp3", lampA + ((lampB - lampA) * k) / 7, 0.4 + i * 0.1, 0.1)),
  ...[2, 3, 4, 5, 6, 7, 8, 9, 11, 13].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
fs.writeFileSync("out/v16-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v16/narration.wav",
  music: [
    { file: "public/audio/music/horror/floor-1.mp3", at: 0, from: 30, to: +(W(12, "لبخند") - 0.1).toFixed(2), fadeIn: 1.0, fadeOut: 0.2, gain: 0.26 },
    { file: "public/audio/music/horror/floor-1.mp3", at: +(S(14) - 0.3).toFixed(2), from: 120, to: +END.toFixed(2), fadeIn: 0.5, fadeOut: 1.5, gain: 0.22 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: +END.toFixed(2), vol: 0.16 },
    { file: D9 + "drone-1.mp3", from: +(W(12, "لبخند")).toFixed(2), to: +(S(14) - 0.3).toFixed(2), vol: 0.07 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
