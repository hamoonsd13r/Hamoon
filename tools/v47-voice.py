# V47 · from videos/47/stt.json (script words + local whisper times, tools/v47-align.py):
#  1. caption tokens: spoken years/dates become digits («هزار و نهصد و سی‌وسه» → 1933, «سی‌اُمِ آوریل» → 30 آوریل)
#  2. YouTube voice: long pauses shortened + tempo → public/v47/vo.wav + src/v47/vo.json
#  3. Instagram reel: chosen sentences joined (~60 s) → public/v47/vo-reel.wav + src/v47/vo-reel.json
# Usage: python3 tools/v47-voice.py
import json, re, subprocess, os
D = json.load(open("videos/47/stt.json")); WS = D["words"]; SENTS = D["sents"]
SRC = "uploads/v47/narration.mp3"
U = {"یک": 1, "یکم": 1, "دو": 2, "دوم": 2, "سه": 3, "سوم": 3, "چهار": 4, "چهارم": 4, "پنج": 5, "پنجم": 5, "شش": 6, "ششم": 6, "هفت": 7, "هفتم": 7, "هشت": 8, "هشتم": 8, "نه": 9, "نهم": 9}
T = {"ده": 10, "دهم": 10, "یازده": 11, "یازدهم": 11, "دوازده": 12, "دوازدهم": 12, "سیزده": 13, "سیزدهم": 13, "چهارده": 14, "پانزده": 15, "پانزدهم": 15, "شانزده": 16, "شانزدهم": 16, "هفده": 17, "هجده": 18, "هجدهم": 18, "نوزده": 19, "نوزدهم": 19}
X = {"بیست": 20, "بیستم": 20, "سی": 30, "سیام": 30, "چهل": 40, "پنجاه": 50, "شصت": 60, "هفتاد": 70, "هشتاد": 80, "نود": 90}
H = {"صد": 100, "هشتصد": 800, "نهصد": 900}
MONTHS = {"ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"}
def bare(w): return re.sub(r"[ً-ْٰ.،؛؟!…«»:]", "", w).replace("ِ", "")
def parts(w):  # a word like «بیست‌وهفتمِ» → [20, 7]; None if not a number word
    b = bare(w).replace("ی", "ی")
    b = re.sub(r"ی$", "", b) if b.endswith("ی") and b[:-1] in ("ژانویه",) else b
    out = []
    for p in re.split(r"‌و|‌", b):
        p = p.replace("اُم", "ام")
        if p in ("", "ام"): continue
        v = U.get(p) or T.get(p) or X.get(p) or H.get(p) or (1000 if p == "هزار" else None)
        if v is None: return None
        out.append(v)
    return out or None
def ordinal(w): b = bare(w); return b.endswith("م") or b.endswith("ام")
def place(v): return 1000 if v >= 1000 else 100 if v >= 100 else 10 if v >= 20 else 1
toks = []  # caption tokens
i = 0
while i < len(WS):
    w = WS[i]; p = parts(w["text"])
    if p is None or bare(w["text"]) in ("و",):
        toks.append({"w": bare(w["text"]) if False else re.sub(r"[ً-ْٰ]", "", w["text"]), "s": w["start"], "e": w["end"], "line": w["sent"] + 1}); i += 1; continue
    # grow a number phrase: parts joined by «و», places strictly falling, stop after a unit/teen
    seq, j, last = list(p), i + 1, place(p[-1]) if p[-1] >= 20 or p[-1] >= 100 else 0
    def ok_next(prev, nxt): return prev and nxt and place(nxt[0]) < place(prev[-1]) and prev[-1] >= 20 and not (prev[-1] < 20)
    while j + 1 < len(WS) and bare(WS[j]["text"]) == "و" and WS[j]["sent"] == w["sent"]:
        nx = parts(WS[j + 1]["text"])
        if nx is None or not (seq[-1] >= 20 and place(nx[0]) < place(seq[-1])): break
        seq += nx; j += 2
    val = sum(seq) if 1000 not in seq else 1000 + sum(x for x in seq if x != 1000)
    nxt_word = re.sub("\u200cی$", "", bare(WS[j]["text"])) if j < len(WS) else ""
    is_year = 1000 in seq
    is_date = ordinal(WS[j - 1]["text"]) and (nxt_word in MONTHS or nxt_word in ("و", "به"))
    if is_year or is_date or len(seq) >= 2 and bare(WS[j - 1]["text"]) not in ("سه‌ونیم",):
        if not is_year and not is_date and not (len(seq) >= 2): pass
        punct = re.findall(r"[.،؛؟!…]+$", WS[j - 1]["text"])
        toks.append({"w": str(val) + (punct[0] if punct else ""), "s": w["start"], "e": WS[j - 1]["end"], "line": w["sent"] + 1}); i = j
    else:
        toks.append({"w": re.sub(r"[ً-ْٰ]", "", w["text"]), "s": w["start"], "e": w["end"], "line": w["sent"] + 1}); i += 1
