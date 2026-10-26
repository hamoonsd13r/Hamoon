// V12 scenes 7–13: urban canyon, Wi-Fi & towers, snap-to-street, nearest ≠ best, graph search, rain pricing, recap.
import React from "react";
import { C, Car, FONT, Pin, Satellite, Tag, Tower, WifiIcon, W, H, easeInOut, easeOut, fa, faNum, hash, lerp, pop, prog, wd } from "./kit";
import { CityMap, DrawLine, EDGES, NODES, along, dijkstra, nodeAt, pathTo, toS } from "./map";
import { Stars, Svg } from "./scenes1";

// ───── 7 · glass towers bounce the signal; the pin lands on a neighbour's roof ─────
const TOWERS = [
  { x: 60, w: 200, h: 780 }, { x: 290, w: 170, h: 560 }, { x: 640, w: 210, h: 860 }, { x: 870, w: 190, h: 470 },
];
export const S7: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const glass = wd(7, "شیشه‌ها"), bounce = wd(7, "کمونه"), roof = wd(7, "پشت‌بوم");
  const ground = 1200;
  const sat = { x: 120, y: 200 }, hit1 = { x: 640, y: 520 }, hit2 = { x: 460, y: 860 }, phone = { x: 560, y: ground - 30 };
  const ray = [sat, hit1, hit2, phone];
  const p = easeInOut(prog(T, glass - 0.4, bounce + 0.5));
  const rise = easeOut(prog(T, t0, t0 + 0.7));
  const rp = pop(T, roof - 0.25, 0.5);
  return (
    <Svg>
      <Stars T={T} a={0.6} />
      <Satellite x={sat.x} y={sat.y} s={0.8} rot={20} />
      {TOWERS.map((b, i) => {
        const h = b.h * rise;
        return (
          <g key={i}>
            <rect x={b.x} y={ground - h} width={b.w} height={h} fill="#0F1C44" stroke={C.street} strokeWidth={3} />
            {Array.from({ length: Math.floor(h / 60) }, (_, r) => Array.from({ length: 3 }, (_, c) => (
              <rect key={`${r}-${c}`} x={b.x + 18 + c * ((b.w - 36) / 3)} y={ground - h + 20 + r * 60} width={(b.w - 36) / 3 - 10} height={36} rx={3}
                fill={hash(i * 50 + r * 3 + c) > 0.6 ? "rgba(255,226,150,0.55)" : "rgba(94,168,255,0.18)"} />
            )))}
          </g>
        );
      })}
      <rect x={0} y={ground} width={W} height={60} fill={C.street} />
      {/* the direct path is blocked */}
      <g opacity={prog(T, t0 + 0.6, t0 + 0.9) * (1 - prog(T, glass, glass + 0.3))}>
        <line x1={sat.x} y1={sat.y} x2={phone.x} y2={phone.y} stroke={C.red} strokeWidth={5} strokeDasharray="14 12" />
      </g>
      <DrawLine pts={ray} p={p} color={C.lime} w={9} glow />
      {[hit1, hit2].map((h, i) => { const at = i ? bounce + 0.1 : glass + 0.1; const q = prog(T, at, at + 0.5); return q > 0 && q < 1 ? <circle key={i} cx={h.x} cy={h.y} r={20 + 60 * q} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - q} /> : null; })}
      <rect x={phone.x - 18} y={phone.y - 30} width={36} height={60} rx={8} fill={C.ink} />
      {T > roof - 0.25 && (
        <g>
          <g transform={`translate(0 ${-(1 - rp) * 120})`}><Pin x={965} y={ground - 470 * rise} s={1.1} color={C.red} /></g>
          <text x={870} y={ground - 470 * rise - 10} fontSize={60}>🐈</text>
          <Tag x={760} y={ground - 470 * rise - 220} text="رو پشت‌بوم؟!" s={rp} size={46} fg={C.red} />
        </g>
      )}
    </Svg>
  );
};

