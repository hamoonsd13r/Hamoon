import json, math, shapefile
from shapely.geometry import shape, Polygon, MultiPolygon, box
from shapely.ops import unary_union
from PIL import Image, ImageDraw
def rings(g, tol, minarea=0.0):
    g = g.simplify(tol, preserve_topology=True)
    ps = [g] if isinstance(g, Polygon) else list(getattr(g, "geoms", []))
    return [[[round(x, 4), round(y, 4)] for x, y in p.exterior.coords] for p in ps if isinstance(p, Polygon) and p.area >= minarea]
st = {}
for f in json.load(open("states50.geojson"))["features"]:
    p = f["properties"]
    if p.get("iso_a2") == "US": st[p["postal"]] = shape(f["geometry"])
print(len(st), "states")
cont = {k: v for k, v in st.items() if k not in ("DC",)}
# centroids of the 50 states (for two senators each); AK/HI included
cent = {k: [round(v.representative_point().x, 3), round(v.representative_point().y, 3)] for k, v in cont.items()}
sf = shapefile.Reader("cd/cb_2023_us_cd118_500k")
flds = [f[0] for f in sf.fields[1:]]
ny, wy, allcd = [], None, []
for sr in sf.iterShapeRecords():
    r = dict(zip(flds, sr.record)); g = shape(sr.shape.__geo_interface__)
    if r["STATEFP"] == "36": ny.append((int(r["CD118FP"]), g))
    if r["STATEFP"] == "56": wy = g
    if r["STATEFP"] not in ("02", "15", "72", "60", "66", "69", "78"): allcd.append(g)
ny.sort()
out = {
  "states": {k: rings(v, 0.03, 0.05) for k, v in cont.items()},
  "cent": cent,
  "NY": rings(st["NY"], 0.006, 0.01), "WY": rings(st["WY"], 0.006, 0.01),
  "nyd": [{"n": n, "r": rings(g, 0.004, 0.0005), "c": [round(g.representative_point().x, 3), round(g.representative_point().y, 3)]} for n, g in ny],
  "dc": [[-77.1198, 38.9343], [-77.0417, 38.9955], [-76.9094, 38.8929], [-77.0390, 38.7916], [-77.0390, 38.8370], [-77.0560, 38.8800], [-77.0820, 38.9040], [-77.1198, 38.9343]],
}
json.dump(out, open("/home/user/Hamoon/src/v35/geo.json", "w"), separators=(",", ":"))
print("ny districts", len(ny), "size", len(json.dumps(out)))
# static white-line overlays in the Mercator frame of US.jpg (lon -128..-64, lat 22..52, 3840x2312)
R = 6378137.0
def my(lat): return math.log(math.tan(math.pi/4 + math.radians(lat)/2))
def overlay(geoms, fn, lw, col):
    W, H = 3840, 2312; S = 2
    im = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    Y1, Y0 = my(52), my(22)
    def P(x, y): return ((x + 128) / 64 * W * S, (Y1 - my(y)) / (Y1 - Y0) * H * S)
    for g in geoms:
        g = g.simplify(0.01, preserve_topology=True)
        ps = [g] if isinstance(g, Polygon) else list(getattr(g, "geoms", []))
        for p in ps:
            if not isinstance(p, Polygon): continue
            d.line([P(x, y) for x, y in p.exterior.coords], fill=col, width=lw * S, joint="curve")
    im.resize((W, H), Image.LANCZOS).save(fn)
overlay(allcd, "/home/user/Hamoon/public/v35/districts.png", 2, (255, 255, 255, 210))
overlay(list(cont.values()), "/home/user/Hamoon/public/v35/states.png", 3, (255, 255, 255, 235))
print("overlays ok")
