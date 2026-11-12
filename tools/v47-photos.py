# V47 · real photos from Wikimedia Commons (free licences only), downloaded at ≤2400 px and logged with their credits
# in src/v47/photos.json (merged with footage.json by the video). Usage: python3 tools/v46-photos.py
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error
UA = {"User-Agent": "NFP-Footage/2.1 (+https://github.com/seyedpouramir/alvana-audio)"}
LIST = {
 "birth_old": "Hitlers Geburtshaus Braunau am Inn.jpg", "birth_now": "Salzburger Vorstadt 15 (Braunau) I.jpg", "braunau_paint": "Rolf von Hoerschelmann Braunau am Inn.jpg",
 "baby": "Bundesarchiv Bild 183-1989-0322-506, Adolf Hitler, Kinderbild.jpg", "alois": "Alois Hitler in his last years.jpg", "klara": "Klara Hitler (2).jpg",
 "linz": "Linz 1900.jpg", "linz2": "Linz 2 1900.jpg", "academy": "Akademie der bildenden Künste Wien.jpg", "w_oper": "Adolf Hitler - Wien Oper.jpg", "w_1908": "Adolf Hitler - 04.jpg",
 "w_michaeler": "Adolf Hitler - Michaelerplatz, Vienna, Austria.jpg", "maennerheim": "1906 - 20., Meldemannstraße 27 - Männerheim der Kaiser Franz Josef I.jpg",
 "w_munich": "Hitler Watercolor - Munich Royal Hofbräuhaus.jpg", "ww1": "Bundesarchiv Bild 146-1974-082-44, Adolf Hitler im Ersten Weltkrieg.jpg",
 "compiegne": "Armistice - Armistice - Allied and German delegates arrive in Compiegne Wood to discuss the terms of Armistice. The first photograph of the actual meeting of the Allied and German plenipotentiaries in the Compieg(...) - NARA - 20807010.jpg",
 "putsch": "Bundesarchiv Bild 119-1486, Hitler-Putsch, München, Marienplatz.jpg", "barricade": "Hitlerputsch, barricade in Munich (1923).jpg",
 "h1923": "Adolf Hitler, 1923 photograph by International Newsreel Photographs.jpg", "landsberg": "Hitler, Maurice, Kriebel, Hess, Weber, prison de Landsberg en 1924.jpg",
 "trial": "Defendents in Hitler Trail - DPLA - 69c5d0875c39789ae053448bd1568848 (page 1).jpg", "unemployed": "Bundesarchiv Bild 146-1985-054-02, Berlin, arbeitslose SA-Männer.jpg",
 "hind_portrait": "Bundesarchiv Bild 183-C06886, Paul v. Hindenburg (cropped).jpg", "potsdam": "Bundesarchiv Bild 183-S38324, Tag von Potsdam, Adolf Hitler, Paul v. Hindenburg.jpg",
 "fire": "Reichstagsbrand.jpg", "fire_inside": "Bundesarchiv Bild 102-14367, Berlin, Reichstag, ausgebrannte Loge.jpg", "fire_men": "Firemen work on the burning Reichstag Building in February, 1933, after fire broke out simultaneously at 20 places.... - NARA - 535790.tif",
 "enabling_speech": "Bundesarchiv Bild 102-14439, Rede Adolf Hitlers zum Ermächtigungsgesetz.jpg", "enabling_doc": "Enabling act of 1933 printed in the Reich Law Gazette.jpg",
 "dachau33": "Bundesarchiv Bild 152-01-26, Dachau, Konzentrationslager.jpg", "reichstag_speech": "Bundesarchiv Bild 183-1987-0703-507, Berlin, Reichstagssitzung, Rede Adolf Hitler.jpg",
 "portrait": "Bundesarchiv Bild 183-H1216-0500-002, Adolf Hitler.jpg", "nuremberg_chart": "Nuremberg laws Racial Chart.jpg", "kristall": "The day after Kristallnacht.jpg",
 "synagogue": "Börnerplatz synagogue burning - Kristallnacht 1938-11-10.png", "poland_barrier": "Bundesarchiv Bild 183-51909-0003, Polen, Schlagbaum, deutsche Soldaten.jpg",
 "barbarossa": "Bundesarchiv Bild 101I-265-0006-29, Russland, \"Unternehmen Barbarossa\".jpg", "wannsee_list": "Wannsee Conference - List of Jews in European countries.JPG",
 "ausch_ramp": "Selection on the ramp at Auschwitz-Birkenau, 1944 (Auschwitz Album) 1a.jpg", "ausch_three": "Birkenau Three Jewish men holding an elderly woman looking behind her.jpg",
 "ausch_women": "Jewish women selected for labor at Auschwitz.jpg", "dachau_lib": "Prisoners liberation dachau.jpg", "dachau_soldier": "American Soldier is surrounded by survivors at the newly liberated Dachau concentration camp, April 29, 1945 in Dachau, Germany.jpg",
 "stal_ruin": "Bundesarchiv Bild 183-B22531, Stalingrad, Ruine des Warenhauses.jpg", "stal_paulus": "Field Marshal Paulus, General Heitz and other German officers of the 6th Army after its surrender.jpg",
 "dday": "Into the Jaws of Death 23-0455M edit.jpg", "july20": "Bundesarchiv Bild 146-1972-025-10, Hitler-Attentat, 20. Juli 1944.jpg",
 "soviet_art": "Bundesarchiv Bild 183-E0406-0022-012, Sowjetische Artillerie vor Berlin.jpg", "eva": "Eva Braun portrait - 1 of 3 (242-EB-26-01).jpg",
 "garden": "Bundesarchiv Bild 183-V04744, Berlin, Garten der zerstörte Reichskanzlei.jpg", "bunker_blown": "Bundesarchiv Bild 183-M1204-319, Berlin, Reichskanzlei, gesprengter Führerbunker.jpg",
 "reichstag45": "Bundesarchiv Bild 183-M1203-303, Berlin, Trümmerräumen am Reichstag.jpg", "berlin_street": "Bundesarchiv Bild 183-J31338, Berlin, Oranienstraße, Schäden nach Luftangriff.jpg",
 "stripes": "Stars & Stripes & Hitler Dead.jpg", "jodl": "Jodl surrender front view.JPG", "surrender_doc": "German instrument of surrender.jpg",
 "hq": "Bundesarchiv Bild 183-R99057, Führerhauptquartier, Adolf Hitler mit Stab.jpg",
 "vienna_opera": "Wien Opernhaus um 1900.jpg", "vienna_parl": "Wien Parlament um 1900.jpg", "vienna_kai": "Franz-Josefs-Kai Wien 1900.jpg", "vienna_burg": "Wien Burgtheater um 1900.jpg",
 "sterneck": "Sterneckerbraeu.jpg", "poster": "Bundesarchiv Bild 102-04651A, Preußen, Wahlplakat Nationalsozialisten.jpg", "cabinet": "Bundesarchiv Bild 183-H28422, Reichskabinett Adolf Hitler.jpg",
 "testament": "Political Testament of Adolph Hitler 1945 page 1.jpg", "odeon": "Bundesarchiv Bild 119-1426, Hitler-Putsch, München, Odeonsplatz.jpg",
 "berlin_mg": "Bundesarchiv Bild 146-1995-081-13A, Berlin, MG-Stellung, Hellmuth Reymann.jpg", "armistice_lon": "Armistice Day in London, 11 November 1918 Q47852.jpg",
}
OK = re.compile(r"^(Public domain|CC0|PD|CC BY(-SA)? [1-4]\.0|CC BY(-SA)? 2\.5|CC BY-SA 3\.0 de|CC BY-SA 3\.0 at)", re.I)
out = "src/v47/photos.json"
man = json.load(open(out)) if os.path.exists(out) else {"clips": {}}
os.makedirs("public/v47/footage", exist_ok=True)
def api(**p):
    p["format"] = "json"
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)
    for k in range(6):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60))
        except Exception as e: time.sleep(15 * (k + 1))
