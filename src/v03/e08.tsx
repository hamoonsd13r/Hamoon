// V03 · Episode 8 (finale) «پدربزرگ زنگ زد» — Saman, the mother on the stairs, the run, the call from a dead man, the hatch, and every night since. Timed from e08-vo.json
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, Dust, easeIn, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, Rain, RimDefs, Vignette, W, H, Whip } from "./lib";
import { Clock, Sky, Skyline } from "./sets";
import { Saman } from "./e03";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e08-vo.json";

export const vo = voJson as VO;
const RING = wd(vo, 5, "زنگ");
const GRAVE = wd(vo, 5, "سه") - 0.1;
const SHUT = wd(vo, 7, "بَستَم");
const RING2 = wd(vo, 8, "زنگ");

// phone in a hand, ringing: name on screen, green/red buttons
const Ringing: React.FC<{ T: number; on: boolean; name: string }> = ({ T, on, name }) => {
  const bz = on ? Math.abs(Math.sin(T * 50)) * (Math.floor(T * 1.4) % 2 === 0 ? 1 : 0) : 0;
  return (
    <g transform={`translate(${noise(T * 80, 4) * 10 * bz} ${noise(T * 70, 7) * 6 * bz})`}>
      <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
      <rect x={376} y={536} width={328} height={728} rx={36} fill={on ? "#1c1710" : "#06080d"} />
      {on && <>
        <circle cx={540} cy={760} r={76} fill="#5a4630" />
        <circle cx={540} cy={742} r={28} fill="#d9c3a0" /><path d="M488,804 Q540,762 592,804 Z" fill="#d9c3a0" />
        <text x={540} y={910} textAnchor="middle" fontFamily="V03Black" fontSize={50} fill="#fff" direction="rtl">{name}</text>
        <text x={540} y={958} textAnchor="middle" fontFamily="V03Bold" fontSize={26} fill="#c9b79a" direction="rtl">در حال تماس…</text>
        <circle cx={450} cy={1160} r={44} fill="#e0242f" /><circle cx={630} cy={1160} r={44} fill="#2fbf5a" opacity={0.6 + 0.4 * Math.abs(Math.sin(T * 5))} />
      </>}
    </g>
  );
};

// 1 · the back stairwell: Saman waiting at the bottom; Raha and Zorat come down to him
const S1: ShotFn = ({ t, dur, T }) => {
  const down = easeInOut(prog(T, 0.2, wd(vo, 1, "بود") + 0.4));
  return (
    <g>
      <RimDefs id="e8s1rim" color="#ff6a5a" dx={-4} dy={-4} w={3} blur={1.5} />
      <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1100}>
        <rect width={W} height={H} fill="#07090f" />
        <g transform="translate(0 260)">
        <rect x={140} y={460} width={240} height={100} rx={10} fill="#2a0508" />
        <text x={260} y={532} textAnchor="middle" fontFamily="V03Black" fontSize={54} fill="#ff4a50" direction="rtl" opacity={flicker(T, 13, 0.5)}>خروج</text>
        <Glow id="e8s1x" cx={260} cy={510} r={460} color={C.red} o={0.45 * flicker(T, 13, 0.5)} />
        <g fill="#030409">{Array.from({ length: 10 }, (_, i) => <rect key={i} x={1080 - (i + 1) * 100} y={500 + i * 95} width={100} height={1500} />)}</g>
        <path d="M1080,420 L80,1370" stroke="#030409" strokeWidth={14} />
        {Array.from({ length: 10 }, (_, i) => <line key={i} x1={1080 - i * 100} y1={420 + i * 95} x2={1080 - i * 100} y2={500 + i * 95} stroke="#030409" strokeWidth={7} />)}
        <rect x={0} y={1460} width={W} height={460} fill="#030409" />
        <Figure x={170} y={1470} s={1} h={560} hair="curly" arms={0.1} hunch={0.6} filter="url(#e8s1rim)" />
        <Glow id="e8s1p" cx={230} cy={1180} r={200} color={C.phone} o={0.25} />
        <Girl x={lerp(860, 600, down)} y={lerp(640, 880, down)} s={0.9} sx={-1} head={6} legs={[10 * Math.sin(T * 7), 0, -10 * Math.sin(T * 7), 0]} filter="url(#e8s1rim)" />
        <Dog x={lerp(740, 420, down)} y={lerp(740, 1040, down)} s={0.6} sx={-1} head={0} ears={0} tail={-10} filter="url(#e8s1rim)" />
        </g>
      </Cam>
      <Dust t={T} n={22} color="#ff9a8c" o={0.2} />
      <Vignette id="e8s1v" k={0.93} />
      <Grain t={T} o={0.13} />
    </g>
  );
};

