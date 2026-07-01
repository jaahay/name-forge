import type { SegmentSequence } from './soundGenerator';
import type { SoundSegmentId } from './starterSoundInventory';

export type NameAuditionCueContract = 'NameAuditionCue';
export type NameAuditionCueSource = 'sound-sequence';

export interface NameAuditionCue {
  readonly contract: NameAuditionCueContract;
  readonly version: 1;
  readonly source: NameAuditionCueSource;
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

function renderSyllable(sequence: SegmentSequence, start: number, end: number): string {
  return sequence.segments
    .slice(start, end)
    .map((segmentId) => browserSpeechTokenBySegmentId[segmentId])
    .join('');
}

export function renderAuditionCue(sequence: SegmentSequence): NameAuditionCue {
  const syllableText = sequence.syllables.map((syllable) => renderSyllable(sequence, syllable.start, syllable.end));
  const speechText = syllableText.join(' ');

  return {
    contract: 'NameAuditionCue',
    version: 1,
    source: 'sound-sequence',
    sequenceId: sequence.id,
    profileId: sequence.profileId,
    speechText,
    displayText: speechText,
    syllableText,
  };
}
