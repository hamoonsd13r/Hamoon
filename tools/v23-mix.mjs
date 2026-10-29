// v23 mix plan → out/v23-mix.json (times from src/v23/words.json, same needles as src/v23/times.ts), then: node tools/mix.mjs out/v23-mix.json
import fs from "node:fs";
const W = JSON.parse(fs.readFileSync("src/v23/words.json", "utf8"));
const w = (si, n, nth = 0) => { const h = W.filter((x) => x.si === si && x.w.includes(n)); return (h[nth] ?? h[0]).s; };
const S = (si) => W.find((x) => x.si === si).s;
const E = (si) => W.filter((x) => x.si === si).at(-1).e;
const END = W.at(-1).e + 1.5;
const L = (n) => ({ file: `public/sfx-lib/${n}.wav`, peak: 0.02 });
const cue = (at, n, v) => { const vol = +(v * 0.45).toFixed(3); return n.includes("/") ? { id: n, at, vol } : { ...L(n), at, vol }; };
const T = {
  bill: w(0, "حساب"), remember: w(0, "یادش"), wallet: w(0, "کیف"), car: w(0, "ماشین"), months: w(1, "ماهه"), says: w(1, "می‌گه"), night: w(1, "«شب"), c2c: w(1, "کارت", 1),
  name: w(2, "دُنگ‌گیر"), invoice: w(2, "فاکتور"), scan: w(2, "اسکن"), ai: w(3, "هوش"), who: w(3, "کی"), slice: w(3, "تیکه"), test: w(3, "«تست"), testEnd: E(3),
  reminder: w(4, "یادآوری"), polite: w(4, "مؤدبانه"), send: w(4, "می‌فرسته"), seen: w(5, "سین"), noAnswer: w(5, "نداد"), photo: w(5, "عکس"), change: w(5, "عوض"), debtor: w(5, "بدهکارم"),
  call: w(6, "زنگ"), noCharge: w(7, "شارژ"), last: w(7, "قرون"), take: w(7, "برمی‌داره"), fine: w(7, "جریمه"), late: w(7, "دیرکرد"),
  rate: w(8, "ستاره"), moment: w(9, "لحظه"), removed: w(9, "ریمو"), sent: w(10, "فرستاد"), punch: w(10, "«دُنگ"), curse: w(10, "مادرجنده"),
};
const sfx = [
  cue(T.bill + 0.1, "paper", 0.4), cue(T.remember, "pop", 0.4), cue(T.wallet - 0.1, "sfx/misc/spring-04", 0.4), cue(T.car + 0.2, "sweep", 0.3),
  cue(T.months - 0.1, "stamp", 0.4), cue(T.says + 0.1, "sfx/notification/notify-message", 0.35), cue(T.night + 0.1, "sfx/notification/notify-message", 0.35), cue(T.c2c + 0.1, "sfx/notification/notify-message", 0.35),
  cue(T.name, "sfx/transition/power-up", 0.4), cue(T.invoice, "sfx/camera/shutter-dslr", 0.4), cue(T.scan, "scan", 0.35), cue(T.scan + 0.33, "match", 0.4),
  ...[0, 1, 2, 3].map((i) => cue(T.who + i * 0.17, "blip", 0.3)), cue(T.slice - 0.1, "pop", 0.4), cue(T.test, "error", 0.4), cue(T.testEnd, "sfx/money/cash-register", 0.4),
  cue(T.reminder, "sfx/notification/notify-ding", 0.4), cue(T.polite, "chime", 0.3),
  cue(T.seen + 0.07, "click", 0.4), cue(T.noAnswer + 0.2, "error", 0.35), cue(T.change + 0.33, "sfx/camera/shutter-dslr", 0.45), cue(T.change + 0.4, "glitch", 0.3),
  cue(T.call - 0.3, "sfx/notification/timer-done", 0.3), cue(T.call + 0.4, "ping", 0.3), cue(T.call + 0.9, "sfx/impact/punch-medium-001", 0.4),
  cue(T.noCharge, "error", 0.35), cue(T.take, "sfx/money/coins-handful", 0.5), cue(T.take + 0.4, "sfx/money/coin-drop", 0.35), cue(T.last + 0.15, "stamp", 0.45), cue(T.fine, "error", 0.35), cue(T.late + 0.2, "sfx/money/cash-register", 0.5), cue(T.late + 0.4, "stamp", 0.4),
  cue(T.rate - 0.1, "blip", 0.4), cue(T.rate + 0.2, "thud", 0.35),
  cue(T.moment, "ticks", 0.3), cue(T.removed, "error", 0.5), cue(T.removed + 0.1, "sfx/pop/bubbles-cluster", 0.3),
  cue(T.sent, "type", 0.35), cue(T.punch - 0.05, "whoosh", 0.4), cue(T.curse - 0.07, "sfx/impact/subdrop-punch", 0.6), cue(T.curse + 0.47, "sfx/notification/notify-message", 0.45),
  // ledger printing
  ...[T.bill + 0.3, T.car + 0.3, T.c2c, T.testEnd, T.send, T.debtor, T.call + 0.2, T.late, T.late + 0.6].map((t) => cue(t + 0.05, "print", 0.22)),
  // scene cuts
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((si) => cue(S(si) - 0.05, "whoosh", 0.16)),
];
fs.writeFileSync("out/v23-mix.json", JSON.stringify({
  length: +END.toFixed(2), voice: "public/v23/narration.wav",
  music: [{ file: "public/audio/music/funk/make-money.mp3", at: 0, from: 0, to: +END.toFixed(2), fadeIn: 0.2, fadeOut: 2.5, gain: 0.3 }],
  sfx,
}, null, 1));
console.log("sfx", sfx.length, "len", END.toFixed(2));
