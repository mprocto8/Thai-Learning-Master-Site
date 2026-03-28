/**
 * Flashcard mode with spaced repetition.
 * Cards marked wrong go to bucket 0 (resurface soon), correct cards advance buckets.
 */
const Flashcard = (() => {
  let topic = null;
  let deck = [];
  let currentIndex = 0;
  let flipped = false;
  let gotItCount = 0;
  let reviewCount = 0;

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
    renderCard();
  }

  function renderCard() {
    if (currentIndex >= deck.length) {
      finishDeck();
      return;
    }

    const card = deck[currentIndex];
    const progress = (currentIndex / deck.length) * 100;

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

        <div class="flashcard-container" onclick="Flashcard.flip()">
          <div class="flashcard ${flipped ? 'flipped' : ''}">
            <div class="flashcard-front">
              <div class="flashcard-thai-romanized">${card.romanized}</div>
              <div class="flashcard-thai-script">${card.script}</div>
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
  }

  function flip() {
    if (flipped) return;
    flipped = true;
    const card = document.querySelector(".flashcard");
    if (card) card.classList.add("flipped");
    const actions = document.querySelector(".flashcard-actions");
    if (actions) actions.classList.add("visible");
  }

  function answer(correct) {
    const card = deck[currentIndex];

    if (correct) {
      gotItCount++;
      State.setFlashcardBucket(topic.id, card.originalIndex, Math.min(card.bucket + 1, 5));
      State.addXP(10);
      State.checkStreak();
    } else {
      reviewCount++;
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

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">📚</div>
          <h2>Deck Complete!</h2>
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
            <button class="btn btn-secondary" onclick="UI.navigate('#dashboard')">Back to Topics</button>
          </div>
        </div>
      </div>
    `);
  }

  return { start, flip, answer };
})();
