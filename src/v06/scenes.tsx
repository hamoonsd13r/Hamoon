// Video 06 scenes — one per sentence. Scene area y ≈ 860–1720 (receipt above, captions at 620, status pill at 1752).
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import { Burst, FloatUp, floatStyle, Rings } from "../styles/receipt-ui/fx";
import { Card, Cursor, fr, Phone, Stamp } from "../styles/receipt-ui/kit";
import { C, clamp, easeBack, easeOut, fa, ramp, rnd, T } from "../styles/receipt-ui/theme";
import { CarSide, CarTop, DroneTop, EMOJI, FA_UI, Person, Pod, QR, RoadSign, Stars } from "./art";
import { E, TM } from "./times";

export type SP = { from: number };
const useLocal = (from: number) => {
  const f = useCurrentFrame();
  return { f, at: (sec: number) => fr(sec - from) };
};
const pop = (f: number, a: number, d = 9) => ramp(f, a, a + d, easeBack);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Clip the scene to its band with soft top/bottom edges. */
const Band: React.FC<{ children: React.ReactNode; top?: number; h?: number }> = ({ children, top = 840, h = 890 }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height: h, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 60px, #000 calc(100% - 60px), transparent 100%)" }}>
    <div style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }}>{children}</div>
  </div>
);
const Chip: React.FC<{ x: number; y: number; a: number; children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ x, y, a, children, bg = "#fff", color = "#111", size = 34 }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${a})`, opacity: a > 0 ? 1 : 0, background: bg, color, borderRadius: 40, padding: "10px 28px", fontSize: size, whiteSpace: "nowrap", boxShadow: "0 14px 30px rgba(0,0,0,.25)", ...FA_UI }}>
    {children}
  </div>
);
const Emo: React.FC<{ children: string; size?: number; style?: React.CSSProperties }> = ({ children, size = 40, style }) => <span style={{ fontFamily: EMOJI, fontSize: size, ...style }}>{children}</span>;

/* 0 · dark · Chalus road jammed, bladder meter drains */
const TREES = Array.from({ length: 26 }, (_, i) => ({ x: i % 2 ? 60 + rnd(i) * 230 : 790 + rnd(i) * 240, y: 820 + rnd(i + 40) * 980, r: 34 + rnd(i + 9) * 40 }));
export const Sc0: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const crawl = f * 0.5;
  const drain = clamp(ramp(f, at(TM.taghat) - 12, at(TM.nadari) + 6));
  const level = 0.55 - 0.5 * drain;
  const red = f >= at(TM.nadari);
  return (
    <Band>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {TREES.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${((t.y + crawl * 0.3 - 820) % 980) + 820})`}>
            <circle r={t.r} fill="#0f3a24" /><circle r={t.r * 0.7} cx={-t.r * 0.2} cy={-t.r * 0.2} fill="#17543a" />
          </g>
        ))}
        <g transform="rotate(-6 540 1300)">
          <rect x={330} y={700} width={420} height={1200} fill="#2a2c31" />
          <rect x={330} y={700} width={10} height={1200} fill="#d8d8d8" /><rect x={740} y={700} width={10} height={1200} fill="#d8d8d8" />
          {Array.from({ length: 14 }, (_, i) => <rect key={i} x={536} y={700 + ((i * 100 + crawl) % 1400)} width={8} height={50} fill="#e8e3c8" opacity={0.8} />)}
          {Array.from({ length: 12 }, (_, i) => {
            const lane = i % 2;
            const y = 780 + Math.floor(i / 2) * 180 + lane * 70 + Math.sin(f / 22 + i) * 4;
            const me = i === 6;
            const brake = 0.5 + 0.5 * Math.sin(f / 8 + i * 1.3);
            return <CarTop key={i} x={lane ? 640 : 440} y={y} s={0.95} color={me ? C.blue : ["#6b7080", "#8a8e99", "#b5b8bf", "#4f5562", "#9a3d3d", "#d9d9dc"][i % 6]} brake={brake} hi={me} />;
          })}
        </g>
        {/* "you" ring */}
        <g transform="rotate(-6 540 1300)">
          <circle cx={440} cy={1320} r={110 + 10 * Math.sin(f / 6)} fill="none" stroke={red ? C.red : C.blue} strokeWidth="5" strokeDasharray="14 12" transform={`rotate(${f * 2} 440 1320)`} />
        </g>
      </svg>
      {/* bladder meter */}
      <div style={{ position: "absolute", left: 60, top: 1000, width: 190, transform: `translateX(${(1 - ramp(f, 4, 18, easeOut)) * -260}px) rotate(${red ? Math.sin(f * 1.8) * 3 : 0}deg)`, ...FA_UI }}>
        <div style={{ background: "#1a1a1e", border: `2px solid ${red ? C.red : "rgba(255,255,255,.1)"}`, borderRadius: 26, padding: 18, boxShadow: red ? "0 0 40px rgba(229,72,77,.5)" : "0 20px 40px rgba(0,0,0,.5)" }}>
          <div style={{ color: "#fff", fontSize: 30, textAlign: "center" }}>طاقت <Emo size={28}>{red ? "😖" : "😐"}</Emo></div>
          <div style={{ position: "relative", height: 300, margin: "14px auto 6px", width: 74, borderRadius: 37, background: "#2a2a30", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: red ? C.red : `linear-gradient(0deg, ${C.blue}, #7fa6ff)` }} />
            {Array.from({ length: 5 }, (_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 50 + i * 50, height: 3, background: "rgba(255,255,255,.12)" }} />)}
          </div>
          <div style={{ color: red ? "#ff8a8d" : "#9aa", fontSize: 36, textAlign: "center", fontFamily: FONT_NUM }}>{fa(Math.round(level * 100))}٪</div>
        </div>
      </div>
      <RoadSign x={780} y={880} a={pop(f, at(TM.chalus), 12)} s={0.8} lines={[["چالوس", "۴۵"], ["مرزن‌آباد", "۱۸"]]} />
      <Chip x={540} y={1650} a={pop(f, at(TM.sizdah))} bg="#1d3b2a" color="#c8f5d6">
        <Emo size={32}>🌱</Emo> سیزده‌به‌در · ۰ کیلومتر بر ساعت
      </Chip>
      {red && <Rings x={440 - 20} y={1300} f={f} at={at(TM.nadari)} color={C.red} r0={90} r1={260} n={2} />}
    </Band>
  );
};

