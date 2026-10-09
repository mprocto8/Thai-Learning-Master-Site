# AI Tools Handoff — Thai Learner Project

> **For any AI agent working on this project (Codex, Cursor, GitHub Copilot, Gemini, Claude Code, etc.):** read this file first, then read `ARCHITECTURE.md` and `STATE_API.md`. Together they give you full context in under 200 lines.

---

## Project at a Glance

**Thai Learner** is a vanilla HTML/CSS/JS web app for learning the Thai language. Hosted on GitHub Pages at `mprocto8.github.io/Thai-Learning-Master-Site`. Uses Supabase for auth and cross-device sync. Uses ElevenLabs for pre-recorded native-quality audio (no runtime TTS for primary content).

**Current state (as of this writing):**
- 333+ vocabulary pairs across 30 topics
- Tier 1-5 pattern pathways shipped in the v2 IA (25 pattern topics)
- ~1,600 audio MP3s across two voice tiers (Ploy default, Serafina premium)
- Full auth + sync + tier framework in place
- Eight learning modes, plus the Live or Dead reading drill (`#livedead`, entry on the Learn tab)
- Primary tabs are now Home, Learn, Library, Settings. Old code/docs that refer to Pathways and Practice as primary tabs are deprecated; legacy routes still exist for bookmarks.

**Stage:** Active development. Solo developer (the user) building via AI-assisted workflows, primarily Claude Code with occasional other tools.

---

## Critical Constraints

These constraints are non-negotiable. Violating them breaks the app.

### Build system
- **NO build step.** No bundlers, no webpack, no rollup, no esbuild, no transpilation.
- **NO ES modules.** No `import` / `export` statements in JS.
- **NO TypeScript.** Plain JavaScript only.
- **NO frameworks.** No React, Vue, Svelte, Angular, etc.
- All JavaScript files use the **revealing module pattern** (IIFEs that expose a global object on `window`).
- Browser loads scripts via plain `<script>` tags in `index.html`. Order matters.

### File organization
- Application code lives in `/js/` (NOT `/src/`)
- Data files live in `/data/` (TOPICS, THAI_CONSONANTS, SENTENCES, PATHWAYS — read-only at runtime)
- Styles live in a single `/css/styles.css` file
- Pre-recorded audio lives in `/audio/{voice}/` where `{voice}` is `ploy` or `serafina`
- Generation scripts live in `/scripts/`
- API keys live in `/scripts/.env` (gitignored — never commit)

### Persistence
- **All state goes through `State` API** (defined in `js/state.js`). Read `STATE_API.md` for full reference.
- **No module touches `localStorage` directly.** State module owns localStorage.
- **No module touches Supabase directly except `js/supabase.js`.** State module delegates to it.
- Feature modules NEVER import or reference Supabase. They call State methods.

### Audio
- All audio playback goes through the `Audio` global (defined in `js/audio.js`).
- Audio files are pre-recorded MP3s organized by voice folder.
- The Audio module handles voice tier resolution: free users → `audio/ploy/`, premium users → their selected voice.
- Browser TTS is a last-resort fallback only (currently used in Time Game where audio is procedurally generated).

---

## Architecture Patterns You MUST Follow

### Revealing module pattern
Every JS file follows this shape:

```js
// js/example.js
const Example = (function() {
  // private functions and state here
  function privateHelper() { /* ... */ }
  
  function publicMethod(arg) {
    // ...
    return result;
  }
  
  return {
    publicMethod,
    // ... other public methods
  };
})();
```

Then in `index.html`:
```html
<script src="js/example.js"></script>
```

`Example` is now available globally to any script loaded after this one.

### Hash-based routing
Routes are registered via `UI.registerRoute()`. The hash format is typically `#routeName` or `#routeName/parameter`.

```js
UI.registerRoute("#game", () => {
  const topicId = window.location.hash.split("/")[1];
  Game.start(topicId);
});
```

`UI.navigate("#dashboard")` programmatically changes the hash.

