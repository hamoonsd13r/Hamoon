// V43 · the 3D heist map: Enghelab Street at night, the bank branch and the building next to it, a cutaway of the
// basement (breach in the shared wall, four doors, the vault with 168 boxes), grey mannequins with a walk cycle,
// and a lineup room. Built once with plain three.js; `update(state)` poses everything for one frame.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const BOXES = 168;
const C = {
  sky: 0x06090e, asphalt: 0x14171c, walk: 0x24272d, curb: 0x3a3d43, line: 0xd8d2c0,
  concrete: 0x343840, concrete2: 0x2b2f36, bankFace: 0x1d2a3a, bankBlue: 0x1f5fae, glassDark: 0x0d1622,
  dummy: 0xc9c4ba, police: 0x3d6fd1, mask: 0x0b0b0c, steel: 0x7d848c, steelDark: 0x4a5058, box: 0x9aa1a8,
  red: 0xff3b30, amber: 0xffb547, warm: 0xffd59a,
};
const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...o });
const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, parent?: THREE.Object3D) => {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y, z);
  parent?.add(me);
  return me;
};
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/* ───────── mannequin */
export type Dummy = {
  root: THREE.Group; hips: THREE.Group; spine: THREE.Group; neck: THREE.Group;
  sh: [THREE.Group, THREE.Group]; el: [THREE.Group, THREE.Group]; hip: [THREE.Group, THREE.Group]; kn: [THREE.Group, THREE.Group];
};
const GEO = {
  pelvis: new THREE.SphereGeometry(0.16, 16, 12),
  torso: new THREE.CapsuleGeometry(0.165, 0.3, 6, 16),
  head: new THREE.SphereGeometry(0.115, 22, 16),
  mask: new THREE.CylinderGeometry(0.112, 0.112, 0.055, 22, 1, true),
  upper: new THREE.CapsuleGeometry(0.052, 0.22, 4, 10),
  fore: new THREE.CapsuleGeometry(0.045, 0.22, 4, 10),
  hand: new THREE.SphereGeometry(0.05, 10, 8),
  thigh: new THREE.CapsuleGeometry(0.07, 0.32, 4, 12),
  shin: new THREE.CapsuleGeometry(0.056, 0.32, 4, 12),
  foot: new THREE.BoxGeometry(0.1, 0.06, 0.22),
  joint: new THREE.SphereGeometry(0.06, 10, 8),
};
const makeDummy = (mat: THREE.Material, masked: boolean): Dummy => {
  const m = (g: THREE.BufferGeometry, p: THREE.Object3D, x = 0, y = 0, z = 0, mt: THREE.Material = mat) => {
    const me = new THREE.Mesh(g, mt); me.position.set(x, y, z); p.add(me); return me;
  };
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.92; root.add(hips);
  m(GEO.pelvis, hips).scale.set(1.15, 0.75, 0.8);
  const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine);
  m(GEO.torso, spine, 0, 0.3, 0).scale.set(1.2, 1, 0.72);
  const neck = new THREE.Group(); neck.position.y = 0.6; spine.add(neck);
  m(GEO.joint, neck, 0, 0.02, 0).scale.set(0.7, 1, 0.7);
  m(GEO.head, neck, 0, 0.15, 0).scale.set(0.9, 1.1, 0.98);
  if (masked) m(GEO.mask, neck, 0, 0.17, 0, std(C.mask, { roughness: 0.4 }));
  const sh: Dummy["sh"] = [new THREE.Group(), new THREE.Group()];
  const el: Dummy["el"] = [new THREE.Group(), new THREE.Group()];
  const hip: Dummy["hip"] = [new THREE.Group(), new THREE.Group()];
  const kn: Dummy["kn"] = [new THREE.Group(), new THREE.Group()];
  [-1, 1].forEach((s, i) => {
    sh[i].position.set(0.235 * s, 0.5, 0); spine.add(sh[i]);
    m(GEO.joint, sh[i]);
    m(GEO.upper, sh[i], 0, -0.15, 0);
    el[i].position.y = -0.3; sh[i].add(el[i]);
    m(GEO.fore, el[i], 0, -0.15, 0);
    m(GEO.hand, el[i], 0, -0.31, 0);
    hip[i].position.set(0.1 * s, -0.04, 0); hips.add(hip[i]);
    m(GEO.thigh, hip[i], 0, -0.21, 0);
    kn[i].position.y = -0.42; hip[i].add(kn[i]);
    m(GEO.joint, kn[i]).scale.setScalar(0.85);
    m(GEO.shin, kn[i], 0, -0.21, 0);
    m(GEO.foot, kn[i], 0, -0.44, 0.05);
  });
  return { root, hips, spine, neck, sh, el, hip, kn };
};
export type Pose = { walk?: number; amp?: number; reach?: number; crouch?: number; look?: number; turn?: number; cuffs?: number; carry?: number };
const pose = (d: Dummy, p: Pose) => {
  const ph = p.walk ?? 0, a = p.amp ?? 0;
  const s = Math.sin(ph), c = Math.cos(ph);
  const crouch = p.crouch ?? 0, reach = p.reach ?? 0, cuffs = p.cuffs ?? 0;
  d.hips.position.y = 0.92 - 0.035 * a * Math.abs(c) - 0.3 * crouch;
  d.hips.rotation.y = 0.12 * a * s;
  d.spine.rotation.x = 0.06 * a + 0.35 * crouch - 0.1 * reach;
  d.spine.rotation.y = -0.18 * a * s + (p.turn ?? 0);
  d.neck.rotation.x = -(p.look ?? 0) * 0.9 - 0.2 * crouch;
  [0, 1].forEach((i) => {
    const sg = i === 0 ? 1 : -1;
    d.hip[i].rotation.x = -0.5 * a * s * sg - 0.9 * crouch;
    d.kn[i].rotation.x = 0.9 * a * Math.max(0, sg * c) + 1.5 * crouch;
    // arms: swing, reach up to a box, or behind the back in cuffs
    const swing = 0.45 * a * s * sg;
    d.sh[i].rotation.x = swing * (1 - reach) * (1 - cuffs) - reach * (1.7 + 0.25 * Math.sin(ph * 0.7 + i)) + cuffs * 0.45;
    d.sh[i].rotation.z = sg * (0.08 + 0.1 * cuffs) * (i === 0 ? -1 : 1);
    d.el[i].rotation.x = -0.35 * a - reach * 0.5 - cuffs * 1.2 - (p.carry ?? 0) * 1.1;
  });
};

