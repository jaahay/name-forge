import { clamp, createSeededRandom } from '../engine/random';
import type { SourceRegistry } from '../engine/registry';
import type {
  GeneratedName,
  GenerationSettings,
  NameGenerationPlanPreferences,
  NameTexture,
  WeightedValue,
} from '../engine/types';
import { generateName } from './generator';
import { toNameGenerationSettings } from './settings';

export interface SemanticNameDeterminism {
  readonly planningSeed: string;
  readonly generationSeed: string;
  readonly resultIndex: number;
}

export interface SemanticNamePreferences {
  readonly noveltyOffset?: number;
  readonly preferenceStrength?: number;
  readonly syllableCounts?: ReadonlyArray<WeightedValue<number>>;
  readonly textures?: ReadonlyArray<WeightedValue<NameTexture>>;
}

export interface SemanticNameOptions<TPreferences extends SemanticNamePreferences = SemanticNamePreferences> {
  readonly settings: GenerationSettings;
  readonly registry: SourceRegistry;
  readonly determinism: SemanticNameDeterminism;
  readonly preferences?: TPreferences;
}

function toPlanningPreferences(preferences: SemanticNamePreferences | undefined): NameGenerationPlanPreferences | undefined {
  if (!preferences) return undefined;
  return {
    strength: preferences.preferenceStrength ?? 0,
    ...(preferences.syllableCounts === undefined ? {} : { syllableCounts: [...preferences.syllableCounts] }),
    ...(preferences.textures === undefined ? {} : { textures: [...preferences.textures] }),
  };
}

function planningSettingsFor(options: SemanticNameOptions): ReturnType<typeof toNameGenerationSettings> | undefined {
  const noveltyOffset = options.preferences?.noveltyOffset;
  if (noveltyOffset === undefined) return undefined;
  const settings = toNameGenerationSettings(options.settings);
  return {
    ...settings,
    novelty: clamp(settings.novelty + noveltyOffset),
  };
}

/**
 * Executes one sound-backed semantic name through the shared singular generator.
 *
 * Callers provide stable source/settings context and deterministic seed material;
 * naming-layer internals own source resolution, random-stream construction, and
 * translation from semantic preferences into generic planning inputs.
 */
export function generateSemanticName<TPreferences extends SemanticNamePreferences>(
  options: SemanticNameOptions<TPreferences>,
): GeneratedName {
  const settings = toNameGenerationSettings(options.settings);
  const pack = options.registry.getStylePack(options.settings.stylePackId);
  const planningSettings = planningSettingsFor(options);
  const planningPreferences = toPlanningPreferences(options.preferences);

  return generateName({
    settings,
    pack,
    planningRandom: createSeededRandom(options.determinism.planningSeed),
    generationRandom: createSeededRandom(options.determinism.generationSeed),
    index: options.determinism.resultIndex,
    ...(planningSettings === undefined ? {} : { planningSettings }),
    ...(planningPreferences === undefined ? {} : { planningPreferences }),
  });
}
