// V03 · Episode 1 «کسی پشت در بود» — shots timed from e01-vo.json
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, clamp, Dust, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, RimDefs, Vignette, W, H } from "./lib";
import { Building, Clock, Corridor, Couch, Door, Moon, Sky, Skyline } from "./sets";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e01-vo.json";

export const vo = voJson as VO;
const BELL1 = wd(vo, 1, "زنگ") - 0.15, BELL2 = wd(vo, 4, "زنگ") - 0.2;
const ring = (T: number, at: number) => (T >= at && T < at + 1.1 ? Math.exp(-(T - at) * 3.5) : 0);

// 1 · the building at midnight, one top-floor window glowing (title)
const S1: ShotFn = ({ t, dur, T }) => {
  const r = ring(T, BELL1);
  return (
    <g>
      <Cam t={t} dur={dur} from={1.0} to={1.14} oy={980} ox={250}>
        <Sky id="s1sky" top="#050a18" bot="#1f2f50" />
        <Moon id="s1m" x={860} y={640} r={62} t={T} />
        <Skyline x={0} y={1050} w={W} h={360} t={T} seed={9} fill="#0a1120" lit="#e9c48a" />
        <Building x={70} y={780} w={700} h={1140} t={T} win={(i) => (i === 0 ? { lit: 0.85 * flicker(T, 2, 0.2) + r * 0.15, color: C.phone } : i === 7 ? { lit: 0.25, color: C.amber } : { lit: 0 })} />
        {/* power line + tree */}
        <path d="M-20,700 Q540,820 1100,690" stroke="#04060b" strokeWidth={4} fill="none" />
        <path d="M-20,740 Q540,860 1100,730" stroke="#04060b" strokeWidth={3} fill="none" />
        <g fill="#04060b">
          <rect x={900} y={980} width={34} height={940} />
          {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={917 + Math.sin(i * 2.1) * 120 + noise(T * 0.5 + i, 4) * 6} cy={1000 + i * 38 - (i % 3) * 30} rx={110 - i * 3} ry={70} />)}
        </g>
        <rect x={0} y={1840} width={W} height={80} fill="#03050a" />
      </Cam>
      {r > 0 && <Glow id="s1r" cx={228} cy={960} r={260 * (1 + (1 - r))} color={C.phone} o={r * 0.5} />}
      <Dust t={T} n={30} color={C.moon} o={0.35} />
      <Vignette id="s1v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// 2 · the wall clock: 23:58, second hand ticking
const S2: ShotFn = ({ t, dur, T }) => {
  const sec = 41 + Math.floor(T) + easeOut(clamp((T % 1) * 8)); // ticks
  const minute = 58 + (T > wd(vo, 2, "شب") ? 0 : 0);
  return (
    <g>
      <Cam t={t} dur={dur} from={1.05} to={1.16} oy={880}>
        <rect width={W} height={H} fill="#0c1424" />
        {/* window-cross moonlight on the wall */}
        <g opacity={0.5} style={{ mixBlendMode: "screen" }}>
          <polygon points="80,300 760,180 900,1500 140,1700" fill="#2b4068" />
          <polygon points="400,240 440,234 540,1600 500,1610" fill="#0c1424" />
          <polygon points="110,980 840,880 846,920 116,1022" fill="#0c1424" />
        </g>
        <Clock x={540} y={880} r={330} hours={23 + minute / 60} sec={sec} face="#b9c6da" />
        <Glow id="s2g" cx={420} cy={700} r={420} color={C.moon} o={0.25} />
      </Cam>
      <Vignette id="s2v" k={0.92} />
      <Grain t={T} />
    </g>
  );
};

// 3 · the living room: Raha on the couch, phone glow on her face, Zorat asleep on the rug
const S3: ShotFn = ({ t, dur, T }) => {
  const scroll = Math.sin(T * 2.6) * 2;
  const glowK = 0.85 + 0.15 * flicker(T, 7, 0.4);
  return (
    <g>
      <RimDefs id="s3rim" color="#6f8cc0" dx={-3} dy={-4} w={2.5} />
      <RimDefs id="s3rimP" color={C.phone} dx={0} dy={-5} w={2.5} blur={2} />
      <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1150} ox={380}>
        <rect width={W} height={H} fill="#0b1324" />
        {/* window */}
        <Sky id="s3sky" top="#0e1a36" bot="#2b416a" x={170} y={330} w={740} h={720} />
        <Moon id="s3m" x={720} y={500} r={56} t={T} />
        <Skyline x={170} y={800} w={740} h={250} t={T} seed={4} fill="#08101f" lit="#e9c48a" />
        <g fill="#060a14">
          <rect x={150} y={310} width={780} height={26} /><rect x={150} y={1040} width={780} height={30} />
          <rect x={150} y={310} width={22} height={760} /><rect x={908} y={310} width={22} height={760} />
          <rect x={530} y={310} width={16} height={760} /><rect x={150} y={660} width={780} height={14} />
          {/* curtains */}
          <path d="M60,280 C120,520 110,860 150,1180 L40,1180 Z" /><path d="M1020,280 C960,520 970,860 930,1180 L1040,1180 Z" />
        </g>
        {/* moonlight shaft onto the floor */}
        <polygon points="172,1070 908,1070 1000,1920 -40,1920" fill={C.moon} opacity={0.06} style={{ mixBlendMode: "screen" }} />
        {/* small wall clock + floor */}
        <rect x={0} y={1500} width={W} height={420} fill="#070b15" />
        <ellipse cx={560} cy={1700} rx={460} ry={90} fill="#0e1830" />
        <Couch x={60} y={1260} w={960} fill="#0a1120" />
        {/* Raha lying, head on the left arm, phone above her face */}
        <Girl x={900} y={1196} s={1.14} rot={-90} filter="url(#s3rim)" armF={[-92 + scroll, -58]} armB={[-60, -40]} legs={[-6, 12, -48, 92]} head={-8} phone={glowK} />
        <Glow id="s3ph" cx={258} cy={980} r={210} color={C.phone} o={0.55 * glowK} />
        <Dog x={600} y={1700} s={0.78} pose="lie" breath={Math.sin(T * 2.2)} ears={0.3} filter="url(#s3rim)" />
      </Cam>
      <Dust t={T} n={36} color={C.moon} o={0.4} box={[150, 300, 800, 1400]} />
      <Vignette id="s3v" k={0.88} />
      <Grain t={T} />
    </g>
  );
};

