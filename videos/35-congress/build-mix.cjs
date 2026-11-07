// V35 mix plan: effects on visible events, timed from the narration words (same cues as src/v35/Video.tsx)
const fs = require("fs");
const vo = JSON.parse(fs.readFileSync("src/v35/vo.json", "utf8"));
const norm = (s) => s.replace(/[ً-ْ‌.,،؛؟?!:«»]/g, "");
const wd = (line, w, nth = 0) => vo.words.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)))[nth].s;
const S = (id, at, vol) => ({ id: "sfx/" + id, at: +at.toFixed(3), vol: +(vol * 0.45).toFixed(3) });
const cuts = [wd(6, "کنگره") - 0.06, wd(8, "برای") - 0.1, wd(10, "نیویورک") - 0.1, wd(10, "ولی") - 0.05, wd(11, "مردم") - 0.08, wd(14, "پس") - 0.08, wd(17, "اینجا") - 0.08, wd(18, "واسه") - 0.08];
const wh = ["whoosh/soft-medium", "whoosh/fast-bright", "whoosh/swish-thin", "whoosh/double"];
const sfx = [
  S("pop/pop-1", wd(1, "سوم"), 0.4),
  S("pop/pop-2", wd(1, "نماینده"), 0.3), S("pop/pop-3", wd(1, "سناتور"), 0.3), S("pop/pop-4", wd(1, "فرماندار"), 0.3),
  S("paper/slide", wd(2, "احتمال") + 0.7, 0.45),
  S("paper/page-flip", wd(2, "احتمال") + 1.15, 0.35),
  S("whoosh/soft-medium", wd(3, "مجلس") - 0.1, 0.35),
  S("whoosh/fast-bright", wd(4, "ببین") + 0.45, 0.45),
  S("pop/pop-1", wd(4, "کاخ"), 0.3),
  S("whoosh/swish-thin", wd(4, "واشنگتن") + 0.2, 0.35),
  S("pop/pop-2", wd(4, "رئیس") + 0.4, 0.3),
  S("whoosh/swish-thin", wd(5, "کاپیتول") - 0.4, 0.35),
  S("pop/pop-3", wd(5, "کاپیتول"), 0.3),
  ...cuts.map((t, i) => S(wh[i % 4], t + 0.05, 0.4)),
  S("ui/button-press", wd(6, "مجلس", 1), 0.4), S("ui/button-press", wd(6, "سنا"), 0.4),
  S("notification/confirm-001", wd(7, "معمولا"), 0.3),
  S("pop/pop-4", wd(8, "نیویورک"), 0.3), S("pop/pop-1", wd(8, "وایومینگ"), 0.3),
  S("impact/soft-thump", wd(10, "بیست"), 0.45), S("impact/soft-thump", wd(10, "یکی") - 0.1, 0.45),
  S("pop/pop-2", wd(11, "انتخاب") - 0.1, 0.3),
  S("pop/pop-3", wd(12, "دموکرات"), 0.3), S("pop/pop-4", wd(12, "جمهوری"), 0.3),
  S("notification/confirm-003", wd(13, "برنده"), 0.35),
  S("whoosh/fast-bright", wd(13, "کل") + 0.3, 0.4),
  S("impact/punchy-short", wd(13, "چهارصد") + 0.9, 0.4),
  S("impact/soft-thump", wd(16, "سنا") - 0.05, 0.45),
  S("ui/button-press", wd(17, "دو") , 0.35),
  S("whoosh/double", wd(17, "می‌رن") + 0.2, 0.35),
  S("paper/slide", wd(20, "تصویب"), 0.4),
  S("notification/confirm-001", wd(20, "هر"), 0.35), S("notification/confirm-003", wd(20, "مجلس"), 0.35), S("notification/confirm-001", wd(20, "امضای") + 0.3, 0.35),
  S("notification/error-buzz", wd(22, "کنگره"), 0.3), S("notification/error-buzz", wd(22, "رئیس") + 0.1, 0.3),
  S("whoosh/soft-medium", wd(23, "کرسی") - 0.1, 0.35),
];
const mix = {
  length: +vo.total.toFixed(3), voice: "public/v35/vo.wav",
  music: [{ file: "public/audio/music/lofi/autumn.mp3", at: 0, from: 0, to: +vo.total.toFixed(3), fadeIn: 0.1, fadeOut: 2.5, gain: 0.2 }],
  sfx,
};
fs.writeFileSync("videos/35-congress/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx", sfx.length);
