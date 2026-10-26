// V03 e08 mix plan → src/v03/e08-mix.json, then: node tools/mix.mjs src/v03/e08-mix.json --out public/v03/e08/mix.wav (use the -norm output)
import fs from "node:fs";
const vo = JSON.parse(fs.readFileSync("src/v03/e08-vo.json", "utf8"));
const W = (l, w) => vo.words.find((x) => x.line === l && x.w.includes(w)).s;
const S = (l) => vo.segs.find((s) => s.n === l).start;
const LEN = +(vo.total + 2.2).toFixed(2);
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const own = (file, at, vol, peak = 0.02) => ({ file, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3), peak });
const RING = W(5, "زنگ"), SHUT = W(7, "بَستَم"), RING2 = W(8, "زنگ");
const run = Array.from({ length: 10 }, (_, i) => S(4) + 0.2 + i * 0.36);
const sfx = [
  lib("sfx/body/heartbeat", 0.4, 0.18),
  lib("sfx/whoosh/swish-thin", S(2) - 0.15, 0.12),
  lib("sfx/impact/distant-boom", S(3) - 0.05, 0.18),
  lib("sfx/transition/whoosh-hit-2", S(4) - 0.1, 0.14),
  ...run.map((t, i) => lib(`sfx/footsteps/concrete-00${i % 4}`, t, 0.3)),
  lib("sfx/impact/metallic", W(4, "دَویدیم") - 0.1, 0.15),
  lib("sfx/whoosh/fast-bright", S(5) - 0.1, 0.12),
  own("public/v03/e08/ring.wav", RING - 0.05, 0.22),
  own("videos/09-pomp-benzin/sfx/vibrate-1.mp3", RING, 0.18, 0.05),
  lib("sfx/impact/subdrop-long", W(5, "سه") - 0.1, 0.2),
  lib("sfx/foley/creak-2", S(6) - 0.2, 0.3),
  lib("sfx/impact/metallic", SHUT + 0.1, 0.45),
  lib("sfx/impact/metal-heavy-002", SHUT + 0.5, 0.4),
  lib("sfx/whoosh/swish-thin", S(8) - 0.15, 0.1),
  own("public/v03/e08/ring.wav", RING2, 0.25),
  lib("sfx/impact/cinematic-heavy", vo.total + 0.05, 0.27),
];
fs.writeFileSync("src/v03/e08-mix.json", JSON.stringify({
  length: LEN, voice: "public/v03/e08/vo.wav",
  music: [
    { id: "music/horror/tension-in-the-air", at: 0, from: +(16.0 - RING).toFixed(2) < 0 ? 0 : +(16.0 - RING).toFixed(2), to: +(SHUT + 0.15).toFixed(2), fadeIn: 1.5, fadeOut: 0.15, gain: 0.24 },
    { file: "public/audio/music/horror/floor-1.mp3", at: +(S(8) - 0.4).toFixed(2), from: 0, to: LEN, fadeIn: 1.5, fadeOut: 2, gain: 0.22 },
  ],
  beds: [{ id: "sfx/ambience/rain", from: +S(4).toFixed(2), to: +S(5).toFixed(2), vol: 0.18 }, { id: "sfx/ambience/wind", from: 0, to: +S(4).toFixed(2), vol: 0.18 }],
  sfx,
}, null, 1));
console.log("len", LEN, "ring", RING, "shut", SHUT);
