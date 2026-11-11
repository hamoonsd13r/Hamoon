// V46 · user's own narration (ElevenLabs "Mark"): shorten the long silences, tempo 1.10, write vo.json with the exact
// time map (no second STT). Latin words from Scribe are written back in Persian for the captions.
// Usage: node tools/v46-voice.mjs   (input uploads/v46/narration.mp3 + videos/46/stt.json)
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = "uploads/v46/narration.mp3", STT = "videos/46/stt.json";
const OUT_WAV = "public/v46/vo.wav", OUT_JSON = "src/v46/vo.json";
const TEMPO = 1.1, LEAD = 0.1;
const FIX = { "پablo": "پابلو", "پablo.": "پابلو.", "Escobar": "اسکوبار", "Escobar.": "اسکوبار.", Emilio: "امیلیو", Gaviria: "گاویریا", "مدئین": "مدلین", "علل": "علی‌البدل", La: "لا", "Catedral،": "کاتدرال،", luis: "لوئیس", carlos: "کارلوس", "galán": "گالان", Avianca: "آویانکا", "بونیا،": "بونیا،", "7:16": "۷:۱۶" };
const raw = JSON.parse(fs.readFileSync(STT, "utf8")).words.filter((x) => x.type === "word");
// «علل بدل» → one word
const words = [];
for (let i = 0; i < raw.length; i++) {
  const x = { ...raw[i] };
  if (x.text === "علل" && raw[i + 1]?.text === "بدل") { x.end = raw[i + 1].end; i++; }
  words.push(x);
}
let line = 1;
const W = words.map((x) => {
  const o = { w: FIX[x.text] ?? x.text, s0: x.start, e0: x.end, line };
  if (/[.؟?!]$/.test(x.text)) line++;
  return o;
});
const keep = [];
let a = Math.max(0, W[0].s0 - LEAD);
for (let i = 1; i < W.length; i++) {
  const g = W[i].s0 - W[i - 1].e0;
  const newLine = W[i].line !== W[i - 1].line;
  const target = newLine ? 0.5 : 0.3;
  if (g > target) {
    const tail = Math.min(0.14, target / 2);
    keep.push([a, W[i - 1].e0 + tail]);
    a = W[i].s0 - (target - tail);
  }
}
const END = W.at(-1).e0 + 0.6;
keep.push([a, END]);
const map = (t) => { let acc = 0; for (const [x, y] of keep) { if (t <= y) return (acc + Math.max(0, t - x)) / TEMPO; acc += y - x; } return acc / TEMPO; };
const parts = keep.map(([x, y], i) => `[0:a]atrim=${x.toFixed(3)}:${y.toFixed(3)},asetpts=PTS-STARTPTS[p${i}]`).join(";");
const cat = keep.map((_, i) => `[p${i}]`).join("") + `concat=n=${keep.length}:v=0:a=1,atempo=${TEMPO}[out]`;
fs.mkdirSync("public/v46", { recursive: true }); fs.mkdirSync("src/v46", { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", SRC, "-filter_complex", parts + ";" + cat, "-map", "[out]", "-ar", "48000", "-ac", "1", OUT_WAV]);
const real = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT_WAV]).toString();
const k = real / map(END);
const vw = W.map((x) => ({ w: x.w, s: +(map(x.s0) * k).toFixed(3), e: +(map(x.e0) * k).toFixed(3), line: x.line }));
const segs = [];
for (let n = 1; n <= W.at(-1).line; n++) { const ws = vw.filter((x) => x.line === n); segs.push({ n, sp: "A", start: ws[0].s, end: ws.at(-1).e }); }
fs.writeFileSync(OUT_JSON, JSON.stringify({ total: +real.toFixed(3), segs, words: vw }));
console.log("total", real.toFixed(2), "s · lines", segs.length);
segs.forEach((s) => console.log(s.n, s.start.toFixed(1), "→", s.end.toFixed(1), vw.filter((x) => x.line === s.n).map((x) => x.w).join(" ")));
