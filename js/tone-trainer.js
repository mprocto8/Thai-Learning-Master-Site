/**
 * Tone Trainer — learn Thai's 5 tones with visual pitch contours, examples, and quizzes.
 */
const ToneTrainer = (() => {

  const TONES = [
    {
      id: "mid",
      nameThai: "สามัญ",
      nameRom: "saa-man",
      nameEng: "Mid Tone",
      mark: "—",
      markChar: "",
      description: "Flat, level pitch — your normal speaking voice. No rise, no fall. Like saying 'duh' in a monotone.",
      example: { thai: "กา", rom: "gaa", english: "crow" },
      mnemonic: "Imagine a flat road stretching straight ahead",
      // SVG pitch contour: flat line in the middle. endX/endY = arrow tip position.
      contour: "M 10 50 L 90 50", endX: 90, endY: 50
    },
    {
      id: "low",
      nameThai: "เอก",
      nameRom: "eek",
      nameEng: "Low Tone",
      mark: " ่",
      markChar: "่",
      description: "Start low and stay low — like a disappointed sigh. Pitch is below your normal voice.",
      example: { thai: "ก่า", rom: "gàa", english: "(example)" },
      exampleReal: { thai: "เด่น", rom: "dèn", english: "outstanding" },
      mnemonic: "Your voice drops like stepping down a stair",
      contour: "M 10 40 Q 30 55 50 60 Q 70 62 90 65", endX: 90, endY: 65
    },
    {
      id: "falling",
      nameThai: "โท",
      nameRom: "thoo",
      nameEng: "Falling Tone",
      mark: " ้",
      markChar: "้",
      description: "Start high and fall down sharply — like saying 'NO!' in an emphatic way. Dramatic drop.",
      example: { thai: "บ้าน", rom: "bâan", english: "house" },
      mnemonic: "Like a ball thrown up that falls back down — whooomp",
      contour: "M 10 25 Q 30 30 50 50 Q 70 65 90 75", endX: 90, endY: 75
    },
    {
      id: "high",
      nameThai: "ตรี",
      nameRom: "dtrii",
      nameEng: "High Tone",
      mark: " ๊",
      markChar: "๊",
      description: "Start high and stay high — bright and elevated, like asking a surprised question. Higher than your normal voice.",
      example: { thai: "โต๊ะ", rom: "dtó", english: "table" },
      mnemonic: "Imagine reaching up to a high shelf — voice goes up and stays",
      contour: "M 10 45 Q 30 30 50 25 Q 70 23 90 22", endX: 90, endY: 22
    },
    {
      id: "rising",
      nameThai: "จัตวา",
      nameRom: "jàt-dtà-waa",
      nameEng: "Rising Tone",
      mark: " ๋",
      markChar: "๋",
      description: "Start low then rise up — like asking a yes/no question in English: 'Really?' The pitch climbs.",
      example: { thai: "หม๋อ", rom: "mǒo", english: "pot (rare)" },
      exampleReal: { thai: "สวย", rom: "sǔay", english: "beautiful" },
      mnemonic: "Like an airplane taking off — vroom, pitch rises!",
      contour: "M 10 65 Q 30 60 50 50 Q 70 35 90 25", endX: 90, endY: 25
    }
  ];

  // Which consonant classes + tone marks produce which tones
  const TONE_RULES = [
    { mark: "No mark", high: "Rising", mid: "Mid", low: "Mid" },
    { mark: "่ (mái èek)", high: "Low", mid: "Low", low: "Falling" },
    { mark: "้ (mái thoo)", high: "Falling", mid: "Falling", low: "High" },
    { mark: "๊ (mái dtrii)", high: "—", mid: "High", low: "—" },
    { mark: "๋ (mái jàt-dtà-waa)", high: "—", mid: "Rising", low: "—" }
  ];

  let mode = "browse"; // "browse" | "quiz"
  let quizQueue = [];
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizTotal = 0;

  function show() {
    mode = "browse";
    renderBrowse();
  }

  function renderBrowse() {
    const stats = State.get().alphabetStats;

    UI.render(`
      <div class="tone-screen">
        ${UI.navBar("tones")}

        <div class="section-header">
          <h1>🎵 Thai Tones</h1>
          <p>Thai has 5 tones — the same syllable means different things depending on tone</p>
        </div>

        <div class="tone-quiz-cta">
          <button class="btn btn-primary" onclick="ToneTrainer.startQuiz()">🧠 Tone Quiz</button>
        </div>

        <div class="tone-cards">
          ${TONES.map(t => {
            const s = stats[`tone_${t.id}`];
            const mastery = s ? Math.round((s.correct / Math.max(s.seen, 1)) * 100) : 0;
            const ex = t.exampleReal || t.example;
            return `
              <div class="tone-card tone-${t.id}">
                <div class="tone-card-header">
                  <div class="tone-name-group">
                    <h3 class="tone-name-eng">${t.nameEng}</h3>
                    <span class="tone-name-thai">${t.nameThai} (${t.nameRom})</span>
                  </div>
                  <div class="tone-mark-display">${t.markChar || '—'}</div>
                </div>

                <div class="tone-contour">
                  <svg viewBox="0 0 100 80" class="tone-contour-svg">
                    <line x1="5" y1="75" x2="95" y2="75" stroke="var(--surface-2)" stroke-width="0.5"/>
                    <text x="2" y="78" font-size="6" fill="var(--text-2)">Low</text>
                    <text x="2" y="18" font-size="6" fill="var(--text-2)">High</text>
                    <path d="${t.contour}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
                    <!-- Arrow tip -->
                    <circle cx="${t.endX}" cy="${t.endY}" r="3" fill="var(--accent)"/>
                  </svg>
                </div>

                <p class="tone-description">${t.description}</p>

                <div class="tone-example">
                  <span class="tone-ex-thai">${ex.thai}</span>
                  <span class="tone-ex-rom">${ex.rom}</span>
                  <span class="tone-ex-eng">= ${ex.english}</span>
                </div>

                <p class="tone-mnemonic">💡 ${t.mnemonic}</p>

                ${s ? `<div class="alpha-mastery">${mastery}% mastered</div>` : ''}
              </div>
            `;
          }).join("")}
        </div>

        <div class="tone-rules-section">
          <h3>Tone Rules by Consonant Class</h3>
          <p class="tone-rules-note">The tone of a syllable depends on the consonant class + tone mark:</p>
          <div class="tone-rules-table">
            <div class="tone-rules-header">
              <span>Mark</span>
              <span class="class-high">High</span>
              <span class="class-mid">Mid</span>
              <span class="class-low">Low</span>
            </div>
            ${TONE_RULES.map(r => `
              <div class="tone-rules-row">
                <span class="tone-rule-mark">${r.mark}</span>
                <span>${r.high}</span>
                <span>${r.mid}</span>
                <span>${r.low}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `);
  }

  function startQuiz() {
    mode = "quiz";
    quizIndex = 0;
    quizCorrect = 0;
    quizTotal = 0;
    quizQueue = [...TONES, ...TONES].sort(() => Math.random() - 0.5); // 10 questions
    nextQuestion();
  }

  function nextQuestion() {
    if (quizIndex >= quizQueue.length) {
      finishQuiz();
      return;
    }

    const tone = quizQueue[quizIndex];

    // Random question type
    const qType = Math.random() < 0.5 ? "name" : "contour";

    // Generate options
    const wrongTones = TONES.filter(t => t.id !== tone.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrongTones.map(t => ({ label: t.nameEng, id: t.id })), { label: tone.nameEng, id: tone.id }]
      .sort(() => Math.random() - 0.5);

    UI.render(`
      <div class="quiz-screen">
        <div class="game-header">
          <button class="btn btn-ghost back-btn" onclick="ToneTrainer.show()">← Back</button>
          <h2>🎵 Tone Quiz</h2>
          <span class="card-counter">${quizIndex + 1}/${quizQueue.length}</span>
        </div>

        <div class="flashcard-progress">
          <div class="flashcard-progress-bar" style="width:${(quizIndex / quizQueue.length) * 100}%"></div>
        </div>

        ${qType === "contour" ? `
          <p class="quiz-prompt">Which tone does this pitch contour represent?</p>
          <div class="tone-contour-quiz">
            <svg viewBox="0 0 100 80" class="tone-contour-svg large">
              <line x1="5" y1="75" x2="95" y2="75" stroke="var(--surface-2)" stroke-width="0.5"/>
              <text x="2" y="78" font-size="6" fill="var(--text-2)">Low</text>
              <text x="2" y="18" font-size="6" fill="var(--text-2)">High</text>
              <path d="${tone.contour}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
        ` : `
          <p class="quiz-prompt">What kind of tone is this?</p>
          <div class="quiz-char-display">
            <div class="quiz-char">${tone.nameThai}</div>
            <div class="tone-description-quiz">${tone.description}</div>
          </div>
        `}

        <div class="quiz-options">
          ${options.map((opt, i) => `
            <button class="btn quiz-option" onclick="ToneTrainer.quizAnswer(this, '${opt.id}', '${tone.id}')">${opt.label}</button>
          `).join("")}
        </div>

        <div class="game-score-bar">
          <span>✅ ${quizCorrect}</span>
          <span>❌ ${quizTotal - quizCorrect}</span>
        </div>
      </div>
    `);
  }

  function quizAnswer(btn, chosenId, correctId) {
    quizTotal++;
    const isCorrect = chosenId === correctId;

    document.querySelectorAll(".quiz-option").forEach(b => {
      b.disabled = true;
      if (b.textContent.trim() === TONES.find(t => t.id === correctId).nameEng) {
        b.classList.add("correct");
      }
    });

    if (isCorrect) {
      quizCorrect++;
      btn.classList.add("correct");
      State.recordAlphabetAnswer(`tone_${correctId}`, true);
      State.addXP(10);
      State.checkStreak();
    } else {
      btn.classList.add("wrong");
      State.recordAlphabetAnswer(`tone_${correctId}`, false);
      quizQueue.push(TONES.find(t => t.id === correctId));
    }

    setTimeout(() => {
      quizIndex++;
      nextQuestion();
    }, 700);
  }

  function finishQuiz() {
    State.addXP(50);
    const accuracy = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;

    UI.render(`
      <div class="round-complete">
        <div class="round-complete-card">
          <div class="round-complete-icon">🎵</div>
          <h2>Tone Quiz Complete!</h2>
          <div class="round-stats">
            <div class="round-stat">
              <span class="round-stat-value">${accuracy}%</span>
              <span class="round-stat-label">Accuracy</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${quizCorrect}/${quizTotal}</span>
              <span class="round-stat-label">Correct</span>
            </div>
            <div class="round-stat">
              <span class="round-stat-value">${quizCorrect * 10 + 50}</span>
              <span class="round-stat-label">XP Earned</span>
            </div>
          </div>
          <div class="round-actions">
            <button class="btn btn-primary" onclick="ToneTrainer.startQuiz()">Quiz Again</button>
            <button class="btn btn-secondary" onclick="ToneTrainer.show()">Browse Tones</button>
          </div>
        </div>
      </div>
    `);
  }

  return { show, startQuiz, quizAnswer };
})();
