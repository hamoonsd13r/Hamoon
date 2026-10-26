// V12 scenes 0–6: hook, satellites, phone listens, light-time, three circles, 4th satellite clock, relativity.
import React from "react";
import { C, Clock, Earth, FONT, Phone, Pin, Satellite, Tag, W, H, clamp, easeInOut, easeOut, fa, faNum, hash, lerp, pop, prog, wd } from "./kit";
import { CityMap } from "./map";

export const Stars: React.FC<{ T: number; a?: number }> = ({ T, a = 1 }) => (
  <g opacity={a}>
    {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={hash(i) * W} cy={hash(i + 50) * H} r={1 + hash(i + 7) * 2.2} fill="#BFD4FF" opacity={(0.25 + 0.6 * hash(i + 3)) * (0.7 + 0.3 * Math.sin(T * 2 + i))} />)}
  </g>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

// ───── 0 · hook: phone map → zoom out to Earth, satellite 20,000 km up ─────
export const S0: React.FC<{ T: number }> = ({ T }) => {
  const z0 = wd(0, "جوابش");
  const out = easeInOut(prog(T, z0 - 0.05, z0 + 0.75));
  const ph = { x: 540, y: lerp(900, 1290, out), s: lerp(0.92, 0.09, out) };
  const q = pop(T, wd(0, "کجا"), 0.3);
  const q2 = pop(T, wd(0, "کجا", 1), 0.3);
  const earthY = lerp(2900, 2050, out);
  const alt0 = wd(0, "۲۰"), alt1 = wd(0, "سرته");
  const alt = 20200 * easeOut(prog(T, alt0 - 0.4, alt1));
  const satY = lerp(-200, 330, easeOut(prog(T, z0 + 0.3, z0 + 1.0)));
  const mapCam = { cx: 900, cy: 840 - T * 8, z: 0.75, sx: 0, sy: 0 };
  return (
    <Svg>
      <Stars T={T} a={out} />
      <Earth x={540} y={earthY} r={900} spin={T * 6} />
      {out > 0.3 && (
        <g opacity={prog(T, z0 + 0.4, z0 + 0.8)}>
          <line x1={540} y1={1160} x2={540} y2={satY + 40} stroke={C.lime} strokeWidth={4} strokeDasharray="14 14" strokeDashoffset={-T * 60} />
          <Satellite x={540} y={satY} s={1.25} rot={Math.sin(T * 1.5) * 6} />
          <g transform={`translate(${760} ${700})`} opacity={prog(T, alt0 - 0.4, alt0)}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT.black} fontSize={96} fill={C.lime}>{faNum(alt)}</text>
            <text x={0} y={70} textAnchor="middle" fontFamily={FONT.bold} fontSize={46} fill={C.ink} style={{ direction: "rtl" }}>کیلومتر بالاتر</text>
          </g>
        </g>
      )}
      <g transform={`translate(${ph.x} ${ph.y}) scale(${ph.s})`}>
        <Phone x={0} y={0} w={520} h={1000}>
          <g transform="translate(-260 -500)">
            <CityMap cam={mapCam} />
            <rect x={30} y={70} width={460} height={90} rx={45} fill="rgba(234,242,255,0.95)" />
            <text x={260} y={128} textAnchor="middle" fontFamily={FONT.bold} fontSize={38} fill={C.bg} style={{ direction: "rtl" }}>مبدأ کجاست؟</text>
            <Pin x={260} y={560} s={1.1} pulse={(T * 0.9) % 1} />
            <g transform={`translate(330 380) scale(${q})`}><circle r={46} fill={C.ink} /><text y={20} textAnchor="middle" fontFamily={FONT.black} fontSize={60} fill={C.bg}>؟</text></g>
            <g transform={`translate(180 420) scale(${q2 * 0.8})`}><circle r={46} fill={C.ink} /><text y={20} textAnchor="middle" fontFamily={FONT.black} fontSize={60} fill={C.bg}>؟</text></g>
            <rect x={30} y={860} width={460} height={100} rx={30} fill={C.lime} />
            <text x={260} y={925} textAnchor="middle" fontFamily={FONT.black} fontSize={42} fill={C.bg} style={{ direction: "rtl" }}>درخواست سفر</text>
          </g>
        </Phone>
      </g>
    </Svg>
  );
};

