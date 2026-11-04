// V33 «شهردار یه‌روزه» قسمت ۳ — kit: palette, timing from words.json, easing, camera → screen.
// Look: 2.5D isometric low-poly city in sage/green (inspired by a city-builder reel), word captions in a deep-green box.
import wordsJson from "./words.json";

export type Word = { si: number; wi: number; w: string; v: string; s: number; e: number };
export const words = wordsJson as Word[];

export const W = 1080;
export const H = 1920;
export const FPS = 30;

// one family: sage ground + leaf greens, white walls, deep green UI; gold only for coins, red only for «not enough»
export const C = {
  bg: "#8DB7A6", bg2: "#A8CDBC", bgD: "#6E9A89",
  ground: "#C8CD99", groundD: "#B4BA84", curb: "#ECE8D2", curbS: "#CFCAAE",
  road: "#4B5051", roadL: "#565B5C", lane: "#EDEAD6",
  grass: "#A3C772", grassD: "#8BB25B", dirt: "#CDB98F", dirtD: "#B6A178", rock: "#9C8F74",
  tree: "#2F8C4F", treeL: "#4CAE66", treeD: "#23733F", trunk: "#6E4C34",
  wall: "#EEF0EC", wallS: "#D3D7D1", wallD: "#B7BCB6", win: "#53707A", winL: "#8FB3BE",
  roof: "#41B25F", roofL: "#63CB7E", roofD: "#2D8B48",
  ink: "#FFFFFF", deep: "#1C3A2A", deep2: "#28503A", lime: "#CFEF8F", limeD: "#A9D865",
  coin: "#F4C84A", coinD: "#C9962A", coinL: "#FFE48A", red: "#E25B4E", smog: "#6F6A60",
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const backOut = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const pop = (T: number, t0: number, d = 0.35) => (T < t0 ? 0 : backOut(prog(T, t0, t0 + d)));
export const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const bare = (x: string) => x.replace(/[،؛.؟!…«»:]/g, "");
/** onset of a word in line si (prefix match allowed; occ = 0-based occurrence) */
export const wd = (si: number, word: string, occ = 0) => {
  const ws = words.filter((x) => x.si === si);
  const hits = ws.filter((x) => bare(x.w) === word);
  const w = hits[occ] ?? ws.filter((x) => bare(x.w).startsWith(word))[occ] ?? ws.filter((x) => x.w.includes(word))[occ];
  if (!w) throw new Error(`word not found: ${si} ${word}`);
  return w.s;
};
export const wdEnd = (si: number, word: string, occ = 0) => {
  const s = wd(si, word, occ);
  return words.find((w) => w.si === si && w.s === s)!.e;
};
export const segStart = (si: number) => words.find((w) => w.si === si)!.s;
export const segEnd = (si: number) => words.filter((w) => w.si === si).at(-1)!.e;

export const FONT = { black: "V33Black", bold: "V33Bold", semi: "V33Semi" };

// ───────── isometric projection ─────────
export const TW = 64; // half tile width (px)
export const TH = 37; // half tile height (px)
export const ZH = 72; // px per height unit
export const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * TW, (x + y) * TH - z * ZH];

export type Cam = { x: number; y: number; z: number; cy?: number };
/** world point → screen pixel for a camera (cam.cy = screen y of the camera centre) */
export const toScreen = (cam: Cam, x: number, y: number, z = 0): [number, number] => {
  const [px, py] = P(x, y, z);
  const [cx, cy] = P(cam.x, cam.y, 0);
  return [W / 2 + (px - cx) * cam.z, (cam.cy ?? 860) + (py - cy) * cam.z];
};
