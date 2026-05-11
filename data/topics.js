/**
 * All topics — 50 topics, 533 pairs.
 * Every pair: romanized (with tone diacritics), script, english, example.
 * Tone diacritics: à low, â falling, á high, ǎ rising, unmarked/ā mid.
 *
 * Topic types (the `type` field):
 *   - "vocabulary" — standard word/phrase packs (default)
 *   - "situation"  — phrase packs tied to a real-world situation
 *                     (Ordering Food, Getting Around, 7-Eleven, etc.)
 *   - "pattern"    — frame/template topics for Pattern Practice mode.
 *                     Pattern markers stay constant; only useful variables are slottable.
 *
 * Pattern topic shape (for reference):
 *
 *   {
 *     id: "ask-location",
 *     label: "Ask Where Something Is",
 *     emoji: "📍",
 *     type: "pattern",
 *
 *     // The sentence template with a blank slot.
 *     frame: {
 *       romanized: "___ yùu thîi-nǎi",
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
 *         romanized: "hông-náam yùu thîi-nǎi",
 *         script:    "ห้องน้ำอยู่ที่ไหน",
 *         english:   "Where is the bathroom?",
 *         slottable: [
 *           { romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" }
 *         ],
 *         slot: { romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" },
 *         example: {
 *           thai:      "ขอโทษ ห้องน้ำอยู่ที่ไหน",
 *           romanized: "khǎw-thôot, hông-náam yùu thîi-nǎi",
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
  },

  // ─── 31. Pattern: Where Is It? (Tier 2 — Survival) ───
  {
    id: "ask-location", emoji: "📍", label: "Where Is It?", type: "pattern",
    frame: {
      romanized: "___ yùu thîi-nǎi?",
      script: "___ อยู่ที่ไหน?",
      english: "Where is ___?",
      explanation: "Use this to ask the location of any place or thing. Put the noun before อยู่."
    },
    pairs: [
      { romanized: "Hông-náam yùu thîi-nǎi?", script: "ห้องน้ำอยู่ที่ไหน?", english: "Where is the bathroom?",
        slottable: [{ romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" }],
        slot: { romanized: "hông-náam", script: "ห้องน้ำ", english: "bathroom" },
        example: { thai: "ขอโทษครับ ห้องน้ำอยู่ที่ไหน?", romanized: "Khǎw-thôot khráp, hông-náam yùu thîi-nǎi?", english: "Excuse me, where is the bathroom?" } },
      { romanized: "Roong-raem yùu thîi-nǎi?", script: "โรงแรมอยู่ที่ไหน?", english: "Where is the hotel?",
        slottable: [{ romanized: "roong-raem", script: "โรงแรม", english: "hotel" }],
        slot: { romanized: "roong-raem", script: "โรงแรม", english: "hotel" },
        example: { thai: "โรงแรมนี้อยู่ที่ไหนครับ?", romanized: "Roong-raem níi yùu thîi-nǎi khráp?", english: "Where is this hotel?" } },
      { romanized: "Ráan-aa-hǎan yùu thîi-nǎi?", script: "ร้านอาหารอยู่ที่ไหน?", english: "Where is the restaurant?",
        slottable: [{ romanized: "ráan-aa-hǎan", script: "ร้านอาหาร", english: "restaurant" }],
        slot: { romanized: "ráan-aa-hǎan", script: "ร้านอาหาร", english: "restaurant" },
        example: { thai: "ร้านอาหารอร่อยอยู่ที่ไหน?", romanized: "Ráan-aa-hǎan à-ròi yùu thîi-nǎi?", english: "Where is a good restaurant?" } },
      { romanized: "Dtà-làat yùu thîi-nǎi?", script: "ตลาดอยู่ที่ไหน?", english: "Where is the market?",
        slottable: [{ romanized: "dtà-làat", script: "ตลาด", english: "market" }],
        slot: { romanized: "dtà-làat", script: "ตลาด", english: "market" },
        example: { thai: "ตลาดกลางคืนอยู่ที่ไหน?", romanized: "Dtà-làat-glaang-khuen yùu thîi-nǎi?", english: "Where is the night market?" } },
      { romanized: "Roong-phá-yaa-baan yùu thîi-nǎi?", script: "โรงพยาบาลอยู่ที่ไหน?", english: "Where is the hospital?",
        slottable: [{ romanized: "roong-phá-yaa-baan", script: "โรงพยาบาล", english: "hospital" }],
        slot: { romanized: "roong-phá-yaa-baan", script: "โรงพยาบาล", english: "hospital" },
        example: { thai: "โรงพยาบาลที่ใกล้ที่สุดอยู่ที่ไหน?", romanized: "Roong-phá-yaa-baan thîi glâi thîi-sùt yùu thîi-nǎi?", english: "Where is the nearest hospital?" } },
      { romanized: "Dtûu-ATM yùu thîi-nǎi?", script: "ตู้เอทีเอ็มอยู่ที่ไหน?", english: "Where is the ATM?",
        slottable: [{ romanized: "dtûu-ATM", script: "ตู้เอทีเอ็ม", english: "ATM" }],
        slot: { romanized: "dtûu-ATM", script: "ตู้เอทีเอ็ม", english: "ATM" },
        example: { thai: "ขอโทษค่ะ ตู้เอทีเอ็มอยู่ที่ไหน?", romanized: "Khǎw-thôot khâ, dtûu-ATM yùu thîi-nǎi?", english: "Excuse me, where is the ATM?" } },
      { romanized: "Sà-thǎa-nii-rót-fai yùu thîi-nǎi?", script: "สถานีรถไฟอยู่ที่ไหน?", english: "Where is the train station?",
        slottable: [{ romanized: "sà-thǎa-nii-rót-fai", script: "สถานีรถไฟ", english: "train station" }],
        slot: { romanized: "sà-thǎa-nii-rót-fai", script: "สถานีรถไฟ", english: "train station" },
        example: { thai: "สถานีรถไฟหัวลำโพงอยู่ที่ไหน?", romanized: "Sà-thǎa-nii-rót-fai Hǔa-lam-phoong yùu thîi-nǎi?", english: "Where is Hua Lamphong train station?" } },
      { romanized: "Jùt-khûn-tháek-sîi yùu thîi-nǎi?", script: "จุดขึ้นแท็กซี่อยู่ที่ไหน?", english: "Where is the taxi stand?",
        slottable: [{ romanized: "jùt-khûn-tháek-sîi", script: "จุดขึ้นแท็กซี่", english: "taxi stand" }],
        slot: { romanized: "jùt-khûn-tháek-sîi", script: "จุดขึ้นแท็กซี่", english: "taxi stand" },
        example: { thai: "จุดขึ้นแท็กซี่อยู่ที่ไหนครับ?", romanized: "Jùt-khûn-tháek-sîi yùu thîi-nǎi khráp?", english: "Where is the taxi stand?" } },
      { romanized: "Seh-wen yùu thîi-nǎi?", script: "เซเว่นอยู่ที่ไหน?", english: "Where is the 7-Eleven?",
        slottable: [{ romanized: "Seh-wen", script: "เซเว่น", english: "7-Eleven" }],
        slot: { romanized: "Seh-wen", script: "เซเว่น", english: "7-Eleven" },
        example: { thai: "แถวนี้เซเว่นอยู่ที่ไหน?", romanized: "Thǎeo-níi Seh-wen yùu thîi-nǎi?", english: "Where is the 7-Eleven around here?" } },
      { romanized: "Sà-thǎa-nii-BTS yùu thîi-nǎi?", script: "สถานีบีทีเอสอยู่ที่ไหน?", english: "Where is the BTS station?",
        slottable: [{ romanized: "sà-thǎa-nii-BTS", script: "สถานีบีทีเอส", english: "BTS station" }],
        slot: { romanized: "sà-thǎa-nii-BTS", script: "สถานีบีทีเอส", english: "BTS station" },
        example: { thai: "สถานีบีทีเอสที่ใกล้ที่สุดอยู่ที่ไหน?", romanized: "Sà-thǎa-nii-BTS thîi glâi thîi-sùt yùu thîi-nǎi?", english: "Where is the nearest BTS station?" } }
    ]
  },

  // ─── 32. Pattern: Can I Have...? (Tier 2 — Survival) ───
  {
    id: "ask-for", emoji: "🙏", label: "Can I Have...?", type: "pattern",
    frame: {
      romanized: "khǎw + ___",
      script: "ขอ + ___",
      english: "Can I have ___?",
      explanation: "Polite way to request anything. Just say ขอ (khǎw) followed by what you want."
    },
    pairs: [
      { romanized: "Khǎw náam", script: "ขอน้ำ", english: "Can I have water?",
        slottable: [{ romanized: "náam", script: "น้ำ", english: "water" }],
        slot: { romanized: "náam", script: "น้ำ", english: "water" },
        example: { thai: "ขอน้ำแก้วนึงครับ", romanized: "Khǎw náam gâew-nueng khráp", english: "Can I have one glass of water?" } },
      { romanized: "Khǎw mee-nuu", script: "ขอเมนู", english: "Can I have the menu?",
        slottable: [{ romanized: "mee-nuu", script: "เมนู", english: "menu" }],
        slot: { romanized: "mee-nuu", script: "เมนู", english: "menu" },
        example: { thai: "ขอเมนูหน่อยค่ะ", romanized: "Khǎw mee-nuu nòi khâ", english: "Can I have the menu please?" } },
      { romanized: "Khǎw chék-bin", script: "ขอเช็กบิล", english: "Can I have the bill?",
        slottable: [{ romanized: "chék-bin", script: "เช็กบิล", english: "bill" }],
        slot: { romanized: "chék-bin", script: "เช็กบิล", english: "bill" },
        example: { thai: "ขอเช็กบิลด้วยครับ", romanized: "Khǎw chék-bin dûay khráp", english: "Can I have the bill please?" } },
      { romanized: "Khǎw tít-chûu", script: "ขอทิชชู่", english: "Can I have a napkin?",
        slottable: [{ romanized: "tít-chûu", script: "ทิชชู่", english: "napkin / tissue" }],
        slot: { romanized: "tít-chûu", script: "ทิชชู่", english: "napkin / tissue" },
        example: { thai: "ขอทิชชู่เพิ่มหน่อยครับ", romanized: "Khǎw tít-chûu phôem nòi khráp", english: "Can I have more napkins please?" } },
      { romanized: "Khǎw náam-khǎeng", script: "ขอน้ำแข็ง", english: "Can I have ice?",
        slottable: [{ romanized: "náam-khǎeng", script: "น้ำแข็ง", english: "ice" }],
        slot: { romanized: "náam-khǎeng", script: "น้ำแข็ง", english: "ice" },
        example: { thai: "ขอน้ำแข็งหน่อยค่ะ", romanized: "Khǎw náam-khǎeng nòi khâ", english: "Can I have some ice?" } },
      { romanized: "Khǎw náam-bplào", script: "ขอน้ำเปล่า", english: "Can I have plain water?",
        slottable: [{ romanized: "náam-bplào", script: "น้ำเปล่า", english: "plain water" }],
        slot: { romanized: "náam-bplào", script: "น้ำเปล่า", english: "plain water" },
        example: { thai: "ขอน้ำเปล่าไม่ใส่น้ำแข็งครับ", romanized: "Khǎw náam-bplào mâi-sài náam-khǎeng khráp", english: "Can I have plain water with no ice?" } },
      { romanized: "Khǎw thǔng", script: "ขอถุง", english: "Can I have a bag?",
        slottable: [{ romanized: "thǔng", script: "ถุง", english: "bag" }],
        slot: { romanized: "thǔng", script: "ถุง", english: "bag" },
        example: { thai: "ขอถุงใบเล็กครับ", romanized: "Khǎw thǔng bai-lék khráp", english: "Can I have a small bag?" } },
      { romanized: "Khǎw chawn-gâap", script: "ขอช้อนส้อม", english: "Can I have a spoon and fork?",
        slottable: [{ romanized: "chawn-gâap", script: "ช้อนส้อม", english: "spoon and fork" }],
        slot: { romanized: "chawn-gâap", script: "ช้อนส้อม", english: "spoon and fork" },
        example: { thai: "ขอช้อนส้อมอีกชุดครับ", romanized: "Khǎw chawn-gâap ìik chút khráp", english: "Can I have another spoon-and-fork set?" } },
      { romanized: "Khǎw phôem", script: "ขอเพิ่ม", english: "Can I have more?",
        slottable: [{ romanized: "phôem", script: "เพิ่ม", english: "more" }],
        slot: { romanized: "phôem", script: "เพิ่ม", english: "more" },
        example: { thai: "ขอข้าวเพิ่มหน่อยครับ", romanized: "Khǎw khâao phôem nòi khráp", english: "Can I have more rice please?" } },
      { romanized: "Khǎw sùan-lót", script: "ขอส่วนลด", english: "Can I have a discount?",
        slottable: [{ romanized: "sùan-lót", script: "ส่วนลด", english: "discount" }],
        slot: { romanized: "sùan-lót", script: "ส่วนลด", english: "discount" },
        example: { thai: "ถ้าซื้อสองอัน ขอส่วนลดได้ไหม?", romanized: "Thâa súue sǎawng an, khǎw sùan-lót dâai mǎi?", english: "If I buy two, can I have a discount?" } }
    ]
  },

  // ─── 33. Pattern: Can You ___? (Tier 2 — Survival) ───
  {
    id: "can-you", emoji: "🤲", label: "Can You ___?", type: "pattern",
    frame: {
      romanized: "___ dâai mǎi?",
      script: "___ ได้ไหม?",
      english: "Can you ___?",
      explanation: "Add ได้ไหม (dâai mǎi) after a verb to ask if someone can or will do it."
    },
    pairs: [
      { romanized: "Phûut cháa-cháa dâai mǎi?", script: "พูดช้าๆ ได้ไหม?", english: "Can you speak slowly?",
        slottable: [{ romanized: "phûut-cháa-cháa", script: "พูดช้าๆ", english: "speak slowly" }],
        slot: { romanized: "phûut-cháa-cháa", script: "พูดช้าๆ", english: "speak slowly" },
        example: { thai: "ขอโทษครับ พูดช้าๆ ได้ไหม?", romanized: "Khǎw-thôot khráp, phûut cháa-cháa dâai mǎi?", english: "Sorry, can you speak slowly?" } },
      { romanized: "Phûut phaa-sǎa-ang-grìt dâai mǎi?", script: "พูดภาษาอังกฤษได้ไหม?", english: "Can you speak English?",
        slottable: [{ romanized: "phûut-phaa-sǎa-ang-grìt", script: "พูดภาษาอังกฤษ", english: "speak English" }],
        slot: { romanized: "phûut-phaa-sǎa-ang-grìt", script: "พูดภาษาอังกฤษ", english: "speak English" },
        example: { thai: "คุณพูดภาษาอังกฤษได้ไหม?", romanized: "Khun phûut phaa-sǎa-ang-grìt dâai mǎi?", english: "Can you speak English?" } },
      { romanized: "Chûai dâai mǎi?", script: "ช่วยได้ไหม?", english: "Can you help?",
        slottable: [{ romanized: "chûai", script: "ช่วย", english: "help" }],
        slot: { romanized: "chûai", script: "ช่วย", english: "help" },
        example: { thai: "ช่วยผมหน่อยได้ไหม?", romanized: "Chûai phǒm nòi dâai mǎi?", english: "Can you help me please?" } },
      { romanized: "Pai Sà-yǎam dâai mǎi?", script: "ไปสยามได้ไหม?", english: "Can you go to Siam?",
        slottable: [{ romanized: "pai-Sà-yǎam", script: "ไปสยาม", english: "go to Siam" }],
        slot: { romanized: "pai-Sà-yǎam", script: "ไปสยาม", english: "go to Siam" },
        example: { thai: "แท็กซี่ ไปสยามได้ไหม?", romanized: "Tháek-sîi, pai Sà-yǎam dâai mǎi?", english: "Taxi, can you go to Siam?" } },
      { romanized: "Lót-raa-khaa dâai mǎi?", script: "ลดราคาได้ไหม?", english: "Can you lower the price?",
        slottable: [{ romanized: "lót-raa-khaa", script: "ลดราคา", english: "lower the price" }],
        slot: { romanized: "lót-raa-khaa", script: "ลดราคา", english: "lower the price" },
        example: { thai: "อันนี้ลดราคาได้ไหมครับ?", romanized: "An-níi lót-raa-khaa dâai mǎi khráp?", english: "Can you lower the price on this one?" } },
      { romanized: "Raw dâai mǎi?", script: "รอได้ไหม?", english: "Can you wait?",
        slottable: [{ romanized: "raw", script: "รอ", english: "wait" }],
        slot: { romanized: "raw", script: "รอ", english: "wait" },
        example: { thai: "รอสองนาทีได้ไหม?", romanized: "Raw sǎawng naa-thii dâai mǎi?", english: "Can you wait two minutes?" } },
      { romanized: "Thàai-rûup dâai mǎi?", script: "ถ่ายรูปได้ไหม?", english: "Can you take a photo?",
        slottable: [{ romanized: "thàai-rûup", script: "ถ่ายรูป", english: "take a photo" }],
        slot: { romanized: "thàai-rûup", script: "ถ่ายรูป", english: "take a photo" },
        example: { thai: "ช่วยถ่ายรูปให้หน่อยได้ไหม?", romanized: "Chûai thàai-rûup hâi nòi dâai mǎi?", english: "Can you take a photo for me please?" } },
      { romanized: "Jàai-bàt dâai mǎi?", script: "จ่ายบัตรได้ไหม?", english: "Can I pay by card?",
        slottable: [{ romanized: "jàai-bàt", script: "จ่ายบัตร", english: "pay by card" }],
        slot: { romanized: "jàai-bàt", script: "จ่ายบัตร", english: "pay by card" },
        example: { thai: "ร้านนี้จ่ายบัตรได้ไหม?", romanized: "Ráan níi jàai-bàt dâai mǎi?", english: "Can I pay by card at this shop?" } },
      { romanized: "Lâek-ngoen dâai mǎi?", script: "แลกเงินได้ไหม?", english: "Can you change money?",
        slottable: [{ romanized: "lâek-ngoen", script: "แลกเงิน", english: "change money" }],
        slot: { romanized: "lâek-ngoen", script: "แลกเงิน", english: "change money" },
        example: { thai: "ที่นี่แลกเงินได้ไหม?", romanized: "Thîi-nîi lâek-ngoen dâai mǎi?", english: "Can I change money here?" } },
      { romanized: "Rîiak-tháek-sîi dâai mǎi?", script: "เรียกแท็กซี่ได้ไหม?", english: "Can you call a taxi?",
        slottable: [{ romanized: "rîiak-tháek-sîi", script: "เรียกแท็กซี่", english: "call a taxi" }],
        slot: { romanized: "rîiak-tháek-sîi", script: "เรียกแท็กซี่", english: "call a taxi" },
        example: { thai: "ช่วยเรียกแท็กซี่ให้หน่อยได้ไหม?", romanized: "Chûai rîiak-tháek-sîi hâi nòi dâai mǎi?", english: "Can you call a taxi for me please?" } }
    ]
  },

  // ─── 34. Pattern: How Much? (Tier 2 — Survival) ───
  {
    id: "how-much", emoji: "💰", label: "How Much?", type: "pattern",
    frame: {
      romanized: "___ thâo-rài?",
      script: "___ เท่าไหร่?",
      english: "How much is ___?",
      explanation: "Ask the price or quantity of anything by stating it then adding เท่าไหร่ (thâo-rài)."
    },
    pairs: [
      { romanized: "An-níi thâo-rài?", script: "อันนี้เท่าไหร่?", english: "How much is this one?",
        slottable: [{ romanized: "an-níi", script: "อันนี้", english: "this one" }],
        slot: { romanized: "an-níi", script: "อันนี้", english: "this one" },
        example: { thai: "ขอโทษครับ อันนี้เท่าไหร่?", romanized: "Khǎw-thôot khráp, an-níi thâo-rài?", english: "Excuse me, how much is this one?" } },
      { romanized: "An-nán thâo-rài?", script: "อันนั้นเท่าไหร่?", english: "How much is that one?",
        slottable: [{ romanized: "an-nán", script: "อันนั้น", english: "that one" }],
        slot: { romanized: "an-nán", script: "อันนั้น", english: "that one" },
        example: { thai: "อันนั้นสีดำเท่าไหร่?", romanized: "An-nán sǐi-dam thâo-rài?", english: "How much is that black one?" } },
      { romanized: "Raa-khaa thâo-rài?", script: "ราคาเท่าไหร่?", english: "How much is the price?",
        slottable: [{ romanized: "raa-khaa", script: "ราคา", english: "price" }],
        slot: { romanized: "raa-khaa", script: "ราคา", english: "price" },
        example: { thai: "ราคาเต็มเท่าไหร่?", romanized: "Raa-khaa dtem thâo-rài?", english: "What is the full price?" } },
      { romanized: "Chék-bin thâo-rài?", script: "เช็กบิลเท่าไหร่?", english: "How much is the bill?",
        slottable: [{ romanized: "chék-bin", script: "เช็กบิล", english: "bill" }],
        slot: { romanized: "chék-bin", script: "เช็กบิล", english: "bill" },
        example: { thai: "เช็กบิลทั้งหมดเท่าไหร่ครับ?", romanized: "Chék-bin tháng-mòt thâo-rài khráp?", english: "How much is the bill altogether?" } },
      { romanized: "Tháng-mòt thâo-rài?", script: "ทั้งหมดเท่าไหร่?", english: "How much is the total?",
        slottable: [{ romanized: "tháng-mòt", script: "ทั้งหมด", english: "total / altogether" }],
        slot: { romanized: "tháng-mòt", script: "ทั้งหมด", english: "total / altogether" },
        example: { thai: "ซื้อสามอย่าง ทั้งหมดเท่าไหร่?", romanized: "Súue sǎam yàang, tháng-mòt thâo-rài?", english: "Buying three things, how much total?" } },
      { romanized: "Khon-lá thâo-rài?", script: "คนละเท่าไหร่?", english: "How much per person?",
        slottable: [{ romanized: "khon-lá", script: "คนละ", english: "per person" }],
        slot: { romanized: "khon-lá", script: "คนละ", english: "per person" },
        example: { thai: "ค่ารถคนละเท่าไหร่?", romanized: "Khâa-rót khon-lá thâo-rài?", english: "How much is the ride per person?" } },
      { romanized: "Gii-loo-lá thâo-rài?", script: "กิโลละเท่าไหร่?", english: "How much per kilo?",
        slottable: [{ romanized: "gii-loo-lá", script: "กิโลละ", english: "per kilo" }],
        slot: { romanized: "gii-loo-lá", script: "กิโลละ", english: "per kilo" },
        example: { thai: "มะม่วงกิโลละเท่าไหร่?", romanized: "Má-mûang gii-loo-lá thâo-rài?", english: "How much are mangoes per kilo?" } },
      { romanized: "Khâa-châo thâo-rài?", script: "ค่าเช่าเท่าไหร่?", english: "How much is the rent?",
        slottable: [{ romanized: "khâa-châo", script: "ค่าเช่า", english: "rent" }],
        slot: { romanized: "khâa-châo", script: "ค่าเช่า", english: "rent" },
        example: { thai: "ห้องนี้ค่าเช่าเท่าไหร่ต่อเดือน?", romanized: "Hông níi khâa-châo thâo-rài dtàw-deuan?", english: "How much is the rent for this room per month?" } },
      { romanized: "Chûa-moong-lá thâo-rài?", script: "ชั่วโมงละเท่าไหร่?", english: "How much per hour?",
        slottable: [{ romanized: "chûa-moong-lá", script: "ชั่วโมงละ", english: "per hour" }],
        slot: { romanized: "chûa-moong-lá", script: "ชั่วโมงละ", english: "per hour" },
        example: { thai: "นวดชั่วโมงละเท่าไหร่?", romanized: "Nûat chûa-moong-lá thâo-rài?", english: "How much is massage per hour?" } },
      { romanized: "Khâa-doi-sǎan thâo-rài?", script: "ค่าโดยสารเท่าไหร่?", english: "How much is the fare?",
        slottable: [{ romanized: "khâa-doi-sǎan", script: "ค่าโดยสาร", english: "fare" }],
        slot: { romanized: "khâa-doi-sǎan", script: "ค่าโดยสาร", english: "fare" },
        example: { thai: "ไปสนามบิน ค่าโดยสารเท่าไหร่?", romanized: "Pai sà-nǎam-bin, khâa-doi-sǎan thâo-rài?", english: "To the airport, how much is the fare?" } }
    ]
  },

  // ─── 35. Pattern: I Want To... (Tier 2 — Survival) ───
  {
    id: "want-to", emoji: "🙋", label: "I Want To...", type: "pattern",
    frame: {
      romanized: "yàak + ___",
      script: "อยาก + ___",
      english: "I want to ___",
      explanation: "Use อยาก (yàak) followed by a verb to express what you want to do."
    },
    pairs: [
      { romanized: "Yàak gin", script: "อยากกิน", english: "I want to eat",
        slottable: [{ romanized: "gin", script: "กิน", english: "eat" }],
        slot: { romanized: "gin", script: "กิน", english: "eat" },
        example: { thai: "วันนี้อยากกินอาหารไทย", romanized: "Wan-níi yàak gin aa-hǎan Thai", english: "Today I want to eat Thai food" } },
      { romanized: "Yàak dèum", script: "อยากดื่ม", english: "I want to drink",
        slottable: [{ romanized: "dèum", script: "ดื่ม", english: "drink" }],
        slot: { romanized: "dèum", script: "ดื่ม", english: "drink" },
        example: { thai: "อากาศร้อน อยากดื่มน้ำเย็น", romanized: "Aa-gàat rón, yàak dèum náam-yen", english: "It's hot; I want to drink cold water" } },
      { romanized: "Yàak pai", script: "อยากไป", english: "I want to go",
        slottable: [{ romanized: "pai", script: "ไป", english: "go" }],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "อยากไปสยามครับ", romanized: "Yàak pai Sà-yǎam khráp", english: "I want to go to Siam" } },
      { romanized: "Yàak nawn", script: "อยากนอน", english: "I want to sleep",
        slottable: [{ romanized: "nawn", script: "นอน", english: "sleep" }],
        slot: { romanized: "nawn", script: "นอน", english: "sleep" },
        example: { thai: "เหนื่อยมาก อยากนอน", romanized: "Nùeai mâak, yàak nawn", english: "I'm very tired; I want to sleep" } },
      { romanized: "Yàak phák", script: "อยากพัก", english: "I want to rest",
        slottable: [{ romanized: "phák", script: "พัก", english: "rest" }],
        slot: { romanized: "phák", script: "พัก", english: "rest" },
        example: { thai: "เดินทั้งวัน อยากพักหน่อย", romanized: "Dern tháng-wan, yàak phák nòi", english: "I've walked all day; I want to rest a bit" } },
      { romanized: "Yàak laawng", script: "อยากลอง", english: "I want to try",
        slottable: [{ romanized: "laawng", script: "ลอง", english: "try" }],
        slot: { romanized: "laawng", script: "ลอง", english: "try" },
        example: { thai: "อยากลองอันนี้ค่ะ", romanized: "Yàak laawng an-níi khâ", english: "I want to try this one" } },
      { romanized: "Yàak súue", script: "อยากซื้อ", english: "I want to buy",
        slottable: [{ romanized: "súue", script: "ซื้อ", english: "buy" }],
        slot: { romanized: "súue", script: "ซื้อ", english: "buy" },
        example: { thai: "อยากซื้อซิมการ์ด", romanized: "Yàak súue sim-gàat", english: "I want to buy a SIM card" } },
      { romanized: "Yàak rian phaa-sǎa-Thai", script: "อยากเรียนภาษาไทย", english: "I want to learn Thai",
        slottable: [{ romanized: "rian-phaa-sǎa-Thai", script: "เรียนภาษาไทย", english: "learn Thai" }],
        slot: { romanized: "rian-phaa-sǎa-Thai", script: "เรียนภาษาไทย", english: "learn Thai" },
        example: { thai: "ผมอยากเรียนภาษาไทย", romanized: "Phǒm yàak rian phaa-sǎa-Thai", english: "I want to learn Thai" } },
      { romanized: "Yàak duu", script: "อยากดู", english: "I want to see / watch",
        slottable: [{ romanized: "duu", script: "ดู", english: "see / watch" }],
        slot: { romanized: "duu", script: "ดู", english: "see / watch" },
        example: { thai: "อยากดูวัดพระแก้ว", romanized: "Yàak duu Wát-Phra-Gâew", english: "I want to see the Temple of the Emerald Buddha" } },
      { romanized: "Yàak sàng-aa-hǎan", script: "อยากสั่งอาหาร", english: "I want to order food",
        slottable: [{ romanized: "sàng-aa-hǎan", script: "สั่งอาหาร", english: "order food" }],
        slot: { romanized: "sàng-aa-hǎan", script: "สั่งอาหาร", english: "order food" },
        example: { thai: "อยากสั่งอาหารกลับบ้านครับ", romanized: "Yàak sàng-aa-hǎan glàp-bâan khráp", english: "I want to order food to take home" } }
    ]
  },

  // ─── 36. Pattern: I Need ___ (Tier 2 — Survival) ───
  {
    id: "need", emoji: "🆘", label: "I Need ___", type: "pattern",
    frame: {
      romanized: "tông-gaan + ___",
      script: "ต้องการ + ___",
      english: "I need ___",
      explanation: "ต้องการ (tông-gaan) means 'need'. More formal than อยาก. Used with nouns."
    },
    pairs: [
      { romanized: "Tông-gaan khwaam-chûai-lǔea", script: "ต้องการความช่วยเหลือ", english: "I need help",
        slottable: [{ romanized: "khwaam-chûai-lǔea", script: "ความช่วยเหลือ", english: "help" }],
        slot: { romanized: "khwaam-chûai-lǔea", script: "ความช่วยเหลือ", english: "help" },
        example: { thai: "ผมต้องการความช่วยเหลือครับ", romanized: "Phǒm tông-gaan khwaam-chûai-lǔea khráp", english: "I need help" } },
      { romanized: "Tông-gaan náam", script: "ต้องการน้ำ", english: "I need water",
        slottable: [{ romanized: "náam", script: "น้ำ", english: "water" }],
        slot: { romanized: "náam", script: "น้ำ", english: "water" },
        example: { thai: "ตอนนี้ต้องการน้ำ", romanized: "Dtawn-níi tông-gaan náam", english: "I need water right now" } },
      { romanized: "Tông-gaan mǎw", script: "ต้องการหมอ", english: "I need a doctor",
        slottable: [{ romanized: "mǎw", script: "หมอ", english: "doctor" }],
        slot: { romanized: "mǎw", script: "หมอ", english: "doctor" },
        example: { thai: "เพื่อนไม่สบาย ต้องการหมอ", romanized: "Phûean mâi sà-baai, tông-gaan mǎw", english: "My friend is sick; we need a doctor" } },
      { romanized: "Tông-gaan tháek-sîi", script: "ต้องการแท็กซี่", english: "I need a taxi",
        slottable: [{ romanized: "tháek-sîi", script: "แท็กซี่", english: "taxi" }],
        slot: { romanized: "tháek-sîi", script: "แท็กซี่", english: "taxi" },
        example: { thai: "ต้องการแท็กซี่ไปสนามบิน", romanized: "Tông-gaan tháek-sîi pai sà-nǎam-bin", english: "I need a taxi to the airport" } },
      { romanized: "Tông-gaan hông", script: "ต้องการห้อง", english: "I need a room",
        slottable: [{ romanized: "hông", script: "ห้อง", english: "room" }],
        slot: { romanized: "hông", script: "ห้อง", english: "room" },
        example: { thai: "ต้องการห้องหนึ่งคืนครับ", romanized: "Tông-gaan hông nùeng khuen khráp", english: "I need a room for one night" } },
      { romanized: "Tông-gaan dtǔa", script: "ต้องการตั๋ว", english: "I need a ticket",
        slottable: [{ romanized: "dtǔa", script: "ตั๋ว", english: "ticket" }],
        slot: { romanized: "dtǔa", script: "ตั๋ว", english: "ticket" },
        example: { thai: "ต้องการตั๋วไปเชียงใหม่", romanized: "Tông-gaan dtǔa pai Chiang-mài", english: "I need a ticket to Chiang Mai" } },
      { romanized: "Tông-gaan rǐan", script: "ต้องการเหรียญ", english: "I need coins",
        slottable: [{ romanized: "rǐan", script: "เหรียญ", english: "coins" }],
        slot: { romanized: "rǐan", script: "เหรียญ", english: "coins" },
        example: { thai: "ต้องการเหรียญสิบบาทครับ", romanized: "Tông-gaan rǐan sìp bàat khráp", english: "I need a ten-baht coin" } },
      { romanized: "Tông-gaan khon-bplae-phaa-sǎa", script: "ต้องการคนแปลภาษา", english: "I need a translator",
        slottable: [{ romanized: "khon-bplae-phaa-sǎa", script: "คนแปลภาษา", english: "translator" }],
        slot: { romanized: "khon-bplae-phaa-sǎa", script: "คนแปลภาษา", english: "translator" },
        example: { thai: "ที่โรงพยาบาลต้องการคนแปลภาษา", romanized: "Thîi roong-phá-yaa-baan tông-gaan khon-bplae-phaa-sǎa", english: "At the hospital I need a translator" } },
      { romanized: "Tông-gaan phâa-phan-phlǎe", script: "ต้องการผ้าพันแผล", english: "I need a bandage",
        slottable: [{ romanized: "phâa-phan-phlǎe", script: "ผ้าพันแผล", english: "bandage" }],
        slot: { romanized: "phâa-phan-phlǎe", script: "ผ้าพันแผล", english: "bandage" },
        example: { thai: "มีแผล ต้องการผ้าพันแผล", romanized: "Mii phlǎe, tông-gaan phâa-phan-phlǎe", english: "I have a wound; I need a bandage" } },
      { romanized: "Tông-gaan wee-laa-phôem", script: "ต้องการเวลาเพิ่ม", english: "I need more time",
        slottable: [{ romanized: "wee-laa-phôem", script: "เวลาเพิ่ม", english: "more time" }],
        slot: { romanized: "wee-laa-phôem", script: "เวลาเพิ่ม", english: "more time" },
        example: { thai: "ขอโทษครับ ต้องการเวลาเพิ่ม", romanized: "Khǎw-thôot khráp, tông-gaan wee-laa-phôem", english: "Sorry, I need more time" } }
    ]
  },

  // ─── 37. Pattern: I Like ___ (Tier 3 — Daily Interaction) ───
  {
    id: "like", emoji: "💚", label: "I Like ___", type: "pattern",
    frame: {
      romanized: "chôp + ___",
      script: "ชอบ + ___",
      english: "I like ___",
      explanation: "ชอบ (chôp) works with both nouns and verbs."
    },
    pairs: [
      { romanized: "Chôp aa-hǎan-Thai", script: "ชอบอาหารไทย", english: "I like Thai food",
        slottable: [{ romanized: "aa-hǎan-Thai", script: "อาหารไทย", english: "Thai food" }],
        slot: { romanized: "aa-hǎan-Thai", script: "อาหารไทย", english: "Thai food" },
        example: { thai: "ผมชอบอาหารไทยมาก โดยเฉพาะผัดกะเพรา", romanized: "Phǒm chôp aa-hǎan-Thai mâak, dooi-chà-pháw phàt-grà-phao", english: "I really like Thai food, especially basil stir-fry" } },
      { romanized: "Chôp gǔay-dtǐao", script: "ชอบก๋วยเตี๋ยว", english: "I like noodles",
        slottable: [{ romanized: "gǔay-dtǐao", script: "ก๋วยเตี๋ยว", english: "noodles" }],
        slot: { romanized: "gǔay-dtǐao", script: "ก๋วยเตี๋ยว", english: "noodles" },
        example: { thai: "ร้านนี้ก๋วยเตี๋ยวอร่อย ฉันชอบ", romanized: "Ráan níi gǔay-dtǐao à-ròi, chǎn chôp", english: "This shop's noodles are good; I like them" } },
      { romanized: "Chôp phǒn-lá-mái", script: "ชอบผลไม้", english: "I like fruit",
        slottable: [{ romanized: "phǒn-lá-mái", script: "ผลไม้", english: "fruit" }],
        slot: { romanized: "phǒn-lá-mái", script: "ผลไม้", english: "fruit" },
        example: { thai: "เมืองไทยมีผลไม้เยอะ ฉันชอบมาก", romanized: "Meuang-Thai mii phǒn-lá-mái yóe, chǎn chôp mâak", english: "Thailand has lots of fruit; I really like it" } },
      { romanized: "Chôp doen-thaang", script: "ชอบเดินทาง", english: "I like traveling",
        slottable: [{ romanized: "doen-thaang", script: "เดินทาง", english: "traveling" }],
        slot: { romanized: "doen-thaang", script: "เดินทาง", english: "traveling" },
        example: { thai: "วันหยุดผมชอบเดินทางไปต่างจังหวัด", romanized: "Wan-yùt phǒm chôp doen-thaang pai dtàang-jang-wàt", english: "On holidays I like traveling to other provinces" } },
      { romanized: "Chôp doen-lên", script: "ชอบเดินเล่น", english: "I like walking around",
        slottable: [{ romanized: "doen-lên", script: "เดินเล่น", english: "walking around" }],
        slot: { romanized: "doen-lên", script: "เดินเล่น", english: "walking around" },
        example: { thai: "ตอนเย็นชอบเดินเล่นแถวสวนลุม", romanized: "Dtawn-yen chôp doen-lên thǎeo Sǔan-Lum", english: "In the evening I like walking around near Lumphini Park" } },
      { romanized: "Chôp àan-nǎng-sǔue", script: "ชอบอ่านหนังสือ", english: "I like reading",
        slottable: [{ romanized: "àan-nǎng-sǔue", script: "อ่านหนังสือ", english: "reading" }],
        slot: { romanized: "àan-nǎng-sǔue", script: "อ่านหนังสือ", english: "reading" },
        example: { thai: "ก่อนนอนฉันชอบอ่านหนังสือ", romanized: "Gàwn-nawn chǎn chôp àan-nǎng-sǔue", english: "Before bed I like reading" } },
      { romanized: "Chôp fang-phleeng", script: "ชอบฟังเพลง", english: "I like listening to music",
        slottable: [{ romanized: "fang-phleeng", script: "ฟังเพลง", english: "listening to music" }],
        slot: { romanized: "fang-phleeng", script: "ฟังเพลง", english: "listening to music" },
        example: { thai: "เวลาทำงานผมชอบฟังเพลง", romanized: "Wee-laa tham-ngaan phǒm chôp fang-phleeng", english: "When working I like listening to music" } },
      { romanized: "Chôp duu-nǎng", script: "ชอบดูหนัง", english: "I like watching movies",
        slottable: [{ romanized: "duu-nǎng", script: "ดูหนัง", english: "watching movies" }],
        slot: { romanized: "duu-nǎng", script: "ดูหนัง", english: "watching movies" },
        example: { thai: "เสาร์นี้ไปดูหนังไหม ผมชอบดูหนัง", romanized: "Sǎo níi pai duu-nǎng mǎi, phǒm chôp duu-nǎng", english: "Want to go to a movie this Saturday? I like watching movies" } },
      { romanized: "Chôp thá-lee", script: "ชอบทะเล", english: "I like the sea",
        slottable: [{ romanized: "thá-lee", script: "ทะเล", english: "the sea" }],
        slot: { romanized: "thá-lee", script: "ทะเล", english: "the sea" },
        example: { thai: "ฉันชอบทะเล แต่ไม่ชอบแดดแรง", romanized: "Chǎn chôp thá-lee, dtàae mâi chôp dàet raeng", english: "I like the sea, but I don't like strong sun" } },
      { romanized: "Chôp thîi-nîi", script: "ชอบที่นี่", english: "I like this place",
        slottable: [{ romanized: "thîi-nîi", script: "ที่นี่", english: "this place" }],
        slot: { romanized: "thîi-nîi", script: "ที่นี่", english: "this place" },
        example: { thai: "ที่นี่สบายดี ฉันชอบที่นี่", romanized: "Thîi-nîi sà-baai dii, chǎn chôp thîi-nîi", english: "This place feels nice; I like it here" } }
    ]
  },

  // ─── 38. Pattern: I Have ___ (Tier 3 — Daily Interaction) ───
  {
    id: "have", emoji: "📦", label: "I Have ___", type: "pattern",
    frame: {
      romanized: "mii + ___",
      script: "มี + ___",
      english: "I have ___ / There is ___",
      explanation: "มี (mii) means 'have' or 'there is'. Versatile — works for possessions, available items, abstract things."
    },
    pairs: [
      { romanized: "Mii ngoen", script: "มีเงิน", english: "I have money",
        slottable: [{ romanized: "ngoen", script: "เงิน", english: "money" }],
        slot: { romanized: "ngoen", script: "เงิน", english: "money" },
        example: { thai: "วันนี้มีเงินสดไม่เยอะ", romanized: "Wan-níi mii ngoen-sòt mâi yóe", english: "Today I don't have much cash" } },
      { romanized: "Mii wee-laa", script: "มีเวลา", english: "I have time",
        slottable: [{ romanized: "wee-laa", script: "เวลา", english: "time" }],
        slot: { romanized: "wee-laa", script: "เวลา", english: "time" },
        example: { thai: "พรุ่งนี้คุณมีเวลาไหม?", romanized: "Phrûng-níi khun mii wee-laa mǎi?", english: "Do you have time tomorrow?" } },
      { romanized: "Mii hông-wâang", script: "มีห้องว่าง", english: "There is a free room",
        slottable: [{ romanized: "hông-wâang", script: "ห้องว่าง", english: "free room" }],
        slot: { romanized: "hông-wâang", script: "ห้องว่าง", english: "free room" },
        example: { thai: "คืนนี้มีห้องว่างไหมครับ?", romanized: "Khuen-níi mii hông-wâang mǎi khráp?", english: "Is there a room available tonight?" } },
      { romanized: "Mii kham-thǎam", script: "มีคำถาม", english: "I have a question",
        slottable: [{ romanized: "kham-thǎam", script: "คำถาม", english: "question" }],
        slot: { romanized: "kham-thǎam", script: "คำถาม", english: "question" },
        example: { thai: "ขอโทษครับ ผมมีคำถาม", romanized: "Khǎw-thôot khráp, phǒm mii kham-thǎam", english: "Excuse me, I have a question" } },
      { romanized: "Mii dtó-wâang", script: "มีโต๊ะว่าง", english: "There is a free table",
        slottable: [{ romanized: "dtó-wâang", script: "โต๊ะว่าง", english: "free table" }],
        slot: { romanized: "dtó-wâang", script: "โต๊ะว่าง", english: "free table" },
        example: { thai: "ร้านนี้มีโต๊ะว่างไหม?", romanized: "Ráan níi mii dtó-wâang mǎi?", english: "Does this restaurant have a free table?" } },
      { romanized: "Mii phûean", script: "มีเพื่อน", english: "I have a friend",
        slottable: [{ romanized: "phûean", script: "เพื่อน", english: "friend" }],
        slot: { romanized: "phûean", script: "เพื่อน", english: "friend" },
        example: { thai: "ผมมีเพื่อนอยู่กรุงเทพ", romanized: "Phǒm mii phûean yùu Grung-thêep", english: "I have a friend in Bangkok" } },
      { romanized: "Mii bpan-hǎa", script: "มีปัญหา", english: "There is a problem",
        slottable: [{ romanized: "bpan-hǎa", script: "ปัญหา", english: "problem" }],
        slot: { romanized: "bpan-hǎa", script: "ปัญหา", english: "problem" },
        example: { thai: "ถ้ามีปัญหา โทรหาผมนะ", romanized: "Thâa mii bpan-hǎa, thoo hǎa phǒm ná", english: "If there's a problem, call me" } },
      { romanized: "Mii rót", script: "มีรถ", english: "I have a car",
        slottable: [{ romanized: "rót", script: "รถ", english: "car" }],
        slot: { romanized: "rót", script: "รถ", english: "car" },
        example: { thai: "คุณมีรถไหม หรือไปแท็กซี่?", romanized: "Khun mii rót mǎi, rěu pai tháek-sîi?", english: "Do you have a car, or are we taking a taxi?" } },
      { romanized: "Mii ngaan-thîi-tông-tham", script: "มีงานที่ต้องทำ", english: "I have work to do",
        slottable: [{ romanized: "ngaan-thîi-tông-tham", script: "งานที่ต้องทำ", english: "work to do" }],
        slot: { romanized: "ngaan-thîi-tông-tham", script: "งานที่ต้องทำ", english: "work to do" },
        example: { thai: "วันนี้มีงานที่ต้องทำเยอะมาก", romanized: "Wan-níi mii ngaan thîi tông tham yóe mâak", english: "Today I have a lot of work to do" } },
      { romanized: "Mii náam-yen", script: "มีน้ำเย็น", english: "There is cold water",
        slottable: [{ romanized: "náam-yen", script: "น้ำเย็น", english: "cold water" }],
        slot: { romanized: "náam-yen", script: "น้ำเย็น", english: "cold water" },
        example: { thai: "ในตู้เย็นมีน้ำเย็น", romanized: "Nai dtûu-yen mii náam-yen", english: "There is cold water in the fridge" } }
    ]
  },

  // ─── 39. Pattern: Going To ___ (Tier 3 — Daily Interaction) ───
  {
    id: "go-to", emoji: "🚶", label: "Going To ___", type: "pattern",
    frame: {
      romanized: "pai + ___",
      script: "ไป + ___",
      english: "Going (to) ___",
      explanation: "ไป (pai) means 'go'. Use with a place or another verb to express destination or purpose."
    },
    pairs: [
      { romanized: "Pai tham-ngaan", script: "ไปทำงาน", english: "Going to work",
        slottable: [{ romanized: "tham-ngaan", script: "ทำงาน", english: "work" }],
        slot: { romanized: "tham-ngaan", script: "ทำงาน", english: "work" },
        example: { thai: "ตอนเช้าผมไปทำงานด้วยบีทีเอส", romanized: "Dtawn-cháo phǒm pai tham-ngaan dûay BTS", english: "In the morning I go to work by BTS" } },
      { romanized: "Pai bâan", script: "ไปบ้าน", english: "Going home / to the house",
        slottable: [{ romanized: "bâan", script: "บ้าน", english: "home / house" }],
        slot: { romanized: "bâan", script: "บ้าน", english: "home / house" },
        example: { thai: "เลิกงานแล้วไปบ้านเลย", romanized: "Lôek-ngaan láew pai bâan loei", english: "After work, I'm going straight home" } },
      { romanized: "Pai gin-khâao", script: "ไปกินข้าว", english: "Going to eat",
        slottable: [{ romanized: "gin-khâao", script: "กินข้าว", english: "eat" }],
        slot: { romanized: "gin-khâao", script: "กินข้าว", english: "eat" },
        example: { thai: "เที่ยงแล้ว ไปกินข้าวไหม?", romanized: "Thîiang láew, pai gin-khâao mǎi?", english: "It's noon already, want to go eat?" } },
      { romanized: "Pai dtà-làat", script: "ไปตลาด", english: "Going to the market",
        slottable: [{ romanized: "dtà-làat", script: "ตลาด", english: "market" }],
        slot: { romanized: "dtà-làat", script: "ตลาด", english: "market" },
        example: { thai: "เย็นนี้ฉันจะไปตลาด", romanized: "Yen-níi chǎn jà pai dtà-làat", english: "This evening I'm going to the market" } },
      { romanized: "Pai roong-rian", script: "ไปโรงเรียน", english: "Going to school",
        slottable: [{ romanized: "roong-rian", script: "โรงเรียน", english: "school" }],
        slot: { romanized: "roong-rian", script: "โรงเรียน", english: "school" },
        example: { thai: "ลูกไปโรงเรียนกี่โมง?", romanized: "Lûuk pai roong-rian gìi moong?", english: "What time does your child go to school?" } },
      { romanized: "Pai thîao", script: "ไปเที่ยว", english: "Going traveling / going out",
        slottable: [{ romanized: "thîao", script: "เที่ยว", english: "travel / go out" }],
        slot: { romanized: "thîao", script: "เที่ยว", english: "travel / go out" },
        example: { thai: "เสาร์นี้ไปเที่ยวไหนดี?", romanized: "Sǎo níi pai thîao nǎi dii?", english: "Where should we go out this Saturday?" } },
      { romanized: "Pai nawn", script: "ไปนอน", english: "Going to sleep",
        slottable: [{ romanized: "nawn", script: "นอน", english: "sleep" }],
        slot: { romanized: "nawn", script: "นอน", english: "sleep" },
        example: { thai: "เหนื่อยมากแล้ว ไปนอนก่อนนะ", romanized: "Nùeai mâak láew, pai nawn gàwn ná", english: "I'm really tired, I'm going to sleep first" } },
      { romanized: "Pai súue-khǎawng", script: "ไปซื้อของ", english: "Going shopping",
        slottable: [{ romanized: "súue-khǎawng", script: "ซื้อของ", english: "shopping / buying things" }],
        slot: { romanized: "súue-khǎawng", script: "ซื้อของ", english: "shopping / buying things" },
        example: { thai: "หลังเลิกงานจะไปซื้อของ", romanized: "Lǎng lôek-ngaan jà pai súue-khǎawng", english: "After work I'm going shopping" } },
      { romanized: "Pai jur-phûean", script: "ไปเจอเพื่อน", english: "Going to see a friend",
        slottable: [{ romanized: "jur-phûean", script: "เจอเพื่อน", english: "see a friend" }],
        slot: { romanized: "jur-phûean", script: "เจอเพื่อน", english: "see a friend" },
        example: { thai: "คืนนี้ผมไปเจอเพื่อนที่สยาม", romanized: "Khuen-níi phǒm pai jur-phûean thîi Sà-yǎam", english: "Tonight I'm going to see a friend at Siam" } },
      { romanized: "Pai sà-nǎam-bin", script: "ไปสนามบิน", english: "Going to the airport",
        slottable: [{ romanized: "sà-nǎam-bin", script: "สนามบิน", english: "airport" }],
        slot: { romanized: "sà-nǎam-bin", script: "สนามบิน", english: "airport" },
        example: { thai: "พรุ่งนี้เช้าต้องไปสนามบิน", romanized: "Phrûng-níi cháo tông pai sà-nǎam-bin", english: "Tomorrow morning I have to go to the airport" } }
    ]
  },

  // ─── 40. Pattern: Eat / Drink ___ (Tier 3 — Daily Interaction) ───
  {
    id: "eat-drink", emoji: "🍴", label: "Eat / Drink ___", type: "pattern",
    frame: {
      romanized: "gin + ___ / dùem + ___",
      script: "กิน + ___ / ดื่ม + ___",
      english: "Eat / drink ___",
      explanation: "กิน (gin) for eating, ดื่ม (dùem) for drinking. Some Thai uses กิน for both casually."
    },
    pairs: [
      { romanized: "Gin khâao", script: "กินข้าว", english: "Eat rice / eat a meal",
        slottable: [{ romanized: "khâao", script: "ข้าว", english: "rice / meal" }],
        slot: { romanized: "khâao", script: "ข้าว", english: "rice / meal" },
        example: { thai: "กินข้าวหรือยัง?", romanized: "Gin khâao rěu-yang?", english: "Have you eaten yet?" } },
      { romanized: "Gin phàt-thai", script: "กินผัดไทย", english: "Eat pad thai",
        slottable: [{ romanized: "phàt-thai", script: "ผัดไทย", english: "pad thai" }],
        slot: { romanized: "phàt-thai", script: "ผัดไทย", english: "pad thai" },
        example: { thai: "มาครั้งแรกต้องกินผัดไทย", romanized: "Maa khráng-râek tông gin phàt-thai", english: "First time here, you have to eat pad thai" } },
      { romanized: "Gin phǒn-lá-mái", script: "กินผลไม้", english: "Eat fruit",
        slottable: [{ romanized: "phǒn-lá-mái", script: "ผลไม้", english: "fruit" }],
        slot: { romanized: "phǒn-lá-mái", script: "ผลไม้", english: "fruit" },
        example: { thai: "หลังอาหารชอบกินผลไม้", romanized: "Lǎng aa-hǎan chôp gin phǒn-lá-mái", english: "After meals I like eating fruit" } },
      { romanized: "Dùem náam", script: "ดื่มน้ำ", english: "Drink water",
        slottable: [{ romanized: "náam", script: "น้ำ", english: "water" }],
        slot: { romanized: "náam", script: "น้ำ", english: "water" },
        example: { thai: "อากาศร้อน ต้องดื่มน้ำเยอะๆ", romanized: "Aa-gàat rón, tông dùem náam yóe-yóe", english: "It's hot; you need to drink lots of water" } },
      { romanized: "Dùem gaa-fae", script: "ดื่มกาแฟ", english: "Drink coffee",
        slottable: [{ romanized: "gaa-fae", script: "กาแฟ", english: "coffee" }],
        slot: { romanized: "gaa-fae", script: "กาแฟ", english: "coffee" },
        example: { thai: "ตอนเช้าผมดื่มกาแฟทุกวัน", romanized: "Dtawn-cháo phǒm dùem gaa-fae thúk-wan", english: "In the morning I drink coffee every day" } },
      { romanized: "Dùem chaa", script: "ดื่มชา", english: "Drink tea",
        slottable: [{ romanized: "chaa", script: "ชา", english: "tea" }],
        slot: { romanized: "chaa", script: "ชา", english: "tea" },
        example: { thai: "ตอนบ่ายชอบดื่มชาเย็น", romanized: "Dtawn-bàai chôp dùem chaa-yen", english: "In the afternoon I like drinking iced tea" } },
      { romanized: "Dùem bia", script: "ดื่มเบียร์", english: "Drink beer",
        slottable: [{ romanized: "bia", script: "เบียร์", english: "beer" }],
        slot: { romanized: "bia", script: "เบียร์", english: "beer" },
        example: { thai: "เย็นวันศุกร์ไปดื่มเบียร์กันไหม?", romanized: "Yen Wan-Sùk pai dùem bia gan mǎi?", english: "Friday evening, want to go drink beer together?" } },
      { romanized: "Gin yaa", script: "กินยา", english: "Take medicine",
        slottable: [{ romanized: "yaa", script: "ยา", english: "medicine" }],
        slot: { romanized: "yaa", script: "ยา", english: "medicine" },
        example: { thai: "ไม่สบายต้องกินยาแล้วพักผ่อน", romanized: "Mâi sà-baai tông gin yaa láew phák-phàwn", english: "If you're sick, take medicine and rest" } },
      { romanized: "Gin sôm-dtam", script: "กินส้มตำ", english: "Eat papaya salad",
        slottable: [{ romanized: "sôm-dtam", script: "ส้มตำ", english: "papaya salad" }],
        slot: { romanized: "sôm-dtam", script: "ส้มตำ", english: "papaya salad" },
        example: { thai: "ส้มตำร้านนี้เผ็ดมาก กินได้ไหม?", romanized: "Sôm-dtam ráan níi phèt mâak, gin dâai mǎi?", english: "This shop's papaya salad is very spicy; can you eat it?" } },
      { romanized: "Dùem náam-phǒn-lá-mái", script: "ดื่มน้ำผลไม้", english: "Drink juice",
        slottable: [{ romanized: "náam-phǒn-lá-mái", script: "น้ำผลไม้", english: "juice" }],
        slot: { romanized: "náam-phǒn-lá-mái", script: "น้ำผลไม้", english: "juice" },
        example: { thai: "เด็กๆ ชอบดื่มน้ำผลไม้", romanized: "Dèk-dèk chôp dùem náam-phǒn-lá-mái", english: "Kids like drinking juice" } }
    ]
  },

  // ─── 41. Pattern: More Than (Tier 3 — Daily Interaction) ───
  {
    id: "comparative", emoji: "⚖️", label: "More Than", type: "pattern",
    frame: {
      romanized: "___ + [adj] + gwàa + ___",
      script: "___ + [adj] + กว่า + ___",
      english: "[A] is more [adj] than [B]",
      explanation: "Use กว่า (gwàa) after the adjective to compare. Subject before, comparison object after."
    },
    pairs: [
      { romanized: "An-níi à-ròi gwàa an-nán", script: "อันนี้อร่อยกว่าอันนั้น", english: "This one is tastier than that one",
        slottable: [{ romanized: "à-ròi", script: "อร่อย", english: "tasty" }],
        slot: { romanized: "à-ròi", script: "อร่อย", english: "tasty" },
        example: { thai: "ลองอันนี้สิ อร่อยกว่าอันนั้น", romanized: "Laawng an-níi sì, à-ròi gwàa an-nán", english: "Try this one; it's tastier than that one" } },
      { romanized: "Rót reo gwàa rót-mee", script: "รถเร็วกว่ารถเมล์", english: "Cars are faster than buses",
        slottable: [{ romanized: "reo", script: "เร็ว", english: "fast" }],
        slot: { romanized: "reo", script: "เร็ว", english: "fast" },
        example: { thai: "ถ้าไม่รถติด รถเร็วกว่ารถเมล์", romanized: "Thâa mâi rót-tìt, rót reo gwàa rót-mee", english: "If there's no traffic, cars are faster than buses" } },
      { romanized: "Wan-níi dii gwàa mêua-waan", script: "วันนี้ดีกว่าเมื่อวาน", english: "Today is better than yesterday",
        slottable: [{ romanized: "dii", script: "ดี", english: "good / better" }],
        slot: { romanized: "dii", script: "ดี", english: "good / better" },
        example: { thai: "วันนี้รู้สึกดีกว่าเมื่อวาน", romanized: "Wan-níi rúu-sùek dii gwàa mêua-waan", english: "Today I feel better than yesterday" } },
      { romanized: "Grung-thêep rón gwàa Chiang-mài", script: "กรุงเทพร้อนกว่าเชียงใหม่", english: "Bangkok is hotter than Chiang Mai",
        slottable: [{ romanized: "rón", script: "ร้อน", english: "hot" }],
        slot: { romanized: "rón", script: "ร้อน", english: "hot" },
        example: { thai: "หน้าร้อนกรุงเทพร้อนกว่าเชียงใหม่", romanized: "Nâa-rón Grung-thêep rón gwàa Chiang-mài", english: "In hot season Bangkok is hotter than Chiang Mai" } },
      { romanized: "BTS sà-dùak gwàa tháek-sîi", script: "บีทีเอสสะดวกกว่าแท็กซี่", english: "The BTS is more convenient than a taxi",
        slottable: [{ romanized: "sà-dùak", script: "สะดวก", english: "convenient" }],
        slot: { romanized: "sà-dùak", script: "สะดวก", english: "convenient" },
        example: { thai: "ตอนรถติด บีทีเอสสะดวกกว่าแท็กซี่", romanized: "Dtawn rót-tìt, BTS sà-dùak gwàa tháek-sîi", english: "When traffic is bad, the BTS is more convenient than a taxi" } },
      { romanized: "Ráan níi thuuk gwàa ráan nán", script: "ร้านนี้ถูกกว่าร้านนั้น", english: "This shop is cheaper than that shop",
        slottable: [{ romanized: "thuuk", script: "ถูก", english: "cheap" }],
        slot: { romanized: "thuuk", script: "ถูก", english: "cheap" },
        example: { thai: "ซื้อที่นี่ดีกว่า ร้านนี้ถูกกว่า", romanized: "Súue thîi-nîi dii gwàa, ráan níi thuuk gwàa", english: "Better buy here; this shop is cheaper" } },
      { romanized: "Hông níi yài gwàa hông nán", script: "ห้องนี้ใหญ่กว่าห้องนั้น", english: "This room is bigger than that room",
        slottable: [{ romanized: "yài", script: "ใหญ่", english: "big" }],
        slot: { romanized: "yài", script: "ใหญ่", english: "big" },
        example: { thai: "ห้องนี้ใหญ่กว่า แต่แพงกว่า", romanized: "Hông níi yài gwàa, dtàae phaeng gwàa", english: "This room is bigger, but more expensive" } },
      { romanized: "An-níi ngâai gwàa an-nán", script: "อันนี้ง่ายกว่าอันนั้น", english: "This one is easier than that one",
        slottable: [{ romanized: "ngâai", script: "ง่าย", english: "easy" }],
        slot: { romanized: "ngâai", script: "ง่าย", english: "easy" },
        example: { thai: "บทเรียนนี้ง่ายกว่าบทที่แล้ว", romanized: "Bòt-rian níi ngâai gwàa bòt thîi-láew", english: "This lesson is easier than the last one" } },
      { romanized: "Thaang níi glâi gwàa thaang nán", script: "ทางนี้ใกล้กว่าทางนั้น", english: "This way is closer than that way",
        slottable: [{ romanized: "glâi", script: "ใกล้", english: "near / close" }],
        slot: { romanized: "glâi", script: "ใกล้", english: "near / close" },
        example: { thai: "ไปทางนี้ดีกว่า ทางนี้ใกล้กว่า", romanized: "Pai thaang níi dii gwàa, thaang níi glâi gwàa", english: "Better go this way; this way is closer" } },
      { romanized: "Phûut cháa gwàa níi", script: "พูดช้ากว่านี้", english: "Speak slower than this",
        slottable: [{ romanized: "cháa", script: "ช้า", english: "slow" }],
        slot: { romanized: "cháa", script: "ช้า", english: "slow" },
        example: { thai: "ขอโทษครับ พูดช้ากว่านี้ได้ไหม?", romanized: "Khǎw-thôot khráp, phûut cháa gwàa níi dâai mǎi?", english: "Sorry, can you speak slower than this?" } }
    ]
  },

  // ─── 42. Pattern: Today / Yesterday / Tomorrow ___ (Tier 3 — Daily Interaction) ───
  {
    id: "time-marker", emoji: "🕐", label: "Today / Yesterday / Tomorrow ___", type: "pattern",
    frame: {
      romanized: "[time word] + ___",
      script: "[time word] + ___",
      english: "[Time word], [statement]",
      explanation: "Time markers go at the START in Thai, before the rest of the sentence."
    },
    pairs: [
      { romanized: "Wan-níi fǒn-dtòk", script: "วันนี้ฝนตก", english: "Today it's raining",
        slottable: [{ romanized: "fǒn-dtòk", script: "ฝนตก", english: "it's raining" }],
        slot: { romanized: "fǒn-dtòk", script: "ฝนตก", english: "it's raining" },
        example: { thai: "วันนี้ฝนตก อย่าลืมร่มนะ", romanized: "Wan-níi fǒn-dtòk, yàa luem rôm ná", english: "It's raining today; don't forget an umbrella" } },
      { romanized: "Phrûng-níi chǎn jà-doen-thaang", script: "พรุ่งนี้ฉันจะเดินทาง", english: "Tomorrow I'm traveling",
        slottable: [{ romanized: "chǎn-jà-doen-thaang", script: "ฉันจะเดินทาง", english: "I'm traveling" }],
        slot: { romanized: "chǎn-jà-doen-thaang", script: "ฉันจะเดินทาง", english: "I'm traveling" },
        example: { thai: "พรุ่งนี้ฉันจะเดินทางไปเชียงใหม่", romanized: "Phrûng-níi chǎn jà doen-thaang pai Chiang-mài", english: "Tomorrow I'm traveling to Chiang Mai" } },
      { romanized: "Mêua-waan gin aa-hǎan-Thai", script: "เมื่อวานกินอาหารไทย", english: "Yesterday I ate Thai food",
        slottable: [{ romanized: "gin-aa-hǎan-Thai", script: "กินอาหารไทย", english: "ate Thai food" }],
        slot: { romanized: "gin-aa-hǎan-Thai", script: "กินอาหารไทย", english: "ate Thai food" },
        example: { thai: "เมื่อวานกินอาหารไทยกับเพื่อน", romanized: "Mêua-waan gin aa-hǎan-Thai gàp phûean", english: "Yesterday I ate Thai food with a friend" } },
      { romanized: "Dtawn-cháo gin gaa-fae", script: "ตอนเช้ากินกาแฟ", english: "In the morning I drink coffee",
        slottable: [{ romanized: "gin-gaa-fae", script: "กินกาแฟ", english: "drink coffee" }],
        slot: { romanized: "gin-gaa-fae", script: "กินกาแฟ", english: "drink coffee" },
        example: { thai: "ตอนเช้าผมกินกาแฟก่อนทำงาน", romanized: "Dtawn-cháo phǒm gin gaa-fae gàwn tham-ngaan", english: "In the morning I drink coffee before work" } },
      { romanized: "Dtawn-yen wîng", script: "ตอนเย็นวิ่ง", english: "In the evening I run",
        slottable: [{ romanized: "wîng", script: "วิ่ง", english: "run" }],
        slot: { romanized: "wîng", script: "วิ่ง", english: "run" },
        example: { thai: "ตอนเย็นชอบวิ่งที่สวน", romanized: "Dtawn-yen chôp wîng thîi sǔan", english: "In the evening I like running at the park" } },
      { romanized: "Khuen-níi jà-nawn-reo", script: "คืนนี้จะนอนเร็ว", english: "Tonight I'll sleep early",
        slottable: [{ romanized: "jà-nawn-reo", script: "จะนอนเร็ว", english: "will sleep early" }],
        slot: { romanized: "jà-nawn-reo", script: "จะนอนเร็ว", english: "will sleep early" },
        example: { thai: "คืนนี้จะนอนเร็ว พรุ่งนี้ต้องตื่นเช้า", romanized: "Khuen-níi jà nawn reo, phrûng-níi tông dtèun cháo", english: "Tonight I'll sleep early; tomorrow I have to wake up early" } },
      { romanized: "Aa-thít-nâa tham-ngaan", script: "อาทิตย์หน้าทำงาน", english: "Next week I work",
        slottable: [{ romanized: "tham-ngaan", script: "ทำงาน", english: "work" }],
        slot: { romanized: "tham-ngaan", script: "ทำงาน", english: "work" },
        example: { thai: "อาทิตย์หน้าทำงานทุกวัน", romanized: "Aa-thít-nâa tham-ngaan thúk-wan", english: "Next week I work every day" } },
      { romanized: "Wan-Sǎo pai-thîao", script: "วันเสาร์ไปเที่ยว", english: "On Saturday I'm going out",
        slottable: [{ romanized: "pai-thîao", script: "ไปเที่ยว", english: "go out / travel" }],
        slot: { romanized: "pai-thîao", script: "ไปเที่ยว", english: "go out / travel" },
        example: { thai: "วันเสาร์ไปเที่ยวกับเพื่อน", romanized: "Wan-Sǎo pai-thîao gàp phûean", english: "On Saturday I'm going out with friends" } },
      { romanized: "Dtawn-bàai mii bprà-chum", script: "ตอนบ่ายมีประชุม", english: "In the afternoon I have a meeting",
        slottable: [{ romanized: "mii-bprà-chum", script: "มีประชุม", english: "have a meeting" }],
        slot: { romanized: "mii-bprà-chum", script: "มีประชุม", english: "have a meeting" },
        example: { thai: "ตอนบ่ายมีประชุม เลยไม่ว่าง", romanized: "Dtawn-bàai mii bprà-chum, loei mâi wâang", english: "In the afternoon I have a meeting, so I'm not free" } },
      { romanized: "Bpii-nâa yàak-rian-phaa-sǎa-Thai", script: "ปีหน้าอยากเรียนภาษาไทย", english: "Next year I want to learn Thai",
        slottable: [{ romanized: "yàak-rian-phaa-sǎa-Thai", script: "อยากเรียนภาษาไทย", english: "want to learn Thai" }],
        slot: { romanized: "yàak-rian-phaa-sǎa-Thai", script: "อยากเรียนภาษาไทย", english: "want to learn Thai" },
        example: { thai: "ปีหน้าอยากเรียนภาษาไทยจริงจัง", romanized: "Bpii-nâa yàak rian phaa-sǎa-Thai jing-jang", english: "Next year I want to study Thai seriously" } }
    ]
  },

  // ─── 43. Pattern: A Little / A Bit (Tier 4 — Refinement) ───
  {
    id: "soften", emoji: "🌸", label: "A Little / A Bit", type: "pattern",
    frame: {
      romanized: "___ + nòi",
      script: "___ + หน่อย",
      english: "A bit ___ / a little ___",
      explanation: "หน่อย (nòi) softens commands and requests. Sounds politer than the bare verb — essential for not sounding rude in Thai."
    },
    pairs: [
      { romanized: "Cháa nòi", script: "ช้าหน่อย", english: "A little slower",
        slottable: [{ romanized: "cháa", script: "ช้า", english: "slow" }],
        slot: { romanized: "cháa", script: "ช้า", english: "slow" },
        example: { thai: "ขับช้าหน่อยได้ไหมครับ", romanized: "Khàp cháa nòi dâai mǎi khráp?", english: "Could you drive a little slower?" } },
      { romanized: "Phèt-náwy nòi", script: "เผ็ดน้อยหน่อย", english: "A little less spicy",
        slottable: [{ romanized: "phèt-náwy", script: "เผ็ดน้อย", english: "less spicy" }],
        slot: { romanized: "phèt-náwy", script: "เผ็ดน้อย", english: "less spicy" },
        example: { thai: "ขอเผ็ดน้อยหน่อยนะครับ", romanized: "Khǎw phèt-náwy nòi ná khráp", english: "Please make it a little less spicy" } },
      { romanized: "Raw nòi", script: "รอหน่อย", english: "Wait a moment",
        slottable: [{ romanized: "raw", script: "รอ", english: "wait" }],
        slot: { romanized: "raw", script: "รอ", english: "wait" },
        example: { thai: "รอหน่อยนะ เดี๋ยวมา", romanized: "Raw nòi ná, dǐao maa", english: "Wait a sec, I'll be right back" } },
      { romanized: "Lót nòi", script: "ลดหน่อย", english: "Reduce it a bit",
        slottable: [{ romanized: "lót", script: "ลด", english: "reduce / lower" }],
        slot: { romanized: "lót", script: "ลด", english: "reduce / lower" },
        example: { thai: "ราคาแพงไป ลดหน่อยได้ไหม?", romanized: "Raa-khaa phaeng bpai, lót nòi dâai mǎi?", english: "The price is too high; can you lower it a bit?" } },
      { romanized: "Phûut-dang nòi", script: "พูดดังหน่อย", english: "Speak up a bit",
        slottable: [{ romanized: "phûut-dang", script: "พูดดัง", english: "speak loudly" }],
        slot: { romanized: "phûut-dang", script: "พูดดัง", english: "speak loudly" },
        example: { thai: "ขอโทษครับ พูดดังหน่อยได้ไหม?", romanized: "Khǎw-thôot khráp, phûut-dang nòi dâai mǎi?", english: "Sorry, could you speak up a bit?" } },
      { romanized: "Duu nòi", script: "ดูหน่อย", english: "Take a look",
        slottable: [{ romanized: "duu", script: "ดู", english: "look / see" }],
        slot: { romanized: "duu", script: "ดู", english: "look / see" },
        example: { thai: "ช่วยดูหน่อย อันนี้ถูกไหม?", romanized: "Chûai duu nòi, an-níi thùuk mǎi?", english: "Please take a look; is this correct?" } },
      { romanized: "Khǎw-náam nòi", script: "ขอน้ำหน่อย", english: "Can I have some water?",
        slottable: [{ romanized: "khǎw-náam", script: "ขอน้ำ", english: "ask for water" }],
        slot: { romanized: "khǎw-náam", script: "ขอน้ำ", english: "ask for water" },
        example: { thai: "ขอน้ำหน่อยครับ ร้อนมาก", romanized: "Khǎw-náam nòi khráp, rón mâak", english: "Can I have some water? It's really hot" } },
      { romanized: "Maa-nîi nòi", script: "มานี่หน่อย", english: "Come here a sec",
        slottable: [{ romanized: "maa-nîi", script: "มานี่", english: "come here" }],
        slot: { romanized: "maa-nîi", script: "มานี่", english: "come here" },
        example: { thai: "มานี่หน่อย มีอะไรให้ดู", romanized: "Maa-nîi nòi, mii à-rai hâi duu", english: "Come here a sec, I have something to show you" } },
      { romanized: "Fang nòi", script: "ฟังหน่อย", english: "Listen for a second",
        slottable: [{ romanized: "fang", script: "ฟัง", english: "listen" }],
        slot: { romanized: "fang", script: "ฟัง", english: "listen" },
        example: { thai: "ฟังหน่อย เรื่องนี้สำคัญ", romanized: "Fang nòi, rûueang níi sǎm-khan", english: "Listen for a second, this is important" } },
      { romanized: "Chûai nòi", script: "ช่วยหน่อย", english: "Help a bit / please help",
        slottable: [{ romanized: "chûai", script: "ช่วย", english: "help" }],
        slot: { romanized: "chûai", script: "ช่วย", english: "help" },
        example: { thai: "ช่วยหน่อยได้ไหม ผมหาโรงแรมไม่เจอ", romanized: "Chûai nòi dâai mǎi, phǒm hǎa roong-raem mâi jur", english: "Could you help? I can't find the hotel" } }
    ]
  },

  // ─── 44. Pattern: Already / Done (Tier 4 — Refinement) ───
  {
    id: "already-done", emoji: "✅", label: "Already / Done", type: "pattern",
    frame: {
      romanized: "___ + láew",
      script: "___ + แล้ว",
      english: "Already ___ / have ___",
      explanation: "แล้ว (láew) marks completion — like English perfect tense or 'already'. Used constantly in spoken Thai."
    },
    pairs: [
      { romanized: "Gin láew", script: "กินแล้ว", english: "Already eaten",
        slottable: [{ romanized: "gin", script: "กิน", english: "eat" }],
        slot: { romanized: "gin", script: "กิน", english: "eat" },
        example: { thai: "กินข้าวแล้ว ยังไม่หิว", romanized: "Gin khâao láew, yang mâi hǐw", english: "I've eaten already, I'm not hungry yet" } },
      { romanized: "Pai láew", script: "ไปแล้ว", english: "Already gone",
        slottable: [{ romanized: "pai", script: "ไป", english: "go" }],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "เขาไปแล้ว เจอกันพรุ่งนี้", romanized: "Khǎo pai láew, jur-gan phrûng-níi", english: "They already left; see you tomorrow" } },
      { romanized: "Tham láew", script: "ทำแล้ว", english: "Already done",
        slottable: [{ romanized: "tham", script: "ทำ", english: "do / make" }],
        slot: { romanized: "tham", script: "ทำ", english: "do / make" },
        example: { thai: "งานนี้ทำแล้วครับ", romanized: "Ngaan níi tham láew khráp", english: "This task is already done" } },
      { romanized: "Rúu láew", script: "รู้แล้ว", english: "Already know",
        slottable: [{ romanized: "rúu", script: "รู้", english: "know" }],
        slot: { romanized: "rúu", script: "รู้", english: "know" },
        example: { thai: "รู้แล้ว ไม่ต้องบอกอีก", romanized: "Rúu láew, mâi tông bàwk ìik", english: "I know already, no need to tell me again" } },
      { romanized: "Thǔeng láew", script: "ถึงแล้ว", english: "Already arrived",
        slottable: [{ romanized: "thǔeng", script: "ถึง", english: "arrive" }],
        slot: { romanized: "thǔeng", script: "ถึง", english: "arrive" },
        example: { thai: "ถึงแล้ว รออยู่ข้างหน้า", romanized: "Thǔeng láew, raw yùu khâang-nâa", english: "I've arrived; I'm waiting out front" } },
      { romanized: "Sèt láew", script: "เสร็จแล้ว", english: "Already finished",
        slottable: [{ romanized: "sèt", script: "เสร็จ", english: "finish" }],
        slot: { romanized: "sèt", script: "เสร็จ", english: "finish" },
        example: { thai: "ประชุมเสร็จแล้ว ไปกินข้าวกัน", romanized: "Bprà-chum sèt láew, pai gin khâao gan", english: "The meeting is finished; let's go eat" } },
      { romanized: "Súue láew", script: "ซื้อแล้ว", english: "Already bought",
        slottable: [{ romanized: "súue", script: "ซื้อ", english: "buy" }],
        slot: { romanized: "súue", script: "ซื้อ", english: "buy" },
        example: { thai: "ซื้อตั๋วแล้ว ไม่ต้องห่วง", romanized: "Súue dtǔa láew, mâi tông hùang", english: "I bought the ticket already, don't worry" } },
      { romanized: "Duu láew", script: "ดูแล้ว", english: "Already watched / seen",
        slottable: [{ romanized: "duu", script: "ดู", english: "watch / see" }],
        slot: { romanized: "duu", script: "ดู", english: "watch / see" },
        example: { thai: "หนังเรื่องนี้ดูแล้ว สนุกมาก", romanized: "Nǎng rûueang níi duu láew, sà-nùk mâak", english: "I've seen this movie already; it's really fun" } },
      { romanized: "Hǐw láew", script: "หิวแล้ว", english: "Hungry now",
        slottable: [{ romanized: "hǐw", script: "หิว", english: "hungry" }],
        slot: { romanized: "hǐw", script: "หิว", english: "hungry" },
        example: { thai: "หิวแล้ว ไปกินข้าวกันไหม?", romanized: "Hǐw láew, pai gin khâao gan mǎi?", english: "I'm hungry now; want to go eat?" } },
      { romanized: "Khâo-jai láew", script: "เข้าใจแล้ว", english: "Understand now",
        slottable: [{ romanized: "khâo-jai", script: "เข้าใจ", english: "understand" }],
        slot: { romanized: "khâo-jai", script: "เข้าใจ", english: "understand" },
        example: { thai: "อธิบายดีมาก เข้าใจแล้ว", romanized: "À-thí-baai dii mâak, khâo-jai láew", english: "You explained it well; I understand now" } }
    ]
  },

  // ─── 45. Pattern: Haven't ___ Yet (Tier 4 — Refinement) ───
  {
    id: "not-yet", emoji: "⏳", label: "Haven't ___ Yet", type: "pattern",
    frame: {
      romanized: "yang mâi + ___",
      script: "ยังไม่ + ___",
      english: "Haven't ___ yet",
      explanation: "ยังไม่ (yang mâi) is 'not yet' — for things intended but not yet done. Pairs perfectly with แล้ว (already)."
    },
    pairs: [
      { romanized: "Yang mâi gin", script: "ยังไม่กิน", english: "Haven't eaten yet",
        slottable: [{ romanized: "gin", script: "กิน", english: "eat" }],
        slot: { romanized: "gin", script: "กิน", english: "eat" },
        example: { thai: "ยังไม่กินข้าวเลย หิวมาก", romanized: "Yang mâi gin khâao loei, hǐw mâak", english: "I haven't eaten yet; I'm really hungry" } },
      { romanized: "Yang mâi pai", script: "ยังไม่ไป", english: "Haven't gone yet",
        slottable: [{ romanized: "pai", script: "ไป", english: "go" }],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "ยังไม่ไป รอเพื่อนอยู่", romanized: "Yang mâi pai, raw phûean yùu", english: "I haven't gone yet; I'm waiting for a friend" } },
      { romanized: "Yang mâi rúu", script: "ยังไม่รู้", english: "Don't know yet",
        slottable: [{ romanized: "rúu", script: "รู้", english: "know" }],
        slot: { romanized: "rúu", script: "รู้", english: "know" },
        example: { thai: "ยังไม่รู้ว่าจะไปไหม", romanized: "Yang mâi rúu wâa jà pai mǎi", english: "I don't know yet whether I'll go" } },
      { romanized: "Yang mâi sèt", script: "ยังไม่เสร็จ", english: "Not finished yet",
        slottable: [{ romanized: "sèt", script: "เสร็จ", english: "finish" }],
        slot: { romanized: "sèt", script: "เสร็จ", english: "finish" },
        example: { thai: "งานยังไม่เสร็จ ขอเวลาเพิ่ม", romanized: "Ngaan yang mâi sèt, khǎw wee-laa-phôem", english: "The work isn't finished yet; I need more time" } },
      { romanized: "Yang mâi khâo-jai", script: "ยังไม่เข้าใจ", english: "Don't understand yet",
        slottable: [{ romanized: "khâo-jai", script: "เข้าใจ", english: "understand" }],
        slot: { romanized: "khâo-jai", script: "เข้าใจ", english: "understand" },
        example: { thai: "ขอโทษครับ ยังไม่เข้าใจ", romanized: "Khǎw-thôot khráp, yang mâi khâo-jai", english: "Sorry, I still don't understand" } },
      { romanized: "Yang mâi nawn", script: "ยังไม่นอน", english: "Haven't slept yet",
        slottable: [{ romanized: "nawn", script: "นอน", english: "sleep" }],
        slot: { romanized: "nawn", script: "นอน", english: "sleep" },
        example: { thai: "ดึกแล้ว ทำไมยังไม่นอน?", romanized: "Dùek láew, tham-mai yang mâi nawn?", english: "It's late, why haven't you slept yet?" } },
      { romanized: "Yang mâi phróom", script: "ยังไม่พร้อม", english: "Not ready yet",
        slottable: [{ romanized: "phróom", script: "พร้อม", english: "ready" }],
        slot: { romanized: "phróom", script: "พร้อม", english: "ready" },
        example: { thai: "รอหน่อย ยังไม่พร้อม", romanized: "Raw nòi, yang mâi phróom", english: "Wait a bit, I'm not ready yet" } },
      { romanized: "Yang mâi maa", script: "ยังไม่มา", english: "Hasn't come yet",
        slottable: [{ romanized: "maa", script: "มา", english: "come" }],
        slot: { romanized: "maa", script: "มา", english: "come" },
        example: { thai: "เขายังไม่มา โทรหาไหม?", romanized: "Khǎo yang mâi maa, thoo hǎa mǎi?", english: "They haven't come yet; should we call?" } },
      { romanized: "Yang mâi dtàt-sǐn-jai", script: "ยังไม่ตัดสินใจ", english: "Haven't decided yet",
        slottable: [{ romanized: "dtàt-sǐn-jai", script: "ตัดสินใจ", english: "decide" }],
        slot: { romanized: "dtàt-sǐn-jai", script: "ตัดสินใจ", english: "decide" },
        example: { thai: "ยังไม่ตัดสินใจว่าจะซื้ออันไหน", romanized: "Yang mâi dtàt-sǐn-jai wâa jà súue an nǎi", english: "I haven't decided yet which one to buy" } },
      { romanized: "Yang mâi jàai-ngoen", script: "ยังไม่จ่ายเงิน", english: "Haven't paid yet",
        slottable: [{ romanized: "jàai-ngoen", script: "จ่ายเงิน", english: "pay" }],
        slot: { romanized: "jàai-ngoen", script: "จ่ายเงิน", english: "pay" },
        example: { thai: "ยังไม่จ่ายเงิน ต้องไปที่แคชเชียร์ก่อน", romanized: "Yang mâi jàai-ngoen, tông pai thîi khaet-chia gàwn", english: "I haven't paid yet; I need to go to the cashier first" } }
    ]
  },

  // ─── 46. Pattern: Will ___ (Tier 4 — Refinement) ───
  {
    id: "future", emoji: "🔮", label: "Will ___", type: "pattern",
    frame: {
      romanized: "jà + ___",
      script: "จะ + ___",
      english: "Will ___ / going to ___",
      explanation: "จะ (jà) before a verb signals future action. Short, simple, used constantly."
    },
    pairs: [
      { romanized: "Jà pai", script: "จะไป", english: "Will go",
        slottable: [{ romanized: "pai", script: "ไป", english: "go" }],
        slot: { romanized: "pai", script: "ไป", english: "go" },
        example: { thai: "พรุ่งนี้จะไปเชียงใหม่", romanized: "Phrûng-níi jà pai Chiang-mài", english: "Tomorrow I'll go to Chiang Mai" } },
      { romanized: "Jà gin", script: "จะกิน", english: "Will eat",
        slottable: [{ romanized: "gin", script: "กิน", english: "eat" }],
        slot: { romanized: "gin", script: "กิน", english: "eat" },
        example: { thai: "เย็นนี้จะกินอะไรดี?", romanized: "Yen-níi jà gin à-rai dii?", english: "What should we eat this evening?" } },
      { romanized: "Jà maa", script: "จะมา", english: "Will come",
        slottable: [{ romanized: "maa", script: "มา", english: "come" }],
        slot: { romanized: "maa", script: "มา", english: "come" },
        example: { thai: "เขาจะมากี่โมง?", romanized: "Khǎo jà maa gìi moong?", english: "What time will they come?" } },
      { romanized: "Jà tham", script: "จะทำ", english: "Will do",
        slottable: [{ romanized: "tham", script: "ทำ", english: "do / make" }],
        slot: { romanized: "tham", script: "ทำ", english: "do / make" },
        example: { thai: "เดี๋ยวผมจะทำให้", romanized: "Dǐao phǒm jà tham hâi", english: "I'll do it for you in a moment" } },
      { romanized: "Jà súue", script: "จะซื้อ", english: "Will buy",
        slottable: [{ romanized: "súue", script: "ซื้อ", english: "buy" }],
        slot: { romanized: "súue", script: "ซื้อ", english: "buy" },
        example: { thai: "ถ้าถูกลงจะซื้อ", romanized: "Thâa thùuk long jà súue", english: "If it gets cheaper, I'll buy it" } },
      { romanized: "Jà glàp", script: "จะกลับ", english: "Will return",
        slottable: [{ romanized: "glàp", script: "กลับ", english: "return / go back" }],
        slot: { romanized: "glàp", script: "กลับ", english: "return / go back" },
        example: { thai: "คืนนี้จะกลับบ้านดึก", romanized: "Khuen-níi jà glàp bâan dùek", english: "Tonight I'll get home late" } },
      { romanized: "Jà thoo", script: "จะโทร", english: "Will call",
        slottable: [{ romanized: "thoo", script: "โทร", english: "call" }],
        slot: { romanized: "thoo", script: "โทร", english: "call" },
        example: { thai: "ถึงแล้วจะโทรหานะ", romanized: "Thǔeng láew jà thoo hǎa ná", english: "I'll call you when I arrive" } },
      { romanized: "Jà laawng", script: "จะลอง", english: "Will try",
        slottable: [{ romanized: "laawng", script: "ลอง", english: "try" }],
        slot: { romanized: "laawng", script: "ลอง", english: "try" },
        example: { thai: "อันนี้น่าสนใจ จะลองดู", romanized: "An-níi nâa-sǒn-jai, jà laawng duu", english: "This looks interesting; I'll try it" } },
      { romanized: "Jà khít", script: "จะคิด", english: "Will think",
        slottable: [{ romanized: "khít", script: "คิด", english: "think" }],
        slot: { romanized: "khít", script: "คิด", english: "think" },
        example: { thai: "ขอคิดก่อน แล้วจะบอก", romanized: "Khǎw khít gàwn, láew jà bàwk", english: "Let me think first, then I'll tell you" } },
      { romanized: "Jà rian", script: "จะเรียน", english: "Will study",
        slottable: [{ romanized: "rian", script: "เรียน", english: "study / learn" }],
        slot: { romanized: "rian", script: "เรียน", english: "study / learn" },
        example: { thai: "ปีหน้าจะเรียนภาษาไทยจริงจัง", romanized: "Bpii-nâa jà rian phaa-sǎa-Thai jing-jang", english: "Next year I'll study Thai seriously" } }
    ]
  },

  // ─── 47. Pattern: With ___ (Tier 4 — Refinement) ───
  {
    id: "with-someone", emoji: "👥", label: "With ___", type: "pattern",
    frame: {
      romanized: "gàp + ___",
      script: "กับ + ___",
      english: "with ___",
      explanation: "กับ (gàp) means 'with' or 'and'. Used to mention who you're with — natural in conversation about plans and relationships."
    },
    pairs: [
      { romanized: "Gàp phûean", script: "กับเพื่อน", english: "With friends",
        slottable: [{ romanized: "phûean", script: "เพื่อน", english: "friends" }],
        slot: { romanized: "phûean", script: "เพื่อน", english: "friends" },
        example: { thai: "คืนนี้ไปกินข้าวกับเพื่อน", romanized: "Khuen-níi pai gin khâao gàp phûean", english: "Tonight I'm going to eat with friends" } },
      { romanized: "Gàp khrâwp-khrua", script: "กับครอบครัว", english: "With family",
        slottable: [{ romanized: "khrâwp-khrua", script: "ครอบครัว", english: "family" }],
        slot: { romanized: "khrâwp-khrua", script: "ครอบครัว", english: "family" },
        example: { thai: "วันอาทิตย์กินข้าวกับครอบครัว", romanized: "Wan Aa-thít gin khâao gàp khrâwp-khrua", english: "On Sunday I eat with family" } },
      { romanized: "Gàp mâae", script: "กับแม่", english: "With mom",
        slottable: [{ romanized: "mâae", script: "แม่", english: "mom" }],
        slot: { romanized: "mâae", script: "แม่", english: "mom" },
        example: { thai: "เมื่อวานคุยกับแม่ตั้งนาน", romanized: "Mêua-waan khui gàp mâae dtâng-naan", english: "Yesterday I talked with my mom for a long time" } },
      { romanized: "Gàp hǔa-nâa", script: "กับหัวหน้า", english: "With the boss",
        slottable: [{ romanized: "hǔa-nâa", script: "หัวหน้า", english: "boss" }],
        slot: { romanized: "hǔa-nâa", script: "หัวหน้า", english: "boss" },
        example: { thai: "พรุ่งนี้ต้องทำงานกับหัวหน้า", romanized: "Phrûng-níi tông tham-ngaan gàp hǔa-nâa", english: "Tomorrow I have to work with the boss" } },
      { romanized: "Gàp faen", script: "กับแฟน", english: "With partner",
        slottable: [{ romanized: "faen", script: "แฟน", english: "partner / boyfriend / girlfriend" }],
        slot: { romanized: "faen", script: "แฟน", english: "partner / boyfriend / girlfriend" },
        example: { thai: "เดือนหน้าจะไปเที่ยวกับแฟน", romanized: "Deuan-nâa jà pai thîao gàp faen", english: "Next month I'm traveling with my partner" } },
      { romanized: "Gàp khruu", script: "กับครู", english: "With the teacher",
        slottable: [{ romanized: "khruu", script: "ครู", english: "teacher" }],
        slot: { romanized: "khruu", script: "ครู", english: "teacher" },
        example: { thai: "วันนี้เรียนภาษาไทยกับครูใหม่", romanized: "Wan-níi rian phaa-sǎa-Thai gàp khruu mài", english: "Today I'm studying Thai with a new teacher" } },
      { romanized: "Gàp náwng", script: "กับน้อง", english: "With younger sibling",
        slottable: [{ romanized: "náwng", script: "น้อง", english: "younger sibling" }],
        slot: { romanized: "náwng", script: "น้อง", english: "younger sibling" },
        example: { thai: "นั่งกับน้องตรงนี้ได้ไหม?", romanized: "Nâng gàp náwng dtrong-níi dâai mǎi?", english: "Can I sit here with my younger sibling?" } },
      { romanized: "Gàp phâw", script: "กับพ่อ", english: "With dad",
        slottable: [{ romanized: "phâw", script: "พ่อ", english: "dad" }],
        slot: { romanized: "phâw", script: "พ่อ", english: "dad" },
        example: { thai: "เมื่อคืนคุยกับพ่อเรื่องงาน", romanized: "Mêua-khuen khui gàp phâw rûueang-ngaan", english: "Last night I talked with dad about work" } },
      { romanized: "Gàp thii-m", script: "กับทีม", english: "With the team",
        slottable: [{ romanized: "thii-m", script: "ทีม", english: "team" }],
        slot: { romanized: "thii-m", script: "ทีม", english: "team" },
        example: { thai: "บ่ายนี้ไปประชุมกับทีม", romanized: "Bàai níi pai bprà-chum gàp thii-m", english: "This afternoon I'm going to a meeting with the team" } },
      { romanized: "Gàp lûuk-kháa", script: "กับลูกค้า", english: "With a client",
        slottable: [{ romanized: "lûuk-kháa", script: "ลูกค้า", english: "client / customer" }],
        slot: { romanized: "lûuk-kháa", script: "ลูกค้า", english: "client / customer" },
        example: { thai: "เที่ยงนี้กินข้าวกับลูกค้า", romanized: "Thîiang níi gin khâao gàp lûuk-kháa", english: "At noon today I'm eating with a client" } }
    ]
  },

  // ─── 48. Pattern: ..., Right? (Tier 5 — Natural Thai) ───
  {
    id: "tag-question", emoji: "🤔", label: "..., Right?", type: "pattern",
    frame: {
      romanized: "___ + châi mǎi?",
      script: "___ + ใช่ไหม?",
      english: "..., right? / isn't it?",
      explanation: "Add ใช่ไหม (châi mǎi) to seek agreement — like English 'right?' or 'isn't it?'. Softens statements and invites confirmation."
    },
    pairs: [
      { romanized: "À-ròi châi mǎi?", script: "อร่อยใช่ไหม", english: "It's tasty, right?",
        slottable: [{ romanized: "à-ròi", script: "อร่อย", english: "delicious / tasty" }],
        slot: { romanized: "à-ròi", script: "อร่อย", english: "delicious / tasty" },
        example: { thai: "ร้านนี้อร่อยใช่ไหม", romanized: "Ráan níi à-ròi châi mǎi?", english: "This restaurant is tasty, right?" } },
      { romanized: "Dii châi mǎi?", script: "ดีใช่ไหม", english: "It's good, right?",
        slottable: [{ romanized: "dii", script: "ดี", english: "good" }],
        slot: { romanized: "dii", script: "ดี", english: "good" },
        example: { thai: "หนังเรื่องนี้ดีใช่ไหม", romanized: "Nǎng rûueang níi dii châi mǎi?", english: "This movie is good, right?" } },
      { romanized: "Phaeng châi mǎi?", script: "แพงใช่ไหม", english: "It's expensive, right?",
        slottable: [{ romanized: "phaeng", script: "แพง", english: "expensive" }],
        slot: { romanized: "phaeng", script: "แพง", english: "expensive" },
        example: { thai: "อันนี้แพงใช่ไหม", romanized: "An-níi phaeng châi mǎi?", english: "This one is expensive, right?" } },
      { romanized: "Rúu châi mǎi?", script: "รู้ใช่ไหม", english: "You know, right?",
        slottable: [{ romanized: "rúu", script: "รู้", english: "know" }],
        slot: { romanized: "rúu", script: "รู้", english: "know" },
        example: { thai: "พรุ่งนี้เริ่มเก้าโมง รู้ใช่ไหม", romanized: "Phrûng-níi rôem gâao moong, rúu châi mǎi?", english: "Tomorrow starts at nine; you know, right?" } },
      { romanized: "Khǎo jà pai châi mǎi?", script: "เขาจะไปใช่ไหม", english: "He/she is going, right?",
        slottable: [{ romanized: "khǎo jà pai", script: "เขาจะไป", english: "he/she will go" }],
        slot: { romanized: "khǎo jà pai", script: "เขาจะไป", english: "he/she will go" },
        example: { thai: "งานคืนนี้เขาจะไปใช่ไหม", romanized: "Ngaan khuen-níi khǎo jà pai châi mǎi?", english: "He's going to tonight's event, right?" } },
      { romanized: "Châi châi mǎi?", script: "ใช่ใช่ไหม", english: "That's right, isn't it?",
        slottable: [{ romanized: "châi", script: "ใช่", english: "yes / right" }],
        slot: { romanized: "châi", script: "ใช่", english: "yes / right" },
        example: { thai: "ทางนี้ใช่ใช่ไหม", romanized: "Thaang níi châi châi mǎi?", english: "This is the right way, isn't it?" } },
      { romanized: "Thùuk châi mǎi?", script: "ถูกใช่ไหม", english: "Correct, right?",
        slottable: [{ romanized: "thùuk", script: "ถูก", english: "correct" }],
        slot: { romanized: "thùuk", script: "ถูก", english: "correct" },
        example: { thai: "คำตอบนี้ถูกใช่ไหม", romanized: "Kham-dtàwp níi thùuk châi mǎi?", english: "This answer is correct, right?" } },
      { romanized: "Mâi yâak châi mǎi?", script: "ไม่ยากใช่ไหม", english: "It's not hard, right?",
        slottable: [{ romanized: "mâi yâak", script: "ไม่ยาก", english: "not hard" }],
        slot: { romanized: "mâi yâak", script: "ไม่ยาก", english: "not hard" },
        example: { thai: "บทนี้ไม่ยากใช่ไหม", romanized: "Bòt níi mâi yâak châi mǎi?", english: "This lesson isn't hard, right?" } },
      { romanized: "Jà maa châi mǎi?", script: "จะมาใช่ไหม", english: "You're coming, right?",
        slottable: [{ romanized: "jà maa", script: "จะมา", english: "will come" }],
        slot: { romanized: "jà maa", script: "จะมา", english: "will come" },
        example: { thai: "เย็นนี้จะมาใช่ไหม", romanized: "Yen-níi jà maa châi mǎi?", english: "You're coming this evening, right?" } },
      { romanized: "Khâo-jai châi mǎi?", script: "เข้าใจใช่ไหม", english: "You understand, right?",
        slottable: [{ romanized: "khâo-jai", script: "เข้าใจ", english: "understand" }],
        slot: { romanized: "khâo-jai", script: "เข้าใจ", english: "understand" },
        example: { thai: "อธิบายแบบนี้เข้าใจใช่ไหม", romanized: "À-thí-baai bàep níi khâo-jai châi mǎi?", english: "Explained like this, you understand, right?" } }
    ]
  },

  // ─── 49. Pattern: Very / Too (Tier 5 — Natural Thai) ───
  {
    id: "very-too", emoji: "💥", label: "Very / Too", type: "pattern",
    frame: {
      romanized: "___ + mâak (very) / ___ + gəən-pai (too)",
      script: "___ + มาก / ___ + เกินไป",
      english: "very ___ / too ___",
      explanation: "มาก (mâak) means 'very'. เกินไป (gəən-pai) means 'too much / excessively'. Both go AFTER the adjective. The distinction matters — 'very expensive' vs 'too expensive' are different reactions."
    },
    pairs: [
      { romanized: "Phaeng mâak", script: "แพงมาก", english: "Very expensive",
        slottable: [{ romanized: "phaeng", script: "แพง", english: "expensive" }],
        slot: { romanized: "phaeng", script: "แพง", english: "expensive" },
        example: { thai: "โรงแรมนี้แพงมาก", romanized: "Roong-raem níi phaeng mâak", english: "This hotel is very expensive" } },
      { romanized: "Phaeng gəən-pai", script: "แพงเกินไป", english: "Too expensive",
        slottable: [{ romanized: "phaeng", script: "แพง", english: "expensive" }],
        slot: { romanized: "phaeng", script: "แพง", english: "expensive" },
        example: { thai: "อันนี้แพงเกินไป ไม่เอา", romanized: "An-níi phaeng gəən-pai, mâi ao", english: "This is too expensive; I don't want it" } },
      { romanized: "Rón mâak", script: "ร้อนมาก", english: "Very hot",
        slottable: [{ romanized: "rón", script: "ร้อน", english: "hot" }],
        slot: { romanized: "rón", script: "ร้อน", english: "hot" },
        example: { thai: "วันนี้อากาศร้อนมาก", romanized: "Wan-níi aa-gàat rón mâak", english: "The weather is very hot today" } },
      { romanized: "Rón gəən-pai", script: "ร้อนเกินไป", english: "Too hot",
        slottable: [{ romanized: "rón", script: "ร้อน", english: "hot" }],
        slot: { romanized: "rón", script: "ร้อน", english: "hot" },
        example: { thai: "น้ำร้อนเกินไป ดื่มไม่ได้", romanized: "Náam rón gəən-pai, dùuem mâi dâai", english: "The water is too hot; I can't drink it" } },
      { romanized: "À-ròi mâak", script: "อร่อยมาก", english: "Very delicious",
        slottable: [{ romanized: "à-ròi", script: "อร่อย", english: "delicious" }],
        slot: { romanized: "à-ròi", script: "อร่อย", english: "delicious" },
        example: { thai: "ผัดไทยร้านนี้อร่อยมาก", romanized: "Phàt-Thai ráan níi à-ròi mâak", english: "The pad thai at this shop is really delicious" } },
      { romanized: "Glai gəən-pai", script: "ไกลเกินไป", english: "Too far",
        slottable: [{ romanized: "glai", script: "ไกล", english: "far" }],
        slot: { romanized: "glai", script: "ไกล", english: "far" },
        example: { thai: "เดินไปไม่ไหว ไกลเกินไป", romanized: "Doen pai mâi wǎi, glai gəən-pai", english: "I can't walk there; it's too far" } },
      { romanized: "Dii mâak", script: "ดีมาก", english: "Very good",
        slottable: [{ romanized: "dii", script: "ดี", english: "good" }],
        slot: { romanized: "dii", script: "ดี", english: "good" },
        example: { thai: "วันนี้คุณพูดไทยดีมาก", romanized: "Wan-níi khun phûut Thai dii mâak", english: "Today you spoke Thai very well" } },
      { romanized: "Phèt gəən-pai", script: "เผ็ดเกินไป", english: "Too spicy",
        slottable: [{ romanized: "phèt", script: "เผ็ด", english: "spicy" }],
        slot: { romanized: "phèt", script: "เผ็ด", english: "spicy" },
        example: { thai: "ส้มตำจานนี้เผ็ดเกินไป", romanized: "Sôm-dtam jaan níi phèt gəən-pai", english: "This plate of som tam is too spicy" } },
      { romanized: "Sǔuai mâak", script: "สวยมาก", english: "Very beautiful",
        slottable: [{ romanized: "sǔuai", script: "สวย", english: "beautiful" }],
        slot: { romanized: "sǔuai", script: "สวย", english: "beautiful" },
        example: { thai: "วิวตรงนี้สวยมาก", romanized: "Wiw dtrong-níi sǔuai mâak", english: "The view here is very beautiful" } },
      { romanized: "Dùek gəən-pai", script: "ดึกเกินไป", english: "Too late at night",
        slottable: [{ romanized: "dùek", script: "ดึก", english: "late at night" }],
        slot: { romanized: "dùek", script: "ดึก", english: "late at night" },
        example: { thai: "ตอนนี้ดึกเกินไป โทรพรุ่งนี้ดีกว่า", romanized: "Dtawn-níi dùek gəən-pai, thoo phrûng-níi dii gwàa", english: "It's too late now; better to call tomorrow" } }
    ]
  },

  // ─── 50. Pattern: Please ___ For Me (Tier 5 — Natural Thai) ───
  {
    id: "polite-request", emoji: "🙇", label: "Please ___ For Me", type: "pattern",
    frame: {
      romanized: "chûai + ___ + hâi nòi",
      script: "ช่วย + ___ + ให้หน่อย",
      english: "Please ___ for me",
      explanation: "Wraps a verb with ช่วย...ให้หน่อย — the deeply polite Thai construction for asking favors. The way locals ask for help in formal situations."
    },
    pairs: [
      { romanized: "Chûai phûut hâi nòi", script: "ช่วยพูดให้หน่อย", english: "Please speak for me",
        slottable: [{ romanized: "phûut", script: "พูด", english: "speak" }],
        slot: { romanized: "phûut", script: "พูด", english: "speak" },
        example: { thai: "ผมพูดไทยไม่เก่ง ช่วยพูดให้หน่อยครับ", romanized: "Phǒm phûut Thai mâi gèng, chûai phûut hâi nòi khráp", english: "I don't speak Thai well; please speak for me" } },
      { romanized: "Chûai thàai-rûup hâi nòi", script: "ช่วยถ่ายรูปให้หน่อย", english: "Please take a photo for me",
        slottable: [{ romanized: "thàai-rûup", script: "ถ่ายรูป", english: "take a photo" }],
        slot: { romanized: "thàai-rûup", script: "ถ่ายรูป", english: "take a photo" },
        example: { thai: "ช่วยถ่ายรูปให้หน่อยได้ไหมครับ", romanized: "Chûai thàai-rûup hâi nòi dâai mǎi khráp?", english: "Could you please take a photo for me?" } },
      { romanized: "Chûai à-thí-baai hâi nòi", script: "ช่วยอธิบายให้หน่อย", english: "Please explain it to me",
        slottable: [{ romanized: "à-thí-baai", script: "อธิบาย", english: "explain" }],
        slot: { romanized: "à-thí-baai", script: "อธิบาย", english: "explain" },
        example: { thai: "ตรงนี้ไม่เข้าใจ ช่วยอธิบายให้หน่อย", romanized: "Dtrong-níi mâi khâo-jai, chûai à-thí-baai hâi nòi", english: "I don't understand this part; please explain it to me" } },
      { romanized: "Chûai sòng hâi nòi", script: "ช่วยส่งให้หน่อย", english: "Please send it for me",
        slottable: [{ romanized: "sòng", script: "ส่ง", english: "send" }],
        slot: { romanized: "sòng", script: "ส่ง", english: "send" },
        example: { thai: "ไฟล์นี้ช่วยส่งให้หน่อยนะ", romanized: "Fai níi chûai sòng hâi nòi ná", english: "Please send this file for me" } },
      { romanized: "Chûai khǐian hâi nòi", script: "ช่วยเขียนให้หน่อย", english: "Please write it for me",
        slottable: [{ romanized: "khǐian", script: "เขียน", english: "write" }],
        slot: { romanized: "khǐian", script: "เขียน", english: "write" },
        example: { thai: "ชื่อภาษาไทยช่วยเขียนให้หน่อยครับ", romanized: "Chêu phaa-sǎa-Thai chûai khǐian hâi nòi khráp", english: "Please write the Thai name for me" } },
      { romanized: "Chûai rîiak tháek-sîi hâi nòi", script: "ช่วยเรียกแท็กซี่ให้หน่อย", english: "Please call a taxi for me",
        slottable: [{ romanized: "rîiak tháek-sîi", script: "เรียกแท็กซี่", english: "call a taxi" }],
        slot: { romanized: "rîiak tháek-sîi", script: "เรียกแท็กซี่", english: "call a taxi" },
        example: { thai: "ฝนตกหนัก ช่วยเรียกแท็กซี่ให้หน่อยได้ไหม", romanized: "Fǒn dtòk nàk, chûai rîiak tháek-sîi hâi nòi dâai mǎi?", english: "It's raining heavily; could you call a taxi for me?" } },
      { romanized: "Chûai bpòoet hâi nòi", script: "ช่วยเปิดให้หน่อย", english: "Please open it for me",
        slottable: [{ romanized: "bpòoet", script: "เปิด", english: "open" }],
        slot: { romanized: "bpòoet", script: "เปิด", english: "open" },
        example: { thai: "ประตูนี้เปิดยาก ช่วยเปิดให้หน่อย", romanized: "Bprà-dtuu níi bpòoet yâak, chûai bpòoet hâi nòi", english: "This door is hard to open; please open it for me" } },
      { romanized: "Chûai yók hâi nòi", script: "ช่วยยกให้หน่อย", english: "Please give me a hand lifting this",
        slottable: [{ romanized: "yók", script: "ยก", english: "lift / carry" }],
        slot: { romanized: "yók", script: "ยก", english: "lift / carry" },
        example: { thai: "กระเป๋าหนักมาก ช่วยยกให้หน่อยครับ", romanized: "Grà-bpǎo nàk mâak, chûai yók hâi nòi khráp", english: "The bag is very heavy; please give me a hand lifting it" } },
      { romanized: "Chûai raw hâi nòi", script: "ช่วยรอให้หน่อย", english: "Please wait for me",
        slottable: [{ romanized: "raw", script: "รอ", english: "wait" }],
        slot: { romanized: "raw", script: "รอ", english: "wait" },
        example: { thai: "ผมกำลังไป ช่วยรอให้หน่อย", romanized: "Phǒm gam-lang pai, chûai raw hâi nòi", english: "I'm on my way; please wait for me" } },
      { romanized: "Chûai súue hâi nòi", script: "ช่วยซื้อให้หน่อย", english: "Please buy it for me",
        slottable: [{ romanized: "súue", script: "ซื้อ", english: "buy" }],
        slot: { romanized: "súue", script: "ซื้อ", english: "buy" },
        example: { thai: "ถ้าไปเซเว่น ช่วยซื้อน้ำให้หน่อย", romanized: "Thâa pai Se-wên, chûai súue náam hâi nòi", english: "If you go to 7-Eleven, please buy water for me" } }
    ]
  }
];
