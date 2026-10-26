// V10 act 3 — تا آخر دنیا: AI purge, laser / missile / nanobots / A-bomb, spiky hair, jungle, red giant,
// black hole spaghetti, dying stars, evaporating black holes, atoms falling apart, the void, forever.
import React from "react";
import { BLACK, Burst, clamp, ease, hn, in2, lerp, Look, mixColor, mixPose, out3, P, Person, Puff, rk, S, shake, Shadow, Sky, Stars, W, back } from "./kit";

const cam = (z: number, cx = 540, cy = 960) => `translate(540 960) scale(${z}) translate(${-cx} ${-cy})`;
const CROWD: Look[] = [
  { top: "#5a8ad8", bottom: "#2a2f45", skin: "#e8b48a", hair: "#2a1a14", hairStyle: "hero" },
  { top: "#d85a7a", bottom: "#d85a7a", skin: "#f3c9a8", hair: "#1a1410", hairStyle: "long", dress: true },
  { top: "#4ab08a", bottom: "#33334a", skin: "#c98e64", hair: "#1a1410", hairStyle: "bald" },
  { top: "#9a6ad8", bottom: "#9a6ad8", skin: "#f1c39d", hair: "#a8642a", hairStyle: "bun", dress: true },
  { top: "#e0603a", bottom: "#2a3a5a", skin: "#a8704a", hair: "#1a1410", hairStyle: "hero" },
  { top: "#3ab0c9", bottom: "#3a2a2a", skin: "#f1c39d", hair: "#d8b25a", hairStyle: "kid", kid: true },
];

const Tower: React.FC<{ x: number; w: number; h: number; base: number; c: string; win: string; t: number; i: number; ruin?: number; vines?: number }> = ({ x, w, h, base, c, win, t, i, ruin = 0, vines = 0 }) => {
  const top = base - h;
  const broken = ruin > 0 ? `L${x + w} ${top + 40 + hn(i, 2) * 60} L${x + w * 0.7} ${top + 10} L${x + w * 0.45} ${top + 70} L${x + w * 0.2} ${top + 20} L${x} ${top + 50}` : `L${x + w} ${top + 30} Q${x + w / 2} ${top - 30} ${x} ${top + 30}`;
  return (
    <g>
      <path d={`M${x} ${base} L${x + w} ${base} ${broken} Z`} fill={c} />
      {[...Array(Math.floor(h / 60))].map((_, j) => [...Array(Math.floor(w / 40))].map((_, q) => (hn(i * 31 + j, q) > (ruin ? 0.75 : 0.35) ? <rect key={`${j}-${q}`} x={x + 12 + q * 40} y={top + 60 + j * 60} width={18} height={30} rx={3} fill={win} opacity={ruin ? 0.5 : 0.65 + 0.35 * Math.sin(t * 2 + j + q)} /> : null)))}
      {vines > 0 && [...Array(4)].map((_, v) => <path key={"v" + v} d={`M${x + 10 + v * (w / 4)} ${top + 40} q20 ${h * 0.25} -10 ${h * 0.5} q-20 ${h * 0.2} 10 ${h * 0.5 * vines}`} stroke="#3f8a3c" strokeWidth={10} fill="none" />)}
      {vines > 0 && [...Array(6)].map((_, v) => <circle key={"l" + v} cx={x + hn(i, v) * w} cy={top + 40 + hn(v, i) * h * 0.8} r={22 + hn(v, i + 2) * 20} fill="#4f9a46" />)}
    </g>
  );
};

/** red AI eye in the sky */
const AIEye: React.FC<{ x: number; y: number; r: number; open: number; t: number; look?: number }> = ({ x, y, r, open, t, look = 0 }) => (
  <g transform={`translate(${x} ${y})`} opacity={clamp(open * 3)}>
    <circle r={r * 1.6} fill="#ff2a3a" opacity={0.12 * open} />
    {[...Array(12)].map((_, i) => <path key={i} d={`M${Math.cos((i / 12) * 6.283 + t * 0.6) * r * 1.15} ${Math.sin((i / 12) * 6.283 + t * 0.6) * r * 1.15} L${Math.cos((i / 12 + 0.04) * 6.283 + t * 0.6) * r * 1.35} ${Math.sin((i / 12 + 0.04) * 6.283 + t * 0.6) * r * 1.35}`} stroke="#ff4a5a" strokeWidth={10} strokeLinecap="round" />)}
    <ellipse rx={r} ry={r * open} fill="#1a0a10" stroke="#ff4a5a" strokeWidth={8} />
    <g transform={`translate(${look * r * 0.35} ${r * 0.1 * open})`}>
      <circle r={r * 0.5 * open} fill="#ff2a3a" />
      <circle r={r * 0.22 * open} fill="#ffd0d4" />
    </g>
  </g>
);

