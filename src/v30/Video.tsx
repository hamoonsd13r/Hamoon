// V30 · «شهردار یه‌روزه» — reel 1080×1920. 2.5D isometric city (code only), sage/green family like the pixel_abad reference:
// top: right-aligned white title + small lime sub; bottom: word captions in a deep-green box with lime highlight; green labels pinned to the world.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import iranJson from "./iran.json";
import { C, Cam, FONT, FPS, H, W, clamp, easeInOut, easeOut, fa, hash, lerp, pop, prog, segEnd, segStart, toScreen, wd, wdEnd, words } from "./kit";
import { City, CityState } from "./iso";

const END0 = segEnd(9) + 0.3;
const TOTAL = END0 + 1.9;
export const V30_FRAMES = Math.round(TOTAL * FPS);

const fontHandle = typeof document !== "undefined" ? delayRender("v30 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V30Black", "fonts/Vazirmatn-Black.ttf"], ["V30Bold", "fonts/Vazirmatn-Bold.ttf"], ["V30Semi", "fonts/Vazirmatn-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

// ───────── world state over time ─────────
const tBus = () => wd(3, "برقی");
const cityState = (T: number, o: Partial<CityState> = {}): CityState => {
  const park = easeInOut(prog(T, wd(4, "پارک") - 0.25, wd(4, "فوتبال") + 0.2));
  return {
    T,
    carFade: easeOut(prog(T, wd(3, "نصف") - 0.15, wd(3, "نصف") + 0.7)),
    flow: lerp(0.16, 1.3, prog(T, wd(3, "ترافیک") - 0.2, wd(3, "ترافیک") + 1)),
    laneDraw: easeInOut(prog(T, wd(3, "خط") - 0.1, tBus() + 0.35)),
    busX: T < tBus() - 0.2 ? null : -7 + ((T - tBus() + 0.2) * 2.6) % 40,
    stops: prog(T, tBus(), tBus() + 0.9),
    park,
    civic: T >= CUT[8] ? "clinic" : "none",
    civicS: pop(T, CUT[8] + 0.35, 0.5),
    people: 0.35 + 0.65 * prog(T, wd(4, "درخت"), wd(4, "درخت") + 1),
    ...o,
  };
};
const smogAt = (T: number) => 1 - 0.55 * easeOut(prog(T, wd(3, "نصف") - 0.2, wd(3, "نصف") + 1)) - 0.3 * easeOut(prog(T, wd(4, "پارک"), wd(4, "فوتبال") + 0.5));
const coinsAt = (T: number) => (T < wd(3, "سی") ? 100 : T < wd(4, "بیست") ? 70 : T < wd(7, "ده") ? 50 : 10);

// ───────── shared pieces ─────────
const Smog: React.FC<{ T: number; k?: number }> = ({ T, k = 1 }) => {
  const s = smogAt(T) * k;
  if (s < 0.02) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(105,100,90,${0.2 * s})` }} />
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((hash(i) * 1400 + T * (18 + i * 5)) % 1500) - 210, y = 300 + hash(i + 4) * 1100, r = 260 + hash(i + 8) * 200;
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(120,114,102,${0.42 * s}) 0%, rgba(120,114,102,0) 70%)` }} />;
      })}
    </AbsoluteFill>
  );
};

