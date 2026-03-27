/**
 * Thai alphabet learning section — browse + quiz modes.
 */
const Alphabet = (() => {
  let mode = "browse"; // "browse" | "quiz"
  let filterClass = "all"; // "all" | "high" | "mid" | "low"
  let charType = "consonants"; // "consonants" | "vowels" | "tones"
  let quizQueue = [];
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizTotal = 0;
  let currentQuestion = null;
  let quizOptions = [];

  function show() {
    mode = "browse";
    renderBrowse();
  }

  function renderBrowse() {
    let chars = [];
    let title = "";

    if (charType === "consonants") {
      chars = filterClass === "all"
        ? THAI_CONSONANTS
        : THAI_CONSONANTS.filter(c => c.class === filterClass);
      title = "Thai Consonants";
    } else if (charType === "vowels") {
      chars = THAI_VOWELS;
      title = "Thai Vowels";
    } else {
      chars = THAI_TONE_MARKS;
      title = "Tone Marks";
    }

    const stats = State.get().alphabetStats;

    UI.render(`
      <div class="alphabet-screen">
        ${UI.navBar("alphabet")}

        <div class="section-header">
          <h1>ก Thai Script</h1>
          <p>Learn the building blocks of written Thai</p>
        </div>

        <div class="alpha-tabs">
          <button class="btn btn-sm ${charType === 'consonants' ? 'btn-active' : ''}" onclick="Alphabet.setType('consonants')">Consonants (44)</button>
          <button class="btn btn-sm ${charType === 'vowels' ? 'btn-active' : ''}" onclick="Alphabet.setType('vowels')">Vowels (${THAI_VOWELS.length})</button>
          <button class="btn btn-sm ${charType === 'tones' ? 'btn-active' : ''}" onclick="Alphabet.setType('tones')">Tones (4)</button>
        </div>

        ${charType === "consonants" ? `
          <div class="class-filter">
            <button class="btn btn-xs ${filterClass === 'all' ? 'btn-active' : ''}" onclick="Alphabet.setFilter('all')">All</button>
            <button class="btn btn-xs filter-high ${filterClass === 'high' ? 'btn-active' : ''}" onclick="Alphabet.setFilter('high')">High (11)</button>
            <button class="btn btn-xs filter-mid ${filterClass === 'mid' ? 'btn-active' : ''}" onclick="Alphabet.setFilter('mid')">Mid (9)</button>
            <button class="btn btn-xs filter-low ${filterClass === 'low' ? 'btn-active' : ''}" onclick="Alphabet.setFilter('low')">Low (24)</button>
          </div>
        ` : ''}

        <div class="alpha-mode-toggle">
          <button class="btn btn-primary" onclick="Alphabet.startQuiz()">🧠 Start Quiz</button>
        </div>

        <div class="alpha-grid">
          ${chars.map(c => {
            const s = stats[c.char];
            const mastery = s ? Math.round((s.correct / Math.max(s.seen, 1)) * 100) : 0;
            return `
              <div class="alpha-card ${c.class || ''}">
                <div class="alpha-char">${c.char}</div>
                <div class="alpha-sound">${c.romanized}</div>
                ${c.class ? `<span class="alpha-class class-${c.class}">${c.class}</span>` : ''}
                <div class="alpha-example">${c.example || c.note || ''}</div>
                <div class="alpha-mnemonic">${c.mnemonic || ''}</div>
                ${s ? `<div class="alpha-mastery">${mastery}% mastered</div>` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `);
  }

  function setType(type) {
    charType = type;
    filterClass = "all";
    renderBrowse();
  }

  function setFilter(cls) {
    filterClass = cls;
    renderBrowse();
  }

  function startQuiz() {
    mode = "quiz";
    quizIndex = 0;
    quizCorrect = 0;
    quizTotal = 0;

    // Build quiz from current selection
    let chars;
    if (charType === "consonants") {
      chars = filterClass === "all"
        ? [...THAI_CONSONANTS]
        : THAI_CONSONANTS.filter(c => c.class === filterClass);
    } else if (charType === "vowels") {
      chars = [...THAI_VOWELS];
    } else {
      chars = [...THAI_TONE_MARKS];
    }

    quizQueue = chars.sort(() => Math.random() - 0.5).slice(0, Math.min(chars.length, 15));
    nextQuizQuestion();
  }

  function nextQuizQuestion() {
    if (quizIndex >= quizQueue.length) {
      finishQuiz();
      return;
    }

    currentQuestion = quizQueue[quizIndex];

    // Pool for wrong answers
    let pool;
    if (charType === "consonants") pool = THAI_CONSONANTS;
    else if (charType === "vowels") pool = THAI_VOWELS;
    else pool = THAI_TONE_MARKS;

    const wrong = pool
      .filter(c => c.romanized !== currentQuestion.romanized)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    quizOptions = [...wrong.map(c => c.romanized), currentQuestion.romanized]
      .sort(() => Math.random() - 0.5);

    renderQuiz();
  }

  function renderQuiz() {
    UI.render(`
      <div class="quiz-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="Alphabet.show()">← Back</button>
          <h2>🧠 Recognition Quiz</h2>
          <span class="card-counter">${quizIndex + 1}/${quizQueue.length}</span>
        </div>

        <div class="flashcard-progress">
          <div class="flashcard-progress-bar" style="width:${(quizIndex / quizQueue.length) * 100}%"></div>
        </div>

        <div class="quiz-char-display">
          <div class="quiz-char">${currentQuestion.char}</div>
          ${currentQuestion.class ? `<span class="alpha-class class-${currentQuestion.class}">${currentQuestion.class} class</span>` : ''}
        </div>

        <p class="quiz-prompt">What sound does this character make?</p>

        <div class="quiz-options">
          ${quizOptions.map((opt, i) => `
            <button class="btn quiz-option" onclick="Alphabet.quizAnswer(${i})">${opt}</button>
          `).join("")}
        </div>

        <div class="game-score-bar">
          <span>✅ ${quizCorrect}</span>
          <span>❌ ${quizTotal - quizCorrect}</span>
        </div>
      </div>
    `);
  }

  function quizAnswer(index) {
    const chosen = quizOptions[index];
    const btn = document.querySelectorAll(".quiz-option")[index];
    quizTotal++;

    if (chosen === currentQuestion.romanized) {
      quizCorrect++;
      btn.classList.add("correct");
      State.recordAlphabetAnswer(currentQuestion.char, true);
      State.addXP(10);
      State.checkStreak();
    } else {
      btn.classList.add("wrong");
      State.recordAlphabetAnswer(currentQuestion.char, false);
      // Highlight correct
      document.querySelectorAll(".quiz-option").forEach(b => {
        if (b.textContent.trim() === currentQuestion.romanized) b.classList.add("correct");
      });
      // Re-add to end of queue
      quizQueue.push(currentQuestion);
    }

    // Disable all buttons
    document.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);

    setTimeout(() => {
      quizIndex++;
      nextQuizQuestion();
    }, 600);
  }

  function finishQuiz() {
    State.addXP(50);
    const accuracy = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🧠</div>
          <h2>Quiz Complete!</h2>
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${accuracy}%</span>
              <span class="round-stat-label">Accuracy</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${quizCorrect}/${quizTotal}</span>
              <span class="round-stat-label">Correct</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${quizCorrect * 10 + 50}</span>
              <span class="round-stat-label">XP Earned</span>
            </div>
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="Alphabet.startQuiz()">Quiz Again</button>
            <button class="btn btn-secondary" onclick="Alphabet.show()">Browse Characters</button>
          </div>
        </div>
      </div>
    `);
  }

  return { show, setType, setFilter, startQuiz, quizAnswer };
})();
