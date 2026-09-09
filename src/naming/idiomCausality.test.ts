import { describe, expect, it } from 'vitest';
import { stylePacks } from '../data/stylePacks';
import type { SoundSegmentId } from '../engine/starterSoundInventory';
import type { NameGenerationSettings, StylePack } from '../engine/types';
import { generateName } from './generator';

const settings: NameGenerationSettings = {
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
};

const basePack = stylePacks[0];
if (!basePack) throw new Error('Expected built-in style pack fixture.');

function contrastivePack(
  id: string,
  onset: SoundSegmentId,
  nucleus: SoundSegmentId,
  coda: SoundSegmentId,
): StylePack {
  const multiplier = 1_000_000;

  return {
    ...basePack,
    id,
    label: id,
    source: {
      ...basePack.source,
      packId: id,
      sourcePath: `test:${id}`,
    },
    style: {
      ...basePack.style,
      label: id,
      summary: `Contrastive test idiom ${id}`,
    },
    soundBias: {
      segmentMultipliers: {
        onset: [{ segmentId: onset, multiplier }],
        nucleus: [{ segmentId: nucleus, multiplier }],
        coda: [{ segmentId: coda, multiplier }],
      },
    },
  };
}

describe('naming idiom causality', () => {
  it('holds explicit generation intent constant while explicit idiom sound multipliers change realization', () => {
    const liquidPack = contrastivePack('contrastive-liquid', 'l', 'a', 'r');
    const crispPack = contrastivePack('contrastive-crisp', 'k', 'i', 'l');

    const liquid = generateName({ settings, pack: liquidPack, seed: 'idiom-contrast', index: 0 });
    const crisp = generateName({ settings, pack: crispPack, seed: 'idiom-contrast', index: 0 });

    expect(liquid.generationPlan).toEqual(crisp.generationPlan);
    expect(liquid.soundProfile.targets).toEqual(crisp.soundProfile.targets);
    expect(liquid.soundProfile.phonotactics.segmentPreferences).toEqual({
      onset: [{ segmentId: 'l', weight: 1_000_000 }],
      nucleus: [{ segmentId: 'a', weight: 1_000_000 }],
      coda: [{ segmentId: 'r', weight: 1_000_000 }],
    });
    expect(crisp.soundProfile.phonotactics.segmentPreferences).toEqual({
      onset: [{ segmentId: 'k', weight: 1_000_000 }],
      nucleus: [{ segmentId: 'i', weight: 1_000_000 }],
      coda: [{ segmentId: 'l', weight: 1_000_000 }],
    });
    expect(liquid.sound.sequence.segments).not.toEqual(crisp.sound.sequence.segments);
  });

  it('compiles authored sound multipliers without inferring them from legacy phonotactic strings', () => {
    const generated = generateName({ settings, pack: basePack, seed: 'idiom-built-in', index: 0 });
    const preferences = generated.soundProfile.phonotactics.segmentPreferences;

    expect(preferences?.onset).toContainEqual({ segmentId: 'th', weight: 1.2 });
    expect(preferences?.nucleus).toContainEqual({ segmentId: 'ae', weight: 1.1 });
    expect(preferences?.coda).toContainEqual({ segmentId: 'n', weight: 1.2 });
    expect(preferences?.onset.some((preference) => preference.segmentId === ('br' as SoundSegmentId))).toBe(false);
  });

  it('does not treat legacy phonotactic weight magnitude as hidden idiom strength', () => {
    const scaledLegacyPack: StylePack = {
      ...basePack,
      phonotactics: {
        ...basePack.phonotactics,
        onsets: basePack.phonotactics.onsets.map((entry) => ({ ...entry, weight: entry.weight * 100 })),
        nuclei: basePack.phonotactics.nuclei.map((entry) => ({ ...entry, weight: entry.weight * 100 })),
        codas: basePack.phonotactics.codas.map((entry) => ({ ...entry, weight: entry.weight * 100 })),
      },
    };

    const baseline = generateName({ settings, pack: basePack, seed: 'idiom-legacy-weight-scale', index: 0 });
    const scaled = generateName({ settings, pack: scaledLegacyPack, seed: 'idiom-legacy-weight-scale', index: 0 });

    expect(scaled.soundProfile).toEqual(baseline.soundProfile);
    expect(scaled.sound).toEqual(baseline.sound);
    expect(scaled.spelling).toEqual(baseline.spelling);
    expect(scaled.name).toBe(baseline.name);
  });

  it('does not treat legacy cultural anchoring as hidden idiom strength', () => {
    const low = generateName({
      settings: { ...settings, culturalAnchoring: 0 },
      pack: basePack,
      seed: 'idiom-legacy-anchoring',
      index: 0,
    });
    const high = generateName({
      settings: { ...settings, culturalAnchoring: 1 },
      pack: basePack,
      seed: 'idiom-legacy-anchoring',
      index: 0,
    });

    expect(high.generationPlan).toEqual(low.generationPlan);
    expect(high.soundProfile).toEqual(low.soundProfile);
    expect(high.sound).toEqual(low.sound);
    expect(high.spelling).toEqual(low.spelling);
    expect(high.name).toBe(low.name);
    expect(high.variants).toEqual(low.variants);
  });
});
