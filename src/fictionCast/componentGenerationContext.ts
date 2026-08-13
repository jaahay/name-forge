import type { CastRoleAssignment, GenerationSettings, NameFormatKind } from '../engine/types';
import { roleInfluencedSettings } from './roles';

export type FictionCastSoundComponentKind = 'given' | 'family' | 'place';
export type MaterializedComponentFormat = Exclude<NameFormatKind, 'mixed'>;

export interface FictionCastComponentGenerationContext {
  readonly kind: FictionCastSoundComponentKind;
  readonly settings: GenerationSettings;
}

export function supportingComponentKindForFormat(format: MaterializedComponentFormat): FictionCastSoundComponentKind | undefined {
  if (format === 'given-family' || format === 'initials-family') return 'family';
  if (format === 'epithet-place') return 'place';
  return undefined;
}

export function resolveFictionCastComponentGenerationContext(
  settings: GenerationSettings,
  role: CastRoleAssignment | undefined,
  kind: FictionCastSoundComponentKind,
): FictionCastComponentGenerationContext {
  return {
    kind,
    settings: roleInfluencedSettings(settings, role),
  };
}
