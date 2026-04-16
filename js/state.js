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
    onboarded: false,
    badges: [],          // earned pathway badge IDs
    tutorialsSeen: {},   // { sectionId: true }
    xpToday: 0,
    roundsToday: 0
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
    return _state;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
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

    const settings_json = {
      showScript: !!s.showScript,
      darkMode: !!s.darkMode,
      topicView: s.topicView || "grid"
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
      tutorials_seen: s.tutorialsSeen || {}
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
    recordAlphabetAnswer, getFlashcardBucket, setFlashcardBucket,
    getSpeedBest, setSpeedBest,
    getPathwayProgress, earnBadge, hasBadge,
    markTutorialSeen, isTutorialSeen,
    resetAll, LEVELS,
    // Auth
    restoreSession, signUp, login, loginWithGoogle, logout,
    resetPassword, updatePassword,
    isLoggedIn, currentUser, getProfile, isPremium, getAccountTier,
    isRecoveryMode, clearRecoveryMode
  };
})();
