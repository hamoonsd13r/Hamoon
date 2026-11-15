// V51 · YouTube subtitles (SRT) from the same caption chunks the video shows. Usage: node tools/v51-srt.mjs (after the esbuild step in v51-mix.mjs)
import fs from "node:fs";
import { createRequire } from "node:module";
const { chunks } = createRequire(import.meta.url)("../out/v51/vt.cjs");
const ts = (x) => { x = Math.max(0, x); const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000) % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`; };
const srt = chunks(9).map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.ws.map((w) => w.w).join(" ")}\n`).join("\n");
fs.writeFileSync("videos/51/v51-fa.srt", "﻿" + srt);
console.log("videos/51/v51-fa.srt", chunks(9).length, "cues");
