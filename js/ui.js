/**
 * UI utilities — routing, rendering helpers, animations, modals.
 */
const UI = (() => {
  const app = () => document.getElementById("app");

  /* Simple hash-based router */
  let _routes = {};

  function registerRoute(hash, renderFn) {
    _routes[hash] = renderFn;
  }

  function navigate(hash) {
    // QOL 6: save scroll position when leaving dashboard
    if ((window.location.hash || "#dashboard") === "#dashboard" && typeof App !== "undefined") {
      App.saveDashScroll();
    }
    window.location.hash = hash;
  }

  function init() {
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  /* Rendering */
  function render(html) {
    app().innerHTML = html;
    app().scrollTop = 0;
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  /* Confetti / celebration */
  function celebrate(levelName, emoji) {
    const overlay = document.createElement("div");
    overlay.className = "celebrate-overlay";
    overlay.innerHTML = `
      <div class="celebrate-content">
        <div class="celebrate-burst"></div>
        <div class="celebrate-emoji">${emoji}</div>
        <h2>Level Up!</h2>
        <p>You're now a <strong>${levelName}</strong></p>
        <button class="btn btn-primary" onclick="this.closest('.celebrate-overlay').remove()">Amazing!</button>
      </div>
      ${generateConfettiHTML()}
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add("active"), 10);
  }

  function generateConfettiHTML() {
    const colors = ["#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899", "#14b8a6"];
    let html = "";
    for (let i = 0; i < 50; i++) {
      const color = colors[i % colors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const size = 6 + Math.random() * 8;
      html += `<div class="confetti-piece" style="left:${left}%;animation-delay:${delay}s;background:${color};width:${size}px;height:${size}px;"></div>`;
    }
    return html;
  }

  /* Toast notification */
  function toast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2000);
  }

  /* XP popup */
  function showXP(amount, x, y) {
    const el = document.createElement("div");
    el.className = "xp-popup";
    el.textContent = `+${amount} XP`;
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("animate"));
    setTimeout(() => el.remove(), 800);
  }

  /* Time formatting */
  function timeAgo(timestamp) {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /* Cleanup hook — called before each route change */
  let _cleanupFn = null;
  function setCleanup(fn) { _cleanupFn = fn; }

  function handleRoute() {
    // Run cleanup from previous route
    if (_cleanupFn) { _cleanupFn(); _cleanupFn = null; }
    const hash = window.location.hash || "#dashboard";
    const baseHash = hash.split("/")[0].split("?")[0];
    const route = _routes[hash] || _routes[baseHash];
    if (route) {
      route();
    } else {
      _routes["#dashboard"]();
    }
  }

  /* Nav bar — 5 sections: Home, Pathways, Practice, Script, Settings.
     When logged in, a compact header bar is rendered above. */
  function navBar(active = "") {
    return `
      ${headerBar()}
      <nav class="nav-bar">
        <button class="nav-btn ${active === "dashboard" ? "active" : ""}" onclick="UI.navigate('#dashboard')">
          <span class="nav-icon">🏠</span><span class="nav-label">Home</span>
        </button>
        <button class="nav-btn ${active === "pathways" ? "active" : ""}" onclick="UI.navigate('#pathways')">
          <span class="nav-icon">🗺️</span><span class="nav-label">Pathways</span>
        </button>
        <button class="nav-btn ${active === "practice" ? "active" : ""}" onclick="UI.navigate('#practice')">
          <span class="nav-icon">⚡</span><span class="nav-label">Practice</span>
        </button>
        <button class="nav-btn ${active === "alphabet" ? "active" : ""}" onclick="UI.navigate('#alphabet')">
          <span class="nav-icon">ก</span><span class="nav-label">Script</span>
        </button>
        <button class="nav-btn ${active === "settings" ? "active" : ""}" onclick="UI.navigate('#settings')">
          <span class="nav-icon">⚙️</span><span class="nav-label">Settings</span>
        </button>
      </nav>
    `;
  }

  /* Logged-in header bar — avatar, name, XP progress, streak, logout. */
  function headerBar() {
    if (!State.isLoggedIn()) return "";
    const s = State.get();
    const name = s.userName || "Learner";
    const initial = (name.trim()[0] || "?").toUpperCase();
    const progress = State.getLevelProgress();
    const level = State.getLevel();
    return `
      <div class="user-header">
        <div class="user-header-identity">
          <div class="user-avatar" title="${level.name} — ${s.xp} XP">${initial}</div>
          <div class="user-header-info">
            <div class="user-header-name">${name}</div>
            <div class="user-header-xp">
              <div class="user-header-xp-fill" style="width:${progress * 100}%"></div>
            </div>
          </div>
        </div>
        <div class="user-header-meta">
          <span class="user-header-streak" title="${s.streak}-day streak">🔥 ${s.streak}</span>
          <button class="btn btn-xs btn-ghost user-header-logout" onclick="App.confirmLogout()" title="Sign out">Sign out</button>
        </div>
      </div>
    `;
  }

  /* Sync status pill — top-right. Fades after "saved". */
  let _syncPillEl = null;
  let _syncPillTimer = null;
  function showSyncStatus(status) {
    if (!_syncPillEl) {
      _syncPillEl = document.createElement("div");
      _syncPillEl.className = "sync-pill";
      document.body.appendChild(_syncPillEl);
    }
    _syncPillEl.classList.remove("syncing", "saved", "error", "visible");
    if (status === "syncing") {
      _syncPillEl.textContent = "Syncing…";
      _syncPillEl.classList.add("syncing", "visible");
      if (_syncPillTimer) { clearTimeout(_syncPillTimer); _syncPillTimer = null; }
    } else if (status === "saved") {
      _syncPillEl.textContent = "✓ Saved";
      _syncPillEl.classList.add("saved", "visible");
      if (_syncPillTimer) clearTimeout(_syncPillTimer);
      _syncPillTimer = setTimeout(() => {
        if (_syncPillEl) _syncPillEl.classList.remove("visible");
      }, 1500);
    } else if (status === "error") {
      _syncPillEl.textContent = "⚠ Sync failed";
      _syncPillEl.classList.add("error", "visible");
      if (_syncPillTimer) clearTimeout(_syncPillTimer);
      _syncPillTimer = setTimeout(() => {
        if (_syncPillEl) _syncPillEl.classList.remove("visible");
      }, 2500);
    }
  }

  // Listen for State's sync events and reflect them in the UI.
  if (typeof window !== "undefined") {
    window.addEventListener("thai-learner-sync", e => {
      if (e && e.detail && e.detail.status) showSyncStatus(e.detail.status);
    });
  }

  /* One-time tooltip helper */
  function showTutorial(sectionId, text) {
    if (State.isTutorialSeen(sectionId)) return;
    const tip = document.createElement("div");
    tip.className = "tutorial-tip";
    tip.innerHTML = `<p>${text}</p><button class="btn btn-sm btn-primary" onclick="State.markTutorialSeen('${sectionId}');this.parentElement.remove();">Got it</button>`;
    const container = app();
    if (container.firstChild) {
      container.insertBefore(tip, container.firstChild.nextSibling);
    }
  }

  /* Script toggle component */
  function scriptToggle(currentShowScript) {
    return `
      <div class="script-toggle">
        <button class="btn btn-sm ${!currentShowScript ? 'btn-active' : ''}" onclick="State.set('showScript',false);location.reload();">Romanized</button>
        <button class="btn btn-sm ${currentShowScript ? 'btn-active' : ''}" onclick="State.set('showScript',true);location.reload();">Thai Script</button>
      </div>
    `;
  }

  /* Progress ring SVG */
  function progressRing(percent, size = 48, stroke = 4) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent * circ);
    return `
      <svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 ${size/2} ${size/2})" style="transition: stroke-dashoffset 0.6s ease;"/>
      </svg>
    `;
  }

  /* Apply theme */
  function applyTheme() {
    document.body.classList.toggle("light-mode", !State.get().darkMode);
  }

  return {
    registerRoute, navigate, handleRoute, init, render, $, $$,
    celebrate, toast, showXP, timeAgo, navBar, headerBar, progressRing, applyTheme, setCleanup,
    showSyncStatus
  };
})();
