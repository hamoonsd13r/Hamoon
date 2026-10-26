// V10 act 1 — «تست مردن»: intro, skydive, train, crocodile pool, gunpowder barrel, volcano, scrapbook.
import React from "react";
import { AbsoluteFill } from "remotion";
import { BLACK, Burst, clamp, Cloud, E, ease, hn, in2, lerp, mixPose, out3, P, Person, Puff, rk, S, shake, Shadow, Sky, Streaks, W, back } from "./kit";

const cam = (z: number, cx = 540, cy = 960) => `translate(540 960) scale(${z}) translate(${-cx} ${-cy})`;

// ---------------------------------------------------------------------------------------------
/** 0 · «اگه هیچ‌وقت نمی‌مردی…» — heart monitor flatlines, then jumps back; hero opens one eye and smirks. */
export const Intro: React.FC<{ t: number }> = ({ t }) => {
  const flat = W(0, "نمی‌مردی"), back_ = W(0, "چی‌کار");
  const isFlat = t >= flat + 0.1 && t < back_;
  const z = 1 + 0.06 * rk(t, 0, 3.2, (k) => k);
  // ECG trace: scrolls left, spikes every 0.8 s except while flat
  const pts: string[] = [];
  for (let x = 0; x <= 1080; x += 6) {
    const tt = t - (1080 - x) / 900;
    let y = 0;
    const ph = ((tt % 0.8) + 0.8) % 0.8;
    const flatHere = tt >= flat + 0.1 && tt < back_;
    if (!flatHere && ph > 0.3 && ph < 0.42) { const q = (ph - 0.3) / 0.12; y = q < 0.25 ? q * 160 : q < 0.5 ? 40 - (q - 0.25) * 900 : q < 0.75 ? -185 + (q - 0.5) * 900 : 40 - (q - 0.75) * 160; }
    if (tt >= back_ && tt < back_ + 0.3) y += Math.sin((tt - back_) * 60) * 160 * (1 - (tt - back_) / 0.3);
    pts.push(`${x},${520 + y}`);
  }
  const eyesOpen = t >= back_ + 0.05;
  return (
    <svg width={1080} height={1920}>
      <Sky id="i0" c={["#0d1b2a", "#1b3a4b", "#2c5d63"]} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} x2={1080} y1={300 + i * 40} y2={300 + i * 40} stroke="#3fe0a0" strokeOpacity={0.06} />)}
      {Array.from({ length: 28 }, (_, i) => <line key={"v" + i} y1={300} y2={740} x1={i * 40} x2={i * 40} stroke="#3fe0a0" strokeOpacity={0.06} />)}
      <polyline points={pts.join(" ")} fill="none" stroke={isFlat ? "#ff4d5a" : "#3fe0a0"} strokeWidth={9} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 14px ${isFlat ? "#ff4d5a" : "#3fe0a0"})` }} />
      <text x={980} y={360} textAnchor="end" fontFamily={BLACK} fontSize={64} fill={isFlat ? "#ff4d5a" : "#3fe0a0"} direction="ltr">{isFlat ? "0" : `${72 + Math.round(8 * Math.sin(t * 3))}`} <tspan fontSize={34}>BPM</tspan></text>
      <g transform={cam(z, 540, 1250)}>
        <ellipse cx={540} cy={1880} rx={330} ry={46} fill="rgba(0,0,0,.35)" />
        <Person x={540} y={1560} s={3.0} pose={mixPose(P.stand, P.hips, rk(t, back_, back_ + 0.4, back))} face={{ eye: eyesOpen ? (t > back_ + 0.5 ? "open" : "squint") : "closed", mouth: eyesOpen ? "smirk" : "flat", facing: eyesOpen ? 0.25 : 0 }} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
const Plane: React.FC<{ x: number; y: number; s?: number; door?: number }> = ({ x, y, s = 1, door = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-40 -20 L120 -150 L180 -150 L110 -20 Z" fill="#c9d3dc" />
    <path d="M300 -40 L360 -150 L400 -150 L380 -30 Z" fill="#d4423a" />
    <path d="M-220 0 Q-230 -60 -150 -62 L330 -52 Q390 -48 400 -20 L400 10 Q390 34 330 36 L-150 40 Q-230 40 -220 0 Z" fill="#eef2f5" />
    <path d="M-220 10 Q-215 40 -150 40 L330 36 Q390 34 400 10 Z" fill="#c5cfd8" />
    <path d="M-150 14 L380 8" stroke="#d4423a" strokeWidth={10} />
    {[...Array(9)].map((_, i) => <rect key={i} x={-100 + i * 44} y={-30} width={22} height={18} rx={8} fill="#36506a" />)}
    <path d="M-212 -14 Q-200 -46 -160 -48 L-160 -14 Z" fill="#36506a" />
    <rect x={230} y={-40} width={50} height={62} rx={6} fill={door ? "#1b2633" : "#d9e0e6"} />
    <path d="M20 10 L170 120 L230 120 L130 10 Z" fill="#b8c3cd" />
  </g>
);

/** 1 · skydive without a parachute → crater → thumbs up. */
export const Skydive: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(1) - 0.25;
  const jump = W(1, "هواپیما") + 0.15; // hero leaves the door
  const land = W(1, "ترک"); // impact
  const thumbs = W(1, "تو") - 0.1;
  const planeX = lerp(1300, -700, rk(t, t0, jump + 1.2, (k) => k));
  if (t < land) {
    // falling: the camera follows the hero; ground rises at the end
    const fall = rk(t, jump, jump + 0.6, in2);
    const gY = lerp(2600, 1520, rk(t, land - 0.75, land, in2));
    const heroY = t < jump ? 520 : lerp(560, 900, fall) + (t > land - 0.75 ? lerp(0, 600, rk(t, land - 0.75, land, in2)) : 0);
    const heroX = t < jump ? planeX + 255 : lerp(planeX + 255 > 0 ? 795 : 540, 540, rk(t, jump, jump + 0.8));
    const sk = 1 - rk(t, jump, jump + 0.6) * 0.0;
    const speed = 900 + 2200 * rk(t, jump, jump + 1);
    const wob = Math.sin(t * 9) * 6;
    return (
      <svg width={1080} height={1920}>
        <Sky id="s1" c={["#3d8fd9", "#8cc9f2", "#d9f0ff"]} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = ((hn(i, 2) * 2400 - (t - t0) * (t > jump ? speed * 0.55 : 180)) % 2600 + 2600) % 2600 - 300;
          return <Cloud key={i} x={hn(i) * 1080} y={y} w={260 + hn(i, 3) * 340} o={0.85} shadow="#d6e7f5" />;
        })}
        {t > jump && <Streaks t={t} speed={speed * 1.2} o={0.45 * rk(t, jump, jump + 0.5)} />}
        {t < jump + 1.4 && <Plane x={planeX} y={480} s={1.15} door={t > W(1, "هواپیما") - 0.6 ? 1 : 0} />}
        {/* ground rising */}
        <g transform={`translate(0 ${gY - 1520})`}>
          <rect x={0} y={1440} width={1080} height={900} fill="#79b552" />
          <path d="M0 1440 L1080 1440 L1080 1470 L0 1470 Z" fill="#8fc964" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={i * 170 - 30} y={1500 + (i % 3) * 120} width={140} height={90} rx={8} fill={i % 2 ? "#6aa34a" : "#8cc35c"} />)}
          {[0, 1, 2, 3].map((i) => <g key={"h" + i} transform={`translate(${90 + i * 270} 1400)`}><rect x={-40} y={-10} width={80} height={50} fill="#f3e2c4" /><path d="M-50 -10 L0 -48 L50 -10 Z" fill="#c4533a" /></g>)}
        </g>
        <g transform={`translate(${heroX} ${heroY}) rotate(${t < jump ? 0 : wob})`}>
          <Person x={0} y={0} s={t < jump ? 0.55 : lerp(0.55, 1.15, rk(t, jump, jump + 0.7)) * sk} pose={t < jump ? P.stand : mixPose(P.stand, P.spread, rk(t, jump, jump + 0.3))} face={{ eye: t < jump + 0.5 ? "open" : "wide", mouth: t < jump + 0.9 ? "smile" : "grin" }} />
        </g>
      </svg>
    );
  }
  // impact + crater
  const k = t - land;
  const [sx, sy] = shake(t, land, 40, 0.6);
  const rise = rk(t, land + 0.9, land + 1.6, back);
  const crack = rk(t, land, land + 0.35, out3);
  return (
    <svg width={1080} height={1920}>
      <g transform={`translate(${sx} ${sy}) ${cam(lerp(1.0, 1.45, rk(t, land + 0.4, land + 1.4)), 540, lerp(960, 1300, rk(t, land + 0.4, land + 1.4)))}`}>
        <Sky id="s1b" c={["#7fc0ef", "#cbe9fb", "#eaf6ff"]} />
        <Cloud x={220} y={420} w={340} o={0.9} />
        <Cloud x={860} y={300} w={260} o={0.8} />
        <path d="M0 1180 Q200 1110 420 1170 Q700 1100 1080 1160 L1080 1300 L0 1300 Z" fill="#9cc9a4" />
        {[0, 1, 2, 3].map((i) => <g key={"h" + i} transform={`translate(${100 + i * 290} 1250) scale(.8)`}><rect x={-40} y={-10} width={80} height={50} fill="#f3e2c4" /><path d="M-50 -10 L0 -48 L50 -10 Z" fill="#c4533a" /></g>)}
        <rect x={0} y={1280} width={1080} height={640} fill="#79b552" />
        <rect x={0} y={1280} width={1080} height={24} fill="#8fc964" />
        {/* cracks radiate across the field */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI + (i / 8) * Math.PI * -1;
          const len = (220 + hn(i, 4) * 420) * crack;
          let d = `M540 1520`;
          for (let s = 1; s <= 5; s++) d += ` L${540 + Math.cos(a + (hn(i * 7 + s) - 0.5) * 0.5) * (len * s) / 5} ${1520 + Math.sin(a) * -0.32 * (len * s) / 5 * (i % 2 ? 1 : -1) + (hn(s, i) - 0.5) * 22}`;
          return <path key={i} d={d} stroke="#3b2a1c" strokeWidth={9 - i * 0.4} fill="none" strokeLinejoin="bevel" />;
        })}
        <ellipse cx={540} cy={1530} rx={260 * crack} ry={70 * crack} fill="#4a3322" />
        <ellipse cx={540} cy={1520} rx={230 * crack} ry={52 * crack} fill="#2c1e14" />
        {/* hero climbs out */}
        <Person x={540} y={lerp(1700, 1532, rise)} s={1.25} pose={t > thumbs ? mixPose(P.stand, P.thumbs, rk(t, thumbs, thumbs + 0.3, back)) : P.stand} face={{ eye: t > thumbs ? "happy" : "open", mouth: t > thumbs ? "grin" : "smile", facing: 0.2 }} />
        {/* crater front lip hides the legs */}
        <path d={`M${540 - 262 * crack} 1530 Q540 ${1530 + 90 * crack} ${540 + 262 * crack} 1530 L${540 + 262 * crack} 1780 L${540 - 262 * crack} 1780 Z`} fill="#79b552" />
        <path d={`M${540 - 262 * crack} 1530 Q540 ${1530 + 90 * crack} ${540 + 262 * crack} 1530`} stroke="#5a3d26" strokeWidth={16} fill="none" />
        {[...Array(12)].map((_, i) => { const kk = clamp(k / 1.2); const a = -Math.PI * (0.1 + 0.8 * hn(i)); return <circle key={"r" + i} cx={540 + Math.cos(a) * 700 * kk * hn(i, 2)} cy={1500 + Math.sin(a) * 900 * kk + 1400 * kk * kk} r={8 + hn(i, 3) * 16} fill="#5a3d26" opacity={1 - kk} />; })}
        <Puff t={t} at={land} x={540} y={1500} n={18} c="#e6d6bd" spread={520} dur={1.7} up={220} size={90} />
        {k < 0.2 && <Burst x={540} y={1500} r={420 * out3(k / 0.2)} rot={0.3} />}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
const TrainCar: React.FC<{ x: number; y: number; rot: number; nose?: boolean }> = ({ x, y, rot, nose }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {nose ? (
      <path d="M0 -150 Q-40 -150 -150 -90 Q-260 -30 -260 10 L-260 40 L600 40 L600 -150 Z" fill="#f4f6f8" />
    ) : (
      <path d="M0 -150 L600 -150 L600 40 L0 40 Z" fill="#f4f6f8" />
    )}
    <rect x={nose ? -258 : 0} y={-10} width={nose ? 858 : 600} height={18} fill="#d4423a" />
    <rect x={nose ? -258 : 0} y={18} width={nose ? 858 : 600} height={22} fill="#c9d1d8" />
    {nose && <path d="M-60 -138 Q-150 -110 -200 -60 L-60 -60 Z" fill="#22303f" />}
    {[...Array(nose ? 7 : 9)].map((_, i) => <rect key={i} x={(nose ? 40 : 30) + i * 62} y={-112} width={42} height={46} rx={10} fill="#22303f" />)}
    <circle cx={nose ? 60 : 90} cy={48} r={24} fill="#2a2a30" /><circle cx={nose ? 480 : 510} cy={48} r={24} fill="#2a2a30" />
  </g>
);

/** 2 · hero stands on the rails, the bullet train hits him and derails. */
export const Train: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(2) - 0.2;
  const hit = W(2, "قطار", 1) - 0.05;
  const railY = 1180;
  const hx = 470;
  const v = 1700;
  const z = lerp(1.0, 1.12, rk(t, t0, hit, (k) => k));
  const camY = 1080;
  const [sx, sy] = shake(t, hit, 34, 0.7);
  const cars = [0, 1, 2, 3].map((i) => {
    const front = hx + 46 + i * 640 + (i ? 260 : 0);
    const hitI = hit + i * 0.16;
    if (t < hitI) return { x: front + (hitI - t) * v + (i ? i * 0 : 0), y: railY - 40, r: 0 };
    const k = t - hitI;
    const dir = i % 2 ? 1 : -1;
    return { x: front - 900 * k - i * 250 * k, y: railY - 40 - (2600 - i * 300) * k + 1800 * k * k, r: dir * (160 + i * 40) * k };
  });
  return (
    <svg width={1080} height={1920}>
      <g transform={`translate(${sx} ${sy}) ${cam(z, 540, camY)}`}>
        <Sky id="s2" c={["#f6b56b", "#ffd9a0", "#fff1d6"]} />
        <circle cx={800} cy={620} r={110} fill="#fff4d0" />
        <path d="M-200 940 L150 720 L380 880 L620 660 L900 870 L1300 700 L1300 1100 L-200 1100 Z" fill="#c98a6a" />
        <path d="M-200 1000 L300 860 L600 980 L1000 840 L1300 960 L1300 1100 L-200 1100 Z" fill="#a8705a" />
        <rect x={-300} y={1080} width={1700} height={1100} fill="#d9a066" />
        {[...Array(14)].map((_, i) => <rect key={i} x={-300 + i * 130 - ((t * 0) % 130)} y={railY + 10} width={60} height={22} fill="#6b4a33" />)}
        <rect x={-300} y={railY - 4} width={1700} height={12} fill="#7c838c" />
        <rect x={-300} y={railY + 34} width={1700} height={10} fill="#5f666e" />
        {[...Array(5)].map((_, i) => <g key={"p" + i}><rect x={-100 + i * 320} y={870} width={10} height={230} fill="#5b4636" /><path d={`M${-95 + i * 320} 880 Q${65 + i * 320} 920 ${225 + i * 320} 880`} stroke="#3a2c22" strokeWidth={3} fill="none" /></g>)}
        <Shadow x={hx} y={railY + 6} w={70} />
        <Person x={hx} y={railY - 140} s={1.12} pose={t < hit + 0.2 ? P.cross : mixPose(P.cross, P.hips, rk(t, hit + 0.6, hit + 1))} face={{ shades: true, mouth: t < hit ? "smirk" : t < hit + 0.8 ? "flat" : "smirk", facing: 0.35 }} />
        {cars.map((c, i) => <TrainCar key={i} x={c.x} y={c.y} rot={c.r} nose={i === 0} />).reverse()}
        {t >= hit && t < hit + 0.25 && <Burst x={hx + 40} y={railY - 220} r={300 * out3((t - hit) / 0.25)} />}
        <Puff t={t} at={hit} x={hx + 60} y={railY - 60} n={14} c="#efe1c8" spread={420} dur={1.4} up={160} size={80} />
        {t < hit && t > hit - 0.7 && <Streaks t={t} horiz o={0.35} speed={3200} c="#fff8e0" />}
        {t < hit && <ellipse cx={1150} cy={railY - 90} rx={260} ry={120} fill="#fff6c8" opacity={0.55 * rk(t, hit - 1.4, hit - 0.3)} />}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
const Croc: React.FC<{ x: number; y: number; s?: number; flip?: boolean; jaw: number; teeth?: number; dizzy?: number; t: number }> = ({ x, y, s = 1, flip, jaw, teeth = 1, dizzy = 0, t }) => {
  const g = "#4f8a3c", d = "#3b6e2c", belly = "#c9d98a";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* lower jaw */}
      <g transform={`rotate(${jaw * 26} -40 10)`}>
        <path d="M-40 10 L240 30 Q262 34 258 54 L-40 70 Z" fill={belly} />
        {teeth > 0 && [...Array(7)].map((_, i) => <path key={i} d={`M${10 + i * 34} 28 l10 -20 l10 20 Z`} fill="#fff" opacity={i < teeth * 7 ? 1 : 0} />)}
      </g>
      {/* upper jaw */}
      <g transform={`rotate(${-jaw * 14} -40 0)`}>
        <path d="M-120 -40 Q-60 -90 20 -70 L250 -10 Q275 0 262 18 L-40 18 Z" fill={g} />
        {teeth > 0 && [...Array(7)].map((_, i) => <path key={i} d={`M${20 + i * 34} 18 l10 22 l10 -22 Z`} fill="#fff" opacity={i < teeth * 7 ? 1 : 0} />)}
        <circle cx={240} cy={-14} r={5} fill={d} />
        <g transform="translate(-10 -78)">
          <ellipse cx={0} cy={0} rx={34} ry={28} fill={g} />
          <ellipse cx={4} cy={-2} rx={20} ry={18} fill="#f4f1c4" />
          {dizzy > 0 ? <path d={`M4 -2 m-10 0 a10 10 0 1 0 20 0 a7 7 0 1 0 -14 0`} transform={`rotate(${t * 720} 4 -2)`} stroke="#2a2a2a" strokeWidth={3.5} fill="none" /> : <ellipse cx={10} cy={-2} rx={5} ry={13} fill="#1c1c1c" />}
        </g>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${40 + i * 50} -58 l14 -14 l14 14`} fill={d} />)}
      </g>
    </g>
  );
};
const Water: React.FC<{ y: number; t: number; c1: string; c2: string; front?: boolean }> = ({ y, t, c1, c2, front }) => {
  let d = `M0 ${y}`;
  for (let x = 0; x <= 1080; x += 40) d += ` L${x} ${y + Math.sin(x / 70 + t * (front ? 4 : 3)) * (front ? 12 : 8)}`;
  return <path d={`${d} L1080 1920 L0 1920 Z`} fill={front ? c2 : c1} opacity={front ? 0.82 : 1} />;
};

