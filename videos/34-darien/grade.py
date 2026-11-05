import numpy as np, sys
from PIL import Image, ImageFilter
Image.MAX_IMAGE_PIXELS = None
def grade_bm(src, dst):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    water = np.clip((b - np.maximum(r, g) - 0.04) * 8, 0, 1)
    water = np.asarray(Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    lum = 0.3 * r + 0.55 * g + 0.15 * b
    # teal, darker water (like the reference): keep the bathymetry relief as luminance
    wr = 0.04 + lum * 0.33; wg = 0.11 + lum * 0.68; wb = 0.15 + lum * 0.74
    W = np.stack([wr, wg, wb], -1) * 0.92
    # land: a little more contrast + saturation
    m = a.mean(-1, keepdims=True)
    L = np.clip(m + (a - m) * 1.25, 0, 1)
    L = np.clip((L - 0.5) * 1.08 + 0.5 + 0.01, 0, 1)
    out = W * water[..., None] + L * (1 - water[..., None])
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(dst, quality=90)
def grade_s2(src, dst):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
    m = a.mean(-1, keepdims=True)
    L = np.clip(m + (a - m) * 1.45, 0, 1)
    L = np.clip((L - 0.35) * 1.35 + 0.37, 0, 1)
    Image.fromarray((L * 255).astype(np.uint8)).save(dst, quality=90)
for s in sys.argv[1:]:
    src, dst = s.split(":")
    (grade_s2 if "F_" in src else grade_bm)(src, dst)
