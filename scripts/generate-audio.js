/**
 * generate-audio.js — build-time TTS generator (ElevenLabs).
 *
 * Reads data/topics.js, generates one MP3 per Thai word (pair.script)
 * and per example sentence (pair.example.thai). Output is split per voice:
 *
 *   audio/ploy/{topicId}-{i}-word.mp3        ← default tier
 *   audio/serafina/{topicId}-{i}-word.mp3    ← premium tier
 *
 * Usage:
 *   node scripts/generate-audio.js                    # default voice = ploy
 *   node scripts/generate-audio.js --voice=ploy
 *   node scripts/generate-audio.js --voice=serafina
 *   node scripts/generate-audio.js --voice=all        # both voices
 *   node scripts/generate-audio.js --force            # regenerate everything
 *   node scripts/generate-audio.js --limit=3          # first N tasks (test)
 *
 * Caching: per-voice. A serafina file does not satisfy a ploy cache check.
 * Requires scripts/.env with ELEVENLABS_API_KEY.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── Voices ──────────────────────────────────────────────────────────────
const VOICES = {
  ploy: {
    id: 'NhRzFfvPkFFjni1xBM0K',
    folder: 'audio/ploy',
    label: 'Ploy (default)',
  },
  serafina: {
    id: '4tRn1lSkEn13EVTuqb0g',
    folder: 'audio/serafina',
    label: 'Serafina (premium)',
  },
};

// ─── Config ──────────────────────────────────────────────────────────────
const MODEL_ID      = 'eleven_v3';
const OUTPUT_FORMAT = 'mp3_44100_128';
const DELAY_MS      = 1500;
const RETRY_DELAY_MS = 30000;
const OUT_EXT       = '.mp3';

const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

const TOPICS_FILE = path.join(__dirname, '..', 'data', 'topics.js');
const REPO_ROOT   = path.join(__dirname, '..');

// ─── CLI args ────────────────────────────────────────────────────────────
const argv  = process.argv.slice(2);
const FORCE = argv.includes('--force');
const LIMIT = (() => {
  const m = argv.find(a => a.startsWith('--limit='));
  return m ? parseInt(m.split('=')[1], 10) : null;
})();
const VOICE_ARG = (() => {
  const m = argv.find(a => a.startsWith('--voice='));
  return m ? m.split('=')[1] : 'ploy';
})();

function resolveVoices(arg) {
  if (arg === 'all') return Object.keys(VOICES);
  if (VOICES[arg]) return [arg];
  console.error(`Unknown --voice=${arg}. Expected: ploy, serafina, all.`);
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function loadTopics() {
  const src = fs.readFileSync(TOPICS_FILE, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + '\nthis.__TOPICS = TOPICS;', sandbox);
  return sandbox.__TOPICS;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function synthesize(apiKey, voiceId, text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`;
  const body = JSON.stringify({
    text,
    model_id: MODEL_ID,
    voice_settings: VOICE_SETTINGS,
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${errText.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function synthesizeWithRetry(apiKey, voiceId, text) {
  try {
    return await synthesize(apiKey, voiceId, text);
  } catch (err) {
    if (err.status === 401) {
      console.error('\nFATAL: HTTP 401 from ElevenLabs — API key is invalid or unauthorized.');
      console.error('Check ELEVENLABS_API_KEY in scripts/.env.');
      process.exit(1);
    }
    if (err.status === 429) {
      console.log(`\n  rate limited (429), backing off ${RETRY_DELAY_MS / 1000}s and retrying once...`);
      await sleep(RETRY_DELAY_MS);
      return await synthesize(apiKey, voiceId, text);
    }
    throw err;
  }
}

function buildTasks(topics) {
  const tasks = [];
  for (const topic of topics) {
    topic.pairs.forEach((pair, i) => {
      if (pair.script) {
        tasks.push({
          file: `${topic.id}-${i}-word${OUT_EXT}`,
          text: pair.script,
          kind: 'word',
        });
      }
      if (pair.example && pair.example.thai) {
        tasks.push({
          file: `${topic.id}-${i}-sentence${OUT_EXT}`,
          text: pair.example.thai,
          kind: 'sentence',
        });
      }
      // Slot words for pattern topics
      if (topic.type === 'pattern' && Array.isArray(pair.slottable)) {
        pair.slottable.forEach((slot, slotIdx) => {
          if (slot && slot.script) {
            tasks.push({
              file: `${topic.id}-${i}-slot-${slotIdx}${OUT_EXT}`,
              text: slot.script,
              kind: 'slot',
            });
          }
        });
      }
    });
  }
  return tasks;
}

async function runForVoice(voiceKey, apiKey, tasks) {
  const voice = VOICES[voiceKey];
  const outDir = path.join(REPO_ROOT, voice.folder);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('');
  console.log(`═══ Voice: ${voice.label} ═══`);
  console.log(`Voice ID: ${voice.id}`);
  console.log(`Output:   ${outDir}`);

  const effective = LIMIT != null ? tasks.slice(0, LIMIT) : tasks;

  let generated = 0, skipped = 0, failed = 0, totalChars = 0;

  for (let i = 0; i < effective.length; i++) {
    const { file, text } = effective[i];
    const outPath = path.join(outDir, file);
    const prefix  = `[${voiceKey} ${i + 1}/${effective.length}]`;

    if (!FORCE && fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    process.stdout.write(`${prefix} ${file}  "${text}" ... `);
    let didNetworkCall = false;
    try {
      didNetworkCall = true;
      const audio = await synthesizeWithRetry(apiKey, voice.id, text);
      fs.writeFileSync(outPath, audio);
      totalChars += text.length;
      generated++;
      console.log(`ok (${audio.length} bytes)`);
    } catch (err) {
      failed++;
      console.log('FAILED');
      console.error(`  text: "${text}"`);
      console.error(`  error: ${err?.message || err}`);
    }

    if (didNetworkCall && i < effective.length - 1) await sleep(DELAY_MS);
  }

  console.log('');
  console.log(`─── ${voice.label} summary ───`);
  console.log(`Generated:        ${generated}`);
  console.log(`Skipped (cached): ${skipped}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Characters sent:  ${totalChars.toLocaleString()}`);
  return { generated, skipped, failed, totalChars };
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY.');
    process.exit(1);
  }

  const topics = loadTopics();
  if (!Array.isArray(topics)) {
    console.error('Could not load TOPICS from data/topics.js.');
    process.exit(1);
  }

  const tasks = buildTasks(topics);
  const voiceKeys = resolveVoices(VOICE_ARG);

  console.log('─── ElevenLabs TTS audio generation ───');
  console.log(`Model:    ${MODEL_ID}`);
  console.log(`Format:   ${OUTPUT_FORMAT}`);
  console.log(`Voices:   ${voiceKeys.join(', ')}`);
  console.log(`Force:    ${FORCE}`);
  console.log(`Tasks:    ${tasks.length} per voice${LIMIT != null ? ` (limit=${LIMIT})` : ''}`);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const totals = { generated: 0, skipped: 0, failed: 0, totalChars: 0 };

  for (const key of voiceKeys) {
    const r = await runForVoice(key, apiKey, tasks);
    totals.generated  += r.generated;
    totals.skipped    += r.skipped;
    totals.failed     += r.failed;
    totals.totalChars += r.totalChars;
  }

  console.log('');
  console.log('═══ All voices total ═══');
  console.log(`Generated:        ${totals.generated}`);
  console.log(`Skipped (cached): ${totals.skipped}`);
  console.log(`Failed:           ${totals.failed}`);
  console.log(`Characters sent:  ${totals.totalChars.toLocaleString()}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