# batched: one call for sizes + licences (≤50 titles), one call per standard thumbnail width, then the files ~3 s apart
todo = {n: t for n, t in LIST.items() if not (n in man["clips"] and os.path.exists("public/" + man["clips"][n]["file"]))}
info = {}
names = list(todo)
for b in range(0, len(names), 40):
    chunk = names[b:b + 40]
    r = api(action="query", titles="|".join("File:" + todo[n] for n in chunk), prop="imageinfo", iiprop="url|size|extmetadata")
    if not r: print("✗ api batch"); continue
    norm = {x["to"]: x["from"] for x in r["query"].get("normalized", [])}
    for pg in r["query"]["pages"].values():
        t = norm.get(pg["title"], pg["title"])[5:]
        n = next((k for k in chunk if todo[k] == t or todo[k].replace("_", " ") == t), None)
        if n is None or "imageinfo" not in pg: print("✗ missing", t); continue
        info[n] = pg["imageinfo"][0]
    time.sleep(3)
groups = {}
for n, ii in info.items():
    std = [x for x in (250, 330, 500, 960, 1280, 1920) if x < ii["width"]]
    groups.setdefault(std[-1] if std else 0, []).append(n)
for wdt, ns in groups.items():
    if not wdt: continue
    for b in range(0, len(ns), 40):
        r = api(action="query", titles="|".join("File:" + todo[n] for n in ns[b:b + 40]), prop="imageinfo", iiprop="url", iiurlwidth=wdt)
        if not r: continue
        norm = {x["to"]: x["from"] for x in r["query"].get("normalized", [])}
        for pg in r["query"]["pages"].values():
            t = norm.get(pg["title"], pg["title"])[5:]
            n = next((k for k in ns if todo[k] == t or todo[k].replace("_", " ") == t), None)
            if n and "imageinfo" in pg: info[n]["thumburl"] = pg["imageinfo"][0].get("thumburl")
        time.sleep(3)
