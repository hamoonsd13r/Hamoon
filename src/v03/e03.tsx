// V03 · Episode 3 «از پشت چشمی» — the peephole, and the first call from Saman. Shots timed from e03-vo.json
import React from "react";
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, Dust, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, Rain, RimDefs, Vignette, W, H } from "./lib";
import { Corridor } from "./sets";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e03-vo.json";

export const vo = voJson as VO;
const RING = wd(vo, 5, "همون") - 0.05;

// fisheye peephole view: content drawn inside a lens circle, dark barrel edge, faint chromatic ring
export const Peep: React.FC<{ id: string; r?: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ id, r = 440, cx = 540, cy = 900, children }) => (
  <g>
    <rect width={W} height={H} fill="#020306" />
    <defs>
      <clipPath id={`${id}clip`}><circle cx={cx} cy={cy} r={r} /></clipPath>
      <radialGradient id={`${id}lens`} cx="50%" cy="50%" r="50%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="88%" stopColor="#000" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#000" stopOpacity="1" />
      </radialGradient>
    </defs>
    <g clipPath={`url(#${id}clip)`}>
      {children}
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={`url(#${id}lens)`} />
    </g>
    <circle cx={cx - 3} cy={cy} r={r - 2} fill="none" stroke="#ff3b4a" strokeWidth={3} opacity={0.18} />
    <circle cx={cx + 3} cy={cy} r={r - 2} fill="none" stroke="#5aa0ff" strokeWidth={3} opacity={0.18} />
    <path d={`M${cx - r * 0.62},${cy - r * 0.55} A${r * 0.85},${r * 0.85} 0 0 1 ${cx + r * 0.1},${cy - r * 0.82}`} stroke="#cfe0ff" strokeWidth={6} fill="none" opacity={0.12} strokeLinecap="round" />
  </g>
);

