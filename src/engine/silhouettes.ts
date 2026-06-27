import type { CastRoleAssignment, GenerationSettings, NameSilhouette, NameTexture, StylePack, WeightedValue } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';
import { selectRarityBand } from './rarity';
import { getRolePreferenceProfile, resolveRoleInfluence } from './roles';

function blendWeightedValues<T>(baseValues: Array<WeightedValue<T>>, preferredValues: Array<WeightedValue<T>>, strength: number): Array<WeightedValue<T>> {
  return baseValues.map(({ value, weight }) => {
    const preferredWeight = preferredValues.find((preferred) => preferred.value === value)?.weight ?? 1;
    return { value, weight: weight * lerp(1, preferredWeight, strength) };
  });
}

function selectSyllableCount(settings: GenerationSettings, pack: StylePack, random: SeededRandom, role?: CastRoleAssignment): number {
  const memorability = clamp(settings.memorability);
  const roleInfluence = resolveRoleInfluence(settings, role);
  const roleProfile = roleInfluence ? getRolePreferenceProfile(roleInfluence.role) : undefined;
  const baseCounts = roleProfile
    ? blendWeightedValues(pack.silhouetteBias.syllableCounts, roleProfile.syllableCounts, roleInfluence?.strength ?? 0)
    : pack.silhouetteBias.syllableCounts;
  const weightedCounts: Array<WeightedValue<number>> = baseCounts.map(({ value, weight }) => {
    const compactBoost = value <= 2 ? lerp(0.72, 1.72, memorability) : value === 3 ? lerp(1.1, 0.92, memorability) : lerp(1.28, 0.5, memorability);
    return { value, weight: weight * compactBoost };
  });
  return random.pickWeighted(weightedCounts);
}

function stressPatternFor(syllables: number, settings: GenerationSettings, random: SeededRandom): string {
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

function selectTexture(settings: GenerationSettings, pack: StylePack, random: SeededRandom, role?: CastRoleAssignment): NameTexture {
  const roleInfluence = resolveRoleInfluence(settings, role);
  if (!roleInfluence) return random.pickWeighted(pack.silhouetteBias.textures);
  const profile = getRolePreferenceProfile(roleInfluence.role);
  return random.pickWeighted(blendWeightedValues(pack.silhouetteBias.textures, profile.textures, roleInfluence.strength));
}

export function createNameSilhouette(settings: GenerationSettings, pack: StylePack, random: SeededRandom, index: number, role?: CastRoleAssignment): NameSilhouette {
  const roleInfluence = resolveRoleInfluence(settings, role);
  const syllableCount = selectSyllableCount(settings, pack, random, role);
  const stressPattern = stressPatternFor(syllableCount, settings, random);
  const rarityBand = selectRarityBand(settings, pack, random, index);
  const texture = selectTexture(settings, pack, random, role);
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
    id: `silhouette-${index + 1}`,
    syllableCount,
    stressPattern,
    rhythm: rhythmFor(stressPattern),
    shape,
    rarityBand,
    texture,
    targetNovelty: clamp(settings.novelty + random.next() * 0.18 - 0.09),
    targetLength,
    roleInfluence,
  };
}
