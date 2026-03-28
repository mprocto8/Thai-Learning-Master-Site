/**
 * Thai time utilities — generates correct Thai time strings for any hour:minute.
 * Two systems: formal 24-hour and colloquial 6-period.
 * Also handles Thai dates and Thai numerals.
 *
 * === UNIT TEST CASES (colloquial system) ===
 * 00:00 → เที่ยงคืน (thiang khuuen) — midnight
 * 01:00 → ตีหนึ่ง (dtii nueng) — 1am
 * 05:00 → ตีห้า (dtii haa) — 5am
 * 06:00 → หกโมงเช้า (hok moong chao) — 6am, special morning marker
 * 07:00 → เจ็ดโมงเช้า (jet moong chao) — 7am, uses actual hour number
 * 12:00 → เที่ยง (thiang) — noon, standalone
 * 13:00 → บ่ายหนึ่งโมง (baai nueng moong) — 1pm
 * 15:00 → บ่ายสามโมง (baai saam moong) — 3pm, last of baai period
 * 16:00 → สี่โมงเย็น (see moong yen) — 4pm, start of yen period
 * 18:00 → หกโมงเย็น (hok moong yen) — 6pm, last of yen period
 * 19:00 → หนึ่งทุ่ม (nueng thum) — 7pm, start of thum period
 * 23:00 → ห้าทุ่ม (haa thum) — 11pm
 * 23:30 → ห้าทุ่ม ครึ่ง (haa thum khrueng) — 11:30pm
 */
