import { AudioLines, CircleHelp, Clock3, MessageSquareText, Mic2, Plus, Settings2, Sparkles, Sun, Moon, X } from 'lucide-react';

export default function Sidebar({ page, setPage, conversations, activeId, onSelect, onNew, theme, toggleTheme, open, close }) {
  return <>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><AudioLines size={19} strokeWidth={2.4}/></div><span className="brand-name">voicemate<span>AI</span></span><button className="icon-button mobile-close" onClick={close} aria-label="Close"><X size={18}/></button></div>
      <button className="new-chat" onClick={onNew}><Plus size={17}/> New conversation <span>⌘ K</span></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">
        <button className={page === 'chat' ? 'nav-item active' : 'nav-item'} onClick={() => {setPage('chat'); close();}}><MessageSquareText size={17}/> <span>Assistant</span></button>
        <button className={page === 'history' ? 'nav-item active' : 'nav-item'} onClick={() => {setPage('history'); close();}}><Clock3 size={17}/> <span>History</span><span className="nav-count">{conversations.length}</span></button>
        <button className={page === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => {setPage('settings'); close();}}><Settings2 size={17}/> <span>Settings</span></button>
      </nav>
      <div className="history-heading"><span>RECENT</span><span className="recent-dot"/></div>
      <div className="recent-list">{conversations.slice(0, 7).map((item) => <button key={item.id} className={`recent-item ${activeId === item.id ? 'selected' : ''}`} onClick={() => {onSelect(item.id); setPage('chat'); close();}}><span className="recent-indicator"/><span>{item.title}</span></button>)}</div>
      <div className="sidebar-bottom"><div className="workspace-card"><div className="workspace-avatar"><Sparkles size={15}/></div><div><strong>Personal workspace</strong><small>Free plan</small></div><span className="plan-dot"/></div><div className="sidebar-tools"><button className="nav-item" onClick={toggleTheme}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}<span>Appearance</span></button><button className="nav-item" onClick={() => setPage('settings')}><CircleHelp size={17}/><span>Help & support</span></button></div><div className="profile"><div className="profile-avatar">Y</div><div><strong>Your account</strong><small>you@example.com</small></div><button className="icon-button" aria-label="Profile settings"><Settings2 size={16}/></button></div></div>
    </aside>
  </>;
}
