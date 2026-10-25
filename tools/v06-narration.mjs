// v06 narration: script tokens "tts|display" (tts = phonetic Persian for the voice, display = caption text).
// 1) node --env-file=.env tools/v06-narration.mjs tts   → writes narration text, calls ElevenLabs (Charlie, v3)
// 2) node tools/v06-narration.mjs words                 → src/v06/words.json (word timings mapped to display words)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = new URL("../videos/06-toilet-paroon/voice/", import.meta.url);
const OUT = new URL("../src/v06/", import.meta.url);
const VOICE = "nPczCjzI2devNBz1zQrb"; // Brian

export const SENTENCES = [
  "اگه سیزده‌به‌در وسط ترافیک جاده‌ی چالوس گیر کردی و دیگه طاقت نداری،",
  "و صف دستشویی بین‌راهی هم تا کرج رسیده،",
  "فقط اَپ|اپ «توالت‌پرون» رو باز کن و یه توالت درخواست کن.",
  "یه پهپاد ماشینت رو پیدا می‌کنه و با بلندگو از بقیه می‌خواد یه کم جا باز کنن.",
  "بعد با دوربین هوش مصنوعی از لای سیم‌های برق رد می‌شه و درست کنار ماشینت فرود میاد.",
  "کد کیوآر|QR رو اسکن می‌کنی و می‌ری سراغ کارت.",
  "حالا اگه یکی از ماشین بغلی زیادی سرک بکشه، توالت شلنگش رو درمیاره و مستقیم می‌گیره تو صورتش.",
  "واسه همین همه سرشون تو گوشیشونه.",
  "کارت که تموم شد، توالت درش رو پلمب می‌کنه، خسارت رو وزن می‌کنه و کرایه رو از کارتت کم می‌کنه.",
  "بعد پرواز می‌کنه که بره کارواش.",
  "آخرش اَپ|اپ ازت می‌خواد به سفرت امتیاز بدی.",
  "ولی خب، توالت هم به تو امتیاز داده: دو ستاره.",
];

const toks = (s) => s.split(/\s+/).map((t) => { const [a, b] = t.split("|"); return { tts: a, show: b ?? a }; });
// display word keeps the tts word's trailing punctuation
const punct = (w) => (w.match(/[،.:!؟»]+$/) ?? [""])[0];

const mode = process.argv[2];
if (mode === "tts") {
  const text = SENTENCES.map((s) => toks(s).map((t) => t.tts).join(" ")).join(" ");
  fs.writeFileSync(new URL("narration.txt", DIR), text);
  console.log("chars:", text.length);
  execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-tts.mjs", VOICE, new URL("narration.txt", DIR).pathname, new URL("narration.mp3", DIR).pathname, "eleven_v3"].map(decodeURIComponent), { stdio: "inherit" });
} else if (mode === "words") {
  const { alignment: a } = JSON.parse(fs.readFileSync(new URL("narration.json", DIR)));
  // spoken words from character alignment
  const spoken = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) spoken.push(cur); cur = null; return; }
    if (!cur) cur = { text: "", s: a.character_start_times_seconds[i], e: 0 };
    cur.text += ch; cur.e = a.character_end_times_seconds[i];
  });
  if (cur) spoken.push(cur);
  const words = [];
  SENTENCES.forEach((s, si) => toks(s).forEach((t, wi) => {
    const show = t.show === t.tts ? t.tts : t.show + punct(t.tts);
    words.push({ si, wi, tts: t.tts, w: show });
  }));
  if (words.length !== spoken.length) console.log("WARN count", words.length, "spoken", spoken.length);
  words.forEach((w, i) => { const sp = spoken[i]; if (sp.text !== w.tts) console.log("mismatch", i, sp.text, "≠", w.tts); w.s = +sp.s.toFixed(3); w.e = +sp.e.toFixed(3); delete w.tts; });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(new URL("words.json", OUT), JSON.stringify(words));
  const dur = a.character_end_times_seconds.at(-1);
  console.log("words:", words.length, "dur:", dur.toFixed(2));
  SENTENCES.forEach((_, si) => { const ws = words.filter((w) => w.si === si); console.log(si + 1, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2)); });
}
