import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { generateName } from './generator';
import { generateGivenName } from './givenName';
import { toNameGenerationSettings } from './settings';

const registry = createDefaultRegistry();
const settings: GenerationSettings = {
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'given-name-test',
};

describe('generateGivenName', () => {
  it('preserves the generic singular generation result when no semantic preferences are supplied', () => {
    const pack = registry.getStylePack(settings.stylePackId);
    const direct = generateName({
      settings: toNameGenerationSettings(settings),
      pack,
      seed: 'given-name',
      index: 2,
    });
    const semantic = generateGivenName({
      settings,
      registry,
      determinism: {
        seed: 'given-name',
        resultIndex: 2,
      },
    });

    expect(semantic).toEqual(direct);
  });

  it('translates given-name preferences into generic planning pressure internally', () => {
    const generated = generateGivenName({
      settings,
      registry,
      determinism: {
        seed: 'given-name:preferred',
        resultIndex: 0,
      },
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
