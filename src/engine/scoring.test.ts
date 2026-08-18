import { describe, expect, it } from 'vitest';
import { createNameGenerationPlan } from './nameGenerationPlan';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { scoreName } from './scoring';
import type { GenerationSettings, ScoreKey } from './types';

const settings: GenerationSettings = { novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'scoring-test-seed' };
const scoreKeys: ScoreKey[] = ['pronounceability', 'memorability', 'novelty', 'culturalAnchoring', 'orthographicNaturalness', 'styleFit'];

describe('scoreName', () => {
  it('returns bounded intrinsic score metadata and overall fit without surface-context placeholders', () => {
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
    expect('silhouetteFit' in scores).toBe(false);
    expect('formFit' in scores).toBe(false);
    expect('ensembleFit' in scores).toBe(false);
    expect('roleFit' in scores).toBe(false);
  });
});
