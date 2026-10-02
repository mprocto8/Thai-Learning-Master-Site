# Codex task 01 — Thai syllable rule engine

You are working in the `Thai-Learning-Master-Site` repo (vanilla JS web app for
learning Thai). Implement a pure rule engine and its tests. Touch ONLY these files:

- `js/syllable.js` (new)
- `tests/syllable.test.js` (new)
- `tools/check-livedead.js` (new)

Do not edit any other file. Do not install packages. Do not commit.

## Repo constraints

- Vanilla JS. No build step, no ES modules (`import`/`export`), no TypeScript.
- Revealing module pattern: an IIFE assigned to a global.
  `js/syllable.js` must work both in the browser (plain `<script>` tag, defines
  global `Syllable`) and in Node. End the file with:
  `if (typeof module !== "undefined" && module.exports) module.exports = Syllable;`
- Plain Node for tests: `node tests/syllable.test.js`. No test framework. Print a
  pass/fail line per fixture and exit with code 1 on any failure.
- Keep the code readable; tables of letters as constants at the top.

## API

`Syllable.analyze(word)` returns `null` for anything it cannot parse as ONE
regular Thai syllable, otherwise:

```
{
  initial: "กล",            // initial consonant or cluster as written (incl. leading ห / อ)
  cls: "mid"|"high"|"low",
  vowel: "a"|"aa"|...,       // any stable internal id
  length: "short"|"long",
  finalLetter: "ล"|null,
  finalSound: "n"|"m"|"ng"|"y"|"w"|"k"|"p"|"t"|null,
  mark: null|"ek"|"tho"|"tri"|"chattawa",
  live: true|false,
  tone: "mid"|"low"|"falling"|"high"|"rising",
  decider: { kind: "final"|"vowel"|"hidden", indices: [..] }, // char indices in the ORIGINAL input string to highlight for the live/dead decision
  initialIndices: [..],      // char indices of the initial consonant(s) in the original input (used to highlight class)
  ruleKey: "...",            // live/dead family, see below
  toneKey: "..."             // tone family, see below
}
```

Also expose `Syllable.CLASS_OF(letter)` → "mid"|"high"|"low"|null and
`Syllable.FINAL_SOUND_OF(letter)` → sound or null (handy for the UI).

Indices must refer to the input string as given (with tone marks), so the UI can
wrap those exact characters in `<mark>`.

`decider` rules:
- `final`: indices of the final consonant letter.
- `vowel` (open syllables): indices of all vowel characters (e.g. `า`, `เ…ะ`, `ื`+`อ`).
- `hidden` (ำ ไ ใ เ‑า, ไCย): indices of the vowel characters (`ำ`; `ไ`/`ใ`; `เ` and `า`; for ไCย the `ไ` and the `ย`).

`ruleKey` (exactly one per word):
- `final-live`  — final written ม น ง ย ว (plain live finals; includes เCย)
- `final-dead`  — final written ก บ ด (plain dead finals)
- `disguised-n` — final ร ล ญ ณ ฬ
- `disguised-t` — final จ ช ซ ฎ ฏ ฐ ฑ ฒ ต ถ ท ธ ศ ษ ส
- `disguised-kp`— final ข ค ฆ ป พ ฟ ภ
- `open-long`   — no final, long vowel
- `open-short`  — no final, short vowel
- `hidden-ending` — ‑ำ, ไ‑, ใ‑, เ‑า, ไCย

`toneKey` (exactly one per word, computed from class + live/dead + length, ignoring marks):
`mid-live`, `mid-dead`, `high-live`, `high-dead`, `low-live`, `low-dead-short`, `low-dead-long`.

## The teaching model (for context)

- Live: long open vowels, endings n m y w ng. Dead: short open vowels, endings k p t.
- ‑ำ, ไ‑, ใ‑, เ‑า end in a hidden m, y, y, w → live even though the vowel is short.

Tone with NO tone mark:

