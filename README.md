# Thai Learner 🇹🇭

A premium, fully static Thai vocabulary and script learning web app. No frameworks, no build step — just open `index.html`.

## Features

- **Vocabulary Matching** — Tap-to-match Thai↔English with streak bonuses and XP
- **Flashcards** — 3D flip cards with spaced repetition
- **Speed Round** — 60-second timed quiz with multipliers and personal bests
- **Thai Alphabet** — Browse 44 consonants (by class), 21 vowels, 4 tone marks + recognition quizzes
- **Gamification** — XP, levels (Seedling→Fluent), daily streaks, level-up celebrations
- **Persistent** — All progress saved in localStorage

## Setup

1. Clone or download this folder
2. Open `index.html` in a browser
3. That's it — no install, no build

## Adding a New Topic

Edit `data/topics.js` and add an object to the `TOPICS` array:

```js
{
  id: "greetings",
  label: "Greetings",
  emoji: "👋",
  pairs: [
    { romanized: "Sa-wat-dee", script: "สวัสดี", english: "Hello" },
    { romanized: "Khawp khun", script: "ขอบคุณ", english: "Thank you" }
  ]
}
```

No other changes needed — the dashboard, game, flashcard, and speed modes all pick it up automatically.

## Adding Alphabet Characters

Edit `data/alphabet.js`. Add to `THAI_CONSONANTS`, `THAI_VOWELS`, or `THAI_TONE_MARKS`:

```js
// Consonant
{ char: "ก", romanized: "g", class: "mid", example: "ไก่ (gài) = chicken", mnemonic: "A chicken's head in profile" }

// Vowel
{ char: "–า", romanized: "aa", example: "มา (maa) = come", note: "Long 'a' — like 'a' in 'father'" }
```

## File Structure

```
├── index.html          Entry point
├── css/styles.css      All styles, CSS custom properties for theming
├── js/
│   ├── state.js        localStorage manager, XP/streak/stats API
│   ├── ui.js           Routing, rendering helpers, animations
│   ├── game.js         Vocabulary matching game
│   ├── flashcard.js    Flashcard mode with spaced repetition
│   ├── speed.js        60-second speed round
│   ├── alphabet.js     Thai script browser + recognition quiz
│   └── app.js          Dashboard, onboarding, settings, routing
├── data/
│   ├── topics.js       Vocabulary data (6 topics, 44 pairs)
│   └── alphabet.js     Thai alphabet data (44 consonants, 21 vowels, 4 tones)
└── README.md
```

## Tech

- Vanilla HTML/CSS/JS — zero dependencies
- All state in localStorage
- Mobile-responsive, touch-friendly (48px min tap targets)
- Dark/light theme via CSS custom properties
