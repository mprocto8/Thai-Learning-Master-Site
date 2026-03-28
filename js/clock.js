/**
 * Live Thai clock — analog face + digital display in 3 formats + Thai date.
 * Always shows both Thai script and romanized for the time formats.
 */
const Clock = (() => {
  let intervalId = null;

  function show() {
    render();
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(updateTime, 1000);
  }

  function cleanup() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function render() {
    const now = new Date();
    const dateInfo = ThaiTime.thaiDate(now);

    UI.render(`
      <div class="clock-screen">
        ${UI.navBar("dashboard")}

        <div class="section-header">
          <h1>🕐 Thai Clock</h1>
          <p>Learn to tell time in Thai</p>
        </div>

        <div class="clock-face-container">
          <svg class="clock-face" viewBox="0 0 200 200">
            <!-- Outer ring -->
            <circle cx="100" cy="100" r="95" fill="none" stroke="var(--surface-2)" stroke-width="2"/>
            <circle cx="100" cy="100" r="92" fill="var(--bg-1)"/>

            <!-- Hour markers -->
            ${[...Array(12)].map((_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const x1 = 100 + 80 * Math.sin(angle);
              const y1 = 100 - 80 * Math.cos(angle);
              const x2 = 100 + (i % 3 === 0 ? 70 : 74) * Math.sin(angle);
              const y2 = 100 - (i % 3 === 0 ? 70 : 74) * Math.cos(angle);
              const w = i % 3 === 0 ? 2.5 : 1;
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--text-2)" stroke-width="${w}" stroke-linecap="round"/>`;
            }).join("")}

            <!-- Minute ticks -->
            ${[...Array(60)].map((_, i) => {
              if (i % 5 === 0) return "";
              const angle = (i * 6) * Math.PI / 180;
              const x1 = 100 + 80 * Math.sin(angle);
              const y1 = 100 - 80 * Math.cos(angle);
              const x2 = 100 + 77 * Math.sin(angle);
              const y2 = 100 - 77 * Math.cos(angle);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--surface-3)" stroke-width="0.5"/>`;
            }).join("")}

            <!-- Hour numbers -->
            ${[...Array(12)].map((_, i) => {
              const num = i === 0 ? 12 : i;
              const angle = (i * 30) * Math.PI / 180;
              const x = 100 + 62 * Math.sin(angle);
              const y = 100 - 62 * Math.cos(angle) + 4;
              return `<text x="${x}" y="${y}" text-anchor="middle" fill="var(--text-1)" font-size="10" font-weight="600">${num}</text>`;
            }).join("")}

            <!-- Hands (updated by JS) -->
            <line id="clock-hour" x1="100" y1="100" x2="100" y2="55" stroke="var(--text-0)" stroke-width="3.5" stroke-linecap="round"/>
            <line id="clock-minute" x1="100" y1="100" x2="100" y2="35" stroke="var(--text-0)" stroke-width="2" stroke-linecap="round"/>
            <line id="clock-second" x1="100" y1="110" x2="100" y2="30" stroke="var(--accent)" stroke-width="1" stroke-linecap="round"/>

            <!-- Center dot -->
            <circle cx="100" cy="100" r="3.5" fill="var(--accent)"/>
            <circle cx="100" cy="100" r="1.5" fill="var(--bg-0)"/>
          </svg>
        </div>

        <div class="clock-digital">
          <div class="clock-digital-main" id="clock-digital-main"></div>
        </div>

        <div class="clock-time-formats" id="clock-formats">
          <!-- Updated every second by JS -->
        </div>

        <div class="clock-date-section">
          <div class="clock-date-row">
            <span class="clock-date-label">🇹🇭</span>
            <span class="clock-date-thai" id="date-thai">${dateInfo.thai}</span>
          </div>
          <div class="clock-date-row">
            <span class="clock-date-label">🔤</span>
            <span class="clock-date-rom" id="date-rom">${dateInfo.rom}</span>
          </div>
          <div class="clock-date-row">
            <span class="clock-date-label">🌐</span>
            <span class="clock-date-eng" id="date-eng">${dateInfo.english}</span>
          </div>
          <div class="clock-era-row">
            <span class="clock-era-badge">พ.ศ. ${dateInfo.buddhistYear}</span>
            <span class="clock-era-badge era-gregorian">ค.ศ. ${dateInfo.gregorianYear}</span>
          </div>
        </div>

        <div class="clock-cta">
          <button class="btn btn-primary" onclick="UI.navigate('#time-game')">🎮 Practice Telling Time</button>
        </div>
      </div>
    `);

    updateTime();
  }

  function updateTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Update analog hands
    const hourAngle = ((h % 12) + m / 60) * 30;
    const minAngle = (m + s / 60) * 6;
    const secAngle = s * 6;

    setHandAngle("clock-hour", hourAngle, 45);
    setHandAngle("clock-minute", minAngle, 35);
    setHandAngle("clock-second", secAngle, 30, 10);

    // Digital main display
    const digitalMain = document.getElementById("clock-digital-main");
    if (digitalMain) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      const ss = s.toString().padStart(2, "0");
      digitalMain.innerHTML = `
        <span class="digital-time">${hh}:${mm}<span class="digital-seconds">:${ss}</span></span>
        <span class="digital-thai-numerals">${ThaiTime.toThaiNumerals(hh)}:${ThaiTime.toThaiNumerals(mm)}</span>
      `;
    }

    // Time formats — always show both Thai script and romanized
    const formats = document.getElementById("clock-formats");
    if (formats) {
      const formalTime = ThaiTime.formal(h, m);
      const colloqTime = ThaiTime.colloquial(h, m);

      formats.innerHTML = `
        <div class="time-format-card">
          <div class="time-format-label">Formal 24-hour</div>
          <div class="time-format-thai">${formalTime.thai}</div>
          <div class="time-format-rom">${formalTime.rom}</div>
        </div>
        <div class="time-format-card colloquial">
          <div class="time-format-label">Colloquial</div>
          <div class="time-format-thai">${colloqTime.thai}</div>
          <div class="time-format-rom">${colloqTime.rom}</div>
        </div>
        <div class="time-format-card english">
          <div class="time-format-label">English</div>
          <div class="time-format-english">${colloqTime.english}</div>
        </div>
      `;
    }
  }

  function setHandAngle(id, degrees, length, tailLength = 0) {
    const el = document.getElementById(id);
    if (!el) return;
    const cx = 100, cy = 100;
    const x2 = cx + length * Math.sin(degrees * Math.PI / 180);
    const y2 = cy - length * Math.cos(degrees * Math.PI / 180);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    if (tailLength) {
      const x1 = cx - tailLength * Math.sin(degrees * Math.PI / 180);
      const y1 = cy + tailLength * Math.cos(degrees * Math.PI / 180);
      el.setAttribute("x1", x1);
      el.setAttribute("y1", y1);
    }
  }

  return { show, cleanup };
})();
