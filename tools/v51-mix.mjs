// V51 · music (3 phases: mystery → psychological tension → hope) + minimal real-world effects → videos/51/mix.json
// Usage: npx esbuild src/v51/Video.tsx --bundle --platform=node --format=cjs --external:remotion --external:react \
//          --loader:.json=json --outfile=out/v51/vt.cjs && node tools/v51-mix.mjs \
//        && ALVANA_AUDIO_DIR=~/alvana-audio node tools/mix.mjs videos/51/mix.json --out public/v51/mix.wav
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { SHOTS, END } = require("../out/v51/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v51/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!?:؛«»…]/g, "");
const S = (n) => V.segs.find((s) => s.n === n).start;
const E = (n) => V.segs.find((s) => s.n === n).end;
const wd = (l, w, occ = 1) => { const ws = V.words.filter((x) => x.line === l); const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1]; if (!h) throw new Error(l + " " + w); return h.s; };
// video time of a moment inside a clip (first shot of that clip that shows source second t)
const ev = (c, t) => { const s = SHOTS.find((x) => x.c === c && t >= x.src - 1e-3 && t <= x.src + (x.to - x.at) * x.rate + 1e-3); if (!s) throw new Error("ev " + c + " " + t); return s.at + (t - s.src) / s.rate; };
const LEN = +END.toFixed(2), K = 0.75, sfx = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (file, at, vol = 0.4, peak = 0.05) => sfx.push({ file, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });

// HOOK: deep cinematic hit + sub under the first word
fx("sfx/impact/cinematic-heavy", 0.12, 0.5);
fx("sfx/impact/subdrop-long", 0.1, 0.4);
// phone: taps, scrolls
fx("sfx/ui/click-soft", S(2) + 0.6, 0.3);
fx("sfx/ui/scroll-005", S(3) + 0.7, 0.25); fx("sfx/ui/scroll-005", S(3) + 3.1, 0.22); fx("sfx/ui/scroll-002", S(4) + 1.6, 0.22);
fx("sfx/ui/click-soft", S(6) + 1.0, 0.25); fx("sfx/ui/scroll-005", S(7) + 0.3, 0.22); fx("sfx/ui/click-soft", S(8) + 0.4, 0.22);
fx("sfx/riser/downlifter-dark", ev("c04", 8.6), 0.3);            // the shadow arrives behind him
// mind world: thought hits, then the deep pull into the void
fx("sfx/whoosh/deep", S(12) + 0.02, 0.3); fx("sfx/whoosh/deep", wd(12, "فکر"), 0.3);
fx("sfx/impact/subdrop-long", wd(12, "خواسته‌ی"), 0.45);
fx("sfx/whoosh/cinematic", ev("c06", 4.2), 0.3);                  // red streaks rush in
fx("sfx/riser/downlifter-dark", ev("c06", 6.2), 0.35);            // the shadow rises behind
fx("sfx/body/heartbeat", ev("c01", 6.1), 0.35);
// chains: soft metal + low hit on «زنجیر»
fl("public/v51/sfx/chains.mp3", wd(19, "زنجیر"), 0.45, 0.1);
fx("sfx/impact/subdrop-long", wd(19, "زنجیر"), 0.35);
fl("public/v51/sfx/chains.mp3", ev("c08", 15.6), 0.3, 0.1);
fx("sfx/foley/metal-03", ev("c08", 17.0), 0.2);
// the friend's message arrives (left unanswered)
fx("sfx/notification/notify-message", S(22) + 0.25, 0.35);
// repetition flashes
fx("sfx/whoosh/reverse", wd(24, "تکرار") - 0.05, 0.25);
// mirror: long eerie swell landing on the change, then the sub
fx("sfx/transition/swell-bell", ev("c09", 2.7), 0.4);
fx("sfx/whoosh/reverse", ev("c09", 2.7), 0.3);
fx("sfx/impact/subdrop-long", ev("c09", 2.75), 0.4);
fx("sfx/foley/metal-03", ev("c09", 4.4), 0.12);                    // hand on the glass
fx("sfx/body/heartbeat", E(28) + 0.25, 0.35); fx("sfx/body/heartbeat", E(28) + 1.05, 0.25);
// the decision: phone down + power off, the shadow dissolves
fx("sfx/foley/metal-03", ev("c10", 4.42), 0.12);
fl("public/v51/sfx/powerdown.mp3", ev("c10", 4.5), 0.35, 0.05);
fx("sfx/riser/downlifter-dark", ev("c10", 5.1), 0.25);
// light floods the room on «همین امروز»
fx("sfx/magic/shimmer-pad", S(34), 0.35);
fx("sfx/whoosh/reverse", ev("c11", 3.2), 0.25);                    // the dark peels away
fx("sfx/transition/swell-bell", ev("c11", 4.6), 0.3);              // out into the field

const beds = [
  { id: "sfx/ambience/room-tone", from: 0, to: S(9) - 0.1, vol: 0.28 },
  { id: "sfx/ambience/night-crickets", from: 0, to: S(9) - 0.1, vol: 0.1 },
  { file: "public/v51/sfx/class.wav", from: S(9) - 0.1, to: S(12) - 0.1, vol: 0.32 },
  { id: "sfx/mechanical/clock-tick-tock", from: S(16) - 0.1, to: S(19) - 0.1, vol: 0.4 },
  { id: "sfx/ambience/room-tone", from: S(29), to: S(34), vol: 0.22 },
  { id: "sfx/ambience/wind", from: S(35) + 2.5, to: LEN, vol: 0.18 },
];
const M = (f, at, to, from = 0, fadeIn = 0.8, fadeOut = 2, gain = 0.07) => ({ file: "public/audio/music/" + f + ".mp3", at: +at.toFixed(3), from, to: +(from + (to - at)).toFixed(3), fadeIn, fadeOut, gain });
const tensionIn = wd(12, "خواسته‌ی") - 1.5, phoneDown = ev("c10", 4.42), hope = S(34) - 0.3;
const music = [
  M("dark/game-over-4", 0, tensionIn + 3, 0, 0.3, 3.5, 0.075),                        // Mystery
  M("horror/between-life-and-death", tensionIn, phoneDown + 2.5, 0, 3.0, 4.5, 0.075),  // Psychological tension (fades as the phone goes down)
  M("calm/love", hope, LEN, 0, 2.5, 2.5, 0.11),                                        // Hope (soft opening builds)
];
fs.writeFileSync("videos/51/mix.json", JSON.stringify({ length: LEN, voice: "public/v51/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/51/mix.json", sfx.length, "sfx", LEN, "s · tension", tensionIn.toFixed(1), "→", phoneDown.toFixed(1), "· hope", hope.toFixed(1));
