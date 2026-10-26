// v11 «۳۰ روز معروف‌ترین خواننده» voice, line by line with strict pronunciation control.
//   node --env-file=.env tools/v11-voice.mjs takes <segId|all> [n=2]   → videos/11/voice/<id>-<k>.mp3 (+ STT check)
//   node tools/v11-voice.mjs check                                    → STT diff + low-confidence words of every take
//   node tools/v11-voice.mjs build                                    → public/v11/vo.wav + src/v11/words.json (PICK + GAP)
// Text: harakat (ِ َ ُ ّ) guide the voice only; captions drop them. `cap` = on-screen text when it differs (digits).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = "videos/11/voice/";
const V = { brian: "nPczCjzI2devNBz1zQrb", liam: "TX3LPaxmHKxFdv7VOQHJ", matilda: "XrExE9yKIg1WjnnlVkGX", lily: "pFZP5JQG7iQjIQuC4Bku" };
export const SEG = [
  { id: "01", v: "brian", si: 0, t: "[dramatic, tense] صد هزار نفر منتظرن… و این آقا متنِ آهنگ یادش رفته!" },
  { id: "02", v: "brian", si: 1, t: "[storytelling] سی روز قبل، فقط زیرِ دوش می‌خوند… تا اینکه همسایه، برای شکایت، ازش فیلم گرفت!" },
  { id: "03", v: "brian", si: 2, t: "[excited] فرداش، اون فیلم صد میلیون بازدید خورد!" },
  { id: "04", v: "liam", si: 3, t: "[shocked, panicked] این‌همه آدم دمِ خونه‌ی ما چی‌کار می‌کنن؟!" },
  { id: "05", v: "brian", si: 4, t: "[dry] روزِ دهم، دیگه نمی‌تونست بره نون بخره." },
  { id: "06", v: "liam", si: 5, t: "[desperate, out of breath] فقط یه سنگک می‌خواستم!" },
  { id: "07", v: "brian", si: 6, t: "[deadpan] روزِ بیستم، بادیگاردا موقعِ مسواک هم وِلش نمی‌کردن." },
  { id: "08", v: "brian", si: 7, t: "[soft, sad] همه‌چی داشت… جز یه هم‌صحبت." },
  { id: "09", v: "brian", si: 8, t: "[tense] روزِ سی‌اُم، بزرگ‌ترین کنسرتش… ذهنش خالی شد." },
  { id: "10", v: "brian", si: 9, t: "[building excitement] پس چشماشو بست… و فکر کرد زیرِ دوشه!" },
  { id: "11", v: "brian", si: 10, t: "[amused, dry] ولی یه نفر هنوز تحتِ تأثیر نبود…" },
  { id: "12", v: "matilda", si: 11, t: "[stern, annoyed mother] آقای معروف! آشغالا رو ببر پایین!" },
];
const norm = (s) => s.replace(/[ً-ْ]/g, "").replace(/[‌]/g, " ").replace(/[«»،.:؟!…,?"'-]/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim();
const show = (s) => s.replace(/^\[[^\]]*\]\s*/, "").replace(/[ً-ْ]/g, "");
const say = (s) => s.replace(/^\[[^\]]*\]\s*/, "");

