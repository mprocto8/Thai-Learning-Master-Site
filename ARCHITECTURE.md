# Thai Learner — Architecture Map

> **For Claude Code:** Read this file first. It tells you what every file does, what it exports, and what depends on what. You should almost never need to scan the full repo.

## Tech Stack
- Vanilla HTML/CSS/JS — zero dependencies, no build step, no modules
- All JS files use the revealing module pattern (IIFEs exposing a global object)
- Hash-based routing via UI.registerRoute() and UI.navigate()
- All persistence via localStorage through the State API (see STATE_API.md)
- Theming via CSS custom properties (--bg-0, --bg-1, --accent, etc.)

## File Map

### Data (read-only, rarely modified)
| File | Globals |
|------|---------|
| data/topics.js — 50 topic packs (vocabulary / situation / pattern), 533 pairs total. Pattern pairs carry a `slottable` array of eligible blank positions (pattern markers excluded); Pattern Practice picks one at random per round. A legacy `slot` field == `slottable[0]` is kept for backward compat. | TOPICS |
| data/alphabet.js — 44 consonants, 21 vowels, 4 tone marks | THAI_CONSONANTS, THAI_VOWELS, THAI_TONE_MARKS |
| data/sentences.js — 174 sentence builder exercises: 99 general phrase exercises plus 75 pattern-aligned exercises. Pattern-aligned entries include `patternId` matching a pattern topic ID so mastery flows can find the Sentence Builder practice for each pattern. | SENTENCES |
| data/pathways.js — 25 pattern pathways grouped into Tier 1-5 for the Learn tab; each pathway maps to an existing pattern topic ID so progress remains keyed to `topicStats` | PATHWAYS |

### Core (most tasks touch these)
| File | Globals | Depends on |
|------|---------|------------|
| js/supabase.js — Supabase SDK wrapper (ONLY file that touches the SDK) | SupabaseClient | @supabase/supabase-js (CDN) |
| js/state.js — all persistence, XP, streaks, stats, auth, sync, and strict three-mode pathway mastery with legacy mastery migration | State | SupabaseClient (optional) |
| js/ui.js — routing, render(), navigate(), nav/header bar, sync pill, toast | UI | State |
| js/thai-time.js — Thai numeral/time/date generation | ThaiTime | nothing |
| js/audio.js — TTS + MP3 playback wrapper (speak / playWord / playSentence / playSlot / playSentenceBuilderWord / playSentenceBuilderFull). Fires `speechSynthesis.speak()` and HTMLAudioElement `.play()` in the caller's gesture tick (iOS requirement). Resolves the active voice folder per call from State (free → ploy, premium → user preference / serafina). playWord/playSentence/playSlot return Promises that resolve on the audio element's `ended` event so callers can await a sequence. Fallback chain on missing/error: active voice → default voice (ploy) → TTS. | Audio | TOPICS, State (for tier + voice preference), window.speechSynthesis |

### Feature Modules (self-contained, never depend on each other)
| File | Globals | Depends on |
|------|---------|------------|
| js/game.js — tap-to-match vocab game | Game | State, UI, TOPICS |
| js/flashcard.js — 3D flip flashcards, spaced repetition | Flashcard | State, UI, TOPICS |
| js/speed.js — 60-second timed quiz | Speed | State, UI, TOPICS |
| js/alphabet.js — Thai script browser + quiz | Alphabet | State, UI, THAI_CONSONANTS, THAI_VOWELS, THAI_TONE_MARKS |
| js/clock.js — live analog + digital Thai clock | Clock | UI, ThaiTime |
| js/time-game.js — tell-the-time quiz | TimeGame | State, UI, ThaiTime |
| js/tone-trainer.js — 5 Thai tones: browse + quiz | ToneTrainer | State, UI |
| js/sentence-builder.js — word arrangement game; records pattern-tagged Sentence Builder mastery rounds | SentenceBuilder | State, UI, SENTENCES |
| js/pathways.js — Learn tab with Tier 1-5 pattern pathways, strict per-mode progress, legacy mastery indicators, and replay for mastered pathways | Pathways | State, UI, PATHWAYS, TOPICS |
| js/practice-hub.js — Library tab with Script group, tools, and topic launcher | PracticeHub | State, UI, TOPICS, alphabet data |
| js/topic-detail.js - topic review screen with item list, pair audio, and mode launchers | TopicDetail | State, UI, TOPICS, Audio |
| js/typing-challenge.js — type the romanized Thai (active recall) | TypingChallenge | State, UI, TOPICS |
| js/listen-choose.js — TTS listening comprehension, 4-option MCQ | ListenChoose | State, UI, TOPICS, Audio |

