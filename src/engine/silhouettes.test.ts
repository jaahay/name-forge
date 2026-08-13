import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { createNameGenerationPlan } from './silhouettes';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'silhouette-test-seed' };

describe('createNameGenerationPlan', () => {
  it('materializes deterministic planning evidence before exact name letters exist', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const first = createNameGenerationPlan(settings, pack, createSeededRandom(settings.seed), 0);
    const second = createNameGenerationPlan(settings, pack, createSeededRandom(settings.seed), 0);

    expect(second).toEqual(first);
    expect(first.id).toBe('silhouette-1');
    expect(first.shape).toHaveLength(first.syllableCount);
    expect(first.stressPattern.length).toBeGreaterThan(0);
    expect(first.rhythm.length).toBeGreaterThan(0);
    expect(first.targetLength).toMatch(/^(short|medium|long)$/);
    expect(first.targetNovelty).toBeGreaterThanOrEqual(0);
    expect(first.targetNovelty).toBeLessThanOrEqual(1);
  });

  it('uses an explicit rarity preference independently from novelty', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const grounded = createNameGenerationPlan(
      { ...settings, novelty: 1 },
      pack,
      createSeededRandom(settings.seed),
      0,
      { strength: 0, rarityBand: 'common' },
    );
    const mythic = createNameGenerationPlan(
      { ...settings, novelty: 0 },
      pack,
      createSeededRandom(settings.seed),
      4,
      { strength: 0, rarityBand: 'legendary' },
    );

    expect(grounded.rarityBand).toBe('common');
    expect(mythic.rarityBand).toBe('legendary');
  });
});