IA v2 uses `#home`, `#learn`, `#library`, and `#settings` as primary destinations. Keep legacy `#dashboard`, `#pathways`, `#practice`, and `#script` routes working unless a future cleanup explicitly removes them.

### State as single source of truth
Anything that needs to persist or sync goes through State. Examples:
- `State.addXP(10)` — adds XP, returns level object if leveled up
- `State.recordTopicRound(topicId, correct, total)` — records game results
- `State.isPremium()` — checks tier
- `State.getProfile()` — returns user profile (null for guests)

Read `STATE_API.md` for the full method list.

### CSS theming
All colors are CSS custom properties defined in `:root`. Examples: `--bg-0`, `--text-0`, `--accent`, `--teal`. Dark mode toggles a class on `<body>`. **Do not hardcode colors in component CSS** — always reference variables.

### Topic types
Topics in `data/topics.js` have a `type` field:
- `"vocabulary"` — standard word/phrase pairs (default)
- `"situation"` — practical phrase packs (Ordering Food, Getting Around, etc.)
- `"pattern"` — frame-based patterns with slottable arrays for Pattern Practice mode

Each type renders differently and uses different learning modes.

---

## Common Tasks and How to Do Them

### Adding a new feature module
1. Create `js/your-feature.js` as a revealing module IIFE
2. Add `<script src="js/your-feature.js"></script>` in `index.html` BEFORE `js/app.js`
3. Register a route in `js/app.js` → `init()` if it has its own screen
4. Use `State` for any persistence
5. Use `UI.render(html)` to render the screen
6. Use `Audio.playWord/playSentence/playSlot` for audio
7. Update `ARCHITECTURE.md` with the new file's globals and dependencies

### Adding a new topic
1. Add the topic object to `data/topics.js` with the appropriate `type` field
2. For pattern topics, include the `frame` field and `slottable` arrays on each pair
3. Run `node scripts/generate-audio.js --voice=all` to generate audio for new content
4. Caching skips existing files; only the new pairs generate audio
5. Update README.md if the topic count is shown anywhere

### Adding a new learning mode
1. Create `js/your-mode.js` as a revealing module
2. Add to `index.html`
3. Register route in `js/app.js`
4. Add entry point in `js/practice-hub.js` (and dashboard topic cards if appropriate)
5. Use existing State methods for XP/streaks/stats — don't add new ones unless necessary
6. Style in `css/styles.css` with a clearly commented section header
7. Update `ARCHITECTURE.md`

### Modifying audio behavior
- Always go through `js/audio.js`
- Test on both desktop and iOS — iOS has stricter autoplay rules
- HTMLAudioElement.play() must be called synchronously inside a user-gesture handler on iOS
- Use the `playbackRate` property to change speed (NOT `speechSynthesis.rate`)

---

## Things That Will Break the App

Avoid these specifically — they're the patterns that have caused real bugs in the past:

### Audio bugs
- Setting `speechSynthesis.rate` for HTMLAudioElement playback (different APIs)
- Calling `audioElement.play()` after async work in iOS user-gesture handlers
- Hardcoding audio file paths with `audio/` instead of going through `getVoiceFolder()`
- Not handling 404s on missing MP3 files (need fallback chain)

### Routing bugs
- Calling `UI.navigate("#currentRoute")` to refresh — hash doesn't change, hashchange event doesn't fire, nothing rerenders
- Forgetting to register a route before calling `UI.navigate()` to it

### Indexing bugs
- Confusing display position with data index when audio files are indexed by data position
- Shuffling arrays without preserving original indices for audio lookup
- Off-by-one errors in slot-word audio generation (slot files are per slottable item, not per pair)

### State bugs
- Touching `localStorage` directly instead of through State methods
- Forgetting to call `State.save()` after a manual `state.foo = bar` assignment
- Storing user-specific data in module-level variables (lost on page reload)

### Audio generation bugs
- Forgetting to update generation script when adding new content types
- Not testing audio quality before committing 600+ files
- Hitting daily rate limits without expecting them (Gemini had 100/day for preview models)

