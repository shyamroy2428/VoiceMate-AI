export const HISTORY_STORAGE_KEY = 'voicemate-history';

export function readHistory(storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(HISTORY_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function persistHistory(conversations, storage = globalThis.localStorage) {
  storage?.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversations));
}

export function removeConversation(conversations, id) {
  return conversations.filter((conversation) => conversation.id !== id);
}

export function activeAfterDeletion(activeId, deletedId, remaining) {
  return activeId === deletedId ? remaining[0]?.id || null : activeId;
}

export function resolveClearHistory(conversations, confirmed) {
  return confirmed ? [] : conversations;
}

const languageNames = {
  'te-IN': 'Telugu',
  'ta-IN': 'Tamil',
  'hi-IN': 'Hindi',
  'en-IN': 'English'
};

export function detectedLanguageName(code) {
  return languageNames[code] || null;
}
