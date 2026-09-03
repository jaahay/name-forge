import { describe, expect, it } from 'vitest';
import {
  castVariationOptions,
  resolveFictionCastVariationDelta,
  resolveFictionCastVariationOffsets,
  type FictionCastVariation,
} from './variation';

const baseSettings = {
  castSize: 7,
  castVariation: 'balanced' as const,
  seed: 'cast-variation',
};

function spreadFor(castVariation: FictionCastVariation): number {
  const offsets = resolveFictionCastVariationOffsets({ ...baseSettings, castVariation });
  return Math.max(...offsets) - Math.min(...offsets);
}

describe('Fiction Cast variation', () => {
  it('offers only centered spread choices', () => {
    expect(castVariationOptions).toEqual([
      { value: 'tight', label: 'Tight' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'wide', label: 'Wide' },
    ]);
  });

  it('assigns the same deterministic offsets for the same seed and cast size', () => {
    expect(resolveFictionCastVariationOffsets(baseSettings)).toEqual(resolveFictionCastVariationOffsets(baseSettings));
    expect(resolveFictionCastVariationDelta(baseSettings, 3)).toBe(resolveFictionCastVariationDelta(baseSettings, 3));
  });

  it('keeps the generated spread centered on the Familiar baseline', () => {
    const offsets = resolveFictionCastVariationOffsets(baseSettings);
    const mean = offsets.reduce((sum, offset) => sum + offset, 0) / offsets.length;

    expect(mean).toBeCloseTo(0, 12);
  });

  it('resolves a one-name cast to zero variation', () => {
    expect(resolveFictionCastVariationOffsets({ ...baseSettings, castSize: 1 })).toEqual([0]);
    expect(resolveFictionCastVariationDelta({ ...baseSettings, castSize: 1 }, 0)).toBe(0);
  });

  it('widens spread without changing the centered policy', () => {
    const tightSpread = spreadFor('tight');
    const balancedSpread = spreadFor('balanced');
    const wideSpread = spreadFor('wide');

    expect(tightSpread).toBeLessThan(balancedSpread);
    expect(balancedSpread).toBeLessThan(wideSpread);
  });

  it('uses seed only to assign the centered offsets to slots', () => {
    const first = [...resolveFictionCastVariationOffsets(baseSettings)];
    const second = [...resolveFictionCastVariationOffsets({ ...baseSettings, seed: 'cast-variation:other' })];

    expect(second).not.toEqual(first);
    expect([...second].sort((left, right) => left - right)).toEqual([...first].sort((left, right) => left - right));
  });
});
