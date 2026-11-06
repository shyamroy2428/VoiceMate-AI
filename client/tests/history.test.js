import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HISTORY_STORAGE_KEY, activeAfterDeletion, detectedLanguageName,
  persistHistory, readHistory, removeConversation, resolveClearHistory
} from '../src/services/history.js';

function storageStub(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    values
  };
}

test('individual deletion persists and selects a remaining active conversation', () => {
  const storage = storageStub();
  const conversations = [{ id: 'one' }, { id: 'two' }];
  const remaining = removeConversation(conversations, 'one');
  persistHistory(remaining, storage);

  assert.deepEqual(readHistory(storage), [{ id: 'two' }]);
  assert.equal(activeAfterDeletion('one', 'one', remaining), 'two');
  assert.equal(activeAfterDeletion('two', 'one', remaining), 'two');
});

test('confirmed clear removes only history and survives reload; cancellation preserves it', () => {
  const storage = storageStub({ [HISTORY_STORAGE_KEY]: JSON.stringify([{ id: 'one' }]), 'voicemate-theme': 'dark' });
  const conversations = readHistory(storage);

  assert.deepEqual(resolveClearHistory(conversations, false), conversations);
  const cleared = resolveClearHistory(conversations, true);
  persistHistory(cleared, storage);
  assert.deepEqual(readHistory(storage), []);
  assert.equal(storage.getItem('voicemate-theme'), 'dark');
});

test('Prisma language labels cover the requested language codes', () => {
  assert.deepEqual(['te-IN', 'ta-IN', 'hi-IN', 'en-IN'].map(detectedLanguageName), ['Telugu', 'Tamil', 'Hindi', 'English']);
});
