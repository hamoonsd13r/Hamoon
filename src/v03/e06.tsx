// V03 · Episode 6 «مامانم در رو باز کرد» — the emergency alert, Saman whispering from the back stairs, something climbing, the call dies. Timed from e06-vo.json
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, clamp, Dust, easeIn, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, rng, RimDefs, Vignette, W, H, Whip } from "./lib";
import { Building, Corridor, Door, Sky, Skyline } from "./sets";
import { Saman } from "./e03";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e06-vo.json";

export const vo = voJson as VO;
const BUZZ = wd(vo, 2, "لرزید") - 0.05;
const CUT = wd(vo, 8, "بُرید");
const hitAt = (T: number, at: number, len = 0.35) => (T >= at && T < at + len ? Math.exp(-(T - at) * 9) : 0);

// the alert screen, drawn in phone-local coords (screen 328×728 at 376,536). k = how many alert words are shown
const AlertScreen: React.FC<{ T: number; words?: number; big?: boolean }> = ({ T, words = 0, big }) => {
  const blink = Math.floor(T * 3) % 2 === 0 ? 1 : 0.55;
  const lines = ["در محل امن بمانید.", "در را به روی", "هیچ‌کس باز نکنید."];
  let left = words;
  return (
    <g>
      <rect x={376} y={536} width={328} height={728} rx={36} fill="#14070a" />
      <rect x={376} y={536} width={328} height={170} rx={36} fill={C.red} opacity={0.85 * blink} />
      <path d="M540,580 L580,650 L500,650 Z" fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" />
      <rect x={536} y={600} width={8} height={26} fill="#fff" /><circle cx={540} cy={638} r={4.5} fill="#fff" />
      <text x={540} y={690} textAnchor="middle" fontFamily="V03Black" fontSize={big ? 34 : 30} fill="#fff" direction="rtl">هشدار اضطراری</text>
      {lines.map((l, i) => {
        const ws = l.split(" ");
        const shown = ws.slice(0, Math.max(0, left)).join(" ");
        left -= ws.length;
        return <text key={i} x={540} y={800 + i * 70} textAnchor="middle" fontFamily="V03Black" fontSize={40} fill={C.bone} direction="rtl">{shown}</text>;
      })}
      {!big && <text x={540} y={1180} textAnchor="middle" fontFamily="V03Bold" fontSize={24} fill="#c98a8a" direction="rtl">سامانه‌ی هشدار ملی</text>}
    </g>
  );
};

// 1 · hook: the blacked-out block from the street; on "جمله… فرستاد" a phone lights red in every window, one after another
const S1: ShotFn = ({ t, dur, T }) => {
  const a = wd(vo, 1, "جمله"), b = wd(vo, 1, "فرستاد") + 0.3;
  const R = rng(61); const order = Array.from({ length: 24 }, () => R());
  const lit = (i: number) => clamp((T - lerp(a, b, order[i])) / 0.12) * (0.75 + 0.25 * flicker(T, i + 3, 0.4));
  return (
    <g>
      <Cam t={t} dur={dur} from={1.0} to={1.12} oy={1100}>
        <Sky id="e6s1sky" top="#060b18" bot="#1a2440" />
        <Skyline x={0} y={520} w={W} h={420} t={T} seed={11} fill="#070b16" lit="#ffd79a" dark={1} />
        <Building x={-60} y={760} w={600} h={1260} t={T} win={(i) => ({ lit: lit(i), color: "#ff3b45" })} />
        <Building x={560} y={880} w={580} h={1140} t={T} win={(i) => ({ lit: lit(i + 12), color: "#ff3b45" })} />
        <rect x={0} y={1860} width={W} height={60} fill="#03050a" />
      </Cam>
      <Dust t={T} n={20} color={C.moon} o={0.2} />
      <Vignette id="e6s1v" k={0.95} />
      <Grain t={T} o={0.12} />
    </g>
  );
};

