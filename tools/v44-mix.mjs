// V44 · mix plan from vo.json word times → videos/44/mix.json, then: node tools/mix.mjs videos/44/mix.json --out public/v44/mix.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v44/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (n, w, occ = 1) => V.words.filter((x) => x.line === n && bare(x.w) === w)[occ - 1].s;
const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
const cut = (x) => x - 0.07;
const K = [0, ...Array.from({ length: 14 }, (_, i) => cut(S(i + 2)))];
const TOTAL = V.total + 1.6, tSat = cut(wd(12, "بالاخره"));
const f = (file, peak) => ({ file: `public/v44/sfx/${file}-1.mp3`, peak });
const sfx = [
  ["sfx/impact/subdrop-short", 0.05, 0.5], ["sfx/money/coins-handful", 0.6, 0.3], ["sfx/whoosh/deep", 1.2, 0.35], ["sfx/impact/punchy-short", wd(1, "دزدیده") - 0.05, 0.45],
  ["sfx/whoosh/fast-bright", K[1], 0.3], [f("printerbeep", 0.65), wd(2, "پرینتر"), 0.4],
  ["sfx/camera/shutter-film", K[2], 0.3], ["sfx/ui/beep-15", K[2] + 0.5, 0.25],
  ["sfx/whoosh/soft-short", K[3], 0.3], [f("lightsoff", 0.2), K[3] + 1.2, 0.35],
  ["sfx/glitch/short-1", K[4], 0.3], ["sfx/data/typing-terminal", K[4] + 0.4, 0.3], ["sfx/impact/soft-thump", wd(5, "منتظر") - 0.1, 0.4],
  [f("serverhum", 2.25), K[5] + 1.6, 0.3], ["sfx/notification/error-buzz", wd(6, "وارد"), 0.25], ["sfx/data/transfer", wd(6, "دستورهای"), 0.4], ["sfx/paper/slide", wd(6, "جعلی"), 0.3],
  ["sfx/whoosh/double", K[6], 0.3], ["sfx/data/hud-ping", K[6] + 0.3, 0.3], ["sfx/impact/punchy-short", wd(7, "951") - 0.1, 0.45], ["sfx/data/beeps-fast", wd(7, "میلیون"), 0.25],
  ["sfx/glitch/long", K[7] + 0.4, 0.3], ["sfx/data/beeps-fast", wd(8, "پاک"), 0.25],
  [f("powerdown", 0.0), wd(9, "انداخت") - 0.2, 0.45],
  ["sfx/footsteps/concrete-000", K[9] + 0.3, 0.3], ["sfx/footsteps/concrete-001", K[9] + 0.7, 0.3], ["sfx/footsteps/concrete-002", K[9] + 1.1, 0.3], ["sfx/ui/tick-001", wd(10, "متوجه"), 0.4], ["sfx/ui/tick-001", wd(10, "چاپ"), 0.4],
  [f("door", 0.05), K[11] - 0.25, 0.35],
  ["sfx/whoosh/soft-short", K[11], 0.3], [f("printing", 0.1), tSat + 0.15, 0.4], ["sfx/paper/page-flip", tSat + 0.5, 0.3], ["sfx/impact/classic-stamp", wd(12, "فاجعه") - 0.05, 0.55],
  ["sfx/whoosh/deep", K[12], 0.3], ["sfx/money/cash-register", wd(13, "81") - 0.1, 0.3], ["sfx/data/collect", wd(13, "فیلیپین"), 0.3],
  ["sfx/impact/subdrop-short", K[13] + 0.05, 0.55], ["sfx/glitch/stutter", K[13] + 0.1, 0.3], ["sfx/glitch/short-2", K[13] + 1.4, 0.25],
  ["sfx/whoosh/deep", K[14], 0.3], [f("printerbeep", 0.65), wd(15, "پرینتر"), 0.35], ["sfx/explosion/low-frequency-explosion-000", E(15) + 0.15, 0.4],
].map(([id, at, vol]) => (typeof id === "string" ? { id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) } : { ...id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) }));
const mix = {
  length: +TOTAL.toFixed(2), voice: "public/v44/vo.wav",
  // v2: the user asked for a Mr. Robot-like hacker feel (the series score itself is copyrighted → CC0 synth instead)
  music: process.env.NO_MUSIC ? [] : [
    { file: "public/audio/music/synthwave/machines-with-feelings.mp3", at: 0, from: 9.588 - 0.07, to: 9.588 - 0.07 + K[13] - 0.05, fadeIn: 0.05, fadeOut: 0.4, gain: 0.1 },
    { file: "public/audio/music/synthwave/machines-with-feelings.mp3", at: K[13] + 0.9, from: 76.785, to: 76.785 + (TOTAL - K[13] - 0.9), fadeIn: 0.8, fadeOut: 1.4, gain: 0.1 },
  ],
  sfx,
};
fs.writeFileSync(process.env.NO_MUSIC ? "videos/44/mix-nomusic.json" : "videos/44/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx", sfx.length, "length", mix.length);
