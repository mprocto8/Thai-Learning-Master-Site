# Codex task 02 — Live/Dead drill module (UI, state, routing)

You are working in the `Thai-Learning-Master-Site` repo, a vanilla JS web app for
learning Thai. Build a new drill module that teaches one decision until it is
automatic: **is this syllable live or dead, and so what tone is it?** Target:
under 2 seconds per syllable, five minutes a day.

Read `ARCHITECTURE.md`, `STATE_API.md` and `AI_HANDOFF.md` first. Look at
`js/tone-trainer.js` and `js/pattern-practice.js` for how a module renders,
registers keyboard handlers, awards XP and cleans up.

Do not commit. Do not install packages.

## Files you may touch

New:
- `js/livedead.js` — the module (global `LiveDead`)
- `js/livedead-audio.js` — audio manifest (global `LiveDeadAudio`), see Audio
- `tests/livedead.test.js` — Node test of the pure logic (selection, boxes, mastery)

Edit (only the lines described):
- `css/styles.css` — APPEND one clearly commented section `/* === Live / Dead module === */`
  at the end. Do not change existing rules, except adding the two tokens
  (`--live`, `--dead`) to the existing `:root` block and to the existing `.light-mode` block.
- `index.html` — add script tags (see Load order) and one Google Fonts `<link>`
  for "Noto Sans Thai Looped" (weights 400;600;700, `display=swap`) next to the
  stylesheet link, with `<link rel="preconnect">` for fonts.googleapis.com and fonts.gstatic.com.
- `js/app.js` — register the route(s) in `init()`, next to the other `UI.registerRoute` calls. Nothing else.
- `js/audio.js` — add one public method `playLiveDead(th)` (see Audio). Nothing else.
- `js/state.js` — add `livedead: null` to `defaults()` with a short comment. Nothing else.

Do NOT touch: `js/syllable.js`, `js/livedead-data.js`, `js/livedead-copy.js`,
`tests/syllable.test.js`, `tools/*`, `js/pathways.js` or any Learn-tab entry
point (another agent owns those; some may still be in progress while you work).

## Repo constraints (do not violate)

- Vanilla HTML/CSS/JS. No build step, no ES modules, no frameworks, no TS.
- Revealing module pattern: IIFEs exposing globals. Files live in `js/`.
- Routing through `UI.registerRoute` / `UI.navigate` (hash based). Note
  `UI.navigate` to the current hash does nothing — re-render directly instead.
- All persistence through the State API (`State.get()`, `State.set(key, v)`,
  `State.update(fn)`). No `localStorage` anywhere outside `state.js`.
- All audio through the `Audio` global in `js/audio.js`.
- Theming through CSS custom properties. No hard-coded colors in component
  rules except where you define the two new tokens. Escape anything rendered
  from data (write a small `esc()` helper; escape `& < > " '`).
- Respect the iOS safe-area insets already handled in the app shell (the body
  already pads for them; keep fixed/bottom UI inside `env(safe-area-inset-bottom)`).
- Feature modules never depend on each other. `LiveDead` may use: `State`, `UI`,
  `Audio`, `Syllable`, `LiveDeadData`, `LiveDeadCopy`, `LiveDeadAudio`.
- On leaving the route, remove listeners and clear timers via `UI.setCleanup(fn)`.
- Console must be clean (no errors or warnings) during normal use.

## Load order (index.html)

Add, after `js/audio.js` and before `js/app.js` (with the other feature modules):

```html
<script src="js/syllable.js"></script>
<script src="js/livedead-data.js"></script>
<script src="js/livedead-copy.js"></script>
<script src="js/livedead-audio.js"></script>
<script src="js/livedead.js"></script>
```

## Inputs you consume

### `Syllable.analyze(th)` (js/syllable.js, being written in parallel)

Returns `null` or:

```
{
  initial: "กล", cls: "mid"|"high"|"low", vowel: "<id>", length: "short"|"long",
  finalLetter: "ล"|null, finalSound: "n"|"m"|"ng"|"y"|"w"|"k"|"p"|"t"|null,
  mark: null|"ek"|"tho"|"tri"|"chattawa",
  live: true|false, tone: "mid"|"low"|"falling"|"high"|"rising",
  decider: { kind: "final"|"vowel"|"hidden", indices: [..] }, // indices into th (UTF-16 chars) to highlight
  initialIndices: [..],     // indices of the initial consonant(s) in th
  ruleKey: "final-live"|"final-dead"|"open-long"|"open-short"|"hidden-ending"|"disguised-n"|"disguised-t"|"disguised-kp",
  toneKey: "mid-live"|"mid-dead"|"high-live"|"high-dead"|"low-live"|"low-dead-short"|"low-dead-long"
}
```

