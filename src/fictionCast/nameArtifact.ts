import { toNameArtifact, type NameArtifact } from '../engine/nameArtifact';
import type { FictionCastGeneratedName } from './types';

/**
 * Project the primary singular name for sound-relationship analysis while retaining
 * the composed Cast id so relationship navigation still addresses the Cast slot.
 */
export function toFictionCastPrimaryNameArtifact(name: FictionCastGeneratedName): NameArtifact {
  return {
    ...toNameArtifact(name.primaryName),
    id: name.id,
  };
}
