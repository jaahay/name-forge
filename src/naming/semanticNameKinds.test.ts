import { describe, expect, it } from 'vitest';
import { createSeededRandom } from '../engine/random';
import { createDefaultRegistry } from '../engine/registry';
import type { GenerationSettings } from '../engine/types';
import { generateFamilyName } from './familyName';
import { generateName } from './generator';
import { generatePlaceName } from './placeName';
import { toNameGenerationSettings } from './settings';

const registry = createDefaultRegistry();
const settings: GenerationSettings = {
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'semantic-name-kinds-test',
};

function directName(planningSeed: string, generationSeed: string, resultIndex: number) {
  return generateName({
    settings: toNameGenerationSettings(settings),
    pack: registry.getStylePack(settings.stylePackId),
    planningRandom: createSeededRandom(planningSeed),
    generationRandom: createSeededRandom(generationSeed),
    index: resultIndex,
  });
}

describe('semantic name kinds', () => {
  it('keeps family-name generation deterministic-equivalent to the generic primitive', () => {
    const planningSeed = 'family-name:plan';
    const generationSeed = 'family-name:sound';
    const resultIndex = 3;

    const semantic = generateFamilyName({
      settings,
      registry,
      determinism: { planningSeed, generationSeed, resultIndex },
    });

    expect(semantic).toEqual(directName(planningSeed, generationSeed, resultIndex));
  });

  it('keeps place-name generation deterministic-equivalent to the generic primitive', () => {
    const planningSeed = 'place-name:plan';
    const generationSeed = 'place-name:sound';
    const resultIndex = 4;

    const semantic = generatePlaceName({
      settings,
      registry,
      determinism: { planningSeed, generationSeed, resultIndex },
    });

    expect(semantic).toEqual(directName(planningSeed, generationSeed, resultIndex));
  });

  it('keeps semantic novelty offsets equivalent to the prior planning-settings override', () => {
    const planningSeed = 'family-name:novelty-plan';
    const generationSeed = 'family-name:novelty-sound';
    const resultIndex = 5;
    const baseSettings = toNameGenerationSettings(settings);
    const direct = generateName({
      settings: baseSettings,
      planningSettings: { ...baseSettings, novelty: 0.62 },
      pack: registry.getStylePack(settings.stylePackId),
      planningRandom: createSeededRandom(planningSeed),
      generationRandom: createSeededRandom(generationSeed),
      index: resultIndex,
    });
    const semantic = generateFamilyName({
      settings,
      registry,
      determinism: { planningSeed, generationSeed, resultIndex },
      preferences: { noveltyOffset: 0.12 },
    });

    expect(semantic).toEqual(direct);
  });
});
