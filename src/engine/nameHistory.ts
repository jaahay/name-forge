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
  setItem(key: string, value