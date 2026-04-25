/**
 * Audio — TTS + MP3 playback wrapper.
 *
 * MP3-first: pre-rendered files live under audio/{voice}/. The active voice
 * folder is resolved per-call from State (account tier + user preference):
 *   free users               → audio/ploy
 *   premium, no preference   → audio/serafina
 *   premium with preference  → audio/{settings_json.voicePreference}
 *
 * iOS gesture rule: speak() and the first .play() on an HTMLAudioElement
 * must fire synchronously in the caller's user-gesture tick. We keep that
 * invariant: the element is constructed and .play() is called in the same
 * tick; any 404/decode fallback to TTS happens later, when the gesture is
 * already consumed (acceptable since files are generated for every pair).
 *
 * Each playWord/playSentence/playSlot returns a Promise that resolves on
 * the audio element's `ended` event (or immediately on TTS path / error),
 * so callers can await a sequence.
 *
 * Naming note: shadows the browser's global `Audio` HTMLAudioElement
 * constructor. Nothing in this app instantiates it by bare name.
 */
const Audio = (() => {
  const USE_MP3_FILES = true;
  const DEFAULT_VOICE = "ploy";
  const PREMIUM_DEFAULT_VOICE = "serafina";

  let rate = 1.0;
  let thaiVoice = null;

  function _loadVoices() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices() || [];
    thaiVoice = voices.find(v => v.lang === "th-TH")
             || voices.find(v => v.lang && v.lang.toLowerCase().startsWith("th"))
             || null;
  }

  if (typeof window !== "undefined" && window.speechSynthesis) {
    _loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", _loadVoices);
  }

  function hasTTSSupport() {
    return typeof window !== "undefined"
      && !!window.speechSynthesis
      && !!window.SpeechSynthesisUtterance;
  }

  function hasThaiVoice() {
    if (!thaiVoice) _loadVoices();
    return !!thaiVoice;
  }

  function setRate(r) { rate = r; }

  function cancel() {
    if (hasTTSSupport()) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  function _activeVoice() {
    if (typeof State === "undefined") return DEFAULT_VOICE;
    const isPremium = State.isPremium && State.isPremium();
    if (!isPremium) return DEFAULT_VOICE;
    const profile = State.getProfile && State.getProfile();
    const pref = profile && profile.settings_json && profile.settings_json.voicePreference;
    return pref || PREMIUM_DEFAULT_VOICE;
  }

  function _voiceFolder() {
    return `audio/${_activeVoice()}`;
  }

  function speak(text) {
    if (!text || !hasTTSSupport()) return Promise.resolve();
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "th-TH";
      u.rate = rate;
      if (thaiVoice) u.voice = thaiVoice;
      return new Promise(resolve => {
        u.onend = () => resolve();
        u.onerror = () => resolve();
        try { window.speechSynthesis.speak(u); } catch { resolve(); }
      });
    } catch (e) {
      console.warn("[Audio] speak failed:", e);
      return Promise.resolve();
    }
  }

  function _resolvePair(topicId, index) {
    if (typeof TOPICS === "undefined") return null;
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return null;
    return topic.pairs[index] || null;
  }

  /**
   * Play an MP3 file and resolve when it ends. On 404/decode error,
   * fall back to the default-voice folder, then to TTS as a last resort.
   * The first .play() fires in the caller's tick (iOS gesture rule).
   */
  function _playMp3(activeUrl, fallbackText) {
    return new Promise(resolve => {
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; resolve(); } };

      const tryUrl = (url, onFail) => {
        try {
          const el = new window.Audio(url);
          el.addEventListener("ended", done);
          el.addEventListener("error", onFail);
          const p = el.play();
          if (p && typeof p.catch === "function") p.catch(onFail);
        } catch {
          onFail();
        }
      };

      const fallbackToDefaultVoice = () => {
        // Swap the voice folder segment to the default voice and retry once.
        const m = activeUrl.match(/^audio\/([^/]+)\/(.+)$/);
        if (!m || m[1] === DEFAULT_VOICE) {
          // Already on default voice or unparseable — go straight to TTS.
          if (fallbackText) speak(fallbackText).then(done); else done();
          return;
        }
        const fallbackUrl = `audio/${DEFAULT_VOICE}/${m[2]}`;
        tryUrl(fallbackUrl, () => {
          if (fallbackText) speak(fallbackText).then(done); else done();
        });
      };

      tryUrl(activeUrl, fallbackToDefaultVoice);
    });
  }

  function playWord(topicId, index) {
    const pair = _resolvePair(topicId, index);
    if (!pair || !pair.script) return Promise.resolve();
    if (USE_MP3_FILES) return _playMp3(`${_voiceFolder()}/${topicId}-${index}-word.mp3`, pair.script);
    return speak(pair.script);
  }

  function playSentence(topicId, index) {
    const pair = _resolvePair(topicId, index);
    const text = pair && pair.example && pair.example.thai;
    if (!text) return Promise.resolve();
    if (USE_MP3_FILES) return _playMp3(`${_voiceFolder()}/${topicId}-${index}-sentence.mp3`, text);
    return speak(text);
  }

  /** Play a single slot-word for a Pattern Practice round. */
  function playSlot(topicId, pairIndex, slotIndex) {
    const pair = _resolvePair(topicId, pairIndex);
    if (!pair) return Promise.resolve();
    const slot = Array.isArray(pair.slottable) ? pair.slottable[slotIndex] : null;
    const text = slot && slot.script;
    if (!text) return Promise.resolve();
    if (USE_MP3_FILES) {
      return _playMp3(`${_voiceFolder()}/${topicId}-${pairIndex}-slot-${slotIndex}.mp3`, text);
    }
    return speak(text);
  }

  return {
    speak,
    playWord,
    playSentence,
    playSlot,
    cancel,
    setRate,
    hasTTSSupport,
    hasThaiVoice,
  };
})();
