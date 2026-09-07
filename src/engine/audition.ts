import { createAuditionPhonology, type AuditionPhonology } from './auditionPhonology';
import { renderBrowserAuditionCue, type BrowserAuditionCue } from './browserAuditionProjection';
import type { SegmentSequence } from './soundGenerator';

export type NameAuditionCueContract = 'NameAuditionCue';
export type NameAuditionCueSource = 'sound-sequence';

export interface NameAuditionCue extends Omit<BrowserAuditionCue, 'contract'> {
  readonly contract: NameAuditionCueContract;
  readonly phonology: AuditionPhonology;
}

export function renderAuditionCue(sequence: SegmentSequence): NameAuditionCue {
  const phonology = createAuditionPhonology(sequence);
  const browserCue = renderBrowserAuditionCue(phonology);

  return {
    ...browserCue,
    contract: 'NameAuditionCue',
    phonology,
  };
}

export { createAuditionPhonology } from './auditionPhonology';
export type { AuditionPhonology, AuditionSyllable, AuditionStress } from './auditionPhonology';
export { renderBrowserAuditionCue } from './browserAuditionProjection';
export type { BrowserAuditionCue } from './browserAuditionProjection';
