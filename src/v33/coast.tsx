// V33 — Bandar Abbas: a coastal isometric neighbourhood (badgir houses, palms, shade sails, beach, pier with lights, water stations, sea).
// Primitives come from the V31 engine; same projection and palette family, warmer walls + sea teal.
import React from "react";
import { Box, Car, PopG, Quad, Tree, shade } from "../v31/iso";
import { C, Cam, H, P, TH, TW, W, clamp, easeOut, hash, pop } from "./kit";

type V3 = [number, number, number];
const pts = (a: V3[]) => a.map(([x, y, z]) => P(x, y, z).map((n) => n.toFixed(1)).join(",")).join(" ");

export const SEA = "#3FA7B5", SEA_D = "#2E8C9A", SEA_L = "#7FD0D6", SAND = "#EAD7A8", SAND_D = "#D8C08A", WALL = "#F1E4C8", WALL_S = "#DCC9A4", WALL_D = "#C4AE85";

/** coastal house with a square wind-catcher (badgir) tower and flat roof */
export const BadgirHouse: React.FC<{ x: number; y: number; w?: number; d?: number; h?: number; v?: number }> = ({ x, y, w = 2.1, d = 1.9, h = 0.9, v = 0 }) => {
  const x1 = x + w, y1 = y + d;
  const tw = 0.5, th = 0.85, tx = x + (v % 2 ? 0.3 : w - 0.8), ty = y + 0.3;
  const win = (u0: number, u1: number, v0: number, v1: number) => <polygon points={pts([[u0, y1, v0], [u1, y1, v0], [u1, y1, v1], [u0, y1, v1]])} fill="#6B8C93" />;
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={h} top={WALL_S} left={v % 3 === 1 ? "#F6EBD5" : WALL} right={WALL_D} />
      {win(x + 0.25, x + 0.6, 0.35, 0.7)}
      {win(x + w - 0.6, x + w - 0.25, 0.35, 0.7)}
      <polygon points={pts([[x + w * 0.42, y1, 0], [x + w * 0.58, y1, 0], [x + w * 0.58, y1, 0.62], [x + w * 0.42, y1, 0.62]])} fill={v % 2 ? "#2E8C9A" : "#7A5A3C"} />
      {[0.4, 0.75, 1.1].map((dv, i) => <polygon key={i} points={pts([[x1, y + dv, 0.35], [x1, y + dv + 0.22, 0.35], [x1, y + dv + 0.22, 0.68], [x1, y + dv, 0.68]])} fill="#5C7B82" opacity={0.85} />)}
      {/* parapet */}
      <Box x={x} y={y} w={w} d={0.08} h={0.12} z={h} top={WALL} left={WALL_S} right={WALL_D} />
      <Box x={x1 - 0.08} y={y} w={0.08} d={d} h={0.12} z={h} top={WALL} left={WALL_S} right={WALL_D} />
      {/* badgir */}
      <Box x={tx} y={ty} w={tw} d={tw} h={th} z={h} top={WALL_S} left={WALL} right={WALL_D} />
      {[0.12, 0.3].map((u, i) => <polygon key={`b${i}`} points={pts([[tx + u, ty + tw, h + th * 0.45], [tx + u + 0.1, ty + tw, h + th * 0.45], [tx + u + 0.1, ty + tw, h + th * 0.9], [tx + u, ty + tw, h + th * 0.9]])} fill="#4E5F63" />)}
      {[0.12, 0.3].map((u, i) => <polygon key={`c${i}`} points={pts([[tx + tw, ty + u, h + th * 0.45], [tx + tw, ty + u + 0.1, h + th * 0.45], [tx + tw, ty + u + 0.1, h + th * 0.9], [tx + tw, ty + u, h + th * 0.9]])} fill="#3E4D51" />)}
      <Box x={tx - 0.04} y={ty - 0.04} w={tw + 0.08} d={tw + 0.08} h={0.06} z={h + th} top="#fff" left={WALL_S} right={WALL_D} />
    </g>
  );
};

