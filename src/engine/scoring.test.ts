import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { scoreName } from './scoring';
import { createNameGenerationPlan } from './silhouettes';
import type { GenerationSettings, ScoreKey } from './types';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'scoring-test-seed' };
const scoreKeys: ScoreKey[] = ['pronounceability', 'memorability', 'novelty', 'culturalAnchoring', 'orthographicNaturalness', 'styleFit', 'silhouetteFit'];

describe('scoreName', () => {
  it('returns bounded intrinsic score metadata and overall fit without cast context placeholders', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const plan = createNameGenerationPlan(settings, pack, createSeededRandom(settings.seed), 0);
    const scores = scoreName('Aldren', plan, pack, settings);

    for (const key of scoreKeys) {
      expect(scores[key]).toBeGreaterThanOrEqual(0);
      expect(scores[key]).toBeLessThanOrEqual(1);
    }
    expect(scores.overallFit).toBeGreaterThanOrEqual(0);
    expect(scores.overallFit).toBeLessThanOrEqual(1);
    expect(scores.styleFit).toBeGreaterThan(0);
    expect(scores.silhouetteFit).toBeGreaterThan(0);
    expect('ensembleFit' in scores).toBe(false);
    expect('roleFit' in scores).toBe(false);
  });
});
