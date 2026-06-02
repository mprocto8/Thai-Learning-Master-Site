/**
 * State manager — all persistence via localStorage, with optional
 * Supabase-backed cross-device sync when the user is logged in.
 *
 * Design rules:
 * - localStorage is always the fast, synchronous source of truth.
 * - Every write goes to localStorage immediately.
 * - If logged in, writes schedule a debounced Supabase sync (2s batch).
 * - Guest mode must work identically to before — no blocking network calls.
 * - The rest of the app only ever talks to State (never Supabase directly).
 */
const State = (() => {
  const STORAGE_KEY = "thai-learner-state";
  const SYNC_QUEUE_KEY = "thai-learner-sync-queue";
  const SYNC_DEBOUNCE_MS = 2000;

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
    pathwayProgress: {}, // { [pathwayId]: { listen, patternPractice, sentenceBuilder, legacyMastered } }
    pathwayMasteryMigrationVersion: 0,
    pathwayLegacyMigrationCount: 0,
    onboarded: false,
    badges: [],          // earned pathway badge IDs
    tutorialsSeen: {},   // { sectionId: true }
    xpToday: 0,
    roundsToday: 0,
    autoPlayAudio: true,
    autoAdvancePatternPractice: false,
    autoAdvanceSentenceBuilder: false,
    pauseBetweenActivities: false,
    lastActivePathway: null
  });

  let _state = null;

  /* Supabase-backed fields (only populated when logged in). */
  let _user = null;       // Supabase auth user
  let _profile = null;    // user_profiles row
  let _syncTimer = null;  // debounce timer
  let _syncing = false;
  let _suspendSync = false; // true during a login merge to avoid echo writes
  let _recoveryMode = false; // true when Supabase fires PASSWORD_RECOVERY event

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _state = raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch {
      _state = defaults();
    }
    _normalizePathwayProgress(_state);
    if (!_state.pathwayMasteryMigrationVersion) {
      _state.pathwayLegacyMigrationCount = _migrateLegacyPathwayMastery(_state);
      _state.pathwayMasteryMigrationVersion = 1;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch {}
    }
    return _state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch (e) {
      console.warn("State save failed:", e);
    }
    _scheduleSync();
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

  function _emptyModeProgress() {
    return { rounds: [], lastRound: null };
  }

  function _emptyPathwayProgress() {
    return {
      listen: _emptyModeProgress(),
      patternPractice: _emptyModeProgress(),
      sentenceBuilder: _emptyModeProgress(),
      legacyMastered: false
    };
  }

  function _normalizeModeProgress(modeProgress) {
    const mp = modeProgress && typeof modeProgress === "object" ? modeProgress : {};
    const rounds = Array.isArray(mp.rounds) ? mp.rounds.filter(r => r && r.total > 0) : [];
    return {
      rounds,
      lastRound: mp.lastRound || rounds[rounds.length - 1] || null
    };
  }

  function _normalizePathwayProgress(s) {
    if (!s.pathwayProgress || typeof s.pathwayProgress !== "object") s.pathwayProgress = {};
    for (const pathwayId in s.pathwayProgress) {
      const pp = s.pathwayProgress[pathwayId] || {};
      s.pathwayProgress[pathwayId] = {
        listen: _normalizeModeProgress(pp.listen),
        patternPractice: _normalizeModeProgress(pp.patternPractice),
        sentenceBuilder: _normalizeModeProgress(pp.sentenceBuilder),
        legacyMastered: !!pp.legacyMastered
      };
    }
  }

  function _ensurePathwayProgress(s, pathwayId) {
    _normalizePathwayProgress(s);
    if (!s.pathwayProgress[pathwayId]) {
      s.pathwayProgress[pathwayId] = _emptyPathwayProgress();
    }
    return s.pathwayProgress[pathwayId];
  }

  function _isPatternPathway(pathwayId) {
    const pathway = typeof PATHWAYS !== "undefined" ? PATHWAYS.find(p => p.id === pathwayId) : null;
    if (!pathway || pathway.usesAlphabet || !pathway.topics || !pathway.topics.length) return false;
    const topic = typeof TOPICS !== "undefined" ? TOPICS.find(t => t.id === pathway.topics[0]) : null;
    return !!(topic && topic.type === "pattern");
  }

  function _migrateLegacyPathwayMastery(s) {
    let count = 0;
    if (typeof PATHWAYS === "undefined") return count;
    for (const pathway of PATHWAYS) {
      if (!pathway || pathway.usesAlphabet || !pathway.topics || !pathway.topics.length) continue;
      const wasComplete = pathway.topics.every(topicId => {
        const ts = s.topicStats && s.topicStats[topicId];
        return ts && ts.total > 0 && (ts.correct / ts.total) >= 0.7;
      });
      const hadBadge = Array.isArray(s.badges) && s.badges.includes(pathway.id);
      if (wasComplete || hadBadge) {
        const pp = _ensurePathwayProgress(s, pathway.id);
        if (!pp.legacyMastered) count++;
        pp.legacyMastered = true;
      }
    }
    return count;
  }

  function _highAccuracyRounds(modeProgress) {
    const rounds = modeProgress && Array.isArray(modeProgress.rounds) ? modeProgress.rounds : [];
    return rounds.filter(r => r && r.accuracy >= 0.8);
  }

  function recordModeRound(pathwayId, modeId, correct, total) {
    const validModes = ["listen", "patternPractice", "sentenceBuilder"];
    if (!pathwayId || !validModes.includes(modeId) || total <= 0) return;
    if (!_isPatternPathway(pathwayId)) return;

    update(s => {
      const pp = _ensurePathwayProgress(s, pathwayId);
      const safeTotal = Math.max(0, total || 0);
      const safeCorrect = Math.min(Math.max(0, correct || 0), safeTotal);
      const round = {
        correct: safeCorrect,
        total: safeTotal,
        accuracy: safeTotal > 0 ? safeCorrect / safeTotal : 0,
        timestamp: new Date().toISOString()
      };
      pp[modeId].rounds.push(round);
      pp[modeId].lastRound = round;
    });
  }

  function getPathwayMasteryStatus(pathwayId) {
    const s = get();
    const pp = _ensurePathwayProgress(s, pathwayId);
    const modeIds = ["listen", "patternPractice", "sentenceBuilder"];
    const modes = {};
    let completedModes = 0;
    let completedRounds = 0;

    for (const modeId of modeIds) {
      const highAccuracy = _highAccuracyRounds(pp[modeId]).length;
      const mastered = highAccuracy >= 3;
      if (mastered) completedModes++;
      completedRounds += Math.min(highAccuracy, 3);
      modes[modeId] = {
        rounds: pp[modeId].rounds.length,
        highAccuracyRounds: highAccuracy,
        requiredRounds: 3,
        mastered,
        lastRound: pp[modeId].lastRound || null
      };
    }

    const strictMastered = completedModes === modeIds.length;
    return {
      pathwayId,
      modes,
      completedModes,
      totalModes: modeIds.length,
      completedRounds,
      requiredRounds: modeIds.length * 3,
      percentComplete: completedRounds / (modeIds.length * 3),
      mastered: strictMastered,
      strictMastered,
      legacyMastered: !!pp.legacyMastered,
      displayMastered: strictMastered || !!pp.legacyMastered
    };
  }

  function isPathwayMastered(pathwayId) {
    return getPathwayMasteryStatus(pathwayId).strictMastered;
  }

  function getPathwayLegacyMigrationCount() {
    return get().pathwayLegacyMigrationCount || 0;
  }

  function setLastActivePathway(pathwayId) {
    if (!pathwayId) return;
    update(s => {
      s.lastActivePathway = {
        pathwayId,
        timestamp: Date.now()
      };
    });
  }

  function getLastActivePathway() {
    const last = get().lastActivePathway;
    if (!last) return null;
    if (typeof last === "string") return { pathwayId: last, timestamp: null };
    if (!last.pathwayId) return null;
    return last;
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
    const status = getPathwayMasteryStatus(pathwayId);
    const mastered = status.completedRounds;
    const total = status.requiredRounds;
    return {
      mastered, total,
      percentComplete: status.percentComplete,
      isComplete: status.displayMastered,
      strictMastered: status.strictMastered,
      legacyMastered: status.legacyMastered,
      modeStatus: status.modes,
      nextTopic: topics && topics[0] ? topics[0] : null
    };
  }

  function resetPathwayProgress(pathwayId) {
    const pathway = typeof PATHWAYS !== "undefined" ? PATHWAYS.find(p => p.id === pathwayId) : null;
    if (!pathway || !pathway.topics) return;
    update(s => {
      for (const topicId of pathway.topics) {
        if (s.topicStats) delete s.topicStats[topicId];
      }
      if (s.pathwayProgress) delete s.pathwayProgress[pathwayId];
      if (s.badges) s.badges = s.badges.filter(id => id !== pathwayId);
    });
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

  /* ==========================================================
   *  AUTH + SYNC
   * ========================================================== */

  function isLoggedIn() { return !!_user; }
  function currentUser() { return _user; }
  function getProfile() { return _profile; }
  function isRecoveryMode() { return _recoveryMode; }
  function clearRecoveryMode() { _recoveryMode = false; }

  function getAccountTier() {
    if (!_profile) return "free";
    return _profile.account_tier || "free";
  }

  /**
   * Premium voice preference — lives on _profile.settings_json.
   * Returns null when not set (caller should fall back to a default).
   */
  function getVoicePreference() {
    if (!_profile || !_profile.settings_json) return null;
    return _profile.settings_json.voicePreference || null;
  }

  /** Set the premium voice preference. Triggers a sync if logged in. */
  function setVoicePreference(voiceId) {
    if (!_profile) return;
    if (!_profile.settings_json) _profile.settings_json = {};
    _profile.settings_json.voicePreference = voiceId || null;
    save();
  }

  function isPremium() {
    if (!_profile) return false;
    if (_profile.account_tier !== "premium") return false;
    if (!_profile.tier_expires_at) return true;
    return new Date(_profile.tier_expires_at).getTime() > Date.now();
  }

  /**
   * Restore session on page load. Called from App.init().
   * If a Supabase session exists, pulls remote data and merges.
   */
  async function restoreSession() {
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) return false;

    // Detect recovery-mode landing early: Supabase puts `type=recovery` in the
    // URL hash when the user clicks the reset link. We also listen for the
    // PASSWORD_RECOVERY auth event — whichever fires first flips the flag.
    const rawHash = (typeof window !== "undefined" ? window.location.hash : "") || "";
    if (rawHash.includes("type=recovery")) _recoveryMode = true;

    // Always register the auth listener FIRST so we don't miss the
    // PASSWORD_RECOVERY event, which can fire during getSession() resolution.
    SupabaseClient.onAuthChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        _recoveryMode = true;
        if (newSession?.user) _user = newSession.user;
        try {
          window.dispatchEvent(new CustomEvent("thai-learner-recovery"));
        } catch {}
      } else if (event === "SIGNED_OUT") {
        _user = null;
        _profile = null;
      } else if (newSession?.user) {
        _user = newSession.user;
      }
    });

    const session = await SupabaseClient.getSession();
    if (!session || !session.user) return false;
    _user = session.user;

    // Skip the initial pull/merge if we're in a recovery session — the user
    // hasn't actually authenticated yet, and we don't want to overwrite
    // anything or trigger sync until they set a new password.
    if (!_recoveryMode) {
      try {
        await _pullAndMerge();
      } catch (e) {
        console.warn("[State] initial sync failed:", e);
      }
    }
    return true;
  }

  async function signUp(email, password, displayName) {
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) {
      throw new Error("Sign-up is unavailable right now.");
    }
    const localName = (displayName || get().userName || "").trim();
    const data = await SupabaseClient.signUp(email, password, localName);
    // When email confirmation is disabled (default on new Supabase projects),
    // a session is returned immediately. Otherwise, user must confirm first.
    if (data.session && data.user) {
      _user = data.user;
      if (localName) set("userName", localName);
      await _pushLocalSnapshot();
      await _pullAndMerge();
    }
    return data;
  }

  async function login(email, password) {
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) {
      throw new Error("Sign-in is unavailable right now.");
    }
    const data = await SupabaseClient.signIn(email, password);
    _user = data.user;
    // First, push any guest-mode progress up so it doesn't get lost in the merge.
    await _pushLocalSnapshot();
    // Then pull remote and merge — keeps whichever value is "better" per field.
    await _pullAndMerge();
    return data;
  }

  async function loginWithGoogle() {
    // Placeholder — Google OAuth will be wired up later.
    throw new Error("Google sign-in is coming soon.");
  }

  async function resetPassword(email) {
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) {
      throw new Error("Password reset is unavailable right now.");
    }
    return await SupabaseClient.resetPassword(email);
  }

  async function updatePassword(newPassword) {
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) {
      throw new Error("Password update is unavailable right now.");
    }
    const data = await SupabaseClient.updatePassword(newPassword);
    // After a successful password update during recovery, the session is the
    // regular authenticated session — surface the user so the rest of the app
    // sees a logged-in state and sync kicks in.
    if (data && data.user) {
      _user = data.user;
      try { await _pullAndMerge(); } catch (e) { console.warn("[State] post-reset merge failed:", e); }
    }
    return data;
  }

  async function logout() {
    if (typeof SupabaseClient !== "undefined") {
      await SupabaseClient.signOut();
    }
    _user = null;
    _profile = null;
    // Keep localStorage intact so the device remembers progress as a guest.
  }

  /* ---------- sync internals ---------- */

  function _scheduleSync() {
    if (!_user || _suspendSync) return;
    if (typeof SupabaseClient === "undefined" || !SupabaseClient.isAvailable()) {
      _markQueued();
      return;
    }
    _markQueued();
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      _syncTimer = null;
      _flush().catch(e => console.warn("[State] sync failed:", e));
    }, SYNC_DEBOUNCE_MS);
  }

  function _markQueued() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify({ pending: true, since: Date.now() }));
    } catch {}
  }

  function _clearQueue() {
    try { localStorage.removeItem(SYNC_QUEUE_KEY); } catch {}
  }

  function _hasQueued() {
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      if (!raw) return false;
      const q = JSON.parse(raw);
      return !!(q && q.pending);
    } catch { return false; }
  }

  async function _flush() {
    if (!_user || !SupabaseClient.isAvailable()) return;
    if (!navigator.onLine) return;
    if (_syncing) return;
    _syncing = true;
    _emitSync("syncing");
    try {
      await _pushLocalSnapshot();
      _clearQueue();
      _emitSync("saved");
    } catch (e) {
      console.warn("[State] push failed:", e);
      _emitSync("error");
      // Keep the pending flag; the online listener / next write will retry.
    } finally {
      _syncing = false;
    }
  }

  /** Push the full local state up as a Supabase snapshot. */
  async function _pushLocalSnapshot() {
    if (!_user) return;
    const s = get();
    const userId = _user.id;

    const existingSettings = (_profile && _profile.settings_json) || {};
    const settings_json = {
      showScript: !!s.showScript,
      darkMode: !!s.darkMode,
      topicView: s.topicView || "grid",
      autoAdvancePatternPractice: !!s.autoAdvancePatternPractice,
      autoAdvanceSentenceBuilder: !!s.autoAdvanceSentenceBuilder,
      pauseBetweenActivities: !!s.pauseBetweenActivities,
      // voicePreference is set via State.setVoicePreference (premium-only).
      // It lives on the profile, not local state — preserve any existing value.
      voicePreference: existingSettings.voicePreference || null
    };

    const lastPlayedISO = s.lastPlayedDate
      ? new Date(s.lastPlayedDate).toISOString()
      : null;

    // Profile (display_name + settings). Preserve server-side tier info.
    const profileFields = {
      display_name: s.userName || "",
      settings_json
    };

    // Progress
    const progressFields = {
      xp: s.xp || 0,
      level: _levelIndex(),
      streak: s.streak || 0,
      last_played: lastPlayedISO,
      badges: s.badges || []
    };

    // Game stats (jsonb blobs)
    const statsFields = {
      flashcard_stats: s.flashcardStats || {},
      speed_bests: s.speedBests || {},
      alphabet_stats: s.alphabetStats || {},
      tutorials_seen: s.tutorialsSeen || {},
      pathway_progress: s.pathwayProgress || {}
    };

    // Topic progress — one row per topic
    const topicRows = Object.keys(s.topicStats || {}).map(tid => {
      const ts = s.topicStats[tid] || {};
      return {
        topic_id: tid,
        played: ts.played || 0,
        correct: ts.correct || 0,
        total: ts.total || 0,
        last_played: ts.lastPlayed ? new Date(ts.lastPlayed).toISOString() : null
      };
    });

    await Promise.all([
      SupabaseClient.upsertProfile(userId, profileFields),
      SupabaseClient.upsertProgress(userId, progressFields),
      SupabaseClient.upsertGameStats(userId, statsFields),
      SupabaseClient.upsertTopicProgress(userId, topicRows)
    ]);
  }

  function _levelIndex() {
    const xp = get().xp || 0;
    let idx = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].minXP) idx = i;
    }
    return idx;
  }

  /** Pull remote data, merge into local (additive last-wins), then push merged. */
  async function _pullAndMerge() {
    if (!_user || !SupabaseClient.isAvailable()) return;
    _emitSync("syncing");
    _suspendSync = true;
    try {
      const remote = await SupabaseClient.fetchAll(_user.id);
      if (!remote) return;
      _mergeRemoteIntoLocal(remote);
      _profile = remote.profile || _profile;
    } finally {
      _suspendSync = false;
    }
    // After merge, push the merged snapshot back so remote reflects everything.
    try {
      await _pushLocalSnapshot();
      _clearQueue();
      _emitSync("saved");
    } catch (e) {
      console.warn("[State] post-merge push failed:", e);
      _emitSync("error");
    }
  }

  function _mergeRemoteIntoLocal(remote) {
    const s = get();
    const { profile, progress, gameStats, topicProgress } = remote;

    // Profile / settings — remote wins when local is empty/default.
    if (profile) {
      if (profile.display_name && !s.userName) s.userName = profile.display_name;
      const settings = profile.settings_json || {};
      if (typeof settings.showScript === "boolean") s.showScript = settings.showScript;
      if (typeof settings.darkMode === "boolean") s.darkMode = settings.darkMode;
      if (typeof settings.topicView === "string") s.topicView = settings.topicView;
      if (typeof settings.autoAdvancePatternPractice === "boolean") {
        s.autoAdvancePatternPractice = settings.autoAdvancePatternPractice;
      }
      if (typeof settings.autoAdvanceSentenceBuilder === "boolean") {
        s.autoAdvanceSentenceBuilder = settings.autoAdvanceSentenceBuilder;
      }
      if (typeof settings.pauseBetweenActivities === "boolean") {
        s.pauseBetweenActivities = settings.pauseBetweenActivities;
      }
    }

    // Progress — additive: max XP, max streak, union of badges, latest last_played.
    if (progress) {
      s.xp = Math.max(s.xp || 0, progress.xp || 0);
      s.streak = Math.max(s.streak || 0, progress.streak || 0);
      if (progress.last_played) {
        const remoteMs = new Date(progress.last_played).getTime();
        const localMs = s.lastPlayedDate ? new Date(s.lastPlayedDate).getTime() : 0;
        if (remoteMs > localMs) {
          s.lastPlayedDate = new Date(progress.last_played).toDateString();
        }
      }
      const localBadges = Array.isArray(s.badges) ? s.badges : [];
      const remoteBadges = Array.isArray(progress.badges) ? progress.badges : [];
      s.badges = Array.from(new Set([...localBadges, ...remoteBadges]));
    }

    // Game stats — merge per key, taking entries with later lastSeen.
    if (gameStats) {
      s.flashcardStats = _mergeNestedByLastSeen(s.flashcardStats, gameStats.flashcard_stats || {});
      s.alphabetStats = _mergeByLastSeen(s.alphabetStats, gameStats.alphabet_stats || {});
      s.speedBests = _mergeMax(s.speedBests || {}, gameStats.speed_bests || {});
      s.pathwayProgress = _mergePathwayProgress(s.pathwayProgress || {}, gameStats.pathway_progress || {});
      // tutorialsSeen: once seen, always seen.
      s.tutorialsSeen = { ...(gameStats.tutorials_seen || {}), ...(s.tutorialsSeen || {}) };
    }

    // Topic progress — for each topic, take the row with more data.
    if (topicProgress && topicProgress.length) {
      for (const tp of topicProgress) {
        const localTS = s.topicStats[tp.topic_id] || { played: 0, correct: 0, total: 0, lastPlayed: null };
        const remoteLastMs = tp.last_played ? new Date(tp.last_played).getTime() : 0;
        const localLastMs = localTS.lastPlayed || 0;
        s.topicStats[tp.topic_id] = {
          played: Math.max(localTS.played || 0, tp.played || 0),
          correct: Math.max(localTS.correct || 0, tp.correct || 0),
          total: Math.max(localTS.total || 0, tp.total || 0),
          lastPlayed: Math.max(localLastMs, remoteLastMs) || null
        };
      }
    }

    // Persist merged state to localStorage directly (avoid triggering another sync).
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  function _mergeMax(a, b) {
    const out = { ...a };
    for (const k in b) out[k] = Math.max(a[k] || 0, b[k] || 0);
    return out;
  }

  function _mergeByLastSeen(a, b) {
    const out = { ...a };
    for (const k in b) {
      const local = a[k];
      const remote = b[k];
      if (!local) { out[k] = remote; continue; }
      const localMs = local.lastSeen || 0;
      const remoteMs = remote.lastSeen || 0;
      out[k] = remoteMs > localMs ? remote : local;
    }
    return out;
  }

  function _mergeNestedByLastSeen(a, b) {
    const out = { ...a };
    for (const topicId in b) {
      out[topicId] = _mergeByLastSeen(a[topicId] || {}, b[topicId] || {});
    }
    return out;
  }

  function _roundKey(round) {
    return [round.timestamp || "", round.correct || 0, round.total || 0].join("|");
  }

  function _roundTime(round) {
    if (!round || !round.timestamp) return 0;
    return new Date(round.timestamp).getTime() || 0;
  }

  function _mergeModeRounds(localMode, remoteMode) {
    const rounds = [];
    const seen = new Set();
    for (const round of [
      ...((localMode && localMode.rounds) || []),
      ...((remoteMode && remoteMode.rounds) || [])
    ]) {
      if (!round || !round.total) continue;
      const key = _roundKey(round);
      if (seen.has(key)) continue;
      seen.add(key);
      rounds.push(round);
    }
    rounds.sort((a, b) => _roundTime(a) - _roundTime(b));
    return {
      rounds,
      lastRound: rounds[rounds.length - 1] || null
    };
  }

  function _mergePathwayProgress(local, remote) {
    const out = { ...(local || {}) };
    const ids = new Set([...Object.keys(local || {}), ...Object.keys(remote || {})]);
    ids.forEach(pathwayId => {
      const lp = (local && local[pathwayId]) || {};
      const rp = (remote && remote[pathwayId]) || {};
      out[pathwayId] = {
        listen: _mergeModeRounds(lp.listen, rp.listen),
        patternPractice: _mergeModeRounds(lp.patternPractice, rp.patternPractice),
        sentenceBuilder: _mergeModeRounds(lp.sentenceBuilder, rp.sentenceBuilder),
        legacyMastered: !!(lp.legacyMastered || rp.legacyMastered)
      };
    });
    return out;
  }

  /* ---------- sync indicator dispatcher ---------- */
  function _emitSync(status) {
    try {
      window.dispatchEvent(new CustomEvent("thai-learner-sync", { detail: { status } }));
    } catch {}
  }

  /* ---------- online listener — flush queued writes ---------- */
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      if (_user && _hasQueued()) {
        _flush().catch(() => {});
      }
    });
  }

  return {
    get, set, update, load, save,
    addXP, getLevel, getNextLevel, getLevelProgress,
    checkStreak, isStreakAtRisk, isStreakUrgent, hasPlayedToday,
    recordTopicRound, getTopicMastery,
    recordModeRound, getPathwayMasteryStatus, isPathwayMastered, getPathwayLegacyMigrationCount,
    setLastActivePathway, getLastActivePathway,
    recordAlphabetAnswer, getFlashcardBucket, setFlashcardBucket,
    getSpeedBest, setSpeedBest,
    getPathwayProgress, resetPathwayProgress, earnBadge, hasBadge,
    markTutorialSeen, isTutorialSeen,
    resetAll, LEVELS,
    // Auth
    restoreSession, signUp, login, loginWithGoogle, logout,
    resetPassword, updatePassword,
    isLoggedIn, currentUser, getProfile, isPremium, getAccountTier,
    getVoicePreference, setVoicePreference,
    isRecoveryMode, clearRecoveryMode
  };
})();
