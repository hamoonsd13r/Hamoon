# V27 narration: Microsoft Farid (fa-IR) via edge-tts, line by line, with word timings → public/v27/vo.wav + src/v27/vo.json
# (ElevenLabs credit was used up for the month.) Run: python3 tools/v27-voice.py [rate]
import asyncio, json, os, subprocess, sys, certifi
certifi.where = lambda: os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
import edge_tts

VOICE, RATE, GAP = "fa-IR-FaridNeural", (sys.argv[1] if len(sys.argv) > 1 else "+12%"), 0.16
lines = json.load(open("src/v27/script.json"))
os.makedirs("out/v27/vo", exist_ok=True)

async def one(i, text):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    audio, words = b"", []
    async for ch in c.stream():
        if ch["type"] == "audio": audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    open(f"out/v27/vo/{i:02d}.mp3", "wb").write(audio)
    return words

async def main():
    segs, allw, t, parts = [], [], 0.25, []
    for i, text in enumerate(lines, 1):
        words = await one(i, text)
        mp3 = f"out/v27/vo/{i:02d}.mp3"
        # trim leading/trailing silence, keep timings relative to trimmed start
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "48000", "-ac", "1", f"out/v27/vo/{i:02d}.wav"], check=True)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"out/v27/vo/{i:02d}.wav"]))
        lead = max(0.0, words[0]["s"] - 0.04)
        end = min(dur, words[-1]["e"] + 0.12)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"out/v27/vo/{i:02d}.wav", "-ss", f"{lead:.3f}", "-to", f"{end:.3f}", f"out/v27/vo/{i:02d}t.wav"], check=True)
        for w in words:
            allw.append({"w": w["w"], "s": round(t + w["s"] - lead, 3), "e": round(t + w["e"] - lead, 3), "line": i})
        segs.append({"n": i, "text": text, "start": round(t, 3), "end": round(t + end - lead, 3)})
        parts.append((f"out/v27/vo/{i:02d}t.wav", t))
        t += end - lead + GAP
    total = round(t + 0.2, 3)
    # place every line at its time on a silent bed
    inputs, filt = [], []
    for k, (p, at) in enumerate(parts):
        inputs += ["-i", p]
        filt.append(f"[{k}]adelay={int(at*1000)}|{int(at*1000)}[a{k}]")
    filt.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[o]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[o]", "-t", str(total), "public/v27/vo.wav"], check=True)
    json.dump({"total": total, "segs": segs, "words": allw}, open("src/v27/vo.json", "w"), ensure_ascii=False, indent=0)
    print(f"{len(segs)} lines, {len(allw)} words, total {total}s")

asyncio.run(main())
