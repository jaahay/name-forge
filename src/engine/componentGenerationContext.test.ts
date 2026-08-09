import { describe, expect, it } from 'vitest';
import {
  resolveNameComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import type { GenerationSettings } from './types';

const settings: GenerationSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'component-context',
};

describe('name component generation context', () => {
  it('maps compound formats to semantic supporting component kinds', () => {
    expect(supportingComponentKindForFormat('given-family')).toBe('family');
    expect(supportingComponentKindForFormat('initials-family')).toBe('family');
    expect(supportingComponentKindForFormat('epithet-place')).toBe('place');
    expect(supportingComponentKindForFormat('given-only')).toBeUndefined();
    expect(supportingComponentKindForFormat('title-name')).toBeUndefined();
  });

  it('preserves current generation settings while carrying component identity', () => {
    const given = resolveNameComponentGenerationContext(settings, undefined, 'given');
    const family = resolveNameComponentGenerationContext(settings, undefined, 'family');
    const place = resolveNameComponentGenerationContext(settings, undefined, 'place');

    expect(given.kind).toBe('given');
    expect(family.kind).toBe('family');
    expect(place.kind).toBe('place');
    expect(given.settings).toEqual(settings);
    expect(family.settings).toEqual(settings);
    expect(place.settings).toEqual(settings);
  });
});
