// V62 · audio: narration (public/v62/vo.wav) + light comedy music (quiet-village) until the crow takes Niloo,
// tension (game-over) through the flight and the crash, warm (mixed-signals) for the apologies. Effects sit on the
// visible events. The magic pop, crow caw, wing flaps, feather rip, chimney bonk, rose-bush crash, reversing beep,
// spin and wind are synthesised for this video (public/v62/sfx, numpy, this session).
// Usage: (esbuild src/v62/Video.tsx → out/v62/vt.cjs) node tools/v62-mix.mjs && node tools/mix.mjs videos/62-fohsh/mix.json --out public/v62/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v62/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v62/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
const pop = (at, v = 0.5) => { fl("pop", at, v, 0.01); fx("sfx/magic/sparkle", at + 0.05, v * 0.35); };
pop(wd(2, "پاپ")); fl("pop", wd(5, "نی‌نی") + 0.5, 0.25, 0.01); fl("pop", S(7) + 0.2, 0.3, 0.01);
pop(wd(10, "پاپ"));
fl("beep", wd(12, "بیپ"), 0.3, 0.005); fl("beep", wd(12, "بیپ", 2), 0.3, 0.005); fl("beep", S(12) + 1.6, 0.18, 0.005); fl("beep", S(12) + 2.4, 0.14, 0.005);
fx("sfx/whoosh/fast-bright", wd(13, "ووش") - 0.1, 0.45); fl("flap", wd(13, "ووش") + 0.1, 0.4); fl("caw", wd(13, "قاپیدش") + 0.5, 0.25);
fl("flap", S(15) + 0.1, 0.35);
fl("wind", S(17), 0.3); fl("caw", wd(18, "هیچی") + 0.25, 0.18);
bed("public/v62/sfx/wind.wav", S(19), S(22), 0.08);
fx("sfx/body/heartbeat", S(25), 0.3); fx("sfx/body/heartbeat", S(25) + 0.8, 0.3);
pop(wd(27, "پاپ"), 0.7); fx("sfx/impact/subdrop-long", wd(27, "پاپ"), 0.3); fl("flap", S(28) + 0.2, 0.45);
fl("flap", S(29) + 0.1, 0.5); fx("sfx/whoosh/deep", S(29) + 0.3, 0.35);
fl("flap", S(30) + 1.0, 0.3); fl("bonk", wd(30, "دینگ"), 0.6, 0.002);
fl("wind", S(31), 0.3); fx("sfx/whoosh/deep", S(32) + 0.2, 0.4); fx("sfx/pop/pop-4", wd(32, "قاپ"), 0.6);
fl("caw", wd(35, "قار"), 0.5); fl("caw", wd(35, "قار", 2), 0.55);
fl("flap", S(36), 0.4); fl("caw", S(36) + 1.4, 0.25); fl("rip", wd(37, "شرق"), 0.6, 0.01);
fl("spin", S(38), 0.4);
fl("bush", wd(42, "ترق"), 0.65, 0.01); fx("sfx/impact/soft-thump", wd(42, "ترق"), 0.5);
pop(wd(44, "پاپ"), 0.55); fx("sfx/magic/shimmer-pad", S(45), 0.2);
fl("caw", S(46) + 0.3, 0.15);
pop(wd(47, "پاپ"), 0.55); pop(wd(48, "پاپ"), 0.55); pop(wd(50, "پاپ"), 0.6);
fx("sfx/magic/sparkle-rise", S(51) + 1.0, 0.2);
const dark = wd(13, "ووش") - 0.3, warm = S(43) - 0.2;
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(dark + 1.2).toFixed(3), fadeIn: 0.3, fadeOut: 1.2, gain: 0.07 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +dark.toFixed(3), from: 0, to: +(warm - dark + 1).toFixed(3), fadeIn: 1.0, fadeOut: 1.2, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +warm.toFixed(3), from: 0, to: +(LEN - warm).toFixed(3), fadeIn: 1.2, fadeOut: 2, gain: 0.08 },
];
fs.writeFileSync("videos/62-fohsh/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v62/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/62-fohsh/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
