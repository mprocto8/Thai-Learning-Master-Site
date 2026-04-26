# data/sentences.js Audit Report

## Scope and methodology

Each entry has both `words: []` (the Thai puzzle pieces) and `romanized: ""` (one string). At runtime, `splitRomanized()` in `js/sentence-builder.js` splits the romanized string by whitespace and redistributes tokens into N chunks (one per Thai word) using `Math.floor(tokens/words)` + remainder. So when the romanized contains a multi-token transliteration of a single Thai compound (e.g. `Wan Jan` for `วันจันทร์`), the splitter can put `Wan` with the wrong Thai chunk and leave `Jan` orphaned on the next piece. Both dimensions are audited:

1. **Thai `words[]` tokenization** — does each chunk correspond to a natural Thai unit (compound noun, fixed phrase) without splitting compounds?
2. **Romanized alignment** — do the romanized tokens distribute evenly into chunks aligned with `words[]`? Anywhere a Thai chunk maps to a multi-token romanization that contains a literal space, the splitter is at risk of misalignment.

The vast majority of issues found are dimension #2 (romanized has internal spaces inside a compound transliteration). The fix is usually to replace the internal space with a hyphen so the splitter keeps the compound as a single token (this is already the prevailing convention in the file — e.g. `Wan-jan` would behave correctly).

I am not a native Thai speaker. Confidence levels reflect that — HIGH means I'm confident in the boundary, MEDIUM means a Thai teacher could reasonably argue either way, LOW means I'm flagging it for the user but unsure.

## Summary
- Total sentences audited: **99**
- HIGH confidence issues: **14**
- MEDIUM confidence issues: **9**
- LOW confidence issues: **2**
- Cross-exercise inconsistencies: **1**

---

## HIGH Confidence Issues

### Sentence #0 — line 9
**English:** Today is Monday
**Currently:** `words: ["วันนี้", "คือ", "วันจันทร์"]`, `romanized: "Wan níi khue Wan Jan"`
**Suggested:** `romanized: "Wan-níi khue Wan-jan"` (or `Wanjan`)
**Reason:** 5 romanized tokens, 3 words → splitter produces `["Wan níi", "khue Wan", "Jan"]`. `Wan` ends up paired with `คือ` and `Jan` ends up alone. `วันจันทร์` is a single word in Thai. Hyphenating the compound transliterations keeps them paired with their Thai chunk. Same pattern as user's reported example.

### Sentence #1 — line 10
**English:** Tomorrow is Friday
**Currently:** `words: ["พรุ่งนี้", "คือ", "วันศุกร์"]`, `romanized: "Phrûng níi khue Wan Sùk"`
**Suggested:** `romanized: "Phrûng-níi khue Wan-Sùk"`
**Reason:** Same structural issue as #0. 5 tokens, 3 words → mis-distributed. Both `พรุ่งนี้` and `วันศุกร์` are single Thai compounds.

### Sentence #13 — line 26
**English:** November has Loy Krathong
**Currently:** `words: ["พฤศจิกายน", "มี", "ลอยกระทง"]`, `romanized: "Phruét-sà-jì-kaa-yon mii Loi Grà-thong"`
**Suggested:** `romanized: "Phruét-sà-jì-kaa-yon mii Loi-Grà-thong"`
**Reason:** 4 tokens, 3 words → splitter yields `["Phruét-... mii", "Loi", "Grà-thong"]`. `Loi` and `Grà-thong` get split across pieces but `ลอยกระทง` is a single proper noun.

### Sentence #14 — line 27
**English:** December is New Year
**Currently:** `words: ["ธันวาคม", "เป็น", "ปีใหม่"]`, `romanized: "Than-waa-khom pen Bpii Mài"`
**Suggested:** `romanized: "Than-waa-khom pen Bpii-Mài"`
**Reason:** 4 tokens, 3 words → `Bpii` and `Mài` split. `ปีใหม่` is one compound (New Year).

### Sentence #19 — line 34
**English:** He is Thai
**Currently:** `words: ["เขา", "เป็น", "คนไทย"]`, `romanized: "Khǎo pen khon Thai"`
**Suggested:** `romanized: "Khǎo pen khon-Thai"`
**Reason:** 4 tokens, 3 words → `khon` and `Thai` split. `คนไทย` (a Thai person) is one compound.

### Sentence #28 — line 47
**English:** How are you doing?
**Currently:** `words: ["คุณ", "เป็นยังไง", "บ้าง"]`, `romanized: "Khun pen yang-ngai bâang?"`
**Suggested:** `romanized: "Khun pen-yang-ngai bâang?"`
**Reason:** 4 tokens, 3 words → `pen` and `yang-ngai` split, but `เป็นยังไง` is a single Thai chunk per the words array.

