/**
 * Supabase client wrapper — the ONLY file that touches the Supabase SDK.
 *
 * Every other module talks to State, and State talks to SupabaseClient.
 * All methods no-op gracefully when the SDK is not loaded or the user is
 * offline — guest mode must keep working regardless.
 */
const SupabaseClient = (() => {
  const URL = "https://fpsujvcnlinvsjxvozay.supabase.co";
  // Publishable key — safe to commit. RLS policies protect the data.
  const KEY = "sb_publishable_A6v8UifXEKDbsK54Y-PRMg_SXwE4JAn";

  let _client = null;
  let _available = false;

  function init() {
    if (typeof supabase === "undefined" || !supabase.createClient) {
      console.warn("[Supabase] SDK not loaded — running in guest mode only.");
      return false;
    }
    try {
      _client = supabase.createClient(URL, KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      _available = true;
      return true;
    } catch (e) {
      console.warn("[Supabase] init failed:", e);
      _available = false;
      return false;
    }
  }

  function isAvailable() { return _available && _client !== null; }
  function client() { return _client; }

  /* --- Auth --- */
  async function getSession() {
    if (!isAvailable()) return null;
    try {
      const { data } = await _client.auth.getSession();
      return data?.session || null;
    } catch (e) {
      console.warn("[Supabase] getSession failed:", e);
      return null;
    }
  }

  function onAuthChange(cb) {
    if (!isAvailable()) return () => {};
    const { data } = _client.auth.onAuthStateChange((event, session) => cb(event, session));
    return () => data.subscription.unsubscribe();
  }

  async function signUp(email, password, displayName) {
    if (!isAvailable()) throw new Error("Supabase unavailable");
    const { data, error } = await _client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || "" } }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    if (!isAvailable()) throw new Error("Supabase unavailable");
    const { data, error } = await _client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!isAvailable()) return;
    try { await _client.auth.signOut(); } catch (e) { console.warn("[Supabase] signOut failed:", e); }
  }

  /* --- Reads --- */
  async function fetchProfile(userId) {
    if (!isAvailable()) return null;
    const { data, error } = await _client
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function fetchProgress(userId) {
    if (!isAvailable()) return null;
    const { data, error } = await _client
      .from("users_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function fetchTopicProgress(userId) {
    if (!isAvailable()) return [];
    const { data, error } = await _client
      .from("topic_progress")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  }

  async function fetchGameStats(userId) {
    if (!isAvailable()) return null;
    const { data, error } = await _client
      .from("user_game_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function fetchCardHistory(userId) {
    if (!isAvailable()) return [];
    const { data, error } = await _client
      .from("card_history")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  }

  async function fetchAll(userId) {
    if (!isAvailable()) return null;
    const [profile, progress, gameStats, topicProgress, cardHistory] = await Promise.all([
      fetchProfile(userId),
      fetchProgress(userId),
      fetchGameStats(userId),
      fetchTopicProgress(userId),
      fetchCardHistory(userId)
    ]);
    return { profile, progress, gameStats, topicProgress, cardHistory };
  }

  /* --- Writes (upsert = idempotent) --- */
  async function upsertProfile(userId, fields) {
    if (!isAvailable()) return;
    const payload = { user_id: userId, ...fields };
    const { error } = await _client
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw error;
  }

  async function upsertProgress(userId, fields) {
    if (!isAvailable()) return;
    const payload = { user_id: userId, ...fields, updated_at: new Date().toISOString() };
    const { error } = await _client
      .from("users_progress")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw error;
  }

  async function upsertGameStats(userId, fields) {
    if (!isAvailable()) return;
    const payload = { user_id: userId, ...fields, updated_at: new Date().toISOString() };
    const { error } = await _client
      .from("user_game_stats")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw error;
  }

  async function upsertTopicProgress(userId, rows) {
    if (!isAvailable() || !rows || rows.length === 0) return;
    const payload = rows.map(r => ({ user_id: userId, ...r }));
    const { error } = await _client
      .from("topic_progress")
      .upsert(payload, { onConflict: "user_id,topic_id" });
    if (error) throw error;
  }

  async function upsertCardHistory(userId, rows) {
    if (!isAvailable() || !rows || rows.length === 0) return;
    const payload = rows.map(r => ({ user_id: userId, ...r }));
    const { error } = await _client
      .from("card_history")
      .upsert(payload, { onConflict: "user_id,card_id" });
    if (error) throw error;
  }

  return {
    init, isAvailable, client,
    getSession, onAuthChange, signUp, signIn, signOut,
    fetchProfile, fetchProgress, fetchTopicProgress, fetchGameStats, fetchCardHistory, fetchAll,
    upsertProfile, upsertProgress, upsertGameStats, upsertTopicProgress, upsertCardHistory
  };
})();
