// v41: Iran + neighbours as SVG paths (Natural Earth 1:50m via world-atlas, public domain) → src/v41/map.json
// Usage: node tools/v41-map.mjs <countries-50m.json>   (npm pack world-atlas@2 → package/countries-50m.json)
import fs from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath, geoContains } from "d3-geo";
const topo = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const fc = feature(topo, topo.objects.countries);
const W = 1080, H = 940;
const iran = fc.features.find((f) => f.properties.name === "Iran");
const proj = geoMercator().fitExtent([[70, 60], [W - 70, H - 60]], iran);
proj.clipExtent([[-60, -60], [W + 60, H + 60]]);
const p = geoPath(proj);
p.digits?.(1);
const r = (d) => d.replace(/(\d+\.\d)\d+/g, "$1");
const bounds = { type: "Polygon", coordinates: [[[35, 18], [35, 45], [72, 45], [72, 18], [35, 18]]] };
const others = fc.features.filter((f) => f !== iran && p.bounds(f)[1][0] > -400 && p.bounds(f)[0][0] < W + 400 && p.bounds(f)[1][1] > -400 && p.bounds(f)[0][1] < H + 400)
  .map((f) => ({ n: f.properties.name, d: r(p(f) || "") })).filter((o) => o.d.length > 20);
const C = { tehran: [51.39, 35.69], mashhad: [59.6, 36.3], rasht: [49.58, 37.28], qazvin: [50.0, 36.27], kerman: [57.08, 30.28], shirvan: [57.93, 37.4],
  tabriz: [46.29, 38.08], isfahan: [51.67, 32.65], gorgan: [54.43, 36.84], ahvaz: [48.67, 31.32], kermanshah: [47.07, 34.31], sanandaj: [47.0, 35.31] };
const cities = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, proj(v).map((x) => Math.round(x))]));
// city-light dots inside Iran: a jittered grid + clusters around the cities (seeded, so the file is stable)
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const dots = [];
for (let lon = 44; lon < 63.5; lon += 0.55) for (let lat = 25; lat < 40; lat += 0.55) {
  const q = [lon + (rnd() - 0.5) * 0.5, lat + (rnd() - 0.5) * 0.5];
  if (geoContains(iran, q) && rnd() < 0.55) dots.push(q);
}
for (const v of Object.values(C)) for (let i = 0; i < 9; i++) { const q = [v[0] + (rnd() - 0.5) * 0.9, v[1] + (rnd() - 0.5) * 0.7]; if (geoContains(iran, q)) dots.push(q); }
const dotsXY = dots.map((q) => proj(q).map((x) => Math.round(x)).concat(Math.round(rnd() * 100)));
fs.writeFileSync("src/v41/map.json", JSON.stringify({ W, H, iran: r(p(iran)), len: Math.round(p.measure(iran)), others, cities, dots: dotsXY }));
console.log("dots", dotsXY.length);
console.log(others.map((o) => o.n).join(", "), cities);
