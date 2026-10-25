// V03 · Episode 5 «خاموشی» — he hears her; Saman shouts; the dog barks; every light in the house dies. Timed from e05-vo.json
import { Dog, Girl } from "./figures";
import { C, Cam, clamp, Dust, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, RimDefs, Vignette, W, H, Whip } from "./lib";
import { Corridor, Door, Skyline, Sky } from "./sets";
import { Saman } from "./e03";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e05-vo.json";

export const vo = voJson as VO;
const OUT = wd(vo, 7, "خاموش");
export const BARKS = [wd(vo, 6, "پارس") - 0.05, wd(vo, 6, "پارس") + 0.38, wd(vo, 6, "کردن") + 0.35, wd(vo, 6, "کردن") + 0.75];

// 1 · hook: her face in the dark, lit from below by the phone; heartbeat push
const S1: ShotFn = ({ t, dur, T }) => {
  const beat = Math.pow(Math.max(0, Math.sin(T * Math.PI * 2.6)), 14);
  return (
    <g>
      <RimDefs id="e5s1rim" color={C.phone} dx={6} dy={1} w={3} blur={1.6} />
      <g transform={`translate(540 900) scale(${1 + beat * 0.025}) translate(-540 -900)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.14} ox={600} oy={900}>
          <rect width={W} height={H} fill="#05080f" />
          <Glow id="e5s1g" cx={820} cy={1100} r={760} color={C.phone} o={0.45 * flicker(T, 3, 0.15)} />
          <Girl x={210} y={4200} s={6.2} filter="url(#e5s1rim)" head={-4} armF={[-4, -4]} armB={[4, -4]} />
        </Cam>
      </g>
      <Vignette id="e5s1v" k={0.95} />
      <Grain t={T} />
    </g>
  );
};

// 2 · the front door, pushing toward the peephole; the red sliver under it breathes with his words
const S2: ShotFn = ({ t, dur, T }) => (
  <Whip id="e5s2" t={t}>
    <Cam t={t} dur={dur} from={1.0} to={1.35} oy={760}>
      <rect width={W} height={H} fill="#0a111f" />
      <Glow id="e5s2m" cx={140} cy={600} r={700} color={C.moon} o={0.12} />
      <rect x={0} y={1640} width={W} height={280} fill="#05080f" />
      <Door x={290} y={560} w={500} h={1080} fill="#141f35" peep={0.3 + 0.4 * flicker(T, 13, 0.6)} />
      <rect x={290} y={1632} width={500} height={10} fill={C.red} opacity={0.4 + 0.4 * flicker(T, 7, 0.7)} />
      <Glow id="e5s2u" cx={540} cy={1650} r={420} color={C.red} o={0.35} sy={0.22} />
    </Cam>
    <Dust t={T} n={24} color={C.moon} o={0.3} />
    <Vignette id="e5s2v" k={0.92} />
    <Grain t={T} />
  </Whip>
);

// 3 · outside, inches from the door: his face pressed to the wood; on "با کی" his eyes slide to us
const S3: ShotFn = ({ t, dur, T }) => {
  const look = easeInOut(prog(T, wd(vo, 3, "با") - 0.1, wd(vo, 3, "کی") + 0.2));
  const fl = flicker(T, 13, 0.5);
  return (
    <g>
      <Cam t={t} dur={dur} from={1.02} to={1.12} ox={460} oy={880}>
        <Corridor id="e5s3c" vx={220} vy={820} fw={200} fh={360} wall="#0d1423" floor="#080c16" lightK={0.8 * fl} doors={2} />
        {/* the door surface, right */}
        <rect x={700} y={0} width={400} height={1920} fill="#101a2c" />
        <rect x={690} y={0} width={14} height={1920} fill="#05080f" />
        <Glow id="e5s3r" cx={300} cy={700} r={700} color={C.red} o={0.25 * fl} />
        {/* the face, almost touching the door */}
        <g transform="translate(560 880) rotate(6)">
          <ellipse cx={0} cy={0} rx={200} ry={250} fill="#090c12" />
          <path d="M-200,-80 C-220,-200 -90,-270 0,-262 C90,-270 220,-200 200,-80 C160,-160 -160,-160 -200,-80 Z" fill="#05070b" />
          <ellipse cx={-185} cy={30} rx={34} ry={64} fill="#090c12" />
          {[-70, 70].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy={-10} rx={52} ry={38} fill="#000" />
              <ellipse cx={ex} cy={-8} rx={28} ry={14} fill={C.bone} />
              <circle cx={ex + lerp(16, -6, look)} cy={-8 + lerp(2, 0, look)} r={5} fill="#000" />
            </g>
          ))}
          <ellipse cx={0} cy={140} rx={46} ry={10 + 6 * Math.abs(Math.sin(T * 9)) * (T > wd(vo, 3, "رها") && T < wd(vo, 3, "می‌زنی") + 0.4 ? 1 : 0)} fill="#000" />
          {/* rim of red on the cheek */}
          <path d="M-196,-40 C-210,60 -170,180 -90,230" stroke={C.red} strokeWidth={6} fill="none" opacity={0.6 * fl} />
        </g>
      </Cam>
      <Dust t={T} n={20} color="#ff9a8c" o={0.25} />
      <Vignette id="e5s3v" k={0.95} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 4 · the phone slips from her fingers (slow-mo) and she catches it
const S4: ShotFn = ({ t, dur, T }) => {
  const slip = easeIn(prog(T, wd(vo, 4, "نزدیک"), wd(vo, 4, "بیفته")));
  const catchK = easeOut(prog(T, wd(vo, 4, "بیفته") + 0.05, wd(vo, 4, "بیفته") + 0.3));
  const fall = slip * (1 - catchK * 0.75);
  const sec = 41 + Math.floor(T - 10.8);
  return (
    <Whip id="e5s4" t={t} dir={-1}>
      <RimDefs id="e5s4rim" color={C.phone} dx={2} dy={-4} w={3} blur={2} />
      <Cam t={t} dur={dur} from={1.04} to={1.12} oy={900}>
        <rect width={W} height={H} fill="#070b15" />
        <Glow id="e5s4g" cx={540} cy={900 + fall * 300} r={700} color={C.phone} o={0.4} />
        <g transform={`translate(${fall * 60} ${fall * 360}) rotate(${-6 + fall * 38} 540 900)`}>
          <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
          <rect x={376} y={536} width={328} height={728} rx={36} fill="#13283b" />
          <circle cx={540} cy={760} r={70} fill="#2d4a66" />
          <circle cx={540} cy={742} r={26} fill="#9fbad6" /><path d="M492,800 Q540,760 588,800 Z" fill="#9fbad6" />
          <text x={540} y={900} textAnchor="middle" fontFamily="V03Black" fontSize={52} fill="#fff" direction="rtl">سامان</text>
          <text x={540} y={950} textAnchor="middle" fontFamily="V03Bold" fontSize={30} fill="#9fbad6">{`00:${sec}`}</text>
          <circle cx={540} cy={1170} r={44} fill="#e0242f" />
        </g>
        {/* fingers: slipping off, then snapping shut on the catch */}
        <g fill={C.ink} filter="url(#e5s4rim)">
          <path d="M440,1920 C446,1700 462,1520 476,1380 L700,1380 C712,1520 728,1700 740,1920 Z" />
          {[0, 1, 2].map((i) => <rect key={i} x={326 + catchK * 30} y={1040 + i * 74 + fall * 140} width={78} height={60} rx={30} />)}
        </g>
      </Cam>
      <Vignette id="e5s4v" k={0.9} />
      <Grain t={T} />
    </Whip>
  );
};

// 5 · Saman shouting: snap zooms + red pulses on "بگیر!" and "الان!"
const S5: ShotFn = ({ t, dur, T }) => {
  const h1 = Math.exp(-Math.max(0, T - wd(vo, 5, "بگیر")) * 6) * (T >= wd(vo, 5, "بگیر") ? 1 : 0);
  const h2 = Math.exp(-Math.max(0, T - wd(vo, 5, "الان")) * 6) * (T >= wd(vo, 5, "الان") ? 1 : 0);
  const h = Math.max(h1, h2);
  const z = 1 + 0.12 * (T >= wd(vo, 5, "بگیر") ? 1 : 0) + 0.12 * (T >= wd(vo, 5, "الان") ? 1 : 0);
  return (
    <Whip id="e5s5" t={t}>
      <RimDefs id="e5s5rim" color="#ff5a4a" dx={-5} dy={-3} w={3} blur={1.5} />
      <g transform={`translate(${noise(T * 40, 2) * 18 * h} ${noise(T * 37, 5) * 14 * h}) translate(560 900) scale(${z}) translate(-560 -900)`}>
        <rect width={W} height={H} fill="#0a0d16" />
        <rect x={120} y={220} width={380} height={640} fill="#3a0a10" />
        <Glow id="e5s5w" cx={310} cy={540} r={520} color={C.red} o={0.5 + 0.4 * h} />
        <g fill="#05070c"><rect x={100} y={200} width={420} height={24} /><rect x={100} y={856} width={420} height={24} /><rect x={300} y={220} width={14} height={640} /></g>
        <Saman x={610} y={1080} s={2.0} talk={Math.sin(T * 14)} filter="url(#e5s5rim)" />
      </g>
      <rect width={W} height={H} fill={C.red} opacity={0.18 * h} style={{ mixBlendMode: "screen" }} />
      <Vignette id="e5s5v" k={0.9} />
      <Grain t={T} o={0.12 + h * 0.1} />
    </Whip>
  );
};

// 6 · Zorat barking at the door — each bark jolts the frame
const S6: ShotFn = ({ t, dur, T }) => {
  const b = BARKS.reduce((m, k) => Math.max(m, T >= k && T < k + 0.3 ? Math.exp(-(T - k) * 10) : 0), 0);
  return (
    <Whip id="e5s6" t={t} dir={-1}>
      <RimDefs id="e5s6rim" color="#9db8e6" dx={-5} dy={-4} w={3} blur={1.4} />
      <g transform={`translate(${noise(T * 50, 3) * 16 * b} ${noise(T * 44, 6) * 12 * b})`}>
        <Cam t={t} dur={dur} from={1.05} to={1.15} ox={640} oy={1050}>
          <rect width={W} height={H} fill="#0c1526" />
          <Glow id="e5s6g" cx={120} cy={500} r={800} color={C.moon} o={0.2} />
          <rect x={0} y={1450} width={W} height={500} fill="#070b14" />
          <rect x={880} y={0} width={300} height={1920} fill="#141f35" />
          <rect x={860} y={0} width={24} height={1920} fill="#060a14" />
          <rect x={880} y={1442} width={300} height={8} fill={C.red} opacity={0.6} />
          <g transform="translate(-245 -410) scale(1.5)">
            <Dog x={420} y={1240} s={1} head={-10 - b * 8} jaw={b} ears={0} tail={-30} bristle={1} eye={0.9} legs={[-8, 6, 10, -6]} filter="url(#e5s6rim)" />
          </g>
        </Cam>
      </g>
      <Vignette id="e5s6v" k={0.92} />
      <Grain t={T} />
    </Whip>
  );
};

// 7 · the hallway with a warm lamp — it stutters and dies; only the phone and the red under the door remain
const S7: ShotFn = ({ t, dur, T }) => {
  const stut = T < OUT - 0.1 ? 1 : T < OUT + 0.45 ? (Math.floor((T - OUT) * 26) % 3 === 0 ? 1 : 0.1) : 0;
  const lamp = stut * (0.92 + 0.08 * flicker(T, 2, 0.3));
  return (
    <Whip id="e5s7" t={t}>
      <RimDefs id="e5s7rim" color={lamp > 0.5 ? "#ffc27a" : C.phone} dx={0} dy={-5} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1250}>
        <rect width={W} height={H} fill={lamp > 0.5 ? "#2a2220" : "#04060b"} />
        <Glow id="e5s7l" cx={540} cy={420} r={900} color={C.amber} o={0.55 * lamp} />
        {/* ceiling lamp */}
        <rect x={536} y={0} width={8} height={300} fill="#05070c" />
        <path d="M440,380 L640,380 L590,300 L490,300 Z" fill="#05070c" />
        <ellipse cx={540} cy={384} rx={100} ry={14} fill={lamp > 0.5 ? "#ffe2b0" : "#141414"} />
        <rect x={0} y={1600} width={W} height={320} fill={lamp > 0.5 ? "#17120f" : "#020306"} />
        <Door x={700} y={560} w={380} h={1040} fill={lamp > 0.5 ? "#3a2e28" : "#080b12"} peep={0.3} />
        <rect x={700} y={1592} width={380} height={8} fill={C.red} opacity={lamp > 0.5 ? 0.2 : 0.8} />
        <Glow id="e5s7u" cx={890} cy={1610} r={300} color={C.red} o={lamp > 0.5 ? 0.05 : 0.4} sy={0.25} />
        <Girl x={470} y={1650} s={1.35} filter="url(#e5s7rim)" head={-6} armF={[-60, 195]} armB={[8, -4]} phone={0.9} lean={-3} />
        <Dog x={210} y={1650} s={0.95} head={-4} jaw={0.4 * Math.abs(Math.sin(T * 5))} ears={0} tail={-30} bristle={1} eye={lamp > 0.5 ? 0 : 0.9} filter="url(#e5s7rim)" />
        {lamp < 0.5 && <Glow id="e5s7p" cx={520} cy={1020} r={240} color={C.phone} o={0.5} />}
      </Cam>
      <Vignette id="e5s7v" k={lamp > 0.5 ? 0.8 : 0.97} />
      <Grain t={T} o={lamp > 0.5 ? 0.09 : 0.16} />
    </Whip>
  );
};

// 8 · out of the window: the city's lights die in a wave; a scream; red lights flash in the street
const S8: ShotFn = ({ t, dur, T }) => {
  const wave = prog(T, wd(vo, 8, "خیابون") + 0.1, wd(vo, 8, "خیابون") + 0.9);
  const scream = T >= wd(vo, 8, "جیغ") - 0.05;
  const snap = easeOut(prog(T, wd(vo, 8, "جیغ") - 0.05, wd(vo, 8, "جیغ") + 0.18));
  const red = scream ? (Math.floor(T * 4) % 2 === 0 ? 1 : 0.3) : 0;
  return (
    <g>
      <g transform={`translate(560 1200) scale(${1 + snap * 0.25}) translate(-560 -1200)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.06} oy={1100}>
          <Sky id="e5s8sky" top="#0a1226" bot="#2c3a5c" />
          <Skyline x={0} y={700} w={W} h={520} t={T} seed={11} fill="#070b16" lit="#ffd79a" dark={clamp(wave * 1.2)} />
          {/* a black wave sweeping across the skyline */}
          <rect x={W * (1 - wave) - 40} y={700} width={W * wave + 80} height={520} fill="#070b16" opacity={wave > 0 && wave < 1 ? 0.85 : wave >= 1 ? 0.9 : 0} />
          {/* the street below */}
          <rect x={0} y={1220} width={W} height={700} fill="#06080e" />
          <path d="M0,1500 L1080,1440" stroke="#0e1422" strokeWidth={90} />
          {red > 0 && <Glow id="e5s8r" cx={760} cy={1460} r={420} color={C.red} o={0.6 * red} />}
          {red > 0 && <Glow id="e5s8b" cx={860} cy={1450} r={300} color="#3a64ff" o={0.4 * (1 - red + 0.3)} />}
          {/* window frame */}
          <g fill="#04060b"><rect x={0} y={0} width={W} height={120} /><rect x={0} y={1800} width={W} height={120} /><rect x={0} y={0} width={70} height={H} /><rect x={1010} y={0} width={70} height={H} /><rect x={530} y={0} width={22} height={H} /><rect x={0} y={960} width={W} height={18} /></g>
        </Cam>
      </g>
      <Dust t={T} n={20} color={C.moon} o={0.25} />
      <Vignette id="e5s8v" k={0.92} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

const easeIn = (k: number) => Math.pow(clamp(k), 2);
const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "از", 0.12), S: S2 },
  { at: at(3, "رها", 0.15), S: S3 },
  { at: at(4, "گوشی", 0.1), S: S4 },
  { at: at(5, "از", 0.1), S: S5 },
  { at: at(6, "یهو", 0.1), S: S6 },
  { at: at(7, "همون", 0.12), S: S7 },
  { at: at(8, "و", 0.15), S: S8 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [1.5, 5.5, 9.6, 11.9, 12.6, 14.2, BARKS[0] + 0.05, 20.6, OUT + 0.2, OUT + 1.0, 23.9, 25.2, vo.total + 0.9];
