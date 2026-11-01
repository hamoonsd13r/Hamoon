// V30 — isometric low-poly city: primitives (quad, box, house, tree, car, bus, civic buildings) + the whole neighbourhood.
import React from "react";
import { C, Cam, H, P, TH, TW, W, ZH, clamp, easeOut, hash, lerp, pop } from "./kit";

/** darken a #rrggbb colour by k% */
export const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16), f = 1 - k / 100;
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
};

type V3 = [number, number, number];
const pts = (a: V3[]) => a.map(([x, y, z]) => P(x, y, z).map((n) => n.toFixed(1)).join(",")).join(" ");

export const Quad: React.FC<{ x0: number; y0: number; x1: number; y1: number; z?: number; fill: string; op?: number }> = ({ x0, y0, x1, y1, z = 0, fill, op }) => (
  <polygon points={pts([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]])} fill={fill} opacity={op} />
);

type BoxP = { x: number; y: number; w: number; d: number; h: number; z?: number; top: string; left: string; right: string };
/** box: top face, front-left face (y = y1), front-right face (x = x1) */
export const Box: React.FC<BoxP> = ({ x, y, w, d, h, z = 0, top, left, right }) => {
  const x1 = x + w, y1 = y + d, zt = z + h;
  return (
    <g>
      <polygon points={pts([[x, y1, z], [x1, y1, z], [x1, y1, zt], [x, y1, zt]])} fill={left} />
      <polygon points={pts([[x1, y, z], [x1, y1, z], [x1, y1, zt], [x1, y, zt]])} fill={right} />
      <polygon points={pts([[x, y, zt], [x1, y, zt], [x1, y1, zt], [x, y1, zt]])} fill={top} />
    </g>
  );
};
/** windows on the two visible faces (u along face, v up) */
const winsY = (x: number, y1: number, w: number, z: number, h: number, n: number, rows: number, col = C.win) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
    const u0 = x + (w / n) * (i + 0.28), u1 = x + (w / n) * (i + 0.72);
    const v0 = z + (h / rows) * (r + 0.3), v1 = z + (h / rows) * (r + 0.75);
    out.push(<polygon key={`y${r}-${i}`} points={pts([[u0, y1, v0], [u1, y1, v0], [u1, y1, v1], [u0, y1, v1]])} fill={col} />);
  }
  return out;
};
const winsX = (x1: number, y: number, d: number, z: number, h: number, n: number, rows: number, col = C.win) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
    const u0 = y + (d / n) * (i + 0.28), u1 = y + (d / n) * (i + 0.72);
    const v0 = z + (h / rows) * (r + 0.3), v1 = z + (h / rows) * (r + 0.75);
    out.push(<polygon key={`x${r}-${i}`} points={pts([[x1, u0, v0], [x1, u1, v0], [x1, u1, v1], [x1, u0, v1]])} fill={col} opacity={0.85} />);
  }
  return out;
};

/** scale a group around a world base point (for pop-in) */
export const PopG: React.FC<{ x: number; y: number; s: number; children: React.ReactNode }> = ({ x, y, s, children }) => {
  if (s <= 0.001) return null;
  const [bx, by] = P(x, y, 0);
  return <g transform={`translate(${bx} ${by}) scale(${s}) translate(${-bx} ${-by})`} opacity={clamp(s * 3)}>{children}</g>;
};

export const House: React.FC<{ x: number; y: number; w?: number; d?: number; h?: number; rh?: number; roof?: [string, string, string]; v?: number }> = ({ x, y, w = 2, d = 1.8, h = 0.85, rh = 0.55, roof = [C.roof, C.roofL, C.roofD], v = 0 }) => {
  const x1 = x + w, y1 = y + d, ym = y + d / 2, zt = h, o = 0.12;
  const wall = v % 2 ? "#F4F1EA" : C.wall;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top={wall} left={v % 2 ? "#E2DED4" : C.wallS} right={C.wallD} />
      {winsY(x, y1, w, 0, h, 3, 1)}
      {winsX(x1, y, d, 0, h, 2, 1)}
      {/* door */}
      <polygon points={pts([[x + w * 0.44, y1, 0], [x + w * 0.56, y1, 0], [x + w * 0.56, y1, h * 0.62], [x + w * 0.44, y1, h * 0.62]])} fill="#5B4636" />
      {/* roof: back slope, gable end (x1), front slope */}
      <polygon points={pts([[x - o, y - o, zt], [x1 + o, y - o, zt], [x1 + o, ym, zt + rh], [x - o, ym, zt + rh]])} fill={roof[1]} />
      <polygon points={pts([[x1, y, zt], [x1, y1, zt], [x1, ym, zt + rh]])} fill={C.wallS} />
      <polygon points={pts([[x - o, y1 + o, zt], [x1 + o, y1 + o, zt], [x1 + o, ym, zt + rh], [x - o, ym, zt + rh]])} fill={roof[0]} />
      <polygon points={pts([[x1 + o, y1 + o, zt], [x1 + o, ym, zt + rh], [x1 + o, ym, zt + rh - 0.06], [x1 + o, y1 + o, zt - 0.06]])} fill={roof[2]} />
      {/* chimney */}
      <Box x={x + w * 0.22} y={ym - 0.32} w={0.22} d={0.22} h={0.38} z={zt + rh * 0.45} top={C.wallS} left="#8E8F88" right="#77786F" />
    </g>
  );
};

