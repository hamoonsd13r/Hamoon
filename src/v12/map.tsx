// V12 — a procedural night city (world coords) seen through a camera; streets, blocks, a park with a pond, a highway.
import React from "react";
import { C, hash } from "./kit";

export const VX = [100, 330, 560, 790, 1020, 1250, 1480];
export const HY = [120, 360, 600, 840, 1080, 1320, 1560, 1800];
export const HWY = 1080; // the horizontal street at this y is a divided highway; it can only be crossed at x = 330
export const PARK = { x0: 560, y0: 600, x1: 790, y1: 840, pond: { x: 675, y: 755, rx: 70, ry: 48 } };

export type Cam = { cx: number; cy: number; z: number; sx?: number; sy?: number };
/** world → screen */
export const toS = (cam: Cam, x: number, y: number) => ({ x: (x - cam.cx) * cam.z + (cam.sx ?? 540), y: (y - cam.cy) * cam.z + (cam.sy ?? 700) });

export const CityMap: React.FC<{ cam: Cam; a?: number; streetA?: number; hwyGlow?: number; children?: React.ReactNode; blocksA?: number }> = ({ cam, a = 1, streetA = 1, hwyGlow = 0, children, blocksA = 1 }) => {
  const sx = cam.sx ?? 540, sy = cam.sy ?? 700;
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < VX.length - 1; i++) for (let j = 0; j < HY.length - 1; j++) {
    const x0 = VX[i] + 22, x1 = VX[i + 1] - 22, y0 = HY[j] + 22, y1 = HY[j + 1] - 22;
    const isPark = VX[i] === PARK.x0 && HY[j] === PARK.y0;
    if (isPark) {
      blocks.push(<rect key={`p${i}${j}`} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={18} fill={C.park} stroke="#1E5A5A" strokeWidth={2} />);
      blocks.push(<ellipse key="pond" cx={PARK.pond.x} cy={PARK.pond.y} rx={PARK.pond.rx} ry={PARK.pond.ry} fill={C.water} stroke="#3A7BD5" strokeWidth={3} />);
      for (let k = 0; k < 7; k++) blocks.push(<circle key={`tr${k}`} cx={x0 + 25 + hash(k + 3) * (x1 - x0 - 50)} cy={y0 + 20 + hash(k + 9) * 50 + (k % 2) * 110} r={12 + hash(k) * 6} fill="#16404A" />);
      continue;
    }
    // each block is split into a few buildings
    const n = 2 + Math.floor(hash(i * 13 + j) * 3);
    for (let k = 0; k < n; k++) {
      const bw = (x1 - x0) / n;
      blocks.push(<rect key={`b${i}${j}${k}`} x={x0 + k * bw + 4} y={y0 + 4} width={bw - 8} height={y1 - y0 - 8} rx={6} fill={C.block} opacity={0.75 + hash(i + j * 7 + k) * 0.25} />);
    }
  }
  const lines: React.ReactNode[] = [];
  VX.forEach((x) => lines.push(<line key={`v${x}`} x1={x} y1={HY[0] - 60} x2={x} y2={HY.at(-1)! + 60} stroke={C.street} strokeWidth={26} strokeLinecap="round" />));
  HY.forEach((y) => lines.push(<line key={`h${y}`} x1={VX[0] - 60} y1={y} x2={VX.at(-1)! + 60} y2={y} stroke={y === HWY ? "#2A4590" : C.street} strokeWidth={y === HWY ? 70 : 26} strokeLinecap="round" />));
  // highway barrier + lane marks; only the overpass at x=330 crosses it
  const hw = (
    <g>
      <line x1={VX[0] - 60} y1={HWY} x2={VX.at(-1)! + 60} y2={HWY} stroke={hwyGlow ? `rgba(255,77,106,${0.6 * hwyGlow})` : "#7C8DB8"} strokeWidth={hwyGlow ? 10 : 5} />
      {[-18, 18].map((o) => <line key={o} x1={VX[0] - 60} y1={HWY + o} x2={VX.at(-1)! + 60} y2={HWY + o} stroke="#5B6FA3" strokeWidth={2} strokeDasharray="20 22" />)}
      <rect x={330 - 20} y={HWY - 44} width={40} height={88} rx={6} fill={C.street} stroke={C.streetHi} strokeWidth={3} />
    </g>
  );
  return (
    <g opacity={a}>
      <g transform={`translate(${sx} ${sy}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
        <g opacity={blocksA}>{blocks}</g>
        <g opacity={streetA}>{lines}{hw}</g>
        {children}
      </g>
    </g>
  );
};

/** streets as a graph: nodes at intersections, edges along streets (highway edges exist, but crossing it only at x=330) */
export type Node = { id: number; x: number; y: number };
export const NODES: Node[] = [];
VX.forEach((x) => HY.forEach((y) => NODES.push({ id: NODES.length, x, y })));
export const nodeAt = (x: number, y: number) => NODES.find((n) => n.x === x && n.y === y)!;
export const EDGES: [number, number][] = [];
VX.forEach((x, i) => HY.forEach((y, j) => {
  const a = nodeAt(x, y).id;
  if (i < VX.length - 1) EDGES.push([a, nodeAt(VX[i + 1], y).id]);
  if (j < HY.length - 1) {
    const crossesHwy = (y < HWY && HY[j + 1] >= HWY) || (y === HWY && HY[j + 1] > HWY);
    if (!crossesHwy || x === 330) EDGES.push([a, nodeAt(x, HY[j + 1]).id]);
  }
}));
/** Dijkstra from a node: distance per node + predecessor */
export const dijkstra = (src: number) => {
  const dist = NODES.map(() => Infinity), prev = NODES.map(() => -1), done = NODES.map(() => false);
  dist[src] = 0;
  for (;;) {
    let u = -1;
    NODES.forEach((_, i) => { if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i; });
    if (u < 0) break;
    done[u] = true;
    for (const [a, b] of EDGES) {
      const v = a === u ? b : b === u ? a : -1;
      if (v < 0) continue;
      const d = dist[u] + Math.hypot(NODES[a].x - NODES[b].x, NODES[a].y - NODES[b].y);
      if (d < dist[v]) { dist[v] = d; prev[v] = u; }
    }
  }
  return { dist, prev };
};
export const pathTo = (prev: number[], dst: number) => { const p: number[] = []; for (let v = dst; v >= 0; v = prev[v]) p.unshift(v); return p; };

/** a polyline drawn progressively (p = 0..1) */
export const DrawLine: React.FC<{ pts: { x: number; y: number }[]; p: number; color: string; w?: number; dash?: string; glow?: boolean }> = ({ pts, p, color, w = 10, dash, glow }) => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  const total = segs.reduce((a, b) => a + b, 0);
  let left = total * p;
  const out = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const k = Math.min(1, left / segs[i]);
    out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k });
    left -= segs[i];
  }
  const d = out.map((q, i) => `${i ? "L" : "M"}${q.x} ${q.y}`).join(" ");
  return <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} filter={glow ? "url(#v12glow)" : undefined} />;
};
/** point along a polyline at p */
export const along = (pts: { x: number; y: number }[], p: number) => {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  let left = segs.reduce((a, b) => a + b, 0) * clampP(p);
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i] || i === segs.length - 1) {
      const k = Math.min(1, left / segs[i]);
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k, ang: (Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x) * 180) / Math.PI };
    }
    left -= segs[i];
  }
  return { ...pts[0], ang: 0 };
};
const clampP = (p: number) => Math.min(1, Math.max(0, p));
