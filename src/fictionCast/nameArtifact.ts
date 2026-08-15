import { toNameArtifact, type ComposedNameArtifact, type GeneratedNameArtifact } from '../engine/nameArtifact';
import type { FictionCastGeneratedName } from './types';

/** Persist/present the composed Fiction Cast identity without pretending it has one aggregate sound model. */
export function toFictionCastNameArtifact(name: FictionCastGeneratedName): ComposedNameArtifact {
  return {
    kind: 'composed-identity',
    id: name.id,
    displayText: name.displayName,
    identity: name.identity,
    identityAudition: name.identityAudition,
    readabilityDiagnostics: name.readabilityDiagnostics,
  };
}

/**
 * Project the primary singular name for sound-relationship analysis while retaining
 * the composed Cast id so relationship navigation still addresses the Cast slot.
 */
export function toFictionCastPrimaryNameArtifact(name: FictionCastGeneratedName): GeneratedNameArtifact {
  return {
    ...toNameArtifact(name.primaryName),
    id: name.id,
  };
}
