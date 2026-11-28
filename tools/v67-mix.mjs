// V67 · audio: narration (public/v67/vo.wav) + playful music (sunny-afternoon) for the dragon world, happy-dance for the
// first flight, game-over-3 in the cave, mixed-signals for grandpa and grandma. Sneeze puffs, fire, dragon growl and the
// eye swell are synthesised for this video (public/v67/sfx, numpy, this session); wing flaps and wind from V62, rumble from V63.
// Usage: (esbuild src/v67/Video.tsx → out/v67/vt.cjs) node tools/v67-mix.mjs && node tools/mix.mjs videos/67-atse/mix.json --out public/v67/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v67/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v67/vo.json", "utf8"));
const bare = (x) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v67/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
for (const w of V.words.filter((x) => bare(x.w).startsWith("هاپچه"))) fl("puff", w.s + 0.25, 0.35, 0.01);
fl("flap", wd(5, "بال"), 0.35); fl("fire", wd(5, "آتیش"), 0.35, 0.05); fl("flap", S(6) + 1.0, 0.3);
fl("growl", S(7) + 1.5, 0.3, 0.3); fl("flap", S(10) + 0.4, 0.3); fx("sfx/foley/cloth-2", S(9) + 0.3, 0.25); fl("fire", wd(9, "عطسه"), 0.3, 0.05);
fl("wind", S(17), 0.2); fl("flap", S(19) + 0.5, 0.3);
fl("flap", S(27), 0.5); fx("sfx/whoosh/deep", wd(28, "دور"), 0.35); fl("wind", S(28), 0.25);
beds.push({ file: "public/v67/sfx/growl.wav", from: +S(29).toFixed(3), to: +S(43).toFixed(3), vol: 0.06 });
fl("rumble", wd(30, "غلت"), 0.5); fl("fire", wd(31, "فوووش"), 0.6, 0.05);
fl("flap", S(33) + 1.2, 0.45); fl("eye", S(41) - 0.2, 0.55, 0.5); fl("growl", S(41) + 1.2, 0.35, 0.3);
fl("flap", wd(42, "برق"), 0.5); fx("sfx/whoosh/fast-bright", wd(42, "برق"), 0.4);
fl("flap", S(48), 0.4); fx("sfx/magic/sparkle-rise", S(48) + 1.5, 0.2);
const fly = S(27) - 0.2, cave = S(29) - 0.3, home = S(43) - 0.4;
const music = [
  { file: "public/audio/music/chiptune/sunny-afternoon.mp3", at: 0, from: 0, to: +(fly + 0.6).toFixed(3), fadeIn: 0.3, fadeOut: 0.6, gain: 0.05 },
  { file: "public/audio/music/upbeat/happy-dance.mp3", at: +fly.toFixed(3), from: 0, to: +(cave - fly + 0.8).toFixed(3), fadeIn: 0.3, fadeOut: 0.8, gain: 0.06 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +cave.toFixed(3), from: 0, to: +(home - cave + 1).toFixed(3), fadeIn: 1.0, fadeOut: 1.0, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +home.toFixed(3), from: 0, to: +(LEN - home).toFixed(3), fadeIn: 1.2, fadeOut: 2.2, gain: 0.08 },
];
fs.writeFileSync("videos/67-atse/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v67/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/67-atse/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