---

## Key Files Reference

| File | Purpose | When to read |
|------|---------|--------------|
| `ARCHITECTURE.md` | Project map: every file, what it exports, what it depends on | Always read first |
| `STATE_API.md` | Every public method on the `State` object | Working on features that persist data |
| `data/topics.js` | All vocabulary content + pattern definitions | Adding/modifying content |
| `data/sentences.js` | Sentence Builder exercises | Working on Sentence Builder |
| `js/state.js` | Persistence, auth, sync, tier checks | State-related changes |
| `js/audio.js` | All audio playback logic | Audio-related changes |
| `js/ui.js` | Routing, render, nav, header bar | Routing or render changes |
| `scripts/generate-audio.js` | TTS generation pipeline | Audio content changes |
| `AUDIT_SENTENCES.md` | Existing audit of sentence tokenization issues | Content quality work |

---

## Working with the Existing Architecture Documents

The user maintains two living architecture documents:

**`ARCHITECTURE.md`** — A project map. Lists every file, what it exposes globally, and what it depends on. Updated after any structural change. Read it before any task.

**`STATE_API.md`** — Compact reference for the State module's public API. Every method, its arguments, and return type. Read it instead of parsing `js/state.js` for most tasks.

**Update these documents** when you make changes that affect their content. The user explicitly maintains them to keep AI tools efficient. If you add a new file, document it. If you add a new State method, document it.

---

## Common AI Failure Modes to Avoid

These are mistakes AI assistants have made on this project before:

1. **Assuming the project structure**. It's `/js/`, not `/src/`. There's no `package.json` for app code (only for scripts). There's no React.

2. **Adding dependencies unprompted.** Don't `npm install` anything in the app code. The runtime has zero dependencies.

3. **Refactoring "to be cleaner."** The codebase uses revealing module pattern intentionally. Don't convert it to ES modules. Don't add TypeScript. Don't add a build step.

4. **Forgetting iOS quirks.** The user tests on iPhone Safari frequently. Audio playback patterns that work on desktop Chrome may silently fail on iOS.

5. **Trusting your own Thai linguistics knowledge too much.** When making content decisions about Thai language, flag uncertainty with `// TODO: verify with native speaker` rather than guessing. The user has access to native speakers and prefers verification over guessing.

6. **Making large changes without commit checkpoints.** When a task spans multiple logical steps, commit after each step so the user can verify incrementally.

7. **Not reading the architecture documents first.** They exist for a reason. Reading them takes 2 minutes and prevents 30 minutes of wasted work.

---

## Workflow Conventions

This is a solo developer project. Push directly to main for all changes. Do NOT create feature branches or open PRs unless specifically asked. The user merges branches manually when they appear, which adds friction to the workflow.

### Commit messages
Format: `Imperative present tense action`. Examples:
- `Add Tier 2 survival patterns (6 patterns, 60 pairs)`
- `Fix Listen mode playback speed control`
- `Generate audio for fixed sentences (15 new files)`

### Investigating before fixing
The user prefers diagnosis-first work. If they describe a bug:
1. Read the relevant code
2. Confirm the bug exists as described (it may not — sometimes the diagnosis is wrong)
3. Identify the root cause
4. Propose the fix and either ask permission OR proceed if it's clearly safe
5. Don't just guess at fixes that match the description — actually verify

### Asking before making big content decisions
The user has a clear product vision but may not know all options. When you face a decision:
- "Generate 60 phrases or 100 phrases" → present the trade-offs, let them choose
- "Do we use Provider A or Provider B" → present both with honest assessment, recommend one
- "This would cost $5/month" → flag the cost upfront

### Maintaining quality bars
The user values:
- Correctness over completeness
- Clear documentation over implicit knowledge
- Honesty about uncertainty over false confidence
- Verifying assumptions over guessing
- Testing on real devices over local-only verification

---

## What Success Looks Like for AI Tools on This Project

