// v08 mix plan → out/v08-mix.json (times from src/v08/words.json, same needles as src/v08/times.ts), then: node tools/mix.mjs out/v08-mix.json --out public/v08/mix.wav
import fs from "node:fs";
const W = JSON.parse(fs.readFileSync("src/v08/words.json", "utf8"));
const w = (si, n, nth = 0) => { const h = W.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => W.find((x) => x.si === si).s;
const END = W.at(-1).e + 1.6;
const D8 = "videos/08-mehmoon-paroon/sfx/";
const cue = (at, n, v) => {
  const vol = +(v * 0.7).toFixed(3);
  if (n.startsWith("own:")) return { file: D8 + n.slice(4) + "-1.mp3", at: +at.toFixed(3), vol: +(vol * 0.3).toFixed(3), peak: 0.05 };
  return n.includes("/") ? { id: n, at: +at.toFixed(3), vol } : { file: `public/sfx-lib/${n}.wav`, peak: 0.02, at: +at.toFixed(3), vol };
};
const T = {
  twelve: w(0, "دوازده"), haft: w(0, "هفت"), dovom: w(0, "دوم"), rok: w(1, "رک"), chon: w(1, "چون"), aberoo: w(1, "آبروت"),
  name: w(2, "مهمون‌پرون"), baz: w(2, "باز"), bye: w(2, "خداحافظی"), bezan: w(2, "بزن"), yavash: w(3, "یواش"), dir: w(3, "دیروقته"),
  cooler: w(4, "کولر"), ghotb: w(4, "قطب"), shomal: w(4, "شمال"), yakh: w(4, "یخ‌زده"), serv: w(4, "سرو"),
  roshan: w(5, "روشن"), akhbar: w(5, "اخبار"), pakhsh: w(5, "پخش"), speaker: w(6, "بلندگوی"), khob: w(6, "خب"), baad: w(6, "بعد"),
  pa: w(7, "پا"), faghat: w(7, "فقط"), bye2: w(7, "خداحافظی"), saat: w(8, "ساعت"), khab: w(8, "خوابت"), notif: w(8, "نوتیف"),
  back: w(9, "برگشتن"), key: w(9, "کلید"), sobhoone: w(9, "صبحونه"), hastan: w(9, "هستن"),
};
const sfx = [
  cue(0.1, "ticks", 0.3), cue(T.twelve, "pop", 0.3), cue(T.haft, "error", 0.45), cue(T.dovom - 0.1, "own:crunch", 0.9), cue(T.dovom + 0.05, "chime", 0.35),
  ...Array.from({ length: 10 }, (_, i) => cue(T.rok + 0.05 + i * 0.07, "sfx/ui/key-mech", 0.35)),
  cue(T.chon, "sfx/notification/error-buzz", 0.5), ...Array.from({ length: 6 }, (_, i) => cue(T.chon + 0.1 + i * 0.05, "sfx/ui/key-mech", 0.28)),
  ...Array.from({ length: 7 }, (_, i) => cue(T.aberoo - 0.2 + i * 0.07, "sfx/ui/key-mech", 0.3)), cue(T.aberoo + 0.25, "chime", 0.35),
  cue(T.name - 0.05, "sfx/transition/power-up", 0.4), cue(T.baz + 0.1, "sweep", 0.3), cue(T.bye, "click", 0.45), cue(T.bezan + 0.12, "click", 0.55), cue(T.bezan + 0.2, "match", 0.4),
  cue(T.yavash, "sfx/ui/toggle-off", 0.5), cue(T.dir, "sfx/ui/toggle-off", 0.5), cue(T.dir + 0.3, "pop", 0.25),
  cue(T.cooler, "servo", 0.4), cue(T.shomal + 0.1, "own:chatter", 0.9), cue(T.yakh, "pop", 0.35), cue(T.serv + 0.35, "notif", 0.3),
  cue(T.roshan, "sfx/glitch/static", 0.45), cue(T.akhbar - 0.05, "own:newsting", 0.6), cue(T.pakhsh + 0.05, "pop", 0.35),
  cue(T.speaker, "notif", 0.35), cue(T.khob - 0.05, "riser", 0.25), cue(T.baad + 0.25, "stamp", 0.55), cue(T.baad + 0.3, "sfx/misc/spring-09", 0.35),
  cue(T.pa, "whoosh", 0.3), cue(T.faghat, "sfx/door/door-05", 0.5),
  cue(T.saat - 0.1, "whoosh", 0.18), cue(T.saat + 0.5, "sfx/body/snore", 0.35), cue(T.khab + 0.2, "sfx/body/snore", 0.35), cue(T.notif, "sfx/notification/notify-message", 0.7), cue(T.notif + 0.15, "error", 0.4),
  cue(T.back - 0.1, "sfx/door/door-02-2", 0.6), cue(T.key, "pin", 0.4), cue(T.sobhoone - 0.1, "sweep", 0.3),
  ...[0, 1, 2, 3, 4].map((i) => cue(T.sobhoone + (4 + i * 5) / 30 + 0.05, "print", 0.22)),
  cue(T.hastan + 0.3, "stamp", 0.6), cue(T.hastan + 0.35, "sfx/notification/timer-done", 0.3),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((si) => cue(S(si) - 0.05, "whoosh", 0.15)),
];
fs.writeFileSync("out/v08-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v08/narration.wav",
  music: [{ file: "public/audio/music/upbeat/bouncing.mp3", at: 0, from: 0, to: +END.toFixed(2), fadeIn: 0.1, fadeOut: 2, gain: 0.3 }],
  beds: [
    { id: "sfx/ambience/wind", from: +T.cooler.toFixed(2), to: +S(5).toFixed(2), vol: 0.25 },
    { file: D8 + "murmur-1.mp3", from: +T.faghat.toFixed(2), to: +S(8).toFixed(2), vol: 0.06 },
  ],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
