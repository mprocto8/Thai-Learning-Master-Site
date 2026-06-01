/**
 * Topic Detail — browse/review every item in a topic before practicing.
 */
const TopicDetail = (() => {
  function topicType(topic) {
    return topic.type || "vocabulary";
  }

  function typeLabel(type) {
    if (type === "pattern") return "Pattern";
    if (type === "situation") return "Situation";
    return "Vocabulary";
  }

  function countLabel(topic) {
    const type = topicType(topic);
    const noun = type === "pattern" ? "examples" : "items";
    return `${topic.pairs.length} ${noun}`;
  }

  function show(topicId) {
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) {
      UI.toast("Topic not found.", "info");
      UI.navigate("#library");
      return;
    }

    const type = topicType(topic);
    const mastery = State.getTopicMastery(topic.id);

    UI.render(`
      <div class="topic-detail-screen topic-detail-type-${type}">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="UI.navigate('#library')">← Library</button>
          <h2>${topic.emoji} ${topic.label}</h2>
          <span class="topic-detail-count">${topic.pairs.length}</span>
        </div>

        <div class="topic-detail-hero">
          <div class="topic-detail-title-row">
            <div class="topic-detail-emoji">${topic.emoji}</div>
            <div class="topic-detail-title-block">
              <h1>${topic.label}</h1>
              <div class="topic-detail-badges">
                <span class="topic-detail-type-badge">${typeLabel(type)}</span>
                ${topic.essential ? '<span class="essential-badge">CORE</span>' : ''}
              </div>
            </div>
          </div>
          <div class="topic-detail-stats">
            <div class="topic-detail-stat">
              <span class="topic-detail-stat-value">${countLabel(topic)}</span>
              <span class="topic-detail-stat-label">Total</span>
            </div>
            <div class="topic-detail-stat">
              <span class="topic-detail-stat-value">${Math.round(mastery * 100)}%</span>
              <span class="topic-detail-stat-label">Mastery</span>
            </div>
          </div>
          <div class="topic-detail-progress">
            <div class="topic-detail-progress-bar" style="width:${Math.round(mastery * 100)}%"></div>
          </div>
        </div>

        ${type === "pattern" && topic.frame ? renderPatternFrame(topic.frame) : ""}

        <div class="topic-detail-list" aria-label="${topic.label} review items">
          ${topic.pairs.map((pair, index) => renderPair(topic, pair, index)).join("")}
        </div>

        ${renderActions(topic)}
      </div>
    `);
  }

  function renderPatternFrame(frame) {
    return `
      <div class="topic-detail-frame">
        <div class="topic-detail-frame-label">Frame</div>
        <div class="topic-detail-frame-script">${frame.script || ""}</div>
        <div class="topic-detail-frame-romanized">${frame.romanized || ""}</div>
        <div class="topic-detail-frame-english">${frame.english || ""}</div>
        ${frame.explanation ? `<div class="topic-detail-frame-explanation">${frame.explanation}</div>` : ""}
      </div>
    `;
  }

  function renderPair(topic, pair, index) {
    return `
      <div class="topic-detail-row">
        <button class="btn btn-sm topic-detail-audio" onclick="TopicDetail.playWord('${topic.id}', ${index})" aria-label="Play ${pair.english || "item"}">🔊</button>
        <div class="topic-detail-row-main">
          <div class="topic-detail-script">${pair.script || ""}</div>
          <div class="topic-detail-romanized">${pair.romanized || ""}</div>
          <div class="topic-detail-english">${pair.english || ""}</div>
        </div>
      </div>
    `;
  }

  function renderActions(topic) {
    const type = topicType(topic);

    return `
      <div class="topic-detail-actions" aria-label="Practice modes">
        ${type === "pattern" ? `
          <button class="btn btn-primary" onclick="UI.navigate('#pattern/${topic.id}')">🧩 Pattern</button>
        ` : `
          <button class="btn btn-primary" onclick="UI.navigate('#listen/${topic.id}')">🎧 Listen</button>
        `}
        ${type === "pattern" ? `<button class="btn btn-secondary" onclick="UI.navigate('#listen/${topic.id}')">Listen</button>` : ""}
        <button class="btn btn-secondary" onclick="UI.navigate('#game/${topic.id}')">Match</button>
        <button class="btn btn-secondary" onclick="UI.navigate('#flashcard/${topic.id}')">Cards</button>
        <button class="btn btn-accent" onclick="UI.navigate('#speed/${topic.id}')">⚡ Speed</button>
        <button class="btn btn-secondary" onclick="UI.navigate('#typing/${topic.id}')">Typing</button>
      </div>
    `;
  }

  function playWord(topicId, index) {
    Audio.playWord(topicId, index);
  }

  return { show, playWord };
})();
