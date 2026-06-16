import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createDefaultRegistry } from './registry';
import type { GenerationSettings, RarityBand } from './types';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'deterministic-test-seed' };
const mmoRarityBands: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

describe('generateEnsemble', () => {
  it('is deterministic for the same seed and settings', () => {
    const registry = createDefaultRegistry();
    const first = generateEnsemble(settings, registry);
    const second = generateEnsemble(settings, registry);
    expect(second.names.map((name) => name.name)).toEqual(first.names.map((name) => name.name));
  });

  it('returns provenance-bearing names and variants', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(name.provenance.length).toBeGreaterThan(0);
      expect(name.silhouette.provenance.length).toBeGreaterThan(0);
      expect(name.scores.plausibility).toBeGreaterThan(0);
    }
  });

  it('uses classic MMO rarity bands', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(mmoRarityBands).toContain(name.silhouette.rarityBand);
    }
  });
});
