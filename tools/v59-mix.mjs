// V59 · audio: narration (public/v59/vo.wav) + light playful music for the comedy (quiet-village), a sadder bed while
// Hafez is gone (mixed-signals), back to light for the ending; effects on the visible events. The poof, pencil
// scribble, finger trace, cake splat and party murmur are synthesised for this video (public/v59/sfx, numpy, this session).
// Usage: (esbuild src/v59/Video.tsx → out/v59/vt.cjs) node tools/v59-mix.mjs && node tools/mix.mjs videos/59-doost/mix.json --out public/v59/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END, OVERLAYS } = require("../out/v59/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v59/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
fl("poof", 1.6, 0.45); fl("poof", wd(3, "پوف"), 0.6);
bed("public/v59/sfx/party.wav", 0, S(3), 0.12);
fl("pencil", S(2) + 0.3, 0.35, 0.05); fl("pencil", S(4) + 0.4, 0.3, 0.05);
fl("pencil", wd(6, "پیتزا"), 0.35, 0.05); fl("poof", S(7) + 0.4, 0.4); fl("poof", S(7) + 1.0, 0.3);
fx("sfx/transition/swell-bell", S(8), 0.25);
fx("sfx/magic/sparkle", S(10) + 1.4, 0.2);
fl("poof", wd(12, "غیب"), 0.45); fx("sfx/impact/soft-thump", S(13) + 0.6, 0.25);
fl("trace", S(16) + 1.0, 0.45, 0.35); fl("trace", wd(17, "کشید"), 0.45, 0.35);
bed("public/v59/sfx/party.wav", S(18), S(23), 0.14);
fl("pencil", wd(21, "تولدت"), 0.45, 0.05);
fl("poof", S(23), 0.65); fx("sfx/impact/subdrop-long", S(23), 0.3);
fx("sfx/riser/downlifter-dark", S(25), 0.3); fx("sfx/impact/soft-thump", S(26), 0.3);
fl("pencil", S(28) + 0.5, 0.4, 0.05); fl("pencil", S(29) + 0.4, 0.35, 0.05);
fx("sfx/riser/downlifter-dark", S(30), 0.3);
bed("sfx/ambience/night-crickets", S(35), S(49), 0.14);
fx("sfx/body/heartbeat", S(36), 0.28); fx("sfx/body/heartbeat", S(36) + 1.0, 0.26);
for (const o of OVERLAYS.filter((o) => o.kind === "glow" && o.a > S(40))) { fl("trace", o.a, 0.5, 0.35); fx("sfx/magic/sparkle", o.a + 0.1, 0.18); }
fx("sfx/body/heartbeat", S(45), 0.3); fx("sfx/body/heartbeat", S(46), 0.32);
fx("sfx/transition/swell-bell", wd(48, "نوشتمش"), 0.4); fx("sfx/magic/sparkle-rise", S(49) - 0.3, 0.3);
fl("splat", wd(49, "کیک"), 0.6, 0.05); fx("sfx/impact/soft-thump", wd(49, "کیک"), 0.35);
fx("sfx/magic/shimmer-pad", S(52), 0.25);
fl("poof", wd(55, "برگشت") - 0.2, 0.45); fx("sfx/impact/cinematic-heavy", wd(56, "افتاد"), 0.35); fx("sfx/impact/soft-thump", wd(56, "افتاد") + 0.1, 0.35);
const sad = S(23) - 0.3, happy = S(49) - 0.4;
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(sad + 1.5).toFixed(3), fadeIn: 0.3, fadeOut: 1.5, gain: 0.07 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +sad.toFixed(3), from: 0, to: +(happy - sad + 1).toFixed(3), fadeIn: 2, fadeOut: 1.0, gain: 0.08 },
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: +happy.toFixed(3), from: 30, to: +(30 + LEN - happy).toFixed(3), fadeIn: 0.8, fadeOut: 2, gain: 0.07 },
];
fs.writeFileSync("videos/59-doost/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v59/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/59-doost/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
