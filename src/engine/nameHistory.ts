import type { NameArtifact } from './nameArtifact';

export const NAME_HISTORY_STORAGE_KEY = 'name-forge.recent-names.v1';
export const NAME_HISTORY_VERSION = 1;
export const DEFAULT_NAME_HISTORY_LIMIT = 24;

export interface NameHistoryEntry {
  readonly id: string;
  readonly artifact: NameArtifact;
  readonly mode: string;
  readonly seed: string;
  readonly savedAt: string;
}

export interface NameHistoryEnvelopeV1 {
  readonly version: 1;
  readonly entries: readonly NameHistoryEntry[];
}

export interface NameHistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
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
      && Array.isArray(syllable.sonorityProfile)
      && syllable.sonorityProfile.every(isFiniteNumber)
      && isNonEmptyString(syllable.stress)
      && isNonEmptyString(syllable.stressSource);
  });
}

function isNameArtifact(value: unknown): value is NameArtifact {
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
    && (value.role === undefined || isRecord(value.role))
    && (value.roleInfluence === undefined || isRecord(value.roleInfluence));
}

function isHistoryEntry(value: unknown): value is NameHistoryEntry {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isNameArtifact(value.artifact)
    && isNonEmptyString(value.mode)
    && typeof value.seed === 'string'
    && isNonEmptyString(value.savedAt);
}

export function parseNameHistory(serialized: string | null): NameHistoryEnvelopeV1 {
  if (!serialized) return { version: NAME_HISTORY_VERSION, entries: [] };

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isRecord(parsed) || parsed.version !== NAME_HISTORY_VERSION || !Array.isArray(parsed.entries)) {
      return { version: NAME_HISTORY_VERSION, entries: [] };
    }

    return {
      version: NAME_HISTORY_VERSION,
      entries: parsed.entries.filter(isHistoryEntry).slice(0, DEFAULT_NAME_HISTORY_LIMIT),
    };
  } catch {
    return { version: NAME_HISTORY_VERSION, entries: [] };
  }
}

export function loadNameHistory(storage: NameHistoryStorage | undefined): NameHistoryEnvelopeV1 {
  if (!storage) return { version: NAME_HISTORY_VERSION, entries: [] };

  try {
    return parseNameHistory(storage.getItem(NAME_HISTORY_STORAGE_KEY));
  } catch {
    return { version: NAME_HISTORY_VERSION, entries: [] };
  }
}

export function saveNameHistory(storage: NameHistoryStorage | undefined, history: NameHistoryEnvelopeV1): void {
  if (!storage) return;

  try {
    storage.setItem(NAME_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Browser storage is best-effort; generation remains usable when persistence is blocked.
  }
}

export function clearNameHistory(storage: NameHistoryStorage | undefined): NameHistoryEnvelopeV1 {
  if (storage) {
    try {
      storage.removeItem(NAME_HISTORY_STORAGE_KEY);
    } catch {
      // Clearing in-memory history remains available when persistence is blocked.
    }
  }

  return { version: NAME_HISTORY_VERSION, entries: [] };
}

export function addNameHistoryEntries(
  history: NameHistoryEnvelopeV1,
  artifacts: readonly NameArtifact[],
  context: { readonly mode: string; readonly seed: string; readonly savedAt: string },
  limit = DEFAULT_NAME_HISTORY_LIMIT,
): NameHistoryEnvelopeV1 {
  const additions = artifacts.map((artifact, index): NameHistoryEntry => ({
    id: `${context.savedAt}:${context.mode}:${artifact.id}:${index}`,
    artifact,
    mode: context.mode,
    seed: context.seed,
    savedAt: context.savedAt,
  }));

  return {
    version: NAME_HISTORY_VERSION,
    entries: [...additions, ...history.entries].slice(0, Math.max(1, Math.floor(limit))),
  };
}
