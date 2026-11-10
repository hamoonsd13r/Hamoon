// V42 · Instagram reel 9:16 (~47 s): «هفده سال، پنج موج» in one beat per wave. Same kit and footage as the
// YouTube film; lines 1, 7, 8, 9 reuse the film's narration takes. All times come from vo-reel.json.
import React from "react";
import { AbsoluteFill, Composition, Freeze, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo-reel.json";
import capJson from "./captions-reel.json";
import {
  FPS, INK, PAPER, MUTED, CH, MAP, YEARS, timing, type VO, clamp, prog, lerp, easeOut, easeInOut, backOut, kick, noise, faNum, useT,
  Grain, Vignette, Scene, Photo, Clip, Phone, SourceTag, Big, Rise, Chip, Src, Counter, IranMap, Pin, Signal, Ribbon, IcFuel,
} from "./kit";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const W = 1080, H = 1920;
export const RTOTAL = V.total + 0.8;
export const REEL_FRAMES = Math.round(RTOTAL * FPS);
const c = (t: number) => t - 0.08;
const hash2 = (n: number) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

const levelAt = (T: number) => {
  const K: [number, number][] = [[0, 1], [wd(4, "اینترنت"), 1], [wd(4, "خاموش"), 0.02], [E(4) + 0.2, 0.02], [S(5), 0.8], [wd(6, "خاموشی") - 0.1, 0.8], [wd(6, "خاموشی") + 0.3, 0.02], [wd(8, "بالا"), 0.02], [wd(8, "بالا") + 0.4, 0.2], [S(9), 0]];
  for (let i = 1; i < K.length; i++) if (T < K[i][0]) return lerp(K[i - 1][1], K[i][1], easeInOut(prog(T, K[i - 1][0], K[i][0])));
  return 0;
};
const YearTag: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const u = backOut(prog(t, 0, 0.35)), Y = YEARS[k];
  return (
    <div style={{ position: "absolute", top: 340, width: "100%", textAlign: "center", transform: `scale(${lerp(1.4, 1, clamp(u))})`, opacity: clamp(u * 2) }}>
      <div style={{ fontFamily: "V42Black", fontSize: 220, color: Y.c, lineHeight: 1, textShadow: `0 0 60px ${Y.c}66, 0 10px 40px #000` }}>{Y.y}</div>
    </div>
  );
};
const Grad: React.FC<{ top?: number; bottom?: number }> = ({ top = 0.75, bottom = 0.85 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,11,13,${top}) 0%, rgba(10,11,13,0) 32%, rgba(10,11,13,0) 55%, rgba(10,11,13,${bottom}) 100%)` }} />
);

const R1: React.FC = () => {
  const t = useT(), t5 = wd(1, "پنج") - 0.08, tK = wd(1, "یک") - 0.08;
  const ids = ["p09a", "p17c", "p19d", "v22e", "v26d"];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {t < tK + 0.2 && ids.map((id, i) => {
        const u = easeOut(prog(t, t5 + i * 0.08, t5 + i * 0.08 + 0.35));
        return (
          <div key={id} style={{ position: "absolute", left: 0, right: 0, top: i * (H / 5), height: H / 5 + 2, overflow: "hidden", transform: `translateX(${(1 - u) * (i % 2 ? -100 : 100)}%)`, borderBottom: "3px solid #000" }}>
            {id.startsWith("v") ? <Clip id={id} start={3} /> : <Photo id={id} t={t} dur={3} z0={1.1} z1={1.2} tag={false} grade={0.55} tint={YEARS[i].c} />}
          </div>
        );
      })}
      {t < tK + 0.2 && <AbsoluteFill style={{ background: "rgba(10,11,13,0.45)" }} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - prog(t, tK - 0.1, tK + 0.15) }}>
        <Big size={190} style={{ transform: `scale(${1 + 0.04 * t})` }}>هفده سال</Big>
        <div style={{ opacity: prog(t, t5, t5 + 0.2) }}><Big size={120}>پنج بار</Big></div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: prog(t, tK - 0.05, tK + 0.2) }}>
        <IranMap w={900} draw={easeInOut(prog(t, tK - 0.05, tK + 0.8))} />
        <div style={{ position: "absolute", top: 1330 }}><Big size={96}>یک کشور</Big></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const R2: React.FC = () => {
  const t = useT(), a = c(S(2)), tQ = wd(2, "رأی") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo id="p09d" t={t} dur={4} z0={1.05} z1={1.2} />
      <Grad />
      <YearTag k={0} t={t} />
      <div style={{ position: "absolute", top: 900, width: "100%", textAlign: "center", opacity: prog(t, tQ - 0.1, tQ + 0.1) }}>
        <div style={{ display: "inline-block", transform: `rotate(-3deg) scale(${lerp(1.4, 1, easeOut(prog(t, tQ - 0.1, tQ + 0.25)))})`, padding: "16px 44px", background: "rgba(239,233,221,0.95)", borderRadius: 8 }}>
          <div style={{ fontFamily: "V42Slogan", fontSize: 120, color: "#1a6b35", direction: "rtl" }}>رأیِ من کجاست؟</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const R3: React.FC = () => {
  const t = useT(), a = c(S(3)), t80 = wd(3, "هشتاد") - a;
  const keys = Object.keys(MAP.cities);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <YearTag k={1} t={t} />
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center" }}><span style={{ fontFamily: "V42Slogan", fontSize: 110, color: PAPER }}>«مرگ بر گرونی»</span></div>
      <div style={{ position: "absolute", left: 40, top: 760 }}>
        <IranMap w={1000}>
          {keys.map((k, i) => { const [x, y] = MAP.cities[k], d = Math.hypot(x - MAP.cities.mashhad[0], y - MAP.cities.mashhad[1]); const t0 = 0.4 + (d / 900) * (t80 - 0.3); const on = prog(t, t0, t0 + 0.2); return <circle key={k} cx={x} cy={y} r={8 * (0.5 + 0.5 * on)} fill={CH.c96} opacity={on} />; })}
          <Pin city="mashhad" t={t} t0={0.1} color={CH.c96} r={12} />
        </IranMap>
      </div>
      <div style={{ position: "absolute", top: 1560, width: "100%", display: "flex", justifyContent: "center", alignItems: "baseline", gap: 20, direction: "rtl", opacity: prog(t, t80 - 0.2, t80) }}>
        <span style={{ fontFamily: "V42Bold", fontSize: 56, color: PAPER }}>بیش از</span><Counter value={80} t={t} t0={t80 - 0.2} dur={0.7} size={150} color={CH.c96} /><span style={{ fontFamily: "V42Bold", fontSize: 56, color: PAPER }}>شهر</span>
      </div>
    </AbsoluteFill>
  );
};
const R4: React.FC = () => {
  const t = useT(), a = c(S(4)), t3 = wd(4, "سه") - a, tI = wd(4, "اینترنت") - a, tO = wd(4, "خاموش") - a;
  const p = Math.round(lerp(1000, 3000, easeInOut(prog(t, t3 - 0.6, t3 + 0.3))) / 50) * 50;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * prog(t, tI - 0.2, tI + 0.2) }}><Photo id="p19d" t={t} dur={6} z0={1.08} z1={1.2} grade={0.7} /></div>
      <Grad />
      <YearTag k={2} t={t} />
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: 1 - prog(t, tI - 0.2, tI) }}>
        <IcFuel s={130} c={CH.c98} />
        <div style={{ fontFamily: "V42Black", fontSize: 150, color: CH.c98, textShadow: "0 8px 30px #000" }}>{faNum(p)}</div>
        <div style={{ fontFamily: "V42Black", fontSize: 120, color: PAPER, opacity: prog(t, t3, t3 + 0.2) }}>×۳</div>
      </div>
      <div style={{ position: "absolute", top: 760, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 40, opacity: prog(t, tI - 0.1, tI + 0.2) }}>
        <Signal level={levelAt(t + a)} s={4} label={false} />
        <Big size={110} color={t > tO ? CH.c04 : PAPER}>{t > tO ? "یک هفته خاموش" : "اینترنت"}</Big>
      </div>
    </AbsoluteFill>
  );
};
const R5: React.FC = () => {
  const t = useT(), a = c(S(5)), tZ = wd(5, "زن") - a, tL = wd(5, "زندگی") - a, tA = wd(5, "آزادی") - a, tJ = wd(5, "ژینا") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Clip id="v22a" start={1} />
      <SourceTag id="v22a" side="right" />
      <Grad top={0.8} bottom={0.9} />
      <YearTag k={3} t={t} />
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", opacity: prog(t, tJ - 0.1, tJ + 0.2) * (1 - prog(t, tZ - 0.2, tZ)) }}><Big size={96}>ژینا مهسا امینی</Big></div>
      {[["زن،", tZ], ["زندگی،", tL], ["آزادی", tA]].map(([w, t0], i) => {
        const u = backOut(prog(t, (t0 as number) - 0.08, (t0 as number) + 0.25));
        return <div key={i} style={{ position: "absolute", top: 560 + i * 190, width: "100%", textAlign: "center", fontFamily: "V42Slogan", fontSize: 180, color: i === 2 ? CH.c01 : PAPER, opacity: clamp(u * 2), transform: `scale(${lerp(1.5, 1, clamp(u))})`, textShadow: "0 10px 60px #000", direction: "rtl" }}>{w}</div>;
      })}
    </AbsoluteFill>
  );
};
const R6: React.FC = () => {
  const t = useT(), a = c(S(6)), tR = wd(6, "ریال") - a, tK = wd(6, "خاموشی") - a, tB = wd(6, "خونین‌ترین") - a;
  const off = prog(t, tK - 0.05, tK + 0.15);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.85 * off }}><Clip id={t < tR + 0.6 ? "v26a" : "v26g"} start={t < tR + 0.6 ? 0 : 2} /></div>
      <Grad />
      <YearTag k={4} t={t} />
      <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", opacity: prog(t, tR - 0.2, tR) * (1 - off) }}><Chip color={CH.c04} size={64} t={t} t0={tR - 0.2}>سقوطِ ریال</Chip></div>
      <div style={{ position: "absolute", top: 760, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 30, opacity: off }}>
        <Signal level={levelAt(t + a)} s={4} label={false} />
        <Big size={120} color={PAPER}>خاموشیِ کامل</Big>
      </div>
      <div style={{ position: "absolute", top: 1100, width: "100%", textAlign: "center", opacity: prog(t, tB - 0.1, tB + 0.3) }}><Big size={96} color={CH.c04}>خونین‌ترین روزها</Big></div>
    </AbsoluteFill>
  );
};
const R7: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><Signal level={lerp(0.6, 0, easeInOut(prog(t, 0, 1.6)))} s={5} label={false} /></AbsoluteFill>
      <div style={{ position: "absolute", top: 1180, width: "100%" }}><Rise text="هر بار، صدا رو قطع کردن" t={t} t0={0.1} size={76} color={MUTED} font="V42Bold" /></div>
    </AbsoluteFill>
  );
};
const ALL = ["v26g", "v22a", "v26e", "v22b", "v26f", "v26c", "v26b", "v26h", "v26i"];
const R8: React.FC = () => {
  const t = useT(), a = c(S(8)), tP = wd(8, "گوشیش") - a;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {ALL.map((id, i) => {
        const col = i % 3, row = Math.floor(i / 3), t0 = i === 0 ? 0.1 : 0.1 + (tP + 0.5) * (0.15 + 0.85 * hash2(i));
        const u = easeOut(prog(t, t0, t0 + 0.45));
        return <Phone key={id} id={id} x={W - 190 - col * 350} y={420 + row * 560 + (1 - u) * 50} w={250} start={2 + i} o={u} dim={0.12} rec={i === 0} />;
      })}
      <Vignette k={0.85} />
    </AbsoluteFill>
  );
};
const R9: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <Rise text="فرزندِ ایران" t={t} t0={0.05} size={110} />
      <Rise text="و جان‌فدای میهن" t={t} t0={0.35} size={110} />
    </AbsoluteFill>
  );
};
const R10: React.FC = () => {
  const t = useT(), u = backOut(prog(t, 0.05, 0.45));
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center", gap: 50 }}>
      <div style={{ width: 300, height: 210, borderRadius: 50, background: "#E62117", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.7 + 0.3 * clamp(u)})`, opacity: clamp(u * 2), boxShadow: "0 20px 60px rgba(230,33,23,0.4)" }}>
        <div style={{ width: 0, height: 0, borderTop: "46px solid transparent", borderBottom: "46px solid transparent", borderLeft: "76px solid #fff", marginLeft: 18 }} />
      </div>
      <Big size={92}>نسخه‌ی کامل</Big>
      <div style={{ fontFamily: "V42Bold", fontSize: 54, color: MUTED, direction: "rtl" }}>مستندِ ۴ دقیقه‌ای · یوتیوب</div>
      <div style={{ position: "absolute", bottom: 500, width: 700 }}><Ribbon w={700} pos={4} s={1.1} /></div>
    </AbsoluteFill>
  );
};

