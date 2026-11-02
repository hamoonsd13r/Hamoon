// V31 · «شهردار یه‌روزه» قسمت ۲ — جواب کامنت‌های قسمت ۱ (uploads/comments-v30-tally.md). Same look as V30:
// map of all commenters → winner Sabzevar → vote card → clinic with voters' names → Shiraz/Tabriz/Bushehr quick cuts → joke comments → 8:8 tie → CTA Bandar Abbas vs Mashhad.
import React from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import iranJson from "./iran.json";
import { C, Cam, FONT, FPS, H, W, clamp, easeInOut, easeOut, fa, hash, lerp, pop, prog, segEnd, segStart, toScreen, wd, words } from "./kit";
import { City, CityState } from "./iso";

const END0 = segEnd(8) + 0.3;
const TOTAL = END0 + 2.2;
export const V31_FRAMES = Math.round(TOTAL * FPS);

const fontHandle = typeof document !== "undefined" ? delayRender("v31 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V31Black", "fonts/Vazirmatn-Black.ttf"], ["V31Bold", "fonts/Vazirmatn-Bold.ttf"], ["V31Semi", "fonts/Vazirmatn-SemiBold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

// a calm, already-fixed neighbourhood (episode 1 problems are solved)
const cityState = (T: number, o: Partial<CityState> = {}): CityState => ({
  T, carFade: 1, flow: 1.1, laneDraw: 0, busX: null, stops: 0, park: 0, civic: "none", civicS: 0, people: 1, ...o,
});

// ───────── shared pieces ─────────
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
    <span style={{ fontFamily: FONT.bold, fontSize: 28, color: dark ? C.deep2 : "#fff", opacity: 0.92, textShadow: dark ? "none" : "0 2px 8px rgba(20,50,30,0.5)" }}>قسمت ۲</span>
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


// ───────── Iran map with commenters ─────────
const IRAN = iranJson as [number, number][];
const COSL = Math.cos((32.4 * Math.PI) / 180);
const MK = 860 / ((63.4 - 44) * COSL);
const mapXY = (lon: number, lat: number, ox = 110, oy = 470): [number, number] => [ox + (lon - 44) * COSL * MK, oy + (39.8 - lat) * MK];
const IRAN_D = IRAN.map(([lo, la], i) => { const [x, y] = mapXY(lo, la, 0, 0); return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ") + "Z";
type Prov = "hz" | "kr" | "";
// [name, lon, lat, votes, province tag, one commenter]
const CITIES: [string, number, number, number, Prov, string][] = [
  ["سبزوار", 57.68, 36.21, 4, "kr", "fakhrizohreh64"], ["شیراز", 52.53, 29.59, 3, "", "bardiarx"], ["مشهد", 59.6, 36.3, 3, "kr", "e9292941"], ["بوشهر", 50.84, 28.97, 3, "", "arsin____7____"],
  ["تهران", 51.39, 35.69, 3, "", "aria_azizi2015"], ["بندرعباس", 56.27, 27.18, 2, "hz", "bat.524233"], ["پارسیان", 53.04, 27.2, 2, "hz", "fahime_khoramgah"], ["میناب", 57.08, 27.15, 2, "hz", "sepehr_mohebi21"],
  ["زنجان", 48.48, 36.67, 2, "", "m.bakw72"], ["کرج", 50.99, 35.84, 2, "", "amirali._lu"], ["ارومیه", 45.07, 37.55, 2, "", "taha518123"], ["بجنورد", 57.33, 37.47, 2, "", "smyl_shrfty"],
  ["همدان", 48.51, 34.8, 1, "", "l.moradi.20003"], ["لامرد", 53.18, 27.34, 1, "", "hosin_76651"], ["تنکابن", 50.88, 36.82, 1, "", "ava._.chakani"], ["امیدیه", 49.7, 30.76, 1, "", "fatimaroosta1"],
  ["شهر قدس", 51.1, 35.71, 1, "", "royamohammadi1367"], ["اسفراین", 57.5, 37.07, 1, "", "a.noroozi306"], ["بندرترکمن", 54.08, 36.9, 1, "", "amirali8.11"], ["خشت", 51.33, 29.56, 1, "", "mohammadtaha64474"],
  ["اراک", 49.69, 34.09, 1, "", "ghorbani.3044"], ["گچساران", 50.8, 30.36, 1, "", "m.reza1392sina"], ["قم", 50.88, 34.64, 1, "", "amir406267"], ["بیرجند", 59.22, 32.87, 1, "", "mhamd9927009"],
  ["قشم", 56.27, 26.95, 1, "hz", "mahras58"], ["ارزوئیه", 56.36, 28.45, 1, "", "arynmny13"], ["رودان", 57.29, 27.44, 1, "hz", "mhmdjwdsl574"], ["مشگین‌شهر", 47.67, 38.4, 1, "", "hm_71.72"],
  ["رشت", 49.58, 37.28, 1, "", "ehsan187700"], ["تبریز", 46.29, 38.08, 1, "", "farhan._az"], ["ایرانشهر", 60.69, 27.2, 1, "", "m97642038"], ["سراوان", 62.33, 27.37, 1, "", "moez.sepahi"],
  ["پاکدشت", 51.68, 35.48, 1, "", "alireza.rashedi11"], ["بروجرد", 48.75, 33.9, 1, "", "kamyar22002200"], ["کرمانشاه", 47.07, 34.31, 1, "", "sorena.veisy"], ["شاهرود", 54.98, 36.42, 1, "", "armin_2040_"],
  ["دزفول", 48.4, 32.38, 1, "", "ra_dm_an"], ["بوئین‌زهرا", 50.06, 35.77, 1, "", "tahamkhani88"], ["اهواز", 48.67, 31.32, 1, "", "m.h.iop"], ["فیروزآباد", 52.57, 28.84, 1, "", "taha_1.m"],
  ["لنگرود", 50.15, 37.2, 1, "", "amirali_dehbanpour_"], ["کردکوی", 54.11, 36.79, 1, "", "yasiniowa73"], ["آبادان", 48.3, 30.34, 1, "", "javaad_beigi"], ["مسجدسلیمان", 49.29, 31.94, 1, "", "tida.taghipour"],
  ["قزوین", 50, 36.27, 1, "", "amirhafez73005"], ["کاشمر", 58.46, 35.24, 1, "kr", "mahdit_57"], ["مرودشت", 52.8, 29.87, 1, "", "hos_in1096"], ["کنگان", 52.06, 27.84, 1, "", "benyamin_ghasemi_1387"],
  ["گرگان", 54.43, 36.84, 1, "", "amer_mmizade"],
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
          <pattern id="relief31" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.4" fill="#A9AE72" opacity="0.55" />
            <circle cx="8" cy="7" r="1" fill="#E3E6B8" opacity="0.6" />
          </pattern>
        </defs>
        <g transform="translate(110 470)">
          <path d={IRAN_D} fill="#7E9467" transform="translate(0 16)" />
          <path d={IRAN_D} fill="#CBD08E" />
          <path d={IRAN_D} fill="url(#relief31)" />
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
        const s = ((0.55 + v * 0.14) / Math.sqrt(sc)) * (n === hero ? 1.6 : 1);
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

// 0 · «بیشتر از هفتاد نفر، از نزدیکِ پنجاه تا شهر»
const S0: React.FC<SP> = ({ T, t0 }) => {
  const top = ORDER.slice(0, 18).map((i) => CITIES[i]);
  const tA = wd(0, "هفتاد"), tB = wd(0, "پنجاه");
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0} zoom={1}>
      {/* commenter handles flash next to random pins */}
      {top.map(([n, lo, la, , , h], k) => {
        const t = 1.2 + k * 0.33;
        const q = prog(T, t, t + 0.9);
        if (q <= 0 || q >= 1) return null;
        const [x, y] = mapXY(lo, la);
        const a = Math.sin(q * Math.PI);
        return (
          <div key={n} style={{ position: "absolute", left: x + 26, top: y - 96, opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
            <div style={{ padding: "4px 14px 8px", borderRadius: 12, background: "rgba(28,58,42,0.92)", color: "#fff", whiteSpace: "nowrap" }}>
              <Handle h={h} size={24} /> <span style={{ fontFamily: FONT.black, fontSize: 24, color: C.lime }}>{n}</span>
            </div>
          </div>
        );
      })}
      </MapBase>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", gap: 20 }}>
        <Chip p={pop(T, tA, 0.4)} dark>👥 +{fa(70)} نفر</Chip>
        <Chip p={pop(T, tB, 0.4)} dark>📍 {fa(50)} شهر</Chip>
      </div>
      <Title T={T} t0={t0} sub="جواب کامنت‌ها" lines={["شما", "جواب دادین!"]} />
    </AbsoluteFill>
  );
};

// 1 · the winner: Sabzevar
const SABZ: [number, number] = [57.68, 36.21];
const S1: React.FC<SP> = ({ T, t0 }) => {
  const tW = wd(1, "سبزوار");
  const z = easeInOut(prog(T, t0, tW));
  const zoom = lerp(1, 2.3, z);
  const focus: [number, number] = [lerp(53, SABZ[0], z), lerp(32.5, SABZ[1], z)];
  const win = pop(T, tW, 0.5);
  const voters = ["fakhrizohreh64", "9839dd", "mohammad1734130", "yasin.dowlat91"];
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 3} focus={focus} zoom={zoom} dimOthers={z} hero="سبزوار" />
      {/* drum-roll ring then crown */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {T < tW && [0, 1, 2].map((k) => {
          const q = ((T - t0) * 1.6 + k / 3) % 1;
          return <div key={k} style={{ position: "absolute", left: W / 2 - 160 * q, top: 860 - 100 * q, width: 320 * q, height: 200 * q, borderRadius: "50%", border: `5px solid ${C.deep}`, opacity: (1 - q) * 0.6 }} />;
        })}
      </AbsoluteFill>
      {win > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ transform: `scale(${win})`, padding: "12px 40px 20px", borderRadius: 24, background: C.roofD, border: "5px solid #E9F5E0", direction: "rtl", fontFamily: FONT.black, fontSize: 64, color: "#fff", whiteSpace: "nowrap" }}>
            🥇 سبزوار <span style={{ color: C.lime, fontSize: 44 }}>({fa(4)} کامنت)</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: 900, marginTop: 300 }}>
            {voters.map((h, k) => <Chip key={h} p={pop(T, tW + 0.35 + k * 0.12, 0.35)} size={30}><Handle h={h} /></Chip>)}
          </div>
        </div>
      )}
      <Title T={T} t0={t0} sub="بیشترین کامنت" lines={["برنده‌ی", "این قسمت"]} />
    </AbsoluteFill>
  );
};

