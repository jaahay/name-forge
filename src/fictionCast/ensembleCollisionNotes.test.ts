import { describe, expect, it } from 'vitest';
import { findFictionCastCollisionNotes } from './ensembleCollisionNotes';

describe('findFictionCastCollisionNotes', () => {
  it('reports shared endings across composed visible identities', () => {
    const notes = findFictionCastCollisionNotes([
      { id: 'arlen', displayName: 'Arlen Vale' },
      { id: 'maren', displayName: 'Maren Hale' },
      { id: 'tess', displayName: 'Tess Thorn' },
    ]);

    expect(notes).toEqual([
      {
        id: 'shared-visible-ending:le',
        kind: 'shared-visible-ending',
        value: 'le',
        members: [
          { id: 'arlen', displayName: 'Arlen Vale' },
          { id: 'maren', displayName: 'Maren Hale' },
        ],
      },
    ]);
  });

  it('reports exact visible duplicates without a redundant ending note', () => {
    const notes = findFictionCastCollisionNotes([
      { id: 'left', displayName: 'Aveline Thorn' },
      { id: 'right', displayName: '  AVELINE   THORN  ' },
    ]);

    expect(notes).toHaveLength(1);
    expect(notes[0]?.kind).toBe('same-visible-identity');
    expect(notes[0]?.members.map((member) => member.id)).toEqual(['left', 'right']);
  });

  it('returns no notes when the supported visible collision keys are distinct', () => {
    const notes = findFictionCastCollisionNotes([
      { id: 'one', displayName: 'Arlen Vale' },
      { id: 'two', displayName: 'Mira Thorn' },
      { id: 'three', displayName: 'Cedric Moss' },
    ]);

    expect(notes).toEqual([]);
  });
});
