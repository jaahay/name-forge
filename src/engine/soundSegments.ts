export type SyllableRole = 'onset' | 'nucleus' | 'coda';
export type SoundSegmentCategory = 'consonant' | 'vowel';
export type SonorityClass = 'obstruent' | 'nasal' | 'liquid' | 'glide' | 'vowel';

export type ConsonantManner = 'stop' | 'fricative' | 'affricate' | 'nasal' | 'approximant';
export type ConsonantPlace =
  | 'bilabial'
  | 'labiodental'
  | 'dental'
  | 'alveolar'
  | 'postalveolar'
  | 'palatal'
  | 'velar'
  | 'labial-velar'
  | 'glottal';
export type Voicing = 'voiced' | 'voiceless';

export type VowelHeight =
  | 'close'
  | 'near-close'
  | 'close-mid'
  | 'mid'
  | 'open-mid'
  | 'near-open'
  | 'open';
export type VowelBackness = 'front' | 'central' | 'back';
export type VowelRounding = 'rounded' | 'unrounded';
export type VowelMovement = 'monophthong' | 'diphthong';

interface BaseSoundSegment {
  readonly id: string;
  readonly symbol: string;
  readonly category: SoundSegmentCategory;
  readonly sonority: SonorityClass;
  readonly syllableRoles: readonly SyllableRole[];
}

export interface ConsonantSegment extends BaseSoundSegment {
  readonly category: 'consonant';
  readonly manner: ConsonantManner;
  readonly place: ConsonantPlace;
  readonly voicing: Voicing;
}

export interface VowelTarget {
  readonly height: VowelHeight;
  readonly backness: VowelBackness;
  readonly rounding: VowelRounding;
}

export interface MonophthongSegment extends BaseSoundSegment, VowelTarget {
  readonly category: 'vowel';
  readonly sonority: 'vowel';
  readonly movement: 'monophthong';
  readonly rhotic?: boolean;
}

export interface DiphthongSegment extends BaseSoundSegment {
  readonly category: 'vowel';
  readonly sonority: 'vowel';
  readonly movement: 'diphthong';
  readonly startsAt: VowelTarget;
  readonly endsAt: VowelTarget;
}

export type VowelSegment = MonophthongSegment | DiphthongSegment;
export type SoundSegment = ConsonantSegment | VowelSegment;

const frontCloseUnrounded: VowelTarget = {
  height: 'close',
  backness: 'front',
  rounding: 'unrounded',
};

const nearCloseFrontUnrounded: VowelTarget = {
  height: 'near-close',
  backness: 'front',
  rounding: 'unrounded',
};

const closeMidFrontUnrounded: VowelTarget = {
  height: 'close-mid',
  backness: 'front',
  rounding: 'unrounded',
};

const openMidFrontUnrounded: VowelTarget = {
  height: 'open-mid',
  backness: 'front',
  rounding: 'unrounded',
};

const nearOpenFrontUnrounded: VowelTarget = {
  height: 'near-open',
  backness: 'front',
  rounding: 'unrounded',
};

const midCentralUnrounded: VowelTarget = {
  height: 'mid',
  backness: 'central',
  rounding: 'unrounded',
};

const openMidCentralUnrounded: VowelTarget = {
  height: 'open-mid',
  backness: 'central',
  rounding: 'unrounded',
};

const openCentralUnrounded: VowelTarget = {
  height: 'open',
  backness: 'central',
  rounding: 'unrounded',
};

const openBackUnrounded: VowelTarget = {
  height: 'open',
  backness: 'back',
  rounding: 'unrounded',
};

const openMidBackRounded: VowelTarget = {
  height: 'open-mid',
  backness: 'back',
  rounding: 'rounded',
};

const closeMidBackRounded: VowelTarget = {
  height: 'close-mid',
  backness: 'back',
  rounding: 'rounded',
};

const nearCloseBackRounded: VowelTarget = {
  height: 'near-close',
  backness: 'back',
  rounding: 'rounded',
};

const closeBackRounded: VowelTarget = {
  height: 'close',
  backness: 'back',
  rounding: 'rounded',
};

