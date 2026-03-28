/**
 * Thai time utilities — generates correct Thai time strings for any hour:minute.
 * Two systems: formal 24-hour and colloquial 6-period.
 * Also handles Thai dates and Thai numerals.
 *
 * === UNIT TEST CASES (colloquial system) ===
 * 00:00 → เที่ยงคืน (thîang kheun) — midnight
 * 01:00 → ตีหนึ่ง (dtii nùeng) — 1am
 * 05:00 → ตีห้า (dtii hâa) — 5am
 * 06:00 → หกโมงเช้า (hòk mohng cháo) — 6am, special morning marker
 * 07:00 → เจ็ดโมงเช้า (jèt mohng cháo) — 7am, uses actual hour number
 * 12:00 → เที่ยง (thîang) — noon, standalone
 * 13:00 → บ่ายหนึ่งโมง (bàai nùeng mohng) — 1pm
 * 15:00 → บ่ายสามโมง (bàai sǎam mohng) — 3pm, last of baai period
 * 16:00 → สี่โมงเย็น (sìi mohng yen) — 4pm, start of yen period
 * 18:00 → หกโมงเย็น (hòk mohng yen) — 6pm, last of yen period
 * 19:00 → หนึ่งทุ่ม (nùeng thûm) — 7pm, start of thum period
 * 23:00 → ห้าทุ่ม (hâa thûm) — 11pm
 * 23:30 → ห้าทุ่ม ครึ่ง (hâa thûm khrûeng) — 11:30pm
 */
