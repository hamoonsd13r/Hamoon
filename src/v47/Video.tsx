// V47 · «آدولف هیتلر؛ از تولد تا سقوط» (Scene Zero) — two cuts from one file:
//   V47      YouTube 16:9, the whole narration (~5:23)
//   V47-Reel Instagram 9:16, 14 sentences of the same voice (~60 s)
// User's own narration (ElevenLabs "Mark"). Timing: local faster-whisper aligned to the script (tools/v47-align.py,
// tools/v47-voice.py — no ElevenLabs credits were left). The user asked: every picture real, nothing symbolic.
// So the picture is only archive film (US National Archives: Signal Corps, OWI, «Why We Fight», captured German film)
// and archive photos (Bundesarchiv, NARA, USHMM, Auschwitz Album… via Wikimedia Commons), each tagged on screen;
// Nazi-made footage is tagged «فیلم تبلیغاتی حکومت نازی». Code adds only type: dates, chapter years, captions.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { FootageTime, Media, type FootageClip, type Grade } from "../footage/footage";
import { prog, lerp, easeOut, easeInOut, backOut, fa, hash, timing, type VO } from "../v42/kit";
import voYT from "./vo.json";
import voReel from "./vo-reel.json";
import footJson from "./footage.json";
import photoJson from "./photos.json";

const FPS = 30;
const INK = "#08090B", BONE = "#EDE8DF", MUTED = "#9C978E", RED = "#C8372D", AMBER = "#D9A441", STEEL = "#7E8B96";
const CLIPS: Record<string, FootageClip & { page?: string }> = { ...(footJson as any).clips, ...(photoJson as any).clips };

/* ───────── fonts */
const fh = typeof document !== "undefined" ? delayRender("v47 fonts") : 0;
if (typeof document !== "undefined") {
  Promise.all([["H47Black", "fonts/Vazirmatn-Black.ttf"], ["H47Bold", "fonts/Vazirmatn-Bold.ttf"], ["H47Reg", "fonts/Vazirmatn-Regular.ttf"],
    ["H47Num", "fonts/Lalezar-Regular.ttf"], ["H47Bebas", "fonts/BebasNeue-Regular.ttf"], ["H47Oswald", "fonts/Oswald.ttf"], ["H47Mono", "fonts/ChakraPetch-SemiBold.ttf"]]
    .map(([f, u]) => new FontFace(f, `url('${staticFile(u)}')`).load().then((x) => document.fonts.add(x)))).then(() => continueRender(fh));
}

/* ───────── layout per cut */
type Ver = "yt" | "reel";
const LAY = {
  yt: { W: 1920, H: 1080, top: 34, tag: 110, chip: 190, chipStep: 80, chipSize: 40, cap: 880, capSize: 60, capMax: 1500, label: 760, printW: 1300, printH: 700, printTop: 120, cardY: 250, cardSize: 300, x0: 560, x1: 1360, name: 560, nameSize: 140, count: 230 },
  reel: { W: 1080, H: 1920, top: 110, tag: 240, chip: 320, chipStep: 92, chipSize: 44, cap: 1320, capSize: 66, capMax: 960, label: 1180, printW: 880, printH: 1000, printTop: 330, cardY: 640, cardSize: 300, x0: 120, x1: 960, name: 1000, nameSize: 140, count: 560 },
};
type Lay = typeof LAY.yt;

/* ───────── shots */
type Sh = { n: string; at: number; fit?: "cover" | "contain" | "print"; focus?: [number, number]; pan?: [number, number]; zoom?: number; push?: number; from?: number; rate?: number; grade?: Grade; label?: string };
const PROPAGANDA = new Set(["ns-rally", "ns-smile", "ns-crowd", "ns-assembly", "ns-hindenburg", "ns-mg", "wa-salute", "wa-band", "wa-reichstag", "wa-parade", "pol-tanks", "pol-column", "pol-blast", "pol-air", "pol-rail", "pol-parade"]);
const WATER = new Set(["w_oper", "w_1908", "w_michaeler", "w_munich"]);
type Ch = { at: number; y: number; card: boolean; title: string };

