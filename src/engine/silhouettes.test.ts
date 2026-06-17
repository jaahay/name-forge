import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { createNameSilhouette } from './silhouettes';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'silhouette-test-seed' };

describe('createNameSilhouette', () => {
  it('materializes deterministic silhouette metadata before exact name letters exist', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const first = createNameSilhouette(settings, pack, createSeededRandom(settings.seed), 0);
    const second = createNameSilhouette(settings, pack, createSeededRandom(settings.seed), 0);

    expect(second).toEqual(first);
    expect(first.shape).toHaveLength(first.syllableCount);
    expect(first.stressPattern.length).toBeGreaterThan(0);
    expect(first.provenance.some((item) => item.label === 'Name silhouette')).toBe(true);
  });

  it('uses explicit rarity distribution independently from novelty', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const grounded = createNameSilhouette(
      { ...settings, novelty: 1, rarityDistribution: 'grounded' },
      pack,
      createSeededRandom(settings.seed),
      0,
    );
    const mythic = createNameSilhouette(
      { ...settings, novelty: 0, rarityDistribution: 'mythic-arc' },
      pack,
      createSeededRandom(settings.seed),
      4,
    );

    expect(grounded.rarityBand).toBe('common');
    expect(mythic.rarityBand).toBe('legendary');
  });
});