### Sentence #30 — line 49
**English:** No problem (female)
**Currently:** `words: ["ไม่เป็นไร", "ค่ะ"]`, `romanized: "Mâi pen rai khâ"`
**Suggested:** `romanized: "Mâi-pen-rai khâ"`
**Reason:** User's reported example. 4 tokens, 2 words → splitter produces `["Mâi pen", "rai khâ"]`. The Thai `words[]` is already correct (`ไม่เป็นไร` as one); only the romanized needs joining.

### Sentence #31 — line 50
**English:** See you tomorrow
**Currently:** `words: ["เจอกัน", "พรุ่งนี้"]`, `romanized: "Jur-gan phrûng níi"`
**Suggested:** `romanized: "Jur-gan phrûng-níi"`
**Reason:** 3 tokens, 2 words → `phrûng` ends up with `เจอกัน` and `níi` alone. `พรุ่งนี้` is one word.

### Sentence #32 — line 51
**English:** Are you well?
**Currently:** `words: ["คุณ", "สบายดี", "ไหม"]`, `romanized: "Khun sà-baai dii mǎi?"`
**Suggested:** `romanized: "Khun sà-baai-dii mǎi?"`
**Reason:** 4 tokens, 3 words → `sà-baai` and `dii` split. `สบายดี` is one chunk per `words[]`.

### Sentence #51 — line 78
**English:** It's okay / Never mind
**Currently:** `words: ["ไม่", "เป็นไร"]`, `romanized: "Mâi pen rai"`
**Suggested:** `words: ["ไม่เป็นไร"]`, `romanized: "Mâi-pen-rai"` (single chunk)
**Reason:** User's reported example. `ไม่เป็นไร` is a single fixed phrase and is treated as one chunk in #30. This entry splits it as `ไม่ / เป็นไร`, which is inconsistent and arguably teaches a wrong word boundary. Note: this would change the puzzle from 2 pieces to 1 piece, which is trivially solvable; if the exercise needs to remain non-trivial, a different sentence may be preferable, but the data should at minimum be standardized.

### Sentence #60 — line 91
**English:** Too expensive, can you discount?
**Currently:** `words: ["แพง", "ไป", "ลด", "ได้ไหม"]`, `romanized: "Phaeng pai lót dâi mǎi?"`
**Suggested:** `romanized: "Phaeng pai lót dâi-mǎi?"`
**Reason:** 5 tokens, 4 words → `dâi` and `mǎi` split, but `ได้ไหม` is one Thai chunk.

### Sentence #68 — line 101
**English:** A good friend is valuable
**Currently:** `words: ["เพื่อน", "ดี", "มีค่า", "มาก"]`, `romanized: "Phêuan dii mii khâa mâak"`
**Suggested:** `romanized: "Phêuan dii mii-khâa mâak"`
**Reason:** 5 tokens, 4 words → `mii` and `khâa` split. `มีค่า` is one compound (valuable).

### Sentence #84 — line 125
**English:** Do you have water?
**Currently:** `words: ["มี", "น้ำเปล่า", "ไหม"]`, `romanized: "Mii náam bplào mǎi?"`
**Suggested:** `romanized: "Mii náam-bplào mǎi?"`
**Reason:** 4 tokens, 3 words → `náam` and `bplào` split. `น้ำเปล่า` (plain water) is one chunk.

### Sentence #86 — line 127
**English:** Pay here please
**Currently:** `words: ["จ่ายเงิน", "ตรงนี้", "ครับ"]`, `romanized: "Jàai-ngoen trong níi khráp"`
**Suggested:** `romanized: "Jàai-ngoen trong-níi khráp"`
**Reason:** 4 tokens, 3 words → `trong` and `níi` split. `ตรงนี้` is one demonstrative.

### Sentence #87 — line 128
**English:** I'll take this one
**Currently:** `words: ["รับ", "อันนี้", "ค่ะ"]`, `romanized: "Ráp an níi khâ"`
**Suggested:** `romanized: "Ráp an-níi khâ"`
**Reason:** 4 tokens, 3 words → `an` and `níi` split. `อันนี้` is one demonstrative.

### Sentence #90 — line 133
**English:** I have a headache
**Currently:** `words: ["ปวด", "หัว", "มาก"]`, `romanized: "Pùat-hǔa mâak"`
**Suggested options:**
  - (A) merge: `words: ["ปวดหัว", "มาก"]`, `romanized: "Pùat-hǔa mâak"` (matches the romanized as written)
  - (B) split: `words: ["ปวด", "หัว", "มาก"]`, `romanized: "Pùat hǔa mâak"` (3 tokens, 3 words)
