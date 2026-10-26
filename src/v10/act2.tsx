// V10 act 2 — خانواده: love, the courtyard house, years passing, 85 vs 25, graves, new city, alone.
import React from "react";
import { BLACK, clamp, Cloud, ease, hn, lerp, Look, mixColor, mixPose, out3, P, Person, rk, S, Shadow, Sky, Stars, W, WIFE, back } from "./kit";

const cam = (z: number, cx = 540, cy = 960) => `translate(540 960) scale(${z}) translate(${-cx} ${-cy})`;
const KID1: Look = { top: "#e2574c", bottom: "#3b4a6b", skin: "#f1c39d", hair: "#3a2418", shoe: "#222", hairStyle: "kid", kid: true };
const KID2: Look = { top: "#8a6fd1", bottom: "#8a6fd1", skin: "#f3c9a8", hair: "#5a2a1a", shoe: "#5b2b2b", hairStyle: "long", dress: true, kid: true };
const pop = (t: number, at: number) => rk(t, at, at + 0.35, back);

const Heart: React.FC<{ x: number; y: number; s: number; c?: string; o?: number }> = ({ x, y, s, c = "#ff5a7a", o = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 12 C-30 -10 -18 -34 0 -20 C18 -34 30 -10 0 12 Z" fill={c} opacity={o} />
);

/** Iranian courtyard house: brick walls, arched blue windows, pool (hoz), pomegranate tree. */
const House: React.FC<{ t: number; rise: number; yard: number; tree: number; night?: number }> = ({ t, rise, yard, tree, night = 0 }) => {
  const wall = mixColor("#d49a66", "#3a3550", night * 0.7), dark = mixColor("#a8714a", "#2a2640", night * 0.7);
  const win = night > 0.5 ? "#ffd27a" : "#3f7fb0";
  return (
    <g>
      <g transform={`translate(540 1160) scale(${0.3 + 0.7 * rise} ${rise}) translate(-540 -1160)`} opacity={clamp(rise * 4)}>
        <rect x={150} y={600} width={780} height={560} fill={wall} />
        <rect x={150} y={580} width={780} height={34} fill={dark} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${290 + i * 250} 760)`}>
            <path d="M-70 220 L-70 0 Q-70 -80 0 -80 Q70 -80 70 0 L70 220 Z" fill={dark} />
            <path d="M-56 210 L-56 4 Q-56 -64 0 -64 Q56 -64 56 4 L56 210 Z" fill={win} />
            <path d="M0 -64 L0 210 M-56 70 L56 70" stroke={dark} strokeWidth={8} />
          </g>
        ))}
        {[...Array(13)].map((_, i) => <rect key={"b" + i} x={150 + i * 60} y={1120} width={56} height={14} fill={dark} opacity={0.35} />)}
      </g>
      {/* courtyard floor + hoz */}
      <g opacity={yard} transform={`translate(0 ${(1 - yard) * 60})`}>
        <rect x={0} y={1160} width={1080} height={760} fill="#d9c7a6" />
        {[...Array(9)].map((_, i) => <line key={i} x1={i * 135} y1={1160} x2={i * 135 - 200} y2={1920} stroke="#c4b08e" strokeWidth={4} />)}
        <ellipse cx={540} cy={1560} rx={330} ry={90} fill="#3fa3b8" />
        <ellipse cx={540} cy={1560} rx={330} ry={90} fill="none" stroke="#b8a48a" strokeWidth={22} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={540 + Math.sin(t * 2 + i) * 160} cy={1560 + Math.cos(t * 1.4 + i) * 30} rx={30} ry={8} fill="#ffffff" opacity={0.25} />)}
      </g>
      {/* pomegranate tree on the right */}
      <g transform={`translate(890 1220) scale(${tree})`}>
        <path d="M-12 0 Q-6 -120 -30 -220 L-6 -224 Q14 -130 12 0 Z" fill="#6b4a33" />
        {[[-60, -260, 90], [30, -300, 100], [70, -220, 80], [-90, -200, 70], [0, -230, 90]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? "#3f8a3c" : "#4f9a46"} />)}
        {[[-70, -240], [20, -330], [80, -230], [-20, -190], [50, -280], [-100, -200]].map(([x, y], i) => <g key={"p" + i} transform={`translate(${x} ${y}) scale(${rk(tree, 0.6 + i * 0.05, 0.8 + i * 0.05, back)})`}><circle r={17} fill="#d8323c" /><path d="M-5 -16 l5 -7 l5 7" fill="#a8222a" /></g>)}
      </g>
    </g>
  );
};

/** 7 · love (bench, sunset) → kids, house, yard, pomegranate tree */
export const Love: React.FC<{ t: number }> = ({ t }) => {
  const kids = W(7, "دو") - 0.15;
  if (t < kids) {
    const t0 = S(7) - 0.25;
    return (
      <svg width={1080} height={1920}>
        <g transform={cam(lerp(1.45, 1.6, rk(t, t0, kids, (k) => k)), 540, 1020)}>
          <Sky id="l7" c={["#f28a6a", "#ffc28a", "#ffe6c2"]} />
          <circle cx={540} cy={980} r={210} fill="#fff1c8" opacity={0.9} />
          <rect x={0} y={1180} width={1080} height={800} fill="#7aa85a" />
          <path d="M0 1180 Q300 1150 540 1170 Q800 1150 1080 1180 L1080 1200 L0 1200 Z" fill="#8fbc6a" />
          <rect x={310} y={1140} width={460} height={20} rx={6} fill="#7a4a2c" />
          <rect x={310} y={1080} width={460} height={16} rx={6} fill="#7a4a2c" />
          <rect x={330} y={1160} width={14} height={70} fill="#5a3a22" /><rect x={736} y={1160} width={14} height={70} fill="#5a3a22" />
          <Person x={440} y={1140} s={0.95} pose={{ ...P.sitFront, armR: [40, -10] }} face={{ eye: "happy", mouth: "smile", facing: 0.6 }} />
          <Person x={640} y={1140} s={0.95} look={WIFE} pose={{ ...P.sitFront, armL: [-40, 10] }} face={{ eye: "happy", mouth: "smile", facing: -0.6 }} />
          {[...Array(7)].map((_, i) => { const q = ((t - t0) * 0.7 + hn(i)) % 1; return <Heart key={i} x={540 + Math.sin(i * 2 + t * 3) * 90 + (hn(i, 2) - 0.5) * 200} y={900 - q * 500} s={0.9 + hn(i, 3)} o={(1 - q) * rk(t, W(7, "عاشق"), W(7, "عاشق") + 0.3)} />; })}
        </g>
      </svg>
    );
  }
  const house = W(7, "خونه") - 0.05, yard = W(7, "حیاط") - 0.05, tree = W(7, "درخت");
  return (
    <svg width={1080} height={1920}>
      <Sky id="l7b" c={["#7cc4f0", "#bfe4f7", "#fff0d8"]} />
      <Cloud x={200} y={360} w={300} o={0.9} /><Cloud x={880} y={460} w={240} o={0.8} />
      <House t={t} rise={rk(t, house, house + 0.45, back)} yard={rk(t, yard, yard + 0.35)} tree={rk(t, tree, tree + 0.8, out3)} />
      <Shadow x={540} y={1262} w={230} />
      <Person x={460} y={1130} s={0.95} pose={P.stand} face={{ eye: "happy", mouth: "grin", facing: 0.3 }} />
      <Person x={630} y={1130} s={0.95} look={WIFE} pose={P.stand} face={{ eye: "happy", mouth: "smile", facing: -0.3 }} />
      <g transform={`translate(330 ${1180 + (1 - pop(t, kids)) * 600})`}><Person x={0} y={0} s={0.95} look={KID1} pose={P.wave} face={{ eye: "happy", mouth: "grin" }} /></g>
      <g transform={`translate(760 ${1180 + (1 - pop(t, kids + 0.12)) * 600})`}><Person x={0} y={0} s={0.95} look={KID2} pose={P.stand} face={{ mouth: "grin" }} /></g>
    </svg>
  );
};

/** 8 · years go by: day/night cycles, kids grow, wife greys, hero stays the same. */
export const Years: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(8) - 0.2, t1 = S(9) - 0.2;
  const k = rk(t, t0, t1, (q) => q);
  const cyc = (k * 5) % 1;
  const night = clamp(Math.sin(cyc * Math.PI * 2) * -1.4 + 0.2);
  const hair = W(8, "تار");
  const z = lerp(1, 2.4, rk(t, hair - 0.2, hair + 0.5, ease));
  const grow = k;
  const kid = (L: Look, g: number): Look => ({ ...L, kid: g < 0.6 });
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(z, lerp(540, 470, rk(t, hair - 0.2, hair + 0.5)), lerp(960, 820, rk(t, hair - 0.2, hair + 0.5)))}>
        <Sky id="y8" c={[mixColor("#7cc4f0", "#0d1430", night), mixColor("#bfe4f7", "#1d2550", night), mixColor("#fff0d8", "#3a3060", night)]} />
        <Stars t={t} n={60} h={900} o={night} />
        <circle cx={lerp(-100, 1180, cyc)} cy={500 - Math.sin(cyc * Math.PI) * 250} r={70} fill={night > 0.5 ? "#f1eedf" : "#fff3c4"} />
        <House t={t} rise={1} yard={1} tree={1} night={night} />
        <Shadow x={540} y={1262} w={230} />
        <Person x={460} y={1130} s={0.95} pose={P.stand} face={{ eye: t > W(8, "درنمیاری") ? (Math.floor(t * 4) % 4 === 0 ? "closed" : "happy") : "open", mouth: "smile", facing: 0.2 }} />
        <Person x={630} y={1130} s={0.95} look={{ ...WIFE, age: grow * 0.6 }} pose={P.stand} face={{ eye: "happy", mouth: "smile", facing: -0.3 }} />
        <Person x={330} y={1180 - grow * 50} s={lerp(0.95, 0.9, grow)} look={kid(KID1, grow)} pose={P.stand} face={{ mouth: "smile" }} />
        <Person x={760} y={1180 - grow * 50} s={lerp(0.95, 0.85, grow)} look={kid(KID2, grow)} pose={P.stand} face={{ mouth: "smile" }} />
        {/* calendar pages flying off */}
        {[...Array(10)].map((_, i) => { const q = (k * 10 + hn(i)) % 1; return <g key={i} transform={`translate(${200 + hn(i, 2) * 700 + q * 300} ${600 - q * 500}) rotate(${q * 200 + i * 30})`} opacity={(1 - q) * (1 - rk(t, hair - 0.3, hair))}><rect x={-34} y={-40} width={68} height={80} rx={6} fill="#fff" /><rect x={-34} y={-40} width={68} height={18} rx={6} fill="#d8323c" /></g>; })}
        {/* magnifier over the hair */}
        {t > hair && <g transform={`translate(${470 + Math.sin((t - hair) * 4) * 30} ${1130 - 125 * 0.95 - 62 * 0.95 - 40})`} opacity={rk(t, hair, hair + 0.2)}>
          <circle r={46} fill="rgba(200,230,255,.25)" stroke="#555" strokeWidth={8} />
          <path d="M32 32 L80 80" stroke="#6b4a33" strokeWidth={14} strokeLinecap="round" />
        </g>}
      </g>
    </svg>
  );
};

const Badge: React.FC<{ x: number; y: number; a: number; txt: string; bg: string }> = ({ x, y, a, txt, bg }) => (
  <g transform={`translate(${x} ${y}) scale(${a})`} opacity={a > 0.01 ? 1 : 0}>
    <rect x={-95} y={-62} width={190} height={110} rx={26} fill={bg} />
    <path d="M-16 46 L0 70 L16 46 Z" fill={bg} />
    <text x={0} y={22} textAnchor="middle" fontFamily={BLACK} fontSize={78} fill="#fff">{txt}</text>
  </g>
);
/** 9 · sixty years later: she is 85 (cane, bun, glasses), you're still 25. */
export const Porch: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(9) - 0.2;
  const her = W(9, "۸۵"), him = W(9, "۲۵");
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(lerp(1.05, 1.18, rk(t, t0, t0 + 3.6, (q) => q)), 540, 1000)}>
        <Sky id="p9" c={["#e0905a", "#f2b47a", "#f7d6a8"]} />
        <rect x={0} y={420} width={1080} height={800} fill="#c98a5a" />
        {[0, 1].map((i) => <g key={i} transform={`translate(${260 + i * 560} 620)`}><path d="M-90 300 L-90 0 Q-90 -100 0 -100 Q90 -100 90 0 L90 300 Z" fill="#8a5a3a" /><path d="M-74 290 L-74 6 Q-74 -84 0 -84 Q74 -84 74 6 L74 290 Z" fill="#f2c27a" /></g>)}
        <rect x={0} y={1200} width={1080} height={800} fill="#a8714a" />
        {[...Array(8)].map((_, i) => <rect key={i} x={i * 140} y={1200} width={6} height={800} fill="#8a5a3a" />)}
        {/* bench */}
        <rect x={240} y={1110} width={600} height={24} rx={8} fill="#5a3a22" />
        <rect x={240} y={980} width={600} height={20} rx={8} fill="#5a3a22" />
        <rect x={260} y={1134} width={16} height={90} fill="#4a2a18" /><rect x={804} y={1134} width={16} height={90} fill="#4a2a18" />
        <Person x={430} y={1110} s={0.95} look={{ ...WIFE, age: 1, hairStyle: "bun", top: "#4a7a74" }} pose={{ ...P.sitFront, armR: [30, -40], lean: 4, head: 6 }} face={{ glasses: true, eye: "happy", mouth: "smile", facing: 0.4 }} />
        <Person x={650} y={1110} s={0.95} pose={{ ...P.sitFront, armL: [-30, 40] }} face={{ eye: t > him ? "sad" : "open", mouth: t > him ? "flat" : "smile", facing: -0.4 }} />
        <path d="M300 1110 L270 1240" stroke="#6b4a33" strokeWidth={10} strokeLinecap="round" />
        <Badge x={430} y={760} a={pop(t, her)} txt="۸۵" bg="#9a8a80" />
        <Badge x={650} y={760} a={pop(t, him)} txt="۲۵" bg="#e8962a" />
      </g>
    </svg>
  );
};

const Grave: React.FC<{ x: number; y: number; s: number; a: number; flowers?: boolean }> = ({ x, y, s, a, flowers }) => (
  <g transform={`translate(${x} ${y + (1 - a) * 160 * s}) scale(${s})`} opacity={clamp(a * 3)}>
    <ellipse cx={0} cy={6} rx={110} ry={20} fill="rgba(0,0,0,.25)" />
    <path d="M-70 0 L-70 -150 Q-70 -210 0 -210 Q70 -210 70 -150 L70 0 Z" fill="#8f97a3" />
    <path d="M20 -205 Q70 -200 70 -150 L70 0 L40 0 L40 -150 Q40 -190 20 -205 Z" fill="#7a828e" />
    <path d="M-30 -140 L30 -140 M-36 -110 L36 -110 M-24 -80 L24 -80" stroke="#6d7480" strokeWidth={8} strokeLinecap="round" />
    {flowers && [-30, 0, 30].map((fx, i) => <g key={i}><path d={`M${fx} 0 L${fx + (i - 1) * 6} -50`} stroke="#4a7a4a" strokeWidth={5} /><circle cx={fx + (i - 1) * 6} cy={-54} r={13} fill={["#e85a6a", "#f2d04a", "#e85a6a"][i]} /></g>)}
  </g>
);
const Rain: React.FC<{ t: number; o?: number; n?: number }> = ({ t, o = 0.5, n = 90 }) => (
  <g opacity={o}>{[...Array(n)].map((_, i) => { const y = ((hn(i, 1) * 2200 + t * 1900 * (0.8 + 0.4 * hn(i, 2))) % 2200) - 200; const x = hn(i) * 1180 - (y * 0.18); return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke="#cfe0f0" strokeWidth={2.5} />; })}</g>
);
const Umbrella: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0 L0 200 Q0 226 -22 222" stroke="#2a2a30" strokeWidth={8} fill="none" />
    <path d="M-170 10 Q-150 -120 0 -130 Q150 -120 170 10 Q128 -14 85 10 Q42 -14 0 10 Q-42 -14 -85 10 Q-128 -14 -170 10 Z" fill="#23232c" />
  </g>
);

/** 10 · cemetery in the rain: her grave, then the kids', then the grandkids'. */
export const Graves: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(10) - 0.2;
  const kids = W(10, "بچه‌هات") - 0.1, grand = W(10, "نوه‌هات") - 0.1;
  const z = lerp(1.25, 0.92, rk(t, t0, t0 + 4, ease));
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(z, 540, 1380)}>
        <Sky id="g10" c={["#2c3440", "#4a5664", "#6a7684"]} />
        <path d="M-200 1000 Q200 940 540 980 Q900 940 1300 1000 L1300 1100 L-200 1100 Z" fill="#3c4650" />
        {[...Array(6)].map((_, i) => <path key={i} d={`M${-100 + i * 260} 1010 l40 -200 l40 200 Z`} fill="#2a333c" />)}
        <rect x={-300} y={1060} width={1700} height={1600} fill="#4a5a52" />
        {[0, 1, 2, 3].map((i) => <Grave key={"g" + i} x={-60 + i * 400} y={1150} s={0.55} a={pop(t, grand + 0.05 * i)} />)}
        <Grave x={250} y={1300} s={0.8} a={pop(t, kids)} flowers />
        <Grave x={830} y={1300} s={0.8} a={pop(t, kids + 0.1)} flowers />
        {[0, 1, 2, 3].map((i) => <Grave key={"n" + i} x={60 + i * 320} y={1720} s={0.7} a={pop(t, grand + 0.2 + 0.08 * i)} />)}
        <Grave x={540} y={1450} s={1.0} a={1} flowers />
        <Person x={700} y={1500} s={1.0} pose={{ ...P.stand, armR: [30, -40], head: 8 }} face={{ eye: "sad", mouth: "sad", facing: -0.5, tear: ((t - t0) / 3) % 1 }} />
        <Umbrella x={738} y={1230} s={0.9} />
      </g>
      <Rain t={t} />
      <rect width={1080} height={1920} fill="#1a2430" opacity={0.18} />
    </svg>
  );
};

/** 11 · new city, new name, new life, new family */
export const NewLife: React.FC<{ t: number }> = ({ t }) => {
  const name = W(11, "اسم") - 0.15, fam = W(11, "خانواده") - 0.15;
  if (t < name) {
    const t0 = S(11) - 0.2;
    const k = t - t0;
    return (
      <svg width={1080} height={1920}>
        <Sky id="n11" c={["#1a1f3a", "#3a3a6a", "#e07a6a"]} />
        {[...Array(16)].map((_, i) => { const h = 300 + hn(i) * 600; const x = ((i * 90 - k * 60) % 1440 + 1440) % 1440 - 180; return <g key={i}><rect x={x} y={1240 - h} width={86} height={h} fill={i % 2 ? "#2a2c4a" : "#33355a"} />{[...Array(Math.floor(h / 70))].map((_, j) => <rect key={j} x={x + 14 + (j % 2) * 34} y={1240 - h + 30 + j * 64} width={20} height={26} fill="#ffd27a" opacity={hn(i, j) > 0.4 ? 0.9 : 0.15} />)}</g>; })}
        <rect x={0} y={1240} width={1080} height={700} fill="#2a2a3a" />
        {[...Array(8)].map((_, i) => <rect key={i} x={((i * 180 - k * 300) % 1440 + 1440) % 1440 - 180} y={1420} width={100} height={12} fill="#e8d07a" />)}
        <Person x={540} y={1230} s={1.0} pose={{ ...P.stand, armR: [6, 4], legL: [-22 * Math.sin(k * 7), 10], legR: [22 * Math.sin(k * 7), 10] }} face={{ facing: -0.6, mouth: "flat" }} />
        <g transform={`translate(${540 + 64} ${1230 - 20 + Math.abs(Math.sin(k * 7)) * 6})`}><rect x={-10} y={0} width={110} height={80} rx={10} fill="#8a4a2c" /><rect x={30} y={-14} width={30} height={16} rx={4} fill="none" stroke="#5a2a14" strokeWidth={5} /></g>
      </svg>
    );
  }
  if (t < fam) {
    // ID card: old name crossed out, new name written
    const cross = rk(t, name + 0.25, name + 0.6), write = rk(t, name + 0.55, name + 1.1);
    const a = pop(t, name);
    return (
      <svg width={1080} height={1920}>
        <Sky id="n11b" c={["#2a2f4a", "#4a4f7a", "#7a7fae"]} />
        <g transform={`translate(540 860) scale(${a}) rotate(${(1 - a) * -20 - 4})`}>
          <rect x={-420} y={-270} width={840} height={540} rx={34} fill="#f4efe2" />
          <rect x={-420} y={-270} width={840} height={110} rx={34} fill="#2f8f83" />
          <rect x={-420} y={-190} width={840} height={30} fill="#2f8f83" />
          <text x={380} y={-195} textAnchor="start" fontFamily={BLACK} fontSize={52} fill="#fff" direction="rtl">کارت شناسایی</text>
          <rect x={-380} y={-120} width={250} height={320} rx={18} fill="#cfe0e8" />
          <g transform="translate(-255 250) scale(0.95)"><Person x={0} y={-60} s={0.9} pose={P.stand} face={{ mouth: "flat" }} /></g>
          <text x={380} y={-50} textAnchor="start" fontFamily={BLACK} fontSize={40} fill="#7a7468" direction="rtl">نام:</text>
          <text x={260} y={-50} textAnchor="start" fontFamily={BLACK} fontSize={64} fill="#2a2620" direction="rtl">امید</text>
          <path d={`M60 -70 L${60 + 210 * cross} -70`} stroke="#d8323c" strokeWidth={12} strokeLinecap="round" />
          <g opacity={write}><text x={260} y={60} textAnchor="start" fontFamily={BLACK} fontSize={72} fill="#1f5ad8" direction="rtl" style={{ clipPath: `inset(0 0 0 ${(1 - write) * 100}%)` }}>آرش</text></g>
          <text x={380} y={150} textAnchor="start" fontFamily={BLACK} fontSize={40} fill="#7a7468" direction="rtl">تولد:</text>
          <text x={240} y={150} textAnchor="start" fontFamily={BLACK} fontSize={46} fill="#2a2620" direction="rtl">۱۴۹۸</text>
        </g>
      </svg>
    );
  }
  // new family photo
  const a = pop(t, fam);
  return (
    <svg width={1080} height={1920}>
      <Sky id="n11c" c={["#f2c48a", "#f7dcb0", "#fbecd2"]} />
      <rect x={0} y={1250} width={1080} height={700} fill="#c9a27a" />
      <g transform={`translate(540 880) scale(${0.6 + 0.4 * a}) rotate(${(1 - a) * 15})`} opacity={clamp(a * 2)}>
        <rect x={-430} y={-380} width={860} height={760} rx={10} fill="#7a4a2c" />
        <rect x={-400} y={-350} width={800} height={700} fill="#bfe0ee" />
        <rect x={-400} y={130} width={800} height={220} fill="#9ccf86" />
        <Person x={-140} y={150} s={1.0} pose={{ ...P.stand, armR: [60, -20] }} face={{ eye: "happy", mouth: "smile", facing: 0.3 }} />
        <Person x={80} y={150} s={1.0} look={{ ...WIFE, top: "#c9567a", bottom: "#c9567a", hair: "#2a1a14" }} pose={P.stand} face={{ eye: "happy", mouth: "smile", facing: -0.2 }} />
        <Person x={250} y={210} s={0.9} look={{ ...KID1, top: "#3a8ad8" }} pose={P.wave} face={{ eye: "happy", mouth: "grin" }} />
      </g>
    </svg>
  );
};

/** 12 · …and you bury them too: a whole field of graves, fog, pull out. */
export const Field: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(12) - 0.2;
  const z = lerp(1.3, 0.85, rk(t, t0, t0 + 2.2, ease));
  return (
    <svg width={1080} height={1920}>
      <g transform={cam(z, 540, 1200)}>
        <Sky id="f12" c={["#3a4450", "#5a6470", "#7a848e"]} />
        <rect x={-400} y={1000} width={1900} height={1400} fill="#4a5450" />
        {[...Array(5)].map((_, r) => [...Array(7 + r)].map((_, i) => <Grave key={`${r}-${i}`} x={-260 + i * (1600 / (7 + r)) + (r % 2) * 60} y={1080 + r * 170} s={0.35 + r * 0.1} a={pop(t, t0 + 0.2 + (r * 7 + i) * 0.025)} flowers={hn(r, i) > 0.7} />))}
        <Person x={540} y={1560} s={0.6} pose={{ ...P.stand, head: 10 }} face={{ eye: "sad", mouth: "sad" }} />
        <Umbrella x={562} y={1395} s={0.55} />
        {[0, 1, 2].map((i) => <rect key={i} x={-400} y={1100 + i * 200 + Math.sin(t + i) * 20} width={1900} height={120} fill="#c8d0d8" opacity={0.16} />)}
      </g>
      <Rain t={t} o={0.35} />
    </svg>
  );
};

/** 13 · three family photos fall away; you stop; alone at a rainy window at night. */
export const Alone: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S(13) - 0.2;
  const win = W(13, "تنهایی") - 0.3;
  if (t < win) {
    const close = W(13, "دل");
    return (
      <svg width={1080} height={1920}>
        <Sky id="a13" c={["#3a3048", "#4a4058", "#5a5068"]} />
        {[0, 1, 2].map((i) => {
          const fall = rk(t, t0 + 0.5 + i * 0.35, t0 + 1.1 + i * 0.35, (q) => q * q);
          const x = 270 + i * 270, y = 640 + fall * 1400;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(i - 1) * 6 + fall * (i % 2 ? 60 : -60)})`} opacity={1 - fall * 0.5}>
              <rect x={-110} y={-140} width={220} height={280} fill="#6a4a30" />
              <rect x={-94} y={-124} width={188} height={248} fill={["#bfe0ee", "#f2dcb0", "#cfe8c8"][i]} />
              <g transform="translate(-34 70) scale(0.45)"><Person x={0} y={0} pose={P.stand} face={{ eye: "happy" }} /></g>
              <g transform="translate(40 70) scale(0.45)"><Person x={0} y={0} pose={P.stand} look={{ ...WIFE, hair: ["#5a2a1a", "#2a1a14", "#8a5a2a"][i], top: ["#2f8f83", "#c9567a", "#5a6ad8"][i], bottom: ["#2f8f83", "#c9567a", "#5a6ad8"][i] }} face={{ eye: "happy" }} /></g>
            </g>
          );
        })}
        <rect x={0} y={1180} width={1080} height={760} fill="#2a2234" />
        <Person x={540} y={1170} s={1.1} pose={mixPose(P.stand, { ...P.stand, armL: [-20, 60], armR: [20, -60] }, rk(t, close + 0.5, close + 0.9))} face={{ eye: t > close + 0.5 ? "closed" : "sad", mouth: "flat", facing: 0 }} />
        {t > close - 0.15 && (() => {
          const a = rk(t, close - 0.15, close + 0.2, back), lock = rk(t, close + 0.35, close + 0.55, back), grey = rk(t, close + 0.55, close + 0.9);
          return (
            <g transform={`translate(540 ${1010 - a * 90}) scale(${a * 2.6})`}>
              <Heart x={0} y={0} s={1.6} c={mixColor("#ff5a7a", "#6a6470", grey)} />
              <g transform={`translate(0 ${12 + (1 - lock) * -60}) scale(${lock})`} opacity={clamp(lock * 3)}>
                <path d="M-11 -6 L-11 -16 Q-11 -28 0 -28 Q11 -28 11 -16 L11 -6" stroke="#c9ccd2" strokeWidth={5} fill="none" />
                <rect x={-17} y={-8} width={34} height={28} rx={5} fill="#e8c24a" />
                <circle cx={0} cy={4} r={4} fill="#5a4a20" />
              </g>
            </g>
          );
        })()}
      </svg>
    );
  }
  // night window, rain on the glass, city lights
  const k = t - win;
  return (
    <svg width={1080} height={1920}>
      <rect width={1080} height={1920} fill="#1a1626" />
      <g>
        <rect x={140} y={300} width={800} height={900} fill="#0d1430" />
        <Stars t={t} n={30} h={500} o={0.6} />
        {[...Array(12)].map((_, i) => { const h = 200 + hn(i, 4) * 500; return <g key={i}><rect x={140 + i * 70} y={1200 - h} width={64} height={h} fill="#1f2448" />{[...Array(Math.floor(h / 60))].map((_, j) => <rect key={j} x={152 + i * 70 + (j % 2) * 24} y={1200 - h + 20 + j * 56} width={14} height={20} fill="#ffcf6a" opacity={hn(i, j + 3) > 0.55 ? 0.85 : 0.1} />)}</g>; })}
        {[...Array(26)].map((_, i) => { const y = 300 + ((hn(i) * 900 + k * 120 * (0.5 + hn(i, 2))) % 900); return <ellipse key={"d" + i} cx={160 + hn(i, 3) * 760} cy={y} rx={5} ry={9} fill="#bcd0ff" opacity={0.45} />; })}
        <rect x={130} y={290} width={820} height={920} fill="none" stroke="#3a2e40" strokeWidth={28} />
        <path d="M540 290 L540 1210 M130 750 L950 750" stroke="#3a2e40" strokeWidth={16} />
      </g>
      <rect x={0} y={1210} width={1080} height={720} fill="#2a2234" />
      <rect x={100} y={1190} width={880} height={40} fill="#4a3a48" />
      {/* hero from behind-ish: sitting on the sill, mug */}
      <Person x={430} y={1260} s={1.15} pose={{ ...P.sitFront, armR: [20, -110], head: -6 }} face={{ eye: "closed", mouth: "flat", facing: 0.5 }} />
      <g transform="translate(470 1035)"><rect x={-24} y={-30} width={48} height={56} rx={8} fill="#e8e0d0" /><path d="M24 -16 q20 0 20 16 q0 16 -20 16" stroke="#e8e0d0" strokeWidth={8} fill="none" />{[0, 1].map((i) => <path key={i} d={`M${-8 + i * 16} -40 q-10 -20 0 -40`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.4 + 0.3 * Math.sin(t * 3 + i)} transform={`translate(0 ${-((t * 30) % 20)})`} />)}</g>
      <rect width={1080} height={1920} fill="#5a3a8a" opacity={0.08} />
      <circle cx={430} cy={1000} r={600} fill="#ffcf6a" opacity={0.05} />
    </svg>
  );
};
