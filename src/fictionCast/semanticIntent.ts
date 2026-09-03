import { clamp } from '../engine/random';
import type { GenerationSettings } from '../engine/types';
import type { SemanticNamePreferences } from '../naming/semanticName';
import { getRolePreferenceProfile, roleInfluencedGenerationSettings, resolveRoleInfluence } from './roles';
import type {
  CastRoleAssignment,
  FictionCastSemanticBaseline,
  FictionCastSettings,
} from './types';
import { resolveFictionCastVariationDelta } from './variation';

export type FictionCastSemanticControlKey = keyof FictionCastSemanticBaseline;
export type FictionCastSemanticControlValue<K extends FictionCastSemanticControlKey = FictionCastSemanticControlKey> = FictionCastSemanticBaseline[K];

export interface FictionCastSemanticIntentContext {
  readonly role?: CastRoleAssignment;
  readonly slotIndex: number;
}

export interface ResolvedFictionCastSemanticIntent {
  readonly baseline: FictionCastSemanticBaseline;
  readonly variationDelta: number;
  readonly generationSettings: GenerationSettings;
  readonly planningPreferences: SemanticNamePreferences;
}

const familiarityNovelty = {
  unusual: 0.75,
  balanced: 0.48,
  familiar: 0.25,
} as const;

const readabilityPronounceability = {
  tricky: 0.35,
  balanced: 0.55,
  clear: 0.72,
} as const;

const compactnessMemorability = {
  extended: 0.35,
  balanced: 0.5,
  compact: 0.65,
} as const;

const styleAnchoringCulturalAnchoring = {
  loose: 0.35,
  balanced: 0.62,
  faithful: 0.82,
} as const;

const spellingDistinctivenessWeirdness = {
  conventional: 0.28,
  balanced: 0.5,
  distinctive: 0.72,
} as const;

/**
 * Compatibility translation for the currently shipped semantic choices.
 * These numbers remain engine mechanics; the Fiction Cast product state stores
 * only the discrete surface selections above this boundary.
 */
export function fictionCastBaselineGenerationSettings(settings: FictionCastSettings): GenerationSettings {
  const baseline = settings.semanticBaseline;
  return {
    novelty: familiarityNovelty[baseline.familiarity],
    pronounceability: readabilityPronounceability[baseline.readability],
    memorability: compactnessMemorability[baseline.compactness],
    culturalAnchoring: styleAnchoringCulturalAnchoring[baseline.styleAnchoring],
    orthographicWeirdness: spellingDistinctivenessWeirdness[baseline.spellingDistinctiveness],
    stylePackId: settings.stylePackId,
    seed: settings.seed,
  };
}

export function fictionCastSemanticBaselineFromSettings(settings: FictionCastSettings): FictionCastSemanticBaseline {
  return settings.semanticBaseline;
}

export function withFictionCastSemanticControl<
  T extends FictionCastSettings,
  K extends FictionCastSemanticControlKey,
>(
  settings: T,
  key: K,
  value: FictionCastSemanticBaseline[NoInfer<K>],
): T {
  return {
    ...settings,
    semanticBaseline: {
      ...settings.semanticBaseline,
      [key]: value,
    } as FictionCastSemanticBaseline,
  };
}

function rolePlanningPreferences(
  settings: FictionCastSettings,
  role: CastRoleAssignment | undefined,
): SemanticNamePreferences {
  const influence = resolveRoleInfluence(settings, role);
  if (!influence) return {};

  const profile = getRolePreferenceProfile(influence.role);
  return {
    preferenceStrength: influence.strength,
    syllableCounts: profile.syllableCounts,
    textures: profile.textures,
  };
}

export function resolveFictionCastSemanticIntent(
  settings: FictionCastSettings,
  context: FictionCastSemanticIntentContext,
): ResolvedFictionCastSemanticIntent {
  const baselineSettings = fictionCastBaselineGenerationSettings(settings);
  const variationDelta = resolveFictionCastVariationDelta(settings, context.slotIndex);
  const variedSettings: GenerationSettings = {
    ...baselineSettings,
    novelty: clamp(baselineSettings.novelty + variationDelta),
  };
  const roleInfluence = resolveRoleInfluence(settings, context.role);

  return {
    baseline: settings.semanticBaseline,
    variationDelta,
    generationSettings: roleInfluencedGenerationSettings(variedSettings, roleInfluence),
    planningPreferences: rolePlanningPreferences(settings, context.role),
  };
}
