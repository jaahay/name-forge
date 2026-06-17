import { clamp, lerp } from './random';
import type { SeededRandom } from './random';
import type { GenerationSettings, RarityBand, RarityDistributionPresetKind, StylePack } from './types';

export const rarityDistributionOptions: Array<{ value: RarityDistributionPresetKind; label: string }> = [
  { value: 'style-pack', label: 'Style-pack weighted' },
  { value: 'grounded', label: 'Grounded cast' },
  { value: 'balanced', label: 'Balanced spread' },
  { value: 'rare-forward', label: 'Rare-forward cast' },
  { value: 'mythic-arc', label: 'Mythic arc' },
];

const rarityOrder: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const rarityDistributionSlots: Record<Exclude<RarityDistributionPresetKind, 'style-pack'>, RarityBand[]> = {
  grounded: ['common', 'common', 'uncommon', 'common', 'uncommon', 'rare', 'common', 'uncommon'],
  balanced: ['common', 'uncommon', 'rare', 'uncommon', 'epic', 'common', 'rare', 'legendary'],
  'rare-forward': ['rare', 'uncommon', 'epic', 'rare', 'common', 'legendary', 'rare', 'epic'],
  'mythic-arc': ['common', 'uncommon', 'rare', 'epic', 'legendary', 'rare', 'epic', 'legendary'],
};

function selectStylePackRarity(settings: GenerationSettings, pack: StylePack, random: SeededRandom): RarityBand {
  const baseline = random.pickWeighted(pack.silhouetteBias.rarityBands);
  const baselineIndex = rarityOrder.indexOf(baseline);
  const noveltyShift = Math.round(lerp(-1, 2, settings.novelty));
  return rarityOrder[Math.round(clamp(baselineIndex + noveltyShift, 0, rarityOrder.length - 1))];
}

export function selectRarityBand(settings: GenerationSettings, pack: StylePack, random: SeededRandom, index: number): RarityBand {
  const distribution = settings.rarityDistribution ?? 'style-pack';
  if (distribution === 'style-pack') {
    return selectStylePackRarity(settings, pack, random);
  }

  const slots = rarityDistributionSlots[distribution];
  return slots[index % slots.length];
}