/* 1 · light · the queue for the roadside toilet snakes all the way to Karaj */
const qPt = (u: number): [number, number] => [540 + 280 * Math.sin(u / 210), 1580 - u * 0.62];
export const Sc1: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const pan = 1320 * ramp(f, at(TM.wc) + 6, at(TM.karaj) + 4, (t) => t * t * (3 - 2 * t));
  const N = 76;
  const end = qPt(N * 40 + 30);
  const km = Math.round(92 * ramp(f, at(TM.wc), at(TM.karaj) + 6));
  return (
    <Band>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${pan}px)` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", overflow: "visible" }}>
          <path d={Array.from({ length: N + 2 }, (_, i) => { const [x, y] = qPt(i * 40); return `${i ? "L" : "M"}${x} ${y + 60}`; }).join(" ")} fill="none" stroke="#dcdce2" strokeWidth="120" strokeLinecap="round" />
          {Array.from({ length: N }, (_, i) => {
            const [x, y] = qPt(i * 40 + 70);
            return <Person key={i} x={x} y={y} s={0.85} f={f} seed={i} color={["#4b5567", "#6a7487", "#2f6bff", "#8b93a3", "#394150"][i % 5]} skin={["#e0b896", "#c99c78", "#f0cfb0"][i % 3]} />;
          })}
        </svg>
        {/* toilet building at the head of the line */}
        <div style={{ position: "absolute", left: 640, top: 1560, width: 330, ...FA_UI }}>
          <Card mode="light" x={0} y={0} w={330} pad={22}>
            <div style={{ textAlign: "center", fontSize: 30 }}><Emo size={64}>🚻</Emo></div>
            <div style={{ textAlign: "center", fontSize: 28, fontFamily: FONT_TEXT, direction: "rtl" }}>سرویس بین‌راهی</div>
            <div style={{ textAlign: "center", fontSize: 22, color: C.red, fontFamily: FONT_TEXT }}>نوبت: ۱ از ۳٬۴۰۰</div>
          </Card>
        </div>
        {/* end-of-line pin */}
        <div style={{ position: "absolute", left: end[0] - 170, top: end[1] - 150, width: 340, textAlign: "center", transform: `scale(${pop(f, at(TM.karaj))})`, ...FA_UI }}>
          <div style={{ background: C.red, color: "#fff", borderRadius: 24, padding: "12px 20px", fontSize: 34, boxShadow: "0 14px 30px rgba(229,72,77,.4)" }}>📍 کرج · انتهای صف</div>
          <div style={{ width: 0, height: 0, margin: "0 auto", borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `20px solid ${C.red}` }} />
        </div>
      </div>
      <Chip x={540} y={1660} a={pop(f, at(TM.saf))} bg="#111" color="#fff">
        طول صف: <span style={{ fontFamily: FONT_NUM }}>{fa(km)}</span> کیلومتر
      </Chip>
    </Band>
  );
};

/* 2 · dark · the «توالت‌پرون» app, tap «درخواست توالت» */
export const Sc2: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 16, easeOut);
  const logo = pop(f, at(TM.name), 12);
  const tap = at(TM.request) + 4;
  const tapped = f >= tap;
  const cur = ramp(f, at(TM.toilet) - 6, tap - 1, easeOut);
  return (
    <>
      <Rings x={540} y={1250} f={f} every={30} n={3} color={C.blue} r0={220} r1={480} />
      <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateY(${(1 - enter) * -30}deg) translateY(${(1 - enter) * 90}px)`, opacity: enter }}>
        <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 2, 6) }}>
          <Phone x={338} y={870} s={0.92} screen="linear-gradient(170deg,#1b3fae 0%,#2f6bff 55%,#7fa6ff 100%)">
            {/* faint map */}
            <svg width={412} height={852} style={{ position: "absolute", opacity: 0.18 }}>
              {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-40 + i * 60} 0 L${60 + i * 60} 852`} stroke="#fff" strokeWidth="6" />)}
              {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M0 ${100 + i * 120} L412 ${60 + i * 120}`} stroke="#fff" strokeWidth="3" />)}
            </svg>
            <div style={{ position: "absolute", left: 0, top: 150, width: 412, textAlign: "center", ...FA_UI }}>
              <div style={{ width: 150, height: 150, margin: "0 auto", borderRadius: 40, background: "#fff", boxShadow: "0 20px 40px rgba(0,0,0,.3)", transform: `scale(${logo}) rotate(${(1 - logo) * -30}deg)`, position: "relative" }}>
                <svg width={150} height={150} viewBox="-75 -75 150 150" style={{ position: "absolute", left: 0, top: 0 }}>
                  {[-45, 45].map((x) => <g key={x}><path d={`M${x * 0.5} -40 L${x} -52`} stroke="#5d6470" strokeWidth="5" /><ellipse cx={x} cy={-54} rx={22 * (0.5 + 0.5 * Math.abs(Math.sin(f * 1.3 + x)))} ry="4" fill="#2b2f36" /></g>)}
                </svg>
                <div style={{ position: "absolute", left: 0, top: 30, width: 150, textAlign: "center" }}><Emo size={74}>🚽</Emo></div>
              </div>
              <div style={{ color: "#fff", fontSize: 50, marginTop: 26, opacity: logo }}>توالت‌پرون</div>
              <div style={{ color: "rgba(255,255,255,.8)", fontSize: 22, opacity: logo }}>هرجا گیر کردی، توالت میاد پیشت</div>
            </div>
            {/* request sheet */}
            <div style={{ position: "absolute", left: 14, right: 14, top: 560, borderRadius: 30, background: "#fff", padding: 22, transform: `translateY(${(1 - pop(f, at(TM.open), 12)) * 300}px)`, ...FA_UI }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21, color: "#555" }}><span>📍 جاده‌ی چالوس، کیلومتر ۲۷</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0 16px", padding: "10px 14px", borderRadius: 16, background: "#eef3ff", border: `2px solid ${C.blue}` }}>
                <span style={{ fontSize: 24 }}><Emo size={26}>🚽</Emo> اکونومی</span><span style={{ fontSize: 22, color: C.blue }}>۳ دقیقه</span>
              </div>
              <div style={{ height: 70, borderRadius: 20, background: tapped ? "#1b46c8" : C.blue, color: "#fff", fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${tapped && f < tap + 6 ? 0.95 : 1})` }}>
                {tapped ? <>در حال پیدا کردن پهپاد{".".repeat(1 + (Math.floor(f / 6) % 3))}</> : "درخواست توالت"}
              </div>
            </div>
          </Phone>
          <Cursor x={lerp(860, 600, cur)} y={lerp(1700, 1560, cur)} a={ramp(f, at(TM.toilet) - 8, at(TM.toilet))} click={tapped ? clamp((f - tap) / 14) : 0} />
        </div>
      </div>
      <Burst x={540} y={1530} f={f} at={tap} n={18} colors={["#fff", "#9db8ff", C.blue]} />
    </>
  );
};

/* 3 · light · map: drone flies to your car, megaphone, cars make room */
export const Sc3: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const fly = ramp(f, at(TM.drone) - 4, at(TM.find) + 8, (t) => t * t * (3 - 2 * t));
  const me: [number, number] = [470, 470];
  const dx = lerp(860, me[0] + 10, fly), dy = lerp(-60, me[1] - 140, fly) + Math.sin(f / 6) * 6;
  const clear = ramp(f, at(TM.space) - 4, at(TM.open2) + 6, easeOut);
  const bubble = pop(f, at(TM.speaker));
  const enter = ramp(f, 0, 14, easeOut);
  return (
    <div style={{ position: "absolute", left: 70, top: 880, width: 940, height: 820, borderRadius: 40, overflow: "hidden", boxShadow: T.light.shadow, opacity: enter, transform: `scale(${0.94 + 0.06 * enter})` }}>
      <svg width={940} height={820} style={{ position: "absolute", background: "#e9ece6" }}>
        {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(i) * 940} cy={rnd(i + 3) * 820} r={20 + rnd(i + 7) * 30} fill={i % 2 ? "#cfe0c4" : "#bfd6b2"} />)}
        <g transform="rotate(-18 470 410)">
          <rect x={-200} y={350} width={1400} height={240} fill="#9aa0a8" />
          <path d="M-200 470 H1200" stroke="#fff" strokeWidth="5" strokeDasharray="34 26" />
          {Array.from({ length: 14 }, (_, i) => {
            const lane = i % 2;
            const bx = -120 + Math.floor(i / 2) * 170 + lane * 60;
            const by = lane ? 530 : 410;
            const isMe = i === 6;
            const d = isMe ? 0 : Math.sign(bx - 400) * clear * (Math.abs(bx - 400) < 360 ? 150 : 40);
            return <CarTop key={i} x={bx + d} y={by} rot={90} s={0.55} color={isMe ? C.blue : ["#6b7080", "#8a8e99", "#4f5562", "#9a3d3d", "#d9d9dc"][i % 5]} hi={isMe} />;
          })}
        </g>
        {clear > 0 && <circle cx={me[0]} cy={me[1]} r={60 + 120 * clear} fill="rgba(47,179,107,.12)" stroke={C.green} strokeWidth="5" strokeDasharray="16 12" transform={`rotate(${f} ${me[0]} ${me[1]})`} />}
        <path d={`M860 -60 Q 800 200 ${me[0] + 10} ${me[1] - 140}`} fill="none" stroke={C.blue} strokeWidth="5" strokeDasharray="4 14" strokeLinecap="round" opacity={0.7} />
        <DroneTop x={dx} y={dy} s={0.9} f={f} rot={(1 - fly) * 25} />
      </svg>
      <Rings x={me[0]} y={me[1]} f={f} every={22} n={2} color={C.blue} r0={30} r1={120} />
      <div style={{ position: "absolute", left: me[0] - 50, top: me[1] + 60, background: C.blue, color: "#fff", borderRadius: 14, padding: "4px 16px", fontSize: 26, opacity: pop(f, at(TM.car)), ...FA_UI }}>تو</div>
      {/* megaphone bubble */}
      <div style={{ position: "absolute", left: dx - 380, top: dy - 210, width: 360, transform: `scale(${bubble})`, transformOrigin: "100% 100%", ...FA_UI }}>
        <div style={{ background: "#111", color: "#fff", borderRadius: 26, padding: "16px 22px", fontSize: 28, lineHeight: 1.5, transform: `rotate(${Math.sin(f / 3) * 1.5}deg)` }}>
          <Emo size={32}>📢</Emo> لطفاً یه کم جا باز کنید! شرایط اضطراریه!
        </div>
      </div>
      {f >= at(TM.speaker) && Array.from({ length: 3 }, (_, i) => {
        const k = ((f - at(TM.speaker)) / 12 + i / 3) % 1;
        return <div key={i} style={{ position: "absolute", left: dx - 40 - k * 120, top: dy - 70 - k * 60, width: 50 + k * 60, height: 50 + k * 60, borderRadius: "50%", border: `4px solid rgba(17,17,17,${0.5 * (1 - k)})`, borderLeftColor: "transparent", borderBottomColor: "transparent", transform: "rotate(-60deg)" }} />;
      })}
    </div>
  );
};

/* 4 · dark · drone camera: AI dodges power lines, lands next to the car */
export const Sc4: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const W = 960, H = 830;
  const desc = ramp(f, 0, at(TM.land) + 2, (t) => 1 - Math.pow(1 - t, 1.6));
  const py = lerp(-260, 560, desc);
  const px = 480 + Math.sin(desc * Math.PI * 2.2) * 170 * (1 - desc) + desc * 120;
  const landed = f >= at(TM.land) + 2;
  const alt = Math.max(0, Math.round(120 * (1 - desc)));
  const wiresA = ramp(f, at(TM.wires) - 3, at(TM.wires) + 6);
  const car = pop(f, at(TM.next));
  const ai = pop(f, at(TM.ai));
  const wire = (y0: number, sag: number) => `M-20 ${y0} Q ${W / 2} ${y0 + sag} ${W + 20} ${y0}`;
  return (
    <div style={{ position: "absolute", left: 60, top: 870, width: W, height: H, borderRadius: 36, overflow: "hidden", border: "2px solid rgba(255,255,255,.12)" }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs><linearGradient id="sky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b8fd6" /><stop offset="1" stopColor="#c5dcf2" /></linearGradient></defs>
        <rect width={W} height={H} fill="url(#sky4)" />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={((i * 380 + f * 0.8) % 1300) - 150} cy={90 + i * 60} rx={120} ry={30} fill="rgba(255,255,255,.55)" />)}
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 120 - 30} 690 l60 -140 l60 140 Z`} fill={i % 2 ? "#2d5f3c" : "#3b7a4c"} />)}
        <rect y={680} width={W} height={150} fill="#7b8a56" />
        <rect y={730} width={W} height={60} fill="#4a4d55" />
        {[160, 820].map((x) => <g key={x}><rect x={x - 8} y={180} width={16} height={510} fill="#6b5a45" /><rect x={x - 60} y={200} width={120} height={12} fill="#6b5a45" /></g>)}
        {[[230, 70], [300, 90], [212, 120]].map(([y0, sag], i) => <path key={i} d={wire(y0, sag)} stroke="#222" strokeWidth="4" fill="none" />)}
        <g transform="translate(700 660)"><CarSide x={0} y={0} s={0.42} color={C.blue} f={0} /></g>
        <Pod x={px} y={py} s={0.36} f={f} rot={landed ? 0 : Math.cos(desc * Math.PI * 2.2) * -10} rotors={landed ? 0.2 : 1} />
      </svg>
      {/* HUD */}
      <div style={{ position: "absolute", inset: 0, fontFamily: FONT_TEXT, color: "#fff", direction: "rtl" }}>
        {[[18, 18], [W - 78, 18], [18, H - 78], [W - 78, H - 78]].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 60, height: 60, borderColor: "#fff", borderStyle: "solid", borderWidth: `${i < 2 ? 5 : 0}px ${i % 2 ? 5 : 0}px ${i >= 2 ? 5 : 0}px ${i % 2 ? 0 : 5}px` }} />
        ))}
        <div style={{ position: "absolute", left: 40, top: 40, fontSize: 26, direction: "ltr", fontFamily: "monospace" }}><span style={{ color: C.red, opacity: Math.floor(f / 15) % 2 ? 1 : 0.3 }}>●</span> REC · CAM-1</div>
        <div style={{ position: "absolute", right: 40, top: 36, fontSize: 28, background: "rgba(0,0,0,.45)", padding: "4px 16px", borderRadius: 12 }}>ارتفاع: <span style={{ fontFamily: FONT_NUM }}>{fa(alt)}</span> متر</div>
        <div style={{ position: "absolute", right: 40, top: 92, fontSize: 26, background: C.blue, padding: "4px 16px", borderRadius: 12, transform: `scale(${ai})`, transformOrigin: "100% 50%" }}>🤖 دید هوش مصنوعی · فعال</div>
        {/* detection boxes on wires */}
        {[[90, 230, "سیم برق · ۹۹٪"], [560, 290, "سیم برق · ۹۷٪"]].map(([x, y, l], i) => {
          const a = clamp(wiresA * 2 - i * 0.6);
          return a > 0 && !landed ? (
            <div key={i} style={{ position: "absolute", left: x as number, top: (y as number) - 30, width: 300, height: 90, border: `4px solid ${C.red}`, borderRadius: 8, opacity: a, transform: `scale(${1.3 - 0.3 * a})` }}>
              <div style={{ position: "absolute", right: -4, top: -44, background: C.red, padding: "2px 12px", fontSize: 24, borderRadius: 6, whiteSpace: "nowrap" }}>{l}</div>
            </div>
          ) : null;
        })}
        {car > 0 && (
          <div style={{ position: "absolute", left: 590, top: 590, width: 230, height: 120, border: `4px solid ${C.green}`, borderRadius: 8, opacity: car }}>
            <div style={{ position: "absolute", right: -4, top: -44, background: C.green, padding: "2px 12px", fontSize: 24, borderRadius: 6, whiteSpace: "nowrap" }}>ماشین تو ✓</div>
          </div>
        )}
        <svg width={W} height={H} style={{ position: "absolute" }}><circle cx={W / 2} cy={H / 2} r={46} stroke="rgba(255,255,255,.6)" strokeWidth="3" fill="none" /><path d={`M${W / 2 - 70} ${H / 2} h40 M${W / 2 + 30} ${H / 2} h40 M${W / 2} ${H / 2 - 70} v40 M${W / 2} ${H / 2 + 30} v40`} stroke="rgba(255,255,255,.6)" strokeWidth="3" /></svg>
      </div>
      <Burst x={px} y={py + 80} f={f} at={at(TM.land) + 2} n={22} power={1.1} colors={["#c9b48a", "#a8956c", "#fff"]} />
    </div>
  );
};

