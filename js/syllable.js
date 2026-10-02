const Syllable = (function () {
  const MID = "กจฎฏดตบปอ";
  const HIGH = "ขฃฉฐถผฝศษสห";
  const LOW = "คฅฆงชซฌญฑฒณทธนพฟภมยรลวฬฮ";
  const CONSONANTS = MID + HIGH + LOW;
  const TONE_MARKS = { "่": "ek", "้": "tho", "๊": "tri", "๋": "chattawa" };
  const PREPOSED = "เแโไใ";
  const VOWEL_SIGNS = "ะัาำิีึืุูเแโไใอวย็";
  const H_LEADS = "งญนมยรลว";
  const TRUE_CLUSTERS = [
    "กร", "กล", "กว", "ขร", "ขล", "ขว", "คร", "คล", "คว",
    "ตร", "ปร", "ปล", "พร", "พล", "ผล"
  ];

  const FINAL_SOUNDS = {
    "ก": "k", "ข": "k", "ค": "k", "ฆ": "k",
    "ด": "t", "ต": "t", "จ": "t", "ช": "t", "ซ": "t", "ฎ": "t",
    "ฏ": "t", "ฐ": "t", "ฑ": "t", "ฒ": "t", "ถ": "t", "ท": "t",
    "ธ": "t", "ศ": "t", "ษ": "t", "ส": "t",
    "บ": "p", "ป": "p", "พ": "p", "ฟ": "p", "ภ": "p",
    "น": "n", "ณ": "n", "ญ": "n", "ร": "n", "ล": "n", "ฬ": "n",
    "ม": "m", "ง": "ng", "ย": "y", "ว": "w"
  };

  function has(set, ch) {
    return set.indexOf(ch) !== -1;
  }

  function CLASS_OF(letter) {
    if (has(MID, letter)) return "mid";
    if (has(HIGH, letter)) return "high";
    if (has(LOW, letter)) return "low";
    return null;
  }

  function FINAL_SOUND_OF(letter) {
    return FINAL_SOUNDS[letter] || null;
  }

  function isConsonant(ch) {
    return has(CONSONANTS, ch);
  }

  function isFinal(ch) {
    return !!FINAL_SOUND_OF(ch);
  }

  function finalRuleKey(letter) {
    if (has("มนงยว", letter)) return "final-live";
    if (has("กบด", letter)) return "final-dead";
    if (has("รลญณฬ", letter)) return "disguised-n";
    if (has("จชซฎฏฐฑฒตถทธศษส", letter)) return "disguised-t";
    if (has("ขคฆปพฟภ", letter)) return "disguised-kp";
    return null;
  }

  function stripToneMarks(word) {
    const chars = Array.from(word);
    const stripped = [];
    const map = [];
    let mark = null;

    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i];
      if (TONE_MARKS[ch]) {
        if (mark) return null;
        mark = TONE_MARKS[ch];
        continue;
      }
      if (ch === "์" || ch === "ๆ" || ch === "ฤ" || ch === "ฦ") return null;
      if (!isConsonant(ch) && !has(VOWEL_SIGNS, ch)) return null;
      stripped.push(ch);
      map.push(i);
    }

    return { chars, stripped, map, mark };
  }

  function normalCandidates(s, m, start) {
    const out = [];
    if (!isConsonant(s[start])) return out;

    out.push({
      start,
      end: start + 1,
      text: s[start],
      cls: CLASS_OF(s[start]),
      initialIndices: [m[start]]
    });

    if (start + 1 >= s.length || !isConsonant(s[start + 1])) return out;

    const pair = s[start] + s[start + 1];
    if (s[start] === "ห" && has(H_LEADS, s[start + 1])) {
      out.push({
        start,
        end: start + 2,
        text: pair,
        cls: "high",
        initialIndices: [m[start], m[start + 1]]
      });
    } else if (pair === "อย") {
      out.push({
        start,
        end: start + 2,
        text: pair,
        cls: "mid",
        initialIndices: [m[start], m[start + 1]]
      });
    } else if (TRUE_CLUSTERS.indexOf(pair) !== -1) {
      out.push({
        start,
        end: start + 2,
        text: pair,
        cls: CLASS_OF(s[start]),
        initialIndices: [m[start], m[start + 1]]
      });
    }

    return out;
  }

  function candidatesFor(s, m) {
    const out = [];

    if (has(PREPOSED, s[0])) {
      normalCandidates(s, m, 1).forEach(function (c) {
        c.pre = 0;
        out.push(c);
      });
    } else {
      normalCandidates(s, m, 0).forEach(function (c) {
        c.pre = null;
        out.push(c);
      });
    }

    if (s[0] === "ห" && has("ไใ", s[1]) && has(H_LEADS, s[2])) {
      out.push({
        start: 0,
        end: 3,
        pre: 1,
        text: "ห" + s[2],
        cls: "high",
        initialIndices: [m[0], m[2]]
      });
    }

    return out;
  }

  function makeOpen(id, length, indices) {
    return {
      vowel: id,
      length,
      finalLetter: null,
      finalSound: null,
      live: length === "long",
      ruleKey: length === "long" ? "open-long" : "open-short",
      decider: { kind: "vowel", indices }
    };
  }

  function makeFinal(id, length, finalPos, s, m) {
    const finalLetter = s[finalPos];
    const finalSound = FINAL_SOUND_OF(finalLetter);
    const ruleKey = finalRuleKey(finalLetter);
    if (!finalSound || !ruleKey) return null;
    return {
      vowel: id,
      length,
      finalLetter,
      finalSound,
      live: finalSound === "n" || finalSound === "m" || finalSound === "ng" ||
        finalSound === "y" || finalSound === "w",
      ruleKey,
      decider: { kind: "final", indices: [m[finalPos]] }
    };
  }

  function makeHidden(id, indices) {
    return {
      vowel: id,
      length: "short",
      finalLetter: null,
      finalSound: null,
      live: true,
      ruleKey: "hidden-ending",
      decider: { kind: "hidden", indices }
    };
  }

  function parseCandidate(s, m, c) {
    const n = s.length;
    const p = c.end;
    const lead = c.pre === null ? null : s[c.pre];
    const leadIdx = c.pre === null ? null : m[c.pre];
    const parses = [];

    function add(parse) {
      if (parse) parses.push(parse);
    }

    if (lead === "ไ" || lead === "ใ") {
      if (p === n) add(makeHidden(lead === "ไ" ? "ai" : "ai2", [leadIdx]));
      if (p + 1 === n && s[p] === "ย") add(makeHidden("aiy", [leadIdx, m[p]]));
    }

    if (lead === "เ" && p + 1 === n && s[p] === "า") {
      add(makeHidden("ao", [leadIdx, m[p]]));
    }

    if (lead === "เ" && p + 2 === n && s[p] === "า" && s[p + 1] === "ะ") {
      add(makeOpen("aw", "short", [leadIdx, m[p], m[p + 1]]));
    }
    if (lead === "เ" && p + 2 === n && s[p] === "อ" && s[p + 1] === "ะ") {
      add(makeOpen("oe", "short", [leadIdx, m[p], m[p + 1]]));
    }
    if (lead === "เ" && p + 3 === n && s[p] === "ี" && s[p + 1] === "ย" && s[p + 2] === "ะ") {
      add(makeOpen("ia", "short", [leadIdx, m[p], m[p + 1], m[p + 2]]));
    }
    if (lead === "เ" && p + 3 === n && s[p] === "ื" && s[p + 1] === "อ" && s[p + 2] === "ะ") {
      add(makeOpen("uea", "short", [leadIdx, m[p], m[p + 1], m[p + 2]]));
    }

    if ((lead === "เ" || lead === "แ") && p + 1 === n && s[p] === "ะ") {
      add(makeOpen(lead === "เ" ? "e" : "ae", "short", [leadIdx, m[p]]));
    }
    if ((lead === "เ" || lead === "แ") && p + 2 === n && s[p] === "็" && isFinal(s[p + 1])) {
      add(makeFinal(lead === "เ" ? "e" : "ae", "short", p + 1, s, m));
    }
    if (lead === "โ" && p + 1 === n && s[p] === "ะ") {
      add(makeOpen("o", "short", [leadIdx, m[p]]));
    }

    if (lead === "เ" && p + 1 === n && s[p] === "อ") {
      add(makeOpen("oe", "long", [leadIdx, m[p]]));
    }
    if (lead === "เ" && p + 2 === n && s[p] === "ิ" && isFinal(s[p + 1])) {
      add(makeFinal("oe", "long", p + 1, s, m));
    }
    if (lead === "เ" && p + 2 === n && s[p] === "ี" && s[p + 1] === "ย") {
      add(makeOpen("ia", "long", [leadIdx, m[p], m[p + 1]]));
    }
    if (lead === "เ" && p + 3 === n && s[p] === "ี" && s[p + 1] === "ย" && isFinal(s[p + 2])) {
      add(makeFinal("ia", "long", p + 2, s, m));
    }
    if (lead === "เ" && p + 2 === n && s[p] === "ื" && s[p + 1] === "อ") {
      add(makeOpen("uea", "long", [leadIdx, m[p], m[p + 1]]));
    }
    if (lead === "เ" && p + 3 === n && s[p] === "ื" && s[p + 1] === "อ" && isFinal(s[p + 2])) {
      add(makeFinal("uea", "long", p + 2, s, m));
    }

    if ((lead === "เ" || lead === "แ" || lead === "โ") && p === n) {
      add(makeOpen(lead === "เ" ? "ee" : lead === "แ" ? "aae" : "oo", "long", [leadIdx]));
    }
    if ((lead === "เ" || lead === "แ" || lead === "โ") && p + 1 === n && isFinal(s[p])) {
      add(makeFinal(lead === "เ" ? "ee" : lead === "แ" ? "aae" : "oo", "long", p, s, m));
    }

    if (lead !== null) return parses;

    if (p + 1 === n && s[p] === "ำ") add(makeHidden("am", [m[p]]));
    if (p + 1 === n && s[p] === "ะ") add(makeOpen("a", "short", [m[p]]));
    if (p + 2 === n && s[p] === "ั" && isFinal(s[p + 1])) add(makeFinal("a", "short", p + 1, s, m));
    if (p + 1 === n && s[p] === "า") add(makeOpen("aa", "long", [m[p]]));
    if (p + 2 === n && s[p] === "า" && isFinal(s[p + 1])) add(makeFinal("aa", "long", p + 1, s, m));

    ["ิ", "ึ", "ุ"].forEach(function (v) {
      const id = v === "ิ" ? "i" : v === "ึ" ? "ue" : "u";
      if (p + 1 === n && s[p] === v) add(makeOpen(id, "short", [m[p]]));
      if (p + 2 === n && s[p] === v && isFinal(s[p + 1])) add(makeFinal(id, "short", p + 1, s, m));
    });
    ["ี", "ู"].forEach(function (v) {
      const id = v === "ี" ? "ii" : "uu";
      if (p + 1 === n && s[p] === v) add(makeOpen(id, "long", [m[p]]));
      if (p + 2 === n && s[p] === v && isFinal(s[p + 1])) add(makeFinal(id, "long", p + 1, s, m));
    });
    if (p + 2 === n && s[p] === "ื" && isFinal(s[p + 1])) add(makeFinal("ueue", "long", p + 1, s, m));
    if (p + 2 === n && s[p] === "ื" && s[p + 1] === "อ") add(makeOpen("ueue", "long", [m[p], m[p + 1]]));

    if (p + 3 === n && s[p] === "็" && s[p + 1] === "อ" && isFinal(s[p + 2])) {
      add(makeFinal("aw", "short", p + 2, s, m));
    }
    if (p + 1 === n && s[p] === "อ") add(makeOpen("aw", "long", [m[p]]));
    if (p + 2 === n && s[p] === "อ" && isFinal(s[p + 1])) add(makeFinal("aw", "long", p + 1, s, m));

    if (p + 3 === n && s[p] === "ั" && s[p + 1] === "ว" && s[p + 2] === "ะ") {
      add(makeOpen("ua", "short", [m[p], m[p + 1], m[p + 2]]));
    }
    if (p + 2 === n && s[p] === "ั" && s[p + 1] === "ว") {
      add(makeOpen("ua", "long", [m[p], m[p + 1]]));
    }
    if (p + 2 === n && s[p] === "ว" && isFinal(s[p + 1])) {
      add(makeFinal("ua", "long", p + 1, s, m));
    }

    if (p + 1 === n && isFinal(s[p])) add(makeFinal("o", "short", p, s, m));

    return parses;
  }

  function toneKeyFor(cls, live, length) {
    if (live) return cls + "-live";
    if (cls === "low") return length === "short" ? "low-dead-short" : "low-dead-long";
    return cls + "-dead";
  }

  function toneFor(cls, live, length, mark) {
    if (mark === "ek") return cls === "low" ? "falling" : "low";
    if (mark === "tho") return cls === "low" ? "high" : "falling";
    if (mark === "tri") return "high";
    if (mark === "chattawa") return "rising";

    if (live) return cls === "high" ? "rising" : "mid";
    if (cls === "low") return length === "short" ? "high" : "falling";
    return "low";
  }

  function analyze(word) {
    if (typeof word !== "string" || word.length === 0) return null;
    if (word.indexOf("รร") !== -1) return null;
    const stripped = stripToneMarks(word);
    if (!stripped || stripped.stripped.length === 0) return null;
    const s = stripped.stripped;
    const m = stripped.map;
    const parses = [];

    candidatesFor(s, m).forEach(function (candidate) {
      parseCandidate(s, m, candidate).forEach(function (parse) {
        parses.push({ candidate, parse });
      });
    });

    if (parses.length === 0) return null;
    parses.sort(function (a, b) {
      if (a.parse.vowel === "ua" && b.parse.vowel !== "ua") return -1;
      if (a.parse.vowel !== "ua" && b.parse.vowel === "ua") return 1;
      return b.candidate.initialIndices.length - a.candidate.initialIndices.length;
    });

    const chosen = parses[0];
    const c = chosen.candidate;
    const p = chosen.parse;
    const toneKey = toneKeyFor(c.cls, p.live, p.length);

    return {
      initial: c.text,
      cls: c.cls,
      vowel: p.vowel,
      length: p.length,
      finalLetter: p.finalLetter,
      finalSound: p.finalSound,
      mark: stripped.mark,
      live: p.live,
      tone: toneFor(c.cls, p.live, p.length, stripped.mark),
      decider: p.decider,
      initialIndices: c.initialIndices,
      ruleKey: p.ruleKey,
      toneKey
    };
  }

  return {
    analyze,
    CLASS_OF,
    FINAL_SOUND_OF
  };
})();
if (typeof module !== "undefined" && module.exports) module.exports = Syllable;