const SC: React.FC[] = [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10];
type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const cap = CAPS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!cap || [1, 7, 8, 9, 10].includes(cap.line)) return null;
  const u = easeOut(prog(T, cap.s - 0.05, cap.s + 0.12));
  return (
    <div style={{ position: "absolute", top: 1340, width: "100%", display: "flex", justifyContent: "center", opacity: u, transform: `scale(${0.92 + 0.08 * u})` }}>
      <div style={{ direction: "rtl", padding: "10px 26px", borderRadius: 14, background: "rgba(0,0,0,0.6)", fontFamily: "V42Black", fontSize: 58, color: PAPER, display: "flex", gap: 16 }}>
        {cap.words.map((w, i) => <span key={i} style={{ color: w.kw && T >= w.s - 0.03 ? "#FFD34D" : PAPER, opacity: T >= w.s - 0.03 ? 1 : 0.45 }}>{w.w}</span>)}
      </div>
    </div>
  );
};
export const V42Reel: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const T = useCurrentFrame() / FPS;
  const k = T < S(2) ? -1 : T < S(3) ? 0 : T < S(4) ? 1 : T < S(5) ? 2 : T < S(6) ? 3 : T < S(7) ? 4 : -2;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {SC.map((Comp, i) => {
        const n = i + 1, from = n === 1 ? 0 : c(S(n)), to = n === 10 ? RTOTAL : c(S(n + 1));
        return <Scene key={n} from={from} to={to} fadeIn={n === 1 ? 0 : 0.1} fadeOut={0.12}><Comp /></Scene>;
      })}
      <Grain o={0.7} />
      <Vignette k={0.5} />
      <Captions T={T} />
      {k >= 0 && <div style={{ position: "absolute", top: 215, left: 140, right: 140 }}><Ribbon w={800} pos={k} s={0.95} /></div>}
      {T > S(2) - 0.1 && T < S(9) && <div style={{ position: "absolute", top: 150, left: 60 }}><Signal level={levelAt(T)} s={0.9} /></div>}
      {audio && <Html5Audio src={staticFile("v42/reel-mix.wav")} />}
    </AbsoluteFill>
  );
};
export const RLOOK = Array.from({ length: 10 }, (_, i) => (S(i + 1) + E(i + 1)) / 2);
const RLookFrame: React.FC = () => {
  const f = useCurrentFrame();
  return <Freeze frame={Math.round(RLOOK[Math.min(f, RLOOK.length - 1)] * FPS)}><V42Reel audio={false} /></Freeze>;
};
export const V42ReelCompositions: React.FC = () => (
  <>
    <Composition id="V42-Reel" component={V42Reel} durationInFrames={REEL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="V42-Reel-Silent" component={V42Reel} durationInFrames={REEL_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: false }} />
    <Composition id="V42-Reel-Look" component={RLookFrame} durationInFrames={REEL_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
void Src; void kick; void noise;
