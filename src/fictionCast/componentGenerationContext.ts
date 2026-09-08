import type { GenerationSettings } from '../engine/types';
import type { MaterializedNameFormatKind } from './identityFormat';
import {
  resolveFictionCastSemanticIntent,
  type ResolvedFictionCastSemanticIntent,
} from './semanticIntent';
import type { CastRoleAssignment, FictionCastSettings } from './types';

export type FictionCastSoundComponentKind = 'given' | 'additional-personal' | 'family' | 'place';
export type MaterializedComponentFormat = MaterializedNameFormatKind;

export interface FictionCastComponentGenerationContext {
  readonly kind: FictionCastSoundComponentKind;
  readonly semanticIntent: ResolvedFictionCastSemanticIntent;
  readonly settings: GenerationSettings;
  readonly preferences: ResolvedFictionCastSemanticIntent['planningPreferences'];
}

export function supportingComponentKindForFormat(format: MaterializedComponentFormat): FictionCastSoundComponentKind | undefined {
  if (format === 'given-family' || format === 'given-additional-family' || format === 'initials-family') return 'family';
  if (format === 'epithet-place') return 'place';
  return undefined;
}

export function resolveFictionCastComponentGenerationContext(
  settings: FictionCastSettings,
  role: CastRoleAssignment | undefined,
  kind: FictionCastSoundComponentKind,
  slotIndex: number,
): FictionCastComponentGenerationContext {
  const semanticIntent = resolveFictionCastSemanticIntent(settings, { role, slotIndex });

  return {
    kind,
    semanticIntent,
    settings: semanticIntent.generationSettings,
    preferences: semanticIntent.planningPreferences,
  };
}
