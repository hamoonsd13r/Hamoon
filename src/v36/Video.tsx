// V36 · «شهردار یه‌روزه» قسمت ۴ — مشهد (uploads/comments-v33-tally.md).
// recap → answers (metro, pitch, path to the shrine) → elevated metro (−40) → shaded promenade + fountain (−30) → grass pitch (−30) → Ahvaz/Tehran/Qeshm comments → next: Ahvaz.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import iranJson from "./iran.json";
import { C, Cam, FONT, FPS, H, W, clamp, easeInOut, easeOut, fa, hash, lerp, pop, prog, segEnd, segStart, toScreen, wd, words } from "./kit";
import { City, CityState } from "./iso";

const END0 = segEnd(8) + 0.3;
const TOTAL = END0 + 2.2;
export const V36_FRAMES = Math.round(TOTAL * FPS);

const fontHandle = typeof document !== "undefined" ? delayRender("v36 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V36Black", "fonts/Vazirmatn-Black.ttf"], ["V36Bold", "fonts/Vazirmatn-Bold.ttf"], ["V36Semi", "fonts/Vazirmatn-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

const cityState = (T: number, o: Partial<CityState> = {}): CityState => ({
  T, carFade: 1, flow: 1.1, laneDraw: 0, busX: null, stops: 0, park: 0, civic: "none", civicS: 0, people: 1, haram: true,
  metro: easeInOut(prog(T, wd(2, "خط") - 0.2, wd(2, "حرم") + 0.3)),
  trainX: T < wd(2, "حرم") ? null : -8 + ((T - wd(2, "حرم")) * 3.4) % 44,
  walk: prog(T, wd(3, "پیاده‌راه") - 0.2, wd(3, "فواره") + 0.4),
  pitch: easeOut(prog(T, wd(4, "زمین") - 0.2, wd(4, "چمن") + 0.6)),
  ...o,
});
const coinsAt = (T: number) => (T < wd(2, "چهل") ? 100 : T < wd(3, "سی") ? 60 : T < wd(4, "سی") ? 30 : 0);

const CityLayer: React.FC<{ T: number; cam: Cam; st?: Partial<CityState>; blur?: number }> = ({ T, cam, st, blur = 0 }) => (
  <AbsoluteFill style={{ background: C.ground, filter: blur ? `blur(${blur}px)` : undefined }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><City cam={cam} st={cityState(T, st)} /></svg>
  </AbsoluteFill>
);

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
    <span style={{ fontFamily: FONT.bold, fontSize: 28, color: dark ? C.deep2 : "#fff", opacity: 0.92, textShadow: dark ? "none" : "0 2px 8px rgba(20,50,30,0.5)" }}>قسمت ۴</span>
  </div>
);


// ───────── captions (word by word) ─────────
type Chunk = { ws: typeof words };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (let si = 0; si <= 8; si++) {
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
  const t0 = wd(2, "صد") - 0.1;
  if (T < t0 || T > CUT[5]) return null;
  const a = easeOut(prog(T, t0, t0 + 0.3));
  const v = coinsAt(T);
  const hits: [number, string][] = [[wd(2, "چهل"), "−۴۰"], [wd(3, "سی"), "−۳۰"], [wd(4, "سی"), "−۳۰"]];
  const low = v <= 0;
  const pulse = hits.reduce((m, [t]) => (T >= t ? Math.max(m, 1 - prog(T, t, t + 0.35)) : m), 0);
  return (
    <div style={{ position: "absolute", left: 60, top: 168, opacity: a, transform: `scale(${1 + 0.18 * pulse})`, transformOrigin: "0 50%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 26px 8px 12px", borderRadius: 999, background: C.deep, border: `4px solid ${low ? C.lime : C.coin}`, direction: "ltr" }}>
        <Coin s={58} />
        <span style={{ fontFamily: FONT.black, fontSize: 58, color: low ? C.lime : C.coinL, minWidth: 92, textAlign: "center" }}>{fa(v)}</span>
      </div>
      {hits.map(([t, s], i) => {
        const q = prog(T, t, t + 1.1);
        if (q <= 0 || q >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: 92, top: 96 + q * 70, fontFamily: FONT.black, fontSize: 56, color: C.red, opacity: 1 - easeInOut(q), textShadow: "0 3px 10px rgba(0,0,0,0.25)" }}>{s}</div>;
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
  ["مشهد", 59.6, 36.3, 12, "kr", "mohammadjavad63292"], ["بندرعباس", 56.27, 27.18, 26, "hz", "bat.524233"], ["اهواز", 48.67, 31.32, 6, "", "hoseinrokhnejad061"],
  ["سیرجان", 55.68, 29.45, 5, "", ""], ["چابهار", 60.64, 25.29, 4, "", ""], ["تهران", 51.39, 35.69, 4, "", "a.khojastepanah"], ["قشم", 56.27, 26.95, 3, "", "1396_radman"],
  ["خرم‌آباد", 48.35, 33.49, 3, "", ""], ["کرمان", 57.08, 30.28, 3, "", ""], ["بوشهر", 50.84, 28.97, 3, "", ""], ["شیراز", 52.53, 29.59, 3, "", ""], ["اصفهان", 51.67, 32.65, 3, "", ""],
  ["جهرم", 53.56, 28.5, 2, "", ""], ["یزد", 54.37, 31.9, 2, "", ""], ["تبریز", 46.29, 38.08, 2, "", ""], ["کرمانشاه", 47.07, 34.31, 2, "", ""], ["یاسوج", 51.59, 30.67, 2, "", ""],
  ["ساری", 53.06, 36.56, 2, "", ""], ["تربت‌جام", 60.62, 35.24, 2, "", ""], ["زنجان", 48.48, 36.67, 1, "", ""], ["قم", 50.88, 34.64, 1, "", ""], ["قزوین", 50, 36.27, 1, "", ""],
  ["کاشان", 51.44, 33.98, 1, "", ""], ["اردبیل", 48.29, 38.25, 1, "", ""], ["دزفول", 48.4, 32.38, 1, "", ""], ["آبادان", 48.3, 30.34, 1, "", ""], ["خاش", 61.2, 28.22, 1, "", ""],
  ["نهاوند", 48.37, 34.19, 1, "", ""], ["لار", 54.33, 27.68, 1, "", ""], ["کیش", 53.98, 26.53, 1, "", ""], ["بردسکن", 57.97, 35.26, 1, "", ""], ["رشت", 49.58, 37.28, 1, "", ""],
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
          <pattern id="relief36" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.4" fill="#A9AE72" opacity="0.55" />
            <circle cx="8" cy="7" r="1" fill="#E3E6B8" opacity="0.6" />
          </pattern>
        </defs>
        <g transform="translate(110 470)">
          <path d={IRAN_D} fill="#7E9467" transform="translate(0 16)" />
          <path d={IRAN_D} fill="#CBD08E" />
          <path d={IRAN_D} fill="url(#relief36)" />
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
const AHV: [number, number] = [48.67, 31.32];

// 0 · recap: last episode's question
const S0: React.FC<SP> = ({ T, t0 }) => {
  const card = easeOut(prog(T, t0 + 0.1, t0 + 0.5));
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0} focus={[55.5, 31]} hero="مشهد" dimOthers={0.3} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 1030, direction: "rtl", opacity: card, transform: `translateY(${(1 - card) * 60}px)` }}>
        <div style={{ borderRadius: 30, background: "#FBFBF6", padding: "22px 30px 26px", boxShadow: "0 20px 44px rgba(20,45,30,0.3)" }}>
          <div style={{ fontFamily: FONT.bold, fontSize: 28, color: "#6C8577" }}>سؤالِ قسمتِ ۳</div>
          <div style={{ fontFamily: FONT.black, fontSize: 42, color: C.deep, lineHeight: 1.45 }}>اگه شهردارِ مشهد بودی، اول چی می‌ساختی؟</div>
        </div>
      </div>
      <Title T={T} t0={t0} sub="قسمت ۴" lines={["مشهد 🕌"]} />
    </AbsoluteFill>
  );
};

// 1 · the three answers
const S1: React.FC<SP> = ({ T, t0 }) => {
  const cam: Cam = { x: 6, y: 4, z: 0.62 + (T - t0) * 0.012, cy: 980 };
  const items: [string, string, string, number][] = [
    ["🚇", "مترو", "mohamad_sirdeli_mashad", wd(1, "مترو")],
    ["⚽", "زمینِ فوتبال", "nbsk572", wd(1, "فوتبال")],
    ["🕌", "مسیرِ قشنگ تا حرم", "liya.panzeh", wd(1, "حرم")],
  ];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} blur={6} st={{ metro: 0, trainX: null, walk: 0, pitch: 0 }} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, direction: "rtl" }}>
        {items.map(([ic, n, h, t], i) => {
          const p = easeOut(prog(T, t - 0.15, t + 0.25));
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 22, padding: "18px 26px", borderRadius: 26, background: "#fff", opacity: p, transform: `translateX(${(1 - p) * 140}px)`, boxShadow: "0 14px 30px rgba(20,45,30,0.28)" }}>
              <div style={{ width: 84, height: 84, borderRadius: 24, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>{ic}</div>
              <div>
                <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep }}>{n}</div>
                <div style={{ color: "#6C8577" }}><Handle h={h} size={24} /></div>
              </div>
              <div style={{ marginRight: "auto", fontFamily: FONT.black, fontSize: 40, color: C.roofD }}>{fa(i + 1)}</div>
            </div>
          );
        })}
      </div>
      <Title T={T} t0={t0} sub="جوابِ شما" lines={["سه تا جواب"]} />
    </AbsoluteFill>
  );
};