/** 14 · year 2400: AI decides; scans; erases everyone; everyone except you. */
export const Future: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(14) - 0.2;
  const eye = W(14, "هوش"), scan = W(14, "تصمیم"), wipe = W(14, "پاک") - 0.1, you = W(14, "جز");
  const red = rk(t, eye, eye + 1);
  const crowdX = [150, 270, 390, 690, 810, 930, 210, 870];
  const z = lerp(1, 1.08, rk(t, t0, t0 + 8, (k) => k));
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(z, 540, 1000)}>
        <Sky id="f14" c={[mixColor("#1a2a4a", "#2a0a14", red), mixColor("#3a4a8a", "#5a1424", red), mixColor("#8ab0d8", "#a83a3a", red)]} />
        <Stars t={t} n={50} h={700} o={0.5} />
        {[...Array(9)].map((_, i) => <Tower key={i} x={-40 + i * 130} w={110} h={500 + hn(i, 7) * 500} base={1200} c={mixColor(i % 2 ? "#2a3a6a" : "#33447a", "#3a1424", red * 0.6)} win={mixColor("#7ae8ff", "#ff6a7a", red)} t={t} i={i} />)}
        {[0, 1, 2].map((i) => { const x = ((hn(i) * 1400 + t * (220 + i * 90)) % 1500) - 200; return <g key={i} transform={`translate(${x} ${560 + i * 140})`}><rect x={-40} y={-12} width={80} height={24} rx={12} fill="#cfd8e8" /><rect x={-20} y={-24} width={40} height={14} rx={7} fill="#7ae8ff" opacity={0.8} /><circle cx={-44} cy={0} r={6} fill={mixColor("#7ae8ff", "#ff4a5a", red)} /></g>; })}
        <rect x={-100} y={1200} width={1300} height={800} fill={mixColor("#2a2f45", "#2a141c", red)} />
        <rect x={-100} y={1200} width={1300} height={14} fill={mixColor("#7ae8ff", "#ff4a5a", red)} opacity={0.6} />
        <AIEye x={540} y={520} r={150} open={rk(t, eye, eye + 0.5, back)} t={t} look={t > you ? 0 : Math.sin(t * 1.5)} />
        {/* scan beam */}
        {t > scan && t < wipe + 0.6 && (() => { const sx = 540 + Math.sin((t - scan) * 2.2) * 420; return <path d={`M540 560 L${sx - 90} 1260 L${sx + 90} 1260 Z`} fill="#ff2a3a" opacity={0.22} />; })()}
        {CROWD.concat(CROWD.slice(0, 2)).map((L, i) => {
          const at = wipe + i * 0.08;
          const gone = rk(t, at, at + 0.35);
          return (
            <g key={i}>
              {gone < 1 && <Person x={crowdX[i]} y={1180 + (i > 5 ? 60 : 0)} s={0.55} look={L} pose={P.stand} face={{ eye: t > scan ? "wide" : "open", mouth: t > scan ? "o" : "smile", facing: (540 - crowdX[i]) / 600 }} op={1 - gone} />}
              {t > at && t < at + 1 && [...Array(14)].map((_, q) => <rect key={q} x={crowdX[i] - 30 + hn(i, q) * 60} y={1180 + (i > 5 ? 60 : 0) - 160 * hn(q, i) - (t - at) * 500 * (0.4 + hn(q, i + 3))} width={14} height={14} fill={q % 2 ? L.top : "#ff4a5a"} opacity={1 - (t - at)} />)}
            </g>
          );
        })}
        <Person x={540} y={1210} s={0.62} pose={t > you ? P.wave : P.stand} face={{ eye: t > wipe ? "wide" : "open", mouth: t > you + 0.2 ? "smirk" : "flat", facing: 0 }} />
        {t > you && <g transform={`translate(540 1110) scale(${rk(t, you, you + 0.3, back)}) rotate(${t * 60})`}><circle r={120} fill="none" stroke="#ff4a5a" strokeWidth={6} strokeDasharray="30 18" /><path d="M-150 0 L-100 0 M100 0 L150 0 M0 -150 L0 -100 M0 100 L0 150" stroke="#ff4a5a" strokeWidth={6} /></g>}
      </g>
    </svg>
  );
};

