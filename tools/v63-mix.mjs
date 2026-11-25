// V63 · audio: narration (public/v63/vo.wav) + light playful music (sunny-afternoon) for the world of rules, tension
// (game-over) from Soltani's rule to the stamp, a happy track (happy-dance) when thirty years of rules come true.
// Stamps, «no» buzzers, the approve chime, quill scratch, rumble and page flutter are synthesised for this video
// (public/v63/sfx, numpy, this session).
// Usage: (esbuild src/v63/Video.tsx → out/v63/vt.cjs) node tools/v63-mix.mjs && node tools/mix.mjs videos/63-ghanoon/mix.json --out public/v63/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END, STAMPS, OVERLAYS } = require("../out/v63/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v63/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
fx("sfx/magic/sparkle", S(1) + 0.3, 0.25); fx("sfx/magic/sparkle-rise", wd(2, "یه"), 0.3); fl("quill", wd(2, "یه") + 0.3, 0.3);
fx("sfx/creature/barking-02", S(4) + 1.2, 0.25); fx("sfx/magic/sparkle", S(6) + 1.0, 0.2);
fl("pages", S(8) + 1.5, 0.25); fx("sfx/impact/soft-thump", wd(8, "هیچ‌وقت"), 0.35);
for (const o of OVERLAYS) { fx("sfx/transition/swell-bell", o.a - 0.3, 0.3); fl("quill", o.a + 0.3, 0.35); }
for (const s of STAMPS) { fl("stamp", s.t - 0.03, 0.7, 0.01); if (s.ok) fl("chime", s.t + 0.05, 0.45, 0.005); else fl("buzz", s.t + 0.02, 0.22, 0.005); }
fl("stamp", wd(30, "تق") - 0.03, 0.8, 0.01);
fx("sfx/impact/subdrop-long", S(32), 0.3); fl("pages", S(33), 0.4);
fl("rumble", S(35) - 0.2, 0.6); fx("sfx/impact/distant-boom", S(35), 0.45); fx("sfx/riser/downlifter-dark", S(36) - 0.5, 0.2);
fx("sfx/magic/sparkle-rise", S(36) + 0.5, 0.35);
fx("sfx/creature/barking-01", S(37) + 0.8, 0.3); fx("sfx/creature/barking-02", S(37) + 1.6, 0.25);
fx("sfx/foley/toilet-02", S(41) + 0.6, 0.3);
const tense = S(9) - 0.3, mid = S(23) - 0.3, happy = S(35) - 0.2;
const music = [
  { file: "public/audio/music/chiptune/sunny-afternoon.mp3", at: 0, from: 0, to: +(tense + 1).toFixed(3), fadeIn: 0.3, fadeOut: 1.2, gain: 0.06 },
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: +tense.toFixed(3), from: 0, to: +(mid - tense + 1).toFixed(3), fadeIn: 1.0, fadeOut: 1.0, gain: 0.07 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +mid.toFixed(3), from: 0, to: +(happy - mid + 0.5).toFixed(3), fadeIn: 1.0, fadeOut: 0.5, gain: 0.06 },
  { file: "public/audio/music/upbeat/happy-dance.mp3", at: +happy.toFixed(3), from: 0, to: +(LEN - happy).toFixed(3), fadeIn: 0.6, fadeOut: 2, gain: 0.06 },
];
fs.writeFileSync("videos/63-ghanoon/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v63/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/63-ghanoon/mix.json", sfx.length, "sfx", LEN, "s");