const CityLayer: React.FC<{ T: number; cam: Cam; st?: Partial<CityState>; blur?: number }> = ({ T, cam, st, blur = 0 }) => (
  <AbsoluteFill style={{ background: C.ground, filter: blur ? `blur(${blur}px)` : undefined }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><City cam={cam} st={cityState(T, st)} /></svg>
  </AbsoluteFill>
);

/** green label pinned to a world point (ref: @sirvan / برج آزادی) */
const Label: React.FC<{ cam: Cam; x: number; y: number; z?: number; text: React.ReactNode; T: number; t0: number; size?: number; dark?: boolean }> = ({ cam, x, y, z = 0, text, T, t0, size = 42, dark }) => {
  const p = pop(T, t0, 0.4);
  if (p <= 0) return null;
  const [sx0, sy] = toScreen(cam, x, y, z);
  const sx = clamp(sx0, 190, W - 190);
  const bob = Math.sin((T - t0) * 2.4) * 4;
  return (
    <div style={{ position: "absolute", left: sx, top: sy + bob, transform: `translate(-50%, -100%) scale(${p})`, transformOrigin: "50% 100%" }}>
      <div style={{ direction: "rtl", whiteSpace: "nowrap", padding: "8px 30px 14px", borderRadius: 16, background: dark ? C.deep : C.roofD, border: `4px solid ${dark ? C.lime : "#E9F5E0"}`,
        fontFamily: FONT.black, fontSize: size, color: "#fff", boxShadow: "0 10px 26px rgba(20,50,30,0.35)" }}>{text}</div>
      <div style={{ width: 4, height: 34, background: "#E9F5E0", margin: "0 auto", opacity: 0.9 }} />
    </div>
  );
};

/** right-aligned headline + small lime sub (ref top text) */
const Title: React.FC<{ T: number; t0: number; sub: string; lines: React.ReactNode[]; dark?: boolean }> = ({ T, t0, sub, lines, dark }) => {
  const a = easeOut(prog(T, t0, t0 + 0.35));
  return (
    <div style={{ position: "absolute", right: 70, top: 168, direction: "rtl", textAlign: "right" }}>
      <div style={{ display: "inline-block", padding: "2px 18px 8px", borderRadius: 12, background: "rgba(28,58,42,0.82)", fontFamily: FONT.bold, fontSize: 32, color: dark ? "#fff" : C.lime, opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>{sub}</div>
      {lines.map((l, i) => {
        const b = easeOut(prog(T, t0 + 0.06 + i * 0.08, t0 + 0.42 + i * 0.08));
        return (
          <div key={i} style={{ fontFamily: FONT.black, fontSize: 84, lineHeight: 1.3, color: "#fff", opacity: b, transform: `translateX(${(1 - b) * -60}px)`,
            textShadow: "0 4px 18px rgba(25,55,35,0.55), 0 2px 0 rgba(25,55,35,0.35)" }}>{l}</div>
        );
      })}
    </div>
  );
};

const Coin: React.FC<{ s?: number }> = ({ s = 56 }) => (
  <svg width={s} height={s} viewBox="0 0 56 56">
    <circle cx={28} cy={30} r={25} fill={C.coinD} />
    <circle cx={28} cy={27} r={25} fill={C.coin} />
    <circle cx={28} cy={27} r={18} fill="none" stroke={C.coinL} strokeWidth={3} />
    <path d="M20 27 L28 17 L36 27 L28 37 Z" fill={C.coinL} />
  </svg>
);

const TopBar: React.FC<{ T: number; dark?: boolean }> = ({ dark }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 70, display: "flex", justifyContent: "space-between", alignItems: "center", direction: "ltr" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "rtl" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: C.deep, display: "flex", alignItems: "center", justifyContent: "center" }}><Coin s={34} /></div>
      <span style={{ fontFamily: FONT.black, fontSize: 30, color: dark ? C.deep : "#fff", textShadow: dark ? "none" : "0 2px 8px rgba(20,50,30,0.5)" }}>شهردار یه‌روزه</span>
    </div>
    <span style={{ fontFamily: FONT.bold, fontSize: 28, color: dark ? C.deep2 : "#fff", opacity: 0.92, textShadow: dark ? "none" : "0 2px 8px rgba(20,50,30,0.5)" }}>قسمت ۱</span>
  </div>
);

/** budget pill (top-left) with floating −N */
const CoinPill: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT[2] || T > CUT[9]) return null;
  const a = easeOut(prog(T, CUT[2], CUT[2] + 0.3));
  const v = coinsAt(T);
  const hits: [number, string][] = [[wd(3, "سی"), "−۳۰"], [wd(4, "بیست"), "−۲۰"], [wd(7, "ده"), "−۴۰"]];
  const low = v <= 10;
  const pulse = hits.reduce((m, [t]) => Math.max(m, 1 - prog(T, t, t + 0.35)) * (T >= t ? 1 : 0) || m, 0);
  return (
    <div style={{ position: "absolute", left: 60, top: 168, opacity: a, transform: `scale(${1 + 0.18 * pulse})`, transformOrigin: "0 50%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 26px 8px 12px", borderRadius: 999, background: C.deep, border: `4px solid ${low ? C.red : C.coin}`, direction: "ltr" }}>
        <Coin s={58} />
        <span style={{ fontFamily: FONT.black, fontSize: 58, color: low ? "#FFB4AC" : C.coinL, minWidth: 92, textAlign: "center" }}>{fa(v)}</span>
      </div>
      {hits.map(([t, s]) => {
        const q = prog(T, t, t + 1.1);
        if (q <= 0 || q >= 1) return null;
        return <div key={s} style={{ position: "absolute", left: 92, top: 96 + q * 70, fontFamily: FONT.black, fontSize: 56, color: C.red, opacity: 1 - easeInOut(q), textShadow: "0 3px 10px rgba(0,0,0,0.25)" }}>{s}</div>;
      })}
    </div>
  );
};

