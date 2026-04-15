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
| data/topics.js — 19 vocab topic packs | TOPICS |
| data/alphabet.js — 44 consonants, 21 vowels, 4 tone marks | THAI_CONSONANTS, THAI_VOWELS, THAI_TONE_MARKS |
| data/sentences.js — 15 sentence builder exercises | SENTENCES |
| data/pathways.js — 5 learning pathways with badges | PATHWAYS |

### Core (most tasks touch these)
| File | Globals | Depends on |
|------|---------|------------|
| js/state.js — all persistence, XP, streaks, stats | State | nothing |
| js/ui.js — routing, render(), navigate(), nav bar, toast | UI | State |
| js/thai-time.js — Thai numeral/time/date generation | ThaiTime | nothing |

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
| js/sentence-builder.js — word arrangement game | SentenceBuilder | State, UI, SENTENCES |
| js/pathways.js — guided learning paths + badges | Pathways | State, UI, PATHWAYS, TOPICS |
| js/practice-hub.js — practice mode launcher | PracticeHub | State, UI, TOPICS |

### App Shell
| File | Globals | Depends on |
|------|---------|------------|
| js/app.js — dashboard, onboarding, settings, routes | App | State, UI, all modules |

### Styles
| File | Purpose |
|------|---------|
| css/styles.css | All styles, CSS custom properties, dark/light theme |

## Key Patterns
1. Feature modules never depend on each other — all communication through State or UI
2. State is the single source of truth — no module touches localStorage directly
3. UI.render(html) replaces #app innerHTML — one screen at a time
4. Routes are hash-based: #dashboard, #game/days, #flashcard/months-1, etc.
5. CSS custom properties for theming — dark mode toggles a class on body

## Script Load Order
data/* → js/state.js → js/ui.js → js/thai-time.js → feature modules → js/app.js

## When adding new features
- New js/feature.js as revealing module IIFE
- Add script tag in index.html BEFORE js/app.js
- Register route in js/app.js init()
- Use State for persistence, UI for rendering
