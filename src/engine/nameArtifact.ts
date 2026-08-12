import { isIdentityAuditionPhrase, type IdentityAuditionPhrase } from './identityAudition';
import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type {
  CastRoleAssignment,
  GeneratedName,
  NameGenerationPlan,
  NameIdentity,
  NameVariant,
  ReadabilityDiagnostic,
  RoleInfluenceMetadata,
} from './types';

export interface NameArtifact {
  readonly id: string;
  readonly displayText: string;
  readonly soundProfile?: SoundProfile;
  readonly sound?: SoundCandidate;
  readonly spelling?: RankedSpellingCandidate;
  readonly spellingCandidates?: readonly RankedSpellingCandidate[];
  readonly silhouette?: NameGenerationPlan;
  readonly variants?: readonly NameVariant[];
  readonly readabilityDiagnostics?: readonly ReadabilityDiagnostic[];
  readonly identity?: NameIdentity;
  readonly identityAudition?: IdentityAuditionPhrase;
  readonly role?: CastRoleAssignment;
  readonly roleInfluence?: RoleInfluenceMetadata;
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

function isSpellingCandidate(value: unknown): boolean {
  return isRecord(value)
    && isNonEmptyString(value.text)
    && Array.isArray(value.mappings)
    && value.mappings.every(isSpellingMapping)
    && isFiniteNumber(value.rank)
    && isFiniteNumber(value.score);
}

function isGeneratedSpellingCandidate(value: unknown): value is RankedSpellingCandidate {
  return isSpellingCandidate(value)
    && isRecord(value)
    && value.contract === 'SpellingCandidate'
    && value.version === 1;
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

function isGeneratedNamePartGeneration(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (!isSoundProfile(value.soundProfile) || !isSoundCandidate(value.sound) || !isGeneratedSpellingCandidate(value.spelling)) return false;

  return spellingMatchesSound(value.spelling, value.sound);
}

const namePartRoles = new Set(['given', 'family', 'initial', 'title', 'epithet', 'place']);
const materializedFormatKinds = new Set(['given-only', 'given-family', 'initials-family', 'title-name', 'epithet-place']);

function isNameIdentity(value: unknown): value is NameIdentity {
  if (!isRecord(value) || !isRecord(value.format)) return false;
  if (!isNonEmptyString(value.displayName) || !isNonEmptyString(value.format.id) || !isNonEmptyString(value.format.kind) || !isNonEmptyString(value.format.label)) return false;
  if (!materializedFormatKinds.has(value.format.kind)) return false;
  if (!Array.isArray(value.parts) || !Array.isArray(value.phraseParts)) return false;

  const partsById = new Map<string, string>();
  for (const part of value.parts) {
    if (!isRecord(part)
      || !isNonEmptyString(part.id)
      || !isNonEmptyString(part.role)
      || !namePartRoles.has(part.role)
      || !isNonEmptyString(part.value)
      || !isNonEmptyString(part.sourceNameId)
      || !isNonEmptyString(part.sourceName)
      || (part.generation !== undefined && !isGeneratedNamePartGeneration(part.generation))) {
      return false;
    }
    partsById.set(part.id, part.role);
  }

  return value.phraseParts.every((part) => {
    if (!isRecord(part) || !isNonEmptyString(part.kind)) return false;
    if (part.kind === 'literal') return isNonEmptyString(part.value);
    if (part.kind !== 'part' || !isNonEmptyString(part.partId) || !isNonEmptyString(part.role)) return false;
    return namePartRoles.has(part.role) && partsById.get(part.partId) === part.role;
  });
}

export function isNameArtifact(value: unknown): value is NameArtifact {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.displayText)
    && (value.sound === undefined || isSoundCandidate(value.sound))
    && (value.spelling === undefined || isSpellingCandidate(value.spelling))
    && (value.spellingCandidates === undefined
      || (Array.isArray(value.spellingCandidates) && value.spellingCandidates.every(isSpellingCandidate)))
    && (value.variants === undefined
      || (Array.isArray(value.variants) && value.variants.every(isNameVariant)))
    && (value.readabilityDiagnostics === undefined
      || (Array.isArray(value.readabilityDiagnostics) && value.readabilityDiagnostics.every(isReadabilityDiagnostic)))
    && (value.soundProfile === undefined || isSoundProfile(value.soundProfile))
    && (value.silhouette === undefined || isRecord(value.silhouette))
    && (value.identity === undefined || isNameIdentity(value.identity))
    && (value.identityAudition === undefined || isIdentityAuditionPhrase(value.identityAudition))
    && (value.role === undefined || isRecord(value.role))
    && (value.roleInfluence === undefined || isRecord(value.roleInfluence));
}

export function toNameArtifact(generatedName: GeneratedName): NameArtifact {
  return {
    id: generatedName.id,
    displayText: generatedName.identity?.displayName ?? generatedName.name,
    soundProfile: generatedName.soundProfile,
    sound: generatedName.sound,
    spelling: generatedName.spelling,
    spellingCandidates: generatedName.spellingCandidates,
    silhouette: generatedName.silhouette,
    variants: generatedName.variants,
    readabilityDiagnostics: generatedName.readabilityDiagnostics,
    ...(generatedName.identity === undefined ? {} : { identity: generatedName.identity }),
    ...(generatedName.identityAudition === undefined ? {} : { identityAudition: generatedName.identityAudition }),
    ...(generatedName.role === undefined ? {} : { role: generatedName.role }),
    ...(generatedName.roleInfluence === undefined ? {} : { roleInfluence: generatedName.roleInfluence }),
  };
}
