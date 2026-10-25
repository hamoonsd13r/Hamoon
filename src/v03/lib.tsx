// V03 · "آخرین شبِ شهر" — shadow-noir kit: palette, easing, seeded noise and the living layers (grain, rain, dust, vignette).
import React from "react";

export const W = 1080, H = 1920, FPS = 30;

// one family: cold night steel + emergency red. Amber only for memories / warm lamps.
export const C = {
  ink: "#04060b",
  night: "#070c18",
  navy: "#0f1a30",
  steel: "#22324f",
  dusk: "#3a4f74",
  moon: "#9fb7d9",
  glow: "#dcefff",
  phone: "#bfe3ff",
  red: "#e0242f",
  blood: "#5c0910",
  ember: "#ff5a3c",
  amber: "#e9a54b",
  bone: "#efe9df",
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const easeIn = (k: number) => Math.pow(clamp(k), 3);
export const easeInOut = (k: number) => { const x = clamp(k); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// deterministic randomness
export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
// smooth 1D value noise in [-1, 1]
export const noise = (x: number, seed = 1) => {
  const h = (n: number) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
};
// light that breathes / buzzes; 1 = steady
export const flicker = (t: number, seed = 3, depth = 0.25) => {
  const n = noise(t * 9, seed) * 0.5 + noise(t * 23, seed + 9) * 0.5;
  const drop = noise(t * 2.3, seed + 4) > 0.82 ? 0.5 : 1;
  return clamp(1 - depth * Math.abs(n)) * drop;
};

// Slow push-in + handheld drift. Wrap a scene's <g> with it.
export const Cam: React.FC<{ t: number; dur: number; from?: number; to?: number; ox?: number; oy?: number; shake?: number; pan?: [number, number]; children: React.ReactNode }> = ({ t, dur, from = 1, to = 1.08, ox = W / 2, oy = H / 2, shake = 1, pan = [0, 0], children }) => {
  const k = easeInOut(t / Math.max(dur, 0.01));
  const s = lerp(from, to, k);
  const dx = noise(t * 0.6, 11) * 6 * shake + pan[0] * k;
  const dy = noise(t * 0.5, 23) * 5 * shake + pan[1] * k;
  return <g transform={`translate(${ox + dx} ${oy + dy}) scale(${s}) translate(${-ox} ${-oy})`}>{children}</g>;
};

export const Vignette: React.FC<{ k?: number; id?: string }> = ({ k = 0.85, id = "vig" }) => (
  <>
    <defs>
      <radialGradient id={id} cx="50%" cy="48%" r="72%">
        <stop offset="45%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity={k} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} />
  </>
);

// animated film grain (cheap: two turbulence seeds alternate)
export const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.09 }) => {
  const seed = Math.floor(t * 24) % 6;
  return (
    <>
      <defs>
        <filter id={`grain${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={W} height={H} filter={`url(#grain${seed})`} opacity={o} style={{ mixBlendMode: "overlay" }} />
    </>
  );
};

export const Rain: React.FC<{ t: number; n?: number; o?: number; color?: string; slant?: number; speed?: number; seed?: number; len?: number }> = ({ t, n = 140, o = 0.35, color = C.moon, slant = 0.18, speed = 2600, seed = 7, len = 70 }) => {
  const r = rng(seed);
  const drops = Array.from({ length: n }, () => ({ x: r() * (W + 400) - 200, y0: r() * H, z: 0.4 + r() * 0.6 }));
  return (
    <g opacity={o}>
      {drops.map((d, i) => {
        const y = ((d.y0 + t * speed * d.z) % (H + 200)) - 100;
        const x = d.x + y * slant;
        const l = len * d.z;
        return <line key={i} x1={x} y1={y} x2={x + l * slant} y2={y + l} stroke={color} strokeWidth={1.2 + d.z * 1.6} strokeOpacity={0.3 + d.z * 0.7} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Dust: React.FC<{ t: number; n?: number; color?: string; o?: number; seed?: number; box?: [number, number, number, number] }> = ({ t, n = 40, color = C.glow, o = 0.5, seed = 5, box = [0, 0, W, H] }) => {
  const r = rng(seed);
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const x = box[0] + r() * box[2] + noise(t * 0.3 + i, seed) * 40;
        const y = box[1] + ((r() * box[3] - t * (8 + r() * 14)) % box[3] + box[3]) % box[3];
        const s = 1 + r() * 2.5;
        return <circle key={i} cx={x} cy={y} r={s} fill={color} opacity={0.3 + 0.7 * Math.abs(noise(t * 0.8 + i * 3, 2))} />;
      })}
    </g>
  );
};

// soft radial light pool
export const Glow: React.FC<{ id: string; cx: number; cy: number; r: number; color: string; o?: number; sy?: number }> = ({ id, cx, cy, r, color, o = 1, sy = 1 }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="35%" stopColor={color} stopOpacity={0.35} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={cx} cy={cy} rx={r} ry={r * sy} fill={`url(#${id})`} opacity={o} style={{ mixBlendMode: "screen" }} />
  </>
);

// rim light: a coloured sliver just inside the lit edge of a black silhouette. dx/dy point TOWARD the light (px).
export const RimDefs: React.FC<{ id: string; color: string; dx: number; dy: number; w?: number; blur?: number }> = ({ id, color, dx, dy, w = 3, blur = 1.2 }) => (
  <defs>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feOffset in="SourceAlpha" dx={-dx * w / 3} dy={-dy * w / 3} result="away" />
      <feComposite in="SourceAlpha" in2="away" operator="out" result="edge" />
      <feGaussianBlur in="edge" stdDeviation={blur} result="soft" />
      <feFlood floodColor={color} />
      <feComposite in2="soft" operator="in" result="rim" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="rim" />
        <feMergeNode in="rim" />
      </feMerge>
    </filter>
  </defs>
);

// whip-in: the first frames of a shot slide in with horizontal motion blur (use on hard, energetic cuts)
export const Whip: React.FC<{ id: string; t: number; dir?: number; len?: number; children: React.ReactNode }> = ({ id, t, dir = 1, len = 0.2, children }) => {
  const k = 1 - easeOut(clamp(t / len));
  if (k <= 0.001) return <>{children}</>;
  return (
    <g>
      <defs><filter id={`${id}wb`} x="-30%" y="-5%" width="160%" height="110%"><feGaussianBlur stdDeviation={`${k * 48} 0`} /></filter></defs>
      <g filter={`url(#${id}wb)`} transform={`translate(${dir * k * 320} 0)`}>{children}</g>
    </g>
  );
};