**Reason:** Token count mismatch — `words.length = 3`, romanized tokens = 2. The splitter produces `["Pùat-hǔa", "mâak", ""]` with an empty third chunk. Either the Thai needs to be merged (reflecting `ปวดหัว` as one verb-compound, which matches how the romanized is written), or the romanized needs to drop the hyphen so it matches the 3-piece split. (A) is more idiomatic — `ปวดหัว` is a standard compound — but I'm flagging both options for the user.

---

## MEDIUM Confidence Issues

These are pedagogically defensible either way, but the user may want to standardize.

### Sentence #4 — line 13
**English:** This week is very busy
**Currently:** `words: ["อาทิตย์", "นี้", "ยุ่ง", "มาก"]`
**Suggested:** `words: ["อาทิตย์นี้", "ยุ่ง", "มาก"]`
**Reason:** `อาทิตย์นี้` (this week) is normally one demonstrative phrase. Splitting `อาทิตย์` from `นี้` is unusual; in #5 the same pattern uses `อาทิตย์หน้า` as one chunk.

### Sentence #6 — line 17
**English:** What time is it now?
**Currently:** `words: ["ตอนนี้", "กี่", "โมง"]`
**Suggested:** `words: ["ตอนนี้", "กี่โมง"]` or keep
**Reason:** `กี่โมง` is a fixed question form. Splitting `กี่` and `โมง` is defensible for teaching the classifier pattern, but most natives treat it as a unit.