/* 5 · light · scan the QR, door opens, you go in, «اشغال» */
export const Sc5: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const phone = ramp(f, at(TM.qr) - 10, at(TM.qr) + 4, easeOut);
  const scanned = f >= at(TM.scan) + 4;
  const open = ramp(f, at(TM.go) - 2, at(TM.go) + 8, easeOut) * (1 - ramp(f, at(TM.kar), at(TM.kar) + 8, easeOut));
  const walk = ramp(f, at(TM.go), at(TM.kar) + 2);
  const occupied = f >= at(TM.kar) + 4;
  const prog = clamp((f - at(TM.kar) - 4) / 40);
  const enter = ramp(f, 0, 14, easeOut);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", transform: `translateY(${(1 - enter) * 120}px)`, opacity: enter }}>
        <rect x={0} y={1590} width={1080} height={20} fill="#d9d9de" />
        <Pod x={430} y={1290} s={0.95} f={f} rotors={0.15} door={open} occupied={occupied} />
        {walk > 0 && walk < 1 && <Person x={lerp(760, 430, walk)} y={1420 + Math.abs(Math.sin(walk * 18)) * -10} s={1.2} f={f} color="#394150" />}
      </svg>
      {/* scan phone */}
      <div style={{ position: "absolute", left: lerp(1100, 700, phone), top: 1060, transform: `rotate(${-8 + 8 * phone}deg)` }}>
        <Phone x={0} y={0} s={0.42} screen="#111">
          <svg width={412} height={852} style={{ position: "absolute" }}><QR x={110} y={330} size={190} /></svg>
          <div style={{ position: "absolute", left: 90, top: 310, width: 232, height: 232, border: `6px solid ${scanned ? C.green : "#fff"}`, borderRadius: 20 }} />
          {!scanned && <div style={{ position: "absolute", left: 90, top: 310 + ((f * 9) % 232), width: 232, height: 5, background: C.red, boxShadow: `0 0 16px ${C.red}` }} />}
          {scanned && <div style={{ position: "absolute", left: 0, top: 590, width: 412, textAlign: "center", color: C.green, fontSize: 44, transform: `scale(${pop(f, at(TM.scan) + 4)})`, ...FA_UI }}>✓ قفل باز شد</div>}
        </Phone>
      </div>
      {f >= at(TM.qr) && !scanned && <div style={{ position: "absolute", left: 375, top: 1225, width: 112, height: 112, border: `5px solid ${C.blue}`, borderRadius: 10, opacity: 0.6 + 0.4 * Math.sin(f / 2) }} />}
      <Burst x={430} y={1280} f={f} at={at(TM.scan) + 4} n={16} colors={[C.green, "#fff", "#a6f0c6"]} />
      {occupied && (
        <div style={{ position: "absolute", left: 640, top: 1450, width: 380, transform: `scale(${pop(f, at(TM.kar) + 4)})`, ...FA_UI }}>
          <Card mode="light" x={0} y={0} w={380} pad={22}>
            <div style={{ fontFamily: FONT_TEXT, direction: "rtl", fontSize: 26 }}>⏳ در حال انجام ماموریت…</div>
            <div style={{ height: 16, borderRadius: 8, background: "#eee", marginTop: 12, overflow: "hidden", direction: "rtl" }}><div style={{ width: `${prog * 70}%`, height: "100%", background: C.blue, marginRight: 0 }} /></div>
          </Card>
        </div>
      )}
    </>
  );
};

