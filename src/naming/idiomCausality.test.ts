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
  const weight = 1_000_000;

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
    phonotactics: {
      ...basePack.phonotactics,
      onsets: [{ value: onset, weight }],
      nuclei: [{ value: nucleus, weight }],
      codas: [{ value: coda, weight }],
    },
  };
}

describe('naming idiom causality', () => {
  it('holds explicit generation intent constant while selected pack phonotactics change sound realization', () => {
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

  it('compiles only pack entries that are valid sound segments for the declared syllable role', () => {
    const generated = generateName({ settings, pack: basePack, seed: 'idiom-built-in', index: 0 });
    const preferences = generated.soundProfile.phonotactics.segmentPreferences;

    expect(preferences?.onset).toContainEqual({ segmentId: 'th', weight: 4 });
    expect(preferences?.nucleus).toContainEqual({ segmentId: 'ae', weight: 6 });
    expect(preferences?.coda).toContainEqual({ segmentId: 'n', weight: 3 });
    expect(preferences?.onset.some((preference) => preference.segmentId === ('br' as SoundSegmentId))).toBe(false);
  });
});
