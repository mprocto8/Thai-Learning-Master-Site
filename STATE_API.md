# State API Reference

> **For Claude Code:** Read this instead of parsing state.js. Every public method documented.

## State Shape (defaults)
userName: ""           xp: 0                streak: 0
lastPlayedDate: null   showScript: false     darkMode: true
topicStats: {}         alphabetStats: {}     flashcardStats: {}
speedBests: {}         onboarded: false      badges: []
tutorialsSeen: {}      autoPlayAudio: true

### Settings fields
- `autoPlayAudio` (bool, default `true`) — when true, Listen & Choose auto-plays the Thai utterance ~300ms after each question loads. Toggled from the Settings screen. Read as `State.get().autoPlayAudio !== false` at playback sites so older saves (without the field) still auto-play.

## Methods

### Core
load() → state obj — load from localStorage
save() → void — write to localStorage
get() → state obj — current state
set(key, value) → void — set one key, auto-saves
update(fn) → void — mutate in callback, auto-saves
resetAll() → void — reset to defaults

### XP & Levels
addXP(amount) → Level|null — returns new level if leveled up
getLevel() → { name, emoji, minXP }
getNextLevel() → Level|null
getLevelProgress() → float 0-1

Levels: Seedling(0) → Learner(500) → Student(1500) → Practitioner(3500) → Fluent(7000)

### Streaks
checkStreak() → void — call on activity, increments/resets by date
isStreakAtRisk() → bool — after 5pm, hasn't played
isStreakUrgent() → bool — after 8pm, hasn't played
hasPlayedToday() → bool

### Topic Stats
recordTopicRound(topicId, correct, total) → void
getTopicMastery(topicId) → float 0-1

### Alphabet
recordAlphabetAnswer(char, correct) → void

### Flashcards
getFlashcardBucket(topicId, index) → int 0-4
setFlashcardBucket(topicId, index, bucket) → void

### Speed Round
getSpeedBest(topicId) → int
setSpeedBest(topicId, score) → void — only saves if new high

### Pathways & Badges
getPathwayProgress(pathwayId) → { mastered, total, percentComplete, isComplete, nextTopic }
earnBadge(pathwayId) → void
hasBadge(pathwayId) → bool

### Tutorials
markTutorialSeen(sectionId) → void
isTutorialSeen(sectionId) → bool

### Constants
State.LEVELS — array of { name, emoji, minXP }

### Auth & Sync (optional — guest mode ignores all of these)
restoreSession() → Promise<bool> — called once on app init; restores any existing Supabase session and pulls/merges remote progress. Returns true if a session was restored.
login(email, password) → Promise<data> — email/password sign-in. Pushes local guest progress, then pulls remote and merges.
signUp(email, password, displayName) → Promise<data> — create account. If the Supabase project requires email confirmation, `data.session` will be null; prompt the user to check their inbox.
loginWithGoogle() → Promise — placeholder. Throws "coming soon" until OAuth is wired up.
logout() → Promise<void> — signs out of Supabase. localStorage is left intact so the device can continue in guest mode.
resetPassword(email) → Promise — sends a password-reset email. The link redirects back to the current page URL; Supabase appends `type=recovery` to the hash.
updatePassword(newPassword) → Promise<data> — sets a new password during a recovery session. On success, surfaces the user as logged in and runs the normal pull+merge.
isRecoveryMode() → bool — true when Supabase has fired PASSWORD_RECOVERY or the URL hash contains `type=recovery`. Used by App.init() to route to `#reset-confirm` and skip the initial data merge.
clearRecoveryMode() → void — resets the recovery flag after the password is successfully updated.
isLoggedIn() → bool — true if a Supabase user is currently attached.
currentUser() → auth.user | null — the raw Supabase user object.
getProfile() → user_profiles row | null — cached profile from the last fetch.
getAccountTier() → "free" | "premium" — reads user_profiles.account_tier; defaults to "free" for guests.
isPremium() → bool — true only if tier is "premium" AND (tier_expires_at is null OR > now).

### Sync behaviour
- On every `save()`, if logged in, a 2-second debounced push batches all recent writes into one Supabase round-trip.
- Offline: writes still go to localStorage; the `_syncQueue` flag in localStorage survives reloads; the `online` event flushes automatically.
- Sync progress is broadcast via the `thai-learner-sync` window event (detail.status ∈ "syncing" | "saved" | "error"). UI listens and shows the sync pill.
