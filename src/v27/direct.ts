// V27 · per-frame direction of the 3D world. Shot times come from the narration (T, built from vo.json in Video.tsx).
import * as THREE from "three";
import { center, cx, cy, Pod, World } from "./world";

export type Times = Record<string, number>;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const hsh = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const lane = (i: number, rmax = 1.9, rmin = 0.35): [number, number] => {
  const a = hsh(i, 1) * Math.PI * 2, r = rmin + (rmax - rmin) * Math.sqrt(hsh(i, 2));
  return [Math.cos(a) * r, Math.sin(a) * r * 0.85];
};
const integ = (v: (t: number) => number, t0: number, t1: number, n = 80) => {
  if (t1 <= t0) return 0;
  const h = (t1 - t0) / n;
  let s = 0;
  for (let k = 0; k < n; k++) s += v(t0 + (k + 0.5) * h) * h;
  return s;
};

const V = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();
const tangent = (z: number, o = new THREE.Vector3()) => o.set(cx(z + 0.05) - cx(z - 0.05), cy(z + 0.05) - cy(z - 0.05), 0.1).normalize(); // points +z (backward)

type PodState = { z: number; ox?: number; oy?: number; y?: number; s?: number; yaw?: number; pitch?: number; roll?: number; coat?: number; dead?: number; i?: number; absY?: boolean };
const placePod = (p: Pod, st: PodState, t: number, cam: THREE.Vector3) => {
  const { z, ox = 0, oy = 0, s = 1, yaw = 0, pitch = 0, roll = 0, coat = 0, dead = 0, i = 0 } = st;
  center(z, V);
  V.x += ox;
  V.y = st.absY ? (st.y as number) : V.y + oy;
  p.g.visible = s > 0.01;
  p.g.position.copy(V);
  tangent(z, V2);
  p.g.lookAt(V3.copy(V).add(V2));
  p.inner.rotation.set(pitch + Math.sin(t * 2.1 + i) * 0.05, yaw + Math.sin(t * 1.7 + i * 2) * 0.06, roll + Math.sin(t * 1.3 + i * 3) * 0.08);
  p.g.scale.setScalar(s);
  p.glass.uniforms.uCoat.value = coat;
  p.glass.uniforms.uDead.value = dead;
  p.glass.uniforms.uCam.value.copy(cam);
  p.tail.uniforms.uT.value = t * (1 - 0.85 * dead);
  p.tail.uniforms.uPh.value = i * 1.3;
  p.tail.uniforms.uAmp.value = 0.07 * (1 - 0.6 * dead);
  p.tail.uniforms.uDead.value = dead;
  p.pilot.rotation.set(Math.sin(t * 5 + i) * 0.04 * (1 - dead), 0, 0);
};