### Sentence #11 — line 24
**English:** January the weather is cool
**Currently:** `words: ["เดือน", "มกราคม", "อากาศ", "เย็น"]`
**Suggested:** `words: ["เดือนมกราคม", "อากาศ", "เย็น"]`
**Reason:** `เดือนมกราคม` (the month of January) is more naturally one phrase. The other month sentences (#12, #13, #14) use bare `เมษายน`, `พฤศจิกายน`, `ธันวาคม` without `เดือน` — pick a convention.

### Sentence #15 — line 28
**English:** This month is very hot
**Currently:** `words: ["เดือน", "นี้", "ร้อน", "มาก"]`
**Suggested:** `words: ["เดือนนี้", "ร้อน", "มาก"]`
**Reason:** Same as #4 — `เดือนนี้` (this month) is naturally one chunk.

### Sentence #38 — line 61
**English:** Thai food is delicious
**Currently:** `words: ["อาหาร", "ไทย", "อร่อย"]`
**Suggested:** `words: ["อาหารไทย", "อร่อย"]`
**Reason:** `อาหารไทย` (Thai food) is a single compound noun; splitting `อาหาร` from `ไทย` is unusual. Compare #19's `คนไทย` which is kept as one chunk in `words[]`.

### Sentence #46 — line 71
**English:** It's upstairs
**Currently:** `words: ["อยู่", "ชั้น", "บน"]`
**Suggested:** `words: ["อยู่", "ชั้นบน"]`
**Reason:** `ชั้นบน` (upper floor / upstairs) is a compound noun. `ชั้น` alone is just "floor"; the meaning depends on combining with `บน`.

### Sentence #52 — line 79
**English:** Have you eaten yet?
**Currently:** `words: ["กิน", "ข้าว", "หรือ", "ยัง"]`
**Suggested:** `words: ["กินข้าว", "หรือยัง"]` or `["กินข้าว", "หรือ", "ยัง"]`
**Reason:** `กินข้าว` is the standard compound for "to eat (a meal)" — note it appears as one chunk in #20 (`["เรา", "ไป", "กินข้าว", "ด้วยกัน"]`). And `หรือยัง` is the standard "yet?" tag question. Current 4-piece tokenization is inconsistent with #20.

### Sentence #64 — line 97
**English:** Father works every day
**Currently:** `words: ["พ่อ", "ทำงาน", "ทุก", "วัน"]`
**Suggested:** `words: ["พ่อ", "ทำงาน", "ทุกวัน"]`
**Reason:** `ทุกวัน` (every day) is a fixed adverbial. Splitting `ทุก` from `วัน` is unusual.

### Sentence #83 — line 122
**English:** Taking the BTS is faster
**Currently:** `words: ["นั่ง", "รถไฟฟ้า", "เร็ว", "กว่า"]`
**Suggested:** keep, OR `["นั่ง", "รถไฟฟ้า", "เร็วกว่า"]`
**Reason:** `เร็วกว่า` is the comparative form (faster). Splitting `เร็ว` from `กว่า` could be pedagogically intentional to teach the `กว่า` comparative pattern, so this may be a deliberate choice.

---

## LOW Confidence Issues

### Sentence #39 — line 62
**English:** This house is very big
**Currently:** `words: ["บ้าน", "นี้", "ใหญ่", "มาก"]`
**Possible:** `words: ["บ้านนี้", "ใหญ่", "มาก"]`
**Reason:** Like #4 and #15, `บ้านนี้` (this house) is more natural as one chunk. But this is subtler than `เดือนนี้` and may be intentionally split for pattern practice.

### Sentence #93 — line 136
**English:** I'm not feeling well
**Currently:** `words: ["ไม่", "สบาย", "ต้อง", "พักผ่อน"]`
**Possible:** `words: ["ไม่สบาย", "ต้อง", "พักผ่อน"]`
**Reason:** `ไม่สบาย` (sick / unwell) is often treated as a fixed phrase. But `ไม่` + adjective is also a productive pattern, so splitting is defensible.

---

## Inconsistencies Across Exercises

### Phrase: `ไม่เป็นไร` ("no problem / never mind")
- **Sentence #30** (No problem): `words: ["ไม่เป็นไร", "ค่ะ"]` — kept as one chunk
- **Sentence #51** (It's okay / Never mind): `words: ["ไม่", "เป็นไร"]` — split
- **Recommendation:** Standardize on `["ไม่เป็นไร"]` (matching #30 — the more common analysis). Note: in the Essential Verbs vocabulary topic the same phrase exists at line 78 of `sentences.js` (#51), and consistency with #30 also matches how the data is displayed in vocabulary cards.

### Phrase: `กินข้าว` ("eat a meal")
- **Sentence #20** (Let's go eat together): `words: [..., "กินข้าว", ...]` — one chunk
- **Sentence #52** (Have you eaten yet?): `words: ["กิน", "ข้าว", ...]` — split
- **Recommendation:** Use `กินข้าว` as one chunk consistently.

### `วันนี้` (today)
Used as one chunk in #0 and #34 ✓ — consistent.

### `พรุ่งนี้` (tomorrow)
Used as one chunk in #1 and #31 ✓ — consistent (but romanized in #1 needs hyphenation per the HIGH issue above).

### Day names (`วันจันทร์`, `วันศุกร์`, `วันเสาร์`, `วันอาทิตย์`)
All kept as one chunk ✓ — consistent. Romanized has spaces in some that need hyphenation (#0, #1).

---

## Audit Notes

**Pattern observed:** The dominant class of issue is *not* in the Thai `words[]` array — most Thai tokenizations are correct or defensibly arguable. The dominant class is in the `romanized` field, where multi-syllable transliterations of compound Thai words are written with literal spaces (`Wan Jan`, `Bpii Mài`, `Loi Grà-thong`, `náam bplào`). The puzzle-piece splitter then splits those compound transliterations across pieces, even though the underlying Thai is correctly one chunk. Mechanical fix: replace the internal space with a hyphen. The file already uses this convention in many places (e.g. `Aa-thít`, `Wan-Jan`-style hyphens elsewhere) — the issues found are unhyphenated outliers.

**Cases requiring genuine Thai-tokenization changes** (not just romanized hyphenation): #51 (split `ไม่เป็นไร`), and the MEDIUM-confidence demonstratives/compounds where I think the chunking is suboptimal. #90 has a token-count mismatch that requires a real decision (merge `ปวด` + `หัว`, or de-hyphenate the romanized).

**Knowledge gaps:** I am not a native speaker. Where Thai grammar pedagogy might intentionally split a compound to teach a sub-pattern (e.g. `เร็วกว่า` → `เร็ว` + `กว่า` to teach comparatives, `ไม่สบาย` → `ไม่` + `สบาย` to teach negation), I have flagged the cases as MEDIUM/LOW so the user can decide. I have not flagged anything HIGH unless the boundary is essentially uncontroversial (single-word compound nouns, fixed phrases, proper-noun compounds like `วันจันทร์` and `ลอยกระทง`).

**Audio implication:** Per the architecture, audio files are named `sentence-{exerciseIdx}-word-{wordIdx}.mp3`. Changing `words[]` array length or contents will require regenerating the affected entries. Changing only the `romanized` field does **not** require any audio regeneration — the audio is generated from `words[]`, not from `romanized`. The bulk of the HIGH-confidence fixes here are romanized-only and free of audio cost.

**Files audited:** `data/sentences.js` only. No changes made.
