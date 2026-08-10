import { describe, expect, it } from 'vitest';
import {
  resolveFictionCastComponentGenerationPolicy,
  supportingComponentKindForFormat,
} from './componentGenerationPolicy';
import type { GenerationSettings } from '../engine/types';

const settings: GenerationSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'component-policy',
};

describe('Fiction Cast component generation policy', () => {
  it('maps compound formats to semantic supporting component kinds', () => {
    expect(supportingComponentKindForFormat('given-family')).toBe('family');
    expect(supportingComponentKindForFormat('initials-family')).toBe('family');
    expect(supportingComponentKindForFormat('epithet-place')).toBe('place');
    expect(supportingComponentKindForFormat('given-only')).toBeUndefined();
    expect(supportingComponentKindForFormat('title-name')).toBeUndefined();
  });

  it('preserves current generation settings while carrying product component semantics', () => {
    const given = resolveFictionCastComponentGenerationPolicy(settings, undefined, 'given');
    const family = resolveFictionCastComponentGenerationPolicy(settings, undefined, 'family');
    const place = resolveFictionCastComponentGenerationPolicy(settings, undefined, 'place');

    expect(given.kind).toBe('given');
    expect(family.kind).toBe('family');
    expect(place.kind).toBe('place');
    expect(given.settings).toEqual(settings);
    expect(family.settings).toEqual(settings);
    expect(place.settings).toEqual(settings);
  });
});
