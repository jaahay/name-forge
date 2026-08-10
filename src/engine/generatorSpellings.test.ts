import { describe, expect, it } from 'vitest';
import { generateNameCandidateFromSilhouette } from '../naming/generator';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import { createNameSilhouette } from './silhouettes';
import { generateSpellingCandidatePool } from './spellingGenerator';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = {
  castSize: 1,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'exhaustive-same-sound-spellings',
  nameFormat: 'given-only',
};

describe('same-sound spelling retention', () => {
  it('retains every spelling generated for the exact sound sequence', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);

    expect(pack).toBeDefined();
    if (!pack) throw new Error('Expected fixture style pack.');

    const silhouette = createNameSilhouette(settings, pack, createSeededRandom('same-sound:silhouette'), 0);
    const candidate = generateNameCandidateFromSilhouette(silhouette, settings, createSeededRandom('same-sound:sound'));
    const exhaustivePool = generateSpellingCandidatePool(candidate.sound);

    expect(candidate.rankedSpellings.candidates).toHaveLength(exhaustivePool.candidates.length);
    expect(new Set(candidate.rankedSpellings.candidates.map((spelling) => spelling.text))).toEqual(
      new Set(exhaustivePool.candidates.map((spelling) => spelling.text)),
    );
    expect(candidate.rankedSpellings.candidates.every((spelling) => spelling.soundCandidateId === candidate.sound.id)).toBe(true);
  });
});
