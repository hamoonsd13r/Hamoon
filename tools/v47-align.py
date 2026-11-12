# V47 · word timings without ElevenLabs credits: local faster-whisper words (videos/47/whisper.json) aligned to the
# exact script (videos/47/script.txt) → videos/47/stt.json in Scribe format (script spelling, whisper times).
# Usage: python3 tools/v47-align.py
import json, re, difflib
DIA = re.compile(r"[ً-ْٰ]")
def norm(w): return re.sub(r"[^\w؀-ۿ]", "", DIA.sub("", w).replace("‌", "").replace("ي", "ی").replace("ك", "ک"))
lines = [l.strip() for l in open("videos/47/script.txt", encoding="utf8") if l.strip()]
# one caption line per sentence: split lines at . ؟ ! ; (keep the mark on the word)
sents = []
for l in lines:
    for s in re.split(r"(?<=[.؟!؛])\s+", l):
        s = s.strip()
        if s: sents.append(s)
S = [(DIA.sub("", w), k) for k, s in enumerate(sents) for w in s.split()]
Wh = json.load(open("videos/47/whisper.json"))["words"]
a = [norm(w) for w, _ in S]; b = [norm(x["text"]) for x in Wh]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t = [None] * len(S)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        for k in range(i2 - i1): t[i1 + k] = (Wh[j1 + k]["start"], Wh[j1 + k]["end"])
    elif op == "replace" and j2 > j1:
        # spread the script words over the whisper span (numbers, ASR misspellings)
        s0, e0 = Wh[j1]["start"], Wh[j2 - 1]["end"]; n = i2 - i1
        L = [len(a[i1 + k]) + 1 for k in range(n)]; tot = sum(L); acc = 0
        for k in range(n):
            t[i1 + k] = (s0 + (e0 - s0) * acc / tot, s0 + (e0 - s0) * (acc + L[k]) / tot); acc += L[k]
# fill words whisper skipped: between neighbours
for i in range(len(t)):
    if t[i] is None:
        p = next((t[j][1] for j in range(i - 1, -1, -1) if t[j]), 0.0)
        q = next((t[j][0] for j in range(i + 1, len(t)) if t[j]), p + 0.4)
        t[i] = (p, max(p + 0.05, min(q, p + 0.4)))
matched = sum(1 for op in sm.get_opcodes() if op[0] == "equal" for _ in range(op[2] - op[1]))
words = []
for (w, k), (s, e) in zip(S, t):
    words.append({"text": w, "start": round(s, 3), "end": round(e, 3), "type": "word", "sent": k})
json.dump({"words": words, "sents": sents}, open("videos/47/stt.json", "w"), ensure_ascii=False)
print(len(S), "script words ·", matched, "matched exactly ·", len(sents), "sentences")