Analyze every word once (lazily on first show) and cache it. Skip words that
return `null` silently (the data gate guarantees there are none).

### `LiveDeadData.words` (js/livedead-data.js, generated)

Array of `{ th, rom, en }`. About 240 one-syllable words, no tone marks.

### `LiveDeadCopy` (js/livedead-copy.js, being written in parallel)

```
LiveDeadCopy = {
  levels: { 1..6: { title, blurb, intro: [ {title, body} ] } },   // body: plain text, "\n" = paragraph break
  reasons: { [ruleKey]: "text with {letter} and {sound} placeholders, ends 'Live.' or 'Dead.'" },
  toneChains: { [toneKey]: "Low class → dead → long vowel → falling" },
  toneNames: { mid|low|falling|high|rising: { en, th } },
  classNames: { mid, high, low },
  cheatSheet: { title, test, live:{label,points[]}, dead:{label,points[]}, hidden, disguised[], classes:{mid,high,low,note}, toneTable:{headers[], rows[][]} },
  ui: { moduleTitle, moduleSubtitle, today, todaySub, cheatSheetButton, live, dead, liveTh, deadTh,
        start, next, continue, skipIntro, locked, skipAheadTitle, skipAheadBody, skipAheadConfirm, cancel,
        roundDone, passedLevel, notYet, fluent, tooSlow, swipeHint, tapToHear }
        // roundDone/passedLevel/notYet may contain {score} {total}; fluent/tooSlow may contain {seconds}
}
```

All copy strings are plain text: escape them, never inject as HTML. Fill
placeholders by simple replace. Use the copy for every user-visible string the
copy file covers; if a key is missing at runtime, fall back to a sensible
English default rather than throwing.

Filling `{letter}` and `{sound}` for `reasons[ruleKey]`:
- final-based keys: `{letter}` = `finalLetter`, `{sound}` = `finalSound`.
- `open-long` / `open-short`: `{letter}` = the vowel built from `decider.indices`:
  take those chars in order; prefix a combining mark (U+0E31, U+0E34–U+0E3A,
  U+0E47–U+0E4E) with "◌" (U+25CC); join non-adjacent index runs with "‑" (U+2011)
  (so เตะ → "เ‑ะ", ดี → "◌ี", ตา → "า"). `{sound}` unused.
- `hidden-ending`: fixed map by the vowel chars present — ำ → `{letter}`="‑ำ", `{sound}`="m";
  ไ → "ไ‑","y"; ใ → "ใ‑","y"; เ+า → "เ‑า","w".

## Teaching model (for feedback and the cheat sheet)

One test: **can you hold the ending sound?** Live (คำเป็น): long open vowels and
endings n m y w ng. Dead (คำตาย): short open vowels and endings k p t. ‑ำ ไ‑ ใ‑
เ‑า end in a hidden m, y, y, w, so they are live. Every piece of feedback states
the reason in this vocabulary and highlights the letter or vowel that decided it.

| Initial class | Live   | Dead, short vowel | Dead, long vowel |
|---------------|--------|-------------------|------------------|
| Mid           | mid    | low               | low              |
| High          | rising | low               | low              |
| Low           | mid    | high              | falling          |

## Levels

Each level has a pool of rule keys. Live/dead levels ask Live or Dead; tone levels ask one of five tones.

| # | Title (from copy) | Pool | Question | Romanization | Class chip | Timer |
|---|---|---|---|---|---|---|
| 1 | Hold it or cut it | final-live, final-dead | live/dead | shown | — | — |
| 2 | Open syllables | open-long, open-short, hidden-ending | live/dead | shown | — | — |
| 3 | Disguised finals | disguised-n, disguised-t, disguised-kp | live/dead | shown | — | — |
| 4 | Mixed sort | all 8 live/dead keys | live/dead | hidden | — | — |
| 5 | Tone | all 7 tone keys | tone | hidden | shown | — |
| 6 | Speed read | all 7 tone keys | tone | hidden | hidden | shown |

- Each level opens with its intro cards (`LiveDeadCopy.levels[n].intro`, at
  most 3) the first time it is played, with a "skip intro" control. Later plays
  go straight to the drill; the level row offers a small "intro" link to re-read them.
- A round is 12 items.
- English gloss (`en`) is shown small under the romanization when romanization is shown,
  and always on the feedback after answering.

## Home screen (`#livedead`)

- Back link to `#learn`, title + subtitle from copy.
- A primary "Today's 5 minutes" button.
- The six levels as a list: title, blurb, status (locked / open / passed),
  best score. Levels unlock in order (level n is unlocked when level n‑1 is
  passed; level 1 always). Every level stays tappable: tapping a locked level
  opens an in-page confirmation panel (not `window.confirm`) using
  `skipAheadTitle` / `skipAheadBody` / `skipAheadConfirm` / `cancel`.