function sttJ(file) {
  const out = file.replace(/\.mp3$/, ".stt.json");
  if (!fs.existsSync(out)) execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-stt.mjs", file, out, "fas"], { stdio: "ignore" });
  return JSON.parse(fs.readFileSync(out, "utf8"));
}
const stt = (file) => sttJ(file).text;
/** words the recogniser was unsure about (mumbled / odd stress), and non-speech events (cough, laugh). */
const unsure = (file) => sttJ(file).words.filter((w) => (w.type === "word" && w.logprob < -0.35) || w.type === "audio_event").map((w) => `${w.text}(${w.logprob?.toFixed(2) ?? "ev"})`);
const report = (s, f) => { const d = diff(s.t, stt(f)); const u = unsure(f); return (d.ok ? "OK" : `✗ ${d.miss.join("  ")}`) + (u.length ? `  ?${u.join(" ")}` : ""); };
const NUM = { "85": "هشتادوپنج", "25": "بیستوپنج", "2400": "دوهزاروچهارصد", "12": "دوازده", "5": "پنج", "100": "صد", "10": "ده", "60": "شصت", "12000": "دوازدههزار" };
const flat = (s) => norm(say(s).replace(/ه‌ی /g, "ه ")).replace(/\d+/g, (d) => NUM[d] ?? d).replace(/ها?ی/g, "ای").replace(/است/g, "ست").replace(/ /g, "");
/** char-level diff on space-free text: returns the differing stretches (expected → heard). */
function diff(a, b) {
  const A = [...flat(a)], B = [...flat(b)];
  const L = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0, ea = "", eb = "";
  const flush = () => { if (ea || eb) out.push(`${ea || "∅"}→${eb || "∅"}`); ea = eb = ""; };
  while (i < A.length || j < B.length) {
    if (i < A.length && j < B.length && A[i] === B[j]) { flush(); i++; j++; }
    else if (j < B.length && (i >= A.length || L[i][j + 1] >= L[i + 1][j])) eb += B[j++];
    else ea += A[i++];
  }
  flush();
  return { ok: out.length === 0, miss: out, extra: [] };
}
const mode = process.argv[2];
if (mode === "takes") {
  const which = process.argv[3] ?? "all", n = +(process.argv[4] ?? 2);
  for (const s of SEG.filter((s) => which === "all" || which.split(",").includes(s.id))) {
    const have = fs.readdirSync(DIR).filter((f) => f.startsWith(s.id + "-") && /^\d+-\d+\.mp3$/.test(f)).length;
    for (let k = have + 1; k <= have + n; k++) {
      fs.writeFileSync(`${DIR}${s.id}.txt`, s.t);
      const f = `${DIR}${s.id}-${k}.mp3`;
      execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-tts.mjs", V[process.env.VOICE ?? s.v], `${DIR}${s.id}.txt`, f, "eleven_v3"], { stdio: "ignore" });
      console.log(s.id, k, report(s, f));
    }
  }
} else if (mode === "check") {
  for (const s of SEG) for (const f of fs.readdirSync(DIR).filter((f) => f.startsWith(s.id + "-") && f.endsWith(".mp3")).sort()) {
    console.log(f, report(s, DIR + f));
  }
} else if (mode === "build") {
  const { PICK, GAP, TEMPO } = JSON.parse(fs.readFileSync(DIR + "pick.json", "utf8"));
  const words = [], parts = [];
  let t = 0.15;
  fs.mkdirSync("out/v11", { recursive: true });
  for (const s of SEG) {
    const f = `${DIR}${s.id}-${PICK[s.id]}`;
    const { alignment: a } = JSON.parse(fs.readFileSync(f + ".json", "utf8"));
    // trim lead/tail silence from the alignment
    const tagN = (s.t.match(/^\[[^\]]*\]\s*/) ?? [""])[0].length;
    const first = a.character_start_times_seconds.find((_, i) => i >= tagN && /\S/.test(a.characters[i]));
    const lastEnd = a.character_end_times_seconds.at(-1);
    const from = Math.max(0, first - 0.05), to = lastEnd + 0.12;
    const fx = "";
    const tmp = `out/v11/${s.id}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", f + ".mp3", "-af", `atrim=${from}:${to},asetpts=PTS-STARTPTS,atempo=${TEMPO}${fx}`, "-ar", "48000", "-ac", "1", tmp]);
    parts.push({ tmp, at: t });
    // words of this segment
    let cur = null, wi = 0;
    const disp = show(s.t).split(/\s+/);
    const tagLen = (s.t.match(/^\[[^\]]*\]\s*/) ?? [""])[0].length;
    a.characters.forEach((ch, i) => {
      if (i < tagLen) return;
      if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; }
      if (!cur) cur = { si: s.si, wi: wi, w: disp[wi++] ?? ch, v: s.v, s: +(t + (a.character_start_times_seconds[i] - from) / TEMPO).toFixed(3), e: 0 };
      cur.e = +(t + (a.character_end_times_seconds[i] - from) / TEMPO).toFixed(3);
    });
    if (cur) words.push(cur);
    for (const [say, shown] of Object.entries(s.nums ?? {})) {
      const n = say.split(" ").length, key = show(say);
      const seg = words.filter((w) => w.si === s.si);
      for (let k = 0; k + n <= seg.length; k++) {
        const run = seg.slice(k, k + n);
        if (run.map((w) => w.w).join(" ").replace(/[،.؟!…]+$/, "") !== key) continue;
        const tail = run.at(-1).w.match(/[،.؟!…]+$/)?.[0] ?? "";
        run[0].w = shown.split(" ")[0] + (shown.includes(" ") ? "" : tail);
        run[0].e = run.at(-1).e;
        // multi-word shown text ("۱۲ هزار"): keep the last spoken word as the last shown word
        const keep = shown.includes(" ") ? [run[0], run.at(-1)] : [run[0]];
        if (shown.includes(" ")) { run.at(-1).w = shown.split(" ").slice(1).join(" ") + tail; run[0].e = run[0].s + (run.at(-1).s - run[0].s); }
        for (const w of run) if (!keep.includes(w)) words.splice(words.indexOf(w), 1);
        break;
      }
    }
    words.filter((w) => w.si === s.si).forEach((w, k) => (w.wi = k));
    t += (to - from) / TEMPO + (GAP[s.id] ?? 0.45);
  }
  const inputs = parts.flatMap((p) => ["-i", p.tmp]);
  const delays = parts.map((p, i) => `[${i}]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[d${i}]`).join(";");
  fs.mkdirSync("public/v11", { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${delays};${parts.map((_, i) => `[d${i}]`).join("")}amix=inputs=${parts.length}:normalize=0`, "-ar", "48000", "public/v11/vo.wav"]);
  fs.mkdirSync("src/v11", { recursive: true });
  fs.writeFileSync("src/v11/words.json", JSON.stringify(words));
  console.log("words", words.length, "dur", t.toFixed(2));
  for (const s of SEG) { const ws = words.filter((w) => w.si === s.si); console.log(s.id, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2), ws.length, "words"); }
}