// ───────── captions (word by word) ─────────
type Chunk = { ws: typeof words };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (let si = 0; si <= 9; si++) {
    const ws = words.filter((w) => w.si === si);
    let cur: typeof words = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 6 || len > 26 || /[؟!…؛:.]$/.test(w.w) || (/،$/.test(w.w) && cur.length >= 3) || i === ws.length - 1) { out.push({ ws: cur }); cur = []; }
    });
  }
  // never leave a lonely last word: merge it back into the previous chunk of the same line
  for (let k = out.length - 1; k > 0; k--) {
    const c = out[k], p = out[k - 1];
    if (c.ws.length === 1 && p.ws[0].si === c.ws[0].si && [...p.ws, ...c.ws].map((x) => x.w).join(" ").length <= 36) { p.ws.push(...c.ws); out.splice(k, 1); }
  }
  return out;
})();
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const i = CHUNKS.findIndex((c, k) => T >= c.ws[0].s - 0.06 && (k === CHUNKS.length - 1 || T < CHUNKS[k + 1].ws[0].s - 0.06));
  const c = CHUNKS[i];
  if (!c || T > c.ws[c.ws.length - 1].e + 0.45) return null;
  const a = easeOut(prog(T, c.ws[0].s - 0.06, c.ws[0].s + 0.1));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
      <div style={{ maxWidth: 900, padding: "14px 34px 22px", borderRadius: 26, background: "rgba(28,58,42,0.94)", direction: "rtl", textAlign: "center",
        fontFamily: FONT.black, fontSize: 52, lineHeight: 1.6, color: "#fff", boxShadow: "0 12px 30px rgba(20,45,30,0.35)" }}>
        {c.ws.map((w, j) => {
          const on = T >= w.s - 0.03 && T < w.e + 0.08;
          return (
            <React.Fragment key={j}>
              <span style={{ padding: "0 8px 4px", borderRadius: 10, background: on ? C.lime : "transparent", color: on ? C.deep : "#fff" }}>{w.w}</span>
              {j < c.ws.length - 1 ? " " : ""}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ───────── Iran map ─────────
const IRAN = iranJson as [number, number][];
const COSL = Math.cos((32.4 * Math.PI) / 180);
const MK = 860 / ((63.4 - 44) * COSL);
const mapXY = (lon: number, lat: number, ox = 110, oy = 470): [number, number] => [ox + (lon - 44) * COSL * MK, oy + (39.8 - lat) * MK];
const IRAN_D = IRAN.map(([lo, la], i) => { const [x, y] = mapXY(lo, la, 0, 0); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ") + "Z";
const CITIES: [string, number, number, string][] = [
  ["تهران", 51.39, 35.69, "🏥"], ["مشهد", 59.6, 36.3, "📚"], ["اصفهان", 51.67, 32.65, "🌳"], ["شیراز", 52.53, 29.59, "☕"], ["تبریز", 46.29, 38.08, "🚌"],
  ["رشت", 49.58, 37.28, "🌳"], ["اهواز", 48.67, 31.32, "🏥"], ["کرمان", 57.08, 30.28, "📚"], ["یزد", 54.37, 31.9, "☕"], ["کرمانشاه", 47.07, 34.31, "🚌"],
  ["بندرعباس", 56.27, 27.18, "🌳"], ["زاهدان", 60.86, 29.5, "🏥"], ["همدان", 48.51, 34.8, "📚"], ["ارومیه", 45.07, 37.55, "☕"], ["ساری", 53.06, 36.56, "🌳"],
  ["گرگان", 54.43, 36.84, "🚌"], ["قم", 50.88, 34.64, "📚"], ["بوشهر", 50.84, 28.97, "☕"], ["خرم‌آباد", 48.35, 33.49, "🏥"], ["بیرجند", 59.22, 32.87, "🌳"],
  ["سنندج", 47, 35.31, "📚"], ["زنجان", 48.48, 36.67, "☕"], ["اردبیل", 48.29, 38.25, "🌳"], ["یاسوج", 51.59, 30.67, "🚌"], ["شهرکرد", 50.86, 32.33, "🏥"],
];
const IranMap: React.FC<{ T: number; t0: number; pins: "one" | "all"; zoom?: number }> = ({ T, t0, pins, zoom = 0 }) => {
  const [tx, ty] = mapXY(51.39, 35.69);
  const s = 1 + zoom * 5;
  const drift = 1 + (T - t0) * 0.006;
  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${s * drift}) translate(${-tx}px, ${-ty}px)` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <pattern id="relief" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.4" fill="#A9AE72" opacity="0.55" />
            <circle cx="8" cy="7" r="1" fill="#E3E6B8" opacity="0.6" />
          </pattern>
        </defs>
        <g transform="translate(110 470)">
          <path d={IRAN_D} fill="#7E9467" transform="translate(0 16)" />
          <path d={IRAN_D} fill="#CBD08E" />
          <path d={IRAN_D} fill="url(#relief)" />
          <path d={IRAN_D} fill="none" stroke="#EEF0C8" strokeWidth={3} opacity={0.8} />
        </g>
        {CITIES.map(([n, lo, la], i) => {
          const [x, y] = mapXY(lo, la);
          const p = pop(T, t0 + 0.1 + i * 0.05, 0.3);
          return <circle key={n} cx={x} cy={y} r={7 * p} fill={C.deep2} opacity={0.75} />;
        })}
      </svg>
      {pins === "all" && CITIES.map(([n, lo, la, ic], i) => {
        const [x, y] = mapXY(lo, la);
        const p = pop(T, wd(9, "صد") + i * 0.09, 0.35);
        if (p <= 0) return null;
        return (
          <div key={n} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) scale(${p * 0.9})`, transformOrigin: "50% 100%" }}>
            <div style={{ width: 62, height: 62, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: i % 3 ? C.roofD : C.deep, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ transform: "rotate(45deg)", fontSize: 30 }}>{ic}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────── scenes ─────────
type SP = { T: number; t0: number };
const BG: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 60%, ${C.bgD} 100%)` }} />;

// 0 · map → pin on «your city»
const S0: React.FC<SP> = ({ T, t0 }) => {
  const tCity = wd(0, "شهر");
  const tMayor = wd(0, "شهردار");
  const [px, py] = mapXY(51.39, 35.69);
  const drop = easeOut(prog(T, tCity - 0.1, tCity + 0.3));
  const zoom = easeInOut(prog(T, CUT[1] - 0.45, CUT[1] + 0.1));
  const badge = pop(T, tMayor, 0.45);
  return (
    <AbsoluteFill>
      <BG />
      <IranMap T={T} t0={t0} pins="one" zoom={zoom} />
      {/* pulse rings + pin */}
      <div style={{ position: "absolute", left: px, top: py, transform: `scale(${1 + zoom * 4})`, transformOrigin: "0 0" }}>
        {drop > 0 && [0, 1].map((k) => {
          const q = ((T - tCity + k * 0.6) % 1.2) / 1.2;
          return <div key={k} style={{ position: "absolute", left: -60 * q, top: -60 * q * 0.6, width: 120 * q, height: 72 * q, borderRadius: "50%", border: `4px solid ${C.deep}`, opacity: (1 - q) * 0.8 }} />;
        })}
        {drop > 0 && (
          <div style={{ position: "absolute", left: -32, top: -78 - (1 - drop) * 260, opacity: clamp(drop * 3) }}>
            <div style={{ width: 64, height: 64, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: C.deep, border: "5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: C.lime }} />
            </div>
          </div>
        )}
      </div>
      {badge > 0 && zoom < 0.3 && (
        <div style={{ position: "absolute", left: px + 50, top: py - 150, transform: `scale(${badge})`, transformOrigin: "0 100%", opacity: 1 - zoom * 3 }}>
          <div style={{ direction: "rtl", padding: "10px 30px 16px", borderRadius: 18, background: C.roofD, border: "4px solid #E9F5E0", fontFamily: FONT.black, fontSize: 44, color: "#fff", whiteSpace: "nowrap" }}>
            🏛️ شهردار: <span style={{ color: C.lime }}>تو</span>
          </div>
        </div>
      )}
      <Title T={T} t0={t0} sub="فقط برای یه روز" lines={["شهردارِ", "شهر خودت"]} />
    </AbsoluteFill>
  );
};

// 1 · budget: 100 coins
const S1: React.FC<SP> = ({ T, t0 }) => {
  const cam: Cam = { x: 9, y: 9, z: 0.72 + (T - t0) * 0.01, cy: 900 };
  const tC = wd(1, "صد");
  const n = Math.round(100 * easeOut(prog(T, tC - 0.1, tC + 0.7)));
  const card = pop(T, t0 + 0.15, 0.45);
  const lock = pop(T, wd(1, "نه"), 0.4);
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} blur={7} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.28)" }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 560, transform: `scale(${card})`, transformOrigin: "50% 50%" }}>
        <div style={{ borderRadius: 40, background: "#FBFBF6", padding: "40px 40px 46px", boxShadow: "0 30px 60px rgba(20,45,30,0.35)", direction: "rtl", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.bold, fontSize: 36, color: C.deep2 }}>بودجه‌ی امروزت</div>
          <div style={{ position: "relative", height: 230, margin: "10px 0" }}>
            {Array.from({ length: 9 }, (_, i) => {
              const q = pop(T, tC - 0.15 + i * 0.06, 0.3);
              const col = i % 3, row = Math.floor(i / 3);
              return <div key={i} style={{ position: "absolute", left: 250 + (col - 1) * 120 + (row % 2) * 30, top: 150 - row * 34 - (1 - q) * 160, opacity: clamp(q * 2) }}><Coin s={110} /></div>;
            })}
          </div>
          <div style={{ fontFamily: FONT.black, fontSize: 150, lineHeight: 1.1, color: C.deep }}>{fa(n)}</div>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.roofD }}>سکه</div>
        </div>
        {lock > 0 && (
          <div style={{ position: "absolute", left: -20, top: -40, transform: `rotate(-10deg) scale(${lock})`, padding: "8px 26px 14px", borderRadius: 16, background: C.red, color: "#fff", fontFamily: FONT.black, fontSize: 40, direction: "rtl" }}>
            نه یکی بیشتر 🔒
          </div>
        )}
      </div>
      <Title T={T} t0={t0} sub="قانون بازی" lines={["فقط یه شرط"]} />
    </AbsoluteFill>
  );
};

// 2 · the neighbourhood: jammed, smoggy, nowhere to play
const S2: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, t0 + 1.2));
  const cam: Cam = { x: 10.5 - k * 0.6, y: 7.5 + k * 0.3, z: 0.74 + (T - t0) * 0.012, cy: 880 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} />
      <Smog T={T} />
      <Label cam={cam} x={4} y={9} z={0.4} T={T} t0={wd(2, "قفله") - 0.05} text={<>🚗 ترافیک: <span style={{ color: C.lime }}>قفل</span></>} />
      <Label cam={cam} x={4.5} y={4} z={1.6} T={T} t0={wd(2, "دوده") - 0.05} text={<>🌫️ هوا: <span style={{ color: "#FFC2BA" }}>آلوده</span></>} dark />
      <Label cam={cam} x={14} y={4} z={0.2} T={T} t0={wd(2, "بچه‌ها") - 0.05} text={<>⚽ زمین خالی</>} />
      <Title T={T} t0={t0} sub="ساعت ۸ صبح" lines={["محله‌ی شما"]} />
    </AbsoluteFill>
  );
};

// 3 · electric bus line (−30)
const S3: React.FC<SP> = ({ T, t0 }) => {
  const k = easeInOut(prog(T, t0, CUT[4]));
  const st = cityState(T);
  const bx = lerp(3, 9.5, k);
  const cam: Cam = { x: st.busX !== null ? lerp(bx, Math.min(st.busX + 1.5, 13), easeOut(prog(T, tBus() - 0.2, tBus() + 0.8))) : bx, y: lerp(10, 8.6, k), z: 1.0 + k * 0.08, cy: 900 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} />
      <Smog T={T} k={0.8} />
      {st.busX !== null && <Label cam={cam} x={st.busX} y={8.5} z={0.9} T={T} t0={tBus() + 0.15} size={38} text={<>🚌 خط برقی</>} dark />}
      <Label cam={cam} x={9.5} y={11.5} z={0.4} T={T} t0={wd(3, "نصف")} text={<>ترافیک: <span style={{ color: C.lime }}>نصف</span></>} />
      <Title T={T} t0={t0} sub="تصمیم اول" lines={["اتوبوس برقی"]} />
    </AbsoluteFill>
  );
};

// 4 · empty lot → park (−20)
const S4: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[5]));
  const cam: Cam = { x: 14.6 - k * 0.5, y: 4.6 - k * 0.3, z: 1.0 + k * 0.12, cy: 930 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} />
      <Smog T={T} k={0.7} />
      <Label cam={cam} x={14} y={1.1} z={0.3} T={T} t0={wd(4, "درخت")} text={<>🌳 پارک محله</>} />
      <Title T={T} t0={t0} sub="تصمیم دوم" lines={["زمین خالی؟", "پارک!"]} />
    </AbsoluteFill>
  );
};

// 5 · 50 left, everyone wants something
const S5: React.FC<SP> = ({ T, t0 }) => {
  const k = easeInOut(prog(T, t0, t0 + 1.4));
  const cam: Cam = { x: 9, y: 9, z: lerp(0.95, 0.66, k), cy: 920 };
  const tA = wd(5, "همه");
  const bubbles: [number, number, number, string][] = [[5.3, 5.3, 1.6, "📚 کتابخونه"], [12.3, 12.3, 2.8, "🏥 درمانگاه"], [1.8, 1.9, 1.6, "☕ کافه"], [-2, 5.3, 1.6, "🏀 سالن ورزش"], [16, 16, 2.8, "🅿️ پارکینگ"]];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} />
      <Smog T={T} k={0.6} />
      {bubbles.map(([x, y, z, t], i) => {
        const p = pop(T, tA - 0.1 + i * 0.12, 0.35);
        if (p <= 0) return null;
        const [sx, sy] = toScreen(cam, x, y, z);
        return (
          <div key={i} style={{ position: "absolute", left: sx, top: sy + Math.sin(T * 3 + i) * 5, transform: `translate(-50%, -100%) scale(${p})`, transformOrigin: "50% 100%" }}>
            <div style={{ direction: "rtl", whiteSpace: "nowrap", padding: "8px 24px 12px", borderRadius: 22, background: "#fff", fontFamily: FONT.black, fontSize: 36, color: C.deep, boxShadow: "0 8px 20px rgba(20,45,30,0.3)" }}>{t}؟</div>
            <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "18px solid #fff" }} />
          </div>
        );
      })}
      <Title T={T} t0={t0} sub="۵۰ سکه مونده" lines={["همه یه چیزی", "می‌خوان"]} />
    </AbsoluteFill>
  );
};

// 6 · quick cuts: library? clinic? cafe?
const S6: React.FC<SP> = ({ T }) => {
  const ts = [CUT[6], wd(6, "درمانگاه") - 0.08, wd(6, "کافه") - 0.08];
  const i = T < ts[1] ? 0 : T < ts[2] ? 1 : 2;
  const kinds: CityState["civic"][] = ["lib", "clinic", "cafe"];
  const names = ["کتابخونه‌ی محله", "درمانگاه", "کافه‌ی همسایه"];
  const titles = ["کتابخونه؟", "درمانگاه؟", "یا کافه؟"];
  const lt = T - ts[i];
  const punch = 1 + 0.08 * (1 - easeOut(clamp(lt / 0.3)));
  const offs: [number, number][] = [[-0.6, 0.4], [0.5, -0.3], [-0.2, -0.5]];
  const cam: Cam = { x: 4.4 + offs[i][0] + lt * 0.25, y: 14.2 + offs[i][1] - lt * 0.15, z: 1.25 * punch + lt * 0.02, cy: 980 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={{ civic: kinds[i], civicS: pop(T, ts[i] + 0.02, 0.35) }} />
      <Label cam={cam} x={3.8} y={12.4} z={i === 1 ? 2.2 : 1.9} T={T} t0={ts[i] + 0.08} text={names[i]} />
      <Title T={T} t0={ts[i]} sub="ایده برای محله" lines={[titles[i]]} />
    </AbsoluteFill>
  );
};

// 7 · choice card: the clinic eats 40
const S7: React.FC<SP> = ({ T, t0 }) => {
  const cam: Cam = { x: 9, y: 9, z: 0.78 + (T - t0) * 0.01, cy: 900 };
  const card = easeOut(prog(T, t0, t0 + 0.45));
  const tPick = wd(7, "درمانگاه");
  const tTen = wd(7, "ده");
  const rows: [string, string, number][] = [["📚", "کتابخونه", 25], ["🏥", "درمانگاه", 40], ["☕", "کافه", 15]];
  const remain = Math.round(lerp(50, 10, easeOut(prog(T, tTen - 0.2, tTen + 0.5))));
  const pick = easeOut(prog(T, tPick, tPick + 0.3));
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} blur={7} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
      <div style={{ position: "absolute", left: 110, right: 110, top: 470, transform: `translateY(${(1 - card) * 700}px)` }}>
        <div style={{ borderRadius: 36, background: "#FBFBF6", padding: "34px 38px 40px", boxShadow: "0 30px 60px rgba(20,45,30,0.35)", direction: "rtl" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep }}>بعدی رو تو انتخاب کن</div>
          <div style={{ fontFamily: FONT.bold, fontSize: 30, color: "#6C8577", marginBottom: 16 }}>بودجه‌ی باقی‌مونده: {fa(50)} سکه</div>
          {rows.map(([ic, n, c], i) => {
            const on = i === 1 ? pick : 0;
            const r = easeOut(prog(T, t0 + 0.15 + i * 0.08, t0 + 0.5 + i * 0.08));
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 20px", marginTop: 14, borderRadius: 22, opacity: r, transform: `translateX(${(1 - r) * -50}px) scale(${1 + on * 0.04})`,
                background: on > 0.5 ? C.lime : "#EEF2EA", border: `4px solid ${on > 0.5 ? C.roofD : "transparent"}` }}>
                <span style={{ fontSize: 50 }}>{ic}</span>
                <span style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep, flex: 1 }}>{n}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.black, fontSize: 44, color: C.deep }}>{fa(c)} <Coin s={44} /></span>
              </div>
            );
          })}
          <div style={{ marginTop: 30, fontFamily: FONT.bold, fontSize: 32, color: C.deep2 }}>اگه درمانگاه رو بسازی:</div>
          <div style={{ marginTop: 10, height: 44, borderRadius: 22, background: "#E3E8DE", overflow: "hidden", position: "relative", direction: "ltr" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${remain * 2}%`, background: remain <= 10 ? C.red : C.roof, borderRadius: 22 }} />
            <div style={{ position: "absolute", right: 18, top: -2, fontFamily: FONT.black, fontSize: 34, color: C.deep, direction: "rtl" }}>{fa(remain)} سکه می‌مونه</div>
          </div>
        </div>
      </div>
      <Title T={T} t0={t0} sub="انتخاب سخت" lines={["چهل سکه!"]} />
    </AbsoluteFill>
  );
};