You did well if:
- ✅ You read ARCHITECTURE.md and STATE_API.md before doing anything
- ✅ Your code follows the existing patterns (IIFE module, State for persistence, no new dependencies)
- ✅ You commit incrementally with clear messages
- ✅ You update ARCHITECTURE.md when adding files
- ✅ You flag uncertainty about Thai content rather than guessing
- ✅ You test on iOS if you touched audio or UI
- ✅ You ask before making decisions that affect product direction

You failed if:
- ❌ You added a dependency without permission
- ❌ You introduced a build step
- ❌ You converted IIFEs to ES modules
- ❌ You touched localStorage directly
- ❌ You shipped 600+ files without testing one first
- ❌ You guessed at Thai content instead of flagging
- ❌ You didn't update the architecture docs after structural changes

---

## Final Note

This project is built and maintained primarily through AI-assisted development. The user is the product owner and reviewer, not the implementer. Your job is to translate their intent into correct, consistent code that fits the existing architecture. When in doubt, ask. The user prefers a thoughtful question over a confident wrong answer.

---

## Live/Dead decisions

Built on branch `feature/livedead` (not pushed, not merged) from the Live/Dead kickoff brief. Every non-obvious call is listed here so Aaron can overrule any of them.

### Delegation path
- **Codex was reachable, and took the Codex tasks.** The CLI is at `%LOCALAPPDATA%\OpenAI\Codex\bin\codex.exe` (0.130.0-alpha). It can't parse the desktop app's `~/.codex/config.toml` (`service_tier = "default"`) and rejects `gpt-6-luna` for ChatGPT accounts, so it ran as `codex exec --ignore-user-config -m gpt-5.5 -c windows.sandbox="elevated" -s workspace-write`. Without the `windows.sandbox` override it silently drops to read-only. The full prompts are in `handoff/codex-01-syllable-engine.md` and `handoff/codex-02-livedead-ui.md`.
- **`tools/check-livedead.js` went to Codex, not Haiku.** It is tightly coupled to the engine's API, and the user asked for Codex wherever it is faster.
- **The Haiku word-list draft was discarded in full.** Most entries were invented strings (นส, ชส, ตัม, หงา…), and it also had tone-marked words, duplicates and เขา. The gate can't catch non-words, because the engine happily parses them. Sonnet redrafted the list (281 words), and Opus reviewed it word by word.
- **Reviews:** Opus reviewed the Codex engine, the Codex UI, the Sonnet copy and the Sonnet word list. No agent reviewed its own work. Opus's own fixes are listed below and were verified in the browser.

### Engine (`js/syllable.js`)
- Returns two fields beyond the brief: `initialIndices` (to highlight the class-deciding consonant) and `toneKey`. Every word has one live/dead rule (`ruleKey`) and one tone rule (`toneKey`), so a single field couldn't serve both level types.
- Opus fixed an index bug that stopped เ‑ียะ and เ‑ือะ from ever matching, and added an explicit `รร → null`.
- Ambiguity rules: a consonant + ว + final reads as ua (กวน = kuan, หวง = huang, per the brief). Otherwise the longest valid initial wins.
- All section‑4 fixtures pass: `node tests/syllable.test.js`.

### Word set
- The gate also rejects any word with a tone mark, since v1 levels are unmarked only.
- Opus removed ความ (a bound noun prefix, not a standalone word) and added เชิญ, keeping `disguised-n` at 13 words. Every ruleKey has at least 13 words.
- Short เ‑าะ words are romanized "o" (เกาะ go, เคาะ kho) so they don't look identical to long อ ("khaw"). Elsewhere the romanization is simplified, with no tone marks and doubled long vowels. It does **not** mark length for ə (เดิน "dern" vs เยอะ "yer").
- Category F (disguised finals) skews toward low class (8/8/26), because real disguised-final words are mostly low class. No ฟ-final words, and only one ฆ-final word (เมฆ).
- **TODO: verify with a native speaker.** The drafter was less sure these are everyday words with regular pronunciation: มูล ศีล ตาล มาร ทาส ทูต รัฐ กฎ การ ไถ ไต ไว ผุ เหาะ เหา เกา เยอะ ขำ ปรับ.
- `AUDIT_LIVEDEAD.md` lists zero rejections, because the final draft agreed with the engine on every word. What was actually dropped: the whole Haiku draft, plus ความ.

