import type { GenerationSettings, NameSilhouette, NameTexture, RarityBand, StylePack, WeightedValue } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';

const rarityOrder: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function selectRarity(settings: GenerationSettings, pack: StylePack, random: SeededRandom): RarityBand {
  const baseline = random.pickWeighted(pack.silhouetteBias.rarityBands);
  const baselineIndex = rarityOrder.indexOf(baseline);
  const noveltyShift = Math.round(lerp(-1, 2, settings.novelty));
  return rarityOrder[Math.round(clamp(baselineIndex + noveltyShift, 0, rarityOrder.length - 1))];
}

function selectSyllableCount(settings: GenerationSettings, pack: StylePack, random: SeededRandom): number {
  const memorability = clamp(settings.memorability);
  const weightedCounts: Array<WeightedValue<number>> = pack.silhouetteBias.syllableCounts.map(({ value, weight }) => {
    const memorabilityFit = value <= 2 ? lerp(0.72, 1.85, memorability) : value === 3 ? lerp(1.12, 0.92, memorability) : lerp(1.32, 0.46, memorability);
    return { value, weight: weight * memorabilityFit };
  });
  return random.pickWeighted(weightedCounts);
}

function selectTexture(settings: GenerationSettings, pack: StylePack, random: SeededRandom): NameTexture {
  const memorability = clamp(settings.memorability);
  const weightedTextures: Array<WeightedValue<NameTexture>> = pack.silhouetteBias.textures.map(({ value, weight }) => {
    const distinctivenessFit = value === 'hard' || value === 'liquid' ? lerp(0.88, 1.42, memorability) : value === 'balanced' ? lerp(1.1, 0.94, memorability) : lerp(1.04, 1.08, memorability);
    return { value, weight: weight * distinctivenessFit };
  });
  return random.pickWeighted(weightedTextures);
}

function stressPatternFor(syllables: number, random: SeededRandom): string {
  if (syllables <= 1) return 'S';
  if (syllables === 2) return random.chance(0.58) ? 'S-w' : 'w-S';
  if (syllables === 3) return random.chance(0.62) ? 'S-w-w' : 'w-S-w';
  return random.chance(0.5) ? 'S-w-w-s' : 'w-S-w-s';
}

function rhythmFor(stressPattern: string): string {
  if (stressPattern.startsWith('S-w-w')) return 'falling';
  if (stressPattern.startsWith('w-S')) return 'rising';
  if (stressPattern.includes('-s')) return 'braided';
  return 'balanced';
}

export function createNameSilhouette(settings: GenerationSettings, pack: StylePack, random: SeededRandom, index: number): NameSilhouette {
  const syllableCount = selectSyllableCount(settings, pack, random);
  const stressPattern = stressPatternFor(syllableCount, random);
  const rarityBand = selectRarity(settings, pack, random);
  const texture = selectTexture(settings, pack, random);
  const targetLength = syllableCount <= 2 ? 'short' : syllableCount === 3 ? 'medium' : 'long';
  const openSyllableBias = lerp(0.26, 0.78, settings.pronounceability);
  const hardClosedBias = lerp(0.56, 0.24, settings.pronounceability);
  const liquidSyllableBias = lerp(0.34, 0.58, settings.pronounceability);
  const shape = Array.from({ length: syllableCount }, (_, syllableIndex) => {
    if (syllableIndex === syllableCount - 1 && random.chance(openSyllableBias)) return 'CV';
    if (texture === 'hard' && random.chance(hardClosedBias)) return 'CVC';
    if (texture === 'liquid' && random.chance(liquidSyllableBias)) return 'LCV';
    return random.chance(openSyllableBias) ? 'CV' : 'CVC';
  });
  return { id: `silhouette-${index + 1}`, syllableCount, stressPattern, rhythm: rhythmFor(stressPattern), shape, rarityBand, texture, targetNovelty: clamp(settings.novelty + random.next() * 0.18 - 0.09), targetLength, provenance: [pack.provenance, { sourceId: 'name-forge:silhouette-engine@0.1.0', sourceKind: 'algorithm', label: 'Name silhouette', detail: 'Generated before exact letters using syllable count, rhythm, rarity, texture, and target novelty.' }] };
}