// 8 · being mayor = choosing between good things
const S8: React.FC<SP> = ({ T, t0 }) => {
  const k = easeInOut(prog(T, t0, CUT[9]));
  const cam: Cam = { x: lerp(6, 9, k), y: lerp(13, 9.5, k), z: lerp(1.0, 0.64, k), cy: 920 };
  const tCh = wd(8, "انتخاب");
  const chips: [string, boolean][] = [["درمانگاه", true], ["کتابخونه", false], ["کافه", false]];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={{ people: 1 }} />
      <Smog T={T} k={0.5} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", justifyContent: "center", gap: 18, direction: "rtl" }}>
        {chips.map(([n, ok], i) => {
          const p = pop(T, tCh - 0.1 + i * 0.1, 0.35);
          return (
            <div key={n} style={{ transform: `scale(${p})`, padding: "8px 26px 14px", borderRadius: 999, background: ok ? C.roofD : "rgba(255,255,255,0.85)", border: `4px solid ${ok ? C.lime : "#C9D1C4"}`,
              fontFamily: FONT.black, fontSize: 38, color: ok ? "#fff" : "#8A958C", textDecoration: ok ? "none" : "line-through" }}>{ok ? "✓ " : "✗ "}{n}</div>
          );
        })}
      </div>
      <Title T={T} t0={t0} sub="درس امروز" lines={["شهردار بودن", <>یعنی <span style={{ color: C.lime, background: "rgba(28,58,42,0.85)", borderRadius: 14, padding: "0 14px 6px" }}>انتخاب</span></>]} />
    </AbsoluteFill>
  );
};

