import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type {
  GeneratedName,
  NameGenerationPlan,
  NameVariant,
  ReadabilityDiagnostic,
} from './types';

/** Durable evidence for exactly one sound-backed generated name. */
export interface NameArtifact {
  readonly id: string;
  readonly soundProfile: SoundProfile;
  readonly sound: SoundCandidate;
  readonly spelling: RankedSpellingCandidate;
  readonly spellingCandidates: readonly RankedSpellingCandidate[];
  readonly generationPlan: NameGenerationPlan;
  readonly variants: readonly NameVariant[];
  readonly readabilityDiagnostics: readonly ReadabilityDiagnostic[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isFiniteNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIndexArray(value: unknown, segmentCount: number): boolean {
  return Array.isArray(value)
    && value.every((index) => Number.isInteger(index) && index >= 0 && index < segmentCount);
}

function isSpellingMapping(value: unknown): boolean {
  return isRecord(value)
    && Number.isInteger(value.segmentIndex)
    && (value.segmentIndex as number) >= 0
    && isNonEmptyString(value.segmentId)
    && Number.isInteger(value.syllableIndex)
    && (value.syllableIndex as number) >= 0
    && isNonEmptyString(value.syllableRole)
    && typeof value.text === 'string'
    && Number.isInteger(value.start)
    && Number.isInteger(value.end)
    && (value.start as number) >= 0
    && (value.end as number) >= (value.start as number);
}

function isSpellingCandidate(value: unknown): value is RankedSpellingCandidate {
  return isRecord(value)
    && value.contract === 'SpellingCandidate'
    && value.version === 1
    && isNonEmptyString(value.text)
    && Array.isArray(value.mappings)
    && value.mappings.every(isSpellingMapping)
    && isFiniteNumber(value.rank)
    && isFiniteNumber(value.score);
}

function isReadabilityDiagnostic(value: unknown): boolean {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.scope)
    && isNonEmptyString(value.severity)
    && isNonEmptyString(value.label)
    && isNonEmptyString(value.detail);
}

function isNameVariant(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.source)) return false;

  return isNonEmptyString(value.value)
    && isNonEmptyString(value.kind)
    && isNonEmptyString(value.relationship)
    && isNonEmptyString(value.confidence)
    && isNonEmptyString(value.source.id)
    && isNonEmptyString(value.source.kind)
    && isNonEmptyString(value.source.label)
    && isNonEmptyString(value.source.detail)
    && typeof value.generated === 'boolean'
    && isNonEmptyString(value.ruleId)
    && (value.locale === undefined || typeof value.locale === 'string');
}

function isSoundCandidate(value: unknown): value is SoundCandidate {
  if (!isRecord(value) || !isRecord(value.sequence)) return false;
  if (value.contract !== 'SoundCandidate' || value.version !== 1) return false;
  if (!isNonEmptyString(value.cadence) || !isNonEmptyString(value.transcription)) return false;
  if (value.sequence.contract !== 'SegmentSequence' || value.sequence.version !== 1) return false;
  if (!Array.isArray(value.sequence.segments) || !value.sequence.segments.every((segment) => typeof segment === 'string')) return false;
  if (!Array.isArray(value.sequence.syllables)) return false;

  const segmentCount = value.sequence.segments.length;
  return value.sequence.syllables.every((syllable) => {
    if (!isRecord(syllable)) return false;

    return Number.isInteger(syllable.start)
      && Number.isInteger(syllable.end)
      && (syllable.start as number) >= 0
      && (syllable.end as number) >= (syllable.start as number)
      && (syllable.end as number) <= segmentCount
      && isIndexArray(syllable.onset, segmentCount)
      && isIndexArray(syllable.nucleus, segmentCount)
      && isIndexArray(syllable.coda, segmentCount)
      && isNonEmptyString(syllable.shape)
      && isNonEmptyString(syllable.weight)
      && isNonEmptyString(syllable.sonorityProfile)
      && isNonEmptyString(syllable.stress)
      && isNonEmptyString(syllable.stressSource);
  });
}

function isSoundProfile(value: unknown): value is SoundProfile {
  if (!isRecord(value) || !isRecord(value.targets) || !isRecord(value.phonotactics)) return false;
  if (!isRecord(value.targets.syllableCount)) return false;

  return isNonEmptyString(value.targets.length)
    && Number.isInteger(value.targets.syllableCount.min)
    && Number.isInteger(value.targets.syllableCount.max)
    && Number.isInteger(value.targets.syllableCount.preferred)
    && isNonEmptyString(value.targets.texture)
    && isFiniteNumber(value.targets.distinctiveness)
    && Array.isArray(value.targets.cadences)
    && value.targets.cadences.every(isNonEmptyString)
    && Array.isArray(value.phonotactics.preferredSyllableShapes)
    && value.phonotactics.preferredSyllableShapes.every(isNonEmptyString)
    && isFiniteNumber(value.phonotactics.onsetWeight)
    && isFiniteNumber(value.phonotactics.codaWeight)
    && isFiniteNumber(value.phonotactics.liquidWeight)
    && isFiniteNumber(value.phonotactics.glideWeight)
    && isFiniteNumber(value.phonotactics.clusterTolerance);
}

function spellingMatchesSound(spelling: RankedSpellingCandidate, sound: SoundCandidate): boolean {
  return spelling.mappings.every((mapping) => {
    if (mapping.segmentIndex >= sound.sequence.segments.length) return false;
    if (mapping.syllableIndex >= sound.sequence.syllables.length) return false;
    if (sound.sequence.segments[mapping.segmentIndex] !== mapping.segmentId) return false;
    return mapping.end <= spelling.text.length;
  });
}

function sameSpelling(left: RankedSpellingCandidate, right: RankedSpellingCandidate): boolean {
  return left.text === right.text && left.rank === right.rank && left.score === right.score;
}

export function isNameArtifact(value: unknown): value is NameArtifact {
  if (!isRecord(value)
    || value.kind !== undefined
    || value.identity !== undefined
    || value.identityAudition !== undefined
    || value.displayText !== undefined
    || value.silhouette !== undefined
    || !isNonEmptyString(value.id)
    || !isSoundProfile(value.soundProfile)
    || !isSoundCandidate(value.sound)
    || !isSpellingCandidate(value.spelling)
    || !spellingMatchesSound(value.spelling, value.sound)
    || !Array.isArray(value.spellingCandidates)
    || !value.spellingCandidates.every(isSpellingCandidate)
    || !value.spellingCandidates.some((candidate) => sameSpelling(candidate, value.spelling as RankedSpellingCandidate))
    || !isRecord(value.generationPlan)
    || !Array.isArray(value.variants)
    || !value.variants.every(isNameVariant)
    || !Array.isArray(value.readabilityDiagnostics)
    || !value.readabilityDiagnostics.every(isReadabilityDiagnostic)) {
    return false;
  }

  return value.spellingCandidates.every((candidate) => spellingMatchesSound(candidate, value.sound as SoundCandidate));
}

export function toNameArtifact(generatedName: GeneratedName): NameArtifact {
  return {
    id: generatedName.id,
    soundProfile: generatedName.soundProfile,
    sound: generatedName.sound,
    spelling: generatedName.spelling,
    spellingCandidates: generatedName.spellingCandidates,
    generationPlan: generatedName.generationPlan,
    variants: generatedName.variants,
    readabilityDiagnostics: generatedName.readabilityDiagnostics,
  };
}
