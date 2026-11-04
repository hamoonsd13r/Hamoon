// V33 · «شهردار یه‌روزه» قسمت ۳ — بندرعباس (برنده‌ی رأی قسمت ۲، uploads/comments-v31-tally.md).
// map vote → Bandar Abbas coast: heat → palms + shade sails (−40) → pier with lights (−35) → water stations (−25) → two funny comments → Mashhad teaser → one-word question.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import iranJson from "./iran.json";
import { C, Cam, FONT, FPS, H, W, clamp, easeInOut, easeOut, fa, hash, lerp, pop, prog, segEnd, segStart, toScreen, wd, words } from "./kit";
import { Coast, CoastState } from "./coast";

const END0 = segEnd(9) + 0.3;
const TOTAL = END0 + 2.2;
export const V33_FRAMES = Math.round(TOTAL * FPS);

const fontHandle = typeof document !== "undefined" ? delayRender("v33 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V33Black", "fonts/Vazirmatn-Black.ttf"], ["V33Bold", "fonts/Vazirmatn-Bold.ttf"], ["V33Semi", "fonts/Vazirmatn-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

// ───────── world state over time ─────────
const coastState = (T: number, o: Partial<CoastState> = {}): CoastState => ({
  T,
  palms: prog(T, wd(3, "نخل") - 0.2, wd(3, "نخل") + 1.4),
  sails: prog(T, wd(3, "سایه‌بون") - 0.2, wd(3, "سایه‌بون") + 1.4),
  pier: easeInOut(prog(T, wd(4, "اسکله‌ی") - 0.3, wd(4, "اسکله‌ی") + 1.6)),
  lights: prog(T, wd(4, "چراغ‌های") - 0.1, wd(4, "چراغ‌های") + 1.0),
  water: prog(T, wd(5, "ایستگاه") - 0.2, wd(5, "ایستگاه") + 1.2),
  flow: 1.1,
  ...o,
});
const heatAt = (T: number) => 1 - 0.65 * easeOut(prog(T, wd(3, "نخل"), wd(3, "سایه‌بون") + 1.2)) - 0.25 * easeOut(prog(T, wd(5, "ایستگاه"), wd(5, "ایستگاه") + 1));
const coinsAt = (T: number) => (T < wd(3, "چهل") ? 100 : T < wd(4, "سی") ? 60 : T < wd(5, "بیست") ? 25 : 0);

const CoastLayer: React.FC<{ T: number; cam: Cam; st?: Partial<CoastState>; blur?: number; heat?: boolean }> = ({ T, cam, st, blur = 0, heat = true }) => {
  const h = heat ? heatAt(T) : 0;
  return (
    <AbsoluteFill style={{ background: C.ground, filter: blur ? `blur(${blur}px)` : undefined }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><Coast cam={cam} st={coastState(T, st)} /></svg>
      {h > 0.02 && (
        <>
          <AbsoluteFill style={{ background: `rgba(255,150,60,${0.16 * h})`, mixBlendMode: "multiply" }} />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 80% 8%, rgba(255,226,140,${0.55 * h}) 0%, rgba(255,226,140,0) 45%)` }} />
        </>
      )}
    </AbsoluteFill>
  );
};

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
    <span style={{ fontFamily: FONT.bold, fontSize: 28, color: dark ? C.deep2 : "#fff", opacity: 0.92, textShadow: dark ? "none" : "0 2px 8px rgba(20,50,30,0.5)" }}>قسمت ۳</span>
  </div>
);


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



/** budget pill (top-left) with floating −N */
const CoinPill: React.FC<{ T: number }> = ({ T }) => {
  if (T < wd(2, "صد") - 0.1 || T > CUT[6]) return null;
  const a = easeOut(prog(T, wd(2, "صد") - 0.1, wd(2, "صد") + 0.2));
  const v = coinsAt(T);
  const hits: [number, string][] = [[wd(3, "چهل"), "−۴۰"], [wd(4, "سی"), "−۳۵"], [wd(5, "بیست"), "−۲۵"]];
  const low = v <= 0;
  const pulse = hits.reduce((m, [t]) => (T >= t ? Math.max(m, 1 - prog(T, t, t + 0.35)) : m), 0);
  return (
    <div style={{ position: "absolute", left: 60, top: 168, opacity: a, transform: `scale(${1 + 0.18 * pulse})`, transformOrigin: "0 50%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 26px 8px 12px", borderRadius: 999, background: C.deep, border: `4px solid ${low ? C.lime : C.coin}`, direction: "ltr" }}>
        <Coin s={58} />
        <span style={{ fontFamily: FONT.black, fontSize: 58, color: low ? C.lime : C.coinL, minWidth: 92, textAlign: "center" }}>{fa(v)}</span>
      </div>
      {hits.map(([t, s]) => {
        const q = prog(T, t, t + 1.1);
        if (q <= 0 || q >= 1) return null;
        return <div key={s} style={{ position: "absolute", left: 92, top: 96 + q * 70, fontFamily: FONT.black, fontSize: 56, color: C.red, opacity: 1 - easeInOut(q), textShadow: "0 3px 10px rgba(0,0,0,0.25)" }}>{s}</div>;
      })}
    </div>
  );
};

// ───────── Iran map with commenters ─────────
const IRAN = iranJson as [number, number][];
const COSL = Math.cos((32.4 * Math.PI) / 180);
const MK = 860 / ((63.4 - 44) * COSL);
const mapXY = (lon: number, lat: number, ox = 110, oy = 470): [number, number] => [ox + (lon - 44) * COSL * MK, oy + (39.8 - lat) * MK];
const IRAN_D = IRAN.map(([lo, la], i) => { const [x, y] = mapXY(lo, la, 0, 0); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ") + "Z";
type Prov = "hz" | "kr" | "";
// [name, lon, lat, votes, province tag, one commenter]
const CITIES: [string, number, number, number, Prov, string][] = [
  ["بندرعباس", 56.27, 27.18, 50, "hz", "bat.524233"], ["مشهد", 59.6, 36.3, 28, "kr", "darkshekhe"],
  ["چابهار", 60.64, 25.29, 1, "", ""], ["بندر لنگه", 54.89, 26.56, 1, "", ""], ["بندر خمیر", 55.59, 26.95, 1, "", ""], ["سیراف", 52.34, 27.67, 1, "", ""],
  ["بوشهر", 50.84, 28.97, 1, "", ""], ["پارسیان", 53.04, 27.2, 1, "", ""], ["شیراز", 52.53, 29.59, 1, "", ""], ["تبریز", 46.29, 38.08, 1, "", ""],
  ["کرج", 50.99, 35.84, 1, "", ""], ["قزوین", 50, 36.27, 1, "", ""], ["یزد", 54.37, 31.9, 1, "", ""], ["کاشان", 51.44, 33.98, 1, "", ""],
  ["سبزوار", 57.68, 36.21, 1, "", ""], ["نیشابور", 58.8, 36.21, 1, "", ""], ["بجنورد", 57.33, 37.47, 1, "", ""], ["درگز", 59.11, 37.44, 1, "", ""],
  ["گرگان", 54.43, 36.84, 1, "", ""], ["بابل", 52.68, 36.54, 1, "", ""], ["بابلسر", 52.65, 36.7, 1, "", ""], ["جویبار", 52.9, 36.64, 1, "", ""],
  ["ایذه", 49.87, 31.83, 1, "", ""], ["خرمشهر", 48.18, 30.44, 1, "", ""], ["بهبهان", 50.24, 30.6, 1, "", ""], ["بروجرد", 48.75, 33.9, 1, "", ""],
  ["سنندج", 47, 35.31, 1, "", ""], ["تهران", 51.39, 35.69, 1, "", ""], ["سراوان", 62.33, 27.37, 1, "", ""], ["پاسارگاد", 53.17, 30.2, 1, "", ""],
  ["سیرجان", 55.68, 29.45, 1, "", ""],
];
// order of appearance: shuffle by hash so pins pop all over the map
const ORDER = CITIES.map((_, i) => i).sort((a, b) => hash(a * 7.3) - hash(b * 7.3));

const MapBase: React.FC<{ T: number; t0: number; focus?: [number, number]; zoom?: number; dimOthers?: number; prov?: number; hero?: string; children?: React.ReactNode }> = ({ T, t0, focus = [53, 32.5], zoom = 1, dimOthers = 0, prov = 0, hero, children }) => {
  const [fx, fy] = mapXY(focus[0], focus[1]);
  const drift = 1 + (T - t0) * 0.006;
  const sc = zoom * drift;
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${W / 2}px, 860px) scale(${sc}) translate(${-fx}px, ${-fy}px)` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <pattern id="relief33" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.4" fill="#A9AE72" opacity="0.55" />
            <circle cx="8" cy="7" r="1" fill="#E3E6B8" opacity="0.6" />
          </pattern>
        </defs>
        <g transform="translate(110 470)">
          <path d={IRAN_D} fill="#7E9467" transform="translate(0 16)" />
          <path d={IRAN_D} fill="#CBD08E" />
          <path d={IRAN_D} fill="url(#relief33)" />
          <path d={IRAN_D} fill="none" stroke="#EEF0C8" strokeWidth={3} opacity={0.8} />
        </g>
        {prov > 0 && CITIES.filter((c) => c[4]).map(([n, lo, la, , pv]) => {
          const [x, y] = mapXY(lo, la);
          return <circle key={`g${n}`} cx={x} cy={y} r={70 * prov} fill={pv === "hz" ? "#4FB3C9" : "#E7B547"} opacity={0.28} />;
        })}
      </svg>
      {CITIES.map(([n, lo, la, v, pv], i) => {
        const k = ORDER.indexOf(i);
        const p = pop(T, Math.min(t0, 0) + 0.25 + k * 0.1, 0.35);
        if (p <= 0) return null;
        const [x, y] = mapXY(lo, la);
        const s = ((0.55 + Math.min(v, 4) * 0.14) / Math.sqrt(sc)) * (n === hero ? 1.6 : 1);
        const hot = (prov > 0 && pv) || n === hero;
        const dim = hot ? 1 : 1 - dimOthers * 0.75;
        const col = hot ? (pv === "hz" ? "#2F8FA6" : "#C9962A") : v >= 3 ? C.deep : C.roofD;
        return (
          <div key={n} style={{ position: "absolute", left: x, top: y, opacity: dim, transform: `translate(-50%, -100%) scale(${p * s})`, transformOrigin: "50% 100%" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: col, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ transform: "rotate(45deg)", fontFamily: FONT.black, fontSize: 26, color: "#fff" }}>{fa(v)}</span>
            </div>
          </div>
        );
      })}
      {children}
    </AbsoluteFill>
  );
};
const BG: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 60%, ${C.bgD} 100%)` }} />;
const Chip: React.FC<{ p: number; children: React.ReactNode; dark?: boolean; size?: number }> = ({ p, children, dark, size = 34 }) => (
  <div style={{ transform: `scale(${p})`, opacity: clamp(p * 2), direction: "rtl", whiteSpace: "nowrap", padding: "6px 22px 10px", borderRadius: 999, background: dark ? C.deep : "#fff",
    color: dark ? "#fff" : C.deep, fontFamily: FONT.black, fontSize: size, boxShadow: "0 8px 20px rgba(20,45,30,0.25)", border: dark ? `3px solid ${C.lime}` : "none" }}>{children}</div>
);
const Handle: React.FC<{ h: string; size?: number }> = ({ h, size = 30 }) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: FONT.bold, fontSize: size }}>@{h}</span>;


// ───────── scenes ─────────
type SP = { T: number; t0: number };
const BA: [number, number] = [56.27, 27.18], MS: [number, number] = [59.6, 36.3];

// 0 · the vote: Bandar Abbas ~2× Mashhad
const S0: React.FC<SP> = ({ T, t0 }) => {
  const tB = wd(0, "بندرعباس", 1), tD = wd(0, "دو");
  const g = easeOut(prog(T, tB - 0.2, tB + 0.9));
  const bars: [string, number, string, string][] = [["بندرعباس", 50, "#2F8FA6", "🌊"], ["مشهد", 28, "#C9962A", "🕌"]];
  const win = pop(T, tD, 0.45);
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0} focus={[55.2, 29.2]} prov={easeOut(prog(T, t0 + 0.3, t0 + 1))} dimOthers={0.3} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 1060, direction: "rtl", background: "rgba(251,251,246,0.96)", borderRadius: 30, padding: "22px 30px 26px", boxShadow: "0 20px 44px rgba(20,45,30,0.3)", opacity: easeOut(prog(T, t0 + 0.2, t0 + 0.6)) }}>
        {bars.map(([n, v, col, ic], i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: i ? 14 : 0 }}>
            <span style={{ fontSize: 40, width: 50 }}>{ic}</span>
            <span style={{ fontFamily: FONT.black, fontSize: 38, color: C.deep, width: 180 }}>{n}</span>
            <div style={{ flex: 1, height: 46, borderRadius: 23, background: "#E7ECE2", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(v / 50) * 100 * g}%`, borderRadius: 23, background: col }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 14, fontFamily: FONT.bold, fontSize: 26, color: "#6C8577", textAlign: "center" }}>از کامنت‌هایی که شمردیم</div>
      </div>
      {win > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 990, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-5deg) scale(${win})`, padding: "6px 30px 12px", borderRadius: 14, background: "#2F8FA6", color: "#fff", fontFamily: FONT.black, fontSize: 42, border: "4px solid #fff" }}>نزدیکِ ۲ برابر!</div>
        </div>
      )}
      <Title T={T} t0={t0} sub="نتیجه‌ی رأی قسمت ۲" lines={["بندرعباس", "برد! 🌊"]} />
    </AbsoluteFill>
  );
};

// 1 · map dive into Bandar Abbas → coast
const S1: React.FC<SP> = ({ T, t0 }) => {
  const z = easeInOut(prog(T, t0, endOf(1)));
  const zoom = lerp(1, 3.2, z);
  const focus: [number, number] = [lerp(55.2, BA[0], z), lerp(29.2, BA[1], z)];
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 4} focus={focus} zoom={zoom} dimOthers={z} hero="بندرعباس" />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(63,167,181,0) 40%, rgba(63,167,181,${0.5 * z}) 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", justifyContent: "center", gap: 16 }}>
        <Chip p={pop(T, wd(1, "جنوب"), 0.4)} dark>🧭 جنوب</Chip>
        <Chip p={pop(T, wd(1, "خلیج"), 0.4)} dark>🌊 خلیجِ فارس</Chip>
      </div>
      <Title T={T} t0={t0} sub="قسمت ۳" lines={["می‌ریم", "بندرعباس"]} />
    </AbsoluteFill>
  );
};

// 2 · the problem: hot, humid, no shade
const S2: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, t0 + 1.4));
  const cam: Cam = { x: lerp(12, 10, k), y: lerp(12, 10.5, k), z: lerp(0.62, 0.74, k) + (T - t0) * 0.01, cy: 900 };
  const sh = Math.sin(T * 14) * 2;
  return (
    <AbsoluteFill>
      <CoastLayer T={T} cam={cam} />
      {/* heat shimmer lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 80 + i * 160, top: 700 + Math.sin(T * 3 + i) * 30, width: 90, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)", transform: `translateX(${sh}px)` }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, display: "flex", justifyContent: "center", gap: 16 }}>
        <Chip p={pop(T, wd(2, "داغ"), 0.4)} dark>🌡️ داغ</Chip>
        <Chip p={pop(T, wd(2, "شرجیه"), 0.4)} dark>💧 شرجی</Chip>
        <Chip p={pop(T, wd(2, "سایه"), 0.4)} dark>☀️ بدونِ سایه</Chip>
      </div>
      <Title T={T} t0={t0} sub="مشکلِ اصلی" lines={["تابستونِ", "بندرعباس"]} />
    </AbsoluteFill>
  );
};

// 3 · palms + shade sails (−40)
const S3: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[4]));
  const cam: Cam = { x: lerp(4, 6.5, k), y: lerp(9, 8.6, k), z: 1.05 + k * 0.08, cy: 900 };
  return (
    <AbsoluteFill>
      <CoastLayer T={T} cam={cam} />
      <Label cam={cam} x={3.2} y={7.45} z={2.6} T={T} t0={wd(3, "نخل") + 0.3} text="🌴 نخل" />
      <Label cam={cam} x={5.2} y={10.9} z={1.5} T={T} t0={wd(3, "سایه‌بون") + 0.3} text="⛱️ سایه‌بون" dark />
      <Title T={T} t0={t0} sub="تصمیمِ اول" lines={["سایه برای", "پیاده‌روها"]} />
    </AbsoluteFill>
  );
};

// 4 · pier with lights (−35)
const S4: React.FC<SP> = ({ T, t0 }) => {
  const k = easeInOut(prog(T, t0, CUT[5]));
  const cam: Cam = { x: lerp(11, 12.8, k), y: lerp(15.5, 19.5, k), z: lerp(0.95, 1.05, k), cy: 960 };
  const dusk = easeOut(prog(T, wd(4, "چراغ‌های") - 0.3, wd(4, "چراغ‌های") + 0.8));
  return (
    <AbsoluteFill>
      <CoastLayer T={T} cam={cam} />
      <AbsoluteFill style={{ background: `rgba(30,40,80,${0.32 * dusk})`, mixBlendMode: "multiply" }} />
      <Label cam={cam} x={12.6} y={23.5} z={1.4} T={T} t0={wd(4, "اسکله‌ی") + 0.6} text="⚓ اسکله‌ی تفریحی" />
      <Title T={T} t0={t0} sub="تصمیمِ دوم" lines={["ساحلِ", "زنده"]} />
    </AbsoluteFill>
  );
};

// 5 · cold-water stations (−25 → 0)
const S5: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[6]));
  const cam: Cam = { x: lerp(9, 8.8, k), y: lerp(10.6, 11.2, k), z: lerp(0.95, 0.85, k), cy: 920 };
  return (
    <AbsoluteFill>
      <CoastLayer T={T} cam={cam} />
      <Label cam={cam} x={10.9} y={10.9} z={1.5} T={T} t0={wd(5, "ایستگاه") + 0.35} text="💧 آبِ خنک" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center" }}>
        <Chip p={pop(T, segEnd(5) - 0.2, 0.4)} dark>✅ بودجه تموم شد</Chip>
      </div>
      <Title T={T} t0={t0} sub="تصمیمِ سوم" lines={["آبِ خنک"]} />
    </AbsoluteFill>
  );
};

// 6–7 · funny comments with replies
const Comment: React.FC<{ T: number; t: number; h: string; text: string; reply: string; tr: number; fromLeft?: boolean }> = ({ T, t, h, text, reply, tr, fromLeft }) => {
  const p = easeOut(prog(T, t, t + 0.4)), q = easeOut(prog(T, tr, tr + 0.4));
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 520, direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, padding: "22px 26px", borderRadius: 28, background: "#fff", opacity: p, transform: `translateX(${(1 - p) * (fromLeft ? -140 : 140)}px)`, boxShadow: "0 16px 36px rgba(20,45,30,0.3)" }}>
        <div style={{ width: 70, height: 70, flex: "none", borderRadius: 35, background: C.deep, color: "#fff", fontFamily: FONT.black, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{h[0].toUpperCase()}</div>
        <div>
          <div style={{ color: C.deep, opacity: 0.85 }}><Handle h={h} size={28} /></div>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep, lineHeight: 1.45 }}>{text}</div>
        </div>
      </div>
      {q > 0 && (
        <div style={{ marginTop: 22, marginRight: 90, display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 24px", borderRadius: 26, background: C.lime, opacity: q, transform: `translateY(${(1 - q) * 40}px)`, boxShadow: "0 14px 30px rgba(20,45,30,0.25)" }}>
          <div style={{ width: 58, height: 58, flex: "none", borderRadius: 29, background: C.deep, display: "flex", alignItems: "center", justifyContent: "center" }}><Coin s={40} /></div>
          <div>
            <div style={{ fontFamily: FONT.bold, fontSize: 26, color: C.deep2 }}>شهردار یه‌روزه · جواب</div>
            <div style={{ fontFamily: FONT.black, fontSize: 42, color: C.deep, lineHeight: 1.45 }}>{reply}</div>
          </div>
        </div>
      )}
    </div>
  );
};
const S6: React.FC<SP> = ({ T, t0 }) => (
  <AbsoluteFill>
    <CoastLayer T={T} cam={{ x: 9, y: 11, z: 0.8 + (T - t0) * 0.01, cy: 900 }} blur={7} heat={false} />
    <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
    <Comment T={T} t={wd(6, "داداش") - 0.15} h="dark_t74" text="داداش ما رو استاندارِ بوشهر می‌کنی؟ 🤔" reply="نه داداش، ما فقط شهردارِ یه‌روزه‌ایم! 😂" tr={wd(6, "نه") - 0.1} />
    <Title T={T} t0={t0} sub="کامنت‌های خاص" lines={["پیشنهادِ ویژه 😂"]} />
  </AbsoluteFill>
);
const S7: React.FC<SP> = ({ T, t0 }) => (
  <AbsoluteFill>
    <CoastLayer T={T} cam={{ x: 12.5, y: 19, z: 0.85 + (T - t0) * 0.01, cy: 900 }} blur={7} heat={false} />
    <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
    <Comment T={T} t={wd(7, "سیرجان") - 0.25} h="barbod1003bl" text="سیرجان پس چیییی؟ 😐" reply="صبر کن، نوبتِ اونم می‌رسه ⏳" tr={wd(7, "صبر") - 0.1} fromLeft />
    <Title T={T} t0={t0} sub="کامنت‌های خاص" lines={["سیرجان؟"]} />
  </AbsoluteFill>
);

// 8 · next: Mashhad
const S8: React.FC<SP> = ({ T, t0 }) => {
  const z = easeInOut(prog(T, t0, t0 + 1.6));
  const focus: [number, number] = [lerp(53, MS[0], z), lerp(32.5, MS[1], z)];
  const badge = pop(T, wd(8, "مشهد", 1), 0.45);
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 6} focus={focus} zoom={lerp(1, 2.6, z)} dimOthers={z} hero="مشهد" />
      {badge > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${badge})`, padding: "12px 40px 20px", borderRadius: 24, background: "#C9962A", border: "5px solid #fff", direction: "rtl", fontFamily: FONT.black, fontSize: 60, color: "#fff", whiteSpace: "nowrap" }}>
            🕌 قسمتِ ۴: مشهد
          </div>
        </div>
      )}
      <Title T={T} t0={t0} sub="قسمتِ بعد" lines={["می‌ریم", "مشهد!"]} />
    </AbsoluteFill>
  );
};

