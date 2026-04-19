/**
 * Audio — TTS playback wrapper around window.speechSynthesis.
 *
 * Intentionally a thin synchronous wrapper: speak() fires speechSynthesis
 * immediately in the caller's user-gesture tick, which iOS Safari requires.
 * No HTMLAudioElement. No async MP3 probe. No Promise chain before speak().
 *
 * When pre-rendered MP3s exist in audio/, flip USE_MP3_FILES to true and
 * implement the MP3-first path in _playMp3. The MP3 path MUST preserve the
 * synchronous gesture invariant: call HTMLAudioElement.play() on the same
 * tick as the click; do NOT await a 404 before falling back. The robust fix
 * is a pre-computed manifest of known-present filenames (generated alongside
 * the MP3s) so the decision between file and TTS is made synchronously.
 *
 * Naming note: shadows the browser's global `Audio` HTMLAudioElement
 * constructor. Nothing in this app instantiates it by bare name.
 */
const Audio = (() => {
  // Flip to true once audio/ is populated AND the iOS-safe MP3-first logic
  // in _playMp3 is implemented. Leaving false keeps playback purely TTS.
  const USE_MP3_FILES = false;

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

  function setRate(r) {
    rate = r;
  }

  function cancel() {
    if (hasTTSSupport()) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  // Speak arbitrary Thai text. Synchronous — call from a user-gesture handler
  // on iOS. If there is no Thai voice the browser may pick a default or
  // silently do nothing; that is acceptable per spec (help link in caller).
  function speak(text) {
    if (!text || !hasTTSSupport()) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "th-TH";
      u.rate = rate;
      if (thaiVoice) u.voice = thaiVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("[Audio] speak failed:", e);
    }
  }

  function _resolvePair(topicId, index) {
    if (typeof TOPICS === "undefined") return null;
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return null;
    return topic.pairs[index] || null;
  }

  function playWord(topicId, index) {
    const pair = _resolvePair(topicId, index);
    if (!pair || !pair.script) return;
    if (USE_MP3_FILES) { _playMp3(`audio/${topicId}-${index}-word.mp3`, pair.script); return; }
    speak(pair.script);
  }

  function playSentence(topicId, index) {
    const pair = _resolvePair(topicId, index);
    const text = pair && pair.example && pair.example.thai;
    if (!text) return;
    if (USE_MP3_FILES) { _playMp3(`audio/${topicId}-${index}-sentence.mp3`, text); return; }
    speak(text);
  }

  // Stub. See the module-level doc for the iOS-safe implementation sketch.
  function _playMp3(/* url, fallbackText */) {
    // intentionally empty while USE_MP3_FILES === false
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
