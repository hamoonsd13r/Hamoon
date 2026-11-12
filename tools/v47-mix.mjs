// V47 · music + effects plans for both cuts → videos/47/mix-yt.json, videos/47/mix-reel.json; then tools/mix.mjs
// Usage: node tools/v47-mix.mjs && for v in yt reel; do ALVANA_AUDIO_DIR=~/alvana-audio node tools/mix.mjs videos/47/mix-$v.json --out out/v47/mix-$v.wav; done
import fs from "node:fs";
const bare = (x) => x.replace(/[ً-ْ،.؟!…«»,:؛]/g, "");
const plan = (vo, out, music, extra) => {
  const V = JSON.parse(fs.readFileSync(vo, "utf8"));
  const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
  const wd = (l, w) => { const ws = V.words.filter((x) => x.line === l); const h = ws.find((x) => bare(x.w) === w) ?? ws.find((x) => bare(x.w).includes(w)); if (!h) throw new Error(l + " " + w); return h.s; };
  const LEN = V.total + (out.includes("reel") ? 1.6 : 2.6), G = 0.075, K = 0.3;
  const sfx = [];
  const fx = (id, at, vol = 0.4) => sfx.push({ id, at, vol: +(vol * K).toFixed(3) });
  const M = (f, at, to, from = 0, fadeIn = 0.8, fadeOut = 2, gain = G) => ({ file: "public/audio/music/" + f + ".mp3", at, from, to: from + (to - at), fadeIn, fadeOut, gain });
  extra({ S, E, wd, fx, LEN });
  fs.writeFileSync(out, JSON.stringify({ length: +LEN.toFixed(2), voice: vo.includes("reel") ? "public/v47/vo-reel.wav" : "public/v47/vo.wav", music: music({ S, E, LEN, M }), sfx }, null, 1));
  console.log(out, sfx.length, "sfx", LEN.toFixed(1), "s");
};
plan("src/v47/vo.json", "videos/47/mix-yt.json", ({ S, LEN, M }) => [
  M("dark/game-over-3", 0, S(7) - 0.1, 0, 0.3, 1.5),
  M("horror/floor-4", S(7) - 0.4, S(37), 0, 1.2, 2),
  M("ambient/cave-4", S(37) - 0.5, S(58), 30, 1.2, 2),
  M("horror/floor-6", S(58) - 0.5, S(69), 0, 1.2, 2),
  M("sad/mixed-signals", S(69) - 0.6, LEN, 0, 1.5, 2.5, 0.08),
], ({ S, wd, fx, LEN }) => {
  fx("sfx/impact/distant-boom", 0.05, 0.5);
  [S(7), S(19), S(25), S(29), S(37), S(50), S(55), S(58), S(62)].forEach((t) => fx("sfx/whoosh/soft-short", t - 0.06, 0.35));
  [S(8), S(10), S(12), S(28), S(33), S(37), S(42), S(48), S(55), S(63), S(66), S(68)].forEach((t) => fx("sfx/camera/shutter-film", t + 0.05, 0.28));
  fx("sfx/impact/classic-stamp", wd(13, "نتونست") + 0.1, 0.45); fx("sfx/impact/classic-stamp", wd(14, "موفق") + 0.1, 0.45);
  fx("sfx/impact/classic-stamp", wd(31, "شکست") - 0.05, 0.45); fx("sfx/impact/classic-stamp", wd(32, "زندان") - 0.05, 0.45);
  fx("sfx/impact/distant-boom", wd(51, "حمله"), 0.5);
  fx("sfx/impact/subdrop-punch", S(5) - 0.05, 0.45); fx("sfx/impact/subdrop-punch", S(65) - 0.05, 0.4);
  fx("sfx/riser/downlifter-dark", wd(57, "شش"), 0.3);
  fx("sfx/impact/subdrop-punch", LEN - 2.4, 0.4);
});
plan("src/v47/vo-reel.json", "videos/47/mix-reel.json", ({ LEN, M }) => [M("dark/game-over-3", 0, LEN, 0, 0.3, 2)], ({ S, wd, fx, LEN }) => {
  fx("sfx/impact/distant-boom", 0.05, 0.5);
  [S(7), S(9)].forEach((t) => fx("sfx/whoosh/soft-short", t - 0.06, 0.35));
  fx("sfx/impact/subdrop-punch", S(5) - 0.05, 0.45);
  fx("sfx/impact/distant-boom", S(10), 0.5);
  fx("sfx/riser/downlifter-dark", wd(12, "شش"), 0.3);
  fx("sfx/impact/subdrop-punch", LEN - 1.4, 0.4);
});