// 9 · one-word question
const S9: React.FC<SP> = ({ T, t0 }) => {
  const words = ["مترو", "پارک", "کتابخونه", "بیمارستان", "ورزشگاه", "؟"];
  const i = Math.floor(Math.max(0, T - t0 - 0.6) / 0.55) % words.length;
  const end = easeOut(prog(T, END0, END0 + 0.35));
  const card = easeOut(prog(T, t0, t0 + 0.4));
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 8} focus={MS} zoom={2.6} dimOthers={1} hero="مشهد" />
      <AbsoluteFill style={{ background: "rgba(28,58,42,0.35)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 520, direction: "rtl", opacity: card, transform: `translateY(${(1 - card) * 80}px)` }}>
        <div style={{ borderRadius: 32, background: "#FBFBF6", padding: "30px 34px 34px", boxShadow: "0 24px 50px rgba(20,45,30,0.35)" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep, lineHeight: 1.45 }}>اگه شهردارِ مشهد بودی، اولین چیزی که می‌ساختی؟</div>
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 999, background: "#EEF2EA" }}>
            <span style={{ fontSize: 34 }}>✍️</span>
            <span style={{ fontFamily: FONT.black, fontSize: 44, color: C.roofD }}>{words[i]}</span>
            <span style={{ width: 4, height: 44, background: C.deep, opacity: Math.sin(T * 10) > 0 ? 1 : 0 }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: FONT.bold, fontSize: 30, color: "#6C8577" }}>فقط یه کلمه 👇</div>
        </div>
      </div>
      {end > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(28,58,42,${0.88 * end})` }}>
          <div style={{ transform: `scale(${lerp(1.3, 1, end)})`, opacity: end, textAlign: "center", direction: "rtl" }}>
            <div style={{ fontFamily: FONT.black, fontSize: 74, color: "#fff", lineHeight: 1.4 }}>مشهد چی کم داره؟</div>
            <div style={{ fontFamily: FONT.black, fontSize: 58, color: C.lime, lineHeight: 1.5 }}>یه کلمه بنویس</div>
            <div style={{ display: "inline-block", marginTop: 30, padding: "14px 50px 22px", borderRadius: 999, background: C.lime, fontFamily: FONT.black, fontSize: 58, color: C.deep }}>کامنت کن 👇</div>
          </div>
        </AbsoluteFill>
      )}
      <Title T={T} t0={t0} sub="سؤالِ قسمتِ ۴" lines={["تو چی", "می‌ساختی؟"]} />
    </AbsoluteFill>
  );
};

// ───────── edit ─────────
const SCENES: React.FC<SP>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9];
const CUT = SCENES.map((_, i) => (i === 0 ? 0 : segStart(i) - 0.12));
const endOf = (i: number) => (i < SCENES.length - 1 ? CUT[i + 1] : TOTAL);
type Kind = "cut" | "zoom" | "whip" | "slide" | "pull";
const KIND: Kind[] = ["cut", "slide", "zoom", "whip", "pull", "whip", "slide", "whip", "zoom", "slide"];
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
const LOOK = [1.2, wd(0, "دو") + 0.5, CUT[1] + 1.6, wd(2, "سایه") + 0.3, wd(3, "سایه‌بون") + 1.2, wd(4, "اسکله‌ی") + 0.9, wd(4, "سی") + 0.3, wd(5, "ایستگاه") + 1.0, wd(6, "نه") + 0.6, wd(7, "صبر") + 0.6, wd(8, "مشهد", 1) + 0.5, wd(9, "کلمه"), TOTAL - 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame T={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V33: React.FC = () => (
  <>
    <Composition id="V33" component={Video} durationInFrames={V33_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v33/mix.wav" }} />
    <Composition id="V33-Silent" component={Video} durationInFrames={V33_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V33-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
