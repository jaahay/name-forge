import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { NameHistoryEntry } from '../engine/nameHistory';
import { RecentNamesView } from './RecentNamesView';

const entry: NameHistoryEntry = {
  id: 'saved-1',
  artifact: {
    kind: 'composed-identity',
    id: 'artifact-1',
    displayText: 'Aster Vale',
    identity: {
      displayName: 'Aster Vale',
      format: { id: 'format:given-family', kind: 'given-family', label: 'Given + family name' },
      parts: [
        { id: 'aster:given', role: 'given', value: 'Aster', sourceNameId: 'aster', sourceName: 'Aster' },
        { id: 'vale:family', role: 'family', value: 'Vale', sourceNameId: 'vale', sourceName: 'Vale' },
      ],
      phraseParts: [
        { kind: 'part', partId: 'aster:given', role: 'given' },
        { kind: 'part', partId: 'vale:family', role: 'family' },
      ],
    },
    readabilityDiagnostics: [],
  },
  mode: 'game-npc',
  seed: 'npc-seed',
  savedAt: '2026-07-18T21:00:00.000Z',
};

describe('RecentNamesView', () => {
  it('renders saved artifacts through the shared inspector without regeneration', () => {
    const html = renderToString(<RecentNamesView entries={[entry]} onClear={() => undefined} />);

    for (const expected of ['Recent names', 'saved', 'Clear history', 'Aster Vale', 'Game NPC', 'Seed', 'npc-seed', 'Saved from Game NPC', 'Restored from local history without regenerating']) {
      expect(html).toContain(expected);
    }
  });

  it('renders an empty history state', () => {
    const html = renderToString(<RecentNamesView entries={[]} onClear={() => undefined} />);

    expect(html).toContain('Generate a cast or NPC name to build local history.');
  });
});