// 2 · her phone buzzes in her hand — the red alert floods the screen
const S2: ShotFn = ({ t, dur, T }) => {
  const bz = T >= BUZZ && T < BUZZ + 0.9 ? Math.abs(Math.sin((T - BUZZ) * 60)) * (1 - prog(T, BUZZ, BUZZ + 0.9)) : 0;
  const on = easeOut(prog(T, BUZZ, BUZZ + 0.15));
  return (
    <Whip id="e6s2" t={t} dir={-1}>
      <RimDefs id="e6s2rim" color="#ff6a6a" dx={2} dy={-4} w={3} blur={2} />
      <Cam t={t} dur={dur} from={1.02} to={1.14} oy={900}>
        <rect width={W} height={H} fill="#05070d" />
        <Glow id="e6s2g" cx={540} cy={900} r={760} color={on > 0.5 ? C.red : C.phone} o={0.12 + 0.4 * on} />
        <g transform={`translate(${noise(T * 80, 4) * 14 * bz} ${noise(T * 75, 8) * 8 * bz}) rotate(-6 540 900)`}>
          <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
          {on > 0 ? <g opacity={on}><AlertScreen T={T} /></g> : <rect x={376} y={536} width={328} height={728} rx={36} fill="#05070d" />}
        </g>
        <g fill={C.ink} filter="url(#e6s2rim)">
          <path d="M440,1920 C446,1700 462,1520 476,1380 L700,1380 C712,1520 728,1700 740,1920 Z" />
          {[0, 1, 2].map((i) => <rect key={i} x={340} y={1040 + i * 74} width={78} height={60} rx={30} />)}
        </g>
        {bz > 0 && [0, 1].map((i) => <path key={i} d={`M${300 - i * 30},${700 + i * 20} q-20,40 0,80 M${780 + i * 30},${700 + i * 20} q20,40 0,80`} stroke={C.bone} strokeWidth={5} fill="none" opacity={bz * 0.7} />)}
      </Cam>
      <Vignette id="e6s2v" k={0.9} />
      <Grain t={T} />
    </Whip>
  );
};

// 3 · the alert, close: the words land one by one as she whispers them; red pulse on "باز نکنید"
const S3: ShotFn = ({ t, dur, T }) => {
  const ws = vo.words.filter((w) => w.line === 3);
  const n = ws.filter((w) => T >= w.s - 0.05).length;
  const h = hitAt(T, wd(vo, 3, "نکنید"), 0.6);
  return (
    <g>
      <g transform={`translate(${noise(T * 40, 2) * 10 * h} 0)`}>
        <Cam t={t} dur={dur} from={1.55} to={1.75} ox={540} oy={760}>
          <rect width={W} height={H} fill="#05070d" />
          <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
          <AlertScreen T={T} words={n} big />
          <rect x={376} y={536} width={328} height={728} rx={36} fill={C.red} opacity={0.18 * h} />
        </Cam>
      </g>
      <Glow id="e6s3g" cx={540} cy={760} r={900} color={C.red} o={0.18 + 0.2 * h} />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={0} y={i * 30 + ((T * 40) % 30)} width={W} height={2} fill="#000" opacity={0.18} />)}
      <Vignette id="e6s3v" k={0.95} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 4 · Raha in the dead-dark hallway, phone to her ear; only the phone and the red line under the door