const Drone: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 4) * 10}) scale(${s})`}>
    <rect x={-70} y={-18} width={140} height={36} rx={18} fill="#2a2e3a" />
    <circle cx={0} cy={4} r={14} fill="#ff2a3a" />
    {[-1, 1].map((sg) => <g key={sg}><rect x={sg * 70 - 6} y={-30} width={12} height={20} fill="#2a2e3a" /><ellipse cx={sg * 70} cy={-34} rx={46 * Math.abs(Math.cos(t * 40))} ry={6} fill="#8a90a0" opacity={0.7} /></g>)}
  </g>
);
const Missile: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    {[...Array(6)].map((_, i) => <circle key={i} cx={90 + i * 40} cy={(hn(i + Math.floor(t * 20)) - 0.5) * 16} r={16 + i * 6} fill="#cfc8c0" opacity={0.7 - i * 0.1} />)}
    <path d="M70 -12 L90 -12 L90 12 L70 12 Z" fill="#ff9a2a" />
    <path d="M-80 -20 Q-120 0 -80 20 L70 20 L70 -20 Z" fill="#e8e4dc" />
    <path d="M30 -20 L70 -48 L70 -20 Z M30 20 L70 48 L70 20 Z" fill="#d4423a" />
    <rect x={-40} y={-20} width={14} height={40} fill="#d4423a" />
  </g>
);

/** 15 · laser, missile, nanobots in your veins, finally an A-bomb. */
export const Attacks: React.FC<{ t: number }> = ({ t }) => {
  const laser = W(15, "لیزر"), missile = W(15, "موشک"), nano = W(15, "نانوربات"), bomb = W(15, "آخرش");
  const ruinBg = (id: string) => (
    <>
      <Sky id={id} c={["#1a0a10", "#4a141c", "#8a2a2a"]} />
      {[...Array(8)].map((_, i) => <Tower key={i} x={-60 + i * 150} w={120} h={300 + hn(i, 5) * 400} base={1230} c="#2a1418" win="#ff6a3a" t={t} i={i + 20} ruin={1} />)}
      <rect x={-100} y={1230} width={1300} height={800} fill="#2a1a1a" />
    </>
  );
  if (t < missile - 0.15) {
    const fire = laser + 0.05;
    const on = t > fire && t < missile - 0.2;
    return (
      <svg width={1080} height={1920}>
        <g transform={cam(1.1, 540, 1000)}>
          {ruinBg("a15")}
          <Drone x={230} y={540} t={t} s={1.2} />
          <Shadow x={620} y={1232} w={80} />
          <Person x={620} y={1230} s={0.95} pose={mixPose(P.stand, P.hips, rk(t, fire + 0.3, fire + 0.6))} face={{ eye: on ? "squint" : "open", mouth: "flat", facing: -0.4 }} />
          {on && <g><path d={`M230 560 L610 ${1050 + Math.sin(t * 40) * 6}`} stroke="#ff2a3a" strokeWidth={22} opacity={0.5} /><path d={`M230 560 L610 ${1050 + Math.sin(t * 40) * 6}`} stroke="#fff0f0" strokeWidth={7} />
            <path d={`M610 1050 L1100 ${700 + Math.sin(t * 30) * 30}`} stroke="#ff2a3a" strokeWidth={10} opacity={0.6} />
            <Burst x={610} y={1050} r={60 + Math.sin(t * 60) * 12} n={9} c="#fff0c8" c2="#ff4a3a" /></g>}
        </g>
      </svg>
    );
  }
  if (t < nano - 0.15) {
    const hit = missile + 0.45;
    const k = rk(t, missile - 0.15, hit, in2);
    const [sx, sy] = shake(t, hit, 40, 0.6);
    return (
      <svg width={1080} height={1920}>
        <g transform={`translate(${sx} ${sy}) ${cam(1.1, 540, 1000)}`}>
          {ruinBg("b15")}
          <Shadow x={540} y={1232} w={80} />
          <Person x={540} y={1230} s={0.95} pose={P.cross} face={{ eye: t > hit + 0.3 ? "open" : "squint", mouth: "smirk", soot: rk(t, hit, hit + 0.2) * 0.6 }} />
          {t < hit && <Missile x={lerp(1250, 600, k)} y={lerp(500, 1100, k)} r={-130 + 90} t={t} />}
          {t >= hit && t < hit + 0.3 && <Burst x={560} y={1080} r={380 * out3((t - hit) / 0.3)} n={14} />}
          <Puff t={t} at={hit} x={540} y={1120} n={18} c="#6a5a58" spread={480} dur={1.2} up={200} size={110} />
        </g>
      </svg>
    );
  }
  if (t < bomb - 0.15) {
    // inside a vein: red cells flow, nanobots crawl in, then short-circuit
    const enter = nano + 0.3, fizz = W(15, "رگ‌هات") + 0.2;
    return (
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#3a0a14" />
        <path d="M-50 640 Q540 560 1130 640 L1130 1240 Q540 1320 -50 1240 Z" fill="#a8182a" />
        <path d="M-50 640 Q540 560 1130 640" stroke="#ff6a7a" strokeWidth={18} fill="none" opacity={0.5} />
        {[...Array(16)].map((_, i) => { const x = ((hn(i) * 1300 + t * 420) % 1300) - 110; const y = 700 + hn(i, 2) * 480; return <g key={i} transform={`translate(${x} ${y}) rotate(${i * 30 + t * 40})`}><ellipse rx={60} ry={30} fill="#d8323c" /><ellipse rx={30} ry={12} fill="#b81e2a" /></g>; })}
        {[...Array(5)].map((_, i) => {
          const a = rk(t, enter + i * 0.12, enter + i * 0.12 + 0.6, out3);
          const dead = rk(t, fizz + i * 0.05, fizz + i * 0.05 + 0.3);
          const x = lerp(-120, 260 + i * 140, a), y = 900 + Math.sin(i * 2 + t * 6) * 60 + dead * (i % 2 ? 300 : -300);
          return (
            <g key={"b" + i} transform={`translate(${x} ${y}) rotate(${dead * 200 * (i % 2 ? 1 : -1)})`}>
              {[...Array(6)].map((_, l) => <path key={l} d={`M0 0 L${Math.cos((l / 6) * 6.28) * 46} ${Math.sin((l / 6) * 6.28) * 46 + Math.sin(t * 20 + l) * 6}`} stroke="#9aa4b4" strokeWidth={6} />)}
              <circle r={28} fill="#cfd6e2" />
              {dead > 0 ? <path d="M-14 -8 l10 10 m0 -10 l-10 10 M4 -8 l10 10 m0 -10 l-10 10" stroke="#2a2a2a" strokeWidth={4} /> : <circle cx={8} cy={-4} r={8} fill="#ff2a3a" />}
              {dead > 0 && dead < 1 && [...Array(5)].map((_, q) => <path key={q} d={`M0 0 l${Math.cos(q * 1.3 + t * 30) * 50} ${Math.sin(q * 1.7 + t * 30) * 50}`} stroke="#7ae8ff" strokeWidth={4} />)}
            </g>
          );
        })}
      </svg>
    );
  }
  // A-bomb: drop, flash, mushroom cloud
  const drop = bomb, flash = W(15, "اتم") - 0.05;
  const kk = rk(t, drop - 0.3, flash, in2);
  const m = rk(t, flash, flash + 1.2, out3);
  const [sx, sy] = shake(t, flash, 30, 1.2);
  return (
    <svg width={1080} height={1920}>
      <g transform={`translate(${sx} ${sy})`}>
        <Sky id="c15" c={t < flash ? ["#2a1a2a", "#5a2a3a", "#a84a3a"] : ["#5a2a1a", "#c85a2a", "#ffb05a"]} />
        {[...Array(10)].map((_, i) => <Tower key={i} x={-60 + i * 120} w={100} h={200 + hn(i, 9) * 300} base={1330} c={t < flash ? "#2a1418" : "#3a1a14"} win="#ff6a3a" t={t} i={i + 40} ruin={1} />)}
        <rect x={0} y={1330} width={1080} height={600} fill="#2a1a14" />
        {t < flash && <g transform={`translate(540 ${lerp(150, 1150, kk)}) scale(1.7)`}><ellipse rx={36} ry={70} fill="#3a3a40" /><path d="M-30 -60 L0 -110 L30 -60 Z" fill="#2a2a30" /><rect x={-36} y={-10} width={72} height={10} fill="#ffd04a" /></g>}
        {t >= flash && (
          <g transform={`translate(540 1330)`}>
            <ellipse cx={0} cy={0} rx={900 * m} ry={70 * m} fill="#ffb05a" opacity={0.5 * (1 - m)} />
            <path d={`M-60 0 Q-40 ${-400 * m} -70 ${-650 * m} L70 ${-650 * m} Q40 ${-400 * m} 60 0 Z`} fill="#8a5a4a" />
            {[...Array(9)].map((_, i) => <circle key={i} cx={Math.cos((i / 9) * 6.28) * 170 * m} cy={-700 * m + Math.sin((i / 9) * 6.28) * 70 * m} r={(120 + hn(i) * 50) * m} fill={i % 2 ? "#e8a05a" : "#c8784a"} />)}
            <circle cx={0} cy={-720 * m} r={160 * m} fill="#ffd08a" />
            {[...Array(6)].map((_, i) => <circle key={"b" + i} cx={(i - 2.5) * 140 * m} cy={-30} r={80 * m} fill="#a8684a" />)}
          </g>
        )}
      </g>
      {t >= flash && t < flash + 0.5 && <rect width={1080} height={1920} fill="#ffffff" opacity={1 - (t - flash) / 0.5} />}
    </svg>
  );
};

/** 16 · smoke clears: you're fine. Only your hair is standing straight up. */
export const Spiky: React.FC<{ t: number }> = ({ t }) => {
  const sik = W(16, "سیخ");
  const boing = rk(t, sik - 0.05, sik + 0.15, (k) => k);
  const wob = t > sik ? 1 + Math.sin((t - sik) * 30) * 0.25 * Math.exp(-(t - sik) * 5) : 1;
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(lerp(1.5, 1.7, rk(t, S(16) - 0.2, S(17), (k) => k)), 540, 950)}>
        <Sky id="sp16" c={["#4a3a3a", "#7a5a4a", "#a87a5a"]} />
        {[...Array(8)].map((_, i) => <circle key={i} cx={hn(i) * 1080} cy={((hn(i, 2) * 900 - t * 40) % 900 + 900) % 900 + 300} r={60 + hn(i, 3) * 80} fill="#5a4a48" opacity={0.4} />)}
        <rect x={0} y={1180} width={1080} height={800} fill="#4a3a34" />
        <ellipse cx={540} cy={1200} rx={360} ry={60} fill="#2a201c" />
        <Person x={540} y={1190} s={1.1} pose={P.stand} spiky={t > sik - 0.05 ? Math.max(0.51, boing * wob) : 0} face={{ soot: 1, eye: Math.floor(t * 2.5) % 3 === 0 ? "closed" : "wide", mouth: "flat", brows: 0 }} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${500 + i * 40} ${930 - ((t * 80 + i * 40) % 160)} q-14 -30 0 -60 q14 -30 0 -60`} stroke="#9a9090" strokeWidth={8} fill="none" opacity={0.5} />)}
      </g>
    </svg>
  );
};

