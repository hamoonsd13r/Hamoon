// V40 — Ahvaz: a riverside isometric neighbourhood (Karun river, a white arch bridge, riverside park, elevated metro, palms).
// Primitives come from the V31/V33/V36 engines; same projection and palette family.
import React from "react";
import { Box, Car, PopG, Quad } from "../v31/iso";
import { Boat, Palm } from "../v33/coast";
import { Train } from "../v36/iso";
import { C, Cam, H, P, W, clamp, easeOut, hash, pop } from "./kit";

type V3 = [number, number, number];
const pts = (a: V3[]) => a.map(([x, y, z]) => P(x, y, z).map((n) => n.toFixed(1)).join(",")).join(" ");

export const RIVER = "#4E9E9C", RIVER_D = "#3C8582", RIVER_L = "#86C9C3", DRY = "#D8C9A0", DRY_D = "#C4B386";
const WALL = "#EBDCC0", WALL_S = "#D6C39F", WALL_D = "#BFA982", BRICK = "#C98E62";

/** flat-roofed Khuzestan house with brick trim */
export const FlatHouse: React.FC<{ x: number; y: number; w?: number; d?: number; h?: number; v?: number }> = ({ x, y, w = 2.1, d = 1.9, h = 0.95, v = 0 }) => {
  const y1 = y + d, x1 = x + w;
  const hh = h + (v % 3 === 0 ? 0.6 : 0);
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={hh} top={WALL_S} left={v % 2 ? "#F1E4CB" : WALL} right={WALL_D} />
      {[0, 1].map((r) => r * 0.6 < hh - 0.4 && [0.2, 0.75, 1.3].filter((u) => u + 0.4 < w).map((u) => (
        <polygon key={`${r}-${u}`} points={pts([[x + u, y1, 0.3 + r * 0.6], [x + u + 0.38, y1, 0.3 + r * 0.6], [x + u + 0.38, y1, 0.62 + r * 0.6], [x + u, y1, 0.62 + r * 0.6]])} fill="#5F7F86" />
      )))}
      {[0.4, 1.1].map((u) => <polygon key={`s${u}`} points={pts([[x1, y + u, 0.3], [x1, y + u + 0.3, 0.3], [x1, y + u + 0.3, 0.62], [x1, y + u, 0.62]])} fill="#4F6C72" opacity={0.85} />)}
      <polygon points={pts([[x, y1, hh - 0.12], [x1, y1, hh - 0.12], [x1, y1, hh], [x, y1, hh]])} fill={BRICK} />
      <polygon points={pts([[x1, y, hh - 0.12], [x1, y1, hh - 0.12], [x1, y1, hh], [x1, y, hh]])} fill="#B27A52" />
      <Box x={x + 0.25} y={y + 0.3} w={0.5} d={0.4} h={0.32} z={hh} top="#E9EEF0" left="#C9D2D6" right="#AFB9BE" />
    </g>
  );
};

/** white steel arch bridge across the river, continuing the north–south road */
const Bridge: React.FC = () => {
  const x0 = 8, x1 = 10, ys = 16.6, ye = 24.6, z = 0.55;
  const arches = [0, 1, 2];
  const span = (ye - ys) / 3;
  return (
    <g>
      {[ys + span, ys + span * 2].map((py) => <Box key={py} x={x0 + 0.3} y={py - 0.2} w={1.4} d={0.4} h={z} top="#D5D5CD" left="#C2C2B9" right="#A8A89F" />)}
      <Box x={x0} y={ys} w={x1 - x0} d={ye - ys} h={0.12} z={z} top="#5B6062" left="#E9E9E2" right="#CFCFC7" />
      <Quad x0={x0 + 0.95} y0={ys} x1={x0 + 1.05} y1={ye} z={z + 0.125} fill="#F2F0E6" />
      {[x0 + 0.06, x1 - 0.06].map((ax, side) => arches.map((k) => {
        const a = ys + span * k, b = a + span;
        const p0 = P(ax, a, z + 0.12), pm = P(ax, (a + b) / 2, z + 1.9), p1 = P(ax, b, z + 0.12);
        const hangers = [0.2, 0.35, 0.5, 0.65, 0.8].map((t) => {
          const yy = a + (b - a) * t;
          const top = z + 0.12 + 1.75 * Math.sin(Math.PI * t) * 0.98;
          const q0 = P(ax, yy, z + 0.12), q1 = P(ax, yy, top);
          return <line key={t} x1={q0[0]} y1={q0[1]} x2={q1[0]} y2={q1[1]} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.9} />;
        });
        return (
          <g key={`${side}-${k}`}>
            {hangers}
            <path d={`M${p0[0]} ${p0[1]} Q${2 * pm[0] - (p0[0] + p1[0]) / 2} ${2 * pm[1] - (p0[1] + p1[1]) / 2} ${p1[0]} ${p1[1]}`} stroke="#FFFFFF" strokeWidth={9} fill="none" />
            <path d={`M${p0[0]} ${p0[1]} Q${2 * pm[0] - (p0[0] + p1[0]) / 2} ${2 * pm[1] - (p0[1] + p1[1]) / 2} ${p1[0]} ${p1[1]}`} stroke="#D9DCD6" strokeWidth={3} fill="none" />
          </g>
        );
      }))}
    </g>
  );
};

