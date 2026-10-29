// All visual events are keyed to narration word times (seconds) from words.json (narration at atempo 1.17).
import words from "./words.json";
import { sentEnd, sentStart, Word, wordAt } from "../styles/receipt-ui/kit";

export const WORDS = words as Word[];
const w = (si: number, needle: string, nth = 0) => wordAt(WORDS, si, needle, nth);
export const S = (si: number) => sentStart(WORDS, si);
export const E = (si: number) => sentEnd(WORDS, si);

export const TM = {
  friend: w(0, "رفیقت"), bill: w(0, "حساب"), suddenly: w(0, "یهو"), remember: w(0, "یادش"), wallet: w(0, "کیف"), car: w(0, "ماشین"),
  months: w(1, "ماهه"), says: w(1, "می‌گه"), night: w(1, "«شب"), c2c: w(1, "کارت", 1),
  app: w(2, "اپ"), name: w(2, "دنگ‌گیر"), open: w(2, "باز"), invoice: w(2, "فاکتور"), scan: w(2, "اسکن"),
  ai: w(3, "هوش"), exact: w(3, "دقیق"), who: w(3, "کی"), ate: w(3, "خورده"), slice: w(3, "تیکه"), pizza: w(3, "پیتزایی"), test: w(3, "«تست"), testEnd: E(3),
  reminder: w(4, "یادآوری"), polite: w(4, "مؤدبانه"), send: w(4, "می‌فرسته"),
  seen: w(5, "سین"), noAnswer: w(5, "نداد"), photo: w(5, "عکس"), change: w(5, "عوض"), debtor: w(5, "بدهکارم"),
  again: w(6, "بازم"), direct: w(6, "مستقیم"), mom: w(6, "مامانش"), call: w(6, "زنگ"),
  noCharge: w(7, "شارژ"), last: w(7, "قرون"), take: w(7, "برمی‌داره"), plus: w(7, "به‌اضافه"), fine: w(7, "جریمه"), late: w(7, "دیرکرد"),
  rate: w(8, "ستاره"), friend8: w(8, "رفیقت"),
  but: w(9, "ولی"), moment: w(9, "لحظه"), group: w(9, "گروه"), removed: w(9, "ریمو"),
  dongGir: w(10, "دنگ‌گیر"), lastMsg: w(10, "آخرین"), sent: w(10, "فرستاد"), punch: w(10, "«دنگ"), bade: w(10, "بده"), curse: w(10, "مادرجنده"),
  end: E(10),
};