/** 17 · year 12,000: the jungle has eaten the cities; you're the last human. */
export const Jungle: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(17) - 0.2;
  const wide = W(17, "آخرین") - 0.4;
  if (t < wide) {
    const k = t - t0;
    return (
      <svg width={1080} height={1920}>
        <Sky id="j17" c={["#7ac0b0", "#b8dcb0", "#e8f0c8"]} />
        {[...Array(7)].map((_, i) => <Tower key={i} x={-80 + i * 170 - k * 12} w={140} h={500 + hn(i, 3) * 500} base={1250} c="#6a7a6a" win="#3a4a3a" t={t} i={i + 60} ruin={1} vines={1} />)}
        {[...Array(5)].map((_, i) => <path key={"r" + i} d={`M${100 + i * 220} 0 L${200 + i * 220} 0 L${-100 + i * 260} 1300 L${-200 + i * 260} 1300 Z`} fill="#fffbe0" opacity={0.1} />)}
        <rect x={0} y={1250} width={1080} height={700} fill="#4f8a46" />
        {[...Array(14)].map((_, i) => <path key={"g" + i} d={`M${((i * 90 - k * 40) % 1260 + 1260) % 1260 - 90} 1250 q20 -90 40 0 q20 -70 40 0`} fill="#3f7a3c" />)}
        {/* old car under moss */}
        <g transform={`translate(${830 - k * 40} 1250)`}><path d="M-120 0 L-110 -60 L-50 -100 L60 -100 L110 -60 L120 0 Z" fill="#8a6a5a" /><circle cx={-60} cy={0} r={26} fill="#2a2a2a" /><circle cx={60} cy={0} r={26} fill="#2a2a2a" /><ellipse cx={0} cy={-100} rx={90} ry={26} fill="#4f9a46" /></g>
        {/* deer */}
        <g transform={`translate(${210 - k * 30} 1260)`}><ellipse cx={0} cy={-90} rx={70} ry={36} fill="#b07a4a" /><rect x={-50} y={-70} width={10} height={70} fill="#8a5a3a" /><rect x={40} y={-70} width={10} height={70} fill="#8a5a3a" /><path d="M55 -110 L90 -170 L110 -165 L80 -110 Z" fill="#b07a4a" /><path d="M95 -170 l-10 -40 m10 40 l20 -35" stroke="#6a4a2a" strokeWidth={6} /></g>
        {[...Array(4)].map((_, i) => { const x = ((hn(i) * 1200 + t * 140) % 1300) - 100; return <path key={"bd" + i} d={`M${x - 20} ${400 + i * 70} q10 ${-12 + Math.sin(t * 10 + i) * 8} 20 0 q10 ${-12 + Math.sin(t * 10 + i) * 8} 20 0`} stroke="#2a3a2a" strokeWidth={5} fill="none" />; })}
        <Person x={540} y={1250} s={1.0} pose={{ ...P.stand, armR: [30, 10], legL: [-20 * Math.sin(k * 5), 8], legR: [20 * Math.sin(k * 5), 8] }} face={{ facing: 0.6, mouth: "flat" }} />
        <path d="M600 1140 L640 1250" stroke="#6b4a33" strokeWidth={10} strokeLinecap="round" />
      </svg>
    );
  }
  const z = lerp(1.6, 1.0, rk(t, wide, wide + 2.2, ease));
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(z, 540, 820)}>
        <Sky id="j17b" c={["#f2a06a", "#ffc88a", "#ffe8b0"]} />
        <circle cx={760} cy={980} r={150} fill="#fff1c0" />
        {[...Array(10)].map((_, i) => <Tower key={i} x={-120 + i * 140} w={110} h={260 + hn(i, 4) * 420} base={1250} c="#5a6a5a" win="#3a4a3a" t={t} i={i + 80} ruin={1} vines={1} />)}
        <rect x={-200} y={1240} width={1500} height={800} fill="#3f6a3c" />
        <Tower x={430} w={220} h={520} base={1250} c="#6a7a6a" win="#3a4a3a" t={t} i={7} ruin={1} vines={0.6} />
        <Person x={540} y={720} s={0.45} pose={P.sitFront} face={{ facing: 0.3, eye: "sad", mouth: "flat" }} />
        {[...Array(5)].map((_, i) => { const x = ((hn(i) * 1200 + t * 90) % 1300) - 100; return <path key={"bd" + i} d={`M${x - 14} ${600 + i * 50} q7 ${-9 + Math.sin(t * 10 + i) * 6} 14 0 q7 ${-9 + Math.sin(t * 10 + i) * 6} 14 0`} stroke="#3a2a2a" strokeWidth={4} fill="none" />; })}
      </g>
    </svg>
  );
};

