import { describe, expect, it } from 'vitest';
import { generateEnsemble } from './ensemble';
import { createDefaultRegistry } from './registry';
import type { GeneratedName, GenerationSettings, RarityBand } from './types';

const settings: GenerationSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'deterministic-test-seed', nameFormat: 'given-only' };
const mmoRarityBands: RarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function nameListFor(overrides: Partial<GenerationSettings> = {}): string[] {
  return generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry()).names.map((name) => name.name);
}

function onlyNameFor(overrides: Partial<GenerationSettings> = {}): GeneratedName {
  const ensemble = generateEnsemble({ ...settings, castSize: 1, ...overrides }, createDefaultRegistry());
  expect(ensemble.names).toHaveLength(1);
  const [name] = ensemble.names;
  expect(name).toBeDefined();
  if (!name) throw new Error('Expected generated name.');
  return name;
}

describe('generateEnsemble', () => {
  it('is deterministic for the same seed and settings', () => {
    const registry = createDefaultRegistry();
    const first = generateEnsemble(settings, registry);
    const second = generateEnsemble(settings, registry);
    expect(second.names.map((name) => name.name)).toEqual(first.names.map((name) => name.name));
    expect(second.names.map((name) => name.scores.overallFit)).toEqual(first.names.map((name) => name.scores.overallFit));
  });

  it('changes generated names when the seed changes', () => {
    expect(nameListFor({ seed: 'deterministic-test-seed:b' })).not.toEqual(nameListFor());
  });

  it('clamps cast size to the supported output range', () => {
    expect(generateEnsemble({ ...settings, castSize: 0 }, createDefaultRegistry()).names).toHaveLength(1);
    expect(generateEnsemble({ ...settings, castSize: 50 }, createDefaultRegistry()).names).toHaveLength(24);
  });

  it('returns provenance-bearing names, variants, and fit scores', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(name.provenance.length).toBeGreaterThan(0);
      expect(name.silhouette.provenance.length).toBeGreaterThan(0);
      expect(name.scores.overallFit).toBeGreaterThan(0);
      expect(name.scores.styleFit).toBeGreaterThan(0);
      expect(name.scores.silhouetteFit).toBeGreaterThan(0);
      expect(name.scores.ensembleFit).toBeGreaterThanOrEqual(0);
    }
  });

  it('tracks expanded ensemble diagnostics', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.diagnostics.repeatedInitials).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedEndings).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedCadences).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedRarityBands).toBeLessThan(settings.castSize);
  });

  it('uses classic MMO rarity bands', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(mmoRarityBands).toContain(name.silhouette.rarityBand);
    }
  });

  it('keeps given-only identities equivalent to the generated single-name primitive', () => {
    const name = onlyNameFor({ nameFormat: 'given-only' });
    const identity = name.identity;
    expect(identity).toBeDefined();
    if (!identity) throw new Error('Expected generated name identity.');
    expect(identity.format.kind).toBe('given-only');
    expect(identity.parts).toHaveLength(1);
    const [givenPart] = identity.parts;
    expect(givenPart).toBeDefined();
    if (!givenPart) throw new Error('Expected given name part.');
    expect(givenPart.role).toBe('given');
    expect(name.name).toBe(givenPart.value);
    expect(identity.displayName).toBe(givenPart.value);
    expect(givenPart.provenance.length).toBeGreaterThan(0);
    expect(identity.provenance.length).toBeGreaterThan(givenPart.provenance.length);
  });

  it('formats generated given and family parts through an identity frame', () => {
    const name = onlyNameFor({ nameFormat: 'given-family' });
    const identity = name.identity;
    expect(identity).toBeDefined();
    if (!identity) throw new Error('Expected generated name identity.');
    expect(identity.format.kind).toBe('given-family');
    expect(identity.parts).toHaveLength(2);
    const [givenPart, familyPart] = identity.parts;
    expect(givenPart).toBeDefined();
    expect(familyPart).toBeDefined();
    if (!givenPart || !familyPart) throw new Error('Expected given and family name parts.');
    expect(givenPart.role).toBe('given');
    expect(familyPart.role).toBe('family');
    expect(name.name).toBe(`${givenPart.value} ${familyPart.value}`);
    expect(givenPart.sourceNameId).not.toBe(familyPart.sourceNameId);
    expect(familyPart.provenance.length).toBeGreaterThan(0);
  });

  it('formats deterministic initialed bylines from generated parts', () => {
    const first = onlyNameFor({ nameFormat: 'initials-family' });
    const second = onlyNameFor({ nameFormat: 'initials-family' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
    expect(identity).toBeDefined();
    expect(repeatedIdentity).toBeDefined();
    if (!identity || !repeatedIdentity) throw new Error('Expected generated name identities.');
    expect(identity.displayName).toBe(repeatedIdentity.displayName);
    expect(identity.format.kind).toBe('initials-family');
    expect(identity.parts).toHaveLength(2);
    const [initialPart, familyPart] = identity.parts;
    expect(initialPart).toBeDefined();
    expect(familyPart).toBeDefined();
    if (!initialPart || !familyPart) throw new Error('Expected initial and family name parts.');
    expect(initialPart.role).toBe('initial');
    expect(familyPart.role).toBe('family');
    expect(initialPart.value).toMatch(/^[A-Z]\.$/);
    expect(first.name).toBe(`${initialPart.value} ${familyPart.value}`);
    expect(initialPart.sourceNameId).not.toBe(familyPart.sourceNameId);
  });

  it('formats titled identities from generated name material', () => {
    const first = onlyNameFor({ nameFormat: 'title-name' });
    const second = onlyNameFor({ nameFormat: 'title-name' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
    expect(identity).toBeDefined();
    expect(repeatedIdentity).toBeDefined();
    if (!identity || !repeatedIdentity) throw new Error('Expected generated name identities.');
    expect(identity.displayName).toBe(repeatedIdentity.displayName);
    expect(identity.format.kind).toBe('title-name');
    expect(identity.parts).toHaveLength(2);
    const [titlePart, givenPart] = identity.parts;
    expect(titlePart).toBeDefined();
    expect(givenPart).toBeDefined();
    if (!titlePart || !givenPart) throw new Error('Expected title and given name parts.');
    expect(titlePart.role).toBe('title');
    expect(givenPart.role).toBe('given');
    expect(titlePart.value).toMatch(/^[A-Z][A-Za-z]+$/);
    expect(first.name).toBe(`${titlePart.value} ${givenPart.value}`);
    expect(titlePart.provenance.length).toBeGreaterThan(0);
    expect(givenPart.provenance.length).toBeGreaterThan(0);
  });

  it('formats deterministic place-style identities from generated support material', () => {
    const first = onlyNameFor({ nameFormat: 'epithet-place' });
    const second = onlyNameFor({ nameFormat: 'epithet-place' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
    expect(identity).toBeDefined();
    expect(repeatedIdentity).toBeDefined();
    if (!identity || !repeatedIdentity) throw new Error('Expected generated name identities.');
    expect(identity.displayName).toBe(repeatedIdentity.displayName);
    expect(identity.format.kind).toBe('epithet-place');
    expect(identity.parts).toHaveLength(3);
    const [givenPart, epithetPart, placePart] = identity.parts;
    expect(givenPart).toBeDefined();
    expect(epithetPart).toBeDefined();
    expect(placePart).toBeDefined();
    if (!givenPart || !epithetPart || !placePart) throw new Error('Expected given, epithet, and place name parts.');
    expect(givenPart.role).toBe('given');
    expect(epithetPart.role).toBe('epithet');
    expect(placePart.role).toBe('place');
    expect(epithetPart.value).toMatch(/^the [A-Z]/);
    expect(placePart.value).toMatch(/^[A-Z][A-Za-z]+$/);
    expect(first.name).toBe(`${givenPart.value} ${epithetPart.value} of ${placePart.value}`);
    expect(givenPart.sourceNameId).not.toBe(placePart.sourceNameId);
    expect(placePart.provenance.length).toBeGreaterThan(0);
  });

  it('deterministically cycles supported formats in mixed mode', () => {
    const ensemble = generateEnsemble({ ...settings, castSize: 5, nameFormat: 'mixed' }, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(5);
    const [firstName, secondName, thirdName, fourthName, fifthName] = ensemble.names;
    expect(firstName).toBeDefined();
    expect(secondName).toBeDefined();
    expect(thirdName).toBeDefined();
    expect(fourthName).toBeDefined();
    expect(fifthName).toBeDefined();
    if (!firstName || !secondName || !thirdName || !fourthName || !fifthName) throw new Error('Expected five generated names.');
    expect(firstName.identity).toBeDefined();
    expect(secondName.identity).toBeDefined();
    expect(thirdName.identity).toBeDefined();
    expect(fourthName.identity).toBeDefined();
    expect(fifthName.identity).toBeDefined();
    if (!firstName.identity || !secondName.identity || !thirdName.identity || !fourthName.identity || !fifthName.identity) throw new Error('Expected generated name identities.');
    expect(firstName.identity.format.kind).toBe('given-only');
    expect(secondName.identity.format.kind).toBe('given-family');
    expect(thirdName.identity.format.kind).toBe('initials-family');
    expect(fourthName.identity.format.kind).toBe('title-name');
    expect(fifthName.identity.format.kind).toBe('epithet-place');
  });
});
