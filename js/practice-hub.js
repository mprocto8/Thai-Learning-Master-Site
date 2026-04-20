/**
 * Practice Hub — compact topic list with tap-to-expand actions.
 * Quick 5 feature: random 5-word speed round from any topic.
 */
const PracticeHub = (() => {
  let expandedTopic = null;
  // Section collapse state — persisted in-memory across re-renders of this
  // screen. Intentionally not saved to State; cheap UI state.
  const sectionCollapsed = { vocabulary: false, patterns: false, situations: false };

  function show() {
    renderHub();
  }

  function topicType(t) {
    return t.type || "vocabulary";
  }

  function renderHub() {
    const s = State.get();
    const showScript = s.showScript;

    // Group topics by type. Essential topics stay inside Vocabulary but are
    // sorted to the top so they surface first.
    const vocabularyTopics = TOPICS
      .filter(t => topicType(t) === "vocabulary")
      .sort((a, b) => (b.essential ? 1 : 0) - (a.essential ? 1 : 0));
    const patternTopics = TOPICS.filter(t => topicType(t) === "pattern");
    const situationTopics = TOPICS.filter(t => topicType(t) === "situation");

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

        ${renderSection("vocabulary", "Vocabulary", vocabularyTopics, s)}
        ${patternTopics.length > 0 ? renderSection("patterns", "Patterns", patternTopics, s) : ""}
        ${situationTopics.length > 0 ? renderSection("situations", "Situations", situationTopics, s) : ""}
      </div>
    `);
  }

  function renderSection(key, label, topics, s) {
    const collapsed = !!sectionCollapsed[key];
    return `
      <div class="practice-section" data-section="${key}">
        <h2 class="section-title practice-section-title practice-section-header"
            onclick="PracticeHub.toggleSection('${key}')"
            role="button" tabindex="0"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();PracticeHub.toggleSection('${key}');}">
          <span class="section-caret ${collapsed ? 'collapsed' : ''}">▾</span>
          <span>${label}</span>
          <span class="section-count">${topics.length}</span>
        </h2>
        ${collapsed ? "" : `
          <div class="practice-topic-list">
            ${topics.map(t => renderTopicRow(t, s)).join("")}
          </div>
        `}
      </div>
    `;
  }

  function typeBadge(type) {
    if (type === "pattern") return '<span class="pattern-badge">PATTERN</span>';
    if (type === "situation") return '<span class="situation-badge">SITUATION</span>';
    return "";
  }

  function renderTopicRow(t, s) {
    const mastery = State.getTopicMastery(t.id);
    const ts = s.topicStats[t.id];
    const isExpanded = expandedTopic === t.id;
    const type = topicType(t);
    const isPattern = type === "pattern";

    return `
      <div class="practice-topic topic-type-${type} ${isExpanded ? 'expanded' : ''}">
        <div class="practice-topic-header" onclick="PracticeHub.toggleTopic('${t.id}')">
          <span class="practice-topic-emoji">${t.emoji}</span>
          <div class="practice-topic-info">
            <span class="practice-topic-name">${t.label}</span>
            <span class="practice-topic-meta">${t.pairs.length} ${isPattern ? "examples" : "words"} · ${Math.round(mastery * 100)}%</span>
          </div>
          ${typeBadge(type)}
          ${t.essential ? '<span class="essential-badge">CORE</span>' : ''}
          <div class="practice-topic-ring">${UI.progressRing(mastery, 32, 3)}</div>
        </div>
        ${isExpanded ? `
          <div class="practice-topic-actions">
            ${isPattern ? `
              <button class="btn btn-lg practice-listen-primary" onclick="UI.navigate('#pattern/${t.id}')">
                🧩 Pattern Practice
                <span class="recommended-pill">RECOMMENDED</span>
              </button>
              <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#listen/${t.id}')">🎧 Listen</button>
              <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
            ` : `
              <button class="btn btn-lg practice-listen-primary" onclick="UI.navigate('#listen/${t.id}')">
                🎧 Listen &amp; Choose
                <span class="recommended-pill">RECOMMENDED</span>
              </button>
              <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
              <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
              <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">⚡ Speed</button>
              <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#typing/${t.id}')">⌨️ Typing</button>
            `}
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

  function toggleSection(key) {
    sectionCollapsed[key] = !sectionCollapsed[key];
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

  return { show, toggleTopic, toggleSection, setDisplay, quick5 };
})();