// ───── 1 · ~30 GPS satellites shouting «I'm here, and the time is exactly…» ─────
const ORBITS = [{ rx: 470, ry: 150, rot: -18 }, { rx: 430, ry: 190, rot: 32 }, { rx: 500, ry: 120, rot: 75 }];
const satPos = (k: number, T: number) => {
  const o = ORBITS[k % 3];
  const a = (k / 9) * Math.PI * 2 + T * (0.35 + (k % 3) * 0.08);
  const x0 = Math.cos(a) * o.rx, y0 = Math.sin(a) * o.ry;
  const r = (o.rot * Math.PI) / 180;
  return { x: 540 + x0 * Math.cos(r) - y0 * Math.sin(r), y: 780 + x0 * Math.sin(r) + y0 * Math.cos(r), front: Math.sin(a) > -0.2 };
};
export const S1: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const enter = easeOut(prog(T, t0, t0 + 0.6));
  const shout = wd(1, "داد"), here = wd(1, "اینجام"), time = wd(1, "ساعت");
  const nSat = Math.round(lerp(3, 9, prog(T, wd(1, "۳۰") - 0.3, wd(1, "۳۰") + 0.5)));
  const ns = Math.floor((T - time) * 1e6) % 1000000;
  return (
    <Svg>
      <Stars T={T} />
      <g transform={`translate(540 780) scale(${lerp(0.6, 1, enter)}) translate(-540 -780)`} opacity={enter}>
        {ORBITS.map((o, i) => <ellipse key={i} cx={540} cy={780} rx={o.rx} ry={o.ry} transform={`rotate(${o.rot} 540 780)`} fill="none" stroke={C.street} strokeWidth={3} strokeDasharray="10 12" />)}
        {Array.from({ length: 9 }, (_, k) => { const p = satPos(k, T); return !p.front && k < nSat ? <Satellite key={k} x={p.x} y={p.y} s={0.5} /> : null; })}
        <Earth x={540} y={780} r={280} spin={T * 10} />
        {Array.from({ length: 9 }, (_, k) => {
          const p = satPos(k, T);
          if (!p.front || k >= nSat) return null;
          const ring = T > shout ? ((T - shout + k * 0.13) % 0.9) / 0.9 : -1;
          return (
            <g key={k}>
              {ring >= 0 && <circle cx={p.x} cy={p.y} r={30 + ring * 110} fill="none" stroke={C.lime} strokeWidth={3} opacity={1 - ring} />}
              <Satellite x={p.x} y={p.y} s={0.62} />
            </g>
          );
        })}
      </g>
      <Tag x={540} y={260} text={`${fa(30)} ماهواره‌ی GPS`} a={prog(T, wd(1, "۳۰") - 0.2, wd(1, "۳۰") + 0.1)} s={pop(T, wd(1, "۳۰") - 0.2)} size={58} fg={C.lime} />
      <g opacity={prog(T, here - 0.15, here + 0.05)} transform={`translate(300 520) scale(${pop(T, here - 0.15)})`}>
        <rect x={-170} y={-60} width={340} height={100} rx={30} fill={C.ink} />
        <path d="M60 40 L100 80 L100 40 Z" fill={C.ink} />
        <text x={0} y={8} textAnchor="middle" fontFamily={FONT.black} fontSize={46} fill={C.bg} style={{ direction: "rtl" }}>📍 من اینجام!</text>
      </g>
      <g opacity={prog(T, time - 0.15, time + 0.05)} transform={`translate(750 1120) scale(${pop(T, time - 0.15)})`}>
        <rect x={-260} y={-62} width={520} height={110} rx={30} fill={C.ink} />
        <path d="M-60 -62 L-100 -100 L-100 -62 Z" fill={C.ink} />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT.num} fontSize={48} fill={C.bg}>⏱ 12:00:00.{String(Math.max(0, ns)).padStart(6, "0")}</text>
      </g>
    </Svg>
  );
};

