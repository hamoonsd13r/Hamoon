# V03 · horror bed + foley synthesised with numpy (no credits, no licences). Usage: python3 synth.py <events.json> <outdir>
# events.json: { "dur": 30.7, "bells": [..], "ticks": [..], "steps": [..], "sting": [..], "boom": [..], "heart": [from, to], "eerie": [from, to] }
import json, sys, wave, numpy as np
SR = 44100
ev = json.load(open(sys.argv[1])); out = sys.argv[2]
rng = np.random.default_rng(7)

def save(name, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.89, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def lp(x, k):  # one-pole low-pass, k in (0,1)
    y = np.zeros_like(x); a = 0.0
    for i in range(len(x)): a += k * (x[i] - a); y[i] = a
    return y

def lp_fast(x, n):  # moving average (cheap low-pass)
    c = np.cumsum(np.concatenate([np.zeros(n), x])); return (c[n:] - c[:-n]) / n

def reverb(x, secs=2.2, wet=0.35):
    n = int(SR * secs); ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n)); ir = lp_fast(ir, 6)
    y = np.convolve(x, ir)[: len(x) + n] * (wet / np.sqrt(np.sum(ir ** 2)) * 0.06)
    z = np.zeros(len(y)); z[: len(x)] += x; return z + y

D = ev["dur"]; N = int(D * SR); t = np.arange(N) / SR

# ── music bed ───────────────────────────────────────────────────────────────
bed = np.zeros(N)
lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t)
for f, a in [(55, 0.5), (58.3, 0.35), (82.4, 0.22), (110, 0.12)]:  # A1 + Bb1 rub + E2
    bed += a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.11 * t)) * lfo
wind = lp_fast(rng.standard_normal(N), 180) * 6
bed += wind * (0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t + 1))
# slow dissonant pad that swells in the second half
pad = sum(np.sin(2 * np.pi * f * t) for f in (220, 233.1, 329.6)) * 0.08
bed += pad * np.clip((t - 8) / 10, 0, 1)
# eerie high tone (glass harmonic) while the old man talks
e0, e1 = ev["eerie"]
env = np.clip((t - e0) / 1.5, 0, 1) * np.clip((e1 - t) / 0.3, 0, 1)
bed += 0.09 * np.sin(2 * np.pi * (1318 + 6 * np.sin(2 * np.pi * 5.5 * t)) * t) * env
bed += 0.05 * np.sin(2 * np.pi * (1396 + 5 * np.sin(2 * np.pi * 4.7 * t)) * t) * env
# heartbeat
h0, h1 = ev["heart"]; hb = 0.0
beat = lambda f0, dec: np.sin(2 * np.pi * f0 * np.arange(int(0.25 * SR)) / SR) * np.exp(-np.arange(int(0.25 * SR)) / SR * dec)
k = h0; rate = 1.0
while k < h1:
    for off, amp in [(0, 1.0), (0.22, 0.65)]:
        i = int((k + off) * SR); b = beat(48, 18) * amp * 0.9
        if i + len(b) < N: bed[i:i + len(b)] += b
    rate = min(1.6, rate + 0.06); k += 1 / rate
# fade in, cut into the end card (the boom carries it)
bed *= np.clip(t / 1.2, 0, 1) * np.clip((ev["boom"][0] + 0.05 - t) / 0.25, 0, 1)
bed = reverb(bed, 2.5, 0.25)[:N]
save("music", bed)

# ── foley ─────────────────────────────────────────────────────────────────
def bell():
    n = int(2.4 * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for start, f in [(0, 659.3), (0.42, 523.3)]:
        s = tt - start; m = s >= 0
        for h, a in [(1, 1), (2.76, 0.35), (5.4, 0.18), (8.9, 0.07)]:
            x[m] += a * np.sin(2 * np.pi * f * h * s[m]) * np.exp(-s[m] * (2.2 + h))
    return reverb(x, 1.2, 0.3)
save("bell", bell())

def tick():
    n = int(0.12 * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n) * np.exp(-tt * 260) + 0.6 * np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 180)
    return reverb(x, 0.4, 0.2)
save("tick", tick())

def step():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    x = lp_fast(rng.standard_normal(n), 40) * 8 * np.exp(-tt * 30) + 0.5 * np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 25)
    return reverb(x, 0.6, 0.25)
save("step", step())

def sting():  # low hit + reversed swell tail
    n = int(3 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (60 - 20 * tt) * tt) * np.exp(-tt * 2.2) + lp_fast(rng.standard_normal(n), 12) * 2 * np.exp(-tt * 6)
    x += 0.25 * sum(np.sin(2 * np.pi * f * tt) for f in (880, 932.3)) * np.exp(-tt * 1.4)
    return reverb(x, 2.0, 0.4)
save("sting", sting())

def boom():
    n = int(4 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * (52 - 16 * tt) * tt) * np.exp(-tt * 1.3) + lp_fast(rng.standard_normal(n), 30) * 4 * np.exp(-tt * 4)
    return reverb(x, 3.0, 0.45)
save("boom", boom())
print("ok")
