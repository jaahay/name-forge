import { describe, expect, it } from 'vitest';
import { generateName } from '../naming/generator';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { generateSpellingCandidatePool } from './spellingGenerator';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = {
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'exhaustive-same-sound-spellings',
};

describe('same-sound spelling retention', () => {
  it('retains every spelling generated for the exact sound sequence', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);

    expect(pack).toBeDefined();
    if (!pack) throw new Error('Expected fixture style pack.');

    const name = generateName({
      settings,
      pack,
      planningRandom: createSeededRandom('same-sound:silhouette'),
      generationRandom: createSeededRandom('same-sound:sound'),
      index: 0,
    });
    const exhaustivePool = generateSpellingCandidatePool(name.sound);

    expect(name.spellingCandidates).toHaveLength(exhaustivePool.candidates.length);
    expect(new Set(name.spellingCandidates.map((spelling) => spelling.text))).toEqual(
      new Set(exhaustivePool.candidates.map((spelling) => spelling.text)),
    );
    expect(name.spellingCandidates.every((spelling) => spelling.mappings.every(
      (mapping) => name.sound.sequence.segments[mapping.segmentIndex] === mapping.segmentId,
    ))).toBe(true);
  });
});