// ───── 8 · Wi-Fi networks + cell towers shrink the accuracy circle ─────
const U8 = { x: 790, y: 960 };
const WIFI = [{ x: 690, y: 900 }, { x: 905, y: 905 }, { x: 670, y: 1030 }, { x: 900, y: 1020, lock: true }, { x: 795, y: 880 }, { x: 760, y: 1040 }];
const TOW = [{ x: 420, y: 700 }, { x: 1200, y: 760 }, { x: 760, y: 1360 }];
export const S8: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const wifi = wd(8, "وای‌فای‌ها"), tower = wd(8, "دکل‌های"), help = wd(8, "کمک"), nb = wd(8, "همسایه"), pass = wd(8, "رمزش");
  const cam = { cx: lerp(790, 800, prog(T, t0, t0 + 6)), cy: 990, z: lerp(1.05, 1.25, prog(T, t0, help)) };
  const acc = lerp(330, 50, easeInOut(prog(T, help - 0.4, nb)));
  const accM = Math.round(lerp(60, 5, easeInOut(prog(T, help - 0.4, nb))));
  const s = (x: number, y: number) => toS(cam, x, y);
  const u = s(U8.x, U8.y);
  return (
    <Svg>
      <CityMap cam={cam} a={0.85} />
      <circle cx={u.x} cy={u.y} r={acc * cam.z} fill="rgba(94,168,255,0.12)" stroke={C.glow} strokeWidth={4} strokeDasharray="12 10" />
      {TOW.map((t, i) => { const q = pop(T, tower + i * 0.15); const p = s(t.x, t.y); return q > 0 ? (
        <g key={i}><line x1={p.x} y1={p.y - 110} x2={u.x} y2={u.y} stroke={C.glow} strokeWidth={3} opacity={0.5} strokeDasharray="8 10" /><g transform={`translate(${p.x} ${p.y}) scale(${q})`}><Tower x={0} y={0} s={0.9} ring={(T * 0.8) % 1} /></g></g>
      ) : null; })}
      {WIFI.map((wf, i) => { const q = pop(T, wifi + i * 0.12); const p = s(wf.x, wf.y); const hi = wf.lock && T > nb - 0.1; return q > 0 ? (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={u.x} y2={u.y} stroke={hi ? C.lime : C.glow} strokeWidth={hi ? 6 : 3} opacity={0.7} />
          <g transform={`translate(${p.x} ${p.y}) scale(${q * (hi ? 1.5 : 1)})`}><circle r={44} fill={C.bg2} stroke={hi ? C.lime : C.glow} strokeWidth={3} /><WifiIcon x={0} y={-4} s={0.62} color={hi ? C.lime : C.glow} lock={wf.lock} /></g>
        </g>
      ) : null; })}
      <Pin x={u.x} y={u.y} s={1.0} pulse={(T * 1.2) % 1} />
      <Tag x={540} y={300} text={`دقت: ±${fa(accM)} متر`} a={prog(T, help - 0.5, help - 0.2)} size={52} fg={C.lime} />
      <Tag x={540} y={1250} text="🔒 رمز لازم نیست!" a={prog(T, pass - 0.1, pass + 0.1)} s={pop(T, pass - 0.1)} size={50} fg={C.lime} />
    </Svg>
  );
};

// ───── 9 · snap the raw fix to the nearest street (nobody waits in the pond) ─────
export const S9: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const snap = wd(9, "می‌چسبونه"), pond = wd(9, "حوض");
  const cam = { cx: 675, cy: lerp(780, 770, prog(T, t0, pond)), z: T > pond - 0.3 ? lerp(1.6, 2.3, easeInOut(prog(T, pond - 0.3, pond + 0.4))) : 1.6 };
  const raw = { x: 675, y: 755 }, road = { x: 675, y: 840 };
  const k = easeOut(prog(T, snap - 0.05, snap + 0.35));
  const wob = (1 - k) * Math.sin(T * 9) * 6;
  const p = toS(cam, lerp(raw.x, road.x, k) + wob, lerp(raw.y, road.y, k));
  const r0 = toS(cam, raw.x, raw.y);
  const ghost = prog(T, pond - 0.2, pond + 0.1);
  return (
    <Svg>
      <CityMap cam={cam} />
      {[0, 0.33, 0.66].map((o) => { const q = (T * 0.7 + o) % 1; return <ellipse key={o} cx={r0.x} cy={r0.y} rx={(20 + q * 60) * cam.z} ry={(12 + q * 36) * cam.z} fill="none" stroke="#7FB2FF" strokeWidth={3} opacity={(1 - q) * 0.7} />; })}
      {k > 0 && k < 1 && <line x1={r0.x} y1={r0.y} x2={p.x} y2={p.y} stroke={C.lime} strokeWidth={6} strokeDasharray="10 8" />}
      {T > snap && (() => { const a = toS(cam, 560, 840), b = toS(cam, 790, 840); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.lime} strokeWidth={26 * cam.z * 0.6} opacity={0.35 * prog(T, snap, snap + 0.3)} />; })()}
      {ghost > 0 && (
        <g opacity={ghost}>
          <text x={r0.x - 40} y={r0.y + 20} fontSize={110} opacity={0.6}>🧍</text>
          <text x={r0.x + 70} y={r0.y + 40} fontSize={70}>🦆</text>
          <g transform={`translate(${r0.x} ${r0.y - 40}) scale(${pop(T, pond)})`}><path d="M-60 -60 L60 60 M60 -60 L-60 60" stroke={C.red} strokeWidth={16} strokeLinecap="round" /></g>
        </g>
      )}
      <Pin x={p.x} y={p.y} s={1.15} />
      <Tag x={540} y={300} text={T < snap ? "موقعیتِ خام GPS" : "چسبید به خیابون ✓"} size={50} fg={T < snap ? C.ink : C.lime} s={T < snap ? 1 : pop(T, snap)} />
    </Svg>
  );
};

