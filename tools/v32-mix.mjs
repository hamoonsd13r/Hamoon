// V32 mix: user's voice (−16 LUFS) + reference-reel music at the reel's own ratio (no ducking, as the user approved)
// + effects (peak-normalised, placed by their peak on the visible event; light ducking under the voice).
// Times come from src/v32/words.json with the same cuts as src/v32/Video.tsx.
// Usage: node tools/v32-mix.mjs  → public/v32/mix.wav
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
const WD = JSON.parse(fs.readFileSync("src/v32/words.json", "utf8"));
const LW = (n) => WD.filter((w) => w.si === n);
const wd = (n, x) => LW(n).find((w) => w.w.includes(x)).s;
const wdEnd = (n, x) => LW(n).find((w) => w.w.includes(x)).e;
const cut = (n) => LW(n)[0].s - 0.12;
const LAST = WD.at(-1).e;
const TOTAL = Math.round((LAST + 1.3) * 100) / 100;
const C = { s2: cut(1), s3: cut(2), s4: cut(3) - 0.1, s5: cut(4), s6: cut(5), s7: cut(7), s8: cut(9), s9: cut(10), s10: cut(11), s11: cut(13), s12: cut(14), s13: cut(15), s14: cut(17), s15: cut(18), s16: cut(20) };
const V3PLAY = wd(16, "داری") - 0.55;
const A = "public/v32/sfx/sfx/", E = "public/v32/sfx/el/";
const f = {
  whS: A + "whoosh/soft-short.wav", whF: A + "whoosh/fast-bright.wav", whD: A + "whoosh/double.wav", whH: A + "transition/whoosh-hit-2.wav",
  stamp: A + "impact/classic-stamp.wav", thud: A + "impact/classic-thud.wav", soft: A + "impact/soft-thump.wav", sub: A + "impact/subdrop-short.wav", punch: A + "impact/punchy-short.wav",
  st1: A + "foley/stones-01.wav", st2: A + "foley/stones-02.wav", st3: A + "foley/stones-03.wav",
  sh1: A + "camera/shutter-dslr.wav", sh2: A + "camera/shutter-fast.wav", slide: A + "paper/slide.wav", flip: A + "paper/page-flip.wav",
  p1: A + "pop/pop-1.wav", p2: A + "pop/pop-2.wav", p3: A + "pop/pop-3.wav", p4: A + "pop/pop-4.wav",
  riser: A + "riser/quick-1s.wav", swell: A + "transition/swell-bell.wav", spark: A + "magic/sparkle.wav",
  whip: E + "whip-1.mp3", sheep: E + "sheep-1.mp3", baby: E + "baby-1.mp3", chisel: E + "chisel-1.mp3", clay: E + "clay-1.mp3",
};
// [file, at (peak lands here), dB relative to peak −3 dBFS]
const ev = [
  [f.whS, C.s2, -15], [f.spark, wd(1, "شاه") - 0.05, -18], [f.p2, wdEnd(1, "شاه") + 0.15, -13], [f.stamp, wd(1, "کارگرِ"), -8], [f.soft, wd(1, "کارگرِ") + 0.02, -12],
  [f.whF, C.s3, -13], [f.p1, C.s3 + 0.08, -16],
  [f.whD, C.s4, -15], [f.st1, C.s4 + 1.1, -17],
  [f.sub, C.s5 + 0.05, -11], [f.whip, wd(4, "شلاق"), -5],
  [f.whS, C.s6, -15], [f.clay, wd(5, "لوحِ") - 0.05, -9], [f.stamp, wd(6, "مجانی"), -8],
  [f.whF, C.s7, -14], [f.p3, C.s7 + 0.08, -16], [f.slide, wd(8, "جو") - 0.1, -14], [f.p4, wd(8, "شراب"), -15], [f.p4, wd(8, "آبجو"), -15], [f.sheep, wd(8, "گوسفند") + 0.05, -9],
  [f.flip, C.s8 + 0.1, -12], [f.thud, C.s8 + 0.38, -14], [f.spark, wd(9, "هزاران") + 0.1, -13], [f.st2, wd(9, "هزاران") + 0.35, -17], [f.st3, wd(9, "هزاران") + 0.8, -18],
  [f.whD, C.s9, -15], [f.p1, C.s9 + 0.08, -16], [f.riser, wd(10, "بیشتره"), -17],
  [f.whF, C.s10, -14], [f.p3, C.s10 + 0.08, -16], [f.baby, wd(11, "بچه‌دار") + 0.2, -10], [f.p4, wd(11, "اضافه"), -14],
  [f.thud, wd(12, "پسر"), -11], [f.stamp, wd(12, "دوبرابر"), -7], [f.punch, wd(12, "دوبرابر") + 0.01, -13],
  [f.whS, C.s11, -15], [f.p1, C.s11 + 0.08, -16], [f.p2, wd(13, "مصریه"), -15], [f.p2, wd(13, "یونانی"), -15], [f.p2, wd(13, "بابلی"), -15],
  [f.whH, C.s12, -12], [f.spark, C.s12 + 1.05, -16],
  [f.whD, C.s13, -15], [f.p3, C.s13 + 0.08, -16], [f.chisel, V3PLAY + 1.23, -11],
  [f.riser, C.s14, -11], [f.sub, C.s14 + 0.05, -10],
  [f.sh1, wd(17, "عکس"), -13], [f.sh2, wd(17, "عکس") + 0.12, -15], [f.sh1, wd(17, "عکس") + 0.3, -15], [f.sh2, wd(17, "عکس") + 0.55, -16],
  [f.whF, C.s15, -14], [f.p1, C.s15 + 0.08, -16], [f.slide, wd(18, "فیشِ") + 0.1, -10], [f.flip, wd(18, "فیشِ") + 0.5, -15],
  [f.swell, wd(19, "تخت‌جمشید") - 0.1, -15],
  [f.spark, C.s16 + 0.2, -14], [f.slide, C.s16 + 1.0, -16],
];
const tmp = "out/v32-mix"; fs.mkdirSync(tmp, { recursive: true });
const sh = (args) => execFileSync("ffmpeg", ["-hide_banner", "-v", "error", "-y", ...args]);
const peakOf = (file) => {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]);
  const a = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let m = 0, at = 0;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > m) { m = Math.abs(a[i]); at = i; }
  return { t: at / 16000, db: 20 * Math.log10(m + 1e-9) };
};
const cache = {};
const inputs = [], filt = [];
const add = (file) => { inputs.push("-i", file); return inputs.length / 2 - 1; };
const iv = add("public/v32/voice.wav");
const im = add("public/v32/music-ref.flac");
filt.push(`[${iv}:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=${TOTAL}[v]`);
filt.push(`[${im}:a]atrim=0:${TOTAL},asetpts=PTS-STARTPTS,loudnorm=I=-27.8:TP=-3,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=out:st=${(TOTAL - 2.2).toFixed(2)}:d=2.2[m]`);
const fx = [];
ev.forEach(([file, at, db], k) => {
  const p = cache[file] ?? (cache[file] = peakOf(file));
  const i = add(file);
  const start = Math.max(0, at - p.t);
  const gain = -3 - p.db + db;
  filt.push(`[${i}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${gain.toFixed(2)}dB,adelay=${Math.round(start * 1000)}:all=1[e${k}]`);
  fx.push(`[e${k}]`);
});
// clip audio from the Veo shots (no speech): stones/effort, chisel hits
const i2 = add("uploads/v32/vid2.mp4"), i3 = add("uploads/v32/vid3.mp4");
filt.push(`[${i2}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=2.2,afade=t=out:st=3.6:d=0.4,adelay=${Math.round(C.s4 * 1000)}:all=1[c2]`); fx.push("[c2]");
filt.push(`[${i3}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=2.6,afade=t=out:st=3.6:d=0.4,adelay=${Math.round(V3PLAY * 1000)}:all=1[c3]`); fx.push("[c3]");
// ambience beds: construction site (ancient shots) + wind
const ib = add(E + "site-1.mp3"), iw = add(A + "ambience/wind.wav");
const bedEnd = C.s14 - 0.1;
filt.push(`[${ib}:a]aformat=sample_rates=48000:channel_layouts=stereo,aloop=loop=-1:size=384000,atrim=0:${bedEnd.toFixed(2)},volume=-27dB,afade=t=in:d=0.3,afade=t=out:st=${(bedEnd - 0.6).toFixed(2)}:d=0.6[b1]`); fx.push("[b1]");
filt.push(`[${iw}:a]aformat=sample_rates=48000:channel_layouts=stereo,aloop=loop=-1:size=576000,atrim=0:${bedEnd.toFixed(2)},volume=-30dB,afade=t=in:d=0.3,afade=t=out:st=${(bedEnd - 0.6).toFixed(2)}:d=0.6[b2]`); fx.push("[b2]");
filt.push(`${fx.join("")}amix=inputs=${fx.length}:normalize=0:duration=longest,atrim=0:${TOTAL}[fxall]`);
filt.push(`[v]asplit[v1][vsc]`);
filt.push(`[fxall][vsc]sidechaincompress=threshold=0.04:ratio=3:attack=15:release=300[fxd]`);
filt.push(`[v1][m][fxd]amix=inputs=3:normalize=0:duration=first[mix]`);
sh([...inputs, "-filter_complex", filt.join(";"), "-map", "[mix]", "-ar", "48000", "-c:a", "pcm_s16le", `${tmp}/pre.wav`]);
// two-pass loudness → −14 LUFS, true peak −1.5
const r = spawnSync("ffmpeg", ["-hide_banner", "-i", `${tmp}/pre.wav`, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"]).stderr.toString();
const j = JSON.parse(r.slice(r.lastIndexOf("{"), r.lastIndexOf("}") + 1));
sh(["-i", `${tmp}/pre.wav`, "-af", `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`, "-ar", "48000", "public/v32/mix.wav"]);
console.log("events", ev.length, "length", TOTAL, "pre I", j.input_i);
