// V54 · audio: narration (public/v54/vo.wav) + three music beds (village → dark → sad), low under the voice,
// and effects on the visible events (bell, thumps, phone, mosquito, the crash, the cheer). Bell, phone ring,
// mosquito and crowd are synthesised (public/v54/sfx, made once with numpy in this session).
// Usage: node tools/v54-mix.mjs && node tools/mix.mjs videos/54-naghus/mix.json --out public/v54/mix.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v54/vo.json", "utf8"));
const bare = (x) => x.replace(/[ً-ْٰ]/g, "").replace(/[،.؟!?:؛«»…]/g, "");
const S = (n) => V.segs.find((s) => s.n === n).start, E = (n) => V.segs.find((s) => s.n === n).end;
const wd = (l, w, occ = 1) => { const ws = V.words.filter((x) => x.line === l); const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1]; if (!h) throw new Error(l + " " + w); return h.s; };
const LEN = +(E(72) + 1.6).toFixed(2);
const sfx = [], beds = [];
const K = 0.45; // effects bus trim: keeps the effects stem ≈ 10+ dB under the voice
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (name, at, vol = 0.4, peak = 0.02) => sfx.push({ file: `public/v54/sfx/${name}.wav`, at: +at.toFixed(3), vol: +(vol * K * 0.6).toFixed(3), peak });
const bed = (x, from, to, vol) => beds.push({ ...(x.startsWith("public/") ? { file: x } : { id: x }), from: +from.toFixed(3), to: +to.toFixed(3), vol });
// hook: the bell over the moon, the freeze, the watcher
fl("bell", 0.15, 0.5); fx("sfx/impact/subdrop-long", wd(1, "یخ"), 0.3);
fx("sfx/riser/downlifter-dark", wd(2, "نگهبان"), 0.3); fx("sfx/impact/soft-thump", wd(2, "می‌برتت"), 0.3);
bed("sfx/ambience/night-crickets", 0, S(5) - 0.1, 0.18);
fx("sfx/whoosh/deep", S(8), 0.22);
bed("sfx/ambience/wind", S(8), S(10), 0.14);
// bedtime practice: a heartbeat-calm stretch, no effects; the fair and the bell
bed("sfx/ambience/night-crickets", S(18), S(24), 0.14);
fl("bell", wd(19, "ناقوس") + 0.3, 0.35);
fl("bell", wd(20, "دنگ", 1), 0.55); fl("bell", wd(20, "دنگ", 2), 0.6); fl("bell", wd(20, "دنگ", 3), 0.65);
fx("sfx/whoosh/deep", S(21), 0.3); fx("sfx/impact/subdrop-long", S(21) + 0.1, 0.25);
// the watcher steps down — THUMP
fx("sfx/riser/downlifter-dark", S(24) + 0.2, 0.3);
fx("sfx/impact/cinematic-heavy", S(25), 0.55); fx("sfx/break/rock-falling-07", S(25) + 0.05, 0.35); fx("sfx/impact/subdrop-long", S(25), 0.35);
fx("sfx/foley/stones-01", S(27) + 0.2, 0.25);
fx("sfx/impact/soft-thump", S(29) + 0.4, 0.25); fx("sfx/impact/soft-thump", S(29) + 1.3, 0.2);
// ten o'clock: the phone, the gasp, silence
fl("phone", wd(30, "گوشی") + 0.05, 0.3, 0.01);
fx("sfx/body/heartbeat", S(31) + 0.6, 0.3);
// midnight thump thump
fx("sfx/impact/cinematic-heavy", wd(32, "تاپ", 1), 0.4); fx("sfx/impact/cinematic-heavy", wd(32, "تاپ", 2), 0.45);
bed("sfx/ambience/wind", S(33), S(48), 0.12);
fx("sfx/whoosh/deep", S(35) + 0.3, 0.2); // breath
fx("sfx/body/heartbeat", S(38) + 0.2, 0.3); fx("sfx/body/heartbeat", S(38) + 1.4, 0.28);
fx("sfx/impact/subdrop-long", S(41), 0.3); fx("sfx/body/heartbeat", S(41) + 1.0, 0.3); fx("sfx/body/heartbeat", S(41) + 2.2, 0.28);
fl("mosquito", S(44) + 0.3, 0.22, 0.6);
fx("sfx/impact/soft-thump", S(46) + 1.6, 0.2);
// three, four… thump thump, dawn
fx("sfx/impact/cinematic-heavy", wd(49, "تاپ", 1), 0.4); fx("sfx/impact/cinematic-heavy", wd(49, "تاپ", 2), 0.42);
fx("sfx/transition/swell-bell", S(52), 0.35); fx("sfx/magic/shimmer-pad", S(52) + 0.3, 0.2);
// the crash and the cheer
fx("sfx/impact/distant-boom", wd(53, "ریخت"), 0.5); fx("sfx/break/rock-falling-04", wd(53, "ریخت") + 0.1, 0.35);
fx("sfx/break/rock-falling-06", wd(53, "ریخت") + 0.35, 0.3); fx("sfx/break/rock-falling-07", wd(53, "ریخت") + 0.6, 0.3);
fl("crowd", S(54) + 0.2, 0.3, 1.0);
// the reveal
fx("sfx/riser/downlifter-dark", S(58) + 0.5, 0.3); fx("sfx/impact/subdrop-long", S(60), 0.35);
fx("sfx/foley/stones-03", S(62) + 0.4, 0.25);
fx("sfx/transition/swell-bell", S(66), 0.3);
fx("sfx/magic/shimmer-pad", S(72) + 0.5, 0.2);
bed("sfx/ambience/wind", S(67), LEN, 0.1);
const music = [
  { file: "public/audio/music/ambient/quiet-village-4.mp3", at: 0, from: 0, to: +(S(18) + 2).toFixed(3), fadeIn: 0.5, fadeOut: 2.5, gain: 0.07 },
  { file: "public/audio/music/dark/game-over-3.mp3", at: +(S(18) - 0.5).toFixed(3), from: 0, to: +(S(52) - S(18) + 3).toFixed(3), fadeIn: 2.5, fadeOut: 3, gain: 0.07 },
  { file: "public/audio/music/sad/mixed-signals.mp3", at: +(S(52) - 0.5).toFixed(3), from: 0, to: +(LEN - S(52) + 0.5).toFixed(3), fadeIn: 2.5, fadeOut: 2.5, gain: 0.08 },
];
fs.writeFileSync("videos/54-naghus/mix.json", JSON.stringify({ length: LEN, voice: "public/v54/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/54-naghus/mix.json", sfx.length, "sfx", beds.length, "beds", LEN, "s");
