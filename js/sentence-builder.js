/**
 * Sentence Builder — arrange Thai word cards in correct order.
 * Unlocks after any required topic reaches 60% mastery.
 * Tap-to-place on mobile, click-to-select on desktop.
 */
const SentenceBuilder = (() => {
  let availableSentences = [];
  let currentSentence = null;
  let shuffledWords = [];
  let placedWords = [];
  let selectedIndex = null; // index in shuffled words (source)
  let score = 0;
  let roundIndex = 0;
  let roundCorrect = 0;
  let roundTotal = 0;
  let roundSentences = [];

  function show() {
    // Determine which sentences are available based on topic mastery
    availableSentences = SENTENCES.filter(s => {
      return s.requiredTopics.some(topicId => State.getTopicMastery(topicId) >= 0.6);
    });

    const locked = SENTENCES.filter(s => !availableSentences.includes(s));

    UI.render(`
      <div class="sentence-screen">
        ${UI.navBar("sentences")}

        <div class="section-header">
          <h1>📝 Sentence Builder</h1>
          <p>Arrange words into correct Thai sentences</p>
        </div>

        ${availableSentences.length > 0 ? `
          <div class="sentence-start-card">
            <p>${availableSentences.length} sentences available</p>
            <button class="btn btn-primary btn-lg" onclick="SentenceBuilder.startRound()">Start Practice</button>
          </div>
        ` : `
          <div class="sentence-locked-card">
            <div class="locked-icon">🔒</div>
            <h3>Unlock Sentence Builder</h3>
            <p>Master any vocabulary topic to 60% to unlock sentences using those words.</p>
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Go Practice Vocabulary</button>
          </div>
        `}

        ${locked.length > 0 && availableSentences.length > 0 ? `
          <div class="sentence-locked-preview">
            <h3>🔒 ${locked.length} more to unlock</h3>
            <p>Keep mastering topics to unlock more sentences</p>
          </div>
        ` : ''}
      </div>
    `);
  }

  function startRound() {
    roundIndex = 0;
    roundCorrect = 0;
    roundTotal = 0;
    score = 0;
    // Pick up to 8 random sentences
    roundSentences = [...availableSentences].sort(() => Math.random() - 0.5).slice(0, Math.min(8, availableSentences.length));
    nextSentence();
  }

  function nextSentence() {
    if (roundIndex >= roundSentences.length) {
      finishRound();
      return;
    }

    currentSentence = roundSentences[roundIndex];
    // Shuffle words — use indices to handle duplicate words
    shuffledWords = currentSentence.words.map((w, i) => ({ word: w, origIdx: i, placed: false }));
    shuffledWords.sort(() => Math.random() - 0.5);
    placedWords = [];
    selectedIndex = null;
    renderSentence();
  }

  function renderSentence() {
    const slots = currentSentence.words.length;

    UI.render(`
      <div class="sb-active">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="SentenceBuilder.show()">← Back</button>
          <h2>📝 Build</h2>
          <span class="card-counter">${roundIndex + 1}/${roundSentences.length}</span>
        </div>

        <div class="flashcard-progress">
          <div class="flashcard-progress-bar" style="width:${(roundIndex / roundSentences.length) * 100}%"></div>
        </div>

        <div class="sb-prompt">
          <div class="sb-english">${currentSentence.english}</div>
          <div class="sb-romanized">${currentSentence.romanized}</div>
        </div>

        <div class="sb-answer-slots" id="sb-slots">
          ${[...Array(slots)].map((_, i) => {
            const placed = placedWords[i];
            return `
              <div class="sb-slot ${placed ? 'filled' : ''}" data-slot="${i}" onclick="SentenceBuilder.removeFromSlot(${i})">
                ${placed ? `<span class="sb-slot-word">${placed.word}</span>` : `<span class="sb-slot-placeholder">${i + 1}</span>`}
              </div>
            `;
          }).join("")}
        </div>

        <div class="sb-word-bank" id="sb-bank">
          ${shuffledWords.map((w, i) => `
            <button class="btn sb-word ${w.placed ? 'used' : ''} ${selectedIndex === i ? 'selected' : ''}"
              data-idx="${i}" ${w.placed ? 'disabled' : ''}
              onclick="SentenceBuilder.selectWord(${i})">
              ${w.word}
            </button>
          `).join("")}
        </div>

        <div class="sb-actions">
          <button class="btn btn-secondary" onclick="SentenceBuilder.resetSentence()">🔄 Reset</button>
          <button class="btn btn-primary" onclick="SentenceBuilder.checkAnswer()" ${placedWords.length < slots ? 'disabled' : ''} id="sb-check">
            Check ✓
          </button>
        </div>

        <div class="game-score-bar">
          <span>✅ ${roundCorrect}</span>
          <span>❌ ${roundTotal - roundCorrect}</span>
          <span>⚡ ${score} XP</span>
        </div>
      </div>
    `);
  }

  function selectWord(idx) {
    if (shuffledWords[idx].placed) return;

    // Place in next empty slot
    const nextSlot = placedWords.length;
    if (nextSlot >= currentSentence.words.length) return;

    shuffledWords[idx].placed = true;
    placedWords.push(shuffledWords[idx]);
    selectedIndex = null;
    renderSentence();
  }

  function removeFromSlot(slotIdx) {
    if (slotIdx >= placedWords.length) return;
    const removed = placedWords.splice(slotIdx, 1)[0];
    if (removed) {
      // Find it in shuffledWords and unmark
      const orig = shuffledWords.find(w => w.origIdx === removed.origIdx && w.placed);
      if (orig) orig.placed = false;
    }
    renderSentence();
  }

  function resetSentence() {
    shuffledWords.forEach(w => w.placed = false);
    placedWords = [];
    selectedIndex = null;
    renderSentence();
  }

  function checkAnswer() {
    if (placedWords.length < currentSentence.words.length) return;

    roundTotal++;
    const userOrder = placedWords.map(w => w.word);
    const correctOrder = currentSentence.words;
    const isCorrect = userOrder.every((w, i) => w === correctOrder[i]);

    if (isCorrect) {
      roundCorrect++;
      score += 15;
      State.addXP(15);
      State.checkStreak();

      // Animate success
      document.querySelectorAll(".sb-slot").forEach(s => s.classList.add("correct"));

      setTimeout(() => {
        roundIndex++;
        nextSentence();
      }, 800);
    } else {
      // Highlight wrong positions
      document.querySelectorAll(".sb-slot").forEach((slot, i) => {
        if (placedWords[i] && placedWords[i].word !== correctOrder[i]) {
          slot.classList.add("wrong");
        } else if (placedWords[i]) {
          slot.classList.add("correct");
        }
      });

      UI.toast("Not quite — try again!", "info");

      // Allow retry after brief delay
      setTimeout(() => {
        document.querySelectorAll(".sb-slot").forEach(s => {
          s.classList.remove("wrong", "correct");
        });
      }, 1200);
    }
  }

  function finishRound() {
    State.addXP(50);
    const accuracy = roundTotal > 0 ? Math.round((roundCorrect / roundTotal) * 100) : 0;

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">📝</div>
          <h2>Sentences Complete!</h2>
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${accuracy}%</span>
              <span class="round-stat-label">Accuracy</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${roundCorrect}/${roundSentences.length}</span>
              <span class="round-stat-label">Correct</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${score + 50}</span>
              <span class="round-stat-label">XP Earned</span>
            </div>
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="SentenceBuilder.startRound()">Play Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Dashboard</button>
          </div>
        </div>
      </div>
    `);
  }

  return { show, startRound, selectWord, removeFromSlot, resetSentence, checkAnswer };
})();
