import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, ChevronDown, Menu, MoreHorizontal, Plus, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import MessageBubble from './components/MessageBubble.jsx';
import ChatComposer from './components/ChatComposer.jsx';
import Settings from './pages/Settings.jsx';
import History from './pages/History.jsx';
import { useRecorder } from './hooks/useRecorder.js';
import { getHealth, sendChat, transcribeAudio, synthesizeSpeech } from './services/api.js';
import { activeAfterDeletion, persistHistory, readHistory, removeConversation, resolveClearHistory, detectedLanguageName } from './services/history.js';

const nowTime = () => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
const newConversation = () => ({ id: crypto.randomUUID(), title: 'New conversation', date: 'Just now', preview: '', messages: [] });

export default function App() {
  const [conversations, setConversations] = useState(() => readHistory());
  const conversationsRef = useRef(conversations);
  const [activeId, setActiveId] = useState(() => conversations[0]?.id || null);
  const [page, setPage] = useState('chat'); const [draft, setDraft] = useState(''); const [busy, setBusy] = useState(false); const [speechProcessing, setSpeechProcessing] = useState(false); const [speechNotice, setSpeechNotice] = useState(''); const [error, setError] = useState(''); const [mobileNav, setMobileNav] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('voicemate-theme') || 'dark');
  const [health, setHealth] = useState({ server: false, prisma: false, timbre: false, evon: false });
  const recorder = useRecorder();
  const audioRef = useRef(null);
  const active = useMemo(() => conversations.find((c) => c.id === activeId), [conversations, activeId]);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('voicemate-theme', theme); }, [theme]);
  useEffect(() => { getHealth().then((data) => setHealth({ server: true, ...data.services })).catch(() => setHealth({ server: false, prisma: false, timbre: false, evon: false })); const timer = setInterval(() => getHealth().then((data) => setHealth({ server: true, ...data.services })).catch(() => setHealth({ server: false, prisma: false, timbre: false, evon: false })), 30000); return () => clearInterval(timer); }, []);
  const commitConversations = (next) => {
    const updated = typeof next === 'function' ? next(conversationsRef.current) : next;
    conversationsRef.current = updated;
    persistHistory(updated);
    setConversations(updated);
  };
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  const updateMessages = (id, fn) => commitConversations((items) => items.map((c) => c.id === id ? fn(c) : c));
  const appendUserMessage = (content, source, detectedLanguageCode) => {
    let id = activeId;
    if (!id || !conversations.some((conversation) => conversation.id === id)) {
      const conversation = newConversation();
      id = conversation.id;
      commitConversations((items) => [conversation, ...items]);
      setActiveId(id);
    }
    const userMessage = { id: crypto.randomUUID(), role: 'user', content, time: nowTime(), ...(source ? { source } : {}), ...(detectedLanguageCode ? { detectedLanguageCode } : {}) };
    updateMessages(id, (conversation) => ({
      ...conversation,
      title: conversation.messages.length ? conversation.title : content.slice(0, 38) + (content.length > 38 ? '…' : ''),
      preview: content,
      date: 'Just now',
      messages: [...conversation.messages, userMessage]
    }));
    return id;
  };
  const startNew = () => { const c = newConversation(); commitConversations((items) => [c, ...items]); setActiveId(c.id); setPage('chat'); setDraft(''); setError(''); };
  const selectConversation = (id) => { setActiveId(id); setPage('chat'); setError(''); };
  const deleteConversation = (id) => {
    const remaining = removeConversation(conversationsRef.current, id);
    commitConversations(remaining);
    setActiveId((current) => activeAfterDeletion(current, id, remaining));
  };
  const clearHistory = () => {
    commitConversations((items) => resolveClearHistory(items, true));
    setActiveId(null);
    setDraft('');
    setError('');
    setSpeechNotice('');
  };
  const send = async (text = draft) => {
    const content = text.trim(); if (!content || busy) return;
    const id = appendUserMessage(content);
    setDraft(''); setError(''); setBusy(true);
    try {
      const data = await sendChat(content, id);
      if (!data.reply) throw new Error('The assistant returned an empty response.');
      updateMessages(id, (c) => ({ ...c, preview: data.reply, messages: [...c.messages, { id: crypto.randomUUID(), role: 'assistant', content: data.reply, time: nowTime() }] }));
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const toggleRecord = async () => {
    setError('');
    if (recorder.state === 'recording') { recorder.stop(); return; }
    setSpeechNotice('');
    try {
      const audio = await recorder.start();
      setSpeechProcessing(true);
      const data = await transcribeAudio(audio);
      const transcript = data.text?.trim();
      if (!transcript) throw new Error('Prisma did not detect speech. Try recording again.');
      appendUserMessage(transcript, 'prisma', data.detectedLanguageCode);
      const detected = detectedLanguageName(data.detectedLanguageCode);
      setSpeechNotice(`Prisma transcription added to this conversation.${detected ? ` Detected language: ${detected}.` : ''}`);
    } catch (err) { setError(err.message || 'Prisma could not transcribe this recording.'); }
    finally { setSpeechProcessing(false); }
  };
  const speak = async (text, setPlaybackState) => {
    setError('');
    let objectUrl;
    try {
      audioRef.current?.pause();
      const data = await synthesizeSpeech(text, localStorage.getItem('voicemate-voice') || 'default');
      let source = data.audioUrl;
      if (!source && data.audioBase64) {
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: data.mimeType || 'audio/wav' }));
        source = objectUrl;
      }
      if (!source) throw new Error('Timbre returned no playable audio.');
      const audio = new Audio(source);
      audioRef.current = audio;
      setPlaybackState?.('playing');
      await new Promise((resolve, reject) => {
        audio.addEventListener('ended', resolve, { once: true });
        audio.addEventListener('error', () => reject(new Error('The synthesized audio could not be played.')), { once: true });
        audio.play().catch(reject);
      });
    } catch (err) {
      setError(err.message || 'Timbre could not synthesize audio.');
      throw err;
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      audioRef.current = null;
    }
  };
  const toggleTheme = () => setTheme((t) => t === 'light' ? 'dark' : 'light');

  return <div className="app-shell"><Sidebar page={page} setPage={setPage} conversations={conversations} activeId={activeId} onSelect={selectConversation} onNew={startNew} theme={theme} toggleTheme={toggleTheme} open={mobileNav} close={() => setMobileNav(false)}/><main className="main-panel"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={19}/></button><div className="current-workspace"><div className="workspace-mini"><Sparkles size={13}/></div><span>Personal workspace</span><ChevronDown size={14}/></div></div><div className="topbar-right"><div className="api-status"><span className={`status-dot ${health.server ? 'online' : ''}`}/>{health.server ? 'Systems operational' : 'API disconnected'}</div><button className="icon-button more-button" aria-label="More options"><MoreHorizontal size={19}/></button></div></header>
    {page === 'settings' ? <Settings theme={theme} toggleTheme={toggleTheme} health={health}/> : page === 'history' ? <History conversations={conversations} onSelect={selectConversation} onDelete={deleteConversation} onClearAll={clearHistory} onNew={startNew}/> : <div className={`chat-view ${active?.messages.length ? 'has-messages' : ''}`}>
      {active?.messages.length ? <><div className="chat-heading"><div><span className="chat-kicker"><span/> CONVERSATION</span><h1>{active.title}</h1></div><button className="icon-button" aria-label="New conversation" onClick={startNew}><Plus size={18}/></button></div><div className="messages-scroll"><div className="messages-list">{active.messages.map((message) => <MessageBubble key={message.id} message={message} onSpeak={speak}/>)}{busy && <div className="assistant-loading"><div className="message-avatar"><AudioLines size={17}/></div><div><span className="loading-label">VoiceMate is thinking</span><div className="typing-dots"><i/><i/><i/></div></div></div>}</div></div></> : <div className="welcome-area"><div className="welcome-orb"><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-center"><AudioLines size={30}/></div><span className="orb-star star-one">✳</span><span className="orb-star star-two">✦</span></div><div className="welcome-copy"><div className="welcome-eyebrow"><span className="eyebrow-line"/> YOUR AI, IN EVERY WORD <span className="eyebrow-line"/></div><h1>A voice that<br/><em>gets you.</em></h1><p>Think out loud, ask the big questions, or just say hello.<br className="desktop-break"/> I’m here to make it feel easy.</p></div><div className="suggestion-grid"><button onClick={() => setDraft('Help me organize my thoughts for the day')}><span className="suggestion-icon mint">✳</span><span><strong>Find my focus</strong><small>Help me plan the day ahead</small></span><span className="suggestion-arrow">↗</span></button><button onClick={() => setDraft('Help me write a thoughtful message')}><span className="suggestion-icon peach">⌁</span><span><strong>Find the right words</strong><small>Draft something thoughtful</small></span><span className="suggestion-arrow">↗</span></button><button onClick={() => setDraft('Explain a complex idea in a simple way')}><span className="suggestion-icon lilac">◌</span><span><strong>Make it make sense</strong><small>Untangle a tricky idea</small></span><span className="suggestion-arrow">↗</span></button></div></div>}
      <div className="composer-dock">{error && <div className="error-banner" role="alert"><span>!</span>{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}{speechNotice && !error && <div className="success-banner" role="status"><span>✓</span>{speechNotice}<button onClick={() => setSpeechNotice('')} aria-label="Dismiss status">×</button></div>}<ChatComposer value={draft} onChange={setDraft} onSend={() => send()} recording={recorder.state === 'recording'} processing={recorder.state === 'processing' || speechProcessing} onRecord={toggleRecord} disabled={busy || speechProcessing}/></div>
    </div>}
    </main></div>;
}