// ───── 10 · the nearest driver is across the highway; the best one is on your side ─────
const U10 = nodeAt(1020, 840);
const A10 = { x: 1020, y: 1320 }, B10 = { x: 560, y: 600 };
export const S10: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const near = wd(10, "نزدیک‌ترین"), best = wd(10, "بهترین"), hwy = wd(10, "بزرگراه");
  const cam = { cx: 790, cy: 1000, z: 0.82 };
  const s = (q: { x: number; y: number }) => toS(cam, q.x, q.y);
  const routeA = [A10, { x: 330, y: 1320 }, { x: 330, y: 840 }, { x: 1020, y: 840 }].map(s);
  const routeB = [B10, { x: 790, y: 600 }, { x: 790, y: 840 }, { x: 1020, y: 840 }].map(s);
  const u = s(U10), a = s(A10);
  const pA = easeInOut(prog(T, best - 0.2, best + 1.6));
  const pB = easeInOut(prog(T, hwy + 0.4, hwy + 1.4));
  const bCar = along(routeB, pB * 0.25);
  return (
    <Svg>
      <CityMap cam={cam} hwyGlow={prog(T, hwy - 0.2, hwy + 0.2)} />
      <Tag x={s({ x: 1250, y: 1080 }).x} y={s({ x: 1250, y: 1080 }).y - 70} text="بزرگراه" a={prog(T, hwy - 0.2, hwy)} size={40} fg={C.red} />
      {T > near - 0.1 && T < best + 0.4 && <line x1={a.x} y1={a.y} x2={u.x} y2={u.y} stroke={C.ink} strokeWidth={5} strokeDasharray="12 10" />}
      <Tag x={a.x - 170} y={(a.y + u.y) / 2} text="۴۸۰ متر" a={prog(T, near, near + 0.2) * (1 - prog(T, best + 0.2, best + 0.4))} size={40} />
      {pA > 0 && <DrawLine pts={routeA} p={pA} color={C.red} w={11} />}
      {pA > 0.98 && <Tag x={s({ x: 330, y: 1320 }).x + 190} y={s({ x: 330, y: 1320 }).y + 80} text="۱۲ دقیقه ✗" size={44} fg={C.red} s={pop(T, best + 1.6)} />}
      {pB > 0 && <DrawLine pts={routeB} p={pB} color={C.lime} w={13} glow />}
      {pB > 0.95 && <Tag x={s(B10).x} y={s(B10).y - 90} text="۳ دقیقه ✓" size={48} fg={C.lime} s={pop(T, hwy + 1.4)} />}
      <g transform={`scale(1)`}>
        <Car x={a.x} y={a.y} rot={-90} s={0.9} color={T > near - 0.1 ? C.ink : C.dim} />
        <Car x={bCar.x} y={bCar.y} rot={bCar.ang} s={0.9} color={T > hwy + 0.4 ? C.lime : C.dim} />
      </g>
      {T > near - 0.1 && T < near + 0.6 && <circle cx={a.x} cy={a.y} r={50 + 60 * prog(T, near - 0.1, near + 0.6)} fill="none" stroke={C.ink} strokeWidth={5} opacity={1 - prog(T, near - 0.1, near + 0.6)} />}
      <Pin x={u.x} y={u.y} s={1.0} pulse={(T * 1.2) % 1} />
    </Svg>
  );
};