const Bench: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <Box x={x} y={y} w={0.7} d={0.22} h={0.18} top="#A86E3E" left="#8C5A30" right="#734A27" />
    <Box x={x} y={y - 0.04} w={0.7} d={0.06} h={0.18} z={0.18} top="#A86E3E" left="#8C5A30" right="#734A27" />
  </g>
);
const Lamp: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => {
  const [lx, ly] = P(x, y, 0);
  const [, ty] = P(x, y, 1.15);
  return (
    <g>
      <line x1={lx} y1={ly} x2={lx} y2={ty} stroke="#4E5456" strokeWidth={3} />
      {on > 0 && <circle cx={lx} cy={ty} r={20} fill="#FFE9A8" opacity={0.3 * on} />}
      <circle cx={lx} cy={ty} r={6} fill={on > 0 ? "#FFE9A8" : "#D9D9D0"} />
    </g>
  );
};

export type RiverState = { T: number; park: number; metro: number; trainX: number | null; palms: number; flow: number };

const NEAR: [number, number, number][] = [
  [0.8, 1, 0], [4.3, 1, 1], [0.8, 4.4, 2], [4.3, 4.4, 3], [-3, 1, 4], [-3, 4.4, 5], [0.8, -2.6, 6], [4.3, -2.6, 7], [-3, -2.6, 8],
  [11.2, 1, 9], [14.7, 1, 10], [11.2, 4.4, 11], [14.7, 4.4, 12], [18.2, 1, 13], [18.2, 4.4, 14], [11.2, -2.6, 15], [14.7, -2.6, 16],
  [0.8, 11, 17], [4.3, 11, 18], [-3, 11, 19], [11.2, 11, 20], [14.7, 11, 21], [18.2, 11, 22], [-6.4, 1, 23], [-6.4, 4.4, 24], [-6.4, 11, 25],
  [21.6, 1, 26], [21.6, 4.4, 27], [21.6, 11, 28], [0.8, -6, 29], [11.2, -6, 30],
];
const FAR: [number, number, number][] = Array.from({ length: 12 }, (_, i) => [-8 + i * 3.1 + (i > 4 ? 1.6 : 0), 25.6 + (i % 2) * 0.6, 40 + i] as [number, number, number]).filter(([x]) => x < 6.8 || x > 10.6);
const PALMS: [number, number][] = (() => {
  const t: [number, number][] = [];
  for (let i = -8; i < 26; i += 2.2) { if (i > 6.4 && i < 11.4) continue; t.push([i, 7.45], [i, 10.55]); }
  for (let i = -6; i < 14; i += 2.2) { if (i > 6.4 && i < 11.4) continue; t.push([7.45, i], [10.55, i]); }
  return t;
})();
const PARK_TREES: [number, number][] = [[1, 15.9], [3.2, 16.4], [5.4, 15.8], [12.4, 16.3], [14.8, 15.8], [17, 16.4], [-1.4, 16.2], [19.4, 15.9]];
const BENCHES: [number, number][] = [[2, 16.7], [4.4, 16.8], [13.2, 16.8], [15.8, 16.7], [0, 16.7], [18, 16.8]];
const LAMPS: [number, number][] = [[1.4, 17.1], [4, 17.1], [6.5, 17.1], [11.6, 17.1], [14.2, 17.1], [16.8, 17.1], [-1.2, 17.1], [19.4, 17.1]];
const CAR_COLORS = ["#E9E6DC", "#6C8C99", "#D9A441", "#9C5B4B", "#3E4E5A", "#C7CBC4", "#7FA36A"];

const visible = (cam: Cam, x: number, y: number, pad = 260) => {
  const [px, py] = P(x, y, 0);
  const [cx, cy] = P(cam.x, cam.y, 0);
  const sx = W / 2 + (px - cx) * cam.z, sy = (cam.cy ?? 860) + (py - cy) * cam.z;
  return sx > -pad && sx < W + pad && sy > -pad * 1.5 && sy < H + pad;
};

