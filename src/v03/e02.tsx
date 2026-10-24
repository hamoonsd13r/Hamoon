// V03 · Episode 2 «ذرت» — the dog knows. Shots timed from e02-vo.json
import React from "react";
import { Dog, Figure, Girl } from "./figures";
import { C, Cam, clamp, Dust, easeInOut, easeOut, flicker, Glow, Grain, lerp, noise, prog, RimDefs, Vignette, W, H } from "./lib";
import { Corridor, Door } from "./sets";
import { type Shot, type ShotFn, type VO, wd } from "./ui";
import voJson from "./e02-vo.json";

export const vo = voJson as VO;
const JUMP = wd(vo, 1, "جاش") - 0.05;

// the inside of the front door, side-on: shared wall/door plate for close shots
const DoorSide: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <rect width={W} height={H} fill="#0b1324" />
    <polygon points="0,0 520,0 520,1920 0,1920" fill={C.moon} opacity={0.07} style={{ mixBlendMode: "screen" }} />
    <rect x={620} y={-40} width={520} height={2000} fill="#141f35" />
    <rect x={600} y={-40} width={26} height={2000} fill="#060a14" />
    <rect x={700} y={200} width={340} height={700} fill="none" stroke="#0a1120" strokeWidth={10} />
    <rect x={700} y={1000} width={340} height={900} fill="none" stroke="#0a1120" strokeWidth={10} />
    <rect x={660} y={930} width={70} height={90} rx={10} fill="#05080f" />
    <circle cx={695} cy={975} r={18} fill="#1a263d" />
    <path d="M740,860 q60,80 10,170" stroke="#05080f" strokeWidth={7} fill="none" strokeDasharray="12 6" />
    <Glow id={`${id}gl`} cx={300} cy={600} r={500} color={C.moon} o={0.12} />
  </g>
);

// 1 · her hand on the deadbolt (title over it); the hand flinches when the dog jumps
const S1: ShotFn = ({ t, dur, T }) => {
  const turn = easeInOut(prog(T, 0.3, 1.8)) * 18;
  return (
    <g>
      <RimDefs id="e2s1rim" color="#8aa6d6" dx={-4} dy={-4} w={3} blur={1.4} />
      <Cam t={t} dur={dur} from={1.0} to={1.12} ox={640} oy={1000}>
        <rect width={W} height={H} fill="#121c31" />
        <polygon points="0,0 1080,0 1080,1920 0,1920" fill="#162238" />
        <Glow id="e2s1g" cx={260} cy={700} r={700} color={C.moon} o={0.18} />
        {/* door panel lines */}
        <rect x={180} y={-40} width={760} height={760} fill="none" stroke="#0c1424" strokeWidth={14} />
        <rect x={180} y={1260} width={760} height={760} fill="none" stroke="#0c1424" strokeWidth={14} />
        {/* deadbolt plate + thumb-turn */}
        <rect x={600} y={820} width={210} height={330} rx={26} fill="#070b14" />
        <circle cx={705} cy={985} r={74} fill="#1c2840" />
        <g transform={`rotate(${turn} 705 985)`}><rect x={690} y={925} width={30} height={120} rx={12} fill="#070b14" /></g>
        {/* chain */}
        {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={850 + i * 10} cy={780 + i * 38 + Math.sin(i * 0.7) * 8} rx={12} ry={20} fill="none" stroke="#070b14" strokeWidth={7} />)}
        {/* forearm (hoodie sleeve) + hand gripping the turn */}
        <g fill={C.ink} filter="url(#e2s1rim)" transform={`translate(${T > JUMP ? -60 * easeOut(prog(T, JUMP, JUMP + 0.25)) : 0} 0)`}>
          <path d="M-120,1620 C40,1400 300,1170 520,1070 L600,1150 C400,1300 180,1560 40,1800 Z" />
          <path d="M-160,1700 C-40,1560 60,1470 120,1430 L230,1560 C150,1640 60,1760 -20,1900 Z" />
          <ellipse cx={600} cy={1060} rx={92} ry={70} transform="rotate(-32 600 1060)" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={640} y={918 + i * 36} width={104 - i * 8} height={34} rx={17} transform={`rotate(${-14 + turn * 0.5} 650 ${930 + i * 36})`} />
          ))}
          <rect x={560} y={1050} width={120} height={38} rx={19} transform="rotate(-48 570 1070)" />
        </g>
      </Cam>
      <Dust t={T} n={22} color={C.moon} o={0.35} />
      <Vignette id="e2s1v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// 2 · the hallway, side-on: Zorat springs up from the rug between her and the door
