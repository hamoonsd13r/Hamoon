// v12 60-second cut audio: slice the full narration at the chosen scene windows, remap the effects that fall inside them,
// and write videos/12/audio60.json for doc-mix (all times numeric, voJson = the remapped src/v12/vo60.json).
//   node tools/v12-short-audio.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const W = JSON.parse(fs.readFileSync("src/v12/words.json", "utf8"));
const A = JSON.parse(fs.readFileSync("videos/12/audio.json", "utf8"));
const VO = JSON.parse(fs.readFileSync(A.voJson, "utf8"));
const SEL = [0, 1, 4, 6, 8, 9, 13];
const ss = (i) => W.find((w) => w.si === i).s, se = (i) => W.filter((w) => w.si === i).at(-1).e;
const TOTAL = se(13) + 0.35 + 2.6;
let at = 0;
const WIN = SEL.map((i) => { const a = i ? ss(i) - 0.1 : 0, b = i === 13 ? TOTAL : se(i) + 0.3; const w = { i, a, b, at }; at += b - a; return w; });
const map = (t) => { const w = WIN.find((w) => t >= w.a && t < w.b); return w ? w.at + (t - w.a) : null; };

const clean = (w) => w.replace(/[،.؛:«»!؟?…"]/g, "").replace(/[ً-ْ]/g, "");
function T(v) {
  if (typeof v === "number") return v;
  const m = /^(.*?)([+-]\d*\.?\d+)?$/.exec(String(v).trim());
  const base = m[1], off = m[2] ? +m[2] : 0;
  if (/^-?\d*\.?\d+$/.test(base)) return +base + off;
  if (base === "end") return TOTAL + off;
  const [kind, n, word, occ] = base.split(":");
  const seg = VO.segs.find((s) => s.n === +n);
  if (kind === "S") return seg.start + off;
  if (kind === "E") return seg.end + off;
  const ws = VO.words.filter((w) => w.line === +n);
  let hits = ws.filter((w) => clean(w.w) === clean(word));
  if (!hits.length) hits = ws.filter((w) => clean(w.w).startsWith(clean(word)));
  return hits[+(occ ?? 0)].s + off;
}

// narration: concat the windows
fs.mkdirSync("out/v12s", { recursive: true });
const parts = WIN.map((w, k) => { const f = `out/v12s/p${k}.wav`; execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "public/v12/vo.wav", "-af", `atrim=${w.a}:${w.b},asetpts=PTS-STARTPTS`, "-ar", "48000", "-ac", "1", f]); return f; });
fs.writeFileSync("out/v12s/list.txt", parts.map((f) => `file '${f.replace("out/v12s/", "")}'`).join("\n"));
execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "out/v12s/list.txt", "-c", "copy", "public/v12/vo60.wav"]);

// remapped vo json (segs/words of the kept lines)
const segs = VO.segs.filter((s) => SEL.includes(s.n - 1)).map((s) => ({ ...s, start: map(s.start), end: map(s.end) }));
const words = VO.words.filter((w) => SEL.includes(w.line - 1)).map((w) => ({ ...w, s: map(w.s), e: map(w.e) }));
fs.writeFileSync("src/v12/vo60.json", JSON.stringify({ total: at, segs, words }));

// effects inside the windows, plus a whoosh on every new cut
const sfx = A.sfx.map(([f, t, v, o]) => [f, map(T(t)), v, o]).filter((x) => x[1] !== null);
WIN.slice(1).forEach((w, k) => sfx.push([k % 2 ? "public/audio/sfx/whoosh/swish-thin.wav" : "public/audio/sfx/whoosh/fast-bright.wav", w.at, 0.4, 0.111]));
const beds = (A.beds ?? []).map(([f, a, b, v]) => [f, map(T(a)), map(T(b)), v]).filter((x) => x[1] !== null && x[2] !== null);
const out = { ...A, vo: "public/v12/vo60.wav", voJson: "src/v12/vo60.json", length: at, music: [["public/v12/music.wav", 0, 0.3, at, 2.5]],
  musicKeys: [[0, 0.26], [at - 2.9, 0.26], [at - 2.5, 0.45]], sfx, beds };
fs.writeFileSync("videos/12/audio60.json", JSON.stringify(out, null, 1));
console.log("short length", at.toFixed(2), "effects", sfx.length, "windows", WIN.map((w) => `${w.i}@${w.at.toFixed(2)}`).join(" "));