for name, ii in info.items():
    title = todo[name]; m = ii.get("extmetadata", {})
    g = lambda k: re.sub(r"<[^>]+>", "", m.get(k, {}).get("value", "")).strip()
    lic = g("LicenseShortName")
    if not OK.match(lic): print("✗ licence", lic, title); continue
    url = ii.get("thumburl") or ii["url"]
    data = b""
    for k in range(4):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            if len(data) > 2000: break
        except urllib.error.HTTPError as e:
            ra = float(e.headers.get("retry-after") or 10); print("  429", ra, flush=True); time.sleep(min(ra, 90) + 2)
        except Exception: time.sleep(10)
    if len(data) <= 2000: print("✗ download", title); continue
    tmp = f"public/v47/footage/{name}.src"; open(tmp, "wb").write(data)
    dst = f"public/v47/footage/{name}.jpg"
    os.system(f'ffmpeg -v error -y -i "{tmp}" -q:v 2 "{dst}" && rm -f "{tmp}"')
    wh = os.popen(f'ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "{dst}"').read().strip().split(",")
    if len(wh) < 2 or not wh[0]: print("✗ decode", title); continue
    author = g("Artist")[:120] or "unknown"
    year = re.search(r"(1[89]|20)\d\d", g("DateTimeOriginal"))
    man["clips"][name] = {"file": f"v47/footage/{name}.jpg", "kind": "image", "w": int(wh[0]), "h": int(wh[1]), "source": "commons", "title": title, "page": ii["descriptionurl"], "author": author, "year": int(year.group(0)) if year else None, "licence": {"name": lic, "verdict": "free" if re.match("Public|CC0|PD", lic) else "credit"}, "credit": f"{title} · {author} · {lic} · Wikimedia Commons"}
    json.dump(man, open(out, "w"), ensure_ascii=False, indent=1)
    print("✓", name, wh, lic, author[:40], flush=True); time.sleep(3)