- A "Cheat sheet" button that opens `#livedead/cheat`: renders
  `LiveDeadCopy.cheatSheet` including the class → tone table.

Suggested sub-routes (register `#livedead` and handle the rest by parsing the hash):
`#livedead`, `#livedead/cheat`, `#livedead/level/<n>`, `#livedead/today`.

## Drill screen

- One large syllable per screen, centred, in "Noto Sans Thai Looped" (fallback
  to the system Thai font), at least 96px on phone, larger on desktop
  (`clamp(96px, 22vw, 160px)` or similar). Answer controls in the thumb zone at
  the bottom of the viewport (respect safe-area).
- Progress (item k of 12) at the top; a quit control back to `#livedead`.
- **Live / Dead**: two buttons side by side spanning the full width, Live on the
  LEFT (amber `--live`), Dead on the RIGHT (teal `--dead`), each with its label,
  Thai label (คำเป็น / คำตาย) and its shape (see Look). Also:
  - swipe on the syllable card: swipe LEFT (toward the Live button) = Live,
    swipe RIGHT (toward Dead) = Dead. Use pointer events, ~60px horizontal
    threshold, ignore mostly-vertical drags, give the card a small follow-the-finger
    translate while dragging (none with reduced motion).
  - keyboard: ← = Live, → = Dead.
- **Tone**: five buttons in the fixed order mid, low, falling, high, rising,
  each with a small inline-SVG pitch contour and the English + Thai name. Keys
  1–5 map to the same order. On narrow phones they may wrap to 3+2 or be a single
  row of five compact buttons; they must stay in that order.
- Level 5 shows a chip above the syllable with the initial's class
  (`classNames[cls]`). Level 6 hides it and shows a slim timer bar that fills over
  2 seconds and changes state when 2s is passed (do not hard-stop the item; the
  answer still counts, the time is recorded).
- Record the response time (ms from item shown to answer) for every item.
- **Correct**: show the reason line for ~1100ms, then advance automatically.
- **Wrong**: show the reason with the deciding letters highlighted in the big
  syllable and the correct answer marked, then wait for a tap anywhere on the
  feedback / a Continue button / Space or Enter.
- Reason line: for live/dead questions, `reasons[ruleKey]` filled in. For tone
  questions, `toneChains[toneKey]` plus the live/dead reason line under it.
- Highlighting: split the syllable into grapheme clusters (a base character plus
  any following combining marks). Wrap a cluster in `<span class="ld-hl ...">`
  if any of its char indices are in the highlight set. For live/dead feedback
  highlight `decider.indices`; for tone feedback highlight `decider.indices`
  and `initialIndices` (use a distinct class for the initial so it reads as "class").
  Never split a combining mark from its base (that breaks Thai rendering).
- **Audio**: tapping the syllable plays its clip only when
  `LiveDeadAudio.has(th)` is true. If there is no clip, show no audio affordance
  and do nothing on tap (a tap must not count as an answer). The module must work
  fully with no audio.
- End of round: score, median time, which rules were missed (by reason name),
  pass/not-yet message, buttons "Next round" and back to the home screen.

## Review by rule, not by word

Every item maps to one rule: its `ruleKey` on live/dead levels, its `toneKey`
on tone levels.

Per rule keep `{ box: 0-4, seen, correct, lastSeen }` (lastSeen = epoch ms).
Correct moves the box up one (max 4); wrong resets it to 0.

Item selection: from the level's pool of rules (only rules that have at least one
word), choose a rule with probability proportional to `5 - box`, then pick a word
for that rule not seen in the last 10 items (fall back to any word of that rule).

**Today's 5 minutes**: draws from every unlocked level (passed levels plus the
first unpassed one) with the same weighting — choose a level uniformly, then a
rule from its pool by weight, then the word. The question type follows the
chosen level. Runs for 5 minutes of wall-clock time (show the remaining time),
ending after the item in progress when time is up, or when the user quits. It
updates rule boxes but does not count as a level round.

## Mastery

A level is passed after two rounds (not necessarily consecutive) scoring at
least 11 of 12. For level 6 a round only qualifies if its median answer time is
also under 2000 ms. Passing is permanent. Skipping ahead does not mark the
skipped levels as passed; it just lets the user play the locked level.
There is no existing mastery hook for extra modules, so keep all of this in the
module's own state key and do not touch `topicStats` or other existing data.

