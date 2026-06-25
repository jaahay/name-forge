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
