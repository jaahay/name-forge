import { describe, expect, it } from 'vitest';
import {
  getSoundSegment,
  renderSegmentSequenceTranscription,
  starterSoundInventory,
  type SegmentSequenceFixture,
} from './soundSegments';

describe('starterSoundInventory', () => {
  it('looks up stable segment metadata', () => {
    expect(getSoundSegment('k')).toEqual({
      id: 'k',
      symbol: 'k',
      kind: 'consonant',
      syllableRoles: ['onset', 'coda'],
    });
    expect(getSoundSegment('a')).toEqual({
      id: 'a',
      symbol: 'a',
      kind: 'vowel',
      syllableRoles: ['nucleus'],
    });
    expect(Object.keys(starterSoundInventory)).toEqual([
      'k',
      'l',
      'm',
      'n',
      'r',
      's',
      't',
      'y',
      'a',
      'e',
      'i',
      'o',
    ]);
  });

  it('renders a generated segment fixture as display transcription', () => {
    const sequence: SegmentSequenceFixture = {
      syllables: [
        ['k', 'a'],
        ['l', 'e', 'n'],
      ],
    };

    expect(renderSegmentSequenceTranscription(sequence)).toBe('/ka.len/');
  });

  it('keeps internal ids separate from display symbols', () => {
    const sequence: SegmentSequenceFixture = {
      syllables: [
        ['y', 'a'],
        ['r', 'o'],
      ],
    };

    expect(getSoundSegment('y')).toEqual({
      id: 'y',
      symbol: 'j',
      kind: 'glide',
      syllableRoles: ['onset'],
    });
    expect(renderSegmentSequenceTranscription(sequence)).toBe('/ja.ro/');
  });
});
