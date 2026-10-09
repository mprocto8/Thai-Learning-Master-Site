# Codex task 03 — Live/Dead: Thai tone names + new "Tone table" level

Repo: `Thai-Learning-Master-Site` (vanilla JS, no build, revealing-module IIFEs,
State API for persistence). Read `AI_HANDOFF.md` (section "Live/Dead decisions"),
`ARCHITECTURE.md`, `STATE_API.md`, then the CURRENT `js/livedead.js` carefully
(it contains hand fixes — keep them: `paint()`, `goHome()`, `RULE_LABELS`,
verdict/highlight colour logic, skip-panel placement, countdown fix).

Do not commit. Do not install anything.

## Files you may touch

- `js/livedead.js`
- `css/styles.css` — only inside the `/* === Live / Dead module === */` section (append/modify there)
- `tests/livedead.test.js`
- `js/pathways.js` — only `renderLiveDeadCard()`: progress is now out of 7 levels, not 6

Do NOT touch `js/livedead-copy.js` (being rewritten in parallel to the schema
below), `js/syllable.js`, data, audio, docs.

## Goal

The learner knows the Thai tone names (สามัญ, เอก, โท, ตรี, จัตวา) and marks
(่ ้ ๊ ๋). Tone levels must show those instead of English tone words, and a new
level must drill the class × live/dead × length → tone table itself, because
remembering that table is the hard part.

## New level structure (7 levels)

| # | Copy key | Pool | Question | Prompt | Romanization | Class chip | Timer |
|---|---|---|---|---|---|---|---|
| 1 | levels.1 | final-live, final-dead | live/dead | word | shown | — | — |
| 2 | levels.2 | open-long, open-short, hidden-ending | live/dead | word | shown | — | — |
| 3 | levels.3 | disguised-n/t/kp | live/dead | word | shown | — | — |
| 4 | levels.4 | all 8 live/dead keys | live/dead | word | hidden | — | — |
| 5 | levels.5 **NEW "Tone table"** | `table:` + each of the 7 toneKeys | tone | **clue chips, no word** | — | — | — |
| 6 | levels.6 (was 5) | 7 toneKeys | tone | word | hidden | shown | — |
| 7 | levels.7 (was 6) | 7 toneKeys | tone | word | hidden | hidden | shown |

- Speed rule (median < 2000 ms to qualify) now applies to level **7** (was 6).
  Update `evaluateRound` / tests accordingly. Level 5 has no speed rule.
- Home screen lists 7 levels. "Today's 5 minutes" draws from unlocked levels
  as before (now possibly including level 5 table items).

### State migration

Add `version: 2` to the `livedead` state. In `initState()`: if the stored state
has no `version` (or version < 2), migrate: old `levels[6]` → `levels[7]`, old
`levels[5]` → `levels[6]`, new fresh `levels[5]` = `{ rounds: 0, good: 0, passed: false, best: 0, introSeen: false }`,
set `version = 2`, save. Also ensure every level 1..7 exists (fill missing with
fresh objects) so code like `st.levels[n].introSeen = true` can never throw.
Rule boxes (`rules`) are unchanged; new table rules use keys `table:mid-live`,
`table:mid-dead`, `table:high-live`, `table:high-dead`, `table:low-live`,
`table:low-dead-short`, `table:low-dead-long`.

## Level 5 "Tone table" items

Items are synthesised, not words. `pickRule` over the 7 `table:` keys (same
`5 - box` weighting; they always "have items"). For the chosen toneKey build:

```
{ kind: "table", toneKey, cls, life: "live"|"dead", length: "short"|"long"|null, tone }
```
- cls/life/tone follow the toneKey (mid-live → mid, live, tone mid; mid-dead → low;
  high-live → rising; high-dead → low; low-live → mid; low-dead-short → high;
  low-dead-long → falling).
- `length`: for every DEAD item show a length chip. For low-dead-short/long it is
  determined by the key. For mid-dead and high-dead pick short or long at random
  (the learner must learn that length only matters for low class). Live items
  have no length chip.
- Avoid repeating the identical clue combination twice in a row when possible.

Prompt screen (instead of the big syllable): a row/stack of 2–3 large chips:
class chip (`LiveDeadCopy.classNames[cls].th` big, `.en` small), life chip
(`LiveDeadCopy.lifeNames[life].th` big, `.en` small; live chip uses `--live`
colour + trailing-line shape, dead uses `--dead` + hard-stop shape, as elsewhere),
and when length is set a length chip (`LiveDeadCopy.lengthNames[length]`).
Chips must be large and readable at 390px (Thai text ≥ 28px). Answer with the
tone buttons (same as tone levels).

Feedback for table items: verdict (tone name in Thai + mark + contour), the
chain line, the rule line, the chant line (see Feedback below), and one example
word from the word bank with that toneKey (`th` + `rom`), picked at random.

## Tone buttons (levels 5–7)

Fixed order mid, low, falling, high, rising, keys 1–5 (unchanged). Each button shows:
- the Thai tone name large: `LiveDeadCopy.toneNames[t].th` (สามัญ / เอก / โท / ตรี / จัตวา)
- the mark: `LiveDeadCopy.toneNames[t].mark` rendered on a dotted circle
  ("◌" + mark, e.g. "◌่") in the Thai font; for mid (empty mark) show
  `LiveDeadCopy.toneNames.mid.noMark` (e.g. "ไม่มีรูป") small instead