### App Shell
| File | Globals | Depends on |
|------|---------|------------|
| js/app.js — Home v2 dashboard, onboarding, settings, routes; "You Can Now" reflects strict and legacy pathway mastery | App | State, UI, all modules |

### Styles
| File | Purpose |
|------|---------|
| css/styles.css | All styles, CSS custom properties, dark/light theme |

## Key Patterns
1. Feature modules never depend on each other — all communication through State or UI
2. State is the single source of truth — no module touches localStorage directly
3. UI.render(html) replaces #app innerHTML — one screen at a time
4. Routes are hash-based: primary tabs are #home, #learn, #library, #settings. Back-compat routes #dashboard, #pathways, #practice, and #script still work.
5. CSS custom properties for theming — dark mode toggles a class on body

### Build-time Tools (not loaded by the app)
| Path | Purpose |
|------|---------|
| scripts/generate-audio.js | Node.js script that calls ElevenLabs TTS (model `eleven_v3`) to render one MP3 per Thai word, example sentence, (for pattern topics) per slot word, and (for Sentence Builder) per word + full target sentence. Supports two voices: `ploy` (default tier) and `serafina` (premium). CLI: `--voice=ploy\|serafina\|all`, `--force`, `--limit=N`. Reads `scripts/.env` for `ELEVENLABS_API_KEY`. Caches by per-voice filename. |
| scripts/.env.example | Template for the API key file. Real `scripts/.env` is gitignored. |
| audio/ploy/, audio/serafina/ | Pre-generated MP3 output, split by voice. Free users hear Ploy; premium users hear Serafina (or whichever voice they pick in Settings). Naming: `{topicId}-{i}-word.mp3`, `{topicId}-{i}-sentence.mp3`, for pattern topics `{topicId}-{i}-slot-{slotIdx}.mp3`, and for Sentence Builder `sentence-{exerciseIdx}-word-{wordIdx}.mp3` + `sentence-{exerciseIdx}-full.mp3` (where `exerciseIdx` is the SENTENCES array position). Committed so the app loads them with no extra build step. |

## Script Load Order
@supabase/supabase-js CDN → data/* → js/supabase.js → js/state.js → js/ui.js → js/thai-time.js → js/audio.js → feature modules → js/app.js

## IA v2 Tab Structure
- Home (`#home`, legacy `#dashboard`) — focused dashboard with one primary pathway session CTA, capabilities, quick review/daily actions, and Word of the Day.
- Learn (`#learn`, legacy `#pathways`) — Tier 1-5 pattern pathways. Completed pathways can be replayed, which resets mastery for that pathway only.
- Library (`#library`, legacy `#practice`) — topic library and tools. Script learning now appears as the top Library group and routes to the existing Script/Tone screens.
- Settings (`#settings`) — unchanged.

## Pathway Mastery
Pattern pathways use strict three-mode mastery. A pathway is strictly mastered only after Listen, Pattern Practice, and Sentence Builder each have 3+ rounds at 80%+ accuracy in `State.pathwayProgress`. Existing old-rule completions are preserved with `legacyMastered: true` during the one-time State migration and display as `Mastered ★`.

## Auth & Sync (optional layer)
- Supabase provides email/password auth + cross-device progress sync.
- Guest mode is first-class — the app works identically without ever logging in.
- Only `js/supabase.js` imports the SDK. `js/state.js` talks to `SupabaseClient`; no other module does.
- `SupabaseClient` auth surface: `signUp`, `signIn`, `signOut`, `getSession`, `onAuthChange`, `resetPassword`, `updatePassword` (no Google OAuth yet — `State.loginWithGoogle()` is a placeholder that throws).
- `signUp` and `resetPassword` both pin redirect URLs to the current page URL so email links preserve the GitHub Pages subpath.
- Password recovery: Supabase fires a `PASSWORD_RECOVERY` auth event (and puts `type=recovery` in the URL hash) when the user clicks the reset email. `State.restoreSession()` flips `_recoveryMode` on that signal, and `App.init()` routes to `#reset-confirm` instead of pulling/merging progress.
- Feature modules keep using `State.*` — they are unchanged and unaware of Supabase.
- Writes go to localStorage immediately; Supabase sync is debounced 2s and non-blocking.
- See `create_tables.sql` for schema + RLS policies.

## When adding new features
- New js/feature.js as revealing module IIFE
- Add script tag in index.html BEFORE js/app.js
- Register route in js/app.js init()
- Use State for persistence, UI for rendering
