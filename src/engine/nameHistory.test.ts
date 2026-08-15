import { describe, expect, it } from 'vitest';
import type { NameArtifact } from './nameArtifact';
import {
  DEFAULT_NAME_HISTORY_LIMIT,
  NAME_HISTORY_STORAGE_KEY,
  addNameHistoryEntries,
  clearNameHistory,
  loadNameHistory,
  parseNameHistory,
  saveNameHistory,
  type NameHistoryStorage,
} from './nameHistory';

function artifact(id: string, displayText: string): NameArtifact {
  const partId = `${id}:given`;
  return {
    kind: 'composed-identity',
    id,
    displayText,
    identity: {
      displayName: displayText,
      format: { id: 'format:given-only', kind: 'given-only', label: 'Given name' },
      parts: [{ id: partId, role: 'given', value: displayText, sourceNameId: id, sourceName: displayText }],
      phraseParts: [{ kind: 'part', partId, role: 'given' }],
    },
    readabilityDiagnostics: [],
  };
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

class FailingStorage implements NameHistoryStorage {
  getItem(): string | null { throw new Error('read blocked'); }
  setItem(): void { throw new Error('write blocked'); }
  removeItem(): void { throw new Error('remove blocked'); }
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

  it('migrates legacy composed artifacts in the v1 envelope to the explicit composed kind', () => {
    const currentArtifact = artifact('legacy', 'Aster Vale');
    if (currentArtifact.kind !== 'composed-identity') throw new Error('Expected composed fixture.');
    const { kind: _kind, ...legacyArtifact } = currentArtifact;
    const parsed = parseNameHistory(JSON.stringify({
      version: 1,
      entries: [{
        id: 'saved-legacy',
        artifact: {
          ...legacyArtifact,
          sound: { legacy: 'ambiguous-primary-only-evidence' },
          spelling: { text: 'Aster', mappings: [], rank: 1, score: 1 },
        },
        mode: 'fiction-cast',
        seed: 'legacy-seed',
        savedAt: '2026-07-18T21:00:00.000Z',
      }],
    }));

    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0]?.artifact.kind).toBe('composed-identity');
    expect('sound' in (parsed.entries[0]?.artifact ?? {})).toBe(false);
    expect(parsed.entries[0]?.artifact.displayText).toBe('Aster Vale');
  });

  it('returns an empty current envelope for malformed or unsupported data', () => {
    expect(parseNameHistory('{bad json')).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 2, entries: [] }))).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 1, entries: [{ id: 'bad' }] }))).toEqual({ version: 1, entries: [] });
  });

  it('filters artifacts whose durable composition fields are malformed', () => {
    const validEntry = {
      id: 'saved-valid',
      artifact: artifact('valid', 'Aster'),
      mode: 'game-npc',
      seed: 'seed-valid',
      savedAt: '2026-07-18T21:00:00.000Z',
    };
    const malformedIdentityEntry = {
      ...validEntry,
      id: 'saved-malformed-identity',
      artifact: {
        kind: 'composed-identity',
        id: 'malformed-identity',
        displayText: 'Broken identity',
        identity: {},
        readabilityDiagnostics: [],
      },
    };
    const malformedAuditionEntry = {
      ...validEntry,
      id: 'saved-malformed-audition',
      artifact: {
        ...artifact('malformed-audition', 'Broken audition'),
        identityAudition: {},
      },
    };

    expect(parseNameHistory(JSON.stringify({
      version: 1,
      entries: [validEntry, malformedIdentityEntry, malformedAuditionEntry],
    }))).toEqual({
      version: 1,
      entries: [validEntry],
    });
  });

  it('caps persisted history at the default bound while loading', () => {
    const entries = Array.from({ length: DEFAULT_NAME_HISTORY_LIMIT + 3 }, (_, index) => ({
      id: `saved-${index}`,
      artifact: artifact(`artifact-${index}`, `Name ${index}`),
      mode: 'game-npc',
      seed: `seed-${index}`,
      savedAt: '2026-07-18T21:00:00.000Z',
    }));

    const parsed = parseNameHistory(JSON.stringify({ version: 1, entries }));

    expect(parsed.entries).toHaveLength(DEFAULT_NAME_HISTORY_LIMIT);
    expect(parsed.entries.map((entry) => entry.id)).toEqual(
      entries.slice(0, DEFAULT_NAME_HISTORY_LIMIT).map((entry) => entry.id),
    );
  });

  it('treats storage access failures as empty or best-effort persistence', () => {
    const storage = new FailingStorage();
    const history = addNameHistoryEntries(
      { version: 1, entries: [] },
      [artifact('saved', 'Saved')],
      { mode: 'game-npc', seed: 'seed-saved', savedAt: '2026-07-18T21:00:00.000Z' },
    );

    expect(loadNameHistory(storage)).toEqual({ version: 1, entries: [] });
    expect(saveNameHistory(storage, history)).toBeUndefined();
    expect(clearNameHistory(storage)).toEqual({ version: 1, entries: [] });
  });

  it('clears the canonical storage key', () => {
    const storage = memoryStorage();
    storage.setItem(NAME_HISTORY_STORAGE_KEY, 'stored');

    expect(clearNameHistory(storage)).toEqual({ version: 1, entries: [] });
    expect(storage.getItem(NAME_HISTORY_STORAGE_KEY)).toBeNull();
  });
});
