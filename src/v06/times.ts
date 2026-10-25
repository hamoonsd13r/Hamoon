// All visual events are keyed to narration word times (seconds) from words.json (narration at atempo 1.15).
import words from "./words.json";
import { sentEnd, sentStart, Word, wordAt } from "../styles/receipt-ui/kit";

export const WORDS = words as Word[];
const w = (si: number, needle: string, nth = 0) => wordAt(WORDS, si, needle, nth);
export const S = (si: number) => sentStart(WORDS, si);
export const E = (si: number) => sentEnd(WORDS, si);

export const TM = {
  sizdah: w(0, "سیزده"), traffic: w(0, "ترافیک"), chalus: w(0, "چالوس"), stuck: w(0, "گیر"), taghat: w(0, "طاقت"), nadari: w(0, "نداری"),
  saf: w(1, "صف"), wc: w(1, "دستشویی"), karaj: w(1, "کرج"), resideh: w(1, "رسیده"),
  app: w(2, "اپ"), name: w(2, "توالت‌پرون"), open: w(2, "باز"), toilet: w(2, "توالت", 1), request: w(2, "درخواست"),
  drone: w(3, "پهپاد"), car: w(3, "ماشینت"), find: w(3, "پیدا"), speaker: w(3, "بلندگو"), others: w(3, "بقیه"), space: w(3, "جا"), open2: w(3, "کنن"),
  camera: w(4, "دوربین"), ai: w(4, "هوش"), wires: w(4, "سیم"), barq: w(4, "برق"), pass: w(4, "رد"), next: w(4, "کنار"), land: w(4, "فرود"),
  qr: w(5, "QR"), scan: w(5, "اسکن"), go: w(5, "می‌ری"), kar: w(5, "کارت"),
  neighbor: w(6, "ماشین"), peek: w(6, "سرک"), toilet6: w(6, "توالت"), hose: w(6, "شلنگش"), out: w(6, "درمیاره"), direct: w(6, "مستقیم"), face: w(6, "صورتش"),
  all: w(7, "همه"), heads: w(7, "سرشون"), phones: w(7, "گوشیشونه"),
  done: w(8, "تموم"), door: w(8, "درش"), seal: w(8, "پلمب"), damage: w(8, "خسارت"), weigh: w(8, "وزن"), fare: w(8, "کرایه"), card: w(8, "کارتت"), minus: w(8, "کم"),
  fly: w(9, "پرواز"), wash: w(9, "کارواش"),
  rate: w(10, "امتیاز"), trip: w(10, "سفرت"),
  but: w(11, "ولی"), toiletR: w(11, "توالت"), gave: w(11, "داده"), two: w(11, "دو"), star: w(11, "ستاره"),
  end: E(11),
};