/* 6 · dark · nosy neighbor leans out → AI flags him → hose straight to the face */
export const Sc6: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const lean = ramp(f, at(TM.neighbor) - 4, at(TM.peek) + 8, easeOut);
  const flag = pop(f, at(TM.peek) - 6);
  const hose = ramp(f, at(TM.hose) - 2, at(TM.out) + 10, easeOut);
  const spray = f >= at(TM.direct);
  const hit = f >= at(TM.face);
  const head: [number, number] = [lerp(700, 650, lean), lerp(1385, 1280, lean)];
  const nozzle: [number, number] = [lerp(330, 400, hose), lerp(1300, 1250, hose)];
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1590} width={1080} height={140} fill="#1d1e22" />
        <path d="M0 1640 H1080" stroke="#e8e3c8" strokeWidth="6" strokeDasharray="60 40" />
        <Pod x={220} y={1280} s={0.62} f={f} rotors={0.15} occupied />
        {/* neighbor car (facing left), head pokes out of the front window */}
        <CarSide x={830} y={1480} s={0.9} color="#7a2f2f" f={0} />
        <path d={`M${730} ${1430} Q ${lerp(720, 640, lean)} ${1400} ${head[0] + 10} ${head[1] + 30}`} stroke="#d6a77f" strokeWidth="34" fill="none" strokeLinecap="round" />
        <g transform={`translate(${head[0]} ${head[1]}) rotate(${hit ? Math.sin(f * 1.5) * 10 : -10 * lean})`}>
          <circle r="54" fill={hit ? "#9fd0ff" : "#e0b896"} />
          <path d="M-54 -8 Q-50 -56 0 -58 Q50 -56 54 -8 Q20 -30 -54 -8 Z" fill="#2d241e" />
          {hit ? (
            <g stroke="#222" strokeWidth="5"><path d="M-30 -6 l14 14 M-16 -6 l-14 14 M8 -6 l14 14 M22 -6 l-14 14" /></g>
          ) : (
            <g><circle cx="-22" cy="0" r="13" fill="#fff" /><circle cx="18" cy="0" r="13" fill="#fff" /><circle cx={-26 + 0} cy="2" r="6" fill="#111" /><circle cx={14} cy="2" r="6" fill="#111" /></g>
          )}
          <ellipse cx="-2" cy="30" rx={hit ? 16 : 10} ry={hit ? 12 : 4} fill="#5a2a2a" />
        </g>
        {/* hose */}
        {hose > 0 && (
          <g>
            <path d={`M300 1330 Q ${lerp(310, 380, hose)} ${lerp(1420, 1400, hose)} ${nozzle[0]} ${nozzle[1]}`} stroke="#3a7bd5" strokeWidth="22" fill="none" strokeLinecap="round" />
            <path d={`M300 1330 Q ${lerp(310, 380, hose)} ${lerp(1420, 1400, hose)} ${nozzle[0]} ${nozzle[1]}`} stroke="rgba(255,255,255,.35)" strokeWidth="6" fill="none" strokeDasharray="10 16" strokeDashoffset={-f * 3} />
            <g transform={`translate(${nozzle[0]} ${nozzle[1]}) rotate(-12)`}><rect x="-4" y="-16" width="58" height="32" rx="8" fill="#c0c6d0" /><rect x="50" y="-10" width="18" height="20" rx="4" fill="#8a919c" /></g>
          </g>
        )}
        {/* water stream */}
        {spray && Array.from({ length: 26 }, (_, i) => {
          const k = ((f - at(TM.direct)) * 0.09 + i / 26) % 1;
          const x0 = nozzle[0] + 70, y0 = nozzle[1] - 14;
          const x = lerp(x0, head[0] - 20, k), y = lerp(y0, head[1], k) - Math.sin(k * Math.PI) * 50;
          return <circle key={i} cx={x + Math.sin(i) * 6} cy={y + Math.cos(i * 2) * 6} r={7 + 5 * rnd(i)} fill="rgba(140,200,255,.85)" />;
        })}
      </svg>
      {/* AI flag */}
      {flag > 0 && !hit && (
        <div style={{ position: "absolute", left: head[0] - 85, top: head[1] - 85, width: 170, height: 170, border: `5px solid ${C.red}`, borderRadius: 12, opacity: flag, transform: `scale(${1.4 - 0.4 * flag})` }}>
          <div style={{ position: "absolute", left: -6, top: -58, background: C.red, color: "#fff", padding: "4px 14px", fontSize: 28, borderRadius: 8, whiteSpace: "nowrap", ...FA_UI }}>⚠️ سرک‌کش شناسایی شد</div>
        </div>
      )}
      <Burst x={head[0]} y={head[1]} f={f} at={at(TM.face)} n={30} power={1.3} colors={["#9fd0ff", "#ffffff", "#5aa8ff"]} />
      {hit && <FloatUp x={head[0] + 40} y={head[1] - 140} f={f} at={at(TM.face)} text="💦 شلپ!" color="#9fd0ff" size={46} dur={40} />}
      {hose > 0 && <Chip x={240} y={970} a={pop(f, at(TM.hose))} bg="#1a1a1e" color="#fff" size={28}>🚿 شلنگ دفاعی · فعال</Chip>}
    </>
  );
};

