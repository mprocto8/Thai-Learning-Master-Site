/**
 * generate-audio.js — build-time TTS generator.
 *
 * Reads data/topics.js, generates one audio file per Thai word (pair.script)
 * and per example sentence (pair.example.thai), saves into audio/.
 *
 * Usage:
 *   node scripts/generate-audio.js              # generate missing files
 *   node scripts/generate-audio.js --force      # regenerate everything
 *   node scripts/generate-audio.js --limit=3    # generate only first N (test)
 *
 * Requires scripts/.env with GEMINI_API_KEY.
 *
 * NOTE ON FORMAT: Gemini TTS returns raw PCM (audio/L16, 24 kHz, 16-bit mono),
 * not MP3. The SDK has no MP3 output option. We wrap PCM with a WAV header and
 * write to the .mp3 filename the app expects. Most browsers play these via
 * content sniffing. If playback fails, either rename files to .wav or add an
 * encoder step (ffmpeg / lamejs).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { GoogleGenAI } = require('@google/genai');

// ─── Config ──────────────────────────────────────────────────────────────
const MODEL       = 'gemini-3.1-flash-tts-preview'; // update here if model name changes
const VOICE_NAME  = 'Achernar';                      // Thai female voice from AI Studio
const DELAY_MS    = 500;                             // between requests, to avoid rate limits
const OUT_EXT     = '.mp3';                          // filename extension (content is WAV-wrapped PCM)

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
  // topics.js declares `const TOPICS = [...]`; append an assignment to expose it.
  vm.runInContext(src + '\nthis.__TOPICS = TOPICS;', sandbox);
  return sandbox.__TOPICS;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Wrap raw PCM in a minimal WAV (RIFF) header.
function pcmToWav(pcm, sampleRate, channels = 1, bitsPerSample = 16) {
  const byteRate   = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataSize   = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);            // PCM chunk size
  buf.writeUInt16LE(1, 20);             // format = PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  pcm.copy(buf, 44);
  return buf;
}

function parseSampleRate(mimeType) {
  if (!mimeType) return 24000;
  const m = mimeType.match(/rate=(\d+)/i);
  return m ? parseInt(m[1], 10) : 24000;
}

async function synthesize(ai, text) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE_NAME },
        },
      },
    },
  });

  const part = response?.candidates?.[0]?.content?.parts?.[0];
  const inline = part?.inlineData;
  if (!inline?.data) {
    throw new Error('No audio returned from API (empty inlineData).');
  }
  const pcm = Buffer.from(inline.data, 'base64');
  const sampleRate = parseSampleRate(inline.mimeType);
  return pcmToWav(pcm, sampleRate);
}

// ─── Main ────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY.');
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

  console.log('─── Gemini TTS audio generation ───');
  console.log(`Model:    ${MODEL}`);
  console.log(`Voice:    ${VOICE_NAME}`);
  console.log(`Output:   ${AUDIO_DIR}`);
  console.log(`Force:    ${FORCE}`);
  console.log(`Tasks:    ${effective.length}${LIMIT != null ? ` (limit=${LIMIT}, total=${tasks.length})` : ''}`);
  console.log('');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let generated = 0;
  let skipped   = 0;
  let failed    = 0;
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
    try {
      const audio = await synthesize(ai, text);
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

    if (i < effective.length - 1) await sleep(DELAY_MS);
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
