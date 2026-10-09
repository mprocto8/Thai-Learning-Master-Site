// tests/livedead.test.js
// Pure logic under test: LiveDead._test.{ pickRule, pickWord, applyAnswer, evaluateRound, median, updateLevelProgress, migrateState, buildTableItem }.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const code = fs.readFileSync(path.join(root, "js", "livedead.js"), "utf8");

const sandbox = {
  console,
  module: { exports: {} },
  exports: {},
  window: {
    location: { hash: "" },
    addEventListener() {},
    removeEventListener() {},
    matchMedia() { return { matches: false }; }
  },
  document: {
    querySelectorAll() { return []; },
    querySelector() { return null; },
    getElementById() { return null; }
  },
  State: {
    get() { return { livedead: null }; },
    set() {},
    addXP() { return null; },
    checkStreak() {}
  },
  UI: { render() {}, navigate() {}, setCleanup() {}, celebrate() {} },
  Audio: { playLiveDead() {} },
  Syllable: { analyze() { return null; } },
  LiveDeadData: { words: [] },
  LiveDeadCopy: {
    classNames: {
      mid: { th: "อักษรกลาง", en: "mid class" },
      high: { th: "อักษรสูง", en: "high class" },
      low: { th: "อักษรต่ำ", en: "low class" }
    },
    lifeNames: {
      live: { th: "คำเป็น", en: "live" },
      dead: { th: "คำตาย", en: "dead" }
    },
    lengthNames: {
      short: { th: "สระสั้น", en: "short vowel" },
      long: { th: "สระยาว", en: "long vowel" }
    },
    toneNames: {
      mid: { th: "สามัญ", mark: "", rom: "saaman", noMark: "ไม่มีรูป" },
      low: { th: "เอก", mark: "่", rom: "ek" },
      falling: { th: "โท", mark: "้", rom: "tho" },
      high: { th: "ตรี", mark: "๊", rom: "tri" },
      rising: { th: "จัตวา", mark: "๋", rom: "jattawa" }
    }
  },
  LiveDeadAudio: { has() { return false; } },
  setTimeout,
  clearTimeout,
  requestAnimationFrame(fn) { return fn(); },
  Math
};

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "js/livedead.js" });
const LiveDead = sandbox.module.exports;
const t = LiveDead._test;

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function seeded(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function run(name, fn) {
  try {
    fn();
    console.log("ok - " + name);
  } catch (err) {
    console.error("not ok - " + name);
    console.error(err && err.stack || err);
    process.exitCode = 1;
  }
}

run("applyAnswer moves boxes and counts attempts", () => {
  let stat = { box: 3, seen: 2, correct: 1, lastSeen: 1 };
  stat = t.applyAnswer(stat, true, 10);
  assert(stat.box === 4, "correct should cap at box 4");
  assert(stat.seen === 3, "seen should increment");
  assert(stat.correct === 2, "correct should increment");
  stat = t.applyAnswer(stat, true, 11);
  assert(stat.box === 4, "box should stay capped");
  stat = t.applyAnswer(stat, false, 12);
  assert(stat.box === 0, "wrong should reset box");
  assert(stat.seen === 5, "wrong should count seen");
  assert(stat.correct === 3, "wrong should not increment correct");
});

run("pickRule weights box 0 about five times box 4", () => {
  const pool = ["weak", "strong"];
  const rules = { weak: { box: 0 }, strong: { box: 4 } };
  const byRule = { weak: [{}], strong: [{}] };
  const counts = { weak: 0, strong: 0 };
  const rand = seeded(42);
  for (let i = 0; i < 12000; i++) counts[t.pickRule(pool, rules, byRule, rand)]++;
  const ratio = counts.weak / counts.strong;
  assert(ratio > 4.4 && ratio < 5.6, "expected ratio near 5, got " + ratio);
});

run("pickWord avoids last ten when an alternative exists", () => {
  const words = [];
  const recent = [];
  for (let i = 0; i < 12; i++) {
    const item = { word: { th: "w" + i } };
    words.push(item);
    if (i < 10) recent.push("w" + i);
  }
  for (let i = 0; i < 50; i++) {
    const picked = t.pickWord(words, recent, () => i / 50);
    assert(recent.indexOf(picked.word.th) === -1, "picked recent word " + picked.word.th);
  }
});

run("evaluateRound qualifies by score and speed rules", () => {
  assert(t.evaluateRound(1, 11, 12, Array(12).fill(2400)).qualifies, "11/12 should qualify level 1");
  assert(!t.evaluateRound(1, 10, 12, Array(12).fill(1200)).qualifies, "10/12 should not qualify");
  assert(t.evaluateRound(6, 11, 12, Array(12).fill(2400)).qualifies, "level 6 slow median should still qualify");
  assert(t.evaluateRound(7, 11, 12, Array(12).fill(1999)).qualifies, "level 7 median under 2000 should qualify");
  assert(!t.evaluateRound(7, 11, 12, Array(12).fill(2000)).qualifies, "level 7 median 2000 should not qualify");
});

run("passing requires two qualifying rounds", () => {
  let level = { rounds: 0, good: 0, passed: false, best: 0, introSeen: true };
  let result = t.updateLevelProgress(level, 1, 11, 12, Array(12).fill(1000));
  assert(result.level.good === 1, "first qualifying round increments good");
  assert(!result.level.passed, "one qualifying round is not passed");
  result = t.updateLevelProgress(result.level, 1, 10, 12, Array(12).fill(1000));
  assert(result.level.good === 1, "non-qualifying round does not increment good");
  assert(!result.level.passed, "still not passed");
  result = t.updateLevelProgress(result.level, 1, 12, 12, Array(12).fill(1000));
  assert(result.level.good === 2, "second qualifying round increments good");
  assert(result.level.passed, "two qualifying rounds pass");
});

run("migrateState shifts old tone levels and preserves rules", () => {
  const old = {
    rules: { "mid-live": { box: 3, seen: 4, correct: 3, lastSeen: 99 } },
    levels: {
      1: { rounds: 1, good: 1, passed: false, best: 10, introSeen: true },
      5: { rounds: 5, good: 2, passed: true, best: 12, introSeen: true },
      6: { rounds: 6, good: 1, passed: false, best: 11, introSeen: true }
    },
    lastSession: { at: 1 }
  };
  const migrated = t.migrateState(old);
  assert(migrated.version === 2, "version should be 2");
  assert(migrated.rules["mid-live"].box === 3, "rules should be preserved");
  assert(migrated.levels[5].rounds === 0 && !migrated.levels[5].passed && !migrated.levels[5].introSeen, "new level 5 should be fresh");
  assert(migrated.levels[6].rounds === 5 && migrated.levels[6].passed, "old level 5 should move to level 6");
  assert(migrated.levels[7].rounds === 6 && migrated.levels[7].best === 11, "old level 6 should move to level 7");
  for (let i = 1; i <= 7; i++) assert(migrated.levels[i], "missing level " + i);
});

run("buildTableItem assigns length only where the table needs it", () => {
  const midLive = t.buildTableItem("mid-live", () => 0);
  const lowLive = t.buildTableItem("low-live", () => 0);
  assert(midLive.life === "live" && midLive.length === null, "mid live should not have length");
  assert(lowLive.life === "live" && lowLive.length === null, "low live should not have length");

  const midDeadShort = t.buildTableItem("mid-dead", () => 0.1);
  const midDeadLong = t.buildTableItem("mid-dead", () => 0.9);
  const highDead = t.buildTableItem("high-dead", () => 0.9);
  assert(midDeadShort.length === "short", "mid dead can show short length");
  assert(midDeadLong.length === "long", "mid dead can show long length");
  assert(highDead.length === "long", "high dead should always get a length chip");

  assert(t.buildTableItem("low-dead-short", () => 0.9).length === "short", "low dead short should force short");
  assert(t.buildTableItem("table:low-dead-long", () => 0.1).length === "long", "low dead long should force long");
});
