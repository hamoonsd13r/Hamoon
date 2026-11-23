// V60 · audio: narration (public/v60/vo.wav) + light music for the comedy intro (quiet-village), dark under the
// avalanche and the search (game-over), emotional after the red mitten (mixed-signals), back to light for the last
// gag; effects on the visible events. Snow crunch, ice crack, avalanche rumble, winter wind, helmet ding, siren and a
// cartoon boing are synthesised for this video (public/v60/sfx, numpy, this session).
// Usage: (esbuild src/v60/Video.tsx → out/v60/vt.cjs) node tools/v60-mix.mjs && node tools/mix.mjs videos/60-dard/mix.json --out public/v60/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v60/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v60/vo.json", "utf8"));
const L = (n) => V.words.filter((x) => x.line === n);
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v60/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
// comedy intro
fl("boing", S(5) + 0.6, 0.35); fx("sfx/impact/soft-thump", S(6) + 0.5, 0.35); fl("boing", S(6) + 0.6, 0.3);
for (const [i, d] of [0.3, 0.6, 0.9, 1.2, 1.5].entries()) fx("sfx/impact/soft-thump", S(8) + 1.2 + d, 0.3 - i * 0.03);
for (const w of L(9)) fl("boing", w.s, 0.3);
fx("sfx/impact/soft-thump", S(11) + 0.8, 0.3); fl("boing", wd(12, "گاو"), 0.35);
fx("sfx/impact/soft-thump", S(16) + 0.3, 0.3);
// winter
bed("public/v60/sfx/wind.wav", S(17), S(30), 0.14);
fx("sfx/mechanical/gear-winding", S(17) + 0.5, 0.2);
for (const d of [0.4, 1.0, 1.6]) fl("snow", S(19) + d, 0.25);
fx("sfx/riser/downlifter-dark", S(21), 0.3);
fl("crack", S(22), 0.6, 0.05); fl("avalanche", S(24), 0.55, 0.6); fx("sfx/impact/cinematic-heavy", S(25), 0.55); fx("sfx/impact/subdrop-long", S(25), 0.35);
fx("sfx/body/heartbeat", S(27) + 0.4, 0.32); fx("sfx/body/heartbeat", S(28) + 0.2, 0.32); fx("sfx/body/heartbeat", S(29) + 0.2, 0.3);
fl("siren", S(30) - 0.5, 0.35, 0.5);
bed("public/v60/sfx/wind.wav", S(31), S(50), 0.12);
for (const d of [0.5, 1.3, 2.1, 2.9]) fl("snow", S(31) + d, 0.3);
for (const d of [0.4, 1.2]) fl("snow", S(32) + d, 0.3);
fx("sfx/mechanical/clock-tick-tock", S(35), 0.25);
fx("sfx/riser/downlifter-dark", S(36) + 0.5, 0.3); fx("sfx/body/heartbeat", S(37), 0.32);
for (const n of [41, 44]) for (const w of L(n)) if (w.w.startsWith("فرو")) fl("snow", w.s, 0.45);
for (const w of L(42)) fx("sfx/impact/rock-hit-01", w.s, 0.4);
fx("sfx/mechanical/clock-tick-tock", S(43), 0.3); fx("sfx/body/heartbeat", S(45), 0.35);
fl("snow", S(45) + 0.6, 0.5); fx("sfx/impact/cinematic-heavy", S(46), 0.45);
for (const d of [0.3, 0.8, 1.3, 1.8]) fl("snow", S(47) + d, 0.35);
fl("ding", wd(48, "دینگ") - 0.05, 0.55, 0.01);
for (const d of [0.3, 0.9, 1.5]) fl("snow", S(49) + d, 0.35);
fx("sfx/transition/swell-bell", S(50), 0.35); fx("sfx/magic/shimmer-pad", S(52), 0.25);
fl("boing", S(60) - 0.1, 0.35); fx("sfx/impact/soft-thump", S(58) + 1.8, 0.35);
const dark = S(17) - 0.5, warm = S(50) - 0.4, light = S(58) - 0.3;
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(dark + 2).toFixed(3), fadeIn: 0.3, fadeOut: 2, gain: 0.07 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +dark.toFixed(3), from: 0, to: +(warm - dark + 1).toFixed(3), fadeIn: 2, fadeOut: 1.2, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +warm.toFixed(3), from: 0, to: +(light - warm + 1.5).toFixed(3), fadeIn: 1.5, fadeOut: 1.5, gain: 0.08 },
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: +light.toFixed(3), from: 20, to: +(20 + LEN - light).toFixed(3), fadeIn: 0.8, fadeOut: 1.5, gain: 0.07 },
];
fs.writeFileSync("videos/60-dard/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v60/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/60-dard/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
