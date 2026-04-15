# State API Reference

> **For Claude Code:** Read this instead of parsing state.js. Every public method documented.

## State Shape (defaults)
userName: ""           xp: 0                streak: 0
lastPlayedDate: null   showScript: false     darkMode: true
topicStats: {}         alphabetStats: {}     flashcardStats: {}
speedBests: {}         onboarded: false      badges: []
tutorialsSeen: {}

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