// 2 · Saman close: "فکر کردم نمیای"
const S2: ShotFn = ({ t, dur, T }) => (
  <Whip id="e8s2" t={t}>
    <RimDefs id="e8s2rim" color="#ff6a5a" dx={-6} dy={-2} w={3} blur={2} />
    <g transform={`translate(${noise(T * 30, 3) * 4} 0)`}>
      <Cam t={t} dur={dur} from={1.0} to={1.08} oy={800}>
        <rect width={W} height={H} fill="#06080d" />
        <Glow id="e8s2r" cx={200} cy={500} r={600} color={C.red} o={0.35} />
        <Saman x={560} y={1250} s={3.0} talk={Math.sin(T * 10) * 0.5} filter="url(#e8s2rim)" />
      </Cam>
    </g>
    <Vignette id="e8s2v" k={0.96} />
    <Grain t={T} o={0.13} />
  </Whip>
);

// 3 · the mother at the top of the stairs, low angle: arms slowly opening, face lost in darkness
const S3: ShotFn = ({ t, dur, T }) => {
  const arms = easeInOut(prog(T, wd(vo, 3, "بیا") - 0.4, wd(vo, 3, "بَغَلَم") + 0.4));
  return (
    <Whip id="e8s3" t={t} dir={-1}>
      <RimDefs id="e8s3rim" color="#ff5a4a" dx={0} dy={-5} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.0} to={1.14} oy={700}>
        <rect width={W} height={H} fill="#0a0507" />
        <Glow id="e8s3b" cx={540} cy={420} r={700} color={C.red} o={0.55 * flicker(T, 5, 0.3)} />
        <g fill="#020203">{Array.from({ length: 9 }, (_, i) => <rect key={i} x={0} y={1000 + i * 110} width={W} height={60} opacity={1 - i * 0.05} />)}</g>
        <rect x={0} y={960} width={W} height={50} fill="#020203" />
        <Figure x={540} y={980} s={1} h={820} build={0.85} hair="long" arms={arms} headTilt={-6 + Math.sin(T * 0.9) * 3} filter="url(#e8s3rim)" />
      </Cam>
      <Dust t={T} n={26} color="#ff9a8c" o={0.25} />
      <Vignette id="e8s3v" k={0.95} />
      <Grain t={T} o={0.15} />
    </Whip>
  );
};

// 4 · the run: through the iron door, down the alley in the rain, to grandpa's garage shutter
const S4: ShotFn = ({ t, dur, T }) => {
  const k = prog(T, wd(vo, 4, "دستِشو") - 0.2, wd(vo, 4, "پِدَربُزُرگ") + 0.6);
  const run = Math.sin(T * 14);
  const cam = lerp(0, 900, easeInOut(k));
  return (
    <Whip id="e8s4" t={t}>
      <RimDefs id="e8s4rim" color="#9db8e6" dx={-4} dy={-4} w={3} blur={1.4} />
      <g transform={`translate(${-cam} ${noise(T * 9, 2) * 8})`}>
        <rect x={0} y={0} width={W * 2.2} height={H} fill="#0a101c" />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 170} y={380 + (i % 3) * 60} width={150} height={1000} fill="#070b14" />)}
        <rect x={0} y={1380} width={W * 2.2} height={540} fill="#05080f" />
        {/* garage shutter */}
        <rect x={1500} y={700} width={560} height={680} fill="#141a24" />
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={1500} y={720 + i * 40} width={560} height={6} fill="#0a0e15" />)}
        <rect x={1540} y={600} width={480} height={90} fill="#1f1a12" />
        <text x={1780} y={665} textAnchor="middle" fontFamily="V03Black" fontSize={56} fill={C.amber} direction="rtl" opacity={0.6 + 0.4 * flicker(T, 3, 0.5)}>تعمیرگاه</text>
        <Glow id="e8s4g" cx={1780} cy={650} r={360} color={C.amber} o={0.3} />
        <g transform={`translate(${cam + 300 + k * 260} 0)`}>
          <Girl x={0} y={1460} s={1.15} head={-4} lean={10} legs={[30 * run, -40 * Math.max(0, run), -30 * run, -40 * Math.max(0, -run)]} armF={[-40 * run, -50]} armB={[40 * run, -50]} filter="url(#e8s4rim)" />
          <Figure x={-160} y={1460} s={1} h={600} hair="curly" step={T * 14} filter="url(#e8s4rim)" />
          <Dog x={190} y={1460} s={0.75} head={-4} ears={0} tail={10} legs={[30 * run, -20, -30 * run, 20]} filter="url(#e8s4rim)" />
        </g>
      </g>
      <Rain t={T} n={90} o={0.3} />
      <Vignette id="e8s4v" k={0.92} />
      <Grain t={T} o={0.12} />
    </Whip>
  );
};

