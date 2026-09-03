import { describe, expect, it } from 'vitest';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import type { FictionCastSettings } from './types';
import { resolveFictionCastVariationDelta } from './variation';

const settings: FictionCastSettings = {
  castSize: 4,
  semanticBaseline: {
    familiarity: 'balanced',
    readability: 'clear',
    compactness: 'compact',
    styleAnchoring: 'balanced',
    spellingDistinctiveness: 'conventional',
  },
  stylePackId: 'british-literary-fantasy',
  seed: 'component-context',
  castVariation: 'wide',
};

describe('Fiction Cast component generation context', () => {
  it('maps compound formats to semantic supporting component kinds', () => {
    expect(supportingComponentKindForFormat('given-family')).toBe('family');
    expect(supportingComponentKindForFormat('initials-family')).toBe('family');
    expect(supportingComponentKindForFormat('epithet-place')).toBe('place');
    expect(supportingComponentKindForFormat('given-only')).toBeUndefined();
    expect(supportingComponentKindForFormat('title-name')).toBeUndefined();
  });

  it('shares one slot-level variation adjustment across generated identity components', () => {
    const slotIndex = 2;
    const expectedVariationDelta = resolveFictionCastVariationDelta(settings, slotIndex);
    const given = resolveFictionCastComponentGenerationContext(settings, undefined, 'given', slotIndex);
    const family = resolveFictionCastComponentGenerationContext(settings, undefined, 'family', slotIndex);
    const place = resolveFictionCastComponentGenerationContext(settings, undefined, 'place', slotIndex);

    expect(given.kind).toBe('given');
    expect(family.kind).toBe('family');
    expect(place.kind).toBe('place');
    expect(given.semanticIntent.baseline).toEqual(settings.semanticBaseline);
    expect(given.semanticIntent.variationDelta).toBe(expectedVariationDelta);
    expect(given.settings.novelty).toBeCloseTo(0.48 + expectedVariationDelta);
    expect(family.settings).toEqual(given.settings);
    expect(place.settings).toEqual(given.settings);
    expect(given.preferences).toEqual({});
    expect(family.preferences).toEqual({});
    expect(place.preferences).toEqual({});
  });
});
