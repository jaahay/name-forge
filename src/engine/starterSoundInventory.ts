import type {
  ConsonantManner,
  ConsonantPlace,
  ConsonantSegment,
  SoundSegment,
  SonorityClass,
  SyllableRole,
  Voicing,
  VowelTarget,
  MonophthongSegment,
  DiphthongSegment,
} from './soundSegmentTypes';

const frontCloseUnrounded: VowelTarget = { height: 'close', backness: 'front', rounding: 'unrounded' };
const nearCloseFrontUnrounded: VowelTarget = { height: 'near-close', backness: 'front', rounding: 'unrounded' };
const closeMidFrontUnrounded: VowelTarget = { height: 'close-mid', backness: 'front', rounding: 'unrounded' };
const openMidFrontUnrounded: VowelTarget = { height: 'open-mid', backness: 'front', rounding: 'unrounded' };
const nearOpenFrontUnrounded: VowelTarget = { height: 'near-open', backness: 'front', rounding: 'unrounded' };
const midCentralUnrounded: VowelTarget = { height: 'mid', backness: 'central', rounding: 'unrounded' };
const openMidCentralUnrounded: VowelTarget = { height: 'open-mid', backness: 'central', rounding: 'unrounded' };
const openCentralUnrounded: VowelTarget = { height: 'open', backness: 'central', rounding: 'unrounded' };
const openBackUnrounded: VowelTarget = { height: 'open', backness: 'back', rounding: 'unrounded' };
const openMidBackRounded: VowelTarget = { height: 'open-mid', backness: 'back', rounding: 'rounded' };
const closeMidBackRounded: VowelTarget = { height: 'close-mid', backness: 'back', rounding: 'rounded' };
const nearCloseBackRounded: VowelTarget = { height: 'near-close', backness: 'back', rounding: 'rounded' };
const closeBackRounded: VowelTarget = { height: 'close', backness: 'back', rounding: 'rounded' };

function consonant(
  id: string,
  symbol: string,
  manner: ConsonantManner,
  place: ConsonantPlace,
  voicing: Voicing,
  sonority: Exclude<SonorityClass, 'vowel'>,
  syllableRoles: readonly SyllableRole[],
): ConsonantSegment {
  return { id, symbol, category: 'consonant', manner, place, voicing, sonority, syllableRoles };
}

function monophthong(
  id: string,
  symbol: string,
  target: VowelTarget,
  rhotic = false,
): MonophthongSegment {
  return {
    id,
    symbol,
    category: 'vowel',
    movement: 'monophthong',
    sonority: 'vowel',
    ...target,
    ...(rhotic ? { rhotic } : {}),
    syllableRoles: ['nucleus'],
  };
}

function diphthong(
  id: string,
  symbol: string,
  startsAt: VowelTarget,
  endsAt: VowelTarget,
): DiphthongSegment {
  return {
    id,
    symbol,
    category: 'vowel',
    movement: 'diphthong',
    sonority: 'vowel',
    startsAt,
    endsAt,
    syllableRoles: ['nucleus'],
  };
}

