// V42 · «هفده سال، پنج موج» · مستند اعتراض‌های ایران ۱۳۸۸ تا ۱۴۰۴ · YouTube 16:9.
// Real photos and phone videos from Wikimedia Commons (faces blurred; credits in videos/42/footage/CREDITS.md),
// Iran map from Natural Earth (tools/v42-map.mjs), numbers with their sources on screen. All times come from vo.json.
import React from "react";
import { AbsoluteFill, Composition, Freeze, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import voJson from "./vo.json";
import capJson from "./captions.json";
import {
  FPS, INK, PAPER, MUTED, CH, CLIPS, MAP, YEARS, timing, type VO, clamp, prog, lerp, easeOut, easeInOut, backOut, kick, noise, fa, faNum, useT,
  Grain, Vignette, Scene, Photo, Clip, Phone, SourceTag, Big, Rise, Chip, Src, Counter, DotField, IranMap, Pin, Signal, Ribbon,
  IcBallot, IcBread, IcFuel, IcWoman, IcCash, IcPlane, IcCam, IcChat, IcLock, IcMoon, IcCross,
} from "./kit";

const V = voJson as VO;
const { S, E, wd } = timing(V);
const W = 1920, H = 1080;
export const TOTAL = V.total + 1.2;
export const V42_FRAMES = Math.round(TOTAL * FPS);
const c = (t: number) => t - 0.08;

// chapter windows: [card start, first line of chapter, last line]
const CHAPS = [
  { i: 0, from: E(4) + 0.05, line: 5, last: 13, title: "«رأیِ من کجاست؟»", sub: "خرداد ۱۳۸۸", n: "۱" },
  { i: 1, from: E(13) + 0.05, line: 14, last: 18, title: "«مرگ بر گرونی»", sub: "دِی ۱۳۹۶", n: "۲" },
  { i: 2, from: E(18) + 0.05, line: 19, last: 24, title: "بنزین", sub: "آبان ۱۳۹۸", n: "۳" },
  { i: 3, from: E(24) + 0.05, line: 25, last: 31, title: "«زن، زندگی، آزادی»", sub: "شهریور ۱۴۰۱", n: "۴" },
  { i: 4, from: E(31) + 0.05, line: 32, last: 38, title: "خاموشی", sub: "دِی ۱۴۰۴", n: "۵" },
];
const chapAt = (T: number) => { let k = -1; CHAPS.forEach((ch, i) => { if (T >= ch.from) k = i; }); return T >= c(S(39)) ? -1 : k; };

// connection level over time (the thread of the film)
const KEYS: [number, number][] = [
  [0, 1], [wd(3, "ساکت‌تر"), 1], [wd(3, "ساکت‌تر") + 0.6, 0.6], [E(3) + 0.3, 1],
  [wd(12, "پیامک‌ها"), 1], [wd(12, "پیامک‌ها") + 0.5, 0.55], [wd(12, "کند"), 0.4], [S(14), 0.45], [S(14) + 1, 0.8],
  [wd(18, "مسدود"), 0.8], [wd(18, "مسدود") + 0.5, 0.55], [S(19), 0.6], [S(19) + 1, 0.85],
  [wd(22, "قطع") - 0.1, 0.85], [wd(22, "قطع") + 0.35, 0.02], [wd(23, "برگشت"), 0.02], [wd(23, "برگشت") + 0.5, 0.8],
  [wd(30, "موبایل"), 0.8], [wd(30, "شب‌ها"), 0.3], [wd(30, "شب‌ها") + 0.7, 0.75], [wd(30, "قطع"), 0.2], [E(30), 0.7],
  [wd(35, "ساعت"), 0.75], [wd(35, "صفر"), 0.02], [wd(41, "گوشیش"), 0.02], [wd(41, "بالا"), 0.2], [E(41) + 0.3, 0.2], [S(42), 0],
];
const level = (T: number) => {
  for (let i = 1; i < KEYS.length; i++) if (T < KEYS[i][0]) { const [a, va] = KEYS[i - 1], [b, vb] = KEYS[i]; return lerp(va, vb, easeInOut(prog(T, a, b))); }
  return KEYS[KEYS.length - 1][1];
};

// ───────────────────────── scenes ─────────────────────────
const Dark: React.FC<{ k?: number }> = ({ k = 0.55 }) => <AbsoluteFill style={{ background: `rgba(10,11,13,${k})` }} />;
const Center: React.FC<{ children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ children, y = 0, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${y}px)`, ...style }}>{children}</AbsoluteFill>
);

// L1: «هفده سال، پنج بار، یک کشور.»
const L1: React.FC = () => {
  const t = useT(), a = 0, t5 = wd(1, "پنج") - a - 0.08, tK = wd(1, "یک") - a - 0.08;
  const strips = ["p09a", "p17c", "p19d", "p09g", "p19i"];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {t < tK + 0.2 && strips.map((id, i) => {
        const u = easeOut(prog(t, t5 + i * 0.09, t5 + i * 0.09 + 0.4));
        return (
          <div key={id} style={{ position: "absolute", top: 0, bottom: 0, right: i * (W / 5), width: W / 5 + 2, overflow: "hidden", transform: `translateY(${(1 - u) * (i % 2 ? -100 : 100)}%)`, borderLeft: "2px solid #000" }}>
            <Photo id={id} t={t} dur={4} z0={1.25} z1={1.35} tag={false} grade={0.55} style={{ left: "-150%", right: "-150%" }} tint={YEARS[i].c} />
          </div>
        );
      })}
      {t < tK + 0.2 && <Dark k={0.45} />}
      <Center y={-20} style={{ opacity: 1 - prog(t, tK - 0.1, tK + 0.15) }}>
        <Big size={210} style={{ transform: `scale(${1 + 0.04 * t + kick(t, 0.05, 0.1)})` }}>هفده سال</Big>
        <div style={{ height: 150, opacity: prog(t, t5, t5 + 0.2) }}><Big size={110} color="#fff">پنج بار</Big></div>
      </Center>
      <Center style={{ opacity: prog(t, tK - 0.05, tK + 0.2) }}>
        <div style={{ transform: `scale(${0.9 + 0.08 * easeOut(prog(t, tK, tK + 2))})` }}>
          <IranMap w={640} draw={easeInOut(prog(t, tK - 0.05, tK + 0.9))} />
        </div>
        <div style={{ position: "absolute", bottom: 150 }}><Big size={70}>یک کشور</Big></div>
      </Center>
    </AbsoluteFill>
  );
};

// L2: five sparks
const SPARKS = [
  { w: "رأی", Ic: IcBallot, label: "یک رأی" }, { w: "نون", Ic: IcBread, label: "نونِ گرون" }, { w: "بنزین", Ic: IcFuel, label: "بنزین" },
  { w: "دختر", Ic: IcWoman, label: "یک دختر" }, { w: "پولی", Ic: IcCash, label: "پولِ بی‌ارزش" },
];
const L2: React.FC = () => {
  const t = useT(), a = c(S(2));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Center y={-260}><Rise text="هر بار، جرقه فرق می‌کرد" t={t} t0={0} size={64} color={MUTED} font="V42Bold" /></Center>
      <div style={{ position: "absolute", top: 380, left: 120, right: 120, height: 400, display: "flex", flexDirection: "row-reverse", justifyContent: "space-between" }}>
        {SPARKS.map((s, i) => {
          const t0 = wd(2, s.w) - a - 0.1, u = backOut(prog(t, t0, t0 + 0.45)), Y = YEARS[i];
          const glow = kick(t, t0, 1, 0.8);
          return (
            <div key={i} style={{ width: 300, height: 400, borderRadius: 18, background: "rgba(239,233,221,0.04)", border: `2px solid ${u > 0.01 ? Y.c : "rgba(239,233,221,0.1)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: 0.25 + 0.75 * clamp(u), transform: `translateY(${(1 - clamp(u)) * 40}px) scale(${0.9 + 0.1 * u})`, boxShadow: `0 0 ${60 * glow}px ${Y.c}` }}>
              <s.Ic s={150} c={u > 0.01 ? Y.c : MUTED} drop={u} />
              <div style={{ fontFamily: "V42Black", fontSize: 44, color: PAPER, direction: "rtl" }}>{s.label}</div>
              <div style={{ fontFamily: "V42Mono", fontSize: 30, color: Y.c, letterSpacing: 2 }}>{Y.y}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// L3: slogans louder, internet quieter
const L3: React.FC = () => {
  const t = useT(), a = c(S(3)), tL = wd(3, "بلندتر") - a, tQ = wd(3, "ساکت‌تر") - a;
  const loud = easeOut(prog(t, tL - 0.3, tL + 0.6));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Center y={-330}><Rise text="دو چیز عوض شد" t={t} t0={0.6} size={66} color={MUTED} font="V42Bold" /></Center>
      <div style={{ position: "absolute", right: 260, top: 330, width: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 260 }}>
          {Array.from({ length: 14 }, (_, i) => {
            const h = 30 + loud * (60 + 180 * noise(t * 7 + i * 3.1)) * (0.4 + 0.6 * Math.sin((i / 13) * Math.PI));
            return <div key={i} style={{ width: 22, height: h, borderRadius: 4, background: i > 9 ? CH.c04 : i > 5 ? CH.c96 : CH.c88, opacity: 0.9 }} />;
          })}
        </div>
        <Big size={78}>شعارها <span style={{ color: CH.c96 }}>بلندتر</span></Big>
      </div>
      <div style={{ position: "absolute", left: 260, top: 330, width: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ height: 260, display: "flex", alignItems: "flex-end" }}><Signal level={level(t + a)} s={3.4} label={false} /></div>
        <Big size={78}>اینترنت <span style={{ color: MUTED, opacity: 1 - 0.5 * prog(t, tQ, tQ + 0.6) }}>ساکت‌تر</span></Big>
      </div>
      <div style={{ position: "absolute", left: W / 2 - 1, top: 330, width: 2, height: 380, background: "rgba(239,233,221,0.15)" }} />
    </AbsoluteFill>
  );
};

// L4: the ribbon is born, then moves down into the HUD
const L4: React.FC = () => {
  const t = useT(), a = c(S(4)), t88 = wd(4, "هشتاد") - a, t04 = wd(4, "چهارصد") - a;
  const pos = lerp(0, 4, easeInOut(prog(t, t88, t04 + 0.4)));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo id="p09k" t={t} dur={7} z0={1.05} z1={1.12} grade={0.4} tag={false} style={{ opacity: 0.35 }} />
      <Dark k={0.4} />
      <Center y={-170}><Rise text="داستانِ اعتراض‌های ایران" t={t} t0={0.1} size={96} /></Center>
      <div style={{ position: "absolute", left: 260, top: 560, transform: `scale(${1 + kick(t, t04 + 0.4, 0.04)})` }}>
        <Ribbon w={1400} pos={pos} s={1.9} />
      </div>
      <div style={{ position: "absolute", width: "100%", top: 780, textAlign: "center", opacity: prog(t, t04, t04 + 0.5) }}>
        <Big size={46} color={MUTED} font="V42Bold">هفده سال · پنج موج</Big>
      </div>
    </AbsoluteFill>
  );
};