/** 3 · dive into the crocodile pool → they bite → their teeth shatter. */
export const Crocs: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(3) - 0.2;
  const splash = W(3, "تمساح") + 0.05;
  const bite = W(3, "دندون") - 0.1;
  const crack = W(3, "می‌شکنه") + 0.05;
  if (t < splash + 0.35) {
    // wide: board on the left, arc into the green pool
    const k = rk(t, t0 + 0.25, splash, (q) => q);
    const hx = lerp(240, 600, k), hy = lerp(560, 1350, k) - Math.sin(k * Math.PI) * 300;
    return (
      <svg width={1080} height={1920}>
        <Sky id="s3" c={["#2a6f6b", "#5aa58e", "#b9dcb6"]} />
        <path d="M0 900 Q300 840 540 880 Q800 830 1080 880 L1080 1240 L0 1240 Z" fill="#2f5d3a" />
        {[...Array(8)].map((_, i) => <path key={i} d={`M${i * 150} 1000 q30 -150 60 -160 q-10 80 20 150 Z`} fill="#1f4a2c" />)}
        <rect x={0} y={1180} width={1080} height={740} fill="#3d5a44" />
        <Water y={1260} t={t} c1="#2e7a5a" c2="#2e7a5a" />
        <rect x={40} y={560} width={300} height={26} rx={8} fill="#e8e1d4" />
        <rect x={60} y={586} width={22} height={620} fill="#b8b2a6" />
        <Croc x={170} y={1300} s={1.1} jaw={0.25 + 0.25 * Math.sin(t * 6)} t={t} />
        <Croc x={930} y={1330} s={1.15} flip jaw={0.3 + 0.25 * Math.sin(t * 5 + 1)} t={t} />
        <Croc x={380} y={1500} s={1.3} jaw={0.4 + 0.3 * Math.sin(t * 7)} t={t} />
        <Croc x={900} y={1640} s={1.2} flip jaw={0.5 + 0.3 * Math.sin(t * 6 + 2)} t={t} />
        {t < splash ? (
          <Person x={hx} y={hy} s={0.85} rot={t < t0 + 0.25 ? 0 : lerp(0, 160, k)} pose={t < t0 + 0.25 ? P.stand : P.dive} face={{ eye: "happy", mouth: "grin" }} />
        ) : null}
        <Water y={1300} t={t} c1="#3d9a74" c2="#3d9a74" front />
        {t >= splash && [...Array(16)].map((_, i) => { const q = (t - splash) / 0.6; const a = -Math.PI / 2 + (hn(i) - 0.5) * 1.6; return <circle key={i} cx={600 + Math.cos(a) * 260 * q} cy={1330 + Math.sin(a) * 420 * q + 600 * q * q} r={12 + hn(i, 2) * 14} fill="#bfeee0" opacity={1 - q} />; })}
      </svg>
    );
  }
  // close: hero in the water, three crocs bite, teeth fly
  const closeJ = (i: number) => (t < bite + i * 0.08 ? 0.9 + 0.1 * Math.sin(t * 8 + i) : t < crack ? 0.05 : rk(t, crack, crack + 0.3) * 0.75);
  const dz = rk(t, crack + 0.1, crack + 0.4);
  const [sx, sy] = shake(t, crack, 22, 0.5);
  return (
    <svg width={1080} height={1920}>
      <g transform={`translate(${sx} ${sy})`}>
        <Sky id="s3b" c={["#24605c", "#3f8a78", "#7cbf9f"]} />
        <rect x={0} y={860} width={1080} height={1060} fill="#2e7a5a" />
        <Water y={880} t={t} c1="#2e7a5a" c2="#2e7a5a" />
        <Person x={540} y={1020} s={1.35} pose={t < crack + 0.3 ? P.stand : mixPose(P.stand, P.shrug, rk(t, crack + 0.3, crack + 0.6, back))} face={{ eye: t < crack ? "squint" : "open", mouth: t < crack ? "flat" : "smirk", facing: 0 }} />
        <Croc x={150} y={880 - dz * 40} s={1.0} jaw={closeJ(0)} teeth={t < crack ? 1 : 0} dizzy={dz} t={t} />
        <Croc x={930} y={890 - dz * 30} s={1.0} flip jaw={closeJ(1)} teeth={t < crack ? 1 : 0} dizzy={dz} t={t} />
        <Water y={990} t={t} c1="#3d9a74" c2="#3d9a74" front />
        {t >= crack && [...Array(28)].map((_, i) => {
          const q = clamp((t - crack) / 1.1);
          const side = i % 2 ? 1 : -1;
          const a = -Math.PI / 2 + side * (0.3 + hn(i) * 1.1);
          const sp = 900 + hn(i, 2) * 900;
          return <path key={i} d="M0 -26 L18 18 L-18 18 Z" fill="#fff" transform={`translate(${540 + side * 150 + Math.cos(a) * sp * q} ${830 + Math.sin(a) * sp * q + 1500 * q * q}) rotate(${hn(i, 3) * 720 * q})`} opacity={1 - q * 0.6} />;
        })}
        {t >= crack && t < crack + 0.18 && <><Burst x={390} y={810} r={170} n={10} /><Burst x={690} y={810} r={170} n={10} rot={0.4} /></>}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
/** 4 · sitting on a gunpowder barrel, lights the fuse → boom → eyebrows burn off. */
export const Barrel: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(4) - 0.2;
  const match = W(4, "فتیله") - 0.1, lit = W(4, "روشن") + 0.1, boom = W(4, "فقط") - 0.05;
  const brow = W(4, "ابروهات"), gone = W(4, "می‌سوزه") + 0.25;
  const fuseK = rk(t, lit, boom, (k) => k);
  const z = t < boom ? lerp(1, 1.08, rk(t, t0, boom, (k) => k)) : lerp(1.0, 2.5, rk(t, boom + 0.55, brow, ease));
  const [sx, sy] = shake(t, boom, 50, 0.8);
  const smoke = rk(t, boom, boom + 0.9);
  const fusePath = "M640 1300 Q760 1290 760 1380 Q760 1460 700 1500";
  const after = t >= boom;
  const browFire = after && t >= brow && t < gone;
  return (
    <svg width={1080} height={1920}>
      <g transform={`translate(${sx} ${sy}) ${cam(z, 540, after ? lerp(1300, 1540, rk(t, boom + 0.55, brow, ease)) : 1150)}`}>
        <Sky id="s4" c={["#5a2d5a", "#c45a4a", "#f2a65a"]} />
        <path d="M-200 1250 L120 900 L260 1100 L420 860 L700 1180 L900 940 L1300 1250 Z" fill="#8a4a3c" />
        <rect x={-300} y={1500} width={1700} height={700} fill="#c47a4a" />
        <path d="M-300 1500 L1400 1500 L1400 1530 L-300 1530 Z" fill="#d68a56" />
        {!after && (
          <g>
            <Shadow x={540} y={1690} w={190} o={0.3} />
            <path d="M380 1320 Q370 1500 390 1680 L690 1680 Q710 1500 700 1320 Z" fill="#8a5a34" />
            {[0, 1].map((i) => <rect key={i} x={378} y={1380 + i * 220} width={326} height={22} fill="#4a3a30" />)}
            <ellipse cx={540} cy={1320} rx={160} ry={34} fill="#a66e40" />
            <text x={540} y={1540} textAnchor="middle" fontFamily={BLACK} fontSize={64} fill="#2a1a10" direction="rtl">باروت</text>
            <path d={fusePath} stroke="#3a2a20" strokeWidth={8} fill="none" />
            <path d={fusePath} stroke="#1a1410" strokeWidth={9} fill="none" pathLength={1} strokeDasharray={`${fuseK} 1`} />
          </g>
        )}
        {!after && t > lit && (() => {
          // spark travelling along the fuse (approximate point on the path)
          const q = fuseK;
          const px = q < 0.5 ? lerp(640, 760, q * 2) : lerp(760, 700, (q - 0.5) * 2), py = q < 0.5 ? lerp(1300, 1380, q * 2) : lerp(1380, 1500, (q - 0.5) * 2);
          return <g>{[...Array(9)].map((_, i) => <path key={i} d={`M${px} ${py} l${Math.cos(i + t * 40) * 26} ${Math.sin(i * 2 + t * 33) * 26}`} stroke="#ffd04a" strokeWidth={4} strokeLinecap="round" />)}<circle cx={px} cy={py} r={10} fill="#fff6c8" /></g>;
        })()}
        {/* the hero: on the barrel before, on the scorched ground after */}
        <Person x={540} y={after ? 1690 : 1325} s={after ? 1.15 : 1.05} pose={after ? P.sitFront : t > match ? { ...P.sitFront, armR: [70, 120] } : P.sitFront}
          face={after ? { soot: 1, eye: t > brow + 0.1 ? (Math.floor(t * 3) % 3 === 0 ? "closed" : "open") : "wide", mouth: "flat", brows: t < gone ? 1 : 0 } : { eye: "happy", mouth: t > lit ? "grin" : "smile", facing: 0.3 }} spiky={0} />
        {!after && t > match && t < lit + 0.3 && <g transform={`translate(${540 + 110} ${1325 - 190})`}><rect x={-4} y={-6} width={8} height={70} fill="#e8d6b0" /><circle cx={0} cy={-12} r={9} fill="#ff6a2a" /><circle cx={0} cy={-16} r={6} fill="#ffd04a" /></g>}
        {browFire && [-1, 1].map((sg) => <g key={sg}>{[0, 1, 2].map((i) => <path key={i} d={`M${540 + sg * 23 + (i - 1) * 7} ${1690 - 125 * 1.15 - 62 * 1.15 - 24} q${-6 + Math.sin(t * 30 + i) * 4} -16 0 -${26 + i * 6} q8 12 0 ${26 + i * 6}`} fill={i === 1 ? "#ffd04a" : "#ff7a2a"} />)}</g>)}
        {after && t >= gone && t < gone + 0.6 && [-1, 1].map((sg) => <circle key={sg} cx={540 + sg * 23} cy={1690 - 144 - 71 - 30 - (t - gone) * 80} r={10 + (t - gone) * 30} fill="#888" opacity={0.6 * (1 - (t - gone) / 0.6)} />)}
        {after && <Puff t={t} at={boom} x={540} y={1500} n={22} c="#5a5250" spread={700} dur={1.4} up={300} size={140} />}
      </g>
      {after && t < boom + 0.12 && <rect width={1080} height={1920} fill="#fff8e0" opacity={1 - (t - boom) / 0.12} />}
      {after && t < boom + 0.35 && <Burst x={540} y={1250} r={700 * out3((t - boom) / 0.35)} n={14} />}
      {after && <rect width={1080} height={1920} fill="#2a2420" opacity={0.25 * (1 - smoke)} />}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
/** 5 · sunbathing on the crater rim of a volcano. */
export const Volcano: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(5) - 0.2;
  const close = W(5, "آتشفشان") - 0.2;
  const sun = W(5, "آفتاب");
  if (t < close) {
    const z = lerp(1, 1.25, rk(t, t0, close, (k) => k));
    return (
      <svg width={1080} height={1920}>
        <g transform={cam(z, 540, 1000)}>
          <Sky id="s5" c={["#2a1a2e", "#7a2e2e", "#e0663a"]} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={540 + Math.sin(t + i) * 40 + i * 10} cy={700 - i * 110 - ((t * 60) % 110)} r={70 + i * 30} fill="#3a2a2e" opacity={0.7 - i * 0.1} />)}
          <path d="M60 1500 L420 820 L660 820 L1020 1500 Z" fill="#3b2a2a" />
          <path d="M420 820 Q540 860 660 820 L640 860 Q540 890 440 860 Z" fill="#ff7a2a" />
          <path d="M470 850 Q500 1000 460 1150 Q520 1050 540 860 Z" fill="#ff5a1a" opacity={0.85} />
          {(() => { const q = rk(t, t0, close, (k) => k); const px = lerp(250, 445, q), py = lerp(1390, 860, q); return <g><Person x={px} y={py} s={0.32} rot={-22} pose={{ ...P.stand, armR: [150, 20], legL: [-25 + Math.sin(t * 9) * 18, 10], legR: [20 - Math.sin(t * 9) * 18, -5] }} /><rect x={px + 6} y={py - 70} width={46} height={10} fill="#3aa7c9" transform={`rotate(-30 ${px} ${py})`} /></g>; })()}
          <rect x={-100} y={1480} width={1300} height={600} fill="#2a1e1e" />
          <path d="M-100 1480 L1200 1480 L1200 1500 L-100 1500 Z" fill="#4a3030" />
        </g>
      </svg>
    );
  }
  const lavaY = 1500;
  const bub = (i: number) => { const p = ((t + hn(i) * 3) % 1.4) / 1.4; return { x: 120 + hn(i, 2) * 840, r: 10 + 50 * Math.sin(p * Math.PI), o: p < 0.9 ? 1 : 0 }; };
  const flip = rk(t, sun - 0.1, sun + 0.2);
  return (
    <svg width={1080} height={1920}>
      <defs><radialGradient id="lv" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#ffd25a" /><stop offset="0.4" stopColor="#ff7a1a" /><stop offset="1" stopColor="#a0200a" /></radialGradient></defs>
      <Sky id="s5b" c={["#3a1a22", "#a33a2a", "#ff8a3a"]} />
      {[...Array(14)].map((_, i) => <circle key={i} cx={hn(i) * 1080} cy={((hn(i, 2) * 1400 - t * 80 * (0.5 + hn(i, 3))) % 1400 + 1400) % 1400} r={3 + hn(i, 4) * 4} fill="#ffb05a" opacity={0.7} />)}
      <rect x={0} y={lavaY} width={1080} height={420} fill="url(#lv)" />
      {[...Array(7)].map((_, i) => { const b = bub(i); return <circle key={i} cx={b.x} cy={lavaY + 30} r={b.r} fill="#ffcf5a" opacity={b.o} />; })}
      {/* rocky rim */}
      <path d="M0 1080 Q200 1040 420 1090 L620 1120 Q860 1080 1080 1120 L1080 1300 Q820 1340 540 1320 Q260 1300 0 1330 Z" fill="#3a2626" />
      <path d="M0 1330 Q260 1300 540 1320 Q820 1340 1080 1300 L1080 1380 Q800 1420 540 1400 Q260 1380 0 1420 Z" fill="#2a1a1a" />
      {/* lounge chair */}
      <g transform="translate(540 1150)">
        <path d="M-230 40 L180 40 L260 -60" stroke="#e8e0d0" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M-230 40 L-250 110 M150 40 L170 110" stroke="#c8beb0" strokeWidth={12} strokeLinecap="round" />
        <path d="M-230 30 L180 30 L250 -60 L240 -66 L172 18 L-230 18 Z" fill="#3aa7c9" />
      </g>
      <Person x={600} y={1110} s={1.05} rot={-74} pose={{ armL: [-150, -170], armR: [160, 175], legL: [-6, 0], legR: [4, 0], head: 50 }} face={{ shades: flip > 0.5, eye: "closed", mouth: "smile", facing: 0.4 }} />
      {/* drink */}
      <g transform="translate(860 1120)"><path d="M-22 -60 L22 -60 L14 0 L-14 0 Z" fill="rgba(255,255,255,.55)" /><path d="M-19 -40 L19 -40 L14 0 L-14 0 Z" fill="#ff8a3a" /><path d="M6 -60 L20 -96" stroke="#ff4d8a" strokeWidth={5} /></g>
      {/* heat haze */}
      <rect x={0} y={1380} width={1080} height={140} fill="#ff7a2a" opacity={0.12 + 0.05 * Math.sin(t * 6)} />
      {/* lava splash that lands next to him */}
      {(() => { const sp = W(5, "می‌گیری"); const q = (t - sp + 0.5) / 0.7; if (q < 0 || q > 1.3) return null; const qq = Math.min(q, 1); return <circle cx={lerp(300, 420, qq)} cy={lavaY - Math.sin(qq * Math.PI) * 520 + (q > 1 ? 0 : 0) - (q >= 1 ? 380 : 0)} r={q >= 1 ? 22 * (1.3 - q) * 3 : 22} fill="#ffcf5a" />; })()}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
/** 6 · «بهترین سال عمرت» — scrapbook polaroids of the stunts + selfie, confetti. */
export const Scrapbook: React.FC<{ t: number; scenes: { R: React.FC<{ t: number }>; at: number; cy: number }[] }> = ({ t, scenes }) => {
  const t0 = S(6) - 0.25;
  const pos = [[290, 470, -8], [790, 520, 7], [270, 1080, 6], [800, 1120, -6]];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #c98d5a 0%, #8a5634 100%)", overflow: "hidden" }}>
      {[...Array(30)].map((_, i) => <div key={"w" + i} style={{ position: "absolute", left: 0, top: i * 66, width: 1080, height: 2, background: "rgba(60,30,10,.18)" }} />)}
      {scenes.map((s, i) => {
        const k = rk(t, t0 + i * 0.12, t0 + i * 0.12 + 0.35, back);
        const [x, y, r] = pos[i];
        const R = s.R;
        return (
          <div key={i} style={{ position: "absolute", left: x - 230, top: y - 270 - (1 - k) * 900, width: 460, height: 540, background: "#fbf8f1", transform: `rotate(${r + (1 - k) * 25}deg)`, boxShadow: "0 18px 40px rgba(0,0,0,.45)", opacity: k > 0 ? 1 : 0 }}>
            <div style={{ position: "absolute", left: 22, top: 22, width: 416, height: 416, overflow: "hidden", background: "#000" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${416 / 1080}) translate(0, ${-(s.cy - 540)}px)`, transformOrigin: "0 0" }}>
                <R t={s.at} />
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
        <svg width={1080} height={1920}>
          {[...Array(60)].map((_, i) => {
            const q = t - t0 - 0.2;
            if (q < 0) return null;
            const x = 540 + (hn(i) - 0.5) * 1300 * out3(clamp(q / 0.8)), y = 900 - 700 * out3(clamp(q / 0.6)) * hn(i, 2) + 900 * q * q;
            return <rect key={i} x={x} y={y} width={18} height={10} fill={["#ff4d5a", "#ffd04a", "#3fc1ff", "#3fe0a0", "#ff8ad8"][i % 5]} transform={`rotate(${hn(i, 3) * 360 + q * 600} ${x} ${y})`} />;
          })}
          <g transform={`translate(0 ${(1 - rk(t, t0 + 0.4, t0 + 0.8, back)) * 900})`}>
            <Person x={540} y={1760} s={1.5} pose={P.thumbs} face={{ eye: "happy", mouth: "grin", facing: 0.2 }} />
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
export const ACT1_END = E(6);
