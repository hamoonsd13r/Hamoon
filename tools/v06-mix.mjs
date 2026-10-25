// v06 mix plan → out/v06-mix.json (times from src/v06/words.json, same needles as src/v06/times.ts), then: node tools/mix.mjs out/v06-mix.json
import fs from "node:fs";
const W = JSON.parse(fs.readFileSync("src/v06/words.json", "utf8"));
const w = (si, n, nth = 0) => { const h = W.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => W.find((x) => x.si === si).s;
const END = W.at(-1).e + 1.5;
const L = (n) => ({ file: `public/sfx-lib/${n}.wav`, peak: 0.02 });
const cue = (at, n, v) => { const vol = +(v * 0.45).toFixed(3); return n.includes("/") ? { id: n, at, vol } : { ...L(n), at, vol }; };
const T = {
  chalus: w(0, "چالوس"), nadari: w(0, "نداری"), karaj: w(1, "کرج"), name: w(2, "توالت‌پرون"), request: w(2, "درخواست"),
  drone: w(3, "پهپاد"), speaker: w(3, "بلندگو"), space: w(3, "جا"), wires: w(4, "سیم"), next: w(4, "کنار"), land: w(4, "فرود"),
  scan: w(5, "اسکن"), go: w(5, "می‌ری"), kar: w(5, "کارت"), peek: w(6, "سرک"), hose: w(6, "شلنگش"), direct: w(6, "مستقیم"), face: w(6, "صورتش"),
  all: w(7, "همه"), seal: w(8, "پلمب"), weigh: w(8, "وزن"), fare: w(8, "کرایه"), card: w(8, "کارتت"), minus: w(8, "کم"),
  fly: w(9, "پرواز"), wash: w(9, "کارواش"), rate: w(10, "امتیاز"), toiletR: w(11, "توالت"), two: w(11, "دو"), star: w(11, "ستاره"),
};
const sfx = [
  cue(T.chalus, "pop", 0.35), cue(T.nadari, "error", 0.45), cue(T.karaj, "pin", 0.45),
  cue(T.name, "sfx/transition/power-up", 0.4), cue(T.request + 0.13, "click", 0.5),
  cue(T.drone + 0.4, "sfx/scifi/engine-circular-002", 0.18), cue(T.speaker, "notif", 0.35), cue(T.space + 0.1, "sweep", 0.35),
  cue(T.wires + 0.1, "scan", 0.4), cue(T.next, "match", 0.35), cue(T.land + 0.07, "thud", 0.55),
  cue(T.scan + 0.13, "sfx/mechanical/lock-open-01", 0.5), cue(T.go, "steps", 0.3), cue(T.kar + 0.13, "lock", 0.45),
  cue(T.peek - 0.2, "error", 0.4), cue(T.hose, "servo", 0.4), cue(T.direct, "sfx/water/splash-03", 0.45), cue(T.face, "sfx/water/splash-01", 0.6), cue(T.face + 0.15, "sfx/pop/bubbles-cluster", 0.35),
  cue(T.all + 0.1, "pop", 0.3), cue(T.all + 0.4, "pop", 0.25),
  cue(T.seal, "paper", 0.4), cue(T.seal + 0.3, "stamp", 0.55), cue(T.weigh, "ticks", 0.3), cue(T.fare, "whoosh", 0.3), cue(T.minus, "sfx/money/cash-register", 0.5),
  cue(T.fly, "sfx/scifi/engine-circular-002", 0.16), cue(T.wash + 0.1, "sfx/pop/bubbles-cluster", 0.35),
  ...[0, 1, 2, 3, 4].map((i) => cue(T.rate - 0.1 + i * 0.18, "blip", 0.35)), cue(T.rate + 0.9, "chime", 0.4),
  cue(T.toiletR, "notif", 0.4), cue(T.two, "error", 0.4), cue(T.star + 0.35, "stamp", 0.55),
  { id: "sfx/foley/toilet-02", at: END - 1.1, vol: 0.3 },
  // receipt printing
  ...[T.chalus, T.nadari, T.karaj, T.request + 0.2, T.land + 0.1, T.face, T.weigh + 0.5, T.fare, T.card].map((t) => cue(t + 0.05, "print", 0.22)),
  // scene cuts
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((si) => cue(S(si) - 0.05, "whoosh", 0.16)),
];
fs.writeFileSync("out/v06-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v06/narration.wav",
  music: [{ file: "public/audio/music/funk/breath.mp3", at: 0, from: 0, to: +END.toFixed(2), fadeIn: 0.2, fadeOut: 2.5, gain: 0.3 }],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
