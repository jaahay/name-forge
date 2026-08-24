import type { FictionCastGeneratedEnsemble } from './types';

/**
 * Surface-owned snapshot contract for a cast that can be reopened deliberately.
 * Storage is intentionally not prescribed here; callers may supply records from
 * browser persistence or another Fiction Cast-owned lifecycle implementation.
 */
export interface FictionCastRememberedCast {
  readonly id: string;
  readonly label: string;
  readonly savedAt: string;
  readonly ensemble: FictionCastGeneratedEnsemble;
  readonly lockedNameIds: readonly string[];
}
