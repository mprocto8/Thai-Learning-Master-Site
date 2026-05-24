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
- Eight learning modes
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