/** date palm: curved trunk + fronds, gentle sway */
export const Palm: React.FC<{ x: number; y: number; h?: number; T: number; k?: number }> = ({ x, y, h = 2.2, T, k = 0 }) => {
  const [bx, by] = P(x, y, 0);
  const top = h * 72;
  const sw = Math.sin(T * 1.6 + k) * 4;
  const cx = bx + 10 + sw, cy = by - top;
  const fronds = [-150, -115, -70, -35, 0, 35, 75, 115, 160];
  return (
    <g>
      <ellipse cx={bx + 14} cy={by + 2} rx={34} ry={14} fill="#000" opacity={0.12} />
      <path d={`M${bx - 4} ${by} Q${bx + 14} ${by - top * 0.5} ${cx - 3} ${cy} L${cx + 3} ${cy} Q${bx + 20} ${by - top * 0.5} ${bx + 4} ${by} Z`} fill="#8A6A45" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${bx - 3 + i * 1.6} ${by - (i + 0.5) * top / 6.5} l7 -4`} stroke="#6E5235" strokeWidth={2} />)}
      {fronds.map((a, i) => {
        const r = (a * Math.PI) / 180, L = 54 + (i % 2) * 10;
        const ex = cx + Math.sin(r) * L, ey = cy + Math.cos(r) * L * 0.45 + 18 - (Math.abs(a) < 60 ? 26 : 0);
        const mx = cx + Math.sin(r) * L * 0.5, my = cy - 16;
        return <path key={i} d={`M${cx} ${cy} Q${mx} ${my} ${ex} ${ey} Q${mx + 4} ${my + 12} ${cx} ${cy + 4} Z`} fill={i % 2 ? C.tree : C.treeL} />;
      })}
      <circle cx={cx} cy={cy + 6} r={6} fill="#B5762E" />
    </g>
  );
};

/** triangular shade sail on three poles */
export const ShadeSail: React.FC<{ x: number; y: number; along: "x" | "y"; col: string }> = ({ x, y, along, col }) => {
  const a: V3 = [x, y, 1.25], b: V3 = along === "x" ? [x + 1.4, y, 1.1] : [x, y + 1.4, 1.1], c: V3 = along === "x" ? [x + 0.7, y + 0.8, 1.35] : [x + 0.8, y + 0.7, 1.35];
  const pole = (p: V3) => { const [px, py] = P(p[0], p[1], 0); const [, ty] = P(p[0], p[1], p[2]); return <line x1={px} y1={py} x2={px} y2={ty} stroke="#8D8F87" strokeWidth={3} />; };
  return (
    <g>
      <polygon points={pts([[a[0], a[1], 0], [b[0], b[1], 0], [c[0], c[1], 0]])} fill="#000" opacity={0.13} />
      {pole(a)}{pole(b)}{pole(c)}
      <polygon points={pts([a, b, c])} fill={col} opacity={0.95} />
      <polygon points={pts([a, b, c])} fill="none" stroke="#fff" strokeWidth={2} opacity={0.7} />
    </g>
  );
};

export const WaterStation: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const [dx, dy] = P(x + 0.25, y + 0.25, 1.05);
  return (
    <g>
      <Box x={x} y={y} w={0.5} d={0.5} h={0.75} top="#E8F6F8" left="#56B8C6" right="#3E98A6" />
      <Box x={x - 0.05} y={y - 0.05} w={0.6} d={0.6} h={0.06} z={0.75} top={SEA_L} left={SEA} right={SEA_D} />
      <path d={`M${dx} ${dy - 22} C${dx + 12} ${dy - 6} ${dx + 10} ${dy + 6} ${dx} ${dy + 6} C${dx - 10} ${dy + 6} ${dx - 12} ${dy - 6} ${dx} ${dy - 22} Z`} fill="#2E9BD6" stroke="#fff" strokeWidth={3} />
    </g>
  );
};

export const Boat: React.FC<{ x: number; y: number; T: number; k?: number }> = ({ x, y, T, k = 0 }) => {
  const bob = Math.sin(T * 2 + k) * 0.04;
  return (
    <g transform={`translate(0 ${bob * 72})`}>
      <Box x={x} y={y} w={1.6} d={0.55} h={0.3} top="#C98B4A" left="#A86E36" right="#8C5A2A" />
      <Box x={x + 0.9} y={y + 0.1} w={0.45} d={0.35} h={0.32} z={0.3} top="#fff" left="#EDEDE6" right="#D3D3CB" />
      <Box x={x + 0.1} y={y + 0.24} w={0.06} d={0.06} h={1.1} z={0.3} top="#7A5A3C" left="#7A5A3C" right="#5E442C" />
    </g>
  );
};

// ───────── the coastal neighbourhood ─────────
export type CoastState = { T: number; palms: number; sails: number; pier: number; lights: number; water: number; flow: number };

const HOUSES: [number, number, number][] = [
  [0.8, 1, 0], [4.3, 1, 1], [0.8, 4.4, 2], [4.3, 4.4, 3], [-3, 1, 4], [-3, 4.4, 5], [0.8, -2.6, 6], [4.3, -2.6, 7], [-3, -2.6, 8],
  [11.2, 1, 9], [14.7, 1, 10], [11.2, 4.4, 11], [14.7, 4.4, 12], [18.2, 1, 13], [18.2, 4.4, 14], [11.2, -2.6, 15], [14.7, -2.6, 16],
  [0.8, 11, 17], [4.3, 11, 18], [-3, 11, 19], [11.2, 11, 20], [14.7, 11, 21], [18.2, 11, 22], [-6.4, 1, 23], [-6.4, 4.4, 24], [-6.4, 11, 25],
  [21.6, 1, 26], [21.6, 4.4, 27], [21.6, 11, 28], [0.8, -6, 29], [11.2, -6, 30],
];
const PALMS: [number, number][] = (() => {
  const t: [number, number][] = [];
  for (let i = -8; i < 26; i += 2.2) { if (i > 6.4 && i < 11.4) continue; t.push([i, 7.45], [i, 10.55]); }
  for (let i = -6; i < 15; i += 2.2) { if (i > 6.4 && i < 11.4) continue; t.push([7.45, i], [10.55, i]); }
  return t;
})();
const SAILS: [number, number, "x" | "y"][] = (() => {
  const t: [number, number, "x" | "y"][] = [];
  for (let i = -7; i < 25; i += 4.4) { if (i > 5 && i < 11.4) continue; t.push([i + 0.4, 6.4, "x"], [i + 0.4, 10.9, "x"]); }
  return t;
})();
const STATIONS: [number, number][] = [[6.6, 6.6], [10.9, 6.6], [6.6, 10.9], [10.9, 10.9], [4, 15.3], [15.5, 15.3]];
const CAR_COLORS = ["#E9E6DC", "#6C8C99", "#D9A441", "#9C5B4B", "#3E4E5A", "#C7CBC4", "#7FA36A"];

const visible = (cam: Cam, x: number, y: number, pad = 240) => {
  const [px, py] = P(x, y, 0);
  const [cx, cy] = P(cam.x, cam.y, 0);
  const sx = W / 2 + (px - cx) * cam.z, sy = (cam.cy ?? 860) + (py - cy) * cam.z;
  return sx > -pad && sx < W + pad && sy > -pad * 1.5 && sy < H + pad;
};

export const Coast: React.FC<{ cam: Cam; st: CoastState }> = ({ cam, st }) => {
  const [cx, cy] = P(cam.x, cam.y, 0);
  const items: { k: number; el: React.ReactNode }[] = [];
  const add = (x: number, y: number, el: React.ReactNode, b = 0) => { if (visible(cam, x, y)) items.push({ k: x + y + b, el }); };
  HOUSES.forEach(([x, y, v]) => add(x + 1, y + 0.9, <BadgirHouse key={`h${v}`} x={x} y={y} v={v} />, 0.5));
  // background greenery inland
  for (let k = 0; k < 40; k++) {
    const x = -14 + hash(k * 2.3) * 40, y = -14 + hash(k * 5.1 + 2) * 12;
    if ((x > 6.5 && x < 11.5) || (y > 6.5 && y < 11.5)) continue;
    if (HOUSES.some(([hx, hy]) => x > hx - 0.5 && x < hx + 2.6 && y > hy - 0.5 && y < hy + 2.4)) continue;
    add(x, y, <Tree key={`t${k}`} x={x} y={y} h={1.3 + hash(k) * 0.4} r={0.34} tone={k % 2} />);
  }
  // palms (pop in along the sidewalks)
  PALMS.forEach(([x, y], i) => {
    const s = st.palms >= 1 ? 1 : pop(st.palms * 2.4, (i % 12) * 0.12, 0.35);
    add(x, y, <PopG key={`p${i}`} x={x} y={y} s={s}><Palm x={x} y={y} T={st.T} k={i} h={2 + hash(i) * 0.5} /></PopG>, 0.3);
  });
  SAILS.forEach(([x, y, a], i) => {
    const s = st.sails >= 1 ? 1 : pop(st.sails * 2.2, (i % 8) * 0.14, 0.35);
    add(x + 0.7, y + 0.4, <PopG key={`s${i}`} x={x + 0.7} y={y + 0.4} s={s}><ShadeSail x={x} y={y} along={a} col={i % 2 ? "#FFFFFF" : SEA_L} /></PopG>, 0.6);
  });
  STATIONS.forEach(([x, y], i) => {
    const s = st.water >= 1 ? 1 : pop(st.water * 2, i * 0.15, 0.4);
    add(x + 0.25, y + 0.25, <PopG key={`w${i}`} x={x + 0.25} y={y + 0.25} s={s}><WaterStation x={x} y={y} /></PopG>, 0.4);
  });
  // cars
  [{ d: "x" as const, at: 8.5, sg: 1 }, { d: "x" as const, at: 9.5, sg: -1 }, { d: "y" as const, at: 8.5, sg: 1 }, { d: "y" as const, at: 9.5, sg: -1 }].forEach((ln, li) => {
    for (let i = 0; i < 9; i++) {
      const span = ln.d === "x" ? 34 : 24, s0 = ln.d === "x" ? -9 : -9;
      let u = (i * (span / 9) + hash(li * 9 + i) * 1.5 + st.T * st.flow * ln.sg) % span; if (u < 0) u += span;
      const pos = s0 + u;
      if (pos > 6.8 && pos < 11.2) continue;
      if (ln.d === "y" && pos > 14) continue;
      const x = ln.d === "x" ? pos : ln.at, y = ln.d === "x" ? ln.at : pos;
      add(x, y, <Car key={`c${li}-${i}`} x={x} y={y} dir={ln.d} color={CAR_COLORS[(li * 9 + i) % CAR_COLORS.length]} />, 0.2);
    }
  });
  // pier lamps + boats
  const PIER_END = 16.8 + 6.5 * clamp(st.pier);
  for (let k = 0; k < 5; k++) {
    const y = 17.3 + k * 1.4;
    if (y > PIER_END - 0.2) continue;
    [12.05, 13.15].forEach((x, j) => {
      const [lx, ly] = P(x, y, 0.05);
      const [, ty] = P(x, y, 1.1);
      const on = st.lights > (k * 2 + j) / 10;
      const col = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF8AD8"][(k + j) % 5];
      add(x, y, <g key={`l${k}${j}`}>
        <line x1={lx} y1={ly} x2={lx} y2={ty} stroke="#5E5E58" strokeWidth={3} />
        {on && <circle cx={lx} cy={ty} r={22} fill={col} opacity={0.28} />}
        <circle cx={lx} cy={ty} r={7} fill={on ? col : "#CFCFC6"} />
      </g>, 0.9);
    });
  }
  [[15.5, 19.5, 0], [8.5, 21.5, 1.7], [18, 23.5, 3.1]].forEach(([x, y, k]) => add(x + 0.8, y + 0.3, <Boat key={`b${k}`} x={x} y={y} T={st.T} k={k} />, 1));
  items.sort((a, b) => a.k - b.k);

  // ground
  const waves: React.ReactNode[] = [];
  for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
    const x = -14 + c * 4.2 + ((r % 2) * 2.1) + Math.sin(st.T * 0.8 + r) * 0.4, y = 18 + r * 1.3;
    waves.push(<Quad key={`wv${r}-${c}`} x0={x} y0={y} x1={x + 1.4} y1={y + 0.08} z={0.01} fill={SEA_L} op={0.55} />);
  }
  const pierLen = clamp(st.pier);
  const blocks: [number, number, number, number][] = [[-30, -30, 8, 8], [10, -30, 50, 8], [-30, 10, 8, 14.6], [10, 10, 50, 14.6]];
  const lightStrings: React.ReactNode[] = [];
  if (st.lights > 0) {
    for (let k = 0; k < 4; k++) {
      const y0 = 17.3 + k * 1.4, y1 = y0 + 1.4;
      if (y1 > PIER_END - 0.2) continue;
      [12.05, 13.15].forEach((x, j) => {
        const [ax, ay] = P(x, y0, 1.1), [bx, by] = P(x, y1, 1.1);
        lightStrings.push(<path key={`ls${k}${j}`} d={`M${ax} ${ay} Q${(ax + bx) / 2} ${(ay + by) / 2 + 14} ${bx} ${by}`} stroke="#FFE9A8" strokeWidth={2} fill="none" opacity={0.85 * st.lights} />);
      });
    }
  }
  return (
    <g transform={`translate(${W / 2} ${cam.cy ?? 860}) scale(${cam.z}) translate(${-cx} ${-cy})`}>
      <Quad x0={-40} y0={-40} x1={60} y1={17.5} fill={C.ground} />
      <Quad x0={-40} y0={17.2} x1={60} y1={70} fill={SEA} />
      <Quad x0={-40} y0={19} x1={60} y1={70} fill={SEA_D} op={0.35} />
      {waves}
      <Quad x0={-40} y0={14.6} x1={60} y1={17.6} fill={SAND} />
      {Array.from({ length: 30 }, (_, i) => <Quad key={`sd${i}`} x0={-14 + i * 1.5} y0={15.6 + (i % 3) * 0.5} x1={-13.7 + i * 1.5} y1={15.75 + (i % 3) * 0.5} fill={SAND_D} />)}
      {/* foam line */}
      <Quad x0={-40} y0={17.35 + Math.sin(st.T * 1.5) * 0.08} x1={60} y1={17.55 + Math.sin(st.T * 1.5) * 0.08} z={0.01} fill="#fff" op={0.7} />
      <Quad x0={-30} y0={8} x1={50} y1={10} fill={C.road} />
      <Quad x0={8} y0={-30} x1={10} y1={14.6} fill={C.road} />
      {blocks.map(([x0, y0, x1, y1], i) => (
        <g key={`bl${i}`}>
          <Quad x0={x0} y0={y0} x1={x1} y1={y1} fill={C.curb} />
          <Quad x0={x0 + 0.5} y0={y0 + 0.5} x1={x1 - 0.5} y1={y1 - 0.5} fill={i < 2 ? "#D9D2A6" : "#D9D2A6"} />
        </g>
      ))}
      {/* promenade along the beach */}
      <Quad x0={-40} y0={14.6} x1={60} y1={15.2} z={0.02} fill="#E7E2CF" />
      {Array.from({ length: 24 }, (_, i) => -24 + i * 2.6).filter((v) => v < 7 || v > 10.5).map((v, i) => (
        <g key={`ln${i}`}>
          <Quad x0={v} y0={8.97} x1={v + 1.1} y1={9.03} fill={C.lane} op={0.85} />
          {v < 13.5 && <Quad x0={8.97} y0={v} x1={9.03} y1={v + 1.1} fill={C.lane} op={0.85} />}
        </g>
      ))}
      {/* pier planks */}
      {pierLen > 0 && Array.from({ length: Math.ceil(pierLen * 22) }, (_, i) => {
        const y = 15.6 + i * 0.36;
        return <Box key={`pk${i}`} x={11.9} y={y} w={1.4} d={0.32} h={0.08} z={0.1} top={i % 2 ? "#C9A06A" : "#BE9460"} left="#8E6A40" right="#7A5A36" />;
      })}
      {pierLen >= 1 && <Box x={11.2} y={23.2} w={2.8} d={1.8} h={0.08} z={0.1} top="#C9A06A" left="#8E6A40" right="#7A5A36" />}
      {lightStrings}
      {items.map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
    </g>
  );
};
export { shade, TH, TW, easeOut };
