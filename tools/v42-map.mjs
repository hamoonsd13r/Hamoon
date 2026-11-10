// v42: Iran + neighbours (Natural Earth 1:50m via world-atlas, public domain) + ~85 city points → src/v42/map.json
// Usage: node tools/v42-map.mjs <countries-50m.json>
import fs from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const fc = feature(topo, topo.objects.countries);
const W = 1000, H = 880;
const iran = fc.features.find((f) => f.properties.name === "Iran");
const proj = geoMercator().fitExtent([[50, 50], [W - 50, H - 50]], iran);
proj.clipExtent([[-80, -80], [W + 80, H + 80]]);
const p = geoPath(proj); p.digits?.(1);
const r = (d) => d.replace(/(\d+\.\d)\d+/g, "$1");
const others = fc.features.filter((f) => f !== iran).map((f) => ({ n: f.properties.name, d: r(p(f) || "") })).filter((o) => o.d.length > 20);
// approximate city centres [lon, lat]; the named ones get labels in the video
const N = { tehran: [51.39, 35.69], mashhad: [59.6, 36.3], saqqez: [46.27, 36.25], sanandaj: [47.0, 35.31], zahedan: [60.86, 29.5], shiraz: [52.53, 29.6],
  isfahan: [51.67, 32.65], tabriz: [46.29, 38.08], ahvaz: [48.67, 31.32], behbahan: [50.24, 30.6], shadegan: [48.79, 30.65], sari: [53.06, 36.56], karaj: [50.99, 35.83] };
const rest = [[50.88,34.64],[51.43,33.98],[49.69,34.09],[48.51,34.8],[48.35,33.49],[47.07,34.31],[46.42,33.64],[45.07,37.55],[48.29,38.25],[48.48,36.68],[50.0,36.27],[49.58,37.28],[50.94,36.65],[52.35,36.7],[53.4,36.71],[54.43,36.84],[55.82,37.25],[57.33,37.47],[58.51,37.1],[57.68,36.21],[59.22,35.27],[59.21,32.87],[56.94,34.06],[54.35,31.9],[55.4,30.4],[57.08,30.28],[58.36,29.1],[56.27,27.18],[54.42,27.08],[50.83,28.97],[51.56,30.67],[50.86,32.33],[49.36,34.08],[48.86,32.38],[48.25,30.36],[49.06,30.59],[48.68,32.85],[47.11,35.56],[45.65,36.73],[45.15,36.99],[44.95,38.55],[45.88,37.4],[46.82,38.5],[47.78,37.84],[48.13,38.43],[49.46,37.47],[51.65,35.63],[51.66,35.33],[50.32,33.12],[51.21,32.34],[52.18,31.49],[53.6,32.24],[52.66,27.43],[57.73,25.29],[60.62,25.29],[61.49,31.03],[59.51,33.47],[58.95,35.66],[56.1,36.42],[52.9,36.17],[51.6,34.81],[50.01,34.31],[47.41,34.53],[46.99,35.88],[46.27,37.99],[53.38,35.58],[54.0,33.72],[55.69,32.08],[56.75,31.15],[51.43,35.57],[50.67,35.84],[51.52,32.98]];
const C = { ...N }; rest.forEach((v, i) => (C["c" + i] = v));
const cities = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, proj(v).map((x) => Math.round(x))]));
fs.writeFileSync("src/v42/map.json", JSON.stringify({ W, H, iran: r(p(iran)), len: Math.round(p.measure(iran)), others, cities, named: Object.keys(N) }));
console.log(Object.keys(cities).length, "cities");
