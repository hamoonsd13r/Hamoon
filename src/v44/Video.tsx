// V44 · «پرینتر خراب»: سرقت ۸۱ میلیون دلاری از بانک مرکزی بنگلادش (۲۰۱۶) — Scene Zero, Instagram reel 9:16 (~67 s).
// User's own narration (ElevenLabs), cut from 160 s with the user's OK (tools/v44-voice.mjs → vo.json).
// Mostly 3D (world.ts: office + printer, bank tower, hackers, server corridor, night globe, cash pallet), with real
// Wikimedia Commons photos of the places (Bangladesh Bank, Fed New York, Makati) and two stock clips.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import voJson from "./vo.json";
import { buildWorld, SET, ll, CITY, GLOBE_R, type State, type SetName, type Person } from "./world";
import { clamp, prog, lerp, easeOut, easeInOut, backOut, hash, fa, timing, type VO } from "../v42/kit";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const FPS = 30, W = 1080, H = 1920;
export const TOTAL = V.total + 1.6;
export const FRAMES = Math.round(TOTAL * FPS);
const INK = "#05070B", BONE = "#EEF2F6", MUTED = "#8E9AA8", RED = "#FF3B30", CYAN = "#38E1FF", GREEN = "#4CFF8A";

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v44 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["P44Black", "fonts/Vazirmatn-Black.ttf"], ["P44Bold", "fonts/Vazirmatn-Bold.ttf"], ["P44Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["P44Num", "fonts/Lalezar-Regular.ttf"], ["P44Mono", "fonts/ChakraPetch-SemiBold.ttf"], ["P44Bebas", "fonts/BebasNeue-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── images the 3D world uses: preloaded before the first frame, so every texture is ready (no black first frame) */
const TEX_URLS = ["v44/photos/bbnight.jpg", "v44/photos/bb3.jpg", "styles/cosmic-web/earth_day.jpg", "styles/cosmic-web/earth_night.jpg"];
const IMGS: Record<string, HTMLImageElement> = {};
if (typeof document !== "undefined") {
  TEX_URLS.forEach((u) => {
    const h = delayRender("v44 image " + u), im = new Image();
    im.onload = () => { IMGS[u] = im; continueRender(h); };
    im.onerror = () => continueRender(h);
    im.src = staticFile(u);
  });
}

/* ───────── cuts */
const cut = (x: number) => x - 0.07;
const K = [0, cut(S(2)), cut(S(3)), cut(S(4)), cut(S(5)), cut(S(6)), cut(S(7)), cut(S(8)), cut(S(9)), cut(S(10)), cut(S(11)), cut(S(12)), cut(S(13)), cut(S(14)), cut(S(15)), TOTAL];
const shotAt = (t: number) => { for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1]) return i; return K.length - 2; };
const PHOTO_SHOTS = new Set([2]);
const tSat = cut(wd(12, "بالاخره")); // shot 11: real printer clip until here, then 3D

/* ───────── 3D direction */
type Cam = State["cam"];
type Key = { at: number } & Cam;
const camPath = (t: number, keys: Key[], ease = easeInOut): Cam => {
  if (t <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t < keys[i].at) {
    const a = keys[i - 1], b = keys[i], u = ease(prog(t, a.at, b.at));
    const L = (p: number[], q: number[]) => p.map((v, j) => lerp(v, q[j], u)) as [number, number, number];
    return { pos: L(a.pos, b.pos), look: L(a.look, b.look), fov: lerp(a.fov, b.fov, u) };
  }
  return keys[keys.length - 1];
};
const lin = (x: number) => x;
const v3 = (v: THREE.Vector3) => [v.x, v.y, v.z] as [number, number, number];
/** camera over a lat/lon at `d` × the globe radius, looking at the centre */
const globeCam = (lat: number, lon: number, d: number, fov = 40): Cam => ({ pos: v3(ll(lat, lon, GLOBE_R * d)), look: [0, 0, 0], fov });
const slerpLL = (a: readonly [number, number], b: readonly [number, number], u: number) => {
  const A = ll(a[0], a[1], 1), B = ll(b[0], b[1], 1), ang = A.angleTo(B), s = Math.sin(ang);
  const p = A.multiplyScalar(Math.sin((1 - u) * ang) / s).add(B.multiplyScalar(Math.sin(u * ang) / s)).normalize();
  return [Math.asin(p.y) * 180 / Math.PI, Math.atan2(p.z, -p.x) * 180 / Math.PI - 180] as [number, number];
};
const PR = { x: 4, z: -3.6 }; // printer
const nobody: Person = { x: 0, z: 0, ry: 0, pose: {}, show: false };

