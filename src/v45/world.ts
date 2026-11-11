// V45 · «پودر آبی»: the Goiânia accident (1987) as 3D sets, far apart in one scene; the camera jumps per shot.
//   room   the glowing powder: a child mannequin in the dark · a family around a table · the powder alone
//   clinic the abandoned clinic: the teletherapy machine, two men, a torch, the head being opened
//   yard   the scrapyard at night: heaps, a shed, the capsule glowing blue
//   town   houses from above: the powder travelling from house to house
//   body   one mannequin, the burns
//   bus    the bus with the bag · the health-centre desk
//   atom   Cs-137 (nucleus, shells, gamma rays) · the radiation trefoil
//   field  the stadium: thousands screened · the 249 · the 4
//   globe  the Earth, a pin on Goiânia
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { makeDummy, pose, type Dummy, type Pose } from "../v43/world";

export const SET = { room: 0, clinic: 300, yard: 600, town: 900, body: 1200, bus: 1500, atom: 1800, field: 2100, globe: 2400 } as const;
export type SetName = keyof typeof SET;
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };
const std = (color: number, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...o });
const basic = (color: number, o: Partial<THREE.MeshBasicMaterialParameters> = {}) => new THREE.MeshBasicMaterial({ color, ...o });
const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D) => {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); parent.add(me); return me;
};
export const BLUE = 0x3fb4ff;
export const GOIANIA: [number, number] = [-16.68, -49.25];
export const GLOBE_R = 10;
export const ll = (lat: number, lon: number, r: number) => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};
export const SQUAD = 249;

export type State = {
  t: number; set: SetName;
  cam: { pos: [number, number, number]; look: [number, number, number]; fov: number };
  mode: string; // per set: room girl|family|beauty · bus bus|desk · atom atom|trefoil · field crowd|squad
  glow: number; // powder / capsule glow 0..1
  lights: number; // warm room / yard light 0..1
  open: number; // clinic: the head opened 0..1
  spread: number; // town 0..1
  burn: number; // body 0..1
  prog: number; // generic progress (bus travel, crowd fill, squad turning blue)
  dead: number; // field: the four 0..1
  spin: number;
};

