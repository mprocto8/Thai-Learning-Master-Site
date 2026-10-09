// js/livedead.js - Live/Dead drill module.
// Pure logic exposed for tests: LiveDead._test = { pickRule, pickWord, applyAnswer, evaluateRound, median, updateLevelProgress, migrateState, buildTableItem }.
const LiveDead = (function () {
  const ROUND_SIZE = 12;
  const GOOD_SCORE = 11;
  const SPEED_MS = 2000;
  const TODAY_MS = 5 * 60 * 1000;
  const CORRECT_XP = 3;
  const ROUND_XP = 20;
  const AUTO_ADVANCE_MS = 1100;
  const STATE_VERSION = 2;
  const TONES = ["mid", "low", "falling", "high", "rising"];
  const LIVE_DEAD_KEYS = ["final-live", "final-dead", "open-long", "open-short", "hidden-ending", "disguised-n", "disguised-t", "disguised-kp"];
  const TONE_KEYS = ["mid-live", "mid-dead", "high-live", "high-dead", "low-live", "low-dead-short", "low-dead-long"];
  const TABLE_KEYS = TONE_KEYS.map(k => "table:" + k);
  const LEVELS = {
    1: { pool: ["final-live", "final-dead"], type: "life", rom: true, cls: false, timer: false },
    2: { pool: ["open-long", "open-short", "hidden-ending"], type: "life", rom: true, cls: false, timer: false },
    3: { pool: ["disguised-n", "disguised-t", "disguised-kp"], type: "life", rom: true, cls: false, timer: false },
    4: { pool: LIVE_DEAD_KEYS, type: "life", rom: false, cls: false, timer: false },
    5: { pool: TABLE_KEYS, type: "tone", rom: false, cls: false, timer: false, table: true },
    6: { pool: TONE_KEYS, type: "tone", rom: false, cls: true, timer: false },
    7: { pool: TONE_KEYS, type: "tone", rom: false, cls: false, timer: true }
  };

  let bank = null;
  let session = null;
  let cleanupFns = [];
  let timers = [];
  let todayTick = null;
  let drillKeyCleanup = null;
  let pendingLevelUp = null;
  let lastTen = [];

  // Every screen starts at the top (UI.render keeps the previous scroll position).
  function paint(html) {
    UI.render(html);
    window.scrollTo(0, 0);
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function copy(path, fallback) {
    let cur = typeof LiveDeadCopy !== "undefined" ? LiveDeadCopy : null;
    for (const p of path.split(".")) cur = cur && cur[p];
    return cur == null ? fallback : cur;
  }

  function fill(text, vars) {
    let out = text || "";
    Object.keys(vars || {}).forEach(k => { out = out.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]); });
    return out;
  }

  function freshLevel() {
    return { rounds: 0, good: 0, passed: false, best: 0, introSeen: false };
  }

  function normalizeLevel(l) {
    const fresh = freshLevel();
    return Object.assign(fresh, l || {}, {
      rounds: (l && l.rounds) || 0,
      good: (l && l.good) || 0,
      passed: !!(l && l.passed),
      best: (l && l.best) || 0,
      introSeen: !!(l && l.introSeen)
    });
  }

  function migrateState(current) {
    const source = current && current.rules && current.levels ? current : { rules: {}, levels: {}, lastSession: null };
    const oldLevels = source.levels || {};
    const migrated = {
      version: STATE_VERSION,
      rules: source.rules || {},
      levels: {},
      lastSession: source.lastSession || null
    };
    if (!source.version || source.version < STATE_VERSION) {
      for (let i = 1; i <= 4; i++) migrated.levels[i] = normalizeLevel(oldLevels[i]);
      migrated.levels[5] = freshLevel();
      migrated.levels[6] = normalizeLevel(oldLevels[5]);
      migrated.levels[7] = normalizeLevel(oldLevels[6]);
    } else {
      for (let i = 1; i <= 7; i++) migrated.levels[i] = normalizeLevel(oldLevels[i]);
    }
    return migrated;
  }

  function initState() {
    const current = (typeof State !== "undefined" && State.get().livedead) || null;
    const st = migrateState(current);
    const needsSave = !current || current.version !== STATE_VERSION || !current.rules || !current.levels || [1,2,3,4,5,6,7].some(n => !current.levels[n]);
    if (typeof State !== "undefined" && needsSave) State.set("livedead", st);
    return st;
  }

  function getRule(stat, key) {
    if (!stat.rules[key]) stat.rules[key] = { box: 0, seen: 0, correct: 0, lastSeen: 0 };
    return stat.rules[key];
  }

  function saveState(st) {
    if (typeof State !== "undefined") State.set("livedead", st);
  }

  function analyzeWord(w) {
    if (!w || !w.th || typeof Syllable === "undefined" || !Syllable.analyze) return null;
    if (w._ldAnalysis !== undefined) return w._ldAnalysis;
    w._ldAnalysis = Syllable.analyze(w.th);
    return w._ldAnalysis;
  }

  function buildBank() {
    if (bank) return bank;
    const byRule = {};
    const words = (typeof LiveDeadData !== "undefined" && Array.isArray(LiveDeadData.words)) ? LiveDeadData.words : [];
    words.forEach(w => {
      const a = analyzeWord(w);
      if (!a) return;
      const liveItem = { word: w, analysis: a, key: a.ruleKey };
      if (LIVE_DEAD_KEYS.indexOf(a.ruleKey) !== -1) (byRule[a.ruleKey] ||= []).push(liveItem);
      const toneItem = { word: w, analysis: a, key: a.toneKey };
      if (TONE_KEYS.indexOf(a.toneKey) !== -1) (byRule[a.toneKey] ||= []).push(toneItem);
    });
    bank = { byRule };
    return bank;
  }

  function availableRules(pool, byRule) {
    return pool.filter(k => k.indexOf("table:") === 0 || (byRule[k] && byRule[k].length));
  }

  function pickRule(pool, rules, byRule, rand) {
    const usable = availableRules(pool, byRule || {});
    if (!usable.length) return null;
    const total = usable.reduce((sum, key) => sum + Math.max(1, 5 - ((rules[key] && rules[key].box) || 0)), 0);
    let r = (rand || Math.random)() * total;
    for (const key of usable) {
      r -= Math.max(1, 5 - ((rules[key] && rules[key].box) || 0));
      if (r <= 0) return key;
    }
    return usable[usable.length - 1];
  }

  function pickWord(words, recent, rand) {
    if (!Array.isArray(words) || !words.length) return null;
    const recentSet = new Set((recent || []).slice(-10));
    const fresh = words.filter(item => !recentSet.has(item.word.th));
    const pool = fresh.length ? fresh : words;
    return pool[Math.floor((rand || Math.random)() * pool.length)];
  }

  function stripTableKey(toneKey) {
    return String(toneKey || "").replace(/^table:/, "");
  }

  function tableSpec(toneKey) {
    return {
      "mid-live": { cls: "mid", life: "live", tone: "mid" },
      "mid-dead": { cls: "mid", life: "dead", tone: "low" },
      "high-live": { cls: "high", life: "live", tone: "rising" },
      "high-dead": { cls: "high", life: "dead", tone: "low" },
      "low-live": { cls: "low", life: "live", tone: "mid" },
      "low-dead-short": { cls: "low", life: "dead", length: "short", tone: "high" },
      "low-dead-long": { cls: "low", life: "dead", length: "long", tone: "falling" }
    }[stripTableKey(toneKey)];
  }

  function buildTableItem(toneKey, rand) {
    const key = stripTableKey(toneKey);
    const spec = tableSpec(key);
    if (!spec) return null;
    let length = spec.length || null;
    if (spec.life === "dead" && !length) length = (rand || Math.random)() < 0.5 ? "short" : "long";
    return { kind: "table", toneKey: key, cls: spec.cls, life: spec.life, length, tone: spec.tone };
  }

  function tableCombo(item) {
    return item ? [item.cls, item.life, item.length || ""].join("|") : "";
  }

  function applyAnswer(ruleStat, correct, now) {
    const next = {
      box: ruleStat ? ruleStat.box || 0 : 0,
      seen: ruleStat ? ruleStat.seen || 0 : 0,
      correct: ruleStat ? ruleStat.correct || 0 : 0,
      lastSeen: now || Date.now()
    };
    next.seen += 1;
    if (correct) {
      next.correct += 1;
      next.box = Math.min(4, next.box + 1);
    } else {
      next.box = 0;
    }
    return next;
  }

  function median(values) {
    const nums = (values || []).filter(n => typeof n === "number" && isFinite(n)).sort((a, b) => a - b);
    if (!nums.length) return 0;
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : Math.round((nums[mid - 1] + nums[mid]) / 2);
  }

  function evaluateRound(level, score, total, times) {
    const med = median(times);
    const qualifies = total >= ROUND_SIZE && score >= GOOD_SCORE && (Number(level) !== 7 || med < SPEED_MS);
    return { qualifies, medianMs: med };
  }

  function updateLevelProgress(levelState, level, score, total, times) {
    const ev = evaluateRound(level, score, total, times);
    const next = {
      rounds: (levelState && levelState.rounds) || 0,
      good: (levelState && levelState.good) || 0,
      passed: !!(levelState && levelState.passed),
      best: (levelState && levelState.best) || 0,
      introSeen: !!(levelState && levelState.introSeen)
    };
    next.rounds += 1;
    next.best = Math.max(next.best, score);
    if (ev.qualifies) next.good += 1;
    if (next.good >= 2) next.passed = true;
    return { level: next, qualifies: ev.qualifies, passedNow: !((levelState || {}).passed) && next.passed, medianMs: ev.medianMs };
  }

  function route() {
    const hash = (window.location.hash || "#livedead").replace(/^#/, "");
    const parts = hash.split("/");
    if (parts[1] === "cheat") renderCheat();
    else if (parts[1] === "today") startToday();
    else if (parts[1] === "level") startLevel(parseInt(parts[2], 10) || 1, false);
    else showHome();
  }

  // Levels start without a hash change, so the hash may already be #livedead;
  // UI.navigate to the current hash does nothing, so re-render directly then.
  function goHome() {
    if ((window.location.hash || "") === "#livedead") showHome();
    else UI.navigate("#livedead");
  }

  function setCleanup() {
    if (typeof UI === "undefined" || !UI.setCleanup) return;
    UI.setCleanup(cleanup);
  }

  function cleanup() {
    cleanupFns.forEach(fn => { try { fn(); } catch {} });
    cleanupFns = [];
    timers.forEach(t => clearTimeout(t));
    timers = [];
    if (todayTick) clearTimeout(todayTick);
    todayTick = null;
    if (drillKeyCleanup) drillKeyCleanup();
    drillKeyCleanup = null;
    session = null;
  }

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function levelTitle(n) {
    return copy("levels." + n + ".title", "Level " + n);
  }

  function levelBlurb(n) {
    return copy("levels." + n + ".blurb", "");
  }

  function isUnlocked(st, n) {
    return n === 1 || !!(st.levels[n - 1] && st.levels[n - 1].passed);
  }

  function showHome() {
    cleanup();
    setCleanup();
    const st = initState();
    buildBank();
    const ui = copy("ui", {});
    paint(`
      <div class="ld-screen ld-home">
        <div class="ld-topbar">
          <button class="btn btn-ghost ld-back" data-nav="#learn">Back</button>
        </div>
        <div class="ld-hero">
          <h1>${esc(ui.moduleTitle || "Live or Dead")}</h1>
          <p>${esc(ui.moduleSubtitle || "Hold it or cut it. Five minutes a day.")}</p>
        </div>
        <button class="ld-today" data-nav="#livedead/today">
          <span>${esc(ui.today || "Today's 5 minutes")}</span>
          <small>${esc(ui.todaySub || "Mixed review.")}</small>
        </button>
        <div class="ld-level-list">
          ${[1,2,3,4,5,6,7].map(n => renderLevelRow(st, n)).join("")}
        </div>
        <button class="btn btn-secondary ld-cheat-btn" data-nav="#livedead/cheat">${esc(ui.cheatSheetButton || "Cheat sheet")}</button>
        <div id="ld-lock-panel" class="ld-lock-panel" hidden></div>
      </div>
    `);
    bindHome(st);
  }

  function renderLevelRow(st, n) {
    const l = st.levels[n] || {};
    const unlocked = isUnlocked(st, n);
    const status = l.passed ? "passed" : (unlocked ? "open" : "locked");
    return `
      <button class="ld-level-row ${status}" data-level="${n}">
        <span class="ld-level-num">${n}</span>
        <span class="ld-level-main">
          <strong>${esc(levelTitle(n))}</strong>
          <small>${esc(levelBlurb(n))}</small>
        </span>
        <span class="ld-level-meta">
          <span>${esc(status)}</span>
          <small>Best ${esc(l.best || 0)}/12</small>
        </span>
      </button>
      ${l.introSeen ? `<button class="ld-intro-link" data-intro="${n}">intro</button>` : ""}
    `;
  }

  function bindHome(st) {
    document.querySelectorAll("[data-nav]").forEach(btn => btn.addEventListener("click", () => UI.navigate(btn.dataset.nav)));
    document.querySelectorAll("[data-level]").forEach(btn => btn.addEventListener("click", () => {
      const n = parseInt(btn.dataset.level, 10);
      if (isUnlocked(st, n)) startLevel(n, false);
      else renderSkipPanel(n);
    }));
    document.querySelectorAll("[data-intro]").forEach(btn => btn.addEventListener("click", () => showIntro(parseInt(btn.dataset.intro, 10), true)));
  }

  function renderSkipPanel(n) {
    const ui = copy("ui", {});
    const el = document.getElementById("ld-lock-panel");
    if (!el) return;
    el.hidden = false;
    el.innerHTML = `
      <h3>${esc(ui.skipAheadTitle || "Skip ahead?")}</h3>
      <p>${esc(ui.skipAheadBody || "This level builds on the ones before it.")}</p>
      <div class="ld-panel-actions">
        <button class="btn btn-primary" id="ld-skip-confirm">${esc(ui.skipAheadConfirm || "Try it anyway")}</button>
        <button class="btn btn-secondary" id="ld-skip-cancel">${esc(ui.cancel || "Cancel")}</button>
      </div>
    `;
    // Show the panel right under the tapped row so it is never below the fold.
    const row = document.querySelector('.ld-level-row[data-level="' + n + '"]');
    if (row) row.after(el);
    el.scrollIntoView({ block: "nearest" });
    document.getElementById("ld-skip-confirm").focus({ preventScroll: true });
    document.getElementById("ld-skip-confirm").addEventListener("click", () => startLevel(n, true));
    document.getElementById("ld-skip-cancel").addEventListener("click", () => { el.hidden = true; });
  }

  function renderCheat() {
    cleanup();
    setCleanup();
    const c = copy("cheatSheet", {});
    paint(`
      <div class="ld-screen ld-cheat">
        <div class="ld-topbar"><button class="btn btn-ghost" data-nav="#livedead">Back</button></div>
        <h1>${esc(c.title || "Live or dead cheat sheet")}</h1>
        <p class="ld-cheat-test">${esc(c.test || "Can you hold the ending sound?")}</p>
        <div class="ld-cheat-split">
          ${renderCheatBox("live", c.live)}
          ${renderCheatBox("dead", c.dead)}
        </div>
        <p>${esc(c.hidden || "")}</p>
        <ul class="ld-cheat-list">${(c.disguised || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="ld-class-grid">
          <div><strong>Mid</strong><p>${esc(c.classes && c.classes.mid || "")}</p></div>
          <div><strong>High</strong><p>${esc(c.classes && c.classes.high || "")}</p></div>
          <div><strong>Low</strong><p>${esc(c.classes && c.classes.low || "")}</p></div>
        </div>
        <p class="ld-note">${esc(c.classes && c.classes.note || "")}</p>
        <h2 class="ld-cheat-tone-title">Tones · วรรณยุกต์</h2>
        <div class="ld-cheat-tone-rules">${((c.toneRules || []).map(x => `<p>${esc(x)}</p>`).join(""))}</div>
        ${c.chant ? `<p class="ld-cheat-chant">${esc(c.chant)}</p>` : ""}
        ${renderToneTable(c.toneTable || {})}
      </div>
    `);
    document.querySelector("[data-nav]")?.addEventListener("click", e => UI.navigate(e.currentTarget.dataset.nav));
  }

  function renderCheatBox(kind, obj) {
    return `<section class="ld-cheat-box ${kind}">
      <h2>${shape(kind)} ${esc((obj && obj.label) || kind)}</h2>
      <ul>${((obj && obj.points) || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderToneTable(t) {
    const headers = t.headers || ["Class", "Live", "Dead short", "Dead long"];
    const rows = t.rows || [];
    return `<table class="ld-tone-table">
      <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${toneCellHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  }

  // A table cell that is a tone name gets its mark beside it, like the answer cards.
  function toneCellHtml(cell) {
    const names = copy("toneNames", {});
    const t = Object.keys(names).find(k => names[k].th === cell);
    if (!t) return esc(cell);
    const mark = names[t].mark || "";
    return `<span class="ld-tone-mark ld-cell-mark${mark ? "" : " is-empty"}">◌${esc(mark)}</span> ${esc(cell)}`;
  }

  function startLevel(n, forceIntro) {
    cleanup();
    setCleanup();
    const st = initState();
    if (forceIntro || !(st.levels[n] && st.levels[n].introSeen)) {
      showIntro(n, false);
      return;
    }
    beginSession({ mode: "level", level: n, endAt: null });
  }

  function showIntro(n, replay) {
    cleanup();
    setCleanup();
    const intro = copy("levels." + n + ".intro", []);
    let i = 0;
    function render() {
      const card = intro[i] || { title: levelTitle(n), body: levelBlurb(n) };
      paint(`
        <div class="ld-screen ld-intro">
          <div class="ld-topbar"><button class="btn btn-ghost" id="ld-intro-back">Back</button><span>${i + 1}/${Math.max(1, intro.length)}</span></div>
          <section class="ld-intro-card">
            <h1>${esc(card.title || levelTitle(n))}</h1>
            ${(card.body || "").split("\n").map(p => `<p>${esc(p)}</p>`).join("")}
          </section>
          <div class="ld-intro-actions">
            <button class="btn btn-secondary" id="ld-skip-intro">${esc(copy("ui.skipIntro", "Skip intro"))}</button>
            <button class="btn btn-primary" id="ld-next-intro">${esc(i >= intro.length - 1 ? copy("ui.start", "Start") : copy("ui.next", "Next"))}</button>
          </div>
        </div>
      `);
      document.getElementById("ld-intro-back").addEventListener("click", () => goHome());
      document.getElementById("ld-skip-intro").addEventListener("click", finish);
      document.getElementById("ld-next-intro").addEventListener("click", () => { if (i >= intro.length - 1) finish(); else { i++; render(); } });
    }
    function finish() {
      const st = initState();
      st.levels[n].introSeen = true;
      saveState(st);
      if (replay) goHome(); else beginSession({ mode: "level", level: n, endAt: null });
    }
    render();
  }

  function startToday() {
    cleanup();
    setCleanup();
    beginSession({ mode: "today", level: null, endAt: Date.now() + TODAY_MS });
  }

  function unlockedLevels(st) {
    const firstUnpassed = [1,2,3,4,5,6,7].find(n => !(st.levels[n] && st.levels[n].passed)) || 7;
    return [1,2,3,4,5,6,7].filter(n => (st.levels[n] && st.levels[n].passed) || n === firstUnpassed);
  }

  function beginSession(opts) {
    const b = buildBank();
    session = {
      mode: opts.mode,
      level: opts.level,
      endAt: opts.endAt,
      items: [],
      idx: 0,
      correct: 0,
      times: [],
      misses: {},
      answered: false,
      shownAt: 0,
      current: null,
      lastTableCombo: "",
      drag: null
    };
    lastTen = [];
    nextItem();
    if (!Object.keys(b.byRule).length) renderEmpty();
  }

  function renderEmpty() {
    paint(`<div class="ld-screen"><h1>${esc(copy("ui.moduleTitle", "Live or Dead"))}</h1><p>No drill data is available yet.</p><button class="btn btn-primary" id="ld-empty-back">Back</button></div>`);
    document.getElementById("ld-empty-back").addEventListener("click", () => goHome());
  }

  function chooseNextItem() {
    const st = initState();
    const b = buildBank();
    let level = session.level;
    if (session.mode === "today") {
      const levels = unlockedLevels(st);
      level = levels[Math.floor(Math.random() * levels.length)] || 1;
    }
    const cfg = LEVELS[level];
    const rule = pickRule(cfg.pool, st.rules || {}, b.byRule, Math.random);
    if (!rule) return null;
    if (cfg.table) {
      let table = buildTableItem(rule, Math.random);
      for (let i = 0; i < 4 && table && tableCombo(table) === session.lastTableCombo; i++) table = buildTableItem(rule, Math.random);
      if (!table) return null;
      session.lastTableCombo = tableCombo(table);
      return { level, cfg, rule, table, analysis: table };
    }
    const item = pickWord(b.byRule[rule], lastTen, Math.random);
    if (!item) return null;
    lastTen.push(item.word.th);
    lastTen = lastTen.slice(-10);
    return { level, cfg, rule, word: item.word, analysis: item.analysis };
  }

  function nextItem() {
    if (!session) return;
    if (session.mode === "level" && session.idx >= ROUND_SIZE) { finishRound(false); return; }
    if (session.mode === "today" && session.endAt && Date.now() >= session.endAt && session.idx > 0) { finishRound(false); return; }
    const item = chooseNextItem();
    if (!item) { renderEmpty(); return; }
    session.current = item;
    session.answered = false;
    session.shownAt = Date.now();
    renderDrill();
  }

  function renderDrill(feedback) {
    const item = session.current;
    const ui = copy("ui", {});
    const table = item.cfg.table;
    const hasAudio = !table && typeof LiveDeadAudio !== "undefined" && LiveDeadAudio.has && LiveDeadAudio.has(item.word.th);
    const countLabel = session.mode === "today" ? remainingLabel() : `${feedback ? session.idx : session.idx + 1}/${ROUND_SIZE}`;
    const lifeClass = feedback && !table ? (item.analysis.live ? " v-live" : " v-dead") : "";
    paint(`
      <div class="ld-drill ${feedback ? "is-feedback" : ""}">
        <div class="ld-drill-top">
          <button class="btn btn-ghost" id="ld-quit">Quit</button>
          <span id="ld-count">${esc(countLabel)}</span>
        </div>
        ${item.cfg.timer ? `<div class="ld-timer"><span id="ld-timer-fill"></span></div>` : ""}
        <main class="ld-card-wrap">
          ${item.cfg.cls && !feedback ? renderClassChip(item.analysis.cls) : ""}
          ${table && !feedback ? renderTablePrompt(item.table) : ""}
          ${!table ? `<button class="ld-syllable ${hasAudio ? "has-audio" : ""}${lifeClass}" id="ld-syllable" aria-label="${hasAudio ? esc(ui.tapToHear || "Tap to hear it") : esc(item.word.th)}">
            ${feedback ? renderHighlighted(item.word.th, highlightSet(item.analysis, item.cfg.type)) : esc(item.word.th)}
          </button>` : ""}
          ${hasAudio && !feedback ? `<div class="ld-audio-hint">${esc(ui.tapToHear || "Tap to hear it")}</div>` : ""}
          ${item.cfg.rom && !feedback && !table ? `<div class="ld-rom">${esc(item.word.rom || "")}</div><div class="ld-en">${esc(item.word.en || "")}</div>` : ""}
          ${feedback ? renderFeedback(feedback) : `<div class="ld-hint">${item.cfg.type === "life" ? esc(ui.swipeHint || "") : ""}</div>`}
        </main>
        ${renderControls(item.cfg.type, feedback)}
      </div>
    `);
    bindDrill(feedback);
    if (session && session.mode === "today" && !feedback) startTodayTick();
    if (item.cfg.timer && !feedback) startTimerBar();
  }

  function remainingLabel() {
    const ms = Math.max(0, (session.endAt || Date.now()) - Date.now());
    const secs = Math.ceil(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function startTodayTick() {
    if (todayTick) clearTimeout(todayTick);
    const tick = () => {
      if (!session || session.mode !== "today" || session.answered) return;
      const el = document.getElementById("ld-count");
      if (el) el.textContent = remainingLabel();
      todayTick = setTimeout(tick, 1000);
    };
    todayTick = setTimeout(tick, 1000);
  }

  function className(cls) {
    const names = copy("classNames", {});
    const v = names[cls];
    return v && typeof v === "object" ? v.th : (v || (cls ? cls + " class" : ""));
  }

  function classObj(cls) {
    const names = copy("classNames", {});
    const v = names[cls];
    return v && typeof v === "object" ? v : { th: className(cls), en: cls ? cls + " class" : "" };
  }

  function lifeObj(life) {
    const names = copy("lifeNames", {});
    const v = names[life];
    return v && typeof v === "object" ? v : { th: life === "live" ? copy("ui.liveTh", "คำเป็น") : copy("ui.deadTh", "คำตาย"), en: life || "" };
  }

  function lengthObj(length) {
    const names = copy("lengthNames", {});
    const v = names[length];
    return v && typeof v === "object" ? v : { th: length || "", en: "" };
  }

  function renderClassChip(cls) {
    const obj = classObj(cls);
    return `<div class="ld-class-chip"><strong>${esc(obj.th)}</strong><small>${esc(obj.en || "")}</small></div>`;
  }

  function renderClueChip(kind, obj, shapeKind) {
    return `<div class="ld-clue-chip ${esc(kind)}">
      ${shapeKind ? shape(shapeKind) : ""}
      <strong>${esc(obj.th || "")}</strong>
      <small>${esc(obj.en || "")}</small>
    </div>`;
  }

  function renderTablePrompt(table) {
    return `<div class="ld-table-prompt">
      ${renderClueChip("class", classObj(table.cls))}
      ${renderClueChip(table.life, lifeObj(table.life), table.life)}
      ${table.length ? renderClueChip("length", lengthObj(table.length)) : ""}
    </div>`;
  }

  function renderControls(type, feedback) {
    if (feedback && !feedback.correct) return `<div class="ld-controls"><button class="btn btn-primary ld-continue" id="ld-continue">${esc(copy("ui.continue", "Continue"))}</button></div>`;
    if (feedback) return `<div class="ld-controls ld-wait"></div>`;
    if (type === "life") {
      return `<div class="ld-controls ld-life-controls">
        <button class="ld-answer live" data-answer="live">${shape("live")}<span>${esc(copy("ui.live", "Live"))}</span><small>${esc(copy("ui.liveTh", "คำเป็น"))}</small></button>
        <button class="ld-answer dead" data-answer="dead">${shape("dead")}<span>${esc(copy("ui.dead", "Dead"))}</span><small>${esc(copy("ui.deadTh", "คำตาย"))}</small></button>
      </div>`;
    }
    return `<div class="ld-controls ld-tone-controls">${TONES.map((t, i) => {
      const name = toneName(t);
      // Mark + Thai name side by side for instant recognition. The mark stands for the
      // SOUND (the กา ก่า ก้า ก๊า ก๋า chant); สามัญ has no mark, so it shows a bare ◌.
      return `<button class="ld-tone-btn" data-answer="${t}" aria-label="เสียง${esc(name.th || "")}">
        <span class="ld-tone-id">
          <span class="ld-tone-mark${name.mark ? "" : " is-empty"}">◌${esc(name.mark || "")}</span>
          <strong class="ld-tone-name">${esc(name.th || "")}</strong>
        </span>
        ${toneSvg(t)}
        <small>${esc(name.rom || "")} · ${i + 1}</small>
      </button>`;
    }).join("")}</div>`;
  }

  function shape(kind) {
    if (kind === "live") return `<svg class="ld-shape" viewBox="0 0 56 16" aria-hidden="true"><defs><linearGradient id="ld-live-grad" gradientUnits="userSpaceOnUse" x1="4" y1="8" x2="52" y2="8"><stop offset="0" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="M4 8 C18 8 30 8 52 8" stroke="url(#ld-live-grad)" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
    return `<svg class="ld-shape" viewBox="0 0 56 16" aria-hidden="true"><path d="M4 8 H46" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M48 3 V13" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  function toneName(t) {
    const names = copy("toneNames", {});
    return names[t] || { th: t, mark: "", rom: t, noMark: "ไม่มีรูป" };
  }

  function toneMarkText(t) {
    const name = toneName(t);
    return "◌" + (name.mark || "");
  }

  function toneLabel(t) {
    return "เสียง" + (toneName(t).th || "");
  }

  // Same mark + name pairing as the answer cards, so the verdict is recognised at a glance.
  function toneVerdictHtml(t) {
    const name = toneName(t);
    return `<span class="ld-tone-mark ld-verdict-mark${name.mark ? "" : " is-empty"}">${esc(toneMarkText(t))}</span><span class="ld-verdict-name">${esc(toneLabel(t))}</span>`;
  }

  function toneChain(toneKey, info) {
    const key = stripTableKey(toneKey);
    const spec = info || tableSpec(key) || {};
    const cls = classObj(spec.cls).th;
    const lifeKey = spec.life || (spec.live ? "live" : "dead");
    const life = lifeObj(lifeKey).th;
    const length = (key === "low-dead-short" || key === "low-dead-long") ? lengthObj(spec.length || (key === "low-dead-short" ? "short" : "long")).th : "";
    const tone = toneName(spec.tone).th;
    return [cls, life, length, "เสียง" + tone].filter(Boolean).join(" → ");
  }

  function exampleForTone(toneKey) {
    const b = buildBank();
    const words = (b.byRule && b.byRule[stripTableKey(toneKey)]) || [];
    if (!words.length) return "";
    const picked = words[Math.floor(Math.random() * words.length)];
    if (!picked || !picked.word) return "";
    return "e.g. " + (picked.word.th || "") + (picked.word.rom ? " (" + picked.word.rom + ")" : "");
  }

  function toneSvg(t) {
    const path = {
      mid: "M4 20 H44", low: "M4 14 C16 24 28 27 44 29", falling: "M4 8 C18 12 28 24 44 31",
      high: "M4 22 C18 12 28 9 44 8", rising: "M4 30 C18 28 28 16 44 8"
    }[t];
    return `<svg class="ld-tone-svg" viewBox="0 0 48 36" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
  }

  function bindDrill(feedback) {
    document.getElementById("ld-quit")?.addEventListener("click", () => {
      if (session && session.mode === "today" && session.idx > 0) finishRound(true);
      else goHome();
    });
    const syl = document.getElementById("ld-syllable");
    if (syl) {
      syl.addEventListener("click", () => {
        const item = session && session.current;
        if (item && typeof LiveDeadAudio !== "undefined" && LiveDeadAudio.has && LiveDeadAudio.has(item.word.th)) Audio.playLiveDead(item.word.th);
      });
    }
    if (!feedback) {
      document.querySelectorAll("[data-answer]").forEach(btn => btn.addEventListener("click", () => answer(btn.dataset.answer)));
      bindSwipe(syl);
    } else if (!feedback.correct) {
      document.getElementById("ld-continue")?.addEventListener("click", continueAfterWrong);
      document.querySelector(".ld-card-wrap")?.addEventListener("click", continueAfterWrong);
    }
    if (drillKeyCleanup) drillKeyCleanup();
    const key = e => onKey(e, feedback);
    window.addEventListener("keydown", key);
    drillKeyCleanup = () => window.removeEventListener("keydown", key);
    cleanupFns.push(drillKeyCleanup);
  }

  function bindSwipe(el) {
    if (!el || session.current.cfg.type !== "life") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const down = e => { session.drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture?.(e.pointerId); };
    const move = e => {
      if (!session.drag || reduce) return;
      const dx = e.clientX - session.drag.x;
      if (Math.abs(dx) < 8) return;
      el.style.transform = `translateX(${Math.max(-36, Math.min(36, dx / 4))}px)`;
    };
    const up = e => {
      if (!session.drag) return;
      const dx = e.clientX - session.drag.x;
      const dy = e.clientY - session.drag.y;
      session.drag = null;
      el.style.transform = "";
      if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.4) answer(dx < 0 ? "live" : "dead");
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  function onKey(e, feedback) {
    if (!session) return;
    if (feedback && !feedback.correct && (e.key === " " || e.code === "Space" || e.key === "Enter")) {
      e.preventDefault();
      continueAfterWrong();
      return;
    }
    if (session.answered || feedback) return;
    if (session.current.cfg.type === "life") {
      if (e.key === "ArrowLeft") { e.preventDefault(); answer("live"); }
      if (e.key === "ArrowRight") { e.preventDefault(); answer("dead"); }
    } else {
      const i = parseInt(e.key, 10);
      if (i >= 1 && i <= 5) { e.preventDefault(); answer(TONES[i - 1]); }
    }
  }

  function startTimerBar() {
    const fillEl = document.getElementById("ld-timer-fill");
    if (!fillEl) return;
    requestAnimationFrame(() => fillEl.classList.add("run"));
    later(() => fillEl.classList.add("slow"), SPEED_MS);
  }

  function answer(value) {
    if (!session || session.answered) return;
    session.answered = true;
    const item = session.current;
    const elapsed = Date.now() - session.shownAt;
    const correctAnswer = item.cfg.type === "life" ? (item.analysis.live ? "live" : "dead") : item.analysis.tone;
    const ok = value === correctAnswer;
    session.idx += 1;
    session.times.push(elapsed);
    if (ok) session.correct += 1;
    else session.misses[item.rule] = (session.misses[item.rule] || 0) + 1;
    const st = initState();
    const current = getRule(st, item.rule);
    st.rules[item.rule] = applyAnswer(current, ok, Date.now());
    st.lastSession = { at: Date.now(), mode: session.mode, level: session.level, score: session.correct, total: session.idx, medianMs: median(session.times) };
    saveState(st);
    if (ok && typeof State !== "undefined") {
      const levelUp = State.addXP(CORRECT_XP);
      State.checkStreak();
      if (levelUp) pendingLevelUp = levelUp;
    }
    const feedback = { correct: ok, chosen: value, correctAnswer, elapsed };
    renderDrill(feedback);
    if (ok) later(nextItem, AUTO_ADVANCE_MS);
  }

  function continueAfterWrong() {
    if (!session) return;
    nextItem();
  }

  function renderFeedback(fb) {
    const item = session.current;
    const life = item.cfg.type === "life";
    const label = a => life ? copy("ui." + a, a === "live" ? "Live" : "Dead") : toneLabel(a);
    // Verdict always wears the answer's own colour and shape (amber/trailing = live,
    // teal/hard stop = dead); right/wrong is shown separately so colours never contradict.
    const verdictClass = life ? fb.correctAnswer : "tone";
    const result = fb.correct ? "Correct" : "Not quite. You picked " + label(fb.chosen) + ".";
    return `<div class="ld-feedback ${fb.correct ? "correct" : "wrong"}">
      <div class="ld-result">${esc(result)}</div>
      <div class="ld-verdict ${verdictClass}">${life ? shape(fb.correctAnswer) : toneSvg(fb.correctAnswer)} <strong>${life ? esc(label(fb.correctAnswer)) : toneVerdictHtml(fb.correctAnswer)}</strong></div>
      <div class="ld-reason">${reasonHtml(item)}</div>
      ${item.word ? `<div class="ld-en">${esc(item.word.rom || "")}${item.word.rom ? " · " : ""}${esc(item.word.en || "")}</div>` : ""}
    </div>`;
  }

  function reasonHtml(item) {
    if (item.cfg.type === "tone") {
      const table = item.cfg.table;
      const toneKey = table ? item.table.toneKey : item.analysis.toneKey;
      const tone = table ? item.table.tone : item.analysis.tone;
      const parts = [
        `<p class="ld-chain">${esc(toneChain(toneKey, table ? item.table : item.analysis))}</p>`,
        `<p class="ld-rule">${esc(copy("toneRules." + toneKey, ""))}</p>`,
        `<p class="ld-chant">${esc(fill(copy("ui.chantHint", "Sounds like {chant} in กา ก่า ก้า ก๊า ก๋า"), { chant: copy("chant." + tone, "") }))}</p>`
      ];
      if (table) parts.push(`<p class="ld-example">${esc(exampleForTone(toneKey))}</p>`);
      else {
        const liveReason = fill(copy("reasons." + item.analysis.ruleKey, fallbackReason(item.analysis)), reasonVars(item.analysis));
        parts.push(`<p>${esc(liveReason)}</p>`);
      }
      return parts.join("");
    }
    const liveReason = fill(copy("reasons." + item.analysis.ruleKey, fallbackReason(item.analysis)), reasonVars(item.analysis));
    return `<p>${esc(liveReason)}</p>`;
  }

  function fallbackReason(a) {
    return a.live ? "You can hold the ending. Live." : "The ending is cut off. Dead.";
  }

  function reasonVars(a) {
    if (a.ruleKey === "open-long" || a.ruleKey === "open-short") return { letter: vowelLabel(a), sound: "" };
    if (a.ruleKey === "hidden-ending") return hiddenLabel(a);
    return { letter: a.finalLetter || vowelLabel(a), sound: a.finalSound || "" };
  }

  function vowelLabel(a) {
    const th = session && session.current ? session.current.word.th : "";
    const idxs = (a.decider && a.decider.indices) || [];
    const combining = /[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/;
    let out = "";
    let prev = null;
    idxs.forEach(i => {
      if (prev != null && i !== prev + 1) out += "\u2011";
      const ch = th.charAt(i);
      out += combining.test(ch) ? "\u25cc" + ch : ch;
      prev = i;
    });
    return out || "";
  }

  function hiddenLabel(a) {
    const th = session && session.current ? session.current.word.th : "";
    if (th.indexOf("ำ") !== -1) return { letter: "\u2011ำ", sound: "m" };
    if (th.indexOf("ไ") !== -1) return { letter: "ไ\u2011", sound: "y" };
    if (th.indexOf("ใ") !== -1) return { letter: "ใ\u2011", sound: "y" };
    if (th.indexOf("เ") !== -1 && th.indexOf("า") !== -1) return { letter: "เ\u2011า", sound: "w" };
    return { letter: vowelLabel(a), sound: a.finalSound || "" };
  }

  function highlightSet(a, type) {
    const set = new Set((a.decider && a.decider.indices) || []);
    if (type === "tone") (a.initialIndices || []).forEach(i => set.add("i" + i));
    return set;
  }

  function renderHighlighted(th, set) {
    const clusters = [];
    const combining = /[\u0e31\u0e34-\u0e3a\u0e47-\u0e4e]/;
    for (let i = 0; i < th.length; i++) {
      const start = i;
      let text = th.charAt(i);
      while (i + 1 < th.length && combining.test(th.charAt(i + 1))) {
        i += 1;
        text += th.charAt(i);
      }
      const indexes = [];
      for (let j = start; j <= i; j++) indexes.push(j);
      clusters.push({ text, indexes });
    }
    return clusters.map(c => {
      const dec = c.indexes.some(i => set.has(i));
      const ini = c.indexes.some(i => set.has("i" + i));
      const cls = ini ? " initial" : "";
      return (dec || ini) ? `<span class="ld-hl${cls}">${esc(c.text)}</span>` : esc(c.text);
    }).join("");
  }

  function finishRound(quitEarly) {
    if (!session) return;
    const score = session.correct;
    const total = session.idx;
    const med = median(session.times);
    const mode = session.mode;
    const lvl = session.level;
    const missed = Object.keys(session.misses);
    let passedNow = false;
    let qualified = false;
    if (mode === "level") {
      const st = initState();
      const updated = updateLevelProgress(st.levels[lvl], lvl, score, total, session.times);
      st.levels[lvl] = updated.level;
      st.lastSession = { at: Date.now(), mode, level: lvl, score, total, medianMs: med };
      saveState(st);
      qualified = updated.qualifies;
      passedNow = updated.passedNow;
      if (typeof State !== "undefined" && total >= ROUND_SIZE) {
        const levelUp = State.addXP(ROUND_XP);
        if (levelUp) pendingLevelUp = levelUp;
      }
    } else {
      const st = initState();
      st.lastSession = { at: Date.now(), mode, level: null, score, total, medianMs: med };
      saveState(st);
    }
    const levelUp = pendingLevelUp;
    pendingLevelUp = null;
    session = null;
    renderRoundDone({ mode, lvl, score, total, med, missed, qualified, passedNow, quitEarly });
    if (levelUp && typeof UI !== "undefined" && UI.celebrate) later(() => UI.celebrate(levelUp.name, levelUp.emoji), 250);
  }

  function renderRoundDone(result) {
    const ui = copy("ui", {});
    const seconds = (result.med / 1000).toFixed(1);
    const status = result.mode === "level"
      ? (result.passedNow ? ui.passedLevel : fill(result.qualified ? (ui.roundDone || "") : (ui.notYet || ""), { score: result.score, total: result.total }))
      : fill(ui.roundDone || "Session done: {score} of {total}.", { score: result.score, total: result.total });
    paint(`
      <div class="ld-screen ld-done">
        <section class="ld-done-card">
          <h1>${esc(fill(status || "Round done.", { score: result.score, total: result.total }))}</h1>
          <div class="ld-stats">
            <div><strong>${esc(result.score)}/${esc(result.total)}</strong><span>Score</span></div>
            <div><strong>${esc(seconds)}s</strong><span>Median</span></div>
          </div>
          <p>${esc(fill(result.med < SPEED_MS ? (ui.fluent || "Fluent: {seconds}s.") : (ui.tooSlow || "Too slow: {seconds}s."), { seconds }))}</p>
          ${result.missed.length ? `<div class="ld-misses"><strong>Missed rules</strong><p>${esc(result.missed.map(ruleName).join(", "))}</p></div>` : ""}
          <div class="ld-panel-actions">
            <button class="btn btn-primary" id="ld-next-round">${esc(result.mode === "today" ? (ui.today || "Today's 5 minutes") : "Next round")}</button>
            <button class="btn btn-secondary" id="ld-home">Home</button>
          </div>
        </section>
      </div>
    `);
    document.getElementById("ld-next-round").addEventListener("click", () => result.mode === "today" ? startToday() : startLevel(result.lvl, false));
    document.getElementById("ld-home").addEventListener("click", () => goHome());
  }

  const RULE_LABELS = {
    "final-live": "Live endings น ม ง ย ว",
    "final-dead": "Dead endings ก บ ด",
    "open-long": "Long open vowels",
    "open-short": "Short open vowels",
    "hidden-ending": "Hidden endings ‑ำ ไ‑ ใ‑ เ‑า",
    "disguised-n": "Endings that sound n",
    "disguised-t": "Endings that sound t",
    "disguised-kp": "Endings that sound k or p"
  };

  function ruleName(k) {
    if (String(k).indexOf("table:") === 0) return "Table: " + toneChain(stripTableKey(k), tableSpec(k));
    if (TONE_KEYS.indexOf(k) !== -1) return toneChain(k, tableSpec(k));
    return RULE_LABELS[k] || k;
  }

  return {
    show: route,
    _test: { pickRule, pickWord, applyAnswer, evaluateRound, median, updateLevelProgress, migrateState, buildTableItem }
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = LiveDead;
