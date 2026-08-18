import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import { toFictionCastPrimaryNameArtifact } from './nameArtifact';
import type { FictionCastSettings } from './types';

const settings: FictionCastSettings = {
  castSize: 1,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'cast-artifact-boundary',
  nameFormat: 'given-family',
};

describe('Fiction Cast artifact projection', () => {
  it('projects primary singular evidence while retaining the Cast result id for navigation', () => {
    const [name] = generateEnsemble(settings, createDefaultRegistry()).names;
    if (!name) throw new Error('Expected a generated Cast identity.');

    const artifact = toFictionCastPrimaryNameArtifact(name);

    expect(artifact.id).toBe(name.id);
    expect(artifact.displayText).toBe(name.primaryName.name);
    expect(artifact.displayText).toBe(name.primaryName.spelling.text);
    expect(artifact.soundProfile).toBe(name.primaryName.soundProfile);
    expect(artifact.sound).toBe(name.primaryName.sound);
    expect(artifact.spelling).toBe(name.primaryName.spelling);
    expect('kind' in artifact).toBe(false);
    expect('identity' in artifact).toBe(false);
    expect('identityAudition' in artifact).toBe(false);
  });
});