const direct = (t: number): State => {
  const sh = shotAt(t), a = K[sh], b = K[sh + 1], u = prog(t, a, b);
  const base: State = {
    t, set: "office", cam: { pos: [6.5, 1.8, 0.2], look: [4, 1.1, -3.4], fov: 45 }, day: 0, lights: 0.15,
    printer: { led: "green", screen: "READY", pages: 0, burst: 0, dead: 0 }, staff: [nobody, nobody, nobody],
    towerOff: 0, walkers: 0, hack: 1, turn: 0, intrude: 0, orders: 0, wipe: 0, arcs: [0, 0, 0, 0], cash: 0, glitch: 0,
  };
  switch (sh) {
    case 0: // hook: the cash pallet streams away
      return { ...base, set: "cash", cash: easeInOut(prog(t, 0.25, b - 0.1)),
        cam: camPath(t, [{ at: 0, pos: [4.6, 2.2, 5.6], look: [0, 1.0, 0], fov: 46 }, { at: b, pos: [2.2, 4.2, 6.8], look: [0, 2.2, 0], fov: 48 }], lin) };
    case 1: { // an employee stares at the printer: red light, ERROR
      const scratch = 0.5 + 0.5 * Math.sin(t * 9);
      return { ...base, day: 1, lights: 1, printer: { led: "red", screen: "ERROR", pages: 0, burst: 0, dead: 0 },
        staff: [{ x: PR.x - 0.1, z: PR.z + 1.05, ry: Math.PI, pose: { look: 0.15 }, show: true, arm: t > wd(2, "فکر") - 0.1 ? 0.75 + 0.1 * scratch : 0 }, nobody, nobody],
        cam: camPath(t, [{ at: a, pos: [7.4, 1.9, 0.8], look: [4.0, 1.25, -3.3], fov: 44 }, { at: b, pos: [6.2, 1.65, -0.9], look: [4.0, 1.3, -3.4], fov: 42 }], lin) };
    }
    case 3: // the tower at night: floors go dark, people leave
      return { ...base, set: "tower", towerOff: lerp(0.15, 0.93, easeInOut(prog(t, a + 0.2, b))), walkers: prog(t, a, b),
        cam: camPath(t, [{ at: a, pos: [-20, 2.6, 74], look: [0, 30, 0], fov: 60 }, { at: b, pos: [12, 3.4, 66], look: [0, 34, 0], fov: 60 }], lin) };
    case 4: { // hackers at their monitors; they turn on «منتظر»
      const tt = wd(5, "منتظر") - 0.2;
      return { ...base, set: "hackers", hack: 1, turn: easeInOut(prog(t, tt, tt + 0.7)),
        cam: camPath(t, [{ at: a, pos: [0.15, 1.75, 2.3], look: [0, 1.25, -3], fov: 46 }, { at: b, pos: [0.1, 1.6, 0.7], look: [0, 1.3, -3], fov: 44 }], lin) };
    }
    case 5: { // inside the system months earlier; then the fake orders fly
      const tIn = wd(6, "وارد") - 0.1, tOrd = wd(6, "دستورهای") - 0.15;
      return { ...base, set: "servers", intrude: easeInOut(prog(t, tIn, tIn + 2.2)), orders: prog(t, tOrd, b + 0.4),
        cam: camPath(t, [{ at: a, pos: [0, 1.7, 1.8], look: [0, 1.3, -15], fov: 52 }, { at: tOrd, pos: [0.3, 1.5, -2.5], look: [0, 1.4, -15], fov: 54 }, { at: b, pos: [-0.2, 1.4, -4.2], look: [0.2, 1.5, -14], fov: 58 }]) };
    }
    case 6: { // the globe: Dhaka → New York → Philippines / Sri Lanka
      const a0 = easeInOut(prog(t, a + 0.1, a + 1.7)), a1 = easeInOut(prog(t, a + 1.5, b - 0.6)), a2 = easeInOut(prog(t, a + 1.8, b - 0.4));
      const p1 = slerpLL(CITY.dhaka, CITY.ny, 0.15 + 0.85 * a0);
      const p2 = slerpLL(CITY.ny, [18, 150], a1);
      const at = t < a + 1.6 ? p1 : p2;
      return { ...base, set: "globe", arcs: [a0, a1, a2, 0], cam: globeCam(at[0] + 8, at[1], lerp(2.7, 3.1, u), 40) };
    }
    case 7: // malware wipes the log wall
      return { ...base, set: "servers", wipe: easeInOut(prog(t, wd(8, "پاک") - 0.4, b)), intrude: 1,
        cam: camPath(t, [{ at: a, pos: [0.6, 1.7, -11.2], look: [0, 1.5, -17.6], fov: 50 }, { at: b, pos: [-0.2, 1.6, -13.6], look: [0, 1.6, -17.6], fov: 50 }], lin) };
    case 8: { // the print system dies
      const tOff = wd(9, "انداخت") - 0.2;
      return { ...base, day: 0, lights: 0.12, printer: { led: t < tOff ? "red" : "off", screen: t < wd(9, "چاپ") ? "PRINTING" : t < tOff ? "SYSTEM ERR" : "", pages: 0, burst: 0, dead: 1 },
        cam: camPath(t, [{ at: a, pos: [5.4, 1.75, -1.6], look: [4.15, 1.3, -3.4], fov: 40 }, { at: b, pos: [4.75, 1.62, -2.3], look: [4.15, 1.36, -3.45], fov: 38 }], lin) };
    }
    case 9: { // Friday 10:30: an employee presses the buttons, nothing prints
      const walkIn = prog(t, a, a + 1.4);
      const x = lerp(1.2, PR.x - 0.05, easeOut(walkIn)), z = lerp(1.6, PR.z + 1.0, easeOut(walkIn));
      return { ...base, day: 1, lights: 1, printer: { led: "amber", screen: "NO JOBS", pages: 0, burst: 0, dead: 1 },
        staff: [{ x, z, ry: walkIn < 1 ? Math.atan2(PR.x - 1.2, PR.z + 1.0 - 1.6) : Math.PI, pose: walkIn < 1 ? { walk: t * 7, amp: 1 } : { reach: 0.35 + 0.1 * Math.sin(t * 8), look: 0.25 }, show: true }, nobody, nobody],
        cam: camPath(t, [{ at: a, pos: [7.8, 1.8, 1.5], look: [3.5, 1.1, -2.6], fov: 46 }, { at: b, pos: [6.9, 1.7, 0.4], look: [3.9, 1.2, -3.0], fov: 44 }], lin) };
    }
    case 10: { // shrugs, walks out; the camera stays on the printer
      const tGo = wd(11, "بدون") - 0.1, w = prog(t, tGo, b);
      const x = lerp(PR.x - 0.05, 8.5, easeInOut(w)), z = lerp(PR.z + 1.0, 7.4, easeInOut(w));
      return { ...base, day: 1, lights: 1, printer: { led: "amber", screen: "NO JOBS", pages: 0, burst: 0, dead: 1 },
        staff: [{ x, z, ry: w > 0 ? Math.atan2(8.5 - PR.x, 7.4 - PR.z) : Math.PI, pose: w > 0 ? { walk: t * 7, amp: 1 } : { look: 0.1 }, show: t < b - 0.1, arm: w > 0 ? 0 : 0.55 * (0.5 + 0.5 * Math.sin(t * 6)) }, nobody, nobody],
        cam: camPath(t, [{ at: a, pos: [5.5, 1.65, -0.8], look: [4.1, 1.25, -3.2], fov: 44 }, { at: b, pos: [6.8, 2.1, 1.8], look: [5.2, 1.0, -1.0], fov: 52 }]) };
    }
    case 11: { // Saturday: everything prints at once; people gather
      const bu = prog(t, tSat + 0.1, b);
      return { ...base, day: 0.7, lights: 1, printer: { led: "green", screen: "PRINTING", pages: 0, burst: easeOut(bu), dead: 0 },
        staff: [{ x: PR.x - 1.3, z: PR.z + 1.5, ry: 2.4, pose: { look: -0.25 }, show: true, arm: 0.3 }, { x: PR.x + 1.2, z: PR.z + 1.6, ry: -2.5, pose: { look: -0.2 }, show: true }, { x: PR.x + 0.1, z: PR.z + 2.3, ry: Math.PI, pose: { look: -0.3, reach: 0.2 }, show: true }],
        cam: camPath(t, [{ at: tSat, pos: [6.6, 1.9, 1.6], look: [4.0, 1.7, -3.2], fov: 50 }, { at: b, pos: [7.4, 2.5, 3.2], look: [4.0, 2.0, -3.0], fov: 54 }]) };
    }
    case 12: { // money arrives in the Philippines
      const m = easeInOut(prog(t, a, b - 0.3)), at = slerpLL([34, 132], CITY.manila, easeInOut(u));
      return { ...base, set: "globe", arcs: [1, 1, 1, m], cam: globeCam(at[0] + 4, at[1], lerp(2.6, 1.9, easeInOut(u)), 42) };
    }
    case 13: { // the hackers again, red
      return { ...base, set: "hackers", hack: 1, turn: 1, glitch: 1,
        cam: camPath(t, [{ at: a, pos: [-0.3, 1.5, 0.9], look: [0, 1.35, -3], fov: 44 }, { at: b, pos: [0.4, 1.4, 0.2], look: [0, 1.4, -3], fov: 42 }], lin) };
    }
    default: // the end: a dark office, one red light
      return { ...base, day: 0, lights: 0, printer: { led: "red", screen: "ERROR", pages: 0, burst: 0, dead: 1 },
        cam: camPath(t, [{ at: a, pos: [8.8, 2.4, 4.2], look: [4.0, 1.0, -3.4], fov: 46 }, { at: E(15), pos: [5.1, 1.6, -1.6], look: [4.2, 1.36, -3.45], fov: 40 }, { at: TOTAL, pos: [4.95, 1.58, -1.9], look: [4.2, 1.38, -3.45], fov: 38 }]) };
  }
};
const is3D = (t: number) => { const s = shotAt(t); return !PHOTO_SHOTS.has(s) && !(s === 11 && t < tSat); };

