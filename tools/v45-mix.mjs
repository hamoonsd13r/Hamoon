// V45 · mix plan from vo.json word times → videos/45/mix.json, then: node tools/mix.mjs videos/45/mix.json --out public/v45/mix.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v45/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (n, w, occ = 1) => V.words.filter((x) => x.line === n && bare(x.w) === w)[occ - 1].s;
const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
const cut = (x) => x - 0.07;
const TOTAL = V.total + 1.6, tDark = wd(6, "تاریکی") - 0.15;
const f = (file, peak) => ({ file: `public/v45/sfx/${file}-1.mp3`, peak });
const sfx = [
  ["sfx/impact/subdrop-short", 0.05, 0.45], [f("shimmer", 0.25), 0.7, 0.4], [f("shimmer", 0.25), wd(1, "آبی"), 0.45],
  ["sfx/camera/shutter-film", cut(S(2)), 0.35], ["sfx/whoosh/deep", cut(wd(2, "قراره")), 0.4], ["sfx/explosion/low-frequency-explosion-001", wd(2, "فاجعه‌بارترین"), 0.3],
  ["sfx/whoosh/double", cut(wd(2, "حوادث")), 0.3], ["sfx/ui/beep-15", wd(3, "13") - 0.05, 0.25], ["sfx/data/hud-ping", wd(3, "1987"), 0.3], ["sfx/camera/shutter-dslr", cut(wd(3, "شهر")), 0.35],
  ["sfx/whoosh/soft-short", cut(S(4)), 0.3], ["sfx/whoosh/swish-thin", cut(wd(4, "متروکه")), 0.3],
  ["sfx/footsteps/concrete-000", cut(wd(4, "و")) + 0.2, 0.3], ["sfx/footsteps/concrete-001", cut(wd(4, "و")) + 0.6, 0.3], ["sfx/footsteps/concrete-002", cut(wd(4, "و")) + 1.0, 0.3], ["sfx/impact/soft-thump", cut(wd(4, "پرتودرمانی")), 0.35],
  [f("crowbar", 0.35), wd(5, "باز") + 0.1, 0.45], [f("scrap", 0.35), cut(wd(5, "تا")) + 0.3, 0.4],
  ["sfx/whoosh/soft-short", cut(S(6)), 0.3], ...[0, 1, 2, 3, 4].map((i) => ["sfx/ui/tick-001", cut(S(6)) + 0.25 + i * 0.2, 0.4]), ["sfx/camera/shutter-film", cut(wd(6, "صاحب")), 0.3], [f("scrap", 0.35), cut(wd(6, "متوجه")) + 0.4, 0.25],
  ["sfx/transition/power-down", tDark + 0.05, 0.35], [f("shimmer", 0.25), wd(6, "نور"), 0.45],
  ["sfx/whoosh/deep", cut(S(7)), 0.3], [f("shimmer", 0.25), wd(7, "نشونش"), 0.3],
  ["sfx/whoosh/double", cut(S(8)), 0.3], ["sfx/data/hud-ping", S(8) + 0.5, 0.3], ["sfx/data/hud-ping", S(8) + 1.1, 0.3], ["sfx/camera/shutter-dslr", cut(wd(8, "خونه‌های")), 0.3],
  ["sfx/impact/soft-thump", cut(S(9)), 0.4], ["sfx/notification/error-buzz", cut(S(10)) + 0.1, 0.2], ["sfx/impact/punchy-short", cut(wd(10, "سوختگی‌های")), 0.4],
  ["sfx/whoosh/soft-short", cut(S(11)), 0.3], [f("bus", 0.95), S(11) + 1.3, 0.4], ["sfx/whoosh/swish-thin", cut(wd(11, "مرکز")), 0.3],
  ["sfx/whoosh/fast-bright", cut(wd(11, "و")), 0.3], [f("geiger", 3.6), wd(11, "فاش") + 0.25, 0.5], ["sfx/impact/classic-stamp", wd(11, "فاش") - 0.05, 0.5],
  [f("shimmer", 0.25), cut(S(12)) + 0.3, 0.35], ["sfx/whoosh/deep", cut(wd(12, "سزیوم")), 0.4], ["sfx/data/transfer", wd(12, "137"), 0.25], ["sfx/impact/classic-stamp", wd(12, "شدت") - 0.1, 0.5],
  ["sfx/camera/shutter-film", cut(S(13)), 0.3], [f("crowdmurmur", 0.25), cut(wd(13, "هزار")) + 0.3, 0.4],
  ["sfx/whoosh/double", cut(S(14)), 0.3], ["sfx/data/beeps-fast", S(14) + 0.5, 0.25], ["sfx/impact/subdrop-short", wd(14, "چهار") - 0.05, 0.55], ["sfx/impact/soft-thump", cut(wd(14, "جونشون")), 0.35],
  [f("shimmer", 0.25), cut(S(16)) + 0.3, 0.35], ["sfx/camera/shutter-dslr", cut(wd(16, "یه")), 0.25], ["sfx/camera/shutter-film", cut(S(17)), 0.3], ["sfx/camera/shutter-dslr", cut(wd(17, "داره")), 0.3],
  ["sfx/explosion/low-frequency-explosion-000", E(17) + 0.35, 0.4],
].map(([id, at, vol]) => (typeof id === "string" ? { id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) } : { ...id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) }));
const tTruth = wd(11, "حقیقت"), t2 = cut(S(12)) + 0.1;
const mix = {
  length: +TOTAL.toFixed(2), voice: "public/v45/vo.wav",
  music: process.env.NO_MUSIC ? [] : [
    { file: "public/audio/music/dark/game-over-4.mp3", at: 0, from: 0.01, to: 0.01 + tTruth + 0.3, fadeIn: 0.3, fadeOut: 0.7, gain: 0.05 },
    { file: "public/audio/music/ambient/cave-1.mp3", at: t2, from: 42.593 - (wd(12, "سزیوم") - t2), to: 42.593 - (wd(12, "سزیوم") - t2) + (TOTAL - t2), fadeIn: 0.5, fadeOut: 1.6, gain: 0.055 },
  ],
  sfx,
};
fs.writeFileSync(process.env.NO_MUSIC ? "videos/45/mix-nomusic.json" : "videos/45/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx", sfx.length, "length", mix.length);