/* 7 · light · everybody suddenly very busy with their phones */
export const Sc7: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const n = 6;
  const looking = Math.round(n * (1 - ramp(f, at(TM.all), at(TM.phones) + 4)));
  return (
    <>
      <Chip x={540} y={940} a={pop(f, 4)} bg="#111" color="#fff">
        <Emo size={34}>👀</Emo> تعداد نگاه‌ها: <span style={{ fontFamily: FONT_NUM }}>{fa(looking)}</span>
      </Chip>
      {Array.from({ length: n }, (_, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = 90 + col * 310, y = 1030 + row * 330;
        const down = ramp(f, at(TM.all) + i * 3, at(TM.all) + i * 3 + 10, easeBack);
        const a = ramp(f, i * 2, i * 2 + 12, easeOut);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 280, height: 300, borderRadius: 30, background: "#fff", boxShadow: T.light.shadow, overflow: "hidden", opacity: a, transform: `translateY(${(1 - a) * 60}px) rotate(${Math.sin(f / 20 + i) * 1.2}deg)` }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${["#dfe8ff", "#e9e4ff", "#e3f3ea"][i % 3]}, #fff)` }} />
            <svg width={280} height={300} style={{ position: "absolute" }}>
              <Person x={140} y={150} s={1.3} f={f} seed={i * 3} down={down} color={["#4b5567", "#2f6bff", "#6a7487", "#394150", "#8b93a3", "#9a3d3d"][i]} skin={["#e0b896", "#c99c78", "#f0cfb0"][i % 3]} />
            </svg>
            {down > 0.5 && <div style={{ position: "absolute", left: 16, top: 14, fontFamily: EMOJI, fontSize: 34, transform: `scale(${clamp(down)})` }}>{["📱", "🙈", "😶", "📲", "🫣", "🤳"][i]}</div>}
          </div>
        );
      })}
    </>
  );
};

