import sys, json, time, urllib.request, urllib.parse
UA = "NFP-Alvana-video-kit/1.0 (https://github.com/hamoonsd13r/Hamoon; educational)"
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
for line in open(sys.argv[1]):
    if "|" not in line: continue
    name, out, w = (line.strip().split("|") + ["960"])[:3]
    for a in range(6):
        try:
            q = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": w, "titles": "File:" + name})
            p = list(json.loads(get(q))["query"]["pages"].values())[0]
            ii = p["imageinfo"][0]
            url = ii.get("thumburl") or ii["url"]
            lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "?")
            open(out, "wb").write(get(url))
            print("ok", out, ii["width"], "x", ii["height"], "|", lic, "|", url.split("/")[-1][:60]); break
        except Exception as e:
            print("retry", out, e); time.sleep(10 * (a + 1))
    time.sleep(3)
