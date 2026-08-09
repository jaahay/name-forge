import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random';
import { createNameSilhouette } from './silhouettes';
import { generateNameFromSilhouette } from './generator';
import { createDefaultRegistry } from './registry';
import type { GeneratedName, GenerationSettings } from './types';
import { isNameArtifact, toNameArtifact } from './nameArtifact';

const settings: GenerationSettings = {
  castSize: 4,
  novelty: 0.5,
  pronounceability: 0.7,
  memorability: 0.6,
  culturalAnchoring: 0.65,
  orthographicWeirdness: 0.25,
  stylePackId: 'british-literary-fantasy',
  seed: 'name-artifact',
};

function fixtureName(seed = 'name-artifact-fixture'): GeneratedName {
  const registry = createDefaultRegistry();
  const pack = registry.getStylePack(settings.stylePackId);
  const random = createSeededRandom(seed);
  const silhouette = createNameSilhouette(settings, pack, random, 0);
  return generateNameFromSilhouette(silhouette, pack, settings, random, 0);
}

describe('NameArtifact', () => {
  it('projects a generated name without changing generation evidence', () => {
    const generated = fixtureName();
    const artifact = toNameArtifact(generated);

    expect(artifact.id).toBe(generated.id);
    expect(artifact.displayText).toBe(generated.name);
    expect(artifact.soundProfile).toBe(generated.soundProfile);
    expect(artifact.sound).toBe(generated.sound);
    expect(artifact.spelling).toBe(generated.spelling);
    expect(artifact.spellingCandidates).toBe(generated.spellingCandidates);
    expect(artifact.silhouette).toBe(generated.silhouette);
    expect(artifact.variants).toBe(generated.variants);
    expect(artifact.readabilityDiagnostics).toBe(generated.readabilityDiagnostics);
  });

  it('uses materialized identity display text and retains identity generation provenance', () => {
    const generated = fixtureName('name-artifact-identity');
    const soundPart = {
      id: `${generated.id}:given`,
      role: 'given' as const,
      value: generated.name,
      sourceNameId: generated.id,
      sourceName: generated.name,
      generation: {
        soundProfile: generated.soundProfile,
        sound: generated.sound,
        spelling: generated.spelling,
      },
    };
    const withIdentity: GeneratedName = {
      ...generated,
      name: `Captain ${generated.name}`,
      identity: {
        displayName: `Captain ${generated.name}`,
        format: { id: 'format:title-name', kind: 'title-name', label: 'Title + name' },
        parts: [
          { id: `${generated.id}:title`, role: 'title', value: 'Captain', sourceNameId: generated.id, sourceName: generated.name },
          soundPart,
        ],
        phraseParts: [
          { kind: 'part', partId: `${generated.id}:title`, role: 'title' },
          { kind: 'part', partId: soundPart.id, role: 'given' },
        ],
      },
    };

    const artifact = toNameArtifact(withIdentity);
    const artifactSoundPart = artifact.identity?.parts.find((part) => part.role === 'given');

    expect(artifact.displayText).toBe(withIdentity.identity?.displayName);
    expect(artifact.identity).toBe(withIdentity.identity);
    expect(artifactSoundPart?.generation?.soundProfile).toBe(generated.soundProfile);
    expect(artifactSoundPart?.generation?.sound).toBe(generated.sound);
  });

  it('accepts generated artifacts as history-safe values', () => {
    expect(isNameArtifact(toNameArtifact(fixtureName('name-artifact-valid')))).toBe(true);
  });

  it('rejects values without an artifact identity', () => {
    expect(isNameArtifact(null)).toBe(false);
    expect(isNameArtifact({})).toBe(false);
    expect(isNameArtifact({ id: 'x' })).toBe(false);
    expect(isNameArtifact({ displayText: 'X' })).toBe(false);
  });
});
