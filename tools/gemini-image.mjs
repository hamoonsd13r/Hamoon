// Gemini image generation (the key is injected by the cloud proxy as x-goog-api-key; nothing is stored here).
// Usage: node tools/gemini-image.mjs --prompt "…" [--ref a.jpg --ref b.png] [--model gemini-3.1-flash-image] [--ar 16:9] --out out.png
//        node tools/gemini-image.mjs --batch jobs.json   (jobs: [{prompt, refs?, out}], shared --ref/--model/--ar; skips existing outs)
import fs from "node:fs";
import path from "node:path";
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf("--" + k); return i >= 0 ? a[i + 1] : d; };
const refsAll = a.flatMap((x, i) => (x === "--ref" ? [a[i + 1]] : []));
const model = opt("model", "gemini-3.1-flash-image"), ar = opt("ar", "16:9");
const mime = (f) => (/\.png$/i.test(f) ? "image/png" : /\.webp$/i.test(f) ? "image/webp" : "image/jpeg");
async function gen({ prompt, refs = [], out }) {
  if (fs.existsSync(out)) { console.log("skip", out); return true; }
  const parts = [...[...refsAll, ...refs].map((f) => ({ inline_data: { mime_type: mime(f), data: fs.readFileSync(f).toString("base64") } })), { text: prompt }];
  const body = { contents: [{ parts }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: ar } } };
  for (let t = 0; t < 3; t++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    const img = j?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
    if (img) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.from((img.inlineData || img.inline_data).data, "base64")); console.log("ok", out); return true; }
    console.log("retry", out, r.status, JSON.stringify(j.error || j.candidates?.[0]?.finishReason || j.promptFeedback || "").slice(0, 300));
    await new Promise((s) => setTimeout(s, 4000 * (t + 1)));
  }
  return false;
}
const batch = opt("batch");
if (batch) {
  const jobs = JSON.parse(fs.readFileSync(batch, "utf8")); const conc = +opt("conc", 3); let i = 0, bad = 0;
  await Promise.all(Array.from({ length: conc }, async () => { while (i < jobs.length) { const j = jobs[i++]; if (!(await gen(j))) bad++; } }));
  console.log("done", jobs.length - bad, "/", jobs.length); process.exit(bad ? 1 : 0);
} else process.exit((await gen({ prompt: opt("prompt"), out: opt("out", "out/gemini.png") })) ? 0 : 1);
