import test, { after } from 'node:test';
import assert from 'node:assert/strict';

process.env.GNANI_API_KEY = 'unit-test-key';
process.env.GNANI_API_BASE_URL = 'https://gnani.test';
process.env.GNANI_PRISMA_MODEL = 'prisma-v3.0';
process.env.GNANI_STT_LANGUAGE = 'indic-auto';
process.env.GNANI_TIMBRE_MODEL = 'timbre-v2.5';
process.env.GNANI_TTS_VOICE = 'Nalini';
process.env.GNANI_TTS_LANGUAGE = 'en-IN';

const { transcribeAudio, synthesizeSpeech, generateReply } = await import('../services/gnaniService.js');
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

test('Prisma receives the uploaded WAV and configured model/language using backend auth', async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify({ success: true, transcript: 'Recognized words', detected_language_code: 'en-IN' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  const transcript = await transcribeAudio({
    buffer: Buffer.from('wav-data'),
    mimetype: 'audio/wav',
    originalname: 'recording.wav'
  });

  assert.deepEqual(transcript, { text: 'Recognized words', detectedLanguageCode: 'en-IN' });
  assert.equal(captured.url, 'https://gnani.test/stt/v3');
  assert.equal(captured.options.headers['X-API-Key-ID'], 'unit-test-key');
  assert.equal(captured.options.body.get('model'), 'prisma-v3.0');
  assert.equal(captured.options.body.get('language_code'), 'indic-auto');
  assert.equal(captured.options.body.get('format'), 'codemix');
  const audio = captured.options.body.get('audio_file');
  assert.equal(audio.name, 'recording.wav');
  assert.equal(audio.type, 'audio/wav');
});

test('Timbre uses configured voice/model/language and returns playable audio bytes', async () => {
  let captured;
  const audioBytes = Buffer.from([82, 73, 70, 70, 1, 2, 3]);
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return new Response(audioBytes, { status: 200, headers: { 'content-type': 'audio/wav' } });
  };

  const result = await synthesizeSpeech('Hello from VoiceMate');
  const payload = JSON.parse(captured.options.body);

  assert.equal(captured.url, 'https://gnani.test/api/v1/tts/inference');
  assert.equal(captured.options.headers['X-API-Key-ID'], 'unit-test-key');
  assert.equal(payload.text, 'Hello from VoiceMate');
  assert.equal(payload.voice, 'Nalini');
  assert.equal(payload.model, 'timbre-v2.5');
  assert.equal(payload.language, 'en-IN');
  assert.equal(result.mimeType, 'audio/wav');
  assert.equal(Buffer.from(result.audioBase64, 'base64').toString('hex'), audioBytes.toString('hex'));
});

test('Gnani upstream errors retain readable service detail and mapped status', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ detail: { error: { message: 'Invalid API key' } } }), {
    status: 401,
    headers: { 'content-type': 'application/json' }
  });

  await assert.rejects(transcribeAudio({ buffer: Buffer.from('audio'), originalname: 'recording.wav' }), (error) => {
    assert.equal(error.status, 502);
    assert.match(error.message, /Prisma speech-to-text request failed \(401\): Invalid API key/);
    return true;
  });
});

test('Evon remains explicitly disabled and never returns a fabricated reply', async () => {
  await assert.rejects(generateReply('Hello', 'conversation-id'), (error) => {
    assert.equal(error.status, 503);
    assert.match(error.message, /Evon is not configured/);
    return true;
  });
});
