import type { IdentityAuditionPhrase } from './identityAudition';
import type { SoundCandidate } from './soundGenerator';
import type { SoundProfile } from './soundProfile';
import type { RankedSpellingCandidate } from './spellingGenerator';
import type {
  CastRoleAssignment,
  GeneratedName,
  NameIdentity,
  NameSilhouette,
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
  readonly silhouette?: NameSilhouette;
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIndexArray(value: unknown, segmentCount: number): boolean {
  return Array.isArray(value)
    && value.every((index) => Number.isInteger(index) && index >= 0 && index < segmentCount);
}

function isSpellingCandidate(value: unknown): boolean {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.text)
    && Array.isArray(value.mappings)
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

function isSoundCandidate(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.sequence)) return false;
  if (!isNonEmptyString(value.id) || !isNonEmptyString(value.profileId)) return false;
  if (!isNonEmptyString(value.cadence) || !isNonEmptyString(value.transcription)) return false;
  if (!isNonEmptyString(value.sequence.id) || !isNonEmptyString(value.sequence.profileId)) return false;
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
    && (value.soundProfile === undefined || isRecord(value.soundProfile))
    && (value.silhouette === undefined || isRecord(value.silhouette))
    && (value.identity === undefined || isRecord(value.identity))
    && (value.identityAudition === undefined || isRecord(value.identityAudition))
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
