import type { AuditionPhonology, AuditionSyllable } from './auditionPhonology';
import type { SoundSegmentId } from './starterSoundInventory';

export type BrowserAuditionCueContract = 'BrowserAuditionCue';

export interface BrowserAuditionCue {
  readonly contract: BrowserAuditionCueContract;
  readonly version: 1;
  readonly source: AuditionPhonology['source'];
  readonly sequenceId: string;
  readonly profileId: string;
  readonly speechText: string;
  readonly displayText: string;
  readonly syllableText: readonly string[];
  readonly guideSyllables: readonly string[];
}

const browserSpeechTokenBySegmentId: Record<SoundSegmentId, string> = {
  p: 'p',
  b: 'b',
  t: 't',
  d: 'd',
  k: 'k',
  g: 'g',
  f: 'f',
  v: 'v',
  th: 'th',
  dh: 'th',
  s: 's',
  z: 'z',
  sh: 'sh',
  zh: 'zh',
  h: 'h',
  ch: 'ch',
  j: 'j',
  m: 'm',
  n: 'n',
  ng: 'ng',
  l: 'l',
  r: 'r',
  w: 'w',
  y: 'y',
  i: 'ee',
  ih: 'ih',
  e: 'ay',
  eh: 'eh',
  ae: 'a',
  schwa: 'uh',
  uh: 'uh',
  a: 'ah',
  aa: 'ah',
  ao: 'aw',
  o: 'oh',
  uhRounded: 'oo',
  u: 'oo',
  er: 'er',
  ey: 'ay',
  ay: 'eye',
  oy: 'oy',
  ow: 'oh',
  aw: 'ow',
};

const guideTokenBySegmentId: Record<SoundSegmentId, string> = {
  ...browserSpeechTokenBySegmentId,
  dh: 'dh',
  e: 'ay',
  ae: 'a',
  ao: 'aw',
  ow: 'oh',
  aw: 'ow',
};

const vowelSegmentIds: ReadonlySet<SoundSegmentId> = new Set([
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
]);

function renderSyllableSpeechText(syllable: AuditionSyllable): string {
  return syllable.segments.map((segmentId) => browserSpeechTokenBySegmentId[segmentId]).join('');
}

function shouldSeparateGuideToken(previousSegmentId: SoundSegmentId | undefined, segmentId: SoundSegmentId): boolean {
  return Boolean(previousSegmentId && vowelSegmentIds.has(previousSegmentId) && vowelSegmentIds.has(segmentId));
}

function renderSyllableGuideText(syllable: AuditionSyllable): string {
  const text = syllable.segments.reduce((result, segmentId, index) => {
    const separator = shouldSeparateGuideToken(syllable.segments[index - 1], segmentId) ? '-' : '';
    return `${result}${separator}${guideTokenBySegmentId[segmentId]}`;
  }, '');

  if (syllable.stress === 'primary') return text.toUpperCase();
  return text;
}

export function renderBrowserAuditionCue(phonology: AuditionPhonology): BrowserAuditionCue {
  const syllableText = phonology.syllables.map(renderSyllableSpeechText);
  const guideSyllables = phonology.syllables.map(renderSyllableGuideText);

  return {
    contract: 'BrowserAuditionCue',
    version: 1,
    source: phonology.source,
    sequenceId: phonology.sequenceId,
    profileId: phonology.profileId,
    speechText: syllableText.join(' '),
    displayText: guideSyllables.join(' · '),
    syllableText,
    guideSyllables,
  };
}