const World3D: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const world = useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.1;
    const tex = (u: string) => { const x = new THREE.Texture(IMGS[u]); x.needsUpdate = true; return x; };
    return buildWorld(scene, gl, tex);
  }, [gl, scene]);
  const on = is3D(t);
  useLayoutEffect(() => { if (on) world.update(direct(t), camera as THREE.PerspectiveCamera); }, [t, on, world, camera]);
  useFrame(() => { if (on) gl.render(scene, camera); }, 1);
  return null;
};

/* ───────── projection for labels */
const PROJ = new THREE.PerspectiveCamera(45, W / H, 0.05, 900);
const project = (s: State, p: THREE.Vector3) => {
  const ox = SET[s.set as SetName];
  PROJ.position.set(s.cam.pos[0] + ox, s.cam.pos[1], s.cam.pos[2]); PROJ.fov = s.cam.fov; PROJ.up.set(0, 1, 0);
  PROJ.lookAt(s.cam.look[0] + ox, s.cam.look[1], s.cam.look[2]); PROJ.updateProjectionMatrix(); PROJ.updateMatrixWorld();
  const v = p.clone().add(new THREE.Vector3(ox, 0, 0)).project(PROJ);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, ok: v.z < 1 };
};
/** is a point on the globe facing the camera? */
const facing = (s: State, p: THREE.Vector3) => p.clone().normalize().dot(new THREE.Vector3(...s.cam.pos).normalize()) > 0.12;