export const Apartment: React.FC<{ x: number; y: number; w: number; d: number; h: number; v?: number }> = ({ x, y, w, d, h, v = 0 }) => {
  const floors = Math.round(h / 0.62);
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top={C.wallS} left={v % 2 ? "#E8E4DA" : C.wall} right={C.wallS} />
      {winsY(x, y + d, w, 0, h, Math.round(w * 1.6), floors)}
      {winsX(x + w, y, d, 0, h, Math.round(d * 1.6), floors)}
      <Box x={x + 0.15} y={y + 0.15} w={w - 0.3} d={d - 0.3} h={0.1} z={h} top={C.roof} left={C.roofD} right={C.roofD} />
      <Box x={x + w * 0.55} y={y + d * 0.2} w={0.5} d={0.5} h={0.3} z={h + 0.1} top={C.wallS} left="#9DA29C" right="#878C86" />
    </g>
  );
};

/** low-poly pine: trunk + 3 cone tiers, light from the left */
export const Tree: React.FC<{ x: number; y: number; h?: number; r?: number; tone?: number }> = ({ x, y, h = 1.7, r = 0.42, tone = 0 }) => {
  const [cx, cy0] = P(x, y, 0);
  const tiers = [0, 1, 2];
  const dark = tone ? C.treeD : C.tree, light = tone ? C.tree : C.treeL;
  return (
    <g>
      <ellipse cx={cx + 6} cy={cy0 + 2} rx={r * TW * 1.5} ry={r * TH * 1.5} fill="#000" opacity={0.12} />
      <rect x={cx - 4} y={cy0 - h * ZH * 0.3} width={8} height={h * ZH * 0.3} fill={C.trunk} />
      {tiers.map((i) => {
        const zb = h * (0.22 + i * 0.22), zt = zb + h * (0.5 - i * 0.06), rr = r * (1.25 - i * 0.28);
        const [, by] = P(x, y, zb);
        const [, ty] = P(x, y, zt);
        const a = rr * TW * 1.41, b = rr * TH * 1.41;
        return (
          <g key={i}>
            <path d={`M${cx} ${ty} L${cx - a} ${by} A${a} ${b} 0 0 0 ${cx + a} ${by} Z`} fill={dark} />
            <path d={`M${cx} ${ty} L${cx - a} ${by} A${a} ${b} 0 0 0 ${cx} ${by + b} Z`} fill={light} />
          </g>
        );
      })}
    </g>
  );
};

export const Car: React.FC<{ x: number; y: number; dir: "x" | "y"; color: string }> = ({ x, y, dir, color }) => {
  const L = 0.95, Wd = 0.46;
  const bx = dir === "x" ? x - L / 2 : x - Wd / 2, by = dir === "x" ? y - Wd / 2 : y - L / 2;
  const bw = dir === "x" ? L : Wd, bd = dir === "x" ? Wd : L;
  return (
    <g>
      <Box x={bx} y={by} w={bw} d={bd} h={0.24} z={0.06} top={color} left={shade(color, 18)} right={shade(color, 32)} />
      <Box x={bx + (dir === "x" ? 0.22 : 0.04)} y={by + (dir === "y" ? 0.22 : 0.04)} w={dir === "x" ? 0.48 : Wd - 0.08} d={dir === "y" ? 0.48 : Wd - 0.08} h={0.17} z={0.3}
        top={shade(color, 6)} left={C.win} right={"#3F5A63"} />
    </g>
  );
};

