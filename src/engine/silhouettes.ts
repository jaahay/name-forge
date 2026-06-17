import type { GenerationSettings, NameSilhouette, StylePack, WeightedValue } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';
import { selectRarityBand } from './rarity';

function selectSyllableCount(settings: GenerationSettings, pack: StylePack, random: SeededRandom): number {
  const memorability = clamp(settings.memorability);
  const weightedCounts: Array<WeightedValue<number>> = pack.silhouetteBias.syllableCounts.map(({ value, weight }) => {
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

export function createNameSilhouette(settings: GenerationSettings, pack: StylePack, random: SeededRandom, index: number): NameSilhouette {
  const syllableCount = selectSyllableCount(settings, pack, random);
  const stressPattern = stressPatternFor(syllableCount, settings, random);
  const rarityBand = selectRarityBand(settings, pack, random, index);
  const texture = random.pickWeighted(pack.silhouetteBias.textures);
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
  return { id: `silhouette-${index + 1}`, syllableCount, stressPattern, rhythm: rhythmFor(stressPattern), shape, rarityBand, texture, targetNovelty: clamp(settings.novelty + random.next() * 0.18 - 0.09), targetLength, provenance: [pack.provenance, { sourceId: 'name-forge:silhouette-engine@0.1.0', sourceKind: 'algorithm', label: 'Name silhouette', detail: 'Generated before exact letters using syllable count, rhythm, rarity, texture, target novelty, pronounceability, memorability pressure, and optional rarity distribution controls.' }] };
}