/* 8 · dark · sealed, damage weighed, fare charged */
export const Sc8: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const seal = ramp(f, at(TM.seal) - 2, at(TM.seal) + 12);
  const scale = pop(f, at(TM.damage) - 2, 12);
  const kg = 2.8 * ramp(f, at(TM.weigh), at(TM.weigh) + 20, easeOut);
  const pay = pop(f, at(TM.fare) - 2, 12);
  const charged = f >= at(TM.minus);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <rect x={0} y={1600} width={1080} height={20} fill="#26262b" />
        <Pod x={270} y={1330} s={0.72} f={f} rotors={0.15} sealed={seal} occupied={false} />
      </svg>
      <Stamp text="پلمب شد" a={clamp((f - at(TM.seal) - 8) / 10)} x={270} y={1050} size={60} rot={-10} />
      {/* scale readout */}
      <div style={{ position: "absolute", left: 560, top: 900, width: 460, transform: `scale(${scale}) translateY(${(1 - scale) * 40}px)`, opacity: scale > 0 ? 1 : 0, ...FA_UI }}>
        <div style={{ background: "#16181d", border: "2px solid rgba(255,255,255,.1)", borderRadius: 28, padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,.6)" }}>
          <div style={{ color: "#9aa", fontSize: 28 }}><Emo size={30}>⚖️</Emo> وزن خسارت</div>
          <div style={{ background: "#0b1a10", borderRadius: 16, marginTop: 12, padding: "6px 18px", color: "#4dff8f", fontFamily: "monospace", fontSize: 92, textAlign: "center", direction: "ltr", textShadow: "0 0 18px rgba(77,255,143,.6)" }}>
            {kg.toFixed(2)} <span style={{ fontSize: 44 }}>kg</span>
          </div>
          {kg > 2.7 && <div style={{ color: C.red, fontSize: 26, marginTop: 10 }}>⚠️ بالاتر از میانگین مسافران</div>}
        </div>
      </div>
      {/* payment */}
      <div style={{ position: "absolute", left: 560, top: 1250, width: 460, transform: `translateX(${(1 - pay) * 300}px)`, opacity: pay > 0 ? 1 : 0, ...FA_UI }}>
        <div style={{ height: 270, borderRadius: 26, background: "linear-gradient(135deg,#2f6bff,#1b2f7a)", padding: 26, boxSizing: "border-box", color: "#fff", position: "relative", boxShadow: "0 24px 50px rgba(0,0,0,.6)", transform: `rotate(${charged ? Math.sin((f - at(TM.minus)) * 1.4) * 3 * Math.exp(-(f - at(TM.minus)) / 8) : 0}deg)` }}>
          <div style={{ fontSize: 26, opacity: 0.85 }}>کارت بانکی تو</div>
          <div style={{ width: 70, height: 52, borderRadius: 10, background: "linear-gradient(135deg,#f5d77a,#c9a43e)", marginTop: 16 }} />
          <div style={{ fontFamily: "monospace", fontSize: 34, direction: "ltr", textAlign: "left", marginTop: 18, letterSpacing: 3 }}>6037 •••• •••• 1313</div>
          <div style={{ position: "absolute", left: 26, top: 24, fontSize: 30, background: charged ? C.red : "rgba(255,255,255,.2)", borderRadius: 14, padding: "2px 14px" }}>{charged ? "پرداخت شد" : "کرایه"}</div>
        </div>
        <div style={{ marginTop: 16, textAlign: "center", color: "#fff", fontSize: 40 }}>
          <span style={{ fontFamily: FONT_NUM, fontSize: 64, color: charged ? C.red : "#fff" }}>{fa("480,000").replace(/,/g, "٬")}</span> تومان
        </div>
      </div>
      <FloatUp x={790} y={1210} f={f} at={at(TM.minus)} text="−۴۸۰٬۰۰۰" color={C.red} size={52} dur={40} />
      <Burst x={790} y={1380} f={f} at={at(TM.minus)} n={16} colors={[C.red, "#fff", "#ffb3b5"]} />
    </>
  );
};