const ThaiTime = (() => {

  /* ── Thai number words with tone diacritics ── */
  const UNITS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const UNITS_ROM = ["", "nùeng", "sǎawng", "sǎam", "sìi", "hâa", "hòk", "jèt", "bpàet", "gâo"];

  function thaiNumber(n) {
    if (n === 0) return { thai: "ศูนย์", rom: "sǔun" };
    if (n <= 9) return { thai: UNITS[n], rom: UNITS_ROM[n] };
    if (n === 10) return { thai: "สิบ", rom: "sìp" };
    if (n === 11) return { thai: "สิบเอ็ด", rom: "sìp-èt" };
    if (n <= 19) return { thai: "สิบ" + UNITS[n - 10], rom: "sìp-" + UNITS_ROM[n - 10] };
    if (n === 20) return { thai: "ยี่สิบ", rom: "yîi-sìp" };
    if (n === 21) return { thai: "ยี่สิบเอ็ด", rom: "yîi-sìp-èt" };
    if (n <= 29) return { thai: "ยี่สิบ" + UNITS[n - 20], rom: "yîi-sìp-" + UNITS_ROM[n - 20] };
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    let thai = UNITS[tens] + "สิบ";
    let rom = UNITS_ROM[tens] + "-sìp";
    if (ones === 1) { thai += "เอ็ด"; rom += "-èt"; }
    else if (ones > 0) { thai += UNITS[ones]; rom += "-" + UNITS_ROM[ones]; }
    return { thai, rom };
  }

  /* ── Formal 24-hour system ── */
  function formal(hour, minute) {
    if (hour === 0 && minute === 0) {
      return { thai: "เที่ยงคืน", rom: "thîang kheun", english: "midnight" };
    }
    if (hour === 12 && minute === 0) {
      return { thai: "เที่ยงวัน", rom: "thîang wan", english: "noon" };
    }

    const hNum = thaiNumber(hour);
    let thai = hNum.thai + " นาฬิกา";
    let rom = hNum.rom + " naa-lí-gaa";

    if (minute > 0) {
      const mNum = thaiNumber(minute);
      thai += " " + mNum.thai + " นาที";
      rom += " " + mNum.rom + " naa-thii";
    }

    const hh = hour.toString().padStart(2, "0");
    const mm = minute.toString().padStart(2, "0");
    return { thai, rom, english: `${hh}:${mm}` };
  }

  /* ── Colloquial 6-period system ── */
  function colloquial(hour, minute) {
    let hourThai, hourRom;

    if (hour === 0) {
      hourThai = "เที่ยงคืน";
      hourRom = "thîang kheun";
    } else if (hour >= 1 && hour <= 5) {
      const n = thaiNumber(hour);
      hourThai = "ตี" + n.thai;
      hourRom = "dtii " + n.rom;
    } else if (hour === 6) {
      hourThai = "หกโมงเช้า";
      hourRom = "hòk mohng cháo";
    } else if (hour >= 7 && hour <= 11) {
      const n = thaiNumber(hour);
      hourThai = n.thai + "โมงเช้า";
      hourRom = n.rom + " mohng cháo";
    } else if (hour === 12) {
      hourThai = "เที่ยง";
      hourRom = "thîang";
    } else if (hour >= 13 && hour <= 15) {
      const n = thaiNumber(hour - 12);
      hourThai = "บ่าย" + n.thai + "โมง";
      hourRom = "bàai " + n.rom + " mohng";
    } else if (hour >= 16 && hour <= 18) {
      const n = thaiNumber(hour - 12);
      hourThai = n.thai + "โมงเย็น";
      hourRom = n.rom + " mohng yen";
    } else if (hour >= 19 && hour <= 23) {
      const n = thaiNumber(hour - 18);
      hourThai = n.thai + "ทุ่ม";
      hourRom = n.rom + " thûm";
    }

    let minThai = "", minRom = "";
    if (minute === 30) {
      minThai = "ครึ่ง";
      minRom = "khrûeng";
    } else if (minute > 0) {
      const mNum = thaiNumber(minute);
      minThai = mNum.thai + " นาที";
      minRom = mNum.rom + " naa-thii";
    }

    const thai = minThai ? hourThai + " " + minThai : hourThai;
    const rom = minRom ? hourRom + " " + minRom : hourRom;

    const period = hour < 12 ? "AM" : hour < 24 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const mm = minute.toString().padStart(2, "0");
    const english = `${h12}:${mm} ${period}`;

    return { thai, rom, english };
  }

  /* ── Thai date ── */
  const THAI_DAYS = [
    { thai: "วันอาทิตย์", rom: "Wan Aa-thít" },
    { thai: "วันจันทร์", rom: "Wan Jan" },
    { thai: "วันอังคาร", rom: "Wan Ang-khaan" },
    { thai: "วันพุธ", rom: "Wan Phút" },
    { thai: "วันพฤหัสบดี", rom: "Wan Phá-rúe-hàt" },
    { thai: "วันศุกร์", rom: "Wan Sùk" },
    { thai: "วันเสาร์", rom: "Wan Sǎo" }
  ];

  const THAI_MONTHS = [
    { thai: "มกราคม", rom: "Mòk-kà-raa-khom" },
    { thai: "กุมภาพันธ์", rom: "Kum-phaa-phan" },
    { thai: "มีนาคม", rom: "Mii-naa-khom" },
    { thai: "เมษายน", rom: "Meh-sǎa-yon" },
    { thai: "พฤษภาคม", rom: "Phruét-sà-phaa-khom" },
    { thai: "มิถุนายน", rom: "Mí-thù-naa-yon" },
    { thai: "กรกฎาคม", rom: "Kà-rák-kà-daa-khom" },
    { thai: "สิงหาคม", rom: "Sǐng-hǎa-khom" },
    { thai: "กันยายน", rom: "Kan-yaa-yon" },
    { thai: "ตุลาคม", rom: "Tù-laa-khom" },
    { thai: "พฤศจิกายน", rom: "Phruét-sà-jì-kaa-yon" },
    { thai: "ธันวาคม", rom: "Than-waa-khom" }
  ];

  function thaiDate(date) {
    const d = date || new Date();
    const dow = THAI_DAYS[d.getDay()];
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const gregorian = d.getFullYear();
    const buddhist = gregorian + 543;

    return {
      dayOfWeek: dow,
      day: thaiNumber(day),
      month: month,
      gregorianYear: gregorian,
      buddhistYear: buddhist,
      thai: `${dow.thai}ที่ ${day} ${month.thai} พ.ศ. ${buddhist}`,
      rom: `${dow.rom} thîi ${day} ${month.rom} Phaw Saw ${buddhist}`,
      english: `${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]}, ${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]} ${day}, ${gregorian}`
    };
  }

  /* ── Thai numeral characters ── */
  function toThaiNumerals(n) {
    const digits = "๐๑๒๓๔๕๖๗๘๙";
    return String(n).split("").map(c => digits[parseInt(c)] || c).join("");
  }

  return { thaiNumber, formal, colloquial, thaiDate, toThaiNumerals };
})();