// ───── 11 · the city becomes a graph; the algorithm explores, the fastest path lights up ─────
const SRC11 = nodeAt(100, 1800).id, DST11 = nodeAt(1250, 360).id;
const DJ11 = dijkstra(SRC11);
const PATH11 = pathTo(DJ11.prev, DST11);
const MAXD11 = Math.max(...DJ11.dist.filter((d) => d < Infinity));
export const S11: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const net = wd(11, "شبکه"), algo = wd(11, "الگوریتم"), fastest = wd(11, "سریع‌ترین");
  const cam = { cx: 790, cy: 960, z: 0.62 };
  const s = (n: { x: number; y: number }) => toS(cam, n.x, n.y);
  const morph = easeInOut(prog(T, net - 0.3, net + 0.6));
  const wave = MAXD11 * easeInOut(prog(T, algo - 0.1, fastest - 0.2)) * 1.05;
  const cnt = 1200000 * easeOut(prog(T, algo - 0.1, fastest));
  const ms = 4 * prog(T, algo - 0.1, fastest);
  const pp = easeInOut(prog(T, fastest - 0.15, fastest + 0.6));
  return (
    <Svg>
      <CityMap cam={cam} blocksA={1 - morph} streetA={1 - morph * 0.85} />
      <g opacity={morph}>
        {EDGES.map(([a, b], i) => {
          const na = s(NODES[a]), nb = s(NODES[b]);
          const lit = Math.max(DJ11.dist[a], DJ11.dist[b]) < wave;
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={lit ? C.glow : "#2A3E7A"} strokeWidth={lit ? 5 : 3} opacity={lit ? 0.95 : 0.7} />;
        })}
        {NODES.map((n) => { const p = s(n); const lit = DJ11.dist[n.id] < wave; return <circle key={n.id} cx={p.x} cy={p.y} r={lit ? 10 : 7} fill={lit ? C.ink : "#3A5299"} />; })}
      </g>
      {pp > 0 && <DrawLine pts={PATH11.map((id) => s(NODES[id]))} p={pp} color={C.lime} w={14} glow />}
      <Car x={s(NODES[SRC11]).x} y={s(NODES[SRC11]).y} s={0.75} rot={-90} color={C.lime} lights={0} />
      <Pin x={s(NODES[DST11]).x} y={s(NODES[DST11]).y} s={0.9} />
      <g opacity={prog(T, algo - 0.2, algo + 0.1)}>
        <rect x={140} y={1110} width={800} height={150} rx={30} fill="rgba(10,18,45,0.92)" stroke={C.street} strokeWidth={3} />
        <text x={540} y={1172} textAnchor="middle" fontFamily={FONT.black} fontSize={48} fill={C.ink} style={{ direction: "rtl" }}>{`مسیرهای بررسی‌شده: ${faNum(cnt)}`}</text>
        <text x={540} y={1236} textAnchor="middle" fontFamily={FONT.bold} fontSize={42} fill={C.lime} style={{ direction: "rtl" }}>{`زمان: ${faNum(ms, 1)} میلی‌ثانیه`}</text>
      </g>
    </Svg>
  );
};

// ───── 12 · rain → demand spikes → price multiplier → more drivers come ─────
export const S12: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const rain = wd(12, "بارون"), req = wd(12, "درخواست"), price = wd(12, "قیمت"), more = wd(12, "راننده‌های");
  const cam = { cx: 790, cy: 960, z: 0.55 };
  const mult = lerp(1, 1.8, easeInOut(prog(T, price - 0.1, price + 1.0)));
  const rainA = prog(T, rain - 0.3, rain + 0.2);
  const pins = Array.from({ length: 26 }, (_, i) => ({ x: 120 + hash(i) * 1380, y: 400 + hash(i + 40) * 1150, t: req - 0.3 + hash(i + 90) * 0.9 }));
  return (
    <Svg>
      <CityMap cam={cam} a={0.8} />
      {pins.map((p, i) => { const q = pop(T, p.t, 0.3); const sp = toS(cam, p.x, p.y); return q > 0 ? <g key={i} transform={`translate(${sp.x} ${sp.y}) scale(${q * 0.55})`}><Pin x={0} y={0} pulse={((T + i * 0.3) % 1.2) / 1.2} /></g> : null; })}
      {Array.from({ length: 14 }, (_, i) => {
        const q = easeInOut(prog(T, more - 0.2 + (i % 7) * 0.12, more + 1.6 + (i % 7) * 0.12));
        const side = i % 4, from = side === 0 ? { x: -60, y: 300 + i * 90 } : side === 1 ? { x: W + 60, y: 300 + i * 80 } : side === 2 ? { x: 120 + i * 60, y: -60 } : { x: 100 + i * 70, y: 1340 };
        const to = { x: 540 + (hash(i) - 0.5) * 420, y: 720 + (hash(i + 5) - 0.5) * 420 };
        if (q <= 0) return null;
        const ang = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
        return <Car key={i} x={lerp(from.x, to.x, q)} y={lerp(from.y, to.y, q)} rot={ang} s={0.7} color={C.ink} lights={0.6} />;
      })}
      <g opacity={rainA}>
        {Array.from({ length: 120 }, (_, i) => { const y = ((hash(i) * H + T * 1500) % (H + 200)) - 100; const x = hash(i + 7) * W; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke="#9CC2FF" strokeWidth={3} opacity={0.5} />; })}
      </g>
      <text x={540} y={330} textAnchor="middle" fontSize={120} opacity={rainA}>🌧️</text>
      <g transform={`translate(540 1180) scale(${pop(T, price - 0.2)})`} opacity={prog(T, price - 0.2, price)}>
        <rect x={-330} y={-80} width={660} height={150} rx={36} fill="rgba(10,18,45,0.94)" stroke={mult > 1.4 ? C.red : C.street} strokeWidth={5} />
        <text x={0} y={22} textAnchor="middle" fontFamily={FONT.black} fontSize={64} fill={C.ink} style={{ direction: "rtl" }}>{`ضریب قیمت ×${faNum(mult, 1)}`}</text>
      </g>
    </Svg>
  );
};