// 5 · in the bunker's light: her phone rings — «پدربزرگ». On "سه سال پیش" a flash of his grave
const S5: ShotFn = ({ t, dur, T }) => {
  const g = T >= GRAVE && T < GRAVE + 1.4 ? 1 - prog(T, GRAVE + 1.0, GRAVE + 1.4) : 0;
  return (
    <Whip id="e8s5" t={t} dir={-1}>
      <Cam t={t} dur={dur} from={1.3} to={1.45} oy={860}>
        <rect width={W} height={H} fill="#140d07" />
        <Glow id="e8s5a" cx={540} cy={300} r={700} color={C.amber} o={0.35} />
        <Glow id="e8s5g" cx={540} cy={900} r={600} color={C.amber} o={T >= RING ? 0.35 : 0.1} />
        <Ringing T={T} on={T >= RING - 0.05} name="پدربزرگ" />
      </Cam>
      {g > 0 && (
        <g opacity={g}>
          <rect width={W} height={H} fill="#1a1208" />
          <Glow id="e8s5m" cx={540} cy={700} r={800} color={C.amber} o={0.4} />
          <rect x={0} y={1300} width={W} height={620} fill="#0c0905" />
          <path d="M360,1320 L360,820 Q540,660 720,820 L720,1320 Z" fill="#2c2418" stroke="#0c0905" strokeWidth={14} />
          <text x={540} y={960} textAnchor="middle" fontFamily="V03Black" fontSize={52} fill="#0c0905" direction="rtl">پدربزرگ</text>
          <text x={540} y={1050} textAnchor="middle" fontFamily="V03Bold" fontSize={36} fill="#0c0905">۱۴۰۲</text>
          {Array.from({ length: 64 }, (_, i) => <rect key={i} x={0} y={i * 30 + ((T * 60) % 30)} width={W} height={2} fill="#000" opacity={0.22} />)}
        </g>
      )}
      <Vignette id="e8s5v" k={0.9} />
      <Grain t={T} o={0.14} />
    </Whip>
  );
};

// 6 · looking up the ladder: above the half-open hatch, grandpa's silhouette bends down; two pale eyes on "منم"
const S6: ShotFn = ({ t, dur, T }) => {
  const eyes = easeOut(prog(T, wd(vo, 6, "مَنَم") - 0.1, wd(vo, 6, "مَنَم") + 0.3));
  return (
    <Whip id="e8s6" t={t}>
      <RimDefs id="e8s6rim" color="#8fa8d0" dx={0} dy={-4} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.0} to={1.16} oy={600}>
        <rect width={W} height={H} fill="#0d0905" />
        {/* the shaft walls in perspective */}
        <polygon points="0,1920 300,520 780,520 1080,1920" fill="#1a120a" />
        <rect x={300} y={300} width={480} height={240} fill="#05070c" />
        <Glow id="e8s6m" cx={540} cy={380} r={360} color={C.moon} o={0.25} />
        {/* ladder */}
        {Array.from({ length: 9 }, (_, i) => { const y = 1920 - i * 170, w = lerp(560, 260, i / 8); return <rect key={i} x={540 - w / 2} y={y} width={w} height={22} fill="#05030a" />; })}
        <path d="M260,1920 L410,520 M820,1920 L670,520" stroke="#05030a" strokeWidth={26} />
        {/* the figure above the hatch, looking down */}
        <g transform="translate(540 540) scale(1 -1)">
          <Figure x={0} y={-60} s={-0.55} h={600} hair="old" hunch={1} eyes={eyes} eyeColor={C.bone} filter="url(#e8s6rim)" />
        </g>
        <polygon points="300,300 780,300 760,250 320,250" fill="#2a1c10" />
      </Cam>
      <Vignette id="e8s6v" k={0.95} />
      <Grain t={T} o={0.15} />
    </Whip>
  );
};

