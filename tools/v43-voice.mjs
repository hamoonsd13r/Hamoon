// V43 · user's own narration (ElevenLabs, voice "Grandpa"): shorten the silences, tempo 1.10, and write vo.json
// with the exact time map (no second STT). Input: uploads/v43/narration.mp3 + videos/43/stt.json (Scribe words).
// Usage: node tools/v43-voice.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = "uploads/v43/narration.mp3", STT = "videos/43/stt.json";
const OUT_WAV = "public/v43/vo.wav", OUT_JSON = "src/v43/vo.json";
const TEMPO = 1.1;
const LEAD = 0.12; // silence kept before the first word
const words = JSON.parse(fs.readFileSync(STT, "utf8")).words.filter((x) => x.type === "word");

// lines = sentences (end on . or ؟)
let line = 1;
const W = words.map((x) => {
  const o = { w: x.text, s0: x.start, e0: x.end, line };
  if (/[.؟?!]$/.test(x.text)) line++;
  return o;
});
// gap targets (seconds, before tempo)
const DRAMA = new Set(["13", "اما", "چطور"]); // a breath before the turning lines
const keep = []; // [a,b] intervals of the source to keep
let a = Math.max(0, W[0].s0 - LEAD);
for (let i = 1; i < W.length; i++) {
  const g = W[i].s0 - W[i - 1].e0;
  const newLine = W[i].line !== W[i - 1].line;
  const target = newLine ? (DRAMA.has(W[i].w) ? 0.62 : 0.4) : 0.26;
  if (g > target) {
    const tail = Math.min(0.14, target / 2); // keep the breath-out after the word
    keep.push([a, W[i - 1].e0 + tail]);
    a = W[i].s0 - (target - tail);
  }
}
const END = W.at(-1).e0 + 0.45;
keep.push([a, END]);

// source time → output time
const map = (t) => {
  let acc = 0;
  for (const [x, y] of keep) {
    if (t <= y) return (acc + Math.max(0, t - x)) / TEMPO;
    acc += y - x;
  }
  return acc / TEMPO;
};
const parts = keep.map(([x, y], i) => `[0:a]atrim=${x.toFixed(3)}:${y.toFixed(3)},asetpts=PTS-STARTPTS[p${i}]`).join(";");
const cat = keep.map((_, i) => `[p${i}]`).join("") + `concat=n=${keep.length}:v=0:a=1,atempo=${TEMPO}[out]`;
fs.mkdirSync("public/v43", { recursive: true });
fs.mkdirSync("src/v43", { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", SRC, "-filter_complex", parts + ";" + cat, "-map", "[out]", "-ar", "48000", "-ac", "1", OUT_WAV]);

// atempo's real output length differs a hair from the math: scale to the measured file
const real = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT_WAV]).toString();
const k = real / map(END);
const vw = W.map((x) => ({ w: x.w, s: +(map(x.s0) * k).toFixed(3), e: +(map(x.e0) * k).toFixed(3), line: x.line }));
const segs = [];
for (let n = 1; n < line; n++) {
  const ws = vw.filter((x) => x.line === n);
  segs.push({ n, sp: "A", start: ws[0].s, end: ws.at(-1).e });
}
const total = +real.toFixed(3);
fs.writeFileSync(OUT_JSON, JSON.stringify({ total, segs, words: vw }));
console.log("total", total, "s · lines", segs.length);
segs.forEach((s) => console.log(s.n, s.start.toFixed(2), "→", s.end.toFixed(2), vw.filter((x) => x.line === s.n).map((x) => x.w).join(" ")));
