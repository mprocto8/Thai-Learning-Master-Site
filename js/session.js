/**
 * Guided Session controller.
 *
 * A session walks one pathway through Pattern Practice, Listen & Choose, and
 * Sentence Builder. The mode integrations are additive: standalone launches
 * keep their own completion screens, while session launches return here.
 */
const Session = (() => {
  const MODE_ORDER = [
    {
      id: "patternPractice",
      label: "Pattern",
      fullLabel: "Pattern Practice",
      icon: "🧩",
      transition: "✓ Pattern locked in. Next: train your ear."
    },
    {
      id: "listen",
      label: "Listen",
      fullLabel: "Listen & Choose",
      icon: "🎧",
      transition: "✓ Listening done. Now build full sentences."
    },
    {
      id: "sentenceBuilder",
      label: "Build",
      fullLabel: "Sentence Builder",
      icon: "📝",
      transition: ""
    }
  ];
  const TRANSITION_MS = 1500;
  const MINUTES_PER_ROUND = 2;

  let current = null;
  let transitionTimer = null;

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPathways() {
    return (typeof PATHWAYS !== "undefined" ? PATHWAYS : [])
      .filter(p => !p.usesAlphabet && p.topics && p.topics.length)
      .sort((a, b) => (a.tier - b.tier) || PATHWAYS.indexOf(a) - PATHWAYS.indexOf(b));
  }

  function getPathway(pathwayId) {
    return getPathways().find(p => p.id === pathwayId) || null;
  }

  function getTopic(pathway) {
    const topicId = pathway && pathway.topics && pathway.topics[0];
    return topicId ? TOPICS.find(t => t.id === topicId) || null : null;
  }

  function findNextUnmastered(afterPathwayId) {
    const pathways = getPathways();
    const startIndex = afterPathwayId
      ? Math.max(0, pathways.findIndex(p => p.id === afterPathwayId) + 1)
      : 0;
    for (let i = startIndex; i < pathways.length; i++) {
      if (!State.isPathwayMastered(pathways[i].id)) return pathways[i];
    }
    return pathways.find(p => !State.isPathwayMastered(p.id)) || pathways[0] || null;
  }

  function makePlan(pathwayId) {
    return MODE_ORDER.map(mode => ({
      ...mode,
      rounds: 1,
      completedRounds: 0,
      skipped: false,
      results: []
    }));
  }

  function estimateMinutes(plan) {
    return Math.max(1, plan.reduce((sum, item) => sum + item.rounds, 0) * MINUTES_PER_ROUND);
  }

  function buildSession(pathwayId) {
    const pathway = getPathway(pathwayId);
    if (!pathway) return null;
    const topic = getTopic(pathway);
    if (!topic) return null;
    const plan = makePlan(pathway.id);
    return {
      pathway,
      topic,
      plan,
      activityIndex: 0,
      currentRound: 0,
      estimatedMinutes: estimateMinutes(plan)
    };
  }

  function start(pathwayId) {
    clearTransition();
    const session = buildSession(pathwayId);
    if (!session) {
      UI.toast("That session is not available yet.", "info");
      UI.navigate("#learn");
      return;
    }
    current = session;
    renderIntro();
  }

  function startNext() {
    const next = findNextUnmastered(current && current.pathway && current.pathway.id);
    if (!next) {
      UI.navigate("#learn");
      return;
    }
    UI.navigate("#session/" + next.id);
  }

  function renderProgress(activeIndex) {
    return `
      <div class="session-progress" aria-label="Session progress">
        ${MODE_ORDER.map((mode, i) => `
          <span class="session-progress-dot ${i < activeIndex ? "done" : ""} ${i === activeIndex ? "active" : ""}"></span>
        `).join("")}
      </div>
    `;
  }

  function renderIntro() {
    if (!current) return;
    const p = current.pathway;
    const topic = current.topic;
    UI.render(`
      <div class="session-screen">
        <div class="session-card session-intro-card">
          <button class="btn btn-ghost session-top-back" onclick="Session.cancel()">← Home</button>
          <div class="session-hero-icon">${p.emoji || topic.emoji || "🧭"}</div>
          <div class="session-kicker">${escapeHtml(p.tierLabel || ("Tier " + p.tier))}</div>
          <h1>${escapeHtml(p.label)}</h1>
          <p class="session-description">${escapeHtml(p.description || "Build this pattern across speaking, listening, and sentence construction.")}</p>
          <div class="session-meta-row">
            <span>3 activities</span>
            <span>~${current.estimatedMinutes} min</span>
          </div>
          <div class="session-plan-list">
            ${current.plan.map(item => `
              <div class="session-plan-item">
                <span>${item.icon}</span>
                <strong>${escapeHtml(item.fullLabel)}</strong>
                <small>${item.rounds} round${item.rounds === 1 ? "" : "s"}</small>
              </div>
            `).join("")}
          </div>
          <button class="btn btn-primary btn-lg session-primary" onclick="Session.begin()">Begin →</button>
        </div>
      </div>
    `);
  }

  function begin() {
    if (!current) return;
    current.activityIndex = 0;
    current.currentRound = 0;
    renderTransition(0, true);
  }

  function renderTransition(nextIndex, firstActivity) {
    if (!current) return;
    clearTransition();
    const next = current.plan[nextIndex];
    if (!next) {
      renderComplete();
      return;
    }
    const message = firstActivity
      ? `First up: ${next.fullLabel}.`
      : current.plan[nextIndex - 1].transition;
    UI.render(`
      <div class="session-screen">
        <div class="session-card session-transition-card">
          ${renderProgress(nextIndex)}
          <div class="session-transition-check">${firstActivity ? "→" : "✓"}</div>
          <h2>${escapeHtml(message)}</h2>
          <p>Activity ${nextIndex + 1} of ${current.plan.length} · ${next.rounds} round${next.rounds === 1 ? "" : "s"}</p>
          <div class="round-actions session-transition-actions">
            <button class="btn btn-primary" onclick="Session.advanceNow()">Skip →</button>
            <button class="btn btn-ghost" onclick="Session.skipActivity()">Skip activity</button>
            <button class="btn btn-secondary" onclick="Session.cancel()">Quit</button>
          </div>
        </div>
      </div>
    `);
    transitionTimer = setTimeout(advanceNow, TRANSITION_MS);
  }

  function advanceNow() {
    if (!current) return;
    clearTransition();
    // Skeleton checkpoint: mark the activity as done and keep moving. Later
    // commits replace this with calls into the actual modes.
    const item = current.plan[current.activityIndex];
    if (item) {
      item.completedRounds = item.rounds;
      current.activityIndex++;
      renderTransition(current.activityIndex, false);
    } else {
      renderComplete();
    }
  }

  function skipActivity() {
    if (!current) return;
    clearTransition();
    const item = current.plan[current.activityIndex];
    if (item) item.skipped = true;
    current.activityIndex++;
    renderTransition(current.activityIndex, false);
  }

  function modeProgressHtml(activityIndex, roundIndex, roundTotal) {
    return `
      <div class="session-mode-pill">
        <span>Activity ${activityIndex + 1} of ${MODE_ORDER.length}</span>
        <span>Round ${roundIndex + 1} of ${roundTotal}</span>
      </div>
    `;
  }

  function renderMasteryLine(status) {
    const modes = status.modes || {};
    const count = modeId => Math.min(((modes[modeId] || {}).highAccuracyRounds || 0), 3);
    return `Pattern ${count("patternPractice")}/3 · Listen ${count("listen")}/3 · Build ${count("sentenceBuilder")}/3`;
  }

  function renderComplete() {
    if (!current) return;
    clearTransition();
    const status = State.getPathwayMasteryStatus(current.pathway.id);
    const mastered = State.isPathwayMastered(current.pathway.id);
    const remainingModes = Object.keys(status.modes || {})
      .filter(id => !status.modes[id].mastered)
      .length;
    const message = mastered
      ? "Pathway mastered! 🏆"
      : `${Math.max(1, remainingModes)} more session${remainingModes === 1 ? "" : "s"} to master this pathway`;

    UI.render(`
      <div class="session-screen">
        <div class="session-card session-complete-card">
          ${renderProgress(current.plan.length)}
          <div class="session-hero-icon">🎉</div>
          <h1>Session complete!</h1>
          <p class="session-description">${escapeHtml(current.pathway.label)}</p>
          <div class="session-checks">
            ${current.plan.map(item => `
              <span class="${item.skipped ? "skipped" : item.completedRounds > 0 ? "done" : ""}">
                ${escapeHtml(item.label)} ${item.skipped ? "–" : item.completedRounds > 0 ? "✓" : ""}
              </span>
            `).join("")}
          </div>
          <div class="session-mastery-line">${renderMasteryLine(status)}</div>
          <div class="session-status-message">${escapeHtml(message)}</div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="Session.startNext()">Continue: next pathway →</button>
            <button class="btn btn-secondary" onclick="Session.cancel()">Done for today</button>
          </div>
        </div>
      </div>
    `);
  }

  function clearTransition() {
    if (transitionTimer) {
      clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function cancel() {
    clearTransition();
    current = null;
    UI.navigate("#home");
  }

  return {
    start,
    startNext,
    begin,
    advanceNow,
    skipActivity,
    modeProgressHtml,
    cancel
  };
})();
