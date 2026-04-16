/**
 * App entry point — dashboard, onboarding, settings, routing.
 */
const App = (() => {
  let _dashScrollY = 0;

  function init() {
    State.load();
    UI.applyTheme();

    // Register routes
    UI.registerRoute("#dashboard", renderDashboard);
    UI.registerRoute("#pathways", () => Pathways.show());
    UI.registerRoute("#practice", () => PracticeHub.show());
    UI.registerRoute("#game", routeGame);
    UI.registerRoute("#flashcard", routeFlashcard);
    UI.registerRoute("#speed", routeSpeed);
    UI.registerRoute("#alphabet", () => Alphabet.show());
    UI.registerRoute("#clock", () => { Clock.show(); UI.setCleanup(() => Clock.cleanup()); });
    UI.registerRoute("#time-game", () => TimeGame.show());
    UI.registerRoute("#tones", () => ToneTrainer.show());
    UI.registerRoute("#sentences", () => SentenceBuilder.show());
    UI.registerRoute("#settings", renderSettings);
    UI.registerRoute("#login", renderLogin);

    // Initialize Supabase and attempt to restore a session. Non-blocking —
    // the app boots immediately in guest mode; the header bar updates once
    // the session restore finishes.
    if (typeof SupabaseClient !== "undefined") {
      SupabaseClient.init();
      State.restoreSession().then(loggedIn => {
        if (loggedIn) {
          // Re-render the current route so the header bar appears.
          UI.handleRoute();
        }
      }).catch(e => console.warn("[App] session restore failed:", e));
    }

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
          const pair = topic.pairs[parseInt(idx)];
          if (pair) pairs.push(pair);
        }
      }
    }
    return pairs;
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
    if (!bestTopic) return null;
    const seed = new Date().toDateString();
    const idx = hashString(seed) % bestTopic.pairs.length;
    return { pair: bestTopic.pairs[idx], topic: bestTopic };
  }

  function renderDashboard() {
    const s = State.get();
    const level = State.getLevel();
    const nextLevel = State.getNextLevel();
    const progress = State.getLevelProgress();
    const streakAtRisk = State.isStreakAtRisk();
    const streakUrgent = State.isStreakUrgent();
    const badges = s.badges || [];
    const topicView = s.topicView || 'grid';
    const mistakePairs = getMistakePairs();
    const wotd = getWordOfTheDay();

    // Find smart suggestion: lowest mastery topic from active pathway, or last played
    let suggestedTopic = null;
    let suggestReason = "";

    // Try pathway-based suggestion first
    for (const p of PATHWAYS) {
      if (p.usesAlphabet) continue;
      const prog = State.getPathwayProgress(p.id);
      if (prog.nextTopic) {
        const t = TOPICS.find(tp => tp.id === prog.nextTopic);
        if (t) {
          suggestedTopic = t;
          suggestReason = `Next in ${p.label}`;
          break;
        }
      }
    }

    // Fallback: last played
    if (!suggestedTopic) {
      let lastTime = 0;
      for (const t of TOPICS) {
        const ts = s.topicStats[t.id];
        if (ts && ts.lastPlayed > lastTime) {
          suggestedTopic = t;
          lastTime = ts.lastPlayed;
          suggestReason = "Continue where you left off";
        }
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

        <div class="dash-stats">
          <div class="stat-card streak-card ${streakUrgent ? 'urgent' : streakAtRisk ? 'at-risk' : ''}">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${s.streak}</div>
            <div class="stat-label">Day Streak</div>
            ${streakUrgent ? '<div class="streak-warning urgent">🚨 Streak expires soon! Play now!</div>' :
              streakAtRisk ? '<div class="streak-warning">⚠️ Play today to keep your streak!</div>' : ''}
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

        ${wotd ? `
          <div class="wotd-card" onclick="App.flipWotd()" id="wotd-card" style="background:var(--surface-1);border-radius:12px;padding:1.2rem;text-align:center;margin-bottom:1rem;cursor:pointer;border:1px solid var(--accent);transition:transform 0.3s">
            <div id="wotd-front">
              <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);margin-bottom:0.3rem">Word of the Day</div>
              <div style="font-size:1.8rem;color:var(--accent)">${wotd.pair.script}</div>
              <div style="font-size:1rem;color:var(--text-muted)">${wotd.pair.romanized}</div>
              <div style="font-size:0.95rem;margin-top:0.3rem">${wotd.pair.english}</div>
              ${wotd.pair.example ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem;font-style:italic">${wotd.pair.example.thai} — ${wotd.pair.example.english}</div>` : ''}
            </div>
            <div id="wotd-back" style="display:none">
              <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.5rem">
                <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.flipWotd()">🔁 New word</button>
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();UI.navigate('#game/${wotd.topic.id}')">→ Study ${wotd.topic.label}</button>
              </div>
            </div>
          </div>
        ` : ''}

        ${suggestedTopic ? `
          <div class="continue-card" onclick="UI.navigate('#game/${suggestedTopic.id}')">
            <span class="continue-emoji">${suggestedTopic.emoji}</span>
            <div class="continue-text">
              <strong>${suggestReason}</strong>
              <span>${suggestedTopic.label}</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
        ` : ''}

        <div class="dash-quick-actions">
          <button class="btn btn-primary dash-quick5" onclick="PracticeHub.quick5()">🎲 Quick 5</button>
          <button class="btn btn-secondary" onclick="UI.navigate('#practice')">⚡ All Topics</button>
          <button class="btn btn-secondary" onclick="UI.navigate('#pathways')">🗺️ Pathways</button>
        </div>

        ${mistakePairs.length > 0 ? `
          <div style="text-align:center;margin-bottom:1rem">
            <button class="btn" style="background:var(--danger,#ef4444);color:#fff;width:100%;max-width:400px" onclick="App.reviewMistakes()">📚 Review Mistakes (${mistakePairs.length} cards)</button>
          </div>
        ` : ''}

        ${badges.length > 0 ? `
          <div class="badge-shelf dash-badges">
            <h3 class="section-title">Badges</h3>
            <div class="badge-list">
              ${badges.map(id => {
                const p = PATHWAYS.find(pw => pw.id === id);
                return p ? `<div class="badge-item"><span class="badge-emoji">${p.badge.emoji}</span><span class="badge-label">${p.badge.label}</span></div>` : '';
              }).join("")}
            </div>
          </div>
        ` : ''}

        <div style="display:flex;align-items:center;justify-content:space-between">
          <h2 class="section-title" style="margin:0">Topics</h2>
          <div style="display:flex;gap:0.25rem">
            <button class="btn btn-sm ${topicView === 'grid' ? 'btn-active' : ''}" onclick="App.setTopicView('grid')" title="Grid view">⊞ Grid</button>
            <button class="btn btn-sm ${topicView === 'list' ? 'btn-active' : ''}" onclick="App.setTopicView('list')" title="List view">☰ List</button>
          </div>
        </div>

        ${topicView === 'grid' ? `
        <div class="topic-grid">
          ${TOPICS.slice(0, 12).map(t => {
            const mastery = State.getTopicMastery(t.id);
            const ts = s.topicStats[t.id];
            return `
              <div class="topic-card">
                <div class="topic-card-header">
                  <div class="topic-ring">${UI.progressRing(mastery, 44, 3)}</div>
                  <span class="topic-emoji">${t.emoji}</span>
                  ${t.situation ? '<span class="situation-badge">SITUATION</span>' : ''}
                  ${t.essential ? '<span class="essential-badge">CORE</span>' : ''}
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
        ` : `
        <div style="display:flex;flex-direction:column;gap:2px;margin-top:0.5rem">
          ${TOPICS.slice(0, 12).map(t => {
            const mastery = State.getTopicMastery(t.id);
            return `
              <div style="display:flex;align-items:center;gap:0.5rem;min-height:48px;padding:0.4rem 0.6rem;background:var(--surface-1);border-radius:8px">
                <span style="font-size:1.2rem;width:2rem;text-align:center">${t.emoji}</span>
                <span style="flex:1;font-size:0.9rem;font-weight:500">${t.label}</span>
                <span style="font-size:0.8rem;color:var(--text-muted);min-width:2.5rem;text-align:right">${Math.round(mastery * 100)}%</span>
                <button class="btn btn-sm btn-primary" onclick="UI.navigate('#game/${t.id}')" style="padding:0.2rem 0.5rem;font-size:0.75rem">Match</button>
                <button class="btn btn-sm btn-secondary" onclick="UI.navigate('#flashcard/${t.id}')" style="padding:0.2rem 0.5rem;font-size:0.75rem">Cards</button>
                <button class="btn btn-sm btn-accent" onclick="UI.navigate('#speed/${t.id}')" style="padding:0.2rem 0.5rem;font-size:0.75rem">⚡</button>
              </div>
            `;
          }).join("")}
        </div>
        `}

        ${TOPICS.length > 12 ? `
          <div class="dash-see-all">
            <button class="btn btn-secondary" onclick="UI.navigate('#practice')">See all ${TOPICS.length} topics →</button>
          </div>
        ` : ''}

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
              <span>44 consonants, ${typeof THAI_VOWELS !== 'undefined' ? THAI_VOWELS.length : 21} vowels, 4 tones</span>
            </div>
            <span class="continue-arrow">→</span>
          </div>
        </div>
      </div>
    `);

    // QOL 6: restore scroll position
    const savedY = _dashScrollY;
    _dashScrollY = 0;
    if (savedY > 0) {
      setTimeout(() => window.scrollTo(0, savedY), 50);
    }
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
    else UI.navigate("#dashboard");
  }

  function routeFlashcard() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) Flashcard.start(topicId);
    else UI.navigate("#dashboard");
  }

  function routeSpeed() {
    const topicId = (window.location.hash.split("/")[1] || "").split("?")[0];
    if (topicId) Speed.start(topicId);
    else UI.navigate("#dashboard");
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
              <button class="btn btn-sm ${s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(true)">Dark</button>
              <button class="btn btn-sm ${!s.darkMode ? 'btn-active' : ''}" onclick="App.setTheme(false)">Light</button>
            </div>
          </div>

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

          <div class="login-alt">
            ${isSignup
              ? `<span>Already have an account?</span> <a href="#login" onclick="event.preventDefault();App.switchLoginMode('login')">Sign in</a>`
              : `<span>New here?</span> <a href="#login?signup" onclick="event.preventDefault();App.switchLoginMode('signup')">Create an account</a>`}
          </div>

          <div class="login-guest">
            <a href="#dashboard" onclick="event.preventDefault();App.continueAsGuest()">Continue as guest →</a>
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
      UI.navigate("#dashboard");
    } catch (e) {
      const msg = (e && e.message) ? e.message : "Something went wrong.";
      if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; }
      if (btn) { btn.disabled = false; btn.textContent = mode === "signup" ? "Create account" : "Sign in"; }
    }
  }

  function continueAsGuest() {
    UI.navigate("#dashboard");
  }

  async function confirmLogout() {
    if (!confirm("Sign out? Your progress will stay safe in your account, and this device will revert to guest mode.")) return;
    try { await State.logout(); } catch (e) { console.warn(e); }
    UI.toast("Signed out", "info");
    UI.handleRoute();
  }

  return {
    init, completeOnboarding, updateName, setScript, setTheme,
    confirmReset, reviewMistakes, flipWotd, setTopicView, saveDashScroll,
    // Auth
    submitLogin, switchLoginMode, continueAsGuest, confirmLogout
  };
})();

// Boot
document.addEventListener("DOMContentLoaded", () => App.init());
