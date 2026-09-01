import { describe, expect, it } from 'vitest';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import type { FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'component-context',
};

describe('Fiction Cast component generation context', () => {
  it('maps compound formats to semantic supporting component kinds', () => {
    expect(supportingComponentKindForFormat('given-family')).toBe('family');
    expect(supportingComponentKindForFormat('initials-family')).toBe('family');
    expect(supportingComponentKindForFormat('epithet-place')).toBe('place');
    expect(supportingComponentKindForFormat('given-only')).toBeUndefined();
    expect(supportingComponentKindForFormat('title-name')).toBeUndefined();
  });

  it('preserves current generation settings while carrying product component semantics', () => {
    const given = resolveFictionCastComponentGenerationContext(settings, undefined, 'given');
    const family = resolveFictionCastComponentGenerationContext(settings, undefined, 'family');
    const place = resolveFictionCastComponentGenerationContext(settings, undefined, 'place');

    expect(given.kind).toBe('given');
    expect(family.kind).toBe('family');
    expect(place.kind).toBe('place');
    expect(given.semanticIntent.baseline).toEqual({
      familiarity: 0.5,
      readability: 0.7,
      compactness: 0.6,
      styleAnchoring: 0.65,
      spellingDistinctiveness: 0.25,
    });
    expect(given.semanticIntent.generationSettings).toEqual(settings);
    expect(given.settings).toEqual(settings);
    expect(family.settings).toEqual(settings);
    expect(place.settings).toEqual(settings);
  });
});
