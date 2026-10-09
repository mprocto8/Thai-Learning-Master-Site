// js/livedead-audio.js — which Live/Dead words have a recorded clip.
// Rewritten by the audio generation script; empty means "no audio", and the module works without it.
const LiveDeadAudio = (function () {
  const words = [
    "กิน",
    "จาน",
    "ปาก",
    "นก",
    "มาก",
    "ดี",
    "ขา",
    "จะ",
    "เตะ",
    "เกาะ",
    "ทำ",
    "ใจ",
    "เรา",
    "คุณ",
    "ผล",
    "รถ",
    "บาท",
    "สุข",
    "ภาพ",
    "หญิง"
  ];
  function has(th) { return words.indexOf(th) !== -1; }
  return { words, has };
})();