const S4: ShotFn = ({ t, dur, T }) => (
  <Whip id="e6s4" t={t}>
    <RimDefs id="e6s4rim" color={C.phone} dx={4} dy={-3} w={3} blur={1.8} />
    <g transform={`translate(${noise(T * 7, 2) * 12} ${noise(T * 6, 9) * 8})`}>
      <Cam t={t} dur={dur} from={1.0} to={1.12} oy={1250}>
        <rect width={W} height={H} fill="#04060b" />
        <rect x={0} y={1600} width={W} height={320} fill="#020306" />
        <Door x={700} y={560} w={380} h={1040} fill="#080b12" peep={0.25} />
        <rect x={700} y={1592} width={380} height={8} fill={C.red} opacity={0.6 + 0.3 * flicker(T, 7, 0.6)} />
        <Glow id="e6s4u" cx={890} cy={1610} r={300} color={C.red} o={0.35} sy={0.25} />
        <Glow id="e6s4p" cx={540} cy={1050} r={300} color={C.phone} o={0.45 * flicker(T, 5, 0.2)} />
        <Girl x={500} y={1650} s={1.35} filter="url(#e6s4rim)" head={-4} armF={[-60, 195]} armB={[8, -4]} phone={0.9} lean={-2} />
        <Dog x={330} y={1650} s={0.8} head={-4} jaw={0} ears={0} tail={-30} bristle={1} eye={0.9} breath={Math.sin(T * 4)} filter="url(#e6s4rim)" />
      </Cam>
    </g>
    <Vignette id="e6s4v" k={0.96} />
    <Grain t={T} o={0.15} />
  </Whip>
);

