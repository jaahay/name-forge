import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import {
  NAME_HISTORY_STORAGE_KEY,
  addNameHistoryEntries,
  clearNameHistory,
  loadNameHistory,
  parseNameHistory,
  saveNameHistory,
  type NameHistoryStorage,
} from './nameHistory';

function artifact(id: string, displayText: string): NameArtifact {
  return { id, displayText };
}

function memoryStorage(): NameHistoryStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

describe('nameHistory', () => {
  it('adds newest artifacts first and enforces the exact bounded length', () => {
    const initial = addNameHistoryEntries(
      { version: 1, entries: [] },
      [artifact('a', 'Aster'), artifact('b', 'Bryn')],
      { mode: 'fiction-cast', seed: 'cast-seed', savedAt: '2026-07-18T20:00:00.000Z' },
      3,
    );
    const updated = addNameHistoryEntries(
      initial,
      [artifact('c', 'Cael'), artifact('d', 'Dara')],
      { mode: 'game-npc', seed: 'npc-seed', savedAt: '2026-07-18T21:00:00.000Z' },
      3,
    );

    expect(updated.version).toBe(1);
    expect(updated.entries).toHaveLength(3);
    expect(updated.entries.map((entry) => entry.artifact.displayText)).toEqual(['Cael', 'Dara', 'Aster']);
    expect(updated.entries.map((entry) => entry.mode)).toEqual(['game-npc', 'game-npc', 'fiction-cast']);
  });

  it('round-trips the versioned envelope through storage', () => {
    const storage = memoryStorage();
    const history = addNameHistoryEntries(
      { version: 1, entries: [] },
      [artifact('a', 'Aster')],
      { mode: 'game-npc', seed: 'seed-1', savedAt: '2026-07-18T21:00:00.000Z' },
    );

    saveNameHistory(storage, history);

    expect(storage.values.has(NAME_HISTORY_STORAGE_KEY)).toBe(true);
    expect(loadNameHistory(storage)).toEqual(history);
  });

  it('returns an empty current envelope for malformed or unsupported data', () => {
    expect(parseNameHistory('{bad json')).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 2, entries: [] }))).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 1, entries: [{ id: 'bad' }] }))).toEqual({ version: 1, entries: [] });
  });

  it('clears the canonical storage key', () => {
    const storage = memoryStorage();
    storage.setItem(NAME_HISTORY_STORAGE_KEY, 'stored');

    expect(clearNameHistory(storage)).toEqual({ version: 1, entries: [] });
    expect(storage.getItem(NAME_HISTORY_STORAGE_KEY)).toBeNull();
  });
});
