import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NameHistoryEntry } from '../engine/nameHistory';
import { RecentNamesView } from './RecentNamesView';

const spelling = {
  contract: 'SpellingCandidate' as const,
  version: 1 as const,
  text: 'Aster',
  mappings: [],
  rank: 1,
  score: 1,
};

const entry: NameHistoryEntry = {
  id: 'saved-1',
  artifact: {
    id: 'artifact-1',
    displayText: 'Aster',
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
    silhouette: {
      id: 'silhouette-artifact-1',
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
  },
  mode: 'game-npc',
  seed: 'npc-seed',
  savedAt: '2026-07-18T21:00:00.000Z',
};

describe('RecentNamesView', () => {
  it('renders saved singular artifacts through the shared inspector without regeneration', () => {
    const html = renderToString(<RecentNamesView entries={[entry]} onClear={() => undefined} />);

    for (const expected of ['Recent names', 'saved', 'Clear history', 'Aster', 'Game NPC', 'Seed', 'npc-seed', 'Saved from Game NPC', 'Restored from local history without regenerating']) {
      expect(html).toContain(expected);
    }
  });

  it('renders an empty history state', () => {
    const html = renderToString(<RecentNamesView entries={[]} onClear={() => undefined} />);

    expect(html).toContain('Generate a cast or NPC name to build local history.');
  });
});
