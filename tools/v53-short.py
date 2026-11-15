# V53 · 30 s YouTube Short: four passages of the processed narration (public/v53/vo.wav, src/v53/vo.json) joined with
# short breaths → public/v53/vo-short.wav + src/v53/vo-short.json (lines renumbered 1…n). Usage: python3 tools/v53-short.py
import json, subprocess
V = json.load(open("src/v53/vo.json"))
RUNS = [(1, 1), (14, 15), (40, 41), (46, 47)]
GAP = [0.45, 0.55, 0.6]
seg = {s["n"]: s for s in V["segs"]}
pieces, words, segs, t, n = [], [], [], 0.0, 0
for k, (a, b) in enumerate(RUNS):
    s0, s1 = seg[a]["start"] - 0.1, seg[b]["end"] + 0.22
    if k: t += GAP[k - 1]; pieces.append(("z", GAP[k - 1]))
    pieces.append(("a", s0, s1))
    for ln in range(a, b + 1):
        n += 1
        for w in V["words"]:
            if w["line"] == ln: words.append({"w": w["w"], "s": round(w["s"] - s0 + t, 3), "e": round(w["e"] - s0 + t, 3), "line": n, "src": ln})
        segs.append({"n": n, "src": ln, "start": round(seg[ln]["start"] - s0 + t, 3), "end": round(seg[ln]["end"] - s0 + t, 3), "text": seg[ln]["text"]})
    t += s1 - s0
json.dump({"total": round(t, 3), "segs": segs, "words": words}, open("src/v53/vo-short.json", "w"), ensure_ascii=False)
f, lab = [], []
for i, p in enumerate(pieces):
    f.append(f"[0:a]atrim={p[1]:.3f}:{p[2]:.3f},asetpts=PTS-STARTPTS[p{i}]" if p[0] == "a" else f"anullsrc=r=48000:cl=mono,atrim=0:{p[1]:.3f}[p{i}]"); lab.append(f"[p{i}]")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "public/v53/vo.wav", "-filter_complex", ";".join(f) + ";" + "".join(lab) + f"concat=n={len(pieces)}:v=0:a=1[o]", "-map", "[o]", "-ac", "1", "public/v53/vo-short.wav"], check=True)
print("short", round(t, 2), "s ·", n, "lines"); [print(s["n"], s["start"], s["end"], s["text"][:40]) for s in segs]
