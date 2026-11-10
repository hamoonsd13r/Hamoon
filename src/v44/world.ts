// V44 · «پرینتر خراب» — the Bangladesh Bank cyber-heist as a 3D world. Seven sets far apart in one scene; the
// camera jumps between them per shot. Built once with plain three.js; `update(state)` poses everything per frame.
//   office  (x ≈ 0)    desks, the hero printer (LEDs, screen, pages), windows with real Dhaka photos, employees
//   tower   (x ≈ 300)  the bank tower at night, floors going dark, people leaving across the plaza
//   hackers (x ≈ 600)  dark room, hooded mannequins, three monitors with live scrolling code
//   servers (x ≈ 900)  rack corridor, an intrusion light, fake transfer orders flying out, the log wall being wiped
//   globe   (x ≈ 1200) night Earth (NASA Black Marble), arcs Dhaka → New York → Manila / Colombo, money particles
//   cash    (x ≈ 1500) a pallet of $100 bricks that lifts off and streams away
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { makeDummy, pose, type Dummy, type Pose } from "../v43/world";

export const SET = { office: 0, tower: 300, hackers: 600, servers: 900, globe: 1200, cash: 1500 } as const;
export type SetName = keyof typeof SET;
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o });
const basic = (color: number, o: Partial<THREE.MeshBasicMaterialParameters> = {}) => new THREE.MeshBasicMaterial({ color, ...o });
const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) => {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); parent.add(me); return me;
};
const CYAN = 0x38e1ff, RED = 0xff3b30, AMBER = 0xffb547;

export type Person = { x: number; z: number; ry: number; pose: Pose; show: boolean; arm?: number };
export type State = {
  t: number;
  set: SetName;
  cam: { pos: [number, number, number]; look: [number, number, number]; fov: number };
  day: number; // office: 0 night, 1 Friday morning
  lights: number; // office ceiling lights 0..1
  printer: { led: "green" | "red" | "off" | "amber"; screen: string; pages: number; burst: number; dead: number };
  staff: Person[]; // office employees (up to 3)
  towerOff: number; // 0..1 share of tower windows switched off
  walkers: number; // tower: people leaving 0..1
  hack: number; // hacker room: monitor glow 0..1 (and the hoods turning)
  turn: number; // hackers turn to the camera 0..1
  intrude: number; // servers: red intrusion travel 0..1
  orders: number; // servers: fake orders flying 0..1
  wipe: number; // servers: log wall wiped 0..1
  arcs: [number, number, number, number]; // globe: Dhaka→NY, NY→Manila, NY→Colombo, money to Manila
  cash: number; // cash pallet: 0 whole, 1 all gone
  glitch: number;
};

/** lat/lon → point on a sphere of radius r (matches three's SphereGeometry UVs) */
export const ll = (lat: number, lon: number, r: number) => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};
export const CITY = { dhaka: [23.81, 90.41], ny: [40.71, -74.01], manila: [14.55, 121.02], colombo: [6.93, 79.86] } as const;
export const GLOBE_R = 10;

