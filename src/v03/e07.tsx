// V03 · Episode 7 «زیرِ زمین» — the bag, the thing dragging past the door, grandpa's bunker, out of the window, the people staring at the sky. Timed from e07-vo.json
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, Dust, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, Rain, RimDefs, Vignette, W, H, Whip } from "./lib";
import { Building, Door, Sky, Skyline } from "./sets";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e07-vo.json";

export const vo = voJson as VO;
const DRAG = wd(vo, 3, "کشیده");
const UP = wd(vo, 7, "آسمون");

const Memory: React.FC<{ T: number }> = ({ T }) => (
  <>
    <rect width={W} height={H} fill="#6a3a10" opacity={0.25} style={{ mixBlendMode: "screen" }} />
    {Array.from({ length: 64 }, (_, i) => <rect key={i} x={0} y={i * 30 + ((T * 60) % 30)} width={W} height={2} fill="#000" opacity={0.22} />)}
  </>
);

// 1 · hook: a cross-section of the city — dark street above, and deep under it one warm room. The camera sinks down to it
const S1: ShotFn = ({ t, dur, T }) => {
  const sink = easeInOut(prog(T, wd(vo, 1, "امن‌ترین") - 0.2, wd(vo, 1, "زمینه") + 0.4));
  return (
    <g>
      <Cam t={t} dur={dur} from={1.0} to={1.06} oy={960}>
        <g transform={`translate(0 ${-sink * 1250})`}>
          <Sky id="e7s1sky" top="#060b18" bot="#1a2440" y={-200} h={1300} />
          <Skyline x={0} y={560} w={W} h={420} t={T} seed={11} fill="#070b16" dark={1} />
          <Building x={80} y={420} w={420} h={680} t={T} />
          <Building x={600} y={520} w={400} h={580} t={T} />
          <rect x={0} y={1100} width={W} height={40} fill="#0e1422" />
          {/* earth layers */}
          <rect x={0} y={1140} width={W} height={1700} fill="#0a0806" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0,${1220 + i * 150} Q270,${1200 + i * 150 + (i % 2 ? 30 : -30)} 540,${1220 + i * 150} T1080,${1220 + i * 150}`} stroke="#15100b" strokeWidth={6} fill="none" />)}
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 197) % W} cy={1200 + ((i * 331) % 1500)} r={4 + (i % 4) * 3} fill="#1a140e" />)}
          {/* shaft + bunker */}
          <rect x={700} y={1140} width={60} height={1090} fill="#050403" />
          {Array.from({ length: 18 }, (_, i) => <rect key={i} x={706} y={1170 + i * 58} width={48} height={6} fill="#2a2016" />)}
          <rect x={290} y={2200} width={600} height={360} fill="#2a1c10" stroke="#3d2c1a" strokeWidth={22} />
          <Glow id="e7s1b" cx={590} cy={2330} r={520} color={C.amber} o={0.65 * flicker(T, 4, 0.15)} />
          <path d="M560,2212 L620,2212 L600,2240 L580,2240 Z" fill="#0a0806" />
          <rect x={360} y={2440} width={170} height={110} fill="#140d07" />
          <rect x={650} y={2470} width={200} height={20} fill="#140d07" />
        </g>
      </Cam>
      <Dust t={T} n={22} color={C.amber} o={0.2 * sink} />
      <Vignette id="e7s1v" k={0.94} />
      <Grain t={T} o={0.12} />
    </g>
  );
};

// 2 · the backpack: each item drops in on its word
const ITEMS: { w: string; draw: (o: number) => React.ReactNode }[] = [
  { w: "آب", draw: () => <g><rect x={-38} y={-150} width={76} height={200} rx={20} fill="#4a7bb0" opacity={0.75} /><rect x={-22} y={-178} width={44} height={30} rx={6} fill="#cfe2f5" /></g> },
  { w: "بیسکویت", draw: () => <g><rect x={-90} y={-60} width={180} height={110} rx={10} fill="#c9873a" /><text x={0} y={10} textAnchor="middle" fontFamily="V03Black" fontSize={34} fill="#3a1f08" direction="rtl">بیسکویت</text></g> },
  { w: "دارو", draw: () => <g><rect x={-40} y={-90} width={80} height={130} rx={12} fill="#e8e2d8" /><rect x={-46} y={-118} width={92} height={36} rx={8} fill={C.red} /><path d="M-14,-20 L14,-20 M0,-34 L0,-6" stroke={C.red} strokeWidth={10} /></g> },
  { w: "کلیدِ", draw: () => <g transform="rotate(-20)"><circle cx={-50} cy={0} r={34} fill="none" stroke="#d6b56a" strokeWidth={14} /><rect x={-18} y={-8} width={120} height={16} fill="#d6b56a" /><rect x={70} y={4} width={12} height={26} fill="#d6b56a" /><rect x={92} y={4} width={10} height={20} fill="#d6b56a" /></g> },
];
const S2: ShotFn = ({ t, dur, T }) => (
  <Whip id="e7s2" t={t}>
    <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1000}>
      <rect width={W} height={H} fill="#070b15" />
      <Glow id="e7s2g" cx={760} cy={500} r={700} color={C.phone} o={0.25} />
      {/* open backpack */}
      <path d="M220,900 C220,820 860,820 860,900 L900,1560 C900,1640 180,1640 180,1560 Z" fill="#141c2c" />
      <path d="M260,880 C300,760 780,760 820,880" stroke="#0a0f1a" strokeWidth={30} fill="none" />
      {ITEMS.map((it, i) => {
        const a = wd(vo, 2, it.w) - 0.1;
        const k = easeOut(prog(T, a, a + 0.35));
        if (T < a) return null;
        const x = 320 + i * 150, y = lerp(300, 960 + (i % 2) * 40, k);
        return <g key={i} transform={`translate(${x} ${y}) rotate(${lerp(-25, (i - 1.5) * 8, k)})`}>{it.draw(1)}</g>;
      })}
      {/* front flap over the items */}
      <path d="M180,1040 L900,1040 L900,1560 C900,1640 180,1640 180,1560 Z" fill="#1b2538" />
      <rect x={430} y={1180} width={220} height={150} rx={20} fill="#141c2c" />
      <path d="M190,1040 L890,1040" stroke="#0a0f1a" strokeWidth={10} strokeDasharray="20 12" />
      <g fill={C.ink}><path d="M960,1920 C930,1600 900,1400 860,1200 L1000,1150 C1040,1400 1080,1600 1090,1920 Z" /></g>
    </Cam>
    <Vignette id="e7s2v" k={0.9} />
    <Grain t={T} />
  </Whip>
);

// 3 · the front door from inside: something drags past — its shadow crosses the red line underneath, slowly
const S3: ShotFn = ({ t, dur, T }) => {
  const pass = prog(T, DRAG - 0.3, wd(vo, 3, "می‌اومد") + 0.8);
  const sx = lerp(180, 940, pass);
  return (
    <Whip id="e7s3" t={t} dir={-1}>
      <Cam t={t} dur={dur} from={1.05} to={1.3} oy={1560}>
        <rect width={W} height={H} fill="#070b14" />
        <rect x={0} y={1640} width={W} height={280} fill="#04060b" />
        <Door x={290} y={560} w={500} h={1080} fill="#0e1628" peep={0.15} />
        <clipPath id="e7s3c"><rect x={290} y={1630} width={500} height={14} /></clipPath>
        <rect x={290} y={1630} width={500} height={14} fill={C.red} opacity={0.85} />
        <g clipPath="url(#e7s3c)"><rect x={sx - 200} y={1620} width={400} height={30} fill="#000" /></g>
        <Glow id="e7s3u" cx={540} cy={1660} r={460} color={C.red} o={0.35} sy={0.2} />
        <rect x={sx - 220} y={1644} width={440} height={260} fill="#000" opacity={pass > 0 && pass < 1 ? 0.8 : 0} />
        <Glow id="e7s3d" cx={sx} cy={1700} r={300} color="#000" o={pass > 0 && pass < 1 ? 0.9 : 0} sy={0.4} />
      </Cam>
      <Dust t={T} n={30} color={C.moon} o={0.35} box={[250, 1300, 580, 360]} />
      <Vignette id="e7s3v" k={0.94} />
      <Grain t={T} o={0.14} />
    </Whip>
  );
};

// 4 · memory (amber): grandpa in his old garage, lifting the hatch in the floor — light from below
const S4: ShotFn = ({ t, dur, T }) => {
  const hatch = easeInOut(prog(T, wd(vo, 4, "پناهگاهِ") - 0.2, wd(vo, 4, "هست") + 0.2));
  return (
    <Whip id="e7s4" t={t}>
      <RimDefs id="e7s4rim" color="#ffc27a" dx={-4} dy={-4} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1200}>
        <rect width={W} height={H} fill="#1c130c" />
        <Glow id="e7s4l" cx={540} cy={300} r={600} color={C.amber} o={0.35} />
        <rect x={0} y={1420} width={W} height={500} fill="#120c07" />
        {/* old car on the lift */}
        <g fill="#0c0805">
          <path d="M120,900 C150,780 280,740 420,740 L620,740 C720,740 800,800 860,880 L960,900 L960,1020 L120,1020 Z" />
          <circle cx={290} cy={1030} r={70} /><circle cx={790} cy={1030} r={70} />
          <rect x={200} y={1100} width={30} height={320} /><rect x={850} y={1100} width={30} height={320} />
          <rect x={180} y={1090} width={720} height={20} />
        </g>
        {/* tool wall */}
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={160 + i * 110} y={420} width={16} height={110 + (i % 3) * 40} fill="#0c0805" />)}
        {/* hatch */}
        <polygon points="560,1560 860,1560 900,1680 520,1680" fill="#2a1a0c" />
        <polygon points="560,1560 860,1560 900,1680 520,1680" fill={C.amber} opacity={0.9 * hatch} />
        <Glow id="e7s4h" cx={710} cy={1600} r={460} color={C.amber} o={0.7 * hatch} />
        <polygon points={`560,1560 860,1560 ${lerp(900, 860, hatch)},${lerp(1680, 1280, hatch)} ${lerp(520, 560, hatch)},${lerp(1680, 1280, hatch)}`} fill="#1a1008" />
        <Figure x={380} y={1700} s={1} h={760} hair="old" hunch={1} arms={0.4} headTilt={14} coat filter="url(#e7s4rim)" />
      </Cam>
      <Memory T={T} />
      <Vignette id="e7s4v" k={0.9} />
      <Grain t={T} o={0.16} />
    </Whip>
  );
};

// 5 · her phone: the message to Saman goes out — "دارم میام" ✓✓
const S5: ShotFn = ({ t, dur, T }) => {
  const sent = easeOut(prog(T, wd(vo, 5, "دارم") - 0.1, wd(vo, 5, "دارم") + 0.2));
  const read = T > wd(vo, 5, "میام") + 0.3;
  return (
    <Whip id="e7s5" t={t} dir={-1}>
      <Cam t={t} dur={dur} from={1.4} to={1.5} oy={860}>
        <rect width={W} height={H} fill="#05070d" />
        <Glow id="e7s5g" cx={540} cy={900} r={700} color={C.phone} o={0.3} />
        <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
        <rect x={376} y={536} width={328} height={728} rx={36} fill="#0f1a26" />
        <rect x={376} y={536} width={328} height={90} rx={36} fill="#16273a" />
        <text x={540} y={596} textAnchor="middle" fontFamily="V03Black" fontSize={30} fill="#fff" direction="rtl">سامان</text>
        <g opacity={0.8}><rect x={400} y={660} width={230} height={60} rx={20} fill="#1d2e42" /><text x={515} y={700} textAnchor="middle" fontFamily="V03Bold" fontSize={22} fill="#c9d3e2" direction="rtl">در رو باز نکن!</text></g>
        <g opacity={sent} transform={`translate(0 ${(1 - sent) * 30})`}>
          <rect x={480} y={760} width={200} height={64} rx={22} fill="#2f6fb0" />
          <text x={588} y={802} textAnchor="middle" fontFamily="V03Black" fontSize={28} fill="#fff" direction="rtl">دارم میام</text>
          <text x={496} y={814} fontFamily="V03Bold" fontSize={18} fill={read ? "#8fd0ff" : "#c9d3e2"}>✓✓</text>
        </g>
      </Cam>
      <Vignette id="e7s5v" k={0.9} />
      <Grain t={T} />
    </Whip>
  );
};

// 6 · outside the kitchen window: Raha climbs out onto the ledge with Zorat on the leash; smoke drifts past
const S6: ShotFn = ({ t, dur, T }) => {
  const out = easeOut(prog(T, wd(vo, 6, "پنجره") - 0.3, wd(vo, 6, "بیرون") + 0.3));
  return (
    <Whip id="e7s6" t={t}>
      <RimDefs id="e7s6rim" color="#9db8e6" dx={-4} dy={-4} w={3} blur={1.4} />
      <Cam t={t} dur={dur} from={1.0} to={1.08} oy={1000}>
        <rect width={W} height={H} fill="#0b1222" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={0} y={i * 200} width={W} height={6} fill="#080d18" />)}
        {/* window */}
        <rect x={260} y={520} width={560} height={720} fill="#04060b" />
        <rect x={240} y={500} width={600} height={24} fill="#070b16" />
        <rect x={220} y={1240} width={640} height={36} fill="#111a2c" />
        <rect x={lerp(260, 560, out)} y={520} width={280} height={720} fill="#16223a" opacity={0.7} />
        {/* fire-escape ledge */}
        <rect x={0} y={1500} width={W} height={20} fill="#05070c" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 95} y={1380} width={8} height={130} fill="#05070c" />)}
        <rect x={0} y={1380} width={W} height={10} fill="#05070c" />
        <Girl x={lerp(520, 640, out)} y={lerp(1240, 1500, out)} s={1.0} filter="url(#e7s6rim)" head={-6} crouch={1 - out * 0.7} armF={[-40, -20]} armB={[20, -10]} legs={[20, -30, -10, 10]} sx={-1} />
        <Dog x={lerp(420, 380, out)} y={lerp(1240, 1500, out)} s={0.7} head={-8} tail={-20} ears={0} filter="url(#e7s6rim)" />
        <path d={`M${lerp(560, 640, out) - 40},${lerp(1000, 1260, out)} Q${lerp(470, 520, out)},${lerp(1150, 1400, out)} ${lerp(420, 380, out) + 60},${lerp(1180, 1440, out)}`} stroke={C.ink} strokeWidth={5} fill="none" />
        {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={((T * 60 + i * 260) % 1400) - 160} cy={700 + i * 180 + noise(T + i, i) * 40} rx={260} ry={70} fill="#8a96aa" opacity={0.07} />)}
      </Cam>
      <Vignette id="e7s6v" k={0.92} />
      <Grain t={T} o={0.12} />
    </Whip>
  );
};

// 7 · the street from above: wrecked cars, a traffic light still cycling, and people standing dead still
const PEOPLE = [[600, 1180, 0.45], [880, 1240, 0.5], [230, 1260, 0.55], [420, 1400, 0.68], [760, 1480, 0.78], [150, 1640, 0.9], [560, 1760, 1.0]];
const S7: ShotFn = ({ t, dur, T }) => {
  const look = easeInOut(prog(T, UP - 0.3, UP + 0.6));
  const tilt = easeInOut(prog(T, UP, UP + 1.6));
  const light = Math.floor(T / 1.2) % 3;
  return (
    <Whip id="e7s7" t={t} dir={-1}>
      <RimDefs id="e7s7rim" color="#8fa8d0" dx={-3} dy={-4} w={3} blur={1.4} />
      <Cam t={t} dur={dur} from={1.04} to={1.12} oy={1200}>
        <g transform={`translate(0 ${tilt * 700})`}>
          {/* the sky above: a slow red glow pulsing inside the clouds */}
          <rect x={0} y={-900} width={W} height={1000} fill="#0a0f1c" />
          <Glow id="e7s7sk" cx={560} cy={-420} r={700} color={C.red} o={tilt * (0.35 + 0.25 * Math.sin(T * 2.4))} />
          {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={(i * 230 + T * 20) % 1300 - 100} cy={-640 + i * 90} rx={300} ry={60} fill="#05070c" opacity={0.7} />)}
          <rect x={0} y={100} width={W} height={1820} fill="#0b101b" />
          <path d="M-100,1700 L1180,1100" stroke="#121a2a" strokeWidth={360} />
          <path d="M-100,1700 L1180,1100" stroke="#3a4560" strokeWidth={6} strokeDasharray="60 50" opacity={0.6} />
          {/* crashed cars */}
          <g fill="#05070c"><rect x={300} y={1420} width={220} height={100} rx={20} transform="rotate(-24 410 1470)" /><rect x={470} y={1360} width={220} height={100} rx={20} transform="rotate(30 580 1410)" /><rect x={820} y={1180} width={200} height={90} rx={20} transform="rotate(-10 920 1225)" /></g>
          <Glow id="e7s7f" cx={560} cy={1400} r={200} color={C.ember} o={0.3 * flicker(T, 8, 0.6)} />
          {/* traffic light */}
          <rect x={960} y={760} width={14} height={500} fill="#05070c" />
          <rect x={930} y={680} width={74} height={190} rx={12} fill="#05070c" />
          {["#e0242f", "#e9a54b", "#3fd17a"].map((c, i) => <circle key={i} cx={967} cy={716 + i * 58} r={20} fill={i === light ? c : "#111"} />)}
          <Glow id="e7s7t" cx={967} cy={716 + light * 58} r={140} color={["#e0242f", "#e9a54b", "#3fd17a"][light]} o={0.4} />
          {PEOPLE.map(([x, y, s], i) => <Figure key={i} x={x} y={y} s={s} h={600} hair={(["short", "long", "bald", "curly", "short", "old", "pony"] as const)[i]} headUp={look} coat={i % 2 === 0} filter="url(#e7s7rim)" />)}
        </g>
        <Rain t={T} n={60} o={0.2} />
      </Cam>
      <Dust t={T} n={20} color={C.moon} o={0.2} />
      <Vignette id="e7s7v" k={0.94} />
      <Grain t={T} o={0.14} />
    </Whip>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "کوله‌مو"), S: S2 },
  { at: at(3, "از"), S: S3 },
  { at: at(4, "پدربزرگم"), S: S4 },
  { at: at(5, "به"), S: S5 },
  { at: at(6, "قلاده‌ی"), S: S6 },
  { at: at(7, "وسطِ"), S: S7 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [1.0, 3.5, 4.6, 7.0, 10.6, 12.6, DRAG + 0.4, 14.8, 17.0, 19.8, 23.0, 24.5, 26.0, 27.8, 30.0, UP + 0.3, UP + 1.5, vo.total + 0.9];
