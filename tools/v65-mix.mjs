// V65 · audio: narration (public/v65/vo.wav) + light playful music (sunny-afternoon) for the shield world, silence on the
// shout, quiet-village for the bad day, then mixed-signals (sad → warm) from the old albums to the end. The shield
// shimmer, golden shield, ball smack, soup slop, ditch splash, page turns and memory swells are synthesised for this
// video (public/v65/sfx, numpy, this session).
// Usage: (esbuild src/v65/Video.tsx → out/v65/vt.cjs) node tools/v65-mix.mjs && node tools/mix.mjs videos/65-madar/mix.json --out public/v65/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, E, wd, END } = require("../out/v65/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v65/vo.json", "utf8"));
const bare = (x) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
const LEN = END, K = 0.4;
const sfx = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v65/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
fl("shield", wd(1, "باش") + 0.2, 0.4, 0.15); fl("shield", S(2) + 0.2, 0.3, 0.15); fx("sfx/ambience/rain", S(3), 0.12);
for (const w of V.words.filter((x) => x.line === 5 && bare(x.w) === "باش")) fl("shield", w.s + 0.1, 0.25, 0.15);
fl("shield", S(6) + 0.5, 0.3, 0.15); fl("shield", S(8) + 0.5, 0.3, 0.15);
fx("sfx/impact/soft-thump", wd(10, "بسه"), 0.3);
fl("smack", wd(14, "بوم") - 0.05, 0.7, 0.01); fl("slop", wd(15, "لیز"), 0.6, 0.01); fl("splash", wd(16, "شتق") - 0.05, 0.7, 0.01);
fl("page", S(19) + 0.4, 0.4, 0.01); fl("page", S(20), 0.35, 0.01);
fl("memory", S(21) - 0.2, 0.3); fl("shield", S(21) + 0.4, 0.25, 0.15); fl("shield", wd(21, "اون") + 0.8, 0.3, 0.15);
fx("sfx/magic/sparkle-rise", S(22), 0.3); fl("page", S(23), 0.35, 0.01);
fl("memory", S(24) - 0.2, 0.25); fx("sfx/ambience/rain", S(24), 0.15);
fx("sfx/door/open", S(28) + 0.8, 0.25);
fl("golden", wd(31, "دینگ") - 0.02, 0.75, 0.01); fx("sfx/magic/sparkle", S(32) + 0.4, 0.3);
fl("shield", wd(35, "باش") + 0.1, 0.25, 0.15); fl("golden", wd(35, "باش", 2) + 0.1, 0.25, 0.01);
const bad = S(10) - 0.2, quiet = S(13) - 0.2, albums = S(18) - 0.5;
const music = [
  { file: "public/audio/music/chiptune/sunny-afternoon.mp3", at: 0, from: 0, to: +(bad + 0.4).toFixed(3), fadeIn: 0.4, fadeOut: 0.4, gain: 0.05 },
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: +quiet.toFixed(3), from: 0, to: +(albums - quiet + 1.2).toFixed(3), fadeIn: 0.8, fadeOut: 1.2, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +albums.toFixed(3), from: 0, to: +(LEN - albums).toFixed(3), fadeIn: 1.5, fadeOut: 2.5, gain: 0.08 },
];
fs.writeFileSync("videos/65-madar/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v65/vo.wav", music, beds: [], sfx }, null, 1));
console.log("videos/65-madar/mix.json", sfx.length, "sfx", LEN, "s");