// 2 · your first vote: clinic
const S2: React.FC<SP> = ({ T, t0 }) => {
  const cam: Cam = { x: 9, y: 9, z: 0.78 + (T - t0) * 0.01, cy: 900 };
  const card = easeOut(prog(T, t0, t0 + 0.45));
  const tC = wd(2, "درمانگاه");
  const rows: [string, string, number][] = [["🏥", "درمانگاه", 7], ["🏟️", "ورزشگاه", 2], ["🚌", "خط برقی", 2], ["🌳", "پارک", 1], ["🏫", "مدرسه", 1]];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} blur={7} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 470, transform: `translateY(${(1 - card) * 700}px)` }}>
        <div style={{ borderRadius: 36, background: "#FBFBF6", padding: "30px 36px 34px", boxShadow: "0 30px 60px rgba(20,45,30,0.35)", direction: "rtl" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 46, color: C.deep, marginBottom: 8 }}>چی بسازیم؟ رأیِ شما</div>
          {rows.map(([ic, n, v], i) => {
            const g = easeOut(prog(T, t0 + 0.3 + i * 0.1, t0 + 1.1 + i * 0.1));
            const on = i === 0 ? easeOut(prog(T, tC - 0.1, tC + 0.25)) : 0;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
                <span style={{ fontSize: 44, width: 56 }}>{ic}</span>
                <span style={{ fontFamily: FONT.black, fontSize: 38, color: C.deep, width: 190 }}>{n}</span>
                <div style={{ flex: 1, height: 46, borderRadius: 23, background: "#E7ECE2", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(v / 7) * 100 * g}%`, borderRadius: 23, background: i === 0 ? (on > 0.5 ? C.roofD : C.roof) : "#A9C79A",
                    transform: `scaleY(${1 + on * 0.12})` }} />
                </div>
                <span style={{ fontFamily: FONT.black, fontSize: 40, color: C.deep, width: 40, textAlign: "center" }}>{fa(Math.round(v * g))}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Title T={T} t0={t0} sub="با فاصله" lines={["رأیِ اول"]} />
    </AbsoluteFill>
  );
};

// 3 · clinic in Sabzevar with the voters' names
const CLINIC_VOTERS = ["a.noroozi306", "amirali._lu", "amirrezaa_mohammadi", "mehdi_klath", "behnamimahya", "nirvan.mehrabi", "hanighasemi85"];
const S3: React.FC<SP> = ({ T, t0 }) => {
  const k = easeOut(prog(T, t0, CUT[4]));
  const cam: Cam = { x: 4.6 + k * 0.4, y: 14.2 - k * 0.3, z: 1.12 + k * 0.08, cy: 1000 };
  const tB = wd(3, "درمانگاه"), tN = wd(3, "اسم");
  const pos: [number, number, number][] = [[0.8, 10.6, 2.9], [5.4, 10.4, 2.6], [7.4, 12.6, 2.3], [7.6, 15.4, 2.0], [1.0, 16.8, 1.8], [-1.2, 13.6, 2.2], [4.4, 18.2, 1.6]];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={{ civic: "clinic", civicS: pop(T, tB - 0.05, 0.5) }} />
      <Label cam={cam} x={3.9} y={12.2} z={2.4} T={T} t0={tB + 0.3} text="درمانگاهِ سبزوار" />
      {CLINIC_VOTERS.map((h, i) => {
        const p = pop(T, tN + i * 0.14, 0.35);
        if (p <= 0) return null;
        const [x, y, z] = pos[i];
        const [sx, sy] = toScreen(cam, x, y, z);
        return (
          <div key={h} style={{ position: "absolute", left: clamp(sx, 170, W - 170), top: sy + Math.sin(T * 2.6 + i) * 6, transform: `translate(-50%, -50%) scale(${p})` }}>
            <div style={{ padding: "4px 16px 8px", borderRadius: 14, background: "#fff", color: C.deep, boxShadow: "0 6px 16px rgba(20,45,30,0.3)", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 22 }}>💚 </span><Handle h={h} size={26} />
            </div>
          </div>
        );
      })}
      <Title T={T} t0={t0} sub="ساخته‌شده با رأیِ شما" lines={["درمانگاهِ", "سبزوار"]} />
    </AbsoluteFill>
  );
};

// 4 · «ولی بقیه‌ی شهرها هم جا نموندن» — pull back to the full map, pins pulse
const S4: React.FC<SP> = ({ T, t0 }) => {
  const z = easeOut(prog(T, t0, t0 + 0.8));
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 6} zoom={lerp(1.3, 1, z)}>
        {[0, 1, 2].map((k) => {
          const [lo, la] = [[52.53, 29.59], [46.29, 38.08], [50.84, 28.97]][k];
          const [x, y] = mapXY(lo, la);
          const q = ((T - t0) * 1.4 + k * 0.33) % 1;
          return <div key={k} style={{ position: "absolute", left: x - 50 * q, top: y - 50 * q, width: 100 * q, height: 100 * q, borderRadius: "50%", border: `5px solid ${C.deep}`, opacity: (1 - q) * 0.8 }} />;
        })}
      </MapBase>
      <Title T={T} t0={t0} sub="بقیه‌ی شهرها" lines={["جا نموندن!"]} />
    </AbsoluteFill>
  );
};

// 5 · quick cuts: Shiraz park · Tabriz e-bus · Bushehr stadium
const S5: React.FC<SP> = ({ T }) => {
  const ts = [CUT[5], wd(5, "تبریز") - 0.08, wd(5, "بوشهر") - 0.08];
  const i = T < ts[1] ? 0 : T < ts[2] ? 1 : 2;
  const lt = T - ts[i];
  const punch = 1 + 0.08 * (1 - easeOut(clamp(lt / 0.3)));
  const info = [
    { city: "شیراز", what: "پارکِ کنارِ حافظیه", h: "taha71955", st: { park: clamp(lt / 1.2) } as Partial<CityState>, cam: { x: 14.2, y: 4.4, z: 1.05 }, lab: [14, 1.1, 0.3] },
    { city: "تبریز", what: "خطِ برقی", h: "farhan._az", st: { laneDraw: clamp(lt / 0.6), busX: -3 + lt * 3.2, stops: 1 } as Partial<CityState>, cam: { x: 3 + lt * 1.6, y: 9.6, z: 1.15 }, lab: [-1 + lt * 3.2, 8.5, 0.9] },
    { city: "بوشهر", what: "ورزشگاه", h: "hanighasemi85", st: { civic: "stadium", civicS: pop(T, ts[2] + 0.02, 0.4) } as Partial<CityState>, cam: { x: 4.4, y: 14, z: 1.12 }, lab: [3.6, 12.2, 2.6] },
  ][i];
  const cam: Cam = { x: info.cam.x + lt * 0.15, y: info.cam.y - lt * 0.1, z: info.cam.z * punch + lt * 0.02, cy: 980 };
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} st={info.st} />
      <Label cam={cam} x={info.lab[0]} y={info.lab[1]} z={info.lab[2]} T={T} t0={ts[i] + 0.1} text={info.what} />
      <div style={{ position: "absolute", left: 60, top: 300 }}>
        <Chip p={pop(T, ts[i] + 0.2, 0.35)} size={30}><Handle h={info.h} /></Chip>
      </div>
      <Title T={T} t0={ts[i]} sub="پیشنهادِ شما" lines={[info.city]} />
    </AbsoluteFill>
  );
};

// 6 · joke comments
const S6: React.FC<SP> = ({ T, t0 }) => {
  const cam: Cam = { x: 9, y: 9, z: 0.8 + (T - t0) * 0.01, cy: 900 };
  const cards: [string, string, number][] = [
    ["amirrezaa_mohammadi", "اول مدرسه، درمانگاه، مالیات", wd(6, "مالیات") - 0.15],
    ["beniz_2", "فقط استانداری قبول میکنم", wd(6, "استانداری") - 0.25],
    ["sadegh.firoozbakht1366", "تا شو میدادم شهرداری رو خراب میکردم 😂", wd(6, "استانداری") + 0.45],
  ];
  return (
    <AbsoluteFill>
      <CityLayer T={T} cam={cam} blur={7} />
      <AbsoluteFill style={{ background: "rgba(40,80,60,0.25)" }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 480, direction: "rtl" }}>
        {cards.map(([h, t, t1], i) => {
          const p = easeOut(prog(T, t1, t1 + 0.35));
          if (p <= 0) return null;
          return (
            <div key={h} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 22, padding: "20px 24px", borderRadius: 26, background: "#fff", opacity: p,
              transform: `translateX(${(1 - p) * 120}px) rotate(${(i % 2 ? -1 : 1) * (1 - p) * 4}deg)`, boxShadow: "0 14px 34px rgba(20,45,30,0.3)" }}>
              <div style={{ width: 64, height: 64, flex: "none", borderRadius: 32, background: [C.roofD, C.deep, C.roof][i], color: "#fff", fontFamily: FONT.black, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{h[0].toUpperCase()}</div>
              <div>
                <div style={{ color: C.deep, opacity: 0.85 }}><Handle h={h} size={26} /></div>
                <div style={{ fontFamily: FONT.black, fontSize: 40, color: C.deep, lineHeight: 1.45 }}>{t}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* floating laughs */}
      {Array.from({ length: 8 }, (_, i) => {
        const t1 = segStart(6) + 0.2 + i * 0.5;
        const q = prog(T, t1, t1 + 1.8);
        if (q <= 0 || q >= 1) return null;
        return <div key={i} style={{ position: "absolute", left: 80 + hash(i) * 900, top: 1250 - q * 800, fontSize: 64, opacity: Math.sin(q * Math.PI), transform: `rotate(${(hash(i + 3) - 0.5) * 40}deg)` }}>😂</div>;
      })}
      <Title T={T} t0={t0} sub="کامنت‌های خاص" lines={["پیشنهادِ ویژه 😂"]} />
    </AbsoluteFill>
  );
};

// 7 · the tie: Hormozgan 8 : 8 Khorasan Razavi
const S7: React.FC<SP> = ({ T, t0 }) => {
  const g = easeInOut(prog(T, wd(7, "هرمزگان") - 0.2, wd(7, "خراسان") + 0.3));
  const tN = wd(7, "هشت");
  const n = Math.round(8 * easeOut(prog(T, tN - 0.1, tN + 0.6)));
  const eq = pop(T, wd(7, "مساوی"), 0.45);
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 6} focus={[55, 33.5]} zoom={1.05} dimOthers={g} prov={g} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 410, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, direction: "rtl", opacity: g }}>
        <div style={{ flex: 1, padding: "14px 10px 20px", borderRadius: 26, background: "#2F8FA6", color: "#fff", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 38 }}>هرمزگان</div>
          <div style={{ fontFamily: FONT.black, fontSize: 84, lineHeight: 1.1 }}>{fa(n)}</div>
        </div>
        <div style={{ fontFamily: FONT.black, fontSize: 70, color: "#fff", transform: `scale(${1 + eq * 0.25})`, textShadow: "0 4px 14px rgba(20,45,30,0.5)" }}>=</div>
        <div style={{ flex: 1, padding: "14px 10px 20px", borderRadius: 26, background: "#C9962A", color: "#fff", textAlign: "center" }}>
          <div style={{ fontFamily: FONT.black, fontSize: 38 }}>خراسانِ رضوی</div>
          <div style={{ fontFamily: FONT.black, fontSize: 84, lineHeight: 1.1 }}>{fa(n)}</div>
        </div>
      </div>
      {eq > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 610, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-6deg) scale(${eq})`, padding: "6px 30px 12px", borderRadius: 14, background: C.red, color: "#fff", fontFamily: FONT.black, fontSize: 44 }}>مساوی!</div>
        </div>
      )}
      <Title T={T} t0={t0} sub="یه چیزِ جالب" lines={["رأیِ استان‌ها"]} />
    </AbsoluteFill>
  );
};