// 2 · elevated metro to the shrine (−40)
const S2: React.FC<SP> = ({ T, t0 }) => {
  const k = easeInOut(prog(T, t0, CUT[3]));
  const cam: Cam = { x: lerp(0, 7, k), y: lerp(4, 6.5, k), z: lerp(0.78, 0.9, k), cy: 980 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={{ walk: 0, pitch: 0 }} />
      <Label cam={cam} x={5.5} y={8.6} z={2.5} T={T} t0={wd(2, "حرم") + 0.2} text="🚇 ایستگاهِ حرم" />
      <Label cam={cam} x={-0.5} y={-9.5} z={4.2} T={T} t0={wd(2, "مترو") + 0.2} text="حرم" dark size={36} />
      <Title T={T} t0={t0} sub="تصمیمِ اول" lines={["مترو تا حرم"]} />
    </AbsoluteFill>
  );
};

// 3 · shaded promenade with flowers + fountain (−30)
const S3: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[4]));
  const cam: Cam = { x: lerp(9.5, 8.6, k), y: lerp(6.5, 3.2, k), z: lerp(1.0, 1.15, k), cy: 960 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={{ pitch: 0 }} />
      <Label cam={cam} x={9} y={3.5} z={1.4} T={T} t0={wd(3, "فواره") + 0.2} text="⛲ پیاده‌راه" />
      <Title T={T} t0={t0} sub="تصمیمِ دوم" lines={["پیاده‌راهِ", "سایه‌دار"]} />
    </AbsoluteFill>
  );
};

