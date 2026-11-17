// V57 · audio: narration (public/v57/vo.wav) + music (cave → game-over → mixed-signals for the reunion) + effects on
// the visible events. Straw crunches, cornfield rustle, crow caws and a dry-leaves breath are synthesised for this
// video (public/v57/sfx, made with numpy in this session); knocks reuse public/v56/sfx/knock.wav.
// Usage: (esbuild src/v57/Video.tsx → out/v57/vt.cjs) node tools/v57-mix.mjs && node tools/mix.mjs videos/57-matarsak/mix.json --out public/v57/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, wd, END, HITS } = require("../out/v57/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v57/vo.json", "utf8"));
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (file, at, vol = 0.4, peak = 0.01) => sfx.push({ file: file.includes("/") ? file : `public/v57/sfx/${file}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
fx("sfx/impact/subdrop-long", 0.1, 0.3); fl("crow", 1.0, 0.35, 0.15);
bed("sfx/ambience/night-crickets", 0, S(2), 0.16);
bed("public/v57/sfx/rustle.wav", S(3), S(5), 0.18); fx("sfx/riser/downlifter-dark", S(3) + 0.3, 0.3);
fx("sfx/whoosh/deep", S(9), 0.25);
bed("sfx/ambience/night-crickets", S(11), S(14), 0.12);
fx("sfx/magic/shimmer-pad", S(13) + 0.3, 0.2);
bed("sfx/ambience/night-crickets", S(14), S(16), 0.12);
fx("sfx/impact/subdrop-long", wd(18, "بیست"), 0.35); fx("sfx/body/heartbeat", wd(18, "بیست") + 0.6, 0.3);
fx("sfx/whoosh/deep", S(19) + 0.5, 0.3);
fx("sfx/impact/soft-thump", wd(22, "خاموش"), 0.35); fx("sfx/riser/downlifter-dark", S(23), 0.35); fl("crow", S(23) + 1.2, 0.3, 0.15);
fx("sfx/body/heartbeat", S(26), 0.3);
fx("sfx/magic/sparkle", S(28) + 0.8, 0.2);
fl("public/v56/sfx/knock.wav", S(30) + 0.5, 0.5); fl("public/v56/sfx/knock.wav", S(30) + 0.9, 0.5);
bed("sfx/ambience/night-crickets", S(32), S(34), 0.14);
bed("public/v57/sfx/rustle.wav", S(34), S(51), 0.14);
for (const w of V.words.filter((x) => x.line === 34 && x.w.startsWith("خرچ"))) fl("crunch", w.s, 0.7, 0.02);
fx("sfx/impact/cinematic-heavy", S(35) + 0.3, 0.45); fl("crow", S(37), 0.3, 0.15);
fx("sfx/riser/downlifter-dark", S(39) - 0.2, 0.25);
fl("public/v56/sfx/knock.wav", wd(39, "تق"), 0.55); fl("public/v56/sfx/knock.wav", wd(40, "تق"), 0.55);
fx("sfx/impact/subdrop-long", S(43), 0.3); fx("sfx/body/heartbeat", S(44) + 0.4, 0.3); fx("sfx/body/heartbeat", S(45), 0.3); fx("sfx/body/heartbeat", S(45) + 1.0, 0.3);
for (const w of V.words.filter((x) => x.line === 47).slice(0, 3)) fl("public/v56/sfx/knock.wav", w.s, 0.55);
fl("crunch", S(48) + 0.3, 0.4, 0.02); fx("sfx/body/heartbeat", S(49), 0.32); fx("sfx/body/heartbeat", S(50), 0.32);
fl("dry-leaves", wd(52, "صفر") - 0.1, 0.5, 0.25); fx("sfx/impact/cinematic-heavy", wd(52, "صفر"), 0.4);
fx("sfx/transition/swell-bell", S(53) + 0.4, 0.35); fx("sfx/magic/shimmer-pad", S(53) + 0.6, 0.3); fl("crow", S(53) + 0.8, 0.3, 0.15);
fx("sfx/magic/sparkle-rise", S(55), 0.25); fx("sfx/magic/sparkle", S(57), 0.2);
fx("sfx/transition/swell-bell", S(59), 0.3);
fx("sfx/impact/soft-thump", wd(61, "افتاد"), 0.35);
fx("sfx/magic/shimmer-pad", S(64), 0.2);
bed("sfx/ambience/room-tone", S(66), S(68), 0.18);
fx("sfx/riser/downlifter-dark", S(68), 0.35); fl("crow", S(68) + 0.6, 0.3, 0.15); fx("sfx/impact/subdrop-long", S(69), 0.4);
const turn = S(34) - 0.5, warm = S(59) - 0.5;
const music = [
  { file: "public/audio/music/ambient/cave-1.mp3", at: 0, from: 0, to: +(turn + 3).toFixed(3), fadeIn: 0.5, fadeOut: 3, gain: 0.06 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +turn.toFixed(3), from: 0, to: +(warm - turn + 2).toFixed(3), fadeIn: 3, fadeOut: 2, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +warm.toFixed(3), from: 0, to: +(S(68) - warm + 1).toFixed(3), fadeIn: 2, fadeOut: 1.5, gain: 0.08 },
  { file: "public/audio/music/dark/game-over-4.mp3", at: +(S(68) - 0.3).toFixed(3), from: 0, to: +(LEN - S(68) + 0.3).toFixed(3), fadeIn: 0.5, fadeOut: 1, gain: 0.07 },
];
fs.writeFileSync("videos/57-matarsak/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v57/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/57-matarsak/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
