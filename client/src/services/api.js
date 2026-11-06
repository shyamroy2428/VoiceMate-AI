const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const getHealth = () => request('/api/health');
export const sendChat = (message, conversationId) => request('/api/chat', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, conversationId })
});
export const transcribeAudio = (audio) => {
  const body = new FormData(); body.append('audio', audio, audio.name || 'recording.webm');
  return request('/api/speech-to-text', { method: 'POST', body });
};
export const synthesizeSpeech = (text, voice) => request('/api/text-to-speech', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice })
});
