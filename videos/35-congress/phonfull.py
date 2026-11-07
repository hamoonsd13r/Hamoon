import sys, json, subprocess, numpy as np, torch
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForCTC
from huggingface_hub import hf_hub_download
M = "facebook/wav2vec2-lv-60-espeak-cv-ft"
fe = Wav2Vec2FeatureExtractor.from_pretrained(M); model = Wav2Vec2ForCTC.from_pretrained(M).eval()
voc = {v: k for k, v in json.load(open(hf_hub_download(M, "vocab.json"))).items()}
for p in sys.argv[1:]:
    x = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"]), dtype=np.float32)
    with torch.no_grad(): ids = model(fe(x, sampling_rate=16000, return_tensors="pt").input_values).logits.argmax(-1)[0].tolist()
    out = []; prev = None
    for t in ids:
        if t != prev and voc[t] not in ("<pad>", "<s>", "</s>", "<unk>"): out.append(voc[t])
        prev = t
    print(p.split("/")[-1], "|", "".join(out))
