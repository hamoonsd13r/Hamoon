// V43 · mix plan from vo.json word times → videos/43/mix.json, then: node tools/mix.mjs videos/43/mix.json --out public/v43/mix.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v43/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (n, w, occ = 1) => V.words.filter((x) => x.line === n && bare(x.w) === w)[occ - 1].s;
const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
const cut = (x) => x - 0.07;
const K = { police: cut(wd(1, "و")), map: cut(wd(1, "بعضیاشون")), how: cut(S(2)), date: cut(S(3)), street: cut(S(4)), dive: cut(wd(4, "و")), vault: cut(S(5)), loot: cut(S(6)), cctv: cut(S(7)), cal: cut(S(8)), fled: cut(wd(8, "و")), probe: cut(S(9)), lineup: cut(wd(9, "و")), found: cut(wd(9, "و", 2)), q: cut(S(10)), end: cut(S(11)) };
const TOTAL = V.total + 1.5, d = K.vault - K.dive;
const f = (file, peak) => ({ file: `public/v43/sfx/${file}-1.mp3`, peak });
const sfx = [
  ["sfx/impact/subdrop-short", 0.05, 0.5], ["sfx/mechanical/lock-open-01", 0.9, 0.3], ["sfx/impact/punchy-short", wd(1, "12") - 0.08, 0.4], ["sfx/mechanical/lock-open-01", 2.2, 0.25],
  ["sfx/whoosh/fast-bright", K.police, 0.35], [f("siren", 1.2), K.police + 1.0, 0.35],
  ["sfx/whoosh/soft-short", K.map, 0.35], [f("jet", 0.5), wd(1, "خارج") + 0.3, 0.3],
  ["sfx/whoosh/deep", K.how, 0.4], ["sfx/mechanical/gear-clockwork", K.how + 0.5, 0.3], ["sfx/impact/classic-stamp", wd(2, "بی‌خبر") - 0.05, 0.5],
  ["sfx/glitch/short-1", K.date, 0.3], [f("typewriter", 0.0), wd(3, "13") - 0.05, 0.3], ["sfx/ui/beep-15", wd(3, "ساعت") - 0.1, 0.3],
  ["sfx/whoosh/deep", K.street, 0.35],
  ["sfx/whoosh/double", K.dive, 0.35], [f("grinder", 0.15), K.dive + d * 0.32, 0.35], [f("vaultdoor", 0.15), K.dive + d * 0.66, 0.4], ["sfx/impact/metallic", K.dive + d * 0.92, 0.3],
  ["sfx/mechanical/lock-open-01", K.vault + 0.6, 0.25], ["sfx/impact/punchy-short", wd(5, "168") - 0.1, 0.45], ["sfx/money/coins-handful", wd(5, "دستبرد"), 0.35],
  ["sfx/impact/punchy-short", K.loot, 0.35], ["sfx/money/handle-coins", wd(6, "سکه") - 0.07, 0.35], ["sfx/impact/soft-thump", wd(6, "ارز") - 0.07, 0.4], ["sfx/whoosh/swish-thin", wd(6, "اموال") - 0.07, 0.35],
  ["sfx/glitch/stutter", K.cctv, 0.35], ["sfx/impact/subdrop-short", wd(7, "مونده") - 0.1, 0.45],
  ["sfx/whoosh/soft-short", K.cal, 0.3], ["sfx/ui/tick-001", K.cal + 0.1, 0.4], ["sfx/ui/tick-001", K.cal + 0.2, 0.4], ["sfx/ui/tick-001", K.cal + 0.3, 0.4], ["sfx/impact/classic-stamp", wd(8, "16") - 0.1, 0.4], ["sfx/impact/punchy-short", wd(8, "سه") + 0.1, 0.4],
  ["sfx/whoosh/fast-bright", K.fled, 0.3], [f("jet", 0.5), wd(8, "کشور"), 0.3], ["sfx/impact/classic-stamp", wd(8, "خارج") - 0.1, 0.5],
  ["sfx/whoosh/soft-short", K.probe, 0.3], ["sfx/camera/shutter-dslr", wd(9, "تحقیقات") - 0.1, 0.35],
  ["sfx/whoosh/deep", K.lineup, 0.3], [f("cuffs", 0.55), wd(9, "13") - 0.1, 0.45],
  ["sfx/impact/classic-stamp", wd(9, "کشف") - 0.05, 0.45],
  ["sfx/impact/subdrop-short", K.q + 0.05, 0.55], ["sfx/glitch/short-2", K.q + 0.1, 0.3],
  ["sfx/whoosh/deep", K.end, 0.35], ["sfx/impact/punchy-short", wd(11, "12") - 0.1, 0.4], ["sfx/impact/punchy-short", wd(11, "سه") - 0.1, 0.45], ["sfx/explosion/low-frequency-explosion-000", E(11) + 0.15, 0.4],
].map(([id, at, vol]) => (typeof id === "string" ? { id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) } : { ...id, at: +at.toFixed(3), vol: +(vol * 0.38).toFixed(3) }));
const mix = {
  length: +TOTAL.toFixed(2), voice: "public/v43/vo.wav",
  music: [
    { file: "public/audio/music/scifi/anxiety.mp3", at: 0, from: 0, to: K.cctv + 0.1, fadeIn: 0.05, fadeOut: 0.35, gain: 0.2 },
    { file: "public/audio/music/scifi/credit-cards.mp3", at: wd(7, "مونده") + 0.3, from: 62, to: 62 + (K.q - wd(7, "مونده") - 0.3), fadeIn: 0.6, fadeOut: 0.3, gain: 0.24 },
    { file: "public/audio/music/scifi/anxiety.mp3", at: K.end - 0.05, from: 104.702 - (wd(11, "12") - K.end + 0.05), to: 104.702 - (wd(11, "12") - K.end + 0.05) + (TOTAL - K.end + 0.05), fadeIn: 0.2, fadeOut: 1.4, gain: 0.22 },
  ],
  sfx,
};
fs.writeFileSync("videos/43/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx", sfx.length, "length", mix.length);
