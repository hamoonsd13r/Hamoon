// V58 · audio: narration (public/v58/vo.wav) + music (cave → game-over → mixed-signals for the ending) + effects on
// the visible events. Cart squeaks and thumps, the brass mail-slot clack, the stamp machine, paper tears, the
// folding crinkle and bike ticking are synthesised for this video (public/v58/sfx, numpy, this session).
// Usage: (esbuild src/v58/Video.tsx → out/v58/vt.cjs) node tools/v58-mix.mjs && node tools/mix.mjs videos/58-namehresun/mix.json --out public/v58/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, wd, END } = require("../out/v58/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v58/vo.json", "utf8"));
const bare = (x) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
const L = (n) => V.words.filter((x) => x.line === n);
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.01) => sfx.push({ file: `public/v58/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
fx("sfx/impact/subdrop-long", 0.1, 0.3);
bed("sfx/ambience/night-crickets", 0, S(4), 0.15); bed("sfx/ambience/wind", 0, S(4), 0.1);
fx("sfx/riser/downlifter-dark", S(3), 0.3);
fl("clack", S(4) + 1.0, 0.45, 0.01);
fx("sfx/whoosh/deep", S(7), 0.2);
fx("sfx/impact/soft-thump", S(8) + 0.9, 0.3);
fx("sfx/mechanical/gear-winding", S(9) + 0.6, 0.15);
fx("sfx/magic/sparkle", S(16) + 0.3, 0.2);
fx("sfx/impact/subdrop-long", S(17), 0.35); fx("sfx/body/heartbeat", S(19), 0.32); fx("sfx/body/heartbeat", S(19) + 0.9, 0.3);
fx("sfx/riser/downlifter-dark", S(21), 0.3);
bed("sfx/ambience/night-crickets", S(24), S(31), 0.15); bed("sfx/ambience/wind", S(24), S(31), 0.1);
for (const w of L(25)) { const b = bare(w.w); if (b.startsWith("جیرجیر")) fl("squeak", w.s, 0.4, 0.15); if (b === "تاپ") fl("thump", w.s, 0.55, 0.01); }
for (const w of L(39)) if (bare(w.w).startsWith("جیرجیر")) fl("squeak", w.s, 0.4, 0.15);
fx("sfx/riser/downlifter-dark", S(26) + 0.5, 0.3);
for (const w of L(29)) fl("clack", w.s, 0.5, 0.01);
fl("bike", S(30) + 0.3, 0.3, 0.05);
fx("sfx/door/door-02-2", S(31) + 0.4, 0.35);
bed("sfx/ambience/room-tone", S(32), S(53), 0.18);
fx("sfx/transition/swell-bell", S(32) + 0.3, 0.3);
for (const d of [0.4, 1.2, 2.0, 2.8]) fl("stamp", S(34) + d, 0.35, 0.01);
fx("sfx/magic/shimmer-pad", S(35) + 0.3, 0.2);
fx("sfx/mechanical/clock-tick-tock", S(36), 0.25);
fx("sfx/magic/sparkle", S(37) + 1.0, 0.2);
fx("sfx/body/heartbeat", S(40) + 1.0, 0.3); fx("sfx/body/heartbeat", S(41), 0.32);
for (const w of L(42)) if (bare(w.w) === "تق") fl("clack", w.s, 0.55, 0.01);
fx("sfx/impact/subdrop-long", S(43) + 0.5, 0.35);
fx("sfx/mechanical/clock-tick-tock", S(45), 0.25);
fl("clack", S(47), 0.7, 0.01); fx("sfx/impact/cinematic-heavy", S(47), 0.35);
fl("fold", S(48) + 0.2, 0.5, 0.3); fx("sfx/magic/shimmer-pad", S(48) + 0.4, 0.25);
fx("sfx/impact/soft-thump", S(49) + 1.2, 0.3);
fl("tear", wd(50, "پاره"), 0.55, 0.1); for (const d of [0.5, 1.0, 1.4, 1.9]) fl("tear", S(51) + d, 0.4, 0.1);
fx("sfx/transition/swell-bell", S(54), 0.3); fl("bike", S(54) + 0.3, 0.25, 0.05);
fx("sfx/magic/sparkle", S(56) + 0.5, 0.25);
fx("sfx/riser/downlifter-dark", S(58), 0.35); fl("squeak", S(59) - 0.3, 0.35, 0.15); fl("clack", S(59) + 0.6, 0.55, 0.01); fx("sfx/impact/subdrop-long", S(59) + 0.6, 0.4);
const turn = S(24) - 0.5, end = S(54) - 0.5;
const music = [
  { file: "public/audio/music/ambient/cave-1.mp3", at: 0, from: 0, to: +(turn + 3).toFixed(3), fadeIn: 0.5, fadeOut: 3, gain: 0.06 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +turn.toFixed(3), from: 0, to: +(end - turn + 2).toFixed(3), fadeIn: 3, fadeOut: 2, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +end.toFixed(3), from: 0, to: +(S(58) - end + 1).toFixed(3), fadeIn: 2, fadeOut: 1.5, gain: 0.08 },
  { file: "public/audio/music/dark/game-over-4.mp3", at: +(S(58) - 0.3).toFixed(3), from: 0, to: +(LEN - S(58) + 0.3).toFixed(3), fadeIn: 0.5, fadeOut: 1, gain: 0.07 },
];
fs.writeFileSync("videos/58-namehresun/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v58/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/58-namehresun/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