// 4 · Zorat asleep in a patch of window light; paws twitch in a dream
const S4: ShotFn = ({ t, dur, T }) => {
  const twitch = T > wd(vo, 3, "پایین") ? Math.max(0, Math.sin((T - 11.6) * 18)) * Math.exp(-(T - 11.6) * 2) : 0;
  return (
    <g>
      <RimDefs id="s4rim" color="#8fb0e0" dx={-4} dy={-5} w={3} blur={1.5} />
      <Cam t={t} dur={dur} from={1.02} to={1.1} oy={1600} ox={600}>
        <rect width={W} height={H} fill="#080d19" />
        {/* couch base at the top, looming */}
        <rect x={-40} y={0} width={1160} height={700} fill="#060a14" />
        <rect x={-40} y={660} width={1160} height={60} rx={20} fill="#0a1120" />
        {[120, 900].map((x) => <rect key={x} x={x} y={710} width={30} height={90} fill="#060a14" />)}
        {/* Raha's arm hanging off the couch, phone glowing in her fingers */}
        <g fill="#04060b" transform={`rotate(${Math.sin(T * 0.9) * 1.5} 760 640)`}>
          <path d="M730,600 C740,700 752,820 760,930 L800,930 C798,820 790,700 790,600 Z" />
          <ellipse cx={780} cy={950} rx={24} ry={30} />
          <rect x={758} y={950} width={44} height={74} rx={7} fill="#0c0c10" />
          <rect x={763} y={956} width={34} height={62} rx={4} fill={C.phone} opacity={0.85 * flicker(T, 9, 0.2)} />
        </g>
        <Glow id="s4ph" cx={780} cy={990} r={260} color={C.phone} o={0.4} />
        {/* floor + window patch with cross */}
        <rect x={0} y={800} width={W} height={1120} fill="#0b1222" />
        <g style={{ mixBlendMode: "screen" }} opacity={0.75}>
          <polygon points="140,960 1020,900 1120,1720 40,1800" fill="#28406c" />
          <polygon points="560,930 610,926 640,1740 586,1744" fill="#0b1222" />
          <polygon points="90,1330 1070,1280 1076,1330 96,1382" fill="#0b1222" />
        </g>
        {/* rug fringe */}
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={40 + i * 34} y1={1790} x2={44 + i * 34} y2={1830} stroke="#05080f" strokeWidth={5} />)}
        <Dog x={470} y={1720} s={1.45} pose="lie" breath={Math.sin(T * 2.2)} ears={0.25 - twitch * 0.3} tail={twitch * 6} head={-twitch * 2} filter="url(#s4rim)" />
      </Cam>
      <Dust t={T} n={40} color={C.moon} o={0.45} box={[100, 800, 900, 1000]} />
      <Vignette id="s4v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// 5 · the front door from inside: the bell rings again (LED + rings + camera jolt)
