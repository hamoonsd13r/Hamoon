import fs from "node:fs";
// V03 e06 mix plan → src/v03/e06-mix.json, then: node tools/mix.mjs src/v03/e06-mix.json --out public/v03/e06/mix.wav (use the -norm output)
const vo = JSON.parse(fs.readFileSync("src/v03/e06-vo.json", "utf8"));
const W = (l, w) => vo.words.find((x) => x.line === l && x.w.includes(w)).s;
const S = (l) => vo.segs.find((s) => s.n === l).start, E = (l) => vo.segs.find((s) => s.n === l).end;
const LEN = +(vo.total + 1.6).toFixed(2);
const D = "videos/09-pomp-benzin/sfx/";
const own = (n, at, vol, peak = 0.05) => ({ file: `${D}${n}-1.mp3`, at: +at.toFixed(3), vol: +(vol * 0.1).toFixed(3), peak });
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const DROP = W(9, "باز");
const a = W(6, "چیزی"), b = W(6, "بالا");
const steps = [0, 1, 2, 3, 4].map((k) => a + ((b - a) * k) / 4);
const sfx = [
  lib("sfx/body/heartbeat", 0.3, 0.2), lib("sfx/body/heartbeat", 1.9, 0.2),
  lib("sfx/whoosh/swish-thin", S(2) - 0.1, 0.15),
  own("vibrate", W(2, "لرزید") - 0.05, 0.9),
  own("alert", W(2, "هشدارِ") - 0.1, 0.55, 0.1),
  lib("sfx/glitch/static", S(3) - 0.15, 0.12),
  lib("sfx/impact/distant-boom", W(3, "نکنید"), 0.16),
  lib("sfx/whoosh/fast-bright", S(4) - 0.1, 0.12),
  lib("sfx/transition/whoosh-hit-2", S(5) - 0.1, 0.15),
  ...steps.map((t, i) => lib(i % 2 ? "sfx/footsteps/concrete-002" : "sfx/footsteps/concrete-000", t, 0.25 + i * 0.05)),
  lib("sfx/foley/creak-2", W(6, "میاد"), 0.3),
  lib("sfx/riser/quick-1s", b + 0.2, 0.14),
  lib("sfx/body/heartbeat-fast", S(7), 0.2),
  lib("sfx/glitch/static", W(8, "بُرید"), 0.35), lib("sfx/glitch/static", W(8, "بُرید") + 0.35, 0.25),
  lib("sfx/foley/creak-2", DROP - 0.1, 0.4),
  lib("sfx/impact/subdrop-long", DROP, 0.22),
  lib("sfx/creature/scream-02", W(9, "کرد") + 0.5, 0.12),
  lib("sfx/impact/cinematic-heavy", vo.total + 0.05, 0.27),
];
fs.writeFileSync("src/v03/e06-mix.json", JSON.stringify({
  length: LEN, voice: "public/v03/e06/vo.wav",
  music: [{ id: "music/horror/tension-in-the-air", at: +(DROP - 16.0).toFixed(2), from: 0, to: LEN, fadeIn: 2.5, fadeOut: 1.2, gain: 0.26 }],
  beds: [{ id: "sfx/ambience/wind", from: 0, to: +(S(9)).toFixed(2), vol: 0.22 }],
  sfx,
}, null, 1));
console.log("len", LEN, "drop", DROP, "music at", (DROP - 16).toFixed(2));