### Module (`js/livedead.js`)
- **Styles are in `css/styles.css`, not `css/livedead.css`.** The section is `/* === Live / Dead module === */`. AI_HANDOFF requires a single stylesheet, and the docs override the brief.
- **Copy is in its own file, `js/livedead-copy.js`,** so the copy and UI could be built in parallel.
- **Swipe direction follows the button layout.** Swipe left (toward the Live button) = Live, swipe right = Dead. Keys: ← Live, → Dead, and 1–5 for tones. The brief's "swipe right / left" was ambiguous.
- **Mastery:** a level passes after two qualifying rounds, which need not be consecutive. Skip-ahead lets you play a locked level but doesn't mark earlier levels passed.
- **Today's 5 minutes** draws from the passed levels plus the first unpassed one. It updates rule boxes but doesn't count as a level round.
- **Intro cards** show the first time a level is played. After that, the level row has an "intro" link to reread them.
- **XP:** 3 per correct answer, 20 per completed level round, plus `checkStreak()` (same pattern as other modules).
- **`livedead` state is local-only.** The Supabase snapshot has no column for it, and adding one needs a schema migration, so it doesn't sync across devices yet.
- **Font:** Noto Sans Thai Looped from Google Fonts. It's the first web font in the app, and system Thai fonts are the fallback.
- **Feedback colors:** the verdict and the highlighted letter always use the answer's own color and shape (amber with a trailing line = live, teal with a hard stop = dead). Right or wrong appears as separate text ("Correct" / "Not quite. You picked …"), so the colors never contradict. On tone levels the initial consonant gets a dotted underline. A combining vowel (ี, ุ…) is highlighted together with its base consonant, because splitting them breaks Thai rendering. The reason text names the vowel itself.
- **Reduced motion:** the Speed read (level 7, was 6) timer bar fills instantly but still switches to its "slow" state at 2 s.
- **Opus fixes to the Codex UI** (all verified at 390px and 1280px, dark and light):
  - Quit, Home and intro Back did nothing when the hash was already `#livedead`.
  - "Missed rules" printed placeholder debris.
  - The Today countdown could show `4:60`.
  - The Live button's trailing line never rendered (a zero-height gradient bounding box).
  - New screens kept the previous screen's scroll position.
  - The skip-ahead panel rendered below the fold.
  - The class-chip highlight box overlapped the feedback text.
  - The counter jumped ahead during feedback.
