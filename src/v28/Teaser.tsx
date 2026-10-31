// V28 · تیزر ۳۰ ثانیه‌ای عمودی برای اینستاگرام → مخاطب را به نسخه‌ی کامل یوتیوب می‌فرستد.
// همان صحنه‌های ویدیوی اصلی (SceneStack) روی قاب عمودی، با دوربینی که سوژه را دنبال می‌کند.
// هوک: شمارش معکوس ۱۰ دقیقه روی ابر قارچی · پایان: کارت «ادامه در یوتیوب، لینک در بیو».
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SceneStack, Vignette, CREAM } from "./Video";
import tz from "./teaser.json";

const FPS = 30, W = 1080, H = 1920, SC = 1920 / 1080;
type TW = { s: number; e: number; w: string; wi: number; seg: number };
const SEG = tz.seg as { k: string; ta: number; oa: number; ob?: number }[];
const WORDS = tz.words as TW[];
const LEN = tz.len;
const RED = "#D23A2B", INK = "#202125", FB = "V28Black", FN = "V28Num";
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const backOut = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const CTA = SEG[5].ta;

// camera focus (stage x) keyed on original-video time
const FOCUS: [number, number][][] = [
  [[14.3, 1000], [18.4, 1040]],
  [[27.75, 880], [31.3, 920]],
  [[59.7, 400], [61.05, 1330]],
  [[76.0, 940], [83.0, 1010]],
  [[105.4, 1360], [106.3, 1320], [108.4, 900], [110.0, 910], [112.6, 1050]],
];
const lerpKeys = (ks: [number, number][], x: number) => {
  if (x <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (x <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; const p = (x - a) / (b - a); const e = p * p * (3 - 2 * p); return va + (vb - va) * e; }
  return ks.at(-1)![1];
};

const Stage: React.FC<{ T: number; fx: number; extra?: number }> = ({ T, fx, extra = 1 }) => {
  const s = SC * extra;
  return (
    <div style={{ position: "absolute", left: W / 2 - fx * s, top: H / 2 - 540 * s, width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${s})`, overflow: "hidden" }}>
      <SceneStack T={T} />
    </div>
  );
};

// captions: ≤4 words, current word highlighted
const CH = (() => {
  const out: { ws: TW[]; a: number; b: number }[] = []; let cur: TW[] = [];
  const push = () => { if (cur.length) out.push({ ws: cur, a: cur[0].s - 0.06, b: cur.at(-1)!.e + 0.3 }); cur = []; };
  WORDS.forEach((w, i) => {
    if (cur.length && (w.seg !== cur[0].seg || w.wi === 0)) push();
    cur.push(w);
    if (/[،.؟!:؛]$/.test(w.w) || cur.length >= 4 || (WORDS[i + 1] && WORDS[i + 1].seg !== w.seg)) push();
  });
  push();
  for (let i = 0; i + 1 < out.length; i++) out[i].b = Math.min(out[i].b, out[i + 1].a);
  return out;
})();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const c = CH.find((x) => t >= x.a && t < x.b);
  if (!c) return null;
  const p = easeOut(prog(t, c.a, c.a + 0.16));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1250, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", direction: "rtl",
      transform: `scale(${0.85 + 0.15 * p})`, opacity: p }}>
      {c.ws.map((w, i) => {
        const on = t >= w.s - 0.03 && t < (c.ws[i + 1]?.s ?? c.b);
        return <span key={i} style={{ fontFamily: FB, fontSize: 84, lineHeight: 1.25, color: on ? "#FFC94D" : "#fff", display: "inline-block",
          transform: `scale(${on ? 1.12 : 1}) rotate(${on ? -2 : 0}deg)`, WebkitTextStroke: "0px", textShadow: "0 0 3px #000, 0 4px 0 #000, 0 6px 18px rgba(0,0,0,0.8)" }}>{w.w}</span>;
      })}
    </div>
  );
};

const Teaser: React.FC<{ audio?: string }> = ({ audio }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const si = SEG.filter((s) => t >= s.ta).length - 1;
  const s = SEG[si];
  const local = t - s.ta;
  const kick = 1 + 0.14 * Math.pow(1 - prog(local, 0, 0.28), 2); // punch-in on every cut
  const flash = si > 0 ? 0.55 * (1 - prog(local, 0, 0.12)) : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {si < 5 ? (
        <Stage T={s.oa + local} fx={lerpKeys(FOCUS[si], s.oa + local)} extra={kick} />
      ) : (
        <>
          <div style={{ filter: "blur(7px) brightness(0.45)" }}><Stage T={187.4 + local * 0.14} fx={1150} /></div>
        </>
      )}
      <Vignette k={0.5} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* HOOK: 10-minute countdown on the mushroom cloud */}
      {t < 4.3 && (() => {
        const left = Math.max(0, 600 - Math.floor(t * 12));
        const p = backOut(prog(t, 0, 0.3));
        return (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: 1 - prog(t, 4.0, 4.25), transform: `scale(${0.6 + 0.4 * p})` }}>
            <div style={{ display: "inline-block", background: RED, color: "#fff", fontFamily: FB, fontSize: 54, padding: "8px 34px", borderRadius: 14, direction: "rtl", transform: "rotate(-2deg)" }}>فقط این‌قدر وقت داری</div>
            <div style={{ fontFamily: FN, fontSize: 250, color: "#fff", direction: "ltr", lineHeight: 1.1, textShadow: `0 0 0 #000, 0 10px 0 ${INK}, 0 18px 40px rgba(0,0,0,0.7)`, transform: `translateX(${Math.sin(t * 50) * (t % 1 < 0.1 ? 6 : 0)}px)` }}>
              {fa(String(Math.floor(left / 60)).padStart(2, "0"))}:{fa(String(left % 60).padStart(2, "0"))}
            </div>
          </div>
        );
      })()}

      {/* day tag while the story runs */}
      {t > 4.1 && t < CTA && (
        <div style={{ position: "absolute", left: W / 2, top: 250, transform: `translate(-50%,0) scale(${0.8 + 0.2 * backOut(prog(t, 4.1, 4.4))})`, opacity: prog(t, 4.1, 4.25),
          background: "rgba(15,15,18,0.78)", color: "#fff", fontFamily: FB, fontSize: 46, padding: "10px 32px", borderRadius: 40, direction: "rtl", border: `3px solid ${RED}`, whiteSpace: "nowrap" }}>
          روزِ ۱ از ۱۴ <span style={{ color: "#ff8a7a" }}>●</span>
        </div>
      )}

      {/* CTA */}
      {t >= CTA && (() => {
        const u = t - CTA;
        const yt = 26.0 - CTA, bio = 28.2 - CTA;
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: prog(u, 0.05, 0.3), transform: `translateY(${(1 - easeOut(prog(u, 0, 0.4))) * -60}px)` }}>
              <div style={{ fontFamily: FB, fontSize: 64, color: "#fff", direction: "rtl" }}>این تازه روزِ اوله…</div>
              <div style={{ fontFamily: FN, fontSize: 170, color: "#fff", direction: "rtl", lineHeight: 1.2, textShadow: "0 8px 0 #000" }}>۱۴ روز زیرِ شهر</div>
            </div>
            {/* play card */}
            <div style={{ position: "absolute", left: W / 2, top: 800, transform: `translate(-50%,-50%) scale(${backOut(prog(u, yt - 0.25, yt + 0.15)) * (1 + 0.03 * Math.sin(u * 6))})`, opacity: prog(u, yt - 0.25, yt - 0.1),
              background: CREAM, borderRadius: 34, padding: "34px 54px", display: "flex", alignItems: "center", gap: 34, direction: "rtl", border: `6px solid ${INK}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ width: 150, height: 106, borderRadius: 30, background: "#E62117", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderLeft: "44px solid #fff", marginLeft: 10 }} />
              </div>
              <div style={{ fontFamily: FB, fontSize: 62, color: INK, whiteSpace: "nowrap" }}>نسخه‌ی کامل در یوتیوب</div>
            </div>
            {/* link in bio */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", opacity: prog(u, bio - 0.2, bio), transform: `scale(${0.7 + 0.3 * backOut(prog(u, bio - 0.2, bio + 0.2))})` }}>
              <div style={{ fontSize: 90, transform: `translateY(${-Math.abs(Math.sin(u * 5)) * 26}px)` }}>👆</div>
              <div style={{ display: "inline-block", fontFamily: FB, fontSize: 60, color: INK, background: "#FFC94D", padding: "10px 40px", borderRadius: 20, direction: "rtl" }}>لینک توی بیو</div>
            </div>
          </AbsoluteFill>
        );
      })()}

      <Captions t={t} />
      <AbsoluteFill style={{ background: "#000", opacity: prog(t, LEN - 0.35, LEN) }} />
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

const LOOK = [0.1, 1.5, 3.5, 4.4, 6.5, 8.2, 11, 14.5, 17, 19.5, 22, 24, 26.6, 29];
const Look: React.FC = () => {
  const f = useCurrentFrame();
  return <TeaserAt t={LOOK[Math.min(f, LOOK.length - 1)]} />;
};
// render Teaser at an arbitrary time (for the look sheet)
const TeaserAt: React.FC<{ t: number }> = ({ t }) => {
  const Inner = Teaser as React.FC<{ audio?: string }>;
  return <FrameOverride t={t}><Inner /></FrameOverride>;
};
// tiny helper: shift useCurrentFrame inside via Sequence
const FrameOverride: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const f = useCurrentFrame();
  return <Sequence from={f - Math.round(t * FPS)} layout="none">{children}</Sequence>;
};

export const V28Teaser: React.FC = () => (
  <>
    <Composition id="V28T" component={Teaser} durationInFrames={Math.round(LEN * FPS)} fps={FPS} width={W} height={H} defaultProps={{ audio: "v28/teaser-mix-norm.wav" }} />
    <Composition id="V28T-Silent" component={Teaser} durationInFrames={Math.round(LEN * FPS)} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V28T-Look" component={Look} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} />
  </>
);
