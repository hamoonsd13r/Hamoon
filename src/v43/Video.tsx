// V43 · «سرقت ۱۶۸ صندوق امانات بانک ملی» — Scene Zero, Instagram reel 9:16 (~68 s).
// User's own narration (ElevenLabs, shortened pauses + tempo 1.10: tools/v43-voice.mjs → vo.json).
// Look: night case file. A three.js heist map (world.ts: Enghelab Street, the bank, the building next door, the
// basement cutaway, four doors, the vault with 168 boxes, grey mannequins, a lineup room) cut with free stock footage
// (Coverr / Mixkit, tagged «تصویر نمادین») and code-made cards: map, 72-hour counter, calendar, clock, stamps.
// Every time comes from vo.json words.
import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, Composition, Html5Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import voJson from "./vo.json";
import { buildWorld, BOXES, type State, type Pose } from "./world";
import { clamp, prog, lerp, easeOut, easeInOut, backOut, hash, fa, timing, type VO, IranMap, MAP } from "../v42/kit";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const FPS = 30, W = 1080, H = 1920;
export const TOTAL = V.total + 1.5;
export const FRAMES = Math.round(TOTAL * FPS);
const INK = "#07090D", BONE = "#EEE8DC", MUTED = "#9C978E", RED = "#FF3B30", AMBER = "#FFB547";
const Y0 = -3.5;

/* ───────── cuts (absolute seconds) */
const cut = (x: number) => x - 0.07;
const K = {
  police: cut(wd(1, "و")), map: cut(wd(1, "بعضیاشون")), how: cut(S(2)), date: cut(S(3)), street: cut(S(4)), dive: cut(wd(4, "و")),
  vault: cut(S(5)), loot: cut(S(6)), cctv: cut(S(7)), cal: cut(S(8)), fled: cut(wd(8, "و")), probe: cut(S(9)), lineup: cut(wd(9, "و")),
  found: cut(wd(9, "و", 2)), q: cut(S(10)), end: cut(S(11)),
};
const SHOTS: [number, number][] = [
  [0, K.police], [K.police, K.map], [K.map, K.how], [K.how, K.date], [K.date, K.street], [K.street, K.dive], [K.dive, K.vault], [K.vault, K.loot],
  [K.loot, K.cctv], [K.cctv, K.cal], [K.cal, K.fled], [K.fled, K.probe], [K.probe, K.lineup], [K.lineup, K.found], [K.found, K.q], [K.q, K.end], [K.end, TOTAL],
];
const THREE_D = new Set([0, 5, 6, 7, 9, 13, 16]);
const shotAt = (t: number) => Math.max(0, SHOTS.findIndex(([a, b]) => t >= a && t < b));

