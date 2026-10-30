// V27 · mix plan: Farid narration + «50 Over The Speed Limit» + effects on the visible events (times from vo.json,
// same word lookup as src/v27/Video.tsx). Writes out/v27/mix.json, then: node tools/mix.mjs out/v27/mix.json …
import fs from "node:fs";
const VO = JSON.parse(fs.readFileSync("src/v27/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:]/g, "");
const wd = (l, w) => (VO.words.find((x) => x.line === l && bare(x.w) === w) ?? VO.words.find((x) => x.line === l && x.w.includes(w))).s;
const seg = (n) => VO.segs.find((s) => s.n === n);
const cut = (x) => x - 0.06;
const L = +(VO.total + 1.4).toFixed(2);
const sfx = [];
const at = (id, t, vol = 0.4) => sfx.push({ id: "sfx/" + id, at: +t.toFixed(3), vol: +(vol * 0.5).toFixed(3) });
// launch
at("whoosh/deep", wd(1, "شلیک") + 0.25, 0.5);
at("whoosh/double", wd(1, "شلیک") + 0.6, 0.35);
at("whoosh/fast-bright", cut(wd(3, "سریع‌ترین")), 0.4);
// egg + divisions
at("pop/bubble-1", wd(3, "تخمک") + 0.1, 0.5);
at("magic/sparkle", wd(3, "زندگی"), 0.3);
at("pop/pop-1", wd(3, "زندگی"), 0.4);
at("pop/pop-2", wd(3, "تازه"), 0.4);
at("pop/pop-3", wd(3, "شروع"), 0.4);
// myth stamp (lands 0.11 s after the word)
const stamp = wd(4, "افسانه‌ست") + 0.11;
at("impact/classic-stamp", stamp, 0.6);
at("impact/subdrop-punch", stamp, 0.45);
// acid
at("glitch/short-2", cut(seg(5).start), 0.3);
at("data/hud-ping", cut(seg(5).start) + 0.2, 0.3);
at("riser/noise-2s", wd(5, "حمله"), 0.25);
const atk = wd(5, "حمله"), mil = wd(5, "میلیون‌ها");
const slimes = ["water/slime-01", "water/slime-04", "water/slime-02", "water/slime-12"];
let k = 0;
for (let i = 0; i < 28; i++) {
  if (i % 3 === 2) continue;
  const th = i < 10 ? atk + 0.12 + i * 0.07 : mil + 0.05 + (i - 10) * 0.06;
  if (i % 2 === 0 && k < 14) at(slimes[k++ % 4], th, 0.32);
}
at("water/splash-06", wd(5, "همون‌جا"), 0.5);
at("impact/soft-thump", wd(5, "می‌میرن"), 0.45);
// fluid
at("whoosh/soft-short", cut(seg(6).start), 0.3);
at("magic/sparkle-rise", wd(6, "همراهشونه"), 0.35);
at("pop/bubbles-cluster", wd(6, "خنثی"), 0.4);
at("whoosh/swish-thin", wd(6, "فرصت") + 0.2, 0.35);
// mucus
at("water/splash-14", cut(seg(7).start), 0.35);
at("water/bubble-02", wd(7, "مخاط"), 0.4);
at("water/slime-02", wd(7, "چسبناک"), 0.35);
// immune
at("whoosh/deep", wd(8, "ایمنی"), 0.4);
at("body/heartbeat", wd(8, "سلول"), 0.35);
at("impact/punchy-short", wd(8, "نابود"), 0.5);
at("water/slime-12", wd(8, "نابود") + 0.1, 0.35);
// field + counter
at("riser/downlifter-dark", cut(seg(9).start), 0.35);
at("glitch/stutter", wd(9, "صدتا"), 0.35);
// the one
at("whoosh/soft-short", cut(seg(10).start), 0.3);
at("impact/glass-shimmer", wd(10, "واردش"), 0.5);
at("impact/subdrop-short", wd(10, "واردش"), 0.45);
const plan = {
  length: L,
  voice: "public/v27/vo.wav",
  music: [{ file: "public/audio/music/synthwave/50-over-the-speed-limit.mp3", at: 0, from: 0, to: L, fadeIn: 0.2, fadeOut: 2.2, gain: 0.17 }],
  sfx,
};
fs.mkdirSync("out/v27", { recursive: true });
fs.writeFileSync("out/v27/mix.json", JSON.stringify(plan, null, 1));
console.log(`${sfx.length} effects, length ${L}s`);