// 5 · Saman crouched in the back stairwell, whispering; his face lit only by his phone, EXIT sign red behind him
const S5: ShotFn = ({ t, dur, T }) => {
  const snap = easeOut(prog(T, wd(vo, 5, "باید") - 0.08, wd(vo, 5, "باید") + 0.12));
  return (
    <Whip id="e6s5" t={t} dir={-1}>
      <RimDefs id="e6s5rim" color={C.phone} dx={5} dy={-2} w={3} blur={2} />
      <g transform={`translate(560 900) scale(${1 + snap * 0.1}) translate(-560 -900)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.08} oy={900}>
          <rect width={W} height={H} fill="#06080e" />
          {/* EXIT sign */}
          <rect x={150} y={300} width={260} height={110} rx={10} fill="#2a0508" />
          <text x={280} y={378} textAnchor="middle" fontFamily="V03Black" fontSize={58} fill="#ff4a50" direction="rtl" opacity={flicker(T, 13, 0.5)}>خروج</text>
          <Glow id="e6s5x" cx={280} cy={355} r={360} color={C.red} o={0.4 * flicker(T, 13, 0.5)} />
          {/* stairs going down, behind him */}
          <g fill="#030409">{Array.from({ length: 9 }, (_, i) => <rect key={i} x={-40 + i * 120} y={1500 - i * 90} width={140} height={600} />)}</g>
          <path d="M-40,1300 L1100,520" stroke="#030409" strokeWidth={16} />
          <Glow id="e6s5p" cx={720} cy={860} r={300} color={C.phone} o={0.45} />
          <Saman x={610} y={1120} s={2.0} talk={Math.sin(T * 9) * 0.4} filter="url(#e6s5rim)" />
        </Cam>
      </g>
      <Dust t={T} n={22} color="#ff9a8c" o={0.2} />
      <Vignette id="e6s5v" k={0.92} />
      <Grain t={T} o={0.12} />
    </Whip>
  );
};

// 6 · looking down the stairwell well: flight after flight into the dark — something pale climbs toward us; eyes on "بالا"
const S6: ShotFn = ({ t, dur, T }) => {
  const up = easeIn(prog(T, wd(vo, 6, "چیزی"), wd(vo, 6, "بالا") + 0.6));
  const eyes = easeOut(prog(T, wd(vo, 6, "بالا") - 0.1, wd(vo, 6, "بالا") + 0.15));
  const rings = 8;
  return (
    <Whip id="e6s6" t={t}>
      <Cam t={t} dur={dur} from={1.0} to={1.18} oy={980}>
        <rect width={W} height={H} fill="#090d18" />
        {Array.from({ length: rings }, (_, i) => {
          const k = Math.pow(0.72, i), w = 1000 * k, h = 1700 * k, x = 540 - w / 2, y = 980 - h / 2;
          const shade = Math.round(26 * Math.pow(0.7, i));
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={`rgb(${shade * 0.5},${shade * 0.6},${shade})`} />
              <rect x={x + w * 0.1} y={y + h * 0.06} width={w * 0.8} height={h * 0.88} fill="#04060b" />
              {/* handrail */}
              <rect x={x + w * 0.1} y={y + h * 0.06} width={w * 0.8} height={h * 0.88} fill="none" stroke="#1f2b44" strokeWidth={10 * k + 1} />
              {/* steps on one side of each flight */}
              {Array.from({ length: 6 }, (_, j) => <line key={j} x1={x + w * 0.02} y1={y + h * (0.12 + j * 0.13)} x2={x + w * 0.1} y2={y + h * (0.12 + j * 0.13)} stroke="#04060b" strokeWidth={6 * k + 1} />)}
            </g>
          );
        })}
        {/* floor number at the bottom */}
        <text x={540} y={980 + 1700 * Math.pow(0.72, 6) * 0.3} textAnchor="middle" fontFamily="V03Black" fontSize={40} fill={C.red} opacity={0.6 * flicker(T, 9, 0.6)}>۱</text>
        {/* the climber: a pale hand sliding up the rail + a head with two glints, growing as it rises */}
        <g transform={`translate(540 980) scale(${lerp(0.1, 1.0, up)}) translate(-540 -980)`} opacity={0.3 + 0.7 * up}>
          <ellipse cx={540} cy={980} rx={110} ry={130} fill="#000" />
          <path d="M430,1100 C420,1000 400,940 330,900 M450,1110 C440,1030 420,980 360,960" stroke="#c9c2b6" strokeWidth={18} strokeLinecap="round" fill="none" opacity={0.85} />
          <g opacity={eyes}><ellipse cx={505} cy={960} rx={16} ry={8} fill={C.bone} /><ellipse cx={575} cy={960} rx={16} ry={8} fill={C.bone} /></g>
        </g>
        <Glow id="e6s6g" cx={540} cy={980} r={340} color={C.red} o={0.15 + 0.2 * eyes} />
      </Cam>
      <Dust t={T} n={26} color={C.moon} o={0.25} />
      <Vignette id="e6s6v" k={0.97} />
      <Grain t={T} o={0.15} />
    </Whip>
  );
};

// 7 · "مامانم…": Saman close, trembling; slow push in
const S7: ShotFn = ({ t, dur, T }) => {
  return (
    <g>
      <RimDefs id="e6s7rim" color={C.phone} dx={6} dy={-1} w={3} blur={2} />
      <g transform={`translate(${noise(T * 30, 3) * 4} ${noise(T * 27, 5) * 3})`}>
        <Cam t={t} dur={dur} from={1.0} to={1.1} ox={540} oy={760}>
          <rect width={W} height={H} fill="#05070c" />
          <Glow id="e6s7p" cx={760} cy={780} r={420} color={C.phone} o={0.4} />
          <Saman x={470} y={1250} s={3.0} talk={noise(T * 6, 2) * 0.6} filter="url(#e6s7rim)" />
        </Cam>
      </g>
      <Vignette id="e6s7v" k={0.97} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 8 · the call dies: timer freezes, static tears the screen, "تماس قطع شد"
const S8: ShotFn = ({ t, dur, T }) => {
  const dead = T >= CUT;
  const g = dead ? Math.exp(-(T - CUT) * 4) : 0;
  const sec = Math.min(Math.floor(T - 8), Math.floor(CUT - 8));
  return (
    <Whip id="e6s8" t={t} dir={-1}>
      <Cam t={t} dur={dur} from={1.15} to={1.3} oy={820}>
        <rect width={W} height={H} fill="#05070d" />
        <Glow id="e6s8g" cx={540} cy={860} r={700} color={C.phone} o={dead ? 0.15 : 0.35} />
        <g transform={`translate(${noise(T * 90, 4) * 30 * g} 0)`}>
          <rect x={360} y={520} width={360} height={760} rx={46} fill="#0a0a0d" />
          <rect x={376} y={536} width={328} height={728} rx={36} fill={dead ? "#1a0a0d" : "#13283b"} />
          <circle cx={540} cy={760} r={70} fill="#2d4a66" />
          <circle cx={540} cy={742} r={26} fill="#9fbad6" /><path d="M492,800 Q540,760 588,800 Z" fill="#9fbad6" />
          <text x={540} y={900} textAnchor="middle" fontFamily="V03Black" fontSize={52} fill="#fff" direction="rtl">سامان</text>
          <text x={540} y={955} textAnchor="middle" fontFamily="V03Bold" fontSize={dead ? 34 : 30} fill={dead ? C.red : "#9fbad6"} direction="rtl">{dead ? "تماس قطع شد" : `03:${String(sec).padStart(2, "0")}`}</text>
          {g > 0.05 && Array.from({ length: 14 }, (_, i) => <rect key={i} x={376} y={540 + ((i * 53 + Math.floor(T * 30) * 37) % 720)} width={328} height={4 + (i % 3) * 6} fill={i % 2 ? "#fff" : C.red} opacity={0.5 * g} />)}
        </g>
      </Cam>
      <Vignette id="e6s8v" k={0.92} />
      <Grain t={T} o={0.14 + g * 0.2} />
    </Whip>
  );
};

// 9 · imagined (red memory grade): her flat's door swings open; the mother's back, and in the doorway something tall
const S9: ShotFn = ({ t, dur, T }) => {
  const open = easeInOut(prog(T, wd(vo, 9, "در") - 0.1, wd(vo, 9, "کرد") + 0.3));
  const eyes = easeOut(prog(T, wd(vo, 9, "کرد"), wd(vo, 9, "کرد") + 0.3));
  const dw = 360 * (1 - open * 0.85);
  return (
    <Whip id="e6s9" t={t}>
      <Cam t={t} dur={dur} from={1.0} to={1.14} oy={1050}>
        <Corridor id="e6s9c" vx={540} vy={900} fw={760} fh={1300} wall="#1a0f12" floor="#0c0708" doors={0} lightK={0} />
        {/* the doorway: red light pours in */}
        <rect x={360} y={420} width={360} height={1000} fill="#3a0a10" />
        <Glow id="e6s9d" cx={540} cy={900} r={700} color={C.red} o={0.6 * open} />
        <Figure x={600} y={1420} s={1} h={980} build={0.75} hair="bald" arms={0.3} headTilt={-8} eyes={eyes} eyeColor={C.bone} fill="#020203" />
        {/* the door leaf, swinging in */}
        <polygon points={`360,420 ${360 + dw},${420 + open * 40} ${360 + dw},${1420 - open * 40} 360,1420`} fill="#120a0c" />
        {/* the mother, back to us, hand on the handle */}
        <Figure x={430} y={1640} s={1} h={760} hair="curly" arms={0.15} fill="#05070c" />
      </Cam>
      <rect width={W} height={H} fill="#5a0d14" opacity={0.28} style={{ mixBlendMode: "screen" }} />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={0} y={i * 30 + ((T * 90) % 30)} width={W} height={2} fill="#000" opacity={0.25} />)}
      <Vignette id="e6s9v" k={0.95} />
      <Grain t={T} o={0.18} />
    </Whip>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "گوشیم", 0.12), S: S2 },
  { at: at(3, "محلِ", 0.5), S: S3 },
  { at: at(4, "سامان", 0.12), S: S4 },
  { at: at(5, "من", 0.12), S: S5 },
  { at: at(6, "یه", 0.12), S: S6 },
  { at: at(7, "مامانم", 0.25), S: S7 },
  { at: at(8, "صداش", 0.15), S: S8 },
  { at: at(9, "مامانم", 0.2), S: S9 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [0.8, 2.6, BUZZ + 0.2, 5.6, 8.5, 11.2, 13.0, 15.5, 18.6, 20.4, 21.6, CUT + 0.2, 25.0, 26.2, vo.total + 0.9];
