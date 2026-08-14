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
    expect('rarityBand' in first).toBe(false);
  });

  it('keeps generic planning preferences limited to causal name-shape pressure', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const preferred = createNameGenerationPlan(
      settings,
      pack,
      createSeededRandom('preferred-syllable-count'),
      0,
      {
        strength: 1,
        syllableCounts: [
          { value: 2, weight: 100 },
          { value: 3, weight: 0 },
          { value: 4, weight: 0 },
        ],
      },
    );

    expect(preferred.syllableCount).toBe(2);
    expect('rarityBand' in preferred).toBe(false);
  });
});