const build = (ver: Ver) => {
  const V = (ver === "yt" ? voYT : voReel) as VO;
  const { S, E, wd } = timing(V);
  const c = (x: number) => x - 0.06;
  let SHOTS: Sh[], CH: Ch[], OVERS: { from: number; to: number; r: (t: number, L: Lay) => React.ReactNode }[];
  if (ver === "yt") {
    SHOTS = [
      { n: "ba-gate", at: 0, push: 0.08 },
      { n: "soviet_art", at: c(S(2)), push: 0.1, label: "توپخانه‌ی شوروی پشت دروازه‌های برلین · آوریل ۱۹۴۵" },
      { n: "garden", at: c(S(3)), push: 0.1, label: "باغ صدراعظمی و ورودی پناهگاه، برلین" },
      { n: "bunker_blown", at: c(wd(3, "پناهگاهی")), push: 0.08, label: "پناهگاه هیتلر بعد از جنگ" },
      { n: "portrait", at: c(S(4)), fit: "cover", focus: [0.5, 0.3], push: 0.1 },
      { n: "w_oper", at: c(S(6)), fit: "print", label: "نقاشی آبرنگ هیتلر از اپرای وین · ۱۹۱۲" },
      { n: "wa-salute", at: c(wd(6, "دیکتاتوری")) },
      { n: "bc-square", at: c(wd(6, "حکومتش")) },
      { n: "braunau_paint", at: c(S(7)), push: 0.08, label: "براوناو اَم این، اتریش · نقاشی رولف فون هورشلمان" },
      { n: "birth_old", at: c(S(8)), fit: "print", label: "خانه‌ای که هیتلر در آن به دنیا آمد" },
      { n: "baby", at: c(S(9)), fit: "print", label: "آدولف هیتلر در کودکی" },
      { n: "alois", at: c(S(10)), fit: "print", label: "آلویس هیتلر، پدر · کارمند گمرک" },
      { n: "klara", at: c(wd(10, "مادرش")), fit: "print", label: "کلارا هیتلر، مادر" },
      { n: "linz", at: c(S(11)), pan: [0.08, 0], label: "لینتس، حدود ۱۹۰۰" },
      { n: "w_1908", at: c(S(12)), fit: "print", label: "نقاشی هیتلر · ۱۹۰۸" },
      { n: "academy", at: c(wd(13, "نتونست")), pan: [-0.06, 0], label: "آکادمی هنرهای زیبای وین · امروز" },
      { n: "vienna_opera", at: c(S(14)), pan: [0.06, 0], label: "وین، حدود ۱۹۰۰" },
      { n: "vienna_kai", at: c(S(15)), pan: [-0.06, 0], label: "وین، حدود ۱۹۰۰" },
      { n: "maennerheim", at: c(S(16)), push: 0.1, label: "اقامتگاه مردان بی‌خانمان، خیابان ملدمان، وین · ۱۹۰۶" },
      { n: "w_michaeler", at: c(S(17)), fit: "print", label: "نقاشی هیتلر از میدان میشائیلر وین" },
      { n: "vienna_parl", at: c(S(18)), pan: [0.08, 0], label: "پارلمان وین، حدود ۱۹۰۰" },
      { n: "w_munich", at: c(S(19)), fit: "print", label: "نقاشی هیتلر از مونیخ · ۱۹۱۴" },
      { n: "br-1914", at: c(S(20)) },
      { n: "ww1", at: c(S(21)), fit: "print", label: "هیتلر (نشسته، راست) با هم‌قطارانش در جنگ جهانی اول" },
      { n: "compiegne", at: c(S(23)), push: 0.08, label: "جنگل کمپینی، امضای آتش‌بس · ۱۱ نوامبر ۱۹۱۸" },
      { n: "ar-crowd", at: c(wd(23, "جنگ")) },
      { n: "unemployed", at: c(S(24)), fit: "print", label: "اعضای بیکار گروه شبه‌نظامی نازی، برلین" },
      { n: "sterneck", at: c(S(25)), fit: "print", label: "آبجوفروشی اشترنکر، محل جلسه‌های حزب کارگران آلمان" },
      { n: "wa-band", at: c(S(26)) },
      { n: "ns-rally", at: c(S(27)) },
      { n: "h1923", at: c(S(28)), fit: "print", label: "آدولف هیتلر · ۱۹۲۳" },
      { n: "putsch", at: c(S(29)), push: 0.1, label: "کودتای مونیخ، میدان ماریان · ۹ نوامبر ۱۹۲۳" },
      { n: "barricade", at: c(S(30)), push: 0.08, label: "سنگر کودتاچیان در مونیخ · ۱۹۲۳" },
      { n: "odeon", at: c(S(31)), push: 0.08, label: "میدان اودئون، مونیخ · ۱۹۲۳" },
      { n: "trial", at: c(S(32)), push: 0.06, label: "متهمان دادگاه کودتا · ۱۹۲۴" },
      { n: "landsberg", at: c(S(33)), fit: "print", label: "هیتلر و هم‌بندانش در زندان لاندسبرگ · ۱۹۲۴" },
      { n: "ns-assembly", at: c(S(34)) },
      { n: "poster", at: c(S(35)), fit: "print", label: "پوستر انتخاباتی حزب نازی · ۱۹۳۲" },
      { n: "ns-smile", at: c(wd(35, "تبلیغات")) },
      { n: "berlin_street", at: c(S(36)), fit: "print", label: "برلین" },
      { n: "cabinet", at: c(S(37)), fit: "print", label: "اولین کابینه‌ی هیتلر · ۳۰ ژانویه ۱۹۳۳" },
      { n: "hind_portrait", at: c(S(39)), fit: "print", label: "پاول فون هیندنبورگ، رئیس‌جمهور آلمان" },
      { n: "potsdam", at: c(wd(39, "منصوب")), push: 0.08, label: "هیندنبورگ و هیتلر، پوتسدام · ۲۱ مارس ۱۹۳۳" },
      { n: "ns-hindenburg", at: c(S(40)) },
      { n: "fire", at: c(S(42)), fit: "print", label: "آتش‌سوزی رایشستاگ · ۲۷ فوریه ۱۹۳۳" },
      { n: "fire_inside", at: c(S(43)), push: 0.08, label: "تالار سوخته‌ی رایشستاگ" },
      { n: "enabling_speech", at: c(S(44)), push: 0.08, label: "سخنرانی هیتلر درباره‌ی «قانون توانمندسازی» · ۲۳ مارس ۱۹۳۳" },
      { n: "enabling_doc", at: c(wd(44, "قدرت")), fit: "print", label: "متن قانون در روزنامه‌ی رسمی رایش" },
      { n: "wa-reichstag", at: c(S(45)) },
      { n: "dachau33", at: c(S(46)), push: 0.08, label: "زندانیان اردوگاه داخائو · ۱۹۳۳" },
      { n: "reichstag_speech", at: c(S(47)), push: 0.06, label: "هیتلر در رایشستاگ" },
      { n: "nuremberg_chart", at: c(S(48)), fit: "print", label: "جدول تبلیغاتی «قوانین نورنبرگ» · ۱۹۳۵" },
      { n: "synagogue", at: c(S(49)), fit: "print", label: "سوختن کنیسه‌ی بورنرپلاتز، هامبورگ · ۱۰ نوامبر ۱۹۳۸" },
      { n: "kristall", at: c(wd(49, "کنیسه‌ها")), push: 0.08, label: "صبح بعد از «شب شیشه‌های شکسته» · ۱۹۳۸" },
      { n: "poland_barrier", at: c(S(50)), push: 0.08, label: "سربازان آلمانی مرز لهستان را می‌شکنند · ۱ سپتامبر ۱۹۳۹" },
      { n: "pol-tanks", at: c(S(51)) },
      { n: "pol-column", at: c(wd(51, "حمله")) },
      { n: "ns-smoke", at: c(S(52)), from: 3.2 },
      { n: "barbarossa", at: c(S(53)), push: 0.08, label: "حمله به شوروی · ژوئن ۱۹۴۱" },
      { n: "br-tanks-snow", at: c(wd(53, "شوروی")) },
      { n: "ds-flags", at: c(S(54)) },
      { n: "wannsee_list", at: c(S(55)), fit: "print", label: "فهرست جلسه‌ی وانزه: شمار یهودیان هر کشور اروپا" },
      { n: "hq", at: c(wd(55, "هماهنگی")), push: 0.06, label: "هیتلر با فرماندهانش" },
      { n: "ausch_women", at: c(S(56)), push: 0.06, label: "زنان یهودی در آشویتس · آلبوم آشویتس، ۱۹۴۴" },
      { n: "ausch_ramp", at: c(S(57)), push: 0.08, label: "سکوی ورود آشویتس-بیرکناو · ۱۹۴۴" },
      { n: "ausch_three", at: c(wd(57, "یهودی")), fit: "print", label: "تازه‌واردان بیرکناو · آلبوم آشویتس" },
      { n: "dachau_lib", at: c(wd(57, "آزار")), push: 0.08, label: "بازماندگان داخائو در روز آزادی · ۱۹۴۵" },
      { n: "br-stal-adv", at: c(S(58)) },
      { n: "stal_ruin", at: c(S(59)), fit: "print", label: "ویرانه‌های استالینگراد" },
      { n: "stal_paulus", at: c(wd(59, "شکست")), fit: "print", label: "فرماندهان آلمانی پس از تسلیم در استالینگراد · ۱۹۴۳" },
      { n: "dday", at: c(S(60)), push: 0.08, label: "ساحل اوماها، نرماندی · ۶ ژوئن ۱۹۴۴" },
      { n: "no-wade", at: c(wd(60, "متفقین")) },
      { n: "july20", at: c(S(61)), push: 0.08, label: "اتاق جلسه‌ی ویران‌شده پس از سوءقصد · ۲۰ ژوئیه ۱۹۴۴" },
      { n: "berlin_mg", at: c(S(62)), push: 0.08, label: "مدافعان برلین · آوریل ۱۹۴۵" },
      { n: "bc-street", at: c(wd(62, "برلین")) },
      { n: "eva", at: c(S(63)), fit: "print", label: "اوا براون" },
      { n: "testament", at: c(wd(63, "وصیت‌نامه‌اش")), fit: "print", label: "وصیت‌نامه‌ی سیاسی هیتلر · ۲۹ آوریل ۱۹۴۵" },
      { n: "bc-chancellery", at: c(S(64)) },
      { n: "stripes", at: c(S(66)), fit: "print", label: "روزنامه‌ی ارتش آمریکا: «هیتلر مرد» · ۲ مه ۱۹۴۵" },
      { n: "su-table", at: c(S(67)) },
      { n: "jodl", at: c(wd(67, "سند")), push: 0.06, label: "ژنرال یودل سند تسلیم را امضا می‌کند، رنس" },
      { n: "su-sign", at: c(wd(67, "امضا")) },
      { n: "surrender_doc", at: c(S(68)), fit: "print", label: "سند تسلیم آلمان · ۷ مه ۱۹۴۵" },
      { n: "bc-ruins", at: c(S(69)), from: 5.2 },
      { n: "ds-crowd", at: c(wd(69, "جنایت‌هایی")) },
      { n: "reichstag45", at: c(wd(69, "میلیون‌ها")), fit: "print", label: "پاک‌سازی آوار رایشستاگ · ۱۹۴۵" },
      { n: "ds-chaplain", at: c(S(70)) },
      { n: "wa-parade", at: c(S(71)) },
      { n: "ba-rubble", at: c(wd(71, "نابودی")), from: 4.4 },
    ];
    CH = [
      { at: 0, y: 1945, card: false, title: "" },
      { at: c(S(7)), y: 1889, card: true, title: "تولد" },
      { at: c(S(19)), y: 1913, card: true, title: "جنگ جهانی اول" },
      { at: c(S(25)), y: 1919, card: true, title: "حزب" },
      { at: c(S(29)), y: 1923, card: true, title: "کودتا" },
      { at: c(S(37)), y: 1933, card: true, title: "قدرت" },
      { at: c(S(47)), y: 1934, card: false, title: "" },
      { at: c(S(48)), y: 1935, card: false, title: "" },
      { at: c(S(49)), y: 1938, card: false, title: "" },
      { at: c(S(50)), y: 1939, card: true, title: "جنگ" },
      { at: c(S(53)), y: 1941, card: false, title: "" },
      { at: c(S(55)), y: 1942, card: true, title: "هولوکاست" },
      { at: c(S(58)), y: 1943, card: true, title: "شکست" },
      { at: c(S(60)), y: 1944, card: false, title: "" },
      { at: c(S(62)), y: 1945, card: true, title: "سقوط" },
    ];
    OVERS = [
      { from: 0, to: E(1) + 0.4, r: (t, L) => <DateTitle t={t} L={L} t0={0.05} t1={E(1) + 0.2} big="30.04.1945" small="برلین" /> },
      { from: S(3), to: E(3) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={wd(3, "سه‌ونیم") - 0.1} k={0} color={AMBER}>حدود ساعت ۱۵:۳۰</Chip> },
      { from: S(4) - 0.1, to: E(5) + 0.6, r: (t, L) => <NameTitle t={t} L={L} t0={S(5) - 0.05} t1={E(5) + 0.4} name="آدولف هیتلر" years="1889 — 1945" /> },
      { from: S(7), to: E(9), r: (t, L) => <Chip t={t} L={L} t0={wd(7, "1889") + 0.3} k={0} color={AMBER}>۲۰ آوریل ۱۸۸۹</Chip> },
      { from: S(13), to: E(14) + 0.3, r: (t, L) => <><Stamp t={t} L={L} t0={wd(13, "نتونست") + 0.1} text="رد شد" /><Stamp t={t} L={L} t0={wd(14, "موفق") + 0.1} text="دوباره رد شد" rot={5} /></> },
      { from: S(17), to: E(18) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={wd(17, "توضیحی") - 0.1} k={0} color={STEEL} size={34}>شکست شخصی، علت جنایت نیست</Chip> },
      { from: S(23), to: E(23) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={S(23) + 0.2} k={0} color={AMBER}>۱۱ نوامبر ۱۹۱۸</Chip> },
      { from: S(24), to: E(24) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={wd(24, "دروغین") - 0.1} k={0} color={RED}>افسانه‌ی «خنجر از پشت»: دروغ</Chip> },
      { from: S(26), to: E(27) + 0.3, r: (t, L) => <><Chip t={t} L={L} t0={wd(26, "حزب") - 0.1} k={0}>حزب کارگران آلمان</Chip><Chip t={t} L={L} t0={wd(27, "نازی") - 0.1} k={1} color={RED}>حزب نازی</Chip></> },
      { from: S(31), to: E(32) + 0.3, r: (t, L) => <><Stamp t={t} L={L} t0={wd(31, "شکست") - 0.05} text="شکست" /><Stamp t={t} L={L} t0={wd(32, "زندان") - 0.05} text="زندان" rot={5} /></> },
      { from: S(39), to: E(41) + 0.4, r: (t, L) => <><Chip t={t} L={L} t0={wd(39, "منصوب") - 0.05} k={0} color={AMBER}>منصوب شد</Chip><Chip t={t} L={L} t0={wd(41, "انتخاب") - 0.1} k={1} color={RED}>نه با رأی مستقیم مردم</Chip></> },
      { from: S(42), to: E(44) + 0.3, r: (t, L) => <><Chip t={t} L={L} t0={S(42) + 0.1} t1={E(42) + 0.2} k={0} color={AMBER}>۲۷ فوریه ۱۹۳۳</Chip><Chip t={t} L={L} t0={S(44) + 0.1} k={0} color={AMBER}>۲۳ مارس ۱۹۳۳</Chip></> },
      { from: S(48), to: E(48) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={S(48) + 0.1} k={0} color={AMBER}>۱۵ سپتامبر ۱۹۳۵</Chip> },
      { from: S(49), to: E(49) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={S(49) + 0.3} k={0} color={AMBER}>شب ۹ به ۱۰ نوامبر ۱۹۳۸</Chip> },
      { from: S(53), to: E(53) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={S(53) + 0.1} k={0} color={AMBER}>۲۲ ژوئن ۱۹۴۱</Chip> },
      { from: S(55), to: E(55) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={wd(55, "وانزه") - 0.1} k={0} color={AMBER}>وانزه، برلین · ۲۰ ژانویه ۱۹۴۲</Chip> },
      { from: S(57), to: E(57) + 0.4, r: (t, L) => <Counter t={t} L={L} t0={wd(57, "شش") - 0.05} t1={wd(57, "یهودی") + 1.2} n={6000000} label="یهودی قربانی هولوکاست" /> },
      { from: S(59), to: E(61) + 0.3, r: (t, L) => <><Chip t={t} L={L} t0={S(59) + 0.1} t1={E(59)} k={0} color={AMBER}>۲ فوریه ۱۹۴۳ · استالینگراد</Chip><Chip t={t} L={L} t0={S(60) + 0.1} t1={E(60)} k={0} color={AMBER}>۶ ژوئن ۱۹۴۴ · نرماندی</Chip><Chip t={t} L={L} t0={S(61) + 0.1} k={0} color={AMBER}>۲۰ ژوئیه ۱۹۴۴</Chip></> },
      { from: S(62), to: E(63) + 0.3, r: (t, L) => <><Chip t={t} L={L} t0={S(62) + 0.1} t1={E(62)} k={0} color={AMBER}>۱۶ آوریل ۱۹۴۵</Chip><Chip t={t} L={L} t0={S(63) + 0.1} k={0} color={AMBER}>۲۹ آوریل ۱۹۴۵</Chip></> },
      { from: S(65), to: E(66) + 0.3, r: (t, L) => <DateTitle t={t} L={L} t0={S(65) - 0.05} t1={S(66) + 1.2} big="30.04.1945" small="حدود ساعت ۱۵:۳۰ · برلین" /> },
      { from: S(67), to: E(68) + 0.4, r: (t, L) => <><Chip t={t} L={L} t0={wd(67, "دو") - 0.1} k={0} color={AMBER}>۷ مه ۱۹۴۵ · ساعت ۰۲:۴۱ · رنس</Chip><Chip t={t} L={L} t0={wd(68, "23") - 0.1} k={1} color={STEEL}>توقف جنگ: ۸ مه · ساعت ۲۳:۰۱</Chip></> },
    ];
  } else {
    SHOTS = [
      { n: "ba-gate", at: 0, push: 0.08, focus: [0.55, 0.5] },
      { n: "soviet_art", at: c(S(2)), push: 0.1, focus: [0.4, 0.5] },
      { n: "garden", at: c(S(3)), push: 0.1, focus: [0.45, 0.5] },
      { n: "bunker_blown", at: c(wd(3, "پناهگاهی")), push: 0.08 },
      { n: "portrait", at: c(S(4)), fit: "cover", focus: [0.5, 0.3], push: 0.1 },
      { n: "w_oper", at: c(S(6)), fit: "print", label: "نقاشی آبرنگ هیتلر · ۱۹۱۲" },
      { n: "wa-salute", at: c(wd(6, "دیکتاتوری")), focus: [0.5, 0.45] },
      { n: "bc-square", at: c(wd(6, "حکومتش")), focus: [0.5, 0.5] },
      { n: "cabinet", at: c(S(7)), fit: "print", label: "اولین کابینه‌ی هیتلر · ۳۰ ژانویه ۱۹۳۳" },
      { n: "hind_portrait", at: c(S(8)), fit: "print", label: "رئیس‌جمهور هیندنبورگ" },
      { n: "potsdam", at: c(wd(8, "منصوب")), focus: [0.45, 0.4], push: 0.06 },
      { n: "poland_barrier", at: c(S(9)), push: 0.08, focus: [0.5, 0.45] },
      { n: "pol-tanks", at: c(S(10)), focus: [0.5, 0.5] },
      { n: "ns-smoke", at: c(S(11)), focus: [0.5, 0.5], from: 3.2 },
      { n: "ausch_ramp", at: c(S(12)), push: 0.08, focus: [0.5, 0.5], label: "آشویتس-بیرکناو · ۱۹۴۴" },
      { n: "ausch_three", at: c(wd(12, "یهودی")), fit: "print", label: "تازه‌واردان بیرکناو · آلبوم آشویتس" },
      { n: "dachau_lib", at: c(wd(12, "آزار")), push: 0.08, focus: [0.5, 0.5], label: "بازماندگان داخائو · ۱۹۴۵" },
      { n: "ds-chaplain", at: c(S(13)), focus: [0.45, 0.5] },
      { n: "wa-parade", at: c(S(14)), focus: [0.5, 0.5] },
      { n: "reichstag45", at: c(wd(14, "نابودی")), fit: "print", label: "رایشستاگ ویران · ۱۹۴۵" },
    ];
    CH = [
      { at: 0, y: 1945, card: false, title: "" },
      { at: c(S(6)), y: 1912, card: false, title: "" },
      { at: c(S(7)), y: 1933, card: true, title: "قدرت" },
      { at: c(S(9)), y: 1939, card: true, title: "جنگ" },
      { at: c(S(12)), y: 1942, card: false, title: "" },
      { at: c(S(13)), y: 1945, card: false, title: "" },
    ];
    OVERS = [
      { from: 0, to: E(1) + 0.4, r: (t, L) => <DateTitle t={t} L={L} t0={0.05} t1={E(1) + 0.2} big="30.04.1945" small="برلین" /> },
      { from: S(3), to: E(3) + 0.3, r: (t, L) => <Chip t={t} L={L} t0={wd(3, "سه‌ونیم") - 0.1} k={0} color={AMBER}>حدود ساعت ۱۵:۳۰</Chip> },
      { from: S(4) - 0.1, to: E(5) + 0.6, r: (t, L) => <NameTitle t={t} L={L} t0={S(5) - 0.05} t1={E(5) + 0.4} name="آدولف هیتلر" years="1889 — 1945" /> },
      { from: S(8), to: E(8) + 0.3, r: (t, L) => <><Chip t={t} L={L} t0={wd(8, "منصوب") - 0.05} k={0} color={AMBER}>منصوب شد</Chip><Chip t={t} L={L} t0={wd(8, "منصوب") + 0.5} k={1} color={RED}>نه با رأی مستقیم مردم</Chip></> },
      { from: S(12), to: E(12) + 0.4, r: (t, L) => <Counter t={t} L={L} t0={wd(12, "شش") - 0.05} t1={wd(12, "یهودی") + 1.0} n={6000000} label="یهودی قربانی هولوکاست" /> },
    ];
  }
  SHOTS.forEach((s, i) => { if (i && s.at <= SHOTS[i - 1].at) throw new Error(`v47 ${ver}: shots out of order at ${s.n}`); });
  const TOTAL = V.total + (ver === "yt" ? 2.6 : 1.6);
  return { V, S, E, wd, SHOTS, CH, OVERS, TOTAL };
};
const CUTS = { yt: build("yt"), reel: build("reel") };

