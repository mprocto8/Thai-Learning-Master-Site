/**
 * Tell-the-time game — practice reading Thai time expressions.
 * Two difficulties: Easy (formal, whole/half hours) and Hard (colloquial, 5-min increments).
 * Display toggle: Thai script or romanized.
 */
const TimeGame = (() => {
  let difficulty = "easy"; // "easy" | "hard"
  let displayMode = "thai"; // "thai" | "romanized"
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let streak = 0;
  let correct = 0;
  let timer = null;
  let timeLeft = 15;
  let answered = false;

  function show() {
    UI.render(`
      <div class="time-game-screen">
        ${UI.navBar("clock")}

        <div class="section-header">
          <h1>🎮 Tell the Time</h1>
          <p>Read the clock and pick the correct Thai time</p>
        </div>

        <div class="difficulty-select">
          <button class="btn ${difficulty === 'easy' ? 'btn-active' : 'btn-secondary'}" onclick="TimeGame.setDifficulty('easy')">
            🟢 Easy<br><small>Formal · whole hours</small>
          </button>
          <button class="btn ${difficulty === 'hard' ? 'btn-active' : 'btn-secondary'}" onclick="TimeGame.setDifficulty('hard')">
            🔴 Hard<br><small>Colloquial · 5-min</small>
          </button>
        </div>

        <div class="script-toggle" style="margin-bottom:var(--sp-4);">
          <button class="btn btn-sm ${displayMode === 'thai' ? 'btn-active' : ''}" onclick="TimeGame.setDisplay('thai')">Thai Script</button>
          <button class="btn btn-sm ${displayMode === 'romanized' ? 'btn-active' : ''}" onclick="TimeGame.setDisplay('romanized')">Romanized</button>
        </div>

        <button class="btn btn-primary btn-lg" onclick="TimeGame.startRound()" style="margin:var(--sp-6) auto;display:block;">
          Start Round (10 questions)
        </button>
      </div>
    `);
  }

  function setDifficulty(d) {
    difficulty = d;
    show();
  }

  function setDisplay(mode) {
    displayMode = mode;
    // If mid-game, re-render current question with new display mode
    if (questions.length > 0 && currentIndex < questions.length && !answered) {
      showQuestion();
    } else {
      show();
    }
  }

  function startRound() {
    questions = generateQuestions(10);
    currentIndex = 0;
    score = 0;
    streak = 0;
    correct = 0;
    answered = false;
    showQuestion();
  }

  function generateQuestions(count) {
    const qs = [];
    for (let i = 0; i < count; i++) {
      let hour, minute;
      if (difficulty === "easy") {
        hour = Math.floor(Math.random() * 24);
        minute = Math.random() < 0.5 ? 0 : 30;
      } else {
        hour = Math.floor(Math.random() * 24);
        minute = Math.floor(Math.random() * 12) * 5;
      }
      qs.push({ hour, minute });
    }
    return qs;
  }

  function showQuestion() {
    if (currentIndex >= questions.length) {
      finishRound();
      return;
    }

    answered = false;
    timeLeft = 15;
    const q = questions[currentIndex];
    const correctAnswer = difficulty === "easy"
      ? ThaiTime.formal(q.hour, q.minute)
      : ThaiTime.colloquial(q.hour, q.minute);

    // Generate 3 wrong options — store both thai and rom for each
    const optionObjects = [{ thai: correctAnswer.thai, rom: correctAnswer.rom, isCorrect: true }];
    const usedTimes = new Set([`${q.hour}:${q.minute}`]);

    while (optionObjects.length < 4) {
      let rh = Math.floor(Math.random() * 24);
      let rm = difficulty === "easy"
        ? (Math.random() < 0.5 ? 0 : 30)
        : Math.floor(Math.random() * 12) * 5;
      const key = `${rh}:${rm}`;
      if (usedTimes.has(key)) continue;
      usedTimes.add(key);
      const wrong = difficulty === "easy"
        ? ThaiTime.formal(rh, rm)
        : ThaiTime.colloquial(rh, rm);
      if (!optionObjects.some(o => o.thai === wrong.thai)) {
        optionObjects.push({ thai: wrong.thai, rom: wrong.rom, isCorrect: false });
      }
    }

    // Shuffle options
    const shuffled = optionObjects.sort(() => Math.random() - 0.5);

    // Draw clock face for this time
    const hourAngle = ((q.hour % 12) + q.minute / 60) * 30;
    const minAngle = q.minute * 6;

    UI.render(`
      <div class="time-game-active">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="TimeGame.show()">← Back</button>
          <h2>Q${currentIndex + 1}/10</h2>
          <div class="speed-score">${score} pts</div>
        </div>

        <div class="tg-timer">
          <div class="tg-timer-bar" id="tg-timer-bar" style="width:100%"></div>
          <span class="tg-timer-value" id="tg-timer-value">${timeLeft}</span>
        </div>

        <div class="tg-streak">${streak > 1 ? `🔥 ${streak}x streak` : ''}</div>

        <div class="tg-clock-mini">
          <svg viewBox="0 0 120 120" class="tg-clock-svg">
            <circle cx="60" cy="60" r="55" fill="var(--bg-1)" stroke="var(--surface-2)" stroke-width="2"/>
            ${[...Array(12)].map((_, i) => {
              const a = (i * 30) * Math.PI / 180;
              const x1 = 60 + 46 * Math.sin(a), y1 = 60 - 46 * Math.cos(a);
              const x2 = 60 + (i % 3 === 0 ? 38 : 42) * Math.sin(a), y2 = 60 - (i % 3 === 0 ? 38 : 42) * Math.cos(a);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--text-2)" stroke-width="${i%3===0?2:1}" stroke-linecap="round"/>`;
            }).join("")}
            ${[...Array(12)].map((_, i) => {
              const num = i === 0 ? 12 : i;
              const a = (i * 30) * Math.PI / 180;
              const x = 60 + 32 * Math.sin(a), y = 60 - 32 * Math.cos(a) + 3;
              return `<text x="${x}" y="${y}" text-anchor="middle" fill="var(--text-1)" font-size="8" font-weight="600">${num}</text>`;
            }).join("")}
            <line x1="60" y1="60" x2="${60 + 22 * Math.sin(hourAngle * Math.PI / 180)}" y2="${60 - 22 * Math.cos(hourAngle * Math.PI / 180)}" stroke="var(--text-0)" stroke-width="3" stroke-linecap="round"/>
            <line x1="60" y1="60" x2="${60 + 34 * Math.sin(minAngle * Math.PI / 180)}" y2="${60 - 34 * Math.cos(minAngle * Math.PI / 180)}" stroke="var(--text-0)" stroke-width="2" stroke-linecap="round"/>
            <circle cx="60" cy="60" r="2.5" fill="var(--accent)"/>
          </svg>
          <div class="tg-clock-digital">${q.hour.toString().padStart(2,"0")}:${q.minute.toString().padStart(2,"0")}</div>
        </div>

        <p class="tg-prompt">How do you say this time in Thai?</p>
        <p class="tg-system-label">${difficulty === "easy" ? "Formal 24-hour system" : "Colloquial 6-period system"}</p>

        <div class="script-toggle" style="margin-bottom:var(--sp-3);">
          <button class="btn btn-sm ${displayMode === 'thai' ? 'btn-active' : ''}" onclick="TimeGame.setDisplay('thai')">Thai Script</button>
          <button class="btn btn-sm ${displayMode === 'romanized' ? 'btn-active' : ''}" onclick="TimeGame.setDisplay('romanized')">Romanized</button>
        </div>

        <div class="tg-options" id="tg-options">
          ${shuffled.map((opt) => `
            <button class="btn tg-option" data-answer="${opt.isCorrect ? 'correct' : 'wrong'}" data-thai="${opt.thai}" data-rom="${opt.rom}" onclick="TimeGame.answer(this, ${opt.isCorrect})">${displayMode === 'romanized' ? opt.rom : opt.thai}</button>
          `).join("")}
        </div>

        <div class="tg-breakdown" id="tg-breakdown" style="display:none;">
          <!-- filled after answer -->
        </div>
      </div>
    `);

    startTimer();
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (answered) return;
      timeLeft--;
      const bar = document.getElementById("tg-timer-bar");
      const val = document.getElementById("tg-timer-value");
      if (bar) bar.style.width = `${(timeLeft / 15) * 100}%`;
      if (val) {
        val.textContent = timeLeft;
        val.classList.toggle("urgent", timeLeft <= 5);
      }
      if (timeLeft <= 0) {
        clearInterval(timer);
        timeOut();
      }
    }, 1000);
  }

  function answer(btn, isCorrect) {
    if (answered) return;
    answered = true;
    clearInterval(timer);

    const q = questions[currentIndex];
    const formalTime = ThaiTime.formal(q.hour, q.minute);
    const colloqTime = ThaiTime.colloquial(q.hour, q.minute);

    // Highlight all buttons
    document.querySelectorAll(".tg-option").forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === "correct") b.classList.add("correct");
    });

    if (isCorrect) {
      correct++;
      streak++;
      let mult = 1;
      if (streak >= 5) mult = 2;
      else if (streak >= 3) mult = 1.5;
      const points = Math.round(10 * mult);
      score += points;
      btn.classList.add("correct");
      State.addXP(points);
      State.checkStreak();
    } else {
      streak = 0;
      btn.classList.add("wrong");
    }

    // Show breakdown
    const breakdown = document.getElementById("tg-breakdown");
    if (breakdown) {
      breakdown.style.display = "block";
      breakdown.innerHTML = `
        <div class="tg-breakdown-card">
          <h4>Time Breakdown</h4>
          <div class="tg-bd-row">
            <span class="tg-bd-label">Formal</span>
            <span class="tg-bd-thai">${formalTime.thai}</span>
            <span class="tg-bd-rom">${formalTime.rom}</span>
          </div>
          <div class="tg-bd-row">
            <span class="tg-bd-label">Colloquial</span>
            <span class="tg-bd-thai">${colloqTime.thai}</span>
            <span class="tg-bd-rom">${colloqTime.rom}</span>
          </div>
          <button class="btn btn-primary" onclick="TimeGame.next()" style="margin-top:var(--sp-3);width:100%;">
            ${currentIndex < questions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        </div>
      `;
    }
  }

  function timeOut() {
    // Treat as wrong
    answered = true;
    streak = 0;
    document.querySelectorAll(".tg-option").forEach(b => {
      b.disabled = true;
      if (b.dataset.answer === "correct") b.classList.add("correct");
    });

    const q = questions[currentIndex];
    const formalTime = ThaiTime.formal(q.hour, q.minute);
    const colloqTime = ThaiTime.colloquial(q.hour, q.minute);

    const breakdown = document.getElementById("tg-breakdown");
    if (breakdown) {
      breakdown.style.display = "block";
      breakdown.innerHTML = `
        <div class="tg-breakdown-card">
          <h4>⏰ Time's up!</h4>
          <div class="tg-bd-row">
            <span class="tg-bd-label">Formal</span>
            <span class="tg-bd-thai">${formalTime.thai}</span>
            <span class="tg-bd-rom">${formalTime.rom}</span>
          </div>
          <div class="tg-bd-row">
            <span class="tg-bd-label">Colloquial</span>
            <span class="tg-bd-thai">${colloqTime.thai}</span>
            <span class="tg-bd-rom">${colloqTime.rom}</span>
          </div>
          <button class="btn btn-primary" onclick="TimeGame.next()" style="margin-top:var(--sp-3);width:100%;">
            ${currentIndex < questions.length - 1 ? 'Next →' : 'See Results'}
          </button>
        </div>
      `;
    }
  }

  function next() {
    currentIndex++;
    showQuestion();
  }

  function finishRound() {
    if (timer) clearInterval(timer);
    const bonus = 50;
    State.addXP(bonus);
    const total = questions.length;
    const accuracy = Math.round((correct / total) * 100);

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🕐</div>
          <h2>Time Round Complete!</h2>
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${accuracy}%</span>
              <span class="round-stat-label">Accuracy</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${score}</span>
              <span class="round-stat-label">Score</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${correct}/${total}</span>
              <span class="round-stat-label">Correct</span>
            </div>
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="TimeGame.startRound()">Play Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#clock')">Back to Clock</button>
          </div>
        </div>
      </div>
    `);
  }

  return { show, setDifficulty, setDisplay, startRound, answer, next };
})();