/* ───────── world */
export type Mode = "street" | "cut" | "vault" | "cctv" | "lineup";
export type State = {
  t: number;
  cam: { pos: [number, number, number]; look: [number, number, number]; fov: number; roll?: number };
  cut: number; // 0 = solid street, 1 = basement cutaway
  path: number; // 0..1 reveal of the red route
  doors: number; // 0..4 doors opened
  breach: number; // 0..1 sparks at the wall
  open: number; // boxes open (0..168)
  thieves: { x: number; y: number; z: number; ry: number; pose: Pose; show: boolean }[];
  lineup: number; // 0..13 suspects lit
  ceiling: boolean;
  alarm: number; // red pulse in the vault
};

export const buildWorld = (scene: THREE.Scene = new THREE.Scene(), gl?: THREE.WebGLRenderer) => {
  if (gl) {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.22;
  }
  scene.background = new THREE.Color(C.sky);
  scene.fog = new THREE.Fog(C.sky, 40, 140);

  // light
  const hemi = new THREE.HemisphereLight(0x5a7aa8, 0x0c0d10, 0.55); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9db6e0, 0.7); moon.position.set(-30, 50, 40); scene.add(moon);
  const lamps: THREE.PointLight[] = [];
  [[-22, 7], [-2, 7], [18, 7], [8, -7.5]].forEach(([x, z]) => {
    const L = new THREE.PointLight(C.amber, 60, 26, 1.6); L.position.set(x, 7.2, z); scene.add(L); lamps.push(L);
  });
  const vaultWarm = new THREE.PointLight(C.warm, 22, 14, 1.4); vaultWarm.position.set(5.2, -1.0, 17); scene.add(vaultWarm);
  const vaultRed = new THREE.PointLight(C.red, 0, 16, 1.3); vaultRed.position.set(6.8, -1.4, 13.4); scene.add(vaultRed);
  const baseLights = [[-9, -0.9, 14.5], [-0.4, -1.0, 15.3]].map(([x, y, z]) => { const L = new THREE.PointLight(0xcfd8e6, 0, 13, 1.2); L.position.set(x, y, z); scene.add(L); return L; });
  const lineLight = new THREE.SpotLight(0xf2f0ea, 0, 40, 0.75, 0.5, 1); lineLight.position.set(106, 9, 8); lineLight.target.position.set(106, 0, -2); scene.add(lineLight, lineLight.target);

  /* ground with a hole over the two basements (cutaway) */
  const HX0 = -14, HX1 = 8.6, HZ0 = 9, HZ1 = 26;
  const asphalt = std(C.asphalt, { roughness: 0.92 }), walkM = std(C.walk, { roughness: 0.9 });
  const ground = (x0: number, x1: number, z0: number, z1: number, m: THREE.Material, y = 0) => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m);
    g.rotation.x = -Math.PI / 2; g.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); scene.add(g); return g;
  };
  ground(-80, 80, -6, 6, asphalt);
  ground(-80, 80, -10, -6, walkM, 0.12);
  ground(-80, 80, 6, HZ0, walkM, 0.12);
  ground(-80, 80, -60, -10, std(0x10140f, { roughness: 1 }), 0.05);
  ground(-80, HX0, HZ0, 60, std(C.concrete2), 0.02);
  ground(HX1, 80, HZ0, 60, std(C.concrete2), 0.02);
  ground(HX0, HX1, HZ1, 60, std(C.concrete2), 0.02);
  const capM = std(C.concrete2, { transparent: true });
  const cap = ground(HX0, HX1, HZ0, HZ1, capM, 0.02);
  box(160, 0.14, 0.2, std(C.curb), 0, 0.07, 6); box(160, 0.14, 0.2, std(C.curb), 0, 0.07, -6);
  // lane dashes
  const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.4, 0.16), std(C.line, { roughness: 0.6, emissive: 0x302c22 }), 34);
  for (let i = 0; i < 34; i++) { const M = new THREE.Matrix4().makeRotationX(-Math.PI / 2).setPosition(-80 + i * 4.8, 0.01, 0); dash.setMatrixAt(i, M); }
  scene.add(dash);
  // crosswalk in front of the bank and the gate
  for (let i = 0; i < 7; i++) box(0.6, 0.02, 9.4, std(C.line, { roughness: 0.7 }), -1 + i * 1.1, 0.01, 0);

  /* street lamps */
  const poleM = std(0x2a2c30, { metalness: 0.5, roughness: 0.5 }), headM = new THREE.MeshBasicMaterial({ color: 0xffd08a });
  [[-22, 7], [-2, 7], [18, 7], [-12, -7.5], [8, -7.5], [28, -7.5], [-32, -7.5]].forEach(([x, z]) => {
    box(0.16, 7.4, 0.16, poleM, x, 3.7, z);
    box(0.16, 0.12, 1.5, poleM, x, 7.4, z + (z > 0 ? -0.7 : 0.7));
    box(0.5, 0.12, 0.3, headM, x, 7.3, z + (z > 0 ? -1.35 : 1.35));
  });

  /* buildings on the south side */
  const solids: THREE.Object3D[] = [];
  const winM = new THREE.MeshBasicMaterial({ color: 0xffc77a }), winOff = std(0x0c1119, { roughness: 0.25, metalness: 0.4 });
  const building = (x0: number, x1: number, h: number, mat: THREE.Material, seed: number, depth = 16) => {
    const g = new THREE.Group();
    box(x1 - x0, h, depth, mat, (x0 + x1) / 2, h / 2, HZ0 + depth / 2, g);
    const cols = Math.floor((x1 - x0 - 1) / 2.2), floors = Math.floor((h - 4) / 3.2);
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const lit = hash(seed * 31 + f * 7 + c) > 0.72;
      box(1.2, 1.5, 0.08, lit ? winM : winOff, x0 + 1.4 + c * ((x1 - x0 - 2) / Math.max(1, cols - 1 || 1)), 5 + f * 3.2, HZ0 - 0.02, g);
    }
    scene.add(g); return g;
  };
  [[-60, -44, 22], [-44, -30, 15], [-30, -14, 24], [8.6, 22, 17], [22, 36, 26], [36, 56, 13]].forEach(([a, b, h], i) => {
    solids.push(building(a, b, h, std(i % 2 ? C.concrete : C.concrete2), i + 3));
  });
  // the building next door (the way in) and the bank: both fade for the cutaway
  const ghostA = std(0x3b3f47, { transparent: true }), ghostB = std(C.bankFace, { transparent: true });
  const nextDoor = new THREE.Group();
  box(10, 18, 17, ghostA, -9, 9, HZ0 + 8.5, nextDoor);
  const doorGlow = new THREE.MeshBasicMaterial({ color: 0x3a2a18 });
  box(1.6, 2.6, 0.1, doorGlow, -9, 1.3, HZ0 - 0.05, nextDoor);
  const facadeBits = new THREE.Group(); scene.add(facadeBits);
  for (let f = 0; f < 5; f++) for (let c = 0; c < 4; c++) box(1.2, 1.5, 0.08, hash(f * 5 + c + 90) > 0.8 ? winM : winOff, -12.6 + c * 2.4, 5 + f * 3.2, HZ0 - 0.06, facadeBits);
  scene.add(nextDoor);
  const bank = new THREE.Group();
  box(12.6, 13, 17, ghostB, 2.3, 6.5, HZ0 + 8.5, bank);
  const glassM = std(C.glassDark, { roughness: 0.15, metalness: 0.6, emissive: 0x0a1a2c, transparent: true });
  box(11, 3.2, 0.1, glassM, 2.3, 1.8, HZ0 - 0.06, bank);
  const signM = new THREE.MeshBasicMaterial({ color: C.bankBlue, transparent: true });
  box(10, 1.1, 0.25, signM, 2.3, 4.1, HZ0 - 0.15, bank);
  const signLine = new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true });
  box(10, 0.08, 0.27, signLine, 2.3, 3.6, HZ0 - 0.16, bank);
  for (let f = 0; f < 3; f++) for (let c = 0; c < 5; c++) box(1.4, 1.6, 0.08, f === 0 && c === 2 ? winM : winOff, -2.3 + c * 2.3, 6.2 + f * 2.6, HZ0 - 0.06, facadeBits);
  scene.add(bank);
  // cutaway edge lines (the "map" look)
  const edgeM = new THREE.LineBasicMaterial({ color: 0xff6a55, transparent: true, opacity: 0 });
  const edges = new THREE.Group();
  [[-9, 9, HZ0 + 8.5, 10, 18, 17], [2.3, 6.5, HZ0 + 8.5, 12.6, 13, 17]].forEach(([x, y, z, w, h, d]) => {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeM); e.position.set(x, y, z); edges.add(e);
  });
  scene.add(edges);
  const parked: THREE.Group[] = [];
  [[-26, 4.6, 0x6b1f1f], [12, 4.6, 0x8a8f96], [26, -4.6, 0x23324a]].forEach(([x, z, col]) => {
    const g = new THREE.Group(), m = std(col, { metalness: 0.5, roughness: 0.35 });
    box(4.2, 0.8, 1.8, m, 0, 0.6, 0, g); box(2.3, 0.65, 1.6, m, -0.2, 1.3, 0, g);
    box(2.2, 0.5, 1.62, std(0x0b0f15, { roughness: 0.1, metalness: 0.8 }), -0.2, 1.32, 0, g);
    g.position.set(x, 0, z); scene.add(g); parked.push(g);
  });

  /* north side: University of Tehran — fence, trees and the gate */
  const fence = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 2.2, 0.06), std(0x1d2024, { metalness: 0.6, roughness: 0.4 }), 260);
  for (let i = 0; i < 260; i++) fence.setMatrixAt(i, new THREE.Matrix4().setPosition(-80 + i * 0.62, 1.1, -10.2));
  scene.add(fence); box(160, 0.5, 0.5, std(0x5d6067), 0, 0.25, -10.2); box(160, 0.08, 0.08, std(0x1d2024), 0, 2.15, -10.2);
  const trunk = std(0x1e1813), leaf = std(0x15261a, { roughness: 1 });
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 1), leaf, 26);
  for (let i = 0; i < 26; i++) {
    const x = -78 + i * 6.2 + hash(i) * 2, z = -15 - hash(i + 9) * 6;
    if (Math.abs(x - 2) < 7) { crowns.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0)); continue; }
    box(0.35, 4, 0.35, trunk, x, 2, z);
    crowns.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, 5.6 + hash(i + 4), z), new THREE.Quaternion(), new THREE.Vector3(1, 1.25, 1).multiplyScalar(0.85 + hash(i + 2) * 0.4)));
  }
  scene.add(crowns);
  // the gate: two tall concrete fins that curve over at the top
  const gateM = std(0xd9d4c8, { roughness: 0.85, emissive: 0x15130f });
  const fin = new THREE.Shape();
  fin.moveTo(0, 0); fin.lineTo(1.1, 0); fin.lineTo(1.1, 9.4);
  fin.quadraticCurveTo(1.1, 13.6, -2.6, 13.2); fin.lineTo(-2.6, 12.4); fin.quadraticCurveTo(0, 12.6, 0, 9.2); fin.lineTo(0, 0);
  const finG = new THREE.ExtrudeGeometry(fin, { depth: 0.6, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2 });
  const gate = new THREE.Group();
  [-1, 1].forEach((s) => { const f = new THREE.Mesh(finG, gateM); f.scale.x = s; f.position.set(2 + s * 2.6, 0, -10.6); gate.add(f); });
  box(2.4, 0.4, 0.9, gateM, 2, 0.2, -10.15, gate);
  scene.add(gate);
  const gateLight = new THREE.PointLight(0xfff1d6, 30, 18, 1.5); gateLight.position.set(2, 3, -6); scene.add(gateLight);

  /* basement (under y = 0) */
  const under = new THREE.Group(); scene.add(under);
  const bFloor = std(0x2a2724, { roughness: 0.95 }), bWall = std(0x4d4a46, { roughness: 0.9 }), bWall2 = std(0x5a5650, { roughness: 0.9 });
  const Y0 = -3.5, WH = 3.0, WY = Y0 + WH / 2;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(HX1 - HX0, HZ1 - HZ0), bFloor); fl.rotation.x = -Math.PI / 2; fl.position.set((HX0 + HX1) / 2, Y0, (HZ0 + HZ1) / 2); under.add(fl);
  const wall = (x0: number, z0: number, x1: number, z1: number, m = bWall, h = WH, y = WY) =>
    box(Math.max(0.25, Math.abs(x1 - x0)), h, Math.max(0.25, Math.abs(z1 - z0)), m, (x0 + x1) / 2, y, (z0 + z1) / 2, under);
  // outer walls
  wall(HX0, HZ0 + 0.2, HX1, HZ0 + 0.2); wall(HX0, HZ1, HX1, HZ1); wall(HX0, HZ0, HX0, HZ1); wall(HX1, HZ0, HX1, HZ1);
  // shared wall at x = -4.1 with a crawl hole (z 14.6..16.0, up to y = -2.3)
  wall(-4.1, HZ0, -4.1, 14.6, bWall2); wall(-4.1, 16.0, -4.1, HZ1, bWall2);
  box(0.3, Y0 + WH - -2.3, 1.4, bWall2, -4.1, (-2.3 + Y0 + WH) / 2, 15.3, under);
  const breachM = new THREE.MeshBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0 });
  const breachRing = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.78, 28), breachM); breachRing.rotation.y = Math.PI / 2; breachRing.position.set(-3.93, -2.9, 15.3); under.add(breachRing);
  const rubble = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.12, 0), bWall2, 24);
  for (let i = 0; i < 24; i++) rubble.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(-3.4 - hash(i) * 1.4, Y0 + 0.08, 14.5 + hash(i + 3) * 1.8), new THREE.Quaternion().setFromEuler(new THREE.Euler(hash(i) * 3, hash(i + 1) * 3, 0)), new THREE.Vector3(1, 1, 1).multiplyScalar(0.6 + hash(i + 5))));
  under.add(rubble);
  // stairs from the street door down into the next-door basement
  for (let i = 0; i < 10; i++) box(1.6, 0.35, 0.5, bWall2, -9, -0.18 - i * 0.33, HZ0 + 0.9 + i * 0.5, under);
  // corridor in the bank: z 14.3..16.3, x -4..3, four steel doors
  wall(-3.9, 14.2, 3.0, 14.2); wall(-3.9, 16.4, 3.0, 16.4);
  const doorM = std(C.steel, { metalness: 0.85, roughness: 0.35 }), doorX = [-2.6, -1.1, 0.4, 1.9];
  const doors = doorX.map((x) => {
    const hinge = new THREE.Group(); hinge.position.set(x, Y0, 14.35); under.add(hinge);
    box(0.16, 2.5, 1.9, doorM, 0, 1.25, 0.95, hinge);
    box(0.2, 0.3, 0.3, std(C.steelDark, { metalness: 0.9, roughness: 0.3 }), 0.1, 1.3, 1.5, hinge);
    return hinge;
  });
  // vault x 3..8.6, z 11..22.5
  wall(3.0, 11.0, 3.0, 14.2); wall(3.0, 16.4, 3.0, 22.6); wall(3.0, 11.0, 8.6, 11.0); wall(3.0, 22.6, 8.6, 22.6);
  const vaultFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 11.6), std(0x3c3a38, { roughness: 0.5, metalness: 0.2 }));
  vaultFloor.rotation.x = -Math.PI / 2; vaultFloor.position.set(5.8, Y0 + 0.01, 16.8); under.add(vaultFloor);
  const ceilM = std(0x55524d, { side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 12), ceilM); ceiling.rotation.x = Math.PI / 2; ceiling.position.set(5.8, Y0 + WH + 0.02, 16.8); under.add(ceiling);
  const strip = new THREE.MeshBasicMaterial({ color: 0xfff0d0 });
  const strips = [box(0.1, 0.03, 2.4, strip, 5.8, Y0 + WH - 0.02, 14, under), box(0.1, 0.03, 2.4, strip, 5.8, Y0 + WH - 0.02, 19.5, under)];
  // the 168 boxes: 12 × 7 on the back wall (z = 22.4, facing −z) and 12 × 7 on the side wall (x = 8.4, facing −x)
  const BW = 0.4, BH = 0.34, cols = 12, rows = 7;
  const frameM = std(C.steelDark, { metalness: 0.8, roughness: 0.4 });
  box(cols * BW + 0.2, rows * BH + 0.2, 0.3, frameM, 5.8, Y0 + 0.5 + (rows * BH) / 2, 22.35, under);
  box(0.3, rows * BH + 0.2, cols * BW + 0.2, frameM, 8.35, Y0 + 0.5 + (rows * BH) / 2, 17.6, under);
  const doorG = new THREE.BoxGeometry(BW - 0.04, BH - 0.04, 0.03); doorG.translate((BW - 0.04) / 2, 0, 0); // hinge on the left edge
  const boxDoors = new THREE.InstancedMesh(doorG, std(0xaab1b9, { metalness: 0.7, roughness: 0.32 }), BOXES);
  const glowG = new THREE.PlaneGeometry(BW - 0.06, BH - 0.06);
  const glows = new THREE.InstancedMesh(glowG, new THREE.MeshBasicMaterial({ color: 0xd08a3c }), BOXES);
  const slots: { hinge: THREE.Vector3; rotY: number; center: THREE.Vector3 }[] = [];
  for (let i = 0; i < BOXES; i++) {
    const wallI = i < 84 ? 0 : 1, k = i % 84, c = k % cols, r = Math.floor(k / cols);
    const y = Y0 + 0.5 + BH / 2 + r * BH;
    if (wallI === 0) {
      const x = 5.8 + (cols / 2) * BW - (c + 1) * BW + 0.02; // left edge seen from inside (facing +z)
      slots.push({ hinge: new THREE.Vector3(x + BW - 0.04, y, 22.18), rotY: Math.PI, center: new THREE.Vector3(x + BW / 2 - 0.02, y, 22.19) });
    } else {
      const z = 17.6 - (cols / 2) * BW + c * BW + 0.02;
      slots.push({ hinge: new THREE.Vector3(8.18, y, z), rotY: -Math.PI / 2, center: new THREE.Vector3(8.19, y, z + BW / 2 - 0.02) });
    }
  }
  // the order boxes are broken open in: scattered, not row by row
  const order = Array.from({ length: BOXES }, (_, i) => i).sort((a, b) => hash(a * 3.1) - hash(b * 3.1));
  const rank = new Array(BOXES); order.forEach((b, i) => (rank[b] = i));
  under.add(boxDoors, glows);
  // bags, a drill and a work lamp on the vault floor
  const bagM = std(0x15161a, { roughness: 0.6 });
  [[4.6, 20.4], [6.9, 20.8], [7.4, 15.8], [3.8, 21.0]].map(([x, z], i) => {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.6, 4, 10), bagM); b.rotation.z = Math.PI / 2; b.rotation.y = i; b.position.set(x, Y0 + 0.2, z); under.add(b); return b;
  });
  const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
  lampHead.position.set(6.8, Y0 + 1.6, 13.4); under.add(lampHead);
  box(0.05, 1.6, 0.05, poleM, 6.8, Y0 + 0.8, 13.4, under);
  // the red route (dashes revealed along a polyline)
  const route = [
    new THREE.Vector3(-20, 0.2, 7.6), new THREE.Vector3(-9, 0.2, 7.6), new THREE.Vector3(-9, 0.2, HZ0 + 0.6), new THREE.Vector3(-9, Y0 + 0.08, HZ0 + 5.4),
    new THREE.Vector3(-9, Y0 + 0.08, 15.3), new THREE.Vector3(-4.1, Y0 + 0.08, 15.3), new THREE.Vector3(3.0, Y0 + 0.08, 15.3), new THREE.Vector3(5.6, Y0 + 0.08, 18.6),
  ];
  const curve = new THREE.CurvePath<THREE.Vector3>(); for (let i = 1; i < route.length; i++) curve.add(new THREE.LineCurve3(route[i - 1], route[i]));
  const ND = 120;
  const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.05, 0.12), new THREE.MeshBasicMaterial({ color: C.red }), ND);
  const dashAt = Array.from({ length: ND }, (_, i) => {
    const u = (i + 0.5) / ND, p = curve.getPointAt(u), tg = curve.getTangentAt(u);
    return new THREE.Matrix4().compose(p, new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tg.normalize()), new THREE.Vector3(1, 1, 1));
  });
  scene.add(dashes);
  // sparks at the breach
  const NS = 140, sparkPos = new Float32Array(NS * 3);
  const sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffb060, size: 0.07, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  under.add(sparks);

  /* lineup room (far away at x ≈ 106) */
  const lineup = new THREE.Group(); scene.add(lineup);
  box(30, 8, 0.3, std(0x2f3237, { roughness: 0.9 }), 106, 4, -2.4, lineup);
  const ruleM = new THREE.MeshBasicMaterial({ color: 0x8b9099 });
  for (let i = 1; i <= 10; i++) box(30, i % 5 === 0 ? 0.035 : 0.018, 0.02, ruleM, 106, i * 0.22 + 0.2, -2.24, lineup);
  const lf = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), std(0x1d1f23, { roughness: 0.8 })); lf.rotation.x = -Math.PI / 2; lf.position.set(106, 0.01, 4); lineup.add(lf);

  /* mannequins: 5 thieves + 13 lineup suspects */
  const dummyM = std(C.dummy, { roughness: 0.55 }), suspectM = std(0xb8b2a7, { roughness: 0.6 });
  const thieves = Array.from({ length: 5 }, () => { const d = makeDummy(dummyM, true); scene.add(d.root); return d; });
  const suspects = Array.from({ length: 13 }, (_, i) => {
    const d = makeDummy(suspectM, false); d.root.position.set(100 + i * 1.0 - 0, 0, -1.6); d.root.scale.setScalar(0.94 + hash(i + 40) * 0.12); lineup.add(d.root); return d;
  });

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V1 = new THREE.Vector3(1, 1, 1), ZERO = new THREE.Vector3(0, 0, 0), Yax = new THREE.Vector3(0, 1, 0);
  const update = (s: State, camera: THREE.PerspectiveCamera) => {
    const t = s.t;
    camera.position.set(...s.cam.pos); camera.fov = s.cam.fov; camera.up.set(Math.sin(s.cam.roll ?? 0), Math.cos(s.cam.roll ?? 0), 0);
    camera.lookAt(...s.cam.look); camera.updateProjectionMatrix();
    // cutaway
    const k = s.cut;
    capM.opacity = 1 - k; cap.visible = k < 0.999;
    ghostA.opacity = 1 - 0.95 * k; ghostB.opacity = 1 - 0.95 * k; facadeBits.visible = k < 0.25 && !s.ceiling; doorGlow.visible = k < 0.5;
    baseLights.forEach((L) => (L.intensity = 26 * smooth(k * 2))); ghostA.depthWrite = k < 0.5; ghostB.depthWrite = k < 0.5;
    glassM.opacity = 1 - k; signM.opacity = Math.max(0, 1 - 1.6 * k); signLine.opacity = signM.opacity; glassM.visible = k < 0.95; signM.visible = signLine.visible = k < 0.6;
    edgeM.opacity = 0.9 * smooth(k * 1.5);
    nextDoor.visible = bank.visible = s.ceiling ? false : true;
    under.visible = k > 0.001 || s.ceiling;
    ceiling.visible = s.ceiling; strips.forEach((x) => (x.visible = s.ceiling));
    // route
    const shown = Math.floor(s.path * ND);
    for (let i = 0; i < ND; i++) dashes.setMatrixAt(i, i < shown ? dashAt[i] : M.makeScale(0, 0, 0));
    dashes.instanceMatrix.needsUpdate = true; dashes.visible = s.path > 0;
    // doors
    doors.forEach((d, i) => { d.rotation.y = -1.45 * smooth(s.doors - i); });
    // breach
    breachM.opacity = 0.9 * Math.min(1, s.breach * 3) * (0.75 + 0.25 * Math.sin(t * 40));
    sparks.visible = s.breach > 0 && s.breach < 1;
    if (sparks.visible) {
      for (let i = 0; i < NS; i++) {
        const life = (t * 1.6 + hash(i)) % 1, a = hash(i + 7) * Math.PI * 2, sp = 1.5 + hash(i + 3) * 2.5;
        sparkPos[i * 3] = -3.85 + life * sp * 0.9;
        sparkPos[i * 3 + 1] = -2.9 + Math.sin(a) * 0.65 + life * 1.2 - life * life * 3.2;
        sparkPos[i * 3 + 2] = 15.3 + Math.cos(a) * 0.65 + (hash(i + 11) - 0.5) * life * 2;
      }
      sparkGeo.attributes.position.needsUpdate = true;
    }
    // boxes
    for (let i = 0; i < BOXES; i++) {
      const sl = slots[i], o = smooth((s.open - rank[i]) / 1.0);
      Q.setFromAxisAngle(Yax, sl.rotY - 1.9 * o * (1 + 0.08 * Math.sin(i)));
      M.compose(sl.hinge, Q, V1); boxDoors.setMatrixAt(i, M);
      Q.setFromAxisAngle(Yax, sl.rotY); M.compose(sl.center, Q, o > 0.02 ? V1 : ZERO); glows.setMatrixAt(i, M);
    }
    boxDoors.instanceMatrix.needsUpdate = true; glows.instanceMatrix.needsUpdate = true;
    // vault light
    vaultRed.intensity = 40 * s.alarm * (0.6 + 0.4 * Math.sin(t * 7));
    vaultWarm.intensity = s.ceiling || k > 0.3 ? 22 : 0;
    // mannequins
    thieves.forEach((d, i) => {
      const th = s.thieves[i];
      d.root.visible = !!th?.show;
      if (!th?.show) return;
      d.root.position.set(th.x, th.y, th.z); d.root.rotation.y = th.ry; pose(d, th.pose);
    });
    suspects.forEach((d, i) => {
      d.root.visible = i < Math.ceil(s.lineup);
      pose(d, { cuffs: 1, look: 0.05 * Math.sin(t + i), turn: 0.04 * Math.sin(t * 0.7 + i * 2) });
    });
    lineLight.intensity = s.lineup > 0 ? 260 : 0;
    lamps.forEach((L) => (L.intensity = s.ceiling ? 0 : 60));
    gateLight.intensity = s.ceiling ? 0 : 30;
  };
  // world points the 2D labels pin to
  const anchors = {
    bank: new THREE.Vector3(2.3, 13.6, HZ0 + 1), sign: new THREE.Vector3(2.3, 4.1, HZ0 - 0.3), gate: new THREE.Vector3(2, 13.8, -10.2),
    street: new THREE.Vector3(-18, 0.3, 0), next: new THREE.Vector3(-9, 18.5, HZ0 + 1), breach: new THREE.Vector3(-4.1, -2.9, 15.3),
    door: (i: number) => new THREE.Vector3(doorX[i], Y0 + 2.8, 15.3), vault: new THREE.Vector3(5.8, -0.3, 18.5), cam: new THREE.Vector3(3.4, -0.7, 11.4),
    suspect: (i: number) => new THREE.Vector3(100 + i, 2.15, -1.6),
  };
  const routeAt = (u: number) => ({ p: curve.getPointAt(Math.min(1, Math.max(0, u))), d: curve.getTangentAt(Math.min(1, Math.max(0, u))) });
  return { scene, update, anchors, slots, routeAt };
};
export type World = ReturnType<typeof buildWorld>;
