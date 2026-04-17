/**
 * Practice Hub — compact topic list with tap-to-expand actions.
 * Quick 5 feature: random 5-word speed round from any topic.
 */
const PracticeHub = (() => {
  let expandedTopic = null;

  function show() {
    renderHub();
  }

  function renderHub() {
    const s = State.get();
    const showScript = s.showScript;

    // Group topics by category
    const situationTopics = TOPICS.filter(t => t.situation);
    const essentialTopics = TOPICS.filter(t => t.essential);
    const regularTopics = TOPICS.filter(t => !t.situation && !t.essential);

    UI.render(`
      <div class="practice-screen">
        ${UI.navBar("practice")}

        <div class="section-header">
          <h1>⚡ Practice</h1>
          <p>Choose a topic and start learning</p>
        </div>

        <div class="practice-quick-actions">
          <button class="btn btn-primary btn-lg practice-quick5" onclick="PracticeHub.quick5()">
            🎲 Quick 5 — Random Words
          </button>
        </div>

        <div class="script-toggle">
          <button class="btn btn-sm ${!showScript ? 'btn-active' : ''}" onclick="PracticeHub.setDisplay(false)">Romanized</button>
          <button class="btn btn-sm ${showScript ? 'btn-active' : ''}" onclick="PracticeHub.setDisplay(true)">Thai Script</button>
        </div>

        <div class="practice-tools">
          <div class="practice-tool-card" onclick="UI.navigate('#sentences')">
            <span class="practice-tool-icon">📝</span>
            <div><strong>Sentence Builder</strong><span class="practice-tool-sub">Arrange words into sentences</span></div>
          </div>
          <div class="practice-tool-card" onclick="UI.navigate('#tones')">
            <span class="practice-tool-icon">🎵</span>
            <div><strong>Tone Trainer</strong><span class="practice-tool-sub">Master the 5 Thai tones</span></div>
          </div>
          <div class="practice-tool-card" onclick="UI.navigate('#clock')">
            <span class="practice-tool-icon">🕐</span>
            <div><strong>Thai Clock</strong><span class="practice-tool-sub">Tell time in Thai</span></div>
          </div>
          <div class="practice-tool-card" onclick="UI.navigate('#time-game')">
            <span class="practice-tool-icon">🎮</span>
            <div><strong>Time Game</strong><span class="practice-tool-sub">Practice telling time</span></div>
          </div>
        </div>

        ${essentialTopics.length > 0 ? `
          <h2 class="section-title practice-section-title">Essential</h2>
          <div class="practice-topic-list">
            ${essentialTopics.map(t => renderTopicRow(t, s)).join("")}
          </div>
        ` : ''}

        <h2 class="section-title practice-section-title">Vocabulary</h2>
        <div class="practice-topic-list">
          ${regularTopics.map(t => renderTopicRow(t, s)).join("")}
        </div>

        ${situationTopics.length > 0 ? `
          <h2 class="section-title practice-section-title">Situations</h2>
          <div class="practice-topic-list">
            ${situationTopics.map(t => renderTopicRow(t, s)).join("")}
          </div>
        ` : ''}
      </div>
    `);
  }

  function renderTopicRow(t, s) {
    const mastery = State.getTopicMastery(t.id);
    const ts = s.topicStats[t.id];
    const isExpanded = expandedTopic === t.id;

    return `
      <div class="practice-topic ${isExpanded ? 'expanded' : ''}">
        <div class="practice-topic-header" onclick="PracticeHub.toggleTopic('${t.id}')">
          <span class="practice-topic-emoji">${t.emoji}</span>
          <div class="practice-topic-info">
            <span class="practice-topic-name">${t.label}</span>
            <span class="practice-topic-meta">${t.pairs.length} words · ${Math.round(mastery * 100)}%</span>
          </div>
          <div class="practice-topic-ring">${UI.progressRing(mastery, 32, 3)}</div>
        </div>
        ${isExpanded ? `
          <div class="practice-topic-actions">
            <button class="btn btn-lg practice-listen-primary" onclick="UI.navigate('#listen/${t.id}')">
              🎧 Listen &amp; Choose
              <span class="recommended-pill">RECOMMENDED</span>
            </button>
            <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
            <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">⚡ Speed</button>
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#typing/${t.id}')">⌨️ Typing</button>
          </div>
          ${ts ? `<div class="practice-topic-last">Last played: ${UI.timeAgo(ts.lastPlayed)}</div>` : ''}
        ` : ''}
      </div>
    `;
  }

  function toggleTopic(topicId) {
    expandedTopic = expandedTopic === topicId ? null : topicId;
    renderHub();
  }

  function setDisplay(useScript) {
    State.set("showScript", useScript);
    renderHub();
  }

  function quick5() {
    // Pick a random topic and navigate to speed route
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    UI.navigate('#speed/' + randomTopic.id);
  }

  return { show, toggleTopic, setDisplay, quick5 };
})();