const pop = (t: number, t0: number, d = 0.35) => backOut(prog(t, t0, t0 + d));
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = BONE, font = "P44Black", style }) => (
  <div style={{ direction: "rtl", fontFamily: font, fontSize: size, color, lineHeight: 1.12, textShadow: "0 8px 40px rgba(0,0,0,0.85)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Tag: React.FC<{ children: React.ReactNode; top?: number; color?: string }> = ({ children, top = 196, color = MUTED }) => (
  <div style={{ position: "absolute", top, right: 44, direction: "rtl", display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 8, background: "rgba(5,7,11,0.7)", border: "1.5px solid rgba(238,242,246,0.25)", fontFamily: "P44Bold", fontSize: 26, color }}>
    <span style={{ width: 10, height: 10, borderRadius: 5, background: CYAN }} />{children}
  </div>
);
const Chip: React.FC<{ t: number; t0: number; children: React.ReactNode; color?: string; top: number; size?: number; solid?: boolean }> = ({ t, t0, children, color = CYAN, top, size = 46, solid }) => {
  if (t < t0) return null;
  return (
    <div style={{ position: "absolute", top, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, t0)})` }}>
      <div style={{ direction: "rtl", fontFamily: "P44Black", fontSize: size, color: solid ? "#fff" : color, background: solid ? color : "rgba(5,7,11,0.84)", border: `2.5px solid ${color}`, padding: "10px 30px", borderRadius: 14, whiteSpace: "nowrap", boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>{children}</div>
    </div>
  );
};
const Stamp: React.FC<{ t: number; t0: number; text: string; top: number; size?: number; color?: string }> = ({ t, t0, text, top, size = 120, color = RED }) => {
  if (t < t0) return null;
  const u = prog(t, t0, t0 + 0.16);
  return (
    <div style={{ position: "absolute", top, width: W, display: "flex", justifyContent: "center" }}>
      <div style={{ direction: "rtl", transform: `rotate(-7deg) scale(${lerp(2.2, 1, easeOut(u))})`, opacity: clamp(u * 3), border: `8px solid ${color}`, borderRadius: 18, padding: "6px 40px", color, fontFamily: "P44Black", fontSize: size, background: "rgba(5,7,11,0.55)", boxShadow: `0 0 50px ${color}55` }}>{text}</div>
    </div>
  );
};
const Pin3D: React.FC<{ s: State; p: THREE.Vector3; t: number; t0: number; text: string; sub?: string; color?: string; up?: number; side?: 1 | -1; globe?: boolean }> = ({ s, p, t, t0, text, sub, color = BONE, up = 140, side = 1, globe }) => {
  if (t < t0) return null;
  if (globe && !facing(s, p)) return null;
  const q = project(s, p); if (!q.ok) return null;
  const u = backOut(prog(t, t0, t0 + 0.4)), line = easeOut(prog(t, t0, t0 + 0.25));
  const x = clamp(q.x, 170, W - 170);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <circle cx={q.x} cy={q.y} r={8 + 18 * ((t - t0) % 1.2)} fill="none" stroke={color} strokeWidth={2} opacity={0.8 * (1 - ((t - t0) % 1.2) / 1.2)} />
        <circle cx={q.x} cy={q.y} r={7} fill={color} />
        <line x1={q.x} y1={q.y} x2={x + side * 36 * line} y2={q.y - up * line} stroke={color} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: x + side * 36, top: q.y - up - 28, transform: `translate(${side > 0 ? "0" : "-100%"}, -50%) scale(${0.6 + 0.4 * u})`, transformOrigin: side > 0 ? "left center" : "right center", opacity: clamp(u * 2) }}>
        <div style={{ direction: "rtl", background: "rgba(5,7,11,0.86)", border: `2.5px solid ${color}`, borderRadius: 12, padding: "8px 22px", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "P44Black", fontSize: 42, color, lineHeight: 1.25 }}>{text}</div>
          {sub && <div style={{ fontFamily: "P44Reg", fontSize: 25, color: MUTED }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};
const Money: React.FC<{ value: number; size?: number; color?: string; unit?: string }> = ({ value, size = 150, color = BONE, unit }) => (
  <div style={{ display: "flex", direction: "rtl", alignItems: "baseline", gap: 14, justifyContent: "center" }}>
    <span style={{ fontFamily: "P44Num", fontSize: size, color, lineHeight: 1, textShadow: `0 0 40px ${color}55, 0 8px 30px #000` }}>{fa(Math.round(value).toLocaleString("en-US").replace(/,/g, "٬"))}</span>
    <span style={{ fontFamily: "P44Black", fontSize: size * 0.4, color: MUTED }}>{unit ?? "دلار"}</span>
  </div>
);
/** a real photo, Ken Burns, with its credit */
const Photo: React.FC<{ src: string; t: number; t0: number; t1: number; credit: string; fx?: number; fy?: number; z0?: number; z1?: number; dx?: number }> = ({ src, t, t0, t1, credit, fx = 0.5, fy = 0.5, z0 = 1.08, z1 = 1.2, dx = 0 }) => {
  const u = prog(t, t0, t1), z = lerp(z0, z1, u);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Img src={staticFile(`v44/photos/${src}.jpg`)} style={{ position: "absolute", inset: 0, width: W, height: H, maxWidth: "none", objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z}) translateX(${dx * u}px)`, filter: "saturate(0.85) contrast(1.08)" }} />
      <div style={{ position: "absolute", left: 30, bottom: 300, fontFamily: "P44Mono", fontSize: 20, color: "rgba(238,242,246,0.75)", textShadow: "0 1px 6px #000" }}>{credit}</div>
    </AbsoluteFill>
  );
};
/** a photo card floating over the 3D scene */
const Card: React.FC<{ src: string; t: number; t0: number; t1: number; x: number; y: number; w: number; h: number; label: string; credit: string; rot?: number }> = ({ src, t, t0, t1, x, y, w, h, label, credit, rot = -3 }) => {
  if (t < t0 || t > t1) return null;
  const u = backOut(prog(t, t0, t0 + 0.4)), out = prog(t, t1 - 0.2, t1);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${(0.7 + 0.3 * u) * (1 - 0.3 * out)})`, opacity: clamp(u * 2) * (1 - out), background: "#f1ede4", padding: 12, paddingBottom: 54, boxShadow: "0 24px 60px rgba(0,0,0,0.7)", borderRadius: 4 }}>
      <Img src={staticFile(`v44/photos/${src}.jpg`)} style={{ width: w - 24, height: h, objectFit: "cover", display: "block", transform: `scale(${1.05 + 0.08 * prog(t, t0, t1)})` }} />
      <div style={{ position: "absolute", bottom: 10, right: 16, direction: "rtl", fontFamily: "P44Black", fontSize: 28, color: INK }}>{label}</div>
      <div style={{ position: "absolute", bottom: 14, left: 14, fontFamily: "P44Mono", fontSize: 14, color: "#6b675e" }}>{credit}</div>
    </div>
  );
};
const Clip: React.FC<{ src: string; t: number; t0: number; t1: number; focus?: number; z0?: number; z1?: number; grade?: string }> = ({ src, t, t0, t1, focus = 0.5, z0 = 1.05, z1 = 1.18, grade = "saturate(0.85) contrast(1.1) brightness(0.9)" }) => {
  const u = prog(t, t0, t1), z = lerp(z0, z1, u), vw = H * (16 / 9);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Sequence from={Math.round(t0 * FPS)} layout="none">
        <OffthreadVideo muted src={staticFile(`v44/footage/${src}.mp4`)} style={{ position: "absolute", height: H, width: vw, maxWidth: "none", objectFit: "cover", left: W / 2 - vw * focus, top: 0, transform: `scale(${z})`, transformOrigin: `${focus * 100}% 50%`, filter: grade }} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ───────── overlays per shot */
const Over: React.FC<{ t: number; s: State | null }> = ({ t, s }) => {
  const sh = shotAt(t), a = K[sh], b = K[sh + 1];
  const g = (sh === 0 || sh === 1) ? null : null; void g;
  switch (sh) {
    case 0: {
      const v = 81e6 * easeOut(prog(t, 0.05, 1.3));
      return (<>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,11,0.75) 0%, rgba(5,7,11,0) 34%)" }} />
        <div style={{ position: "absolute", top: 300, width: W, transform: `scale(${pop(t, 0.05)})` }}><Money value={v} size={140} color={GREEN} /></div>
        <Stamp t={t} t0={wd(1, "دزدیده") - 0.05} text="دزدیده شد" top={500} size={96} />
      </>);
    }
    case 1: return s && (<>
      <Pin3D s={s} p={new THREE.Vector3(PR.x + 0.32, 1.45, PR.z + 0.4)} t={t} t0={wd(2, "پرینتر") - 0.1} text="فقط یه پرینتر خراب؟" color={RED} up={260} side={-1} />
    </>);
    case 2: return (<>
      <Photo src="bb1" t={t} t0={a} t1={b} credit="CAPTAIN RAJU · CC BY-SA 4.0 · Wikimedia Commons" fx={0.24} fy={0.6} z0={1.05} z1={1.2} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,11,0.8) 0%, rgba(5,7,11,0) 35%, rgba(5,7,11,0) 60%, rgba(5,7,11,0.85) 100%)" }} />
      <div style={{ position: "absolute", top: 300, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Big size={86} style={{ opacity: prog(t, a, a + 0.2) }}>بانک مرکزی بنگلادش</Big>
        <div style={{ fontFamily: "P44Bold", fontSize: 40, color: CYAN, direction: "rtl", opacity: prog(t, wd(3, "داکا") - 0.1, wd(3, "داکا") + 0.2) }}>داکا · موتیجهیل</div>
      </div>
      <Chip t={t} t0={a + 0.5} top={480} size={40} color={BONE}>پنج‌شنبه ۴ فوریه ۲۰۱۶ · ۸:۳۶ شب</Chip>
      <Tag>عکس واقعی</Tag>
    </>);
    case 3: return (<>
      <Chip t={t} t0={wd(4, "آخر") - 0.1} top={330} size={46}>آخر هفته در بنگلادش: جمعه و شنبه</Chip>
    </>);
    case 4: return (<>
      <Chip t={t} t0={wd(5, "هکرها") - 0.1} top={300} size={60} color={RED}>هکرها منتظر بودن</Chip>
    </>);
    case 5: return (<>
      <Chip t={t} t0={wd(6, "ماه‌ها") - 0.1} top={280} size={44}>ماه‌ها قبل · بدافزار داخل شبکه</Chip>
      {t > wd(6, "دستورهای") - 0.1 && <div style={{ position: "absolute", top: 400, width: W, transform: `scale(${pop(t, wd(6, "دستورهای") - 0.1)})` }}>
        <Money value={35 * easeOut(prog(t, wd(6, "دستورهای") - 0.1, b))} size={170} color={RED} unit="دستور جعلی" />
        <div style={{ textAlign: "center", fontFamily: "P44Bold", fontSize: 32, color: MUTED, direction: "rtl", marginTop: 6 }}>از راه شبکه‌ی پیام‌رسان بانکی SWIFT</div>
      </div>}
    </>);
    case 6: return s && (<>
      <div style={{ position: "absolute", top: 250, width: W, transform: `scale(${pop(t, wd(7, "951") - 0.1)})`, opacity: prog(t, wd(7, "951") - 0.1, wd(7, "951")) }}>
        <Money value={951e6 * easeOut(prog(t, wd(7, "951") - 0.1, wd(7, "دلار") + 0.2))} size={130} color={RED} />
        <div style={{ textAlign: "center", fontFamily: "P44Bold", fontSize: 34, color: MUTED, direction: "rtl" }}>رقم برنامه‌ریزی‌شده</div>
      </div>
      <Pin3D s={s} p={ll(CITY.dhaka[0], CITY.dhaka[1], GLOBE_R)} t={t} t0={a + 0.1} text="داکا" color={BONE} up={120} side={1} globe />
      <Pin3D s={s} p={ll(CITY.ny[0], CITY.ny[1], GLOBE_R)} t={t} t0={a + 1.3} text="نیویورک" sub="حساب بانک در فدرال رزرو" color={RED} up={160} side={-1} globe />
      <Pin3D s={s} p={ll(CITY.manila[0], CITY.manila[1], GLOBE_R)} t={t} t0={b - 0.8} text="فیلیپین" color={RED} up={120} side={-1} globe />
      <Pin3D s={s} p={ll(CITY.colombo[0], CITY.colombo[1], GLOBE_R)} t={t} t0={b - 0.6} text="سریلانکا" color={"#FFB547"} up={220} side={1} globe />
      <Card src="fed2" t={t} t0={a + 1.45} t1={b} x={600} y={940} w={400} h={360} label="فدرال رزرو نیویورک" credit="Beyond My Ken · CC BY-SA 4.0" rot={-4} />
    </>);
    case 7: return (<>
      <div style={{ position: "absolute", top: 260, left: 60, right: 60, direction: "rtl", fontFamily: "P44Mono", fontSize: 30, color: RED, background: "rgba(5,7,11,0.8)", border: `2px solid ${RED}`, borderRadius: 12, padding: "14px 24px", opacity: prog(t, a + 0.1, a + 0.3) }}>
        <div style={{ direction: "ltr" }}>{`> wiping logs ... ${Math.round(100 * prog(t, wd(8, "پاک") - 0.4, b))}%`}</div>
      </div>
      <Chip t={t} t0={wd(8, "پاک") - 0.1} top={420} size={58} color={RED} solid>پاک کردن ردّ عملیات</Chip>
    </>);
    case 8: return (<>
      <Chip t={t} t0={wd(9, "سیستم") - 0.1} top={300} size={48} color={RED}>سیستم چاپ گزارش‌ها: خاموش</Chip>
    </>);
    case 9: return (<>
      <div style={{ position: "absolute", top: 260, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, a + 0.05)})` }}>
        <div style={{ fontFamily: "P44Mono", fontSize: 130, color: BONE, padding: "4px 40px", background: "rgba(5,7,11,0.8)", borderRadius: 16, border: `3px solid ${CYAN}` }}>10:30</div>
      </div>
      <div style={{ position: "absolute", top: 470, width: W, textAlign: "center", fontFamily: "P44Black", fontSize: 50, color: BONE, direction: "rtl" }}>جمعه · صبح</div>
    </>);
    case 10: return s && (<>
      <Chip t={t} t0={wd(11, "فکر") - 0.1} top={420} size={52} color={BONE}>«حتماً دستگاه خراب شده…»</Chip>
      {t > wd(11, "بدون") && <Chip t={t} t0={wd(11, "باخبر") - 0.2} top={300} size={48} color={RED}>از سرقت خبر نداشت</Chip>}
    </>);
    case 11: return (<>
      {t < tSat && <Clip src="printer2" t={t} t0={a} t1={tSat} focus={0.52} z0={1.08} z1={1.2} />}
      {t < tSat && <Tag>تصویر نمادین</Tag>}
      <Chip t={t} t0={a + 0.05} top={290} size={44} color={BONE}>شنبه ۶ فوریه · ۱۲:۳۰ ظهر</Chip>
      <Stamp t={t} t0={wd(12, "فاجعه") - 0.05} text="فاجعه" top={430} size={140} />
    </>);
    case 12: return s && (<>
      <div style={{ position: "absolute", top: 260, width: W, transform: `scale(${pop(t, wd(13, "81") - 0.1)})`, opacity: prog(t, wd(13, "81") - 0.1, wd(13, "81")) }}>
        <Money value={81e6 * easeOut(prog(t, wd(13, "81") - 0.1, wd(13, "دلار") + 0.3))} size={140} color={GREEN} />
      </div>
      <Pin3D s={s} p={ll(CITY.manila[0], CITY.manila[1], GLOBE_R)} t={t} t0={wd(13, "فیلیپین") - 0.2} text="فیلیپین" sub="حساب‌هایی در یک بانک در ماکاتی" color={GREEN} up={150} side={-1} globe />
      <Card src="makati" t={t} t0={wd(13, "حساب‌هایی") - 0.1} t1={b} x={520} y={1040} w={470} h={260} label="ماکاتی، مانیل" credit="Lawrence Ruiz · CC BY-SA 4.0" rot={3} />
    </>);
    case 13: {
      const flash = Math.floor(t * 8) % 5 === 0;
      return (<>
        {flash && <AbsoluteFill style={{ opacity: 0.35, mixBlendMode: "screen" }}><Clip src="code" t={t} t0={a} t1={b} grade="hue-rotate(160deg) saturate(2) brightness(0.8)" /></AbsoluteFill>}
        <Chip t={t} t0={wd(14, "هکرها") - 0.1} top={300} size={40} color={BONE}>بعدها آمریکا: گروه «لازاروس»، مرتبط با کره‌ی شمالی</Chip>
      </>);
    }
    case 14: {
      const tEnd = E(15) + 0.15;
      return (<>
        <Chip t={t} t0={wd(15, "پرینتر") - 0.1} top={300} size={64} color={RED}>فقط یه پرینتر خراب</Chip>
        {t > tEnd && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(3,4,6,${0.6 * prog(t, tEnd, tEnd + 0.4)})` }}>
            <div style={{ transform: `scale(${pop(t, tEnd, 0.5)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
              <div style={{ fontFamily: "P44Bebas", fontSize: 150, letterSpacing: 10, color: BONE, display: "flex", alignItems: "center", gap: 22 }}><span style={{ width: 44, height: 44, borderRadius: 22, background: RED }} />SCENE ZERO</div>
              <div style={{ direction: "rtl", fontFamily: "P44Black", fontSize: 58, color: INK, background: BONE, padding: "12px 40px", borderRadius: 14 }}>اگه تو بودی چی کار می‌کردی؟</div>
            </div>
          </AbsoluteFill>
        )}
      </>);
    }
  }
  return null;
};

/* ───────── captions */
type Wd = { w: string; s: number; e: number; line: number };
const KEY = new Set(["81", "951", "میلیون", "پرینتر", "خراب", "هکرها", "جعلی", "مخرب", "پاک", "فاجعه", "فیلیپین", "ترسناک‌ترین", "بنگلادش", "داکا.", "شنبه", "خراب"]);
const CAPS: { words: Wd[]; s: number; e: number }[] = (() => {
  const out: { words: Wd[]; s: number; e: number }[] = [];
  for (const sg of V.segs) {
    const ws = V.words.filter((w) => w.line === sg.n) as Wd[];
    let cur: Wd[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const nx = ws[i + 1];
      if (!nx || /[،.؟]$/.test(w.w) || cur.length >= 3 || (cur.length >= 2 && nx.s - w.e > 0.2)) { out.push({ words: cur, s: cur[0].s, e: w.e }); cur = []; }
    });
  }
  out.forEach((c, i) => { const n = out[i + 1]; c.e = n ? Math.min(n.s, c.e + 0.5) : c.e + 0.6; });
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c || t > E(15) + 0.1) return null;
  const u = easeOut(prog(t, c.s - 0.05, c.s + 0.1));
  return (
    <div style={{ position: "absolute", top: 1330, width: W, display: "flex", justifyContent: "center", transform: `translateY(${(1 - u) * 18}px) scale(${0.94 + 0.06 * u})`, opacity: u }}>
      <div style={{ direction: "rtl", display: "flex", gap: 22, padding: "10px 30px", borderRadius: 16, background: "rgba(5,7,11,0.74)" }}>
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03, key = KEY.has(w.w) || KEY.has(w.w.replace(/[،.]$/, ""));
          return <span key={i} style={{ fontFamily: "P44Black", fontSize: 76, lineHeight: 1.3, color: on ? (key ? CYAN : "#fff") : "rgba(255,255,255,0.4)", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{fa(w.w.replace(/[،.]$/, ""))}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── main */
const Video: React.FC<{ audio?: string; at?: number }> = ({ audio, at: tAt }) => {
  const frame = useCurrentFrame();
  const t = tAt ?? frame / FPS;
  const sh = shotAt(t), three = is3D(t);
  const s = three ? direct(t) : null;
  const flash = K.reduce((acc, c) => acc + (c > 0 && t >= c && t < c + 0.12 ? 0.25 * (1 - (t - c) / 0.12) : 0), 0);
  const glitch = sh === 13 && Math.floor(t * 10) % 7 === 0;
  const shake = [wd(1, "دزدیده"), wd(12, "فاجعه"), wd(7, "951")].reduce((acc, c) => acc + (t > c && t < c + 0.35 ? 12 * (1 - (t - c) / 0.35) : 0), 0);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * shake + (glitch ? 14 : 0)}px, ${Math.cos(t * 77) * shake}px)` }}>
        <AbsoluteFill style={{ opacity: three ? 1 : 0, filter: glitch ? "hue-rotate(-30deg) saturate(1.6)" : undefined }}>
          <ThreeCanvas width={W} height={H} gl={{ antialias: true, stencil: false, preserveDrawingBuffer: true }} camera={{ fov: 45, near: 0.05, far: 900, position: [0, 2, 5] }}>
            <World3D t={t} />
          </ThreeCanvas>
        </AbsoluteFill>
        {three && <Tag>بازسازی سه‌بعدی</Tag>}
        <Over t={t} s={s} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 120, left: 44, display: "flex", alignItems: "center", gap: 12, fontFamily: "P44Bebas", fontSize: 40, letterSpacing: 4, color: BONE, opacity: 0.88 }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />SCENE ZERO
      </div>
      <Captions t={t} />
      <AbsoluteFill style={{ background: `rgba(225,248,255,${flash})` }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${prog(t, TOTAL - 0.35, TOTAL)})` }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const LOOK = [0.4, ...K.slice(0, -1).map((a, i) => (a + K[i + 1]) / 2), wd(5, "منتظر") + 0.5, wd(6, "جعلی"), wd(12, "فاجعه") + 0.3, E(15) + 0.9];
const Look: React.FC = () => { const f = useCurrentFrame(); return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />; };
export const V44Compositions: React.FC = () => (
  <>
    <Composition id="V44" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v44/mix-norm.wav" }} />
    <Composition id="V44-Silent" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V44-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
void hash;