const setCam = (cam: THREE.PerspectiveCamera, pos: THREE.Vector3, look: THREE.Vector3, roll: number, fov: number) => {
  cam.position.copy(pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(look);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
};
// camera inside the tunnel: z, offsets, looking `ahead` units forward with look offsets
const tunCam = (cam: THREE.PerspectiveCamera, z: number, ox: number, oy: number, ahead: number, lx: number, ly: number, roll: number, fov = 52) => {
  const p = center(z, new THREE.Vector3()).add(new THREE.Vector3(ox, oy, 0));
  const l = center(z - ahead, new THREE.Vector3()).add(new THREE.Vector3(lx, ly, 0));
  setCam(cam, p, l, roll, fov);
};
const shake = (t: number, a: number) => [Math.sin(t * 37) * Math.sin(t * 11) * a, Math.cos(t * 29) * Math.sin(t * 7) * a] as const;

export const direct = (T: Times, t: number, E: World, cam: THREE.PerspectiveCamera) => {
  // reset
  for (const p of E.pods) p.g.visible = false;
  for (const b of E.blobs) b.visible = false;
  for (const c of E.cells) c.visible = false;
  E.sea.visible = false;
  E.egg.visible = false;
  E.morula.visible = false;
  E.gold.visible = false;
  E.glow.visible = true;
  const tu = E.tunnelM.uniforms;
  tu.uAcid.value = 0;
  tu.uTint.value.setRGB(1, 1, 1);
  tu.uFog.value = 0.022;
  tu.uExp.value = 1;
  tu.uGlowAmt.value = 1;
  E.glowL.intensity = 0;

  let glowZ = 0, glowS = 14, glowOn = 1;

  if (t < T.C) {
    // ── A · launch and the race (one continuous flight)
    const vc = (x: number) => 0.3 + 6.4 * eio(prog(x, T.shot - 0.05, T.shot + 0.75)) + 1.6 * eio(prog(x, T.l2 + 1.4, T.l3));
    const zc = -integ(vc, 0, t);
    const [sx, sy] = shake(t, 0.025 * prog(t, T.shot, T.shot + 0.3));
    const roll = 0.06 * Math.sin(t * 0.7) + 0.05 * eio(prog(t, T.l2, T.C)) * Math.sin(t * 1.9);
    tunCam(cam, zc, 0.05 + sx, -0.25 + sy, 5, 0.1, -0.2, roll, 50);
    for (let i = 0; i < 40; i++) {
      const p = E.pods[i];
      const hero = i === 0;
      const behind = i >= 33;
      const [ox, oy] = hero ? [0.2, -0.38] : lane(i);
      const z0 = hero ? -1.75 : behind ? 2 + hsh(i, 3) * 4 : -2.6 - hsh(i, 3) * 11;
      const tl = hero ? T.shot : T.shot + 0.05 + hsh(i, 4) * 0.35;
      const D = hero ? 6.5 : 2 + hsh(i, 5) * 4;
      const drift = behind ? 2.2 + hsh(i, 6) * 1.4 : -0.55 + hsh(i, 6) * 1.2;
      const dt = Math.max(0, t - tl);
      const z = z0 - integ(vc, 0, t) - D * (1 - Math.exp(-dt * 2.2)) - drift * dt + (t < tl ? Math.sin(t * 2 + i) * 0.03 : 0);
      if (z > zc + 0.6) continue; // behind the camera
      placePod(p, { z, ox: ox + Math.sin(t * 1.1 + i) * 0.08, oy: oy + Math.cos(t * 0.9 + i) * 0.06, i, yaw: hero ? -1.25 * (1 - eio(prog(t, T.shot - 0.25, T.shot + 0.5))) : 0 }, t, cam.position);
    }
    glowZ = zc - 34;
    glowS = 9;
  } else if (t < T.D) {
    // ── C · the fastest one reaches the egg
    const zE = -300, eR = 2.0;
    const surf = zE + eR + 0.3;
    const hz0 = -287;
    const hit = T.egg + 0.1;
    const kz = prog(t, T.C, hit);
    const hz = hz0 + (surf - hz0) * (kz * kz * 0.35 + kz * 0.65);
    const camZ = t < T.egg ? hz + 1.5 + (t - T.C) * 0.6 : surf + 1.5 + (T.egg - T.C) * 0.6 + eo(prog(t, T.egg, T.D)) * 2.6;
    const [sx, sy] = shake(t, 0.02);
    tunCam(cam, camZ, 0.15 + sx, 0.05 + sy, 6, 0, -0.05, -0.05, 50);
    const sink = prog(t, hit, hit + 0.35);
    placePod(E.pods[0], { z: hz + sink * 0.5, ox: 0.0, oy: -0.12 * (1 - kz), s: 1 - eo(sink), i: 0 }, t, cam.position);
    for (let i = 1; i < 9; i++) {
      const [ox, oy] = lane(i + 50, 1.8, 0.8);
      const z = hz0 + 2 + hsh(i, 7) * 3 - (t - T.C) * (4 + hsh(i, 8) * 2.5);
      placePod(E.pods[i], { z, ox, oy, i }, t, cam.position);
    }
    E.egg.visible = true;
    center(zE, E.egg.position);
    E.egg.scale.setScalar(eR);
    E.egg.rotation.set(0.3, t * 0.05, 0);
    const eu = (E.eggBody.material as THREE.ShaderMaterial).uniforms;
    eu.uT.value = t;
    eu.uCam.value.copy(cam.position);
    eu.uGlow.value = 0.15 + 0.7 * Math.exp(-Math.max(0, t - hit) * 3) * (t > hit ? 1 : 0);
    eu.uRip.value = t > hit ? (t - hit) * 3.2 : -10;
    eu.uRipP.value.set(0, 0, 1);
    (E.zona.material as THREE.ShaderMaterial).uniforms.uCam.value.copy(cam.position);
    glowZ = zE - 6;
    glowS = 18;
    tu.uTint.value.setRGB(1.05, 0.98, 0.95);
  } else if (t < T.E) {
    // ── D · a new life: the egg divides 1 → 2 → 4 → 8
    const zM = -600;
    const orbit = (t - T.D) * 0.35;
    const cpos = center(zM + 7.8 - 0.45 * (t - T.D), new THREE.Vector3()).add(new THREE.Vector3(Math.sin(orbit) * 1.3, 0.45, 0));
    setCam(cam, cpos, center(zM, V), 0.03, 50);
    E.morula.visible = true;
    center(zM, E.morula.position);
    E.morula.scale.setScalar(1.5 + 0.05 * Math.sin(t * 3));
    E.morula.rotation.set(0.2, t * 0.25, 0.1);
    const lv = [T.div1, T.div2, T.div3];
    const P: [number, number, number][][] = [
      [[0, 0, 0]],
      [[-0.43, 0, 0], [0.43, 0, 0]],
      [[-0.45, 0.25, 0], [0.45, -0.25, 0], [0, -0.3, 0.45], [0, 0.3, -0.45]].map((v) => v as [number, number, number]),
      [[-1, -1, -1], [1, 1, -1], [1, -1, 1], [-1, 1, 1], [-1, 1, -1], [1, -1, -1], [1, 1, 1], [-1, -1, 1]].map(([a, b, c]) => [a * 0.36, b * 0.36, c * 0.36] as [number, number, number]),
    ];
    const RS = [0.98, 0.62, 0.52, 0.44];
    let L = 0;
    while (L < 3 && t >= lv[L]) L++;
    const pr = L === 0 ? 1 : eo(prog(t, lv[L - 1], lv[L - 1] + 0.35));
    const sq = L === 0 ? 0 : Math.sin(Math.PI * clamp(pr)) * 0.12;
    E.cellsM.forEach((c, k) => {
      const cur = P[L][k % P[L].length];
      const par = L === 0 ? cur : P[L - 1][(k >> 1) % P[L - 1].length];
      c.position.set(par[0] + (cur[0] - par[0]) * pr, par[1] + (cur[1] - par[1]) * pr, par[2] + (cur[2] - par[2]) * pr);
      const r = (L === 0 ? RS[0] : RS[L - 1] + (RS[L] - RS[L - 1]) * pr) * (1 + 0.025 * Math.sin(t * 4 + k));
      c.scale.set(r * (1 + sq), r * (1 - sq * 0.6), r);
      const u = (c.material as THREE.ShaderMaterial).uniforms;
      u.uT.value = t + k * 3;
      u.uCam.value.copy(cam.position);
      const kick = lv.reduce((a, x) => a + (t > x ? Math.exp(-(t - x) * 4) : 0), 0);
      u.uGlow.value = 0.25 + 0.6 * kick + 0.25 * prog(t, T.div3, T.E);
      u.uRip.value = -10;
    });
    (E.mZona.material as THREE.ShaderMaterial).uniforms.uCam.value.copy(cam.position);
    glowZ = zM - 9;
    glowS = 12;
    tu.uTint.value.setRGB(1.1, 0.95, 0.9);
    tu.uFog.value = 0.03;
  } else if (t < T.F) {
    // (E · the myth stamp is a frozen frame of D; Video.tsx never asks for these times)
  } else if (t < T.G) {
    // ── F · acid attack
    const z0 = -900, sp = 2.4;
    const zc = z0 - (t - T.F) * sp;
    const second = t >= T.F2;
    const amp = 0.02 + 0.05 * prog(t, T.atk, T.atk + 0.3) * (1 - 0.6 * prog(t, T.atk + 1.5, T.G));
    const [sx, sy] = shake(t, amp);
    if (!second) tunCam(cam, zc, 0.2 + sx, 0.15 + sy, 6, -0.1, -0.2, 0.05 * Math.sin(t), 52);
    else tunCam(cam, zc - 1.2, 0.9 + sx, -0.9 + sy, 5, -0.4, 0.1, 0.16, 56);
    tu.uAcid.value = 0.28 * eo(prog(t, T.acid, T.acid + 0.8));
    tu.uTint.value.setRGB(0.95, 0.92, 0.9);
    const nP = 28;
    // which pods get hit, and when
    const hitT = (i: number) => (i % 3 === 2 ? Infinity : i < 10 ? T.atk + 0.12 + i * 0.07 : T.mil + 0.05 + (i - 10) * 0.06);
    let bj = 0;
    for (let i = 0; i < nP; i++) {
      const [ox, oy] = lane(i + 100, 1.9, 0.3);
      const rel0 = -2.2 - hsh(i, 9) * 9;
      const th = hitT(i);
      const dead = clamp((t - th) / 0.5);
      const zAlive = z0 + rel0 - (t - T.F) * (sp + 0.25 + hsh(i, 10) * 0.3);
      // after the hit the pod stops and tumbles down to the floor
      const tz = Math.min(t, th);
      const zHit = z0 + rel0 - (tz - T.F) * (sp + 0.25 + hsh(i, 10) * 0.3);
      const z = t < th ? zAlive : zHit - (1 - Math.exp(-(t - th) * 2)) * 0.8;
      const fall = eio(prog(t, th + 0.15, th + 1.6));
      placePod(E.pods[i], { z, ox: ox * (1 - 0.2 * fall), oy: oy + (-2.4 - oy) * fall, roll: dead * (t - th) * 2.5, pitch: dead * (t - th) * 1.4, coat: eo(prog(t, th, th + 0.2)), dead, i }, t, cam.position);
      // the acid blob flying to it, then sticking on it
      if (th < Infinity && bj < E.blobs.length) {
        const b = E.blobs[bj++];
        const tl = th - 0.42;
        if (t >= tl) {
          b.visible = true;
          const a = Math.atan2(oy, ox) + (hsh(i, 11) - 0.5) * 1.2;
          const wz = zHit + 1.2;
          const from = center(wz, new THREE.Vector3()).add(new THREE.Vector3(Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0));
          const k = prog(t, tl, th);
          const to = E.pods[i].g.position;
          b.position.lerpVectors(from, to, eio(k));
          b.position.y += Math.sin(Math.PI * k) * 0.4;
          const s = t < th ? 0.18 + 0.12 * k : 0.3 * (1 - 0.35 * prog(t, th, th + 0.3));
          b.scale.set(s * (t < th ? 1.25 : 1.15), s * (t < th ? 0.85 : 0.75), s);
          const u = (b.material as THREE.ShaderMaterial).uniforms;
          u.uT.value = t * 3;
          u.uCam.value.copy(cam.position);
          u.uCol.value.setRGB(0.55, 0.95, 0.12);
        }
      }
    }
    glowZ = zc - 40;
    glowS = 10;
    tu.uGlowAmt.value = 0.6;
  } else if (t < T.H) {
    // ── G · the fluid neutralises the acid (close on one pod)
    const z0 = -1300, sp = 1.6;
    const go = Math.max(0, t - T.chance);
    const pz = z0 - (t - T.G) * sp - go * go * 3.5;
    const cz = z0 - (t - T.G) * sp - go * go * 0.6;
    const [sx, sy] = shake(t, 0.012);
    const cpos = center(cz + 1.05, new THREE.Vector3()).add(new THREE.Vector3(0.95 + sx, -0.05 + sy, 0));
    const look = center(cz - 0.4, new THREE.Vector3()).add(new THREE.Vector3(0.05, -0.38, 0));
    setCam(cam, cpos, look, -0.06, 46);
    const clean = eo(prog(t, T.neut, T.neut + 0.9));
    placePod(E.pods[0], { z: pz, ox: 0.1, oy: -0.4, coat: 1 - clean, i: 0, yaw: 0.35 }, t, cam.position);
    for (let i = 1; i < 6; i++) {
      const [ox, oy] = lane(i + 200, 1.9, 1.0);
      placePod(E.pods[i], { z: z0 - 2 - hsh(i, 12) * 6 - (t - T.G) * (sp + hsh(i, 13) * 0.4) - go * go * 2.5, ox, oy, coat: 1 - eo(prog(t, T.neut + 0.15 * i, T.neut + 0.9 + 0.15 * i)), i }, t, cam.position);
    }
    // acid lumps: one stuck on the hero, a few floating
    for (let j = 0; j < 6; j++) {
      const b = E.blobs[j];
      b.visible = true;
      const k = eo(prog(t, T.neut + j * 0.08, T.neut + 0.8 + j * 0.08));
      if (j === 0) b.position.copy(E.pods[0].g.position).add(new THREE.Vector3(0.12, 0.2, -0.08));
      else b.position.copy(center(z0 - 1.5 - j * 1.6 - (t - T.G) * 0.3, V)).add(new THREE.Vector3(Math.cos(j * 2.3) * 1.6, Math.sin(j * 2.3) * 1.3, 0));
      const s = (j === 0 ? 0.2 : 0.28 + 0.05 * j) * (1 - 0.9 * k);
      b.scale.set(s * 1.15, s * 0.8, s);
      b.visible = s > 0.01;
      const u = (b.material as THREE.ShaderMaterial).uniforms;
      u.uT.value = t * 2;
      u.uCam.value.copy(cam.position);
      u.uCol.value.setRGB(0.55 + 0.35 * k, 0.95 - 0.25 * k, 0.12 + 0.1 * k);
    }
    // golden fluid flowing forward around the pods
    E.gold.visible = true;
    center(cz + 1.6, E.gold.position);
    E.gold.position.y -= 0.3;
    E.goldM.uniforms.uT.value = t;
    E.goldM.uniforms.uA.value = eo(prog(t, T.fluid, T.fluid + 0.4)) * (1 - 0.6 * prog(t, T.chance, T.H));
    E.goldM.uniforms.uSize.value = 34;
    tu.uAcid.value = 0.22 * (1 - clean);
    glowZ = cz - 40;
    glowS = 10;
    tu.uGlowAmt.value = 0.5;
  } else if (t < T.J) {
    // ── H · the mucus sea, I · white blood cells
    const immune = t >= T.I;
    const z0 = immune ? -2100 : -1700;
    const t0 = immune ? T.I : T.H;
    const seaY = -1.45;
    E.sea.visible = true;
    const su = (E.sea.material as THREE.ShaderMaterial).uniforms;
    su.uT.value = t;
    su.uY.value = seaY;
    const sp = 0.85;
    const cz = z0 - (t - t0) * sp;
    E.sea.position.z = Math.round(cz / 0.2) * 0.2 - 60;
    if (!immune) {
      const rise = eio(prog(t, T.mucus, T.mucus + 1.2));
      tunCam(cam, cz + 1.6, 0.25, seaY + 0.42 + rise * 0.55, 6, 0, seaY + 0.1 - rise * 0.2, 0.04 * Math.sin(t * 0.8), 52);
    } else {
      tunCam(cam, cz + 1.2, 1.0, seaY + 0.8, 5, -0.3, seaY + 0.1, -0.07, 54);
    }
    su.uCam.value.copy(cam.position);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const [ox] = immune && i < 5 ? [[-0.55, 0.35, -0.1, 0.75, -0.75][i]] : lane(i + (immune ? 400 : 300), 1.9, 0.0);
      const stuck = i % 4 === 3;
      const slow = stuck ? 0 : sp * (0.9 + hsh(i, 14) * 0.45) * (1 - (immune ? 0 : 0.35 * prog(t, T.sticky, T.sticky + 0.6)) + (immune ? 0 : 0.5 * prog(t, T.pass, T.pass + 0.4)));
      let z = immune && i < 5 ? cz - 1.4 - i * 0.75 - (t - t0) * 0.15 : z0 - 0.5 - hsh(i, 15) * 9 - (t - t0) * slow;
      const p = E.pods[i];
      let s = 1;
      let bob = Math.sin(t * 2.2 + i) * 0.04;
      if (immune && i < 5) {
        // the cell that eats it
        const c = E.cells[i];
        const tr = T.imm + 0.12 * i;
        const te = T.kill + 0.09 * i;
        const cz2 = z - 0.9 - 0.4 * hsh(i, 16);
        const up = eo(prog(t, tr, tr + 0.7));
        const app = eio(prog(t, T.cell, te));
        const cox = ox + (i % 2 ? 1 : -1) * 0.9 * (1 - app);
        const cpos = center(cz2 + 0.9 * app, new THREE.Vector3());
        cpos.x += cox;
        cpos.y = cy(cz2) + seaY - 1.0 + up * 1.2;
        c.visible = up > 0.01;
        c.position.copy(cpos);
        const eat = prog(t, te, te + 0.35);
        const cr = 0.58 * (0.3 + 0.7 * up) * (1 + 0.15 * Math.sin(Math.PI * eat));
        c.scale.set(cr * 1.05, cr * 0.9, cr);
        const u = (c.material as THREE.ShaderMaterial).uniforms;
        u.uT.value = t * 1.5 + i;
        u.uCam.value.copy(cam.position);
        u.uAmp.value = 0.16 + 0.12 * Math.sin(Math.PI * eat);
        if (t > te) {
          // pulled inside the cell
          const k = eio(eat);
          z = z + (cz2 + 0.9 - z) * k;
          s = 1 - k;
          bob = 0;
        }
      }
      const yy = cy(z) + seaY + 0.06 + bob - (stuck ? 0.12 : 0);
      if (s > 0.01) placePod(p, { z, ox, y: yy, absY: true, s, pitch: -0.1, dead: stuck ? 0.8 : 0, coat: stuck ? 0.6 : 0, i }, t, cam.position);
    }
    glowZ = cz - 40;
    glowS = 9;
    tu.uGlowAmt.value = 0.55;
    tu.uTint.value.setRGB(0.92, 0.95, 0.88);
  } else if (t < T.K) {
    // ── J · the wide field of the fallen; a few go on
    const z0 = -2500, seaY = -1.45;
    E.sea.visible = true;
    const su = (E.sea.material as THREE.ShaderMaterial).uniforms;
    su.uT.value = t;
    su.uY.value = seaY;
    const cz = z0 - (t - T.J) * 1.5;
    E.sea.position.z = Math.round(cz / 0.2) * 0.2 - 60;
    const up = eio(prog(t, T.J, T.K));
    tunCam(cam, cz + 1.5, -0.3, 1.25 + 0.35 * up, 5.5, 0.1, seaY + 0.2, 0.05, 54);
    su.uCam.value.copy(cam.position);
    for (let i = 0; i < 40; i++) {
      const alive = i < 6;
      const [ox] = lane(i + 600, 2.0, 0);
      const z = alive ? z0 - 1 - hsh(i, 17) * 4 - (t - T.J) * (1.7 + hsh(i, 18) * 0.5) : z0 + 1 - hsh(i, 17) * 16;
      const quit = alive && i >= 3 ? prog(t, T.few + (i - 3) * 0.25, T.few + 0.6 + (i - 3) * 0.25) : 0;
      const yy = cy(z) + seaY + (alive ? 0.08 + Math.sin(t * 2 + i) * 0.04 : -0.1 - hsh(i, 19) * 0.12);
      placePod(E.pods[i], { z: alive && quit > 0 ? z + quit * (t - T.few) * 1.7 : z, ox, y: yy, absY: true, dead: alive ? quit : 0.9, coat: alive ? quit * 0.5 : 0.7, pitch: alive ? 0 : hsh(i, 20) * 1.2, roll: alive ? 0 : (hsh(i, 21) - 0.5) * 2, i }, t, cam.position);
    }
    glowZ = cz - 38;
    glowS = 8 + 10 * eo(prog(t, T.eggJ, T.K));
    tu.uGlowAmt.value = 0.5 + 0.8 * eo(prog(t, T.eggJ, T.K));
    tu.uTint.value.setRGB(0.92, 0.95, 0.88);
  } else {
    // ── K · only one gets in
    const zE = -3000, eR = 1.9;
    const surf = zE + eR + 0.25;
    const camZ = surf + 10.5 - eo(prog(t, T.K, T.enter)) * 2.4 - prog(t, T.enter, T.end) * 1.4;
    tunCam(cam, camZ, 0.2, 0.25, 6, 0, -0.05, 0.03 * Math.sin(t), 50);
    E.egg.visible = true;
    center(zE, E.egg.position);
    E.egg.scale.setScalar(eR);
    E.egg.rotation.set(0.2, t * 0.04, 0);
    const eu = (E.eggBody.material as THREE.ShaderMaterial).uniforms;
    eu.uT.value = t;
    eu.uCam.value.copy(cam.position);
    eu.uGlow.value = 0.1 + (t > T.enter ? 0.9 * Math.exp(-(t - T.enter) * 1.5) + 0.35 * prog(t, T.enter, T.end) : 0);
    eu.uRip.value = t > T.enter ? (t - T.enter) * 2.2 : -10;
    eu.uRipP.value.set(0.05, 0.05, 1);
    (E.zona.material as THREE.ShaderMaterial).uniforms.uCam.value.copy(cam.position);
    for (let i = 0; i < 6; i++) {
      const lead = i === 0;
      const [ox, oy] = lead ? [0.05, 0.05] : lane(i + 700, 1.6, 0.7);
      const zs = surf + 4.5 + hsh(i, 22) * 2;
      let z: number, s = 1, dead = 0;
      if (lead) {
        const k = eio(prog(t, T.K, T.enter));
        z = zs + (surf - zs) * k;
        const sink = prog(t, T.enter, T.enter + 0.4);
        z -= sink * 0.6;
        s = 1 - eo(sink);
      } else {
        const stop = prog(t, T.one, T.one + 0.8);
        z = zs - (t - T.K) * (0.9 - 0.7 * stop);
        dead = stop * 0.8;
      }
      if (s > 0.01) placePod(E.pods[i], { z, ox: lead ? ox : ox * 1.25, oy: lead ? oy : oy * 1.1, s, dead, i }, t, cam.position);
    }
    glowZ = zE - 7;
    glowS = 22;
    tu.uTint.value.setRGB(1.05, 0.97, 0.94);
  }

  // shared: tunnel follows the camera, lights, opening glow
  const cz = cam.position.z;
  E.tunnel.position.z = Math.round(cz / (120 / 900)) * (120 / 900) - 50;
  tu.uCam.value.copy(cam.position);
  center(glowZ, V);
  tu.uGlow.value.copy(V);
  E.glow.visible = glowOn > 0;
  E.glow.position.copy(V);
  E.glow.scale.setScalar(glowS);
  E.head.position.copy(cam.position).add(V2.set(0.2, 0.4, 0));
  E.fill.position.copy(cam.position).add(V2.set(-1.2, -0.8, -2));
  E.glowL.position.copy(V);
  E.glowL.intensity = 0;
};