// chapter card
const ChapterCard: React.FC<{ k: number }> = ({ k }) => {
  const t = useT(), ch = CHAPS[k], Y = YEARS[k];
  const u = easeOut(prog(t, 0, 0.5)), bg = ["p09a", "p17b", "p19e", "v22e", "v26g"][k];
  const isVid = CLIPS[bg].kind === "video";
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.32, filter: "blur(10px) saturate(0.4)", transform: `scale(${1.15 + 0.03 * t})` }}>
        {isVid ? <Clip id={bg} start={2} /> : <Photo id={bg} t={t} dur={3} tag={false} />}
      </div>
      <Dark k={0.35} />
      <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: "V42Bold", fontSize: 34, color: MUTED, direction: "rtl", opacity: u }}>فصل {ch.n} · {ch.sub}</div>
      <Center y={-20}>
        <div style={{ fontFamily: "V42Black", fontSize: 300, color: Y.c, lineHeight: 1, letterSpacing: 6, transform: `scale(${lerp(1.3, 1, easeOut(prog(t, 0, 0.35)))})`, opacity: clamp(u * 1.5), textShadow: `0 0 80px ${Y.c}55` }}>{Y.y}</div>
      </Center>
      <Center y={220}><Rise text={ch.title} t={t} t0={0.3} step={0.09} size={92} font="V42Slogan" /></Center>
      <div style={{ position: "absolute", left: W / 2 - 300, width: 600, top: 960, height: 3, background: Y.c, transform: `scaleX(${easeOut(prog(t, 0.2, 1.2))})` }} />
    </AbsoluteFill>
  );
};

