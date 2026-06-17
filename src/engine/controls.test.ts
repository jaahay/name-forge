import { describe, expect, it } from 'vitest';
import { generateNameFromSilhouette } from './generator';
import { createDefaultRegistry } from './registry';
import type { SeededRandom } from './random';
import { scoreName } from './scoring';
import { createNameSilhouette } from './silhouettes';
import type { GenerationSettings, NameSilhouette } from './types';
import { generateVariants, variantLimitFor } from './variants';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'control-test-seed' };

type WeightedChoice = string | number;

function fixedWeightedRandom(weightedChoices: WeightedChoice[]): SeededRandom {
  let weightedIndex = 0;
  const random: SeededRandom = {
    next: () => 0.5,
    int: (minInclusive) => minInclusive,
    chance: (probability) => probability >= 0.5,
    pick: (items) => items[0],
    pickWeighted: (items) => {
      const choice = weightedChoices[weightedIndex];
      weightedIndex += 1;
      return (choice ?? items[0].value) as never;
    },
    fork: () => random,
  };
  return random;
}

function highestWeightRandom(): SeededRandom {
  const random: SeededRandom = {
    next: () => 0.5,
    int: (minInclusive) => minInclusive,
    chance: (probability) => probability >= 0.5,
    pick: (items) => items[0],
    pickWeighted: (items) => items.reduce((best, item) => item.weight > best.weight ? item : best, items[0]).value,
    fork: () => random,
  };
  return random;
}

function testSilhouette(overrides: Partial<NameSilhouette> = {}): NameSilhouette {
  return {
    id: 'silhouette-test',
    syllableCount: 1,
    stressPattern: 'S',
    rhythm: 'balanced',
    shape: ['CV'],
    rarityBand: 'uncommon',
    texture: 'balanced',
    targetNovelty: 0.5,
    targetLength: 'short',
    provenance: [],
    ...overrides,
  };
}

describe('generator control knobs', () => {
  it('uses memorability to prefer compact silhouettes', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const low = createNameSilhouette({ ...settings, memorability: 0 }, pack, highestWeightRandom(), 0);
    const high = createNameSilhouette({ ...settings, memorability: 1 }, pack, highestWeightRandom(), 0);

    expect(low.syllableCount).toBe(3);
    expect(high.syllableCount).toBe(2);
  });

  it('uses pronounceability as continuous open-syllable pressure', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const low = createNameSilhouette({ ...settings, pronounceability: 0 }, pack, fixedWeightedRandom([2, 'common', 'balanced']), 0);
    const high = createNameSilhouette({ ...settings, pronounceability: 1 }, pack, fixedWeightedRandom([2, 'common', 'balanced']), 0);

    expect(low.shape).toEqual(['CVC', 'CVC']);
    expect(high.shape).toEqual(['CV', 'CV']);
  });

  it('uses novelty to move rarity targets deterministically', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const low = createNameSilhouette({ ...settings, novelty: 0 }, pack, fixedWeightedRandom([2, 'common', 'balanced']), 0);
    const high = createNameSilhouette({ ...settings, novelty: 1 }, pack, fixedWeightedRandom([2, 'common', 'balanced']), 0);

    expect(low.rarityBand).toBe('common');
    expect(high.rarityBand).toBe('rare');
  });

  it('uses cultural anchoring as smooth curated-source pressure', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const silhouette = testSilhouette();
    const low = generateNameFromSilhouette(silhouette, pack, { ...settings, culturalAnchoring: 0, orthographicWeirdness: 0 }, fixedWeightedRandom([]), 0);
    const high = generateNameFromSilhouette(silhouette, pack, { ...settings, culturalAnchoring: 1, orthographicWeirdness: 0 }, fixedWeightedRandom([]), 0);

    expect(low.name).not.toBe('Aveline');
    expect(high.name).toBe('Aveline');
    expect(high.provenance.some((item) => item.label === 'Curated seed')).toBe(true);
  });

  it('uses orthographic weirdness to mutate generated spelling and expand variants', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const silhouette = testSilhouette();
    const low = generateNameFromSilhouette(silhouette, pack, { ...settings, culturalAnchoring: 0, orthographicWeirdness: 0 }, fixedWeightedRandom([]), 0);
    const high = generateNameFromSilhouette(silhouette, pack, { ...settings, culturalAnchoring: 0, orthographicWeirdness: 1 }, fixedWeightedRandom([]), 0);
    const restrainedVariants = generateVariants('Vivian', pack, { orthographicWeirdness: 0 });
    const aggressiveVariants = generateVariants('Vivian', pack, { orthographicWeirdness: 1 });

    expect(low.name).toBe('A');
    expect(high.name).toBe('Ae');
    expect(variantLimitFor({ orthographicWeirdness: 0 })).toBe(2);
    expect(variantLimitFor({ orthographicWeirdness: 1 })).toBe(4);
    expect(restrainedVariants).toHaveLength(2);
    expect(aggressiveVariants.length).toBeGreaterThan(restrainedVariants.length);
  });

  it('applies each slider to overall-fit pressure used by candidate ranking', () => {
    const pack = createDefaultRegistry().getStylePack(settings.stylePackId);
    const silhouette = testSilhouette({ syllableCount: 2, shape: ['CVC', 'CV'], targetLength: 'medium' });
    const knobs: Array<keyof Pick<GenerationSettings, 'novelty' | 'pronounceability' | 'memorability' | 'culturalAnchoring' | 'orthographicWeirdness'>> = ['novelty', 'pronounceability', 'memorability', 'culturalAnchoring', 'orthographicWeirdness'];

    for (const knob of knobs) {
      const low = scoreName('Aldren', silhouette, pack, { ...settings, [knob]: 0 });
      const high = scoreName('Aldren', silhouette, pack, { ...settings, [knob]: 1 });

      expect(high.overallFit).not.toBe(low.overallFit);
    }
  });
});
