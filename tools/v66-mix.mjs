// V66 · audio: narration (public/v66/vo.wav, chandelier cut by tools/v66-cut.py) + tense music while the shield fades
// and the clock runs (game-over-3), quiet-village inside the store, mixed-signals from the memory to the end. Shield and
// golden glow, memory swell come from V65; ceramic smash and register ding from V61; clunk (lights off), clock tick,
// running steps, coins and the door bell are synthesised for this video (public/v66/sfx, numpy, this session).
// Usage: (esbuild src/v66/Video.tsx → out/v66/vt.cjs) node tools/v66-mix.mjs && node tools/mix.mjs videos/66-hedie/mix.json --out public/v66/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v66/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v66/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
fl("shield", S(1) + 0.3, 0.25, 0.15); fl("golden", wd(2, "روشن"), 0.35, 0.01); fl("shield", S(3) + 0.5, 0.15, 0.15);
fl("golden", wd(7, "برق"), 0.4, 0.01); fl("shield", S(8) + 1.2, 0.15, 0.15);
fl("smash", wd(9, "شکستم"), 0.5); fl("coins", wd(9, "شکستم") + 0.1, 0.4, 0.01); fl("steps", wd(9, "دویدم"), 0.45, 0.01);
fl("tick", S(10) + 0.8, 0.35, 0.005); fl("doorbell", S(11), 0.3, 0.005);
fx("sfx/pop/pop-2", wd(13, "هیچی") - 0.05, 0.3); fx("sfx/impact/soft-thump", wd(14, "نشستم"), 0.35); fx("sfx/pop/pop-2", wd(14, "هیچی") - 0.05, 0.3);
fl("clunk", wd(15, "تق"), 0.55, 0.005); fl("clunk", wd(15, "تق", 2), 0.55, 0.005); fl("tick", S(15) + 0.3, 0.25, 0.005);
fx("sfx/impact/subdrop-long", S(19), 0.25);
fl("memory", S(21) - 0.2, 0.3); fl("memory", S(22) - 0.2, 0.25);
fl("golden", wd(24, "دینگ") - 0.02, 0.7, 0.01);
fl("coins", wd(25, "ریختم"), 0.4, 0.01); fl("tick", S(27), 0.3, 0.005); fl("register", wd(29, "درست"), 0.4, 0.01);
fx("sfx/foley/cloth-2", S(31) + 0.6, 0.3); fl("golden", wd(32, "روشن"), 0.7, 0.01); fx("sfx/magic/sparkle", S(32) + 1.0, 0.25);
fl("shield", wd(34, "آبی") - 0.1, 0.4, 0.15); fx("sfx/magic/sparkle-rise", S(36), 0.2);
const tense = S(8) - 0.3, store = S(11) - 0.3, memory = S(20) - 0.3;
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(tense + 1).toFixed(3), fadeIn: 0.4, fadeOut: 1.0, gain: 0.06 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +tense.toFixed(3), from: 0, to: +(store - tense + 0.8).toFixed(3), fadeIn: 0.8, fadeOut: 0.8, gain: 0.06 },
  { file: "public/audio/music/chiptune/sunny-afternoon.mp3", at: +store.toFixed(3), from: 0, to: +(memory - store + 1).toFixed(3), fadeIn: 0.8, fadeOut: 1.0, gain: 0.04 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +memory.toFixed(3), from: 0, to: +(LEN - memory).toFixed(3), fadeIn: 1.5, fadeOut: 2.5, gain: 0.08 },
];
fs.writeFileSync("videos/66-hedie/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v66/vo.wav", music, beds: [], sfx }, null, 1));
console.log("videos/66-hedie/mix.json", sfx.length, "sfx", LEN, "s");
