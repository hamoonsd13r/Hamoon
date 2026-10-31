// V28 Instagram teaser (30 s, vertical): voice track + words + mix plan.
//   node tools/v28-teaser.mjs   → public/v28/teaser-voice.wav, src/v28/teaser.json, videos/28-metro/teaser/mix.json
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const D = "videos/28-metro/teaser/", TEMPO = 1.15;
const words = JSON.parse(fs.readFileSync("src/v28/words.json", "utf8"));
// segments on the teaser timeline; "orig" plays the long video (and its narration) from oa..ob
export const SEG = [
  { k: "new", f: "h-1", ta: 0, tb: 4.1, oa: 14.3, text: "اگه توی ترافیک بمب اتمی بخوره، فقط ده دقیقه وقت داری." },
  { k: "orig", ta: 4.1, oa: 27.75, ob: 31.3 },
  { k: "vis", ta: 7.65, oa: 59.7, ob: 61.05 },
  { k: "orig", ta: 9.0, oa: 76.0, ob: 83.0 },
  { k: "orig", ta: 16.0, oa: 105.4, ob: 112.6 },
  { k: "new", f: "c-2", ta: 23.2, tb: 30.6, text: "و این تازه روز اوله. ادامه‌ی چهارده روز رو توی یوتیوب ببین؛ لینکش توی بیوئه.", at: 23.4 },
];
const LEN = 30.6;
fs.mkdirSync("out/v28t", { recursive: true });
const parts = [], tw = [];
SEG.forEach((s, i) => {
  if (s.k === "orig") {
    const tmp = `out/v28t/${i}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", "public/v28/narration.wav", "-af", `atrim=${s.oa}:${s.ob},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(s.ob - s.oa - 0.05).toFixed(3)}:d=0.05`, "-ar", "48000", "-ac", "1", tmp]);
    parts.push({ tmp, at: s.ta });
    for (const w of words) if (w.s >= s.oa && w.e <= s.ob) tw.push({ ...w, s: +(w.s - s.oa + s.ta).toFixed(3), e: +(w.e - s.oa + s.ta).toFixed(3), seg: i });
  } else if (s.k === "new") {
    const { alignment: a } = JSON.parse(fs.readFileSync(D + s.f + ".json", "utf8"));
    const first = a.character_start_times_seconds.find((_, j) => /\S/.test(a.characters[j]));
    const from = Math.max(0, first - 0.04), to = a.character_end_times_seconds.at(-1) + 0.1;
    const at = s.at ?? s.ta + 0.08;
    const tmp = `out/v28t/${i}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", D + s.f + ".mp3", "-af", `aresample=48000,atrim=${from}:${to},asetpts=PTS-STARTPTS,atempo=${TEMPO}`, "-ar", "48000", "-ac", "1", tmp]);
    parts.push({ tmp, at });
    const disp = s.text.split(/\s+/); let cur = null, wi = 0;
    a.characters.forEach((ch, j) => {
      if (/\s/.test(ch)) { if (cur) { tw.push(cur); cur = null; } return; }
      if (!cur) cur = { si: 100 + i, wi, w: disp[wi++] ?? ch, v: "brian", s: +(at + (a.character_start_times_seconds[j] - from) / TEMPO).toFixed(3), e: 0, seg: i };
      cur.e = +(at + (a.character_end_times_seconds[j] - from) / TEMPO).toFixed(3);
    });
    if (cur) tw.push(cur);
    console.log(s.f, "ends", (at + (to - from) / TEMPO).toFixed(2));
  }
});
execFileSync("ffmpeg", ["-v", "error", "-y", ...parts.flatMap((p) => ["-i", p.tmp]), "-filter_complex",
  `${parts.map((p, i) => `[${i}]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[d${i}]`).join(";")};${parts.map((_, i) => `[d${i}]`).join("")}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${LEN}`, "-ar", "48000", "public/v28/teaser-voice.wav"]);
fs.writeFileSync("src/v28/teaser.json", JSON.stringify({ seg: SEG, len: LEN, words: tw }));
const K = 0.4, fx = (file, at, vol, peak) => ({ file, at, vol: +(vol * K).toFixed(3), peak }), id = (i, at, vol) => ({ id: i, at, vol: +(vol * K).toFixed(3) });
const mix = {
  length: LEN, voice: "public/v28/teaser-voice.wav",
  music: [{ file: "public/audio/music/horror/tragedy-waiting-to-happen.mp3", at: 0, from: 0, to: LEN, fadeIn: 0.05, fadeOut: 1.5, gain: 0.26 }],
  sfx: [
    fx("public/v28/sfx/blast-1.mp3", 0.02, 0.7, 0.04), id("sfx/impact/cinematic-heavy", 0.02, 0.5),
    id("sfx/whoosh/soft-medium", 4.1, 0.4), id("sfx/whoosh/deep", 7.65, 0.4), fx("public/sfx-lib/steps.wav", 7.8, 0.35, 0.02),
    id("sfx/whoosh/deep", 9.0, 0.35), fx("public/sfx-lib/steps.wav", 17.2, 0.3, 0.02), id("sfx/whoosh/soft-medium", 16.0, 0.35),
    id("sfx/impact/distant-boom", 23.2, 0.45), fx("public/sfx-lib/stamp.wav", 26.0, 0.4, 0.02), fx("public/sfx-lib/pop.wav", 28.2, 0.35, 0.01),
  ],
};
fs.writeFileSync(D + "mix.json", JSON.stringify(mix, null, 1));
console.log("words", tw.length);