// 4 · grass pitch (−30 → 0)
const S4: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[5]));
  const cam: Cam = { x: lerp(4.6, 4.3, k), y: lerp(14.6, 13.8, k), z: lerp(1.05, 1.18, k), cy: 980 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} />
      <Label cam={cam} x={4.2} y={11.3} z={0.7} T={T} t0={wd(4, "چمن") + 0.2} text="⚽ زمینِ چمنِ محل" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center" }}>
        <Chip p={pop(T, segEnd(4) - 0.1, 0.4)} dark>✅ بودجه تموم شد</Chip>
      </div>
      <Title T={T} t0={t0} sub="تصمیمِ سوم" lines={["زمینِ چمن"]} />
    </AbsoluteFill>
  );
};

// 5–6 · comments
const Comment: React.FC<{ T: number; t: number; h: string; text: string; top: number; fromLeft?: boolean; shake?: number }> = ({ T, t, h, text, top, fromLeft, shake = 0 }) => {
  const p = easeOut(prog(T, t, t + 0.4));
  if (p <= 0) return null;
  const sx = shake ? Math.sin(T * 40) * 8 * shake : 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, direction: "rtl", opacity: p, transform: `translateX(${(1 - p) * (fromLeft ? -140 : 140) + sx}px)` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, padding: "22px 26px", borderRadius: 28, background: "#fff", boxShadow: "0 16px 36px rgba(20,45,30,0.3)" }}>
        <div style={{ width: 70, height: 70, flex: "none", borderRadius: 35, background: C.deep, color: "#fff", fontFamily: FONT.black, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>{h.replace(/^[^a-z]+/i, "")[0].toUpperCase()}</div>
        <div>
          <div style={{ color: C.deep, opacity: 0.85 }}><Handle h={h} size={28} /></div>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep, lineHeight: 1.45 }}>{text}</div>
        </div>
      </div>
    </div>
  );
};
const S5: React.FC<SP> = ({ T, t0 }) => {
  const tb = wd(5, "داداش");
  const shake = 1 - prog(T, wd(5, "خسته"), wd(5, "خسته") + 0.6);
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={{ x: 8, y: 9, z: 0.8 + (T - t0) * 0.01, cy: 900 }} blur={7} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
      <Comment T={T} t={tb - 0.15} h="hoseinrokhnejad061" text="داداش دیگه اهواز بذار، خسته شدیم ما 😩" top={560} shake={T > wd(5, "خسته") ? shake : 0} />
      {T > wd(5, "لرزوند") - 0.1 && <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontSize: 110, transform: `scale(${pop(T, wd(5, "لرزوند") - 0.1, 0.4)}) rotate(${Math.sin(T * 30) * 6}deg)` }}>💔</div>}
      <Title T={T} t0={t0} sub="کامنتِ قسمتِ ۳" lines={["دلمون لرزید!"]} />
    </AbsoluteFill>
  );
};
const S6: React.FC<SP> = ({ T, t0 }) => (
  <AbsoluteFill>
    <CityLayer T={T} cam={{ x: 10, y: 6, z: 0.8 + (T - t0) * 0.01, cy: 900 }} blur={7} />
    <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
    <Comment T={T} t={wd(6, "تهران") - 0.25} h="a.khojastepanah" text="داداش تهران نمی‌رسه؟ 🥲" top={500} fromLeft />
    <Comment T={T} t={wd(6, "قشم") - 0.25} h="1396_radman" text="قشم لطفاً منو بذار 🙏" top={760} />
    <Title T={T} t0={t0} sub="کامنت‌های شما" lines={["همه منتظرن!"]} />
  </AbsoluteFill>
);

