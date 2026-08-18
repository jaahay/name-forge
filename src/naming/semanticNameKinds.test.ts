import { describe, expect, it } from 'vitest';
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

function directName(seed: string, resultIndex: number) {
  return generateName({
    settings: toNameGenerationSettings(settings),
    pack: registry.getStylePack(settings.stylePackId),
    seed,
    index: resultIndex,
  });
}

describe('semantic name kinds', () => {
  it('keeps family-name generation deterministic-equivalent to the generic primitive', () => {
    const seed = 'family-name';
    const resultIndex = 3;

    const semantic = generateFamilyName({
      settings,
      registry,
      determinism: { seed, resultIndex },
    });

    expect(semantic).toEqual(directName(seed, resultIndex));
  });

  it('keeps place-name generation deterministic-equivalent to the generic primitive', () => {
    const seed = 'place-name';
    const resultIndex = 4;

    const semantic = generatePlaceName({
      settings,
      registry,
      determinism: { seed, resultIndex },
    });

    expect(semantic).toEqual(directName(seed, resultIndex));
  });

  it('keeps semantic novelty offsets equivalent to a direct planning-settings override', () => {
    const seed = 'family-name:novelty';
    const resultIndex = 5;
    const baseSettings = toNameGenerationSettings(settings);
    const direct = generateName({
      settings: baseSettings,
      planningSettings: { ...baseSettings, novelty: 0.62 },
      pack: registry.getStylePack(settings.stylePackId),
      seed,
      index: resultIndex,
    });
    const semantic = generateFamilyName({
      settings,
      registry,
      determinism: { seed, resultIndex },
      preferences: { noveltyOffset: 0.12 },
    });

    expect(semantic).toEqual(direct);
  });
});
