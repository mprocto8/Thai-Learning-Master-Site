/**
 * Learn - guided pattern pathways with strict per-mode progress tracking.
 */
const Pathways = (() => {
  const TIER_LABELS = {
    1: "Tier 1 &middot; Foundational",
    2: "Tier 2 &middot; Survival",
    3: "Tier 3 &middot; Daily interaction",
    4: "Tier 4 &middot; Refinement",
    5: "Tier 5 &middot; Natural Thai"
  };

  function show() {
    renderPathways();
  }

  function renderPathways() {
    UI.render(`
      <div class="pathways-screen">
        ${UI.navBar("learn")}

        <div class="section-header">
          <h1>&#128506;&#65039; Learn</h1>
          <p>Master Thai sentence patterns tier by tier</p>
        </div>

        <div class="pathway-tier-list">
          ${Object.keys(TIER_LABELS).map(tier => renderTier(Number(tier))).join("")}
        </div>
      </div>
    `);
  }

  function getPathwayContext(pathwayId) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    if (!pathway) return null;
    const topicId = pathway.topics && pathway.topics[0];
    const topic = TOPICS.find(t => t.id === topicId);
    return { pathway, topic, topicId };
  }

  function showDetails(pathwayId) {
    const ctx = getPathwayContext(pathwayId);
    if (!ctx || !ctx.topic) {
      UI.navigate("#learn");
      return;
    }
    const { pathway, topic } = ctx;
    const frame = topic.frame || {};
    const mastery = State.getPathwayMasteryStatus(pathway.id);

    UI.render(`
      <div class="pathway-detail-screen">
        ${UI.navBar("learn")}

        <div class="game-header pathway-detail-header">
          <button class="btn btn-ghost back-btn" onclick="UI.navigate('#learn')">&larr; Back</button>
          <span class="learn-status-badge ${mastery.displayMastered ? 'mastered' : 'in-progress'}">
            ${mastery.strictMastered ? 'Mastered ★' : mastery.legacyMastered ? 'Mastered ★ legacy' : 'In progress'}
          </span>
        </div>

        <section class="pathway-detail-hero">
          <div class="learn-pathway-tier">${TIER_LABELS[pathway.tier] || pathway.tierLabel}</div>
          <div class="pathway-detail-title-row">
            <span class="pathway-icon">${pathway.emoji}</span>
            <h1>${pathway.label}</h1>
          </div>
          <p>${pathway.description}</p>
        </section>

        <section class="pathway-detail-frame">
          <h2>${topic.label}</h2>
          ${frame.script ? `<div class="pathway-detail-script">${frame.script}</div>` : ''}
          ${frame.romanized ? `<div class="pathway-detail-romanized">${frame.romanized}</div>` : ''}
          ${frame.english ? `<div class="pathway-detail-english">${frame.english}</div>` : ''}
          ${frame.explanation ? `<p>${frame.explanation}</p>` : ''}
        </section>

        <section class="pathway-detail-progress">
          <h2>Mastery Progress</h2>
          <div class="learn-mode-progress">
            ${renderModeProgress("Listen", mastery.modes.listen)}
            ${renderModeProgress("Pattern Practice", mastery.modes.patternPractice)}
            ${renderModeProgress("Sentence Builder", mastery.modes.sentenceBuilder)}
          </div>
        </section>

        <section class="pathway-detail-actions">
          <button class="btn btn-secondary" onclick="UI.navigate('#listen/${topic.id}')">Practice Listen</button>
          <button class="btn btn-primary" onclick="UI.navigate('#pattern/${topic.id}')">Practice Pattern</button>
          <button class="btn btn-secondary" onclick="UI.navigate('#sentences')">Practice Sentences</button>
          <button class="btn btn-secondary" onclick="Pathways.replay('${pathway.id}')">Restart Pathway</button>
        </section>
      </div>
    `);
  }

  function renderTier(tier) {
    const pathways = PATHWAYS.filter(p => p.tier === tier);
    if (!pathways.length) return "";
    return `
      <section class="pathway-tier">
        <h2 class="pathway-tier-title">${TIER_LABELS[tier]}</h2>
        <div class="pathway-cards">
          ${pathways.map(renderPathwayCard).join("")}
        </div>
      </section>
    `;
  }

  function renderPathwayCard(pathway) {
    const prog = State.getPathwayProgress(pathway.id);
    const mastery = State.getPathwayMasteryStatus(pathway.id);
    const topicId = pathway.topics && pathway.topics[0];
    const topic = TOPICS.find(t => t.id === topicId);
    const isMastered = prog.isComplete;
    const topicStats = topicId ? State.get().topicStats[topicId] : null;
    const hasProgress = prog.mastered > 0 || !!(topicStats && topicStats.played > 0);
    const status = mastery.strictMastered
      ? "Mastered ★"
      : mastery.legacyMastered
        ? "Mastered ★ legacy"
        : hasProgress ? "In progress" : "Not started";
    const statusClass = isMastered ? "mastered" : hasProgress ? "in-progress" : "not-started";
    const route = topic && (topic.type || "vocabulary") === "pattern" ? `#pattern/${topic.id}` : `#game/${topicId}`;

    return `
      <article class="pathway-card learn-pathway-card ${statusClass}">
        <div class="learn-pathway-topline">
          <span class="learn-pathway-tier">${TIER_LABELS[pathway.tier] || pathway.tierLabel}</span>
          <span class="learn-status-badge ${statusClass}">${status}</span>
        </div>

        <div class="learn-pathway-main">
          <span class="pathway-icon">${pathway.emoji}</span>
          <div class="pathway-info">
            <h3>${pathway.label}</h3>
            <p class="pathway-desc-short">${pathway.description}</p>
          </div>
        </div>

        <div class="pathway-progress-row">
          <div class="pathway-progress-bar">
            <div class="pathway-progress-fill" style="width:${Math.round(prog.percentComplete * 100)}%"></div>
          </div>
          <span class="pathway-progress-text">${prog.mastered}/${prog.total}</span>
        </div>

        <div class="learn-mode-progress">
          ${renderModeProgress("Listen", mastery.modes.listen)}
          ${renderModeProgress("Pattern Practice", mastery.modes.patternPractice)}
          ${renderModeProgress("Sentence Builder", mastery.modes.sentenceBuilder)}
        </div>

        <div class="learn-pathway-actions">
          ${topic ? `<button class="btn btn-sm btn-secondary" onclick="UI.navigate('#topic/${topic.id}')">Details</button>` : ""}
          ${isMastered ? `
            <button class="btn btn-sm btn-secondary" onclick="Pathways.replay('${pathway.id}')">Restart</button>
          ` : `
            <button class="btn btn-sm btn-primary" onclick="UI.navigate('${route}')">${hasProgress ? "Continue" : "Start"} &rarr;</button>
          `}
        </div>
      </article>
    `;
  }

  function renderModeProgress(label, mode) {
    const rounds = mode.highAccuracyRounds;
    const capped = Math.min(rounds, mode.requiredRounds);
    const percent = Math.round((capped / mode.requiredRounds) * 100);
    const statusClass = mode.mastered ? "mastered" : rounds > 0 ? "in-progress" : "not-started";
    return `
      <div class="learn-mode-row ${statusClass}">
        <div class="learn-mode-label">${label}</div>
        <div class="learn-mode-bar" aria-hidden="true">
          <div class="learn-mode-fill" style="width:${percent}%"></div>
        </div>
        <div class="learn-mode-percent">${percent}%</div>
        <div class="learn-mode-rounds">(${rounds}/${mode.requiredRounds} rounds @ 80%+)</div>
      </div>
    `;
  }

  function replay(pathwayId) {
    const pathway = PATHWAYS.find(p => p.id === pathwayId);
    if (!pathway) return;
    const message = `Restart ${pathway.label}? Your mastery progress for this pathway will reset, but XP and streak are kept.`;
    if (!confirm(message)) return;
    State.resetPathwayProgress(pathwayId);
    UI.toast(`${pathway.label} restarted`, "info");
    renderPathways();
  }

  function toggle() {
    renderPathways();
  }

  function claimBadge(pathwayId) {
    const p = PATHWAYS.find(pw => pw.id === pathwayId);
    if (!p) return;
    State.earnBadge(pathwayId);
    State.addXP(200);
    UI.celebrate(p.badge.label, p.badge.emoji);
    setTimeout(() => renderPathways(), 500);
  }

  return { show, showDetails, toggle, replay, claimBadge };
})();
