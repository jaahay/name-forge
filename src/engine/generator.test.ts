import { describe, expect, it } from 'vitest';
import { generateEnsemble } from '../fictionCast/ensemble';
import { fictionCastEpithetLexemes, fictionCastTitleLexemes } from '../fictionCast/identityLexicon';
import type { FictionCastRarityBand } from '../fictionCast/rarity';
import type { FictionCastGeneratedName, FictionCastSettings } from '../fictionCast/types';
import { generateName } from '../naming/generator';
import { createDefaultRegistry } from './registry';

const settings: FictionCastSettings = { castSize: 6, novelty: 0.5, pronounceability: 0.7, memorability: 0.6, culturalAnchoring: 0.65, orthographicWeirdness: 0.25, stylePackId: 'british-literary-fantasy', seed: 'deterministic-test-seed', nameFormat: 'given-only' };
const mmoRarityBands: FictionCastRarityBand[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function nameListFor(overrides: Partial<FictionCastSettings> = {}): string[] {
  return generateEnsemble({ ...settings, ...overrides }, createDefaultRegistry()).names.map((name) => name.displayName);
}

function onlyNameFor(overrides: Partial<FictionCastSettings> = {}): FictionCastGeneratedName {
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
    expect(second.names.map((name) => name.displayName)).toEqual(first.names.map((name) => name.displayName));
    expect(second.names.map((name) => name.contextualScores.overallFit)).toEqual(first.names.map((name) => name.contextualScores.overallFit));
    expect(second.names.map((name) => name.primaryName.soundProfile)).toEqual(first.names.map((name) => name.primaryName.soundProfile));
    expect(second.names.map((name) => name.primaryName.sound.transcription)).toEqual(first.names.map((name) => name.primaryName.sound.transcription));
    expect(second.names.map((name) => name.primaryName.spelling.text)).toEqual(first.names.map((name) => name.primaryName.spelling.text));
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
      seed: 'candidate',
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
    expect('rarityBand' in generated.generationPlan).toBe(false);
    expect('roleInfluence' in generated.generationPlan).toBe(false);
    const [topSpelling] = generated.spellingCandidates;
    expect(topSpelling).toBeDefined();
    if (!topSpelling) throw new Error('Expected top ranked spelling.');
    expect(generated.spelling).toBe(topSpelling);
    expect(generated.spelling.rank).toBe(1);
    expect(generated.spelling.text.length).toBeGreaterThan(0);
  });

  it('replays exactly from the same explicit generateName arguments', () => {
    const registry = createDefaultRegistry();
    const pack = registry.getStylePack(settings.stylePackId);
    const options = {
      settings,
      pack,
      seed: 'primitive-replay',
      index: 2,
    } as const;

    expect(generateName(options)).toEqual(generateName(options));
  });

  it('returns intrinsic name scores plus Fiction Cast contextual fit signals', () => {
    const ensemble = generateEnsemble(settings, createDefaultRegistry());
    expect(ensemble.names).toHaveLength(settings.castSize);
    for (const name of ensemble.names) {
      const primaryName = name.primaryName;
      expect(name.displayName.length).toBeGreaterThan(0);
      expect(primaryName.soundProfile.targets).toBeDefined();
      expect(primaryName.sound.contract).toBe('SoundCandidate');
      expect(primaryName.sound.sequence.contract).toBe('SegmentSequence');
      expect(primaryName.sound.transcription).toMatch(/^\/.+\/$/);
      expect(primaryName.spelling.rank).toBe(1);
      expect(primaryName.name).toBe(primaryName.spelling.text);
      expect(primaryName.spellingCandidates.length).toBeGreaterThan(0);
      const [selectedCandidate] = primaryName.spellingCandidates;
      expect(selectedCandidate).toBeDefined();
      if (!selectedCandidate) throw new Error('Expected retained selected spelling candidate.');
      expect(selectedCandidate).toEqual(primaryName.spelling);
      expect(primaryName.spellingCandidates.map((candidate) => candidate.rank)).toEqual(primaryName.spellingCandidates.map((candidate) => candidate.rank).sort((left, right) => left - right));
      expect(new Set(primaryName.spellingCandidates.map((candidate) => candidate.text)).has(primaryName.spelling.text)).toBe(true);
      expect(primaryName.generationPlan.syllableCount).toBeGreaterThan(0);
      expect(primaryName.variants.length).toBeGreaterThan(0);
      expect(primaryName.scores.overallFit).toBeGreaterThan(0);
      expect(primaryName.scores.styleFit).toBeGreaterThan(0);
      expect(primaryName.scores.silhouetteFit).toBeGreaterThan(0);
      expect('ensembleFit' in primaryName.scores).toBe(false);
      expect('roleFit' in primaryName.scores).toBe(false);
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

    expect(roleLabeled.names.map((name) => name.displayName)).toEqual(roleNeutral.names.map((name) => name.displayName));
    expect(roleLabeled.names.map((name) => name.contextualScores.overallFit)).toEqual(roleNeutral.names.map((name) => name.contextualScores.overallFit));

    const [firstName] = roleLabeled.names;
    expect(firstName).toBeDefined();
    if (!firstName) throw new Error('Expected first role-labeled name.');
    expect(firstName.role?.role).toBe('protagonist');
    expect(firstName.roleInfluence).toBeUndefined();
    expect('roleInfluence' in firstName.primaryName.generationPlan).toBe(false);
    expect(firstName.contextualScores.roleFit).toBe(0.72);
  });

  it('applies deterministic role influence when enabled', () => {
    const offNames = nameListFor({ rolePreset: 'classic-ensemble', roleInfluence: 'off' });
    const lightFirst = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const lightSecond = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'light' }, createDefaultRegistry());
    const strong = generateEnsemble({ ...settings, rolePreset: 'classic-ensemble', roleInfluence: 'strong' }, createDefaultRegistry());

    expect(lightSecond.names.map((name) => name.displayName)).toEqual(lightFirst.names.map((name) => name.displayName));
    expect(lightFirst.names.map((name) => name.displayName)).not.toEqual(offNames);

    const [lightName] = lightFirst.names;
    const [strongName] = strong.names;
    expect(lightName).toBeDefined();
    expect(strongName).toBeDefined();
    if (!lightName || !strongName) throw new Error('Expected role-influenced names.');
    expect(lightName.role?.role).toBe('protagonist');
    expect(lightName.roleInfluence?.level).toBe('light');
    expect(lightName.roleInfluence?.profileId).toBe('role-profile:protagonist');
    expect(lightName.roleInfluence?.label).toBe('Protagonist clarity');
    expect('roleInfluence' in lightName.primaryName.generationPlan).toBe(false);
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
    expect(identity.format.kind).toBe('given-only');
    expect(identity.parts).toHaveLength(1);
    const [givenPart] = identity.parts;
    expect(givenPart).toBeDefined();
    if (!givenPart) throw new Error('Expected given name part.');
    expect(givenPart.role).toBe('given');
    expect(name.displayName).toBe(givenPart.value);
    expect(name.primaryName.name).toBe(givenPart.value);
    expect(identity.displayName).toBe(givenPart.value);
    expect(givenPart.sourceNameId).toBe(name.primaryName.id);
  });

  it('formats generated given and family parts through an identity frame', () => {
    const name = onlyNameFor({ nameFormat: 'given-family' });
    const identity = name.identity;
    expect(identity.format.kind).toBe('given-family');
    expect(identity.parts).toHaveLength(2);
    const [givenPart, familyPart] = identity.parts;
    expect(givenPart).toBeDefined();
    expect(familyPart).toBeDefined();
    if (!givenPart || !familyPart) throw new Error('Expected given and family name parts.');
    expect(givenPart.role).toBe('given');
    expect(familyPart.role).toBe('family');
    expect(name.displayName).toBe(`${givenPart.value} ${familyPart.value}`);
    expect(name.primaryName.name).toBe(givenPart.value);
    expect(givenPart.sourceNameId).not.toBe(familyPart.sourceNameId);
    expect(familyPart.sourceName).toBe(familyPart.value);
  });

  it('formats deterministic initialed bylines from generated parts', () => {
    const first = onlyNameFor({ nameFormat: 'initials-family' });
    const second = onlyNameFor({ nameFormat: 'initials-family' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
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
    expect(first.displayName).toBe(`${initialPart.value} ${familyPart.value}`);
    expect(initialPart.sourceNameId).not.toBe(familyPart.sourceNameId);
  });

  it('formats titled identities from product-owned lexemes and generated name material', () => {
    const first = onlyNameFor({ nameFormat: 'title-name' });
    const second = onlyNameFor({ nameFormat: 'title-name' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
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
    expect(first.displayName).toBe(`${titlePart.value} ${givenPart.value}`);
    expect(titlePart.sourceNameId).toBe(givenPart.sourceNameId);
  });

  it('formats deterministic place-style identities from generated support material and product-owned epithets', () => {
    const first = onlyNameFor({ nameFormat: 'epithet-place' });
    const second = onlyNameFor({ nameFormat: 'epithet-place' });
    const identity = first.identity;
    const repeatedIdentity = second.identity;
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
    expect(first.displayName).toBe(`${givenPart.value} ${epithetPart.value} of ${placePart.value}`);
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
    expect(firstName.identity.format.kind).toBe('given-only');
    expect(secondName.identity.format.kind).toBe('given-family');
    expect(thirdName.identity.format.kind).toBe('initials-family');
    expect(fourthName.identity.format.kind).toBe('title-name');
    expect(fifthName.identity.format.kind).toBe('epithet-place');
  });
});