XP: `State.addXP(3)` per correct answer and `State.checkStreak()` on each correct
answer (like other modules); `State.addXP(20)` on completing a level round. If
`addXP` returns a level, call `UI.celebrate(level.name, level.emoji)` after the round.

## State

One key, `livedead`, via `State.get().livedead` / `State.set("livedead", obj)`
(or `State.update`). Initialise lazily when null. Shape:

```
{
  rules: { [ruleKey|toneKey]: { box, seen, correct, lastSeen } },
  levels: { 1: { rounds, good, passed, best, introSeen }, ... 6 },   // rounds = rounds played, good = qualifying rounds
  lastSession: { at: <epoch ms>, mode: "level"|"today", level: n|null, score, total, medianMs }
}
```

Write after every answer (so a reload mid-round keeps rule progress) and at the
end of every round. State must survive a reload.

## Audio

`js/livedead-audio.js`:

```js
// js/livedead-audio.js — which Live/Dead words have a recorded clip.
// Rewritten by the audio generation script; empty means "no audio", and the module works without it.
const LiveDeadAudio = (function () {
  const words = [];
  function has(th) { return words.indexOf(th) !== -1; }
  return { words, has };
})();
```

`js/audio.js`: add and export

```js
/** Play a Live/Dead drill syllable. File: audio/{voice}/livedead-{hex}.mp3 where
 *  hex = each UTF-16 code unit of th as 4 lowercase hex digits, concatenated
 *  (กิน → 0e010e340e19). No TTS fallback: a missing clip resolves silently. */
function playLiveDead(th) { ... }
```

Implement it with the existing private `_playMp3(url, null)` and `_voiceFolder()`
(passing `null` as fallback text already means "no TTS"). Call it synchronously
inside the tap handler (iOS gesture rule).

## Look

- Use the app's existing custom properties for surfaces, text, spacing, radii and type
  (`--bg-*`, `--surface-*`, `--text-*`, `--sp-*`, `--r-*`, `--shadow-*`, `--ease`).
- Add exactly two new semantic tokens used everywhere in this module and nowhere
  else: `--live` (amber) and `--dead` (teal). In `:root` (dark default):
  `--live: #f59e0b; --dead: #2dd4bf;`. In `.light-mode`: darker shades with
  ≥4.5:1 contrast against `--bg-1` (#ffffff) for text use, e.g. `--live: #b45309; --dead: #0f766e;`.
  Live is always amber and on the left. Dead is always teal and on the right.
- Never rely on color alone: pair each with a shape. Live gets a line that
  trails off (inline SVG stroke that tapers/fades out at its right end); Dead
  gets a line that ends in a hard stop (stroke ending in a short perpendicular
  bar). Use these shapes on the buttons, in feedback ("Live"/"Dead" verdict),
  and in the cheat sheet.
- Thai glyphs large (≥96px on phone) in the looped face so ข/ช/ซ and ด/ค stay distinguishable.
- Respect `prefers-reduced-motion` (no card drag translate, no transitions/animations).
- Visible focus states (`:focus-visible` outline using the module tokens or `--accent`).
- Layout must work at 390px and 1280px wide with no horizontal scroll. On
  desktop constrain the drill to a centred column (~560px).
- Prefix every class with `ld-`.

## Pure logic + test

Keep selection, box updates and mastery evaluation in pure functions that take
their inputs explicitly (no DOM, no State access), and expose them as
`LiveDead._test = { pickRule, pickWord, applyAnswer, evaluateRound, median }`
(names may differ slightly; document them at the top of the test).

`tests/livedead.test.js` (plain Node, no framework): load the file with a
minimal stub of `window`, `State`, `UI`, `Audio`, `Syllable`, `LiveDeadData`,
`LiveDeadCopy`, `LiveDeadAudio` (use `vm` or set globals then `require`), and
assert:
- `applyAnswer`: correct moves box +1 capped at 4; wrong resets to 0; seen/correct counted.
- `pickRule`: with a seeded/injected random, a box-0 rule is chosen ~5× as often as a box-4 rule (statistical check over many draws with a loose tolerance).
- `pickWord`: never returns a word from the last 10 when an alternative exists.
- `evaluateRound`: 11/12 qualifies, 10/12 doesn't; level 6 also needs median < 2000.
- Passing requires two qualifying rounds.

Exit code 1 on failure.

## Acceptance (I will verify in a real browser afterwards)

1. `node tests/livedead.test.js` exits 0.
2. No `localStorage` outside `state.js`; no `import`/`export`; all data-rendered text escaped.
3. Every level can be played to the end of a 12-item round with touch, swipe and keyboard.
4. With `LiveDeadAudio.words` empty, no audio button/affordance appears anywhere.
5. Your final message lists every file you changed and any decision you made that
   isn't spelled out above.
