// V03 · Episode 4 «مرده‌ها هم در می‌زنن» — faster cutting: knocks, a fall, the body, the head that turns. Timed from e04-vo.json
import { Figure, Girl } from "./figures";
import { C, Cam, clamp, Dust, easeIn, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, Rain, RimDefs, Vignette, W, H, Whip } from "./lib";
import { Building, Corridor, Door } from "./sets";
import { AtDoor, Face, Peep } from "./e03";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e04-vo.json";

export const vo = voJson as VO;
export const KNOCKS = [wd(vo, 1, "مُرده‌ها"), wd(vo, 1, "مُرده‌ها") + 0.5, wd(vo, 1, "می‌زنن") + 0.05];
const hitAt = (T: number, at: number, len = 0.35) => (T >= at && T < at + len ? Math.exp(-(T - at) * 9) : 0);

// 1 · cold open: the front door shakes under three heavy knocks; red light pulses under it
const S1: ShotFn = ({ t, dur, T }) => {
  const h = KNOCKS.reduce((m, k) => Math.max(m, hitAt(T, k)), 0);
  const jx = noise(T * 50, 3) * 22 * h, jy = noise(T * 47, 7) * 16 * h;
  const under = 0.25 + 0.75 * h;
  return (
    <g>
      <g transform={`translate(${jx} ${jy}) translate(540 1000) scale(${1 + h * 0.025}) translate(-540 -1000)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.16} oy={1050}>
          <rect width={W} height={H} fill="#0a111f" />
          <Glow id="e4s1m" cx={140} cy={600} r={700} color={C.moon} o={0.12} />
          <rect x={0} y={1640} width={W} height={280} fill="#05080f" />
          <Door x={290} y={560} w={500} h={1080} fill="#141f35" peep={0.2 + h * 0.6} />
          <rect x={290} y={1632} width={500} height={10} fill={C.red} opacity={under} />
          <Glow id="e4s1u" cx={540} cy={1650} r={420} color={C.red} o={0.45 * under} sy={0.22} />
          {KNOCKS.map((k, i) => T > k && T < k + 1.2 ? (
            <g key={i} opacity={1 - prog(T, k, k + 1.2)}>
              {Array.from({ length: 10 }, (_, j) => <circle key={j} cx={300 + ((j * 97 + i * 41) % 480)} cy={570 + (T - k) * (300 + j * 30)} r={2 + (j % 3)} fill={C.moon} />)}
            </g>
          ) : null)}
        </Cam>
      </g>
      <Dust t={T} n={26} color={C.moon} o={0.3 + h * 0.5} />
      <Vignette id="e4s1v" k={0.92} />
      <Grain t={T} o={0.1 + h * 0.12} />
    </g>
  );
};

// 2 · Raha, phone to her ear, panicked — handheld shake
const S2: ShotFn = ({ t, dur, T }) => (
  <Whip id="e4s2" t={t} dir={-1}>
    <RimDefs id="e4s2rim" color={C.phone} dx={4} dy={-3} w={3} blur={1.8} />
    <g transform={`translate(${noise(T * 7, 2) * 14} ${noise(T * 6, 9) * 10})`}>
      <Cam t={t} dur={dur} from={1.08} to={1.2} ox={480} oy={760}>
        <rect width={W} height={H} fill="#0b1324" />
        <Glow id="e4s2g" cx={560} cy={760} r={520} color={C.phone} o={0.45 * flicker(T, 5, 0.2)} />
        <rect x={760} y={-40} width={400} height={2000} fill="#141f35" />
        <Girl x={420} y={2150} s={2.4} filter="url(#e4s2rim)" head={-6 + noise(T * 2, 4) * 3} lean={2} armF={[-60, 195]} armB={[6, -4]} phone={0.9} />
      </Cam>
    </g>
    <Vignette id="e4s2v" k={0.92} />
    <Grain t={T} />
  </Whip>
);

// 3 · Saman's memory (red-tinted, scanlines): the open window on the second floor, a body falling past
const S3: ShotFn = ({ t, dur, T }) => {
  const fallAt = wd(vo, 3, "افتاد") - 0.1;
  const f = clamp((T - fallAt) / 0.55);
  const y = lerp(820, 2300, easeIn(f));
  const tilt = easeInOut(prog(T, fallAt, fallAt + 0.6));
  return (
    <Whip id="e4s3" t={t}>
      <Cam t={t} dur={dur} from={1.05} to={1.12} oy={900} pan={[0, -40]}>
        <g transform={`translate(0 ${-tilt * 260})`}>
          <rect x={0} y={-400} width={W} height={2600} fill="#0b0a12" />
          <Building x={140} y={300} w={800} h={1700} t={T} win={(i) => (i === 4 ? { lit: 0.6, color: "#ffb08a" } : { lit: 0 })} />
          {/* the open window: a curtain blowing out */}
          <path d={`M520,${760 + noise(T, 2) * 6} C${600 + noise(T * 2, 3) * 30},800 ${620 + noise(T * 2, 5) * 40},900 ${560 + noise(T, 8) * 20},980 L520,960 Z`} fill="#e9d6c8" opacity={0.35} />
          {T > fallAt && f < 1 && (
            <g opacity={0.95}>
              {[0.05, 0.1, 0.15].map((d, i) => <line key={i} x1={540 - 30 + i * 30} y1={y - 380} x2={540 - 30 + i * 30} y2={y - 380 - 260 * f} stroke={C.moon} strokeWidth={3} opacity={0.4} />)}
              <Figure x={540} y={y} s={0.42} h={600} hair="old" arms={0.9} rot={20 + f * 50} />
            </g>
          )}
        </g>
        <Rain t={T} n={110} color="#c9a6a0" o={0.35} />
      </Cam>
      {/* memory grade: red wash + scanlines */}
      <rect width={W} height={H} fill="#5a0d14" opacity={0.28} style={{ mixBlendMode: "screen" }} />
      {Array.from({ length: 64 }, (_, i) => <rect key={i} x={0} y={i * 30 + ((T * 90) % 30)} width={W} height={2} fill="#000" opacity={0.25} />)}
      <Vignette id="e4s3v" k={0.95} />
      <Grain t={T} o={0.18} />
    </Whip>
  );
};

// 4 · the courtyard from above: the body on wet tiles, a phone torch sweeping over it; snap on "حیاطه"
const S4: ShotFn = ({ t, dur, T }) => {
  const snap = easeOut(prog(T, wd(vo, 4, "حیاطه") - 0.08, wd(vo, 4, "حیاطه") + 0.12));
  const beamX = 560 + Math.sin(T * 1.4) * 140;
  return (
    <Whip id="e4s4" t={t} dir={-1}>
      <g transform={`translate(540 1150) scale(${1 + snap * 0.22}) translate(-540 -1150)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.1} oy={1150}>
          <rect width={W} height={H} fill="#1a2436" />
          {/* tiles */}
          {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 170} x2={W} y2={i * 170 + 40} stroke="#05080f" strokeWidth={6} />)}
          {Array.from({ length: 8 }, (_, i) => <line key={`v${i}`} x1={i * 160} y1={0} x2={i * 160 - 60} y2={H} stroke="#05080f" strokeWidth={6} />)}
          {/* puddle reflections */}
          <ellipse cx={330} cy={1500} rx={190} ry={40} fill="#22324f" opacity={0.6} />
          <ellipse cx={780} cy={760} rx={150} ry={30} fill="#22324f" opacity={0.5} />
          {/* the body (from above: lying on its side), one slipper away */}
          <g transform="translate(840 1160) rotate(-80)"><Figure x={0} y={0} s={0.95} h={600} hair="old" arms={0.6} /></g>
          <ellipse cx={300} cy={980} rx={34} ry={16} fill="#05070c" transform="rotate(30 300 980)" />
          {/* torch beam from Saman's window */}
          <polygon points={`${beamX - 40},-40 ${beamX + 40},-40 ${beamX + 260},1400 ${beamX - 260},1400`} fill={C.glow} opacity={0.08} style={{ mixBlendMode: "screen" }} />
          <Glow id="e4s4b" cx={beamX} cy={1180} r={300} color={C.glow} o={0.3} sy={0.7} />
        </Cam>
        <Rain t={T} n={150} color={C.moon} o={0.4} slant={0.05} />
      </g>
      <Vignette id="e4s4v" k={0.95} />
      <Grain t={T} o={0.14} />
    </Whip>
  );
};

