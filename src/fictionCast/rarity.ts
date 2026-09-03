import { clamp } from '../engine/random';

export type FictionCastRarityBand = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const fictionCastRarityBands: readonly FictionCastRarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function isFictionCastRarityBand(value: unknown): value is FictionCastRarityBand {
  return typeof value === 'string' && fictionCastRarityBands.includes(value as FictionCastRarityBand);
}

/**
 * Rarity is derived evidence about the effective novelty intent for a generated
 * Fiction Cast slot. It does not drive generation independently.
 */
export function rarityBandForNovelty(novelty: number): FictionCastRarityBand {
  const resolvedNovelty = clamp(novelty);
  if (resolvedNovelty < 0.3) return 'common';
  if (resolvedNovelty < 0.42) return 'uncommon';
  if (resolvedNovelty < 0.58) return 'rare';
  if (resolvedNovelty < 0.82) return 'epic';
  return 'legendary';
}