export const Bus: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const L = 2.5, Wd = 0.62, h = 0.62;
  const bx = x - L / 2, by = y - Wd / 2;
  return (
    <g>
      <Box x={bx} y={by} w={L} d={Wd} h={h} z={0.06} top="#F3F5EF" left={C.roof} right={C.roofD} />
      <polygon points={pts([[bx + 0.15, by + Wd, 0.36], [bx + L - 0.3, by + Wd, 0.36], [bx + L - 0.3, by + Wd, 0.6], [bx + 0.15, by + Wd, 0.6]])} fill="#2F4B52" />
      <polygon points={pts([[bx + L, by + 0.06, 0.32], [bx + L, by + Wd - 0.06, 0.32], [bx + L, by + Wd - 0.06, 0.6], [bx + L, by + 0.06, 0.6]])} fill="#2F4B52" />
      {/* pantograph / battery pack on the roof */}
      <Box x={bx + 0.6} y={by + 0.12} w={1.1} d={Wd - 0.24} h={0.08} z={0.68} top={C.lime} left={C.limeD} right={C.limeD} />
    </g>
  );
};

export const BusStop: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <Box x={x} y={y} w={0.9} d={0.08} h={0.55} top={C.wallS} left="#93A7A3" right="#7C8F8B" />
    <Box x={x - 0.05} y={y - 0.05} w={1} d={0.4} h={0.05} z={0.55} top={C.lime} left={C.limeD} right={C.limeD} />
  </g>
);

export const Library: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const w = 4, d = 3.2, h = 1.3;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={0.12} top={C.curb} left={C.curbS} right={C.curbS} />
      <Box x={x + 0.2} y={y + 0.2} w={w - 0.4} d={d - 0.6} h={h} z={0.12} top={C.wallS} left={C.wall} right={C.wallS} />
      {winsY(x + 0.2, y + d - 0.4, w - 0.4, 0.12, h, 5, 1, "#3E5C52")}
      {winsX(x + w - 0.2, y + 0.2, d - 0.6, 0.12, h, 3, 1, "#3E5C52")}
      {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} x={x + 0.3 + i * 0.66} y={y + d - 0.32} w={0.12} d={0.12} h={h} z={0.12} top="#fff" left="#F6F6F2" right="#D6D8D2" />)}
      <Box x={x + 0.1} y={y + 0.1} w={w - 0.2} d={d - 0.2} h={0.16} z={h + 0.12} top={C.roofL} left={C.roof} right={C.roofD} />
      <Box x={x + 0.9} y={y + 0.7} w={1.8} d={1.4} h={0.3} z={h + 0.28} top={C.roof} left={C.roofD} right={C.roofD} />
    </g>
  );
};

export const Clinic: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const w = 3.6, d = 3, h = 1.7;
  return (
    <g>
      <Box x={x - 0.2} y={y - 0.2} w={w + 0.4} d={d + 0.6} h={0.08} top={C.curb} left={C.curbS} right={C.curbS} />
      <Box x={x} y={y} w={w} d={d} h={h} z={0.08} top={C.wallS} left={C.wall} right={C.wallS} />
      {winsY(x, y + d, w, 0.08, h, 5, 2, "#5D8A93")}
      {winsX(x + w, y, d, 0.08, h, 4, 2, "#5D8A93")}
      {/* entrance canopy */}
      <Box x={x + 1.2} y={y + d} w={1.2} d={0.45} h={0.06} z={0.62} top={C.roofL} left={C.roof} right={C.roofD} />
      {/* rooftop cross (red: the only red element, medical) */}
      <Box x={x + 0.15} y={y + 0.15} w={w - 0.3} d={d - 0.3} h={0.06} z={h + 0.08} top={C.roof} left={C.roofD} right={C.roofD} />
      <Quad x0={x + 1.45} y0={y + 0.75} x1={x + 2.15} y1={y + 2.25} z={h + 0.15} fill="#fff" />
      <Quad x0={x + 1.05} y0={y + 1.15} x1={x + 2.55} y1={y + 1.85} z={h + 0.15} fill="#fff" />
      <Quad x0={x + 1.6} y0={y + 0.9} x1={x + 2} y1={y + 2.1} z={h + 0.16} fill={C.red} />
      <Quad x0={x + 1.2} y0={y + 1.3} x1={x + 2.4} y1={y + 1.7} z={h + 0.16} fill={C.red} />
    </g>
  );
};

