/**
 * All topics — 25 topics, ~230 pairs.
 * Every pair: romanized (with tone diacritics), script, english, example.
 * Tone diacritics: ` low, ^ falling, ´ high, ˇ rising, unmarked = mid.
 *
 * Topic types (the `type` field):
 *   - "vocabulary" — standard word/phrase packs (default)
 *   - "situation"  — phrase packs tied to a real-world situation
 *                     (Ordering Food, Getting Around, 7-Eleven, etc.)
 *   - "pattern"    — frame/template topics for Pattern Practice mode.
 *                     Not yet populated; shape documented below.
 *
 * Pattern topic shape (for reference — none exist yet):
 *
 *   {
 *     id: "ask-location",
 *     label: "Ask Where Something Is",
 *     emoji: "📍",
 *     type: "pattern",
 *
 *     // The sentence template with a blank slot.
 *     frame: {
 *       romanized: "___ yùu thîi nǎi",
 *       script: "___ อยู่ที่ไหน",
 *       english: "Where is ___?",
 *       explanation: "Use this to ask where any place or thing is located."
 *     },
 *
 *     // Pairs are full sentences under the frame. Each pair carries:
 *     //   - romanized / script / english: the complete sentence
 *     //   - slottable: an array of words WITHIN the sentence that are
 *     //     eligible to become the blank. Pattern Practice picks one
 *     //     at random per round, so a single pair can teach multiple
 *     //     words. Pattern markers themselves (e.g. `mâi` in negation,
 *     //     `mǎi` in yes-no-questions) are NOT included — blanking
 *     //     them teaches nothing.
 *     //   - slot: the old single-slot field, kept equal to slottable[0]
 *     //     for backward compatibility. Runtime uses `slottable`.
 *     //   - example (optional): a natural full-context sentence for
 *     //     Audio.playSentence.
 *     pairs: [
 *       {
 *         romanized: "hông náam yùu thîi nǎi",
 *         script:    "ห้องน้ำอยู่ที่ไหน",
 *         english:   "Where is the bathroom?",
 *         slottable: [
 *           { romanized: "hông náam", script: "ห้องน้ำ", english: "bathroom" },
 *           { romanized: "yùu", script: "อยู่", english: "is located at" },
 *           { romanized: "thîi nǎi", script: "ที่ไหน", english: "where" }
 *         ],
 *         slot: { romanized: "hông náam", script: "ห้องน้ำ", english: "bathroom" },
 *         example: {
 *           thai:      "ขอโทษ ห้องน้ำอยู่ที่ไหน",
 *           romanized: "khǎw thôot, hông náam yùu thîi nǎi",
 *           english:   "Excuse me, where is the bathroom?"
 *         }
 *       },
 *       // ...8–12 more
 *     ]
 *   }
 *
 * The `slottable` array is what makes Pattern Practice mode possible —
 * it identifies which words within the sentence can plug into the frame.
 * At round time one is picked at random; the word's script position is
 * blanked out for the prompt.
 */
