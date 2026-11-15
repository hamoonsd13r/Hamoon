// V52 · music (dark → hopeful, kept far under the voice: the user found V51's music too loud) + effects → videos/52/mix.json
// Usage: npx esbuild src/v52/Video.tsx --bundle --platform=node --format=cjs --external:remotion --external:react \
//          --loader:.json=json --outfile=out/v52/vt.cjs && node tools/v52-mix.mjs \
//        && ALVANA_AUDIO_DIR=~/alvana-audio node tools/mix.mjs videos/52/mix.json --out public/v52/mix.wav
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { SHOTS, END } = require("../out/v52/vt.cjs");
const V = JSON.parse(fs.readFileSync("src/v52/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!?:؛«»…]/g, "");
const S = (n) => V.segs.find((s) => s.n === n).start;
const wd = (l, w, occ = 1) => { const ws = V.words.filter((x) => x.line === l); const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1]; if (!h) throw new Error(l + " " + w); return h.s; };
const ev = (c, t) => { const s = SHOTS.find((x) => x.c === c && t >= x.src - 1e-3 && t <= x.src + (x.to - x.at) * x.rate + 1e-3); if (!s) throw new Error("ev " + c + " " + t); return s.at + (t - s.src) / s.rate; };
const LEN = +END.toFixed(2), K = 0.75, sfx = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
const fl = (file, at, vol = 0.4, peak = 0.02) => sfx.push({ file, at: +at.toFixed(3), vol: +(vol * K).toFixed(3), peak });
// alarm beeps cut to exactly how long the clock rings on screen
const alarm = (name, a, b) => { const f = `public/v52/sfx/${name}.wav`; execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "public/v52/sfx/alarm.wav", "-af", `atrim=0:${(b - a).toFixed(3)},afade=t=out:st=${Math.max(0, b - a - 0.08).toFixed(3)}:d=0.08`, f]); fl(f, a, 0.35, 0.01); };

// HOOK
fx("sfx/impact/cinematic-heavy", 0.12, 0.5);
fx("sfx/impact/subdrop-long", 0.1, 0.35);
fx("sfx/riser/downlifter-dark", 2.6, 0.25);
// phone in bed
fx("sfx/ui/click-soft", S(3) + 0.5, 0.28); fx("sfx/ui/scroll-005", S(3) + 1.5, 0.22); fx("sfx/ui/scroll-002", S(3) + 2.7, 0.2);
// first morning: the alarm rings until his hand hits it
const a1 = ev("c01", 1.05), off1 = ev("c01", 2.5);
alarm("alarm-1", a1, off1); fx("sfx/ui/toggle-off", off1, 0.35);
// the monster over the bed
fx("sfx/impact/subdrop-long", S(11), 0.35); fx("sfx/whoosh/deep", S(11) - 0.05, 0.25);
fx("sfx/riser/downlifter-dark", ev("c01", 3.5), 0.25);
// mirror: the red shadow behind him, then the fists
fx("sfx/transition/swell-bell", ev("c05", 1.45), 0.35); fx("sfx/impact/subdrop-long", ev("c05", 1.5), 0.3);
fx("sfx/impact/soft-thump", ev("c05", 2.35), 0.35);
// second morning: the alarm, he gets up
const a2 = ev("c06", 0.1), off2 = ev("c06", 2.05);
alarm("alarm-2", a2, off2);
fx("sfx/whoosh/soft-short", wd(20, "بلند") - 0.05, 0.3);
// training and the climb: footsteps
[1.3, 1.55, 1.8, 3.3, 3.55, 3.8].forEach((t, i) => fx("sfx/footsteps/grass-00" + (i % 2 ? 3 : 1), ev("c07", Math.min(t, 3.7)), 0.22));
[1.3, 1.6, 1.9].forEach((t, i) => fx("sfx/footsteps/concrete-00" + (i % 2), ev("c09", t), 0.22));
// the shadow reaches · he stands · it bursts into light on «انضباط»
fx("sfx/riser/downlifter-dark", ev("c08", 1.25), 0.3); fx("sfx/body/heartbeat", ev("c08", 2.1), 0.3);
fx("sfx/impact/cinematic-heavy", wd(28, "انضباط"), 0.45); fx("sfx/transition/swell-bell", wd(28, "انضباط"), 0.35);
fx("sfx/magic/shimmer-pad", wd(28, "انضباط") + 0.1, 0.3);
// summit at sunrise
fx("sfx/transition/swell-bell", S(31), 0.3);

const beds = [
  { id: "sfx/ambience/room-tone", from: 0, to: S(20), vol: 0.25 },
  { id: "sfx/mechanical/clock-tick-tock", from: S(9) - 0.1, to: S(11) - 0.1, vol: 0.32 },
  { file: "public/v05/sfx/birds.wav", from: ev("c06", 2.9), to: S(26), vol: 0.12 },
  { id: "sfx/ambience/wind", from: S(29) - 0.3, to: LEN, vol: 0.16 },
];
const M = (f, at, to, from = 0, fadeIn = 0.8, fadeOut = 2, gain = 0.03) => ({ file: "public/audio/music/" + f + ".mp3", at: +at.toFixed(3), from, to: +(from + (to - at)).toFixed(3), fadeIn, fadeOut, gain });
const turn = S(18) - 0.5;
const music = [
  M("dark/game-over-4", 0, turn + 3, 0, 0.3, 3.5, 0.03),   // the lie, the lost days
  M("calm/love", turn, LEN, 0, 3.0, 2.5, 0.036),            // the decision → the summit (its soft opening builds slowly)
];
fs.writeFileSync("videos/52/mix.json", JSON.stringify({ length: LEN, voice: "public/v52/vo.wav", music, beds, sfx }, null, 1));
console.log("videos/52/mix.json", sfx.length, "sfx", LEN, "s · turn", turn.toFixed(1));
