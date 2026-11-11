# V46 · real photos from Wikimedia Commons (free licences only), downloaded at ≤2400 px and logged with their credits
# in src/v46/photos.json (merged with footage.json by the video). Usage: python3 tools/v46-photos.py
import json, os, re, sys, time, urllib.parse, urllib.request
UA = {"User-Agent": "NFP-Footage/2.1 (+https://github.com/seyedpouramir/alvana-audio)"}
LIST = {
 "mugface": "Pablo Escobar Mug (cropped).jpg", "mugfull": "Pablo Escobar Mug.jpg",
 "rionegro": "Casa vieja del pueblo de Rionegro (Antioquia).JPG", "envigado": "Envigado above.jpg",
 "prado1940": "Residencia particular en el barrio Prado. Medellín, 1940.jpg", "cisneros": "Plaza de Cisneros en Medellín.jpg",
 "lehder": "Carlos Lehder.jpg", "gacha": "Rodriguezgacha.png", "ochoa": "Fabioochoav.png",
 "gate": "Parque Temático Hacienda Nápoles 9.jpg", "hippo": "Hipopótamo PTHN.jpg", "cars": "Parque Temático Hacienda Nápoles 96.jpg",
 "capnight": "Capitolionoche.jpg", "caprain": "Capitolio Nacional en la lluvia I.jpg", "parliament": "Parliament Colombia.jpg",
 "barrio": "Barrio Pablo Escobar.jpg", "lara": "2.ODO CON RODRIGO LARA BONILLA.jpg",
 "mac10": "Mac-10 submachine gun used to kill Minister Rodrigo Lara.jpg", "laragalan": "LuisCarlosGalan RodrigoLaraBonilla NancyRestrepodeLara.jpg",
 "galan79": "Iván Marulanda con los fundadores del Nuevo Liberalismo (Colombia).jpg", "galanstatue": "Estatua de Galán en el Concejo.JPG",
 "mansion": "Hacienda Napoles.jpg", "catedral": "LaCatedralAntioquia.jpg", "kalesi": "Pablonun kalesi14.23.jpg",
 "guard": "Guard house at La Catedral, Medellin.jpg", "helipad": "Helipad at La Catedral, the former Pablo Escobar prison overlooking the City of Medellin.jpg",
 "narino": "Palacio de Nariño.JPG", "popeye": "Jhon Jairo Velásquez.png", "roberto": "Roberto Escobar.jpg",
 "heli1": "Policía Antinarcóticos (5513319073).jpg", "heli2": "Servicio Áereo de la Policía Nacional (7550732900).jpg",
 "heli3": "Servicio Áereo de la Policía Nacional (7550731430).jpg", "police": "Servicio Aéreo de la Policía Nacional de Colombia (6069835724).jpg",
 "casa": "Vista de la casa de Pablo Escobar, Colombia.jpg", "tejado": "Escobar Tejado Muerto.jpg", "death": "Death of Pablo Escobar b (cropped).jpg",
 "tomb": "Pablo Escobar Tomb.jpg", "ftomb": "Cementerio monte sacro escobar family tomb 02.jpg",
}
OK = re.compile(r"^(Public domain|CC0|PD|CC BY(-SA)? [1-4]\.0|CC BY(-SA)? 2\.5|CC BY-SA 2\.5 co)", re.I)
out = "src/v46/photos.json"
man = json.load(open(out)) if os.path.exists(out) else {"clips": {}}
os.makedirs("public/v46/footage", exist_ok=True)
def api(**p):
    p["format"] = "json"
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)
    for k in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
        except Exception as e: time.sleep(15 * (k + 1))
for name, title in LIST.items():
    if name in man["clips"] and os.path.exists("public/" + man["clips"][name]["file"]): continue
    r = api(action="query", titles="File:" + title, prop="imageinfo", iiprop="url|size|extmetadata")
    if not r: print("✗ api", title); continue
    pg = next(iter(r["query"]["pages"].values()))
    if "imageinfo" not in pg: print("✗ missing", title); continue
    ii = pg["imageinfo"][0]; m = ii.get("extmetadata", {})
    # Wikimedia asks bots for thumbnails in its standard sizes, not originals (https://w.wiki/GHai)
    std = [s for s in (250, 330, 500, 960, 1280, 1920) if s < ii["width"]]
    if std:
        r2 = api(action="query", titles="File:" + title, prop="imageinfo", iiprop="url", iiurlwidth=std[-1])
        if not r2: print("✗ api", title); continue
        ii["thumburl"] = next(iter(r2["query"]["pages"].values()))["imageinfo"][0].get("thumburl")
    g = lambda k: re.sub(r"<[^>]+>", "", m.get(k, {}).get("value", "")).strip()
    lic = g("LicenseShortName")
    if not OK.match(lic): print("✗ licence", lic, title); continue
    url = ii.get("thumburl") or ii["url"]
    tmp = f"public/v46/footage/{name}.src"
    data = b""
    for k in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
            if len(data) > 2000: break
        except Exception: pass
        time.sleep(8 * (k + 1))
    if len(data) <= 2000: print("✗ download", title); continue
    open(tmp, "wb").write(data)
    dst = f"public/v46/footage/{name}.jpg"
    os.system(f'ffmpeg -v error -y -i "{tmp}" -q:v 2 "{dst}" && rm -f "{tmp}"')
    wh = os.popen(f'ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "{dst}"').read().strip().split(",")
    author = g("Artist")[:120] or "unknown"
    year = re.search(r"(19|20)\d\d", g("DateTimeOriginal"))
    man["clips"][name] = {"file": f"v46/footage/{name}.jpg", "kind": "image", "w": int(wh[0]), "h": int(wh[1]), "source": "commons", "title": title, "page": ii["descriptionurl"], "author": author, "year": int(year.group(0)) if year else None, "licence": {"name": lic, "verdict": "free" if re.match("Public|CC0|PD", lic) else "credit"}, "credit": f"{title} · {author} · {lic} · Wikimedia Commons"}
    json.dump(man, open(out, "w"), ensure_ascii=False, indent=1)
    print("✓", name, wh, lic, author[:40]); time.sleep(1.5)
