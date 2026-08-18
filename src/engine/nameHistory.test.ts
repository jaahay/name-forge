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

function artifact(id: string, spellingText: string): NameArtifact {
  const spelling = {
    contract: 'SpellingCandidate' as const,
    version: 1 as const,
    text: spellingText,
    mappings: [],
    rank: 1,
    score: 1,
  };

  return {
    id,
    soundProfile: {
      targets: {
        length: 'short',
        syllableCount: { min: 1, max: 1, preferred: 1 },
        texture: 'balanced',
        distinctiveness: 0.5,
        cadences: ['balanced'],
      },
      phonotactics: {
        preferredSyllableShapes: ['CV'],
        onsetWeight: 0.7,
        codaWeight: 0.4,
        liquidWeight: 0.3,
        glideWeight: 0.2,
        clusterTolerance: 0.2,
      },
    },
    sound: {
      contract: 'SoundCandidate',
      version: 1,
      cadence: 'balanced',
      sequence: {
        contract: 'SegmentSequence',
        version: 1,
        segments: ['m', 'a'],
        syllables: [{
          start: 0,
          end: 2,
          onset: [0],
          nucleus: [1],
          coda: [],
          shape: 'CV',
          weight: 'light',
          sonorityProfile: 'rising',
          stress: 'primary',
          stressSource: 'sequence',
        }],
      },
      transcription: '/ma/',
    },
    spelling,
    spellingCandidates: [spelling],
    generationPlan: {
      id: `generation-plan-${id}`,
      syllableCount: 1,
      stressPattern: 'primary',
      rhythm: 'balanced',
      shape: ['CV'],
      texture: 'balanced',
      targetNovelty: 0.5,
      targetLength: 'short',
    },
    variants: [],
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
      { mode: 'test-surface-a', seed: 'first-seed', savedAt: '2026-07-18T20:00:00.000Z' },
      3,
    );
    const updated = addNameHistoryEntries(
      initial,
      [artifact('c', 'Cael'), artifact('d', 'Dara')],
      { mode: 'test-surface-b', seed: 'second-seed', savedAt: '2026-07-18T21:00:00.000Z' },
      3,
    );

    expect(updated.version).toBe(1);
    expect(updated.entries).toHaveLength(3);
    expect(updated.entries.map((entry) => entry.artifact.spelling.text)).toEqual(['Cael', 'Dara', 'Aster']);
    expect(updated.entries.map((entry) => entry.mode)).toEqual(['test-surface-b', 'test-surface-b', 'test-surface-a']);
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

  it('drops composition-shaped records instead of treating them as shared artifacts', () => {
    const parsed = parseNameHistory(JSON.stringify({
      version: 1,
      entries: [{
        id: 'saved-composed',
        artifact: {
          id: 'composed',
          displayText: 'Aster Vale',
          identity: { displayName: 'Aster Vale' },
          readabilityDiagnostics: [],
        },
        mode: 'test-surface',
        seed: 'seed',
        savedAt: '2026-07-18T21:00:00.000Z',
      }],
    }));

    expect(parsed).toEqual({ version: 1, entries: [] });
  });

  it('returns an empty current envelope for malformed or unsupported data', () => {
    expect(parseNameHistory('{bad json')).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 2, entries: [] }))).toEqual({ version: 1, entries: [] });
    expect(parseNameHistory(JSON.stringify({ version: 1, entries: [{ id: 'bad' }] }))).toEqual({ version: 1, entries: [] });
  });

  it('filters records that add composition fields to otherwise valid artifacts', () => {
    const validEntry = {
      id: 'saved-valid',
      artifact: artifact('valid', 'Aster'),
      mode: 'game-npc',
      seed: 'seed-valid',
      savedAt: '2026-07-18T21:00:00.000Z',
    };
    const composedEntry = {
      ...validEntry,
      id: 'saved-composed',
      artifact: { ...artifact('composed', 'Bryn'), identity: {} },
    };
    const discriminatedEntry = {
      ...validEntry,
      id: 'saved-discriminated',
      artifact: { ...artifact('discriminated', 'Cael'), kind: 'generated-name' },
    };

    expect(parseNameHistory(JSON.stringify({
      version: 1,
      entries: [validEntry, composedEntry, discriminatedEntry],
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
