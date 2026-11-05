// V34 · map maths: Web-Mercator camera, word cues, curves, path helpers
import { Easing } from "remotion";
import { noise2D } from "@remotion/noise";
import vo from "./vo.json";

export const FPS = 30, W = 1080, H = 1920;
export const TOTAL = vo.total;
export type Word = { w: string; s: number; e: number; line: number };
export const words = vo.words as Word[];

const norm = (s: string) => s.replace(/[ً-ْ‌.,،؛؟?!:«»]/g, "");
// start time of a word in a line (prefix match, nth occurrence)
export const wd = (line: number, w: string, nth = 0) => {
  const m = words.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)));
  if (!m[nth]) throw new Error(`cue not found: ${line} ${w}`);
  return m[nth].s;
};
export const wdEnd = (line: number, w: string, nth = 0) => {
  const m = words.filter((x) => x.line === line && norm(x.w).startsWith(norm(w)));
  return m[nth].e;
};

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ramp = (t: number, a: number, b: number, ease: (x: number) => number = Easing.bezier(0.33, 0, 0.2, 1)) =>
  ease(clamp((t - a) / (b - a)));
export const win = (t: number, a: number, b: number, fin = 0.3, fout = 0.3) => Math.min(ramp(t, a, a + fin), 1 - ramp(t, b - fout, b));
export const pop = (t: number, a: number, d = 0.42) => {
  const k = clamp((t - a) / d);
  if (k <= 0) return 0;
  if (k < 0.55) return Easing.out(Easing.quad)(k / 0.55) * 1.14;
  if (k < 0.8) return 1.14 - 0.17 * ((k - 0.55) / 0.25);
  return 0.97 + 0.03 * ((k - 0.8) / 0.2);
};
export const FA = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
export const nz = (seed: string, t: number) => noise2D(seed, t, 0);

/* ---------- Web Mercator ---------- */
export const MX = (lon: number) => (lon + 180) / 360;
export const MY = (lat: number) => (1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2;
export type Cam = { lon: number; lat: number; span: number; rot?: number };
export type Key = Cam & { t: number; ease?: (x: number) => number };
export const zoomOf = (c: Cam) => W / (c.span / 360); // screen px per world unit
export const scr = (c: Cam, lon: number, lat: number) => {
  const z = zoomOf(c);
  return { x: W / 2 + (MX(lon) - MX(c.lon)) * z, y: H / 2 + (MY(lat) - MY(c.lat)) * z };
};
// screen rect of a lon/lat bbox
export const rectOf = (c: Cam, lon0: number, lon1: number, lat0: number, lat1: number) => {
  const a = scr(c, lon0, lat1), b = scr(c, lon1, lat0);
  return { left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y };
};
const EIO = Easing.bezier(0.65, 0, 0.3, 1);
export const camAt = (keys: Key[], t: number): Cam => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t <= b.t) {
      const k = (b.ease ?? EIO)(clamp((t - a.t) / Math.max(1e-4, b.t - a.t)));
      // pan in Mercator space, zoom in log space
      const x = lerp(MX(a.lon), MX(b.lon), k), y = lerp(MY(a.lat), MY(b.lat), k);
      const lon = x * 360 - 180;
      const lat = (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;
      return { lon, lat, span: Math.exp(lerp(Math.log(a.span), Math.log(b.span), k)), rot: lerp(a.rot ?? 0, b.rot ?? 0, k) };
    }
  }
  return keys[keys.length - 1];
};

/* ---------- curves ---------- */
export type P = [number, number];
// Catmull-Rom through lon/lat waypoints
export const smooth = (pts: P[], n = 8): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((d) =>
        0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3),
      ) as P);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
export const toScr = (c: Cam, pts: P[]) => pts.map(([lon, lat]) => scr(c, lon, lat));
export const plen = (s: { x: number; y: number }[]) => {
  let L = 0;
  for (let i = 1; i < s.length; i++) L += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
  return L;
};
// first fraction k (0..1, by length) of a screen polyline
export const cut = (s: { x: number; y: number }[], k: number) => {
  if (k >= 1) return s;
  if (k <= 0) return s.slice(0, 1);
  const L = plen(s) * k;
  const out = [s[0]];
  let acc = 0;
  for (let i = 1; i < s.length; i++) {
    const d = Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
    if (acc + d >= L) {
      const f = (L - acc) / d;
      out.push({ x: lerp(s[i - 1].x, s[i].x, f), y: lerp(s[i - 1].y, s[i].y, f) });
      return out;
    }
    acc += d;
    out.push(s[i]);
  }
  return out;
};
// point + heading at fraction k along a lon/lat path
export const along = (pts: P[], k: number): { p: P; a: number } => {
  const seg: number[] = [];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(d);
    L += d;
  }
  let target = clamp(k) * L;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const f = seg[i] ? clamp(target / seg[i]) : 0;
      const a = pts[i], b = pts[i + 1];
      return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], a: Math.atan2(-(b[1] - a[1]), b[0] - a[0]) };
    }
    target -= seg[i];
  }
  return { p: pts[pts.length - 1], a: 0 };
};
export const d = (s: { x: number; y: number }[], close = false) =>
  s.length ? "M" + s.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L") + (close ? "Z" : "") : "";
