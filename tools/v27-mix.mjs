// v27 «اگه یه روز…» audio: one effect per visible event (times from src/v27/words.json, same cues as src/v27/Video.tsx),
// Alvana «Cave 1» under the voice with its drop on the blueprint scene, then tools/mix.mjs → public/v27/mix-norm.wav.
//   ALVANA_AUDIO_DIR=~/alvana-audio node tools/v27-mix.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const W = JSON.parse(fs.readFileSync("src/v27/words.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!…«»,:؛]/g, "");
const w = (si, word) => (W.find((q) => q.si === si && bare(q.w) === word) ?? W.find((q) => q.si === si && q.w.includes(word))).s;
const S = (si) => W.find((q) => q.si === si).s;
const E = (si) => W.filter((q) => q.si === si).at(-1).e;
const at = (si) => S(si) - 0.22;
const TOTAL = E(17) + 1.8;

const fx = [];
// spread repeats over look-alike files (the same file at most 4–5 times)
const ALT = { "ui/tick-001": ["ui/tick-001", "ui/tick-004", "ui/click-soft"], "paper/slide": ["paper/slide", "ui/swipe"], "pop/pop-1": ["pop/pop-1", "paper/book-open"] };
const used = {};
const add = (id, t, vol = 0.4) => {
  const alts = ALT[id] ?? [id];
  const k = (used[id] = (used[id] ?? -1) + 1);
  fx.push({ id: alts[k % alts.length], at: +t.toFixed(3), vol: +(vol * 0.42).toFixed(3) });
};
// 0 · hook
add("paper/slide", 0.15, 0.35); add("camera/shutter-film", 0.35, 0.35);
add("pop/pop-1", w(1, "ویدیو") + 0.05, 0.4); add("paper/slide", w(1, "می‌تونه") + 0.1, 0.35); add("whoosh/swish-thin", w(1, "نجات"), 0.25);
// 1 · blast, most people, three
add("whoosh/soft-short", at(2) + 0.1, 0.35); add("impact/distant-boom", w(2, "انفجار") + 0.1, 0.55);
add("pop/pop-2", w(2, "آدما"), 0.3); add("notification/success-soft", w(2, "سالم") + 0.1, 0.35); add("impact/punchy-short", w(2, "سه"), 0.45);
// 2 · three steps
add("paper/page-flip", at(3) + 0.1, 0.4);
for (const [k, t] of [[1, w(3, "برو")], [2, W.filter((q) => q.si === 3)[2].s], [3, w(3, "گوش")]]) { add(`pop/pop-${k}`, t, 0.4); add("ui/tick-001", t + 0.5, 0.35); }
// 3 · flash
add("whoosh/fast-bright", at(4) + 0.08, 0.35); add("impact/subdrop-short", w(4, "نوری"), 0.45); add("impact/classic-stamp", w(4, "نکن"), 0.45);
// 4 · drop & cover
add("whoosh/soft-medium", at(5) + 0.15, 0.35); add("impact/soft-thump", w(5, "بکش") + 0.2, 0.5);
add("pop/pop-1", w(5, "دراز"), 0.3); add("pop/pop-2", w(5, "صورتت"), 0.3); add("pop/pop-3", w(5, "سرت"), 0.3);
// 5 · blast wave, windows
add("whoosh/soft-short", at(6) + 0.1, 0.35); add("impact/subdrop-punch", w(6, "موج"), 0.5); add("break/glass-breaking-02", w(6, "می‌رسه") + 0.1, 0.45);
add("paper/slide", w(6, "فاصله"), 0.35);
// 6 · fallout, 15 minutes
add("paper/page-flip", at(7) + 0.1, 0.4); add("impact/punchy-short", w(7, "پونزده"), 0.45);
// 7 · car
add("paper/slide", at(8) + 0.15, 0.4); add("impact/classic-stamp", w(8, "نکن"), 0.45); add("pop/pop-3", w(8, "پناهگاه"), 0.35);
// 8 · blueprint
add("whoosh/soft-long", at(9) + 0.25, 0.4); add("paper/page-flip", at(9) + 0.05, 0.4);
add("ui/tick-001", w(9, "آجری"), 0.35); add("ui/tick-001", w(9, "دیوار"), 0.35); add("notification/success-soft", w(9, "امن‌تر"), 0.3);
add("pop/pop-1", w(10, "زیرزمین"), 0.35); add("pop/pop-2", w(10, "وسط"), 0.35); add("paper/slide", w(10, "ببند"), 0.3); add("ui/click-crisp", w(10, "خاموش"), 0.45);
// 9 · decontamination
add("paper/page-flip", at(11) + 0.05, 0.4); add("whoosh/swish-thin", w(11, "دربیار") + 0.3, 0.3); add("pop/pop-3", w(11, "کیسه") + 0.1, 0.35); add("data/collect", w(11, "نود"), 0.35);
// 10 · shower
add("paper/slide", at(12) + 0.15, 0.4); add("pop/bubbles-cluster", w(12, "آب"), 0.25);
add("ui/tick-001", w(12, "آب") + 0.3, 0.35); add("ui/tick-001", w(12, "صابون") + 0.3, 0.35); add("ui/click-crisp", w(12, "نرم‌کننده") + 0.2, 0.4);
// 11 · water & food
add("whoosh/soft-medium", at(13) + 0.15, 0.35); add("camera/shutter-film", w(13, "بطری"), 0.3); add("camera/shutter-film", w(13, "یخچال"), 0.3);
add("notification/success-soft", w(13, "سالمه"), 0.35);
// 12 · decay
add("whoosh/fast-bright", at(14) + 0.08, 0.35); add("pop/pop-1", w(14, "خوب"), 0.35); add("ui/tick-001", w(14, "هفت") + 0.1, 0.35); add("impact/punchy-short", w(14, "ده"), 0.4);
// 13 · 24 hours
add("whoosh/soft-short", at(15) + 0.1, 0.35); add("impact/subdrop-punch", w(15, "بیست"), 0.4); add("pop/pop-2", w(15, "رسمی"), 0.35);
// 14 · recap
add("paper/slide", at(16) + 0.15, 0.4);
add("pop/pop-1", w(16, "نور"), 0.35); add("pop/pop-2", w(16, "پونزده"), 0.35); add("pop/pop-3", W.filter((q) => q.si === 16).find((q) => q.w.startsWith("بیست")).s, 0.35);
// 15 · send
add("whoosh/soft-short", at(17) + 0.1, 0.35); add("whoosh/double", w(17, "بفرست") + 0.3, 0.4); add("notification/success-soft", w(17, "بفرست") + 0.6, 0.35);

