// V61 · audio: narration (public/v61/vo.wav) + light music for the comedy (quiet-village), dark from the storm to the
// fall (game-over), emotional after the magic repair (mixed-signals); effects on the visible events. The magic
// "snap" repair, counter ding, ceramic smash, wood crack, rope creak, bridge boing, river, storm and saw are
// synthesised for this video (public/v61/sfx, numpy, this session).
// Usage: (esbuild src/v61/Video.tsx → out/v61/vt.cjs) node tools/v61-mix.mjs && node tools/mix.mjs videos/61-bebakhshid/mix.json --out public/v61/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, wd, END } = require("../out/v61/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v61/vo.json", "utf8"));
const bare = (x) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
const L = (n) => V.words.filter((x) => x.line === n);
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v61/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
fl("smash", S(2) + 0.5, 0.35); fl("snap", wd(2, "شتق"), 0.55, 0.62);
fl("ding", wd(3, "دینگ"), 0.5, 0.01); fl("ding", S(4) + 0.3, 0.3, 0.01);
fl("smash", S(6) + 0.6, 0.3); fx("sfx/impact/soft-thump", S(9) + 1.4, 0.4); fl("snap", S(10) + 0.4, 0.45, 0.62);
fl("smash", S(12), 0.6); fl("snap", wd(13, "شتق"), 0.55, 0.62);
fl("ding", wd(15, "یکی"), 0.4, 0.01);
for (const w of L(22)) if (bare(w.w).startsWith("بوینگ")) fl("boing", w.s, 0.45);
bed("public/v61/sfx/river.wav", S(21), S(24), 0.1);
bed("public/v61/sfx/storm.wav", S(24), S(25), 0.35); fx("sfx/impact/distant-boom", S(24) + 0.6, 0.4);
bed("public/v61/sfx/river.wav", S(25), S(49), 0.14);
fx("sfx/ambience/wind", S(27), 0.3); fx("sfx/whoosh/deep", S(27) + 0.4, 0.3);
fl("crack", wd(29, "ترررق"), 0.6, 0.02); fl("crack", S(30) + 0.3, 0.45, 0.02);
fx("sfx/body/heartbeat", S(31) + 0.5, 0.3); fl("creak", S(32) + 1.0, 0.45, 0.6);
fx("sfx/body/heartbeat", S(33), 0.32); fx("sfx/body/heartbeat", S(33) + 1.0, 0.32);
fl("smash", S(34) + 0.6, 0.25); fl("saw", S(36) + 0.6, 0.35, 0.25);
fx("sfx/impact/soft-thump", S(38) + 1.6, 0.4); fl("ding", wd(39, "دینگ"), 0.6, 0.01); fx("sfx/impact/subdrop-long", wd(39, "دینگ"), 0.3);
fx("sfx/riser/downlifter-dark", S(40), 0.3);
fl("boing", wd(44, "بوینگ"), 0.5); fl("crack", wd(44, "تق"), 0.6, 0.02); fx("sfx/whoosh/deep", S(45), 0.35);
fl("snap", wd(46, "شتق"), 0.6, 0.62); fx("sfx/transition/swell-bell", wd(46, "شتق"), 0.35);
for (const w of L(47)) if (bare(w.w).startsWith("شتق")) fl("snap", w.s, 0.4, 0.62);
fx("sfx/magic/shimmer-pad", S(48), 0.3); fx("sfx/magic/sparkle-rise", S(48) + 1.0, 0.25);
fx("sfx/magic/sparkle", S(52) + 1.5, 0.2);
const dark = S(24) - 0.4, warm = S(46) - 0.3;
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(dark + 1.5).toFixed(3), fadeIn: 0.3, fadeOut: 1.5, gain: 0.07 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +dark.toFixed(3), from: 0, to: +(warm - dark + 1).toFixed(3), fadeIn: 1.5, fadeOut: 1.0, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +warm.toFixed(3), from: 0, to: +(LEN - warm).toFixed(3), fadeIn: 1.2, fadeOut: 2, gain: 0.08 },
];
fs.writeFileSync("videos/61-bebakhshid/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v61/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/61-bebakhshid/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
