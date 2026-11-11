// V46 · music + effects plan from the narration timing → videos/46/mix.json, then tools/mix.mjs → public/v46/mix-norm.wav
// Usage: node tools/v46-mix.mjs && ALVANA_AUDIO_DIR=~/alvana-audio node tools/mix.mjs videos/46/mix.json --out public/v46/mix-norm.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v46/vo.json", "utf8"));
const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
const bare = (x) => x.replace(/[ً-ْ،.؟!…«»,:؛]/g, "");
const wd = (l, w) => { const ws = V.words.filter((x) => x.line === l); const h = ws.find((x) => bare(x.w) === w) ?? ws.find((x) => bare(x.w).includes(w)); if (!h) throw new Error(l + " " + w); return h.s; };
const LEN = V.total + 2.4, G = 0.075;
const M = (f, at, to, from = 0, fadeIn = 0.6, fadeOut = 1.8, gain = G) => ({ file: "public/audio/music/" + f + ".mp3", at, from, to: from + (to - at), fadeIn, fadeOut, gain });
const music = [
  M("horror/tragedy-waiting-to-happen", 0, S(7) - 0.1, 0, 0.2, 1.5),
  M("sad/small-towns-smaller-lives", S(7) - 0.4, S(19), 0, 1.0, 2.0),
  M("horror/tension-in-the-air", S(19) - 0.5, S(31), 20, 1.0, 2.0),
  M("horror/abducted", S(31) - 0.6, S(52) - 0.3, 10, 1.0, 2.0),
  M("sad/mixed-signals", S(52) - 0.8, LEN, 0, 1.2, 2.5, G * 1.1),
];
const sfx = [];
const K = 0.3; // effects stem ≈ −38 LUFS
const fx = (id, at, vol = 0.4) => sfx.push(id.startsWith("v46/") ? { file: "public/" + id, at, vol: +(vol * K).toFixed(3), peak: 0.3 } : { id, at, vol: +(vol * K).toFixed(3) });
fx("sfx/mechanical/clock-tick-tock", 1.0, 0.3);
fx("v46/sfx/jet-1.mp3", wd(1, "27"), 0.3);
fx("sfx/impact/distant-boom", wd(2, "منفجر"), 0.55); fx("sfx/impact/cinematic-heavy", wd(2, "منفجر") + 0.02, 0.4);
fx("sfx/impact/subdrop-punch", S(5) - 0.05, 0.5);
fx("v46/sfx/heli-1.mp3", wd(6, "چطور"), 0.28);
// chapter cards
[S(7), S(11), S(13), S(15), S(20), S(23), S(26), S(32), S(37), S(43)].forEach((t) => fx("sfx/whoosh/soft-short", t - 0.06, 0.35));
// prints and the board (camera shutter)
[S(10), S(15) + 0.05, S(17), S(23) + 0.05, S(24), S(27)].forEach((t) => fx("sfx/camera/shutter-film", t + 0.05, 0.3));
// stamps
fx("sfx/impact/classic-stamp", wd(15, "بازداشت"), 0.5); fx("sfx/impact/classic-stamp", wd(17, "کارتل"), 0.5);
fx("sfx/impact/classic-stamp", wd(34, "لا"), 0.45); fx("sfx/impact/classic-stamp", wd(37, "فرار"), 0.5);
fx("sfx/explosion/shot-01", wd(23, "ترور"), 0.4); fx("sfx/explosion/shot-03", wd(27, "ترور"), 0.4);
fx("v46/sfx/siren-1.mp3", wd(26, "یکی"), 0.22);
fx("sfx/explosion/explosion", wd(29, "انفجار"), 0.5); fx("sfx/impact/distant-boom", wd(29, "انفجار") + 0.05, 0.45);
fx("v46/sfx/siren-1.mp3", wd(30, "بمب‌گذاری"), 0.2);
fx("v46/sfx/heli-1.mp3", S(32), 0.25);
fx("v46/sfx/heli-1.mp3", S(41), 0.22);
fx("v46/sfx/ring-1.mp3", wd(44, "تماس"), 0.32);
fx("sfx/riser/noise-2s", S(46) + 0.4, 0.25);
fx("v46/sfx/gunfire-1.mp3", wd(49, "تیراندازی") + 0.1, 0.42);
fx("sfx/riser/downlifter-dark", wd(49, "کشته"), 0.35);
fx("sfx/impact/subdrop-punch", V.total + 0.1, 0.45);
fs.writeFileSync("videos/46/mix.json", JSON.stringify({ length: +LEN.toFixed(2), voice: "public/v46/vo.wav", music, sfx }, null, 1));
console.log("mix.json", music.length, "music", sfx.length, "sfx", LEN.toFixed(1), "s");