const Earth: React.FC<{ x: number; y: number; r: number; burn?: number }> = ({ x, y, r, burn = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={mixColor("#3a7ad8", "#5a2a1a", burn)} />
    <path d={`M${-r * 0.6} ${-r * 0.3} q${r * 0.3} ${-r * 0.4} ${r * 0.6} ${-r * 0.1} q${r * 0.1} ${r * 0.4} ${-r * 0.2} ${r * 0.5} q${-r * 0.3} 0 ${-r * 0.4} ${-r * 0.4} Z M${r * 0.2} ${r * 0.2} q${r * 0.3} ${-r * 0.1} ${r * 0.5} ${r * 0.2} q${-r * 0.1} ${r * 0.3} ${-r * 0.4} ${r * 0.3} Z`} fill={mixColor("#4fa85a", "#2a1410", burn)} />
    <circle r={r} fill="none" stroke={mixColor("#9ad4ff", "#ff6a2a", burn)} strokeWidth={r * 0.06} opacity={0.6} />
  </g>
);

/** 18 · year 5 billion: the sun swells into a red giant and swallows the Earth; you float away, awake. */
export const RedGiant: React.FC<{ t: number }> = ({ t }) => {
  const swell = W(18, "باد"), eat = W(18, "زمین") - 0.15, flt = W(18, "تو") - 0.15;
  if (t < eat) {
    const r = lerp(140, 1300, rk(t, swell - 0.3, eat, in2));
    return (
      <svg width={1080} height={1920}>
        <Sky id="r18" c={["#1a0a14", "#5a1a1a", "#c84a2a"]} />
        <circle cx={540} cy={1150} r={r * 1.25} fill="#ff6a2a" opacity={0.25} />
        <circle cx={540} cy={1150} r={r} fill="#ff4a1a" />
        <circle cx={540 - r * 0.2} cy={1150 - r * 0.2} r={r * 0.7} fill="#ff7a2a" opacity={0.6} />
        <path d="M0 1260 Q300 1230 540 1250 Q800 1230 1080 1260 L1080 1920 L0 1920 Z" fill="#3a140c" />
        {[...Array(6)].map((_, i) => <path key={i} d={`M${hn(i) * 1080} ${1300 + hn(i, 2) * 500} l40 30 l-30 40 l50 30`} stroke="#ff7a2a" strokeWidth={4} fill="none" opacity={0.6} />)}
        <Person x={540} y={1250} s={0.85} pose={P.stand} face={{ shades: true, mouth: "flat" }} />
      </svg>
    );
  }
  if (t < flt) {
    const k = rk(t, eat, flt - 0.1, ease);
    return (
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#05030a" />
        <Stars t={t} n={140} />
        <circle cx={1700 - k * 300} cy={960} r={1200} fill="#ff4a1a" />
        <circle cx={1700 - k * 300} cy={960} r={1260} fill="#ff6a2a" opacity={0.25} />
        {k < 0.75 && <Earth x={lerp(300, 560, k)} y={960} r={90} burn={k} />}
        {k > 0.7 && k < 0.85 && <circle cx={560} cy={960} r={140} fill="#fff0c8" opacity={1 - (k - 0.7) / 0.15} />}
      </svg>
    );
  }
  const yawn = W(18, "بیدار") - 0.1;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#05030a" />
      <Stars t={t} n={160} seed={3} />
      <circle cx={1500} cy={300} r={700} fill="#ff4a1a" opacity={0.85} />
      <Person x={540 + Math.sin(t * 0.8) * 30} y={1050} s={1.25} rot={Math.sin(t * 0.7) * 12 + (t - flt) * 8} pose={P.float} face={{ eye: t > yawn ? "closed" : "open", mouth: t > yawn ? "o" : "flat", facing: 0.2 }} />
    </svg>
  );
};