export const buildWorld = (scene: THREE.Scene, gl: THREE.WebGLRenderer, tex: (url: string) => THREE.Texture) => {
  scene.background = new THREE.Color(0x04060a);
  const pm = new THREE.PMREMGenerator(gl);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.25;
  const hemi = new THREE.HemisphereLight(0x6f8fbf, 0x0b0c10, 0.5); scene.add(hemi);
  const groups: Record<SetName, THREE.Group> = { office: new THREE.Group(), tower: new THREE.Group(), hackers: new THREE.Group(), servers: new THREE.Group(), globe: new THREE.Group(), cash: new THREE.Group() };
  (Object.keys(groups) as SetName[]).forEach((k) => { groups[k].position.x = SET[k]; scene.add(groups[k]); });

  /* ═════════ OFFICE ═════════ */
  const O = groups.office;
  const floorM = std(0x2a3038, { roughness: 0.9 }), wallM = std(0x3a4049, { roughness: 0.95 }), deskM = std(0xb9b3a8, { roughness: 0.6 }), darkM = std(0x15181d, { roughness: 0.5 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), floorM); fl.rotation.x = -Math.PI / 2; O.add(fl);
  // carpet tiles
  const tiles = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.96, 1.96), std(0x262b33, { roughness: 1 }), 88);
  for (let i = 0; i < 88; i++) tiles.setMatrixAt(i, new THREE.Matrix4().makeRotationX(-Math.PI / 2).setPosition(-10 + (i % 11) * 2 + 1, 0.005, -7 + Math.floor(i / 11) * 2 + 1));
  for (let i = 0; i < 88; i++) tiles.setColorAt(i, new THREE.Color().setHSL(0.6, 0.08, 0.15 + hash(i) * 0.04));
  O.add(tiles);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), std(0x2b2f35, { side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 3.4; O.add(ceil);
  box(22, 3.4, 0.2, wallM, 0, 1.7, 8, O); box(0.2, 3.4, 16, wallM, -11, 1.7, 0, O); box(0.2, 3.4, 16, wallM, 11, 1.7, 0, O);
  // back wall = windows with a real Dhaka photo outside
  const night = tex("v44/photos/bbnight.jpg"), dayT = tex("v44/photos/bb3.jpg");
  [night, dayT].forEach((x) => { x.colorSpace = THREE.SRGBColorSpace; });
  const outsideN = new THREE.Mesh(new THREE.PlaneGeometry(30, 17), basic(0xffffff, { map: night }));
  outsideN.position.set(0, 3.2, -14); O.add(outsideN);
  const outsideD = new THREE.Mesh(new THREE.PlaneGeometry(30, 17), basic(0xffffff, { map: dayT, transparent: true, opacity: 0 }));
  outsideD.position.set(0, 3.2, -13.9); O.add(outsideD);
  const mullM = std(0x1a1d22, { metalness: 0.6, roughness: 0.4 });
  for (let i = 0; i <= 10; i++) box(0.12, 3.4, 0.14, mullM, -11 + i * 2.2, 1.7, -8, O);
  box(22, 0.14, 0.16, mullM, 0, 3.33, -8, O); box(22, 0.6, 0.2, wallM, 0, 0.3, -8, O);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(22, 2.8), std(0x0a1018, { transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.9 })); glass.position.set(0, 1.9, -8); O.add(glass);
  // ceiling light panels
  const panelM = basic(0xf3f6ff);
  const panels: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), panelM); p.rotation.x = Math.PI / 2; p.position.set(-6 + (i % 3) * 6, 3.38, -3 + Math.floor(i / 3) * 6); O.add(p); panels.push(p); }
  const ceilLights = [[-4, -2], [4, -2], [0, 4]].map(([x, z]) => { const L = new THREE.PointLight(0xeaf0ff, 0, 16, 1.2); L.position.set(x, 3.0, z); O.add(L); return L; });
  const sun = new THREE.DirectionalLight(0xfff2dd, 0); sun.position.set(-6, 9, -16); sun.target.position.set(2, 0, 2); O.add(sun, sun.target);
  const moonO = new THREE.PointLight(0x7f9fd6, 18, 18, 1.4); moonO.position.set(0, 2.6, -7); O.add(moonO);
  // desks with monitors and chairs
  const monScreen = std(0x0b0f16, { roughness: 0.2, metalness: 0.3, emissive: 0x07131f });
  [[-6.5, -3.5], [-6.5, 1.5], [-1.5, -3.5], [-1.5, 1.5], [5.5, 3.5]].forEach(([x, z], i) => {
    box(2.4, 0.06, 1.1, deskM, x, 0.74, z, O);
    [-1.1, 1.1].forEach((dx) => box(0.06, 0.74, 1.0, darkM, x + dx, 0.37, z, O));
    box(0.9, 0.55, 0.05, darkM, x, 1.12, z - 0.35, O);
    box(0.84, 0.48, 0.02, monScreen, x, 1.12, z - 0.32, O);
    box(0.08, 0.3, 0.08, darkM, x, 0.9, z - 0.38, O);
    box(0.5, 0.03, 0.18, darkM, x, 0.78, z + 0.05, O);
    // chair
    const c = new THREE.Group(); c.position.set(x + (hash(i) - 0.5) * 0.4, 0, z + 0.85); c.rotation.y = (hash(i + 3) - 0.5) * 0.8; O.add(c);
    box(0.55, 0.08, 0.55, std(0x20242b), 0, 0.48, 0, c); box(0.55, 0.6, 0.07, std(0x20242b), 0, 0.82, 0.26, c); box(0.06, 0.44, 0.06, darkM, 0, 0.24, 0, c);
  });
  // plants and a door
  [[-10.2, 7.2], [10.2, -7.2]].forEach(([x, z]) => { box(0.5, 0.5, 0.5, std(0x5a5148), x, 0.25, z, O); const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), std(0x2c4a30, { roughness: 1 })); s.position.set(x, 1.0, z); s.scale.y = 1.3; O.add(s); });
  box(1.2, 2.3, 0.08, std(0x6b5a48, { roughness: 0.6 }), 8.5, 1.15, 7.9, O);
  const exitSign = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), basic(0x22dd66)); exitSign.position.set(8.5, 2.6, 7.88); exitSign.rotation.y = Math.PI; O.add(exitSign);
  // ── the printer (hero) at (4, 0, -3.5) ──
  const P = new THREE.Group(); P.position.set(4, 0, -3.6); O.add(P);
  const pBody = std(0xd9dbe0, { roughness: 0.45 }), pDark = std(0x2a2d33, { roughness: 0.4 }), pMid = std(0xa7abb3, { roughness: 0.5 });
  box(1.15, 0.72, 0.85, pMid, 0, 0.36, 0, P); // stand / drawers
  for (let i = 0; i < 3; i++) box(1.1, 0.02, 0.01, pDark, 0, 0.18 + i * 0.22, 0.428, P);
  box(1.1, 0.62, 0.82, pBody, 0, 1.03, 0, P); // engine
  box(0.9, 0.04, 0.6, pDark, 0, 1.16, 0.31, P); // output slot shadow
  box(0.98, 0.1, 0.78, pBody, 0, 1.39, -0.02, P); // scanner
  const lid = box(1.0, 0.05, 0.8, std(0xc2c5cb, { roughness: 0.35 }), 0, 1.47, -0.02, P);
  void lid;
  const tray = box(0.7, 0.02, 0.42, pDark, 0, 1.12, 0.5, P); tray.rotation.x = -0.12;
  // control panel (tilted) with a small screen and an LED
  const panel = new THREE.Group(); panel.position.set(0.32, 1.42, 0.38); panel.rotation.x = -0.75; P.add(panel);
  box(0.36, 0.2, 0.03, pDark, 0, 0, 0, panel);
  const scrCanvas = typeof document !== "undefined" ? document.createElement("canvas") : (null as unknown as HTMLCanvasElement);
  scrCanvas.width = 256; scrCanvas.height = 128;
  const scrTex = new THREE.CanvasTexture(scrCanvas); scrTex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), basic(0xffffff, { map: scrTex })); scr.position.set(-0.03, 0, 0.017); panel.add(scr);
  const ledM = basic(0x22ff66);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), ledM); led.position.set(0.14, 0.05, 0.02); panel.add(led);
  const ledLight = new THREE.PointLight(0x22ff66, 0, 2.2, 2); ledLight.position.set(4.32, 1.5, -3.1); O.add(ledLight);
  let lastScreen = "";
  const drawScreen = (txt: string, col: string) => {
    if (txt + col === lastScreen) return; lastScreen = txt + col;
    const c = scrCanvas.getContext("2d")!; c.fillStyle = "#0b1410"; c.fillRect(0, 0, 256, 128);
    c.fillStyle = col; c.font = "bold 40px monospace"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, 128, 64);
    scrTex.needsUpdate = true;
  };
  // pages: 40 sheets
  const NP = 40;
  const pages = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.6), std(0xf6f4ee, { roughness: 0.8, side: THREE.DoubleSide }), NP);
  O.add(pages);
  // office people
  const staffM = std(0xc9c4ba, { roughness: 0.55 });
  const staff: Dummy[] = [0, 1, 2].map(() => { const d = makeDummy(staffM, false); O.add(d.root); return d; });

  /* ═════════ TOWER ═════════ */
  const T = groups.tower;
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), std(0x1a1d22, { roughness: 0.95 })); plaza.rotation.x = -Math.PI / 2; T.add(plaza);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(200, 14), std(0x101215, { roughness: 0.9 })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 30); T.add(road);
  const towerM = std(0xd8d5cc, { roughness: 0.8 });
  const TW = 16, TH = 92, TD = 16;
  box(TW, TH, TD, towerM, 0, TH / 2, 0, T);
  box(TW + 2, 1.2, TD + 2, std(0xbab6ad), 0, TH + 0.6, 0, T);
  box(TW + 8, 6, TD + 8, std(0xcfccc3), 0, 3, 0, T); // podium
  // vertical fins
  for (let i = 0; i <= 8; i++) { box(0.35, TH - 6, 0.6, std(0xe8e5dd), -TW / 2 + i * (TW / 8), 6 + (TH - 6) / 2, TD / 2 + 0.3, T); box(0.6, TH - 6, 0.35, std(0xe8e5dd), TW / 2 + 0.3, 6 + (TH - 6) / 2, -TD / 2 + i * (TD / 8), T); }
  const floors = 26, colsW = 8;
  const NW = floors * colsW * 2;
  const winGeo = new THREE.PlaneGeometry(1.6, 2.2);
  const towerWin = new THREE.InstancedMesh(winGeo, basic(0xffffff), NW);
  const winLit = new Float32Array(NW);
  for (let i = 0; i < NW; i++) {
    const face = i < NW / 2 ? 0 : 1, k = i % (NW / 2), f = Math.floor(k / colsW), c = k % colsW;
    const y = 8 + f * 3.2, M = new THREE.Matrix4();
    if (face === 0) M.makeTranslation(-TW / 2 + (c + 0.5) * (TW / colsW), y, TD / 2 + 0.02);
    else M.makeRotationY(Math.PI / 2).setPosition(TW / 2 + 0.02, y, -TD / 2 + (c + 0.5) * (TD / colsW));
    towerWin.setMatrixAt(i, M); winLit[i] = hash(i * 1.7);
  }
  T.add(towerWin);
  const warm = new THREE.Color(0xffd08a), dark = new THREE.Color(0x0e141c), cool = new THREE.Color(0xbfd8ff);
  // plaza lamps + the water-lily sculpture
  [[-26, 18], [26, 18], [-26, -18], [26, -18]].forEach(([x, z]) => { box(0.3, 8, 0.3, std(0x222428), x, 4, z, T); box(1, 0.3, 1, basic(0xffd59a), x, 8, z, T); });
  const lampsT = [[-20, 20], [20, 20]].map(([x, z]) => { const L = new THREE.PointLight(0xffc77a, 240, 60, 1.4); L.position.set(x, 9, z); T.add(L); return L; });
  void lampsT;
  const lily = new THREE.Group(); lily.position.set(0, 0, 40); T.add(lily);
  box(10, 0.6, 10, std(0x2c3138), 0, 0.3, 0, lily);
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0xe9e6df, { side: THREE.DoubleSide })); p.scale.set(0.9, 2.6, 0.35); p.position.set(Math.cos(i * 0.785) * 1.2, 1.2, Math.sin(i * 0.785) * 1.2); p.rotation.set(0.4 * Math.sin(i * 0.785), -i * 0.785, 0.4 * Math.cos(i * 0.785)); lily.add(p); }
  [[-10, 14], [10, 14]].forEach(([x, z]) => { const L = new THREE.SpotLight(0xffe2b8, 2600, 140, 0.32, 0.7, 1.3); L.position.set(x, 0.5, z); L.target.position.set(x * 0.3, 60, 0); T.add(L, L.target); });
  const towerMoon = new THREE.DirectionalLight(0x9db6e0, 0.9); towerMoon.position.set(-40, 80, 60); T.add(towerMoon); towerMoon.target.position.set(0, 30, 0); T.add(towerMoon.target);
  const walkM = std(0xc9c4ba, { roughness: 0.55 });
  const walkers: Dummy[] = [0, 1, 2, 3, 4].map(() => { const d = makeDummy(walkM, false); d.root.scale.setScalar(1.4); T.add(d.root); return d; });
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => { const a = hash(i) * Math.PI * 2, b = 0.15 + hash(i + 1) * 1.2, r = 380; return i % 3 === 0 ? Math.cos(a) * Math.cos(b) * r : i % 3 === 1 ? Math.sin(b) * r : Math.sin(a) * Math.cos(b) * r; }), 3)), new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.4, sizeAttenuation: false }));
  T.add(stars);

  /* ═════════ HACKERS ═════════ */
  const Hk = groups.hackers;
  const hFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), std(0x121418, { roughness: 0.6, metalness: 0.2 })); hFloor.rotation.x = -Math.PI / 2; Hk.add(hFloor);
  box(14, 4, 0.2, std(0x15181d), 0, 2, -4, Hk); box(0.2, 4, 14, std(0x15181d), -5, 2, 0, Hk);
  box(3.6, 0.06, 1.2, std(0x22252b), 0, 0.76, -2.6, Hk);
  [-1.3, 1.3].forEach((x) => box(0.06, 0.76, 1.1, std(0x0e1013), x, 0.38, -2.6, Hk));
  const codeCanvas = typeof document !== "undefined" ? document.createElement("canvas") : (null as unknown as HTMLCanvasElement);
  codeCanvas.width = 512; codeCanvas.height = 300;
  const codeTex = new THREE.CanvasTexture(codeCanvas); codeTex.colorSpace = THREE.SRGBColorSpace;
  const monitors = [-1.15, 0, 1.15].map((x, i) => {
    const g = new THREE.Group(); g.position.set(x, 1.3, -2.95); g.rotation.y = -x * 0.35; Hk.add(g);
    box(1.08, 0.66, 0.05, std(0x0b0c0e), 0, 0, 0, g);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.58), basic(0xffffff, { map: codeTex })); s.position.z = 0.03; g.add(s);
    box(0.08, 0.5, 0.08, std(0x0b0c0e), 0, -0.5, -0.02, g);
    if (i === 1) box(0.55, 0.03, 0.2, std(0x0b0c0e), 0, -0.5, 0.35, g);
    return s;
  });
  void monitors;
  const monLight = new THREE.PointLight(CYAN, 0, 9, 1.4); monLight.position.set(0, 1.4, -2.0); Hk.add(monLight);
  const rimH = new THREE.PointLight(0x7a8cff, 26, 10, 1.4); rimH.position.set(-1.5, 2.6, 1.2); Hk.add(rimH);
  const hoodM = std(0x3a3f48, { roughness: 0.7 });
  const hackers: Dummy[] = [-0.75, 0.85].map((x, i) => {
    const d = makeDummy(hoodM, true); d.root.position.set(x, 0, -1.75); d.root.rotation.y = Math.PI; Hk.add(d.root);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), std(0x101216, { roughness: 0.95, side: THREE.DoubleSide }));
    hood.position.set(0, 0.17, -0.015); hood.rotation.x = 0.35; d.neck.add(hood);
    void i; return d;
  });
  let codeLine = -1;
  const drawCode = (t: number, red: number) => {
    const line = Math.floor(t * 12); if (line === codeLine) return; codeLine = line;
    const c = codeCanvas.getContext("2d")!; c.fillStyle = red > 0.5 ? "#140405" : "#020a0e"; c.fillRect(0, 0, 512, 300);
    c.font = "15px monospace";
    for (let r = 0; r < 18; r++) {
      const n = line + r; let s = "";
      for (let k = 0; k < 7; k++) s += Math.floor(hash(n * 13 + k) * 0xffff).toString(16).padStart(4, "0") + " ";
      c.fillStyle = red > 0.5 ? (r % 5 === 0 ? "#ff6b5e" : "#a33") : r % 6 === 0 ? "#bff6ff" : "#2fc6e6";
      c.fillText((r % 4 === 0 ? "> MT103 " : "  ") + s, 10, 18 + r * 16);
    }
    codeTex.needsUpdate = true;
  };

  /* ═════════ SERVERS ═════════ */
  const Sv = groups.servers;
  const sFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), std(0x1c2026, { roughness: 0.35, metalness: 0.5 })); sFloor.rotation.x = -Math.PI / 2; sFloor.position.z = -20; Sv.add(sFloor);
  const grid = new THREE.GridHelper(60, 60, 0x2a3440, 0x1e252e); grid.position.set(0, 0.01, -20); (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.5; Sv.add(grid);
  const sCeil = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), std(0x0d0f12)); sCeil.rotation.x = Math.PI / 2; sCeil.position.set(0, 3.2, -20); Sv.add(sCeil);
  const NR = 30, rackM = std(0x14171c, { metalness: 0.6, roughness: 0.4 });
  const racks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 2.4, 1.0), rackM, NR);
  for (let i = 0; i < NR; i++) racks.setMatrixAt(i, new THREE.Matrix4().makeTranslation(i % 2 ? 1.9 : -1.9, 1.2, -2 - Math.floor(i / 2) * 1.05));
  Sv.add(racks);
  const NL = NR * 16;
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), basic(0xffffff), NL);
  const ledPos: THREE.Vector3[] = [];
  for (let i = 0; i < NL; i++) {
    const r = Math.floor(i / 16), k = i % 16, side = r % 2 ? 1.9 : -1.9;
    const p = new THREE.Vector3(side - Math.sign(side) * 0.51, 0.35 + (k % 8) * 0.25, -2 - Math.floor(r / 2) * 1.05 + (k < 8 ? -0.25 : 0.2));
    ledPos.push(p); leds.setMatrixAt(i, new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(p));
  }
  Sv.add(leds);
  const stripM = basic(CYAN, { transparent: true, opacity: 0.6 });
  [-1.2, 1.2].forEach((x) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 60), stripM); s.rotation.x = -Math.PI / 2; s.position.set(x, 0.02, -20); Sv.add(s); });
  const redRun = new THREE.PointLight(RED, 0, 9, 1.3); Sv.add(redRun);
  const coolS = new THREE.PointLight(0x7fd6ff, 14, 14, 1.4); coolS.position.set(0, 2.8, -4); Sv.add(coolS);
  const coolS2 = new THREE.PointLight(0x7fd6ff, 10, 14, 1.4); coolS2.position.set(0, 2.8, -14); Sv.add(coolS2);
  // fake orders (cards with a printed MT103 face)
  const cardCanvas = typeof document !== "undefined" ? document.createElement("canvas") : (null as unknown as HTMLCanvasElement);
  cardCanvas.width = 256; cardCanvas.height = 160;
  {
    const c = cardCanvas.getContext("2d")!;
    c.fillStyle = "#f4efe4"; c.fillRect(0, 0, 256, 160); c.fillStyle = "#c62a20"; c.fillRect(0, 0, 256, 30);
    c.fillStyle = "#fff"; c.font = "bold 20px monospace"; c.fillText("MT103  TRANSFER", 12, 22);
    c.fillStyle = "#222"; c.font = "15px monospace";
    ["FROM: BANGLADESH BANK", "VIA:  FED NEW YORK", "AMOUNT: USD ********", "STATUS: SENT"].forEach((s, i) => c.fillText(s, 12, 56 + i * 24));
    c.strokeStyle = "#c62a20"; c.lineWidth = 5; c.strokeRect(150, 104, 96, 44); c.fillStyle = "#c62a20"; c.font = "bold 22px monospace"; c.fillText("FAKE", 168, 134);
  }
  const cardTex = new THREE.CanvasTexture(cardCanvas); cardTex.colorSpace = THREE.SRGBColorSpace;
  const NC = 35;
  const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.64, 0.4), basic(0xffffff, { map: cardTex, side: THREE.DoubleSide }), NC);
  Sv.add(cards);
  // the log wall at the end of the corridor
  const LW = 14, LH = 18, NLog = LW * LH;
  const logs = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.26, 0.11), basic(0xffffff), NLog);
  const logAt: THREE.Vector3[] = [];
  for (let i = 0; i < NLog; i++) { const c = i % LW, r = Math.floor(i / LW); logAt.push(new THREE.Vector3(-1.35 + c * 0.21 + (r % 2) * 0.03, 0.4 + r * 0.14, -17.6)); }
  Sv.add(logs);
  box(3.4, 3.0, 0.1, std(0x07090c), 0, 1.5, -17.7, Sv);
  const NSp = 260, spPos = new Float32Array(NSp * 3);
  const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
  const dust = new THREE.Points(spGeo, new THREE.PointsMaterial({ color: 0xff5a4a, size: 0.035, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); Sv.add(dust);

  /* ═════════ GLOBE ═════════ */
  const G = groups.globe;
  const dayE = tex("styles/cosmic-web/earth_day.jpg"), nightE = tex("styles/cosmic-web/earth_night.jpg");
  dayE.colorSpace = THREE.SRGBColorSpace; nightE.colorSpace = THREE.SRGBColorSpace;
  const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 128, 96), new THREE.MeshStandardMaterial({ map: dayE, color: 0x7d8fb3, emissiveMap: nightE, emissive: 0xffc98a, emissiveIntensity: 1.25, roughness: 0.9 }));
  G.add(earth);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.035, 64, 48), new THREE.MeshBasicMaterial({ color: 0x3fb6ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending }));
  G.add(atm);
  const gridG = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_R * 1.004, 36, 18)), new THREE.LineBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0.1 }));
  G.add(gridG);
  const gStars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 2400 }, (_, i) => { const k = Math.floor(i / 3), a = hash(k) * Math.PI * 2, b = Math.acos(2 * hash(k + 0.5) - 1), r = 220; return i % 3 === 0 ? Math.sin(b) * Math.cos(a) * r : i % 3 === 1 ? Math.cos(b) * r : Math.sin(b) * Math.sin(a) * r; }), 3)), new THREE.PointsMaterial({ color: 0xbfcfff, size: 1.2, sizeAttenuation: false }));
  G.add(gStars);
  const gSun = new THREE.DirectionalLight(0xbcd2ff, 1.6); gSun.position.set(30, 20, 40); G.add(gSun);
  const arcPts = (a: readonly [number, number], b: readonly [number, number], lift: number) => {
    const A = ll(a[0], a[1], 1), B = ll(b[0], b[1], 1), pts: THREE.Vector3[] = [];
    const ang = A.angleTo(B);
    for (let i = 0; i <= 80; i++) {
      const u = i / 80, s = Math.sin(ang);
      const p = A.clone().multiplyScalar(Math.sin((1 - u) * ang) / s).add(B.clone().multiplyScalar(Math.sin(u * ang) / s));
      pts.push(p.multiplyScalar(GLOBE_R * (1.005 + lift * Math.sin(Math.PI * u))));
    }
    return new THREE.CatmullRomCurve3(pts);
  };
  const arcDefs = [[CITY.dhaka, CITY.ny, 0.32, RED], [CITY.ny, CITY.manila, 0.34, RED], [CITY.ny, CITY.colombo, 0.3, AMBER], [CITY.dhaka, CITY.manila, 0.16, 0x4cff8a]] as const;
  const arcs = arcDefs.map(([a, b, lift, col]) => {
    const curve = arcPts(a, b, lift), geo = new THREE.TubeGeometry(curve, 160, 0.045, 8, false);
    const m = new THREE.Mesh(geo, basic(col)); G.add(m);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), basic(0xffffff)); G.add(head);
    const total = geo.index!.count;
    return { m, geo, head, curve, total };
  });
  const pins = Object.values(CITY).map(([la, lo]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), basic(0xffffff));
    const pos = ll(la, lo, GLOBE_R + 0.3); p.position.copy(pos); p.lookAt(0, 0, 0); p.rotateX(Math.PI / 2); G.add(p);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 24), basic(0xffffff, { transparent: true, side: THREE.DoubleSide }));
    ring.position.copy(ll(la, lo, GLOBE_R + 0.02)); ring.lookAt(0, 0, 0); G.add(ring);
    return { p, ring };
  });
  const NM = 60;
  const money = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.03, 0.1), basic(0x6dff9e), NM); G.add(money);

  /* ═════════ CASH ═════════ */
  const Cs = groups.cash;
  const cFloor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), std(0x101216, { roughness: 0.4, metalness: 0.3 })); cFloor.rotation.x = -Math.PI / 2; Cs.add(cFloor);
  box(4.6, 0.25, 3.4, std(0x6d5235, { roughness: 0.9 }), 0, 0.125, 0, Cs);
  const billCanvas = typeof document !== "undefined" ? document.createElement("canvas") : (null as unknown as HTMLCanvasElement);
  billCanvas.width = 256; billCanvas.height = 110;
  {
    const c = billCanvas.getContext("2d")!;
    const g = c.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, "#9fb39a"); g.addColorStop(0.5, "#c9d6c0"); g.addColorStop(1, "#9fb39a");
    c.fillStyle = g; c.fillRect(0, 0, 256, 110);
    c.strokeStyle = "#4b6247"; c.lineWidth = 4; c.strokeRect(6, 6, 244, 98);
    c.fillStyle = "#3f5a3c"; c.font = "bold 34px serif"; c.fillText("100", 14, 44); c.fillText("100", 190, 96);
    c.beginPath(); c.arc(128, 55, 30, 0, Math.PI * 2); c.fillStyle = "#7d947a"; c.fill();
    c.fillStyle = "#c8a55a"; c.fillRect(112, 0, 32, 110);
  }
  const billTex = new THREE.CanvasTexture(billCanvas); billTex.colorSpace = THREE.SRGBColorSpace;
  const sideM = std(0x9fae95, { roughness: 0.85 });
  const topM = std(0xffffff, { map: billTex, roughness: 0.7 });
  const NB = 6 * 5 * 7;
  const bricks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.66, 0.28, 0.3), [sideM, sideM, topM, sideM, sideM, sideM], NB);
  const brickHome: THREE.Vector3[] = [];
  for (let i = 0; i < NB; i++) { const x = i % 6, z = Math.floor(i / 6) % 5, y = Math.floor(i / 30); brickHome.push(new THREE.Vector3(-1.75 + x * 0.7, 0.4 + y * 0.29, -1.3 + z * 0.65)); }
  Cs.add(bricks);
  const spotC = new THREE.SpotLight(0xfff0d8, 240, 30, 0.5, 0.6, 1.2); spotC.position.set(2, 9, 4); spotC.target.position.set(0, 1, 0); Cs.add(spotC, spotC.target);
  const rimC = new THREE.PointLight(0x2fd0ff, 50, 20, 1.5); rimC.position.set(-5, 3, -5); Cs.add(rimC);

  /* ═════════ update ═════════ */
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), Z0 = new THREE.Vector3(0, 0, 0);
  const update = (s: State, camera: THREE.PerspectiveCamera) => {
    const t = s.t, ox = SET[s.set];
    (Object.keys(groups) as SetName[]).forEach((k) => (groups[k].visible = k === s.set));
    camera.position.set(s.cam.pos[0] + ox, s.cam.pos[1], s.cam.pos[2]); camera.fov = s.cam.fov; camera.up.set(0, 1, 0);
    camera.lookAt(s.cam.look[0] + ox, s.cam.look[1], s.cam.look[2]); camera.near = s.set === "tower" ? 0.5 : 0.05; camera.far = 900; camera.updateProjectionMatrix();
    hemi.intensity = s.set === "office" ? 0.25 + 0.6 * s.day : s.set === "globe" ? 0.7 : s.set === "hackers" ? 0.12 : 0.45;
    if (s.set === "office") {
      (outsideD.material as THREE.MeshBasicMaterial).opacity = s.day;
      ceilLights.forEach((L) => (L.intensity = 22 * s.lights)); panelM.color.setScalar(0.15 + 0.85 * s.lights);
      sun.intensity = 2.2 * s.day; moonO.intensity = 18 * (1 - s.day);
      const p = s.printer;
      const col = p.led === "green" ? 0x22ff66 : p.led === "red" ? RED : p.led === "amber" ? AMBER : 0x111111;
      const blink = p.led === "red" ? (Math.floor(t * 3) % 2 ? 1 : 0.15) : 1;
      ledM.color.setHex(col).multiplyScalar(blink); ledLight.color.setHex(col); ledLight.intensity = p.led === "off" ? 0 : 1.6 * blink;
      drawScreen(p.screen, p.led === "red" ? "#ff5a4e" : p.led === "off" ? "#1a2a22" : "#7dffb0");
      // pages: normal feed (pages counter) + burst (pages fly up and around)
      for (let i = 0; i < NP; i++) {
        const k = p.pages - i, b = p.burst;
        if (k <= 0 && b <= 0) { pages.setMatrixAt(i, M.makeScale(0, 0, 0)); continue; }
        if (b > 0) {
          const ph = clamp(b * 1.4 - i / NP * 0.9), a = i * 2.399, r = 0.6 + ph * (1.2 + hash(i) * 2.4);
          V.set(Math.cos(a + t * 0.6) * r, 1.3 + ph * (0.6 + hash(i + 2) * 2.2), 0.6 + Math.sin(a + t * 0.6) * r * 0.7 + ph * 1.2);
          E.set(-Math.PI / 2 + ph * (hash(i + 4) * 6 - 3) + Math.sin(t * 2 + i) * 0.3 * ph, ph * hash(i) * 4, ph * (hash(i + 7) * 4 - 2));
          M.compose(V, Q.setFromEuler(E), ph > 0 ? S1 : Z0); pages.setMatrixAt(i, M); continue;
        }
        const u = clamp(k); // 0..1 sliding out
        V.set((hash(i) - 0.5) * 0.04, 1.135 + i * 0.004, 0.05 + 0.48 * smooth(u));
        E.set(-Math.PI / 2 - 0.12, (hash(i) - 0.5) * 0.06, 0);
        M.compose(V, Q.setFromEuler(E), S1); pages.setMatrixAt(i, M);
      }
      pages.position.set(4, 0, -3.6); pages.instanceMatrix.needsUpdate = true;
      staff.forEach((d, i) => {
        const p2 = s.staff[i];
        d.root.visible = !!p2?.show; if (!p2?.show) return;
        d.root.position.set(p2.x, 0, p2.z); d.root.rotation.y = p2.ry; pose(d, p2.pose);
        if (p2.arm) { d.sh[1].rotation.x = -2.6 * p2.arm; d.sh[1].rotation.z = -0.5 * p2.arm; d.el[1].rotation.x = -1.6 * p2.arm; }
      });
    }
    if (s.set === "tower") {
      for (let i = 0; i < NW; i++) {
        const off = winLit[i] < s.towerOff, lit = winLit[i] > 0.12;
        towerWin.setColorAt(i, !lit || off ? dark : i % 7 === 0 ? cool : warm);
      }
      towerWin.instanceColor!.needsUpdate = true;
      walkers.forEach((d, i) => {
        const u = s.walkers * 1.2 - i * 0.08, show = u > 0 && u < 1.1;
        d.root.visible = show; if (!show) return;
        const z = 13 + u * 26, x = -6 + i * 3 + Math.sin(i) * 1.5;
        d.root.position.set(x, 0, z); d.root.rotation.y = 0.1 * Math.sin(i); pose(d, { walk: (t + i) * 5.5, amp: 1 });
      });
    }
    if (s.set === "hackers") {
      drawCode(t, s.glitch);
      monLight.intensity = 14 * s.hack * (0.85 + 0.15 * Math.sin(t * 17)); monLight.color.setHex(s.glitch > 0.5 ? RED : CYAN);
      hackers.forEach((d, i) => {
        pose(d, { reach: 0.42 * (1 - s.turn), walk: t * 9 + i * 3, amp: 0, look: -0.1 + 0.25 * s.turn });
        d.spine.rotation.y = Math.PI * 0.85 * s.turn * (i ? -1 : 1) * 0.6;
        d.el.forEach((e) => (e.rotation.x = -1.3 * (1 - s.turn) + 0.05 * Math.sin(t * 20 + i)));
      });
    }
    if (s.set === "servers") {
      const zRun = -2 - s.intrude * 16;
      redRun.position.set(0, 1.4, zRun); redRun.intensity = s.intrude > 0 && s.intrude < 1 ? 30 : s.wipe > 0 ? 18 : 0;
      if (s.wipe > 0) redRun.position.set(0, 1.6, -15.5);
      for (let i = 0; i < NL; i++) {
        const p = ledPos[i], hit = s.intrude > 0 && p.z > zRun - 0.2;
        const on = hash(i * 7 + Math.floor(t * (3 + hash(i) * 6))) > 0.35;
        leds.setColorAt(i, new THREE.Color(hit ? (on ? RED : 0x330000) : on ? (i % 5 ? 0x2bf0a8 : CYAN) : 0x06221b));
      }
      leds.instanceColor!.needsUpdate = true;
      stripM.color.setHex(s.intrude > 0.05 ? RED : CYAN);
      for (let i = 0; i < NC; i++) {
        const u = s.orders * 1.6 - (i / NC) * 0.8;
        if (u <= 0 || u > 1.2) { cards.setMatrixAt(i, M.makeScale(0, 0, 0)); continue; }
        V.set((hash(i) - 0.5) * 2.2 + Math.sin(u * 5 + i) * 0.3, 0.9 + hash(i + 1) * 1.6 + Math.sin(u * 3 + i) * 0.2, -14 + u * 15);
        E.set(Math.sin(u * 4 + i) * 0.6, Math.sin(u * 3 + i * 2) * 0.8, Math.sin(u * 5 + i) * 0.4);
        M.compose(V, Q.setFromEuler(E), S1); cards.setMatrixAt(i, M);
      }
      cards.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NLog; i++) {
        const r = Math.floor(i / LW), rr = (LH - 1 - r) / LH, w = s.wipe * 1.25 - rr + hash(i) * 0.08;
        const gone = w > 0.12, red = w > 0;
        M.compose(logAt[i], Q.identity(), gone ? Z0 : S1); logs.setMatrixAt(i, M);
        logs.setColorAt(i, new THREE.Color(red ? RED : (hash(i * 3 + Math.floor(t * 4)) > 0.5 ? CYAN : 0x1fa6c4)));
      }
      logs.instanceMatrix.needsUpdate = true; logs.instanceColor!.needsUpdate = true;
      dust.visible = s.wipe > 0 && s.wipe < 1;
      if (dust.visible) {
        for (let i = 0; i < NSp; i++) {
          const life = (t * 0.9 + hash(i)) % 1, top = 0.4 + (1 - s.wipe) * LH * 0.14;
          spPos[i * 3] = -1.4 + hash(i + 1) * 2.8 + (hash(i + 2) - 0.5) * life;
          spPos[i * 3 + 1] = top + (hash(i + 3) - 0.5) * 0.3 - life * 0.6;
          spPos[i * 3 + 2] = -17.5 + life * (0.5 + hash(i + 4) * 1.4);
        }
        spGeo.attributes.position.needsUpdate = true;
      }
    }
    if (s.set === "globe") {
      earth.rotation.y = 0; atm.visible = true;
      arcs.forEach((a, i) => {
        const u = s.arcs[i]; a.m.visible = u > 0 && i < 3; a.head.visible = u > 0 && u < 1 && i < 3;
        a.geo.setDrawRange(0, Math.floor(a.total * clamp(u) / 3) * 3);
        if (a.head.visible) a.head.position.copy(a.curve.getPointAt(clamp(u)));
      });
      pins.forEach((p, i) => { const k = 1 + ((t * 0.8 + i * 0.3) % 1) * 2; p.ring.scale.setScalar(k); (p.ring.material as THREE.MeshBasicMaterial).opacity = 1 - (k - 1) / 2; });
      const mu = s.arcs[3];
      for (let i = 0; i < NM; i++) {
        const u = mu * 1.5 - (i / NM) * 0.5;
        if (u <= 0 || u >= 1) { money.setMatrixAt(i, M.makeScale(0, 0, 0)); continue; }
        const p = arcs[1].curve.getPointAt(u);
        p.add(V.set(Math.sin(i * 7.1) * 0.15, Math.cos(i * 3.3) * 0.15, Math.sin(i * 5.7) * 0.15));
        M.compose(p, Q.setFromEuler(E.set(t * 3 + i, t * 2 + i, 0)), S1); money.setMatrixAt(i, M);
      }
      money.instanceMatrix.needsUpdate = true; money.visible = mu > 0;
    }
    if (s.set === "cash") {
      for (let i = 0; i < NB; i++) {
        const order = 1 - brickHome[i].y / 2.5 + hash(i) * 0.35; // the top goes first
        const u = clamp((s.cash * 1.6 - order * 0.55) * 2.2);
        const h = brickHome[i];
        V.set(h.x + u * u * (hash(i + 1) - 0.5) * 6, h.y + u * u * (5 + hash(i) * 7), h.z + u * u * (hash(i + 2) - 0.8) * 9);
        E.set(u * (hash(i + 3) - 0.5) * 7, u * (hash(i + 4) - 0.5) * 7, 0);
        M.compose(V, Q.setFromEuler(E), u > 0.98 ? Z0 : S1); bricks.setMatrixAt(i, M);
      }
      bricks.instanceMatrix.needsUpdate = true;
    }
  };
  return { update };
};
export type World = ReturnType<typeof buildWorld>;
export type { Pose };
