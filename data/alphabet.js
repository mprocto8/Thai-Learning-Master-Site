/**
 * Thai alphabet data: consonants, vowels, tone marks.
 * Each consonant has: char, romanized sound, class (high/mid/low), example word, mnemonic.
 * Each vowel has: char, romanized sound, example, note.
 */

const THAI_CONSONANTS = [
  // HIGH CLASS (11)
  { char: "ข", romanized: "kh", class: "high", example: "ข้าว (khâao) = rice", mnemonic: "Looks like a rice bowl with a handle" },
  { char: "ฃ", romanized: "kh", class: "high", example: "ฃวด (khùat) = bottle (obsolete)", mnemonic: "The fancy cousin of ข — retired from duty" },
  { char: "ฉ", romanized: "ch", class: "high", example: "ฉิ่ง (chìng) = cymbals", mnemonic: "Cymbals clash — Ch! Ch!" },
  { char: "ฐ", romanized: "th", class: "high", example: "ฐาน (thǎan) = base", mnemonic: "Sits on a solid base like a throne" },
  { char: "ถ", romanized: "th", class: "high", example: "ถุง (thǔng) = bag", mnemonic: "A bag with a curling handle on top" },
  { char: "ผ", romanized: "ph", class: "high", example: "ผึ้ง (phûeng) = bee", mnemonic: "Bee buzzes — Ph! Ph!" },
  { char: "ฝ", romanized: "f", class: "high", example: "ฝา (fǎa) = lid", mnemonic: "A lid sitting on a pot — Fff" },
  { char: "ศ", romanized: "s", class: "high", example: "ศาลา (sǎa-laa) = pavilion", mnemonic: "Looks like a small pavilion roof" },
  { char: "ษ", romanized: "s", class: "high", example: "ฤๅษี (rue-sǐi) = hermit", mnemonic: "The hermit's S — ancient and ornate" },
  { char: "ส", romanized: "s", class: "high", example: "เสือ (sǔea) = tiger", mnemonic: "Tiger's stripes make S curves" },
  { char: "ห", romanized: "h", class: "high", example: "หีบ (hìip) = chest/box", mnemonic: "Breathe out — Hhhh — the airy letter" },

  // MID CLASS (9)
  { char: "ก", romanized: "g", class: "mid", example: "ไก่ (gài) = chicken", mnemonic: "First letter! A chicken's head in profile" },
  { char: "จ", romanized: "j", class: "mid", example: "จาน (jaan) = plate", mnemonic: "A plate seen from above — round like J" },
  { char: "ฎ", romanized: "d", class: "mid", example: "ชฎา (cha-daa) = crown", mnemonic: "The royal D — wears a crown" },
  { char: "ฏ", romanized: "dt", class: "mid", example: "ปฏัก (bpa-dtàk) = spear", mnemonic: "A spear standing upright — DT sharp!" },
  { char: "ด", romanized: "d", class: "mid", example: "เด็ก (dèk) = child", mnemonic: "A child's simple, round form" },
  { char: "ต", romanized: "dt", class: "mid", example: "เต่า (dtào) = turtle", mnemonic: "A turtle with its shell — round DT" },
  { char: "บ", romanized: "b", class: "mid", example: "ใบไม้ (bai-máai) = leaf", mnemonic: "A leaf shape — B for leaf (Bai)" },
  { char: "ป", romanized: "bp", class: "mid", example: "ปลา (bplaa) = fish", mnemonic: "A fish hook! BP catches fish" },
  { char: "อ", romanized: "aw", class: "mid", example: "อ่าง (àang) = basin", mnemonic: "An open mouth — Awww" },

  // LOW CLASS (24)
  { char: "ค", romanized: "kh", class: "low", example: "ควาย (khwaai) = buffalo", mnemonic: "Buffalo horns curve like this letter" },
  { char: "ฅ", romanized: "kh", class: "low", example: "ฅน (khon) = person (obsolete)", mnemonic: "A person standing — now retired" },
  { char: "ฆ", romanized: "kh", class: "low", example: "ระฆัง (ra-khang) = bell", mnemonic: "A bell with an elaborate frame" },
  { char: "ง", romanized: "ng", class: "low", example: "งู (nguu) = snake", mnemonic: "A snake coiled — NGggg hiss" },
  { char: "ช", romanized: "ch", class: "low", example: "ช้าง (cháang) = elephant", mnemonic: "Elephant trunk curling — Ch!" },
  { char: "ซ", romanized: "s", class: "low", example: "โซ่ (sôo) = chain", mnemonic: "Chain links loop like this S" },
  { char: "ฌ", romanized: "ch", class: "low", example: "เฌอ (choe) = tree", mnemonic: "A tree with spreading branches — Ch" },
  { char: "ญ", romanized: "y", class: "low", example: "ผู้หญิง (phûu-yǐng) = woman", mnemonic: "Graceful curves like a woman's figure" },
  { char: "ฑ", romanized: "th", class: "low", example: "มณโฑ (mon-thoo) = Montho", mnemonic: "The mythical Montho — Th of legends" },
  { char: "ฒ", romanized: "th", class: "low", example: "ผู้เฒ่า (phûu-thâo) = elder", mnemonic: "An elder leaning on a cane — Th" },
  { char: "ณ", romanized: "n", class: "low", example: "เณร (neen) = novice monk", mnemonic: "A novice monk bowing — N" },
  { char: "ท", romanized: "th", class: "low", example: "ทหาร (tha-hǎan) = soldier", mnemonic: "A soldier standing at attention — Th" },
  { char: "ธ", romanized: "th", class: "low", example: "ธง (thong) = flag", mnemonic: "A flag on a pole — Th flutters" },
  { char: "น", romanized: "n", class: "low", example: "หนู (nǔu) = mouse", mnemonic: "A little mouse — simple N" },
  { char: "พ", romanized: "ph", class: "low", example: "พาน (phaan) = tray", mnemonic: "A decorative tray — Ph" },
  { char: "ฟ", romanized: "f", class: "low", example: "ฟัน (fan) = teeth", mnemonic: "Teeth biting — Fff" },
  { char: "ภ", romanized: "ph", class: "low", example: "สำเภา (sǎm-phao) = junk boat", mnemonic: "A boat's sail billowing — Ph" },
  { char: "ม", romanized: "m", class: "low", example: "ม้า (máa) = horse", mnemonic: "A horse galloping — Mmm" },
  { char: "ย", romanized: "y", class: "low", example: "ยักษ์ (yák) = giant", mnemonic: "A giant looming tall — Y" },
  { char: "ร", romanized: "r", class: "low", example: "เรือ (ruea) = boat", mnemonic: "Rowing a boat — Rrr" },
  { char: "ล", romanized: "l", class: "low", example: "ลิง (ling) = monkey", mnemonic: "A monkey's curling tail — L" },
  { char: "ว", romanized: "w", class: "low", example: "แหวน (wǎen) = ring", mnemonic: "A ring's round shape — W" },
  { char: "ฬ", romanized: "l", class: "low", example: "จุฬา (ju-laa) = kite", mnemonic: "A kite flying high — L soars" },
  { char: "ฮ", romanized: "h", class: "low", example: "นกฮูก (nók-hûuk) = owl", mnemonic: "An owl hooting — Hooo!" }
];

