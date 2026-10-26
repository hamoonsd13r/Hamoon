// V10 «نامیرا» audio plan → videos/10-namira/mix.json (tools/mix.mjs). Every cue comes from the same words the
// scenes use (src/v10/words.json), so picture and sound stay locked if the voice is rebuilt.
//   node videos/10-namira/build-audio.mjs && node tools/mix.mjs videos/10-namira/mix.json --out out/v10/mix.wav
import fs from "node:fs";

const WORDS = JSON.parse(fs.readFileSync("src/v10/words.json", "utf8"));
const W = (si, needle, nth = 0) => { const h = WORDS.filter((w) => w.si === si && w.w.includes(needle)); const w = h[nth] ?? h[0]; if (!w) throw new Error(`${si}:${needle}`); return w.s; };
const S = (si) => WORDS.find((w) => w.si === si).s;
const E = (si) => WORDS.filter((w) => w.si === si).at(-1).e;
const END = E(23) + 3.2, CARD = E(23) + 0.35;
const G = (id) => ({ file: `public/v10/sfx/${id}.wav`, peak: JSON.parse(fs.readFileSync("videos/10-namira/sfx/peaks.json", "utf8"))[id] });

const sfx = [];
const SFX_GAIN = 0.72;
const fx = (id, at, vol = 0.4) => (vol *= SFX_GAIN, sfx.push(id.startsWith("v10:") ? { ...G(id.slice(4)), at: +at.toFixed(3), vol } : { id, at: +at.toFixed(3), vol }));
const cut = (at, k = 0) => fx(["sfx/whoosh/soft-short", "sfx/whoosh/swish-thin", "sfx/whoosh/fast-bright"][k % 3], at, 0.28);

// ---- act 1 ----------------------------------------------------------------------
const flat = W(0, "نمی‌مردی") + 0.1, back = W(0, "چی‌کار");
fx("sfx/ui/beep-07", 0.32, 0.25);
fx("v10:flatline", flat + 0.05, 0.3);
fx("sfx/body/heartbeat", back + 0.02, 0.5);
cut(S(1) - 0.25, 0);
fx("v10:plane", W(1, "هواپیما") - 0.4, 0.45);
fx("sfx/whoosh/double", W(1, "هواپیما") + 0.15, 0.35);
const land = W(1, "ترک");
fx("sfx/impact/cinematic-heavy", land, 0.55);
fx("v10:quake", land + 0.12, 0.45);
fx("sfx/pop/pop-4", W(1, "تو") - 0.05, 0.35);
cut(S(2) - 0.2, 1);
const hit = W(2, "قطار", 1) - 0.05;
fx("v10:train", hit - 0.25, 0.45);
fx("sfx/impact/metallic", hit, 0.5);
fx("sfx/break/metal-falling-03", hit + 0.6, 0.35);
cut(S(3) - 0.2, 2);
fx("sfx/water/splash-15", W(3, "تمساح") + 0.05, 0.5);
const bite = W(3, "دندون") - 0.1;
fx("sfx/foley/chop", bite + 0.05, 0.45);
fx("sfx/foley/chop", bite + 0.13, 0.4);
const crack = W(3, "می‌شکنه") + 0.05;
fx("sfx/break/glass-breaking-02", crack, 0.45);
fx("sfx/break/glass-breaking-05", crack + 0.06, 0.4);
cut(S(4) - 0.2, 0);
fx("v10:fuse", W(4, "روشن") + 0.15, 0.4);
const boom = W(4, "فقط") - 0.05;
fx("sfx/explosion/bang-02", boom, 0.55);
fx("sfx/pop/pop-3", W(4, "می‌سوزه") + 0.25, 0.35);
cut(S(5) - 0.2, 1);
fx("v10:lava", W(5, "آتشفشان") - 0.1, 0.35);
fx("v10:lava", W(5, "آتشفشان") + 2.6, 0.3);
// scrapbook polaroids + confetti
[0, 1, 2, 3].forEach((i) => fx(i % 2 ? "sfx/camera/shutter-dslr" : "sfx/camera/shutter-film", S(6) - 0.25 + i * 0.12 + 0.2, 0.3));
fx("sfx/explosion/firework-02", S(6) - 0.05, 0.3);

// ---- act 2 ----------------------------------------------------------------------
fx("sfx/notification/classic-chime", W(7, "عاشق") + 0.05, 0.3);
const kids = W(7, "دو") - 0.15;
fx("sfx/pop/pop-1", kids + 0.15, 0.35);
fx("sfx/pop/pop-2", kids + 0.27, 0.35);
fx("sfx/impact/soft-thump", W(7, "خونه") + 0.2, 0.4);
fx("sfx/pop/pop-3", W(7, "حیاط") + 0.1, 0.3);
fx("sfx/transition/swell-bell", W(7, "درخت") + 0.6, 0.3);
fx("sfx/mechanical/clock-tick-tock", S(8) + 0.8, 0.3);
fx("sfx/mechanical/clock-tick-tock", S(8) + 3.4, 0.25);
fx("sfx/pop/pop-4", W(9, "۸۵") + 0.12, 0.3);
fx("sfx/pop/pop-2", W(9, "۲۵") + 0.12, 0.3);
fx("sfx/impact/distant-boom", S(10) - 0.1, 0.4);
fx("sfx/impact/soft-medium-002", W(10, "بچه‌هات") + 0.1, 0.35);
fx("sfx/impact/soft-medium-002", W(10, "نوه‌هات") + 0.15, 0.3);
for (let k = 0, st = S(11) - 0.2; st < W(11, "اسم") - 0.2; st += 0.45, k++) fx(`sfx/footsteps/concrete-00${k % 4}`, st + 0.22, 0.22);
fx("sfx/paper/slide", W(11, "اسم") - 0.05, 0.35);
fx("sfx/impact/classic-stamp", W(11, "اسم") + 1.0, 0.35);
fx("sfx/camera/shutter-dslr", W(11, "خانواده") + 0.05, 0.35);
fx("sfx/impact/distant-boom", S(12) - 0.1, 0.3);
[0, 1, 2].forEach((i) => fx(i === 1 ? "sfx/break/glass-falling-01" : "sfx/break/wood-falling-02", S(13) - 0.2 + 1.1 + i * 0.35, 0.3));
fx("sfx/notification/classic-lock", W(13, "دل") + 0.5, 0.35);

