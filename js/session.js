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
  const RESUME_WINDOW_MS = 2 * 60 * 60 * 1000;

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

  function isFullyMastered(pathwayId) {
    return !!State.getPathwayMasteryStatus(pathwayId).displayMastered;
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
      if (!isFullyMastered(pathways[i].id)) return pathways[i];
    }
    return pathways.find(p => !isFullyMastered(p.id)) || pathways[pathways.length - 1] || null;
  }

  function resolveCurrentPathway() {
    const pathways = getPathways();
    if (!pathways.length) return null;

    const lastActive = State.getLastActivePathway && State.getLastActivePathway();
    const lastPathway = lastActive ? getPathway(lastActive.pathwayId) : null;
    if (lastPathway && !isFullyMastered(lastPathway.id)) return lastPathway;

    return pathways.find(p => !isFullyMastered(p.id)) || pathways[pathways.length - 1] || null;
  }

  function makePlan(pathwayId) {
    const status = State.getPathwayMasteryStatus(pathwayId);
    return MODE_ORDER.map(mode => ({
      ...mode,
      rounds: roundsForMode(status, mode.id),
      completedRounds: 0,
      skipped: false,
      results: []
    }));
  }

  function roundsForMode(status, modeId) {
    const mode = status && status.modes && status.modes[modeId];
    const highAccuracy = mode ? Math.min(mode.highAccuracyRounds || 0, 3) : 0;
    const remaining = Math.max(0, 3 - highAccuracy);
    if (remaining >= 2) return 2;
    return 1;
  }

  function estimateMinutes(plan) {
    return Math.max(1, plan.reduce((sum, item) => sum + item.rounds, 0) * MINUTES_PER_ROUND);
  }

  function clonePlan(plan) {
    return (plan || []).map(item => ({
      ...item,
      results: Array.isArray(item.results) ? [...item.results] : []
    }));
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

  function buildSessionFromSaved(saved) {
    if (!saved || !saved.pathwayId) return null;
    const pathway = getPathway(saved.pathwayId);
    if (!pathway) return null;
    const topic = getTopic(pathway);
    if (!topic) return null;
    const plan = clonePlan(saved.plan);
    if (!plan.length) return null;
    return {
      pathway,
      topic,
      plan,
      activityIndex: Math.max(0, saved.currentActivityIndex || 0),
      currentRound: Math.max(0, saved.currentRound || 0),
      estimatedMinutes: estimateMinutes(plan),
      startedAt: saved.startedAt || Date.now(),
      resumed: true
    };
  }

  function isResumeFresh(saved, pathwayId) {
    if (!saved || saved.pathwayId !== pathwayId) return false;
    if (saved.status && saved.status !== "in-progress") return false;
    const last = saved.lastInteractionAt || saved.startedAt || 0;
    return last > 0 && Date.now() - last < RESUME_WINDOW_MS;
  }

  function persistCurrent() {
    if (!current || !State.saveActiveSession) return;
    State.saveActiveSession({
      pathwayId: current.pathway.id,
      plan: clonePlan(current.plan),
      currentActivityIndex: current.activityIndex,
      currentRound: current.currentRound,
      startedAt: current.startedAt || Date.now(),
      lastInteractionAt: Date.now(),
      status: "in-progress"
    });
  }

  function touchCurrent() {
    if (!current || !State.updateActiveSessionProgress) return;
    State.updateActiveSessionProgress(current.pathway.id, current.activityIndex, current.currentRound);
  }

  function start(pathwayId, options) {
    clearTransition();
    let session = null;
    const saved = State.getActiveSession && State.getActiveSession();
    if (!(options && options.forceRefresher) && isResumeFresh(saved, pathwayId)) {
      session = buildSessionFromSaved(saved);
    } else if (saved && State.clearActiveSession) {
      State.clearActiveSession();
    }
    if (!session) session = buildSession(pathwayId);
    if (!session) {
      UI.toast("That session is not available yet.", "info");
      UI.navigate("#learn");
      return;
    }
    current = session;
    if (State.setLastActivePathway) State.setLastActivePathway(pathwayId);
    if (!current.startedAt) current.startedAt = Date.now();
    persistCurrent();
    if (current.resumed) {
      UI.toast("Resuming where you left off.", "info");
      startCurrentActivity();
      return;
    }
    if (isFullyMastered(pathwayId) && !(options && options.forceRefresher)) {
      renderMasteredChoice();
      return;
    }
    renderIntro();
  }

  function startRefresher(pathwayId) {
    start(pathwayId, { forceRefresher: true });
  }

  function startNext() {
    const next = current
      ? findNextUnmastered(current.pathway && current.pathway.id)
      : resolveCurrentPathway();
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

  function renderMasteredChoice() {
    if (!current) return;
    const p = current.pathway;
    UI.render(`
      <div class="session-screen">
        <div class="session-card session-intro-card">
          <button class="btn btn-ghost session-top-back" onclick="Session.cancel()">← Home</button>
          <div class="session-hero-icon">🏆</div>
          <h1>You've mastered ${escapeHtml(p.label)}!</h1>
          <p class="session-description">What would you like to do?</p>
          <div class="session-choice-actions">
            <button class="btn btn-primary btn-lg" onclick="Session.startRefresher('${p.id}')">Quick refresher</button>
            <button class="btn btn-secondary btn-lg" onclick="Session.startNext()">Move to next pathway →</button>
            <button class="btn btn-ghost btn-lg" onclick="Session.cancel()">Cancel</button>
          </div>
        </div>
      </div>
    `);
  }

  function begin() {
    if (!current) return;
    current.activityIndex = 0;
    current.currentRound = 0;
    persistCurrent();
    startCurrentActivity();
  }

  function renderTransition(nextIndex, firstActivity) {
    if (!current) return;
    clearTransition();
    const next = current.plan[nextIndex];
    if (!next) {
      renderComplete();
      return;
    }
    const previous = current.plan[nextIndex - 1];
    const message = firstActivity || !previous || previous.skipped
      ? `Next: ${next.fullLabel}.`
      : previous.transition;
    UI.render(`
      <div class="session-screen">
        <div class="session-card session-transition-card">
          ${renderProgress(nextIndex)}
          <div class="session-transition-check">${firstActivity ? "→" : "✓"}</div>
          <h2>${escapeHtml(message)}</h2>
          <p>Activity ${nextIndex + 1} of ${current.plan.length} · ${next.rounds} round${next.rounds === 1 ? "" : "s"}</p>
          <p class="session-transition-hint">${State.get().pauseBetweenActivities ? "Paused until you're ready." : "Continuing automatically."}</p>
          <div class="round-actions session-transition-actions">
            <button class="btn btn-primary" onclick="Session.advanceNow()">${State.get().pauseBetweenActivities ? "Continue →" : "Skip →"}</button>
            <button class="btn btn-ghost" onclick="Session.skipActivity()">Skip activity</button>
            <button class="btn btn-secondary" onclick="Session.cancel()">Quit</button>
          </div>
        </div>
      </div>
    `);
    if (!State.get().pauseBetweenActivities) {
      transitionTimer = setTimeout(advanceNow, TRANSITION_MS);
    }
  }

  function advanceNow() {
    if (!current) return;
    clearTransition();
    touchCurrent();
    startCurrentActivity();
  }

  function startCurrentActivity() {
    if (!current) return;
    clearTransition();
    touchCurrent();
    const item = current.plan[current.activityIndex];
    if (!item) {
      renderComplete();
      return;
    }

    const options = {
      sessionMode: true,
      activityIndex: current.activityIndex,
      activityTotal: current.plan.length,
      roundIndex: current.currentRound,
      roundTotal: item.rounds,
      onComplete: result => handleModeComplete(result || {})
    };

    if (item.id === "patternPractice") {
      PatternPractice.start(current.topic.id, options);
    } else if (item.id === "listen") {
      ListenChoose.start(current.topic.id, options);
    } else if (item.id === "sentenceBuilder") {
      SentenceBuilder.start(current.pathway.id, options);
    }
  }

  function handleModeComplete(result) {
    if (!current) return;
    const item = current.plan[current.activityIndex];
    if (!item) {
      renderComplete();
      return;
    }

    if (result.unavailable) item.skipped = true;
    else {
      item.completedRounds++;
      item.results.push(result);
    }

    current.currentRound++;
    persistCurrent();
    if (!item.skipped && current.currentRound < item.rounds) {
      startCurrentActivity();
      return;
    }

    current.activityIndex++;
    current.currentRound = 0;
    persistCurrent();
    if (current.activityIndex >= current.plan.length) {
      renderComplete();
    } else {
      renderTransition(current.activityIndex, false);
    }
  }

  function skipActivity() {
    if (!current) return;
    clearTransition();
    const item = current.plan[current.activityIndex];
    if (item) item.skipped = true;
    current.activityIndex++;
    current.currentRound = 0;
    persistCurrent();
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
    if (State.clearActiveSession) State.clearActiveSession();
    const status = State.getPathwayMasteryStatus(current.pathway.id);
    const mastered = State.isPathwayMastered(current.pathway.id);
    const message = mastered
      ? "Pathway mastered! 🏆"
      : "1 more session to master this pathway";

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
    startRefresher,
    begin,
    advanceNow,
    skipActivity,
    modeProgressHtml,
    resolveCurrentPathway,
    cancel
  };
})();
