// v09 «پمپ‌بنزین» voice, line by line for pronunciation control.
//   node --env-file=.env tools/v09-voice.mjs takes <segId|all> [n=2]   → videos/09-pomp-benzin/voice/<id>-<k>.mp3 (+ STT check)
//   node tools/v09-voice.mjs check                                    → STT diff of every take vs the script
//   node tools/v09-voice.mjs build                                    → public/v09/narration.wav + src/v09/words.json (PICK + GAP)
// Text: kasra (ِ) marks ezafe for the voice only; captions drop it.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = "videos/09-pomp-benzin/voice/";
const V = { brian: "nPczCjzI2devNBz1zQrb", bill: "pqHfZKP75CvOlQylNhV4", george: "JBFqnCBsd6RMkjVDRZzb" };
export const SEG = [
  { id: "01", v: "brian", si: 0, t: "فرض کن شیفتِ شبِ یه پمپ‌بنزینِ وسطِ کویری… دو ساعت با نزدیک‌ترین آبادی فاصله داری." },
  { id: "02", v: "brian", si: 1, t: "ساعتِ دو و چهل‌وهفت دقیقه، چراغای جاده یکی‌یکی خاموش می‌شن… و دارن میان سمتِ تو." },
  { id: "03", v: "brian", si: 2, t: "گوشیت می‌لرزه. پیامکِ اضطراری:" },
  { id: "04", v: "brian", si: 3, t: "داخل بمونید. همه‌ی چراغا رو خاموش کنید. در رو به روی هیچ‌کس باز نکنید. نیروی امدادی هفت روز دیگه می‌رسه." },
  { id: "05", v: "brian", si: 4, t: "زیرِ پیشخون یه برگه چسبیده، با خطِ یه نفرِ دیگه: قانونِ اول، چراغ نه. قانونِ دوم، در قفل. قانونِ سوم، اگه کسی اسمت رو صدا زد… جواب نده." },
  { id: "06", v: "brian", si: 5, t: "خبرِ خوب: صد تا بطری آب داری و یه کارتن پفک." },
  { id: "07", v: "brian", si: 6, t: "خبرِ بد: سه طرفِ مغازه شیشه‌ست… و توی شیشه، انعکاست یه لحظه دیرتر از خودت تکون می‌خوره." },
  { id: "08", v: "brian", si: 7, t: "ساعتِ سه و چهارده دقیقه، یه پیکانِ سفید با چراغای خاموش کنارِ پمپِ شماره‌ی چهار پارک می‌کنه. یازده دقیقه هیچ‌کس پیاده نمی‌شه." },
  { id: "09", v: "brian", si: 8, t: "بعد یکی به شیشه می‌زنه:" },
  { id: "10", v: "bill", si: 9, t: "سرکار، پلیسِ راهیم. داریم منطقه رو تخلیه می‌کنیم. اتوبوس پنج دقیقه دیگه حرکت می‌کنه. در رو باز کن." },
  { id: "11", v: "brian", si: 10, t: "کشوی پول خودبه‌خود باز می‌شه. توش یه کاغذه… با دست‌خطِ خودت:" },
  { id: "12", v: "brian", si: 11, t: "باز نکن. دیشب منم باز کردم." },
  { id: "13", v: "brian", si: 12, t: "بی‌سیم خش‌خش می‌کنه:" },
  { id: "14", v: "george", si: 13, t: "همه‌ی گشت‌های پلیسِ راه از ساعتِ دو بی‌پاسخن. هیچ مأموری تو این جاده نمونده." },
  { id: "15", v: "brian", si: 14, t: "صدای پشتِ شیشه، آروم، اسمت رو صدا می‌زنه… و می‌گه:" },
  { id: "16", v: "bill", si: 15, t: "پشتِ پیشخون قایم نشو. می‌بینمت." },
  { id: "17", v: "brian", si: 16, t: "در رو باز می‌کنی؟ شبِ دوم… فردا." },
];
const norm = (s) => s.replace(/[ً-ْ]/g, "").replace(/[‌]/g, " ").replace(/[«»،.:؟!…,?"'-]/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim();
const show = (s) => s.replace(/ِ/g, "");

function stt(file) {
  const out = file.replace(/\.mp3$/, ".stt.json");
  if (!fs.existsSync(out)) execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-stt.mjs", file, out, "fas"], { stdio: "ignore" });
  return JSON.parse(fs.readFileSync(out, "utf8")).text;
}
const NUM = { "2": "دو", "47": "چهلوهفت", "3": "سه", "14": "چهارده", "11": "یازده", "7": "هفت", "5": "پنج", "100": "صد" };
const flat = (s) => norm(s).replace(/\d+/g, (d) => NUM[d] ?? d).replace(/ها?ی/g, "ای").replace(/است/g, "ست").replace(/ /g, "");
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
      execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-tts.mjs", V[s.v], `${DIR}${s.id}.txt`, f, "eleven_v3"], { stdio: "ignore" });
      const d = diff(s.t, stt(f));
      console.log(s.id, k, d.ok ? "OK" : `✗ ${d.miss.join("  ")}`);
    }
  }
} else if (mode === "check") {
  for (const s of SEG) for (const f of fs.readdirSync(DIR).filter((f) => f.startsWith(s.id + "-") && f.endsWith(".mp3"))) {
    const h = stt(DIR + f); const d = diff(s.t, h);
    console.log(f, d.ok ? "OK" : `✗ ${d.miss.join("  ")}`);
  }
} else if (mode === "build") {
  const { PICK, GAP, TEMPO } = JSON.parse(fs.readFileSync(DIR + "pick.json", "utf8"));
  const words = [], parts = [];
  let t = 0.15;
  fs.mkdirSync("out/v09", { recursive: true });
  for (const s of SEG) {
    const f = `${DIR}${s.id}-${PICK[s.id]}`;
    const { alignment: a } = JSON.parse(fs.readFileSync(f + ".json", "utf8"));
    // trim lead/tail silence from the alignment
    const first = a.character_start_times_seconds.find((_, i) => /\S/.test(a.characters[i]));
    const lastEnd = a.character_end_times_seconds.at(-1);
    const from = Math.max(0, first - 0.05), to = lastEnd + 0.12;
    const radio = s.v === "george", glass = s.v === "bill";
    const fx = radio ? ",highpass=f=350,lowpass=f=3200,acrusher=bits=10:mix=0.25" : glass ? ",lowpass=f=5200,aecho=0.6:0.5:35:0.25" : "";
    const tmp = `out/v09/${s.id}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", f + ".mp3", "-af", `atrim=${from}:${to},asetpts=PTS-STARTPTS,atempo=${TEMPO}${fx}`, "-ar", "48000", "-ac", "1", tmp]);
    parts.push({ tmp, at: t });
    // words of this segment
    let cur = null, wi = 0;
    const disp = show(s.t).split(/\s+/);
    a.characters.forEach((ch, i) => {
      if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; }
      if (!cur) cur = { si: s.si, wi: wi, w: disp[wi++] ?? ch, v: s.v, s: +(t + (a.character_start_times_seconds[i] - from) / TEMPO).toFixed(3), e: 0 };
      cur.e = +(t + (a.character_end_times_seconds[i] - from) / TEMPO).toFixed(3);
    });
    if (cur) words.push(cur);
    t += (to - from) / TEMPO + (GAP[s.id] ?? 0.45);
  }
  const inputs = parts.flatMap((p) => ["-i", p.tmp]);
  const delays = parts.map((p, i) => `[${i}]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[d${i}]`).join(";");
  fs.mkdirSync("public/v09", { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${delays};${parts.map((_, i) => `[d${i}]`).join("")}amix=inputs=${parts.length}:normalize=0`, "-ar", "48000", "public/v09/narration.wav"]);
  fs.mkdirSync("src/v09", { recursive: true });
  fs.writeFileSync("src/v09/words.json", JSON.stringify(words));
  console.log("words", words.length, "dur", t.toFixed(2));
  for (const s of SEG) { const ws = words.filter((w) => w.si === s.si); console.log(s.id, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2), ws.length, "words"); }
}
