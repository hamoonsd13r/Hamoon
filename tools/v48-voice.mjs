// V48 · user's voice (ElevenLabs "Mark", uploads/v48-voice-mark.mp3) → shorter pauses + tempo → public/v48/vo.wav
// and src/v48/vo.json (words with line numbers, from the Scribe words in videos/48/stt-raw.json).
// Usage: node tools/v48-voice.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const TEMPO = 1.15, SRC = "uploads/v48-voice-mark.mp3";
const raw = JSON.parse(fs.readFileSync("videos/48/stt-raw.json", "utf8")).words.filter((w) => w.type === "word");
// lines: a sentence ends on . ؟ !
let line = 1;
const W = raw.map((w) => { const o = { w: w.text, s: w.start, e: w.end, line }; if (/[.؟?!]$/.test(w.text)) line++; return o; });
// keep segments: cut the middle of every pause longer than its keep length
const segs = []; let a = Math.max(0, W[0].s - 0.12);
const removed = []; // [at (orig), amount]
for (let i = 1; i < W.length; i++) {
  const g = W[i].s - W[i - 1].e, end = W[i].line !== W[i - 1].line;
  const keep = end ? 0.3 : 0.2;
  if (g > keep + 0.05) {
    const cut0 = W[i - 1].e + keep / 2, cut1 = W[i].s - keep / 2;
    segs.push([a, cut0]); removed.push([cut1, cut1 - cut0]); a = cut1;
  }
}
const lastEnd = W.at(-1).e + 0.35; segs.push([a, lastEnd]);
const head = Math.max(0, W[0].s - 0.12);
const map = (t) => { let r = head; for (const [at, d] of removed) if (t >= at) r += d; return (t - r) / TEMPO; };
const words = W.map((x) => ({ w: x.w.replace(/GTA-6/g, "GTA 6"), s: +map(x.s).toFixed(3), e: +map(x.e).toFixed(3), line: x.line }));
const total = +((lastEnd - head - removed.reduce((p, [, d]) => p + d, 0)) / TEMPO).toFixed(3);
const nL = line - 1, out = [];
for (let n = 1; n <= nL; n++) { const ws = words.filter((x) => x.line === n); out.push({ n, start: ws[0].s, end: ws.at(-1).e }); }
fs.writeFileSync("src/v48/vo.json", JSON.stringify({ total, segs: out, words }));
const f = segs.map(([s, e], i) => `[0:a]atrim=${s.toFixed(3)}:${e.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`).join(";") +
  ";" + segs.map((_, i) => `[a${i}]`).join("") + `concat=n=${segs.length}:v=0:a=1,atempo=${TEMPO},aresample=48000[o]`;
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", SRC, "-filter_complex", f, "-map", "[o]", "-ac", "1", "public/v48/vo.wav"]);
console.log(nL, "lines ·", words.length, "words · total", total, "s");
out.forEach((s) => console.log(s.n, s.start.toFixed(2), s.end.toFixed(2), words.filter((x) => x.line === s.n).map((x) => x.w).join(" ").slice(0, 60)));
