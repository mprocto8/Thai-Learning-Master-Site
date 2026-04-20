/**
 * Pattern Practice — teach sentence frames by making the user actively
 * plug the right word into a blank slot. Builds generative language
 * ability rather than one-way memorization.
 *
 * Only available for topics where `type === "pattern"`. Each pair in a
 * pattern topic carries a `slot` describing what fills the blank; the
 * user is prompted for a specific sentence and must pick the correct
 * slot word out of 4–6 buttons.
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
  let queue = [];
  let idx = 0;
  let correct = 0;
  let wrong = 0;
  let xpEarned = 0;
  let options = [];
  let answered = false;
  let isActive = false;

  function start(topicId) {
    const t = TOPICS.find(tp => tp.id === topicId);
    if (!t || t.type !== "pattern") {
      UI.navigate("#dashboard");
      return;
    }
    // Keep only pairs that actually carry a slot (the field that makes
    // this mode possible).
    const valid = (t.pairs || []).filter(p => p && p.slot && p.slot.script);
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
    queue = [...valid].sort(() => Math.random() - 0.5).slice(0, Math.min(ROUND_SIZE, valid.length));
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

  /** Build distractor slot words: prefer slots from OTHER pattern topics, then
   *  any vocabulary topic, then other pairs in the current topic. Dedup by
   *  script and exclude the correct answer. */
  function buildDistractors(correctPair, n) {
    const correctScript = correctPair.slot.script;
    const seen = new Set([correctScript]);
    const bucketOtherPatterns = [];
    const bucketVocab = [];
    const bucketSameTopic = [];

    for (const t of TOPICS) {
      if (!t.pairs) continue;
      for (const p of t.pairs) {
        if (t.type === "pattern" && p && p.slot && p.slot.script) {
          if (seen.has(p.slot.script)) continue;
          if (t.id === topic.id && p === correctPair) continue;
          seen.add(p.slot.script);
          if (t.id === topic.id) bucketSameTopic.push(p.slot);
          else bucketOtherPatterns.push(p.slot);
        } else if (t.type !== "pattern" && p && p.script && p.english) {
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
    const pair = currentPair();
    const distractors = buildDistractors(pair, Math.max(0, OPTION_COUNT - 1));
    options = [pair.slot, ...distractors].sort(() => Math.random() - 0.5);
    renderPrompt(null);
  }

  function fillSlot(frameText, slotText) {
    if (!frameText) return slotText || "";
    // Replace the first "___" (or run of 2+ underscores) with the slot word.
    return frameText.replace(/_{2,}/, slotText || SLOT_PLACEHOLDER);
  }

  function renderPrompt(state) {
    const pair = currentPair();
    const frame = topic.frame || {};
    const filledRom = state && state.filled ? fillSlot(frame.romanized, pair.slot.romanized) : frame.romanized || "";
    const filledScript = state && state.filled ? fillSlot(frame.script, pair.slot.script) : frame.script || "";

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
          <div class="pattern-frame-script ${state && state.filled ? 'filled' : ''}">${filledScript}</div>
          <div class="pattern-frame-romanized">${filledRom}</div>
          <div class="pattern-frame-english">${frame.english || ""}</div>
          ${frame.explanation ? `<div class="pattern-frame-explanation">${frame.explanation}</div>` : ''}
        </div>

        <div class="pattern-prompt">
          How do you say: <strong>“${pair.english}”</strong>?
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
    const pair = currentPair();
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

  function answer(index) {
    if (answered) return;
    answered = true;
    const chosen = options[index];
    const pair = currentPair();
    const isCorrect = chosen.script === pair.slot.script;
    const buttons = document.querySelectorAll(".pattern-option");
    const feedback = document.getElementById("pattern-feedback");

    if (isCorrect) {
      correct++;
      xpEarned += CORRECT_XP;
      const levelUp = State.addXP(CORRECT_XP);
      State.checkStreak();

      if (buttons[index]) buttons[index].classList.add("correct");

      // Rerender the frame with the slot filled in so the user sees the
      // complete sentence before auto-advance.
      const frameEl = document.querySelector(".pattern-frame-script");
      const romEl = document.querySelector(".pattern-frame-romanized");
      if (frameEl) {
        frameEl.textContent = fillSlot(topic.frame?.script, pair.slot.script);
        frameEl.classList.add("filled");
      }
      if (romEl) romEl.textContent = fillSlot(topic.frame?.romanized, pair.slot.romanized);

      if (feedback) {
        feedback.className = "pattern-feedback correct";
        feedback.innerHTML = `
          <div class="pattern-feedback-title">✓ Correct! +${CORRECT_XP} XP</div>
          <div class="pattern-feedback-thai">${pair.script} · ${pair.romanized}</div>
        `;
        feedback.style.display = "block";
      }

      _playCorrectAudio();
      if (levelUp) setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);

      setTimeout(() => { if (!isActive) return; idx++; nextPrompt(); }, ADVANCE_MS);
    } else {
      wrong++;
      if (buttons[index]) buttons[index].classList.add("wrong");
      // Highlight the correct option in green.
      buttons.forEach(b => {
        const scriptEl = b.querySelector(".pattern-option-script");
        if (scriptEl && scriptEl.textContent === pair.slot.script) {
          b.classList.add("correct");
        }
      });
      // Play the full correct sentence so the user still gets the audio input.
      _playCorrectAudio();

      if (feedback) {
        feedback.className = "pattern-feedback wrong";
        feedback.innerHTML = `
          <div class="pattern-feedback-title">✗ Not quite</div>
          <div class="pattern-feedback-thai">${pair.script} · ${pair.romanized}</div>
          <div class="pattern-feedback-english">${pair.english}</div>
          <div class="pattern-feedback-actions">
            <button class="btn btn-sm btn-primary" onclick="PatternPractice.continueNext()">Continue →</button>
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

  return { start, answer, continueNext, quit };
})();