// 7 · next: Ahvaz
const S7: React.FC<SP> = ({ T, t0 }) => {
  const z = easeInOut(prog(T, t0, t0 + 1.4));
  const focus: [number, number] = [lerp(55.5, AHV[0], z), lerp(31, AHV[1], z)];
  const badge = pop(T, wd(7, "اهواز") - 0.05, 0.45);
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 6} focus={focus} zoom={lerp(1, 2.6, z)} dimOthers={z} hero="اهواز" />
      {badge > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `scale(${badge})`, padding: "12px 40px 20px", borderRadius: 24, background: C.roofD, border: "5px solid #fff", direction: "rtl", fontFamily: FONT.black, fontSize: 60, color: "#fff", whiteSpace: "nowrap" }}>
            🌴 قسمتِ ۵: اهواز
          </div>
        </div>
      )}
      <Title T={T} t0={t0} sub="قسمتِ بعد" lines={["می‌ریم", "اهواز!"]} />
    </AbsoluteFill>
  );
};

// 8 · question for Ahvaz
const S8: React.FC<SP> = ({ T, t0 }) => {
  const ws = ["پارک", "مترو", "بیمارستان", "سایه", "ورزشگاه", "؟"];
  const i = Math.floor(Math.max(0, T - t0 - 0.6) / 0.55) % ws.length;
  const end = easeOut(prog(T, END0, END0 + 0.35));
  const card = easeOut(prog(T, t0, t0 + 0.4));
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 8} focus={AHV} zoom={2.6} dimOthers={1} hero="اهواز" />
      <AbsoluteFill style={{ background: "rgba(28,58,42,0.35)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 520, direction: "rtl", opacity: card, transform: `translateY(${(1 - card) * 80}px)` }}>
        <div style={{ borderRadius: 32, background: "#FBFBF6", padding: "30px 34px 34px", boxShadow: "0 24px 50px rgba(20,45,30,0.35)" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 50, color: C.deep, lineHeight: 1.45 }}>اهواز اول چی لازم داره؟</div>
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 999, background: "#EEF2EA" }}>
            <span style={{ fontSize: 34 }}>✍️</span>
            <span style={{ fontFamily: FONT.black, fontSize: 44, color: C.roofD }}>{ws[i]}</span>
            <span style={{ width: 4, height: 44, background: C.deep, opacity: Math.sin(T * 10) > 0 ? 1 : 0 }} />
          </div>
        </div>
      </div>
      {end > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(28,58,42,${0.88 * end})` }}>
          <div style={{ transform: `scale(${lerp(1.3, 1, end)})`, opacity: end, textAlign: "center", direction: "rtl" }}>
            <div style={{ fontFamily: FONT.black, fontSize: 74, color: "#fff", lineHeight: 1.4 }}>اهواز چی لازم داره؟</div>
            <div style={{ display: "inline-block", marginTop: 30, padding: "14px 50px 22px", borderRadius: 999, background: C.lime, fontFamily: FONT.black, fontSize: 58, color: C.deep }}>کامنت کن 👇</div>
          </div>
        </AbsoluteFill>
      )}
      <Title T={T} t0={t0} sub="سؤالِ قسمتِ ۵" lines={["تو بگو!"]} />
    </AbsoluteFill>
  );
};

// ───────── edit ─────────
const SCENES: React.FC<SP>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8];
const CUT = SCENES.map((_, i) => (i === 0 ? 0 : segStart(i) - 0.12));
const endOf = (i: number) => (i < SCENES.length - 1 ? CUT[i + 1] : TOTAL);
type Kind = "cut" | "zoom" | "whip" | "slide" | "pull";
const KIND: Kind[] = ["cut", "zoom", "pull", "whip", "whip", "slide", "whip", "zoom", "slide"];
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
const LOOK = [1.2, wd(1, "حرم") + 0.4, wd(2, "حرم") + 0.8, wd(2, "چهل") + 0.3, wd(3, "فواره") + 0.6, wd(4, "چمن") + 0.6, segEnd(4) + 0.1, wd(5, "خسته") + 0.3, wd(6, "قشم") + 0.6, wd(7, "اهواز") + 0.6, wd(8, "کامنت"), TOTAL - 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame T={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V36: React.FC = () => (
  <>
    <Composition id="V36" component={Video} durationInFrames={V36_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v36/mix.wav" }} />
    <Composition id="V36-Silent" component={Video} durationInFrames={V36_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V36-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