const THAI_VOWELS = [
  { char: "–ะ", romanized: "a", example: "จะ (jà) = will", note: "Short 'a' — like 'u' in 'but'" },
  { char: "–า", romanized: "aa", example: "มา (maa) = come", note: "Long 'a' — like 'a' in 'father'" },
  { char: "–ิ", romanized: "i", example: "มิ (mí) = not", note: "Short 'i' — like 'i' in 'bit'" },
  { char: "–ี", romanized: "ii", example: "มี (mii) = have", note: "Long 'i' — like 'ee' in 'see'" },
  { char: "–ึ", romanized: "ue", example: "นึก (núek) = think", note: "Short 'ue' — no English equivalent, round lips say 'ee'" },
  { char: "–ื", romanized: "uue", example: "มือ (muue) = hand", note: "Long 'ue' — hold the 'ue' sound longer" },
  { char: "–ุ", romanized: "u", example: "จุด (jùt) = point", note: "Short 'u' — like 'oo' in 'foot'" },
  { char: "–ู", romanized: "uu", example: "ดู (duu) = look", note: "Long 'u' — like 'oo' in 'food'" },
  { char: "เ–ะ", romanized: "e", example: "เละ (lé) = messy", note: "Short 'e' — like 'e' in 'bet'" },
  { char: "เ–", romanized: "ee", example: "เท (thee) = pour", note: "Long 'e' — like 'ay' in 'say'" },
  { char: "แ–ะ", romanized: "ae", example: "แพะ (pháe) = goat", note: "Short 'ae' — like 'a' in 'cat'" },
  { char: "แ–", romanized: "aae", example: "แม่ (mâae) = mother", note: "Long 'ae' — stretch the 'cat' sound" },
  { char: "โ–ะ", romanized: "o", example: "โต๊ะ (dtó) = table", note: "Short 'o' — like 'o' in 'go' but shorter" },
  { char: "โ–", romanized: "oo", example: "โต (dtoo) = grow", note: "Long 'o' — like 'o' in 'go'" },
  { char: "เ–าะ", romanized: "aw", example: "เกาะ (gàw) = island", note: "Short 'aw' — like 'o' in 'hot'" },
  { char: "–อ", romanized: "aaw", example: "พอ (phaaw) = enough", note: "Long 'aw' — like 'aw' in 'saw'" },
  { char: "เ–อะ", romanized: "oe", example: "เลอะ (lóe) = dirty", note: "Short 'oe' — like 'u' in 'burn' but short" },
  { char: "เ–อ", romanized: "ooe", example: "เธอ (thoe) = she/you", note: "Long 'oe' — like 'u' in 'burn'" },
  { char: "เ–ีย", romanized: "ia", example: "เสีย (sǐa) = broken", note: "Diphthong — 'ee' gliding to 'ah'" },
  { char: "เ–ือ", romanized: "uea", example: "เสือ (sǔea) = tiger", note: "Diphthong — 'ue' gliding to 'ah'" },
  { char: "–ัว", romanized: "ua", example: "ตัว (dtua) = body/classifier", note: "Diphthong — 'oo' gliding to 'ah'" }
];

const THAI_TONE_MARKS = [
  { char: "–่", romanized: "mâi èek", example: "เด่น (dèn) = outstanding", note: "Produces low tone on mid-class consonants" },
  { char: "–้", romanized: "mâi thoo", example: "น้ำ (náam) = water", note: "Produces falling tone on mid-class consonants" },
  { char: "–๊", romanized: "mâi trii", example: "โต๊ะ (dtó) = table", note: "Produces high tone — mid-class only" },
  { char: "–๋", romanized: "mâi jàt-dtà-waa", example: "หม๋อ (mǒo) = pot (rare)", note: "Produces rising tone — mid-class only, rare" }
];
