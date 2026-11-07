# V35 · «پسرِ ماسک‌دار» — تحلیل + نریشن + پرامپت‌های Gemini و Google Flow

مرجع: ریلز `persian.ex` (۱۲۷ ثانیه، عمودی 9:16). فایل در `uploads/ref-ig/ref.mp4`.

---

## ۱) تحلیل کوتاه

**قصه:** پسرِ یه میلیاردر (آناناس، روی سرش «$10B») با ماسک ترسناک و دوچرخه‌ی زنگ‌زده می‌ره مدرسه، تا بفهمه کی دوست واقعیه. قلدر کلاس (سیب سبز) مسخره‌ش می‌کنه، یه دختر (توت‌فرنگی، «$50M») باهاش مهربونه. آخرش: «مهمون ویژه» فرداست و پسر پوزخند می‌زنه → «ادامه دارد…».

**چرا وایرال می‌شه:**
- **قلاب ۳ ثانیه‌ی اول:** پدرِ آناناسیِ پولدار + ماسک عجیب → «این چیه؟» آدم می‌مونه.
- **فرمول آشنا:** «میلیاردر پنهان / رئیس ناشناس». بیننده جواب رو می‌دونه، منتظر لحظه‌ی رو شدنه.
- **سرِ میوه + برچسب ثروت:** هر کس قیمتش روی سرشه. طنز تصویری و پیام اخلاقی با هم.
- **فضای ایرانی:** تابلوی «دبیرستان پسرانه»، «سلف سرویس»، کلاس دوازدهم، سفره‌ی کباب و ته‌دیگ. حس آشنایی.
- **ریتم:** هر شات ≈ ۸ ثانیه (یک کلیپ Veo) = یک دیالوگ. ۱۶ کلیپ + کارت «ادامه دارد».
- **پایان باز + سؤال کپشن** («کدوم شخصیت بااصالت‌تر بود؟») → کامنت و فالو برای قسمت بعد.

**صدا:** فقط دیالوگ + یه موزیک ملایم احساسی زیر کل ویدیو (جداش کردم: `music-bed.wav`).

---

## ۲) شخصیت‌ها (همیشه همین توصیف رو کپی کن تا ثابت بمونن)

- **PAPA** = پدر: سرِ آناناسِ طلایی، روی پیشونی حک شده «$10B»، عینک آفتابی مشکی، یقه‌اسکی مشکی، زنجیر طلای کلفت، ساعت طلا، دستکش سفید.
- **SON** = پسر: سرِ سیبِ آبیِ براق با برگ سبز، ماسک سفیدِ عروسکی با گونه‌های مارپیچ قرمز و لب قرمز، تیشرت زیتونیِ پاره‌پوره، کوله‌ی چرمی کهنه، پوست آبی، دوچرخه‌ی زنگ‌زده.
- **BULLY** = قلدر: سرِ سیبِ سبز با ابروهای اخمو و پوزخند، روی سرش «$1M»، کت مدرسه‌ی سرمه‌ای با لبه‌ی سفید، کراوات راه‌راه، ساعت گرون.
- **GIRL** = دختر: سرِ توت‌فرنگی با چشم‌های درشت مهربون، روی سرش «$50M»، کت مدرسه‌ی سرمه‌ای، پاپیون، دامن چهارخونه، کوله‌ی صورتی، جوراب قرمز.

---

## ۳) قدم اول: عکس مرجع شخصیت‌ها در Gemini

هر کدوم رو جدا بزن، بهترین رو نگه دار (برای Flow → Ingredients).

**PAPA**
```
Hyper-realistic 3D cinematic character, full body, standing on a real old Tehran street. A wealthy man whose head is a giant golden pineapple with a human face carved into it, "$10B" engraved on the forehead, black sunglasses, black turtleneck, thick gold chain, gold watch, white gloves, black trousers. Confident, calm. Natural daylight, shallow depth of field, 9:16 vertical, photoreal textures.
```