// 9 · back to the map: your city, your choice → comment
const S9: React.FC<SP> = ({ T, t0 }) => {
  const tC = wd(9, "کامنت");
  const comments: [string, string][] = [["رشت", "یه پارک بزرگ کنار رودخونه 🌳"], ["مشهد", "کتابخونه‌ی ۲۴ ساعته 📚"], ["شیراز", "خط اتوبوس برقی تا دانشگاه 🚌"]];
  const end = easeOut(prog(T, END0, END0 + 0.35));
  return (
    <AbsoluteFill>
      <BG />
      <IranMap T={T} t0={t0} pins="all" />
      <div style={{ position: "absolute", left: 90, right: 90, top: 1440, direction: "rtl", opacity: 1 - end }}>
        {comments.map(([c, t], i) => {
          const p = easeOut(prog(T, tC - 0.2 + i * 0.35, tC + 0.15 + i * 0.35));
          if (p <= 0) return null;
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, padding: "12px 20px", borderRadius: 20, background: "rgba(255,255,255,0.94)", opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: [C.roofD, C.deep, C.roof][i], color: "#fff", fontFamily: FONT.black, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{c[0]}</div>
              <div style={{ fontFamily: FONT.black, fontSize: 30, color: C.deep }}>{c}<span style={{ fontFamily: FONT.semi, color: "#4F6458" }}> · {t}</span></div>
            </div>
          );
        })}
      </div>
      {end > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(28,58,42,${0.55 * end})` }}>
          <div style={{ transform: `scale(${lerp(1.3, 1, end)})`, opacity: end, textAlign: "center", direction: "rtl" }}>
            <div style={{ fontFamily: FONT.black, fontSize: 80, color: "#fff", lineHeight: 1.4 }}>تو با <span style={{ color: C.coinL }}>۱۰۰ سکه</span><br />چی می‌ساختی؟</div>
            <div style={{ display: "inline-block", marginTop: 34, padding: "14px 50px 22px", borderRadius: 999, background: C.lime, fontFamily: FONT.black, fontSize: 60, color: C.deep }}>کامنت کن 👇</div>
          </div>
        </AbsoluteFill>
      )}
      <Title T={T} t0={t0} sub="اسم شهرت + انتخابت" lines={["تو چی", "می‌ساختی؟"]} />
    </AbsoluteFill>
  );
};

// ───────── edit ─────────
const SCENES: React.FC<SP>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9];
const CUT = SCENES.map((_, i) => (i === 0 ? 0 : segStart(i) - 0.12));
const endOf = (i: number) => (i < SCENES.length - 1 ? CUT[i + 1] : TOTAL);
type Kind = "cut" | "zoom" | "whip" | "slide" | "pull";
const KIND: Kind[] = ["cut", "zoom", "slide", "whip", "whip", "pull", "whip", "slide", "zoom", "pull"];
const XLEN: Record<Kind, number> = { cut: 0, zoom: 0.4, whip: 0.3, slide: 0.4, pull: 0.45 };

const Layer: React.FC<{ i: number; T: number; style?: React.CSSProperties }> = ({ i, T, style }) => {
  const S = SCENES[i];
  return <AbsoluteFill style={{ overflow: "hidden", ...style }}><S T={T} t0={CUT[i]} /></AbsoluteFill>;
};
const Scenes: React.FC<{ T: number }> = ({ T }) => {
  const out: React.ReactNode[] = [];
  SCENES.forEach((_, i) => {
    const xin = i ? XLEN[KIND[i]] : 0;
    const xout = i < SCENES.length - 1 ? XLEN[KIND[i + 1]] : 0;
    const a = CUT[i] - xin / 2, b = endOf(i) + xout / 2;
    if (T < a || T >= b) return;
    let st: React.CSSProperties = {};
    if (i && T < CUT[i] + xin / 2) {
      const q = easeOut(prog(T, a, CUT[i] + xin / 2));
      const k = KIND[i];
      if (k === "zoom") st = { transform: `scale(${1.5 - 0.5 * q})`, opacity: q, filter: `blur(${(1 - q) * 12}px)` };
      if (k === "whip") st = { transform: `translateX(${(1 - q) * -W}px)`, filter: `blur(${(1 - q) * 20}px)` };
      if (k === "slide") st = { transform: `translateY(${(1 - q) * H * 0.6}px)` };
      if (k === "pull") st = { transform: `scale(${0.7 + 0.3 * q})`, opacity: q };
    }
    if (i < SCENES.length - 1 && T > endOf(i) - xout / 2) {
      const q = easeInOut(prog(T, endOf(i) - xout / 2, b));
      const k = KIND[i + 1];
      if (k === "zoom") st = { transform: `scale(${1 + 0.3 * q})`, opacity: 1 - q };
      if (k === "whip") st = { transform: `translateX(${q * W}px)`, filter: `blur(${q * 20}px)` };
      if (k === "slide") st = { transform: `translateY(${-q * H * 0.3}px)`, filter: `brightness(${1 - 0.3 * q})` };
      if (k === "pull") st = { transform: `scale(${1 + 0.4 * q})`, opacity: 1 - q };
    }
    out.push(<Layer key={i} i={i} T={T} style={st} />);
  });
  return <>{out}</>;
};

const Frame: React.FC<{ T: number }> = ({ T }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Scenes T={T} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(30,60,42,0.35) 0%, rgba(30,60,42,0) 22%)" }} />
    <TopBar T={T} />
    <CoinPill T={T} />
    <Captions T={T} />
  </AbsoluteFill>
);

const Video: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Frame T={f / FPS} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </>
  );
};
const LOOK = [0.6, wdEnd(0, "شدی") - 0.2, wd(1, "بیشتر"), wd(2, "بچه‌ها") + 0.4, wd(3, "نصف") + 0.3, wd(4, "فوتبال") + 0.4, wd(5, "می‌خوان"), wd(6, "درمانگاه") + 0.25, wd(7, "ده") + 0.6, wd(8, "خوب"), wd(9, "کامنت") + 0.8, TOTAL - 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame T={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V30: React.FC = () => (
  <>
    <Composition id="V30" component={Video} durationInFrames={V30_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v30/mix.wav" }} />
    <Composition id="V30-Silent" component={Video} durationInFrames={V30_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V30-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
