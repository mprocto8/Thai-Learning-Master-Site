/**
 * Audio — central playback with an MP3 → browser TTS priority chain.
 *
 * Priority per call:
 *   1. HTMLAudioElement on audio/{topicId}-{index}-{word|sentence}.mp3
 *   2. window.speechSynthesis (Thai voice preferred)
 *
 * If neither works the feature module shows its own fallback UI —
 * hasTTSSupport() and hasThaiVoice() are exposed so callers can gate on them.
 *
 * All play methods return Promise<void> that resolves when playback ends
 * (or fails quietly). Callers can chain .then() to toggle their own UI.
 *
 * Naming note: this module is named `Audio`, shadowing the browser's global
 * HTMLAudioElement constructor. Internally we reach the native one via
 * `window.Audio`. No other file in this repo instantiates it by bare name.
 */
const Audio = (() => {
  const AUDIO_DIR = "audio";
  let rate = 1.0;
  let thaiVoice = null;
  let currentFileEl = null;

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

  function setRate(r) {
    rate = r;
    if (currentFileEl) currentFileEl.playbackRate = r;
  }

  function cancel() {
    if (currentFileEl) {
      try { currentFileEl.pause(); } catch {}
      currentFileEl = null;
    }
    if (hasTTSSupport()) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  function _playFile(url) {
    return new Promise((resolve, reject) => {
      const el = new window.Audio(url);
      el.playbackRate = rate;
      currentFileEl = el;
      el.onended = () => {
        if (currentFileEl === el) currentFileEl = null;
        resolve();
      };
      el.onerror = () => {
        if (currentFileEl === el) currentFileEl = null;
        reject(new Error("audio_load_failed"));
      };
      el.play().catch(err => {
        if (currentFileEl === el) currentFileEl = null;
        reject(err);
      });
    });
  }

  function _speakTTS(text) {
    return new Promise(resolve => {
      if (!hasTTSSupport()) { resolve(); return; }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "th-TH";
        u.rate = rate;
        if (thaiVoice) u.voice = thaiVoice;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn("[Audio] TTS failed:", e);
        resolve();
      }
    });
  }

  async function _playOrFallback(fileUrl, fallbackText) {
    cancel();
    try {
      await _playFile(fileUrl);
    } catch {
      await _speakTTS(fallbackText);
    }
  }

  function speak(text) {
    cancel();
    return _speakTTS(text);
  }

  function playWord(topicId, index, text) {
    return _playOrFallback(`${AUDIO_DIR}/${topicId}-${index}-word.mp3`, text);
  }

  function playSentence(topicId, index, text) {
    return _playOrFallback(`${AUDIO_DIR}/${topicId}-${index}-sentence.mp3`, text);
  }

  return {
    speak,
    playWord,
    playSentence,
    cancel,
    setRate,
    hasTTSSupport,
    hasThaiVoice,
  };
})();
