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
      title: "Tone",
      blurb: "Class, live or dead, then the tone.",
      intro: [
        {
          title: "Live or dead picks the row",
          body: "You already know live or dead. Add the class of the first letter: mid, high or low.\nThe chip shows the class for now."
        },
        {
          title: "One line per class",
          body: "Mid class: live is mid, dead is low.\nHigh class: live is rising, dead is low.\nLow class: live is mid, dead short is high, dead long is falling."
        }
      ]
    },
    6: {
      title: "Speed read",
      blurb: "Tones with no class chip. Under 2 seconds each.",
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

  // Tone chain lines, one per toneKey.
  const toneChains = {
    "mid-live":       "Mid class → live → mid",
    "mid-dead":       "Mid class → dead → low",
    "high-live":      "High class → live → rising",
    "high-dead":      "High class → dead → low",
    "low-live":       "Low class → live → mid",
    "low-dead-short": "Low class → dead → short vowel → high",
    "low-dead-long":  "Low class → dead → long vowel → falling"
  };

  const toneNames = {
    mid:     { en: "mid",     th: "สามัญ" },
    low:     { en: "low",     th: "เอก" },
    falling: { en: "falling", th: "โท" },
    high:    { en: "high",    th: "ตรี" },
    rising:  { en: "rising",  th: "จัตวา" }
  };

  const classNames = { mid: "Mid class", high: "High class", low: "Low class" };

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
    toneTable: {
      headers: ["Class", "Live", "Dead · short", "Dead · long"],
      rows: [
        ["Mid", "mid", "low", "low"],
        ["High", "rising", "low", "low"],
        ["Low", "mid", "high", "falling"]
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
    tapToHear: "Tap to hear it"
  };

  return { levels, reasons, toneChains, toneNames, classNames, cheatSheet, ui };
})();
if (typeof module !== "undefined" && module.exports) module.exports = LiveDeadCopy;
