import { useEffect, useRef, useState } from 'react';

export function useRecorder() {
  const [state, setState] = useState('idle');
  const recorder = useRef(null); const chunks = useRef([]); const limitTimer = useRef(null);
  useEffect(() => () => { clearTimeout(limitTimer.current); if (recorder.current?.state === 'recording') recorder.current.stop(); }, []);

  const toWav = async (blob) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('This browser cannot prepare audio for transcription.');
    const context = new AudioContextClass();
    try {
      const decoded = await context.decodeAudioData(await blob.arrayBuffer());
      if (decoded.duration > 30) throw new Error('Recordings must be 30 seconds or shorter.');
      const length = decoded.length; const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index));
      const pcm = new ArrayBuffer(44 + length * 2); const view = new DataView(pcm);
      const write = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
      write(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
      view.setUint32(24, decoded.sampleRate, true); view.setUint32(28, decoded.sampleRate * 2, true);
      view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, length * 2, true);
      let offset = 44;
      for (let i = 0; i < length; i++) { let sample = 0; for (const channel of channels) sample += channel[i] || 0; sample /= channels.length; sample = Math.max(-1, Math.min(1, sample)); view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); offset += 2; }
      return new File([pcm], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
    } finally { await context.close(); }
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Audio recording is not supported in this browser.');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const instance = new MediaRecorder(stream); recorder.current = instance; chunks.current = [];
    instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
    instance.start(); setState('recording');
    return new Promise((resolve, reject) => {
    instance.onstop = async () => {
      clearTimeout(limitTimer.current); stream.getTracks().forEach((track) => track.stop());
      try { const wav = await toWav(new Blob(chunks.current, { type: instance.mimeType || 'audio/webm' })); setState('idle'); resolve(wav); }
      catch (error) { setState('idle'); reject(error); }
    };
    limitTimer.current = setTimeout(() => { if (instance.state === 'recording') { setState('processing'); instance.stop(); } }, 30000);
    });
  };
  const stop = () => { if (recorder.current?.state === 'recording') { setState('processing'); recorder.current.stop(); } };
  return { state, start, stop };
}