export const River: React.FC<{ cam: Cam; st: RiverState }> = ({ cam, st }) => {
  const [cx, cy] = P(cam.x, cam.y, 0);
  const items: { k: number; el: React.ReactNode }[] = [];
  const add = (x: number, y: number, el: React.ReactNode, b = 0) => { if (visible(cam, x, y)) items.push({ k: x + y + b, el }); };
  NEAR.forEach(([x, y, v]) => add(x + 1, y + 0.9, <FlatHouse key={`h${v}`} x={x} y={y} v={v} />, 0.5));
  FAR.forEach(([x, y, v]) => add(x + 1, y + 0.9, <FlatHouse key={`f${v}`} x={x} y={y} v={v} />, 0.5));
  PALMS.forEach(([x, y], i) => {
    const s = st.palms >= 1 ? 1 : pop(st.palms * 2.4, (i % 12) * 0.12, 0.35);
    add(x, y, <PopG key={`p${i}`} x={x} y={y} s={s}><Palm x={x} y={y} T={st.T} k={i} h={2 + hash(i) * 0.5} /></PopG>, 0.3);
  });
  // park furniture
  if (st.park > 0) {
    PARK_TREES.forEach(([x, y], i) => add(x, y, <PopG key={`pt${i}`} x={x} y={y} s={pop(st.park * 2.2, 0.5 + i * 0.08, 0.35)}><Palm x={x} y={y} T={st.T} k={i + 30} h={1.9} /></PopG>, 0.3));
    BENCHES.forEach(([x, y], i) => add(x + 0.35, y, <PopG key={`b${i}`} x={x + 0.35} y={y} s={pop(st.park * 2.2, 0.8 + i * 0.08, 0.3)}><Bench x={x} y={y} /></PopG>, 0.2));
    LAMPS.forEach(([x, y], i) => add(x, y, <PopG key={`l${i}`} x={x} y={y} s={pop(st.park * 2.2, 1 + i * 0.06, 0.3)}><Lamp x={x} y={y} on={clamp(st.park * 2 - 1)} /></PopG>, 0.25));
    for (let i = 0; i < 10; i++) {
      const sp = 0.3 + hash(i) * 0.3;
      let u = (hash(i * 3) * 30 + st.T * sp * (i % 2 ? 1 : -1)) % 30; if (u < 0) u += 30;
      const x = -8 + u, y = 15.4 + hash(i * 5) * 1.6;
      if (x > 7.6 && x < 10.4) continue;
      const [px, py] = P(x, y, 0);
      add(x, y, <g key={`pp${i}`} opacity={clamp(st.park * 2 - 0.8)}>
        <ellipse cx={px} cy={py} rx={7} ry={4} fill="#000" opacity={0.15} />
        <rect x={px - 4} y={py - 26} width={8} height={18} rx={3} fill={CAR_COLORS[(i * 3) % 7]} />
        <rect x={px - 3} y={py - 9} width={6} height={9} fill="#3A3F44" />
        <circle cx={px} cy={py - 31} r={5} fill="#D9B08C" />
      </g>, 0.1);
    }
  }
  // cars
  [{ d: "x" as const, at: 8.5, sg: 1 }, { d: "x" as const, at: 9.5, sg: -1 }, { d: "y" as const, at: 8.5, sg: 1 }, { d: "y" as const, at: 9.5, sg: -1 }].forEach((ln, li) => {
    for (let i = 0; i < 9; i++) {
      const span = 34;
      let u = (i * (span / 9) + hash(li * 9 + i) * 1.5 + st.T * st.flow * ln.sg) % span; if (u < 0) u += span;
      const pos = -9 + u;
      if (pos > 6.8 && pos < 11.2) continue;
      if (ln.d === "y" && pos > 14 && pos < 16.4) continue;
      if (ln.d === "y" && pos > 25) continue;
      const x = ln.d === "x" ? pos : ln.at, y = ln.d === "x" ? ln.at : pos;
      const z = ln.d === "y" && pos > 16.4 && pos < 24.6 ? 0.67 : 0;
      add(x, y, <g key={`c${li}-${i}`} transform={`translate(0 ${-z * 72})`}><Car x={x} y={y} dir={ln.d} color={CAR_COLORS[(li * 9 + i) % 7]} /></g>, z ? 0.9 : 0.2);
    }
  });
  // metro
  if (st.metro > 0) {
    const xEnd = -20 + 50 * st.metro;
    for (let x = -20; x < xEnd; x += 1) {
      const w = Math.min(1, xEnd - x);
      const pillar = Math.round(x) % 3 === 0 && (x < 7 || x > 10.5);
      add(x + 0.5, 9, <g key={`m${x}`}>
        {pillar && <Box x={x + 0.35} y={8.85} w={0.3} d={0.3} h={1.3} top="#D8D8D0" left="#C4C4BA" right="#A9A99F" />}
        <Box x={x} y={8.68} w={w} d={0.64} h={0.12} z={1.3} top="#E2E2DA" left="#B9B9AF" right="#A0A096" />
      </g>, 1.6);
    }
  }
  if (st.trainX != null) add(st.trainX, 9, <Train key="train" x={st.trainX} />, 1.8);
  [[3.5, 20.2, 0], [14.5, 21.4, 1.7]].forEach(([x, y, k]) => add(x + 0.8, y + 0.3, <Boat key={`bt${k}`} x={x} y={y} T={st.T} k={k} />, 1));
  add(9, 20.6, <Bridge key="bridge" />, 1.2);
  items.sort((a, b) => a.k - b.k);

  // ground
  const waves: React.ReactNode[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
    const x = -14 + c * 4.2 + ((r % 2) * 2.1) + ((st.T * 0.6 + r * 0.7) % 4.2), y = 18.1 + r * 1.1;
    waves.push(<Quad key={`wv${r}-${c}`} x0={x} y0={y} x1={x + 1.2} y1={y + 0.07} z={0.01} fill={RIVER_L} op={0.5} />);
  }
  const blocks: [number, number, number, number][] = [[-30, -30, 8, 8], [10, -30, 50, 8], [-30, 10, 8, 14.6], [10, 10, 50, 14.6]];
  const grass: React.ReactNode[] = [];
  if (st.park > 0) {
    for (let gx = -12; gx < 24; gx++) {
      if (gx >= 8 && gx < 10) continue;
      const d = Math.abs(gx + 0.5 - 9) / 18;
      const s = easeOut(clamp((st.park * 1.6 - d * 0.6) * 3));
      if (s <= 0) continue;
      grass.push(<Quad key={`g${gx}`} x0={gx} y0={15.2 + (1 - s) * 1.5} x1={gx + 1} y1={17.1} z={0.015} fill={gx % 2 ? C.grass : C.grassD} />);
    }
  }
  return (
    <g transform={`translate(${W / 2} ${cam.cy ?? 860}) scale(${cam.z}) translate(${-cx} ${-cy})`}>
      <Quad x0={-40} y0={-40} x1={60} y1={70} fill={C.ground} />
      <Quad x0={-40} y0={17.3} x1={60} y1={24.8} fill={RIVER} />
      <Quad x0={-40} y0={18.6} x1={60} y1={23.6} fill={RIVER_D} op={0.3} />
      {waves}
      <Quad x0={-40} y0={14.6} x1={60} y1={17.4} fill={DRY} />
      {Array.from({ length: 30 }, (_, i) => <Quad key={`dd${i}`} x0={-14 + i * 1.5} y0={15.4 + (i % 3) * 0.5} x1={-13.6 + i * 1.5} y1={15.55 + (i % 3) * 0.5} fill={DRY_D} />)}
      {grass}
      {st.park > 0.3 && <Quad x0={-40} y0={16.95} x1={60} y1={17.15} z={0.02} fill="#E7E2CF" op={clamp(st.park * 2 - 0.6)} />}
      <Quad x0={-40} y0={24.6} x1={60} y1={25.3} fill={DRY} />
      <Quad x0={-30} y0={8} x1={50} y1={10} fill={C.road} />
      <Quad x0={8} y0={-30} x1={10} y1={16.6} fill={C.road} />
      <Quad x0={8} y0={24.6} x1={10} y1={40} fill={C.road} />
      {blocks.map(([x0, y0, x1, y1], i) => (
        <g key={`bl${i}`}>
          <Quad x0={x0} y0={y0} x1={x1} y1={y1} fill={C.curb} />
          <Quad x0={x0 + 0.5} y0={y0 + 0.5} x1={x1 - 0.5} y1={y1 - 0.5} fill="#D7D2A8" />
        </g>
      ))}
      {Array.from({ length: 24 }, (_, i) => -24 + i * 2.6).filter((v) => v < 7 || v > 10.5).map((v, i) => (
        <g key={`ln${i}`}>
          <Quad x0={v} y0={8.97} x1={v + 1.1} y1={9.03} fill={C.lane} op={0.85} />
          {v < 14 && <Quad x0={8.97} y0={v} x1={9.03} y1={v + 1.1} fill={C.lane} op={0.85} />}
        </g>
      ))}
      {items.map((it, i) => <React.Fragment key={i}>{it.el}</React.Fragment>)}
    </g>
  );
};
