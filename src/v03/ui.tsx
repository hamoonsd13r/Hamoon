// V03 · episode player, captions, title and end card (shared by all 13 episodes)
import React from "react";
import { AbsoluteFill, continueRender, delayRender, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, easeOut, FPS, H, prog, W } from "./lib";

const fontHandle = typeof document !== "undefined" ? delayRender("v03 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["V03Black", "fonts/Vazirmatn-Black.ttf"], ["V03Bold", "fonts/Vazirmatn-Bold.ttf"]].map(([f, u]) =>
    new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}

export type Word = { w: string; s: number; e: number; line: number };
export type VO = { total: number; segs: { n: number; sp: string; start: number; end: number }[]; words: Word[] };
export type ShotFn = React.FC<{ t: number; dur: number; T: number }>;
export type Shot = { at: number; S: ShotFn };

export const wd = (vo: VO, line: number, word: string) => {
  const w = vo.words.find((x) => x.line === line && x.w.includes(word));
  if (!w) throw new Error(`word not found: ${line} ${word}`);
  return w.s;
};

// word-by-word captions, 2–4 words per card, current word lit. Dialogue lines (speaker ≠ A) in quote colour.
export const Captions: React.FC<{ vo: VO; T: number; y?: number }> = ({ vo, T, y = 1330 }) => {
  const chunks: { words: Word[]; sp: string }[] = [];
  for (const seg of vo.segs) {
    const ws = vo.words.filter((w) => w.line === seg.n);
    let cur: Word[] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (cur.length >= 4 || len > 20 || /[.،؟!:]$/.test(w.w) || i === ws.length - 1) { chunks.push({ words: cur, sp: seg.sp }); cur = []; }
    });
  }
  const i = chunks.findIndex((c, k) => T >= c.words[0].s - 0.05 && (k === chunks.length - 1 || T < chunks[k + 1].words[0].s - 0.05));
  const c = chunks[i];
  if (!c || T > c.words[c.words.length - 1].e + 0.6) return null;
  const pop = easeOut(prog(T, c.words[0].s - 0.05, c.words[0].s + 0.12));
  const dia = c.sp !== "A";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, direction: "rtl", textAlign: "center", fontFamily: "V03Black", fontSize: 66, lineHeight: 1.35,
      transform: `translateY(${(1 - pop) * 18}px) scale(${0.94 + 0.06 * pop})`, opacity: pop }}>
      {dia && <span style={{ color: C.red }}>«</span>}
      {c.words.map((w, k) => {
        const on = T >= w.s - 0.03;
        return <span key={k} style={{ color: on ? (dia ? "#ffd2c8" : C.bone) : "rgba(239,233,223,0.35)", textShadow: "0 4px 18px rgba(0,0,0,0.95), 0 0 3px #000" }}>{w.w.replace(/[«»]/g, "")}{k < c.words.length - 1 ? " " : ""}</span>;
      })}
      {dia && <span style={{ color: C.red }}>»</span>}
    </div>
  );
};

export const Title: React.FC<{ T: number; title: string; sub: string; until: number }> = ({ T, title, sub, until }) => {
  const a = easeOut(prog(T, 0.05, 0.6)), out = 1 - prog(T, until - 0.4, until);
  const flick = T < 0.9 ? (Math.floor(T * 20) % 3 === 0 ? 0.4 : 1) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, direction: "rtl", textAlign: "center", opacity: a * out * flick }}>
      <div style={{ fontFamily: "V03Black", fontSize: 118, color: C.bone, letterSpacing: 0, textShadow: `0 0 40px rgba(224,36,47,0.55), 0 6px 24px #000`, transform: `scale(${1.08 - 0.08 * a})` }}>{title}</div>
      <div style={{ margin: "18px auto 0", width: 120 * a + 40, height: 6, background: C.red, boxShadow: `0 0 18px ${C.red}` }} />
      <div style={{ fontFamily: "V03Bold", fontSize: 50, color: "#c9d3e2", marginTop: 22, textShadow: "0 4px 16px #000" }}>{sub}</div>
    </div>
  );
};

export const EndCard: React.FC<{ t: number; next: string }> = ({ t, next }) => {
  const a = easeOut(prog(t, 0.05, 0.5));
  return (
    <AbsoluteFill style={{ background: "#020306", direction: "rtl", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "V03Black", fontSize: 96, color: C.bone, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, textShadow: `0 0 30px rgba(224,36,47,${0.4 + 0.3 * Math.sin(t * 9)})` }}>ادامه دارد…</div>
      <div style={{ fontFamily: "V03Bold", fontSize: 46, color: C.red, marginTop: 26, opacity: easeOut(prog(t, 0.35, 0.8)) }}>{next}</div>
    </AbsoluteFill>
  );
};

// plays the shots in order; each shot gets its local time. Hard cuts, with a short dip at shot starts flagged by the scene.
export const Episode: React.FC<{ shots: Shot[]; vo: VO; total: number; audio?: string; title: string; sub: string; next: string; times?: number[] }> = ({ shots, vo, total, audio, title, sub, next, times }) => {
  const f = useCurrentFrame();
  const T = times ? times[Math.min(f, times.length - 1)] : f / FPS;
  const k = shots.findIndex((s, i) => T >= s.at && (i === shots.length - 1 || T < shots[i + 1].at));
  const sh = shots[Math.max(0, k)];
  const end = k === shots.length - 1 ? total : shots[k + 1].at;
  const isEnd = T >= vo.total - 0.05;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {audio && !times && <Html5Audio src={staticFile(audio)} />}
      {isEnd ? <EndCard t={T - vo.total + 0.05} next={next} /> : (
        <>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
            <sh.S t={T - sh.at} dur={end - sh.at} T={T} />
          </svg>
          {/* 3-frame dip from black on every cut */}
          <AbsoluteFill style={{ background: "#000", opacity: clamp(1 - (T - sh.at) * FPS / 3) * 0.85, pointerEvents: "none" }} />
          <Title T={T} title={title} sub={sub} until={shots[1]?.at ?? 3} />
          <Captions vo={vo} T={T} />
        </>
      )}
    </AbsoluteFill>
  );
};
