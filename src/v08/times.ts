// All visual events keyed to narration word times (seconds) from words.json (Brian v3 at atempo 1.15).
import words from "./words.json";
import { sentEnd, sentStart, Word, wordAt } from "../styles/receipt-ui/kit";

export const WORDS = words as Word[];
const w = (si: number, needle: string, nth = 0) => wordAt(WORDS, si, needle, nth);
export const S = (si: number) => sentStart(WORDS, si);
export const E = (si: number) => sentEnd(WORDS, si);

export const TM = {
  twelve: w(0, "دوازده"), haft: w(0, "هفت"), vali: w(0, "ولی"), guests: w(0, "مهمونا"), mive: w(0, "میوه"), dovom: w(0, "دوم"),
  rok: w(1, "رک"), beran: w(1, "برن"), chon: w(1, "چون"), irani: w(1, "ایرانی"), aberoo: w(1, "آبروت"), mohem: w(1, "مهمه"),
  app: w(2, "اپ"), name: w(2, "مهمون‌پرون"), baz: w(2, "باز"), halat: w(2, "حالت"), bye: w(2, "خداحافظی"), bezan: w(2, "بزن"),
  cheragh: w(3, "چراغای"), yavash: w(3, "یواش"), kam: w(3, "کم"), hame: w(3, "همه"), dir: w(3, "دیروقته"),
  nagereftan: w(4, "نگرفتن"), cooler: w(4, "کولر"), ghotb: w(4, "قطب"), shomal: w(4, "شمال"), chai: w(4, "چایی"), yakh: w(4, "یخ‌زده"), serv: w(4, "سرو"),
  hanooz: w(5, "هنوز"), neshastan: w(5, "نشستن"), tv: w(5, "تلویزیون"), roshan: w(5, "روشن"), akhbar: w(5, "اخبار"), traffic: w(5, "ترافیک"), pakhsh: w(5, "پخش"),
  marhale: w(6, "مرحله"), speaker: w(6, "بلندگوی"), seda: w(6, "صدای"), maman: w(6, "مامانت"), khob: w(6, "خب"), dige: w(6, "دیگه"), ishala: w(6, "ایشالا"), baad: w(6, "بعد"),
  balakhare: w(7, "بالاخره"), pa: w(7, "پا"), faghat: w(7, "فقط"), chehel: w(7, "چهل"), dam: w(7, "دم"), bye2: w(7, "خداحافظی"),
  saat: w(8, "ساعت"), nim: w(8, "نیم"), khab: w(8, "خوابت"), app2: w(8, "اپ"), notif: w(8, "نوتیف"),
  back: w(9, "برگشتن"), key: w(9, "کلید"), ja: w(9, "جا"), hala: w(9, "حالا"), oomadan: w(9, "اومدن"), sobhoone: w(9, "صبحونه"), hastan: w(9, "هستن"),
  end: E(9),
};
