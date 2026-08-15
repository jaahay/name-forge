import { migrateLegacyNameArtifact, type NameArtifact } from './nameArtifact';

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

function parseHistoryEntry(value: unknown): NameHistoryEntry | undefined {
  if (!isRecord(value)
    || !isNonEmptyString(value.id)
    || !isNonEmptyString(value.mode)
    || typeof value.seed !== 'string'
    || !isNonEmptyString(value.savedAt)) {
    return undefined;
  }

  const artifact = migrateLegacyNameArtifact(value.artifact);
  if (!artifact) return undefined;

  return {
    id: value.id,
    artifact,
    mode: value.mode,
    seed: value.seed,
    savedAt: value.savedAt,
  };
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
      entries: parsed.entries.flatMap((entry) => {
        const migrated = parseHistoryEntry(entry);
        return migrated ? [migrated] : [];
      }).slice(0, DEFAULT_NAME_HISTORY_LIMIT),
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
