import { describe, expect, it } from 'vitest';
import {
  resolveFictionCastComponentGenerationContext,
  supportingComponentKindForFormat,
} from './componentGenerationContext';
import type { FictionCastSettings } from './types';

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
};

const expectedGenerationSettings = {
  novelty: 0.48,
  pronounceability: 0.72,
  memorability: 0.65,
  culturalAnchoring: 0.62,
  orthographicWeirdness: 0.28,
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
    expect(given.semanticIntent.baseline).toEqual(settings.semanticBaseline);
    expect(given.semanticIntent.generationSettings).toEqual(expectedGenerationSettings);
    expect(given.settings).toEqual(expectedGenerationSettings);
    expect(family.settings).toEqual(expectedGenerationSettings);
    expect(place.settings).toEqual(expectedGenerationSettings);
  });
});