export const Cafe: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const w = 3.4, d = 2.2, h = 1.05;
  const stripes = 8;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top={C.wallS} left="#F4EEE2" right="#D9D2C2" />
      {winsY(x, y + d, w, 0, h, 4, 1, "#4E6B6E")}
      <Box x={x - 0.05} y={y - 0.05} w={w + 0.1} d={d + 0.1} h={0.12} z={h} top={C.roofD} left={C.roofD} right={C.deep2} />
      {/* striped awning sloping out over the front */}
      {Array.from({ length: stripes }, (_, i) => (
        <polygon key={i} points={pts([[x + (w / stripes) * i, y + d, h * 0.92], [x + (w / stripes) * (i + 1), y + d, h * 0.92], [x + (w / stripes) * (i + 1), y + d + 0.7, h * 0.62], [x + (w / stripes) * i, y + d + 0.7, h * 0.62]])}
          fill={i % 2 ? "#fff" : C.roof} />
      ))}
      {/* tables with umbrellas */}
      {[0.6, 1.7, 2.8].map((tx, i) => (
        <g key={i}>
          <Box x={x + tx} y={y + d + 1.05} w={0.36} d={0.36} h={0.24} top="#8A5A3C" left="#6E462E" right="#5B3925" />
          <circle cx={P(x + tx + 0.18, y + d + 1.23, 0.62)[0]} cy={P(x + tx + 0.18, y + d + 1.23, 0.62)[1]} r={18} fill={i % 2 ? C.roofL : "#fff"} />
        </g>
      ))}
    </g>
  );
};

// ───────── the neighbourhood ─────────
export type CityState = {
  T: number;
  carFade: number; // 0..1 — half of the cars leave once the bus runs
  flow: number; // car speed (tiles/sec)
  laneDraw: number; // 0..1 bus lane painted
  busX: number | null;
  stops: number; // 0..1 bus stops pop
  park: number; // 0..1 lot → park
  civic: "none" | "lib" | "clinic" | "cafe";
  civicS: number; // pop scale of the civic building
  people: number; // 0..1 walkers
};

const CAR_COLORS = ["#E9E6DC", "#6C8C99", "#D9A441", "#9C5B4B", "#3E4E5A", "#C7CBC4", "#7FA36A", "#B4483E"];
const LANES: { dir: "x" | "y"; at: number; sgn: 1 | -1 }[] = [
  { dir: "x", at: 8.5, sgn: 1 }, { dir: "x", at: 9.5, sgn: -1 }, { dir: "y", at: 8.5, sgn: 1 }, { dir: "y", at: 9.5, sgn: -1 },
];
const SPAN = 34, S0 = -9; // lane length and start

type Item = { k: number; el: React.ReactNode };

