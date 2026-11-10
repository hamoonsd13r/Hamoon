// V44 · user's own narration (ElevenLabs "Grandpa"), cut from 160 s to a ~68 s reel: keep only the word ranges
// below (the user agreed to the cut), shorten the pauses, tempo 1.12, and write vo.json with the exact time map.
// Usage: node tools/v44-voice.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = "uploads/v44/narration.mp3", STT = "videos/44/stt.json", OUT_WAV = "public/v44/vo.wav", OUT_JSON = "src/v44/vo.json";
const TEMPO = 1.12;
// word index ranges (Scribe words) — see videos/44/direction.md for the full text
const KEEP = [[0, 7], [8, 15], [16, 22], [32, 37], [38, 49], [50, 56], [57, 66], [77, 80], [91, 97], [133, 141], [142, 151], [156, 163], [164, 175], [176, 179], [180, 182], [187, 196], [201, 212], [294, 305], [306, 324]];
const DRAMA = new Set([50, 294, 201]); // a longer breath before these ranges
const words = JSON.parse(fs.readFileSync(STT, "utf8")).words.filter((x) => x.type === "word");
const pieces = []; // {a, b, pad} in source seconds + silence after (before tempo)
const out = [];
let line = 1;
KEEP.forEach(([i0, i1], k) => {
  const ws = words.slice(i0, i1 + 1);
  const prevEnd = i0 > 0 ? words[i0 - 1].end : 0, nextStart = words[i1 + 1]?.start ?? ws.at(-1).end + 0.5;
  const pre = Math.min(0.08, (ws[0].start - prevEnd) / 2), post = Math.min(0.14, (nextStart - ws.at(-1).end) / 2);
  // inside a range: shrink long pauses to 0.26 s
  let a = ws[0].start - pre;
  for (let j = 1; j < ws.length; j++) {
    const g = ws[j].start - ws[j - 1].end;
    if (g > 0.3) { pieces.push({ a, b: ws[j - 1].end + 0.1, pad: 0 }); a = ws[j].start - 0.16; }
  }
  const last = ws.at(-1).text, endsLine = /[.؟?]$/.test(last) || k === KEEP.length - 1;
  const nextK = KEEP[k + 1];
  const gap = !nextK ? 0.5 : DRAMA.has(nextK[0]) ? 0.55 : endsLine ? 0.36 : 0.2;
  pieces.push({ a, b: ws.at(-1).end + post, pad: Math.max(0, gap - post - (nextK ? Math.min(0.08, (words[nextK[0]].start - words[nextK[0] - 1].end) / 2) : 0)) });
  ws.forEach((w) => out.push({ src: w, line }));
  if (endsLine) line++;
});
// source → output time
let acc = 0;
const segMap = pieces.map((p) => { const m = { ...p, o: acc }; acc += p.b - p.a + p.pad; return m; });
const map = (t) => { for (const p of segMap) if (t >= p.a - 1e-6 && t <= p.b + 1e-6) return (p.o + (t - p.a)) / TEMPO; throw new Error("time not kept " + t); };
const parts = segMap.map((p, i) => `[0:a]atrim=${p.a.toFixed(3)}:${p.b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st=${(p.b - p.a - 0.015).toFixed(3)}:d=0.015,apad=pad_dur=${p.pad.toFixed(3)}[p${i}]`).join(";");
const cat = segMap.map((_, i) => `[p${i}]`).join("") + `concat=n=${segMap.length}:v=0:a=1,atempo=${TEMPO}[out]`;
fs.mkdirSync("public/v44", { recursive: true }); fs.mkdirSync("src/v44", { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", SRC, "-filter_complex", parts + ";" + cat, "-map", "[out]", "-ar", "48000", "-ac", "1", OUT_WAV]);
const real = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", OUT_WAV]).toString();
const kk = real / (acc / TEMPO);
const vw = out.map(({ src, line }) => ({ w: src.text, s: +(map(src.start) * kk).toFixed(3), e: +(map(src.end) * kk).toFixed(3), line }));
const segs = [];
for (let n = 1; n < line; n++) { const ws = vw.filter((x) => x.line === n); segs.push({ n, sp: "A", start: ws[0].s, end: ws.at(-1).e }); }
fs.writeFileSync(OUT_JSON, JSON.stringify({ total: +real.toFixed(3), segs, words: vw }));
console.log("total", real.toFixed(2), "s · lines", segs.length);
segs.forEach((s) => console.log(s.n, s.start.toFixed(2), "→", s.end.toFixed(2), vw.filter((x) => x.line === s.n).map((x) => x.w).join(" ")));
