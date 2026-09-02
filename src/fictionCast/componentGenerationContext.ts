import type { GenerationSettings, NameFormatKind } from '../engine/types';
import {
  resolveFictionCastSemanticIntent,
  type ResolvedFictionCastSemanticIntent,
} from './semanticIntent';
import type { CastRoleAssignment, FictionCastSettings } from './types';

export type FictionCastSoundComponentKind = 'given' | 'family' | 'place';
export type MaterializedComponentFormat = Exclude<NameFormatKind, 'mixed'>;

export interface FictionCastComponentGenerationContext {
  readonly kind: FictionCastSoundComponentKind;
  readonly semanticIntent: ResolvedFictionCastSemanticIntent;
  readonly settings: GenerationSettings;
  readonly preferences: ResolvedFictionCastSemanticIntent['planningPreferences'];
}

export function supportingComponentKindForFormat(format: MaterializedComponentFormat): FictionCastSoundComponentKind | undefined {
  if (format === 'given-family' || format === 'initials-family') return 'family';
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
