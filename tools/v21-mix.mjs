// v21 mix plan → out/v21-mix.json (times from src/v21/words.json, same needles as src/v21/Video.tsx), then: node tools/mix.mjs out/v21-mix.json --out public/v21/mix.wav
// Music: the reference reel's own track with the narrator removed (demucs) → public/v21/ref-music.mp3 (75 s), second pass crossfaded in to cover the end.
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v21/words.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,]/g, "");
const W = (si, n) => (WD.find((x) => x.si === si && bare(x.w) === n) ?? WD.find((x) => x.si === si && x.w.includes(n))).s;
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const CARDS = [E(1) + 0.3, E(5) + 0.3, E(9) + 0.3, E(13) + 0.3];
const T12 = W(4, "دوازده"), BELL = S(7), LIGHTS_OFF = W(8, "خاموش"), NAME = W(12, "خودت"), WHISPER = W(13, "هرچی"), BTN = W(17, "دکمه");
const DOOR = E(17) + 0.5, END = DOOR + 1.1, TOTAL = END + 3.2;
const D = "videos/21/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D13 = "videos/13/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const sfx = [
  ...CARDS.map((c) => own(D + "ecg-1.mp3", c + 0.08, 0.13)),
  own(D9 + "stinger-1.mp3", T12, 0.12, 0.02),
  lib("sfx/paper/slide", S(5) + 0.25, 0.35),
  own(D + "bell-1.mp3", BELL - 0.05, 0.25),
  lib("sfx/body/heartbeat", W(7, "پلمبه"), 0.35),
  own(D + "wheel-1.mp3", W(8, "ویلچر") - 0.2, 0.55),
  lib("sfx/ui/toggle-off", LIGHTS_OFF, 0.5),
  own(D13 + "breath-1.mp3", E(9) - 0.4, 0.3, 0.3),
  lib("sfx/body/heartbeat", E(9) + 0.1, 0.4),
  own(D + "ding-1.mp3", CARDS[2] + 1.35, 0.3),
  lib("sfx/paper/slide", NAME + 0.1, 0.3),
  own(D9 + "stinger-1.mp3", NAME, 0.12, 0.02),
  lib("sfx/impact/subdrop-punch", WHISPER - 0.1, 0.35),
  own(D13 + "whisper-1.mp3", WHISPER + 0.4, 0.4, 0.3),
  own(D9 + "stinger-1.mp3", W(16, "چشمات"), 0.14, 0.02),
  lib("sfx/ui/key-mech", BTN + 0.15, 0.5),
  own(D + "descend-1.mp3", END - 0.05, 0.6, 0.1),
  lib("sfx/impact/subdrop-long", END + 0.3, 0.35),
];
fs.writeFileSync("out/v21-mix.json", JSON.stringify({
  length: +TOTAL.toFixed(2), voice: "public/v21/narration.wav",
  music: [
    { file: "public/v21/ref-music.mp3", at: 0, from: 0, to: 74.5, fadeIn: 0.05, fadeOut: 3, gain: 0.8 },
    { file: "public/v21/ref-music.mp3", at: 71.5, from: 14, to: +TOTAL.toFixed(2), fadeIn: 3, fadeOut: 2.5, gain: 0.8 },
  ],
  beds: [
    { id: "sfx/ambience/rain", from: 0, to: +S(1).toFixed(2), vol: 0.04 },
    { file: D + "buzz-1.mp3", from: +(S(3) - 0.2).toFixed(2), to: +(E(5) + 0.3).toFixed(2), vol: 0.05 },
    { file: D + "buzz-1.mp3", from: +(CARDS[2] + 1.2).toFixed(2), to: +(E(13) + 0.3).toFixed(2), vol: 0.04 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", TOTAL.toFixed(2));