// the old man's face turned to the lens — only for split-second flashes
export const Face: React.FC<{ cx: number; cy: number; s: number; o: number }> = ({ cx, cy, s, o }) => (
  <g opacity={o} transform={`translate(${cx} ${cy}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={150} ry={190} fill="#0b0e14" />
    <ellipse cx={-130} cy={10} rx={30} ry={52} fill="#0b0e14" />
    <ellipse cx={130} cy={10} rx={30} ry={52} fill="#0b0e14" />
    <ellipse cx={-55} cy={-10} rx={40} ry={30} fill="#000" />
    <ellipse cx={55} cy={-10} rx={40} ry={30} fill="#000" />
    <ellipse cx={-55} cy={-8} rx={20} ry={11} fill={C.bone} />
    <ellipse cx={55} cy={-8} rx={20} ry={11} fill={C.bone} />
    <circle cx={-55} cy={-8} r={3.5} fill="#000" />
    <circle cx={55} cy={-8} r={3.5} fill="#000" />
    <ellipse cx={0} cy={110} rx={34} ry={14} fill="#000" />
    <path d="M-150,-60 C-170,-150 -60,-200 0,-196 C60,-200 170,-150 150,-60 C120,-120 -120,-120 -150,-60 Z" fill="#06080c" />
  </g>
);

// 1 · cold-open hook: a dark lens; the face flashes in it on the key words
const S1: ShotFn = ({ t, dur, T }) => {
  const flashes = [[wd(vo, 1, "چشمیِ") + 0.05, 0.12], [wd(vo, 1, "دیدم") + 0.1, 0.1], [wd(vo, 1, "خوابشو"), 0.3]] as const;
  const f = flashes.reduce((m, [a, d]) => (T >= a && T < a + d ? 1 : m), 0);
  const jx = f ? noise(T * 60, 2) * 18 : 0;
  return (
    <g>
      <Cam t={t} dur={dur} from={1.0} to={1.18} oy={1000}>
        <g transform={`translate(${jx} 0)`}>
          <Peep id="e3s1" r={300} cy={1000}>
            <rect width={W} height={H} fill={f ? "#2a0a0e" : "#080b12"} />
            <ellipse cx={540} cy={1060} rx={260} ry={120} fill={C.red} opacity={0.08 + 0.08 * flicker(T, 13, 0.6)} />
            {f > 0 && <Face cx={540} cy={1010} s={1.25} o={1} />}
          </Peep>
        </g>
      </Cam>
      {f > 0 && <rect width={W} height={H} fill={C.red} opacity={0.08} style={{ mixBlendMode: "screen" }} />}
      <Vignette id="e3s1v" k={0.9} />
      <Grain t={T} o={f ? 0.25 : 0.1} />
    </g>
  );
};

// the inside of the door, side-on, with Raha's face close to it
export const AtDoor: React.FC<{ id: string; t: number; dur: number; T: number; close: number; lean: number; dog?: boolean }> = ({ id, t, dur, T, close, lean, dog }) => (
  <g>
    <RimDefs id={`${id}rim`} color="#8aa6d6" dx={-5} dy={-3} w={3} blur={1.5} />
    <Cam t={t} dur={dur} from={1.0} to={1.1} ox={620} oy={820}>
      <rect width={W} height={H} fill="#0b1324" />
      <polygon points="0,0 520,0 520,1920 0,1920" fill={C.moon} opacity={0.07} style={{ mixBlendMode: "screen" }} />
      <rect x={640} y={-40} width={520} height={2000} fill="#141f35" />
      <rect x={620} y={-40} width={26} height={2000} fill="#060a14" />
      <rect x={720} y={200} width={340} height={520} fill="none" stroke="#0a1120" strokeWidth={10} />
      <circle cx={655} cy={820} r={14} fill="#05080f" />
      <circle cx={655} cy={820} r={6} fill={C.red} opacity={0.35 * flicker(T, 13, 0.6)} />
      {dog && <g><Dog x={190} y={1910} s={1.1} head={-4} ears={0} bristle={1} eye={0.8} tail={-40} filter={`url(#${id}rim)`} /></g>}
      <Girl x={lerp(440 - close * 60, 470 - close * 40, lean)} y={2245 + close * 120} s={2.6 + close * 0.3} filter={`url(#${id}rim)`} head={lerp(4, 10, lean) + noise(T, 5) * 1.2} lean={lerp(4, 9, lean)} armF={[-62, -64]} armB={[6, -4]} />
    </Cam>
    <Vignette id={`${id}v`} k={0.92} />
    <Grain t={T} />
  </g>
);
const S2: ShotFn = ({ t, dur, T }) => <AtDoor id="e3s2" t={t} dur={dur} T={T} close={0} lean={easeInOut(prog(T, wd(vo, 2, "آروم"), wd(vo, 2, "چشمی") + 0.4))} />;
const S5: ShotFn = ({ t, dur, T }) => <AtDoor id="e3s5" t={t} dur={dur} T={T} close={1} lean={1} />;

// 3 · through the peephole: a dead sensor lamp, darkness. 4 · the eyes adjust — he's there, facing the wall.
const peepCorridor = (reveal: boolean): ShotFn => ({ t, dur, T }) => {
  const lamp = !reveal && T > wd(vo, 2, "چراغ") && T < wd(vo, 2, "چراغ") + 0.5 ? (Math.floor(T * 22) % 2) * 0.9 : 0;
  const adapt = reveal ? easeOut(prog(t, 0, 2.2)) : 0.15;
  const fl = flicker(T, 13, 0.5);
  return (
    <g>
      <RimDefs id="e3pcrim" color={C.red} dx={-3} dy={-3} w={2.5} blur={1.4} />
      <Cam t={t} dur={dur} from={reveal ? 1.0 : 1.02} to={reveal ? 1.16 : 1.08} oy={900}>
        <Peep id={reveal ? "e3s4" : "e3s3"}>
          <g transform="translate(540 900) scale(1.25) translate(-540 -900)" opacity={0.35 + 0.65 * adapt}>
            <Corridor id="e3pc" vx={540} vy={860} fw={240} fh={360} wall="#0f1729" floor="#0a0f1b" ceil="#070a12" lightK={(0.35 + 0.5 * adapt) * fl} doors={2} />
            {/* the sensor lamp on the ceiling */}
            <ellipse cx={540} cy={430} rx={60} ry={22} fill="#1a2132" />
            {lamp > 0 && <Glow id="e3lamp" cx={540} cy={440} r={360} color="#ffe6b8" o={lamp} />}
            {reveal && <Figure x={540} y={1440} s={1.45} h={600} hair="old" hunch={1.2} build={1.1} headTilt={-3 + noise(T * 0.4, 7) * 2} filter="url(#e3pcrim)" />}
          </g>
        </Peep>
      </Cam>
      <Dust t={T} n={18} color="#ff9a8c" o={0.2} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 6 · her phone lights up in her hand: unknown number
const S6: ShotFn = ({ t, dur, T }) => {
  const on = T >= RING;
  const buzz = on ? (Math.floor((T - RING) * 2.2) % 2 === 0 ? 1 : 0) : 0;
  const jx = buzz ? noise(T * 90, 4) * 7 : 0, jy = buzz ? noise(T * 85, 9) * 5 : 0;
  const pulse = (T - RING) % 1.2;
  return (
    <g>
      <RimDefs id="e3s6rim" color={C.phone} dx={2} dy={-4} w={3} blur={2} />
      <Cam t={t} dur={dur} from={1.04} to={1.14} oy={900}>
        <rect width={W} height={H} fill="#070b15" />
        <Glow id="e3s6g" cx={540} cy={900} r={760} color={C.phone} o={on ? 0.45 : 0.1} />
        <g transform={`translate(${jx} ${jy}) rotate(-6 540 920)`}>
          {/* phone */}
          <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
          <rect x={376} y={536} width={328} height={728} rx={36} fill={on ? "#0f1e2e" : "#05080c"} />
          {on && <>
            <defs><linearGradient id="e3scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d3a52" /><stop offset="1" stopColor="#0a1420" /></linearGradient></defs>
            <rect x={376} y={536} width={328} height={728} rx={36} fill="url(#e3scr)" />
            {[0, 1].map((i) => { const k = ((pulse + i * 0.6) % 1.2) / 1.2; return <circle key={i} cx={540} cy={760} r={70 + k * 90} fill="none" stroke={C.phone} strokeWidth={3} opacity={(1 - k) * 0.7} />; })}
            <circle cx={540} cy={760} r={70} fill="#2d4a66" />
            <circle cx={540} cy={742} r={26} fill="#9fbad6" /><path d="M492,800 Q540,760 588,800 Z" fill="#9fbad6" />
            <text x={540} y={900} textAnchor="middle" fontFamily="V03Black" fontSize={52} fill="#fff" direction="rtl">ناشناس</text>
            <text x={540} y={950} textAnchor="middle" fontFamily="V03Bold" fontSize={28} fill="#9fbad6" direction="rtl">تماس ورودی…</text>
            <circle cx={460} cy={1170} r={44} fill="#e0242f" /><circle cx={620} cy={1170} r={44} fill="#2fbf5a" />
            <rect x={440} y={1162} width={40} height={14} rx={7} fill="#fff" transform="rotate(-20 460 1170)" />
            <rect x={600} y={1162} width={40} height={14} rx={7} fill="#fff" transform="rotate(20 620 1170)" />
          </>}
          {/* hand wrapping the phone */}
          <g fill={C.ink} filter="url(#e3s6rim)">
            <path d="M440,1920 C446,1640 462,1420 470,1250 L690,1250 C704,1420 724,1640 740,1920 Z" />
            {[0, 1, 2].map((i) => <rect key={i} x={326} y={980 + i * 74} width={78} height={60} rx={30} />)}
            <rect x={680} y={1020} width={84} height={58} rx={29} transform="rotate(-18 720 1050)" />
          </g>
        </g>
      </Cam>
      <Vignette id="e3s6v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// Saman in the back stairwell, phone to his ear (head-and-shoulders silhouette)
export const Saman: React.FC<{ x: number; y: number; s: number; filter?: string; talk: number }> = ({ x, y, s, filter, talk }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={C.ink} filter={filter}>
    <path d="M-260,420 C-250,250 -170,170 -70,150 L70,150 C170,170 250,250 260,420 Z" />
    <path d="M-80,160 L-40,90 L40,90 L80,160 Z" />
    <rect x={-38} y={40} width={76} height={90} rx={20} />
    <g transform={`rotate(${talk * 2})`}>
      <ellipse cx={0} cy={-40} rx={92} ry={112} />
      {Array.from({ length: 12 }, (_, i) => { const a = Math.PI * (1.0 + (i / 11) * 1.0); return <circle key={i} cx={Math.cos(a) * 92} cy={-50 + Math.sin(a) * 104} r={34} />; })}
      <ellipse cx={92} cy={-30} rx={18} ry={30} />
    </g>
    {/* arm up to the ear + phone */}
    <path d="M160,330 C190,230 170,120 120,40 L70,70 C110,150 120,230 100,320 Z" />
    <ellipse cx={100} cy={20} rx={40} ry={48} />
    <rect x={70} y={-70} width={44} height={96} rx={10} fill="#0d0d10" />
  </g>
);

// 7 · the stairwell: red emergency window, rain; snap push-in on "don't open the door!"
const S7: ShotFn = ({ t, dur, T }) => {
  const snap = easeOut(prog(T, wd(vo, 7, "هر") - 0.1, wd(vo, 7, "هر") + 0.15));
  const hit = easeOut(prog(T, wd(vo, 7, "باز") - 0.05, wd(vo, 7, "باز") + 0.12));
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(T * 3.2));
  return (
    <g>
      <RimDefs id="e3s7rim" color="#ff5a4a" dx={-5} dy={-3} w={3} blur={1.5} />
      <RimDefs id="e3s7rimP" color={C.phone} dx={4} dy={-2} w={3} blur={2} />
      <g transform={`translate(540 900) scale(${1 + snap * 0.18 + hit * 0.08}) translate(-540 -900)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.06} oy={900}>
          <rect width={W} height={H} fill="#0a0d16" />
          {/* window with red light and rain */}
          <rect x={120} y={220} width={380} height={640} fill="#3a0a10" opacity={pulse} />
          <Glow id="e3s7w" cx={310} cy={540} r={520} color={C.red} o={0.5 * pulse} />
          <g clipPath="url(#e3s7wc)"><defs><clipPath id="e3s7wc"><rect x={120} y={220} width={380} height={640} /></clipPath></defs><Rain t={T} n={60} color="#ff8a80" o={0.5} /></g>
          <g fill="#05070c"><rect x={100} y={200} width={420} height={24} /><rect x={100} y={856} width={420} height={24} /><rect x={300} y={220} width={14} height={640} /><rect x={100} y={200} width={24} height={680} /><rect x={496} y={200} width={24} height={680} /></g>
          {/* stairs + railing */}
          <g fill="#05070c">
            {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-40 + i * 120} y={1500 - i * 90} width={140} height={600} />)}
          </g>
          <path d="M-40,1300 L1100,520" stroke="#05070c" strokeWidth={16} />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 130} y1={1300 - i * 89} x2={-40 + i * 130} y2={1480 - i * 89} stroke="#05070c" strokeWidth={8} />)}
          <Glow id="e3s7p" cx={720} cy={860} r={260} color={C.phone} o={0.35} />
          <Saman x={610} y={1080} s={2.0} talk={Math.sin(T * 9) * 0.5} filter="url(#e3s7rim)" />
        </Cam>
      </g>
      {hit > 0 && <rect width={W} height={H} fill={C.red} opacity={0.1 * (1 - prog(T, wd(vo, 7, "باز"), wd(vo, 7, "باز") + 0.6))} style={{ mixBlendMode: "screen" }} />}
      <Dust t={T} n={22} color="#ff9a8c" o={0.25} />
      <Vignette id="e3s7v" k={0.9} />
      <Grain t={T} o={0.12} />
    </g>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "آروم", 0.15), S: S2 },
  { at: at(2, "راهرو", 0.1), S: peepCorridor(false) },
  { at: at(3, "آقای", 0.1), S: peepCorridor(true) },
  { at: at(4, "صداش", 0.12), S: S5 },
  { at: RING - 0.08, S: S6 },
  { at: at(6, "رها", 0.1), S: S7 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [wd(vo, 1, "چشمیِ") + 0.1, 3.0, 7.0, 9.4, 13.0, 15.5, 18.0, 20.5, 23.0, 25.0, 27.4, vo.total + 0.9];
