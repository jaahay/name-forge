import type {
  SegmentSequence,
  SegmentSyllable,
  SyllableSonorityProfile,
  SyllableStress,
  SyllableStressSource,
  SyllableWeight,
} from './soundGenerator';
import type { SoundSegmentId } from './starterSoundInventory';

export type AuditionPhonologyContract = 'AuditionPhonology';
export type AuditionPhonologySource = 'sound-sequence';
export type AuditionStress = SyllableStress;

export interface AuditionSyllable {
  readonly index: number;
  readonly stress: AuditionStress;
  readonly stressSource: SyllableStressSource;
  readonly weight: SyllableWeight;
  readonly sonorityProfile: SyllableSonorityProfile;
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

interface AuditionStressResolution {
  readonly stress: AuditionStress;
  readonly stressSource: SyllableStressSource;
}

function fallbackStressFor(index: number, syllableCount: number): AuditionStress {
  if (syllableCount <= 1) return 'primary';
  return index === Math.max(0, syllableCount - 2) ? 'primary' : 'unstressed';
}

function auditionStressFor(syllable: SegmentSyllable, index: number, syllableCount: number): AuditionStressResolution {
  if (syllable.stress !== 'unspecified') {
    return {
      stress: syllable.stress,
      stressSource: syllable.stressSource,
    };
  }

  return {
    stress: fallbackStressFor(index, syllableCount),
    stressSource: 'fallback',
  };
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
    syllables: sequence.syllables.map((syllable, index): AuditionSyllable => {
      const stress = auditionStressFor(syllable, index, sequence.syllables.length);

      return {
        index,
        stress: stress.stress,
        stressSource: stress.stressSource,
        weight: syllable.weight,
        sonorityProfile: syllable.sonorityProfile,
        onset: syllableRoleSegments(sequence, syllable.onset),
        nucleus: syllableRoleSegments(sequence, syllable.nucleus),
        coda: syllableRoleSegments(sequence, syllable.coda),
        segments: segmentsFor(sequence, syllable),
      };
    }),
  };
}
