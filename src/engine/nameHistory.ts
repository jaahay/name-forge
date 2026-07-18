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

function isNameArtifact(value: unknown): value is NameArtifact {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.displayText === 'string';
}

function isHistoryEntry(value: unknown): value is NameHistoryEntry {
  return isRecord(value)
    && typeof value.id === 'string'
    && isNameArtifact(value.artifact)
    && typeof value.mode === 'string'
    && typeof value.seed === 'string'
    && typeof value.savedAt === 'string';
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
      entries: parsed.entries.filter(isHistoryEntry),
    };
  } catch {
    return { version: NAME_HISTORY_VERSION, entries: [] };
  }
}

export function loadNameHistory(storage: NameHistoryStorage | undefined): NameHistoryEnvelopeV1 {
  if (!storage) return { version: NAME_HISTORY_VERSION, entries: [] };
  return parseNameHistory(storage.getItem(NAME_HISTORY_STORAGE_KEY));
}

export function saveNameHistory(storage: NameHistoryStorage | undefined, history: NameHistoryEnvelopeV1): void {
  if (!storage) return;
  storage.setItem(NAME_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function clearNameHistory(storage: NameHistoryStorage | undefined): NameHistoryEnvelopeV1 {
  storage?.removeItem(NAME_HISTORY_STORAGE_KEY);
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
