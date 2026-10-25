// v09 mix plan → out/v09-mix.json (beats from src/v09/words.json, same needles as src/v09/Video.tsx), then: node tools/mix.mjs out/v09-mix.json --out public/v09/mix.wav
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v09/words.json", "utf8"));
const W = (si, n) => WD.find((x) => x.si === si && x.w.includes(n)).s;
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(16) + 2.4;
const D = "videos/09-pomp-benzin/sfx/";
const own = (n, at, vol, peak = 0.05) => ({ file: `${D}${n}-1.mp3`, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const a = W(1, "یکی"), b = W(1, "تو") + 0.15;
const lamps = [0, 2, 4, 6, 8].map((k) => a + ((b - a) * k) / 8);
const sfx = [
  ...lamps.map((t, i) => own("lampoff", t, 0.5 + i * 0.12, 0.1)),
  own("vibrate", W(2, "می‌لرزه") - 0.05, 0.9), own("alert", W(2, "پیامک"), 0.6, 0.1),
  lib("sfx/glitch/static", S(4) - 0.2, 0.15),
  own("tires", S(7) + 0.4, 0.8, 1.0),
  own("knock", E(8) + 0.05, 1.0, 0.05),
  own("knock", W(9, "باز") - 0.05, 0.6, 0.05),
  own("drawer", W(10, "باز"), 0.8, 0.3),
  lib("sfx/glitch/static", S(12) - 0.1, 0.4), lib("sfx/glitch/static", S(13) - 0.05, 0.25), lib("sfx/glitch/static", E(13) + 0.05, 0.3),
  own("stinger", S(15) - 0.02, 1.1, 0.02),
  ...[1, 3, 5, 6, 7, 10, 11, 14, 16].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.2, 0.12)),
];
fs.writeFileSync("out/v09-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v09/narration.wav",
  music: [
    { file: "public/audio/music/horror/floor-1.mp3", at: 0, from: 0, to: +(S(15) - 0.1).toFixed(2), fadeIn: 1.5, fadeOut: 0.3, gain: 0.26 },
    { file: "public/audio/music/horror/floor-1.mp3", at: +(S(16) - 0.3).toFixed(2), from: 60, to: +END.toFixed(2), fadeIn: 0.5, fadeOut: 1.5, gain: 0.22 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: +END.toFixed(2), vol: 0.18 },
    { file: `${D}drone-1.mp3`, from: +(S(13)).toFixed(2), to: +(S(15) - 0.05).toFixed(2), vol: 0.06 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
