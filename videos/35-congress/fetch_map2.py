import math, sys, io, urllib.request, json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
R = 6378137.0
def mx(lon): return R * math.radians(lon)
def my(lat): return R * math.log(math.tan(math.pi/4 + math.radians(lat)/2))
def fetch(url):
    for a in range(5):
        try:
            return Image.open(io.BytesIO(urllib.request.urlopen(url, timeout=120).read())).convert("RGB")
        except Exception as e:
            print("retry", e, file=sys.stderr)
    raise SystemExit("fail " + url)
def build(name, src, lon0, lon1, lat0, lat1, ppd, tile=2000):
    W = round((lon1 - lon0) * ppd)
    H = round((my(lat1) - my(lat0)) / (mx(1) - mx(0)) * ppd)
    X0, X1, Y0, Y1 = mx(lon0), mx(lon1), my(lat0), my(lat1)
    out = Image.new("RGB", (W, H))
    for ty in range(0, H, tile):
        for tx in range(0, W, tile):
            w, h = min(tile, W - tx), min(tile, H - ty)
            bx0 = X0 + (X1 - X0) * tx / W; bx1 = X0 + (X1 - X0) * (tx + w) / W
            by1 = Y1 - (Y1 - Y0) * ty / H; by0 = Y1 - (Y1 - Y0) * (ty + h) / H
            if src == "gibs":
                url = f"https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=BlueMarble_ShadedRelief_Bathymetry&SRS=EPSG:3857&BBOX={bx0},{by0},{bx1},{by1}&WIDTH={w}&HEIGHT={h}&FORMAT=image/jpeg"
            elif src == "usgs":
                url = f"https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export?bbox={bx0},{by0},{bx1},{by1}&bboxSR=3857&imageSR=3857&size={w},{h}&format=jpg&f=image"
            else:
                url = f"https://tiles.maps.eox.at/wms?service=WMS&request=GetMap&version=1.1.1&layers=s2cloudless-2020_3857&srs=EPSG:3857&bbox={bx0},{by0},{bx1},{by1}&width={w}&height={h}&format=image/jpeg"
            out.paste(fetch(url), (tx, ty))
            print(name, tx, ty, file=sys.stderr)
    out.save(name, quality=88)
    meta = dict(lon0=lon0, lon1=lon1, lat0=lat0, lat1=lat1, W=W, H=H)
    print(json.dumps({name: meta}))
a = sys.argv[1:]
build(a[0], a[1], *map(float, a[2:7]))
