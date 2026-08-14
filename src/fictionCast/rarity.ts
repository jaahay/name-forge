import { createSeededRandom, lerp } from '../engine/random';
import type { WeightedValue } from '../engine/types';

export type FictionCastRarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type FictionCastRarityDistributionPresetKind = 'style-pack' | 'grounded' | 'balanced' | 'rare-forward' | 'mythic-arc';

export interface FictionCastRaritySettings {
  readonly novelty: number;
  readonly rarityDistribution?: FictionCastRarityDistributionPresetKind;
  readonly seed: string;
  readonly stylePackId: string;
}

export const fictionCastRarityBands: readonly FictionCastRarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function isFictionCastRarityBand(value: unknown): value is FictionCastRarityBand {
  return typeof value === 'string' && fictionCastRarityBands.includes(value as FictionCastRarityBand);
}

export const rarityDistributionOptions: Array<{ value: FictionCastRarityDistributionPresetKind; label: string }> = [
  { value: 'style-pack', label: 'Style-pack weighted' },
  { value: 'grounded', label: 'Grounded cast' },
  { value: 'balanced', label: 'Balanced spread' },
  { value: 'rare-forward', label: 'Rare-forward cast' },
  { value: 'mythic-arc', label: 'Mythic arc' },
];

const presetBands: Record<Exclude<FictionCastRarityDistributionPresetKind, 'style-pack'>, readonly FictionCastRarityBand[]> = {
  grounded: ['common', 'common', 'uncommon', 'common', 'uncommon', 'rare', 'common', 'uncommon'],
  balanced: ['common', 'uncommon', 'rare', 'uncommon', 'epic', 'common', 'rare', 'legendary'],
  'rare-forward': ['rare', 'uncommon', 'epic', 'rare', 'common', 'legendary', 'rare', 'epic'],
  'mythic-arc': ['common', 'uncommon', 'rare', 'epic', 'legendary', 'rare', 'epic', 'legendary'],
};

const defaultStylePackRarityWeights: ReadonlyArray<WeightedValue<FictionCastRarityBand>> = [
  { value: 'common', weight: 7 },
  { value: 'uncommon', weight: 6 },
  { value: 'rare', weight: 3 },
  { value: 'epic', weight: 1 },
  { value: 'legendary', weight: 0.35 },
];

const stylePackRarityWeights: Readonly<Record<string, ReadonlyArray<WeightedValue<FictionCastRarityBand>>>> = {
  'british-literary-fantasy': defaultStylePackRarityWeights,
};

function weightedStylePackBands(settings: FictionCastRaritySettings): Array<WeightedValue<FictionCastRarityBand>> {
  const baseline = stylePackRarityWeights[settings.stylePackId] ?? defaultStylePackRarityWeights;
  const noveltyShift = Math.round(lerp(-1, 2, settings.novelty));

  return baseline.map((entry) => {
    const sourceIndex = fictionCastRarityBands.indexOf(entry.value);
    const shiftedIndex = Math.max(0, Math.min(fictionCastRarityBands.length - 1, sourceIndex + noveltyShift));
    return { value: fictionCastRarityBands[shiftedIndex], weight: entry.weight };
  });
}

export function resolveFictionCastRarityBand(settings: FictionCastRaritySettings, index: number): FictionCastRarityBand {
  const preset = settings.rarityDistribution ?? 'style-pack';
  if (preset !== 'style-pack') {
    const bands = presetBands[preset];
    return bands[index % bands.length];
  }

  const random = createSeededRandom(`${settings.seed}:fiction-cast:rarity:${index}`);
  return random.pickWeighted(weightedStylePackBands(settings));
}