- **Copy fixes:** คุ → ดุ (คุ isn't a word); เรา removed from the plain-ending examples (it ends in a hidden w); "Ends in {letter} ({sound})" wording; a clearer one-line-per-class tone card.

### Verified
- `node tests/syllable.test.js` and `node tests/livedead.test.js` pass.
- Levels 1, 3, 5 and 6, Today mode and the cheat sheet were played end to end with buttons, swipe and keyboard. Level 1 passed after two rounds and unlocked level 2, and state survived a reload. No console errors, and no horizontal scroll at 390px.
- Not tested on a real iPhone. Not tested: playing audio inside the drill, because the manifest is deliberately empty (see below).

### Waiting on Aaron: audio listen check
Twenty Ploy clips were generated (`node scripts/generate-livedead-audio.js --words=…`) and committed under `audio/ploy/`. **`js/livedead-audio.js` is deliberately left empty,** so the drill shows no audio until the clips are approved. Unapproved TTS could teach a wrong tone or length. Listen for the right tone, vowel length (นก vs มาก, จะ vs ขา) and a clean final stop:

| Word | Expected | File |
|---|---|---|
| กิน | mid, short, live | livedead-0e010e340e19.mp3 |
| จาน | mid, long, live | livedead-0e080e320e19.mp3 |
| หญิง | rising, short, live | livedead-0e2b0e0d0e340e07.mp3 |
| นก | high, short, dead | livedead-0e190e01.mp3 |
| มาก | falling, long, dead | livedead-0e210e320e01.mp3 |
| ปาก | low, long, dead | livedead-0e1b0e320e01.mp3 |
| ขา | rising, long, open | livedead-0e020e32.mp3 |
| ดี | mid, long, open | livedead-0e140e35.mp3 |
| จะ | low, short, open | livedead-0e080e30.mp3 — **only 0.16 s; likely clipped** |
| เตะ | low, short, open | livedead-0e400e150e30.mp3 |
| เกาะ | low, short, open | livedead-0e400e010e320e30.mp3 |
| ทำ | mid, hidden m | livedead-0e170e33.mp3 |
| ใจ | mid, hidden y | livedead-0e430e08.mp3 |
| เรา | mid, hidden w | livedead-0e400e230e32.mp3 |
| คุณ | mid, ณ → n | livedead-0e040e380e13.mp3 |
| ผล | rising, ล → n | livedead-0e1c0e25.mp3 |
| รถ | high, ถ → t | livedead-0e230e16.mp3 |
| บาท | low, ท → t | livedead-0e1a0e320e17.mp3 |
| สุข | low, ข → k | livedead-0e2a0e380e02.mp3 |
| ภาพ | falling, พ → p | livedead-0e200e320e1e.mp3 |

After listening, delete any bad clips. Then:
- `node scripts/generate-livedead-audio.js --manifest-only` switches on the clips that remain.
- `node scripts/generate-livedead-audio.js --words=จะ --force` regenerates a single clip.
- `node scripts/generate-livedead-audio.js --all --approved` generates the full set, about 260 more clips.

### Tone update (Aaron's request, 2026-10-09)
- **Tone answers use Thai, not English.** Each answer card shows the tone mark and the Thai tone name side by side (◌่ เอก, ◌้ โท, ◌๊ ตรี, ◌๋ จัตวา, and a bare ◌ for สามัญ). The mark stands for the SOUND, as in the chant กา ก่า ก้า ก๊า ก๋า; it is not a claim that the word carries that mark. The feedback verdict and the cheat-sheet table use the same pairing.
- **New level 5, "Tone table":** no word, just clue chips (อักษรสูง · คำตาย · สระยาว) and you pick the tone, so the class × live/dead × length table can be memorised on its own. Mid- and high-class dead clues randomly include a length chip, to teach that length only matters for low-class dead syllables. Its boxes use `table:` keys. The old levels 5 and 6 are now 6 (Read the tone) and 7 (Speed read); saved progress migrates (state `version: 2`).
- **The whole table is taught as three lines:** คำเป็น → สามัญ (except อักษรสูง → จัตวา); คำตาย → เอก (except อักษรต่ำ); อักษรต่ำ คำตาย: สระสั้น → ตรี, สระยาว → โท. Every tone feedback shows the Thai chain (e.g. อักษรต่ำ → คำตาย → สระยาว → เสียงโท) as the headline, then the rule line, the chant comparison and an example word. The length step appears only for low-class dead syllables.
- Every cell of the Thai table was checked against `Syllable.analyze` over all 281 words: no mismatches.
- Codex implemented the code (`handoff/codex-03-thai-tones.md`). Opus wrote the Thai teaching copy, put the mark and name together on one row, made the chain the visual headline, and added marks to the cheat-sheet table.
- `js/livedead-audio.js` had been switched on (all 20 test clips) outside this session on 2026-10-02 19:32, after the listen-check handoff. It's committed as found. If that wasn't intended, empty the `words` array to switch audio off again.
- The in-app browser pane's screenshots crop at 125% Windows display scaling, so the phone-width screenshots were taken with headless Chrome instead.