// music: Cave 1, drop (42.593 s in the file) on the blueprint scene
const off = 42.593 - at(9);
const mix = {
  length: +TOTAL.toFixed(2),
  voice: "public/v27/narration.wav",
  music: [{ file: "public/audio/music/ambient/cave-1.mp3", at: 0, from: +off.toFixed(3), to: +(off + TOTAL).toFixed(3), fadeIn: 0.3, fadeOut: 2.5, gain: 0.4 }],
  sfx: fx.map((f) => ({ id: `sfx/${f.id}`, at: f.at, vol: f.vol })),
  beds: [{ id: "sfx/ambience/wind", from: +at(7).toFixed(2), to: +at(8).toFixed(2), vol: 0.18 }],
  audioDir: "public/audio",
};
fs.mkdirSync("out/v27", { recursive: true });
fs.writeFileSync("out/v27/mix.json", JSON.stringify(mix, null, 1));
const n = {}; for (const f of fx) n[f.id] = (n[f.id] ?? 0) + 1;
console.log("effects", fx.length, "· most used", Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 3).map((e) => e.join("×")).join(" "));
execFileSync(process.execPath, ["tools/mix.mjs", "out/v27/mix.json", "--out", "public/v27/mix-norm.wav", "--stems"], { stdio: "inherit" });
