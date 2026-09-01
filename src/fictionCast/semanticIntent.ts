import type { NameGenerationSettings } from '../engine/types';
import { roleInfluencedSettings } from './roles';
import type { CastRoleAssignment, FictionCastSettings } from './types';

export type FictionCastSemanticControlKey =
  | 'familiarity'
  | 'readability'
  | 'compactness'
  | 'styleAnchoring'
  | 'spellingDistinctiveness';

type FictionCastCompatibilitySettingKey = keyof Pick<
  NameGenerationSettings,
  'novelty' | 'pronounceability' | 'memorability' | 'culturalAnchoring' | 'orthographicWeirdness'
>;

export interface FictionCastSemanticBaseline {
  readonly familiarity: number;
  readonly readability: number;
  readonly compactness: number;
  readonly styleAnchoring: number;
  readonly spellingDistinctiveness: number;
}

export interface FictionCastSemanticIntentContext {
  readonly role?: CastRoleAssignment;
}

export interface ResolvedFictionCastSemanticIntent {
  readonly baseline: FictionCastSemanticBaseline;
  readonly generationSettings: FictionCastSettings;
}

const compatibilitySettingBySemanticControl: Record<FictionCastSemanticControlKey, FictionCastCompatibilitySettingKey> = {
  familiarity: 'novelty',
  readability: 'pronounceability',
  compactness: 'memorability',
  styleAnchoring: 'culturalAnchoring',
  spellingDistinctiveness: 'orthographicWeirdness',
};

/**
 * The numeric values remain the current deterministic control tokens in this
 * compatibility slice. Their product meaning comes from the semantic field
 * name and discrete UI choice, not from a validated human-facing metric scale.
 */
export function fictionCastSemanticBaselineFromSettings(settings: FictionCastSettings): FictionCastSemanticBaseline {
  return {
    familiarity: settings.novelty,
    readability: settings.pronounceability,
    compactness: settings.memorability,
    styleAnchoring: settings.culturalAnchoring,
    spellingDistinctiveness: settings.orthographicWeirdness,
  };
}

export function fictionCastGenerationSettingUpdateForSemanticControl(
  key: FictionCastSemanticControlKey,
  value: number,
): { readonly key: FictionCastCompatibilitySettingKey; readonly value: number } {
  return {
    key: compatibilitySettingBySemanticControl[key],
    value,
  };
}

export function withFictionCastSemanticControl<T extends FictionCastSettings>(
  settings: T,
  key: FictionCastSemanticControlKey,
  value: number,
): T {
  const update = fictionCastGenerationSettingUpdateForSemanticControl(key, value);
  return {
    ...settings,
    [update.key]: update.value,
  } as T;
}

function fictionCastSettingsFromSemanticBaseline(
  settings: FictionCastSettings,
  baseline: FictionCastSemanticBaseline,
): FictionCastSettings {
  return {
    ...settings,
    novelty: baseline.familiarity,
    pronounceability: baseline.readability,
    memorability: baseline.compactness,
    culturalAnchoring: baseline.styleAnchoring,
    orthographicWeirdness: baseline.spellingDistinctiveness,
  };
}

export function resolveFictionCastSemanticIntent(
  settings: FictionCastSettings,
  context: FictionCastSemanticIntentContext = {},
): ResolvedFictionCastSemanticIntent {
  const baseline = fictionCastSemanticBaselineFromSettings(settings);
  const baselineSettings = fictionCastSettingsFromSemanticBaseline(settings, baseline);

  return {
    baseline,
    generationSettings: roleInfluencedSettings(baselineSettings, context.role),
  };
}