export const buildWorld = (scene: THREE.Scene, gl: THREE.WebGLRenderer, tex: (url: string) => THREE.Texture) => {
  scene.background = new THREE.Color(0x030509);
  const pm = new THREE.PMREMGenerator(gl);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.18;
  const hemi = new THREE.HemisphereLight(0x6f8fbf, 0x0b0c10, 0.3); scene.add(hemi);
  const G: Record<SetName, THREE.Group> = { room: new THREE.Group(), clinic: new THREE.Group(), yard: new THREE.Group(), town: new THREE.Group(), body: new THREE.Group(), bus: new THREE.Group(), atom: new THREE.Group(), field: new THREE.Group(), globe: new THREE.Group() };
  (Object.keys(G) as SetName[]).forEach((k) => { G[k].position.x = SET[k]; scene.add(G[k]); });
  const dummyM = std(0xcfc9be, { roughness: 0.55 });
  const blueM = basic(0x9fdcff);

  // a soft round sprite for the grains
  const dotCanvas = document.createElement("canvas"); dotCanvas.width = dotCanvas.height = 64;
  { const c = dotCanvas.getContext("2d")!, g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(170,225,255,0.9)"); g.addColorStop(1, "rgba(60,160,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }
  const dotTex = new THREE.CanvasTexture(dotCanvas);
  /** a glowing powder: pile + additive grains + a blue light. Returns an updater. */
  const makePowder = (parent: THREE.Object3D, n: number, spreadR: number) => {
    const g = new THREE.Group(); parent.add(g);
    const pile = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 12), new THREE.MeshStandardMaterial({ color: 0x1b4f7a, emissive: BLUE, emissiveIntensity: 2, roughness: 1 }));
    pile.scale.set(1.3, 0.35, 1.3); g.add(pile);
    const pos = new Float32Array(n * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x58b4ff, map: dotTex, size: 0.02, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; g.add(pts);
    const light = new THREE.PointLight(BLUE, 0, 7, 1.6); light.position.y = 0.25; g.add(light);
    const upd = (t: number, glow: number, swirl = 0) => {
      for (let i = 0; i < n; i++) {
        const a = hash(i) * Math.PI * 2 + t * (0.15 + hash(i + 5) * 0.4) * (1 + swirl * 3), r0 = Math.pow(hash(i + 1), 1.6) * spreadR;
        const life = (t * (0.08 + hash(i + 2) * 0.12) * (1 + swirl * 2) + hash(i + 3)) % 1;
        const r = r0 * (1 + swirl * life * 2.5), y = 0.03 + life * (0.15 + swirl * 1.6) * hash(i + 4) + Math.sin(t * 2 + i) * 0.006;
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.2 + 0.6 * glow; mat.size = 0.014 + 0.012 * glow;
      (pile.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3 + 1.6 * glow * (0.92 + 0.08 * Math.sin(t * 5));
      light.intensity = 4.5 * glow * (0.9 + 0.1 * Math.sin(t * 7));
    };
    return { g, upd, light };
  };

  /* ═════════ ROOM ═════════ */
  const R = G.room;
  const rFloor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), std(0x3b2c22, { roughness: 0.85 })); rFloor.rotation.x = -Math.PI / 2; R.add(rFloor);
  for (let i = 0; i < 9; i++) box(0.012, 0.002, 9, std(0x241a13), -4 + i, 0.002, 0, R); // floor boards
  const rWall = std(0x4a5560, { roughness: 0.95 });
  box(9, 3.2, 0.2, rWall, 0, 1.6, -3, R); box(0.2, 3.2, 9, rWall, -3.6, 1.6, 0, R); box(0.2, 3.2, 9, rWall, 3.6, 1.6, 0, R);
  // a window with moonlight, a bed, a shelf
  const furn = new THREE.Group(); R.add(furn);
  box(1.5, 1.2, 0.06, basic(0x1b2c44), 1.6, 1.8, -2.88, furn); box(1.6, 0.07, 0.1, std(0x2a2019), 1.6, 1.18, -2.86, furn); box(0.06, 1.2, 0.1, std(0x2a2019), 1.6, 1.8, -2.86, furn);
  box(2.0, 0.35, 1.0, std(0x6a5648), -2.3, 0.3, -2.2, furn); box(2.0, 0.14, 1.0, std(0xb9b0a2), -2.3, 0.55, -2.2, furn); box(0.5, 0.12, 0.7, std(0xd8d2c6), -3.0, 0.68, -2.2, furn);
  box(1.0, 0.06, 0.3, std(0x2a2019), 2.6, 1.5, -2.8, furn);
  const rLamp = new THREE.PointLight(0xffc98a, 0, 9, 1.4); rLamp.position.set(0.5, 2.6, 0.5); R.add(rLamp);
  box(0.25, 0.2, 0.25, basic(0xffe0b0), 0.5, 2.9, 0.5, R).name = "bulb";
  const bulb = R.getObjectByName("bulb") as THREE.Mesh;
  const rMoon = new THREE.SpotLight(0x6f93d6, 30, 12, 0.7, 0.8, 1.2); rMoon.position.set(1.6, 2.4, -2.5); rMoon.target.position.set(0, 0, 1); R.add(rMoon, rMoon.target);
  const table = new THREE.Group(); R.add(table);
  box(1.3, 0.06, 0.9, std(0x5b4636, { roughness: 0.6 }), 0, 0.76, 0, table);
  [[-0.58, -0.38], [0.58, -0.38], [-0.58, 0.38], [0.58, 0.38]].forEach(([x, z]) => box(0.07, 0.76, 0.07, std(0x3d2e23), x, 0.38, z, table));
  const powder = makePowder(R, 900, 0.5);
  // the child (smaller mannequin, powder on the hands)
  const girl = makeDummy(dummyM, false); girl.root.scale.setScalar(0.6); R.add(girl.root);
  girl.el.forEach((e) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), blueM); s.position.y = -0.31; e.add(s); });
  const family: Dummy[] = [0, 1, 2, 3, 4].map((i) => { const d = makeDummy(dummyM, false); d.root.scale.setScalar(i === 3 ? 0.62 : 0.96 + hash(i) * 0.08); R.add(d.root); return d; });

  /* ═════════ CLINIC ═════════ */
  const C = G.clinic;
  const cFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), std(0x3a3d3a, { roughness: 0.95 })); cFloor.rotation.x = -Math.PI / 2; C.add(cFloor);
  const cWall = std(0x6d7a6e, { roughness: 1 });
  box(10, 3.6, 0.2, cWall, 0, 1.8, -3.5, C); box(0.2, 3.6, 10, cWall, -4, 1.8, 0, C); box(0.2, 3.6, 10, cWall, 4, 1.8, 0, C);
  // peeling paint patches, rubble, a broken ceiling beam
  for (let i = 0; i < 26; i++) box(0.3 + hash(i) * 0.9, 0.2 + hash(i + 1) * 0.7, 0.02, std(0x4f5a50, { roughness: 1 }), -3.6 + hash(i + 2) * 7.2, 0.4 + hash(i + 3) * 2.8, -3.38, C);
  const rubble = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.13, 0), std(0x55584f, { roughness: 1 }), 70);
  for (let i = 0; i < 70; i++) rubble.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(-3.6 + hash(i) * 7.2, 0.06, -3.2 + hash(i + 9) * 5.5), new THREE.Quaternion().setFromEuler(new THREE.Euler(hash(i) * 3, hash(i + 1) * 3, 0)), new THREE.Vector3(1, 0.7, 1).multiplyScalar(0.5 + hash(i + 5) * 1.3)));
  C.add(rubble);
  const beam = box(4.5, 0.18, 0.18, std(0x2e2a25), -1.8, 2.5, -1.2, C); beam.rotation.z = -0.35;
  // the teletherapy machine
  const mCream = std(0x8f8a76, { roughness: 0.7 }), mGreen = std(0x58786a, { roughness: 0.6 }), mSteel = std(0x8a8f94, { metalness: 0.8, roughness: 0.35 }), mRust = std(0x6e4630, { roughness: 0.9 });
  const mach = new THREE.Group(); mach.position.set(0.4, 0, -2.2); C.add(mach);
  box(1.3, 2.1, 0.9, mCream, 0, 1.05, 0, mach); box(1.34, 0.5, 0.94, mGreen, 0, 0.25, 0, mach);
  box(0.7, 0.55, 1.5, mCream, 0, 1.95, 0.9, mach); // arm
  const head = new THREE.Group(); head.position.set(0, 1.75, 1.75); mach.add(head);
  const headShell = new THREE.Mesh(new THREE.SphereGeometry(0.52, 28, 20), mCream); headShell.scale.set(1, 1.05, 1); head.add(headShell);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.525, 0.035, 10, 40), mGreen); band.rotation.x = Math.PI / 2; head.add(band);
  const colli = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.4, 20), mSteel); colli.position.y = -0.68; head.add(colli);
  for (let i = 0; i < 9; i++) { const p = box(0.12 + hash(i) * 0.2, 0.1 + hash(i + 1) * 0.15, 0.01, mRust, 0, 0, 0, head); const a = hash(i + 2) * 6.3, b = (hash(i + 3) - 0.3) * 1.2; p.position.set(Math.cos(a) * Math.cos(b) * 0.53, Math.sin(b) * 0.55, Math.sin(a) * Math.cos(b) * 0.53); p.lookAt(0, 0, 0); }
  // the shield plug on the front of the head, hinged; the source wheel + capsule behind it
  const plugHinge = new THREE.Group(); plugHinge.position.set(-0.24, 0, 0.47); head.add(plugHinge);
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.09, 24), mSteel); plug.rotation.x = Math.PI / 2; plug.position.set(0.24, 0, 0.03); plugHinge.add(plug);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), std(0x3a3d40, { metalness: 0.9 })); b.rotation.x = Math.PI / 2; b.position.set(0.24 + Math.cos(i * 1.047) * 0.19, Math.sin(i * 1.047) * 0.19, 0.085); plugHinge.add(b); }
  const capsule = new THREE.Group(); capsule.position.set(0, 0, 0.3); head.add(capsule);
  const capBody = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 20), mSteel); capBody.rotation.x = Math.PI / 2; capsule.add(capBody);
  const capWin = new THREE.Mesh(new THREE.CircleGeometry(0.055, 20), new THREE.MeshBasicMaterial({ color: 0x9fdcff })); capWin.position.z = 0.101; capsule.add(capWin);
  const capLight = new THREE.PointLight(BLUE, 0, 3.5, 1.6); capLight.position.z = 0.25; capsule.add(capLight);
  // the couch under the head
  box(0.7, 0.08, 2.0, std(0x2a2d30), 0, 0.85, 1.9, mach); box(0.3, 0.8, 0.5, mCream, 0, 0.42, 1.6, mach);
  // a trolley, a fallen cabinet
  const cab = box(0.8, 1.7, 0.5, std(0x7b8588, { metalness: 0.4, roughness: 0.6 }), -2.9, 0.3, -2.4, C); cab.rotation.z = Math.PI / 2 - 0.1;
  const torch = new THREE.SpotLight(0xfff0d0, 0, 14, 0.5, 0.6, 1.1); C.add(torch, torch.target);
  const cFill = new THREE.PointLight(0x6f8fbf, 5, 12, 1.4); cFill.position.set(-2, 3, 3); C.add(cFill);
  const men: Dummy[] = [0, 1].map(() => { const d = makeDummy(dummyM, false); C.add(d.root); return d; });
  const crowbar = box(0.03, 0.03, 0.8, std(0x2b2b2b, { metalness: 0.8 }), 0, -0.3, 0.3, men[0].el[1]);
  void crowbar;

  /* ═════════ YARD ═════════ */
  const Y = G.yard;
  const yGround = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), std(0x3d2c20, { roughness: 1 })); yGround.rotation.x = -Math.PI / 2; Y.add(yGround);
  const corr = std(0x5d6468, { metalness: 0.5, roughness: 0.6 });
  for (let i = 0; i < 28; i++) { box(0.5, 2.4, 0.06, i % 2 ? corr : std(0x4b5256, { metalness: 0.5, roughness: 0.6 }), -7 + i * 0.5, 1.2, -6, Y); box(0.06, 2.4, 0.5, i % 2 ? corr : std(0x4b5256), -7, 1.2, -6 + i * 0.5, Y); }
  // shed
  [[-3, -5.5], [3, -5.5], [-3, -2.5], [3, -2.5]].forEach(([x, z]) => box(0.14, 3, 0.14, std(0x2a2623), x, 1.5, z, Y));
  const roof = box(6.8, 0.08, 3.8, corr, 0, 3.05, -4, Y); roof.rotation.x = 0.08;
  const yBulbM = basic(0xffd59a); box(0.14, 0.2, 0.14, yBulbM, 0, 2.7, -3.6, Y);
  const yLamp = new THREE.PointLight(0xffc27a, 0, 14, 1.3); yLamp.position.set(0, 2.5, -3.6); Y.add(yLamp);
  const yMoon = new THREE.DirectionalLight(0x7f9fd6, 0.5); yMoon.position.set(-8, 14, 6); Y.add(yMoon); yMoon.target.position.set(0, 0, -2); Y.add(yMoon.target);
  // scrap heaps: three kinds of pieces
  const rustCols = [0x7a4a2e, 0x5c6266, 0x8a5a36, 0x3f4447, 0x6b3b28, 0x8d8f8a];
  const heap = (geo: THREE.BufferGeometry, n: number, seed: number) => {
    const im = new THREE.InstancedMesh(geo, std(0xffffff, { metalness: 0.6, roughness: 0.6 }), n);
    for (let i = 0; i < n; i++) {
      const h = Math.floor(hash(i + seed) * 3), cx = [-4.2, 4.0, 0.5][h], cz = [-3.5, -3.0, -5.0][h], r = Math.pow(hash(i + seed + 1), 0.7) * 1.9, a = hash(i + seed + 2) * 6.3;
      const y = Math.max(0.1, (1.9 - r) * 0.85 * hash(i + seed + 3) + 0.1);
      im.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r * 0.8), new THREE.Quaternion().setFromEuler(new THREE.Euler(hash(i) * 6, hash(i + 4) * 6, hash(i + 7) * 6)), new THREE.Vector3(1, 1, 1).multiplyScalar(0.5 + hash(i + 8) * 1.1)));
      im.setColorAt(i, new THREE.Color(rustCols[Math.floor(hash(i + seed + 5) * rustCols.length)]));
    }
    Y.add(im);
  };
  heap(new THREE.BoxGeometry(0.7, 0.08, 0.5), 150, 1); heap(new THREE.CylinderGeometry(0.09, 0.09, 1.0, 8), 120, 50); heap(new THREE.TorusGeometry(0.28, 0.07, 6, 14), 60, 90); heap(new THREE.BoxGeometry(0.4, 0.4, 0.4), 60, 140);
  // a wheelbarrow and the capsule on the ground
  const wb = new THREE.Group(); wb.position.set(1.7, 0, 0.2); wb.rotation.y = -0.5; Y.add(wb);
  box(0.9, 0.3, 0.6, std(0x4d6b52, { metalness: 0.4 }), 0, 0.5, 0, wb); const wh = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 16), std(0x15161a)); wh.position.set(0.55, 0.22, 0); wb.add(wh); box(0.9, 0.04, 0.04, std(0x2a2623), -0.7, 0.55, 0.28, wb); box(0.9, 0.04, 0.04, std(0x2a2623), -0.7, 0.55, -0.28, wb);
  const yCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 20), mSteel); yCap.rotation.z = Math.PI / 2 - 0.25; yCap.position.set(0, 0.13, 0); Y.add(yCap);
  const yPowder = makePowder(Y, 500, 0.32); yPowder.g.position.set(0.24, 0.0, 0.05);
  const yMan = makeDummy(dummyM, false); Y.add(yMan.root);

  /* ═════════ TOWN ═════════ */
  const T = G.town;
  const tGround = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), std(0x23272c, { roughness: 1 })); tGround.rotation.x = -Math.PI / 2; T.add(tGround);
  const NH = 13 * 13;
  const houses = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 1.6, 2.6), std(0xffffff, { roughness: 0.9 }), NH);
  const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(2.15, 1.1, 4), std(0xffffff, { roughness: 0.9 }), NH);
  const hPos: THREE.Vector3[] = [];
  for (let i = 0; i < NH; i++) {
    const cx = (i % 13) - 6, cz = Math.floor(i / 13) - 6, p = new THREE.Vector3(cx * 4.6 + (hash(i) - 0.5) * 0.5, 0.8, cz * 4.6 + (hash(i + 1) - 0.5) * 0.5); hPos.push(p);
    const s = 0.8 + hash(i + 2) * 0.35;
    houses.setMatrixAt(i, new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(s, 1, s)));
    roofs.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(p.x, 2.15, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)), new THREE.Vector3(s, 1, s)));
  }
  T.add(houses, roofs);
  const tMoon = new THREE.DirectionalLight(0x8fa9d8, 1.0); tMoon.position.set(-20, 40, 15); T.add(tMoon); tMoon.target.position.set(0, 0, 0); T.add(tMoon.target);
  const ORIGIN = 6 * 13 + 6, HIT = [ORIGIN, ORIGIN + 1, ORIGIN - 14, ORIGIN + 27, ORIGIN - 3, ORIGIN + 11, ORIGIN - 29, ORIGIN + 43, ORIGIN - 40, ORIGIN + 5, ORIGIN + 30, ORIGIN - 24];
  const hitGlow = HIT.map((h, k) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), basic(0x9fdcff)); s.position.set(hPos[h].x, 3.1, hPos[h].z); T.add(s);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.05, 36), basic(BLUE, { transparent: true, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(hPos[h].x, 0.06, hPos[h].z); T.add(ring);
    const L = new THREE.PointLight(BLUE, 0, 9, 1.5); L.position.set(hPos[h].x, 3.2, hPos[h].z); if (k < 6) T.add(L);
    // an arc from the origin
    const a = hPos[ORIGIN].clone().setY(1.5), b = hPos[h].clone().setY(1.5), m = a.clone().lerp(b, 0.5).setY(1.5 + a.distanceTo(b) * 0.3);
    const curve = new THREE.QuadraticBezierCurve3(a, m, b), geo = new THREE.TubeGeometry(curve, 40, 0.07, 6, false);
    const tube = new THREE.Mesh(geo, basic(0x7fd0ff)); if (k > 0) T.add(tube);
    return { s, ring, L, geo, tube, total: geo.index!.count, curve };
  });
  const wall0 = new THREE.Color(0x8b8478), roof0 = new THREE.Color(0x6a4a3a), wallB = new THREE.Color(0x4f9fe0), roofB = new THREE.Color(0x2f6fb0);

  /* ═════════ BODY ═════════ */
  const B = G.body;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 48), std(0x14171c, { metalness: 0.6, roughness: 0.35 })); disc.position.y = -0.04; B.add(disc);
  const bGrid = new THREE.GridHelper(30, 30, 0x1f3a52, 0x12202c); bGrid.position.y = -0.07; B.add(bGrid);
  const patient = makeDummy(std(0xd6d0c5, { roughness: 0.5 }), false); B.add(patient.root);
  const burnM = new THREE.MeshBasicMaterial({ color: 0xff3b22, transparent: true, opacity: 0.85 });
  const burns = [
    [patient.el[1], 0, -0.31, 0.01, 0.058], [patient.el[1], 0.02, -0.17, 0.035, 0.035], [patient.el[0], 0, -0.31, 0.01, 0.05],
    [patient.spine, 0.1, 0.3, 0.115, 0.05], [patient.hip[1], 0, -0.22, 0.055, 0.045],
  ].map(([p, x, y, z, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r as number, 14, 10), burnM); s.position.set(x as number, y as number, z as number); (p as THREE.Object3D).add(s); return s; });
  const bKey = new THREE.SpotLight(0xe8f0ff, 60, 12, 0.6, 0.6, 1.2); bKey.position.set(2, 4, 3); bKey.target.position.set(0, 1, 0); B.add(bKey, bKey.target);
  const bRim = new THREE.PointLight(BLUE, 14, 8, 1.5); bRim.position.set(-2, 1.6, -1.5); B.add(bRim);
  const bRed = new THREE.PointLight(0xff3b30, 0, 5, 1.6); bRed.position.set(0.5, 1.0, 0.8); B.add(bRed);

  /* ═════════ BUS + DESK ═════════ */
  const U = G.bus;
  const uRoad = new THREE.Mesh(new THREE.PlaneGeometry(120, 9), std(0x15171a, { roughness: 0.9 })); uRoad.rotation.x = -Math.PI / 2; U.add(uRoad);
  const uWalk = new THREE.Mesh(new THREE.PlaneGeometry(120, 6), std(0x2a2c30, { roughness: 0.9 })); uWalk.rotation.x = -Math.PI / 2; uWalk.position.set(0, 0.1, -7.5); U.add(uWalk);
  for (let i = 0; i < 24; i++) box(2.2, 0.02, 0.16, basic(0xbdb7a6), -58 + i * 5, 0.012, 0, U);
  const winOn = basic(0xffc77a), winOff = std(0x0c1119, { roughness: 0.3, metalness: 0.4 });
  for (let b = 0; b < 12; b++) {
    const w = 7 + hash(b) * 3, h = 6 + hash(b + 1) * 10, x = -55 + b * 10;
    box(w, h, 6, std(b % 2 ? 0x3a3f47 : 0x4a443c, { roughness: 0.95 }), x, h / 2, -13.5, U);
    for (let f = 0; f < Math.floor(h / 3); f++) for (let c = 0; c < 3; c++) box(1.1, 1.3, 0.06, hash(b * 9 + f * 3 + c) > 0.6 ? winOn : winOff, x - 2.2 + c * 2.2, 2 + f * 3, -10.46, U);
  }
  [-30, -10, 10, 30].forEach((x) => { box(0.18, 6, 0.18, std(0x202226), x, 3, -5.2, U); box(0.5, 0.14, 0.5, basic(0xffd08a), x, 6, -4.6, U); const L = new THREE.PointLight(0xffb060, 70, 22, 1.5); L.position.set(x, 5.6, -4.4); U.add(L); });
  const busG = new THREE.Group(); U.add(busG);
  box(9, 2.5, 2.5, std(0xd9d4c4, { roughness: 0.5 }), 0, 1.85, 0, busG); box(9.04, 0.5, 2.54, std(0x2a5ea8, { roughness: 0.5 }), 0, 1.1, 0, busG); box(9.04, 0.2, 2.54, std(0x1d1f23), 0, 0.72, 0, busG);
  const busWinM = basic(0x9c8452);
  for (let i = 0; i < 7; i++) box(0.95, 0.85, 0.05, busWinM, -3.6 + i * 1.2, 2.25, 1.27, busG);
  box(0.05, 1.3, 2.1, basic(0xbfe0ff), 4.52, 2.1, 0, busG);
  [[-3, 1.25], [3, 1.25], [-3, -1.25], [3, -1.25]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 18), std(0x101114)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); busG.add(w); });
  [[4.55, 0.8], [4.55, -0.8]].forEach(([x, z]) => box(0.06, 0.25, 0.4, basic(0xfff3c4), x, 1.0, z, busG));
  const busHead = new THREE.SpotLight(0xfff0c8, 120, 30, 0.5, 0.7, 1.2); busHead.position.set(4.6, 1.0, 0); busHead.target.position.set(14, 0, 0); busG.add(busHead, busHead.target);
  const bagGlow = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.06), basic(0x6fc4ff)); bagGlow.position.set(0, 2.25, 1.285); busG.add(bagGlow);
  const bagL = new THREE.PointLight(BLUE, 8, 9, 1.5); bagL.position.set(0, 2.1, 2.2); busG.add(bagL);
  // a passenger's silhouette in the lit window
  const silM = basic(0x0a1826);
  const silH = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), silM); silH.scale.set(1, 1.15, 0.1); silH.position.set(-0.08, 2.3, 1.325); busG.add(silH);
  box(0.5, 0.3, 0.02, silM, -0.08, 1.98, 1.325, busG);
  const rider = makeDummy(dummyM, false); rider.root.position.set(0.9, 0.55, 0.7); rider.root.rotation.y = Math.PI / 2; busG.add(rider.root);
  // desk scene (z + 60)
  const D = new THREE.Group(); D.position.set(0, 0, 60); U.add(D);
  const dFloor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), std(0x56605c, { roughness: 0.8 })); dFloor.rotation.x = -Math.PI / 2; D.add(dFloor);
  box(10, 3.2, 0.2, std(0x5f6a65, { roughness: 0.95 }), 0, 1.6, -2.6, D);
  box(1.8, 0.06, 0.9, std(0x8d897e, { roughness: 0.5 }), 0, 0.78, 0, D); [[-0.8, 0], [0.8, 0]].forEach(([x]) => box(0.06, 0.78, 0.8, std(0x6a6f6c), x, 0.39, 0, D));
  box(0.9, 0.5, 0.04, basic(0xe9efe9), 1.6, 2.0, -2.48, D); box(0.5, 0.5, 0.04, std(0xb23a2e), 1.6, 2.0, -2.46, D).scale.set(0.24, 1, 1); box(0.5, 0.5, 0.04, std(0xb23a2e), 1.6, 2.0, -2.46, D).scale.set(1, 0.24, 1);
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), std(0x5a4a3a, { roughness: 1 })); bag.scale.set(1.2, 0.8, 1); bag.position.set(-0.2, 0.96, 0); D.add(bag);
  const dPowder = makePowder(D, 260, 0.26); dPowder.g.position.set(-0.2, 1.08, 0);
  const geiger = new THREE.Group(); geiger.position.set(0.5, 0.81, 0.1); geiger.rotation.y = -0.4; D.add(geiger);
  box(0.34, 0.12, 0.2, std(0xd9b23a, { roughness: 0.5 }), 0, 0.06, 0, geiger); box(0.2, 0.01, 0.1, basic(0xf4f1e6), -0.03, 0.125, 0, geiger);
  const needle = box(0.09, 0.006, 0.008, basic(0xc0261c), 0, 0.132, 0.03, geiger); needle.geometry.translate(0.045, 0, 0);
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 10), std(0x3a3d40, { metalness: 0.8 })); probe.rotation.z = Math.PI / 2; probe.position.set(-0.35, 0.1, 0.05); geiger.add(probe);
  const dLamp = new THREE.PointLight(0xf2f6ff, 9, 10, 1.3); dLamp.position.set(0, 2.8, 1); D.add(dLamp);
  const doctor = makeDummy(std(0xbfc4c0, { roughness: 0.6 }), false); doctor.root.position.set(0.3, 0, -1.0); D.add(doctor.root);
  const woman = makeDummy(dummyM, false); woman.root.position.set(-0.5, 0, 1.0); woman.root.rotation.y = Math.PI; D.add(woman.root);

  /* ═════════ ATOM / TREFOIL ═════════ */
  const A = G.atom;
  const atom = new THREE.Group(); A.add(atom);
  const NN = 137;
  const nuc = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 12, 10), std(0xffffff, { roughness: 0.35 }), NN);
  for (let i = 0; i < NN; i++) {
    const r = 0.62 * Math.cbrt(hash(i * 3.3 + 0.5)), dir = new THREE.Vector3(hash(i * 1.7) - 0.5, hash(i * 2.9 + 4) - 0.5, hash(i * 5.3 + 9) - 0.5).normalize().multiplyScalar(r);
    nuc.setMatrixAt(i, new THREE.Matrix4().makeTranslation(dir.x, dir.y, dir.z));
    nuc.setColorAt(i, new THREE.Color(i % 5 < 2 ? 0xff5a48 : 0x5f88c9)); // 55 protons, 82 neutrons
  }
  atom.add(nuc);
  const rings = [1.5, 2.0, 2.5].map((r, i) => {
    const g = new THREE.Group(); g.rotation.set(0.5 + i * 0.9, i * 1.1, 0.3 * i); atom.add(g);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 90), basic(0x4fb8ff, { transparent: true, opacity: 0.55 })); g.add(tor);
    const es = [0, 1, 2].map(() => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), basic(0xbfe8ff)); g.add(e); return e; });
    return { g, r, es };
  });
  const NRay = 14;
  const rays = Array.from({ length: NRay }, (_, i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 6), basic(0xdff4ff, { transparent: true })); atom.add(m);
    const dir = new THREE.Vector3(hash(i) - 0.5, hash(i + 1) - 0.5, hash(i + 2) - 0.5).normalize();
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); return { m, dir };
  });
  const aLight = new THREE.PointLight(0xffffff, 40, 12, 1.4); aLight.position.set(2, 3, 4); A.add(aLight);
  const aBlue = new THREE.PointLight(BLUE, 30, 12, 1.4); aBlue.position.set(-3, -1, 2); A.add(aBlue);
  // trefoil
  const tre = new THREE.Group(); A.add(tre);
  const yel = std(0xf2c230, { roughness: 0.5, metalness: 0.2 }), blk = std(0x111214, { roughness: 0.5 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.16, 64), yel); plate.rotation.x = Math.PI / 2; tre.add(plate);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.08, 10, 64), blk); tre.add(rim);
  for (let k = 0; k < 3; k++) {
    const sh = new THREE.Shape(), a0 = Math.PI / 2 + k * (2 * Math.PI / 3) - Math.PI / 6, a1 = a0 + Math.PI / 3;
    sh.absarc(0, 0, 1.8, a0, a1, false); sh.absarc(0, 0, 0.55, a1, a0, true);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false }), blk); m.position.z = 0.02; tre.add(m);
  }
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 32), blk); dot.rotation.x = Math.PI / 2; tre.add(dot);
  const waves = [0, 1, 2].map(() => { const w = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 80), basic(0xffd84a, { transparent: true })); A.add(w); return w; });

  /* ═════════ FIELD ═════════ */
  const F = G.field;
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(110, 80), std(0x1f3a26, { roughness: 1 })); pitch.rotation.x = -Math.PI / 2; F.add(pitch);
  const lineM = basic(0x7f9a86);
  box(64, 0.02, 0.18, lineM, 0, 0.01, -22, F); box(64, 0.02, 0.18, lineM, 0, 0.01, 22, F); box(0.18, 0.02, 44, lineM, -32, 0.01, 0, F); box(0.18, 0.02, 44, lineM, 32, 0.01, 0, F); box(0.18, 0.02, 44, lineM, 0, 0.01, 0, F);
  const cc = new THREE.Mesh(new THREE.RingGeometry(5.9, 6.1, 48), lineM); cc.rotation.x = -Math.PI / 2; cc.position.y = 0.012; F.add(cc);
  // stands
  for (let r = 0; r < 7; r++) { box(80, 0.9, 1.6, std(0x3a3f47, { roughness: 0.95 }), 0, 0.45 + r * 0.9, -28 - r * 1.6, F); }
  [[-36, -30], [36, -30], [-36, 30], [36, 30]].forEach(([x, z]) => { box(0.5, 22, 0.5, std(0x25282d), x, 11, z, F); box(4, 2, 0.4, basic(0xf4f7ff), x, 22, z, F); const L = new THREE.SpotLight(0xeaf2ff, 520, 110, 0.7, 0.6, 1.3); L.position.set(x, 22, z); L.target.position.set(x * 0.2, 0, z * 0.2); F.add(L, L.target); });
  const figGeo = new THREE.CapsuleGeometry(0.2, 0.75, 4, 8); figGeo.translate(0, 0.58, 0);
  const NCR = 70 * 44;
  const crowd = new THREE.InstancedMesh(figGeo, std(0xffffff, { roughness: 0.6 }), NCR);
  const crowdPos: THREE.Vector3[] = [];
  for (let i = 0; i < NCR; i++) { const c = i % 70, r = Math.floor(i / 70); crowdPos.push(new THREE.Vector3(-30 + c * 0.87 + (hash(i) - 0.5) * 0.3, 0, -20 + r * 0.92 + (hash(i + 1) - 0.5) * 0.3)); crowd.setColorAt(i, new THREE.Color().setHSL(0.07 + hash(i + 6) * 0.05, 0.18, 0.28 + hash(i + 2) * 0.3)); }
  F.add(crowd);
  // the 249 (their own patch, 120 m away)
  const SQ = new THREE.Group(); SQ.position.set(0, 0, 160); F.add(SQ);
  const sqFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), std(0x101318, { roughness: 0.6, metalness: 0.3 })); sqFloor.rotation.x = -Math.PI / 2; SQ.add(sqFloor);
  const squad = new THREE.InstancedMesh(figGeo, std(0xffffff, { roughness: 0.5 }), SQUAD);
  const sqPos: THREE.Vector3[] = [];
  for (let i = 0; i < SQUAD; i++) { const c = i % 21, r = Math.floor(i / 21); const p = new THREE.Vector3(-10 + c * 1.0, 0, -5.5 + r * 1.0); sqPos.push(p); squad.setMatrixAt(i, new THREE.Matrix4().makeTranslation(p.x, p.y, p.z)); }
  SQ.add(squad);
  const sqKey = new THREE.SpotLight(0xeaf2ff, 900, 60, 0.8, 0.7, 1.2); sqKey.position.set(0, 26, 14); sqKey.target.position.set(0, 0, 0); SQ.add(sqKey, sqKey.target);
  const sqBlue = new THREE.PointLight(BLUE, 0, 40, 1.4); sqBlue.position.set(0, 5, 0); SQ.add(sqBlue);
  const FOUR = [47, 115, 142, 201];
  const gray = new THREE.Color(0x9a9a96), blueC = new THREE.Color(0x49b6ff), dimB = new THREE.Color(0x15405f), white = new THREE.Color(0xffffff);

  /* ═════════ GLOBE ═════════ */
  const E = G.globe;
  const dayE = tex("styles/cosmic-web/earth_day.jpg"), nightE = tex("styles/cosmic-web/earth_night.jpg");
  dayE.colorSpace = THREE.SRGBColorSpace; nightE.colorSpace = THREE.SRGBColorSpace;
  const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 128, 96), new THREE.MeshStandardMaterial({ map: dayE, color: 0xffffff, emissiveMap: nightE, emissive: 0xffc98a, emissiveIntensity: 0.45, roughness: 0.9 })); E.add(earth);
  E.add(new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R * 1.035, 64, 48), new THREE.MeshBasicMaterial({ color: 0x3fb6ff, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending })));
  E.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(GLOBE_R * 1.004, 36, 18)), new THREE.LineBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0.08 })));
  const eSun = new THREE.DirectionalLight(0xdfe8ff, 3.6); E.add(eSun); E.add(eSun.target);
  const pin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10), basic(0x9fdcff)); pin.position.copy(ll(GOIANIA[0], GOIANIA[1], GLOBE_R + 0.05)); E.add(pin);
  const pinRings = [0, 1].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 32), basic(BLUE, { transparent: true, side: THREE.DoubleSide })); r.position.copy(ll(GOIANIA[0], GOIANIA[1], GLOBE_R + 0.02)); r.lookAt(0, 0, 0); E.add(r); return r; });
  const eStars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(Array.from({ length: 2400 }, (_, i) => { const k = Math.floor(i / 3), a = hash(k) * Math.PI * 2, b = Math.acos(2 * hash(k + 0.5) - 1), r = 220; return i % 3 === 0 ? Math.sin(b) * Math.cos(a) * r : i % 3 === 1 ? Math.cos(b) * r : Math.sin(b) * Math.sin(a) * r; }), 3)), new THREE.PointsMaterial({ color: 0xbfcfff, size: 1.2, sizeAttenuation: false })); E.add(eStars);

  /* ═════════ update ═════════ */
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), Z0 = new THREE.Vector3(0, 0, 0), col = new THREE.Color();
  const sit = (d: Dummy, p: Pose) => pose(d, p);
  const update = (s: State, camera: THREE.PerspectiveCamera) => {
    const t = s.t, ox = SET[s.set];
    (Object.keys(G) as SetName[]).forEach((k) => (G[k].visible = k === s.set));
    camera.position.set(s.cam.pos[0] + ox, s.cam.pos[1], s.cam.pos[2]); camera.fov = s.cam.fov; camera.up.set(0, 1, 0);
    camera.lookAt(s.cam.look[0] + ox, s.cam.look[1], s.cam.look[2]); camera.near = s.set === "field" || s.set === "town" ? 0.5 : 0.03; camera.far = 900; camera.updateProjectionMatrix();
    hemi.intensity = ({ room: 0.1 + 0.3 * s.lights, clinic: 0.1, yard: 0.14 + 0.2 * s.lights, town: 0.35, body: 0.2, bus: 0.3, atom: 0.5, field: 0.35, globe: 0.7 } as Record<SetName, number>)[s.set];
    if (s.set === "room") {
      rLamp.intensity = 26 * s.lights; (bulb.material as THREE.MeshBasicMaterial).color.setScalar(0.08 + 0.92 * s.lights); rMoon.intensity = 30 * (1 - 0.6 * s.lights);
      const girlOn = s.mode === "girl", fam = s.mode === "family";
      table.visible = fam; furn.visible = s.mode !== "beauty"; girl.root.visible = girlOn; family.forEach((d) => (d.root.visible = fam));
      powder.g.position.set(0, fam ? 0.8 : 0.01, girlOn ? 0.42 : 0);
      powder.upd(t, s.glow, s.mode === "beauty" ? 1 : 0);
      if (girlOn) {
        girl.root.position.set(0, 0, 0); girl.root.rotation.y = 0;
        sit(girl, { crouch: 0.95, look: 0.28, turn: 0.08 * Math.sin(t * 1.3) });
        girl.sh.forEach((sh, i) => { sh.rotation.x = -0.75 - 0.25 * Math.sin(t * 2.2 + i * 2); sh.rotation.z = (i ? -1 : 1) * -0.18; });
        girl.el.forEach((e, i) => (e.rotation.x = -0.9 - 0.3 * Math.sin(t * 2.2 + i * 2 + 1)));
      }
      if (fam) family.forEach((d, i) => {
        const a = -0.9 + i * 0.95 + (i > 2 ? 0.6 : 0), r = i === 3 ? 0.95 : 1.15;
        d.root.position.set(Math.sin(a) * r, 0, Math.cos(a) * r * 0.9); d.root.rotation.y = a + Math.PI;
        pose(d, { look: 0.3, turn: 0.05 * Math.sin(t + i) });
        d.spine.rotation.x = 0.28 + 0.04 * Math.sin(t * 1.5 + i);
        if (i === 1 || i === 4) { d.sh[1].rotation.x = -1.0 - 0.15 * Math.sin(t * 2 + i); d.el[1].rotation.x = -0.5; }
      });
    }
    if (s.set === "clinic") {
      plugHinge.rotation.y = -2.0 * smooth(s.open * 1.6);
      capsule.position.z = 0.3 + 0.42 * smooth(s.open * 1.6 - 0.5);
      (capWin.material as THREE.MeshBasicMaterial).color.setHex(0x9fdcff).multiplyScalar(0.25 + 0.75 * s.glow);
      capLight.intensity = 5 * s.glow * smooth(s.open * 1.6 - 0.4);
      // man 0 works on the head, man 1 holds the torch
      const hx = 0.4, hz = -2.2 + 1.75;
      men[0].root.position.set(hx - 0.55, 0, hz + 1.05); men[0].root.rotation.y = Math.PI - 0.45; pose(men[0], { reach: 0.62 + 0.05 * Math.sin(t * 9) * (s.open > 0 && s.open < 1 ? 1 : 0), look: -0.2 });
      const walk = clamp(1 - s.prog);
      men[1].root.position.set(hx + 1.3 + walk * 0.4, 0, hz + 1.7 + walk * 2.2); men[1].root.rotation.y = Math.PI + 0.5; pose(men[1], walk > 0 ? { walk: t * 6, amp: 0.8 } : { look: -0.1 });
      men[1].sh[0].rotation.x = -1.25; men[1].el[0].rotation.x = -0.25;
      men[0].root.visible = s.prog > 0.3;
      torch.position.set(SET.clinic * 0 + men[1].root.position.x - 0.2, 1.35, men[1].root.position.z - 0.3); torch.target.position.set(hx + Math.sin(t * 1.7) * 0.25, 1.75 + Math.sin(t * 2.3) * 0.12, hz); torch.intensity = 55;
    }
    if (s.set === "yard") {
      yLamp.intensity = 45 * s.lights; yBulbM.color.setScalar(0.1 + 0.9 * s.lights); yMoon.intensity = 0.5;
      yPowder.upd(t, s.glow);
      yMan.root.position.set(-0.75, 0, 0.55); yMan.root.rotation.y = 2.1; pose(yMan, { crouch: 0.8 * smooth(s.prog), look: 0.3, reach: 0.12 * smooth(s.prog) });
      yMan.sh[1].rotation.x = -0.9 * smooth(s.prog);
    }
    if (s.set === "town") {
      const nHit = HIT.length;
      for (let i = 0; i < NH; i++) { houses.setColorAt(i, wall0); roofs.setColorAt(i, roof0); }
      hitGlow.forEach((h, k) => {
        const u = k === 0 ? 1 : clamp(s.spread * (nHit + 2) / 3 - (k - 1) * 0.3), arrive = clamp((u - 0.8) * 5);
        h.tube.visible = u > 0; h.geo.setDrawRange(0, Math.floor(h.total * clamp(u / 0.85) / 3) * 3);
        h.s.visible = arrive > 0; h.s.scale.setScalar(arrive * (0.8 + 0.2 * Math.sin(t * 5 + k)));
        const ph = (t * 0.7 + k * 0.23) % 1; h.ring.visible = arrive > 0; h.ring.scale.setScalar(0.4 + ph * 1.6); (h.ring.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * arrive;
        h.L.intensity = 28 * arrive;
        if (arrive > 0) { houses.setColorAt(HIT[k], col.copy(wall0).lerp(wallB, arrive)); roofs.setColorAt(HIT[k], col.copy(roof0).lerp(roofB, arrive)); }
      });
      houses.instanceColor!.needsUpdate = true; roofs.instanceColor!.needsUpdate = true;
    }
    if (s.set === "body") {
      patient.root.rotation.y = s.spin; pose(patient, { look: 0.12 });
      patient.sh[1].rotation.x = -0.9; patient.sh[1].rotation.z = -0.25; patient.el[1].rotation.x = -1.2; // the right hand raised, palm up
      burns.forEach((b, i) => { const k = smooth(s.burn * 3 - i * 0.45); b.scale.setScalar(k * (1 + 0.1 * Math.sin(t * 6 + i))); });
      bRed.intensity = 6 * s.burn;
    }
    if (s.set === "bus") {
      busG.visible = s.mode === "bus"; D.visible = s.mode === "desk";
      busG.position.set(-22 + s.prog * 40, 0, 1.4);
      pose(rider, { crouch: 0.75 }); rider.el.forEach((e) => (e.rotation.x = -1.3));
      (bagGlow.material as THREE.MeshBasicMaterial).color.setHex(0x6fc4ff).multiplyScalar(0.8 + 0.2 * Math.sin(t * 6)); bagL.intensity = 8 * (0.85 + 0.15 * Math.sin(t * 6));
      if (s.mode === "desk") {
        dPowder.upd(t, s.glow);
        needle.rotation.y = -(0.3 + 2.4 * smooth(s.prog) + 0.08 * Math.sin(t * 40) * s.prog);
        pose(doctor, { look: 0.3 }); doctor.spine.rotation.x = -0.22 * smooth(s.prog); doctor.root.position.z = -1.0 - 0.35 * smooth(s.prog);
        doctor.sh.forEach((sh, i) => { sh.rotation.x = -0.9 * smooth(s.prog); sh.rotation.z = (i ? 1 : -1) * 0.3 * smooth(s.prog); });
        pose(woman, { look: 0.15 });
      }
    }
    if (s.set === "atom") {
      atom.visible = s.mode === "atom"; tre.visible = s.mode === "trefoil"; waves.forEach((w) => (w.visible = s.mode === "trefoil"));
      if (s.mode === "atom") {
        atom.rotation.y = t * 0.35; nuc.rotation.set(t * 0.4, t * 0.6, 0);
        rings.forEach((r, i) => r.es.forEach((e, k) => { const a = t * (1.6 - i * 0.3) + k * 2.094; e.position.set(Math.cos(a) * r.r, Math.sin(a) * r.r, 0); }));
        rays.forEach((r, i) => {
          const life = (t * 0.9 + hash(i * 3)) % 1, on = s.glow > 0 ? 1 : 0, d = 0.8 + life * 6;
          r.m.position.copy(V.copy(r.dir).multiplyScalar(d)); r.m.scale.set(1, 0.5 + life * 1.2, 1); (r.m.material as THREE.MeshBasicMaterial).opacity = on * (1 - life) * s.glow; r.m.visible = on > 0;
        });
      } else {
        tre.rotation.y = Math.sin(t * 0.8) * 0.5 + s.spin; tre.rotation.x = -0.12;
        waves.forEach((w, i) => { const ph = (t * 0.5 + i / 3) % 1; w.scale.setScalar(2.3 + ph * 3.2); (w.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.7; });
      }
    }
    if (s.set === "field") {
      const crowdOn = s.mode === "crowd"; crowd.visible = crowdOn; SQ.visible = !crowdOn; pitch.visible = crowdOn;
      if (crowdOn) {
        for (let i = 0; i < NCR; i++) {
          const order = (Math.floor(i / 70) / 44) * 0.8 + hash(i * 1.3) * 0.2, k = clamp((s.prog * 1.15 - order) * 8);
          const p = crowdPos[i]; M.compose(V.set(p.x, 0, p.z), Q.identity(), k > 0 ? V.clone().set(1, k * (0.85 + hash(i) * 0.3), 1) : Z0); crowd.setMatrixAt(i, M);
        }
        crowd.instanceMatrix.needsUpdate = true;
      } else {
        for (let i = 0; i < SQUAD; i++) {
          const order = hash(i * 2.7), b = clamp((s.prog * 1.15 - order) * 10), four = FOUR.includes(i);
          col.copy(gray).lerp(blueC, b);
          if (s.dead > 0) { if (four) col.lerp(white, s.dead); else col.lerp(dimB, s.dead * 0.9); }
          squad.setColorAt(i, col);
          const p = sqPos[i], lift = four ? 0.9 * smooth(s.dead) : 0;
          M.compose(V.set(p.x, lift, p.z), Q.identity(), S1); squad.setMatrixAt(i, M);
        }
        squad.instanceColor!.needsUpdate = true; squad.instanceMatrix.needsUpdate = true;
        sqBlue.intensity = 160 * s.prog * (1 - 0.7 * s.dead); sqKey.intensity = 900 * (1 - 0.75 * s.dead);
      }
    }
    if (s.set === "globe") {
      eSun.position.set(s.cam.pos[0] * 1.2 + 6, s.cam.pos[1] * 1.2 + 8, s.cam.pos[2] * 1.2); eSun.target.position.set(0, 0, 0);
      pinRings.forEach((r, i) => { const ph = (t * 0.7 + i * 0.5) % 1; r.scale.setScalar((Math.hypot(...s.cam.pos) / GLOBE_R - 1) * 0.6 * (1 + ph * 2.2)); (r.material as THREE.MeshBasicMaterial).opacity = 1 - ph; });
      const pk = Math.hypot(...s.cam.pos) / GLOBE_R - 1; pin.scale.setScalar(pk * 0.55 * (1 + 0.2 * Math.sin(t * 6)));
    }
  };
  return { update, FOUR, sqPos };
};
export type World = ReturnType<typeof buildWorld>;
