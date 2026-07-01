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

function renderSyllableSpeechText(syllable: AuditionSyllable): string {
  return syllable.segments.map((segmentId) => browserSpeechTokenBySegmentId[segmentId]).join('');
}

function renderSyllableGuideText(syllable: AuditionSyllable): string {
  const speechText = renderSyllableSpeechText(syllable);
  if (syllable.stress === 'primary') return speechText.toUpperCase();
  return speechText;
}

export function renderBrowserAuditionCue(phonology: AuditionPhonology): BrowserAuditionCue {
  const syllableText = phonology.syllables.map(renderSyllableSpeechText);

  return {
    contract: 'BrowserAuditionCue',
    version: 1,
    source: phonology.source,
    sequenceId: phonology.sequenceId,
    profileId: phonology.profileId,
    speechText: syllableText.join(' '),
    displayText: phonology.syllables.map(renderSyllableGuideText).join('-'),
    syllableText,
  };
}
