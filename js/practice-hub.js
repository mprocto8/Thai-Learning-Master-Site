/**
 * Practice Hub — compact topic list with tap-to-expand actions.
 * Quick 5 feature: random 5-word speed round from any topic.
 */
const PracticeHub = (() => {
  // Section collapse state — persisted in-memory across re-renders of this
  // screen. Intentionally not saved to State; cheap UI state.
  const sectionCollapsed = { script: false, vocabulary: false, patterns: false, situations: false };

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
          <h1>📚 Library</h1>
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
          <div class="practice-tool-card" onclick="UI.navigate('#clock')">
            <span class="practice-tool-icon">🕐</span>
            <div><strong>Thai Clock</strong><span class="practice-tool-sub">Tell time in Thai</span></div>
          </div>
          <div class="practice-tool-card" onclick="UI.navigate('#time-game')">
            <span class="practice-tool-icon">🎮</span>
            <div><strong>Time Game</strong><span class="practice-tool-sub">Practice telling time</span></div>
          </div>
        </div>

        ${renderScriptSection()}
        ${renderSection("vocabulary", "Vocabulary", vocabularyTopics, s)}
        ${patternTopics.length > 0 ? renderSection("patterns", "Patterns", patternTopics, s) : ""}
        ${situationTopics.length > 0 ? renderSection("situations", "Situations", situationTopics, s) : ""}
      </div>
    `);
  }

  function renderScriptSection() {
    const collapsed = !!sectionCollapsed.script;
    const scriptItems = [
      { icon: "ก", label: "Thai Script", meta: "Consonants, vowels, and tone marks", route: "#alphabet" },
      { icon: "พ", label: "Consonants", meta: `${typeof THAI_CONSONANTS !== "undefined" ? THAI_CONSONANTS.length : 44} letters`, route: "#alphabet" },
      { icon: "า", label: "Vowels", meta: `${typeof THAI_VOWELS !== "undefined" ? THAI_VOWELS.length : 21} vowels`, route: "#alphabet" },
      { icon: "่", label: "Tone Marks", meta: `${typeof THAI_TONE_MARKS !== "undefined" ? THAI_TONE_MARKS.length : 4} marks`, route: "#alphabet" },
      { icon: "🎵", label: "Tone Trainer", meta: "Master the 5 Thai tones", route: "#tones" }
    ];

    return `
      <div class="practice-section library-script-section" data-section="script">
        <h2 class="section-title practice-section-title practice-section-header"
            onclick="PracticeHub.toggleSection('script')"
            role="button" tabindex="0"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();PracticeHub.toggleSection('script');}">
          <span class="section-caret ${collapsed ? 'collapsed' : ''}">▾</span>
          <span>Script</span>
          <span class="section-count">${scriptItems.length}</span>
        </h2>
        ${collapsed ? "" : `
          <div class="practice-topic-list">
            ${scriptItems.map(item => `
              <div class="practice-topic topic-type-script">
                <div class="practice-topic-header"
                     onclick="UI.navigate('${item.route}')"
                     role="button" tabindex="0"
                     aria-label="Open ${item.label}"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();UI.navigate('${item.route}');}">
                  <span class="practice-topic-emoji script-topic-icon">${item.icon}</span>
                  <div class="practice-topic-info">
                    <span class="practice-topic-name">${item.label}</span>
                    <span class="practice-topic-meta">${item.meta}</span>
                  </div>
                  <span class="script-badge">SCRIPT</span>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
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
    const type = topicType(t);
    const isPattern = type === "pattern";

    return `
      <div class="practice-topic topic-type-${type}">
        <div class="practice-topic-header"
             onclick="UI.navigate('#topic/${t.id}')"
             role="button" tabindex="0"
             aria-label="Review ${t.label}"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();UI.navigate('#topic/${t.id}');}">
          <span class="practice-topic-emoji">${t.emoji}</span>
          <div class="practice-topic-info">
            <span class="practice-topic-name">${t.label}</span>
            <span class="practice-topic-meta">${t.pairs.length} ${isPattern ? "examples" : "words"} · ${Math.round(mastery * 100)}%</span>
          </div>
          ${typeBadge(type)}
          ${t.essential ? '<span class="essential-badge">CORE</span>' : ''}
          <div class="practice-topic-ring">${UI.progressRing(mastery, 32, 3)}</div>
        </div>
        ${`
          <div class="practice-topic-actions">
            ${isPattern ? `
              <button class="btn btn-lg practice-listen-primary" onclick="UI.navigate('#pattern/${t.id}')">
                🧩 Pattern Practice
                <span class="recommended-pill">RECOMMENDED</span>
              </button>
              <div class="practice-topic-actions-row">
                <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#listen/${t.id}')">🎧 Listen</button>
                <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
              </div>
            ` : `
              <button class="btn btn-lg practice-listen-primary" onclick="UI.navigate('#listen/${t.id}')">
                🎧 Listen &amp; Choose
                <span class="recommended-pill">RECOMMENDED</span>
              </button>
              <div class="practice-topic-actions-row">
                <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
                <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
                <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">⚡ Speed</button>
                <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#typing/${t.id}')">⌨️ Typing</button>
              </div>
            `}
          </div>
          ${ts ? `<div class="practice-topic-last">Last played: ${UI.timeAgo(ts.lastPlayed)}</div>` : ''}
        `}
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
