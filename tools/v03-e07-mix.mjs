// V03 e07 mix plan → src/v03/e07-mix.json, then: node tools/mix.mjs src/v03/e07-mix.json --out public/v03/e07/mix.wav (use the -norm output)
import fs from "node:fs";
const vo = JSON.parse(fs.readFileSync("src/v03/e07-vo.json", "utf8"));
const W = (l, w) => vo.words.find((x) => x.line === l && x.w.includes(w)).s;
const S = (l) => vo.segs.find((s) => s.n === l).start;
const LEN = +(vo.total + 1.6).toFixed(2);
const lib = (id, at, vol) => ({ id, at: +at.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
const DROP = W(7, "آسمون");
const dragA = W(3, "کشیده") - 0.3;
const sfx = [
  lib("sfx/body/heartbeat", 0.3, 0.2), lib("sfx/impact/distant-boom", W(1, "زمینه"), 0.2),
  lib("sfx/whoosh/swish-thin", S(2) - 0.1, 0.15),
  ...["آب", "بیسکویت", "دارو", "کلیدِ"].map((w) => lib("sfx/impact/classic-thud", W(2, w) + 0.25, 0.35)),
  lib("sfx/money/coin-drop", W(2, "کلیدِ") + 0.25, 0.15),
  lib("sfx/whoosh/fast-bright", S(3) - 0.1, 0.12),
  lib("sfx/foley/creak-1", dragA + 0.3, 0.35), lib("sfx/foley/creak-3", dragA + 1.1, 0.3), lib("sfx/foley/creak-2", dragA + 1.9, 0.3),
  lib("sfx/body/heartbeat-fast", dragA + 0.6, 0.18),
  lib("sfx/transition/whoosh-hit-2", S(4) - 0.1, 0.13),
  lib("sfx/foley/creak-2", W(4, "پناهگاهِ"), 0.35),
  lib("sfx/whoosh/swish-thin", S(5) - 0.1, 0.12),
  lib("sfx/notification/notify-message", W(5, "دارم"), 0.3),
  lib("sfx/whoosh/fast-bright", S(6) - 0.1, 0.12),
  lib("sfx/foley/creak-1", W(6, "پنجره"), 0.35),
  lib("sfx/transition/whoosh-hit-2", S(7) - 0.1, 0.15),
  lib("sfx/riser/quick-1s", DROP - 0.2, 0.15),
  lib("sfx/impact/subdrop-long", DROP, 0.25),
  lib("sfx/impact/cinematic-heavy", vo.total + 0.05, 0.27),
];
fs.writeFileSync("src/v03/e07-mix.json", JSON.stringify({
  length: LEN, voice: "public/v03/e07/vo.wav",
  music: [{ id: "music/horror/tension-in-the-air", at: +(DROP - 16.0).toFixed(2), from: 0, to: LEN, fadeIn: 2.5, fadeOut: 1.2, gain: 0.26 }],
  beds: [{ id: "sfx/ambience/wind", from: 0, to: +S(6).toFixed(2), vol: 0.2 }, { id: "sfx/ambience/rain", from: +S(6).toFixed(2), to: LEN, vol: 0.18 }],
  sfx,
}, null, 1));
console.log("len", LEN, "drop", DROP);
