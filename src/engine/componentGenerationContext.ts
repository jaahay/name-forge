import { roleInfluencedSettings } from './roles';
import type { CastRoleAssignment, GenerationSettings, NameFormatKind } from './types';

export type NameComponentKind = 'given' | 'family' | 'place';
export type MaterializedComponentFormat = Exclude<NameFormatKind, 'mixed'>;

export interface NameComponentGenerationContext {
  readonly kind: NameComponentKind;
  readonly settings: GenerationSettings;
}

export function supportingComponentKindForFormat(format: MaterializedComponentFormat): NameComponentKind | undefined {
  if (format === 'given-family' || format === 'initials-family') return 'family';
  if (format === 'epithet-place') return 'place';
  return undefined;
}

export function resolveNameComponentGenerationContext(
  settings: GenerationSettings,
  role: CastRoleAssignment | undefined,
  kind: NameComponentKind,
): NameComponentGenerationContext {
  return {
    kind,
    settings: roleInfluencedSettings(settings, role),
  };
}