const S2: ShotFn = ({ t, dur, T }) => {
  const up = T >= JUMP;
  const k = prog(T, JUMP, JUMP + 0.45);
  const arc = up ? Math.sin(Math.PI * clamp(k)) * 120 : 0;
  const shake = up ? Math.exp(-(T - JUMP) * 6) : 0;
  return (
    <g>
      <RimDefs id="e2s2rim" color="#8aa6d6" dx={-4} dy={-4} w={3} blur={1.5} />
      <g transform={`translate(${noise(T * 30, 2) * 10 * shake} ${noise(T * 33, 6) * 8 * shake})`}>
        <Cam t={t} dur={dur} from={1.0} to={1.08} oy={1300}>
          <rect width={W} height={H} fill="#0d1628" />
          <polygon points="0,300 420,380 420,1600 0,1700" fill={C.moon} opacity={0.08} style={{ mixBlendMode: "screen" }} />
          <rect x={0} y={1600} width={W} height={320} fill="#070b14" />
          {/* door at the right */}
          <Door x={760} y={540} w={360} h={1060} fill="#141f35" peep={0.3} />
          {/* Raha, back to us, at the door */}
          <Girl x={720} y={1640} s={1.35} filter="url(#e2s2rim)" head={up ? -14 * easeOut(k) : 0} armF={[-40, -60]} armB={[10, -6]} sx={1} />
          {up
            ? <Dog x={360} y={1640 - arc} s={1.05} legs={k < 1 ? [-40, 30, 40, -30] : [0, 0, 0, 0]} head={-6} ears={0} tail={-20} filter="url(#e2s2rim)" breath={Math.sin(T * 6)} />
            : <Dog x={340} y={1640} s={1.05} pose="lie" breath={Math.sin(T * 2.2)} ears={0.2} filter="url(#e2s2rim)" />}
        </Cam>
      </g>
      <Dust t={T} n={30} color={C.moon} o={0.3 + shake * 0.5} />
      <Vignette id="e2s2v" k={0.9} />
      <Grain t={T} />
    </g>
  );
};

// 3 · low on the floor: the dog stares at the door, silent; 4 · tighter, the fur on his neck rises
const dogClose = (tight: boolean): ShotFn => ({ t, dur, T }) => {
  const bris = easeOut(prog(T, wd(vo, 3, "سیخ") - 0.2, wd(vo, 3, "سیخ") + 0.6));
  const stare = tight ? easeInOut(prog(T, wd(vo, 3, "خیره") - 0.3, wd(vo, 3, "خیره") + 0.8)) : 0;
  return (
    <g>
      <RimDefs id="e2dcrim" color="#9db8e6" dx={-5} dy={-4} w={3} blur={1.4} />
      <Cam t={t} dur={dur} from={tight ? 1.0 : 1.02} to={tight ? 1.12 + stare * 0.06 : 1.1} ox={tight ? 640 : 560} oy={tight ? 900 : 1150}>
        <rect width={W} height={H} fill="#0c1526" />
        <Glow id="e2dcg" cx={120} cy={500} r={800} color={C.moon} o={0.2} />
        <rect x={0} y={tight ? 1480 : 1450} width={W} height={500} fill="#070b14" />
        {/* the door edge on the right, a faint line of dark under it */}
        <rect x={tight ? 960 : 880} y={0} width={300} height={1920} fill="#141f35" />
        <rect x={tight ? 940 : 860} y={0} width={24} height={1920} fill="#060a14" />
        <g transform={tight ? "translate(-723 -1212) scale(2.3)" : "translate(-245 -410) scale(1.5)"}>
          <Dog x={420} y={1240} s={1} head={-4 + noise(T * 0.7, 3) * 1.5} ears={0} tail={-38} bristle={bris} eye={0.85} breath={Math.sin(T * 3.4) * 0.6} filter="url(#e2dcrim)" />
        </g>
      </Cam>
      <Dust t={T} n={28} color={C.moon} o={0.35} />
      <Vignette id="e2dcv" k={0.92} />
      <Grain t={T} />
    </g>
  );
};

// 5 · Raha leans to the door: "Mr Naderi, are you okay?"
const S5: ShotFn = ({ t, dur, T }) => {
  const lean = easeInOut(prog(T, wd(vo, 4, "آقای") - 0.2, wd(vo, 4, "خوبه") + 0.3));
  return (
    <g>
      <RimDefs id="e2s5rim" color="#7f9ccc" dx={-5} dy={-3} w={3} blur={1.6} />
      <Cam t={t} dur={dur} from={1.04} to={1.14} ox={700} oy={1000}>
        <DoorSide id="e2s5" />
        <Girl x={lerp(330, 380, lean)} y={2350} s={2.15} filter="url(#e2s5rim)" head={lerp(4, 12, lean) + noise(T, 5) * 1.5} lean={lerp(4, 10, lean)}
          armF={[-62, -64]} armB={[6, -4]} />
      </Cam>
      <Vignette id="e2s5v" k={0.92} />
      <Grain t={T} />
    </g>
  );
};

