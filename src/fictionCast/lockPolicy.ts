import { resolveCastRole } from './roles';
import type {
  FictionCastGeneratedEnsemble,
  FictionCastSemanticBaseline,
  FictionCastSettings,
} from './types';

const globalGenerationSettingKeys = {
  castSize: true,
  semanticBaseline: true,
  stylePackId: true,
  nameFormat: true,
  castVariation: true,
} satisfies Record<
  Exclude<keyof FictionCastSettings, 'seed' | 'rolePreset' | 'roleInfluence' | 'slotRoleOverrides'>,
  true
>;

void globalGenerationSettingKeys;

function sameSemanticBaseline(
  left: FictionCastSemanticBaseline,
  right: FictionCastSemanticBaseline,
): boolean {
  return left.familiarity === right.familiarity
    && left.readability === right.readability
    && left.compactness === right.compactness
    && left.styleAnchoring === right.styleAnchoring
    && left.spellingDistinctiveness === right.spellingDistinctiveness;
}

function normalizedNameFormat(settings: FictionCastSettings) {
  return settings.nameFormat ?? 'given-only';
}

function normalizedCastVariation(settings: FictionCastSettings) {
  return settings.castVariation ?? 'balanced';
}

function normalizedRoleInfluence(settings: FictionCastSettings, slotIndex: number) {
  return resolveCastRole(settings, slotIndex) ? settings.roleInfluence ?? 'off' : 'off';
}

export function fictionCastSettingsChangeAffectsSlot(
  previous: FictionCastSettings,
  next: FictionCastSettings,
  slotIndex: number,
): boolean {
  if (slotIndex < 0 || slotIndex >= next.castSize) return true;
  if (previous.castSize !== next.castSize) return true;
  if (!sameSemanticBaseline(previous.semanticBaseline, next.semanticBaseline)) return true;
  if (previous.stylePackId !== next.stylePackId) return true;
  if (normalizedNameFormat(previous) !== normalizedNameFormat(next)) return true;

  if (
    previous.castSize > 1
    && normalizedCastVariation(previous) !== normalizedCastVariation(next)
  ) return true;

  const previousRole = resolveCastRole(previous, slotIndex)?.role;
  const nextRole = resolveCastRole(next, slotIndex)?.role;
  if (previousRole !== nextRole) return true;

  return normalizedRoleInfluence(previous, slotIndex) !== normalizedRoleInfluence(next, slotIndex);
}

export function retainedLockedNameIdsAfterSettingsChange(
  ensemble: FictionCastGeneratedEnsemble | null,
  lockedNameIds: ReadonlySet<string>,
  previous: FictionCastSettings,
  next: FictionCastSettings,
): Set<string> {
  if (!ensemble || lockedNameIds.size === 0) return new Set();

  const retained = new Set<string>();
  ensemble.names.forEach((name, slotIndex) => {
    if (!lockedNameIds.has(name.id)) return;
    if (!fictionCastSettingsChangeAffectsSlot(previous, next, slotIndex)) retained.add(name.id);
  });
  return retained;
}
