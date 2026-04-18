# Thai Learner 🇹🇭

A premium, fully static Thai vocabulary and script learning web app. No frameworks, no build step — just open `index.html`.

## Features

- **Vocabulary Matching** — Tap-to-match Thai↔English with streak bonuses and XP
- **Flashcards** — 3D flip cards with spaced repetition + contextual example sentences
- **Speed Round** — 60-second timed quiz with multipliers and personal bests
- **Thai Clock** — Live analog + digital clock displaying time in formal Thai, colloquial Thai, and English, plus Thai date with Buddhist Era year
- **Tell-the-Time Game** — Practice reading clocks in Thai (Easy: formal 24h, Hard: colloquial 6-period system)
- **Thai Tones** — Learn all 5 Thai tones with SVG pitch contour diagrams, mnemonics, and recognition quiz
- **Sentence Builder** — Arrange Thai words into correct sentence order (unlocks at 60% topic mastery)
- **Thai Alphabet** — Browse 44 consonants (by class), 21 vowels, 4 tone marks + recognition quizzes
- **Gamification** — XP, levels (Seedling→Fluent), daily streaks, level-up celebrations
- **Persistent** — All progress saved in localStorage

## Topics

| # | Topic | Pairs | Type |
|---|-------|-------|------|
| 1 | 📅 Days of the Week | 7 | Core |
| 2 | ⏰ Time Expressions | 8 | Core |
| 3 | 🌸 Months (Jan–Jun) | 6 | Core |
| 4 | 🍂 Months (Jul–Dec) | 6 | Core |
| 5 | 🌅 Time of Day | 7 | Core |
| 6 | 🔢 Numbers 1–10 | 10 | Core |
| 7 | 👨‍👩‍👧 Family | 14 | Core |
| 8 | 💬 Basic Verbs | 10 | Core |
| 9 | 🔢 Numbers — Extended | 16 | Core |
| 10 | 🍽️ Kitchenware | 10 | Core |
| 11 | 🍉 Fruits | 10 | Core |
| 12 | 🍖 Meats & Proteins | 8 | Core |
| 13 | 🧄 Ingredients | 10 | Core |
| 14 | 🍜 Ordering Food | 8 | Situation |
| 15 | 🛺 Getting Around | 8 | Situation |
| 16 | 🏪 7-Eleven | 8 | Situation |

## Setup

1. Clone or download this folder
2. Open `index.html` in a browser
3. That's it — no install, no build

## Regenerating audio files

The app ships with pre-generated MP3 files in `audio/`. To regenerate
(e.g. after adding new words or changing voice):

1. Copy `scripts/.env.example` to `scripts/.env` and paste your Gemini
   API key.
2. From the project root: `npm install @google/genai dotenv`
3. Run: `node scripts/generate-audio.js`
4. To force regenerate all files (even cached ones):
   `node scripts/generate-audio.js --force`
5. After generation completes, commit the new audio files.

## Supabase Setup (optional — for cross-device sync)

The app works fully offline as a guest. Add a Supabase backend to enable
accounts and cross-device progress sync.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL editor** → **New query** and paste the
   contents of `create_tables.sql`, then run it. This creates the 5 tables,
   row-level security policies, and the `handle_new_user` trigger that
   auto-creates profile/progress/stats rows on sign-up.
3. In **Project Settings → API**, copy your project URL and your **publishable**
   anon key (starts with `sb_publishable_`).
4. Open `js/supabase.js` and update the `URL` and `KEY` constants at the top of
   the file. The publishable key is safe to commit — RLS policies protect
   user data on the server side.
5. Refresh `index.html`. Guests now see a "Sign in to save progress across
   devices" nudge on the dashboard. Sign in or create an account from the
   settings screen or the dashboard nudge.

### What syncs

| Local state         | Supabase table / column                          |
|---------------------|--------------------------------------------------|
| `userName`          | `user_profiles.display_name`                     |
| `xp`, `streak`, `badges`, `lastPlayedDate` | `users_progress`         |
| `showScript`, `darkMode`, `topicView` | `user_profiles.settings_json` |
| `topicStats`        | `topic_progress` (one row per topic, upsert)     |
| `alphabetStats`     | `user_game_stats.alphabet_stats`                 |
| `flashcardStats`    | `user_game_stats.flashcard_stats`                |
| `speedBests`        | `user_game_stats.speed_bests`                    |
| `tutorialsSeen`     | `user_game_stats.tutorials_seen`                 |
| `onboarded`         | (device-local only)                              |

Writes are debounced 2s into a single batch, go to localStorage
immediately, and retry on the next `online` event if offline.

### Account tier framework

`user_profiles.account_tier` is either `'free'` or `'premium'`, with an
optional `tier_expires_at`. `State.isPremium()` and `State.getAccountTier()`
expose the value to feature code. No features are gated yet — the data
model is ready for when premium tiers ship.

