import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { fictionCastEpithetLexemes, fictionCastTitleLexemes } from '../fictionCast/identityLexicon';
import type { FictionCastRarityBand } from '../fictionCast/rarity';
import type { FictionCastSettings } from '../fictionCast/types';
import { generateName } from '../naming/generator';
import { createSeededRandom } from './random';
import { createDefaultRegistry } from './registry';
import type { GeneratedName } from './types';

const settings: FictionCastSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'deterministic-test-seed', nameFormat: 'given-only' };
const mmoRarityBands: FictionCastRarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function nameListFor(overrides: Partial<FictionCastSettings> = {}): string[] {
  return generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry()).names.map((name) => name.name);
}

function onlyNameFor(overrides: Partial<FictionCastSettings> = {}): GeneratedName {
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
    expect(second.names.map((name) => name.contextualScores.overallFit)).toEqual(first.names.map((name) => name.contextualScores.overallFit));
    expect(second.names.map((name) => name.soundProfile)).toEqual(first.names.map((name) => name.soundProfile));
    expect(second.names.map((name) => name.sound.transcription)).toEqual(first.names.map((name) => name.sound.transcription));
    expect(second.names.map((name) => name.spelling.text)).toEqual(first.names.map((name) => name.spelling.text));
  });

  it('changes generated names when the seed changes', () => {
    expect(nameListFor({ seed: 'deterministic-test-seed:b' })).not.toEqual(nameListFor());
  });

  it('clamps cast size to the supported output range', () => {
    expect(generateEnsemble({ ...settings, castSize: 0 }, createDefaultRegistry()).names).toHaveLength(1);
    expect(generateEnsemble({ ...settings, castSize: 50 }, createDefaultRegistry()).names).toHaveLength(24);
  });

  it('materializes sound-first candidates before selecting the app-facing name', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const generated = generateName({
      settings,
      pack,
      planningRandom: createSeededRandom('candidate:silhouette'),
      generationRandom: createSeededRandom('candidate:sound'),
      index: 0,
    });

    expect(generated.soundProfile.targets).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'contract')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'version')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(generated.soundProfile, 'source')).toBe(false);
    expect(generated.sound.contract).toBe('SoundCandidate');
    expect(generated.sound.sequence.contract).toBe('SegmentSequence');
    expect(generated.sound.transcription).toMatch(/^\/.+\/$/);
    expect(generated.spellingCandidates.length).toBeGreaterThan(0);
    expect('rarityBand' in generated.silhouette).toBe(false);
    expect('roleInfluence' in generated.silhouette).toBe(false);
    const [topSpelling] = generated.spellingCandidates;
    expect(topSpelling).toBeDefined();
    if (!topSpelling) throw new Error('Expected top ranked spelling.');
    expect(generated.spelling).toBe(topSpelling);
    expect(generated.spelling.rank).toBe(1);
    expect(generated.spelling.text.length).toBeGreaterThan(0);
  });

  it('returns intrinsic name scores plus Fiction Cast contextual fit signals', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(name.name.length).toBeGreaterThan(0);
      expect(name.soundProfile.targets).toBeDefined();
      expect(name.sound.contract).toBe('SoundCandidate');
      expect(name.sound.sequence.contract).toBe('SegmentSequence');
      expect(name.sound.transcription).toMatch(/^\/.+\/$/);
      expect(name.spelling.rank).toBe(1);
      expect(name.name).toBe(name.spelling.text);
      expect(name.spellingCandidates.length).toBeGreaterThan(0);
      const [selectedCandidate] = name.spellingCandidates;
      expect(selectedCandidate).toBeDefined();
      if (!selectedCandidate) throw new Error('Expected retained selected spelling candidate.');
      expect(selectedCandidate).toEqual(name.spelling);
      expect(name.spellingCandidates.map((candidate) => candidate.rank)).toEqual(name.spellingCandidates.map((candidate) => candidate.rank).sort((left, right) => left - right));
      expect(new Set(name.spellingCandidates.map((candidate) => candidate.text)).has(name.spelling.text)).toBe(true);
      expect(name.silhouette.syllableCount).toBeGreaterThan(0);
      expect(name.variants.length).toBeGreaterThan(0);
      expect(name.scores.overallFit).toBeGreaterThan(0);
      expect(name.scores.styleFit).toBeGreaterThan(0);
      expect(name.scores.silhouetteFit).toBeGreaterThan(0);
      expect('ensembleFit' in name.scores).toBe(false);
      expect('roleFit' in name.scores).toBe(false);
      expect(name.contextualScores.ensembleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.roleFit).toBeGreaterThanOrEqual(0);
      expect(name.contextualScores.overallFit).toBeGreaterThanOrEqual(0);
    }
  });

  it('tracks expanded ensemble diagnostics', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.diagnostics.repeatedInitials).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedEndings).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedCadences).toBeLessThan(settings.castSize);
    expect(ensemble.diagnostics.repeatedRarityBands).toBeLessThan(settings.castSize);
  });

  it('keeps role presets metadata-only when role influence is off', () => {
    const roleNeutral = generateEnsemble({ ...settings, rolePreset: 'none', roleInfluence: 'off' }, createDefaultRegistry());
    const roleLabeled = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'off' }, createDefaultRegistry());

    expect(roleLabeled.names.map((name) => name.name)).toEqual(roleNeutral.names.map((name) => name.name));
    expect(roleLabeled.names.map((name) => name.contextualScores.overallFit)).toEqual(roleNeutral.names.map((name) => name.contextualScores.overallFit));

    const [firstName] = roleLabeled.names;
    expect(firstName).toBeDefined();
    if (!firstName) throw new Error('Expected first role-labeled name.');
    expect(firstName.role?.role).toBe('protagonist');
    expect(firstName.roleInfluence).toBeUndefined();
    expect('roleInfluence' in firstName.silhouette).toBe(false);
    expect(firstName.contextualScores.roleFit).toBe(0.72);
  });

  it('applies deterministic role influence when enabled', () => {
    const offNames = nameListFor({ rolePreset: 'classic-ensemble', roleInfluence: 'off' });
    const lightFirst = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const lightSecond = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const strong = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'strong' }, createDefaultRegistry());

    expect(lightSecond.names.map((name) => name.name)).toEqual(lightFirst.names.map((name) => name.name));
    expect(lightFirst.names.map((name) => name.name)).not.toEqual(offNames);

    const [lightName] = lightFirst.names;
    const [strongName] = strong.names;
    expect(lightName).toBeDefined();
    expect(strongName).toBeDefined();
    if (!lightName || !strongName) throw new Error('Expected role-influenced names.');
    expect(lightName.role?.role).toBe('protagonist');
    expect(lightName.roleInfluence?.level).toBe('light');
    expect(lightName.roleInfluence?.profileId).toBe('role-profile:protagonist');
    expect(lightName.roleInfluence?.label).toBe('Protagonist clarity');
    expect('roleInfluence' in lightName.silhouette).toBe(false);
    expect(lightName.contextualScores.roleFit).toBeGreaterThan(0);
    expect(strongName.roleInfluence?.level).toBe('strong');
    expect(strongName.contextualScores.roleFit).toBeGreaterThan(0);
  });

  it('uses classic MMO rarity bands as Fiction Cast metadata', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      expect(mmoRarityBands).toContain(name.rarityBand);
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
    expect(givenPart.sourceNameId).toBe(name.id);
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
    expect(familyPart.sourceName).toBe(familyPart.value);
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

  it('formats titled identities from product-owned lexemes and generated name material', () => {
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
    expect(fictionCastTitleLexemes.map((lexeme) => lexeme.text)).toContain(titlePart.value);
    expect(first.name).toBe(`${titlePart.value} ${givenPart.value}`);
    expect(titlePart.sourceNameId).toBe(givenPart.sourceNameId);
  });

  it('formats deterministic place-style identities from generated support material and product-owned epithets', () => {
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
    expect(fictionCastEpithetLexemes.map((lexeme) => lexeme.text)).toContain(epithetPart.value);
    expect(placePart.value).toMatch(/^[A-Z][A-Za-z]+$/);
    expect(first.name).toBe(`${givenPart.value} ${epithetPart.value} of ${placePart.value}`);
    expect(givenPart.sourceNameId).not.toBe(placePart.sourceNameId);
    expect(placePart.sourceName).toBe(placePart.value);
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