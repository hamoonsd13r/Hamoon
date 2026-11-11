// v46: the Americas from Colombia to the USA (Natural Earth 1:50m via world-atlas, public domain) → src/v46/map.json
// Paths are in Mercator pixels (scale 1000 → lon/lat via P below); the video pans/zooms with an SVG viewBox.
// Usage: node tools/v46-map.mjs <countries-50m.json>
import fs from "fs";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
const topo = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const fc = feature(topo, topo.objects.countries);
const proj = geoMercator().scale(1000).translate([0, 0]);
const path = geoPath(proj);
const keep = fc.features.filter((f) => { const [[x0, y0], [x1, y1]] = geoPath().bounds(f); return x1 > -125 && x0 < -30 && y1 > -25 && y0 < 52; });
const r = (s) => s.replace(/(\d+\.\d{1})\d+/g, "$1");
const countries = keep.map((f) => ({ name: f.properties.name, d: r(path(f)) }));
const pt = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));
const cities = { Rionegro: pt(-75.374, 6.155), Envigado: pt(-75.586, 6.171), Medellin: pt(-75.574, 6.244), Bogota: pt(-74.072, 4.711), Cali: pt(-76.532, 3.452), Miami: pt(-80.19, 25.76), Soacha: pt(-74.217, 4.579) };
fs.writeFileSync("src/v46/map.json", JSON.stringify({ countries, cities }));
console.log(countries.length, "countries", JSON.stringify(cities));