## Special Fields

Topic pairs support several optional fields beyond the required `romanized`, `script`, and `english`:

### `example`
Every pair should have an example sentence with `thai`, `romanized`, and `english` fields. Shown on flashcard back face below a divider.

```js
example: { thai: "วันนี้คือวันจันทร์", romanized: "Wan nee khue Wan Jan", english: "Today is Monday" }
```

### `note`
Used for vocabulary that needs extra context — special rules, cultural notes, homophones, etc. Shown as an amber pill tooltip in the matching game after a correct match. Auto-dismisses after 2.5 seconds.

```js
note: "เอ็ด (et) replaces หนึ่ง (nueng) in the ones position after 10"
```

Used extensively in the Numbers — Extended topic and for culturally notable pairs like Farang (guava/foreigner) and Khai (egg vs. sell homophone).

### `situation`
A boolean on the **topic** object (not individual pairs). When `situation: true`, the topic card shows a "SITUATION" badge on the dashboard. Used for practical phrase packs (Ordering Food, Getting Around, 7-Eleven).

```js
{
  id: "ordering-food",
  label: "Ordering Food",
  emoji: "🍜",
  situation: true,
  pairs: [...]
}
```

## Adding a New Topic

Edit `data/topics.js` and add an object to the `TOPICS` array:

```js
{
  id: "greetings",
  label: "Greetings",
  emoji: "👋",
  pairs: [
    {
      romanized: "Sa-wat-dee",
      script: "สวัสดี",
      english: "Hello",
      example: {
        thai: "สวัสดีครับ",
        romanized: "Sa-wat-dee khrap",
        english: "Hello (polite, male)"
      }
    }
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

## Adding Sentences

Edit `data/sentences.js`. Each sentence needs the correct word order and the topic IDs it depends on:

```js
{
  english: "Today is Monday",
  words: ["วันนี้", "คือ", "วันจันทร์"],
  romanized: "Wan nee khue Wan Jan",
  requiredTopics: ["days", "time-expressions"],
  difficulty: 1
}
```

Sentences unlock automatically once the user reaches 60% mastery on any required topic.

## Thai Time Systems

The app teaches two Thai time-telling systems:

**Formal 24-hour**: `[hour] นาฬิกา [minute] นาที` — Midnight = เที่ยงคืน, Noon = เที่ยงวัน

**Colloquial 6-period**:
| Period | Hours | Format | Example |
|--------|-------|--------|---------|
| Late night | 1–5 AM | ตี + [1–5] | ตีสาม = 3 AM |
| Morning | 6 AM | หกโมงเช้า | (special) |
| Morning | 7–11 AM | [7–11] โมงเช้า | เจ็ดโมงเช้า = 7 AM |
| Noon | 12 PM | เที่ยง | (standalone) |
| Afternoon | 1–3 PM | บ่าย [1–3] โมง | บ่ายสามโมง = 3 PM |
| Evening | 4–6 PM | [4–6] โมงเย็น | สี่โมงเย็น = 4 PM |
| Night | 7–11 PM | [1–5] ทุ่ม | สามทุ่ม = 9 PM |
| Midnight | 12 AM | เที่ยงคืน | |

Minutes: add นาที (naa-thee) after the number. ครึ่ง (khrueng) = :30.

## File Structure

```
├── index.html              Entry point
├── css/styles.css          All styles, CSS custom properties for theming
├── js/
│   ├── state.js            localStorage manager, XP/streak/stats API
│   ├── ui.js               Routing, rendering helpers, animations, nav bar
│   ├── thai-time.js        Thai time generation (formal + colloquial), dates, numerals
│   ├── game.js             Vocabulary matching game + note tooltips
│   ├── flashcard.js        Flashcard mode with spaced repetition + examples
│   ├── speed.js            60-second speed round
│   ├── alphabet.js         Thai script browser + recognition quiz
│   ├── clock.js            Live Thai clock with analog face + digital display
│   ├── time-game.js        Tell-the-time quiz game
│   ├── tone-trainer.js     5 Thai tones: browse with pitch contours + quiz
│   ├── sentence-builder.js Word arrangement game
│   └── app.js              Dashboard, onboarding, settings, routing
├── data/
│   ├── topics.js           Vocabulary data (16 topics, 146 pairs, all with examples)
│   ├── alphabet.js         Thai alphabet data (44 consonants, 21 vowels, 4 tones)
│   └── sentences.js        Sentence builder data (15 sentences)
└── README.md
```

## Tech

- Vanilla HTML/CSS/JS — zero dependencies
- All state in localStorage
- Mobile-responsive, touch-friendly (48px min tap targets)
- Dark/light theme via CSS custom properties
