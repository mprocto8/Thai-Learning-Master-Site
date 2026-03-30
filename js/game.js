/**
 * Vocabulary matching game — two-column tap-to-match.
 * Shows note tooltips on correct matches when a pair has a note field.
 * matchPulse animation on correct matches.
 */
const Game = (() => {
  let currentTopic = null;
  let pairs = [];
  let selectedLeft = null;   // Thai column selection
  let selectedRight = null;  // English column selection
  let matchedPairs = new Set();
  let streak = 0;
  let roundCorrect = 0;
  let roundWrong = 0;
  let xpEarned = 0;
  let isActive = false;

  function start(topicId) {
    currentTopic = TOPICS.find(t => t.id === topicId);
    if (!currentTopic) return;
    pairs = [...currentTopic.pairs].sort(() => Math.random() - 0.5);
    selectedLeft = null;
    selectedRight = null;
    matchedPairs = new Set();
    streak = 0;
    roundCorrect = 0;
    roundWrong = 0;
    xpEarned = 0;
    isActive = true;
    renderGame();
  }

  function renderGame() {
    const showScript = State.get().showScript;
    const shuffledEnglish = [...pairs].sort(() => Math.random() - 0.5);

    UI.render(`
      <div class="game-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="UI.navigate('#dashboard')">← Back</button>
          <h2>${currentTopic.emoji} ${currentTopic.label}</h2>
          <div class="game-streak">
            <span class="streak-flame ${streak >= 3 ? 'on' : ''}" style="font-size:${Math.min(1.2 + streak * 0.15, 2.5)}em">🔥</span>
            <span class="streak-count">${streak > 0 ? `${streak}x` : ''}</span>
            ${streak >= 10 ? '<span class="streak-badge">10x!</span>' : streak >= 5 ? '<span class="streak-badge">5x!</span>' : streak >= 3 ? '<span class="streak-badge">3x!</span>' : ''}
          </div>
        </div>

        <div class="game-progress">
          <div class="game-progress-bar" style="width:${(matchedPairs.size / pairs.length) * 100}%"></div>
        </div>

        <div class="script-toggle">
          <button class="btn btn-sm ${!showScript ? 'btn-active' : ''}" onclick="Game.toggleScript(false)">Romanized</button>
          <button class="btn btn-sm ${showScript ? 'btn-active' : ''}" onclick="Game.toggleScript(true)">Thai Script</button>
        </div>

        <div class="match-columns">
          <div class="match-col thai-col">
            ${pairs.map((p, i) => `
              <button class="match-card thai-card ${matchedPairs.has(i) ? 'matched' : ''} ${selectedLeft === i ? 'selected' : ''}"
                data-index="${i}" onclick="Game.selectThai(${i})" ${matchedPairs.has(i) ? 'disabled' : ''}>
                ${showScript ? p.script : p.romanized}
              </button>
            `).join("")}
          </div>
          <div class="match-col eng-col">
            ${shuffledEnglish.map((p) => {
              const origIdx = pairs.indexOf(p);
              return `
                <button class="match-card eng-card ${matchedPairs.has(origIdx) ? 'matched' : ''} ${selectedRight === origIdx ? 'selected' : ''}"
                  data-index="${origIdx}" onclick="Game.selectEnglish(${origIdx})" ${matchedPairs.has(origIdx) ? 'disabled' : ''}>
                  ${p.english}
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div class="game-score-bar">
          <span>✅ ${roundCorrect}</span>
          <span>❌ ${roundWrong}</span>
          <span>⚡ ${xpEarned} XP</span>
        </div>
      </div>
    `);
  }

  function selectThai(index) {
    if (matchedPairs.has(index)) return;
    // Deselect if already selected
    if (selectedLeft === index) {
      selectedLeft = null;
      document.querySelectorAll(".thai-card").forEach(el => el.classList.remove("selected"));
      return;
    }
    // Replace selection on same side
    selectedLeft = index;
    document.querySelectorAll(".thai-card").forEach(el => el.classList.remove("selected"));
    const card = document.querySelector(`.thai-card[data-index="${index}"]`);
    if (card) card.classList.add("selected");
    // Check if both sides selected
    if (selectedRight !== null) checkMatch();
  }

  function selectEnglish(index) {
    if (matchedPairs.has(index)) return;
    // Deselect if already selected
    if (selectedRight === index) {
      selectedRight = null;
      document.querySelectorAll(".eng-card").forEach(el => el.classList.remove("selected"));
      return;
    }
    // Replace selection on same side
    selectedRight = index;
    document.querySelectorAll(".eng-card").forEach(el => el.classList.remove("selected"));
    const card = document.querySelector(`.eng-card[data-index="${index}"]`);
    if (card) card.classList.add("selected");
    // Check if both sides selected
    if (selectedLeft !== null) checkMatch();
  }

  function checkMatch() {
    const thaiCard = document.querySelector(`.thai-card[data-index="${selectedLeft}"]`);
    const engCard = document.querySelector(`.eng-card[data-index="${selectedRight}"]`);

    if (selectedLeft === selectedRight) {
      // Correct match
      const matchedIndex = selectedLeft;
      matchedPairs.add(matchedIndex);
      streak++;
      roundCorrect++;

      // Calculate XP
      let xp = 10;
      if (streak >= 10) xp += 15;
      else if (streak >= 5) xp += 10;
      else if (streak >= 3) xp += 5;
      xpEarned += xp;

      // Animate with matchPulse
      thaiCard.classList.add("correct", "match-pulse");
      engCard.classList.add("correct", "match-pulse");

      // Show XP popup
      const rect = engCard.getBoundingClientRect();
      UI.showXP(xp, rect.right - 20, rect.top);

      const levelUp = State.addXP(xp);
      State.checkStreak();

      // Show note tooltip if pair has a note field
      const pair = pairs[matchedIndex];
      if (pair.note) {
        showMatchNote(engCard, pair.note);
      }

      setTimeout(() => {
        thaiCard.classList.add("matched");
        engCard.classList.add("matched");
        thaiCard.disabled = true;
        engCard.disabled = true;
        selectedLeft = null;
        selectedRight = null;

        if (matchedPairs.size === pairs.length) {
          // QOL 7: auto-advance after brief message
          UI.toast("\u2713 All matched!", "info");
          setTimeout(() => finishRound(), 1000);
        } else {
          updateStreakDisplay();
        }

        if (levelUp) {
          setTimeout(() => UI.celebrate(levelUp.name, levelUp.emoji), 300);
        }
      }, 400);

    } else {
      // Wrong match
      streak = 0;
      roundWrong++;
      thaiCard.classList.add("wrong");
      engCard.classList.add("wrong");

      setTimeout(() => {
        thaiCard.classList.remove("wrong", "selected");
        engCard.classList.remove("wrong", "selected");
        selectedLeft = null;
        selectedRight = null;
        updateStreakDisplay();
      }, 500);
    }
  }

  function deselectAll() {
    if (selectedLeft !== null) {
      const card = document.querySelector(`.thai-card[data-index="${selectedLeft}"]`);
      if (card) card.classList.remove("selected");
      selectedLeft = null;
    }
    if (selectedRight !== null) {
      const card = document.querySelector(`.eng-card[data-index="${selectedRight}"]`);
      if (card) card.classList.remove("selected");
      selectedRight = null;
    }
  }

  function showMatchNote(targetEl, noteText) {
    const note = document.createElement("div");
    note.className = "match-note";
    note.textContent = "💡 " + noteText;
    targetEl.parentElement.insertBefore(note, targetEl.nextSibling);

    setTimeout(() => {
      if (note.parentElement) {
        note.style.opacity = "0";
        setTimeout(() => note.remove(), 300);
      }
    }, 2500);
  }

  function updateStreakDisplay() {
    const streakFlame = document.querySelector(".streak-flame");
    const streakCount = document.querySelector(".streak-count");
    const streakBadge = document.querySelector(".streak-badge");
    if (streakFlame) {
      streakFlame.style.fontSize = `${Math.min(1.2 + streak * 0.15, 2.5)}em`;
      streakFlame.classList.toggle("on", streak >= 3);
    }
    if (streakCount) streakCount.textContent = streak > 0 ? `${streak}x` : "";
    if (streakBadge) {
      if (streak >= 10) streakBadge.textContent = "10x!";
      else if (streak >= 5) streakBadge.textContent = "5x!";
      else if (streak >= 3) streakBadge.textContent = "3x!";
      else streakBadge.textContent = "";
    }

    // Update progress bar
    const bar = document.querySelector(".game-progress-bar");
    if (bar) bar.style.width = `${(matchedPairs.size / pairs.length) * 100}%`;

    // Update score bar
    const scoreBar = document.querySelector(".game-score-bar");
    if (scoreBar) {
      scoreBar.innerHTML = `<span>✅ ${roundCorrect}</span><span>❌ ${roundWrong}</span><span>⚡ ${xpEarned} XP</span>`;
    }
  }

  function finishRound() {
    isActive = false;
    // Completion bonus
    const bonus = 50;
    xpEarned += bonus;
    State.addXP(bonus);
    State.recordTopicRound(currentTopic.id, roundCorrect, roundCorrect + roundWrong);

    const accuracy = Math.round((roundCorrect / (roundCorrect + roundWrong)) * 100);
    const streakMaintained = State.hasPlayedToday();
    const fromPathways = window.location.hash.includes('from=pathways');
    const s = State.get();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🎉</div>
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
              <span class="round-stat-value">${roundCorrect}/${roundCorrect + roundWrong}</span>
              <span class="round-stat-label">Correct</span>
            </div>
          </div>
          <div style="text-align:center;color:var(--text-muted);font-size:0.78rem;margin-top:0.5rem">
            🔥 Streak: ${s.streak} days · ⚡ XP today: ${s.xpToday || 0} · Rounds today: ${s.roundsToday || 0}
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="Game.start('${currentTopic.id}')">Play Again</button>
            ${fromPathways ? '<button class="btn btn-secondary" onclick="UI.navigate(\'#pathways\')">← Pathways</button>' : ''}
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back to Topics</button>
          </div>
        </div>
      </div>
    `);
  }

  function toggleScript(useScript) {
    State.set("showScript", useScript);
    renderGame();
  }

  // Keyboard: Escape deselects
  document.addEventListener("keydown", e => {
    if (!isActive) return;
    if (e.key === "Escape") {
      deselectAll();
    }
  });

  return { start, selectThai, selectEnglish, toggleScript, deselectAll };
})();