/* 9 · light · flies off to the car wash */
export const Sc9: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const k = ramp(f, at(TM.fly) - 6, E(9) * 30 - from * 30 + 10, (t) => t * t);
  const px = lerp(300, 1000, k), py = lerp(1450, 880, k) + Math.sin(f / 5) * 6;
  const sign = pop(f, at(TM.wash), 12);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs><linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bcd6f5" /><stop offset="1" stopColor="#f2f2f3" /></linearGradient></defs>
        <rect x={40} y={860} width={1000} height={860} rx={40} fill="url(#sky9)" />
        {Array.from({ length: 8 }, (_, i) => {
          const t = clamp(k * 1.4 - i * 0.04);
          return <circle key={i} cx={lerp(300, 1000, t) - 40 - i * 26} cy={lerp(1450, 880, t) + 80 + i * 18} r={10 - i} fill="rgba(47,107,255,.25)" />;
        })}
        <rect x={40} y={1640} width={1000} height={80} fill="#9aa0a8" />
        {Array.from({ length: 5 }, (_, i) => <CarTop key={i} x={120 + i * 200 + ((f * 2) % 200)} y={1680} rot={90} s={0.42} color={["#6b7080", C.blue, "#4f5562", "#9a3d3d", "#d9d9dc"][i]} />)}
        <Pod x={px} y={py} s={0.5} f={f} rot={-14 * ramp(f, at(TM.fly) - 6, at(TM.fly) + 6)} rotors={1} sealed={1} />
      </svg>
      {/* car wash sign */}
      <div style={{ position: "absolute", left: 600, top: 1000, transform: `scale(${sign}) rotate(${(1 - sign) * 20 + Math.sin(f / 9) * 2}deg)`, transformOrigin: "50% 100%", ...FA_UI }}>
        <div style={{ background: "#fff", border: `6px solid ${C.blue}`, borderRadius: 24, padding: "14px 28px", fontSize: 44, color: C.blue, boxShadow: T.light.shadow }}>
          <Emo size={44}>🧽</Emo> کارواش ۲۴ ساعته
        </div>
      </div>
      {f >= at(TM.wash) && Array.from({ length: 14 }, (_, i) => {
        const t = ((f - at(TM.wash)) / 50 + rnd(i)) % 1;
        return <div key={i} style={{ position: "absolute", left: 620 + rnd(i + 4) * 380 + Math.sin(f / 8 + i) * 14, top: 1000 - t * 160, width: 18 + rnd(i) * 26, height: 18 + rnd(i) * 26, borderRadius: "50%", border: "3px solid rgba(47,107,255,.5)", background: "rgba(255,255,255,.6)", opacity: 1 - t }} />;
      })}
    </>
  );
};

