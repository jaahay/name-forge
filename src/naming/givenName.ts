import type { SeededRandom } from '../engine/random';
import type {
  GeneratedName,
  NameGenerationPlanPreferences,
  NameGenerationSettings,
  NameTexture,
  RarityBand,
  StylePack,
  WeightedValue,
} from '../engine/types';
import { generateName } from './generator';

export interface GivenNamePreferences {
  readonly preferenceStrength?: number;
  readonly syllableCounts?: ReadonlyArray<WeightedValue<number>>;
  readonly textures?: ReadonlyArray<WeightedValue<NameTexture>>;
  readonly rarityBand?: RarityBand;
}

export interface GenerateGivenNameOptions {
  readonly settings: NameGenerationSettings;
  readonly pack: StylePack;
  readonly planningRandom: SeededRandom;
  readonly generationRandom: SeededRandom;
  readonly index: number;
  readonly planningSettings?: NameGenerationSettings;
  readonly preferences?: GivenNamePreferences;
}

function toPlanningPreferences(preferences: GivenNamePreferences | undefined): NameGenerationPlanPreferences | undefined {
  if (!preferences) return undefined;
  return {
    strength: preferences.preferenceStrength ?? 0,
    ...(preferences.syllableCounts === undefined ? {} : { syllableCounts: [...preferences.syllableCounts] }),
    ...(preferences.textures === undefined ? {} : { textures: [...preferences.textures] }),
    ...(preferences.rarityBand === undefined ? {} : { rarityBand: preferences.rarityBand }),
  };
}

/**
 * Generates one given name through the shared singular name-generation primitive.
 *
 * The semantic callback owns the given-name contract and translates its preferences
 * into generic planning pressure without exposing the internal planning shape.
 */
export function generateGivenName(options: GenerateGivenNameOptions): GeneratedName {
  return generateName({
    settings: options.settings,
    pack: options.pack,
    planningRandom: options.planningRandom,
    generationRandom: options.generationRandom,
    index: options.index,
    ...(options.planningSettings === undefined ? {} : { planningSettings: options.planningSettings }),
    ...(options.preferences === undefined ? {} : { planningPreferences: toPlanningPreferences(options.preferences) }),
  });
}
