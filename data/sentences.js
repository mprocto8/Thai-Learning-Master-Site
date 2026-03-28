/**
 * Sentence builder data.
 * Each sentence: english prompt, thai words in correct order, romanized, source topic IDs.
 * Words array = correct order. The builder shuffles them for the user.
 */
const SENTENCES = [
  {
    english: "Today is Monday",
    words: ["วันนี้", "คือ", "วันจันทร์"],
    romanized: "Wan nee khue Wan Jan",
    requiredTopics: ["days", "time-expressions"],
    difficulty: 1
  },
  {
    english: "Tomorrow is Tuesday",
    words: ["พรุ่งนี้", "คือ", "วันอังคาร"],
    romanized: "Phrung nee khue Wan Ang-kaan",
    requiredTopics: ["days", "time-expressions"],
    difficulty: 1
  },
  {
    english: "Yesterday was Wednesday",
    words: ["เมื่อวาน", "คือ", "วันพุธ"],
    romanized: "Meuua wan khue Wan Phut",
    requiredTopics: ["days", "time-expressions"],
    difficulty: 1
  },
  {
    english: "What time is it now?",
    words: ["ตอนนี้", "กี่", "โมง"],
    romanized: "Dton nee gii moong",
    requiredTopics: ["time-of-day"],
    difficulty: 1
  },
  {
    english: "It is three o'clock",
    words: ["ตอนนี้", "สาม", "โมง"],
    romanized: "Dton nee saam moong",
    requiredTopics: ["time-of-day", "numbers"],
    difficulty: 1
  },
  {
    english: "This month is March",
    words: ["เดือน", "นี้", "คือ", "เดือน", "มีนาคม"],
    romanized: "Duean nee khue Duean Mee-naa-khom",
    requiredTopics: ["months-1-6"],
    difficulty: 2
  },
  {
    english: "I wake up in the morning",
    words: ["ฉัน", "ตื่น", "ตอนเช้า"],
    romanized: "Chan dtuen dtorn chao",
    requiredTopics: ["time-of-day"],
    difficulty: 1
  },
  {
    english: "Saturday is next week",
    words: ["วันเสาร์", "คือ", "อาทิตย์หน้า"],
    romanized: "Wan Sao khue aa-thit naa",
    requiredTopics: ["days", "time-expressions"],
    difficulty: 2
  },
  {
    english: "There are seven days in a week",
    words: ["หนึ่ง", "อาทิตย์", "มี", "เจ็ด", "วัน"],
    romanized: "Nueng aa-thit mee jet wan",
    requiredTopics: ["numbers"],
    difficulty: 2
  },
  {
    english: "Wait five minutes",
    words: ["รอ", "ห้า", "นาที"],
    romanized: "Raw haa naa-thee",
    requiredTopics: ["numbers", "time-of-day"],
    difficulty: 1
  },
  {
    english: "This year is two thousand",
    words: ["ปี", "นี้", "คือ", "สอง", "พัน"],
    romanized: "Bpee nee khue sawng phan",
    requiredTopics: ["time-expressions", "numbers"],
    difficulty: 2
  },
  {
    english: "Sunday evening",
    words: ["วันอาทิตย์", "ตอนเย็น"],
    romanized: "Wan Aa-thit dtorn yen",
    requiredTopics: ["days", "time-of-day"],
    difficulty: 1
  },
  {
    english: "Last week it was very hot",
    words: ["อาทิตย์ที่แล้ว", "ร้อน", "มาก"],
    romanized: "Aa-thit thee laew rawn maak",
    requiredTopics: ["time-expressions"],
    difficulty: 2
  },
  {
    english: "January is the first month",
    words: ["มกราคม", "คือ", "เดือน", "แรก"],
    romanized: "Mok-ka-raa-khom khue duean raek",
    requiredTopics: ["months-1-6"],
    difficulty: 2
  },
  {
    english: "Now it is night time",
    words: ["ตอนนี้", "เป็น", "ตอนกลางคืน"],
    romanized: "Dton nee bpen dtorn glang kheun",
    requiredTopics: ["time-of-day"],
    difficulty: 1
  }
];
