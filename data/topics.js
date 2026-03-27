/**
 * Vocabulary topic data.
 * To add a new topic, just push another object to this array.
 * Each pair needs: romanized, script, english.
 */
const TOPICS = [
  {
    id: "days",
    label: "Days of the Week",
    emoji: "📅",
    pairs: [
      { romanized: "Wan Jan", script: "วันจันทร์", english: "Monday" },
      { romanized: "Wan Ang-kaan", script: "วันอังคาร", english: "Tuesday" },
      { romanized: "Wan Phut", script: "วันพุธ", english: "Wednesday" },
      { romanized: "Wan Pha-rue-hat", script: "วันพฤหัสบดี", english: "Thursday" },
      { romanized: "Wan Suk", script: "วันศุกร์", english: "Friday" },
      { romanized: "Wan Sao", script: "วันเสาร์", english: "Saturday" },
      { romanized: "Wan Aa-thit", script: "วันอาทิตย์", english: "Sunday" }
    ]
  },
  {
    id: "time-expressions",
    label: "Time Expressions",
    emoji: "⏰",
    pairs: [
      { romanized: "Wan nee", script: "วันนี้", english: "Today" },
      { romanized: "Phrung nee", script: "พรุ่งนี้", english: "Tomorrow" },
      { romanized: "Meuua wan", script: "เมื่อวาน", english: "Yesterday" },
      { romanized: "Aa-thit nee", script: "อาทิตย์นี้", english: "This week" },
      { romanized: "Aa-thit naa", script: "อาทิตย์หน้า", english: "Next week" },
      { romanized: "Aa-thit thee laew", script: "อาทิตย์ที่แล้ว", english: "Last week" },
      { romanized: "Bpee nee", script: "ปีนี้", english: "This year" },
      { romanized: "Bpee naa", script: "ปีหน้า", english: "Next year" }
    ]
  },
  {
    id: "months-1-6",
    label: "Months (Jan–Jun)",
    emoji: "🌸",
    pairs: [
      { romanized: "Mok-ka-raa-khom", script: "มกราคม", english: "January" },
      { romanized: "Kum-phaa-phan", script: "กุมภาพันธ์", english: "February" },
      { romanized: "Mee-naa-khom", script: "มีนาคม", english: "March" },
      { romanized: "May-saa-yon", script: "เมษายน", english: "April" },
      { romanized: "Phruet-sa-phaa-khom", script: "พฤษภาคม", english: "May" },
      { romanized: "Mi-thu-naa-yon", script: "มิถุนายน", english: "June" }
    ]
  },
  {
    id: "months-7-12",
    label: "Months (Jul–Dec)",
    emoji: "🍂",
    pairs: [
      { romanized: "Ka-rak-ka-daa-khom", script: "กรกฎาคม", english: "July" },
      { romanized: "Sing-haa-khom", script: "สิงหาคม", english: "August" },
      { romanized: "Kan-yaa-yon", script: "กันยายน", english: "September" },
      { romanized: "Tu-laa-khom", script: "ตุลาคม", english: "October" },
      { romanized: "Phruet-sa-ji-kaa-yon", script: "พฤศจิกายน", english: "November" },
      { romanized: "Than-waa-khom", script: "ธันวาคม", english: "December" }
    ]
  },
  {
    id: "time-of-day",
    label: "Time of Day",
    emoji: "🌅",
    pairs: [
      { romanized: "Dtorn chao", script: "ตอนเช้า", english: "Morning" },
      { romanized: "Dtorn baai", script: "ตอนบ่าย", english: "Afternoon" },
      { romanized: "Dtorn yen", script: "ตอนเย็น", english: "Evening" },
      { romanized: "Dtorn glang kheun", script: "ตอนกลางคืน", english: "Night" },
      { romanized: "Dton nee", script: "ตอนนี้", english: "Now" },
      { romanized: "Chua-mohng", script: "ชั่วโมง", english: "Hour" },
      { romanized: "Naa-thee", script: "นาที", english: "Minute" }
    ]
  },
  {
    id: "numbers",
    label: "Numbers 1–10",
    emoji: "🔢",
    pairs: [
      { romanized: "Nueng", script: "หนึ่ง", english: "One (1)" },
      { romanized: "Sawng", script: "สอง", english: "Two (2)" },
      { romanized: "Saam", script: "สาม", english: "Three (3)" },
      { romanized: "See", script: "สี่", english: "Four (4)" },
      { romanized: "Haa", script: "ห้า", english: "Five (5)" },
      { romanized: "Hok", script: "หก", english: "Six (6)" },
      { romanized: "Jet", script: "เจ็ด", english: "Seven (7)" },
      { romanized: "Bpaet", script: "แปด", english: "Eight (8)" },
      { romanized: "Gaao", script: "เก้า", english: "Nine (9)" },
      { romanized: "Sip", script: "สิบ", english: "Ten (10)" }
    ]
  }
];