// ── chapter 1 · 1388 ──
const L5: React.FC = () => {
  const t = useT(), a = c(S(5)), u = easeOut(prog(t, 0.2, 1.2));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo id="p09k" t={t} dur={5} z0={1.1} z1={1.2} grade={0.35} tag={false} style={{ opacity: 0.3, filter: "blur(6px)" }} />
      <Center y={-60}><div style={{ transform: `scale(${1 + 0.02 * t})` }}><IcBallot s={380} c={CH.c88} sw={3} drop={u} /></div></Center>
      <Center y={260}><Chip color={CH.c88} t={t} t0={0.1} size={44}>۲۲ خرداد ۱۳۸۸</Chip></Center>
      <Center y={370}><Rise text="انتخاباتِ ریاست‌جمهوری" t={t} t0={wd(5, "انتخابات") - a} size={62} font="V42Bold" /></Center>
    </AbsoluteFill>
  );
};
const RES = [{ n: "محمود احمدی‌نژاد", v: 62.63 }, { n: "میرحسین موسوی", v: 33.75 }, { n: "محسن رضایی", v: 1.73 }, { n: "مهدی کروبی", v: 0.85 }];
const L6: React.FC = () => {
  const t = useT(), a = c(S(6)), tA = wd(6, "اعلام") - a, tN = wd(6, "شصت") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", top: 150, right: 200, fontFamily: "V42Black", fontSize: 64, color: PAPER, direction: "rtl" }}>نتیجه‌ی اعلام‌شده</div>
      <Src t={t} t0={tA} style={{ position: "absolute", top: 240, right: 200 }}>ستاد انتخابات کشور، ۲۳ خرداد ۱۳۸۸</Src>
      {RES.map((r, i) => {
        const u = easeOut(prog(t, tA + 0.2 + i * 0.12, (i === 0 ? tN : tA + 1.2) + 0.5 + i * 0.12));
        return (
          <div key={i} style={{ position: "absolute", top: 360 + i * 140, right: 200, left: 200, height: 110, direction: "rtl", display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ width: 380, fontFamily: "V42Bold", fontSize: 40, color: i === 0 ? PAPER : MUTED }}>{r.n}</div>
            <div style={{ flex: 1, height: 64, background: "rgba(239,233,221,0.06)", borderRadius: 6, position: "relative" }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${(r.v / 70) * 100 * u}%`, background: i === 0 ? PAPER : i === 1 ? CH.c88 : "rgba(239,233,221,0.35)", borderRadius: 6 }} />
            </div>
            <div style={{ width: 200, fontFamily: "V42Mono", fontSize: i === 0 ? 64 : 44, color: i === 0 ? PAPER : MUTED, transform: `scale(${1 + (i === 0 ? kick(t, tN + 0.5, 0.15) : 0)})` }}>{fa((r.v * u).toFixed(1)).replace(".", "٫")}٪</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const L7: React.FC = () => {
  const t = useT(), a = c(S(7));
  return (
    <AbsoluteFill>
      <Photo id="p09e" t={t} dur={5.4} x0={1} x1={-2} z0={1.08} z1={1.2} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,11,13,0.85), rgba(10,11,13,0) 45%)" }} />
      <div style={{ position: "absolute", bottom: 200, right: 140, display: "flex", gap: 24, direction: "rtl" }}>
        <Chip color={CH.c88} t={t} t0={wd(7, "میرحسین") - a} size={40}>میرحسین موسوی</Chip>
        <Chip color={CH.c88} t={t} t0={wd(7, "مهدی") - a} size={40}>مهدی کروبی</Chip>
      </div>
      <div style={{ position: "absolute", bottom: 320, right: 140, opacity: prog(t, wd(7, "قبول") - a, wd(7, "قبول") - a + 0.3) }}><Big size={78}>این نتیجه رو قبول نکردن</Big></div>
    </AbsoluteFill>
  );
};
const L8: React.FC = () => {
  const t = useT(), a = c(S(8)), tQ = wd(8, "رأی") - a;
  return (
    <AbsoluteFill>
      <Photo id="p09d" t={t} dur={4.5} z0={1.05} z1={1.28} y0={0} y1={-4} />
      <Dark k={0.25 + 0.25 * prog(t, tQ - 0.2, tQ + 0.2)} />
      <Center y={-40} style={{ opacity: prog(t, tQ - 0.1, tQ + 0.1) }}>
        <div style={{ transform: `rotate(-3deg) scale(${lerp(1.4, 1, easeOut(prog(t, tQ - 0.1, tQ + 0.25)))})`, padding: "20px 60px", background: "rgba(239,233,221,0.95)", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ fontFamily: "V42Slogan", fontSize: 150, color: "#1a6b35", direction: "rtl" }}>رأیِ من کجاست؟</div>
        </div>
      </Center>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", opacity: prog(t, 0, 0.3) * (1 - prog(t, tQ - 0.3, tQ)) }}><Big size={70}>یک سؤال روی پلاکاردها</Big></div>
    </AbsoluteFill>
  );
};
const L9: React.FC = () => {
  const t = useT(), a = c(S(9)), tS = wd(9, "سکوت") - a, tR = wd(9, "انقلاب") - a, tZ = wd(9, "آزادی") - a;
  const which = t < tS - 0.1 ? 0 : t < tR - 0.1 ? 1 : 2;
  const ids = ["p09c", "p09b", "p09a"];
  return (
    <AbsoluteFill style={{ background: INK }}>
      {ids.map((id, i) => i === which && <Photo key={id} id={id} t={t} dur={6.5} z0={1.04 + i * 0.03} z1={1.2} x0={i === 1 ? 2 : 0} x1={i === 1 ? -2 : 0} />)}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,11,13,0.8), rgba(10,11,13,0) 50%)" }} />
      <div style={{ position: "absolute", top: 90, right: 120 }}><Chip color={CH.c88} t={t} t0={0.1} size={38}>۲۵ خرداد ۱۳۸۸ · تهران</Chip></div>
      <div style={{ position: "absolute", bottom: 200, width: "100%", textAlign: "center", opacity: prog(t, tS - 0.15, tS + 0.15) * (1 - prog(t, tR - 0.3, tR - 0.05)) }}>
        <Big size={150} style={{ letterSpacing: 12 }}>در سکوت</Big>
      </div>
      <div style={{ position: "absolute", bottom: 200, left: 260, right: 260, height: 90, opacity: prog(t, tR - 0.1, tR + 0.2), direction: "rtl" }}>
        <div style={{ position: "absolute", right: 0, top: 30, fontFamily: "V42Black", fontSize: 52, color: PAPER }}>میدانِ انقلاب</div>
        <div style={{ position: "absolute", left: 0, top: 30, fontFamily: "V42Black", fontSize: 52, color: CH.c88 }}>آزادی</div>
        <div style={{ position: "absolute", right: 380, left: 200, top: 62, height: 4, background: "rgba(239,233,221,0.25)" }} />
        <div style={{ position: "absolute", right: 380, top: 62, height: 4, width: `calc((100% - 580px) * ${easeInOut(prog(t, tR, tZ + 0.8))})`, background: CH.c88, boxShadow: `0 0 20px ${CH.c88}` }} />
      </div>
    </AbsoluteFill>
  );
};
const L10: React.FC = () => {
  const t = useT(), a = c(S(10)), tG = wd(10, "سبز") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "50%", overflow: "hidden" }}><Photo id="p09f" t={t} dur={3.5} z0={1.1} z1={1.2} grade={0.5} /></div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", overflow: "hidden", transform: `translateY(${(1 - easeOut(prog(t, 0, 0.4))) * 100}%)` }}><Photo id="p09g" t={t} dur={3.5} z0={1.15} z1={1.25} grade={0.5} /></div>
      <AbsoluteFill style={{ background: CH.c88, mixBlendMode: "color", opacity: 0.5 * easeOut(prog(t, tG - 0.2, tG + 0.4)) }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={`M -100 ${700 + 30 * Math.sin(t * 2)} C 500 ${560 + 40 * Math.sin(t * 2.3)}, 1200 ${860 + 40 * Math.cos(t * 1.7)}, 2100 ${640 + 30 * Math.sin(t * 2)}`} stroke={CH.c88} strokeWidth={46} fill="none" strokeLinecap="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - easeOut(prog(t, tG - 0.1, tG + 1)))} opacity={0.9} />
      </svg>
      <Center y={-60}><Big size={130} style={{ opacity: prog(t, tG, tG + 0.25) }}>رنگِ <span style={{ color: CH.c88 }}>سبز</span></Big></Center>
    </AbsoluteFill>
  );
};
const L11: React.FC = () => {
  const t = useT(), a = c(S(11)), tF = wd(11, "فیلم") - a, tN = wd(11, "ندا") - a, tD = wd(11, "دنیا") - a;
  const spread = easeOut(prog(t, tD - 0.2, tD + 1.6));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", top: 130, right: 160 }}><Chip color={PAPER} t={t} t0={0.05} size={36}>۳۰ خرداد ۱۳۸۸</Chip></div>
      {/* a phone that recorded; the screen shows no picture of her, only the recording */}
      <div style={{ position: "absolute", right: 380, top: 170, width: 360, height: 740, borderRadius: 46, background: "#111", boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 0 0 2px #2a2a2a", padding: 14, transform: `translateY(${(1 - easeOut(prog(t, tF - 0.2, tF + 0.4))) * 200}px)`, opacity: prog(t, tF - 0.2, tF + 0.1) }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 36, background: "#050505", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", border: "4px solid #444", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 0, height: 0, borderTop: "28px solid transparent", borderBottom: "28px solid transparent", borderLeft: "44px solid #666", marginLeft: 10 }} /></div>
          <div style={{ fontFamily: "V42Mono", fontSize: 34, color: "#888" }}>00:{String(Math.min(40, Math.floor(clamp(t - tF) * 6))).padStart(2, "0")}</div>
          <div style={{ position: "absolute", bottom: 40, left: 30, right: 30, height: 6, background: "#222", borderRadius: 3 }}><div style={{ width: `${clamp((t - tF) / 6) * 100}%`, height: "100%", background: "#ff3b3b", borderRadius: 3 }} /></div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 250, top: 330, direction: "rtl", opacity: prog(t, tN - 0.1, tN + 0.3) }}>
        <div style={{ fontFamily: "V42Black", fontSize: 110, color: PAPER }}>نِدا آقاسلطان</div>
        <div style={{ height: 3, width: 520, background: PAPER, opacity: 0.5, margin: "18px 0 18px auto" }} />
        <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED }}>با یک گوشی ضبط شد</div>
      </div>
      {/* the clip travels the world */}
      <div style={{ position: "absolute", left: 180, top: 640, width: 760, height: 330, opacity: spread }}>
        <svg width={760} height={330}>
          {Array.from({ length: 70 }, (_, i) => {
            const x = 30 + hash2(i) * 700, y = 20 + hash2(i + 99) * 290, on = prog(spread, hash2(i + 7) * 0.8, hash2(i + 7) * 0.8 + 0.2);
            return <circle key={i} cx={x} cy={y} r={4 + 3 * on} fill={PAPER} opacity={on * 0.85} />;
          })}
        </svg>
        <div style={{ position: "absolute", bottom: -10, right: 0, fontFamily: "V42Bold", fontSize: 40, color: PAPER, direction: "rtl" }}>و دنیا رو تکون داد</div>
      </div>
    </AbsoluteFill>
  );
};
const hash2 = (n: number) => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
const L12: React.FC = () => {
  const t = useT(), a = c(S(12)), tS = wd(12, "پیامک‌ها") - a, tK = wd(12, "کند") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 260, top: 200, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-end" }}>
        {["ساعت چند؟", "کجایی؟", "میدان آزادی‌ایم", "جواب بده"].map((m, i) => {
          const u = backOut(prog(t, tS - 0.2 + i * 0.22, tS + i * 0.22 + 0.15));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, direction: "rtl", opacity: clamp(u), transform: `scale(${0.8 + 0.2 * u})` }}>
              <div style={{ padding: "16px 30px", borderRadius: 26, background: "#1f6f43", color: PAPER, fontFamily: "V42Semi", fontSize: 38 }}>{m}</div>
              <div style={{ fontFamily: "V42Bold", fontSize: 26, color: "#ff5a5a" }}>ارسال نشد !</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 260, top: 230, width: 620, direction: "rtl" }}>
        <div style={{ fontFamily: "V42Bold", fontSize: 36, color: MUTED, marginBottom: 20 }}>سرعتِ اینترنت</div>
        <svg width={620} height={300}>
          <polyline fill="none" stroke={PAPER} strokeWidth={5} points={Array.from({ length: 60 }, (_, i) => { const x = i * 10.5, drop = prog(i / 60, 0.25, 0.6) * prog(t, tK - 0.8, tK + 0.3); return `${x},${40 + 200 * drop + 15 * noise(i * 0.9)}`; }).slice(0, Math.max(2, Math.floor(clamp(t / 3) * 60))).join(" ")} />
        </svg>
        <div style={{ fontFamily: "V42Black", fontSize: 90, color: CH.c88, opacity: prog(t, tK - 0.1, tK + 0.2) }}>کُند</div>
      </div>
    </AbsoluteFill>
  );
};
const L13: React.FC = () => {
  const t = useT(), a = c(S(13)), tB = wd(13, "بازداشت") - a, tM = wd(13, "موسوی") - a, tH = wd(13, "حصر") - a;
  const ph = t < tB - 0.1 ? "p09h" : "p09i";
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(t, tM - 0.2, tM + 0.2) }}>
        <Photo key={ph} id={ph} t={t} dur={4} z0={1.06} z1={1.15} grade={0.45} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,11,13,0.85), rgba(10,11,13,0) 50%)" }} />
        <div style={{ position: "absolute", bottom: 200, right: 140, display: "flex", gap: 24, direction: "rtl" }}>
          <Chip color={PAPER} t={t} t0={0.2} size={46}>ده‌ها کشته</Chip>
          <Chip color={PAPER} t={t} t0={tB - 0.1} size={46}>هزاران بازداشت</Chip>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, tM - 0.1, tM + 0.3), display: "flex", alignItems: "center", justifyContent: "center", gap: 120, flexDirection: "row-reverse" }}>
        {["میرحسین موسوی", "مهدی کروبی"].map((n, i) => (
          <div key={i} style={{ width: 520, height: 520, borderRadius: 20, border: "2px solid rgba(239,233,221,0.25)", background: "rgba(239,233,221,0.03)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <div style={{ transform: `scale(${1 + kick(t, tH, 0.2)})` }}><IcLock s={180} c={prog(t, tH - 0.1, tH) > 0 ? CH.c88 : MUTED} /></div>
            <div style={{ fontFamily: "V42Black", fontSize: 52, color: PAPER, direction: "rtl" }}>{n}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 200, width: "100%", textAlign: "center", opacity: prog(t, tH - 0.1, tH + 0.3) }}><Big size={64}>سال‌ها در حصرِ خانگی</Big></div>
    </AbsoluteFill>
  );
};

// ── chapter 2 · 1396 ──
const MapScene: React.FC<{ children: (t: number) => React.ReactNode; draw?: (t: number) => number; x?: number; w?: number }> = ({ children, draw = () => 1, x = 0, w = 900 }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", left: (W - w) / 2 + x, top: (H - (MAP.H * w) / MAP.W) / 2 + 10, transform: `scale(${1 + 0.012 * t})` }}>
        <IranMap w={w} draw={draw(t)}>{children(t)}</IranMap>
      </div>
    </AbsoluteFill>
  );
};
const L14: React.FC = () => {
  const a = c(S(14)), tM = wd(14, "مشهد") - a;
  return (
    <>
      <MapScene x={-330} w={880} draw={(t) => easeOut(prog(t, 0, 0.8))}>{(t) => <Pin city="mashhad" t={t} t0={tM - 0.1} color={CH.c96} label="مشهد" dx={-20} anchor="end" r={12} />}</MapScene>
      <Local>{(t) => (
        <div style={{ position: "absolute", right: 170, top: 330, direction: "rtl" }}>
          <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED, opacity: prog(t, 0, 0.3) }}>هشت سال بعد</div>
          <div style={{ fontFamily: "V42Black", fontSize: 120, color: CH.c96, opacity: prog(t, 0.6, 0.9) }}>۷ دِی ۱۳۹۶</div>
        </div>
      )}</Local>
    </>
  );
};
const Local: React.FC<{ children: (t: number) => React.ReactNode }> = ({ children }) => { const t = useT(); return <AbsoluteFill>{children(t)}</AbsoluteFill>; };
const L15: React.FC = () => {
  const t = useT(), a = c(S(15)), tV = wd(15, "رأی") - a, tG = wd(15, "گرونی") - a;
  const strike = easeOut(prog(t, tV + 0.25, tV + 0.6));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 260, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: 1 - 0.6 * strike }}>
        <IcBallot s={220} c={MUTED} />
        <div style={{ position: "relative" }}><Big size={80} color={MUTED}>رأی</Big><div style={{ position: "absolute", top: "55%", right: -20, height: 8, width: `${strike * 110}%`, background: CH.c04 }} /></div>
      </div>
      <div style={{ position: "absolute", left: 260, top: 250, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: prog(t, tG - 0.2, tG + 0.1) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <IcBread s={240} c={CH.c96} />
          <svg width={110} height={240}><path d={`M55 220 L55 ${220 - 180 * easeOut(prog(t, tG, tG + 0.8))}`} stroke={CH.c04} strokeWidth={14} /><path d={`M20 ${80 + 180 * (1 - easeOut(prog(t, tG, tG + 0.8)))} L55 ${40 + 180 * (1 - easeOut(prog(t, tG, tG + 0.8)))} L90 ${80 + 180 * (1 - easeOut(prog(t, tG, tG + 0.8)))}`} stroke={CH.c04} strokeWidth={14} fill="none" /></svg>
        </div>
        <Big size={120} color={CH.c96}>گرونی</Big>
      </div>
    </AbsoluteFill>
  );
};
const L16: React.FC = () => {
  const a = c(S(16)), t80 = wd(16, "هشتاد") - a, tSmall = wd(16, "کوچیک") - a;
  const keys = Object.keys(MAP.cities);
  return (
    <>
      <MapScene x={-300} w={860}>{(t) => (
        <g>
          {keys.map((k, i) => {
            const [x, y] = MAP.cities[k], d = Math.hypot(x - MAP.cities.mashhad[0], y - MAP.cities.mashhad[1]);
            const t0 = 0.2 + (d / 900) * (t80 - 0.1);
            const on = prog(t, t0, t0 + 0.25), small = !MAP.named.includes(k);
            const pulse = small && t > tSmall ? 0.5 + 0.5 * Math.sin((t - tSmall) * 6 + i) : 0;
            return <circle key={k} cx={x} cy={y} r={(small ? 6 : 9) * (0.5 + on * 0.5) + pulse * 3} fill={CH.c96} opacity={on * (small ? 0.85 : 1)} />;
          })}
          <Pin city="mashhad" t={t} t0={0} color={CH.c96} r={12} />
        </g>
      )}</MapScene>
      <Local>{(t) => (
        <>
          <div style={{ position: "absolute", right: 170, top: 300, direction: "rtl", textAlign: "right" }}>
            <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED }}>ظرفِ چند روز</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, direction: "rtl", opacity: prog(t, t80 - 0.2, t80) }}>
              <span style={{ fontFamily: "V42Bold", fontSize: 56, color: PAPER }}>بیش از</span><Counter value={80} t={t} t0={t80 - 0.2} dur={0.8} size={190} color={CH.c96} /><span style={{ fontFamily: "V42Bold", fontSize: 56, color: PAPER }}>شهر</span>
            </div>
            <div style={{ fontFamily: "V42Bold", fontSize: 44, color: PAPER, opacity: prog(t, tSmall - 0.6, tSmall - 0.3) }}>بیشترشون شهرهای کوچیک</div>
            <div style={{ fontFamily: "V42Reg", fontSize: 22, color: MUTED, marginTop: 14 }}>نقشه نمادین است؛ نقطه‌ها جای دقیقِ تجمع‌ها نیستند.</div>
          </div>
          <div style={{ position: "absolute", left: 120, bottom: 140, opacity: prog(t, 1.2, 1.6) }}>
            <Phone id="p17a" x={160} y={-230} w={220} start={8} rot={-4} />
          </div>
        </>
      )}</Local>
    </>
  );
};
const L17: React.FC = () => {
  const t = useT(), a = c(S(17)), tE = wd(17, "اصلاح‌طلب") - a, tO = wd(17, "اصول‌گرا") - a, tD = wd(17, "دیگه") - a;
  const word = (s: string, t0: number, x: number, y: number) => {
    const u = backOut(prog(t, t0 - 0.1, t0 + 0.25));
    return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(1.5, 1, u)}) rotate(${(hash2(t0) - 0.5) * 6}deg)`, opacity: clamp(u * 2), fontFamily: "V42Slogan", fontSize: 150, color: PAPER, direction: "rtl", textShadow: "0 8px 40px #000", whiteSpace: "nowrap" }}>{s}</div>;
  };
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo id="p17b" t={t} dur={6.5} grade={0.3} tag z0={1.1} z1={1.2} style={{ opacity: 0.45 }} />
      <Dark k={0.35} />
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", opacity: 1 - prog(t, tE - 0.3, tE) }}><Big size={64}>شعارها یک قدم جلوتر رفت</Big></div>
      {word("اصلاح‌طلب،", tE, W * 0.68, 360)}
      {word("اصول‌گرا،", tO, W * 0.32, 360)}
      <div style={{ position: "absolute", top: 600, width: "100%", textAlign: "center", opacity: prog(t, tD - 0.1, tD + 0.2), transform: `scale(${1 + kick(t, tD, 0.06)})` }}>
        <span style={{ fontFamily: "V42Slogan", fontSize: 170, color: CH.c96, direction: "rtl" }}>دیگه تمومه ماجرا</span>
      </div>
    </AbsoluteFill>
  );
};
const AppTile: React.FC<{ Ic: React.FC<{ s?: number; c?: string; sw?: number }>; name: string; t: number; t0: number; tB: number; color?: string }> = ({ Ic, name, t, t0, tB, color = PAPER }) => {
  const u = backOut(prog(t, t0, t0 + 0.35)), b = backOut(prog(t, tB, tB + 0.3));
  return (
    <div style={{ position: "relative", width: 300, height: 340, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: clamp(u), transform: `scale(${0.8 + 0.2 * u})` }}>
      <div style={{ width: 240, height: 240, borderRadius: 56, background: "rgba(239,233,221,0.06)", border: "2px solid rgba(239,233,221,0.2)", display: "flex", alignItems: "center", justifyContent: "center", filter: b > 0.5 ? "grayscale(1) brightness(0.6)" : "none" }}><Ic s={150} c={color} /></div>
      <div style={{ fontFamily: "V42Bold", fontSize: 40, color: PAPER, direction: "rtl" }}>{name}</div>
      <div style={{ position: "absolute", top: 70, left: -20, right: -20, textAlign: "center", transform: `rotate(-12deg) scale(${lerp(1.6, 1, clamp(b))})`, opacity: clamp(b * 2) }}>
        <span style={{ display: "inline-block", padding: "8px 28px", border: `6px solid ${CH.c04}`, color: CH.c04, fontFamily: "V42Black", fontSize: 60, borderRadius: 10, background: "rgba(10,11,13,0.6)" }}>مسدود</span>
      </div>
    </div>
  );
};
const L18: React.FC = () => {
  const t = useT(), a = c(S(18)), tB = wd(18, "مسدود") - a, tK = wd(18, "کشته") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(t, tK - 0.7, tK - 0.5), display: "flex", alignItems: "center", justifyContent: "center", gap: 140, flexDirection: "row-reverse" }}>
        <AppTile Ic={IcPlane} name="تلگرام" t={t} t0={0} tB={tB} />
        <AppTile Ic={IcCam} name="اینستاگرام" t={t} t0={wd(18, "اینستاگرام") - a} tB={tB + 0.12} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, tK - 0.6, tK - 0.4) }}>
        <Photo id="p17c" t={t} dur={7} grade={0.4} z0={1.05} z1={1.12} />
        <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,11,13,0.85), rgba(10,11,13,0) 50%)" }} />
        <div style={{ position: "absolute", bottom: 200, right: 140, display: "flex", gap: 24, direction: "rtl" }}>
          <Chip color={CH.c96} t={t} t0={tK - 0.3} size={46}>بیش از ۲۰ کشته</Chip>
          <Chip color={CH.c96} t={t} t0={wd(18, "هزاران") - a} size={46}>هزاران بازداشت</Chip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── chapter 3 · 1398 ──