/* 10 · dark · rate your trip */
export const Sc10: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const enter = ramp(f, 0, 14, easeOut);
  const stars = 5 * ramp(f, at(TM.rate) - 4, at(TM.rate) + 26);
  const curX = 400 + Math.min(4, Math.floor(stars)) * 66;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `perspective(1600px) rotateX(${(1 - enter) * 25}deg) translateY(${(1 - enter) * 100}px)`, opacity: enter }}>
      <div style={{ position: "absolute", inset: 0, ...floatStyle(f, 4, 6) }}>
        <Phone x={338} y={870} s={0.92} screen="#f6f7fb">
          <div style={{ position: "absolute", left: 0, top: 120, width: 412, textAlign: "center", ...FA_UI }}>
            <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 60, background: "#eaf0ff", lineHeight: "120px" }}><Emo size={64}>🚽</Emo></div>
            <div style={{ fontSize: 38, marginTop: 24, color: "#111" }}>سفرت چطور بود؟</div>
            <div style={{ fontSize: 22, color: "#888", marginTop: 6 }}>جاده‌ی چالوس · ۲۷ دقیقه</div>
            <div style={{ marginTop: 40 }}><Stars filled={stars} size={60} /></div>
            <div style={{ margin: "50px 30px 0", height: 70, borderRadius: 20, background: stars >= 5 ? C.blue : "#c7cbd6", color: "#fff", fontSize: 28, lineHeight: "70px" }}>ثبت امتیاز</div>
          </div>
        </Phone>
        {f >= at(TM.rate) - 8 && <Cursor x={curX + 60} y={1340} click={(f % 7) / 7} />}
      </div>
      <Burst x={540} y={1300} f={f} at={at(TM.rate) + 26} n={20} colors={["#ffb800", "#fff", "#ffe08a"]} />
    </div>
  );
};

/* 11 · light · twist: the toilet rated YOU — 2 stars */
export const Sc11: React.FC<SP> = ({ from }) => {
  const { f, at } = useLocal(from);
  const card = pop(f, at(TM.toiletR) - 6, 12);
  const stars = 2 * ramp(f, at(TM.two) - 2, at(TM.star) + 6);
  const tags = [pop(f, at(TM.gave)), pop(f, at(TM.gave) + 6)];
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: 900, width: 900, transform: `scale(${card}) rotate(${(1 - card) * -6}deg)`, opacity: card > 0 ? 1 : 0, ...FA_UI }}>
        <div style={{ background: "#fff", borderRadius: 40, boxShadow: T.light.shadow, padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 36, color: "#111" }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: C.blue, lineHeight: "80px" }}><Emo size={48}>🚽</Emo></div>
            توالت‌پرون به <b style={{ color: C.blue }}>تو</b> امتیاز داد
          </div>
          <div style={{ marginTop: 30 }}><Stars filled={stars} size={110} /></div>
          <div style={{ fontFamily: FONT_NUM, fontSize: 120, color: C.red, lineHeight: 1.2, marginTop: 10, opacity: ramp(f, at(TM.two), at(TM.two) + 6) }}>{fa("2.0").replace(".", "٫")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", marginTop: 6 }}>
            {["🚿 شلنگ رو نکشیدید", "⏱ ۲۷ دقیقه طولش دادید"].map((t, i) => (
              <div key={i} style={{ background: C.redSoft, color: C.red, borderRadius: 20, padding: "8px 24px", fontSize: 32, transform: `scale(${tags[i]})`, opacity: tags[i] > 0 ? 1 : 0 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
      <Stamp text="مسافر بدقلق" a={clamp((f - at(TM.star) - 10) / 10)} x={760} y={1640} size={58} rot={-12} />
      <Burst x={540} y={1180} f={f} at={at(TM.star)} n={16} colors={[C.red, "#ffb800", "#fff"]} />
    </>
  );
};
