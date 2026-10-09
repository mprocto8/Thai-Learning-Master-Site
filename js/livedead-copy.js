// js/livedead-copy.js — user-facing strings for the Live/Dead module (js/livedead.js).
const LiveDeadCopy = (function () {
  const levels = {
    1: {
      title: "Hold it or cut it",
      blurb: "One test: can you hold the ending sound?",
      intro: [
        {
          title: "One question",
          body: "Say the syllable and freeze on the last sound.\nIf it keeps ringing, it is live. If it stops dead, it is dead."
        },
        {
          title: "Live endings: นมยวง",
          body: "You can hold n, m, y, w and ng.\nกิน (gin), ลม (lom), ยาว (yaao) are all live."
        },
        {
          title: "Dead endings: กบด",
          body: "You cannot hold k, p or t. The sound is cut off.\nปาก (bpaak), จบ (jop), มด (mot) are all dead."
        }
      ]
    },
    2: {
      title: "Open syllables",
      blurb: "No ending letter. Long vowels ring, short ones stop.",
      intro: [
        {
          title: "Long vowel rings on",
          body: "With no ending letter, the vowel is the ending.\nA long vowel can be held, so it is live: ตา, ดี, หมา."
        },
        {
          title: "Short vowel stops",
          body: "A short vowel cannot be held. It is cut off, so it is dead.\nจะ, เตะ, ดุ."
        },
        {
          title: "Hidden endings",
          body: "ทำ, ไป, ใจ and เรา look short, but they hide an ending: m, y, y, w.\nYou can hold that ending, so they are live."
        }
      ]
    },
    3: {
      title: "Disguised finals",
      blurb: "Some letters change their sound at the end of a syllable.",
      intro: [
        {
          title: "Same letter, new sound",
          body: "At the end of a syllable, many letters sound like a plain ending.\nHear the real sound, then run the test."
        },
        {
          title: "Four groups",
          body: "ร ล ญ ณ sound n. Live: ผล, คุณ.\nจ ช ซ ศ ษ ส ต ท ธ ถ sound t. Dead: รถ.\nข ค ฆ sound k. ป พ ฟ ภ sound p. Dead: สุข, ภาพ."
        }
      ]
    },
    4: {
      title: "Mixed sort",
      blurb: "Everything together. No romanization. Just hold it or cut it.",
      intro: [
        {
          title: "No help now",
          body: "Plain finals, open vowels, hidden endings and disguised finals, all mixed.\nThe romanization is gone. Run the one test."
        }
      ]
    },
    5: {
      title: "Tone table",
      blurb: "Clues in, tone out. Learn the table before the words.",
      intro: [
        {
          title: "กา ก่า ก้า ก๊า ก๋า",
          body: "The five tones in order: สามัญ, เอก, โท, ตรี, จัตวา.\nEach button shows the tone's name and the mark that makes that tone on a mid-class letter like ก.\nA word with no mark still has one of these tones. This level teaches you which one."
        },
        {
          title: "The whole table in three lines",
          body: "คำเป็น → สามัญ. Except อักษรสูง → จัตวา.\nคำตาย → เอก. Except อักษรต่ำ.\nอักษรต่ำ คำตาย: สระสั้น → ตรี (นก, รัก). สระยาว → โท (มาก, ลูก)."
        },
        {
          title: "Clues first, words later",
          body: "You see clues like อักษรสูง · คำตาย and pick the tone. There's no word to read yet.\nVowel length only matters for อักษรต่ำ คำตาย. Everywhere else, ignore it.\nOnce the table is automatic, the words get easy."
        }
      ]
    },
    6: {
      title: "Read the tone",
      blurb: "Real words. The chip shows the class.",
      intro: [
        {
          title: "Three questions, one tone",
          body: "Which class is the first letter? Is it คำเป็น or คำตาย? If it's อักษรต่ำ คำตาย, is the vowel short or long?\nThe chip shows the class for now."
        },
        {
          title: "Same three lines",
          body: "คำเป็น → สามัญ. Except อักษรสูง → จัตวา.\nคำตาย → เอก. Except อักษรต่ำ: สระสั้น → ตรี, สระยาว → โท."
        }
      ]
    },
    7: {
      title: "Speed read",
      blurb: "No class chip. Under 2 seconds each.",
      intro: [
        {
          title: "Chip off, clock on",
          body: "The class chip is hidden and a timer runs.\nUnder 2 seconds counts as fluent."
        },
        {
          title: "How to pass",
          body: "Get 11 of 12 right in two rounds.\nYour median answer must also be under 2 seconds."
        }
      ]
    }
  };

  // Live/dead reasons, one per ruleKey. Placeholders the UI fills in:
  //   {letter}  the deciding letter or vowel as written (e.g. "ร", "า", "ำ", "เ‑า")
  //   {sound}   the ending sound in Latin letters: n m ng y w k p t
  const reasons = {
    "final-live":    "Ends in {letter} ({sound}). You can hold {sound}. Live.",
    "final-dead":    "Ends in {letter} ({sound}). You can't hold {sound}. Dead.",
    "disguised-n":   "{letter} at the end sounds n. You can hold n. Live.",
    "disguised-t":   "{letter} at the end sounds t. You can't hold t. Dead.",
    "disguised-kp":  "{letter} at the end sounds {sound}. You can't hold {sound}. Dead.",
    "open-long":     "{letter} is a long vowel. It rings on. Live.",
    "open-short":    "{letter} is a short vowel. It stops short. Dead.",
    "hidden-ending": "{letter} hides an ending {sound}. You can hold {sound}. Live."
  };

  // Tone names as Thai learners say them. `mark` is the mark that produces this
  // tone on a mid-class letter (the กา ก่า ก้า ก๊า ก๋า chant). It is a memory aid
  // for the SOUND: unmarked words have no mark, and on low-class letters the marks
  // give different tones (ไม้เอก on a low-class letter sounds โท).
  const toneNames = {
    mid:     { th: "สามัญ", mark: "",  rom: "saaman", noMark: "ไม่มีรูป" },
    low:     { th: "เอก",   mark: "่", rom: "ek" },
    falling: { th: "โท",    mark: "้", rom: "tho" },
    high:    { th: "ตรี",   mark: "๊", rom: "tri" },
    rising:  { th: "จัตวา", mark: "๋", rom: "jattawa" }
  };

  const classNames = {
    mid:  { th: "อักษรกลาง", en: "mid class" },
    high: { th: "อักษรสูง",  en: "high class" },
    low:  { th: "อักษรต่ำ",  en: "low class" }
  };

  const lifeNames = {
    live: { th: "คำเป็น", en: "live" },
    dead: { th: "คำตาย", en: "dead" }
  };

  const lengthNames = {
    short: { th: "สระสั้น", en: "short vowel" },
    long:  { th: "สระยาว", en: "long vowel" }
  };

  // The tone chant every Thai child learns, one syllable per tone.
  const chant = { mid: "กา", low: "ก่า", falling: "ก้า", high: "ก๊า", rising: "ก๋า" };

  // Which of the three table lines applied, one per toneKey. The whole table is:
  //   คำเป็น → สามัญ, except อักษรสูง → จัตวา
  //   คำตาย → เอก, except อักษรต่ำ
  //   อักษรต่ำ คำตาย: สระสั้น → ตรี, สระยาว → โท
  const toneRules = {
    "mid-live":       "คำเป็น → สามัญ. Mid class keeps the default.",
    "mid-dead":       "คำตาย → เอก. Vowel length doesn't matter for mid class.",
    "high-live":      "คำเป็น → สามัญ, except high class rises: จัตวา.",
    "high-dead":      "คำตาย → เอก, same as mid class. Vowel length doesn't matter.",
    "low-live":       "คำเป็น → สามัญ, same as mid class.",
    "low-dead-short": "คำตาย → เอก, except low class: สระสั้น → ตรี (นก, รัก).",
    "low-dead-long":  "คำตาย → เอก, except low class: สระยาว → โท (มาก, ลูก)."
  };

  const cheatSheet = {
    title: "Live or dead cheat sheet",
    test: "Can you hold the ending sound? Yes is live. No is dead.",
    live: {
      label: "Live · คำเป็น",
      points: [
        "Long open vowels: ตา ดี หมา ครู",
        "Endings n m y w ng (นมยวง): กิน ลม ยาว ยาย",
        "Hidden endings: ทำ ไป ใจ เรา"
      ]
    },
    dead: {
      label: "Dead · คำตาย",
      points: [
        "Short open vowels: จะ เตะ ดุ",
        "Endings k p t (กบด): ปาก จบ มด"
      ]
    },
    hidden: "‑ำ ไ‑ ใ‑ เ‑า end in a hidden m, y, y, w. You can hold it, so they are live even with a short vowel.",
    disguised: [
      "ร ล ญ ณ (ฬ) sound n at the end. Live: ผล คุณ",
      "จ ช ซ ศ ษ ส ต ท ธ ถ (ฎ ฏ ฐ ฑ ฒ) sound t. Dead: รถ",
      "ข ค ฆ sound k. Dead: สุข",
      "ป พ ฟ ภ sound p. Dead: ภาพ"
    ],
    classes: {
      mid: "ก จ ฎ ฏ ด ต บ ป อ",
      high: "ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห",
      low: "All the rest: ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ",
      note: "In a cluster the first letter decides. ห before ง ญ น ม ย ร ล ว is silent and makes it high class. อย is mid."
    },
    toneRules: [
      "คำเป็น → สามัญ · except อักษรสูง → จัตวา",
      "คำตาย → เอก · except อักษรต่ำ:",
      "อักษรต่ำ คำตาย: สระสั้น → ตรี (นก) · สระยาว → โท (มาก)"
    ],
    chant: "กา ก่า ก้า ก๊า ก๋า = สามัญ เอก โท ตรี จัตวา",
    toneTable: {
      headers: ["", "คำเป็น", "คำตาย สระสั้น", "คำตาย สระยาว"],
      rows: [
        ["อักษรกลาง", "สามัญ", "เอก", "เอก"],
        ["อักษรสูง", "จัตวา", "เอก", "เอก"],
        ["อักษรต่ำ", "สามัญ", "ตรี", "โท"]
      ]
    }
  };

  const ui = {
    moduleTitle: "Live or Dead",
    moduleSubtitle: "Hold it or cut it. Five minutes a day until it is automatic.",
    today: "Today's 5 minutes",
    todaySub: "Mixed review, weighted toward your weak spots.",
    cheatSheetButton: "Cheat sheet",
    live: "Live", dead: "Dead",
    liveTh: "คำเป็น", deadTh: "คำตาย",
    start: "Start", next: "Next", continue: "Tap to continue", skipIntro: "Skip intro",
    locked: "Pass the level before this one to unlock.",
    skipAheadTitle: "Skip ahead?",
    skipAheadBody: "This level builds on the ones before it. You can try it now, but it may feel fast.",
    skipAheadConfirm: "Try it anyway",
    cancel: "Cancel",
    roundDone: "Round done: {score} of {total}.",
    passedLevel: "Level passed. Next level unlocked.",
    notYet: "Not yet: {score} of {total}. Go again.",
    fluent: "Fluent: {seconds}s.",
    tooSlow: "Too slow: {seconds}s. Aim for under 2.",
    swipeHint: "Swipe left for Live, right for Dead. Keys: ← Live, → Dead.",
    tapToHear: "Tap to hear it",
    chantHint: "Sounds like {chant} in กา ก่า ก้า ก๊า ก๋า"
  };

  return { levels, reasons, toneNames, classNames, lifeNames, lengthNames, chant, toneRules, cheatSheet, ui };
})();
if (typeof module !== "undefined" && module.exports) module.exports = LiveDeadCopy;