/* ───────── fonts */
import { continueRender, delayRender } from "remotion";
const fh = typeof document !== "undefined" ? delayRender("v43 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["Z43Black", "fonts/Vazirmatn-Black.ttf"], ["Z43Bold", "fonts/Vazirmatn-Bold.ttf"], ["Z43Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["Z43Num", "fonts/Lalezar-Regular.ttf"], ["Z43Mono", "fonts/ChakraPetch-SemiBold.ttf"], ["Z43Bebas", "fonts/BebasNeue-Regular.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── 3D direction */
type Key = { at: number; pos: [number, number, number]; look: [number, number, number]; fov: number };
const camPath = (t: number, keys: Key[], ease = easeInOut) => {
  if (t <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t < keys[i].at) {
    const a = keys[i - 1], b = keys[i], u = ease(prog(t, a.at, b.at));
    const L = (p: number[], q: number[]) => p.map((v, j) => lerp(v, q[j], u)) as [number, number, number];
    return { at: t, pos: L(a.pos, b.pos), look: L(a.look, b.look), fov: lerp(a.fov, b.fov, u) };
  }
  return keys[keys.length - 1];
};
type Thief = State["thieves"][number];
const at = (x: number, z: number, ry: number, pose: Pose, y = Y0): Thief => ({ x, y, z, ry, pose, show: true });
const hide: Thief = { x: 0, y: 0, z: 0, ry: 0, pose: {}, show: false };
// shared with the 2D labels: the same camera is rebuilt here

const direct = (t: number): State => {
  const base: State = { t, cam: { pos: [0, 10, -20], look: [0, 0, 10], fov: 45 }, cut: 0, path: 0, doors: 0, breach: 0, open: 0, thieves: [hide, hide, hide, hide, hide], lineup: 0, ceiling: false, alarm: 0 };
  const sh = shotAt(t);
  const work = (i: number, k = 1): Pose => ({ reach: k, walk: t * 3 + i * 2, amp: 0 });
  if (sh === 0) {
    // hook: inside the vault, boxes popping open around them
    const u = t / K.police;
    return { ...base, ceiling: true, alarm: 0.55, open: 58 + 26 * u,
      cam: camPath(t, [{ at: 0, pos: [4.0, -1.55, 13.0], look: [6.4, -2.4, 22], fov: 52 }, { at: K.police, pos: [4.9, -1.85, 15.4], look: [6.6, -2.3, 22], fov: 48 }], (x) => x),
      thieves: [at(5.1, 21.25, 0, work(0)), at(7.55, 17.0, Math.PI / 2, work(1, 0.8)), at(4.2, 19.6, 0.5, { crouch: 0.85, reach: 0.3, walk: t * 2 }), at(6.6, 20.3, -0.3, { carry: 1, walk: t * 2.4, amp: 0.15 }), hide] };
  }
  if (sh === 5) {
    // the street: Enghelab, the gate across, the branch, five figures walk to the next-door entrance
    const T0 = K.street, u = t - T0;
    const thieves = [0, 1, 2, 3, 4].map((i) => {
      const s = 10 + 1.35 * u - i * 1.45; // metres from x = -26
      const x = -26 + Math.min(s, 17), z = s > 17 ? 7.6 + Math.min(2.4, s - 17) : 7.6;
      const ry = s > 17 ? 0 : Math.PI / 2;
      return { ...at(x, z, ry, { walk: s * 3.4, amp: 1 }, 0.12), show: s < 19.4 };
    });
    return { ...base, thieves,
      path: 0.33 * clamp((10 + 1.35 * (t - T0) - 0) / 19.4),
      cam: camPath(t, [{ at: T0, pos: [-26, 70, -46], look: [-5, 0, 6], fov: 32 }, { at: K.dive, pos: [-12, 60, -40], look: [-3, 0, 8], fov: 32 }], (x) => easeOut(x) * 0.6 + x * 0.4) };
  }
  if (sh === 6) {
    // the cutaway: ground turns to glass, the red route, sparks at the wall, four doors swing open
    const T0 = K.dive, d = K.vault - K.dive, u = (t - T0) / d;
    return { ...base, cut: easeInOut(prog(u, 0, 0.32)), path: easeInOut(prog(u, 0.12, 0.95)), breach: prog(u, 0.3, 0.62), doors: 4 * prog(u, 0.6, 0.97), open: 40 * prog(u, 0.85, 1),
      thieves: [at(-4.75, 15.3, Math.PI / 2, { crouch: 0.7, reach: 0.25, walk: t * 30 }), at(-6.0, 14.6, 1.2, { walk: t * 2, amp: 0.1, carry: 1 }), at(-6.4, 16.1, 1.9, { walk: t * 2, amp: 0.1 }), at(-8.6, 13.4, 0.2, { walk: (t - T0) * 4.2, amp: 1 }), hide]
        .map((th, i) => (i === 3 ? { ...th, z: 12.2 + (t - T0) * 0.9 } : th)),
      cam: camPath(t, [{ at: T0, pos: [-12, 60, -40], look: [-3, 0, 8], fov: 32 }, { at: T0 + d * 0.4, pos: [-10, 19, -4], look: [-2, -3.4, 15.5], fov: 46 }, { at: K.vault, pos: [-3, 14, 1.5], look: [1.5, -3.4, 16.8], fov: 46 }]) };
  }
  if (sh === 7) {
    // in the vault: hours pass, the boxes go one after another (counter to 168 from the word «۱۶۸»)
    const T0 = K.vault, t168 = wd(5, "168"), tEnd = wd(5, "می‌زنن") + 0.2;
    const open = t < t168 ? 40 + 10 * prog(t, T0, t168) : lerp(50, BOXES, easeInOut(prog(t, t168, tEnd)));
    return { ...base, ceiling: true, open, alarm: 0.35,
      cam: camPath(t, [{ at: T0, pos: [3.55, -0.95, 11.7], look: [6.8, -2.4, 20.5], fov: 56 }, { at: t168, pos: [3.9, -1.25, 12.6], look: [7.0, -2.3, 20.4], fov: 52 }, { at: K.loot, pos: [4.6, -1.7, 14.2], look: [7.2, -2.2, 20.8], fov: 50 }]),
      thieves: [at(4.7, 21.25, 0, work(0)), at(6.4, 21.25, 0.1, work(1, 0.7)), at(7.55, 18.6, Math.PI / 2, work(2)), at(7.55, 15.8, Math.PI / 2 + 0.2, work(3, 0.6)), at(4.6 + 0.5 * Math.sin(t * 0.8), 18.4, 2.6, { carry: 1, walk: t * 4.5, amp: 0.7 })] };
  }
  if (sh === 9) {
    // CCTV: a fixed corner camera; one figure turns and looks straight up at it
    const tl = wd(7, "مونده") - 0.25, k = easeInOut(prog(t, tl, tl + 0.7));
    return { ...base, ceiling: true, open: BOXES, alarm: 0.2,
      cam: { pos: [3.35, -0.62, 11.3], look: [6.9, -3.0, 19.4], fov: 64 },
      thieves: [{ ...at(6.0, 19.0, lerp(0, Math.PI + 0.42, k), { reach: 1 - k, look: 0.75 * k, walk: t * 3 }) }, at(7.55, 16.4, Math.PI / 2, work(1)), at(4.3, 21.25, 0, work(2, 0.8)), at(4.8, 17.2, 0.4, { crouch: 0.8, walk: t * 2 }), hide] };
  }
  if (sh === 13) {
    const T0 = K.lineup, t13 = wd(9, "13");
    return { ...base, lineup: 13 * easeOut(prog(t, T0 + 0.1, t13 + 0.3)) + 0.001,
      cam: camPath(t, [{ at: T0, pos: [99.2, 1.75, 5.2], look: [101.5, 1.25, -2], fov: 46 }, { at: t13, pos: [104.5, 2.3, 9.5], look: [106, 1.2, -2], fov: 44 }, { at: K.found, pos: [106, 3.2, 17], look: [106, 1.1, -2], fov: 42 }]) };
  }
  // sh === 16: the end, outside the bank, the basement glows red through the ground
  const T0 = K.end;
  return { ...base, cut: 0.7 + 0.3 * easeInOut(prog(t, wd(11, "سه"), wd(11, "نشه"))), path: 1, doors: 4, open: BOXES, alarm: 0.6,
    cam: camPath(t, [{ at: T0, pos: [12, 22, -6], look: [0, -3, 15.5], fov: 46 }, { at: E(11), pos: [-12, 46, -22], look: [-2, -3, 13], fov: 42 }, { at: TOTAL, pos: [-14, 52, -25], look: [-2, -3, 13], fov: 42 }]) };
};

const World3D: React.FC<{ t: number }> = ({ t }) => {
  const { gl, scene, camera } = useThree();
  const world = useMemo(() => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.15; return buildWorld(scene, gl); }, [gl, scene]);
  const on = THREE_D.has(shotAt(t));
  useLayoutEffect(() => { if (on) world.update(direct(t), camera as THREE.PerspectiveCamera); }, [t, on, world, camera]);
  useFrame(() => { if (on) gl.render(scene, camera); }, 1);
  return null;
};

/* ───────── projection for labels on the 3D map */
const PROJ = new THREE.PerspectiveCamera(45, W / H, 0.05, 400);
const project = (s: State, p: THREE.Vector3) => {
  PROJ.position.set(...s.cam.pos); PROJ.fov = s.cam.fov; PROJ.up.set(0, 1, 0); PROJ.lookAt(...s.cam.look); PROJ.updateProjectionMatrix(); PROJ.updateMatrixWorld();
  const v = p.clone().project(PROJ);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, ok: v.z < 1 };
};
const A = {
  bank: new THREE.Vector3(2.3, 13.6, 10), sign: new THREE.Vector3(2.3, 5.2, 8.8), gate: new THREE.Vector3(2, 14.2, -10.2), street: new THREE.Vector3(-12, 0.3, -2),
  next: new THREE.Vector3(-9, 18.6, 10), breach: new THREE.Vector3(-4.1, -2.2, 15.3), doors: new THREE.Vector3(-0.35, -0.6, 15.3), vault: new THREE.Vector3(5.8, -0.4, 17.5),
  cam: new THREE.Vector3(3.4, -0.7, 11.4),
};
const Tag3D: React.FC<{ s: State; p: THREE.Vector3; t: number; t0: number; text: string; sub?: string; color?: string; up?: number; side?: 1 | -1 }> = ({ s, p, t, t0, text, sub, color = BONE, up = 150, side = 1 }) => {
  if (t < t0) return null;
  const q = project(s, p);
  if (!q.ok) return null;
  const u = backOut(prog(t, t0, t0 + 0.4)), line = easeOut(prog(t, t0, t0 + 0.25));
  const x = clamp(q.x, 150, W - 150), y = q.y;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={q.x} cy={y} r={9 + 18 * ((t - t0) % 1.2)} fill="none" stroke={color} strokeWidth={2} opacity={0.8 * (1 - ((t - t0) % 1.2) / 1.2)} />
        <circle cx={q.x} cy={y} r={7} fill={color} />
        <line x1={q.x} y1={y} x2={x + side * 40 * line} y2={y - up * line} stroke={color} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: x + side * 40, top: y - up - 30, transform: `translate(${side > 0 ? "0" : "-100%"}, -50%) scale(${0.6 + 0.4 * u})`, transformOrigin: side > 0 ? "left center" : "right center", opacity: clamp(u * 2) }}>
        <div style={{ direction: "rtl", background: "rgba(7,9,13,0.86)", border: `2.5px solid ${color}`, borderRadius: 12, padding: "10px 22px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: "Z43Black", fontSize: 44, color, lineHeight: 1.25 }}>{text}</div>
          {sub && <div style={{ fontFamily: "Z43Reg", fontSize: 26, color: MUTED, lineHeight: 1.3 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
};

/* ───────── 2D pieces */
const Grain: React.FC<{ o?: number }> = ({ o = 0.08 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: o, backgroundImage: `repeating-radial-gradient(circle at ${30 + hash(f) * 40}% ${30 + hash(f + 1) * 40}%, #fff 0 1px, transparent 1px 3px)`, mixBlendMode: "overlay" }} />;
};
const Vig: React.FC<{ k?: number }> = ({ k = 0.7 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 46%, rgba(0,0,0,${k}) 100%)` }} />;
const Tag: React.FC<{ children: React.ReactNode; top?: number; color?: string }> = ({ children, top = 196, color = BONE }) => (
  <div style={{ position: "absolute", top, right: 44, direction: "rtl", display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 8, background: "rgba(7,9,13,0.7)", border: "1.5px solid rgba(238,232,220,0.28)", fontFamily: "Z43Bold", fontSize: 26, color }}>
    <span style={{ width: 10, height: 10, borderRadius: 5, background: RED }} />{children}
  </div>
);
const Brand: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", top: 120, left: 44, display: "flex", alignItems: "center", gap: 12, fontFamily: "Z43Bebas", fontSize: 40, letterSpacing: 4, color: BONE, opacity: 0.88 }}>
    <span style={{ width: 16, height: 16, borderRadius: 8, background: RED, opacity: 0.6 + 0.4 * Math.sin(t * 6) }} />SCENE ZERO
  </div>
);
const Stamp: React.FC<{ t: number; t0: number; text: string; sub?: string; color?: string; size?: number; rot?: number; style?: React.CSSProperties }> = ({ t, t0, text, sub, color = RED, size = 92, rot = -7, style }) => {
  if (t < t0) return null;
  const u = prog(t, t0, t0 + 0.16), k = lerp(2.2, 1, easeOut(u));
  return (
    <div style={{ position: "absolute", left: 0, width: W, display: "flex", justifyContent: "center", ...style }}>
      <div style={{ direction: "rtl", transform: `rotate(${rot}deg) scale(${k})`, opacity: clamp(u * 3), border: `7px solid ${color}`, borderRadius: 16, padding: "10px 36px", textAlign: "center", color, background: "rgba(7,9,13,0.55)", boxShadow: `0 0 50px ${color}44` }}>
        <div style={{ fontFamily: "Z43Black", fontSize: size, lineHeight: 1.2 }}>{text}</div>
        {sub && <div style={{ fontFamily: "Z43Bold", fontSize: size * 0.34, opacity: 0.9 }}>{sub}</div>}
      </div>
    </div>
  );
};
/** stock clip, center-cropped to 9:16 with a slow push */
const Clip: React.FC<{ src: string; t: number; t0: number; t1: number; focus?: number; z0?: number; z1?: number; from?: number; rate?: number; grade?: string }> = ({ src, t, t0, t1, focus = 0.5, z0 = 1.04, z1 = 1.14, from = 0, rate = 1, grade = "saturate(0.8) contrast(1.08) brightness(0.92)" }) => {
  const u = prog(t, t0, t1), z = lerp(z0, z1, u);
  const vw = H * (16 / 9); // video scaled to the frame height
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <Sequence from={Math.round(t0 * FPS)} layout="none">
        <OffthreadVideo muted src={staticFile(`v43/footage/${src}.mp4`)} startFrom={Math.round(from * FPS)} playbackRate={rate}
          style={{ position: "absolute", height: H, width: vw, maxWidth: "none", objectFit: "cover", left: W / 2 - vw * focus, top: 0, transform: `scale(${z})`, transformOrigin: `${focus * 100}% 50%`, filter: grade }} />
      </Sequence>
    </AbsoluteFill>
  );
};
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = BONE, font = "Z43Black", style }) => (
  <div style={{ direction: "rtl", fontFamily: font, fontSize: size, color, lineHeight: 1.12, textShadow: "0 8px 40px rgba(0,0,0,0.8)", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const pop = (t: number, t0: number, d = 0.35) => backOut(prog(t, t0, t0 + d));

/* clock face (hands run at `speed` hours per second) */
const Clock: React.FC<{ t: number; r?: number; hours: number; color?: string }> = ({ t, r = 120, hours, color = BONE }) => {
  const h = (hours % 12) * 30, m = (hours % 1) * 360;
  return (
    <svg width={r * 2 + 20} height={r * 2 + 20} viewBox={`${-r - 10} ${-r - 10} ${r * 2 + 20} ${r * 2 + 20}`}>
      <circle r={r} fill="rgba(7,9,13,0.75)" stroke={color} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r + 12} x2={0} y2={-r + (i % 3 ? 24 : 36)} stroke={color} strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke={color} strokeWidth={10} strokeLinecap="round" transform={`rotate(${h})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.78} stroke={RED} strokeWidth={6} strokeLinecap="round" transform={`rotate(${m})`} />
      <circle r={10} fill={RED} />
    </svg>
  );
};

/* ───────── shots in 2D */
const PoliceShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Clip src="police" t={t} t0={K.police} t1={K.map} focus={0.52} z0={1.12} z1={1.3} grade="saturate(1.1) contrast(1.15) brightness(0.95)" />
    <AbsoluteFill style={{ background: `rgba(255,40,40,${0.12 + 0.1 * Math.sin(t * 14)})`, mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ alignItems: "center", top: 560 }}>
      <div style={{ transform: `scale(${pop(t, wd(1, "پلیس") - 0.05)})` }}>
        <svg width={220} height={240} viewBox="0 0 220 240"><path d="M110 8 L200 44 V120 C200 178 160 214 110 232 C60 214 20 178 20 120 V44 Z" fill="rgba(7,9,13,0.8)" stroke={BONE} strokeWidth={8} /><path d="M110 64 l16 34 37 4 -28 25 8 36 -33 -19 -33 19 8 -36 -28 -25 37 -4 Z" fill={AMBER} /></svg>
      </div>
      <Big size={96} style={{ marginTop: 18, opacity: prog(t, wd(1, "فهمید") - 0.1, wd(1, "فهمید") + 0.15) }}>پلیس فهمید…</Big>
    </AbsoluteFill>
    <Tag>تصویر نمادین</Tag>
  </AbsoluteFill>
);
const MapShot: React.FC<{ t: number }> = ({ t }) => {
  const w = 1000, [tx, ty] = MAP.cities.tehran;
  const draw = easeInOut(prog(t, K.map, K.map + 0.5));
  const ends: [number, number][] = [[-80, 200], [130, 980], [-40, 760]];
  const tOut = wd(1, "خارج") - 0.15;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, #18202c 0%, #07090d 70%)" }} />
      <div style={{ position: "absolute", left: (W - w) / 2, top: 360, transform: `scale(${1 + 0.05 * (t - K.map)})`, transformOrigin: "50% 40%" }}>
        <IranMap w={w} draw={draw} stroke={BONE}>
          {ends.map(([ex, ey], i) => {
            const u = easeInOut(prog(t, tOut + i * 0.12, tOut + 0.9 + i * 0.12));
            const cx = (tx + ex) / 2 + (i - 1) * 120, cy = Math.min(ty, ey) - 160;
            const path = `M${tx} ${ty} Q${cx} ${cy} ${ex} ${ey}`;
            const P = (s: number) => [(1 - s) ** 2 * tx + 2 * (1 - s) * s * cx + s * s * ex, (1 - s) ** 2 * ty + 2 * (1 - s) * s * cy + s * s * ey];
            const [px, py] = P(u), [qx, qy] = P(Math.min(1, u + 0.02));
            const ang = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
            return (
              <g key={i} opacity={u > 0 ? 1 : 0}>
                <path d={path} fill="none" stroke={RED} strokeWidth={5} pathLength={1000} strokeDasharray={`${u * 1000} 1000`} opacity={0.9} strokeLinecap="round" />
                <g transform={`translate(${px} ${py}) rotate(${ang})`}><path d="M18 0 L-10 -14 L-4 0 L-10 14 Z" fill={BONE} /></g>
              </g>
            );
          })}
          <circle cx={tx} cy={ty} r={14} fill={RED} />
          <circle cx={tx} cy={ty} r={14 + ((t * 30) % 40)} fill="none" stroke={RED} strokeWidth={3} opacity={1 - ((t * 30) % 40) / 40} />
          <text x={tx + 26} y={ty - 18} fill={BONE} fontFamily="Z43Black" fontSize={40} direction="rtl" textAnchor="start" style={{ direction: "rtl" }}>تهران</text>
        </IranMap>
      </div>
      <div style={{ position: "absolute", top: 1180, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, tOut)})`, opacity: prog(t, tOut, tOut + 0.1) }}>
        <div style={{ direction: "rtl", padding: "14px 34px", borderRadius: 12, background: RED, color: "#fff", fontFamily: "Z43Black", fontSize: 58 }}>از ایران خارج شدن</div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
const VaultDoor: React.FC<{ t: number; size?: number }> = ({ t, size = 420 }) => (
  <svg width={size} height={size} viewBox="-110 -110 220 220">
    <circle r={104} fill="#1a1f27" stroke="#5d6470" strokeWidth={6} />
    <circle r={86} fill="#232a34" stroke="#3d444f" strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={0} cy={-95} r={4.5} fill="#7d848c" transform={`rotate(${i * 30})`} />)}
    <g transform={`rotate(${t * 40})`}>
      {[0, 60, 120].map((a) => <rect key={a} x={-4} y={-64} width={8} height={128} rx={4} fill="#9aa1a8" transform={`rotate(${a})`} />)}
      <circle r={22} fill="#3a414c" stroke="#9aa1a8" strokeWidth={4} />
    </g>
  </svg>
);
const HowShot: React.FC<{ t: number }> = ({ t }) => {
  const t3 = wd(2, "سه") - 0.1, tBig = wd(2, "بزرگ‌ترین") - 0.05, tNo = wd(2, "بی‌خبر") - 0.05;
  const hours = 72 * easeInOut(prog(t, t3, t3 + 2.6));
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #1b2330 0%, #07090d 72%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(238,232,220,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(238,232,220,0.04) 2px, transparent 2px)", backgroundSize: "90px 90px", transform: `translateY(${-(t * 20) % 90}px)` }} />
      <div style={{ position: "absolute", top: 190, transform: `scale(${pop(t, K.how, 0.5) * (1 + 0.03 * (t - K.how))})` }}><VaultDoor t={t} size={380} /></div>
      <div style={{ position: "absolute", top: 600, width: W, textAlign: "center", opacity: prog(t, t3, t3 + 0.15) }}>
        <Big font="Z43Num" size={230} style={{ color: BONE }}>{fa(Math.floor(hours))}<span style={{ fontSize: 100, color: MUTED }}> ساعت</span></Big>
        <div style={{ margin: "10px auto 0", width: 760, height: 16, borderRadius: 8, background: "rgba(238,232,220,0.12)", overflow: "hidden", direction: "rtl" }}>
          <div style={{ width: `${(hours / 72) * 100}%`, height: "100%", background: RED, marginLeft: "auto" }} />
        </div>
        <div style={{ display: "flex", direction: "rtl", justifyContent: "space-between", width: 760, margin: "12px auto 0", fontFamily: "Z43Bold", fontSize: 30, color: MUTED }}>
          {["روز ۱", "روز ۲", "روز ۳"].map((d, i) => <span key={d} style={{ color: hours > i * 24 + 1 ? BONE : MUTED }}>{d}</span>)}
        </div>
      </div>
      {t > tBig && <div style={{ position: "absolute", top: 1195, transform: `scale(${pop(t, tBig)})` }}><div style={{ direction: "rtl", fontFamily: "Z43Bold", fontSize: 36, color: AMBER, padding: "8px 24px", border: `2px solid ${AMBER}`, borderRadius: 10, background: "rgba(7,9,13,0.8)" }}>یکی از بزرگ‌ترین سرقت‌های بانکی ایران</div></div>}
      <Stamp t={t} t0={tNo} text="بی‌خبر" style={{ top: 990 }} size={100} />
      <Grain />
    </AbsoluteFill>
  );
};
const DateShot: React.FC<{ t: number }> = ({ t }) => {
  const tD = wd(3, "13") - 0.05, tY = wd(3, "1401") - 0.05, tC = wd(3, "ساعت") - 0.1;
  const sec = Math.floor((t - tC) * 1.0) % 60;
  return (
    <AbsoluteFill>
      <Clip src="city" t={t} t0={K.date} t1={K.street} focus={0.42} z0={1.05} z1={1.16} grade="saturate(0.6) contrast(1.1) brightness(0.75) hue-rotate(-8deg)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.75) 0%, rgba(7,9,13,0.2) 40%, rgba(7,9,13,0.3) 60%, rgba(7,9,13,0.9) 100%)" }} />
      <div style={{ position: "absolute", top: 330, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", direction: "rtl", gap: 28 }}>
          {[["۱۳", tD], ["خرداد", wd(3, "خرداد") - 0.05], ["۱۴۰۱", tY]].map(([w, t0]) => (
            <Big key={w as string} size={130} style={{ opacity: prog(t, t0 as number, (t0 as number) + 0.08), transform: `translateY(${(1 - easeOut(prog(t, t0 as number, (t0 as number) + 0.3))) * 40}px)` }}>{w}</Big>
          ))}
        </div>
        <div style={{ fontFamily: "Z43Bold", fontSize: 38, color: MUTED, direction: "rtl", opacity: prog(t, tY + 0.3, tY + 0.6) }}>جمعه · شب تعطیلی</div>
      </div>
      {t > tC && (
        <div style={{ position: "absolute", top: 760, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, tC)})` }}>
          <div style={{ fontFamily: "Z43Mono", fontSize: 200, color: RED, letterSpacing: 6, padding: "10px 44px", background: "rgba(7,9,13,0.85)", border: `3px solid ${RED}55`, borderRadius: 18, textShadow: `0 0 30px ${RED}88` }}>
            02<span style={{ opacity: Math.floor(t * 2) % 2 ? 0.2 : 1 }}>:</span>00<span style={{ fontSize: 80, opacity: 0.7 }}>:{String(Math.max(0, sec)).padStart(2, "0")}</span>
          </div>
        </div>
      )}
      {t > tC && <div style={{ position: "absolute", top: 1090, width: W, textAlign: "center", fontFamily: "Z43Black", fontSize: 64, color: BONE, direction: "rtl", opacity: prog(t, wd(3, "بامداد") - 0.1, wd(3, "بامداد") + 0.2) }}>بامداد</div>}
      <Tag>تصویر نمادین · شب شهر</Tag>
    </AbsoluteFill>
  );
};
const LootShot: React.FC<{ t: number }> = ({ t }) => {
  const b = [K.loot, wd(6, "سکه") - 0.07, wd(6, "ارز") - 0.07, wd(6, "اموال") - 0.07, K.cctv];
  const items: [string, string, number][] = [["gold", "طلا", 0.5], ["coins", "سکه", 0.45], ["cash", "ارز", 0.5]];
  const i = t < b[1] ? 0 : t < b[2] ? 1 : t < b[3] ? 2 : 3;
  if (i < 3) {
    const [src, word, f] = items[i];
    return (
      <AbsoluteFill>
        <Clip src={src} t={t} t0={b[i]} t1={b[i + 1]} focus={f} z0={1.15} z1={1.32} grade="saturate(1.05) contrast(1.12) brightness(0.9)" />
        <Vig k={0.75} />
        <AbsoluteFill style={{ alignItems: "center", top: 700 }}>
          <Big size={230} style={{ transform: `scale(${lerp(1.35, 1, easeOut(prog(t, b[i], b[i] + 0.2)))})`, color: i === 0 ? AMBER : BONE }}>{word}</Big>
        </AbsoluteFill>
        <Tag>تصویر نمادین</Tag>
      </AbsoluteFill>
    );
  }
  // three panels + label
  return (
    <AbsoluteFill style={{ background: INK }}>
      {items.map(([src, word, f], k) => {
        const u = easeOut(prog(t, b[3] + k * 0.08, b[3] + k * 0.08 + 0.35));
        return (
          <div key={src} style={{ position: "absolute", left: 0, top: 210 + k * 345, width: W, height: 335, overflow: "hidden", transform: `translateX(${(1 - u) * (k % 2 ? -100 : 100)}%)`, borderTop: `3px solid ${INK}` }}>
            <div style={{ position: "absolute", left: 0, top: -760, width: W, height: H, transform: "scale(1.0)" }}>
              <Clip src={src} t={t} t0={b[3]} t1={b[4]} focus={f} z0={1.0} z1={1.08} from={1.2} grade="saturate(0.9) contrast(1.1) brightness(0.85)" />
            </div>
            <div style={{ position: "absolute", right: 40, bottom: 22, fontFamily: "Z43Black", fontSize: 58, color: BONE, direction: "rtl", textShadow: "0 4px 20px #000" }}>{word}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1235, width: W, textAlign: "center", opacity: prog(t, wd(6, "باارزش") - 0.1, wd(6, "باارزش") + 0.15) }}>
        <Big size={58} style={{ color: AMBER }}>اموالِ مشتری‌ها</Big>
      </div>
      <Tag>تصویر نمادین</Tag>
    </AbsoluteFill>
  );
};
const DayCard: React.FC<{ d: string; w: string; note: string; icon: React.ReactNode; hot?: boolean; t: number; t0: number }> = ({ d, w, note, icon, hot, t, t0 }) => {
  const u = backOut(prog(t, t0, t0 + 0.4));
  return (
    <div style={{ width: 225, height: 360, borderRadius: 20, background: hot ? "#1d0c0c" : "#141920", border: `3px solid ${hot ? RED : "rgba(238,232,220,0.2)"}`, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", opacity: clamp(u * 2), transform: `translateY(${(1 - u) * 60}px) scale(${0.8 + 0.2 * u})`, boxShadow: hot ? `0 0 40px ${RED}44` : "0 10px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100%", height: 58, background: hot ? RED : "#2a313b", color: "#fff", fontFamily: "Z43Bold", fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl" }}>{w}</div>
      <div style={{ fontFamily: "Z43Num", fontSize: 130, color: BONE, lineHeight: 1.15, marginTop: 6 }}>{d}</div>
      <div style={{ height: 70 }}>{icon}</div>
      <div style={{ fontFamily: "Z43Bold", fontSize: 28, color: hot ? "#ffb3ad" : MUTED, direction: "rtl", marginTop: 8 }}>{note}</div>
    </div>
  );
};
const IcMoon = <svg width={70} height={70} viewBox="0 0 70 70"><path d="M44 10 A26 26 0 1 0 60 46 A20 20 0 1 1 44 10 Z" fill={AMBER} /></svg>;
const IcShut = <svg width={70} height={70} viewBox="0 0 70 70"><rect x={8} y={10} width={54} height={50} rx={4} fill="none" stroke={MUTED} strokeWidth={4} />{[20, 30, 40, 50].map((y) => <line key={y} x1={12} x2={58} y1={y} y2={y} stroke={MUTED} strokeWidth={3} />)}</svg>;
const IcBadge = <svg width={70} height={70} viewBox="0 0 220 240"><path d="M110 8 L200 44 V120 C200 178 160 214 110 232 C60 214 20 178 20 120 V44 Z" fill="none" stroke={BONE} strokeWidth={16} /><path d="M110 64 l16 34 37 4 -28 25 8 36 -33 -19 -33 19 8 -36 -28 -25 37 -4 Z" fill={RED} /></svg>;
const CalShot: React.FC<{ t: number }> = ({ t }) => {
  const t16 = wd(8, "16") - 0.1, t3 = wd(8, "سه") - 0.1;
  const bar = easeInOut(prog(t, t3 - 0.1, t3 + 0.6));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 36%, #1b2330 0%, #07090d 70%)" }} />
      <div style={{ position: "absolute", top: 230, width: W, textAlign: "center", fontFamily: "Z43Black", fontSize: 62, color: BONE, direction: "rtl" }}>خرداد ۱۴۰۱</div>
      <div style={{ position: "absolute", top: 380, width: W, display: "flex", direction: "rtl", justifyContent: "center", gap: 20, transform: `translateX(${-5 * (t - K.cal)}px)` }}>
        <DayCard d="۱۳" w="جمعه" note="۲ بامداد · سرقت" icon={IcMoon} t={t} t0={K.cal + 0.05} hot />
        <DayCard d="۱۴" w="تعطیل" note="بانک بسته" icon={IcShut} t={t} t0={K.cal + 0.15} />
        <DayCard d="۱۵" w="تعطیل" note="بانک بسته" icon={IcShut} t={t} t0={K.cal + 0.25} />
        <DayCard d="۱۶" w="دوشنبه" note="صبح · گزارش" icon={IcBadge} t={t} t0={t16} hot={t > t16 + 0.3} />
      </div>
      <svg width={W} height={200} style={{ position: "absolute", top: 780 }}>
        <line x1={960} x2={960 - 840 * bar} y1={60} y2={60} stroke={RED} strokeWidth={8} strokeLinecap="round" />
        <circle cx={960} cy={60} r={14} fill={RED} opacity={bar > 0 ? 1 : 0} />
        <circle cx={960 - 840 * bar} cy={60} r={14} fill={RED} opacity={bar > 0 ? 1 : 0} />
      </svg>
      <div style={{ position: "absolute", top: 900, width: W, textAlign: "center", transform: `scale(${pop(t, t3 + 0.2)})`, opacity: prog(t, t3 + 0.2, t3 + 0.3) }}>
        <Big font="Z43Black" size={120} style={{ color: RED }}>حدود ۳ روز بعد</Big>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
const FledShot: React.FC<{ t: number }> = ({ t }) => {
  const tP = wd(8, "طبق") - 0.05, tOut = wd(8, "خارج") - 0.1, tB = wd(8, "پیش") - 0.1;
  return (
    <AbsoluteFill>
      <Clip src="departs" t={t} t0={K.fled} t1={K.probe} focus={0.38} z0={1.06} z1={1.22} grade="saturate(0.9) contrast(1.12) brightness(0.85)" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.8) 0%, rgba(7,9,13,0.1) 35%, rgba(7,9,13,0.25) 60%, rgba(7,9,13,0.9) 100%)" }} />
      {t > tP && (
        <div style={{ position: "absolute", top: 300, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, tP)})` }}>
          <div style={{ direction: "rtl", display: "flex", alignItems: "center", gap: 16, fontFamily: "Z43Black", fontSize: 54, color: BONE, padding: "14px 32px", borderRadius: 14, background: "rgba(7,9,13,0.85)", border: `2.5px solid ${BONE}` }}>
            <div style={{ width: 52, height: 56 }}>{IcBadge}</div>طبق گزارش پلیس
          </div>
        </div>
      )}
      {t > tB && <div style={{ position: "absolute", top: 520, width: W, textAlign: "center", fontFamily: "Z43Bold", fontSize: 50, color: AMBER, direction: "rtl", opacity: prog(t, tB, tB + 0.2) }}>پیش از اعلامِ سرقت</div>}
      <Stamp t={t} t0={tOut} text="خروج از کشور" sub="بعضی از سارق‌ها" style={{ top: 700 }} size={104} />
      <Tag>تصویر نمادین · فرودگاه</Tag>
    </AbsoluteFill>
  );
};
const ProbeShot: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Clip src="tape" t={t} t0={K.probe} t1={K.lineup} focus={0.55} z0={1.1} z1={1.25} grade="saturate(0.85) contrast(1.15) brightness(0.88)" />
    <Vig k={0.7} />
    <div style={{ position: "absolute", top: 600, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, wd(9, "تحقیقات") - 0.1)})` }}>
      <div style={{ direction: "rtl", fontFamily: "Z43Black", fontSize: 76, color: INK, background: AMBER, padding: "12px 40px", borderRadius: 12, transform: "rotate(-3deg)" }}>تحقیقات شروع شد</div>
    </div>
    <Tag>تصویر نمادین</Tag>
  </AbsoluteFill>
);
const FoundShot: React.FC<{ t: number }> = ({ t }) => {
  const tK = wd(9, "کشف") - 0.05;
  return (
    <AbsoluteFill>
      <Clip src="valuables" t={t} t0={K.found} t1={K.q} focus={0.5} z0={1.12} z1={1.28} grade="saturate(0.95) contrast(1.12) brightness(0.88)" />
      <Vig k={0.75} />
      <div style={{ position: "absolute", top: 420, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, tK)})`, opacity: prog(t, tK, tK + 0.1) }}>
        <div style={{ direction: "rtl", background: "#e9e3d3", color: INK, padding: "18px 30px 22px", borderRadius: 6, width: 640, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", transform: "rotate(2deg)", fontFamily: "Z43Bold" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, borderBottom: `3px solid ${INK}`, paddingBottom: 8 }}><span>مدرک</span><span style={{ fontFamily: "Z43Mono" }}>EVIDENCE</span></div>
          <div style={{ fontFamily: "Z43Black", fontSize: 54, marginTop: 10 }}>کشفِ بخشِ زیادی از اموال</div>
          <div style={{ fontSize: 28, color: "#5b574f", marginTop: 4 }}>اعلام دادستانی تهران</div>
        </div>
      </div>
      <Tag>تصویر نمادین</Tag>
    </AbsoluteFill>
  );
};
const QShot: React.FC<{ t: number }> = ({ t }) => {
  const u = pop(t, K.q + 0.05, 0.5), g = t - K.q < 0.25 || Math.floor(t * 9) % 11 === 0;
  return (
    <AbsoluteFill style={{ background: "#050608", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${RED}33 0%, rgba(0,0,0,0) 45%)` }} />
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", top: 380, fontFamily: "Z43Black", fontSize: 720, color: k ? RED : "#3cf", lineHeight: 1, opacity: k ? 1 : g ? 0.6 : 0, transform: `translateX(${k ? 0 : g ? 14 : 0}px) scale(${u * (1 + 0.04 * (t - K.q))})`, mixBlendMode: k ? "normal" : "screen" }}>؟</div>
      ))}
      <Grain o={0.12} />
    </AbsoluteFill>
  );
};