- the existing small pitch-contour SVG
- small `rom` text (saaman / ek / tho / tri / jattawa) and the key number
- NO English tone words ("falling" etc.) anywhere on tone levels.

Make the five buttons fit at 390px without horizontal scroll (3+2 wrap is fine,
order must read left-to-right, top-to-bottom). The Thai name must be ≥ 20px.

## Feedback (levels 5–7)

Replace the English tone verdict/chain with:

1. Result line (unchanged logic: "Correct" / "Not quite. You picked {X}." —
   X is now the Thai tone name, e.g. "เสียงโท").
2. Verdict: contour + `เสียง` + Thai name + " " + "◌"+mark (mid: no mark), e.g. "เสียงตรี ◌๊".
3. Chain line, built from copy parts, Thai:
   `classNames[cls].th → lifeNames[life].th [→ lengthNames[length].th] → เสียง + toneNames[tone].th`
   Include the length step ONLY for low-class dead (that's where it matters).
   e.g. "อักษรต่ำ → คำตาย → สระยาว → เสียงโท", "อักษรสูง → คำเป็น → เสียงจัตวา".
4. Rule line: `LiveDeadCopy.toneRules[toneKey]` (plain text).
5. Chant line: `fill(LiveDeadCopy.ui.chantHint, { chant: LiveDeadCopy.chant[tone] })`
   e.g. "Sounds like ก๋า in กา ก่า ก้า ก๊า ก๋า".
6. For word items (levels 6–7) keep the existing live/dead reason line and the
   word highlights, and the rom · en line.

On wrong answers on levels 6–7 also keep highlighting the initial (class) and the
deciding letters as now.

Class chip on level 6: `classNames[cls].th` big + `.en` small.

Round summary "Missed rules" for tone keys: use the Thai chain for that key
(e.g. "อักษรต่ำ → คำตาย → สระสั้น → เสียงตรี"); for `table:` keys the same chain
prefixed by "Table: ".

## Cheat sheet

Render `LiveDeadCopy.cheatSheet.toneRules` (array of 3 strings) prominently
above the table, then `cheatSheet.chant` (string, Thai font, large), then the
table from `cheatSheet.toneTable` ({ headers: [...], rows: [[...], ...] }; cells
are plain strings, already Thai). Keep the existing live/dead parts.

## Copy schema you code against (being written in parallel — use exactly these keys, with safe fallbacks)

```js
LiveDeadCopy.levels[1..7] = { title, blurb, intro: [{ title, body }] }
LiveDeadCopy.toneNames = {
  mid:     { th: "สามัญ", mark: "",  rom: "saaman",  noMark: "ไม่มีรูป" },
  low:     { th: "เอก",   mark: "่", rom: "ek" },
  falling: { th: "โท",    mark: "้", rom: "tho" },
  high:    { th: "ตรี",   mark: "๊", rom: "tri" },
  rising:  { th: "จัตวา", mark: "๋", rom: "jattawa" }
}
LiveDeadCopy.classNames  = { mid: { th: "อักษรกลาง", en: "mid class" }, high: { th: "อักษรสูง", en: "high class" }, low: { th: "อักษรต่ำ", en: "low class" } }
LiveDeadCopy.lifeNames   = { live: { th: "คำเป็น", en: "live" }, dead: { th: "คำตาย", en: "dead" } }
LiveDeadCopy.lengthNames = { short: { th: "สระสั้น", en: "short vowel" }, long: { th: "สระยาว", en: "long vowel" } }
LiveDeadCopy.chant = { mid: "กา", low: "ก่า", falling: "ก้า", high: "ก๊า", rising: "ก๋า" }
LiveDeadCopy.toneRules = { "mid-live": "...", "mid-dead": "...", ... 7 keys }   // plain text
LiveDeadCopy.ui.chantHint = "Sounds like {chant} in กา ก่า ก้า ก๊า ก๋า"
LiveDeadCopy.cheatSheet.toneRules = ["...", "...", "..."]
LiveDeadCopy.cheatSheet.chant = "กา ก่า ก้า ก๊า ก๋า = สามัญ เอก โท ตรี จัตวา"
LiveDeadCopy.cheatSheet.toneTable = { headers: [...], rows: [[...]] }
```
NOTE: `classNames` changes from strings to `{ th, en }` objects — update every
use. `toneChains` is removed — build chains in code as described.
Existing keys `reasons`, `ui.*` (live, dead, liveTh, deadTh, …) remain.

Everything rendered from copy or data must be escaped (use the existing `esc`).
Thai text in chips/buttons/verdict uses the module's Thai font
(`"Noto Sans Thai Looped", "Noto Sans Thai", Tahoma, sans-serif`).

## Tests (`tests/livedead.test.js`)

Update for 7 levels: speed rule on level 7 only (level 6 with slow median still
qualifies); migration test (old state with levels 1..6 → levels 5 fresh, old 5→6,
old 6→7, version 2; rules preserved) — expose the migration as a pure function
in `LiveDead._test` (e.g. `migrateState`); table-item builder test (dead mid/high
items always get a length; live items never do; low-dead keys get the matching
length) — expose e.g. `buildTableItem(toneKey, rand)`. Stub copy as needed.

## Acceptance

- `node tests/livedead.test.js` and `node tests/syllable.test.js` exit 0.
- No English tone words ("mid", "low", "falling", "high", "rising") visible on
  levels 5–7 buttons, verdicts or chains (rom labels like "tri" are fine).
- Final message: files changed, anything you decided that isn't spelled out here.
