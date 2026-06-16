import type { GenerationSettings, NameSilhouette, RarityBand, StylePack } from './types';
import type { SeededRandom } from './random';
import { clamp, lerp } from './random';

const rarityOrder: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function selectRarity(settings: GenerationSettings, pack: StylePack, random: SeededRandom): RarityBand {
  const baseline = random.pickWeighted(pack.silhouetteBias.rarityBands);
  const baselineIndex = rarityOrder.indexOf(baseline);
  const noveltyShift = Math.round(lerp(-1, 2, settings.novelty));
  return rarityOrder[Math.round(clamp(baselineIndex + noveltyShift, 0, rarityOrder.length - 1))];
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
  const syllableCount = random.pickWeighted(pack.silhouetteBias.syllableCounts);
  const stressPattern = stressPatternFor(syllableCount, random);
  const rarityBand = selectRarity(settings, pack, random);
  const texture = random.pickWeighted(pack.silhouetteBias.textures);
  const targetLength = syllableCount <= 2 ? 'short' : syllableCount === 3 ? 'medium' : 'long';
  const openSyllableBias = settings.pronounceability > 0.68 ? 0.62 : 0.38;
  const shape = Array.from({ length: syllableCount }, (_, syllableIndex) => {
    if (syllableIndex === syllableCount - 1 && random.chance(openSyllableBias)) return 'CV';
    if (texture === 'hard' && random.chance(0.46)) return 'CVC';
    if (texture === 'liquid' && random.chance(0.52)) return 'LCV';
    return random.chance(openSyllableBias) ? 'CV' : 'CVC';
  });
  return { id: `silhouette-${index + 1}`, syllableCount, stressPattern, rhythm: rhythmFor(stressPattern), shape, rarityBand, texture, targetNovelty: clamp(settings.novelty + random.next() * 0.18 - 0.09), targetLength, provenance: [pack.provenance, { sourceId: 'name-forge:silhouette-engine@0.1.0', sourceKind: 'algorithm', label: 'Name silhouette', detail: 'Generated before exact letters using syllable count, rhythm, rarity, texture, and target novelty.' }] };
}