// 7 · the hatch slams shut, the bolt slides home; then the three of them in the bunker's lamp light
const S7: ShotFn = ({ t, dur, T }) => {
  const shut = easeIn(prog(T, SHUT - 0.15, SHUT + 0.1));
  const hit = T >= SHUT + 0.1 && T < SHUT + 0.5 ? Math.exp(-(T - SHUT - 0.1) * 10) : 0;
  const inside = T > SHUT + 0.9;
  return (
    <g>
      <RimDefs id="e8s7rim" color="#ffc27a" dx={-4} dy={-4} w={3} blur={1.6} />
      {!inside ? (
        <g transform={`translate(${noise(T * 60, 3) * 20 * hit} ${noise(T * 55, 6) * 14 * hit})`}>
          <rect width={W} height={H} fill="#0d0905" />
          <rect x={240} y={500} width={600} height={500} fill={C.moon} opacity={0.25 * (1 - shut)} />
          <polygon points={`240,${lerp(160, 500, shut)} 840,${lerp(160, 500, shut)} 840,1000 240,1000`} fill="#2a1c10" stroke="#120c07" strokeWidth={16} />
          <rect x={lerp(880, 700, easeOut(prog(T, SHUT + 0.3, SHUT + 0.6)))} y={730} width={180} height={40} fill="#6a5a44" />
          <rect x={860} y={700} width={40} height={100} fill="#3a2f22" />
        </g>
      ) : (
        <Cam t={t} dur={dur} from={1.05} to={1.15} oy={1200}>
          <rect width={W} height={H} fill="#1c130c" />
          <Glow id="e8s7l" cx={540} cy={500} r={800} color={C.amber} o={0.55 * flicker(T, 4, 0.2)} />
          <rect x={536} y={0} width={8} height={420} fill="#0c0805" />
          <ellipse cx={540} cy={430} rx={40} ry={50} fill="#ffe2b0" />
          <rect x={0} y={1500} width={W} height={420} fill="#120c07" />
          <Girl x={460} y={1520} s={1.2} crouch={1} head={8} filter="url(#e8s7rim)" />
          <Figure x={700} y={1520} s={1} h={520} hair="curly" hunch={1} filter="url(#e8s7rim)" />
          <Dog x={230} y={1520} s={0.8} pose="lie" head={6} ears={0} tail={0} filter="url(#e8s7rim)" />
        </Cam>
      )}
      <Vignette id="e8s7v" k={0.93} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 8 · epilogue: grey dawn over the silent city…
const S8: ShotFn = ({ t, dur, T }) => (
  <Whip id="e8s8" t={t}>
    <Cam t={t} dur={dur} from={1.0} to={1.06} oy={1000}>
      <Sky id="e8s8sky" top="#2a3550" bot="#c9a88a" />
      <Glow id="e8s8sun" cx={540} cy={1180} r={600} color="#ffcf9a" o={0.45} />
      <Skyline x={0} y={900} w={W} h={500} t={T} seed={11} fill="#141a28" dark={1} />
      <rect x={0} y={1400} width={W} height={520} fill="#0e121c" />
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${100 + i * 250},1400 C${120 + i * 250 + noise(T + i, i) * 30},1200 ${80 + i * 250},1000 ${110 + i * 250 + noise(T * 0.5 + i, i) * 60},800`} stroke="#5a6070" strokeWidth={30} fill="none" opacity={0.15} />)}
    </Cam>
    <Dust t={T} n={20} color="#ffe2c0" o={0.2} />
    <Vignette id="e8s8v" k={0.85} />
    <Grain t={T} o={0.1} />
  </Whip>
);

// 9 · …and every night at midnight: the clock hits twelve, the phone on the nightstand lights up — «پدربزرگ»
const S9: ShotFn = ({ t, dur, T }) => {
  const sec = Math.min(60, 56 + (T - wd(vo, 8, "هر")) * 2.2);
  const on = T >= RING2 - 0.1;
  return (
    <Whip id="e8s9" t={t} dir={-1}>
      <Cam t={t} dur={dur} from={1.0} to={1.12} oy={1100}>
        <rect width={W} height={H} fill="#05070d" />
        <Glow id="e8s9m" cx={900} cy={300} r={700} color={C.moon} o={0.12} />
        <Clock x={540} y={400} r={200} hours={23 + 59 / 60 + (sec >= 60 ? 1 / 60 : 0)} sec={sec % 60} face="#8a96aa" />
        <rect x={140} y={1460} width={800} height={460} fill="#0a0d14" />
        <g transform="translate(540 1000) scale(0.72) translate(-540 -900)">
          <Ringing T={T} on={on} name="پدربزرگ" />
        </g>
        {on && <Glow id="e8s9p" cx={540} cy={1000} r={420} color={C.amber} o={0.45} />}
      </Cam>
      <Vignette id="e8s9v" k={0.94} />
      <Grain t={T} o={0.14} />
    </Whip>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "فکر", 0.2), S: S2 },
  { at: at(3, "سامان", 0.2), S: S3 },
  { at: at(4, "دستِشو"), S: S4 },
  { at: at(5, "همون"), S: S5 },
  { at: at(6, "رها", 0.15), S: S6 },
  { at: at(7, "دَریچه"), S: S7 },
  { at: at(8, "ما", 0.15), S: S8 },
  { at: at(8, "هر", 0.15), S: S9 },
];
export const TOTAL = vo.total + 2.2;
export const LOOK = [1.0, 3.5, 6.2, 8.4, 9.8, 11.0, 13.2, 15.0, RING + 0.3, GRAVE + 0.4, 21.0, 23.2, SHUT + 0.2, SHUT + 0.7, 27.0, 29.0, 31.5, RING2 + 0.4, vo.total + 1.0];
