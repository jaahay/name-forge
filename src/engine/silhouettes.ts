import type { NameGenerationPlan, NameGenerationPlanPreferences, NameGenerationSettings, NameTexture, StylePack, WeightedValue } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';

function blendWeightedValues<T>(baseValues: Array<WeightedValue<T>>, preferredValues: Array<WeightedValue<T>>, strength: number): Array<WeightedValue<T>> {
  return baseValues.map(({ value, weight }) => {
    const preferredWeight = preferredValues.find((preferred) => preferred.value === value)?.weight ?? 1;
    return { value, weight: weight * lerp(1, preferredWeight, strength) };
  });
}

function selectSyllableCount(settings: NameGenerationSettings, pack: StylePack, random: SeededRandom, preferences?: NameGenerationPlanPreferences): number {
  const memorability = clamp(settings.memorability);
  const baseCounts = preferences?.syllableCounts
    ? blendWeightedValues(pack.silhouetteBias.syllableCounts, preferences.syllableCounts, preferences.strength)
    : pack.silhouetteBias.syllableCounts;
  const weightedCounts: Array<WeightedValue<number>> = baseCounts.map(({ value, weight }) => {
    const compactBoost = value <= 2 ? lerp(0.72, 1.72, memorability) : value === 3 ? lerp(1.1, 0.92, memorability) : lerp(1.28, 0.5, memorability);
    return { value, weight: weight * compactBoost };
  });
  return random.pickWeighted(weightedCounts);
}

function stressPatternFor(syllables: number, settings: NameGenerationSettings, random: SeededRandom): string {
  const memorableDownbeatBias = lerp(0.46, 0.74, settings.memorability);
  if (syllables <= 1) return 'S';
  if (syllables === 2) return random.chance(memorableDownbeatBias) ? 'S-w' : 'w-S';
  if (syllables === 3) return random.chance(lerp(0.52, 0.72, settings.memorability)) ? 'S-w-w' : 'w-S-w';
  return random.chance(lerp(0.44, 0.58, settings.memorability)) ? 'S-w-w-s' : 'w-S-w-s';
}

function rhythmFor(stressPattern: string): string {
  if (stressPattern.startsWith('S-w-w')) return 'falling';
  if (stressPattern.startsWith('w-S')) return 'rising';
  if (stressPattern.includes('-s')) return 'braided';
  return 'balanced';
}

function selectTexture(settings: NameGenerationSettings, pack: StylePack, random: SeededRandom, preferences?: NameGenerationPlanPreferences): NameTexture {
  if (settings.preferredTexture !== undefined) return settings.preferredTexture;
  if (!preferences?.textures) return random.pickWeighted(pack.silhouetteBias.textures);
  return random.pickWeighted(blendWeightedValues(pack.silhouetteBias.textures, preferences.textures, preferences.strength));
}

/** Materializes the generation plan used by `generateName(...)`. */
export function createNameGenerationPlan(settings: NameGenerationSettings, pack: StylePack, random: SeededRandom, index: number, preferences?: NameGenerationPlanPreferences): NameGenerationPlan {
  const syllableCount = selectSyllableCount(settings, pack, random, preferences);
  const stressPattern = stressPatternFor(syllableCount, settings, random);
  const texture = selectTexture(settings, pack, random, preferences);
  const targetLength = syllableCount <= 2 ? 'short' : syllableCount === 3 ? 'medium' : 'long';
  const openSyllableBias = lerp(0.24, 0.76, settings.pronounceability);
  const collisionBias = lerp(0.56, 0.24, settings.pronounceability);
  const liquidBias = lerp(0.38, 0.62, settings.pronounceability);
  const shape = Array.from({ length: syllableCount }, (_, syllableIndex) => {
    if (syllableIndex === syllableCount - 1 && random.chance(openSyllableBias)) return 'CV';
    if (texture === 'hard' && random.chance(collisionBias)) return 'CVC';
    if (texture === 'liquid' && random.chance(liquidBias)) return 'LCV';
    return random.chance(openSyllableBias) ? 'CV' : 'CVC';
  });
  return {
    id: `generation-plan-${index + 1}`,
    syllableCount,
    stressPattern,
    rhythm: rhythmFor(stressPattern),
    shape,
    texture,
    targetNovelty: clamp(settings.novelty + random.next() * 0.18 - 0.09),
    targetLength,
  };
}