const ThaiTime = (() => {

  /* ── Thai number words ── */
  const UNITS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const UNITS_ROM = ["", "nueng", "sawng", "saam", "see", "haa", "hok", "jet", "bpaet", "gaao"];

  // Special: in compounds, 1 in ones place uses เอ็ด (et) and 2 in tens place uses ยี่ (yii)
  function thaiNumber(n) {
    if (n === 0) return { thai: "ศูนย์", rom: "suun" };
    if (n <= 9) return { thai: UNITS[n], rom: UNITS_ROM[n] };
    if (n === 10) return { thai: "สิบ", rom: "sip" };
    if (n === 11) return { thai: "สิบเอ็ด", rom: "sip-et" };
    if (n <= 19) return { thai: "สิบ" + UNITS[n - 10], rom: "sip-" + UNITS_ROM[n - 10] };
    if (n === 20) return { thai: "ยี่สิบ", rom: "yii-sip" };
    if (n === 21) return { thai: "ยี่สิบเอ็ด", rom: "yii-sip-et" };
    if (n <= 29) return { thai: "ยี่สิบ" + UNITS[n - 20], rom: "yii-sip-" + UNITS_ROM[n - 20] };
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    let thai = UNITS[tens] + "สิบ";
    let rom = UNITS_ROM[tens] + "-sip";
    if (ones === 1) { thai += "เอ็ด"; rom += "-et"; }
    else if (ones > 0) { thai += UNITS[ones]; rom += "-" + UNITS_ROM[ones]; }
    return { thai, rom };
  }

  /* ── Formal 24-hour system ── */
  // Format: [hour] นาฬิกา [minute] นาที
  // Midnight = เที่ยงคืน, Noon = เที่ยงวัน
  function formal(hour, minute) {
    if (hour === 0 && minute === 0) {
      return { thai: "เที่ยงคืน", rom: "thiang khuuen", english: "midnight" };
    }
    if (hour === 12 && minute === 0) {
      return { thai: "เที่ยงวัน", rom: "thiang wan", english: "noon" };
    }

    const hNum = thaiNumber(hour);
    let thai = hNum.thai + " นาฬิกา";
    let rom = hNum.rom + " naa-li-gaa";

    if (minute > 0) {
      const mNum = thaiNumber(minute);
      thai += " " + mNum.thai + " นาที";
      rom += " " + mNum.rom + " naa-thee";
    }

    const hh = hour.toString().padStart(2, "0");
    const mm = minute.toString().padStart(2, "0");
    return { thai, rom, english: `${hh}:${mm}` };
  }

  /* ── Colloquial 6-period system ── */
  // Midnight (00:00): เที่ยงคืน
  // 1am–5am: ตี [1–5]
  // 6am: หกโมงเช้า
  // 7am–11am: [7–11] โมงเช้า (actual hour number)
  // Noon (12:00): เที่ยง
  // 1pm–3pm: บ่าย [1–3] โมง
  // 4pm–6pm: [4–6] โมงเย็น
  // 7pm–11pm: [1–5] ทุ่ม
  function colloquial(hour, minute) {
    let hourThai, hourRom;

    if (hour === 0) {
      hourThai = "เที่ยงคืน";
      hourRom = "thiang khuuen";
    } else if (hour >= 1 && hour <= 5) {
      // ตี [1-5]
      const n = thaiNumber(hour);
      hourThai = "ตี" + n.thai;
      hourRom = "dtii " + n.rom;
    } else if (hour === 6) {
      hourThai = "หกโมงเช้า";
      hourRom = "hok moong chao";
    } else if (hour >= 7 && hour <= 11) {
      // [7-11] โมงเช้า — use actual hour number
      const n = thaiNumber(hour);
      hourThai = n.thai + "โมงเช้า";
      hourRom = n.rom + " moong chao";
    } else if (hour === 12) {
      hourThai = "เที่ยง";
      hourRom = "thiang";
    } else if (hour >= 13 && hour <= 15) {
      // บ่าย [1-3] โมง
      const n = thaiNumber(hour - 12);
      hourThai = "บ่าย" + n.thai + "โมง";
      hourRom = "baai " + n.rom + " moong";
    } else if (hour >= 16 && hour <= 18) {
      // [4-6] โมงเย็น
      const n = thaiNumber(hour - 12);
      hourThai = n.thai + "โมงเย็น";
      hourRom = n.rom + " moong yen";
    } else if (hour >= 19 && hour <= 23) {
      // [1-5] ทุ่ม
      const n = thaiNumber(hour - 18);
      hourThai = n.thai + "ทุ่ม";
      hourRom = n.rom + " thum";
    }

    // Add minutes
    let minThai = "", minRom = "";
    if (minute === 30) {
      minThai = "ครึ่ง";
      minRom = "khrueng";
    } else if (minute > 0) {
      const mNum = thaiNumber(minute);
      minThai = mNum.thai + " นาที";
      minRom = mNum.rom + " naa-thee";
    }

    const thai = minThai ? hourThai + " " + minThai : hourThai;
    const rom = minRom ? hourRom + " " + minRom : hourRom;

    // Build English
    const period = hour < 12 ? "AM" : hour < 24 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const mm = minute.toString().padStart(2, "0");
    const english = `${h12}:${mm} ${period}`;

    return { thai, rom, english };
  }

  /* ── Thai date ── */
  const THAI_DAYS = [
    { thai: "วันอาทิตย์", rom: "Wan Aa-thit" },
    { thai: "วันจันทร์", rom: "Wan Jan" },
    { thai: "วันอังคาร", rom: "Wan Ang-kaan" },
    { thai: "วันพุธ", rom: "Wan Phut" },
    { thai: "วันพฤหัสบดี", rom: "Wan Pha-rue-hat" },
    { thai: "วันศุกร์", rom: "Wan Suk" },
    { thai: "วันเสาร์", rom: "Wan Sao" }
  ];

  const THAI_MONTHS = [
    { thai: "มกราคม", rom: "Mok-ka-raa-khom" },
    { thai: "กุมภาพันธ์", rom: "Kum-phaa-phan" },
    { thai: "มีนาคม", rom: "Mee-naa-khom" },
    { thai: "เมษายน", rom: "May-saa-yon" },
    { thai: "พฤษภาคม", rom: "Phruet-sa-phaa-khom" },
    { thai: "มิถุนายน", rom: "Mi-thu-naa-yon" },
    { thai: "กรกฎาคม", rom: "Ka-rak-ka-daa-khom" },
    { thai: "สิงหาคม", rom: "Sing-haa-khom" },
    { thai: "กันยายน", rom: "Kan-yaa-yon" },
    { thai: "ตุลาคม", rom: "Tu-laa-khom" },
    { thai: "พฤศจิกายน", rom: "Phruet-sa-ji-kaa-yon" },
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
      rom: `${dow.rom} thee ${day} ${month.rom} Phor Sor ${buddhist}`,
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