// 6 · the peephole, huge: something moves across the lens
const S6: ShotFn = ({ t, dur, T }) => {
  const pass = prog(t, 0.6, 2.4);
  const lensDark = pass > 0 && pass < 1 ? Math.sin(Math.PI * pass) : 0;
  return (
    <g>
      <Cam t={t} dur={dur} from={1.0} to={1.25} oy={900}>
        <rect width={W} height={H} fill="#141f35" />
        <Glow id="e2s6g" cx={200} cy={400} r={900} color={C.moon} o={0.14} />
        <rect x={120} y={-40} width={840} height={760} fill="none" stroke="#0c1424" strokeWidth={14} />
        <circle cx={540} cy={900} r={130} fill="#070b14" />
        <circle cx={540} cy={900} r={96} fill="#1a263d" />
        <circle cx={540} cy={900} r={64} fill="#04070d" />
        <circle cx={540} cy={900} r={52} fill={C.red} opacity={0.18 * (1 - lensDark) * flicker(T, 13, 0.5)} />
        <ellipse cx={520} cy={878} rx={16} ry={10} fill={C.moon} opacity={0.55 * (1 - lensDark)} />
      </Cam>
      <Dust t={T} n={20} color={C.moon} o={0.3} />
      <Vignette id="e2s6v" k={0.95} />
      <Grain t={T} />
    </g>
  );
};

// 7 · outside: the old man, closer — "Open the door, Raha." His head tips on her name.
const S7: ShotFn = ({ t, dur, T }) => {
  const fl = flicker(T, 13, 0.5);
  const tilt = lerp(6, 16, easeInOut(prog(T, wd(vo, 6, "رها") - 0.1, wd(vo, 6, "رها") + 0.5)));
  return (
    <g>
      <RimDefs id="e2s7rim" color={C.red} dx={-4} dy={-3} w={2.5} blur={1.5} />
      <Cam t={t} dur={dur} from={1.15} to={1.3} ox={640} oy={900}>
        <Corridor id="e2s7c" vx={380} vy={880} fw={300} fh={480} wall="#0d1423" floor="#080c16" lightK={0.75 * fl} doors={3} />
        <polygon points="860,560 1080,420 1080,1920 860,1500" fill="#101a2c" />
        <Figure x={660} y={1640} s={1.6} h={600} hair="old" hunch={1} build={1.08} headTilt={tilt} filter="url(#e2s7rim)" />
      </Cam>
      <Dust t={T} n={26} color="#ff8f80" o={0.25} />
      <Vignette id="e2s7v" k={0.95} />
      <Grain t={T} o={0.12} />
    </g>
  );
};

// 8 · inside, wide: Raha and Zorat in the dark hallway facing the door; the dog's lip lifts
const S8: ShotFn = ({ t, dur, T }) => {
  const snarl = easeOut(prog(T, wd(vo, 7, "ولی"), wd(vo, 7, "نبود") + 0.4));
  const fl = 0.7 + 0.3 * flicker(T, 21, 0.6);
  return (
    <g>
      <RimDefs id="e2s8rim" color="#7f9ccc" dx={-4} dy={-4} w={3} blur={1.5} />
      <Cam t={t} dur={dur} from={1.0} to={1.14} ox={760} oy={1500}>
        <rect width={W} height={H} fill="#0c1424" />
        <polygon points="0,300 360,380 360,1620 0,1720" fill={C.moon} opacity={0.08 * fl} style={{ mixBlendMode: "screen" }} />
        <rect x={0} y={1760} width={W} height={300} fill="#060a12" />
        <Door x={720} y={700} w={380} h={1060} fill="#131d32" peep={0.25} />
        {/* the faint red of the corridor exit light leaking under the door */}
        <rect x={720} y={1752} width={380} height={8} fill={C.red} opacity={0.5 * flicker(T, 13, 0.6)} />
        <Glow id="e2s8u" cx={910} cy={1770} r={260} color={C.red} o={0.3 * flicker(T, 13, 0.6)} sy={0.25} />
        <Girl x={560} y={1800} s={1.3} filter="url(#e2s8rim)" head={2} armF={[-8, -6]} armB={[8, -4]} lean={-2} />
        <Dog x={330} y={1800} s={0.95} head={-4} jaw={snarl * 0.25} ears={0} tail={-40} bristle={1} eye={0.8} filter="url(#e2s8rim)" />
      </Cam>
      <Dust t={T} n={30} color={C.moon} o={0.3} />
      <Vignette id="e2s8v" k={0.93} />
      <Grain t={T} />
    </g>
  );
};

const at = (n: number, w: string, pre = 0.12) => wd(vo, n, w) - pre;
export const SHOTS: Shot[] = [
  { at: 0, S: S1 },
  { at: at(1, "که", 0.1), S: S2 },
  { at: at(2, "تا", 0.1), S: dogClose(false) },
  { at: at(3, "موهای", 0.1), S: dogClose(true) },
  { at: at(4, "گفتم", 0.1), S: S5 },
  { at: at(5, "این", 0.1), S: S6 },
  { at: at(6, "در", 0.12), S: S7 },
  { at: at(7, "لَحنِش", 0.15), S: S8 },
];
export const TOTAL = vo.total + 1.6;
export const LOOK = [0.9, 2.5, JUMP + 0.2, 6.0, 10.5, 12.8, 15.5, 19.0, 21.9, 24.5, 26.8, vo.total + 0.9];