const HOUSES: [number, number, number][] = [
  [0.8, 1, 0], [4.3, 1, 1], [0.8, 4.4, 2], [4.3, 4.4, 3], [-3, 1, 4], [-3, 4.4, 5], [0.8, -2.6, 6], [4.3, -2.6, 7], [-3, -2.6, 8],
  [18.2, 1, 9], [18.2, 4.4, 10], [11.2, -2.6, 11], [14.7, -2.6, 12], [-3, 11.2, 13], [-3, 14.6, 14], [-3, 18, 15], [1.2, 18, 16], [4.6, 18, 17],
  [21.6, 1, 18], [11.2, -6, 19], [0.8, -6, 20], [-6.4, 1, 21], [-6.4, 4.4, 22],
  [-6.4, 11.2, 23], [-6.4, 14.6, 24], [-6.4, -2.6, 25], [4.3, -6, 26], [14.7, -6, 27], [18.2, -2.6, 28], [21.6, 4.4, 29], [-3, 21.4, 30], [1.2, 21.4, 31], [-6.4, 18, 32],
  [-9.8, 1, 33], [-9.8, 4.4, 34], [-9.8, 11.2, 35], [0.8, -9.4, 36], [4.3, -9.4, 37], [11.2, -9.4, 38], [18.2, -6, 39], [21.6, -2.6, 40],
];
const APTS: [number, number, number, number, number][] = [
  [11, 11, 2.6, 2.6, 2.5], [14.8, 11, 2.6, 2.6, 3.1], [11, 14.8, 2.6, 2.6, 1.9], [14.8, 14.8, 2.6, 2.6, 2.5], [18.6, 11, 2.6, 2.6, 1.9], [11, 18.6, 2.6, 2.6, 3.1],
  [18.6, 14.8, 2.6, 2.6, 3.7], [14.8, 18.6, 2.6, 2.6, 2.5], [18.6, 18.6, 2.6, 2.6, 1.9], [22.4, 11, 2.6, 2.6, 2.5], [11, 22.4, 2.6, 2.6, 2.5], [22.4, 14.8, 2.6, 2.6, 3.1],
];
const TREES: [number, number][] = (() => {
  const t: [number, number][] = [];
  for (let i = -20; i < 32; i += 1.7) {
    if (i > 6.6 && i < 11.2) continue;
    t.push([7.35, i], [i, 7.35], [10.65, i], [i, 10.65]);
  }
  // clusters in yards
  for (let k = 0; k < 150; k++) {
    const x = -20 + hash(k * 3.1) * 50, y = -20 + hash(k * 7.7 + 1) * 50;
    if ((x > 6.5 && x < 11.5) || (y > 6.5 && y < 11.5)) continue;
    if (x > 10.6 && x < 17.6 && y > 0.6 && y < 7.6) continue; // park lot
    if (x > 1 && x < 7.2 && y > 10.6 && y < 17.2) continue; // civic lot
    t.push([x, y]);
  }
  return t.filter(([x, y]) => !HOUSES.some(([hx, hy]) => x > hx - 0.5 && x < hx + 2.5 && y > hy - 0.5 && y < hy + 2.3) && !APTS.some(([ax, ay, aw, ad]) => x > ax - 0.5 && x < ax + aw + 0.4 && y > ay - 0.5 && y < ay + ad + 0.4));
})();

/** visible window in world coords for culling */
const visible = (cam: Cam, x: number, y: number, pad = 220) => {
  const [px, py] = P(x, y, 0);
  const [cx, cy] = P(cam.x, cam.y, 0);
  const sx = W / 2 + (px - cx) * cam.z, sy = (cam.cy ?? 860) + (py - cy) * cam.z;
  return sx > -pad && sx < W + pad && sy > -pad * 1.5 && sy < H + pad;
};