**SON**
```
Hyper-realistic 3D cinematic character, full body. A teenage boy whose head is a glossy blue apple with a green leaf on top, wearing a white porcelain puppet mask with red spiral cheeks and red lips, strapped with a black band. Blue skin, torn olive-green t-shirt with holes, old worn leather backpack, ripped trousers. Holding an old rusty bicycle. Real old Tehran street background, daylight, 9:16 vertical, photoreal textures.
```

**BULLY**
```
Hyper-realistic 3D cinematic character, full body. An arrogant teenage boy whose head is a glossy green apple with a smirking human face, angry eyebrows, "$1M" written on the forehead, navy school blazer with white piping, striped tie, white shirt, luxury watch. Iranian high school courtyard background, daylight, 9:16 vertical, photoreal textures.
```

**GIRL**
```
Hyper-realistic 3D cinematic character, full body. A kind teenage girl whose head is a shiny red strawberry with big warm brown eyes and a gentle smile, "$50M" written on the forehead, green leaves on top, navy school blazer, white shirt with bow tie, plaid skirt, red tights, pink backpack. Iranian school cafeteria background, daylight, 9:16 vertical, photoreal textures.
```

---

## ۴) قدم دوم: کلیپ‌ها در Google Flow

- مدل: **Veo 3** (Quality یا Fast) · نسبت **9:16** · طول ۸ ثانیه.
- حالت **Ingredients to Video**: عکس شخصیت‌های همون صحنه رو اضافه کن.
- ته همه‌ی پرامپت‌ها این خط هست، **پاکش نکن**:
  `Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.`
  (موزیک رو من موقع ادیت می‌ذارم؛ اگه Flow موزیک بذاره، با موزیک من قاطی می‌شه.)
- اگه دیالوگ تو ۸ ثانیه جا نشد، کوتاه‌ترش کن یا دو کلیپ بساز.

