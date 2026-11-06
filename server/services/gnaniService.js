const BASE_URL = process.env.GNANI_API_BASE_URL || 'https://api.vachana.ai';
const API_KEY = process.env.GNANI_API_KEY;

function integrationUnavailable(service, setupMessage = 'Set GNANI_API_KEY in server/.env.') {
  const error = new Error(`${service} is not configured. ${setupMessage}`);
  error.status = 503;
  throw error;
}

function requireApiKey(service) {
  if (!API_KEY) integrationUnavailable(service);
  return { 'X-API-Key-ID': API_KEY };
}

async function upstreamError(response, service) {
  const body = await response.text().catch(() => '');
  let detail = body;
  try {
    const parsed = JSON.parse(body);
    detail = parsed?.error?.message || parsed?.detail?.error?.message || parsed?.message || body;
  } catch { /* retain upstream text */ }
  const error = new Error(`${service} request failed (${response.status})${detail ? `: ${detail}` : ''}`);
  error.status = response.status >= 400 && response.status < 500 ? 502 : 503;
  throw error;
}

export function getServiceStatus() {
  const configured = Boolean(API_KEY);
  return {
    prisma: configured,
    timbre: configured,
    evon: false
  };
}

export async function generateReply(_message, _conversationId) {
  integrationUnavailable('Evon', 'Its official endpoint and request format must be confirmed before enabling chat.');
}

export async function transcribeAudio(file) {
  const headers = requireApiKey('Prisma speech-to-text');
  const form = new FormData();
  form.append('audio_file', new Blob([file.buffer], { type: file.mimetype || 'audio/wav' }), file.originalname || 'recording.wav');
  form.append('model', process.env.GNANI_PRISMA_MODEL || 'prisma-v3.0');
  form.append('language_code', process.env.GNANI_STT_LANGUAGE || 'indic-auto');

  const response = await fetch(`${BASE_URL}/stt/v3`, {
    method: 'POST',
    headers,
    body: form,
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) await upstreamError(response, 'Prisma speech-to-text');
  const data = await response.json();
  if (typeof data.transcript !== 'string') throw Object.assign(new Error('Prisma returned an unexpected transcription response.'), { status: 502 });
  return data.transcript;
}

export async function synthesizeSpeech(text, _voice) {
  const headers = { ...requireApiKey('Timbre text-to-speech'), 'Content-Type': 'application/json' };
  const response = await fetch(`${BASE_URL}/api/v1/tts/inference`, {
    method: 'POST', headers,
    body: JSON.stringify({
      text,
      voice: process.env.GNANI_TTS_VOICE || 'Nalini',
      model: process.env.GNANI_TIMBRE_MODEL || 'timbre-v2.5',
      language: process.env.GNANI_TTS_LANGUAGE || 'en-IN',
      audio_config: { sample_rate: 48000, num_channels: 1, sample_width: 2, encoding: 'linear_pcm', container: 'wav' }
    }),
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) await upstreamError(response, 'Timbre text-to-speech');
  const bytes = Buffer.from(await response.arrayBuffer());
  return { audioBase64: bytes.toString('base64'), mimeType: response.headers.get('content-type') || 'audio/wav' };
}
