/**
 * Sentence builder data — 5+ sentences per topic.
 * words[] = correct order. Builder shuffles them.
 * All romanized carry full tone diacritics.
 */
const SENTENCES = [

  // ── Days / Time Expressions ──
  { english: "Today is Monday", words: ["วันนี้", "คือ", "วันจันทร์"], romanized: "Wan níi khue Wan Jan", requiredTopics: ["days"], difficulty: 1 },
  { english: "Tomorrow is Friday", words: ["พรุ่งนี้", "คือ", "วันศุกร์"], romanized: "Phrûng níi khue Wan Sùk", requiredTopics: ["days", "time-expressions"], difficulty: 1 },
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
  { english: "November has Loy Krathong", words: ["พฤศจิกายน", "มี", "ลอยกระทง"], romanized: "Phruét-sà-jì-kaa-yon mii Loi Grà-thong", requiredTopics: ["months-7-12"], difficulty: 2 },
  { english: "December is New Year", words: ["ธันวาคม", "เป็น", "ปีใหม่"], romanized: "Than-waa-khom pen Bpii Mài", requiredTopics: ["months-7-12"], difficulty: 1 },
  { english: "This month is very hot", words: ["เดือน", "นี้", "ร้อน", "มาก"], romanized: "Deuan níi rón mâak", requiredTopics: ["months-1-6"], difficulty: 1 },

  // ── Pronouns & Questions ──
  { english: "What is your name?", words: ["คุณ", "ชื่อ", "อะไร"], romanized: "Khun chêu à-rai?", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "My name is Aaron", words: ["ผม", "ชื่อ", "แอรอน"], romanized: "Phǒm chêu Aaron", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "Where are you?", words: ["คุณ", "อยู่", "ที่ไหน"], romanized: "Khun yùu thîi-nǎi?", requiredTopics: ["pronouns-questions"], difficulty: 1 },
  { english: "He is Thai", words: ["เขา", "เป็น", "คนไทย"], romanized: "Khǎo pen khon Thai", requiredTopics: ["pronouns-questions"], difficulty: 1 },
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
  { english: "How are you doing?", words: ["คุณ", "เป็นยังไง", "บ้าง"], romanized: "Khun pen yang-ngai bâang?", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "Thank you very much", words: ["ขอบคุณ", "มาก", "ครับ"], romanized: "Khàawp-khun mâak khráp", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "No problem (female)", words: ["ไม่เป็นไร", "ค่ะ"], romanized: "Mâi pen rai khâ", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "See you tomorrow", words: ["เจอกัน", "พรุ่งนี้"], romanized: "Jur-gan phrûng níi", requiredTopics: ["greetings-phrases"], difficulty: 1 },
  { english: "Are you well?", words: ["คุณ", "สบายดี", "ไหม"], romanized: "Khun sà-baai dii mǎi?", requiredTopics: ["greetings-phrases"], difficulty: 1 },

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
  { english: "It's okay / Never mind", words: ["ไม่", "เป็นไร"], romanized: "Mâi pen rai", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "Have you eaten yet?", words: ["กิน", "ข้าว", "หรือ", "ยัง"], romanized: "Gin khâao rěu yang?", requiredTopics: ["essential-verbs"], difficulty: 1 },
  { english: "Tell me please", words: ["บอก", "ฉัน", "หน่อย"], romanized: "Bàwk chǎn nòi", requiredTopics: ["essential-verbs"], difficulty: 1 },

  // ── Food & Eating ──
  { english: "One fried rice please", words: ["ขอ", "ข้าวผัด", "หนึ่ง", "จาน"], romanized: "Khǎaw khâao-phàt nùeng jaan", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "Tom yum is very spicy", words: ["ต้มยำ", "เผ็ด", "มาก"], romanized: "Dtôm-yam phèt mâak", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "Not spicy please", words: ["ขอ", "ไม่", "เผ็ด"], romanized: "Khǎaw mâi phèt", requiredTopics: ["food-eating", "ordering-food"], difficulty: 1 },
  { english: "The food is really delicious", words: ["อาหาร", "อร่อย", "มาก", "เลย"], romanized: "Aa-hǎan à-ròi mâak loei", requiredTopics: ["food-eating"], difficulty: 1 },
  { english: "One hot coffee", words: ["กาแฟ", "ร้อน", "หนึ่ง", "แก้ว"], romanized: "Gaa-fae rón nùeng gâew", requiredTopics: ["food-eating"], difficulty: 1 },

  // ── Shopping & Money ──
  { english: "How much is this?", words: ["อันนี้", "เท่าไร"], romanized: "An níi tâo-rai?", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Too expensive, can you discount?", words: ["แพง", "ไป", "ลด", "ได้ไหม"], romanized: "Phaeng pai lót dâi mǎi?", requiredTopics: ["shopping-money"], difficulty: 2 },
  { english: "Receipt please", words: ["ขอ", "ใบเสร็จ", "ด้วย"], romanized: "Khǎaw bai-sèt dûay", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Water is free", words: ["น้ำ", "ฟรี"], romanized: "Náam frii", requiredTopics: ["shopping-money"], difficulty: 1 },
  { english: "Where do I pay?", words: ["จ่ายเงิน", "ที่ไหน"], romanized: "Jàai-ngoen thîi-nǎi?", requiredTopics: ["shopping-money"], difficulty: 1 },

  // ── Family ──
  { english: "Father works every day", words: ["พ่อ", "ทำงาน", "ทุก", "วัน"], romanized: "Phâaw tham-ngaan thúk wan", requiredTopics: ["family"], difficulty: 1 },
  { english: "Mother cooks delicious food", words: ["แม่", "ทำ", "อาหาร", "อร่อย"], romanized: "Mâae tham aa-hǎan à-ròi", requiredTopics: ["family"], difficulty: 1 },
  { english: "How many children?", words: ["มี", "ลูก", "กี่", "คน"], romanized: "Mii lûuk gìi khon?", requiredTopics: ["family"], difficulty: 1 },
  { english: "Older sister works in Bangkok", words: ["พี่สาว", "ทำงาน", "ที่", "กรุงเทพ"], romanized: "Phîi-sǎao tham-ngaan thîi Grung-thêep", requiredTopics: ["family"], difficulty: 2 },
  { english: "A good friend is valuable", words: ["เพื่อน", "ดี", "มีค่า", "มาก"], romanized: "Phêuan dii mii khâa mâak", requiredTopics: ["family"], difficulty: 2 },

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
  { english: "Do you have water?", words: ["มี", "น้ำเปล่า", "ไหม"], romanized: "Mii náam bplào mǎi?", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "No bag needed", words: ["ไม่", "ต้อง", "ถุง"], romanized: "Mâi dtâwng thǔng", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "Pay here please", words: ["จ่ายเงิน", "ตรงนี้", "ครับ"], romanized: "Jàai-ngoen trong níi khráp", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "I'll take this one", words: ["รับ", "อันนี้", "ค่ะ"], romanized: "Ráp an níi khâ", requiredTopics: ["seven-eleven"], difficulty: 1 },
  { english: "Can I charge my phone?", words: ["ชาร์จ", "แบต", "ได้", "ไหม"], romanized: "Châat bàet dâi mǎi?", requiredTopics: ["seven-eleven"], difficulty: 1 },

  // ── Health & Emergencies ──
  { english: "Where does it hurt?", words: ["เจ็บ", "ที่ไหน"], romanized: "Jèp thîi-nǎi?", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "I have a headache", words: ["ปวด", "หัว", "มาก"], romanized: "Pùat-hǔa mâak", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "Need to see a doctor", words: ["ต้อง", "ไป", "หา", "หมอ"], romanized: "Dtâwng pai hǎa mǎw", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "Help! Call a doctor!", words: ["ช่วยด้วย", "เรียก", "หมอ"], romanized: "Chûay dûay! Rîak mǎw!", requiredTopics: ["health-emergencies"], difficulty: 1 },
  { english: "I'm not feeling well", words: ["ไม่", "สบาย", "ต้อง", "พักผ่อน"], romanized: "Mâi sà-baai dtâwng phák-phàwn", requiredTopics: ["health-emergencies"], difficulty: 2 },

  // ── Kitchenware / Fruits / Meats / Ingredients ──
  { english: "One glass of water please", words: ["ขอ", "น้ำ", "หนึ่ง", "แก้ว"], romanized: "Khǎaw náam nùeng gâew", requiredTopics: ["kitchenware"], difficulty: 1 },
  { english: "Spoon and fork", words: ["ช้อน", "กับ", "ส้อม"], romanized: "Cháwn gàp sâwm", requiredTopics: ["kitchenware"], difficulty: 1 },
  { english: "Mango is very sweet", words: ["มะม่วง", "หวาน", "มาก"], romanized: "Mà-mûang wǎan mâak", requiredTopics: ["fruits"], difficulty: 1 },
  { english: "Chicken fried rice", words: ["ข้าวผัด", "ไก่"], romanized: "Khâao-phàt gài", requiredTopics: ["meats-proteins"], difficulty: 1 },
  { english: "Stir-fried basil with pork", words: ["ผัด", "กะเพรา", "หมู"], romanized: "Phàt grà-phao mǔu", requiredTopics: ["ingredients"], difficulty: 1 }
];
