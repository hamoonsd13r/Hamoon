// V55 · audio: narration (public/v55/vo.wav) + the ice-cream-truck tune (an original music-box melody synthesised for
// this video, public/v55/sfx/jingle.wav, slightly detuned) as the story's music: far away at first, louder in the
// chase, cut dead when it stops outside the house, then back warped for the ending; a low dark bed under it;
// effects on the visible events; ticking clock through the final ۱۰ → ۱.
// Usage: (esbuild src/v55/Video.tsx → out/v55/vt.cjs) node tools/v55-mix.mjs && node tools/mix.mjs videos/55-bastani/mix.json --out public/v55/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { S, wd, END, CD_START } = require("../out/v55/vt.cjs");
const LEN = END, K = 0.4;
const sfx = [], beds = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v55/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
const steps = (from, to, every, vol) => { let i = 0; for (let t = from; t < to; t += every, i++) fx(`sfx/footsteps/concrete-00${i % 4}`, t, vol); };
// the tune: a bed that loops — distant, closer, chase, then silence, then the warped reprise
bed("public/v55/sfx/jingle.wav", 0.2, S(3), 0.08);
bed("public/v55/sfx/jingle.wav", S(5), S(9), 0.08);
bed("public/v55/sfx/jingle.wav", S(15), S(19), 0.11);
bed("public/v55/sfx/jingle.wav", S(19), wd(32, "قطع"), 0.17);
bed("public/v55/sfx/jingle-warped.wav", S(36), END - 0.4, 0.16);
bed("sfx/ambience/night-crickets", 0, S(9), 0.16);
bed("sfx/ambience/wind", S(9), S(19), 0.12);
bed("sfx/ambience/room-tone", S(33), S(36), 0.2);
// events
fx("sfx/impact/subdrop-long", wd(2, "شصت"), 0.3); fx("sfx/mechanical/clock-tick-tock", wd(2, "شصت") + 0.4, 0.3);
steps(S(2) + 0.3, S(3) - 0.3, 0.22, 0.3);
fx("sfx/riser/downlifter-dark", S(3) + 0.2, 0.3);
fx("sfx/whoosh/deep", S(4) + 0.5, 0.25);
steps(S(7) + 0.2, S(8) - 0.2, 0.25, 0.3);
fx("sfx/body/heartbeat", S(8) + 0.4, 0.3);
fx("sfx/door/door-02-2", S(9) + 0.25, 0.5); fx("sfx/impact/slam-01", S(9) + 0.55, 0.45); fx("sfx/impact/slam-06", S(9) + 0.95, 0.4);
steps(S(10) + 0.2, S(11), 0.2, 0.32);
fx("sfx/impact/subdrop-long", S(11), 0.25); fl("spark", S(12) + 0.4, 0.4); fl("spark", S(12) + 1.4, 0.35);
fx("sfx/impact/soft-thump", wd(14, "حیاط") + 0.3, 0.3); steps(S(14) + 0.6, S(15), 0.2, 0.28);
fx("sfx/impact/subdrop-long", S(15), 0.25);
fx("sfx/riser/downlifter-dark", S(18), 0.35);
fx("sfx/impact/subdrop-long", S(19), 0.3); steps(S(20), S(22), 0.18, 0.34); fx("sfx/body/heartbeat", S(21), 0.3);
fx("sfx/whoosh/deep", S(23) + 0.4, 0.3); fx("sfx/riser/downlifter-dark", S(24), 0.35);
fx("sfx/impact/cinematic-heavy", wd(25, "گرفت"), 0.4); fx("sfx/whoosh/deep", S(26) + 0.3, 0.3);
steps(S(27), S(29), 0.17, 0.34);
fx("sfx/impact/slam-06", wd(30, "بست"), 0.6); fx("sfx/impact/cinematic-heavy", wd(30, "بست"), 0.35);
fx("sfx/impact/subdrop-long", wd(32, "قطع"), 0.3);
fx("sfx/body/heartbeat", S(34) + 0.2, 0.3); fx("sfx/body/heartbeat", S(34) + 1.2, 0.28);
fx("sfx/riser/downlifter-dark", S(36), 0.3);
for (let k = 0; k < 10; k++) fx(k < 7 ? "sfx/ui/tick-004" : "sfx/body/heartbeat", CD_START + k, k < 7 ? 0.5 : 0.4);
fx("sfx/impact/cinematic-heavy", END - 0.55, 0.6); fx("sfx/impact/subdrop-long", END - 0.55, 0.4);
const music = [{ file: "public/audio/music/dark/game-over-3.mp3", at: 0, from: 0, to: +LEN.toFixed(3), fadeIn: 1.5, fadeOut: 1.0, gain: 0.05 }];
fs.writeFileSync("videos/55-bastani/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v55/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/55-bastani/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
