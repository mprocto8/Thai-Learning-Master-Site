/**
 * Speed round — 60-second timed matching blitz.
 * Respects romanized/script toggle.
 */
const Speed = (() => {
  let topic = null;
  let allPairs = [];
  let currentPair = null;
  let options = [];
  let score = 0;
  let streak = 0;
  let timeLeft = 60;
  let timer = null;
  let answered = 0;
  let correct = 0;
  let gameOver = false;
  let isActive = false;

  function start(topicId) {
    topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    allPairs = [...topic.pairs];
    score = 0;
    streak = 0;
    timeLeft = 60;
    answered = 0;
    correct = 0;
    gameOver = false;
    isActive = true;
    if (timer) clearInterval(timer);
    nextQuestion();
    startTimer();
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        timer = null;
        finishRound();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const el = document.querySelector(".speed-timer-value");
    if (el) {
      el.textContent = timeLeft;
      el.classList.toggle("urgent", timeLeft <= 10);
    }
    const bar = document.querySelector(".speed-timer-bar");
    if (bar) bar.style.width = `${(timeLeft / 60) * 100}%`;
  }

  function nextQuestion() {
    if (gameOver) return;
    currentPair = allPairs[Math.floor(Math.random() * allPairs.length)];

    // Generate 3 wrong options + 1 correct
    const wrong = allPairs
      .filter(p => p.english !== currentPair.english)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    options = [...wrong, currentPair].sort(() => Math.random() - 0.5);

    renderQuestion();
  }

  function renderQuestion() {
    const showScript = State.get().showScript;
    const best = State.getSpeedBest(topic.id);

    UI.render(`
      <div class="speed-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="Speed.quit()">← Quit</button>
          <h2>⚡ Speed Round</h2>
          <div class="speed-score">${score} pts</div>
        </div>

        <div class="speed-timer">
          <div class="speed-timer-bar" style="width:${(timeLeft / 60) * 100}%"></div>
          <span class="speed-timer-value ${timeLeft <= 10 ? 'urgent' : ''}">${timeLeft}</span>
        </div>

        <div class="speed-meta">
          <span class="speed-streak">${streak > 1 ? `🔥 ${streak}x streak` : ''}</span>
          <span class="speed-best">🏆 Best: ${best}</span>
        </div>

        <div class="script-toggle">
          <button class="btn btn-sm ${!showScript ? 'btn-active' : ''}" onclick="Speed.toggleScript(false)">Romanized</button>
          <button class="btn btn-sm ${showScript ? 'btn-active' : ''}" onclick="Speed.toggleScript(true)">Thai Script</button>
        </div>

        <div class="speed-prompt">
          <div class="speed-thai">${showScript ? currentPair.script : currentPair.romanized}</div>
          <div class="speed-thai-sub">${showScript ? currentPair.romanized : currentPair.script}</div>
        </div>

        <div class="speed-options">
          ${options.map((opt, i) => `
            <button class="btn speed-option" onclick="Speed.answer(${i})">${opt.english}</button>
          `).join("")}
        </div>
      </div>
    `);
  }

  function answer(index) {
    if (gameOver) return;
    answered++;
    const chosen = options[index];
    const btn = document.querySelectorAll(".speed-option")[index];

    if (chosen.english === currentPair.english) {
      correct++;
      streak++;
      let multiplier = 1;
      if (streak >= 10) multiplier = 3;
      else if (streak >= 5) multiplier = 2;
      else if (streak >= 3) multiplier = 1.5;
      const points = Math.round(10 * multiplier);
      score += points;

      btn.classList.add("correct");
      UI.showXP(points, btn.getBoundingClientRect().right - 20, btn.getBoundingClientRect().top);
    } else {
      streak = 0;
      btn.classList.add("wrong");
      // Highlight correct
      document.querySelectorAll(".speed-option").forEach(b => {
        if (b.textContent.trim() === currentPair.english) b.classList.add("correct");
      });
    }

    setTimeout(() => nextQuestion(), 350);
  }

  function toggleScript(useScript) {
    State.set("showScript", useScript);
    renderQuestion();
  }

  function finishRound() {
    gameOver = true;
    isActive = false;
    State.setSpeedBest(topic.id, score);
    State.addXP(score);
    State.checkStreak();
    State.recordTopicRound(topic.id, correct, answered);
    const best = State.getSpeedBest(topic.id);
    const isNewBest = score >= best;
    const streakMaintained = State.hasPlayedToday();
    const fromPathways = window.location.hash.includes('from=pathways');
    const s = State.get();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">⚡</div>
          <h2>Time's Up!</h2>
          ${isNewBest ? '<div class="new-best">🏆 New Personal Best!</div>' : ''}
          ${streakMaintained ? '<div class="streak-maintained">🔥 Streak maintained!</div>' : ''}
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${score}</span>
              <span class="round-stat-label">Score</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${correct}/${answered}</span>
              <span class="round-stat-label">Correct</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${best}</span>
              <span class="round-stat-label">Best</span>
            </div>
          </div>
          <div style="text-align:center;color:var(--text-muted);font-size:0.78rem;margin-top:0.5rem">
            🔥 Streak: ${s.streak} days · ⚡ XP today: ${s.xpToday || 0} · Rounds today: ${s.roundsToday || 0}
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="Speed.start('${topic.id}')">Play Again</button>
            ${fromPathways ? '<button class="btn btn-secondary" onclick="UI.navigate(\'#pathways\')">← Pathways</button>' : ''}
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back</button>
          </div>
        </div>
      </div>
    `);
  }

  function quit() {
    gameOver = true;
    isActive = false;
    if (timer) clearInterval(timer);
    timer = null;
    UI.navigate("#dashboard");
  }

  // Keyboard: 1-4 select answer options
  document.addEventListener("keydown", e => {
    if (!isActive || gameOver) return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 4) {
      const btns = document.querySelectorAll(".speed-option");
      if (btns.length >= num && !btns[num - 1].disabled) {
        answer(num - 1);
      }
    }
  });

  return { start, answer, quit, toggleScript };
})();