# keep spoken forms where digits read worse
for t in toks:
    if t["w"] in ("1", "2") and False: pass

def build(keep_sents, wav, js, tempo, lead=0.1, gap_line=0.5, gap_word=0.32, between=0.55):
    keep_sents = list(keep_sents)
    tk = [t for t in toks if t["line"] - 1 in keep_sents]
    # source intervals to keep: per sentence, cut long pauses inside; join sentences with a fixed gap
    keep = []
    for k, sn in enumerate(keep_sents):
        ws = [t for t in tk if t["line"] - 1 == sn]
        a = max(0, ws[0]["s"] - lead)
        for x, y in zip(ws, ws[1:]):
            g = y["s"] - x["e"]
            if g > gap_word:
                keep.append([a, x["e"] + min(0.14, gap_word / 2)]); a = y["s"] - (gap_word - min(0.14, gap_word / 2))
        keep.append([a, ws[-1]["e"] + 0.16])
        if k + 1 < len(keep_sents):
            nxt = [t for t in tk if t["line"] - 1 == keep_sents[k + 1]][0]
            contiguous = keep_sents[k + 1] == sn + 1
            g = nxt["s"] - ws[-1]["e"]
            target = min(g, gap_line) if contiguous else between
            keep[-1][1] = ws[-1]["e"] + min(0.16, target / 2) if contiguous and g <= gap_line else keep[-1][1]
            if contiguous and g <= gap_line: keep[-1][1] = nxt["s"] - 0.02 if g < 0.05 else keep[-1][1]
    keep[-1][1] += 0.5
    # merge touching intervals
    m = []
    for x in keep:
        if m and x[0] <= m[-1][1] + 0.001: m[-1][1] = max(m[-1][1], x[1])
        else: m.append(list(x))
    keep = m
    def mp(t):
        acc = 0
        for x, y in keep:
            if t <= y: return (acc + max(0, t - x)) / tempo
            acc += y - x
        return acc / tempo
    parts_ = ";".join(f"[0:a]atrim={x:.3f}:{y:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={max(0,y-x-0.02):.3f}:d=0.02[p{i}]" for i, (x, y) in enumerate(keep))
    cat = "".join(f"[p{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1,atempo={tempo}[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex", parts_ + ";" + cat, "-map", "[out]", "-ar", "48000", "-ac", "1", wav], check=True)
    real = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
    k = real / mp(keep[-1][1])
    ren = {sn: n + 1 for n, sn in enumerate(keep_sents)}
    words = [{"w": t["w"], "s": round(mp(t["s"]) * k, 3), "e": round(mp(t["e"]) * k, 3), "line": ren[t["line"] - 1], "src": t["line"]} for t in tk]
    segs = []
    for n in range(1, len(keep_sents) + 1):
        ws = [w for w in words if w["line"] == n]; segs.append({"n": n, "sp": "A", "start": ws[0]["s"], "end": ws[-1]["e"], "src": keep_sents[n - 1] + 1})
    json.dump({"total": round(real, 3), "segs": segs, "words": words}, open(js, "w"), ensure_ascii=False)
    print(js, "total", round(real, 2), "s ·", len(segs), "lines")
    return words, segs
os.makedirs("public/v47", exist_ok=True); os.makedirs("src/v47", exist_ok=True)
w, s = build(range(len(SENTS)), "public/v47/vo.wav", "src/v47/vo.json", 1.06)
for x in s: print(x["n"], f'{x["start"]:.1f}', " ".join(t["w"] for t in w if t["line"] == x["n"])[:90])
REEL = [0, 1, 2, 3, 4, 5, 36, 38, 49, 50, 51, 56, 69, 70]
w, s = build(REEL, "public/v47/vo-reel.wav", "src/v47/vo-reel.json", 1.12)
for x in s: print("R", x["n"], f'{x["start"]:.1f}', " ".join(t["w"] for t in w if t["line"] == x["n"])[:90])