| Initial class | Live   | Dead, short vowel | Dead, long vowel |
|---------------|--------|-------------------|------------------|
| Mid           | mid    | low               | low              |
| High          | rising | low               | low              |
| Low           | mid    | high              | falling          |

Tone marks: mai ek (่): mid/high → low, low → falling. mai tho (้): mid/high →
falling, low → high. mai tri (๊) → high. mai chattawa (๋) → rising.
`live` is still computed from the spelling when a mark is present.

## Consonant classes

- Mid: ก จ ฎ ฏ ด ต บ ป อ
- High: ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห
- Low: every other consonant (ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ)
- Cluster: the first consonant decides. ห + (ง ญ น ม ย ร ล ว) is high with ห
  silent. อย is mid with อ silent.
- Valid true clusters: กร กล กว ขร ขล ขว คร คล คว ตร ปร ปล พร พล ผล.
  Leading-ห and อย also count as valid two-letter initials.
  Any other two leading consonants → `null`.

## Final sounds

- k: ก ข ค ฆ
- t: ด ต จ ช ซ ฎ ฏ ฐ ฑ ฒ ถ ท ธ ศ ษ ส
- p: บ ป พ ฟ ภ
- n: น ณ ญ ร ล ฬ
- m: ม · ng: ง · y: ย · w: ว

## Vowel patterns (C = initial incl. cluster, F = final; strip tone marks first, but keep index mapping)

| Pattern | Length | Notes |
|---|---|---|
| Cะ, CัF | short | a |
| Cา(F) | long | aa |
| Cิ(F), Cึ(F), Cุ(F) | short | |
| Cี(F), Cื F, Cือ, Cู(F) | long | ื without อ needs a final |
| เCะ, เC็F, แCะ, แC็F, โCะ | short | |
| เC(F), แC(F), โC(F) | long | |
| เCาะ, C็อF, เCอะ | short | |
| Cอ(F), เCอ, เCิF, เCย | long | เCย ends in y → live, ruleKey final-live |
| เCียะ, เCือะ, Cัวะ | short | rare |
| เCีย(F), เCือ(F), Cัว, CวF | long | CวF = ua with final (สวน, ขวด) |
| CF (consonants only) | short | implied o (คน, นก) |
| Cำ | short | hidden m, always live |
| ไC, ใC, ไCย | short | hidden y, always live |
| เCา | short | hidden w, always live |

Consonant-only strings: 2 letters = C + F. 3 letters with ว in the middle =
C + ua + F (กวน is kuan, not kwon; สวย = s + ua + y; หวง = h + ua + ng). 3 letters
otherwise = two-letter initial + F (กลม, ตรง, หมด). 4 letters = two-letter
initial + ว (ua) + F (กรวด, หนวด).

Careful orderings: check เCาะ before เCา; เCียะ before เCีย; เCือะ before เCือ;
เCอะ before เCอ; Cัวะ before Cัว. In Cอ(F), อ after an initial is the vowel, not
a consonant (ลอง, ขอ, ออก = initial อ + vowel อ + ก). Words starting with อ + a
consonant + vowel (อยาก, อยู่) use the อย initial. A tone mark sits after the
initial consonant (the second letter of a cluster) and before/over the vowel.

**Out of scope, return `null`:** more than one syllable, ์ (thanthakhat), ๆ, รร,
ฤ, ฦ, pseudo-clusters (ทร, สร, จร, ซร, ศร …), two tone marks, ั with no final,
non-Thai characters, empty string, anything not matching a pattern above.

## Fixtures — `tests/syllable.test.js` must assert ALL of these exactly

Check `live` and `tone` for each, and `null` for the last group.

