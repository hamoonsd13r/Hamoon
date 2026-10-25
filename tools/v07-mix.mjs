// v07 mix plan → out/v07-mix.json (beats from src/v07/words.json, same needles as src/v07/Video.tsx), then: node tools/mix.mjs out/v07-mix.json
import fs from "node:fs";
const W = JSON.parse(fs.readFileSync("src/v07/words.json", "utf8"));
const w = (si, n) => W.find((x) => x.si === si && x.w.includes(n)).s;
const S7 = "videos/07-moshak/sfx/";
const T = {
  fire: w(0, "شلیک") + 0.08, run: w(0, "می‌تونی"), grab: w(0, "بگیریش"), wide: w(1, "خب"), speed0: w(1, "باید"), sisad: w(1, "سیصد"),
  front: w(1, "جلو") - 0.18, snatch: w(1, "بقاپیش"), but: w(2, "ولی"), kuchulu: w(2, "کوچولو"), insted: w(3, "به‌جاش"), ahead: w(3, "جلو"),
  behind: W.filter((x) => x.si === 3 && x.w === "از").at(-1).s, hit: W.at(-1).e - 0.12,
};
const END = T.hit + 1.75;
const fx = (id, at, vol) => ({ id, at: +at.toFixed(3), vol });
const own = (n, at, vol, peak = 0.05) => ({ file: S7 + n, at: +at.toFixed(3), vol, peak });
// footsteps on the running shots (run cycle 3.4–3.8 Hz → a step every ~0.14 s), quiet
const steps = [];
const runs = [[T.run + 0.1, T.front, 0.15], [T.front, T.but, 0.16], [T.insted + 0.3, T.hit, 0.135]];
let k = 0;
for (const [a, b, dt] of runs) for (let t = a; t < b - 0.05; t += dt) steps.push(fx(`sfx/footsteps/concrete-00${(k++ % 3) + 1}`, t, 0.16));
const sfx = [
  fx("sfx/explosion/cannon-04", T.fire, 0.75),
  fx("sfx/whoosh/fast-bright", T.fire + 0.25, 0.4),
  fx("sfx/whoosh/double", T.wide - 0.04, 0.3),
  ...[0.25, 0.5, 0.75, 1].map((p, i) => fx("sfx/ui/tick-001", T.speed0 + (T.sisad + 0.2 - T.speed0) * p * 0.9, 0.3 + i * 0.05)),
  fx("sfx/explosion/bang-08", T.sisad + 0.2, 0.0) && fx("sfx/misc/spring-09", T.sisad + 0.22, 0.4),
  fx("sfx/whoosh/fast-bright", T.front - 0.02, 0.35),
  fx("sfx/impact/metal-medium-002", T.snatch, 0.5),
  own("skid-1.mp3", T.but + 0.05, 0.1, 0.3),
  fx("sfx/whoosh/swish-13", T.kuchulu - 0.03, 0.4),
  fx("sfx/whoosh/double", T.insted + 0.25, 0.35),
  fx("sfx/misc/spring-03", T.ahead + 0.05, 0.3),
  fx("sfx/whoosh/fast-bright", T.behind + 0.1, 0.4),
  fx("sfx/explosion/bang-03", T.hit, 0.95),
  own("whistle-1.mp3", T.hit + 0.15, 0.09, 0.1),
  own("ding-1.mp3", END - 0.45, 0.08, 0.05),
  ...steps,
];
fs.writeFileSync("out/v07-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v07/narration.wav",
  music: [{ file: "public/audio/music/upbeat/happy-dance.mp3", at: 0, from: 0, to: +T.hit.toFixed(2), fadeIn: 0.05, fadeOut: 0.08, gain: 0.3 }],
  beds: [{ file: S7 + "hiss-1.mp3", from: +(T.fire + 0.15).toFixed(2), to: +T.hit.toFixed(2), vol: 0.035 }],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
