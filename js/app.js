/**
 * App entry point — dashboard, onboarding, settings, routing.
 */
const App = (() => {
  let _dashScrollY = 0;
  // Dashboard section collapse state — in-memory only.
  const _dashCollapsed = { vocabulary: false, patterns: false, situations: false };
  const CAPABILITY_MAP = {
    'pronoun-name': 'Introduce yourself',
    'simple-statement': 'Make basic statements',
    'negation': 'Use negation',
    'yes-no-question': 'Ask yes/no questions',
    'question-word-end': 'Place question words',
    'ask-location': 'Ask where things are',
    'ask-for': 'Ask for things politely',
    'can-you': 'Ask "can you?"',
    'how-much': 'Ask prices',
    'want-to': 'Express wants',
    'need': 'Express needs',
    'like': 'Express likes',
    'have': 'Talk about possessions',
    'go-to': 'Talk about destinations',
    'eat-drink': 'Order food and drink',
    'comparative': 'Compare things',
    'time-marker': 'Use time markers',
    'soften': 'Sound polite',
    'already-done': 'Mark completed actions',
    'not-yet': 'Mark unfinished actions',
    'future': 'Use future tense',
    'with-someone': 'Talk about company',
    'tag-question': 'Ask for confirmation',
    'very-too': 'Use intensifiers',
    'polite-request': 'Make polite requests'
  };

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function _topicType(t) {
    return t.type || "vocabulary";
  }

  function init() {
    State.load();
    UI.applyTheme();

    // Register routes
    UI.registerRoute("#dashboard", renderDashboard);
    UI.registerRoute("#home", renderDashboard);
    UI.registerRoute("#pathways", () => Pathways.show());
    UI.registerRoute("#learn", () => Pathways.show());
    UI.registerRoute("#pathway", routePathway);
    UI.registerRoute("#practice", () => PracticeHub.show());
    UI.registerRoute("#library", () => PracticeHub.show());
    UI.registerRoute("#topic", routeTopic);
    UI.registerRoute("#game", routeGame);
    UI.registerRoute("#flashcard", routeFlashcard);
    UI.registerRoute("#speed", routeSpeed);
    UI.registerRoute("#alphabet", () => Alphabet.show());
    UI.registerRoute("#script", () => Alphabet.show());
    UI.registerRoute("#clock", () => { Clock.show(); UI.setCleanup(() => Clock.cleanup()); });
    UI.registerRoute("#time-game", () => TimeGame.show());
    UI.registerRoute("#tones", () => ToneTrainer.show());
    UI.registerRoute("#sentences", () => SentenceBuilder.show());
    UI.registerRoute("#settings", renderSettings);
    UI.registerRoute("#login", renderLogin);
    UI.registerRoute("#reset-request", renderResetRequest);
    UI.registerRoute("#reset-confirm", renderResetConfirm);
    UI.registerRoute("#typing", routeTyping);
    UI.registerRoute("#listen", routeListen);
    UI.registerRoute("#listen-quick", () => ListenChoose.startQuick());
    UI.registerRoute("#pattern", routePattern);
    UI.registerRoute("#session", routeSession);

    // Initialize Supabase and attempt to restore a session. Non-blocking —
    // the app boots immediately in guest mode; the header bar updates once
    // the session restore finishes.
    if (typeof SupabaseClient !== "undefined") {
      SupabaseClient.init();

      // Detect password recovery links BEFORE starting the router. Supabase
      // appends `type=recovery` + access_token to the URL hash when the user
      // clicks the reset email — we route them straight to the confirm screen.
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery")) {
        // Replace the messy recovery hash with a clean route so the token
        // doesn't sit in the URL. The Supabase SDK has already parsed it.
        history.replaceState(null, "", window.location.pathname + "#reset-confirm");
      }

      // Also listen for the PASSWORD_RECOVERY auth event, which may fire
      // later (depending on SDK timing) and should also force the confirm
      // screen if the user isn't already there.
      window.addEventListener("thai-learner-recovery", () => {
        if (!window.location.hash.includes("reset-confirm")) {
          UI.navigate("#reset-confirm");
        }
      });

      State.restoreSession().then(loggedIn => {
        if (loggedIn) {
          // If we restored a recovery session, make sure we land on the
          // confirm screen (the hash rewrite above may have been too early).
          if (State.isRecoveryMode() && !window.location.hash.includes("reset-confirm")) {
            UI.navigate("#reset-confirm");
            return;
          }
          // Re-render the current route so the header bar appears.
          UI.handleRoute();
        }
      }).catch(e => console.warn("[App] session restore failed:", e));
    }

    // `L` on home/dashboard → today's listening practice.
    document.addEventListener("keydown", e => {
      if (e.key !== "l" && e.key !== "L") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || document.activeElement?.isContentEditable) return;
      const currentHash = window.location.hash || "#home";
      if (!["#home", "#dashboard"].includes(currentHash)) return;
      e.preventDefault();
      startTodayListen();
    });

    // Check onboarding
    if (!State.get().onboarded) {
      renderOnboarding();
    } else {
      UI.init();
    }
  }

  /* Onboarding */
  function renderOnboarding() {
    UI.render(`
      <div class="onboarding">
        <div class="onboarding-card">
          <div class="onboarding-icon">🇹🇭</div>
          <h1>สวัสดี!</h1>
          <p>Welcome to Thai Learner — your daily Thai vocabulary and script practice tool.</p>
          <div class="onboarding-field">
            <label for="username">What should we call you?</label>
            <input type="text" id="username" placeholder="Your name" maxlength="20" autofocus />
          </div>
          <button class="btn btn-primary btn-lg" onclick="App.completeOnboarding()">Let's Go!</button>
        </div>
      </div>
    `);

    // Enter key support
    setTimeout(() => {
      const input = document.getElementById("username");
      if (input) {
        input.addEventListener("keydown", e => {
          if (e.key === "Enter") App.completeOnboarding();
        });
      }
    }, 50);
  }

  function completeOnboarding() {
    const name = (document.getElementById("username")?.value || "Learner").trim();
    State.set("userName", name || "Learner");
    State.set("onboarded", true);
    UI.init();
  }

  /* Dashboard */
  function hashString(s) {
    return [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
  }

  function getMistakePairs() {
    const fc = State.get().flashcardStats || {};
    const pairs = [];
    for (const topicId in fc) {
      const topic = TOPICS.find(t => t.id === topicId);
      if (!topic) continue;
      for (const idx in fc[topicId]) {
        if (fc[topicId][idx].bucket === 0) {
          const pairIdx = parseInt(idx);
          const pair = topic.pairs[pairIdx];
          if (pair) pairs.push({ ...pair, _sourceTopicId: topicId, _sourceIndex: pairIdx });
        }
      }
    }
    return pairs;
  }

  /** Pick today's listening topic: lowest-mastery played topic, or greetings fallback. */
  function getTodayListenTopic() {
    const s = State.get();
    let best = null;
    let bestMastery = Infinity;
    for (const t of TOPICS) {
      const ts = s.topicStats[t.id];
      if (!ts || ts.played === 0) continue;
      const m = State.getTopicMastery(t.id);
      if (m < bestMastery) { best = t; bestMastery = m; }
    }
    if (best) return best;
    return TOPICS.find(t => t.id === "greetings-phrases") || TOPICS[0];
  }

  function startTodayListen() {
    const t = getTodayListenTopic();
    if (t) UI.navigate("#listen/" + t.id);
  }

  function getWordOfTheDay() {
    const s = State.get();
    // Find lowest-mastery played topic
    let bestTopic = null;
    let bestMastery = Infinity;
    for (const t of TOPICS) {
      const ts = s.topicStats[t.id];
      if (!ts || ts.played === 0) continue;
      const m = State.getTopicMastery(t.id);
      if (m < bestMastery) {
        bestMastery = m;
        bestTopic = t;
      }
    }
    if (!bestTopic) bestTopic = TOPICS.find(t => t.id === "greetings-phrases") || TOPICS[0];
    if (!bestTopic || !bestTopic.pairs.length) return null;
    const seed = new Date().toDateString();
    const idx = hashString(seed) % bestTopic.pairs.length;
    return { pair: bestTopic.pairs[idx], topic: bestTopic, index: idx };
  }

  function getTopicRoute(topicId) {
    const topic = TOPICS.find(t => t.id === topicId);
    return _topicType(topic || {}) === "pattern" ? `#pattern/${topicId}` : `#game/${topicId}`;
  }

  function getCurrentPathwaySession() {
    const target = Session.resolveCurrentPathway ? Session.resolveCurrentPathway() : null;
    if (!target) return null;
    const prog = State.getPathwayProgress(target.id);
    const nextTopicId = prog.nextTopic || target.topics[0];
    const topic = TOPICS.find(t => t.id === nextTopicId);
    return {
      pathway: target,
      topic,
      route: "#session/" + target.id,
      isReplay: prog.isComplete,
      progress: prog
    };
  }

  function getHomeCapabilities() {
    const items = (typeof PATHWAYS !== "undefined" ? PATHWAYS : []).map(pathway => {
      const topicId = pathway.topics && pathway.topics[0];
      const topic = TOPICS.find(t => t.id === topicId);
      const status = State.getPathwayMasteryStatus(pathway.id);
      return {
        pathwayId: pathway.id,
        topicId,
        topic,
        label: CAPABILITY_MAP[pathway.id] || pathway.label,
        strictMastered: status.strictMastered,
        legacyMastered: status.legacyMastered,
        done: status.displayMastered
      };
    }).filter(item => item.topic);
    const completed = items.filter(item => item.done);
    const next = items.find(item => !item.done);
    return { completed, next };
  }

  function renderHomeCapability(item) {
    const legacy = item.legacyMastered && !item.strictMastered;
    return `
      <div class="home-capability home-capability-link done ${legacy ? 'legacy' : 'strict'}"
        onclick="UI.navigate('#pathway/${item.pathwayId}')"
        role="button" tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();UI.navigate('#pathway/${item.pathwayId}');}">
        <span class="home-capability-icon">&#10003;</span>
        <span class="home-capability-label">${item.label}</span>
        ${legacy ? '<span class="home-capability-legacy">★</span>' : ''}
        <span class="home-capability-arrow">&rarr;</span>
      </div>
    `;
  }

  function renderHomeNextCapability(item) {
    return `
      <div class="home-capability home-capability-link next"
        onclick="UI.navigate('#pathway/${item.pathwayId}')"
        role="button" tabindex="0"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();UI.navigate('#pathway/${item.pathwayId}');}">
        <span class="home-capability-icon">&rarr;</span>
        <span class="home-capability-label">${item.label}</span>
        <span class="home-capability-arrow">&rarr;</span>
      </div>
    `;
  }

  function renderDashboard() {
    const s = State.get();
    const mistakePairs = getMistakePairs();
    const wotd = getWordOfTheDay();
    const listenTopic = getTodayListenTopic();
    const session = getCurrentPathwaySession();
    const capabilities = getHomeCapabilities();
    const dayNumber = (s.topicStats && Object.keys(s.topicStats).length) || 1;

    UI.render(`
      <div class="dashboard">
        ${UI.navBar("dashboard")}

        <div class="dash-header home-v2-header">
          <div class="dash-greeting">
            <h1>สวัสดี ${escapeHtml(s.userName || "Learner")}</h1>
            <p class="dash-subtitle">${getGreeting()}</p>
          </div>
          <div class="home-streak-strip">🔥 ${s.streak || 0} day streak · Day ${dayNumber}</div>
        </div>

        ${!State.isLoggedIn() ? `
          <div class="guest-nudge" onclick="UI.navigate('#login')">
            <span class="guest-nudge-icon">☁️</span>
            <div class="guest-nudge-text">
              <strong>Sign in to save progress across devices</strong>
              <span>Your streak, XP, and stats — everywhere.</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
        ` : ''}

        ${session ? `
          <section class="home-session-card" onclick="UI.navigate('${session.route}')" role="button" tabindex="0"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();UI.navigate('${session.route}');}">
            <div class="home-session-meta">
              <span class="home-session-label">TODAY'S SESSION</span>
              <span class="home-session-time">~10 min</span>
            </div>
            <h2>${session.isReplay ? "Restart" : "Continue"} ${session.pathway.label}</h2>
            <p>${session.topic ? `Next up: ${session.topic.label}. Build the pattern, hear it, then lock it in.` : "Pick up the next guided step in Learn."}</p>
            <button class="btn btn-primary home-session-button" onclick="event.stopPropagation();UI.navigate('${session.route}')">Start session →</button>
          </section>
        ` : ''}

        <section class="home-capabilities-card">
          <div class="home-card-label">YOU CAN NOW</div>
          <div class="home-capability-list">
            ${capabilities.completed.length ? capabilities.completed.map(renderHomeCapability).join("") : `
              <div class="home-capability muted">
                <span class="home-capability-icon">·</span>
                <span>Start your first pathway to unlock capabilities</span>
              </div>
            `}
            ${capabilities.next ? renderHomeNextCapability(capabilities.next) : ''}
          </div>
        </section>

        <div class="home-quick-row">
          <button class="home-mini-card" onclick="${mistakePairs.length ? "App.reviewMistakes()" : "UI.navigate('#library')"}">
            <span class="home-mini-label">REVIEW</span>
            <strong>Mistakes (${mistakePairs.length})</strong>
            ${mistakePairs.length > 0 ? `<span class="home-mini-badge">${mistakePairs.length}</span>` : ''}
          </button>
          <button class="home-mini-card" onclick="App.startTodayListen()">
            <span class="home-mini-label">DAILY</span>
            <strong>Listen drill</strong>
            <span class="home-mini-sub">${listenTopic ? listenTopic.label : "Today's topic"}</span>
          </button>
        </div>

        ${wotd ? `
          <section class="home-wotd-card" id="wotd-card">
            <div id="wotd-front">
              <div class="home-card-label">WORD OF THE DAY</div>
              <button class="btn btn-sm home-wotd-audio" onclick="App.playWotd()" aria-label="Hear word of the day">🔊</button>
              <div class="home-wotd-script">${wotd.pair.script}</div>
              <div class="home-wotd-romanized">${wotd.pair.romanized}</div>
              <div class="home-wotd-english">${wotd.pair.english}</div>
            </div>
          </section>
        ` : ''}
      </div>
    `);

    // QOL 6: restore scroll position
    const savedY = _dashScrollY;
    _dashScrollY = 0;
    if (savedY > 0) {
      setTimeout(() => window.scrollTo(0, savedY), 50);
    }
  }

  /* Topic grouping on the dashboard: Vocabulary / Patterns / Situations.
   * Patterns section is hidden when empty (content arrives in a later session). */
  function renderDashTopicSections(s, topicView) {
    const vocabularyTopics = TOPICS
      .filter(t => _topicType(t) === "vocabulary")
      .sort((a, b) => (b.essential ? 1 : 0) - (a.essential ? 1 : 0));
    const patternTopics = TOPICS.filter(t => _topicType(t) === "pattern");
    const situationTopics = TOPICS.filter(t => _topicType(t) === "situation");

    return `
      ${renderDashSection("vocabulary", "Vocabulary", vocabularyTopics, s, topicView)}
      ${patternTopics.length > 0 ? renderDashSection("patterns", "Patterns", patternTopics, s, topicView) : ""}
      ${situationTopics.length > 0 ? renderDashSection("situations", "Situations", situationTopics, s, topicView) : ""}
    `;
  }

  function renderDashSection(key, label, topics, s, topicView) {
    const collapsed = !!_dashCollapsed[key];
    return `
      <div class="dash-topic-section" data-section="${key}">
        <h3 class="dash-topic-section-header"
            onclick="App.toggleDashSection('${key}')"
            role="button" tabindex="0"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.toggleDashSection('${key}');}">
          <span class="section-caret ${collapsed ? 'collapsed' : ''}">▾</span>
          <span>${label}</span>
          <span class="section-count">${topics.length}</span>
        </h3>
        ${collapsed ? "" : (topicView === 'grid'
          ? `<div class="topic-grid">${topics.map(t => renderDashTopicCard(t, s)).join("")}</div>`
          : `<div class="dash-topic-list">${topics.map(t => renderDashTopicRow(t, s)).join("")}</div>`)}
      </div>
    `;
  }

  function _primaryRoute(t) {
    return _topicType(t) === "pattern" ? `#pattern/${t.id}` : `#listen/${t.id}`;
  }

  function _primaryLabel(t) {
    return _topicType(t) === "pattern" ? "🧩 Practice" : "🔊 Listen";
  }

  function _typeBadge(type) {
    if (type === "pattern") return '<span class="pattern-badge">PATTERN</span>';
    if (type === "situation") return '<span class="situation-badge">SITUATION</span>';
    return "";
  }

  function renderDashTopicCard(t, s) {
    const mastery = State.getTopicMastery(t.id);
    const ts = s.topicStats[t.id];
    const type = _topicType(t);
    const isPattern = type === "pattern";
    return `
      <div class="topic-card topic-type-${type}">
        <div class="topic-card-header">
          <div class="topic-ring">${UI.progressRing(mastery, 44, 3)}</div>
          <span class="topic-emoji">${t.emoji}</span>
          ${_typeBadge(type)}
          ${t.essential ? '<span class="essential-badge">CORE</span>' : ''}
        </div>
        <h3 class="topic-name">${t.label}</h3>
        <div class="topic-meta">
          <span>${t.pairs.length} ${isPattern ? "examples" : "words"}</span>
          <span>${Math.round(mastery * 100)}%</span>
        </div>
        ${ts ? `<div class="topic-last">${UI.timeAgo(ts.lastPlayed)}</div>` : ''}
        <button class="btn topic-listen-primary" onclick="UI.navigate('${_primaryRoute(t)}')">${_primaryLabel(t)}</button>
        <div class="topic-actions">
          ${isPattern ? `
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#listen/${t.id}')">🎧</button>
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
          ` : `
            <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
            <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">⚡</button>
          `}
        </div>
      </div>
    `;
  }

  function renderDashTopicRow(t, s) {
    const mastery = State.getTopicMastery(t.id);
    const type = _topicType(t);
    const isPattern = type === "pattern";
    return `
      <div class="dash-topic-row topic-type-${type}">
        <span class="dash-topic-row-emoji">${t.emoji}</span>
        <span class="dash-topic-row-name">${t.label}${t.essential ? ' <span class="essential-badge">CORE</span>' : ''}${_typeBadge(type)}</span>
        <span class="dash-topic-row-mastery">${Math.round(mastery * 100)}%</span>
        <div class="dash-topic-row-actions">
          <button class="btn btn-sm dash-topic-row-primary" onclick="UI.navigate('${_primaryRoute(t)}')" title="${isPattern ? 'Pattern Practice' : 'Listen & Choose'}">${isPattern ? '&#129513;' : '&#128266;'}</button>
          ${isPattern ? `
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
          ` : `
            <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
            <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
            <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">&#9889;</button>
          `}
        </div>
      </div>
    `;
  }

  function toggleDashSection(key) {
    _dashCollapsed[key] = !_dashCollapsed[key];
    renderDashboard();
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to learn?";
    if (hour < 17) return "Good afternoon! Let's practice.";
    if (hour < 21) return "Good evening! Time for Thai.";
    return "Late night study session?";
  }

  /* Route helpers — extract topic ID from hash (strip query params) */
  function routeGame() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) Game.start(topicId);
    else UI.navigate("#library");
  }

  function routeTopic() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) TopicDetail.show(topicId);
    else UI.navigate("#library");
  }

  function routeFlashcard() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) Flashcard.start(topicId);
    else UI.navigate("#library");
  }

  function routeSpeed() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) Speed.start(topicId);
    else UI.navigate("#library");
  }

  function routeTyping() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) TypingChallenge.start(topicId);
    else UI.navigate("#library");
  }

  function routeListen() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) ListenChoose.start(topicId);
    else UI.navigate("#library");
  }

  function routePattern() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (!topicId) { UI.navigate("#library"); return; }
    const t = TOPICS.find(tp => tp.id === topicId);
    if (!t || _topicType(t) !== "pattern") {
      UI.toast("Pattern Practice is only available for pattern topics.", "info");
      UI.navigate("#library");
      return;
    }
    PatternPractice.start(topicId);
  }

  function routePathway() {
    const pathwayId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (!pathwayId) { UI.navigate("#learn"); return; }
    Pathways.showDetails(pathwayId);
  }

  function routeSession() {
    const pathwayId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (pathwayId) Session.start(pathwayId);
    else Session.startNext();
  }

  /* Settings */
  function renderSettings() {
    const s = State.get();
    const badges = s.badges || [];

    UI.render(`
      <div class="settings-screen">
        ${UI.navBar("settings")}

        <div class="section-header">
          <h1>⚙️ Settings</h1>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <label>Your Name</label>
            <input type="text" id="setting-name" maxlength="20"
              onchange="App.updateName(this.value)" />
          </div>

          <div class="setting-item">
            <label>Default Display</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${!s.showScript ? 'btn-active' : ''}" onclick="App.setScript(false)">Romanized</button>
              <button class="btn btn-sm ${s.showScript ? 'btn-active' : ''}" onclick="App.setScript(true)">Thai Script</button>
            </div>
          </div>

          <div class="setting-item">
            <label>Theme</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(true)">Dark</button>
              <button class="btn btn-sm ${!s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(false)">Light</button>
            </div>
          </div>

          <div class="setting-item">
            <label>Auto-play audio in Listen mode</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${s.autoPlayAudio !== false ? 'btn-active' : ''}" onclick="App.toggleAutoPlay(true)">On</button>
              <button class="btn btn-sm ${s.autoPlayAudio === false ? 'btn-active' : ''}" onclick="App.toggleAutoPlay(false)">Off</button>
            </div>
          </div>

          <div class="setting-item">
            <label>Auto-advance Pattern Practice</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${s.autoAdvancePatternPractice ? 'btn-active' : ''}" onclick="App.togglePatternAutoAdvance(true)">On</button>
              <button class="btn btn-sm ${!s.autoAdvancePatternPractice ? 'btn-active' : ''}" onclick="App.togglePatternAutoAdvance(false)">Off</button>
            </div>
            <div class="setting-hint">When off, tap Continue (or press space) after each round.</div>
          </div>

          <div class="setting-item">
            <label>Auto-advance Sentence Builder</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${s.autoAdvanceSentenceBuilder ? 'btn-active' : ''}" onclick="App.toggleSentenceBuilderAutoAdvance(true)">On</button>
              <button class="btn btn-sm ${!s.autoAdvanceSentenceBuilder ? 'btn-active' : ''}" onclick="App.toggleSentenceBuilderAutoAdvance(false)">Off</button>
            </div>
            <div class="setting-hint">When off, tap Continue (or press space) after each completed sentence.</div>
          </div>

          <div class="setting-item">
            <label>Pause between activities</label>
            <div class="toggle-group">
              <button class="btn btn-sm ${s.pauseBetweenActivities ? 'btn-active' : ''}" onclick="App.togglePauseBetweenActivities(true)">On</button>
              <button class="btn btn-sm ${!s.pauseBetweenActivities ? 'btn-active' : ''}" onclick="App.togglePauseBetweenActivities(false)">Off</button>
            </div>
            <div class="setting-hint">When off, guided sessions continue automatically after transitions.</div>
          </div>

          ${renderVoiceSection(s)}

          ${renderAccountSection(s)}

          <div class="setting-item stats-section">
            <label>Your Stats</label>
            <div class="stats-grid">
              <div class="mini-stat"><strong>${s.xp}</strong> XP</div>
              <div class="mini-stat"><strong>${s.streak}</strong> Day Streak</div>
              <div class="mini-stat"><strong>${State.getLevel().name}</strong> Level</div>
              <div class="mini-stat"><strong>${Object.keys(s.topicStats).length}</strong> Topics Played</div>
              <div class="mini-stat"><strong>${badges.length}</strong> Badges</div>
            </div>
          </div>

          ${badges.length > 0 ? `
            <div class="setting-item">
              <label>Earned Badges</label>
              <div class="badge-list settings-badges">
                ${badges.map(id => {
                  const p = PATHWAYS.find(pw => pw.id === id);
                  return p ? `<div class="badge-item"><span class="badge-emoji">${p.badge.emoji}</span><span class="badge-label">${p.badge.label}</span></div>` : '';
                }).join("")}
              </div>
            </div>
          ` : ''}

          <div class="setting-item danger-zone">
            <label>Danger Zone</label>
            <button class="btn btn-danger" onclick="App.confirmReset()">Reset All Progress</button>
          </div>
        </div>
      </div>
    `);

    const nameInput = document.getElementById("setting-name");
    if (nameInput) nameInput.value = s.userName || "";
  }

  function updateName(name) {
    State.set("userName", name.trim() || "Learner");
  }

  function setScript(useScript) {
    State.set("showScript", useScript);
    renderSettings();
  }

  function setTheme(dark) {
    State.set("darkMode", dark);
    UI.applyTheme();
    renderSettings();
  }

  function toggleAutoPlay(on) {
    State.set("autoPlayAudio", !!on);
    renderSettings();
  }

  function togglePatternAutoAdvance(on) {
    State.set("autoAdvancePatternPractice", !!on);
    renderSettings();
  }

  function toggleSentenceBuilderAutoAdvance(on) {
    State.set("autoAdvanceSentenceBuilder", !!on);
    renderSettings();
  }

  function togglePauseBetweenActivities(on) {
    State.set("pauseBetweenActivities", !!on);
    renderSettings();
  }

  function setVoice(voiceId) {
    State.setVoicePreference(voiceId);
    UI.toast(`Voice set to ${voiceId === "ploy" ? "Ploy" : "Serafina"}`, "success");
    renderSettings();
  }

  function renderVoiceSection(s) {
    const isPremium = State.isPremium && State.isPremium();
    if (!isPremium) {
      return `
        <div class="setting-item">
          <label>Voice</label>
          <div class="voice-info">Ploy</div>
          <div class="setting-hint">Premium users can choose between Ploy and Serafina.</div>
        </div>
      `;
    }
    const current = (State.getVoicePreference && State.getVoicePreference()) || "serafina";
    return `
      <div class="setting-item">
        <label>Voice</label>
        <div class="toggle-group">
          <button class="btn btn-sm ${current === "ploy" ? 'btn-active' : ''}" onclick="App.setVoice('ploy')">Ploy</button>
          <button class="btn btn-sm ${current === "serafina" ? 'btn-active' : ''}" onclick="App.setVoice('serafina')">Serafina ⭐</button>
        </div>
        <div class="setting-hint">Switches the audio voice across the app.</div>
      </div>
    `;
  }

  function confirmReset() {
    if (confirm("This will erase ALL your progress, XP, and streaks. Are you sure?")) {
      State.resetAll();
      UI.toast("Progress reset", "info");
      renderOnboarding();
    }
  }

  function reviewMistakes() {
    const pairs = getMistakePairs();
    if (pairs.length === 0) return;
    Flashcard.startFromDeck(pairs, "Mistake Review");
  }

  function flipWotd() {
    const front = document.getElementById("wotd-front");
    const back = document.getElementById("wotd-back");
    if (!front || !back) return;
    if (back.style.display === "none") {
      back.style.display = "block";
    } else {
      back.style.display = "none";
    }
  }

  function playWotd() {
    const wotd = getWordOfTheDay();
    if (!wotd || !wotd.topic) return;
    Audio.playWord(wotd.topic.id, wotd.index).catch(() => {});
  }

  function setTopicView(view) {
    State.set("topicView", view);
    renderDashboard();
  }

  function saveDashScroll() {
    _dashScrollY = window.scrollY;
  }

  /* ------------------------------------------------------------
   *  Auth screens + account tier section
   * ------------------------------------------------------------ */

  function renderAccountSection(s) {
    const loggedIn = State.isLoggedIn();
    const tier = State.getAccountTier();
    const premium = State.isPremium();
    const tierBadge = premium
      ? '<span class="tier-badge tier-premium">PREMIUM</span>'
      : '<span class="tier-badge tier-free">FREE</span>';

    if (!loggedIn) {
      return `
        <div class="setting-item pro-section">
          <label>Thai Learner Pro</label>
          <div class="pro-card">
            <div class="pro-header">
              <span class="pro-title">Thai Learner Pro</span>
              ${tierBadge}
            </div>
            <p class="pro-teaser">Sign in to unlock upcoming premium features:</p>
            <ul class="pro-features">
              <li>📈 Advanced analytics &amp; learning insights</li>
              <li>🎨 Custom themes</li>
              <li>📦 Additional vocabulary &amp; sentence packs</li>
            </ul>
            <button class="btn btn-primary" onclick="UI.navigate('#login')">Sign in / Create account</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="setting-item pro-section">
        <label>Thai Learner Pro</label>
        <div class="pro-card">
          <div class="pro-header">
            <span class="pro-title">Thai Learner Pro</span>
            ${tierBadge}
          </div>
          ${premium ? `
            <p class="pro-teaser">You're on the Premium tier — thanks for supporting the app!</p>
          ` : `
            <p class="pro-teaser">Premium features coming soon:</p>
            <ul class="pro-features">
              <li>📈 Advanced analytics &amp; learning insights</li>
              <li>🎨 Custom themes</li>
              <li>📦 Additional vocabulary &amp; sentence packs</li>
            </ul>
            <p class="pro-hint">No payment required yet — we'll announce when it launches.</p>
          `}
        </div>
      </div>
    `;
  }

  function renderLogin() {
    const mode = (window.location.hash.includes("?signup")) ? "signup" : "login";
    const isSignup = mode === "signup";
    UI.render(`
      <div class="login-screen">
        <div class="login-card">
          <div class="login-icon">🇹🇭</div>
          <h1>${isSignup ? "Create account" : "Welcome back"}</h1>
          <p class="login-sub">${isSignup
            ? "Save your progress and sync across devices."
            : "Sign in to pick up where you left off on any device."}</p>

          <form class="login-form" onsubmit="App.submitLogin(event, '${mode}')">
            ${isSignup ? `
              <div class="login-field">
                <label for="login-name">Display name</label>
                <input id="login-name" type="text" maxlength="30" autocomplete="name" placeholder="Your name" />
              </div>
            ` : ""}

            <div class="login-field">
              <label for="login-email">Email</label>
              <input id="login-email" type="email" autocomplete="email" required placeholder="you@example.com" />
            </div>

            <div class="login-field">
              <label for="login-password">Password</label>
              <input id="login-password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" required minlength="6" placeholder="At least 6 characters" />
            </div>

            <div id="login-error" class="login-error" style="display:none"></div>

            <button class="btn btn-primary btn-lg login-submit" type="submit">
              ${isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          ${!isSignup ? `
            <div class="login-forgot">
              <a href="#reset-request" onclick="event.preventDefault();UI.navigate('#reset-request')">Forgot password?</a>
            </div>
          ` : ""}

          <div class="login-alt">
            ${isSignup
              ? `<span>Already have an account?</span> <a href="#login" onclick="event.preventDefault();App.switchLoginMode('login')">Sign in</a>`
              : `<span>New here?</span> <a href="#login?signup" onclick="event.preventDefault();App.switchLoginMode('signup')">Create an account</a>`}
          </div>

          <div class="login-guest">
            <a href="#home" onclick="event.preventDefault();App.continueAsGuest()">Continue as guest →</a>
            <p class="login-guest-hint">Guest progress stays on this device only.</p>
          </div>
        </div>
      </div>
    `);
  }

  function switchLoginMode(mode) {
    window.location.hash = mode === "signup" ? "#login?signup" : "#login";
  }

  async function submitLogin(event, mode) {
    event.preventDefault();
    const email = (document.getElementById("login-email")?.value || "").trim();
    const password = document.getElementById("login-password")?.value || "";
    const displayName = (document.getElementById("login-name")?.value || "").trim();
    const errEl = document.getElementById("login-error");
    const btn = document.querySelector(".login-submit");
    if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
    if (btn) { btn.disabled = true; btn.textContent = "Working…"; }
    try {
      if (mode === "signup") {
        const result = await State.signUp(email, password, displayName);
        if (result && !result.session) {
          // Email confirmation is required — tell the user.
          UI.toast("Check your email to confirm your account.", "info");
          if (btn) { btn.disabled = false; btn.textContent = "Create account"; }
          return;
        }
      } else {
        await State.login(email, password);
      }
      UI.toast("Signed in!", "info");
      UI.navigate("#home");
    } catch (e) {
      const msg = (e && e.message) ? e.message : "Something went wrong.";
      if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; }
      if (btn) { btn.disabled = false; btn.textContent = mode === "signup" ? "Create account" : "Sign in"; }
    }
  }

  function continueAsGuest() {
    UI.navigate("#home");
  }

  /* ------------------------------------------------------------
   *  Password reset — request + confirm screens
   * ------------------------------------------------------------ */

  function renderResetRequest() {
    UI.render(`
      <div class="login-screen">
        <div class="login-card">
          <div class="login-icon">🔑</div>
          <h1>Reset password</h1>
          <p class="login-sub">Enter your email and we'll send you a link to set a new password.</p>

          <form class="login-form" onsubmit="App.submitResetRequest(event)">
            <div class="login-field">
              <label for="reset-email">Email</label>
              <input id="reset-email" type="email" autocomplete="email" required placeholder="you@example.com" />
            </div>

            <div id="reset-error" class="login-error" style="display:none"></div>
            <div id="reset-success" class="login-success" style="display:none"></div>

            <button class="btn btn-primary btn-lg login-submit" type="submit">Send reset link</button>
          </form>

          <div class="login-alt">
            <a href="#login" onclick="event.preventDefault();UI.navigate('#login')">← Back to login</a>
          </div>
        </div>
      </div>
    `);
  }

  async function submitResetRequest(event) {
    event.preventDefault();
    const email = (document.getElementById("reset-email")?.value || "").trim();
    const errEl = document.getElementById("reset-error");
    const okEl = document.getElementById("reset-success");
    const btn = document.querySelector(".login-submit");
    if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
    if (okEl) { okEl.style.display = "none"; okEl.textContent = ""; }
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    try {
      await State.resetPassword(email);
      if (okEl) {
        okEl.textContent = "Check your email for the reset link. It may take a minute to arrive.";
        okEl.style.display = "block";
      }
      if (btn) { btn.disabled = false; btn.textContent = "Send again"; }
    } catch (e) {
      const msg = (e && e.message) ? e.message : "Something went wrong.";
      if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; }
      if (btn) { btn.disabled = false; btn.textContent = "Send reset link"; }
    }
  }

  function renderResetConfirm() {
    UI.render(`
      <div class="login-screen">
        <div class="login-card">
          <div class="login-icon">🔐</div>
          <h1>Set new password</h1>
          <p class="login-sub">Choose a new password for your account.</p>

          <form class="login-form" onsubmit="App.submitResetConfirm(event)">
            <div class="login-field">
              <label for="new-password">New password</label>
              <input id="new-password" type="password" autocomplete="new-password" required minlength="6" placeholder="At least 6 characters" />
            </div>

            <div class="login-field">
              <label for="new-password-confirm">Confirm password</label>
              <input id="new-password-confirm" type="password" autocomplete="new-password" required minlength="6" placeholder="Repeat new password" />
            </div>

            <div id="reset-error" class="login-error" style="display:none"></div>

            <button class="btn btn-primary btn-lg login-submit" type="submit">Update password</button>
          </form>

          <div class="login-alt">
            <a href="#login" onclick="event.preventDefault();UI.navigate('#login')">← Back to login</a>
          </div>
        </div>
      </div>
    `);
  }

  async function submitResetConfirm(event) {
    event.preventDefault();
    const pw = document.getElementById("new-password")?.value || "";
    const pw2 = document.getElementById("new-password-confirm")?.value || "";
    const errEl = document.getElementById("reset-error");
    const btn = document.querySelector(".login-submit");
    if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }

    if (pw.length < 6) {
      if (errEl) { errEl.textContent = "Password must be at least 6 characters."; errEl.style.display = "block"; }
      return;
    }
    if (pw !== pw2) {
      if (errEl) { errEl.textContent = "Passwords don't match."; errEl.style.display = "block"; }
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = "Updating…"; }
    try {
      await State.updatePassword(pw);
      State.clearRecoveryMode();
      UI.toast("Password updated!", "info");
      UI.navigate("#home");
    } catch (e) {
      const msg = (e && e.message) ? e.message : "Something went wrong.";
      // Most common failure: the recovery link expired or was reused.
      const friendly = /expired|invalid|token/i.test(msg)
        ? "Your reset link has expired or is invalid. Please request a new one."
        : msg;
      if (errEl) { errEl.textContent = friendly; errEl.style.display = "block"; }
      if (btn) { btn.disabled = false; btn.textContent = "Update password"; }
    }
  }

  async function confirmLogout() {
    if (!confirm("Sign out? Your progress will stay safe in your account, and this device will revert to guest mode.")) return;
    try { await State.logout(); } catch (e) { console.warn(e); }
    UI.toast("Signed out", "info");
    UI.handleRoute();
  }

  return {
    init, completeOnboarding, updateName, setScript, setTheme,
    confirmReset, reviewMistakes, flipWotd, playWotd, setTopicView, saveDashScroll,
    startTodayListen, toggleAutoPlay, togglePatternAutoAdvance, toggleSentenceBuilderAutoAdvance, togglePauseBetweenActivities, setVoice, toggleDashSection,
    // Auth
    submitLogin, switchLoginMode, continueAsGuest, confirmLogout,
    submitResetRequest, submitResetConfirm
  };
})();

// Boot
document.addEventListener("DOMContentLoaded", () => App.init());
