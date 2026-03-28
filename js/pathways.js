/**
 * Pathways — guided learning paths with progress tracking and badges.
 */
const Pathways = (() => {
  let expandedId = null;

  function show() {
    renderPathways();
  }

  function renderPathways() {
    const badges = State.get().badges || [];

    UI.render(`
      <div class="pathways-screen">
        ${UI.navBar("pathways")}

        <div class="section-header">
          <h1>🗺️ Learning Pathways</h1>
          <p>Follow guided paths to build real-world Thai skills</p>
        </div>

        ${badges.length > 0 ? `
          <div class="badge-shelf">
            <h3>Your Badges</h3>
            <div class="badge-list">
              ${badges.map(id => {
                const p = PATHWAYS.find(pw => pw.id === id);
                return p ? `<div class="badge-item"><span class="badge-emoji">${p.badge.emoji}</span><span class="badge-label">${p.badge.label}</span></div>` : '';
              }).join("")}
            </div>
          </div>
        ` : ''}

        <div class="pathway-cards">
          ${PATHWAYS.map(p => {
            const prog = State.getPathwayProgress(p.id);
            const isExpanded = expandedId === p.id;
            const hasBadge = State.hasBadge(p.id);

            return `
              <div class="pathway-card ${isExpanded ? 'expanded' : ''} ${hasBadge ? 'completed' : ''}">
                <div class="pathway-card-header" onclick="Pathways.toggle('${p.id}')">
                  <div class="pathway-icon">${p.emoji}</div>
                  <div class="pathway-info">
                    <h3>${p.label} ${hasBadge ? `<span class="pathway-badge-inline">${p.badge.emoji}</span>` : ''}</h3>
                    <p class="pathway-desc-short">${p.description.slice(0, 60)}${p.description.length > 60 ? '...' : ''}</p>
                    <div class="pathway-progress-row">
                      <div class="pathway-progress-bar">
                        <div class="pathway-progress-fill" style="width:${prog.percentComplete * 100}%"></div>
                      </div>
                      <span class="pathway-progress-text">${Math.round(prog.percentComplete * 100)}%</span>
                    </div>
                  </div>
                  <span class="pathway-chevron">${isExpanded ? '▼' : '▶'}</span>
                </div>

                ${isExpanded ? `
                  <div class="pathway-detail">
                    <p class="pathway-desc-full">${p.description}</p>
                    <div class="pathway-meta">
                      <span>~${p.estimatedDays} days</span>
                      <span>${prog.mastered}/${prog.total} mastered</span>
                    </div>

                    ${!p.usesAlphabet ? `
                      <div class="pathway-topics">
                        ${p.topics.map(topicId => {
                          const t = TOPICS.find(tp => tp.id === topicId);
                          if (!t) return '';
                          const mastery = State.getTopicMastery(topicId);
                          const done = mastery >= 0.7;
                          return `
                            <div class="pathway-topic-row ${done ? 'done' : ''}">
                              <span class="pathway-topic-check">${done ? '✅' : '⬜'}</span>
                              <span class="pathway-topic-emoji">${t.emoji}</span>
                              <span class="pathway-topic-name">${t.label}</span>
                              <span class="pathway-topic-mastery">${Math.round(mastery * 100)}%</span>
                              ${!done ? `<button class="btn btn-xs btn-primary" onclick="UI.navigate('#game/${topicId}')">Practice</button>` : ''}
                            </div>
                          `;
                        }).join("")}
                      </div>
                    ` : `
                      <div class="pathway-alphabet-cta">
                        <p>Practice Thai consonants, vowels, and tone marks</p>
                        <button class="btn btn-primary" onclick="UI.navigate('#alphabet')">Go to Script</button>
                      </div>
                    `}

                    <div class="pathway-milestone">
                      <h4>🏁 Milestone</h4>
                      <p>${p.milestone.label}</p>
                    </div>

                    ${prog.isComplete && !hasBadge ? `
                      <button class="btn btn-primary btn-lg pathway-claim" onclick="Pathways.claimBadge('${p.id}')">
                        🏆 Claim Badge: ${p.badge.label}
                      </button>
                    ` : ''}

                    ${prog.nextTopic && !p.usesAlphabet ? `
                      <button class="btn btn-primary pathway-next" onclick="UI.navigate('#game/${prog.nextTopic}')">
                        Continue: ${TOPICS.find(t => t.id === prog.nextTopic)?.label || prog.nextTopic} →
                      </button>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `);
  }

  function toggle(pathwayId) {
    expandedId = expandedId === pathwayId ? null : pathwayId;
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

  return { show, toggle, claimBadge };
})();
