// V53 · audio for both cuts: music kept very low under the voice (the user asked for less music after V51; same level as
// V52, ≈ 24 dB under the voice) + minimal effects on visible events → videos/53/mix.json, videos/53/mix-short.json
// Usage: (esbuild src/v53/Video.tsx → out/v53/vt.cjs) node tools/v53-mix.mjs && ALVANA_AUDIO_DIR=~/alvana-audio \
//   node tools/mix.mjs videos/53/mix.json --out public/v53/mix.wav && node tools/mix.mjs videos/53/mix-short.json --out public/v53/mix-short.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { SHOTSX, ENDS } = require("../out/v53/vt.cjs");
const bare = (x) => x.replace(/[،.؟!?:؛«»…]/g, "");
const build = (cut, voFile, voWav) => {
  const V = JSON.parse(fs.readFileSync(voFile, "utf8")), SH = SHOTSX[cut], LEN = +ENDS[cut].toFixed(2);
  const S = (n) => V.segs.find((s) => s.n === n).start;
  const wd = (l, w, occ = 1) => { const ws = V.words.filter((x) => x.line === l); const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1]; if (!h) throw new Error(l + " " + w); return h.s; };
  const ev = (c, t) => { const s = SH.find((x) => x.c === c && t >= x.src - 1e-3 && t <= x.src + (x.to - x.at) * x.rate + 1e-3); if (!s) throw new Error("ev " + c + " " + t); return s.at + (t - s.src) / s.rate; };
  const K = 0.75, sfx = [], beds = [];
  const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
  const fl = (file, at, vol = 0.4, peak = 0.05) => sfx.push({ file, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
  const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
  fx("sfx/impact/cinematic-heavy", 0.12, 0.45); fx("sfx/impact/subdrop-long", 0.1, 0.3);
  let music;
  if (cut === "full") {
    fx("sfx/body/heartbeat", S(2) + 0.1, 0.35); fx("sfx/body/heartbeat", S(2) + 1.0, 0.3);
    fx("sfx/whoosh/deep", S(3), 0.25);
    bed("public/v53/sfx/murmur.wav", ev("c04", 3.2), S(8) - 0.1, 0.22);
    bed("sfx/mechanical/clock-tick-tock", ev("c04", 3.2), S(8) - 0.1, 0.18);
    fx("sfx/impact/subdrop-long", S(8), 0.3);
    fx("sfx/transition/swell-bell", ev("c06", 2.2), 0.35); fx("sfx/magic/shimmer-pad", ev("c06", 2.6), 0.25);
    bed("sfx/ambience/wind", S(13), S(16), 0.18);
    fx("sfx/impact/distant-boom", wd(14, "توفان"), 0.4);
    bed("sfx/ambience/rain", wd(14, "توفان"), S(16), 0.2);
    bed("sfx/ambience/rain", S(17), S(20) - 0.2, 0.16); fx("sfx/impact/distant-boom", S(17) + 0.2, 0.25);
    bed("sfx/ambience/room-tone", S(20), S(28), 0.2);
    fl("public/v53/sfx/bus.mp3", ev("c09", 2.6), 0.4, 0.8);
    fx("sfx/impact/subdrop-long", ev("c12", 3.4), 0.3);
    fx("sfx/impact/cinematic-heavy", ev("c09", 4.7), 0.3);
    fx("sfx/riser/downlifter-dark", S(23) + 0.2, 0.25);
    fx("sfx/body/heartbeat", S(25) + 0.3, 0.25);
    fx("sfx/whoosh/reverse", ev("c12", 4.4), 0.2);
    bed("public/v53/sfx/murmur.wav", ev("c13", 3.0), S(31) - 0.1, 0.2); bed("sfx/mechanical/clock-tick-tock", ev("c13", 3.0), S(31) - 0.1, 0.16);
    fx("sfx/transition/swell-bell", ev("c10", 2.6), 0.35);
    fl("public/v53/sfx/rubble.mp3", ev("c11", 1.6), 0.3, 0.2); fx("sfx/impact/soft-thump", ev("c11", 1.9), 0.3);
    bed("sfx/ambience/wind", S(34), S(36), 0.12);
    fx("sfx/riser/downlifter-dark", S(36) + 0.1, 0.3); fx("sfx/body/heartbeat", S(36) + 1.2, 0.3);
    fx("sfx/impact/cinematic-heavy", S(37) + 0.1, 0.25);
    fx("sfx/magic/shimmer-pad", S(41) + 0.3, 0.25);
    bed("sfx/ambience/rain", S(42), S(44), 0.14); bed("sfx/ambience/wind", S(42), S(44), 0.12);
    bed("sfx/ambience/wind", S(44), LEN, 0.1);
    fx("sfx/transition/swell-bell", S(46), 0.3);
    const turn = S(11) - 0.4, calm = S(40) - 0.4;
    music = [
      { file: "public/audio/music/ambient/cave-1.mp3", at: 0, from: 0, to: turn + 3, fadeIn: 0.3, fadeOut: 3, gain: 0.042 },
      { file: "public/audio/music/dark/game-over-3.mp3", at: turn, from: 0, to: +(calm + 3 - turn).toFixed(3), fadeIn: 3, fadeOut: 3.5, gain: 0.036 },
      { file: "public/audio/music/calm/love.mp3", at: calm, from: 0, to: +(LEN - calm).toFixed(3), fadeIn: 3, fadeOut: 2.5, gain: 0.05 },
    ];
  } else {
    fx("sfx/body/heartbeat", 1.2, 0.3);
    bed("sfx/ambience/wind", S(2) - 0.2, S(4), 0.18);
    fx("sfx/impact/distant-boom", wd(2, "توفان"), 0.4); bed("sfx/ambience/rain", wd(2, "توفان"), S(4), 0.2);
    fx("sfx/riser/downlifter-dark", S(4) + 0.1, 0.3); fx("sfx/body/heartbeat", S(4) + 1.0, 0.3);
    fx("sfx/magic/shimmer-pad", S(5) + 0.3, 0.25);
    fx("sfx/transition/swell-bell", S(6), 0.3); bed("sfx/ambience/wind", S(6), LEN, 0.1);
    music = [
      { file: "public/audio/music/dark/game-over-3.mp3", at: 0, from: 0, to: S(5) + 2, fadeIn: 0.3, fadeOut: 2.5, gain: 0.042 },
      { file: "public/audio/music/calm/love.mp3", at: S(5) - 0.5, from: 0, to: +(LEN - S(5) + 0.5).toFixed(3), fadeIn: 2, fadeOut: 2, gain: 0.055 },
    ];
  }
  const out = cut === "full" ? "videos/53/mix.json" : "videos/53/mix-short.json";
  fs.writeFileSync(out, JSON.stringify({ length: LEN, voice: voWav, music, beds, sfx }, null, 1));
  console.log(out, sfx.length, "sfx", beds.length, "beds", LEN, "s");
};
build("full", "src/v53/vo.json", "public/v53/vo.wav");
build("short", "src/v53/vo-short.json", "public/v53/vo-short.wav");