export const City: React.FC<{ cam: Cam; st: CityState }> = ({ cam, st }) => {
  const [cx, cy] = P(cam.x, cam.y, 0);
  const items: Item[] = [];
  const add = (x: number, y: number, el: React.ReactNode, bias = 0) => { if (visible(cam, x, y)) items.push({ k: x + y + bias, el }); };

  // houses / apartments
  HOUSES.forEach(([x, y, v]) => add(x + 1, y + 0.9, <House key={`h${x},${y}`} x={x} y={y} v={v} roof={v % 3 === 2 ? ["#5F9E6E", "#7DB78A", "#477F55"] : [C.roof, C.roofL, C.roofD]} />, 0.5));
  APTS.forEach(([x, y, w, d, h], i) => add(x + w / 2, y + d / 2, <Apartment key={`a${i}`} x={x} y={y} w={w} d={d} h={h} v={i} />, 1));
  TREES.forEach(([x, y], i) => add(x, y, <Tree key={`t${i}`} x={x} y={y} h={1.4 + hash(i) * 0.7} r={0.36 + hash(i + 9) * 0.12} tone={i % 3 === 0 ? 1 : 0} />));

  // park (lot x 11..17, y 1..7)
  const parkTrees: [number, number][] = [[11.4, 1.4], [12.6, 1.3], [13.8, 1.4], [15, 1.3], [16.4, 1.5], [11.4, 2.7], [11.4, 4.1], [11.5, 5.5], [16.6, 2.8], [16.6, 4.2], [16.5, 5.6], [12.2, 6.6], [16.3, 6.6]];
  if (st.park > 0) {
    parkTrees.forEach(([x, y], i) => {
      const s = pop(st.park * 2.2, 0.55 + i * 0.07, 0.35);
      add(x, y, <PopG key={`pt${i}`} x={x} y={y} s={s}><Tree x={x} y={y} h={1.3 + hash(i + 40) * 0.5} r={0.36} tone={i % 2} /></PopG>);
    });
  } else {
    // rocks + a lonely sign post on the empty lot
    [[12.3, 2.4], [15.6, 5.8], [14.1, 3.6], [12.8, 5.2]].forEach(([x, y], i) => add(x, y, <Box key={`r${i}`} x={x} y={y} w={0.3} d={0.25} h={0.14} top="#B3A68A" left={C.rock} right="#86795F" />));
  }

  // civic building on lot x 1.5..7, y 11..16.5
  if (st.civic !== "none" && st.civicS > 0) {
    const el = st.civic === "lib" ? <Library x={2} y={11.6} /> : st.civic === "clinic" ? <Clinic x={2.2} y={11.6} /> : <Cafe x={2.3} y={11.8} />;
    add(4.2, 13.6, <PopG key="civ" x={4.2} y={14} s={st.civicS}>{el}</PopG>, 0.8);
  }

  // bus stops
  if (st.stops > 0) {
    [[4, 7.5], [13.6, 7.5]].forEach(([x, y], i) => add(x + 0.5, y, <PopG key={`bs${i}`} x={x + 0.5} y={y} s={pop(st.stops * 1.4, i * 0.25, 0.4)}><BusStop x={x} y={y} /></PopG>));
  }

  // cars
  LANES.forEach((ln, li) => {
    for (let i = 0; i < 18; i++) {
      const id = li * 20 + i;
      if (ln.dir === "x" && ln.sgn === 1 && st.laneDraw > 0.02) continue; // bus lane cleared
      const leaving = i % 2 === 1;
      if (leaving && st.carFade >= 1) continue;
      let u = (i * (SPAN / 18) + hash(id) * 0.5 + st.T * st.flow * ln.sgn + hash(li) * 7) % SPAN;
      if (u < 0) u += SPAN;
      const pos = S0 + u;
      if (pos > 6.6 && pos < 11.4) continue; // keep the junction readable
      const x = ln.dir === "x" ? pos : ln.at, y = ln.dir === "x" ? ln.at : pos;
      const col = CAR_COLORS[(id * 5) % CAR_COLORS.length];
      const op = leaving ? 1 - st.carFade : 1;
      add(x, y, <g key={`c${id}`} opacity={op}><Car x={x} y={y} dir={ln.dir} color={col} /></g>, 0.2);
    }
  });
  if (st.busX !== null) add(st.busX, 8.5, <Bus key="bus" x={st.busX} y={8.5} />, 0.4);

  // walkers on the sidewalks (tiny low-poly people)
  if (st.people > 0) {
    for (let i = 0; i < 16; i++) {
      const lane = i % 4, sp = 0.35 + hash(i) * 0.25;
      let u = (hash(i * 3) * SPAN + st.T * sp * (i % 2 ? 1 : -1)) % SPAN; if (u < 0) u += SPAN;
      const pos = S0 + u;
      if (pos > 7 && pos < 11) continue;
      const x = lane < 2 ? pos : lane === 2 ? 7.75 : 10.25, y = lane < 2 ? (lane ? 7.75 : 10.25) : pos;
      const [px, py] = P(x, y, 0);
      add(x, y, <g key={`p${i}`} opacity={st.people}>
        <ellipse cx={px} cy={py} rx={7} ry={4} fill="#000" opacity={0.15} />
        <rect x={px - 4} y={py - 26} width={8} height={18} rx={3} fill={CAR_COLORS[(i * 3) % 8]} />
        <rect x={px - 3} y={py - 9} width={6} height={9} fill="#3A3F44" />
        <circle cx={px} cy={py - 31} r={5} fill="#E8C4A0" />
      </g>, 0.1);
    }
  }

  items.sort((a, b) => a.k - b.k);

  // ground
  const blocks: [number, number, number, number][] = [[-30, -30, 8, 8], [10, -30, 50, 8], [-30, 10, 8, 50], [10, 10, 50, 50]];
  const parkP = st.park;
  const grassTiles: React.ReactNode[] = [];
  if (parkP > 0) {
    for (let gx = 11; gx < 17; gx++) for (let gy = 1; gy < 7; gy++) {
      const d = Math.hypot(gx + 0.5 - 14, gy + 0.5 - 4) / 4.3;
      const s = easeOut(clamp((parkP * 1.6 - d * 0.6) * 3));
      if (s <= 0) continue;
      const m = (1 - s) * 0.5;
      grassTiles.push(<Quad key={`g${gx},${gy}`} x0={gx + m} y0={gy + m} x1={gx + 1 - m} y1={gy + 1 - m} z={0.03} fill={(gx + gy) % 2 ? C.grass : C.grassD} />);
    }
  }
  const field = clamp((parkP - 0.45) * 3);
  const lane = st.laneDraw;
  return (
    <g transform={`translate(${W / 2} ${cam.cy ?? 860}) scale(${cam.z}) translate(${-cx} ${-cy})`}>
      <Quad x0={-40} y0={-40} x1={60} y1={60} fill={C.ground} />
      <Quad x0={-30} y0={8} x1={50} y1={10} fill={C.road} />
      <Quad x0={8} y0={-30} x1={10} y1={50} fill={C.road} />
      {blocks.map(([x0, y0, x1, y1], i) => (
        <g key={`b${i}`}>
          <Quad x0={x0} y0={y0} x1={x1} y1={y1} fill={C.curb} />
          <polygon points={pts([[x0 + 0.3, y1 - 0.3, 0], [x1 - 0.3, y1 - 0.3, 0], [x1 - 0.3, y1 - 0.3, -0.06], [x0 + 0.3, y1 - 0.3, -0.06]])} fill={C.curbS} />
          <Quad x0={x0 + 0.5} y0={y0 + 0.5} x1={x1 - 0.5} y1={y1 - 0.5} fill={C.ground} />
        </g>
      ))}
      {/* empty lot (park) + civic lot */}
      <Quad x0={11} y0={1} x1={17} y1={7} z={0.01} fill={C.dirt} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Quad key={`dl${i}`} x0={11.2 + i} y0={1.5 + (i % 3)} x1={11.6 + i} y1={1.7 + (i % 3)} z={0.02} fill={C.dirtD} />)}
      {grassTiles}
      {field > 0 && (
        <g opacity={field}>
          <Quad x0={12.5} y0={2.6} x1={15.5} y1={5.4} z={0.04} fill="#7FB04E" />
          <Quad x0={12.7} y0={2.8} x1={15.3} y1={5.2} z={0.045} fill="#8DBE59" />
          <Quad x0={13.97} y0={2.8} x1={14.03} y1={5.2} z={0.05} fill="#fff" />
          <circle cx={P(14, 4, 0.05)[0]} cy={P(14, 4, 0.05)[1]} r={16} fill="none" stroke="#fff" strokeWidth={3} transform={`translate(0 0)`} />
          <Box x={12.62} y={3.6} w={0.08} d={0.8} h={0.25} z={0.05} top="#fff" left="#eee" right="#ddd" />
          <Box x={15.3} y={3.6} w={0.08} d={0.8} h={0.25} z={0.05} top="#fff" left="#eee" right="#ddd" />
        </g>
      )}
      <Quad x0={1.5} y0={11} x1={7} y1={16.8} z={0.01} fill={st.civic === "none" ? C.dirt : C.groundD} />
      {/* lane markings */}
      {Array.from({ length: 24 }, (_, i) => -24 + i * 2.6).filter((v) => v < 7 || v > 10.5).map((v, i) => (
        <g key={`ln${i}`}>
          <Quad x0={v} y0={8.97} x1={v + 1.1} y1={9.03} fill={C.lane} op={0.85} />
          <Quad x0={8.97} y0={v} x1={9.03} y1={v + 1.1} fill={C.lane} op={0.85} />
        </g>
      ))}
      {/* crosswalks */}
      {Array.from({ length: 7 }, (_, i) => 8.1 + i * 0.27).map((v, i) => (
        <g key={`cw${i}`}>
          <Quad x0={7.2} y0={v} x1={7.75} y1={v + 0.14} fill={C.lane} op={0.9} />
          <Quad x0={10.25} y0={v} x1={10.8} y1={v + 0.14} fill={C.lane} op={0.9} />
          <Quad x0={v} y0={7.2} x1={v + 0.14} y1={7.75} fill={C.lane} op={0.9} />
          <Quad x0={v} y0={10.25} x1={v + 0.14} y1={10.8} fill={C.lane} op={0.9} />
        </g>
      ))}
      {/* bus lane painted lime */}
      {lane > 0 && (
        <>
          <Quad x0={-12} y0={8.06} x1={lerp(-12, 30, lane)} y1={8.94} z={0.005} fill={C.lime} op={0.32} />
          <Quad x0={-12} y0={8.06} x1={lerp(-12, 30, lane)} y1={8.16} z={0.006} fill={C.lime} />
          <Quad x0={-12} y0={8.84} x1={lerp(-12, 30, lane)} y1={8.94} z={0.006} fill={C.lime} />
        </>
      )}
      {items.map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
    </g>
  );
};