// ---- act 3 ----------------------------------------------------------------------
fx("sfx/scifi/zap-three-tone-up", W(14, "هوش") + 0.2, 0.35);
fx("sfx/data/scan", W(14, "تصمیم") + 0.6, 0.3);
["sfx/glitch/short-1", "sfx/glitch/short-2", "sfx/glitch/short-3", "sfx/glitch/stutter"].forEach((g, i) => fx(g, W(14, "پاک") - 0.1 + i * 0.16 + 0.15, 0.3));
fx("sfx/ui/beep-11", W(14, "جز") + 0.15, 0.3);
fx("sfx/scifi/laser-retro-001", W(15, "لیزر") + 0.06, 0.4);
fx("sfx/whoosh/double", W(15, "موشک") + 0.2, 0.35);
fx("sfx/explosion/bang-05", W(15, "موشک") + 0.45, 0.5);
fx("sfx/creature/bug-01", W(15, "نانوربات") + 0.45, 0.3);
fx("sfx/creature/bug-03", W(15, "نانوربات") + 0.7, 0.3);
fx("sfx/scifi/zap-1", W(15, "رگ‌هات") + 0.22, 0.35);
fx("v10:bombfall", W(15, "اتم") - 0.15, 0.4);
fx("v10:nuke", W(15, "اتم") - 0.05, 0.6);
fx("sfx/misc/spring-07", W(16, "سیخ") - 0.03, 0.45);
fx("sfx/riser/noise-2s", W(18, "زمین") - 0.2, 0.3);
fx("sfx/impact/subdrop-long", W(18, "زمین") + 0.6, 0.45);
fx("sfx/riser/downlifter-dark", S(19) - 0.1, 0.35);
fx("sfx/riser/quick-1s", W(19, "مثل") + 0.7, 0.3);
fx("sfx/impact/glass-shimmer", W(19, "اون") - 0.15, 0.4);
fx("sfx/pop/pop-1", W(19, "سالم") - 0.1, 0.35);
const die = W(20, "یکی‌یکی") - 0.3;
["sfx/ui/glass-002", "sfx/ui/glass-003", "sfx/ui/glass-005", "sfx/ui/glass-006", "sfx/ui/glass-002", "sfx/ui/glass-003", "sfx/ui/glass-005", "sfx/ui/glass-006"].forEach((g, i) => fx(g, die + i * 0.38 + 0.02, 0.18));
fx("sfx/impact/subdrop-punch", W(21, "می‌شن") + 0.1, 0.4);
fx("sfx/magic/shimmer-pad", W(21, "می‌پاشن") - 0.4, 0.25);
fx("sfx/transition/swell-bell", W(23, "ابدیت") + 0.4, 0.3);
fx("sfx/transition/swell-cymbal-short", CARD, 0.3);

const music = [
  // playful: the drop (8.48 s in the track) lands on the jump out of the plane
  { id: "music/upbeat/happy-dance", at: 0, from: 8.481 - (W(1, "هواپیما") + 0.15), to: S(7) + 0.2, fadeIn: 0.3, fadeOut: 1.6, gain: 0.3 },
  // tender: love → family → loss
  { id: "music/calm/you-loved-me-once", at: S(7) - 0.9, from: 0, to: S(14) + 0.6, fadeIn: 1.4, fadeOut: 2.2, gain: 0.32 },
  // epic: the drop (11.98 s) lands on the first attack (laser); cut out on «نه صدایی»
  { id: "music/scifi/an-ocean-in-outer-space", at: S(14) - 0.6, from: 11.983 - (W(15, "لیزر") - S(14) + 0.6), to: W(22, "صدایی") + 0.15, fadeIn: 1.2, fadeOut: 0.9, gain: 0.3 },
  // only you: a quiet pad for forever
  { id: "music/ambient/cave-5", at: W(22, "فقط") - 0.3, from: 0, to: END, fadeIn: 1.5, fadeOut: 2.5, gain: 0.32 },
];
const beds = [
  { id: "sfx/ambience/wind", from: W(1, "هواپیما") + 0.2, to: W(1, "ترک"), vol: 0.35 },
  { id: "sfx/ambience/rain", from: S(10) - 0.2, to: S(11) - 0.2, vol: 0.3 },
  { id: "sfx/ambience/rain", from: S(12) - 0.2, to: S(13) - 0.2, vol: 0.25 },
  { id: "sfx/ambience/rain", from: W(13, "تنهایی") - 0.3, to: S(14) - 0.2, vol: 0.18 },
  { file: "public/v10/sfx/jungle.wav", from: S(17) - 0.2, to: S(18) - 0.2, vol: 0.3 },
];
fs.writeFileSync("videos/10-namira/mix.json", JSON.stringify({ length: +END.toFixed(3), voice: "public/v10/narration.wav", music, sfx, beds }, null, 1));
console.log("mix.json:", sfx.length, "effects ·", music.length, "music ·", beds.length, "beds · length", END.toFixed(2));
