/**
 * generate-livedead-audio.js — single-syllable TTS clips for the Live/Dead drill (ElevenLabs).
 *
 * Mirrors scripts/generate-audio.js (same model, voices, voice settings, request shape,
 * retry/backoff, per-voice caching). Words come from js/livedead-data.js
 * (global LiveDeadData.words: [{ th, rom, en }]).
 *
 * Output:  audio/{voice}/livedead-{hex}.mp3
 *          hex = each UTF-16 code unit of `th` as 4 lowercase hex digits, concatenated
 *          e.g. กิน -> livedead-0e010e340e19.mp3
 *
 * After generating, js/livedead-audio.js is rewritten so `words` lists every LiveDeadData
 * word that has an MP3 on disk for the PLOY voice (the app's fallback voice).
 *
 * Usage:
 *   node scripts/generate-livedead-audio.js --words=กิน,ดี,ขา      # specific words
 *   node scripts/generate-livedead-audio.js --all --approved       # every word (after test batch approved)
 *   node scripts/generate-livedead-audio.js --words=... --voice=ploy|serafina|all   (default ploy)
 *   node scripts/generate-livedead-audio.js --words=... --force    # regenerate existing files
 *   node scripts/generate-livedead-audio.js --words=... --dry-run  # no API calls, no writes
 *   node scripts/generate-livedead-audio.js --manifest-only        # rewrite js/livedead-audio.js from disk
 *
 * Requires scripts/.env with ELEVENLABS_API_KEY (not needed for --dry-run / --manifest-only).
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {
  // dotenv missing: only fatal later if an API key is actually needed
}

// ─── Voices (identical to generate-audio.js) ─────────────────────────────
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

// ─── Config (identical to generate-audio.js) ─────────────────────────────
const MODEL_ID       = 'eleven_v3';
const OUTPUT_FORMAT  = 'mp3_44100_128';
const DELAY_MS       = 1500;
const RETRY_DELAY_MS = 30000;
const OUT_EXT        = '.mp3';

const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

const REPO_ROOT      = path.join(__dirname, '..');
const DATA_FILE      = path.join(REPO_ROOT, 'js', 'livedead-data.js');
const MANIFEST_FILE  = path.join(REPO_ROOT, 'js', 'livedead-audio.js');
const MANIFEST_VOICE = 'ploy';

// ─── Naming ──────────────────────────────────────────────────────────────
function fileNameFor(th) {
  let hex = '';
  for (let i = 0; i < th.length; i++) {
    hex += th.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return `livedead-${hex}${OUT_EXT}`;
}

// ─── CLI args ────────────────────────────────────────────────────────────
const argv          = process.argv.slice(2);
const FORCE         = argv.includes('--force');
const DRY_RUN       = argv.includes('--dry-run');
const ALL           = argv.includes('--all');
const APPROVED      = argv.includes('--approved');
const MANIFEST_ONLY = argv.includes('--manifest-only');
const WORDS_ARG = (() => {
  const m = argv.find(a => a.startsWith('--words='));
  return m ? m.slice('--words='.length) : null;
})();
const VOICE_ARG = (() => {
  const m = argv.find(a => a.startsWith('--voice='));
  return m ? m.split('=')[1] : 'ploy';
})();

function usage() {
  console.log([
    'Usage:',
    '  node scripts/generate-livedead-audio.js --words=กิน,ดี,ขา       generate exactly these words',
    '  node scripts/generate-livedead-audio.js --all --approved        generate every word (after the test batch is approved)',
    '',
    'Options:',
    '  --voice=ploy|serafina|all   voice(s) to generate (default ploy)',
    '  --force                     regenerate files that already exist',
    '  --dry-run                   print the plan and manifest; no API calls, no writes',
    '  --manifest-only             rewrite js/livedead-audio.js from the ploy MP3s on disk',
    '',
    'Requires scripts/.env with ELEVENLABS_API_KEY (except --dry-run / --manifest-only).',
  ].join('\n'));
}

function resolveVoices(arg) {
  if (arg === 'all') return Object.keys(VOICES);
  if (VOICES[arg]) return [arg];
  console.error(`Unknown --voice=${arg}. Expected: ploy, serafina, all.`);
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function loadWords() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Missing ${DATA_FILE} (LiveDeadData not created yet).`);
    process.exit(1);
  }
  let data;
  try {
    data = require(DATA_FILE);
  } catch (err) {
    console.error(`Could not load js/livedead-data.js: ${err?.message || err}`);
    process.exit(1);
  }
  if (!data || !Array.isArray(data.words)) {
    console.error('js/livedead-data.js did not export LiveDeadData with a words array.');
    process.exit(1);
  }
  // De-duplicate by th, keep first occurrence/order.
  const seen = new Set();
  const words = [];
  for (const w of data.words) {
    if (!w || typeof w.th !== 'string' || !w.th) continue;
    if (seen.has(w.th)) continue;
    seen.add(w.th);
    words.push(w);
  }
  return words;
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

function outPathFor(voiceKey, th) {
  return path.join(REPO_ROOT, VOICES[voiceKey].folder, fileNameFor(th));
}

// ─── Manifest ────────────────────────────────────────────────────────────
function renderManifest(manifestWords) {
  const list = manifestWords.length
    ? '[\n' + manifestWords.map(w => '    ' + JSON.stringify(w)).join(',\n') + '\n  ]'
    : '[]';
  return [
    '// js/livedead-audio.js — which Live/Dead words have a recorded clip.',
    '// Rewritten by the audio generation script; empty means "no audio", and the module works without it.',
    'const LiveDeadAudio = (function () {',
    `  const words = ${list};`,
    '  function has(th) { return words.indexOf(th) !== -1; }',
    '  return { words, has };',
    '})();',
    '',
  ].join('\n');
}

// Words (in LiveDeadData order) that have a ploy MP3 on disk; `extra` = set of th
// treated as present (used by --dry-run for files that would be generated).
function computeManifestWords(allWords, extra) {
  return allWords
    .filter(w => (extra && extra.has(w.th)) || fs.existsSync(outPathFor(MANIFEST_VOICE, w.th)))
    .map(w => w.th);
}

function writeManifest(allWords) {
  const manifestWords = computeManifestWords(allWords);
  fs.writeFileSync(MANIFEST_FILE, renderManifest(manifestWords), 'utf8');
  console.log(`Wrote ${path.relative(REPO_ROOT, MANIFEST_FILE)} (${manifestWords.length} word${manifestWords.length === 1 ? '' : 's'}).`);
}

// ─── Generation ──────────────────────────────────────────────────────────
async function runForVoice(voiceKey, apiKey, targets) {
  const voice = VOICES[voiceKey];
  const outDir = path.join(REPO_ROOT, voice.folder);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('');
  console.log(`═══ Voice: ${voice.label} ═══`);
  console.log(`Voice ID: ${voice.id}`);
  console.log(`Output:   ${outDir}`);

  let generated = 0, skipped = 0, failed = 0, totalChars = 0;
  const files = [];

  for (let i = 0; i < targets.length; i++) {
    const { th, rom } = targets[i];
    const file = fileNameFor(th);
    const outPath = path.join(outDir, file);
    const prefix = `[${voiceKey} ${i + 1}/${targets.length}]`;

    if (!FORCE && fs.existsSync(outPath)) {
      skipped++;
      files.push({ voice: voiceKey, file, status: 'skipped' });
      continue;
    }

    process.stdout.write(`${prefix} ${file}  "${th}"${rom ? ` (${rom})` : ''} ... `);
    let didNetworkCall = false;
    try {
      didNetworkCall = true;
      const audio = await synthesizeWithRetry(apiKey, voice.id, th);
      fs.writeFileSync(outPath, audio);
      totalChars += th.length;
      generated++;
      files.push({ voice: voiceKey, file, status: 'generated' });
      console.log(`ok (${audio.length} bytes)`);
    } catch (err) {
      failed++;
      files.push({ voice: voiceKey, file, status: 'failed' });
      console.log('FAILED');
      console.error(`  text: "${th}"`);
      console.error(`  error: ${err?.message || err}`);
    }

    if (didNetworkCall && i < targets.length - 1) await sleep(DELAY_MS);
  }

  console.log('');
  console.log(`─── ${voice.label} summary ───`);
  console.log(`Generated:        ${generated}`);
  console.log(`Skipped (cached): ${skipped}`);
  console.log(`Failed:           ${failed}`);
  console.log(`Characters sent:  ${totalChars.toLocaleString()}`);
  return { generated, skipped, failed, totalChars, files };
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!MANIFEST_ONLY && !WORDS_ARG && !ALL) {
    usage();
    process.exit(1);
  }

  if (ALL && !APPROVED && !MANIFEST_ONLY) {
    console.error('Refusing to run --all without --approved.');
    console.error('The 20-word test batch must be generated, listened to, and approved first.');
    console.error('Once approved, re-run with: --all --approved');
    process.exit(1);
  }

  if (WORDS_ARG && ALL) {
    console.error('Use either --words=... or --all, not both.');
    process.exit(1);
  }

  const allWords = loadWords();

  if (MANIFEST_ONLY) {
    if (DRY_RUN) {
      const mw = computeManifestWords(allWords);
      console.log('[dry-run] Would write js/livedead-audio.js:\n');
      console.log(renderManifest(mw));
    } else {
      writeManifest(allWords);
    }
    return;
  }

  // Resolve targets
  let targets;
  if (ALL) {
    targets = allWords;
  } else {
    const requested = WORDS_ARG.split(',').map(s => s.trim()).filter(Boolean);
    if (requested.length === 0) {
      console.error('--words= is empty.');
      process.exit(1);
    }
    const byTh = new Map(allWords.map(w => [w.th, w]));
    const missing = requested.filter(th => !byTh.has(th));
    if (missing.length) {
      console.error(`These words are not in LiveDeadData (${missing.length}):`);
      missing.forEach(th => console.error(`  ${th}`));
      process.exit(1);
    }
    const seen = new Set();
    targets = [];
    for (const th of requested) {
      if (seen.has(th)) continue;
      seen.add(th);
      targets.push(byTh.get(th));
    }
  }

  const voiceKeys = resolveVoices(VOICE_ARG);

  console.log('─── ElevenLabs TTS audio generation (Live/Dead) ───');
  console.log(`Model:    ${MODEL_ID}`);
  console.log(`Format:   ${OUTPUT_FORMAT}`);
  console.log(`Voices:   ${voiceKeys.join(', ')}`);
  console.log(`Force:    ${FORCE}`);
  console.log(`Dry run:  ${DRY_RUN}`);
  console.log(`Words:    ${targets.length} per voice`);

  if (DRY_RUN) {
    const willGenerate = new Set();
    for (const key of voiceKeys) {
      console.log('');
      console.log(`─── [dry-run] ${VOICES[key].label} ───`);
      for (const { th, rom } of targets) {
        const file = fileNameFor(th);
        const exists = fs.existsSync(outPathFor(key, th));
        const action = exists && !FORCE ? 'skip (cached)' : 'GENERATE';
        console.log(`${th}\t${rom || ''}\t${file}\texists=${exists}\t${action}`);
        if (key === MANIFEST_VOICE && action === 'GENERATE') willGenerate.add(th);
      }
    }
    const mw = computeManifestWords(allWords, willGenerate);
    console.log('');
    console.log('[dry-run] Would write js/livedead-audio.js:\n');
    console.log(renderManifest(mw));
    return;
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Missing ELEVENLABS_API_KEY.');
    process.exit(1);
  }
  const apiKey = process.env.ELEVENLABS_API_KEY;

  const totals = { generated: 0, skipped: 0, failed: 0, totalChars: 0 };
  const allFiles = [];

  for (const key of voiceKeys) {
    const r = await runForVoice(key, apiKey, targets);
    totals.generated  += r.generated;
    totals.skipped    += r.skipped;
    totals.failed     += r.failed;
    totals.totalChars += r.totalChars;
    allFiles.push(...r.files);
  }

  console.log('');
  writeManifest(allWords);

  console.log('');
  console.log('═══ Total ═══');
  console.log(`Generated:        ${totals.generated}`);
  console.log(`Skipped (cached): ${totals.skipped}`);
  console.log(`Failed:           ${totals.failed}`);
  console.log(`Characters sent:  ${totals.totalChars.toLocaleString()}`);
  console.log('Files:');
  allFiles.forEach(f => console.log(`  [${f.status}] audio/${f.voice}/${f.file}`));

  if (totals.failed > 0) process.exitCode = 1;
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

module.exports = { fileNameFor };
