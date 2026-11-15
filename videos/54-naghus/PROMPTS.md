# ویدیو ۵۴ · «ناقوس نیمه‌شب» · قصه + پرامپت عکس‌ها (Google Flow)

ایده از ترند «In This Town» یوتیوب (شورت ۱۰ میلیونی «When the Night Bell Rings, Everyone Freezes»، کانال VoidCast). از مرجع فقط **فن** یاد گرفتیم، نه متن:
- قانون دنیا در ۳ ثانیه‌ی اول.
- چند جزئیات بامزه از زندگی در این دنیا.
- یک راز که از اول کاشته می‌شود و آخر جواب می‌گیرد.
- شمارش ساعت‌ها برای تعلیق.
- یک جمله‌ی تکرارشونده که آخر قصه برمی‌گردد.
- کات‌های خیلی تند (میانگین ۱.۴ ثانیه).
- زیرنویس **تک‌کلمه‌ای**، کلمه‌های مهم قرمز.

قصه، شخصیت‌ها و پایان مال خودمان است.

## روال (کم‌خرج)
1. در Flow فقط **عکس** بساز، ویدیو نه. حرکت، زوم، لرزش، زیرنویس، صدا و افکت را Claude با کد می‌سازد. هر عکس چند نما می‌شود (باز، متوسط، کلوزآپ).
2. قاب را روی **Portrait 9:16** بگذار.
3. **اول عکس ۰۰ (شخصیت‌ها)** را بساز. برای بقیه، اگر Flow اجازه داد، همان را به‌عنوان عکس مرجع (reference / ingredient) اضافه کن تا قیافه‌ها ثابت بمانند.
4. از هر پرامپت فقط **یک** عکس خوب لازم است. اگر نوشته یا حرف روی عکس آمد، دوباره بساز.
5. عکس‌ها را با اسم‌های `00` تا `17` در پوشه‌ی `uploads/v54/` گیت‌هاب آپلود کن. ترتیب مهم است.
6. نریشن را در ElevenLabs بساز و MP3 را با اسم `v54-voice.mp3` در `uploads/` بگذار (یا در چت بفرست).

---

## نریشن (برای ElevenLabs، حدود ۹۰ ثانیه)

```
توی این شهر، هر شب که ناقوس دوازده رو می‌زنه... همه یخ می‌زنن.
هر کی هر جا هست، همون‌جا خشکش می‌زنه. تا خودِ صبح.
عروسیِ همسایه‌مون یه بار وسطِ رقص یخ زد. داماد تا صبح یه پاش هوا موند.
ولی یه چیزی عجیبه.
هر صبح، یه چیزی توی شهر درست شده.
شیشه‌ی شکسته‌ی مدرسه، نو شده. گربه‌ی گم‌شده‌ی خانم کریمی، برگشته پشتِ درِ خونه‌ش.
هیچ‌کس نمی‌دونه کارِ کیه.
مامانم همیشه می‌گه: «اگه یه شب یخ نزدی، از خونه بیرون نرو.»
اسمِ من آرشه. دیشب، ناقوس زد... و من یخ نزدم.
مامانم وسطِ ریختنِ چای خشکش زده بود. چای، توی هوا وایساده بود.
یادم اومد چی گفته بود... ولی رفتم بیرون.
کلِ شهر مثلِ یه عکس بود. حتی قطره‌های بارون.
بعد... صدای پا.
یه پیرمرد، با یه فانوس، داشت توی شهرِ یخ‌زده راه می‌رفت.
ساعتِ یک، یه پتو انداخت روی پسری که توی کوچه خوابش برده بود.
ساعتِ دو، یه ماشین رو هل داد عقب. درست یه قدم مونده به یه دختربچه.
ساعتِ سه، شیشه‌ی مدرسه رو عوض کرد.
ساعتِ چهار... برگشت سمتِ من.
اصلاً تعجب نکرد. گفت: «پس بالاخره اومدی.»
«شهر که بخوابه، یکی باید بیدار بمونه. شصت ساله که اون یه نفر، منم.»
«دستام دیگه جون نداره.»
کلیدِ برج رو گذاشت توی دستم.
ساعتِ پنج، آسمون صورتی شد.
صبح، همه بیدار شدن. هیچ‌کس هیچی نفهمید.
ولی برجِ ناقوس خالی بود. فقط فانوسش مونده بود.
حالا هر شب، من تنها کسی‌ام که بیدارم.
شهر که بخوابه... یکی باید بیدار بمونه.
ولی امشب... چشمای یه نفرِ دیگه هم تکون خورد.
```

---

## پرامپت‌ها

هر پرامپت کامل است؛ همان را کپی کن.