// ───── 2 · the phone only listens (a nosy neighbour) ─────
export const S2: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const no = wd(2, "هیچ"), nosy = wd(2, "همسایه‌ی"), ear = wd(2, "گوش");
  const e = pop(T, nosy - 0.1, 0.45);
  const look = Math.sin((T - nosy) * 5) * 22 * prog(T, nosy, nosy + 0.3);
  return (
    <Svg>
      <Stars T={T} a={0.6} />
      {Array.from({ length: 4 }, (_, i) => {
        const q = ((T - t0) * 0.8 + i * 0.25) % 1;
        return <path key={i} d={`M${540 - 260} ${lerp(150, 520, q)} Q540 ${lerp(30, 400, q)} ${540 + 260} ${lerp(150, 520, q)}`} stroke={C.glow} strokeWidth={6} fill="none" opacity={(1 - q) * 0.8} />;
      })}
      {[180, 540, 900].map((x, i) => <Satellite key={i} x={x} y={130 + (i % 2) * 40} s={0.55} />)}
      <g transform={`translate(540 ${lerp(1100, 860, easeOut(prog(T, t0, t0 + 0.5)))})`}>
        {/* ears */}
        <g opacity={e > 0 ? 1 : 0}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 250} -60) scale(${sd * e} ${e}) rotate(${Math.sin(T * 6) * 6})`}>
              <path d="M0 -70 C70 -90 110 -20 80 40 C60 80 20 70 0 40" fill="#FFC9A8" stroke="#E79A78" strokeWidth={6} />
              <path d="M10 -40 C50 -50 70 -10 52 22" stroke="#E79A78" strokeWidth={8} fill="none" />
            </g>
          ))}
        </g>
        <Phone x={0} y={0} w={440} h={760}>
          <rect x={-220} y={-380} width={440} height={760} fill={C.bg2} />
          {T < nosy ? (
            <g>
              {[0, 1, 2].map((i) => <rect key={i} x={-150} y={-100 + i * 70} width={300 - i * 60} height={30} rx={15} fill="#24376E" />)}
              <text x={0} y={-180} textAnchor="middle" fontFamily={FONT.black} fontSize={50} fill={C.glow} style={{ direction: "rtl" }}>دریافت سیگنال…</text>
            </g>
          ) : (
            <g>
              {[-90, 90].map((ex) => (
                <g key={ex} transform={`translate(${ex} -40)`}>
                  <ellipse rx={62} ry={74} fill={C.ink} />
                  <circle cx={look} cy={6} r={30} fill={C.bg} />
                  <circle cx={look + 10} cy={-4} r={9} fill={C.ink} />
                </g>
              ))}
              <path d={`M-70 150 Q0 ${170 + Math.sin(T * 8) * 10} 70 150`} stroke={C.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
            </g>
          )}
        </Phone>
        {/* outgoing reply: blocked */}
        <g opacity={prog(T, no - 0.1, no + 0.15)}>
          <line x1={0} y1={-430} x2={0} y2={-560} stroke={C.red} strokeWidth={10} strokeDasharray="18 14" />
          <path d="M-26 -540 L0 -580 L26 -540" stroke={C.red} strokeWidth={10} fill="none" />
          <g transform={`translate(0 -500) scale(${pop(T, no + 0.1)})`}>
            <circle r={52} fill={C.red} />
            <path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
          </g>
          <Tag x={240} y={-500} text="بدون جواب" size={40} fg={C.red} />
        </g>
      </g>
      <Tag x={540} y={1260} text="👂 فقط گوش می‌ده" a={prog(T, ear - 0.2, ear)} s={pop(T, ear - 0.2)} size={52} fg={C.lime} />
    </Svg>
  );
};

// ───── 3 · signal at light speed → travel time → distance ─────
export const S3: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const light = wd(3, "نور"), howlong = wd(3, "چقدر"), dist = wd(3, "فاصله‌اش");
  const pulse = ((T - t0) / 1.1) % 1;
  const sw = 0.067 * easeOut(prog(T, howlong - 0.1, howlong + 1.2));
  const f1 = pop(T, dist - 0.2, 0.4), f2 = pop(T, dist + 0.6, 0.4);
  return (
    <Svg>
      <Stars T={T} a={0.7} />
      <Satellite x={540} y={250} s={1.1} />
      <line x1={540} y1={320} x2={540} y2={940} stroke={C.street} strokeWidth={6} strokeDasharray="16 14" />
      {[0, 0.5].map((o) => { const q = (pulse + o) % 1; const y = lerp(320, 940, easeInOut(q)); return (
        <g key={o}>
          <line x1={540} y1={Math.max(320, y - 120)} x2={540} y2={y} stroke={C.lime} strokeWidth={12} strokeLinecap="round" filter="url(#v12glow)" />
          <circle cx={540} cy={y} r={14} fill={C.ink} />
        </g>
      ); })}
      <g transform="translate(540 1040)">
        <rect x={-55} y={-95} width={110} height={190} rx={22} fill="#11182E" stroke={C.glow} strokeWidth={4} />
        <rect x={-42} y={-78} width={84} height={150} rx={10} fill={C.bg2} />
        <circle cx={0} cy={0} r={18} fill={C.lime} opacity={0.4 + 0.6 * (pulse > 0.85 ? 1 : 0)} />
      </g>
      <Tag x={540} y={450} text="⚡ ۳۰۰٬۰۰۰ کیلومتر در ثانیه" a={prog(T, light - 0.2, light)} s={pop(T, light - 0.2)} size={40} fg={C.lime} />
      <g transform={`translate(840 640) scale(${pop(T, howlong - 0.2)})`} opacity={prog(T, howlong - 0.2, howlong)}>
        <circle r={110} fill={C.bg2} stroke={C.ink} strokeWidth={8} />
        <rect x={-20} y={-150} width={40} height={30} rx={6} fill={C.ink} />
        <line x1={0} y1={0} x2={Math.sin(sw * 90) * 85} y2={-Math.cos(sw * 90) * 85} stroke={C.lime} strokeWidth={8} strokeLinecap="round" />
        <text y={190} textAnchor="middle" fontFamily={FONT.black} fontSize={56} fill={C.ink} style={{ direction: "rtl" }}>{faNum(sw, 3)} ثانیه</text>
      </g>
      <g transform={`translate(540 1240) scale(${f1})`} opacity={f1 > 0 ? 1 : 0}>
        <rect x={-430} y={-70} width={860} height={130} rx={34} fill="rgba(10,18,45,0.92)" stroke={C.lime} strokeWidth={4} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT.black} fontSize={54} fill={C.ink} style={{ direction: "rtl" }}>
          {T < dist + 0.6 ? "فاصله = سرعت × زمان" : ""}
        </text>
        <g opacity={f2 > 0 ? 1 : 0} transform={`scale(${f2 > 0 ? f2 : 1})`}>
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT.black} fontSize={50} fill={C.lime} style={{ direction: "rtl" }}>{T >= dist + 0.6 ? "۳۰۰٬۰۰۰ × ۰٫۰۶۷ ≈ ۲۰٬۰۰۰ کیلومتر" : ""}</text>
        </g>
      </g>
    </Svg>
  );
};

// ───── 4 · three friends, three circles, one point ─────
const U4 = { x: 560, y: 770 };
const F4 = [
  { r: 280, ang: 205, face: "🙂", say: "۲ کیلومتر", word: ["۲", 0] as const },
  { r: 420, ang: -35, face: "😎", say: "۳ کیلومتر", word: ["۳", 0] as const },
  { r: 140, ang: 95, face: "🤓", say: "۱ کیلومتر", word: ["یکی", 0] as const },
].map((f) => ({ ...f, x: U4.x + f.r * Math.cos((f.ang * Math.PI) / 180), y: U4.y + f.r * Math.sin((f.ang * Math.PI) / 180) }));
export const S4: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const one = wd(4, "نقطه"), you = wd(4, "خود");
  const cam = { cx: 790, cy: 800, z: 0.9 };
  return (
    <Svg>
      <CityMap cam={cam} a={0.35} />
      {F4.map((f, i) => {
        const tw = wd(4, f.word[0]);
        const ap = pop(T, t0 + 0.4 + i * 0.25, 0.4);
        const g = easeOut(prog(T, tw - 0.1, tw + 0.6));
        return (
          <g key={i}>
            <circle cx={f.x} cy={f.y} r={f.r * g} fill={`rgba(94,168,255,${0.06 * g})`} stroke={C.glow} strokeWidth={5} strokeDasharray={T > one ? undefined : "18 12"} opacity={g > 0 ? 1 : 0} />
            <g transform={`translate(${f.x} ${f.y}) scale(${ap})`}>
              <circle r={52} fill={C.bg2} stroke={C.ink} strokeWidth={5} />
              <text y={22} textAnchor="middle" fontSize={62}>{f.face}</text>
            </g>
            <Tag x={f.x} y={i === 2 ? f.y + 110 : f.y - 100} text={f.say} a={prog(T, tw - 0.1, tw + 0.05)} s={pop(T, tw - 0.1)} size={38} />
          </g>
        );
      })}
      {T > one - 0.1 && <circle cx={U4.x} cy={U4.y} r={20 + 40 * ((T * 1.6) % 1)} fill="none" stroke={C.lime} strokeWidth={5} opacity={1 - ((T * 1.6) % 1)} />}
      {T > one - 0.1 && <circle cx={U4.x} cy={U4.y} r={14} fill={C.lime} />}
      {T > you - 0.15 && <g transform={`translate(0 ${-(1 - easeOut(prog(T, you - 0.15, you + 0.2))) * 300})`}><Pin x={U4.x} y={U4.y} s={1.3} label="تو!" /></g>}
    </Svg>
  );
};

// ───── 5 · the 4th satellite fixes the phone clock; 1 ms = 300 km ─────
export const S5: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const ms = wd(5, "هزارم"), km = wd(5, "۳۰۰"), wrong = wd(5, "اشتباه");
  const sat = easeOut(prog(T, t0, t0 + 0.6));
  const fly = easeInOut(prog(T, km - 0.35, km + 0.5));
  const teh = { x: 800, y: 900 }, isf = { x: 330, y: 1180 };
  const pinX = lerp(teh.x, isf.x, fly), pinY = lerp(teh.y, isf.y, fly) - Math.sin(fly * Math.PI) * 260;
  const shake = T > wrong ? Math.sin(T * 60) * 8 * (1 - prog(T, wrong, wrong + 0.5)) : 0;
  return (
    <Svg>
      <Stars T={T} a={0.5} />
      <g transform={`translate(${lerp(1300, 760, sat)} 260)`}>
        <Satellite x={0} y={0} s={1} />
        <g transform="translate(-180 10)"><Clock x={0} y={0} r={58} t={T * 4} /></g>
        <Tag x={0} y={120} text="ماهواره‌ی ۴" size={38} fg={C.lime} />
      </g>
      <g transform={`translate(${shake} 0)`}>
        <g transform={`translate(330 520) scale(${pop(T, ms - 0.2)})`} opacity={prog(T, ms - 0.2, ms)}>
          <rect x={-250} y={-70} width={500} height={130} rx={30} fill="rgba(10,18,45,0.92)" stroke={C.red} strokeWidth={4} />
          <text y={18} textAnchor="middle" fontFamily={FONT.black} fontSize={56} fill={C.ink} style={{ direction: "rtl" }}>خطا: ۰٫۰۰۱ ثانیه</text>
        </g>
        {/* a flat sketch of the road between the two cities */}
        <path d={`M${teh.x} ${teh.y} Q 560 940 ${isf.x} ${isf.y}`} stroke={C.street} strokeWidth={18} fill="none" strokeLinecap="round" />
        {[teh, isf].map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={22} fill={i ? C.dim : C.ink} />
            <text x={c.x} y={c.y + 80} textAnchor="middle" fontFamily={FONT.black} fontSize={48} fill={C.ink} style={{ direction: "rtl" }}>{i ? "نزدیک اصفهان" : "تهران"}</text>
          </g>
        ))}
        {fly > 0 && <path d={`M${teh.x} ${teh.y} Q ${(teh.x + isf.x) / 2} ${Math.min(teh.y, isf.y) - 520} ${isf.x} ${isf.y}`} stroke={C.red} strokeWidth={5} strokeDasharray="14 12" fill="none" opacity={0.8} />}
        <Pin x={pinX} y={pinY} s={1.1} color={fly > 0.05 ? C.red : C.lime} />
        <Tag x={560} y={760} text="۳۰۰ کیلومتر اشتباه!" a={prog(T, km - 0.1, km + 0.1)} s={pop(T, km - 0.1)} size={52} fg={C.red} />
      </g>
    </Svg>
  );
};

// ───── 6 · relativity: satellite clocks run fast; 10 km/day if uncorrected ─────
export const S6: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const ein = wd(6, "اینشتین"), fast = wd(6, "تندتر"), day = wd(6, "روزی");
  const e = pop(T, ein - 0.2, 0.45);
  const days = Math.min(7, Math.max(0, Math.floor((T - day + 0.2) * 3.2) + 1));
  return (
    <Svg>
      <Stars T={T} a={0.5} />
      <g transform={`translate(540 280) scale(${e})`} opacity={e > 0 ? 1 : 0}>
        <text textAnchor="middle" y={40} fontFamily="V12Latin" fontSize={150} fill={C.ink} filter="url(#v12glow)">E = mc²</text>
        <text textAnchor="middle" y={120} fontFamily={FONT.bold} fontSize={44} fill={C.dim} style={{ direction: "rtl" }}>نسبیتِ اینشتین</text>
      </g>
      <Clock x={300} y={720} r={150} t={(T - t0) * 3} label="روی زمین" />
      <Clock x={780} y={720} r={150} t={(T - t0) * 3 * (T > fast ? 1.35 : 1)} color={T > fast ? C.lime : C.ink} label="روی ماهواره" />
      <Tag x={780} y={510} text="تندتر! ⏩" a={prog(T, fast - 0.1, fast + 0.1)} s={pop(T, fast - 0.1)} size={44} fg={C.lime} />
      <g opacity={prog(T, day - 0.3, day)}>
        <rect x={110} y={1090} width={860} height={44} rx={22} fill={C.bg2} stroke={C.street} strokeWidth={3} />
        <rect x={110} y={1090} width={860 * (days / 7)} height={44} rx={22} fill={C.red} />
        <text x={540} y={1060} textAnchor="middle" fontFamily={FONT.black} fontSize={50} fill={C.ink} style={{ direction: "rtl" }}>{`روز ${fa(days)} → ${fa(days * 10)} کیلومتر خطا`}</text>
      </g>
    </Svg>
  );
};

export { Svg, clamp };
