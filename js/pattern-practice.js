/**
 * Pattern Practice — teach sentence frames by making the user actively
 * plug the right word into a blank slot. Builds generative language
 * ability rather than one-way memorization.
 *
 * Only available for topics where `type === "pattern"`. Each pair carries
 * a `slottable` array listing which of its words can become the blank.
 * At round time one is picked at random, so a single pair can teach
 * multiple positions across replays. Pattern markers (e.g. `mâi`, `mǎi`)
 * are excluded from `slottable` — blanking them teaches nothing.
 *
 * Scoring: +12 XP per correct answer (harder than other modes), no
 * penalty on incorrect. Round = 10 prompts, no repeats within a round.
 * Results persisted via State.recordTopicRound.
 */
const PatternPractice = (() => {
  const ROUND_SIZE = 10;
  const OPTION_COUNT = 5; // 4–6; fixed at 5 for a predictable 2-column grid.
  const CORRECT_XP = 12;
  const ADVANCE_MS = 2000;

  const SLOT_PLACEHOLDER = "___";

  let topic = null;
  // queue is an array of { pair, slot } — the selected slot is frozen
  // at the start of the round so prompts and answers stay consistent.
  let queue = [];
  let idx = 0;
  let correct = 0;
  let wrong = 0;
  let xpEarned = 0;
  let options = [];
  let answered = false;
  let isActive = false;

  function _pairSlottable(p) {
    if (!p) return [];
    if (Array.isArray(p.slottable) && p.slottable.length) return p.slottable;
    if (p.slot && p.slot.script) return [p.slot];
    return [];
  }

  function start(topicId) {
    const t = TOPICS.find(tp => tp.id === topicId);
    if (!t || t.type !== "pattern") {
      UI.navigate("#dashboard");
      return;
    }
    // Keep only pairs that actually carry at least one slottable word.
    const valid = (t.pairs || []).filter(p => _pairSlottable(p).length > 0);
    if (valid.length === 0) {
      UI.render(`
        <div class="pattern-screen">
          <div class="game-header">
            <button class="btn btn-ghost back-btn" onclick="UI.navigate('#practice')">← Back</button>
            <h2>🧩 ${t.emoji} ${t.label}</h2>
            <div></div>
          </div>
          <div class="pattern-empty">
            <div class="pattern-empty-icon">📭</div>
            <h3>No practice items yet</h3>
            <p>This pattern topic doesn't have any slot fillings yet. Check back soon.</p>
            <div class="round-actions">
              <button class="btn btn-primary" onclick="UI.navigate('#practice')">Back to Practice</button>
            </div>
          </div>
        </div>
      `);
      return;
    }

    topic = t;
    const picked = [...valid].sort(() => Math.random() - 0.5).slice(0, Math.min(ROUND_SIZE, valid.length));
    queue = picked.map(pair => {
      const pool = _pairSlottable(pair);
      const slot = pool[Math.floor(Math.random() * pool.length)];
      return { pair, slot };
    });
    idx = 0;
    correct = 0;
    wrong = 0;
    xpEarned = 0;
    answered = false;
    isActive = true;
    nextPrompt();
  }

  function currentEntry() {
    return queue[idx];
  }

  /** Collect slottable words from every pattern topic + any vocab fallback,
   *  dedup by script, exclude the correct answer, return up to n. */
  function buildDistractors(correctSlot, n) {
    const correctScript = correctSlot.script;
    const seen = new Set([correctScript]);
    const bucketOtherPatterns = [];
    const bucketVocab = [];
    const bucketSameTopic = [];

    for (const t of TOPICS) {
      if (!t.pairs) continue;
      for (const p of t.pairs) {
        if (t.type === "pattern") {
          for (const s of _pairSlottable(p)) {
            if (!s || !s.script) continue;
            if (seen.has(s.script)) continue;
            seen.add(s.script);
            if (t.id === topic.id) bucketSameTopic.push(s);
            else bucketOtherPatterns.push(s);
          }
        } else if (p && p.script && p.english) {
          if (seen.has(p.script)) continue;
          seen.add(p.script);
          bucketVocab.push({ script: p.script, romanized: p.romanized, english: p.english });
        }
      }
    }

    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const pool = [...shuffle(bucketOtherPatterns), ...shuffle(bucketSameTopic), ...shuffle(bucketVocab)];
    return pool.slice(0, n);
  }

  function nextPrompt() {
    if (idx >= queue.length) { finishRound(); return; }
    answered = false;
    const { slot } = currentEntry();
    const distractors = buildDistractors(slot, Math.max(0, OPTION_COUNT - 1));
    options = [slot, ...distractors].sort(() => Math.random() - 0.5);
    renderPrompt(false);
  }

  function _blank(text, word) {
    if (!text) return "";
    if (!word) return text;
    const idx = text.indexOf(word);
    if (idx === -1) return text;
    return text.slice(0, idx) + SLOT_PLACEHOLDER + text.slice(idx + word.length);
  }

  function renderPrompt(filled) {
    const { pair, slot } = currentEntry();
    const frame = topic.frame || {};

    const displayScript = filled ? pair.script : _blank(pair.script, slot.script);
    const displayRom = filled ? pair.romanized : _blank(pair.romanized, slot.romanized);

    UI.render(`
      <div class="pattern-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="PatternPractice.quit()">← Quit</button>
          <h2>🧩 ${topic.emoji} ${topic.label}</h2>
          <div class="pattern-progress-count">${idx + 1} / ${queue.length}</div>
        </div>

        <div class="pattern-progress">
          <div class="pattern-progress-bar" style="width:${(idx / queue.length) * 100}%"></div>
        </div>

        <div class="pattern-score-bar">
          <span>✅ ${correct}</span>
          <span>❌ ${wrong}</span>
          <span>⚡ ${xpEarned} XP</span>
        </div>

        <div class="pattern-frame">
          <div class="pattern-frame-script ${filled ? 'filled' : ''}">${displayScript}</div>
          <div class="pattern-frame-romanized">${displayRom}</div>
          <div class="pattern-frame-english">${pair.english || ""}</div>
          ${frame.explanation ? `<div class="pattern-frame-explanation">${frame.explanation}</div>` : ''}
        </div>

        <div class="pattern-prompt">
          In <strong>&ldquo;${pair.english}&rdquo;</strong>, what's the Thai word for <strong>&ldquo;${slot.english}&rdquo;</strong>?
        </div>

        <div class="pattern-options">
          ${options.map((opt, i) => `
            <button class="btn pattern-option" onclick="PatternPractice.answer(${i})">
              <span class="pattern-option-script">${opt.script}</span>
              <span class="pattern-option-romanized">${opt.romanized || ""}</span>
            </button>
          `).join("")}
        </div>

        <div id="pattern-feedback" class="pattern-feedback" style="display:none"></div>
      </div>
    `);
  }

  function _playCorrectAudio() {
    const { pair } = currentEntry();
    const loc = _locatePair(pair);
    if (loc) Audio.playSentence(loc.topicId, loc.index);
    else if (pair && pair.script) Audio.speak(pair.script);
  }

  function _locatePair(pair) {
    for (const t of TOPICS) {
      const i = (t.pairs || []).indexOf(pair);
      if (i !== -1) return { topicId: t.id, index: i };
    }
    return null;
  }

  function replayAudio() {
    _playCorrectAudio();
  }

  function _fillFrame(isCorrect) {
    const { pair, slot } = currentEntry();
    const frameEl = document.querySelector(".pattern-frame-script");
    const romEl = document.querySelector(".pattern-frame-romanized");
    if (frameEl) {
      frameEl.textContent = pair.script;
      frameEl.classList.add("filled");
    }
    if (romEl) romEl.textContent = pair.romanized;

    const feedback = document.getElementById("pattern-feedback");
    if (!feedback) return;
    const replayBtn = `<button class="btn btn-sm pattern-replay" onclick="PatternPractice.replayAudio()" aria-label="Replay audio">🔊 Replay</button>`;
    if (isCorrect) {
      feedback.className = "pattern-feedback correct";
      feedback.innerHTML = `
        <div class="pattern-feedback-title">✓ Correct! +${CORRECT_XP} XP</div>
        <div class="pattern-feedback-thai">${pair.script} · ${pair.romanized}</div>
        <div class="pattern-feedback-actions">${replayBtn}</div>
      `;
    } else {
      feedback.className = "pattern-feedback wrong";
      feedback.innerHTML = `
        <div class="pattern-feedback-title">✗ Not quite — the word was <strong>${slot.script}</strong></div>
        <div class="pattern-feedback-thai">${pair.script} · ${pair.romanized}</div>
        <div class="pattern-feedback-english">${pair.english}</div>
        <div class="pattern-feedback-actions">
          ${replayBtn}
          <button class="btn btn-sm btn-primary" onclick="PatternPractice.continueNext()">Continue →</button>
        </div>
      `;
    }
    feedback.style.display = "block";
  }

  function answer(index) {
    if (answered) return;
    answered = true;
    const chosen = options[index];
    const { slot } = currentEntry();
    const isCorrect = chosen.script === slot.script;
    const buttons = document.querySelectorAll(".pattern-option");

    if (isCorrect) {
      correct++;
      xpEarned += CORRECT_XP;
      const levelUp = State.addXP(CORRECT_XP);
      State.checkStreak();

      if (buttons[index]) buttons[index].classList.add("correct");
      _fillFrame(true);
      _playCorrectAudio();
      if (levelUp) setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);

      setTimeout(() => { if (!isActive) return; idx++; nextPrompt(); }, ADVANCE_MS);
    } else {
      wrong++;
      if (buttons[index]) buttons[index].classList.add("wrong");
      buttons.forEach(b => {
        const scriptEl = b.querySelector(".pattern-option-script");
        if (scriptEl && scriptEl.textContent === slot.script) {
          b.classList.add("correct");
        }
      });
      _fillFrame(false);
      _playCorrectAudio();
    }
  }

  function continueNext() {
    idx++;
    nextPrompt();
  }

  function finishRound() {
    isActive = false;
    Audio.cancel();
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    State.recordTopicRound(topic.id, correct, total);
    const streakMaintained = State.hasPlayedToday();
    const s = State.get();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🧩</div>
          <h2>Pattern Round Complete!</h2>
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
            <button class="btn btn-primary" onclick="PatternPractice.start('${topic.id}')">Play Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#practice')">Back to Practice</button>
          </div>
        </div>
      </div>
    `);
  }

  function quit() {
    isActive = false;
    Audio.cancel();
    UI.navigate("#practice");
  }

  return { start, answer, continueNext, quit, replayAudio };
})();
