// V56 · audio: narration (public/v56/vo.wav) + dark music bed (cave → game-over → mixed-signals for the ending) +
// effects on the visible events. School bell, knocks, loudspeaker crackle and elevator hum are synthesised for this
// video (public/v56/sfx, made with numpy in this session).
// Usage: (esbuild src/v56/Video.tsx → out/v56/vt.cjs) node tools/v56-mix.mjs && node tools/mix.mjs videos/56-madrese/mix.json --out public/v56/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, wd, END, HITS } = require("../out/v56/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v56/vo.json", "utf8"));
const lw = (l, k) => V.words.filter((x) => x.line === l).slice(-k)[0].s;
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.01) => sfx.push({ file: `public/v56/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
fx("sfx/impact/subdrop-long", 0.1, 0.35);
bed("sfx/ambience/room-tone", 0, S(32), 0.18);
fx("sfx/impact/soft-thump", S(3) + 0.3, 0.25);
fx("sfx/riser/downlifter-dark", S(4), 0.3);
fx("sfx/whoosh/deep", S(6) + 0.2, 0.3); fx("sfx/door/door-02-2", wd(6, "دیگه") - 0.2, 0.4);
fx("sfx/body/heartbeat", S(8) + 0.4, 0.3); fx("sfx/body/heartbeat", S(8) + 1.4, 0.3);
for (const k of [3, 2, 1]) fl("knock", lw(12, k), 0.7);
fx("sfx/door/door-02-2", S(14) + 0.3, 0.45); fx("sfx/impact/slam-01", S(14) + 0.6, 0.35);
fx("sfx/mechanical/clock-tick-tock", S(15), 0.25);
fx("sfx/riser/downlifter-dark", S(18), 0.3);
fx("sfx/whoosh/deep", S(19), 0.25);
for (const k of [3, 2, 1]) fl("knock", S(22) + 1.2 + (3 - k) * 0.42, 0.55);
fx("sfx/impact/cinematic-heavy", wd(24, "هلم"), 0.4); fx("sfx/impact/soft-thump", wd(24, "افتادم"), 0.35);
fx("sfx/impact/subdrop-long", S(25), 0.3); fx("sfx/body/heartbeat", S(26), 0.3);
fx("sfx/door/door-02-2", S(29) + 1.0, 0.4);
fl("elevator", S(30) + 1.5, 0.5, 1.0); fx("sfx/impact/cinematic-heavy", S(31), 0.55);
bed("sfx/ambience/wind", S(32), S(45), 0.12);
fx("sfx/transition/swell-bell", S(32) + 0.2, 0.3);
fx("sfx/body/heartbeat", S(36) + 0.6, 0.3); fx("sfx/riser/downlifter-dark", S(37), 0.3);
fx("sfx/magic/shimmer-pad", S(39) + 0.3, 0.25);
fl("speaker", S(41) + 0.6, 0.6, 0.02); fx("sfx/impact/subdrop-long", wd(41, "بگیریدش"), 0.35);
fx("sfx/body/heartbeat", S(43), 0.32); fx("sfx/body/heartbeat", S(43) + 0.8, 0.32);
for (const k of [3, 2, 1]) fl("knock", lw(44, k), 0.75);
fx("sfx/whoosh/deep", wd(45, "کند") - 0.2, 0.35); fx("sfx/transition/swell-bell", S(46), 0.3);
fl("speaker", S(47), 0.6, 0.02);
fx("sfx/explosion/explosion-crunch-000", lw(48, 1), 0.45); fx("sfx/ui/glass-003", lw(48, 1) + 0.05, 0.4);
for (const d of [0.4, 1.1, 1.7]) fx("sfx/impact/soft-thump", S(49) + d, 0.25);
fl("speaker", S(50), 0.55, 0.02);
fx("sfx/ui/glass-005", wd(51, "شکست"), 0.6); fx("sfx/break/rock-falling-04", wd(51, "شکست") + 0.05, 0.3);
fx("sfx/impact/cinematic-heavy", wd(51, "زدیم"), 0.5);
fl("school-bell", wd(52, "زنگ"), 0.75, 0.02); fl("school-bell", wd(52, "زنگ") + 3.4, 0.55, 0.02);
fx("sfx/transition/swell-bell", S(53), 0.3); fx("sfx/magic/shimmer-pad", S(53) + 0.4, 0.25);
fl("speaker", S(54), 0.55, 0.02); fx("sfx/impact/subdrop-long", lw(55, 2), 0.35);
const turn = S(32) - 0.5, free = wd(52, "زنگ") - 0.6;
const music = [
  { file: "public/audio/music/ambient/cave-1.mp3", at: 0, from: 0, to: +(turn + 3).toFixed(3), fadeIn: 0.5, fadeOut: 3, gain: 0.06 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +turn.toFixed(3), from: 0, to: +(free - turn + 1).toFixed(3), fadeIn: 3, fadeOut: 1.0, gain: 0.06 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +free.toFixed(3), from: 0, to: +(LEN - free).toFixed(3), fadeIn: 1.5, fadeOut: 2, gain: 0.08 },
];
fs.writeFileSync("videos/56-madrese/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v56/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/56-madrese/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
