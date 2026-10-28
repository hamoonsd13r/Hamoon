// v21 «قوانین شیفت شب · پرستار» voice, line by line for pronunciation control.
//   node --env-file=.env tools/v21-voice.mjs takes <segId|all> [n=2]   → videos/21/voice/<id>-<k>.mp3 (+ STT check)
//   node tools/v21-voice.mjs check                                    → STT diff of every take vs the script
//   node tools/v21-voice.mjs build                                    → public/v21/narration.wav + src/v21/words.json (PICK + GAP)
// Text: kasra (ِ) marks ezafe for the voice only; captions drop it.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = "videos/21/voice/";
const V = { brian: "nPczCjzI2devNBz1zQrb", twin: "nPczCjzI2devNBz1zQrb", george: "JBFqnCBsd6RMkjVDRZzb", bill: "pqHfZKP75CvOlQylNhV4" };
export const SEG = [
  { id: "01", v: "brian", si: 0, t: "تبریک میگم. از امشب، پرستارِ شیفتِ شبِ بخشِ چهارِ بیمارستانی." },
  { id: "02", v: "brian", si: 1, t: "حقوقش خوبه… به شرطی که این قانون‌ها رو مو به مو اجرا کنی." },
  { id: "03", v: "brian", si: 2, t: "قانونِ اول." },
  { id: "04", v: "brian", si: 3, t: "ساعتِ دوازده، چراغای راهرو رو کم کن و تختا رو بشمار." },
  { id: "05", v: "brian", si: 4, t: "بخش، یازده تا بیمار داره. اگه شمردی و شدن دوازده تا… دوباره نشمار." },
  { id: "06", v: "brian", si: 5, t: "فقط پرده‌ی تختِ آخر رو بکش، و تا صبح طرفش نرو." },
  { id: "07", v: "brian", si: 6, t: "قانونِ دوم." },
  { id: "08", v: "brian", si: 7, t: "اگه زنگِ پرستار از اتاقِ چهارصد و چهار زد، جواب نده. اون اتاق پنج ساله پلمبه." },
  { id: "09", v: "brian", si: 8, t: "اگه بعدش صدای چرخِ ویلچر تو راهرو اومد، چراغِ ایستگاه رو خاموش کن،" },
  { id: "10", v: "brian", si: 9, t: "زیرِ پیشخون بشین، و تا صدا رد نشده… نفس نکش." },
  { id: "11", v: "brian", si: 10, t: "قانونِ سوم." },
  { id: "12", v: "brian", si: 11, t: "ساعتِ سه، آسانسور خودش میاد طبقه‌ی تو. توش یه برانکارده، با یه ملافه‌ی سفید." },
  { id: "13", v: "brian", si: 12, t: "پرونده‌ش رو امضا کن و بفرستش سردخونه. ولی اگه اسمِ روی پرونده… اسمِ خودت بود، امضا نکن." },
  { id: "14", v: "brian", si: 13, t: "درِ آسانسور رو ببند، و هرچی از زیرِ ملافه صدات کرد… جواب نده." },
  { id: "15", v: "brian", si: 14, t: "قانونِ چهارم." },
  { id: "16", v: "brian", si: 15, t: "اگه صبح، پرستارِ شیفتِ بعد اومد و تو رو نشناخت، باهاش بحث نکن." },
  { id: "17", v: "brian", si: 16, t: "کارتت رو از روی سینه‌ت بردار و نگاهش کن. اگه توی عکسِ کارت… چشمات بسته بود،" },
  { id: "18", v: "brian", si: 17, t: "دیگه برنگرد بخش. برو تو آسانسور… و دکمه‌ی منفی دو رو بزن." },
];
const norm = (s) => s.replace(/[ً-ْ]/g, "").replace(/[‌]/g, " ").replace(/[«»،.:؟!…,?"'-]/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim();
const show = (s) => s.replace(/ِ/g, "");

function stt(file) {
  const out = file.replace(/\.mp3$/, ".stt.json");
  if (!fs.existsSync(out)) execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-stt.mjs", file, out, "fas"], { stdio: "ignore" });
  return JSON.parse(fs.readFileSync(out, "utf8")).text;
}
const NUM = { "1": "یک", "3": "سه", "4": "چهار", "5": "پنج", "11": "یازده", "12": "دوازده", "404": "چهارصدوچهار" };
const flat = (s) => norm(s).replace(/%/g, "درصد").replace(/\d+/g, (d) => NUM[d] ?? d).replace(/ها?ی/g, "ای").replace(/است/g, "ست").replace(/ /g, "");
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
  fs.mkdirSync("out/v21", { recursive: true });
  for (const s of SEG) {
    const f = `${DIR}${s.id}-${PICK[s.id]}`;
    const { alignment: a } = JSON.parse(fs.readFileSync(f + ".json", "utf8"));
    // trim lead/tail silence from the alignment
    const first = a.character_start_times_seconds.find((_, i) => /\S/.test(a.characters[i]));
    const lastEnd = a.character_end_times_seconds.at(-1);
    const from = Math.max(0, first - 0.05), to = lastEnd + 0.12;
    const fx = s.v === "bill" ? ",aecho=0.6:0.4:40:0.2,lowpass=f=6000"
      : s.v === "twin" ? ",asetrate=48000*0.84,aresample=48000,atempo=1.12,aecho=0.7:0.6:60|120:0.35|0.2" : "";
    const tmp = `out/v21/${s.id}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", f + ".mp3", "-af", `aresample=48000,atrim=${from}:${to},asetpts=PTS-STARTPTS,atempo=${TEMPO}${fx}`, "-ar", "48000", "-ac", "1", tmp]);
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
  fs.mkdirSync("public/v21", { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${delays};${parts.map((_, i) => `[d${i}]`).join("")}amix=inputs=${parts.length}:normalize=0`, "-ar", "48000", "public/v21/narration.wav"]);
  fs.mkdirSync("src/v21", { recursive: true });
  fs.writeFileSync("src/v21/words.json", JSON.stringify(words));
  console.log("words", words.length, "dur", t.toFixed(2));
  for (const s of SEG) { const ws = words.filter((w) => w.si === s.si); console.log(s.id, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2), ws.length, "words"); }
}
