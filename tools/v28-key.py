# Green-screen key for V28 character poses -> trimmed transparent PNG (+ anchor json)
import sys, json, os, numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
meta = {}
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'): continue
    im = np.asarray(Image.open(os.path.join(src, f)).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    spill = g - np.maximum(r, b)              # how "green" a pixel is
    a = 1 - np.clip((spill - 40) / 80, 0, 1)  # >120 -> transparent, <40 -> opaque
    # despill: clamp green to max(r,b) where green dominates
    g2 = np.where(spill > 0, np.maximum(r, b) + np.clip(spill, 0, 0) , g)
    out = np.dstack([r, g2, b, a * 255]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')
    al = img.split()[3].filter(ImageFilter.MinFilter(3))  # shave 1px green fringe
    img.putalpha(al)
    bbox = img.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()
    pad = 6
    bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(img.width, bbox[2]+pad), min(img.height, bbox[3]+pad))
    img = img.crop(bbox)
    img.save(os.path.join(dst, f), optimize=True)
    meta[f[:-4]] = {"w": img.width, "h": img.height}
json.dump(meta, open(os.path.join(dst, 'meta.json'), 'w'), indent=0)
print(len(meta), 'keyed')