const TOPICS = [

  // ─── 1. Days of the Week ───
  {
    id: "days", emoji: "📅", label: "Days of the Week", type: "vocabulary",
    pairs: [
      { romanized: "Wan Jan", script: "วันจันทร์", english: "Monday", example: { thai: "วันนี้คือวันจันทร์", romanized: "Wan níi khue Wan Jan", english: "Today is Monday" } },
      { romanized: "Wan Ang-khaan", script: "วันอังคาร", english: "Tuesday", example: { thai: "วันอังคารฉันไปทำงาน", romanized: "Wan Ang-khaan chǎn pai tham-ngaan", english: "On Tuesday I go to work" } },
      { romanized: "Wan Phút", script: "วันพุธ", english: "Wednesday", example: { thai: "วันพุธเราไปตลาด", romanized: "Wan Phút rao pai dtà-làat", english: "On Wednesday we go to the market" } },
      { romanized: "Wan Phá-rúe-hàt", script: "วันพฤหัสบดี", english: "Thursday", example: { thai: "วันพฤหัสบดีมีประชุม", romanized: "Wan Phá-rúe-hàt mii bprà-chum", english: "Thursday there is a meeting" } },
      { romanized: "Wan Sùk", script: "วันศุกร์", english: "Friday", example: { thai: "วันศุกร์สนุกมาก", romanized: "Wan Sùk sà-nùk mâak", english: "Friday is very fun" } },
      { romanized: "Wan Sǎo", script: "วันเสาร์", english: "Saturday", example: { thai: "วันเสาร์ฉันพักผ่อน", romanized: "Wan Sǎo chǎn phák-phàwn", english: "Saturday I relax" } },
      { romanized: "Wan Aa-thít", script: "วันอาทิตย์", english: "Sunday", example: { thai: "วันอาทิตย์ไปวัด", romanized: "Wan Aa-thít pai wát", english: "On Sunday go to the temple" } }
    ]
  },

  // ─── 2. Time Expressions ───
  {
    id: "time-expressions", emoji: "⏰", label: "Time Expressions", type: "vocabulary",
    pairs: [
      { romanized: "Wan níi", script: "วันนี้", english: "Today", example: { thai: "วันนี้อากาศดี", romanized: "Wan níi aa-gàat dii", english: "Today the weather is good" } },
      { romanized: "Phrûng níi", script: "พรุ่งนี้", english: "Tomorrow", example: { thai: "พรุ่งนี้ไปเที่ยว", romanized: "Phrûng níi pai thîao", english: "Tomorrow let's go out" } },
      { romanized: "Mêua-waan", script: "เมื่อวาน", english: "Yesterday", example: { thai: "เมื่อวานฝนตก", romanized: "Mêua-waan fǒn dtòk", english: "Yesterday it rained" } },
      { romanized: "Aa-thít níi", script: "อาทิตย์นี้", english: "This week", example: { thai: "อาทิตย์นี้ยุ่งมาก", romanized: "Aa-thít níi yûng mâak", english: "This week is very busy" } },
      { romanized: "Aa-thít nâa", script: "อาทิตย์หน้า", english: "Next week", example: { thai: "อาทิตย์หน้าไปเชียงใหม่", romanized: "Aa-thít nâa pai Chiang-mài", english: "Next week going to Chiang Mai" } },
      { romanized: "Aa-thít thîi-láew", script: "อาทิตย์ที่แล้ว", english: "Last week", example: { thai: "อาทิตย์ที่แล้วสนุกมาก", romanized: "Aa-thít thîi-láew sà-nùk mâak", english: "Last week was very fun" } },
      { romanized: "Bpii níi", script: "ปีนี้", english: "This year", example: { thai: "ปีนี้ไปเมืองไทย", romanized: "Bpii níi pai meuang Thai", english: "This year going to Thailand" } },
      { romanized: "Bpii nâa", script: "ปีหน้า", english: "Next year", example: { thai: "ปีหน้าจะเรียนภาษาไทย", romanized: "Bpii nâa jà rian phaa-sǎa Thai", english: "Next year will study Thai" } }
    ]
  },

  // ─── 3. Months (Jan–Jun) ───
  {
    id: "months-1-6", emoji: "🌸", label: "Months (Jan–Jun)", type: "vocabulary",
    pairs: [
      { romanized: "Mòk-kà-raa-khom", script: "มกราคม", english: "January", example: { thai: "เดือนมกราคมอากาศเย็น", romanized: "Deuan Mòk-kà-raa-khom aa-gàat yen", english: "January the weather is cool" } },
      { romanized: "Kum-phaa-phan", script: "กุมภาพันธ์", english: "February", example: { thai: "กุมภาพันธ์มีวันวาเลนไทน์", romanized: "Kum-phaa-phan mii Wan Waa-len-thai", english: "February has Valentine's Day" } },
      { romanized: "Mii-naa-khom", script: "มีนาคม", english: "March", example: { thai: "มีนาคมเริ่มร้อน", romanized: "Mii-naa-khom rôem rón", english: "March starts getting hot" } },
      { romanized: "Meh-sǎa-yon", script: "เมษายน", english: "April", example: { thai: "เมษายนมีสงกรานต์", romanized: "Meh-sǎa-yon mii Sǒng-graan", english: "April has Songkran" } },
      { romanized: "Phruét-sà-phaa-khom", script: "พฤษภาคม", english: "May", example: { thai: "พฤษภาคมฝนเริ่มตก", romanized: "Phruét-sà-phaa-khom fǒn rôem dtòk", english: "May the rain starts" } },
      { romanized: "Mí-thù-naa-yon", script: "มิถุนายน", english: "June", example: { thai: "มิถุนายนฝนตกเยอะ", romanized: "Mí-thù-naa-yon fǒn dtòk yóe", english: "June has lots of rain" } }
    ]
  },

  // ─── 4. Months (Jul–Dec) ───
  {
    id: "months-7-12", emoji: "🍂", label: "Months (Jul–Dec)", type: "vocabulary",
    pairs: [
      { romanized: "Kà-rák-kà-daa-khom", script: "กรกฎาคม", english: "July", example: { thai: "กรกฎาคมไปทะเล", romanized: "Kà-rák-kà-daa-khom pai thá-lee", english: "July go to the beach" } },
      { romanized: "Sǐng-hǎa-khom", script: "สิงหาคม", english: "August", example: { thai: "สิงหาคมเป็นวันแม่", romanized: "Sǐng-hǎa-khom pen Wan Mâae", english: "August is Mother's Day" } },
      { romanized: "Kan-yaa-yon", script: "กันยายน", english: "September", example: { thai: "กันยายนยังมีฝน", romanized: "Kan-yaa-yon yang mii fǒn", english: "September still has rain" } },
      { romanized: "Tù-laa-khom", script: "ตุลาคม", english: "October", example: { thai: "ตุลาคมอากาศเริ่มเย็น", romanized: "Tù-laa-khom aa-gàat rôem yen", english: "October weather starts cooling" } },
      { romanized: "Phruét-sà-jì-kaa-yon", script: "พฤศจิกายน", english: "November", example: { thai: "พฤศจิกายนมีลอยกระทง", romanized: "Phruét-sà-jì-kaa-yon mii Loi Grà-thong", english: "November has Loy Krathong" } },
      { romanized: "Than-waa-khom", script: "ธันวาคม", english: "December", example: { thai: "ธันวาคมเป็นปีใหม่", romanized: "Than-waa-khom pen Bpii Mài", english: "December is New Year" } }
    ]
  },

  // ─── 5. Time of Day ───
  {
    id: "time-of-day", emoji: "🌅", label: "Time of Day", type: "vocabulary",
    pairs: [
      { romanized: "Cháo", script: "เช้า", english: "Morning", example: { thai: "ตอนเช้ากินกาแฟ", romanized: "Dtawn cháo gin gaa-fae", english: "In the morning drink coffee" } },
      { romanized: "Bàai", script: "บ่าย", english: "Afternoon", example: { thai: "ตอนบ่ายอากาศร้อน", romanized: "Dtawn bàai aa-gàat rón", english: "In the afternoon it's hot" } },
      { romanized: "Yen", script: "เย็น", english: "Evening", example: { thai: "ตอนเย็นไปวิ่ง", romanized: "Dtawn yen pai wîng", english: "In the evening go running" } },
      { romanized: "Glang-kheun", script: "กลางคืน", english: "Nighttime", example: { thai: "กลางคืนเงียบมาก", romanized: "Glang-kheun ngîap mâak", english: "At night it's very quiet" } },
      { romanized: "Chuâ-mohng", script: "ชั่วโมง", english: "Hour", example: { thai: "รอหนึ่งชั่วโมง", romanized: "Raw nùeng chuâ-mohng", english: "Wait one hour" } },
      { romanized: "Naa-thii", script: "นาที", english: "Minute", example: { thai: "รอห้านาที", romanized: "Raw hâa naa-thii", english: "Wait five minutes" } },
      { romanized: "Wi-naa-thii", script: "วินาที", english: "Second", example: { thai: "แค่สามสิบวินาที", romanized: "Khâe sǎam-sìp wi-naa-thii", english: "Just thirty seconds" } }
    ]
  },

  // ─── 6. Numbers 1–10 ───
  {
    id: "numbers", emoji: "🔢", label: "Numbers 1–10", type: "vocabulary",
    pairs: [
      { romanized: "Nùeng", script: "หนึ่ง", english: "One (1)", example: { thai: "ฉันมีแมวหนึ่งตัว", romanized: "Chǎn mii maew nùeng dtuua", english: "I have one cat" } },
      { romanized: "Sǎawng", script: "สอง", english: "Two (2)", example: { thai: "มีสองคน", romanized: "Mii sǎawng khon", english: "There are two people" } },
      { romanized: "Sǎam", script: "สาม", english: "Three (3)", example: { thai: "ขอน้ำสามแก้ว", romanized: "Khǎaw náam sǎam gâew", english: "Three glasses of water please" } },
      { romanized: "Sìi", script: "สี่", english: "Four (4)", example: { thai: "โต๊ะมีสี่ขา", romanized: "Dtó mii sìi khǎa", english: "A table has four legs" } },
      { romanized: "Hâa", script: "ห้า", english: "Five (5)", example: { thai: "มีห้านิ้ว", romanized: "Mii hâa níu", english: "There are five fingers" } },
      { romanized: "Hòk", script: "หก", english: "Six (6)", example: { thai: "หกโมงเช้าตื่นนอน", romanized: "Hòk mohng cháo dtèun nawn", english: "Wake up at 6 AM" } },
      { romanized: "Jèt", script: "เจ็ด", english: "Seven (7)", example: { thai: "อาทิตย์มีเจ็ดวัน", romanized: "Aa-thít mii jèt wan", english: "A week has seven days" } },
      { romanized: "Bpàet", script: "แปด", english: "Eight (8)", example: { thai: "เริ่มงานแปดโมง", romanized: "Rôem ngaan bpàet mohng", english: "Work starts at eight" } },
      { romanized: "Gâo", script: "เก้า", english: "Nine (9)", example: { thai: "เลขเก้าเป็นเลขมงคล", romanized: "Lêek gâo pen lêek mong-khon", english: "Nine is a lucky number" } },
      { romanized: "Sìp", script: "สิบ", english: "Ten (10)", example: { thai: "นับหนึ่งถึงสิบ", romanized: "Náp nùeng thǔeng sìp", english: "Count from one to ten" } }
    ]
  },

  // ─── 7. Pronouns & Questions ───
  {
    id: "pronouns-questions", emoji: "👤", label: "Pronouns & Questions", type: "vocabulary", essential: true,
    pairs: [
      { romanized: "Chǎn / Phǒm", script: "ฉัน / ผม", english: "I / me", example: { thai: "ฉันชื่อมะลิ", romanized: "Chǎn chêu Má-lí", english: "My name is Mali" }, note: "chǎn = female/casual, phǒm = male/formal" },
      { romanized: "Khun", script: "คุณ", english: "You (polite)", example: { thai: "คุณชื่ออะไร?", romanized: "Khun chêu à-rai?", english: "What is your name?" } },
      { romanized: "Khǎo", script: "เขา", english: "He / She / They", example: { thai: "เขาเป็นคนไทย", romanized: "Khǎo pen khon Thai", english: "He/she is Thai" } },
      { romanized: "Rao", script: "เรา", english: "We / us", example: { thai: "เราไปด้วยกัน", romanized: "Rao pai dûay-gan", english: "Let's go together" } },
      { romanized: "Phûak-khǎo", script: "พวกเขา", english: "They / them (group)", example: { thai: "พวกเขาอยู่ที่ไหน?", romanized: "Phûak-khǎo yùu thîi-nǎi?", english: "Where are they?" } },
      { romanized: "Khrai?", script: "ใคร?", english: "Who?", example: { thai: "คนนั้นคือใคร?", romanized: "Khon nán khue khrai?", english: "Who is that person?" } },
      { romanized: "À-rai?", script: "อะไร?", english: "What?", example: { thai: "คุณทำอะไร?", romanized: "Khun tham à-rai?", english: "What are you doing?" } },
      { romanized: "Tîi-nǎi?", script: "ที่ไหน?", english: "Where?", example: { thai: "ห้องน้ำอยู่ที่ไหน?", romanized: "Hâwng-náam yùu thîi-nǎi?", english: "Where is the bathroom?" } },
      { romanized: "Tham-mai?", script: "ทำไม?", english: "Why?", example: { thai: "ทำไมมาสาย?", romanized: "Tham-mai maa sǎai?", english: "Why are you late?" } },
      { romanized: "Yang-ngai?", script: "ยังไง?", english: "How?", example: { thai: "ไปยังไง?", romanized: "Pai yang-ngai?", english: "How do I get there?" } },
      { romanized: "Gìi?", script: "กี่?", english: "How many?", example: { thai: "คุณมีพี่น้องกี่คน?", romanized: "Khun mii phîi-náwng gìi khon?", english: "How many siblings do you have?" } },
      { romanized: "Tâo-rai?", script: "เท่าไร?", english: "How much?", example: { thai: "อันนี้เท่าไร?", romanized: "An níi tâo-rai?", english: "How much is this?" } }
    ]
  },

  // ─── 8. Connectors & Particles ───
  {
    id: "connectors-particles", emoji: "🔗", label: "Connectors & Particles", type: "vocabulary", essential: true,
    pairs: [
      { romanized: "Khâ / Khráp", script: "ค่ะ / ครับ", english: "Polite particle", example: { thai: "ขอบคุณค่ะ", romanized: "Khàawp-khun khâ", english: "Thank you (female)" }, note: "khâ = female, khráp = male — add to end of sentences for politeness" },
      { romanized: "Mâi", script: "ไม่", english: "No / not", example: { thai: "ฉันไม่ชอบ", romanized: "Chǎn mâi châwp", english: "I don't like it" } },
      { romanized: "Mǎi?", script: "ไหม?", english: "Question particle", example: { thai: "อร่อยไหม?", romanized: "À-ròi mǎi?", english: "Is it delicious?" }, note: "Add mǎi to end of any statement to make it a yes/no question" },
      { romanized: "Láew", script: "แล้ว", english: "Already / then / done", example: { thai: "กินข้าวแล้ว", romanized: "Gin khâao láew", english: "Already ate" } },
      { romanized: "Yang", script: "ยัง", english: "Still / yet", example: { thai: "ยังไม่ได้กิน", romanized: "Yang mâi dâi gin", english: "Haven't eaten yet" } },
      { romanized: "Gâw", script: "ก็", english: "Also / then / so", example: { thai: "ฉันก็ชอบ", romanized: "Chǎn gâw châwp", english: "I also like it" } },
      { romanized: "Dtàe", script: "แต่", english: "But", example: { thai: "อร่อยแต่แพง", romanized: "À-ròi dtàe phaeng", english: "Delicious but expensive" } },
      { romanized: "Láe", script: "และ", english: "And", example: { thai: "พ่อและแม่", romanized: "Phâaw láe mâae", english: "Father and mother" } },
      { romanized: "Rěu", script: "หรือ", english: "Or", example: { thai: "ชาหรือกาแฟ?", romanized: "Chaa rěu gaa-fae?", english: "Tea or coffee?" } },
      { romanized: "Khǎawng", script: "ของ", english: "Of / belonging to", example: { thai: "นี่ของฉัน", romanized: "Nîi khǎawng chǎn", english: "This is mine" } },
      { romanized: "Thîi", script: "ที่", english: "At / which / that", example: { thai: "ร้านที่อร่อย", romanized: "Ráan thîi à-ròi", english: "The restaurant that is delicious" } },
      { romanized: "Gàp", script: "กับ", english: "With / and", example: { thai: "ไปกับเพื่อน", romanized: "Pai gàp phêuan", english: "Go with a friend" } },
      { romanized: "Jà", script: "จะ", english: "Will (future)", example: { thai: "ฉันจะไป", romanized: "Chǎn jà pai", english: "I will go" } },
      { romanized: "Khuan", script: "ควร", english: "Should", example: { thai: "คุณควรพักผ่อน", romanized: "Khun khuan phák-phàwn", english: "You should rest" } }
    ]
  },

  // ─── 9. Adjectives ───
  {
    id: "adjectives", emoji: "✨", label: "Adjectives", type: "vocabulary",
    pairs: [
      { romanized: "Dii", script: "ดี", english: "Good", example: { thai: "อาหารร้านนี้ดี", romanized: "Aa-hǎan ráan níi dii", english: "This restaurant's food is good" } },
      { romanized: "Mâi dii", script: "ไม่ดี", english: "Not good / bad", example: { thai: "อากาศไม่ดี", romanized: "Aa-gàat mâi dii", english: "The weather is bad" } },
      { romanized: "À-ròi", script: "อร่อย", english: "Delicious", example: { thai: "ส้มตำอร่อยมาก", romanized: "Sôm-dtam à-ròi mâak", english: "Som tam is very delicious" } },
      { romanized: "Sǔay", script: "สวย", english: "Beautiful", example: { thai: "ดอกไม้สวยจัง", romanized: "Dàwk-máai sǔay jang", english: "The flowers are so beautiful" } },
      { romanized: "Nâa-rák", script: "น่ารัก", english: "Cute / adorable", example: { thai: "ลูกแมวน่ารักมาก", romanized: "Lûuk-maew nâa-rák mâak", english: "The kitten is very cute" } },
      { romanized: "Yài", script: "ใหญ่", english: "Big / large", example: { thai: "บ้านนี้ใหญ่มาก", romanized: "Bâan níi yài mâak", english: "This house is very big" } },
      { romanized: "Lék", script: "เล็ก", english: "Small / little", example: { thai: "ห้องเล็กแต่น่ารัก", romanized: "Hâwng lék dtàe nâa-rák", english: "The room is small but cute" } },
      { romanized: "Raeng", script: "แรง", english: "Strong / intense", example: { thai: "ลมแรงมาก", romanized: "Lom raeng mâak", english: "The wind is very strong" } },
      { romanized: "Nǎao", script: "หนาว", english: "Cold (weather)", example: { thai: "วันนี้หนาวมาก", romanized: "Wan níi nǎao mâak", english: "Today is very cold" } },
      { romanized: "Rón", script: "ร้อน", english: "Hot (weather)", example: { thai: "เมืองไทยร้อนมาก", romanized: "Meuang Thai rón mâak", english: "Thailand is very hot" } },
      { romanized: "Yen", script: "เย็น", english: "Cool / cold", example: { thai: "น้ำเย็นอร่อย", romanized: "Náam yen à-ròi", english: "Cold water is refreshing" } },
      { romanized: "Glaang", script: "กลาง", english: "Middle / medium", example: { thai: "ขอไซส์กลาง", romanized: "Khǎaw sái glaang", english: "Medium size please" } },
      { romanized: "Phaeng", script: "แพง", english: "Expensive", example: { thai: "กรุงเทพแพงมาก", romanized: "Grung-thêep phaeng mâak", english: "Bangkok is very expensive" } },
      { romanized: "Thùuk", script: "ถูก", english: "Cheap / correct", example: { thai: "ร้านนี้ถูกมาก", romanized: "Ráan níi thùuk mâak", english: "This shop is very cheap" }, note: "ถูก means both 'cheap' AND 'correct' — context tells you which" },
      { romanized: "Mài", script: "ใหม่", english: "New", example: { thai: "ซื้อรถใหม่", romanized: "Séu rót mài", english: "Buy a new car" }, note: "mài (new) vs mâi (not) — the diacritic is the only difference!" },
      { romanized: "Gào", script: "เก่า", english: "Old (objects)", example: { thai: "โทรศัพท์เก่าแล้ว", romanized: "Thoo-rá-sàp gào láew", english: "The phone is old now" } }
    ]
  },

  // ─── 10. Feelings & States ───
  {
    id: "feelings", emoji: "😊", label: "Feelings", type: "vocabulary",
    pairs: [
      { romanized: "Dii-jai", script: "ดีใจ", english: "Happy / glad", example: { thai: "ฉันดีใจที่เจอคุณ", romanized: "Chǎn dii-jai thîi jur khun", english: "I'm glad to meet you" } },
      { romanized: "Sǐa-jai", script: "เสียใจ", english: "Sad / sorry", example: { thai: "เสียใจด้วยนะ", romanized: "Sǐa-jai dûay ná", english: "I'm sorry about that" } },
      { romanized: "Glua", script: "กลัว", english: "Scared / afraid", example: { thai: "ฉันกลัวงู", romanized: "Chǎn glua nguu", english: "I'm afraid of snakes" } },
      { romanized: "Ngong", script: "งง", english: "Confused", example: { thai: "ฉันงงมาก", romanized: "Chǎn ngong mâak", english: "I'm very confused" } },
      { romanized: "Nèuay", script: "เหนื่อย", english: "Tired", example: { thai: "วันนี้เหนื่อยมาก", romanized: "Wan níi nèuay mâak", english: "Today I'm very tired" } },
      { romanized: "Hǐw-khâao", script: "หิวข้าว", english: "Hungry", example: { thai: "หิวข้าวจังเลย", romanized: "Hǐw-khâao jang loei", english: "So hungry!" }, note: "Literally 'hungry for rice' — rice is the Thai word for food/meal" },
      { romanized: "Hǐw-náam", script: "หิวน้ำ", english: "Thirsty", example: { thai: "หิวน้ำมากเลย", romanized: "Hǐw-náam mâak loei", english: "Very thirsty!" }, note: "Literally 'hungry for water'" },
      { romanized: "Ngîap", script: "เงียบ", english: "Quiet / silent", example: { thai: "เงียบหน่อยได้ไหม?", romanized: "Ngîap nòi dâi mǎi?", english: "Can you be quiet please?" } },
      { romanized: "Sà-baai", script: "สบาย", english: "Comfortable / well", example: { thai: "สบายดีครับ", romanized: "Sà-baai dii khráp", english: "I'm well (male)" } },
      { romanized: "Mâi sà-baai", script: "ไม่สบาย", english: "Unwell / sick", example: { thai: "วันนี้ไม่สบาย", romanized: "Wan níi mâi sà-baai", english: "Not feeling well today" } },
      { romanized: "Sà-nùk", script: "สนุก", english: "Fun / enjoyable", example: { thai: "ปาร์ตี้สนุกมาก", romanized: "Bpaa-dtîi sà-nùk mâak", english: "The party is very fun" } },
      { romanized: "Bèua", script: "เบื่อ", english: "Bored / fed up", example: { thai: "เบื่อแล้ว", romanized: "Bèua láew", english: "Bored already" } }
    ]
  },

  // ─── 11. Locations & Directions ───
  {
    id: "locations-directions", emoji: "🧭", label: "Locations & Directions", type: "vocabulary",
    pairs: [
      { romanized: "Tîi-nǎi?", script: "ที่ไหน?", english: "Where?", example: { thai: "คุณจะไปที่ไหน?", romanized: "Khun jà pai thîi-nǎi?", english: "Where are you going?" } },
      { romanized: "Yùu thîi-nǎi?", script: "อยู่ที่ไหน?", english: "Where is it?", example: { thai: "สถานีรถไฟอยู่ที่ไหน?", romanized: "Sà-thǎa-nii rót-fai yùu thîi-nǎi?", english: "Where is the train station?" } },
      { romanized: "Glai", script: "ไกล", english: "Far", example: { thai: "ไกลไหม?", romanized: "Glai mǎi?", english: "Is it far?" }, note: "glai (mid=far) vs glâi (falling=near) — same sounds, different tones!" },
      { romanized: "Glâi", script: "ใกล้", english: "Near / close", example: { thai: "ร้านอยู่ใกล้", romanized: "Ráan yùu glâi", english: "The shop is nearby" } },
      { romanized: "Khâang-nâa", script: "ข้างหน้า", english: "In front / ahead", example: { thai: "อยู่ข้างหน้าครับ", romanized: "Yùu khâang-nâa khráp", english: "It's up ahead" } },
      { romanized: "Khâang-lǎng", script: "ข้างหลัง", english: "Behind", example: { thai: "ห้องน้ำอยู่ข้างหลัง", romanized: "Hâwng-náam yùu khâang-lǎng", english: "The bathroom is in the back" } },
      { romanized: "Khâang-sáai", script: "ข้างซ้าย", english: "On the left", example: { thai: "อยู่ข้างซ้ายมือ", romanized: "Yùu khâang-sáai mue", english: "It's on the left side" } },
      { romanized: "Khâang-khwǎa", script: "ข้างขวา", english: "On the right", example: { thai: "เลี้ยวข้างขวา", romanized: "Líeo khâang-khwǎa", english: "Turn to the right" } },
      { romanized: "Trong-pai", script: "ตรงไป", english: "Go straight", example: { thai: "ตรงไปข้างหน้า", romanized: "Trong-pai khâang-nâa", english: "Go straight ahead" } },
      { romanized: "Líeo-sáai", script: "เลี้ยวซ้าย", english: "Turn left", example: { thai: "เลี้ยวซ้ายตรงนั้น", romanized: "Líeo-sáai trong nán", english: "Turn left over there" } },
      { romanized: "Líeo-khwǎa", script: "เลี้ยวขวา", english: "Turn right", example: { thai: "เลี้ยวขวาแล้วตรงไป", romanized: "Líeo-khwǎa láew trong-pai", english: "Turn right then go straight" } },
      { romanized: "Bon", script: "บน", english: "On / above / upstairs", example: { thai: "อยู่ชั้นบน", romanized: "Yùu chán bon", english: "It's upstairs" } },
      { romanized: "Lâang", script: "ล่าง", english: "Below / downstairs", example: { thai: "ร้านอยู่ข้างล่าง", romanized: "Ráan yùu khâang lâang", english: "The shop is downstairs" } },
      { romanized: "Nai", script: "ใน", english: "Inside / in", example: { thai: "อยู่ในกระเป๋า", romanized: "Yùu nai grà-bpǎo", english: "It's in the bag" } }
    ]
  },

  // ─── 12. Essential Verbs ───
  {
    id: "essential-verbs", emoji: "💬", label: "Essential Verbs", type: "vocabulary",
    pairs: [
      { romanized: "Ao", script: "เอา", english: "To want / take", example: { thai: "เอาอันนี้", romanized: "Ao an níi", english: "I'll take this one" } },
      { romanized: "Dtâwng-gaan", script: "ต้องการ", english: "To need / require", example: { thai: "ฉันต้องการความช่วยเหลือ", romanized: "Chǎn dtâwng-gaan khwaam-chûay-lěua", english: "I need help" } },
      { romanized: "Mii", script: "มี", english: "To have / there is", example: { thai: "มีห้องว่างไหม?", romanized: "Mii hâwng wâang mǎi?", english: "Do you have a room?" } },
      { romanized: "Mâi mii", script: "ไม่มี", english: "Don't have / there isn't", example: { thai: "ไม่มีปัญหา", romanized: "Mâi mii bpan-hǎa", english: "No problem" } },
      { romanized: "Pen", script: "เป็น", english: "To be / able to", example: { thai: "เขาเป็นหมอ", romanized: "Khǎo pen mǎw", english: "He/she is a doctor" } },
      { romanized: "Mâi pen rai", script: "ไม่เป็นไร", english: "Never mind / it's okay", example: { thai: "ไม่เป็นไรครับ", romanized: "Mâi pen rai khráp", english: "It's okay (male)" } },
      { romanized: "Chái", script: "ใช้", english: "To use", example: { thai: "ใช้โทรศัพท์ได้ไหม?", romanized: "Chái thoo-rá-sàp dâi mǎi?", english: "Can I use the phone?" } },
      { romanized: "Dâi", script: "ได้", english: "Can / able to", example: { thai: "พูดไทยได้ไหม?", romanized: "Phûut Thai dâi mǎi?", english: "Can you speak Thai?" } },
      { romanized: "Dâi mǎi?", script: "ได้ไหม?", english: "Can you? / Is it possible?", example: { thai: "ลดราคาได้ไหม?", romanized: "Lót raa-khaa dâi mǎi?", english: "Can you reduce the price?" } },
      { romanized: "Rúu", script: "รู้", english: "To know (a fact)", example: { thai: "ฉันไม่รู้", romanized: "Chǎn mâi rúu", english: "I don't know" } },
      { romanized: "Rúu-jàk", script: "รู้จัก", english: "To know (a person)", example: { thai: "คุณรู้จักเขาไหม?", romanized: "Khun rúu-jàk khǎo mǎi?", english: "Do you know him/her?" } },
      { romanized: "Khâo-jai", script: "เข้าใจ", english: "To understand", example: { thai: "คุณเข้าใจไหม?", romanized: "Khun khâo-jai mǎi?", english: "Do you understand?" } },
      { romanized: "Mâi khâo-jai", script: "ไม่เข้าใจ", english: "Don't understand", example: { thai: "ฉันไม่เข้าใจ", romanized: "Chǎn mâi khâo-jai", english: "I don't understand" } },
      { romanized: "Fang", script: "ฟัง", english: "To listen", example: { thai: "ฟังเพลงไทย", romanized: "Fang phleng Thai", english: "Listen to Thai music" } },
      { romanized: "Duu", script: "ดู", english: "To watch / look at", example: { thai: "ดูหนังด้วยกัน", romanized: "Duu nǎng dûay-gan", english: "Watch a movie together" } },
      { romanized: "Hâi", script: "ให้", english: "To give", example: { thai: "ให้เงินเขา", romanized: "Hâi ngoen khǎo", english: "Give money to him/her" } },
      { romanized: "Bàwk", script: "บอก", english: "To tell / say", example: { thai: "บอกฉันหน่อย", romanized: "Bàwk chǎn nòi", english: "Tell me please" } },
      { romanized: "Thǎam", script: "ถาม", english: "To ask", example: { thai: "ขอถามหน่อย", romanized: "Khǎaw thǎam nòi", english: "May I ask something?" } },
      { romanized: "Gin", script: "กิน", english: "To eat", example: { thai: "กินข้าวหรือยัง?", romanized: "Gin khâao rěu yang?", english: "Have you eaten yet?" } },
      { romanized: "Dèum", script: "ดื่ม", english: "To drink", example: { thai: "ดื่มน้ำเยอะๆ", romanized: "Dèum náam yóe yóe", english: "Drink lots of water" } }
    ]
  },

  // ─── 13. Greetings & Phrases ───
  {
    id: "greetings-phrases", emoji: "🙏", label: "Greetings & Phrases", type: "vocabulary", essential: true,
    pairs: [
      { romanized: "Sà-wàt-dii", script: "สวัสดี", english: "Hello / goodbye", example: { thai: "สวัสดีครับ", romanized: "Sà-wàt-dii khráp", english: "Hello (male)" } },
      { romanized: "Khàawp-khun", script: "ขอบคุณ", english: "Thank you", example: { thai: "ขอบคุณมากค่ะ", romanized: "Khàawp-khun mâak khâ", english: "Thank you very much (female)" } },
      { romanized: "Khàawp-khun mâak", script: "ขอบคุณมาก", english: "Thank you very much", example: { thai: "ขอบคุณมากครับ", romanized: "Khàawp-khun mâak khráp", english: "Thank you very much (male)" } },
      { romanized: "Mâi pen rai", script: "ไม่เป็นไร", english: "You're welcome / no problem", example: { thai: "ไม่เป็นไรค่ะ", romanized: "Mâi pen rai khâ", english: "No problem (female)" } },
      { romanized: "Khǎaw-thôot", script: "ขอโทษ", english: "Sorry / excuse me", example: { thai: "ขอโทษครับ ขอถามหน่อย", romanized: "Khǎaw-thôot khráp khǎaw thǎam nòi", english: "Excuse me, may I ask?" } },
      { romanized: "Pen yang-ngai?", script: "เป็นยังไง?", english: "How are you?", example: { thai: "วันนี้เป็นยังไงบ้าง?", romanized: "Wan níi pen yang-ngai bâang?", english: "How are you doing today?" } },
      { romanized: "Sà-baai dii mǎi?", script: "สบายดีไหม?", english: "Are you well?", example: { thai: "คุณสบายดีไหม?", romanized: "Khun sà-baai dii mǎi?", english: "Are you well?" } },
      { romanized: "Sà-baai dii", script: "สบายดี", english: "I'm well / fine", example: { thai: "สบายดีครับ ขอบคุณ", romanized: "Sà-baai dii khráp khàawp-khun", english: "I'm fine, thank you (male)" } },
      { romanized: "Yin-dii", script: "ยินดี", english: "Pleased to meet you", example: { thai: "ยินดีที่ได้รู้จัก", romanized: "Yin-dii thîi dâi rúu-jàk", english: "Pleased to meet you" } },
      { romanized: "Laa-gàwn", script: "ลาก่อน", english: "Goodbye (informal)", example: { thai: "ลาก่อนนะ!", romanized: "Laa-gàwn ná!", english: "Bye bye!" } },
      { romanized: "Jur-gan mǎi?", script: "เจอกันไหม?", english: "Shall we meet?", example: { thai: "พรุ่งนี้เจอกันไหม?", romanized: "Phrûng níi jur-gan mǎi?", english: "Shall we meet tomorrow?" } },
      { romanized: "Jur-gan", script: "เจอกัน", english: "See you", example: { thai: "เจอกันพรุ่งนี้", romanized: "Jur-gan phrûng níi", english: "See you tomorrow" } },
      { romanized: "Châi mǎi?", script: "ใช่ไหม?", english: "Right? / Isn't it?", example: { thai: "อร่อยใช่ไหม?", romanized: "À-ròi châi mǎi?", english: "Delicious, right?" } },
      { romanized: "Châi", script: "ใช่", english: "Yes / correct", example: { thai: "ใช่ครับ ถูกต้อง", romanized: "Châi khráp thùuk-dtâwng", english: "Yes, that's correct (male)" } }
    ]
  },

  // ─── 14. Family ───
  {
    id: "family", emoji: "👨‍👩‍👧", label: "Family", type: "vocabulary",
    pairs: [
      { romanized: "Phâaw", script: "พ่อ", english: "Father", example: { thai: "พ่อทำงานทุกวัน", romanized: "Phâaw tham-ngaan thúk wan", english: "Father works every day" } },
      { romanized: "Mâae", script: "แม่", english: "Mother", example: { thai: "แม่ทำอาหารอร่อย", romanized: "Mâae tham aa-hǎan à-ròi", english: "Mother cooks delicious food" } },
      { romanized: "Bpùu", script: "ปู่", english: "Paternal grandfather", example: { thai: "ปู่อายุแปดสิบปี", romanized: "Bpùu aa-yú bpàet-sìp bpii", english: "Grandfather is 80 years old" } },
      { romanized: "Yâa", script: "ย่า", english: "Paternal grandmother", example: { thai: "ย่าอยู่ต่างจังหวัด", romanized: "Yâa yùu dtàang-jang-wàt", english: "Grandmother lives upcountry" } },
      { romanized: "Dtaa", script: "ตา", english: "Maternal grandfather", example: { thai: "ตาพาไปตกปลา", romanized: "Dtaa phaa pai dtòk bplaa", english: "Grandpa takes me fishing" } },
      { romanized: "Yaai", script: "ยาย", english: "Maternal grandmother", example: { thai: "ยายปลูกผัก", romanized: "Yaai bplùuk phàk", english: "Grandma grows vegetables" } },
      { romanized: "Phîi-chaai", script: "พี่ชาย", english: "Older brother", example: { thai: "พี่ชายอายุมากกว่า", romanized: "Phîi-chaai aa-yú mâak gwàa", english: "Older brother is older" } },
      { romanized: "Náwng-chaai", script: "น้องชาย", english: "Younger brother", example: { thai: "น้องชายเรียนหนังสือ", romanized: "Náwng-chaai rian nǎng-sěu", english: "Younger brother is studying" } },
      { romanized: "Phîi-sǎao", script: "พี่สาว", english: "Older sister", example: { thai: "พี่สาวทำงานที่กรุงเทพ", romanized: "Phîi-sǎao tham-ngaan thîi Grung-thêep", english: "Older sister works in Bangkok" } },
      { romanized: "Náwng-sǎao", script: "น้องสาว", english: "Younger sister", example: { thai: "น้องสาวอายุสิบห้า", romanized: "Náwng-sǎao aa-yú sìp-hâa", english: "Younger sister is 15" } },
      { romanized: "Lûuk", script: "ลูก", english: "Child / children", example: { thai: "มีลูกกี่คน?", romanized: "Mii lûuk gìi khon?", english: "How many children?" } },
      { romanized: "Lûuk-chaai", script: "ลูกชาย", english: "Son", example: { thai: "ลูกชายเรียนเก่ง", romanized: "Lûuk-chaai rian gèng", english: "My son studies well" } },
      { romanized: "Lûuk-sǎao", script: "ลูกสาว", english: "Daughter", example: { thai: "ลูกสาวน่ารักมาก", romanized: "Lûuk-sǎao nâa-rák mâak", english: "My daughter is very cute" } },
      { romanized: "Phǔa", script: "ผัว", english: "Husband (informal)", example: { thai: "ผัวทำงานที่ไหน?", romanized: "Phǔa tham-ngaan thîi-nǎi?", english: "Where does your husband work?" } },
      { romanized: "Mia", script: "เมีย", english: "Wife (informal)", example: { thai: "เมียทำกับข้าวอร่อย", romanized: "Mia tham gàp-khâao à-ròi", english: "Wife cooks delicious food" } },
      { romanized: "Lung", script: "ลุง", english: "Uncle (older)", example: { thai: "ลุงมาเยี่ยม", romanized: "Lung maa yîam", english: "Uncle came to visit" } },
      { romanized: "Bpâa", script: "ป้า", english: "Aunt (older)", example: { thai: "ป้าขายของที่ตลาด", romanized: "Bpâa khǎai khǎawng thîi dtà-làat", english: "Aunt sells things at the market" } },
      { romanized: "Náa", script: "น้า", english: "Aunt/uncle (younger sibling of parent)", example: { thai: "น้าอยู่เชียงใหม่", romanized: "Náa yùu Chiang-mài", english: "Aunt/uncle lives in Chiang Mai" } },
      { romanized: "Phêuan", script: "เพื่อน", english: "Friend", example: { thai: "เพื่อนดีมีค่ามาก", romanized: "Phêuan dii mii khâa mâak", english: "A good friend is very valuable" } }
    ]
  },

  // ─── 15. Numbers — Extended ───
  {
    id: "numbers-extended", emoji: "🔢", label: "Numbers — Extended", type: "vocabulary",
    pairs: [
      { romanized: "Nùeng", script: "หนึ่ง", english: "One (1)", example: { thai: "ขอหนึ่งอัน", romanized: "Khǎaw nùeng an", english: "One piece please" } },
      { romanized: "Sìp", script: "สิบ", english: "Ten (10)", example: { thai: "สิบบาท", romanized: "Sìp bàat", english: "Ten baht" } },
      { romanized: "Sìp-èt", script: "สิบเอ็ด", english: "Eleven (11)", example: { thai: "สิบเอ็ดโมง", romanized: "Sìp-èt mohng", english: "Eleven o'clock" }, note: "èt replaces nùeng in the ones place after 10" },
      { romanized: "Yîi-sìp", script: "ยี่สิบ", english: "Twenty (20)", example: { thai: "ยี่สิบบาท", romanized: "Yîi-sìp bàat", english: "Twenty baht" }, note: "yîi replaces sǎawng for the tens digit in 20" },
      { romanized: "Yîi-sìp-èt", script: "ยี่สิบเอ็ด", english: "Twenty-one (21)", example: { thai: "อายุยี่สิบเอ็ดปี", romanized: "Aa-yú yîi-sìp-èt bpii", english: "21 years old" } },
      { romanized: "Sǎam-sìp", script: "สามสิบ", english: "Thirty (30)", example: { thai: "สามสิบนาที", romanized: "Sǎam-sìp naa-thii", english: "Thirty minutes" } },
      { romanized: "Rói", script: "ร้อย", english: "One hundred (100)", example: { thai: "ร้อยบาท", romanized: "Rói bàat", english: "One hundred baht" } },
      { romanized: "Sǎawng-rói", script: "สองร้อย", english: "Two hundred (200)", example: { thai: "สองร้อยห้าสิบบาท", romanized: "Sǎawng-rói hâa-sìp bàat", english: "250 baht" } },
      { romanized: "Nùeng-phan", script: "หนึ่งพัน", english: "One thousand (1,000)", example: { thai: "หนึ่งพันบาท", romanized: "Nùeng-phan bàat", english: "One thousand baht" } },
      { romanized: "Hâa-phan", script: "ห้าพัน", english: "Five thousand (5,000)", example: { thai: "ค่าเช่าห้าพันบาท", romanized: "Khâa-châo hâa-phan bàat", english: "Rent is 5,000 baht" } },
      { romanized: "Nùeng-mèun", script: "หนึ่งหมื่น", english: "Ten thousand (10,000)", example: { thai: "เงินเดือนหนึ่งหมื่น", romanized: "Ngoen-deuan nùeng-mèun", english: "Salary 10,000" }, note: "Thais use mèun (หมื่น) not sìp-phan" },
      { romanized: "Nùeng-sǎaen", script: "หนึ่งแสน", english: "100,000", example: { thai: "รถราคาแสนบาท", romanized: "Rót raa-khaa sǎaen bàat", english: "Car costs 100,000 baht" }, note: "sǎaen (แสน) = unique Thai word for 100,000" },
      { romanized: "Nùeng-láan", script: "หนึ่งล้าน", english: "One million", example: { thai: "ล้านบาท!", romanized: "Láan bàat!", english: "One million baht!" } },
      { romanized: "Sǎawng-láan", script: "สองล้าน", english: "Two million", example: { thai: "บ้านราคาสองล้าน", romanized: "Bâan raa-khaa sǎawng-láan", english: "House costs two million" } },
      { romanized: "Khrûeng", script: "ครึ่ง", english: "Half", example: { thai: "ครึ่งชั่วโมง", romanized: "Khrûeng chuâ-mohng", english: "Half an hour" } },
      { romanized: "Gìi?", script: "กี่?", english: "How many?", example: { thai: "กี่บาท?", romanized: "Gìi bàat?", english: "How many baht?" } }
    ]
  },

  // ─── 16. Kitchenware ───
  {
    id: "kitchenware", emoji: "🍽️", label: "Kitchenware", type: "vocabulary",
    pairs: [
      { romanized: "Gâew", script: "แก้ว", english: "Glass / cup", example: { thai: "ขอน้ำหนึ่งแก้ว", romanized: "Khǎaw náam nùeng gâew", english: "One glass of water please" } },
      { romanized: "Jaan", script: "จาน", english: "Plate", example: { thai: "ล้างจานด้วย", romanized: "Láang jaan dûay", english: "Wash the plates too" } },
      { romanized: "Thûay", script: "ถ้วย", english: "Bowl / small cup", example: { thai: "ก๋วยเตี๋ยวหนึ่งถ้วย", romanized: "Gǔay-dtǐao nùeng thûay", english: "One bowl of noodles" } },
      { romanized: "Dtà-gìap", script: "ตะเกียบ", english: "Chopsticks", example: { thai: "ใช้ตะเกียบเป็นไหม?", romanized: "Chái dtà-gìap pen mǎi?", english: "Can you use chopsticks?" } },
      { romanized: "Cháwn", script: "ช้อน", english: "Spoon", example: { thai: "ขอช้อนอีกอัน", romanized: "Khǎaw cháwn ìik an", english: "Another spoon please" } },
      { romanized: "Sâwm", script: "ส้อม", english: "Fork", example: { thai: "ช้อนกับส้อม", romanized: "Cháwn gàp sâwm", english: "Spoon and fork" } },
      { romanized: "Mîit", script: "มีด", english: "Knife", example: { thai: "มีดคมมาก", romanized: "Mîit khom mâak", english: "The knife is very sharp" } },
      { romanized: "Mâw", script: "หม้อ", english: "Pot", example: { thai: "ต้มน้ำในหม้อ", romanized: "Dtôm náam nai mâw", english: "Boil water in a pot" } },
      { romanized: "Grà-thá", script: "กระทะ", english: "Wok / frying pan", example: { thai: "ผัดในกระทะ", romanized: "Phàt nai grà-thá", english: "Stir-fry in the wok" } },
      { romanized: "Chín", script: "ชิ้น", english: "Piece / slice", example: { thai: "ขอเค้กหนึ่งชิ้น", romanized: "Khǎaw khéek nùeng chín", english: "One piece of cake please" }, note: "Food classifier — nùeng chín = one piece" }
    ]
  },

  // ─── 17. Fruits ───
  {
    id: "fruits", emoji: "🍉", label: "Fruits", type: "vocabulary",
    pairs: [
      { romanized: "Mà-mûang", script: "มะม่วง", english: "Mango", example: { thai: "มะม่วงหวานมาก", romanized: "Mà-mûang wǎan mâak", english: "The mango is very sweet" } },
      { romanized: "Mà-lá-gaw", script: "มะละกอ", english: "Papaya", example: { thai: "ส้มตำใส่มะละกอ", romanized: "Sôm-dtam sài mà-lá-gaw", english: "Som tam uses papaya" } },
      { romanized: "Glûay", script: "กล้วย", english: "Banana", example: { thai: "กล้วยหอมอร่อย", romanized: "Glûay hǎawm à-ròi", english: "Banana is delicious" } },
      { romanized: "Sàp-bpà-rót", script: "สับปะรด", english: "Pineapple", example: { thai: "สับปะรดเปรี้ยวนิดหน่อย", romanized: "Sàp-bpà-rót bprîao nít-nòi", english: "Pineapple is a bit sour" } },
      { romanized: "Dtaeng-mo", script: "แตงโม", english: "Watermelon", example: { thai: "แตงโมเย็นๆ อร่อย", romanized: "Dtaeng-mo yen yen à-ròi", english: "Cold watermelon is delicious" } },
      { romanized: "Sôm", script: "ส้ม", english: "Orange", example: { thai: "น้ำส้มสดหนึ่งแก้ว", romanized: "Náam sôm sòt nùeng gâew", english: "One glass of fresh OJ" } },
      { romanized: "Lín-jîi", script: "ลิ้นจี่", english: "Lychee", example: { thai: "ลิ้นจี่หวานมาก", romanized: "Lín-jîi wǎan mâak", english: "Lychee is very sweet" } },
      { romanized: "Thú-rian", script: "ทุเรียน", english: "Durian", example: { thai: "ทุเรียนราคาแพง", romanized: "Thú-rian raa-khaa phaeng", english: "Durian is expensive" } },
      { romanized: "Mang-khút", script: "มังคุด", english: "Mangosteen", example: { thai: "มังคุดเป็นราชินีของผลไม้", romanized: "Mang-khút pen raa-chí-nii khǎawng phǒn-lá-máai", english: "Mangosteen is the queen of fruits" } },
      { romanized: "Fà-ràng", script: "ฝรั่ง", english: "Guava", example: { thai: "ฝรั่งจิ้มพริกเกลือ", romanized: "Fà-ràng jîm phrík glua", english: "Guava dipped in chili salt" }, note: "ฝรั่ง means both 'guava' AND 'foreigner/Westerner' — famous double meaning!" }
    ]
  },

  // ─── 18. Meats & Proteins ───
  {
    id: "meats-proteins", emoji: "🍖", label: "Meats & Proteins", type: "vocabulary",
    pairs: [
      { romanized: "Néua", script: "เนื้อ", english: "Beef / meat", example: { thai: "ข้าวผัดเนื้อ", romanized: "Khâao-phàt néua", english: "Beef fried rice" } },
      { romanized: "Mǔu", script: "หมู", english: "Pork", example: { thai: "หมูกรอบอร่อย", romanized: "Mǔu gràwp à-ròi", english: "Crispy pork is delicious" } },
      { romanized: "Gài", script: "ไก่", english: "Chicken", example: { thai: "ข้าวมันไก่จานหนึ่ง", romanized: "Khâao man gài jaan nùeng", english: "One plate of chicken rice" } },
      { romanized: "Bplaa", script: "ปลา", english: "Fish", example: { thai: "ปลาทอดกรอบ", romanized: "Bplaa thâwt gràwp", english: "Crispy fried fish" } },
      { romanized: "Gûng", script: "กุ้ง", english: "Shrimp / prawn", example: { thai: "ต้มยำกุ้งอร่อยมาก", romanized: "Dtôm-yam gûng à-ròi mâak", english: "Tom yum shrimp is delicious" } },
      { romanized: "Hǎwy", script: "หอย", english: "Shellfish / clam", example: { thai: "หอยลายผัดพริก", romanized: "Hǎwy laai phàt phrík", english: "Stir-fried clams with chili" } },
      { romanized: "Khài", script: "ไข่", english: "Egg", example: { thai: "ไข่เจียวหนึ่งจาน", romanized: "Khài jiao nùeng jaan", english: "One omelet please" }, note: "khài (egg) vs khǎai (to sell) — different tones!" },
      { romanized: "Dtâo-hûu", script: "เต้าหู้", english: "Tofu", example: { thai: "เต้าหู้ทอด", romanized: "Dtâo-hûu thâwt", english: "Fried tofu" } }
    ]
  },

  // ─── 19. Ingredients ───
  {
    id: "ingredients", emoji: "🧄", label: "Ingredients", type: "vocabulary",
    pairs: [
      { romanized: "Náam-dtaan", script: "น้ำตาล", english: "Sugar", example: { thai: "ไม่ใส่น้ำตาล", romanized: "Mâi sài náam-dtaan", english: "No sugar please" } },
      { romanized: "Glua", script: "เกลือ", english: "Salt", example: { thai: "ใส่เกลือนิดหน่อย", romanized: "Sài glua nít-nòi", english: "Add a little salt" } },
      { romanized: "Nám-man", script: "น้ำมัน", english: "Oil", example: { thai: "ผัดด้วยน้ำมัน", romanized: "Phàt dûay nám-man", english: "Stir-fry with oil" } },
      { romanized: "Phrík", script: "พริก", english: "Chili", example: { thai: "เผ็ดมาก ใส่พริกเยอะ", romanized: "Phèt mâak sài phrík yóe", english: "Very spicy, lots of chili" } },
      { romanized: "Grà-thiam", script: "กระเทียม", english: "Garlic", example: { thai: "ผัดกระเทียมพริกไทย", romanized: "Phàt grà-thiam phrík-thai", english: "Stir-fried with garlic and pepper" } },
      { romanized: "Hǔa-hǎwm", script: "หัวหอม", english: "Onion", example: { thai: "หั่นหัวหอม", romanized: "Hàn hǔa-hǎwm", english: "Chop the onion" } },
      { romanized: "Má-nao", script: "มะนาว", english: "Lime", example: { thai: "บีบมะนาวใส่", romanized: "Bìip má-nao sài", english: "Squeeze lime in" } },
      { romanized: "Nám-bplaa", script: "น้ำปลา", english: "Fish sauce", example: { thai: "น้ำปลาเป็นเครื่องปรุงหลัก", romanized: "Nám-bplaa pen khrêuang-bprung làk", english: "Fish sauce is the main condiment" } },
      { romanized: "Khǐng", script: "ขิง", english: "Ginger", example: { thai: "ชาขิงร้อนๆ", romanized: "Chaa khǐng rón rón", english: "Hot ginger tea" } },
      { romanized: "Bai-grà-phao", script: "ใบกะเพรา", english: "Thai basil", example: { thai: "ผัดกะเพราหมู", romanized: "Phàt grà-phao mǔu", english: "Stir-fried basil with pork" } }
    ]
  },

  // ─── 20. Food & Eating ───
  {
    id: "food-eating", emoji: "🍜", label: "Food & Eating", type: "vocabulary",
    pairs: [
      { romanized: "Khâao", script: "ข้าว", english: "Rice", example: { thai: "ขอข้าวเพิ่ม", romanized: "Khǎaw khâao phôem", english: "More rice please" } },
      { romanized: "Khâao-phàt", script: "ข้าวผัด", english: "Fried rice", example: { thai: "ข้าวผัดหมูหนึ่งจาน", romanized: "Khâao-phàt mǔu nùeng jaan", english: "One pork fried rice" } },
      { romanized: "Phàt-thai", script: "ผัดไทย", english: "Pad Thai", example: { thai: "ผัดไทยกุ้งอร่อยมาก", romanized: "Phàt-thai gûng à-ròi mâak", english: "Shrimp pad Thai is delicious" } },
      { romanized: "Dtôm-yam", script: "ต้มยำ", english: "Tom yum soup", example: { thai: "ต้มยำเผ็ดมาก", romanized: "Dtôm-yam phèt mâak", english: "Tom yum is very spicy" } },
      { romanized: "Gaeng-khǐao-wǎan", script: "แกงเขียวหวาน", english: "Green curry", example: { thai: "แกงเขียวหวานอร่อย", romanized: "Gaeng-khǐao-wǎan à-ròi", english: "Green curry is delicious" } },
      { romanized: "Náam", script: "น้ำ", english: "Water / liquid", example: { thai: "ขอน้ำเปล่าหนึ่งขวด", romanized: "Khǎaw náam bplào nùeng khùat", english: "One bottle of water please" } },
      { romanized: "Náam-yen", script: "น้ำเย็น", english: "Cold water", example: { thai: "ขอน้ำเย็น", romanized: "Khǎaw náam-yen", english: "Cold water please" } },
      { romanized: "Bia", script: "เบียร์", english: "Beer", example: { thai: "ขอเบียร์หนึ่งขวด", romanized: "Khǎaw bia nùeng khùat", english: "One beer please" } },
      { romanized: "Gaa-fae", script: "กาแฟ", english: "Coffee", example: { thai: "กาแฟร้อนหนึ่งแก้ว", romanized: "Gaa-fae rón nùeng gâew", english: "One hot coffee" } },
      { romanized: "Chaa", script: "ชา", english: "Tea", example: { thai: "ชาเย็นหวานมาก", romanized: "Chaa yen wǎan mâak", english: "Thai iced tea is very sweet" } },
      { romanized: "Aa-hǎan", script: "อาหาร", english: "Food / meal", example: { thai: "อาหารไทยอร่อย", romanized: "Aa-hǎan Thai à-ròi", english: "Thai food is delicious" } },
      { romanized: "Aa-hǎan-cháo", script: "อาหารเช้า", english: "Breakfast", example: { thai: "กินอาหารเช้าแล้ว", romanized: "Gin aa-hǎan-cháo láew", english: "Already had breakfast" } },
      { romanized: "Aa-hǎan-glaang-wan", script: "อาหารกลางวัน", english: "Lunch", example: { thai: "กินอาหารกลางวันกัน", romanized: "Gin aa-hǎan-glaang-wan gan", english: "Let's have lunch" } },
      { romanized: "Aa-hǎan-yen", script: "อาหารเย็น", english: "Dinner", example: { thai: "อาหารเย็นกินอะไร?", romanized: "Aa-hǎan-yen gin à-rai?", english: "What's for dinner?" } },
      { romanized: "Gin-khâao", script: "กินข้าว", english: "To eat", example: { thai: "กินข้าวหรือยัง?", romanized: "Gin-khâao rěu yang?", english: "Have you eaten yet?" }, note: "Literally 'eat rice' — the most common way to say 'eat' in Thai" },
      { romanized: "Pai gin khâao?", script: "ไปกินข้าว?", english: "Want to grab food?", example: { thai: "ไปกินข้าวด้วยกันไหม?", romanized: "Pai gin khâao dûay-gan mǎi?", english: "Want to go eat together?" }, note: "Extremely common social phrase — basically 'want to hang out?'" }
    ]
  },

  // ─── 21. Shopping & Money ───
  {
    id: "shopping-money", emoji: "🛍️", label: "Shopping & Money", type: "vocabulary",
    pairs: [
      { romanized: "Bàat", script: "บาท", english: "Thai Baht", example: { thai: "ราคาห้าสิบบาท", romanized: "Raa-khaa hâa-sìp bàat", english: "The price is 50 baht" } },
      { romanized: "Raa-khaa", script: "ราคา", english: "Price", example: { thai: "ราคาเท่าไร?", romanized: "Raa-khaa tâo-rai?", english: "What's the price?" } },
      { romanized: "Phaeng pai", script: "แพงไป", english: "Too expensive", example: { thai: "แพงไปครับ ลดได้ไหม?", romanized: "Phaeng pai khráp lót dâi mǎi?", english: "Too expensive, can you discount?" } },
      { romanized: "Lót dâi mǎi?", script: "ลดได้ไหม?", english: "Can you discount?", example: { thai: "ซื้อสองอัน ลดได้ไหม?", romanized: "Séu sǎawng an lót dâi mǎi?", english: "Buy two, can you discount?" } },
      { romanized: "Séu", script: "ซื้อ", english: "To buy", example: { thai: "ซื้อของที่ตลาด", romanized: "Séu khǎawng thîi dtà-làat", english: "Buy things at the market" } },
      { romanized: "Khǎai", script: "ขาย", english: "To sell", example: { thai: "ร้านนี้ขายอะไร?", romanized: "Ráan níi khǎai à-rai?", english: "What does this shop sell?" } },
      { romanized: "Jàai-ngoen", script: "จ่ายเงิน", english: "To pay", example: { thai: "จ่ายเงินที่ไหน?", romanized: "Jàai-ngoen thîi-nǎi?", english: "Where do I pay?" } },
      { romanized: "Thawn", script: "ทอน", english: "Change (money)", example: { thai: "ทอนไม่ต้อง", romanized: "Thawn mâi dtâwng", english: "Keep the change" } },
      { romanized: "Bai-sèt", script: "ใบเสร็จ", english: "Receipt", example: { thai: "ขอใบเสร็จด้วย", romanized: "Khǎaw bai-sèt dûay", english: "Receipt please" } },
      { romanized: "Proo-moo-chân", script: "โปรโมชั่น", english: "Promotion / sale", example: { thai: "มีโปรโมชั่นไหม?", romanized: "Mii proo-moo-chân mǎi?", english: "Is there a promotion?" } },
      { romanized: "Frii", script: "ฟรี", english: "Free", example: { thai: "น้ำฟรี", romanized: "Náam frii", english: "Water is free" } },
      { romanized: "Bàet-tòe-rîi", script: "แบตเตอรี่", english: "Battery", example: { thai: "แบตโทรศัพท์หมด", romanized: "Bàet thoo-rá-sàp mòt", english: "Phone battery is dead" } }
    ]
  },

  // ─── 22. Health & Emergencies (Situation) ───
  {
    id: "health-emergencies", emoji: "🏥", label: "Health & Emergencies", type: "situation",
    pairs: [
      { romanized: "Jèp", script: "เจ็บ", english: "Hurt / painful", example: { thai: "เจ็บตรงนี้", romanized: "Jèp trong níi", english: "It hurts here" } },
      { romanized: "Jèp thîi-nǎi?", script: "เจ็บที่ไหน?", english: "Where does it hurt?", example: { thai: "เจ็บที่ไหนบอกหมอ", romanized: "Jèp thîi-nǎi bàwk mǎw", english: "Tell the doctor where it hurts" } },
      { romanized: "Pùat", script: "ปวด", english: "Ache / pain (dull)", example: { thai: "ปวดมาก", romanized: "Pùat mâak", english: "It aches a lot" } },
      { romanized: "Pùat-hǔa", script: "ปวดหัว", english: "Headache", example: { thai: "ปวดหัวมากเลย", romanized: "Pùat-hǔa mâak loei", english: "Bad headache" } },
      { romanized: "Pùat-tháwng", script: "ปวดท้อง", english: "Stomachache", example: { thai: "ปวดท้องตั้งแต่เช้า", romanized: "Pùat-tháwng dtâng-dtàe cháo", english: "Stomachache since morning" } },
      { romanized: "Mâi sà-baai", script: "ไม่สบาย", english: "Sick / unwell", example: { thai: "ไม่สบาย ต้องพักผ่อน", romanized: "Mâi sà-baai dtâwng phák-phàwn", english: "Sick, need to rest" } },
      { romanized: "Roong-phá-yaa-baan", script: "โรงพยาบาล", english: "Hospital", example: { thai: "โรงพยาบาลอยู่ที่ไหน?", romanized: "Roong-phá-yaa-baan yùu thîi-nǎi?", english: "Where is the hospital?" } },
      { romanized: "Mǎw", script: "หมอ", english: "Doctor", example: { thai: "ต้องไปหาหมอ", romanized: "Dtâwng pai hǎa mǎw", english: "Need to see a doctor" } },
      { romanized: "Yaa", script: "ยา", english: "Medicine", example: { thai: "กินยาแล้วหรือยัง?", romanized: "Gin yaa láew rěu yang?", english: "Have you taken medicine?" } },
      { romanized: "Chûay dûay!", script: "ช่วยด้วย!", english: "Help!", example: { thai: "ช่วยด้วย! เรียกหมอ!", romanized: "Chûay dûay! Rîak mǎw!", english: "Help! Call a doctor!" } },
      { romanized: "Thoo-rá-sàp", script: "โทรศัพท์", english: "Phone", example: { thai: "โทรศัพท์หายแล้ว", romanized: "Thoo-rá-sàp hǎai láew", english: "Phone is lost" } },
      { romanized: "Rîak rót-phá-yaa-baan", script: "เรียกรถพยาบาล", english: "Call an ambulance", example: { thai: "เรียกรถพยาบาลเร็ว!", romanized: "Rîak rót-phá-yaa-baan reo!", english: "Call an ambulance quickly!" } }
    ]
  },

  // ─── 23. Ordering Food (Situation) ───
  {
    id: "ordering-food", emoji: "🍜", label: "Ordering Food", type: "situation",
    pairs: [
      { romanized: "Khǎaw...", script: "ขอ...", english: "I'd like... / Can I have...", example: { thai: "ขอเมนูหน่อยครับ", romanized: "Khǎaw mee-nuu nòi khráp", english: "Can I have the menu?" } },
      { romanized: "À-rai dii?", script: "อะไรดี?", english: "What's good?", example: { thai: "ร้านนี้อะไรดี?", romanized: "Ráan níi à-rai dii?", english: "What's good here?" } },
      { romanized: "Phèt nít-nòi", script: "เผ็ดนิดหน่อย", english: "A little spicy", example: { thai: "ขอเผ็ดนิดหน่อย", romanized: "Khǎaw phèt nít-nòi", english: "A little spicy please" } },
      { romanized: "Mâi phèt", script: "ไม่เผ็ด", english: "Not spicy", example: { thai: "ขอไม่เผ็ดครับ", romanized: "Khǎaw mâi phèt khráp", english: "Not spicy please" } },
      { romanized: "À-ròi mâak", script: "อร่อยมาก", english: "Very delicious", example: { thai: "อาหารอร่อยมากเลย", romanized: "Aa-hǎan à-ròi mâak loei", english: "The food is really delicious" } },
      { romanized: "Gèp dtang dûay", script: "เก็บตังด้วย", english: "Bill please", example: { thai: "เก็บตังด้วยครับ", romanized: "Gèp dtang dûay khráp", english: "Bill please (male)" } },
      { romanized: "Tâo-rai?", script: "เท่าไร?", english: "How much?", example: { thai: "ทั้งหมดเท่าไร?", romanized: "Tháng-mòt tâo-rai?", english: "How much total?" } },
      { romanized: "Mâi sài phàk", script: "ไม่ใส่ผัก", english: "No vegetables", example: { thai: "ขอไม่ใส่ผักครับ", romanized: "Khǎaw mâi sài phàk khráp", english: "No vegetables please" } }
    ]
  },

  // ─── 24. Getting Around (Situation) ───
  {
    id: "getting-around", emoji: "🛺", label: "Getting Around", type: "situation",
    pairs: [
      { romanized: "Pai...dâi mǎi?", script: "ไป...ได้ไหม?", english: "Can you take me to...?", example: { thai: "ไปสยามได้ไหม?", romanized: "Pai Sà-yǎam dâi mǎi?", english: "Can you take me to Siam?" } },
      { romanized: "Yùt thîi-nîi", script: "หยุดที่นี่", english: "Stop here", example: { thai: "หยุดที่นี่ครับ", romanized: "Yùt thîi-nîi khráp", english: "Stop here please" } },
      { romanized: "Glai tâo-rai?", script: "ไกลเท่าไร?", english: "How far?", example: { thai: "จากที่นี่ไกลเท่าไร?", romanized: "Jàak thîi-nîi glai tâo-rai?", english: "How far from here?" } },
      { romanized: "Tháek-sîi", script: "แท็กซี่", english: "Taxi", example: { thai: "เรียกแท็กซี่หน่อย", romanized: "Rîak tháek-sîi nòi", english: "Call a taxi please" } },
      { romanized: "Rót-dtúk-dtúk", script: "รถตุ๊กตุ๊ก", english: "Tuk-tuk", example: { thai: "นั่งตุ๊กตุ๊กสนุก", romanized: "Nâng dtúk-dtúk sà-nùk", english: "Riding a tuk-tuk is fun" } },
      { romanized: "Rót-fai-fáa", script: "รถไฟฟ้า", english: "BTS Skytrain", example: { thai: "นั่งรถไฟฟ้าเร็วกว่า", romanized: "Nâng rót-fai-fáa reo gwàa", english: "Taking the BTS is faster" } },
      { romanized: "Soi", script: "ซอย", english: "Side street / alley", example: { thai: "ร้านอยู่ซอยสาม", romanized: "Ráan yùu soi sǎam", english: "The shop is on Soi 3" } },
      { romanized: "Trong-pai", script: "ตรงไป", english: "Go straight", example: { thai: "ตรงไปแล้วเลี้ยวซ้าย", romanized: "Trong-pai láew líeo-sáai", english: "Go straight then turn left" } }
    ]
  },

  // ─── 25. 7-Eleven (Situation) ───
  {
    id: "seven-eleven", emoji: "🏪", label: "7-Eleven", type: "situation",
    pairs: [
      { romanized: "Mii...mǎi?", script: "มี...ไหม?", english: "Do you have...?", example: { thai: "มีน้ำเปล่าไหม?", romanized: "Mii náam bplào mǎi?", english: "Do you have water?" } },
      { romanized: "Bai-sèt", script: "ใบเสร็จ", english: "Receipt", example: { thai: "ไม่ต้องใบเสร็จ", romanized: "Mâi dtâwng bai-sèt", english: "No receipt needed" } },
      { romanized: "Thǔng", script: "ถุง", english: "Bag", example: { thai: "ไม่ต้องถุง", romanized: "Mâi dtâwng thǔng", english: "No bag needed" } },
      { romanized: "Raa-khaa?", script: "ราคา?", english: "Price?", example: { thai: "อันนี้ราคาเท่าไร?", romanized: "An níi raa-khaa tâo-rai?", english: "What's the price?" } },
      { romanized: "Seh-wen", script: "เซเว่น", english: "7-Eleven", example: { thai: "เซเว่นอยู่ใกล้", romanized: "Seh-wen yùu glâi", english: "7-Eleven is nearby" } },
      { romanized: "Châat bàet", script: "ชาร์จแบต", english: "Charge battery", example: { thai: "ชาร์จแบตได้ไหม?", romanized: "Châat bàet dâi mǎi?", english: "Can I charge my phone?" } },
      { romanized: "Jàai-ngoen", script: "จ่ายเงิน", english: "Pay", example: { thai: "จ่ายเงินตรงนี้ครับ", romanized: "Jàai-ngoen trong níi khráp", english: "Pay here please" } },
      { romanized: "Ráp", script: "รับ", english: "Receive / I'll take it", example: { thai: "รับอันนี้ค่ะ", romanized: "Ráp an níi khâ", english: "I'll take this one (female)" } }
    ]
  },

  // ─── 26. Pattern: My Name Is... (Tier 1 — Foundational) ───
  {
    id: "pronoun-name", emoji: "🪪", label: "My Name Is...", type: "pattern",
    frame: {
      romanized: "phǒm / chǎn chêu ___",
      script: "ผม / ฉัน ชื่อ ___",
      english: "My name is ___",
      explanation: "Use ผม (phǒm) if you're male, ฉัน (chǎn) if you're female. ชื่อ (chêu) literally means 'is named' — there's no separate word for 'is'."
    },
    pairs: [
      // TODO: verify with native speaker — Western name transliterations are approximations
      { romanized: "Phǒm chêu Jawn", script: "ผมชื่อจอห์น", english: "My name is John",
        slottable: [
          { romanized: "phǒm", script: "ผม", english: "I (male)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Jawn", script: "จอห์น", english: "John" }
        ],
        slot: { romanized: "phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "สวัสดีครับ ผมชื่อจอห์น", romanized: "Sà-wàt-dii khráp, phǒm chêu Jawn", english: "Hello, my name is John" }, note: "Male speaker — uses ผม (phǒm)" },
      // TODO: verify with native speaker — เดวิด tone marks
      { romanized: "Phǒm chêu Dee-wít", script: "ผมชื่อเดวิด", english: "My name is David",
        slottable: [
          { romanized: "phǒm", script: "ผม", english: "I (male)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Dee-wít", script: "เดวิด", english: "David" }
        ],
        slot: { romanized: "phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "ผมชื่อเดวิด ยินดีที่ได้รู้จัก", romanized: "Phǒm chêu Dee-wít, yin-dii thîi dâi rúu-jàk", english: "My name is David, nice to meet you" }, note: "Male speaker — uses ผม (phǒm)" },
      { romanized: "Phǒm chêu Thawm", script: "ผมชื่อทอม", english: "My name is Tom",
        slottable: [
          { romanized: "phǒm", script: "ผม", english: "I (male)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Thawm", script: "ทอม", english: "Tom" }
        ],
        slot: { romanized: "phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "ผมชื่อทอมครับ", romanized: "Phǒm chêu Thawm khráp", english: "My name is Tom" }, note: "Male speaker — uses ผม (phǒm)" },
      { romanized: "Phǒm chêu Dtôn", script: "ผมชื่อต้น", english: "My name is Ton",
        slottable: [
          { romanized: "phǒm", script: "ผม", english: "I (male)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Dtôn", script: "ต้น", english: "Ton (nickname)" }
        ],
        slot: { romanized: "phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "ผมชื่อต้น เป็นคนไทยครับ", romanized: "Phǒm chêu Dtôn, pen khon Thai khráp", english: "My name is Ton, I'm Thai" }, note: "Male speaker — ต้น is a common Thai male nickname meaning 'tree/beginning'" },
      { romanized: "Phǒm chêu Lék", script: "ผมชื่อเล็ก", english: "My name is Lek",
        slottable: [
          { romanized: "phǒm", script: "ผม", english: "I (male)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Lék", script: "เล็ก", english: "Lek (nickname)" }
        ],
        slot: { romanized: "phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "ผมชื่อเล็กครับ", romanized: "Phǒm chêu Lék khráp", english: "My name is Lek" }, note: "Male speaker — เล็ก means 'small', a very common Thai nickname" },
      // TODO: verify with native speaker — ซาร่า tone marks
      { romanized: "Chǎn chêu Saa-râa", script: "ฉันชื่อซาร่า", english: "My name is Sarah",
        slottable: [
          { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Saa-râa", script: "ซาร่า", english: "Sarah" }
        ],
        slot: { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "ฉันชื่อซาร่า มาจากอเมริกา", romanized: "Chǎn chêu Saa-râa, maa jàak A-mee-rí-gaa", english: "My name is Sarah, I'm from America" }, note: "Female speaker — uses ฉัน (chǎn)" },
      // TODO: verify with native speaker — เอ็มม่า tone marks
      { romanized: "Chǎn chêu Em-mâa", script: "ฉันชื่อเอ็มม่า", english: "My name is Emma",
        slottable: [
          { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Em-mâa", script: "เอ็มม่า", english: "Emma" }
        ],
        slot: { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "สวัสดีค่ะ ฉันชื่อเอ็มม่า", romanized: "Sà-wàt-dii khâ, chǎn chêu Em-mâa", english: "Hello, my name is Emma" }, note: "Female speaker — uses ฉัน (chǎn)" },
      // TODO: verify with native speaker — แอนน่า tone marks
      { romanized: "Chǎn chêu Aen-nâa", script: "ฉันชื่อแอนน่า", english: "My name is Anna",
        slottable: [
          { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Aen-nâa", script: "แอนน่า", english: "Anna" }
        ],
        slot: { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "ฉันชื่อแอนน่าค่ะ", romanized: "Chǎn chêu Aen-nâa khâ", english: "My name is Anna" }, note: "Female speaker — uses ฉัน (chǎn)" },
      { romanized: "Chǎn chêu Phloi", script: "ฉันชื่อพลอย", english: "My name is Ploy",
        slottable: [
          { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Phloi", script: "พลอย", english: "Ploy (nickname)" }
        ],
        slot: { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "ฉันชื่อพลอย เป็นคนกรุงเทพ", romanized: "Chǎn chêu Phloi, pen khon Grung-thêep", english: "My name is Ploy, I'm from Bangkok" }, note: "Female speaker — พลอย means 'gemstone', a very popular Thai female nickname" },
      { romanized: "Chǎn chêu Má-lí", script: "ฉันชื่อมะลิ", english: "My name is Mali",
        slottable: [
          { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "Má-lí", script: "มะลิ", english: "Mali (nickname)" }
        ],
        slot: { romanized: "chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "ฉันชื่อมะลิค่ะ", romanized: "Chǎn chêu Má-lí khâ", english: "My name is Mali" }, note: "Female speaker — มะลิ means 'jasmine flower', a classic Thai female name" }
    ]
  },

  // ─── 27. Pattern: X is Y (Tier 1 — Foundational) ───
  {
    id: "simple-statement", emoji: "📋", label: "X is Y", type: "pattern",
    frame: {
      romanized: "[noun] + ___",
      script: "[noun] + ___",
      english: "[noun] is [adjective]",
      explanation: "Thai has NO word for 'is/am/are' when describing things. Just place the noun first, then the adjective — that's the whole sentence."
    },
    pairs: [
      { romanized: "Aa-hǎan à-ròi", script: "อาหารอร่อย", english: "The food is delicious",
        slottable: [
          { romanized: "Aa-hǎan", script: "อาหาร", english: "food" },
          { romanized: "à-ròi", script: "อร่อย", english: "delicious" }
        ],
        slot: { romanized: "Aa-hǎan", script: "อาหาร", english: "food" },
        example: { thai: "อาหารร้านนี้อร่อยมาก", romanized: "Aa-hǎan ráan níi à-ròi mâak", english: "The food at this restaurant is very delicious" } },
      { romanized: "Aa-gàat rón", script: "อากาศร้อน", english: "The weather is hot",
        slottable: [
          { romanized: "Aa-gàat", script: "อากาศ", english: "weather" },
          { romanized: "rón", script: "ร้อน", english: "hot" }
        ],
        slot: { romanized: "Aa-gàat", script: "อากาศ", english: "weather" },
        example: { thai: "วันนี้อากาศร้อนมาก", romanized: "Wan níi aa-gàat rón mâak", english: "Today the weather is very hot" }, note: "One of the most common sentences you'll hear in Bangkok" },
      { romanized: "Náam yen", script: "น้ำเย็น", english: "The water is cold",
        slottable: [
          { romanized: "Náam", script: "น้ำ", english: "water" },
          { romanized: "yen", script: "เย็น", english: "cold (to the touch)" }
        ],
        slot: { romanized: "Náam", script: "น้ำ", english: "water" },
        example: { thai: "ขอน้ำเย็นหน่อยครับ", romanized: "Khǎw náam yen nòi khráp", english: "Cold water please" } },
      { romanized: "Khon yóe", script: "คนเยอะ", english: "There are lots of people / It's crowded",
        slottable: [
          { romanized: "Khon", script: "คน", english: "people" },
          { romanized: "yóe", script: "เยอะ", english: "many / a lot" }
        ],
        slot: { romanized: "Khon", script: "คน", english: "people" },
        example: { thai: "วันเสาร์คนเยอะมาก", romanized: "Wan Sǎo khon yóe mâak", english: "On Saturday it's very crowded" } },
      { romanized: "Rót tìt", script: "รถติด", english: "The traffic is jammed",
        slottable: [
          { romanized: "Rót", script: "รถ", english: "car / traffic" },
          { romanized: "tìt", script: "ติด", english: "stuck / jammed" }
        ],
        slot: { romanized: "Rót", script: "รถ", english: "car / traffic" },
        example: { thai: "ตอนเย็นรถติดมาก", romanized: "Dtawn yen rót tìt mâak", english: "In the evening the traffic is terrible" }, note: "Essential Bangkok phrase — you'll say this daily" },
      { romanized: "Phǒm nùeai", script: "ผมเหนื่อย", english: "I'm tired",
        slottable: [
          { romanized: "Phǒm", script: "ผม", english: "I (male)" },
          { romanized: "nùeai", script: "เหนื่อย", english: "tired" }
        ],
        slot: { romanized: "Phǒm", script: "ผม", english: "I (male)" },
        example: { thai: "วันนี้ผมเหนื่อยมาก", romanized: "Wan níi phǒm nùeai mâak", english: "Today I'm very tired" }, note: "Male speaker — female would say 'chǎn nùeai'" },
      { romanized: "Chǎn hǐw", script: "ฉันหิว", english: "I'm hungry",
        slottable: [
          { romanized: "Chǎn", script: "ฉัน", english: "I (female)" },
          { romanized: "hǐw", script: "หิว", english: "hungry" }
        ],
        slot: { romanized: "Chǎn", script: "ฉัน", english: "I (female)" },
        example: { thai: "ฉันหิว ไปกินข้าวกัน", romanized: "Chǎn hǐw, pai gin khâao gan", english: "I'm hungry, let's go eat" }, note: "Female speaker — male would say 'phǒm hǐw'" },
      { romanized: "Bâan yài", script: "บ้านใหญ่", english: "The house is big",
        slottable: [
          { romanized: "Bâan", script: "บ้าน", english: "house" },
          { romanized: "yài", script: "ใหญ่", english: "big" }
        ],
        slot: { romanized: "Bâan", script: "บ้าน", english: "house" },
        example: { thai: "บ้านเขาใหญ่มาก", romanized: "Bâan khǎo yài mâak", english: "His/her house is very big" } },
      { romanized: "Wan-níi sanùk", script: "วันนี้สนุก", english: "Today is fun",
        slottable: [
          { romanized: "Wan-níi", script: "วันนี้", english: "today" },
          { romanized: "sanùk", script: "สนุก", english: "fun / enjoyable" }
        ],
        slot: { romanized: "Wan-níi", script: "วันนี้", english: "today" },
        example: { thai: "วันนี้สนุกมาก", romanized: "Wan-níi sanùk mâak", english: "Today was very fun" }, note: "สนุก (sanùk) is central to Thai culture — fun/enjoyment is valued in work, travel, and daily life" },
      { romanized: "Ngaan yûng", script: "งานยุ่ง", english: "Work is busy",
        slottable: [
          { romanized: "Ngaan", script: "งาน", english: "work" },
          { romanized: "yûng", script: "ยุ่ง", english: "busy" }
        ],
        slot: { romanized: "Ngaan", script: "งาน", english: "work" },
        example: { thai: "อาทิตย์นี้งานยุ่งมาก", romanized: "Aa-thít níi ngaan yûng mâak", english: "This week work is very busy" } }
    ]
  },

  // ─── 28. Pattern: Not [X] (Tier 1 — Foundational) ───
  {
    id: "negation", emoji: "🚫", label: "Not [X]", type: "pattern",
    frame: {
      romanized: "mâi ___",
      script: "ไม่ ___",
      english: "not ___",
      explanation: "Put ไม่ (mâi) directly before any verb or adjective to negate it. This is the #1 most common negation in Thai."
    },
    pairs: [
      { romanized: "Mâi phèt", script: "ไม่เผ็ด", english: "Not spicy",
        slottable: [{ romanized: "phèt", script: "เผ็ด", english: "spicy" }],
        slot: { romanized: "phèt", script: "เผ็ด", english: "spicy" },
        example: { thai: "ขอไม่เผ็ดครับ", romanized: "Khǎw mâi phèt khráp", english: "Not spicy please" }, note: "Essential at any Thai restaurant if you can't handle heat" },
      { romanized: "Mâi ao", script: "ไม่เอา", english: "Don't want / No thanks",
        slottable: [{ romanized: "ao", script: "เอา", english: "want / take" }],
        slot: { romanized: "ao", script: "เอา", english: "want / take" },
        example: { thai: "ไม่เอาถุงครับ", romanized: "Mâi ao thǔng khráp", english: "I don't need a bag" } },
      { romanized: "Mâi rúu", script: "ไม่รู้", english: "Don't know",
        slottable: [{ romanized: "rúu", script: "รู้", english: "know (information)" }],
        slot: { romanized: "rúu", script: "รู้", english: "know (information)" },
        example: { thai: "ไม่รู้เหมือนกัน", romanized: "Mâi rúu mǔean-gan", english: "I don't know either" } },
      { romanized: "Mâi khâo-jai", script: "ไม่เข้าใจ", english: "Don't understand",
        slottable: [{ romanized: "khâo-jai", script: "เข้าใจ", english: "understand" }],
        slot: { romanized: "khâo-jai", script: "เข้าใจ", english: "understand" },
        example: { thai: "ขอโทษครับ ไม่เข้าใจ", romanized: "Khǎw thôot khráp, mâi khâo-jai", english: "Sorry, I don't understand" } },
      { romanized: "Mâi chôp", script: "ไม่ชอบ", english: "Don't like",
        slottable: [{ romanized: "chôp", script: "ชอบ", english: "like" }],
        slot: { romanized: "chôp", script: "ชอบ", english: "like" },
        example: { thai: "ฉันไม่ชอบผักชี", romanized: "Chǎn mâi chôp phàk-chii", english: "I don't like cilantro" } },
      { romanized: "Mâi sà-baai", script: "ไม่สบาย", english: "Not feeling well / sick",
        slottable: [{ romanized: "sà-baai", script: "สบาย", english: "well / comfortable" }],
        slot: { romanized: "sà-baai", script: "สบาย", english: "well / comfortable" },
        example: { thai: "วันนี้ผมไม่สบาย", romanized: "Wan níi phǒm mâi sà-baai", english: "Today I'm not feeling well" } },
      { romanized: "Mâi mii", script: "ไม่มี", english: "Don't have / there isn't",
        slottable: [{ romanized: "mii", script: "มี", english: "have / there is" }],
        slot: { romanized: "mii", script: "มี", english: "have / there is" },
        example: { thai: "ขอโทษ ไม่มีครับ", romanized: "Khǎw thôot, mâi mii khráp", english: "Sorry, we don't have any" } },
      { romanized: "Mâi wâang", script: "ไม่ว่าง", english: "Not free / busy",
        slottable: [{ romanized: "wâang", script: "ว่าง", english: "free / available" }],
        slot: { romanized: "wâang", script: "ว่าง", english: "free / available" },
        example: { thai: "พรุ่งนี้ผมไม่ว่าง", romanized: "Phrûng níi phǒm mâi wâang", english: "Tomorrow I'm not free" } },
      { romanized: "Mâi dâi", script: "ไม่ได้", english: "Cannot / didn't",
        slottable: [{ romanized: "dâi", script: "ได้", english: "can / able to" }],
        slot: { romanized: "dâi", script: "ได้", english: "can / able to" },
        example: { thai: "ขอโทษครับ ไม่ได้", romanized: "Khǎw thôot khráp, mâi dâi", english: "Sorry, that's not possible" } },
      { romanized: "Mâi châi", script: "ไม่ใช่", english: "No / that's not it",
        slottable: [{ romanized: "châi", script: "ใช่", english: "yes / correct" }],
        slot: { romanized: "châi", script: "ใช่", english: "yes / correct" },
        example: { thai: "ไม่ใช่ครับ อันนั้น", romanized: "Mâi châi khráp, an nán", english: "No, that one over there" } }
    ]
  },

  // ─── 29. Pattern: Yes/No Question (Tier 1 — Foundational) ───
  {
    id: "yes-no-question", emoji: "❓", label: "Yes/No Question", type: "pattern",
    frame: {
      romanized: "___ mǎi?",
      script: "___ ไหม?",
      english: "Is/Are/Do ___?",
      explanation: "To turn any statement into a yes/no question, just tack ไหม (mǎi) onto the end. No word order changes."
    },
    pairs: [
      { romanized: "Ao mǎi?", script: "เอาไหม?", english: "Do you want it?",
        slottable: [{ romanized: "ao", script: "เอา", english: "want / take" }],
        slot: { romanized: "ao", script: "เอา", english: "want / take" },
        example: { thai: "ถุงเอาไหมคะ?", romanized: "Thǔng ao mǎi khá?", english: "Do you want a bag?" }, note: "You'll hear this at every 7-Eleven" },
      { romanized: "Phèt mǎi?", script: "เผ็ดไหม?", english: "Is it spicy?",
        slottable: [{ romanized: "phèt", script: "เผ็ด", english: "spicy" }],
        slot: { romanized: "phèt", script: "เผ็ด", english: "spicy" },
        example: { thai: "อาหารนี้เผ็ดไหม?", romanized: "Aa-hǎan níi phèt mǎi?", english: "Is this food spicy?" } },
      { romanized: "À-ròi mǎi?", script: "อร่อยไหม?", english: "Is it delicious?",
        slottable: [{ romanized: "à-ròi", script: "อร่อย", english: "delicious" }],
        slot: { romanized: "à-ròi", script: "อร่อย", english: "delicious" },
        example: { thai: "ร้านนี้อร่อยไหม?", romanized: "Ráan níi à-ròi mǎi?", english: "Is this restaurant good?" } },
      { romanized: "Sà-baai-dii mǎi?", script: "สบายดีไหม?", english: "Are you well? / How are you?",
        slottable: [{ romanized: "sà-baai-dii", script: "สบายดี", english: "well / fine" }],
        slot: { romanized: "sà-baai-dii", script: "สบายดี", english: "well / fine" },
        example: { thai: "คุณสบายดีไหม?", romanized: "Khun sà-baai-dii mǎi?", english: "How are you?" }, note: "Standard Thai greeting after 'hello'" },
      { romanized: "Chôp mǎi?", script: "ชอบไหม?", english: "Do you like it?",
        slottable: [{ romanized: "chôp", script: "ชอบ", english: "like" }],
        slot: { romanized: "chôp", script: "ชอบ", english: "like" },
        example: { thai: "ชอบเมืองไทยไหม?", romanized: "Chôp meuang Thai mǎi?", english: "Do you like Thailand?" } },
      { romanized: "Khâo-jai mǎi?", script: "เข้าใจไหม?", english: "Do you understand?",
        slottable: [{ romanized: "khâo-jai", script: "เข้าใจ", english: "understand" }],
        slot: { romanized: "khâo-jai", script: "เข้าใจ", english: "understand" },
        example: { thai: "ที่ผมพูดเข้าใจไหม?", romanized: "Thîi phǒm phûut khâo-jai mǎi?", english: "Do you understand what I'm saying?" } },
      { romanized: "Pai mǎi?", script: "ไปไหม?", english: "Are you going? / Want to go?",
        slottable: [{ romanized: "pai", script: "ไป", english: "go" }],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "ไปกินข้าวด้วยกันไหม?", romanized: "Pai gin khâao dûay-gan mǎi?", english: "Want to go eat together?" } },
      { romanized: "Mii mǎi?", script: "มีไหม?", english: "Do you have it?",
        slottable: [{ romanized: "mii", script: "มี", english: "have / there is" }],
        slot: { romanized: "mii", script: "มี", english: "have / there is" },
        example: { thai: "มีน้ำเปล่าไหม?", romanized: "Mii náam bplào mǎi?", english: "Do you have water?" } },
      { romanized: "Dâi mǎi?", script: "ได้ไหม?", english: "Can you? / Is it OK?",
        slottable: [{ romanized: "dâi", script: "ได้", english: "can / able to" }],
        slot: { romanized: "dâi", script: "ได้", english: "can / able to" },
        example: { thai: "ลดราคาได้ไหม?", romanized: "Lót raa-khaa dâi mǎi?", english: "Can you lower the price?" } },
      { romanized: "Nùeai mǎi?", script: "เหนื่อยไหม?", english: "Are you tired?",
        slottable: [{ romanized: "nùeai", script: "เหนื่อย", english: "tired" }],
        slot: { romanized: "nùeai", script: "เหนื่อย", english: "tired" },
        example: { thai: "เดินเยอะเหนื่อยไหม?", romanized: "Dern yóe nùeai mǎi?", english: "Walked a lot — are you tired?" } }
    ]
  },

  // ─── 30. Pattern: Question Words at End (Tier 1 — Foundational) ───
  {
    id: "question-word-end", emoji: "🔚", label: "Question Words at End", type: "pattern",
    frame: {
      romanized: "[statement] ___",
      script: "[statement] ___",
      english: "[Question word] [statement]?",
      explanation: "Thai puts question words (where, what, who, when, why, how) at the END of sentences, not the beginning. The statement stays in normal order."
    },
    pairs: [
      { romanized: "Khun chêu à-rai?", script: "คุณชื่ออะไร?", english: "What is your name?",
        slottable: [
          { romanized: "khun", script: "คุณ", english: "you" },
          { romanized: "chêu", script: "ชื่อ", english: "am named" },
          { romanized: "à-rai", script: "อะไร", english: "what" }
        ],
        slot: { romanized: "khun", script: "คุณ", english: "you" },
        example: { thai: "สวัสดีครับ คุณชื่ออะไร?", romanized: "Sà-wàt-dii khráp, khun chêu à-rai?", english: "Hello, what's your name?" } },
      { romanized: "Pai nǎi?", script: "ไปไหน?", english: "Where are you going?",
        slottable: [
          { romanized: "pai", script: "ไป", english: "go" },
          { romanized: "nǎi", script: "ไหน", english: "where" }
        ],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "วันนี้จะไปไหน?", romanized: "Wan níi jà pai nǎi?", english: "Where are you going today?" }, note: "Also used as a casual greeting, like 'what's up?'" },
      { romanized: "Raa-khaa tâo-rai?", script: "ราคาเท่าไร?", english: "How much does it cost?",
        slottable: [
          { romanized: "raa-khaa", script: "ราคา", english: "price" },
          { romanized: "tâo-rai", script: "เท่าไร", english: "how much" }
        ],
        slot: { romanized: "raa-khaa", script: "ราคา", english: "price" },
        example: { thai: "อันนี้ราคาเท่าไร?", romanized: "An níi raa-khaa tâo-rai?", english: "How much is this one?" } },
      { romanized: "Nîi khrai?", script: "นี่ใคร?", english: "Who is this?",
        slottable: [
          { romanized: "nîi", script: "นี่", english: "this (person/thing)" },
          { romanized: "khrai", script: "ใคร", english: "who" }
        ],
        slot: { romanized: "nîi", script: "นี่", english: "this (person/thing)" },
        example: { thai: "ในรูปนี่ใคร?", romanized: "Nai rûup nîi khrai?", english: "Who is this in the photo?" } },
      { romanized: "Maa mêua-rài?", script: "มาเมื่อไร?", english: "When did you come?",
        slottable: [
          { romanized: "maa", script: "มา", english: "come" },
          { romanized: "mêua-rài", script: "เมื่อไร", english: "when" }
        ],
        slot: { romanized: "maa", script: "มา", english: "come" },
        example: { thai: "คุณมาเมืองไทยเมื่อไร?", romanized: "Khun maa meuang Thai mêua-rài?", english: "When did you come to Thailand?" } },
      { romanized: "Pai yang-ngai?", script: "ไปยังไง?", english: "How do you get there?",
        slottable: [
          { romanized: "pai", script: "ไป", english: "go" },
          { romanized: "yang-ngai", script: "ยังไง", english: "how" }
        ],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "ไปสยามยังไง?", romanized: "Pai Sà-yǎam yang-ngai?", english: "How do I get to Siam?" }, note: "ยังไง is the casual/spoken form of อย่างไร" },
      { romanized: "Hông-náam yùu thîi-nǎi?", script: "ห้องน้ำอยู่ที่ไหน?", english: "Where is the bathroom?",
        slottable: [
          { romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" },
          { romanized: "yùu", script: "อยู่", english: "is located at" },
          { romanized: "thîi-nǎi", script: "ที่ไหน", english: "where (location)" }
        ],
        slot: { romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" },
        example: { thai: "ขอโทษ ห้องน้ำอยู่ที่ไหน?", romanized: "Khǎw thôot, hông-náam yùu thîi-nǎi?", english: "Excuse me, where is the bathroom?" }, note: "ที่ไหน = 'at where'; ไหน alone also works" },
      { romanized: "Aa-yú tâo-rai?", script: "อายุเท่าไร?", english: "How old are you?",
        slottable: [
          { romanized: "aa-yú", script: "อายุ", english: "age" },
          { romanized: "tâo-rai", script: "เท่าไร", english: "how much / how many" }
        ],
        slot: { romanized: "aa-yú", script: "อายุ", english: "age" },
        example: { thai: "คุณอายุเท่าไร?", romanized: "Khun aa-yú tâo-rai?", english: "How old are you?" } },
      { romanized: "Mâi maa tham-mai?", script: "ไม่มาทำไม?", english: "Why didn't you come?",
        slottable: [
          { romanized: "maa", script: "มา", english: "come" },
          { romanized: "tham-mai", script: "ทำไม", english: "why" }
        ],
        slot: { romanized: "maa", script: "มา", english: "come" },
        example: { thai: "เมื่อวานไม่มาทำไม?", romanized: "Mêua-waan mâi maa tham-mai?", english: "Why didn't you come yesterday?" } },
      { romanized: "Gin à-rai?", script: "กินอะไร?", english: "What are you eating?",
        slottable: [
          { romanized: "gin", script: "กิน", english: "eat" },
          { romanized: "à-rai", script: "อะไร", english: "what" }
        ],
        slot: { romanized: "gin", script: "กิน", english: "eat" },
        example: { thai: "วันนี้กินอะไรดี?", romanized: "Wan níi gin à-rai dii?", english: "What should we eat today?" } }
    ]
  }
];