/** 19 · fall into a black hole, stretch like spaghetti, pop out the other side intact. */
export const BlackHole: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(19) - 0.2;
  const stretch = W(19, "مثل") - 0.1, other = W(19, "اون") - 0.2, out = W(19, "سالم") - 0.15;
  const bx = 540, by = 820;
  const disk = (front: boolean) => (
    <g transform={`translate(${bx} ${by}) rotate(-12)`}>
      <ellipse rx={470} ry={110} fill="none" stroke="url(#acc)" strokeWidth={60} strokeDasharray={front ? "0 740 1480" : "1480 1480"} opacity={0.95} />
      <ellipse rx={380} ry={80} fill="none" stroke="#fff3c8" strokeWidth={10} strokeDasharray={front ? "0 600 1200" : "1200 1200"} opacity={0.7} />
    </g>
  );
  let hx = 540, hy = 820, sy = 1, sx = 1, rot = 0, op = 1;
  if (t < stretch) { const k = rk(t, t0, stretch, in2); hx = lerp(880, 600, k); hy = lerp(260, 640, k); rot = k * 120; sx = sy = lerp(1, 0.8, k); }
  else if (t < other) { const k = rk(t, stretch, other, ease); hx = lerp(600, 540, k); hy = lerp(640, 820, k); sy = lerp(1, 4.2, k); sx = lerp(1, 0.36, k); rot = 120 + k * 400; op = 1 - rk(t, other - 0.25, other); }
  else op = 0;
  const popK = rk(t, out, out + 0.4, back);
  return (
    <svg width={1080} height={1920}>
      <defs>
        <linearGradient id="acc" x1="0" x2="1"><stop offset="0" stopColor="#ff7a1a" /><stop offset="0.5" stopColor="#ffe08a" /><stop offset="1" stopColor="#ff5a1a" /></linearGradient>
        <radialGradient id="wh"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor="#cfe6ff" stopOpacity={0.6} /><stop offset="1" stopColor="#cfe6ff" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#03020a" />
      <Stars t={t} n={150} seed={5} />
      {t < out + 0.2 && <g>
        {disk(false)}
        <path d={`M${bx - 300} ${by - 40} Q${bx} ${by - 330} ${bx + 300} ${by - 40}`} stroke="#ffd08a" strokeWidth={26} fill="none" opacity={0.55} />
        <circle cx={bx} cy={by} r={230} fill="#000" />
        <circle cx={bx} cy={by} r={236} fill="none" stroke="#ffe8b0" strokeWidth={6} opacity={0.8} />
        {op > 0 && <g transform={`translate(${hx} ${hy}) rotate(${rot}) scale(${sx} ${sy})`} opacity={op}><Person x={0} y={90} s={0.75} pose={P.spread} face={{ eye: "wide", mouth: "o" }} /></g>}
        {disk(true)}
      </g>}
      {/* the other side: white hole flash, you pop out fine */}
      {t >= other && <circle cx={540} cy={1000} r={lerp(0, 900, rk(t, other, out + 0.3, out3))} fill="url(#wh)" opacity={1 - rk(t, out + 0.2, out + 1.2)} />}
      {t >= out && <Person x={540} y={1180} s={1.2 * popK} pose={mixPose(P.spread, P.thumbs, rk(t, out + 0.3, out + 0.7))} spiky={0.6} face={{ eye: "happy", mouth: "grin", facing: 0.2 }} />}
    </svg>
  );
};

