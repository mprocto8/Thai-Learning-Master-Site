/**
 * State manager — all persistence via localStorage.
 * Exposes a clean API; the rest of the app never touches localStorage directly.
 */
const State = (() => {
  const STORAGE_KEY = "thai-learner-state";

  const LEVELS = [
    { name: "Seedling", emoji: "🌱", minXP: 0 },
    { name: "Learner", emoji: "📖", minXP: 500 },
    { name: "Student", emoji: "🎓", minXP: 1500 },
    { name: "Practitioner", emoji: "🏅", minXP: 3500 },
    { name: "Fluent", emoji: "🏆", minXP: 7000 }
  ];

  const defaults = () => ({
    userName: "",
    xp: 0,
    streak: 0,
    lastPlayedDate: null,
    showScript: false,
    darkMode: true,
    topicStats: {},      // { [topicId]: { played, correct, total, lastPlayed } }
    alphabetStats: {},   // { [char]: { seen, correct, wrong, lastSeen } }
    flashcardStats: {},  // { [topicId]: { [index]: { bucket, lastSeen } } }
    speedBests: {},      // { [topicId]: score }
    onboarded: false,
    badges: [],          // earned pathway badge IDs
    tutorialsSeen: {},   // { sectionId: true }
    xpToday: 0,
    roundsToday: 0
  });

  let _state = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _state = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch {
      _state = defaults();
    }
    return _state;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  }

  function get() {
    if (!_state) load();
    return _state;
  }

  function set(key, value) {
    get();
    _state[key] = value;
    save();
  }

  function update(fn) {
    get();
    fn(_state);
    save();
  }

  /* XP & leveling */
  function addXP(amount) {
    const oldLevel = getLevel();
    update(s => {
      s.xp += amount;
      const today = new Date().toDateString();
      if (s.lastPlayedDate === today) {
        s.xpToday = (s.xpToday || 0) + amount;
      } else {
        s.xpToday = amount;
      }
    });
    const newLevel = getLevel();
    if (newLevel.name !== oldLevel.name) {
      return newLevel; // caller should celebrate
    }
    return null;
  }

  function getLevel() {
    const xp = get().xp;
    let level = LEVELS[0];
    for (const l of LEVELS) {
      if (xp >= l.minXP) level = l;
    }
    return level;
  }

  function getNextLevel() {
    const xp = get().xp;
    for (const l of LEVELS) {
      if (xp < l.minXP) return l;
    }
    return null; // max level
  }

  function getLevelProgress() {
    const xp = get().xp;
    const current = getLevel();
    const next = getNextLevel();
    if (!next) return 1;
    const range = next.minXP - current.minXP;
    const progress = xp - current.minXP;
    return Math.min(progress / range, 1);
  }

  /* Streak */
  function checkStreak() {
    const s = get();
    const today = new Date().toDateString();
    if (s.lastPlayedDate === today) return; // already logged today
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastPlayedDate === yesterday) {
      update(st => { st.xpToday = 0; st.roundsToday = 0; st.streak += 1; st.lastPlayedDate = today; });
    } else if (s.lastPlayedDate !== today) {
      update(st => { st.xpToday = 0; st.roundsToday = 0; st.streak = 1; st.lastPlayedDate = today; });
    }
  }

  function isStreakAtRisk() {
    const s = get();
    const today = new Date().toDateString();
    if (s.lastPlayedDate === today) return false;
    const hour = new Date().getHours();
    return hour >= 17 && s.streak > 0;
  }

  function isStreakUrgent() {
    const s = get();
    const today = new Date().toDateString();
    if (s.lastPlayedDate === today) return false;
    const hour = new Date().getHours();
    return hour >= 20 && s.streak > 0;
  }

  function hasPlayedToday() {
    return get().lastPlayedDate === new Date().toDateString();
  }

  /* Topic stats */
  function recordTopicRound(topicId, correct, total) {
    update(s => {
      if (!s.topicStats[topicId]) {
        s.topicStats[topicId] = { played: 0, correct: 0, total: 0, lastPlayed: null };
      }
      const ts = s.topicStats[topicId];
      ts.played += 1;
      ts.correct += correct;
      ts.total += total;
      ts.lastPlayed = Date.now();
      s.roundsToday = (s.roundsToday || 0) + 1;
    });
  }

  function getTopicMastery(topicId) {
    const ts = get().topicStats[topicId];
    if (!ts || ts.total === 0) return 0;
    return Math.min(ts.correct / ts.total, 1);
  }

  /* Alphabet stats */
  function recordAlphabetAnswer(char, correct) {
    update(s => {
      if (!s.alphabetStats[char]) {
        s.alphabetStats[char] = { seen: 0, correct: 0, wrong: 0, lastSeen: null };
      }
      const as = s.alphabetStats[char];
      as.seen += 1;
      if (correct) as.correct += 1; else as.wrong += 1;
      as.lastSeen = Date.now();
    });
  }

  /* Flashcard spaced repetition buckets */
  function getFlashcardBucket(topicId, index) {
    const fc = get().flashcardStats[topicId];
    if (!fc || !fc[index]) return 0;
    return fc[index].bucket;
  }

  function setFlashcardBucket(topicId, index, bucket) {
    update(s => {
      if (!s.flashcardStats[topicId]) s.flashcardStats[topicId] = {};
      s.flashcardStats[topicId][index] = { bucket, lastSeen: Date.now() };
    });
  }

  /* Speed round personal bests */
  function getSpeedBest(topicId) {
    return get().speedBests[topicId] || 0;
  }

  function setSpeedBest(topicId, score) {
    update(s => {
      if (score > (s.speedBests[topicId] || 0)) {
        s.speedBests[topicId] = score;
      }
    });
  }

  /* Pathway progress */
  function getPathwayProgress(pathwayId) {
    const pathway = typeof PATHWAYS !== "undefined" ? PATHWAYS.find(p => p.id === pathwayId) : null;
    if (!pathway) return { mastered: 0, total: 0, percentComplete: 0, isComplete: false, nextTopic: null };

    if (pathway.usesAlphabet) {
      const stats = get().alphabetStats;
      const totalChars = (typeof THAI_CONSONANTS !== "undefined" ? THAI_CONSONANTS.length : 44) +
                         (typeof THAI_VOWELS !== "undefined" ? THAI_VOWELS.length : 21);
      let mastered = 0;
      for (const key in stats) {
        if (stats[key].seen > 0 && stats[key].correct / stats[key].seen >= 0.7) mastered++;
      }
      return {
        mastered, total: totalChars,
        percentComplete: totalChars > 0 ? mastered / totalChars : 0,
        isComplete: mastered >= totalChars,
        nextTopic: null
      };
    }

    const topics = pathway.topics;
    let mastered = 0;
    let nextTopic = null;
    for (const topicId of topics) {
      if (getTopicMastery(topicId) >= 0.7) {
        mastered++;
      } else if (!nextTopic) {
        nextTopic = topicId;
      }
    }
    return {
      mastered, total: topics.length,
      percentComplete: topics.length > 0 ? mastered / topics.length : 0,
      isComplete: mastered === topics.length,
      nextTopic
    };
  }

  function earnBadge(pathwayId) {
    update(s => {
      if (!s.badges) s.badges = [];
      if (!s.badges.includes(pathwayId)) {
        s.badges.push(pathwayId);
      }
    });
  }

  function hasBadge(pathwayId) {
    const s = get();
    return s.badges && s.badges.includes(pathwayId);
  }

  function markTutorialSeen(sectionId) {
    update(s => {
      if (!s.tutorialsSeen) s.tutorialsSeen = {};
      s.tutorialsSeen[sectionId] = true;
    });
  }

  function isTutorialSeen(sectionId) {
    const s = get();
    return s.tutorialsSeen && s.tutorialsSeen[sectionId];
  }

  /* Reset */
  function resetAll() {
    _state = defaults();
    save();
  }

  return {
    get, set, update, load, save, addXP, getLevel, getNextLevel, getLevelProgress,
    checkStreak, isStreakAtRisk, isStreakUrgent, hasPlayedToday,
    recordTopicRound, getTopicMastery,
    recordAlphabetAnswer, getFlashcardBucket, setFlashcardBucket,
    getSpeedBest, setSpeedBest,
    getPathwayProgress, earnBadge, hasBadge,
    markTutorialSeen, isTutorialSeen,
    resetAll, LEVELS
  };
})();
