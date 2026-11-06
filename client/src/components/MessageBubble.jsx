import { Bot, Copy, Volume2, Check, UserRound, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message, onSpeak }) {
  const [copied, setCopied] = useState(false); const [playState, setPlayState] = useState('idle'); const user = message.role === 'user';
  const copy = async () => { await navigator.clipboard?.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const listen = async () => {
    if (playState === 'loading' || playState === 'playing') return;
    setPlayState('loading');
    try { await onSpeak(message.content, setPlayState); setPlayState('played'); setTimeout(() => setPlayState('idle'), 1800); }
    catch { setPlayState('error'); setTimeout(() => setPlayState('idle'), 2400); }
  };
  const playbackLabel = playState === 'loading' ? 'Preparing…' : playState === 'playing' ? 'Playing…' : playState === 'played' ? 'Played' : playState === 'error' ? 'Try again' : 'Listen';
  return <div className={`message-row ${user ? 'user-row' : ''}`}><div className={`message-avatar ${user ? 'user-avatar' : ''}`}>{user ? <UserRound size={16}/> : <Bot size={17}/>}</div><div className="message-content"><div className="message-meta"><strong>{user ? 'You' : 'VoiceMate'}</strong><span>{message.time}</span>{message.source === 'prisma' && <span className="message-source">Prisma transcription</span>}</div><div className="message-text">{message.content}</div><div className="message-actions"><button onClick={copy} title="Copy message">{copied ? <Check size={14}/> : <Copy size={14}/>}<span>{copied ? 'Copied' : 'Copy'}</span></button><button onClick={listen} title="Play with Timbre" disabled={playState === 'loading' || playState === 'playing'}>{playState === 'loading' ? <LoaderCircle className="spin-icon" size={14}/> : playState === 'played' ? <Check size={14}/> : <Volume2 size={14}/>}<span>{playbackLabel}</span></button></div></div></div>;
}
