# v42: show.json for tools/captions.mjs from the spoken words in vo.json (spelled-out numbers → Persian digits)
# Usage: python3 tools/v42-show.py <vo.json> <out show.json>
import json, re, sys
U = {"صفر":0,"یک":1,"دو":2,"سه":3,"چهار":4,"پنج":5,"شش":6,"هفت":7,"هشت":8,"نه":9,"ده":10,"یازده":11,"دوازده":12,"سیزده":13,"چهارده":14,"پونزده":15,"پانزده":15,"شونزده":16,"شانزده":16,"هفده":17,"هجده":18,"نوزده":19,
     "بیست":20,"سی":30,"چهل":40,"پنجاه":50,"شصت":60,"هفتاد":70,"هشتاد":80,"نود":90,"صد":100,"دویست":200,"سیصد":300,"چهارصد":400,"پونصد":500,"پانصد":500,"ششصد":600,"هفتصد":700,"هشتصد":800,"نهصد":900}
KW = {"رأی","گرونی","بنزین","زن،","زندگی،","آزادی","خاموشی","اینترنت","سبز","صفر","مسدود","قطع","کشته","سکوت","حکومت"}
fa = lambda n: str(n).translate(str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹"))
strip = lambda w: re.sub(r"[ً-ْ«»،؛.…:!؟?]", "", w)
vo = json.load(open(sys.argv[1])); out = []
for line in sorted({w["line"] for w in vo["words"]}):
  ws = [w["w"] for w in vo["words"] if w["line"] == line]; words = []; i = 0
  while i < len(ws):
    b = strip(ws[i])
    if b in U and not (b == "یک" and i + 1 < len(ws) and strip(ws[i+1]) not in U and strip(ws[i+1]) != "هزار") or b == "هزار":
      j, tot, cur = i, 0, 0
      while j < len(ws):
        t = strip(ws[j])
        if t in U: cur += U[t]; j += 1
        elif t == "هزار": tot += max(cur, 1) * 1000; cur = 0; j += 1
        else: break
        if re.search(r"[\u060c\u061b.…:!؟«»]$", ws[j-1]): break
        t = strip(ws[j]) if j < len(ws) else ""
        if t == "و" and j + 1 < len(ws) and (strip(ws[j+1]) in U or strip(ws[j+1]) == "هزار"): j += 1; continue
        if t in U or t == "هزار": continue
        elif t == "و" and j + 1 < len(ws) and (strip(ws[j+1]) in U or strip(ws[j+1]) == "هزار"): j += 1
        else: break
      tail = re.sub(r"^[^،؛.…:!؟«»]*", "", ws[j-1])
      n = tot + cur
      nxt = strip(ws[j]) if j < len(ws) else ""
      if n <= 20 and j - i == 1 and not re.match(r"(دی‌ماه|دی‌ماهِ|خرداد|آبان|شهریور|دی)", nxt):
        words.append({"w": re.sub(r"[\u064e\u064f\u0650\u0651]", "", ws[i]), "kw": False, "tts": [i, i+1], "br": False}); i += 1; continue
      d = fa(f"{n:,}".replace(",", "٬")) if n >= 10000 or (n >= 1000 and not 1300 <= n <= 1500) else fa(n)
      words.append({"w": d + tail, "kw": True, "tts": [i, j], "br": False}); i = j
    else:
      words.append({"w": re.sub(r"[َُِّ]", "", ws[i]), "kw": strip(ws[i]) in {strip(k) for k in KW}, "tts": [i, i+1], "br": False}); i += 1
  # caption cards of ~3–4 words, breaking after punctuation
  c = 0
  for k, w in enumerate(words):
    c += 1
    if re.search(r"[،؛.…:!؟»]$", w["w"]) or c >= 4: w["br"] = True; c = 0
  out.append({"n": line, "words": words})
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False)
for l in out[:6] + out[23:25] + out[36:37]: print(l["n"], " ".join(("*" if w["kw"] else "") + w["w"] + ("/" if w["br"] else "") for w in l["words"]))