// 8 · CTA: Bandar Abbas or Mashhad?
const S8: React.FC<SP> = ({ T, t0 }) => {
  const tA = wd(8, "بندرعباس"), tB = wd(8, "مشهد"), tC = wd(8, "کامنت");
  const end = easeOut(prog(T, END0, END0 + 0.35));
  const tap = (t: number) => { const q = prog(T, t, t + 0.4); return q > 0 && q < 1 ? 1 - Math.sin(q * Math.PI) * 0.08 : 1; };
  const Opt: React.FC<{ t: number; name: string; ic: string; col: string }> = ({ t, name, ic, col }) => {
    const p = pop(T, t - 0.05, 0.45);
    return (
      <div style={{ flex: 1, transform: `scale(${p * tap(t + 0.5)})`, padding: "26px 10px 30px", borderRadius: 32, background: col, color: "#fff", textAlign: "center", boxShadow: "0 18px 40px rgba(20,45,30,0.35)", border: "5px solid #fff" }}>
        <div style={{ fontSize: 96 }}>{ic}</div>
        <div style={{ fontFamily: FONT.black, fontSize: 52 }}>{name}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <BG />
      <MapBase T={T} t0={t0 - 8} focus={[55, 33.5]} zoom={1.05} dimOthers={1} prov={1} />
      <AbsoluteFill style={{ background: "rgba(28,58,42,0.35)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 560, display: "flex", alignItems: "center", gap: 20, direction: "rtl" }}>
        <Opt t={tA} name="بندرعباس" ic="🌊" col="#2F8FA6" />
        <div style={{ fontFamily: FONT.black, fontSize: 60, color: "#fff", opacity: clamp((T - tA) * 3) }}>یا</div>
        <Opt t={tB} name="مشهد" ic="🕌" col="#C9962A" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center" }}>
        <Chip p={pop(T, tC, 0.4)} size={44}>👇 تو کامنت بنویس</Chip>
      </div>
      {end > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(28,58,42,${0.88 * end})` }}>
          <div style={{ transform: `scale(${lerp(1.3, 1, end)})`, opacity: end, textAlign: "center", direction: "rtl" }}>
            <div style={{ fontFamily: FONT.black, fontSize: 76, color: "#fff", lineHeight: 1.4 }}>قسمتِ ۳ کجا بریم؟</div>
            <div style={{ fontFamily: FONT.black, fontSize: 64, color: C.lime, lineHeight: 1.5 }}>بندرعباس یا مشهد</div>
            <div style={{ display: "inline-block", marginTop: 30, padding: "14px 50px 22px", borderRadius: 999, background: C.lime, fontFamily: FONT.black, fontSize: 58, color: C.deep }}>کامنت کن 👇</div>
          </div>
        </AbsoluteFill>
      )}
      <Title T={T} t0={t0} sub="سؤالِ قسمتِ ۳" lines={["کجا بریم؟"]} />
    </AbsoluteFill>
  );
};

// ───────── edit ─────────
const SCENES: React.FC<SP>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8];
const CUT = SCENES.map((_, i) => (i === 0 ? 0 : segStart(i) - 0.12));
const endOf = (i: number) => (i < SCENES.length - 1 ? CUT[i + 1] : TOTAL);
type Kind = "cut" | "zoom" | "whip" | "slide" | "pull";
const KIND: Kind[] = ["cut", "zoom", "slide", "zoom", "pull", "whip", "slide", "pull", "zoom"];
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
const LOOK = [1.6, wd(0, "پنجاه") + 0.5, wd(1, "سبزوار") + 0.9, wd(2, "درمانگاه") + 0.4, wd(3, "اسم") + 1.2, CUT[4] + 1.2, wd(5, "شیراز") + 0.6, wd(5, "تبریز") + 0.6, wd(5, "بوشهر") + 0.7, wd(6, "استانداری") + 1.3, wd(7, "مساوی") + 0.4, wd(8, "کامنت") + 0.3, TOTAL - 0.5];
const Look: React.FC<{ times: number[] }> = ({ times }) => <Frame T={times[Math.min(useCurrentFrame(), times.length - 1)]} />;

export const V31: React.FC = () => (
  <>
    <Composition id="V31" component={Video} durationInFrames={V31_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v31/mix.wav" }} />
    <Composition id="V31-Silent" component={Video} durationInFrames={V31_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V31-Look" component={Look} durationInFrames={1} fps={FPS} width={W} height={H}
      defaultProps={{ times: LOOK }} calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
  </>
);
