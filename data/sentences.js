/**
 * Sentence builder data — 5+ sentences per topic.
 * words[] = correct order. Builder shuffles them.
 * All romanized carry full tone diacritics.
 */
const SENTENCES = [

  // ── Days / Time Expressions ──
  { english: "Today is Monday", words: ["วันนี้", "คือ", "วันจันทร์"], romanized: "Wan-níi khue Wan-jan", requiredTopics: ["days"], difficulty: 1 },
  { english: "Tomorrow is Friday", words: ["พรุ่งนี้", "คือ", "วันศุกร์"], romanized: "Phrûng-níi khue Wan-Sùk", requiredTopics: ["days", "time-expressions"], difficulty: 1 },
  { english: "Yesterday it rained", words: ["เมื่อวาน", "ฝน", "ตก"], romanized: "Mêua-waan fǒn dtòk", requiredTopics: ["time-expressions"], difficulty: 1 },
  { english: "Saturday I relax", words: ["วันเสาร์", "ฉัน", "พักผ่อน"], romanized: "Wan Sǎo chǎn phák-phàwn", requiredTopics: ["days"], difficulty: 1 },
  { english: "This week is very busy", words: ["อาทิตย์", "นี้", "ยุ่ง", "มาก"], romanized: "Aa-thít níi yûng mâak", requiredTopics: ["time-expressions"], difficulty: 1 },
  { english: "Next week going to Chiang Mai", words: ["อาทิตย์หน้า", "ไป", "เชียงใหม่"], romanized: "Aa-thít nâa pai Chiang-mài", requiredTopics: ["time-expressions"], difficulty: 2 },

  // ── Time of Day ──
  { english: "What time is it now?", words: ["ตอนนี้", "กี่", "โมง"], romanized: "Dtawn níi gìi mohng", requiredTopics: ["time-of-day"], difficulty: 1 },
  { english: "In the morning drink coffee", words: ["ตอนเช้า", "ดื่ม", "กาแฟ"], romanized: "Dtawn cháo dèum gaa-fae", requiredTopics: ["time-of-day"], difficulty: 1 },
  { english: "Wait five minutes", words: ["รอ", "ห้า", "นาที"], romanized: "Raw hâa naa-thii", requiredTopics: ["time-of-day", "numbers"], difficulty: 1 },
  { english: "At night it's very quiet", words: ["กลางคืน", "เงียบ", "มาก"], romanized: "Glang-kheun ngîap mâak", requiredTopics: ["time-of-day"], difficulty: 1 },
  { english: "In the evening go running", words: ["ตอนเย็น", "ไป", "วิ่ง"], romanized: "Dtawn yen pai wîng", requiredTopics: ["time-of-day"], difficulty: 1 },

  // ── Months ──
  { english: "January the weather is cool", words: ["เดือน", "มกราคม", "อากาศ", "เย็น"], romanized: "Deuan Mòk-kà-raa-khom aa-gàat yen", requiredTopics: ["months-1-6"], difficulty: 2 },
  { english: "April has Songkran", words: ["เมษายน", "มี", "สงกรานต์"], romanized: "Meh-sǎa-yon mii Sǒng-graan", requiredTopics: ["months-1-6"], difficulty: 1 },
  { english: "November has Loy Krathong", words: ["พฤศจิกายน", "มี", "ลอยกระทง"], romanized: "Phruét-sà-jì-kaa-yon mii Loi-Grà-thong", requiredTopics: ["months-7-12"], difficulty: 2 },
  { english: "December is New Year", words: ["ธันวาคม", "เป็น", "ปีใหม่"], romanized: "Than-waa-khom pen Bpii-Mài", requiredTopics: ["months-7-12"], difficulty: 1 },
  { english: "This month is very hot", words: ["เดือน", "นี้", "ร้อน", "มาก"], romanized: "Deuan níi rón mâak", requiredTopics: ["months-1-6"], difficulty: 1 },

  // ── Pronouns & Questions ──
  { english: "What is your name?", words: ["คุณ", "ชื่อ", "อะไร"], romanized: "Khun chêu à-rai?", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "My name is Aaron", words: ["ผม", "ชื่อ", "แอรอน"], romanized: "Phǒm chêu Aaron", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "Where are you?", words: ["คุณ", "อยู่", "ที่ไหน"], romanized: "Khun yùu thîi-nǎi?", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "He is Thai", words: ["เขา", "เป็น", "คนไทย"], romanized: "Khǎo pen khon-Thai", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "Let's go eat together", words: ["เรา", "ไป", "กินข้าว", "ด้วยกัน"], romanized: "Rao pai gin-khâao dûay-gan", requiredTopics: ["pronouns-questions"], difficulty: 2 },
  { english: "What are you doing?", words: ["คุณ", "ทำ", "อะไร"], romanized: "Khun tham à-rai?", requiredTopics: ["pronouns-questions"], difficulty: 1 },

  // ── Connectors & Particles ──
  { english: "Thank you (female)", words: ["ขอบคุณ", "ค่ะ"], romanized: "Khàawp-khun khâ", requiredTopics: ["connectors-particles"], difficulty: 1 },
  { english: "Is it delicious?", words: ["อร่อย", "ไหม"], romanized: "À-ròi mǎi?", requiredTopics: ["connectors-particles"], difficulty: 1 },
  { english: "Delicious but expensive", words: ["อร่อย", "แต่", "แพง"], romanized: "À-ròi dtàe phaeng", requiredTopics: ["connectors-particles"], difficulty: 1 },
  { english: "I also like it", words: ["ฉัน", "ก็", "ชอบ"], romanized: "Chǎn gâw châwp", requiredTopics: ["connectors-particles"], difficulty: 1 },
  { english: "Tea or coffee?", words: ["ชา", "หรือ", "กาแฟ"], romanized: "Chaa rěu gaa-fae?", requiredTopics: ["connectors-particles"], difficulty: 1 },

  // ── Greetings & Phrases ──
  { english: "Hello, my name is...", words: ["สวัสดี", "ครับ", "ผม", "ชื่อ"], romanized: "Sà-wàt-dii khráp phǒm chêu...", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "How are you doing?", words: ["คุณ", "เป็นยังไง", "บ้าง"], romanized: "Khun pen-yang-ngai bâang?", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "Thank you very much", words: ["ขอบคุณ", "มาก", "ครับ"], romanized: "Khàawp-khun mâak khráp", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "No problem (female)", words: ["ไม่เป็นไร", "ค่ะ"], romanized: "Mâi-pen-rai khâ", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "See you tomorrow", words: ["เจอกัน", "พรุ่งนี้"], romanized: "Jur-gan phrûng-níi", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "Are you well?", words: ["คุณ", "สบายดี", "ไหม"], romanized: "Khun sà-baai-dii mǎi?", requiredTopics: ["greetings-phrases"], difficulty: 1 },

  // ── Feelings ──
  { english: "I am very tired", words: ["ผม", "เหนื่อย", "มาก"], romanized: "Phǒm nèuay mâak", requiredTopics: ["feelings"], difficulty: 1 },
  { english: "Today was very fun", words: ["วันนี้", "สนุก", "มาก"], romanized: "Wan níi sà-nùk mâak", requiredTopics: ["feelings"], difficulty: 1 },
  { english: "I am not well", words: ["ฉัน", "ไม่", "สบาย"], romanized: "Chǎn mâi sà-baai", requiredTopics: ["feelings"], difficulty: 1 },
  { english: "I'm so hungry", words: ["หิวข้าว", "จัง", "เลย"], romanized: "Hǐw-khâao jang loei", requiredTopics: ["feelings"], difficulty: 1 },
  { english: "I'm bored already", words: ["เบื่อ", "แล้ว"], romanized: "Bèua láew", requiredTopics: ["feelings"], difficulty: 1 },

  // ── Adjectives ──
  { english: "Thai food is delicious", words: ["อาหาร", "ไทย", "อร่อย"], romanized: "Aa-hǎan Thai à-ròi", requiredTopics: ["adjectives"], difficulty: 1 },
  { english: "This house is very big", words: ["บ้าน", "นี้", "ใหญ่", "มาก"], romanized: "Bâan níi yài mâak", requiredTopics: ["adjectives"], difficulty: 1 },
  { english: "Bangkok is very expensive", words: ["กรุงเทพ", "แพง", "มาก"], romanized: "Grung-thêep phaeng mâak", requiredTopics: ["adjectives"], difficulty: 1 },
  { english: "Thailand is very hot", words: ["เมืองไทย", "ร้อน", "มาก"], romanized: "Meuang Thai rón mâak", requiredTopics: ["adjectives"], difficulty: 1 },
  { english: "The kitten is cute", words: ["ลูกแมว", "น่ารัก", "มาก"], romanized: "Lûuk-maew nâa-rák mâak", requiredTopics: ["adjectives"], difficulty: 1 },

  // ── Locations & Directions ──
  { english: "Where is the bathroom?", words: ["ห้องน้ำ", "อยู่", "ที่ไหน"], romanized: "Hâwng-náam yùu thîi-nǎi?", requiredTopics: ["locations-directions"], difficulty: 1 },
  { english: "Go straight then turn left", words: ["ตรงไป", "แล้ว", "เลี้ยวซ้าย"], romanized: "Trong-pai láew líeo-sáai", requiredTopics: ["locations-directions"], difficulty: 2 },
  { english: "The shop is nearby", words: ["ร้าน", "อยู่", "ใกล้"], romanized: "Ráan yùu glâi", requiredTopics: ["locations-directions"], difficulty: 1 },
  { english: "It's upstairs", words: ["อยู่", "ชั้น", "บน"], romanized: "Yùu chán bon", requiredTopics: ["locations-directions"], difficulty: 1 },
  { english: "It's in the bag", words: ["อยู่", "ใน", "กระเป๋า"], romanized: "Yùu nai grà-bpǎo", requiredTopics: ["locations-directions"], difficulty: 1 },

  // ── Essential Verbs ──
  { english: "I don't know", words: ["ฉัน", "ไม่", "รู้"], romanized: "Chǎn mâi rúu", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "I don't understand", words: ["ฉัน", "ไม่", "เข้าใจ"], romanized: "Chǎn mâi khâo-jai", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "Can you speak Thai?", words: ["พูด", "ไทย", "ได้", "ไหม"], romanized: "Phûut Thai dâi mǎi?", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "It's okay / Never mind", words: ["ไม่เป็นไร"], romanized: "Mâi-pen-rai", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "Have you eaten yet?", words: ["กินข้าว", "หรือ", "ยัง"], romanized: "Gin-khâao rěu yang?", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "Tell me please", words: ["บอก", "ฉัน", "หน่อย"], romanized: "Bàwk chǎn nòi", requiredTopics: ["essential-verbs"], difficulty: 1 },

  // ── Food & Eating ──
  { english: "One fried rice please", words: ["ขอ", "ข้าวผัด", "หนึ่ง", "จาน"], romanized: "Khǎaw khâao-phàt nùeng jaan", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "Tom yum is very spicy", words: ["ต้มยำ", "เผ็ด", "มาก"], romanized: "Dtôm-yam phèt mâak", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "Not spicy please", words: ["ขอ", "ไม่", "เผ็ด"], romanized: "Khǎaw mâi phèt", requiredTopics: ["food-eating", "ordering-food"], difficulty: 1 },
  { english: "The food is really delicious", words: ["อาหาร", "อร่อย", "มาก", "เลย"], romanized: "Aa-hǎan à-ròi mâak loei", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "One hot coffee", words: ["กาแฟ", "ร้อน", "หนึ่ง", "แก้ว"], romanized: "Gaa-fae rón nùeng gâew", requiredTopics: ["food-eating"], difficulty: 1 },

  // ── Shopping & Money ──
  { english: "How much is this?", words: ["อันนี้", "เท่าไร"], romanized: "An níi tâo-rai?", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Too expensive, can you discount?", words: ["แพง", "ไป", "ลด", "ได้ไหม"], romanized: "Phaeng pai lót dâi-mǎi?", requiredTopics: ["shopping-money"], difficulty: 2 },
  { english: "Receipt please", words: ["ขอ", "ใบเสร็จ", "ด้วย"], romanized: "Khǎaw bai-sèt dûay", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Water is free", words: ["น้ำ", "ฟรี"], romanized: "Náam frii", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Where do I pay?", words: ["จ่ายเงิน", "ที่ไหน"], romanized: "Jàai-ngoen thîi-nǎi?", requiredTopics: ["shopping-money"], difficulty: 1 },

  // ── Family ──
  { english: "Father works every day", words: ["พ่อ", "ทำงาน", "ทุก", "วัน"], romanized: "Phâaw tham-ngaan thúk wan", requiredTopics: ["family"], difficulty: 1 },
  { english: "Mother cooks delicious food", words: ["แม่", "ทำ", "อาหาร", "อร่อย"], romanized: "Mâae tham aa-hǎan à-ròi", requiredTopics: ["family"], difficulty: 1 },
  { english: "How many children?", words: ["มี", "ลูก", "กี่", "คน"], romanized: "Mii lûuk gìi khon?", requiredTopics: ["family"], difficulty: 1 },
  { english: "Older sister works in Bangkok", words: ["พี่สาว", "ทำงาน", "ที่", "กรุงเทพ"], romanized: "Phîi-sǎao tham-ngaan thîi Grung-thêep", requiredTopics: ["family"], difficulty: 2 },
  { english: "A good friend is valuable", words: ["เพื่อน", "ดี", "มีค่า", "มาก"], romanized: "Phêuan dii mii-khâa mâak", requiredTopics: ["family"], difficulty: 2 },

  // ── Numbers ──
  { english: "Count from one to ten", words: ["นับ", "หนึ่ง", "ถึง", "สิบ"], romanized: "Náp nùeng thǔeng sìp", requiredTopics: ["numbers"], difficulty: 1 },
  { english: "A week has seven days", words: ["อาทิตย์", "มี", "เจ็ด", "วัน"], romanized: "Aa-thít mii jèt wan", requiredTopics: ["numbers"], difficulty: 1 },
  { english: "Twenty baht", words: ["ยี่สิบ", "บาท"], romanized: "Yîi-sìp bàat", requiredTopics: ["numbers-extended"], difficulty: 1 },
  { english: "One thousand baht", words: ["หนึ่ง", "พัน", "บาท"], romanized: "Nùeng phan bàat", requiredTopics: ["numbers-extended"], difficulty: 1 },
  { english: "Half an hour", words: ["ครึ่ง", "ชั่วโมง"], romanized: "Khrûeng chuâ-mohng", requiredTopics: ["numbers-extended", "time-of-day"], difficulty: 1 },

  // ── Ordering Food (Situation) ──
  { english: "Can I have the menu?", words: ["ขอ", "เมนู", "หน่อย"], romanized: "Khǎaw mee-nuu nòi", requiredTopics: ["ordering-food"], difficulty: 1 },
  { english: "Bill please", words: ["เก็บ", "ตัง", "ด้วย"], romanized: "Gèp dtang dûay", requiredTopics: ["ordering-food"], difficulty: 1 },
  { english: "A little spicy please", words: ["ขอ", "เผ็ด", "นิดหน่อย"], romanized: "Khǎaw phèt nít-nòi", requiredTopics: ["ordering-food"], difficulty: 1 },
  { english: "No vegetables please", words: ["ขอ", "ไม่", "ใส่", "ผัก"], romanized: "Khǎaw mâi sài phàk", requiredTopics: ["ordering-food"], difficulty: 1 },
  { english: "What's good here?", words: ["ร้านนี้", "อะไร", "ดี"], romanized: "Ráan níi à-rai dii?", requiredTopics: ["ordering-food"], difficulty: 1 },

  // ── Getting Around (Situation) ──
  { english: "Can you go to Siam?", words: ["ไป", "สยาม", "ได้", "ไหม"], romanized: "Pai Sà-yǎam dâi mǎi?", requiredTopics: ["getting-around"], difficulty: 1 },
  { english: "Stop here please", words: ["หยุด", "ที่นี่", "ครับ"], romanized: "Yùt thîi-nîi khráp", requiredTopics: ["getting-around"], difficulty: 1 },
  { english: "Go straight then turn left", words: ["ตรงไป", "แล้ว", "เลี้ยวซ้าย"], romanized: "Trong-pai láew líeo-sáai", requiredTopics: ["getting-around"], difficulty: 2 },
  { english: "How far from here?", words: ["จากที่นี่", "ไกล", "เท่าไร"], romanized: "Jàak thîi-nîi glai tâo-rai?", requiredTopics: ["getting-around"], difficulty: 2 },
  { english: "Taking the BTS is faster", words: ["นั่ง", "รถไฟฟ้า", "เร็ว", "กว่า"], romanized: "Nâng rót-fai-fáa reo gwàa", requiredTopics: ["getting-around"], difficulty: 2 },

  // ── 7-Eleven (Situation) ──
  { english: "Do you have water?", words: ["มี", "น้ำเปล่า", "ไหม"], romanized: "Mii náam-bplào mǎi?", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "No bag needed", words: ["ไม่", "ต้อง", "ถุง"], romanized: "Mâi dtâwng thǔng", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "Pay here please", words: ["จ่ายเงิน", "ตรงนี้", "ครับ"], romanized: "Jàai-ngoen trong-níi khráp", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "I'll take this one", words: ["รับ", "อันนี้", "ค่ะ"], romanized: "Ráp an-níi khâ", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "Can I charge my phone?", words: ["ชาร์จ", "แบต", "ได้", "ไหม"], romanized: "Châat bàet dâi mǎi?", requiredTopics: ["seven-eleven"], difficulty: 1 },

  // ── Health & Emergencies ──
  { english: "Where does it hurt?", words: ["เจ็บ", "ที่ไหน"], romanized: "Jèp thîi-nǎi?", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "I have a headache", words: ["ปวดหัว", "มาก"], romanized: "Pùat-hǔa mâak", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "Need to see a doctor", words: ["ต้อง", "ไป", "หา", "หมอ"], romanized: "Dtâwng pai hǎa mǎw", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "Help! Call a doctor!", words: ["ช่วยด้วย", "เรียก", "หมอ"], romanized: "Chûay dûay! Rîak mǎw!", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "I'm not feeling well", words: ["ไม่", "สบาย", "ต้อง", "พักผ่อน"], romanized: "Mâi sà-baai dtâwng phák-phàwn", requiredTopics: ["health-emergencies"], difficulty: 2 },

  // ── Kitchenware / Fruits / Meats / Ingredients ──
  { english: "One glass of water please", words: ["ขอ", "น้ำ", "หนึ่ง", "แก้ว"], romanized: "Khǎaw náam nùeng gâew", requiredTopics: ["kitchenware"], difficulty: 1 },
  { english: "Spoon and fork", words: ["ช้อน", "กับ", "ส้อม"], romanized: "Cháwn gàp sâwm", requiredTopics: ["kitchenware"], difficulty: 1 },
  { english: "Mango is very sweet", words: ["มะม่วง", "หวาน", "มาก"], romanized: "Mà-mûang wǎan mâak", requiredTopics: ["fruits"], difficulty: 1 },
  { english: "Chicken fried rice", words: ["ข้าวผัด", "ไก่"], romanized: "Khâao-phàt gài", requiredTopics: ["meats-proteins"], difficulty: 1 },
  { english: "Stir-fried basil with pork", words: ["ผัด", "กะเพรา", "หมู"], romanized: "Phàt grà-phao mǔu", requiredTopics: ["ingredients"], difficulty: 1 },

  // ── Pattern-Aligned Exercises ──
  { english: "My name is John", words: ["ผม", "ชื่อ", "จอห์น"], romanized: "Phǒm chêu Jawn", requiredTopics: ["pronoun-name"], patternId: "pronoun-name", difficulty: 1 },
  { english: "My name is Ploy", words: ["ฉัน", "ชื่อ", "พลอย"], romanized: "Chǎn chêu Phloi", requiredTopics: ["pronoun-name"], patternId: "pronoun-name", difficulty: 1 },
  { english: "Hello, my name is Mali", words: ["สวัสดี", "ฉัน", "ชื่อ", "มะลิ"], romanized: "Sà-wàt-dii chǎn chêu Má-lí", requiredTopics: ["pronoun-name"], patternId: "pronoun-name", difficulty: 2 },

  { english: "The food is delicious", words: ["อาหาร", "อร่อย"], romanized: "Aa-hǎan à-ròi", requiredTopics: ["simple-statement"], patternId: "simple-statement", difficulty: 1 },
  { english: "The water is cold", words: ["น้ำ", "เย็น"], romanized: "Náam yen", requiredTopics: ["simple-statement"], patternId: "simple-statement", difficulty: 1 },
  { english: "Today is fun", words: ["วันนี้", "สนุก", "มาก"], romanized: "Wan-níi sanùk mâak", requiredTopics: ["simple-statement"], patternId: "simple-statement", difficulty: 2 },

  { english: "Not spicy", words: ["ไม่", "เผ็ด"], romanized: "Mâi phèt", requiredTopics: ["negation"], patternId: "negation", difficulty: 1 },
  { english: "I don't understand", words: ["ไม่", "เข้าใจ"], romanized: "Mâi khâo-jai", requiredTopics: ["negation"], patternId: "negation", difficulty: 1 },
  { english: "I don't want this one", words: ["ไม่", "เอา", "อันนี้"], romanized: "Mâi ao an-níi", requiredTopics: ["negation"], patternId: "negation", difficulty: 2 },

  { english: "Is it spicy?", words: ["เผ็ด", "ไหม"], romanized: "Phèt mǎi?", requiredTopics: ["yes-no-question"], patternId: "yes-no-question", difficulty: 1 },
  { english: "Do you understand?", words: ["เข้าใจ", "ไหม"], romanized: "Khâo-jai mǎi?", requiredTopics: ["yes-no-question"], patternId: "yes-no-question", difficulty: 1 },
  { english: "Do you want to go today?", words: ["วันนี้", "ไป", "ไหม"], romanized: "Wan-níi pai mǎi?", requiredTopics: ["yes-no-question"], patternId: "yes-no-question", difficulty: 2 },

  { english: "What is your name?", words: ["คุณ", "ชื่อ", "อะไร"], romanized: "Khun chêu à-rai?", requiredTopics: ["question-word-end"], patternId: "question-word-end", difficulty: 1 },
  { english: "Where are you going?", words: ["ไป", "ไหน"], romanized: "Pai nǎi?", requiredTopics: ["question-word-end"], patternId: "question-word-end", difficulty: 1 },
  { english: "Today you eat what?", words: ["วันนี้", "กิน", "อะไร"], romanized: "Wan-níi gin à-rai?", requiredTopics: ["question-word-end"], patternId: "question-word-end", difficulty: 2 },

  { english: "Where is the bathroom?", words: ["ห้องน้ำ", "อยู่ที่ไหน"], romanized: "Hông-náam yùu thîi-nǎi?", requiredTopics: ["ask-location"], patternId: "ask-location", difficulty: 1 },
  { english: "Where is the hotel?", words: ["โรงแรม", "อยู่ที่ไหน"], romanized: "Roong-raem yùu thîi-nǎi?", requiredTopics: ["ask-location"], patternId: "ask-location", difficulty: 1 },
  { english: "Excuse me, where is the BTS?", words: ["ขอโทษ", "บีทีเอส", "อยู่ที่ไหน"], romanized: "Khǎw-thôot BTS yùu thîi-nǎi?", requiredTopics: ["ask-location"], patternId: "ask-location", difficulty: 2 },

  { english: "Can I have water?", words: ["ขอ", "น้ำ"], romanized: "Khǎw náam", requiredTopics: ["ask-for"], patternId: "ask-for", difficulty: 1 },
  { english: "Can I have the menu, please?", words: ["ขอ", "เมนู", "หน่อย"], romanized: "Khǎw mee-nuu nòi", requiredTopics: ["ask-for"], patternId: "ask-for", difficulty: 1 },
  { english: "Can I have one more bottle of water?", words: ["ขอ", "น้ำ", "อีก", "ขวด"], romanized: "Khǎw náam ìik khùat", requiredTopics: ["ask-for"], patternId: "ask-for", difficulty: 2 },

  { english: "Can you help?", words: ["ช่วย", "ได้ไหม"], romanized: "Chûai dâai mǎi?", requiredTopics: ["can-you"], patternId: "can-you", difficulty: 1 },
  { english: "Can you speak slowly?", words: ["พูด", "ช้าๆ", "ได้ไหม"], romanized: "Phûut cháa-cháa dâai mǎi?", requiredTopics: ["can-you"], patternId: "can-you", difficulty: 1 },
  { english: "Can you call a taxi?", words: ["เรียก", "แท็กซี่", "ได้ไหม"], romanized: "Rîiak tháek-sîi dâai mǎi?", requiredTopics: ["can-you"], patternId: "can-you", difficulty: 2 },

  { english: "How much is this one?", words: ["อันนี้", "เท่าไหร่"], romanized: "An-níi thâo-rài?", requiredTopics: ["how-much"], patternId: "how-much", difficulty: 1 },
  { english: "How much is the bill?", words: ["เช็กบิล", "เท่าไหร่"], romanized: "Chék-bin thâo-rài?", requiredTopics: ["how-much"], patternId: "how-much", difficulty: 1 },
  { english: "How much is the total today?", words: ["วันนี้", "ทั้งหมด", "เท่าไหร่"], romanized: "Wan-níi tháng-mòt thâo-rài?", requiredTopics: ["how-much"], patternId: "how-much", difficulty: 2 },

  { english: "I want to eat", words: ["อยาก", "กิน"], romanized: "Yàak gin", requiredTopics: ["want-to"], patternId: "want-to", difficulty: 1 },
  { english: "I want to learn Thai", words: ["อยาก", "เรียน", "ภาษาไทย"], romanized: "Yàak rian phaa-sǎa-Thai", requiredTopics: ["want-to"], patternId: "want-to", difficulty: 1 },
  { english: "Today I want to order food", words: ["วันนี้", "อยาก", "สั่ง", "อาหาร"], romanized: "Wan-níi yàak sàng aa-hǎan", requiredTopics: ["want-to"], patternId: "want-to", difficulty: 2 },

  { english: "I need water", words: ["ต้องการ", "น้ำ"], romanized: "Tông-gaan náam", requiredTopics: ["need"], patternId: "need", difficulty: 1 },
  { english: "I need a doctor", words: ["ต้องการ", "หมอ"], romanized: "Tông-gaan mǎw", requiredTopics: ["need"], patternId: "need", difficulty: 1 },
  { english: "I need more time today", words: ["วันนี้", "ต้องการ", "เวลา", "เพิ่ม"], romanized: "Wan-níi tông-gaan wee-laa phôem", requiredTopics: ["need"], patternId: "need", difficulty: 2 },

  { english: "I like Thai food", words: ["ชอบ", "อาหารไทย"], romanized: "Chôp aa-hǎan-Thai", requiredTopics: ["like"], patternId: "like", difficulty: 1 },
  { english: "I like listening to music", words: ["ชอบ", "ฟัง", "เพลง"], romanized: "Chôp fang phleeng", requiredTopics: ["like"], patternId: "like", difficulty: 1 },
  { english: "I like walking around here", words: ["ชอบ", "เดินเล่น", "ที่นี่"], romanized: "Chôp doen-lên thîi-nîi", requiredTopics: ["like"], patternId: "like", difficulty: 2 },

  { english: "I have money", words: ["มี", "เงิน"], romanized: "Mii ngoen", requiredTopics: ["have"], patternId: "have", difficulty: 1 },
  { english: "I have a question", words: ["มี", "คำถาม"], romanized: "Mii kham-thǎam", requiredTopics: ["have"], patternId: "have", difficulty: 1 },
  { english: "Today I have free time", words: ["วันนี้", "มี", "เวลา", "ว่าง"], romanized: "Wan-níi mii wee-laa wâang", requiredTopics: ["have"], patternId: "have", difficulty: 2 },

  { english: "Going home", words: ["ไป", "บ้าน"], romanized: "Pai bâan", requiredTopics: ["go-to"], patternId: "go-to", difficulty: 1 },
  { english: "Going to the market", words: ["ไป", "ตลาด"], romanized: "Pai dtà-làat", requiredTopics: ["go-to"], patternId: "go-to", difficulty: 1 },
  { english: "Tomorrow going to the airport", words: ["พรุ่งนี้", "ไป", "สนามบิน"], romanized: "Phrûng-níi pai sà-nǎam-bin", requiredTopics: ["go-to"], patternId: "go-to", difficulty: 2 },

  { english: "Eat rice", words: ["กิน", "ข้าว"], romanized: "Gin khâao", requiredTopics: ["eat-drink"], patternId: "eat-drink", difficulty: 1 },
  { english: "Drink coffee", words: ["ดื่ม", "กาแฟ"], romanized: "Dùem gaa-fae", requiredTopics: ["eat-drink"], patternId: "eat-drink", difficulty: 1 },
  { english: "In the morning drink water", words: ["ตอนเช้า", "ดื่ม", "น้ำ"], romanized: "Dtawn-cháo dùem náam", requiredTopics: ["eat-drink"], patternId: "eat-drink", difficulty: 2 },

  { english: "This one is tastier than that one", words: ["อันนี้", "อร่อยกว่า", "อันนั้น"], romanized: "An-níi à-ròi gwàa an-nán", requiredTopics: ["comparative"], patternId: "comparative", difficulty: 1 },
  { english: "Today is better than yesterday", words: ["วันนี้", "ดีกว่า", "เมื่อวาน"], romanized: "Wan-níi dii gwàa mêua-waan", requiredTopics: ["comparative"], patternId: "comparative", difficulty: 2 },
  { english: "The BTS is more convenient than a taxi", words: ["บีทีเอส", "สะดวกกว่า", "แท็กซี่"], romanized: "BTS sà-dùak gwàa tháek-sîi", requiredTopics: ["comparative"], patternId: "comparative", difficulty: 2 },

  { english: "Today it's raining", words: ["วันนี้", "ฝนตก"], romanized: "Wan-níi fǒn-dtòk", requiredTopics: ["time-marker"], patternId: "time-marker", difficulty: 1 },
  { english: "Yesterday I ate Thai food", words: ["เมื่อวาน", "กิน", "อาหารไทย"], romanized: "Mêua-waan gin aa-hǎan-Thai", requiredTopics: ["time-marker"], patternId: "time-marker", difficulty: 1 },
  { english: "Tomorrow I will go to the market", words: ["พรุ่งนี้", "จะ", "ไป", "ตลาด"], romanized: "Phrûng-níi jà pai dtà-làat", requiredTopics: ["time-marker"], patternId: "time-marker", difficulty: 2 },

  { english: "A little slower", words: ["ช้า", "หน่อย"], romanized: "Cháa nòi", requiredTopics: ["soften"], patternId: "soften", difficulty: 1 },
  { english: "Wait a moment", words: ["รอ", "หน่อย"], romanized: "Raw nòi", requiredTopics: ["soften"], patternId: "soften", difficulty: 1 },
  { english: "Can I have some water?", words: ["ขอ", "น้ำ", "หน่อย"], romanized: "Khǎw náam nòi", requiredTopics: ["soften"], patternId: "soften", difficulty: 2 },

  { english: "Already eaten", words: ["กิน", "แล้ว"], romanized: "Gin láew", requiredTopics: ["already-done"], patternId: "already-done", difficulty: 1 },
  { english: "Already arrived", words: ["ถึง", "แล้ว"], romanized: "Thǔeng láew", requiredTopics: ["already-done"], patternId: "already-done", difficulty: 1 },
  { english: "I understand now", words: ["เข้าใจ", "แล้ว", "ครับ"], romanized: "Khâo-jai láew khráp", requiredTopics: ["already-done"], patternId: "already-done", difficulty: 2 },

  { english: "Haven't eaten yet", words: ["ยังไม่", "กิน"], romanized: "Yang mâi gin", requiredTopics: ["not-yet"], patternId: "not-yet", difficulty: 1 },
  { english: "Not finished yet", words: ["ยังไม่", "เสร็จ"], romanized: "Yang mâi sèt", requiredTopics: ["not-yet"], patternId: "not-yet", difficulty: 1 },
  { english: "I don't understand yet", words: ["ยังไม่", "เข้าใจ", "ครับ"], romanized: "Yang mâi khâo-jai khráp", requiredTopics: ["not-yet"], patternId: "not-yet", difficulty: 2 },

  { english: "Will go", words: ["จะ", "ไป"], romanized: "Jà pai", requiredTopics: ["future"], patternId: "future", difficulty: 1 },
  { english: "Will call", words: ["จะ", "โทร"], romanized: "Jà thoo", requiredTopics: ["future"], patternId: "future", difficulty: 1 },
  { english: "Tomorrow I will study Thai", words: ["พรุ่งนี้", "จะ", "เรียน", "ภาษาไทย"], romanized: "Phrûng-níi jà rian phaa-sǎa-Thai", requiredTopics: ["future"], patternId: "future", difficulty: 2 },

  { english: "With friends", words: ["กับ", "เพื่อน"], romanized: "Gàp phûean", requiredTopics: ["with-someone"], patternId: "with-someone", difficulty: 1 },
  { english: "Going with family", words: ["ไป", "กับ", "ครอบครัว"], romanized: "Pai gàp khrâwp-khrua", requiredTopics: ["with-someone"], patternId: "with-someone", difficulty: 1 },
  { english: "Today eating with mom", words: ["วันนี้", "กินข้าว", "กับ", "แม่"], romanized: "Wan-níi gin-khâao gàp mâae", requiredTopics: ["with-someone"], patternId: "with-someone", difficulty: 2 },

  { english: "It's tasty, right?", words: ["อร่อย", "ใช่ไหม"], romanized: "À-ròi châi mǎi?", requiredTopics: ["tag-question"], patternId: "tag-question", difficulty: 1 },
  { english: "It's expensive, right?", words: ["แพง", "ใช่ไหม"], romanized: "Phaeng châi mǎi?", requiredTopics: ["tag-question"], patternId: "tag-question", difficulty: 1 },
  { english: "You understand now, right?", words: ["เข้าใจ", "แล้ว", "ใช่ไหม"], romanized: "Khâo-jai láew châi mǎi?", requiredTopics: ["tag-question"], patternId: "tag-question", difficulty: 2 },

  { english: "Very expensive", words: ["แพง", "มาก"], romanized: "Phaeng mâak", requiredTopics: ["very-too"], patternId: "very-too", difficulty: 1 },
  { english: "Too spicy", words: ["เผ็ด", "เกินไป"], romanized: "Phèt gəən-pai", requiredTopics: ["very-too"], patternId: "very-too", difficulty: 1 },
  { english: "Today the weather is very hot", words: ["วันนี้", "อากาศ", "ร้อน", "มาก"], romanized: "Wan-níi aa-gàat rón mâak", requiredTopics: ["very-too"], patternId: "very-too", difficulty: 2 },

  { english: "Please speak for me", words: ["ช่วย", "พูด", "ให้หน่อย"], romanized: "Chûai phûut hâi nòi", requiredTopics: ["polite-request"], patternId: "polite-request", difficulty: 1 },
  { english: "Please take a photo for me", words: ["ช่วย", "ถ่ายรูป", "ให้หน่อย"], romanized: "Chûai thàai-rûup hâi nòi", requiredTopics: ["polite-request"], patternId: "polite-request", difficulty: 1 },
  { english: "Please call a taxi for me", words: ["ช่วย", "เรียก", "แท็กซี่", "ให้หน่อย"], romanized: "Chûai rîiak tháek-sîi hâi nòi", requiredTopics: ["polite-request"], patternId: "polite-request", difficulty: 2 }
];
