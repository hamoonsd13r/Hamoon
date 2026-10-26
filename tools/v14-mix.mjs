// v14 mix plan → out/v14-mix.json (beats from src/v14/words.json, same needles as src/v14/Video.tsx), then: node tools/mix.mjs out/v14-mix.json --out public/v14/mix.wav
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v14/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(17) + 2.4;
const D = "videos/14-shab-2/sfx/", D9 = "videos/09-pomp-benzin/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const sfx = [
  own(D + "cctv-1.mp3", 0.05, 0.6), own(D9 + "drawer-1.mp3", W(0, "باز", 1), 0.35, 0.3),
  own(D + "cctv-1.mp3", S(1) - 0.2, 0.5), own(D9 + "stinger-1.mp3", W(1, "پوشیده"), 0.55, 0.02),
  own(D9 + "alert-1.mp3", W(2, "باتری"), 0.25, 0.1),
  own(D + "ring-1.mp3", W(4, "زنگ"), 0.8, 0.1), own(D + "pickup-1.mp3", S(5) + 0.1, 0.8, 0.1),
  own(D9 + "vibrate-1.mp3", W(7, "می‌لرزه"), 0.9),
  own(D + "scratch-1.mp3", W(9, "ناخن") - 0.1, 0.9, 0.3),
  own(D + "cctv-1.mp3", S(10) - 0.2, 0.5), own(D + "cctv-1.mp3", S(13) - 0.15, 0.6),
  own(D9 + "stinger-1.mp3", S(13) - 0.05, 0.7, 0.02),
  own(D + "powerdown-1.mp3", S(14) + 0.55, 1.0, 0.05),
  own(D + "whisper-1.mp3", W(15, "آروم") - 0.2, 0.8, 0.3),
  ...[2, 3, 4, 6, 7, 9, 11, 16].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
fs.writeFileSync("out/v14-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v14/narration.wav",
  music: [
    { file: "public/audio/music/horror/floor-6.mp3", at: 0, from: 0, to: +(S(14) + 0.55).toFixed(2), fadeIn: 0.8, fadeOut: 0.1, gain: 0.26 },
    { file: "public/audio/music/horror/floor-6.mp3", at: +(S(16) - 0.3).toFixed(2), from: 90, to: +END.toFixed(2), fadeIn: 0.5, fadeOut: 1.5, gain: 0.22 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: +END.toFixed(2), vol: 0.16 },
    { file: D9 + "drone-1.mp3", from: +(S(9)).toFixed(2), to: +(S(14) + 0.5).toFixed(2), vol: 0.05 },
    { file: D9 + "drone-1.mp3", from: +(S(14) + 0.6).toFixed(2), to: +(S(16) - 0.3).toFixed(2), vol: 0.07 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
