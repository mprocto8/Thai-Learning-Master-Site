/**
 * App entry point — dashboard, onboarding, settings, routing.
 */
const App = (() => {

  function init() {
    State.load();
    UI.applyTheme();

    // Register routes
    UI.registerRoute("#dashboard", renderDashboard);
    UI.registerRoute("#game", routeGame);
    UI.registerRoute("#flashcard", routeFlashcard);
    UI.registerRoute("#speed", routeSpeed);
    UI.registerRoute("#alphabet", () => Alphabet.show());
    UI.registerRoute("#clock", () => { Clock.show(); UI.setCleanup(() => Clock.cleanup()); });
    UI.registerRoute("#time-game", () => TimeGame.show());
    UI.registerRoute("#tones", () => ToneTrainer.show());
    UI.registerRoute("#sentences", () => SentenceBuilder.show());
    UI.registerRoute("#settings", renderSettings);

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
  function renderDashboard() {
    const s = State.get();
    const level = State.getLevel();
    const nextLevel = State.getNextLevel();
    const progress = State.getLevelProgress();
    const streakAtRisk = State.isStreakAtRisk();

    // Find last played topic
    let lastTopic = null;
    let lastTime = 0;
    for (const t of TOPICS) {
      const ts = s.topicStats[t.id];
      if (ts && ts.lastPlayed > lastTime) {
        lastTopic = t;
        lastTime = ts.lastPlayed;
      }
    }

    UI.render(`
      <div class="dashboard">
        ${UI.navBar("dashboard")}

        <div class="dash-header">
          <div class="dash-greeting">
            <h1>สวัสดี, ${s.userName}!</h1>
            <p class="dash-subtitle">${getGreeting()}</p>
          </div>
        </div>

        <div class="dash-stats">
          <div class="stat-card streak-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${s.streak}</div>
            <div class="stat-label">Day Streak</div>
            ${streakAtRisk ? '<div class="streak-warning">⚠️ Play today to keep your streak!</div>' : ''}
          </div>
          <div class="stat-card level-card">
            <div class="stat-icon">${level.emoji}</div>
            <div class="stat-value">${level.name}</div>
            <div class="stat-label">${s.xp} XP</div>
            <div class="xp-bar">
              <div class="xp-bar-fill" style="width:${progress * 100}%"></div>
            </div>
            ${nextLevel ? `<div class="xp-next">${nextLevel.minXP - s.xp} XP to ${nextLevel.name}</div>` : '<div class="xp-next">Max level!</div>'}
          </div>
        </div>

        ${lastTopic ? `
          <div class="continue-card" onclick="UI.navigate('#game/${lastTopic.id}')">
            <span class="continue-emoji">${lastTopic.emoji}</span>
            <div class="continue-text">
              <strong>Continue: ${lastTopic.label}</strong>
              <span>${UI.timeAgo(lastTime)}</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
        ` : ''}

        <h2 class="section-title">Topics</h2>
        <div class="topic-grid">
          ${TOPICS.map(t => {
            const mastery = State.getTopicMastery(t.id);
            const ts = s.topicStats[t.id];
            return `
              <div class="topic-card">
                <div class="topic-card-header">
                  <div class="topic-ring">${UI.progressRing(mastery, 44, 3)}</div>
                  <span class="topic-emoji">${t.emoji}</span>
                  ${t.situation ? '<span class="situation-badge">SITUATION</span>' : ''}
                </div>
                <h3 class="topic-name">${t.label}</h3>
                <div class="topic-meta">
                  <span>${t.pairs.length} words</span>
                  <span>${Math.round(mastery * 100)}%</span>
                </div>
                ${ts ? `<div class="topic-last">${UI.timeAgo(ts.lastPlayed)}</div>` : ''}
                <div class="topic-actions">
                  <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')">Match</button>
                  <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')">Cards</button>
                  <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')">⚡</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <h2 class="section-title">Learn More</h2>
        <div class="dash-cta-grid">
          <div class="dash-cta-card" onclick="UI.navigate('#clock')">
            <span class="cta-icon">🕐</span>
            <div class="cta-text">
              <strong>Thai Clock</strong>
              <span>Live time in Thai</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
          <div class="dash-cta-card" onclick="UI.navigate('#tones')">
            <span class="cta-icon">🎵</span>
            <div class="cta-text">
              <strong>Thai Tones</strong>
              <span>5 tones with pitch contours</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
          <div class="dash-cta-card" onclick="UI.navigate('#sentences')">
            <span class="cta-icon">📝</span>
            <div class="cta-text">
              <strong>Sentence Builder</strong>
              <span>Arrange words into sentences</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
          <div class="dash-cta-card" onclick="UI.navigate('#alphabet')">
            <span class="cta-icon cta-char">ก</span>
            <div class="cta-text">
              <strong>Thai Script</strong>
              <span>44 consonants, ${THAI_VOWELS.length} vowels, 4 tones</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
        </div>
      </div>
    `);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to learn?";
    if (hour < 17) return "Good afternoon! Let's practice.";
    if (hour < 21) return "Good evening! Time for Thai.";
    return "Late night study session? 🌙";
  }

  /* Route helpers — extract topic ID from hash */
  function routeGame() {
    const topicId = window.location.hash.split("/")[1];
    if (topicId) Game.start(topicId);
    else UI.navigate("#dashboard");
  }

  function routeFlashcard() {
    const topicId = window.location.hash.split("/")[1];
    if (topicId) Flashcard.start(topicId);
    else UI.navigate("#dashboard");
  }

  function routeSpeed() {
    const topicId = window.location.hash.split("/")[1];
    if (topicId) Speed.start(topicId);
    else UI.navigate("#dashboard");
  }

  /* Settings */
  function renderSettings() {
    const s = State.get();

    UI.render(`
      <div class="settings-screen">
        ${UI.navBar("settings")}

        <div class="section-header">
          <h1>⚙️ Settings</h1>
        </div>

        <div class="settings-list">
          <div class="setting-item">
            <label>Your Name</label>
            <input type="text" id="setting-name" value="${s.userName}" maxlength="20"
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
              <button class="btn btn-sm ${s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(true)">🌙 Dark</button>
              <button class="btn btn-sm ${!s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(false)">☀️ Light</button>
            </div>
          </div>

          <div class="setting-item stats-section">
            <label>Your Stats</label>
            <div class="stats-grid">
              <div class="mini-stat"><strong>${s.xp}</strong> XP</div>
              <div class="mini-stat"><strong>${s.streak}</strong> Day Streak</div>
              <div class="mini-stat"><strong>${State.getLevel().name}</strong> Level</div>
              <div class="mini-stat"><strong>${Object.keys(s.topicStats).length}</strong> Topics Played</div>
            </div>
          </div>

          <div class="setting-item danger-zone">
            <label>Danger Zone</label>
            <button class="btn btn-danger" onclick="App.confirmReset()">Reset All Progress</button>
          </div>
        </div>
      </div>
    `);
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

  function confirmReset() {
    if (confirm("This will erase ALL your progress, XP, and streaks. Are you sure?")) {
      State.resetAll();
      UI.toast("Progress reset", "info");
      renderOnboarding();
    }
  }

  return { init, completeOnboarding, updateName, setScript, setTheme, confirmReset };
})();

// Boot
document.addEventListener("DOMContentLoaded", () => App.init());
