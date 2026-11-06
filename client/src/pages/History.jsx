import { useEffect, useState } from 'react';
import { Clock3, MessageSquareText, Plus, Trash2 } from 'lucide-react';

export default function History({ conversations, onSelect, onDelete, onClearAll, onNew }) {
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!confirmClear) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setConfirmClear(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmClear]);

  const confirm = () => {
    onClearAll();
    setConfirmClear(false);
  };

  return <div className="history-page">
    <div className="page-eyebrow"><span className="eyebrow-line"/> YOUR SPACE</div>
    <div className="history-title-row"><div><h1>Conversations</h1><p className="page-intro">A little history, whenever you need it.</p></div><div className="history-actions"><button className="history-new-button" onClick={onNew}><Plus size={15}/> New conversation</button>{conversations.length > 0 && <button className="history-clear-button" onClick={() => setConfirmClear(true)}><Trash2 size={14}/> Clear all history</button>}</div></div>
    {conversations.length ? <div className="conversation-list">{conversations.map((conversation) => <article className="conversation-card" key={conversation.id}>
      <button className="conversation-open" onClick={() => onSelect(conversation.id)} aria-label={`Open ${conversation.title}`}>
        <div className="conversation-icon"><MessageSquareText size={17}/></div><div className="conversation-info"><strong>{conversation.title}</strong><span>{conversation.preview || 'A fresh start'}</span></div><div className="conversation-date"><Clock3 size={13}/>{conversation.date}</div>
      </button>
      <button className="conversation-delete" onClick={() => onDelete(conversation.id)} aria-label={`Delete ${conversation.title}`} title="Delete conversation"><Trash2 size={16}/></button>
    </article>)}</div> : <div className="history-empty"><div className="empty-icon"><Clock3 size={24}/></div><strong>Your story starts here.</strong><p>Conversations you have with VoiceMate will show up here.</p><button className="history-new-button empty-start-button" onClick={onNew}><Plus size={15}/> Start new conversation</button></div>}

    {confirmClear && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmClear(false); }}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="clear-history-title" aria-describedby="clear-history-description">
        <div className="dialog-icon"><Trash2 size={19}/></div><h2 id="clear-history-title">Clear all history?</h2><p id="clear-history-description">This permanently deletes all saved conversations from this device. Your VoiceMate settings and API configuration will stay as they are.</p>
        <div className="dialog-actions"><button className="dialog-cancel" onClick={() => setConfirmClear(false)}>Cancel</button><button className="dialog-delete" onClick={confirm}>Delete</button></div>
      </section>
    </div>}
  </div>;
}