/* ───────── small pieces */
const shadow = "0 6px 30px rgba(0,0,0,0.85)";
const Chip: React.FC<{ t: number; L: Lay; t0: number; t1?: number; k?: number; children: React.ReactNode; color?: string; size?: number }> = ({ t, L, t0, t1 = 9999, k = 0, children, color = BONE, size }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const u = backOut(prog(t, t0, t0 + 0.35)), o = 1 - prog(t, t1, t1 + 0.25);
  return (
    <div style={{ position: "absolute", top: L.chip + k * L.chipStep, right: 60, direction: "rtl", transform: `translateX(${(1 - u) * -60}px)`, opacity: Math.min(1, u * 1.4) * o, padding: "8px 22px", borderRadius: 8, background: "rgba(8,9,11,0.8)", borderRight: `7px solid ${color}`, fontFamily: "H47Black", fontSize: size ?? L.chipSize, color, whiteSpace: "nowrap" }}>{children}</div>
  );
};
const Stamp: React.FC<{ t: number; L: Lay; t0: number; text: string; rot?: number }> = ({ t, L, t0, text, rot = -6 }) => {
  if (t < t0 || t > t0 + 2.0) return null;
  const u = prog(t, t0, t0 + 0.18), s = lerp(2, 1, easeOut(u)), o = 1 - prog(t, t0 + 1.6, t0 + 2.0);
  return (
    <div style={{ position: "absolute", top: L.H * 0.52, left: 0, width: L.W, display: "flex", justifyContent: "center", opacity: u * o }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${s})`, border: `8px solid ${RED}`, borderRadius: 14, padding: "0 36px 10px", fontFamily: "H47Black", fontSize: 104, color: RED, direction: "rtl", background: "rgba(8,9,11,0.4)" }}>{text}</div>
    </div>
  );
};
const DateTitle: React.FC<{ t: number; L: Lay; t0: number; t1: number; big: string; small: string }> = ({ t, L, t0, t1, big, small }) => {
  const k = easeOut(prog(t, t0, t0 + 0.4)), o = 1 - prog(t, t1, t1 + 0.3);
  return (
    <div style={{ position: "absolute", top: L.count, width: L.W, textAlign: "center", opacity: k * o }}>
      <div style={{ fontFamily: "H47Oswald", fontSize: 200, color: BONE, textShadow: shadow, letterSpacing: 8, transform: `scale(${lerp(1.08, 1, k)})` }}>{big}</div>
      <div style={{ fontFamily: "H47Black", fontSize: 58, color: AMBER, textShadow: shadow, direction: "rtl" }}>{small}</div>
    </div>
  );
};
const NameTitle: React.FC<{ t: number; L: Lay; t0: number; t1: number; name: string; years: string }> = ({ t, L, t0, t1, name, years }) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const k = easeOut(prog(t, t0, t0 + 0.3)), o = 1 - prog(t, t1, t1 + 0.3);
  return (
    <div style={{ position: "absolute", top: L.name, width: L.W, textAlign: "center", opacity: o }}>
      <div style={{ fontFamily: "H47Black", fontSize: L.nameSize, color: BONE, textShadow: shadow, transform: `scale(${lerp(1.25, 1, k)})`, opacity: k, direction: "rtl" }}>{name}</div>
      <div style={{ margin: "0 auto", width: 520 * k, height: 10, background: RED }} />
      <div style={{ fontFamily: "H47Bebas", fontSize: 54, letterSpacing: 10, color: MUTED, marginTop: 12, opacity: prog(t, t0 + 0.3, t0 + 0.6) }}>{years}</div>
    </div>
  );
};
const Counter: React.FC<{ t: number; L: Lay; t0: number; t1: number; n: number; label: string }> = ({ t, L, t0, t1, n, label }) => {
  if (t < t0 || t > t1 + 0.4) return null;
  const v = Math.round(n * easeOut(prog(t, t0, t0 + 1.4))), o = 1 - prog(t, t1, t1 + 0.4);
  return (
    <div style={{ position: "absolute", top: L.count, width: L.W, textAlign: "center", direction: "rtl", opacity: o }}>
      <div style={{ fontFamily: "H47Num", fontSize: 200, lineHeight: 1.1, color: BONE, textShadow: shadow }}>{fa(v.toLocaleString("en-US").replace(/,/g, "٬"))}</div>
      <div style={{ fontFamily: "H47Black", fontSize: 58, color: AMBER, textShadow: shadow }}>{label}</div>
    </div>
  );
};

/* a blurred, darkened copy of a picture filling the frame (blurred small, then scaled up: much cheaper) */
const Soft: React.FC<{ src: string; L: Lay; k: number }> = ({ src, L, k }) => (
  <div style={{ position: "absolute", left: -40, top: -40, width: (L.W + 80) / 8, height: (L.H + 80) / 8, transform: "scale(8)", transformOrigin: "0 0", overflow: "hidden" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `blur(4px) brightness(${k}) saturate(0.4)` }} />
  </div>
);
/* a photo printed on paper on a dark desk, drifting (portraits, small or old pictures, documents) */
const Print: React.FC<{ n: string; L: Lay; t: number; t0: number; t1: number }> = ({ n, L, t, t0, t1 }) => {
  const cl = CLIPS[n];
  if (!cl) return <Missing n={n} L={L} />;
  const u = prog(t, t0, t1), k = easeOut(prog(t, t0, t0 + 0.45));
  const ar = cl.w / cl.h;
  let pw = L.printW, ph = pw / ar;
  if (ph > L.printH) { ph = L.printH; pw = ph * ar; }
  const rot = (hash(t0) - 0.5) * 4 + u * 1.0;
  return (
    <AbsoluteFill>
      <Soft src={cl.file} L={L} k={0.3} />
      <div style={{ position: "absolute", left: (L.W - pw) / 2 - 20, top: L.printTop + (L.printH - ph) / 2 - 20, width: pw + 40, height: ph + 40, background: "#E9E3D6", boxShadow: "0 40px 90px rgba(0,0,0,0.75)", transform: `translateY(${(1 - k) * 70}px) rotate(${rot}deg) scale(${1.02 + 0.05 * u})`, opacity: k }}>
        <Img src={staticFile(cl.file)} style={{ position: "absolute", left: 20, top: 20, width: pw, height: ph, objectFit: "cover", filter: "contrast(1.05) sepia(0.1)" }} />
        <div style={{ position: "absolute", inset: 20, boxShadow: "inset 0 0 60px rgba(60,40,10,0.3)" }} />
      </div>
    </AbsoluteFill>
  );
};
const Missing: React.FC<{ n: string; L: Lay }> = ({ n, L }) => (
  <AbsoluteFill style={{ background: "#14161a", alignItems: "center", justifyContent: "center" }}><div style={{ font: "600 34px monospace", color: "#666" }}>{n} · not downloaded yet</div><div style={{ width: L.W }} /></AbsoluteFill>
);

/* ───────── top bar: channel + 1889–1945 timeline */
const TopBar: React.FC<{ t: number; L: Lay; CH: Ch[] }> = ({ t, L, CH }) => {
  const i = Math.max(0, CH.findLastIndex((x) => t >= x.at)), ch = CH[i], prev = CH[Math.max(0, i - 1)];
  const yr = lerp(prev.y, ch.y, easeInOut(prog(t, ch.at, ch.at + 0.6)));
  const px = (y: number) => L.x1 - ((y - 1889) / (1945 - 1889)) * (L.x1 - L.x0);
  const X = px(yr);
  return (
    <div style={{ position: "absolute", top: L.top, left: 0, width: L.W, height: 110 }}>
      <div style={{ position: "absolute", top: 18, right: 60, direction: "rtl", display: "flex", alignItems: "center", gap: 12, fontFamily: "H47Black", fontSize: 30, color: BONE, opacity: 0.92 }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: RED }} />هیتلر · ۱۸۸۹–۱۹۴۵
      </div>
      <div style={{ position: "absolute", top: 18, left: 60, fontFamily: "H47Bebas", fontSize: 40, color: BONE, letterSpacing: 4, opacity: 0.85 }}>SCENE ZERO <span style={{ color: AMBER }}>· {Math.round(yr)}</span></div>
      {L.W > 1200 && <>
        <div style={{ position: "absolute", top: 38, left: L.x0, width: L.x1 - L.x0, height: 3, background: "rgba(237,232,223,0.25)" }} />
        <div style={{ position: "absolute", top: 38, left: X, width: L.x1 - X, height: 3, background: AMBER }} />
        <div style={{ position: "absolute", top: 30, left: X - 9, width: 18, height: 18, borderRadius: 9, background: AMBER }} />
        <div style={{ position: "absolute", top: 50, left: L.x1 - 28, fontFamily: "H47Bebas", fontSize: 24, color: MUTED }}>1889</div>
        <div style={{ position: "absolute", top: 50, left: L.x0 - 28, fontFamily: "H47Bebas", fontSize: 24, color: MUTED }}>1945</div>
      </>}
      {L.W <= 1200 && <>
        <div style={{ position: "absolute", top: 76, left: L.x0, width: L.x1 - L.x0, height: 3, background: "rgba(237,232,223,0.25)" }} />
        <div style={{ position: "absolute", top: 76, left: X, width: L.x1 - X, height: 3, background: AMBER }} />
        <div style={{ position: "absolute", top: 68, left: X - 9, width: 18, height: 18, borderRadius: 9, background: AMBER }} />
      </>}
    </div>
  );
};

/* source line under the bar, two seconds at the start of each shot */
const SourceLine: React.FC<{ t: number; L: Lay; s: Sh }> = ({ t, L, s }) => {
  const cl = CLIPS[s.n];
  if (!cl) return null;
  const o = prog(t, s.at + 0.1, s.at + 0.35) * (1 - prog(t, s.at + 2.6, s.at + 3));
  let txt = "عکس آرشیوی", dot = "#9BC59D", who = "";
  const title = (cl as { title?: string }).title || "";
  if (cl.kind === "video") {
    if (PROPAGANDA.has(s.n)) { txt = "فیلم تبلیغاتی حکومت نازی"; dot = RED; who = "via U.S. NATIONAL ARCHIVES"; }
    else { txt = "فیلم آرشیوی"; dot = AMBER; who = /^(ns|wa|br)-/.test(s.n) ? "U.S. GOVERNMENT FILM · NARA" : "U.S. ARMY SIGNAL CORPS · NARA"; }
  } else {
    if (WATER.has(s.n)) { txt = "نقاشی خود هیتلر"; dot = STEEL; }
    else if ((cl.year ?? 0) >= 1990) { txt = "عکس امروزی"; dot = STEEL; }
    who = /^Bundesarchiv/.test(title) ? "BUNDESARCHIV" : /242-EB|NARA|National Archives/.test(title + (cl.author || "")) ? "U.S. NATIONAL ARCHIVES" : /Auschwitz Album|Birkenau|Auschwitz/.test(title) ? "AUSCHWITZ ALBUM · YAD VASHEM" : (cl.author || "").replace(/\s+/g, " ").slice(0, 30);
  }
  return (
    <div style={{ position: "absolute", top: L.tag, right: 60, direction: "rtl", display: "flex", alignItems: "center", gap: 12, padding: "6px 16px", borderRadius: 8, background: "rgba(8,9,11,0.68)", fontFamily: "H47Bold", fontSize: 25, color: BONE, opacity: o }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: dot }} />{txt}
      {who && <span style={{ direction: "ltr", fontFamily: "H47Mono", fontSize: 20, color: MUTED }}>{who}</span>}
    </div>
  );
};
const PhotoLabel: React.FC<{ t: number; L: Lay; s: Sh; until: number }> = ({ t, L, s, until }) => {
  if (!s.label) return null;
  const k = easeOut(prog(t, s.at + 0.2, s.at + 0.5)), o = 1 - prog(t, until - 0.25, until);
  return <div style={{ position: "absolute", top: L.label, right: 60, maxWidth: L.W - 120, direction: "rtl", opacity: k * o, transform: `translateY(${(1 - k) * 16}px)`, fontFamily: "H47Bold", fontSize: 32, color: BONE, padding: "7px 18px", background: "rgba(8,9,11,0.72)", borderRight: `6px solid ${AMBER}` }}>{s.label}</div>;
};
/* chapter year over the picture (the picture keeps playing under a dark veil) */
const ChapterCard: React.FC<{ t: number; L: Lay; CH: Ch[] }> = ({ t, L, CH }) => {
  const ch = CH.find((x) => x.card && t >= x.at && t < x.at + 1.4);
  if (!ch) return null;
  const u = t - ch.at, inn = easeOut(prog(u, 0, 0.25)), out = 1 - easeInOut(prog(u, 1.05, 1.4));
  return (
    <AbsoluteFill style={{ background: `rgba(8,9,11,${0.72 * out})` }}>
      <div style={{ position: "absolute", top: L.cardY, width: L.W, textAlign: "center", fontFamily: "H47Oswald", fontSize: L.cardSize, lineHeight: 1, color: BONE, opacity: inn * out, transform: `translateY(${(1 - inn) * 50}px) scale(${1 + 0.04 * u})`, letterSpacing: 6 }}>{ch.y}</div>
      <div style={{ position: "absolute", top: L.cardY + L.cardSize + 30, left: (L.W - 460) / 2, width: 460 * inn, height: 10, background: AMBER, opacity: out }} />
      <div style={{ position: "absolute", top: L.cardY + L.cardSize + 70, width: L.W, textAlign: "center", fontFamily: "H47Black", fontSize: 72, color: AMBER, direction: "rtl", opacity: prog(u, 0.15, 0.4) * out }}>{ch.title}</div>
    </AbsoluteFill>
  );
};

/* captions: 2–5 words, the said word lights up */
const KEY = new Set(["هیتلر", "آدولف", "نازی", "هولوکاست", "دیکتاتوری", "یهودیان", "یهودی", "کودتا", "جنگ", "تسلیم", "شکست", "نفرت", "تبلیغات", "منصوب", "پناهگاه", "1889", "1907", "1913", "1918", "1919", "1921", "1923", "1933", "1934", "1935", "1938", "1939", "1941", "1942", "1943", "1944", "1945"]);
type Cap = { words: { w: string; s: number; e: number }[]; s: number; e: number };
const capsOf = (V: VO, maxW: number, maxC: number): Cap[] => {
  const out: Cap[] = [];
  for (const n of [...new Set(V.words.map((w) => w.line))]) {
    const ws = V.words.filter((w) => w.line === n);
    let cur: Cap["words"] = [];
    ws.forEach((w, i) => {
      cur.push(w);
      const nx = ws[i + 1], len = cur.reduce((a, x) => a + x.w.length, 0);
      if (!nx || /[،؛:؟]$/.test(w.w) || cur.length >= maxW || len > maxC || (cur.length >= 2 && nx.s - w.e > 0.28)) { out.push({ words: cur, s: cur[0].s, e: w.e }); cur = []; }
    });
  }
  out.forEach((c, i) => { const n = out[i + 1]; c.e = n ? Math.min(n.s, c.e + 0.5) : c.e + 0.6; });
  return out;
};
const CAPS = { yt: capsOf(CUTS.yt.V, 5, 30), reel: capsOf(CUTS.reel.V, 4, 22) };
const Captions: React.FC<{ t: number; L: Lay; ver: Ver; hide?: boolean }> = ({ t, L, ver, hide }) => {
  const c = CAPS[ver].find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c || hide) return null;
  const u = easeOut(prog(t, c.s - 0.05, c.s + 0.1));
  return (
    <div style={{ position: "absolute", top: L.cap, width: L.W, display: "flex", justifyContent: "center", transform: `translateY(${(1 - u) * 14}px)`, opacity: u }}>
      <div style={{ direction: "rtl", display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: L.capMax, columnGap: 18, padding: "6px 26px 12px", borderRadius: 12, background: "rgba(8,9,11,0.74)" }}>
        {c.words.map((w, i) => {
          const bare = w.w.replace(/[،.؛:؟…]+$/, "").replace(/[«»]/g, ""), on = t >= w.s - 0.03, key = KEY.has(bare);
          return <span key={i} style={{ fontFamily: "H47Black", fontSize: L.capSize, lineHeight: 1.35, color: on ? (key ? AMBER : "#fff") : "rgba(255,255,255,0.38)" }}>{fa(w.w.replace(/[.…]+$/, ""))}</span>;
        })}
      </div>
    </div>
  );
};
const EndCard: React.FC<{ t: number; L: Lay; t0: number }> = ({ t, L, t0 }) => {
  if (t < t0 - 0.2) return null;
  const k = easeOut(prog(t, t0 - 0.2, t0 + 0.6));
  return (
    <AbsoluteFill style={{ background: `rgba(8,9,11,${0.8 * k})`, alignItems: "center", justifyContent: "center", opacity: k }}>
      <div style={{ fontFamily: "H47Black", fontSize: 120, color: BONE, direction: "rtl" }}>آدولف هیتلر</div>
      <div style={{ width: 560, height: 8, background: AMBER, margin: "12px 0 22px" }} />
      <div style={{ fontFamily: "H47Oswald", fontSize: 84, color: MUTED, letterSpacing: 8 }}>1889 — 1945</div>
      <div style={{ fontFamily: "H47Bold", fontSize: 30, lineHeight: 1.6, color: MUTED, marginTop: 30, direction: "rtl", maxWidth: L.W - 160, textAlign: "center" }}>تصاویر: آرشیو ملی آمریکا، Bundesarchiv، USHMM، آلبوم آشویتس · Wikimedia Commons</div>
    </AbsoluteFill>
  );
};

/* ───────── one shot */
const ShotView: React.FC<{ s: Sh; L: Lay; t: number; until: number }> = ({ s, L, t, until }) => {
  const cl = CLIPS[s.n];
  // small photos (most Bundesarchiv scans are 800 px; Wikimedia gives us 500 px thumbnails) would blur full-frame: print them
  if (s.fit === "print" || (cl && cl.kind === "image" && Math.max(cl.w, cl.h) < 1100)) return <Print n={s.n} L={L} t={t} t0={s.at} t1={until} />;
  if (!cl) return <Missing n={s.n} L={L} />;
  const film = cl.kind === "video";
  return <Media clip={cl} name={s.n} t0={s.at} len={until - s.at + 0.1} w={L.W} h={L.H} from={s.from ?? 0.3} rate={s.rate ?? (film ? 0.9 : 1)} fit={s.fit ?? "cover"} focus={s.focus ?? cl.focus} pan={s.pan} zoom={s.zoom} push={s.push} grade={s.grade ?? "clean"} />;
};

/* ───────── main */
const Video: React.FC<{ ver: Ver; audio?: string; at?: number }> = ({ ver, audio, at: tAt }) => {
  const frame = useCurrentFrame();
  const t = tAt ?? frame / FPS;
  const L = LAY[ver], K = CUTS[ver];
  let i = 0;
  while (i < K.SHOTS.length - 1 && t >= K.SHOTS[i + 1].at) i++;
  const s = K.SHOTS[i], until = K.SHOTS[i + 1]?.at ?? K.TOTAL;
  const since = t - s.at;
  const punch = i > 0 ? 1 + 0.04 * (1 - easeOut(prog(since, 0, 0.3))) : 1;
  const flash = i > 0 && since < 0.08 ? 0.16 * (1 - since / 0.08) : 0;
  const nameOn = t >= K.S(5) - 0.1 && t < K.E(5) + 0.4;
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: INK }}>
        <AbsoluteFill style={{ transform: `scale(${punch})` }}>
          <ShotView s={s} L={L} t={t} until={until} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: ver === "yt" ? "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.62) 100%)" : "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.3) 100%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
        {K.OVERS.filter((o) => t >= o.from - 0.1 && t <= o.to + 0.3).map((o, k) => <React.Fragment key={k}>{o.r(t, L)}</React.Fragment>)}
        <PhotoLabel t={t} L={L} s={s} until={until} />
        <SourceLine t={t} L={L} s={s} />
        <ChapterCard t={t} L={L} CH={K.CH} />
        <TopBar t={t} L={L} CH={K.CH} />
        <Captions t={t} L={L} ver={ver} hide={nameOn} />
        <EndCard t={t} L={L} t0={K.V.total + 0.1} />
        <AbsoluteFill style={{ background: `rgba(255,245,235,${flash})` }} />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${prog(t, K.TOTAL - 0.5, K.TOTAL)})` }} />
        {audio && <Html5Audio src={staticFile(audio)} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

const lookOf = (ver: Ver) => {
  const K = CUTS[ver];
  return [...K.CH.filter((x) => x.card).map((x) => +(x.at + 0.6).toFixed(2)), ...K.SHOTS.map((s, i) => +(s.at + ((K.SHOTS[i + 1]?.at ?? K.TOTAL) - s.at) * 0.6).toFixed(2)), K.TOTAL - 1.2].sort((a, b) => a - b);
};
const LOOK = { yt: lookOf("yt"), reel: lookOf("reel") };
const Look: React.FC<{ ver: Ver }> = ({ ver }) => { const f = useCurrentFrame(); return <Video ver={ver} at={LOOK[ver][Math.min(f, LOOK[ver].length - 1)]} />; };
export const SHOT_TIMES = { yt: CUTS.yt.SHOTS.map((s) => [s.n, +s.at.toFixed(2)]), reel: CUTS.reel.SHOTS.map((s) => [s.n, +s.at.toFixed(2)]) };
const frames = (v: Ver) => Math.round(CUTS[v].TOTAL * FPS);
export const V47Compositions: React.FC = () => (
  <>
    <Composition id="V47" component={Video} durationInFrames={frames("yt")} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver, audio: "v47/mix-yt.wav" }} />
    <Composition id="V47-Silent" component={Video} durationInFrames={frames("yt")} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver }} />
    <Composition id="V47-Look" component={Look} durationInFrames={LOOK.yt.length} fps={FPS} width={1920} height={1080} defaultProps={{ ver: "yt" as Ver }} />
    <Composition id="V47-Reel-Silent" component={Video} durationInFrames={frames("reel")} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver }} />
    <Composition id="V47-Reel-Look" component={Look} durationInFrames={LOOK.reel.length} fps={FPS} width={1080} height={1920} defaultProps={{ ver: "reel" as Ver }} />
  </>
);
