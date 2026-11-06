import { Clock3, MessageSquareText } from 'lucide-react';

export default function History({ conversations, onSelect }) {
  return <div className="history-page"><div className="page-eyebrow"><span className="eyebrow-line"/> YOUR SPACE</div><h1>Conversations</h1><p className="page-intro">A little history, whenever you need it.</p>{conversations.length ? <div className="conversation-list">{conversations.map((c) => <button className="conversation-card" key={c.id} onClick={() => onSelect(c.id)}><div className="conversation-icon"><MessageSquareText size={17}/></div><div className="conversation-info"><strong>{c.title}</strong><span>{c.preview || 'A fresh start'}</span></div><div className="conversation-date"><Clock3 size={13}/>{c.date}</div></button>)}</div> : <div className="history-empty"><div className="empty-icon"><Clock3 size={24}/></div><strong>Your story starts here.</strong><p>Conversations you have with VoiceMate will show up here.</p></div>}</div>;
}
