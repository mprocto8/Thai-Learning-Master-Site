/**
 * Typing Challenge — active-recall mode.
 * Shows an English prompt; the user types the romanized Thai.
 * Lenient matching: strips whitespace, tone diacritics, and case before
 * comparing. Supports "/"-separated acceptable answers in the data.
 */
const TypingChallenge = (() => {
  const ROUND_SIZE = 10;

  let topic = null;
  let queue = [];          // array of pair objects for this round
  let idx = 0;
  let correct = 0;
  let wrong = 0;
  let xpEarned = 0;
  let answered = false;    // lock after submit until Try again / auto-advance
  let isActive = false;

  /** Lenient match: lowercase, strip diacritics, strip separators/punctuation,
   *  collapse whitespace, trim. So "sa wat dii" matches "sà-wàt-dii". */
  function normalize(s) {
    if (!s) return "";
    return s
      .toLowerCase()
      .normalize("NFD")
      // Remove combining marks (tone diacritics: â à á ǎ ā ê è é ě ē î ì í ǐ ī …)
      .replace(/[\u0300-\u036f]/g, "")
      // Strip hyphens, en/em dashes, apostrophes, periods.
      .replace(/[-\u2013\u2014'\u2019.]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Returns true if typed matches any "/"-separated acceptable answer. */
  function isMatch(typed, expected) {
    const t = normalize(typed);
    if (!t) return false;
    const parts = expected.split("/").map(p => normalize(p)).filter(Boolean);
    return parts.some(p => p === t);
  }

  function start(topicId) {
    topic = TOPICS.find(t => t.id === topicId);
    if (!topic) { UI.navigate("#dashboard"); return; }
    // Randomize and take up to ROUND_SIZE — no repeats within a round.
    const shuffled = [...topic.pairs].sort(() => Math.random() - 0.5);
    queue = shuffled.slice(0, Math.min(ROUND_SIZE, shuffled.length));
    idx = 0;
    correct = 0;
    wrong = 0;
    xpEarned = 0;
    answered = false;
    isActive = true;
    renderPrompt();
  }

  function currentPair() {
    return queue[idx];
  }

  function renderPrompt() {
    if (idx >= queue.length) { finishRound(); return; }
    answered = false;
    const pair = currentPair();

    UI.render(`
      <div class="typing-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="TypingChallenge.quit()">← Quit</button>
          <h2>⌨️ ${topic.emoji} ${topic.label}</h2>
          <div class="typing-progress-count">${idx + 1} / ${queue.length}</div>
        </div>

        <div class="typing-progress">
          <div class="typing-progress-bar" style="width:${(idx / queue.length) * 100}%"></div>
        </div>

        <div class="typing-score-bar">
          <span>✅ ${correct}</span>
          <span>❌ ${wrong}</span>
          <span>⚡ ${xpEarned} XP</span>
        </div>

        <div class="typing-prompt-card">
          <div class="typing-prompt-label">Type the Thai for</div>
          <div class="typing-prompt-english">${pair.english}</div>
        </div>

        <form class="typing-form" onsubmit="TypingChallenge.submit(event)">
          <input
            id="typing-input"
            class="typing-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            placeholder="Romanized (tone marks optional)"
          />
          <button class="btn btn-primary btn-lg typing-submit" type="submit">Submit</button>
        </form>

        <div id="typing-feedback" class="typing-feedback" style="display:none"></div>
      </div>
    `);

    // Auto-focus the input so the mobile keyboard opens and desktop users can
    // start typing right away.
    setTimeout(() => {
      const el = document.getElementById("typing-input");
      if (el) el.focus();
    }, 50);
  }

  function submit(event) {
    if (event) event.preventDefault();
    if (answered) return;
    const input = document.getElementById("typing-input");
    if (!input) return;
    const typed = input.value;
    const pair = currentPair();
    const ok = isMatch(typed, pair.romanized);

    answered = true;
    const feedback = document.getElementById("typing-feedback");
    const card = document.querySelector(".typing-prompt-card");

    if (ok) {
      correct++;
      const xp = 10;
      xpEarned += xp;
      const levelUp = State.addXP(xp);
      State.checkStreak();

      if (card) card.classList.add("correct-flash");
      if (feedback) {
        feedback.className = "typing-feedback correct";
        feedback.innerHTML = `
          <div class="typing-feedback-title">✓ Correct! +${xp} XP</div>
          <div class="typing-feedback-thai">${pair.script} · ${pair.romanized}</div>
          ${pair.example ? `<div class="typing-feedback-example">${pair.example.thai} — ${pair.example.english}</div>` : ""}
        `;
        feedback.style.display = "block";
      }

      if (levelUp) setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);

      setTimeout(() => { idx++; renderPrompt(); }, 1500);
    } else {
      wrong++;
      if (card) card.classList.add("wrong-flash");
      if (feedback) {
        feedback.className = "typing-feedback wrong";
        feedback.innerHTML = `
          <div class="typing-feedback-title">✗ Not quite</div>
          <div class="typing-feedback-thai">Correct: <strong>${pair.romanized}</strong> · ${pair.script}</div>
          <div class="typing-feedback-actions">
            <button class="btn btn-sm btn-secondary" onclick="TypingChallenge.tryAgain()">Try again</button>
            <button class="btn btn-sm btn-primary" onclick="TypingChallenge.skip()">Continue →</button>
          </div>
        `;
        feedback.style.display = "block";
      }
      // Disable the form buttons so the user picks Try again or Continue.
      const submitBtn = document.querySelector(".typing-submit");
      if (submitBtn) submitBtn.disabled = true;
      if (input) input.disabled = true;
    }
  }

  function tryAgain() {
    // Re-enable inputs and clear feedback. Don't re-count as wrong again on
    // the next submit — but do leave the existing wrong++ in place (the user
    // did miss it first time).
    answered = false;
    const input = document.getElementById("typing-input");
    const submitBtn = document.querySelector(".typing-submit");
    const feedback = document.getElementById("typing-feedback");
    const card = document.querySelector(".typing-prompt-card");
    if (input) { input.disabled = false; input.value = ""; input.focus(); }
    if (submitBtn) submitBtn.disabled = false;
    if (feedback) { feedback.style.display = "none"; feedback.innerHTML = ""; }
    if (card) card.classList.remove("wrong-flash");
  }

  function skip() {
    idx++;
    renderPrompt();
  }

  function finishRound() {
    isActive = false;
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    State.recordTopicRound(topic.id, correct, total);
    const streakMaintained = State.hasPlayedToday();
    const s = State.get();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">⌨️</div>
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
            <button class="btn btn-primary" onclick="TypingChallenge.start('${topic.id}')">Play Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back to Topics</button>
          </div>
        </div>
      </div>
    `);
  }

  function quit() {
    isActive = false;
    UI.navigate("#dashboard");
  }

  return { start, submit, tryAgain, skip, quit };
})();
