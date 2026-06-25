export type SoundSegmentKind = 'consonant' | 'vowel' | 'liquid' | 'glide';
export type SyllableRole = 'onset' | 'nucleus' | 'coda';

export interface SoundSegment {
  readonly id: string;
  readonly symbol: string;
  readonly kind: SoundSegmentKind;
  readonly syllableRoles: readonly SyllableRole[];
}

export const starterSoundInventory = {
  k: {
    id: 'k',
    symbol: 'k',
    kind: 'consonant',
    syllableRoles: ['onset', 'coda'],
  },
  l: {
    id: 'l',
    symbol: 'l',
    kind: 'liquid',
    syllableRoles: ['onset', 'coda'],
  },
  m: {
    id: 'm',
    symbol: 'm',
    kind: 'consonant',
    syllableRoles: ['onset', 'coda'],
  },
  n: {
    id: 'n',
    symbol: 'n',
    kind: 'consonant',
    syllableRoles: ['onset', 'coda'],
  },
  r: {
    id: 'r',
    symbol: 'r',
    kind: 'liquid',
    syllableRoles: ['onset', 'coda'],
  },
  s: {
    id: 's',
    symbol: 's',
    kind: 'consonant',
    syllableRoles: ['onset', 'coda'],
  },
  t: {
    id: 't',
    symbol: 't',
    kind: 'consonant',
    syllableRoles: ['onset', 'coda'],
  },
  y: {
    id: 'y',
    symbol: 'j',
    kind: 'glide',
    syllableRoles: ['onset'],
  },
  a: {
    id: 'a',
    symbol: 'a',
    kind: 'vowel',
    syllableRoles: ['nucleus'],
  },
  e: {
    id: 'e',
    symbol: 'e',
    kind: 'vowel',
    syllableRoles: ['nucleus'],
  },
  i: {
    id: 'i',
    symbol: 'i',
    kind: 'vowel',
    syllableRoles: ['nucleus'],
  },
  o: {
    id: 'o',
    symbol: 'o',
    kind: 'vowel',
    syllableRoles: ['nucleus'],
  },
} as const satisfies Record<string, SoundSegment>;

export type SoundSegmentId = keyof typeof starterSoundInventory;

export interface SegmentSequenceFixture {
  readonly syllables: readonly (readonly SoundSegmentId[])[];
}

export function getSoundSegment(id: SoundSegmentId): SoundSegment {
  return starterSoundInventory[id];
}

export function renderSegmentSequenceTranscription(sequence: SegmentSequenceFixture): string {
  const syllables = sequence.syllables.map((syllable) =>
    syllable.map((segmentId) => getSoundSegment(segmentId).symbol).join(''),
  );

  return `/${syllables.join('.')}/`;
}
