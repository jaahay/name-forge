import { clamp, lerp } from './random';
import type { SeededRandom } from './random';
import type { NameGenerationSettings, RarityBand, StylePack } from './types';

const rarityOrder: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function selectRarityBand(settings: NameGenerationSettings, pack: StylePack, random: SeededRandom): RarityBand {
  const baseline = random.pickWeighted(pack.silhouetteBias.rarityBands);
  const baselineIndex = rarityOrder.indexOf(baseline);
  const noveltyShift = Math.round(lerp(-1, 2, settings.novelty));
  return rarityOrder[Math.round(clamp(baselineIndex + noveltyShift, 0, rarityOrder.length - 1))];
}
