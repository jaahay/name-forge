import type { SegmentSequence, SegmentSyllable } from './soundGenerator';
import type { SoundSegmentId } from './starterSoundInventory';

export type AuditionPhonologyContract = 'AuditionPhonology';
export type AuditionPhonologySource = 'sound-sequence';
export type AuditionStress = 'primary' | 'unstressed';

export interface AuditionSyllable {
  readonly index: number;
  readonly stress: AuditionStress;
  readonly onset: readonly SoundSegmentId[];
  readonly nucleus: readonly SoundSegmentId[];
  readonly coda: readonly SoundSegmentId[];
  readonly segments: readonly SoundSegmentId[];
}

export interface AuditionPhonology {
  readonly contract: AuditionPhonologyContract;
  readonly version: 1;
  readonly source: AuditionPhonologySource;
  readonly sequenceId: string;
  readonly profileId: string;
  readonly syllables: readonly AuditionSyllable[];
}

function stressFor(index: number, syllableCount: number): AuditionStress {
  if (syllableCount <= 1) return 'primary';
  return index === Math.max(0, syllableCount - 2) ? 'primary' : 'unstressed';
}

function segmentsFor(sequence: SegmentSequence, syllable: SegmentSyllable): readonly SoundSegmentId[] {
  return sequence.segments.slice(syllable.start, syllable.end);
}

function syllableRoleSegments(sequence: SegmentSequence, indexes: readonly number[]): readonly SoundSegmentId[] {
  return indexes.map((index) => sequence.segments[index]).filter((segmentId): segmentId is SoundSegmentId => Boolean(segmentId));
}

export function createAuditionPhonology(sequence: SegmentSequence): AuditionPhonology {
  return {
    contract: 'AuditionPhonology',
    version: 1,
    source: 'sound-sequence',
    sequenceId: sequence.id,
    profileId: sequence.profileId,
    syllables: sequence.syllables.map((syllable, index): AuditionSyllable => ({
      index,
      stress: stressFor(index, sequence.syllables.length),
      onset: syllableRoleSegments(sequence, syllable.onset),
      nucleus: syllableRoleSegments(sequence, syllable.nucleus),
      coda: syllableRoleSegments(sequence, syllable.coda),
      segments: segmentsFor(sequence, syllable),
    })),
  };
}
