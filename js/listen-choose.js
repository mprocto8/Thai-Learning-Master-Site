/**
 * Listen & Choose — listening comprehension using browser TTS.
 * Plays the Thai script form of a pair and asks the user to pick the
 * correct English meaning from 4 options.
 *
 * Relies on window.speechSynthesis + a Thai voice. If no Thai voice is
 * installed, we show a friendly fallback with OS-level install instructions.
 */
const ListenChoose = (() => {
  const ROUND_SIZE = 10;
  const DEFAULT_RATE = 0.85;
  const RATE_OPTIONS = [0.7, 0.85, 1.0];

  let topic = null;
  let queue = [];
  let idx = 0;
  let correct = 0;
  let wrong = 0;
  let xpEarned = 0;
  let options = [];
  let answered = false;
  let isActive = false;

  let rate = DEFAULT_RATE;
  let thaiVoice = null;
  let voicesLoaded = false;

  function _loadVoices() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      voicesLoaded = true;
      return;
    }
    const voices = window.speechSynthesis.getVoices() || [];
    // Prefer th-TH; fall back to anything starting with "th".
    thaiVoice = voices.find(v => v.lang === "th-TH")
             || voices.find(v => v.lang && v.lang.toLowerCase().startsWith("th"))
             || null;
    voicesLoaded = voices.length > 0;
  }

  // Eagerly try to load voices, and re-try on voiceschanged (Chrome fires
  // this once the voice list becomes available).
  if (typeof window !== "undefined" && window.speechSynthesis) {
    _loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", _loadVoices);
  }

  function hasTTSSupport() {
    return typeof window !== "undefined" && !!window.speechSynthesis && !!window.SpeechSynthesisUtterance;
  }

  function hasThaiVoice() {
    // Some browsers don't populate voices until voiceschanged fires; re-check
    // on each call just in case.
    if (!thaiVoice) _loadVoices();
    return !!thaiVoice;
  }

  function speak(text) {
    if (!hasTTSSupport()) return;
    try {
      window.speechSynthesis.cancel(); // interrupt any in-flight utterance
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "th-TH";
      u.rate = rate;
      if (thaiVoice) u.voice = thaiVoice;
      // Pulse the speaker button while audio plays.
      const btn = document.querySelector(".listen-speaker");
      if (btn) btn.classList.add("playing");
      u.onend = u.onerror = () => {
        const b = document.querySelector(".listen-speaker");
        if (b) b.classList.remove("playing");
      };
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn("[ListenChoose] speak failed:", e);
    }
  }

  function start(topicId) {
    topic = TOPICS.find(t => t.id === topicId);
    if (!topic) { UI.navigate("#dashboard"); return; }

    if (!hasTTSSupport() || !hasThaiVoice()) {
      renderUnavailable();
      return;
    }

    const shuffled = [...topic.pairs].sort(() => Math.random() - 0.5);
    queue = shuffled.slice(0, Math.min(ROUND_SIZE, shuffled.length));
    // Distractors for Quick mode pull from all queue items; here they come
    // from topic.pairs (set in nextPrompt).
    idx = 0;
    correct = 0;
    wrong = 0;
    xpEarned = 0;
    answered = false;
    isActive = true;
    nextPrompt();
  }

  /** Quick Listen — 10 random pairs pulled from all played topics.
   *  Fallback: greetings-phrases for brand-new users. */
  function startQuick() {
    if (!hasTTSSupport() || !hasThaiVoice()) {
      topic = { id: "listen-quick", label: "Quick Listen", emoji: "🎧", pairs: [] };
      renderUnavailable();
      return;
    }

    const s = State.get();
    const playedIds = Object.keys(s.topicStats || {}).filter(id => {
      const ts = s.topicStats[id];
      return ts && ts.played > 0 && TOPICS.some(t => t.id === id);
    });

    let pool = [];
    if (playedIds.length === 0) {
      const fallback = TOPICS.find(t => t.id === "greetings-phrases") || TOPICS[0];
      pool = fallback ? [...fallback.pairs] : [];
    } else {
      for (const id of playedIds) {
        const t = TOPICS.find(tp => tp.id === id);
        if (t) pool.push(...t.pairs);
      }
    }

    if (pool.length === 0) { UI.navigate("#dashboard"); return; }

    // Synthetic topic so existing render/record paths keep working.
    topic = {
      id: "listen-quick",
      label: "Quick Listen",
      emoji: "🎧",
      pairs: pool
    };
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    queue = shuffled.slice(0, Math.min(ROUND_SIZE, shuffled.length));
    idx = 0;
    correct = 0;
    wrong = 0;
    xpEarned = 0;
    answered = false;
    isActive = true;
    nextPrompt();
  }

  function currentPair() {
    return queue[idx];
  }

  function nextPrompt() {
    if (idx >= queue.length) { finishRound(); return; }
    answered = false;
    const pair = currentPair();

    // 3 distractors from the same topic.
    const distractors = topic.pairs
      .filter(p => p.english !== pair.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    options = [...distractors, pair].sort(() => Math.random() - 0.5);

    renderPrompt();
    // Auto-play after a short delay — gated by the user's setting so people
    // who prefer to tap the speaker themselves can turn it off.
    if (State.get().autoPlayAudio !== false) {
      setTimeout(() => speak(pair.script), 300);
    }
  }

  function renderPrompt() {
    const pair = currentPair();
    UI.render(`
      <div class="listen-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="ListenChoose.quit()">← Quit</button>
          <h2>🎧 ${topic.emoji} ${topic.label}</h2>
          <div class="listen-progress-count">${idx + 1} / ${queue.length}</div>
        </div>

        <div class="listen-progress">
          <div class="listen-progress-bar" style="width:${(idx / queue.length) * 100}%"></div>
        </div>

        <div class="listen-score-bar">
          <span>✅ ${correct}</span>
          <span>❌ ${wrong}</span>
          <span>⚡ ${xpEarned} XP</span>
        </div>

        <div class="listen-speed-pills">
          ${RATE_OPTIONS.map(r => `
            <button class="btn btn-sm ${rate === r ? 'btn-active' : ''}"
              onclick="ListenChoose.setRate(${r})">${r}x</button>
          `).join("")}
        </div>

        <div class="listen-speaker-wrap">
          <button class="listen-speaker" onclick="ListenChoose.playAgain()" aria-label="Play audio">
            <span class="listen-speaker-icon">🔊</span>
          </button>
          <div class="listen-hint">Tap to play — listen carefully</div>
        </div>

        <div class="listen-options">
          ${options.map((opt, i) => `
            <button class="btn listen-option" onclick="ListenChoose.answer(${i})">${opt.english}</button>
          `).join("")}
        </div>

        <div id="listen-feedback" class="listen-feedback" style="display:none"></div>
      </div>
    `);
  }

  function playAgain() {
    const pair = currentPair();
    if (pair) speak(pair.script);
  }

  function setRate(r) {
    rate = r;
    // Re-render to reflect active pill; no need to replay.
    const pills = document.querySelectorAll(".listen-speed-pills .btn");
    pills.forEach(b => {
      b.classList.toggle("btn-active", parseFloat(b.textContent) === r);
    });
  }

  function answer(index) {
    if (answered) return;
    answered = true;
    const chosen = options[index];
    const pair = currentPair();
    const btn = document.querySelectorAll(".listen-option")[index];
    const feedback = document.getElementById("listen-feedback");

    if (chosen.english === pair.english) {
      correct++;
      const xp = 10;
      xpEarned += xp;
      const levelUp = State.addXP(xp);
      State.checkStreak();

      if (btn) btn.classList.add("correct");
      if (feedback) {
        feedback.className = "listen-feedback correct";
        feedback.innerHTML = `
          <div class="listen-feedback-title">✓ Correct! +${xp} XP</div>
          <div class="listen-feedback-thai">${pair.script} · ${pair.romanized}</div>
        `;
        feedback.style.display = "block";
      }

      if (levelUp) setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);

      setTimeout(() => { idx++; nextPrompt(); }, 1500);
    } else {
      wrong++;
      if (btn) btn.classList.add("wrong");
      // Highlight the correct option.
      document.querySelectorAll(".listen-option").forEach(b => {
        if (b.textContent.trim() === pair.english) b.classList.add("correct");
      });
      if (feedback) {
        feedback.className = "listen-feedback wrong";
        feedback.innerHTML = `
          <div class="listen-feedback-title">✗ Not quite</div>
          <div class="listen-feedback-thai">${pair.script} · ${pair.romanized} — ${pair.english}</div>
          <div class="listen-feedback-actions">
            <button class="btn btn-sm btn-primary" onclick="ListenChoose.continueNext()">Continue →</button>
          </div>
        `;
        feedback.style.display = "block";
      }
    }
  }

  function continueNext() {
    idx++;
    nextPrompt();
  }

  function finishRound() {
    isActive = false;
    try { window.speechSynthesis.cancel(); } catch {}
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    State.recordTopicRound(topic.id, correct, total);
    const streakMaintained = State.hasPlayedToday();
    const s = State.get();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🎧</div>
          <h2>Round Complete!</h2>
          ${streakMaintained ? '<div class="streak-maintained">🔥 Streak maintained!</div>' : ''}
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${accuracy}%</span>
              <span class="round-stat-label">Accuracy</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${xpEarned}</span>
              <span class="round-stat-label">XP Earned</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${correct}/${total}</span>
              <span class="round-stat-label">Correct</span>
            </div>
          </div>
          <div style="text-align:center;color:var(--text-muted);font-size:0.78rem;margin-top:0.5rem">
            🔥 Streak: ${s.streak} days · ⚡ XP today: ${s.xpToday || 0} · Rounds today: ${s.roundsToday || 0}
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="ListenChoose.start('${topic.id}')">Play Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back to Topics</button>
          </div>
        </div>
      </div>
    `);
  }

  function renderUnavailable() {
    UI.render(`
      <div class="listen-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="UI.navigate('#dashboard')">← Back</button>
          <h2>🎧 Listen &amp; Choose</h2>
          <div></div>
        </div>

        <div class="listen-unavailable">
          <div class="listen-unavailable-icon">🔇</div>
          <h3>No Thai voice available</h3>
          <p>This mode uses your device's built-in Thai text-to-speech. Your browser or OS doesn't seem to have one installed yet.</p>
          <ul class="listen-unavailable-steps">
            <li><strong>iOS:</strong> Settings → Accessibility → Spoken Content → Voices → add a Thai voice.</li>
            <li><strong>Android:</strong> Settings → Language &amp; input → Text-to-speech → install Thai voice data.</li>
            <li><strong>Desktop Chrome:</strong> The built-in Google Thai voice usually just works — try updating Chrome.</li>
          </ul>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="UI.navigate('#dashboard')">Back to Dashboard</button>
          </div>
        </div>
      </div>
    `);
  }

  function quit() {
    isActive = false;
    try { window.speechSynthesis.cancel(); } catch {}
    UI.navigate("#dashboard");
  }

  return { start, startQuick, answer, playAgain, setRate, continueNext, quit };
})();