### 00 · شخصیت‌ها (مرجع)
```
2D cartoon comic illustration, character reference sheet on a plain light grey background, three characters standing side by side, full body, front view, evenly spaced. Bold clean black outlines, flat cel shading with soft gradients. All characters have pure white round faces and white skin, big expressive eyes with black pupils and tiny white highlights, thick dark eyebrows, simple black mitten-like gloved hands, slightly big heads. LEFT: ARASH, a 12-year-old boy with messy black hair, mustard-yellow hoodie, dark blue jeans, white sneakers. MIDDLE: THE BELL-KEEPER, a very old thin man, bald on top with white hair on the sides, long white beard, small round glasses, long dark-green wool coat, brown scarf, holding a glowing brass oil lantern. RIGHT: MOM, a woman with dark hair in a bun, maroon sweater, grey trousers. No text, no letters, no labels, no watermark. Vertical 9:16.
```

### 01 · برج ناقوس، نیمه‌شب
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, richly detailed painted background, light film grain, gentle vignette. Deep blue moonlit night over a quiet small town of two-story houses with warm yellow lit windows. In the center, a tall old stone clock tower with a big bronze bell swinging inside its open arch, the clock showing exactly twelve o'clock, a full moon behind it, thin clouds. Low camera angle looking up at the tower. No people. No text, no letters, no watermark. Vertical 9:16.
```

### 02 · شهر یخ‌زده
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, richly detailed painted background, light film grain. Deep blue night, warm yellow streetlamp glow, light rain. A small-town street where everything is frozen in time: raindrops hang motionless in the air, a man in a coat stopped mid-step under an umbrella, a woman frozen while waving, a cat frozen in mid-jump between two trash cans, a pigeon frozen mid-flight. Characters have pure white round faces and white skin, big eyes, black mitten-like gloved hands. The stone clock tower in the far background. Eerie, silent mood. No text, no letters, no watermark. Vertical 9:16.
```

### 03 · عروسیِ یخ‌زده
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night, a festive backyard wedding party with strings of warm fairy lights and colorful lanterns. Everyone is frozen mid-dance like statues: the groom in a black suit frozen on one leg with the other leg kicked high in the air and both arms raised, the bride in a white dress frozen mid-spin with her veil flying, guests frozen mid-clap, a musician frozen mid-drum, confetti hanging still in the air. Characters have pure white round faces and white skin, big eyes, black mitten-like gloved hands. Funny mood. No text, no letters, no watermark. Vertical 9:16.
```

### 04 · صبحِ مرموز: گربه برگشته
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, richly detailed painted background, light film grain. Bright sunny morning, soft orange sunrise light, wet shining pavement. A small-town street: in the foreground, an orange cat sitting on the doormat of a green front door, a surprised old woman (pure white round face, grey hair, purple cardigan) opening the door and seeing it with joy. Across the street, a school building with one brand-new shiny window pane among old dusty ones. Townspeople walking normally with coffee cups and school bags, the stone clock tower in the background. No text, no letters, no watermark. Vertical 9:16.
```

### 05 · هشدار مامان
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Cozy bedroom at night, warm yellow bedside lamp. MOM (pure white round face, dark hair in a bun, maroon sweater, black mitten-like gloved hands) sitting on the edge of the bed, tucking ARASH (12-year-old boy, pure white round face, messy black hair, mustard-yellow hoodie) under a blanket, raising one finger with a serious, warning face. Arash looks at her, a little worried. Through the window, the clock tower under the moon. No text, no letters, no watermark. Vertical 9:16.
```

### 06 · ناقوس زد، ولی من یخ نزدم
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain, heavy vignette. Night, dark bedroom lit only by cold blue moonlight from the window. ARASH (12-year-old boy, pure white round face, messy black hair, mustard-yellow hoodie, black mitten-like gloved hands) sitting up in bed, eyes wide open in shock, gripping his blanket. A round wall clock above him shows exactly twelve. Through the window, the distant clock tower. Tense, mysterious mood. No text, no letters, no watermark. Vertical 9:16.
```

### 07 · چای توی هوا
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night, a warm cozy kitchen lit by one yellow ceiling lamp. MOM (pure white round face, dark hair in a bun, maroon sweater, black mitten-like gloved hands) frozen like a statue while pouring tea from a teapot, the stream of tea frozen motionless in the air above the glass, a few drops hanging still. In the doorway, ARASH (pure white round face, messy black hair, mustard-yellow hoodie) staring at her in shock. No text, no letters, no watermark. Vertical 9:16.
```

### 08 · کل شهر مثل یه عکس
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, richly detailed painted background, light film grain. Seen from behind: ARASH (12-year-old boy, messy black hair, mustard-yellow hoodie, dark blue jeans) standing on the front steps of his house at night, looking out at a silent frozen street: raindrops hanging still in the air, a frozen car with headlights on, people frozen mid-step, warm streetlamps, the clock tower at the end of the street under the moon. Wide shot, boy small in the lower third. No text, no letters, no watermark. Vertical 9:16.
```