**کلیپ ۱ · کوچه، صبح**
```
Vertical 9:16, hyper-realistic 3D cinematic, real old Tehran alley with brick buildings, morning light. PAPA (golden pineapple head, "$10B", sunglasses, black turtleneck, gold chain, white gloves) gently adjusts the white puppet mask on SON (blue apple head, torn olive t-shirt, sitting on a rusty bicycle). Medium two-shot, slow push-in. PAPA says warmly in Persian: "پسرم، امروز اولین روز مدرسه‌ست. این ماسک رو بهت دادم که کسی از ثروت ما باخبر نشه. دنیا کورکورانه دنبال پوله." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۲ · همون کوچه، نمای پسر**
```
Vertical 9:16, hyper-realistic 3D cinematic, same Tehran alley. Over-the-shoulder shot from behind PAPA's pineapple head toward SON (blue apple head, white puppet mask, torn t-shirt) sitting on a rusty bicycle, looking sad and worried. SON says in Persian: "اما بابا، چرا باید با این دوچرخه‌ی زنگ‌زده برم مدرسه؟ همه مسخره‌م می‌کنن. با این ماسک ترسناک شبیه دیوونه‌ها شدم." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۳ · همون کوچه، پدر دلداری می‌ده**
```
Vertical 9:16, hyper-realistic 3D cinematic, same Tehran alley. PAPA (golden pineapple head, "$10B", sunglasses, gold chain) holds SON's chin with a gloved hand, serious and loving. SON on rusty bicycle, puppet mask. Close two-shot. PAPA says in Persian: "پسرم، این تنها راهیه که بفهمی دوستای واقعیت کیا هستن و کیا فقط به‌خاطر پول کنارتن. بهم اعتماد کن." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۴ · درِ مدرسه**
```
Vertical 9:16, hyper-realistic 3D cinematic, in front of an Iranian boys' high school with a sign reading "دبیرستان پسرانه" and an Iranian flag, white cars parked, students in uniforms behind. BULLY (green apple head, smirk, "$1M", navy blazer, striped tie) points angrily at SON (blue apple head, puppet mask, rusty bicycle). BULLY says in Persian: "هی آدم عجیب‌غریب! این دوچرخه‌ی قراضه‌ت رو همین الان از جلوی ماشین من ببر کنار." SON replies quietly: "ببخشید، من فقط می‌خواستم برم داخل مدرسه." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۵ · سلف، دختر میاد**
```
Vertical 9:16, hyper-realistic 3D cinematic, Iranian school cafeteria with a blue sign "سلف سرویس", students eating in background. SON (blue apple head, puppet mask, torn t-shirt) sits alone with a metal tray of rice and a fried egg. GIRL (strawberry head, "$50M", big kind eyes, navy blazer, pink backpack) leans toward him smiling. GIRL says in Persian: "اشکالی نداره اگه کنارت بشینم؟ ماسکت خیلی قشنگه! از کجا خریدیش؟" Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۶ · سلف، جواب پسر**
```
Vertical 9:16, hyper-realistic 3D cinematic, same school cafeteria. Over-the-shoulder from GIRL's strawberry head to SON (blue apple head, white puppet mask), surprised and shy, hands on the table near his tray. SON says in Persian: "تو منو مسخره نمی‌کنی؟ تو که حتی نمی‌دونی من چقدر فقیرم." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۷ · سلف، حرف دختر**
```
Vertical 9:16, hyper-realistic 3D cinematic, same school cafeteria. Close-up of GIRL (strawberry head, "$50M", big warm eyes, navy blazer) talking kindly with open hands, SON's shoulder in the foreground. GIRL says in Persian: "اینکه یه نفر چقدر پول داره، شخصیتش رو مشخص نمی‌کنه. شخصیت واقعی آدم رو قلب مهربونش نشون می‌ده." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۸ · سلف، قلدر میاد**
```
Vertical 9:16, hyper-realistic 3D cinematic, same school cafeteria. BULLY (green apple head, mocking smirk, navy blazer, luxury watch) leans over the table and points at SON's cheap tray of rice and egg. SON (blue apple head, puppet mask) looks down. BULLY says in Persian with a mocking laugh: "با تخم‌مرغ همچین غذای ارزونی می‌خوری؟ جدی می‌گی؟ حتی سگ منم غذای بهتری می‌خوره. ماسکت رو بردار ببینم!" Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۹ · سلف، پسر جواب می‌ده**
```
Vertical 9:16, hyper-realistic 3D cinematic, same school cafeteria. Close-up of SON (blue apple head, white puppet mask) looking up at BULLY with sad, tired emotion, BULLY's green apple head blurred in the foreground. SON says in Persian: "ولم کنی و بذاری به حال خودم باشم چه ضرری برات داره؟ من که هیچ بدی‌ای در حقت نکردم." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۰ · شام در عمارت**
```
Vertical 9:16, hyper-realistic 3D cinematic, luxurious Persian mansion dining hall at night, crystal chandeliers, arched windows, indoor fountain. A huge Persian feast on the table: kebabs, saffron rice, tahdig, herbs, bread. PAPA (golden pineapple head, "$10B", black turtleneck, gold chain) sits with hands folded. SON (blue apple head, puppet mask, torn t-shirt) talks to him tiredly. SON says in Persian: "بابا، امروز همه مسخره‌م کردن به‌جز یه دختر. خیلی صادق و مهربون بود. دیگه از پنهون کردن هویت واقعیم خسته شدم." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۱ · شام، جواب پدر**
```
Vertical 9:16, hyper-realistic 3D cinematic, same mansion dining hall with Persian feast. PAPA (golden pineapple head, "$10B") puts a gloved hand on SON's shoulder and smiles proudly. SON (blue apple head, puppet mask) listens. PAPA says in Persian: "تو یه دختر صادق و مهربون پیدا کردی. این از هر ثروتی باارزش‌تره، پسرم. فقط تا فردا صبر کن." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۲ · کلاس، قلدر**
```
Vertical 9:16, hyper-realistic 3D cinematic, Iranian high school classroom with green chalkboard titled "کلاس دوازدهم", Iran map on the wall, wooden desks. SON (blue apple head, puppet mask) sits at a desk. BULLY (green apple head, "$1M") stands laughing at him, GIRL (strawberry head, "$50M") stands nearby with arms crossed. BULLY says in Persian laughing: "به بابای گدات بگو لااقل یه دوچرخه‌ی بدون زنگ‌زدگی برات بخره! هم خودت عجیبی هم ماسکت." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۳ · کلاس، دختر دفاع می‌کنه**
```
Vertical 9:16, hyper-realistic 3D cinematic, same classroom. GIRL (strawberry head, "$50M", angry eyes, navy blazer, plaid skirt) points at BULLY (green apple head, arms crossed, surprised). SON (blue apple head, puppet mask) small in background. GIRL says firmly in Persian: "ولش کن! حداقل اخلاق خوبی داره. نه مثل تو که برای بزرگ نشون دادن خودت، بقیه رو تحقیر می‌کنی." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۴ · کلاس، خبر مهمون**
```
Vertical 9:16, hyper-realistic 3D cinematic, same classroom. Three characters by the desks: BULLY (green apple head), GIRL (strawberry head, "$50M"), SON (blue apple head, puppet mask, seated). GIRL says excitedly in Persian: "معلم بهم گفت امروز قراره یه مهمون ویژه بیاد مدرسه‌مون. یکی از میلیاردرهای معروف شهرمون!" Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۵ · حیاط مدرسه، قلدر پز می‌ده**
```
Vertical 9:16, hyper-realistic 3D cinematic, in front of a grand Iranian school gate with a crest, Iranian flags. BULLY (green apple head, arrogant smirk, navy blazer) points at SON (blue apple head, puppet mask, holding rusty bicycle). BULLY says in Persian: "مطمئنم اون مهمون ویژه بابای منه. وقتی لیموزینش رسید، دوچرخه‌ی قراضه‌ت رو به ماشینش نزدیک نکن. هی آدم عجیب‌غریب!" and laughs. Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

**کلیپ ۱۶ · نمای آخر، پوزخند پسر**
```
Vertical 9:16, hyper-realistic 3D cinematic, street in front of the school gate. Dramatic close-up of SON (blue apple head, white puppet mask with red spiral cheeks) as the mask's eyes glow red and his expression turns into a confident, sinister smile. Slow push-in, slightly darker mood. SON says quietly in Persian: "احمق... فقط می‌خوام وقتی بابام میاد قیافه‌ت رو ببینم. اون موقع می‌فهمی من واقعاً کی‌ام." Persian (Farsi) dialogue, clear lip-sync. No background music, no subtitles, only dialogue and natural ambient sound.
```

کارت پایانی «ادامه دارد…» رو خودم موقع ادیت می‌سازم.

---

## ۵) نکته‌های Flow

- **ثابت موندن شخصیت:** برای هر کلیپ، عکس مرجع همون شخصیت‌ها رو تو Ingredients بذار.
- **نوشته‌ی فارسی روی تابلو** معمولاً خراب درمیاد. اگه خراب شد، اشکالی نداره؛ تو ادیت می‌تونم با یه تابلوی تمیز بپوشونمش.
- از هر کلیپ ۲ تا ۴ نسخه بگیر و بهترینش رو بفرست.
- **اسم فایل‌ها:** `01.mp4` تا `16.mp4`، به همین ترتیب.

## ۶) فرستادن کلیپ‌ها برای ادیت

- هر کلیپ ۸ ثانیه‌ای Veo حدود ۳ تا ۸ مگه، پس از گوشی تو پوشه‌ی `uploads/v35/` گیت‌هاب آپلود کن (هر فایل زیر ۲۵MB).
- یا همه رو تو یه پوشه‌ی Google Drive با لینک «Anyone with the link» بذار.
- بعد بگو «آپلود کردم» تا بچسبونمشون، موزیک رو بذارم، میکس و تحویل.
