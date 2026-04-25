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
  // Session-only display mode: "both" | "script" | "romanized". Not persisted.
  let displayMode = "both";

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
      const slotIndex = Math.floor(Math.random() * pool.length);
      return { pair, slot: pool[slotIndex], slotIndex };
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

  // Case-insensitive substring blank. The bug we're guarding against:
  // pair.romanized starts capitalized ("Phǒm chêu Jawn") while slot.romanized
  // is the dictionary form ("phǒm"). A case-sensitive indexOf misses the
  // start-of-string occurrence and leaves the romanized un-blanked. Thai
  // script has no casing so the same logic works fine for it.
  function _blank(text, word) {
    if (!text) return "";
    if (!word) return text;
    const idx = text.toLowerCase().indexOf(word.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + SLOT_PLACEHOLDER + text.slice(idx + word.length);
  }

  function renderPrompt(filled) {
    const { pair, slot } = currentEntry();
    const frame = topic.frame || {};

    const displayScript = filled ? pair.script : _blank(pair.script, slot.script);
    const displayRom = filled ? pair.romanized : _blank(pair.romanized, slot.romanized);

    UI.render(`
      <div class="pattern-screen mode-${displayMode}">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="PatternPractice.quit()">← Quit</button>
          <h2>🧩 ${topic.emoji} ${topic.label}</h2>
          <div class="pattern-progress-count">${idx + 1} / ${queue.length}</div>
        </div>

        <div class="pattern-display-toggle" role="group" aria-label="Display mode">
          <button class="pattern-display-btn ${displayMode==='both'?'active':''}" onclick="PatternPractice.setMode('both')">Both</button>
          <button class="pattern-display-btn ${displayMode==='script'?'active':''}" onclick="PatternPractice.setMode('script')">Script</button>
          <button class="pattern-display-btn ${displayMode==='romanized'?'active':''}" onclick="PatternPractice.setMode('romanized')">Romanized</button>
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

  function _locatePair(pair) {
    for (const t of TOPICS) {
      const i = (t.pairs || []).indexOf(pair);
      if (i !== -1) return { topicId: t.id, index: i };
    }
    return null;
  }

  function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Sequencer state for the post-answer 3-clip playback. Cancelled if the
  // user quits or taps Continue mid-sequence.
  let _seqToken = 0;

  function _setIndicator(step) {
    // step ∈ 0..3 — number of dots that should be lit.
    const el = document.getElementById("pattern-audio-dots");
    if (!el) return;
    const dots = el.querySelectorAll(".audio-dot");
    dots.forEach((d, i) => d.classList.toggle("on", i < step));
  }

  async function _playSequence(token) {
    const entry = currentEntry();
    if (!entry) return;
    const loc = _locatePair(entry.pair);
    if (!loc) return;

    _setIndicator(1);
    await Audio.playSlot(loc.topicId, loc.index, entry.slotIndex);
    if (token !== _seqToken) return;
    await _sleep(500);
    if (token !== _seqToken) return;

    _setIndicator(2);
    await Audio.playWord(loc.topicId, loc.index);
    if (token !== _seqToken) return;
    await _sleep(500);
    if (token !== _seqToken) return;

    _setIndicator(3);
    await Audio.playSentence(loc.topicId, loc.index);
    if (token !== _seqToken) return;

    const s = State.get();
    if (s.autoAdvancePatternPractice) {
      await _sleep(1000);
      if (token !== _seqToken) return;
      continueNext();
    }
  }

  function replaySlot() {
    const e = currentEntry(); if (!e) return;
    const loc = _locatePair(e.pair); if (!loc) return;
    Audio.playSlot(loc.topicId, loc.index, e.slotIndex);
  }
  function replayWord() {
    const e = currentEntry(); if (!e) return;
    const loc = _locatePair(e.pair); if (!loc) return;
    Audio.playWord(loc.topicId, loc.index);
  }
  function replaySentence() {
    const e = currentEntry(); if (!e) return;
    const loc = _locatePair(e.pair); if (!loc) return;
    Audio.playSentence(loc.topicId, loc.index);
  }
  // Back-compat wrapper (older inline handler may still call it)
  function replayAudio() { replaySentence(); }

  function _fillFrame(isCorrect) {
    const { pair, slot } = currentEntry();
    const frameEl = document.querySelector(".pattern-frame-script");
    const romEl = document.querySelector(".pattern-frame-romanized");
    if (frameEl) {
      frameEl.textContent = pair.script;
      frameEl.classList.add(isCorrect ? "filled" : "filled-wrong");
    }
    if (romEl) romEl.textContent = pair.romanized;

    const feedback = document.getElementById("pattern-feedback");
    if (!feedback) return;

    const example = pair.example || {};
    const wrongTitle = displayMode === "romanized"
      ? `✗ Not quite — the word was <strong>${slot.romanized}</strong>`
      : `✗ Not quite — the word was <strong>${slot.script}</strong>`;
    const title = isCorrect
      ? `<div class="pattern-feedback-title">✓ Correct! +${CORRECT_XP} XP</div>`
      : `<div class="pattern-feedback-title">${wrongTitle}</div>`;

    feedback.className = `pattern-feedback ${isCorrect ? 'correct' : 'wrong'}`;
    feedback.innerHTML = `
      <div id="pattern-audio-dots" class="pattern-audio-dots" aria-hidden="true">
        <span class="audio-dot"></span><span class="audio-dot"></span><span class="audio-dot"></span>
      </div>
      ${title}
      <div class="pattern-feedback-block">
        <button class="btn btn-sm pattern-replay-btn" onclick="PatternPractice.replaySlot()" aria-label="Replay slot word">🔊</button>
        <span class="pattern-feedback-script">${slot.script || ""}</span>
        <span class="pattern-feedback-sep"> · </span>
        <span class="pattern-feedback-romanized">${slot.romanized || ""}</span>
        <span class="pattern-feedback-english"> — ${slot.english || ""}</span>
      </div>
      <div class="pattern-feedback-block">
        <button class="btn btn-sm pattern-replay-btn" onclick="PatternPractice.replayWord()" aria-label="Replay sentence">🔊</button>
        <span class="pattern-feedback-script">${pair.script}</span>
        <span class="pattern-feedback-sep"> · </span>
        <span class="pattern-feedback-romanized">${pair.romanized}</span>
        <div class="pattern-feedback-english">${pair.english || ""}</div>
      </div>
      ${example.thai ? `
        <div class="pattern-feedback-block">
          <button class="btn btn-sm pattern-replay-btn" onclick="PatternPractice.replaySentence()" aria-label="Replay example">🔊</button>
          <span class="pattern-feedback-script">${example.thai}</span>
          ${example.romanized ? `<span class="pattern-feedback-sep"> · </span><span class="pattern-feedback-romanized">${example.romanized}</span>` : ''}
          ${example.english ? `<div class="pattern-feedback-english">${example.english}</div>` : ''}
        </div>
      ` : ''}
      <div class="pattern-feedback-actions">
        <button class="btn btn-primary" onclick="PatternPractice.continueNext()">Continue → <span class="kbd">space</span></button>
      </div>
    `;
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
      if (levelUp) setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);
    } else {
      wrong++;
      if (buttons[index]) buttons[index].classList.add("wrong");
      buttons.forEach(b => {
        const scriptEl = b.querySelector(".pattern-option-script");
        if (scriptEl && scriptEl.textContent === slot.script) b.classList.add("correct");
      });
    }
    _fillFrame(isCorrect);
    _seqToken++;
    _playSequence(_seqToken);
  }

  function continueNext() {
    if (!isActive) return;
    _seqToken++; // cancel any in-flight sequence
    Audio.cancel();
    idx++;
    nextPrompt();
  }

  // Spacebar advances when the result screen is showing.
  function _onKeydown(e) {
    if (!isActive || !answered) return;
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      continueNext();
    }
  }
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", _onKeydown);
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
    _seqToken++;
    Audio.cancel();
    UI.navigate("#practice");
  }

  function setMode(mode) {
    if (mode !== "both" && mode !== "script" && mode !== "romanized") return;
    displayMode = mode;
    // Patch the live DOM in place — avoids re-running renderPrompt which
    // would lose the answered/feedback state.
    const screen = document.querySelector(".pattern-screen");
    if (screen) {
      screen.classList.remove("mode-both", "mode-script", "mode-romanized");
      screen.classList.add("mode-" + mode);
      screen.querySelectorAll(".pattern-display-btn").forEach(btn => {
        const label = btn.textContent.trim().toLowerCase();
        btn.classList.toggle("active",
          (mode === "both" && label === "both") ||
          (mode === "script" && label === "script") ||
          (mode === "romanized" && label === "romanized"));
      });
    }
  }

  return { start, answer, continueNext, quit, replayAudio, replaySlot, replayWord, replaySentence, setMode };
})();
