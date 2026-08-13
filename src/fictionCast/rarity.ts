import type { GenerationSettings, RarityBand, RarityDistributionPresetKind } from '../engine/types';

export const rarityDistributionOptions: Array<{ value: RarityDistributionPresetKind; label: string }> = [
  { value: 'style-pack', label: 'Style-pack weighted' },
  { value: 'grounded', label: 'Grounded cast' },
  { value: 'balanced', label: 'Balanced spread' },
  { value: 'rare-forward', label: 'Rare-forward cast' },
  { value: 'mythic-arc', label: 'Mythic arc' },
];

const rarityDistributionSlots: Record<Exclude<RarityDistributionPresetKind, 'style-pack'>, RarityBand[]> = {
  grounded: ['common', 'common', 'uncommon', 'common', 'uncommon', 'rare', 'common', 'uncommon'],
  balanced: ['common', 'uncommon', 'rare', 'uncommon', 'epic', 'common', 'rare', 'legendary'],
  'rare-forward': ['rare', 'uncommon', 'epic', 'rare', 'common', 'legendary', 'rare', 'epic'],
  'mythic-arc': ['common', 'uncommon', 'rare', 'epic', 'legendary', 'rare', 'epic', 'legendary'],
};

export function resolveFictionCastRarityBand(settings: GenerationSettings, index: number): RarityBand | undefined {
  const distribution = settings.rarityDistribution ?? 'style-pack';
  if (distribution === 'style-pack') return undefined;
  const slots = rarityDistributionSlots[distribution];
  return slots[index % slots.length];
}
