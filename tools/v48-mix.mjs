// V48 · music + effects plan → videos/48/mix.json, then tools/mix.mjs
// Usage: node tools/v48-mix.mjs && ALVANA_AUDIO_DIR=~/alvana-audio node tools/mix.mjs videos/48/mix.json --out public/v48/mix.wav
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("src/v48/vo.json", "utf8"));
const bare = (x) => x.replace(/[،.؟!?]/g, "");
const S = (n) => V.segs.find((s) => s.n === n).start;
const wd = (l, w, occ = 1) => { const ws = V.words.filter((x) => x.line === l); const h = ws.filter((x) => bare(x.w) === w)[occ - 1] ?? ws.filter((x) => bare(x.w).includes(w))[occ - 1]; if (!h) throw new Error(l + " " + w); return h.s; };
const LEN = +(V.total + 1.5).toFixed(2), K = 0.32, sfx = [];
const fx = (id, at, vol = 0.4) => sfx.push({ id, at: +at.toFixed(3), vol: +(vol * K).toFixed(3) });
// hook
fx("sfx/impact/cinematic-heavy", 0.05, 0.55);
fx("sfx/impact/punchy-short", wd(1, "منتشر"), 0.4);
fx("sfx/whoosh/fast-bright", wd(1, "اما") - 0.05, 0.35);
fx("sfx/riser/quick-1s", wd(1, "چهل") - 0.02, 0.3);
fx("sfx/impact/subdrop-punch", wd(1, "چهل"), 0.55);
fx("sfx/pop/pop-2", wd(2, "درست"), 0.35);
fx("sfx/whoosh/swish-thin", S(3) - 0.08, 0.35);
fx("sfx/impact/soft-thump", wd(3, "سیزده"), 0.4);
fx("sfx/whoosh/soft-short", wd(3, "میلیون‌ها") - 0.05, 0.3);
fx("sfx/whoosh/double", S(4) - 0.1, 0.3);
[0, 1, 2, 3].forEach((i) => fx("sfx/pop/pop-" + (i + 1), wd(4, "کل") - 0.1 + i * 0.14, 0.25));
fx("sfx/glitch/short-1", wd(4, "اینقدر") - 0.1, 0.35);
fx("sfx/impact/punchy-short", wd(4, "دیوونه"), 0.45);
// trailer + record
fx("sfx/whoosh/soft-short", S(5) - 0.08, 0.3);
fx("sfx/ui/click-crisp", wd(5, "منتشر"), 0.4);
fx("sfx/mechanical/classic-ticks", wd(5, "بیست") - 0.1, 0.25);
fx("sfx/money/cash-register", wd(5, "بازدید"), 0.3);
fx("sfx/impact/glass-shimmer", wd(6, "رکورد"), 0.4);
// city
fx("sfx/whoosh/fast-bright", S(7) - 0.06, 0.3);
fx("sfx/pop/pop-4", wd(7, "وایس‌سیتی"), 0.35);
fx("sfx/whoosh/swish-thin", wd(7, "ساحل‌های") - 0.06, 0.28);
fx("sfx/whoosh/swish-thin", wd(7, "جزئیات") - 0.06, 0.28);
fx("sfx/riser/noise-2s", wd(8, "واقعی") - 0.05, 0.22);
fx("sfx/camera/shutter-dslr", wd(8, "تماشا"), 0.3);
fx("sfx/glitch/static", S(9) - 0.06, 0.3);
fx("sfx/impact/punchy-short", wd(9, "نیست") + 0.1, 0.4);
// story
fx("sfx/whoosh/soft-short", wd(10, "جیسون") - 0.15, 0.3);
fx("sfx/whoosh/soft-short", wd(10, "لوسیا") - 0.15, 0.3);
[0, 1, 2, 3, 4].forEach((i) => fx("sfx/ui/click-tonal", wd(10, "داستان") - 0.1 + i * 0.18, 0.3));
fx("sfx/break/glass-breaking-02", S(11) + 0.1, 0.4);
fx("sfx/whoosh/double", wd(11, "تعقیب") - 0.06, 0.35);
fx("sfx/break/glass-breaking-05", wd(11, "خیانت") + 0.05, 0.4);
fx("sfx/impact/soft-thump", wd(11, "راز"), 0.35);
// details
fx("sfx/whoosh/stutter", S(12) - 0.06, 0.3);
[wd(12, "فریم"), wd(12, "فریم", 2), wd(12, "بررسی"), wd(12, "کردن")].forEach((t) => fx("sfx/ui/tick-004", t, 0.4));
fx("sfx/camera/shutter-film", wd(12, "کردن"), 0.45);
fx("sfx/camera/shutter-film", wd(12, "پیدا") - 0.05, 0.45);
fx("sfx/riser/downlifter-dark", S(13) - 0.06, 0.3);
// ending
fx("sfx/impact/cinematic-heavy", wd(14, "متحول"), 0.45);
fx("sfx/glitch/short-3", wd(14, "یا") - 0.06, 0.3);
fx("sfx/impact/punchy-short", wd(14, "هیجان"), 0.4);
fx("sfx/paper/book-flip-1", S(15) - 0.06, 0.4);
fx("sfx/impact/punchy-short", wd(15, "قضاوت"), 0.45);
fx("sfx/pop/pop-1", S(16), 0.35);
fx("sfx/ui/click-crisp", wd(17, "انقلابه"), 0.4);
fx("sfx/ui/click-crisp", wd(17, "هایپ"), 0.4);
fx("sfx/impact/subdrop-punch", LEN - 1.3, 0.35);
const music = [{ file: "public/audio/music/synthwave/50-over-the-speed-limit.mp3", at: 0, from: 0.2, to: 0.2 + LEN, fadeIn: 0.05, fadeOut: 2.2, gain: 0.11 }];
fs.mkdirSync("videos/48", { recursive: true });
fs.writeFileSync("videos/48/mix.json", JSON.stringify({ length: LEN, voice: "public/v48/vo.wav", music, sfx }, null, 1));
console.log("videos/48/mix.json", sfx.length, "sfx", LEN, "s");
