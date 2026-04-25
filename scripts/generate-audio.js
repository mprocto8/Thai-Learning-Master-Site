/**
 * generate-audio.js — build-time TTS generator (ElevenLabs).
 *
 * Reads data/topics.js, generates one MP3 per Thai word (pair.script)
 * and per example sentence (pair.example.thai), saves into audio/.
 *
 * Usage:
 *   node scripts/generate-audio.js              # generate missing files
 *   node scripts/generate-audio.js --force      # regenerate everything
 *   node scripts/generate-audio.js --limit=3    # generate only first N (test)
 *
 * Requires scripts/.env with ELEVENLABS_API_KEY.
 *
 * Output is real MP3 (mp3_44100_128) — no WAV wrapping needed.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── Config ──────────────────────────────────────────────────────────────
const VOICE_ID      = '4tRn1lSkEn13EVTuqb0g';
const MODEL_ID      = 'eleven_v3';
const OUTPUT_FORMAT = 'mp3_44100_128';
const DELAY_MS      = 1500;   // sequential pacing — well under 4 concurrent cap
const RETRY_DELAY_MS = 30000; // backoff on 429
const OUT_EXT       = '.mp3';

const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

const TOPICS_FILE = path.join(__dirname, '..', 'data', 'topics.js');
const AUDIO_DIR   = path.join(__dirname, '..', 'audio');

// ─── CLI args ────────────────────────────────────────────────────────────
const argv  = process.argv.slice(2);
const FORCE = argv.includes('--force');
const LIMIT = (() => {
  const m = argv.find(a => a.startsWith('--limit='));
  return m ? parseInt(m.split('=')[1], 10) : null;
})();

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

async function synthesize(apiKey, text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
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

async function synthesizeWithRetry(apiKey, text) {
  try {
    return await synthesize(apiKey, text);
  } catch (err) {
    if (err.status === 401) {
      console.error('\nFATAL: HTTP 401 from ElevenLabs — API key is invalid or unauthorized.');
      console.error('Check ELEVENLABS_API_KEY in scripts/.env.');
      process.exit(1);
    }
    if (err.status === 429) {
      console.log(`\n  rate limited (429), backing off ${RETRY_DELAY_MS / 1000}s and retrying once...`);
      await sleep(RETRY_DELAY_MS);
      return await synthesize(apiKey, text);
    }
    throw err;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY.');
    console.error('Copy scripts/.env.example to scripts/.env and paste your key.');
    process.exit(1);
  }

  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const topics = loadTopics();
  if (!Array.isArray(topics)) {
    console.error('Could not load TOPICS from data/topics.js.');
    process.exit(1);
  }

  // Build flat task list.
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
    });
  }

  const effective = LIMIT != null ? tasks.slice(0, LIMIT) : tasks;

  console.log('─── ElevenLabs TTS audio generation ───');
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Model:    ${MODEL_ID}`);
  console.log(`Format:   ${OUTPUT_FORMAT}`);
  console.log(`Output:   ${AUDIO_DIR}`);
  console.log(`Force:    ${FORCE}`);
  console.log(`Tasks:    ${effective.length}${LIMIT != null ? ` (limit=${LIMIT}, total=${tasks.length})` : ''}`);
  console.log('');

  const apiKey = process.env.ELEVENLABS_API_KEY;

  let generated  = 0;
  let skipped    = 0;
  let failed     = 0;
  let totalChars = 0;

  for (let i = 0; i < effective.length; i++) {
    const { file, text } = effective[i];
    const outPath = path.join(AUDIO_DIR, file);
    const prefix  = `[${i + 1}/${effective.length}]`;

    if (!FORCE && fs.existsSync(outPath)) {
      console.log(`${prefix} skip (cached) ${file}`);
      skipped++;
      continue;
    }

    process.stdout.write(`${prefix} Generating ${file}  "${text}" ... `);
    let didNetworkCall = false;
    try {
      didNetworkCall = true;
      const audio = await synthesizeWithRetry(apiKey, text);
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
  console.log('─── Summary ───');
  console.log(`Generated:        ${generated}`);
  console.log(`Skipped (cached): ${skipped}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Characters sent:  ${totalChars.toLocaleString()}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