const Galaxy: React.FC<{ x: number; y: number; r: number; rot: number; c: string; o: number }> = ({ x, y, r, rot, c, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1 0.45)`} opacity={o}>
    <circle r={r * 0.25} fill="#fff4d8" />
    {[0, 1].map((arm) => <path key={arm} d={`M0 0 ${[...Array(20)].map((_, i) => { const a = arm * Math.PI + i * 0.3; const rr = r * (i / 20); return `L${Math.cos(a) * rr} ${Math.sin(a) * rr}`; }).join(" ")}`} stroke={c} strokeWidth={r * 0.12} fill="none" strokeLinecap="round" opacity={0.7} />)}
  </g>
);

/** 20 · year 100 trillion: galaxies drift away, stars die of old age one by one. */
export const DyingStars: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(20) - 0.2;
  const die = W(20, "یکی‌یکی") - 0.3;
  const k = rk(t, die, die + 3.2, (q) => q);
  const big = [[200, 420], [860, 380], [300, 1550], [880, 1450], [700, 760], [170, 980], [930, 1050], [520, 300]];
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#04030a" />
      <Stars t={t} n={260} seed={7} alive={(i) => (hn(i, 11) > k ? 1 : 0)} />
      {[0, 1, 2].map((i) => { const d = rk(t, t0, t0 + 5.5, (q) => q); return <Galaxy key={i} x={540 + (i - 1) * 380 * (1 + d)} y={700 + i * 300 - d * 200 * (i - 1)} r={130 * (1 - d * 0.6)} rot={t * 8 + i * 60} c={["#b8a0ff", "#ffc08a", "#8ad0ff"][i]} o={1 - d * 0.8} />; })}
      {big.map(([x, y], i) => {
        const at = die + i * 0.38;
        const a = 1 - rk(t, at, at + 0.25);
        const flash = t > at && t < at + 0.3 ? 1 - (t - at) / 0.3 : 0;
        return <g key={i}>{a > 0 && <g><circle cx={x} cy={y} r={14} fill="#fff4d8" opacity={a} /><path d={`M${x - 34} ${y} L${x + 34} ${y} M${x} ${y - 34} L${x} ${y + 34}`} stroke="#fff4d8" strokeWidth={3} opacity={a * 0.7} /></g>}{flash > 0 && <circle cx={x} cy={y} r={70 * (1 - flash) + 10} fill="none" stroke="#ffb08a" strokeWidth={4} opacity={flash} />}</g>;
      })}
      <Person x={540} y={1150} s={0.8} rot={Math.sin(t * 0.6) * 10} pose={P.float} face={{ eye: "open", mouth: "flat", facing: Math.sin(t * 1.2) * 0.6 }} />
    </svg>
  );
};

/** 21 · year 10^100: black holes evaporate; then atoms fall apart. */
export const Evaporate: React.FC<{ t: number }> = ({ t }) => {
  const bh = W(21, "سیاه‌چاله‌ها") - 0.2, gone = W(21, "می‌شن") + 0.1, atoms = W(21, "بعد") - 0.1;
  if (t < atoms) {
    const r = lerp(260, 0, rk(t, bh, gone, in2));
    const popped = t > gone;
    return (
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#020108" />
        <Stars t={t} n={20} seed={9} o={0.5} />
        {!popped && <g>
          <circle cx={540} cy={860} r={r * 1.6} fill="#5a3aa8" opacity={0.15} />
          {[...Array(16)].map((_, i) => { const a = (i / 16) * 6.28 + t; const q = ((t * 1.5 + hn(i)) % 1); return <circle key={i} cx={540 + Math.cos(a) * (r + 20 + q * 140)} cy={860 + Math.sin(a) * (r + 20 + q * 140)} r={3} fill="#cdb8ff" opacity={1 - q} />; })}
          <circle cx={540} cy={860} r={r} fill="#000" stroke="#a88aff" strokeWidth={4} />
        </g>}
        {popped && t < gone + 0.6 && <circle cx={540} cy={860} r={lerp(10, 400, (t - gone) / 0.6)} fill="none" stroke="#e8dcff" strokeWidth={8} opacity={1 - (t - gone) / 0.6} />}
        <Person x={540} y={1240} s={0.75} rot={Math.sin(t * 0.5) * 8} pose={P.float} face={{ eye: popped ? "wide" : "open", mouth: "flat" }} />
      </svg>
    );
  }
  const k = rk(t, W(21, "می‌پاشن") - 0.4, W(21, "می‌پاشن") + 1.2, out3);
  const nuc = [[0, 0, "#d8504a"], [26, 10, "#4a7ad8"], [-22, 16, "#d8504a"], [6, -26, "#4a7ad8"], [-12, -14, "#d8504a"], [20, -14, "#4a7ad8"]] as const;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#020108" />
      <g transform="translate(540 860)">
        {[0, 60, 120].map((r, i) => (
          <g key={i} transform={`rotate(${r + k * 40 * (i - 1)}) translate(${k * 300 * (i - 1)} ${k * 200 * (i % 2 ? 1 : -1)})`} opacity={1 - k * 0.8}>
            <ellipse rx={360 * (1 + k)} ry={110 * (1 + k)} fill="none" stroke="#8ad0ff" strokeWidth={5} opacity={0.6} strokeDasharray={k > 0 ? `${40 * (1 - k)} 30` : undefined} />
            <circle cx={Math.cos(t * 3 + i * 2) * 360 * (1 + k * 2)} cy={Math.sin(t * 3 + i * 2) * 110 * (1 + k * 2)} r={18} fill="#cfeaff" />
          </g>
        ))}
        {nuc.map(([x, y, c], i) => <circle key={i} cx={x * 1.8 + Math.cos(i * 1.1) * k * 500} cy={y * 1.8 + Math.sin(i * 1.1) * k * 500} r={34} fill={c} opacity={1 - k * 0.7} />)}
      </g>
      <Person x={540} y={1500} s={0.6} rot={Math.sin(t * 0.5) * 8} pose={P.float} face={{ eye: "open", mouth: "flat" }} op={0.8} />
    </svg>
  );
};

/** 22 · no light, no sound, no time — just you. */
export const Void: React.FC<{ t: number }> = ({ t }) => {
  const light = W(22, "نوری"), sound = W(22, "صدایی"), time = W(22, "زمانی"), you = W(22, "فقط");
  const glow = 1 - rk(t, light - 0.2, light + 0.6);
  const flat = rk(t, sound, sound + 0.6);
  const clockA = t > time - 0.3 && t < you ? 1 - rk(t, time + 0.5, you - 0.1) : 0;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#000" />
      {glow > 0 && <circle cx={540} cy={700} r={12} fill="#fff4d8" opacity={glow} />}
      {glow > 0 && <circle cx={540} cy={700} r={80} fill="#fff4d8" opacity={glow * 0.15} />}
      {t > sound - 0.3 && t < time && <path d={`M140 900 ${[...Array(80)].map((_, i) => `L${140 + i * 10} ${900 + Math.sin(i * 0.9 + t * 20) * 70 * (1 - flat) * Math.sin((i / 80) * Math.PI)}`).join(" ")}`} stroke="#6a6a7a" strokeWidth={5} fill="none" opacity={1 - rk(t, time - 0.4, time)} />}
      {clockA > 0 && <g transform="translate(540 880)" opacity={clockA}>
        <circle r={170} fill="none" stroke="#6a6a7a" strokeWidth={8} />
        {[...Array(12)].map((_, i) => <path key={i} d={`M${Math.cos((i / 12) * 6.28) * 140} ${Math.sin((i / 12) * 6.28) * 140} L${Math.cos((i / 12) * 6.28) * 158} ${Math.sin((i / 12) * 6.28) * 158}`} stroke="#6a6a7a" strokeWidth={6} />)}
        <path d={`M0 0 L${Math.cos(Math.min(t, time + 0.3) * 6 - 1.57) * 120} ${Math.sin(Math.min(t, time + 0.3) * 6 - 1.57) * 120}`} stroke="#8a8a9a" strokeWidth={8} strokeLinecap="round" />
        <path d="M0 0 L0 -80" stroke="#8a8a9a" strokeWidth={10} strokeLinecap="round" />
      </g>}
      {t > you - 0.3 && <g opacity={rk(t, you - 0.3, you + 0.4)}>
        <circle cx={540} cy={900} r={360} fill="#2a3a5a" opacity={0.18} />
        <Person x={540} y={1150} s={1.0} rot={Math.sin(t * 0.4) * 5} pose={P.float} face={{ eye: "open", mouth: "flat" }} />
        <rect width={1080} height={1920} fill="#000" opacity={0.35} />
      </g>}
    </svg>
  );
};

/** 23 · and forever is only just getting started (∞ draws itself behind you) + end card. */
export const Forever: React.FC<{ t: number; card: number }> = ({ t, card }) => {
  const inf = W(23, "ابدیت") - 0.1;
  if (t < card) {
    const draw = rk(t, inf, inf + 1.6, ease);
    const z = lerp(1, 1.25, rk(t, S(23) - 0.3, card, (k) => k));
    return (
      <svg width={1080} height={1920}>
        <rect width={1080} height={1920} fill="#000" />
        <g transform={cam(z, 540, 900)}>
          <path d="M540 820 C400 620 180 620 180 820 C180 1020 400 1020 540 820 C680 620 900 620 900 820 C900 1020 680 1020 540 820 Z" fill="none" stroke="#ffc23a" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: "drop-shadow(0 0 24px #ffb02a)" }} opacity={0.9} />
          <circle cx={540} cy={1000} r={420} fill="#ffb02a" opacity={0.06 * draw} />
          <Person x={540} y={1460} s={2.2} pose={P.stand} face={{ eye: Math.floor(t * 1.5) % 5 === 0 ? "closed" : "open", mouth: "flat", facing: 0 }} />
          <rect x={0} y={1500} width={1080} height={600} fill="#000" />
        </g>
        <rect width={1080} height={1920} fill="#000" opacity={0.25} />
      </svg>
    );
  }
  const a = rk(t, card, card + 0.5, out3);
  const sand = ((t - card) * 0.6) % 1;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#06050c" />
      <g transform={`translate(540 760) scale(${0.8 + 0.2 * a})`} opacity={a}>
        <path d="M-120 -200 L120 -200 L120 -170 Q120 -60 20 0 Q120 60 120 170 L120 200 L-120 200 L-120 170 Q-120 60 -20 0 Q-120 -60 -120 -170 Z" fill="none" stroke="#ffc23a" strokeWidth={10} />
        <path d={`M-90 ${-160 + sand * 60} L90 ${-160 + sand * 60} Q60 -50 0 -8 Q-60 -50 -90 ${-160 + sand * 60} Z`} fill="#ffc23a" opacity={0.8} />
        <path d="M0 -8 L0 160" stroke="#ffc23a" strokeWidth={4} strokeDasharray="8 10" strokeDashoffset={-t * 60} />
        <path d={`M-90 170 Q0 ${110 - sand * 20} 90 170 Z`} fill="#ffc23a" opacity={0.8} />
        <rect x={-150} y={-220} width={300} height={24} rx={8} fill="#ffc23a" />
        <rect x={-150} y={196} width={300} height={24} rx={8} fill="#ffc23a" />
      </g>
      <text x={540} y={1180} textAnchor="middle" fontFamily={BLACK} fontSize={92} fill="#fff" direction="rtl" opacity={rk(t, card + 0.3, card + 0.8)}>بازم قبولش</text>
      <text x={540} y={1310} textAnchor="middle" fontFamily={BLACK} fontSize={92} fill="#ffc23a" direction="rtl" opacity={rk(t, card + 0.5, card + 1.0)}>می‌کردی؟</text>
    </svg>
  );
};