// ───── 13 · recap: the car brakes at your pin; satellites + Einstein + neighbour's Wi-Fi ─────
export const S13: React.FC<{ T: number; t0: number }> = ({ T, t0 }) => {
  const brake = wd(13, "ترمز"), sats = wd(13, "سی"), ein = wd(13, "اینشتین"), wifi = wd(13, "وای‌فای"), hand = wd(13, "دست");
  const cam = { cx: 790, cy: 840, z: 1.15, sy: 1020 };
  const route = [{ x: 100, y: 840 }, { x: 760, y: 840 }];
  const k = easeOut(prog(T, t0, brake + 0.25));
  const car = toS(cam, lerp(route[0].x, route[1].x, k), 840);
  const pin = toS(cam, 790, 840);
  const skid = prog(T, brake - 0.25, brake + 0.25);
  const cards = [
    { t: sats, x: 230, y: 470, el: <g><Satellite x={0} y={-10} s={0.62} /></g>, txt: "۳۰ ماهواره" },
    { t: ein, x: 540, y: 330, el: <text y={12} textAnchor="middle" fontFamily="V12Latin" fontSize={52} fill={C.ink}>E=mc²</text>, txt: "آقای اینشتین" },
    { t: wifi, x: 850, y: 470, el: <WifiIcon x={0} y={0} s={0.8} lock />, txt: "وای‌فای همسایه" },
  ];
  const link = easeInOut(prog(T, hand - 0.2, hand + 0.6));
  return (
    <Svg>
      <CityMap cam={cam} />
      {skid > 0 && [-10, 10].map((o) => <line key={o} x1={car.x - 160 * skid} y1={car.y + o} x2={car.x - 30} y2={car.y + o} stroke="#000" strokeWidth={7} opacity={0.6} />)}
      <Pin x={pin.x} y={pin.y} s={1.1} pulse={(T * 1.2) % 1} />
      <Car x={car.x} y={car.y} s={1.3} color={C.lime} rot={T > brake && T < brake + 0.3 ? -4 * Math.sin((T - brake) * 30) : 0} />
      {cards.map((c, i) => {
        const q = pop(T, c.t - 0.2, 0.4);
        if (q <= 0) return null;
        return (
          <g key={i}>
            {link > 0 && <DrawLine pts={[{ x: c.x, y: c.y + 90 }, { x: car.x, y: car.y - 40 }]} p={link} color={C.lime} w={5} glow />}
            <g transform={`translate(${c.x} ${c.y}) scale(${q})`}>
              <rect x={-140} y={-110} width={280} height={210} rx={34} fill="rgba(10,18,45,0.94)" stroke={link > 0.9 ? C.lime : C.streetHi} strokeWidth={4} />
              {c.el}
              <text y={78} textAnchor="middle" fontFamily={FONT.black} fontSize={38} fill={C.ink} style={{ direction: "rtl" }}>{c.txt}</text>
            </g>
          </g>
        );
      })}
    </Svg>
  );
};
export { Stars };
