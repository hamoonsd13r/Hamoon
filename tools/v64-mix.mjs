// V64 · audio: narration (public/v64/vo.wav) + playful music (sunny-afternoon) while the power is fun, a dark low bed
// (game-over-4) from the silent morning to the hall, and mixed-signals for the reveal. The phase shimmer, whoosh, ball
// bounce, car door, engine and the reveal drone are synthesised for this video (public/v64/sfx, numpy, this session).
// Usage: (esbuild src/v64/Video.tsx → out/v64/vt.cjs) node tools/v64-mix.mjs && node tools/mix.mjs videos/64-rad/mix.json --out public/v64/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v64/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v64/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
fl("phase", S(1) + 0.8, 0.4, 0.15); fl("swoosh", S(2), 0.3); fl("phase", S(2) + 0.4, 0.3, 0.15);
fl("phase", S(4) + 0.4, 0.35, 0.15); fl("phase", S(5) + 0.2, 0.3, 0.15);
fl("bounce", S(7) + 0.2, 0.35, 0.01); fl("phase", wd(7, "دقیقا"), 0.35, 0.15);
fl("cardoor", S(10) + 1.2, 0.4, 0.01);
beds.push({ file: "public/v64/sfx/engine.wav", from: +S(11).toFixed(3), to: +S(16).toFixed(3), vol: 0.07 });
beds.push({ id: "sfx/ambience/rain", from: +S(13).toFixed(3), to: +S(16).toFixed(3), vol: 0.1 });
fl("cardoor", S(18) + 0.5, 0.35, 0.01); fx("sfx/door/door-05", S(19), 0.3);
fl("reveal", S(21) - 0.1, 0.6, 0.05); fl("phase", S(22) + 0.4, 0.3, 0.15);
const dark = S(8) - 0.3, sad = S(20) - 0.3;
const music = [
  { file: "public/audio/music/chiptune/sunny-afternoon.mp3", at: 0, from: 0, to: +(dark + 1).toFixed(3), fadeIn: 0.3, fadeOut: 1.0, gain: 0.05 },
  { file: "public/audio/music/dark/game-over-4.mp3", at: +dark.toFixed(3), from: 0, to: +(sad - dark + 0.8).toFixed(3), fadeIn: 1.2, fadeOut: 0.8, gain: 0.05 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +sad.toFixed(3), from: 0, to: +(LEN - sad).toFixed(3), fadeIn: 1.0, fadeOut: 2.5, gain: 0.08 },
];
fs.writeFileSync("videos/64-rad/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v64/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/64-rad/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
