import { describe, expect, it } from 'vitest';
import { getSoundSegment, starterSoundInventory } from './soundSegments';

const consonantIds = [
  'p',
  'b',
  't',
  'd',
  'k',
  'g',
  'f',
  'v',
  'th',
  'dh',
  's',
  'z',
  'sh',
  'zh',
  'h',
  'ch',
  'j',
  'm',
  'n',
  'ng',
  'l',
  'r',
  'w',
  'y',
] as const;

const vowelIds = [
  'i',
  'ih',
  'e',
  'eh',
  'ae',
  'schwa',
  'uh',
  'a',
  'aa',
  'ao',
  'o',
  'uhRounded',
  'u',
  'er',
  'ey',
  'ay',
  'oy',
  'ow',
  'aw',
] as const;

describe('starterSoundInventory', () => {
  it('contains a broad English-oriented consonant and vowel segment set', () => {
    expect(Object.keys(starterSoundInventory)).toEqual([
      ...consonantIds,
      ...vowelIds,
    ]);
  });

  it('looks up stable consonant articulatory metadata', () => {
    expect(getSoundSegment('k')).toEqual({
      id: 'k',
      symbol: 'k',
      category: 'consonant',
      manner: 'stop',
      place: 'velar',
      voicing: 'voiceless',
      sonority: 'obstruent',
      syllableRoles: ['onset', 'coda'],
    });
    expect(getSoundSegment('ng')).toEqual({
      id: 'ng',
      symbol: 'ŋ',
      category: 'consonant',
      manner: 'nasal',
      place: 'velar',
      voicing: 'voiced',
      sonority: 'nasal',
      syllableRoles: ['coda'],
    });
  });

  it('looks up stable vowel articulatory metadata', () => {
    expect(getSoundSegment('a')).toEqual({
      id: 'a',
      symbol: 'a',
      category: 'vowel',
      movement: 'monophthong',
      sonority: 'vowel',
      height: 'open',
      backness: 'central',
      rounding: 'unrounded',
      syllableRoles: ['nucleus'],
    });
    expect(getSoundSegment('ay')).toEqual({
      id: 'ay',
      symbol: 'aɪ',
      category: 'vowel',
      movement: 'diphthong',
      sonority: 'vowel',
      startsAt: {
        height: 'open',
        backness: 'central',
        rounding: 'unrounded',
      },
      endsAt: {
        height: 'near-close',
        backness: 'front',
        rounding: 'unrounded',
      },
      syllableRoles: ['nucleus'],
    });
  });

  it('keeps internal ids separate from display symbols', () => {
    expect(getSoundSegment('y')).toMatchObject({
      id: 'y',
      symbol: 'j',
      category: 'consonant',
      manner: 'approximant',
      sonority: 'glide',
    });
    expect(getSoundSegment('j')).toMatchObject({
      id: 'j',
      symbol: 'dʒ',
      category: 'consonant',
      manner: 'affricate',
      sonority: 'obstruent',
    });
  });
});
