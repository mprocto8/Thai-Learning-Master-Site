const Syllable = require("../js/syllable.js");

let failures = 0;

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function pass(name) {
  console.log("PASS " + name);
}

function fail(name, detail) {
  failures += 1;
  console.log("FAIL " + name + " - " + detail);
}

function checkWord(word, live, tone) {
  const a = Syllable.analyze(word);
  const name = word + " live=" + live + " tone=" + tone;
  if (!a) return fail(name, "unparsed");
  if (a.live !== live) return fail(name, "live " + a.live);
  if (a.tone !== tone) return fail(name, "tone " + a.tone);
  pass(name);
}

function checkNull(word) {
  const a = Syllable.analyze(word);
  if (a !== null) return fail(word + " null", "parsed as " + JSON.stringify(a));
  pass(word + " null");
}

function checkProp(word, props) {
  const a = Syllable.analyze(word);
  if (!a) return fail(word + " props", "unparsed");
  for (const key of Object.keys(props)) {
    if (!same(a[key], props[key])) {
      return fail(word + " " + key, JSON.stringify(a[key]) + " !== " + JSON.stringify(props[key]));
    }
  }
  pass(word + " props");
}

"กิน ดี ตา ไป จาน ปู เดิน ใจ ดำ".split(" ").forEach((w) => checkWord(w, true, "mid"));
"กบ จาก ปาก เด็ก ติด จะ เตะ เกาะ บาท ดุ".split(" ").forEach((w) => checkWord(w, false, "low"));
"ขา สาม ผม หู ถุง สูง หมา หนู เสือ ไข ขาว สวย หวาน".split(" ").forEach((w) => checkWord(w, true, "rising"));
"สิบ ผัก ขาด หก ถูก สุข หมด หนัก หลับ".split(" ").forEach((w) => checkWord(w, false, "low"));
"มา นาน ลม คน ยาย งู ทำ ไฟ เรา ลอง เมือง คุณ ควาย".split(" ").forEach((w) => checkWord(w, true, "mid"));
"นก รัก คิด มด พบ ลด รถ และ เยอะ ทุก พริก ครับ".split(" ").forEach((w) => checkWord(w, false, "high"));
"มาก ยาก ลูก พูด เลือด รีบ โลก ภาพ เลข โรค ชอบ มีด".split(" ").forEach((w) => checkWord(w, false, "falling"));

[
  ["ไม่", "falling"], ["ได้", "falling"], ["น้ำ", "high"], ["ข้าว", "falling"],
  ["ที่", "falling"], ["ไก่", "low"], ["ม้า", "high"], ["ใหม่", "low"],
  ["ห้า", "falling"], ["อยู่", "low"], ["จ๋า", "rising"]
].forEach(([word, tone]) => {
  const a = Syllable.analyze(word);
  if (!a) return fail(word + " mark", "unparsed");
  if (typeof a.live !== "boolean") return fail(word + " mark", "live is not boolean");
  if (a.tone !== tone) return fail(word + " mark", "tone " + a.tone);
  pass(word + " mark");
});

"ตลาด สนาม อาหาร จริง ทราย กอล์ฟ".split(" ").forEach(checkNull);

[
  ["กิน", { ruleKey: "final-live", toneKey: "mid-live" }],
  ["กบ", { ruleKey: "final-dead", toneKey: "mid-dead" }],
  ["ขา", { ruleKey: "open-long", toneKey: "high-live" }],
  ["จะ", { ruleKey: "open-short", toneKey: "mid-dead" }],
  ["ทำ", { ruleKey: "hidden-ending", toneKey: "low-live" }],
  ["คุณ", { ruleKey: "disguised-n", toneKey: "low-live" }],
  ["มีด", { ruleKey: "final-dead", toneKey: "low-dead-long" }],
  ["สุข", { ruleKey: "disguised-kp", toneKey: "high-dead" }],
  ["รถ", { ruleKey: "disguised-t", toneKey: "low-dead-short" }],
  ["ภาพ", { ruleKey: "disguised-kp", toneKey: "low-dead-long" }]
].forEach(([word, props]) => checkProp(word, props));

[
  ["ไม่", { decider: { kind: "hidden", indices: [0] } }],
  ["ข้าว", { decider: { kind: "final", indices: [3] } }],
  ["คุณ", { decider: { kind: "final", indices: [2] } }],
  ["จะ", { decider: { kind: "vowel", indices: [1] } }],
  ["เสือ", { decider: { kind: "vowel", indices: [0, 2, 3] } }],
  ["หมา", { initialIndices: [0, 1] }],
  ["ครับ", { initialIndices: [0, 1] }]
].forEach(([word, props]) => checkProp(word, props));

if (failures > 0) {
  console.log(failures + " syllable test(s) failed");
  process.exit(1);
}

console.log("All syllable tests passed");
