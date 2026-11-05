import json
from shapely.geometry import shape, Polygon, MultiPolygon, box, LineString, MultiLineString
from shapely.ops import unary_union
def load(p): return json.load(open(p))["features"]
c50 = {f["properties"]["ADM0_A3"]: shape(f["geometry"]) for f in load("ne50.geojson")}
c10 = {f["properties"]["ADM0_A3"]: shape(f["geometry"]) for f in load("ne10.geojson")}
def rings(g, tol, minarea=0):
    g = g.simplify(tol, preserve_topology=True)
    out = []
    polys = [g] if isinstance(g, Polygon) else list(getattr(g, "geoms", []))
    for p in polys:
        if not isinstance(p, Polygon) or p.area < minarea: continue
        out.append([[round(x, 3), round(y, 3)] for x, y in p.exterior.coords])
    return out
NA = ["CAN","USA","MEX","GTM","BLZ","HND","SLV","NIC","CRI","PAN"]
na = unary_union([c50[k] for k in NA if k in c50]).intersection(box(-170, 5, -50, 72))
SA = ["COL","VEN","ECU","PER","BRA","BOL","CHL","ARG","PRY","URY","GUY","SUR","GUF"]
sa = unary_union([c50[k] for k in SA if k in c50])
B = box(-84, 1, -70, 13.5)
pa = c10["PAN"].intersection(B); co = c10["COL"].intersection(B)
land = unary_union([pa.buffer(0.004), co.buffer(0.004)]).buffer(-0.004)
gap_hand = Polygon([(-78.45,8.95),(-77.9,9.15),(-77.3,8.95),(-76.85,8.45),(-76.75,7.95),(-76.95,7.3),(-77.35,6.95),(-77.9,7.05),(-78.35,7.6),(-78.5,8.3)])
import math
def organic(poly, step=0.025, amp=0.07, seed=3):
    cs = list(poly.exterior.coords)
    pts = []
    for (x0, y0), (x1, y1) in zip(cs[:-1], cs[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / step))
        for i in range(n):
            pts.append((x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n))
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    out = []
    N = len(pts)
    for i, (x, y) in enumerate(pts):
        a = 2 * math.pi * i / N
        r = amp * (0.55 * math.sin(a * 7 + seed) + 0.3 * math.sin(a * 13 + 2 * seed) + 0.15 * math.sin(a * 29 + 5))
        dx, dy = x - cx, y - cy; L = math.hypot(dx, dy)
        out.append((x + dx / L * r, y + dy / L * r))
    return Polygon(out).buffer(0.01).buffer(-0.01)
gap = organic(gap_hand).intersection(land)
# shared border Panama/Colombia
bd = c10["PAN"].boundary.intersection(c10["COL"].buffer(0.003)).intersection(B)
lines = [list(bd.coords)] if isinstance(bd, LineString) else [list(l.coords) for l in getattr(bd, "geoms", []) if isinstance(l, LineString)]
lines = [l for l in lines if len(l) > 3]
border = [[[round(x,4), round(y,4)] for x, y in LineString(l).simplify(0.003).coords] for l in lines]
riv = []
RB = box(-80, 5, -75, 10.2)
for f in load("rivers.geojson"):
    g = shape(f["geometry"]).intersection(RB)
    if g.is_empty: continue
    ls = [g] if isinstance(g, LineString) else [x for x in getattr(g, "geoms", []) if isinstance(x, LineString)]
    for l in ls:
        if l.length < 0.15: continue
        riv.append({"n": f["properties"].get("name") or "", "p": [[round(x,3), round(y,3)] for x, y in l.simplify(0.004).coords]})
out = {
  "na": rings(na, 0.12, 0.5), "sa": rings(sa, 0.12, 0.5),
  "pa": rings(pa, 0.006, 0.002), "co": rings(co, 0.006, 0.002),
  "gap": rings(gap, 0.004, 0.001), "border": border, "rivers": riv,
}
json.dump(out, open("/home/user/Hamoon/src/v34/geo.json", "w"), separators=(",", ":"))
print({k: (len(v), sum(len(r if isinstance(r, list) else r["p"]) for r in v)) for k, v in out.items()})
print("rivers", sorted(set(r["n"] for r in riv)))
print("border", [ (l[0], l[-1]) for l in border])
