# V49 · user's voice (ElevenLabs Mark) → word timings (local faster-whisper words in videos/49/whisper.json aligned to
# the exact script videos/49/script.txt) → shorter pauses + tempo → public/v49/vo.wav + src/v49/vo.json
# Usage: python3 tools/v49-voice.py
import json, re, difflib, subprocess, os
TEMPO, SRC = 1.16, "uploads/v49-voice-mark.mp3"
DIA = re.compile(r"[ً-ْٰ]")
def norm(w): return re.sub(r"[^\w؀-ۿ]", "", DIA.sub("", w).replace("‌", "").replace("ي", "ی").replace("ك", "ک"))
text = " ".join(l.strip() for l in open("videos/49/script.txt", encoding="utf8") if l.strip())
sents = [s.strip() for s in re.split(r"(?<=[.؟!])\s+(?![^«]*»)", text) if s.strip()]
S = [(w, k) for k, s in enumerate(sents) for w in s.split()]
Wh = json.load(open("videos/49/whisper.json"))["words"]
a = [norm(w) for w, _ in S]; b = [norm(x["text"]) for x in Wh]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
t = [None] * len(S)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        for k in range(i2 - i1): t[i1 + k] = (Wh[j1 + k]["start"], Wh[j1 + k]["end"])
    elif op == "replace" and j2 > j1:
        s0, e0 = Wh[j1]["start"], Wh[j2 - 1]["end"]; n = i2 - i1
        L = [len(a[i1 + k]) + 1 for k in range(n)]; tot = sum(L); acc = 0
        for k in range(n):
            t[i1 + k] = (s0 + (e0 - s0) * acc / tot, s0 + (e0 - s0) * (acc + L[k]) / tot); acc += L[k]
for i in range(len(t)):
    if t[i] is None:
        p = next((t[j][1] for j in range(i - 1, -1, -1) if t[j]), 0.0)
        q = next((t[j][0] for j in range(i + 1, len(t)) if t[j]), p + 0.4)
        t[i] = (p, max(p + 0.05, min(q, p + 0.4)))
W = [{"w": w, "s": s, "e": e, "line": k + 1} for (w, k), (s, e) in zip(S, t)]
matched = sum(i2 - i1 for op, i1, i2, _, _ in sm.get_opcodes() if op == "equal")
# cut the middle of long pauses
head = max(0, W[0]["s"] - 0.12); segs = []; removed = []; a0 = head
for i in range(1, len(W)):
    g = W[i]["s"] - W[i - 1]["e"]; keep = 0.32 if W[i]["line"] != W[i - 1]["line"] else 0.2
    if g > keep + 0.05:
        c0, c1 = W[i - 1]["e"] + keep / 2, W[i]["s"] - keep / 2
        segs.append((a0, c0)); removed.append((c1, c1 - c0)); a0 = c1
last = W[-1]["e"] + 0.4; segs.append((a0, last))
def mp(x):
    r = head + sum(d for at, d in removed if x >= at); return (x - r) / TEMPO
words = [{"w": x["w"], "s": round(mp(x["s"]), 3), "e": round(mp(x["e"]), 3), "line": x["line"]} for x in W]
total = round((last - head - sum(d for _, d in removed)) / TEMPO, 3)
out = [{"n": n, "start": min(w["s"] for w in words if w["line"] == n), "end": max(w["e"] for w in words if w["line"] == n)} for n in range(1, len(sents) + 1)]
os.makedirs("src/v49", exist_ok=True); os.makedirs("public/v49", exist_ok=True)
json.dump({"total": total, "segs": out, "words": words}, open("src/v49/vo.json", "w"), ensure_ascii=False)
f = ";".join(f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS[a{i}]" for i, (s, e) in enumerate(segs))
f += ";" + "".join(f"[a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1,atempo={TEMPO},aresample=48000[o]"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex", f, "-map", "[o]", "-ac", "1", "public/v49/vo.wav"], check=True)
print(len(S), "script words ·", matched, "matched ·", len(sents), "lines · total", total)
for s in out: print(s["n"], round(s["start"], 2), sents[s["n"] - 1][:50])