export const starterSoundInventory = {
  p: consonant('p', 'p', 'stop', 'bilabial', 'voiceless', 'obstruent', ['onset', 'coda']),
  b: consonant('b', 'b', 'stop', 'bilabial', 'voiced', 'obstruent', ['onset', 'coda']),
  t: consonant('t', 't', 'stop', 'alveolar', 'voiceless', 'obstruent', ['onset', 'coda']),
  d: consonant('d', 'd', 'stop', 'alveolar', 'voiced', 'obstruent', ['onset', 'coda']),
  k: consonant('k', 'k', 'stop', 'velar', 'voiceless', 'obstruent', ['onset', 'coda']),
  g: consonant('g', 'g', 'stop', 'velar', 'voiced', 'obstruent', ['onset', 'coda']),
  f: consonant('f', 'f', 'fricative', 'labiodental', 'voiceless', 'obstruent', ['onset', 'coda']),
  v: consonant('v', 'v', 'fricative', 'labiodental', 'voiced', 'obstruent', ['onset', 'coda']),
  th: consonant('th', 'θ', 'fricative', 'dental', 'voiceless', 'obstruent', ['onset', 'coda']),
  dh: consonant('dh', 'ð', 'fricative', 'dental', 'voiced', 'obstruent', ['onset', 'coda']),
  s: consonant('s', 's', 'fricative', 'alveolar', 'voiceless', 'obstruent', ['onset', 'coda']),
  z: consonant('z', 'z', 'fricative', 'alveolar', 'voiced', 'obstruent', ['onset', 'coda']),
  sh: consonant('sh', 'ʃ', 'fricative', 'postalveolar', 'voiceless', 'obstruent', ['onset', 'coda']),
  zh: consonant('zh', 'ʒ', 'fricative', 'postalveolar', 'voiced', 'obstruent', ['onset', 'coda']),
  h: consonant('h', 'h', 'fricative', 'glottal', 'voiceless', 'obstruent', ['onset']),
  ch: consonant('ch', 'tʃ', 'affricate', 'postalveolar', 'voiceless', 'obstruent', ['onset', 'coda']),
  j: consonant('j', 'dʒ', 'affricate', 'postalveolar', 'voiced', 'obstruent', ['onset', 'coda']),
  m: consonant('m', 'm', 'nasal', 'bilabial', 'voiced', 'nasal', ['onset', 'coda']),
  n: consonant('n', 'n', 'nasal', 'alveolar', 'voiced', 'nasal', ['onset', 'coda']),
  ng: consonant('ng', 'ŋ', 'nasal', 'velar', 'voiced', 'nasal', ['coda']),
  l: consonant('l', 'l', 'approximant', 'alveolar', 'voiced', 'liquid', ['onset', 'coda']),
  r: consonant('r', 'r', 'approximant', 'alveolar', 'voiced', 'liquid', ['onset', 'coda']),
  w: consonant('w', 'w', 'approximant', 'labial-velar', 'voiced', 'glide', ['onset']),
  y: consonant('y', 'j', 'approximant', 'palatal', 'voiced', 'glide', ['onset']),
  i: monophthong('i', 'i', frontCloseUnrounded),
  ih: monophthong('ih', 'ɪ', nearCloseFrontUnrounded),
  e: monophthong('e', 'e', closeMidFrontUnrounded),
  eh: monophthong('eh', 'ɛ', openMidFrontUnrounded),
  ae: monophthong('ae', 'æ', nearOpenFrontUnrounded),
  schwa: monophthong('schwa', 'ə', midCentralUnrounded),
  uh: monophthong('uh', 'ʌ', openMidCentralUnrounded),
  a: monophthong('a', 'a', openCentralUnrounded),
  aa: monophthong('aa', 'ɑ', openBackUnrounded),
  ao: monophthong('ao', 'ɔ', openMidBackRounded),
  o: monophthong('o', 'o', closeMidBackRounded),
  uhRounded: monophthong('uhRounded', 'ʊ', nearCloseBackRounded),
  u: monophthong('u', 'u', closeBackRounded),
  er: monophthong('er', 'ɚ', midCentralUnrounded, true),
  ey: diphthong('ey', 'eɪ', closeMidFrontUnrounded, nearCloseFrontUnrounded),
  ay: diphthong('ay', 'aɪ', openCentralUnrounded, nearCloseFrontUnrounded),
  oy: diphthong('oy', 'ɔɪ', openMidBackRounded, nearCloseFrontUnrounded),
  ow: diphthong('ow', 'oʊ', closeMidBackRounded, nearCloseBackRounded),
  aw: diphthong('aw', 'aʊ', openCentralUnrounded, nearCloseBackRounded),
} as const satisfies Record<string, SoundSegment>;

export type SoundSegmentId = keyof typeof starterSoundInventory;

export function getSoundSegment(id: SoundSegmentId): SoundSegment {
  return starterSoundInventory[id];
}