export const starterSoundInventory = {
  p: {
    id: 'p',
    symbol: 'p',
    category: 'consonant',
    manner: 'stop',
    place: 'bilabial',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  b: {
    id: 'b',
    symbol: 'b',
    category: 'consonant',
    manner: 'stop',
    place: 'bilabial',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  t: {
    id: 't',
    symbol: 't',
    category: 'consonant',
    manner: 'stop',
    place: 'alveolar',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  d: {
    id: 'd',
    symbol: 'd',
    category: 'consonant',
    manner: 'stop',
    place: 'alveolar',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  k: {
    id: 'k',
    symbol: 'k',
    category: 'consonant',
    manner: 'stop',
    place: 'velar',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  g: {
    id: 'g',
    symbol: 'g',
    category: 'consonant',
    manner: 'stop',
    place: 'velar',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  f: {
    id: 'f',
    symbol: 'f',
    category: 'consonant',
    manner: 'fricative',
    place: 'labiodental',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  v: {
    id: 'v',
    symbol: 'v',
    category: 'consonant',
    manner: 'fricative',
    place: 'labiodental',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  th: {
    id: 'th',
    symbol: 'θ',
    category: 'consonant',
    manner: 'fricative',
    place: 'dental',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  dh: {
    id: 'dh',
    symbol: 'ð',
    category: 'consonant',
    manner: 'fricative',
    place: 'dental',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  s: {
    id: 's',
    symbol: 's',
    category: 'consonant',
    manner: 'fricative',
    place: 'alveolar',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  z: {
    id: 'z',
    symbol: 'z',
    category: 'consonant',
    manner: 'fricative',
    place: 'alveolar',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  sh: {
    id: 'sh',
    symbol: 'ʃ',
    category: 'consonant',
    manner: 'fricative',
    place: 'postalveolar',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  zh: {
    id: 'zh',
    symbol: 'ʒ',
    category: 'consonant',
    manner: 'fricative',
    place: 'postalveolar',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  h: {
    id: 'h',
    symbol: 'h',
    category: 'consonant',
    manner: 'fricative',
    place: 'glottal',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset'],
  },
  ch: {
    id: 'ch',
    symbol: 'tʃ',
    category: 'consonant',
    manner: 'affricate',
    place: 'postalveolar',
    voicing: 'voiceless',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  j: {
    id: 'j',
    symbol: 'dʒ',
    category: 'consonant',
    manner: 'affricate',
    place: 'postalveolar',
    voicing: 'voiced',
    sonority: 'obstruent',
    syllableRoles: ['onset', 'coda'],
  },
  m: {
    id: 'm',
    symbol: 'm',
    category: 'consonant',
    manner: 'nasal',
    place: 'bilabial',
    voicing: 'voiced',
    sonority: 'nasal',
    syllableRoles: ['onset', 'coda'],
  },
  n: {
    id: 'n',
    symbol: 'n',
    category: 'consonant',
    manner: 'nasal',
    place: 'alveolar',
    voicing: 'voiced',
    sonority: 'nasal',
    syllableRoles: ['onset', 'coda'],
  },
  ng: {
    id: 'ng',
    symbol: 'ŋ',
    category: 'consonant',
    manner: 'nasal',
    place: 'velar',
    voicing: 'voiced',
    sonority: 'nasal',
    syllableRoles: ['coda'],
  },
  l: {
    id: 'l',
    symbol: 'l',
    category: 'consonant',
    manner: 'approximant',
    place: 'alveolar',
    voicing: 'voiced',
    sonority: 'liquid',
    syllableRoles: ['onset', 'coda'],
  },
  r: {
    id: 'r',
    symbol: 'r',
    category: 'consonant',
    manner: 'approximant',
    place: 'alveolar',
    voicing: 'voiced',
    sonority: 'liquid',
    syllableRoles: ['onset', 'coda'],
  },
  w: {
    id: 'w',
    symbol: 'w',
    category: 'consonant',
    manner: 'approximant',
    place: 'labial-velar',
    voicing: 'voiced',
    sonority: 'glide',
    syllableRoles: ['onset'],
  },
  y: {
    id: 'y',
    symbol: 'j',
    category: 'consonant',
    manner: 'approximant',
    place: 'palatal',
    voicing: 'voiced',
    sonority: 'glide',
    syllableRoles: ['onset'],
  },
  i: {
    id: 'i',
    symbol: 'i',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...frontCloseUnrounded,
    syllableRoles: ['nucleus'],
  },
  ih: {
    id: 'ih',
    symbol: 'ɪ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...nearCloseFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  e: {
    id: 'e',
    symbol: 'e',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...closeMidFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  eh: {
    id: 'eh',
    symbol: 'ɛ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...openMidFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  ae: {
    id: 'ae',
    symbol: 'æ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...nearOpenFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  schwa: {
    id: 'schwa',
    symbol: 'ə',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...midCentralUnrounded,
    syllableRoles: ['nucleus'],
  },
  uh: {
    id: 'uh',
    symbol: 'ʌ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...openMidCentralUnrounded,
    syllableRoles: ['nucleus'],
  },
  a: {
    id: 'a',
    symbol: 'a',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...openCentralUnrounded,
    syllableRoles: ['nucleus'],
  },
  aa: {
    id: 'aa',
    symbol: 'ɑ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...openBackUnrounded,
    syllableRoles: ['nucleus'],
  },
  ao: {
    id: 'ao',
    symbol: 'ɔ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...openMidBackRounded,
    syllableRoles: ['nucleus'],
  },
  o: {
    id: 'o',
    symbol: 'o',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...closeMidBackRounded,
    syllableRoles: ['nucleus'],
  },
  uhRounded: {
    id: 'uhRounded',
    symbol: 'ʊ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...nearCloseBackRounded,
    syllableRoles: ['nucleus'],
  },
  u: {
    id: 'u',
    symbol: 'u',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...closeBackRounded,
    syllableRoles: ['nucleus'],
  },
  er: {
    id: 'er',
    symbol: 'ɚ',
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...midCentralUnrounded,
    rhotic: true,
    syllableRoles: ['nucleus'],
  },
  ey: {
    id: 'ey',
    symbol: 'eɪ',
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt: closeMidFrontUnrounded,
    endsAt: nearCloseFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  ay: {
    id: 'ay',
    symbol: 'aɪ',
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt: openCentralUnrounded,
    endsAt: nearCloseFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  oy: {
    id: 'oy',
    symbol: 'ɔɪ',
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt: openMidBackRounded,
    endsAt: nearCloseFrontUnrounded,
    syllableRoles: ['nucleus'],
  },
  ow: {
    id: 'ow',
    symbol: 'oʊ',
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt: closeMidBackRounded,
    endsAt: nearCloseBackRounded,
    syllableRoles: ['nucleus'],
  },
  aw: {
    id: 'aw',
    symbol: 'aʊ',
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt: openCentralUnrounded,
    endsAt: nearCloseBackRounded,
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
