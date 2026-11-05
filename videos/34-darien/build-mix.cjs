// V34 mix plan: every effect sits on a visible event; times come from the narration words (same cues as Video.tsx)
const fs = require("fs");
const vo = JSON.parse(fs.readFileSync("src/v34/vo.json", "utf8"));
const norm = (s) => s.replace(/[ً-ْ‌.,،؛؟?!:«»]/g, "");
const wd = (line, w, nth = 0) => vo.words.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)))[nth].s;
const T = {
  jade: wd(1, "جاده"), hame: wd(2, "همه‌ش"), darien: wd(2, "داری"), khatar: wd(2, "خطرناک"), ke: wd(2, "که"), tul: wd(2, "طولانی"), nesfe: wd(2, "نصفه"),
  va: wd(4, "و"), jun: wd(4, "جونت"), vali: wd(5, "ولی"), majara: wd(6, "ماجرا"), km: wd(6, "کیلومتر"), jangal: wd(6, "جنگل"), batlagh: wd(6, "باتلاق"),
  kuh: wd(6, "کوه"), dorost: wd(6, "درست"), panama: wd(6, "پاناما"), colombia: wd(6, "کلمبیا"), zamin7: wd(7, "زمین"), baroon: wd(7, "بارون"), sakhtan: wd(7, "ساختن"),
  geroon: wd(7, "گرون"), pan: wd(8, "پان"), shekast: wd(8, "شکست"), shekaf9: wd(9, "شکاف"), mohajer: wd(9, "مهاجر"), jangalha: wd(9, "جنگل"),
  nemi: wd(10, "نمی"), heyvun: wd(11, "حیوون"), nabud: wd(12, "نبود"), khalaf: wd(12, "خلافکار"), ghachagh: wd(12, "قاچاقچی"), goruh: wd(12, "گروه"),
  ke13: wd(13, "که"), adam: wd(13, "آدم"), bala: wd(13, "بالا"),
};
const PAPER0 = T.sakhtan - 0.05, PAPER1 = T.shekaf9 - 0.05, END0 = T.ke13 - 0.05;
const S = (id, at, vol) => ({ id: "sfx/" + id, at: +at.toFixed(3), vol: +(vol * 0.58).toFixed(3) });
const sfx = [
  S("impact/punchy-short", T.jade + 0.2, 0.5),
  S("whoosh/soft-medium", T.hame + 0.4, 0.45),
  S("pop/pop-1", T.darien, 0.4),
  S("impact/subdrop-short", T.khatar + 0.15, 0.55),
  S("whoosh/soft-medium", T.ke + 0.45, 0.4),
  S("pop/pop-2", T.tul, 0.35),
  S("impact/soft-thump", T.nesfe, 0.45),
  S("whoosh/soft-medium", T.va + 0.5, 0.4),
  S("impact/subdrop-short", T.jun, 0.45),
  S("body/heartbeat", T.jun + 0.5, 0.45),
  S("body/heartbeat", T.vali + 0.3, 0.45),
  S("whoosh/double", T.majara + 0.35, 0.35),
  S("pop/pop-3", T.km - 0.2, 0.35),
  S("whoosh/soft-medium", T.jangal + 0.45, 0.4),
  S("whoosh/fast-bright", T.batlagh, 0.4),
  S("whoosh/fast-bright", T.kuh, 0.4),
  S("whoosh/double", T.dorost + 0.35, 0.35),
  S("pop/pop-4", T.panama, 0.35),
  S("pop/pop-1", T.colombia, 0.35),
  S("ambience/thunder-01", T.baroon + 0.25, 0.5),
  S("impact/distant-boom", T.baroon + 0.95, 0.45),
  S("impact/glass-shimmer", PAPER0 - 0.05, 0.3),
  S("paper/slide", PAPER0 + 0.15, 0.45),
  S("money/coin-drop", T.geroon, 0.35),
  S("pop/pop-2", T.pan - 0.1, 0.3),
  S("impact/classic-stamp", T.shekast + 0.14, 0.65),
  S("impact/soft-thump", T.shekast + 0.14, 0.5),
  S("whoosh/fast-bright", PAPER1 + 0.05, 0.4),
  S("pop/pop-3", PAPER1 + 0.15, 0.3),
  S("whoosh/swish-thin", T.jangalha + 0.4, 0.4),
  S("impact/soft-thump", T.nemi, 0.4),
  ...[0, 1, 2, 3].map((i) => S("pop/pop-" + (4 - (i % 4)), T.heyvun - 0.1 + i * 0.13 + 0.23, 0.3)),
  S("impact/punchy-short", T.nabud + 0.25, 0.45),
  S("body/heartbeat-fast", T.khalaf, 0.4),
  S("impact/subdrop-short", T.goruh + 0.1, 0.4),
  S("impact/subdrop-long", T.adam + 0.1, 0.5),
  S("body/heartbeat-fast", T.bala, 0.45),
];
const mix = {
  length: +vo.total.toFixed(3),
  voice: "public/v34/vo.wav",
  music: [{ file: "public/audio/music/dark/game-over-1.mp3", at: 0, from: 0, to: +vo.total.toFixed(3), fadeIn: 0.1, fadeOut: 2.2, gain: 0.245 }],
  sfx,
  beds: [{ id: "sfx/ambience/rain", from: +(T.baroon - 0.15).toFixed(3), to: +PAPER0.toFixed(3), vol: 0.35 }],
};
fs.writeFileSync("videos/34-darien/mix.json", JSON.stringify(mix, null, 1));
console.log("sfx events", sfx.length);