/* ───────── overlays on the 3D shots */
const Over3D: React.FC<{ t: number; s: State }> = ({ t, s }) => {
  const sh = shotAt(t);
  if (sh === 0) {
    const t12 = wd(1, "12") - 0.08;
    return (
      <>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.7) 0%, rgba(7,9,13,0) 30%)" }} />
        <div style={{ position: "absolute", top: 300, width: W, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pop(t, t12)})`, opacity: prog(t, t12, t12 + 0.06) }}>
          <Clock t={t} r={110} hours={2 + 12 * prog(t, t12, K.police)} />
          <Big font="Z43Black" size={150} style={{ marginTop: 10 }}><span style={{ color: RED }}>۱۲</span> ساعت</Big>
          <div style={{ fontFamily: "Z43Bold", fontSize: 44, color: BONE, direction: "rtl", opacity: prog(t, wd(1, "بانک"), wd(1, "بانک") + 0.2) }}>داخلِ یه بانک در تهران</div>
        </div>
      </>
    );
  }
  if (sh === 5) {
    return (
      <>
        <Tag3D s={s} p={A.street} t={t} t0={K.street + 0.15} text="خیابان انقلاب" color={BONE} up={110} side={-1} />
        <Tag3D s={s} p={A.sign} t={t} t0={wd(4, "شعبه") - 0.1} text="بانک ملی" sub="شعبه‌ی دانشگاه" color={RED} up={260} side={-1} />
        <Tag3D s={s} p={A.gate} t={t} t0={wd(4, "روبه‌روی") - 0.1} text="دانشگاه تهران" sub="روبه‌روی بانک" color={AMBER} up={120} side={1} />
      </>
    );
  }
  if (sh === 6) {
    const d = K.vault - K.dive, T0 = K.dive;
    return (
      <>
        <Tag3D s={s} p={A.next} t={t} t0={T0 + 0.2} text="ساختمان مجاور" sub="راه ورود" color={BONE} up={90} side={-1} />
        <Tag3D s={s} p={A.breach} t={t} t0={T0 + d * 0.36} text="سوراخ در دیوار" color={AMBER} up={230} side={-1} />
        <Tag3D s={s} p={A.doors} t={t} t0={T0 + d * 0.62} text="۴ درِ قفل" color={BONE} up={300} side={1} />
        <Tag3D s={s} p={A.vault} t={t} t0={T0 + d * 0.85} text="صندوق امانات" color={RED} up={170} side={1} />
        <div style={{ position: "absolute", top: 250, width: W, textAlign: "center", fontFamily: "Z43Reg", fontSize: 26, color: MUTED, direction: "rtl", opacity: prog(t, T0 + 0.3, T0 + 0.6) }}>مسیر بر اساس گزارش‌های رسانه‌ها</div>
      </>
    );
  }
  if (sh === 7) {
    const t168 = wd(5, "168") - 0.1, tH = wd(5, "ساعت‌ها") - 0.1;
    return (
      <>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.75) 0%, rgba(7,9,13,0) 34%)" }} />
        <div style={{ position: "absolute", top: 230, right: 70, transform: `scale(${pop(t, tH) * 0.8})`, transformOrigin: "right top" }}><Clock t={t} r={95} hours={2 + 10 * prog(t, tH, K.loot)} /></div>
        {t > t168 && (
          <div style={{ position: "absolute", top: 330, left: 70, direction: "rtl", transform: `scale(${pop(t, t168)})`, transformOrigin: "left top" }}>
            <div style={{ fontFamily: "Z43Num", fontSize: 220, color: BONE, lineHeight: 1, textShadow: `0 0 40px ${AMBER}66` }}>{fa(Math.round(s.open))}</div>
            <div style={{ fontFamily: "Z43Black", fontSize: 56, color: AMBER, marginTop: -10 }}>صندوق امانات</div>
          </div>
        )}
      </>
    );
  }
  if (sh === 9) {
    const sec = Math.floor((t - K.cctv) * 6) + 12;
    return (
      <>
        <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 5px)" }} />
        <AbsoluteFill style={{ border: "4px solid rgba(220,255,220,0.35)", margin: 40, borderRadius: 4 }} />
        <div style={{ position: "absolute", top: 210, left: 80, fontFamily: "Z43Mono", fontSize: 40, color: "#dfffe0", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 24, height: 24, borderRadius: 12, background: RED, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25 }} />REC
        </div>
        <div style={{ position: "absolute", top: 210, right: 80, fontFamily: "Z43Mono", fontSize: 34, color: "#dfffe0" }}>CAM 03 · VAULT</div>
        <div style={{ position: "absolute", bottom: 380, left: 80, fontFamily: "Z43Mono", fontSize: 34, color: "#dfffe0" }}>{`1401/03/14  03:47:${String(sec % 60).padStart(2, "0")}`}</div>
      </>
    );
  }
  if (sh === 13) {
    const t13 = wd(9, "13") - 0.1;
    return (
      <>
        {Array.from({ length: 13 }, (_, i) => {
          const q = project(s, new THREE.Vector3(100 + i, 0.55, -1.2)), on = s.lineup > i;
          if (!on || !q.ok || q.x < -60 || q.x > W + 60) return null;
          return <div key={i} style={{ position: "absolute", left: q.x - 34, top: q.y - 26, width: 68, height: 52, background: "#111", border: `2px solid ${BONE}`, color: BONE, fontFamily: "Z43Num", fontSize: 38, textAlign: "center", lineHeight: "52px" }}>{fa(i + 1)}</div>;
        })}
        {t > t13 && <div style={{ position: "absolute", top: 260, width: W, display: "flex", justifyContent: "center", transform: `scale(${pop(t, t13)})` }}>
          <div style={{ direction: "rtl", fontFamily: "Z43Black", fontSize: 84, color: BONE, padding: "6px 36px", background: "rgba(7,9,13,0.8)", borderRadius: 16, border: `3px solid ${RED}`, whiteSpace: "nowrap" }}><span style={{ color: RED }}>۱۳</span> متهم بازداشت شدن</div>
        </div>}
      </>
    );
  }
  if (sh === 16) {
    const t12 = wd(11, "12") - 0.1, t3 = wd(11, "سه") - 0.1, tEnd = E(11) + 0.15;
    return (
      <>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,13,0.75) 0%, rgba(7,9,13,0) 30%, rgba(7,9,13,0) 60%, rgba(7,9,13,0.6) 100%)" }} />
        <div style={{ position: "absolute", top: 270, width: W, display: "flex", direction: "rtl", justifyContent: "center", gap: 40, opacity: 1 - prog(t, tEnd, tEnd + 0.3) }}>
          <div style={{ textAlign: "center", transform: `scale(${pop(t, t12)})`, opacity: prog(t, t12, t12 + 0.05) }}><Big font="Z43Num" size={170} style={{ color: BONE }}>۱۲</Big><div style={{ fontFamily: "Z43Bold", fontSize: 40, color: MUTED }}>ساعت داخل بانک</div></div>
          <div style={{ width: 4, background: RED, opacity: prog(t, t3, t3 + 0.2) }} />
          <div style={{ textAlign: "center", transform: `scale(${pop(t, t3)})`, opacity: prog(t, t3, t3 + 0.05) }}><Big font="Z43Num" size={170} style={{ color: RED }}>۳</Big><div style={{ fontFamily: "Z43Bold", fontSize: 40, color: MUTED }}>روز بی‌خبری</div></div>
        </div>
        {t > tEnd && (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(5,6,8,${0.55 * prog(t, tEnd, tEnd + 0.4)})` }}>
            <div style={{ transform: `scale(${pop(t, tEnd, 0.5)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
              <div style={{ fontFamily: "Z43Bebas", fontSize: 150, letterSpacing: 10, color: BONE, display: "flex", alignItems: "center", gap: 22 }}><span style={{ width: 44, height: 44, borderRadius: 22, background: RED }} />SCENE ZERO</div>
              <div style={{ direction: "rtl", fontFamily: "Z43Black", fontSize: 62, color: INK, background: BONE, padding: "12px 40px", borderRadius: 14 }}>نظرت چیه؟ کامنت کن</div>
            </div>
          </AbsoluteFill>
        )}
      </>
    );
  }
  return null;
};

/* ───────── captions: 1–3 words, karaoke, at y ≈ 1330 */
type Wd = { w: string; s: number; e: number; line: number };
const KEY = new Set(["12", "168", "13", "16", "1401،", "سه", "روز", "بی‌خبر", "خارج", "دستبرد", "عجیب‌ترین", "بازداشت", "کشف", "سؤال", "باخبر", "نشه؟", "صندوق", "امانات", "طلا،", "سکه،", "ارز"]);
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
  if (!c || t > E(11) + 0.1) return null;
  const u = easeOut(prog(t, c.s - 0.05, c.s + 0.1));
  return (
    <div style={{ position: "absolute", top: 1330, width: W, display: "flex", justifyContent: "center", transform: `translateY(${(1 - u) * 18}px) scale(${0.94 + 0.06 * u})`, opacity: u }}>
      <div style={{ direction: "rtl", display: "flex", gap: 22, padding: "10px 30px", borderRadius: 16, background: "rgba(7,9,13,0.72)" }}>
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03, key = KEY.has(w.w);
          return <span key={i} style={{ fontFamily: "Z43Black", fontSize: 76, lineHeight: 1.3, color: on ? (key ? RED : "#fff") : "rgba(255,255,255,0.4)", textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>{fa(w.w.replace(/[،.]$/, ""))}</span>;
        })}
      </div>
    </div>
  );
};

/* ───────── main */
const Video: React.FC<{ audio?: string; at?: number }> = ({ audio, at: tAt }) => {
  const frame = useCurrentFrame();
  const t = tAt ?? frame / FPS;
  const sh = shotAt(t), is3 = THREE_D.has(sh);
  const s = is3 ? direct(t) : null;
  const cctv = sh === 9;
  const flash = SHOTS.reduce((a, [c]) => a + (c > 0 && t >= c && t < c + 0.12 ? 0.22 * (1 - (t - c) / 0.12) : 0), 0);
  const shake = [wd(5, "168"), wd(8, "خارج"), wd(11, "سه")].reduce((a, c) => a + (t > c && t < c + 0.35 ? 12 * (1 - (t - c) / 0.35) : 0), 0);
  const fadeEnd = prog(t, TOTAL - 0.35, TOTAL);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 90) * shake}px, ${Math.cos(t * 77) * shake}px)` }}>
        <AbsoluteFill style={{ opacity: is3 ? 1 : 0, filter: cctv ? "grayscale(1) sepia(0.35) hue-rotate(60deg) contrast(1.25) brightness(1.1) blur(0.6px)" : undefined }}>
          <ThreeCanvas width={W} height={H} gl={{ antialias: true, stencil: false, preserveDrawingBuffer: true }} camera={{ fov: 45, near: 0.05, far: 400, position: [0, 10, -20] }}>
            <World3D t={t} />
          </ThreeCanvas>
        </AbsoluteFill>
        {is3 && s && <Over3D t={t} s={s} />}
        {is3 && !cctv && <Tag top={196} color={MUTED}>بازسازی سه‌بعدی</Tag>}
        {cctv && <Tag top={290} color={MUTED}>بازسازی · دوربین فرضی</Tag>}
        {sh === 1 && <PoliceShot t={t} />}
        {sh === 2 && <MapShot t={t} />}
        {sh === 3 && <HowShot t={t} />}
        {sh === 4 && <DateShot t={t} />}
        {sh === 8 && <LootShot t={t} />}
        {sh === 10 && <CalShot t={t} />}
        {sh === 11 && <FledShot t={t} />}
        {sh === 12 && <ProbeShot t={t} />}
        {sh === 14 && <FoundShot t={t} />}
        {sh === 15 && <QShot t={t} />}
        <Vig k={0.55} />
      </AbsoluteFill>
      <Brand t={t} />
      <Captions t={t} />
      <AbsoluteFill style={{ background: `rgba(255,250,240,${flash})` }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${fadeEnd})` }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

// review frames: one per shot (middle) + key moments
const MID = SHOTS.map(([a, b]) => (a + b) / 2);
const LOOK = [0.3, ...MID, wd(5, "می‌زنن"), wd(7, "مونده") + 0.4, E(11) + 0.8];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return <Video at={LOOK[Math.min(f, LOOK.length - 1)]} />;
};
export const V43Compositions: React.FC = () => (
  <>
    <Composition id="V43" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v43/mix.wav" }} />
    <Composition id="V43-Silent" component={Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V43-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
