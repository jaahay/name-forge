import type { GenerationSettings } from '../engine/types';
import { roleInfluencedGenerationSettings, resolveRoleInfluence } from './roles';
import type {
  CastRoleAssignment,
  FictionCastSemanticBaseline,
  FictionCastSettings,
} from './types';

export type FictionCastSemanticControlKey = keyof FictionCastSemanticBaseline;
export type FictionCastSemanticControlValue = FictionCastSemanticBaseline[FictionCastSemanticControlKey];

export interface FictionCastSemanticIntentContext {
  readonly role?: CastRoleAssignment;
}

export interface ResolvedFictionCastSemanticIntent {
  readonly baseline: FictionCastSemanticBaseline;
  readonly generationSettings: GenerationSettings;
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

export function withFictionCastSemanticControl<T extends FictionCastSettings>(
  settings: T,
  key: FictionCastSemanticControlKey,
  value: FictionCastSemanticControlValue,
): T {
  return {
    ...settings,
    semanticBaseline: {
      ...settings.semanticBaseline,
      [key]: value,
    } as FictionCastSemanticBaseline,
  };
}

export function resolveFictionCastSemanticIntent(
  settings: FictionCastSettings,
  context: FictionCastSemanticIntentContext = {},
): ResolvedFictionCastSemanticIntent {
  const baselineSettings = fictionCastBaselineGenerationSettings(settings);
  const roleInfluence = resolveRoleInfluence(settings, context.role);

  return {
    baseline: settings.semanticBaseline,
    generationSettings: roleInfluencedGenerationSettings(baselineSettings, roleInfluence),
  };
}
