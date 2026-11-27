# V66 · the store sells no chandeliers (user's note): after tools/v66-voice.py, cut «لوستر،» from line 11 and the whole
# line 12 («اول رفتم سراغِ بزرگ‌ترین لوستر. هیچی. برق نزد.») out of public/v66/vo.wav, and shift src/v66/vo.json to match.
# Cut points measured with silencedetect + a focused whisper pass on the tempo'd file.
# Usage: python3 tools/v66-voice.py && python3 tools/v66-cut.py
import json, subprocess
CUTS = [(45.33, 46.07), (47.47, 50.72)]
V = json.load(open("src/v66/vo.json"))
keep, t0 = [], 0.0
for a, b in CUTS: keep.append((t0, a)); t0 = b
keep.append((t0, V["total"] + 1))
f = "".join(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[k{i}];" for i, (a, b) in enumerate(keep))
f += "".join(f"[k{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/v66/vo.wav", "-filter_complex", f, "-map", "[o]", "-ac", "1", "public/v66/vo.cut.wav"], check=True)
subprocess.run(["mv", "public/v66/vo.cut.wav", "public/v66/vo.wav"], check=True)
def shift(t):
    d = 0.0
    for a, b in CUTS:
        if t >= b: d += b - a
        elif t > a: return a - d
    return t - d
words = [w for w in V["words"] if w["line"] != 12 and not (w["line"] == 11 and w["w"].startswith("لوستر"))]
for w in words: w["s"] = round(shift(w["s"]), 3); w["e"] = round(shift(w["e"]), 3)
V["words"] = words
V["segs"] = [{**s, "start": min(w["s"] for w in words if w["line"] == s["n"]), "end": max(w["e"] for w in words if w["line"] == s["n"]),
              "text": s["text"].replace(" لوستر،", "")} for s in V["segs"] if s["n"] != 12]
V["total"] = round(V["total"] - sum(b - a for a, b in CUTS), 3)
json.dump(V, open("src/v66/vo.json", "w"), ensure_ascii=False)
print("cut", V["total"], [ (s["n"], round(s["start"],2)) for s in V["segs"] if 10 <= s["n"] <= 14])
