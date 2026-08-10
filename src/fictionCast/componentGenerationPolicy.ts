import { roleInfluencedSettings } from '../engine/roles';
import type { CastRoleAssignment, GenerationSettings, NameFormatKind } from '../engine/types';

export type FictionCastSoundComponentKind = 'given' | 'family' | 'place';
export type MaterializedComponentFormat = Exclude<NameFormatKind, 'mixed'>;

export interface FictionCastComponentGenerationPolicy {
  readonly kind: FictionCastSoundComponentKind;
  readonly settings: GenerationSettings;
}

export function supportingComponentKindForFormat(format: MaterializedComponentFormat): FictionCastSoundComponentKind | undefined {
  if (format === 'given-family' || format === 'initials-family') return 'family';
  if (format === 'epithet-place') return 'place';
  return undefined;
}

export function resolveFictionCastComponentGenerationPolicy(
  settings: GenerationSettings,
  role: CastRoleAssignment | undefined,
  kind: FictionCastSoundComponentKind,
): FictionCastComponentGenerationPolicy {
  return {
    kind,
    settings: roleInfluencedSettings(settings, role),
  };
}