- Mid + live → mid: กิน ดี ตา ไป จาน ปู เดิน ใจ ดำ
- Mid + dead → low: กบ จาก ปาก เด็ก ติด จะ เตะ เกาะ บาท ดุ
- High + live → rising: ขา สาม ผม หู ถุง สูง หมา หนู เสือ ไข ขาว สวย หวาน
- High + dead → low: สิบ ผัก ขาด หก ถูก สุข หมด หนัก หลับ
- Low + live → mid: มา นาน ลม คน ยาย งู ทำ ไฟ เรา ลอง เมือง คุณ ควาย
- Low + dead short → high: นก รัก คิด มด พบ ลด รถ และ เยอะ ทุก พริก ครับ
- Low + dead long → falling: มาก ยาก ลูก พูด เลือด รีบ โลก ภาพ เลข โรค ชอบ มีด
- With marks (tone only; check `live` is a boolean): ไม่ falling · ได้ falling ·
  น้ำ high · ข้าว falling · ที่ falling · ไก่ low · ม้า high · ใหม่ low ·
  ห้า falling · อยู่ low · จ๋า rising
- Must return `null`: ตลาด สนาม อาหาร จริง ทราย กอล์ฟ

Add a few more assertions of your own for: `ruleKey` and `toneKey` on ~10 words
spanning every key (e.g. กิน final-live/mid-live, กบ final-dead/mid-dead,
ขา open-long/high-live, จะ open-short/mid-dead, ทำ hidden-ending/low-live,
คุณ disguised-n/low-live, มีด final-dead/low-dead-long, สุข disguised-kp/high-dead,
รถ disguised-t/low-dead-short, ภาพ disguised-kp/low-dead-long), `decider.indices`
on ~5 words (e.g. ไม่ → hidden, indices [0]; ข้าว → final ว at index 3;
คุณ → final ณ at index 2), and `initialIndices` for a ห-leading word and a cluster.

If a fixture seems to contradict the patterns, the fixture wins; tell me which
and why in your final message.

## `tools/check-livedead.js`

A Node script (no deps) that gates the word list:

```
node tools/check-livedead.js <draft.json>
```

- Input: a JSON array of `{ th, rom, en, live, tone, category }` (category is a
  coverage code A–G; `live` boolean; `tone` one of the five tones).
- Loads `js/syllable.js` via `require`.
- For each item: `a = Syllable.analyze(th)`. Accept iff `a !== null`,
  `a.live === item.live`, `a.tone === item.tone`, and `th` is not a duplicate of
  an earlier accepted item.
- Writes `js/livedead-data.js` with the accepted items as a revealing-module
  global, exactly this shape (only th/rom/en stored; keep the draft order):

```js
// js/livedead-data.js — generated by tools/check-livedead.js. Do not hand-edit;
// edit the draft and re-run the gate. Live/dead and tone are computed at runtime
// by Syllable.analyze, never stored.
const LiveDeadData = (function () {
  const words = [
    { th: "กิน", rom: "gin", en: "eat" },
    ...
  ];
  return { words };
})();
if (typeof module !== "undefined" && module.exports) module.exports = LiveDeadData;
```

- Writes `AUDIT_LIVEDEAD.md`: a markdown table of every rejected item with
  columns `th | rom | en | category | draft live | draft tone | engine live |
  engine tone | reason` (reason ∈ `unparsed`, `live mismatch`, `tone mismatch`,
  `duplicate`), followed by a summary: accepted count, rejected count, and a
  coverage table of accepted words per `ruleKey`, per `toneKey`, per category,
  and per class (mid/high/low), flagging any ruleKey with fewer than 12 words.
- Prints the same summary to stdout. Exit 0 always (it's a report, not a test).
- Escape `"` and `\` properly when writing JS string literals.

## Acceptance

1. `node tests/syllable.test.js` exits 0 with every fixture passing.
2. `node tools/check-livedead.js <some small json you create in a temp dir>` runs
   and produces both outputs (then delete any `js/livedead-data.js` and
   `AUDIT_LIVEDEAD.md` you produced during your own testing, so the real run
   starts clean).
3. `js/syllable.js` has no `import`/`export`, no DOM access, no dependencies.

Finish with a short summary: anything ambiguous you decided, and any fixture
that needed special handling.
