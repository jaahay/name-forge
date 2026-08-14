import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../engine/random';
import { createDefaultRegistry } from '../engine/registry';
import type { NameGenerationSettings } from '../engine/types';
import { generateName } from './generator';
import { generateGivenName } from './givenName';

const settings: NameGenerationSettings = {
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
};

describe('generateGivenName', () => {
  it('preserves the generic singular generation result when no semantic preferences are supplied', () => {
    const pack = createDefaultRegistry().getStylePack('british-literary-fantasy');
    const direct = generateName({
      settings,
      pack,
      planningRandom: createSeededRandom('given-name:plan'),
      generationRandom: createSeededRandom('given-name:sound'),
      index: 2,
    });
    const semantic = generateGivenName({
      settings,
      pack,
      planningRandom: createSeededRandom('given-name:plan'),
      generationRandom: createSeededRandom('given-name:sound'),
      index: 2,
    });

    expect(semantic).toEqual(direct);
  });

  it('translates given-name preferences into generic planning pressure internally', () => {
    const pack = createDefaultRegistry().getStylePack('british-literary-fantasy');
    const generated = generateGivenName({
      settings,
      pack,
      planningRandom: createSeededRandom('given-name:preferred-plan'),
      generationRandom: createSeededRandom('given-name:preferred-sound'),
      index: 0,
      preferences: {
        preferenceStrength: 1,
        syllableCounts: [
          { value: 2, weight: 100 },
          { value: 3, weight: 0 },
          { value: 4, weight: 0 },
        ],
      },
    });

    expect(generated.silhouette.syllableCount).toBe(2);
    expect('rarityBand' in generated.silhouette).toBe(false);
  });
});