// 5 · "I froze": extreme close on her face, heartbeat zoom pulses, colour drains
const S5: ShotFn = ({ t, dur, T }) => {
  const beat = Math.pow(Math.max(0, Math.sin(T * Math.PI * 2.4)), 12);
  return (
    <g>
      <RimDefs id="e4s5rim" color="#a9c0ea" dx={-6} dy={-3} w={3} blur={1.4} />
      <g transform={`translate(540 900) scale(${1 + beat * 0.03}) translate(-540 -900)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.1} ox={560} oy={860}>
          <rect width={W} height={H} fill="#0c1222" />
          <Glow id="e4s5g" cx={300} cy={700} r={700} color={C.moon} o={0.18} />
          <Girl x={210} y={4200} s={6.2} filter="url(#e4s5rim)" head={2} armF={[-4, -4]} armB={[4, -4]} />
        </Cam>
      </g>
      <rect width={W} height={H} fill="#000" opacity={0.15 + beat * 0.15} />
      <Vignette id="e4s5v" k={0.95} />
      <Grain t={T} />
    </g>
  );
};

const S5b: ShotFn = ({ t, dur, T }) => <Whip id="e4s5b" t={t}><AtDoor id="e4s5b" t={t} dur={dur} T={T} close={1} lean={easeInOut(prog(t, 0, 0.9))} /></Whip>;

// 6/7 · through the peephole: he is still there… then his HEAD turns all the way round, the body never moves
const peep = (turn: boolean): ShotFn => ({ t, dur, T }) => {
  const k = turn ? easeInOut(prog(T, wd(vo, 7, "سرش") - 0.2, wd(vo, 7, "چرخوند") + 0.7)) : 0;
  const fl = flicker(T, 13, 0.5);
  return (
    <g>
      <RimDefs id="e4pcrim" color={C.red} dx={-3} dy={-3} w={2.5} blur={1.4} />
      <Cam t={t} dur={dur} from={turn ? 1.08 : 1.0} to={turn ? 1.3 : 1.1} oy={760}>
        <Peep id={turn ? "e4p2" : "e4p1"}>
          <g transform="translate(540 900) scale(1.25) translate(-540 -900)">
            <Corridor id="e4pc" vx={540} vy={860} fw={240} fh={360} wall="#0f1729" floor="#0a0f1b" ceil="#070a12" lightK={0.8 * fl} doors={2} />
            <Figure x={540} y={1440} s={1.45} h={600} hair="old" hunch={1.2} build={1.1} filter="url(#e4pcrim)" />
            {/* the face slides round from the side of the skull */}
            {k > 0.02 && (
              <g transform={`translate(${lerp(58, 0, k)} 0)`}>
                <g transform={`translate(540 ${1440 - 516 * 1.45}) scale(${lerp(0.15, 1, k)} 1) translate(-540 ${-(1440 - 516 * 1.45)})`}>
                  <Face cx={540} cy={1440 - 516 * 1.45} s={0.41} o={clamp(k * 1.6)} />
                </g>
              </g>
            )}
          </g>
        </Peep>
      </Cam>
      <Dust t={T} n={16} color="#ff9a8c" o={0.2} />
      <Grain t={T} o={0.14} />
    </g>
  );
};

// 8 · he looks straight into the lens: the face fills it; glitch + red flash on "کرد!"
const S8: ShotFn = ({ t, dur, T }) => {
  const push = easeOut(prog(t, 0, 0.35));
  const hit = T >= wd(vo, 8, "کرد") - 0.05;
  const g = hit ? Math.exp(-(T - wd(vo, 8, "کرد") + 0.05) * 5) : 0;
  const gx = g > 0.05 ? noise(T * 80, 4) * 40 * g : 0;
  return (
    <g>
      <g transform={`translate(${gx} 0)`}>
        <Cam t={t} dur={dur} from={1.0} to={1.12} oy={900}>
          <Peep id="e4p3">
            <rect width={W} height={H} fill="#140608" />
            <ellipse cx={540} cy={1200} rx={500} ry={200} fill={C.red} opacity={0.15} />
            <Face cx={540} cy={920} s={lerp(1.2, 2.4, push) + g * 0.2} o={1} />
          </Peep>
        </Cam>
      </g>
      {g > 0.05 && <>
        <rect width={W} height={H} fill={C.red} opacity={0.22 * g} style={{ mixBlendMode: "screen" }} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={0} y={(i * 337 + Math.floor(T * 30) * 91) % H} width={W} height={18 + (i % 3) * 12} fill="#fff" opacity={0.08 * g} transform={`translate(${noise(T * 40 + i, 2) * 60} 0)`} />)}
      </>}
      <Vignette id="e4s8v" k={0.9} />
      <Grain t={T} o={0.15 + g * 0.2} />
    </g>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(2, "سامان", 0.12), S: S2 },
  { at: at(3, "آقای", 0.1), S: S3 },
  { at: at(4, "خودم", 0.1), S: S4 },
  { at: at(5, "خُشکَم", 0.1), S: S5 },
  { at: at(5, "دوباره", 0.12), S: S5b },
  { at: at(6, "آقای", 0.1), S: peep(false) },
  { at: at(7, "این", 0.1), S: peep(true) },
  { at: at(8, "و", 0.08), S: S8 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [KNOCKS[0] + 0.05, 2.0, 5.6, 9.9, 10.2, 12.8, 14.9, 16.4, 19.0, 22.6, 24.2, 27.3, vo.total + 0.9];
