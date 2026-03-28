/**
 * Flashcard mode with spaced repetition.
 * Cards marked wrong go to bucket 0 (resurface soon), correct cards advance buckets.
 * Features: swipe gestures, "on a roll" message after 5 consecutive Got It.
 */
const Flashcard = (() => {
  let topic = null;
  let deck = [];
  let currentIndex = 0;
  let flipped = false;
  let gotItCount = 0;
  let reviewCount = 0;
  let consecutiveGotIt = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function start(topicId) {
    topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;

    // Build deck with spaced repetition ordering
    deck = topic.pairs.map((p, i) => ({
      ...p,
      originalIndex: i,
      bucket: State.getFlashcardBucket(topicId, i)
    }));

    // Sort: lower bucket (harder) cards first, then shuffle within bucket
    deck.sort((a, b) => {
      if (a.bucket !== b.bucket) return a.bucket - b.bucket;
      return Math.random() - 0.5;
    });

    currentIndex = 0;
    flipped = false;
    gotItCount = 0;
    reviewCount = 0;
    consecutiveGotIt = 0;
    renderCard();
  }

  function renderCard() {
    if (currentIndex >= deck.length) {
      finishDeck();
      return;
    }

    const card = deck[currentIndex];
    const progress = (currentIndex / deck.length) * 100;
    const showScript = State.get().showScript;

    UI.render(`
      <div class="flashcard-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="UI.navigate('#dashboard')">← Back</button>
          <h2>${topic.emoji} ${topic.label}</h2>
          <span class="card-counter">${currentIndex + 1}/${deck.length}</span>
        </div>

        <div class="flashcard-progress">
          <div class="flashcard-progress-bar" style="width:${progress}%"></div>
        </div>

        <div class="script-toggle">
          <button class="btn btn-sm ${!showScript ? 'btn-active' : ''}" onclick="Flashcard.toggleScript(false)">Romanized</button>
          <button class="btn btn-sm ${showScript ? 'btn-active' : ''}" onclick="Flashcard.toggleScript(true)">Thai Script</button>
        </div>

        ${consecutiveGotIt >= 5 ? '<div class="on-a-roll">🔥 On a roll!</div>' : ''}

        <div class="flashcard-container" id="fc-container" onclick="Flashcard.flip()">
          <div class="flashcard ${flipped ? 'flipped' : ''}">
            <div class="flashcard-front">
              ${showScript ? `
                <div class="flashcard-thai-script">${card.script}</div>
                <div class="flashcard-thai-romanized sub">${card.romanized}</div>
              ` : `
                <div class="flashcard-thai-romanized">${card.romanized}</div>
                <div class="flashcard-thai-script sub">${card.script}</div>
              `}
              <div class="flashcard-hint">Tap to reveal</div>
            </div>
            <div class="flashcard-back">
              <div class="flashcard-english">${card.english}</div>
              <div class="flashcard-thai-small">${card.romanized} · ${card.script}</div>
              ${card.example ? `
                <div class="flashcard-example">
                  <div class="flashcard-example-thai">${card.example.thai}</div>
                  <div class="flashcard-example-rom">${card.example.romanized}</div>
                  <div class="flashcard-example-eng">${card.example.english}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="flashcard-swipe-hint">← Swipe left: Review &nbsp;|&nbsp; Swipe right: Got It →</div>

        <div class="flashcard-actions ${flipped ? 'visible' : ''}">
          <button class="btn btn-review" onclick="Flashcard.answer(false)">
            <span>🔄</span> Review Again
          </button>
          <button class="btn btn-gotit" onclick="Flashcard.answer(true)">
            <span>✅</span> Got It
          </button>
        </div>
      </div>
    `);

    // Attach swipe listeners
    setTimeout(attachSwipeListeners, 50);
  }

  function attachSwipeListeners() {
    const container = document.getElementById("fc-container");
    if (!container) return;

    container.addEventListener("touchstart", e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener("touchend", e => {
      if (!flipped) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) answer(true);   // swipe right = got it
        else answer(false);          // swipe left = review
      }
    }, { passive: true });
  }

  function flip() {
    if (flipped) return;
    flipped = true;
    const card = document.querySelector(".flashcard");
    if (card) card.classList.add("flipped");
    const actions = document.querySelector(".flashcard-actions");
    if (actions) actions.classList.add("visible");
  }

  function toggleScript(useScript) {
    State.set("showScript", useScript);
    renderCard();
  }

  function answer(correct) {
    const card = deck[currentIndex];

    if (correct) {
      gotItCount++;
      consecutiveGotIt++;
      State.setFlashcardBucket(topic.id, card.originalIndex, Math.min(card.bucket + 1, 5));
      State.addXP(10);
      State.checkStreak();
    } else {
      reviewCount++;
      consecutiveGotIt = 0;
      State.setFlashcardBucket(topic.id, card.originalIndex, 0);
      // Re-add to end of deck for review
      deck.push({ ...card, bucket: 0 });
    }

    currentIndex++;
    flipped = false;

    // Slide animation
    const container = document.querySelector(".flashcard-container");
    if (container) {
      container.classList.add(correct ? "slide-right" : "slide-left");
      setTimeout(() => renderCard(), 250);
    } else {
      renderCard();
    }
  }

  function finishDeck() {
    const total = gotItCount + reviewCount;
    State.recordTopicRound(topic.id, gotItCount, total);
    State.addXP(50); // completion bonus
    const streakMaintained = State.hasPlayedToday();

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">📚</div>
          <h2>Deck Complete!</h2>
          ${streakMaintained ? '<div class="streak-maintained">🔥 Streak maintained!</div>' : ''}
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${gotItCount}</span>
              <span class="round-stat-label">Got It</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${reviewCount}</span>
              <span class="round-stat-label">Review</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${(gotItCount + reviewCount) * 10 + 50}</span>
              <span class="round-stat-label">XP Earned</span>
            </div>
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="Flashcard.start('${topic.id}')">Study Again</button>
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back</button>
          </div>
        </div>
      </div>
    `);
  }

  return { start, flip, answer, toggleScript };
})();
