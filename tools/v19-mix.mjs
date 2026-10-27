// v19 mix plan → out/v19-mix.json (beats from src/v19/words.json, same needles as src/v19/Video.tsx), then: node tools/mix.mjs out/v19-mix.json --out public/v19/mix.wav
// The jump scare lands at SCARE = E(11) + 1.05 after ~1.5 s of total silence (music + beds cut).
import fs from "node:fs";
const WD = JSON.parse(fs.readFileSync("src/v19/words.json", "utf8"));
const W = (si, n, nth = 0) => { const h = WD.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => WD.find((w) => w.si === si).s;
const E = (si) => WD.filter((w) => w.si === si).at(-1).e;
const END = E(14) + 2.4;
const SCARE = E(11) + 1.05;
const D = "videos/19-shab-4/sfx/", D9 = "videos/09-pomp-benzin/sfx/", D14 = "videos/14-shab-2/sfx/";
const own = (f, at, vol, peak = 0.05) => ({ file: f, at: +at.toFixed(3), vol: +(vol * 0.25).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const sfx = [
  own(D + "breath-1.mp3", 0.6, 0.45, 1.0),
  own(D9 + "stinger-1.mp3", 0.05, 0.35, 0.02),
  lib("sfx/ui/toggle-on", S(2) - 0.1, 0.35),
  own(D9 + "drawer-1.mp3", W(2, "دفترچه"), 0.15, 0.3),
  own(D9 + "stinger-1.mp3", W(3, "منه"), 0.45, 0.02),
  own(D14 + "whisper-1.mp3", S(5), 0.5, 0.3),
  own(D + "creak-1.mp3", W(6, "باز") - 0.3, 0.9, 1.0),
  own(D9 + "vibrate-1.mp3", W(8, "پیام") - 0.1, 0.8), own(D9 + "vibrate-1.mp3", S(12) - 0.05, 0.8),
  lib("sfx/body/heartbeat", S(10) + 0.2, 0.35), lib("sfx/body/heartbeat", S(10) + 1.7, 0.4), lib("sfx/body/heartbeat-fast", S(11) - 0.1, 0.45),
  // the scare: one frame of a whoosh in, then everything at once
  lib("sfx/whoosh/fast-bright", SCARE - 0.08, 0.5),
  own(D + "scream-1.mp3", SCARE, 2.2, 0.05),
  own(D9 + "stinger-1.mp3", SCARE, 1.6, 0.02),
  own(D14 + "powerdown-1.mp3", SCARE + 0.05, 0.6, 0.05),
  ...[1, 2, 3, 4, 6, 7, 8, 10, 14].map((si) => lib("sfx/whoosh/swish-13", S(si) - 0.22, 0.12)),
];
const silenceFrom = E(11) + 0.2;
fs.writeFileSync("out/v19-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v19/narration.wav",
  music: [
    { file: "public/audio/music/horror/floor-4.mp3", at: 0, from: 0, to: +silenceFrom.toFixed(2), fadeIn: 1.0, fadeOut: 0.6, gain: 0.28 },
    { file: "public/audio/music/horror/floor-4.mp3", at: +(S(14) - 0.3).toFixed(2), from: 100, to: +END.toFixed(2), fadeIn: 0.5, fadeOut: 1.5, gain: 0.22 },
  ],
  beds: [
    { id: "sfx/ambience/wind", from: 0, to: +silenceFrom.toFixed(2), vol: 0.14 },
    { file: D9 + "drone-1.mp3", from: +S(6).toFixed(2), to: +silenceFrom.toFixed(2), vol: 0.07 },
    { id: "sfx/ambience/wind", from: +(SCARE + 1.4).toFixed(2), to: +END.toFixed(2), vol: 0.12 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2), "scare", SCARE.toFixed(2));