const L19: React.FC = () => {
  const t = useT(), a = c(S(19)), tN = wd(19, "نیمه‌شب") - a, u = prog(t, tN - 0.3, tN + 0.8);
  const mm = Math.floor(lerp(57, 60, u)), hh = mm >= 60 ? "00" : "23", m = mm >= 60 ? "00" : String(mm);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo id="p19g" t={t} dur={4.5} grade={0.3} z0={1.05} z1={1.14} style={{ opacity: 0.4 }} />
      <Dark k={0.3} />
      <Center y={-90}><div style={{ fontFamily: "V42Mono", fontSize: 260, color: CH.c98, letterSpacing: 10, textShadow: `0 0 60px ${CH.c98}66`, direction: "ltr", transform: `scale(${1 + kick(t, tN + 0.5, 0.05)})` }}>{hh}:{m}</div></Center>
      <Center y={150}><Chip color={CH.c98} t={t} t0={wd(19, "بیست") - a} size={50}>۲۴ آبان ۱۳۹۸</Chip></Center>
      <div style={{ position: "absolute", top: 160, width: "100%", textAlign: "center" }}><Big size={52} color={MUTED} font="V42Bold">دو سال بعد</Big></div>
    </AbsoluteFill>
  );
};
const L20: React.FC = () => {
  const t = useT(), a = c(S(20)), tY = wd(20, "یک‌شبه") - a, t3 = wd(20, "سه") - a;
  const p = Math.round(lerp(1000, 3000, easeInOut(prog(t, tY, t3 + 0.4))) / 50) * 50;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 250, top: 190, width: 620, height: 700, borderRadius: 24, background: "#15171b", border: "2px solid #2b2e35", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", padding: 40, gap: 26 }}>
        <IcFuel s={120} c={CH.c98} />
        <div style={{ fontFamily: "V42Bold", fontSize: 34, color: MUTED, direction: "rtl" }}>قیمتِ هر لیتر بنزین</div>
        <div style={{ width: "100%", padding: "24px 0", background: "#0b0c0e", borderRadius: 14, textAlign: "center", fontFamily: "V42Black", fontSize: 140, color: CH.c98, textShadow: `0 0 30px ${CH.c98}88` }}>{faNum(p)}</div>
        <div style={{ fontFamily: "V42Bold", fontSize: 40, color: PAPER, direction: "rtl" }}>تومان</div>
        <div style={{ fontFamily: "V42Reg", fontSize: 22, color: MUTED, direction: "rtl" }}>بنزینِ آزاد؛ سهمیه‌ای: ۱٬۵۰۰ تومان</div>
      </div>
      <div style={{ position: "absolute", left: 300, top: 360, opacity: prog(t, t3 - 0.1, t3 + 0.15), transform: `scale(${lerp(1.6, 1, backOut(prog(t, t3 - 0.1, t3 + 0.3)))})` }}>
        <div style={{ fontFamily: "V42Black", fontSize: 300, color: CH.c98, lineHeight: 1, direction: "ltr" }}>×۳</div>
        <div style={{ fontFamily: "V42Bold", fontSize: 54, color: PAPER, direction: "rtl", textAlign: "center" }}>یک‌شبه</div>
      </div>
    </AbsoluteFill>
  );
};
const L21: React.FC = () => {
  const t = useT(), a = c(S(21)), tR = wd(21, "جاده‌ها") - a, tP = wd(21, "اعتراض") - a, tD = wd(21, "ده‌ها") - a;
  const ids = t < tP - 0.1 ? "p19a" : t < tD - 0.05 ? "p19c" : "p19d";
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Photo key={ids} id={ids} t={t} dur={2.2} z0={1.04} z1={1.14} x0={ids === "p19c" ? 2 : 0} x1={ids === "p19c" ? -2 : 0} grade={0.75} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,11,13,0.8), rgba(10,11,13,0) 50%)" }} />
      <div style={{ position: "absolute", top: 90, right: 120 }}><Chip color={CH.c98} t={t} t0={0.05} size={38}>۲۵ آبان ۱۳۹۸</Chip></div>
      <div style={{ position: "absolute", bottom: 200, right: 140, opacity: prog(t, tR - 0.1, tR + 0.2) }}><Big size={80}>{t < tP - 0.1 ? "جاده‌ها بسته شد" : "اعتراض به ده‌ها شهر"}</Big></div>
    </AbsoluteFill>
  );
};
const L22: React.FC = () => {
  const t = useT(), a = c(S(22)), tI = wd(22, "اینترنت") - a, tW = wd(22, "هفته") - a, tQ = wd(22, "قطع") - a;
  const off = prog(t, tQ - 0.1, tQ + 0.3);
  const days = Math.min(7, 1 + Math.floor(clamp((t - tW + 0.3) / 1.4) * 7));
  return (
    <>
      <MapScene w={860} x={-300}>{(tt) => (
        <g>{Object.keys(MAP.cities).map((k, i) => { const [x, y] = MAP.cities[k]; const o = 1 - prog(tt, tQ - 0.2 + hash2(i) * 0.4, tQ + hash2(i) * 0.4); return <circle key={k} cx={x} cy={y} r={MAP.named.includes(k) ? 9 : 6} fill={PAPER} opacity={0.15 + 0.7 * o * prog(tt, 0, 0.6)} />; })}</g>
      )}</MapScene>
      <Local>{(tt) => (
        <>
          <div style={{ position: "absolute", right: 170, top: 210, width: 640, direction: "rtl" }}>
            <div style={{ fontFamily: "V42Bold", fontSize: 44, color: MUTED, opacity: prog(tt, 0, 0.3) }}>کاری که تا اون روز سابقه نداشت</div>
            <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 30, opacity: prog(tt, tI - 0.2, tI) }}>
              <Signal level={level(tt + a)} s={2.2} label={false} />
              <div style={{ fontFamily: "V42Black", fontSize: 110, color: off > 0.5 ? CH.c04 : PAPER }}>{off > 0.5 ? "قطع" : "اینترنت"}</div>
            </div>
            <div style={{ marginTop: 60, display: "flex", gap: 14, direction: "rtl", opacity: prog(tt, tW - 0.4, tW - 0.1) }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ width: 70, height: 90, borderRadius: 8, border: `2px solid ${i < days ? CH.c98 : "rgba(239,233,221,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V42Black", fontSize: 40, color: i < days ? CH.c98 : MUTED }}>{fa(i + 1)}</div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontFamily: "V42Bold", fontSize: 40, color: PAPER, opacity: prog(tt, tW - 0.4, tW - 0.1) }}>حدودِ یک هفته</div>
          </div>
          <Src t={tt} t0={tQ} style={{ position: "absolute", left: 120, bottom: 120 }}>NetBlocks، آبان ۱۳۹۸</Src>
        </>
      )}</Local>
    </>
  );
};
const L23: React.FC = () => {
  const t = useT(), a = c(S(23)), tF = wd(23, "فیلم‌ها") - a;
  const ph = [["p19e", 560, -6], ["p19j", 960, 3], ["p19h", 1360, -2]] as const;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center", gap: 30, alignItems: "center", direction: "rtl" }}>
        <Big size={64}>وقتی اینترنت برگشت</Big><Signal level={level(t + a)} s={1.6} label={false} />
      </div>
      {ph.map(([id, x, r], i) => {
        const u = backOut(prog(t, 0.5 + i * 0.25, 0.9 + i * 0.25)); void tF;
        return <Phone key={id} id={id} x={x} y={640 + (1 - clamp(u)) * 600} w={300} rot={r} o={clamp(u * 2)} rec={false} />;
      })}
    </AbsoluteFill>
  );
};
const L24: React.FC = () => {
  const t = useT(), a = c(S(24)), tN = wd(24, "سیصد") - a, tA = wd(24, "بیست") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 170, top: 230, direction: "rtl" }}>
        <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED }}>دست‌کم</div>
        <Counter value={304} t={t} t0={tN - 0.2} dur={1.4} size={260} color={PAPER} />
        <div style={{ fontFamily: "V42Bold", fontSize: 52, color: PAPER }}>کشته</div>
        <div style={{ marginTop: 40, fontFamily: "V42Black", fontSize: 70, color: CH.c98, opacity: prog(t, tA - 0.1, tA + 0.2) }}>از جمله {fa(23)} کودک</div>
        <Src t={t} t0={0.2} style={{ marginTop: 26 }}>عفوِ بین‌الملل (Amnesty International)</Src>
      </div>
      <div style={{ position: "absolute", left: 140, top: 200 }}>
        <DotField n={304} mark={23} t={t} t0={tN - 0.2} dur={1.8} w={760} cols={19} color={PAPER} markColor={CH.c98} />
      </div>
    </AbsoluteFill>
  );
};

// ── chapter 4 · 1401 ──
const L25: React.FC = () => {
  const a = c(S(25)), tJ = wd(25, "ژینا") - a, tS = wd(25, "سقز") - a, tT = wd(25, "تهران") - a;
  const [sx, sy] = MAP.cities.saqqez, [tx, ty] = MAP.cities.tehran;
  return (
    <>
      <MapScene w={900} x={-330} draw={(t) => easeOut(prog(t, 0, 0.8))}>{(t) => {
        const u = easeInOut(prog(t, tS, tT + 0.5));
        return (
          <g>
            <Pin city="saqqez" t={t} t0={tS - 0.1} color={CH.c01} label="سقز" dx={-18} anchor="end" />
            <path d={`M${sx} ${sy} Q ${(sx + tx) / 2} ${Math.min(sy, ty) - 120} ${tx} ${ty}`} fill="none" stroke={CH.c01} strokeWidth={4} strokeDasharray="10 10" pathLength={1000} strokeDashoffset={0} style={{ clipPath: `inset(0 ${(1 - u) * 100}% 0 0)` }} opacity={u > 0 ? 1 : 0} />
            <Pin city="tehran" t={t} t0={tT - 0.1} color={CH.c01} label="تهران" dy={40} />
          </g>
        );
      }}</MapScene>
      <Local>{(t) => (
        <div style={{ position: "absolute", right: 170, top: 300, direction: "rtl", opacity: prog(t, tJ - 0.15, tJ + 0.2) }}>
          <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED }}>شهریور ۱۴۰۱</div>
          <div style={{ fontFamily: "V42Black", fontSize: 112, color: PAPER, lineHeight: 1.2 }}>ژینا مهسا امینی</div>
          <div style={{ height: 3, width: 560, background: CH.c01, opacity: 0.6, margin: "18px 0" }} />
          <div style={{ fontFamily: "V42Bold", fontSize: 48, color: PAPER, opacity: prog(t, wd(25, "بیست") - a, wd(25, "بیست") - a + 0.3) }}>۲۲ ساله، از سقز</div>
        </div>
      )}</Local>
    </>
  );
};
const L26: React.FC = () => {
  const t = useT(), a = c(S(26)), tG = wd(26, "ارشاد") - a, t3 = wd(26, "سه") - a, tH = wd(26, "بیمارستان") - a;
  const day = t < t3 ? 22 : Math.min(25, 22 + Math.floor((t - t3) / 0.25) + 1);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 300, top: 220, width: 440, height: 540, borderRadius: 20, background: "#16181c", border: "2px solid #2d3036", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ height: 110, background: day >= 25 ? "#3a1212" : "#24272d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V42Bold", fontSize: 44, color: PAPER }}>شهریور ۱۴۰۱</div>
        <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "V42Black", fontSize: 230, color: day >= 25 ? CH.c04 : PAPER, transform: `scale(${1 + kick(t, t3 + 0.75, 0.08)})` }}>{fa(day)}</div>
        <div style={{ textAlign: "center", fontFamily: "V42Bold", fontSize: 44, color: day >= 25 ? CH.c04 : PAPER, direction: "rtl" }}>{day >= 25 ? "درگذشت در بیمارستان" : day > 22 ? "در کُما" : "بازداشت"}</div>
      </div>
      <div style={{ position: "absolute", left: 220, top: 300, width: 700, direction: "rtl" }}>
        <div style={{ fontFamily: "V42Black", fontSize: 80, color: PAPER, opacity: prog(t, tG - 0.2, tG + 0.1) }}>گشتِ ارشاد</div>
        <div style={{ fontFamily: "V42Bold", fontSize: 50, color: MUTED, opacity: prog(t, tG + 0.4, tG + 0.7) }}>به خاطرِ حجاب</div>
        <div style={{ marginTop: 60, display: "flex", alignItems: "center", gap: 24, opacity: prog(t, tH - 0.2, tH + 0.1) }}>
          <IcCross s={90} c={CH.c04} /><div style={{ fontFamily: "V42Bold", fontSize: 50, color: PAPER }}>سه روز بعد</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const L27: React.FC = () => {
  const t = useT(), a = c(S(27)), tR = wd(27, "روسری‌هاشون") - a, tSh = wd(27, "شعار") - a, tZ = wd(27, "زن") - a, tL = wd(27, "زندگی") - a, tA = wd(27, "آزادی") - a;
  const scarf = easeInOut(prog(t, tR - 0.2, tR + 1.4));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(t, tSh - 0.2, tSh + 0.2) }}>
        <Phone id="v22a" x={W / 2 + 300} y={540} w={360} start={2} rot={-2} />
        <div style={{ position: "absolute", left: 240, top: 330, direction: "rtl" }}>
          <div style={{ fontFamily: "V42Bold", fontSize: 44, color: MUTED }}>سرِ خاکش در سقز</div>
          <div style={{ fontFamily: "V42Black", fontSize: 88, color: PAPER, marginTop: 10 }}>زن‌ها روسری‌ها<br />رو برداشتن</div>
        </div>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={`M ${700 - 400 * scarf} ${620 - 300 * scarf} c 80 ${-40 - 60 * Math.sin(t * 5)}, 160 ${40 + 40 * Math.sin(t * 4)}, 260 ${-10 - 30 * Math.sin(t * 6)} c 40 ${30 + 30 * Math.sin(t * 5)}, 80 ${-30}, 120 ${10}`} stroke={CH.c01} strokeWidth={26} fill="none" strokeLinecap="round" opacity={prog(t, tR - 0.2, tR) * (1 - prog(scarf, 0.8, 1))} />
        </svg>
      </div>
      <Center>
        {[["زن،", tZ], ["زندگی،", tL], ["آزادی", tA]].map(([w, t0], i) => {
          const u = backOut(prog(t, (t0 as number) - 0.08, (t0 as number) + 0.25));
          return <div key={i} style={{ position: "absolute", top: 260 + i * 200, width: "100%", textAlign: "center", fontFamily: "V42Slogan", fontSize: 190, color: i === 2 ? CH.c01 : PAPER, opacity: clamp(u * 2), transform: `scale(${lerp(1.5, 1, clamp(u))})`, textShadow: "0 10px 60px #000", direction: "rtl" }}>{w}</div>;
        })}
      </Center>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", opacity: prog(t, tSh - 0.1, tSh + 0.2) * (1 - prog(t, tZ - 0.2, tZ)) }}><Big size={64}>و یک شعار به دنیا اومد</Big></div>
    </AbsoluteFill>
  );
};
const L28: React.FC = () => {
  const t = useT(), a = c(S(28)), tW = wd(28, "زن‌ها") - a, tS = wd(28, "دانش‌آموزها") - a, tU = wd(28, "دانشجوها") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Phone id="v22b" x={560} y={540} w={360} start={4} rot={3} />
      <div style={{ position: "absolute", right: 200, top: 250, direction: "rtl", display: "flex", flexDirection: "column", gap: 36, alignItems: "flex-start" }}>
        <div style={{ fontFamily: "V42Bold", fontSize: 44, color: MUTED }}>این بار، جلودارها</div>
        <Chip color={CH.c01} t={t} t0={tW - 0.1} size={72}>زن‌ها</Chip>
        <Chip color={CH.c01} t={t} t0={tS - 0.1} size={60}>دانش‌آموزها</Chip>
        <Chip color={CH.c01} t={t} t0={tU - 0.1} size={60}>دانشجوها</Chip>
      </div>
    </AbsoluteFill>
  );
};
const L29: React.FC = () => {
  const t = useT(), a = c(S(29)), tZ = wd(29, "زاهدان") - a, tT = wd(29, "تهران") - a, tK = wd(29, "کردستان") - a, tU = wd(29, "دانشگاه‌ها") - a;
  const clip = t < tK - 0.1 ? "v22c" : "v22e";
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.9 }}><Clip key={clip} id={clip} start={clip === "v22c" ? 3 : 6} /></div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,11,13,0.92) 0%, rgba(10,11,13,0.6) 45%, rgba(10,11,13,0) 75%)" }} />
      <SourceTag id={clip} side="right" />
      <div style={{ position: "absolute", left: 40, top: 120 }}>
        <IranMap w={640} others={0.3}>
          <Pin city="zahedan" t={t} t0={tZ - 0.1} color={CH.c01} label="زاهدان" dx={-18} anchor="end" />
          <Pin city="tehran" t={t} t0={tT - 0.1} color={CH.c01} label="تهران" />
          <Pin city="sanandaj" t={t} t0={tK - 0.1} color={CH.c01} label="کردستان" dx={-18} anchor="end" />
          {["tehran", "tabriz", "shiraz", "isfahan", "mashhad", "karaj"].map((k, i) => <Pin key={k} city={k} t={t} t0={tU - 0.1 + i * 0.08} color={CH.c01} r={6} />)}
        </IranMap>
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 200, direction: "rtl", fontFamily: "V42Black", fontSize: 70, color: PAPER, opacity: prog(t, 0, 0.3) }}>ماه‌ها ادامه پیدا کرد</div>
    </AbsoluteFill>
  );
};
const L30: React.FC = () => {
  const t = useT(), a = c(S(30)), tB = wd(30, "مسدود") - a, tN = wd(30, "شب‌ها") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - prog(t, tN - 0.6, tN - 0.3), display: "flex", alignItems: "center", justifyContent: "center", gap: 140, flexDirection: "row-reverse" }}>
        <AppTile Ic={IcCam} name="اینستاگرام" t={t} t0={0} tB={tB} />
        <AppTile Ic={IcChat} name="واتس‌اپ" t={t} t0={wd(30, "واتس‌اپ") - a} tB={tB + 0.12} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: prog(t, tN - 0.5, tN - 0.2) }}>
        <Clip id="v22g" start={4} style={{ filter: "brightness(0.7) saturate(0.6)" }} />
        <SourceTag id="v22g" side="right" />
        <Dark k={0.35} />
        <div style={{ position: "absolute", left: 200, top: 300, display: "flex", alignItems: "center", gap: 30, direction: "rtl" }}>
          <IcMoon s={130} c={CH.c01} />
          <div><div style={{ fontFamily: "V42Black", fontSize: 90, color: PAPER }}>شب‌ها</div><div style={{ fontFamily: "V42Bold", fontSize: 44, color: MUTED }}>اینترنتِ موبایل قطع</div></div>
          <Signal level={level(t + a)} s={1.8} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
const L31: React.FC = () => {
  const t = useT(), a = c(S(31)), tN = wd(31, "پونصد") - a, tK = wd(31, "شصت") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", right: 170, top: 230, direction: "rtl" }}>
        <div style={{ fontFamily: "V42Bold", fontSize: 40, color: MUTED }}>دست‌کم</div>
        <Counter value={551} t={t} t0={tN - 0.2} dur={1.4} size={260} color={PAPER} />
        <div style={{ fontFamily: "V42Bold", fontSize: 52, color: PAPER }}>کشته</div>
        <div style={{ marginTop: 40, fontFamily: "V42Black", fontSize: 70, color: CH.c04, opacity: prog(t, tK - 0.1, tK + 0.2) }}>از جمله {fa(68)} کودک</div>
        <Src t={t} t0={0.2} style={{ marginTop: 26 }}>سازمانِ حقوقِ بشرِ ایران (IHR)، شهریور ۱۴۰۲</Src>
      </div>
      <div style={{ position: "absolute", left: 140, top: 160 }}>
        <DotField n={551} mark={68} t={t} t0={tN - 0.2} dur={2} w={760} cols={25} color={PAPER} markColor={CH.c04} />
      </div>
    </AbsoluteFill>
  );
};

// ── chapter 5 · 1404 ──
const L32: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Clip id="v26d" start={3} style={{ filter: "blur(10px) brightness(0.3) saturate(0.4)", transform: "scale(1.2)" }} />
      <Center><Rise text="و رسیدیم به دِی‌ماهِ ۱۴۰۴" t={t} t0={0.05} size={110} /></Center>
    </AbsoluteFill>
  );
};
const L33: React.FC = () => {
  const t = useT(), a = c(S(33)), tR = wd(33, "ریال") - a, tK = wd(33, "کرکره‌ها") - a;
  const pts = Array.from({ length: 50 }, (_, i) => { const x = i * 14, y = 40 + (i / 49) ** 1.6 * 230 + 12 * noise(i * 0.7); return `${x},${y}`; });
  const shown = Math.max(2, Math.floor(easeOut(prog(t, 0.6, tR + 1.2)) * 50));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Phone id="v26a" x={1380} y={540} w={360} start={0} rot={-2} />
      <div style={{ position: "absolute", left: 200, top: 210, direction: "rtl", width: 760 }}>
        <Chip color={CH.c04} t={t} t0={0.05} size={40}>۷ دِی ۱۴۰۴ · بازارِ تهران</Chip>
        <div style={{ marginTop: 60, fontFamily: "V42Bold", fontSize: 40, color: MUTED, opacity: prog(t, 0.4, 0.7) }}>ارزشِ ریال</div>
        <svg width={720} height={300} style={{ opacity: prog(t, 0.4, 0.7), direction: "ltr" }}>
          <polyline points={pts.slice(0, shown).join(" ")} fill="none" stroke={CH.c04} strokeWidth={6} />
        </svg>
        <div style={{ fontFamily: "V42Reg", fontSize: 22, color: MUTED }}>نمودار نمادین</div>
        <div style={{ marginTop: 30, fontFamily: "V42Black", fontSize: 76, color: PAPER, opacity: prog(t, tK - 0.1, tK + 0.2) }}>کرکره‌ها پایین</div>
      </div>
    </AbsoluteFill>
  );
};
const L34: React.FC = () => {
  const t = useT(), a = c(S(34)), tC = wd(34, "شهرهای") - a, tH = wd(34, "حکومت") - a;
  const ph = [["v26b", 1500, 2, 0], ["v26c", 1130, -2, 0.15], ["v26e", 760, 3, 0.3], ["v26f", 390, -3, 0.45]] as const;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {ph.map(([id, x, r, d], i) => {
        const u = backOut(prog(t, tC - 0.4 + d, tC + d));
        return <Phone key={id} id={id} x={x} y={560 + (1 - clamp(u)) * 700} w={330} rot={r} start={2} o={i === 0 ? 1 : clamp(u * 2)} />;
      })}
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", opacity: prog(t, tH - 0.3, tH) }}>
        <Big size={64}>شعارها مستقیم کلِ <span style={{ color: CH.c04 }}>حکومت</span> رو نشونه گرفت</Big>
      </div>
    </AbsoluteFill>
  );
};
const L35: React.FC = () => {
  const t = useT(), a = c(S(35)), tC = wd(35, "ساعت") - a, tZ = wd(35, "صفر") - a;
  const pts = Array.from({ length: 80 }, (_, i) => { const x = i * 10, f = i / 79; const v = f < 0.7 ? 0.85 + 0.08 * noise(i * 0.8) : lerp(0.85, 0.02, easeInOut(prog(f, 0.7, 0.8))); return `${x},${300 - v * 260}`; });
  const shown = Math.max(2, Math.floor(clamp((t - tC + 1.2) / (tZ - tC + 1.4)) * 80));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Phone id="v26g" x={1450} y={540} w={360} start={0} off={prog(t, tZ - 0.05, tZ + 0.1)} />
      <div style={{ position: "absolute", left: 180, top: 170, direction: "rtl", width: 880 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <div style={{ fontFamily: "V42Mono", fontSize: 150, color: PAPER, direction: "ltr" }}>20:{String(Math.min(0, 0)).padStart(2, "0")}</div>
          <Chip color={CH.c04} t={t} t0={0.05} size={40}>۱۸ دِی ۱۴۰۴</Chip>
        </div>
        <div style={{ fontFamily: "V42Bold", fontSize: 36, color: MUTED, marginTop: 20 }}>اتصالِ اینترنتِ ایران به دنیا</div>
        <svg width={800} height={320} style={{ direction: "ltr" }}><polyline points={pts.slice(0, shown).join(" ")} fill="none" stroke={t > tZ ? CH.c04 : PAPER} strokeWidth={6} /></svg>
        <div style={{ fontFamily: "V42Reg", fontSize: 22, color: MUTED }}>نمودار نمادین، بر پایه‌ی داده‌های NetBlocks و Cloudflare Radar</div>
        <div style={{ marginTop: 20, fontFamily: "V42Black", fontSize: 110, color: CH.c04, opacity: prog(t, tZ - 0.05, tZ + 0.15) }}>تقریباً صفر</div>
      </div>
    </AbsoluteFill>
  );
};
const L36: React.FC = () => {
  const t = useT(), a = c(S(36)), tB = wd(36, "خونین‌ترین") - a; void a;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}><Clip id="v26h" start={10} fit="cover" style={{ filter: "blur(3px) brightness(0.55) saturate(0.5)", transform: "scale(1.1)" }} /></div>
      <SourceTag id="v26h" side="right" />
      <Vignette k={0.95} />
      <Center><Rise text="پشتِ این خاموشی" t={t} t0={0.1} size={80} color={MUTED} font="V42Bold" /></Center>
      <Center y={130}><Big size={120} color={CH.c04} style={{ opacity: prog(t, tB - 0.1, tB + 0.3), transform: `scale(${1 + 0.02 * (t - tB)})` }}>خونین‌ترین روزها</Big></Center>
    </AbsoluteFill>
  );
};
const L37: React.FC = () => {
  const t = useT(), a = c(S(37)), tN = wd(37, "سه") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Center y={-80}><div style={{ fontFamily: "V42Bold", fontSize: 48, color: MUTED, direction: "rtl" }}>آمارِ رسمیِ حکومت</div></Center>
      <Center y={70}><Counter value={3117} t={t} t0={tN - 0.2} dur={1.6} size={300} /></Center>
      <Center y={260}><div style={{ fontFamily: "V42Bold", fontSize: 54, color: PAPER, direction: "rtl" }}>کشته</div></Center>
      <Src t={t} t0={0.3} style={{ position: "absolute", width: "100%", textAlign: "center", bottom: 150 }}>اعلامِ مقام‌های ایران، ۱ بهمن ۱۴۰۴</Src>
    </AbsoluteFill>
  );
};
const L38: React.FC = () => {
  const t = useT(), a = c(S(38)), tM = wd(38, "بیشتر") - a, tX = wd(38, "اختلافه") - a;
  const blur = prog(t, tM - 0.3, tM + 0.8);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Center y={-80}><div style={{ fontFamily: "V42Black", fontSize: 300, color: PAPER, filter: `blur(${blur * 14}px)`, opacity: 1 - 0.6 * blur }}>{faNum(3117)}</div></Center>
      <Center y={-80}><div style={{ fontFamily: "V42Black", fontSize: 420, color: CH.c04, opacity: prog(t, tM, tM + 0.4), transform: `scale(${lerp(0.6, 1, easeOut(prog(t, tM, tM + 0.6)))})` }}>؟</div></Center>
      <div style={{ position: "absolute", bottom: 190, width: "100%", display: "flex", justifyContent: "center", gap: 30, direction: "rtl" }}>
        <Chip color={PAPER} t={t} t0={0.3} size={36}>IHR: دست‌کم ۳٬۴۲۸ کشته‌ی مستند تا ۲ بهمن</Chip>
        <Chip color={CH.c04} t={t} t0={tX - 0.2} size={36}>شمارِ واقعی: هنوز محلِ اختلاف</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ── ending ──
const SLOG = ["«رأیِ من کجاست؟»", "«مرگ بر گرونی»", "«دیگه تمومه ماجرا»", "«زن، زندگی، آزادی»", "…"];
const L39: React.FC = () => {
  const t = useT(), a = c(S(39)), tQ = wd(39, "شعارهایی") - a;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center" }}><Big size={60} color={MUTED} font="V42Bold">هفده سال</Big></div>
      <div style={{ position: "absolute", top: 230, right: 300, width: 1320, direction: "rtl" }}>
        {SLOG.map((s, i) => {
          const u = easeOut(prog(t, 0.3 + i * (tQ / 5), 0.6 + i * (tQ / 5)));
          return (
            <div key={i} style={{ height: 112, display: "flex", alignItems: "center", gap: 40, opacity: u, transform: `translateX(${(1 - u) * -40}px)` }}>
              <div style={{ width: 170, fontFamily: "V42Black", fontSize: 44, color: YEARS[i].c }}>{YEARS[i].y}</div>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: YEARS[i].c }} />
              <div style={{ fontFamily: "V42Slogan", fontSize: 72, color: PAPER, whiteSpace: "nowrap" }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 150, width: "100%" }}><Rise text="تا شعارهایی که دیگه چیزی نمی‌پرسیدن" t={t} t0={tQ} size={60} font="V42Bold" /></div>
    </AbsoluteFill>
  );
};
const L40: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Center><Signal level={lerp(0.6, 0, easeInOut(prog(t, 0, 1.8)))} s={4} label={false} /></Center>
      <Center y={250}><Rise text="هر بار، صدا رو قطع کردن" t={t} t0={0.1} size={76} color={MUTED} font="V42Bold" /></Center>
    </AbsoluteFill>
  );
};
const ALL = ["v26g", "v22a", "v26e", "v22b", "v26f", "v26c", "v26b", "v26h", "v26i", "v26a", "v26d", "v22c"];
const L41: React.FC = () => {
  const t = useT(), a = c(S(41)), tP = wd(41, "گوشیش") - a;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {ALL.map((id, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        const t0 = i === 0 ? 0.15 : 0.15 + (tP + 0.6) * (0.15 + 0.85 * hash2(i));
        const u = easeOut(prog(t, t0, t0 + 0.5));
        const x = W - 180 - col * 312, y = 262 + row * 470;
        return <Phone key={id} id={id} x={x} y={y + (1 - u) * 60} w={205} start={2 + i} o={u} dim={0.15} rec={i === 0} />;
      })}
      <Vignette k={0.9} />
      <div style={{ position: "absolute", bottom: 36, width: "100%", textAlign: "center", opacity: prog(t, 0.1, 0.4) }}><Big size={60}>یکی دوباره گوشیش رو بالا گرفت</Big></div>
    </AbsoluteFill>
  );
};
const L42: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Center y={-20}><Rise text="فرزندِ ایران و جان‌فدای میهن" t={t} t0={0.05} step={0.12} size={96} /></Center>
      <div style={{ position: "absolute", left: W / 2 - 220, width: 440, top: 640, height: 3, background: PAPER, opacity: 0.6, transform: `scaleX(${easeOut(prog(t, 0.6, 1.8))})` }} />
    </AbsoluteFill>
  );
};

// ───────────────────────── layout ─────────────────────────
const SC: Record<number, React.FC> = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10, 11: L11, 12: L12, 13: L13, 14: L14, 15: L15, 16: L16, 17: L17, 18: L18, 19: L19, 20: L20, 21: L21, 22: L22, 23: L23, 24: L24, 25: L25, 26: L26, 27: L27, 28: L28, 29: L29, 30: L30, 31: L31, 32: L32, 33: L33, 34: L34, 35: L35, 36: L36, 37: L37, 38: L38, 39: L39, 40: L40, 41: L41, 42: L42 };
const startOf = (n: number) => (n === 1 ? 0 : CHAPS.find((ch) => ch.line === n) ? S(n) - 0.15 : c(S(n)));
const endOf = (n: number) => { const ch = CHAPS.find((x) => x.last === n); if (ch) return CHAPS[ch.i + 1]?.from ?? E(n) + 0.3; if (n === 4) return CHAPS[0].from; if (n === 42) return TOTAL; return startOf(n + 1); };

type CapW = { w: string; kw?: boolean; s: number; e: number };
const CAPS = capJson as { words: CapW[]; s: number; e: number; line: number }[];
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const cap = CAPS.find((x) => T >= x.s - 0.05 && T < x.e);
  if (!cap || [1, 2, 3, 4, 39, 40, 41, 42].includes(cap.line)) return null;
  const u = easeOut(prog(T, cap.s - 0.05, cap.s + 0.12));
  return (
    <div style={{ position: "absolute", bottom: 96, width: "100%", display: "flex", justifyContent: "center", opacity: u }}>
      <div style={{ direction: "rtl", padding: "8px 22px", borderRadius: 10, background: "rgba(0,0,0,0.55)", fontFamily: "V42Semi", fontSize: 34, color: PAPER, display: "flex", gap: 11 }}>
        {cap.words.map((w, i) => <span key={i} style={{ opacity: T >= w.s - 0.03 ? 1 : 0.45 }}>{w.w}</span>)}
      </div>
    </div>
  );
};
const HUD: React.FC<{ T: number }> = ({ T }) => {
  const k = chapAt(T), show = T > c(S(5)) - 0.4 && T < c(S(39));
  const ch = k >= 0 ? CHAPS[k] : null;
  const inCard = ch && T < S(ch.line) - 0.1;
  const o = show && !inCard ? 1 : 0;
  const pos = k < 0 ? 0 : k + (T > (CHAPS[k + 1]?.from ?? 1e9) - 0.6 ? easeInOut(prog(T, CHAPS[k + 1].from - 0.6, CHAPS[k + 1].from)) : 0);
  return (
    <>
      <div style={{ position: "absolute", top: 34, left: 40, opacity: (T < c(S(5)) - 0.4 ? 0 : 1) * (T > S(42) ? 0 : 1) }}><Signal level={level(T)} s={0.9} /></div>
      {ch && <div style={{ position: "absolute", top: 36, right: 44, direction: "rtl", fontFamily: "V42Bold", fontSize: 26, color: YEARS[k].c, opacity: o }}>فصل {ch.n} · {ch.sub}</div>}
      <div style={{ position: "absolute", bottom: 28, left: W / 2 - 300, opacity: o * 0.9 }}><Ribbon w={600} pos={pos} s={0.7} /></div>
    </>
  );
};
export const V42Video: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const f = useCurrentFrame(), T = f / FPS;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {Object.entries(SC).map(([n, Comp]) => <Scene key={n} from={startOf(+n)} to={endOf(+n)} fadeIn={+n === 1 ? 0 : 0.14} fadeOut={0.16}><Comp /></Scene>)}
      {CHAPS.map((ch) => <Scene key={"ch" + ch.i} from={ch.from} to={S(ch.line) - 0.15} fadeIn={0.1} fadeOut={0.15} z={5}><ChapterCard k={ch.i} /></Scene>)}
      <Grain o={0.8} />
      <Vignette k={0.55} />
      <Captions T={T} />
      <HUD T={T} />
      {audio && <Html5Audio src={staticFile("v42/vo.wav")} />}
    </AbsoluteFill>
  );
};

// one still per line (middle of each line) + chapter cards, for checking the look
export const LOOK = [...Array.from({ length: 42 }, (_, i) => (S(i + 1) + E(i + 1)) / 2), ...CHAPS.map((ch) => ch.from + 0.9)].sort((x, y) => x - y);
const LookFrame: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><FrameAt t={LOOK[Math.min(f, LOOK.length - 1)]} /></AbsoluteFill>;
};
const FrameAt: React.FC<{ t: number }> = ({ t }) => <Freeze frame={Math.round(t * FPS)}><V42Video audio={false} /></Freeze>;

export const V42Compositions: React.FC = () => (
  <>
    <Composition id="V42" component={V42Video} durationInFrames={V42_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="V42-Silent" component={V42Video} durationInFrames={V42_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: false }} />
    <Composition id="V42-Look" component={LookFrame} durationInFrames={V42_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
