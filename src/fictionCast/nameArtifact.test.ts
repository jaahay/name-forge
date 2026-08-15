import { describe, expect, it } from 'vitest';
import { createDefaultRegistry } from '../engine/registry';
import { generateEnsemble } from './ensemble';
import { toFictionCastNameArtifact, toFictionCastPrimaryNameArtifact } from './nameArtifact';
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

describe('Fiction Cast artifact projections', () => {
  it('persists the composed identity without aggregate primitive sound evidence', () => {
    const [name] = generateEnsemble(settings, createDefaultRegistry()).names;
    if (!name) throw new Error('Expected a generated Cast identity.');

    const artifact = toFictionCastNameArtifact(name);

    expect(artifact.kind).toBe('composed-identity');
    expect(artifact.id).toBe(name.id);
    expect(artifact.displayText).toBe(name.displayName);
    expect(artifact.identity).toBe(name.identity);
    expect(artifact.identityAudition).toBe(name.identityAudition);
    for (const primitiveField of ['soundProfile', 'sound', 'spelling', 'spellingCandidates', 'silhouette', 'variants']) {
      expect(primitiveField in artifact).toBe(false);
    }
  });

  it('projects the primary singular name explicitly for sound relationship analysis', () => {
    const [name] = generateEnsemble(settings, createDefaultRegistry()).names;
    if (!name) throw new Error('Expected a generated Cast identity.');

    const artifact = toFictionCastPrimaryNameArtifact(name);

    expect(artifact.kind).toBe('generated-name');
    expect(artifact.id).toBe(name.id);
    expect(artifact.displayText).toBe(name.primaryName.name);
    expect(artifact.displayText).toBe(name.primaryName.spelling.text);
    expect(artifact.soundProfile).toBe(name.primaryName.soundProfile);
    expect(artifact.sound).toBe(name.primaryName.sound);
    expect(artifact.spelling).toBe(name.primaryName.spelling);
    expect('identity' in artifact).toBe(false);
  });
});
