import sys, json, subprocess, numpy as np, torch
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForCTC
from huggingface_hub import hf_hub_download
M = "facebook/wav2vec2-lv-60-espeak-cv-ft"
proc = Wav2Vec2FeatureExtractor.from_pretrained(M); voc = {v:k for k,v in json.load(open(hf_hub_download(M,"vocab.json"))).items()}; model = Wav2Vec2ForCTC.from_pretrained(M).eval()
def load(p, t0=None, t1=None):
    cmd = ["ffmpeg", "-v", "error", "-i", p]
    if t0 is not None: cmd += ["-ss", str(t0), "-to", str(t1)]
    cmd += ["-ac", "1", "-ar", "16000", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.check_output(cmd), dtype=np.float32)
for arg in sys.argv[1:]:
    p, needle = arg.split("::")
    al = json.load(open(p[:-4] + ".json"))["alignment"]; ch = "".join(al["characters"])
    a = ch.find("شکاف"); i = ch.find(needle, a)
    t0 = al["character_start_times_seconds"][a] - 0.05; t1 = al["character_end_times_seconds"][i + len(needle) - 1] + 0.15
    x = load(p, t0, t1)
    inp = proc(x, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad(): ids = model(inp.input_values).logits.argmax(-1)
    seq=ids[0].tolist(); out=[]; prev=None
    for t in seq:
        if t!=prev and voc[t] not in ("<pad>","<s>","</s>","<unk>"): out.append(voc[t])
        prev=t
    print(p.split("/")[-3] + "/" + p.split("/")[-1], "|", " ".join(out))