const S5: ShotFn = ({ t, dur, T }) => {
  const r = ring(T, BELL2);
  const jx = noise(T * 40, 3) * 14 * r, jy = noise(T * 37, 8) * 10 * r;
  return (
    <g>
      <g transform={`translate(${jx} ${jy})`}>
        <Cam t={t} dur={dur} from={1.0} to={1.12} oy={980}>
          <rect width={W} height={H} fill="#0a111f" />
          <polygon points="0,0 1080,0 1080,1920 0,1920" fill="#0d1628" />
          {/* moonlight wedge from the living room on the left */}
          <polygon points="0,500 380,560 380,1560 0,1920" fill={C.moon} opacity={0.08} style={{ mixBlendMode: "screen" }} />
          <rect x={0} y={1560} width={W} height={360} fill="#060a13" />
          <Door x={330} y={520} w={420} h={1040} fill="#141f35" peep={0.35 + r * 0.4} />
          {/* coat on a hook + shoe rack */}
          <g fill="#05080f"><rect x={110} y={620} width={60} height={10} /><path d="M120,630 C80,700 70,900 90,1060 L210,1060 C220,900 200,700 160,630 Z" />
            <rect x={60} y={1440} width={200} height={120} /></g>
          {/* intercom */}
          <rect x={850} y={930} width={90} height={150} rx={10} fill="#05080f" />
          <circle cx={895} cy={970} r={9} fill={C.red} opacity={0.25 + 0.75 * r} />
          {r > 0 && <Glow id="s5led" cx={895} cy={970} r={120} color={C.red} o={r} />}
          {[0, 1, 2].map((i) => { const k = clamp((T - BELL2) * 2.2 - i * 0.25); return k > 0 && k < 1 ? <circle key={i} cx={895} cy={970} r={40 + k * 260} fill="none" stroke={C.red} strokeWidth={4} opacity={(1 - k) * 0.6} /> : null; })}
        </Cam>
      </g>
      <Dust t={T} n={30} color={C.moon} o={0.3 + r * 0.5} />
      <Vignette id="s5v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// 6 · the hallway: Raha walks toward the door and stops when she hears the voice
const S6: ShotFn = ({ t, dur, T }) => {
  const stopAt = wd(vo, 5, "صدای") + 0.15;
  const k = easeInOut(clamp((T - (S6at - 0.1)) / (stopAt - S6at + 0.1)));
  const walking = T < stopAt;
  const step = walking ? T * 7.5 : Math.PI / 2 * 0; // still
  const s = lerp(1.55, 0.86, k), y = lerp(2050, 1500, k) - (walking ? Math.abs(Math.sin(T * 7.5)) * 10 : 0);
  return (
    <g>
      <RimDefs id="s6rim" color={C.phone} dx={0} dy={-3} w={2} blur={2} />
      <Cam t={t} dur={dur} from={1.0} to={1.06} oy={1100}>
        <Corridor id="s6c" vx={540} vy={1000} fw={380} fh={620} wall="#111b30" floor="#0b1222" light={C.moon} lightK={0.25} doors={2}>
          <Door x={400} y={720} w={280} h={560} fill="#172440" peep={0.5} />
        </Corridor>
        {/* a frame on the wall */}
        <polygon points="70,700 230,760 230,980 70,960" fill="#05080f" />
        <polygon points="90,730 210,780 210,950 90,935" fill="#1b2a47" />
        {/* phone glow ahead of her */}
        <Glow id="s6g" cx={540} cy={y - 560 * s} r={300 * s} color={C.phone} o={0.35} />
        <Figure x={540} y={y} s={s} h={600} hair="pony" step={walking ? step : undefined} />
      </Cam>
      <Vignette id="s6v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};
let S6at = 0;

// 7 · close on Raha at the door: her hand rises to the lock while the old man speaks
const S7: ShotFn = ({ t, dur, T }) => {
  const reach = easeInOut(prog(T, wd(vo, 6, "دخترم"), wd(vo, 7, "میشه")));
  return (
    <g>
      <RimDefs id="s7rim" color="#7f9ccc" dx={-5} dy={-3} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.0} to={1.1} ox={700} oy={1000}>
        <rect width={W} height={H} fill="#0b1324" />
        <polygon points="0,0 520,0 520,1920 0,1920" fill={C.moon} opacity={0.07} style={{ mixBlendMode: "screen" }} />
        {/* the door, close and big on the right */}
        <rect x={620} y={-40} width={520} height={2000} fill="#141f35" />
        <rect x={600} y={-40} width={26} height={2000} fill="#060a14" />
        <rect x={700} y={200} width={340} height={700} fill="none" stroke="#0a1120" strokeWidth={10} />
        <rect x={700} y={1000} width={340} height={900} fill="none" stroke="#0a1120" strokeWidth={10} />
        {/* deadbolt + chain */}
        <rect x={660} y={930} width={70} height={90} rx={10} fill="#05080f" />
        <circle cx={695} cy={975} r={18} fill="#1a263d" />
        <path d="M740,860 q60,80 10,170" stroke="#05080f" strokeWidth={7} fill="none" strokeDasharray="12 6" />
        <Girl x={330} y={2350} s={2.15} filter="url(#s7rim)" head={6 + noise(T, 5) * 1.5} lean={4}
          armF={[lerp(-8, -62, reach), lerp(-10, -64, reach)]} armB={[6, -4]} />
      </Cam>
      <Vignette id="s7v" k={0.92} />
      <Grain t={T} />
    </g>
  );
};

// 8 · the dark corridor outside: an old man stands at her door, too still
const S8: ShotFn = ({ t, dur, T }) => {
  const fl = flicker(T, 13, 0.5);
  const tilt = lerp(0, 9, easeInOut(prog(t, 0.5, dur)));
  return (
    <g>
      <RimDefs id="s8rim" color={C.red} dx={-4} dy={-2} w={2.5} blur={1.5} />
      <Cam t={t} dur={dur} from={1.0} to={1.18} ox={700} oy={1000}>
        <Corridor id="s8c" vx={430} vy={880} fw={300} fh={480} wall="#0d1423" floor="#080c16" lightK={0.75 * fl} doors={3} />
        {/* her door on the right wall, near */}
        <polygon points="860,560 1080,420 1080,1920 860,1500" fill="#101a2c" />
        <circle cx={900} cy={1000} r={8} fill="#04070d" />
        <Figure x={700} y={1520} s={1.25} h={600} hair="old" hunch={1} build={1.08} headTilt={tilt} filter="url(#s8rim)" />
        <Glow id="s8f" cx={430} cy={1140} r={500} color={C.red} o={0.12 * fl} sy={0.3} />
      </Cam>
      <Dust t={T} n={26} color="#ff8f80" o={0.25} />
      <Vignette id="s8v" k={0.95} />
      <Grain t={T} o={0.12} />
    </g>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "ساعت", 0.1), S: S2 },
  { at: at(2, "روی", 0.25), S: S3 },
  { at: at(3, "سگم", 0.1), S: S4 },
  { at: BELL2 - 0.12, S: S5 },
  { at: at(5, "رفتم", 0.08), S: S6 },
  { at: at(6, "رها", 0.1), S: S7 },
  { at: at(7, "میشه", 0.1), S: S8 },
];
S6at = SHOTS[5].at;
export const TOTAL = vo.total + 1.6;
export const LOOK = [0.6, 2.4, 4.6, 7.5, 11.8, BELL2 + 0.15, 18.4, 21.0, 24.6, 27.0, 28.6, vo.total + 0.9];
