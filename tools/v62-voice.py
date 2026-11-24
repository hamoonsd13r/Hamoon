# V62 · narration alignment (adapted from tools/v53-voice.py): uploads/v62-voice.mp3 (ElevenLabs Mark) + local whisper
# word timings → aligned to videos/62-fohsh/script.txt (one caption line per line) → public/v62/vo.wav + src/v62/vo.json
# Usage: python3 tools/v62-voice.py
import json, re, difflib, subprocess, os
TEMPO, SRC = 1.15, "uploads/v62-voice.mp3"
IN_LINE, BETWEEN = 0.2, 0.27
EXTRA = {4: 0.25, 9: 0.2, 16: 0.25, 21: 0.3, 29: 0.25, 38: 0.2, 44: 0.25, 50: 0.3}  # pause AFTER line n (s, before tempo)
DIA = re.compile(r"[ً-ْٰ]")
def norm(w): return re.sub(r"[^\w؀-ۿ]", "", DIA.sub("", w).replace("‌", "").replace("ي", "ی").replace("ك", "ک").replace("ئ", "ع"))
sents = [l.strip() for l in open("videos/62-fohsh/script.txt", encoding="utf8") if l.strip()]
S = [(w, k) for k, s in enumerate(sents) for w in s.split()]
Wh = json.load(open("videos/62-fohsh/whisper.json"))["words"]
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
# real pauses come from silencedetect (whisper word edges swallow them); each pause is shortened (or, at a few
# emotional moments, lengthened) to a target: IN_LINE inside a line, BETWEEN (+EXTRA) at a line boundary
r = subprocess.run(["ffmpeg", "-i", SRC, "-af", "silencedetect=n=-38dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
SIL = [(float(e) - float(d), float(e)) for e, d in re.findall(r"silence_end: ([0-9.]+) \| silence_duration: ([0-9.]+)", r)]
for x in W:  # snap word edges out of real silences
    for s0, s1 in SIL:
        if s0 <= x["s"] < s1: x["s"] = s1
        if s0 < x["e"] <= s1: x["e"] = s0
        if x["s"] - 0.2 <= s0 and s1 < x["e"]:  # a pause swallowed by one long word
            if (s0 + s1) / 2 < (x["s"] + x["e"]) / 2: x["s"] = s1
            else: x["e"] = s0
    if x["e"] <= x["s"]: x["e"] = x["s"] + 0.05
bounds = [(W[i - 1]["e"], W[i]["s"], W[i - 1]["line"]) for i in range(1, len(W)) if W[i]["line"] != W[i - 1]["line"]]
END = W[-1]["e"] + 0.35
pieces = []; a0 = 0.0
for s0, s1 in SIL:
    if s1 >= END: break
    ln = next((l for e, st, l in bounds if s0 - 0.3 <= (e + st) / 2 <= s1 + 0.3), None)
    keep = BETWEEN + EXTRA.get(ln, 0) if ln else IN_LINE
    if ln == 1 or s0 < 0.3: keep = max(keep, 0.32)
    g = s1 - s0
    if g > keep: c0, c1 = s0 + keep / 2, s1 - keep / 2; pieces.append(("a", a0, c0)); a0 = c1
    elif ln and keep - g > 0.08: c = (s0 + s1) / 2; pieces.append(("a", a0, c)); pieces.append(("z", keep - g)); a0 = c
    bounds = [b for b in bounds if b[2] != ln] if ln else bounds
pieces.append(("a", a0, END))
def mp(x):
    o = 0.0
    for p in pieces:
        if p[0] == "z": o += p[1]; continue
        if x <= p[2]: return (o + max(0.0, x - p[1])) / TEMPO
        o += p[2] - p[1]
    return o / TEMPO
out = sum((p[2] - p[1]) if p[0] == "a" else p[1] for p in pieces)
words = [{"w": x["w"], "s": round(mp(x["s"]), 3), "e": round(mp(x["e"]), 3), "line": x["line"]} for x in W]
total = round(out / TEMPO, 3)
segs = [{"n": n, "start": min(w["s"] for w in words if w["line"] == n), "end": max(w["e"] for w in words if w["line"] == n), "text": sents[n - 1]} for n in range(1, len(sents) + 1)]
os.makedirs("src/v62", exist_ok=True); os.makedirs("public/v62", exist_ok=True)
json.dump({"total": total, "segs": segs, "words": words}, open("src/v62/vo.json", "w"), ensure_ascii=False)
f = []; lab = []
for i, p in enumerate(pieces):
    if p[0] == "a": f.append(f"[0:a]atrim={p[1]:.3f}:{p[2]:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=44100:channel_layouts=mono[p{i}]")
    else: f.append(f"anullsrc=r=44100:cl=mono,atrim=0:{p[1]:.3f}[p{i}]")
    lab.append(f"[p{i}]")
fc = ";".join(f) + ";" + "".join(lab) + f"concat=n={len(pieces)}:v=0:a=1,atempo={TEMPO},aresample=48000[o]"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", SRC, "-filter_complex", fc, "-map", "[o]", "-ac", "1", "public/v62/vo.wav"], check=True)
print(len(S), "script words ·", matched, "matched ·", len(sents), "lines · total", total)
for i, s in enumerate(segs): print(s["n"], round(s["start"], 2), round(s["end"], 2), "gap", round(s["start"] - segs[i-1]["end"], 2) if i else "", s["text"][:30])
# ── manual anchors measured on public/v62/vo.wav (focused whisper pass on 15–30 s): lines 5–7
def refit(line, s0, e0):
    ws = [w for w in words if w["line"] == line]; a, b = ws[0]["s"], ws[-1]["e"]
    for w in ws: w["s"] = round(s0 + (w["s"] - a) * (e0 - s0) / max(1e-3, b - a), 3); w["e"] = round(s0 + (w["e"] - a) * (e0 - s0) / max(1e-3, b - a), 3)
refit(5, 16.32, 21.0); refit(6, 21.3, 23.4); refit(7, 23.62, 27.8)
segs = [{"n": n, "start": min(w["s"] for w in words if w["line"] == n), "end": max(w["e"] for w in words if w["line"] == n), "text": sents[n - 1]} for n in range(1, len(sents) + 1)]
json.dump({"total": total, "segs": segs, "words": words}, open("src/v62/vo.json", "w"), ensure_ascii=False)
print("anchors applied", segs[4]["start"], segs[5]["start"], segs[6]["start"])
