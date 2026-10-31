// v28 «۱۴ روز زیر شهر» (survival: nuclear blast while stuck in traffic → metro shelter), line by line.
//   node tools/v28-voice.mjs takes <segId|all> [n=2] | check | build
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DIR = "videos/28-metro/voice/";
const V = { brian: "nPczCjzI2devNBz1zQrb", liam: "TX3LPaxmHKxFdv7VOQHJ", bill: "pqHfZKP75CvOlQylNhV4", george: "JBFqnCBsd6RMkjVDRZzb" };
export const SEG = [
  { id: "01", v: "brian", si: 0, t: "ساعتِ هفت و چهل دقیقه‌ی صبحه. توی ترافیک گیر کردی و سرت توی گوشیه." },
  { id: "02", v: "brian", si: 1, t: "یهو همه‌جا سفید می‌شه. یه نور، روشن‌تر از خورشید. بدونِ هیچ صدایی." },
  { id: "03", v: "brian", si: 2, t: "یه بمبِ اتمی، بیست کیلومتر جلوتر، وسطِ شهر منفجر شده." },
  { id: "04", v: "brian", si: 3, t: "نور فوری می‌رسه، ولی موجِ انفجار یه دقیقه بعد. شیشه‌ها ترک برمی‌دارن و دزدگیرِ همه‌ی ماشین‌ها با هم جیغ می‌کشه." },
  { id: "05", v: "brian", si: 4, t: "تو زنده‌ای. ولی خطرِ اصلی، هنوز نرسیده." },
  { id: "06", v: "brian", si: 5, t: "اون قارچ، هزاران تُن خاک رو برده بالا. این خاک حالا رادیواکتیوه، و کم‌کم برمی‌گرده پایین." },
  { id: "07", v: "brian", si: 6, t: "حداقل ده دقیقه وقت داری که یه پناهگاه پیدا کنی." },
  { id: "08", v: "brian", si: 7, t: "ماشین تقریباً هیچی رو جلوش نمی‌گیره. چیزی که جلوش رو می‌گیره جرمه: بتن و خاک. هرچی بیشتر، بهتر." },
  { id: "09", v: "brian", si: 8, t: "یه پیکِ موتوری از بینِ ماشین‌ها لایی می‌کشه و داد می‌زنه:" },
  { id: "10", v: "liam", si: 8, t: "بپر بالا! ایستگاهِ مترو همین پایینه!" },
  { id: "11", v: "brian", si: 9, t: "سه دقیقه بعد، دارید پله‌های مترو رو می‌دوید پایین. نه طبقه‌ی اول؛ پایین‌تر. تا جایی که دیگه نورِ روز نمی‌رسه." },
  { id: "12", v: "brian", si: 10, t: "تهِ سکو، یه داروسازِ پیر با کیفش نشسته." },
  { id: "13", v: "bill", si: 10, t: "آفرین. الان سی متر خاک بالای سرمونه." },
  { id: "14", v: "brian", si: 11, t: "بالای سرتون، غبار شروع کرده به باریدن. خاکستری و بی‌بو. هیچ‌کس حسش نمی‌کنه." },
  { id: "15", v: "brian", si: 12, t: "ولی این غبار یه نقطه‌ضعف داره. هر بار که زمان هفت برابر بشه، تشعشعش ده برابر کم می‌شه." },
  { id: "16", v: "brian", si: 12, t: "هفت ساعت بعد، یک دهم. دو روز بعد، یک صدم. دو هفته بعد، یک هزارم." },
  { id: "17", v: "brian", si: 13, t: "پس کارِ تو فقط یه چیزه: زیرِ بتن بمون، و بذار زمان کارش رو بکنه." },
  { id: "18", v: "brian", si: 14, t: "ولی پیک طاقت نمیاره. می‌ره بالا که موتورش رو بیاره. بیست دقیقه بعد برمی‌گرده؛ از سر تا پا خاکستری." },
  { id: "19", v: "bill", si: 15, t: "نترسید. بیماریِ تشعشع واگیر نداره. خطر خودش نیست؛ غباریه که روشه." },
  { id: "20", v: "brian", si: 16, t: "لباسِ رویی‌ش رو درمیاره و می‌ذاره توی کیسه، دور از بقیه. همین کار، حدودِ نود درصدِ آلودگی رو می‌بره." },
  { id: "21", v: "brian", si: 16, t: "بعد آب و صابون، آروم و بدونِ نرم‌کننده؛ چون نرم‌کننده غبار رو به مو می‌چسبونه." },
  { id: "22", v: "brian", si: 17, t: "چند ساعت بعد، حالش بد می‌شه. داروساز ساعت رو نگاه می‌کنه." },
  { id: "23", v: "bill", si: 17, t: "هرچی دیرتر حالت بد بشه، یعنی تشعشعِ کمتری گرفتی. تو خوب می‌شی." },
  { id: "24", v: "brian", si: 18, t: "مشکلِ بعدی، آبه. کیوسکِ ایستگاه پر از بطری‌های دربسته‌ست. قانونش ساده‌ست: دربسته یعنی سالم. هرچی زیرِ آسمونِ باز بوده، نه." },
  { id: "25", v: "brian", si: 19, t: "روزِ سوم. یکی بینِ مردم قرصِ یُد پخش می‌کنه." },
  { id: "26", v: "bill", si: 19, t: "این فقط از تیروئید محافظت می‌کنه. فقط وقتی بخورید که مسئولین گفتن." },
  { id: "27", v: "brian", si: 20, t: "روزِ پنجم، بارون میاد. آب، غبار رو از کلِ خیابون جمع می‌کنه و از پله‌ها سرازیر می‌کنه پایین. همه‌چیز رو می‌برید اون سرِ سکو، دور از آب." },
  { id: "28", v: "brian", si: 21, t: "روزِ دوازدهم، رادیو بالاخره حرف می‌زنه." },
  { id: "29", v: "george", si: 21, t: "اتوبوس‌های تخلیه، از ایستگاهِ آخرِ خط حرکت می‌کنن." },
  { id: "30", v: "brian", si: 22, t: "ایستگاهِ آخر، هشت کیلومتر اون‌طرف‌تره. ولی لازم نیست از خیابون برید. از توی تونل می‌رید؛ زیرِ خاک، تا تهِ خط." },
  { id: "31", v: "brian", si: 23, t: "روزِ چهاردهم. تشعشعِ بیرون، یک هزارمِ روزِ اوله. پله‌ها رو بالا می‌ری، و بعد از دو هفته، دوباره آسمون رو می‌بینی." },
  { id: "32", v: "brian", si: 24, t: "پس یادت باشه: برو داخل. برو پایین. بمون. و بذار زمان کارش رو بکنه." },
];
const norm = (s) => s.replace(/[ً-ْ]/g, "").replace(/[‌]/g, " ").replace(/[«»،.:؟!…,?"'-]/g, " ").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " ").trim();
const show = (s) => s.replace(/ِ/g, "");

function stt(file) {
  const out = file.replace(/\.mp3$/, ".stt.json");
  if (!fs.existsSync(out)) execFileSync(process.execPath, ["--env-file=.env", "tools/eleven-stt.mjs", file, out, "fas"], { stdio: "ignore" });
  return JSON.parse(fs.readFileSync(out, "utf8")).text;
}
const NUM = { "7": "هفت", "10": "ده", "90": "نود", "A": "ای", "B": "بی", "1": "یک", "3": "سه", "4": "چهار", "5": "پنج", "11": "یازده", "12": "دوازده", "404": "چهارصدوچهار" };
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
  fs.mkdirSync("out/v28", { recursive: true });
  for (const s of SEG) {
    const f = `${DIR}${s.id}-${PICK[s.id]}`;
    const { alignment: a } = JSON.parse(fs.readFileSync(f + ".json", "utf8"));
    // trim lead/tail silence from the alignment
    const first = a.character_start_times_seconds.find((_, i) => /\S/.test(a.characters[i]));
    const lastEnd = a.character_end_times_seconds.at(-1);
    const from = Math.max(0, first - 0.05), to = lastEnd + 0.12;
    const fx = s.v === "george" ? ",highpass=f=400,lowpass=f=3200,acompressor=threshold=0.1:ratio=4,volume=1.4" : "";
    const tmp = `out/v28/${s.id}.wav`;
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
  fs.mkdirSync("public/v28", { recursive: true });
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${delays};${parts.map((_, i) => `[d${i}]`).join("")}amix=inputs=${parts.length}:normalize=0`, "-ar", "48000", "public/v28/narration.wav"]);
  fs.mkdirSync("src/v28", { recursive: true });
  fs.writeFileSync("src/v28/words.json", JSON.stringify(words));
  console.log("words", words.length, "dur", t.toFixed(2));
  for (const s of SEG) { const ws = words.filter((w) => w.si === s.si); console.log(s.id, ws[0].s.toFixed(2), "→", ws.at(-1).e.toFixed(2), ws.length, "words"); }
}