### 09 · صدای پا
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain, strong vignette. Extreme close-up of ARASH's face (pure white round face, messy black hair, mustard-yellow hood), eyes wide with fear, turning his head to look over his shoulder, a drop of sweat on his forehead, cold blue night light on one side and a faint warm orange glow approaching from the other side. Frozen raindrops in the air around him. No text, no letters, no watermark. Vertical 9:16.
```

### 10 · پیرمرد فانوس‌به‌دست
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, richly detailed painted background, light film grain. Night, frozen street with raindrops hanging still in the air. THE BELL-KEEPER, a very old thin man with a pure white face, long white beard, small round glasses, long dark-green wool coat, brown scarf, walking slowly toward the camera, holding up a glowing brass oil lantern that lights the frozen raindrops around him in warm gold. Frozen people in the background. Mysterious, magical mood. No text, no letters, no watermark. Vertical 9:16.
```

### 11 · پتو روی پسر
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night, a narrow brick alley, cold blue light. THE BELL-KEEPER (very old thin man, pure white face, long white beard, round glasses, long dark-green coat, brass lantern set on the ground beside him) gently laying a thick warm red blanket over a poor boy (pure white round face, worn clothes) who is asleep curled up against the wall on flattened cardboard. The lantern casts a warm gold glow. Tender mood. No text, no letters, no watermark. Vertical 9:16.
```

### 12 · ماشین و دختربچه
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night street, frozen raindrops in the air, bright car headlights. A little girl (pure white round face, pigtails, pink raincoat, holding a balloon) frozen in the middle of a crosswalk, a car frozen just one step away from her. THE BELL-KEEPER (very old thin man, white beard, round glasses, long dark-green coat) pushing the front of the car backwards with both hands, straining, his brass lantern hanging from his arm. Dramatic low angle. No text, no letters, no watermark. Vertical 9:16.
```

### 13 · شیشه‌ی مدرسه
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night, outside an old brick school building, cold blue moonlight. THE BELL-KEEPER (very old thin man, pure white face, long white beard, round glasses, long dark-green coat, brown scarf) standing on a short wooden ladder, carefully fitting a new clear glass pane into a broken classroom window, a few glass shards on the ground, his glowing brass lantern hanging from a hook beside him lighting his tired face in warm gold. No text, no letters, no watermark. Vertical 9:16.
```

### 14 · «پس بالاخره اومدی»
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Night, frozen street, raindrops hanging in the air. Two-shot: THE BELL-KEEPER (very old thin man, pure white face, long white beard, small round glasses, long dark-green coat, brown scarf) on the right, smiling kindly and tiredly at ARASH (12-year-old boy, pure white round face, messy black hair, mustard-yellow hoodie) on the left, who looks up at him amazed. The glowing brass lantern between them lights both faces in warm gold; cold blue night behind. No text, no letters, no watermark. Vertical 9:16.
```

### 15 · کلید برج
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain, shallow depth of field. Extreme close-up of hands: an old wrinkled hand in a black fingerless glove placing a big old ornate brass key into a boy's small open hand in a black mitten-like glove and a mustard-yellow sleeve. Warm golden lantern light on the key, dark blue blurred background with frozen raindrops sparkling like stars. No text, no letters, no watermark. Vertical 9:16.
```

### 16 · برج خالی، فقط فانوس
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain. Morning, inside the top room of the old stone clock tower: the big bronze bell hanging still, dusty wooden floor, a beam of golden sunlight through the arch with floating dust. In the middle of the floor, the brass oil lantern, now unlit, and a brown scarf lying beside it. Nobody there. Quiet, bittersweet mood. No text, no letters, no watermark. Vertical 9:16.
```

### 17 · یه نفر دیگه هم تکون خورد
```
2D cartoon comic illustration, bold clean black outlines, flat cel shading with soft gradients, light film grain, strong vignette. Night, frozen street, raindrops hanging still. ARASH (12-year-old boy, pure white round face, messy black hair, mustard-yellow hoodie, now wearing the long brown scarf) walks holding the glowing brass lantern, in the foreground. Behind him, among frozen people, a girl about his age (pure white round face, short black hair, dark blue coat) stands frozen like the others, but her eyes have turned and are secretly looking right at him. Creepy cliffhanger mood. No text, no letters, no watermark. Vertical 9:16.
```
